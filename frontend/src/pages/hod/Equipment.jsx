import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function Equipment() {
  const [items, setItems] = useState([]);
  const [labs, setLabs] = useState([]);
  const [form, setForm] = useState({ name:'', serial_no:'', category:'', lab_id:'', status:'available', cost:'' });
  const load = () => api.get('/equipment').then(r => setItems(r.data));
  useEffect(() => { load(); api.get('/labs').then(r => setLabs(r.data)); }, []);
  const submit = async (e) => {
    e.preventDefault();
    try { await api.post('/equipment', form); toast.success('Added'); load(); }
    catch (e) { toast.error(e.response?.data?.message); }
  };
  return (
    <div className="grid md:grid-cols-3 gap-5">
      <form onSubmit={submit} className="card space-y-3">
        <h3 className="font-semibold">Add Equipment</h3>
        <input className="input" placeholder="Name" required value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
        <input className="input" placeholder="Serial No" value={form.serial_no} onChange={e=>setForm({...form, serial_no:e.target.value})}/>
        <input className="input" placeholder="Category" value={form.category} onChange={e=>setForm({...form, category:e.target.value})}/>
        <select className="input" value={form.lab_id} onChange={e=>setForm({...form, lab_id:e.target.value})}>
          <option value="">Assign lab…</option>
          {labs.map(l=><option key={l.lab_id} value={l.lab_id}>{l.lab_name}</option>)}
        </select>
        <input className="input" type="number" placeholder="Cost" value={form.cost} onChange={e=>setForm({...form, cost:e.target.value})}/>
        <button className="btn-primary w-full">Save</button>
      </form>
      <div className="md:col-span-2 card">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-slate-500"><th>Item</th><th>Serial</th><th>Lab</th><th>Status</th></tr></thead>
          <tbody>{items.map(e=>(
            <tr key={e.equipment_id} className="border-t border-slate-200 dark:border-slate-700">
              <td className="py-2">{e.name}</td><td>{e.serial_no}</td><td>{e.lab_name||'—'}</td>
              <td><span className="badge bg-slate-100 dark:bg-slate-700">{e.status}</span></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
