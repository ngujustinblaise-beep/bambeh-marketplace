// BAMBEH_DEPLOY_TOKEN__USEPAYWALL_FIX538_CLEAN
/**
 * src/hooks/usePaywall.ts - Bambeh Marketplace
 *
 * FIX538 - the wire between the switch and the wall.
 *
 * FIX535 put the switch in the database and FIX536 put it in the Command
 * Center, but nothing in the app ever asked the database whether the wall
 * should stand. Staff could flip North West to free, watch it turn green, and
 * not one user would notice. This is the missing half.
 *
 * WHY THE ANSWER IS CACHED AT MODULE LEVEL, NOT IN STATE
 *   A marketplace page can render fifteen FeatureGates at once. If each one
 *   fetched its own answer that is fifteen round trips on a 2G connection to
 *   learn the same fact. The answer is fetched ONCE per session and every
 *   gate reads the same promise.
 *
 * WHY IT FAILS CLOSED
 *   If the RPC errors, times out, or the user is offline, free stays FALSE and
 *   the wall stands. A network blip must never hand the whole app away for
 *   free. Revenue is protected by the default, not by hope.
 *
 * REGION IS BEST-EFFORT, AND THAT IS DELIBERATE
 *   The database can answer per region, but this app has no reliable place
 *   where a user's region lives - tierBridge.ts has no notion of one, and
 *   profiles.region may not be populated for everyone. So: if a region is
 *   found, it is used. If not, the GLOBAL answer is used, which is exactly
 *   what bambeh_paywall_state(null) returns. A user with no region set still
 *   gets free access when the global switch is on. Nothing breaks, and the
 *   per-region feature simply does not apply to them.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface PaywallState {
  /** true once the answer is known, either way */
  ready: boolean;
  /** true means the subscription wall is OFF for this user right now */
  free: boolean;
  /** 'global' | 'region' | 'paid' | 'no_setting' | 'error' */
  reason: string;
  /** sponsor wording, keyed by language code, or null when the wall stands */
  message: Record<string, string> | null;
  /** which region key answered, when the reason is 'region' */
  region: string | null;
}

const WALL_STANDS: PaywallState = {
  ready: true, free: false, reason: 'paid', message: null, region: null,
};

/** one fetch per session, shared by every gate on the page */
let inFlight: Promise<PaywallState> | null = null;

/** the signed-in user's region, if the app happens to know one */
async function findRegion(): Promise<string | null> {
  try {
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth?.user?.id;
    if (!uid) return null;
    const { data, error } = await supabase
      .from('profiles').select('region').eq('id', uid).maybeSingle();
    if (error) return null;                      // column may not exist - fine
    const r = (data as { region?: string | null } | null)?.region;
    return r && String(r).trim() ? String(r).trim() : null;
  } catch {
    return null;
  }
}

async function fetchState(): Promise<PaywallState> {
  try {
    const region = await findRegion();
    const { data, error } = await supabase.rpc('bambeh_paywall_state', {
      p_region: region,
    });
    if (error || !data) return { ...WALL_STANDS, reason: 'error' };

    const d = data as {
      free?: boolean; reason?: string;
      message?: Record<string, string> | null; region?: string | null;
    };
    return {
      ready: true,
      free: Boolean(d.free),
      reason: String(d.reason || 'paid'),
      message: d.free ? (d.message || null) : null,
      region: d.region || null,
    };
  } catch {
    // fail closed. An offline user does not get the app for free.
    return { ...WALL_STANDS, reason: 'error' };
  }
}

/** Force a re-read. Call after staff flip the switch, or on sign-in. */
export function resetPaywallCache(): void {
  inFlight = null;
}

export function loadPaywallState(): Promise<PaywallState> {
  if (!inFlight) inFlight = fetchState();
  return inFlight;
}

/**
 * Read the paywall state. Starts as { ready: false, free: false } so nothing
 * flashes open before the answer arrives - a gate that briefly shows premium
 * content and then snatches it back is worse than a slow gate.
 */
export function usePaywall(): PaywallState {
  const [state, setState] = useState<PaywallState>({
    ready: false, free: false, reason: 'loading', message: null, region: null,
  });

  useEffect(() => {
    let alive = true;
    void loadPaywallState().then((s: PaywallState) => { if (alive) setState(s); });
    return () => { alive = false; };
  }, []);

  return state;
}

/** Pick the sponsor line for a language, falling back sensibly. */
export function paywallMessage(
  message: Record<string, string> | null,
  lang: string | undefined,
): string | null {
  if (!message) return null;
  const c = String(lang || 'en').toLowerCase();
  const key = c === 'pidgin' ? 'pcm'
    : (c === 'ful' || c === 'fulfulde' || c === 'fula') ? 'ff'
    : c.startsWith('fr') ? 'fr'
    : c.startsWith('ar') ? 'ar'
    : c;
  return message[key] || message.en || message.fr || null;
}

export default usePaywall;
// BAMBEH_END_TOKEN__USEPAYWALL_FIX538__COMPLETE
