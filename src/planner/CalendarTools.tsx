import React, { useRef, useState } from 'react';
import { AlertCircle, Download, Upload, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { parseCalendarFile, CalendarImportError } from '../utils/calendarImport';

/** Overdue count + import/export of deadlines (moved here from the old Calendar tab). */
export const CalendarTools: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { events, importEvents } = useApp();
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const overdue = events.filter((e) => !e.isCompleted && new Date(e.dueAt).getTime() < Date.now()).length;

  const exportIcs = () => {
    let ics = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//GradeFlow//Academic Planner//EN\n';
    events.forEach((evt) => {
      const t = new Date(evt.dueAt).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      ics += `BEGIN:VEVENT\nSUMMARY:[GradeFlow] ${evt.title}\nDTSTART:${t}\nDTEND:${t}\nDESCRIPTION:Academic deadline tracked with GradeFlow\nEND:VEVENT\n`;
    });
    ics += 'END:VCALENDAR';
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'gradeflow-academic-deadlines.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setIsImporting(true);
    setFeedback(null);
    try {
      const parsed = parseCalendarFile(file.name, await file.text());
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
      setFeedback({ ok: true, message: `Imported ${count} deadline${count === 1 ? '' : 's'} from ${file.name}.` });
    } catch (err) {
      setFeedback({
        ok: false,
        message:
          err instanceof CalendarImportError
            ? err.message
            : "Couldn't read that file. Please export a CSV, JSON, or .ics calendar file from your student portal and try again.",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const btn =
    'px-3 py-1.5 rounded-full bg-[var(--gf-card)] border border-[var(--gf-border)] text-[11px] font-bold text-[var(--gf-muted)] flex items-center gap-1.5 cursor-pointer disabled:opacity-60';

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        {overdue > 0 && (
          <span className="px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-[11px] font-bold text-rose-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> {overdue} overdue
          </span>
        )}
        {children}
        <span className="flex-1" />
        <input ref={inputRef} type="file" accept=".csv,.json,.ics,.ical,text/csv,application/json,text/calendar" onChange={importFile} className="hidden" />
        <button onClick={() => inputRef.current?.click()} disabled={isImporting} className={btn} title="Import deadlines from a CSV, JSON or .ics file">
          <Upload className="w-3.5 h-3.5" /> {isImporting ? 'Importing…' : 'Import'}
        </button>
        <button onClick={exportIcs} className={btn} title="Export to Apple / Google Calendar (.ics)">
          <Download className="w-3.5 h-3.5" /> Export
        </button>
      </div>
      {feedback && (
        <div
          className={`px-3 py-2 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-2 ${
            feedback.ok ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="cursor-pointer" aria-label="Dismiss">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
