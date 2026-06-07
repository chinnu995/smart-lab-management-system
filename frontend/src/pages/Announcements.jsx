import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Pin, Megaphone } from 'lucide-react';
import toast from 'react-hot-toast';

const colors = {
  general:'bg-slate-100 text-slate-700', lab_update:'bg-blue-100 text-blue-700',
  exam:'bg-purple-100 text-purple-700', attendance_alert:'bg-amber-100 text-amber-700',
  equipment:'bg-cyan-100 text-cyan-700', workshop:'bg-pink-100 text-pink-700',
  emergency:'bg-rose-100 text-rose-700', maintenance:'bg-orange-100 text-orange-700'
};

export default function Announcements() {
  const [items, setItems] = useState([]);

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
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold flex items-center gap-2"><Megaphone size={20}/> Announcements</h2>
      {items.map(a => (
        <div key={a.announcement_id} className="card">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                {!!a.is_pinned && <Pin size={14} className="text-amber-500"/>}
                <h3 className="font-semibold">{a.title}</h3>
                <span className={`badge ${colors[a.category] || colors.general}`}>{a.category}</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 whitespace-pre-wrap">{a.content}</p>
            </div>
            <div className="text-xs text-slate-500 whitespace-nowrap">{new Date(a.created_at).toLocaleString()}</div>
          </div>
          <div className="text-xs text-slate-500 mt-2">By {a.posted_by_name} ({a.posted_by_role})</div>
        </div>
      ))}
      {!items.length && <div className="card text-center text-slate-500">No announcements yet.</div>}
    </div>
  );
}
