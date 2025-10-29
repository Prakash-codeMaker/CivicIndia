import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { addApplication } from '../../../lib/serviceStore';
import { useRouter } from '../../../routing/RouterContext';

const ApplyHealth: React.FC = () => {
  const { user } = useUser();
  const { navigate } = useRouter();
  const [clinic, setClinic] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { alert('Sign in required'); return; }
    setIsSubmitting(true);
    try { const item = await addApplication({ userId: user.id, service: 'health', data: { clinic, reason } }); sessionStorage.setItem('newApplicationId', item.id); navigate('/services/health/confirmation'); } catch (e) { console.error(e); } finally { setIsSubmitting(false); }
  };

  return (<div className="py-16"><div className="container"><h1>Health Appointment Request</h1><form onSubmit={submit}><input value={clinic} onChange={e=>setClinic(e.target.value)} placeholder="Preferred clinic"/><input value={reason} onChange={e=>setReason(e.target.value)} placeholder="Reason"/><button disabled={isSubmitting}>Request</button></form></div></div>);
};

export default ApplyHealth;
