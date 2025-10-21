import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ClerkProvider } from '@clerk/clerk-react';

// IMPORTANT: Replace with your Clerk Publishable Key
// FIX: Add type annotation to prevent literal type inference which causes a comparison error.
const PUBLISHABLE_KEY: string = "pk_test_d29ya2luZy1zYXR5ci03MS5jbGVyay5hY2NvdW50cy5kZXYk";

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

if (!PUBLISHABLE_KEY || PUBLISHABLE_KEY === 'YOUR_CLERK_PUBLISHABLE_KEY') {
    rootElement.innerHTML = `
        <div style="font-family: sans-serif; background-color: #050715; color: #f87171; padding: 2rem; border-radius: 0.5rem; text-align: center; height: 100vh; display: flex; align-items: center; justify-content: center;">
            <div style="max-width: 450px; border: 1px solid #f87171; padding: 2rem; border-radius: 0.5rem;">
                <h1 style="font-size: 1.5rem; font-weight: bold;">Configuration Required</h1>
                <p style="margin-top: 1rem; color: #cbd5e1;">To run this application, you need to set your Clerk Publishable Key.</p>
                <div style="margin-top: 1.5rem; text-align: left; background-color: #132c49; padding: 1.5rem; border-radius: 0.5rem; font-size: 0.9rem; line-height: 1.6;">
                    <p style="color: #94a3b8; margin-bottom: 1rem;">1. Go to your Clerk Dashboard and copy your <strong>Publishable Key</strong>.</p>
                    <p style="color: #94a3b8;">2. Open the <code>index.tsx</code> file and replace the placeholder <code>'YOUR_CLERK_PUBLISHABLE_KEY'</code> with your actual key.</p>
                </div>
            </div>
        </div>
    `;
} else {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
          <App />
        </ClerkProvider>
      </React.StrictMode>
    );
}