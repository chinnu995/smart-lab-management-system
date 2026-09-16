import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { Code2, Clock, Play, CheckCircle2, Sparkles, ShieldAlert, AlertTriangle } from 'lucide-react';

import { getSocket } from '../../services/socket';

export default function StudentCodingTests() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [codingTests, setCodingTests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCodingTests = async () => {
    try {
      const targetId = user?.id || 'me';
      const res = await api.get(`/tests/active/${targetId}`);
      // Filter specifically for coding lab tests
      const filtered = (res.data || []).filter(t => String(t.test_type).toLowerCase() === 'coding');
      setCodingTests(filtered);
    } catch (err) {
      console.error(err);
      setCodingTests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodingTests();

    // Listen for new test creation via socket
    const s = getSocket();
    s.on('coding-test:new', () => {
      fetchCodingTests();
    });

    return () => {
      s.off('coding-test:new');
    };
  }, [user]);

  const startTest = (testId) => {
    navigate(`/student/coding-test/${testId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-violet-700 via-purple-800 to-slate-900 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="z-10 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <ShieldAlert size={26} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Faculty Conducted Coding Lab Tests</h2>
              <p className="text-xs text-purple-200 mt-0.5">
                Proctored Practical Exams assigned by subject faculty with 1 question per student & Tab Switch Security.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tests Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-base text-slate-800 dark:text-white flex items-center gap-2">
            <Code2 size={18} className="text-violet-500" /> Active Coding Exams ({codingTests.length})
          </h3>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-400">
            <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full mx-auto mb-3"></div>
            <p className="text-sm">Loading active coding lab tests...</p>
          </div>
        ) : !codingTests.length ? (
          <div className="card text-center py-12 bg-slate-50/50 dark:bg-slate-850/50 border border-slate-200 dark:border-slate-800 rounded-3xl">
            <CheckCircle2 size={48} className="mx-auto mb-3 text-violet-500/40" />
            <h4 className="font-bold text-slate-700 dark:text-slate-200">No Active Coding Lab Exams</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              You are all caught up! When a faculty member conducts a new lab test, you will receive a real-time notification here.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {codingTests.map(t => (
              <div
                key={t.test_id}
                className="card hover:shadow-xl hover:-translate-y-1 transition-all group border border-violet-500/30 bg-slate-900/60 text-white rounded-2xl p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-base text-white">{t.subject} Lab Practical Exam</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Conducted {new Date(t.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="bg-violet-500/20 text-violet-300 border border-violet-500/40 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                    Proctored Exam
                  </span>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-slate-400 mb-4">
                  <span className="flex items-center gap-1 font-medium">
                    <Code2 size={14} className="text-violet-400" /> 1 Assigned Question
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <Clock size={14} className="text-amber-400" /> {t.duration_minutes} min
                  </span>
                </div>

                <button
                  onClick={() => startTest(t.test_id)}
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-all shadow-md group-hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer border-0"
                >
                  <Play size={16} /> Begin Proctored Coding Test
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
