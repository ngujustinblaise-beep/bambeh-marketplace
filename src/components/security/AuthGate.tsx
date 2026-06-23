/**
 * src/components/security/AuthGate.tsx — Bambeh Marketplace
 *
 * SPEED: Subscription check is INSTANT — reads localStorage synchronously.
 * No spinner. No delay. No network wait. Decision in microseconds.
 *
 * Flow:
 *   - Has valid localStorage entry?  → show the page immediately ✅
 *   - No localStorage entry?         → redirect to /subscription instantly ✅
 *   - Not logged in?                 → redirect to /login instantly ✅
 */

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Loader2 } from "lucide-react";

type RequireLevel = "user" | "subscription" | "vendor" | "admin";

interface AuthGateProps {
  require: RequireLevel;
  children: React.ReactNode;
}

const AuthGate: React.FC<AuthGateProps> = ({ require: level, children }) => {
  const location = useLocation();
  const { user, loading: authLoading, isAdmin, isVendor } = useAuth();

  const userId = level === "subscription"
    ? ((user as any)?.uid || (user as any)?.id || null)
    : null;

  // isLoading is ALWAYS false from our new hook — no spinner for subscription
  const { isActive } = useSubscription(userId);

  // ── Auth is still initialising (Firebase/Supabase cold start) ────────────
  // This only happens once on first app load — typically < 500ms
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  // ── Not logged in → login page ────────────────────────────────────────────
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ── Admin ──────────────────────────────────────────────────────────────────
  if (level === "admin") {
    if (!isAdmin) return <Navigate to="/" replace />;
    return <>{children}</>;
  }

  // ── Vendor ─────────────────────────────────────────────────────────────────
  if (level === "vendor") {
    const ok = (isVendor ?? false) || (user as any)?.role === "vendor" || (user as any)?.isVendor === true;
    if (!ok) return <Navigate to="/vendor/register" state={{ from: location }} replace />;
    return <>{children}</>;
  }

  // ── User (just logged in) ──────────────────────────────────────────────────
  if (level === "user") {
    return <>{children}</>;
  }

  // ── Subscription ───────────────────────────────────────────────────────────
  // isActive is decided synchronously from localStorage — zero network wait
  // Active   → show the page RIGHT NOW
  // Inactive → redirect to /subscription RIGHT NOW
  if (level === "subscription") {
    if (!isActive) {
      return (
        <Navigate
          to="/subscription"
          state={{ from: location, requiresSubscription: true }}
          replace
        />
      );
    }
    return <>{children}</>;
  }

  return <>{children}</>;
};

export default AuthGate;






