import React, { useState } from 'react';
import { Mail, Lock, LogIn, AlertCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '../supabaseClient';
import bcrypt from 'bcryptjs';

export default function LoginPage({ onNavigateToRegister, onNavigateToLanding, onLoginSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      // 1. Direct route for default system administrator
      if (formData.email.trim().toLowerCase() === 'admin@usiu.ac.ke') {
        const { data: adminData } = await supabase
          .from('users')
          .select('*')
          .eq('email', 'admin@usiu.ac.ke')
          .maybeSingle();

        if (adminData) {
          const isAdminMatch = adminData.password_hash.startsWith('$2')
            ? bcrypt.compareSync(formData.password, adminData.password_hash)
            : adminData.password_hash === formData.password;

          if (isAdminMatch) {
            onLoginSuccess({
              name: adminData.full_name,
              email: adminData.email,
              role: 'ADMIN'
            });
            return;
          }
        }
      }

      // 2. Query student user from Supabase users table
      const { data: user, error } = await supabase
        .from('users')
        .select('*, student_profiles(*)')
        .eq('email', formData.email.trim().toLowerCase())
        .maybeSingle();

      if (error) throw error;

      if (!user) {
        setErrorMessage('No student account found with this email address.');
        return;
      }

      if (user.account_status !== 'Active') {
        setErrorMessage('Account is suspended or flagged. Please contact Administration.');
        return;
      }

      // 3. Cryptographic hash comparison with fallback for legacy plain text seeds
      const isPasswordValid = user.password_hash.startsWith('$2')
        ? bcrypt.compareSync(formData.password, user.password_hash)
        : user.password_hash === formData.password;

      if (!isPasswordValid) {
        setErrorMessage('Incorrect password. Please verify your credentials.');
        return;
      }

      // Successful student login
      onLoginSuccess({
        userId: user.user_id,
        fullName: user.full_name,
        studentId: user.student_id,
        email: user.email,
        role: user.role,
        degreeProgram: user.student_profiles?.[0]?.degree_program || 'Software Engineering'
      });

    } catch (err) {
      console.error('Login error:', err);
      setErrorMessage(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        
        <button 
          onClick={onNavigateToLanding}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition cursor-pointer mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </button>

        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Sign in to RoutineTrack</h1>
          <p className="text-xs text-slate-400 mt-1">
            Access your longitudinal burnout index and daily micro-routines.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
              <input
                type="email"
                required
                placeholder="e.g. s.ndegwa@usiu.ac.ke"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <button 
            onClick={onNavigateToRegister}
            className="text-indigo-400 hover:underline font-semibold cursor-pointer"
          >
            Create account
          </button>
        </div>

      </div>
    </div>
  );
}