import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function Faculty() {
  const [items, setItems] = useState([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ full_name:'', email:'', password:'', phone:'', emp_code:'', department:'Computer Science', designation:'Assistant Professor' });
  const load = () => api.get('/faculty').then(r => setItems(r.data));
  useEffect(load, []);
  const submit = async (e) => {
    e.preventDefault();
    try { await api.post('/faculty', form); toast.success('Faculty added'); setShow(false); load(); }
    catch (e) { toast.error(e.response?.data?.message); }
  };
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={()=>setShow(s=>!s)} className="btn-primary">{show?'Cancel':'Add Faculty'}</button>
      </div>
      {show && (
        <form onSubmit={submit} className="card grid md:grid-cols-3 gap-3">
          <input className="input" placeholder="Full name" required value={form.full_name} onChange={e=>setForm({...form, full_name:e.target.value})}/>
          <input className="input" placeholder="Emp code" required value={form.emp_code} onChange={e=>setForm({...form, emp_code:e.target.value})}/>
          <input className="input" type="email" placeholder="Email" required value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/>
          <input className="input" type="password" placeholder="Password" required value={form.password} onChange={e=>setForm({...form, password:e.target.value})}/>
          <input className="input" placeholder="Phone" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})}/>
          <input className="input" placeholder="Department" value={form.department} onChange={e=>setForm({...form, department:e.target.value})}/>
          <input className="input" placeholder="Designation" value={form.designation} onChange={e=>setForm({...form, designation:e.target.value})}/>
          <button className="btn-primary md:col-span-3">Save</button>
        </form>
      )}
      <div className="card">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-slate-500"><th>Code</th><th>Name</th><th>Email</th><th>Department</th><th>Designation</th></tr></thead>
          <tbody>{items.map(f=>(
            <tr key={f.faculty_id} className="border-t border-slate-200 dark:border-slate-700">
              <td className="py-2">{f.emp_code}</td><td>{f.full_name}</td><td>{f.email}</td>
              <td>{f.department}</td><td>{f.designation}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
