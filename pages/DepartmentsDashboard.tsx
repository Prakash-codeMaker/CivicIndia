import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from '../routing/RouterContext';

type Assignment = any;

const BarChart: React.FC<{ data: { label: string; value: number }[] }> = ({ data }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <svg width="100%" height={Math.max(40, data.length * 28)} viewBox={`0 0 600 ${data.length * 28}`}>
      {data.map((d, i) => {
        const w = (d.value / max) * 500;
        return (
          <g key={d.label} transform={`translate(0, ${i * 28})`}>
            <text x={0} y={16} fontSize={12} fill="#fff">{d.label}</text>
            <rect x={120} y={4} width={w} height={20} fill="#3b82f6" rx={4} />
            <text x={130 + w} y={16} fontSize={12} fill="#fff">{d.value}</text>
          </g>
        );
      })}
    </svg>
  );
};

const DepartmentsDashboard: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { navigate } = useRouter();

  useEffect(() => {
    const API_BASE = (typeof window !== 'undefined' && window.location.hostname === 'localhost') ? 'http://localhost:5140' : '';
    fetch(`${API_BASE}/assignments`).then(r => r.json()).then(d => setAssignments(d.assignments || [])).catch(()=>{});
  }, []);

  const departments = useMemo(() => {
    const map: Record<string, number> = {};
    assignments.forEach(a => { map[a.department] = (map[a.department] || 0) + 1; });
    return Object.keys(map).map(k => ({ label: k, value: map[k] }));
  }, [assignments]);

  const filtered = useMemo(() => assignments.filter(a => (deptFilter === 'all' || a.department === deptFilter) && (statusFilter === 'all' || a.status === statusFilter)), [assignments, deptFilter, statusFilter]);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Departments Dashboard</h2>
        <div>
          <button onClick={() => navigate('/admin')} className="px-3 py-1 bg-slate-700 text-white rounded mr-2">Admin</button>
          <button onClick={() => navigate('/departments')} className="px-3 py-1 bg-slate-700 text-white rounded">Departments</button>
        </div>
      </div>

      <div className="mb-4">
        <label className="mr-2">Department:</label>
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="mr-4">
          <option value="all">All</option>
          {departments.map(d => <option key={d.label} value={d.label}>{d.label}</option>)}
        </select>
        <label className="mr-2">Status:</label>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="assigned">Assigned</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Assignments by Department</h3>
        <div className="bg-primary-dark p-3 rounded">
          <BarChart data={departments.map(d => ({ label: d.label, value: d.value }))} />
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Assignments ({filtered.length})</h3>
        <div className="space-y-2">
          {filtered.map(a => (
            <div key={a.id} className="p-3 bg-primary-dark rounded flex items-center justify-between">
              <div>
                <div className="font-semibold">{a.id}</div>
                <div className="text-sm text-gray-300">Dept: {a.department} • Status: {a.status}</div>
                <div className="text-sm text-gray-400">Assigned: {new Date(a.assignedAt).toLocaleString()}</div>
              </div>
              <div>
                <button onClick={() => navigate(`/assignment/${a.id}`)} className="px-2 py-1 bg-blue-600 text-white rounded">Open</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DepartmentsDashboard;
