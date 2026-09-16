import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function Students() {
  const [items, setItems] = useState([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ full_name:'', email:'', password:'', phone:'', usn:'', department:'Computer Science', semester:1, section:'A', batch_year:new Date().getFullYear() });
  const load = (q='') => api.get('/students', { params: { q } }).then(r => setItems(r.data));
  useEffect(() => { load(); }, []);
  const submit = async (e) => {
    e.preventDefault();
    try { await api.post('/students', form); toast.success('Student added'); setShow(false); load(); }
    catch (e) { toast.error(e.response?.data?.message); }
  };
  const remove = async (id) => {
    if (!confirm('Delete student?')) return;
    try { await api.delete(`/students/${id}`); toast.success('Deleted'); load(); }
    catch (e) { toast.error(e.response?.data?.message); }
  };
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <input className="input max-w-sm" placeholder="Search…" onChange={e=>load(e.target.value)}/>
        <button onClick={()=>setShow(s=>!s)} className="btn-primary">{show?'Cancel':'Add Student'}</button>
      </div>
      {show && (
        <form onSubmit={submit} className="card grid md:grid-cols-3 gap-3">
          <input className="input" placeholder="Full name" required value={form.full_name} onChange={e=>setForm({...form, full_name:e.target.value})}/>
          <input className="input uppercase" placeholder="USN (e.g. 4PM22CS001)" required value={form.usn} onChange={e=>setForm({...form, usn:e.target.value.toUpperCase()})}/>
          <input className="input" type="email" placeholder="Email" required value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/>
          <input className="input" type="password" placeholder="Password" required value={form.password} onChange={e=>setForm({...form, password:e.target.value})}/>
          <input className="input" placeholder="Phone" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})}/>
          <input className="input" placeholder="Department" value={form.department} onChange={e=>setForm({...form, department:e.target.value})}/>
          <input className="input" type="number" placeholder="Semester" value={form.semester} onChange={e=>setForm({...form, semester:+e.target.value})}/>
          <input className="input" placeholder="Section" value={form.section} onChange={e=>setForm({...form, section:e.target.value})}/>
          <button className="btn-primary md:col-span-3">Save</button>
        </form>
      )}
      <div className="card">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-slate-500"><th>USN</th><th>Name</th><th>Email</th><th>Dept</th><th>Sem</th><th></th></tr></thead>
          <tbody>{items.map(s=>(
            <tr key={s.student_id} className="border-t border-slate-200 dark:border-slate-700">
              <td className="py-2">{s.usn}</td><td>{s.full_name}</td><td>{s.email}</td>
              <td>{s.department}</td><td>{s.semester}</td>
              <td><button onClick={()=>remove(s.student_id)} className="text-xs text-rose-600">Delete</button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
