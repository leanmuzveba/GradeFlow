import React, { useEffect, useState } from 'react';
import { ChevronDown, Pause, Play, CheckCircle2, SlidersHorizontal, X, Check } from 'lucide-react';
import './FocusFullscreen.css';

export type FullscreenTimerTheme = 'mono' | 'pink' | 'moonlight';

const THEME_STORAGE_KEY = 'gradeflow_fs_timer_theme_v1';

const THEMES: { id: FullscreenTimerTheme; label: string; swatchBg: string; swatchFg: string }[] = [
  { id: 'mono', label: 'Black & White', swatchBg: '#000000', swatchFg: '#ffffff' },
  { id: 'pink', label: 'White & Pink', swatchBg: '#fff8fc', swatchFg: '#e91e8c' },
  { id: 'moonlight', label: 'Moonlight', swatchBg: '#e7ebee', swatchFg: '#0d9488' },
];

export const getStoredFullscreenTimerTheme = (): FullscreenTimerTheme => {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'mono' || saved === 'pink' || saved === 'moonlight') return saved;
  } catch {
    // ignore
  }
  return 'mono';
};

interface FocusFullscreenProps {
  timeSeconds: number;
  isRunning: boolean;
  sessionLabel: string;
  onToggle: () => void;
  onFinish: () => void;
  onClose: () => void;
}

const DigitTile: React.FC<{ char: string }> = ({ char }) => <span className="fs-digit">{char}</span>;

export const FocusFullscreen: React.FC<FocusFullscreenProps> = ({
  timeSeconds,
  isRunning,
  sessionLabel,
  onToggle,
  onFinish,
  onClose,
}) => {
  const [theme, setTheme] = useState<FullscreenTimerTheme>(getStoredFullscreenTimerTheme);
  const [isThemeSheetOpen, setIsThemeSheetOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const totalSeconds = Math.max(0, Math.floor(timeSeconds));
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  const pair = (n: number) => n.toString().padStart(2, '0').split('');
  const [h1, h2] = pair(hrs > 99 ? 99 : hrs);
  const [m1, m2] = pair(mins);
  const [s1, s2] = pair(secs);

  return (
    <div className="gf-fs" data-fs-theme={theme}>
      <button className="fs-close" onClick={onClose} aria-label="Exit fullscreen timer">
        <ChevronDown />
      </button>

      <div className="fs-header">
        <span className="fs-dot" />
        <span>{sessionLabel}</span>
      </div>

      <div className="fs-stage">
        <div>
          <div className="fs-digits">
            <div className="fs-group">
              <DigitTile char={h1} />
              <DigitTile char={h2} />
            </div>
            <div className="fs-group">
              <DigitTile char={m1} />
              <DigitTile char={m2} />
            </div>
            <div className="fs-group">
              <DigitTile char={s1} />
              <DigitTile char={s2} />
            </div>
          </div>
          <p className="fs-label">{isRunning ? 'In Flow Session' : 'Paused'}</p>
        </div>
      </div>

      <div className="fs-rail">
        <button className="fs-rail-btn" onClick={onFinish} aria-label="Finish session" title="Finish session">
          <CheckCircle2 />
        </button>
        <button
          className="fs-rail-btn is-play"
          onClick={onToggle}
          aria-label={isRunning ? 'Pause' : 'Resume'}
          title={isRunning ? 'Pause' : 'Resume'}
        >
          {isRunning ? <Pause /> : <Play />}
        </button>
        <button
          className="fs-rail-btn"
          onClick={() => setIsThemeSheetOpen((v) => !v)}
          aria-label="Change timer theme"
          title="Change timer theme"
        >
          {isThemeSheetOpen ? <X /> : <SlidersHorizontal />}
        </button>
      </div>

      {isThemeSheetOpen && (
        <div className="fs-theme-sheet">
          {THEMES.map((t) => (
            <button
              key={t.id}
              className={`fs-theme-swatch ${theme === t.id ? 'is-active' : ''}`}
              style={{ background: t.swatchBg }}
              title={t.label}
              onClick={() => setTheme(t.id)}
            >
              {theme === t.id && <Check style={{ color: t.swatchFg }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
