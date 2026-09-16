import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  ShieldAlert, ShieldCheck, Search, RefreshCw, Filter, Clock, User, 
  Terminal, AlertTriangle, CheckCircle2, Lock, FileText, Activity
} from 'lucide-react';

export default function AuditLogs() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'malpractice', 'auth', 'system'

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/audit-logs?limit=250');
      setItems(res.data || []);
    } catch (err) {
      toast.error('Failed to load security audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filtered Items
  const filteredItems = items.filter(item => {
    const matchesSearch = 
      (item.full_name && item.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.usn && item.usn.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.action && item.action.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.details && item.details.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.ip_address && item.ip_address.includes(searchTerm));

    if (!matchesSearch) return false;

    if (filterTab === 'malpractice') {
      return item.action === 'MALPRACTICE_WARNING' || item.details?.toLowerCase().includes('malpractice');
    }
    if (filterTab === 'auth') {
      return item.action?.includes('LOGIN') || item.action?.includes('REGISTER') || item.action?.includes('AUTH');
    }
    if (filterTab === 'system') {
      return item.action !== 'MALPRACTICE_WARNING' && !item.action?.includes('LOGIN');
    }
    return true;
  });

  const malpracticeCount = items.filter(i => i.action === 'MALPRACTICE_WARNING').length;
  const uniqueUsersCount = new Set(items.map(i => i.user_id)).size;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-purple-500/20">
        <div className="absolute right-0 top-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold">
              <ShieldAlert size={14} className="text-rose-400" />
              Proctored Security & Malpractice Monitoring System
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Activity & Security Audit Logs
            </h1>
            <p className="text-xs md:text-sm text-slate-300">
              Review exam proctoring malpractice alerts, tab-switching violations, user authentication, and system events.
            </p>
          </div>

          <button
            onClick={fetchLogs}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-white/20 transition cursor-pointer shrink-0"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Logs
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-slate-50/80 dark:bg-slate-850 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Audit Entries</span>
            <div className="text-2xl font-black text-slate-800 dark:text-white mt-1">{items.length}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
            <Activity size={22} />
          </div>
        </div>

        <div className="card bg-rose-500/10 p-5 rounded-2xl border border-rose-500/20 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">Malpractice Security Alerts</span>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{malpracticeCount}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center font-bold animate-pulse">
            <AlertTriangle size={22} />
          </div>
        </div>

        <div className="card bg-slate-50/80 dark:bg-slate-850 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Active Monitored Users</span>
            <div className="text-2xl font-black text-slate-800 dark:text-white mt-1">{uniqueUsersCount}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <User size={22} />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search student, USN, IP, or violation..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-purple-500 font-medium"
          />
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl w-full sm:w-auto">
          {[
            { id: 'all', label: `All Logs (${items.length})` },
            { id: 'malpractice', label: `🚨 Malpractice (${malpracticeCount})` },
            { id: 'auth', label: 'Auth Events' },
            { id: 'system', label: 'System Changes' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex-1 sm:flex-initial text-center ${
                filterTab === tab.id
                  ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Logs Listing Table */}
      <div className="card p-0 overflow-hidden border border-slate-200 dark:border-slate-800">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="animate-spin w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            Loading audit security logs...
          </div>
        ) : !filteredItems.length ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <ShieldCheck size={40} className="mx-auto text-slate-300 dark:text-slate-600" />
            <p className="font-semibold text-sm text-slate-600 dark:text-slate-400">No audit log entries matching your search filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase font-extrabold tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">User & USN</th>
                  <th className="py-3.5 px-4">Event Action</th>
                  <th className="py-3.5 px-4">Target Entity</th>
                  <th className="py-3.5 px-4">Details & Description</th>
                  <th className="py-3.5 px-4 text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredItems.map((log) => {
                  const isMalpractice = log.action === 'MALPRACTICE_WARNING';
                  return (
                    <tr
                      key={log.log_id}
                      className={`transition ${
                        isMalpractice
                          ? 'bg-rose-500/[0.04] dark:bg-rose-950/[0.1] hover:bg-rose-500/10'
                          : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Timestamp */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Clock size={13} className="text-slate-400 shrink-0" />
                          {new Date(log.created_at).toLocaleString([], {
                            month: 'short', day: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit', second: '2-digit'
                          })}
                        </div>
                      </td>

                      {/* User & USN */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                          <span>{log.full_name || 'System / Guest'}</span>
                          {log.role && (
                            <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono">
                              {log.role}
                            </span>
                          )}
                        </div>
                        {log.usn && (
                          <div className="text-[11px] font-mono text-purple-600 dark:text-purple-400 font-semibold mt-0.5">
                            {log.usn} {log.department ? `(${log.department})` : ''}
                          </div>
                        )}
                      </td>

                      {/* Event Action Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isMalpractice ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30">
                            <AlertTriangle size={12} className="text-rose-500" /> Malpractice Alert
                          </span>
                        ) : log.action?.includes('LOGIN') ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 size={12} /> {log.action}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20">
                            <Activity size={12} /> {log.action}
                          </span>
                        )}
                      </td>

                      {/* Target Entity */}
                      <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400">
                        {log.entity ? `${log.entity} #${log.entity_id || ''}` : '—'}
                      </td>

                      {/* Description / Details */}
                      <td className="py-3.5 px-4">
                        <div className={`leading-relaxed ${
                          isMalpractice
                            ? 'font-semibold text-rose-700 dark:text-rose-300 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20'
                            : 'text-slate-700 dark:text-slate-300 font-medium'
                        }`}>
                          {log.details || 'No additional details logged'}
                        </div>
                      </td>

                      {/* IP Address */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-400 dark:text-slate-500 whitespace-nowrap">
                        {log.ip_address || '127.0.0.1'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
