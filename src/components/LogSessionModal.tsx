import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Subject, StudySession } from '../types';
import { X, Clock, Calendar, FileText, Check } from 'lucide-react';

interface LogSessionModalProps {
  subjects: Subject[];
  onClose: () => void;
  onAdd: (session: Omit<StudySession, 'id'>) => void;
  onOpenAddSubject: () => void;
}

export const LogSessionModal: React.FC<LogSessionModalProps> = ({
  subjects,
  onClose,
  onAdd,
  onOpenAddSubject,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [duration, setDuration] = useState<number>(60);
  const [date, setDate] = useState<string>(todayStr);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleQuickAddDuration = (mins: number) => {
    setDuration((prev) => Math.max(0, prev + mins));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!subjectId) {
      setError('Please select a subject.');
      return;
    }

    if (duration <= 0) {
      setError('Study duration must be greater than 0 minutes.');
      return;
    }

    if (duration > 1440) {
      setError('Study duration cannot exceed 24 hours (1440 minutes) in a single session.');
      return;
    }

    if (!date) {
      setError('Please select a date.');
      return;
    }

    // Ensure they don't log future study sessions
    if (date > todayStr) {
      setError('You cannot log study sessions for future dates.');
      return;
    }

    onAdd({
      subjectId,
      duration,
      date,
      notes: notes.trim(),
    });
    onClose();
  };

  // If no subjects, guide the user to create one
  if (subjects.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xl text-center z-10"
        >
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-100 dark:border-indigo-900/40">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Create a Subject First
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-xs mx-auto">
            You need to add at least one subject to your portal before you can log study sessions for it.
          </p>
          <div className="flex flex-col gap-2 mt-6">
            <button
              id="btn-trigger-add-subject-from-log"
              onClick={() => {
                onClose();
                onOpenAddSubject();
              }}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all duration-200"
            >
              Add Your First Subject
            </button>
            <button
              id="btn-cancel-no-subjects"
              onClick={onClose}
              className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl transition-all"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-10"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 dark:border-slate-800">
          <h3 className="font-bold font-sans text-slate-900 dark:text-white text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            Log Study Session
          </h3>
          <button
            id="btn-close-log-session-modal"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4.5">
          {error && (
            <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 px-3.5 py-2.5 rounded-xl border border-rose-100 dark:border-rose-900/30">
              {error}
            </div>
          )}

          {/* Subject Selector */}
          <div className="space-y-1.5">
            <label
              htmlFor="select-log-subject"
              className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase"
            >
              Subject
            </label>
            <select
              id="select-log-subject"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950/40 focus:border-indigo-400 dark:focus:border-indigo-800 transition-all text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Duration in Minutes */}
          <div className="space-y-1.5">
            <label
              htmlFor="input-log-duration"
              className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase"
            >
              Study Duration
            </label>
            <div className="flex items-center gap-3">
              <input
                id="input-log-duration"
                type="number"
                min="1"
                max="1440"
                required
                value={duration || ''}
                onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                className="w-28 px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950/40 focus:border-indigo-400 dark:focus:border-indigo-800 transition-all text-slate-800 dark:text-slate-200"
              />
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                minutes
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                ({(duration / 60).toFixed(1)} hrs)
              </span>
            </div>

            {/* Quick selectors */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <button
                id="btn-duration-add-15"
                type="button"
                onClick={() => handleQuickAddDuration(15)}
                className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800 text-2xs font-semibold text-slate-600 dark:text-slate-300 rounded-lg transition-colors border border-slate-100/50 dark:border-slate-800/40"
              >
                +15m
              </button>
              <button
                id="btn-duration-add-30"
                type="button"
                onClick={() => handleQuickAddDuration(30)}
                className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800 text-2xs font-semibold text-slate-600 dark:text-slate-300 rounded-lg transition-colors border border-slate-100/50 dark:border-slate-800/40"
              >
                +30m
              </button>
              <button
                id="btn-duration-add-60"
                type="button"
                onClick={() => handleQuickAddDuration(60)}
                className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800 text-2xs font-semibold text-slate-600 dark:text-slate-300 rounded-lg transition-colors border border-slate-100/50 dark:border-slate-800/40"
              >
                +1h
              </button>
              <button
                id="btn-duration-subtract-15"
                type="button"
                onClick={() => handleQuickAddDuration(-15)}
                disabled={duration <= 15}
                className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800 text-2xs font-semibold text-slate-600 dark:text-slate-300 rounded-lg transition-colors border border-slate-100/50 dark:border-slate-800/40 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                -15m
              </button>
              <button
                id="btn-duration-reset"
                type="button"
                onClick={() => setDuration(60)}
                className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800 text-2xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg transition-colors border border-slate-100/50 dark:border-slate-800/40"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Date Picker */}
          <div className="space-y-1.5">
            <label
              htmlFor="input-log-date"
              className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase"
            >
              Session Date
            </label>
            <div className="relative">
              <input
                id="input-log-date"
                type="date"
                required
                max={todayStr}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950/40 focus:border-indigo-400 dark:focus:border-indigo-800 transition-all text-slate-800 dark:text-slate-200 cursor-pointer"
              />
            </div>
          </div>

          {/* Notes Textarea */}
          <div className="space-y-1.5">
            <label
              htmlFor="textarea-log-notes"
              className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase"
            >
              What did you cover?
            </label>
            <textarea
              id="textarea-log-notes"
              placeholder="e.g. Practiced active recall on glycolysis steps, did past paper questions."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950/40 focus:border-indigo-400 dark:focus:border-indigo-800 transition-all text-slate-800 dark:text-slate-200 resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50 dark:border-slate-800">
            <button
              id="btn-cancel-log-session"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-submit-log-session"
              type="submit"
              className="flex items-center gap-1 px-4.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
            >
              <Check className="w-4 h-4" />
              Save Session
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
