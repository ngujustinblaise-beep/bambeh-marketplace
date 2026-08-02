// BAMBEH_DEPLOY_TOKEN__SUBSCRIPTIONGUARD_FIX251_CLEAN
// FILE LOCATION: src/components/security/SubscriptionGuard.tsx
//
// FIX251 - THE FINAL ACCESS MODEL.
//
// THREE GROUPS OF PEOPLE, TWO PAYWALL STATES.
//
//   A. Downloaded, not signed in
//      Home, all browse lists, search, corporate storefronts, help, legal,
//      about, the plans page, donations. Sees THAT items exist. Does not
//      see WHERE they are or WHO is selling.
//
//   B. Signed in, not subscribed  (everything in A, plus)
//      POSTING - always free, instantly, no wall, ever.
//      Their own things: profile, settings, my listings, drafts, editing,
//      orders, cart, favourites, notifications, alerts, saved searches,
//      trash, referrals, job applicants for jobs they posted.
//
//   C. Subscribed
//      Everything above, plus the four things that are worth paying for:
//        1. Messages / chat
//        2. Item DETAIL pages (where the location and contact live)
//        3. Making an offer / contacting a seller
//        4. Special modules: FarmFresh, Coins, Community, Group Buying,
//           Compare, AI Chat, Deals, Flash Deals, Tontine, Escrow
//
// So the paywall sits on OTHER PEOPLE'S value and on the special modules.
// Nothing a user owns is ever locked away from them, and posting supply
// into the marketplace costs nothing - which is how the marketplace fills.
//
// NOTE ON PLANS: daily / weekly / monthly currently grant the SAME access
// and differ only in how long they last. Per-plan feature differences are
// marketing copy on the plans page, not enforced here. If you want them
// enforced, that is a separate change and I will need to know the rules.
//
// Item location and detail masking INSIDE a page is not done here -
// routing cannot hide a field. That is LocationLock.tsx.

import { useEffect, useState, type ReactNode } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";

/* ------------------------------------------------------------------ *
 * OPEN TO EVERYONE - EXACT MATCH ONLY.
 * Exact match is deliberate: "/marketplace" is open, but
 * "/marketplace/abc123" (an item's details) must not be. A prefix rule
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

/* Open to everyone - prefix match. None of these has a gated child. */
const PUBLIC_PREFIX = [
  "/marketplace/category",
  "/jobs/category",
  "/help",
  "/seller",
  "/corporate/store",

  // Payment return pages. A person paying for their FIRST subscription is
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
  "/tontine/create",      // beats the /tontine gate below
  "/farm-fresh/sell",     // beats the /farm-fresh gate below

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
 * SUBSCRIBERS ONLY - the special modules and the contact channels.
 * ------------------------------------------------------------------ */
const SUBSCRIBER_PREFIX = [
  "/chat",           // in-app messaging
  "/make-offer",     // contacting a seller with an offer
  "/exchange/offer", // same, on the exchange

  // special modules
  "/farm-fresh", "/community", "/group-buying", "/compare",
  "/ai-chat", "/deals", "/flash-deals", "/tontine", "/escrow",

  // coins economy - earned free, visible on subscription
  "/coins", "/zerm",
];

/* ------------------------------------------------------------------ *
 * DETAIL PAGES - one segment after the base that is not a known keyword.
 * /marketplace/category/food -> open.  /marketplace/abc123 -> subscribers.
 * ------------------------------------------------------------------ */
const DETAIL_ROUTES: { base: string; free: string[] }[] = [
  { base: "/marketplace", free: ["category", "sell", "drafts", "edit"] },
  { base: "/jobs",        free: ["category", "post", "edit"] },
  { base: "/services",    free: ["offer", "post", "edit"] },
  { base: "/rentals",     free: ["list", "post"] },
  { base: "/vehicles",    free: ["sell"] },
  { base: "/exchange",    free: ["post", "offer"] },
];

/* ------------------------------------------------------------------ */

function exactly(path: string, list: string[]): boolean {
  return list.indexOf(path) !== -1;
}

function underPrefix(path: string, list: string[]): boolean {
  return list.some((p) => path === p || path.startsWith(p + "/"));
}

function isPublic(path: string): boolean {
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
  return isDetailPage(path);
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

  // ---- GROUP A: open to anyone, signed in or not ----
  if (isPublic(path)) {
    return <>{children}</>;
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
// BAMBEH_END_TOKEN__SUBSCRIPTIONGUARD_FIX251__COMPLETE
