/**
 * src/types/src_types_ads.ts
 * Bambeh Marketplace â€” Advertisement & Promotion Types
 * Â© 2026 Bambeh Marketplace. All rights reserved.
 */

// â”€â”€â”€ Ad Status â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export type AdStatus = "active" | "paused" | "expired" | "pending" | "rejected";

// â”€â”€â”€ Ad Placement â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export type AdPlacement =
  | "banner_top"
  | "banner_bottom"
  | "sidebar"
  | "feed_inline"
  | "splash"
  | "category_header";

// â”€â”€â”€ Ad Type â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export type AdType = "image" | "video" | "text" | "sponsored_listing";

// â”€â”€â”€ Ad Target Audience â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export interface AdTargetAudience {
  regions?: string[];          // e.g. ["YaoundÃ©", "Douala"]
  languages?: string[];        // e.g. ["fr", "en"]
  categories?: string[];
  minAge?: number;
  maxAge?: number;
}

// â”€â”€â”€ Ad Metrics â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export interface AdMetrics {
  impressions: number;
  clicks: number;
  ctr: number;                 // click-through rate (0â€“1)
  conversions: number;
  spend: number;               // XAF
  reach: number;
}

// â”€â”€â”€ Ad Creative â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export interface AdCreative {
  imageUrl?: string;
  videoUrl?: string;
  headline: string;
  body?: string;
  ctaLabel?: string;           // e.g. "Shop Now", "Learn More"
  destinationUrl: string;
}

// â”€â”€â”€ Ad Campaign â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€ Sponsored Listing â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€ Flash Deal Ad â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€ Banner Ad â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€ Ad Request â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€ Ad Response â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export interface AdCampaignResponse {
  data: AdCampaign | null;
  error: string | null;
}

export interface AdCampaignListResponse {
  data: AdCampaign[];
  total: number;
  error: string | null;
}

// â”€â”€â”€ Notification Ad â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€ Ad Slot Config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export interface AdSlotConfig {
  placement: AdPlacement;
  maxAdsPerPage: number;
  minBidXAF: number;
  supportedTypes: AdType[];
  isActive: boolean;
}
