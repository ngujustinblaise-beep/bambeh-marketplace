/**
 * src/components/security/AuthGate.tsx â€” Bambeh Marketplace
 *
 * SPEED: Subscription check is INSTANT â€” reads localStorage synchronously.
 * No spinner. No delay. No network wait. Decision in microseconds.
 *
 * Flow:
 *   - Has valid localStorage entry?  â†’ show the page immediately âœ…
 *   - No localStorage entry?         â†’ redirect to /subscription instantly âœ…
 *   - Not logged in?                 â†’ redirect to /login instantly âœ…
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

  // isLoading is ALWAYS false from our new hook â€” no spinner for subscription
  const { isActive } = useSubscription(userId);

  // â”€â”€ Auth is still initialising (Firebase/Supabase cold start) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // This only happens once on first app load â€” typically < 500ms
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  // â”€â”€ Not logged in â†’ login page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // â”€â”€ Admin â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (level === "admin") {
    if (!isAdmin) return <Navigate to="/" replace />;
    return <>{children}</>;
  }

  // â”€â”€ Vendor â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (level === "vendor") {
    const ok = isVendor ?? (user as any)?.role === "vendor" ?? (user as any)?.isVendor;
    if (!ok) return <Navigate to="/vendor/register" state={{ from: location }} replace />;
    return <>{children}</>;
  }

  // â”€â”€ User (just logged in) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (level === "user") {
    return <>{children}</>;
  }

  // â”€â”€ Subscription â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // isActive is decided synchronously from localStorage â€” zero network wait
  // Active   â†’ show the page RIGHT NOW
  // Inactive â†’ redirect to /subscription RIGHT NOW
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
