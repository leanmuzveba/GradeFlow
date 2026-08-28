import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SessionType } from '../types';
import { soundEngine } from '../utils/audioSynth';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Volume2,
  VolumeX,
  CloudRain,
  Radio,
  BookOpen,
  Sparkles,
  Clock,
  BarChart3,
  Pencil,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const FocusView: React.FC = () => {
  const {
    modules,
    addStudySession,
    studySessions,
    updateStudySession,
    deleteStudySession,
    focusTimer,
    setFocusTimer,
    focusTimerAutoModuleId,
    setFocusTimerAutoModuleId,
    setActiveTab,
  } = useApp();

  const { mode, moduleId: selectedModuleId, durationMinutes: timerDurationMinutes, isRunning } = focusTimer;

  const [ambientSound, setAmbientSound] = useState<'none' | 'pink_noise' | 'rain' | 'binaural'>('none');
  const [sessionNotes, setSessionNotes] = useState<string>('');
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState<boolean>(false);
  const [completedSecondsToSave, setCompletedSecondsToSave] = useState<number>(0);
  const [customMinutesInput, setCustomMinutesInput] = useState<string>('');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editModuleId, setEditModuleId] = useState<string>('');
  const [editMinutes, setEditMinutes] = useState<number>(0);
  const [editNotes, setEditNotes] = useState<string>('');

  // Forces a re-render every second while running so the displayed clock moves;
  // the actual elapsed time is always derived from real timestamps below, so it
  // stays correct even if this tick was suspended (tab switch, backgrounded app).
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const elapsedSeconds =
    focusTimer.accumulatedSeconds +
    (isRunning && focusTimer.runStartedAt ? (Date.now() - focusTimer.runStartedAt) / 1000 : 0);

  const stopwatchSeconds = Math.floor(elapsedSeconds);
  const timeLeftSeconds = Math.max(0, Math.ceil(timerDurationMinutes * 60 - elapsedSeconds));

  // Sync auto module selection if passed from another view
  useEffect(() => {
    if (focusTimerAutoModuleId) {
      setFocusTimer((prev) => ({ ...prev, moduleId: focusTimerAutoModuleId }));
      setFocusTimerAutoModuleId(null);
    } else if (modules.length > 0 && !selectedModuleId) {
      setFocusTimer((prev) => ({ ...prev, moduleId: modules[0].id }));
    }
  }, [focusTimerAutoModuleId, modules, selectedModuleId, setFocusTimerAutoModuleId, setFocusTimer]);

  // Catches a countdown that finished while this view was unmounted or the app
  // was closed entirely: as soon as we're back, surface the completion modal
  // instead of silently losing the finished session.
  useEffect(() => {
    if (mode !== 'stopwatch' && isRunning && timeLeftSeconds <= 0) {
      const durationSecs = timerDurationMinutes * 60;
      setFocusTimer((prev) => ({ ...prev, isRunning: false, runStartedAt: null, accumulatedSeconds: durationSecs }));
      setCompletedSecondsToSave(durationSecs);
      setIsCompletionModalOpen(true);
      soundEngine.playChime(true);
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#e91e8c', '#ff6ec7', '#ffd6ee'],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, isRunning, timeLeftSeconds, timerDurationMinutes]);

  // Mode changes
  const switchMode = (newMode: SessionType) => {
    setFocusTimer((prev) => ({
      ...prev,
      mode: newMode,
      isRunning: false,
      runStartedAt: null,
      accumulatedSeconds: 0,
      durationMinutes: newMode === 'pomodoro' ? 25 : newMode === 'timer' ? 45 : prev.durationMinutes,
    }));
  };

  // Handle ambient sound changes
  const handleAmbientChange = (type: 'none' | 'pink_noise' | 'rain' | 'binaural') => {
    setAmbientSound(type);
    soundEngine.toggleAmbientSound(type);
  };

  const handleToggleTimer = () => {
    soundEngine.playTick();
    setFocusTimer((prev) => {
      if (prev.isRunning) {
        const elapsed = prev.runStartedAt ? (Date.now() - prev.runStartedAt) / 1000 : 0;
        return { ...prev, isRunning: false, runStartedAt: null, accumulatedSeconds: prev.accumulatedSeconds + elapsed };
      }
      return { ...prev, isRunning: true, runStartedAt: Date.now() };
    });
  };

  const handleResetTimer = () => {
    setFocusTimer((prev) => ({ ...prev, isRunning: false, runStartedAt: null, accumulatedSeconds: 0 }));
  };

  const handleFinishEarly = () => {
    const elapsedNow = mode === 'stopwatch' ? stopwatchSeconds : timerDurationMinutes * 60 - timeLeftSeconds;

    if (elapsedNow < 10) {
      handleResetTimer();
      return;
    }

    setFocusTimer((prev) => ({ ...prev, isRunning: false, runStartedAt: null }));
    setCompletedSecondsToSave(elapsedNow);
    setIsCompletionModalOpen(true);
  };

  const handleSaveCompletedSession = () => {
    if (completedSecondsToSave > 0) {
      addStudySession({
        moduleId: selectedModuleId || undefined,
        sessionType: mode,
        startedAt: new Date(Date.now() - completedSecondsToSave * 1000).toISOString(),
        endedAt: new Date().toISOString(),
        durationSeconds: completedSecondsToSave,
        status: 'completed',
        notes: sessionNotes.trim() || undefined,
      });
    }

    setIsCompletionModalOpen(false);
    setSessionNotes('');
    handleResetTimer();
  };

  const applyPreset = (mins: number) => {
    setFocusTimer((prev) => ({ ...prev, durationMinutes: mins }));
    setCustomMinutesInput('');
  };

  const startEditSession = (session: (typeof studySessions)[number]) => {
    setEditingSessionId(session.id);
    setEditModuleId(session.moduleId || '');
    setEditMinutes(Math.round(session.durationSeconds / 60));
    setEditNotes(session.notes || '');
  };

  const cancelEditSession = () => setEditingSessionId(null);

  const handleSaveSessionEdit = () => {
    if (!editingSessionId) return;
    updateStudySession(editingSessionId, {
      moduleId: editModuleId || undefined,
      durationSeconds: Math.max(1, editMinutes) * 60,
      notes: editNotes.trim() || undefined,
    });
    setEditingSessionId(null);
  };

  const handleDeleteSession = (id: string) => {
    if (confirm('Remove this study session from your log? This cannot be undone.')) {
      if (editingSessionId === id) setEditingSessionId(null);
      deleteStudySession(id);
    }
  };

  const handleApplyCustomMinutes = (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseInt(customMinutesInput, 10);
    if (Number.isFinite(mins) && mins > 0) {
      applyPreset(mins);
    }
  };

  // Always HH:MM:SS, zero-padded, with no upper bound on the hours portion.
  const formatHMS = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTodayTotal = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  const totalTimeForTimer = timerDurationMinutes * 60;
  const progressPercent =
    mode === 'stopwatch'
      ? 100
      : Math.min(100, Math.max(0, ((totalTimeForTimer - timeLeftSeconds) / totalTimeForTimer) * 100));

  const currentModule = modules.find((m) => m.id === selectedModuleId);

  const todaySeconds = studySessions
    .filter((s) => new Date(s.startedAt).toDateString() === new Date().toDateString())
    .reduce((sum, s) => sum + s.durationSeconds, 0);

  return (
    <div className="space-y-5 pb-24 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--gf-card)] p-5 rounded-3xl border border-[var(--gf-border)] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--gf-text)] tracking-tight">
              Focus Session
            </h1>
            <button
              onClick={() => setActiveTab('analytics')}
              className="w-8 h-8 rounded-full bg-[var(--gf-tint)] text-[var(--gf-primary)] flex items-center justify-center cursor-pointer hover:bg-[var(--gf-border)] transition-colors"
              title="Study Analytics"
              aria-label="View study analytics"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <span className="ml-1 px-3 py-1 rounded-full text-white text-[11px] font-bold bg-gradient-to-br from-[var(--gf-primary-light)] to-[var(--gf-primary)]">
              Today: {formatTodayTotal(todaySeconds)}
            </span>
          </div>
          <p className="text-xs text-[var(--gf-muted)] mt-1">
            Countdown timer, stopwatch, and ambient sound generator
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex bg-[var(--gf-tint)] p-1 rounded-2xl border border-[var(--gf-border)]">
          <button
            onClick={() => switchMode('pomodoro')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'pomodoro'
                ? 'bg-[var(--gf-card)] text-[var(--gf-primary)] shadow-xs'
                : 'text-[var(--gf-muted)] hover:text-[var(--gf-primary)]'
            }`}
          >
            Pomodoro (25m)
          </button>
          <button
            onClick={() => switchMode('timer')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'timer'
                ? 'bg-[var(--gf-card)] text-[var(--gf-primary)] shadow-xs'
                : 'text-[var(--gf-muted)] hover:text-[var(--gf-primary)]'
            }`}
          >
            Custom Timer
          </button>
          <button
            onClick={() => switchMode('stopwatch')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'stopwatch'
                ? 'bg-[var(--gf-card)] text-[var(--gf-primary)] shadow-xs'
                : 'text-[var(--gf-muted)] hover:text-[var(--gf-primary)]'
            }`}
          >
            Stopwatch
          </button>
        </div>
      </div>

      {/* Main Focus Stage Card */}
      <div className="gf-3d-card p-6 sm:p-8 flex flex-col items-center justify-center relative overflow-hidden text-center">
        {/* Module selector banner */}
        <div className="w-full max-w-sm mb-6 flex items-center justify-center">
          <div className="flex items-center gap-2 bg-[var(--gf-tint)] border border-[var(--gf-border)] rounded-full px-3.5 py-1.5 shadow-xs">
            <BookOpen className="w-4 h-4 text-[var(--gf-primary)]" />
            <span className="text-xs font-bold text-[var(--gf-muted)]">Studying:</span>
            <select
              value={selectedModuleId}
              onChange={(e) => setFocusTimer((prev) => ({ ...prev, moduleId: e.target.value }))}
              className="bg-transparent text-xs font-extrabold text-[var(--gf-text)] focus:outline-none cursor-pointer"
            >
              <option value="">-- General Study --</option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.code ? `[${m.code}] ` : ''}{m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Circular Display */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-2">
          {/* Background Ring */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="44%"
              stroke="var(--gf-tint)"
              strokeWidth="12"
              fill="transparent"
            />
            {/* Progress Stroke */}
            <circle
              cx="50%"
              cy="50%"
              r="44%"
              stroke="url(#timerGradient)"
              strokeWidth="12"
              strokeDasharray="800"
              strokeDashoffset={mode === 'stopwatch' ? 0 : 800 - (800 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-500"
            />
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--gf-primary-light)" />
                <stop offset="100%" stopColor="var(--gf-primary)" />
              </linearGradient>
            </defs>
          </svg>

          {/* Inner Content Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono-timer text-3xl sm:text-4xl font-bold text-[var(--gf-text)] tracking-tight">
              {mode === 'stopwatch' ? formatHMS(stopwatchSeconds) : formatHMS(timeLeftSeconds)}
            </span>
            <span className="text-xs font-bold text-[var(--gf-primary)] uppercase tracking-wider mt-2 flex items-center gap-1.5">
              {isRunning ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-[var(--gf-primary)] animate-ping" />
                  In Flow Session
                </>
              ) : (
                'Session Paused'
              )}
            </span>
            {currentModule && (
              <span className="text-[11px] font-semibold text-[var(--gf-muted)] mt-1 max-w-[180px] truncate">
                {currentModule.name}
              </span>
            )}
          </div>
        </div>

        {/* Duration preset buttons + custom minutes for Custom Timer */}
        {mode === 'timer' && !isRunning && (
          <div className="flex flex-col items-center gap-3 my-4">
            <div className="flex flex-wrap justify-center gap-2">
              {[15, 30, 45, 60, 90].map((mins) => (
                <button
                  key={mins}
                  onClick={() => applyPreset(mins)}
                  className={`px-4 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                    timerDurationMinutes === mins
                      ? 'bg-[var(--gf-primary)] border-[var(--gf-primary)] text-white shadow-xs'
                      : 'bg-[var(--gf-tint)] border-[var(--gf-border)] text-[var(--gf-text)] hover:bg-[var(--gf-border)]/60'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
            <form onSubmit={handleApplyCustomMinutes} className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                placeholder="Custom minutes"
                value={customMinutesInput}
                onChange={(e) => setCustomMinutesInput(e.target.value)}
                className="w-32 px-3 py-2 rounded-full text-xs font-bold text-[var(--gf-text)] bg-[var(--gf-tint)] border border-[var(--gf-border)] focus:outline-none focus:ring-2 focus:ring-[var(--gf-primary)] text-center"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-full text-xs font-bold text-white bg-[var(--gf-primary)] cursor-pointer transition-all active:scale-95"
              >
                Set
              </button>
            </form>
          </div>
        )}

        {/* Primary Controls */}
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={handleResetTimer}
            className="p-3.5 rounded-2xl bg-[var(--gf-tint)] border border-[var(--gf-border)] text-[var(--gf-muted)] hover:text-[var(--gf-primary)] transition-all cursor-pointer active:scale-95 shadow-xs"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            id="focus-toggle-play-btn"
            onClick={handleToggleTimer}
            className="gf-3d-button px-8 py-3.5 text-white font-extrabold text-base flex items-center gap-2.5 shadow-md cursor-pointer transition-all active:scale-95"
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-white" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white ml-0.5" />
                <span>{elapsedSeconds < 1 ? 'Start Flow' : 'Resume'}</span>
              </>
            )}
          </button>

          <button
            onClick={handleFinishEarly}
            className="p-3.5 rounded-2xl bg-[var(--gf-tint)] border border-[var(--gf-border)] text-emerald-600 hover:bg-emerald-50 transition-all cursor-pointer active:scale-95 shadow-xs"
            title="Log & Complete Session"
          >
            <CheckCircle2 className="w-5 h-5" />
          </button>
        </div>

        {/* Ambient Sound Bar */}
        <div className="mt-8 pt-6 border-t border-[var(--gf-border)]/60 w-full max-w-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[var(--gf-muted)] uppercase tracking-wider flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-[var(--gf-primary)]" />
              Focus Ambience Synth
            </span>
            <span className="text-[11px] text-[var(--gf-primary)] font-semibold">
              {ambientSound === 'none' ? 'Muted' : ambientSound.replace('_', ' ')}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => handleAmbientChange('none')}
              className={`py-2 px-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                ambientSound === 'none'
                  ? 'bg-[var(--gf-card)] border-[var(--gf-primary)] text-[var(--gf-primary)] ring-1 ring-[var(--gf-primary)]'
                  : 'bg-[var(--gf-tint)] border-[var(--gf-border)] text-[var(--gf-muted)]'
              }`}
            >
              <VolumeX className="w-4 h-4" />
              <span>Off</span>
            </button>

            <button
              onClick={() => handleAmbientChange('pink_noise')}
              className={`py-2 px-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                ambientSound === 'pink_noise'
                  ? 'bg-[var(--gf-primary)] border-[var(--gf-primary)] text-white shadow-xs'
                  : 'bg-[var(--gf-tint)] border-[var(--gf-border)] text-[var(--gf-muted)]'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>Pink Noise</span>
            </button>

            <button
              onClick={() => handleAmbientChange('rain')}
              className={`py-2 px-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                ambientSound === 'rain'
                  ? 'bg-[var(--gf-primary)] border-[var(--gf-primary)] text-white shadow-xs'
                  : 'bg-[var(--gf-tint)] border-[var(--gf-border)] text-[var(--gf-muted)]'
              }`}
            >
              <CloudRain className="w-4 h-4" />
              <span>Rain Hiss</span>
            </button>

            <button
              onClick={() => handleAmbientChange('binaural')}
              className={`py-2 px-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                ambientSound === 'binaural'
                  ? 'bg-[var(--gf-primary)] border-[var(--gf-primary)] text-white shadow-xs'
                  : 'bg-[var(--gf-tint)] border-[var(--gf-border)] text-[var(--gf-muted)]'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Alpha Tone</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Study Sessions Ledger */}
      <div className="bg-[var(--gf-card)] p-5 rounded-3xl border border-[var(--gf-border)] shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--gf-border)]/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[var(--gf-tint)] text-[var(--gf-primary)] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[var(--gf-text)]">Recent Study Sessions</h3>
          </div>
          <span className="text-xs font-bold text-[var(--gf-muted)]">
            {studySessions.length} total logged
          </span>
        </div>

        <div className="mt-3 space-y-2.5">
          {studySessions.length === 0 ? (
            <div className="text-center py-6 text-xs text-[var(--gf-muted)]">
              No study sessions logged yet. Start the timer above!
            </div>
          ) : (
            studySessions.slice(0, 5).map((session) => {
              const mod = modules.find((m) => m.id === session.moduleId);
              const mins = Math.round(session.durationSeconds / 60);
              const isEditing = editingSessionId === session.id;

              if (isEditing) {
                return (
                  <div
                    key={session.id}
                    className="p-3 rounded-2xl bg-[var(--gf-card)] border border-[var(--gf-primary)] space-y-2.5"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-bold text-[var(--gf-muted)] mb-1">Module</label>
                        <select
                          value={editModuleId}
                          onChange={(e) => setEditModuleId(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[var(--gf-text)] bg-[var(--gf-tint)] border border-[var(--gf-border)] focus:outline-none focus:ring-2 focus:ring-[var(--gf-primary)]"
                        >
                          <option value="">-- General Study --</option>
                          {modules.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.code ? `[${m.code}] ` : ''}{m.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[var(--gf-muted)] mb-1">Minutes</label>
                        <input
                          type="number"
                          min={1}
                          value={editMinutes}
                          onChange={(e) => setEditMinutes(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[var(--gf-text)] bg-[var(--gf-tint)] border border-[var(--gf-border)] focus:outline-none focus:ring-2 focus:ring-[var(--gf-primary)]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[var(--gf-muted)] mb-1">Notes</label>
                      <textarea
                        rows={2}
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl text-xs text-[var(--gf-text)] bg-[var(--gf-tint)] border border-[var(--gf-border)] focus:outline-none focus:ring-2 focus:ring-[var(--gf-primary)]"
                      />
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={cancelEditSession}
                        className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-[var(--gf-muted)] hover:bg-[var(--gf-tint)] cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveSessionEdit}
                        className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-white bg-[var(--gf-primary)] cursor-pointer"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={session.id}
                  className="p-3 rounded-2xl bg-[var(--gf-tint)] border border-[var(--gf-border)] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center text-white font-extrabold text-[9px] leading-none tracking-tight text-center px-1 overflow-hidden shadow-xs"
                      style={{ backgroundColor: mod?.colour || 'var(--gf-primary)' }}
                    >
                      <span className="truncate w-full">{mod?.code || 'STUDY'}</span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-[var(--gf-text)]">
                        {mod?.name || 'General Focus Session'}
                      </h4>
                      <div className="text-[11px] text-[var(--gf-muted)] mt-0.5">
                        <span className="capitalize">{session.sessionType}</span> • {new Date(session.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </div>
                      {session.notes && (
                        <p className="text-[11px] text-[var(--gf-muted)] italic mt-1 truncate">
                          "{session.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-[var(--gf-primary)]">
                        {mins} mins
                      </span>
                      <span className="text-[10px] block font-semibold text-emerald-600">
                        Completed
                      </span>
                    </div>
                    <button
                      onClick={() => startEditSession(session)}
                      aria-label="Edit study session"
                      title="Edit session"
                      className="w-7 h-7 rounded-full bg-[var(--gf-card)] border border-[var(--gf-border)] text-[var(--gf-muted)] hover:text-[var(--gf-primary)] flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      aria-label="Delete study session"
                      title="Delete session"
                      className="w-7 h-7 rounded-full bg-[var(--gf-card)] border border-[var(--gf-border)] text-[var(--gf-muted)] hover:text-rose-600 flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Completion Modal */}
      {isCompletionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-[var(--gf-card)] w-full max-w-md rounded-3xl shadow-2xl border border-[var(--gf-border)] overflow-hidden p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--gf-primary-light)] to-[var(--gf-primary)] text-white flex items-center justify-center mx-auto shadow-md mb-3">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-extrabold text-[var(--gf-text)]">
              Study Session Completed!
            </h3>
            <p className="text-xs text-[var(--gf-muted)] mt-1">
              You recorded <strong className="text-[var(--gf-primary)]">{Math.round(completedSecondsToSave / 60)} minutes</strong> of focused work for {currentModule?.name || 'your studies'}.
            </p>

            {/* Reflection Note Input */}
            <div className="my-4 text-left">
              <label className="block text-xs font-bold text-[var(--gf-text)] mb-1">
                Session Reflection / Accomplishments
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Completed problem set, reviewed chapter 4 notes..."
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                className="w-full p-3 rounded-2xl bg-[var(--gf-tint)] border border-[var(--gf-border)] text-xs text-[var(--gf-text)] focus:outline-none focus:ring-2 focus:ring-[var(--gf-primary)]"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setIsCompletionModalOpen(false);
                  handleResetTimer();
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--gf-muted)] hover:bg-[var(--gf-tint)]"
              >
                Discard
              </button>
              <button
                onClick={handleSaveCompletedSession}
                className="gf-3d-button px-6 py-2.5 text-xs font-bold text-white shadow-md cursor-pointer"
              >
                Save to Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
