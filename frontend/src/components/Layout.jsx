import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api';
import { getSocket } from '../services/socket';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, ClipboardCheck, CalendarRange, AlertTriangle, Megaphone,
  Users, GraduationCap, FlaskConical, Cpu, BarChart3, FileText, Bot, LogOut, Bell, Moon, Sun, Code2, ShieldCheck, Award, Trophy, BookOpen, Brain, User, Gamepad2
} from 'lucide-react';

const NAV = {
  student: [
    { to: '/student', label: 'Dashboard', icon: LayoutDashboard, key: 'd' },
    { to: '/kahoot', label: 'Live Kahoot Arena', icon: Gamepad2, key: 'q' },
    { to: '/student/attendance', label: 'Attendance', icon: ClipboardCheck, key: 'a' },
    { to: '/student/lab-manuals', label: 'Lab Manuals', icon: BookOpen, key: 'lm' },
    { to: '/student/complaints', label: 'Complaints', icon: AlertTriangle, key: 'c' },
    { to: '/student/coding', label: 'Coding Arena', icon: Code2, key: 'k' },
    { to: '/student/coding-tests', label: 'Coding Lab Tests', icon: ShieldCheck, key: 'cl' },
    { to: '/student/tests', label: 'MCQ Tests', icon: Bot, key: 't' },
    { to: '/overall-toppers', label: 'Overall Toppers', icon: Trophy, key: 'ot' },
    { to: '/subject-toppers', label: 'Subject Toppers', icon: Award, key: 'st' },
    { to: '/announcements', label: 'Announcements', icon: Megaphone, key: 'n' },
    { to: '/chatbot', label: 'AI Assistant', icon: Bot, key: 'i' },
  ],
  faculty: [
    { to: '/faculty', label: 'Dashboard', icon: LayoutDashboard, key: 'd' },
    { to: '/faculty/attendance', label: 'Mark Attendance', icon: ClipboardCheck, key: 'a' },
    { to: '/faculty/lab-manuals', label: 'Lab Manuals', icon: BookOpen, key: 'lm' },
    { to: '/faculty/mcq-tests', label: 'AI MCQ Tests', icon: Brain, key: 'mt' },
    { to: '/faculty/bookings', label: 'Bookings', icon: CalendarRange, key: 'b' },
    { to: '/faculty/complaints', label: 'Complaints', icon: AlertTriangle, key: 'c' },
    { to: '/faculty/announcements', label: 'Announcements', icon: Megaphone, key: 'n' },
    { to: '/faculty/tests', label: 'Tests', icon: Bot, key: 't' },
    { to: '/faculty/coding-results', label: 'Coding Results', icon: Code2, key: 'kr' },
    { to: '/faculty/audit', label: 'Audit Logs', icon: FileText, key: 'u' },
    { to: '/overall-toppers', label: 'Overall Toppers', icon: Trophy, key: 'ot' },
    { to: '/subject-toppers', label: 'Subject Toppers', icon: Award, key: 'st' },
    { to: '/chatbot', label: 'AI Assistant', icon: Bot, key: 'i' },
  ],
  hod: [
    { to: '/hod', label: 'Dashboard', icon: LayoutDashboard, key: 'd' },
    { to: '/kahoot', label: 'Kahoot Quiz Arena', icon: Gamepad2, key: 'q' },
    { to: '/hod/students', label: 'Students', icon: GraduationCap, key: 's' },
    { to: '/hod/student-verification', label: 'Student Verification', icon: ShieldCheck, key: 'v' },
    { to: '/hod/faculty', label: 'Faculty', icon: Users, key: 'f' },
    { to: '/hod/faculty-performance', label: 'Faculty Performance', icon: Award, key: 'p' },
    { to: '/hod/labs', label: 'Labs', icon: FlaskConical, key: 'l' },
    { to: '/hod/equipment', label: 'Equipment', icon: Cpu, key: 'e' },
    { to: '/hod/complaints', label: 'Complaints', icon: AlertTriangle, key: 'c' },
    { to: '/overall-toppers', label: 'Overall Toppers', icon: Trophy, key: 'ot' },
    { to: '/subject-toppers', label: 'Subject Toppers', icon: Award, key: 'st' },
    { to: '/announcements', label: 'Announcements', icon: Megaphone, key: 'n' },
    { to: '/hod/analytics', label: 'Analytics', icon: BarChart3, key: 'y' },
    { to: '/hod/tests', label: 'Tests', icon: Bot, key: 't' },
    { to: '/hod/coding-results', label: 'Coding Results', icon: Code2, key: 'kr' },
    { to: '/hod/audit', label: 'Audit Logs', icon: FileText, key: 'u' },
  ],
};

const getImageUrl = (filePath) => {
  if (!filePath) return null;
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath;
  let apiHost = import.meta.env.VITE_API_URL || 'http://localhost:5005';
  if (typeof window !== 'undefined' && window.location && window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    apiHost = `http://${window.location.hostname}:5005`;
  }
  return `${apiHost}${filePath}`;
};

const getInitials = (name) => {
  if (!name || typeof name !== 'string') return 'U';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
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
    s.on('coding-test:new', data => {
      toast.error(
        `🚨 NEW CODING LAB TEST: ${data.subject} Practical Exam Conducted by Faculty! Click "Coding Lab Tests" in your menu to begin.`,
        { duration: 10000 }
      );
      fetchNotifications();
    });
    s.on('mcq-test:new', data => {
      toast.success(
        `📢 NEW VTU MCQ TEST: ${data.subject} Test Scheduled! Click "MCQ Tests" in your menu to begin.`,
        { duration: 10000 }
      );
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
    s.on('malpractice:alert', alertData => {
      toast.error(
        `🚨 MALPRACTICE WARNING: Student ${alertData.studentName} (${alertData.usn}) left exam window during ${alertData.subject} test! (Warning #${alertData.warningCount}/3)`,
        { duration: 10000 }
      );
      fetchNotifications();
    });
    return () => { 
      s.off('notification'); 
      s.off('announcement:new');
      s.off('coding-test:new');
      s.off('mcq-test:new');
      s.off('booking:new'); 
      s.off('complaint:new'); 
      s.off('malpractice:alert');
    };
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

  let bgClass = "bg-slate-50 dark:bg-slate-950";
  let activeLinkClass = "bg-primary text-white shadow-md";
  let sidebarBgClass = "bg-white/80 dark:bg-slate-900/80";
  let glowAccent = "from-sky-500/15 via-indigo-500/10 to-blue-500/15";

  if (user?.role === 'student') {
    bgClass = "bg-gradient-to-br from-emerald-50/90 via-teal-50/70 to-cyan-50/90 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/40";
    sidebarBgClass = "bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-emerald-200/60 dark:border-emerald-900/40 shadow-xl shadow-emerald-500/5";
    activeLinkClass = "bg-emerald-600 text-white shadow-md shadow-emerald-500/25";
    glowAccent = "from-emerald-500/20 via-teal-500/15 to-cyan-500/20";
  } else if (user?.role === 'faculty') {
    bgClass = "bg-gradient-to-br from-violet-50/90 via-purple-50/70 to-indigo-50/90 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950/40";
    sidebarBgClass = "bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-violet-200/60 dark:border-violet-900/40 shadow-xl shadow-violet-500/5";
    activeLinkClass = "bg-violet-600 text-white shadow-md shadow-violet-500/25";
    glowAccent = "from-violet-500/20 via-purple-500/15 to-indigo-500/20";
  } else if (user?.role === 'hod') {
    bgClass = "bg-gradient-to-br from-sky-50/95 via-blue-50/75 to-indigo-50/90 dark:from-slate-950 dark:via-slate-900 dark:to-sky-950/40";
    sidebarBgClass = "bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-sky-200/60 dark:border-sky-900/40 shadow-xl shadow-sky-500/5";
    activeLinkClass = "bg-sky-600 text-white shadow-md shadow-sky-500/25";
    glowAccent = "from-sky-500/20 via-blue-500/15 to-indigo-500/20";
  }

  return (
    <div 
      className={`min-h-screen flex flex-col md:flex-row transition-colors duration-300 relative overflow-hidden ${bgClass}`}
    >
      {/* Role-tailored background ambient glow Orbs */}
      <div className={`fixed -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br ${glowAccent} blur-3xl pointer-events-none z-0`} />
      <div className={`fixed -bottom-24 -left-24 w-96 h-96 rounded-full bg-gradient-to-tr ${glowAccent} blur-3xl pointer-events-none z-0`} />

      <aside className={`relative z-10 md:w-64 md:fixed md:inset-y-0 backdrop-blur-md border border-white/40 dark:border-slate-700/40 rounded-2xl shadow-glass m-0 md:m-3 p-4 flex flex-col transition-colors duration-300 ${sidebarBgClass}`}>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary grid place-items-center text-white font-bold">SL</div>
          <div>
            <div className="font-bold">Smart Lab</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Management System</div>
          </div>
        </div>
        <nav className="flex-1 space-y-1.5 overflow-auto pr-1">
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-300 ease-out group overflow-hidden ${
                  isActive
                    ? activeLinkClass + ' font-bold shadow-md pl-4'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/90 dark:hover:bg-slate-800/80 hover:translate-x-2'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Left Indicator for Active Page & Hover */}
                  <span
                    className={`absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full transition-all duration-300 ease-out ${
                      isActive
                        ? 'w-1.5 h-6 bg-white dark:bg-sky-200 shadow-md opacity-100'
                        : 'w-1 h-3 bg-sky-500/80 opacity-0 group-hover:opacity-100 group-hover:h-5'
                    }`}
                  />

                  {/* Icon: scales slightly on hover */}
                  <l.icon
                    size={18}
                    className={`shrink-0 transition-transform duration-300 ease-out group-hover:scale-115 group-hover:rotate-3 ${
                      isActive
                        ? 'text-white'
                        : 'text-slate-500 dark:text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400'
                    }`}
                  />

                  {/* Text: becomes more prominent on hover */}
                  <span className={`text-xs flex-1 transition-all duration-300 ${
                    isActive ? 'font-bold' : 'font-medium group-hover:font-bold group-hover:tracking-wide'
                  }`}>
                    {l.label}
                  </span>

                  {/* Keyboard shortcut badge: moves/scales subtly on hover */}
                  {l.key && (
                    <kbd className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-mono font-bold tracking-wider transition-all duration-300 shadow-sm ${
                      isActive 
                        ? 'bg-white/20 text-white border border-white/30 group-hover:scale-110 group-hover:translate-x-0.5' 
                        : 'bg-slate-200/60 dark:bg-slate-800/80 border border-slate-300/50 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 group-hover:scale-110 group-hover:translate-x-1 group-hover:border-sky-400/50 group-hover:text-sky-600 dark:group-hover:text-sky-300'
                    }`}>
                      {l.key}
                    </kbd>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div onClick={() => nav('/profile')} className="p-2 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/60 cursor-pointer transition-colors group flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center text-xs font-extrabold text-white shadow-sm border border-white/20 overflow-hidden shrink-0">
              {user?.profile_image ? (
                <img
                  src={getImageUrl(user.profile_image)}
                  alt={user?.name || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : (
                getInitials(user?.name)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate group-hover:text-primary transition-colors flex items-center justify-between">
                <span className="truncate">{user?.name}</span>
              </div>
              <div className="text-xs text-slate-500 capitalize flex items-center justify-between mt-0.5">
                <span>{user?.role}</span>
                {user?.usn && (
                  <span className="font-mono text-[9px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-650 dark:text-slate-400 font-bold border border-slate-200 dark:border-slate-700">
                    {user.usn}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={() => { logout(); nav('/login'); }}
                  className="mt-3 w-full btn-ghost flex items-center justify-center gap-2 text-rose-600">
            <LogOut size={16}/> Logout
          </button>
        </div>
      </aside>

      <main className="relative z-10 flex-1 md:ml-72 p-4 md:p-6">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {user?.name?.split(' ')[0]} 👋</h1>
            <p className="text-sm text-slate-500">{new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setDark(d => !d)}
              className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-amber-400 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
              aria-label="Toggle Theme"
              title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {dark ? <Sun size={20} strokeWidth={2.2} className="text-amber-400" /> : <Moon size={20} strokeWidth={2.2} className="text-indigo-600 dark:text-slate-200" />}
            </button>

            {/* Notification Bell Button */}
            <div className="relative">
              <button
                className={`w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border ${
                  notifOpen 
                    ? 'border-primary ring-2 ring-primary/20 text-primary' 
                    : 'border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:text-primary'
                } shadow-sm hover:shadow-md flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer`}
                aria-label="Notifications"
                title="Notifications"
                onClick={toggleNotifs}
              >
                <Bell size={20} strokeWidth={2.2} className={notifCount > 0 ? "text-rose-600 dark:text-rose-400" : ""} />
                
                {/* Vibrant High-Visibility Badge */}
                {notifCount > 0 ? (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 bg-gradient-to-r from-rose-500 to-red-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-md animate-pulse">
                    {notifCount > 99 ? '99+' : notifCount}
                  </span>
                ) : (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 border border-white dark:border-slate-800" title="System connected" />
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              {notifOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-90 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 text-xs text-slate-700 dark:text-slate-300 transition-all animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/80 dark:bg-slate-950/50">
                    <div className="flex items-center gap-2">
                      <Bell size={16} className="text-primary font-bold" />
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        Notifications {notifCount > 0 ? `(${notifCount} unread)` : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {notifications.some(n => !n.is_read) && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] text-primary hover:underline font-semibold bg-transparent border-0 cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button 
                          onClick={handleClearAll} 
                          className="text-[11px] text-slate-400 hover:text-rose-500 hover:underline font-medium bg-transparent border-0 cursor-pointer ml-1"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                    {notifications.map(n => (
                      <div 
                        key={n.notif_id} 
                        onClick={() => handleMarkRead(n.notif_id)}
                        className={`p-3.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer flex items-start gap-2.5 ${!n.is_read ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                      >
                        {!n.is_read ? (
                          <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0 shadow-sm shadow-rose-500/50" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-transparent mt-1.5 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className={`font-semibold ${!n.is_read ? 'text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>
                            {n.title}
                          </div>
                          {n.message && (
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                              {n.message}
                            </div>
                          )}
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-1">
                            {new Date(n.created_at).toLocaleDateString()} {new Date(n.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                      </div>
                    ))}
                    {!notifications.length && (
                      <div className="p-8 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center justify-center gap-2">
                        <Bell size={28} className="opacity-30 stroke-1" />
                        <p className="text-xs font-medium">No notifications yet</p>
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
