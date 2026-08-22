import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AssessmentType } from '../../types';
import { X, Award, Percent, Calculator, Calendar, BookOpen, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';

export const AddMarkModal: React.FC = () => {
  const {
    isQuickAddMarkOpen,
    setIsQuickAddMarkOpen,
    modules,
    addAssessment,
    selectedModuleIdForDetail,
  } = useApp();

  const [moduleId, setModuleId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [assessmentType, setAssessmentType] = useState<AssessmentType>('assignment');
  const [inputMode, setInputMode] = useState<'raw' | 'percentage'>('raw');
  const [score, setScore] = useState<string>('85');
  const [totalScore, setTotalScore] = useState<string>('100');
  const [percentage, setPercentage] = useState<number>(85);
  const [weighting, setWeighting] = useState<string>('15');
  const [assessmentDate, setAssessmentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (modules.length > 0) {
      if (selectedModuleIdForDetail) {
        setModuleId(selectedModuleIdForDetail);
      } else if (!moduleId) {
        setModuleId(modules[0].id);
      }
    }
  }, [modules, selectedModuleIdForDetail, isQuickAddMarkOpen]);

  // Recalculate percentage when raw scores change
  useEffect(() => {
    if (inputMode === 'raw') {
      const s = parseFloat(score);
      const t = parseFloat(totalScore);
      if (!isNaN(s) && !isNaN(t) && t > 0) {
        const calculated = (s / t) * 100;
        setPercentage(Math.round(calculated * 10) / 10);
      }
    } else {
      const p = parseFloat(score);
      if (!isNaN(p)) {
        setPercentage(Math.min(100, Math.max(0, p)));
      }
    }
  }, [score, totalScore, inputMode]);

  if (!isQuickAddMarkOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter an assessment title.');
      return;
    }
    if (!moduleId) {
      setError('Please select a course / module.');
      return;
    }

    const s = parseFloat(score);
    const t = inputMode === 'raw' ? parseFloat(totalScore) : 100;
    const w = weighting ? parseFloat(weighting) : undefined;

    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      setError('Percentage must be between 0% and 100%.');
      return;
    }

    addAssessment({
      moduleId,
      name: name.trim(),
      assessmentType,
      score: isNaN(s) ? percentage : s,
      totalScore: isNaN(t) ? 100 : t,
      percentage,
      weighting: w,
      assessmentDate,
      notes: notes.trim() || undefined,
    });

    if (percentage >= 90) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#dd2987', '#ec68a0', '#f6b9d5', '#ffd700'],
      });
    }

    // Reset and close
    setName('');
    setNotes('');
    setError('');
    setIsQuickAddMarkOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg shadow-2xl border border-[#f6b9d5] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#fdedf5] to-[#fff5f9] px-6 py-4 border-b border-[#f6b9d5]/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-[#ec68a0] to-[#dd2987] text-white flex items-center justify-center shadow-xs">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2c1228]">Log Assessment Mark</h3>
              <p className="text-xs text-[#7a5672]">Record grades and update your academic average</p>
            </div>
          </div>
          <button
            onClick={() => setIsQuickAddMarkOpen(false)}
            className="p-1.5 text-[#7a5672] hover:text-[#dd2987] hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Module Selector */}
          <div>
            <label className="block text-xs font-bold text-[#2c1228] mb-1 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#dd2987]" />
              Academic Module *
            </label>
            <select
              id="mark-module-select"
              value={moduleId}
              onChange={(e) => setModuleId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#fdedf5]/50 border border-[#f6b9d5] text-sm font-semibold text-[#2c1228] focus:outline-none focus:ring-2 focus:ring-[#dd2987]"
            >
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.code ? `[${m.code}] ` : ''}{m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Assessment Title */}
          <div>
            <label className="block text-xs font-bold text-[#2c1228] mb-1">
              Assessment Name *
            </label>
            <input
              id="mark-name-input"
              type="text"
              required
              placeholder="e.g. Midterm Exam 1, Lab 4, Essay Final"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#fdedf5]/30 border border-[#f6b9d5] text-sm text-[#2c1228] focus:outline-none focus:ring-2 focus:ring-[#dd2987]"
            />
          </div>

          {/* Assessment Type Pills */}
          <div>
            <label className="block text-xs font-bold text-[#2c1228] mb-1.5">
              Assessment Type
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(
                ['assignment', 'test', 'exam', 'project', 'quiz', 'lab', 'custom'] as AssessmentType[]
              ).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setAssessmentType(type)}
                  className={`px-3 py-1.5 text-xs font-bold capitalize transition-all cursor-pointer ${
                    assessmentType === type
                      ? 'gf-pill-active'
                      : 'bg-[#fdedf5] text-[#6b4c62] hover:bg-[#f6b9d5]/50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Score Conversion Box */}
          <div className="p-4 bg-gradient-to-br from-[#fff7fb] to-[#fdedf5] border border-[#f6b9d5]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#2c1228] flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-[#dd2987]" />
                Score & Grade Calculation
              </span>
              {/* Toggle Mode */}
              <div className="flex bg-white p-0.5 border border-[#f6b9d5]/80">
                <button
                  type="button"
                  onClick={() => setInputMode('raw')}
                  className={`px-2.5 py-1 text-[11px] font-bold transition-all ${
                    inputMode === 'raw'
                      ? 'bg-[#dd2987] text-white'
                      : 'text-[#6b4c62] hover:text-[#dd2987]'
                  }`}
                >
                  Raw Score
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('percentage')}
                  className={`px-2.5 py-1 text-[11px] font-bold transition-all ${
                    inputMode === 'percentage'
                      ? 'bg-[#dd2987] text-white'
                      : 'text-[#6b4c62] hover:text-[#dd2987]'
                  }`}
                >
                  Direct %
                </button>
              </div>
            </div>

            {inputMode === 'raw' ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#6b4c62] mb-1">
                    Score Achieved
                  </label>
                  <input
                    id="mark-score-input"
                    type="number"
                    step="0.1"
                    min="0"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#f6b9d5] text-sm font-bold text-[#2c1228] focus:outline-none focus:ring-2 focus:ring-[#dd2987]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#6b4c62] mb-1">
                    Total Possible
                  </label>
                  <input
                    id="mark-total-input"
                    type="number"
                    step="0.1"
                    min="1"
                    value={totalScore}
                    onChange={(e) => setTotalScore(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#f6b9d5] text-sm font-bold text-[#2c1228] focus:outline-none focus:ring-2 focus:ring-[#dd2987]"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-[11px] font-semibold text-[#6b4c62] mb-1">
                  Percentage (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#f6b9d5] text-sm font-bold text-[#2c1228] focus:outline-none focus:ring-2 focus:ring-[#dd2987]"
                />
              </div>
            )}

            {/* Calculated Percentage Preview */}
            <div className="mt-3 pt-3 border-t border-[#f6b9d5]/60 flex items-center justify-between">
              <span className="text-xs font-medium text-[#6b4c62]">Calculated Result:</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold text-[#dd2987]">
                  {percentage.toFixed(1)}%
                </span>
                <span className="text-xs font-bold px-2 py-0.5 bg-[#dd2987] text-white">
                  {percentage >= 90 ? 'A' : percentage >= 80 ? 'B' : percentage >= 70 ? 'C' : percentage >= 60 ? 'D' : 'F'}
                </span>
              </div>
            </div>
          </div>

          {/* Weighting and Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2c1228] mb-1 flex items-center gap-1">
                <Percent className="w-3.5 h-3.5 text-[#dd2987]" />
                Weight in Course (%)
              </label>
              <input
                id="mark-weight-input"
                type="number"
                step="0.5"
                min="0"
                max="100"
                placeholder="e.g. 20"
                value={weighting}
                onChange={(e) => setWeighting(e.target.value)}
                className="w-full px-3 py-2 bg-[#fdedf5]/30 border border-[#f6b9d5] text-sm text-[#2c1228] focus:outline-none focus:ring-2 focus:ring-[#dd2987]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2c1228] mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#dd2987]" />
                Date Received
              </label>
              <input
                id="mark-date-input"
                type="date"
                value={assessmentDate}
                onChange={(e) => setAssessmentDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#fdedf5]/30 border border-[#f6b9d5] text-sm text-[#2c1228] focus:outline-none focus:ring-2 focus:ring-[#dd2987]"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-[#2c1228] mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-[#dd2987]" />
              Feedback / Reflection Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="What went well? Topics to review next time..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#fdedf5]/30 border border-[#f6b9d5] text-xs text-[#2c1228] focus:outline-none focus:ring-2 focus:ring-[#dd2987] resize-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsQuickAddMarkOpen(false)}
              className="px-4 py-2.5 text-xs font-bold text-[#6b4c62] hover:bg-[#fdedf5] transition-colors"
            >
              Cancel
            </button>
            <button
              id="save-mark-submit-btn"
              type="submit"
              className="gf-3d-button px-6 py-2.5 text-xs font-bold text-white shadow-md cursor-pointer transition-transform active:scale-95"
            >
              Save Mark
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
