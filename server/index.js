import authService from './auth-service.js';
import notificationService from './notification-service.js';
import workflowService from './workflow-service.js';

const AUTH_PORT = process.env.AUTH_SERVICE_PORT || 5170;
const NOTIFICATION_PORT = process.env.NOTIFICATION_SERVICE_PORT || 5180;
const WORKFLOW_PORT = process.env.WORKFLOW_SERVICE_PORT || 5190;

// Start all services
async function startServices() {
  try {
    // Start auth service
    authService.listen(AUTH_PORT, () => {
      console.log(`✅ Auth service listening on http://localhost:${AUTH_PORT}`);
    });

    // Start notification service
    notificationService.listen(NOTIFICATION_PORT, () => {
      console.log(`✅ Notification service listening on http://localhost:${NOTIFICATION_PORT}`);
    });

    // Start workflow service
    workflowService.listen(WORKFLOW_PORT, () => {
      console.log(`✅ Workflow service listening on http://localhost:${WORKFLOW_PORT}`);
    });

    console.log('\n🎉 All services started successfully!\n');
  } catch (error) {
    console.error('❌ Error starting services:', error);
    process.exit(1);
  }
}

startServices();
