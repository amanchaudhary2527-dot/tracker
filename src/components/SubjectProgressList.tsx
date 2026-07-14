import React from 'react';
import { motion } from 'motion/react';
import { Subject, StudySession } from '../types';
import { getColorClasses, getMondayDateString } from '../data';
import { BookOpen, Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface SubjectProgressListProps {
  subjects: Subject[];
  sessions: StudySession[];
  onOpenAddSubject: () => void;
  onDeleteSubject: (id: string) => void;
}

export const formatDuration = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
};

export const SubjectProgressList: React.FC<SubjectProgressListProps> = ({
  subjects,
  sessions,
  onOpenAddSubject,
  onDeleteSubject,
}) => {
  const currentMonday = getMondayDateString();

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            Subject Progress
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track your weekly study targets (Monday – Sunday)
          </p>
        </div>
        <button
          id="btn-add-subject-trigger"
          onClick={onOpenAddSubject}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-xl transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Add Subject
        </button>
      </div>

      <div className="space-y-5">
        {subjects.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
            <p className="text-sm text-slate-400 dark:text-slate-500">
              No subjects added yet. Add one to start tracking.
            </p>
          </div>
        ) : (
          subjects.map((sub) => {
            // Filter sessions of this week
            const subSessionsThisWeek = sessions.filter(
              (sess) => sess.subjectId === sub.id && sess.date >= currentMonday
            );
            const minutesStudied = subSessionsThisWeek.reduce(
              (sum, sess) => sum + sess.duration,
              0
            );
            const targetMinutes = sub.targetHours * 60;
            const progressPct = targetMinutes > 0 ? (minutesStudied / targetMinutes) * 100 : 0;
            const isCompleted = progressPct >= 100;
            const colorMeta = getColorClasses(sub.color);

            return (
              <div
                key={sub.id}
                id={`subject-row-${sub.id}`}
                className="group relative border border-slate-50 dark:border-slate-800/40 hover:border-slate-100 dark:hover:border-slate-800 rounded-xl p-4 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${colorMeta.fill}`}
                    />
                    <div>
                      <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                        {sub.name}
                      </h4>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        Target: {sub.targetHours}h per week
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                        {formatDuration(minutesStudied)}
                      </span>
                      <span className="text-slate-400 dark:text-slate-500 text-xs">
                        {' '}
                        / {sub.targetHours}h
                      </span>
                    </div>

                    {isCompleted ? (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Done
                      </span>
                    ) : (
                      <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold bg-slate-50 dark:bg-slate-800/50 px-2 py-0.5 rounded-md">
                        {Math.round(progressPct)}%
                      </span>
                    )}

                    <button
                      id={`btn-delete-subject-${sub.id}`}
                      onClick={() => onDeleteSubject(sub.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-500 dark:hover:text-rose-400 text-slate-400 dark:text-slate-600 transition-all duration-150"
                      title="Delete subject and its sessions"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar Container */}
                <div className="h-2 w-full bg-slate-50 dark:bg-slate-800/80 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progressPct, 100)}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full ${colorMeta.fill} ${
                      isCompleted ? 'bg-gradient-to-r ' + colorMeta.gradient : ''
                    }`}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
