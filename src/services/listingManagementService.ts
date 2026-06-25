/**
 * LISTING MANAGEMENT SERVICE
 * FILE LOCATION: src/services/listingManagementService.ts
 * � 2025 Bamb�. All rights reserved.
 */

export interface ListingMetadata {
  id: string;
  type: "job" | "marketplace" | "rental" | "car-rental" | "service" | "exchange";
  userId: string;
  createdAt: string;
  expiresAt: string;
  durationDays: number;
  status: "active" | "expired" | "archived" | "pending" | "suspended";
  autoRenew: boolean;
  renewalCount: number;
  lastRenewedAt?: string;
  isPremium: boolean;
  isFeatured: boolean;
  lastBumpedAt?: string;
  bumpCount: number;
  views: number;
  clicks: number;
  favorites: number;
  inquiries: number;
  lastViewedAt?: string;
  location: { region: string; division: string; subdivision: string; quarter: string };
  dataKey: string;
}

class ListingManagementService {
  private readonly STORAGE_KEY = "Bambeh_listing_metadata";
  private readonly DEFAULT_DURATION_DAYS = 30;
  private readonly MAX_FREE_DURATION = 30;
  private readonly PREMIUM_DURATION = 90;

  createListing(params: {
    type: ListingMetadata["type"];
    userId: string;
    dataKey: string;
    location: ListingMetadata["location"];
    isPremium?: boolean;
    durationDays?: number;
  }): ListingMetadata {
    const now = new Date();
    const durationDays = params.isPremium
      ? this.PREMIUM_DURATION
      : params.durationDays || this.DEFAULT_DURATION_DAYS;

    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    const listing: ListingMetadata = {
      id: `listing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: params.type,
      userId: params.userId,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      durationDays,
      status: "active",
      autoRenew: false,
      renewalCount: 0,
      isPremium: params.isPremium || false,
      isFeatured: false,
      bumpCount: 0,
      views: 0,
      clicks: 0,
      favorites: 0,
      inquiries: 0,
      location: params.location,
      dataKey: params.dataKey,
    };

    this.saveListing(listing);
    return listing;
  }

  getListing(listingId: string): ListingMetadata | null {
    const all = this.getAllListings();
    return all.find((l) => l.id === listingId) || null;
  }

  getAllListings(): ListingMetadata[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  getActiveListings(type?: ListingMetadata["type"]): ListingMetadata[] {
    const all = this.getAllListings();
    return all.filter((l) => {
      const isActive = l.status === "active" && new Date(l.expiresAt) > new Date();
      return type ? isActive && l.type === type : isActive;
    });
  }

  getUserListings(userId: string, includeExpired = false): ListingMetadata[] {
    const all = this.getAllListings();
    return all.filter((l) => {
      if (l.userId !== userId) return false;
      if (!includeExpired && l.status !== "active") return false;
      return true;
    });
  }

  updateListing(listingId: string, updates: Partial<ListingMetadata>): boolean {
    const all = this.getAllListings();
    const index = all.findIndex((l) => l.id === listingId);
    if (index === -1) return false;
    all[index] = { ...all[index], ...updates };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
    return true;
  }

  private saveListing(listing: ListingMetadata): void {
    const all = this.getAllListings();
    all.push(listing);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
  }

  renewListing(listingId: string, extendDays?: number): boolean {
    const listing = this.getListing(listingId);
    if (!listing) return false;

    const now = new Date();
    const extension = extendDays || listing.durationDays;
    const baseDate = new Date(listing.expiresAt) > now ? new Date(listing.expiresAt) : now;
    baseDate.setDate(baseDate.getDate() + extension);

    return this.updateListing(listingId, {
      expiresAt: baseDate.toISOString(),
      status: "active",
      renewalCount: listing.renewalCount + 1,
      lastRenewedAt: now.toISOString(),
    });
  }

  setAutoRenew(listingId: string, enabled: boolean): boolean {
    return this.updateListing(listingId, { autoRenew: enabled });
  }

  bumpListing(listingId: string): boolean {
    const listing = this.getListing(listingId);
    if (!listing) return false;

    const now = new Date();
    const lastBump = listing.lastBumpedAt ? new Date(listing.lastBumpedAt) : null;

    if (!listing.isPremium && lastBump) {
      const hoursSinceLastBump = (now.getTime() - lastBump.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastBump < 24) return false;
    }

    return this.updateListing(listingId, {
      lastBumpedAt: now.toISOString(),
      bumpCount: listing.bumpCount + 1,
    });
  }

  trackView(listingId: string): boolean {
    const listing = this.getListing(listingId);
    if (!listing) return false;
    return this.updateListing(listingId, { views: listing.views + 1, lastViewedAt: new Date().toISOString() });
  }

  trackClick(listingId: string): boolean {
    const listing = this.getListing(listingId);
    if (!listing) return false;
    return this.updateListing(listingId, { clicks: listing.clicks + 1 });
  }

  trackFavorite(listingId: string): boolean {
    const listing = this.getListing(listingId);
    if (!listing) return false;
    return this.updateListing(listingId, { favorites: listing.favorites + 1 });
  }

  trackInquiry(listingId: string): boolean {
    const listing = this.getListing(listingId);
    if (!listing) return false;
    return this.updateListing(listingId, { inquiries: listing.inquiries + 1 });
  }

  archiveListing(listingId: string): boolean {
    return this.updateListing(listingId, { status: "archived" });
  }

  deleteListing(listingId: string): boolean {
    const all = this.getAllListings();
    const filtered = all.filter((l) => l.id !== listingId);
    if (filtered.length === all.length) return false;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }

  checkExpiredListings(): { expired: ListingMetadata[]; autoRenewed: ListingMetadata[] } {
    const all = this.getAllListings();
    const now = new Date();
    const expired: ListingMetadata[] = [];
    const autoRenewed: ListingMetadata[] = [];

    all.forEach((listing) => {
      if (listing.status !== "active") return;
      const expiryDate = new Date(listing.expiresAt);
      if (expiryDate <= now) {
        if (listing.autoRenew && listing.isPremium) {
          this.renewListing(listing.id);
          autoRenewed.push(listing);
        } else {
          this.updateListing(listing.id, { status: "expired" });
          expired.push(listing);
        }
      }
    });

    return { expired, autoRenewed };
  }

  getListingsExpiringSoon(days: number = 3): ListingMetadata[] {
    const all = this.getActiveListings();
    const now = new Date();
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + days);

    return all.filter((l) => {
      const expiryDate = new Date(l.expiresAt);
      return expiryDate > now && expiryDate <= threshold;
    });
  }

  getListingStats(listingId: string): {
    daysRemaining: number;
    daysActive: number;
    viewsPerDay: number;
    clickThroughRate: number;
    inquiryRate: number;
  } | null {
    const listing = this.getListing(listingId);
    if (!listing) return null;

    const now = new Date();
    const createdDate = new Date(listing.createdAt);
    const expiryDate = new Date(listing.expiresAt);

    const daysActive = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    return {
      daysRemaining,
      daysActive,
      viewsPerDay: daysActive > 0 ? listing.views / daysActive : 0,
      clickThroughRate: listing.views > 0 ? (listing.clicks / listing.views) * 100 : 0,
      inquiryRate: listing.views > 0 ? (listing.inquiries / listing.views) * 100 : 0,
    };
  }

  upgradeToPremium(listingId: string): boolean {
    const listing = this.getListing(listingId);
    if (!listing || listing.isPremium) return false;

    const now = new Date();
    const newExpiry = new Date(now);
    newExpiry.setDate(newExpiry.getDate() + this.PREMIUM_DURATION);

    return this.updateListing(listingId, {
      isPremium: true,
      isFeatured: true,
      expiresAt: newExpiry.toISOString(),
      durationDays: this.PREMIUM_DURATION,
    });
  }

  bulkRenew(listingIds: string[]): { success: string[]; failed: string[] } {
    const success: string[] = [];
    const failed: string[] = [];
    listingIds.forEach((id) => {
      if (this.renewListing(id)) {
        success.push(id);
      } else {
        failed.push(id);
      }
    });
    return { success, failed };
  }

  bulkArchive(listingIds: string[]): { success: string[]; failed: string[] } {
    const success: string[] = [];
    const failed: string[] = [];
    listingIds.forEach((id) => {
      if (this.archiveListing(id)) {
        success.push(id);
      } else {
        failed.push(id);
      }
    });
    return { success, failed };
  }
}

export const listingService = new ListingManagementService();
export default listingService;

