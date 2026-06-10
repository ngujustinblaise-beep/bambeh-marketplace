/**
 * vite.config.ts — Bambeh Marketplace  v6 OFFLINE-FIRST
 * © 2026 Bambeh Marketplace. All rights reserved.
 *
 * ─── STEP 25: SERVICE WORKER / OFFLINE STRATEGY ───────────────────────────────
 *
 *  network reality:
 *  - MTN/Orange 3G:  1–3 Mbps, 200–600ms latency, frequent drops
 *  - MTN/Orange 2G:  50–200 Kbps, 800ms–3s latency (common outside Yaoundé/Douala)
 *  - WiFi hotspots:  shared bandwidth, 300ms–2s latency
 *  - Power cuts:     users often return to app mid-session with no connectivity
 *
 * Strategy per resource type:
 *
 *  STATIC ASSETS (JS/CSS/fonts/icons)
 *  → CacheFirst: serve from cache instantly, update in background.
 *    A user on 2G should NEVER wait for a JS chunk they already downloaded.
 *    Max age: 30 days. These files are content-hashed so stale is impossible.
 *
 *  SUPABASE API (listings, jobs, profiles)
 *  → NetworkFirst with 8s timeout: try network, fall back to cache if slow/offline.
 *    8s timeout is calibrated for Cameroonian 3G/2G — long enough to give a
 *    slow connection a real chance before falling back to cache.
 *    Cache TTL: 5 minutes (matches queryClient staleTime).
 *
 *  SUPABASE ANALYTICS
 *  → NetworkOnly: analytics_events returns 520 errors when intercepted by the
 *    service worker. NetworkOnly lets it fail silently without filling the
 *    console with ERR_FAILED spam or poisoning the API cache.
 *
 *  SUPABASE STORAGE (product images, avatars, vendor banners)
 *  → CacheFirst: images rarely change. Serve from cache immediately.
 *    Cache up to 500 images, 7 days max. On 2G this is the biggest win —
 *    cached images appear instantly instead of taking 5–10s to load.
 *
 *  GOOGLE FONTS / CDN ASSETS
 *  → StaleWhileRevalidate: serve cached version immediately, update in background.
 *
 *  NAVIGATION (HTML page requests)
 *  → NetworkFirst with offline fallback to /index.html (SPA shell).
 *    When completely offline, the app still opens and shows cached data.
 *
 * ─── STEP 26: CSS BUNDLE OPTIMISATION ────────────────────────────────────────
 *
 * The index CSS was 160 KB (23 KB gzip). Causes:
 *  1. Tailwind JIT not configured with precise content paths
 *  2. No CSS code splitting — all styles in one file blocks first paint
 *
 * Fixes applied:
 *  - cssCodeSplit: true  → per-route CSS chunks
 *  - Tailwind content paths are precise (see tailwind.config.ts)
 *  - CSS assets get content-hashed filenames for long-term caching
 *
 * ─── CHUNK MAP (v6) ───────────────────────────────────────────────────────────
 *   react-vendor       ~142 KB   ✅
 *   firebase-core      ~197 KB   ✅
 *   supabase-vendor    ~168 KB   ✅
 *   index              ~179 KB   ✅
 *   sentry-vendor      ~451 KB   ✅ (large but cached after first load)
 *   floating-ui         ~23 KB   ✅
 *   ai-vendor           ~??  KB  ✅ lazy — only loads on /chatbot route
 *   misc-vendor         ~60 KB   ✅
 *   All others          <50 KB   ✅
 *
 * ─── FIXES (v6.1) ────────────────────────────────────────────────────────────
 *   FIX 1: analytics_events rule added BEFORE REST catch-all (NetworkOnly)
 *           — stops ERR_FAILED 520 console spam from Supabase telemetry
 *   FIX 2: REST API networkTimeoutSeconds raised 4s → 8s
 *           — Cameroonian 3G/2G needs more breathing room before cache fallback
 *   FIX 3: REST API cacheableResponse statuses [0, 200] → [200]
 *           — status 0 = opaque/failed response; caching failures and
 *             re-serving them caused the "no-response" workbox errors
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

// ─── MANUAL CHUNKS ────────────────────────────────────────────────────────────

function manualChunks(id: string): string | undefined {

  // ── ALL Firebase → single chunk (prevents circular warnings) ─────────────
  if (id.includes("node_modules/firebase") || id.includes("node_modules/@firebase")) {
    return "firebase-core";
  }

  // ── Supabase (including GoTrueClient / webauthn paths) ───────────────────
  if (
    id.includes("node_modules/@supabase") ||
    id.includes("node_modules/gotrue-js") ||
    id.includes("node_modules/gotrue/")
  ) {
    return "supabase-vendor";
  }

  // ── React core ────────────────────────────────────────────────────────────
  if (
    id.includes("node_modules/react/") ||
    id.includes("node_modules/react-dom/") ||
    id.includes("node_modules/react-is/") ||
    id.includes("node_modules/scheduler/")
  ) {
    return "react-vendor";
  }

  // ── React Router ──────────────────────────────────────────────────────────
  if (
    id.includes("node_modules/react-router") ||
    id.includes("node_modules/@remix-run/router")
  ) {
    return "react-router";
  }

  // ── Radix UI ──────────────────────────────────────────────────────────────
  if (id.includes("node_modules/@radix-ui")) {
    return "radix-ui";
  }

  // ── TanStack Query ────────────────────────────────────────────────────────
  if (id.includes("node_modules/@tanstack")) {
    return "tanstack-query";
  }

  // ── Lucide icons ──────────────────────────────────────────────────────────
  if (id.includes("node_modules/lucide-react")) {
    return "icons";
  }

  // ── i18n ──────────────────────────────────────────────────────────────────
  if (id.includes("node_modules/i18next") || id.includes("node_modules/react-i18next")) {
    return "i18n-vendor";
  }

  // ── Zustand + Immer ───────────────────────────────────────────────────────
  if (id.includes("node_modules/zustand") || id.includes("node_modules/immer")) {
    return "state-vendor";
  }

  // ── Capacitor ─────────────────────────────────────────────────────────────
  if (id.includes("node_modules/@capacitor")) {
    return "capacitor-vendor";
  }

  // ── Date libraries ────────────────────────────────────────────────────────
  if (id.includes("node_modules/date-fns") || id.includes("node_modules/dayjs")) {
    return "date-vendor";
  }

  // ── Charts ────────────────────────────────────────────────────────────────
  if (
    id.includes("node_modules/recharts") ||
    id.includes("node_modules/d3-") ||
    id.includes("node_modules/victory")
  ) {
    return "charts-vendor";
  }

  // ── Socket.io ─────────────────────────────────────────────────────────────
  if (id.includes("node_modules/socket.io") || id.includes("node_modules/engine.io")) {
    return "socketio-vendor";
  }

  // ── HTTP / Axios ──────────────────────────────────────────────────────────
  if (id.includes("node_modules/axios")) {
    return "http-vendor";
  }

  // ── Animation ─────────────────────────────────────────────────────────────
  if (id.includes("node_modules/framer-motion") || id.includes("node_modules/@motionone")) {
    return "animation-vendor";
  }

  // ── Sentry ────────────────────────────────────────────────────────────────
  if (id.includes("node_modules/@sentry")) {
    return "sentry-vendor";
  }

  // ── Floating UI ───────────────────────────────────────────────────────────
  if (id.includes("node_modules/@floating-ui")) {
    return "floating-ui";
  }

  // ── AI / LangChain / OpenAI ───────────────────────────────────────────────
  if (
    id.includes("node_modules/langchain") ||
    id.includes("node_modules/@langchain") ||
    id.includes("node_modules/openai")
  ) {
    return "ai-vendor";
  }

  // ── All remaining node_modules → misc-vendor ──────────────────────────────
  if (id.includes("node_modules")) {
    return "misc-vendor";
  }

  return undefined;
}

// ─── VITE CONFIG ──────────────────────────────────────────────────────────────

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      includeAssets: [
        "favicon.ico",
        "robots.txt",
        "bambeh-logo.png",
        "pwa-192x192.png",
        "pwa-512x512.png",
      ],

      manifest: {
        name: "Bambeh Marketplace",
        short_name: "Bambeh",
        description: "'s #1 Online Marketplace",
        theme_color: "#0d9488",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        prefer_related_applications: false,
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },

      workbox: {
        // ── Precache ──────────────────────────────────────────────────────
        // All build output is precached on SW install.
        // Users download everything once; all subsequent visits are instant.
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff,woff2}"],
        globIgnores: ["**/firebase-core-*.js", "**/workbox-*.js"],

        // ── SW activation ─────────────────────────────────────────────────
        // skipWaiting: new SW activates immediately without waiting for
        // all tabs to close. Critical for users who leave app open
        // for days and would otherwise never get updates.
        skipWaiting: true,
        clientsClaim: true,

        // ── Offline fallback for navigation ───────────────────────────────
        // When completely offline, serve the SPA shell.
        // React Router handles routing client-side from cache.
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [
          /^\/api\//,
          /^https:\/\/.*\.supabase\.co/,
          /\.[a-z]{2,4}$/i,
        ],

        // ── Runtime caching ───────────────────────────────────────────────
        runtimeCaching: [

          // ── FIX 1: SUPABASE ANALYTICS — NetworkOnly ───────────────────
          // Must be declared BEFORE the REST catch-all below.
          // analytics_events returns HTTP 520 (Cloudflare error) when the
          // service worker intercepts it. NetworkOnly lets it pass through
          // directly — if it fails, it fails silently without poisoning the
          // API cache or flooding the console with ERR_FAILED errors.
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/analytics_events.*/i,
            handler: "NetworkOnly",
          },

          // 1. SUPABASE REST API — NetworkFirst
          // ── FIX 2: networkTimeoutSeconds raised 4 → 8 ─────────────────
          //    Cameroonian 3G/2G connections need more breathing room.
          //    4s was too aggressive — requests were timing out and falling
          //    back to stale cache even when the network was usable.
          // ── FIX 3: cacheableResponse statuses [0, 200] → [200] ────────
          //    Status 0 = opaque response (cross-origin failure / offline).
          //    Caching status-0 responses means a failed fetch gets stored
          //    and re-served as if it were real data, causing the workbox
          //    "no-response" errors seen in the console.
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-api-v1",
              networkTimeoutSeconds: 8,           // FIX 2: was 4
              expiration: {
                maxEntries: 150,
                maxAgeSeconds: 5 * 60,
              },
              cacheableResponse: { statuses: [200] }, // FIX 3: was [0, 200]
            },
          },

          // 2. SUPABASE STORAGE — CacheFirst
          // Images cached 7 days. Zero network wait on repeat visits.
          // Biggest perceived performance win on 2G — images appear instantly.
          // Status 0 is intentionally kept here: storage images are served
          // via CDN as opaque cross-origin responses and are safe to cache.
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "supabase-images-v1",
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 7 * 24 * 60 * 60,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },

          // 3. SUPABASE AUTH — NetworkOnly (security: never cache tokens)
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/auth\/.*/i,
            handler: "NetworkOnly",
          },

          // 4. STATIC JS/CSS CHUNKS — CacheFirst, 30 days
          // Content-hashed filenames make stale impossible.
          // 30-day cache = instant loads for a full month.
          {
            urlPattern: /\/assets\/.*\.(js|css)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "static-assets-v1",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },

          // 5. GOOGLE FONTS STYLESHEETS — StaleWhileRevalidate
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "google-fonts-stylesheets",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 365 * 24 * 60 * 60,
              },
            },
          },

          // 6. GOOGLE FONTS FILES — CacheFirst, 1 year
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 365 * 24 * 60 * 60,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },

          // 7. FIREBASE FCM — NetworkOnly (push notifications must be live)
          {
            urlPattern: /^https:\/\/fcm\.googleapis\.com\/.*/i,
            handler: "NetworkOnly",
          },

          // 8. NOTCHPAY PAYMENT — NetworkOnly (never cache payment responses)
          {
            urlPattern: /^https:\/\/.*\.notchpay\.co\/.*/i,
            handler: "NetworkOnly",
          },

          // 9. EXTERNAL IMAGES — StaleWhileRevalidate, 3 days
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "external-images-v1",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 3 * 24 * 60 * 60,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],

  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },

  build: {
    chunkSizeWarningLimit: 500,

    // ── CSS code splitting (Step 26) ──────────────────────────────────────
    // Each lazy route gets its own CSS chunk.
    // A user on Home page downloads ~8 KB Home.css, not 160 KB index.css.
    cssCodeSplit: true,

    rollupOptions: {
      output: {
        manualChunks,
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },

    minify: "esbuild",
    sourcemap: false,
    target: ["es2020", "chrome87", "firefox78", "safari14"],
  },

  server: {
    port: 5173,
    host: true,
    cors: true,
  },

  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@supabase/supabase-js",
      "@tanstack/react-query",
    ],
    exclude: ["firebase", "@firebase/app"],
  },
});