import React, { useState } from 'react';
import { 
  Moon, 
  Droplets, 
  BrainCircuit, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Activity, 
  ShieldAlert,
  BarChart3,
  CalendarCheck
} from 'lucide-react';

export default function LandingPage({ onGetStarted, onLogin }) {
  const [sleepHours, setSleepHours] = useState(6.5);
  const [stressLevel, setStressLevel] = useState(3);

  // Dynamic preview score calculation
  const demoRiskScore = Math.min(
    100, 
    Math.max(15, Math.round(((8 - sleepHours) * 7.5) + (stressLevel * 11)))
  );

  const getRiskStatus = (score) => {
    if (score < 40) return { label: 'Low Risk', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    if (score < 70) return { label: 'Moderate Risk', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    return { label: 'High Strain', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
  };

  const status = getRiskStatus(demoRiskScore);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      
      {/* 1. Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              RoutineTrack
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onLogin}
              className="text-sm font-semibold text-slate-300 hover:text-white px-4 py-2 rounded-lg transition"
            >
              Sign In
            </button>
            <button
              onClick={onGetStarted}
              className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <main className="flex-1">
        <section className="pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column: Heading, Value Prop, and CTAs */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
                  Balance Your Study Rhythm. <br />
                  <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-sky-400 bg-clip-text text-transparent">
                    Visualize Burnout
                  </span> Before Deadlines Hit.
                </h1>

                <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Log daily sleep, hydration, study blocks, and perceived stress in under 60 seconds. Our 7-day Burnout Risk Index (BRI) tracks cumulative exhaustion across your semester coursework and exams.
                </p>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <button
                    onClick={onGetStarted}
                    className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-white shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-2 group"
                  >
                    Start Tracking Free
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                  </button>
                  <a
                    href="#simulator"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 font-semibold text-slate-300 border border-slate-800 transition flex items-center justify-center"
                  >
                    Try the Simulator
                  </a>
                </div>

                <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Fast Daily Check-Ins
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Weighted 7-Day Index
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Private & Student-Focused
                  </span>
                </div>
              </div>

              {/* Right Column: Hero Image of African University Student */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900 relative">
                  <img
                    src="https://images.pexels.com/photos/5905710/pexels-photo-5905710.jpeg?auto=compress&cs=tinysrgb&w=1000"
                    alt="African university student studying on laptop"
                    className="w-full h-[440px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-sm border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-white">Daily Wellness Check-In</div>
                      <div className="text-[11px] text-slate-400">Tracking sleep debt & academic workload</div>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      Active Term
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 3. The 4 Core Micro-Routines */}
        <section className="py-20 bg-slate-900/40 border-y border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2">
                Core Tracking Metrics
              </h2>
              <p className="text-3xl font-bold text-white tracking-tight">
                Four Micro-Routines. Under 60 Seconds Daily.
              </p>
              <p className="text-sm text-slate-400 mt-3">
                No complex journaling or multi-page forms. Record your baseline wellness with zero disruption to your study schedule.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Sleep Routine */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                  <Moon className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="font-semibold text-white text-base mb-1.5">Sleep & Rest Quality</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Log nightly hours and quality to compute rolling deficits against standard cognitive rest baselines.
                </p>
              </div>

              {/* Study Intervals */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition">
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-violet-400" />
                </div>
                <h3 className="font-semibold text-white text-base mb-1.5">Study-to-Rest Ratio</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Identify fatigue buildup from prolonged revision blocks exceeding 120 minutes without breaks.
                </p>
              </div>

              {/* Hydration */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition">
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-4">
                  <Droplets className="w-6 h-6 text-sky-400" />
                </div>
                <h3 className="font-semibold text-white text-base mb-1.5">Hydration Intake</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Quick-log daily water intake (+250ml / +500ml) to monitor basic physiological readiness.
                </p>
              </div>

              {/* Stress Gauge */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
                  <BrainCircuit className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="font-semibold text-white text-base mb-1.5">Perceived Stress</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  A 1-to-5 Likert scale capturing subjectively felt academic and personal stress levels.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Campus Life Gallery */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Academic Context
              </span>
              <h2 className="text-3xl font-bold text-white tracking-tight mt-1">
                Designed Around Real University Demands
              </h2>
              <p className="text-sm text-slate-400 mt-2">
                From project assignments to revision sessions, maintain a sustainable academic rhythm.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Photo Card 1: Library Study */}
              <div className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
                <div className="h-56 overflow-hidden">
                  <img
                    src="https://images.pexels.com/photos/5905497/pexels-photo-5905497.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="African student on campus with notebook"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-white text-sm mb-1.5">Continuous Coursework Pacing</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Balance demanding assignment deadlines across weeks to avoid steep burnout spikes right before submission dates.
                  </p>
                </div>
              </div>

              {/* Photo Card 2: Campus Collaboration */}
              <div className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
                <div className="h-56 overflow-hidden">
                  <img
                    src="https://images.pexels.com/photos/5905445/pexels-photo-5905445.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="African university students collaborating between classes"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-white text-sm mb-1.5">Peer Support & Breaks</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Incorporate active pauses between class blocks and lab sessions to maintain focus and working memory.
                  </p>
                </div>
              </div>

              {/* Photo Card 3: Modern Tech Workflow */}
              <div className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
                <div className="h-56 overflow-hidden">
                  <img
                    src="https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="African student group collaborating on laptops"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-white text-sm mb-1.5">Cognitive Recovery</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Prevent late-night fatigue and cognitive overload by analyzing your longitudinal 7-day risk trends early.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Interactive Burnout Risk Index (BRI) Simulator */}
        <section id="simulator" className="py-20 bg-slate-900/40 border-t border-slate-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="p-7 sm:p-9 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-3">
                <div>
                  <h3 className="text-lg font-bold text-white">Live BRI Heuristic Simulator</h3>
                  <p className="text-xs text-slate-400">Adjust the inputs to see how daily habits alter your burnout risk in real time.</p>
                </div>
                <span className={`self-start sm:self-auto text-xs px-3 py-1 rounded-md font-semibold border ${status.color}`}>
                  {status.label}
                </span>
              </div>

              <div className="py-8 flex flex-col items-center">
                <div className="text-6xl font-black text-white tracking-tight">
                  {demoRiskScore}
                  <span className="text-sm font-medium text-slate-400 ml-1">/ 100</span>
                </div>
                <p className="text-xs text-slate-400 mt-2 font-medium">Computed 7-Day Longitudinal Burnout Risk</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <Moon className="w-3.5 h-3.5 text-indigo-400" /> Sleep Duration
                    </span>
                    <span className="text-slate-300 font-mono">{sleepHours} hrs</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="10"
                    step="0.5"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <BrainCircuit className="w-3.5 h-3.5 text-violet-400" /> Subjective Stress Rating
                    </span>
                    <span className="text-slate-300 font-mono">{stressLevel} / 5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={stressLevel}
                    onChange={(e) => setStressLevel(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              </div>

              <div className="mt-8 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-3">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  {demoRiskScore > 65 
                    ? 'Elevated strain detected: High stress combined with sleep reduction increases short-term burnout likelihood.' 
                    : 'Balanced parameters: Logged habits are within sustainable cognitive recovery thresholds.'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Call To Action */}
        <section className="py-20 border-t border-slate-800">
          <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Ready to Track Your Academic Well-Being?
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Set up your student profile, establish your daily routine goals, and safeguard your mental stamina through every semester.
            </p>
            <div>
              <button
                onClick={onGetStarted}
                className="px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-white shadow-xl shadow-indigo-600/30 transition inline-flex items-center gap-2"
              >
                Create Student Account <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* 7. Clean Academic Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <p>SWE 4900 Senior Capstone Project · RoutineTrack Student Well-Being System</p>
      </footer>
    </div>
  );
}