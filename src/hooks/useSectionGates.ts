// BAMBEH_DEPLOY_TOKEN__USE_SECTION_GATES_FIX678_CLEAN
/**
 * src/hooks/useSectionGates.ts - FIX678 (replaces FIX672)
 *
 * Which parts of Bambeh are for members only (Command Center > Members-only
 * sections, FIX671 + FIX677), and whether the signed-in person has a live advert.
 *
 * FIX678
 *   - EVERY MODULE HAS A SWITCH: the detail pages, chat, Bambeh AI, bulk buying,
 *     flash deals, community, compare, quiz, Zerm coins, corporate stores and the
 *     free public services (Big, 9 Oct 2026).
 *   - CHAT FOR BUYERS AND SELLERS SEPARATELY. "chat" decides for people without a
 *     live advert (buyers), "chat_sellers" for people with one (sellers). The rule
 *     lives in chatIsMembersOnly(), so the chat page and every "Message" button
 *     answer the same way.
 *   - GAS & FOOD DETAILS START MEMBERS ONLY (Big: people pay for convenience).
 *   - THE PHONE REMEMBERS THE LAST ANSWER. The next time Bambeh opens, gates start
 *     from the real switches instead of the built-in defaults - no flash of a page
 *     staff have made members-only, no wait on one they have made free. The fresh
 *     answer from the database still decides, a moment later.
 *
 * Asked ONCE per signed-in person per app open; every gate on every page shares the
 * answer. If the database cannot be reached, the remembered switches (or the
 * built-in defaults) apply, so a members-only section stays members-only.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export type SectionKey =
  | 'marketplace' | 'farm_fresh' | 'food_gas' | 'rentals' | 'vehicles'
  | 'services' | 'exchange' | 'jobs' | 'chat' | 'chat_sellers'
  | 'ai' | 'group_buying' | 'flash_deals' | 'community' | 'compare'
  | 'quiz' | 'coins' | 'corporate' | 'free_services';

export const SECTION_KEYS: readonly SectionKey[] = [
  'marketplace', 'farm_fresh', 'food_gas', 'rentals', 'vehicles',
  'services', 'exchange', 'jobs', 'chat', 'chat_sellers',
  'ai', 'group_buying', 'flash_deals', 'community', 'compare',
  'quiz', 'coins', 'corporate', 'free_services',
];

/** true = members only. The same starting switches as FIX671 + FIX677. */
export const SECTION_DEFAULTS: Readonly<Record<SectionKey, boolean>> = {
  marketplace: false,
  farm_fresh: false,
  food_gas: true,
  rentals: true,
  vehicles: true,
  services: true,
  exchange: true,
  jobs: false,
  chat: true,
  chat_sellers: false,
  ai: true,
  group_buying: true,
  flash_deals: true,
  community: true,
  compare: true,
  quiz: true,
  coins: false,
  corporate: false,
  free_services: false,
};

/**
 * Does THIS person need a subscription to chat?
 * Sellers (anyone with a live advert) follow "chat_sellers"; everyone else follows "chat".
 */
export function chatIsMembersOnly(gates: Readonly<Record<SectionKey, boolean>>, advertiser: boolean): boolean {
  return advertiser ? gates.chat_sellers === true : gates.chat === true;
}

/** Is this section members-only for this person? (chat depends on whether they sell) */
export function sectionIsMembersOnly(section: SectionKey, gates: Readonly<Record<SectionKey, boolean>>, advertiser: boolean): boolean {
  if (section === 'chat' || section === 'chat_sellers') return chatIsMembersOnly(gates, advertiser);
  return gates[section] === true;
}

export interface SectionGatesState {
  /** the fresh answer has arrived (from the database, or the fallback after a failure) */
  ready: boolean;
  fromDatabase: boolean;
  /** the best answer known so far: fresh, else remembered, else the defaults */
  gates: Record<SectionKey, boolean>;
  /** this account has a live advert, Farm Fresh produce or exchange item */
  advertiser: boolean;
}

const MEMORY_KEY = 'bambeh_section_gates_v2';

type Remembered = { uid: string | null; gates: Record<SectionKey, boolean>; advertiser: boolean };

function cleanGates(raw: unknown, base: Readonly<Record<SectionKey, boolean>>): Record<SectionKey, boolean> {
  const gates = { ...base } as Record<SectionKey, boolean>;
  if (raw && typeof raw === 'object') {
    const r = raw as Record<string, unknown>;
    for (const k of SECTION_KEYS) {
      if (typeof r[k] === 'boolean') gates[k] = r[k] as boolean;
    }
  }
  return gates;
}

function recall(): Remembered | null {
  try {
    const text = typeof localStorage === 'undefined' ? null : localStorage.getItem(MEMORY_KEY);
    if (!text) return null;
    const v = JSON.parse(text) as { uid?: unknown; gates?: unknown; advertiser?: unknown };
    return {
      uid: typeof v.uid === 'string' ? v.uid : null,
      gates: cleanGates(v.gates, SECTION_DEFAULTS),
      advertiser: v.advertiser === true,
    };
  } catch {
    return null;
  }
}

function remember(uid: string | null, state: SectionGatesState): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(MEMORY_KEY, JSON.stringify({ uid, gates: state.gates, advertiser: state.advertiser }));
  } catch {
    // private window or full storage: the app still works from the database answer
  }
}

/** Where a gate starts before the fresh answer arrives. */
function startFor(uid: string | null): SectionGatesState {
  const r = recall();
  return {
    ready: false,
    fromDatabase: false,
    gates: r ? { ...r.gates } : { ...SECTION_DEFAULTS },
    advertiser: !!(r && uid !== null && r.uid === uid && r.advertiser),
  };
}

let cache: { uid: string | null; promise: Promise<SectionGatesState> } | null = null;
let resolved: { uid: string | null; state: SectionGatesState } | null = null;

async function fetchGates(uid: string | null): Promise<SectionGatesState> {
  const start = startFor(uid);
  const fallback: SectionGatesState = { ready: true, fromDatabase: false, gates: start.gates, advertiser: start.advertiser };
  try {
    const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 8000));
    const res = await Promise.race([Promise.resolve(supabase.rpc('bambeh_section_gates')), timeout]);
    if (!res || res.error || !res.data || res.data.ok === false) return fallback;
    return {
      ready: true,
      fromDatabase: true,
      gates: cleanGates(res.data.gates, SECTION_DEFAULTS),
      advertiser: res.data.advertiser === true,
    };
  } catch {
    return fallback;
  }
}

/** One shared question per signed-in person. */
export function loadSectionGates(uid: string | null): Promise<SectionGatesState> {
  if (cache && cache.uid === uid) return cache.promise;
  const promise = fetchGates(uid);
  cache = { uid, promise };
  void promise.then((s) => {
    if (s.fromDatabase) {
      resolved = { uid, state: s };
      remember(uid, s);
    } else if (cache && cache.promise === promise) {
      cache = null;
    }
  });
  return promise;
}

/** After staff change a switch: ask the database again. */
export function resetSectionGates(): void {
  cache = null;
  resolved = null;
}

export function useSectionGates(uid: string | null): SectionGatesState {
  const [state, setState] = useState<SectionGatesState>(() =>
    resolved && resolved.uid === uid ? resolved.state : startFor(uid));
  useEffect(() => {
    let alive = true;
    if (!(resolved && resolved.uid === uid)) setState(startFor(uid));
    void loadSectionGates(uid).then((s) => {
      if (alive) setState(s);
    });
    return () => {
      alive = false;
    };
  }, [uid]);
  return state;
}
// BAMBEH_END_TOKEN__USE_SECTION_GATES_FIX678__COMPLETE
