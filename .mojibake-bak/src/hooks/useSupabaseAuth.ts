/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * src/hooks/useSupabaseAuth.ts
 * Server-Side JWT Validation Hook â€” Bambeh Marketplace
 *
 * SECURITY FIX: Replaces localStorage-only auth checks with
 * cryptographically verified Supabase JWT validation.
 *
 * Architecture:
 *   âœ… supabase.auth.getUser()  â†’ validates JWT with Supabase server
 *   âœ… onAuthStateChange()       â†’ reacts to session expiry / sign-out
 *   âœ… roles fetched from DB     â†’ isVendor / isAdmin cannot be spoofed
 *   âœ… loading state             â†’ protected routes wait for verification
 *
 * Â© 2026 BAMBEH SARL / Bambeh. All rights reserved.
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */

import { useState, useEffect, useCallback, useContext, createContext } from 'react';
import type { Session, User }                                           from '@supabase/supabase-js';
import { supabase }                                                     from '@/lib/supabase';

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface SupabaseAuthState {
  /** The verified Supabase user (null = not signed in) */
  user:       User | null;
  /** The active session (contains access_token for API calls) */
  session:    Session | null;
  /** True only when DB profile confirms is_vendor === true OR role === 'seller' */
  isVendor:   boolean;
  /** True only when DB profile confirms role === 'admin' */
  isAdmin:    boolean;
  /** True while the initial JWT verification is in flight â€” gate UI on this */
  loading:    boolean;
  /** Exposed so components can manually refresh (e.g. after sign-in) */
  refresh:    () => Promise<void>;
}

// â”€â”€ Profile cache (avoids hammering DB on every re-render) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface ProfileCache {
  userId:   string;
  isVendor: boolean;
  isAdmin:  boolean;
  fetchedAt: number; // ms timestamp
}

let profileCache: ProfileCache | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// â”€â”€ Core hook â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
    // â”€â”€ No session â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (!session) {
      profileCache = null;
      setState({ user: null, session: null, isVendor: false, isAdmin: false, loading: false });
      return;
    }

    // â”€â”€ Verify JWT server-side â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // getUser() makes a network call to Supabase Auth â€” the JWT is validated
    // cryptographically on the server, NOT just decoded locally.
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      // Token is invalid / expired â€” force sign out
      await supabase.auth.signOut();
      profileCache = null;
      setState({ user: null, session: null, isVendor: false, isAdmin: false, loading: false });
      return;
    }

    // â”€â”€ Use profile cache if still fresh â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

    // â”€â”€ Fetch role from database â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // This is the AUTHORITATIVE source â€” cannot be spoofed via localStorage.
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

  // â”€â”€ Expose a manual refresh â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const refresh = useCallback(async () => {
    profileCache = null; // invalidate cache
    const { data: { session } } = await supabase.auth.getSession();
    await resolveSession(session);
  }, [resolveSession]);

  // â”€â”€ Bootstrap on mount â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€ Context (for use in AuthProvider) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const SupabaseAuthContext = createContext<SupabaseAuthState>({
  user:     null,
  session:  null,
  isVendor: false,
  isAdmin:  false,
  loading:  true,
  refresh:  async () => {},
});

/** Convenience hook â€” use this in components instead of prop drilling */
export function useAuth(): SupabaseAuthState {
  return useContext(SupabaseAuthContext);
}
