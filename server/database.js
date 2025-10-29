import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'civicindia.db');
const BACKUP_DIR = path.join(__dirname, 'backups');

// Create backup directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

class Database {
  constructor() {
    this.db = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) reject(err);
        else {
          this.initTables();
          resolve();
        }
      });
    });
  }

  initTables() {
    // Reports table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        issue_type TEXT NOT NULL,
        location TEXT NOT NULL,
        description TEXT,
        photos TEXT,
        status TEXT DEFAULT 'submitted',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);

    // Audit logs table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        action TEXT NOT NULL,
        resource_type TEXT,
        resource_id TEXT,
        details TEXT,
        created_at INTEGER NOT NULL
      )
    `);

    // Users table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        phone TEXT,
        role TEXT DEFAULT 'citizen',
        department_id TEXT,
        is_verified BOOLEAN DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);

    // Sessions table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        created_at INTEGER NOT NULL
      )
    `);

    // Service applications table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS service_applications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        service_type TEXT NOT NULL,
        data TEXT,
        attachments TEXT,
        status TEXT DEFAULT 'submitted',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);

    // Notifications table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        title TEXT,
        message TEXT,
        read BOOLEAN DEFAULT 0,
        created_at INTEGER NOT NULL
      )
    `);

    // Assignments table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS assignments (
        id TEXT PRIMARY KEY,
        report_id TEXT NOT NULL,
        department_id TEXT NOT NULL,
        assigned_to TEXT,
        status TEXT DEFAULT 'assigned',
        due_date INTEGER,
        resolved_at INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);

    // Create indexes
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_reports_user ON reports(user_id)`);
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status)`);
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id)`);
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id)`);
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read)`);
  }

  // Generic query methods
  query(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  // Audit logging
  async logAudit(userId, action, resourceType, resourceId, details) {
    await this.run(
      'INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, action, resourceType, resourceId, JSON.stringify(details), Date.now()]
    );
  }

  // Backup database
  async backup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}.db`);
    
    return new Promise((resolve, reject) => {
      fs.copyFile(DB_PATH, backupPath, (err) => {
        if (err) reject(err);
        else {
          console.log(`Backup created: ${backupPath}`);
          resolve(backupPath);
        }
      });
    });
  }

  // Clean old backups (keep last 30 days)
  async cleanOldBackups() {
    const files = fs.readdirSync(BACKUP_DIR);
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    for (const file of files) {
      const filePath = path.join(BACKUP_DIR, file);
      const stats = fs.statSync(filePath);
      if (stats.mtimeMs < thirtyDaysAgo) {
        fs.unlinkSync(filePath);
        console.log(`Removed old backup: ${file}`);
      }
    }
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

// Singleton instance
let dbInstance = null;

export const getDatabase = async () => {
  if (!dbInstance) {
    dbInstance = new Database();
    await dbInstance.connect();
    
    // Setup daily backup
    setInterval(() => {
      dbInstance.backup().catch(console.error);
      dbInstance.cleanOldBackups().catch(console.error);
    }, 24 * 60 * 60 * 1000); // Daily
  }
  return dbInstance;
};

export default Database;
