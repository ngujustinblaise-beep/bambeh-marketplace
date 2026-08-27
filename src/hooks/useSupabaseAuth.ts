// BAMBEH_DEPLOY_TOKEN__USESUPABASEAUTH_FIX395_CLEAN
/**
 * src/hooks/useSupabaseAuth.ts - FIX395 (supersedes FIX388)
 *
 * ===================================================================
 * FIX395 - THE ADMIN PANEL OPENS ONCE AND IS NEVER SEEN AGAIN.
 * ===================================================================
 *
 * Big got into the admin centre exactly once and never again. FIX385
 * explained half of it: a failed profiles read used to DEMOTE him and then
 * cache that demotion. FIX395 fixes the other half, which is worse:
 *
 *   1. THE LAST KNOWN ROLES DIED ON EVERY RELOAD. lastKnownRoles lived in a
 *      module variable, so it was wiped the moment the page reloaded. On a
 *      connection where the profiles read often fails, the app therefore
 *      started every session knowing nothing, and frequently never found out.
 *
 *      They are now kept in localStorage - but ONLY EVER written after a
 *      genuine, successful read from the server. A failure still writes
 *      nothing. So "I got in once" finally sticks.
 *
 *      Yes, someone could hand-edit that key. What they would get is an
 *      EMPTY admin shell: every admin page fetches its own data and RLS
 *      decides what comes back. The client flag opens a door; the server
 *      still owns the room. The profiles privilege-escalation hole was
 *      closed server-side in FIX328 and this does not reopen it.
 *
 *   2. A FAILED READ WAS NEVER RETRIED. FIX388 correctly cut the app-level
 *      retry to one call and left retrying to the transport. But when those
 *      also failed, that was the end of it - isAdmin stayed false for the
 *      whole session with nothing scheduled to try again.
 *
 *      A failed read now schedules another attempt at 3s, 8s, 20s and 45s.
 *      On a connection where roughly a third of requests die, four more
 *      chances across 76 seconds is the difference between locked out and
 *      in. The first success cancels the rest immediately.
 *
 * The query stays select('*'). FIX340's lesson has not expired: naming a
 * column that does not exist makes PostgREST reject the WHOLE query, which
 * would strip admin AND vendor rights from every user at once. A smaller
 * response would survive a weak link better, but not at that risk.
 *
 * ===================================================================
 * FIX388 - THE TWO RETRY LAYERS WERE MULTIPLYING.
 * ===================================================================
 *
 * FIX385 (below) wrapped every auth call in a three-attempt retry. FIX386
 * then gave net-interceptor.ts its own three-attempt retry for GET and HEAD.
 * Nobody told either about the other, so they COMPOUNDED:
 *
 *     one getUser()      =  3 app tries  x  3 transport tries  =  9 requests
 *     one profiles read  =  3 app tries  x  3 transport tries  =  9 requests
 *     one resolveSession =  18 requests where 2 were needed
 *
 * On a connection that was already failing, that is the opposite of help. A
 * live console showed "[auth] profiles read failed after 3 tries" repeating
 * endlessly - the fix working exactly as written, and making things worse.
 *
 * FIX388 leaves the retrying to ONE layer:
 *
 *   * getUser, getSession and the profiles read now make ONE call each.
 *     net-interceptor retries them at the transport, where it belongs.
 *
 *   * signInWithPassword and signUp still retry HERE, twice, because the
 *     transport deliberately never retries a POST. Two attempts, not three,
 *     and a longer pause between them.
 *
 * Everything FIX385 established is kept: a failed read never demotes anyone,
 * a failed read is never cached, and only a 401 or 403 signs anyone out.
 *
 * ===================================================================
 * THE ADMIN LOOP, FOUND. It was never permissions.
 * ===================================================================
 *
 * FIX340 corrected the table and column, and profiles.is_admin has been true
 * for the owner ever since. The panel still bounced. This is why:
 *
 *     const { data: profile } = await supabase.from('profiles')...
 *     const p = (profile ?? {}) as Record<string, unknown>;
 *     const isAdmin = p.is_admin === true || ...
 *
 * The ERROR was thrown away. When that request dies - and on this project
 * roughly a third of them do, with ERR_CONNECTION_RESET or
 * ERR_HTTP2_PROTOCOL_ERROR - `profile` is null, `p` is {}, and isAdmin
 * silently becomes FALSE. The code could not tell "this user is not an admin"
 * apart from "I could not ask".
 *
 * Then it made it permanent:
 *
 *     profileCache = { userId, isVendor, isAdmin, fetchedAt: now };
 *
 * It cached that false for FIVE MINUTES. One dropped packet demoted the owner
 * and the cache served the lie back without ever retrying.
 *
 * ===================================================================
 * WHAT FIX385 CHANGES
 * ===================================================================
 *
 * 1. THE PROFILE READ IS RETRIED - three attempts with a growing pause.
 *    Ten sequential requests to this Supabase project succeed ten times out
 *    of ten; it is the parallel storm that kills them. A retry is usually
 *    enough.
 *
 * 2. A FAILED READ NEVER DEMOTES ANYONE. If we could not reach the server we
 *    keep the roles we last knew for this user. We only lower someone's
 *    rights when the SERVER actually tells us to.
 *
 * 3. A FAILED READ IS NEVER CACHED. The cache now only ever holds answers
 *    that really came from the database, so a bad moment cannot lock the
 *    owner out for the next five minutes.
 *
 * 4. getUser(), signInWithPassword() and signUp() ARE RETRIED TOO. That is
 *    the "Failed to fetch" users report on the sign-in screen: the request
 *    never completed, so supabase-js threw before any answer arrived.
 *
 * WHAT IS DELIBERATELY UNCHANGED
 *   The exported shape - user, session, isVendor, isAdmin, loading, authReady,
 *   refresh, login, register, logout. AuthContext spreads this object, so the
 *   shape is load-bearing for the whole app and must not move.
 *   FIX316's rule also stands: only a 401 or 403 signs anyone out. An
 *   unreachable server keeps the stored session.
 *
 * NOTE: this does NOT reduce the number of parallel requests Bambeh fires.
 * It makes auth survive them. Cutting the storm itself is the next job.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */

import { useState, useEffect, useCallback, useRef, createContext } from 'react';
import type { Session, User }                              from '@supabase/supabase-js';
import { supabase }                                        from '@/lib/supabase';

// -- Types -------------------------------------------------------------------

export interface SupabaseAuthState {
  /** The verified Supabase user (null = not signed in) */
  user:       User | null;
  /** The active session (contains access_token for API calls) */
  session:    Session | null;
  /** True when profiles.is_vendor is true, or role is 'seller' / 'vendor' */
  isVendor:   boolean;
  /** True when profiles.is_admin is true, or admin_role is 'admin'/'super_admin', or role is 'admin' */
  isAdmin:    boolean;
  /** True while the initial JWT verification is in flight - gate UI on this */
  loading:    boolean;
  /** Exposed so components can manually refresh (e.g. after sign-in) */
  authReady:  boolean;
  refresh:    () => Promise<void>;
  login:      (email: string, password: string) => Promise<{ error: string | null }>;
  register:   (email: string, password: string, fullName?: string) => Promise<{ error: string | null }>;
  logout:     () => Promise<void>;
}

// -- Caches ------------------------------------------------------------------

interface ProfileCache {
  userId:    string;
  isVendor:  boolean;
  isAdmin:   boolean;
  fetchedAt: number;
}

/** Short-lived cache. ONLY ever written from a real, successful DB read. */
let profileCache: ProfileCache | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * The last roles we genuinely learned for a user, with no expiry.
 * Used ONLY when the server could not be reached, so a dropped request
 * cannot strip someone of rights they demonstrably have.
 */
type KnownRoles = { userId: string; isVendor: boolean; isAdmin: boolean };

/* ==========================================================================
 * FIX395 - the last GENUINELY READ roles, remembered across reloads.
 * Written ONLY after the server answers. A failed read never touches this.
 * ========================================================================== */
const ROLES_KEY = 'bambeh_known_roles';

function loadKnownRoles(): KnownRoles | null {
  try {
    const raw = window.localStorage.getItem(ROLES_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Record<string, unknown>;
    if (
      typeof p.userId === 'string' &&
      typeof p.isVendor === 'boolean' &&
      typeof p.isAdmin === 'boolean'
    ) {
      return { userId: p.userId, isVendor: p.isVendor, isAdmin: p.isAdmin };
    }
  } catch {
    /* storage blocked or corrupt - behave as if we knew nothing */
  }
  return null;
}

function saveKnownRoles(r: KnownRoles): void {
  try {
    window.localStorage.setItem(ROLES_KEY, JSON.stringify(r));
  } catch {
    /* storage blocked - the in-memory copy still serves this session */
  }
}

function clearKnownRoles(): void {
  try {
    window.localStorage.removeItem(ROLES_KEY);
  } catch {
    /* nothing to do */
  }
}

/* ==========================================================================
 * FIX398 - THE ADMIN FLAG, READ STRAIGHT OUT OF THE TOKEN.
 *
 * Supabase copies auth.users.raw_app_meta_data into the JWT, and the JWT
 * arrives WITH the session. Nothing is fetched. So this answer cannot fail,
 * cannot time out, and cannot be lost to a dead connection - which is the
 * whole reason the admin centre has been shut since day one.
 *
 * app_metadata is writable only by SQL or the service role. A user cannot
 * set their own, unlike user_metadata. This does not reopen the
 * privilege-escalation hole FIX328 closed.
 *
 * Set it with:
 *   update auth.users
 *   set raw_app_meta_data = coalesce(raw_app_meta_data,'{}'::jsonb)
 *                           || '{"is_admin": true}'::jsonb
 *   where email = '<the admin address>';
 *
 * Then sign out and back in - a token is only rewritten when a new one is
 * issued.
 * ========================================================================== */
function adminFromToken(user: User | null): boolean {
  if (!user) return false;
  try {
    const meta = (user as unknown as { app_metadata?: Record<string, unknown> }).app_metadata;
    if (!meta) return false;
    if (meta.is_admin === true) return true;
    if (String(meta.is_admin ?? '').toLowerCase() === 'true') return true;
    const role = String(meta.role ?? '').toLowerCase();
    return role === 'admin' || role === 'super_admin';
  } catch {
    return false;
  }
}

let lastKnownRoles: KnownRoles | null = loadKnownRoles();

/* FIX415 ---------------------------------------------------------------------
 * profileCache records a SUCCESSFUL read. On failure nothing is written, which
 * is correct - we must not cache "unknown" as an answer. But it also means the
 * TTL guard cannot throttle a FAILING read, and a failing read is exactly the
 * one that gets repeated. This second clock records that we ASKED, regardless
 * of what came back, so a dead connection can no longer produce a stampede.
 * Ten seconds is short enough that a genuine role change still lands quickly.
 * -------------------------------------------------------------------------- */
const PROFILE_ATTEMPT_MS = 10000;
let lastProfileAttempt: { userId: string; at: number } | null = null;

/* ==========================================================================
 * FIX395 - keep asking. A read that failed is not an answer.
 * ========================================================================== */
const ROLE_RETRY_STEPS_MS = [3000, 8000, 20000, 45000];
let roleRetryTimer: ReturnType<typeof setTimeout> | null = null;
let roleRetryIndex = 0;

function scheduleRoleRetry(run: () => void): void {
  if (roleRetryTimer !== null) clearTimeout(roleRetryTimer);
  if (roleRetryIndex >= ROLE_RETRY_STEPS_MS.length) {
    console.warn('[auth] roles still unknown after every retry - giving up for this session.');
    return;
  }
  const wait = ROLE_RETRY_STEPS_MS[roleRetryIndex];
  roleRetryIndex = roleRetryIndex + 1;
  console.info('[auth] roles unknown - asking again in ' + wait + ' ms.');
  roleRetryTimer = setTimeout(() => {
    roleRetryTimer = null;
    run();
  }, wait);
}

function cancelRoleRetry(): void {
  if (roleRetryTimer !== null) {
    clearTimeout(roleRetryTimer);
    roleRetryTimer = null;
  }
  roleRetryIndex = 0;
}

// -- Retry helper ------------------------------------------------------------

function pause(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Runs an async Supabase call up to `times` attempts.
 * Returns { value, threw } - it never throws, so callers can decide what an
 * unreachable server means for them instead of crashing.
 *
 * FIX388: the count is now a parameter. Reads pass 1 because
 * net-interceptor.ts already retries them at the transport layer; writes that
 * the transport will not retry (sign-in, sign-up) pass 2.
 */
async function attempt<T>(fn: () => Promise<T>, times = 1): Promise<{ value: T | null; threw: unknown }> {
  let threw: unknown = null;
  for (let i = 0; i < times; i++) {
    try {
      const value = await fn();
      return { value, threw: null };
    } catch (e) {
      threw = e;
      if (i < times - 1) await pause(900 * (i + 1));
    }
  }
  return { value: null, threw };
}

// -- Core hook ---------------------------------------------------------------

export function useSupabaseAuth(): SupabaseAuthState {
  const [state, setState] = useState<Omit<SupabaseAuthState, 'refresh' | 'login' | 'register' | 'logout'>>({
    user:    null,
    session: null,
    isVendor: false,
    isAdmin:  false,
    loading:  true,
    authReady: false,
  });
  const [authReady, setAuthReady] = useState(false);

  // FIX395 - lets resolveSession schedule another run of ITSELF without the
  // circular reference a plain useCallback would create.
  const resolveRef = useRef<((s: Session | null) => Promise<void>) | null>(null);

  const resolveSession = useCallback(async (session: Session | null) => {
    // -- No session ----------------------------------------------------------
    if (!session) {
      profileCache = null;
      setState({ user: null, session: null, isVendor: false, isAdmin: false, loading: false, authReady: true });
      return;
    }

    // -- Verify the JWT server-side -----------------------------------------
    // FIX316's rule, kept: a FAILED getUser() must NOT sign the user out.
    // getUser() is a network call. On a dropped connection it fails, and the
    // original code treated that exactly like a rejected token - it called
    // signOut(), which DELETED the saved session. FIX385 additionally retries
    // before giving up, because one attempt is not a fair test on this network.
    let verifiedUser: User | null = null;

    // FIX388 - ONE call. net-interceptor retries this GET at the transport.
    const got = await attempt(() => supabase.auth.getUser(), 1);

    if (got.threw) {
      console.warn('[auth] getUser() unreachable, keeping stored session:', got.threw);
      verifiedUser = session.user ?? null;
    } else {
      const userError = got.value?.error;
      if (userError) {
        const status = (userError as { status?: number }).status;
        if (status === 401 || status === 403) {
          // The server genuinely rejected this token. Sign out.
          await supabase.auth.signOut();
          cancelRoleRetry();
          profileCache = null;
          lastKnownRoles = null;
          clearKnownRoles(); // FIX395 - the server rejected this token
          setState({ user: null, session: null, isVendor: false, isAdmin: false, loading: false, authReady: true });
          return;
        }
        console.warn('[auth] getUser() returned an error, keeping stored session:', userError.message);
        verifiedUser = session.user ?? null;
      } else {
        verifiedUser = got.value?.data?.user ?? null;
      }
    }

    const user = verifiedUser;
    if (!user) {
      setState({ user: null, session: null, isVendor: false, isAdmin: false, loading: false, authReady: true });
      return;
    }

    // -- Fresh cache? --------------------------------------------------------
    const now = Date.now();
    if (
      profileCache &&
      profileCache.userId === user.id &&
      now - profileCache.fetchedAt < CACHE_TTL_MS
    ) {
      setState({
        user,
        session,
        isVendor: profileCache.isVendor,
        isAdmin:  profileCache.isAdmin,
        loading:  false,
        authReady: true,
      });
      return;
    }

    // -- Read the roles from the database -----------------------------------
    // FIX340's lesson still applies: select('*') and judge in JS. Naming a
    // column that does not exist makes PostgREST reject the WHOLE query, which
    // would strip admin AND vendor rights from every user at once.
    // FIX388 - ONE call. The transport layer does the retrying.
    // FIX415 - we asked about this user moments ago and are still waiting or
    // were refused. Do NOT ask again. Answer from the token and the last roles
    // we genuinely knew. adminFromToken() reads app_metadata, which arrives
    // WITH the session and needs no network at all, so an admin stays an admin
    // even when the database is unreachable.
    if (
      lastProfileAttempt &&
      lastProfileAttempt.userId === user.id &&
      Date.now() - lastProfileAttempt.at < PROFILE_ATTEMPT_MS
    ) {
      const seen =
        lastKnownRoles && lastKnownRoles.userId === user.id ? lastKnownRoles : null;
      setState({
        user,
        session,
        isVendor: seen ? seen.isVendor : false,
        isAdmin:  adminFromToken(user) || (seen ? seen.isAdmin : false),
        loading:  false,
        authReady: true,
      });
      return;
    }
    lastProfileAttempt = { userId: user.id, at: Date.now() };

    const read = await attempt(
      () => supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      1,
    );

    const readFailed = !!read.threw || !!read.value?.error;

    if (readFailed) {
      // ===================================================================
      // THE FIX. We could not ASK, so we must not ANSWER "no".
      // Fall back to whatever we last genuinely knew about this user, and
      // write NOTHING to the cache so the very next check tries again.
      // ===================================================================
      const known =
        lastKnownRoles && lastKnownRoles.userId === user.id
          ? lastKnownRoles
          : (profileCache && profileCache.userId === user.id ? profileCache : null);

      console.warn(
        '[auth] profiles read failed - keeping last known roles, not caching.',
        read.threw || read.value?.error
      );

      // FIX395 - and ASK AGAIN. Without this the session ended here: isAdmin
      // stayed false until the next full reload, which is exactly why the
      // admin centre opened once and never again.
      scheduleRoleRetry(() => { void resolveRef.current?.(session); });

      setState({
        user,
        session,
        isVendor: known ? known.isVendor : false,
        // FIX398 - the profiles read failed, but the TOKEN never does.
        isAdmin:  adminFromToken(user) || (known ? known.isAdmin : false),
        loading:  false,
        authReady: true,
      });
      return;
    }

    const p         = (read.value?.data ?? {}) as Record<string, unknown>;
    const roleStr   = String(p.role ?? '').toLowerCase();
    const adminRole = String(p.admin_role ?? '').toLowerCase();

    const isVendor = p.is_vendor === true || roleStr === 'seller' || roleStr === 'vendor';
    // Accept every convention this codebase has used, so renaming one of them
    // later cannot lock the owner out of his own admin panel a second time.
    const isAdmin =
      adminFromToken(user) ||   // FIX398 - the token, first and always
      p.is_admin === true ||
      adminRole === 'admin' ||
      adminRole === 'super_admin' ||
      roleStr === 'admin';

    // Only a REAL answer is remembered.
    // FIX395 - a real answer. Stop retrying, and remember it across reloads.
    cancelRoleRetry();
    profileCache   = { userId: user.id, isVendor, isAdmin, fetchedAt: now };
    saveKnownRoles({ userId: user.id, isVendor, isAdmin });
    lastKnownRoles = { userId: user.id, isVendor, isAdmin };

    setState({ user, session, isVendor, isAdmin, loading: false, authReady: true });
  }, []);

  // -- Manual refresh ---------------------------------------------------------
  const refresh = useCallback(async () => {
    profileCache = null; // force a fresh read; lastKnownRoles is deliberately kept
    const got = await attempt(() => supabase.auth.getSession(), 1);
    await resolveSession(got.value?.data?.session ?? null);
  }, [resolveSession]);

  // -- Email + password sign-in ----------------------------------------------
  const login = useCallback(
    async (email: string, password: string): Promise<{ error: string | null }> => {
      // FIX388 - the transport never retries a POST, so this one retries here.
      // Twice, not three times, with a longer pause.
      const tried = await attempt(
        () => supabase.auth.signInWithPassword({ email, password }),
        2,
      );

      if (tried.threw) {
        // The connection dropped. On this network the server has sometimes
        // ALREADY answered 200 and only the response body was lost, so the
        // honest message is "try again", never "wrong password".
        return { error: 'The connection dropped before Bambeh could answer. Please try again.' };
      }

      const error = tried.value?.error;
      if (error) return { error: error.message };

      const got = await attempt(() => supabase.auth.getSession(), 1);
      await resolveSession(got.value?.data?.session ?? null);
      return { error: null };
    },
    [resolveSession],
  );

  // -- Email + password sign-up ----------------------------------------------
  const register = useCallback(
    async (email: string, password: string, fullName?: string): Promise<{ error: string | null }> => {
      const tried = await attempt(
        () => supabase.auth.signUp({
          email,
          password,
          options: fullName ? { data: { full_name: fullName } } : undefined,
        }),
        2,
      );

      if (tried.threw) {
        return { error: 'The connection dropped before Bambeh could answer. Please try again.' };
      }

      const error = tried.value?.error;
      if (error) return { error: error.message };

      // When "Confirm email" is OFF, signUp returns a live session - log the
      // user straight in. When it is ON, session is null and the caller can
      // route them to /login.
      const newSession = tried.value?.data?.session ?? null;
      if (newSession) await resolveSession(newSession);
      return { error: null };
    },
    [resolveSession],
  );

  const logout = useCallback(async (): Promise<void> => {
    await attempt(() => supabase.auth.signOut(), 1);
    cancelRoleRetry();
    profileCache   = null;
    lastKnownRoles = null;
    clearKnownRoles(); // FIX395 - signing out forgets the roles for good
    await resolveSession(null);
  }, [resolveSession]);

  // FIX395 - keep the retry pointer aimed at the current resolveSession.
  useEffect(() => {
    resolveRef.current = resolveSession;
  }, [resolveSession]);

  // -- Bootstrap on mount -----------------------------------------------------
  useEffect(() => {
    let mounted = true;

    (async () => {
      const got = await attempt(() => supabase.auth.getSession(), 1);
      if (!mounted) return;

      if (got.threw) {
        // FIX316 - if getSession() itself fails, never leave the app spinning.
        console.warn('[auth] getSession() failed at bootstrap:', got.threw);
        setAuthReady(true);
        setState(prev => ({ ...prev, loading: false, authReady: true }));
        return;
      }

      await resolveSession(got.value?.data?.session ?? null);
      if (mounted) setAuthReady(true);
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) resolveSession(session);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [resolveSession]);

  return { ...state, authReady, refresh, login, register, logout };
}

// -- Context (for use in AuthProvider) ---------------------------------------

export const SupabaseAuthContext = createContext<SupabaseAuthState>({
  user:     null,
  session:  null,
  isVendor: false,
  isAdmin:  false,
  loading:  true,
  authReady: false,
  refresh:  async () => {},
  login:    async () => ({ error: null }),
  register: async () => ({ error: null }),
  logout:   async () => {},
});

/** Convenience hook - use this in components instead of prop drilling */
export { useAuth } from "@/contexts/AuthContext";
// BAMBEH_END_TOKEN__USESUPABASEAUTH_FIX395__COMPLETE
