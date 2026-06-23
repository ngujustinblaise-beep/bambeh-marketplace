/**
 * src/types/vendor.monetization.types.ts
 * Bambeh Marketplace — Vendor Monetization & Subscription Types
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

// ─── Subscription Tier ───────────────────────────────────────────────────────
export type SubscriptionTier =
  | "free" | "starter" | "growth" | "premium" | "enterprise";

/** @alias kept for files using VendorSubscriptionTier */
export type VendorSubscriptionTier = SubscriptionTier;

// ─── Billing Period ──────────────────────────────────────────────────────────
export type BillingPeriod = "monthly" | "quarterly" | "annual";

// ─── Payment Provider ────────────────────────────────────────────────────────
export type PaymentProvider = "mtn_momo" | "orange_money" | "notchpay" | "cash";

// ─── Subscription Status ─────────────────────────────────────────────────────
export type SubscriptionStatus =
  | "active" | "trialing" | "past_due" | "canceled" | "unpaid" | "paused" | "expired";

// ─── Feature Flags ───────────────────────────────────────────────────────────
export interface VendorFeatureFlags {
  analytics: boolean;
  bulkUpload: boolean;
  featuredListings: boolean;
  prioritySupport: boolean;
  verifiedBadge: boolean;
  autoMessaging: boolean;
  advancedAnalytics: boolean;
  customStorefront: boolean;
  apiAccess: boolean;
  multipleStores: boolean;
}

/** @alias kept for files using VendorSubscriptionFeatures */
export type VendorSubscriptionFeatures = VendorFeatureFlags;

// ─── Plan Limits ─────────────────────────────────────────────────────────────
export interface PlanLimits {
  maxListings: number;
  maxImages: number;
  maxMonthlyOrders: number;
  commissionPercent: number;
  featuredListingSlots: number;
  bulkUploadLimit: number;
  analyticsRetentionDays: number;
  supportResponseHours: number;
}

// ─── Subscription Plan ───────────────────────────────────────────────────────
export interface SubscriptionPlan {
  id: string;
  tier: SubscriptionTier;
  name: string;
  tagline: string;
  monthlyPriceXAF: number;
  quarterlyPriceXAF: number;
  annualPriceXAF: number;
  features: VendorFeatureFlags;
  limits: PlanLimits;
  isPopular: boolean;
  isAvailable: boolean;
  trialDays: number;
  createdAt: string;
  updatedAt: string;
}

/** @alias kept for files using VendorSubscriptionPlan */
export type VendorSubscriptionPlan = SubscriptionPlan;

// ─── Subscription Change ─────────────────────────────────────────────────────
export interface SubscriptionChange {
  vendorId: string;
  fromTier: SubscriptionTier;
  toTier: SubscriptionTier;
  billingPeriod: BillingPeriod;
  reason?: string;
  changedAt: string;
}

// ─── Vendor Subscription ─────────────────────────────────────────────────────
export interface VendorSubscription {
  id: string;
  vendorId: string;
  planId: string;
  plan?: SubscriptionPlan;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  billingPeriod: BillingPeriod;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  // date aliases used by legacy services
  startDate?: string;
  endDate?: string;
  trialStart?: string;
  trialEnd?: string;
  canceledAt?: string;
  cancelReason?: string;
  autoRenew: boolean;
  priceXAF: number;
  currency: "XAF";
  // usage tracking
  listingsUsed?: number;
  lastPaymentAmount?: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Payment Transaction ─────────────────────────────────────────────────────
export interface VendorPaymentTransaction {
  id: string;
  vendorId: string;
  subscriptionId?: string;
  reference: string;
  provider: PaymentProvider;
  amountXAF: number;
  status: "pending" | "completed" | "failed" | "refunded";
  description: string;
  paidAt?: string;
  failedAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// ─── Earnings & Payouts ──────────────────────────────────────────────────────
export interface VendorEarnings {
  totalSalesXAF: number;
  totalCommissionXAF: number;
  netEarningsXAF: number;
  pendingWithdrawalXAF: number;
  completedWithdrawalXAF: number;
  lastUpdated: string;
}

export interface WithdrawalRequest {
  id: string;
  vendorId: string;
  amountXAF: number;
  provider: PaymentProvider;
  accountNumber: string;
  accountName: string;
  status: "pending" | "processing" | "completed" | "rejected";
  requestedAt: string;
  processedAt?: string;
  rejectionReason?: string;
}

// ─── Zerm Coins ──────────────────────────────────────────────────────────────
export interface ZermBalance {
  vendorId: string;
  totalCoins: number;
  earnedCoins: number;
  spentCoins: number;
  expiringCoins?: number;
  expiresAt?: string;
  updatedAt: string;
}

export interface ZermTransaction {
  id: string;
  vendorId: string;
  type: "earn" | "spend" | "expire" | "bonus";
  coinsAmount: number;
  description: string;
  referenceId?: string;
  createdAt: string;
}

// ─── Analytics Snapshot ──────────────────────────────────────────────────────
export interface VendorAnalyticsSnapshot {
  vendorId: string;
  period: "today" | "week" | "month" | "year";
  totalViews: number;
  uniqueVisitors: number;
  profileViews: number;
  listingViews: number;
  ordersPlaced: number;
  ordersCompleted: number;
  ordersCanceled: number;
  revenueXAF: number;
  commissionXAF: number;
  netRevenueXAF: number;
  averageOrderValueXAF: number;
  conversionRate: number;
  newFollowers: number;
  favoriteCount: number;
  reviewsReceived: number;
  averageRating: number;
  generatedAt: string;
}

// ─── Commission Types ─────────────────────────────────────────────────────────
export type CommissionableTransactionType =
  | "marketplace_sale" | "service_booking" | "rental" | "vehicle_sale"
  | "job_post" | "subscription" | "ad_placement" | "zerm_purchase";

export interface CommissionRate {
  tier: SubscriptionTier;
  transactionType: CommissionableTransactionType;
  ratePercent: number;
  minimumXAF: number;
  maximumXAF?: number;
}

export interface CommissionCalculation {
  transactionId: string;
  transactionType: CommissionableTransactionType;
  grossAmountXAF: number;
  ratePercent: number;
  commissionXAF: number;
  netAmountXAF: number;
  vendorTier: SubscriptionTier;
  calculatedAt: string;
}

export interface CommissionRecord {
  id: string;
  vendorId: string;
  transactionId: string;
  transactionType: CommissionableTransactionType;
  grossAmountXAF: number;
  commissionXAF: number;
  netAmountXAF: number;
  status: "pending" | "confirmed" | "paid" | "disputed";
  createdAt: string;
  paidAt?: string;
}

export interface VendorCommissionSummary {
  vendorId: string;
  period: "week" | "month" | "year" | "all";
  totalGrossXAF: number;
  totalCommissionXAF: number;
  totalNetXAF: number;
  transactionCount: number;
  byType: Partial<Record<CommissionableTransactionType, number>>;
  generatedAt: string;
}

// ─── Gamification ─────────────────────────────────────────────────────────────
export type GamificationActionType =
  | "first_listing" | "five_listings" | "first_sale" | "ten_sales"
  | "profile_complete" | "verified_seller" | "positive_review"
  | "referral_signup" | "referral_batch" | "premium_upgrade"
  | "daily_login" | "share_listing";

export interface GamificationReward {
  id: string;
  actionType: GamificationActionType;
  zermCoins: number;
  badgeId?: string;
  description: string;
  isRepeatable: boolean;
  maxRepeatCount?: number;
}

export interface GamificationRewardRecord {
  id: string;
  vendorId: string;
  actionType: GamificationActionType;
  rewardId: string;
  zermCoinsEarned: number;
  earnedAt: string;
  metadata?: Record<string, unknown>;
}

export interface VendorGamificationStats {
  vendorId: string;
  totalZermEarned: number;
  currentZermBalance: number;
  level: number;
  nextLevelThreshold: number;
  completedActions: GamificationActionType[];
  badges: string[];
  streak: number;
  lastActiveAt: string;
}

// ─── Referral ─────────────────────────────────────────────────────────────────
export interface VendorReferral {
  id: string;
  referrerId: string;
  referredId: string;
  referralCode: string;
  status: "pending" | "signed_up" | "active" | "rewarded";
  rewardXAF: number;
  rewardZerm: number;
  createdAt: string;
  activatedAt?: string;
  rewardedAt?: string;
}

export interface ReferralBatchProgress {
  vendorId: string;
  batchSize: number;
  currentCount: number;
  nextRewardAt: number;
  totalReferred: number;
  totalRewardsEarned: number;
}

export interface PositiveReviewProgress {
  vendorId: string;
  totalPositiveReviews: number;
  pendingRewardAt: number;
  rewardsUnlocked: number;
}

// ─── Commission Config ────────────────────────────────────────────────────────
export interface CommissionConfig {
  tier: SubscriptionTier;
  basePercent: number;
  categoryOverrides?: Record<string, number>;
  minimumXAF: number;
  maximumXAF?: number;
}

// ─── Plan Change ─────────────────────────────────────────────────────────────
export interface PlanChangeRequest {
  vendorId: string;
  fromTier: SubscriptionTier;
  toTier: SubscriptionTier;
  billingPeriod: BillingPeriod;
  reason?: string;
}

// ─── API Response Wrappers ──────────────────────────────────────────────────
export interface SubscriptionResponse {
  data: VendorSubscription | null;
  error: string | null;
}

export interface EarningsResponse {
  data: VendorEarnings | null;
  error: string | null;
}

export interface AnalyticsResponse {
  data: VendorAnalyticsSnapshot | null;
  error: string | null;
}

