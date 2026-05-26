/**
 * capacitor.config.ts — Bambeh Marketplace
 * © 2026 Bambeh Marketplace. All rights reserved.
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
 * ALSO requires AndroidManifest.xml intent-filter — see AndroidManifest-deeplink.xml
 */

import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  // ── App Identity ──────────────────────────────────────────────────────────
  appId: "cm.bambeh.marketplace",
  appName: "Bambeh",

  // ── Web Dir ───────────────────────────────────────────────────────────────
  webDir: "dist",

  // ── Server ────────────────────────────────────────────────────────────────
  server: {
    // CRITICAL: 'bambeh' scheme enables deep links like bambeh://payment/callback
    // Without this, Capacitor uses https:// internally and the appUrlOpen event
    // is never fired for custom scheme URLs from NotchPay or FCM.
    androidScheme: "bambeh",

    // Allow cleartext for local dev only — production uses HTTPS
    cleartext: false,

    // Hostname for the embedded WebView — used as origin for CORS
    hostname: "bambeh.app",

    // ── Content Security Policy ──────────────────────────────────────────────
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
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.firebase.com https://fcm.googleapis.com https://verify.twilio.com https://api.notchpay.co https://sandbox.notchpay.co",
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

  // ── Android ───────────────────────────────────────────────────────────────
  android: {
    // Build output directory
    buildOptions: {
      releaseType: "APK",
    },
    // Override back button globally — handled in App.tsx initializeCapacitor
    overrideUserAgent: undefined,
  },

  // ── iOS (future-proofing) ─────────────────────────────────────────────────
  ios: {
    scheme: "bambeh",
  },

  // ── Plugins ───────────────────────────────────────────────────────────────
  plugins: {
    // ── SplashScreen ────────────────────────────────────────────────────────
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#0d9488",   // Teal brand colour
      androidSplashResourceName: "splash",
      showSpinner: false,
    },

    // ── StatusBar ───────────────────────────────────────────────────────────
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#0d9488",
    },

    // ── Keyboard ────────────────────────────────────────────────────────────
    Keyboard: {
      resize: "body",
      style: "DARK",
      resizeOnFullScreen: true,
    },

    // ── PushNotifications (FCM) ──────────────────────────────────────────────
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },

    // ── LocalNotifications ──────────────────────────────────────────────────
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#0d9488",
      sound: "bambeh_notify.wav",
    },

    // ── Preferences (used by offline posting queue) ──────────────────────────
    Preferences: {
      group: "BambehPreferences",
    },

    // ── Share ────────────────────────────────────────────────────────────────
    // Capacitor Share plugin — used by the share listing button
    // No config needed — uses native OS share sheet
  },
};

export default config;
