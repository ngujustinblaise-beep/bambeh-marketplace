/**
 * src/contexts/AuthContext.tsx
 * Bambeh Marketplace â€” Auth Context with complete AuthContextValue interface
 * Â© 2026 Bambeh Marketplace. All rights reserved.
 *
 * This file patches the AuthContextValue to include all properties
 * that legacy components expect: currentUser, loading, login, register, logout
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

// â”€â”€â”€ AuthUser â€” superset of Supabase User with Bambeh extras â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export interface AuthUser {
  id: string;
  email?: string;
  name?: string;
  displayName?: string;
  avatar_url?: string;
  avatarUrl?: string;
  phone?: string;
  role?: string;
  isVendor?: boolean;
  isAdmin?: boolean;
  subscriptionTier?: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
}

// â”€â”€â”€ AuthContextValue â€” COMPLETE interface including legacy props â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export interface AuthContextValue {
  // Current session state
  user: AuthUser | null;
  session: Session | null;

  // Legacy alias â€” many components use currentUser
  currentUser: AuthUser | null;

  // Loading state
  loading: boolean;
  isLoading: boolean;

  // Auth actions
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  register: (email: string, password: string, name?: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;

  // Profile
  updateProfile: (updates: Partial<AuthUser>) => Promise<{ error: string | null }>;

  // Convenience flags
  isAuthenticated: boolean;
  isVendor: boolean;
  isAdmin: boolean;
}

// â”€â”€â”€ Context â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const AuthContext = createContext<AuthContextValue | null>(null);

// â”€â”€â”€ Provider â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const mapUser = useCallback((supabaseUser: User | null): AuthUser | null => {
    if (!supabaseUser) return null;
    return {
      id: supabaseUser.id,
      email: supabaseUser.email,
      name: supabaseUser.user_metadata?.name as string | undefined,
      displayName: supabaseUser.user_metadata?.display_name as string | undefined,
      avatar_url: supabaseUser.user_metadata?.avatar_url as string | undefined,
      avatarUrl: supabaseUser.user_metadata?.avatar_url as string | undefined,
      phone: supabaseUser.phone,
      role: supabaseUser.role,
      app_metadata: supabaseUser.app_metadata as Record<string, unknown>,
      user_metadata: supabaseUser.user_metadata as Record<string, unknown>,
    };
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(mapUser(data.session?.user ?? null));
      setLoading(false);
    }).catch(() => setLoading(false));

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setUser(mapUser(newSession?.user ?? null));
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [mapUser]);

  const login = useCallback(async (
    email: string, password: string
  ): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error?.message ?? null };
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Login failed" };
    }
  }, []);

  const register = useCallback(async (
    email: string, password: string, name?: string
  ): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      return { error: error?.message ?? null };
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Registration failed" };
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    await supabase.auth.signOut();
  }, []);

  const updateProfile = useCallback(async (
    updates: Partial<AuthUser>
  ): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: updates,
      });
      if (!error && user) {
        setUser({ ...user, ...updates });
      }
      return { error: error?.message ?? null };
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Update failed" };
    }
  }, [user]);

  const value: AuthContextValue = {
    user,
    session,
    currentUser: user,   // legacy alias
    loading,
    isLoading: loading,
    login,
    register,
    logout,
    signOut: logout,
    updateProfile,
    isAuthenticated: Boolean(user),
    isVendor: Boolean(user?.isVendor),
    isAdmin: Boolean(user?.isAdmin || user?.role === "admin"),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// â”€â”€â”€ Hook â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

export default AuthContext;

