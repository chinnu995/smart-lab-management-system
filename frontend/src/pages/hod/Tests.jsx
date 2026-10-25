import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Brain, Clock, Users, CheckCircle2, Sparkles, Loader2, BookOpen, GraduationCap } from 'lucide-react';

// VTU CS Allied Lab Subjects grouped by semester (2022 & 2025 Scheme)
const SUBJECTS_BY_SEM = {
  1: ['C PROGRAMMING'],
  2: ['PYTHON'],
  3: [
    'DATA STRUCTURES',
    'OPERATING SYSTEMS',
    'JAVA',
    'C++',
    'DIGITAL DESIGN & COMPUTER ORGANIZATION',
    'GIT & VERSION CONTROL',
    'DATA VISUALIZATION WITH PYTHON',
  ],
  4: ['ADA', 'DBMS'],
  5: ['COMPUTER NETWORKS', 'IOT'],
  6: ['AI', 'MACHINE LEARNING', 'MONGODB'],
  7: ['LATEX', 'DSA', 'WEB TECHNOLOGIES'],
};

const ALL_SUBJECTS = [
  ...Object.values(SUBJECTS_BY_SEM).flat(),
  'Custom...',
];

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const SCHEMES   = ['2022', '2025'];

const SEM_LABELS = {
  1: '1st Sem', 2: '2nd Sem', 3: '3rd Sem', 4: '4th Sem',
  5: '5th Sem', 6: '6th Sem', 7: '7th Sem', 8: '8th Sem',
};

export default function HodTests() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  // Form state
  const [targetSemester, setTargetSemester] = useState('');
  const [scheme,         setScheme]         = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [customSubject,   setCustomSubject]   = useState('');
  const [duration,        setDuration]        = useState(10);
  const [testType,        setTestType]        = useState('mcq');
  const [generating,      setGenerating]      = useState(false);

  // Tests list
  const [tests, setTests] = useState([]);

  // Submissions modal
  const [selectedTest,          setSelectedTest]          = useState(null);
  const [submissions,           setSubmissions]           = useState([]);
  const [submissionsModalOpen,  setSubmissionsModalOpen]  = useState(false);

  // Derive subjects list from chosen semester (or all if none chosen)
  const subjectsForSem = targetSemester
    ? [...(SUBJECTS_BY_SEM[parseInt(targetSemester)] || []), 'Custom...']
    : ALL_SUBJECTS;

  // Reset subject when semester changes so stale subject isn't sent
  useEffect(() => {
    setSelectedSubject('');
    setCustomSubject('');
  }, [targetSemester]);

  const fetchTests = async () => {
    try {
      const res = await api.get('/tests/created');
      setTests(res.data);
    } catch (_) { setTests([]); }
  };

  useEffect(() => { fetchTests(); }, []);

  const handleGenerate = async () => {
    const finalSubject = selectedSubject === 'Custom...' ? customSubject.trim() : selectedSubject;
    if (!finalSubject) return toast.error('Please select or enter a subject');
    if (!targetSemester) return toast.error('Please select a target semester');
    if (!scheme) return toast.error('Please select a VTU scheme');

    setGenerating(true);
    const endpoint = testType === 'coding' ? '/tests/generate-coding' : '/tests/generate';
    const tid = toast.loading(
      `Generating ${finalSubject} ${testType === 'coding' ? 'Coding Lab Exam' : 'MCQ Test'} for Sem ${targetSemester}...`
    );
    try {
      const res = await api.post(endpoint, {
        subject: finalSubject,
        duration,
        target_semester: parseInt(targetSemester, 10),
        scheme,
      });
      toast.dismiss(tid);
      toast.success(res.data.message || 'Test created!');
      fetchTests();
      setSelectedSubject('');
      setCustomSubject('');
    } catch (e) {
      toast.dismiss(tid);
      toast.error(e.response?.data?.details || e.response?.data?.error || 'Failed to generate test');
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
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-700 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <Brain size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Lab Test &amp; Assessment Generator</h2>
            <p className="text-sm text-purple-100 mt-0.5">Generate MCQ Tests &amp; Proctored Coding Lab Practical Exams per Semester &amp; Scheme</p>
          </div>
        </div>
      </div>

      {/* Generation Form */}
      <div className="card">
        <h3 className="font-semibold flex items-center gap-2 mb-4">
          <Sparkles size={18} className="text-violet-500" /> Create New Test
        </h3>

        {/* Test Type Selector */}
        <div className="flex items-center gap-3 mb-5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setTestType('mcq')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer border-0 ${
              testType === 'mcq' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            🧠 AI MCQ Test (10 Questions)
          </button>
          <button
            onClick={() => setTestType('coding')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer border-0 ${
              testType === 'coding' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            💻 Proctored Coding Lab Test (1 Q per Student, Batch Shuffled)
          </button>
        </div>

        {/* Row 1: Semester + Scheme */}
        <div className="flex flex-wrap items-end gap-4 mb-4">
          {/* Target Semester */}
          <div className="w-40">
            <label className="text-xs font-semibold text-slate-500 flex items-center gap-1 mb-1.5">
              <GraduationCap size={13} /> Target Semester <span className="text-rose-500">*</span>
            </label>
            <select
              value={targetSemester}
              onChange={e => setTargetSemester(e.target.value)}
              className="w-full text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="">-- Semester --</option>
              {SEMESTERS.map(s => (
                <option key={s} value={s}>Sem {s}</option>
              ))}
            </select>
          </div>

          {/* Scheme */}
          <div className="w-36">
            <label className="text-xs font-semibold text-slate-500 flex items-center gap-1 mb-1.5">
              <BookOpen size={13} /> VTU Scheme <span className="text-rose-500">*</span>
            </label>
            <select
              value={scheme}
              onChange={e => setScheme(e.target.value)}
              className="w-full text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="">-- Scheme --</option>
              {SCHEMES.map(sc => (
                <option key={sc} value={sc}>{sc} Scheme</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Subject + Duration + Generate */}
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-semibold text-slate-500 block mb-1.5">
              Subject {targetSemester && <span className="text-violet-400">(Sem {targetSemester} subjects)</span>}
            </label>
            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="w-full text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="">-- Select Subject --</option>
              {subjectsForSem.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {selectedSubject === 'Custom...' && (
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-semibold text-slate-500 block mb-1.5">Custom Subject Name</label>
              <input
                type="text"
                placeholder="e.g. Data Structures"
                value={customSubject}
                onChange={e => setCustomSubject(e.target.value)}
                className="w-full text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          )}

          <div className="w-32">
            <label className="text-xs font-semibold text-slate-500 block mb-1.5">Duration (min)</label>
            <input
              type="number"
              min="1"
              max="180"
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
              className="w-full text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold text-sm px-6 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer border-0"
          >
            {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {generating ? 'Generating...' : testType === 'coding' ? 'Create Coding Test' : 'Generate MCQ Test'}
          </button>
        </div>

        <p className="text-[10px] text-slate-400 mt-3">
          {testType === 'coding'
            ? 'Proctored Coding Test mode creates a pool of 10 lab programs. Each student receives 1 question assigned with batch shuffling and Tab Switch Security enabled.'
            : 'AI will generate 10 multiple-choice questions with 4 options each. Only students of the selected semester will see this test.'}
        </p>
      </div>

      {/* Created Tests List */}
      <div className="card">
        <h3 className="font-semibold flex items-center gap-2 mb-4">
          <CheckCircle2 size={18} className="text-emerald-500" /> Created Tests ({tests.length})
        </h3>

        {!tests.length ? (
          <div className="text-center py-12 text-slate-400">
            <Brain size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No tests generated yet. Create one above!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tests.map(t => (
              <div
                key={t.test_id}
                onClick={() => loadSubmissions(t)}
                className="bg-slate-50/50 dark:bg-slate-800/40 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer group relative"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-violet-650 transition-colors">{t.subject}</h4>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        t.test_type === 'coding'
                          ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                          : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      }`}>
                        {t.test_type === 'coding' ? 'Proctored Coding' : 'MCQ'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      By {t.creator_name || 'Faculty'} • {new Date(t.created_at).toLocaleDateString()} • {new Date(t.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    t.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                  }`}>
                    {t.status}
                  </span>
                </div>

                {/* Semester & Scheme badges */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {t.target_semester ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <GraduationCap size={9} /> Sem {t.target_semester}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">
                      All Semesters
                    </span>
                  )}
                  {t.scheme && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <BookOpen size={9} /> {t.scheme} Scheme
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                  <span className="flex items-center gap-1">
                    <Brain size={13} /> {t.test_type === 'coding' ? '1 Assigned Q (Pool 10)' : `${t.question_count} Q`}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={13} /> {t.duration_minutes} min
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-violet-600 dark:text-violet-400">
                    <Users size={13} /> {t.submission_count} submitted
                  </span>
                </div>
                <div className="flex items-center justify-end gap-2 mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[10px] text-slate-400 group-hover:text-violet-500 font-semibold transition-colors">
                    View Results ({t.submission_count}) →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Test Submissions Modal */}
      {submissionsModalOpen && selectedTest && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-violet-600 to-purple-700 p-5 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-bold leading-tight">{selectedTest.subject} — Test Submissions</h3>
                  <p className="text-[10px] text-purple-100 mt-1 font-mono">
                    Total submissions: {submissions.length} | Duration: {selectedTest.duration_minutes} min
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {selectedTest.target_semester && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/20 text-white/90">
                        <GraduationCap size={9} /> Sem {selectedTest.target_semester}
                      </span>
                    )}
                    {selectedTest.scheme && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/20 text-white/90">
                        <BookOpen size={9} /> {selectedTest.scheme} Scheme
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSubmissionsModalOpen(false)}
                  className="text-white/80 hover:text-white font-bold text-xs bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer border-0"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="p-5 max-h-[450px] overflow-y-auto space-y-4">
              {/* AI Evaluation Banner */}
              <div className="bg-slate-950 p-4 rounded-xl border border-violet-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/40 flex items-center justify-center font-bold shrink-0">
                    🤖 AI
                  </div>
                  <div>
                    <h4 className="font-bold text-white flex items-center gap-2">
                      AI Automated Evaluation Complete
                      <span className="bg-emerald-500/20 text-emerald-300 text-[9px] px-2 py-0.5 rounded-full font-mono">
                        0% Manual Grading Required
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      All responses automatically graded against answer key with exam integrity verified.
                    </p>
                  </div>
                </div>
                <div className="text-right font-mono text-[11px] shrink-0">
                  <div className="text-emerald-400 font-bold">
                    Class Avg: {submissions.length ? Math.round(submissions.reduce((acc, s) => acc + (s.score/s.total_questions)*100, 0) / submissions.length) : 0}%
                  </div>
                  <div className="text-violet-300 text-[10px]">Integrity: Monitored</div>
                </div>
              </div>

              <div className="border border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                      <th className="p-3">Student Name</th>
                      <th className="p-3">USN</th>
                      <th className="p-3">Dept / Sem / Sec</th>
                      <th className="p-3 text-center">Score</th>
                      <th className="p-3 text-right">Submitted At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((sub) => {
                      const pct = Math.round((sub.score / sub.total_questions) * 100);
                      return (
                        <tr key={sub.submission_id} className="border-b border-slate-850 hover:bg-slate-850/45 text-slate-200">
                          <td className="p-3 font-semibold text-slate-100">{sub.full_name}</td>
                          <td className="p-3 font-mono text-slate-300">{sub.usn}</td>
                          <td className="p-3 text-slate-300">
                            {sub.department} (Sem {sub.semester} - Sec {sub.section || 'N/A'})
                          </td>
                          <td className="p-3 text-center font-bold">
                            <span className={`px-2 py-0.5 rounded font-mono text-xs border ${
                              pct >= 70 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                              pct >= 40 ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                            }`}>
                              {sub.score} / {sub.total_questions}
                            </span>
                          </td>
                          <td className="p-3 text-right text-slate-300 font-mono">
                            {new Date(sub.submitted_at).toLocaleDateString()} {new Date(sub.submitted_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                          </td>
                        </tr>
                      );
                    })}
                    {!submissions.length && (
                      <tr>
                        <td colSpan="5" className="p-6 text-center text-slate-500">
                          No student submissions recorded for this test yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSubmissionsModalOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
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
