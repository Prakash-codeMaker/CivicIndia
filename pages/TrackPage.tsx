import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { getReportById, getReportsForUser, subscribe } from '../lib/reportStore';

const StatusStep = ({ stage, isCompleted, isLast }: { stage: string, isCompleted: boolean, isLast: boolean }) => (
    <div className={`flex-grow flex items-center ${isLast ? 'flex-grow-0' : ''}`}>
        <div className="flex-shrink-0 relative">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCompleted ? 'bg-glow-blue' : 'bg-gray-700 border-2 border-gray-500'} text-white font-bold`}>
                {isCompleted && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
            </div>
            <span className="absolute top-10 left-1/2 -translate-x-1/2 w-20 text-xs text-center text-light-slate">{stage}</span>
        </div>
        {!isLast && <div className={`flex-grow h-1 ${isCompleted ? 'bg-glow-blue' : 'bg-gray-600'}`}></div>}
    </div>
);

const ComplaintCard = ({ id, title, status, submitted, stages }: { id: string, title: string, status: string, submitted: string, stages: boolean[] }) => {
    const statusColor = {
        'Resolved': 'bg-green-500/20 text-green-400',
        'In Progress': 'bg-yellow-500/20 text-yellow-400',
        'Acknowledged': 'bg-blue-500/20 text-blue-400',
        'Submitted': 'bg-gray-500/20 text-gray-400',
    };

    return (
        <div className="bg-primary-dark p-6 rounded-lg border border-white/10">
            <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                    <h3 className="font-bold text-white">{title}</h3>
                    <p className="text-xs text-light-slate mt-1">ID: {id} • Submitted: {submitted}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor[status as keyof typeof statusColor] || statusColor.Submitted}`}>{status}</span>
            </div>
            <div className="mt-12 pt-4">
                <div className="flex items-center">
                    <StatusStep stage="Submitted" isCompleted={stages[0]} isLast={false} />
                    <StatusStep stage="Acknowledged" isCompleted={stages[1]} isLast={false} />
                    <StatusStep stage="In Progress" isCompleted={stages[2]} isLast={false} />
                    <StatusStep stage="Resolved" isCompleted={stages[3]} isLast={true} />
                </div>
            </div>
        </div>
    );
};

const statusToStages = (status: string) => {
    // Normalize status and create boolean array for the 4 steps
    const s = (status || '').toLowerCase();
    const stages = [false, false, false, false];
    stages[0] = true; // Submitted is always true
    if (s.includes('ack')) stages[1] = true;
    if (s.includes('in') || s.includes('progress')) stages[2] = true;
    if (s.includes('resolv') || s.includes('resolved')) stages[3] = true;
    return stages;
};

const TrackPage: React.FC = () => {
    const { user } = useUser();
    const [trackedId, setTrackedId] = useState<string | null>(() => sessionStorage.getItem('newComplaintId'));
    const [report, setReport] = useState<any | null>(null);

    useEffect(() => {
        let mounted = true;

        const loadById = async (id: string) => {
            const r = await getReportById(id);
            if (!mounted) return;
            setReport(r);
        };

        const loadFallback = async () => {
            if (!user) return;
            const list = await getReportsForUser(user.id);
            if (!mounted) return;
            setReport(list && list.length ? list[0] : null);
        };

        if (trackedId) {
            loadById(trackedId);
            // clear one-time indicator
            try { sessionStorage.removeItem('newComplaintId'); sessionStorage.removeItem('newComplaintStatus'); } catch (e) {}
        } else {
            // if no explicit ID, show latest user report (if logged in)
            loadFallback();
        }

        const unsub = subscribe(() => {
            if (trackedId) loadById(trackedId);
            else loadFallback();
        });

        return () => { mounted = false; unsub(); };
    }, [trackedId, user]);

    const submittedAt = report ? new Date(report.createdAt).toLocaleDateString() : '';
    const title = report ? (report.issueType || 'Reported Issue') : 'No reported issue found';
    const status = report ? (report.status ? String(report.status) : 'Submitted') : 'Submitted';
    const stages = report ? statusToStages(status) : [true, false, false, false];

    return (
        <div className="py-24 sm:py-32">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-white">Track Your Complaints</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-light-slate">
                        View the real-time status of your submitted issue and get detailed updates.
                    </p>
                </div>

                {trackedId && (
                    <div className="mt-12 max-w-3xl mx-auto bg-green-500/10 border border-green-500/30 text-green-300 px-4 py-3 rounded-lg relative text-center" role="alert">
                        <strong className="font-bold">Success!</strong>
                        <span className="block sm:inline ml-2">Your issue has been reported. Your Tracking ID is: {trackedId}</span>
                    </div>
                )}

                <div className="mt-16 max-w-3xl mx-auto space-y-6">
                    {report ? (
                        <ComplaintCard id={report.id} title={title} status={status} submitted={submittedAt} stages={stages} />
                    ) : (
                        <div className="bg-primary-dark p-6 rounded-lg border border-white/10 text-center">
                            <p className="text-light-slate">No complaint found. Submit a new report from the <strong>Report</strong> page to track it here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrackPage;