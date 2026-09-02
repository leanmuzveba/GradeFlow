import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { calculateModuleAverage, percentageToLetter } from '../utils/academicCalculations';
import {
  BookOpen,
  Plus,
  Clock,
  Award,
  Timer,
  Archive,
  Trash2,
  ChevronRight,
  X,
  Calendar,
  Check,
  Palette,
} from 'lucide-react';
import { AcademicModule } from '../types';
import { PALETTE_SWATCHES } from '../components/modals/AddModuleModal';

export const ModulesView: React.FC = () => {
  const {
    modules,
    assessments,
    studySessions,
    events,
    setIsQuickAddModuleOpen,
    setIsQuickAddMarkOpen,
    setIsQuickAddEventOpen,
    selectedModuleIdForDetail,
    setSelectedModuleIdForDetail,
    toggleArchiveModule,
    deleteModule,
    updateModule,
    setActiveTab,
    setFocusTimerAutoModuleId,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'active' | 'archived'>('active');

  const filteredModules = modules.filter((m) =>
    activeFilter === 'active' ? !m.isArchived : m.isArchived
  );

  const selectedModule = modules.find((m) => m.id === selectedModuleIdForDetail);
  const selectedModAssessments = selectedModule
    ? assessments.filter((a) => a.moduleId === selectedModule.id)
    : [];
  const selectedModEvents = selectedModule
    ? events.filter((e) => e.moduleId === selectedModule.id && !e.isCompleted)
    : [];
  const selectedModSessions = selectedModule
    ? studySessions.filter((s) => s.moduleId === selectedModule.id && s.status === 'completed')
    : [];
  const selectedModTotalStudySeconds = selectedModSessions.reduce(
    (acc, s) => acc + s.durationSeconds,
    0
  );
  const selectedModStudyHours = Math.round((selectedModTotalStudySeconds / 3600) * 10) / 10;
  const selectedModAverage = selectedModule
    ? calculateModuleAverage(selectedModAssessments)
    : 0;

  return (
    <div className="space-y-5 pb-24 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--gf-card)] p-5 rounded-3xl border border-[var(--gf-border)] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[var(--gf-tint)] text-[var(--gf-primary)] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--gf-text)] tracking-tight">
              Academic Modules
            </h1>
          </div>
          <p className="text-xs text-[var(--gf-muted)] mt-1">
            Manage your courses, assessment weightings, syllabus requirements, and study time
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Active / Archive Toggle */}
          <div className="flex bg-[var(--gf-tint)] p-1 rounded-2xl border border-[var(--gf-border)]">
            <button
              onClick={() => setActiveFilter('active')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'active'
                  ? 'bg-[var(--gf-card)] text-[var(--gf-primary)] shadow-xs'
                  : 'text-[var(--gf-muted)] hover:text-[var(--gf-primary)]'
              }`}
            >
              Active ({modules.filter((m) => !m.isArchived).length})
            </button>
            <button
              onClick={() => setActiveFilter('archived')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'archived'
                  ? 'bg-[var(--gf-card)] text-[var(--gf-primary)] shadow-xs'
                  : 'text-[var(--gf-muted)] hover:text-[var(--gf-primary)]'
              }`}
            >
              Archived ({modules.filter((m) => m.isArchived).length})
            </button>
          </div>

          <button
            id="add-new-module-btn"
            onClick={() => setIsQuickAddModuleOpen(true)}
            className="gf-3d-button flex items-center gap-1.5 px-4 py-2 text-white text-xs font-bold cursor-pointer shadow-md transition-transform active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>New Course</span>
          </button>
        </div>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredModules.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-[var(--gf-card)] rounded-3xl border border-dashed border-[var(--gf-border)] p-6">
            <BookOpen className="w-12 h-12 text-[var(--gf-border)] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[var(--gf-text)]">No modules found</h3>
            <p className="text-xs text-[var(--gf-muted)] max-w-sm mx-auto mt-1 mb-4">
              {activeFilter === 'active'
                ? 'Create your first academic module to begin logging grades and tracking study time.'
                : 'No archived courses.'}
            </p>
            {activeFilter === 'active' && (
              <button
                onClick={() => setIsQuickAddModuleOpen(true)}
                className="gf-3d-button px-5 py-2.5 text-xs font-bold text-white shadow-md inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Module
              </button>
            )}
          </div>
        ) : (
          filteredModules.map((mod) => {
            const modSessions = studySessions.filter(
              (s) => s.moduleId === mod.id && s.status === 'completed'
            );
            const totalSecs = modSessions.reduce((sum, s) => sum + s.durationSeconds, 0);
            const hours = Math.round((totalSecs / 3600) * 10) / 10;

            return (
              <div
                key={mod.id}
                onClick={() => setSelectedModuleIdForDetail(mod.id)}
                className="gf-3d-card p-5 relative overflow-hidden transition-all hover:border-[var(--gf-primary)] cursor-pointer flex flex-col justify-between group"
              >
                {/* Top accent bar with course color */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: mod.colour }}
                />

                <div className="flex items-center gap-3">
                  <div
                    className="w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center text-white font-extrabold text-[10px] leading-none tracking-tight text-center px-1 overflow-hidden shadow-xs"
                    style={{ backgroundColor: mod.colour }}
                  >
                    <span className="truncate w-full">{mod.code}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--gf-muted)]">
                      {mod.code}
                    </span>
                    <h3 className="text-base font-bold text-[var(--gf-text)] group-hover:text-[var(--gf-primary)] transition-colors">
                      {mod.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-[var(--gf-muted)]">
                      <Clock className="w-3.5 h-3.5 text-[var(--gf-primary)] shrink-0" />
                      <span>{hours} hrs studied</span>
                    </div>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="mt-4 pt-3 border-t border-[var(--gf-border)]/40 flex items-center justify-end">
                  <div className="flex items-center gap-1 text-xs font-bold text-[var(--gf-primary)] group-hover:translate-x-1 transition-transform">
                    <span>Course Details</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Module Detail Modal */}
      {selectedModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-[var(--gf-card)] w-full max-w-2xl rounded-3xl shadow-2xl border border-[var(--gf-border)] overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div
              className="p-6 text-white relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${selectedModule.colour} 0%, var(--gf-primary) 100%)`,
              }}
            >
              <div className="relative z-10 flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold mb-2">
                    <span>{selectedModule.code}</span>
                    <span>•</span>
                    <span>{selectedModule.academicPeriod}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold">{selectedModule.name}</h2>
                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-pink-100">
                    {selectedModule.instructor && <span>Instructor: {selectedModule.instructor}</span>}
                    {selectedModule.room && <span>Location: {selectedModule.room}</span>}
                    <span>Credits: {selectedModule.creditHours}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedModuleIdForDetail(null)}
                  className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Stats Strip */}
              <div className="grid grid-cols-3 gap-2 mt-5 bg-white/15 backdrop-blur-md rounded-2xl p-3 border border-white/20">
                <div className="text-center">
                  <span className="text-[10px] uppercase font-bold text-pink-100 block">Current Avg</span>
                  <span className="text-lg font-extrabold">
                    {selectedModAverage > 0 ? `${selectedModAverage.toFixed(1)}%` : '--'}
                  </span>
                </div>
                <div className="text-center border-x border-white/20">
                  <span className="text-[10px] uppercase font-bold text-pink-100 block">Time Studied</span>
                  <span className="text-lg font-extrabold">{selectedModStudyHours}h</span>
                </div>
                <div className="text-center">
                  <span className="text-[10px] uppercase font-bold text-pink-100 block">Target Grade</span>
                  <span className="text-lg font-extrabold">{selectedModule.targetGrade || 85}%</span>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto">
              {/* Quick Action Bar for this module */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setFocusTimerAutoModuleId(selectedModule.id);
                    setSelectedModuleIdForDetail(null);
                    setActiveTab('focus');
                  }}
                  className="gf-3d-button flex-1 min-w-[140px] py-2 px-3 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Timer className="w-4 h-4" /> Start Focus Session
                </button>
                <button
                  onClick={() => {
                    setIsQuickAddMarkOpen(true);
                  }}
                  className="bg-[var(--gf-tint)] hover:bg-[var(--gf-border)]/60 text-[var(--gf-primary)] rounded-2xl flex-1 min-w-[140px] py-2 px-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Award className="w-4 h-4" /> Log Assessment Mark
                </button>
                <button
                  onClick={() => {
                    setIsQuickAddEventOpen(true);
                  }}
                  className="bg-[var(--gf-tint)] hover:bg-[var(--gf-border)]/60 text-[var(--gf-primary)] rounded-2xl flex-1 min-w-[140px] py-2 px-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Calendar className="w-4 h-4" /> Add Deadline
                </button>
              </div>

              {/* Course Color */}
              <div>
                <h4 className="text-xs font-bold text-[var(--gf-text)] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Palette className="w-4 h-4 text-[var(--gf-primary)]" />
                  Course Color
                </h4>
                <div className="flex flex-wrap items-center gap-2.5">
                  {PALETTE_SWATCHES.map((swatch) => {
                    const isSelected = selectedModule.colour === swatch.hex;
                    return (
                      <button
                        key={swatch.hex}
                        type="button"
                        title={swatch.label}
                        onClick={() => updateModule(selectedModule.id, { colour: swatch.hex })}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-105 relative cursor-pointer"
                        style={{
                          backgroundColor: swatch.hex,
                          boxShadow: isSelected ? `0 0 0 2px var(--gf-card), 0 0 0 4px ${swatch.hex}` : 'none',
                        }}
                      >
                        {isSelected && <Check className="w-4 h-4 text-white drop-shadow-xs" />}
                      </button>
                    );
                  })}

                  <label
                    title="Pick any color"
                    className="w-8 h-8 rounded-full relative cursor-pointer transition-transform hover:scale-105 overflow-hidden shadow-xs"
                    style={{
                      background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)',
                      boxShadow: !PALETTE_SWATCHES.some((s) => s.hex === selectedModule.colour)
                        ? `0 0 0 2px var(--gf-card), 0 0 0 4px ${selectedModule.colour}`
                        : 'none',
                    }}
                  >
                    <input
                      type="color"
                      value={selectedModule.colour}
                      onChange={(e) => updateModule(selectedModule.id, { colour: e.target.value })}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </label>

                  <span className="text-[11px] font-mono font-semibold text-[var(--gf-muted)] px-2 py-1 rounded-lg bg-[var(--gf-tint)] border border-[var(--gf-border)]">
                    {selectedModule.colour.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Assessment Marks List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-[var(--gf-text)] uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-[var(--gf-primary)]" />
                    Assessment Marks ({selectedModAssessments.length})
                  </h4>
                  <button
                    onClick={() => setIsQuickAddMarkOpen(true)}
                    className="text-xs font-bold text-[var(--gf-primary)] hover:underline cursor-pointer"
                  >
                    + Add Mark
                  </button>
                </div>

                {selectedModAssessments.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-[var(--gf-tint)] border border-dashed border-[var(--gf-border)] text-center text-xs text-[var(--gf-muted)]">
                    No assessments recorded yet. Click "+ Add Mark" to log your first grade.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedModAssessments.map((a) => (
                      <div
                        key={a.id}
                        className="p-3 rounded-2xl bg-[var(--gf-tint)] border border-[var(--gf-border)] flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[var(--gf-text)]">{a.name}</span>
                            <span className="text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-[var(--gf-card)] border border-[var(--gf-border)] text-[var(--gf-primary)]">
                              {a.assessmentType}
                            </span>
                          </div>
                          <div className="text-[11px] text-[var(--gf-muted)] mt-0.5">
                            Raw: {a.score}/{a.totalScore} {a.weighting ? `• Weight: ${a.weighting}%` : ''} • {a.assessmentDate}
                          </div>
                          {a.notes && (
                            <p className="text-[11px] text-[var(--gf-muted)] italic mt-1 bg-[var(--gf-card)] rounded-lg p-1.5 border border-[var(--gf-border)]/60">
                              "{a.notes}"
                            </p>
                          )}
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-base font-extrabold text-[var(--gf-primary)]">
                            {a.percentage.toFixed(1)}%
                          </span>
                          <div className="text-[10px] font-bold text-[var(--gf-muted)]">
                            {percentageToLetter(a.percentage)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Course Deadlines */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-[var(--gf-text)] uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[var(--gf-primary)]" />
                    Upcoming Course Deadlines ({selectedModEvents.length})
                  </h4>
                </div>

                {selectedModEvents.length === 0 ? (
                  <div className="p-3 rounded-2xl bg-[var(--gf-tint)] border border-[var(--gf-border)]/60 text-center text-xs text-[var(--gf-muted)]">
                    No pending deadlines for this module.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedModEvents.map((evt) => (
                      <div
                        key={evt.id}
                        className="p-3 rounded-2xl bg-[var(--gf-card)] border border-[var(--gf-border)] flex items-center justify-between text-xs"
                      >
                        <span className="font-bold text-[var(--gf-text)]">{evt.title}</span>
                        <span className="text-[var(--gf-primary)] font-semibold">
                          {new Date(evt.dueAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Management Controls */}
              <div className="pt-4 border-t border-[var(--gf-border)]/40 flex items-center justify-between">
                <button
                  onClick={() => toggleArchiveModule(selectedModule.id)}
                  className="text-xs font-bold text-[var(--gf-muted)] hover:text-[var(--gf-primary)] flex items-center gap-1.5 cursor-pointer"
                >
                  <Archive className="w-4 h-4" />
                  {selectedModule.isArchived ? 'Restore Module' : 'Archive Module'}
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete ${selectedModule.name}?`)) {
                      deleteModule(selectedModule.id);
                    }
                  }}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Course
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
