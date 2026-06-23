/**
 * BAMBEH - AUTH STATE HOOK
 * Custom hook for managing authentication state
 */

import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { auth } from "@/utils/firebase/firebaseConfig";
import { authService, UserProfile } from "../services/auth";

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useAuthState = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const profile = await authService.getUserProfile(
            (user as any).uid || (user as any).id,
          );
          setAuthState({
            user,
            profile,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          setAuthState({
            user,
            profile: null,
            isAuthenticated: true,
            isLoading: false,
            error: error.message,
          });
        }
      } else {
        setAuthState({
          user: null,
          profile: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    }); // FIX: closing ); for onAuthStateChanged callback was missing

    return () => unsubscribe();
  }, []);

  return authState;
};

export default useAuthState;




