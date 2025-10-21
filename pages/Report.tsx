import React from 'react';
import ReportIssue from '../components/ReportIssue';

const ReportPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-2">Report an Issue</h1>
        <p className="text-center text-light-slate mb-8">
          Help us improve your city. Please provide as much detail as possible.
        </p>
        <ReportIssue />
      </div>
    </div>
  );
};

export default ReportPage;