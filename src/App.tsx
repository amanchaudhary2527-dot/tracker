/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Subject, StudySession } from './types';
import {
  INITIAL_SUBJECTS,
  INITIAL_SESSIONS,
  getMondayDateString,
} from './data';
import { MetricCard } from './components/MetricCard';
import { SubjectProgressList, formatDuration } from './components/SubjectProgressList';
import { SessionList } from './components/SessionList';
import { AddSubjectModal } from './components/AddSubjectModal';
import { LogSessionModal } from './components/LogSessionModal';
import { PomodoroTimer } from './components/PomodoroTimer';
import { AnimatePresence, motion } from 'motion/react';
import {
  Flame,
  Clock,
  BookOpen,
  Award,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Download,
  Crown,
} from 'lucide-react';

const STORAGE_SUBJECTS_KEY = 'study_tracker_subjects_v1';
const STORAGE_SESSIONS_KEY = 'study_tracker_sessions_v1';

export default function App() {
  // Load data from localStorage or default to initial sample data
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem(STORAGE_SUBJECTS_KEY);
    return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
  });

  const [sessions, setSessions] = useState<StudySession[]>(() => {
    const saved = localStorage.getItem(STORAGE_SESSIONS_KEY);
    return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
  });

  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isLogSessionOpen, setIsLogSessionOpen] = useState(false);

  // Sync state to localStorage on changes
  useEffect(() => {
    localStorage.setItem(STORAGE_SUBJECTS_KEY, JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_SESSIONS_KEY, JSON.stringify(sessions));
  }, [sessions]);

  // Handle adding a new subject
  const handleAddSubject = (newSub: Omit<Subject, 'id'>) => {
    const id = `sub-${Date.now()}`;
    const subject: Subject = { id, ...newSub };
    setSubjects((prev) => [...prev, subject]);
  };

  // Handle deleting a subject and all associated study sessions
  const handleDeleteSubject = (id: string) => {
    if (
      window.confirm(
        'Are you sure you want to delete this subject? All study sessions logged for it will be permanently removed as well.'
      )
    ) {
      setSubjects((prev) => prev.filter((s) => s.id !== id));
      setSessions((prev) => prev.filter((sess) => sess.subjectId !== id));
    }
  };

  // Handle logging a study session
  const handleLogSession = (newSess: Omit<StudySession, 'id'>) => {
    const id = `sess-${Date.now()}`;
    const session: StudySession = { id, ...newSess };
    setSessions((prev) => [session, ...prev]);
  };

  // Handle deleting a study session
  const handleDeleteSession = (id: string) => {
    if (window.confirm('Are you sure you want to delete this study session?')) {
      setSessions((prev) => prev.filter((sess) => sess.id !== id));
    }
  };

  // Reset to default sample data
  const handleResetData = () => {
    if (
      window.confirm(
        'Would you like to reset your data to the initial 5 subjects and 10 sample study sessions from the past week?'
      )
    ) {
      setSubjects(INITIAL_SUBJECTS);
      setSessions(INITIAL_SESSIONS);
    }
  };

  // Export all study sessions to a CSV file
  const handleExportAllSessionsCSV = () => {
    if (sessions.length === 0) {
      alert('No study sessions available to export.');
      return;
    }

    const headers = ['Session ID', 'Date', 'Subject Name', 'Duration (Minutes)', 'Duration (Formatted)', 'Notes'];
    
    const rows = sessions.map((sess) => {
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
    link.setAttribute('download', `all_study_sessions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate dashboard stats
  const currentMonday = getMondayDateString();

  // 1. Total minutes studied this week (Monday - Sunday)
  const sessionsThisWeek = sessions.filter((sess) => sess.date >= currentMonday);
  const totalMinutesThisWeek = sessionsThisWeek.reduce((sum, s) => sum + s.duration, 0);
  const totalHoursThisWeek = (totalMinutesThisWeek / 60).toFixed(1);

  // 2. Weekly average per day
  // Calculate how many days have elapsed in the current week (Monday to today)
  const getElapsedDaysThisWeek = (): number => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const elapsed = dayOfWeek === 0 ? 7 : dayOfWeek; // 1 to 7
    return elapsed;
  };
  const elapsedDays = getElapsedDaysThisWeek();
  const averageMinsPerDay = elapsedDays > 0 ? totalMinutesThisWeek / elapsedDays : 0;
  const averageHoursDisplay = (averageMinsPerDay / 60).toFixed(1);

  // 3. Current streak calculation
  const calculateStreak = (allSessions: StudySession[]): number => {
    if (allSessions.length === 0) return 0;

    // Get all unique dates with at least one session, sorted descending
    const uniqueDates = Array.from(new Set(allSessions.map((s) => s.date)))
      .sort()
      .reverse();

    const todayStr = new Date().toISOString().split('T')[0];

    const yesterdayObj = new Date();
    yesterdayObj.setDate(yesterdayObj.getDate() - 1);
    const yesterdayStr = yesterdayObj.toISOString().split('T')[0];

    const hasToday = uniqueDates.includes(todayStr);
    const hasYesterday = uniqueDates.includes(yesterdayStr);

    if (!hasToday && !hasYesterday) {
      return 0;
    }

    let streak = 0;
    const checkDate = new Date(); // Start checking from today

    // If today doesn't have a session, start checking from yesterday
    if (!hasToday) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const checkDateStr = checkDate.toISOString().split('T')[0];
      if (uniqueDates.includes(checkDateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1); // Go back one day
      } else {
        break;
      }
    }

    return streak;
  };

  const streakDays = calculateStreak(sessions);

  // 4. Subjects reaching target
  const completedTargetsCount = subjects.filter((sub) => {
    const subSessions = sessions.filter(
      (sess) => sess.subjectId === sub.id && sess.date >= currentMonday
    );
    const mins = subSessions.reduce((sum, s) => sum + s.duration, 0);
    return mins >= sub.targetHours * 60;
  }).length;

  // 5. Weekly summary top subject
  const getTopSubjectThisWeek = () => {
    if (subjects.length === 0 || sessionsThisWeek.length === 0) {
      return null;
    }
    const durationBySubject: { [id: string]: number } = {};
    sessionsThisWeek.forEach((sess) => {
      durationBySubject[sess.subjectId] = (durationBySubject[sess.subjectId] || 0) + sess.duration;
    });

    let topSubjectId = '';
    let maxDuration = 0;
    Object.entries(durationBySubject).forEach(([id, mins]) => {
      if (mins > maxDuration) {
        maxDuration = mins;
        topSubjectId = id;
      }
    });

    const subject = subjects.find((s) => s.id === topSubjectId);
    if (!subject || maxDuration === 0) return null;

    return {
      name: subject.name,
      hours: (maxDuration / 60).toFixed(1),
      color: subject.color,
    };
  };

  const topSubject = getTopSubjectThisWeek();

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 antialiased selection:bg-indigo-100 selection:text-indigo-900 pb-16">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-100">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base font-sans text-slate-900 tracking-tight flex items-center gap-1.5">
                FocusSpace
                <span className="text-3xs font-semibold px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded">
                  PORTAL
                </span>
              </h1>
              <p className="text-3xs text-slate-400 font-medium uppercase tracking-wider">
                Personal Study Tracker
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="btn-export-all-csv"
              onClick={handleExportAllSessionsCSV}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 dark:text-indigo-400 text-xs font-semibold rounded-lg transition-all cursor-pointer"
              title="Export all study sessions to a CSV file"
            >
              <Download className="w-3.5 h-3.5" />
              Export All CSV
            </button>
            <button
              id="btn-reset-data"
              onClick={handleResetData}
              className="flex items-center gap-1 px-3 py-1.5 border border-slate-100 hover:border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 text-xs font-semibold rounded-lg transition-all"
              title="Reset data to defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Demo
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Intro Welcome Hero */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-100 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm relative overflow-hidden"
        >
          {/* Subtle background graphic design */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-50/20 to-transparent pointer-events-none" />

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 font-sans tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              Welcome Back, Scholar!
            </h2>
            <p className="text-sm text-slate-500 max-w-xl">
              Consistency builds excellence. Log your study hours, hit your weekly targets, and see your streak climb.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              id="btn-hero-add-subject"
              onClick={() => setIsAddSubjectOpen(true)}
              className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold rounded-xl transition-all"
            >
              Add Subject
            </button>
            <button
              id="btn-hero-log-session"
              onClick={() => setIsLogSessionOpen(true)}
              className="px-4.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-indigo-100"
            >
              Log Study Session
            </button>
          </div>
        </motion.div>

        {/* METRICS DASHBOARD SECTION */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Dashboard Summary
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
            <MetricCard
              title="This Week's Study"
              value={`${totalHoursThisWeek}h`}
              subtitle={`Total across ${sessionsThisWeek.length} sessions`}
              icon={<Clock className="w-5 h-5 text-indigo-500" />}
              trend={{
                value: totalHoursThisWeek === '0.0' ? 'No hours' : `${totalHoursThisWeek} hrs`,
                isPositive: parseFloat(totalHoursThisWeek) > 5,
              }}
            />
            <MetricCard
              title="Current Streak"
              value={`${streakDays} Days`}
              subtitle={
                streakDays > 0
                  ? 'Keep studying daily to maintain!'
                  : 'Log a session today to start!'
              }
              icon={<Flame className="w-5 h-5 text-orange-500" />}
              trend={
                streakDays > 0
                  ? { value: 'Active Streak', isPositive: true }
                  : undefined
              }
            />
            <MetricCard
              title="Daily Focus Average"
              value={`${averageHoursDisplay}h`}
              subtitle="Daily average study time"
              icon={<Award className="w-5 h-5 text-emerald-500" />}
              trend={{
                value: `${formatDuration(Math.round(averageMinsPerDay))}/day`,
                isPositive: averageMinsPerDay > 60,
              }}
            />
            <MetricCard
              title="Target Progress"
              value={`${completedTargetsCount} / ${subjects.length}`}
              subtitle="Subjects meeting weekly targets"
              icon={<BookOpen className="w-5 h-5 text-violet-500" />}
              trend={
                subjects.length > 0 && completedTargetsCount === subjects.length
                  ? { value: 'All Goals Met 🎉', isPositive: true }
                  : undefined
              }
            />
            <MetricCard
              title="Weekly Focus Leader"
              value={topSubject ? `${topSubject.hours}h` : 'N/A'}
              subtitle={topSubject ? topSubject.name : 'No study logged this week'}
              icon={<Crown className="w-5 h-5 text-amber-500" />}
              trend={
                topSubject
                  ? { value: 'Top Subject', isPositive: true }
                  : undefined
              }
            />
          </div>
        </section>

        {/* CORE SYSTEM PANELS (GRID OF PROGRESS & SESSIONS) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left panel: Subject weekly progress bars (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-6">
            <SubjectProgressList
              subjects={subjects}
              sessions={sessions}
              onOpenAddSubject={() => setIsAddSubjectOpen(true)}
              onDeleteSubject={handleDeleteSubject}
            />

            <PomodoroTimer
              subjects={subjects}
              onLogSession={handleLogSession}
            />

            {/* Academic Motivation Widget */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-sm">
              <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-10">
                <Award className="w-32 h-32" />
              </div>
              <div className="relative z-10 space-y-3">
                <span className="text-2xs font-extrabold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded text-indigo-100">
                  Daily Thought
                </span>
                <p className="text-sm font-medium italic leading-relaxed text-slate-100">
                  "Excellence is not a singular act, but a habit. We are what we repeatedly do. Study consistently, rest mindfully, and celebrate small progress."
                </p>
                <div className="flex items-center gap-2 pt-2 text-xs text-indigo-200">
                  <span>– University Study Advisor</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel: Study session logs (7 cols on lg) */}
          <div className="lg:col-span-7">
            <SessionList
              sessions={sessions}
              subjects={subjects}
              onDeleteSession={handleDeleteSession}
              onOpenLogSession={() => setIsLogSessionOpen(true)}
            />
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium">
        <p>© 2026 FocusSpace Study Tracker Portal. Designed for high academic focus.</p>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            Running local session state
          </span>
        </div>
      </footer>

      {/* MODALS */}
      <AnimatePresence>
        {isAddSubjectOpen && (
          <AddSubjectModal
            onClose={() => setIsAddSubjectOpen(false)}
            onAdd={handleAddSubject}
          />
        )}
        {isLogSessionOpen && (
          <LogSessionModal
            subjects={subjects}
            onClose={() => setIsLogSessionOpen(false)}
            onAdd={handleLogSession}
            onOpenAddSubject={() => setIsAddSubjectOpen(true)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
