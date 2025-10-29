import React, { useEffect, useState } from 'react';
import Link from '../routing/Link';
import { useUser } from '@clerk/clerk-react';
import { getReportsForUser, subscribe, ReportItem, deleteReport } from '../lib/reportStore';
import ServiceHealth from '../components/ServiceHealth';

const ProfilePage: React.FC = () => {
    const { user } = useUser();

    if (!user) {
        return (
            <div className="py-24 text-center">
                <p>Loading profile...</p>
            </div>
        );
    }

    const [reports, setReports] = useState<ReportItem[]>([]);
    const [displayName, setDisplayName] = useState(user.fullName || '');

    useEffect(() => {
        if (!user) return;
        const load = async () => {
            const res = await getReportsForUser(user.id);
            setReports(res || []);
        };
        load();
        const unsub = subscribe(() => {
            load();
        });
        return unsub;
    }, [user]);

    useEffect(() => {
        // load persisted display name override if any
        try {
            const v = localStorage.getItem('profile:displayName');
            if (v) setDisplayName(v);
        } catch (e) {}
    }, []);

    const handleSaveName = () => {
        try {
            localStorage.setItem('profile:displayName', displayName);
            // optionally show a toast - for now just console
            console.log('Display name saved');
        } catch (e) {
            console.error('Failed to save display name', e);
        }
    };

    const handleDeleteReport = async (id: string) => {
        if (!confirm('Delete this report? This action cannot be undone.')) return;
        try {
            await deleteReport(id);
            // reload
            const res = await getReportsForUser(user.id);
            setReports(res || []);
        } catch (e) {
            console.error('Failed to delete report', e);
            alert('Could not delete report.');
        }
    };

    const activities = reports.length > 0 ? reports.map(r => ({
        icon: 'megaphone',
        text: `Reported: "${r.issueType}" — ${r.status}`,
        time: new Date(r.createdAt).toLocaleString(),
    })) : [
        { icon: 'megaphone', text: 'Reported an issue: "Broken streetlight on Elm St."', time: '2 hours ago' },
        { icon: 'chat', text: 'Commented on discussion: "New waste collection schedule"', time: '1 day ago' },
        { icon: 'check', text: 'Your report "Pothole on Main St." was resolved.', time: '3 days ago' },
        { icon: 'vote', text: 'Voted in poll: "Park Renovation Design"', time: '4 days ago' },
        { icon: 'file', text: 'Applied for "Housing Scheme"', time: '1 week ago' },
    ];

    const achievements = [
        { icon: 'star', name: 'First Report' },
        { icon: 'users', name: 'Community Helper' },
        { icon: 'sparkles', name: 'Idea Initiator' },
        { icon: 'shield-check', name: 'Civic Guardian' },
        { icon: 'trending-up', name: 'Top Contributor' },
        { icon: 'eye', name: 'Issue Spotter' },
    ];

    const alerts = [
        { title: 'Water supply schedule updated for your area.', type: 'info' },
        { title: 'Garbage collection reminder for tomorrow morning.', type: 'reminder' },
        { 
            title: 'You are now eligible for a new Health Scheme.', 
            type: 'success',
            action: {
                text: 'Apply Now',
                link: '/services'
            }
        },
    ];

    const iconMap: { [key: string]: React.ReactNode } = {
        megaphone: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-2.236 9.168-5.514C18.378 1.282 18.735 1 19 1s.622.282.832.486M21 11.436c.52.26.94.596 1.306.992M21 15.436c.366.396.69.84.992 1.306" /></svg>,
        chat: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
        check: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        vote: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>,
        file: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
        star: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
        users: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
        sparkles: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
        'shield-check': <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944a11.955 11.955 0 019-2.606z" /></svg>,
        'trending-up': <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
        'eye': <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
    };

    const totalReports = reports.length;
    const statusCounts: Record<string, number> = reports.reduce((acc, r) => {
        acc[r.status] = (acc[r.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const impactScore = 1000 + (statusCounts['resolved'] || 0) * 100 + totalReports * 5;

    return (
        <div className="py-24 sm:py-32">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-center gap-8 mb-16">
                    <img className="h-32 w-32 rounded-full object-cover border-4 border-glow-blue/50" src={user.imageUrl} alt={user.fullName || 'User avatar'} />
                    <div>
                        <h1 className="text-4xl font-bold text-white text-center md:text-left">{displayName || user.fullName}</h1>
                        <p className="text-lg text-light-slate text-center md:text-left mt-2">Civic Impact Score: <span className="font-bold text-glow-blue">{impactScore}</span></p>
                        <p className="text-sm text-light-slate mt-1">Reports: <span className="font-semibold text-white">{totalReports}</span> · Resolved: <span className="text-green-300">{statusCounts['resolved'] || 0}</span> · In-progress: <span className="text-yellow-300">{statusCounts['in-progress'] || 0}</span></p>
                    </div>
                </div>

                {/* Change display name */}
                <div className="mb-8 max-w-3xl mx-auto p-4 bg-primary-dark/50 rounded-lg border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-2">Account</h3>
                    <label className="block text-sm text-gray-300">Display name</label>
                    <div className="mt-2 flex gap-2">
                        <input value={displayName} onChange={e=>setDisplayName(e.target.value)} className="flex-1 p-2 rounded bg-dark-navy text-white" />
                        <button onClick={handleSaveName} className="px-3 py-2 bg-glow-blue rounded text-white">Save</button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Changing this name updates the display name locally for this browser.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column: Activity & Alerts */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Activity Timeline */}
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-6">My Activity Timeline</h2>
                            <div className="space-y-4">
                                {activities.map((activity, index) => (
                                    <div key={index} className="flex items-start gap-4 p-4 bg-primary-dark/50 rounded-lg border border-white/10">
                                        <div className="flex-shrink-0 text-glow-blue">{iconMap[activity.icon]}</div>
                                        <div>
                                            <p className="text-white text-sm">{activity.text}</p>
                                            <p className="text-xs text-light-slate mt-1">{activity.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Personalized Alerts */}
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-6">Personalized Alerts</h2>
                            <div className="space-y-4">
                                {alerts.map((alert, index) => (
                                    <div key={index} className={`p-4 rounded-lg border flex items-start gap-4 ${
                                        alert.type === 'success' ? 'bg-green-500/10 border-green-500/30' : 
                                        alert.type === 'info' ? 'bg-blue-500/10 border-blue-500/30' : 
                                        'bg-yellow-500/10 border-yellow-500/30'
                                    }`}>
                                         <div className={`flex-shrink-0 ${
                                             alert.type === 'success' ? 'text-green-400' :
                                             alert.type === 'info' ? 'text-blue-400' :
                                             'text-yellow-400'
                                         }`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </div>
                                        <div className="flex-grow">
                                            <p className="text-sm text-gray-200">{alert.title}</p>
                                            {alert.action && (
                                                <div className="mt-2">
                                                    <Link 
                                                        to={alert.action.link} 
                                                        className="text-sm font-semibold bg-glow-blue/10 text-glow-blue px-3 py-1 rounded-md hover:bg-glow-blue/20 transition-colors inline-block"
                                                    >
                                                        {alert.action.text}
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Achievements & Service Health */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-6">Achievements</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-4">
                                {achievements.map((ach, index) => (
                                    <div key={index} className="flex flex-col items-center justify-center text-center p-4 bg-primary-dark/50 rounded-lg border border-white/10">
                                        <div className="text-yellow-400 mb-2">{iconMap[ach.icon]}</div>
                                        <p className="text-xs font-semibold text-light-slate">{ach.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* Service Health Status */}
                        <div>
                            <ServiceHealth />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;