import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Shield, BookOpen, GraduationCap, Lock, Mail, BarChart3, Users, X } from 'lucide-react';

export default function Login() {
  const { user, setUser, loading } = useAuth();
  const [activeRole, setActiveRole] = useState('hod'); // 'hod', 'faculty', 'student'
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const nav = useNavigate();

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);


  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    try {
      const { data } = await api.post('/auth/forgot', { email: forgotEmail });
      if (data.resetLink) {
        // Dev mode: SMTP not configured, redirect to reset page directly
        toast.success('Redirecting to password reset page...');
        setShowForgotModal(false);
        setForgotEmail('');
        // Extract the path from the full URL and navigate
        const url = new URL(data.resetLink);
        nav(url.pathname + url.search);
      } else {
        toast.success(data.message || 'Password reset link sent to your email.');
        setShowForgotModal(false);
        setForgotEmail('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset link.');
    } finally {
      setForgotLoading(false);
    }
  };

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      toast.success('Welcome back!');
      nav('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setAuthLoading(false);
    }
  };

  // Dynamic style mappings
  const roles = {
    hod: {
      title: 'HOD Login',
      subtitle: 'Sign in to access HOD administration dashboard',
      accentColor: 'blue',
      btnBg: 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20',
      ringColor: 'focus:ring-blue-500 focus:border-blue-500',
      icon: Shield,
      iconBg: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
      tabBorder: 'border-blue-500 text-blue-500 bg-blue-500/5'
    },
    faculty: {
      title: 'Faculty Login',
      subtitle: 'Sign in to access Faculty dashboard',
      accentColor: 'purple',
      btnBg: 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/20',
      ringColor: 'focus:ring-purple-500 focus:border-purple-500',
      icon: BookOpen,
      iconBg: 'bg-purple-500/10 text-purple-500 border border-purple-500/20',
      tabBorder: 'border-purple-500 text-purple-500 bg-purple-500/5'
    },
    student: {
      title: 'Student Login',
      subtitle: 'Sign in to access Student dashboard',
      accentColor: 'emerald',
      btnBg: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20',
      ringColor: 'focus:ring-emerald-500 focus:border-emerald-500',
      icon: GraduationCap,
      iconBg: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
      tabBorder: 'border-emerald-500 text-emerald-500 bg-emerald-500/5'
    }
  };

  const currentRole = roles[activeRole];
  const CurrentIcon = currentRole.icon;

  return (
    <div className="min-h-screen flex flex-col justify-between p-6 md:p-12 relative overflow-hidden login-bg-container">
      <style>{`
        .login-bg-container {
          background-image: url('/college_bg.jpg');
          background-repeat: no-repeat;
          background-position: center center;
          background-size: cover;
        }
      `}</style>
      
      {/* Light overlay to preserve natural brightness and ensure text readability */}
      <div className="absolute inset-0 bg-black/15 pointer-events-none"></div>

      {/* Header (Top bar) */}
      <div className="relative z-10 flex items-center gap-3 self-start">
        {/* Compass Logo SVG */}
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

      {/* Main Content Split Area */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-6">
        
        {/* Left Side Content - Features and Greetings (Hidden on mobile/tablet, shown on large screens) */}
        <div className="hidden lg:flex lg:col-span-7 flex-col justify-center text-white space-y-8 pr-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-lg leading-tight text-white">
              Welcome Back!<br />
              <span className="text-sky-200">Let's get started</span>
            </h1>
            <p className="text-sm text-slate-100 max-w-md font-bold drop-shadow-sm">
              Secure access to your dashboard. Manage, learn and grow with ease.
            </p>
          </div>

          {/* Features Checklist */}
          <div className="space-y-4 max-w-md">
            
            {/* Feature 1 */}
            <div className="flex gap-4 p-4 rounded-2xl bg-white/80 border border-slate-100 shadow-md">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 text-blue-600">
                <Shield size={20} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">Secure & Reliable</h3>
                <p className="text-xs text-slate-600 mt-1">Your data is protected with enterprise-grade security.</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex gap-4 p-4 rounded-2xl bg-white/80 border border-slate-100 shadow-md">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 text-blue-600">
                <BarChart3 size={20} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">Smart & Efficient</h3>
                <p className="text-xs text-slate-600 mt-1">Powerful tools to manage academics effortlessly.</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex gap-4 p-4 rounded-2xl bg-white/80 border border-slate-100 shadow-md">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 text-blue-600">
                <Users size={20} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">Connected Campus</h3>
                <p className="text-xs text-slate-600 mt-1">Bridging students, faculty and management.</p>
              </div>
            </div>

          </div>
        </div>

        {/* Right Side Content - Login Card Area */}
        <div className="col-span-1 lg:col-span-5 flex flex-col items-center lg:items-end justify-center w-full">
          <div className="w-full max-w-md space-y-6">
            
            {/* Role Selector Tabs (Unified layout) */}
            <div className="grid grid-cols-3 gap-2 bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-sm p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg">
              <button
                type="button"
                onClick={() => setActiveRole('hod')}
                className={`py-3 px-1 rounded-xl flex flex-col items-center justify-center transition-all duration-300 font-bold border-2 cursor-pointer ${
                  activeRole === 'hod'
                    ? 'bg-white dark:bg-slate-800 border-blue-500 text-blue-600 dark:text-blue-400 shadow-md'
                    : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Shield size={18} className="mb-1" />
                <span className="text-[10px] tracking-wider uppercase">HOD</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveRole('faculty')}
                className={`py-3 px-1 rounded-xl flex flex-col items-center justify-center transition-all duration-300 font-bold border-2 cursor-pointer ${
                  activeRole === 'faculty'
                    ? 'bg-white dark:bg-slate-800 border-purple-500 text-purple-600 dark:text-purple-400 shadow-md'
                    : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <BookOpen size={18} className="mb-1" />
                <span className="text-[10px] tracking-wider uppercase">Faculty</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveRole('student')}
                className={`py-3 px-1 rounded-xl flex flex-col items-center justify-center transition-all duration-300 font-bold border-2 cursor-pointer ${
                  activeRole === 'student'
                    ? 'bg-white dark:bg-slate-800 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-md'
                    : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <GraduationCap size={18} className="mb-1" />
                <span className="text-[10px] tracking-wider uppercase">Student</span>
              </button>
            </div>

            {/* Main Login Card */}
            <div className="glass p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl relative bg-white/95 dark:bg-slate-900/95">
              
              <div className="text-center mb-6">
                <div className={`w-14 h-14 mx-auto rounded-2xl grid place-items-center mb-3 shadow-md transition-all duration-350 ${currentRole.iconBg}`}>
                  <CurrentIcon size={24} />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white transition-all duration-350">{currentRole.title}</h1>
                <p className="text-xs text-slate-550 dark:text-slate-400 mt-1 transition-all duration-350">{currentRole.subtitle}</p>
              </div>
              
              <form onSubmit={submit} className="space-y-4" autoComplete="off">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                    {activeRole === 'student' ? 'Email Address or USN' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                      <Mail size={14} />
                    </span>
                    <input 
                      type={activeRole === 'student' ? 'text' : 'email'} 
                      required 
                      autoComplete="off"
                      className={`input pl-10 bg-slate-50/50 dark:bg-slate-850/50 border-slate-200 dark:border-slate-850 transition-all ${currentRole.ringColor}`} 
                      value={email} 
                      onChange={e=>setEmail(e.target.value)} 
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Password</label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className={`text-[10px] font-bold hover:underline bg-transparent border-0 cursor-pointer text-${currentRole.accentColor}-600 dark:text-${currentRole.accentColor}-400`}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                      <Lock size={14} />
                    </span>
                    <input 
                      type="password" 
                      required 
                      autoComplete="new-password"
                      className={`input pl-10 bg-slate-50/50 dark:bg-slate-850/50 border-slate-200 dark:border-slate-850 transition-all ${currentRole.ringColor}`} 
                      value={password} 
                      onChange={e=>setPassword(e.target.value)} 
                    />
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  disabled={authLoading || loading} 
                  className={`btn-primary w-full text-white font-bold py-2.5 rounded-xl transition duration-300 cursor-pointer border-0 flex items-center justify-center gap-1.5 ${currentRole.btnBg}`}
                >
                  {authLoading || loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              {/* Sign Up Link */}
              <div className="text-center mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-450 dark:text-slate-500">Don't have an account? </span>
                <a href="/signup" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                  Sign Up
                </a>
              </div>
              
            </div>
          </div>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Reset Password</h3>
            <p className="text-xs text-slate-550 dark:text-slate-400 mb-4">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <Mail size={14} />
                  </span>
                  <input 
                    type="email" 
                    required 
                    placeholder="name@example.com"
                    className="input pl-10 bg-slate-50/50 dark:bg-slate-850/50 border-slate-200 dark:border-slate-850 transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full" 
                    value={forgotEmail} 
                    onChange={e => setForgotEmail(e.target.value)} 
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-transparent border-0 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl border-0 shadow cursor-pointer transition duration-300"
                >
                  {forgotLoading ? 'Sending...' : 'Send Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
