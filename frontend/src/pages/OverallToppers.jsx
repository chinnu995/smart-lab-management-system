import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Trophy, TrendingUp, BookOpen, Users, Award, Crown } from 'lucide-react';

export default function OverallToppers() {
  const [data, setData] = useState({ overall: {}, classToppers: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/class-performance')
      .then(r => setData(r.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const { overall, classToppers } = data;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Banner Header */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 text-white p-6 md:p-8 rounded-3xl shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-amber-100 border border-white/30 text-xs font-bold mb-2">
            <Trophy size={14} className="text-amber-200" /> Academic Excellence Portal
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2">
            <Trophy size={30} className="text-amber-300" /> Overall Class Toppers
          </h1>
          <p className="text-xs md:text-sm text-amber-100 mt-1">
            Department-wide academic rankings and top scorers across all subjects combined
          </p>
        </div>
      </div>

      {/* Overview Stat Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5 flex items-center gap-4 border-l-4 border-l-amber-500">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            <TrendingUp size={24} />
          </div>
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Class Average Score</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {overall.overall_avg_percentage || 0}%
            </span>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4 border-l-4 border-l-purple-500">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
            <BookOpen size={24} />
          </div>
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Total Submissions</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {overall.grand_total_submissions || 0}
            </span>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4 border-l-4 border-l-emerald-500">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            <Users size={24} />
          </div>
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Participating Students</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {overall.grand_total_participants || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Overall Class Toppers Leaderboard Table */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Crown size={20} className="text-amber-500" /> Overall Department Toppers Leaderboard
          </h3>
          <span className="text-xs text-slate-400 font-semibold">Ranked by total score & accuracy</span>
        </div>

        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
                <th className="p-3.5 text-center w-16">Rank</th>
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5">USN</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5 text-center">Tests Completed</th>
                <th className="p-3.5 text-right">Overall Percentage</th>
              </tr>
            </thead>
            <tbody>
              {classToppers.map((t) => (
                <tr key={t.usn} className="border-b border-slate-100 dark:border-slate-850 hover:bg-amber-500/5 text-slate-700 dark:text-slate-300 transition-colors">
                  <td className="p-3.5 text-center font-black text-base">
                    {t.rank === 1 && <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-400 text-slate-900 shadow-md">🥇</span>}
                    {t.rank === 2 && <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-300 text-slate-900 shadow-md">🥈</span>}
                    {t.rank === 3 && <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-700 text-white shadow-md">🥉</span>}
                    {t.rank > 3 && <span className="text-slate-400 font-extrabold">#{t.rank}</span>}
                  </td>
                  <td className="p-3.5 font-black text-sm text-slate-900 dark:text-white">{t.fullName}</td>
                  <td className="p-3.5 font-mono font-bold text-amber-600 dark:text-amber-400">{t.usn}</td>
                  <td className="p-3.5 text-slate-500">{t.department} (Sem {t.semester})</td>
                  <td className="p-3.5 text-center font-semibold">{t.totalTestsTaken}</td>
                  <td className="p-3.5 text-right font-black text-sm text-emerald-600 dark:text-emerald-400">
                    {t.overallPercentage}%
                  </td>
                </tr>
              ))}
              {!classToppers.length && !loading && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                    No overall class toppers recorded yet.
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
