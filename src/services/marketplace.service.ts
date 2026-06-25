/**
 * src/services/marketplace.service.ts � Bambeh Marketplace
 *
 * REWRITE � June 2026
 *
 * FIXES:
 *  ? Uses `listings` table (canonical � consistent with Marketplace.tsx and MarketplaceItemDetails.tsx)
 *  ? increment_view_count RPC passes table_name + record_id
 *  ? All CRUD operations use seller_id (not user_id / vendor_id)
 *  ? No reference to removed marketplace_items table
 *  ? Expiry: listings expire 30 days after creation (stored in expires_at)
 *  ? Expiry reminders: getExpiringListings() helper for push notification service
 *
 * � 2026 BAMBEH SARL. All rights reserved.
 */

import { supabase } from "@/lib/supabase";

// --- Types ---------------------------------------------------------------------
export interface MarketplaceListingRow {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  condition: string;
  location: string;
  phone?: string;
  negotiable: boolean;
  images: Array<{ url: string; thumbnail_url?: string; order?: number; is_main?: boolean }>;
  extra?: Record<string, unknown>;
  status: "active" | "sold" | "expired" | "draft";
  view_count: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  type: "marketplace";
}

export interface CreateListingPayload {
  title: string;
  description: string;
  category: string;
  price: number;
  condition: string;
  location: string;
  phone?: string;
  negotiable?: boolean;
  imageUrls: string[];
  tags?: string[];
}

export interface UpdateListingPayload {
  id: string;
  title?: string;
  description?: string;
  price?: number;
  condition?: string;
  location?: string;
  phone?: string;
  negotiable?: boolean;
  status?: "active" | "sold" | "expired" | "draft";
}

export interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  error: string | null;
}

export interface ListingFilters {
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  searchQuery?: string;
  sortBy?: "newest" | "price_asc" | "price_desc" | "popular";
  page?: number;
  pageSize?: number;
}

// --- Helpers -------------------------------------------------------------------
function expiryDate(): string {
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
}

// --- Read ----------------------------------------------------------------------

/**
 * Get paginated, filtered marketplace listings from the `listings` table.
 */
export async function getMarketplaceListings(
  filters: ListingFilters = {},
): Promise<PaginatedResponse<MarketplaceListingRow>> {
  try {
    const page     = filters.page     ?? 1;
    const pageSize = filters.pageSize ?? 20;
    const from     = (page - 1) * pageSize;
    const to       = from + pageSize - 1;

    let query = supabase
      .from("listings")
      .select("*", { count: "exact" })
      .eq("type", "marketplace")
      .eq("status", "active");

    if (filters.category)    query = query.eq("category", filters.category);
    if (filters.location)    query = query.ilike("location", `%${filters.location}%`);
    if (filters.minPrice !== undefined) query = query.gte("price", filters.minPrice);
    if (filters.maxPrice !== undefined) query = query.lte("price", filters.maxPrice);
    if (filters.condition)   query = query.eq("condition", filters.condition);
    if (filters.searchQuery) query = query.ilike("title", `%${filters.searchQuery}%`);

    switch (filters.sortBy) {
      case "price_asc":  query = query.order("price", { ascending: true }); break;
      case "price_desc": query = query.order("price", { ascending: false }); break;
      case "popular":    query = query.order("view_count", { ascending: false }); break;
      default:           query = query.order("created_at", { ascending: false });
    }

    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) return { data: [], total: 0, page, pageSize, hasNextPage: false, error: error.message };

    const total = count ?? 0;
    return {
      data: (data ?? []) as MarketplaceListingRow[],
      total,
      page,
      pageSize,
      hasNextPage: from + pageSize < total,
      error: null,
    };
  } catch (err) {
    return { data: [], total: 0, page: 1, pageSize: 20, hasNextPage: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

/**
 * Get a single listing by ID.
 */
export async function getListingById(id: string): Promise<ServiceResponse<MarketplaceListingRow>> {
  try {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("id", id)
      .eq("type", "marketplace")
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as MarketplaceListingRow, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Failed" };
  }
}

/**
 * Get all listings for a specific seller.
 */
export async function getSellerListings(sellerId: string): Promise<PaginatedResponse<MarketplaceListingRow>> {
  try {
    const { data, count, error } = await supabase
      .from("listings")
      .select("*", { count: "exact" })
      .eq("type", "marketplace")
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false });

    if (error) return { data: [], total: 0, page: 1, pageSize: 100, hasNextPage: false, error: error.message };
    return {
      data: (data ?? []) as MarketplaceListingRow[],
      total: count ?? 0,
      page: 1,
      pageSize: 100,
      hasNextPage: false,
      error: null,
    };
  } catch (err) {
    return { data: [], total: 0, page: 1, pageSize: 100, hasNextPage: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

/**
 * Get listings that expire within `withinDays` days � used to send expiry reminders.
 */
export async function getExpiringListings(
  sellerId: string,
  withinDays = 3,
): Promise<ServiceResponse<MarketplaceListingRow[]>> {
  try {
    const threshold = new Date(Date.now() + withinDays * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from("listings")
      .select("id, title, expires_at, seller_id, status")
      .eq("type", "marketplace")
      .eq("seller_id", sellerId)
      .eq("status", "active")
      .lte("expires_at", threshold)
      .order("expires_at", { ascending: true });

    if (error) return { data: null, error: error.message };
    return { data: (data ?? []) as MarketplaceListingRow[], error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Failed" };
  }
}

// --- Write ---------------------------------------------------------------------

/**
 * Create a new marketplace listing in the `listings` table.
 */
export async function createListing(
  sellerId: string,
  payload: CreateListingPayload,
): Promise<ServiceResponse<{ id: string }>> {
  try {
    const images = payload.imageUrls.map((url, idx) => ({
      url,
      thumbnail_url: url,
      order: idx,
      is_main: idx === 0,
    }));

    const { data, error } = await supabase
      .from("listings")
      .insert({
        seller_id:   sellerId,
        type:        "marketplace",
        title:       payload.title,
        description: payload.description,
        category:    payload.category,
        price:       payload.price,
        condition:   payload.condition,
        location:    payload.location,
        phone:       payload.phone ?? null,
        negotiable:  payload.negotiable ?? false,
        images,
        tags:        payload.tags ?? [],
        status:      "active",
        view_count:  0,
        is_featured: false,
        expires_at:  expiryDate(),
      })
      .select("id")
      .single();

    if (error) return { data: null, error: error.message };
    return { data: { id: (data as { id: string }).id }, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Failed" };
  }
}

/**
 * Update a listing. Only the owner (seller_id) may update.
 */
export async function updateListing(
  sellerId: string,
  payload: UpdateListingPayload,
): Promise<ServiceResponse<null>> {
  try {
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (payload.title       !== undefined) updates.title       = payload.title;
    if (payload.description !== undefined) updates.description = payload.description;
    if (payload.price       !== undefined) updates.price       = payload.price;
    if (payload.condition   !== undefined) updates.condition   = payload.condition;
    if (payload.location    !== undefined) updates.location    = payload.location;
    if (payload.phone       !== undefined) updates.phone       = payload.phone;
    if (payload.negotiable  !== undefined) updates.negotiable  = payload.negotiable;
    if (payload.status      !== undefined) updates.status      = payload.status;

    const { error } = await supabase
      .from("listings")
      .update(updates)
      .eq("id", payload.id)
      .eq("seller_id", sellerId);     // RLS double-check at application layer

    if (error) return { data: null, error: error.message };
    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Failed" };
  }
}

/**
 * Mark a listing as sold. Only the owner may do this.
 */
export async function markAsSold(id: string, sellerId: string): Promise<ServiceResponse<null>> {
  try {
    const { error } = await supabase
      .from("listings")
      .update({ status: "sold", sold_at: new Date().toISOString() })
      .eq("id", id)
      .eq("seller_id", sellerId);

    if (error) return { data: null, error: error.message };
    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Failed" };
  }
}

/**
 * Delete a listing. Only the owner may do this.
 */
export async function deleteListing(id: string, sellerId: string): Promise<ServiceResponse<null>> {
  try {
    const { error } = await supabase
      .from("listings")
      .delete()
      .eq("id", id)
      .eq("seller_id", sellerId);

    if (error) return { data: null, error: error.message };
    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Failed" };
  }
}

/**
 * Renew a listing by extending expires_at by 30 days.
 */
export async function renewListing(id: string, sellerId: string): Promise<ServiceResponse<null>> {
  try {
    const { error } = await supabase
      .from("listings")
      .update({
        expires_at: expiryDate(),
        status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("seller_id", sellerId);

    if (error) return { data: null, error: error.message };
    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Failed" };
  }
}

// --- View counter --------------------------------------------------------------

/**
 * Increment view_count for a listing.
 *
 * IMPORTANT: The RPC must receive BOTH `table_name` and `record_id`.
 * The previous version only passed `record_id` � this caused the RPC to fail
 * silently on some Supabase configurations (and loudly crash on others).
 *
 * Required Supabase SQL function:
 *
 *   CREATE OR REPLACE FUNCTION increment_view_count(table_name text, record_id uuid)
 *   RETURNS void AS $$
 *   BEGIN
 *     EXECUTE format('UPDATE %I SET view_count = view_count + 1 WHERE id = $1', table_name)
 *     USING record_id;
 *   END;
 *   $$ LANGUAGE plpgsql SECURITY DEFINER;
 */
export async function incrementViewCount(id: string): Promise<void> {
  try {
    await supabase.rpc("increment_view_count", {
      table_name: "listings",
      record_id: id,
    });
  } catch { /* non-critical � view counts are best-effort */ }
}

// --- Re-export for backwards compatibility -------------------------------------
// Some files import from marketplace.service.ts using the old MarketplaceItem type.
// These shims prevent import errors during migration.
export type { MarketplaceListingRow as MarketplaceItem };
export const getMarketplaceItemById = getListingById;
export const incrementMarketplaceView = incrementViewCount;
export const getMyListings = getSellerListings;
export const createMarketplaceItem = createListing;
export const updateMarketplaceItem = updateListing;
export const deleteMarketplaceItem = deleteListing;
export const markItemAsSold = markAsSold;

