const express = require('express');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(process.cwd(), 'server', 'users.json');

const readDB = () => {
  try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8') || '[]'); } catch (e) { return []; }
};
const writeDB = (arr) => {
  try { fs.writeFileSync(DB_PATH, JSON.stringify(arr.slice(-10000), null, 2), 'utf8'); } catch (e) { console.error('users-db write failed', e); }
};

const computeTrustScore = (user) => {
  // Simple trust: base + verified levels + historical accuracy
  let score = 10; // base
  if (user.phoneVerified) score += 10;
  if (user.aadhaarVerified) score += 20;
  if (user.inPersonVerified) score += 40;
  // accuracy: percentage of accepted reports
  const reports = user.reports || [];
  const accepted = reports.filter(r => r.status === 'resolved' || r.verified === true).length;
  const accuracy = reports.length ? (accepted / reports.length) : 0.5;
  score += Math.round(accuracy * 20);
  return Math.min(100, score);
};

const assignBadges = (user) => {
  const score = computeTrustScore(user);
  const badges = [];
  if (user.reports && user.reports.length >= 50 && score >= 60) badges.push('Veteran Reporter');
  if (score > 80) badges.push('Trusted Reporter');
  if (user.inPersonVerified) badges.push('Verified In-Person');
  return badges;
};

const app = express();
app.use(express.json({ limit: '100kb' }));

// Multer for file uploads (ID image + live capture)
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const sharp = require('sharp');

// Register or update user
app.post('/user', (req, res) => {
  const { id, name, phone } = req.body || {};
  if (!id) return res.status(400).json({ error: 'missing id' });
  const db = readDB();
  let user = db.find(u => u.id === id);
  if (!user) {
    user = { id, name: name || '', phone: phone || '', createdAt: new Date().toISOString(), reports: [] };
    db.push(user);
  } else {
    user.name = name || user.name;
    user.phone = phone || user.phone;
  }
  writeDB(db);
  return res.json({ ok: true, user });
});

// Verification endpoints (mocked)
app.post('/verify/phone', (req, res) => {
  const { id } = req.body || {};
  const db = readDB();
  const user = db.find(u => u.id === id);
  if (!user) return res.status(404).json({ error: 'not found' });
  user.phoneVerified = true;
  writeDB(db);
  return res.json({ ok: true });
});

app.post('/verify/aadhaar', (req, res) => {
  const { id } = req.body || {};
  const db = readDB();
  const user = db.find(u => u.id === id);
  if (!user) return res.status(404).json({ error: 'not found' });
  user.aadhaarVerified = true;
  writeDB(db);
  return res.json({ ok: true });
});

app.post('/verify/inperson', (req, res) => {
  const { id } = req.body || {};
  const db = readDB();
  const user = db.find(u => u.id === id);
  if (!user) return res.status(404).json({ error: 'not found' });
  user.inPersonVerified = true;
  writeDB(db);
  return res.json({ ok: true });
});

// Department member verification: accepts multipart: idImage, liveImage, deptId, userId
app.post('/verify-id', upload.fields([{ name: 'idImage', maxCount: 1 }, { name: 'liveImage', maxCount: 1 }]), async (req, res) => {
  try {
    const { deptId, userId } = req.body || {};
    const files = req.files || {};
    const idBuf = files.idImage && files.idImage[0] ? files.idImage[0].buffer : null;
    const liveBuf = files.liveImage && files.liveImage[0] ? files.liveImage[0].buffer : null;
    if (!userId || !deptId || !idBuf || !liveBuf) return res.status(400).json({ ok: false, error: 'missing parameters' });

    // Simple local compare reusing sharp: resize greyscale and compute mean absolute difference
    const toRaw = async (buf) => {
      const img = sharp(buf).resize(64, 64).greyscale().raw();
      const { data } = await img.toBuffer({ resolveWithObject: true });
      return data;
    };
    const a = await toRaw(idBuf);
    const b = await toRaw(liveBuf);
    let s = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) s += Math.abs(a[i] - b[i]);
    const maxDiff = 255 * Math.min(a.length, b.length);
    const similarity = Math.max(0, Math.min(1, 1 - (s / maxDiff)));

    const threshold = 0.55; // loose threshold for scaffold
    const db = readDB();
    let user = db.find(u => u.id === userId);
    if (!user) return res.status(404).json({ ok: false, error: 'user not found' });

    if (similarity >= threshold) {
      user.deptVerified = true;
      user.verifiedDept = deptId;
      user.deptVerifiedAt = new Date().toISOString();
      writeDB(db);
      return res.json({ ok: true, verified: true, similarity });
    } else {
      return res.json({ ok: true, verified: false, similarity });
    }
  } catch (e) {
    console.error('verify-id error', e);
    return res.status(500).json({ ok: false, error: 'internal' });
  }
});

// Add a report record for a user (used to compute accuracy)
app.post('/user/:id/report', (req, res) => {
  const id = req.params.id;
  const { reportId, status, verified } = req.body || {};
  const db = readDB();
  const user = db.find(u => u.id === id);
  if (!user) return res.status(404).json({ error: 'not found' });
  user.reports = user.reports || [];
  user.reports.push({ reportId, status: status || 'submitted', verified: !!verified, time: new Date().toISOString() });
  writeDB(db);
  return res.json({ ok: true });
});

// Get user summary including trust score and badges and current limits
app.get('/user/:id', (req, res) => {
  const id = req.params.id;
  const db = readDB();
  const user = db.find(u => u.id === id);
  if (!user) return res.status(404).json({ error: 'not found' });
  const score = computeTrustScore(user);
  const badges = assignBadges(user);
  // progressive limits
  const limit = score > 60 ? 10 : 2;
  return res.json({ ok: true, user: { id: user.id, name: user.name, phone: user.phone, score, badges, limit } });
});

const port = process.env.USER_SERVICE_PORT || 5150;
if (require.main === module) {
  app.listen(port, () => console.log(`User service listening on http://localhost:${port}`));
}

module.exports = { app, computeTrustScore, assignBadges };
