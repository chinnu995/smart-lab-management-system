import React from 'react';
export default function EmptyState({ title='Nothing here yet', hint='' }) {
  return <div className="card text-center text-slate-500 py-10">
    <div className="text-4xl mb-2">📭</div>
    <div className="font-semibold">{title}</div>
    {hint && <div className="text-sm mt-1">{hint}</div>}
  </div>;
}
