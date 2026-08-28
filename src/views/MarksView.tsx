import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  calculateOverallAverage,
  percentageToGpa,
  percentageToLetter,
} from '../utils/academicCalculations';
import {
  Award,
  Plus,
  Filter,
  Calculator,
  Search,
  Trash2,
} from 'lucide-react';
import { GradeSimulatorModal } from '../components/modals/GradeSimulatorModal';

export const MarksView: React.FC = () => {
  const {
    modules,
    assessments,
    deleteAssessment,
    setIsQuickAddMarkOpen,
  } = useApp();

  const [selectedModuleFilter, setSelectedModuleFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [calculationMode, setCalculationMode] = useState<'weighted' | 'arithmetic'>('weighted');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);

  // Overall average based on active modules
  const overallAverage = calculateOverallAverage(modules, assessments);
  const currentGpa = percentageToGpa(overallAverage);
  const letterGrade = percentageToLetter(overallAverage);

  // Filtered assessments
  const filteredAssessments = assessments.filter((a) => {
    const matchesModule = selectedModuleFilter === 'all' || a.moduleId === selectedModuleFilter;
    const matchesType = selectedTypeFilter === 'all' || a.assessmentType === selectedTypeFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.notes && a.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesModule && matchesType && matchesSearch;
  });

  // Highest & lowest score
  const highestMark = assessments.length > 0 ? Math.max(...assessments.map((a) => a.percentage)) : 0;

  return (
    <div className="space-y-5 pb-24 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--gf-card)] p-5 rounded-3xl border border-[var(--gf-border)] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[var(--gf-tint)] text-[var(--gf-primary)] flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--gf-text)] tracking-tight">
              Marks & Grade Tracker
            </h1>
          </div>
          <p className="text-xs text-[var(--gf-muted)] mt-1">
            Log assessments, track weighted distributions, and calculate your GPA
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSimulatorOpen(true)}
            className="px-3.5 py-2 rounded-2xl bg-[var(--gf-tint)] hover:bg-[var(--gf-border)]/40 border border-[var(--gf-border)] text-xs font-bold text-[var(--gf-primary)] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Calculator className="w-4 h-4" />
            <span>What-If Simulator</span>
          </button>

          <button
            id="marks-log-mark-btn"
            onClick={() => setIsQuickAddMarkOpen(true)}
            className="gf-3d-button flex items-center gap-1.5 px-4 py-2 text-white text-xs font-bold cursor-pointer shadow-md transition-transform active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Log Mark</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="gf-3d-card p-4">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--gf-muted)] block">
            Overall Average
          </span>
          <div className="text-2xl font-extrabold text-[var(--gf-text)] mt-1">
            {overallAverage > 0 ? `${overallAverage.toFixed(1)}%` : '--'}
          </div>
          <span className="text-[11px] font-bold text-[var(--gf-primary)]">
            {overallAverage > 0 ? `Letter: ${letterGrade}` : 'No grades'}
          </span>
        </div>

        <div className="gf-3d-card p-4">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--gf-muted)] block">
            Calculated GPA
          </span>
          <div className="text-2xl font-extrabold text-[var(--gf-primary)] mt-1">
            {overallAverage > 0 ? currentGpa.toFixed(2) : '--'}
          </div>
          <span className="text-[11px] font-semibold text-[var(--gf-muted)]">Scale of 4.0</span>
        </div>

        <div className="gf-3d-card p-4">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--gf-muted)] block">
            Highest Score
          </span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">
            {highestMark > 0 ? `${highestMark.toFixed(1)}%` : '--'}
          </div>
          <span className="text-[11px] font-semibold text-[var(--gf-muted)]">Personal best</span>
        </div>

        <div className="gf-3d-card p-4">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--gf-muted)] block">
            Total Logged
          </span>
          <div className="text-2xl font-extrabold text-[var(--gf-text)] mt-1">
            {assessments.length}
          </div>
          <span className="text-[11px] font-semibold text-[var(--gf-muted)]">Assessments</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[var(--gf-card)] p-4 rounded-3xl border border-[var(--gf-border)] shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[var(--gf-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search assessment name or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-2xl bg-[var(--gf-tint)] border border-[var(--gf-border)] text-xs text-[var(--gf-text)] focus:outline-none focus:ring-2 focus:ring-[var(--gf-primary)]"
            />
          </div>

          {/* Calculation Method Toggle */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[var(--gf-muted)] font-semibold hidden sm:inline">Averaging:</span>
            <div className="flex bg-[var(--gf-tint)] p-1 rounded-2xl border border-[var(--gf-border)]">
              <button
                onClick={() => setCalculationMode('weighted')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  calculationMode === 'weighted'
                    ? 'bg-[var(--gf-card)] text-[var(--gf-primary)] shadow-xs'
                    : 'text-[var(--gf-muted)]'
                }`}
              >
                Syllabus Weighted
              </button>
              <button
                onClick={() => setCalculationMode('arithmetic')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  calculationMode === 'arithmetic'
                    ? 'bg-[var(--gf-card)] text-[var(--gf-primary)] shadow-xs'
                    : 'text-[var(--gf-muted)]'
                }`}
              >
                Simple Mean
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-bold text-[var(--gf-muted)] flex items-center gap-1">
            <Filter className="w-3 h-3" /> Course:
          </span>
          <button
            onClick={() => setSelectedModuleFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedModuleFilter === 'all'
                ? 'gf-pill-active'
                : 'bg-[var(--gf-tint)] text-[var(--gf-muted)] hover:bg-[var(--gf-border)]/40'
            }`}
          >
            All Courses
          </button>
          {modules.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedModuleFilter(m.id)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedModuleFilter === m.id
                  ? 'gf-pill-active'
                  : 'bg-[var(--gf-tint)] text-[var(--gf-muted)] hover:bg-[var(--gf-border)]/40'
              }`}
            >
              {m.code}
            </button>
          ))}
        </div>

        {/* Assessment Type Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[var(--gf-tint)]">
          <span className="text-xs font-bold text-[var(--gf-muted)]">Type:</span>
          {(['all', 'assignment', 'test', 'exam', 'project', 'quiz', 'lab'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedTypeFilter(type)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold capitalize transition-all cursor-pointer ${
                selectedTypeFilter === type
                  ? 'bg-[var(--gf-primary)] text-white'
                  : 'bg-[var(--gf-card)] border border-[var(--gf-border)] text-[var(--gf-muted)] hover:text-[var(--gf-primary)]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Marks Ledger Table / List */}
      <div className="space-y-3">
        {filteredAssessments.length === 0 ? (
          <div className="py-12 text-center bg-[var(--gf-card)] rounded-3xl border border-dashed border-[var(--gf-border)] p-6">
            <Award className="w-12 h-12 text-[var(--gf-border)] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[var(--gf-text)]">No assessment marks found</h3>
            <p className="text-xs text-[var(--gf-muted)] max-w-sm mx-auto mt-1 mb-4">
              Try adjusting your search filters or record a new assessment grade.
            </p>
            <button
              onClick={() => setIsQuickAddMarkOpen(true)}
              className="gf-3d-button px-5 py-2.5 text-xs font-bold text-white shadow-md inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Log Mark
            </button>
          </div>
        ) : (
          filteredAssessments.map((mark) => {
            const mod = modules.find((m) => m.id === mark.moduleId);
            const letter = percentageToLetter(mark.percentage);

            return (
              <div
                key={mark.id}
                className="gf-3d-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-[var(--gf-primary)]"
              >
                {/* Left info */}
                <div className="flex items-start gap-3.5">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-extrabold text-[10px] shadow-xs shrink-0"
                    style={{ backgroundColor: mod?.colour || 'var(--gf-primary)' }}
                  >
                    {mod?.code.split(' ')[0] || 'MOD'}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-[var(--gf-text)]">{mark.name}</h4>
                      <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-[var(--gf-tint)] text-[var(--gf-primary)]">
                        {mark.assessmentType}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[var(--gf-muted)] mt-1 flex-wrap">
                      <span>{mod?.name || 'Unknown Course'}</span>
                      <span>•</span>
                      <span>
                        Raw: <strong className="text-[var(--gf-text)]">{mark.score}</strong> / {mark.totalScore}
                      </span>
                      {mark.weighting && (
                        <>
                          <span>•</span>
                          <span>Weight: <strong className="text-[var(--gf-text)]">{mark.weighting}%</strong></span>
                        </>
                      )}
                      <span>•</span>
                      <span>{mark.assessmentDate}</span>
                    </div>

                    {mark.notes && (
                      <p className="text-xs text-[var(--gf-muted)] italic mt-2 bg-white/70 rounded-xl p-2 border border-[var(--gf-border)]/60 max-w-xl">
                        "{mark.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Right score and delete */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-[var(--gf-border)]/30">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-extrabold text-[var(--gf-primary)]">
                      {mark.percentage.toFixed(1)}%
                    </span>
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-[var(--gf-primary)] text-white shadow-xs">
                      {letter}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => {
                        if (confirm(`Remove mark for "${mark.name}"?`)) {
                          deleteAssessment(mark.id);
                        }
                      }}
                      className="p-1.5 rounded-full text-[var(--gf-muted)] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Mark"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Simulator Modal */}
      <GradeSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
      />
    </div>
  );
};
