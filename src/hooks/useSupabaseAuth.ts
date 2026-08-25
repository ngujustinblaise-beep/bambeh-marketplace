// BAMBEH_DEPLOY_TOKEN__USESUPABASEAUTH_FIX388_CLEAN
/**
 * src/hooks/useSupabaseAuth.ts - FIX388 (supersedes FIX385)
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

import { useState, useEffect, useCallback, createContext } from 'react';
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
let lastKnownRoles: { userId: string; isVendor: boolean; isAdmin: boolean } | null = null;

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
          profileCache = null;
          lastKnownRoles = null;
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

      setState({
        user,
        session,
        isVendor: known ? known.isVendor : false,
        isAdmin:  known ? known.isAdmin  : false,
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
      p.is_admin === true ||
      adminRole === 'admin' ||
      adminRole === 'super_admin' ||
      roleStr === 'admin';

    // Only a REAL answer is remembered.
    profileCache   = { userId: user.id, isVendor, isAdmin, fetchedAt: now };
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
    profileCache   = null;
    lastKnownRoles = null;
    await resolveSession(null);
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
// BAMBEH_END_TOKEN__USESUPABASEAUTH_FIX388__COMPLETE
