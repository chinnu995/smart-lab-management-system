import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import StatCard from '../../components/StatCard.jsx';
import { CalendarRange, AlertTriangle, Megaphone, ClipboardCheck, BookOpen, Plus, Download, Trash2, FileUp, Brain, Sparkles, Loader2, Clock, CheckCircle2, Users } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ov, setOv] = useState({});
  const [trend, setTrend] = useState([]);
  const [labs, setLabs] = useState([]);
  const [experiments, setExperiments] = useState([]);
  const [testsCount, setTestsCount] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  
  // MCQ tests states
  const [tests, setTests] = useState([]);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [duration, setDuration] = useState(10);
  const [generating, setGenerating] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsModalOpen, setSubmissionsModalOpen] = useState(false);

  // Form state
  const [selectedLab, setSelectedLab] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchExperiments = () => {
    api.get('/experiments').then(r => setExperiments(r.data)).catch(()=>{});
  };

  const fetchTests = () => {
    api.get('/tests/created').then(r => {
      setTests(r.data);
      setTestsCount(r.data.length);
    }).catch(()=>{});
  };

  useEffect(() => {
    api.get('/analytics/overview').then(r => setOv(r.data));
    api.get('/analytics/attendance').then(r => setTrend(r.data));
    api.get('/labs').then(r => {
      setLabs(r.data);
      if (r.data.length > 0) setSelectedLab(r.data[0].lab_id);
    });
    fetchTests();
    fetchExperiments();
  }, []);

  const handleAddManual = async (e) => {
    e.preventDefault();
    if (!selectedLab || !title || !file) {
      toast.error('Please fill in all fields and select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('lab_id', selectedLab);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('manual', file);

    setUploading(true);
    const toastId = toast.loading('Uploading lab manual...');
    try {
      await api.post('/experiments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.dismiss(toastId);
      toast.success('Lab manual uploaded successfully!');
      setModalOpen(false);
      setTitle('');
      setDescription('');
      setFile(null);
      fetchExperiments();
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteManual = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lab manual?')) return;
    try {
      await api.delete(`/experiments/${id}`);
      toast.success('Deleted successfully.');
      fetchExperiments();
    } catch (err) {
      toast.error('Failed to delete.');
    }
  };

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

  const getDownloadUrl = (filePath) => {
    let apiHost = import.meta.env.VITE_API_URL || 'http://localhost:5005';
    if (typeof window !== 'undefined' && window.location && window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      apiHost = `http://${window.location.hostname}:5005`;
    }
    return `${apiHost}${filePath}`;
  };

  return (
    <div className="space-y-5">
      {/* Header Greeting Panel with Faculty Profile */}
      <div className="glass p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">
              Welcome back, {user?.name || 'Faculty'}!
            </h2>
            <p className="text-xs text-slate-555 dark:text-slate-400 mt-1">
              Manage student attendance, lab experiments, manuals, and AI MCQ tests.
            </p>
          </div>
          {user?.emp_code && (
            <div className="bg-purple-500/10 text-purple-600 dark:text-purple-400 px-4 py-2 rounded-2xl border border-purple-500/20 text-xs font-bold font-mono">
              Employee ID: {user.emp_code}
            </div>
          )}
        </div>

        {/* Faculty Profile Info Strip */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/50 grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Full Name</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{user?.name || '-'}</span>
          </div>
          <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Email</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">{user?.email || '-'}</span>
          </div>
          <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Department</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">{user?.department || 'Computer Science'}</span>
          </div>
          <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Employee ID</span>
            <span className="text-xs font-bold font-mono text-purple-600 dark:text-purple-400">{user?.emp_code || 'N/A'}</span>
          </div>
          <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Role</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize">{user?.role || '-'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard icon={ClipboardCheck} label="Students" value={ov.students} accent="primary"/>
        <StatCard icon={CalendarRange} label="Active Bookings" value={ov.activeBookings} accent="secondary"/>
        <StatCard icon={AlertTriangle} label="Open Complaints" value={ov.openComplaints} accent="rose"/>
        <StatCard icon={Megaphone} label="Announcements" value={ov.announcements} accent="amber"/>
        <div onClick={() => navigate('/faculty/tests')} className="cursor-pointer transition-all hover:scale-[1.03] active:scale-95 duration-200">
          <StatCard icon={Brain} label="MCQ Tests" value={testsCount} accent="violet"/>
        </div>
      </div>
      
      <div className="card">
        <h3 className="font-semibold mb-3">Attendance Trend (last 30 days)</h3>
        <div className="h-64">
          <ResponsiveContainer>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" hide /><YAxis /><Tooltip />
              <Line type="monotone" dataKey="present" stroke="#14B8A6" strokeWidth={2}/>
              <Line type="monotone" dataKey="absent"  stroke="#EF4444" strokeWidth={2}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Lab Manuals & Experiments Widget */}
      <div className="card">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold flex items-center gap-2">
            <BookOpen size={18} className="text-blue-500" /> Lab Manuals & Experiments
          </h3>
          <button 
            onClick={() => setModalOpen(true)}
            className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-all"
          >
            <Plus size={14} /> Add Lab Manual
          </button>
        </div>

        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <th className="p-3">Lab Session</th>
                <th className="p-3">Title</th>
                <th className="p-3">Description</th>
                <th className="p-3">Uploaded By</th>
                <th className="p-3">File</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {experiments.map((exp) => (
                <tr key={exp.exp_id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 text-slate-700 dark:text-slate-300">
                  <td className="p-3 font-semibold">{exp.lab_name}</td>
                  <td className="p-3 font-medium">{exp.title}</td>
                  <td className="p-3 max-w-[200px] truncate">{exp.description || '-'}</td>
                  <td className="p-3 text-slate-550">{exp.uploader_name || 'Faculty'}</td>
                  <td className="p-3">
                    {exp.manual_file ? (
                      <a 
                        href={getDownloadUrl(exp.manual_file)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-500 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Download size={12} /> View/Download
                      </a>
                    ) : (
                      <span className="text-slate-400">No file</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <button 
                      onClick={() => handleDeleteManual(exp.exp_id)}
                      className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 p-1.5 rounded transition-all cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {!experiments.length && (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-slate-500">
                    No lab manuals uploaded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MCQ Tests & Submissions Widget */}
      <div className="card">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Brain size={18} className="text-violet-500" /> AI MCQ Tests & Student Submissions
          </h3>
          <button 
            onClick={() => setTestModalOpen(true)}
            className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1 bg-violet-650 hover:bg-violet-700 text-white rounded-lg cursor-pointer transition-all border-0 shadow-sm"
          >
            <Plus size={14} /> Generate Test with AI
          </button>
        </div>

        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <th className="p-3">Subject</th>
                <th className="p-3">Created Date</th>
                <th className="p-3">Duration</th>
                <th className="p-3">Questions</th>
                <th className="p-3 text-center">Submissions</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((t) => (
                <tr key={t.test_id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 text-slate-700 dark:text-slate-300">
                  <td className="p-3 font-semibold">{t.subject}</td>
                  <td className="p-3">{new Date(t.created_at).toLocaleDateString()} {new Date(t.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
                  <td className="p-3">{t.duration_minutes} mins</td>
                  <td className="p-3">{t.question_count} Qs</td>
                  <td className="p-3 text-center font-bold text-violet-600 dark:text-violet-400">{t.submission_count}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      t.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button 
                      onClick={() => loadSubmissions(t)}
                      className="text-violet-600 dark:text-violet-450 hover:text-violet-750 dark:hover:text-violet-300 font-bold hover:underline cursor-pointer bg-transparent border-0"
                    >
                      View Results
                    </button>
                  </td>
                </tr>
              ))}
              {!tests.length && (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-slate-505">
                    No tests generated yet. Click "Generate Test with AI" to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Manual Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 text-white">
              <h3 className="font-bold flex items-center gap-2 text-sm">
                <FileUp size={16} className="text-blue-500" /> Upload Lab Manual
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-xs font-semibold"
              >
                Close
              </button>
            </div>
            
            <form onSubmit={handleAddManual} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Select Lab</label>
                <select 
                  className="w-full text-xs bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={selectedLab}
                  onChange={(e) => setSelectedLab(e.target.value)}
                  required
                >
                  <option value="">-- Choose lab --</option>
                  {labs.map(l => (
                    <option key={l.lab_id} value={l.lab_id}>
                      {l.lab_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Title</label>
                <input 
                  type="text"
                  placeholder="e.g. Exercise 1: Stack implementation"
                  className="w-full text-xs bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Description (Optional)</label>
                <textarea 
                  placeholder="Enter brief instructions..."
                  className="w-full text-xs bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 h-20"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Manual Document (PDF, DOCX, TXT)</label>
                <input 
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  className="w-full text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                  onChange={(e) => setFile(e.target.files[0])}
                  required
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button 
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs py-2 rounded-lg transition-colors cursor-pointer"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Test Modal */}
      {testModalOpen && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 text-white">
              <h3 className="font-bold flex items-center gap-2 text-sm">
                <Brain size={16} className="text-violet-500" /> AI MCQ Test Generator
              </h3>
              <button 
                onClick={() => setTestModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-xs font-semibold"
              >
                Close
              </button>
            </div>
            
            <form onSubmit={handleGenerateTest} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Select Subject</label>
                <select 
                  className="w-full text-xs bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                >
                  <option value="">-- Choose Subject --</option>
                  {['ADA', 'DBMS', 'LATEX', 'MICROCONTROLLER', 'MONGODB', 'AI', 'JAVA'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Duration (minutes)</label>
                <input 
                  type="number"
                  min="1"
                  max="60"
                  className="w-full text-xs bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  required
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button 
                  type="button"
                  onClick={() => setTestModalOpen(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={generating}
                  className="flex-1 bg-violet-650 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold text-xs py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {generating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-violet-600 to-purple-700 p-5 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold leading-tight">{selectedTest.subject} MCQ Test Submissions</h3>
                  <p className="text-[10px] text-purple-100 mt-1 font-mono">
                    Total submissions: {submissions.length} | Duration: {selectedTest.duration_minutes} min
                  </p>
                </div>
                <button 
                  onClick={() => setSubmissionsModalOpen(false)}
                  className="text-white/80 hover:text-white font-bold text-xs bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="p-5 max-h-[350px] overflow-y-auto">
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
