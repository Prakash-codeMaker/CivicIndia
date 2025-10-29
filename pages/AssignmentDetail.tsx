import React, { useEffect, useState } from 'react';
import { useRouter } from '../routing/RouterContext';

const AssignmentDetail: React.FC = () => {
  const [assignment, setAssignment] = useState<any | null>(null);
  const { navigate } = useRouter();

  useEffect(() => {
    const hash = window.location.hash.slice(1) || '/';
    const parts = hash.split('/');
    const id = parts[1] === 'assignment' ? parts[2] : null;
    if (!id) return;
    const API_BASE = (typeof window !== 'undefined' && window.location.hostname === 'localhost') ? 'http://localhost:5140' : '';
    fetch(`${API_BASE}/assignments`).then(r => r.json()).then(d => {
      const found = (d.assignments || []).find((x:any) => String(x.id) === String(id));
      setAssignment(found || null);
    }).catch(()=>{});
  }, []);

  if (!assignment) return (
    <div className="p-4">
      <button onClick={() => navigate('/dashboard')} className="px-2 py-1 bg-slate-700 text-white rounded">Back</button>
      <div className="mt-4">Assignment not found.</div>
    </div>
  );

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Assignment {assignment.id}</h2>
        <div>
          <button onClick={() => navigate('/dashboard')} className="px-3 py-1 bg-slate-700 text-white rounded">Back</button>
        </div>
      </div>

      <div className="p-4 border rounded">
        <p><strong>Department:</strong> {assignment.department}</p>
        <p><strong>Status:</strong> {assignment.status}</p>
        <p><strong>Assigned:</strong> {assignment.assignedAt}</p>
        <p><strong>Due:</strong> {assignment.due}</p>
        <p><strong>Escalated:</strong> {assignment.escalated ? 'Yes' : 'No'}</p>
        <div className="mt-4">
          <button onClick={async () => { const API_BASE = (typeof window !== 'undefined' && window.location.hostname === 'localhost') ? 'http://localhost:5140' : ''; await fetch(`${API_BASE}/assignments/${assignment.id}/mark-reviewed`, { method: 'POST' }); window.location.reload(); }} className="mr-2 px-2 py-1 bg-green-600 text-white rounded">Mark reviewed</button>
          <button onClick={async () => { const dept = prompt('Reassign to (id)'); if (dept) { const API_BASE = (typeof window !== 'undefined' && window.location.hostname === 'localhost') ? 'http://localhost:5140' : ''; await fetch(`${API_BASE}/assignments/${assignment.id}/reassign`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ department: dept }) }); window.location.reload(); } }} className="px-2 py-1 bg-blue-600 text-white rounded">Reassign</button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetail;
