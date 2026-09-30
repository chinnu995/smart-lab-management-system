import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import StatCard from '../../components/StatCard.jsx';
import { 
  GraduationCap, Users, FlaskConical, Cpu, CalendarRange, AlertTriangle, 
  Megaphone, ShieldCheck, Award, Code2, ArrowRight, Sparkles, Plus, CheckCircle2, User, Edit3, Radio, Clock 
} from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { getSocket } from '../../services/socket';
import { useAuth } from '../../context/AuthContext.jsx';
import ClassPerformanceWidget from '../../components/ClassPerformanceWidget.jsx';

const COLORS = ['#2563EB','#14B8A6','#F59E0B','#EF4444','#8B5CF6'];

export default function HodDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ov, setOv] = useState({});
  const [labs, setLabs] = useState([]);
  const [eq, setEq] = useState([]);
  const [hodSessions, setHodSessions] = useState([]);
  const [nowTime, setNowTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNowTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getRemainingSeconds = (expiresAt) => {
    if (!expiresAt) return 900;
    const target = new Date(expiresAt).getTime();
    return Math.max(0, Math.floor((target - nowTime) / 1000));
  };

  const formatTimeLeft = (seconds) => {
    if (seconds <= 0) return '00:00 Expired';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const unexpiredHodSessions = hodSessions.filter(s => {
    if (!s.qr_expires_at) return true;
    return new Date(s.qr_expires_at).getTime() > nowTime;
  });

  const fetchHodSessions = () => {
    api.get('/attendance/sessions/hod/active')
      .then(r => setHodSessions(Array.isArray(r.data) ? r.data : []))
      .catch(() => {});
  };

  useEffect(() => {
    api.get('/analytics/overview').then(r => setOv(r.data));
    api.get('/analytics/labs').then(r => setLabs(r.data));
    api.get('/analytics/equipment').then(r => setEq(Array.isArray(r.data) ? r.data.map(d => ({ ...d, count: Number(d.count||0) })) : []));
    fetchHodSessions();
  }, []);

  useEffect(() => {
    const s = getSocket();
    s.connect();

    const handleUpdate = () => {
      api.get('/analytics/overview').then(r => setOv(r.data));
      api.get('/analytics/labs').then(r => setLabs(r.data));
      api.get('/analytics/equipment').then(r => setEq(Array.isArray(r.data) ? r.data.map(d => ({ ...d, count: Number(d.count||0) })) : []));
      fetchHodSessions();
    };

    s.on('booking:new', handleUpdate);
    s.on('booking:changed', handleUpdate);
    s.on('lab:status_changed', handleUpdate);
    s.on('complaint:new', handleUpdate);
    s.on('complaint:changed', handleUpdate);
    s.on('attendance:changed', handleUpdate);
    s.on('equipment:changed', handleUpdate);
    s.on('session:created', handleUpdate);
    s.on('session:closed', handleUpdate);

    return () => {
      s.off('booking:new', handleUpdate);
      s.off('booking:changed', handleUpdate);
      s.off('lab:status_changed', handleUpdate);
      s.off('complaint:new', handleUpdate);
      s.off('complaint:changed', handleUpdate);
      s.off('attendance:changed', handleUpdate);
      s.off('equipment:changed', handleUpdate);
      s.off('session:created', handleUpdate);
      s.off('session:closed', handleUpdate);
    };
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Action Banner & Profile Info */}
      <div className="glass p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-bold mb-2">
              <Sparkles size={14} /> Department Administrative Hub
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white">
              Welcome back, {user?.name || 'HOD'}!
            </h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Monitor lab utilization, broadcast announcements, and access student & faculty management modules.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate('/announcements')}
              className="btn btn-primary bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
            >
              <Megaphone size={15} /> Broadcast Announcement
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards & Interactive Module Shortcut Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <StatCard icon={GraduationCap} label="Students" value={ov.students} shortcut="s" onClick={() => navigate('/hod/students')} />
        <StatCard icon={Users} label="Faculty" value={ov.faculty} accent="secondary" shortcut="f" onClick={() => navigate('/hod/faculty')} />
        <StatCard icon={FlaskConical} label="Labs" value={ov.labs} accent="amber" shortcut="l" onClick={() => navigate('/hod/labs')} />
        <StatCard icon={Cpu} label="Equipment" value={ov.equipment} accent="rose" shortcut="e" onClick={() => navigate('/hod/equipment')} />
        <StatCard icon={CalendarRange} label="Bookings" value={ov.activeBookings} shortcut="b" onClick={() => navigate('/hod/labs')} />
        <StatCard icon={AlertTriangle} label="Complaints" value={ov.openComplaints} accent="rose" shortcut="c" onClick={() => navigate('/hod/complaints')} />
        <StatCard icon={Megaphone} label="Broadcasts" value={ov.announcements} accent="amber" shortcut="n" onClick={() => navigate('/announcements')} />
      </div>

      {/* Real-Time Active Lab Sessions Monitor */}
      <div className="card p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="font-extrabold text-slate-800 dark:text-white text-base flex items-center gap-2">
              <Radio className="text-emerald-500 animate-pulse" size={18} />
              Real-Time Active Lab Sessions Monitor
            </h3>
            <p className="text-xs text-slate-500">Live simultaneous laboratory occupancy, subject faculty, class section, and attendance percentage</p>
          </div>
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full">
            HOD Monitoring View
          </span>
        </div>

        {unexpiredHodSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {unexpiredHodSessions.map(s => {
              const remaining = getRemainingSeconds(s.qr_expires_at);
              return (
                <div key={s.session_id} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">📍 {s.lab_name}</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">{s.class_name}</span>
                  </div>
                  <div className="font-extrabold text-sm text-slate-800 dark:text-white">{s.subject}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Faculty: <strong>{s.faculty_name}</strong></div>
                  
                  <div className="flex items-center justify-between text-[11px] font-mono text-amber-500 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                    <span className="flex items-center gap-1 font-bold"><Clock size={11} /> Expiry:</span>
                    <span className="font-bold">{formatTimeLeft(remaining)}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">Attendance:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      {s.present_count} / {s.total_students} ({s.pct}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-slate-400">
            No active lab sessions currently running.
          </div>
        )}
      </div>

      {/* Analytics Charts */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="card p-5">
          <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-3">Lab Utilization & Approvals</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={labs}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="lab_name" tick={{ fontSize: 11 }}/>
                <YAxis /><Tooltip />
                <Bar dataKey="approved" fill="#2563EB" name="Approved Bookings"/>
                <Bar dataKey="total" fill="#94A3B8" name="Total Requests"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-3">Equipment Maintenance & Allocation</h3>
          <div className="h-64">
            {eq.length > 0 && eq.some(i => Number(i.count) > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={eq.map(i => ({ ...i, statusName: (i.status||'').replace(/_/g, ' ').toUpperCase(), count: Number(i.count||0) }))}
                    dataKey="count"
                    nameKey="statusName"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                  >
                    {eq.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                  </Pie>
                  <Tooltip /><Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">
                No equipment data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overall Class Performance & Subject Analytics */}
      <ClassPerformanceWidget />
    </div>
  );
}
