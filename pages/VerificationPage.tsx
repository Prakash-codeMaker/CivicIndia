import React from 'react';
import Link from '../routing/Link';

const VerificationPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-24 text-center flex flex-col items-center justify-center">
      <div className="bg-primary-dark p-12 rounded-lg border border-white/10 shadow-lg max-w-2xl">
        <div className="text-green-400 mb-4">
          <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-white">Verify Your Email</h1>
        <p className="mt-4 text-lg text-light-slate">
          We've sent a verification link to your email address. Please check your inbox (and spam folder) to complete your registration.
        </p>
        <div className="mt-8">
            <Link to="/" className="bg-glow-blue text-white px-8 py-3 rounded-md text-base font-semibold hover:opacity-90 transition-opacity">
                Back to Home
            </Link>
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;