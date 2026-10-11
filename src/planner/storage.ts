import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const BUCKET = 'planner';
const URL_TTL_SECONDS = 60 * 60 * 24;

/** Shrinks an image so its longest side is at most `maxSide` px. */
export async function resizeImage(file: File, maxSide: number, type: 'image/jpeg' | 'image/png'): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not process image'))), type, 0.82)
  );
}

/** Uploads to planner/<userId>/<folder>/<random>.<ext> and returns the storage path. */
export async function uploadPlannerFile(userId: string, folder: 'photos' | 'stickers', blob: Blob, ext: string) {
  const path = `${userId}/${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: blob.type });
  if (error) throw error;
  return path;
}

export async function deletePlannerFile(path: string) {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) console.warn('Planner: failed to delete file', path, error);
}

export async function listUserStickers(userId: string): Promise<string[]> {
  const { data, error } = await supabase.storage.from(BUCKET).list(`${userId}/stickers`, { limit: 500, sortBy: { column: 'created_at', order: 'asc' } });
  if (error) {
    console.warn('Planner: failed to list stickers', error);
    return [];
  }
  return (data ?? []).filter((f) => f.id).map((f) => `${userId}/stickers/${f.name}`);
}

const urlCache: Record<string, string> = {};

/** Temporary display URLs for private files, fetched in one batch and cached for the session. */
export function useSignedUrls(paths: string[]): Record<string, string> {
  const [urls, setUrls] = useState<Record<string, string>>(() => ({ ...urlCache }));
  const missing = paths.filter((p) => !urlCache[p]);
  const missingKey = missing.join('|');

  useEffect(() => {
    if (missing.length === 0) return;
    supabase.storage
      .from(BUCKET)
      .createSignedUrls(missing, URL_TTL_SECONDS)
      .then(({ data, error }) => {
        if (error) return console.warn('Planner: failed to load images', error);
        for (const item of data ?? []) if (item.path && item.signedUrl) urlCache[item.path] = item.signedUrl;
        setUrls({ ...urlCache });
      });
  }, [missingKey]);

  return urls;
}
