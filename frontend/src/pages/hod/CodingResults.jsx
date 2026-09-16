import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Code2, Trophy, CheckCircle2, XCircle, Clock, Search, Filter, 
  Terminal, User, FileCode, Sparkles, BookOpen, AlertTriangle, Eye, X, PlusCircle
} from 'lucide-react';

export default function CodingResults() {
  const [analytics, setAnalytics] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Code View Modal
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Create Problem Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProblem, setNewProblem] = useState({
    title: '',
    difficulty: 'Easy',
    week_number: 1,
    description: '',
    input_format: '',
    output_format: '',
    constraints: '',
    sample_input: '',
    sample_output: '',
    hidden_input: '',
    hidden_output: ''
  });
  const [creating, setCreating] = useState(false);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/coding/admin/analytics');
      setAnalytics(res.data);
    } catch (e) {
      console.error('Failed to load coding analytics', e);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const res = await api.get('/coding/admin/submissions', {
        params: {
          category: selectedCategory,
          status: selectedStatus,
          search: searchTerm
        }
      });
      setSubmissions(res.data || []);
    } catch (e) {
      toast.error('Failed to load coding submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [selectedCategory, selectedStatus, searchTerm]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newProblem.title.trim() || !newProblem.description.trim()) {
      toast.error('Title and description are required');
      return;
    }
    setCreating(true);
    try {
      const payload = {
        title: newProblem.title,
        difficulty: newProblem.difficulty,
        week_number: Number(newProblem.week_number) || 1,
        category: analytics?.facultySubject || 'ADA',
        description: newProblem.description,
        input_format: newProblem.input_format,
        output_format: newProblem.output_format,
        constraints: newProblem.constraints,
        sample_cases: [{ input: newProblem.sample_input, output: newProblem.sample_output }],
        hidden_cases: [{ input: newProblem.hidden_input, output: newProblem.hidden_output }],
        starter_code: { python: '# Write solution here\n', java: '// Write solution here\n' }
      };
      const res = await api.post('/coding/problems', payload);
      toast.success(`Coding challenge created for subject ${res.data.category}! Published to student section.`);
      setShowCreateModal(false);
      setNewProblem({
        title: '', difficulty: 'Easy', week_number: 1, description: '',
        input_format: '', output_format: '', constraints: '',
        sample_input: '', sample_output: '', hidden_input: '', hidden_output: ''
      });
      fetchAnalytics();
      fetchSubmissions();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create coding challenge');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-violet-950 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl border border-violet-500/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 text-xs font-bold">
              <Sparkles size={14} className="text-violet-400" />
              {analytics?.facultySubject 
                ? `Faculty Mode • Subject: ${analytics.facultySubject.toUpperCase()}`
                : 'HOD Administrative Dashboard'}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Coding Arena Student Results</h1>
            <p className="text-xs md:text-sm text-slate-300">
              {analytics?.facultySubject
                ? `Showing student weekly submissions and code solutions for your assigned subject: ${analytics.facultySubject.toUpperCase()}`
                : 'Track student weekly programming submissions, passed test cases, execution times, and inspect submitted code.'}
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-lg hover:shadow-violet-500/20 transition cursor-pointer border-0 shrink-0"
          >
            <PlusCircle size={18} /> Add Subject Coding Challenge
          </button>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-5 border-l-4 border-l-violet-500 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Submissions</p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{analytics.totalSubmissions}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 flex items-center justify-center">
              <FileCode size={20} />
            </div>
          </div>

          <div className="card p-5 border-l-4 border-l-emerald-500 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Accepted Solutions</p>
              <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{analytics.acceptedSubmissions}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
          </div>

          <div className="card p-5 border-l-4 border-l-blue-500 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Coders</p>
              <h3 className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">{analytics.uniqueStudents}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <User size={20} />
            </div>
          </div>

          <div className="card p-5 border-l-4 border-l-amber-500 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Pass Rate</p>
              <h3 className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{analytics.passRate}%</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Trophy size={20} />
            </div>
          </div>
        </div>
      )}

      {/* Top Performers Banner */}
      {analytics?.topPerformers && analytics.topPerformers.length > 0 && (
        <div className="card">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <Trophy size={18} className="text-amber-500" /> Top Coding Performers
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {analytics.topPerformers.slice(0, 3).map((tp, idx) => (
              <div key={tp.student_id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs text-white ${
                    idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-slate-400' : 'bg-amber-700'
                  }`}>
                    #{idx + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">{tp.full_name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">{tp.usn} • {tp.scheme || '2022 Scheme'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">{tp.solved_count} Solved</span>
                  <p className="text-[9px] text-slate-400">{tp.total_attempts} attempts</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Controls Bar */}
      <div className="card p-4 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name, USN, or challenge title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Subject Select */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
            >
              <option value="all">All Subjects</option>
              {['ADA', 'DBMS', 'LATEX', 'MONGODB', 'AI', 'JAVA', 'PYTHON', 'OPERATING SYSTEMS'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Status Select */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Accepted">Accepted</option>
              <option value="Wrong Answer">Wrong Answer</option>
              <option value="Compilation Error">Compilation Error</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="card p-0 overflow-hidden border border-slate-200 dark:border-slate-800">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="animate-spin w-8 h-8 border-3 border-violet-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            Loading coding submissions...
          </div>
        ) : !submissions.length ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Code2 size={40} className="mx-auto text-slate-300 dark:text-slate-600" />
            <p className="font-semibold text-sm">No student coding submissions match your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[10px]">
                  <th className="p-4">Student</th>
                  <th className="p-4">VTU Details</th>
                  <th className="p-4">Subject / Challenge</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Test Cases</th>
                  <th className="p-4 text-center">Runtime</th>
                  <th className="p-4 text-right">Submitted At</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {submissions.map((sub) => (
                  <tr key={sub.submission_id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-200">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      <div>{sub.full_name}</div>
                      <span className="font-mono text-[10px] text-slate-400">{sub.usn}</span>
                    </td>
                    <td className="p-4">
                      <div>{sub.department}</div>
                      <span className="text-[10px] font-semibold text-violet-600 dark:text-violet-400">{sub.scheme || '2022 Scheme'} (Sem {sub.semester})</span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 mr-2 uppercase">
                        {sub.category}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-100">{sub.problem_title}</span>
                    </td>
                    <td className="p-4 text-center font-bold">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase border ${
                        sub.status === 'Accepted' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
                        sub.status === 'Wrong Answer' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' :
                        'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="p-4 text-center font-mono font-bold">
                      {sub.passed_cases} / {sub.total_cases}
                    </td>
                    <td className="p-4 text-center font-mono text-slate-400">
                      {sub.execution_time_ms} ms
                    </td>
                    <td className="p-4 text-right font-mono text-slate-400 text-[11px]">
                      {new Date(sub.submitted_at).toLocaleDateString()} {new Date(sub.submitted_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setSelectedSubmission(sub)}
                        className="bg-slate-100 dark:bg-slate-800 hover:bg-violet-600 hover:text-white dark:hover:bg-violet-600 text-slate-700 dark:text-slate-300 font-bold text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1 mx-auto cursor-pointer border-0"
                      >
                        <Eye size={13} /> View Code
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Code Inspector Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl space-y-0">
            <div className="bg-gradient-to-r from-slate-900 to-violet-950 p-4 text-white flex items-center justify-between border-b border-slate-800">
              <div>
                <h3 className="font-bold text-sm leading-tight flex items-center gap-2">
                  <Code2 size={18} className="text-violet-400" />
                  {selectedSubmission.full_name}'s Submitted Solution
                </h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  {selectedSubmission.problem_title} • {selectedSubmission.language.toUpperCase()} • Passed {selectedSubmission.passed_cases}/{selectedSubmission.total_cases} Test Cases
                </p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition border-0 bg-transparent cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 bg-slate-950 font-mono text-xs max-h-96 overflow-y-auto">
              <pre className="text-amber-200 leading-relaxed whitespace-pre font-mono p-3 bg-slate-900/60 rounded-xl border border-slate-850">
                {selectedSubmission.code}
              </pre>
            </div>

            <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Submitted by {selectedSubmission.usn} ({selectedSubmission.scheme || '2022 Scheme'})</span>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-1.5 rounded-lg transition cursor-pointer border-0"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Coding Challenge Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl space-y-0 my-8">
            <div className="bg-gradient-to-r from-violet-900 to-indigo-950 p-6 text-white flex items-center justify-between border-b border-slate-800">
              <div>
                <h3 className="font-extrabold text-lg flex items-center gap-2">
                  <PlusCircle size={20} className="text-violet-400" />
                  Add New Coding Challenge
                </h3>
                <p className="text-xs text-violet-200 mt-1">
                  Subject: <strong className="text-white uppercase font-mono">{analytics?.facultySubject || 'ADA'}</strong> • Challenge will be published to Student Section
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition border-0 bg-transparent cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Problem Title</label>
                <input
                  type="text"
                  placeholder="e.g. Week 1: Selection Sort Implementation"
                  value={newProblem.title}
                  onChange={(e) => setNewProblem({ ...newProblem, title: e.target.value })}
                  className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Difficulty</label>
                  <select
                    value={newProblem.difficulty}
                    onChange={(e) => setNewProblem({ ...newProblem, difficulty: e.target.value })}
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Week Number</label>
                  <input
                    type="number"
                    min="1"
                    max="52"
                    value={newProblem.week_number}
                    onChange={(e) => setNewProblem({ ...newProblem, week_number: e.target.value })}
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Problem Statement & Description</label>
                <textarea
                  rows={4}
                  placeholder="Describe the algorithm or programming problem requirements clearly..."
                  value={newProblem.description}
                  onChange={(e) => setNewProblem({ ...newProblem, description: e.target.value })}
                  className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 font-sans"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Input Format</label>
                  <input
                    type="text"
                    placeholder="e.g. Line 1: N integers"
                    value={newProblem.input_format}
                    onChange={(e) => setNewProblem({ ...newProblem, input_format: e.target.value })}
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Output Format</label>
                  <input
                    type="text"
                    placeholder="e.g. Print sorted array space-separated"
                    value={newProblem.output_format}
                    onChange={(e) => setNewProblem({ ...newProblem, output_format: e.target.value })}
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1.5">Sample Test Input</label>
                  <textarea
                    rows={2}
                    placeholder="Sample input data..."
                    value={newProblem.sample_input}
                    onChange={(e) => setNewProblem({ ...newProblem, sample_input: e.target.value })}
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1.5">Sample Expected Output</label>
                  <textarea
                    rows={2}
                    placeholder="Expected sample output..."
                    value={newProblem.sample_output}
                    onChange={(e) => setNewProblem({ ...newProblem, sample_output: e.target.value })}
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer border-0"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-violet-600 hover:bg-violet-700 text-white shadow-lg cursor-pointer border-0 disabled:opacity-50"
                >
                  {creating ? 'Creating Problem...' : 'Publish Challenge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
