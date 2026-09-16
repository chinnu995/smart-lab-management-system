import React, { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { QrCode, CheckCircle2, Clock, Users, Search, RefreshCw, Radio, Sparkles, Maximize2, X } from 'lucide-react';
import { getSocket } from '../../services/socket';

export default function MarkAttendance() {
  const [labs, setLabs] = useState([]);
  const [labId, setLabId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [qr, setQr] = useState(null);
  const [liveData, setLiveData] = useState({ students: [], totalCount: 0, presentCount: 0, pendingCount: 0 });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [fullscreenQr, setFullscreenQr] = useState(false);

  const fetchLiveAttendance = useCallback(async (selectedLab, selectedDate) => {
    if (!selectedLab) return;
    setLoading(true);
    try {
      const res = await api.get(`/attendance/live/${selectedLab}?date=${selectedDate || date}`);
      setLiveData(res.data);
    } catch (err) {
      console.error('Failed to load live attendance:', err);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    api.get('/labs').then(r => {
      setLabs(r.data);
      if (r.data.length > 0) {
        setLabId(r.data[0].lab_id);
      }
    });
  }, []);

  useEffect(() => {
    if (labId) {
      fetchLiveAttendance(labId, date);
    }
  }, [labId, date, fetchLiveAttendance]);

  // Real-time Socket.IO attendance listener
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleStudentScanned = (data) => {
      if (Number(data.lab_id) === Number(labId)) {
        toast.success(`🎉 ${data.full_name} (${data.usn}) marked Present via QR!`, { duration: 4000 });
        
        setLiveData(prev => {
          const updatedStudents = prev.students.map(s => {
            if (Number(s.student_id) === Number(data.student_id)) {
              return { ...s, status: 'present', marked_at: data.marked_at, method: data.method || 'qr' };
            }
            return s;
          });
          const presentCount = updatedStudents.filter(s => s.status === 'present').length;
          const pendingCount = updatedStudents.length - presentCount;
          return { ...prev, students: updatedStudents, presentCount, pendingCount };
        });
      }
    };

    const handleAttendanceChanged = () => {
      if (labId) {
        fetchLiveAttendance(labId, date);
      }
    };

    socket.on('student:scanned', handleStudentScanned);
    socket.on('attendance:changed', handleAttendanceChanged);

    return () => {
      socket.off('student:scanned', handleStudentScanned);
      socket.off('attendance:changed', handleAttendanceChanged);
    };
  }, [labId, date, fetchLiveAttendance]);

  const generate = async () => {
    if (!labId) return toast.error('Please select a subject / lab session first');
    try {
      const { data } = await api.post('/attendance/qr/generate', { lab_id: Number(labId) });
      setQr(data);
      toast.success(`Broadcasting QR session to student dashboards for ${data.lab_name || 'Lab'}!`);
      fetchLiveAttendance(labId, date);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to generate QR');
    }
  };

  const filteredStudents = liveData.students.filter(s =>
    s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.usn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedLabObj = labs.find(l => Number(l.lab_id) === Number(labId));

  return (
    <div className="space-y-6">
      {/* Top Header Card & Session Selector */}
      <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-5 rounded-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Radio className="text-emerald-500 animate-pulse" size={22} />
              Live QR Attendance System
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Generate dynamic anti-proxy QR codes for your subject lab. Student scans will automatically display as <strong>Present</strong> below in real-time.
            </p>
          </div>

          <button 
            onClick={generate} 
            className="btn-primary flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <QrCode size={18} />
            Generate & Broadcast QR Code
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Select Subject / Lab Session
            </label>
            <select 
              className="input w-full bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700" 
              value={labId} 
              onChange={e => setLabId(e.target.value)}
            >
              <option value="">-- Choose Subject / Lab --</option>
              {labs.map(l => (
                <option key={l.lab_id} value={l.lab_id}>
                  {l.lab_name} ({l.location || 'Main Hall'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Session Date
            </label>
            <input 
              type="date" 
              className="input w-full bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700" 
              value={date} 
              onChange={e => setDate(e.target.value)}
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => fetchLiveAttendance(labId, date)}
              disabled={loading || !labId}
              className="btn-secondary w-full flex items-center justify-center gap-2 border-slate-300 dark:border-slate-700 py-2.5"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Sync Live Status
            </button>
          </div>
        </div>
      </div>

      {/* Broadcast QR Card Display */}
      {qr && (
        <div className="card bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 rounded-xl border border-emerald-500/30 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              BROADCASTING LIVE
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-1 text-center bg-white p-3 rounded-xl shadow-inner inline-block mx-auto">
              <img src={qr.dataUrl} alt="Session QR Code" className="w-52 h-52 mx-auto rounded cursor-pointer" onClick={() => setFullscreenQr(true)} />
              <div className="text-[10px] text-slate-700 font-mono mt-1">SESSION: {qr.payload?.session_id}</div>
              <button 
                onClick={() => setFullscreenQr(true)}
                className="mt-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-md flex items-center gap-1.5 mx-auto border border-slate-300"
              >
                <Maximize2 size={13} /> Enlarge for Classroom
              </button>
            </div>

            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="text-emerald-400" size={20} />
                <h3 className="text-lg font-bold text-slate-100">
                  {qr.lab_name || selectedLabObj?.lab_name || 'Subject Session'} QR Code
                </h3>
              </div>
              
              <p className="text-xs text-slate-300">
                This dynamic Anti-Proxy QR code has been broadcast to all enrolled student dashboards for <strong>{qr.lab_name || selectedLabObj?.lab_name}</strong>. Students can scan this code or tap <strong>Mark Attendance</strong> directly on their portal.
              </p>

              <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-3 text-xs space-y-1.5 font-mono">
                <div className="text-emerald-400">🛡️ Anti-Proxy Security Status: ACTIVE</div>
                <div className="text-slate-300">📅 Valid Date: {qr.payload?.date}</div>
                <div className="text-amber-400">⏱️ Session Expiration: 10 Minutes Window</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Enlarge QR Modal */}
      {fullscreenQr && qr && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white animate-fade-in">
          <button 
            onClick={() => setFullscreenQr(false)}
            className="absolute top-6 right-6 p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-full transition-all border border-slate-600 shadow-xl"
          >
            <X size={28} />
          </button>

          <div className="text-center space-y-3 mb-6 max-w-md">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              LIVE CLASSROOM DISPLAY
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              {qr.lab_name || selectedLabObj?.lab_name}
            </h2>
            <p className="text-sm text-slate-300">
              Scan with your phone camera or tap <strong>Mark Attendance</strong> in your Student Portal.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-2xl border-4 border-emerald-500">
            <img src={qr.dataUrl} alt="Enlarged QR Code" className="w-80 h-80 md:w-96 md:h-96 object-contain" />
          </div>

          <div className="mt-6 text-center text-xs font-mono text-slate-400 space-y-1">
            <div>Session ID: {qr.payload?.session_id}</div>
            <div className="text-amber-400 font-semibold">10-Minute Anti-Proxy Security Window Active</div>
          </div>
        </div>
      )}

      {/* Live Attendance Roster Dashboard */}
      <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        {/* Roster Header Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg flex items-center gap-2">
              <Users className="text-blue-500" size={20} />
              Class Attendance Monitor
              {selectedLabObj && <span className="text-xs font-normal text-slate-500">({selectedLabObj.lab_name})</span>}
            </h3>
            <p className="text-xs text-slate-500">Real-time dynamic status feed for date: {date}</p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-slate-700 font-semibold">
              Total: {liveData.totalCount}
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              Present: {liveData.presentCount}
            </div>
            <div className="bg-amber-50 dark:bg-slate-800 text-amber-700 dark:text-amber-300 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-slate-700 font-semibold">
              Pending: {liveData.pendingCount}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by student USN, name, or department..."
            className="input w-full pl-9 text-xs bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Live Attendance Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 border-y border-slate-200 dark:border-slate-700">
                <th className="py-3 px-4">USN</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Attendance Status</th>
                <th className="py-3 px-4 text-right">Time Marked</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.length > 0 ? (
                filteredStudents.map(s => {
                  const isPresent = s.status === 'present';
                  return (
                    <tr 
                      key={s.student_id} 
                      className={`transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                        isPresent ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                        {s.usn}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-100">
                        {s.full_name}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400">
                        {s.department || 'Computer Science'}
                      </td>
                      <td className="py-3 px-4">
                        {isPresent ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 size={14} className="text-emerald-500" />
                            PRESENT {s.method ? `(${s.method.toUpperCase()})` : ''}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            <Clock size={14} className="text-amber-500" />
                            Pending QR Scan
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-xs font-mono text-slate-500 dark:text-slate-400">
                        {s.marked_at ? new Date(s.marked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                    {loading ? 'Fetching student roster...' : 'No students found for this lab session.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
