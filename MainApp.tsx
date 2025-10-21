import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ReportPage from './pages/Report';
import ServicesPage from './pages/ServicesPage';
import EngagePage from './pages/EngagePage';
import TrackPage from './pages/TrackPage';
import TransparencyPage from './pages/TransparencyPage';
import EmergencyPage from './pages/EmergencyPage';
import PayBillsPage from './pages/PayBillsPage';
import VerificationPage from './pages/VerificationPage';
import ProfilePage from './pages/ProfilePage';
import { RouterContext } from './routing/RouterContext';

const routes: { [key: string]: React.ComponentType } = {
  '/': HomePage,
  '/report': ReportPage,
  '/services': ServicesPage,
  '/engage': EngagePage,
  '/track': TrackPage,
  '/transparency': TransparencyPage,
  '/emergency': EmergencyPage,
  '/pay-bills': PayBillsPage,
  '/verify-email': VerificationPage,
  '/profile': ProfilePage,
};

const MainApp: React.FC = () => {
  const [currentPath, setCurrentPath] = useState('/');

  useEffect(() => {
    const handleHashChange = () => {
      const path = window.location.hash.slice(1) || '/';
      setCurrentPath(path);
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', handleHashChange, false);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange, false);
  }, []);

  const navigate = useCallback((path: string) => {
    window.location.hash = '#' + path;
  }, []);
  
  const CurrentPage = routes[currentPath] || routes['/'];

  return (
    <RouterContext.Provider value={{ navigate }}>
      <div className="bg-dark-navy min-h-screen text-white font-sans">
        <Header />
        <main className="min-h-[calc(100vh-8rem)]">
          <CurrentPage />
        </main>
        <Footer />
      </div>
    </RouterContext.Provider>
  );
};

export default MainApp;
