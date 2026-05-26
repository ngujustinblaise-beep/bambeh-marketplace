/**
 * AUTH STORE
 * Zustand store for Supabase Auth state
 * FILE LOCATION: src/store/authStore.ts
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: false,
      isInitialized: false,

      setUser: (user) => set({ user }),

      setSession: (session) => set({ session, user: session?.user ?? null }),

      signOut: async () => {
        set({ isLoading: true });
        try {
          await supabase.auth.signOut();
          set({ user: null, session: null });
        } catch (error) {
          console.error('Sign out error:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      initialize: async () => {
        if (get().isInitialized) return;
        set({ isLoading: true });
        try {
          // Get current session from Supabase
          const { data: { session } } = await supabase.auth.getSession();
          set({
            session,
            user: session?.user ?? null,
            isInitialized: true,
          });

          // Listen for auth state changes (login, logout, token refresh)
          supabase.auth.onAuthStateChange((_event, session) => {
            set({
              session,
              user: session?.user ?? null,
            });
          });
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({ isInitialized: true });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'bambeh-auth',
      // Only persist non-sensitive fields; session is re-hydrated from Supabase
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);
