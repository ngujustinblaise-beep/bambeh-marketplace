// BAMBEH_DEPLOY_TOKEN__AGENTCAPTURE_FIX508_CLEAN
/**
 * src/features/agents/AgentCapture.tsx - Bambeh Marketplace
 * FILE LOCATION: src/features/agents/AgentCapture.tsx
 *
 * FIX508 - HOW AN AGENT GETS CREDITED, RELIABLY.
 * ------------------------------------------------------------------
 * Renders nothing. Mounted once, at the top of the app.
 *
 * TWO STEPS, DELIBERATELY SEPARATED.
 *   1. Somebody opens a link carrying ?agent=CODE. We write that code to
 *      localStorage and forget about it. No account exists yet.
 *   2. Later - could be a minute, could be after they close the app and come
 *      back - a session appears. We hand the code to the database, which
 *      decides whether it counts.
 *
 * THE DATABASE DECIDES, NOT THIS FILE.
 *   claim_agent_code() refuses if the account already belongs to an agent, if
 *   the code is unknown or disabled, or if the account is older than a day. A
 *   browser cannot be trusted to enforce any of that, so it does not try.
 *
 * WHY IT SURVIVES A CLOSED APP.
 *   An agent shows somebody the app in a market. That person signs up at home
 *   two hours later. If the code only lived in memory, the agent would get
 *   nothing and would rightly stop trusting the count.
 *
 * IT NEVER BLOCKS ANYTHING. Every failure is swallowed. A missed attribution
 * costs a number on a dashboard; a thrown error costs somebody their signup.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const CODE_KEY = 'bambeh:agent:code';
const DONE_KEY = 'bambeh:agent:claimed';

/** Reads ?agent= (or ?ref=) from the search string AND from inside the hash,
 *  because this app uses a HashRouter and the query can land in either. */
function codeFromUrl(): string | null {
  try {
    const direct = new URLSearchParams(window.location.search).get('agent')
      ?? new URLSearchParams(window.location.search).get('ref');
    if (direct) return direct.trim().toUpperCase();

    const hash = window.location.hash || '';
    const q = hash.indexOf('?');
    if (q === -1) return null;
    const inHash = new URLSearchParams(hash.slice(q + 1));
    const v = inHash.get('agent') ?? inHash.get('ref');
    return v ? v.trim().toUpperCase() : null;
  } catch {
    return null;
  }
}

export default function AgentCapture() {
  useEffect(() => {
    // Step 1 - remember the code the moment it appears in the URL.
    const fromUrl = codeFromUrl();
    if (fromUrl) {
      try { window.localStorage.setItem(CODE_KEY, fromUrl); } catch { /* private mode */ }
    }

    let alive = true;

    const tryClaim = async () => {
      let code: string | null = null;
      let already: string | null = null;
      try {
        code = window.localStorage.getItem(CODE_KEY);
        already = window.localStorage.getItem(DONE_KEY);
      } catch { return; }
      if (!code || already === code) return;

      try {
        const { data } = await supabase.auth.getSession();
        if (!data?.session || !alive) return;

        const { error } = await supabase.rpc('claim_agent_code', { p_code: code });
        // Mark done either way. A refused claim will not become valid by
        // retrying it on every page load.
        if (!error) {
          try { window.localStorage.setItem(DONE_KEY, code); } catch { /* ignore */ }
        }
      } catch {
        /* silent on purpose - see the header */
      }
    };

    void tryClaim();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') void tryClaim();
    });

    return () => {
      alive = false;
      try { sub?.subscription?.unsubscribe(); } catch { /* ignore */ }
    };
  }, []);

  return null;
}
// BAMBEH_END_TOKEN__AGENTCAPTURE_FIX508__COMPLETE
