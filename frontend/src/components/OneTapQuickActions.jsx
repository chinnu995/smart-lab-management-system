import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, GraduationCap, Users, FlaskConical, BarChart3, ClipboardCheck, CalendarRange, AlertTriangle, Brain, X } from 'lucide-react';

export default function OneTapQuickActions({ role }) {
  const [open, setOpen] = useState(false);
  const nav = useNavigate();

  // Define actions based on user role
  const actionsByRole = {
    hod: [
      { label: 'Manage Students', icon: GraduationCap, to: '/hod/students', color: 'bg-blue-600' },
      { label: 'Manage Faculty', icon: Users, to: '/hod/faculty', color: 'bg-teal-600' },
      { label: 'Manage Labs', icon: FlaskConical, to: '/hod/labs', color: 'bg-indigo-600' },
      { label: 'View Analytics', icon: BarChart3, to: '/hod/analytics', color: 'bg-purple-600' },
    ],
    faculty: [
      { label: 'Mark Attendance', icon: ClipboardCheck, to: '/faculty/attendance', color: 'bg-teal-600' },
      { label: 'Lab Bookings', icon: CalendarRange, to: '/faculty/bookings', color: 'bg-blue-600' },
      { label: 'Complaints Logs', icon: AlertTriangle, to: '/faculty/complaints', color: 'bg-rose-600' },
      { label: 'AI Test Generator', icon: Brain, to: '/faculty/tests', color: 'bg-violet-650' },
    ],
    student: [
      { label: 'Mark Attendance', icon: ClipboardCheck, to: '/student/attendance', color: 'bg-indigo-600' },
      { label: 'Book a Lab', icon: CalendarRange, to: '/student/bookings', color: 'bg-blue-600' },
      { label: 'Raise Complaint', icon: AlertTriangle, to: '/student/complaints', color: 'bg-rose-600' },
    ],
  };

  const actions = actionsByRole[role] || [];
  if (!actions.length) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {/* Expanded Menu */}
      {open && (
        <div className="flex flex-col gap-2.5 items-end mb-1 animate-fade-in">
          {actions.map((act, idx) => (
            <div 
              key={idx}
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => {
                nav(act.to);
                setOpen(false);
              }}
            >
              {/* Tooltip Label */}
              <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-200 py-1 px-2.5 rounded-lg shadow-md uppercase tracking-wider">
                {act.label}
              </span>
              
              {/* Action Button */}
              <button 
                className={`w-10 h-10 rounded-full ${act.color} text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 duration-200 cursor-pointer`}
                title={act.label}
              >
                <act.icon size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Floating Action Button Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className={`w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-xl shadow-orange-500/20 hover:shadow-orange-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer z-50`}
        aria-label="One-tap actions"
      >
        {open ? (
          <X size={20} className="animate-spin duration-300" />
        ) : (
          <div className="flex flex-col items-center justify-center">
            <Zap size={20} fill="currentColor" className="animate-bounce" />
            <span className="text-[7px] font-extrabold uppercase tracking-tighter">One Tap</span>
          </div>
        )}
      </button>
    </div>
  );
}
