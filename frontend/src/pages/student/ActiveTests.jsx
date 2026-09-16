import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { Brain, Clock, Play, CheckCircle2, Sparkles, Award } from 'lucide-react';

export default function StudentTests() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTests, setActiveTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'mcq', 'coding'

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await api.get(`/tests/active/${user?.id}`);
        setActiveTests(res.data);
      } catch (err) {
        console.error(err);
        setActiveTests([]);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchTests();
  }, [user]);

  const startTest = (test) => {
    if (test.test_type === 'coding') {
      navigate(`/student/coding-test/${test.test_id}`);
    } else {
      navigate(`/student/test/${test.test_id}`);
    }
  };

  const filteredTests = activeTests.filter(t => {
    if (filter === 'mcq') return t.test_type !== 'coding';
    if (filter === 'coding') return t.test_type === 'coding';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-purple-800 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="z-10 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <Brain size={26} />
            </div>
            <div>
              <h2 className="text-xl font-bold">My Tests & Assessments</h2>
              <p className="text-xs text-emerald-100 mt-0.5">
                Complete assigned MCQ quizzes & Proctored Coding Lab Tests with Tab Switch Security.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tests Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className="font-extrabold text-base text-slate-800 dark:text-white flex items-center gap-2">
            <Sparkles size={18} className="text-emerald-500" /> Active Assigned Tests ({filteredTests.length})
          </h3>

          <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border-0 ${
                filter === 'all' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              All Tests
            </button>
            <button
              onClick={() => setFilter('mcq')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border-0 ${
                filter === 'mcq' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              🧠 MCQ Quizzes
            </button>
            <button
              onClick={() => setFilter('coding')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border-0 ${
                filter === 'coding' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              💻 Coding Lab Exams
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-400">
            <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3"></div>
            <p className="text-sm">Loading assigned tests...</p>
          </div>
        ) : !filteredTests.length ? (
          <div className="card text-center py-12 bg-slate-50/50 dark:bg-slate-850/50 border border-slate-200 dark:border-slate-800 rounded-3xl">
            <CheckCircle2 size={48} className="mx-auto mb-3 text-emerald-500/40" />
            <h4 className="font-bold text-slate-700 dark:text-slate-200">No Pending Tests</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              You're all caught up! When new tests are assigned, they will appear here.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTests.map(t => (
              <div
                key={t.test_id}
                className={`card hover:shadow-xl hover:-translate-y-1 transition-all group border rounded-2xl ${
                  t.test_type === 'coding' ? 'border-violet-500/40 bg-slate-900/60 text-white' : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-base text-slate-800 dark:text-slate-100">{t.subject}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Assigned {new Date(t.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    t.test_type === 'coding'
                      ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {t.test_type === 'coding' ? 'Proctored Coding Exam' : 'MCQ Quiz'}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 mb-4">
                  <span className="flex items-center gap-1 font-medium">
                    <Brain size={14} className="text-violet-500" /> {t.test_type === 'coding' ? '1 Assigned Q (Pool 10)' : '10 MCQ Questions'}
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <Clock size={14} className="text-amber-500" /> {t.duration_minutes} min
                  </span>
                </div>

                <button
                  onClick={() => startTest(t)}
                  className={`w-full font-bold text-sm px-4 py-2.5 rounded-xl transition-all shadow-md group-hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer border-0 text-white ${
                    t.test_type === 'coding'
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
                  }`}
                >
                  <Play size={16} /> {t.test_type === 'coding' ? 'Start Proctored Coding Test' : 'Start MCQ Test'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
