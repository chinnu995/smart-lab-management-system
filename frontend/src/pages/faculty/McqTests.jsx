import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Brain, Plus, Sparkles, Loader2, Bot, CheckCircle2 } from 'lucide-react';

export default function FacultyMcqTests() {
  const [tests, setTests] = useState([]);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [duration, setDuration] = useState(10);
  const [generating, setGenerating] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsModalOpen, setSubmissionsModalOpen] = useState(false);

  const fetchTests = () => {
    api.get('/tests/created').then(r => setTests(r.data)).catch(()=>{});
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const handleGenerateTest = async (e) => {
    e.preventDefault();
    if (!subject) return toast.error('Please select a subject');
    setGenerating(true);
    const tid = toast.loading(`Generating ${subject} test via AI...`);
    try {
      const res = await api.post('/tests/generate', { subject, duration });
      toast.dismiss(tid);
      toast.success(`Test created! ${res.data.questionCount || 10} questions generated.`);
      fetchTests();
      setTestModalOpen(false);
      setSubject('');
    } catch (err) {
      toast.dismiss(tid);
      toast.error(err.response?.data?.details || err.response?.data?.error || 'Failed to generate test');
    } finally {
      setGenerating(false);
    }
  };

  const loadSubmissions = async (test) => {
    const tid = toast.loading('Loading submissions...');
    try {
      const res = await api.get(`/tests/${test.test_id}/submissions`);
      setSubmissions(res.data);
      setSelectedTest(test);
      setSubmissionsModalOpen(true);
      toast.dismiss(tid);
    } catch (err) {
      toast.dismiss(tid);
      toast.error('Failed to load submissions.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-violet-950 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl border border-violet-500/20 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 text-xs font-bold mb-2">
            <Sparkles size={14} className="text-violet-400" /> AI Examination Engine
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2">
            <Brain size={28} className="text-violet-400" /> AI MCQ Tests & Student Submissions
          </h1>
          <p className="text-xs md:text-sm text-slate-300 mt-1">
            Generate AI-powered subject tests in seconds and inspect real-time student evaluation scores.
          </p>
        </div>

        <button 
          onClick={() => setTestModalOpen(true)}
          className="btn btn-primary bg-violet-600 hover:bg-violet-700 text-white font-bold px-5 py-2.5 rounded-2xl shadow-lg flex items-center gap-2 cursor-pointer transition-all active:scale-95 whitespace-nowrap"
        >
          <Plus size={18} /> Generate Test with AI
        </button>
      </div>

      {/* Created Tests Table */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Bot size={20} className="text-violet-500" /> Scheduled MCQ Tests Registry
            </h3>
            <p className="text-xs text-slate-400">Total generated tests: {tests.length}</p>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
                <th className="p-3.5">Subject</th>
                <th className="p-3.5">Created Date</th>
                <th className="p-3.5">Duration</th>
                <th className="p-3.5">Questions</th>
                <th className="p-3.5 text-center">Submissions</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((t) => (
                <tr key={t.test_id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-violet-50/40 dark:hover:bg-slate-800/30 text-slate-700 dark:text-slate-300 transition-colors">
                  <td className="p-3.5 font-extrabold text-slate-900 dark:text-white">{t.subject}</td>
                  <td className="p-3.5">{new Date(t.created_at).toLocaleDateString()} {new Date(t.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
                  <td className="p-3.5 font-semibold">{t.duration_minutes} mins</td>
                  <td className="p-3.5">{t.question_count} Qs</td>
                  <td className="p-3.5 text-center font-bold text-violet-600 dark:text-violet-400">{t.submission_count}</td>
                  <td className="p-3.5 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      t.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <button 
                      onClick={() => loadSubmissions(t)}
                      className="text-violet-600 dark:text-violet-400 hover:text-violet-800 font-extrabold hover:underline cursor-pointer bg-violet-50 dark:bg-violet-950/50 px-3 py-1.5 rounded-xl border border-violet-200 dark:border-violet-800 transition-all"
                    >
                      View Results
                    </button>
                  </td>
                </tr>
              ))}
              {!tests.length && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400 font-medium">
                    No MCQ tests generated yet. Click "Generate Test with AI" above to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Test Modal */}
      {testModalOpen && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-900 text-white">
              <h3 className="font-bold flex items-center gap-2 text-sm">
                <Brain size={18} className="text-violet-400" /> AI MCQ Test Generator
              </h3>
              <button 
                onClick={() => setTestModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-xs font-semibold"
              >
                Close
              </button>
            </div>
            
            <form onSubmit={handleGenerateTest} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Select Subject</label>
                <select 
                  className="input text-xs font-medium"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                >
                  <option value="">-- Choose Subject --</option>
                  {['ADA', 'DBMS', 'LATEX', 'MONGODB', 'AI', 'JAVA', 'PYTHON', 'OPERATING SYSTEMS'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Duration (minutes)</label>
                <input 
                  type="number"
                  min="1"
                  max="60"
                  className="input text-xs font-medium"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  required
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setTestModalOpen(false)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={generating}
                  className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {generating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  {generating ? 'Generating...' : 'Generate Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Test Submissions Modal */}
      {submissionsModalOpen && selectedTest && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl space-y-4">
            <div className="bg-gradient-to-r from-violet-600 to-purple-700 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-extrabold leading-tight">{selectedTest.subject} MCQ Test Submissions</h3>
                <p className="text-xs text-purple-100 mt-1 font-mono">
                  Total submissions: {submissions.length} | Duration: {selectedTest.duration_minutes} min
                </p>
              </div>
              <button 
                onClick={() => setSubmissionsModalOpen(false)}
                className="text-white/80 hover:text-white font-bold text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="p-6 max-h-[65vh] overflow-y-auto space-y-4">
              {/* 🤖 AI Automated Evaluation Summary Banner */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-violet-500/30 flex items-center justify-between text-xs text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/40 flex items-center justify-center font-bold shrink-0">
                    🤖 AI
                  </div>
                  <div>
                    <h4 className="font-bold text-white flex items-center gap-2">
                      AI Automated Evaluation Complete
                      <span className="bg-emerald-500/20 text-emerald-300 text-[9px] px-2 py-0.5 rounded-full font-mono">
                        0% Manual Intervention Required
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Graded automatically via AI evaluation engine with exam integrity verified.
                    </p>
                  </div>
                </div>
                <div className="text-right font-mono text-[11px] shrink-0">
                  <div className="text-emerald-400 font-bold">
                    Class Avg: {submissions.length ? Math.round(submissions.reduce((acc, s) => acc + (s.score/s.total_questions)*100, 0) / submissions.length) : 0}%
                  </div>
                  <div className="text-violet-300 text-[10px]">Integrity: Secured</div>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
                      <th className="p-3.5">Student Name</th>
                      <th className="p-3.5">USN</th>
                      <th className="p-3.5">Dept / Sem</th>
                      <th className="p-3.5 text-center">Score</th>
                      <th className="p-3.5 text-right">Submitted At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((sub) => {
                      const pct = Math.round((sub.score / sub.total_questions) * 100);
                      return (
                        <tr key={sub.submission_id} className="border-b border-slate-100 dark:border-slate-850 text-slate-700 dark:text-slate-300">
                          <td className="p-3.5 font-bold text-slate-900 dark:text-white">{sub.full_name}</td>
                          <td className="p-3.5 font-mono text-purple-600 font-bold">{sub.usn}</td>
                          <td className="p-3.5 text-slate-500">
                            {sub.department} (Sem {sub.semester})
                          </td>
                          <td className="p-3.5 text-center font-bold">
                            <span className={`px-2.5 py-0.5 rounded-full font-mono text-xs border ${
                              pct >= 70 ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' :
                              pct >= 40 ? 'text-amber-600 bg-amber-500/10 border-amber-500/20' : 'text-rose-600 bg-rose-500/10 border-rose-500/20'
                            }`}>
                              {sub.score} / {sub.total_questions} ({pct}%)
                            </span>
                          </td>
                          <td className="p-3.5 text-right text-slate-400 font-mono">
                            {new Date(sub.submitted_at).toLocaleDateString()} {new Date(sub.submitted_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                          </td>
                        </tr>
                      );
                    })}
                    {!submissions.length && (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-slate-400">
                          No student submissions recorded for this test yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button 
                onClick={() => setSubmissionsModalOpen(false)}
                className="bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Close Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
