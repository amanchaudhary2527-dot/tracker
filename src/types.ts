export interface Subject {
  id: string;
  name: string;
  targetHours: number; // Target hours per week
  color: string; // Color identifier: 'indigo', 'emerald', 'violet', 'amber', 'rose', 'sky', etc.
}

export interface StudySession {
  id: string;
  subjectId: string;
  duration: number; // Duration in minutes
  date: string; // YYYY-MM-DD
  notes: string;
}
