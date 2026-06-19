/**
 * src/services/properties.service.ts
 * Bambeh Marketplace â€” Properties / Rentals Service
 * Â© 2026 Bambeh Marketplace. All rights reserved.
 *
 * â”€â”€â”€ FIX (June 2026) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 * Previous version queried a "properties" table â€” does NOT exist in Supabase.
 * Bambeh uses ONE "listings" table for ALL content types, with a "type" column.
 * All functions now query: supabase.from("listings").eq("type", "rental")
 *
 * Column mapping (listings table â†’ Property type):
 *   listings.id               â†’ id
 *   listings.user_id          â†’ landlordId       (NOT landlord_id â€” doesn't exist)
 *   listings.title            â†’ title
 *   listings.description      â†’ description
 *   listings.price            â†’ priceXAF
 *   listings.location         â†’ city
 *   listings.images           â†’ images[]
 *   listings.extra.prop_type  â†’ propertyType
 *   listings.extra.period     â†’ rentalPeriod
 *   listings.extra.negotiable â†’ isNegotiable
 *   listings.extra.bedrooms   â†’ bedrooms
 *   listings.extra.bathrooms  â†’ bathrooms
 *   listings.extra.surface    â†’ surfaceM2
 *   listings.extra.region     â†’ region
 *   listings.extra.address    â†’ address
 *   listings.extra.amenities  â†’ amenities[]
 *   listings.extra.available  â†’ isAvailable
 *   listings.extra.avail_from â†’ availableFrom
 *   listings.phone            â†’ contactPhone
 *   listings.view_count       â†’ viewCount
 *   listings.status           â†’ status
 */

import { supabase } from "@/lib/supabase";
import type { ItemFilters, PaginatedItemsResponse } from "@/types/src_types_items";

// â”€â”€â”€ Types (unchanged â€” callers don't need to update) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export type PropertyType =
  | "apartment" | "house" | "studio" | "villa"
  | "office" | "land" | "commercial" | "warehouse" | "room";

export type RentalPeriod = "daily" | "weekly" | "monthly" | "annual";

export interface PropertyImage {
  id: string;
  url: string;
  order: number;
  isMain: boolean;
}

export interface Property {
  id: string;
  landlordId: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  priceXAF: number;
  rentalPeriod: RentalPeriod;
  isNegotiable: boolean;
  bedrooms: number;
  bathrooms: number;
  surfaceM2?: number;
  images: PropertyImage[];
  city: string;
  region: string;
  country: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  amenities: string[];
  isAvailable: boolean;
  availableFrom?: string;
  status: "active" | "rented" | "draft" | "expired";
  viewCount: number;
  contactPhone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyResponse {
  data: Property | null;
  error: string | null;
}

export interface PropertyActionResponse {
  success: boolean;
  id?: string;
  error: string | null;
}

// â”€â”€â”€ Row mapper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function mapRow(row: Record<string, any>): Property {
  const extra  = row.extra ?? {};
  const images = Array.isArray(row.images) ? row.images : [];

  return {
    id:            row.id,
    landlordId:    row.user_id ?? row.seller_id ?? "",
    title:         row.title ?? "",
    description:   row.description ?? "",
    propertyType:  (extra.prop_type ?? extra.propertyType ?? "apartment") as PropertyType,
    priceXAF:      Number(row.price ?? 0),
    rentalPeriod:  (extra.period ?? extra.rentalPeriod ?? "monthly") as RentalPeriod,
    isNegotiable:  Boolean(extra.negotiable ?? extra.isNegotiable ?? false),
    bedrooms:      Number(extra.bedrooms ?? 0),
    bathrooms:     Number(extra.bathrooms ?? 0),
    surfaceM2:     extra.surface ? Number(extra.surface) : undefined,
    images: images.map((img: any, idx: number) => ({
      id:     img.id      ?? `img-${idx}`,
      url:    img.url     ?? img,
      order:  img.order   ?? idx,
      isMain: img.is_main ?? idx === 0,
    })),
    city:          row.location ?? extra.city ?? "",
    region:        extra.region ?? row.location ?? "",
    country:       row.country  ?? extra.country ?? "",
    address:       extra.address ?? undefined,
    latitude:      extra.latitude  ? Number(extra.latitude)  : undefined,
    longitude:     extra.longitude ? Number(extra.longitude) : undefined,
    amenities:     Array.isArray(extra.amenities) ? extra.amenities : [],
    isAvailable:   extra.available !== false,
    availableFrom: extra.avail_from ?? extra.availableFrom ?? undefined,
    status:        (row.status as Property["status"]) ?? "active",
    viewCount:     Number(row.view_count ?? 0),
    contactPhone:  row.phone ?? extra.contact_phone ?? undefined,
    createdAt:     row.created_at ?? new Date().toISOString(),
    updatedAt:     row.updated_at ?? new Date().toISOString(),
  };
}

// â”€â”€â”€ Get Properties (paginated + filtered) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function getProperties(
  filters: Partial<ItemFilters> = {}
): Promise<PaginatedItemsResponse<Property>> {
  try {
    const page     = filters.page     ?? 1;
    const pageSize = Math.min(filters.pageSize ?? 20, 50);
    const from     = (page - 1) * pageSize;
    const to       = from + pageSize - 1;

    let query = supabase
      .from("listings")
      .select("*", { count: "exact" })
      .eq("type", "rental")
      .eq("status", "active");

    if (filters.searchQuery) query = query.or(
      `title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`
    );
    if (filters.minPriceXAF !== undefined) query = query.gte("price", filters.minPriceXAF);
    if (filters.maxPriceXAF !== undefined) query = query.lte("price", filters.maxPriceXAF);
    if (filters.location)    query = query.ilike("location", `%${filters.location}%`);
    if (filters.category)    query = query.eq("category", filters.category);

    query = query.order("created_at", { ascending: false }).range(from, to);

    const { data, count, error } = await query;

    if (error) {
      console.error("[properties.service] getProperties:", error.message);
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
    const message = err instanceof Error ? err.message : "Failed to load properties";
    console.error("[properties.service] getProperties exception:", message);
    return { data: [], total: 0, page: 1, pageSize: 20, hasNextPage: false, error: message };
  }
}

// â”€â”€â”€ Get Property by ID â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function getPropertyById(id: string): Promise<PropertyResponse> {
  try {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("id", id)
      .eq("type", "rental")
      .maybeSingle();

    if (error) return { data: null, error: error.message };
    if (!data)  return { data: null, error: "Property not found" };

    return { data: mapRow(data as Record<string, any>), error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Failed to load property" };
  }
}

// â”€â”€â”€ Create Property â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function createProperty(
  landlordId: string,
  payload: Omit<Property, "id" | "landlordId" | "viewCount" | "createdAt" | "updatedAt">
): Promise<PropertyActionResponse> {
  try {
    const { data, error } = await supabase
      .from("listings")
      .insert({
        user_id:     landlordId,
        type:        "rental",
        title:       payload.title,
        description: payload.description,
        category:    payload.propertyType,
        location:    payload.city,
        country:     payload.country ?? "",
        price:       payload.priceXAF,
        phone:       payload.contactPhone ?? null,
        images:      payload.images,
        status:      payload.status ?? "active",
        view_count:  0,
        is_featured: false,
        extra: {
          prop_type:  payload.propertyType,
          period:     payload.rentalPeriod,
          negotiable: payload.isNegotiable,
          bedrooms:   payload.bedrooms,
          bathrooms:  payload.bathrooms,
          surface:    payload.surfaceM2 ?? null,
          region:     payload.region ?? payload.city,
          address:    payload.address ?? null,
          latitude:   payload.latitude ?? null,
          longitude:  payload.longitude ?? null,
          amenities:  payload.amenities ?? [],
          available:  payload.isAvailable ?? true,
          avail_from: payload.availableFrom ?? null,
        },
      })
      .select("id")
      .single();

    if (error) {
      console.error("[properties.service] createProperty:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, id: (data as { id: string }).id, error: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create property" };
  }
}

// â”€â”€â”€ Update Property â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function updateProperty(
  id: string,
  landlordId: string,
  updates: Partial<Property>
): Promise<PropertyActionResponse> {
  try {
    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.title       !== undefined) payload.title    = updates.title;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.priceXAF    !== undefined) payload.price    = updates.priceXAF;
    if (updates.status      !== undefined) payload.status   = updates.status;
    if (updates.city        !== undefined) payload.location = updates.city;
    if (updates.contactPhone !== undefined) payload.phone   = updates.contactPhone;

    if (updates.isAvailable !== undefined || updates.bedrooms !== undefined || updates.amenities !== undefined) {
      const { data: existing } = await supabase
        .from("listings").select("extra").eq("id", id).maybeSingle();
      payload.extra = {
        ...(existing?.extra ?? {}),
        ...(updates.isAvailable !== undefined ? { available: updates.isAvailable } : {}),
        ...(updates.bedrooms    !== undefined ? { bedrooms:  updates.bedrooms    } : {}),
        ...(updates.bathrooms   !== undefined ? { bathrooms: updates.bathrooms   } : {}),
        ...(updates.amenities   !== undefined ? { amenities: updates.amenities   } : {}),
        ...(updates.isNegotiable !== undefined ? { negotiable: updates.isNegotiable } : {}),
      };
    }

    const { error } = await supabase
      .from("listings")
      .update(payload)
      .eq("id", id)
      .eq("user_id", landlordId);

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update property" };
  }
}

// â”€â”€â”€ Delete Property â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function deleteProperty(
  id: string,
  landlordId: string
): Promise<PropertyActionResponse> {
  try {
    const { error } = await supabase
      .from("listings")
      .delete()
      .eq("id", id)
      .eq("user_id", landlordId);

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete property" };
  }
}

// â”€â”€â”€ Get My Properties â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function getMyProperties(
  landlordId: string
): Promise<PaginatedItemsResponse<Property>> {
  try {
    const { data, count, error } = await supabase
      .from("listings")
      .select("*", { count: "exact" })
      .eq("type", "rental")
      .eq("user_id", landlordId)
      .order("created_at", { ascending: false });

    if (error) {
      return { data: [], total: 0, page: 1, pageSize: 100, hasNextPage: false, error: error.message };
    }

    const items = (data ?? []).map((r) => mapRow(r as Record<string, any>));
    return { data: items, total: count ?? 0, page: 1, pageSize: 100, hasNextPage: false, error: null };
  } catch (err) {
    return {
      data: [], total: 0, page: 1, pageSize: 100, hasNextPage: false,
      error: err instanceof Error ? err.message : "Failed to load your properties",
    };
  }
}

// â”€â”€â”€ Increment View Count â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function incrementPropertyView(id: string): Promise<void> {
  try {
    await supabase.rpc("increment_view_count", {
      table_name: "listings",
      record_id:  id,
    });
  } catch {
    // Non-critical
  }
}
