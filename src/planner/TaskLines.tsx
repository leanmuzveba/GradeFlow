import React, { useRef, useState } from 'react';
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

interface Props {
  items: TodoItem[];
  onChange: (items: TodoItem[]) => void;
  ink: string;
  accent: string;
  /** Lines always shown, like a notebook page. */
  minLines?: number;
}

/**
 * Ruled notebook lines where every line is a task with a circle bullet.
 * The first empty line is where you write the next task; the empty line keeps
 * its React key when it turns into a task, so the keyboard stays open.
 */
export const TaskLines: React.FC<Props> = ({ items, onChange, ink, accent, minLines = 5 }) => {
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
