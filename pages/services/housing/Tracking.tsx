import React, { useEffect, useState } from 'react';
import { useRouter } from '../../../routing/RouterContext';
import servicesMetadata from '../../../services-metadata.json';
import { getApplicationsForUser } from '../../../lib/serviceStore';
import { useUser } from '@clerk/clerk-react';

const TrackingPage: React.FC = () => {
  const { user } = useUser();
  const { navigate } = useRouter();
  const [apps, setApps] = useState<any[] | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await getApplicationsForUser(user?.id || 'guest');
        if (mounted) setApps(list);
      } catch (e) {
        if (mounted) setApps([]);
      }
    })();
    return () => { mounted = false; };
  }, [user]);

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-4">
          <button onClick={() => navigate('/services/housing')} className="inline-block text-sm font-semibold bg-glow-blue/10 text-glow-blue px-3 py-1 rounded-md hover:bg-glow-blue/20">Back to Housing</button>
        </div>
        <h1 className="text-2xl font-bold text-white mb-4">Application Tracking</h1>
        {apps === null ? (
          <div className="text-light-slate">Loading...</div>
        ) : apps.length === 0 ? (
          <div className="text-light-slate">You have no applications. Use the Services page to apply.</div>
        ) : (
          <div className="grid gap-3">
            {apps.map((a: any) => (
              <div key={a.id} className="p-3 bg-primary-darker rounded border border-white/5">
                <div className="text-sm text-white font-semibold">{a.service} — {a.status}</div>
                <div className="text-xs text-light-slate">ID: {a.id} • Submitted {new Date(a.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackingPage;
