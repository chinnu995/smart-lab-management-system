import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  GraduationCap, Search, CheckCircle2, Clock, XCircle, AlertTriangle, 
  BookOpen, Code2, Bot, CalendarRange, ShieldCheck, X, FileText, User, Mail, Hash
} from 'lucide-react';
import { getSocket } from '../../services/socket';

export default function StudentVerification() {
  const [allStudents, setAllStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal inspection states
  const [scannedStudent, setScannedStudent] = useState(null);
  const [scannedAttendance, setScannedAttendance] = useState(null);
  const [scannedBookings, setScannedBookings] = useState([]);
  const [scannedEquipment, setScannedEquipment] = useState([]);
  const [scannedComplaints, setScannedComplaints] = useState([]);
  const [scannedTests, setScannedTests] = useState([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const fetchStudents = async () => {
    try {
      const res = await api.get('/students');
      setAllStudents(res.data || []);
    } catch (e) {
      toast.error('Failed to load students registry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    const s = getSocket();
    s.connect();
    s.on('attendance:changed', fetchStudents);
    return () => s.off('attendance:changed', fetchStudents);
  }, []);

  const loadStudentDetails = async (id) => {
    const toastId = toast.loading('Retrieving student verification profile...');
    try {
      const res = await api.get(`/students/${id}/status`);
      setScannedStudent(res.data.profile);
      setScannedAttendance(res.data.attendance);
      setScannedBookings(res.data.bookings || []);
      setScannedEquipment(res.data.equipment || []);
      setScannedComplaints(res.data.complaints || []);
      setScannedTests(res.data.testSubmissions || []);
      setActiveTab('profile');
      setDetailsOpen(true);
      toast.dismiss(toastId);
      toast.success(`Loaded verification profile for ${res.data.profile.full_name}`);
    } catch (err) {
      toast.dismiss(toastId);
      toast.error('Failed to load student verification profile.');
    }
  };

  const filteredStudents = allStudents.filter(s => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      (s.full_name && s.full_name.toLowerCase().includes(q)) ||
      (s.usn && s.usn.toLowerCase().includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q)) ||
      (s.scheme && s.scheme.toLowerCase().includes(q)) ||
      (s.department && s.department.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl border border-blue-500/20 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold mb-2">
            <ShieldCheck size={14} className="text-blue-400" /> HOD Identity & Verification Portal
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <GraduationCap size={28} className="text-blue-400" /> Student Profile Verification
          </h1>
          <p className="text-xs md:text-sm text-slate-300 mt-1">
            Select a student from the quick-access registry or search by USN/Name below to inspect attendance logs, lab bookings, and test results.
          </p>
        </div>

        <div className="w-full md:w-80">
          <select 
            className="w-full text-xs font-semibold bg-white/10 border border-white/20 text-white rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
            onChange={(e) => {
              if (e.target.value) {
                loadStudentDetails(e.target.value);
                e.target.value = '';
              }
            }}
          >
            <option value="" className="text-slate-900">-- Quick Select Student --</option>
            {allStudents.map(s => (
              <option key={s.student_id} value={s.student_id} className="text-slate-900">
                {s.full_name} ({s.usn})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Registry Table Section */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap size={20} className="text-blue-600" /> Verified Student Directory
            </h3>
            <p className="text-xs text-slate-500">Total registered students: {allStudents.length}</p>
          </div>

          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, USN, scheme..."
              className="input pl-9 text-xs"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5">USN</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">VTU Scheme</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(s => (
                <tr key={s.student_id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-blue-50/40 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">{s.full_name}</td>
                  <td className="p-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">{s.usn}</td>
                  <td className="p-3.5 text-slate-500">{s.email}</td>
                  <td className="p-3.5">
                    <span className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      {s.scheme || '2022 Scheme'}
                    </span>
                  </td>
                  <td className="p-3.5">{s.department}</td>
                  <td className="p-3.5 text-right">
                    <button 
                      onClick={() => loadStudentDetails(s.student_id)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 font-extrabold hover:underline cursor-pointer bg-blue-50 dark:bg-blue-950/60 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800 transition-all"
                    >
                      Verify Profile
                    </button>
                  </td>
                </tr>
              ))}
              {!filteredStudents.length && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                    No student records matching "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verification Inspection Modal */}
      {detailsOpen && scannedStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg">
                  <GraduationCap size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    {scannedStudent.full_name}
                    <span className="text-xs font-mono bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                      {scannedStudent.usn}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">{scannedStudent.email} • {scannedStudent.department}</p>
                </div>
              </div>

              <button onClick={() => setDetailsOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto text-xs font-bold">
              {[
                { id: 'profile', label: 'Profile Details', icon: User },
                { id: 'attendance', label: `Attendance (${scannedAttendance?.length || 0})`, icon: Clock },
                { id: 'bookings', label: `Bookings (${scannedBookings?.length || 0})`, icon: CalendarRange },
                { id: 'tests', label: `MCQ Tests (${scannedTests?.length || 0})`, icon: Bot },
                { id: 'complaints', label: `Complaints (${scannedComplaints?.length || 0})`, icon: AlertTriangle }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === t.id
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <t.icon size={15} /> {t.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {activeTab === 'profile' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">USN</span>
                    <span className="text-xs font-bold font-mono text-blue-600 dark:text-blue-400">{scannedStudent.usn}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">VTU Scheme</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{scannedStudent.scheme || '2022 Scheme'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Semester</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{scannedStudent.semester || 1} Semester</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Section</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{scannedStudent.section || 'A'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Department</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{scannedStudent.department}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Face AI Enrolled</span>
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 size={13} /> Active Face Template
                    </span>
                  </div>
                </div>
              )}

              {activeTab === 'attendance' && (
                <div className="space-y-2">
                  {scannedAttendance?.map((a, i) => (
                    <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between border border-slate-200 dark:border-slate-700 text-xs">
                      <div>
                        <span className="font-bold">{a.lab_name}</span>
                        <p className="text-[11px] text-slate-500">{new Date(a.marked_at).toLocaleString()}</p>
                      </div>
                      <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold uppercase text-[10px]">
                        {a.status}
                      </span>
                    </div>
                  ))}
                  {!scannedAttendance?.length && <p className="text-xs text-slate-400 text-center py-4">No attendance logs found.</p>}
                </div>
              )}

              {activeTab === 'bookings' && (
                <div className="space-y-2">
                  {scannedBookings?.map((b, i) => (
                    <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between border border-slate-200 dark:border-slate-700 text-xs">
                      <div>
                        <span className="font-bold">{b.lab_name}</span> — {b.purpose}
                        <p className="text-[11px] text-slate-500">{b.booking_date} ({b.start_time} - {b.end_time})</p>
                      </div>
                      <span className="badge bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold uppercase text-[10px]">
                        {b.status}
                      </span>
                    </div>
                  ))}
                  {!scannedBookings?.length && <p className="text-xs text-slate-400 text-center py-4">No lab bookings found.</p>}
                </div>
              )}

              {activeTab === 'tests' && (
                <div className="space-y-2">
                  {scannedTests?.map((t, i) => (
                    <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between border border-slate-200 dark:border-slate-700 text-xs">
                      <div>
                        <span className="font-bold text-violet-600 dark:text-violet-400">{t.subject} Test</span>
                        <p className="text-[11px] text-slate-500">Score: {t.score}% • Passed {t.correct_answers}/{t.total_questions}</p>
                      </div>
                      <span className="badge bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-bold uppercase text-[10px]">
                        Completed
                      </span>
                    </div>
                  ))}
                  {!scannedTests?.length && <p className="text-xs text-slate-400 text-center py-4">No test submissions found.</p>}
                </div>
              )}

              {activeTab === 'complaints' && (
                <div className="space-y-2">
                  {scannedComplaints?.map((c, i) => (
                    <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between border border-slate-200 dark:border-slate-700 text-xs">
                      <div>
                        <span className="font-bold">{c.title}</span>
                        <p className="text-[11px] text-slate-500">{c.description}</p>
                      </div>
                      <span className="badge bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold uppercase text-[10px]">
                        {c.status}
                      </span>
                    </div>
                  ))}
                  {!scannedComplaints?.length && <p className="text-xs text-slate-400 text-center py-4">No complaints filed.</p>}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => setDetailsOpen(false)} className="btn bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                Close Verification Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
