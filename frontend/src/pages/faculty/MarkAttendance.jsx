import React, { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { QrCode, CheckCircle2, Clock, Users, Search, RefreshCw, Radio, Sparkles, Maximize2, X, AlertTriangle, ShieldCheck, Power, PlusCircle, BookOpen, Edit3, MapPin, Check, Play, Loader2, Zap } from 'lucide-react';
import { getSocket } from '../../services/socket';
import { useAuth } from '../../context/AuthContext.jsx';

export default function MarkAttendance() {
  const { user } = useAuth();
  const [labs, setLabs] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [liveData, setLiveData] = useState({ students: [], totalCount: 0, presentCount: 0, pendingCount: 0 });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [fullscreenQr, setFullscreenQr] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Session Form State
  const assignedSub = user?.subject || 'DBMS (Database Management Systems)';
  const [formSubject, setFormSubject] = useState(assignedSub);
  const [formLabId, setFormLabId] = useState('');
  const [formClassName, setFormClassName] = useState('CSE-A');
  const [formStartTime, setFormStartTime] = useState('10:00');
  const [formEndTime, setFormEndTime] = useState('12:00');
  const [formExpiryMinutes, setFormExpiryMinutes] = useState(15);
  const [creating, setCreating] = useState(false);
  const [editingLocationId, setEditingLocationId] = useState(null);
  const [editingLocationVal, setEditingLocationVal] = useState('');

  const [nowTime, setNowTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNowTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getRemainingSeconds = (expiresAt) => {
    if (!expiresAt) return 900;
    const target = new Date(expiresAt).getTime();
    return Math.max(0, Math.floor((target - nowTime) / 1000));
  };

  const formatTimeLeft = (seconds) => {
    if (seconds <= 0) return '00:00 Expired';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const unexpiredSessions = activeSessions.filter(s => {
    if (!s.qr_expires_at) return true;
    return new Date(s.qr_expires_at).getTime() > nowTime;
  });

  useEffect(() => {
    if (user?.subject) {
      setFormSubject(user.subject);
    }
  }, [user?.subject]);

  const fetchLabs = useCallback(async () => {
    try {
      const res = await api.get('/labs');
      setLabs(rResData(res.data));
      if (res.data.length > 0 && !formLabId) {
        setFormLabId(res.data[0].lab_id);
      }
    } catch (err) {
      console.error('Failed to load labs:', err);
    }
  }, [formLabId]);

  function rResData(data) {
    return Array.isArray(data) ? data : [];
  }

  const saveLabLocation = async (labId, location) => {
    if (!location.trim()) { toast.error('Location cannot be empty'); return; }
    try {
      await api.patch(`/labs/${labId}/location`, { location: location.trim() });
      toast.success(`Floor / room updated to "${location.trim()}"`, { icon: '📍' });
      setEditingLocationId(null);
      setEditingLocationVal('');
      // Refresh labs list to reflect new location
      const res = await api.get('/labs');
      setLabs(rResData(res.data));
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update location');
    }
  };

  const fetchActiveSessions = useCallback(async () => {
    try {
      const res = await api.get('/attendance/sessions/faculty/active');
      const sessions = rResData(res.data);
      setActiveSessions(sessions);
      if (sessions.length > 0 && !selectedSessionId) {
        setSelectedSessionId(sessions[0].session_id);
      }
    } catch (err) {
      console.error('Failed to fetch active sessions:', err);
    }
  }, [selectedSessionId]);

  const fetchLiveAttendance = useCallback(async (sessionId) => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const currentSession = activeSessions.find(s => Number(s.session_id) === Number(sessionId));
      const labId = currentSession?.lab_id || 1;
      const res = await api.get(`/attendance/live/${labId}?session_id=${sessionId}`);
      setLiveData(res.data);
    } catch (err) {
      console.error('Failed to load live attendance:', err);
    } finally {
      setLoading(false);
    }
  }, [activeSessions]);

  useEffect(() => {
    fetchLabs();
    fetchActiveSessions();
  }, [fetchLabs, fetchActiveSessions]);

  useEffect(() => {
    if (selectedSessionId) {
      fetchLiveAttendance(selectedSessionId);
    }
  }, [selectedSessionId, fetchLiveAttendance]);

  // Real-time Socket.IO listener for live student scans
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleStudentScanned = (data) => {
      if (!selectedSessionId || Number(data.session_id) === Number(selectedSessionId)) {
        toast.success(`🎉 ${data.full_name} (${data.usn}) marked Present for ${data.subject || 'Lab'}!`, { duration: 4000 });
        
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

        fetchActiveSessions();
      }
    };

    const handleAttendanceChanged = () => {
      if (selectedSessionId) {
        fetchLiveAttendance(selectedSessionId);
        fetchActiveSessions();
      }
    };

    socket.on('student:scanned', handleStudentScanned);
    socket.on('attendance:changed', handleAttendanceChanged);

    return () => {
      socket.off('student:scanned', handleStudentScanned);
      socket.off('attendance:changed', handleAttendanceChanged);
    };
  }, [selectedSessionId, fetchLiveAttendance, fetchActiveSessions]);

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!formSubject || !formLabId || !formClassName) {
      return toast.error('Please fill in Subject, Laboratory, and Class/Section');
    }
    setCreating(true);
    const toastId = toast.loading('Creating lab session & generating unique QR...');
    try {
      const res = await api.post('/attendance/sessions/create', {
        subject: formSubject,
        lab_id: Number(formLabId),
        class_name: formClassName,
        start_time: formStartTime,
        end_time: formEndTime,
        expiry_minutes: Number(formExpiryMinutes)
      });
      toast.dismiss(toastId);
      toast.success(`✅ Session created for ${formSubject} (${formClassName})! QR active.`);
      setShowCreateModal(false);
      await fetchActiveSessions();
      setSelectedSessionId(res.data.session_id);
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err.response?.data?.message || 'Failed to create lab session');
    } finally {
      setCreating(false);
    }
  };

  const handleRegenerateQR = async (sessionId) => {
    const toastId = toast.loading('Regenerating QR token & resetting expiry...');
    try {
      const res = await api.post(`/attendance/sessions/${sessionId}/regenerate-qr`, { expiry_minutes: 15 });
      toast.dismiss(toastId);
      toast.success('✅ QR Code regenerated! Fresh 15-minute validity window active.');
      fetchActiveSessions();
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err.response?.data?.message || 'Failed to regenerate QR');
    }
  };

  const handleCloseSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to close this lab session? QR scanning will be disabled.')) return;
    const toastId = toast.loading('Closing session...');
    try {
      await api.post(`/attendance/sessions/${sessionId}/close`);
      toast.dismiss(toastId);
      toast.success('Lab session closed.');
      await fetchActiveSessions();
      if (selectedSessionId === sessionId) {
        setSelectedSessionId(null);
      }
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err.response?.data?.message || 'Failed to close session');
    }
  };

  const activeSessionObj = unexpiredSessions.find(s => Number(s.session_id) === Number(selectedSessionId)) || unexpiredSessions[0];

  const filteredStudents = liveData.students.filter(s =>
    s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.usn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.section?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header Banner */}
      <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-6 rounded-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                <Radio size={14} className="animate-pulse" /> Session-Based Lab QR Attendance
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20 text-xs font-bold">
                <BookOpen size={14} /> Assigned Subject: <span className="font-extrabold text-violet-600 dark:text-violet-400 uppercase">{user?.subject || 'DBMS Lab'}</span>
              </div>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              Faculty Lab Sessions & QR System
            </h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Create unique, session-specific QR codes assigned strictly to your lab subject and class/section (e.g. DBMS CSE-A, Java CSE-B, Python CSE-C).
            </p>
          </div>

          <button 
            onClick={() => setShowCreateModal(true)} 
            className="relative group overflow-hidden px-5 py-3 rounded-xl font-bold text-xs md:text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 animate-start-btn shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shrink-0 flex items-center justify-center gap-2.5"
          >
            {/* Sliding shimmer light */}
            <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none animate-btn-shimmer-sweep" />
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-300"></span>
            </span>
            <Play size={16} className="fill-current text-white transition-transform group-hover:scale-125 group-hover:translate-x-0.5" />
            <span className="tracking-wide">Start New Lab Session</span>
          </button>
        </div>
      </div>

      {/* Active Session Selector Cards */}
      {unexpiredSessions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Radio className="text-emerald-500 animate-pulse" size={16} /> Currently Active Lab Sessions ({unexpiredSessions.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {unexpiredSessions.map(s => {
              const isSelected = Number(s.session_id) === Number(selectedSessionId);
              const remaining = getRemainingSeconds(s.qr_expires_at);

              return (
                <div 
                  key={s.session_id} 
                  onClick={() => setSelectedSessionId(s.session_id)}
                  className={`card p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected 
                      ? 'bg-gradient-to-br from-slate-900 to-slate-950 text-white border-emerald-500 shadow-lg ring-2 ring-emerald-500/30'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                      isSelected ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}>
                      {s.class_name}
                    </span>
                    <span className="text-[10px] font-mono text-amber-400 font-bold flex items-center gap-1">
                      <Clock size={10} /> {formatTimeLeft(remaining)}
                    </span>
                  </div>

                  <h4 className={`font-extrabold text-sm mb-1 ${isSelected ? 'text-white' : 'text-slate-800 dark:text-white'}`}>
                    {s.subject}
                  </h4>

                  <div className={`text-xs space-y-0.5 font-mono mb-3 ${isSelected ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                    <div>📍 {s.lab_name} ({s.location || '2F 01'})</div>
                    <div>⏰ {s.start_time} - {s.end_time}</div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-700/40">
                    <div className="font-bold">
                      Attendance: <span className="text-emerald-400 font-mono text-sm">{s.presentStudents} / {s.totalStudents}</span>
                    </div>

                    <button 
                      onClick={(e) => { e.stopPropagation(); handleCloseSession(s.session_id); }}
                      className="text-[11px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Power size={12} /> Close
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Active Session Banner & QR Display */}
      {activeSessionObj ? (
        <div className="card bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 rounded-2xl border border-emerald-500/40 shadow-xl relative overflow-hidden">
          <div className="grid md:grid-cols-3 gap-6 items-center">
            {/* QR Image Box */}
            <div className="md:col-span-1 text-center bg-white p-4 rounded-2xl shadow-inner inline-block mx-auto">
              <img 
                src={activeSessionObj.dataUrl} 
                alt="Session QR Code" 
                className="w-56 h-56 mx-auto rounded-lg cursor-pointer hover:scale-105 transition-transform" 
                onClick={() => setFullscreenQr(true)} 
              />
              <div className="text-[10px] text-slate-800 font-mono font-bold mt-2">
                SESSION ID: #{activeSessionObj.session_id}
              </div>
              <button 
                onClick={() => setFullscreenQr(true)}
                className="mt-2 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 mx-auto border border-slate-300 transition-colors shadow-sm cursor-pointer"
              >
                <Maximize2 size={14} /> Fullscreen Display
              </button>
            </div>

            {/* Session Info Details */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mb-2">
                    <Radio size={12} className="animate-pulse" /> LIVE SESSION — {activeSessionObj.class_name} ONLY
                  </span>
                  <h3 className="text-2xl font-extrabold text-white">
                    {activeSessionObj.subject}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    {activeSessionObj.lab_name} · {activeSessionObj.location} · Class: <strong>{activeSessionObj.class_name}</strong>
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleRegenerateQR(activeSessionObj.session_id)}
                    className="btn bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 border border-slate-700 cursor-pointer transition-all"
                  >
                    <RefreshCw size={14} /> Regenerate QR
                  </button>
                  <button
                    onClick={() => handleCloseSession(activeSessionObj.session_id)}
                    className="btn bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 border border-rose-500/30 cursor-pointer transition-all"
                  >
                    <Power size={14} /> Close Session
                  </button>
                </div>
              </div>

              {/* Security & Expiry Notice */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 text-xs space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Class Restricted</span>
                  <span className="font-extrabold text-emerald-400 font-mono text-sm">{activeSessionObj.class_name}</span>
                </div>
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 text-xs space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Time Slot</span>
                  <span className="font-bold text-slate-200 font-mono">{activeSessionObj.start_time} - {activeSessionObj.end_time}</span>
                </div>
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 text-xs space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">QR Security Expiry</span>
                  <span className="font-bold text-amber-400 font-mono flex items-center gap-1">
                    <Clock size={12} /> {formatTimeLeft(getRemainingSeconds(activeSessionObj.qr_expires_at))}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-start gap-2">
                <ShieldCheck size={18} className="shrink-0 text-emerald-400 mt-0.5" />
                <span>
                  <strong>Strict 10-Step Security Active:</strong> Only students enrolled in <strong>{activeSessionObj.class_name}</strong> for <strong>{activeSessionObj.subject}</strong> can scan this QR code. The session will automatically expire and close after 15 minutes.
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 text-center rounded-2xl space-y-3">
          <QrCode size={48} className="mx-auto text-slate-400" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">No Active Lab Session</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Click <strong>Create New Lab Session</strong> above to specify your Subject, Lab, Class/Section (e.g. CSE-A, CSE-B), and generate a session-specific QR code.
          </p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="relative group overflow-hidden px-5 py-2.5 rounded-xl text-white text-xs font-bold bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 animate-start-btn shadow-md hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-2 cursor-pointer transition-all"
          >
            <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none animate-btn-shimmer-sweep" />
            <Play size={14} className="fill-current text-white transition-transform group-hover:scale-125" />
            <span>Start Session Now</span>
          </button>
        </div>
      )}

      {/* Fullscreen Enlarge QR Modal */}
      {fullscreenQr && activeSessionObj && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white animate-fade-in">
          <button 
            onClick={() => setFullscreenQr(false)}
            className="absolute top-6 right-6 p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-full transition-all border border-slate-600 shadow-xl cursor-pointer"
          >
            <X size={28} />
          </button>

          <div className="text-center space-y-2 mb-6 max-w-md">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <Radio size={12} className="animate-pulse" /> LIVE CLASSROOM QR DISPLAY
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              {activeSessionObj.subject}
            </h2>
            <p className="text-sm font-semibold text-emerald-400">
              Assigned Class: {activeSessionObj.class_name} · {activeSessionObj.lab_name}
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-2xl border-4 border-emerald-500">
            <img src={activeSessionObj.dataUrl} alt="Enlarged QR Code" className="w-80 h-80 md:w-96 md:h-96 object-contain" />
          </div>

          <div className="mt-6 text-center text-xs font-mono text-slate-400 space-y-1">
            <div>Session ID: #{activeSessionObj.session_id}</div>
            <div className="text-amber-400 font-semibold flex items-center justify-center gap-1">
              <Clock size={14} /> QR Expiry Countdown: {formatTimeLeft(getRemainingSeconds(activeSessionObj.qr_expires_at))}
            </div>
          </div>
        </div>
      )}

      {/* Create New Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 shrink-0">
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400">
                  <QrCode size={18} />
                </span>
                Create Lab Attendance Session
              </h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateSession} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Subject Name *
                  </label>
                  <select
                    value={formSubject}
                    onChange={e => {
                      const newSubject = e.target.value;
                      setFormSubject(newSubject);
                      const subj = newSubject.toLowerCase();
                      const matchedLab = labs.find(l => {
                        const lname = l.lab_name.toLowerCase();
                        if (subj.includes('java') && lname.includes('java')) return true;
                        if ((subj.includes('data structure') || subj.includes('dsa')) && (lname.includes('dsa') || lname.includes('data structure'))) return true;
                        if (subj.includes('dbms') && lname.includes('dbms')) return true;
                        if (subj.includes('ada') && lname.includes('ada')) return true;
                        if (subj.includes('micro') && (lname.includes('micro') || lname.includes('iot'))) return true;
                        if (subj.includes('mongo') && lname.includes('mongo')) return true;
                        if ((subj.includes('ai') || subj.includes('python')) && (lname.includes('ai') || lname.includes('python'))) return true;
                        if ((subj.includes('c ') || subj === 'c programming lab') && (lname.includes('c ') || lname === 'c' || lname.includes('c language'))) return true;
                        return false;
                      });
                      if (matchedLab) setFormLabId(matchedLab.lab_id);
                    }}
                    className="input w-full bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-xs font-semibold"
                  >
                    {user?.subject && (
                      <option value={user.subject}>
                        ⭐ {user.subject} (Your Assigned Subject)
                      </option>
                    )}
                    <option value="Java Lab">Java Lab</option>
                    <option value="DBMS Lab">DBMS Lab</option>
                    <option value="Python Lab">Python Lab</option>
                    <option value="Data Structures Lab">Data Structures Lab</option>
                    <option value="ADA Lab">ADA Lab (Analysis & Design of Algorithms)</option>
                    <option value="Operating Systems Lab">Operating Systems Lab</option>
                    <option value="AI & Machine Learning Lab">AI & Machine Learning Lab</option>
                    <option value="C Programming Lab">C Programming Lab</option>
                    <option value="MongoDB Lab">MongoDB Lab</option>
                    <option value="Computer Networks Lab">Computer Networks Lab</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Laboratory *
                  </label>

                  {/* Compact lab picker with inline floor-edit and clean scroll */}
                  <div className="border border-slate-300 dark:border-slate-600 rounded-xl overflow-y-auto max-h-44 bg-white dark:bg-slate-800 shadow-inner">
                    {labs.map((l, idx) => {
                      const isSelected = String(formLabId) === String(l.lab_id);
                      const isEditingThis = editingLocationId === l.lab_id;

                      return (
                        <div
                          key={l.lab_id}
                          className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-all text-xs
                            ${idx > 0 ? 'border-t border-slate-200 dark:border-slate-700' : ''}
                            ${isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                            }`}
                          onClick={() => { if (!isEditingThis) setFormLabId(l.lab_id); }}
                        >
                          {/* Radio dot */}
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 border-2 ${isSelected ? 'bg-white border-white' : 'border-slate-400'}`} />

                          {/* Lab name */}
                          <span className="font-semibold flex-1">{l.lab_name}</span>

                          {/* Floor badge or edit input */}
                          {isEditingThis ? (
                            <div
                              className="flex items-center gap-1"
                              onClick={e => e.stopPropagation()}
                            >
                              <input
                                autoFocus
                                className="input text-xs font-mono py-0.5 px-2 w-24 bg-amber-50 dark:bg-amber-950/50 border-amber-400 text-slate-800 dark:text-white"
                                placeholder="e.g. 2F 02"
                                value={editingLocationVal}
                                onChange={e => setEditingLocationVal(e.target.value)}
                                onKeyDown={e => {
                                  e.stopPropagation();
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    saveLabLocation(l.lab_id, editingLocationVal);
                                  }
                                  if (e.key === 'Escape') {
                                    e.preventDefault();
                                    setEditingLocationId(null);
                                    setEditingLocationVal('');
                                  }
                                }}
                                onClick={e => e.stopPropagation()}
                              />
                              <button
                                type="button"
                                onClick={e => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  saveLabLocation(l.lab_id, editingLocationVal);
                                }}
                                className="p-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                                title="Save floor number"
                              ><Check size={11} /></button>
                              <button
                                type="button"
                                onClick={e => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setEditingLocationId(null);
                                  setEditingLocationVal('');
                                }}
                                className="p-1 rounded bg-slate-400 hover:bg-slate-500 text-white cursor-pointer"
                                title="Cancel"
                              ><X size={11} /></button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono font-bold text-[10px]
                                ${isSelected
                                  ? 'bg-white/20 text-white'
                                  : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400'
                                }`}>
                                <MapPin size={9} />
                                {l.location || '—'}
                              </span>
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  setEditingLocationId(l.lab_id);
                                  setEditingLocationVal(l.location || '');
                                }}
                                className={`p-1.5 rounded transition ${isSelected ? 'hover:bg-white/20 text-white/80' : 'hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-400 hover:text-indigo-600'}`}
                                title="Edit floor / room number"
                                type="button"
                              >
                                <Edit3 size={12} />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <Edit3 size={9} /> Click the pencil icon to edit the floor / room number for any lab.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Class / Section *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CSE-A, CSE-B, CSE-C"
                    value={formClassName}
                    onChange={e => setFormClassName(e.target.value)}
                    className="input w-full bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-xs uppercase"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Only students belonging to this class section will be able to see and scan this QR session.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={formStartTime}
                      onChange={e => setFormStartTime(e.target.value)}
                      className="input w-full bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={formEndTime}
                      onChange={e => setFormEndTime(e.target.value)}
                      className="input w-full bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    QR Expiry Window (Minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={formExpiryMinutes}
                    onChange={e => setFormExpiryMinutes(e.target.value)}
                    className="input w-full bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-xs"
                  />
                </div>
              </div>

              {/* Sticky Footer with Animated Start Session Button */}
              <div className="p-4 bg-slate-50/90 dark:bg-slate-800/90 backdrop-blur border-t border-slate-200 dark:border-slate-800 flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="relative group flex-1 py-3 px-4 rounded-xl text-white font-extrabold text-xs uppercase tracking-wider overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:via-indigo-500 hover:to-purple-500 animate-start-btn shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 flex items-center justify-center gap-2"
                >
                  {/* Sliding shimmer light beam */}
                  <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none animate-btn-shimmer-sweep" />

                  {creating ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-white" />
                      <span>Starting Session...</span>
                    </>
                  ) : (
                    <>
                      {/* Pulse beacon dot */}
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-300"></span>
                      </span>
                      <Play size={14} className="fill-current text-white transition-transform group-hover:scale-125 group-hover:translate-x-0.5" />
                      <span className="font-extrabold drop-shadow">Start Session</span>
                      <Zap size={14} className="text-amber-300 animate-pulse ml-0.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Class Roster Table */}
      {selectedSessionId && (
        <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-lg flex items-center gap-2">
                <Users className="text-blue-500" size={20} />
                Live Attendance Roster
                {activeSessionObj && <span className="text-xs font-normal text-slate-500">({activeSessionObj.subject} - {activeSessionObj.class_name})</span>}
              </h3>
              <p className="text-xs text-slate-500">Real-time attendance status feed for active session #{selectedSessionId}</p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-slate-700 font-bold">
                Total Class: {liveData.totalCount}
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                Present: {liveData.presentCount}
              </div>
              <div className="bg-amber-50 dark:bg-slate-800 text-amber-700 dark:text-amber-300 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-slate-700 font-bold">
                Pending: {liveData.pendingCount}
              </div>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search student by USN, name, or section..."
              className="input w-full pl-9 text-xs bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 border-y border-slate-200 dark:border-slate-700">
                  <th className="py-3 px-4">USN</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Section / Class</th>
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
                        <td className="py-3 px-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                          {s.section || s.department || 'CSE-A'}
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
                      {loading ? 'Fetching student roster...' : 'No students found for this session.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
