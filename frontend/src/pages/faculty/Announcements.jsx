import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const cats = ['general','lab_update','exam','attendance_alert','equipment','workshop','emergency','maintenance'];

export default function FacultyAnnouncements() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title:'', content:'', category:'general', target_role:'student', is_pinned:false });
  
  const load = async () => {
    try {
      const r = await api.get('/announcements');
      if (Array.isArray(r.data)) {
        setItems(r.data);
      } else {
        setItems([]);
      }
    } catch (e) {
      console.error('Failed to load announcements:', e);
      toast.error('Failed to load announcements');
      setItems([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try { 
      await api.post('/announcements', form); 
      toast.success('Posted'); 
      load(); 
      setForm({ title:'', content:'', category:'general', target_role:'student', is_pinned:false }); 
    }
    catch (e) { 
      toast.error(e.response?.data?.message || 'Failed to post announcement'); 
    }
  };
  return (
    <div className="grid md:grid-cols-2 gap-5">
      <form onSubmit={submit} className="card space-y-3">
        <h3 className="font-semibold">New Announcement</h3>
        <input className="input" placeholder="Title" required value={form.title} onChange={e=>setForm({...form, title:e.target.value})}/>
        <textarea className="input h-28" placeholder="Content" required value={form.content} onChange={e=>setForm({...form, content:e.target.value})}/>
        <div className="grid grid-cols-2 gap-3">
          <select className="input" value={form.category} onChange={e=>setForm({...form, category:e.target.value})}>
            {cats.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
          <select className="input" value={form.target_role} onChange={e=>setForm({...form, target_role:e.target.value})}>
            <option value="all">All</option><option value="student">Students</option><option value="faculty">Faculty</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_pinned} onChange={e=>setForm({...form, is_pinned:e.target.checked})}/> Pin to top</label>
        <button className="btn-primary w-full">Publish</button>
      </form>
      <div className="card">
        <h3 className="font-semibold mb-3">Recent</h3>
        <ul className="space-y-2 text-sm">
          {items.map(a => <li key={a.announcement_id} className="border-b border-slate-200 dark:border-slate-700 pb-2">
            <div className="font-medium">{a.title}</div>
            <div className="text-xs text-slate-500">{a.category} · {new Date(a.created_at).toLocaleString()}</div>
          </li>)}
        </ul>
      </div>
    </div>
  );
}
