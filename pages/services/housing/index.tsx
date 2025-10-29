import React from 'react';
import { useRouter } from '../../../routing/RouterContext';
import servicesMetadata from '../../../services-metadata.json';

const HousingOverview: React.FC = () => {
  const { navigate } = useRouter();
  const svc = (servicesMetadata as any).services?.housing;

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-4">
          <button onClick={() => navigate('/services')} className="inline-block text-sm font-semibold bg-glow-blue/10 text-glow-blue px-3 py-1 rounded-md hover:bg-glow-blue/20">Back to Services</button>
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">{svc.title}</h1>
        <p className="text-light-slate mb-6">{svc.description}</p>

        {svc.sections && Object.entries(svc.sections).map(([key, s]: any) => (
          <div key={key} className="mb-6 p-6 bg-primary-darker rounded border border-white/5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-xl font-semibold text-white">{s.title}</div>
                {s.portal && <div className="text-sm text-light-slate">Portal: {s.portal}</div>}
              </div>
              <div className="flex gap-2">
                {s.portalUrl && <a href={s.portalUrl} target="_blank" rel="noreferrer" className="px-3 py-2 bg-white/5 rounded text-glow-blue">Open Portal</a>}
                <button onClick={() => navigate(`/services/housing/${key}`)} className="px-3 py-2 bg-glow-blue rounded text-white">Open</button>
                <button onClick={() => navigate('/services/housing/Apply')} className="px-3 py-2 bg-white/5 rounded text-white">Apply</button>
              </div>
            </div>
            <ul className="list-disc ml-5 text-light-slate">
              {(s.tasks || s.steps || []).map((t: string, i: number) => <li key={i} className="mb-1">{t}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HousingOverview;
