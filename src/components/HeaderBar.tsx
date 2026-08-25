import React, { useState } from 'react';
import { GradeFlowLogo } from './GradeFlowLogo';
import { useApp } from '../context/AppContext';
import {
  Bell,
  Plus,
  BookOpen,
  Award,
  Calendar as CalendarIcon,
  Timer,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const HeaderBar: React.FC = () => {
  const {
    profile,
    notifications,
    dismissNotification,
    setIsQuickAddMarkOpen,
    setIsQuickAddEventOpen,
    setIsQuickAddModuleOpen,
    setActiveTab,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#ffd6ee]/60 px-4 py-2.5 transition-all">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Logo and Date */}
        <div className="flex items-center gap-3">
          <GradeFlowLogo size="sm" />
          <div className="hidden sm:block border-l border-[#ffd6ee]/60 pl-3">
            <span className="text-xs font-semibold text-[#7b5ea7] uppercase tracking-wider">
              {todayFormatted}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Quick Action Button */}
          <div className="relative">
            <button
              id="header-quick-add-btn"
              onClick={() => setShowQuickMenu(!showQuickMenu)}
              className="gf-3d-button flex items-center gap-1.5 px-3.5 py-1.5 text-white text-xs font-bold cursor-pointer transition-all active:scale-95"
              aria-label="Create new academic item"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">Add</span>
            </button>

            {/* Quick Action Dropdown */}
            <AnimatePresence>
              {showQuickMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowQuickMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-52 bg-white rounded-2xl p-2 shadow-xl border border-[#ffd6ee] z-50 overflow-hidden"
                  >
                    <div className="text-[10px] font-bold text-[#7b5ea7] px-2.5 py-1 uppercase tracking-wider">
                      Quick Log
                    </div>
                    <button
                      id="menu-log-mark"
                      onClick={() => {
                        setShowQuickMenu(false);
                        setIsQuickAddMarkOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#1e0f3e] hover:bg-[#fff0f8] transition-colors text-left cursor-pointer"
                    >
                      <div className="w-6 h-6 rounded-full bg-[#fff0f8] text-[#e91e8c] flex items-center justify-center">
                        <Award className="w-3.5 h-3.5" />
                      </div>
                      Log Assessment Mark
                    </button>

                    <button
                      id="menu-add-deadline"
                      onClick={() => {
                        setShowQuickMenu(false);
                        setIsQuickAddEventOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#1e0f3e] hover:bg-[#fff0f8] transition-colors text-left cursor-pointer"
                    >
                      <div className="w-6 h-6 rounded-full bg-[#fff0f8] text-[#e91e8c] flex items-center justify-center">
                        <CalendarIcon className="w-3.5 h-3.5" />
                      </div>
                      Add Deadline / Event
                    </button>

                    <button
                      id="menu-add-module"
                      onClick={() => {
                        setShowQuickMenu(false);
                        setIsQuickAddModuleOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#1e0f3e] hover:bg-[#fff0f8] transition-colors text-left cursor-pointer"
                    >
                      <div className="w-6 h-6 rounded-full bg-[#fff0f8] text-[#e91e8c] flex items-center justify-center">
                        <BookOpen className="w-3.5 h-3.5" />
                      </div>
                      New Course / Module
                    </button>

                    <div className="my-1 border-t border-[#ffd6ee]/40" />

                    <button
                      id="menu-start-timer"
                      onClick={() => {
                        setShowQuickMenu(false);
                        setActiveTab('focus');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#e91e8c] hover:bg-[#fff0f8] transition-colors text-left cursor-pointer"
                    >
                      <div className="w-6 h-6 rounded-full bg-[#e91e8c] text-white flex items-center justify-center">
                        <Timer className="w-3.5 h-3.5" />
                      </div>
                      Start Study Session
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Notifications Button */}
          <div className="relative">
            <button
              id="header-notif-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-full text-[#7b5ea7] hover:text-[#e91e8c] hover:bg-[#fff0f8] transition-colors cursor-pointer"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#e91e8c] ring-2 ring-white animate-pulse" />
              )}
            </button>

            {/* Notification Drawer */}
            <AnimatePresence>
              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifications(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl p-4 shadow-2xl border border-[#ffd6ee] z-50"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-[#fff0f8]">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#e91e8c]" />
                        <h4 className="text-sm font-bold text-[#1e0f3e]">Notifications</h4>
                      </div>
                      <span className="text-[11px] font-semibold text-[#e91e8c] bg-[#fff0f8] rounded-full px-2 py-0.5">
                        {notifications.length} updates
                      </span>
                    </div>

                    <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto pr-1">
                      {notifications.length === 0 ? (
                        <div className="py-6 text-center text-xs text-[#7b5ea7]">
                          <CheckCircle2 className="w-8 h-8 text-[#ffd6ee] mx-auto mb-2" />
                          You are all caught up!
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className="group relative p-2.5 rounded-2xl bg-[#fff0f8] hover:bg-[#ffd6ee]/40 border border-[#ffd6ee] transition-all"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-bold text-[#1e0f3e]">{notif.title}</p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  dismissNotification(notif.id);
                                }}
                                className="text-[#7b5ea7] hover:text-[#e91e8c] p-0.5"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="text-[11px] text-[#7b5ea7] mt-0.5 leading-relaxed">
                              {notif.message}
                            </p>
                            <span className="text-[9px] font-medium text-[#7b5ea7] mt-1.5 block">
                              {notif.timestamp}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile Avatar */}
          <button
            id="header-profile-btn"
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-[#e91e8c]/30 transition-all cursor-pointer"
            aria-label="User profile"
          >
            <div className="relative">
              <img
                src={profile.avatarUrl}
                alt={profile.displayName}
                className="w-8 h-8 rounded-full object-cover border-2 border-[#e91e8c]"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
