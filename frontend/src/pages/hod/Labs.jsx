import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { getSocket } from '../../services/socket';

export default function Labs() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ lab_name:'', lab_code:'', location:'', capacity:30, status:'available' });
  const load = () => api.get('/labs').then(r => setItems(r.data));
  useEffect(() => {
    load();
    const s = getSocket();
    s.connect();
    s.on('lab:status_changed', load);
    s.on('booking:changed', load);
    s.on('booking:new', load);
    s.on('attendance:changed', load);

    return () => {
      s.off('lab:status_changed', load);
      s.off('booking:changed', load);
      s.off('booking:new', load);
      s.off('attendance:changed', load);
    };
  }, []);
  const submit = async (e) => {
    e.preventDefault();
    try { await api.post('/labs', form); toast.success('Lab added'); load(); setForm({ lab_name:'', lab_code:'', location:'', capacity:30, status:'available' }); }
    catch (e) { toast.error(e.response?.data?.message); }
  };
  const setStatus = async (id, status) => { await api.put(`/labs/${id}`, { status }); load(); };
  return (
    <div className="grid md:grid-cols-3 gap-5">
      <form onSubmit={submit} className="card space-y-3">
        <h3 className="font-semibold">Add Lab</h3>
        <input className="input" placeholder="Name" required value={form.lab_name} onChange={e=>setForm({...form, lab_name:e.target.value})}/>
        <input className="input" placeholder="Code" value={form.lab_code} onChange={e=>setForm({...form, lab_code:e.target.value})}/>
        <input className="input" placeholder="Location" value={form.location} onChange={e=>setForm({...form, location:e.target.value})}/>
        <input className="input" type="number" placeholder="Capacity" value={form.capacity} onChange={e=>setForm({...form, capacity:+e.target.value})}/>
        <button className="btn-primary w-full">Save</button>
      </form>
      <div className="md:col-span-2 card">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-slate-500"><th>Lab</th><th>Code</th><th>Location</th><th>Capacity</th><th>Status</th></tr></thead>
          <tbody>{items.map(l=>(
            <tr key={l.lab_id} className="border-t border-slate-200 dark:border-slate-700">
              <td className="py-2">{l.lab_name}</td><td>{l.lab_code}</td><td>{l.location}</td><td>{l.capacity}</td>
              <td>
                <select value={l.status} onChange={e=>setStatus(l.lab_id, e.target.value)} className="input text-xs py-1">
                  <option value="available">available</option>
                  <option value="occupied">occupied</option>
                  <option value="maintenance">maintenance</option>
                </select>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
