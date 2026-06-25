export type SubscriptionTier   = "free" | "basic" | "premium" | "enterprise";
export type SubscriptionTierUI = SubscriptionTier;
export type SubscriptionStatus = "active" | "inactive" | "cancelled" | "expired" | "trial";
export type SubscriptionFeatures = Record<string, boolean | number | string>;

export const PAYMENT_METHODS = {
  MTN_MOMO:     "mtn_momo"     as const,
  ORANGE_MONEY: "orange_money" as const,
  CARD:         "card"         as const,
  ZERM_COINS:   "zerm_coins"   as const,
  NOTCHPAY:     "notchpay"     as const,
  MTN:          "mtn_momo"     as const,
  ORANGE:       "orange_money" as const,
  ZERM:         "zerm_coins"   as const,
};

export type PaymentMethod =
  | "mtn_momo" | "orange_money" | "card" | "zerm_coins" | "notchpay";

export interface SubscriptionPlan {
  id: string;
  name: string;
  nameEn?: string;
  nameFr?: string;
  tier: SubscriptionTier;
  priceXAF: number;
  features: string[];
  durationDays: number;
}

export interface SubscriptionPayment {
  id: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: "pending" | "completed" | "failed";
  createdAt: string;
}

export interface UserSubscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  startedAt: string;
  expiresAt: string;
  autoRenew?: boolean;
}

