import React, { useEffect, useState } from 'react';
import { useRouter } from '../routing/RouterContext';

type Assignment = {
  id: string | number;
  department: string;
  assignedAt: string;
  due: string;
  status?: string;
  reviewed?: boolean;
  reviewedAt?: string;
};

const AdminPage: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const { navigate } = useRouter();

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/assignments');
      const data = await res.json();
      setAssignments(data.assignments || []);
    } catch (e) {
      // ignore
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const markReviewed = async (id: string | number) => {
    await fetch(`/assignments/${id}/mark-reviewed`, { method: 'POST' });
    load();
  };

  const reassign = async (id: string | number) => {
    const dept = prompt('Enter department id to reassign to (e.g., roads, sanitation):');
    if (!dept) return;
    await fetch(`/assignments/${id}/reassign`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ department: dept }) });
    load();
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Admin — SLA Assignments</h2>
        <div>
          <button onClick={() => navigate('/')} className="px-3 py-1 bg-slate-700 text-white rounded">Back</button>
        </div>
      </div>

      {loading ? <div>Loading…</div> : (
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="text-left border-b"><th>ID</th><th>Department</th><th>Assigned</th><th>Due</th><th>Reviewed</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {assignments.map(a => (
              <tr key={String(a.id)} className="border-b">
                <td className="py-2">{String(a.id)}</td>
                <td>{a.department}</td>
                <td>{new Date(a.assignedAt).toLocaleString()}</td>
                <td>{new Date(a.due).toLocaleString()}</td>
                <td>{a.reviewed ? `Yes (${a.reviewedAt})` : 'No'}</td>
                <td>
                  <button onClick={() => reassign(a.id)} className="mr-2 px-2 py-1 bg-blue-600 text-white rounded">Reassign</button>
                  <button onClick={() => markReviewed(a.id)} className="px-2 py-1 bg-green-600 text-white rounded">Mark reviewed</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminPage;
