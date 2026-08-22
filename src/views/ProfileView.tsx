import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Download,
  RotateCcw,
  Check,
  ShieldCheck,
  Palette,
  GraduationCap,
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const {
    profile,
    updateProfile,
    studyGoal,
    updateStudyGoal,
    modules,
    assessments,
    studySessions,
    events,
    resetAllData,
  } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [email, setEmail] = useState(profile.email);
  const [academicYear, setAcademicYear] = useState(profile.academicYear);
  const [semester, setSemester] = useState(profile.semester);
  const [targetGpa, setTargetGpa] = useState(profile.targetGpa);
  const [weeklyHours, setWeeklyHours] = useState(studyGoal.weeklyTargetHours);
  const [dailyMinutes, setDailyMinutes] = useState(studyGoal.dailyTargetMinutes);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      displayName: displayName.trim(),
      email: email.trim(),
      academicYear,
      semester,
      targetGpa: Number(targetGpa),
    });
    updateStudyGoal({
      weeklyTargetHours: Number(weeklyHours),
      dailyTargetMinutes: Number(dailyMinutes),
    });
    setIsEditing(false);
    setSuccessMsg('Profile & Study Goals successfully updated!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleExportData = () => {
    const backup = {
      profile,
      studyGoal,
      modules,
      assessments,
      studySessions,
      events,
      exportedAt: new Date().toISOString(),
    };
    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gradeflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 pb-24 animate-fade-in max-w-4xl mx-auto">
      {/* Header Profile Hero Card */}
      <div className="gf-3d-card p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
        <div className="relative">
          <img
            src={profile.avatarUrl}
            alt={profile.displayName}
            className="w-24 h-24 sm:w-28 sm:h-28 object-cover border-2 border-white shadow-md ring-2 ring-[#f6b9d5]"
          />
          <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-gradient-to-br from-[#ec68a0] to-[#dd2987] text-white flex items-center justify-center shadow-xs">
            <GraduationCap className="w-4 h-4" />
          </div>
        </div>

        <div className="text-center sm:text-left flex-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#fdedf5] text-xs font-extrabold text-[#dd2987] mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{profile.academicYear}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2c1228] tracking-tight">
            {profile.displayName}
          </h1>
          <p className="font-script text-lg leading-none text-[#dd2987] mt-1">
            Your academic life, in flow.
          </p>
          <p className="text-xs text-[#7a5672] mt-1.5">{profile.email}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3 text-xs font-semibold text-[#6b4c62]">
            <span>{profile.semester}</span>
            <span>•</span>
            <span>Target GPA: <strong className="text-[#dd2987]">{profile.targetGpa.toFixed(2)}</strong></span>
            <span>•</span>
            <span>Weekly Goal: <strong className="text-[#dd2987]">{studyGoal.weeklyTargetHours} hrs</strong></span>
          </div>
        </div>

        <button
          id="profile-edit-toggle-btn"
          onClick={() => setIsEditing(!isEditing)}
          className="gf-3d-button px-5 py-2.5 text-white text-xs font-bold shadow-md cursor-pointer active:scale-95 transition-transform whitespace-nowrap"
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          {successMsg}
        </div>
      )}

      {/* Edit Form */}
      {isEditing && (
        <form
          onSubmit={handleSaveProfile}
          className="bg-white p-6 border border-[#f6b9d5] shadow-md space-y-4 animate-fade-in"
        >
          <h3 className="text-base font-extrabold text-[#2c1228] pb-3 border-b border-[#fdedf5]">
            Edit Academic Profile & Preferences
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#2c1228] mb-1">Display Name</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#fdedf5]/30 border border-[#f6b9d5] text-sm text-[#2c1228] focus:outline-none focus:ring-2 focus:ring-[#dd2987]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2c1228] mb-1">Student Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#fdedf5]/30 border border-[#f6b9d5] text-sm text-[#2c1228] focus:outline-none focus:ring-2 focus:ring-[#dd2987]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2c1228] mb-1">Academic Year</label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#fdedf5]/30 border border-[#f6b9d5] text-sm text-[#2c1228] focus:outline-none focus:ring-2 focus:ring-[#dd2987]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2c1228] mb-1">Current Semester</label>
              <input
                type="text"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#fdedf5]/30 border border-[#f6b9d5] text-sm text-[#2c1228] focus:outline-none focus:ring-2 focus:ring-[#dd2987]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2c1228] mb-1">Target GPA (4.0 Scale)</label>
              <input
                type="number"
                step="0.05"
                min="2.0"
                max="4.0"
                value={targetGpa}
                onChange={(e) => setTargetGpa(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-[#fdedf5]/30 border border-[#f6b9d5] text-sm font-bold text-[#dd2987] focus:outline-none focus:ring-2 focus:ring-[#dd2987]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2c1228] mb-1">Weekly Study Target (Hours)</label>
              <input
                type="number"
                step="1"
                min="5"
                max="80"
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-[#fdedf5]/30 border border-[#f6b9d5] text-sm font-bold text-[#dd2987] focus:outline-none focus:ring-2 focus:ring-[#dd2987]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#fdedf5]">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-xs font-bold text-[#7a5672] hover:bg-[#fdedf5]"
            >
              Cancel
            </button>
            <button
              id="profile-save-btn"
              type="submit"
              className="gf-3d-button px-6 py-2.5 text-xs font-bold text-white shadow-md cursor-pointer"
            >
              Save Preferences
            </button>
          </div>
        </form>
      )}

      {/* GradeFlow Brand & Color Palette Showcase */}
      <div className="gf-3d-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-[#dd2987]" />
          <h3 className="text-base font-extrabold text-[#2c1228]">GradeFlow Visual Identity & Theme</h3>
        </div>

        <p className="text-xs text-[#6b4c62] mb-4">
          GradeFlow utilizes a soft pink, rose, and magenta color system designed for high focus and delight:
        </p>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[
            { hex: '#dd2987', name: 'Berry Magenta', role: 'Primary Accent' },
            { hex: '#ec68a0', name: 'Vibrant Pink', role: 'Secondary' },
            { hex: '#ed8cb9', name: 'Medium Rose', role: 'Tertiary' },
            { hex: '#f6b9d5', name: 'Soft Blush', role: 'Border Accent' },
            { hex: '#fdedf5', name: 'Blush Canvas', role: 'Background Light' },
            { hex: '#2c1228', name: 'Dark Berry', role: 'Text / Contrast' },
          ].map((c) => (
            <div key={c.hex} className="p-3 bg-white border border-[#f6b9d5]/60 text-center shadow-xs">
              <div
                className="w-10 h-10 mx-auto mb-2 border border-black/10 shadow-inner"
                style={{ backgroundColor: c.hex }}
              />
              <span className="text-xs font-bold text-[#2c1228] block truncate">{c.name}</span>
              <span className="text-[10px] font-mono text-[#7a5672] uppercase block">{c.hex}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Data Management & Backup Controls */}
      <div className="gf-3d-card p-6">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-5 h-5 text-[#dd2987]" />
          <h3 className="text-base font-extrabold text-[#2c1228]">Data Management & Backup</h3>
        </div>
        <p className="text-xs text-[#7a5672] mb-4">
          Your academic courses, assessment marks, study sessions, and deadlines are safely stored locally in your browser storage.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportData}
            className="px-4 py-2.5 bg-white border border-[#f6b9d5] hover:border-[#dd2987] text-xs font-bold text-[#2c1228] flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#dd2987]" />
            Export Data JSON Backup
          </button>

          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset all academic data to the initial sample baseline?')) {
                resetAllData();
                setSuccessMsg('All records reset to initial sample baseline.');
              }
            }}
            className="px-4 py-2.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-xs font-bold text-rose-700 flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-rose-600" />
            Reset to Sample Data
          </button>
        </div>
      </div>
    </div>
  );
};
