const express = require('express');
const multer = require('multer');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });
const DB_PATH = path.join(process.cwd(), 'server', 'cv-db.json');

const readDB = () => {
  try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8') || '[]'); } catch (e) { return []; }
};
const writeDB = (arr) => {
  try { fs.writeFileSync(DB_PATH, JSON.stringify(arr.slice(-2000), null, 2), 'utf8'); } catch (e) { console.error('cv-db write failed', e); }
};

// Mock object detector — replace with real model call (TensorFlow, ONNX, or provider API)
const detectObjects = async (buffer) => {
  // Very small heuristic: size-based fake detections
  const size = buffer.length || 0;
  const detections = [];
  if (size > 200000) {
    detections.push({ label: 'pothole', confidence: 0.82 });
    detections.push({ label: 'debris', confidence: 0.45 });
  } else if (size > 40000) {
    detections.push({ label: 'graffiti', confidence: 0.7 });
  } else {
    detections.push({ label: 'street-light', confidence: 0.4 });
  }

  // Severity heuristic: confidence-weighted and size
  const severity = Math.min(1, detections.reduce((s, d) => s + d.confidence, 0) / 2 + (size > 200000 ? 0.1 : 0));
  return { detections, severity };
};

// Try to extract EXIF GPS using optional exifr
const tryExif = async (buffer) => {
  try {
    const mod = await import('exifr');
    const exif = await (mod && mod.parse ? mod.parse(buffer, { gps: true }) : null);
    if (!exif) return null;
    return { lat: exif.latitude, lon: exif.longitude, date: exif.DateTimeOriginal || exif.CreateDate };
  } catch (e) {
    return null;
  }
};

const app = express();
app.use(express.json({ limit: '200kb' }));

// Analyze uploaded images (multipart) or accept JSON with imageUrls
app.post('/analyze', upload.array('photos', 6), async (req, res) => {
  try {
    const results = [];
    const files = req.files || [];

    // If JSON imageUrls provided, fetch them
    if ((!files || files.length === 0) && req.body && Array.isArray(req.body.imageUrls)) {
      for (const u of req.body.imageUrls) {
        try {
          const f = await fetch(u);
          const buf = Buffer.from(await f.arrayBuffer());
          files.push({ buffer: buf, originalname: path.basename(u) });
        } catch (e) {
          // skip
        }
      }
    }

    for (const f of files) {
      const buf = f.buffer;
      const obj = await detectObjects(buf);
      const exif = await tryExif(buf).catch(() => null);
      const item = {
        name: f.originalname || 'upload',
        detections: obj.detections,
        severity: obj.severity,
        exif,
      };
      results.push(item);
    }

    // persist a short history for batch processing later
    const db = readDB();
    db.push({ id: Date.now(), timestamp: new Date().toISOString(), results });
    writeDB(db);

    return res.json({ ok: true, results });
  } catch (e) {
    console.error('cv analyze error', e);
    return res.status(500).json({ ok: false, error: 'internal' });
  }
});

// Batch endpoint: process historical images (placeholder)
app.post('/batch-process', async (req, res) => {
  // In production, this would dequeue stored images and run the detector at scale.
  return res.json({ ok: true, message: 'Batch processing is a placeholder in this scaffold.' });
});

const port = process.env.CV_SERVICE_PORT || 5130;
if (require.main === module) {
  app.listen(port, () => console.log(`CV service listening on http://localhost:${port}`));
}

module.exports = { app, detectObjects, tryExif };

// Simple face-compare endpoint: accepts two files and returns a similarity score [0..1]
app.post('/compare-faces', upload.fields([{ name: 'idImage', maxCount: 1 }, { name: 'liveImage', maxCount: 1 }]), async (req, res) => {
  try {
    const sharp = require('sharp');
    const files = req.files || {};
    const idFile = files.idImage && files.idImage[0] ? files.idImage[0].buffer : null;
    const liveFile = files.liveImage && files.liveImage[0] ? files.liveImage[0].buffer : null;
    if (!idFile || !liveFile) return res.status(400).json({ ok: false, error: 'missing files' });

    // Resize to greyscale 64x64 and get raw pixels
    const imgToRaw = async (buf) => {
      const img = sharp(buf).resize(64, 64).greyscale().raw();
      const { data, info } = await img.toBuffer({ resolveWithObject: true });
      return { data, info };
    };

    const a = await imgToRaw(idFile);
    const b = await imgToRaw(liveFile);

    // Compute mean absolute difference normalized to [0..1]
    let s = 0;
    for (let i = 0; i < Math.min(a.data.length, b.data.length); i++) {
      s += Math.abs(a.data[i] - b.data[i]);
    }
    const maxDiff = 255 * Math.min(a.data.length, b.data.length);
    const norm = 1 - (s / maxDiff); // similarity: 1 means identical
    const score = Math.max(0, Math.min(1, norm));

    // persist a small record
    const db = readDB();
    db.push({ id: Date.now(), ts: new Date().toISOString(), score });
    writeDB(db);

    return res.json({ ok: true, score });
  } catch (e) {
    console.error('compare-faces error', e);
    return res.status(500).json({ ok: false, error: 'internal' });
  }
});
