import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, CheckCircle2, Clock, Code, Filter, Sparkles, Trophy, ChevronRight, Lock, Unlock, Calendar
} from 'lucide-react';

export default function ProblemList() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  const catTitle = category === 'all' || !category ? 'All Practice Challenges' : category;

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await api.get('/coding/problems', {
          params: { category, difficulty: difficultyFilter }
        });
        setProblems(res.data || []);
      } catch (err) {
        console.error('Failed to load problems', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, [category, difficultyFilter]);

  const handleProblemClick = (p) => {
    navigate(`/student/coding/problem/${p.slug || p.problem_id}`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Breadcrumb & Return */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/student/coding')}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Practice Skills
        </button>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          {['all', 'easy', 'medium', 'hard'].map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficultyFilter(diff)}
              className={`px-3 py-1.5 rounded-lg capitalize transition cursor-pointer ${
                difficultyFilter === diff
                  ? 'bg-white dark:bg-slate-700 text-violet-600 dark:text-violet-300 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Header Banner */}
      <div className="card bg-gradient-to-r from-violet-600 to-purple-700 text-white p-6 rounded-2xl shadow-md flex items-center justify-between">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-white/20 text-white">
            Skill Domain
          </span>
          <h1 className="text-2xl font-bold mt-1">{catTitle}</h1>
          <p className="text-xs text-purple-100 mt-0.5">Full Practice Mode • Solved challenges gain skill ratings</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
          <Code size={24} />
        </div>
      </div>

      {/* Weekly Schedule Policy Notice */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 p-4 rounded-2xl flex items-center justify-between text-xs font-semibold">
        <div className="flex items-center gap-2.5">
          <Sparkles size={18} className="text-emerald-500 shrink-0" />
          <span>
            <strong className="font-extrabold text-emerald-800 dark:text-emerald-200">Practice Mode Active:</strong> All VTU lab programs and skill challenges are fully unlocked and ready for execution.
          </span>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 text-[10px] font-extrabold uppercase">
          All Unlocked
        </span>
      </div>

      {/* Problem Listing Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="animate-spin w-8 h-8 border-3 border-violet-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            Loading problems...
          </div>
        ) : !problems.length ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Code size={40} className="mx-auto text-slate-300 dark:text-slate-600" />
            <p className="font-semibold text-sm">No coding challenges found for this selection.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {problems.map((p) => (
              <div
                key={p.problem_id}
                onClick={() => handleProblemClick(p)}
                className={`p-5 flex items-center justify-between transition ${
                  p.isLocked
                    ? 'bg-slate-50/40 dark:bg-slate-900/40 opacity-70 cursor-not-allowed'
                    : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer group'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    p.isLocked
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                      : p.solved
                      ? 'bg-emerald-500 text-white'
                      : 'bg-violet-600 text-white shadow-xs'
                  }`}>
                    {p.isLocked ? <Lock size={14} /> : p.weekNumber || 1}
                  </div>

                  <div>
                    <h3 className={`font-bold text-sm flex items-center gap-2 ${
                      p.isLocked ? 'text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-slate-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors'
                    }`}>
                      {p.title}
                      {p.solved && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle2 size={12} /> Solved
                        </span>
                      )}
                      {p.isLocked && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-500/10 px-2 py-0.5 rounded-full border border-slate-500/20">
                          <Lock size={10} /> {p.unlockStatus}
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="font-medium text-slate-500 dark:text-slate-400">{p.category}</span>
                      <span>•</span>
                      <span>Accuracy: {p.accuracy}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    p.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                    p.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                    'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                  }`}>
                    {p.difficulty}
                  </span>

                  {p.isLocked ? (
                    <button
                      disabled
                      className="bg-slate-200 dark:bg-slate-800 text-slate-400 font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1 cursor-not-allowed border-0"
                    >
                      <Lock size={13} /> Locked (Week {p.weekNumber})
                    </button>
                  ) : (
                    <button className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-xs flex items-center gap-1 cursor-pointer border-0">
                      Solve Challenge <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
