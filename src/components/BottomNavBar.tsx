import React from 'react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';
import {
  LayoutDashboard,
  BookOpen,
  Timer,
  Calendar,
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
  { id: 'focus', label: 'Focus', icon: Timer },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'profile', label: 'Profile', icon: User },
];

export const BottomNavBar: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  return (
    <nav
      id="main-bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#ffd6ee] px-1 py-2 pb-safe transition-all"
    >
      <div className="max-w-xl mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          const color = isActive ? '#e91e8c' : '#7b5ea7';

          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className="relative flex flex-1 min-w-0 min-h-[52px] flex-col items-center justify-center gap-0.5 py-1.5 px-0.5 rounded-2xl transition-colors cursor-pointer select-none"
              aria-label={`Navigate to ${item.label}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-[23px] h-[23px] transition-colors" style={{ color }} />
              <span
                className="text-[10px] font-bold tracking-tight leading-none truncate max-w-full transition-colors"
                style={{ color }}
              >
                {item.label}
              </span>
              {isActive ? (
                <motion.span
                  layoutId="activeNavDot"
                  className="w-1 h-1 rounded-full mt-0.5 bg-[#e91e8c]"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              ) : (
                <span className="w-1 h-1 rounded-full mt-0.5 bg-transparent" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
