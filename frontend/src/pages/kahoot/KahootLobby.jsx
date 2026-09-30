import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Gamepad2, Play, PlusCircle, Users, Sparkles, Trophy, Radio, ArrowRight, Volume2, VolumeX, CheckCircle, Plus, Trash2, ShieldCheck, Crown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { sounds } from '../../utils/sound';

export default function KahootLobby() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Join Game PIN state (For Students)
  const [pinInput, setPinInput] = useState('');
  const [joining, setJoining] = useState(false);

  // Host Create Room state (For HOD & Faculty Hosts)
  const [activeTab, setActiveTab] = useState('preset'); // 'preset', 'custom'
  const [subject, setSubject] = useState(user?.subject || 'DBMS (Database Management Systems)');
  const [customSubject, setCustomSubject] = useState('');
  const [useAi, setUseAi] = useState(true);
  const [questionCount, setQuestionCount] = useState(5);
  const [timeLimit, setTimeLimit] = useState(20);
  const [activeRooms, setActiveRooms] = useState([]);
  const [creating, setCreating] = useState(false);
  const [muted, setMuted] = useState(false);

  // Custom Questions Builder state
  const [customQuestions, setCustomQuestions] = useState([
    {
      question: "Which SQL command is used to retrieve data from a database?",
      options: ["SELECT", "FETCH", "GET", "EXTRACT"],
      answerIndex: 0,
      timeLimit: 20
    }
  ]);

  const isHostRole = user?.role === 'hod';

  const fetchActiveRooms = () => {
    api.get('/kahoot/active-rooms')
      .then(r => setActiveRooms(Array.isArray(r.data) ? r.data : []))
      .catch(() => {});
  };

  useEffect(() => {
    fetchActiveRooms();
    const interval = setInterval(fetchActiveRooms, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleSound = () => {
    const nextMute = !muted;
    setMuted(nextMute);
    sounds.setMuted(nextMute);
    if (!nextMute) sounds.playTick();
  };

  const handleJoinByPin = async (e) => {
    e?.preventDefault();
    const cleanPin = pinInput.trim();
    if (!cleanPin || cleanPin.length < 5) {
      return toast.error('Please enter a valid 6-digit Game PIN');
    }

    setJoining(true);
    try {
      const res = await api.get(`/kahoot/room/${cleanPin}`);
      sounds.playJoin();
      toast.success(`🎉 Joining ${res.data.subject} Live Game!`);
      navigate(`/kahoot/play?pin=${cleanPin}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Game PIN not found or session closed');
    } finally {
      setJoining(false);
    }
  };

  const handleCreateHostRoom = async (e) => {
    e.preventDefault();
    const finalSubject = (customSubject.trim() || subject).trim();
    if (!finalSubject) return toast.error('Please specify a subject for the live quiz');

    setCreating(true);
    const toastId = toast.loading('Generating Kahoot Live Arena Room...');
    try {
      const payload = {
        subject: finalSubject,
        useAi: activeTab === 'preset' ? useAi : false,
        count: questionCount,
        defaultTimeLimit: timeLimit,
        questions: activeTab === 'custom' ? customQuestions : undefined
      };

      const res = await api.post('/kahoot/create', payload);
      toast.dismiss(toastId);
      sounds.playJoin();
      toast.success(`🚀 Live Kahoot Room Created! PIN: ${res.data.pin}`);
      navigate(`/kahoot/host?pin=${res.data.pin}`);
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err.response?.data?.error || 'Failed to create live game room');
    } finally {
      setCreating(false);
    }
  };

  // Custom Question Form Helpers
  const addCustomQuestion = () => {
    if (customQuestions.length >= 10) {
      return toast.error('Maximum 10 custom questions allowed per quiz session');
    }
    setCustomQuestions([
      ...customQuestions,
      {
        question: '',
        options: ['', '', '', ''],
        answerIndex: 0,
        timeLimit: 20
      }
    ]);
  };

  const removeCustomQuestion = (index) => {
    if (customQuestions.length <= 1) {
      return toast.error('At least 1 question is required');
    }
    setCustomQuestions(customQuestions.filter((_, i) => i !== index));
  };

  const updateQuestionField = (qIdx, field, val) => {
    const updated = [...customQuestions];
    updated[qIdx][field] = val;
    setCustomQuestions(updated);
  };

  const updateOptionText = (qIdx, optIdx, val) => {
    const updated = [...customQuestions];
    updated[qIdx].options[optIdx] = val;
    setCustomQuestions(updated);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="card bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 text-white p-8 rounded-3xl border border-purple-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold uppercase tracking-wider">
              <Gamepad2 size={16} className="text-amber-400 animate-bounce" />
              {isHostRole ? 'Faculty & HOD Quiz Host Control Center' : 'Smart Lab Kahoot Live Arena'}
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
              {isHostRole ? 'Host & Broadcast Live Kahoot Quizzes' : 'Real-Time Interactive Quiz & Competition'}
            </h1>
            <p className="text-sm text-purple-200 max-w-xl">
              {isHostRole 
                ? 'Create live quiz rooms, broadcast 6-digit Game PINs to student screens, view real-time answer distribution charts, and project live 3D victory podiums!'
                : 'Join live classroom quizzes using a 6-digit Game PIN, compete with speed bonuses, instant feedback, and live 3D victory podiums!'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleToggleSound}
              className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 rounded-2xl text-amber-300 transition cursor-pointer"
              title={muted ? 'Unmute Game Sounds' : 'Mute Game Sounds'}
            >
              {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 via-amber-500 to-emerald-500 flex items-center justify-center text-3xl shadow-lg animate-pulse">
              {isHostRole ? '👑' : '🎮'}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. FACULTY / HOD HOST VIEW (Exclusively Host Control - Player Join removed) */}
      {/* ========================================================================= */}
      {isHostRole ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Host Creation Panel (2 Columns wide) */}
          <div className="lg:col-span-2 card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-lg space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <Crown size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                    Host Live Quiz Session
                  </h2>
                  <p className="text-xs text-slate-500">Logged in as Host: <strong>{user?.name} ({user?.role?.toUpperCase()})</strong></p>
                </div>
              </div>

              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab('preset')}
                  className={`px-3.5 py-2 rounded-lg transition cursor-pointer ${activeTab === 'preset' ? 'bg-purple-600 text-white shadow' : 'text-slate-600 dark:text-slate-400'}`}
                >
                  AI / Preset Topics
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('custom')}
                  className={`px-3.5 py-2 rounded-lg transition cursor-pointer ${activeTab === 'custom' ? 'bg-purple-600 text-white shadow' : 'text-slate-600 dark:text-slate-400'}`}
                >
                  Custom Question Builder
                </button>
              </div>
            </div>

            {/* TAB 1: PRESET / AI GENERATION */}
            {activeTab === 'preset' && (
              <form onSubmit={handleCreateHostRoom} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Select Subject / Topic *
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value);
                      setCustomSubject('');
                    }}
                    className="input w-full bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-sm font-semibold p-3.5 rounded-2xl mb-2.5"
                  >
                    <option value="Java Lab">Java Lab</option>
                    <option value="DBMS Lab">DBMS Lab</option>
                    <option value="Python Lab">Python Lab</option>
                    <option value="Data Structures Lab">Data Structures Lab</option>
                    <option value="ADA Lab">ADA Lab (Analysis & Design of Algorithms)</option>
                    <option value="Operating Systems Lab">Operating Systems Lab</option>
                    <option value="AI & Machine Learning Lab">AI & Machine Learning Lab</option>
                    <option value="C Programming Lab">C Programming Lab</option>
                    <option value="Web Technologies Lab">Web Technologies Lab</option>
                    <option value="Computer Networks Lab">Computer Networks Lab</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Or type custom topic (e.g. Computer Networks - TCP/IP Handshake)"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    className="input w-full bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-xs p-3.5 rounded-2xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Question Count
                    </label>
                    <select
                      value={questionCount}
                      onChange={(e) => setQuestionCount(Number(e.target.value))}
                      className="input w-full bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-xs p-3 rounded-xl font-bold"
                    >
                      <option value={3}>3 Questions (Quick Warmup)</option>
                      <option value={5}>5 Questions (Standard Quiz)</option>
                      <option value={10}>10 Questions (Full Competition)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Time Limit per Question
                    </label>
                    <select
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(Number(e.target.value))}
                      className="input w-full bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-xs p-3 rounded-xl font-bold"
                    >
                      <option value={15}>15 Seconds (Speed Blitz)</option>
                      <option value={20}>20 Seconds (Recommended)</option>
                      <option value={30}>30 Seconds (Thoughtful)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800 text-xs">
                  <div className="flex items-center gap-2.5">
                    <Sparkles size={18} className="text-amber-500 animate-pulse" />
                    <div>
                      <div className="font-extrabold text-purple-900 dark:text-purple-300">AI Gemini-3.6 Question Generator</div>
                      <div className="text-[11px] text-purple-700 dark:text-purple-400">Generates unique multiple-choice questions instantly for your topic</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={useAi}
                    onChange={(e) => setUseAi(e.target.checked)}
                    className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
                  />
                </div>

                <button
                  type="submit"
                  disabled={creating}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-600 hover:from-purple-700 hover:to-emerald-700 text-white font-extrabold text-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Gamepad2 size={20} />
                  {creating ? 'Generating Live Room...' : 'CREATE LIVE ARENA & BROADCAST GAME PIN'}
                </button>
              </form>
            )}

            {/* TAB 2: CUSTOM QUESTION BUILDER */}
            {activeTab === 'custom' && (
              <form onSubmit={handleCreateHostRoom} className="space-y-4">
                <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                  {customQuestions.map((q, qIdx) => (
                    <div key={qIdx} className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-purple-600 dark:text-purple-400 font-mono">
                          Question #{qIdx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeCustomQuestion(qIdx)}
                          className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                          title="Remove Question"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <input
                        type="text"
                        placeholder="Enter question prompt..."
                        value={q.question}
                        onChange={(e) => updateQuestionField(qIdx, 'question', e.target.value)}
                        className="input w-full bg-white dark:bg-slate-900 text-xs font-semibold p-3 rounded-xl border-slate-300 dark:border-slate-700"
                        required
                      />

                      <div className="grid grid-cols-2 gap-2">
                        {['Option A 🔴', 'Option B 🔷', 'Option C 🟡', 'Option D 🟢'].map((lbl, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-1.5">
                            <input
                              type="radio"
                              name={`correct_${qIdx}`}
                              checked={q.answerIndex === optIdx}
                              onChange={() => updateQuestionField(qIdx, 'answerIndex', optIdx)}
                              className="accent-emerald-500 cursor-pointer"
                              title="Mark as Correct Answer"
                            />
                            <input
                              type="text"
                              placeholder={lbl}
                              value={q.options[optIdx] || ''}
                              onChange={(e) => updateOptionText(qIdx, optIdx, e.target.value)}
                              className={`input w-full text-xs p-2.5 rounded-xl border ${q.answerIndex === optIdx ? 'border-emerald-500 font-bold bg-emerald-50/50 dark:bg-emerald-950/20' : 'border-slate-300 dark:border-slate-700'}`}
                              required
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={addCustomQuestion}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-200 cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus size={16} /> Add Question ({customQuestions.length}/10)
                  </button>

                  <span className="text-[11px] text-slate-500 font-medium">
                    Radio button indicates correct answer
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={creating}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Play size={18} fill="currentColor" />
                  {creating ? 'Creating Custom Room...' : `LAUNCH CUSTOM QUIZ (${customQuestions.length} Questions)`}
                </button>
              </form>
            )}
          </div>

          {/* Active Live Rooms Monitor (Right Column for Host) */}
          <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                <Radio className="text-emerald-500 animate-pulse" size={18} />
                Live Active Rooms ({activeRooms.length})
              </h2>
            </div>

            {activeRooms.length > 0 ? (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {activeRooms.map((room) => (
                  <div
                    key={room.pin}
                    className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-purple-500 rounded-2xl transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-purple-600 dark:text-purple-400 font-mono">
                        PIN #{room.pin}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase">
                        {room.status}
                      </span>
                    </div>

                    <div>
                      <div className="font-extrabold text-sm text-slate-800 dark:text-white">
                        {room.subject}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Host: <strong>{room.hostName}</strong> • {room.playerCount} Joined Players
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/kahoot/host?pin=${room.pin}`)}
                      className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow cursor-pointer"
                    >
                      Open Host Controller Screen <ArrowRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-xs text-slate-400 space-y-3">
                <Crown size={36} className="mx-auto text-slate-300 dark:text-slate-700" />
                <div>No live quizzes running right now.</div>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  Create a new game PIN on the left to broadcast a live quiz session to your students!
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* 2. STUDENT PLAY LOBBY VIEW (Join Live Quiz form for Students)            */
        /* ========================================================================= */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* JOIN GAME PANEL (For Students) */}
          <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-lg space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                <Play size={22} fill="currentColor" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-800 dark:text-white">Join Live Kahoot Quiz</h2>
                <p className="text-xs text-slate-500">Enter the 6-digit Game PIN displayed on your faculty's screen</p>
              </div>
            </div>

            <form onSubmit={handleJoinByPin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  6-Digit Game PIN *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 582914"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center text-3xl font-black tracking-[0.3em] font-mono bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-300 dark:border-slate-700 rounded-2xl p-4 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all text-purple-600 dark:text-purple-400 placeholder:tracking-normal placeholder:font-sans placeholder:text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={joining || pinInput.length < 5}
                className="w-full py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-600 hover:from-purple-700 hover:to-emerald-700 disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {joining ? 'Connecting to Lobby...' : 'ENTER GAME ARENA'}
                <ArrowRight size={18} />
              </button>
            </form>

            {/* User Nickname Preview */}
            <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-2xl text-xs text-purple-800 dark:text-purple-300 flex items-center justify-between">
              <span className="font-medium">Playing as:</span>
              <span className="font-extrabold font-mono text-purple-600 dark:text-purple-400">
                {user?.name || 'Guest Student'} {user?.usn ? `(${user.usn})` : ''}
              </span>
            </div>

            {/* Currently Active Rooms Monitor for Students */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5"><Radio className="text-emerald-500 animate-pulse" size={16} /> Live Active Quiz Sessions</span>
                <span className="font-mono text-purple-500">{activeRooms.length} Active</span>
              </div>

              {activeRooms.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {activeRooms.map((room) => (
                    <div
                      key={room.pin}
                      onClick={() => {
                        setPinInput(room.pin);
                        sounds.playJoin();
                        navigate(`/kahoot/play?pin=${room.pin}`);
                      }}
                      className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 rounded-xl transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-black text-purple-600 dark:text-purple-400 font-mono">
                          PIN #{room.pin}
                        </div>
                        <div className="font-extrabold text-xs text-slate-800 dark:text-white">
                          {room.subject}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Host: <strong>{room.hostName}</strong> • {room.playerCount} Players
                        </div>
                      </div>

                      <button className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow cursor-pointer">
                        Join <ArrowRight size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-slate-400">
                  No active live quiz rooms currently broadcasting. Enter PIN above when your faculty starts!
                </div>
              )}
            </div>
          </div>

          {/* Student Instructions */}
          <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-lg space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                <Trophy size={22} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-800 dark:text-white">Kahoot Quiz Instructions</h2>
                <p className="text-xs text-slate-500">How to score maximum points in Kahoot live games</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800 space-y-1">
                <div className="font-extrabold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                  ⚡ Speed Multiplier Bonus
                </div>
                <p className="text-[11px] text-purple-800 dark:text-purple-300">
                  The faster you select the correct answer, the higher your point score! Answering in 1 second yields up to 1,000 points.
                </p>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 space-y-1">
                <div className="font-extrabold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  🔥 Answer Streak Multiplier
                </div>
                <p className="text-[11px] text-amber-800 dark:text-amber-300">
                  Getting consecutive questions correct builds your answer streak (+50 bonus points per streak step).
                </p>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-1">
                <div className="font-extrabold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                  🏆 Victory Podium & Leaderboard
                </div>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                  Top 3 players take the stage on the 3D winner podium at the end of the game!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
