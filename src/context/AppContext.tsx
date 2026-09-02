import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  AcademicModule,
  AssessmentMark,
  AcademicEvent,
  StudySession,
  StudyGoal,
  NotificationItem,
  ActiveTab,
  ActiveFocusTimer,
} from '../types';
import {
  initialModules,
  initialAssessments,
  initialEvents,
  initialStudySessions,
  initialStudyGoal,
} from '../data/initialData';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabaseClient';
import {
  profileFromDb,
  moduleFromDb,
  moduleToDb,
  assessmentFromDb,
  assessmentToDb,
  eventFromDb,
  eventToDb,
  studySessionFromDb,
  studySessionToDb,
  studyGoalFromDb,
  studyGoalToDb,
} from '../lib/dataMappers';

const defaultFocusTimer: ActiveFocusTimer = {
  mode: 'pomodoro',
  moduleId: '',
  durationMinutes: 25,
  isRunning: false,
  accumulatedSeconds: 0,
  runStartedAt: null,
};

interface AppContextType {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  modules: AcademicModule[];
  addModule: (module: Omit<AcademicModule, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => void;
  updateModule: (id: string, updates: Partial<AcademicModule>) => void;
  deleteModule: (id: string) => void;
  toggleArchiveModule: (id: string) => void;
  assessments: AssessmentMark[];
  addAssessment: (assessment: Omit<AssessmentMark, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAssessment: (id: string, updates: Partial<AssessmentMark>) => void;
  deleteAssessment: (id: string) => void;
  events: AcademicEvent[];
  addEvent: (event: Omit<AcademicEvent, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => void;
  importEvents: (events: Omit<AcademicEvent, 'id' | 'createdAt' | 'updatedAt' | 'userId'>[]) => number;
  updateEvent: (id: string, updates: Partial<AcademicEvent>) => void;
  toggleEventCompleted: (id: string) => void;
  deleteEvent: (id: string) => void;
  studySessions: StudySession[];
  addStudySession: (session: Omit<StudySession, 'id' | 'createdAt' | 'userId'>) => void;
  updateStudySession: (id: string, updates: Partial<StudySession>) => void;
  deleteStudySession: (id: string) => void;
  focusTimer: ActiveFocusTimer;
  setFocusTimer: React.Dispatch<React.SetStateAction<ActiveFocusTimer>>;
  studyGoal: StudyGoal;
  updateStudyGoal: (updates: Partial<StudyGoal>) => void;
  notifications: NotificationItem[];
  addNotification: (title: string, message: string, type?: NotificationItem['type']) => void;
  dismissNotification: (id: string) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedModuleIdForDetail: string | null;
  setSelectedModuleIdForDetail: (id: string | null) => void;
  isQuickAddMarkOpen: boolean;
  setIsQuickAddMarkOpen: (open: boolean) => void;
  isQuickAddEventOpen: boolean;
  setIsQuickAddEventOpen: (open: boolean) => void;
  isQuickAddModuleOpen: boolean;
  setIsQuickAddModuleOpen: (open: boolean) => void;
  focusTimerAutoModuleId: string | null;
  setFocusTimerAutoModuleId: (moduleId: string | null) => void;
  resetAllData: () => void;
  dataLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Pre-auth (v1) keys: where this device's local-only data lived before cloud
// accounts existed. Read once per fresh account to migrate it into Supabase,
// never written to again.
const LEGACY_STORAGE_KEYS = {
  MODULES: 'gradeflow_modules_v1',
  ASSESSMENTS: 'gradeflow_assessments_v1',
  EVENTS: 'gradeflow_events_v1',
  SESSIONS: 'gradeflow_sessions_v1',
  GOAL: 'gradeflow_goal_v1',
};

const FOCUS_TIMER_STORAGE_KEY = 'gradeflow_focus_timer_v1';

// Per-account (v2) offline cache: last-known-good copy of cloud data, scoped
// by user id so switching accounts on one device never mixes data.
const userCacheKey = (base: string, userId: string) => `gradeflow_${base}_v2_${userId}`;

const buildFallbackProfile = (userId: string, email: string): UserProfile => ({
  id: userId,
  displayName: email.split('@')[0] || 'Student',
  email,
  avatarUrl: '',
  academicYear: '',
  semester: '',
  targetGpa: 3.5,
  gradingScale: '4.0',
  theme: 'default',
  createdAt: new Date().toISOString(),
});

interface LegacyImportResult {
  modules: AcademicModule[];
  assessments: AssessmentMark[];
  events: AcademicEvent[];
  studySessions: StudySession[];
  studyGoal: StudyGoal | null;
}

// One-time upload of whatever this device had stored locally (pre-auth
// testing data) into a brand-new, still-empty cloud account.
const importLegacyLocalData = async (userId: string): Promise<LegacyImportResult | null> => {
  let legacyModules: AcademicModule[] = [];
  let legacyAssessments: AssessmentMark[] = [];
  let legacyEvents: AcademicEvent[] = [];
  let legacySessions: StudySession[] = [];
  let legacyGoal: StudyGoal | null = null;

  try {
    const m = localStorage.getItem(LEGACY_STORAGE_KEYS.MODULES);
    if (m) legacyModules = JSON.parse(m);
    const a = localStorage.getItem(LEGACY_STORAGE_KEYS.ASSESSMENTS);
    if (a) legacyAssessments = JSON.parse(a);
    const e = localStorage.getItem(LEGACY_STORAGE_KEYS.EVENTS);
    if (e) legacyEvents = JSON.parse(e);
    const s = localStorage.getItem(LEGACY_STORAGE_KEYS.SESSIONS);
    if (s) legacySessions = JSON.parse(s);
    const g = localStorage.getItem(LEGACY_STORAGE_KEYS.GOAL);
    if (g) legacyGoal = JSON.parse(g);
  } catch (e) {
    console.warn('Could not read legacy local data', e);
    return null;
  }

  if (legacyModules.length === 0 && legacyAssessments.length === 0 && legacyEvents.length === 0) {
    return null;
  }

  const moduleIdMap = new Map<string, string>();
  const newModules: AcademicModule[] = legacyModules.map((m) => {
    const newId = crypto.randomUUID();
    moduleIdMap.set(m.id, newId);
    return { ...m, id: newId, userId };
  });
  const newAssessments: AssessmentMark[] = legacyAssessments
    .filter((a) => moduleIdMap.has(a.moduleId))
    .map((a) => ({ ...a, id: crypto.randomUUID(), moduleId: moduleIdMap.get(a.moduleId)! }));
  const newEvents: AcademicEvent[] = legacyEvents.map((e) => ({
    ...e,
    id: crypto.randomUUID(),
    userId,
    moduleId: e.moduleId ? moduleIdMap.get(e.moduleId) : undefined,
  }));
  const newSessions: StudySession[] = legacySessions.map((s) => ({
    ...s,
    id: crypto.randomUUID(),
    userId,
    moduleId: s.moduleId ? moduleIdMap.get(s.moduleId) : undefined,
  }));
  const newGoal: StudyGoal | null = legacyGoal ? { ...legacyGoal, id: crypto.randomUUID(), userId } : null;

  try {
    if (newModules.length) await supabase.from('modules').insert(newModules.map(moduleToDb));
    if (newAssessments.length)
      await supabase.from('assessments').insert(newAssessments.map((a) => assessmentToDb(a, userId)));
    if (newEvents.length) await supabase.from('events').insert(newEvents.map(eventToDb));
    if (newSessions.length) await supabase.from('study_sessions').insert(newSessions.map(studySessionToDb));
    if (newGoal) await supabase.from('study_goals').insert(studyGoalToDb(newGoal));
  } catch (e) {
    console.warn('Failed to import legacy local data to the cloud', e);
  }

  return { modules: newModules, assessments: newAssessments, events: newEvents, studySessions: newSessions, studyGoal: newGoal };
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Only mounted once a session exists (see App.tsx), so user is always present here.
  const { user } = useAuth();
  const userId = user!.id;
  const userEmail = user!.email ?? '';

  const [profile, setProfile] = useState<UserProfile>(() => buildFallbackProfile(userId, userEmail));
  const [modules, setModules] = useState<AcademicModule[]>([]);
  const [assessments, setAssessments] = useState<AssessmentMark[]>([]);
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [studyGoal, setStudyGoal] = useState<StudyGoal>({ ...initialStudyGoal, id: '', userId });
  const [dataLoading, setDataLoading] = useState(true);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif_1',
      title: 'Upcoming Deadline Today',
      message: 'Economics Problem Set is due tonight at 11:59 PM.',
      timestamp: '10 mins ago',
      read: false,
      type: 'deadline',
    },
    {
      id: 'notif_2',
      title: 'High Performance Milestone',
      message: 'Your overall GPA is on track at 3.90! Great work.',
      timestamp: '2 hours ago',
      read: false,
      type: 'grade',
    },
  ]);

  const [focusTimer, setFocusTimer] = useState<ActiveFocusTimer>(() => {
    try {
      const saved = localStorage.getItem(FOCUS_TIMER_STORAGE_KEY);
      return saved ? { ...defaultFocusTimer, ...JSON.parse(saved) } : defaultFocusTimer;
    } catch {
      return defaultFocusTimer;
    }
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedModuleIdForDetail, setSelectedModuleIdForDetail] = useState<string | null>(null);
  const [isQuickAddMarkOpen, setIsQuickAddMarkOpen] = useState(false);
  const [isQuickAddEventOpen, setIsQuickAddEventOpen] = useState(false);
  const [isQuickAddModuleOpen, setIsQuickAddModuleOpen] = useState(false);
  const [focusTimerAutoModuleId, setFocusTimerAutoModuleId] = useState<string | null>(null);

  // Load this account's cloud data on login (and once per new user id).
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setDataLoading(true);
      try {
        const [profileRes, modulesRes, assessmentsRes, eventsRes, sessionsRes, goalRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
          supabase.from('modules').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
          supabase.from('assessments').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
          supabase.from('events').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
          supabase.from('study_sessions').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
          supabase.from('study_goals').select('*').eq('user_id', userId).maybeSingle(),
        ]);
        if (cancelled) return;

        if (profileRes.error) throw profileRes.error;
        if (modulesRes.error) throw modulesRes.error;
        if (assessmentsRes.error) throw assessmentsRes.error;
        if (eventsRes.error) throw eventsRes.error;
        if (sessionsRes.error) throw sessionsRes.error;
        if (goalRes.error) throw goalRes.error;

        if (profileRes.data) setProfile(profileFromDb(profileRes.data));

        let loadedModules = (modulesRes.data ?? []).map(moduleFromDb);
        let loadedAssessments = (assessmentsRes.data ?? []).map(assessmentFromDb);
        let loadedEvents = (eventsRes.data ?? []).map(eventFromDb);
        let loadedSessions = (sessionsRes.data ?? []).map(studySessionFromDb);
        let loadedGoal = goalRes.data ? studyGoalFromDb(goalRes.data) : null;

        // Brand-new account with nothing in the cloud yet: bring over this
        // device's pre-auth local data (if any) instead of starting blank.
        if (loadedModules.length === 0 && loadedAssessments.length === 0 && loadedEvents.length === 0) {
          const imported = await importLegacyLocalData(userId);
          if (imported) {
            loadedModules = imported.modules;
            loadedAssessments = imported.assessments;
            loadedEvents = imported.events;
            loadedSessions = imported.studySessions;
            if (!loadedGoal) loadedGoal = imported.studyGoal;
          }
        }

        if (!loadedGoal) {
          const created: StudyGoal = { ...initialStudyGoal, id: crypto.randomUUID(), userId };
          const { error } = await supabase.from('study_goals').insert(studyGoalToDb(created));
          if (!error) loadedGoal = created;
        }

        if (cancelled) return;
        setModules(loadedModules);
        setAssessments(loadedAssessments);
        setEvents(loadedEvents);
        setStudySessions(loadedSessions);
        if (loadedGoal) setStudyGoal(loadedGoal);

        localStorage.setItem(userCacheKey('modules', userId), JSON.stringify(loadedModules));
        localStorage.setItem(userCacheKey('assessments', userId), JSON.stringify(loadedAssessments));
        localStorage.setItem(userCacheKey('events', userId), JSON.stringify(loadedEvents));
        localStorage.setItem(userCacheKey('sessions', userId), JSON.stringify(loadedSessions));
      } catch (e) {
        console.warn('Failed to load cloud data, falling back to local cache', e);
        try {
          const cm = localStorage.getItem(userCacheKey('modules', userId));
          if (cm) setModules(JSON.parse(cm));
          const ca = localStorage.getItem(userCacheKey('assessments', userId));
          if (ca) setAssessments(JSON.parse(ca));
          const ce = localStorage.getItem(userCacheKey('events', userId));
          if (ce) setEvents(JSON.parse(ce));
          const cs = localStorage.getItem(userCacheKey('sessions', userId));
          if (cs) setStudySessions(JSON.parse(cs));
        } catch (cacheErr) {
          console.warn('No usable local cache either', cacheErr);
        }
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Applied to <html> (not a nested element) so the CSS variable overrides
  // cascade to <body> and everything in the tree, including elements that
  // render outside the app's root div.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', profile.theme);
  }, [profile.theme]);

  // Local offline-fallback cache, kept in sync with the last-known cloud state.
  useEffect(() => {
    if (dataLoading) return;
    localStorage.setItem(userCacheKey('modules', userId), JSON.stringify(modules));
  }, [modules, dataLoading, userId]);

  useEffect(() => {
    if (dataLoading) return;
    localStorage.setItem(userCacheKey('assessments', userId), JSON.stringify(assessments));
  }, [assessments, dataLoading, userId]);

  useEffect(() => {
    if (dataLoading) return;
    localStorage.setItem(userCacheKey('events', userId), JSON.stringify(events));
  }, [events, dataLoading, userId]);

  useEffect(() => {
    if (dataLoading) return;
    localStorage.setItem(userCacheKey('sessions', userId), JSON.stringify(studySessions));
  }, [studySessions, dataLoading, userId]);

  useEffect(() => {
    try {
      localStorage.setItem(FOCUS_TIMER_STORAGE_KEY, JSON.stringify(focusTimer));
    } catch (e) {
      console.warn(e);
    }
  }, [focusTimer]);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...updates };
      supabase
        .from('profiles')
        .update({
          display_name: next.displayName,
          email: next.email,
          avatar_url: next.avatarUrl,
          academic_year: next.academicYear,
          semester: next.semester,
          target_gpa: next.targetGpa,
          grading_scale: next.gradingScale,
          theme: next.theme,
        })
        .eq('id', userId)
        .then(({ error }) => {
          if (error) console.warn('Failed to save profile', error);
        });
      return next;
    });
  };

  const addModule = (newMod: Omit<AcademicModule, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    const now = new Date().toISOString();
    const created: AcademicModule = { ...newMod, id: crypto.randomUUID(), userId, createdAt: now, updatedAt: now };
    setModules((prev) => [created, ...prev]);
    supabase
      .from('modules')
      .insert(moduleToDb(created))
      .then(({ error }) => {
        if (error) console.warn('Failed to save module', error);
      });
    addNotification('New Module Created', `${newMod.name} (${newMod.code}) added to your active courses.`, 'system');
  };

  const updateModule = (id: string, updates: Partial<AcademicModule>) => {
    setModules((prev) => {
      const next = prev.map((m) => (m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m));
      const updated = next.find((m) => m.id === id);
      if (updated) {
        supabase
          .from('modules')
          .update(moduleToDb(updated))
          .eq('id', id)
          .then(({ error }) => {
            if (error) console.warn('Failed to update module', error);
          });
      }
      return next;
    });
  };

  const deleteModule = (id: string) => {
    const target = modules.find((m) => m.id === id);
    setModules((prev) => prev.filter((m) => m.id !== id));
    setAssessments((prev) => prev.filter((a) => a.moduleId !== id));
    setEvents((prev) => prev.filter((e) => e.moduleId !== id));
    if (selectedModuleIdForDetail === id) setSelectedModuleIdForDetail(null);
    if (target) {
      addNotification('Module Deleted', `${target.name} and associated records were removed.`, 'system');
    }

    // Events aren't cascade-deleted in the schema (module_id is set null instead),
    // so remove them explicitly to match the local behavior above. Assessments
    // cascade-delete automatically once the module row itself is deleted.
    supabase
      .from('events')
      .delete()
      .eq('module_id', id)
      .then(({ error }) => {
        if (error) console.warn('Failed to delete module events', error);
      });
    supabase
      .from('modules')
      .delete()
      .eq('id', id)
      .then(({ error }) => {
        if (error) console.warn('Failed to delete module', error);
      });
  };

  const toggleArchiveModule = (id: string) => {
    setModules((prev) => {
      const next = prev.map((m) =>
        m.id === id ? { ...m, isArchived: !m.isArchived, updatedAt: new Date().toISOString() } : m
      );
      const updated = next.find((m) => m.id === id);
      if (updated) {
        supabase
          .from('modules')
          .update(moduleToDb(updated))
          .eq('id', id)
          .then(({ error }) => {
            if (error) console.warn('Failed to update module', error);
          });
      }
      return next;
    });
  };

  const addAssessment = (newAssessment: Omit<AssessmentMark, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const created: AssessmentMark = { ...newAssessment, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    setAssessments((prev) => [created, ...prev]);
    supabase
      .from('assessments')
      .insert(assessmentToDb(created, userId))
      .then(({ error }) => {
        if (error) console.warn('Failed to save assessment', error);
      });
    addNotification('Mark Logged', `${newAssessment.name}: ${newAssessment.percentage.toFixed(1)}% saved.`, 'grade');
  };

  const updateAssessment = (id: string, updates: Partial<AssessmentMark>) => {
    setAssessments((prev) => {
      const next = prev.map((a) => (a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a));
      const updated = next.find((a) => a.id === id);
      if (updated) {
        supabase
          .from('assessments')
          .update(assessmentToDb(updated, userId))
          .eq('id', id)
          .then(({ error }) => {
            if (error) console.warn('Failed to update assessment', error);
          });
      }
      return next;
    });
  };

  const deleteAssessment = (id: string) => {
    setAssessments((prev) => prev.filter((a) => a.id !== id));
    supabase
      .from('assessments')
      .delete()
      .eq('id', id)
      .then(({ error }) => {
        if (error) console.warn('Failed to delete assessment', error);
      });
  };

  const addEvent = (newEvent: Omit<AcademicEvent, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    const now = new Date().toISOString();
    const created: AcademicEvent = { ...newEvent, id: crypto.randomUUID(), userId, createdAt: now, updatedAt: now };
    setEvents((prev) => [created, ...prev]);
    supabase
      .from('events')
      .insert(eventToDb(created))
      .then(({ error }) => {
        if (error) console.warn('Failed to save event', error);
      });
    addNotification('Deadline Scheduled', `${newEvent.title} added to your academic calendar.`, 'deadline');
  };

  const importEvents = (newEvents: Omit<AcademicEvent, 'id' | 'createdAt' | 'updatedAt' | 'userId'>[]) => {
    if (newEvents.length === 0) return 0;
    const now = new Date().toISOString();
    const created: AcademicEvent[] = newEvents.map((evt) => ({
      ...evt,
      id: crypto.randomUUID(),
      userId,
      createdAt: now,
      updatedAt: now,
    }));
    setEvents((prev) => [...created, ...prev]);
    supabase
      .from('events')
      .insert(created.map(eventToDb))
      .then(({ error }) => {
        if (error) console.warn('Failed to save imported events', error);
      });
    addNotification(
      'Calendar Imported',
      `${created.length} deadline${created.length === 1 ? '' : 's'} imported from your calendar file.`,
      'deadline'
    );
    return created.length;
  };

  const updateEvent = (id: string, updates: Partial<AcademicEvent>) => {
    setEvents((prev) => {
      const next = prev.map((e) => (e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e));
      const updated = next.find((e) => e.id === id);
      if (updated) {
        supabase
          .from('events')
          .update(eventToDb(updated))
          .eq('id', id)
          .then(({ error }) => {
            if (error) console.warn('Failed to update event', error);
          });
      }
      return next;
    });
  };

  const toggleEventCompleted = (id: string) => {
    setEvents((prev) => {
      const next = prev.map((e) =>
        e.id === id ? { ...e, isCompleted: !e.isCompleted, updatedAt: new Date().toISOString() } : e
      );
      const updated = next.find((e) => e.id === id);
      if (updated) {
        supabase
          .from('events')
          .update(eventToDb(updated))
          .eq('id', id)
          .then(({ error }) => {
            if (error) console.warn('Failed to update event', error);
          });
      }
      return next;
    });
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    supabase
      .from('events')
      .delete()
      .eq('id', id)
      .then(({ error }) => {
        if (error) console.warn('Failed to delete event', error);
      });
  };

  const addStudySession = (session: Omit<StudySession, 'id' | 'createdAt' | 'userId'>) => {
    const created: StudySession = { ...session, id: crypto.randomUUID(), userId, createdAt: new Date().toISOString() };
    setStudySessions((prev) => [created, ...prev]);
    supabase
      .from('study_sessions')
      .insert(studySessionToDb(created))
      .then(({ error }) => {
        if (error) console.warn('Failed to save study session', error);
      });
    const minutes = Math.round(session.durationSeconds / 60);
    addNotification('Study Session Completed', `Great focus! ${minutes} minutes recorded into study statistics.`, 'study');
  };

  const updateStudySession = (id: string, updates: Partial<StudySession>) => {
    setStudySessions((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, ...updates } : s));
      const updated = next.find((s) => s.id === id);
      if (updated) {
        supabase
          .from('study_sessions')
          .update(studySessionToDb(updated))
          .eq('id', id)
          .then(({ error }) => {
            if (error) console.warn('Failed to update study session', error);
          });
      }
      return next;
    });
  };

  const deleteStudySession = (id: string) => {
    setStudySessions((prev) => prev.filter((s) => s.id !== id));
    supabase
      .from('study_sessions')
      .delete()
      .eq('id', id)
      .then(({ error }) => {
        if (error) console.warn('Failed to delete study session', error);
      });
  };

  const updateStudyGoal = (updates: Partial<StudyGoal>) => {
    setStudyGoal((prev) => {
      const next = { ...prev, ...updates };
      supabase
        .from('study_goals')
        .update(studyGoalToDb(next))
        .eq('user_id', userId)
        .then(({ error }) => {
          if (error) console.warn('Failed to update study goal', error);
        });
      return next;
    });
  };

  const addNotification = (title: string, message: string, type: NotificationItem['type'] = 'system') => {
    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      title,
      message,
      timestamp: 'Just now',
      read: false,
      type,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Resets this account's academic content (modules/marks/deadlines/sessions/goal)
  // back to the sample baseline. Profile identity (id, email, name, theme) is
  // left untouched — this isn't a "delete my account" action.
  const resetAllData = () => {
    const moduleIdMap = new Map<string, string>();
    const newModules: AcademicModule[] = initialModules.map((m) => {
      const newId = crypto.randomUUID();
      moduleIdMap.set(m.id, newId);
      return { ...m, id: newId, userId };
    });
    const newAssessments: AssessmentMark[] = initialAssessments.map((a) => ({
      ...a,
      id: crypto.randomUUID(),
      moduleId: moduleIdMap.get(a.moduleId) ?? a.moduleId,
    }));
    const newEvents: AcademicEvent[] = initialEvents.map((e) => ({
      ...e,
      id: crypto.randomUUID(),
      userId,
      moduleId: e.moduleId ? moduleIdMap.get(e.moduleId) : undefined,
    }));
    const newSessions: StudySession[] = initialStudySessions.map((s) => ({
      ...s,
      id: crypto.randomUUID(),
      userId,
      moduleId: s.moduleId ? moduleIdMap.get(s.moduleId) : undefined,
    }));
    const newGoal: StudyGoal = { ...initialStudyGoal, id: crypto.randomUUID(), userId };

    setModules(newModules);
    setAssessments(newAssessments);
    setEvents(newEvents);
    setStudySessions(newSessions);
    setStudyGoal(newGoal);
    setFocusTimer(defaultFocusTimer);
    localStorage.removeItem(FOCUS_TIMER_STORAGE_KEY);

    (async () => {
      try {
        await supabase.from('events').delete().eq('user_id', userId);
        await supabase.from('study_sessions').delete().eq('user_id', userId);
        await supabase.from('assessments').delete().eq('user_id', userId);
        await supabase.from('modules').delete().eq('user_id', userId);
        await supabase.from('study_goals').delete().eq('user_id', userId);

        await supabase.from('modules').insert(newModules.map(moduleToDb));
        await supabase.from('assessments').insert(newAssessments.map((a) => assessmentToDb(a, userId)));
        await supabase.from('events').insert(newEvents.map(eventToDb));
        await supabase.from('study_sessions').insert(newSessions.map(studySessionToDb));
        await supabase.from('study_goals').insert(studyGoalToDb(newGoal));
      } catch (e) {
        console.warn('Failed to reset cloud data', e);
      }
    })();
  };

  return (
    <AppContext.Provider
      value={{
        profile,
        updateProfile,
        modules,
        addModule,
        updateModule,
        deleteModule,
        toggleArchiveModule,
        assessments,
        addAssessment,
        updateAssessment,
        deleteAssessment,
        events,
        addEvent,
        importEvents,
        updateEvent,
        toggleEventCompleted,
        deleteEvent,
        studySessions,
        addStudySession,
        updateStudySession,
        deleteStudySession,
        focusTimer,
        setFocusTimer,
        studyGoal,
        updateStudyGoal,
        notifications,
        addNotification,
        dismissNotification,
        activeTab,
        setActiveTab,
        selectedModuleIdForDetail,
        setSelectedModuleIdForDetail,
        isQuickAddMarkOpen,
        setIsQuickAddMarkOpen,
        isQuickAddEventOpen,
        setIsQuickAddEventOpen,
        isQuickAddModuleOpen,
        setIsQuickAddModuleOpen,
        focusTimerAutoModuleId,
        setFocusTimerAutoModuleId,
        resetAllData,
        dataLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
