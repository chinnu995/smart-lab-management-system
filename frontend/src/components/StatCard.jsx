import React from 'react';
export default function StatCard({ icon: Icon, label, value, accent='primary' }) {
  const accents = { primary:'text-primary bg-primary/10', secondary:'text-secondary bg-secondary/10', rose:'text-rose-500 bg-rose-100', amber:'text-amber-600 bg-amber-100', violet:'text-violet-600 bg-violet-100 dark:bg-violet-950/30 dark:text-violet-400' };
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 grid place-items-center rounded-xl ${accents[accent]}`}>{Icon && <Icon size={22}/>}</div>
      <div>
        <div className="text-2xl font-bold">{value ?? '—'}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      </div>
    </div>
  );
}
