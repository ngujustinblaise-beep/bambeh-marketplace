// BAMBEH_DEPLOY_TOKEN__USE_SECTION_GATES_FIX672_CLEAN
/**
 * src/hooks/useSectionGates.ts - FIX672
 *
 * Which sections are for members only (Command Center > Members-only sections,
 * FIX671), and whether the signed-in person has an active advert - people with an
 * advert can always open chat and answer their messages.
 *
 * Asked ONCE per signed-in person per app open; every gate on every page shares the
 * same answer (a marketplace page can hold many gates - one question, not twenty).
 * If the database cannot be reached, the built-in defaults below apply - the same
 * as FIX671's starting switches - so a members-only section stays members-only. An
 * answer that did not come from the database is not kept: the next gate asks again.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export type SectionKey =
  | 'marketplace' | 'farm_fresh' | 'food_gas' | 'rentals' | 'vehicles'
  | 'services' | 'exchange' | 'jobs' | 'chat' | 'chat_sellers';

export const SECTION_KEYS: readonly SectionKey[] = [
  'marketplace', 'farm_fresh', 'food_gas', 'rentals', 'vehicles',
  'services', 'exchange', 'jobs', 'chat', 'chat_sellers',
];

/** true = members only. Same as FIX671's starting switches (chat_sellers false = sellers may always answer). */
export const SECTION_DEFAULTS: Readonly<Record<SectionKey, boolean>> = {
  marketplace: false,
  farm_fresh: false,
  food_gas: false,
  jobs: false,
  rentals: true,
  vehicles: true,
  services: true,
  exchange: true,
  chat: true,
  chat_sellers: false,
};

export interface SectionGatesState {
  /** the answer has arrived (from the database, or the defaults after a failure) */
  ready: boolean;
  fromDatabase: boolean;
  gates: Record<SectionKey, boolean>;
  /** this account has an active advert, so it may always answer chat messages */
  advertiser: boolean;
}

const START: SectionGatesState = { ready: false, fromDatabase: false, gates: { ...SECTION_DEFAULTS }, advertiser: false };

let cache: { uid: string | null; promise: Promise<SectionGatesState> } | null = null;
let resolved: { uid: string | null; state: SectionGatesState } | null = null;

async function fetchGates(): Promise<SectionGatesState> {
  const fallback: SectionGatesState = { ready: true, fromDatabase: false, gates: { ...SECTION_DEFAULTS }, advertiser: false };
  try {
    const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 8000));
    const res = await Promise.race([Promise.resolve(supabase.rpc('bambeh_section_gates')), timeout]);
    if (!res || res.error || !res.data || res.data.ok === false) return fallback;
    const raw = (res.data.gates || {}) as Record<string, unknown>;
    const gates = { ...SECTION_DEFAULTS } as Record<SectionKey, boolean>;
    for (const k of SECTION_KEYS) {
      if (typeof raw[k] === 'boolean') gates[k] = raw[k] as boolean;
    }
    return { ready: true, fromDatabase: true, gates, advertiser: res.data.advertiser === true };
  } catch {
    return fallback;
  }
}

/** One shared question per signed-in person. */
export function loadSectionGates(uid: string | null): Promise<SectionGatesState> {
  if (cache && cache.uid === uid) return cache.promise;
  const promise = fetchGates();
  cache = { uid, promise };
  void promise.then((s) => {
    if (s.fromDatabase) {
      resolved = { uid, state: s };
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
    resolved && resolved.uid === uid ? resolved.state : START);
  useEffect(() => {
    let alive = true;
    if (!(resolved && resolved.uid === uid)) setState(START);
    void loadSectionGates(uid).then((s) => {
      if (alive) setState(s);
    });
    return () => {
      alive = false;
    };
  }, [uid]);
  return state;
}
// BAMBEH_END_TOKEN__USE_SECTION_GATES_FIX672__COMPLETE
