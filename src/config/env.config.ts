const env = {
  supabaseUrl: (import.meta.env.VITE_SUPABASE_URL as string) ?? "",
  supabaseAnonKey: (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ?? "",
  firebaseApiKey: (import.meta.env.VITE_FIREBASE_API_KEY as string) ?? "",
  firebaseAuthDomain:
    (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string) ?? "",
  firebaseProjectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID as string) ?? "",
  firebaseStorageBucket:
    (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string) ?? "",
  firebaseMessagingSenderId:
    (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) ?? "",
  firebaseAppId: (import.meta.env.VITE_FIREBASE_APP_ID as string) ?? "",
  fcmVapidKey: (import.meta.env.VITE_FCM_VAPID_KEY as string) ?? "",
  notchpayPublicKey: (import.meta.env.VITE_NOTCHPAY_PUBLIC_KEY as string) ?? "",
  appVersion: (import.meta.env.VITE_APP_VERSION as string) ?? "1.0.0",
  isDev: import.meta.env.DEV as boolean,
  isProd: import.meta.env.PROD as boolean,
  ga4Id: (import.meta.env.VITE_GA4_MEASUREMENT_ID as string) ?? "",
  sentryDsn: (import.meta.env.VITE_SENTRY_DSN as string) ?? "",
  API: {
    baseUrl: (import.meta.env.VITE_API_BASE_URL as string) ?? "",
    BASE_URL: (import.meta.env.VITE_API_BASE_URL as string) ?? "",
    notchpayBase: "https://api.notchpay.co",
    supabaseBase: (import.meta.env.VITE_SUPABASE_URL as string) ?? "",
  },
} as const;

export default env;
export { env };

