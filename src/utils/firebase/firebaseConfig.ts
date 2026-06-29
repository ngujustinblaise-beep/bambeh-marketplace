/**
 * src/utils/firebase/firebaseConfig.ts � Bambeh Marketplace
 * ? FIXED: getApps() guard + safe AppCheck + initializeFirebaseAppCheck export
 */
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import type { AppCheck } from "firebase/app-check";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// --- Firebase config (from .env) ---------------------------------------------
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// --- ? Safe singleton init (fixes app/duplicate-app crash) ------------------
const app: FirebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// --- Firebase services -------------------------------------------------------
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

// --- AppCheck state (module-level singleton) ---------------------------------
let appCheckInstance: AppCheck | null = null;

/**
 * initializeFirebaseAppCheck
 *
 * Called by SecurityInitializer.tsx on app startup.
 * Safe to call multiple times � only initializes AppCheck once.
 *
 * @param recaptchaSiteKey  Your reCAPTCHA v3 site key.
 *                          Falls back to VITE_RECAPTCHA_SITE_KEY env var.
 */
export function initializeFirebaseAppCheck(
  recaptchaSiteKey?: string,
): AppCheck | null {
  // Already initialized � return the existing instance
  if (appCheckInstance) return appCheckInstance;

  const siteKey = recaptchaSiteKey ?? import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  // Skip if no site key or not running in a browser
  if (!siteKey || typeof window === "undefined") return null;

  try {
    appCheckInstance = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(siteKey),
      isTokenAutoRefreshEnabled: true,
    });
    return appCheckInstance;
  } catch (e) {
    // AppCheck may already be initialized by another code path � safe to ignore
    console.warn("[Bambeh] AppCheck init skipped:", e);
    return null;
  }
}

export { app, appCheckInstance as appCheck };
export default app;

// Alias for Firestore � used by paymentService.ts
export const firestore = db;

// API base URL � used by api.service.ts and exchange services
export const API_BASE_URL: string = (import.meta.env.VITE_API_BASE_URL as string) ?? '';

// API endpoints map � used by api.service.ts
export const API_ENDPOINTS = {
  auth: {
    login:          `${API_BASE_URL}/login`,
    register:       `${API_BASE_URL}/auth/register`,
    logout:         `${API_BASE_URL}/auth/logout`,
    refresh:        `${API_BASE_URL}/auth/refresh`,
    forgotPassword: `${API_BASE_URL}/auth/forgot-password`,
    resetPassword:  `${API_BASE_URL}/auth/reset-password`,
    verifyEmail:    `${API_BASE_URL}/auth/verify-email`,
    profile:        `${API_BASE_URL}/auth/profile`,
  },
  marketplace: {
    items:   `${API_BASE_URL}/marketplace`,
    myItems: `${API_BASE_URL}/marketplace/my-items`,
  },
  jobs: {
    list:   `${API_BASE_URL}/jobs`,
    myJobs: `${API_BASE_URL}/jobs/my-jobs`,
  },
  services: {
    list:       `${API_BASE_URL}/services`,
    myServices: `${API_BASE_URL}/services/my-services`,
  },
  rentals: {
    list:      `${API_BASE_URL}/rentals`,
    myRentals: `${API_BASE_URL}/rentals/my-rentals`,
  },
  vendors: {
    profile:  `${API_BASE_URL}/vendors/profile`,
    earnings: `${API_BASE_URL}/vendors/earnings`,
  },
  payments: {
    initiate: `${API_BASE_URL}/payments/initiate`,
    verify:   `${API_BASE_URL}/payments/verify`,
    webhook:  `${API_BASE_URL}/payments/webhook`,
  },
};

