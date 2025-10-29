import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import exifr from 'exifr';

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 12 * 1024 * 1024 } });
const DB_PATH = path.join(process.cwd(), 'server', 'image-hash-db.json');
const VERIFY_GPS_THRESHOLD_M = parseFloat(process.env.VERIFY_GPS_THRESHOLD_M || '500');
const ELA_THRESHOLD = parseFloat(process.env.VERIFY_ELA_THRESHOLD || '35');
const HAMMING_THRESHOLD = parseInt(process.env.VERIFY_HAMMING_THRESHOLD || '5', 10);
const MAX_FILE_SIZE = parseInt(process.env.VERIFY_MAX_FILE_SIZE || (12 * 1024 * 1024).toString(), 10);

const readDB = () => {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    return [];
  }
};
const writeDB = (arr) => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(arr.slice(-1000), null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to write DB', e);
  }
};

// Simple average hash using sharp-resized greyscale
const averageHash = async (buffer) => {
  const small = await sharp(buffer).resize(8, 8, { fit: 'fill' }).grayscale().raw().toBuffer();
  let total = 0;
  const lum = [];
  for (let i = 0; i < small.length; i++) {
    lum.push(small[i]);
    total += small[i];
  }
  const avg = total / lum.length;
  return lum.map(v => (v > avg ? '1' : '0')).join('');
};

const hammingDistance = (a, b) => {
  if (!a || !b || a.length !== b.length) return Infinity;
  let d = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++;
  return d;
};

const computeELA = async (buffer) => {
  try {
    const img = sharp(buffer);
    const metadata = await img.metadata();
    const low = await img.jpeg({ quality: 85 }).toBuffer();
    const lowImg = sharp(low);
    const orig = await img.raw().toBuffer();
    const lowRaw = await lowImg.raw().toBuffer();
    if (!orig || !lowRaw || orig.length !== lowRaw.length) return null;
    let totalDiff = 0;
    for (let i = 0; i < orig.length; i += 3) {
      const r = Math.abs(orig[i] - lowRaw[i]);
      const g = Math.abs(orig[i+1] - lowRaw[i+1]);
      const b = Math.abs(orig[i+2] - lowRaw[i+2]);
      totalDiff += (r+g+b)/3;
    }
    const avgDiff = totalDiff / (orig.length/3);
    return { avgDiff };
  } catch (e) {
    console.warn('ELA failed', e);
    return null;
  }
};

const haversine = (lat1, lon1, lat2, lon2) => {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371000; // meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const geocodeReportedLocation = async (text) => {
  // If text contains Lat: x, Lon: y pattern return parsed coords
  try {
    const latMatch = text.match(/Lat[:\s]*([0-9.+-]+)/i);
    const lonMatch = text.match(/Lon[:\s]*([0-9.+-]+)/i);
    if (latMatch && lonMatch) {
      const lat = parseFloat(latMatch[1]);
      const lon = parseFloat(lonMatch[1]);
      if (isFinite(lat) && isFinite(lon)) return { lat, lon };
    }
  } catch (e) { /* ignore */ }

  // Otherwise use Nominatim to geocode a textual address
  try {
    const q = encodeURIComponent(text);
    const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&addressdetails=0`;
    const res = await fetch(url, { headers: { 'User-Agent': 'CivicIndia/1.0 (contact@example.org)' } });
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      const item = data[0];
      return { lat: parseFloat(item.lat), lon: parseFloat(item.lon) };
    }
  } catch (e) {
    console.warn('Geocode failed', e);
  }
  return null;
};

app.post('/verify', upload.array('photos', 6), async (req, res) => {
  try {
    const files = req.files || [];
    if (!files.length) return res.status(400).json({ error: 'No files' });

    // Read existing DB hashes
    const db = readDB();

    const reportedLocationText = (req.body && req.body.reportedLocation) ? String(req.body.reportedLocation) : '';
    const reportedCoords = reportedLocationText ? await geocodeReportedLocation(reportedLocationText) : null;

    const results = [];
    for (const f of files) {
      const buf = f.buffer;
      const fileChecks = [];
      let ok = true;
      let reason = '';
      let info = {};

      // basic size check (multer already enforces, but double-check)
      fileChecks.push({ name: 'size', ok: buf.length <= MAX_FILE_SIZE, info: { size: buf.length, max: MAX_FILE_SIZE } });
      if (buf.length > MAX_FILE_SIZE) { ok = false; reason = 'too-large'; }

      // ensure buffer decodes as an image and get metadata
      let metadata = null;
      try {
        const img = sharp(buf);
        metadata = await img.metadata();
        fileChecks.push({ name: 'format', ok: !!metadata.format, info: { format: metadata.format } });
        if (!metadata.format) { ok = false; reason = 'bad-format'; }
      } catch (e) {
        fileChecks.push({ name: 'format', ok: false, info: { error: String(e) } });
        ok = false; reason = 'bad-format';
      }

      // perceptual hash + duplicate check
      let hash = null;
      try {
        hash = await averageHash(buf);
        let duplicate = false;
        for (const h of db) {
          if (hammingDistance(h, hash) <= HAMMING_THRESHOLD) { duplicate = true; break; }
        }
        fileChecks.push({ name: 'duplicate', ok: !duplicate, info: { duplicate } });
        if (duplicate) { ok = false; reason = 'duplicate'; }
      } catch (e) {
        fileChecks.push({ name: 'duplicate', ok: false, info: { error: String(e) } });
        // don't immediately reject on hash failure, mark as warning
      }

      // ELA check
      let ela = null;
      try {
        ela = await computeELA(buf);
        const elaOk = !(ela && ela.avgDiff && ela.avgDiff > ELA_THRESHOLD);
        fileChecks.push({ name: 'ela', ok: elaOk, info: { ela } });
        if (!elaOk) { ok = false; reason = 'manipulation'; info.ela = ela; }
      } catch (e) {
        fileChecks.push({ name: 'ela', ok: false, info: { error: String(e) } });
      }

      // EXIF GPS checks (if present) against reportedLocation
      try {
        const exif = await exifr.parse(buf, { gps: true });
        const gps = (exif && exif.latitude && exif.longitude) ? { lat: exif.latitude, lon: exif.longitude } : null;
        fileChecks.push({ name: 'exif', ok: !!gps, info: { gps } });
        if (gps && reportedCoords) {
          const dist = haversine(gps.lat, gps.lon, reportedCoords.lat, reportedCoords.lon);
          const gpsOk = dist <= VERIFY_GPS_THRESHOLD_M;
          fileChecks.push({ name: 'gps-distance', ok: gpsOk, info: { distanceMeters: dist, threshold: VERIFY_GPS_THRESHOLD_M } });
          if (!gpsOk) { ok = false; reason = 'gps-mismatch'; info.distanceMeters = dist; }
        } else if (!gps && reportedCoords) {
          // Image lacks GPS data but user provided a location — mark as warning (not fatal) but include check
          fileChecks.push({ name: 'gps-distance', ok: false, info: { note: 'no-gps-in-image' } });
        }
      } catch (e) {
        fileChecks.push({ name: 'exif', ok: false, info: { error: String(e) } });
      }

      // Finalize result
      const result = { ok, reason: ok ? 'ok' : reason || 'failed', checks: fileChecks, info };
      if (hash) result.hash = hash;
      if (ela) result.ela = ela;

      // If passed, persist hash to DB for future duplicate checks
      if (ok && hash) db.push(hash);

      results.push(result);
    }

    writeDB(db);
    return res.json({ results });
  } catch (e) {
    console.error('verify error', e);
    return res.status(500).json({ error: 'internal' });
  }
});

const port = process.env.PORT || 5123;
app.listen(port, () => console.log('Image verify server listening on', port));
