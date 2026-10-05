// BAMBEH_DEPLOY_TOKEN__STORE_MODE_FIX645_CLEAN
/**
 * FIX620 - THE STORE BUILD SWITCH.
 * src/config/storeMode.ts
 *
 * One app, two faces:
 *   - app.bambeh.com in a browser (and the home-screen PWA): everything, as today.
 *   - the Android app from Google Play: only the six sections Big chose - Jobs,
 *     Services, Marketplace, Exchange, Car rental (vehicles), Rentals - plus what
 *     they need (sign-in, profile, chat, orders, Buyer Protection, help, legal).
 *
 * The switch is AUTOMATIC: Capacitor.isNativePlatform() is true only inside the
 * installed Android app. Nobody has to remember an environment variable before
 * a build, so a store build can never ship with the extras by mistake.
 *
 * Why these are cut from the Play app (they stay on the website):
 *   - paid digital extras (subscription, coins, donate, referral rewards): Google
 *     requires its own billing for digital features sold inside a Play app;
 *   - health and civic services (pharmacies, hospitals, fuel, water and lights,
 *     safety): each pulls in extra declarations and review;
 *   - delivery, agents, community, Farm Fresh, flash deals, group buying, AI chat,
 *     corporate, quiz, spotlight: outside the six sections;
 *   - voice and fingerprint sign-in: browser features that do not work inside the
 *     Android app's web view, so a reviewer would meet a dead button.
 *
 * FIX631 - a safety net for links. StoreRouteGuard also installs one stylesheet
 * in the Play app that hides EVERY <a> pointing at a cut route, wherever it
 * sits - footer, profile, help pages, pages nobody has re-read yet. A tap on a
 * link that silently bounces home is exactly what a reviewer files as "broken
 * functionality". Buttons that call navigate() still land on the guard's
 * redirect; those are patched one by one.
 * Also: publicShareUrl() - inside the Android app window.location is
 * https://localhost/..., which is useless to share. Shares use the real address.
 */
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";

export const IS_STORE_APP: boolean = (() => {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
})();

/** Routes the Play build never shows. A route and everything under it. */
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

function cleanPath(path: string | null | undefined): string {
  const p = String(path || "/").split("?")[0].split("#")[0].toLowerCase().replace(/\/+$/, "");
  return p === "" ? "/" : p;
}

/** True when this path may be shown here. Always true in a browser. */
/**
 * FIX645 - Big's decision, 5 Oct 2026: NO subscriptions and no paid use of any
 * feature, on the website AND in the Play app. Bambeh earns from protected
 * payments instead (1% commission + Buyer Protection on each sale).
 * One switch: set it back to true only if subscriptions ever return on the
 * website (they can never return inside the Play app - Google Play billing).
 */
export const SUBSCRIPTIONS_ENABLED: boolean = false;

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

/** Every route this runtime must not offer (Play app cuts + paid-access pages). */
export function hiddenRoutes(): string[] {
  const paid = SUBSCRIPTIONS_ENABLED ? [] : [...PAID_ACCESS_ROUTES];
  return IS_STORE_APP ? Array.from(new Set([...STORE_BLOCKED, ...paid])) : paid;
}

export function storeAllows(path: string | null | undefined): boolean {
  const p = cleanPath(path);
  if (!SUBSCRIPTIONS_ENABLED && hits(p, PAID_ACCESS_ROUTES)) return false; // FIX645 - web and app
  if (!IS_STORE_APP) return true;
  return !hits(p, STORE_BLOCKED);
}

/** The public address of the app. Shares from inside the Play app use this. */
export const PUBLIC_APP_URL = "https://app.bambeh.com";

/** A link worth sending to someone: the real address, never https://localhost. */
export function publicShareUrl(): string {
  try {
    const host = String(window.location.hostname || "").toLowerCase();
    if (!IS_STORE_APP && /(^|\.)bambeh\.com$/.test(host)) return window.location.href;
    const hash = window.location.hash && window.location.hash.length > 1 ? window.location.hash : "#/";
    return PUBLIC_APP_URL + "/" + hash;
  } catch {
    return PUBLIC_APP_URL + "/";
  }
}

/** CSS that hides every link to a cut route (both "#/x" and "/x" forms). */
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
 * Mounted once in App.tsx beside AccountGate. Inside the Android app, any route
 * that is not part of the store build is sent back to the home page - including
 * old links, notifications and redirects from code that still points there.
 */
export function StoreRouteGuard(): null {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    // FIX631 - hide links to cut sections everywhere in the Play app
    // FIX645 - and links to paid-access pages on the website too
    if (typeof document === "undefined" || hiddenRoutes().length === 0) return;
    if (document.getElementById("bambeh-store-hide")) return;
    const el = document.createElement("style");
    el.id = "bambeh-store-hide";
    el.setAttribute("data-fix", "FIX645");
    el.textContent = storeHideCss();
    document.head.appendChild(el);
  }, []);
  useEffect(() => {
    // FIX645 - a cut section (Play app) or a paid-access page (anywhere) goes home
    if (!storeAllows(location.pathname)) navigate("/", { replace: true });
  }, [location.pathname, navigate]);
  return null;
}

export default StoreRouteGuard;
// BAMBEH_END_TOKEN__STORE_MODE_FIX645__COMPLETE
