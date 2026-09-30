import React from 'react';

export default function StatCard({ icon: Icon, label, value, accent='primary', onClick, shortcut, isActive }) {
  const accents = {
    primary: 'text-primary bg-primary/10 group-hover:bg-primary group-hover:text-white',
    secondary: 'text-secondary bg-secondary/10 group-hover:bg-secondary group-hover:text-white',
    rose: 'text-rose-500 bg-rose-100 dark:bg-rose-950/30 group-hover:bg-rose-500 group-hover:text-white',
    amber: 'text-amber-600 bg-amber-100 dark:bg-amber-950/30 group-hover:bg-amber-500 group-hover:text-white',
    violet: 'text-violet-600 bg-violet-100 dark:bg-violet-950/30 dark:text-violet-400 group-hover:bg-violet-600 group-hover:text-white'
  };

  return (
    <div
      onClick={onClick}
      className={`card relative overflow-hidden flex items-center gap-3 p-3.5 transition-all duration-300 ease-out group cursor-pointer border border-slate-200/80 dark:border-slate-800 hover:border-sky-400/50 hover:bg-slate-50/90 dark:hover:bg-slate-800/80 hover:translate-x-1.5 hover:shadow-lg ${
        isActive ? 'ring-2 ring-sky-500 shadow-md translate-x-1.5' : ''
      }`}
    >
      {/* Active / Hover Left Indicator Bar */}
      <span
        className={`absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full transition-all duration-300 ease-out ${
          isActive
            ? 'w-1.5 h-6 bg-sky-500 shadow-sm opacity-100'
            : 'w-1 h-3 bg-sky-500/80 opacity-0 group-hover:opacity-100 group-hover:h-5'
        }`}
      />

      {/* Icon: scales slightly on hover */}
      <div className={`w-10 h-10 shrink-0 grid place-items-center rounded-xl transition-all duration-300 ease-out group-hover:scale-110 group-hover:rotate-3 ${accents[accent]}`}>
        {Icon && <Icon size={20} className="transition-transform duration-300" />}
      </div>

      {/* Text: becomes more prominent on hover */}
      <div className="flex-1 min-w-0">
        <div className="text-xl font-extrabold text-slate-800 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors duration-300">
          {value ?? '—'}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium group-hover:font-bold group-hover:text-slate-900 dark:group-hover:text-white transition-all duration-300 truncate">
          {label}
        </div>
      </div>

      {/* Keyboard Shortcut / Badge: moves and scales subtly */}
      {shortcut && (
        <kbd className="px-1.5 py-0.5 rounded text-[9px] uppercase font-mono font-bold tracking-wider bg-slate-200/60 dark:bg-slate-800/80 border border-slate-300/50 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 group-hover:scale-110 group-hover:translate-x-1 group-hover:border-sky-400/50 group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-all duration-300 shadow-sm shrink-0">
          {shortcut}
        </kbd>
      )}
    </div>
  );
}
