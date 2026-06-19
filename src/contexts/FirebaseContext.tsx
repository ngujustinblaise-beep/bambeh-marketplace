/**
 * src/contexts/FirebaseContext.tsx
 * Firebase FCM Context â€” Bambeh Marketplace
 *
 * Firebase Auth is REMOVED â€” Supabase Auth is the only auth system.
 * Firebase is kept for: FCM push notifications + Firestore chat + Storage.
 *
 * Components must NEVER import firebase.ts directly.
 * Use useFirebase() hook instead â€” resolves the Vite bundle split warning.
 */

import React, { useEffect, 
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import type { Firestore }       from 'firebase/firestore';
import type { Messaging }       from 'firebase/messaging';
import type { FirebaseStorage } from 'firebase/storage';
import { supabase }             from '@/lib/supabase';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            as string,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN         as string,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID          as string,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET      as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID              as string,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID      as string,
};

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY as string;

interface FirebaseContextValue {
  db:          Firestore | null;
  messaging:   Messaging | null;
  storage:     FirebaseStorage | null;
  fcmToken:    string | null;
  requestNotificationPermission: () => Promise<string | null>;
  loading: boolean;
  error:   Error | null;
}

const FirebaseContext = createContext<FirebaseContextValue>({
  db:          null,
  messaging:   null,
  storage:     null,
  fcmToken:    null,
  requestNotificationPermission: async () => null,
  loading:     true,
  error:       null,
});

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [db,        setDb]        = useState<Firestore | null>(null);
  const [messaging, setMessaging] = useState<Messaging | null>(null);
  const [storage,   setStorage]   = useState<FirebaseStorage | null>(null);
  const [fcmToken,  setFcmToken]  = useState<string | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<Error | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    (async () => {
      try {
        const [
          { initializeApp, getApps, getApp },
          { getFirestore },
          { getStorage },
        ] = await Promise.all([
          import('firebase/app'),
          import('firebase/firestore'),
          import('firebase/storage'),
        ]);

        const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        setDb(getFirestore(app));
        setStorage(getStorage(app));

        if ('serviceWorker' in navigator) {
          const { getMessaging, isSupported } = await import('firebase/messaging');
          const supported = await isSupported();
          if (supported) {
            setMessaging(getMessaging(app));
          }
        }
      } catch (err) {
        console.error('[Firebase] Initialization failed:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const requestNotificationPermission = useCallback(async (): Promise<string | null> => {
    try {
      if (!messaging) return null;
      if (Notification.permission === 'denied') return null;
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return null;
      const { getToken } = await import('firebase/messaging');
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      if (!token) return null;
      setFcmToken(token);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('users').update({ fcm_token: token }).eq('id', user.id);
      }
      return token;
    } catch (err) {
      console.warn('[Firebase] FCM token registration failed:', err);
      return null;
    }
  }, [messaging]);

  return (
    <FirebaseContext.Provider
      value={{ db, messaging, storage, fcmToken, requestNotificationPermission, loading, error }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export function useFirebase(): FirebaseContextValue {
  return useContext(FirebaseContext);
}


