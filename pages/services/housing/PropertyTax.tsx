import React from 'react';
import { useRouter } from '../../../routing/RouterContext';
import servicesMetadata from '../../../services-metadata.json';

const PropertyTaxPage: React.FC = () => {
  const { navigate } = useRouter();
  const meta = (servicesMetadata as any).services?.housing?.sections?.propertyTax;

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-4">
          <button onClick={() => navigate('/services/housing')} className="inline-block text-sm font-semibold bg-glow-blue/10 text-glow-blue px-3 py-1 rounded-md hover:bg-glow-blue/20">Back to Housing</button>
        </div>
        <h1 className="text-2xl font-bold text-white mb-4">{meta?.title ?? 'Property Tax'}</h1>
        <div className="grid gap-3">
          {(meta?.tasks || []).map((t: string, i: number) => (
            <div key={i} className="p-3 bg-primary-darker rounded border border-white/5 text-sm text-light-slate">{t}</div>
          ))}
        </div>

        <div className="mt-6">
          <button onClick={() => navigate('/services/housing/Apply')} className="px-4 py-2 bg-glow-blue rounded text-white">Pay Property Tax</button>
        </div>
      </div>
    </div>
  );
};

export default PropertyTaxPage;
