import React from 'react';
import { ImagePlus } from 'lucide-react';
import { PlannerTheme } from './themes';
import { MonthPage } from './types';
import { Script } from './Paper';

/** Text area drawn on ruled lines, like the review page of the paper planner. */
const RuledText: React.FC<{ value: string; onChange: (v: string) => void; lines: number; ink: string }> = ({ value, onChange, lines, ink }) => (
  <textarea
    value={value}
    onChange={(e) => onChange(e.target.value)}
    rows={lines}
    className="w-full bg-transparent resize-none text-base focus:outline-none field-sizing-content"
    style={{
      color: 'inherit',
      lineHeight: '32px',
      minHeight: `${lines * 32}px`,
      backgroundImage: `repeating-linear-gradient(transparent 0 31px, ${ink}66 31px 32px)`,
      backgroundAttachment: 'local',
    }}
  />
);

export const CoverPage: React.FC<{ theme: PlannerTheme; monthStart: Date; page: MonthPage; onChange: (u: Partial<MonthPage>) => void }> = ({
  theme,
  monthStart,
  page,
  onChange,
}) => (
  <div className="flex flex-col items-center text-center px-6" style={{ minHeight: '140cqw', paddingTop: '34cqw' }}>
    <Script theme={theme} className="text-7xl">
      {monthStart.toLocaleString('default', { month: 'long' })}
    </Script>
    <div className="mt-3 text-lg tracking-[0.4em] font-bold" style={{ color: theme.primary }}>
      {monthStart.getFullYear()}
    </div>
    <div className="mt-8 w-full max-w-xs rounded-2xl px-4 py-3" style={{ background: `${theme.primary}22` }}>
      <div className="text-xs tracking-[0.2em] font-bold mb-1" style={{ color: theme.primary }}>
        THIS MONTH I WILL…
      </div>
      <textarea
        value={page.notes ?? ''}
        onChange={(e) => onChange({ notes: e.target.value })}
        rows={3}
        className="w-full bg-transparent resize-none text-base text-center focus:outline-none field-sizing-content"
        style={{ color: 'inherit', minHeight: '4.5rem' }}
      />
    </div>
  </div>
);

interface ReviewProps {
  theme: PlannerTheme;
  ink: string;
  page: MonthPage;
  onChange: (u: Partial<MonthPage>) => void;
  /** Signed URLs for the 4 Memory Dump photos (null = empty frame). */
  photoUrls: (string | null)[];
  onPickPhoto?: (index: number) => void;
}

export const ReviewPage: React.FC<ReviewProps> = ({ theme, ink, page, onChange, photoUrls, onPickPhoto }) => (
  <div className="p-5 sm:p-7 space-y-6">
    <div className="text-center pt-4">
      <Script theme={theme} className="text-5xl">
        Monthly Review
      </Script>
    </div>

    <div>
      <div className="text-sm font-bold tracking-wide" style={{ color: theme.primary }}>
        HIGHLIGHT OF THE MONTH
      </div>
      <RuledText value={page.highlight ?? ''} onChange={(highlight) => onChange({ highlight })} lines={6} ink={ink} />
    </div>

    <div>
      <div className="text-sm font-bold tracking-wide" style={{ color: theme.primary }}>
        NOTES
      </div>
      <RuledText value={page.reviewNotes ?? ''} onChange={(reviewNotes) => onChange({ reviewNotes })} lines={6} ink={ink} />
    </div>

    <div className="text-center pt-2">
      <Script theme={theme} className="text-5xl">
        Memory Dump
      </Script>
    </div>

    <div className="grid grid-cols-2 gap-4 pb-2">
      {[0, 1, 2, 3].map((i) => {
        // Alternate frame colours like the paper planner: primary, secondary, secondary, primary
        const frame = i === 0 || i === 3 ? theme.primary : theme.secondary;
        const url = photoUrls[i];
        return (
          <button
            key={i}
            onClick={() => onPickPhoto?.(i)}
            disabled={!onPickPhoto}
            className="p-2.5 pb-10 rounded-sm shadow-sm cursor-pointer disabled:cursor-default"
            style={{ background: frame }}
            aria-label={url ? 'Change photo' : 'Add photo'}
          >
            <div className="aspect-square bg-white flex items-center justify-center overflow-hidden">
              {url ? <img src={url} alt="" className="w-full h-full object-cover" /> : <ImagePlus className="w-7 h-7 text-gray-300" />}
            </div>
          </button>
        );
      })}
    </div>
  </div>
);
