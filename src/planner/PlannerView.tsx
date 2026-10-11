import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { usePlanner } from './usePlanner';
import { themeById } from './themes';
import { monthKey, mondayOf, weekKey, weeksOfMonth, ymd } from './dates';
import { Paper, PaperColors } from './Paper';
import { WeekSpread } from './WeekSpread';
import { CalendarTools } from './CalendarTools';

type Section = { kind: 'week'; index: number };

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);

export const PlannerView: React.FC = () => {
  const { profile } = useApp();
  const { pages, updatePage } = usePlanner();

  const [monthStart, setMonthStart] = useState(() => startOfMonth(new Date()));
  const weeks = weeksOfMonth(monthStart);
  const currentWeekIndex = () => {
    const i = weeks.findIndex((m) => ymd(m) === ymd(mondayOf(new Date())));
    return i < 0 ? 0 : i;
  };
  const [section, setSection] = useState<Section>(() => ({ kind: 'week', index: currentWeekIndex() }));

  const month = pages[monthKey(monthStart)] ?? {};
  const theme = themeById(month.theme);
  const colors: PaperColors = profile.theme === 'dark' ? { paper: '#161616', ink: '#f2f2f2' } : { paper: theme.paper, ink: theme.ink };

  const goToMonth = (delta: number) => {
    setMonthStart(new Date(monthStart.getFullYear(), monthStart.getMonth() + delta, 1));
    setSection({ kind: 'week', index: 0 });
  };

  const pickWeekOf = (date: Date) => {
    const i = weeks.findIndex((m) => ymd(m) === ymd(mondayOf(date)));
    if (i >= 0) setSection({ kind: 'week', index: i });
  };

  const weekIndex = Math.min(section.index, weeks.length - 1);
  const monday = weeks[weekIndex];
  const wKey = weekKey(monday);
  const week = pages[wKey] ?? {};

  const tabs = weeks.map((_, i) => ({ label: `Week ${i + 1}`, active: weekIndex === i, go: () => setSection({ kind: 'week', index: i }) }));

  return (
    <div className="space-y-3 pb-24 animate-fade-in">
      {/* Month navigation */}
      <div className="flex items-center justify-between gap-2">
        <button onClick={() => goToMonth(-1)} className="p-2 rounded-full bg-[var(--gf-card)] border border-[var(--gf-border)] text-[var(--gf-text)] cursor-pointer" aria-label="Previous month">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="text-sm font-extrabold text-[var(--gf-text)]">
          {monthStart.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </div>
        <button onClick={() => goToMonth(1)} className="p-2 rounded-full bg-[var(--gf-card)] border border-[var(--gf-border)] text-[var(--gf-text)] cursor-pointer" aria-label="Next month">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <CalendarTools />

      {/* Divider tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {tabs.map((t) => (
          <button
            key={t.label}
            onClick={t.go}
            className="shrink-0 px-3.5 py-1.5 rounded-t-2xl rounded-b-md text-xs font-bold transition-all cursor-pointer"
            style={
              t.active
                ? { background: theme.primary, color: theme.onPrimary, transform: 'translateY(-2px)' }
                : { background: `${theme.primary}33`, color: 'var(--gf-text)' }
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      <Paper theme={theme} colors={colors} stickers={week.stickers ?? theme.decor.week} userStickerUrls={{}}>
        <WeekSpread
          key={wKey}
          theme={theme}
          monthStart={monthStart}
          monday={monday}
          page={week}
          onChange={(u) => updatePage(wKey, u)}
          onPickWeek={pickWeekOf}
        />
      </Paper>
    </div>
  );
};
