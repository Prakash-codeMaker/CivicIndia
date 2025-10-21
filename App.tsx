import React from 'react';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import AuthPage from './pages/AuthPage';
import MainApp from './MainApp';

const App: React.FC = () => {
  return (
    <>
      <SignedIn>
        <MainApp />
      </SignedIn>
      <SignedOut>
        <AuthPage />
      </SignedOut>
    </>
  );
};

export default App;