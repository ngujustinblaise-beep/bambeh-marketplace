// BAMBEH_DEPLOY_TOKEN__AGENT_SIGNAL_FIX943_CLEAN
/**
 * src/features/agents/agentSignal.ts - FIX943 (new)
 *
 * THE AGENT'S MENU KNOWS WHEN BAMBEH HAS ANSWERED. Big, 1 Nov 2026: "the response from bambeh should signal in the
 * menu or marketing agent to signal to the agent that he has a message".
 *
 *  - useAgentSignal(userId): how many of this agent's daily reports carry an answer from Bambeh they have not opened
 *    yet (bambeh_my_agent_signal, FIX942). The header shows a red dot on the menu button and the number beside
 *    "Marketing agent" in the menu.
 *  - It asks when the member is known, every three minutes, when the app comes back to the front, and at once when
 *    the agent page says the answer was opened (pingAgentSignal, sent by AgentReport). One small question each time.
 *  - A member who is not an agent is asked once per session and never again (most members are not agents).
 *  - A failed question never clears the number and never shows an error: the menu is not the place for that.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

const EVENT = 'bambeh:agent-signal';
const NOT_AGENT_KEY = 'bambeh_not_agent_v1';
const EVERY_MS = 3 * 60 * 1000;

/** The agent page calls this after the agent opened Bambeh's answer, so the menu number goes at once. */
export function pingAgentSignal(): void {
  try { window.dispatchEvent(new Event(EVENT)); } catch { /* an old browser - the next check clears it */ }
}

function knownNotAgent(uid: string): boolean {
  try { return window.sessionStorage.getItem(NOT_AGENT_KEY) === uid; } catch { return false; }
}
function rememberNotAgent(uid: string): void {
  try { window.sessionStorage.setItem(NOT_AGENT_KEY, uid); } catch { /* not kept - asked again next time */ }
}

/** How many answers from Bambeh this agent has not opened yet (0 for everyone else). */
export function useAgentSignal(userId: string | null | undefined): number {
  const [unseen, setUnseen] = useState(0);
  const uidRef = useRef<string | null>(null);
  const busy = useRef(false);

  const ask = useCallback(async () => {
    const uid = uidRef.current;
    if (!uid || busy.current || knownNotAgent(uid)) return;
    busy.current = true;
    try {
      const r = await supabase.rpc('bambeh_my_agent_signal');
      if (uidRef.current !== uid) return;   // signed out or another member meanwhile
      const d = r && !r.error ? (r.data as { ok?: boolean; agent?: boolean; unseen?: number } | null) : null;
      if (!d || !d.ok) return;               // keep what we had
      if (d.agent === false) { rememberNotAgent(uid); setUnseen(0); return; }
      const n = Number(d.unseen);
      setUnseen(Number.isFinite(n) && n > 0 ? Math.floor(n) : 0);
    } catch {
      /* the menu never shows an error; the next check tries again */
    } finally {
      busy.current = false;
    }
  }, []);

  useEffect(() => {
    uidRef.current = userId || null;
    setUnseen(0);
    if (!userId) return;
    void ask();
    const id = window.setInterval(() => { void ask(); }, EVERY_MS);
    const onFocus = () => { void ask(); };
    const onVisible = () => { if (document.visibilityState === 'visible') void ask(); };
    window.addEventListener('focus', onFocus);
    window.addEventListener(EVENT, onFocus);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(id);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener(EVENT, onFocus);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [userId, ask]);

  return unseen;
}
// BAMBEH_END_TOKEN__AGENT_SIGNAL_FIX943__COMPLETE
