import React, { useCallback, useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Activity, 
  Trash2, 
  UserCheck, 
  UserX, 
  AlertTriangle, 
  LogOut, 
  Search, 
  Filter, 
  BarChart3, 
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { computeBri } from '../utils/bri';

const DAY_MS = 24 * 60 * 60 * 1000;

const describeLastActive = (logDate) => {
  if (!logDate) return 'No check-ins yet';
  const days = Math.round((new Date().setHours(0, 0, 0, 0) - new Date(`${logDate}T00:00:00`)) / DAY_MS);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
};

export default function AdminDashboardPage({ adminUser, onLogout }) {
  // Students are loaded from Supabase. Row Level Security only returns them to admins.
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMajor, setFilterMajor] = useState('All');
  const [adminNotification, setAdminNotification] = useState(null);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * DAY_MS).toISOString().slice(0, 10);

      const [usersResult, profilesResult, logsResult] = await Promise.all([
        supabase
          .from('users')
          .select('user_id, full_name, student_id, email, role, account_status')
          .neq('role', 'ADMIN')
          .order('full_name'),
        supabase.from('student_profiles').select('user_id, degree_program'),
        supabase
          .from('daily_routine_logs')
          .select('user_id, log_date, sleep_hours, stress_level, hydration_ml, study_hours')
          .order('log_date', { ascending: false })
      ]);

      for (const result of [usersResult, profilesResult, logsResult]) {
        if (result.error) throw result.error;
      }

      const programByUser = new Map(profilesResult.data.map((p) => [p.user_id, p.degree_program]));
      const logsByUser = new Map();
      for (const log of logsResult.data) {
        if (!logsByUser.has(log.user_id)) logsByUser.set(log.user_id, []);
        logsByUser.get(log.user_id).push(log);
      }

      setStudents(usersResult.data
        .filter((u) => (u.role || '').toUpperCase() !== 'ADMIN')
        .map((u) => {
          const userLogs = logsByUser.get(u.user_id) || [];
          const recentLogs = userLogs.filter((log) => log.log_date >= sevenDaysAgo);
          const bri = recentLogs.length ? computeBri(recentLogs) : null;
          return {
            id: u.user_id,
            fullName: u.full_name,
            studentId: u.student_id || '-',
            email: u.email,
            major: programByUser.get(u.user_id) || 'Not set',
            status: u.account_status,
            avgBri: bri ? bri.score : null,
            riskLevel: bri ? bri.label : 'No recent data',
            lastActive: describeLastActive(userLogs[0]?.log_date)
          };
        }));
    } catch (err) {
      console.error('Failed to load students:', err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Compute aggregate statistics for institutional overview
  const totalStudents = students.length;
  const highStrainCount = students.filter(s => s.riskLevel === 'High Strain').length;
  const scoredStudents = students.filter(s => s.avgBri !== null);
  const campusAvgBri = scoredStudents.length
    ? Math.round(scoredStudents.reduce((acc, curr) => acc + curr.avgBri, 0) / scoredStudents.length)
    : '-';
  const programCount = new Set(students.map(s => s.major)).size;

  // Toggle student status (Active / Flagged). Flagged students can't sign in.
  const handleToggleStatus = async (student) => {
    const updatedStatus = student.status === 'Active' ? 'Flagged' : 'Active';
    setErrorMsg(null);
    const { data, error } = await supabase
      .from('users')
      .update({ account_status: updatedStatus })
      .eq('user_id', student.id)
      .select('user_id');

    if (error || !data?.length) {
      setErrorMsg(error?.message || 'Status was not changed. Check that your account has admin rights.');
      return;
    }
    setStudents(prev => prev.map(s => (s.id === student.id ? { ...s, status: updatedStatus } : s)));
    setAdminNotification(`Student ${student.fullName} status updated to ${updatedStatus}.`);
  };

  // Delete student: removes their logs, profile, user record and login account.
  const handleDeleteUser = async (student) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${student.fullName} and all of their records?`)) return;
    setErrorMsg(null);
    const { error } = await supabase.rpc('admin_delete_student', { target_email: student.email });
    if (error) {
      setErrorMsg(error.message);
      return;
    }
    setStudents(prev => prev.filter(s => s.id !== student.id));
    setAdminNotification(`Student record for ${student.fullName} has been removed from database.`);
  };

  // Filter students based on search query and major
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      (student.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.includes(searchQuery) ||
      (student.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesMajor = filterMajor === 'All' || student.major === filterMajor;
    return matchesSearch && matchesMajor;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Top Admin Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base text-white">RoutineTrack Administrative Console</h1>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                Staff Authority
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Administrator: {adminUser?.fullName || 'Academic Affairs / Counseling Center'}
            </p>
          </div>
        </div>

        <button 
          onClick={onLogout}
          className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition flex items-center gap-1.5 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto w-full p-6 space-y-6 flex-1">
        
        {/* Action / Notification Banner */}
        {adminNotification && (
          <div className="p-3.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>{adminNotification}</span>
            </div>
            <button 
              onClick={() => setAdminNotification(null)}
              className="text-slate-400 hover:text-white text-xs underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. Campus-Level Analytics Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Total Registered Students</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="mt-3 text-3xl font-extrabold text-white">{totalStudents}</div>
            <p className="text-[11px] text-slate-500 mt-1">Across {programCount} degree programs</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Campus Mean BRI Score</span>
              <Activity className="w-4 h-4 text-sky-400" />
            </div>
            <div className="mt-3 text-3xl font-extrabold text-white">{campusAvgBri} <span className="text-xs font-normal text-slate-500">/ 100</span></div>
            <p className="text-[11px] text-emerald-400 mt-1">Students with check-ins in the last 7 days</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>High Strain Cohort Alerts</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="mt-3 text-3xl font-extrabold text-rose-400">{highStrainCount}</div>
            <p className="text-[11px] text-rose-400/80 mt-1">Eligible for peer wellness outreach</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Semester Review Cycle</span>
              <Calendar className="w-4 h-4 text-violet-400" />
            </div>
            <div className="mt-3 text-xl font-bold text-white">Fall Term 2026</div>
            <p className="text-[11px] text-slate-500 mt-1">Continuous Assessment Phase</p>
          </div>
        </div>

        {/* 2. Search, Filter, and Controls */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
            <input 
              type="text"
              placeholder="Search by student name, ID, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Filter className="w-3.5 h-3.5" />
              <span>Program:</span>
            </div>
            <select
              value={filterMajor}
              onChange={(e) => setFilterMajor(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Degree Programs</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Applied Computer Technology">Applied Computer Technology</option>
              <option value="Information Systems Technology">Information Systems Technology</option>
            </select>
          </div>
        </div>

        {/* 3. Student User Management Table (CRUD Demonstration) */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-white">Registered Student Accounts</h2>
              <p className="text-[11px] text-slate-400">Manage user access rights, review longitudinal strain, and perform account maintenance.</p>
            </div>
            <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
              {filteredStudents.length} Students Displayed
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] bg-slate-950/40">
                  <th className="py-3 px-4">Student Details</th>
                  <th className="py-3 px-4">ID Number</th>
                  <th className="py-3 px-4">Degree Major</th>
                  <th className="py-3 px-4">7-Day Mean BRI</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">Last Check-In</th>
                  <th className="py-3 px-4 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-slate-500 text-xs">
                      Loading student accounts...
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-slate-500 text-xs">
                      No matching student accounts found.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-850/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{student.fullName}</div>
                        <div className="text-[11px] text-slate-400">{student.email}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">{student.studentId}</td>
                      <td className="py-3.5 px-4 text-slate-300">{student.major}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-200">{student.avgBri ?? '-'}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                            student.riskLevel === 'High Strain' 
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : student.riskLevel === 'Sustainable Balance'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : student.riskLevel === 'Low Risk'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>
                            {student.riskLevel}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                          student.status === 'Active' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{student.lastActive}</td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {/* Status Toggle Button */}
                        <button
                          onClick={() => handleToggleStatus(student)}
                          className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
                            student.status === 'Active'
                              ? 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
                              : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                          }`}
                          title={student.status === 'Active' ? 'Flag Account for Follow-up' : 'Reactivate Account'}
                        >
                          {student.status === 'Active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>
                        
                        {/* Delete User Button */}
                        <button
                          onClick={() => handleDeleteUser(student)}
                          className="p-1.5 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                          title="Delete User Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/30 text-[11px] text-slate-500 flex justify-between items-center">
            <span>Meeting 3 Deliverable: Admin Role Governance & User Record Management active.</span>
            <span className="text-emerald-400 font-mono">Role: SUPER_ADMIN</span>
          </div>
        </div>

      </main>
    </div>
  );
}