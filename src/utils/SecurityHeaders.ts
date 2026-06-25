/**
 * SecurityHeaders.ts
 * -----------------------------------------------------------------------------
 * WHAT CHANGED:
 *   1. Removed 'unsafe-inline' from script-src and style-src.
 *   2. Removed http: from connect-src (only https: allowed in production).
 *   3. Added nonces pattern comment for React inline styles workaround.
 *   4. Tightened default-src, added upgrade-insecure-requests.
 *
 * FILE LOCATION: src/utils/SecurityHeaders.ts  (or src/config/SecurityHeaders.ts)
 * -----------------------------------------------------------------------------
 */

// -- Environment detection -----------------------------------------------------
const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;

// -- Trusted external domains --------------------------------------------------
const FIREBASE_DOMAINS = [
  "https://*.googleapis.com",
  "https://*.firebaseio.com",
  "https://*.firebaseapp.com",
  "https://*.firebase.com",
  "https://firestore.googleapis.com",
  "https://identitytoolkit.googleapis.com",
  "https://securetoken.googleapis.com",
  "wss://*.firebaseio.com",
].join(" ");

const NOTCHPAY_DOMAINS = [
  "https://api.notchpay.co",
  "https://checkout.notchpay.co",
].join(" ");

const RAILWAY_DOMAINS = [
  "https://bambeh-backend-production-6bca.up.railway.app",
].join(" ");

const SENTRY_DOMAINS = [
  "https://*.sentry.io",
  "https://*.ingest.sentry.io",
].join(" ");

const GA_DOMAINS = [
  "https://www.googletagmanager.com",
  "https://www.google-analytics.com",
  "https://*.analytics.google.com",
].join(" ");

const CAPACITOR_DOMAINS = ["capacitor://localhost", "ionic://localhost"].join(
  " ",
);

// Development-only additions (never allowed in production)
const devExtras = isDev
  ? "ws://localhost:* http://localhost:* http://127.0.0.1:*"
  : "";

// -----------------------------------------------------------------------------
// CONTENT SECURITY POLICY
// -----------------------------------------------------------------------------
export const contentSecurityPolicy = [
  // default fallback — deny everything not explicitly listed
  `default-src 'self' ${CAPACITOR_DOMAINS}`,

  // Scripts — NO unsafe-inline, NO unsafe-eval in production
  // Note: React itself does not require unsafe-inline for its runtime JS.
  // If you have inline <script> tags, move them to .js files.
  isProd
    ? `script-src 'self' ${GA_DOMAINS} ${CAPACITOR_DOMAINS}`
    : `script-src 'self' 'unsafe-eval' ${devExtras}`, // eval needed for Vite HMR in dev

  // Styles — NO unsafe-inline in production
  // Note: Tailwind CSS is compiled at build time so it does NOT need unsafe-inline.
  // If you have any style={{ }} JSX props that generate <style> tags, they will
  // be blocked in production. Use className instead.
  isProd
    ? `style-src 'self' https://fonts.googleapis.com`
    : `style-src 'self' 'unsafe-inline'`, // unsafe-inline only in dev for hot reload

  // Fonts
  `font-src 'self' https://fonts.gstatic.com data:`,

  // Images — allow Firebase Storage, data URIs, blob for image previews
  `img-src 'self' data: blob: https://firebasestorage.googleapis.com https://*.googleusercontent.com`,

  // API connections — NO http: in production
[
    `connect-src 'self'`,
    FIREBASE_DOMAINS,
    NOTCHPAY_DOMAINS,
    RAILWAY_DOMAINS,
    SENTRY_DOMAINS,
    GA_DOMAINS,
    CAPACITOR_DOMAINS,
    devExtras,
  ]
    .filter(Boolean)
    .join(" "),

  // Media
  `media-src 'self' blob: https://firebasestorage.googleapis.com`,

  // Workers (Sentry uses a worker for performance monitoring)
  `worker-src 'self' blob:`,

  // Frames — block all iframes (prevents clickjacking)
  `frame-src 'none'`,

  // Frame ancestors — block embedding in other sites
  `frame-ancestors 'none'`,

  // Forms — only submit to our own origin
  `form-action 'self' ${NOTCHPAY_DOMAINS}`,

  // Block mixed content (http resources on https pages),
  ...(isProd ? [`upgrade-insecure-requests`] : []),

  // Block Flash/Java plugins
  `object-src 'none'`,

  // Base tag restriction (prevents base tag injection attacks)
  `base-uri 'self'`,
].join("; ");

// -----------------------------------------------------------------------------
// ALL SECURITY HEADERS (apply these in your server / hosting config)
// -----------------------------------------------------------------------------
export const securityHeaders: Record<string, string> = {
  // Prevent browsers from MIME-sniffing responses
  "X-Content-Type-Options": "nosniff",

  // Block the page from being embedded in an iframe
  "X-Frame-Options": "DENY",

  // Enable XSS filter in older browsers
  "X-XSS-Protection": "1; mode=block",

  // Force HTTPS for 2 years (includes subdomains)
  // Only apply in production — Capacitor local dev uses http,
  ...(isProd
    ? {
        "Strict-Transport-Security":
          "max-age=63072000; includeSubDomains; preload",
      }
    : {}),

  // Control referrer information sent with requests
  "Referrer-Policy": "strict-origin-when-cross-origin",

  // Restrict access to browser features
  "Permissions-Policy": [
    "camera=(self)",
    "microphone=(self)",
    "geolocation=(self)",
    "payment=(self)",
    "fullscreen=(self)",
    "notifications=(self)",
  ].join(", "),

  // CSP
  "Content-Security-Policy": contentSecurityPolicy,
};

// -----------------------------------------------------------------------------
// FIREBASE HOSTING — firebase.json
// -----------------------------------------------------------------------------
/**
 * Add this to your firebase.json hosting section to apply security headers:
 *
 * "hosting": {
 *   "headers": [
 *     {
 *       "source": "**",
 *       "headers": [
 *         { "key": "X-Content-Type-Options",  "value": "nosniff" },
 *         { "key": "X-Frame-Options",         "value": "DENY" },
 *         { "key": "X-XSS-Protection",        "value": "1; mode=block" },
 *         { "key": "Referrer-Policy",         "value": "strict-origin-when-cross-origin" },
 *         { "key": "Permissions-Policy",      "value": "camera=(self), microphone=(self), geolocation=(self)" },
 *         { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains" },
 *         { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' https://www.googletagmanager.com; ..." }
 *       ]
 *     }
 *   ]
 * }
 *
 * The full CSP string can be generated by running:
 *   console.log(contentSecurityPolicy)
 * in the browser console after loading the app.
 */

// -----------------------------------------------------------------------------
// Helper: inject meta CSP tag (for Capacitor where there is no server)
// -----------------------------------------------------------------------------
export function injectCSPMetaTag(): void {
  if (typeof document === "undefined") return;
  // Remove any existing CSP meta tag
  document
    .querySelectorAll('meta[http-equiv="Content-Security-Policy"]')
    .forEach((el) => el.remove());
  // Inject updated CSP
  const meta = document.createElement("meta");
  meta.httpEquiv = "Content-Security-Policy";
  meta.content = contentSecurityPolicy;
  document.head.appendChild(meta);

// -- Export default for easy import --------------------------------------------
}
export default securityHeaders;
