// BAMBEH_DEPLOY_TOKEN__WOMENS_HEALTH_UI_FIX719_CLEAN
/**
 * src/features/womenshealth/whUi.tsx - FIX719
 *
 * Small pieces every women's health page shares (Big, 11 Oct 2026 evening):
 *
 *   QUICK EXIT - one tap leaves the page at once, for a woman who must hide what she is reading.
 *     On the website the tab goes to google.com (the page she was on is replaced in the history;
 *     a browser cannot erase the pages before it, so closing the tab is still safest); in the
 *     installed Android app it goes to the Marketplace. The button sits at the bottom left of
 *     every women's health page, away from the chat button.
 *
 *   SAVED ON THIS PHONE - so the pages still help without data. The last lists, the places and
 *     screening days that were opened, and the guide and quiz switches are kept on the phone
 *     (localStorage, a few dozen kilobytes at most) and shown with the date they were saved when
 *     there is no connection. Only public information is kept: never "remind me", never who added
 *     what, never anything about the woman. In the website a page opened for the first time with
 *     no connection cannot load at all; in the Android app the pages themselves are on the phone.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useNavigate } from 'react-router-dom';
import { WifiOff, X } from 'lucide-react';
import type { WhT } from './whText';
import type { WhDay, WhPlace } from './whApi';

/** Inside the installed Android app (Capacitor), not a browser. */
export function inInstalledApp(): boolean {
  try {
    const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
    return !!(cap && typeof cap.isNativePlatform === 'function' && cap.isNativePlatform());
  } catch {
    return false;
  }
}

/** Where Quick exit goes on the website. */
export const QUICK_EXIT_URL = 'https://www.google.com/';

export function QuickExit({ t }: { t: WhT }) {
  const navigate = useNavigate();
  const leave = () => {
    if (inInstalledApp()) {
      navigate('/marketplace', { replace: true });
      return;
    }
    try {
      window.location.replace(QUICK_EXIT_URL);
    } catch {
      navigate('/marketplace', { replace: true });
    }
  };
  return (
    <button type="button" onClick={leave} data-quick-exit="1" title={t('quickExitHelp')} aria-label={t('quickExitHelp')}
            className="fixed bottom-24 left-3 z-40 inline-flex items-center gap-1.5 rounded-full bg-gray-900/90 px-3.5 py-2 text-sm font-bold text-white shadow-lg ring-2 ring-white hover:bg-black">
      <X className="h-4 w-4" aria-hidden="true" />{t('quickExit')}
    </button>
  );
}

// ------------------------------------------------------------------ saved on this phone
const LISTS_KEY = 'bambeh_wh_saved_lists';
const ITEMS_KEY = 'bambeh_wh_saved_items';
const SWITCH_KEY = 'bambeh_wh_saved_switches';

interface Saved<T> { k: string; at: string; v: T }

function readAll<T>(key: string): Array<Saved<T>> {
  try {
    const raw = window.localStorage.getItem(key);
    const v = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(v) ? (v as Array<Saved<T>>).filter((x) => x && typeof x.k === 'string' && typeof x.at === 'string') : [];
  } catch {
    return [];
  }
}

function writeAll<T>(key: string, all: Array<Saved<T>>): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(all));
  } catch {
    // the phone is full or storage is blocked: keep the newest half, or nothing
    try { window.localStorage.setItem(key, JSON.stringify(all.slice(0, Math.floor(all.length / 2)))); } catch { /* not kept */ }
  }
}

function put<T>(key: string, k: string, v: T, max: number): void {
  const all = readAll<T>(key).filter((x) => x.k !== k);
  all.unshift({ k, at: new Date().toISOString(), v });
  writeAll(key, all.slice(0, max));
}

function get<T>(key: string, k: string): { at: string; v: T } | null {
  const hit = readAll<T>(key).find((x) => x.k === k);
  return hit ? { at: hit.at, v: hit.v } : null;
}

/** Only what anyone may see on the list: no "remind me", nothing about who added it. */
export function publicPlace(p: WhPlace): WhPlace {
  return {
    id: p.id, name: p.name, kind: p.kind, services: p.services, region: p.region, town: p.town, area: p.area,
    landmark: p.landmark, phone: p.phone, phone_checking: p.phone_checking, open_24h: p.open_24h, open_days: p.open_days,
    opens_at: p.opens_at, closes_at: p.closes_at, accepts_csu: p.accepts_csu, women_doctors: p.women_doctors,
    price_note: p.price_note, description: p.description, updated_at: p.updated_at,
    days: Array.isArray(p.days) ? p.days.map(publicDay) : undefined,
  };
}

export function publicDay(d: WhDay): WhDay {
  return {
    id: d.id, title: d.title, topics: d.topics, organiser: d.organiser, region: d.region, town: d.town, venue: d.venue,
    landmark: d.landmark, starts_on: d.starts_on, ends_on: d.ends_on, opens_at: d.opens_at, closes_at: d.closes_at,
    free_what: d.free_what, paid_after: d.paid_after, phone: d.phone, phone_checking: d.phone_checking,
    place_id: d.place_id, place_name: d.place_name,
  };
}

export interface SavedList {
  total: number;
  places?: WhPlace[];
  days?: WhDay[];
  towns?: Array<{ town: string; region: string; n: number }>;
}

/** The first page of a list, for the same filters (the last 8 lists). */
export function saveList(k: string, v: SavedList): void {
  put<SavedList>(LISTS_KEY, k, {
    total: v.total,
    places: v.places ? v.places.map(publicPlace) : undefined,
    days: v.days ? v.days.map(publicDay) : undefined,
    towns: v.towns,
  }, 8);
}
export function loadList(k: string): { at: string; v: SavedList } | null {
  return get<SavedList>(LISTS_KEY, k);
}

/** One place or one screening day that was opened (the last 40). */
export function saveItem(kind: 'place' | 'day', item: WhPlace | WhDay): void {
  const v = kind === 'place' ? publicPlace(item as WhPlace) : publicDay(item as WhDay);
  put<WhPlace | WhDay>(ITEMS_KEY, kind + ':' + item.id, v, 40);
}
export function loadItem<T extends WhPlace | WhDay>(kind: 'place' | 'day', id: string): { at: string; v: T } | null {
  const hit = get<WhPlace | WhDay>(ITEMS_KEY, kind + ':' + id);
  return hit ? { at: hit.at, v: hit.v as T } : null;
}

/** The guide and quiz switches as last seen (so the guide still opens with no connection). */
export interface SavedSwitches {
  on: boolean;
  langs: string[];
  reviewer_name?: string;
  reviewer_role?: string;
  reviewed_on?: string | null;
  quiz_on: boolean;
  quiz_langs: string[];
  quiz_reviewer_name?: string;
  quiz_reviewer_role?: string;
  quiz_reviewed_on?: string | null;
}
export function saveSwitches(v: SavedSwitches): void {
  put<SavedSwitches>(SWITCH_KEY, 'guide', {
    on: v.on, langs: v.langs, reviewer_name: v.reviewer_name, reviewer_role: v.reviewer_role, reviewed_on: v.reviewed_on,
    quiz_on: v.quiz_on, quiz_langs: v.quiz_langs, quiz_reviewer_name: v.quiz_reviewer_name,
    quiz_reviewer_role: v.quiz_reviewer_role, quiz_reviewed_on: v.quiz_reviewed_on,
  }, 1);
}
export function loadSwitches(): { at: string; v: SavedSwitches } | null {
  return get<SavedSwitches>(SWITCH_KEY, 'guide');
}

/** "No connection - saved on this phone on ..." */
export function OfflineNote({ text }: { text: string }) {
  return (
    <p className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900" role="status" data-offline="1">
      <WifiOff className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
      <span>{text}</span>
    </p>
  );
}
// BAMBEH_END_TOKEN__WOMENS_HEALTH_UI_FIX719__COMPLETE
