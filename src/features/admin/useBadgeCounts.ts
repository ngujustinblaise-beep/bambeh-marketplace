// BAMBEH_DEPLOY_TOKEN__USEBADGECOUNTS_FIX945_CLEAN
/**
 * src/features/admin/useBadgeCounts.ts - Bambeh Admin Command Center
 *
 * FIX496 - THE SIGNAL. One number beside every section that has work waiting.
 * FIX842 - two more: Businesses (registrations waiting for Bambeh) and Support inbox (members waiting for an
 *          answer), from public.bambeh_desk_counts() (FIX832). Asked at the same time as admin_badge_counts().
 * FIX945 - three more, from public.bambeh_staff_counts() (FIX942), Big 1 Nov 2026:
 *            agent_reports_waiting - Marketing agents: a daily report or an agent's answer waits for Bambeh
 *            fin_payments_stale    - Finances: payments still waiting more than an hour for Mobile Money
 *            fin_payouts_waiting   - Finances: payouts Bambeh still owes
 *          Finances now counts exactly what its page lists first (it used to show 14 for months that nothing on
 *          the page could clear). And a section that just handled something says so at once: it sends the
 *          'bambeh:admin-badges' event (refreshAdminBadges) and the numbers are asked again.
 * --------------------------------------------------------------------------
 * Big's ask, and it is the right one: a moderator should not have to open
 * eleven tabs to discover that nobody has looked at the reset queue for three
 * days. If a section holds something that needs a human, the section says so
 * before you click it.
 *
 * THREE ROUND TRIPS AT ONCE, NOT ELEVEN
 *   admin_badge_counts() (FIX496), bambeh_desk_counts() (FIX832) and
 *   bambeh_staff_counts() (FIX942) are asked together. Each one keeps its own
 *   last good numbers: if one fails, the others still update. (Before FIX942
 *   has run, the third does not exist: its badges simply stay empty.)
 *
 * A FAILED POLL NEVER CLEARS A BADGE
 *   This is the important line in the file. If an RPC fails we keep the last
 *   known numbers and say nothing. Zeroing a badge on a network error would
 *   quietly tell staff "nothing to do here" at the exact moment we cannot see
 *   - the same class of bug as `catch { return 0 }` in lib.ts that hid the
 *   admin blocker for weeks. A stale badge is a small lie; a false zero is a
 *   queue nobody ever opens again.
 *
 * A BADGE IS A HINT, NOT A GATE
 *   Nothing here throws, and nothing renders an error. The worst case is that
 *   a number is a minute old or missing. The section itself is still one click
 *   away and does its own loading and its own honest error reporting.
 *
 * LANGUAGE: none. This file renders no text at all - only numbers - which is
 * exactly why the admin-English / user-five-languages rule does not bite here.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

/** Keys returned by admin_badge_counts(), bambeh_desk_counts() and bambeh_staff_counts(). Keep in step with the SQL. */
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
  | 'reports_open'
  | 'utility_live'      // FIX501
  | 'fuel_pending'      // FIX504
  | 'corp_waiting'      // FIX842 - Businesses
  | 'support_waiting'   // FIX842 - Support inbox
  | 'zerm_cashout'      // FIX886 - Zerm coins: coins-to-money requests waiting (FIX859)
  | 'agent_reports_waiting'   // FIX945 - Marketing agents
  | 'fin_payments_stale'      // FIX945 - Finances: payments waiting more than an hour
  | 'fin_payouts_waiting'     // FIX945 - Finances: payouts Bambeh owes
  | 'protection_asks';        // FIX972 - User Protection: a moderator asks an admin to release (FIX970)

export type BadgeMap = Partial<Record<BadgeKey, number>>;

type BadgeRow = { section_key: string; badge_count: number | string; status?: string };

/** Which RPC answers for which keys (so a failure of one RPC keeps only its own numbers). */
const DESK_KEYS: BadgeKey[] = ['corp_waiting', 'support_waiting', 'zerm_cashout'];   // FIX886
const STAFF_KEYS: BadgeKey[] = ['agent_reports_waiting', 'fin_payments_stale', 'fin_payouts_waiting', 'protection_asks'];   // FIX945, FIX972

/** A section that just handled something asks for fresh numbers at once (FIX945). */
export const ADMIN_BADGES_EVENT = 'bambeh:admin-badges';
export function refreshAdminBadges(): void {
  try { window.dispatchEvent(new Event(ADMIN_BADGES_EVENT)); } catch { /* the next poll catches up */ }
}

function toMap(data: unknown): BadgeMap | null {
  if (!Array.isArray(data)) return null;
  const out: BadgeMap = {};
  for (const raw of data as BadgeRow[]) {
    const n = Number(raw?.badge_count);
    if (!raw?.section_key || !Number.isFinite(n) || n <= 0) continue;
    out[raw.section_key as BadgeKey] = n;
  }
  return out;
}

function groupOf(k: BadgeKey): 'desk' | 'staff' | 'main' {
  if (DESK_KEYS.indexOf(k) >= 0) return 'desk';
  if (STAFF_KEYS.indexOf(k) >= 0) return 'staff';
  return 'main';
}

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
  const again = useRef(false);

  const refresh = useCallback(async () => {
    if (inflight.current) { again.current = true; return; }   // never stack polls; ask once more when this one ends
    inflight.current = true;
    try {
      const [a, b, c] = await Promise.all([
        Promise.resolve(supabase.rpc('admin_badge_counts')).catch(() => ({ data: null, error: true })),
        Promise.resolve(supabase.rpc('bambeh_desk_counts')).catch(() => ({ data: null, error: true })),
        Promise.resolve(supabase.rpc('bambeh_staff_counts')).catch(() => ({ data: null, error: true })),
      ]);
      // Deliberate: on ANY failure we keep what we had. See the header.
      const main = a && !a.error ? toMap(a.data) : null;
      const desk = b && !b.error ? toMap(b.data) : null;
      const staff = c && !c.error ? toMap(c.data) : null;
      if (!main && !desk && !staff) return;
      if (alive.current) {
        setCounts((prev) => {
          const next: BadgeMap = {};
          (Object.keys(prev) as BadgeKey[]).forEach((k) => {
            const g = groupOf(k);
            if ((g === 'desk' && !desk) || (g === 'staff' && !staff) || (g === 'main' && !main)) next[k] = prev[k];   // that RPC failed: keep its numbers
          });
          return { ...next, ...(main || {}), ...(desk || {}), ...(staff || {}) };
        });
        setLastOk(Date.now());
      }
    } catch {
      /* swallowed on purpose - a badge must never break the panel */
    } finally {
      inflight.current = false;
      if (again.current && alive.current) { again.current = false; void refresh(); }
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    void refresh();
    const id = window.setInterval(() => { void refresh(); }, intervalMs);
    const onFocus = () => { void refresh(); };
    window.addEventListener('focus', onFocus);
    window.addEventListener(ADMIN_BADGES_EVENT, onFocus);   // FIX945
    return () => {
      alive.current = false;
      window.clearInterval(id);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener(ADMIN_BADGES_EVENT, onFocus);
    };
  }, [refresh, intervalMs]);

  /** Total across one nav entry's keys. Requests holds four queues, for example. */
  const sum = useCallback(
    (keys?: BadgeKey[]) => (keys ?? []).reduce((t, k) => t + (counts[k] ?? 0), 0),
    [counts],
  );

  return { counts, sum, refresh, lastOk };
}
// BAMBEH_END_TOKEN__USEBADGECOUNTS_FIX945__COMPLETE
