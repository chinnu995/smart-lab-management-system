import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function StudentBookings() {
  const [labs, setLabs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({ lab_id:'', purpose:'', booking_date:'', start_time:'', end_time:'' });
  const load = () => api.get('/bookings').then(r => setBookings(r.data));
  useEffect(() => { api.get('/labs').then(r => setLabs(r.data)); load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try { await api.post('/bookings', form); toast.success('Booking requested'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  return (
    <div className="grid md:grid-cols-2 gap-5">
      <form onSubmit={submit} className="card space-y-3">
        <h3 className="font-semibold">Request a Lab</h3>
        <select className="input" value={form.lab_id} onChange={e=>setForm({...form, lab_id:e.target.value})} required>
          <option value="">Select lab…</option>
          {labs.map(l=><option key={l.lab_id} value={l.lab_id}>{l.lab_name} ({l.status})</option>)}
        </select>
        <input className="input" placeholder="Purpose" value={form.purpose} onChange={e=>setForm({...form, purpose:e.target.value})}/>
        <input type="date" className="input" value={form.booking_date} onChange={e=>setForm({...form, booking_date:e.target.value})} required/>
        <div className="grid grid-cols-2 gap-3">
          <input type="time" className="input" value={form.start_time} onChange={e=>setForm({...form, start_time:e.target.value})} required/>
          <input type="time" className="input" value={form.end_time} onChange={e=>setForm({...form, end_time:e.target.value})} required/>
        </div>
        <button className="btn-primary w-full">Submit Request</button>
      </form>
      <div className="card">
        <h3 className="font-semibold mb-3">My Bookings</h3>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-slate-500"><th>Lab</th><th>Date</th><th>Time</th><th>Status</th></tr></thead>
          <tbody>{bookings.map(b=>(
            <tr key={b.booking_id} className="border-t border-slate-200 dark:border-slate-700">
              <td className="py-2">{b.lab_name}</td>
              <td>{b.booking_date}</td>
              <td className="text-xs">{b.start_time}-{b.end_time}</td>
              <td><span className={`badge ${b.status==='approved'?'badge-green':b.status==='rejected'?'badge-red':'badge-amber'}`}>{b.status}</span></td>
            </tr>
          ))}</tbody>
        </table>
        {!bookings.length && <div className="text-center text-slate-500 py-6">No bookings yet</div>}
      </div>
    </div>
  );
}
