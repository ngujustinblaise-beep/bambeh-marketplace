// @ts-nocheck
import React from "react";
import type { SubscriptionTier } from "../../types/subscription";
import { meetsAuthTierRequirement, getFeatureAccess } from "../../utils/tierBridge";
import type { AuthTier } from "../../utils/tierBridge";
import { SUBSCRIPTION_PLANS } from "../../config/subscription";
import { useNavigate } from "react-router-dom";

export type { AuthTier };
export { getFeatureAccess, meetsAuthTierRequirement, SUBSCRIPTION_PLANS };

interface CompactLockedContentProps {
  message?: string;
  onUpgrade?: () => void;
}

const CompactLockedContent: React.FC<CompactLockedContentProps> = ({
  message = "Upgrade to access this feature.",
  onUpgrade,
}) => (
  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-sm text-gray-600">
    <span>??</span>
    <span>{message}</span>
    {onUpgrade && (
      <button onClick={onUpgrade} className="text-teal-600 font-medium hover:underline ml-auto">
        Upgrade
      </button>
    )}
  </div>
);

interface FreeUserBrowseOnlyProps {
  featureName?: string;
  onUpgrade?: () => void;
}

const FreeUserBrowseOnly: React.FC<FreeUserBrowseOnlyProps> = ({ featureName, onUpgrade }) => (
  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-center">
    <p className="font-semibold text-blue-800 text-sm">Browse Only Mode</p>
    <p className="text-blue-600 text-xs mt-1">
      {featureName ? `Subscribe to use ${featureName}.` : "Subscribe to unlock all features."}
    </p>
    {onUpgrade && (
      <button onClick={onUpgrade}
        className="mt-3 bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-medium">
        Upgrade Now
      </button>
    )}
  </div>
);

interface TeaserContentProps {
  children: React.ReactNode;
  blurAmount?: number;
  onUpgrade?: () => void;
}

const TeaserContent: React.FC<TeaserContentProps> = ({ children, blurAmount = 4, onUpgrade }) => (
  <div className="relative">
    <div style={{ filter: `blur(${blurAmount}px)` }} className="pointer-events-none select-none">
      {children}
    </div>
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="bg-white/90 rounded-xl p-4 text-center shadow-lg">
        <p className="font-semibold text-sm">?? Premium Content</p>
        {onUpgrade && (
          <button onClick={onUpgrade}
            className="mt-2 bg-teal-600 text-white px-4 py-1 rounded-full text-xs">
            Unlock
          </button>
        )}
      </div>
    </div>
  </div>
);

interface FeatureGateProps {
  requiredTier?: SubscriptionTier;
  userTier?: SubscriptionTier;
  featureName?: string;
  mode?: "compact" | "browse" | "teaser" | "block";
  children: React.ReactNode;
}

const FeatureGate: React.FC<FeatureGateProps> = ({
  requiredTier = "basic",
  userTier     = "free",
  featureName,
  mode = "compact",
  children,
}) => {
  const navigate  = useNavigate();
  const hasAccess = meetsAuthTierRequirement(userTier, requiredTier);
  const upgrade   = () => navigate("/subscription");

  if (hasAccess) return <>{children}</>;

  if (mode === "teaser")  return <TeaserContent onUpgrade={upgrade}>{children}</TeaserContent>;
  if (mode === "browse")  return <FreeUserBrowseOnly featureName={featureName} onUpgrade={upgrade} />;
  if (mode === "block")   return <FreeUserBrowseOnly featureName={featureName} onUpgrade={upgrade} />;
  return <CompactLockedContent message={`Upgrade to ${requiredTier} to use ${featureName ?? "this feature"}.`} onUpgrade={upgrade} />;
};

export default FeatureGate;
export { CompactLockedContent, FreeUserBrowseOnly, TeaserContent };





