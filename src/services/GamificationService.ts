// @ts-nocheck
import type {
  GamificationActionType,
  GamificationReward,
  GamificationRewardRecord,
  VendorReferral,
  ReferralBatchProgress,
  PositiveReviewProgress,
  VendorGamificationStats,
} from "../types/gamification";

const REWARDS: Record<GamificationActionType, GamificationReward> = {
  listing_created:       { id: "lc", actionType: "listing_created",       zermAmount: 5,   baseReward: 5,   multiplier: 1 },
  sale_completed:        { id: "sc", actionType: "sale_completed",         zermAmount: 20,  baseReward: 20,  multiplier: 1 },
  review_received:       { id: "rr", actionType: "review_received",        zermAmount: 10,  baseReward: 10,  multiplier: 1, requiredCount: 5 },
  profile_completed:     { id: "pc", actionType: "profile_completed",      zermAmount: 50,  baseReward: 50,  multiplier: 1 },
  referral_completed:    { id: "rc", actionType: "referral_completed",     zermAmount: 100, baseReward: 100, multiplier: 1, requiredCount: 3 },
  daily_login:           { id: "dl", actionType: "daily_login",            zermAmount: 2,   baseReward: 2,   multiplier: 1 },
  item_favorited:        { id: "if", actionType: "item_favorited",         zermAmount: 1,   baseReward: 1,   multiplier: 1 },
  chat_initiated:        { id: "ci", actionType: "chat_initiated",         zermAmount: 1,   baseReward: 1,   multiplier: 1 },
  subscription_purchased:{ id: "sp", actionType: "subscription_purchased", zermAmount: 30,  baseReward: 30,  multiplier: 1 },
};

export class GamificationService {
  calculateReward(action: GamificationActionType, tier?: string): number {
    const reward = REWARDS[action];
    if (!reward) return 0;
    const mult = (reward.tierMultipliers?.[tier ?? "free"]) ?? reward.multiplier ?? 1;
    return Math.round((reward.baseReward ?? reward.zermAmount) * mult);
  }

  createRewardRecord(
    vendorId: string,
    action: GamificationActionType,
    amount: number,
    description?: string,
  ): Omit<GamificationRewardRecord, "id"> {
    return {
      vendorId,
      actionType:   action,
      zermAmount:   amount,
      earnedAt:     new Date().toISOString(),
      status:       "pending",
      description,
      rewardAmount: amount,
    };
  }

  markRewarded(r: GamificationRewardRecord): GamificationRewardRecord {
    return { ...r, status: "paid" };
  }

  createReferral(referrerId: string, referredUserId: string): VendorReferral {
    return {
      id: `ref_${Date.now()}`,
      referrerId,
      referredUserId,
      status:       "pending",
      rewardAmount: 100,
      createdAt:    new Date().toISOString(),
    };
  }

  activateReferral(r: VendorReferral): VendorReferral  { return { ...r, status: "signed_up" }; }
  rewardReferral(r: VendorReferral):   VendorReferral  { return { ...r, status: "rewarded"  }; }

  initBatchProgress(vendorId: string): ReferralBatchProgress {
    return { vendorId, currentCount: 0, totalRewarded: 0 };
  }

  incrementBatch(p: ReferralBatchProgress): ReferralBatchProgress {
    return { ...p, currentCount: p.currentCount + 1 };
  }

  rewardBatch(p: ReferralBatchProgress): ReferralBatchProgress {
    return { ...p, currentCount: 0, totalRewarded: p.totalRewarded + 1, lastRewardedAt: new Date().toISOString() };
  }

  initReviewProgress(vendorId: string): PositiveReviewProgress {
    return { vendorId, currentCount: 0, totalRewarded: 0 };
  }

  incrementReview(p: PositiveReviewProgress): PositiveReviewProgress {
    return { ...p, currentCount: p.currentCount + 1 };
  }

  rewardReview(p: PositiveReviewProgress): PositiveReviewProgress {
    return { ...p, currentCount: 0, totalRewarded: p.totalRewarded + 1, lastRewardedAt: new Date().toISOString() };
  }

  buildStats(records: GamificationRewardRecord[], referrals: VendorReferral[]): VendorGamificationStats {
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const paid       = records.filter(r => r.status === "paid");
    return {
      totalZermEarned:     paid.reduce((s, r) => s + r.zermAmount, 0),
      zermEarnedThisMonth: paid.filter(r => new Date(r.earnedAt) >= monthStart).reduce((s, r) => s + r.zermAmount, 0),
      referralCount: referrals.length,
      reviewCount:   records.filter(r => r.actionType === "review_received").length,
      badges:        [],
    };
  }
}

export const gamificationService = new GamificationService();
