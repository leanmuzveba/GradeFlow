import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Sticker } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { deletePlannerFile, listUserStickers, resizeImage, uploadPlannerFile, useSignedUrls } from './storage';
import { usePlanner } from './usePlanner';
import { PLANNER_THEMES, themeForMonth } from './themes';
import { monthKey, mondayOf, weekKey, weeksOfMonth, ymd } from './dates';
import { Paper, PaperColors } from './Paper';
import { WeekSpread } from './WeekSpread';
import { CalendarTools } from './CalendarTools';
import { CoverPage, ReviewPage } from './MonthPages';
import { StickerControls, StickerEditor } from './StickerEditor';
import { StickerTray } from './StickerTray';
import { PlacedSticker } from './types';

type Section = { kind: 'cover' } | { kind: 'week'; index: number } | { kind: 'review' };

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);

export const PlannerView: React.FC = () => {
  const { profile } = useApp();
  const userId = useAuth().user!.id;
  const { pages, updatePage } = usePlanner();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const photoSlot = useRef(0);
  const [uploadError, setUploadError] = useState('');
  const [decorating, setDecorating] = useState(false);
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const [myStickers, setMyStickers] = useState<string[]>([]);
  const [uploadingSticker, setUploadingSticker] = useState(false);

  const [monthStart, setMonthStart] = useState(() => startOfMonth(new Date()));
  const weeks = weeksOfMonth(monthStart);
  const currentWeekIndex = () => {
    const i = weeks.findIndex((m) => ymd(m) === ymd(mondayOf(new Date())));
    return i < 0 ? 0 : i;
  };
  const [section, setSection] = useState<Section>(() => ({ kind: 'week', index: currentWeekIndex() }));

  const month = pages[monthKey(monthStart)] ?? {};
  const theme = themeForMonth(monthStart, month.theme);
  const colors: PaperColors = profile.theme === 'dark' ? { paper: '#161616', ink: '#f2f2f2' } : { paper: theme.paper, ink: theme.ink };

  const goToMonth = (delta: number) => {
    setMonthStart(new Date(monthStart.getFullYear(), monthStart.getMonth() + delta, 1));
    setSection({ kind: 'week', index: 0 });
  };

  const pickWeekOf = (date: Date) => {
    const i = weeks.findIndex((m) => ymd(m) === ymd(mondayOf(date)));
    if (i >= 0) setSection({ kind: 'week', index: i });
  };

  const mKey = monthKey(monthStart);
  const weekIndex = Math.min(section.kind === 'week' ? section.index : 0, weeks.length - 1);
  const monday = weeks[weekIndex];
  const wKey = weekKey(monday);
  const week = pages[wKey] ?? {};

  const photos = month.photos ?? [null, null, null, null];
  const signed = useSignedUrls(photos.filter((p): p is string => !!p));

  const pickPhoto = (slot: number) => {
    photoSlot.current = slot;
    photoInputRef.current?.click();
  };

  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadError('');
    const slot = photoSlot.current;
    try {
      const path = await uploadPlannerFile(userId, 'photos', await resizeImage(file, 1280, 'image/jpeg'), 'jpg');
      const old = photos[slot];
      const next = [...photos];
      next[slot] = path;
      updatePage(mKey, { photos: next });
      if (old) deletePlannerFile(old);
    } catch (err) {
      console.warn('Planner: photo upload failed', err);
      setUploadError("Couldn't upload that photo. Check your connection and try again.");
    }
  };

  // Stickers on the page being shown (theme decoration until the page is decorated)
  const pageStickers: PlacedSticker[] =
    section.kind === 'cover'
      ? month.coverStickers ?? theme.decor.cover
      : section.kind === 'review'
        ? month.reviewStickers ?? theme.decor.review
        : week.stickers ?? theme.decor.week;
  const setPageStickers = (stickers: PlacedSticker[]) =>
    section.kind === 'cover'
      ? updatePage(mKey, { coverStickers: stickers })
      : section.kind === 'review'
        ? updatePage(mKey, { reviewStickers: stickers })
        : updatePage(wKey, { stickers });

  useEffect(() => {
    if (decorating) listUserStickers(userId).then(setMyStickers);
  }, [decorating, userId]);

  const userStickerUrls = useSignedUrls([
    ...myStickers,
    ...pageStickers.filter((s) => s.ref.startsWith('user:')).map((s) => s.ref.slice(5)),
  ]);

  const uploadSticker = async (file: File) => {
    setUploadingSticker(true);
    setUploadError('');
    try {
      const path = await uploadPlannerFile(userId, 'stickers', await resizeImage(file, 512, 'image/png'), 'png');
      setMyStickers((prev) => [...prev, path]);
    } catch (err) {
      console.warn('Planner: sticker upload failed', err);
      setUploadError("Couldn't upload that sticker. Check your connection and try again.");
    } finally {
      setUploadingSticker(false);
    }
  };

  const deleteSticker = (path: string) => {
    if (!confirm('Delete this sticker? It will also disappear from pages where you used it.')) return;
    deletePlannerFile(path);
    setMyStickers((prev) => prev.filter((p) => p !== path));
  };

  /** Drops a new sticker in the middle of the visible part of the page. */
  const addSticker = (ref: string) => {
    const rect = paperRef.current!.getBoundingClientRect();
    const size = 0.22;
    const visibleMid = (Math.min(window.innerHeight * 0.4, rect.bottom) - rect.top) / rect.width;
    const sticker: PlacedSticker = { id: crypto.randomUUID(), ref, x: 0.5 - size / 2, y: Math.max(0, visibleMid - size / 2), size, rotation: 0 };
    setPageStickers([...pageStickers, sticker]);
    setSelectedSticker(sticker.id);
  };

  const selected = pageStickers.find((s) => s.id === selectedSticker);
  const updateSelected = (s: PlacedSticker | null) => {
    setPageStickers(s ? pageStickers.map((x) => (x.id === s.id ? s : x)) : pageStickers.filter((x) => x.id !== selectedSticker));
    if (!s) setSelectedSticker(null);
  };

  const tabs = [
    { label: 'Cover', active: section.kind === 'cover', go: () => setSection({ kind: 'cover' }) },
    ...weeks.map((_, i) => ({
      label: `Week ${i + 1}`,
      active: section.kind === 'week' && weekIndex === i,
      go: () => setSection({ kind: 'week', index: i }),
    })),
    { label: 'Review', active: section.kind === 'review', go: () => setSection({ kind: 'review' }) },
  ];

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

      {/* Theme for this month */}
      <div className="flex gap-1.5 overflow-x-auto -mx-1 px-1 [scrollbar-width:none]">
        {PLANNER_THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => updatePage(mKey, { theme: t.id })}
            className="shrink-0 flex items-center gap-1.5 pl-1.5 pr-3 py-1 rounded-full border text-[11px] font-bold cursor-pointer transition-all"
            style={
              t.id === theme.id
                ? { background: t.primary, borderColor: t.primary, color: t.onPrimary }
                : { background: 'var(--gf-card)', borderColor: 'var(--gf-border)', color: 'var(--gf-muted)' }
            }
          >
            <span className="w-4 h-4 rounded-full border-2 border-white/80" style={{ background: `linear-gradient(135deg, ${t.primary} 50%, ${t.secondary} 50%)` }} />
            {t.name}
          </button>
        ))}
      </div>

      <CalendarTools>
        <button
          onClick={() => {
            setDecorating(!decorating);
            setSelectedSticker(null);
          }}
          className="px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          style={decorating ? { background: theme.primary, color: theme.onPrimary } : { background: 'var(--gf-card)', color: 'var(--gf-muted)', border: '1px solid var(--gf-border)' }}
        >
          {decorating ? <Check className="w-3.5 h-3.5" /> : <Sticker className="w-3.5 h-3.5" />}
          {decorating ? 'Done decorating' : 'Decorate'}
        </button>
      </CalendarTools>

      {/* Divider tabs */}
      <div className="flex gap-1.5 overflow-x-auto pt-1 -mx-1 px-1 [scrollbar-width:none]">
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

      <div ref={paperRef} className={decorating ? 'pb-[42vh]' : ''}>
        <Paper
          theme={theme}
          colors={colors}
          stickers={pageStickers}
          userStickerUrls={userStickerUrls}
          overlay={
            decorating ? (
              <StickerEditor
                stickers={pageStickers}
                userStickerUrls={userStickerUrls}
                selectedId={selectedSticker}
                onSelect={setSelectedSticker}
                onChange={setPageStickers}
              />
            ) : undefined
          }
        >
          {section.kind === 'cover' && <CoverPage theme={theme} monthStart={monthStart} page={month} onChange={(u) => updatePage(mKey, u)} />}
          {section.kind === 'week' && (
            <WeekSpread
              key={wKey}
              theme={theme}
              monthStart={monthStart}
              monday={monday}
              page={week}
              onChange={(u) => updatePage(wKey, u)}
              onPickWeek={pickWeekOf}
            />
          )}
          {section.kind === 'review' && (
            <ReviewPage
              theme={theme}
              ink={colors.ink}
              page={month}
              onChange={(u) => updatePage(mKey, u)}
              photoUrls={photos.map((p) => (p ? signed[p] ?? null : null))}
              onPickPhoto={pickPhoto}
            />
          )}
        </Paper>
      </div>

      {decorating && (
        <div className="fixed left-0 right-0 bottom-[72px] z-30 px-3">
          <div className="max-w-xl mx-auto bg-[var(--gf-card)] border border-[var(--gf-border)] rounded-3xl shadow-2xl p-3 space-y-3">
            {selected ? (
              <StickerControls sticker={selected} onUpdate={updateSelected} />
            ) : (
              <p className="text-[11px] text-center text-[var(--gf-muted)]">Tap a sticker to add it · drag stickers on the page to move them · tap one to resize, rotate or remove</p>
            )}
            <StickerTray
              theme={theme}
              onAdd={addSticker}
              userStickers={myStickers}
              userUrls={userStickerUrls}
              onUpload={uploadSticker}
              onDeleteUser={deleteSticker}
              uploading={uploadingSticker}
            />
          </div>
        </div>
      )}

      <input ref={photoInputRef} type="file" accept="image/*" onChange={uploadPhoto} className="hidden" />
      {uploadError && <p className="text-xs font-semibold text-rose-600 text-center">{uploadError}</p>}
    </div>
  );
};
