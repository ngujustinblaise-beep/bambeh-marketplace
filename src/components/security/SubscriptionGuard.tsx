// BAMBEH_DEPLOY_TOKEN__SUBSCRIPTIONGUARD_FIX93_CLEAN
// FILE LOCATION: src/components/security/SubscriptionGuard.tsx  (replaces fix90)
//
// FIX93 — LIMITED VIEW (Big's rule, 07-14):
//   Signed-in but UNSUBSCRIBED users may:
//     • BROWSE the list pages (marketplace, jobs, services, rentals, vehicles,
//       exchange, home) — EXACT paths only, so every deeper path (details,
//       chat, cart, profile, modules) stays locked;
//     • POST listings, visit /subscription, and /donate.
//   Anything else → /subscription (plans page, in their language).
//   Signed-out visitors → /login.
//   Active subscribers → everything.
//
// Reuses the canonical Supabase-only hooks. No localStorage. No stubs.

import { useEffect, useState, type ReactNode } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";

// Prefix-matched: posting, plans, donations — open to any signed-in user.
const FREE_PREFIXES = [
  "/subscription",
  "/donate",
  "/jobs/post", "/marketplace/sell", "/services/offer", "/services/post",
  "/offer-service", "/rentals/list", "/rentals/post", "/list-property",
  "/vehicles/sell", "/post-ad", "/exchange/post", "/exchange/offer",
  "/tontine/create", "/farm-fresh/sell", "/sell-item", "/post-job", "/make-offer",
];

// EXACT-matched: browse-only list pages. Deeper paths (details) are NOT here,
// so "/marketplace" opens but "/marketplace/item/xyz" gates to /subscription.
const BROWSE_EXACT = new Set([
  "/", "/home",
  "/marketplace", "/jobs", "/services", "/rentals", "/vehicles", "/exchange",
]);

function isFreePath(path: string): boolean {
  return FREE_PREFIXES.some((p) => path === p || path.startsWith(p + "/"));
}

function normalize(path: string): string {
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
}

export default function SubscriptionGuard({ children }: { children: ReactNode }) {
  const location = useLocation();
  const path = normalize(location.pathname);
  const { currentUser } = useAuth();
  const uid = currentUser?.id ?? null;
  const { isActive, isLoading } = useSubscription(uid);

  // Safety net over isLoading: even if a verification hangs, never block a
  // route decision longer than 4s, and never bounce a paying member during
  // the brief verify window after navigation.
  const [graceOver, setGraceOver] = useState(false);
  useEffect(() => {
    setGraceOver(false);
    const t = setTimeout(() => setGraceOver(true), 4000);
    return () => clearTimeout(t);
  }, [path, uid]);

  // 1) Signed out → login.
  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: path }} />;
  }

  // 2) Free actions for any signed-in user: post, plans, donate, browse lists.
  if (isFreePath(path) || BROWSE_EXACT.has(path)) {
    return <>{children}</>;
  }

  // 3) Active subscriber → everything.
  if (isActive) {
    return <>{children}</>;
  }

  // 4) Subscription still being verified → brief spinner, never a wrong bounce.
  if (isLoading && !graceOver) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
      </div>
    );
  }

  // 5) Confirmed unsubscribed on a gated page → plans.
  return <Navigate to="/subscription" replace state={{ from: path }} />;
}
// BAMBEH_END_TOKEN__SUBSCRIPTIONGUARD_FIX93__COMPLETE
