// BAMBEH_DEPLOY_TOKEN__STORE_MODE_FIX682_CLEAN
/**
 * src/config/storeMode.ts - FIX682 (replaces FIX658)
 *
 * FIX682 - THE ANDROID APP IS THE SAME BAMBEH AS THE WEBSITE.
 * Big, 9 Oct 2026: "make the android app version to have the wall. we are not going
 * through google any more. agents should be able to use any - the apk or the app from
 * the website." Bambeh no longer ships through Google Play, so none of Google's rules
 * apply to the APK: it gets every section, the subscription wall, the Subscribe button,
 * the sponsor banner and the Members-only sections switches, exactly like
 * app.bambeh.com.
 *
 * TWO DIFFERENT QUESTIONS, TWO NAMES
 *   IS_NATIVE_APP  - "am I inside the installed Android app?" A TECHNICAL fact. It still
 *                    matters where the app's web view cannot do what a browser can:
 *                    share links (inside the app the address is https://localhost),
 *                    the microphone, fingerprint sign-in, installing to the home screen.
 *   IS_STORE_APP   - "do Google Play's rules apply?" A POLICY switch. It is now always
 *                    false, so every Play-only rule in the app (no paywall, no Subscribe,
 *                    hidden sections, hidden links) is off everywhere at once. It stays
 *                    as a name so a future store build can be made by flipping
 *                    PLAY_STORE_BUILD alone.
 *
 * Earlier history: FIX620 made the Play build switch, FIX631 hid links to cut sections,
 * FIX645/FIX658 added the paid-access routes and brought subscriptions back.
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";

/** True only inside the installed Android (or iOS) app. A technical fact, not a policy. */
export const IS_NATIVE_APP: boolean = (() => {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
})();

/** FIX682 - false: Bambeh is not shipped through Google Play any more (Big, 9 Oct 2026). */
export const PLAY_STORE_BUILD: boolean = false;

/** True only in a Google Play build. Every Play-only rule in the app reads this. */
export const IS_STORE_APP: boolean = PLAY_STORE_BUILD && IS_NATIVE_APP;

/** Routes a Google Play build cuts (kept for a future store build; unused while PLAY_STORE_BUILD is false). */
export const STORE_BLOCKED: readonly string[] = [
  "/biometric-login",
  "/biometric-setup",
  "/enable-biometrics",
  "/corporate",
  "/quiz",
  "/pharmacies",
  "/hospitals",
  "/water-lights",
  "/fuel",
  "/safety",
  "/list-my-service",
  "/deals",
  "/flash-deals",
  "/group-buying",
  "/ai-chat",
  "/subscription",
  "/coins",
  "/zerm",
  "/become-courier",
  "/agent",
  "/request-delivery",
  "/help/understanding-zerm-coins",
  "/donate",
  "/referral",
  "/spotlight",
  "/community",
  "/farm-fresh",
];

/**
 * Pages that cannot work inside the app's web view, whatever the store: fingerprint
 * and face sign-in need the browser's passkey support, which the Android web view
 * does not have. Hidden in the app so nobody meets a dead button; the website keeps them.
 */
export const NATIVE_BLOCKED: readonly string[] = [
  "/biometric-login",
  "/biometric-setup",
  "/enable-biometrics",
];

function cleanPath(path: string | null | undefined): string {
  const p = String(path || "/").split("?")[0].split("#")[0].toLowerCase().replace(/\/+$/, "");
  return p === "" ? "/" : p;
}

/**
 * FIX658 - Big's decision, 6 Oct 2026: customers come through FIELD AGENTS, not
 * app stores. Subscriptions and their levels exist, and the Command Center paywall
 * switch decides whether they are required: switched to free, everyone signed in
 * uses everything (FIX659); switched on, members only.
 */
export const SUBSCRIPTIONS_ENABLED: boolean = true;

/** Pages that only exist to sell access: plans, premium gifts, coin purchases. */
export const PAID_ACCESS_ROUTES: readonly string[] = [
  "/subscription",
  "/donate",
  "/coins/buy",
  "/coins/purchase",
  "/zerm/purchase",
];

function hits(p: string, list: readonly string[]): boolean {
  return list.some((b) => p === b || p.indexOf(b + "/") === 0);
}

/** Every route this runtime must not offer. In the APK today: fingerprint sign-in only. */
export function hiddenRoutes(): string[] {
  const store = IS_STORE_APP ? [...STORE_BLOCKED] : [];
  const native = IS_NATIVE_APP ? [...NATIVE_BLOCKED] : [];
  const paid = SUBSCRIPTIONS_ENABLED ? [] : [...PAID_ACCESS_ROUTES];
  return Array.from(new Set([...store, ...native, ...paid]));
}

/** True when this path may be shown here. */
export function storeAllows(path: string | null | undefined): boolean {
  return !hits(cleanPath(path), hiddenRoutes());
}

/** The public address of the app. Shares from inside the Android app use this. */
export const PUBLIC_APP_URL = "https://app.bambeh.com";

/** A link worth sending to someone: the real address, never https://localhost. */
export function publicShareUrl(): string {
  try {
    const host = String(window.location.hostname || "").toLowerCase();
    if (!IS_NATIVE_APP && /(^|\.)bambeh\.com$/.test(host)) return window.location.href;
    const hash = window.location.hash && window.location.hash.length > 1 ? window.location.hash : "#/";
    return PUBLIC_APP_URL + "/" + hash;
  } catch {
    return PUBLIC_APP_URL + "/";
  }
}

/** CSS that hides every link to a hidden route (both "#/x" and "/x" forms). */
export function storeHideCss(): string {
  const sel: string[] = [];
  for (const b of hiddenRoutes()) {
    for (const p of ["#" + b, b]) {
      sel.push('a[href="' + p + '"]', 'a[href^="' + p + '/"]', 'a[href^="' + p + '?"]');
    }
  }
  return sel.join(",\n") + " { display: none !important; }";
}

/**
 * Mounted once in App.tsx beside AccountGate. A route this runtime must not offer
 * (in the APK: fingerprint sign-in) goes back to the home page, and links to it are
 * hidden - including old links, notifications and redirects that still point there.
 */
export function StoreRouteGuard(): null {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (typeof document === "undefined" || hiddenRoutes().length === 0) return;
    if (document.getElementById("bambeh-store-hide")) return;
    const el = document.createElement("style");
    el.id = "bambeh-store-hide";
    el.setAttribute("data-fix", "FIX682");
    el.textContent = storeHideCss();
    document.head.appendChild(el);
  }, []);
  useEffect(() => {
    if (!storeAllows(location.pathname)) navigate("/", { replace: true });
  }, [location.pathname, navigate]);
  return null;
}

export default StoreRouteGuard;
// BAMBEH_END_TOKEN__STORE_MODE_FIX682__COMPLETE
