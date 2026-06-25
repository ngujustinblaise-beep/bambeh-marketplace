import type { SubscriptionTier } from "../types/subscription";
export type { SubscriptionTier };

export const tierRank: Record<SubscriptionTier, number> = {
  free: 0, basic: 1, premium: 2, enterprise: 3,
};

export const hasTier = (userTier: SubscriptionTier, required: SubscriptionTier): boolean =>
  tierRank[userTier] >= tierRank[required];

export const isSubscribed = (tier: SubscriptionTier | undefined): boolean =>
  tier !== undefined && tier !== "free";

export const canPostAd = (tier: SubscriptionTier | undefined): boolean =>
  hasTier(tier ?? "free", "basic");

export const canApplyForJob = (tier: SubscriptionTier | undefined): boolean =>
  hasTier(tier ?? "free", "free");

export const canBuyItem = (tier: SubscriptionTier | undefined): boolean =>
  hasTier(tier ?? "free", "free");

export const canContactSeller = (tier: SubscriptionTier | undefined): boolean =>
  hasTier(tier ?? "free", "free");

export const getUpgradeMessage = (feature: string): string =>
  `Upgrade your plan to access ${feature}.`;
