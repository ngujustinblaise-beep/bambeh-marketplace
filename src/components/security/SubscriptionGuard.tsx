// BAMBEH_DEPLOY_TOKEN__SUBSCRIPTIONGUARD_FIX272_CLEAN
// FILE LOCATION: src/components/security/SubscriptionGuard.tsx
//
// FIX272 - THE TIERED MODEL, WITH THE LOCK MADE VISIBLE.
//
// Same access rules as FIX251. Two additions:
//
//   1. On a browse page, a non-subscriber now sees a counted banner above
//      the list: "47 places to rent. Location and seller contact are hidden.
//      Unlock everything - 100 XAF, 24 hours." A wall shows nothing to want;
//      this shows the size of the prize and the price of it.
//
//   2. ONE SWITCH, below, to put whole categories behind the paywall later.
//      Leave it false while the marketplace is filling. Flip it to true and
//      rebuild when a category has enough listings that the count alone
//      sells the subscription.
//
// Everything else is unchanged: posting is always free, nothing a user owns
// is ever locked away from them, and /subscription is always reachable.

import { useEffect, useState, type ReactNode } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import BrowseTeaser from "@/components/security/BrowseTeaser";

/* ==================================================================== *
 *  THE SWITCH
 *
 *  false = anyone can browse every category list. Details, contact and
 *          location stay behind the paywall. THIS IS THE CURRENT PLAN.
 *
 *  true  = jobs, services, rentals, vehicles and exchange become
 *          subscriber-only entirely. Marketplace stays open, so the app
 *          still has a free front door.
 *
 *  Change one word, run npm run build, deploy. Reversible the same way.
 * ==================================================================== */
const LOCK_CATEGORIES_BEHIND_PAYWALL = false;

/* Locked only when the switch above is true. Marketplace is never here. */
const SWITCHABLE_CATEGORIES = [
  "/jobs", "/services", "/rentals", "/vehicles", "/exchange",
];

/* ------------------------------------------------------------------ *
 * OPEN TO EVERYONE - EXACT MATCH ONLY.
 * "/marketplace" is open; "/marketplace/abc123" is not. A prefix rule
 * here would leak every detail page in the app.
 * ------------------------------------------------------------------ */
const PUBLIC_EXACT = [
  "/", "/home", "/splash", "/welcome", "/spotlight",

  // browse - the lists, never an individual item
  "/marketplace", "/jobs", "/services", "/rentals", "/vehicles", "/exchange",
  "/search",

  // money pages must always be reachable or the app traps people
  "/subscription", "/donate",

  // auth + onboarding
  "/login", "/sign-in", "/signin", "/register",
  "/forgot-password", "/forgot-credentials",
  "/language", "/select-language", "/terms-acceptance",

  // information + legal
  "/about", "/privacy", "/privacy-policy", "/terms", "/terms-of-service",
  "/meet-safely", "/offline-mode", "/report-issue",

  // company shop windows - items inside are still gated
  "/corporate", "/corporate/register",
];

const PUBLIC_PREFIX = [
  "/marketplace/category",
  "/jobs/category",
  "/help",
  "/seller",
  "/corporate/store",

  // Payment return pages. Someone paying for their FIRST subscription is
  // still unsubscribed when the gateway sends them back here. Gating this
  // would lose the payment at the final step. Do not remove.
  "/payment",
];

/* ------------------------------------------------------------------ *
 * ALWAYS FREE FOR A SIGNED-IN USER - checked BEFORE anything gated.
 * Posting is here on purpose and must stay here.
 * ------------------------------------------------------------------ */
const ALWAYS_FREE_SIGNED_IN = [
  // posting - every route, every module
  "/jobs/post", "/post-job",
  "/marketplace/sell", "/sell-item", "/post-ad",
  "/services/offer", "/services/post", "/offer-service",
  "/rentals/list", "/rentals/post", "/list-property",
  "/vehicles/sell",
  "/exchange/post",
  "/tontine/create",
  "/farm-fresh/sell",

  // managing what they posted
  "/my-listings", "/marketplace/drafts", "/marketplace/edit",
  "/jobs/edit", "/services/edit", "/trash",

  // their own account and their own data
  "/profile", "/settings", "/orders", "/cart", "/favorites",
  "/notifications", "/alerts", "/saved-searches", "/referral", "/quiz",
  "/order-tracking", "/track-orders", "/tracking",
  "/biometric-login", "/biometric-setup", "/enable-biometrics",
];

/* ------------------------------------------------------------------ *
 * SUBSCRIBERS ONLY - contact channels and the special modules.
 * ------------------------------------------------------------------ */
const SUBSCRIBER_PREFIX = [
  "/chat",
  "/make-offer",
  "/exchange/offer",

  "/farm-fresh", "/community", "/group-buying", "/compare",
  "/ai-chat", "/deals", "/flash-deals", "/tontine", "/escrow",

  "/coins", "/zerm",
];

/* ------------------------------------------------------------------ *
 * DETAIL PAGES - one segment after the base that is not a known keyword.
 * ------------------------------------------------------------------ */
const DETAIL_ROUTES: { base: string; free: string[] }[] = [
  { base: "/marketplace", free: ["category", "sell", "drafts", "edit"] },
  { base: "/jobs",        free: ["category", "post", "edit"] },
  { base: "/services",    free: ["offer", "post", "edit"] },
  { base: "/rentals",     free: ["list", "post"] },
  { base: "/vehicles",    free: ["sell"] },
  { base: "/exchange",    free: ["post", "offer"] },
];

/* Where the counted teaser makes sense. */
const TEASER_PATHS = [
  "/marketplace", "/jobs", "/services", "/rentals", "/vehicles",
  "/exchange", "/search",
];

/* ------------------------------------------------------------------ */

function exactly(path: string, list: string[]): boolean {
  return list.indexOf(path) !== -1;
}

function underPrefix(path: string, list: string[]): boolean {
  return list.some((p) => path === p || path.startsWith(p + "/"));
}

function isPublic(path: string): boolean {
  if (LOCK_CATEGORIES_BEHIND_PAYWALL && underPrefix(path, SWITCHABLE_CATEGORIES)) {
    // the posting routes inside those categories stay free even when locked
    if (underPrefix(path, ALWAYS_FREE_SIGNED_IN)) return false;
    return false;
  }
  return exactly(path, PUBLIC_EXACT) || underPrefix(path, PUBLIC_PREFIX);
}

function isDetailPage(path: string): boolean {
  // An employer reading applicants for a job THEY posted is their own data.
  if (path.endsWith("/applicants")) return false;

  for (const r of DETAIL_ROUTES) {
    if (!path.startsWith(r.base + "/")) continue;
    const rest = path.slice(r.base.length + 1);
    if (rest === "") continue;
    const first = rest.split("/")[0];
    if (r.free.indexOf(first) !== -1) continue;
    return true;
  }
  return false;
}

function needsSubscription(path: string): boolean {
  if (underPrefix(path, ALWAYS_FREE_SIGNED_IN)) return false;
  if (underPrefix(path, SUBSCRIBER_PREFIX)) return true;
  if (LOCK_CATEGORIES_BEHIND_PAYWALL && underPrefix(path, SWITCHABLE_CATEGORIES)) return true;
  return isDetailPage(path);
}

function showsTeaser(path: string): boolean {
  return TEASER_PATHS.some((p) => path === p || path.startsWith(p + "/"));
}

/* ------------------------------------------------------------------ */

export default function SubscriptionGuard({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { currentUser } = useAuth();
  const uid = currentUser?.id ?? null;
  const { isActive } = useSubscription(uid);

  const path = location.pathname;

  // The Supabase check is asynchronous. Hold briefly before redirecting so a
  // member who has genuinely paid is never bounced mid-verification.
  const [graceOver, setGraceOver] = useState(false);
  useEffect(() => {
    setGraceOver(false);
    const t = setTimeout(() => setGraceOver(true), 1500);
    return () => clearTimeout(t);
  }, [path, uid]);

  const teaser = !isActive && showsTeaser(path) ? <BrowseTeaser /> : null;

  // ---- GROUP A: open to anyone, signed in or not ----
  if (isPublic(path)) {
    return (
      <>
        {teaser}
        {children}
      </>
    );
  }

  // ---- Everything below needs an account ----
  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: path }} />;
  }

  // ---- GROUP B: signed in is enough (posting, own data, own account) ----
  if (!needsSubscription(path)) {
    return <>{children}</>;
  }

  // ---- GROUP C: subscribers only ----
  if (isActive) {
    return <>{children}</>;
  }

  if (!graceOver) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
      </div>
    );
  }

  return <Navigate to="/subscription" replace state={{ from: path }} />;
}
// BAMBEH_END_TOKEN__SUBSCRIPTIONGUARD_FIX272__COMPLETE
