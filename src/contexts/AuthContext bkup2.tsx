import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

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

export interface AuthContextValue {
  user: AuthUser | null;
  session: Session | null;
  currentUser: AuthUser | null;
  loading: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  register: (email: string, password: string, name?: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<AuthUser>) => Promise<{ error: string | null }>;
  isAuthenticated: boolean;
  isVendor: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

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
      role: supabaseUser.user_metadata?.role as string | undefined,
      isVendor: Boolean(supabaseUser.user_metadata?.isVendor),
      isAdmin: Boolean(supabaseUser.user_metadata?.isAdmin),
      subscriptionTier: supabaseUser.user_metadata?.subscriptionTier as string | undefined,
      app_metadata: supabaseUser.app_metadata as Record<string, unknown>,
      user_metadata: supabaseUser.user_metadata as Record<string, unknown>,
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setUser(mapUser(data.session?.user ?? null));
      setLoading(false);
    }).catch(() => {
      if (!mounted) return;
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      setUser(mapUser(newSession?.user ?? null));
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [mapUser]);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const register = useCallback(async (email: string, password: string, name?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    return { error: error?.message ?? null };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const updateProfile = useCallback(async (updates: Partial<AuthUser>) => {
    const { error } = await supabase.auth.updateUser({ data: updates });
    if (!error && user) setUser({ ...user, ...updates });
    return { error: error?.message ?? null };
  }, [user]);

  const value: AuthContextValue = {
    user,
    session,
    currentUser: user,
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

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}