import React, { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const FocusView: React.FC = () => {
  const {
    modules,
    addStudySession,
    studySessions,
    focusTimerAutoModuleId,
    setFocusTimerAutoModuleId,
    setActiveTab,
  } = useApp();

  const [mode, setMode] = useState<SessionType>('pomodoro');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  const [timerDurationMinutes, setTimerDurationMinutes] = useState<number>(25);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(25 * 60);
  const [stopwatchSeconds, setStopwatchSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [ambientSound, setAmbientSound] = useState<'none' | 'pink_noise' | 'rain' | 'binaural'>('none');
  const [sessionNotes, setSessionNotes] = useState<string>('');
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState<boolean>(false);
  const [completedSecondsToSave, setCompletedSecondsToSave] = useState<number>(0);
  const [customMinutesInput, setCustomMinutesInput] = useState<string>('');

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync auto module selection if passed from another view
  useEffect(() => {
    if (focusTimerAutoModuleId) {
      setSelectedModuleId(focusTimerAutoModuleId);
      setFocusTimerAutoModuleId(null);
    } else if (modules.length > 0 && !selectedModuleId) {
      setSelectedModuleId(modules[0].id);
    }
  }, [focusTimerAutoModuleId, modules, selectedModuleId, setFocusTimerAutoModuleId]);

  // Mode changes
  const switchMode = (newMode: SessionType) => {
    setIsRunning(false);
    setMode(newMode);
    if (newMode === 'pomodoro') {
      setTimerDurationMinutes(25);
      setTimeLeftSeconds(25 * 60);
    } else if (newMode === 'timer') {
      setTimerDurationMinutes(45);
      setTimeLeftSeconds(45 * 60);
    } else {
      setStopwatchSeconds(0);
    }
  };

  // Timer Tick Engine
  useEffect(() => {
    if (isRunning) {
      timerIntervalRef.current = setInterval(() => {
        if (mode === 'stopwatch') {
          setStopwatchSeconds((prev) => prev + 1);
        } else {
          setTimeLeftSeconds((prev) => {
            if (prev <= 1) {
              clearInterval(timerIntervalRef.current as NodeJS.Timeout);
              setIsRunning(false);
              soundEngine.playChime(true);
              const durationSecs = timerDurationMinutes * 60;
              setCompletedSecondsToSave(durationSecs);
              setIsCompletionModalOpen(true);
              confetti({
                particleCount: 70,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#e91e8c', '#ff6ec7', '#ffd6ee'],
              });
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isRunning, mode, timerDurationMinutes]);

  // Handle ambient sound changes
  const handleAmbientChange = (type: 'none' | 'pink_noise' | 'rain' | 'binaural') => {
    setAmbientSound(type);
    soundEngine.toggleAmbientSound(type);
  };

  const handleToggleTimer = () => {
    soundEngine.playTick();
    setIsRunning(!isRunning);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    if (mode === 'stopwatch') {
      setStopwatchSeconds(0);
    } else {
      setTimeLeftSeconds(timerDurationMinutes * 60);
    }
  };

  const handleFinishEarly = () => {
    setIsRunning(false);
    const elapsedSeconds =
      mode === 'stopwatch'
        ? stopwatchSeconds
        : timerDurationMinutes * 60 - timeLeftSeconds;

    if (elapsedSeconds < 10) {
      handleResetTimer();
      return;
    }

    setCompletedSecondsToSave(elapsedSeconds);
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
    setTimerDurationMinutes(mins);
    setTimeLeftSeconds(mins * 60);
    setCustomMinutesInput('');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-[#ffd6ee] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#1e0f3e] tracking-tight">
              Focus Session
            </h1>
            <button
              onClick={() => setActiveTab('analytics')}
              className="w-8 h-8 rounded-full bg-[#fff0f8] text-[#e91e8c] flex items-center justify-center cursor-pointer hover:bg-[#ffd6ee] transition-colors"
              title="Study Analytics"
              aria-label="View study analytics"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <span className="ml-1 px-3 py-1 rounded-full text-white text-[11px] font-bold bg-gradient-to-br from-[#ff6ec7] to-[#e91e8c]">
              Today: {formatTodayTotal(todaySeconds)}
            </span>
          </div>
          <p className="text-xs text-[#7b5ea7] mt-1">
            Countdown timer, stopwatch, and ambient sound generator
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex bg-[#fff0f8] p-1 rounded-2xl border border-[#ffd6ee]">
          <button
            onClick={() => switchMode('pomodoro')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'pomodoro'
                ? 'bg-white text-[#e91e8c] shadow-xs'
                : 'text-[#7b5ea7] hover:text-[#e91e8c]'
            }`}
          >
            Pomodoro (25m)
          </button>
          <button
            onClick={() => switchMode('timer')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'timer'
                ? 'bg-white text-[#e91e8c] shadow-xs'
                : 'text-[#7b5ea7] hover:text-[#e91e8c]'
            }`}
          >
            Custom Timer
          </button>
          <button
            onClick={() => switchMode('stopwatch')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'stopwatch'
                ? 'bg-white text-[#e91e8c] shadow-xs'
                : 'text-[#7b5ea7] hover:text-[#e91e8c]'
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
          <div className="flex items-center gap-2 bg-[#fff0f8] border border-[#ffd6ee] rounded-full px-3.5 py-1.5 shadow-xs">
            <BookOpen className="w-4 h-4 text-[#e91e8c]" />
            <span className="text-xs font-bold text-[#7b5ea7]">Studying:</span>
            <select
              value={selectedModuleId}
              onChange={(e) => setSelectedModuleId(e.target.value)}
              className="bg-transparent text-xs font-extrabold text-[#1e0f3e] focus:outline-none cursor-pointer"
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
              stroke="#fff0f8"
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
                <stop offset="0%" stopColor="#ff6ec7" />
                <stop offset="100%" stopColor="#e91e8c" />
              </linearGradient>
            </defs>
          </svg>

          {/* Inner Content Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono-timer text-3xl sm:text-4xl font-bold text-[#1e0f3e] tracking-tight">
              {mode === 'stopwatch' ? formatHMS(stopwatchSeconds) : formatHMS(timeLeftSeconds)}
            </span>
            <span className="text-xs font-bold text-[#e91e8c] uppercase tracking-wider mt-2 flex items-center gap-1.5">
              {isRunning ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#e91e8c] animate-ping" />
                  In Flow Session
                </>
              ) : (
                'Session Paused'
              )}
            </span>
            {currentModule && (
              <span className="text-[11px] font-semibold text-[#7b5ea7] mt-1 max-w-[180px] truncate">
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
                      ? 'bg-[#e91e8c] border-[#e91e8c] text-white shadow-xs'
                      : 'bg-[#fff0f8] border-[#ffd6ee] text-[#1e0f3e] hover:bg-[#ffd6ee]/60'
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
                className="w-32 px-3 py-2 rounded-full text-xs font-bold text-[#1e0f3e] bg-[#fff0f8] border border-[#ffd6ee] focus:outline-none focus:ring-2 focus:ring-[#e91e8c] text-center"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-full text-xs font-bold text-white bg-[#e91e8c] cursor-pointer transition-all active:scale-95"
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
            className="p-3.5 rounded-2xl bg-[#fff0f8] border border-[#ffd6ee] text-[#7b5ea7] hover:text-[#e91e8c] transition-all cursor-pointer active:scale-95 shadow-xs"
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
                <span>{timeLeftSeconds === timerDurationMinutes * 60 ? 'Start Flow' : 'Resume'}</span>
              </>
            )}
          </button>

          <button
            onClick={handleFinishEarly}
            className="p-3.5 rounded-2xl bg-[#fff0f8] border border-[#ffd6ee] text-emerald-600 hover:bg-emerald-50 transition-all cursor-pointer active:scale-95 shadow-xs"
            title="Log & Complete Session"
          >
            <CheckCircle2 className="w-5 h-5" />
          </button>
        </div>

        {/* Ambient Sound Bar */}
        <div className="mt-8 pt-6 border-t border-[#ffd6ee]/60 w-full max-w-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#7b5ea7] uppercase tracking-wider flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-[#e91e8c]" />
              Focus Ambience Synth
            </span>
            <span className="text-[11px] text-[#e91e8c] font-semibold">
              {ambientSound === 'none' ? 'Muted' : ambientSound.replace('_', ' ')}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => handleAmbientChange('none')}
              className={`py-2 px-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                ambientSound === 'none'
                  ? 'bg-white border-[#e91e8c] text-[#e91e8c] ring-1 ring-[#e91e8c]'
                  : 'bg-[#fff0f8] border-[#ffd6ee] text-[#7b5ea7]'
              }`}
            >
              <VolumeX className="w-4 h-4" />
              <span>Off</span>
            </button>

            <button
              onClick={() => handleAmbientChange('pink_noise')}
              className={`py-2 px-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                ambientSound === 'pink_noise'
                  ? 'bg-[#e91e8c] border-[#e91e8c] text-white shadow-xs'
                  : 'bg-[#fff0f8] border-[#ffd6ee] text-[#7b5ea7]'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>Pink Noise</span>
            </button>

            <button
              onClick={() => handleAmbientChange('rain')}
              className={`py-2 px-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                ambientSound === 'rain'
                  ? 'bg-[#e91e8c] border-[#e91e8c] text-white shadow-xs'
                  : 'bg-[#fff0f8] border-[#ffd6ee] text-[#7b5ea7]'
              }`}
            >
              <CloudRain className="w-4 h-4" />
              <span>Rain Hiss</span>
            </button>

            <button
              onClick={() => handleAmbientChange('binaural')}
              className={`py-2 px-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                ambientSound === 'binaural'
                  ? 'bg-[#e91e8c] border-[#e91e8c] text-white shadow-xs'
                  : 'bg-[#fff0f8] border-[#ffd6ee] text-[#7b5ea7]'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Alpha Tone</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Study Sessions Ledger */}
      <div className="bg-white p-5 rounded-3xl border border-[#ffd6ee] shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#ffd6ee]/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#fff0f8] text-[#e91e8c] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#1e0f3e]">Recent Study Sessions</h3>
          </div>
          <span className="text-xs font-bold text-[#7b5ea7]">
            {studySessions.length} total logged
          </span>
        </div>

        <div className="mt-3 space-y-2.5">
          {studySessions.length === 0 ? (
            <div className="text-center py-6 text-xs text-[#7b5ea7]">
              No study sessions logged yet. Start the timer above!
            </div>
          ) : (
            studySessions.slice(0, 5).map((session) => {
              const mod = modules.find((m) => m.id === session.moduleId);
              const mins = Math.round(session.durationSeconds / 60);

              return (
                <div
                  key={session.id}
                  className="p-3 rounded-2xl bg-[#fff0f8] border border-[#ffd6ee] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center text-white font-extrabold text-[9px] leading-none tracking-tight text-center px-1 overflow-hidden shadow-xs"
                      style={{ backgroundColor: mod?.colour || '#e91e8c' }}
                    >
                      <span className="truncate w-full">{mod?.code || 'STUDY'}</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1e0f3e]">
                        {mod?.name || 'General Focus Session'}
                      </h4>
                      <div className="text-[11px] text-[#7b5ea7] mt-0.5">
                        <span className="capitalize">{session.sessionType}</span> • {new Date(session.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </div>
                      {session.notes && (
                        <p className="text-[11px] text-[#7b5ea7] italic mt-1">
                          "{session.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-extrabold text-[#e91e8c]">
                      {mins} mins
                    </span>
                    <span className="text-[10px] block font-semibold text-emerald-600">
                      Completed
                    </span>
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
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-[#ffd6ee] overflow-hidden p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ff6ec7] to-[#e91e8c] text-white flex items-center justify-center mx-auto shadow-md mb-3">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-extrabold text-[#1e0f3e]">
              Study Session Completed!
            </h3>
            <p className="text-xs text-[#7b5ea7] mt-1">
              You recorded <strong className="text-[#e91e8c]">{Math.round(completedSecondsToSave / 60)} minutes</strong> of focused work for {currentModule?.name || 'your studies'}.
            </p>

            {/* Reflection Note Input */}
            <div className="my-4 text-left">
              <label className="block text-xs font-bold text-[#1e0f3e] mb-1">
                Session Reflection / Accomplishments
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Completed problem set, reviewed chapter 4 notes..."
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                className="w-full p-3 rounded-2xl bg-[#fff0f8] border border-[#ffd6ee] text-xs text-[#1e0f3e] focus:outline-none focus:ring-2 focus:ring-[#e91e8c]"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setIsCompletionModalOpen(false);
                  handleResetTimer();
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#7b5ea7] hover:bg-[#fff0f8]"
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
