import React, { useState, useEffect, useCallback } from 'react';
import { 
  Activity, 
  Trash2, 
  Edit3, 
  LogOut, 
  Plus, 
  Check, 
  AlertCircle,
  User,
  Sparkles,
  AlertTriangle,
  Moon,
  Clock,
  Droplets,
  CheckCircle
} from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function DashboardPage({ studentUser, onLogout }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [resolvedUser, setResolvedUser] = useState(studentUser || null);

  // Form states
  const [editingId, setEditingId] = useState(null);
  const [formInput, setFormInput] = useState({
    date: new Date().toISOString().split('T')[0],
    sleep: 7.0,
    studyHours: 4.0,
    hydration: 2000,
    stress: 3,
    note: ''
  });

  // 1. Resolve user profile if identity object has missing fields
  useEffect(() => {
    const resolveCurrentUser = async () => {
      if (studentUser?.userId && studentUser?.fullName) {
        setResolvedUser(studentUser);
        return;
      }

      const emailLookup = studentUser?.email || 'stellahndegwah64@gmail.com';
      try {
        const { data, error } = await supabase
          .from('users')
          .select('user_id, full_name, student_id, email, role')
          .eq('email', emailLookup)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setResolvedUser({
            userId: data.user_id,
            fullName: data.full_name,
            studentId: data.student_id,
            email: data.email,
            role: data.role
          });
        }
      } catch (err) {
        console.error('Failed to resolve student identity:', err);
      }
    };

    resolveCurrentUser();
  }, [studentUser]);

  // 2. Fetch records strictly belonging to the logged-in student
  const fetchLogs = useCallback(async () => {
    const currentUserId = resolvedUser?.userId;
    if (!currentUserId) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase
        .from('daily_routine_logs')
        .select('*')
        .eq('user_id', currentUserId)
        .order('log_date', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error('Fetch error:', err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  }, [resolvedUser?.userId]);

  useEffect(() => {
    if (resolvedUser?.userId) {
      fetchLogs();
    }
  }, [resolvedUser?.userId, fetchLogs]);

  // 3. Add or Update Routine Record
  const handleSaveRecord = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    const targetUserId = resolvedUser?.userId;
    if (!targetUserId) {
      setErrorMsg('User session expired. Please log in again.');
      return;
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('daily_routine_logs')
          .update({
            sleep_hours: parseFloat(formInput.sleep),
            study_hours: parseFloat(formInput.studyHours),
            hydration_ml: parseInt(formInput.hydration, 10),
            stress_level: parseInt(formInput.stress, 10),
            context_tag: formInput.note
          })
          .eq('log_id', editingId)
          .eq('user_id', targetUserId);

        if (error) throw error;
        setEditingId(null);
      } else {
        const { error } = await supabase
          .from('daily_routine_logs')
          .insert([
            {
              user_id: targetUserId,
              log_date: formInput.date,
              sleep_hours: parseFloat(formInput.sleep),
              study_hours: parseFloat(formInput.studyHours),
              hydration_ml: parseInt(formInput.hydration, 10),
              stress_level: parseInt(formInput.stress, 10),
              context_tag: formInput.note || null
            }
          ]);

        if (error) throw error;
      }

      setFormInput({
        date: new Date().toISOString().split('T')[0],
        sleep: 7.0,
        studyHours: 4.0,
        hydration: 2000,
        stress: 3,
        note: ''
      });

      await fetchLogs();
    } catch (err) {
      console.error('Save error:', err);
      setErrorMsg(err.message);
    }
  };

  // 4. Delete Record
  const handleDeleteRecord = async (logId) => {
    if (!window.confirm('Delete this routine check-in?')) return;
    try {
      const { error } = await supabase
        .from('daily_routine_logs')
        .delete()
        .eq('log_id', logId)
        .eq('user_id', resolvedUser?.userId);

      if (error) throw error;
      await fetchLogs();
    } catch (err) {
      console.error('Delete error:', err);
      setErrorMsg(err.message);
    }
  };

  // 5. Populate form to edit
  const handleEditClick = (log) => {
    setEditingId(log.log_id);
    setFormInput({
      date: log.log_date,
      sleep: log.sleep_hours,
      studyHours: log.study_hours,
      hydration: log.hydration_ml,
      stress: log.stress_level,
      note: log.context_tag || ''
    });
  };

  // 6. Dynamic BRI & Metric Calculations
  const avgSleep = logs.length 
    ? (logs.reduce((acc, curr) => acc + Number(curr.sleep_hours), 0) / logs.length).toFixed(1) 
    : 7.0;
  const avgStress = logs.length 
    ? (logs.reduce((acc, curr) => acc + Number(curr.stress_level), 0) / logs.length).toFixed(1) 
    : 3.0;
  const avgHydration = logs.length
    ? Math.round(logs.reduce((acc, curr) => acc + Number(curr.hydration_ml), 0) / logs.length)
    : 2000;
  const avgStudy = logs.length
    ? (logs.reduce((acc, curr) => acc + Number(curr.study_hours), 0) / logs.length).toFixed(1)
    : 4.0;

  const briScore = Math.min(100, Math.max(10, Math.round((avgStress * 14) + (8 - avgSleep) * 7)));
  const statusLabel = briScore > 70 ? 'High Strain' : briScore > 45 ? 'Sustainable Balance' : 'Low Risk';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-8 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      <div className="max-w-7xl mx-auto w-full space-y-6">

        {/* Top Header with Student Identity */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <Activity className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm tracking-wide text-white">RoutineTrack</span>
                <span className="text-xs text-slate-500">| Student Portal</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-200 font-medium">
                  {resolvedUser?.fullName || 'Student'}
                </span>
                {resolvedUser?.studentId && (
                  <span className="text-slate-500 font-mono">({resolvedUser.studentId})</span>
                )}
              </div>
            </div>
          </div>

          <button 
            onClick={onLogout}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition cursor-pointer px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: BRI Card + Recommendations + Form */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* BRI Status Card */}
            <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Longitudinal BRI Status
                </span>
                <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${
                  briScore > 70 
                    ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' 
                    : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                }`}>
                  {statusLabel}
                </span>
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-5xl font-extrabold text-white tracking-tight">{briScore}</span>
                <span className="text-slate-500 text-sm font-medium">/ 100 Index</span>
              </div>

              <p className="mt-3 text-xs text-slate-400 leading-relaxed">
                Calculated using weighted rolling deficit algorithms across your logged micro-routines.
              </p>
            </div>

            {/* Dynamic Personalized Recovery Actions */}
            <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="text-xs font-bold text-white tracking-wide flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Personalized Recovery Actions
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Real-Time Insights</span>
              </div>

              <div className="space-y-2.5 text-xs">
                {briScore > 70 && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 space-y-1">
                    <p className="font-semibold flex items-center gap-1.5 text-rose-400">
                      <AlertTriangle className="w-4 h-4 shrink-0" /> Critical Academic Strain Detected
                    </p>
                    <p className="text-[11px] text-slate-300">
                      Your sustained stress and routine deficits exceed healthy thresholds. Consider scheduling a consultation with campus counseling or your academic advisor.
                    </p>
                  </div>
                )}

                {parseFloat(avgSleep) < 7.0 && (
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-2.5">
                    <Moon className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-200">Sleep Buffer Deficit ({avgSleep}h avg):</span>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Set an earlier digital cutoff. Gaining 45 minutes of sleep can reduce your burnout index by up to 10 points.
                      </p>
                    </div>
                  </div>
                )}

                {(parseFloat(avgStudy) > 6.0 || parseFloat(avgStress) >= 4) && (
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-200">Study Pacing & Stress ({avgStress}/5 stress):</span>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Incorporate 50-minute study sprints with mandatory 10-minute screen-free breaks to prevent cognitive fatigue.
                      </p>
                    </div>
                  </div>
                )}

                {avgHydration < 1800 && (
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-2.5">
                    <Droplets className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-200">Hydration Level Low ({avgHydration} ml avg):</span>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Keep a water bottle on your desk during lectures and study blocks to hit your 2,000 ml daily target.
                      </p>
                    </div>
                  </div>
                )}

                {briScore <= 45 && parseFloat(avgSleep) >= 7.0 && parseFloat(avgStress) < 4 && avgHydration >= 1800 && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-[11px]">Your micro-routines are in optimal balance. Maintain your current study and rest cycles!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Form: Log Daily Micro-Routine */}
            <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-5">
                {editingId ? <Edit3 className="w-4 h-4 text-indigo-400" /> : <Plus className="w-4 h-4 text-indigo-400" />}
                {editingId ? 'Edit Routine Record' : 'Log Daily Micro-Routine'}
              </h2>

              <form onSubmit={handleSaveRecord} className="space-y-4">
                
                {/* Date & Sleep Inputs */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Date</label>
                    <input 
                      type="date"
                      required
                      value={formInput.date}
                      disabled={!!editingId}
                      onChange={(e) => setFormInput({ ...formInput, date: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Sleep (Hrs)</label>
                    <input 
                      type="number"
                      step="0.5"
                      min="0"
                      max="24"
                      required
                      value={formInput.sleep}
                      onChange={(e) => setFormInput({ ...formInput, sleep: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Study Pacing & Hydration Inputs */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Study Pacing (Hrs)</label>
                    <input 
                      type="number"
                      step="0.5"
                      min="0"
                      max="24"
                      required
                      value={formInput.studyHours}
                      onChange={(e) => setFormInput({ ...formInput, studyHours: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Hydration (ml)</label>
                    <input 
                      type="number"
                      step="100"
                      min="0"
                      required
                      value={formInput.hydration}
                      onChange={(e) => setFormInput({ ...formInput, hydration: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Perceived Stress Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs text-slate-400">Perceived Stress Level</label>
                    <span className="text-xs font-bold text-indigo-400">{formInput.stress} / 5</span>
                  </div>
                  <input 
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={formInput.stress}
                    onChange={(e) => setFormInput({ ...formInput, stress: parseInt(e.target.value, 10) })}
                    className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-950 rounded-lg"
                  />
                </div>

                {/* Context / Milestone Tag */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Context / Milestone Tag</label>
                  <input 
                    type="text"
                    placeholder="e.g. Capstone Lab Work"
                    value={formInput.note}
                    onChange={(e) => setFormInput({ ...formInput, note: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Form Action Buttons */}
                <div className="flex gap-2 pt-2">
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setFormInput({
                          date: new Date().toISOString().split('T')[0],
                          sleep: 7.0,
                          studyHours: 4.0,
                          hydration: 2000,
                          stress: 3,
                          note: ''
                        });
                      }}
                      className="w-1/3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                  <button 
                    type="submit"
                    className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {editingId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {editingId ? 'Update Record' : 'Add Routine Record'}
                  </button>
                </div>
              </form>
            </div>

          </div>

          {/* Right Column: Historical Routine Records Table */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-bold text-white">Historical Routine Records</h2>
              <span className="text-xs text-slate-400 font-mono">
                {logs.length} entries stored
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-800 pb-2">
                    <th className="py-2.5 font-semibold">Date</th>
                    <th className="py-2.5 font-semibold">Sleep</th>
                    <th className="py-2.5 font-semibold">Study</th>
                    <th className="py-2.5 font-semibold">Hydration</th>
                    <th className="py-2.5 font-semibold">Stress</th>
                    <th className="py-2.5 font-semibold">Context</th>
                    <th className="py-2.5 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-slate-500">
                        Connecting to database...
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-slate-500">
                        No records logged yet. Add your first check-in!
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.log_id} className="hover:bg-slate-850/40 transition">
                        <td className="py-3.5 font-mono text-slate-300">{log.log_date}</td>
                        <td className="py-3.5 text-slate-200">{log.sleep_hours}h</td>
                        <td className="py-3.5 text-slate-200">{log.study_hours}h</td>
                        <td className="py-3.5 text-sky-400 font-mono">{log.hydration_ml}ml</td>
                        <td className="py-3.5">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                            log.stress_level >= 4 ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {log.stress_level}/5
                          </span>
                        </td>
                        <td className="py-3.5 text-slate-400">{log.context_tag || '-'}</td>
                        <td className="py-3.5 text-right space-x-2">
                          <button 
                            onClick={() => handleEditClick(log)}
                            className="text-slate-400 hover:text-indigo-400 transition cursor-pointer"
                            title="Edit Record"
                          >
                            <Edit3 className="w-3.5 h-3.5 inline" />
                          </button>
                          <button 
                            onClick={() => handleDeleteRecord(log.log_id)}
                            className="text-slate-400 hover:text-rose-400 transition cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5 inline" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}