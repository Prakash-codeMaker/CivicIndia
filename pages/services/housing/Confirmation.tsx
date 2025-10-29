import React, { useEffect, useState } from 'react';
import { getApplicationById } from '../../../lib/serviceStore';

const Confirmation: React.FC = () => {
  const [app, setApp] = useState<any | null>(null);
  useEffect(() => {
    const id = sessionStorage.getItem('newApplicationId');
    if (!id) return;
    getApplicationById(id).then(setApp);
    try { sessionStorage.removeItem('newApplicationId'); } catch (e) {}
  }, []);

  if (!app) return (<div className="py-16"><div className="container mx-auto">No recent application found.</div></div>);

  return (
    <div className="py-16">
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold">Application Submitted</h1>
        <p className="mt-2 text-light-slate">Your application (ID: {app.id}) has been submitted. Status: {app.status}</p>
      </div>
    </div>
  );
};

export default Confirmation;
