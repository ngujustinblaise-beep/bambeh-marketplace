/**
 * logger.ts â€” Bambeh Marketplace
 * ============================================================
 * REPLACES: All console.warn() / console.log() / console.error()
 *           calls scattered across App.tsx and the codebase.
 *
 * WHY: 9 console.warn() statements in App.tsx were exposing
 * internal auth state, session key names, and error details
 * to any user who opens browser DevTools in production.
 *
 * HOW TO MIGRATE:
 *   BEFORE: console.warn("Admin auth failed:", e);
 *   AFTER:  logger.warn("Admin auth failed:", e);
 *
 *   BEFORE: console.log("StatusBar init failed:", e);
 *   AFTER:  logger.warn("StatusBar init failed:", e);
 * ============================================================
 */

// Detect environment at build time (Vite replaces this at compile)
const IS_DEV = import.meta.env.DEV;
const IS_PROD = import.meta.env.PROD;

// â”€â”€â”€ SENTRY INTEGRATION (uncomment when Sentry is installed) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// import * as Sentry from "@sentry/capacitor";
// function reportToSentry(level: string, args: unknown[]) {
//   if (IS_PROD) {
//     const msg = args.map(a => String(a)).join(' ');
//     Sentry.addBreadcrumb({ category: 'bambeh', message: msg, level });
//   }
// }

// â”€â”€â”€ LOGGER INTERFACE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const logger = {
  /**
   * General warning â€” shown in dev, silent in prod.
   * Use for recoverable errors (Capacitor plugin failures, etc.)
   */
  warn(...args: unknown[]): void {
    if (IS_DEV) {
      console.warn("[Bambeh]", ...args);
    }
    // Prod: route to monitoring (Sentry, Datadog, etc.)
    // reportToSentry('warning', args);
  },

  /**
   * Error â€” shown in dev, silent in prod.
   * Use for unexpected errors that affect functionality.
   */
  error(...args: unknown[]): void {
    if (IS_DEV) {
      console.error("[Bambeh]", ...args);
    }
    // Prod: route to monitoring
    // reportToSentry('error', args);
  },

  /**
   * Debug info â€” shown in dev only, never in prod.
   * Use for state changes, navigation, analytics events.
   */
  log(...args: unknown[]): void {
    if (IS_DEV) {
      console.log("[Bambeh]", ...args);
    }
    // Never in prod â€” no monitoring needed for debug logs
  },

  /**
   * Performance timing â€” dev only.
   */
  time(label: string): void {
    if (IS_DEV) console.time(`[Bambeh] ${label}`);
  },

  timeEnd(label: string): void {
    if (IS_DEV) console.timeEnd(`[Bambeh] ${label}`);
  },

  /**
   * Security event â€” ALWAYS silent, even in dev.
   * Use for auth failures, rate limit hits, etc.
   * We deliberately never log security-related details to console.
   *
   * In prod: send anonymized event ID to analytics (no PII, no details)
   */
  security(eventId: string, _metadata?: Record<string, unknown>): void {
    // NEVER log to console â€” not in dev, not in prod
    // Optional: send anonymized event ID to analytics (no stack trace, no user data)
    // analytics.track(eventId); â† add when analytics is wired
    void eventId; // Prevents unused variable warning
  },
};

// â”€â”€â”€ DEV BANNER (replaces the existing console.log in App.tsx useEffect) â”€â”€â”€â”€â”€â”€
export function logDevBanner(): void {
  if (!IS_DEV) return;
  console.log(
    "%cðŸš€ Bambeh Marketplace [DEV]",
    "color:#0d9488;font-size:18px;font-weight:bold"
  );
  console.log(
    "%cSecurity: All auth checks run server-side via Supabase.",
    "color:#6B7280;font-size:12px"
  );
}

export default logger;
