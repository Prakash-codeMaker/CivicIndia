import express, { json } from 'express';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const DEPT_DB = join(process.cwd(), 'server', 'departments.json');
const ROUTING_DB = join(process.cwd(), 'server', 'routing-db.json');

const read = (p) => { try { return JSON.parse(readFileSync(p, 'utf8') || '[]'); } catch (e) { return []; } };
const write = (p, v) => { try { writeFileSync(p, JSON.stringify(v, null, 2), 'utf8'); } catch (e) { console.error('write failed', p, e); } };

// Simple escalation: if assignment due date passed and not reviewed, escalate count
const escalateAssignments = () => {
  const routing = read(ROUTING_DB);
  const escalated = [];
  const now = Date.now();
  for (const a of routing) {
    if (!a.due) continue;
    if (a.status === 'assigned' && !a.reviewed && new Date(a.due).getTime() < now) {
      a.escalated = true;
      a.escalatedAt = new Date().toISOString();
      escalated.push(a);
    }
  }
  write(ROUTING_DB, routing);
  return escalated;
};

const app = express();
app.use(json({ limit: '200kb' }));

app.get('/departments', (req, res) => {
  const list = read(DEPT_DB);
  return res.json({ ok: true, departments: list });
});

app.get('/department/:id/stats', (req, res) => {
  const id = req.params.id;
  const routing = read(ROUTING_DB);
  const assignments = routing.filter(a => a.department === id);
  const total = assignments.length;
  const overdue = assignments.filter(a => new Date(a.due).getTime() < Date.now() && a.status !== 'resolved').length;
  const avgResolution = (() => {
    const resolved = assignments.filter(a => a.status === 'resolved' && a.resolvedAt);
    if (!resolved.length) return 0;
    const diffs = resolved.map(r => new Date(r.resolvedAt).getTime() - new Date(r.assignedAt).getTime());
    return Math.round(diffs.reduce((s, v) => s + v, 0) / diffs.length / (1000*60*60*24)); // days
  })();
  return res.json({ ok: true, stats: { total, overdue, avgResolution } });
});

app.post('/department/:id/respond', (req, res) => {
  const id = req.params.id;
  const { reportId, status } = req.body || {};
  if (!reportId) return res.status(400).json({ error: 'missing reportId' });
  const routing = read(ROUTING_DB);
  const idx = routing.findIndex(r => String(r.id) === String(reportId));
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  routing[idx].status = status || routing[idx].status;
  if (status === 'resolved') routing[idx].resolvedAt = new Date().toISOString();
  write(ROUTING_DB, routing);
  return res.json({ ok: true, assignment: routing[idx] });
});

app.post('/escalate', (req, res) => {
  const escalated = escalateAssignments();
  return res.json({ ok: true, escalated });
});

const port = process.env.DEPARTMENT_SERVICE_PORT || 5160;
// ESM-safe check to start server when executed directly
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  app.listen(port, () => console.log(`Department service listening http://localhost:${port}`));
}

export default { app, escalateAssignments };
