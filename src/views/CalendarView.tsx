import React, { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar as CalendarIcon,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  MapPin,
  AlertCircle,
  Filter,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  Trash2,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { parseCalendarFile, CalendarImportError } from '../utils/calendarImport';

export const CalendarView: React.FC = () => {
  const {
    events,
    modules,
    toggleEventCompleted,
    deleteEvent,
    setIsQuickAddEventOpen,
    importEvents,
  } = useApp();

  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 7, 22)); // Aug 2026
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [filterModuleId, setFilterModuleId] = useState<string>('all');
  const [activeViewMode, setActiveViewMode] = useState<'agenda' | 'month'>('agenda');
  const [importFeedback, setImportFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Filtered events
  const filteredEvents = events
    .filter((e) => {
      const matchCat = selectedCategoryFilter === 'all' || e.eventType === selectedCategoryFilter;
      const matchMod = filterModuleId === 'all' || e.moduleId === filterModuleId;
      return matchCat && matchMod;
    })
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());

  // Count overdue uncompleted
  const overdueCount = events.filter(
    (e) => !e.isCompleted && new Date(e.dueAt).getTime() < Date.now()
  ).length;

  const handleToggleComplete = (id: string, currentlyCompleted: boolean) => {
    toggleEventCompleted(id);
    if (!currentlyCompleted) {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#e91e8c', '#ff6ec7', '#ffd6ee', '#10b981'],
      });
    }
  };

  const exportCalendarIcs = () => {
    // Generate standard .ics string
    let icsContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//GradeFlow//Academic Planner//EN\n';
    events.forEach((evt) => {
      const d = new Date(evt.dueAt);
      const timeStr = d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      icsContent += `BEGIN:VEVENT\nSUMMARY:[GradeFlow] ${evt.title}\nDTSTART:${timeStr}\nDTEND:${timeStr}\nDESCRIPTION:Academic deadline tracked with GradeFlow\nEND:VEVENT\n`;
    });
    icsContent += 'END:VCALENDAR';

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'gradeflow-academic-deadlines.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setIsImporting(true);
    setImportFeedback(null);
    try {
      const text = await file.text();
      const parsed = parseCalendarFile(file.name, text);
      const count = importEvents(
        parsed.map((p) => ({
          title: p.title,
          eventType: p.eventType,
          dueAt: p.dueAt,
          priority: p.priority,
          isCompleted: false,
          location: p.location,
          notes: p.notes,
        }))
      );
      setImportFeedback({
        type: 'success',
        message: `Imported ${count} deadline${count === 1 ? '' : 's'} from ${file.name}.`,
      });
    } catch (err) {
      const message =
        err instanceof CalendarImportError
          ? err.message
          : "Couldn't read that file. Please export a CSV, JSON, or .ics calendar file from your student portal and try again.";
      setImportFeedback({ type: 'error', message });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-5 pb-24 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--gf-card)] p-5 rounded-3xl border border-[var(--gf-border)] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[var(--gf-tint)] text-[var(--gf-primary)] flex items-center justify-center">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--gf-text)] tracking-tight">
              Academic Calendar & Deadlines
            </h1>
          </div>
          <p className="text-xs text-[var(--gf-muted)] mt-1">
            Assignment due dates, exam schedules, and reminders
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={importInputRef}
            type="file"
            accept=".csv,.json,.ics,.ical,text/csv,application/json,text/calendar"
            onChange={handleImportFile}
            className="hidden"
          />
          <button
            id="calendar-import-btn"
            onClick={() => importInputRef.current?.click()}
            disabled={isImporting}
            className="px-3.5 py-2 rounded-2xl bg-[var(--gf-tint)] hover:bg-[var(--gf-border)]/40 border border-[var(--gf-border)] text-xs font-bold text-[var(--gf-muted)] hover:text-[var(--gf-primary)] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-wait"
            title="Import deadlines from a CSV, JSON, or .ics file exported by your student portal"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">{isImporting ? 'Importing…' : 'Import Calendar'}</span>
          </button>

          <button
            onClick={exportCalendarIcs}
            className="px-3.5 py-2 rounded-2xl bg-[var(--gf-tint)] hover:bg-[var(--gf-border)]/40 border border-[var(--gf-border)] text-xs font-bold text-[var(--gf-muted)] hover:text-[var(--gf-primary)] flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Export to Apple / Google Calendar (.ics)"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export .ics</span>
          </button>

          <button
            id="calendar-add-event-btn"
            onClick={() => setIsQuickAddEventOpen(true)}
            className="gf-3d-button flex items-center gap-1.5 px-4 py-2 text-white text-xs font-bold cursor-pointer shadow-md transition-transform active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Calendar Import Feedback */}
      {importFeedback && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
            importFeedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200'
              : 'bg-rose-50 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {importFeedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <p
              className={`text-xs font-semibold ${
                importFeedback.type === 'success' ? 'text-emerald-800' : 'text-rose-700'
              }`}
            >
              {importFeedback.message}
            </p>
          </div>
          <button
            onClick={() => setImportFeedback(null)}
            className={`p-1 rounded-full shrink-0 ${
              importFeedback.type === 'success'
                ? 'text-emerald-600 hover:bg-emerald-100'
                : 'text-rose-600 hover:bg-rose-100'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Overdue Alert if applicable */}
      {overdueCount > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-rose-900">
                You have {overdueCount} overdue academic task{overdueCount === 1 ? '' : 's'}!
              </h4>
              <p className="text-[11px] text-rose-700">
                Review and complete past submissions to keep your schedule clean.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filter and View Toggles */}
      <div className="bg-[var(--gf-card)] p-4 rounded-3xl border border-[var(--gf-border)] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-[var(--gf-muted)] flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            {(
              ['all', 'assignment', 'exam', 'test', 'project', 'study_event'] as const
            ).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition-all cursor-pointer ${
                  selectedCategoryFilter === cat
                    ? 'gf-pill-active'
                    : 'bg-[var(--gf-tint)] text-[var(--gf-muted)] hover:bg-[var(--gf-border)]/40'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Agenda vs Month View */}
          <div className="flex bg-[var(--gf-tint)] p-1 rounded-2xl border border-[var(--gf-border)] self-start sm:self-auto">
            <button
              onClick={() => setActiveViewMode('agenda')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeViewMode === 'agenda'
                  ? 'bg-[var(--gf-card)] text-[var(--gf-primary)] shadow-xs'
                  : 'text-[var(--gf-muted)]'
              }`}
            >
              Agenda List
            </button>
            <button
              onClick={() => setActiveViewMode('month')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeViewMode === 'month'
                  ? 'bg-[var(--gf-card)] text-[var(--gf-primary)] shadow-xs'
                  : 'text-[var(--gf-muted)]'
              }`}
            >
              Month View
            </button>
          </div>
        </div>

        {/* Module filter selector */}
        <div className="flex items-center gap-2 pt-2 border-t border-[var(--gf-tint)] text-xs">
          <span className="text-[var(--gf-muted)] font-bold">Course:</span>
          <select
            value={filterModuleId}
            onChange={(e) => setFilterModuleId(e.target.value)}
            className="px-2.5 py-1 rounded-xl bg-[var(--gf-tint)] border border-[var(--gf-border)] text-xs font-bold text-[var(--gf-text)] focus:outline-none"
          >
            <option value="all">All Courses</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.code ? `[${m.code}] ` : ''}{m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Month View Grid Calendar */}
      {activeViewMode === 'month' && (
        <div className="bg-[var(--gf-card)] p-5 rounded-3xl border border-[var(--gf-border)] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-extrabold text-[var(--gf-text)]">{monthName}</h3>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-full hover:bg-[var(--gf-tint)] text-[var(--gf-muted)] hover:text-[var(--gf-primary)]"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-full hover:bg-[var(--gf-tint)] text-[var(--gf-muted)] hover:text-[var(--gf-primary)]"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-[var(--gf-muted)] mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Day Tiles */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, idx) => {
              const dayNum = (idx % 31) + 1;
              const dateStr = `2026-08-${dayNum.toString().padStart(2, '0')}`;
              const dayEvents = events.filter((e) => e.dueAt.startsWith(dateStr));
              const isToday = dayNum === 22;

              return (
                <div
                  key={idx}
                  className={`min-h-[70px] sm:min-h-[85px] p-1.5 rounded-xl border flex flex-col justify-between transition-all ${
                    isToday
                      ? 'bg-[var(--gf-tint)] border-[var(--gf-primary)] font-bold'
                      : 'bg-[var(--gf-card)] border-[var(--gf-border)]/60 hover:border-[var(--gf-border)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs ${
                        isToday ? 'w-5 h-5 rounded-full bg-[var(--gf-primary)] text-white flex items-center justify-center font-extrabold text-[10px]' : 'text-[var(--gf-muted)]'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--gf-primary)]" />
                    )}
                  </div>

                  <div className="space-y-1 mt-1">
                    {dayEvents.slice(0, 2).map((e) => (
                      <div
                        key={e.id}
                        className="text-[9px] font-bold truncate px-1 py-0.5 rounded-md bg-[var(--gf-tint)] border border-[var(--gf-border)] text-[var(--gf-primary)]"
                        title={e.title}
                      >
                        {e.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[8px] text-[var(--gf-muted)] block font-bold">
                        +{dayEvents.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Agenda Event Cards List */}
      <div className="space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="py-12 text-center bg-[var(--gf-card)] rounded-3xl border border-dashed border-[var(--gf-border)] p-6">
            <CalendarIcon className="w-12 h-12 text-[var(--gf-border)] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[var(--gf-text)]">No deadlines found</h3>
            <p className="text-xs text-[var(--gf-muted)] max-w-sm mx-auto mt-1 mb-4">
              Schedule your upcoming homework, project milestones, and exam dates.
            </p>
            <button
              onClick={() => setIsQuickAddEventOpen(true)}
              className="gf-3d-button px-5 py-2.5 text-xs font-bold text-white shadow-md inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Event
            </button>
          </div>
        ) : (
          filteredEvents.map((evt) => {
            const mod = modules.find((m) => m.id === evt.moduleId);
            const dueDate = new Date(evt.dueAt);
            const isOverdue = !evt.isCompleted && dueDate.getTime() < Date.now();
            const daysUntil = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

            return (
              <div
                key={evt.id}
                className={`gf-3d-card p-4 flex items-center justify-between gap-4 transition-all ${
                  evt.isCompleted
                    ? 'opacity-65 bg-[var(--gf-tint)]'
                    : isOverdue
                    ? 'border-rose-300'
                    : 'hover:border-[var(--gf-primary)]/80'
                }`}
              >
                {/* Left check and info */}
                <div className="flex items-start gap-3.5">
                  <button
                    onClick={() => handleToggleComplete(evt.id, evt.isCompleted)}
                    className="mt-0.5 p-1 rounded-full text-[var(--gf-muted)] hover:text-[var(--gf-primary)] transition-colors cursor-pointer"
                    title={evt.isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
                  >
                    {evt.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100" />
                    ) : (
                      <Circle className="w-5 h-5 text-[var(--gf-border)] hover:text-[var(--gf-primary)]" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4
                        className={`text-sm font-bold text-[var(--gf-text)] ${
                          evt.isCompleted ? 'line-through text-[var(--gf-muted)]' : ''
                        }`}
                      >
                        {evt.title}
                      </h4>
                      <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-[var(--gf-tint)] text-[var(--gf-primary)]">
                        {evt.eventType.replace('_', ' ')}
                      </span>
                      {evt.priority === 'high' && (
                        <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700">
                          High Priority
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[var(--gf-muted)] mt-1.5 flex-wrap">
                      <span className="font-semibold text-[var(--gf-text)]">{mod?.code || 'General'}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[var(--gf-primary)]" />
                        <span>
                          {dueDate.toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}{' '}
                          at{' '}
                          {dueDate.toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      {evt.location && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[var(--gf-primary)]" />
                            <span>{evt.location}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right badge & delete */}
                <div className="flex items-center gap-2 shrink-0">
                  {!evt.isCompleted && (
                    <span
                      className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                        isOverdue
                          ? 'bg-rose-100 text-rose-700'
                          : daysUntil <= 1
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-[var(--gf-tint)] text-[var(--gf-primary)]'
                      }`}
                    >
                      {isOverdue ? 'Overdue' : daysUntil === 0 ? 'Due Today' : `${daysUntil}d left`}
                    </span>
                  )}

                  <button
                    onClick={() => {
                      if (confirm(`Delete deadline "${evt.title}"?`)) {
                        deleteEvent(evt.id);
                      }
                    }}
                    className="p-1.5 rounded-full text-[var(--gf-muted)] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
