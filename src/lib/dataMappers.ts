import {
  UserProfile,
  AcademicModule,
  AssessmentMark,
  AcademicEvent,
  StudySession,
  StudyGoal,
} from '../types';

// snake_case row shapes as returned by Supabase (see the gradeflow_initial_schema migration)
export interface DbProfile {
  id: string;
  display_name: string;
  email: string;
  avatar_url: string;
  academic_year: string;
  semester: string;
  target_gpa: number;
  grading_scale: string;
  theme: string;
  created_at: string;
}

export interface DbModule {
  id: string;
  user_id: string;
  name: string;
  code: string;
  colour: string;
  academic_period: string;
  module_weight: number;
  credit_hours: number;
  instructor: string | null;
  room: string | null;
  target_grade: number | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbAssessment {
  id: string;
  user_id: string;
  module_id: string;
  name: string;
  assessment_type: string;
  score: number;
  total_score: number;
  percentage: number;
  weighting: number | null;
  assessment_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbEvent {
  id: string;
  user_id: string;
  module_id: string | null;
  title: string;
  event_type: string;
  start_at: string | null;
  due_at: string;
  priority: string;
  is_completed: boolean;
  location: string | null;
  notes: string | null;
  reminder_minutes: number | null;
  external_event_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbStudySession {
  id: string;
  user_id: string;
  module_id: string | null;
  session_type: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number;
  status: string;
  notes: string | null;
  created_at: string;
}

export interface DbStudyGoal {
  id: string;
  user_id: string;
  weekly_target_hours: number;
  daily_target_minutes: number;
  active: boolean;
}

export const profileFromDb = (r: DbProfile): UserProfile => ({
  id: r.id,
  displayName: r.display_name,
  email: r.email,
  avatarUrl: r.avatar_url,
  academicYear: r.academic_year,
  semester: r.semester,
  targetGpa: r.target_gpa,
  gradingScale: r.grading_scale as UserProfile['gradingScale'],
  theme: r.theme as UserProfile['theme'],
  createdAt: r.created_at,
});

export const moduleFromDb = (r: DbModule): AcademicModule => ({
  id: r.id,
  userId: r.user_id,
  name: r.name,
  code: r.code,
  colour: r.colour,
  academicPeriod: r.academic_period,
  moduleWeight: r.module_weight,
  creditHours: r.credit_hours,
  instructor: r.instructor ?? undefined,
  room: r.room ?? undefined,
  targetGrade: r.target_grade ?? undefined,
  isArchived: r.is_archived,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export const moduleToDb = (m: AcademicModule) => ({
  id: m.id,
  user_id: m.userId,
  name: m.name,
  code: m.code,
  colour: m.colour,
  academic_period: m.academicPeriod,
  module_weight: m.moduleWeight,
  credit_hours: m.creditHours,
  instructor: m.instructor ?? null,
  room: m.room ?? null,
  target_grade: m.targetGrade ?? null,
  is_archived: m.isArchived,
  created_at: m.createdAt,
  updated_at: m.updatedAt,
});

export const assessmentFromDb = (r: DbAssessment): AssessmentMark => ({
  id: r.id,
  moduleId: r.module_id,
  name: r.name,
  assessmentType: r.assessment_type as AssessmentMark['assessmentType'],
  score: r.score,
  totalScore: r.total_score,
  percentage: r.percentage,
  weighting: r.weighting ?? undefined,
  assessmentDate: r.assessment_date,
  notes: r.notes ?? undefined,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

// AssessmentMark carries no userId of its own (see types.ts), so it's passed in separately.
export const assessmentToDb = (a: AssessmentMark, userId: string) => ({
  id: a.id,
  user_id: userId,
  module_id: a.moduleId,
  name: a.name,
  assessment_type: a.assessmentType,
  score: a.score,
  total_score: a.totalScore,
  percentage: a.percentage,
  weighting: a.weighting ?? null,
  assessment_date: a.assessmentDate,
  notes: a.notes ?? null,
  created_at: a.createdAt,
  updated_at: a.updatedAt,
});

export const eventFromDb = (r: DbEvent): AcademicEvent => ({
  id: r.id,
  userId: r.user_id,
  moduleId: r.module_id ?? undefined,
  title: r.title,
  eventType: r.event_type as AcademicEvent['eventType'],
  startAt: r.start_at ?? undefined,
  dueAt: r.due_at,
  priority: r.priority as AcademicEvent['priority'],
  isCompleted: r.is_completed,
  location: r.location ?? undefined,
  notes: r.notes ?? undefined,
  reminderMinutes: r.reminder_minutes ?? undefined,
  externalEventId: r.external_event_id ?? undefined,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export const eventToDb = (e: AcademicEvent) => ({
  id: e.id,
  user_id: e.userId,
  module_id: e.moduleId ?? null,
  title: e.title,
  event_type: e.eventType,
  start_at: e.startAt ?? null,
  due_at: e.dueAt,
  priority: e.priority,
  is_completed: e.isCompleted,
  location: e.location ?? null,
  notes: e.notes ?? null,
  reminder_minutes: e.reminderMinutes ?? null,
  external_event_id: e.externalEventId ?? null,
  created_at: e.createdAt,
  updated_at: e.updatedAt,
});

export const studySessionFromDb = (r: DbStudySession): StudySession => ({
  id: r.id,
  userId: r.user_id,
  moduleId: r.module_id ?? undefined,
  sessionType: r.session_type as StudySession['sessionType'],
  startedAt: r.started_at,
  endedAt: r.ended_at ?? undefined,
  durationSeconds: r.duration_seconds,
  status: r.status as StudySession['status'],
  notes: r.notes ?? undefined,
  createdAt: r.created_at,
});

export const studySessionToDb = (s: StudySession) => ({
  id: s.id,
  user_id: s.userId,
  module_id: s.moduleId ?? null,
  session_type: s.sessionType,
  started_at: s.startedAt,
  ended_at: s.endedAt ?? null,
  duration_seconds: s.durationSeconds,
  status: s.status,
  notes: s.notes ?? null,
  created_at: s.createdAt,
});

export const studyGoalFromDb = (r: DbStudyGoal): StudyGoal => ({
  id: r.id,
  userId: r.user_id,
  weeklyTargetHours: r.weekly_target_hours,
  dailyTargetMinutes: r.daily_target_minutes,
  active: r.active,
});

export const studyGoalToDb = (g: StudyGoal) => ({
  id: g.id,
  user_id: g.userId,
  weekly_target_hours: g.weeklyTargetHours,
  daily_target_minutes: g.dailyTargetMinutes,
  active: g.active,
});
