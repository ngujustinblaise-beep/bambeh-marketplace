// BAMBEH_DEPLOY_TOKEN__SUBSCRIPTIONGUARD_FIX299_CLEAN
// FILE LOCATION: src/components/security/SubscriptionGuard.tsx
//
// FIX299 - NOTHING THAT MOVES MONEY SITS BEHIND THE PAYWALL.
//
// WHAT CHANGED, AND ONLY THIS:
//
//   1. /escrow and /escrow/:orderId are now free for any signed-in user.
//
//      This is the important one. /escrow is where a BUYER presses "I
//      received my item". That press is the only thing that calls
//      handleReleaseEscrow, which is the only thing that calls
//      disburseForOrder, which is the only thing that pays the seller.
//
//      With it gated, this happens: a buyer subscribes, pays 1,070 with
//      escrow, and Bambeh holds the money. Their 24-hour pass expires. The
//      goods arrive. They open /escrow to confirm - and are bounced to the
//      subscription page. The seller's 1,011 then sits in Bambeh's CamPay
//      account with no way out, and the seller did nothing wrong. Their
//      money is trapped because SOMEBODY ELSE stopped subscribing.
//
//      Escrow protection itself is still not free. You only reach this page
//      by having paid for an item. What is free is the button that finishes
//      the transaction you already paid for.
//
//   2. /coins/buy, /coins/purchase and /zerm/purchase are now free.
//
//      Buying coins IS a payment. A paywall in front of a payment page turns
//      away money. The two /purchase paths are redirects to /coins/buy, and
//      this guard runs BEFORE a redirect resolves - so freeing only
//      /coins/buy would still have bounced anyone arriving by those links.
//
//      THE WALLET STAYS GATED. /coins, /coins/history, /coins/transfer and
//      /zerm are still subscribers-only, exactly as before.
//
//   3. CHAT IS UNTOUCHED. /chat stays behind the paywall. It is the reason
//      people subscribe and it was not part of this change.
//
// Everything else in this file is byte-for-byte what FIX272 shipped.
//
// ── FIX272 (unchanged, kept for the record) ────────────────────────────
// Same access rules as FIX251, plus a counted browse teaser and ONE SWITCH
// to put whole categories behind the paywall later. Posting is always free,
// nothing a user owns is ever locked away from them, and /subscription is
// always reachable.

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
  "/how-to-use",

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

  /* ---------------------------------------------------------------- *
   * FIX299 - MONEY MUST NEVER BE TRAPPED BEHIND A PAYWALL.
   * ---------------------------------------------------------------- */

  // Confirming receipt is what pays the seller. If a buyer's pass expires
  // before the goods arrive, the seller must not be the one who suffers.
  // Covers /escrow and /escrow/:orderId through the prefix rule.
  "/escrow",

  // Buying coins is a payment. The two /purchase paths are redirects to
  // /coins/buy, and this guard runs before a redirect resolves - so all
  // three have to be here or the links still bounce.
  // THE WALLET IS NOT HERE ON PURPOSE: /coins, /coins/history and
  // /coins/transfer stay subscribers-only below.
  "/coins/buy", "/coins/purchase", "/zerm/purchase",
];

/* ------------------------------------------------------------------ *
 * SUBSCRIBERS ONLY - contact channels and the special modules.
 *
 * FIX299: /escrow left this list. Nothing else moved.
 * /chat stays. It is the reason people subscribe.
 * /coins and /zerm stay - that is the WALLET, not the purchase.
 * ------------------------------------------------------------------ */
const SUBSCRIBER_PREFIX = [
  "/chat",
  "/make-offer",
  "/exchange/offer",

  "/farm-fresh", "/community", "/group-buying", "/compare",
  "/ai-chat", "/deals", "/flash-deals", "/tontine",

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
  // ALWAYS_FREE is checked FIRST and that ordering is what makes FIX299
  // work: /coins/buy is free even though /coins is gated, because this line
  // returns before the SUBSCRIBER_PREFIX line is ever reached.
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
  // FIX397 - TWO fixes in these lines.
  //
  // (a) currentUser OR user. useSupabaseAuth returns `user`. This file reads
  //     `currentUser`; AuthGate reads `user`. If AuthContext does not map one
  //     onto the other then currentUser is undefined here, every signed-in
  //     visitor looks signed out to this guard, and /admin/center is sent to
  //     /login before AuthGate ever runs. Reading both makes the mismatch
  //     harmless whichever way round it is.
  //
  // (b) isAdmin is now read, and used below. It never was.
  const auth = useAuth() as {
    currentUser?: { id?: string } | null;
    user?: { id?: string } | null;
    isAdmin?: boolean;
  };
  const currentUser = auth.currentUser ?? auth.user ?? null;
  const isAdmin = auth.isAdmin === true;
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

  // ---- GROUP B: signed in is enough (posting, own data, own account,
  //      and since FIX299: confirming receipt and buying coins) ----
  if (!needsSubscription(path)) {
    return <>{children}</>;
  }

  // ---- FIX397: AN ADMIN IS NEVER ASKED TO PAY FOR HIS OWN APP ----
  // This guard only ever asked whether someone was subscribed. It never
  // asked whether they ran the place. So the owner of Bambeh was told to
  // subscribe to reach his own Zerm Coins wallet.
  if (isAdmin) {
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
// BAMBEH_END_TOKEN__SUBSCRIPTIONGUARD_FIX299__COMPLETE
