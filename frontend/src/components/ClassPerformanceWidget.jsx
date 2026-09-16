import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { BarChart3, BookOpen, TrendingUp, Users } from 'lucide-react';

export default function ClassPerformanceWidget() {
  const [data, setData] = useState({ overall: {}, subjects: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/class-performance')
      .then(r => setData(r.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const { overall, subjects } = data;

  return (
    <div className="space-y-5">
      {/* Overview Stat Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 flex items-center gap-3.5 border-l-4 border-l-blue-500">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
            <TrendingUp size={20} />
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Overall Class Average</span>
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {overall.overall_avg_percentage || 0}%
            </span>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-3.5 border-l-4 border-l-purple-500">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
            <BookOpen size={20} />
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Submissions</span>
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {overall.grand_total_submissions || 0}
            </span>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-3.5 border-l-4 border-l-emerald-500">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            <Users size={20} />
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Students</span>
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {overall.grand_total_participants || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Subject-wise Class Performance Table */}
      <div className="card p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <BarChart3 size={20} className="text-blue-600" />
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Subject-wise Class Performance
            </h3>
          </div>
          <span className="text-xs text-slate-400">Class accuracy & pass rate analytics</span>
        </div>

        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
                <th className="p-3">Subject</th>
                <th className="p-3 text-center">Submissions</th>
                <th className="p-3 text-center">Avg %</th>
                <th className="p-3 text-right">Pass Rate %</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map(s => (
                <tr key={s.subject} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300">
                  <td className="p-3 font-extrabold text-slate-900 dark:text-white uppercase">{s.subject}</td>
                  <td className="p-3 text-center font-semibold">{s.totalSubmissions}</td>
                  <td className="p-3 text-center font-bold text-blue-600 dark:text-blue-400">{s.avgPercentage}%</td>
                  <td className="p-3 text-right">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      s.passPercentage >= 75 ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                      s.passPercentage >= 50 ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                    }`}>
                      {s.passPercentage}%
                    </span>
                  </td>
                </tr>
              ))}
              {!subjects.length && !loading && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-slate-400">
                    No test data recorded for subjects yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
