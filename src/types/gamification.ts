export type GamificationActionType =
  | "listing_created"
  | "sale_completed"
  | "review_received"
  | "profile_completed"
  | "referral_completed"
  | "daily_login"
  | "item_favorited"
  | "chat_initiated"
  | "subscription_purchased";

export interface GamificationReward {
  id: string;
  actionType: GamificationActionType;
  zermAmount: number;
  multiplier?: number;
  baseReward?: number;
  tierMultipliers?: Record<string, number>;
  requiredCount?: number;
}

export interface GamificationRewardRecord {
  id?: string;
  vendorId: string;
  actionType: GamificationActionType;
  zermAmount: number;
  earnedAt: string;
  status: "pending" | "paid" | "cancelled";
  description?: string;
  rewardAmount?: number;
}

export interface VendorReferral {
  id: string;
  referrerId: string;
  referredUserId: string;
  status: "active" | "pending" | "signed_up" | "rewarded";
  rewardAmount?: number;
  createdAt: string;
}

export interface ReferralBatchProgress {
  id?: string;
  vendorId: string;
  currentCount: number;
  totalRewarded: number;
  lastRewardedAt?: string;
}

export interface PositiveReviewProgress {
  id?: string;
  vendorId: string;
  currentCount: number;
  totalRewarded: number;
  lastRewardedAt?: string;
  periodStart?: string;
}

export interface VendorGamificationStats {
  totalZermEarned: number;
  zermEarnedThisMonth?: number;
  referralCount: number;
  reviewCount: number;
  badges: string[];
}

export interface VendorCommissionSummary {
  totalCommissionXAF: number;
  pendingCommissionXAF: number;
  paidCommissionXAF: number;
}
