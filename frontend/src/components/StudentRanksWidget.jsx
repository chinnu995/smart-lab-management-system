import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Trophy, Medal, Crown, Award, GraduationCap, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function StudentRanksWidget() {
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
    : ['ADA', 'DBMS', 'LATEX', 'MONGODB', 'AI', 'JAVA', 'PYTHON', 'OPERATING SYSTEMS'];

  return (
    <div className="card p-5 md:p-6 space-y-4">
      {/* Header with subject dropdown */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <Trophy size={22} />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              Subject Leaderboard & Student Ranks
            </h3>
            <p className="text-xs text-slate-500">
              Top 10 highest-performing students based on MCQ test performance
            </p>
          </div>
        </div>

        {/* Subject Filter Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Subject:</span>
          <select
            value={selectedSubject || data.subject || ''}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
          >
            {subjects.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Student Personal Rank Status Banner */}
      {user?.role === 'student' && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-sm shadow-md">
              #{data.myRank || '-'}
            </div>
            <div>
              <span className="text-xs text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider block">
                Your Rank in {data.subject}
              </span>
              <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                {data.myRank ? (
                  <span>You are ranked <strong className="text-amber-500">#{data.myRank}</strong> out of {data.totalParticipants} participating students</span>
                ) : (
                  <span className="text-slate-500 font-normal">Complete a test in {data.subject} to earn your rank on the leaderboard!</span>
                )}
              </div>
            </div>
          </div>
          {data.myRank <= 3 && data.myRank > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-black bg-amber-500/20 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full border border-amber-500/30">
              <Crown size={14} /> Top 3 Ranker!
            </span>
          )}
        </div>
      )}

      {/* Top 10 Table */}
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
                      ? 'bg-amber-500/10 dark:bg-amber-500/20 font-bold border-l-4 border-l-amber-500' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <td className="p-3.5 text-center font-black text-sm">
                    {st.rank === 1 && <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400 text-slate-900 shadow-sm">🥇</span>}
                    {st.rank === 2 && <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-300 text-slate-900 shadow-sm">🥈</span>}
                    {st.rank === 3 && <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700 text-white shadow-sm">🥉</span>}
                    {st.rank > 3 && <span className="text-slate-400">#{st.rank}</span>}
                  </td>
                  <td className="p-3.5 font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    {st.fullName}
                    {isMe && (
                      <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded uppercase">YOU</span>
                    )}
                  </td>
                  <td className="p-3.5 font-mono font-bold text-amber-600 dark:text-amber-400">{st.usn}</td>
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
                  No test submissions recorded yet for <strong>{selectedSubject || data.subject}</strong>.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
