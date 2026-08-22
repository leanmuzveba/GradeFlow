import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, BookOpen, UserCheck, Hash, Target, Check } from 'lucide-react';

const PALETTE_SWATCHES = [
  { hex: '#dd2987', label: 'Berry Magenta' },
  { hex: '#ec68a0', label: 'Vibrant Pink' },
  { hex: '#ed8cb9', label: 'Medium Rose' },
  { hex: '#f6b9d5', label: 'Blush Pastel' },
  { hex: '#b32069', label: 'Deep Wine' },
  { hex: '#d94b80', label: 'Flamingo' },
  { hex: '#8e3a73', label: 'Purple Orchid' },
  { hex: '#ff758c', label: 'Coral Rose' },
];

export const AddModuleModal: React.FC = () => {
  const { isQuickAddModuleOpen, setIsQuickAddModuleOpen, addModule } = useApp();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [colour, setColour] = useState(PALETTE_SWATCHES[0].hex);
  const [academicPeriod, setAcademicPeriod] = useState('Fall 2026');
  const [creditHours, setCreditHours] = useState('4');
  const [instructor, setInstructor] = useState('');
  const [room, setRoom] = useState('');
  const [targetGrade, setTargetGrade] = useState('90');
  const [error, setError] = useState('');

  if (!isQuickAddModuleOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a module or course name.');
      return;
    }

    addModule({
      name: name.trim(),
      code: code.trim().toUpperCase() || 'MOD',
      colour,
      academicPeriod,
      moduleWeight: 1.0,
      creditHours: parseFloat(creditHours) || 3,
      instructor: instructor.trim() || undefined,
      room: room.trim() || undefined,
      targetGrade: parseFloat(targetGrade) || 85,
      isArchived: false,
    });

    setName('');
    setCode('');
    setInstructor('');
    setRoom('');
    setError('');
    setIsQuickAddModuleOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg shadow-2xl border border-[#f6b9d5] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#fdedf5] to-[#fff5f9] px-6 py-4 border-b border-[#f6b9d5]/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-[#ec68a0] to-[#dd2987] text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2c1228]">New Course / Module</h3>
              <p className="text-xs text-[#7a5672]">Add a new subject to your academic semester</p>
            </div>
          </div>
          <button
            onClick={() => setIsQuickAddModuleOpen(false)}
            className="p-1.5 text-[#7a5672] hover:text-[#dd2987] hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Module Name */}
          <div>
            <label className="block text-xs font-bold text-[#2c1228] mb-1">
              Course / Module Name *
            </label>
            <input
              id="new-module-name"
              type="text"
              required
              placeholder="e.g. Data Structures & Algorithms, Physics II"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#fdedf5]/30 border border-[#f6b9d5] text-sm text-[#2c1228] focus:outline-none focus:ring-2 focus:ring-[#dd2987]"
            />
          </div>

          {/* Code & Period */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2c1228] mb-1 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-[#dd2987]" />
                Course Code
              </label>
              <input
                id="new-module-code"
                type="text"
                placeholder="e.g. CS 201"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 bg-[#fdedf5]/30 border border-[#f6b9d5] text-sm font-semibold uppercase text-[#2c1228] focus:outline-none focus:ring-2 focus:ring-[#dd2987]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2c1228] mb-1">
                Semester / Term
              </label>
              <input
                type="text"
                placeholder="e.g. Fall 2026"
                value={academicPeriod}
                onChange={(e) => setAcademicPeriod(e.target.value)}
                className="w-full px-3 py-2 bg-[#fdedf5]/30 border border-[#f6b9d5] text-sm text-[#2c1228] focus:outline-none focus:ring-2 focus:ring-[#dd2987]"
              />
            </div>
          </div>

          {/* Color Palette Swatches */}
          <div>
            <label className="block text-xs font-bold text-[#2c1228] mb-1.5">
              Course Color Tag (GradeFlow Palette)
            </label>
            <div className="flex flex-wrap gap-2.5">
              {PALETTE_SWATCHES.map((swatch) => {
                const isSelected = colour === swatch.hex;
                return (
                  <button
                    key={swatch.hex}
                    type="button"
                    title={swatch.label}
                    onClick={() => setColour(swatch.hex)}
                    className="w-8 h-8 flex items-center justify-center transition-transform hover:scale-105 relative cursor-pointer"
                    style={{
                      backgroundColor: swatch.hex,
                      boxShadow: isSelected ? `0 0 0 2px #fff, 0 0 0 4px ${swatch.hex}` : 'none',
                    }}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white drop-shadow-xs" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Credits & Target Grade */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2c1228] mb-1">
                Credit Hours
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="12"
                value={creditHours}
                onChange={(e) => setCreditHours(e.target.value)}
                className="w-full px-3 py-2 bg-[#fdedf5]/30 border border-[#f6b9d5] text-sm font-semibold text-[#2c1228] focus:outline-none focus:ring-2 focus:ring-[#dd2987]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2c1228] mb-1 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-[#dd2987]" />
                Target Grade (%)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                max="100"
                value={targetGrade}
                onChange={(e) => setTargetGrade(e.target.value)}
                className="w-full px-3 py-2 bg-[#fdedf5]/30 border border-[#f6b9d5] text-sm font-bold text-[#dd2987] focus:outline-none focus:ring-2 focus:ring-[#dd2987]"
              />
            </div>
          </div>

          {/* Instructor & Classroom */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2c1228] mb-1 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-[#dd2987]" />
                Professor / Instructor
              </label>
              <input
                type="text"
                placeholder="e.g. Dr. Vance"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                className="w-full px-3 py-2 bg-[#fdedf5]/30 border border-[#f6b9d5] text-sm text-[#2c1228] focus:outline-none focus:ring-2 focus:ring-[#dd2987]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2c1228] mb-1">
                Classroom / Hall
              </label>
              <input
                type="text"
                placeholder="e.g. Room 302"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full px-3 py-2 bg-[#fdedf5]/30 border border-[#f6b9d5] text-sm text-[#2c1228] focus:outline-none focus:ring-2 focus:ring-[#dd2987]"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsQuickAddModuleOpen(false)}
              className="px-4 py-2.5 text-xs font-bold text-[#6b4c62] hover:bg-[#fdedf5] transition-colors"
            >
              Cancel
            </button>
            <button
              id="save-module-submit-btn"
              type="submit"
              className="gf-3d-button px-6 py-2.5 text-xs font-bold text-white shadow-md cursor-pointer transition-transform active:scale-95"
            >
              Create Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
