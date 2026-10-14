import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications, LocalNotificationSchema } from '@capacitor/local-notifications';
import { AcademicEvent } from '../types';
import { DAY_KEYS, DayKey, PlannerPage, TodoItem } from './types';
import { addDays, mondayOf, sameDay, weekKey } from './dates';
import { textToTasks } from './TaskLines';

const SUMMARY_HOUR = 7;
// ponytail: summaries are only scheduled this far ahead and refreshed whenever
// the planner opens; a background job would be needed to cover longer gaps.
const SUMMARY_DAYS = 14;
const SYNC_DELAY_MS = 1500;

/** The planner box a date falls in (Saturday and Sunday share 'weekend'). */
const dayKeyOf = (d: Date): DayKey => DAY_KEYS[Math.min((d.getDay() + 6) % 7, 5)];

const tasksOn = (pages: Record<string, PlannerPage>, d: Date): TodoItem[] => {
  const page = pages[weekKey(mondayOf(d))];
  const key = dayKeyOf(d);
  return page?.dayTasks?.[key] ?? textToTasks(page?.days?.[key]);
};

/** Stable 31-bit id for a task, so its reminder never collides with a summary (ids 1–99). */
const taskNotificationId = (taskId: string) => {
  let h = 0;
  for (const c of taskId) h = (h * 31 + c.charCodeAt(0)) | 0;
  return (h & 0x7fffffff) | 0x100;
};

function buildNotifications(pages: Record<string, PlannerPage>, events: AcademicEvent[]): LocalNotificationSchema[] {
  const now = new Date();
  const out: LocalNotificationSchema[] = [];

  for (let i = 0; i < SUMMARY_DAYS; i++) {
    const day = addDays(now, i);
    const at = new Date(day.getFullYear(), day.getMonth(), day.getDate(), SUMMARY_HOUR);
    if (at <= now) continue;
    const tasks = tasksOn(pages, day).filter((t) => !t.done && t.text.trim());
    const due = events.filter((e) => !e.isCompleted && sameDay(new Date(e.dueAt), day));
    const lines = [...due.map((e) => `Due: ${e.title}`), ...tasks.map((t) => `• ${t.text}`)];
    if (!lines.length) continue;
    out.push({
      id: i + 1,
      title: `Today: ${lines.length} thing${lines.length === 1 ? '' : 's'} to do`,
      body: lines.slice(0, 3).join('\n') + (lines.length > 3 ? `\n+${lines.length - 3} more` : ''),
      largeBody: lines.join('\n'),
      schedule: { at, allowWhileIdle: true },
    });
  }

  for (const [key, page] of Object.entries(pages)) {
    if (!key.startsWith('week:')) continue;
    for (const tasks of Object.values(page.dayTasks ?? {})) {
      for (const t of tasks ?? []) {
        if (t.done || !t.remindAt) continue;
        const at = new Date(t.remindAt);
        if (at <= now) continue;
        out.push({ id: taskNotificationId(t.id), title: 'Reminder', body: t.text, schedule: { at, allowWhileIdle: true } });
      }
    }
  }
  return out;
}

/** Keeps the phone's scheduled notifications in step with the planner. */
export function useReminders(pages: Record<string, PlannerPage>, events: AcademicEvent[]) {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const timer = setTimeout(async () => {
      try {
        let { display } = await LocalNotifications.checkPermissions();
        if (display === 'prompt' || display === 'prompt-with-rationale') ({ display } = await LocalNotifications.requestPermissions());
        if (display !== 'granted') return;
        const pending = await LocalNotifications.getPending();
        if (pending.notifications.length) await LocalNotifications.cancel({ notifications: pending.notifications.map(({ id }) => ({ id })) });
        const notifications = buildNotifications(pages, events);
        if (notifications.length) await LocalNotifications.schedule({ notifications });
      } catch (err) {
        console.warn('Reminders: could not schedule notifications', err);
      }
    }, SYNC_DELAY_MS);
    return () => clearTimeout(timer);
  }, [pages, events]);
}
