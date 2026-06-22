// @ts-nocheck
import React from "react";
import type { SubscriptionTier } from "../../types/subscription";
import { useLang } from '@/hooks/useAppLang';

interface SubscriptionBadgeProps {
  tier: SubscriptionTier;
  compact?: boolean;
}

const BADGE_CONFIG: Record<SubscriptionTier, { label: string; color: string; bg: string }> = {
  free:       { label: "Free",       color: "text-gray-600",  bg: "bg-gray-100"   },
  basic:      { label: "Basic",      color: "text-blue-700",  bg: "bg-blue-100"   },
  premium:    { label: "Premium",    color: "text-teal-700",  bg: "bg-teal-100"   },
  enterprise: { label: "Enterprise", color: "text-purple-700",bg: "bg-purple-100" },
};

const SubscriptionBadge: React.FC<SubscriptionBadgeProps> = ({ tier, compact }) => {
  const { t } = useLanguage();
  const cfg = BADGE_CONFIG[tier];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
      {compact ? tier[0].toUpperCase() : t("subBadge." + tier)}
    </span>
  );
};

export default SubscriptionBadge;




