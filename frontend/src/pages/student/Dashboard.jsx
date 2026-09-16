import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import StatCard from '../../components/StatCard.jsx';
import { ClipboardCheck, CalendarRange, Megaphone, AlertTriangle, QrCode, BookOpen, Download, Code2, Play, FileText, ArrowRight, Award, MessageSquare, Star, X, Brain, Clock, Sparkles } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useAuth } from '../../context/AuthContext.jsx';
import StudentRanksWidget from '../../components/StudentRanksWidget.jsx';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [att, setAtt] = useState({ overall: 0, perLab: [] });
  const [bookings, setBookings] = useState([]);
  const [anns, setAnns] = useState([]);
  const [experiments, setExperiments] = useState([]);
  const [activeTests, setActiveTests] = useState([]);

  // Faculty Feedback Modal States
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [facultyList, setFacultyList] = useState([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/me/attendance').then(r => setAtt(r.data)).catch(()=>{});
    api.get('/bookings').then(r => setBookings(r.data));
    api.get('/announcements').then(r => setAnns(r.data.slice(0,5)));
    api.get('/experiments').then(r => setExperiments(r.data)).catch(()=>{});
    api.get('/faculty').then(r => setFacultyList(r.data || [])).catch(()=>{});
    api.get('/tests/active/me').then(r => setActiveTests(r.data || [])).catch(()=>{});
  }, []);

  const handleSubmitFeedback = async () => {
    if (!selectedFacultyId) {
      toast.error('Please select a faculty member');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/faculty/feedback', {
        faculty_id: selectedFacultyId,
        rating,
        comments
      });
      toast.success('Feedback submitted successfully!');
      setFeedbackModalOpen(false);
      setComments('');
      setSelectedFacultyId('');
      setRating(5);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const pct = Number(att.overall) || 0;
  const pieData = [{ name:'Present', value: pct }, { name:'Missed', value: 100 - pct }];

  const getDownloadUrl = (filePath) => {
    let apiHost = import.meta.env.VITE_API_URL || 'http://localhost:5005';
    if (typeof window !== 'undefined' && window.location && window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      apiHost = `http://${window.location.hostname}:5005`;
    }
    return `${apiHost}${filePath}`;
  };

  return (
    <div className="space-y-6">
      {/* Header Greeting Panel with USN Profile */}
      <div className="glass p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">
              Welcome back, {user?.name || 'Student'}!
            </h2>
            <p className="text-xs text-slate-550 dark:text-slate-400 mt-1">
              Keep track of your lab sessions, attendance, and upcoming tests.
            </p>
          </div>
          {user?.usn && (
            <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-2xl border border-emerald-500/20 text-xs font-bold font-mono">
              USN: {user.usn}
            </div>
          )}
        </div>

        {/* Student Profile Info Strip */}
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
            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">USN</span>
            <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">{user?.usn || 'N/A'}</span>
          </div>
          <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Role</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize">{user?.role || '-'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={ClipboardCheck} label="Attendance" value={`${pct}%`} accent={pct < 85 ? 'rose' : 'secondary'} />
        <StatCard icon={Megaphone} label="Announcements" value={anns.length} accent="amber" />
        <StatCard icon={AlertTriangle} label="Status" value={pct<85 ? 'Low' : 'Good'} accent={pct<85 ? 'rose' : 'secondary'} />
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        <div className="card">
          <h3 className="font-semibold mb-3">Attendance Overview</h3>
          <div className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} dataKey="value" innerRadius={50} outerRadius={80}>
                  <Cell fill="#2563EB"/><Cell fill="#E2E8F0"/>
                </Pie>
                <Tooltip/><Legend/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-3 flex items-center justify-between">
            <span>Latest Announcements</span>
            <button 
              onClick={() => setFeedbackModalOpen(true)}
              className="text-xs bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 font-bold px-3 py-1 rounded-xl border border-purple-200 dark:border-purple-800 transition cursor-pointer flex items-center gap-1"
            >
              <Star size={13} className="text-amber-500 fill-amber-500" /> Rate Faculty
            </button>
          </h3>
          <ul className="space-y-2 text-sm">
            {anns.map(a => <li key={a.announcement_id} className="border-b border-slate-200 dark:border-slate-700 pb-2">
              <div className="font-medium">{a.title}</div>
              <div className="text-xs text-slate-500">{new Date(a.created_at).toLocaleString()}</div>
            </li>)}
            {!anns.length && <div className="text-slate-500">No announcements.</div>}
          </ul>
        </div>
      </div>

      {/* Student Rate Faculty Modal */}
      {feedbackModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                  <Star size={20} className="fill-amber-500" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Rate Lab Faculty</h3>
                  <p className="text-[11px] text-slate-500">Your digital feedback evaluates faculty performance score</p>
                </div>
              </div>
              <button onClick={() => setFeedbackModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Select Faculty Member</label>
                <select
                  value={selectedFacultyId}
                  onChange={(e) => setSelectedFacultyId(e.target.value)}
                  className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5"
                >
                  <option value="">-- Choose Faculty --</option>
                  {facultyList.map(f => (
                    <option key={f.faculty_id} value={f.faculty_id}>
                      {f.full_name} ({f.subject || f.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Star Rating (1 to 5 Stars)</label>
                <div className="flex items-center gap-2 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 cursor-pointer transition hover:scale-110"
                    >
                      <Star 
                        size={28} 
                        className={star <= rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300 dark:text-slate-700'} 
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-500 ml-2">{rating} / 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Feedback Comments (Optional)</label>
                <textarea
                  rows={3}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Share feedback on lab sessions, clarity of instruction, or experiment guidance..."
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 focus:outline-none focus:border-purple-500"
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => setFeedbackModalOpen(false)}
                className="btn bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmitFeedback}
                disabled={submitting}
                className="btn bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
