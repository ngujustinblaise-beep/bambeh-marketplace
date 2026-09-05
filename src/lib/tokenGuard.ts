// BAMBEH_DEPLOY_TOKEN__TOKENGUARD_FIX462_CLEAN
/**
 * src/lib/tokenGuard.ts — Bambeh Marketplace
 *
 * FIX462 — SELF-HEAL AN OVERSIZED SESSION TOKEN.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * Supabase copies auth.users.raw_user_meta_data into every JWT it mints.
 * Before FIX434, the avatar upload wrote the whole photo into that field as a
 * "data:image/jpeg;base64,..." string. Five accounts ended up with 50 KB - 350 KB
 * of metadata, which produced an Authorization header of 70 KB - 457 KB.
 *
 * Cloudflare rejects any request whose headers exceed 32 KB with
 *   400 Request Header Or Cookie Too Large
 * The request never reaches Supabase. No RLS runs. No error object comes back
 * that the app can read. Every authenticated call simply dies at the edge, so
 * the admin panel printed "No users found" and the app looked like it had a
 * network fault. That cost weeks.
 *
 * The database rows are cleaned and a trigger on auth.users now strips any
 * "data:" value on write, so no NEW poisoned token can be minted. But a token
 * already minted lives in the browser's localStorage until it is refreshed —
 * and the refresh call carries the same oversized header, so it 400s too, and
 * supabase-js reads that as an invalid session and signs the user out. The
 * account is stuck in a loop it cannot escape on its own.
 *
 * Users cannot be asked to open DevTools. So the app repairs itself: on every
 * boot, before Supabase reads anything, we measure the stored session. If it is
 * too big to ever succeed, we drop it and reload. The user lands on a working
 * login screen instead of a permanently broken app.
 *
 * DESIGN NOTES
 * ------------
 * - Runs BEFORE the Supabase client reads storage. Must be imported at the very
 *   top of main.tsx.
 * - Displays NOTHING, so there is no string here needing the five languages.
 *   It leaves a breadcrumb in sessionStorage that a UI surface can read later.
 * - Reloads AT MOST ONCE per tab, guarded by a sessionStorage flag. A boot guard
 *   that can loop is worse than the bug it fixes.
 * - Never throws. localStorage can be disabled, full, or blocked by privacy
 *   settings; in every one of those cases we do nothing and let the app boot.
 * - Handles chunked keys (sb-<ref>-auth-token.0, .1, ...) as well as the single
 *   key form, because supabase-js splits large sessions across several keys —
 *   which is exactly what an oversized token does.
 */

/** Any token above this can never fit in a request header. 6 KB leaves generous
 *  room above a healthy Bambeh token (~1.5 KB) and well below Cloudflare's
 *  32 KB ceiling for ALL headers combined, not just Authorization. */
export const MAX_SESSION_BYTES = 6144;

/** Above this we are not broken yet, but we are heading there. Reported to the
 *  admin health monitor so it can be fixed before anyone is locked out. */
export const WARN_SESSION_BYTES = 3072;

const RELOAD_FLAG = "bambeh:tokenGuard:reloaded";
const BREADCRUMB = "bambeh:tokenGuard:lastResult";
const LOG = "[tokenGuard]";

export type TokenGuardStatus = "ok" | "warn" | "healed" | "unavailable";

export interface TokenGuardResult {
  status: TokenGuardStatus;
  /** Total bytes of the stored session across all its keys. */
  bytes: number;
  /** The localStorage keys that were measured. */
  keys: string[];
  /** The keys that were removed, if any. */
  cleared: string[];
  /** True when the page was reloaded to complete the repair. */
  reloaded: boolean;
}

/** UTF-8 byte length, because a header limit is counted in bytes, not
 *  characters. Falls back to character count where TextEncoder is missing. */
function byteLength(value: string): number {
  try {
    return new TextEncoder().encode(value).length;
  } catch {
    return value.length;
  }
}

/** Every localStorage key supabase-js uses for the session. Matches both
 *  "sb-<ref>-auth-token" and its chunked variants. */
function findSessionKeys(): string[] {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (key.startsWith("sb-") && key.includes("-auth-token")) keys.push(key);
  }
  return keys;
}

/**
 * Measure the stored session without changing anything.
 * Safe to call from anywhere, including React components and the admin panel.
 */
export function measureStoredSession(): TokenGuardResult {
  const empty: TokenGuardResult = {
    status: "unavailable",
    bytes: 0,
    keys: [],
    cleared: [],
    reloaded: false,
  };

  if (typeof window === "undefined") return empty;

  let keys: string[];
  try {
    keys = findSessionKeys();
  } catch {
    return empty;
  }

  let bytes = 0;
  for (const key of keys) {
    try {
      bytes += byteLength(localStorage.getItem(key) ?? "");
    } catch {
      /* one unreadable key must not stop the measurement */
    }
  }

  const status: TokenGuardStatus =
    bytes > MAX_SESSION_BYTES ? "healed" : bytes > WARN_SESSION_BYTES ? "warn" : "ok";

  return { status, bytes, keys, cleared: [], reloaded: false };
}

/**
 * The boot guard. Measures the stored session and, if it is too large to ever
 * succeed, clears it and reloads once.
 *
 * Returns the result so callers can log or surface it. Never throws.
 */
export function runTokenGuard(): TokenGuardResult {
  const measured = measureStoredSession();

  if (measured.status === "unavailable") return measured;

  // Healthy, or heading that way but still usable. Record and continue.
  if (measured.bytes <= MAX_SESSION_BYTES) {
    if (measured.status === "warn") {
      console.warn(
        `${LOG} session is ${measured.bytes} bytes — above the ${WARN_SESSION_BYTES} byte warning line. ` +
          `Not broken yet, but check auth.users.raw_user_meta_data for this account.`
      );
    }
    writeBreadcrumb(measured);
    return measured;
  }

  // Too large to ever succeed.
  console.error(
    `${LOG} stored session is ${measured.bytes} bytes across ${measured.keys.length} key(s). ` +
      `Cloudflare rejects request headers over 32768 bytes, so every authenticated call from ` +
      `this session would fail with 400 Request Header Or Cookie Too Large. Clearing it.`
  );

  const cleared: string[] = [];
  for (const key of measured.keys) {
    try {
      localStorage.removeItem(key);
      cleared.push(key);
    } catch {
      /* a key we cannot remove is a key we cannot fix; keep going */
    }
  }

  const result: TokenGuardResult = { ...measured, status: "healed", cleared, reloaded: false };

  // Only reload if we actually removed something AND we have not already
  // reloaded in this tab. Without both conditions this can loop forever.
  let alreadyReloaded = false;
  try {
    alreadyReloaded = sessionStorage.getItem(RELOAD_FLAG) === "1";
  } catch {
    /* treat an unreadable sessionStorage as "already reloaded" so we never loop */
    alreadyReloaded = true;
  }

  writeBreadcrumb(result);

  if (cleared.length > 0 && !alreadyReloaded) {
    try {
      sessionStorage.setItem(RELOAD_FLAG, "1");
    } catch {
      /* if we cannot set the flag we must not reload, or we loop */
      return result;
    }
    result.reloaded = true;
    // location.reload() preserves the full URL, including the ?code= query and
    // the #/... hash, so a password-recovery link in flight is not lost.
    window.location.reload();
  }

  return result;
}

/** Leaves a small, readable record for the admin panel and for support. */
function writeBreadcrumb(result: TokenGuardResult): void {
  try {
    sessionStorage.setItem(
      BREADCRUMB,
      JSON.stringify({
        status: result.status,
        bytes: result.bytes,
        cleared: result.cleared.length,
        at: new Date().toISOString(),
      })
    );
  } catch {
    /* nothing depends on the breadcrumb */
  }
}

/** Reads the breadcrumb left by the last run, for display elsewhere. */
export function readTokenGuardBreadcrumb(): {
  status: TokenGuardStatus;
  bytes: number;
  cleared: number;
  at: string;
} | null {
  try {
    const raw = sessionStorage.getItem(BREADCRUMB);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Run immediately on import. This module is imported for its side effect at the
// top of main.tsx, so the check happens before Supabase touches storage.
runTokenGuard();
// BAMBEH_END_TOKEN__TOKENGUARD_FIX462__COMPLETE
