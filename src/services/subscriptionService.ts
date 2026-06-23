// @ts-nocheck
import type {
  SubscriptionTier, SubscriptionStatus, PaymentMethod,
  SubscriptionPayment, UserSubscription,
} from "../types/subscription";
export type { SubscriptionTier, SubscriptionStatus, PaymentMethod, SubscriptionPayment };

export class SubscriptionService {
  isActive(sub: UserSubscription | null): boolean {
    if (!sub) return false;
    return sub.status === "active" && new Date(sub.expiresAt) > new Date();
  }
  daysLeft(sub: UserSubscription | null): number {
    if (!sub) return 0;
    return Math.max(0, Math.floor((new Date(sub.expiresAt).getTime() - Date.now()) / 86_400_000));
  }
}

export const subscriptionService = new SubscriptionService();

export const isSubscriptionActive = (sub: UserSubscription | null): boolean =>
  subscriptionService.isActive(sub);

export const getSubscriptionDaysLeft = (sub: UserSubscription | null): number =>
  subscriptionService.daysLeft(sub);

export const createTrialSubscription = (userId: string): UserSubscription => {
  const now = new Date(), exp = new Date(now);
  exp.setDate(exp.getDate() + 7);
  return { id: `trial_${userId}`, userId, tier: "basic", status: "trial", startedAt: now.toISOString(), expiresAt: exp.toISOString(), autoRenew: false };
};
