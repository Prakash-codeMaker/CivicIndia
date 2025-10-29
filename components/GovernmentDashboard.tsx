import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  userRole?: 'Admin' | 'Department Head' | 'Field Worker';
}

const COLORS = ['#3B82F6', '#EF4444', '#F59E0B', '#10B981'];

const GovernmentDashboard: React.FC<DashboardProps> = ({ userRole = 'Admin' }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState({
    totalReports: 1250,
    pending: 320,
    resolved: 850,
    overdue: 80,
  });

  // Mock data for charts
  const departmentPerformance = [
    { name: 'PWD', resolved: 245, pending: 45, overdue: 12 },
    { name: 'Municipal', resolved: 189, pending: 67, overdue: 23 },
    { name: 'Health', resolved: 156, pending: 34, overdue: 8 },
    { name: 'Education', resolved: 98, pending: 56, overdue: 15 },
    { name: 'Police', resolved: 112, pending: 43, overdue: 10 },
    { name: 'Revenue', resolved: 50, pending: 75, overdue: 12 },
  ];

  const trendData = [
    { month: 'Jan', reports: 120, resolved: 95 },
    { month: 'Feb', reports: 180, resolved: 145 },
    { month: 'Mar', reports: 160, resolved: 130 },
    { month: 'Apr', reports: 210, resolved: 175 },
    { month: 'May', reports: 240, resolved: 200 },
    { month: 'Jun', reports: 210, resolved: 190 },
  ];

  const priorityData = [
    { name: 'Critical', value: 45, color: '#EF4444' },
    { name: 'High', value: 125, color: '#F59E0B' },
    { name: 'Medium', value: 450, color: '#3B82F6' },
    { name: 'Low', value: 630, color: '#10B981' },
  ];

  const recentActivities = [
    { id: 1, action: 'New report submitted', type: 'Pothole on Main Road', time: '2 minutes ago', status: 'pending' },
    { id: 2, action: 'Report resolved', type: 'Water leakage complaint', time: '15 minutes ago', status: 'resolved' },
    { id: 3, action: 'Report assigned', type: 'Streetlight repair', time: '1 hour ago', status: 'in-progress' },
    { id: 4, action: 'Report resolved', type: 'Garbage collection', time: '2 hours ago', status: 'resolved' },
    { id: 5, action: 'New report submitted', type: 'Park maintenance', time: '3 hours ago', status: 'pending' },
  ];

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'reports', label: 'Reports', icon: '📋' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'department', label: 'Department', icon: '🏛️' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  const canAccessAdmin = userRole === 'Admin';
  const canAccessDepartmentHead = userRole === 'Admin' || userRole === 'Department Head';

  const handleLogout = () => {
    localStorage.removeItem('gov_session');
    window.location.reload();
  };

  const handleExport = () => {
    alert('Export functionality - Generate PDF/Excel report');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold">Gov Portal</h1>
          <p className="text-sm text-gray-400 mt-1">{userRole}</p>
        </div>

        <nav className="flex-1 p-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                activeSection === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-gray-800 transition-colors"
          >
            <span className="text-xl">🚪</span>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
            </h2>
            <p className="text-sm text-gray-600">
              Welcome back! Here's what's happening today.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <span className="text-xl">🔔</span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Info */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {userRole.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-gray-900">Government User</p>
                <p className="text-sm text-gray-500">{userRole}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Reports</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalReports}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📋</span>
                    </div>
                  </div>
                  <p className="text-sm text-green-600 mt-2">+12% from last month</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Pending</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">⏳</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Require attention</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Resolved</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.resolved}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">✅</span>
                    </div>
                  </div>
                  <p className="text-sm text-green-600 mt-2">68% resolution rate</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Overdue</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.overdue}</p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">⚠️</span>
                    </div>
                  </div>
                  <p className="text-sm text-red-600 mt-2">Action required</p>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trend Chart */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Report Trends</h3>
                    <button
                      onClick={handleExport}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Export
                    </button>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="reports" stroke="#3B82F6" strokeWidth={2} />
                      <Line type="monotone" dataKey="resolved" stroke="#10B981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Priority Distribution */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={priorityData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {priorityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Department Performance & Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Department Performance */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Performance</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={departmentPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="resolved" fill="#10B981" />
                      <Bar dataKey="pending" fill="#F59E0B" />
                      <Bar dataKey="overdue" fill="#EF4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      View All
                    </button>
                  </div>
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-bold">
                            {activity.type.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{activity.action}</p>
                          <p className="text-sm text-gray-600">{activity.type}</p>
                          <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          activity.status === 'resolved' ? 'bg-green-100 text-green-700' :
                          activity.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {activity.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center">
                    <span className="text-3xl mb-2 block">📝</span>
                    <p className="font-medium text-gray-900">New Report</p>
                  </button>
                  <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center">
                    <span className="text-3xl mb-2 block">📊</span>
                    <p className="font-medium text-gray-900">Analytics</p>
                  </button>
                  <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center">
                    <span className="text-3xl mb-2 block">👥</span>
                    <p className="font-medium text-gray-900">Team</p>
                  </button>
                  <button className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-center">
                    <span className="text-3xl mb-2 block">📥</span>
                    <p className="font-medium text-gray-900">Export Data</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Other Sections */}
          {activeSection !== 'dashboard' && (
            <div className="bg-white rounded-lg shadow p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Section
              </h3>
              <p className="text-gray-600">
                This section is under development. Content will be displayed here based on the selected menu item.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default GovernmentDashboard;
