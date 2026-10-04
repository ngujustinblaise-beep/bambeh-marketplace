// BAMBEH_DEPLOY_TOKEN__STORE_MODE_FIX620_CLEAN
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
export function storeAllows(path: string | null | undefined): boolean {
  if (!IS_STORE_APP) return true;
  const p = cleanPath(path);
  return !STORE_BLOCKED.some((b) => p === b || p.indexOf(b + "/") === 0);
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
    if (IS_STORE_APP && !storeAllows(location.pathname)) {
      console.info("[FIX620] store build - not available in the Play app:", location.pathname);
      navigate("/", { replace: true });
    }
  }, [location.pathname, navigate]);
  return null;
}

export default StoreRouteGuard;
// BAMBEH_END_TOKEN__STORE_MODE__COMPLETE
