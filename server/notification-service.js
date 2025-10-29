import express from 'express';
import { getDatabase } from './database.js';

const app = express();
app.use(express.json({ limit: '100kb' }));

// Mock notification providers (replace with actual services in production)
const sendEmail = async (to, subject, body) => {
  // In production, use services like SendGrid, AWS SES, etc.
  console.log(`[EMAIL] To: ${to}, Subject: ${subject}`);
  console.log(body);
  return { success: true };
};

const sendSMS = async (to, message) => {
  // In production, use services like Twilio, AWS SNS, etc.
  console.log(`[SMS] To: ${to}`);
  console.log(message);
  return { success: true };
};

const sendWhatsApp = async (to, message) => {
  // In production, use WhatsApp Business API or services like Twilio
  console.log(`[WHATSAPP] To: ${to}`);
  console.log(message);
  return { success: true };
};

// Create notification in database
const createNotification = async (userId, type, title, message, metadata = {}) => {
  const db = await getDatabase();
  const id = `NOTIF-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  
  await db.run(
    'INSERT INTO notifications (id, user_id, type, title, message, read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, userId, type, title, message, false, Date.now()]
  );
  
  return id;
};

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ ok: true, service: 'notification', status: 'running', port: process.env.NOTIFICATION_SERVICE_PORT || 5180 });
});

// Send notification based on user preferences
app.post('/notifications/send', async (req, res) => {
  try {
    const { userId, type, title, message, channels = [] } = req.body;
    
    if (!userId || !type || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = await getDatabase();
    
    // Get user details and preferences
    const users = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
    const notificationId = await createNotification(userId, type, title, message);
    
    // Determine channels based on notification type and user preferences
    let notificationChannels = [...channels];
    
    if (notificationChannels.length === 0) {
      // Default channels based on notification type
      if (type === 'status_update') {
        notificationChannels = ['email', 'push'];
      } else if (type === 'urgent') {
        notificationChannels = ['email', 'sms', 'push'];
      } else {
        notificationChannels = ['email', 'push'];
      }
    }

    const results = [];

    // Send via different channels
    for (const channel of notificationChannels) {
      try {
        if (channel === 'email' && user.email) {
          await sendEmail(user.email, title || 'Notification', message);
          results.push({ channel: 'email', success: true });
        } else if (channel === 'sms' && user.phone) {
          await sendSMS(user.phone, message);
          results.push({ channel: 'sms', success: true });
        } else if (channel === 'whatsapp' && user.phone) {
          await sendWhatsApp(user.phone, message);
          results.push({ channel: 'whatsapp', success: true });
        } else if (channel === 'push') {
          // Push notifications handled by client
          results.push({ channel: 'push', success: true });
        }
      } catch (error) {
        console.error(`Failed to send ${channel} notification:`, error);
        results.push({ channel, success: false, error: error.message });
      }
    }

    await db.logAudit(userId, 'NOTIFICATION_SENT', 'notification', notificationId, { type, channels });

    res.json({ ok: true, notificationId, results });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get notifications for user
app.get('/notifications/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0, unreadOnly = false } = req.query;

    const db = await getDatabase();
    
    let query = 'SELECT * FROM notifications WHERE user_id = ?';
    const params = [userId];

    if (unreadOnly === 'true') {
      query += ' AND read = 0';
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const notifications = await db.query(query, params);

    res.json({ ok: true, notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark notification as read
app.post('/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();
    
    await db.run('UPDATE notifications SET read = 1 WHERE id = ?', [id]);

    res.json({ ok: true });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark all notifications as read for user
app.post('/notifications/:userId/read-all', async (req, res) => {
  try {
    const { userId } = req.params;
    const db = await getDatabase();
    
    await db.run('UPDATE notifications SET read = 1 WHERE user_id = ?', [userId]);

    res.json({ ok: true });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get notification count for user
app.get('/notifications/:userId/count', async (req, res) => {
  try {
    const { userId } = req.params;
    const { unreadOnly = true } = req.query;

    const db = await getDatabase();
    
    let query = 'SELECT COUNT(*) as count FROM notifications WHERE user_id = ?';
    const params = [userId];

    if (unreadOnly === 'true') {
      query += ' AND read = 0';
    }

    const results = await db.query(query, params);
    const count = results[0]?.count || 0;

    res.json({ ok: true, count });
  } catch (error) {
    console.error('Get notification count error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete notification
app.delete('/notifications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();
    
    await db.run('DELETE FROM notifications WHERE id = ?', [id]);

    res.json({ ok: true });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Only start server if run directly, not when imported
const isMainModule = import.meta.url === `file://${process.argv[1]}` || import.meta.url.endsWith(process.argv[1]);

if (isMainModule) {
  const port = process.env.NOTIFICATION_SERVICE_PORT || 5180;
  app.listen(port, () => console.log(`Notification service listening on http://localhost:${port}`));
}

export default app;
