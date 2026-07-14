import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Subject } from '../types';
import { X, Plus, Sparkles } from 'lucide-react';
import { getColorClasses } from '../data';

interface AddSubjectModalProps {
  onClose: () => void;
  onAdd: (subject: Omit<Subject, 'id'>) => void;
}

const COLORS = ['indigo', 'emerald', 'violet', 'amber', 'rose', 'sky'];

export const AddSubjectModal: React.FC<AddSubjectModalProps> = ({
  onClose,
  onAdd,
}) => {
  const [name, setName] = useState('');
  const [targetHours, setTargetHours] = useState<number>(4);
  const [selectedColor, setSelectedColor] = useState('indigo');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Subject name is required.');
      return;
    }

    if (targetHours <= 0) {
      setError('Weekly study target must be at least 1 hour.');
      return;
    }

    if (targetHours > 80) {
      setError('Are you sure? Target hours cannot exceed 80 hours per week.');
      return;
    }

    onAdd({
      name: name.trim(),
      targetHours,
      color: selectedColor,
    });
    onClose();
  };

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
            <Sparkles className="w-5 h-5 text-indigo-500" />
            Add New Subject
          </h3>
          <button
            id="btn-close-add-subject-modal"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 px-3.5 py-2.5 rounded-xl border border-rose-100 dark:border-rose-900/30">
              {error}
            </div>
          )}

          {/* Subject Name Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="input-subject-name"
              className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase"
            >
              Subject Name
            </label>
            <input
              id="input-subject-name"
              type="text"
              required
              placeholder="e.g. Molecular Biology, Calculus II"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950/40 focus:border-indigo-400 dark:focus:border-indigo-800 transition-all text-slate-800 dark:text-slate-200"
            />
          </div>

          {/* Weekly Target Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="input-subject-target"
              className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase"
            >
              Weekly Target (Hours)
            </label>
            <div className="flex items-center gap-3">
              <input
                id="input-subject-target"
                type="number"
                min="1"
                max="80"
                required
                value={targetHours || ''}
                onChange={(e) => setTargetHours(parseInt(e.target.value) || 0)}
                className="w-24 px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950/40 focus:border-indigo-400 dark:focus:border-indigo-800 transition-all text-slate-800 dark:text-slate-200"
              />
              <span className="text-xs text-slate-400 dark:text-slate-500">
                Recommended: 3 – 12 hours depending on difficulty.
              </span>
            </div>
          </div>

          {/* Color Selector */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase block">
              Color Theme
            </span>
            <div className="flex items-center gap-3.5">
              {COLORS.map((color) => {
                const colorMeta = getColorClasses(color);
                const isSelected = selectedColor === color;

                return (
                  <button
                    key={color}
                    id={`btn-select-color-${color}`}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full ${colorMeta.fill} relative flex items-center justify-center transition-transform hover:scale-110 focus:outline-none`}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="activeColorBorder"
                        className="absolute -inset-1.5 rounded-full border-2 border-indigo-500 dark:border-indigo-400"
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50 dark:border-slate-800">
            <button
              id="btn-cancel-add-subject"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-submit-add-subject"
              type="submit"
              className="flex items-center gap-1 px-4.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Create Subject
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
