/** Local YYYY-MM-DD (toISOString would shift the day across timezones). */
export const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const monthKey = (d: Date) => `month:${ymd(d).slice(0, 7)}`;
export const weekKey = (monday: Date) => `week:${ymd(monday)}`;

export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

export const mondayOf = (d: Date) => addDays(d, -((d.getDay() + 6) % 7));

/** Mondays of every week that overlaps the month (4–6 weeks). */
export function weeksOfMonth(monthStart: Date): Date[] {
  const last = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
  const weeks: Date[] = [];
  for (let m = mondayOf(monthStart); m <= last; m = addDays(m, 7)) weeks.push(m);
  return weeks;
}

export const sameDay = (a: Date, b: Date) => ymd(a) === ymd(b);
