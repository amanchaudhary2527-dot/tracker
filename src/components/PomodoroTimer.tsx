import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Subject, StudySession } from '../types';
import { Play, Pause, RotateCcw, Timer, Coffee, Check, Bell, BellOff, Volume2 } from 'lucide-react';
import { getColorClasses } from '../data';

interface PomodoroTimerProps {
  subjects: Subject[];
  onLogSession: (session: Omit<StudySession, 'id'>) => void;
}

type TimerMode = 'study' | 'short' | 'long';

const MODE_PRESETS: Record<TimerMode, { label: string; minutes: number; icon: React.ReactNode }> = {
  study: { label: 'Study Focus', minutes: 25, icon: <Timer className="w-4 h-4" /> },
  short: { label: 'Short Break', minutes: 5, icon: <Coffee className="w-4 h-4" /> },
  long: { label: 'Long Break', minutes: 15, icon: <Coffee className="w-4 h-4" /> },
};

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ subjects, onLogSession }) => {
  const [mode, setMode] = useState<TimerMode>('study');
  const [secondsRemaining, setSecondsRemaining] = useState(MODE_PRESETS.study.minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Default selection to first subject if available and none selected
  useEffect(() => {
    if (subjects.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [subjects, selectedSubjectId]);

  // Reset timer when changing mode
  useEffect(() => {
    setIsRunning(false);
    setSecondsRemaining(MODE_PRESETS[mode].minutes * 60);
    setSessionCompleted(false);
  }, [mode]);

  // Handle timer tick countdown
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, mode, selectedSubjectId]);

  // Gentle native beep synth using Web Audio API (no external file dependencies)
  const playCompletionSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Chime note 1
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      gain1.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start();
      osc1.stop(audioCtx.currentTime + 0.4);

      // Chime note 2
      setTimeout(() => {
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
        gain2.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.start();
        osc2.stop(audioCtx.currentTime + 0.4);
      }, 150);

      // Chime note 3
      setTimeout(() => {
        const osc3 = audioCtx.createOscillator();
        const gain3 = audioCtx.createGain();
        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(783.99, audioCtx.currentTime); // G5
        gain3.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain3.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
        osc3.connect(gain3);
        gain3.connect(audioCtx.destination);
        osc3.start();
        osc3.stop(audioCtx.currentTime + 0.6);
      }, 300);
    } catch (e) {
      console.warn('Web Audio API not supported or blocked by user gesture:', e);
    }
  };

  const handleTimerComplete = () => {
    setIsRunning(false);
    playCompletionSound();
    setSessionCompleted(true);

    // If it was a study session and a subject is selected, automatically log it!
    if (mode === 'study' && selectedSubjectId) {
      const minutesLog = MODE_PRESETS.study.minutes;
      const todayStr = new Date().toISOString().split('T')[0];
      
      onLogSession({
        subjectId: selectedSubjectId,
        duration: minutesLog,
        date: todayStr,
        notes: '🏆 Automatically logged via completed Pomodoro Focus session.',
      });
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
    setSessionCompleted(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSecondsRemaining(MODE_PRESETS[mode].minutes * 60);
    setSessionCompleted(false);
  };

  // UI calculations
  const totalDurationSeconds = MODE_PRESETS[mode].minutes * 60;
  const progressRatio = secondsRemaining / totalDurationSeconds;
  const minutesDisplay = Math.floor(secondsRemaining / 60);
  const secondsDisplay = secondsRemaining % 60;
  const formattedTime = `${minutesDisplay.toString().padStart(2, '0')}:${secondsDisplay
    .toString()
    .padStart(2, '0')}`;

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId);
  const currentSubjectColor = currentSubject ? getColorClasses(currentSubject.color) : getColorClasses('indigo');

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-900 dark:text-white flex items-center gap-2">
            <Timer className="w-5 h-5 text-indigo-500" />
            Pomodoro Timer
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Focus deeply with structured intervals
          </p>
        </div>

        {/* Toggle Sound */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-2 rounded-xl border transition-all ${
            soundEnabled
              ? 'bg-slate-50 dark:bg-slate-800 text-indigo-500 border-slate-100 dark:border-slate-800'
              : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800'
          }`}
          title={soundEnabled ? 'Mute alarm chime' : 'Unmute alarm chime'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
        </button>
      </div>

      {/* Mode Selectors */}
      <div className="grid grid-cols-3 gap-1 bg-slate-50 dark:bg-slate-950/40 p-1 rounded-xl mb-6 border border-slate-100/50 dark:border-slate-800/60">
        {(Object.keys(MODE_PRESETS) as TimerMode[]).map((m) => {
          const isActive = mode === m;
          return (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
                isActive
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {MODE_PRESETS[m].icon}
              <span>{MODE_PRESETS[m].label}</span>
            </button>
          );
        })}
      </div>

      {/* Timer Circular Display */}
      <div className="flex flex-col items-center justify-center py-6">
        <div className="relative w-48 h-48 flex items-center justify-center">
          {/* Circular progress track */}
          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="84"
              className="stroke-slate-100 dark:stroke-slate-800"
              strokeWidth="6"
              fill="transparent"
            />
            <motion.circle
              cx="96"
              cy="96"
              r="84"
              className={mode === 'study' ? currentSubjectColor.accentText + ' stroke-current' : 'text-indigo-500 stroke-current'}
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 84}
              animate={{
                strokeDashoffset: 2 * Math.PI * 84 * (1 - progressRatio),
              }}
              transition={{ duration: 0.5, ease: 'linear' }}
              strokeLinecap="round"
            />
          </svg>

          {/* Time digits */}
          <div className="text-center z-10">
            <motion.div
              key={formattedTime}
              initial={{ scale: 0.96, opacity: 0.9 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-4xl font-extrabold font-mono text-slate-800 dark:text-white tracking-tight"
            >
              {formattedTime}
            </motion.div>
            <p className="text-3xs font-bold uppercase tracking-wider text-slate-400 mt-1">
              {mode === 'study' ? 'Keep Focus' : 'Take a breath'}
            </p>
          </div>
        </div>
      </div>

      {/* Subject selector for STUDY mode */}
      <AnimatePresence>
        {mode === 'study' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-1.5 mb-6 overflow-hidden"
          >
            <label className="text-2xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Study Target Subject
            </label>
            {subjects.length === 0 ? (
              <p className="text-xs text-rose-500 font-medium">Add a subject first to auto-log your session.</p>
            ) : (
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/45 border border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} ({sub.targetHours}h/wk)
                  </option>
                ))}
              </select>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Playback controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={resetTimer}
          className="p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 rounded-xl transition-all border border-slate-100/55 dark:border-slate-800"
          title="Reset timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={toggleTimer}
          className={`flex-1 py-3 px-6 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm ${
            isRunning
              ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100/60 dark:shadow-none'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span>Pause Focus</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Start {MODE_PRESETS[mode].label}</span>
            </>
          )}
        </button>
      </div>

      {/* Completion auto-log banner */}
      <AnimatePresence>
        {sessionCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-5 p-3.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 border border-emerald-100/60 dark:border-emerald-900/40 rounded-xl text-xs font-semibold flex items-start gap-2.5"
          >
            <Check className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            <div>
              <p>Session Completed!</p>
              {mode === 'study' && currentSubject ? (
                <p className="font-normal text-3xs text-emerald-600 dark:text-emerald-400/85 mt-0.5">
                  Logged {MODE_PRESETS.study.minutes} mins to "{currentSubject.name}". Great job!
                </p>
              ) : (
                <p className="font-normal text-3xs text-emerald-600 dark:text-emerald-400/85 mt-0.5">
                  Break finished. Ready to focus again?
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
