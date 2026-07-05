/**
 * src/contexts/AuthContext.tsx
 * SINGLE source of truth for auth in Bambeh.
 * The real Supabase logic lives in @/hooks/useSupabaseAuth; this wraps it in ONE
 * React context that the whole app reads. useAuth() NEVER throws - if a provider
 * is somehow not mounted, it returns safe defaults so the app can't white-screen.
 */
import React, { createContext, useContext } from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

// The context value is exactly what useSupabaseAuth returns, so the shape always
// matches what your components already expect (user, isVendor, isAdmin, loading, ...).
export type AuthContextValue = ReturnType<typeof useSupabaseAuth> & { currentUser: ReturnType<typeof useSupabaseAuth>["user"] };
export type AuthUser = NonNullable<AuthContextValue["user"]>;

export const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useSupabaseAuth();
  const value: AuthContextValue = { ...auth, currentUser: auth.user };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Safe fallback used ONLY if no provider is mounted (prevents crashes).
const SAFE_DEFAULT = {
  user: null,
  currentUser: null,
  session: null,
  profile: null,
  loading: false,
  authReady: true,
  isAuthenticated: false,
  isVendor: false,
  isAdmin: false,
  isSubscribed: false,
  signIn: async () => {},
  signInWithPassword: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
  updateProfile: async () => {},
  resetPassword: async () => {},
} as unknown as AuthContextValue;

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    if (typeof console !== "undefined") {
      console.warn("useAuth(): no <AuthProvider> mounted - using safe defaults.");
    }
    return SAFE_DEFAULT;
  }
  return ctx;
}

export default useAuth;