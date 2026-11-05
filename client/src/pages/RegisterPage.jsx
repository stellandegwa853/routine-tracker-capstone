import React, { useState } from 'react';
import { User, Mail, Lock, Hash, BookOpen, AlertCircle, UserPlus, ArrowLeft } from 'lucide-react';
import { supabase } from '../supabaseClient';
import bcrypt from 'bcryptjs';

export default function RegisterPage({ onNavigateToLogin, onRegisterSuccess }) {
  const [formData, setFormData] = useState({
    fullName: '',
    studentId: '',
    email: '',
    degreeProgram: 'Software Engineering',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      // 1. Generate salt and hash the password (cost factor: 10)
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(formData.password, salt);

      // 2. Insert into users table with encrypted hash
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert([
          {
            full_name: formData.fullName.trim(),
            student_id: formData.studentId.trim(),
            email: formData.email.trim().toLowerCase(),
            password_hash: hashedPassword, // Stored securely as $2a$10$...
            role: 'STUDENT',
            account_status: 'Active'
          }
        ])
        .select()
        .single();

      if (userError) {
        if (userError.code === '23505') {
          throw new Error('An account with this email or Student ID already exists.');
        }
        throw userError;
      }

      // 3. Insert corresponding 1-to-1 profile in student_profiles
      const { error: profileError } = await supabase
        .from('student_profiles')
        .insert([
          {
            user_id: newUser.user_id,
            degree_program: formData.degreeProgram,
            academic_year: 4,
            target_sleep_hours: 8.0
          }
        ]);

      if (profileError) throw profileError;

      // Pass user session to App state
      onRegisterSuccess({
        userId: newUser.user_id,
        fullName: newUser.full_name,
        studentId: newUser.student_id,
        email: newUser.email,
        role: newUser.role,
        degreeProgram: formData.degreeProgram
      });

    } catch (err) {
      console.error('Registration error:', err);
      setErrorMessage(err.message || 'Failed to complete registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        
        <button 
          onClick={onNavigateToLogin}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition cursor-pointer mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
        </button>

        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Create Student Account</h1>
          <p className="text-xs text-slate-400 mt-1">
            Register your profile to track well-being metrics at USIU-Africa.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-300 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                required
                placeholder="Stella Ndegwa"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1">Student ID</label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="669749"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Degree Program</label>
              <div className="relative">
                <BookOpen className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
                <select
                  value={formData.degreeProgram}
                  onChange={(e) => setFormData({ ...formData, degreeProgram: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-2 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Applied Computer Technology">Applied Computer Tech</option>
                  <option value="Information Systems Technology">IST</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1">USIU Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="email"
                required
                placeholder="s.ndegwa@usiu.ac.ke"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <div className="pt-3 border-t border-slate-800/80 text-center text-slate-400">
          Already registered?{' '}
          <button 
            onClick={onNavigateToLogin}
            className="text-indigo-400 hover:underline font-semibold cursor-pointer"
          >
            Sign In here
          </button>
        </div>

      </div>
    </div>
  );
}