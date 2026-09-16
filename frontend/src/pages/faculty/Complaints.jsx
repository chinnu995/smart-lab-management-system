import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function FacultyComplaints() {
  const [items, setItems] = useState([]);
  const load = () => api.get('/complaints').then(r => setItems(r.data));
  useEffect(load, []);
  const update = async (id, status) => {
    try { await api.put(`/complaints/${id}`, { status }); toast.success('Updated'); load(); }
    catch (e) { toast.error(e.response?.data?.message); }
  };
  return (
    <div className="card">
      <h3 className="font-semibold mb-3">Complaints</h3>
      <table className="w-full text-sm">
        <thead><tr className="text-left text-slate-500"><th>Title</th><th>By</th><th>Priority</th><th>Status</th><th></th></tr></thead>
        <tbody>{items.map(c=>(
          <tr key={c.complaint_id} className="border-t border-slate-200 dark:border-slate-700">
            <td className="py-2">{c.title}</td>
            <td>{c.raised_by_name}</td>
            <td><span className="badge bg-slate-100 dark:bg-slate-700">{c.priority}</span></td>
            <td><span className={`badge ${c.status==='resolved'?'badge-green':c.status==='in_progress'?'badge-amber':'badge-red'}`}>{c.status}</span></td>
            <td className="text-right">
              <select className="input text-xs py-1" value={c.status} onChange={e=>update(c.complaint_id, e.target.value)}>
                <option value="pending">pending</option>
                <option value="in_progress">in_progress</option>
                <option value="resolved">resolved</option>
              </select>
            </td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}
