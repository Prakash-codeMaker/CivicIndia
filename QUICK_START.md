# CivicIndia - Quick Start Guide

## 🚀 Getting Started

### Step 1: Install Dependencies
```bash
npm install --legacy-peer-deps
```

### Step 2: Start All Services
```bash
npm run server
```

This will start:
- ✅ Auth Service on port 5170
- ✅ Notification Service on port 5180  
- ✅ Workflow Service on port 5190

### Step 3: Start Frontend (in separate terminal)
```bash
npm run dev
```

Your app will be available at http://localhost:3000

## 📋 Quick Commands

```bash
# Start all backend services together
npm run server

# Start individual services
npm run auth-server          # Auth service only
npm run notification-server  # Notification service only
npm run workflow-server      # Workflow service only

# Start frontend
npm run dev

# Run tests
npm test
```

## ✅ What's Included

### Database & Backups
- SQLite database (automatically created)
- Daily automatic backups
- 30-day backup retention

### Authentication & Security
- User registration & login
- Password reset
- Session management
- Role-based access control (Citizen, Moderator, Dept Admin, Super Admin)

### Notifications
- Email notifications
- SMS alerts  
- WhatsApp integration
- Push notifications

### Workflow Tools
- Bulk report assignment
- Template responses
- Department dashboards
- SLA tracking

## 📝 Testing the Services

### Test Auth
```bash
curl http://localhost:5170/auth/register -X POST -H "Content-Type: application/json" -d "{\"email\":\"test@test.com\",\"password\":\"test123\"}"
```

### Test Notification
```bash
curl http://localhost:5180/notifications/user123/count
```

### Test Workflow
```bash
curl http://localhost:5190/workflows/dashboard/roads
```

## 🗄️ Database

The database is automatically created on first run:
- Location: `server/civicindia.db`
- Backups: `server/backups/`

## ⚠️ Troubleshooting

### If you get "sqlite3 not found" error:
```bash
npm install sqlite3 --legacy-peer-deps
```

### If port is already in use:
Change the port by setting environment variables or edit the service files.

### For more help:
See `INSTALLATION.md` for detailed troubleshooting.

## 📚 Documentation

- `FEATURES.md` - Complete feature documentation
- `IMPLEMENTATION_SUMMARY.md` - Implementation overview
- `INSTALLATION.md` - Detailed installation guide
- `QUICK_START.md` - This file

## 🎉 You're Ready!

The enterprise features are now integrated into your CivicIndia application!
