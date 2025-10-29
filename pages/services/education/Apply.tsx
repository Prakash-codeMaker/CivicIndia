import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { addApplication } from '../../../lib/serviceStore';
import { useRouter } from '../../../routing/RouterContext';

const ApplyEducation: React.FC = () => {
  const { user } = useUser();
  const { navigate } = useRouter();
  const [school, setSchool] = useState('');
  const [program, setProgram] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submit = async (e: React.FormEvent) => { e.preventDefault(); if (!user) { alert('Sign in required'); return; } setIsSubmitting(true); try { const item = await addApplication({ userId: user.id, service: 'education', data:{school,program} }); sessionStorage.setItem('newApplicationId', item.id); navigate('/services/education/confirmation'); } finally { setIsSubmitting(false); } };
  return (<div className="py-16"><div className="container"><h1>Education Application</h1><form onSubmit={submit}><input value={school} onChange={e=>setSchool(e.target.value)} placeholder="School"/><input value={program} onChange={e=>setProgram(e.target.value)} placeholder="Program"/><button disabled={isSubmitting}>Submit</button></form></div></div>);
};
export default ApplyEducation;
