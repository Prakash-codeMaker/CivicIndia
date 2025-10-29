# CivicIndia - Enterprise Features Documentation

## Overview
This document describes the enterprise-level features added to CivicIndia, including database persistence, authentication, notifications, and workflow management.

## 1. Data Persistence & Backup

### Database Layer (`server/database.js`)
- **SQLite Database**: Replaces localStorage with a proper SQLite database
- **Tables**: Reports, users, sessions, service applications, notifications, assignments, audit logs
- **Indexes**: Optimized queries on frequently accessed columns
- **Automated Backups**: Daily automatic backups stored in `server/backups/`
- **Backup Retention**: 30-day retention policy (automatically removes old backups)

### Audit Logging
All critical actions are logged with:
- User ID
- Action type
- Resource type and ID
- Timestamp
- Additional details

**Example Actions Logged**:
- User registration/login
- Report submission
- Status changes
- Assignment updates
- Bulk operations

### Data Export
- Individual user data export capability
- Admin-level data export
- Audit log exports for compliance

## 2. User Management & Security

### Authentication Service (`server/auth-service.js`)

#### Password Reset
- **Request Reset**: POST `/auth/reset-password/request`
- **Confirm Reset**: POST `/auth/reset-password/confirm`
- Secure token-based reset (30-minute expiry)
- Email-based reset flow (mock implementation ready for production)

#### Session Management
- Session creation on login
- **Session Timeout**: 1 hour (configurable)
- Automatic session expiration
- Session storage in database

#### Role-Based Access Control (RBAC)
**Roles**:
1. **Citizen**: Default role, can report issues and apply for services
2. **Moderator**: Can moderate community content
3. **Department Admin**: Manage department assignments and responses
4. **Super Admin**: Full system access

**Middleware**:
- `authenticate`: Verifies user session
- `requireRole(...roles)`: Restricts access to specific roles

### Security Features
- Session-based authentication
- Audit logs for all authentication events
- Password change functionality
- Account lockout (future enhancement)

## 3. Notifications System

### Notification Service (`server/notification-service.js`)

#### Channels Supported
1. **Email**: For status updates and important notifications
2. **SMS**: For urgent issues (mock implementation)
3. **WhatsApp**: For broader reach (mock implementation)
4. **Push**: Client-side notifications

#### Notification Types
- `status_update`: Report status changes
- `urgent`: Critical issues requiring immediate attention
- `assignment`: New assignments
- `reminder`: Deadline reminders
- `system`: System announcements

#### Endpoints
- **Send Notification**: POST `/notifications/send`
- **Get Notifications**: GET `/notifications/:userId`
- **Mark as Read**: POST `/notifications/:id/read`
- **Mark All Read**: POST `/notifications/:userId/read-all`
- **Get Count**: GET `/notifications/:userId/count`
- **Delete**: DELETE `/notifications/:id`

#### Features
- User-specific notification preferences
- Unread notification counts
- Notification history
- Multi-channel support
- Automatic channel selection based on notification type

## 4. Department Workflow Tools

### Workflow Service (`server/workflow-service.js`)

#### Bulk Actions
- **Bulk Assign**: POST `/workflows/bulk-assign`
  - Assign multiple reports to a department at once
  - Set due dates for all assignments
  - Track assignment results

**Example**:
```json
{
  "reportIds": ["RPT-123", "RPT-456"],
  "departmentId": "roads",
  "assignedTo": "user-789",
  "dueDays": 7
}
```

#### Template Responses
Pre-defined templates for common scenarios:
- `acknowledgment`: Initial receipt confirmation
- `in_progress`: Work in progress update
- `resolved`: Issue resolved notification
- `escalation`: Escalation notice

**Endpoint**: POST `/workflows/send-template`

#### Department Dashboard
- **Total Assignments**: All assignments for department
- **Resolved Count**: Successfully closed issues
- **In Progress**: Currently active assignments
- **Overdue**: Past due date
- **Average Resolution Time**: Days to resolve
- **SLA Compliance Rate**: % meeting deadlines

**Endpoint**: GET `/workflows/dashboard/:departmentId`

#### SLA Tracking
- **Automatic SLA Monitoring**: Check for approaching deadlines
- **SLA Breach Alerts**: Notify admins of overdue items
- **Due Date Tracking**: Monitor assignment deadlines

**Endpoint**: POST `/workflows/check-sla`

## 5. Installation & Setup

### Dependencies
```bash
npm install sqlite3
```

### Running Services

#### Development Mode
```bash
# Auth service
npm run auth-server

# Notification service
npm run notification-server

# Workflow service
npm run workflow-server
```

#### Environment Variables
```env
AUTH_SERVICE_PORT=5170
NOTIFICATION_SERVICE_PORT=5180
WORKFLOW_SERVICE_PORT=5190
```

### Database Initialization
The database is automatically initialized on first connection. No manual setup required.

## 6. API Integration

### Frontend Integration
Update your API calls to use the new services:

```javascript
// Example: Get user notifications
const response = await fetch('http://localhost:5180/notifications/userId');
const data = await response.json();

// Example: Send notification
const response = await fetch('http://localhost:5180/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user123',
    type: 'status_update',
    title: 'Status Update',
    message: 'Your report has been reviewed',
    channels: ['email', 'push']
  })
});
```

## 7. Production Considerations

### Security
- Use bcrypt for password hashing (currently using SHA256)
- Implement HTTPS for all API calls
- Add rate limiting to sensitive endpoints
- Use Redis for session storage (currently in-memory)
- Implement JWT tokens for stateless authentication

### Scalability
- Replace SQLite with PostgreSQL for production
- Use message queue (RabbitMQ/SQS) for notifications
- Implement caching layer (Redis)
- Use load balancer for service distribution

### Notification Providers
Replace mock implementations with:
- **Email**: SendGrid, AWS SES, Mailgun
- **SMS**: Twilio, AWS SNS
- **WhatsApp**: WhatsApp Business API, Twilio

### Monitoring
- Add logging (Winston/Pino)
- Implement monitoring (Prometheus/Grafana)
- Set up alerting for SLA breaches
- Performance monitoring

## 8. Migration from localStorage

To migrate existing localStorage data to the database:

1. Export localStorage data
2. Use migration script to import to database
3. Update frontend to use API calls instead of localStorage

## 9. Testing

### Test Endpoints
```bash
# Test auth
curl -X POST http://localhost:5170/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Test notification
curl -X POST http://localhost:5180/notifications/send \
  -H "Content-Type: application/json" \
  -d '{"userId":"user123","type":"status_update","message":"Test"}'

# Test workflow
curl http://localhost:5190/workflows/dashboard/roads
```

## 10. Future Enhancements

- Real-time notifications (WebSocket)
- Advanced analytics and reporting
- AI-powered assignment suggestions
- Mobile app integration
- Voice/Video chat support
- Multi-language support
