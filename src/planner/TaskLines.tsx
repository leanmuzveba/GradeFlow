import React, { useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { TodoItem } from './types';

/** Bullet-journal circle: empty = to do, filled = done. */
export const TaskCircle: React.FC<{ done: boolean; color: string; fill: string; onToggle?: () => void }> = ({ done, color, fill, onToggle }) => (
  <button
    onClick={onToggle}
    disabled={!onToggle}
    className="w-4 h-4 shrink-0 rounded-full border-2 cursor-pointer disabled:cursor-default transition-colors"
    style={{ borderColor: color, background: done ? fill : 'transparent' }}
    aria-label={done ? 'Mark not done' : 'Mark done'}
  />
);

const LINE_HEIGHT = 34;

/** Bell that opens the phone's time picker; the picker's Clear removes the reminder. */
const ReminderBell: React.FC<{ remindAt?: string; dates: string[]; ink: string; accent: string; onChange: (remindAt?: string) => void }> = ({
  remindAt,
  dates,
  ink,
  accent,
  onChange,
}) => {
  const single = dates.length === 1;
  const at = remindAt ? new Date(remindAt) : null;
  return (
    <label className="relative flex items-center gap-1 shrink-0 text-xs font-bold cursor-pointer" style={{ color: at ? accent : `${ink}55` }}>
      <Bell className="w-3.5 h-3.5" fill={at ? 'currentColor' : 'none'} />
      {at && (single ? '' : at.toLocaleDateString('default', { weekday: 'short' }) + ' ') + at.toLocaleTimeString('default', { hour: 'numeric', minute: '2-digit' })}
      <input
        type={single ? 'time' : 'datetime-local'}
        value={remindAt ? (single ? remindAt.slice(11) : remindAt) : ''}
        min={single ? undefined : `${dates[0]}T00:00`}
        max={single ? undefined : `${dates[dates.length - 1]}T23:59`}
        onChange={(e) => onChange(e.target.value ? (single ? `${dates[0]}T${e.target.value}` : e.target.value) : undefined)}
        className="absolute inset-0 opacity-0 cursor-pointer"
        aria-label={at ? 'Change reminder' : 'Set reminder'}
      />
    </label>
  );
};

interface Props {
  items: TodoItem[];
  onChange: (items: TodoItem[]) => void;
  ink: string;
  accent: string;
  /** The day(s) this box covers (YYYY-MM-DD); tasks can get a reminder on them. */
  dates: string[];
  /** Lines always shown, like a notebook page. */
  minLines?: number;
}

/**
 * Ruled notebook lines where every line is a task with a circle bullet.
 * The first empty line is where you write the next task; the empty line keeps
 * its React key when it turns into a task, so the keyboard stays open.
 */
export const TaskLines: React.FC<Props> = ({ items, onChange, ink, accent, dates, minLines = 5 }) => {
  const [draftId, setDraftId] = useState(() => crypto.randomUUID());
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});
  const blankLines = Math.max(0, minLines - items.length - 1);

  const update = (id: string, text: string) => {
    if (id === draftId) {
      if (!text) return;
      onChange([...items, { id, text, done: false }]);
      setDraftId(crypto.randomUUID());
    } else {
      onChange(items.map((t) => (t.id === id ? { ...t, text } : t)));
    }
  };

  const keyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number, id: string) => {
    const order = [...items.map((t) => t.id), draftId];
    if (e.key === 'Enter') {
      e.preventDefault();
      inputs.current[order[index + 1]]?.focus();
    } else if (e.key === 'Backspace' && id !== draftId && !e.currentTarget.value) {
      e.preventDefault();
      onChange(items.filter((t) => t.id !== id));
      inputs.current[order[index - 1] ?? draftId]?.focus();
    }
  };

  const line = { height: LINE_HEIGHT, borderBottom: `1px solid ${ink}33` };

  return (
    <div>
      {[...items, { id: draftId, text: '', done: false }].map((t, i) => (
        <div key={t.id} className="flex items-center gap-2.5 px-1" style={line}>
          <TaskCircle
            done={t.done}
            color={t.done ? accent : `${ink}99`}
            fill={accent}
            onToggle={t.id === draftId ? undefined : () => onChange(items.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)))}
          />
          <input
            ref={(el) => {
              inputs.current[t.id] = el;
            }}
            value={t.text}
            onChange={(e) => update(t.id, e.target.value)}
            onKeyDown={(e) => keyDown(e, i, t.id)}
            className={`flex-1 min-w-0 bg-transparent text-base focus:outline-none ${t.done ? 'line-through opacity-50' : ''}`}
            style={{ color: 'inherit' }}
          />
          {t.id !== draftId && !t.done && (
            <ReminderBell
              remindAt={t.remindAt}
              dates={dates}
              ink={ink}
              accent={accent}
              onChange={(remindAt) => onChange(items.map((x) => (x.id === t.id ? { ...x, remindAt } : x)))}
            />
          )}
        </div>
      ))}
      {Array.from({ length: blankLines }, (_, i) => (
        <div key={i} className="flex items-center gap-2.5 px-1" style={line} onClick={() => inputs.current[draftId]?.focus()}>
          <TaskCircle done={false} color={`${ink}99`} fill={accent} />
        </div>
      ))}
    </div>
  );
};

/** Turns old free-text day notes into task lines (one per non-empty line). */
export const textToTasks = (text: string | undefined): TodoItem[] =>
  (text ?? '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => ({ id: crypto.randomUUID(), text: s, done: false }));
