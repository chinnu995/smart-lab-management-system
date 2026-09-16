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
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/50 grid grid-cols-2 md:grid-cols-6 gap-3">
          <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Full Name</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{user?.name || '-'}</span>
          </div>
          <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Email</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">{user?.email || '-'}</span>
          </div>
          <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Employee ID</span>
            <span className="text-xs font-bold font-mono text-purple-600 dark:text-purple-400">{user?.emp_code || 'N/A'}</span>
          </div>
          <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Assigned Subject</span>
            <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase">{user?.subject || 'ALL SUBJECTS'}</span>
          </div>
          <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">VTU Scheme</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{user?.scheme || '2022 Scheme'}</span>
          </div>
          <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Department</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">{user?.department || 'Computer Science'}</span>
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

    </div>
  );
}
