import React from 'react';
import Link from '../routing/Link';

const ForumTopicCard = ({ title, author, replies, lastReply, tag }: { title: string, author: string, replies: number, lastReply: string, tag: string }) => (
    <div className="bg-primary-dark p-6 rounded-lg border border-white/10 hover:border-glow-blue/50 transition-colors flex items-center justify-between gap-4">
        <div>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${tag === 'Water' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'}`}>{tag}</span>
            <h4 className="font-bold text-white mt-2">{title}</h4>
            <p className="text-xs text-light-slate mt-1">By {author} • {replies} replies • Last reply {lastReply}</p>
        </div>
        <Link to="/engage" className="flex-shrink-0 text-glow-blue text-sm font-semibold hover:underline">
            View
        </Link>
    </div>
);

const LivePollCard = () => (
    <div className="bg-primary-dark p-8 rounded-lg border border-white/10">
        <h3 className="text-xl font-bold text-white">Live Poll: Park Renovation</h3>
        <p className="text-light-slate mt-2 mb-6 text-sm">Which design should we choose for the new community park in Ward 7?</p>
        <div className="space-y-3">
            <button className="w-full text-left p-3 rounded-md bg-dark-navy border border-gray-600 hover:border-glow-blue transition-colors text-sm">A: Modern Zen Garden</button>
            <button className="w-full text-left p-3 rounded-md bg-dark-navy border border-gray-600 hover:border-glow-blue transition-colors text-sm">B: Expansive Kids Play Area</button>
            <button className="w-full text-left p-3 rounded-md bg-dark-navy border border-gray-600 hover:border-glow-blue transition-colors text-sm">C: Community Sports Facility</button>
        </div>
         <button className="w-full mt-6 bg-glow-blue text-white py-2.5 px-4 rounded-md font-semibold hover:opacity-90 transition-opacity">
            Submit Your Vote
        </button>
    </div>
);

const EventCard = ({ title, date, location }: { title: string, date: string, location: string }) => (
    <div className="bg-primary-dark p-6 rounded-lg border border-white/10 h-full flex flex-col">
        <p className="text-sm font-semibold text-glow-blue">{date}</p>
        <h4 className="font-bold text-white mt-2 flex-grow">{title}</h4>
        <p className="text-xs text-light-slate mt-1">{location}</p>
        <button className="mt-4 w-full bg-primary-dark text-glow-blue px-4 py-2 rounded-md text-sm font-semibold border border-glow-blue hover:bg-glow-blue hover:text-white transition-colors">
            View Details
        </button>
    </div>
);

const EngagePage: React.FC = () => {
    return (
        <div className="py-24 sm:py-32">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <p className="font-semibold text-glow-blue">ENGAGE & INFLUENCE</p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Your Voice Shapes Our City</h1>
                    <p className="mt-6 max-w-2xl mx-auto text-lg leading-8 text-light-slate">
                        Participate in discussions, vote on key issues, and collaborate to build a better community.
                    </p>
                </div>

                <div className="mt-20 grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                    <div className="lg:col-span-2 space-y-8">
                        <h2 className="text-2xl font-bold text-white">Active Discussions</h2>
                        <div className="space-y-4">
                            <ForumTopicCard title="Frequent power outages in Sector 12" author="A. Sharma" replies={42} lastReply="2h ago" tag="Utilities" />
                            <ForumTopicCard title="Suggestion for new waste collection schedule" author="R. Patel" replies={18} lastReply="5h ago" tag="Sanitation" />
                            <ForumTopicCard title="Need for speed breakers near the public school" author="M. Khan" replies={31} lastReply="1d ago" tag="Infrastructure" />
                            <ForumTopicCard title="Ideas for the upcoming community festival" author="P. Verma" replies={25} lastReply="2d ago" tag="Community" />
                        </div>
                    </div>

                    <div className="space-y-8">
                         <h2 className="text-2xl font-bold text-white">Have Your Say</h2>
                        <LivePollCard />
                    </div>
                </div>
                
                <div className="mt-24">
                    <h2 className="text-3xl font-bold text-white text-center mb-12">Upcoming Town Halls & Events</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                       <EventCard title="Quarterly Budget Meeting: Ward 7" date="Oct 28, 2024" location="Community Hall" />
                       <EventCard title="Town Hall on Water Supply Issues" date="Nov 05, 2024" location="Online via Zoom" />
                       <EventCard title="City Beautification Drive" date="Nov 12, 2024" location="Meet at City Park" />
                       <EventCard title="Open Forum with the Mayor" date="Nov 20, 2024" location="Municipal Corporation Office" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EngagePage;