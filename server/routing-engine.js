import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const DB_PATH = path.join(process.cwd(), 'server', 'routing-db.json');

const defaultDepartments = [
  { id: 'roads', name: 'Roads & Infrastructure', keywords: ['pothole', 'road', 'street', 'infrastructure'] },
  { id: 'sanitation', name: 'Sanitation', keywords: ['garbage', 'waste', 'trash', 'sanitation'] },
  { id: 'lighting', name: 'Street Lighting', keywords: ['light', 'street-light', 'lamp'] },
  { id: 'health', name: 'Public Health', keywords: ['mosquito', 'health', 'clinic'] },
];

const readDB = () => {
  try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8') || '[]'); } catch (e) { return []; }
};
const writeDB = (arr) => {
  try { fs.writeFileSync(DB_PATH, JSON.stringify(arr.slice(-5000), null, 2), 'utf8'); } catch (e) { console.error('routing-db write failed', e); }
};

const app = express();
app.use(express.json({ limit: '200kb' }));

// Simple classifier to assign department based on issue type and detected labels
const assignDepartment = (issueType, labels = []) => {
  const text = (issueType || '') + ' ' + labels.join(' ');
  const scores = defaultDepartments.map(d => ({ id: d.id, score: d.keywords.reduce((s, k) => s + (text.includes(k) ? 1 : 0), 0) }));
  scores.sort((a, b) => b.score - a.score);
  return scores[0].score > 0 ? scores[0].id : 'general';
};

// SLA tracker: record assigned report and due date (simple in-memory persisted store)
app.post('/assign', (req, res) => {
  const { reportId, issueType, labels = [], priority = 'normal' } = req.body || {};
  if (!reportId) return res.status(400).json({ error: 'missing reportId' });
  const dept = assignDepartment(issueType, labels);
  const db = readDB();
  const dueDays = priority === 'high' ? 2 : priority === 'low' ? 14 : 7;
  const due = new Date(Date.now() + dueDays * 24 * 3600 * 1000).toISOString();
  const entry = { id: reportId, department: dept, assignedAt: new Date().toISOString(), due, status: 'assigned' };
  db.push(entry);
  writeDB(db);
  return res.json({ ok: true, assignment: entry });
});

// Check SLA status
app.get('/sla/:reportId', (req, res) => {
  const id = req.params.reportId;
  const db = readDB();
  const e = db.find(x => x.id === id);
  if (!e) return res.status(404).json({ error: 'not found' });
  const overdue = new Date() > new Date(e.due);
  return res.json({ ok: true, entry: e, overdue });
});

// Duplicate detection hook (simple): check recent assignments with same labels/location
app.post('/detect-duplicate', (req, res) => {
  const { labels = [], location = '' } = req.body || {};
  const db = readDB();
  // naive duplicate detection: same labels and same location substring
  const dup = db.find(r => labels.join('|') === (r.labels || []).join('|') && location && r.location && r.location.includes(location));
  return res.json({ ok: true, duplicate: !!dup, duplicateId: dup ? dup.id : null });
});

// Admin endpoints: list assignments and mark reviewed or reassign
app.get('/assignments', (req, res) => {
  const db = readDB();
  return res.json({ ok: true, assignments: db.slice().reverse() });
});

app.post('/assignments/:id/reassign', (req, res) => {
  const id = req.params.id;
  const { department } = req.body || {};
  const db = readDB();
  const idx = db.findIndex(x => x.id === id || String(x.id) === String(id));
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  db[idx].department = department || db[idx].department;
  db[idx].reassignedAt = new Date().toISOString();
  writeDB(db);
  return res.json({ ok: true, assignment: db[idx] });
});

app.post('/assignments/:id/mark-reviewed', (req, res) => {
  const id = req.params.id;
  const db = readDB();
  const idx = db.findIndex(x => x.id === id || String(x.id) === String(id));
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  db[idx].reviewed = true;
  db[idx].reviewedAt = new Date().toISOString();
  writeDB(db);
  return res.json({ ok: true, assignment: db[idx] });
});

const port = process.env.ROUTING_PORT || 5140;
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  app.listen(port, () => console.log(`Routing engine listening on http://localhost:${port}`));
}

export { app, assignDepartment };
