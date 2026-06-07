import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function StudentComplaints() {
  const [items, setItems] = useState([]);
  const [labs, setLabs] = useState([]);
  const [form, setForm] = useState({ title:'', description:'', lab_id:'', priority:'medium' });
  const load = () => api.get('/complaints').then(r => setItems(r.data));
  useEffect(() => { load(); api.get('/labs').then(r => setLabs(r.data)); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try { await api.post('/complaints', form); toast.success('Complaint submitted'); load(); setForm({ title:'', description:'', lab_id:'', priority:'medium' }); }
    catch (err) { toast.error(err.response?.data?.message); }
  };

  return (
    <div className="grid md:grid-cols-2 gap-5">
      <form onSubmit={submit} className="card space-y-3">
        <h3 className="font-semibold">Raise a Complaint</h3>
        <input className="input" placeholder="Title" required value={form.title} onChange={e=>setForm({...form, title:e.target.value})}/>
        <textarea className="input h-28" placeholder="Describe the issue…" value={form.description} onChange={e=>setForm({...form, description:e.target.value})}/>
        <select className="input" value={form.lab_id} onChange={e=>setForm({...form, lab_id:e.target.value})}>
          <option value="">Related lab (optional)</option>
          {labs.map(l=><option key={l.lab_id} value={l.lab_id}>{l.lab_name}</option>)}
        </select>
        <select className="input" value={form.priority} onChange={e=>setForm({...form, priority:e.target.value})}>
          <option value="low">Low</option><option value="medium">Medium</option>
          <option value="high">High</option><option value="critical">Critical</option>
        </select>
        <button className="btn-primary w-full">Submit</button>
      </form>
      <div className="card">
        <h3 className="font-semibold mb-3">My Complaints</h3>
        <ul className="space-y-2 text-sm">
          {items.map(c => (
            <li key={c.complaint_id} className="border-b border-slate-200 dark:border-slate-700 pb-2">
              <div className="flex items-center justify-between">
                <div className="font-medium">{c.title}</div>
                <span className={`badge ${c.status==='resolved'?'badge-green':c.status==='in_progress'?'badge-amber':'badge-red'}`}>{c.status}</span>
              </div>
              <div className="text-xs text-slate-500">{new Date(c.created_at).toLocaleString()}</div>
            </li>
          ))}
          {!items.length && <li className="text-slate-500">No complaints raised.</li>}
        </ul>
      </div>
    </div>
  );
}
