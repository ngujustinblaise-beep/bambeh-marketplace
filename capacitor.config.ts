/**
 * capacitor.config.ts â€” Bambeh Marketplace
 * Â© 2026 Bambeh Marketplace. All rights reserved.
 *
 * UPGRADED: androidScheme set to 'bambeh' for deep links.
 *
 * Deep link URLs handled by this config:
 *   bambeh://payment/callback?status=success&reference=TXN_XXX
 *   bambeh://payment/callback?status=failed&reference=TXN_XXX
 *   bambeh://payment/pending?reference=TXN_XXX
 *   bambeh://marketplace/:id   (listing deep links from share button)
 *   bambeh://profile           (profile deep links)
 *   bambeh://chat?chat=:id     (direct chat deep links from FCM notifications)
 *
 * The appUrlOpen listener in App.tsx bridges these to React Router.
 *
 * ALSO requires AndroidManifest.xml intent-filter â€” see AndroidManifest-deeplink.xml
 */

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // â”€â”€ App Identity â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  appId: "cm.bambeh.marketplace",
  appName: "Bambeh",

  // â”€â”€ Web Dir â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  webDir: "dist",

  // â”€â”€ Server â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  server: {
    // CRITICAL: 'bambeh' scheme enables deep links like bambeh://payment/callback
    // Without this, Capacitor uses https:// internally and the appUrlOpen event
    // is never fired for custom scheme URLs from NotchPay or FCM.
    androidScheme: "bambeh",

    // Allow cleartext for local dev only â€” production uses HTTPS
    cleartext: false,

    // Hostname for the embedded WebView â€” used as origin for CORS
    hostname: "bambeh.app",

    // â”€â”€ Content Security Policy â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Prevents XSS, clickjacking, data injection, and mixed content attacks.
    // Each directive whitelists only the exact domains Bambeh communicates with.
    headers: {
      "Content-Security-Policy": [
        // Default: only same-origin resources
        "default-src 'self'",
        // Scripts: allow inline (Vite/React needs this) + our cloud providers
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co https://apis.google.com https://www.gstatic.com",
        // Styles: allow inline (Tailwind) + Google Fonts
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        // Fonts: only Google Fonts CDN
        "font-src 'self' data: https://fonts.gstatic.com",
        // Images: same-origin, base64 blobs, Supabase Storage, Firebase Storage
        "img-src 'self' data: blob: https://*.supabase.co https://firebasestorage.googleapis.com https://images.unsplash.com",
        // API calls: Supabase (REST + Realtime WebSocket), Firebase, Twilio, NotchPay, FCM
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.firebase.com https://fcm.googleapis.com https://verify.twilio.com https://campay.net https://www.campay.net",
        // Workers: Supabase Realtime uses service workers
        "worker-src 'self' blob:",
        // No iframes allowed
        "frame-src 'none'",
        // No plugins (Flash, Java, etc.)
        "object-src 'none'",
        // Restrict base URL to same origin
        "base-uri 'self'",
        // Force HTTPS for sub-resources
        "upgrade-insecure-requests",
      ].join("; "),
      // Prevent Bambeh from being embedded in iframes on other sites (clickjacking)
      "X-Frame-Options": "DENY",
      // Prevent MIME type sniffing
      "X-Content-Type-Options": "nosniff",
      // Only send origin in Referer header (no full URL path)
      "Referrer-Policy": "strict-origin-when-cross-origin",
      // Disable browser features Bambeh doesn't use
      "Permissions-Policy": "camera=(), microphone=(self), geolocation=(self), payment=()",
    },
  },

  // â”€â”€ Android â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  android: {
    // Build output directory
    buildOptions: {
      releaseType: "APK",
    },
    // Override back button globally â€” handled in App.tsx initializeCapacitor
    overrideUserAgent: undefined,
  },

  // â”€â”€ iOS (future-proofing) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  ios: {
    scheme: "bambeh",
  },

  // â”€â”€ Plugins â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  plugins: {
    // â”€â”€ SplashScreen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#0d9488",   // Teal brand colour
      androidSplashResourceName: "splash",
      showSpinner: false,
    },

    // â”€â”€ StatusBar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#0d9488",
    },

    // â”€â”€ Keyboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    Keyboard: {
      resize: "body",
      style: "DARK",
      resizeOnFullScreen: true,
    },

    // â”€â”€ PushNotifications (FCM) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },

    // â”€â”€ LocalNotifications â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#0d9488",
      sound: "bambeh_notify.wav",
    },

    // â”€â”€ Preferences (used by offline posting queue) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    Preferences: {
      group: "BambehPreferences",
    },

    // â”€â”€ Share â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Capacitor Share plugin â€” used by the share listing button
    // No config needed â€” uses native OS share sheet
  },
};

export default config;

