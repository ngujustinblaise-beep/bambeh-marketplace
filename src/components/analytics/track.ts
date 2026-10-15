// BAMBEH_DEPLOY_TOKEN__TRACK_FIX775_CLEAN
/**
 * src/components/analytics/track.ts - FIX775 (new, 15 Oct 2026)
 *
 * The sign-up page (FIX777) and the sign-in page (FIX778) note each step here - opened, pressed the button,
 * account created / signed in, or WHY it failed - so Command Center > App usage > Sign-ups & sign-ins (FIX781)
 * can show where people stop (database FIX773).
 * Nothing personal: the same random id per phone as the visits counter (ActivityPing), the page language, the
 * country of the number (CM, NG...), phone or email, and a short reason word. Never a name, a number, an email
 * or a password. Every error is ignored on purpose: counting must never disturb anyone.
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { supabase } from '@/lib/supabase';

/** The random id of this phone - the same one ActivityPing (FIX665/FIX780) uses for the visits. */
export const DEVICE_KEY = 'bambeh_device_id';

function makeId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  } catch {
    /* fall through to the simple id */
  }
  let s = 'd';
  for (let i = 0; i < 31; i++) s += Math.floor(Math.random() * 16).toString(16);
  return s;
}

export function deviceId(): string {
  try {
    const have = window.localStorage.getItem(DEVICE_KEY);
    if (have && /^[A-Za-z0-9-]{8,64}$/.test(have)) return have;
    const id = makeId();
    window.localStorage.setItem(DEVICE_KEY, id);
    return id;
  } catch {
    return makeId();
  }
}

export type TrackStep =
  | 'join_open' | 'join_submit' | 'join_created' | 'join_failed'
  | 'signin_open' | 'signin_submit' | 'signin_ok' | 'signin_failed';

export interface TrackInfo {
  /** why /join was opened: contact / post / free / direct */
  door?: string | null;
  lang?: string | null;
  /** the country of the phone number: CM, NG... */
  country?: string | null;
  mode?: 'phone' | 'email' | null;
  /** a short word: name, phone, closed, email, password, consent, exists, weak, rate, net, db, wrong, paused, other */
  reason?: string | null;
}

/** Notes one step. Fire and forget: never waits, never throws. */
export function track(step: TrackStep, info: TrackInfo = {}): void {
  try {
    const args = {
      p_device: deviceId(),
      p_step: step,
      p_door: info.door || null,
      p_lang: info.lang || null,
      p_country: info.country || null,
      p_mode: info.mode || null,
      p_reason: info.reason ? String(info.reason).toLowerCase().replace(/[^a-z_]/g, '').slice(0, 24) || null : null,
    };
    void Promise.resolve(supabase.rpc('bambeh_track', args)).then(() => undefined, () => undefined);
  } catch {
    /* never disturb the page */
  }
}
// BAMBEH_END_TOKEN__TRACK_FIX775__COMPLETE
