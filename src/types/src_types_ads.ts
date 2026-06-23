/**
 * src/types/src_types_ads.ts
 * Bambeh Marketplace — Advertisement & Promotion Types
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

// ─── Ad Status ────────────────────────────────────────────────────────────────
export type AdStatus = "active" | "paused" | "expired" | "pending" | "rejected";

// ─── Ad Placement ────────────────────────────────────────────────────────────
export type AdPlacement =
  | "banner_top"
  | "banner_bottom"
  | "sidebar"
  | "feed_inline"
  | "splash"
  | "category_header";

// ─── Ad Type ─────────────────────────────────────────────────────────────────
export type AdType = "image" | "video" | "text" | "sponsored_listing";

// ─── Ad Target Audience ──────────────────────────────────────────────────────
export interface AdTargetAudience {
  regions?: string[];          // e.g. ["Yaoundé", "Douala"]
  languages?: string[];        // e.g. ["fr", "en"]
  categories?: string[];
  minAge?: number;
  maxAge?: number;
}

// ─── Ad Metrics ──────────────────────────────────────────────────────────────
export interface AdMetrics {
  impressions: number;
  clicks: number;
  ctr: number;                 // click-through rate (0–1)
  conversions: number;
  spend: number;               // XAF
  reach: number;
}

// ─── Ad Creative ─────────────────────────────────────────────────────────────
export interface AdCreative {
  imageUrl?: string;
  videoUrl?: string;
  headline: string;
  body?: string;
  ctaLabel?: string;           // e.g. "Shop Now", "Learn More"
  destinationUrl: string;
}

// ─── Ad Campaign ─────────────────────────────────────────────────────────────
export interface AdCampaign {
  id: string;
  vendorId: string;
  name: string;
  type: AdType;
  placement: AdPlacement;
  status: AdStatus;
  creative: AdCreative;
  targeting: AdTargetAudience;
  metrics: AdMetrics;
  budgetXAF: number;
  dailyCapXAF?: number;
  startDate: string;           // ISO
  endDate?: string;            // ISO
  createdAt: string;
  updatedAt: string;
}

// ─── Sponsored Listing ────────────────────────────────────────────────────────
export interface SponsoredListing {
  id: string;
  listingId: string;
  vendorId: string;
  budgetXAF: number;
  bidPerClickXAF: number;
  placement: AdPlacement;
  status: AdStatus;
  impressions: number;
  clicks: number;
  startDate: string;
  endDate?: string;
  createdAt: string;
}

// ─── Flash Deal Ad ────────────────────────────────────────────────────────────
export interface FlashDealAd {
  id: string;
  listingId: string;
  vendorId: string;
  discountPercent: number;
  originalPriceXAF: number;
  discountedPriceXAF: number;
  totalSlots: number;
  claimedSlots: number;
  endsAt: string;              // ISO
  status: "active" | "sold_out" | "expired";
  createdAt: string;
}

// ─── Banner Ad ────────────────────────────────────────────────────────────────
export interface BannerAd {
  id: string;
  imageUrl: string;
  linkUrl: string;
  altText: string;
  placement: AdPlacement;
  isActive: boolean;
  priority: number;
  startDate?: string;
  endDate?: string;
}

// ─── Ad Request ──────────────────────────────────────────────────────────────
export interface CreateAdCampaignRequest {
  name: string;
  type: AdType;
  placement: AdPlacement;
  creative: AdCreative;
  targeting: AdTargetAudience;
  budgetXAF: number;
  dailyCapXAF?: number;
  startDate: string;
  endDate?: string;
}

// ─── Ad Response ─────────────────────────────────────────────────────────────
export interface AdCampaignResponse {
  data: AdCampaign | null;
  error: string | null;
}

export interface AdCampaignListResponse {
  data: AdCampaign[];
  total: number;
  error: string | null;
}

// ─── Notification Ad ─────────────────────────────────────────────────────────
export interface PromotionNotification {
  id: string;
  title: string;
  body: string;
  imageUrl?: string;
  targetUrl: string;
  sentAt: string;
  openedAt?: string;
  isRead: boolean;
}

// ─── Ad Slot Config ──────────────────────────────────────────────────────────
export interface AdSlotConfig {
  placement: AdPlacement;
  maxAdsPerPage: number;
  minBidXAF: number;
  supportedTypes: AdType[];
  isActive: boolean;
}

