import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Lock, ShieldAlert } from 'lucide-react';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Reset token is missing from the URL.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset', { token, password });
      toast.success('Password updated successfully! Please sign in.');
      nav('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="glass p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto rounded-2xl grid place-items-center mb-3 shadow-md bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <Lock size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">Choose New Password</h1>
            <p className="text-xs text-slate-550 dark:text-slate-400 mt-1">Please enter your new secure password below.</p>
          </div>

          {!token ? (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-450 rounded-2xl flex items-start gap-3 text-xs mb-4">
              <ShieldAlert size={18} className="shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">Invalid Reset Link</span>
                The password reset link is invalid or has expired. Please request a new link.
              </div>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">New Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <Lock size={14} />
                  </span>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    className="input pl-10 bg-slate-50/50 dark:bg-slate-850/50 border-slate-200 dark:border-slate-850 transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Confirm Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <Lock size={14} />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="input pl-10 bg-slate-50/50 dark:bg-slate-850/50 border-slate-200 dark:border-slate-850 transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full text-white font-bold py-2.5 rounded-xl transition duration-300 cursor-pointer border-0 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
              >
                {loading ? 'Updating Password...' : 'Reset Password'}
              </button>
            </form>
          )}

          <div className="text-center mt-5">
            <a href="/login" className="text-xs font-bold text-slate-450 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300">
              Back to Sign In
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
