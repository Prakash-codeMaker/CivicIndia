import React, { useState, useEffect } from 'react';

const mockComplaints = [
    { id: 'CMPT-583921', title: 'Broken streetlight on Elm St.', status: 'In Progress', submitted: '2024-10-26', stages: [true, true, true, false] },
    { id: 'CMPT-491204', title: 'Pothole on Main St.', status: 'Resolved', submitted: '2024-10-23', stages: [true, true, true, true] },
    { id: 'CMPT-381045', title: 'Garbage not collected in Sector 12', status: 'Acknowledged', submitted: '2024-10-25', stages: [true, true, false, false] },
];

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


const TrackPage: React.FC = () => {
    const [newComplaintId, setNewComplaintId] = useState<string | null>(null);

    useEffect(() => {
        const status = sessionStorage.getItem('newComplaintStatus');
        const id = sessionStorage.getItem('newComplaintId');
        if (status === 'success' && id) {
            setNewComplaintId(id);
            sessionStorage.removeItem('newComplaintStatus');
            sessionStorage.removeItem('newComplaintId');

            const timer = setTimeout(() => {
                setNewComplaintId(null);
            }, 7000);
            return () => clearTimeout(timer);
        }
    }, []);

    return (
        <div className="py-24 sm:py-32">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-white">Track Your Complaints</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-light-slate">
                        View the real-time status of all your submitted issues and get detailed updates.
                    </p>
                </div>

                {newComplaintId && (
                    <div className="mt-12 max-w-3xl mx-auto bg-green-500/10 border border-green-500/30 text-green-300 px-4 py-3 rounded-lg relative text-center" role="alert">
                        <strong className="font-bold">Success!</strong>
                        <span className="block sm:inline ml-2">Your issue has been reported. Your Tracking ID is: {newComplaintId}</span>
                    </div>
                )}
                
                <div className="mt-16 max-w-3xl mx-auto space-y-6">
                    {mockComplaints.map(complaint => (
                        <ComplaintCard key={complaint.id} {...complaint} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TrackPage;