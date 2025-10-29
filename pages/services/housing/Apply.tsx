import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { addApplication } from '../../../lib/serviceStore';
import { useRouter } from '../../../routing/RouterContext';

const ApplyHousing: React.FC = () => {
  const { user } = useUser();
  const { navigate } = useRouter();
  const [name, setName] = useState(user?.fullName || '');
  const [address, setAddress] = useState('');
  const [income, setIncome] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const data = await Promise.all(Array.from(files).map(f => new Promise<string>((res, rej) => {
      const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = rej; r.readAsDataURL(f);
    })));
    setAttachments(prev => [...prev, ...data]);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { alert('Please sign in to submit an application.'); return; }
    setIsSubmitting(true);
    try {
      const item = await addApplication({ userId: user.id, service: 'housing', data: { name, address, income }, attachments });
      sessionStorage.setItem('newApplicationId', item.id);
      navigate('/services/housing/confirmation');
    } catch (err) {
      console.error(err); alert('Failed to submit application');
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-4">Apply for Housing Scheme</h1>
        <form onSubmit={submit} className="space-y-4 max-w-md">
          <label className="block"><span className="text-sm text-gray-300">Full name</span>
            <input value={name} onChange={e=>setName(e.target.value)} className="w-full" /></label>
          <label className="block"><span className="text-sm text-gray-300">Address</span>
            <input value={address} onChange={e=>setAddress(e.target.value)} className="w-full" /></label>
          <label className="block"><span className="text-sm text-gray-300">Household income</span>
            <input value={income} onChange={e=>setIncome(e.target.value)} className="w-full" /></label>
          <label className="block"><span className="text-sm text-gray-300">Attachments</span>
            <input type="file" multiple onChange={e=>handleFiles(e.target.files)} /></label>
          <div>
            <button disabled={isSubmitting} className="px-4 py-2 bg-glow-blue rounded-md text-white">{isSubmitting ? 'Submitting...' : 'Submit Application'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyHousing;
