// @ts-nocheck
import React from "react";
import { useNavigate } from "react-router-dom";
import type { AuthUser } from "@/types/auth";
import type { SubscriptionTier } from "@/types/subscription";

interface PremiumGateProps {
  user: AuthUser | null;
  requiredTier?: SubscriptionTier;
  children: React.ReactNode;
  featureName?: string;
}

const RANK: Record<SubscriptionTier, number> = {
  free: 0, basic: 1, premium: 2, enterprise: 3,
};

const PremiumGate: React.FC<PremiumGateProps> = ({
  user, requiredTier = "basic", children, featureName,
}) => {
  const navigate = useNavigate();
  const tier = user?.tier ?? "free";
  const hasAccess = RANK[tier] >= RANK[requiredTier];

  if (hasAccess) return <>{children}</>;

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
      <div className="text-4xl mb-3">??</div>
      <p className="font-semibold text-gray-800 mb-1">
        {featureName ? featureName + " requires " + requiredTier : "Premium Feature"}
      </p>
      <p className="text-gray-500 text-sm mb-4">
        Upgrade your plan to access this feature.
      </p>
      <button
        onClick={() => navigate("/subscription")}
        className="bg-teal-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-teal-700"
      >
        Upgrade Now
      </button>
    </div>
  );
};

export default PremiumGate;





