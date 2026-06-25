/**
 * src/services/vendor.service.ts
 * Bambeh Marketplace � Vendor Service
 * � 2026 Bambeh Marketplace. All rights reserved.
 */

import { supabase } from "@/lib/supabase";
import type { VendorSubscription, VendorEarnings, VendorAnalyticsSnapshot } from "@/types/vendor.monetization.types";

// --- Types --------------------------------------------------------------------
export interface VendorProfile {
  id: string;
  userId: string;
  storeName: string;
  storeDescription?: string;
  logoUrl?: string;
  bannerUrl?: string;
  category: string;
  city: string;
  region: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  isVerified: boolean;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  totalProducts: number;
  totalSales: number;
  subscriptionTier: string;
  createdAt: string;
  updatedAt: string;
}

export interface VendorResponse {
  data: VendorProfile | null;
  error: string | null;
}

export interface VendorActionResponse {
  success: boolean;
  id?: string;
  error: string | null;
}

export interface VendorOrder {
  id: string;
  vendorId: string;
  customerId: string;
  customerName?: string;
  items: Array<{
    listingId: string;
    title: string;
    quantity: number;
    priceXAF: number;
  }>;
  totalXAF: number;
  commissionXAF: number;
  netXAF: number;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "canceled" | "refunded";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentReference?: string;
  createdAt: string;
  updatedAt: string;
}

// --- Map Row ------------------------------------------------------------------
function mapVendorRow(row: Record<string, unknown>): VendorProfile {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    storeName: row.store_name as string,
    storeDescription: row.store_description as string | undefined,
    logoUrl: row.logo_url as string | undefined,
    bannerUrl: row.banner_url as string | undefined,
    category: row.category as string,
    city: row.city as string,
    region: row.region as string,
    country: (row.country as string) ?? "",
    phone: row.phone as string,
    email: row.email as string,
    website: row.website as string | undefined,
    isVerified: Boolean(row.is_verified),
    isFeatured: Boolean(row.is_featured),
    rating: (row.rating as number) ?? 0,
    reviewCount: (row.review_count as number) ?? 0,
    totalProducts: (row.total_products as number) ?? 0,
    totalSales: (row.total_sales as number) ?? 0,
    subscriptionTier: (row.subscription_tier as string) ?? "free",
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// --- Get Vendor Profile -------------------------------------------------------
export async function getVendorProfile(vendorId: string): Promise<VendorResponse> {
  try {
    const { data, error } = await supabase
      .from("vendor_profiles")
      .select("*")
      .eq("id", vendorId)
      .single();

    if (error) return { data: null, error: error.message };
    return { data: mapVendorRow(data as Record<string, unknown>), error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load vendor profile";
    return { data: null, error: message };
  }
}

// --- Get Vendor by User ID ----------------------------------------------------
export async function getVendorByUserId(userId: string): Promise<VendorResponse> {
  try {
    const { data, error } = await supabase
      .from("vendor_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) return { data: null, error: error.message };
    return { data: mapVendorRow(data as Record<string, unknown>), error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load vendor";
    return { data: null, error: message };
  }
}

// --- Create Vendor Profile ----------------------------------------------------
export async function createVendorProfile(
  userId: string,
  payload: Omit<VendorProfile, "id" | "userId" | "isVerified" | "isFeatured" | "rating" | "reviewCount" | "totalProducts" | "totalSales" | "subscriptionTier" | "createdAt" | "updatedAt">
): Promise<VendorActionResponse> {
  try {
    const { data, error } = await supabase
      .from("vendor_profiles")
      .insert({
        user_id: userId,
        store_name: payload.storeName,
        store_description: payload.storeDescription,
        logo_url: payload.logoUrl,
        banner_url: payload.bannerUrl,
        category: payload.category,
        city: payload.city,
        region: payload.region,
        country: payload.country ?? "",
        phone: payload.phone,
        email: payload.email,
        website: payload.website,
        is_verified: false,
        is_featured: false,
        rating: 0,
        review_count: 0,
        total_products: 0,
        total_sales: 0,
        subscription_tier: "free",
      })
      .select("id")
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, id: (data as { id: string }).id, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create vendor profile";
    return { success: false, error: message };
  }
}

// --- Update Vendor Profile ----------------------------------------------------
export async function updateVendorProfile(
  vendorId: string,
  updates: Partial<VendorProfile>
): Promise<VendorActionResponse> {
  try {
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (updates.storeName !== undefined) payload.store_name = updates.storeName;
    if (updates.storeDescription !== undefined) payload.store_description = updates.storeDescription;
    if (updates.logoUrl !== undefined) payload.logo_url = updates.logoUrl;
    if (updates.bannerUrl !== undefined) payload.banner_url = updates.bannerUrl;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.city !== undefined) payload.city = updates.city;
    if (updates.region !== undefined) payload.region = updates.region;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.website !== undefined) payload.website = updates.website;

    const { error } = await supabase
      .from("vendor_profiles")
      .update(payload)
      .eq("id", vendorId);

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update vendor profile";
    return { success: false, error: message };
  }
}

// --- Get Vendor Orders --------------------------------------------------------
export async function getVendorOrders(
  vendorId: string,
  status?: VendorOrder["status"]
): Promise<{ data: VendorOrder[]; error: string | null }> {
  try {
    let query = supabase
      .from("vendor_orders")
      .select("*")
      .eq("vendor_id", vendorId)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) return { data: [], error: error.message };

    const orders: VendorOrder[] = (data ?? []).map((row) => ({
      id: row.id,
      vendorId: row.vendor_id,
      customerId: row.customer_id,
      customerName: row.customer_name,
      items: row.items ?? [],
      totalXAF: row.total_xaf,
      commissionXAF: row.commission_xaf,
      netXAF: row.net_xaf,
      status: row.status,
      paymentStatus: row.payment_status,
      paymentReference: row.payment_reference,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return { data: orders, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load orders";
    return { data: [], error: message };
  }
}

// --- Update Order Status ------------------------------------------------------
export async function updateOrderStatus(
  orderId: string,
  vendorId: string,
  status: VendorOrder["status"]
): Promise<VendorActionResponse> {
  try {
    const { error } = await supabase
      .from("vendor_orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", orderId)
      .eq("vendor_id", vendorId);

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update order";
    return { success: false, error: message };
  }
}

// --- Get Vendor Earnings ------------------------------------------------------
export async function getVendorEarnings(
  vendorId: string
): Promise<{ data: VendorEarnings | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("vendor_earnings")
      .select("*")
      .eq("vendor_id", vendorId)
      .single();

    if (error) return { data: null, error: error.message };

    const earnings: VendorEarnings = {
      totalSalesXAF: data.total_sales_xaf ?? 0,
      totalCommissionXAF: data.total_commission_xaf ?? 0,
      netEarningsXAF: data.net_earnings_xaf ?? 0,
      pendingWithdrawalXAF: data.pending_withdrawal_xaf ?? 0,
      completedWithdrawalXAF: data.completed_withdrawal_xaf ?? 0,
      lastUpdated: data.last_updated,
    };

    return { data: earnings, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load earnings";
    return { data: null, error: message };
  }
}

// --- Get Analytics Snapshot ---------------------------------------------------
export async function getVendorAnalytics(
  vendorId: string,
  period: VendorAnalyticsSnapshot["period"] = "month"
): Promise<{ data: VendorAnalyticsSnapshot | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("vendor_analytics")
      .select("*")
      .eq("vendor_id", vendorId)
      .eq("period", period)
      .single();

    if (error) return { data: null, error: error.message };

    const snapshot: VendorAnalyticsSnapshot = {
      vendorId: data.vendor_id,
      period: data.period,
      totalViews: data.total_views ?? 0,
      uniqueVisitors: data.unique_visitors ?? 0,
      profileViews: data.profile_views ?? 0,
      listingViews: data.listing_views ?? 0,
      ordersPlaced: data.orders_placed ?? 0,
      ordersCompleted: data.orders_completed ?? 0,
      ordersCanceled: data.orders_canceled ?? 0,
      revenueXAF: data.revenue_xaf ?? 0,
      commissionXAF: data.commission_xaf ?? 0,
      netRevenueXAF: data.net_revenue_xaf ?? 0,
      averageOrderValueXAF: data.average_order_value_xaf ?? 0,
      conversionRate: data.conversion_rate ?? 0,
      newFollowers: data.new_followers ?? 0,
      favoriteCount: data.favorite_count ?? 0,
      reviewsReceived: data.reviews_received ?? 0,
      averageRating: data.average_rating ?? 0,
      generatedAt: data.generated_at,
    };

    return { data: snapshot, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load analytics";
    return { data: null, error: message };
  }
}

// --- Get Subscription ---------------------------------------------------------
export async function getVendorSubscription(
  vendorId: string
): Promise<{ data: VendorSubscription | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("vendor_subscriptions")
      .select("*")
      .eq("vendor_id", vendorId)
      .eq("status", "active")
      .maybeSingle();

    if (error) return { data: null, error: error.message };
    if (!data) return { data: null, error: null };

    const subscription: VendorSubscription = {
      id: data.id,
      vendorId: data.vendor_id,
      planId: data.plan_id,
      tier: data.tier,
      status: data.status,
      billingPeriod: data.billing_period,
      currentPeriodStart: data.current_period_start,
      currentPeriodEnd: data.current_period_end,
      trialStart: data.trial_start,
      trialEnd: data.trial_end,
      canceledAt: data.canceled_at,
      cancelReason: data.cancel_reason,
      autoRenew: Boolean(data.auto_renew),
      priceXAF: data.price_xaf,
      currency: "XAF",
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return { data: subscription, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load subscription";
    return { data: null, error: message };
  }
}


