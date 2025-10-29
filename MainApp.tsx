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
import HousingPage from './pages/HousingPage';
import UtilitiesPage from './pages/UtilitiesPage';
import HealthPage from './pages/HealthPage';
import EducationPage from './pages/EducationPage';
import EmploymentPage from './pages/EmploymentPage';
import FinancialAssistancePage from './pages/FinancialAssistancePage';
import AdminPage from './pages/AdminPage';
import DepartmentsPage from './pages/DepartmentsPage';
import DepartmentsDashboard from './pages/DepartmentsDashboard';
import AssignmentDetail from './pages/AssignmentDetail';
// Use the newly added service overview pages for rich task listings
import HousingOverview from './pages/services/housing/index';
import UtilitiesOverview from './pages/services/utilities/index';
import HealthOverview from './pages/services/health/index';
import EducationOverview from './pages/services/education/index';
import EmploymentOverview from './pages/services/employment/index';
import FinancialOverview from './pages/services/financial-assistance/index';
import ApplyHousing from './pages/services/housing/Apply';
import ApplyHousingConfirmation from './pages/services/housing/Confirmation';
import ApplyUtilities from './pages/services/utilities/Apply';
import ApplyUtilitiesConfirmation from './pages/services/utilities/Confirmation';
import ApplyHealth from './pages/services/health/Apply';
import ApplyHealthConfirmation from './pages/services/health/Confirmation';
import ApplyEducation from './pages/services/education/Apply';
import ApplyEducationConfirmation from './pages/services/education/Confirmation';
import ApplyEmployment from './pages/services/employment/Apply';
import ApplyEmploymentConfirmation from './pages/services/employment/Confirmation';
import ApplyFinancialAssistance from './pages/services/financial-assistance/Apply';
import ApplyFinancialAssistanceConfirmation from './pages/services/financial-assistance/Confirmation';
import { RouterContext } from './routing/RouterContext';
import AiChatWidget from './components/AiChatWidget';

const routes: { [key: string]: React.ComponentType } = {
  '/': HomePage,
  '/report': ReportPage,
  '/services': ServicesPage,
  '/services/housing': HousingOverview,
  '/services/housing/apply': ApplyHousing,
  '/services/housing/confirmation': ApplyHousingConfirmation,
  '/services/utilities': UtilitiesOverview,
  '/services/utilities/apply': ApplyUtilities,
  '/services/utilities/confirmation': ApplyUtilitiesConfirmation,
  '/services/health': HealthOverview,
  '/services/health/apply': ApplyHealth,
  '/services/health/confirmation': ApplyHealthConfirmation,
  '/services/education': EducationOverview,
  '/services/education/apply': ApplyEducation,
  '/services/education/confirmation': ApplyEducationConfirmation,
  '/services/employment': EmploymentOverview,
  '/services/employment/apply': ApplyEmployment,
  '/services/employment/confirmation': ApplyEmploymentConfirmation,
  '/services/financial-assistance': FinancialOverview,
  '/services/financial-assistance/apply': ApplyFinancialAssistance,
  '/services/financial-assistance/confirmation': ApplyFinancialAssistanceConfirmation,
  '/engage': EngagePage,
  '/track': TrackPage,
  '/transparency': TransparencyPage,
  '/emergency': EmergencyPage,
  '/pay-bills': PayBillsPage,
  '/verify-email': VerificationPage,
  '/profile': ProfilePage,
  '/admin': AdminPage,
  '/departments': DepartmentsPage,
  '/dashboard': DepartmentsDashboard,
  '/assignment/:id': AssignmentDetail,
};

const MainApp: React.FC = () => {
  const [currentPath, setCurrentPath] = useState('/');

  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash;
      const path = rawHash.slice(1) || '/';
      // Debug logging to help diagnose blank page navigation issues
      // Visible in the browser console when devtools are open.
      // eslint-disable-next-line no-console
      console.debug('[Router] hashchange detected', { rawHash, path });
      setCurrentPath(path);
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', handleHashChange, false);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange, false);
  }, []);

  const navigate = useCallback((path: string) => {
    // Normalize the incoming path so we never end up with a double-hash like "##/report".
    // Accept values like '/report', 'report', or '#/report' and convert to '/report'
    let normalized = path;
    if (normalized.startsWith('#')) {
      normalized = normalized.slice(1);
    }
    if (!normalized.startsWith('/')) {
      normalized = '/' + normalized;
    }
    // Assigning a value without an extra leading '#' will result in URL ending with '#/...'
    // Debug out the navigation target.
    // eslint-disable-next-line no-console
    console.debug('[Router] navigate ->', { input: path, normalized });
    window.location.hash = normalized;
  }, []);
  
  const CurrentPage = routes[currentPath] || routes['/'];

  // Render pages inside a safe try/catch so a render-time exception doesn't leave
  // the app showing a blank screen. Any caught error will be logged and displayed.
  let pageElement: React.ReactNode = null;
  try {
    pageElement = <CurrentPage />;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[Router] error rendering page for', currentPath, err);
    pageElement = (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto bg-primary-dark/70 p-8 rounded-md border border-white/10">
          <h2 className="text-2xl font-bold text-red-400">An error occurred</h2>
          <p className="mt-4 text-light-slate">There was a problem rendering this page. Check the console for details.</p>
        </div>
      </div>
    );
  }

  return (
    <RouterContext.Provider value={{ navigate }}>
      <div className="bg-dark-navy min-h-screen text-white font-sans">
        <Header />
        <main className="min-h-[calc(100vh-8rem)]">
          {pageElement}
        </main>
        <Footer />
        <AiChatWidget />
      </div>
    </RouterContext.Provider>
  );
};

export default MainApp;
