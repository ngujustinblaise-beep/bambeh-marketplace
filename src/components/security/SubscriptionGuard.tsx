// BAMBEH_DEPLOY_TOKEN__SUBSCRIPTIONGUARD_FIX90_CLEAN
// FILE LOCATION: src/components/security/SubscriptionGuard.tsx
//
// BATCH 6 — the ONE gate. Rendered once inside MainLayout, it locks the whole
// app behind an active subscription. Only these stay open:
//   • posting a listing (free for any signed-in user)
//   • the plans page (/subscription) and donations (/donate)
// Everything else (messages, notifications, cart, profile, all modules) sends a
// non-subscriber to /subscription. A signed-out visitor goes to /login.
//
// Reuses the canonical hooks (no new subscription logic, no stubs):
//   useAuth().currentUser  +  useSubscription(uid).isActive (Supabase source of truth)

import { useEffect, useState, type ReactNode } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";

// Prefix match. Posting is free for signed-in users; plans + donate are open.
const FREE_PATHS = [
  "/subscription",
  "/donate",
  // posters + their redirect aliases (from App.tsx)
  "/jobs/post", "/marketplace/sell", "/services/offer", "/services/post",
  "/offer-service", "/rentals/list", "/rentals/post", "/list-property",
  "/vehicles/sell", "/post-ad", "/exchange/post", "/exchange/offer",
  "/tontine/create", "/farm-fresh/sell", "/sell-item", "/post-job", "/make-offer",
];

function isFreePath(path: string): boolean {
  return FREE_PATHS.some((p) => path === p || path.startsWith(p + "/"));
}

export default function SubscriptionGuard({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { currentUser } = useAuth();
  const uid = currentUser?.id ?? null;
  const { isActive } = useSubscription(uid);

  // The hook verifies against Supabase asynchronously; a genuinely subscribed
  // user whose local cache is empty reads isActive=false for a moment. Hold
  // briefly before redirecting so we NEVER bounce a paying member to the plans
  // page by mistake.
  const [graceOver, setGraceOver] = useState(false);
  useEffect(() => {
    setGraceOver(false);
    const t = setTimeout(() => setGraceOver(true), 1500);
    return () => clearTimeout(t);
  }, [location.pathname, uid]);

  // Not signed in → log in first.
  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Posting / plans / donate → always allowed.
  if (isFreePath(location.pathname)) {
    return <>{children}</>;
  }

  // Active subscription → full access.
  if (isActive) {
    return <>{children}</>;
  }

  // Signed in, gated route, not yet confirmed active → wait out the grace window.
  if (!graceOver) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
      </div>
    );
  }

  // Confirmed: no active subscription → to the plans page.
  return <Navigate to="/subscription" replace state={{ from: location.pathname }} />;
}
// BAMBEH_END_TOKEN__SUBSCRIPTIONGUARD_FIX90__COMPLETE
