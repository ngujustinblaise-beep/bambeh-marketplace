/**
 * src/services/properties.service.ts
 * Bambeh Marketplace — Properties / Rentals Service
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import { supabase } from "@/lib/supabase";
import type { ItemFilters, PaginatedItemsResponse } from "@/types/src_types_items";

// ─── Types ────────────────────────────────────────────────────────────────────
export type PropertyType =
  | "apartment"
  | "house"
  | "studio"
  | "villa"
  | "office"
  | "land"
  | "commercial"
  | "warehouse"
  | "room";

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

// ─── Map Row ──────────────────────────────────────────────────────────────────
function mapRow(row: Record<string, unknown>): Property {
  const images = Array.isArray(row.images) ? row.images : [];
  return {
    id: row.id as string,
    landlordId: row.landlord_id as string,
    title: row.title as string,
    description: row.description as string,
    propertyType: row.property_type as PropertyType,
    priceXAF: row.price_xaf as number,
    rentalPeriod: row.rental_period as RentalPeriod,
    isNegotiable: Boolean(row.is_negotiable),
    bedrooms: (row.bedrooms as number) ?? 0,
    bathrooms: (row.bathrooms as number) ?? 0,
    surfaceM2: row.surface_m2 as number | undefined,
    images: images.map((img: Record<string, unknown>, idx: number) => ({
      id: (img.id as string) ?? `img-${idx}`,
      url: img.url as string,
      order: (img.order as number) ?? idx,
      isMain: (img.is_main as boolean) ?? idx === 0,
    })),
    city: row.city as string,
    region: row.region as string,
    country: (row.country as string) ?? "Cameroon",
    address: row.address as string | undefined,
    latitude: row.latitude as number | undefined,
    longitude: row.longitude as number | undefined,
    amenities: (row.amenities as string[]) ?? [],
    isAvailable: row.is_available !== false,
    availableFrom: row.available_from as string | undefined,
    status: row.status as Property["status"],
    viewCount: (row.view_count as number) ?? 0,
    contactPhone: row.contact_phone as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// ─── Get Properties ───────────────────────────────────────────────────────────
export async function getProperties(
  filters: Partial<ItemFilters> = {}
): Promise<PaginatedItemsResponse<Property>> {
  try {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("properties")
      .select("*", { count: "exact" })
      .eq("status", "active");

    if (filters.searchQuery) {
      query = query.ilike("title", `%${filters.searchQuery}%`);
    }
    if (filters.minPriceXAF !== undefined) {
      query = query.gte("price_xaf", filters.minPriceXAF);
    }
    if (filters.maxPriceXAF !== undefined) {
      query = query.lte("price_xaf", filters.maxPriceXAF);
    }
    if (filters.location) {
      query = query.ilike("city", `%${filters.location}%`);
    }

    query = query.order("created_at", { ascending: false }).range(from, to);

    const { data, count, error } = await query;

    if (error) {
      return { data: [], total: 0, page, pageSize, hasNextPage: false, error: error.message };
    }

    const total = count ?? 0;
    const items = (data ?? []).map((row) => mapRow(row as Record<string, unknown>));

    return {
      data: items,
      total,
      page,
      pageSize,
      hasNextPage: from + pageSize < total,
      error: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load properties";
    return { data: [], total: 0, page: 1, pageSize: 20, hasNextPage: false, error: message };
  }
}

// ─── Get Property by ID ───────────────────────────────────────────────────────
export async function getPropertyById(id: string): Promise<PropertyResponse> {
  try {
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: mapRow(data as Record<string, unknown>), error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load property";
    return { data: null, error: message };
  }
}

// ─── Create Property ──────────────────────────────────────────────────────────
export async function createProperty(
  landlordId: string,
  payload: Omit<Property, "id" | "landlordId" | "viewCount" | "createdAt" | "updatedAt">
): Promise<PropertyActionResponse> {
  try {
    const { data, error } = await supabase
      .from("properties")
      .insert({
        landlord_id: landlordId,
        title: payload.title,
        description: payload.description,
        property_type: payload.propertyType,
        price_xaf: payload.priceXAF,
        rental_period: payload.rentalPeriod,
        is_negotiable: payload.isNegotiable,
        bedrooms: payload.bedrooms,
        bathrooms: payload.bathrooms,
        surface_m2: payload.surfaceM2,
        images: payload.images,
        city: payload.city,
        region: payload.region,
        country: payload.country ?? "Cameroon",
        address: payload.address,
        latitude: payload.latitude,
        longitude: payload.longitude,
        amenities: payload.amenities ?? [],
        is_available: payload.isAvailable ?? true,
        available_from: payload.availableFrom,
        status: payload.status ?? "active",
        contact_phone: payload.contactPhone,
        view_count: 0,
      })
      .select("id")
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, id: (data as { id: string }).id, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create property";
    return { success: false, error: message };
  }
}

// ─── Update Property ──────────────────────────────────────────────────────────
export async function updateProperty(
  id: string,
  landlordId: string,
  updates: Partial<Property>
): Promise<PropertyActionResponse> {
  try {
    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.priceXAF !== undefined) payload.price_xaf = updates.priceXAF;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.isAvailable !== undefined) payload.is_available = updates.isAvailable;

    const { error } = await supabase
      .from("properties")
      .update(payload)
      .eq("id", id)
      .eq("landlord_id", landlordId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update property";
    return { success: false, error: message };
  }
}

// ─── Delete Property ──────────────────────────────────────────────────────────
export async function deleteProperty(
  id: string,
  landlordId: string
): Promise<PropertyActionResponse> {
  try {
    const { error } = await supabase
      .from("properties")
      .delete()
      .eq("id", id)
      .eq("landlord_id", landlordId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete property";
    return { success: false, error: message };
  }
}

// ─── Get My Properties ────────────────────────────────────────────────────────
export async function getMyProperties(
  landlordId: string
): Promise<PaginatedItemsResponse<Property>> {
  try {
    const { data, count, error } = await supabase
      .from("properties")
      .select("*", { count: "exact" })
      .eq("landlord_id", landlordId)
      .order("created_at", { ascending: false });

    if (error) {
      return { data: [], total: 0, page: 1, pageSize: 100, hasNextPage: false, error: error.message };
    }

    const items = (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
    return { data: items, total: count ?? 0, page: 1, pageSize: 100, hasNextPage: false, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load properties";
    return { data: [], total: 0, page: 1, pageSize: 100, hasNextPage: false, error: message };
  }
}

// ─── Increment View Count ────────────────────────────────────────────────────
export async function incrementPropertyView(id: string): Promise<void> {
  try {
    await supabase.rpc("increment_view_count", {
      table_name: "properties",
      record_id: id,
    });
  } catch {
    // Non-critical
  }
}
