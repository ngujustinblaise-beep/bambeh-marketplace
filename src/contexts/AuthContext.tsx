import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSupabaseAuth } from "@/providers/SupabaseAuthProvider";

export type AuthUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  role?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
};

export interface AuthContextValue {
  user: AuthUser | null;
  currentUser: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
  isVendor: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  register: (email: string, password: string, name?: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function mapUser(sessionUser: any): AuthUser | null {
  if (!sessionUser) return null;

  const metadata = sessionUser.user_metadata ?? {};
  return {
    id: sessionUser.id,
    email: sessionUser.email ?? null,
    name: metadata.full_name ?? metadata.name ?? metadata.display_name ?? null,
    role: metadata.role ?? null,
    phone: metadata.phone ?? null,
    avatarUrl: metadata.avatar_url ?? null,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: supabaseUser, loading: supabaseLoading, refreshSession } = useSupabaseAuth();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    setLoading(true);
    try {
      await refreshSession();
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user ?? null;
      setUser(mapUser(sessionUser));
    } finally {
      setLoading(false);
    }
  }, [refreshSession]);

  useEffect(() => {
    setUser(mapUser(supabaseUser));
    setLoading(supabaseLoading);
  }, [supabaseUser, supabaseLoading]);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(mapUser(session?.user ?? null));
      setLoading(false);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) {
      const { data } = await supabase.auth.getSession();
      setUser(mapUser(data.session?.user ?? null));
    }
    return { error: error?.message ?? null };
  }, []);

  const register = useCallback(async (email: string, password: string, name?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name ?? "",
          name: name ?? "",
        },
      },
    });

    if (!error) {
      const { data } = await supabase.auth.getSession();
      setUser(mapUser(data.session?.user ?? null));
    }

    return { error: error?.message ?? null };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const isAdmin = (user?.role ?? "").toLowerCase() === "admin";
    const isVendor = (user?.role ?? "").toLowerCase() === "vendor";

    return {
      user,
      currentUser: user,
      loading,
      isAdmin,
      isVendor,
      login,
      register,
      logout,
      refreshUser,
    };
  }, [user, loading, login, register, logout, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

export default AuthContext;
