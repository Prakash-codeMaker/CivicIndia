import express from 'express';
import crypto from 'crypto';
import { getDatabase } from './database.js';

const app = express();
app.use(express.json({ limit: '100kb' }));

const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour
const PASSWORD_RESET_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// Password reset tokens store (in production, use Redis)
const resetTokens = new Map();

// Helper to hash passwords (use bcrypt in production)
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// Helper to generate tokens
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Helper to check session
const checkSession = async (sessionId) => {
  const db = await getDatabase();
  const sessions = await db.query('SELECT * FROM sessions WHERE id = ?', [sessionId]);
  if (sessions.length === 0) return null;
  
  const session = sessions[0];
  if (session.expires_at < Date.now()) {
    await db.run('DELETE FROM sessions WHERE id = ?', [sessionId]);
    return null;
  }
  return session;
};

// Middleware for authentication
export const authenticate = async (req, res, next) => {
  const sessionId = req.headers['x-session-id'];
  if (!sessionId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const session = await checkSession(sessionId);
  if (!session) {
    return res.status(401).json({ error: 'Session expired' });
  }
  
  req.userId = session.user_id;
  next();
};

// Middleware for role-based access control
export const requireRole = (...roles) => {
  return async (req, res, next) => {
    const db = await getDatabase();
    const users = await db.query('SELECT role FROM users WHERE id = ?', [req.userId]);
    
    if (users.length === 0 || !roles.includes(users[0].role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ ok: true, service: 'auth', status: 'running', port: process.env.AUTH_SERVICE_PORT || 5170 });
});

// Register new user
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const db = await getDatabase();
    
    // Check if user exists
    const existing = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const userId = crypto.randomBytes(16).toString('hex');
    const hashedPassword = hashPassword(password);
    
    // In production, store hashed password in users table
    // For now, we'll just create the user record
    await db.run(
      'INSERT INTO users (id, email, name, phone, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, email, name || '', phone || '', 'citizen', Date.now(), Date.now()]
    );

    await db.logAudit(userId, 'USER_REGISTERED', 'user', userId, { email });

    res.json({ ok: true, userId });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const db = await getDatabase();
    
    // In production, verify password hash
    // For now, just check if user exists
    const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    
    // Create session
    const sessionId = generateToken();
    const expiresAt = Date.now() + SESSION_TIMEOUT;
    
    await db.run(
      'INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)',
      [sessionId, user.id, expiresAt, Date.now()]
    );

    await db.logAudit(user.id, 'USER_LOGIN', 'session', sessionId, {});

    res.json({ 
      ok: true, 
      sessionId,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout
app.post('/auth/logout', authenticate, async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    const db = await getDatabase();
    
    await db.run('DELETE FROM sessions WHERE id = ?', [sessionId]);
    await db.logAudit(req.userId, 'USER_LOGOUT', 'session', sessionId, {});

    res.json({ ok: true });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Request password reset
app.post('/auth/reset-password/request', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    const db = await getDatabase();
    const users = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    
    if (users.length > 0) {
      const token = generateToken();
      resetTokens.set(token, {
        userId: users[0].id,
        expiresAt: Date.now() + PASSWORD_RESET_TIMEOUT
      });

      // In production, send email with reset link
      console.log(`Password reset token for ${email}: ${token}`);
      
      await db.logAudit(users[0].id, 'PASSWORD_RESET_REQUESTED', 'user', users[0].id, {});
    }

    // Always return success to prevent email enumeration
    res.json({ ok: true, message: 'If the email exists, a reset link has been sent' });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset password with token
app.post('/auth/reset-password/confirm', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password required' });
    }

    const resetData = resetTokens.get(token);
    if (!resetData || resetData.expiresAt < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    resetTokens.delete(token);

    // In production, update hashed password
    const db = await getDatabase();
    await db.logAudit(resetData.userId, 'PASSWORD_RESET', 'user', resetData.userId, {});

    res.json({ ok: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Password reset confirm error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change password (authenticated)
app.post('/auth/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password required' });
    }

    // In production, verify current password and update
    await db.logAudit(req.userId, 'PASSWORD_CHANGED', 'user', req.userId, {});

    res.json({ ok: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
app.get('/auth/me', authenticate, async (req, res) => {
  try {
    const db = await getDatabase();
    const users = await db.query('SELECT id, email, name, phone, role, department_id FROM users WHERE id = ?', [req.userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ ok: true, user: users[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Only start server if run directly, not when imported
const isMainModule = import.meta.url === `file://${process.argv[1]}` || import.meta.url.endsWith(process.argv[1]);

if (isMainModule) {
  const port = process.env.AUTH_SERVICE_PORT || 5170;
  app.listen(port, () => console.log(`Auth service listening on http://localhost:${port}`));
}

export default app;
