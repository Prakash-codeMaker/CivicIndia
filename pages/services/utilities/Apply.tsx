import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { addApplication } from '../../../lib/serviceStore';
import { useRouter } from '../../../routing/RouterContext';

const ApplyUtilities: React.FC = () => {
  const { user } = useUser();
  const { navigate } = useRouter();
  const [connectionType, setConnectionType] = useState('water');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { alert('Please sign in to submit an application.'); return; }
    setIsSubmitting(true);
    try {
      const item = await addApplication({ userId: user.id, service: 'utilities', data: { connectionType, address } });
      sessionStorage.setItem('newApplicationId', item.id);
      navigate('/services/utilities/confirmation');
    } catch (err) { console.error(err); alert('Failed to submit'); } finally { setIsSubmitting(false); }
  };

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-4">Apply for Utility Connection</h1>
        <form onSubmit={submit} className="space-y-4 max-w-md">
          <label>Connection Type
            <select value={connectionType} onChange={e=>setConnectionType(e.target.value)}>
              <option value="water">Water</option>
              <option value="electricity">Electricity</option>
              <option value="gas">Gas</option>
            </select>
          </label>
          <label>Address<input value={address} onChange={e=>setAddress(e.target.value)} className="w-full"/></label>
          <button disabled={isSubmitting} className="px-4 py-2 bg-glow-blue text-white rounded">{isSubmitting?'Submitting...':'Submit'}</button>
        </form>
      </div>
    </div>
  );
};

export default ApplyUtilities;
