import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function AuditLogs() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get('/audit-logs?limit=200').then(r => setItems(r.data)); }, []);
  return (
    <div className="card">
      <h3 className="font-semibold mb-3">Audit Logs</h3>
      <table className="w-full text-sm">
        <thead><tr className="text-left text-slate-500">
          <th>Time</th><th>User</th><th>Action</th><th>Entity</th><th>Details</th><th>IP</th>
        </tr></thead>
        <tbody>{items.map(l => (
          <tr key={l.log_id} className="border-t border-slate-200 dark:border-slate-700">
            <td className="py-2 text-xs whitespace-nowrap">{new Date(l.created_at).toLocaleString()}</td>
            <td>{l.full_name || '—'}</td>
            <td><span className="badge bg-slate-100 dark:bg-slate-700">{l.action}</span></td>
            <td className="text-xs">{l.entity}#{l.entity_id}</td>
            <td className="text-xs">{l.details}</td>
            <td className="text-xs text-slate-500">{l.ip_address}</td>
          </tr>
        ))}</tbody>
      </table>
      {!items.length && <div className="text-center text-slate-500 py-6">No audit entries yet.</div>}
    </div>
  );
}
