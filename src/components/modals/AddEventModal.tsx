import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { EventType } from '../../types';
import { X, Calendar, Clock, BookOpen, BellRing } from 'lucide-react';

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
      priority: 'medium',
      isCompleted: false,
      reminderMinutes,
    });

    setTitle('');
    setError('');
    setIsQuickAddEventOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-[var(--gf-card)] rounded-3xl w-full max-w-lg shadow-2xl border border-[var(--gf-border)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[var(--gf-tint)] to-[var(--gf-card)] px-6 py-4 border-b border-[var(--gf-border)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--gf-primary-light)] to-[var(--gf-primary)] text-white flex items-center justify-center shadow-xs">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--gf-text)]">Schedule Academic Event</h3>
              <p className="text-xs text-[var(--gf-muted)]">Add deadlines, tests, and study sessions</p>
            </div>
          </div>
          <button
            onClick={() => setIsQuickAddEventOpen(false)}
            className="p-1.5 rounded-full text-[var(--gf-muted)] hover:text-[var(--gf-primary)] hover:bg-[var(--gf-card)] transition-colors"
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
            <label className="block text-xs font-bold text-[var(--gf-text)] mb-1">
              Event / Deadline Title *
            </label>
            <input
              id="event-title-input"
              type="text"
              required
              placeholder="e.g. Final Project Submission, Midterm Exam, Problem Set"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[var(--gf-tint)] border border-[var(--gf-border)] text-sm text-[var(--gf-text)] focus:outline-none focus:ring-2 focus:ring-[var(--gf-primary)]"
            />
          </div>

          {/* Module Selector */}
          <div>
            <label className="block text-xs font-bold text-[var(--gf-text)] mb-1 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[var(--gf-primary)]" />
              Associated Module
            </label>
            <select
              id="event-module-select"
              value={moduleId}
              onChange={(e) => setModuleId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[var(--gf-tint)] border border-[var(--gf-border)] text-sm font-semibold text-[var(--gf-text)] focus:outline-none focus:ring-2 focus:ring-[var(--gf-primary)]"
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
            <label className="block text-xs font-bold text-[var(--gf-text)] mb-1.5">
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
                      : 'bg-[var(--gf-tint)] text-[var(--gf-muted)] hover:bg-[var(--gf-border)]/50'
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
              <label className="block text-xs font-bold text-[var(--gf-text)] mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[var(--gf-primary)]" />
                Due / Event Date *
              </label>
              <input
                id="event-date-input"
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--gf-tint)] border border-[var(--gf-border)] text-sm text-[var(--gf-text)] focus:outline-none focus:ring-2 focus:ring-[var(--gf-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--gf-text)] mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[var(--gf-primary)]" />
                Time
              </label>
              <input
                id="event-time-input"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--gf-tint)] border border-[var(--gf-border)] text-sm text-[var(--gf-text)] focus:outline-none focus:ring-2 focus:ring-[var(--gf-primary)]"
              />
            </div>
          </div>

          {/* Reminder */}
          <div>
            <label className="block text-xs font-bold text-[var(--gf-text)] mb-1 flex items-center gap-1">
              <BellRing className="w-3.5 h-3.5 text-[var(--gf-primary)]" />
              Reminder Alert
            </label>
            <select
              value={reminderMinutes}
              onChange={(e) => setReminderMinutes(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-[var(--gf-tint)] border border-[var(--gf-border)] text-sm text-[var(--gf-text)] focus:outline-none focus:ring-2 focus:ring-[var(--gf-primary)]"
            >
              <option value={15}>15 minutes before</option>
              <option value={60}>1 hour before</option>
              <option value={120}>2 hours before</option>
              <option value={1440}>1 day before</option>
              <option value={2880}>2 days before</option>
            </select>
          </div>

          {/* Footer Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsQuickAddEventOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[var(--gf-muted)] hover:bg-[var(--gf-tint)] transition-colors"
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
