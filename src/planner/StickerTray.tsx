import React, { useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { PLANNER_THEMES, PlannerTheme } from './themes';
import { packStickerIds, packStickerUrl } from './stickers';

interface Props {
  theme: PlannerTheme;
  onAdd: (ref: string) => void;
  userStickers: string[];
  userUrls: Record<string, string>;
  onUpload?: (file: File) => void;
  onDeleteUser?: (path: string) => void;
  uploading?: boolean;
  initialTab?: string;
}

/** Sticker picker: this month's pack first, then the other packs and the user's own uploads. */
export const StickerTray: React.FC<Props> = ({ theme, onAdd, userStickers, userUrls, onUpload, onDeleteUser, uploading, initialTab }) => {
  const packs = [theme, ...PLANNER_THEMES.filter((t) => t.id !== theme.id)];
  const [tab, setTab] = useState<string>(initialTab ?? theme.id);
  const [editingMine, setEditingMine] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const cell = 'w-16 h-16 shrink-0 rounded-2xl bg-[var(--gf-tint)] p-2 flex items-center justify-center cursor-pointer active:scale-95 relative';

  return (
    <div>
      <div className="flex gap-1.5 overflow-x-auto pb-2">
        {packs.map((p) => (
          <button
            key={p.id}
            onClick={() => setTab(p.id)}
            className="shrink-0 px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer"
            style={tab === p.id ? { background: p.primary, color: p.onPrimary } : { background: 'var(--gf-tint)', color: 'var(--gf-muted)' }}
          >
            {p.name}
          </button>
        ))}
        {onUpload && (
        <button
          onClick={() => setTab('mine')}
          className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer ${
            tab === 'mine' ? 'bg-[var(--gf-primary)] text-white' : 'bg-[var(--gf-tint)] text-[var(--gf-muted)]'
          }`}
        >
          My stickers
        </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 max-h-[22vh] overflow-y-auto">
        {tab !== 'mine' &&
          packStickerIds(packs.find((p) => p.id === tab)!.id).map((id) => (
            <button key={id} className={cell} onClick={() => onAdd(`pack:${id}`)} aria-label={`Add ${id.split('/')[1]} sticker`}>
              <img src={packStickerUrl(id)} alt="" className="planner-sticker max-w-full max-h-full" />
            </button>
          ))}

        {tab === 'mine' && (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/webp,image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = '';
                if (f) onUpload?.(f);
              }}
            />
            <button className={`${cell} border-2 border-dashed border-[var(--gf-border)] !bg-transparent`} onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? <span className="text-[10px] font-bold text-[var(--gf-muted)]">Uploading…</span> : <Plus className="w-6 h-6 text-[var(--gf-muted)]" />}
            </button>
            {userStickers.map((path) =>
              userUrls[path] ? (
                <div key={path} className={cell} onClick={() => !editingMine && onAdd(`user:${path}`)}>
                  <img src={userUrls[path]} alt="" className="planner-sticker max-w-full max-h-full" />
                  {editingMine && (
                    <button
                      onClick={() => onDeleteUser?.(path)}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center cursor-pointer"
                      aria-label="Delete sticker"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ) : null
            )}
            {userStickers.length > 0 && (
              <button onClick={() => setEditingMine(!editingMine)} className="self-center px-3 py-1 rounded-full text-[11px] font-bold text-[var(--gf-muted)] bg-[var(--gf-tint)] cursor-pointer">
                {editingMine ? 'Done' : 'Edit'}
              </button>
            )}
            {userStickers.length === 0 && !uploading && (
              <p className="text-xs text-[var(--gf-muted)] self-center max-w-[200px]">
                Add your own PNG stickers. Transparent backgrounds look best.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};
