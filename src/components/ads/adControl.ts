// BAMBEH_DEPLOY_TOKEN__AD_CONTROL_FIX824_CLEAN
/**
 * src/components/ads/adControl.ts - FIX824 (new)
 *
 * WHAT RUNS IN FEATURED ADS, read once and shared. Big, 18 Oct 2026: "we must have a section in the admin page that
 * controls the featured ads. we can switch off all free ads running now on the feature ad as well as corporate ads and
 * choose which ads should run based on payments."
 *
 * Command Center > Featured ads (FIX827) decides; the database (FIX823, bambeh_featured_now) answers every phone with:
 *   mode         'all'      - everything posted, as before, with the chosen (paid) ones first
 *                'selected' - only the adverts and items chosen in the Command Center
 *                'off'      - Featured Ads hidden everywhere
 *   corporate_on - the Corporate adverts strip on Home
 *   popup_on     - the full-screen advert for free users (AdInterstitial)
 *   items        - the chosen adverts and items running now
 *   popup        - the company adverts for the full-screen spot
 * Read at most every 2 minutes per phone. If the database cannot be reached (or FIX823 has not been run yet), the app
 * behaves exactly as before: everything posted, corporate strip on, pop-up on - and the last good answer is reused.
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export type AdMode = 'all' | 'selected' | 'off';
export type AdKind = 'advert' | 'listing' | 'farm' | 'exchange';

export interface AdItem {
  key: string;
  kind: AdKind;
  id: string;
  /** 'advert' | the listing type ('marketplace', 'job', 'service', 'rental', 'vehicle') | 'farm' | 'exchange' */
  type: string;
  title: string;
  title_fr?: string | null;
  description?: string | null;
  description_fr?: string | null;
  image: string | null;
  price: number | null;
  unit?: string | null;
  location: string | null;
  company?: string | null;
  link?: string | null;
  until?: string | null;
}

export interface PopupAd {
  id: string;
  title: string;
  title_fr?: string | null;
  description: string | null;
  description_fr?: string | null;
  image_url: string | null;
  link_url: string | null;
  company_name: string | null;
}

export interface AdNow {
  /** false: the answer did not come from the database (the app then behaves as before) */
  ok: boolean;
  mode: AdMode;
  corporate_on: boolean;
  popup_on: boolean;
  items: AdItem[];
  popup: PopupAd[];
}

export const AD_DEFAULT: AdNow = { ok: false, mode: 'all', corporate_on: true, popup_on: true, items: [], popup: [] };

const KEEP_MS = 120000;
const STORE_KEY = 'bambeh_ad_now_v1';
let cache: { at: number; data: AdNow } | null = null;
let inflight: Promise<AdNow> | null = null;
const listeners = new Set<(a: AdNow) => void>();

function str(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v : null;
}
function num(v: unknown): number | null {
  const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
}

/** The database answer, checked field by field: a malformed row is dropped, never shown half-broken. */
export function cleanAdNow(raw: unknown): AdNow | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (r.ok !== true) return null;
  const mode: AdMode = r.mode === 'selected' || r.mode === 'off' ? r.mode : 'all';
  const items: AdItem[] = [];
  for (const x of Array.isArray(r.items) ? r.items : []) {
    if (!x || typeof x !== 'object') continue;
    const o = x as Record<string, unknown>;
    const kind = o.kind;
    const id = str(o.id);
    const title = str(o.title);
    if ((kind !== 'advert' && kind !== 'listing' && kind !== 'farm' && kind !== 'exchange') || !id || !title) continue;
    if (kind === 'advert' && !str(o.image)) continue;
    items.push({
      key: kind + ':' + id, kind, id, type: str(o.type) || kind, title,
      title_fr: str(o.title_fr), description: str(o.description), description_fr: str(o.description_fr),
      image: str(o.image), price: num(o.price), unit: str(o.unit), location: str(o.location),
      company: str(o.company), link: str(o.link), until: str(o.until),
    });
  }
  const popup: PopupAd[] = [];
  for (const x of Array.isArray(r.popup) ? r.popup : []) {
    if (!x || typeof x !== 'object') continue;
    const o = x as Record<string, unknown>;
    const id = str(o.id);
    const title = str(o.title);
    if (!id || !title || !str(o.image_url)) continue;
    popup.push({
      id, title, title_fr: str(o.title_fr), description: str(o.description), description_fr: str(o.description_fr),
      image_url: str(o.image_url), link_url: str(o.link_url), company_name: str(o.company_name),
    });
  }
  return { ok: true, mode, corporate_on: r.corporate_on !== false, popup_on: r.popup_on !== false, items, popup };
}

function remembered(): AdNow | null {
  try {
    const s = window.sessionStorage.getItem(STORE_KEY);
    return s ? cleanAdNow(JSON.parse(s)) : null;
  } catch {
    return null;
  }
}

/** What runs in Featured Ads now. Never throws; never waits more than one request. */
export function fetchAdNow(force = false): Promise<AdNow> {
  const now = Date.now();
  if (!force && cache && now - cache.at < KEEP_MS) return Promise.resolve(cache.data);
  if (inflight) return inflight;
  inflight = (async () => {
    let data: AdNow | null = null;
    try {
      const { data: raw, error } = await supabase.rpc('bambeh_featured_now');
      if (!error) data = cleanAdNow(raw);
      if (data) {
        try { window.sessionStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch { /* storage blocked */ }
      }
    } catch {
      data = null;
    }
    const out = data || (cache && cache.data.ok ? cache.data : null) || remembered() || AD_DEFAULT;
    cache = { at: Date.now(), data: out };
    inflight = null;
    listeners.forEach((fn) => { try { fn(out); } catch { /* a listener failing never stops the others */ } });
    return out;
  })();
  return inflight;
}

/** For tests and for the Command Center after a change: forget the last answer. */
export function forgetAdNow(): void {
  cache = null;
}

/** React: what runs in Featured Ads now. `ready` turns true once the first answer (or the fallback) is in. */
export function useAdNow(): { now: AdNow; ready: boolean } {
  // the last answer this visit had (sessionStorage) is the best first guess: a strip switched off stays off on a reload
  const [state, setState] = useState<{ now: AdNow; ready: boolean }>(() =>
    cache ? { now: cache.data, ready: true } : { now: remembered() || AD_DEFAULT, ready: false });
  useEffect(() => {
    let alive = true;
    const fn = (a: AdNow) => { if (alive) setState({ now: a, ready: true }); };
    listeners.add(fn);
    void fetchAdNow().then(fn);
    return () => { alive = false; listeners.delete(fn); };
  }, []);
  return state;
}

/** Which section strip an item belongs to (the FeaturedAdsStrip `category` names). Adverts belong everywhere. */
export function itemInCategory(item: AdItem, category?: string): boolean {
  if (!category || item.kind === 'advert') return true;
  const map: Record<string, string[]> = {
    marketplace: ['marketplace'], jobs: ['job'], services: ['service'], rentals: ['rental'], vehicles: ['vehicle'],
    'farm-fresh': ['farm'], exchange: ['exchange'],
  };
  const want = map[category];
  return !want || want.indexOf(item.type) >= 0;
}

/** Count an advert seen or tapped once per phone session - the numbers an advertiser is shown. */
export function countAd(kind: 'view' | 'click', id: string): void {
  const key = 'bambeh_ad_' + kind + '_' + id;
  try {
    if (window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, '1');
  } catch { /* storage blocked: count anyway */ }
  try {
    void Promise.resolve(supabase.rpc(kind === 'view' ? 'bump_ad_view' : 'bump_ad_click', { ad_id: id })).catch(() => undefined);
  } catch { /* a count failing never disturbs the app */ }
}
// BAMBEH_END_TOKEN__AD_CONTROL_FIX824__COMPLETE
