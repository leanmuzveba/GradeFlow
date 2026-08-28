export type AssessmentType = 'assignment' | 'test' | 'exam' | 'project' | 'quiz' | 'lab' | 'custom';

export type EventType = 'assignment' | 'test' | 'exam' | 'project' | 'study_event';

export type PriorityLevel = 'low' | 'medium' | 'high';

export type SessionType = 'timer' | 'stopwatch' | 'pomodoro';

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  avatarUrl: string;
  academicYear: string;
  semester: string;
  targetGpa: number;
  gradingScale: '4.0' | 'percentage' | 'letter';
  theme: 'default' | 'dark' | 'moonlight';
  createdAt: string;
}

export interface AcademicModule {
  id: string;
  userId: string;
  name: string;
  code: string;
  colour: string; // Hex color code from GradeFlow palette
  academicPeriod: string;
  moduleWeight: number; // For weighted overall average
  creditHours: number;
  instructor?: string;
  room?: string;
  targetGrade?: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentMark {
  id: string;
  moduleId: string;
  name: string;
  assessmentType: AssessmentType;
  score: number;
  totalScore: number;
  percentage: number;
  weighting?: number; // E.g., 20% of the module
  assessmentDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudySession {
  id: string;
  userId: string;
  moduleId?: string;
  sessionType: SessionType;
  startedAt: string;
  endedAt?: string;
  durationSeconds: number;
  status: 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface AcademicEvent {
  id: string;
  userId: string;
  moduleId?: string;
  title: string;
  eventType: EventType;
  startAt?: string;
  dueAt: string;
  priority: PriorityLevel;
  isCompleted: boolean;
  location?: string;
  notes?: string;
  reminderMinutes?: number;
  externalEventId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudyGoal {
  id: string;
  userId: string;
  weeklyTargetHours: number;
  dailyTargetMinutes: number;
  active: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'deadline' | 'study' | 'grade' | 'system';
}

export type ActiveTab = 'dashboard' | 'modules' | 'marks' | 'focus' | 'calendar' | 'analytics' | 'profile';

// Timer progress is derived from real wall-clock timestamps (not a decrementing
// counter) so it stays correct across tab switches, backgrounding, and full app
// relaunches, where any in-memory setInterval would otherwise be lost.
export interface ActiveFocusTimer {
  mode: SessionType;
  moduleId: string;
  durationMinutes: number;
  isRunning: boolean;
  accumulatedSeconds: number;
  runStartedAt: number | null; // epoch ms; null while paused
}
