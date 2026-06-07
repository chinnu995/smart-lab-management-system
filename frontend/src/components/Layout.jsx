import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api';
import { getSocket } from '../services/socket';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, ClipboardCheck, CalendarRange, AlertTriangle, Megaphone,
  Users, GraduationCap, FlaskConical, Cpu, BarChart3, FileText, Bot, LogOut, Bell, Moon, Sun
} from 'lucide-react';

const NAV = {
  student: [
    { to: '/student', label: 'Dashboard', icon: LayoutDashboard, key: 'd' },
    { to: '/student/attendance', label: 'Attendance', icon: ClipboardCheck, key: 'a' },
    { to: '/student/bookings', label: 'Lab Bookings', icon: CalendarRange, key: 'b' },
    { to: '/student/complaints', label: 'Complaints', icon: AlertTriangle, key: 'c' },
    { to: '/student/tests', label: 'My Tests', icon: Bot, key: 't' },
    { to: '/announcements', label: 'Announcements', icon: Megaphone, key: 'n' },
    { to: '/chatbot', label: 'AI Assistant', icon: Bot, key: 'i' },
  ],
  faculty: [
    { to: '/faculty', label: 'Dashboard', icon: LayoutDashboard, key: 'd' },
    { to: '/faculty/attendance', label: 'Mark Attendance', icon: ClipboardCheck, key: 'a' },
    { to: '/faculty/bookings', label: 'Bookings', icon: CalendarRange, key: 'b' },
    { to: '/faculty/complaints', label: 'Complaints', icon: AlertTriangle, key: 'c' },
    { to: '/faculty/announcements', label: 'Announcements', icon: Megaphone, key: 'n' },
    { to: '/faculty/tests', label: 'Tests', icon: Bot, key: 't' },
    { to: '/chatbot', label: 'AI Assistant', icon: Bot, key: 'i' },
  ],
  hod: [
    { to: '/hod', label: 'Dashboard', icon: LayoutDashboard, key: 'd' },
    { to: '/hod/students', label: 'Students', icon: GraduationCap, key: 's' },
    { to: '/hod/faculty', label: 'Faculty', icon: Users, key: 'f' },
    { to: '/hod/labs', label: 'Labs', icon: FlaskConical, key: 'l' },
    { to: '/hod/equipment', label: 'Equipment', icon: Cpu, key: 'e' },
    { to: '/hod/complaints', label: 'Complaints', icon: AlertTriangle, key: 'c' },
    { to: '/announcements', label: 'Announcements', icon: Megaphone, key: 'n' },
    { to: '/hod/analytics', label: 'Analytics', icon: BarChart3, key: 'y' },
    { to: '/hod/tests', label: 'Tests', icon: Bot, key: 't' },
    { to: '/hod/audit', label: 'Audit Logs', icon: FileText, key: 'u' },
  ],
};

export default function Layout() {
  const { user, logout, setUser } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [notifCount, setNotifCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
      const unread = res.data.filter(n => !n.is_read).length;
      setNotifCount(unread);
    } catch (_) {}
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    fetchNotifications();
    const s = getSocket();
    s.connect();
    s.on('notification', n => {
      toast(n.title + (n.message ? ` — ${n.message}` : ''), { icon: '🔔' });
      fetchNotifications();
    });
    s.on('announcement:new', a => {
      toast.success(`📢 ${a.title}`);
      fetchNotifications();
    });
    s.on('booking:new', () => {
      toast('New booking request', { icon: '📅' });
      fetchNotifications();
    });
    s.on('complaint:new', c => {
      toast(`New complaint: ${c.title}`, { icon: '⚠️' });
      fetchNotifications();
    });
    return () => { s.off('notification'); s.off('announcement:new'); s.off('booking:new'); s.off('complaint:new'); };
  }, []);

  const toggleNotifs = () => {
    setNotifOpen(!notifOpen);
    if (!notifOpen) {
      fetchNotifications();
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
      toast.success('All notifications marked as read');
    } catch (_) {}
  };

  const handleClearAll = async () => {
    try {
      await api.delete('/notifications');
      fetchNotifications();
      setNotifOpen(false);
      toast.success('Notifications cleared');
    } catch (_) {}
  };

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (_) {}
  };

  const links = NAV[user?.role] || [];

  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select' || document.activeElement?.isContentEditable) {
        return;
      }

      const pressedKey = e.key.toLowerCase();
      const matchedLink = links.find(l => l.key === pressedKey);
      if (matchedLink) {
        e.preventDefault();
        nav(matchedLink.to);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [links, nav]);

  let bgClass = "bg-[#e0f2fe] dark:bg-slate-900";
  let activeLinkClass = "bg-primary text-white shadow-md";
  let sidebarBgClass = "bg-white/70 dark:bg-slate-800/60";

  if (user?.role === 'student') {
    bgClass = "bg-emerald-100/40 dark:bg-emerald-950/10";
    sidebarBgClass = "bg-emerald-100/70 dark:bg-emerald-950/40";
    activeLinkClass = "bg-emerald-600 text-white shadow-md shadow-emerald-500/20";
  } else if (user?.role === 'faculty') {
    bgClass = "bg-violet-100/40 dark:bg-violet-950/10";
    sidebarBgClass = "bg-violet-100/70 dark:bg-violet-950/40";
    activeLinkClass = "bg-violet-600 text-white shadow-md shadow-violet-500/20";
  } else if (user?.role === 'hod') {
    bgClass = "bg-sky-100/40 dark:bg-sky-950/10";
    sidebarBgClass = "bg-sky-100/70 dark:bg-sky-950/40";
    activeLinkClass = "bg-sky-600 text-white shadow-md shadow-sky-500/20";
  }

  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-colors duration-300 ${bgClass}`}>
      <aside className={`md:w-64 md:fixed md:inset-y-0 backdrop-blur-md border border-white/40 dark:border-slate-700/40 rounded-2xl shadow-glass m-0 md:m-3 p-4 flex flex-col transition-colors duration-300 ${sidebarBgClass}`}>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary grid place-items-center text-white font-bold">SL</div>
          <div>
            <div className="font-bold">Smart Lab</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Management System</div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-auto">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} end
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 hover:translate-x-1.5 hover:scale-[1.02] active:scale-95 group ${
                  isActive ? activeLinkClass
                           : 'hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200'}`
              }>
              <l.icon size={18} className="shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300" />
              <span className="text-xs font-semibold flex-1">{l.label}</span>
              {l.key && (
                <kbd className="bg-slate-200/60 dark:bg-slate-800/80 border border-slate-300/50 dark:border-slate-700/60 px-1.5 py-0.5 rounded text-[9px] uppercase font-mono font-bold tracking-wider text-slate-500 dark:text-slate-400 group-hover:scale-110 transition-all shadow-sm">
                  {l.key}
                </kbd>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="text-sm font-medium truncate">{user?.name}</div>
          <div className="text-xs text-slate-500 capitalize flex items-center justify-between">
            <span>{user?.role}</span>
            {user?.usn && (
              <span className="font-mono text-[9px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-650 dark:text-slate-400 font-bold border border-slate-200 dark:border-slate-700">
                {user.usn}
              </span>
            )}
          </div>
          <button onClick={() => { logout(); nav('/login'); }}
                  className="mt-3 w-full btn-ghost flex items-center justify-center gap-2 text-rose-600">
            <LogOut size={16}/> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 md:ml-72 p-4 md:p-6">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {user?.name?.split(' ')[0]} 👋</h1>
            <p className="text-sm text-slate-500">{new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setDark(d => !d)} className="btn-ghost" aria-label="theme">
              {dark ? <Sun size={18}/> : <Moon size={18}/>}
            </button>
            <div className="relative">
              <button className="relative btn-ghost" aria-label="notifications" onClick={toggleNotifs}>
                <Bell size={18}/>
                {notifCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] rounded-full w-4 h-4 grid place-items-center font-bold">{notifCount}</span>
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 text-[11px] text-slate-300">
                  <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
                    <span className="font-bold text-slate-200">Notifications ({notifications.filter(n=>!n.is_read).length} unread)</span>
                    <button 
                      onClick={handleClearAll} 
                      className="text-[10px] text-blue-400 hover:text-blue-300 hover:underline font-semibold bg-transparent border-0 cursor-pointer"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-800">
                    {notifications.map(n => (
                      <div 
                        key={n.notif_id} 
                        onClick={() => handleMarkRead(n.notif_id)}
                        className={`p-3 transition-colors hover:bg-slate-850/50 cursor-pointer flex items-start gap-2 ${!n.is_read ? 'bg-blue-950/15' : ''}`}
                      >
                        {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />}
                        <div className="flex-1">
                          <div className={`font-semibold ${!n.is_read ? 'text-slate-100' : 'text-slate-400'}`}>{n.title}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{n.message}</div>
                          <div className="text-[9px] text-slate-500 font-mono mt-1">
                            {new Date(n.created_at).toLocaleDateString()} {new Date(n.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                      </div>
                    ))}
                    {!notifications.length && (
                      <div className="p-6 text-center text-slate-500">
                        No notifications yet.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
