# CivicIndia - Installation & Troubleshooting Guide

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

## Installation Steps

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

Note: `--legacy-peer-deps` flag is used to bypass peer dependency conflicts between React 19 and testing libraries.

### 2. Install SQLite3 (if not already installed)
```bash
npm install sqlite3 --legacy-peer-deps
```

### 3. Start Services

#### Option A: Start all services together (Recommended)
```bash
npm run server
```

This will start all three services:
- Auth Service (port 5170)
- Notification Service (port 5180)  
- Workflow Service (port 5190)

#### Option B: Start services individually
```bash
# Auth service only
npm run auth-server

# Notification service only
npm run notification-server

# Workflow service only
npm run workflow-server
```

## Common Issues & Solutions

### Issue 1: "Cannot find package 'sqlite3'"
**Solution**:
```bash
npm install sqlite3 --legacy-peer-deps
```

### Issue 2: "ERESOLVE dependency conflict"
**Solution**:
```bash
npm install --legacy-peer-deps
```

Or create/edit `.npmrc` file:
```
legacy-peer-deps=true
```

### Issue 3: Module not found errors
**Solution**: Clear node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Issue 4: Port already in use
**Solution**: Kill the process using the port or change the port in the service file:
- Auth: Default port 5170
- Notification: Default port 5180
- Workflow: Default port 5190

To change ports, edit the service files or set environment variables:
```bash
# Windows PowerShell
$env:AUTH_SERVICE_PORT=5171
$env:NOTIFICATION_SERVICE_PORT=5181
$env:WORKFLOW_SERVICE_PORT=5191

# Linux/Mac
export AUTH_SERVICE_PORT=5171
export NOTIFICATION_SERVICE_PORT=5181
export WORKFLOW_SERVICE_PORT=5191
```

### Issue 5: Database initialization errors
**Solution**: The database is auto-created on first run. If issues persist:
1. Delete `server/civicindia.db` if it exists
2. Restart the services

### Issue 6: Windows-specific errors with native modules
**Solution**:
```bash
# Install build tools (run as Administrator)
npm install --global windows-build-tools

# Then reinstall sqlite3
npm install sqlite3 --legacy-peer-deps --build-from-source
```

## Testing the Installation

### Test Auth Service
```bash
curl -X POST http://localhost:5170/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"test123\",\"name\":\"Test User\"}"
```

### Test Notification Service
```bash
curl http://localhost:5180/notifications/user123/count
```

### Test Workflow Service
```bash
curl http://localhost:5190/workflows/dashboard/roads
```

## Development Workflow

1. **Start the main app**:
   ```bash
   npm run dev
   ```

2. **Start backend services** (in separate terminal):
   ```bash
   npm run server
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Auth API: http://localhost:5170
   - Notification API: http://localhost:5180
   - Workflow API: http://localhost:5190

## Database Files

After first run, these files will be created:
- `server/civicindia.db` - Main SQLite database
- `server/backups/` - Directory for automatic backups

## Troubleshooting Checklist

- [ ] Node.js version is 18+ (check with `node -v`)
- [ ] All dependencies installed (`npm install --legacy-peer-deps`)
- [ ] sqlite3 installed successfully
- [ ] Ports 5170, 5180, 5190 are available
- [ ] No firewall blocking the ports
- [ ] Database file has write permissions

## Getting Help

If you encounter issues not covered here:
1. Check the console output for error messages
2. Verify all prerequisites are installed
3. Try running services individually to isolate the issue
4. Check that ports are not being used by other applications

## Production Notes

For production deployment:
- Replace SQLite with PostgreSQL
- Use environment variables for configuration
- Set up proper SSL/HTTPS
- Configure reverse proxy (nginx)
- Set up monitoring and logging
- Use process manager (PM2 or similar)
- Configure automatic backups
