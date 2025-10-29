import React from 'react';
import { useRouter } from '../routing/RouterContext';
import servicesMetadata from '../services-metadata.json';

const ServiceCard = ({ icon, title, description, href, action }: { icon: React.ReactNode, title: string, description: string, href: string, action?: string }) => {
    const { navigate } = useRouter();
    const handleActivate = () => navigate(href);
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleActivate();
        }
    };

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={handleActivate}
            onKeyDown={handleKeyDown}
            className="bg-primary-dark p-8 rounded-lg border border-white/10 shadow-lg hover:border-glow-blue/50 transform hover:-translate-y-1 transition-all duration-300 h-full flex flex-col cursor-pointer"
            aria-label={`${title} — ${action ?? 'Learn more'}`}
        >
            <div className="text-glow-blue mb-4 h-12 w-12 flex items-center justify-center bg-glow-blue/10 rounded-lg">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
            <p className="text-light-slate mb-6 text-sm leading-relaxed flex-grow">{description}</p>
            <div className="mt-auto w-full">
                <button onClick={(e) => { e.stopPropagation(); handleActivate(); }} className="w-full bg-primary-dark text-glow-blue px-4 py-2 rounded-md text-sm font-semibold border border-glow-blue hover:bg-glow-blue hover:text-white transition-colors">
                    {action ?? 'Learn More'}
                </button>
            </div>
        </div>
    );
};

const ServicesPage: React.FC = () => {
    const { navigate } = useRouter();
    const servicesList: Array<any> = Object.entries((servicesMetadata as any).services || {}).map(([key, val]) => ({
        slug: key,
        ...((val as any) || {})
    }));

    

    return (
        <div className="py-24 sm:py-32">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <p className="font-semibold text-glow-blue">UNIFIED SERVICE DIRECTORY</p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Access All Services in One Place</h1>
                    <p className="mt-6 max-w-2xl mx-auto text-lg leading-8 text-light-slate">
                        Find, apply for, and track essential citizen services and government schemes without hassle.
                    </p>
                </div>
                <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {servicesList.map((service) => (
                        <div key={service.slug} className="relative">
                            <div className="h-full flex flex-col">
                                <div className="bg-primary-dark p-6 rounded-lg border border-white/10 shadow-lg hover:border-glow-blue/50 transform hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                                    <div className="text-glow-blue mb-4 h-10 w-10 flex items-center justify-center bg-glow-blue/10 rounded-lg">
                                        {/* placeholder icon */}
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-1">{service.title}</h3>
                                    <p className="text-light-slate mb-4 text-sm leading-relaxed flex-grow">{service.description}</p>
                                    <div className="flex gap-2">
                                        <button onClick={() => navigate(`/services/${service.slug}`)} className="flex-1 bg-primary-dark text-glow-blue px-3 py-2 rounded-md text-sm font-semibold border border-glow-blue hover:bg-glow-blue hover:text-white transition-colors">Open</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ServicesPage;
