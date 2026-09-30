import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { getSocket } from '../../services/socket';
import { Edit3, Save, X, Trash2, MapPin, Plus, FlaskConical, Check } from 'lucide-react';

export default function Labs() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ lab_name: '', lab_code: '', location: '', capacity: 30, status: 'available' });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

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
    try {
      await api.post('/labs', form);
      toast.success('Lab added successfully');
      load();
      setForm({ lab_name: '', lab_code: '', location: '', capacity: 30, status: 'available' });
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to add lab');
    }
  };

  const updateField = async (id, fields) => {
    try {
      await api.put(`/labs/${id}`, fields);
      toast.success('Lab updated successfully');
      setEditingId(null);
      load();
    } catch (e) {
      toast.error('Failed to update lab');
    }
  };

  const deleteLab = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lab?')) return;
    try {
      await api.delete(`/labs/${id}`);
      toast.success('Lab deleted');
      load();
    } catch (e) {
      toast.error('Failed to delete lab');
    }
  };

  const startEdit = (lab) => {
    setEditingId(lab.lab_id);
    setEditData({
      lab_name: lab.lab_name,
      lab_code: lab.lab_code || '',
      location: lab.location || '',
      capacity: lab.capacity || 30,
      status: lab.status || 'available'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <FlaskConical className="text-indigo-600 dark:text-indigo-400" />
            Manage Laboratories & Floor Rooms
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Add new labs or edit room numbers and locations across floors (e.g. 2F 02, 3F 28, NBGF 12).
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Add Lab Form */}
        <form onSubmit={submit} className="card space-y-4 h-fit">
          <h3 className="font-bold text-slate-800 dark:text-white text-base flex items-center gap-2">
            <Plus className="w-4 h-4 text-indigo-500" /> Add New Lab
          </h3>
          
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">Lab Name</label>
            <input className="input w-full" placeholder="e.g. DBMS Lab" required value={form.lab_name} onChange={e=>setForm({...form, lab_name:e.target.value})}/>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">Lab Code</label>
            <input className="input w-full" placeholder="e.g. CS-LAB-02" value={form.lab_code} onChange={e=>setForm({...form, lab_code:e.target.value})}/>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
              Floor / Room Location
            </label>
            <input className="input w-full" placeholder="e.g. 2F 02, 3F 28, NBGF 12" required value={form.location} onChange={e=>setForm({...form, location:e.target.value})}/>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">Capacity</label>
              <input className="input w-full" type="number" placeholder="30" value={form.capacity} onChange={e=>setForm({...form, capacity:+e.target.value})}/>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">Status</label>
              <select className="input w-full text-xs" value={form.status} onChange={e=>setForm({...form, status:e.target.value})}>
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <button className="btn-primary w-full flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Save Laboratory
          </button>
        </form>

        {/* Labs Table */}
        <div className="md:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 dark:text-white">Active Laboratories ({items.length})</h3>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-full font-medium">
              ✏️ Click "Edit" to modify floor room numbers
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200 dark:border-slate-700 pb-2">
                  <th className="py-2">Lab Name</th>
                  <th>Code</th>
                  <th>Floor / Location</th>
                  <th>Capacity</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(l => {
                  const isEditing = editingId === l.lab_id;

                  if (isEditing) {
                    return (
                      <tr key={l.lab_id} className="border-t border-slate-200 dark:border-slate-700 bg-indigo-50/50 dark:bg-indigo-950/30">
                        <td className="py-2 pr-2">
                          <input
                            className="input text-xs w-full py-1"
                            value={editData.lab_name}
                            onChange={e => setEditData({ ...editData, lab_name: e.target.value })}
                          />
                        </td>
                        <td className="pr-2">
                          <input
                            className="input text-xs w-full py-1"
                            value={editData.lab_code}
                            onChange={e => setEditData({ ...editData, lab_code: e.target.value })}
                          />
                        </td>
                        <td className="pr-2">
                          <input
                            className="input text-xs font-mono font-bold w-full py-1 bg-amber-50 dark:bg-amber-950/40 border-amber-400"
                            placeholder="e.g. 2F 02"
                            value={editData.location}
                            onChange={e => setEditData({ ...editData, location: e.target.value })}
                          />
                        </td>
                        <td className="pr-2">
                          <input
                            type="number"
                            className="input text-xs w-20 py-1"
                            value={editData.capacity}
                            onChange={e => setEditData({ ...editData, capacity: +e.target.value })}
                          />
                        </td>
                        <td className="pr-2">
                          <select
                            value={editData.status}
                            onChange={e => setEditData({ ...editData, status: e.target.value })}
                            className="input text-xs py-1"
                          >
                            <option value="available">available</option>
                            <option value="occupied">occupied</option>
                            <option value="maintenance">maintenance</option>
                          </select>
                        </td>
                        <td className="py-2 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => updateField(l.lab_id, editData)}
                              className="p-1.5 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition"
                              title="Save Changes"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
                              title="Cancel"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={l.lab_id} className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      <td className="py-3 font-medium text-slate-800 dark:text-slate-100">{l.lab_name}</td>
                      <td className="text-slate-500 font-mono text-xs">{l.lab_code || '-'}</td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <MapPin size={12} />
                            {l.location || 'Not set'}
                          </span>
                        </div>
                      </td>
                      <td className="text-slate-600 dark:text-slate-300">{l.capacity}</td>
                      <td>
                        <select
                          value={l.status}
                          onChange={e => updateField(l.lab_id, { status: e.target.value })}
                          className={`input text-xs py-1 font-semibold rounded-lg ${
                            l.status === 'available' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' :
                            l.status === 'occupied' ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' :
                            'text-rose-600 bg-rose-50 dark:bg-rose-950/40'
                          }`}
                        >
                          <option value="available">available</option>
                          <option value="occupied">occupied</option>
                          <option value="maintenance">maintenance</option>
                        </select>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => startEdit(l)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-md transition"
                          >
                            <Edit3 size={13} /> Edit
                          </button>
                          <button
                            onClick={() => deleteLab(l.lab_id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md transition"
                            title="Delete Lab"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
