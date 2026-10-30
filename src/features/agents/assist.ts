// BAMBEH_DEPLOY_TOKEN__AGENT_ASSIST_LIB_FIX932_CLEAN
/**
 * src/features/agents/assist.ts - FIX932 (new)
 *
 * The pieces behind "Sign up a client on your phone" (AgentAssist, FIX933). Big, 29 Oct 2026: "How can we
 * create an account for a client using vendors phone and vendors code without stressing the user ... a temporary
 * password ... the user lets them snap for users who don't want to share their phone with marketing agents".
 *
 *  - assistSignUp: the client's account is made through a SECOND, throwaway connection to Bambeh. The agent's own
 *    session on this phone is never touched, nothing is saved on the phone, and the connection is closed at once.
 *  - The account starts with a long random password (makeSecret) that only this screen knows and nobody ever sees.
 *    The database (bambeh_agent_assist_issue, FIX931) checks this phone made the account, then replaces it with a
 *    temporary password made by Bambeh: shown once, changed at the first sign-in, dead after 48 hours unused.
 *  - finishLink: what the QR code holds. The client scans it with their own phone and lands on Forgot password >
 *    Temporary password with the number and the temporary password already filled in: two boxes to type their
 *    own password, and they are in.
 *  - Links for other people always use the real address (app.bambeh.com), never the phone's https://localhost
 *    that the Android app runs on.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_APP_URL } from '@/config/storeMode';
import { prettyPhone } from '@/lib/africa/countries';

/** The screen that showed the one box to the client (kept with the account, FIX766). */
export const ASSIST_CONSENT_VERSION = 'FIX933';

const LOWER = 'abcdefghijkmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const DIGIT = '23456789';
const SYMBOL = '!#$%&*+-=?@^_';

function randomInts(n: number): number[] {
  const out: number[] = [];
  const c = (globalThis as { crypto?: { getRandomValues?: (a: Uint32Array) => Uint32Array } }).crypto;
  if (c && typeof c.getRandomValues === 'function') {
    const a = new Uint32Array(n);
    c.getRandomValues(a);
    for (let i = 0; i < n; i++) out.push(a[i]);
    return out;
  }
  // no crypto here: never used on a phone (every browser Bambeh runs on has it)
  for (let i = 0; i < n; i++) out.push(Math.floor(Math.random() * 4294967296));
  return out;
}

/**
 * 32 random characters with small and capital letters, digits and symbols: passes any password rule the
 * project may set, and nobody will ever type it - it lives only until Bambeh replaces it a second later.
 */
export function makeSecret(): string {
  const all = LOWER + UPPER + DIGIT + SYMBOL;
  const r = randomInts(40);
  const chars: string[] = [LOWER[r[0] % LOWER.length], UPPER[r[1] % UPPER.length], DIGIT[r[2] % DIGIT.length], SYMBOL[r[3] % SYMBOL.length]];
  for (let i = 4; i < 32; i++) chars.push(all[r[i] % all.length]);
  // shuffle so the four kinds are not always first
  for (let i = chars.length - 1; i > 0; i--) {
    const j = r[(i % 8) + 32] % (i + 1);
    const x = chars[i];
    chars[i] = chars[j];
    chars[j] = x;
  }
  return chars.join('');
}

/** What the QR code holds: Forgot password > Temporary password, the number and the temporary password filled in. */
export function finishLink(digits: string, temp: string): string {
  const d = String(digits || '').replace(/\D/g, '');
  const t = String(temp || '').replace(/[^A-Za-z0-9]/g, '');
  return PUBLIC_APP_URL + '/#/forgot-password?mode=code&from=agent&phone=' + d + '&code=' + t;
}

/** The agent's invite link: always the real address (inside the Android app the page itself is https://localhost). */
export function inviteLinkFor(code: string): string {
  return PUBLIC_APP_URL + '/?agent=' + encodeURIComponent(String(code || '').trim()) + '#/register';
}

/** "237677123456" -> "+237 \u2022 \u2022\u2022 \u2022\u2022 \u2022\u2022 56": enough for the client to recognise their own number. */
export function maskedNumber(digits: string): string {
  const pretty = prettyPhone(digits);
  const m = /^(\+\d+\s)(.*)$/.exec(pretty);
  if (!m) return pretty;
  const body = m[2];
  const total = body.replace(/\D/g, '').length;
  let seen = 0;
  let out = '';
  for (const ch of body) {
    if (/\d/.test(ch)) {
      seen += 1;
      out += seen > total - 2 ? ch : '\u2022';
    } else {
      out += ch;
    }
  }
  return m[1] + out;
}

export interface AssistSignUpAnswer {
  data: { user?: { id?: string; identities?: unknown[] | null } | null; session?: unknown } | null;
  error: unknown;
}

/**
 * Creates the client's account through a second connection that keeps nothing: not the agent's session, not
 * the new one. The new account's session is closed here and ended again by the database a second later.
 */
export async function assistSignUp(email: string, password: string, meta: Record<string, string>): Promise<AssistSignUpAnswer> {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (!url || !key) return { data: null, error: new Error('not configured') };
  const side = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storageKey: 'bambeh-agent-assist',
      flowType: 'implicit',
    },
  });
  try {
    const r = (await side.auth.signUp({ email, password, options: { data: meta } })) as unknown as AssistSignUpAnswer;
    return r || { data: null, error: new Error('no answer') };
  } catch (e) {
    return { data: null, error: e };
  } finally {
    try { await side.auth.signOut({ scope: 'local' }); } catch { /* nothing was kept anyway */ }
  }
}
// BAMBEH_END_TOKEN__AGENT_ASSIST_LIB_FIX932__COMPLETE
