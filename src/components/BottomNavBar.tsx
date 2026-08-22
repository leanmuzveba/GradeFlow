import React from 'react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';
import {
  LayoutDashboard,
  BookOpen,
  Award,
  Timer,
  Calendar,
  BarChart3,
  User,
} from 'lucide-react';
import { motion } from 'motion/react';

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'modules', label: 'Modules', icon: BookOpen },
  { id: 'marks', label: 'Marks', icon: Award },
  { id: 'focus', label: 'Focus', icon: Timer },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'analytics', label: 'Stats', icon: BarChart3 },
  { id: 'profile', label: 'Profile', icon: User },
];

export const BottomNavBar: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  return (
    <nav
      id="main-bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-[#f6b9d5]/60 shadow-[0_-4px_20px_rgba(221,41,135,0.08)] px-2 py-2 pb-safe transition-all"
    >
      <div className="max-w-xl mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-1 min-w-0 min-h-[52px] flex-col items-center justify-center py-1 px-0.5 transition-all cursor-pointer select-none group ${
                isActive ? 'text-[#dd2987]' : 'text-[#7a5672] hover:text-[#dd2987]'
              }`}
              aria-label={`Navigate to ${item.label}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Sharp Icon Container */}
              <div
                className={`relative w-9 h-9 flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? 'shadow-md'
                    : 'group-hover:bg-[#fdedf5] bg-[#fdedf5]/60'
                }`}
                style={
                  isActive
                    ? {
                        background: 'linear-gradient(135deg, #ec68a0 0%, #dd2987 100%)',
                        boxShadow: '0 3px 10px rgba(221, 41, 135, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.4)',
                      }
                    : {
                        border: '1px solid rgba(246, 185, 213, 0.4)',
                      }
                }
              >
                <Icon
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isActive ? 'text-white scale-110' : 'text-[#6b4c62] group-hover:text-[#dd2987]'
                  }`}
                />

                {/* Active marker */}
                {isActive && (
                  <motion.span
                    layoutId="activeNavPill"
                    className="absolute -bottom-1 w-2.5 h-0.5 bg-[#dd2987]"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[10px] font-bold mt-1 tracking-tight leading-none transition-colors truncate max-w-full ${
                  isActive ? 'text-[#dd2987] font-extrabold' : 'text-[#7a5672]'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
