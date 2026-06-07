import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import StatCard from '../../components/StatCard.jsx';
import { GraduationCap, Users, FlaskConical, Cpu, CalendarRange, AlertTriangle, Megaphone, CheckCircle2, Clock, XCircle, Wrench, ShieldAlert } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import toast from 'react-hot-toast';
import { getSocket } from '../../services/socket';
import { useAuth } from '../../context/AuthContext.jsx';

const COLORS = ['#2563EB','#14B8A6','#F59E0B','#EF4444','#8B5CF6'];

export default function HodDashboard() {
  const { user } = useAuth();
  const [ov, setOv] = useState({});
  const [labs, setLabs] = useState([]);
  const [eq, setEq] = useState([]);

  const [scannedStudent, setScannedStudent] = useState(null);
  const [scannedAttendance, setScannedAttendance] = useState(null);
  const [scannedBookings, setScannedBookings] = useState([]);
  const [scannedEquipment, setScannedEquipment] = useState([]);
  const [scannedComplaints, setScannedComplaints] = useState([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [allStudents, setAllStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');

  // Faculty states
  const [allFaculty, setAllFaculty] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [facultyAttendance, setFacultyAttendance] = useState([]);
  const [facultyBookings, setFacultyBookings] = useState([]);
  const [facultyComplaints, setFacultyComplaints] = useState([]);
  const [facultyDetailsOpen, setFacultyDetailsOpen] = useState(false);
  const [facultyActiveTab, setFacultyActiveTab] = useState('profile');

  // Test states
  const [scannedTests, setScannedTests] = useState([]);
  const [facultyTests, setFacultyTests] = useState([]);
  const [selectedTestSubmissions, setSelectedTestSubmissions] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [submissionsModalOpen, setSubmissionsModalOpen] = useState(false);

  const loadTestSubmissions = async (test) => {
    const tid = toast.loading('Loading submissions...');
    try {
      const res = await api.get(`/tests/${test.test_id}/submissions`);
      setSelectedTestSubmissions(res.data);
      setSelectedTest(test);
      setSubmissionsModalOpen(true);
      toast.dismiss(tid);
    } catch (err) {
      toast.dismiss(tid);
      toast.error('Failed to load submissions.');
    }
  };

  useEffect(() => {
    api.get('/analytics/overview').then(r => setOv(r.data));
    api.get('/analytics/labs').then(r => setLabs(r.data));
    api.get('/analytics/equipment').then(r => setEq(r.data));
    api.get('/students').then(r => setAllStudents(r.data)).catch(()=>{});
    api.get('/faculty').then(r => setAllFaculty(r.data)).catch(()=>{});
  }, []);

  useEffect(() => {
    const s = getSocket();
    s.connect();

    const handleUpdate = () => {
      // 1. Reload general analytics/overview, labs, and equipment
      api.get('/analytics/overview').then(r => setOv(r.data));
      api.get('/analytics/labs').then(r => setLabs(r.data));
      api.get('/analytics/equipment').then(r => setEq(r.data));
      // 2. Reload students and faculty lists
      api.get('/students').then(r => setAllStudents(r.data)).catch(()=>{});
      api.get('/faculty').then(r => setAllFaculty(r.data)).catch(()=>{});

      // 3. Reload currently selected student modal details
      setScannedStudent(currStudent => {
        if (currStudent && currStudent.student_id) {
          api.get(`/students/${currStudent.student_id}/status`).then(res => {
            setScannedStudent(res.data.profile);
            setScannedAttendance(res.data.attendance);
            setScannedBookings(res.data.bookings);
            setScannedEquipment(res.data.equipment);
            setScannedComplaints(res.data.complaints);
          }).catch(()=>{});
        }
        return currStudent;
      });

      // 4. Reload currently selected faculty modal details
      setSelectedFaculty(currFaculty => {
        if (currFaculty && currFaculty.faculty_id) {
          api.get(`/faculty/${currFaculty.faculty_id}/status`).then(res => {
            setSelectedFaculty(res.data.profile);
            setFacultyAttendance(res.data.attendance || []);
            setFacultyComplaints(res.data.complaints || []);
            setFacultyBookings(res.data.bookings || []);
          }).catch(()=>{});
        }
        return currFaculty;
      });
    };

    s.on('booking:new', handleUpdate);
    s.on('booking:changed', handleUpdate);
    s.on('lab:status_changed', handleUpdate);
    s.on('complaint:new', handleUpdate);
    s.on('complaint:changed', handleUpdate);
    s.on('attendance:changed', handleUpdate);

    return () => {
      s.off('booking:new', handleUpdate);
      s.off('booking:changed', handleUpdate);
      s.off('lab:status_changed', handleUpdate);
      s.off('complaint:new', handleUpdate);
      s.off('complaint:changed', handleUpdate);
      s.off('attendance:changed', handleUpdate);
    };
  }, []);

  const loadStudentDetails = async (id) => {
    const toastId = toast.loading('Retrieving student status details...');
    try {
      const res = await api.get(`/students/${id}/status`);
      setScannedStudent(res.data.profile);
      setScannedAttendance(res.data.attendance);
      setScannedBookings(res.data.bookings);
      setScannedEquipment(res.data.equipment);
      setScannedComplaints(res.data.complaints);
      setScannedTests(res.data.testSubmissions || []);
      setActiveTab('profile'); // Reset tab to profile
      setDetailsOpen(true);
      toast.dismiss(toastId);
      toast.success(`Loaded profile for ${res.data.profile.full_name}`);
    } catch (err) {
      toast.dismiss(toastId);
      toast.error('Failed to load student status data.');
    }
  };

  const loadFacultyDetails = async (id) => {
    const toastId = toast.loading('Retrieving faculty status details...');
    try {
      const res = await api.get(`/faculty/${id}/status`);
      setSelectedFaculty(res.data.profile);
      setFacultyAttendance(res.data.attendance || []);
      setFacultyComplaints(res.data.complaints || []);
      setFacultyBookings(res.data.bookings || []);
      setFacultyTests(res.data.tests || []);
      setFacultyActiveTab('profile');
      setFacultyDetailsOpen(true);
      toast.dismiss(toastId);
      toast.success(`Loaded profile for ${res.data.profile.full_name}`);
    } catch (err) {
      toast.dismiss(toastId);
      toast.error('Failed to load faculty status data.');
    }
  };

  return (
    <div className="space-y-5">
      {/* Action Banner & Profile Info */}
      <div className="glass p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">
              HOD Administration Dashboard
            </h2>
            <p className="text-xs text-slate-555 dark:text-slate-400 mt-1">
              View lab analytics, verify student profiles, and monitor system performance.
            </p>
          </div>
          <div className="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-2xl border border-blue-500/20 text-xs font-bold font-mono">
            Role: Head of Department
          </div>
        </div>

        {/* HOD Profile Info Strip */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/50 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Full Name</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{user?.name || 'Dr. Anitha Rao'}</span>
          </div>
          <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Email</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">{user?.email || '-'}</span>
          </div>
          <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Department</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">{user?.department || 'Computer Science & Engineering'}</span>
          </div>
          <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Role</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize">{user?.role || 'HOD'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={GraduationCap} label="Students" value={ov.students}/>
        <StatCard icon={Users} label="Faculty" value={ov.faculty} accent="secondary"/>
        <StatCard icon={FlaskConical} label="Labs" value={ov.labs} accent="amber"/>
        <StatCard icon={Cpu} label="Equipment" value={ov.equipment} accent="rose"/>
        <StatCard icon={CalendarRange} label="Active Bookings" value={ov.activeBookings}/>
        <StatCard icon={AlertTriangle} label="Open Complaints" value={ov.openComplaints} accent="rose"/>
        <StatCard icon={Megaphone} label="Announcements" value={ov.announcements} accent="amber"/>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="card">
          <h3 className="font-semibold mb-3">Lab Utilization</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={labs}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="lab_name" tick={{ fontSize: 11 }}/>
                <YAxis /><Tooltip />
                <Bar dataKey="approved" fill="#2563EB"/>
                <Bar dataKey="total"    fill="#94A3B8"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <h3 className="font-semibold mb-3">Equipment Status</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={eq} dataKey="count" nameKey="status" outerRadius={80}>
                  {eq.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Student Registry & Selection Widget */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <GraduationCap size={18} className="text-blue-500" /> Student Profile Verification
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select a student from the quick-access list or search registry below to inspect lab attendance logs.
            </p>
          </div>
          
          <div className="w-full md:w-72">
            <select 
              className="w-full text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              onChange={(e) => {
                if (e.target.value) {
                  loadStudentDetails(e.target.value);
                  e.target.value = ''; // Reset select
                }
              }}
            >
              <option value="">-- Quick Select Student --</option>
              {allStudents.map(s => (
                <option key={s.student_id} value={s.student_id}>
                  {s.full_name} ({s.usn})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-850">
                <th className="p-3">Name</th>
                <th className="p-3">USN</th>
                <th className="p-3">Email</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {allStudents.map(s => (
                <tr key={s.student_id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 text-slate-700 dark:text-slate-350">
                  <td className="p-3 font-semibold">{s.full_name}</td>
                  <td className="p-3 font-mono">{s.usn}</td>
                  <td className="p-3 text-slate-500">{s.email}</td>
                  <td className="p-3 text-right">
                    <button 
                      onClick={() => loadStudentDetails(s.student_id)}
                      className="text-blue-600 hover:text-blue-750 font-bold hover:underline cursor-pointer bg-transparent border-0"
                    >
                      Verify Profile
                    </button>
                  </td>
                </tr>
              ))}
              {!allStudents.length && (
                <tr>
                  <td colSpan="4" className="p-6 text-center text-slate-500">
                    No students registered in the system.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Faculty Registry & Activity Verification Widget */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <Users size={18} className="text-teal-500" /> Faculty Performance & Activity
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select a faculty member from the quick-access list or search registry below to inspect classes, bookings, and complaints they've handled.
            </p>
          </div>
          
          <div className="w-full md:w-72">
            <select 
              className="w-full text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
              onChange={(e) => {
                if (e.target.value) {
                  loadFacultyDetails(e.target.value);
                  e.target.value = ''; // Reset select
                }
              }}
            >
              <option value="">-- Quick Select Faculty --</option>
              {allFaculty.map(f => (
                <option key={f.faculty_id} value={f.faculty_id}>
                  {f.full_name} ({f.emp_code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-850">
                <th className="p-3">Name</th>
                <th className="p-3">Employee Code</th>
                <th className="p-3">Department / Designation</th>
                <th className="p-3">Email</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {allFaculty.map(f => (
                <tr key={f.faculty_id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 text-slate-700 dark:text-slate-350">
                  <td className="p-3 font-semibold text-teal-600 dark:text-teal-400">{f.full_name}</td>
                  <td className="p-3 font-mono">{f.emp_code}</td>
                  <td className="p-3 text-slate-500">{f.designation || 'Faculty'} - {f.department || 'N/A'}</td>
                  <td className="p-3 text-slate-500">{f.email}</td>
                  <td className="p-3 text-right">
                    <button 
                      onClick={() => loadFacultyDetails(f.faculty_id)}
                      className="text-teal-600 hover:text-teal-750 dark:text-teal-400 dark:hover:text-teal-350 font-bold hover:underline cursor-pointer bg-transparent border-0"
                    >
                      View Status
                    </button>
                  </td>
                </tr>
              ))}
              {!allFaculty.length && (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-slate-500">
                    No faculty members registered in the system.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scanned Student Profile Modal */}
      {detailsOpen && scannedStudent && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 text-white relative">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-lg font-bold">
                  {scannedStudent.full_name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold leading-tight">{scannedStudent.full_name}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5 text-blue-100 text-[10px] font-mono">
                    <span>USN: {scannedStudent.usn}</span>
                    <span>•</span>
                    <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-sans uppercase font-bold tracking-wider text-[8px]">
                      Student Status Dashboard
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex border-b border-slate-800 bg-slate-950 px-4 text-xs font-bold gap-3">
              <button 
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`py-3 border-b-2 px-1 transition-all ${activeTab === 'profile' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-350'}`}
              >
                Profile & Attendance
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('equipment')}
                className={`py-3 border-b-2 px-1 transition-all ${activeTab === 'equipment' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-350'}`}
              >
                Issued Equipment ({scannedEquipment.filter(e => e.status !== 'returned').length})
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('bookings')}
                className={`py-3 border-b-2 px-1 transition-all ${activeTab === 'bookings' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-350'}`}
              >
                Lab Bookings ({scannedBookings.length})
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('complaints')}
                className={`py-3 border-b-2 px-1 transition-all ${activeTab === 'complaints' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-350'}`}
              >
                Complaints ({scannedComplaints.length})
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('tests')}
                className={`py-3 border-b-2 px-1 transition-all ${activeTab === 'tests' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-350'}`}
              >
                MCQ Tests ({scannedTests.length})
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-5 space-y-4 max-h-[400px] overflow-y-auto">
              
              {/* Profile & Attendance Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-4">
                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div className="bg-slate-850/50 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block mb-0.5 font-semibold">Department</span>
                      <span className="font-bold text-slate-200">{scannedStudent.department || 'N/A'}</span>
                    </div>
                    <div className="bg-slate-850/50 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block mb-0.5 font-semibold">Class (Sem/Sec)</span>
                      <span className="font-bold text-slate-200">
                        Sem {scannedStudent.semester || 'N/A'} - Sec {scannedStudent.section || 'N/A'}
                      </span>
                    </div>
                    <div className="bg-slate-850/50 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block mb-0.5 font-semibold">Email Address</span>
                      <span className="font-bold text-slate-200 truncate block">{scannedStudent.email}</span>
                    </div>
                    <div className="bg-slate-850/50 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block mb-0.5 font-semibold">Phone Number</span>
                      <span className="font-bold text-slate-200">{scannedStudent.phone || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Attendance metrics */}
                  {scannedAttendance && (
                    <div className="border-t border-slate-800 pt-4 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-100">Lab Attendance Summary</span>
                        <span className={`font-extrabold font-mono text-sm ${Number(scannedAttendance.overall) < 85 ? 'text-rose-500' : 'text-emerald-500'}`}>
                          {scannedAttendance.overall}%
                        </span>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${Number(scannedAttendance.overall) < 85 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                          style={{ width: `${scannedAttendance.overall}%` }}
                        ></div>
                      </div>

                      {/* Attendance table */}
                      <div className="border border-slate-800 rounded-lg overflow-hidden">
                        <table className="w-full text-left border-collapse text-[10px]">
                          <thead>
                            <tr className="bg-slate-950 text-slate-450 font-semibold border-b border-slate-800">
                              <th className="p-2">Lab</th>
                              <th className="p-2 text-center">Present / Total</th>
                              <th className="p-2 text-right">%</th>
                            </tr>
                          </thead>
                          <tbody>
                            {scannedAttendance.perLab?.map((lab, idx) => (
                              <tr key={idx} className="border-b border-slate-850 hover:bg-slate-850/45 text-slate-300">
                                <td className="p-2 font-medium">{lab.lab_name}</td>
                                <td className="p-2 text-center">{lab.present} / {lab.total}</td>
                                <td className={`p-2 text-right font-bold ${Number(lab.percentage) < 85 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                  {lab.percentage}%
                                </td>
                              </tr>
                            ))}
                            {!scannedAttendance.perLab?.length && (
                              <tr>
                                <td colSpan="3" className="p-3 text-center text-slate-500">
                                  No attendance data found.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Issued Equipment Tab */}
              {activeTab === 'equipment' && (
                <div className="space-y-3">
                  <div className="border border-slate-800 rounded-lg overflow-hidden">
                    <table className="w-full text-left border-collapse text-[10px]">
                      <thead>
                        <tr className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                          <th className="p-2">Equipment</th>
                          <th className="p-2">Category</th>
                          <th className="p-2">Serial No</th>
                          <th className="p-2">Issue Date</th>
                          <th className="p-2">Expected Return</th>
                          <th className="p-2 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scannedEquipment.map((eq, idx) => (
                          <tr key={idx} className="border-b border-slate-850 hover:bg-slate-850/45 text-slate-350">
                            <td className="p-2 font-semibold">{eq.equipment_name}</td>
                            <td className="p-2">{eq.category || '-'}</td>
                            <td className="p-2 font-mono">{eq.serial_no || '-'}</td>
                            <td className="p-2">{eq.issue_date ? new Date(eq.issue_date).toLocaleDateString() : '-'}</td>
                            <td className="p-2">{eq.expected_return ? new Date(eq.expected_return).toLocaleDateString() : '-'}</td>
                            <td className="p-2 text-right">
                              <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[8px] ${
                                eq.status === 'returned' ? 'bg-emerald-500/10 text-emerald-400' :
                                eq.status === 'overdue' ? 'bg-rose-500/10 text-rose-450' : 'bg-amber-500/10 text-amber-400'
                              }`}>
                                {eq.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {!scannedEquipment.length && (
                          <tr>
                            <td colSpan="6" className="p-6 text-center text-slate-500">
                              No equipment requests or issues recorded.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Lab Bookings Tab */}
              {activeTab === 'bookings' && (
                <div className="space-y-3">
                  <div className="border border-slate-800 rounded-lg overflow-hidden">
                    <table className="w-full text-left border-collapse text-[10px]">
                      <thead>
                        <tr className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                          <th className="p-2">Lab</th>
                          <th className="p-2">Purpose</th>
                          <th className="p-2">Booking Date</th>
                          <th className="p-2">Time Slot</th>
                          <th className="p-2 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scannedBookings.map((b, idx) => (
                          <tr key={idx} className="border-b border-slate-850 hover:bg-slate-850/45 text-slate-350">
                            <td className="p-2 font-semibold">{b.lab_name}</td>
                            <td className="p-2">{b.purpose || '-'}</td>
                            <td className="p-2">{new Date(b.booking_date).toLocaleDateString()}</td>
                            <td className="p-2 font-mono">{b.start_time?.slice(0,5)} - {b.end_time?.slice(0,5)}</td>
                            <td className="p-2 text-right">
                              <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[8px] ${
                                b.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                                b.status === 'rejected' ? 'bg-rose-500/10 text-rose-450' :
                                b.status === 'cancelled' ? 'bg-slate-800 text-slate-400' : 'bg-amber-500/10 text-amber-400'
                              }`}>
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {!scannedBookings.length && (
                          <tr>
                            <td colSpan="5" className="p-6 text-center text-slate-500">
                              No lab bookings requested by this student.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Complaints Tab */}
              {activeTab === 'complaints' && (
                <div className="space-y-3">
                  <div className="border border-slate-800 rounded-lg overflow-hidden">
                    <table className="w-full text-left border-collapse text-[10px]">
                      <thead>
                        <tr className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                          <th className="p-2">Title</th>
                          <th className="p-2">Lab/Item</th>
                          <th className="p-2">Priority</th>
                          <th className="p-2">Created At</th>
                          <th className="p-2">Status</th>
                          <th className="p-2 text-right">Resolution</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scannedComplaints.map((c, idx) => (
                          <tr key={idx} className="border-b border-slate-850 hover:bg-slate-850/45 text-slate-350">
                            <td className="p-2 font-semibold">{c.title}</td>
                            <td className="p-2">{c.lab_name || c.equipment_name || 'General'}</td>
                            <td className="p-2 uppercase font-mono tracking-wider text-[8px]">
                              <span className={`${
                                c.priority === 'critical' || c.priority === 'high' ? 'text-rose-500 font-bold' : 'text-slate-400'
                              }`}>
                                {c.priority}
                              </span>
                            </td>
                            <td className="p-2">{new Date(c.created_at).toLocaleDateString()}</td>
                            <td className="p-2">
                              <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[8px] ${
                                c.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400' :
                                c.status === 'in_progress' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                              }`}>
                                {c.status}
                              </span>
                            </td>
                            <td className="p-2 text-right truncate max-w-[120px]">{c.resolution_notes || '-'}</td>
                          </tr>
                        ))}
                        {!scannedComplaints.length && (
                          <tr>
                            <td colSpan="6" className="p-6 text-center text-slate-500">
                              No complaints raised by this student.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* MCQ Tests Tab */}
              {activeTab === 'tests' && (
                <div className="space-y-3">
                  <div className="border border-slate-800 rounded-lg overflow-hidden">
                    <table className="w-full text-left border-collapse text-[10px]">
                      <thead>
                        <tr className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                          <th className="p-2">Subject</th>
                          <th className="p-2">Duration</th>
                          <th className="p-2 text-center">Score</th>
                          <th className="p-2 text-right">Submitted At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scannedTests.map((sub, idx) => {
                          const pct = Math.round((sub.score / sub.total_questions) * 100);
                          return (
                            <tr key={idx} className="border-b border-slate-850 hover:bg-slate-850/45 text-slate-350">
                              <td className="p-2 font-semibold text-slate-200">{sub.subject}</td>
                              <td className="p-2">{sub.duration_minutes} mins</td>
                              <td className="p-2 text-center font-bold">
                                <span className={`px-1.5 py-0.5 rounded font-mono text-[9px] ${
                                  pct >= 70 ? 'text-emerald-450 bg-emerald-500/10' :
                                  pct >= 40 ? 'text-amber-450 bg-amber-500/10' : 'text-rose-450 bg-rose-500/10'
                                }`}>
                                  {sub.score} / {sub.total_questions}
                                </span>
                              </td>
                              <td className="p-2 text-right text-slate-400 font-mono">
                                {new Date(sub.submitted_at).toLocaleDateString()}
                              </td>
                            </tr>
                          );
                        })}
                        {!scannedTests.length && (
                          <tr>
                            <td colSpan="4" className="p-6 text-center text-slate-500">
                              No MCQ tests taken by this student.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
            
            {/* Footer */}
            <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex justify-end">
              <button 
                onClick={() => setDetailsOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scanned Faculty Profile Modal */}
      {facultyDetailsOpen && selectedFaculty && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl transition-all scale-100">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-teal-600 to-emerald-700 p-5 text-white relative">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-lg font-bold">
                  {selectedFaculty.full_name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold leading-tight">{selectedFaculty.full_name}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5 text-emerald-100 text-[10px] font-mono">
                    <span>Emp Code: {selectedFaculty.emp_code}</span>
                    <span>•</span>
                    <span className="bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded font-sans uppercase font-bold tracking-wider text-[8px]">
                      Faculty Performance & Status
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex border-b border-slate-800 bg-slate-950 px-4 text-xs font-bold gap-3 overflow-x-auto">
              <button 
                type="button"
                onClick={() => setFacultyActiveTab('profile')}
                className={`py-3 border-b-2 px-1 whitespace-nowrap transition-all ${facultyActiveTab === 'profile' ? 'border-teal-500 text-teal-400' : 'border-transparent text-slate-400 hover:text-slate-350'}`}
              >
                Profile & Overview
              </button>
              <button 
                type="button"
                onClick={() => setFacultyActiveTab('attendance')}
                className={`py-3 border-b-2 px-1 whitespace-nowrap transition-all ${facultyActiveTab === 'attendance' ? 'border-teal-500 text-teal-400' : 'border-transparent text-slate-400 hover:text-slate-350'}`}
              >
                Conducted Classes ({facultyAttendance.length})
              </button>
              <button 
                type="button"
                onClick={() => setFacultyActiveTab('bookings')}
                className={`py-3 border-b-2 px-1 whitespace-nowrap transition-all ${facultyActiveTab === 'bookings' ? 'border-teal-500 text-teal-400' : 'border-transparent text-slate-400 hover:text-slate-350'}`}
              >
                Processed Bookings ({facultyBookings.length})
              </button>
              <button 
                type="button"
                onClick={() => setFacultyActiveTab('complaints')}
                className={`py-3 border-b-2 px-1 whitespace-nowrap transition-all ${facultyActiveTab === 'complaints' ? 'border-teal-500 text-teal-400' : 'border-transparent text-slate-400 hover:text-slate-350'}`}
              >
                Resolved Complaints ({facultyComplaints.length})
              </button>
              <button 
                type="button"
                onClick={() => setFacultyActiveTab('tests')}
                className={`py-3 border-b-2 px-1 whitespace-nowrap transition-all ${facultyActiveTab === 'tests' ? 'border-teal-500 text-teal-400' : 'border-transparent text-slate-400 hover:text-slate-350'}`}
              >
                Conducted Tests ({facultyTests.length})
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-5 space-y-4 max-h-[400px] overflow-y-auto">
              
              {/* Profile & Overview Tab */}
              {facultyActiveTab === 'profile' && (
                <div className="space-y-4">
                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div className="bg-slate-850/50 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block mb-0.5 font-semibold">Department</span>
                      <span className="font-bold text-slate-200">{selectedFaculty.department || 'N/A'}</span>
                    </div>
                    <div className="bg-slate-850/50 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block mb-0.5 font-semibold">Designation</span>
                      <span className="font-bold text-slate-200">
                        {selectedFaculty.designation || 'Faculty'}
                      </span>
                    </div>
                    <div className="bg-slate-850/50 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block mb-0.5 font-semibold">Email Address</span>
                      <span className="font-bold text-slate-200 truncate block">{selectedFaculty.email}</span>
                    </div>
                    <div className="bg-slate-850/50 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block mb-0.5 font-semibold">Phone Number</span>
                      <span className="font-bold text-slate-200">{selectedFaculty.phone || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Performance stats summary */}
                  <div className="border-t border-slate-800 pt-4">
                    <span className="font-bold text-slate-100 text-xs block mb-3">Activity & Performance Indicators</span>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                        <span className="text-slate-500 text-[10px] font-semibold block uppercase">Classes Conducted</span>
                        <span className="text-lg font-extrabold text-teal-400 font-mono mt-1 block">
                          {facultyAttendance.length}
                        </span>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                        <span className="text-slate-500 text-[10px] font-semibold block uppercase">Bookings Handled</span>
                        <span className="text-lg font-extrabold text-blue-400 font-mono mt-1 block">
                          {facultyBookings.length}
                        </span>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                        <span className="text-slate-500 text-[10px] font-semibold block uppercase">Complaints Resolved</span>
                        <span className="text-lg font-extrabold text-emerald-400 font-mono mt-1 block">
                          {facultyComplaints.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Conducted Classes Tab */}
              {facultyActiveTab === 'attendance' && (
                <div className="space-y-3">
                  <div className="border border-slate-800 rounded-lg overflow-hidden">
                    <table className="w-full text-left border-collapse text-[10px]">
                      <thead>
                        <tr className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                          <th className="p-2">Date</th>
                          <th className="p-2">Lab Name</th>
                          <th className="p-2 text-center">Present / Total</th>
                          <th className="p-2 text-right">Attendance Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {facultyAttendance.map((att, idx) => {
                          const rate = att.total_students > 0 ? Math.round((att.present_count / att.total_students) * 100) : 0;
                          return (
                            <tr key={idx} className="border-b border-slate-850 hover:bg-slate-850/45 text-slate-350">
                              <td className="p-2 font-semibold font-mono">{new Date(att.attend_date).toLocaleDateString()}</td>
                              <td className="p-2">{att.lab_name}</td>
                              <td className="p-2 text-center font-mono">{att.present_count} / {att.total_students}</td>
                              <td className="p-2 text-right font-bold font-mono">
                                <span className={`px-1.5 py-0.5 rounded ${rate >= 75 ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'}`}>
                                  {rate}%
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                        {!facultyAttendance.length && (
                          <tr>
                            <td colSpan="4" className="p-6 text-center text-slate-500">
                              No attendance sheets marked by this faculty.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Processed Bookings Tab */}
              {facultyActiveTab === 'bookings' && (
                <div className="space-y-3">
                  <div className="border border-slate-800 rounded-lg overflow-hidden">
                    <table className="w-full text-left border-collapse text-[10px]">
                      <thead>
                        <tr className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                          <th className="p-2">Lab</th>
                          <th className="p-2">Requested By</th>
                          <th className="p-2">Purpose</th>
                          <th className="p-2">Booking Date</th>
                          <th className="p-2">Time Slot</th>
                          <th className="p-2 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {facultyBookings.map((b, idx) => (
                          <tr key={idx} className="border-b border-slate-850 hover:bg-slate-850/45 text-slate-350">
                            <td className="p-2 font-semibold">{b.lab_name}</td>
                            <td className="p-2 font-medium">{b.requested_by_name || 'Student'}</td>
                            <td className="p-2">{b.purpose || '-'}</td>
                            <td className="p-2 font-mono">{new Date(b.booking_date).toLocaleDateString()}</td>
                            <td className="p-2 font-mono">{b.start_time?.slice(0,5)} - {b.end_time?.slice(0,5)}</td>
                            <td className="p-2 text-right">
                              <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[8px] ${
                                b.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                                b.status === 'rejected' ? 'bg-rose-500/10 text-rose-450' : 'bg-amber-500/10 text-amber-400'
                              }`}>
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {!facultyBookings.length && (
                          <tr>
                            <td colSpan="6" className="p-6 text-center text-slate-500">
                              No lab bookings processed by this faculty.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Resolved Complaints Tab */}
              {facultyActiveTab === 'complaints' && (
                <div className="space-y-3">
                  <div className="border border-slate-800 rounded-lg overflow-hidden">
                    <table className="w-full text-left border-collapse text-[10px]">
                      <thead>
                        <tr className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                          <th className="p-2">Title</th>
                          <th className="p-2">Lab/Item</th>
                          <th className="p-2">Raised By</th>
                          <th className="p-2">Priority</th>
                          <th className="p-2">Resolved At</th>
                          <th className="p-2 text-right">Resolution</th>
                        </tr>
                      </thead>
                      <tbody>
                        {facultyComplaints.map((c, idx) => (
                          <tr key={idx} className="border-b border-slate-850 hover:bg-slate-850/45 text-slate-350">
                            <td className="p-2 font-semibold text-rose-400">{c.title}</td>
                            <td className="p-2">{c.lab_name || c.equipment_name || 'General'}</td>
                            <td className="p-2">{c.raised_by_name || 'User'}</td>
                            <td className="p-2 uppercase font-mono tracking-wider text-[8px]">
                              <span className={`${
                                c.priority === 'critical' || c.priority === 'high' ? 'text-rose-500 font-bold' : 'text-slate-400'
                              }`}>
                                {c.priority}
                              </span>
                            </td>
                            <td className="p-2 font-mono">{c.resolved_at ? new Date(c.resolved_at).toLocaleDateString() : '-'}</td>
                            <td className="p-2 text-right truncate max-w-[120px]" title={c.resolution_notes}>
                              {c.resolution_notes || '-'}
                            </td>
                          </tr>
                        ))}
                        {!facultyComplaints.length && (
                          <tr>
                            <td colSpan="6" className="p-6 text-center text-slate-500">
                              No complaints resolved by this faculty.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Conducted Tests Tab */}
              {facultyActiveTab === 'tests' && (
                <div className="space-y-3">
                  <div className="border border-slate-800 rounded-lg overflow-hidden">
                    <table className="w-full text-left border-collapse text-[10px]">
                      <thead>
                        <tr className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                          <th className="p-2">Subject</th>
                          <th className="p-2">Created Date</th>
                          <th className="p-2">Duration</th>
                          <th className="p-2 text-center">Submissions</th>
                          <th className="p-2 text-center">Status</th>
                          <th className="p-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {facultyTests.map((t, idx) => (
                          <tr key={idx} className="border-b border-slate-850 hover:bg-slate-850/45 text-slate-355">
                            <td className="p-2 font-semibold text-slate-200">{t.subject}</td>
                            <td className="p-2">{new Date(t.created_at).toLocaleDateString()}</td>
                            <td className="p-2">{t.duration_minutes} mins</td>
                            <td className="p-2 text-center font-bold text-teal-405">{t.submission_count}</td>
                            <td className="p-2 text-center">
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                                t.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-450'
                              }`}>
                                {t.status}
                              </span>
                            </td>
                            <td className="p-2 text-right">
                              <button 
                                onClick={() => loadTestSubmissions(t)}
                                className="text-teal-450 hover:text-teal-350 font-bold hover:underline cursor-pointer bg-transparent border-0 text-[10px]"
                              >
                                View Results
                              </button>
                            </td>
                          </tr>
                        ))}
                        {!facultyTests.length && (
                          <tr>
                            <td colSpan="6" className="p-6 text-center text-slate-500">
                              No MCQ tests generated by this faculty yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
            
            {/* Footer */}
            <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex justify-end">
              <button 
                onClick={() => setFacultyDetailsOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Submissions Modal */}
      {submissionsModalOpen && selectedTest && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-violet-600 to-purple-700 p-5 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold leading-tight">{selectedTest.subject} MCQ Test Submissions</h3>
                  <p className="text-[10px] text-purple-100 mt-1 font-mono">
                    Total submissions: {selectedTestSubmissions.length} | Duration: {selectedTest.duration_minutes} min
                  </p>
                </div>
                <button 
                  onClick={() => setSubmissionsModalOpen(false)}
                  className="text-white/80 hover:text-white font-bold text-xs bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer border-0"
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
                    {selectedTestSubmissions.map((sub) => {
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
                    {!selectedTestSubmissions.length && (
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
