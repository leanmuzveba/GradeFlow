import { PackId, packStickerIds } from './stickers';
import { PlacedSticker } from './types';

export interface PlannerTheme {
  id: PackId;
  name: string;
  primary: string; // day bars, Goals box, tabs
  onPrimary: string;
  secondary: string; // To Do box, mini calendar
  onSecondary: string;
  paper: string;
  ink: string;
  font: string; // script font for month / day names
  /** Default stickers for pages the user hasn't decorated yet. */
  decor: { cover: PlacedSticker[]; week: PlacedSticker[]; review: PlacedSticker[] };
}

const at = (ref: string, x: number, y: number, size: number, rotation = 0): PlacedSticker => ({
  id: `decor-${ref}-${x}-${y}`,
  ref: `pack:${ref}`,
  x,
  y,
  size,
  rotation,
});

export const PLANNER_THEMES: PlannerTheme[] = [
  {
    id: 'flowers',
    name: 'Flowers',
    primary: '#FB8C47',
    onPrimary: '#ffffff',
    secondary: '#111111',
    onSecondary: '#ffffff',
    paper: '#ffffff',
    ink: '#1a1a1a',
    font: "'Great Vibes', cursive",
    decor: {
      cover: [at('flowers/bouquet', 0.62, 0.62, 0.36, -8), at('flowers/lavender', 0.06, 0.08, 0.2, -15), at('flowers/butterfly', 0.7, 0.1, 0.18, 12)],
      week: [at('flowers/bouquet', 0.74, 0.0, 0.24, 6)],
      review: [at('flowers/sprig', 0.8, 0.0, 0.18, 10), at('flowers/heart', 0.04, 0.02, 0.1, -12)],
    },
  },
  {
    id: 'cactus',
    name: 'Cactus',
    primary: '#5BA84A',
    onPrimary: '#ffffff',
    secondary: '#C6E15B',
    onSecondary: '#22361c',
    paper: '#FBFDF5',
    ink: '#22361c',
    font: "'Pacifico', cursive",
    decor: {
      cover: [at('cactus/saguaro', 0.62, 0.66, 0.32, 4), at('cactus/sun', 0.7, 0.06, 0.22, 0), at('cactus/rosette', 0.06, 0.74, 0.2, -10)],
      week: [at('cactus/barrel', 0.78, 0.0, 0.2, 6)],
      review: [at('cactus/aloe', 0.8, 0.0, 0.17, 8), at('cactus/bloom', 0.04, 0.02, 0.1, -12)],
    },
  },
  {
    id: 'fall',
    name: 'Fall',
    primary: '#A0522D',
    onPrimary: '#ffffff',
    secondary: '#5C3A21',
    onSecondary: '#FFF3DC',
    paper: '#FFF9F0',
    ink: '#3b2414',
    font: "'Dancing Script', cursive",
    decor: {
      cover: [at('fall/maple', 0.64, 0.64, 0.3, 18), at('fall/pumpkin', 0.08, 0.74, 0.24, -6), at('fall/oak', 0.74, 0.06, 0.18, -20)],
      week: [at('fall/maple', 0.78, 0.0, 0.2, 16)],
      review: [at('fall/acorn', 0.8, 0.0, 0.15, 10), at('fall/mushroom', 0.04, 0.02, 0.11, -12)],
    },
  },
  {
    id: 'pineapple',
    name: 'Pineapple',
    primary: '#F7B81A',
    onPrimary: '#3d2a00',
    secondary: '#F2711C',
    onSecondary: '#ffffff',
    paper: '#FFFDF4',
    ink: '#3d2a00',
    font: "'Pacifico', cursive",
    decor: {
      cover: [at('pineapple/pineapple', 0.64, 0.6, 0.3, 8), at('pineapple/sun', 0.72, 0.05, 0.2, 0), at('pineapple/hibiscus', 0.06, 0.74, 0.2, -12)],
      week: [at('pineapple/pineapple', 0.8, 0.0, 0.17, 10)],
      review: [at('pineapple/drink', 0.8, 0.0, 0.15, 8), at('pineapple/orange', 0.04, 0.02, 0.1, -12)],
    },
  },
];

export const themeById = (id?: string) => PLANNER_THEMES.find((t) => t.id === id) ?? PLANNER_THEMES[0];

export const themeStickerIds = (theme: PlannerTheme) => packStickerIds(theme.id);
