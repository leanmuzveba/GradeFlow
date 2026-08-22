import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { HeaderBar } from './components/HeaderBar';
import { BottomNavBar } from './components/BottomNavBar';
import { DashboardView } from './views/DashboardView';
import { ModulesView } from './views/ModulesView';
import { MarksView } from './views/MarksView';
import { FocusView } from './views/FocusView';
import { CalendarView } from './views/CalendarView';
import { AnalyticsView } from './views/AnalyticsView';
import { ProfileView } from './views/ProfileView';
import { AddMarkModal } from './components/modals/AddMarkModal';
import { AddEventModal } from './components/modals/AddEventModal';
import { AddModuleModal } from './components/modals/AddModuleModal';
import { motion, AnimatePresence } from 'motion/react';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView key="dashboard" />;
      case 'modules':
        return <ModulesView key="modules" />;
      case 'marks':
        return <MarksView key="marks" />;
      case 'focus':
        return <FocusView key="focus" />;
      case 'calendar':
        return <CalendarView key="calendar" />;
      case 'analytics':
        return <AnalyticsView key="analytics" />;
      case 'profile':
        return <ProfileView key="profile" />;
      default:
        return <DashboardView key="dashboard-default" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#fdedf5] flex flex-col font-sans text-[#2c1228]">
      {/* Top Header */}
      <HeaderBar />

      {/* Main Responsive Canvas */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-3.5 sm:px-6 pt-4 sm:pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {renderActiveScreen()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Fixed Mobile Bottom Navigation */}
      <BottomNavBar />

      {/* Global Modals */}
      <AddMarkModal />
      <AddEventModal />
      <AddModuleModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
