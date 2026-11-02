// BAMBEH_DEPLOY_TOKEN__USEBADGECOUNTS_FIX988_CLEAN
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
 * FIX988 - Package 19, Big 2 Nov 2026: "if a new request ... comes, it should signal on the option so moderators could
 *          easily note the problems". Ten more, from public.bambeh_signal_counts() (FIX987), asked with the others:
 *            refund_claims      Refund claims: claims waiting for a decision
 *            featured_ending    Featured ads: adverts whose time ends within 24 hours
 *            shops_new          Shops: new shop pages since you last opened Shops (admins and the super admin)
 *            pharmacy_cover     Pharmacies: towns with no rota or less than 24 hours left
 *            approvals_waiting  Approvals: moderators' messages waiting for an admin
 *            couriers_waiting   Delivery agents: applications waiting
 *            obligations_due    Bambeh payments: bills overdue or due today
 *            foodgas_waiting    Gas & food: waiting for a check + changed after approval
 *            wh_waiting         Women's health: waiting for a check + changed or reported
 *            revive_new         Reactivate adverts: adverts that expired since you last opened it
 *          A number the database could not count comes back with status "error: ..." - the last number stays (the
 *          same rule as a failed poll: never a false zero).
 * --------------------------------------------------------------------------
 * Big's ask, and it is the right one: a moderator should not have to open
 * eleven tabs to discover that nobody has looked at the reset queue for three
 * days. If a section holds something that needs a human, the section says so
 * before you click it.
 *
 * FOUR ROUND TRIPS AT ONCE, NOT TWENTY (FIX988: the fourth is bambeh_signal_counts)
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
  | 'protection_asks'         // FIX972 - User Protection: a moderator asks an admin to release (FIX970)
  | 'refund_claims'           // FIX988 - the ten from bambeh_signal_counts() (FIX987)
  | 'featured_ending'
  | 'shops_new'
  | 'pharmacy_cover'
  | 'approvals_waiting'
  | 'couriers_waiting'
  | 'obligations_due'
  | 'foodgas_waiting'
  | 'wh_waiting'
  | 'revive_new';

export type BadgeMap = Partial<Record<BadgeKey, number>>;

type BadgeRow = { section_key: string; badge_count: number | string | null; status?: string };

/** Which RPC answers for which keys (so a failure of one RPC keeps only its own numbers). */
const DESK_KEYS: BadgeKey[] = ['corp_waiting', 'support_waiting', 'zerm_cashout'];   // FIX886
const STAFF_KEYS: BadgeKey[] = ['agent_reports_waiting', 'fin_payments_stale', 'fin_payouts_waiting', 'protection_asks'];   // FIX945, FIX972
const SIGNAL_KEYS: BadgeKey[] = ['refund_claims', 'featured_ending', 'shops_new', 'pharmacy_cover', 'approvals_waiting',
  'couriers_waiting', 'obligations_due', 'foodgas_waiting', 'wh_waiting', 'revive_new'];   // FIX988
/** FIX988 - numbers that only count what is new since this staff member last opened the section */
export const FRESH_KEYS: BadgeKey[] = ['shops_new', 'revive_new'];

/** A section that just handled something asks for fresh numbers at once (FIX945). */
export const ADMIN_BADGES_EVENT = 'bambeh:admin-badges';
export function refreshAdminBadges(): void {
  try { window.dispatchEvent(new Event(ADMIN_BADGES_EVENT)); } catch { /* the next poll catches up */ }
}

/** FIX988 - the numbers of one answer, and the keys it could not count (status "error: ...") - those keep their last number */
type Parsed = { map: BadgeMap; unknown: BadgeKey[] };

function toMap(data: unknown): Parsed | null {
  if (!Array.isArray(data)) return null;
  const map: BadgeMap = {};
  const unknown: BadgeKey[] = [];
  for (const raw of data as BadgeRow[]) {
    if (!raw?.section_key) continue;
    if (String(raw.status ?? '').indexOf('error') === 0) { unknown.push(raw.section_key as BadgeKey); continue; }
    const n = Number(raw.badge_count);
    if (raw.badge_count === null || !Number.isFinite(n) || n <= 0) continue;
    map[raw.section_key as BadgeKey] = n;
  }
  return { map, unknown };
}

type Group = 'desk' | 'staff' | 'signal' | 'main';
function groupOf(k: BadgeKey): Group {
  if (DESK_KEYS.indexOf(k) >= 0) return 'desk';
  if (STAFF_KEYS.indexOf(k) >= 0) return 'staff';
  if (SIGNAL_KEYS.indexOf(k) >= 0) return 'signal';
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
      const [a, b, c, d] = await Promise.all([
        Promise.resolve(supabase.rpc('admin_badge_counts')).catch(() => ({ data: null, error: true })),
        Promise.resolve(supabase.rpc('bambeh_desk_counts')).catch(() => ({ data: null, error: true })),
        Promise.resolve(supabase.rpc('bambeh_staff_counts')).catch(() => ({ data: null, error: true })),
        Promise.resolve(supabase.rpc('bambeh_signal_counts')).catch(() => ({ data: null, error: true })),   // FIX988
      ]);
      // Deliberate: on ANY failure we keep what we had. See the header.
      const got: Record<Group, Parsed | null> = {
        main: a && !a.error ? toMap(a.data) : null,
        desk: b && !b.error ? toMap(b.data) : null,
        staff: c && !c.error ? toMap(c.data) : null,
        signal: d && !d.error ? toMap(d.data) : null,
      };
      if (!got.main && !got.desk && !got.staff && !got.signal) return;
      if (alive.current) {
        setCounts((prev) => {
          const next: BadgeMap = {};
          (Object.keys(prev) as BadgeKey[]).forEach((k) => {
            const p = got[groupOf(k)];
            if (!p || p.unknown.indexOf(k) >= 0) next[k] = prev[k];   // that RPC failed, or this one number could not be counted: keep it
          });
          return { ...next, ...(got.main ? got.main.map : {}), ...(got.desk ? got.desk.map : {}),
                   ...(got.staff ? got.staff.map : {}), ...(got.signal ? got.signal.map : {}) };
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
// BAMBEH_END_TOKEN__USEBADGECOUNTS_FIX988__COMPLETE
