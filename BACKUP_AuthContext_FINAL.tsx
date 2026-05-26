/**
 * AUTHCONTEXT.TSX - AUTHENTICATION CONTEXT
 * 
 * Provides authentication functionality with master test accounts
 * 
 * Master Accounts:
 * 1. Username: ngu | Password: 0000 | Tier: Basic (can upgrade to Tier 2)
 * 2. Username: zerm | Password: 1234 | Tier: Gold (can change to all tiers)
 * 
 * Both accounts have full privileges:
 * - Upload pictures
 * - Post items, houses, services, jobs
 * - Navigate all sections
 * - Sign in/out
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

// User interface
export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  tier: 'Basic' | 'Premium' | 'Gold';
  canUpload: boolean;
  canPostJobs: boolean;
  canPostItems: boolean;
  canPostServices: boolean;
  canPostProperties: boolean;
  canChangeTiers: string[]; // Array of tiers this user can switch to
  photoURL?: string;
  createdAt: string;
}

// Auth context interface
interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  changeTier: (newTier: 'Basic' | 'Premium' | 'Gold') => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
}

// Master accounts database
const MASTER_ACCOUNTS = {
  ngu: {
    id: 'master-001',
    username: 'ngu',
    password: '0000',
    email: 'ngu@bambe.cm',
    displayName: 'Ngu (Master Account)',
    tier: 'Basic' as const,
    canUpload: true,
    canPostJobs: true,
    canPostItems: true,
    canPostServices: true,
    canPostProperties: true,
    canChangeTiers: ['Basic', 'Premium'], // Can only upgrade to Tier 2 (Premium)
    photoURL: 'https://ui-avatars.com/api/?name=Ngu&background=0d9488&color=fff',
    createdAt: '2024-01-01T00:00:00Z'
  },
  zerm: {
    id: 'master-002',
    username: 'zerm',
    password: '1234',
    email: 'zerm@bambe.cm',
    displayName: 'Zerm (Master Account)',
    tier: 'Gold' as const,
    canUpload: true,
    canPostJobs: true,
    canPostItems: true,
    canPostServices: true,
    canPostProperties: true,
    canChangeTiers: ['Basic', 'Premium', 'Gold'], // Can change to all tiers
    photoURL: 'https://ui-avatars.com/api/?name=Zerm&background=f59e0b&color=fff',
    createdAt: '2024-01-01T00:00:00Z'
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser,
    isAuthenticated: !!currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = () => {
      try {
        const storedUser = localStorage.getItem('bambe_current_user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Error loading session:', error);
        localStorage.removeItem('bambe_current_user');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  /**
   * Login function
   * Validates credentials against master accounts
   */
  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Convert username to lowercase for case-insensitive comparison
      const usernameKey = username.toLowerCase() as keyof typeof MASTER_ACCOUNTS;

      // Check if username exists
      if (!MASTER_ACCOUNTS[usernameKey]) {
        return {
          success: false,
          error: 'Invalid username or password'
        };
      }

      // Get account
      const account = MASTER_ACCOUNTS[usernameKey];

      // Verify password
      if (account.password !== password) {
        return {
          success: false,
          error: 'Invalid username or password'
        };
      }

      // Create user object (excluding password)
      const { password: _, ...userWithoutPassword } = account;
      const user: User = userWithoutPassword;

      // Save to state and localStorage
      setCurrentUser(user);
      localStorage.setItem('bambe_current_user', JSON.stringify(user));

      // Log successful login
      console.log(`✅ User ${user.username} logged in successfully`);
      console.log(`Tier: ${user.tier}`);
      console.log(`Available tiers: ${user.canChangeTiers.join(', ')}`);

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'An error occurred during login. Please try again.'
      };
    }
  };

  /**
   * Logout function
   * Clears user session
   */
  const logout = async (): Promise<void> => {
    try {
      console.log(`👋 User ${currentUser?.username} logged out`);
      setCurrentUser(null);
      localStorage.removeItem('bambe_current_user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  /**
   * Change tier function
   * Allows users to switch between allowed tiers
   */
  const changeTier = async (newTier: 'Basic' | 'Premium' | 'Gold'): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!currentUser) {
        return {
          success: false,
          error: 'No user logged in'
        };
      }

      // Check if user can change to this tier
      if (!currentUser.canChangeTiers.includes(newTier)) {
        return {
          success: false,
          error: `You cannot change to ${newTier} tier. Available tiers: ${currentUser.canChangeTiers.join(', ')}`
        };
      }

      // Update user tier
      const updatedUser = { ...currentUser,
    isAuthenticated: !!currentUser, tier: newTier };
      setCurrentUser(updatedUser);
      localStorage.setItem('bambe_current_user', JSON.stringify(updatedUser));

      console.log(`✅ Tier changed to ${newTier} for user ${currentUser.username}`);

      return { success: true };
    } catch (error) {
      console.error('Change tier error:', error);
      return {
        success: false,
        error: 'An error occurred while changing tier. Please try again.'
      };
    }
  };

  /**
   * Update profile function
   * Allows updating user profile information
   */
  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    try {
      if (!currentUser) {
        throw new Error('No user logged in');
      }

      const updatedUser = { ...currentUser,
    isAuthenticated: !!currentUser, ...updates };
      setCurrentUser(updatedUser);
      localStorage.setItem('bambe_current_user', JSON.stringify(updatedUser));

      console.log(`✅ Profile updated for user ${currentUser.username}`);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    currentUser,
    isAuthenticated: !!currentUser,
    loading,
    login,
    logout,
    changeTier,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}
  isAuthenticated: !!currentUser,
    isAuthenticated: !!currentUser,
  </AuthContext.Provider>;
}


