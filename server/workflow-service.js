import express from 'express';
import { getDatabase } from './database.js';

const app = express();
app.use(express.json({ limit: '200kb' }));

// Mock authenticate middleware for workflow service (in production, import from auth-service)
const authenticate = async (req, res, next) => {
  // In production, this would verify the session
  // For now, we'll allow requests through
  const userId = req.headers['x-user-id'] || 'system';
  req.userId = userId;
  next();
};

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ ok: true, service: 'workflow', status: 'running', port: process.env.WORKFLOW_SERVICE_PORT || 5190 });
});

// Bulk assign reports to department
app.post('/workflows/bulk-assign', authenticate, async (req, res) => {
  try {
    const { reportIds, departmentId, assignedTo, dueDays = 7 } = req.body;
    
    if (!reportIds || !Array.isArray(reportIds) || reportIds.length === 0) {
      return res.status(400).json({ error: 'reportIds array required' });
    }
    if (!departmentId) {
      return res.status(400).json({ error: 'departmentId required' });
    }

    const db = await getDatabase();
    const dueDate = Date.now() + (dueDays * 24 * 60 * 60 * 1000);
    const results = [];

    for (const reportId of reportIds) {
      const assignmentId = `ASSIGN-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      
      await db.run(
        'INSERT INTO assignments (id, report_id, department_id, assigned_to, status, due_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [assignmentId, reportId, departmentId, assignedTo || null, 'assigned', dueDate, Date.now(), Date.now()]
      );

      results.push({ reportId, assignmentId, success: true });
    }

    await db.logAudit(req.userId, 'BULK_ASSIGN', 'workflow', null, { reportIds, departmentId });

    res.json({ ok: true, results });
  } catch (error) {
    console.error('Bulk assign error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Template responses
const templates = {
  acknowledgment: "Thank you for reporting this issue. We have received your complaint (ID: {reportId}) and assigned it to the relevant department. We'll keep you updated on the progress.",
  in_progress: "Your complaint (ID: {reportId}) is being actively worked on by our team. Expected resolution: {expectedDate}.",
  resolved: "Great news! Your complaint (ID: {reportId}) has been resolved. If you have any concerns, please contact us.",
  escalation: "Your complaint (ID: {reportId}) has been escalated to senior management due to delay. You will receive an update within 24 hours."
};

app.get('/workflows/templates', async (req, res) => {
  res.json({ ok: true, templates });
});

app.post('/workflows/send-template', async (req, res) => {
  try {
    const { reportId, userId, templateType, customVars = {} } = req.body;
    
    if (!templates[templateType]) {
      return res.status(400).json({ error: 'Invalid template type' });
    }

    let message = templates[templateType];
    
    // Replace placeholders
    const vars = {
      reportId,
      expectedDate: customVars.expectedDate || 'within 7 working days',
      ...customVars
    };

    for (const [key, value] of Object.entries(vars)) {
      message = message.replace(`{${key}}`, value);
    }

    // Send notification (use notification service)
    // For now, just return the message
    res.json({ ok: true, message });
  } catch (error) {
    console.error('Send template error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Department performance dashboard
app.get('/workflows/dashboard/:departmentId', async (req, res) => {
  try {
    const { departmentId } = req.params;
    const db = await getDatabase();

    // Get all assignments for department
    const assignments = await db.query(
      'SELECT * FROM assignments WHERE department_id = ? ORDER BY created_at DESC',
      [departmentId]
    );

    // Calculate statistics
    const total = assignments.length;
    const resolved = assignments.filter(a => a.status === 'resolved').length;
    const inProgress = assignments.filter(a => a.status === 'in_progress').length;
    const overdue = assignments.filter(a => {
      return a.due_date < Date.now() && a.status !== 'resolved';
    }).length;

    // Calculate average resolution time
    const resolvedAssignments = assignments.filter(a => a.status === 'resolved' && a.resolved_at);
    const avgResolutionTime = resolvedAssignments.length > 0 
      ? resolvedAssignments.reduce((sum, a) => sum + (a.resolved_at - a.created_at), 0) / resolvedAssignments.length / (1000 * 60 * 60 * 24)
      : 0;

    // SLA compliance
    const slaCompliant = resolvedAssignments.filter(a => a.resolved_at <= a.due_date).length;
    const slaComplianceRate = resolvedAssignments.length > 0 
      ? (slaCompliant / resolvedAssignments.length * 100).toFixed(2)
      : 0;

    res.json({
      ok: true,
      stats: {
        total,
        resolved,
        inProgress,
        pending: total - resolved - inProgress,
        overdue,
        avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
        slaComplianceRate: parseFloat(slaComplianceRate)
      },
      recentAssignments: assignments.slice(0, 10)
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check for SLA breaches and send alerts
app.post('/workflows/check-sla', async (req, res) => {
  try {
    const db = await getDatabase();
    
    // Find assignments approaching due date or overdue
    const assignments = await db.query(
      'SELECT * FROM assignments WHERE status != "resolved"'
    );

    const nearDue = [];
    const overdue = [];

    for (const assignment of assignments) {
      const daysUntilDue = (assignment.due_date - Date.now()) / (1000 * 60 * 60 * 24);
      
      if (daysUntilDue < 0) {
        overdue.push(assignment);
      } else if (daysUntilDue <= 1) {
        nearDue.push(assignment);
      }
    }

    // In production, send alerts to department admins
    console.log(`SLA Check: ${nearDue.length} near due, ${overdue.length} overdue`);

    res.json({
      ok: true,
      nearDue: nearDue.length,
      overdue: overdue.length,
      details: { nearDue, overdue }
    });
  } catch (error) {
    console.error('SLA check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update assignment status
app.post('/workflows/assignments/:id/update', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const db = await getDatabase();
    
    const updateFields = [];
    const params = [];
    
    if (status) {
      updateFields.push('status = ?');
      params.push(status);
    }
    
    if (notes) {
      // Store notes in details column or separate table
    }
    
    updateFields.push('updated_at = ?');
    params.push(Date.now());
    
    if (status === 'resolved') {
      updateFields.push('resolved_at = ?');
      params.push(Date.now());
    }
    
    params.push(id);
    
    const query = `UPDATE assignments SET ${updateFields.join(', ')} WHERE id = ?`;
    await db.run(query, params);
    
    await db.logAudit(req.userId, 'ASSIGNMENT_UPDATED', 'assignment', id, { status });
    
    res.json({ ok: true });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Only start server if run directly, not when imported
const isMainModule = import.meta.url === `file://${process.argv[1]}` || import.meta.url.endsWith(process.argv[1]);

if (isMainModule) {
  const port = process.env.WORKFLOW_SERVICE_PORT || 5190;
  app.listen(port, () => console.log(`Workflow service listening on http://localhost:${port}`));
}

export default app;
