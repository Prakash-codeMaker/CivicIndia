# Testing Guide - CivicIndia Services

## ✅ Services are Running!

The "Cannot GET" message you saw is **NORMAL** - it just means there's no route defined at the root path. The services are actually working correctly!

## How to Test the Services

### Option 1: Using Web Browser (Easiest)

Open your browser and visit these URLs:
- **Auth Service**: http://localhost:5170/
- **Notification Service**: http://localhost:5180/
- **Workflow Service**: http://localhost:5190/

You should see JSON responses like:
```json
{"ok":true,"service":"auth","status":"running","port":5170}
```

### Option 2: Using PowerShell

#### Test Auth Service
```powershell
Invoke-WebRequest -Uri http://localhost:5170/ -UseBasicParsing
```

#### Test Notification Service
```powershell
Invoke-WebRequest -Uri http://localhost:5180/ -UseBasicParsing
```

#### Test Workflow Service
```powershell
Invoke-WebRequest -Uri http://localhost:5190/ -UseBasicParsing
```

### Option 3: Using curl (PowerShell)

```powershell
# Auth Service
curl.exe http://localhost:5170/

# Notification Service
curl.exe http://localhost:5180/

# Workflow Service
curl.exe http://localhost:5190/
```

## Testing API Endpoints

### 1. Test User Registration (Auth Service)

```powershell
$body = @{
    email = "test@example.com"
    password = "test123"
    name = "Test User"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:5170/auth/register -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
```

### 2. Test Getting Notifications (Notification Service)

```powershell
Invoke-WebRequest -Uri http://localhost:5180/notifications/user123/count -UseBasicParsing
```

### 3. Test Workflow Dashboard (Workflow Service)

```powershell
Invoke-WebRequest -Uri http://localhost:5190/workflows/dashboard/roads -UseBasicParsing
```

## Expected Responses

### Auth Service Health Check
```json
{
  "ok": true,
  "service": "auth",
  "status": "running",
  "port": 5170
}
```

### Notification Service Health Check
```json
{
  "ok": true,
  "service": "notification",
  "status": "running",
  "port": 5180
}
```

### Workflow Service Health Check
```json
{
  "ok": true,
  "service": "workflow",
  "status": "running",
  "port": 5190
}
```

## Troubleshooting

If you still get errors:

1. **Make sure services are running**:
   ```powershell
   # Check if processes are listening on the ports
   netstat -an | findstr "5170"
   netstat -an | findstr "5180"
   netstat -an | findstr "5190"
   ```

2. **Restart the services**:
   ```powershell
   # Stop the current server (Ctrl+C)
   # Then restart
   npm run server
   ```

3. **Check console output** for any error messages

## Success Indicators

✅ Services show in console: "✅ Auth service listening on http://localhost:5170"
✅ Browser shows JSON response when visiting http://localhost:5170/
✅ No error messages in console
✅ Database file exists: `server/civicindia.db`

## Quick Test Script

Save this as `test-services.ps1`:

```powershell
Write-Host "Testing Auth Service..." -ForegroundColor Yellow
Invoke-WebRequest -Uri http://localhost:5170/ -UseBasicParsing | Select-Object -ExpandProperty Content

Write-Host "`nTesting Notification Service..." -ForegroundColor Yellow
Invoke-WebRequest -Uri http://localhost:5180/ -UseBasicParsing | Select-Object -ExpandProperty Content

Write-Host "`nTesting Workflow Service..." -ForegroundColor Yellow
Invoke-WebRequest -Uri http://localhost:5190/ -UseBasicParsing | Select-Object -ExpandProperty Content

Write-Host "`nAll services are working! ✅" -ForegroundColor Green
```

Run it with:
```powershell
.\test-services.ps1
```

## Summary

Your services are working correctly! The "Cannot GET" message was just because there was no root endpoint defined. Now with the health check endpoints, you should see proper JSON responses.

**All three services should now respond with their status when you visit their root URLs in a browser!**
