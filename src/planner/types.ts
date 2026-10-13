/** A sticker stuck on a page. Positions and size are fractions of the page width. */
export interface PlacedSticker {
  id: string;
  ref: string; // 'pack:<sticker id>' or 'user:<storage path>'
  x: number;
  y: number;
  size: number;
  rotation: number;
}

export interface TodoItem {
  id: string;
  text: string;
  done: boolean;
}

export const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'weekend'] as const;
export type DayKey = (typeof DAY_KEYS)[number];

export interface WeekPage {
  goals?: string;
  todos?: TodoItem[];
  notes?: string;
  days?: Partial<Record<DayKey, string>>; // older free-text day notes, shown as tasks until edited
  dayTasks?: Partial<Record<DayKey, TodoItem[]>>;
  stickers?: PlacedSticker[]; // undefined = theme's default decoration
}

export interface MonthPage {
  theme?: string;
  highlight?: string;
  notes?: string; // cover: "this month I will…"
  reviewNotes?: string;
  photos?: (string | null)[]; // storage paths for the 4 Memory Dump frames
  coverStickers?: PlacedSticker[];
  reviewStickers?: PlacedSticker[];
}

export type PlannerPage = WeekPage & MonthPage;
