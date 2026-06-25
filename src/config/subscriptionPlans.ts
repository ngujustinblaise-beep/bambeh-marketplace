import type { SubscriptionPlan, SubscriptionTier } from "../types/subscription";

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  { id: "free",       name: "Free",       nameEn: "Free",       nameFr: "Gratuit",    tier: "free",       priceXAF: 0,     durationDays: 0,  features: ["Browse listings", "5 messages/day"] },
  { id: "basic",      name: "Basic",      nameEn: "Basic",      nameFr: "Basique",    tier: "basic",      priceXAF: 2000,  durationDays: 30, features: ["Unlimited messages", "10 listings", "Priority support"] },
  { id: "premium",    name: "Premium",    nameEn: "Premium",    nameFr: "Premium",    tier: "premium",    priceXAF: 5000,  durationDays: 30, features: ["Everything in Basic", "Featured listings", "Analytics", "ZermCoins"] },
  { id: "enterprise", name: "Enterprise", nameEn: "Enterprise", nameFr: "Entreprise", tier: "enterprise", priceXAF: 15000, durationDays: 30, features: ["Everything in Premium", "Account manager", "Custom integrations"] },
];

export const getSubscriptionPlan = (tier: SubscriptionTier): SubscriptionPlan | undefined =>
  SUBSCRIPTION_PLANS.find(p => p.tier === tier);

export const SUBSCRIPTION_PLANS_MAP = Object.fromEntries(
  SUBSCRIPTION_PLANS.map(p => [p.tier, p]),
) as Record<SubscriptionTier, SubscriptionPlan>;

