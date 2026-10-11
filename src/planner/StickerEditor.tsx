import React, { useEffect, useRef, useState } from 'react';
import { RotateCcw, RotateCw, Trash2, ZoomIn, ZoomOut } from 'lucide-react';
import { PlacedSticker } from './types';
import { stickerSrc } from './Paper';

interface EditorProps {
  stickers: PlacedSticker[];
  userStickerUrls: Record<string, string>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChange: (stickers: PlacedSticker[]) => void;
}

/**
 * Interactive sticker layer shown over the page while decorating: drag to
 * move, tap to select. Moves are kept locally and saved when the finger lifts.
 */
export const StickerEditor: React.FC<EditorProps> = ({ stickers, userStickerUrls, selectedId, onSelect, onChange }) => {
  const layerRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState(stickers);
  const drag = useRef<{ id: string; px: number; py: number; x: number; y: number; w: number; moved: boolean } | null>(null);

  useEffect(() => setItems(stickers), [stickers]);

  const down = (e: React.PointerEvent, s: PlacedSticker) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { id: s.id, px: e.clientX, py: e.clientY, x: s.x, y: s.y, w: layerRef.current!.getBoundingClientRect().width, moved: false };
    onSelect(s.id);
  };

  const move = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = (e.clientX - d.px) / d.w;
    const dy = (e.clientY - d.py) / d.w;
    if (Math.abs(dx) + Math.abs(dy) > 0.005) d.moved = true;
    setItems((prev) => prev.map((s) => (s.id === d.id ? { ...s, x: Math.min(0.95, Math.max(-0.1, d.x + dx)), y: Math.max(-0.1, d.y + dy) } : s)));
  };

  const up = () => {
    if (drag.current?.moved) onChange(items);
    drag.current = null;
  };

  return (
    <div ref={layerRef} className="absolute inset-0" onPointerDown={() => onSelect(null)}>
      {items.map((s) => {
        const src = stickerSrc(s.ref, userStickerUrls);
        if (!src) return null;
        const selected = s.id === selectedId;
        return (
          <img
            key={s.id}
            src={src}
            alt=""
            draggable={false}
            onPointerDown={(e) => down(e, s)}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
            className="planner-sticker absolute select-none cursor-grab"
            style={{
              left: `${s.x * 100}cqw`,
              top: `${s.y * 100}cqw`,
              width: `${s.size * 100}cqw`,
              transform: `rotate(${s.rotation}deg)`,
              touchAction: 'none',
              outline: selected ? '2px dashed #3b82f6' : 'none',
              outlineOffset: 4,
            }}
          />
        );
      })}
    </div>
  );
};

/** Controls for the selected sticker (rendered outside the page, above the tray). */
export const StickerControls: React.FC<{ sticker: PlacedSticker; onUpdate: (s: PlacedSticker | null) => void }> = ({ sticker, onUpdate }) => {
  const btn = 'w-10 h-10 rounded-full bg-[var(--gf-tint)] text-[var(--gf-text)] flex items-center justify-center cursor-pointer active:scale-95';
  const set = (u: Partial<PlacedSticker>) => onUpdate({ ...sticker, ...u });
  return (
    <div className="flex items-center justify-center gap-2">
      <button className={btn} onClick={() => set({ size: Math.max(0.06, sticker.size - 0.03) })} aria-label="Smaller">
        <ZoomOut className="w-4 h-4" />
      </button>
      <button className={btn} onClick={() => set({ size: Math.min(0.9, sticker.size + 0.03) })} aria-label="Bigger">
        <ZoomIn className="w-4 h-4" />
      </button>
      <button className={btn} onClick={() => set({ rotation: sticker.rotation - 15 })} aria-label="Rotate left">
        <RotateCcw className="w-4 h-4" />
      </button>
      <button className={btn} onClick={() => set({ rotation: sticker.rotation + 15 })} aria-label="Rotate right">
        <RotateCw className="w-4 h-4" />
      </button>
      <button className={`${btn} !text-rose-600`} onClick={() => onUpdate(null)} aria-label="Remove sticker">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};
