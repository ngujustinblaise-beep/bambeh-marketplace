/**
 * SupabaseAuthProvider.tsx â€” Bambeh Marketplace
 * Â© 2026 Bambeh Marketplace. All rights reserved.
 *
 * Caches the Supabase auth session in React Context so that
 * AuthGate can read user state instantly (zero network latency)
 * instead of calling supabase.auth.getUser() on every navigation.
 *
 * On a 3G connection in YaoundÃ© (200â€“500 ms round-trip), removing
 * that per-navigation network call eliminates the "Verifying accessâ€¦"
 * spinner that appeared before every protected page.
 *
 * Usage â€” wrap in AppProviders.tsx:
 *   <SupabaseAuthProvider>
 *     {children}
 *   </SupabaseAuthProvider>
 *
 * Consume anywhere in the tree:
 *   const { user, loading } = useSupabaseAuth();
 */

import React, { useEffect, 
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/utils/auth/supabaseAuthGuard";

// â”€â”€â”€ CONTEXT TYPE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface SupabaseAuthContextType {
  /** The currently authenticated user, or null when signed out. */
  user: User | null;
  /** The live Supabase session (includes JWT access token). */
  session: Session | null;
  /**
   * True only during the very first session resolution on app start.
   * After that it stays false â€” auth state changes update user/session
   * synchronously via onAuthStateChange without toggling this flag.
   */
  loading: boolean;
  /**
   * Imperatively re-fetches the session from Supabase.
   * Call this after a manual token refresh or in edge-case recovery flows.
   */
  refreshSession: () => Promise<void>;
}

// â”€â”€â”€ CONTEXT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const SupabaseAuthContext = createContext<SupabaseAuthContextType>({
  user: null,
  session: null,
  loading: true,
  refreshSession: async () => {},
});

// â”€â”€â”€ PROVIDER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function SupabaseAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async (): Promise<void> => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (!error) {
        setSession(data.session);
        setUser(data.session?.user ?? null);
      }
    } catch {
      // Network failure â€” keep existing cached state, do not clear
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // 1. Resolve the initial session once on mount.
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // 2. Subscribe to all future auth state changes (sign-in, sign-out,
    //    token refresh, password recovery, etc.).  Supabase fires this
    //    synchronously with the cached state on subscribe, so there is
    //    no flash-of-wrong-state between the getSession call above and
    //    the first event from this listener.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <SupabaseAuthContext.Provider
      value={{ user, session, loading, refreshSession }}
    >
      {children}
    </SupabaseAuthContext.Provider>
  );
}

// â”€â”€â”€ HOOK â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Returns the cached Supabase auth state.
 * Must be used inside a component that is a descendant of SupabaseAuthProvider.
 *
 * @example
 * const { user, loading } = useSupabaseAuth();
 * if (loading) return <Spinner />;
 * if (!user)   return <Navigate to="/login" />;
 */
export function useSupabaseAuth(): SupabaseAuthContextType {
  const ctx = useContext(SupabaseAuthContext);
  if (ctx === undefined) {
    throw new Error(
      "useSupabaseAuth must be used inside <SupabaseAuthProvider>. " +
        "Make sure SupabaseAuthProvider wraps your component tree in AppProviders.tsx."
    );
  }
  return ctx;
}

export default SupabaseAuthProvider;




