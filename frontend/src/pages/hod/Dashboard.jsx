import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import StatCard from '../../components/StatCard.jsx';
import { 
  GraduationCap, Users, FlaskConical, Cpu, CalendarRange, AlertTriangle, 
  Megaphone, ShieldCheck, Award, Code2, ArrowRight, Sparkles, Plus, CheckCircle2 
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

  useEffect(() => {
    api.get('/analytics/overview').then(r => setOv(r.data));
    api.get('/analytics/labs').then(r => setLabs(r.data));
    api.get('/analytics/equipment').then(r => setEq(r.data));
  }, []);

  useEffect(() => {
    const s = getSocket();
    s.connect();

    const handleUpdate = () => {
      api.get('/analytics/overview').then(r => setOv(r.data));
      api.get('/analytics/labs').then(r => setLabs(r.data));
      api.get('/analytics/equipment').then(r => setEq(r.data));
    };

    s.on('booking:new', handleUpdate);
    s.on('booking:changed', handleUpdate);
    s.on('lab:status_changed', handleUpdate);
    s.on('complaint:new', handleUpdate);
    s.on('complaint:changed', handleUpdate);
    s.on('attendance:changed', handleUpdate);

    return () => {
      s.off('booking:new', handleUpdate);
      s.off('booking:changed', handleUpdate);
      s.off('lab:status_changed', handleUpdate);
      s.off('complaint:new', handleUpdate);
      s.off('complaint:changed', handleUpdate);
      s.off('attendance:changed', handleUpdate);
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
              className="btn btn-primary bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-sm"
            >
              <Megaphone size={15} /> Broadcast Announcement
            </button>
          </div>
        </div>

        {/* HOD Profile Info Strip */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-700/50 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Full Name</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{user?.name || 'Dr. Anitha Rao'}</span>
          </div>
          <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Email</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">{user?.email || '-'}</span>
          </div>
          <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Department</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">{user?.department || 'Computer Science & Engineering'}</span>
          </div>
          <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Role</span>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 capitalize">Head of Department</span>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <StatCard icon={GraduationCap} label="Students" value={ov.students}/>
        <StatCard icon={Users} label="Faculty" value={ov.faculty} accent="secondary"/>
        <StatCard icon={FlaskConical} label="Labs" value={ov.labs} accent="amber"/>
        <StatCard icon={Cpu} label="Equipment" value={ov.equipment} accent="rose"/>
        <StatCard icon={CalendarRange} label="Bookings" value={ov.activeBookings}/>
        <StatCard icon={AlertTriangle} label="Complaints" value={ov.openComplaints} accent="rose"/>
        <StatCard icon={Megaphone} label="Broadcasts" value={ov.announcements} accent="amber"/>
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
            <ResponsiveContainer>
              <PieChart>
                <Pie data={eq} dataKey="count" nameKey="status" outerRadius={85}>
                  {eq.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Overall Class Performance & Subject Analytics */}
      <ClassPerformanceWidget />
    </div>
  );
}
