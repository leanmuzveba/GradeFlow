import React from 'react';
import { PlannerTheme } from './themes';
import { PlacedSticker } from './types';
import { packStickerUrl } from './stickers';

export interface PaperColors {
  paper: string;
  ink: string;
}

/** Image URL for a sticker ref; user stickers resolve through `userUrls`. */
export const stickerSrc = (ref: string, userUrls: Record<string, string>) =>
  ref.startsWith('pack:') ? packStickerUrl(ref.slice(5)) : userUrls[ref.slice(5)];

interface PaperProps {
  theme: PlannerTheme;
  colors: PaperColors;
  stickers: PlacedSticker[];
  userStickerUrls: Record<string, string>;
  /** Rendered over the page content (the sticker editor while decorating). */
  overlay?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * A planner page. Sticker positions are fractions of the page width, so they
 * use container-width (cqw) units and stay put as the page grows taller.
 */
export const Paper: React.FC<PaperProps> = ({ theme, colors, stickers, userStickerUrls, overlay, children }) => (
  <div
    className="relative rounded-[22px] shadow-md border overflow-hidden"
    style={{
      background: colors.paper,
      color: colors.ink,
      borderColor: `${theme.primary}55`,
      containerType: 'inline-size',
      fontFamily: "'Patrick Hand', 'Comic Sans MS', cursive",
    }}
  >
    <div className="relative">{children}</div>
    {overlay ?? (
      <div className="absolute inset-0 pointer-events-none">
        {stickers.map((s) => {
          const src = stickerSrc(s.ref, userStickerUrls);
          return src ? (
            <img
              key={s.id}
              src={src}
              alt=""
              className="planner-sticker absolute select-none"
              style={{ left: `${s.x * 100}cqw`, top: `${s.y * 100}cqw`, width: `${s.size * 100}cqw`, transform: `rotate(${s.rotation}deg)` }}
            />
          ) : null;
        })}
      </div>
    )}
  </div>
);

/** Script heading in the theme's font. */
export const Script: React.FC<{ theme: PlannerTheme; className?: string; children: React.ReactNode }> = ({ theme, className = '', children }) => (
  <span className={`leading-none ${className}`} style={{ fontFamily: theme.font }}>
    {children}
  </span>
);

/** Borderless text area that grows with its content. */
export const PaperText: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  minRows?: number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ value, onChange, placeholder, minRows = 2, className = '', style }) => (
  <textarea
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    rows={minRows}
    className={`w-full bg-transparent resize-none text-base leading-6 focus:outline-none placeholder:opacity-50 field-sizing-content ${className}`}
    style={{ color: 'inherit', minHeight: `${minRows * 1.5}rem`, ...style }}
  />
);
