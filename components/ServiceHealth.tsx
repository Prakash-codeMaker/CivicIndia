import React, { useEffect, useState } from 'react';
import { healthCheck } from '../lib/api';

const ServiceHealth: React.FC = () => {
  const [health, setHealth] = useState<{ auth: any; notification: any; workflow: any } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const status = await healthCheck.checkAll();
      setHealth(status);
    } catch (error) {
      console.error('Error checking health:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <p className="text-gray-600">Checking service health...</p>
      </div>
    );
  }

  if (!health) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Unable to check service health</p>
      </div>
    );
  }

  const services = [
    { name: 'Auth Service', status: health.auth, port: 5170 },
    { name: 'Notification Service', status: health.notification, port: 5180 },
    { name: 'Workflow Service', status: health.workflow, port: 5190 },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Service Health Status</h3>
      <div className="space-y-3">
        {services.map(service => (
          <div key={service.name} className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <p className="font-medium">{service.name}</p>
              <p className="text-sm text-gray-500">Port: {service.port}</p>
            </div>
            <div className="flex items-center gap-2">
              {service.status?.ok ? (
                <>
                  <span className="text-green-500">●</span>
                  <span className="text-green-600 font-medium">Running</span>
                </>
              ) : (
                <>
                  <span className="text-red-500">●</span>
                  <span className="text-red-600 font-medium">Offline</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={checkHealth}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Refresh Status
      </button>
    </div>
  );
};

export default ServiceHealth;
