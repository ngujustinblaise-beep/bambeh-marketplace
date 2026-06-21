/**
 * ═══════════════════════════════════════════════════════════════════════
 * src/contexts/AuthProvider.tsx
 * Single Auth Source of Truth — Bambeh Marketplace
 *
 * SECURITY FIX: Removes the dual Firebase Auth + Supabase Auth system.
 * Firebase is kept for FCM push notifications ONLY (see FirebaseContext).
 * All authentication now goes through Supabase Auth exclusively.
 *
 * Usage in App.tsx:
 *   import { AuthProvider } from '@/contexts/AuthProvider';
 *
 *   <AuthProvider>
 *     <RouterProvider ... />
 *   </AuthProvider>
 *
 * Usage in any component:
 *   import { useAuth } from '@/hooks/useSupabaseAuth';
 *   const { user, isVendor, isAdmin, loading } = useAuth();
 *
 * © 2026 BAMBEH SARL / Bambeh. All rights reserved.
 * ═══════════════════════════════════════════════════════════════════════
 */

import React from 'react';
import { SupabaseAuthContext, useSupabaseAuth } from '@/hooks/useSupabaseAuth';

// ── Auth Provider ─────────────────────────────────────────────────────────────

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useSupabaseAuth();
  return (
    <SupabaseAuthContext.Provider value={auth}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};

// ── Async Protected Route Components ─────────────────────────────────────────
// These replace the synchronous isVendorAuthenticated() / isAdminAuthenticated()
// checks in App.tsx. They wait for the JWT to be verified before rendering.

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth }               from '@/hooks/useSupabaseAuth';

/**
 * Full-screen loading spinner shown while JWT is being verified.
 * Prevents layout flash / incorrect redirects before auth resolves.
 */
const AuthLoadingScreen: React.FC = () => (
  <div
    style={{
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'center',
      minHeight:       '100vh',
      backgroundColor: '#0f172a',
    }}
    aria-busy="true"
    aria-label="Verifying session…"
  >
    <div
      style={{
        width:        '48px',
        height:       '48px',
        border:       '4px solid rgba(20,184,166,0.2)',
        borderTop:    '4px solid #14b8a6',
        borderRadius: '50%',
        animation:    'spin 0.8s linear infinite',
      }}
    />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ── Vendor Protected Route ─────────────────────────────────────────────────────

interface ProtectedProps {
  children: React.ReactNode;
}

/**
 * Wraps vendor pages. Waits for server-side JWT verification.
 * Redirects to /vendor/signin if user is not a verified vendor.
 */
export const VendorProtectedRoute: React.FC<ProtectedProps> = ({ children }) => {
  const location                     = useLocation();
  const { user, isVendor, loading }  = useAuth();

  if (loading) return <AuthLoadingScreen />;

  if (!user || !isVendor) {
    const safe = location.pathname.startsWith('/vendor/')
      ? location.pathname
      : '/vendor/dashboard';
    localStorage.setItem('Bambeh_vendor_redirect', safe);
    return <Navigate to="/vendor/signin" replace />;
  }

  return <>{children}</>;
};

// ── Admin Protected Route ──────────────────────────────────────────────────────

/**
 * Wraps admin pages. Requires role === 'admin' in the database.
 * Both conditions must be true — isAdmin AND user must exist.
 */
export const AdminProtectedRoute: React.FC<ProtectedProps> = ({ children }) => {
  const location                    = useLocation();
  const { user, isAdmin, loading }  = useAuth();

  if (loading) return <AuthLoadingScreen />;

  if (!user || !isAdmin) {
    const safe = location.pathname.startsWith('/admin/')
      ? location.pathname
      : '/admin/dashboard';
    localStorage.setItem('Bambeh_admin_redirect', safe);
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

// ── User Protected Route ───────────────────────────────────────────────────────

/**
 * Wraps pages that require any authenticated user.
 */
export const UserProtectedRoute: React.FC<ProtectedProps> = ({ children }) => {
  const location          = useLocation();
  const { user, loading } = useAuth();

  if (loading) return <AuthLoadingScreen />;

  if (!user) {
    localStorage.setItem('Bambeh_user_redirect', location.pathname);
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
};


