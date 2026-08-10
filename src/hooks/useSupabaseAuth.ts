// BAMBEH_DEPLOY_TOKEN__USESUPABASEAUTH_FIX71_CLEAN
/**
 * ═══════════════════════════════════════════════════════════════════════
 * src/hooks/useSupabaseAuth.ts
 * Server-Side JWT Validation Hook — Bambeh Marketplace
 *
 * SECURITY FIX: Replaces localStorage-only auth checks with
 * cryptographically verified Supabase JWT validation.
 *
 * FIX71: Added the missing register() function. Register.tsx calls
 *        useAuth().register(...) — which was undefined, so signup threw
 *        silently (false "account created" + no redirect). register() now
 *        calls supabase.auth.signUp and, when a session is returned
 *        (email-confirmation OFF), signs the user straight in.
 *
 * © 2026 BAMBEH SARL / Bambeh. All rights reserved.
 * ═══════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback, createContext } from 'react';
import type { Session, User }                              from '@supabase/supabase-js';
import { supabase }                                        from '@/lib/supabase';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SupabaseAuthState {
  /** The verified Supabase user (null = not signed in) */
  user:       User | null;
  /** The active session (contains access_token for API calls) */
  session:    Session | null;
  /** True only when DB profile confirms is_vendor === true OR role === 'seller' */
  isVendor:   boolean;
  /** True only when DB profile confirms role === 'admin' */
  isAdmin:    boolean;
  /** True while the initial JWT verification is in flight — gate UI on this */
  loading:    boolean;
  /** Exposed so components can manually refresh (e.g. after sign-in) */
  authReady:  boolean;
  refresh:    () => Promise<void>;
  login:      (email: string, password: string) => Promise<{ error: string | null }>;
  register:   (email: string, password: string, fullName?: string) => Promise<{ error: string | null }>;
  logout:     () => Promise<void>;
}

// ── Profile cache (avoids hammering DB on every re-render) ────────────────────

interface ProfileCache {
  userId:   string;
  isVendor: boolean;
  isAdmin:  boolean;
  fetchedAt: number; // ms timestamp
}

let profileCache: ProfileCache | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ── Core hook ─────────────────────────────────────────────────────────────────

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

  /**
   * Resolve roles from DB (with cache).
   * Called after every session change.
   */
  const resolveSession = useCallback(async (session: Session | null) => {
    // ── No session ──────────────────────────────────────────────────────────
    if (!session) {
      profileCache = null;
      setState({ user: null, session: null, isVendor: false, isAdmin: false, loading: false, authReady: true });
      return;
    }

    // ── Verify JWT server-side ───────────────────────────────────────────────
    // getUser() makes a network call to Supabase Auth — the JWT is validated
    // cryptographically on the server, NOT just decoded locally.
    // FIX316 - a FAILED getUser() must NOT sign the user out.
    // getUser() is a NETWORK call. On a slow or dropped connection it fails,
    // and the old code treated that exactly like a rejected token: it called
    // signOut(), which DELETED the saved session. That is why refreshing the
    // app on a weak connection asked people to sign in again.
    // Now we only sign out when Supabase actually REJECTS the token.
    let verifiedUser: User | null = null;
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        const status = (userError as { status?: number }).status;
        if (status === 401 || status === 403) {
          // The server genuinely rejected this token. Sign out.
          await supabase.auth.signOut();
          profileCache = null;
          setState({ user: null, session: null, isVendor: false, isAdmin: false, loading: false, authReady: true });
          return;
        }
        // Could not reach the server. Keep the session we already have.
        console.warn('[auth] getUser() unreachable, keeping stored session:', userError.message);
        verifiedUser = session.user ?? null;
      } else {
        verifiedUser = user;
      }
    } catch (netErr) {
      console.warn('[auth] getUser() threw, keeping stored session:', netErr);
      verifiedUser = session.user ?? null;
    }

    const user = verifiedUser;
    if (!user) {
      setState({ user: null, session: null, isVendor: false, isAdmin: false, loading: false, authReady: true });
      return;
    }

    // ── Use profile cache if still fresh ────────────────────────────────────
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

    // ── Fetch role from database ─────────────────────────────────────────────
    // This is the AUTHORITATIVE source — cannot be spoofed via localStorage.
    const { data: profile } = await supabase
      .from('users')
      .select('role, is_vendor')
      .eq('id', user.id)
      .maybeSingle();

    const isVendor = profile?.is_vendor === true || profile?.role === 'seller';
    const isAdmin  = profile?.role === 'admin';

    profileCache = { userId: user.id, isVendor, isAdmin, fetchedAt: now };

    setState({ user, session, isVendor, isAdmin, loading: false, authReady: true });
  }, []);

  // ── Expose a manual refresh ────────────────────────────────────────────────
  const refresh = useCallback(async () => {
    profileCache = null; // invalidate cache
    const { data: { session } } = await supabase.auth.getSession();
    await resolveSession(session);
  }, [resolveSession]);

  // ── Email + password sign-in ──────────────────────────────────────────────
  const login = useCallback(
    async (email: string, password: string): Promise<{ error: string | null }> => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      const { data: { session } } = await supabase.auth.getSession();
      await resolveSession(session);
      return { error: null };
    },
    [resolveSession],
  );

  // ── Email + password sign-up (FIX71) ──────────────────────────────────────
  const register = useCallback(
    async (email: string, password: string, fullName?: string): Promise<{ error: string | null }> => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: fullName ? { data: { full_name: fullName } } : undefined,
      });
      if (error) return { error: error.message };
      // When "Confirm email" is OFF, signUp returns a live session → log the
      // user straight in. When it is ON, session is null and the user must
      // confirm first — the caller can route them to /login.
      if (data.session) {
        await resolveSession(data.session);
      }
      return { error: null };
    },
    [resolveSession],
  );

  const logout = useCallback(async (): Promise<void> => {
    await supabase.auth.signOut();
    profileCache = null;
    await resolveSession(null);
  }, [resolveSession]);

  // ── Bootstrap on mount ────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (mounted) resolveSession(session).finally(() => { if (mounted) setAuthReady(true); });
      })
      .catch((bootErr) => {
        // FIX316 - if getSession() itself throws, never leave the app spinning.
        console.warn('[auth] getSession() failed at bootstrap:', bootErr);
        if (mounted) {
          setAuthReady(true);
          setState(prev => ({ ...prev, loading: false, authReady: true }));
        }
      });

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

// ── Context (for use in AuthProvider) ────────────────────────────────────────

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

/** Convenience hook — use this in components instead of prop drilling */
export { useAuth } from "@/contexts/AuthContext";
// BAMBEH_END_TOKEN__USESUPABASEAUTH__COMPLETE
