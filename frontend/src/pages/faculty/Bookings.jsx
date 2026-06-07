import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import { CalendarRange, ClipboardList, PlusCircle, Check, X, ShieldAlert } from 'lucide-react';

export default function FacultyBookings() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [labs, setLabs] = useState([]);
  const [form, setForm] = useState({ lab_id: '', purpose: '', booking_date: '', start_time: '', end_time: '' });

  const load = () => api.get('/bookings').then(r => setItems(r.data));
  
  useEffect(() => {
    api.get('/labs').then(r => setLabs(r.data));
    load();
  }, []);

  const decide = async (id, status) => {
    try {
      await api.put(`/bookings/${id}`, { status });
      toast.success(`Booking ${status}`);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update booking');
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/bookings', form);
      toast.success('Lab booking requested!');
      setForm({ lab_id: '', purpose: '', booking_date: '', start_time: '', end_time: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request booking');
    }
  };

  // Segment bookings
  const myBookings = items.filter(b => b.requested_by === user?.id);
  const studentRequests = items.filter(b => b.requested_by !== user?.id);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <CalendarRange size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Lab Bookings Manager</h2>
            <p className="text-sm text-blue-100 mt-0.5">Book sessions for your classes and approve student reservation requests</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Book a Lab Form (Column 1) */}
        <div className="card h-fit">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <PlusCircle size={18} className="text-blue-500" /> Book a Lab Session
          </h3>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wide">Select Lab</label>
              <select 
                className="w-full text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-750 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={form.lab_id} 
                onChange={e => setForm({ ...form, lab_id: e.target.value })} 
                required
              >
                <option value="">-- Choose Lab --</option>
                {labs.map(l => (
                  <option key={l.lab_id} value={l.lab_id}>
                    {l.lab_name} ({l.location}) - {l.status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wide">Purpose / Subject</label>
              <input 
                type="text"
                placeholder="e.g. Extra class for ADA Lab"
                className="w-full text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-750 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={form.purpose} 
                onChange={e => setForm({ ...form, purpose: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wide">Booking Date</label>
              <input 
                type="date" 
                className="w-full text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-750 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={form.booking_date} 
                onChange={e => setForm({ ...form, booking_date: e.target.value })} 
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wide">Start Time</label>
                <input 
                  type="time" 
                  className="w-full text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-750 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={form.start_time} 
                  onChange={e => setForm({ ...form, start_time: e.target.value })} 
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wide">End Time</label>
                <input 
                  type="time" 
                  className="w-full text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-750 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={form.end_time} 
                  onChange={e => setForm({ ...form, end_time: e.target.value })} 
                  required
                />
              </div>
            </div>

            <button type="submit" className="w-full btn-primary py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md cursor-pointer border-0">
              Submit Booking
            </button>
          </form>
        </div>

        {/* Bookings Lists (Columns 2 & 3) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* My Bookings Table */}
          <div className="card">
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <CalendarRange size={18} className="text-teal-500" /> My Bookings ({myBookings.length})
            </h3>
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <th className="p-3">Lab</th>
                    <th className="p-3">Purpose</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Time</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myBookings.map(b => (
                    <tr key={b.booking_id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 text-slate-700 dark:text-slate-350">
                      <td className="p-3 font-semibold">{b.lab_name}</td>
                      <td className="p-3">{b.purpose || '-'}</td>
                      <td className="p-3 font-mono">{new Date(b.booking_date).toLocaleDateString()}</td>
                      <td className="p-3 font-mono">{b.start_time.slice(0,5)} - {b.end_time.slice(0,5)}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          b.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                          b.status === 'rejected' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                          'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!myBookings.length && (
                    <tr>
                      <td colSpan="5" className="p-6 text-center text-slate-500">
                        You haven't requested any bookings yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Student Booking Requests Table */}
          <div className="card">
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <ClipboardList size={18} className="text-violet-500" /> Student Booking Requests ({studentRequests.length})
            </h3>
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <th className="p-3">Requester</th>
                    <th className="p-3">Lab</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Time</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {studentRequests.map(b => (
                    <tr key={b.booking_id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 text-slate-700 dark:text-slate-350">
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{b.requester}</td>
                      <td className="p-3">{b.lab_name}</td>
                      <td className="p-3 font-mono">{new Date(b.booking_date).toLocaleDateString()}</td>
                      <td className="p-3 font-mono text-slate-500">{b.start_time.slice(0,5)} - {b.end_time.slice(0,5)}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          b.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                          b.status === 'rejected' ? 'bg-rose-500/10 text-rose-500' :
                          'bg-amber-500/10 text-amber-500'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {b.status === 'pending' ? (
                          <div className="flex gap-2 justify-center">
                            <button 
                              onClick={() => decide(b.booking_id, 'approved')} 
                              className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg cursor-pointer transition-colors border-0"
                              title="Approve"
                            >
                              <Check size={12} />
                            </button>
                            <button 
                              onClick={() => decide(b.booking_id, 'rejected')} 
                              className="p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg cursor-pointer transition-colors border-0"
                              title="Reject"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-semibold uppercase">Resolved</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!studentRequests.length && (
                    <tr>
                      <td colSpan="6" className="p-6 text-center text-slate-500">
                        No student booking requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
