import React, { useState } from 'react';
import GovernmentAuth from '../components/GovernmentAuth';
import GovernmentDashboard from '../components/GovernmentDashboard';

interface AuthData {
  email: string;
  employeeId: string;
  department: string;
  role: string;
  sessionToken: string;
}

const GovernmentPortal: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authData, setAuthData] = useState<AuthData | null>(null);

  const handleAuthSuccess = (data: AuthData) => {
    setAuthData(data);
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <GovernmentAuth onAuthSuccess={handleAuthSuccess} />;
  }

  return <GovernmentDashboard userRole={authData?.role as 'Admin' | 'Department Head' | 'Field Worker'} />;
};

export default GovernmentPortal;
