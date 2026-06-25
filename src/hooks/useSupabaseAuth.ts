/**
 * ═══════════════════════════════════════════════════════════════════════
 * src/hooks/useSupabaseAuth.ts
 * Server-Side JWT Validation Hook — Bambeh Marketplace
 *
 * SECURITY FIX: Replaces localStorage-only auth checks with
 * cryptographically verified Supabase JWT validation.
 *
 * Architecture:
 *   ✅ supabase.auth.getUser()  → validates JWT with Supabase server
 *   ✅ onAuthStateChange()       → reacts to session expiry / sign-out
 *   ✅ roles fetched from DB     → isVendor / isAdmin cannot be spoofed
 *   ✅ loading state             → protected routes wait for verification
 *
 * © 2026 BAMBEH SARL / Bambeh. All rights reserved.
 * ═══════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback, useContext, createContext } from 'react';
import type { Session, User }                                           from '@supabase/supabase-js';
import { supabase }                                                     from '@/lib/supabase';

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
  refresh:    () => Promise<void>;
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
  const [state, setState] = useState<Omit<SupabaseAuthState, 'refresh'>>({
    user:    null,
    session: null,
    isVendor: false,
    isAdmin:  false,
    loading:  true,
  });

  /**
   * Resolve roles from DB (with cache).
   * Called after every session change.
   */
  const resolveSession = useCallback(async (session: Session | null) => {
    // ── No session ──────────────────────────────────────────────────────────
    if (!session) {
      profileCache = null;
      setState({ user: null, session: null, isVendor: false, isAdmin: false, loading: false });
      return;
    }

    // ── Verify JWT server-side ───────────────────────────────────────────────
    // getUser() makes a network call to Supabase Auth — the JWT is validated
    // cryptographically on the server, NOT just decoded locally.
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      // Token is invalid / expired — force sign out
      await supabase.auth.signOut();
      profileCache = null;
      setState({ user: null, session: null, isVendor: false, isAdmin: false, loading: false });
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

    setState({ user, session, isVendor, isAdmin, loading: false });
  }, []);

  // ── Expose a manual refresh ────────────────────────────────────────────────
  const refresh = useCallback(async () => {
    profileCache = null; // invalidate cache
    const { data: { session } } = await supabase.auth.getSession();
    await resolveSession(session);
  }, [resolveSession]);

  // ── Bootstrap on mount ────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) resolveSession(session);
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

  return { ...state, refresh };
}

// ── Context (for use in AuthProvider) ────────────────────────────────────────

export const SupabaseAuthContext = createContext<SupabaseAuthState>({
  user:     null,
  session:  null,
  isVendor: false,
  isAdmin:  false,
  loading:  true,
  refresh:  async () => {},
});

/** Convenience hook — use this in components instead of prop drilling */
export function useAuth(): SupabaseAuthState {
  return useContext(SupabaseAuthContext);
}

