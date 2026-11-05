import React, { useState } from 'react';
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

export default function AdminDashboardPage({ adminUser, onLogout }) {
  // Mock data of registered students across USIU-Africa cohorts
  const [students, setStudents] = useState([
    {
      id: 1,
      fullName: 'Stella Ndegwa',
      studentId: '669749',
      email: 'stellahndegwah64@gmail.com',
      major: 'Software Engineering',
      status: 'Active',
      avgBri: 42.0,
      riskLevel: 'Low Risk',
      lastActive: 'Today'
    },
    {
      id: 2,
      fullName: 'Kevin Kiprono',
      studentId: '668102',
      email: 'k.kiprono@usiu.ac.ke',
      major: 'Applied Computer Technology',
      status: 'Active',
      avgBri: 76.5,
      riskLevel: 'High Strain',
      lastActive: 'Yesterday'
    },
    {
      id: 3,
      fullName: 'Brenda Wanjiru',
      studentId: '667520',
      email: 'b.wanjiru@usiu.ac.ke',
      major: 'Information Systems Technology',
      status: 'Flagged',
      avgBri: 84.0,
      riskLevel: 'High Strain',
      lastActive: '3 days ago'
    },
    {
      id: 4,
      fullName: 'David Ochieng',
      studentId: '669145',
      email: 'd.ochieng@usiu.ac.ke',
      major: 'Software Engineering',
      status: 'Active',
      avgBri: 55.0,
      riskLevel: 'Moderate',
      lastActive: 'Today'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMajor, setFilterMajor] = useState('All');
  const [adminNotification, setAdminNotification] = useState(null);

  // Compute aggregate statistics for institutional overview
  const totalStudents = students.length;
  const highStrainCount = students.filter(s => s.riskLevel === 'High Strain').length;
  const campusAvgBri = Math.round(
    students.reduce((acc, curr) => acc + curr.avgBri, 0) / totalStudents
  );

  // Toggle student status (Active / Flagged)
  const handleToggleStatus = (id) => {
    setStudents(students.map(student => {
      if (student.id === id) {
        const updatedStatus = student.status === 'Active' ? 'Flagged' : 'Active';
        setAdminNotification(`Student ${student.fullName} status updated to ${updatedStatus}.`);
        return { ...student, status: updatedStatus };
      }
      return student;
    }));
  };

  // Delete student user
  const handleDeleteUser = (id, name) => {
    if (window.confirm(`Are you sure you want to permanently delete user record for ${name}?`)) {
      setStudents(students.filter(s => s.id !== id));
      setAdminNotification(`Student record for ${name} has been removed from database.`);
    }
  };

  // Filter students based on search query and major
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.includes(searchQuery) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    
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
              Administrator: {adminUser?.name || 'Academic Affairs / Counseling Center'}
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

        {/* 1. Campus-Level Analytics Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Total Registered Students</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="mt-3 text-3xl font-extrabold text-white">{totalStudents}</div>
            <p className="text-[11px] text-slate-500 mt-1">Across 3 academic disciplines</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Campus Mean BRI Score</span>
              <Activity className="w-4 h-4 text-sky-400" />
            </div>
            <div className="mt-3 text-3xl font-extrabold text-white">{campusAvgBri} <span className="text-xs font-normal text-slate-500">/ 100</span></div>
            <p className="text-[11px] text-emerald-400 mt-1">Moderate university baseline</p>
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
                {filteredStudents.length === 0 ? (
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
                          <span className="font-mono font-bold text-slate-200">{student.avgBri}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                            student.riskLevel === 'High Strain' 
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : student.riskLevel === 'Moderate'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
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
                          onClick={() => handleToggleStatus(student.id)}
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
                          onClick={() => handleDeleteUser(student.id, student.fullName)}
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