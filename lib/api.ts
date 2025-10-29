// API Configuration
const AUTH_API = 'http://localhost:5170';
const NOTIFICATION_API = 'http://localhost:5180';
const WORKFLOW_API = 'http://localhost:5190';

// Helper function for API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
}

// Auth Service API
export const authAPI = {
  // Register new user
  register: async (email: string, password: string, name?: string, phone?: string) => {
    return apiCall(`${AUTH_API}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ email, password, name, phone }),
    });
  },

  // Login
  login: async (email: string, password: string) => {
    return apiCall(`${AUTH_API}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // Logout
  logout: async (sessionId: string) => {
    return apiCall(`${AUTH_API}/auth/logout`, {
      method: 'POST',
      headers: { 'x-session-id': sessionId },
    });
  },

  // Get current user
  getCurrentUser: async (sessionId: string) => {
    return apiCall(`${AUTH_API}/auth/me`, {
      headers: { 'x-session-id': sessionId },
    });
  },

  // Request password reset
  requestPasswordReset: async (email: string) => {
    return apiCall(`${AUTH_API}/auth/reset-password/request`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Confirm password reset
  confirmPasswordReset: async (token: string, newPassword: string) => {
    return apiCall(`${AUTH_API}/auth/reset-password/confirm`, {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  },

  // Change password
  changePassword: async (sessionId: string, currentPassword: string, newPassword: string) => {
    return apiCall(`${AUTH_API}/auth/change-password`, {
      method: 'POST',
      headers: { 'x-session-id': sessionId },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};

// Notification Service API
export const notificationAPI = {
  // Send notification
  send: async (userId: string, type: string, title: string, message: string, channels?: string[]) => {
    return apiCall(`${NOTIFICATION_API}/notifications/send`, {
      method: 'POST',
      body: JSON.stringify({ userId, type, title, message, channels }),
    });
  },

  // Get notifications for user
  getNotifications: async (userId: string, limit = 50, offset = 0, unreadOnly = false) => {
    return apiCall(
      `${NOTIFICATION_API}/notifications/${userId}?limit=${limit}&offset=${offset}&unreadOnly=${unreadOnly}`
    );
  },

  // Mark notification as read
  markAsRead: async (notificationId: string) => {
    return apiCall(`${NOTIFICATION_API}/notifications/${notificationId}/read`, {
      method: 'POST',
    });
  },

  // Mark all notifications as read
  markAllAsRead: async (userId: string) => {
    return apiCall(`${NOTIFICATION_API}/notifications/${userId}/read-all`, {
      method: 'POST',
    });
  },

  // Get notification count
  getCount: async (userId: string, unreadOnly = true) => {
    return apiCall(`${NOTIFICATION_API}/notifications/${userId}/count?unreadOnly=${unreadOnly}`);
  },

  // Delete notification
  delete: async (notificationId: string) => {
    return apiCall(`${NOTIFICATION_API}/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  },
};

// Workflow Service API
export const workflowAPI = {
  // Bulk assign reports
  bulkAssign: async (reportIds: string[], departmentId: string, assignedTo?: string, dueDays = 7) => {
    return apiCall(`${WORKFLOW_API}/workflows/bulk-assign`, {
      method: 'POST',
      body: JSON.stringify({ reportIds, departmentId, assignedTo, dueDays }),
    });
  },

  // Get templates
  getTemplates: async () => {
    return apiCall(`${WORKFLOW_API}/workflows/templates`);
  },

  // Send template message
  sendTemplate: async (reportId: string, userId: string, templateType: string, customVars?: any) => {
    return apiCall(`${WORKFLOW_API}/workflows/send-template`, {
      method: 'POST',
      body: JSON.stringify({ reportId, userId, templateType, customVars }),
    });
  },

  // Get department dashboard
  getDashboard: async (departmentId: string) => {
    return apiCall(`${WORKFLOW_API}/workflows/dashboard/${departmentId}`);
  },

  // Check SLA
  checkSLA: async () => {
    return apiCall(`${WORKFLOW_API}/workflows/check-sla`, {
      method: 'POST',
    });
  },

  // Update assignment status
  updateAssignment: async (assignmentId: string, status: string, notes?: string) => {
    return apiCall(`${WORKFLOW_API}/workflows/assignments/${assignmentId}/update`, {
      method: 'POST',
      body: JSON.stringify({ status, notes }),
    });
  },
};

// Health check for all services
export const healthCheck = {
  checkAll: async () => {
    const [auth, notification, workflow] = await Promise.all([
      fetch(`${AUTH_API}/`).then(r => r.json()).catch(() => ({ ok: false })),
      fetch(`${NOTIFICATION_API}/`).then(r => r.json()).catch(() => ({ ok: false })),
      fetch(`${WORKFLOW_API}/`).then(r => r.json()).catch(() => ({ ok: false })),
    ]);
    return { auth, notification, workflow };
  },
};

export default { authAPI, notificationAPI, workflowAPI, healthCheck };
