/**
 * src/services/services.service.ts
 * Bambeh Marketplace — Service Listings Service
 * © 2026 Bambeh Marketplace. All rights reserved.
 *
 * ─── FIX (June 2026) ──────────────────────────────────────────────────────────
 * Previous version queried "service_listings" table — does NOT exist in Supabase.
 * Bambeh uses ONE "listings" table for ALL content types, with a "type" column.
 * All functions now query: supabase.from("listings").eq("type", "service")
 *
 * Column mapping (listings table → ServiceListing type):
 *   listings.id              → id
 *   listings.user_id         → providerId
 *   listings.title           → title
 *   listings.description     → description
 *   listings.category        → category
 *   listings.price           → priceFromXAF
 *   listings.location        → location.city
 *   listings.images          → images[]
 *   listings.extra.price_to  → priceToXAF
 *   listings.extra.negotiable→ isPriceNegotiable
 *   listings.extra.online    → isOnlineService
 *   listings.extra.delivery  → deliveryDays
 *   listings.extra.region    → location.region
 *   listings.extra.rating    → rating
 *   listings.extra.reviews   → reviewCount
 *   listings.extra.completed → completedJobs
 *   listings.status          → status
 *   listings.created_at      → createdAt
 *   listings.updated_at      → updatedAt
 */

import { supabase } from "@/lib/supabase";
import type {
  ServiceListing,
  ItemFilters,
  PaginatedItemsResponse,
} from "@/types/src_types_items";

// ─── Response Types ────────────────────────────────────────────────────────────
export interface ServiceResponse {
  data: ServiceListing | null;
  error: string | null;
}

export interface ServiceActionResponse {
  success: boolean;
  id?: string;
  error: string | null;
}

// ─── Row → ServiceListing mapper ──────────────────────────────────────────────
function mapRow(row: Record<string, any>): ServiceListing {
  const extra  = row.extra ?? {};
  const images = Array.isArray(row.images) ? row.images : [];

  return {
    id:                  row.id,
    providerId:          row.user_id ?? row.seller_id ?? "",
    title:               row.title ?? "",
    description:         row.description ?? "",
    category:            row.category ?? "",
    subcategory:         extra.subcategory ?? undefined,
    priceFromXAF:        Number(row.price ?? 0),
    priceToXAF:          extra.price_to ? Number(extra.price_to) : undefined,
    isPriceNegotiable:   Boolean(extra.negotiable ?? extra.isPriceNegotiable ?? false),
    images: images.map((img: any, idx: number) => ({
      id:     img.id     ?? `img-${idx}`,
      url:    img.url    ?? img,
      order:  img.order  ?? idx,
      isMain: img.is_main ?? idx === 0,
    })),
    location: {
      city:    row.location ?? extra.city ?? "",
      region:  extra.region ?? row.location ?? "",
      country: row.country  ?? extra.country ?? "",
    },
    isOnlineService: Boolean(extra.online ?? extra.isOnlineService ?? false),
    deliveryDays:    extra.delivery ?? extra.deliveryDays ?? undefined,
    paymentMethods:  Array.isArray(extra.payment_methods) ? extra.payment_methods : [],
    status:          (row.status as ServiceListing["status"]) ?? "active",
    rating:          Number(extra.rating ?? 0),
    reviewCount:     Number(extra.reviews ?? extra.reviewCount ?? 0),
    completedJobs:   Number(extra.completed ?? extra.completedJobs ?? 0),
    tags:            Array.isArray(row.tags) ? row.tags : [],
    createdAt:       row.created_at ?? new Date().toISOString(),
    updatedAt:       row.updated_at ?? new Date().toISOString(),
  };
}

// ─── Get Services (paginated + filtered) ──────────────────────────────────────
export async function getServices(
  filters: Partial<ItemFilters> = {}
): Promise<PaginatedItemsResponse<ServiceListing>> {
  try {
    const page     = filters.page     ?? 1;
    const pageSize = Math.min(filters.pageSize ?? 20, 50);
    const from     = (page - 1) * pageSize;
    const to       = from + pageSize - 1;

    let query = supabase
      .from("listings")
      .select("*", { count: "exact" })
      .eq("type", "service")
      .eq("status", "active");

    if (filters.category)    query = query.eq("category", filters.category);
    if (filters.searchQuery) query = query.or(
      `title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`
    );
    if (filters.location)    query = query.ilike("location", `%${filters.location}%`);
    if (filters.minPriceXAF !== undefined) query = query.gte("price", filters.minPriceXAF);
    if (filters.maxPriceXAF !== undefined) query = query.lte("price", filters.maxPriceXAF);

    query = query.order("created_at", { ascending: false }).range(from, to);

    const { data, count, error } = await query;

    if (error) {
      console.error("[services.service] getServices:", error.message);
      return { data: [], total: 0, page, pageSize, hasNextPage: false, error: error.message };
    }

    const total = count ?? 0;
    return {
      data:        (data ?? []).map((r) => mapRow(r as Record<string, any>)),
      total,
      page,
      pageSize,
      hasNextPage: from + pageSize < total,
      error:       null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load services";
    console.error("[services.service] getServices exception:", message);
    return { data: [], total: 0, page: 1, pageSize: 20, hasNextPage: false, error: message };
  }
}

// ─── Get Service by ID ─────────────────────────────────────────────────────────
export async function getServiceById(id: string): Promise<ServiceResponse> {
  try {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("id", id)
      .eq("type", "service")
      .maybeSingle();

    if (error) return { data: null, error: error.message };
    if (!data)  return { data: null, error: "Service not found" };

    return { data: mapRow(data as Record<string, any>), error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Failed to load service" };
  }
}

// ─── Create Service ────────────────────────────────────────────────────────────
export async function createService(
  providerId: string,
  payload: Omit<ServiceListing, "id" | "providerId" | "rating" | "reviewCount" | "completedJobs" | "createdAt" | "updatedAt">
): Promise<ServiceActionResponse> {
  try {
    const { data, error } = await supabase
      .from("listings")
      .insert({
        user_id:     providerId,
        type:        "service",
        title:       payload.title,
        description: payload.description,
        category:    payload.category,
        location:    payload.location.city,
        country:     payload.location.country ?? "",
        price:       payload.priceFromXAF,
        images:      payload.images,
        status:      payload.status ?? "active",
        tags:        payload.tags ?? [],
        view_count:  0,
        is_featured: false,
        extra: {
          subcategory:      payload.subcategory ?? null,
          price_to:         payload.priceToXAF ?? null,
          negotiable:       payload.isPriceNegotiable,
          region:           payload.location.region ?? payload.location.city,
          online:           payload.isOnlineService,
          delivery:         payload.deliveryDays ?? null,
          payment_methods:  payload.paymentMethods ?? [],
          rating:           0,
          reviews:          0,
          completed:        0,
        },
      })
      .select("id")
      .single();

    if (error) {
      console.error("[services.service] createService:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, id: (data as { id: string }).id, error: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create service" };
  }
}

// ─── Update Service ────────────────────────────────────────────────────────────
export async function updateService(
  id: string,
  providerId: string,
  updates: Partial<ServiceListing>
): Promise<ServiceActionResponse> {
  try {
    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.title        !== undefined) payload.title    = updates.title;
    if (updates.description  !== undefined) payload.description = updates.description;
    if (updates.priceFromXAF !== undefined) payload.price    = updates.priceFromXAF;
    if (updates.status       !== undefined) payload.status   = updates.status;
    if (updates.location?.city !== undefined) payload.location = updates.location.city;

    if (updates.priceToXAF !== undefined || updates.isPriceNegotiable !== undefined) {
      const { data: existing } = await supabase
        .from("listings").select("extra").eq("id", id).maybeSingle();
      payload.extra = {
        ...(existing?.extra ?? {}),
        ...(updates.priceToXAF        !== undefined ? { price_to:   updates.priceToXAF }        : {}),
        ...(updates.isPriceNegotiable !== undefined ? { negotiable: updates.isPriceNegotiable } : {}),
      };
    }

    const { error } = await supabase
      .from("listings")
      .update(payload)
      .eq("id", id)
      .eq("user_id", providerId);

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update service" };
  }
}

// ─── Delete Service ────────────────────────────────────────────────────────────
export async function deleteService(
  id: string,
  providerId: string
): Promise<ServiceActionResponse> {
  try {
    const { error } = await supabase
      .from("listings")
      .delete()
      .eq("id", id)
      .eq("user_id", providerId);

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete service" };
  }
}

// ─── Get My Services ───────────────────────────────────────────────────────────
export async function getMyServices(
  providerId: string
): Promise<PaginatedItemsResponse<ServiceListing>> {
  try {
    const { data, count, error } = await supabase
      .from("listings")
      .select("*", { count: "exact" })
      .eq("type", "service")
      .eq("user_id", providerId)
      .order("created_at", { ascending: false });

    if (error) {
      return { data: [], total: 0, page: 1, pageSize: 100, hasNextPage: false, error: error.message };
    }

    const items = (data ?? []).map((r) => mapRow(r as Record<string, any>));
    return { data: items, total: count ?? 0, page: 1, pageSize: 100, hasNextPage: false, error: null };
  } catch (err) {
    return {
      data: [], total: 0, page: 1, pageSize: 100, hasNextPage: false,
      error: err instanceof Error ? err.message : "Failed to load your services",
    };
  }
}

// ─── Increment View ────────────────────────────────────────────────────────────
export async function incrementServiceView(id: string): Promise<void> {
  try {
    await supabase.rpc("increment_view_count", {
      table_name: "listings",
      record_id:  id,
    });
  } catch {
    // Non-critical
  }
}
