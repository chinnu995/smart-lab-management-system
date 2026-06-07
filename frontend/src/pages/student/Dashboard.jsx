import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import StatCard from '../../components/StatCard.jsx';
import { ClipboardCheck, CalendarRange, Megaphone, AlertTriangle, QrCode, BookOpen, Download } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useAuth } from '../../context/AuthContext.jsx';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [att, setAtt] = useState({ overall: 0, perLab: [] });
  const [bookings, setBookings] = useState([]);
  const [anns, setAnns] = useState([]);
  const [experiments, setExperiments] = useState([]);

  useEffect(() => {
    api.get('/me/attendance').then(r => setAtt(r.data)).catch(()=>{});
    api.get('/bookings').then(r => setBookings(r.data));
    api.get('/announcements').then(r => setAnns(r.data.slice(0,5)));
    api.get('/experiments').then(r => setExperiments(r.data)).catch(()=>{});
  }, []);

  const pct = Number(att.overall) || 0;
  const pieData = [{ name:'Present', value: pct }, { name:'Missed', value: 100 - pct }];

  const getDownloadUrl = (filePath) => {
    let apiHost = import.meta.env.VITE_API_URL || 'http://localhost:5005';
    if (typeof window !== 'undefined' && window.location && window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      apiHost = `http://${window.location.hostname}:5005`;
    }
    return `${apiHost}${filePath}`;
  };

  return (
    <div className="space-y-5">
      {/* Header Greeting Panel with USN Profile */}
      <div className="glass p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">
              Welcome back, {user?.name || 'Student'}!
            </h2>
            <p className="text-xs text-slate-550 dark:text-slate-400 mt-1">
              Keep track of your lab sessions, attendance, and upcoming tests.
            </p>
          </div>
          {user?.usn && (
            <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-2xl border border-emerald-500/20 text-xs font-bold font-mono">
              USN: {user.usn}
            </div>
          )}
        </div>

        {/* Student Profile Info Strip */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/50 grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Full Name</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{user?.name || '-'}</span>
          </div>
          <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Email</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">{user?.email || '-'}</span>
          </div>
          <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Department</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">{user?.department || 'Computer Science'}</span>
          </div>
          <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">USN</span>
            <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">{user?.usn || 'N/A'}</span>
          </div>
          <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Role</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize">{user?.role || '-'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={ClipboardCheck} label="Attendance" value={`${pct}%`} accent={pct < 85 ? 'rose' : 'secondary'} />
        <StatCard icon={CalendarRange} label="My Bookings" value={bookings.length} accent="primary" />
        <StatCard icon={Megaphone} label="Announcements" value={anns.length} accent="amber" />
        <StatCard icon={AlertTriangle} label="Status" value={pct<85 ? 'Low' : 'Good'} accent={pct<85 ? 'rose' : 'secondary'} />
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        <div className="card">
          <h3 className="font-semibold mb-3">Attendance Overview</h3>
          <div className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} dataKey="value" innerRadius={50} outerRadius={80}>
                  <Cell fill="#2563EB"/><Cell fill="#E2E8F0"/>
                </Pie>
                <Tooltip/><Legend/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-3">Latest Announcements</h3>
          <ul className="space-y-2 text-sm">
            {anns.map(a => <li key={a.announcement_id} className="border-b border-slate-200 dark:border-slate-700 pb-2">
              <div className="font-medium">{a.title}</div>
              <div className="text-xs text-slate-500">{new Date(a.created_at).toLocaleString()}</div>
            </li>)}
            {!anns.length && <div className="text-slate-500">No announcements.</div>}
          </ul>
        </div>
      </div>

      {/* Lab Manuals Widget */}
      <div className="card">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <BookOpen size={18} className="text-blue-500" /> Lab Manuals & Experiments
        </h3>
        
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <th className="p-3">Lab Session</th>
                <th className="p-3">Title</th>
                <th className="p-3">Description</th>
                <th className="p-3">Uploaded By</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {experiments.map((exp) => (
                <tr key={exp.exp_id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 text-slate-700 dark:text-slate-350">
                  <td className="p-3 font-semibold">{exp.lab_name}</td>
                  <td className="p-3 font-medium">{exp.title}</td>
                  <td className="p-3 max-w-[250px] truncate">{exp.description || '-'}</td>
                  <td className="p-3 text-slate-550">{exp.uploader_name || 'Faculty'}</td>
                  <td className="p-3 text-right">
                    {exp.manual_file ? (
                      <a 
                        href={getDownloadUrl(exp.manual_file)}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-primary py-1.5 px-3 text-[10px] inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all"
                      >
                        <Download size={11} /> Download Manual
                      </a>
                    ) : (
                      <span className="text-slate-400">No file</span>
                    )}
                  </td>
                </tr>
              ))}
              {!experiments.length && (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-slate-550">
                    No lab manuals available for download.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
