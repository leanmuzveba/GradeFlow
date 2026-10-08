import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { calculateModuleAverage, calculateOverallAverage } from '../utils/academicCalculations';
import { BookOpen, Plus, Trash2 } from 'lucide-react';

const fmt = (n: number) => (n > 0 ? `${n.toFixed(1)}%` : '--');

export const MarksView: React.FC = () => {
  const {
    profile,
    modules,
    assessments,
    deleteAssessment,
    setIsQuickAddMarkOpen,
    setIsQuickAddModuleOpen,
    setSelectedModuleIdForDetail,
    activeSemester,
    setActiveSemester,
  } = useApp();

  // The module picked here is only meant to pre-fill the Log Mark form —
  // don't leave the Modules tab opening on that module's detail view.
  useEffect(() => () => setSelectedModuleIdForDetail(null), []);

  const activeModules = modules.filter((m) => !m.isArchived);
  const marksFor = (sem: 1 | 2) => assessments.filter((a) => (a.semester ?? 1) === sem);
  const semesterMarks = marksFor(activeSemester);
  // A module shows on this tab if it's set to this semester, isn't set to the
  // other one ("Full Year" / older free-text periods), or already has marks here.
  const otherSemester = `Semester ${activeSemester === 1 ? 2 : 1}`;
  const tabModules = activeModules.filter(
    (m) => m.academicPeriod !== otherSemester || semesterMarks.some((a) => a.moduleId === m.id)
  );

  const overallAverage = calculateOverallAverage(modules, assessments);
  const sem1Average = calculateOverallAverage(modules, marksFor(1));
  const sem2Average = calculateOverallAverage(modules, marksFor(2));

  const logMarkFor = (moduleId: string) => {
    setSelectedModuleIdForDetail(moduleId);
    setIsQuickAddMarkOpen(true);
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      {/* Overall average */}
      <div className="bg-[var(--gf-card)] rounded-[32px] border border-[var(--gf-border)] shadow-xs px-6 pt-6 pb-7">
        <span className="text-xs font-semibold tracking-wider text-[var(--gf-muted)] uppercase">
          Overall Average
        </span>
        <div className="mt-1.5 text-[var(--gf-primary)] leading-none">
          <span className="text-6xl font-black tracking-tighter">
            {overallAverage > 0 ? overallAverage.toFixed(1) : '--'}
          </span>
          <span className="text-3xl font-bold"> %</span>
        </div>
      </div>

      {/* Semester summary strip */}
      <div className="flex items-center py-3.5 px-2 rounded-2xl bg-[var(--gf-tint)]">
        {[
          { label: 'SEM 1', value: fmt(sem1Average), accent: false },
          { label: 'SEM 2', value: fmt(sem2Average), accent: false },
          { label: 'TARGET', value: `${profile.targetGpa.toFixed(2)} GPA`, accent: true },
        ].map((item, i) => (
          <React.Fragment key={item.label}>
            {i > 0 && <div className="w-px h-6 bg-[var(--gf-border)]" />}
            <div className="flex-1 text-center">
              <div className={`text-[10px] font-bold ${item.accent ? 'text-[var(--gf-primary)]' : 'text-[var(--gf-muted)]'}`}>
                {item.label}
              </div>
              <div className={`text-sm font-bold mt-0.5 ${item.accent ? 'text-[var(--gf-primary)]' : 'text-[var(--gf-text)]'}`}>
                {item.value}
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Semester toggle (sticks under the header while scrolling) */}
      <div className="sticky top-16 z-30 -mx-3.5 sm:-mx-6 px-3.5 sm:px-6 py-2 bg-[var(--gf-bg)]">
        <div className="flex gap-1 p-1.5 rounded-2xl bg-[var(--gf-card)] border border-[var(--gf-border)]">
          {([1, 2] as const).map((n) => (
            <button
              key={n}
              onClick={() => setActiveSemester(n)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer ${
                activeSemester === n
                  ? 'bg-[var(--gf-primary)] text-white shadow-md'
                  : 'text-[var(--gf-muted)]'
              }`}
            >
              Semester {n}
            </button>
          ))}
        </div>
      </div>

      {/* Semester content */}
      <div key={activeSemester} className="space-y-4 animate-fade-in">
        <div className="flex items-end justify-between px-1">
          <div>
            <h2 className="text-xl font-bold text-[var(--gf-text)]">Semester {activeSemester} Overview</h2>
            <p className="text-xs text-[var(--gf-muted)] mt-0.5">Tap a module to log a mark</p>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold tracking-wide text-[var(--gf-muted)]">ASSESSMENTS</div>
            <div className="text-sm font-bold text-[var(--gf-text)]">{semesterMarks.length} Total</div>
          </div>
        </div>

        {tabModules.length === 0 ? (
          <div className="py-12 text-center bg-[var(--gf-card)] rounded-3xl border border-dashed border-[var(--gf-border)] p-6">
            <BookOpen className="w-12 h-12 text-[var(--gf-border)] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[var(--gf-text)]">No modules for Semester {activeSemester} yet</h3>
            <p className="text-xs text-[var(--gf-muted)] max-w-sm mx-auto mt-1 mb-4">
              Add a module for this semester (or set an existing one's semester in Modules), then tap it here to log marks.
            </p>
            <button
              onClick={() => setIsQuickAddModuleOpen(true)}
              className="gf-3d-button px-5 py-2.5 text-xs font-bold text-white shadow-md inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Module
            </button>
          </div>
        ) : (
          tabModules.map((mod) => {
            const modMarks = semesterMarks.filter((a) => a.moduleId === mod.id);
            const avg = calculateModuleAverage(modMarks);
            return (
              <div
                key={mod.id}
                role="button"
                tabIndex={0}
                onClick={() => logMarkFor(mod.id)}
                onKeyDown={(e) => e.key === 'Enter' && logMarkFor(mod.id)}
                className="p-5 rounded-3xl bg-[var(--gf-card)] border border-[var(--gf-border)] shadow-xs cursor-pointer transition-colors hover:border-[var(--gf-primary)]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl shrink-0" style={{ backgroundColor: mod.colour }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-bold text-[var(--gf-text)] truncate">{mod.name}</div>
                    <div className="text-[11px] text-[var(--gf-muted)]">
                      {mod.code ? `${mod.code} · ` : ''}{mod.creditHours} Credits
                    </div>
                  </div>
                  <div className="text-lg font-black text-[var(--gf-text)]">
                    {modMarks.length > 0 ? `${Math.round(avg)}%` : '--'}
                  </div>
                </div>

                {modMarks.length > 0 && (
                  <div className="mt-4">
                    {modMarks.map((mark) => (
                      <div key={mark.id} className="flex items-center gap-2 py-2.5 border-t border-[var(--gf-tint)]">
                        <span className="flex-1 text-xs font-medium text-[var(--gf-muted)]">{mark.name}</span>
                        <span className="text-xs font-bold text-[var(--gf-text)]">
                          {mark.score}/{mark.totalScore}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Remove mark for "${mark.name}"?`)) deleteAssessment(mark.id);
                          }}
                          className="p-1 rounded-full text-[var(--gf-muted)] hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete Mark"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
