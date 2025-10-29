import React from 'react';
import { useRouter } from '../../../routing/RouterContext';
import servicesMetadata from '../../../services-metadata.json';

const UtilitiesOverview: React.FC = () => {
  const { navigate } = useRouter();
  const svc = (servicesMetadata as any).services?.utilities;

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-4">
          <button onClick={() => navigate('/services')} className="inline-block text-sm font-semibold bg-glow-blue/10 text-glow-blue px-3 py-1 rounded-md hover:bg-glow-blue/20">Back to Services</button>
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">{svc.title}</h1>
        <p className="text-light-slate mb-6">{svc.description}</p>
        {svc.steps && (
          <div className="mb-6 p-6 bg-primary-darker rounded border border-white/5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-xl font-semibold text-white">Quick actions</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => navigate('/services/utilities/Apply')} className="px-3 py-2 bg-glow-blue rounded text-white">New Connection</button>
                <button onClick={() => navigate('/services/utilities/confirmation')} className="px-3 py-2 bg-white/5 rounded text-white">Pay Bills</button>
              </div>
            </div>
            <ul className="list-disc ml-5 text-light-slate">
              {svc.steps.map((t: string, i: number) => <li key={i}>{t}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default UtilitiesOverview;
