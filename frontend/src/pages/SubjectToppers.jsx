import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Award, BookOpen, Crown, Trophy, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function SubjectToppers() {
  const { user } = useAuth();
  const [data, setData] = useState({ top10: [], availableSubjects: [], subject: 'ADA', myRank: null });
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchRanks = (subj) => {
    setLoading(true);
    const query = subj ? `?subject=${encodeURIComponent(subj)}` : '';
    api.get(`/ranks/leaderboard${query}`)
      .then(r => {
        setData(r.data);
        if (!selectedSubject && r.data.subject) {
          setSelectedSubject(r.data.subject);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRanks(selectedSubject);
  }, [selectedSubject]);

  const subjects = data.availableSubjects.length > 0
    ? data.availableSubjects
    : (user?.role === 'faculty'
        ? (user?.subject ? [user.subject] : [])
        : ['ADA', 'DBMS', 'LATEX', 'MONGODB', 'AI', 'JAVA', 'PYTHON', 'OPERATING SYSTEMS']);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-blue-100 border border-white/30 text-xs font-bold mb-2">
            <Award size={14} className="text-blue-200" /> Subject-wise Leaderboard Portal
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2">
            <Award size={30} className="text-blue-300" /> Subject-wise Toppers & Rankings
          </h1>
          <p className="text-xs md:text-sm text-blue-100 mt-1">
            Filter by subject to view top 10 rankers and evaluate student accuracy per module
          </p>
        </div>

        {/* Subject Filter Selector in Header */}
        <div className="w-full md:w-72">
          <label className="block text-[11px] font-bold text-blue-200 uppercase tracking-wider mb-1">Select Subject</label>
          <select
            value={selectedSubject || data.subject || ''}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full text-xs font-extrabold bg-white/10 border border-white/30 text-white rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer"
          >
            {subjects.map(s => (
              <option key={s} value={s} className="text-slate-900">{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Student Personal Rank Status Banner (if student) */}
      {user?.role === 'student' && (
        <div className="bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/20 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-base shadow-md">
              #{data.myRank || '-'}
            </div>
            <div>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider block">
                Your Rank in {data.subject}
              </span>
              <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                {data.myRank ? (
                  <span>You are ranked <strong className="text-blue-600 dark:text-blue-400">#{data.myRank}</strong> out of {data.totalParticipants} participating students</span>
                ) : (
                  <span className="text-slate-500 font-normal">No test submitted for {data.subject} yet. Take a test to earn your rank!</span>
                )}
              </div>
            </div>
          </div>
          {data.myRank <= 3 && data.myRank > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-black bg-blue-500/20 text-blue-600 dark:text-blue-400 px-3.5 py-1.5 rounded-full border border-blue-500/30">
              <Crown size={14} /> Subject Top 3 Ranker!
            </span>
          )}
        </div>
      )}

      {/* Subject Toppers Table */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen size={20} className="text-blue-600" /> Top 10 Toppers for {selectedSubject || data.subject}
          </h3>
          <span className="text-xs text-slate-400 font-semibold">Ranked by test score & accuracy</span>
        </div>

        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
                <th className="p-3.5 text-center w-16">Rank</th>
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5">USN</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5 text-center">Tests Taken</th>
                <th className="p-3.5 text-right">Avg Score %</th>
              </tr>
            </thead>
            <tbody>
              {data.top10.map((st) => {
                const isMe = user?.usn && st.usn === user.usn;
                return (
                  <tr 
                    key={st.studentId} 
                    className={`border-b border-slate-100 dark:border-slate-850 text-slate-700 dark:text-slate-300 transition-colors ${
                      isMe 
                        ? 'bg-blue-500/10 dark:bg-blue-500/20 font-bold border-l-4 border-l-blue-500' 
                        : 'hover:bg-blue-50/40 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="p-3.5 text-center font-black text-base">
                      {st.rank === 1 && <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-400 text-slate-900 shadow-md">🥇</span>}
                      {st.rank === 2 && <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-300 text-slate-900 shadow-md">🥈</span>}
                      {st.rank === 3 && <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-700 text-white shadow-md">🥉</span>}
                      {st.rank > 3 && <span className="text-slate-400 font-extrabold">#{st.rank}</span>}
                    </td>
                    <td className="p-3.5 font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      {st.fullName}
                      {isMe && (
                        <span className="text-[9px] bg-blue-600 text-white font-black px-1.5 py-0.5 rounded uppercase">YOU</span>
                      )}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">{st.usn}</td>
                    <td className="p-3.5 text-slate-500">{st.department} (Sem {st.semester})</td>
                    <td className="p-3.5 text-center font-semibold">{st.testsCompleted}</td>
                    <td className="p-3.5 text-right font-black text-sm text-emerald-600 dark:text-emerald-400">
                      {st.avgPercentage}%
                    </td>
                  </tr>
                );
              })}
              {!data.top10.length && !loading && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                    No test submissions recorded yet for subject <strong>{selectedSubject || data.subject}</strong>.
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
