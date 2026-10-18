// BAMBEH_DEPLOY_TOKEN__OPEN_COUNTRIES_FIX812_CLEAN
/**
 * src/lib/africa/useOpenCountries.ts - FIX812 (replaces FIX774)
 *
 * FIX812 (18 Oct 2026, the rest of the world can sign up with a phone number - FIX810/FIX811): a country code
 * the database sends is kept even when this page has not loaded the world list (world.ts), so a country of the
 * rest of the world switched on in Command Center > Countries is never dropped on the way.
 *
 * Which countries Bambeh is open in, as switched in Command Center > Countries (FIX779, database FIX772):
 *   signup - people with a phone number of these countries can create an account
 *   places - these countries are offered by the location filters and when posting
 * Cameroon is always first and always there. Until FIX772 is run in Supabase, or with no network on the first
 * visit: Cameroon only - exactly the app as it was before.
 * The answer is kept on the phone for 6 hours so pages never wait for it; the sign-up page asks again each time.
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { HOME } from './countries';

export interface OpenCountries {
  signup: string[];
  places: string[];
  /** true once the database has answered (now or within the last 6 hours) */
  checked: boolean;
}

const KEY = 'bambeh_open_countries';
const MAX_AGE_MS = 6 * 3600 * 1000;
const EVENT = 'bambeh:countries';

/** Cameroon first, then two-letter codes only (FIX812: any country, not only the African ones), no doubles. */
export function cleanCodes(list: unknown): string[] {
  const out = [HOME];
  if (Array.isArray(list)) {
    for (const x of list) {
      const k = String(x == null ? '' : x).toUpperCase();
      if (/^[A-Z]{2}$/.test(k) && out.indexOf(k) < 0) out.push(k);
    }
  }
  return out;
}

function homeOnly(): OpenCountries {
  return { signup: [HOME], places: [HOME], checked: false };
}

/** What this phone last heard (Cameroon only when it never heard anything). */
export function readOpenCountries(): OpenCountries & { at: number } {
  try {
    const v = JSON.parse(window.localStorage.getItem(KEY) || 'null') as { signup?: unknown; places?: unknown; at?: unknown } | null;
    if (v && typeof v === 'object') {
      const at = Number(v.at) || 0;
      return { signup: cleanCodes(v.signup), places: cleanCodes(v.places), checked: Date.now() - at < MAX_AGE_MS, at };
    }
  } catch {
    /* nothing kept */
  }
  return { ...homeOnly(), at: 0 };
}

function keep(o: OpenCountries): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ signup: o.signup, places: o.places, at: Date.now() }));
  } catch {
    /* not kept: asked again next time */
  }
  try {
    window.dispatchEvent(new CustomEvent(EVENT));
  } catch {
    /* older browser: the next page asks again */
  }
}

let asking: Promise<OpenCountries> | null = null;

/** Asks the database (one question at a time); on any problem keeps what the phone already knew. */
export function fetchOpenCountries(): Promise<OpenCountries> {
  if (asking) return asking;
  asking = (async (): Promise<OpenCountries> => {
    try {
      const { data, error } = await supabase.rpc('bambeh_countries_open');
      const d = (data || null) as { ok?: unknown; signup?: unknown; places?: unknown } | null;
      if (!error && d && d.ok === true) {
        const o: OpenCountries = { signup: cleanCodes(d.signup), places: cleanCodes(d.places), checked: true };
        keep(o);
        return o;
      }
    } catch {
      /* no network */
    }
    const r = readOpenCountries();
    return { signup: r.signup, places: r.places, checked: r.checked };
  })();
  const p = asking;
  void p.then(() => { asking = null; }, () => { asking = null; });
  return p;
}

/** After a change in the Command Center: this phone forgets and asks again. */
export function forgetOpenCountries(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* nothing kept */
  }
  void fetchOpenCountries();
}

/**
 * The open countries for a page. fresh: ask the database even if the phone heard within 6 hours
 * (the sign-up page does, so a country switched on a minute ago is offered at once).
 */
export function useOpenCountries(fresh = false): OpenCountries {
  const [open, setOpen] = useState<OpenCountries>(() => {
    const r = readOpenCountries();
    return { signup: r.signup, places: r.places, checked: r.checked };
  });
  useEffect(() => {
    let live = true;
    const r = readOpenCountries();
    if (fresh || !r.checked) {
      void fetchOpenCountries().then((o) => { if (live) setOpen(o); });
    }
    const heard = () => {
      const x = readOpenCountries();
      if (live) setOpen({ signup: x.signup, places: x.places, checked: x.checked });
    };
    try { window.addEventListener(EVENT, heard); } catch { /* fine */ }
    return () => {
      live = false;
      try { window.removeEventListener(EVENT, heard); } catch { /* fine */ }
    };
  }, [fresh]);
  return open;
}
// BAMBEH_END_TOKEN__OPEN_COUNTRIES_FIX812__COMPLETE
