import React, { useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SplashScreen } from './views/SplashScreen';
import { AuthView } from './views/AuthView';
import { HeaderBar } from './components/HeaderBar';
import { BottomNavBar } from './components/BottomNavBar';
import { StatsView } from './views/StatsView';
import { MarksView } from './views/MarksView';
import { FocusView } from './views/FocusView';
import { PlannerView } from './planner/PlannerView';
import { AnalyticsView } from './views/AnalyticsView';
import { ProfileView } from './views/ProfileView';
import { AddMarkModal } from './components/modals/AddMarkModal';
import { AddEventModal } from './components/modals/AddEventModal';
import { AddModuleModal } from './components/modals/AddModuleModal';
import { motion, AnimatePresence } from 'motion/react';

const AuthenticatedApp: React.FC = () => {
  const { dataLoading } = useApp();
  // Cloud data for this account is still being fetched (or the local-data
  // migration is running) — hold on the splash rather than flashing an
  // empty dashboard/modules list.
  if (dataLoading) return <SplashScreen />;
  return <MainContent />;
};

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'planner':
        return <PlannerView key="planner" />;
      case 'stats':
        return <StatsView key="stats" />;
      case 'marks':
        return <MarksView key="marks" />;
      case 'focus':
        return <FocusView key="focus" />;
      case 'analytics':
        return <AnalyticsView key="analytics" />;
      case 'profile':
        return <ProfileView key="profile" />;
      default:
        return <PlannerView key="planner-default" />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--gf-bg)] flex flex-col font-sans text-[var(--gf-text)]">
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

// Splash plays its full entrance animation (~2.3s) even if the session check
// resolves sooner, so the logo animation never gets cut short.
const MIN_SPLASH_MS = 2300;

const RootRouter: React.FC = () => {
  const { session, loading } = useAuth();
  const [minSplashElapsed, setMinSplashElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinSplashElapsed(true), MIN_SPLASH_MS);
    return () => clearTimeout(timer);
  }, []);

  if (loading || !minSplashElapsed) {
    return <SplashScreen />;
  }

  if (!session) {
    return <AuthView />;
  }

  return (
    <AppProvider>
      <AuthenticatedApp />
    </AppProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <RootRouter />
    </AuthProvider>
  );
}
