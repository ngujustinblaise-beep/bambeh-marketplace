/**
 * SECURITY INITIALIZER
 * FILE LOCATION: src/components/security/SecurityInitializer.tsx
 */

import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import sessionManager, { SESSION_KEYS } from '@/utils/auth/sessionManager';
import { initializeFirebaseAppCheck } from '@/utils/firebase/firebaseConfig';

const SESSION_CHECK_INTERVAL_MS = 60_000;

const checkAllSessionExpiry = (): 'user' | 'vendor' | 'admin' | null => {
  for (const key of SESSION_KEYS.admin)  { const r = sessionManager.checkKey(key); if (r.expired) return 'admin';  }
  for (const key of SESSION_KEYS.vendor) { const r = sessionManager.checkKey(key); if (r.expired) return 'vendor'; }
  for (const key of SESSION_KEYS.user)   { const r = sessionManager.checkKey(key); if (r.expired) return 'user';   }
  return null;
};

const SESSION_EXPIRED_MESSAGES: Record<string, string> = {
  admin:  'Votre session administrateur a expiré (1 heure). Reconnectez-vous.\nYour admin session expired (1 hour). Please log in again.',
  vendor: 'Votre session vendeur a expiré (24 heures). Reconnectez-vous.\nYour vendor session expired (24 hours). Please log in again.',
  user:   'Votre session a expiré. Reconnectez-vous.\nYour session expired. Please log in again.',
};

const REDIRECT_PATHS: Record<string, string> = {
  admin: '/admin/login', vendor: '/vendor/signin', user: '/login',
};

const SecurityInitializer: React.FC = () => {
  const navigate       = useNavigate();
  const location       = useLocation();
  const intervalRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    sessionManager.migrateOldSessions();
    initializeFirebaseAppCheck();
    if (import.meta.env.MODE === 'development') {
      console.log('🔒 SecurityInitializer: All security systems active');
    }
    intervalRef.current = setInterval(() => {
      const expiredType = checkAllSessionExpiry();
      if (!expiredType) return;
      const isAdminRoute  = location.pathname.startsWith('/admin');
      const isVendorRoute = location.pathname.startsWith('/vendor');
      const isProtectedUserRoute = !isAdminRoute && !isVendorRoute &&
        location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/register';
      const shouldRedirect =
        (expiredType === 'admin'  && isAdminRoute) ||
        (expiredType === 'vendor' && isVendorRoute) ||
        (expiredType === 'user'   && isProtectedUserRoute);
      if (shouldRedirect) {
        const message    = SESSION_EXPIRED_MESSAGES[expiredType];
        const redirectTo = REDIRECT_PATHS[expiredType];
        if (import.meta.env.MODE === 'development') { console.warn(`⏰ Session expired: ${expiredType}`); }
        window.dispatchEvent(new CustomEvent('bambeh:session-expired', { detail: { type: expiredType, message, redirectTo } }));
        navigate(redirectTo, { replace: true, state: { sessionExpired: true, expiredType } });
      }
    }, SESSION_CHECK_INTERVAL_MS);
    return () => {
      if (intervalRef.current) { clearInterval(intervalRef.current); }
    };
  }, []);

  return null;
};

export default SecurityInitializer;



