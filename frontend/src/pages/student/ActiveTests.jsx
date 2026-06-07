import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { Brain, Clock, Play, CheckCircle2 } from 'lucide-react';

export default function StudentTests() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await api.get(`/tests/active/${user?.id}`);
        setTests(res.data);
      } catch (err) {
        console.error(err);
        setTests([]);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchTests();
  }, [user]);

  const startTest = (testId) => {
    navigate(`/student/test/${testId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <Brain size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold">My Tests</h2>
            <p className="text-sm text-emerald-100 mt-0.5">AI-generated quizzes assigned to you. Complete them within the time limit.</p>
          </div>
        </div>
      </div>

      {/* Tests Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">
          <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-sm">Loading available tests...</p>
        </div>
      ) : !tests.length ? (
        <div className="card text-center py-16">
          <CheckCircle2 size={48} className="mx-auto mb-3 text-emerald-500/30" />
          <p className="text-sm text-slate-400">No pending tests. You're all caught up!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tests.map(t => (
            <div
              key={t.test_id}
              className="card hover:shadow-xl hover:-translate-y-1 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-bold text-base text-slate-800 dark:text-slate-100">{t.subject}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Created {new Date(t.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                  Active
                </span>
              </div>

              <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 mb-4">
                <span className="flex items-center gap-1">
                  <Brain size={13} /> 10 Questions
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={13} /> {t.duration_minutes} min
                </span>
              </div>

              <button
                onClick={() => startTest(t.test_id)}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm px-4 py-2.5 rounded-lg transition-all shadow-md group-hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play size={16} /> Start Test
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
