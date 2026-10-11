import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { PlannerPage } from './types';

type Pages = Record<string, PlannerPage>;

const SAVE_DELAY_MS = 800;

/**
 * All of the user's planner pages, keyed by page_key. Shows the local cache
 * immediately, then the cloud copy; edits save to both (cloud debounced).
 */
export function usePlanner() {
  const userId = useAuth().user!.id;
  const cacheKey = `gradeflow_planner_${userId}`;
  const [pages, setPages] = useState<Pages>(() => {
    try {
      return JSON.parse(localStorage.getItem(cacheKey) || '{}');
    } catch {
      return {};
    }
  });
  const pending = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const latest = useRef(pages);
  latest.current = pages;

  useEffect(() => {
    supabase
      .from('planner_pages')
      .select('page_key, data')
      .eq('user_id', userId)
      .then(({ data, error }) => {
        if (error) {
          console.warn('Planner: using local copy, cloud load failed', error);
          return;
        }
        // Pages with a save still pending keep their newer local version.
        const inCloud = new Set((data ?? []).map((row) => row.page_key));
        setPages((local) => {
          const merged: Pages = { ...local };
          for (const row of data ?? []) if (!pending.current[row.page_key]) merged[row.page_key] = row.data;
          return merged;
        });
        // Pages only on this device (written offline, or before the table
        // existed) get uploaded now so they aren't lost.
        const localOnly = Object.keys(latest.current).filter((key) => !inCloud.has(key));
        if (localOnly.length) {
          supabase
            .from('planner_pages')
            .upsert(localOnly.map((key) => ({ user_id: userId, page_key: key, data: latest.current[key], updated_at: new Date().toISOString() })))
            .then(({ error }) => {
              if (error) console.warn('Planner: failed to upload local pages', error);
            });
        }
      });
  }, [userId]);

  useEffect(() => {
    try {
      localStorage.setItem(cacheKey, JSON.stringify(pages));
    } catch {
      /* storage full or unavailable — the cloud copy still saves */
    }
  }, [pages, cacheKey]);

  const pushToCloud = (key: string) => {
    delete pending.current[key];
    supabase
      .from('planner_pages')
      .upsert({ user_id: userId, page_key: key, data: latest.current[key] ?? {}, updated_at: new Date().toISOString() })
      .then(({ error }) => {
        if (error) console.warn('Planner: failed to save page', key, error);
      });
  };

  // Flush unsaved edits when leaving the planner.
  useEffect(
    () => () => {
      for (const key of Object.keys(pending.current)) {
        clearTimeout(pending.current[key]);
        pushToCloud(key);
      }
    },
    []
  );

  const updatePage = (key: string, updates: Partial<PlannerPage>) => {
    setPages((prev) => {
      const next = { ...prev, [key]: { ...prev[key], ...updates } };
      latest.current = next;
      return next;
    });
    clearTimeout(pending.current[key]);
    pending.current[key] = setTimeout(() => pushToCloud(key), SAVE_DELAY_MS);
  };

  return { pages, updatePage };
}
