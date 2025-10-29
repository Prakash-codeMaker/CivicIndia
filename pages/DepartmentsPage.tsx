import React, { useEffect, useState } from 'react';
import { useRouter } from '../routing/RouterContext';

const DepartmentsPage: React.FC = () => {
  const [depts, setDepts] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [stats, setStats] = useState<any | null>(null);
  const { navigate } = useRouter();

  useEffect(() => { fetch('/departments').then(r=>r.json()).then(d=>setDepts(d.departments || [])).catch(()=>{}); }, []);

  const loadStats = async (id: string) => {
    setSelected(id);
    const res = await fetch(`/department/${id}/stats`);
    const data = await res.json();
    setStats(data.stats);
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Departments</h2>
        <button onClick={() => navigate('/admin')} className="px-3 py-1 bg-slate-700 text-white rounded">Admin</button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {depts.map(d => (
          <div key={d.id} className="p-3 border rounded">
            <h3 className="font-semibold">{d.name}</h3>
            <div className="mt-2">
              <button onClick={() => loadStats(d.id)} className="px-2 py-1 bg-blue-600 text-white rounded">View stats</button>
            </div>
          </div>
        ))}
      </div>

      {selected && stats && (
        <div className="mt-6 p-4 border rounded">
          <h3 className="font-semibold">Stats for {selected}</h3>
          <p>Total assignments: {stats.total}</p>
          <p>Overdue: {stats.overdue}</p>
          <p>Average resolution (days): {stats.avgResolution}</p>
        </div>
      )}
    </div>
  );
};

export default DepartmentsPage;
