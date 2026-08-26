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
  initialProfile,
  initialModules,
  initialAssessments,
  initialEvents,
  initialStudySessions,
  initialStudyGoal,
} from '../data/initialData';

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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROFILE: 'gradeflow_profile_v1',
  MODULES: 'gradeflow_modules_v1',
  ASSESSMENTS: 'gradeflow_assessments_v1',
  EVENTS: 'gradeflow_events_v1',
  SESSIONS: 'gradeflow_sessions_v1',
  GOAL: 'gradeflow_goal_v1',
  NOTIFICATIONS: 'gradeflow_notifications_v1',
  FOCUS_TIMER: 'gradeflow_focus_timer_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return saved ? JSON.parse(saved) : initialProfile;
    } catch {
      return initialProfile;
    }
  });

  const [modules, setModules] = useState<AcademicModule[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MODULES);
      return saved ? JSON.parse(saved) : initialModules;
    } catch {
      return initialModules;
    }
  });

  const [assessments, setAssessments] = useState<AssessmentMark[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ASSESSMENTS);
      return saved ? JSON.parse(saved) : initialAssessments;
    } catch {
      return initialAssessments;
    }
  });

  const [events, setEvents] = useState<AcademicEvent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EVENTS);
      return saved ? JSON.parse(saved) : initialEvents;
    } catch {
      return initialEvents;
    }
  });

  const [studySessions, setStudySessions] = useState<StudySession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      return saved ? JSON.parse(saved) : initialStudySessions;
    } catch {
      return initialStudySessions;
    }
  });

  const [studyGoal, setStudyGoal] = useState<StudyGoal>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GOAL);
      return saved ? JSON.parse(saved) : initialStudyGoal;
    } catch {
      return initialStudyGoal;
    }
  });

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
      const saved = localStorage.getItem(STORAGE_KEYS.FOCUS_TIMER);
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

  // Persistence effects
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.warn(e);
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MODULES, JSON.stringify(modules));
    } catch (e) {
      console.warn(e);
    }
  }, [modules]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(assessments));
    } catch (e) {
      console.warn(e);
    }
  }, [assessments]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    } catch (e) {
      console.warn(e);
    }
  }, [events]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(studySessions));
    } catch (e) {
      console.warn(e);
    }
  }, [studySessions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GOAL, JSON.stringify(studyGoal));
    } catch (e) {
      console.warn(e);
    }
  }, [studyGoal]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FOCUS_TIMER, JSON.stringify(focusTimer));
    } catch (e) {
      console.warn(e);
    }
  }, [focusTimer]);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const addModule = (newMod: Omit<AcademicModule, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    const created: AcademicModule = {
      ...newMod,
      id: `mod_${Date.now()}`,
      userId: profile.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setModules((prev) => [created, ...prev]);
    addNotification('New Module Created', `${newMod.name} (${newMod.code}) added to your active courses.`, 'system');
  };

  const updateModule = (id: string, updates: Partial<AcademicModule>) => {
    setModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m))
    );
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
  };

  const toggleArchiveModule = (id: string) => {
    setModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isArchived: !m.isArchived, updatedAt: new Date().toISOString() } : m))
    );
  };

  const addAssessment = (newAssessment: Omit<AssessmentMark, 'id' | 'createdAt' | 'updatedAt'>) => {
    const created: AssessmentMark = {
      ...newAssessment,
      id: `mark_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setAssessments((prev) => [created, ...prev]);
    addNotification('Mark Logged', `${newAssessment.name}: ${newAssessment.percentage.toFixed(1)}% saved.`, 'grade');
  };

  const updateAssessment = (id: string, updates: Partial<AssessmentMark>) => {
    setAssessments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a))
    );
  };

  const deleteAssessment = (id: string) => {
    setAssessments((prev) => prev.filter((a) => a.id !== id));
  };

  const addEvent = (newEvent: Omit<AcademicEvent, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    const created: AcademicEvent = {
      ...newEvent,
      id: `evt_${Date.now()}`,
      userId: profile.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEvents((prev) => [created, ...prev]);
    addNotification('Deadline Scheduled', `${newEvent.title} added to your academic calendar.`, 'deadline');
  };

  const updateEvent = (id: string, updates: Partial<AcademicEvent>) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e))
    );
  };

  const toggleEventCompleted = (id: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isCompleted: !e.isCompleted, updatedAt: new Date().toISOString() } : e))
    );
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const addStudySession = (session: Omit<StudySession, 'id' | 'createdAt' | 'userId'>) => {
    const created: StudySession = {
      ...session,
      id: `sess_${Date.now()}`,
      userId: profile.id,
      createdAt: new Date().toISOString(),
    };
    setStudySessions((prev) => [created, ...prev]);
    const minutes = Math.round(session.durationSeconds / 60);
    addNotification('Study Session Completed', `Great focus! ${minutes} minutes recorded into study statistics.`, 'study');
  };

  const updateStudySession = (id: string, updates: Partial<StudySession>) => {
    setStudySessions((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteStudySession = (id: string) => {
    setStudySessions((prev) => prev.filter((s) => s.id !== id));
  };

  const updateStudyGoal = (updates: Partial<StudyGoal>) => {
    setStudyGoal((prev) => ({ ...prev, ...updates }));
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

  const resetAllData = () => {
    setProfile(initialProfile);
    setModules(initialModules);
    setAssessments(initialAssessments);
    setEvents(initialEvents);
    setStudySessions(initialStudySessions);
    setStudyGoal(initialStudyGoal);
    setFocusTimer(defaultFocusTimer);
    localStorage.clear();
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
