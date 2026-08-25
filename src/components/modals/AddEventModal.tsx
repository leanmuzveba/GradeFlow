import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { EventType, PriorityLevel } from '../../types';
import { X, Calendar, Clock, MapPin, AlertCircle, BookOpen, BellRing } from 'lucide-react';

export const AddEventModal: React.FC = () => {
  const {
    isQuickAddEventOpen,
    setIsQuickAddEventOpen,
    modules,
    addEvent,
    selectedModuleIdForDetail,
  } = useApp();

  const [moduleId, setModuleId] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [eventType, setEventType] = useState<EventType>('assignment');
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  );
  const [dueTime, setDueTime] = useState<string>('23:59');
  const [priority, setPriority] = useState<PriorityLevel>('high');
  const [location, setLocation] = useState<string>('');
  const [reminderMinutes, setReminderMinutes] = useState<number>(120);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (modules.length > 0) {
      if (selectedModuleIdForDetail) {
        setModuleId(selectedModuleIdForDetail);
      } else if (!moduleId) {
        setModuleId(modules[0].id);
      }
    }
  }, [modules, selectedModuleIdForDetail, isQuickAddEventOpen]);

  if (!isQuickAddEventOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter an event or deadline title.');
      return;
    }

    const combinedDueAt = new Date(`${dueDate}T${dueTime || '23:59'}:00`).toISOString();

    addEvent({
      title: title.trim(),
      moduleId: moduleId || undefined,
      eventType,
      dueAt: combinedDueAt,
      priority,
      isCompleted: false,
      location: location.trim() || undefined,
      reminderMinutes,
    });

    setTitle('');
    setLocation('');
    setError('');
    setIsQuickAddEventOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-[#ffd6ee] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#fff0f8] to-[#fff5f9] px-6 py-4 border-b border-[#ffd6ee] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#ff6ec7] to-[#e91e8c] text-white flex items-center justify-center shadow-xs">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1e0f3e]">Schedule Academic Event</h3>
              <p className="text-xs text-[#7b5ea7]">Add deadlines, tests, and study sessions</p>
            </div>
          </div>
          <button
            onClick={() => setIsQuickAddEventOpen(false)}
            className="p-1.5 rounded-full text-[#7b5ea7] hover:text-[#e91e8c] hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-[#1e0f3e] mb-1">
              Event / Deadline Title *
            </label>
            <input
              id="event-title-input"
              type="text"
              required
              placeholder="e.g. Final Project Submission, Midterm Exam, Problem Set"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#fff0f8] border border-[#ffd6ee] text-sm text-[#1e0f3e] focus:outline-none focus:ring-2 focus:ring-[#e91e8c]"
            />
          </div>

          {/* Module Selector */}
          <div>
            <label className="block text-xs font-bold text-[#1e0f3e] mb-1 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#e91e8c]" />
              Associated Module
            </label>
            <select
              id="event-module-select"
              value={moduleId}
              onChange={(e) => setModuleId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#fff0f8] border border-[#ffd6ee] text-sm font-semibold text-[#1e0f3e] focus:outline-none focus:ring-2 focus:ring-[#e91e8c]"
            >
              <option value="">-- General / No Specific Course --</option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.code ? `[${m.code}] ` : ''}{m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Event Type */}
          <div>
            <label className="block text-xs font-bold text-[#1e0f3e] mb-1.5">
              Event Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(
                ['assignment', 'test', 'exam', 'project', 'study_event'] as EventType[]
              ).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setEventType(type)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all cursor-pointer ${
                    eventType === type
                      ? 'gf-pill-active'
                      : 'bg-[#fff0f8] text-[#7b5ea7] hover:bg-[#ffd6ee]/50'
                  }`}
                >
                  {type.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Due Date and Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1e0f3e] mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#e91e8c]" />
                Due / Event Date *
              </label>
              <input
                id="event-date-input"
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#fff0f8] border border-[#ffd6ee] text-sm text-[#1e0f3e] focus:outline-none focus:ring-2 focus:ring-[#e91e8c]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1e0f3e] mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#e91e8c]" />
                Time
              </label>
              <input
                id="event-time-input"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#fff0f8] border border-[#ffd6ee] text-sm text-[#1e0f3e] focus:outline-none focus:ring-2 focus:ring-[#e91e8c]"
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-bold text-[#1e0f3e] mb-1.5 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-[#e91e8c]" />
              Priority Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'low', label: 'Low Priority', color: 'border-blue-300 text-blue-700 bg-blue-50' },
                  { id: 'medium', label: 'Medium', color: 'border-amber-300 text-amber-700 bg-amber-50' },
                  { id: 'high', label: 'High Priority', color: 'border-rose-400 text-rose-700 bg-rose-50' },
                ] as const
              ).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPriority(p.id)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold text-center border transition-all cursor-pointer ${
                    priority === p.id
                      ? `${p.color} ring-2 ring-[#e91e8c] font-extrabold shadow-xs`
                      : 'bg-white border-[#ffd6ee] text-[#7b5ea7]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location & Reminder */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1e0f3e] mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#e91e8c]" />
                Location / Link
              </label>
              <input
                type="text"
                placeholder="e.g. Room 302 / Canvas"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#fff0f8] border border-[#ffd6ee] text-sm text-[#1e0f3e] focus:outline-none focus:ring-2 focus:ring-[#e91e8c]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1e0f3e] mb-1 flex items-center gap-1">
                <BellRing className="w-3.5 h-3.5 text-[#e91e8c]" />
                Reminder Alert
              </label>
              <select
                value={reminderMinutes}
                onChange={(e) => setReminderMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#fff0f8] border border-[#ffd6ee] text-sm text-[#1e0f3e] focus:outline-none focus:ring-2 focus:ring-[#e91e8c]"
              >
                <option value={15}>15 minutes before</option>
                <option value={60}>1 hour before</option>
                <option value={120}>2 hours before</option>
                <option value={1440}>1 day before</option>
                <option value={2880}>2 days before</option>
              </select>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsQuickAddEventOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#7b5ea7] hover:bg-[#fff0f8] transition-colors"
            >
              Cancel
            </button>
            <button
              id="save-event-submit-btn"
              type="submit"
              className="gf-3d-button px-6 py-2.5 text-xs font-bold text-white shadow-md cursor-pointer transition-transform active:scale-95"
            >
              Schedule Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
