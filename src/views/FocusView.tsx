import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { SessionType } from '../types';
import { soundEngine } from '../utils/audioSynth';
import {
  Timer,
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
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const FocusView: React.FC = () => {
  const {
    modules,
    addStudySession,
    studySessions,
    focusTimerAutoModuleId,
    setFocusTimerAutoModuleId,
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
                colors: ['#dd2987', '#ec68a0', '#f6b9d5'],
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

  // Format time helpers
  const formatSeconds = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatHoursMinutes = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalTimeForTimer = timerDurationMinutes * 60;
  const progressPercent =
    mode === 'stopwatch'
      ? 100
      : Math.min(100, Math.max(0, ((totalTimeForTimer - timeLeftSeconds) / totalTimeForTimer) * 100));

  const currentModule = modules.find((m) => m.id === selectedModuleId);

  return (
    <div className="space-y-5 pb-24 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 border border-[#f6b9d5]/60 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#fdedf5] text-[#dd2987] flex items-center justify-center">
              <Timer className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#2c1228] tracking-tight">
              Focus & Study Sessions
            </h1>
          </div>
          <p className="text-xs text-[#7a5672] mt-1">
            Countdown timer, stopwatch, and ambient sound generator
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex bg-[#fdedf5] p-1 border border-[#f6b9d5]/60">
          <button
            onClick={() => switchMode('pomodoro')}
            className={`px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              mode === 'pomodoro'
                ? 'bg-white text-[#dd2987] shadow-xs'
                : 'text-[#7a5672] hover:text-[#dd2987]'
            }`}
          >
            Pomodoro (25m)
          </button>
          <button
            onClick={() => switchMode('timer')}
            className={`px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              mode === 'timer'
                ? 'bg-white text-[#dd2987] shadow-xs'
                : 'text-[#7a5672] hover:text-[#dd2987]'
            }`}
          >
            Custom Timer
          </button>
          <button
            onClick={() => switchMode('stopwatch')}
            className={`px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              mode === 'stopwatch'
                ? 'bg-white text-[#dd2987] shadow-xs'
                : 'text-[#7a5672] hover:text-[#dd2987]'
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
          <div className="flex items-center gap-2 bg-[#fff7fb] border border-[#f6b9d5] px-3.5 py-1.5 shadow-xs">
            <BookOpen className="w-4 h-4 text-[#dd2987]" />
            <span className="text-xs font-bold text-[#7a5672]">Studying:</span>
            <select
              value={selectedModuleId}
              onChange={(e) => setSelectedModuleId(e.target.value)}
              className="bg-transparent text-xs font-extrabold text-[#2c1228] focus:outline-none cursor-pointer"
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
              stroke="#fdedf5"
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
              strokeLinecap="square"
              fill="transparent"
              className="transition-all duration-500"
            />
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ec68a0" />
                <stop offset="100%" stopColor="#dd2987" />
              </linearGradient>
            </defs>
          </svg>

          {/* Inner Content Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl sm:text-5xl font-extrabold text-[#2c1228] tracking-tight font-heading">
              {mode === 'stopwatch' ? formatHoursMinutes(stopwatchSeconds) : formatSeconds(timeLeftSeconds)}
            </span>
            <span className="text-xs font-bold text-[#dd2987] uppercase tracking-wider mt-2 flex items-center gap-1.5">
              {isRunning ? (
                <>
                  <span className="w-2 h-2 bg-[#dd2987] animate-ping" />
                  In Flow Session
                </>
              ) : (
                'Session Paused'
              )}
            </span>
            {currentModule && (
              <span className="text-[11px] font-semibold text-[#7a5672] mt-1 max-w-[180px] truncate">
                {currentModule.name}
              </span>
            )}
          </div>
        </div>

        {/* Duration preset buttons for Custom Timer */}
        {mode === 'timer' && !isRunning && (
          <div className="flex flex-wrap gap-2 my-4">
            {[15, 30, 45, 60, 90].map((mins) => (
              <button
                key={mins}
                onClick={() => {
                  setTimerDurationMinutes(mins);
                  setTimeLeftSeconds(mins * 60);
                }}
                className={`px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                  timerDurationMinutes === mins
                    ? 'bg-[#dd2987] text-white shadow-xs'
                    : 'bg-[#fdedf5] text-[#6b4c62] hover:bg-[#f6b9d5]/60'
                }`}
              >
                {mins} min
              </button>
            ))}
          </div>
        )}

        {/* Primary Controls */}
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={handleResetTimer}
            className="p-3.5 bg-[#fff7fb] border border-[#f6b9d5] text-[#7a5672] hover:text-[#dd2987] transition-all cursor-pointer active:scale-95 shadow-xs"
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
            className="p-3.5 bg-[#fff7fb] border border-[#f6b9d5] text-emerald-600 hover:bg-emerald-50 transition-all cursor-pointer active:scale-95 shadow-xs"
            title="Log & Complete Session"
          >
            <CheckCircle2 className="w-5 h-5" />
          </button>
        </div>

        {/* Ambient Sound Bar */}
        <div className="mt-8 pt-6 border-t border-[#f6b9d5]/40 w-full max-w-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#7a5672] uppercase tracking-wider flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-[#dd2987]" />
              Focus Ambience Synth
            </span>
            <span className="text-[11px] text-[#dd2987] font-semibold">
              {ambientSound === 'none' ? 'Muted' : ambientSound.replace('_', ' ')}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => handleAmbientChange('none')}
              className={`py-2 px-2 text-xs font-bold border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                ambientSound === 'none'
                  ? 'bg-white border-[#dd2987] text-[#dd2987] ring-1 ring-[#dd2987]'
                  : 'bg-[#fff7fb] border-[#f6b9d5]/50 text-[#7a5672]'
              }`}
            >
              <VolumeX className="w-4 h-4" />
              <span>Off</span>
            </button>

            <button
              onClick={() => handleAmbientChange('pink_noise')}
              className={`py-2 px-2 text-xs font-bold border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                ambientSound === 'pink_noise'
                  ? 'bg-[#dd2987] border-[#dd2987] text-white shadow-xs'
                  : 'bg-[#fff7fb] border-[#f6b9d5]/50 text-[#7a5672]'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>Pink Noise</span>
            </button>

            <button
              onClick={() => handleAmbientChange('rain')}
              className={`py-2 px-2 text-xs font-bold border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                ambientSound === 'rain'
                  ? 'bg-[#dd2987] border-[#dd2987] text-white shadow-xs'
                  : 'bg-[#fff7fb] border-[#f6b9d5]/50 text-[#7a5672]'
              }`}
            >
              <CloudRain className="w-4 h-4" />
              <span>Rain Hiss</span>
            </button>

            <button
              onClick={() => handleAmbientChange('binaural')}
              className={`py-2 px-2 text-xs font-bold border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                ambientSound === 'binaural'
                  ? 'bg-[#dd2987] border-[#dd2987] text-white shadow-xs'
                  : 'bg-[#fff7fb] border-[#f6b9d5]/50 text-[#7a5672]'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Alpha Tone</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Study Sessions Ledger */}
      <div className="bg-white p-5 border border-[#f6b9d5]/60 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#f6b9d5]/40">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#fdedf5] text-[#dd2987] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#2c1228]">Recent Study Sessions</h3>
          </div>
          <span className="text-xs font-bold text-[#7a5672]">
            {studySessions.length} total logged
          </span>
        </div>

        <div className="mt-3 space-y-2.5">
          {studySessions.length === 0 ? (
            <div className="text-center py-6 text-xs text-[#7a5672]">
              No study sessions logged yet. Start the timer above!
            </div>
          ) : (
            studySessions.slice(0, 5).map((session) => {
              const mod = modules.find((m) => m.id === session.moduleId);
              const mins = Math.round(session.durationSeconds / 60);

              return (
                <div
                  key={session.id}
                  className="p-3 bg-[#fff7fb] border border-[#f6b9d5]/60 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 flex items-center justify-center text-white font-bold text-xs shadow-xs"
                      style={{ backgroundColor: mod?.colour || '#dd2987' }}
                    >
                      {mod?.code || 'STUDY'}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#2c1228]">
                        {mod?.name || 'General Focus Session'}
                      </h4>
                      <div className="text-[11px] text-[#7a5672] mt-0.5">
                        <span className="capitalize">{session.sessionType}</span> • {new Date(session.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </div>
                      {session.notes && (
                        <p className="text-[11px] text-[#6b4c62] italic mt-1">
                          "{session.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-extrabold text-[#dd2987]">
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
          <div className="bg-white w-full max-w-md shadow-2xl border border-[#f6b9d5] overflow-hidden p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-[#ec68a0] to-[#dd2987] text-white flex items-center justify-center mx-auto shadow-md mb-3">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-extrabold text-[#2c1228]">
              Study Session Completed!
            </h3>
            <p className="text-xs text-[#7a5672] mt-1">
              You recorded <strong className="text-[#dd2987]">{Math.round(completedSecondsToSave / 60)} minutes</strong> of focused work for {currentModule?.name || 'your studies'}.
            </p>

            {/* Reflection Note Input */}
            <div className="my-4 text-left">
              <label className="block text-xs font-bold text-[#2c1228] mb-1">
                Session Reflection / Accomplishments
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Completed problem set, reviewed chapter 4 notes..."
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                className="w-full p-3 bg-[#fdedf5]/40 border border-[#f6b9d5] text-xs text-[#2c1228] focus:outline-none focus:ring-2 focus:ring-[#dd2987]"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setIsCompletionModalOpen(false);
                  handleResetTimer();
                }}
                className="px-4 py-2 text-xs font-bold text-[#7a5672] hover:bg-[#fdedf5]"
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
