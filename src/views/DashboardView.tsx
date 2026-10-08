import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  calculateOverallAverage,
  calculateModuleAverage,
  percentageToGpa,
  percentageToLetter,
} from '../utils/academicCalculations';
import {
  Award,
  Timer,
  Calendar,
  BookOpen,
  TrendingUp,
  Clock,
  CheckCircle2,
  Plus,
  ArrowRight,
  Flame,
  ChevronRight,
} from 'lucide-react';
import { GradeSimulatorModal } from '../components/modals/GradeSimulatorModal';

export const DashboardView: React.FC = () => {
  const {
    profile,
    modules,
    assessments,
    events,
    studySessions,
    studyGoal,
    setActiveTab,
    setIsQuickAddEventOpen,
  } = useApp();

  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  // Calculations
  const overallAvg = calculateOverallAverage(modules, assessments);
  const currentGpa = percentageToGpa(overallAvg);
  const letterGrade = percentageToLetter(overallAvg);

  // Study hours this week (last 7 days)
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thisWeekSessions = studySessions.filter(
    (s) => new Date(s.startedAt) >= oneWeekAgo && s.status === 'completed'
  );
  const thisWeekSeconds = thisWeekSessions.reduce((sum, s) => sum + s.durationSeconds, 0);
  const thisWeekHours = Math.round((thisWeekSeconds / 3600) * 10) / 10;

  // Today's study time
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todaySessions = studySessions.filter(
    (s) => new Date(s.startedAt) >= todayStart && s.status === 'completed'
  );
  const todaySeconds = todaySessions.reduce((sum, s) => sum + s.durationSeconds, 0);
  const todayMinutes = Math.round(todaySeconds / 60);
  const dailyGoalMinutes = studyGoal.dailyTargetMinutes || 180;
  const todayProgressPercent = Math.min(100, Math.round((todayMinutes / dailyGoalMinutes) * 100));

  // Upcoming deadlines (next 7 days, uncompleted)
  const upcomingEvents = events
    .filter((e) => !e.isCompleted)
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
    .slice(0, 4);

  // Active modules
  const activeModules = modules.filter((m) => !m.isArchived);

  return (
    <div className="space-y-5 pb-24 animate-fade-in">
      {/* Front Page Header Banner with g5.png icon */}
      <div className="bg-gradient-to-br from-[var(--gf-primary)] to-[var(--gf-primary-light)] rounded-3xl p-5 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            {/* Front Page Icon g5.png */}
            <div className="w-12 h-12 rounded-2xl bg-white/20 p-1.5 flex items-center justify-center shrink-0 border border-white/30">
              <img
                src="/g5.png"
                alt="GradeFlow Icon"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/15 text-xs font-semibold mb-1">
                <span>{profile.semester || 'Fall Semester 2026'}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Hello, {profile.displayName.split(' ')[0]}
              </h1>
              <p className="text-xs text-pink-100 mt-0.5 max-w-md">
                Tracking <strong className="text-white">{activeModules.length} active modules</strong> with a{' '}
                <strong className="text-white font-bold">{overallAvg.toFixed(1)}%</strong> overall standing.
              </p>
            </div>
          </div>

          {/* Simulator button */}
          <button
            onClick={() => setIsSimulatorOpen(true)}
            className="self-start md:self-auto bg-[var(--gf-card)] text-[var(--gf-primary)] rounded-2xl px-4 py-2 text-xs font-extrabold shadow-sm hover:bg-pink-50 transition-all flex items-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap"
          >
            <TrendingUp className="w-4 h-4 text-[var(--gf-primary)]" />
            What-If Simulator
          </button>
        </div>
      </div>

      {/* Primary KPI Metric Tiles (Non-rounded sharp geometry) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Tile 1: Academic Standing & GPA */}
        <button
          onClick={() => setActiveTab('marks')}
          className="gf-3d-card p-5 text-left transition-transform hover:-translate-y-0.5 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--gf-muted)] uppercase tracking-wider">
              Overall Academic Average
            </span>
            <div className="w-7 h-7 rounded-full bg-[var(--gf-tint)] text-[var(--gf-primary)] flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <div className="text-3xl font-extrabold text-[var(--gf-text)] tracking-tight">
                {overallAvg > 0 ? `${overallAvg.toFixed(1)}%` : '--'}
              </div>
              <div className="text-xs font-bold text-[var(--gf-primary)] mt-0.5 flex items-center gap-1.5">
                <span>Grade: {overallAvg > 0 ? letterGrade : 'N/A'}</span>
                <span>•</span>
                <span>GPA: {overallAvg > 0 ? currentGpa.toFixed(2) : '--'} / 4.0</span>
              </div>
            </div>

            {/* Sharp Letter Badge */}
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[var(--gf-primary-light)] to-[var(--gf-primary)] text-white flex items-center justify-center font-extrabold text-xl shadow-xs">
              {overallAvg > 0 ? letterGrade : '—'}
            </div>
          </div>

          {/* Target GPA progress bar */}
          <div className="mt-4 pt-3 border-t border-[var(--gf-border)]/60">
            <div className="flex justify-between text-[11px] font-semibold text-[var(--gf-muted)] mb-1">
              <span>Target: {profile.targetGpa.toFixed(2)} GPA</span>
              <span>{Math.min(100, Math.round((currentGpa / profile.targetGpa) * 100))}% reached</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[var(--gf-tint)] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--gf-primary-light)] to-[var(--gf-primary)] transition-all duration-500"
                style={{ width: `${Math.min(100, (currentGpa / profile.targetGpa) * 100)}%` }}
              />
            </div>
          </div>
        </button>

        {/* Tile 2: Weekly Study Hours vs Target */}
        <div className="gf-3d-card p-5 transition-transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--gf-muted)] uppercase tracking-wider">
              Study Time (This Week)
            </span>
            <div className="w-7 h-7 rounded-full bg-[var(--gf-tint)] text-[var(--gf-primary)] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <div className="text-3xl font-extrabold text-[var(--gf-text)] tracking-tight">
                {thisWeekHours} <span className="text-sm font-semibold text-[var(--gf-muted)]">hrs</span>
              </div>
              <div className="text-xs font-bold text-[var(--gf-primary)] mt-0.5">
                Target: {studyGoal.weeklyTargetHours} hrs / week
              </div>
            </div>

            <div className="w-11 h-11 rounded-2xl bg-[var(--gf-tint)] border border-[var(--gf-border)] text-[var(--gf-primary)] flex flex-col items-center justify-center">
              <Flame className="w-4 h-4 fill-[var(--gf-primary)]" />
              <span className="text-[9px] font-extrabold">Streak</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--gf-border)]/60">
            <div className="flex justify-between text-[11px] font-semibold text-[var(--gf-muted)] mb-1">
              <span>Goal Progress</span>
              <span>{Math.min(100, Math.round((thisWeekHours / studyGoal.weeklyTargetHours) * 100))}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[var(--gf-tint)] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--gf-primary-light)] to-[var(--gf-primary)] transition-all duration-500"
                style={{ width: `${Math.min(100, (thisWeekHours / studyGoal.weeklyTargetHours) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tile 3: Today's Focus Goal */}
        <div className="gf-3d-card p-5 transition-transform hover:-translate-y-0.5 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--gf-muted)] uppercase tracking-wider">
              Today's Focus Goal
            </span>
            <div className="w-7 h-7 rounded-full bg-[var(--gf-tint)] text-[var(--gf-primary)] flex items-center justify-center">
              <Timer className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div>
              <div className="text-3xl font-extrabold text-[var(--gf-text)] tracking-tight">
                {todayMinutes} <span className="text-sm font-semibold text-[var(--gf-muted)]">/ {dailyGoalMinutes} min</span>
              </div>
              <p className="text-xs font-medium text-[var(--gf-muted)] mt-0.5">
                {todayProgressPercent >= 100 ? 'Goal completed!' : `${dailyGoalMinutes - todayMinutes} mins remaining`}
              </p>
            </div>

            {/* Circular Mini Progress Ring */}
            <div className="relative w-11 h-11 flex items-center justify-center">
              <svg className="w-11 h-11 transform -rotate-90">
                <circle
                  cx="22"
                  cy="22"
                  r="16"
                  stroke="var(--gf-tint)"
                  strokeWidth="4"
                  fill="transparent"
                />
                <circle
                  cx="22"
                  cy="22"
                  r="16"
                  stroke="var(--gf-primary)"
                  strokeWidth="4"
                  strokeDasharray="100"
                  strokeDashoffset={100 - todayProgressPercent}
                  fill="transparent"
                  className="transition-all duration-500"
                />
              </svg>
              <span className="absolute text-[10px] font-extrabold text-[var(--gf-text)]">
                {todayProgressPercent}%
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--gf-border)]/60 flex items-center justify-between">
            <button
              onClick={() => setActiveTab('focus')}
              className="text-xs font-bold text-[var(--gf-primary)] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Start Focus Session
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-semibold text-[var(--gf-muted)]">
              {todaySessions.length} session{todaySessions.length === 1 ? '' : 's'} today
            </span>
          </div>
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="grid grid-cols-1 gap-5">
        {/* Section: Upcoming Deadlines */}
        <div className="gf-3d-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--gf-border)]/60">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[var(--gf-tint)] text-[var(--gf-primary)] flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[var(--gf-text)]">Upcoming Deadlines</h3>
              </div>
              <button
                onClick={() => setActiveTab('calendar')}
                className="text-xs font-bold text-[var(--gf-primary)] hover:underline flex items-center gap-1 cursor-pointer"
              >
                View All ({events.filter((e) => !e.isCompleted).length})
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List */}
            <div className="mt-3 space-y-2.5">
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-8 text-xs text-[var(--gf-muted)]">
                  <CheckCircle2 className="w-8 h-8 text-[var(--gf-border)] mx-auto mb-2" />
                  No upcoming deadlines scheduled.
                </div>
              ) : (
                upcomingEvents.map((evt) => {
                  const mod = modules.find((m) => m.id === evt.moduleId);
                  const dueDate = new Date(evt.dueAt);
                  const isOverdue = dueDate.getTime() < Date.now();
                  const daysUntil = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

                  return (
                    <div
                      key={evt.id}
                      className="p-3 rounded-2xl bg-[var(--gf-card)] border border-[var(--gf-border)] hover:border-[var(--gf-primary)]/60 transition-all flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className="w-2 h-10 rounded-full shrink-0"
                          style={{ backgroundColor: mod?.colour || 'var(--gf-primary)' }}
                        />
                        <div className="truncate">
                          <h4 className="text-xs font-bold text-[var(--gf-text)] truncate">{evt.title}</h4>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[var(--gf-muted)]">
                            <span>{mod?.code || 'General'}</span>
                            <span>•</span>
                            <span className="capitalize">{evt.eventType.replace('_', ' ')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full inline-block ${
                            isOverdue
                              ? 'bg-rose-100 text-rose-700'
                              : daysUntil <= 1
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-[var(--gf-tint)] text-[var(--gf-primary)]'
                          }`}
                        >
                          {isOverdue ? 'Overdue' : daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil}d left`}
                        </span>
                        <div className="text-[10px] text-[var(--gf-muted)] mt-0.5">
                          {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <button
            onClick={() => setIsQuickAddEventOpen(true)}
            className="mt-4 w-full py-2.5 rounded-2xl border border-dashed border-[var(--gf-border)] hover:border-[var(--gf-primary)] hover:bg-[var(--gf-tint)] text-xs font-bold text-[var(--gf-primary)] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Deadline or Event
          </button>
        </div>
      </div>

      {/* Modal: What-If Simulator */}
      <GradeSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
      />
    </div>
  );
};
