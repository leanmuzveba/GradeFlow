import React, { useState } from 'react';
import { Check, Plus, Trash2, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { AcademicEvent } from '../types';
import { PlannerTheme } from './themes';
import { DayKey, TodoItem, WeekPage } from './types';
import { addDays, sameDay, ymd } from './dates';
import { PaperText, Script } from './Paper';

const DAYS: { key: DayKey; name: string; offsets: number[] }[] = [
  { key: 'mon', name: 'Monday', offsets: [0] },
  { key: 'tue', name: 'Tuesday', offsets: [1] },
  { key: 'wed', name: 'Wednesday', offsets: [2] },
  { key: 'thu', name: 'Thursday', offsets: [3] },
  { key: 'fri', name: 'Friday', offsets: [4] },
  { key: 'weekend', name: 'Weekend', offsets: [5, 6] },
];

interface Props {
  theme: PlannerTheme;
  monthStart: Date;
  monday: Date;
  page: WeekPage;
  onChange: (updates: Partial<WeekPage>) => void;
  onPickWeek: (date: Date) => void;
}

export const WeekSpread: React.FC<Props> = ({ theme, monthStart, monday, page, onChange, onPickWeek }) => {
  const { events, modules, toggleEventCompleted, deleteEvent, setIsQuickAddEventOpen, setEventDraftDate } = useApp();
  const [newTodo, setNewTodo] = useState('');
  const today = new Date();
  const todos = page.todos ?? [];

  const setTodos = (next: TodoItem[]) => onChange({ todos: next });
  const addTodo = () => {
    if (!newTodo.trim()) return;
    setTodos([...todos, { id: crypto.randomUUID(), text: newTodo.trim(), done: false }]);
    setNewTodo('');
  };

  const addEventOn = (day: Date) => {
    setEventDraftDate(ymd(day));
    setIsQuickAddEventOpen(true);
  };

  const toggleEvent = (evt: AcademicEvent) => {
    toggleEventCompleted(evt.id);
    if (!evt.isCompleted) confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 }, colors: [theme.primary, theme.secondary, '#ffffff'] });
  };

  // Mini month calendar (Sunday-first like the paper planner)
  const firstWeekday = monthStart.getDay();
  const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
  const weekDates = Array.from({ length: 7 }, (_, i) => ymd(addDays(monday, i)));

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Month name + mini calendar */}
      <div className="flex items-start gap-4 pr-[22%]">
        <div className="pt-2">
          <Script theme={theme} className="text-6xl block">
            {monthStart.toLocaleString('default', { month: 'long' })}
          </Script>
          <span className="text-xs font-semibold opacity-60 block mt-2">
            {monday.toLocaleDateString('default', { day: 'numeric', month: 'short' })} –{' '}
            {addDays(monday, 6).toLocaleDateString('default', { day: 'numeric', month: 'short' })}
          </span>
        </div>
      </div>
      <div className="rounded-lg p-3 w-full" style={{ background: theme.secondary, color: theme.onSecondary }}>
        <div className="grid grid-cols-7 text-center text-xs font-bold tracking-wide mb-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 text-center text-sm gap-y-1">
          {Array.from({ length: firstWeekday }, (_, i) => (
            <span key={`b${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const date = new Date(monthStart.getFullYear(), monthStart.getMonth(), i + 1);
            const inWeek = weekDates.includes(ymd(date));
            return (
              <button
                key={i}
                onClick={() => onPickWeek(date)}
                className="rounded-full leading-6 mx-auto w-7 cursor-pointer"
                style={inWeek ? { background: theme.primary, color: theme.onPrimary, fontWeight: 700 } : undefined}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Goals */}
      <div className="rounded-lg px-4 pt-3 pb-2" style={{ background: theme.primary, color: theme.onPrimary }}>
        <div className="text-center text-sm tracking-[0.2em] font-medium mb-1">GOALS</div>
        <PaperText value={page.goals ?? ''} onChange={(goals) => onChange({ goals })} placeholder="What do I want this week?" minRows={3} />
      </div>

      {/* To do */}
      <div className="rounded-lg px-4 pt-3 pb-3" style={{ background: theme.secondary, color: theme.onSecondary }}>
        <div className="text-center text-sm tracking-[0.2em] font-medium mb-2">TO DO</div>
        <ul className="space-y-1.5">
          {todos.map((t) => (
            <li key={t.id} className="flex items-center gap-2">
              <button
                onClick={() => setTodos(todos.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)))}
                className="w-4.5 h-4.5 shrink-0 rounded border-2 flex items-center justify-center cursor-pointer"
                style={{ borderColor: theme.onSecondary, background: t.done ? theme.primary : 'transparent' }}
                aria-label={t.done ? 'Mark not done' : 'Mark done'}
              >
                {t.done && <Check className="w-3 h-3" style={{ color: theme.onPrimary }} />}
              </button>
              <input
                value={t.text}
                onChange={(e) => setTodos(todos.map((x) => (x.id === t.id ? { ...x, text: e.target.value } : x)))}
                className={`flex-1 min-w-0 bg-transparent text-sm focus:outline-none ${t.done ? 'line-through opacity-60' : ''}`}
                style={{ color: 'inherit' }}
              />
              <button onClick={() => setTodos(todos.filter((x) => x.id !== t.id))} className="opacity-60 cursor-pointer" aria-label="Remove to-do">
                <X className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2 mt-2">
          <Plus className="w-4 h-4 opacity-70 shrink-0" />
          <input
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTodo()}
            onBlur={addTodo}
            placeholder="Add a to-do"
            className="flex-1 bg-transparent text-sm focus:outline-none placeholder:opacity-50"
            style={{ color: 'inherit' }}
          />
        </div>
      </div>

      {/* Days */}
      {DAYS.map((d) => {
        const dates = d.offsets.map((o) => addDays(monday, o));
        const dayEvents = events
          .filter((e) => dates.some((date) => sameDay(new Date(e.dueAt), date)))
          .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
        const isToday = dates.some((date) => sameDay(date, today));
        return (
          <section key={d.key}>
            <div className="relative h-9 rounded-sm flex items-center" style={{ background: theme.primary }}>
              <Script theme={theme} className="absolute left-3 -top-3 text-4xl">
                <span style={{ color: theme.ink }}>{d.name}</span>
              </Script>
              <span className="ml-auto text-[11px] font-bold mr-2" style={{ color: theme.onPrimary }}>
                {isToday && 'TODAY · '}
                {dates.map((date) => date.getDate()).join(' – ')}
              </span>
              <button
                onClick={() => addEventOn(dates[0])}
                className="mr-2 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer"
                style={{ background: theme.onPrimary, color: theme.primary }}
                aria-label={`Add event on ${d.name}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="px-1 pt-2">
              {dayEvents.map((evt) => {
                const mod = modules.find((m) => m.id === evt.moduleId);
                const due = new Date(evt.dueAt);
                const overdue = !evt.isCompleted && due.getTime() < Date.now();
                return (
                  <div key={evt.id} className="flex items-center gap-2 py-1">
                    <button
                      onClick={() => toggleEvent(evt)}
                      className="w-4.5 h-4.5 shrink-0 rounded-full border-2 flex items-center justify-center cursor-pointer"
                      style={{ borderColor: mod?.colour || theme.primary, background: evt.isCompleted ? mod?.colour || theme.primary : 'transparent' }}
                      aria-label={evt.isCompleted ? 'Mark not done' : 'Mark done'}
                    >
                      {evt.isCompleted && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <span className={`flex-1 min-w-0 text-sm font-semibold truncate ${evt.isCompleted ? 'line-through opacity-50' : ''}`}>
                      {mod?.code ? `${mod.code} · ` : ''}
                      {evt.title}
                    </span>
                    <span className={`text-[11px] font-bold ${overdue ? 'text-rose-600' : 'opacity-60'}`}>
                      {d.offsets.length > 1 && `${due.toLocaleDateString('default', { weekday: 'short' })} `}
                      {due.toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button
                      onClick={() => confirm(`Delete "${evt.title}"?`) && deleteEvent(evt.id)}
                      className="opacity-40 hover:opacity-100 cursor-pointer"
                      aria-label="Delete event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
              <PaperText
                value={page.days?.[d.key] ?? ''}
                onChange={(text) => onChange({ days: { ...page.days, [d.key]: text } })}
                placeholder="Plans, notes…"
              />
            </div>
          </section>
        );
      })}

      {/* Notes */}
      <div className="rounded-lg px-4 pt-3 pb-2" style={{ background: theme.primary, color: theme.onPrimary }}>
        <div className="text-center text-sm tracking-[0.2em] font-medium mb-1">NOTES</div>
        <PaperText value={page.notes ?? ''} onChange={(notes) => onChange({ notes })} minRows={4} />
      </div>
    </div>
  );
};
