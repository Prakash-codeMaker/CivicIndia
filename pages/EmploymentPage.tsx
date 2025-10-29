import React from 'react';
import Link from '../routing/Link';

const EmploymentPage: React.FC = () => (
  <div className="py-24 sm:py-32">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-white mb-4">Employment</h1>
      <p className="text-light-slate mb-6">Skill training, job listings, and employment guidance resources.</p>
      <Link to="/services" className="inline-block text-sm font-semibold bg-glow-blue/10 text-glow-blue px-3 py-1 rounded-md hover:bg-glow-blue/20">Back to Services</Link>
    </div>
  </div>
);

export default EmploymentPage;
