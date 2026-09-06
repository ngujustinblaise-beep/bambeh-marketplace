// BAMBEH_DEPLOY_TOKEN__USEBADGECOUNTS_FIX496_CLEAN
/**
 * src/features/admin/useBadgeCounts.ts — Bambeh Admin Command Center
 *
 * FIX496 — THE SIGNAL. One number beside every section that has work waiting.
 * ──────────────────────────────────────────────────────────────────────────
 * Big's ask, and it is the right one: a moderator should not have to open
 * eleven tabs to discover that nobody has looked at the reset queue for three
 * days. If a section holds something that needs a human, the section says so
 * before you click it.
 *
 * ONE ROUND TRIP, NOT ELEVEN
 *   Every count comes from a single `admin_badge_counts()` RPC. Eleven separate
 *   count queries on a connection that already drops under load would be eleven
 *   more chances to fail — and this app has already paid for that lesson.
 *
 * A FAILED POLL NEVER CLEARS A BADGE
 *   This is the important line in the file. If the RPC fails we keep the last
 *   known numbers and say nothing. Zeroing a badge on a network error would
 *   quietly tell staff "nothing to do here" at the exact moment we cannot see
 *   — the same class of bug as `catch { return 0 }` in lib.ts that hid the
 *   admin blocker for weeks. A stale badge is a small lie; a false zero is a
 *   queue nobody ever opens again.
 *
 * A BADGE IS A HINT, NOT A GATE
 *   Nothing here throws, and nothing renders an error. The worst case is that
 *   a number is a minute old or missing. The section itself is still one click
 *   away and does its own loading and its own honest error reporting.
 *
 * LANGUAGE: none. This file renders no text at all — only numbers — which is
 * exactly why the admin-English / user-five-languages rule does not bite here.
 *
 * © 2026 BAMBEH SARL. All rights reserved.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

/** Keys returned by public.admin_badge_counts(). Keep in step with the SQL. */
export type BadgeKey =
  | 'reset_requests'
  | 'verify_pharmacies'
  | 'verify_hospitals'
  | 'verify_stores'
  | 'disputes'
  | 'escrow_disputes'
  | 'feedback'
  | 'payments_pending'
  | 'seller_payouts'
  | 'event_payouts'
  | 'listings_pending'
  | 'reports_open';

export type BadgeMap = Partial<Record<BadgeKey, number>>;

type BadgeRow = { section_key: string; badge_count: number | string; status: string };

/**
 * Poll the badge counts.
 * @param intervalMs how often to refresh; 60s by default. Also refreshes when
 *                   the tab regains focus, because a moderator who alt-tabs
 *                   back expects to see now, not a minute ago.
 */
export default function useBadgeCounts(intervalMs = 60000) {
  const [counts, setCounts] = useState<BadgeMap>({});
  const [lastOk, setLastOk] = useState<number | null>(null);
  const alive = useRef(true);
  const inflight = useRef(false);

  const refresh = useCallback(async () => {
    if (inflight.current) return;          // never stack polls on a slow line
    inflight.current = true;
    try {
      const { data, error } = await supabase.rpc('admin_badge_counts');
      // Deliberate: on ANY failure we keep what we had. See the header.
      if (error || !Array.isArray(data)) return;

      const next: BadgeMap = {};
      for (const raw of data as BadgeRow[]) {
        const n = Number(raw?.badge_count);
        if (!raw?.section_key || !Number.isFinite(n) || n <= 0) continue;
        next[raw.section_key as BadgeKey] = n;
      }
      if (alive.current) {
        setCounts(next);
        setLastOk(Date.now());
      }
    } catch {
      /* swallowed on purpose — a badge must never break the panel */
    } finally {
      inflight.current = false;
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    void refresh();
    const id = window.setInterval(() => { void refresh(); }, intervalMs);
    const onFocus = () => { void refresh(); };
    window.addEventListener('focus', onFocus);
    return () => {
      alive.current = false;
      window.clearInterval(id);
      window.removeEventListener('focus', onFocus);
    };
  }, [refresh, intervalMs]);

  /** Total across one nav entry's keys. Requests holds four queues, for example. */
  const sum = useCallback(
    (keys?: BadgeKey[]) => (keys ?? []).reduce((t, k) => t + (counts[k] ?? 0), 0),
    [counts],
  );

  return { counts, sum, refresh, lastOk };
}
// BAMBEH_END_TOKEN__USEBADGECOUNTS_FIX496__COMPLETE
