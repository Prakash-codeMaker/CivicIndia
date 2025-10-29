import React from 'react';
import Link from '../routing/Link';

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="bg-primary-dark p-6 rounded-lg border border-white/10 shadow-lg hover:border-glow-blue/50 hover:shadow-glow-blue/20 transition-all duration-300">
    <div className="text-glow-blue mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-light-slate">{description}</p>
  </div>
);

const TestimonialCard = ({ name, story, image, metric }: { name: string, story: string, image: string, metric: string }) => (
    <div className="bg-primary-dark p-8 rounded-lg border border-white/10 shadow-lg text-center h-full flex flex-col justify-center">
        <img className="h-20 w-20 rounded-full object-cover mx-auto mb-4" src={image} alt={name} />
        <blockquote className="text-gray-300 italic">"{story}"</blockquote>
        <cite className="mt-4 not-italic font-semibold text-white">{name}</cite>
        <div className="mt-2 text-sm font-bold text-green-400 bg-green-500/10 px-3 py-1 rounded-full self-center">
            {metric}
        </div>
    </div>
);


const HomePage: React.FC = () => {

  const handleLearnMoreClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <div className="relative text-center py-24 sm:py-32 lg:py-48">
          <div className="absolute inset-0 bg-dark-navy z-0">
              <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-dark-navy"></div>
              <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-glow-blue/20 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-7xl">
                  Turn Your Voice <br /> Into <span className="text-glow-blue">Civic Action</span>
              </h1>
              <p className="mt-6 max-w-2xl mx-auto text-lg text-light-slate">
                  Report issues, track progress, and collaborate with your community to build a better, more responsive city.
              </p>
                                            <div className="mt-10 flex justify-center gap-x-6">
                                        <Link to="/report" className="bg-glow-blue text-white px-8 py-3 rounded-md text-base font-semibold hover:opacity-90 transition-opacity">
                                            Report an Issue
                                        </Link>
+
                                        <a href="#features" onClick={handleLearnMoreClick} className="text-white px-8 py-3 rounded-md text-base font-semibold ring-1 ring-inset ring-white/20 hover:ring-white/40 transition-shadow">
                                            Learn More
                                        </a>
+
                                        {/* Temporary debug button - remove after reproduction */}
+
                                        <button
                                            id="debug-navigate-report"
                                            onClick={() => {
                                                // use a direct window.location.hash change to replicate Link behavior as well as programmatic navigate
                                                // eslint-disable-next-line no-console
                                                console.debug('[Debug] programmatic navigate -> /report');
                                                window.location.hash = '/report';
                                            }}
                                            className="hidden"
                                        >
                                            Debug: Go to Report
                                        </button>
+
                                    </div>
          </div>
      </div>
      
      {/* Features Section */}
      <div id="features" className="py-24 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                <p className="font-semibold text-glow-blue">EMPOWERING CITIZENS</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Everything You Need to Make an Impact</h2>
                <p className="mt-6 max-w-2xl mx-auto text-lg leading-8 text-light-slate">
                    Our platform provides powerful, easy-to-use tools for every citizen.
                </p>
            </div>
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                <FeatureCard 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                    title="Smart Reporting"
                    description="Instantly report issues using photos, videos, or voice notes. Our AI helps categorize and route your complaint to the right department."
                />
                 <FeatureCard 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                    title="Live Tracking"
                    description="Get real-time updates on your complaint's status, from acknowledgement to resolution. No more guessing."
                />
                 <FeatureCard 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h6l2-2h2v2z" /></svg>}
                    title="Community Engagement"
                    description="Join discussions, vote on local projects, and collaborate with neighbors to collectively improve your community."
                />
            </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-24 sm:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                  <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">More Than an App, A Movement For Change</h2>
                  <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-light-slate">
                      Hear from citizens who are making a real difference in their neighborhoods.
                  </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <TestimonialCard
                        name="Mohan Kumar"
                        story="The huge pothole on my street was a menace. I reported it on CivicIndia, and it was fixed in just 48 hours! Incredible response."
                        image="https://picsum.photos/id/1018/100/100"
                        metric="Pothole fixed in 48 hours"
                    />
                    <TestimonialCard
                        name="Anjali Sharma"
                        story="Our park was neglected. Through the community discussion forum, we proposed a renovation plan which was approved and implemented."
                        image="https://picsum.photos/id/1025/100/100"
                        metric="Park renovated via vote"
                    />
                    <TestimonialCard
                        name="Ravi Singh"
                        story="I needed help with a health scheme application. The platform made the process so simple and transparent. We got approval in a week."
                        image="https://picsum.photos/id/1027/100/100"
                        metric="Scheme approved in 7 days"
                    />
              </div>
          </div>
      </div>

    </div>
  );
};

export default HomePage;