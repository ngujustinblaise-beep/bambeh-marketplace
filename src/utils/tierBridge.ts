// @ts-nocheck
import type { SubscriptionTier } from "../types/subscription";
import { SUBSCRIPTION_PLANS } from "../config/subscriptionPlans";
export type { SubscriptionTier };

export const toTier = (raw: string | undefined): SubscriptionTier => {
  const valid: SubscriptionTier[] = ["free", "basic", "premium", "enterprise"];
  return valid.includes(raw as SubscriptionTier) ? (raw as SubscriptionTier) : "free";
};

export type AuthTier = SubscriptionTier;

export const getFeatureAccess = (tier: SubscriptionTier, feature: string): boolean => {
  const plan = SUBSCRIPTION_PLANS.find(p => p.tier === tier);
  return plan?.features.some(f => f.toLowerCase().includes(feature.toLowerCase())) ?? false;
};

export const meetsAuthTierRequirement = (
  userTier: SubscriptionTier,
  required: SubscriptionTier,
): boolean => {
  const rank: Record<SubscriptionTier, number> = { free: 0, basic: 1, premium: 2, enterprise: 3 };
  return rank[userTier] >= rank[required];
};

export { SUBSCRIPTION_PLANS };

export const isGoldTier = (tier: SubscriptionTier | undefined): boolean =>
  tier === "premium" || tier === "enterprise";

export const canBecomeVendor = (tier: SubscriptionTier | undefined): boolean =>
  tier !== undefined && tier !== "free";

export const getVendorUpgradeMessage = (): string =>
  "Upgrade to Basic or higher to become a vendor on Bambeh.";

export interface ZermCoinPackage {
  id: string;
  name: string;
  amount: number;
  bonus: number;
  priceXAF: number;
  popular?: boolean;
}

export const ZERM_COIN_PACKAGES: ZermCoinPackage[] = [
  { id: "starter",    name: "Starter",    amount: 100,  bonus: 0,   priceXAF: 1000,  popular: false },
  { id: "popular",    name: "Popular",    amount: 500,  bonus: 50,  priceXAF: 4500,  popular: true  },
  { id: "premium",    name: "Premium",    amount: 1000, bonus: 150, priceXAF: 8500,  popular: false },
  { id: "enterprise", name: "Enterprise", amount: 5000, bonus: 1000,priceXAF: 40000, popular: false },
];

export const getTotalZermCoins = (pkg: ZermCoinPackage): number => pkg.amount + pkg.bonus;
