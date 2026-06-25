// @ts-nocheck
import React from "react";
import { Navigate } from "react-router-dom";
import type { AuthUser } from "@/types/auth";
import type { SubscriptionTier } from "@/types/subscription";

interface PrivilegeGuardProps {
  user: AuthUser | null;
  requiredTier?: SubscriptionTier;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const TIER_RANK: Record<SubscriptionTier, number> = {
  free: 0, basic: 1, premium: 2, enterprise: 3,
};

const PrivilegeGuard: React.FC<PrivilegeGuardProps> = ({
  user, requiredTier = "free", children, fallback,
}) => {
  if (!user) return <Navigate to="/login" replace />;
  const userTier = user.tier ?? "free";
  const hasAccess = TIER_RANK[userTier] >= TIER_RANK[requiredTier];
  if (!hasAccess) {
    return fallback ? <>{fallback}</> : <Navigate to="/subscription" replace />;
  }
  return <>{children}</>;
};

export default PrivilegeGuard;





