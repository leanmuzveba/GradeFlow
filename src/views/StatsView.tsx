import React from 'react';
import { useApp } from '../context/AppContext';
import { DashboardView } from './DashboardView';
import { ModulesView } from './ModulesView';

// Former home-screen overview on top of the modules list. While a module's
// detail is open, show just that so it isn't pushed below the overview.
export const StatsView: React.FC = () => {
  const { selectedModuleIdForDetail } = useApp();
  return (
    <div className="space-y-5">
      {!selectedModuleIdForDetail && <DashboardView />}
      <ModulesView />
    </div>
  );
};
