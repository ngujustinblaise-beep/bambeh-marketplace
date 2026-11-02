/**
 * capacitor.config.ts — Bambeh Marketplace
 * © 2026 Bambeh Marketplace. All rights reserved.
 *
 * BAMBEH_DEPLOY_TOKEN__CAPACITORCONFIG_FIX175_CLEAN
 *
 * FIX175 — THE "EVERYTHING FAILED TO FETCH" REPAIR
 * ─────────────────────────────────────────────────
 * A previous edit set `androidScheme: "bambeh"` (+ hostname "bambeh.app")
 * believing it was needed for deep links. It is not — and it is destructive:
 *
 *  1. Android WebView pages served from a CUSTOM scheme are not allowed to
 *     make cross-origin network requests. Every fetch() to Supabase dies
 *     with "TypeError: Failed to fetch" — which is exactly why photo
 *     uploads, chat creation, posting rentals, and every other save
 *     suddenly failed in the installed APK all at once.
 *  2. Changing the scheme changes the WebView ORIGIN, which wipes
 *     localStorage — the Supabase session vanishes, so the app behaves
 *     half logged-out (hidden header/footer, missing gated buttons).
 *
 * Deep links (bambeh://payment/callback, bambeh://chat, etc.) NEVER needed
 * this setting. They are handled by the AndroidManifest.xml intent-filter
 * (see AndroidManifest-deeplink.xml) + the appUrlOpen listener in App.tsx.
 * Those keep working exactly as before with androidScheme back on "https".
 *
 * The in-app CSP header block was also removed: web security headers belong
 * in Netlify (_headers / netlify.toml) for bambeh.com, not inside the APK,
 * where a single wrong directive silently kills network calls.
 *
 * NOTE after installing the rebuilt APK: you will need to LOG IN again once.
 * That is expected (the origin moved back), not a new bug.
 */

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // ── App Identity ─────────────────────────────────────────────────────────
  appId: "cm.bambeh.marketplace",
  appName: "Bambeh",

  // ── Web Dir ──────────────────────────────────────────────────────────────
  webDir: "dist",

  // ── Server ───────────────────────────────────────────────────────────────
  server: {
    // FIX175: MUST be "https". Custom schemes block all fetch() in the
    // Android WebView. Deep links do NOT depend on this value.
    androidScheme: "https",

    // Production is HTTPS-only; no cleartext.
    cleartext: false,
  },

  // ── Android ──────────────────────────────────────────────────────────────
  android: {
    buildOptions: {
      releaseType: "APK",
    },
    // Back button handled globally in App.tsx initializeCapacitor
    overrideUserAgent: undefined,
  },

  // ── iOS (future-proofing) ────────────────────────────────────────────────
  ios: {
    scheme: "bambeh",
  },

  // ── Plugins ──────────────────────────────────────────────────────────────
  plugins: {
    // ── SplashScreen ───────────────────────────────────────────────────────
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#0d9488",   // Teal brand colour
      androidSplashResourceName: "splash",
      showSpinner: false,
    },

    // ── StatusBar ──────────────────────────────────────────────────────────
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#0d9488",
    },

    // ── Keyboard ───────────────────────────────────────────────────────────
    Keyboard: {
      resize: "body",
      style: "DARK",
      resizeOnFullScreen: true,
    },

    // ── PushNotifications (FCM) ────────────────────────────────────────────
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },

    // ── LocalNotifications ─────────────────────────────────────────────────
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#0d9488",
      sound: "bambeh_notify.wav",
    },

    // ── Preferences (used by offline posting queue) ────────────────────────
    Preferences: {
      group: "BambehPreferences",
    },

    // FIX981 - @capgo/capacitor-updater 8.54.0 (installed by FIX982): the Android app keeps itself up to date from
    // app.bambeh.com (src/lib/appUpdate.ts, FIX977). Bambeh decides when to download and when to switch; the updater
    // asks nobody else: no automatic checks, its statistics, channels and update server are switched off. A version
    // that does not say it opened within 20 seconds is thrown away (the phone goes back to the last one that worked).
    // A new APK starts again from the version inside it.
    CapacitorUpdater: {
      autoUpdate: false,
      appReadyTimeout: 20000,
      responseTimeout: 30,
      autoDeleteFailed: true,
      autoDeletePrevious: true,
      resetWhenUpdate: true,
      updateUrl: "",
      statsUrl: "",
      channelUrl: "",
      shakeMenu: false,
      allowModifyUrl: false,
    },

    // ── Share ──────────────────────────────────────────────────────────────
    // Capacitor Share plugin — native OS share sheet, no config needed.
  },
};

export default config;
// BAMBEH_END_TOKEN__CAPACITORCONFIG_FIX175__COMPLETE
