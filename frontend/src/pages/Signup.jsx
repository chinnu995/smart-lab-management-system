import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Shield, BookOpen, GraduationCap, Lock, Mail, User, Hash, BadgeCheck, ArrowLeft, CheckCircle2, RotateCw } from 'lucide-react';

export default function Signup() {
  const { user, setUser } = useAuth();
  const nav = useNavigate();
  const [activeRole, setActiveRole] = useState('student');
  const [step, setStep] = useState(1); // 1 = form, 2 = OTP verification

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [usn, setUsn] = useState('');
  const [empCode, setEmpCode] = useState('');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');
  const [semester, setSemester] = useState('');
  const [scheme, setScheme] = useState('2022 Scheme');
  const [subject, setSubject] = useState('JAVA');

  // OTP fields
  const [otp, setOtp] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [devOtp, setDevOtp] = useState(''); // For dev mode auto-fill

  // Resend OTP state
  const [resendTimer, setResendTimer] = useState(0);
  const [resendCount, setResendCount] = useState(0);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    let t;
    if (resendTimer > 0) {
      t = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(t);
  }, [resendTimer]);

  const handleResendCode = async () => {
    if (resendTimer > 0 || resendCount >= 3 || resending) return;
    setResending(true);
    try {
      const { data } = await api.post('/auth/resend-code', { email: pendingEmail, type: 'signup' });
      toast.success(data.message || 'New verification code sent to your email!');
      setResendCount(c => c + 1);
      setResendTimer(30);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  const [loading, setLoading] = useState(false);

  const handleUsnInputChange = (e) => {
    let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (val.startsWith('4PM')) {
      val = val.slice(3);
    }
    val = val.slice(0, 7);
    setUsn(val ? `4PM${val}` : '');
  };

  if (user) return <Navigate to="/" replace />;

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const payload = { full_name: fullName, email, password, role: activeRole, department, phone: phone || undefined };
      if (activeRole === 'student') {
        const usnPattern = /^4PM\d{2}[A-Z]{2}\d{3}$/;
        if (!usnPattern.test(usn)) {
          toast.error('Invalid USN format! Must be 4PM + 2-digit Year + 2-letter Branch + 3-digit Roll No (e.g. 4PM22CS001)');
          setLoading(false);
          return;
        }
        payload.usn = usn;
        payload.semester = Number(semester) || undefined;
        payload.scheme = scheme;
      }
      if (activeRole === 'faculty') {
        payload.emp_code = empCode;
        payload.scheme = scheme;
        payload.subject = subject;
      }

      const { data } = await api.post('/auth/signup', payload);
      toast.success(data.message || 'Verification code sent to your email!');
      setPendingEmail(email);
      setOtp(''); // Always require manual entry of email verification code
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-signup', { email: pendingEmail, otp });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      toast.success('Account verified! Welcome aboard!');
      nav('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };


  const roles = {
    student: {
      title: 'Student Sign Up',
      subtitle: 'Create your student account',
      accentColor: 'emerald',
      btnBg: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20',
      ringColor: 'focus:ring-emerald-500 focus:border-emerald-500',
      icon: GraduationCap,
      iconBg: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
      tabBorder: 'border-emerald-500 text-emerald-500 bg-emerald-500/5',
    },
    faculty: {
      title: 'Faculty Sign Up',
      subtitle: 'Create your faculty account',
      accentColor: 'purple',
      btnBg: 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/20',
      ringColor: 'focus:ring-purple-500 focus:border-purple-500',
      icon: BookOpen,
      iconBg: 'bg-purple-500/10 text-purple-500 border border-purple-500/20',
      tabBorder: 'border-purple-500 text-purple-500 bg-purple-500/5',
    },
    hod: {
      title: 'HOD Sign Up',
      subtitle: 'Create your HOD account',
      accentColor: 'blue',
      btnBg: 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20',
      ringColor: 'focus:ring-blue-500 focus:border-blue-500',
      icon: Shield,
      iconBg: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
      tabBorder: 'border-blue-500 text-blue-500 bg-blue-500/5',
    }
  };

  const currentRole = roles[activeRole];
  const CurrentIcon = currentRole.icon;

  return (
    <div className="min-h-screen flex flex-col justify-between p-6 md:p-12 relative overflow-hidden login-bg-container">
      <style>{`
        .login-bg-container {
          position: relative;
          background-color: #0b0f19;
          overflow: hidden;
        }
        .login-bg-img {
          position: absolute;
          inset: 0;
          background-image: url('/college_bg.jpg');
          background-repeat: no-repeat;
          background-position: center center;
          background-size: cover;
          animation: kenBurns 25s ease-in-out infinite alternate;
          transform-origin: center center;
        }
        @keyframes kenBurns {
          0% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.06) translate(-10px, -6px); }
          100% { transform: scale(1) translate(0, 0); }
        }
        .bg-orb-1 {
          position: absolute;
          top: 10%;
          left: 5%;
          width: 450px;
          height: 450px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, rgba(59, 130, 246, 0) 70%);
          filter: blur(40px);
          animation: floatOrb1 18s ease-in-out infinite alternate;
          pointer-events: none;
        }
        .bg-orb-2 {
          position: absolute;
          bottom: 5%;
          right: 10%;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(168, 85, 247, 0.22) 0%, rgba(99, 102, 241, 0) 70%);
          filter: blur(50px);
          animation: floatOrb2 22s ease-in-out infinite alternate;
          pointer-events: none;
        }
        .bg-orb-3 {
          position: absolute;
          top: 45%;
          left: 40%;
          width: 380px;
          height: 380px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, rgba(20, 184, 166, 0) 70%);
          filter: blur(45px);
          animation: floatOrb3 15s ease-in-out infinite alternate;
          pointer-events: none;
        }
        @keyframes floatOrb1 {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(60px, -40px) scale(1.15); }
          100% { transform: translate(-30px, 30px) scale(0.95); }
        }
        @keyframes floatOrb2 {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-50px, -50px) scale(1.2); }
          100% { transform: translate(40px, 20px) scale(1); }
        }
        @keyframes floatOrb3 {
          0% { transform: translate(0px, 0px) scale(0.9); }
          50% { transform: translate(-40px, 40px) scale(1.1); }
          100% { transform: translate(30px, -30px) scale(1); }
        }
        .floating-particle {
          position: absolute;
          color: rgba(255, 255, 255, 0.35);
          font-family: monospace;
          font-weight: 800;
          pointer-events: none;
          user-select: none;
          animation: floatUp 14s linear infinite;
          text-shadow: 0 0 8px rgba(255,255,255,0.4);
        }
        @keyframes floatUp {
          0% { transform: translateY(110vh) rotate(0deg); opacity: 0; }
          15% { opacity: 0.5; }
          85% { opacity: 0.5; }
          100% { transform: translateY(-10vh) rotate(360deg); opacity: 0; }
        }
        .btn-glow-effect {
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn-glow-effect:hover {
          transform: translateY(-2px) scale(1.01);
          box-shadow: 0 12px 25px -5px rgba(59, 130, 246, 0.45), 0 8px 10px -6px rgba(59, 130, 246, 0.25);
        }
        .btn-glow-effect:active {
          transform: translateY(0) scale(0.98);
        }
        .btn-glow-effect::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -60%;
          width: 50%;
          height: 200%;
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.4) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: rotate(30deg);
          transition: all 0.75s ease;
        }
        .btn-glow-effect:hover::after {
          left: 140%;
        }
        .tab-btn-effect {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .tab-btn-effect:hover {
          transform: translateY(-1px) scale(1.03);
        }
        .tab-btn-effect:active {
          transform: scale(0.97);
        }
      `}</style>

      {/* Background Animated Image & Glowing Overlay Layers */}
      <div className="login-bg-img pointer-events-none"></div>
      <div className="absolute inset-0 bg-slate-950/20 backdrop-brightness-95 pointer-events-none"></div>
      <div className="bg-orb-1"></div>
      <div className="bg-orb-2"></div>
      <div className="bg-orb-3"></div>

      {/* Floating Code & Math Tech Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[
          { text: '{ }', left: '8%', delay: '0s', size: '18px', duration: '14s' },
          { text: '< />', left: '22%', delay: '3s', size: '20px', duration: '16s' },
          { text: 'AI', left: '38%', delay: '1s', size: '16px', duration: '12s' },
          { text: '01', left: '55%', delay: '5s', size: '22px', duration: '18s' },
          { text: '[ ]', left: '72%', delay: '2s', size: '18px', duration: '15s' },
          { text: 'λ', left: '88%', delay: '4s', size: '24px', duration: '13s' },
          { text: '∫', left: '15%', delay: '7s', size: '22px', duration: '17s' },
          { text: 'VTU', left: '82%', delay: '6s', size: '15px', duration: '19s' },
        ].map((p, idx) => (
          <span
            key={idx}
            className="floating-particle"
            style={{
              left: p.left,
              animationDelay: p.delay,
              fontSize: p.size,
              animationDuration: p.duration
            }}
          >
            {p.text}
          </span>
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 self-start">
        <div className="p-1 rounded-2xl bg-white shadow-md flex items-center justify-center border border-slate-100">
          <svg className="w-10 h-10 shrink-0" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 8 L54 41 L87 45 L54 49 L50 82 L46 49 L13 45 L46 41 Z" fill="#DC2626" />
            <path d="M50 16 L52.5 42 L78 45 L52.5 48 L50 74 L47.5 48 L22 45 L47.5 42 Z" fill="#EF4444" />
            <path d="M50 45 L64 31 L52.5 42.5 L64 59 L50 45 L36 59 L47.5 42.5 L36 31 Z" fill="#F87171" />
            <circle cx="50" cy="45" r="19" fill="#1E3A8A" stroke="#FFFFFF" strokeWidth="2.5" />
            <circle cx="50" cy="45" r="13.5" fill="#10B981" />
            <path d="M41 40 C43 35, 48 37, 50 35 C52 33, 56 35, 59 33 C61 38, 59 42, 57 44 C53 45, 49 47, 45 46 Z" fill="#3B82F6" />
            <path d="M43 50 C46 49, 49 50, 52 48 C55 46, 58 48, 60 50 C58 53, 52 54, 48 53 Z" fill="#3B82F6" />
          </svg>
        </div>
        <div className="text-left text-white drop-shadow-md">
          <h2 className="text-xs md:text-sm font-extrabold tracking-tight leading-tight text-white">
            PES Institute of Technology & Management
          </h2>
          <p className="text-xs text-sky-200 font-extrabold tracking-wide mt-0.5 italic">
            "Education for the Real World"
          </p>
          <p className="text-[10px] text-slate-100 font-bold tracking-wide mt-0.5">
            NH-206, Sagar Road, Shivamogga - 577204
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-6">

        {/* Left Side */}
        <div className="hidden lg:flex lg:col-span-7 flex-col justify-center text-white space-y-8 pr-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-lg leading-tight text-white">
              Create Account<br />
              <span className="text-sky-200">Join Smart Lab</span>
            </h1>
            <p className="text-sm text-slate-100 max-w-md font-bold drop-shadow-sm">
              Register to access your personalized dashboard. Manage, learn and grow with ease.
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-4 max-w-md">
            <div className={`flex gap-4 p-4 rounded-2xl border shadow-md transition-all duration-300 ${step === 1 ? 'bg-white/90 border-slate-200' : 'bg-white/60 border-slate-100'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border font-bold text-sm ${step === 1 ? 'bg-blue-600 text-white border-blue-600' : step > 1 ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                {step > 1 ? <CheckCircle2 size={20} /> : '1'}
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">Fill Your Details</h3>
                <p className="text-xs text-slate-600 mt-1">Enter your name, email, and role-specific information.</p>
              </div>
            </div>
            <div className={`flex gap-4 p-4 rounded-2xl border shadow-md transition-all duration-300 ${step === 2 ? 'bg-white/90 border-slate-200' : 'bg-white/60 border-slate-100'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border font-bold text-sm ${step === 2 ? 'bg-blue-600 text-white border-blue-600' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                2
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">Verify Email</h3>
                <p className="text-xs text-slate-600 mt-1">Enter the 6-digit code sent to your email address.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Signup Card */}
        <div className="col-span-1 lg:col-span-5 flex flex-col items-center lg:items-end justify-center w-full">
          <div className="w-full max-w-md space-y-6">

            {/* Role Selector Tabs (Unified layout) */}
            {step === 1 && (
              <div className="grid grid-cols-3 gap-2 bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-sm p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg">
                <button
                  type="button"
                  onClick={() => setActiveRole('student')}
                  className={`py-3 px-1 rounded-xl flex flex-col items-center justify-center font-bold border-2 cursor-pointer tab-btn-effect ${
                    activeRole === 'student'
                      ? 'bg-white dark:bg-slate-800 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-md scale-102'
                      : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <GraduationCap size={18} className="mb-1" />
                  <span className="text-[10px] tracking-wider uppercase">Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRole('faculty')}
                  className={`py-3 px-1 rounded-xl flex flex-col items-center justify-center font-bold border-2 cursor-pointer tab-btn-effect ${
                    activeRole === 'faculty'
                      ? 'bg-white dark:bg-slate-800 border-purple-500 text-purple-600 dark:text-purple-400 shadow-md scale-102'
                      : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <BookOpen size={18} className="mb-1" />
                  <span className="text-[10px] tracking-wider uppercase">Faculty</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRole('hod')}
                  className={`py-3 px-1 rounded-xl flex flex-col items-center justify-center font-bold border-2 cursor-pointer tab-btn-effect ${
                    activeRole === 'hod'
                      ? 'bg-white dark:bg-slate-800 border-blue-500 text-blue-600 dark:text-blue-400 shadow-md scale-102'
                      : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <Shield size={18} className="mb-1" />
                  <span className="text-[10px] tracking-wider uppercase">HOD</span>
                </button>
              </div>
            )}

            {/* Main Signup Card */}
            <div className="glass p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl relative bg-white/95 dark:bg-slate-900/95">

              <div className="text-center mb-6">
                <div className={`w-14 h-14 mx-auto rounded-2xl grid place-items-center mb-3 shadow-md transition-all duration-350 ${currentRole.iconBg}`}>
                  {step === 2 ? <BadgeCheck size={24} /> : <CurrentIcon size={24} />}
                </div>
                <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white transition-all duration-350">
                  {step === 2 ? 'Verify Your Email' : currentRole.title}
                </h1>
                <p className="text-xs text-slate-550 dark:text-slate-400 mt-1 transition-all duration-350">
                  {step === 2 ? `Enter the 6-digit code sent to ${pendingEmail}` : currentRole.subtitle}
                </p>
              </div>

              {step === 1 ? (
                <>
                  <form onSubmit={handleSignup} className="space-y-3.5">
                    {/* Full Name */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                          <User size={14} />
                        </span>
                        <input
                          type="text" required placeholder="Enter your full name"
                          className={`input pl-10 bg-slate-50/50 dark:bg-slate-850/50 border-slate-200 dark:border-slate-850 transition-all ${currentRole.ringColor}`}
                          value={fullName} onChange={e => setFullName(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                          <Mail size={14} />
                        </span>
                        <input
                          type="email" required placeholder="name@example.com"
                          className={`input pl-10 bg-slate-50/50 dark:bg-slate-850/50 border-slate-200 dark:border-slate-850 transition-all ${currentRole.ringColor}`}
                          value={email} onChange={e => setEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Department */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Department</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                          <BookOpen size={14} />
                        </span>
                        <select
                          required
                          className={`input pl-10 bg-slate-50/50 dark:bg-slate-850/50 border-slate-200 dark:border-slate-850 transition-all ${currentRole.ringColor}`}
                          value={department}
                          onChange={e => setDepartment(e.target.value)}
                        >
                          <option value="">-- Select Department --</option>
                          <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                          <option value="Information Science & Engineering">Information Science & Engineering</option>
                          <option value="Computer Engineering">Computer Engineering</option>
                          <option value="Artificial Intelligence & Machine Learning">Artificial Intelligence & Machine Learning</option>
                          <option value="Computer Science & Design">Computer Science & Design</option>
                          <option value="Computer Science & Data Science">Computer Science & Data Science</option>
                        </select>
                      </div>
                    </div>

                    {/* USN - Student only */}
                    {activeRole === 'student' && (
                      <>
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                              USN (University Seat Number)
                            </label>
                            <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                              College Code: 4PM
                            </span>
                          </div>
                          <div className="relative flex items-center">
                            <div className="absolute left-0 inset-y-0 pl-3.5 flex items-center pointer-events-none z-10 text-slate-400">
                              <Hash size={14} />
                            </div>
                            <div className="absolute left-9 inset-y-1 my-auto flex items-center px-2 bg-emerald-600 text-white font-mono font-extrabold text-xs rounded-lg shadow-sm z-10 select-none">
                              4PM
                            </div>
                            <input
                              type="text"
                              required
                              maxLength={10}
                              placeholder="22CS001"
                              className={`input pl-[4.5rem] bg-slate-50/50 dark:bg-slate-850/50 border-slate-200 dark:border-slate-850 font-mono font-semibold tracking-wider transition-all ${currentRole.ringColor}`}
                              value={usn.startsWith('4PM') ? usn.slice(3) : usn}
                              onChange={handleUsnInputChange}
                            />
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 font-mono">
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Format:</span> 4PM + YY (Year) + Branch (CS/IS/AI) + Roll (001)
                          </p>
                          {usn && (
                            <div className="mt-1.5 text-[11px] font-mono bg-emerald-50/80 dark:bg-emerald-950/40 p-2 rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-slate-700 dark:text-slate-200 flex justify-between items-center shadow-xs">
                              <span className="text-slate-500 dark:text-slate-400">Full USN:</span>
                              <span className="font-extrabold text-emerald-600 dark:text-emerald-400 tracking-wider text-xs">{usn}</span>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Semester</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                              <Hash size={14} />
                            </span>
                            <select
                              required
                              className={`input pl-10 bg-slate-50/50 dark:bg-slate-850/50 border-slate-200 dark:border-slate-850 transition-all ${currentRole.ringColor}`}
                              value={semester}
                              onChange={e => setSemester(e.target.value)}
                            >
                              <option value="">-- Select Semester --</option>
                              {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                <option key={sem} value={sem}>{sem} Semester</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                            VTU Syllabus Scheme
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                              <BookOpen size={14} />
                            </span>
                            <select
                              required
                              className={`input pl-10 bg-slate-50/50 dark:bg-slate-850/50 border-slate-200 dark:border-slate-850 transition-all ${currentRole.ringColor}`}
                              value={scheme}
                              onChange={e => setScheme(e.target.value)}
                            >
                              <option value="2022 Scheme">2022 Scheme (VTU CBCS)</option>
                              <option value="2021 Scheme">2021 Scheme (VTU CBCS)</option>
                              <option value="2025 Scheme">2025 Scheme (VTU NEP/CBCS)</option>
                            </select>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Employee Code & Assigned Subject - Faculty only */}
                    {activeRole === 'faculty' && (
                      <>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Employee Code</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                              <Hash size={14} />
                            </span>
                            <input
                              type="text" required placeholder="e.g. FAC002"
                              className={`input pl-10 bg-slate-50/50 dark:bg-slate-850/50 border-slate-200 dark:border-slate-850 transition-all ${currentRole.ringColor}`}
                              value={empCode} onChange={e => setEmpCode(e.target.value.toUpperCase())}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                            VTU Syllabus Scheme
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                              <BookOpen size={14} />
                            </span>
                            <select
                              required
                              className={`input pl-10 bg-slate-50/50 dark:bg-slate-850/50 border-slate-200 dark:border-slate-850 transition-all ${currentRole.ringColor}`}
                              value={scheme}
                              onChange={e => setScheme(e.target.value)}
                            >
                              <option value="2022 Scheme">2022 Scheme (VTU CBCS)</option>
                              <option value="2021 Scheme">2021 Scheme (VTU CBCS)</option>
                              <option value="2025 Scheme">2025 Scheme (VTU NEP/CBCS)</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                            Assigned Subject
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                              <GraduationCap size={14} />
                            </span>
                            <select
                              required
                              className={`input pl-10 bg-slate-50/50 dark:bg-slate-850/50 border-slate-200 dark:border-slate-850 transition-all ${currentRole.ringColor}`}
                              value={subject}
                              onChange={e => setSubject(e.target.value)}
                            >
                              <option value="ADA">ADA (Analysis & Design of Algorithms)</option>
                              <option value="DBMS">DBMS (Database Management Systems)</option>
                              <option value="LATEX">LATEX (LaTeX Document Formatting)</option>
                              <option value="MONGODB">MONGODB (NoSQL Document Database)</option>
                              <option value="AI">AI (Artificial Intelligence)</option>
                              <option value="JAVA">JAVA (Java Programming)</option>
                              <option value="PYTHON">PYTHON (Python Scripting)</option>
                              <option value="OPERATING SYSTEMS">OPERATING SYSTEMS (OS Core Concepts)</option>
                            </select>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Password */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                          <Lock size={14} />
                        </span>
                        <input
                          type="password" required minLength={6} placeholder="Min 6 characters"
                          className={`input pl-10 bg-slate-50/50 dark:bg-slate-850/50 border-slate-200 dark:border-slate-850 transition-all ${currentRole.ringColor}`}
                          value={password} onChange={e => setPassword(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Confirm Password</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                          <Lock size={14} />
                        </span>
                        <input
                          type="password" required minLength={6} placeholder="Re-enter password"
                          className={`input pl-10 bg-slate-50/50 dark:bg-slate-850/50 border-slate-200 dark:border-slate-850 transition-all ${currentRole.ringColor}`}
                          value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className={`btn-primary btn-glow-effect w-full text-white font-bold py-3 rounded-xl transition duration-300 cursor-pointer border-0 flex items-center justify-center gap-1.5 ${currentRole.btnBg}`}
                    >
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                  </form>
                </>
              ) : (
                /* Step 2: OTP Verification */
                <form onSubmit={handleVerifyOtp} className="space-y-4">

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Verification Code</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                        <BadgeCheck size={14} />
                      </span>
                      <input
                        type="text" required maxLength={6} placeholder="Enter 6-digit code"
                        className={`input pl-10 bg-slate-50/50 dark:bg-slate-850/50 border-slate-200 dark:border-slate-850 transition-all text-center text-lg font-mono font-bold tracking-[0.5em] ${currentRole.ringColor}`}
                        value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length < 6}
                    className={`btn-primary btn-glow-effect w-full text-white font-bold py-3 rounded-xl transition duration-300 cursor-pointer border-0 flex items-center justify-center gap-1.5 ${currentRole.btnBg}`}
                  >
                    {loading ? 'Verifying...' : 'Verify & Continue'}
                  </button>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={resendTimer > 0 || resendCount >= 3 || resending}
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline disabled:text-slate-400 dark:disabled:text-slate-600 disabled:no-underline flex items-center gap-1.5 bg-transparent border-0 cursor-pointer"
                    >
                      <RotateCw size={13} className={resending ? 'animate-spin' : ''} />
                      {resending ? 'Sending...' : resendCount >= 3 ? 'Max resends reached (3/3)' : resendTimer > 0 ? `Resend in ${resendTimer}s` : `Resend Code ${resendCount > 0 ? `(${resendCount}/3)` : ''}`}
                    </button>

                    <button
                      type="button"
                      onClick={() => { setStep(1); setOtp(''); setResendCount(0); }}
                      className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1 bg-transparent border-0 cursor-pointer"
                    >
                      <ArrowLeft size={12} /> Back to signup
                    </button>
                  </div>
                </form>
              )}

              {/* Already have an account? */}
              <div className="text-center mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-450 dark:text-slate-500">Already have an account? </span>
                <Link to="/login" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>



    </div>
  );
}
