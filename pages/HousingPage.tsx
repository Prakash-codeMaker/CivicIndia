import React from 'react';
import Link from '../routing/Link';

const HousingPage: React.FC = () => {
  return (
    <div className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-4">Housing & Property Services</h1>
        <p className="text-light-slate mb-6">Apply for housing schemes, pay property taxes, request building permits, and track applications.</p>
        <div className="space-x-2">
          <Link to="/services" className="inline-block text-sm font-semibold bg-glow-blue/10 text-glow-blue px-3 py-1 rounded-md hover:bg-glow-blue/20">Back to Services</Link>
        </div>
      </div>
    </div>
  );
};

export default HousingPage;
