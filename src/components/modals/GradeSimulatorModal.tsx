import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateModuleAverage, calculateRequiredMark } from '../../utils/academicCalculations';
import { X, Sparkles, Target, HelpCircle } from 'lucide-react';

interface GradeSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultModuleId?: string;
}

export const GradeSimulatorModal: React.FC<GradeSimulatorModalProps> = ({
  isOpen,
  onClose,
  defaultModuleId,
}) => {
  const { modules, assessments } = useApp();

  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  const [targetGrade, setTargetGrade] = useState<number>(90);
  const [remainingWeight, setRemainingWeight] = useState<number>(40);

  useEffect(() => {
    if (defaultModuleId) {
      setSelectedModuleId(defaultModuleId);
    } else if (modules.length > 0 && !selectedModuleId) {
      setSelectedModuleId(modules[0].id);
    }
  }, [defaultModuleId, modules, selectedModuleId]);

  if (!isOpen) return null;

  const currentModule = modules.find((m) => m.id === selectedModuleId);
  const modAssessments = assessments.filter((a) => a.moduleId === selectedModuleId);
  const currentAverage = calculateModuleAverage(modAssessments);

  // Completed weight sum
  const completedWeight = Math.min(
    100,
    modAssessments.reduce((sum, a) => sum + (a.weighting || 0), 0)
  );

  const effectiveRemainingWeight = remainingWeight > 0 ? remainingWeight : Math.max(1, 100 - completedWeight);

  const simulation = calculateRequiredMark(
    currentAverage || 85,
    100 - effectiveRemainingWeight,
    targetGrade
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-[#ffd6ee] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#fff0f8] to-[#fff5f9] px-6 py-4 border-b border-[#ffd6ee] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#ff6ec7] to-[#e91e8c] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1e0f3e]">What-If Grade Simulator</h3>
              <p className="text-xs text-[#7b5ea7]">Calculate target score needed on final exam</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#7b5ea7] hover:text-[#e91e8c] hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Select Module */}
          <div>
            <label className="block text-xs font-bold text-[#1e0f3e] mb-1">
              Select Module
            </label>
            <select
              value={selectedModuleId}
              onChange={(e) => setSelectedModuleId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#fff0f8] border border-[#ffd6ee] text-sm font-semibold text-[#1e0f3e] focus:outline-none focus:ring-2 focus:ring-[#e91e8c]"
            >
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.code ? `[${m.code}] ` : ''}{m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Current Standing Card */}
          <div className="p-3.5 rounded-2xl bg-[#fff0f8] border border-[#ffd6ee] flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#7b5ea7] uppercase tracking-wider block">
                Current Course Standing
              </span>
              <span className="text-xl font-extrabold text-[#e91e8c]">
                {currentAverage > 0 ? `${currentAverage.toFixed(1)}%` : 'No marks yet'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold text-[#7b5ea7] uppercase tracking-wider block">
                Assessments Done
              </span>
              <span className="text-sm font-bold text-[#1e0f3e]">
                {modAssessments.length} logged
              </span>
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-[#1e0f3e] flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-[#e91e8c]" />
                  Desired Final Grade
                </label>
                <span className="text-xs font-extrabold text-[#e91e8c] bg-[#fff0f8] rounded-full px-2 py-0.5">
                  {targetGrade}% ({targetGrade >= 90 ? 'A' : targetGrade >= 80 ? 'B' : 'C'})
                </span>
              </div>
              <input
                type="range"
                min="60"
                max="100"
                step="1"
                value={targetGrade}
                onChange={(e) => setTargetGrade(Number(e.target.value))}
                className="w-full accent-[#e91e8c] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#7b5ea7]">
                <span>60% (Pass)</span>
                <span>80% (B)</span>
                <span>90% (A)</span>
                <span>100% (A+)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-[#1e0f3e] flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-[#e91e8c]" />
                  Final / Remaining Weight
                </label>
                <span className="text-xs font-extrabold text-[#1e0f3e] bg-[#fff0f8] rounded-full px-2 py-0.5">
                  {effectiveRemainingWeight}% of total course
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="80"
                step="5"
                value={effectiveRemainingWeight}
                onChange={(e) => setRemainingWeight(Number(e.target.value))}
                className="w-full accent-[#e91e8c] cursor-pointer"
              />
            </div>
          </div>

          {/* Simulation Output Card */}
          <div
            className={`p-5 rounded-2xl border text-center transition-all ${
              simulation.achievable && simulation.requiredPercentage <= 100
                ? 'bg-[#fff0f8] border-[#ffd6ee]'
                : 'bg-rose-50 border-rose-200'
            }`}
          >
            <span className="text-xs font-bold text-[#7b5ea7] block mb-1">
              Score Needed on Upcoming {effectiveRemainingWeight}% Exam:
            </span>
            <div className="flex items-center justify-center gap-2 my-2">
              <span
                className={`text-4xl font-extrabold tracking-tight ${
                  simulation.requiredPercentage > 100
                    ? 'text-rose-600'
                    : simulation.requiredPercentage <= 75
                    ? 'text-emerald-600'
                    : 'text-[#e91e8c]'
                }`}
              >
                {simulation.requiredPercentage}%
              </span>
            </div>

            <p className="text-xs font-medium text-[#7b5ea7]">
              {simulation.requiredPercentage <= 100 ? (
                <>
                  Scoring <strong className="text-[#e91e8c]">{simulation.requiredPercentage}%</strong> or higher on your final will guarantee your goal of <strong>{targetGrade}%</strong> in {currentModule?.name || 'this module'}.
                </>
              ) : (
                <span className="text-rose-600 font-semibold">
                  This target is mathematically unreachable with current marks without extra credit.
                </span>
              )}
            </p>
          </div>

          {/* Button */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="gf-3d-button px-6 py-2.5 text-xs font-bold text-white cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
