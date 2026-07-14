import { Subject, StudySession } from './types';

export const getRelativeDateStr = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

export const getMondayDateString = (): string => {
  const today = new Date();
  const day = today.getDay();
  // day: 0 = Sun, 1 = Mon, ..., 6 = Sat
  const diff = today.getDate() - (day === 0 ? 6 : day - 1);
  const monday = new Date(today.setDate(diff));
  return monday.toISOString().split('T')[0];
};

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'sub-1',
    name: 'Computer Science (Algorithms)',
    targetHours: 10,
    color: 'indigo',
  },
  {
    id: 'sub-2',
    name: 'Organic Chemistry',
    targetHours: 8,
    color: 'emerald',
  },
  {
    id: 'sub-3',
    name: 'Linear Algebra',
    targetHours: 6,
    color: 'violet',
  },
  {
    id: 'sub-4',
    name: 'Introduction to Psychology',
    targetHours: 4,
    color: 'amber',
  },
  {
    id: 'sub-5',
    name: 'Academic Writing',
    targetHours: 3,
    color: 'rose',
  },
];

export const INITIAL_SESSIONS: StudySession[] = [
  {
    id: 'sess-1',
    subjectId: 'sub-3',
    duration: 90,
    date: getRelativeDateStr(6),
    notes: 'Solved practice problems on vector spaces and linear transformations.',
  },
  {
    id: 'sess-2',
    subjectId: 'sub-1',
    duration: 120,
    date: getRelativeDateStr(5),
    notes: 'Implemented and analyzed QuickSort and MergeSort. Compared space complexity.',
  },
  {
    id: 'sess-3',
    subjectId: 'sub-2',
    duration: 100,
    date: getRelativeDateStr(4),
    notes: 'Reviewed electrophilic addition mechanisms and drew reaction pathways.',
  },
  {
    id: 'sess-4',
    subjectId: 'sub-5',
    duration: 60,
    date: getRelativeDateStr(4),
    notes: 'Drafted the introduction and thesis statement for the research paper.',
  },
  {
    id: 'sess-5',
    subjectId: 'sub-4',
    duration: 90,
    date: getRelativeDateStr(3),
    notes: "Read chapter on cognitive development and took notes on Piaget's stages.",
  },
  {
    id: 'sess-6',
    subjectId: 'sub-1',
    duration: 150,
    date: getRelativeDateStr(2),
    notes: 'Worked on dynamic programming assignment. Solved knapsack and LCS problems.',
  },
  {
    id: 'sess-7',
    subjectId: 'sub-3',
    duration: 75,
    date: getRelativeDateStr(2),
    notes: 'Studied eigenvalues, eigenvectors, and diagonalization theorems.',
  },
  {
    id: 'sess-8',
    subjectId: 'sub-2',
    duration: 120,
    date: getRelativeDateStr(1),
    notes: 'Completed lab report draft and practiced stereochemistry nomenclature.',
  },
  {
    id: 'sess-9',
    subjectId: 'sub-4',
    duration: 60,
    date: getRelativeDateStr(1),
    notes: 'Reviewed flashcards on sensory perception mechanisms and brain regions.',
  },
  {
    id: 'sess-10',
    subjectId: 'sub-5',
    duration: 80,
    date: getRelativeDateStr(0),
    notes: 'Revised body paragraphs and integrated sources using correct APA citations.',
  },
];

// Helper to get color classes for Tailwind
export const getColorClasses = (color: string) => {
  switch (color) {
    case 'indigo':
      return {
        bg: 'bg-indigo-50 dark:bg-indigo-950/30',
        text: 'text-indigo-700 dark:text-indigo-300',
        border: 'border-indigo-100 dark:border-indigo-900/50',
        fill: 'bg-indigo-600',
        ring: 'ring-indigo-100',
        accentText: 'text-indigo-600',
        gradient: 'from-indigo-500 to-blue-600',
      };
    case 'emerald':
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/30',
        text: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-100 dark:border-emerald-900/50',
        fill: 'bg-emerald-600',
        ring: 'ring-emerald-100',
        accentText: 'text-emerald-600',
        gradient: 'from-emerald-500 to-teal-600',
      };
    case 'violet':
      return {
        bg: 'bg-violet-50 dark:bg-violet-950/30',
        text: 'text-violet-700 dark:text-violet-300',
        border: 'border-violet-100 dark:border-violet-900/50',
        fill: 'bg-violet-600',
        ring: 'ring-violet-100',
        accentText: 'text-violet-600',
        gradient: 'from-violet-500 to-purple-600',
      };
    case 'amber':
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/30',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-100 dark:border-amber-900/50',
        fill: 'bg-amber-600',
        ring: 'ring-amber-100',
        accentText: 'text-amber-600',
        gradient: 'from-amber-500 to-orange-600',
      };
    case 'rose':
      return {
        bg: 'bg-rose-50 dark:bg-rose-950/30',
        text: 'text-rose-700 dark:text-rose-300',
        border: 'border-rose-100 dark:border-rose-900/50',
        fill: 'bg-rose-600',
        ring: 'ring-rose-100',
        accentText: 'text-rose-600',
        gradient: 'from-rose-500 to-pink-600',
      };
    case 'sky':
    default:
      return {
        bg: 'bg-sky-50 dark:bg-sky-950/30',
        text: 'text-sky-700 dark:text-sky-300',
        border: 'border-sky-100 dark:border-sky-900/50',
        fill: 'bg-sky-600',
        ring: 'ring-sky-100',
        accentText: 'text-sky-600',
        gradient: 'from-sky-500 to-blue-500',
      };
  }
};
