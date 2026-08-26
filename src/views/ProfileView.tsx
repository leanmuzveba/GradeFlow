import React, { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Download,
  RotateCcw,
  Check,
  ShieldCheck,
  Camera,
} from 'lucide-react';

// Raw photos from a phone camera can be several MB; base64-encoded as a data
// URL that easily blows the localStorage quota (5-10MB total). When
// localStorage.setItem throws, the write is silently dropped and the profile
// reverts to whatever was last saved on the next load. Downscaling to a small
// JPEG here keeps every avatar comfortably under a few hundred KB.
const MAX_AVATAR_DIMENSION = 512;
const AVATAR_JPEG_QUALITY = 0.85;

const resizeImageToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_AVATAR_DIMENSION / Math.max(img.width, img.height));
      const width = Math.max(1, Math.round(img.width * scale));
      const height = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      URL.revokeObjectURL(objectUrl);
      if (!ctx) {
        reject(new Error('Canvas rendering is not supported on this device.'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', AVATAR_JPEG_QUALITY));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('That file could not be read as an image.'));
    };
    img.src = objectUrl;
  });

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
  const [avatarError, setAvatarError] = useState('');
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setAvatarError('');
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      updateProfile({ avatarUrl: dataUrl });
    } catch {
      setAvatarError('Could not update your profile picture. Try a different photo.');
    }
  };

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
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-white shadow-md ring-2 ring-[#ffd6ee]"
          />
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            aria-label="Change profile picture"
            className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-[#ff6ec7] to-[#e91e8c] text-white flex items-center justify-center shadow-md cursor-pointer active:scale-95 transition-transform border-2 border-white"
          >
            <Camera className="w-4 h-4" />
          </button>
          {avatarError && (
            <p className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 w-40 text-center text-[10px] font-semibold text-rose-600">
              {avatarError}
            </p>
          )}
        </div>

        <div className="text-center sm:text-left flex-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#fff0f8] text-xs font-extrabold text-[#e91e8c] mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{profile.academicYear}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1e0f3e] tracking-tight">
            {profile.displayName}
          </h1>
          <p className="font-script text-lg leading-none text-[#e91e8c] mt-1">
            Your academic life, in flow.
          </p>
          <p className="text-xs text-[#7b5ea7] mt-1.5">{profile.email}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3 text-xs font-semibold text-[#7b5ea7]">
            <span>{profile.semester}</span>
            <span>•</span>
            <span>Target GPA: <strong className="text-[#e91e8c]">{profile.targetGpa.toFixed(2)}</strong></span>
            <span>•</span>
            <span>Weekly Goal: <strong className="text-[#e91e8c]">{studyGoal.weeklyTargetHours} hrs</strong></span>
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
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          {successMsg}
        </div>
      )}

      {/* Edit Form */}
      {isEditing && (
        <form
          onSubmit={handleSaveProfile}
          className="bg-white rounded-3xl p-6 border border-[#ffd6ee] shadow-md space-y-4 animate-fade-in"
        >
          <h3 className="text-base font-extrabold text-[#1e0f3e] pb-3 border-b border-[#fff0f8]">
            Edit Academic Profile & Preferences
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1e0f3e] mb-1">Display Name</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#fff0f8] border border-[#ffd6ee] text-sm text-[#1e0f3e] focus:outline-none focus:ring-2 focus:ring-[#e91e8c]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1e0f3e] mb-1">Student Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#fff0f8] border border-[#ffd6ee] text-sm text-[#1e0f3e] focus:outline-none focus:ring-2 focus:ring-[#e91e8c]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1e0f3e] mb-1">Academic Year</label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#fff0f8] border border-[#ffd6ee] text-sm text-[#1e0f3e] focus:outline-none focus:ring-2 focus:ring-[#e91e8c]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1e0f3e] mb-1">Current Semester</label>
              <input
                type="text"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#fff0f8] border border-[#ffd6ee] text-sm text-[#1e0f3e] focus:outline-none focus:ring-2 focus:ring-[#e91e8c]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1e0f3e] mb-1">Target GPA (4.0 Scale)</label>
              <input
                type="number"
                step="0.05"
                min="2.0"
                max="4.0"
                value={targetGpa}
                onChange={(e) => setTargetGpa(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#fff0f8] border border-[#ffd6ee] text-sm font-bold text-[#e91e8c] focus:outline-none focus:ring-2 focus:ring-[#e91e8c]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1e0f3e] mb-1">Weekly Study Target (Hours)</label>
              <input
                type="number"
                step="1"
                min="5"
                max="80"
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#fff0f8] border border-[#ffd6ee] text-sm font-bold text-[#e91e8c] focus:outline-none focus:ring-2 focus:ring-[#e91e8c]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#fff0f8]">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#7b5ea7] hover:bg-[#fff0f8]"
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

      {/* Data Management & Backup Controls */}
      <div className="gf-3d-card p-6">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-5 h-5 text-[#e91e8c]" />
          <h3 className="text-base font-extrabold text-[#1e0f3e]">Data Management & Backup</h3>
        </div>
        <p className="text-xs text-[#7b5ea7] mb-4">
          Your academic courses, assessment marks, study sessions, and deadlines are safely stored locally in your browser storage.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportData}
            className="px-4 py-2.5 rounded-2xl bg-white border border-[#ffd6ee] hover:border-[#e91e8c] text-xs font-bold text-[#1e0f3e] flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#e91e8c]" />
            Export Data JSON Backup
          </button>

          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset all academic data to the initial sample baseline?')) {
                resetAllData();
                setSuccessMsg('All records reset to initial sample baseline.');
              }
            }}
            className="px-4 py-2.5 rounded-2xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-xs font-bold text-rose-700 flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-rose-600" />
            Reset to Sample Data
          </button>
        </div>
      </div>
    </div>
  );
};
