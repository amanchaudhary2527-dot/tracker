import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Subject, StudySession } from '../types';
import { getColorClasses } from '../data';
import { formatDuration } from './SubjectProgressList';
import { Calendar, Search, Filter, Trash2, Clock, FileText, ChevronDown, Download } from 'lucide-react';

interface SessionListProps {
  sessions: StudySession[];
  subjects: Subject[];
  onDeleteSession: (id: string) => void;
  onOpenLogSession: () => void;
}

export const formatDateLabel = (dateStr: string): string => {
  const today = new Date().toISOString().split('T')[0];
  const yesterdayObj = new Date();
  yesterdayObj.setDate(yesterdayObj.getDate() - 1);
  const yesterdayStr = yesterdayObj.toISOString().split('T')[0];

  if (dateStr === today) return 'Today';
  if (dateStr === yesterdayStr) return 'Yesterday';

  // Parse date and display formatted e.g. "Monday, Jul 13"
  // Appending T00:00:00 prevents timezone offset shifts
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const SessionList: React.FC<SessionListProps> = ({
  sessions,
  subjects,
  onDeleteSession,
  onOpenLogSession,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter sessions based on search & subject dropdown
  const filteredSessions = sessions.filter((sess) => {
    const matchesSubject =
      selectedSubjectId === 'all' || sess.subjectId === selectedSubjectId;
    const subject = subjects.find((s) => s.id === sess.subjectId);
    const subjectName = subject ? subject.name.toLowerCase() : '';
    const matchesSearch =
      sess.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subjectName.includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  // Sort sessions: newest date first, then newest ID (assuming newest created) first
  const sortedSessions = [...filteredSessions].sort((a, b) => {
    if (a.date !== b.date) {
      return b.date.localeCompare(a.date);
    }
    return b.id.localeCompare(a.id);
  });

  // Group sorted sessions by date
  const groupedSessions: { [date: string]: StudySession[] } = {};
  sortedSessions.forEach((sess) => {
    if (!groupedSessions[sess.date]) {
      groupedSessions[sess.date] = [];
    }
    groupedSessions[sess.date].push(sess);
  });

  const handleExportCSV = () => {
    if (sortedSessions.length === 0) return;

    const headers = ['Session ID', 'Date', 'Subject Name', 'Duration (Minutes)', 'Duration (Formatted)', 'Notes'];
    
    const rows = sortedSessions.map((sess) => {
      const subject = subjects.find((s) => s.id === sess.subjectId);
      const subjectName = subject ? subject.name : 'Unknown Subject';
      
      const escapedSubjectName = `"${subjectName.replace(/"/g, '""')}"`;
      const escapedNotes = sess.notes ? `"${sess.notes.replace(/"/g, '""')}"` : '""';
      
      return [
        sess.id,
        sess.date,
        escapedSubjectName,
        sess.duration,
        `"${formatDuration(sess.duration)}"`,
        escapedNotes,
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `study_sessions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-500" />
            Recent Study Sessions
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse, search, and manage your logged study history
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-export-csv"
            onClick={handleExportCSV}
            disabled={sortedSessions.length === 0}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-100 dark:border-slate-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            title="Export filtered/all sessions to CSV"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>

          <button
            id="btn-log-session-trigger"
            onClick={onOpenLogSession}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all duration-200 shadow-sm shadow-indigo-100 dark:shadow-none"
          >
            <Clock className="w-4 h-4" />
            Log Study Session
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="input-session-search"
            type="text"
            placeholder="Search notes or subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950/40 focus:border-indigo-400 dark:focus:border-indigo-800 transition-all duration-200 text-slate-800 dark:text-slate-200"
          />
        </div>

        <div className="relative min-w-[180px]">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            id="select-subject-filter"
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full pl-10 pr-8 py-2 text-sm bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950/40 focus:border-indigo-400 dark:focus:border-indigo-800 transition-all duration-200 text-slate-700 dark:text-slate-200 appearance-none cursor-pointer"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Sessions list grouped by Date */}
      <div className="space-y-6">
        {Object.keys(groupedSessions).length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30">
            <Clock className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              No sessions found
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
              {searchQuery || selectedSubjectId !== 'all'
                ? "Try adjusting your search query or subject filters to find what you're looking for."
                : "No sessions logged yet. Tap the button above to log your first study session!"}
            </p>
          </div>
        ) : (
          Object.keys(groupedSessions).map((date) => (
            <div key={date} className="relative pl-4 border-l border-slate-100 dark:border-slate-800">
              {/* Date Marker Pin */}
              <div className="absolute -left-[4.5px] top-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-slate-900" />
              
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                {formatDateLabel(date)}
              </h3>

              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {groupedSessions[date].map((sess) => {
                    const subject = subjects.find((s) => s.id === sess.subjectId);
                    const subjectName = subject ? subject.name : 'Unknown Subject';
                    const colorMeta = getColorClasses(subject ? subject.color : 'sky');

                    return (
                      <motion.div
                        key={sess.id}
                        id={`session-card-${sess.id}`}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 12 }}
                        transition={{ duration: 0.2 }}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50/60 hover:bg-slate-50 dark:bg-slate-900/50 dark:hover:bg-slate-800/30 border border-slate-50 dark:border-slate-800/40 rounded-xl transition-all duration-200"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span
                              className={`text-2xs font-semibold px-2 py-0.5 rounded-md border ${colorMeta.bg} ${colorMeta.text} ${colorMeta.border}`}
                            >
                              {subjectName}
                            </span>
                            <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500 text-xs">
                              <Clock className="w-3.5 h-3.5" />
                              {formatDuration(sess.duration)}
                            </span>
                          </div>
                          
                          {sess.notes ? (
                            <p className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                              <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                              <span className="break-words">{sess.notes}</span>
                            </p>
                          ) : (
                            <p className="text-sm text-slate-400 dark:text-slate-600 italic">
                              No notes added for this session.
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-end sm:self-center shrink-0">
                          <button
                            id={`btn-delete-session-${sess.id}`}
                            onClick={() => onDeleteSession(sess.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 dark:text-slate-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all duration-150"
                            title="Delete session"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
