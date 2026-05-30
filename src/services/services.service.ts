/**
 * src/services/services.service.ts
 * Bambeh Marketplace — Service Listings Service
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import { supabase } from "@/lib/supabase";
import type { ServiceListing, ItemFilters, PaginatedItemsResponse } from "@/types/src_types_items";

export interface ServiceResponse {
  data: ServiceListing | null;
  error: string | null;
}

export interface ServiceActionResponse {
  success: boolean;
  id?: string;
  error: string | null;
}

function mapRow(row: Record<string, unknown>): ServiceListing {
  const images = Array.isArray(row.images) ? row.images : [];
  return {
    id: row.id as string,
    providerId: row.provider_id as string,
    title: row.title as string,
    description: row.description as string,
    category: row.category as string,
    subcategory: row.subcategory as string | undefined,
    priceFromXAF: row.price_from_xaf as number,
    priceToXAF: row.price_to_xaf as number | undefined,
    isPriceNegotiable: Boolean(row.is_price_negotiable),
    images: images.map((img: Record<string, unknown>, idx: number) => ({
      id: (img.id as string) ?? `img-${idx}`,
      url: img.url as string,
      order: (img.order as number) ?? idx,
      isMain: (img.is_main as boolean) ?? idx === 0,
    })),
    location: {
      city: row.city as string,
      region: row.region as string,
      country: (row.country as string) ?? "",
    },
    isOnlineService: Boolean(row.is_online_service),
    deliveryDays: row.delivery_days as number | undefined,
    paymentMethods: (row.payment_methods as ServiceListing["paymentMethods"]) ?? [],
    status: row.status as ServiceListing["status"],
    rating: (row.rating as number) ?? 0,
    reviewCount: (row.review_count as number) ?? 0,
    completedJobs: (row.completed_jobs as number) ?? 0,
    tags: row.tags as string[] | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function getServices(
  filters: Partial<ItemFilters> = {}
): Promise<PaginatedItemsResponse<ServiceListing>> {
  try {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("service_listings")
      .select("*", { count: "exact" })
      .eq("status", "active");

    if (filters.category) query = query.eq("category", filters.category);
    if (filters.searchQuery) query = query.ilike("title", `%${filters.searchQuery}%`);
    if (filters.minPriceXAF !== undefined) query = query.gte("price_from_xaf", filters.minPriceXAF);
    if (filters.maxPriceXAF !== undefined) query = query.lte("price_from_xaf", filters.maxPriceXAF);

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
    const message = err instanceof Error ? err.message : "Failed to load services";
    return { data: [], total: 0, page: 1, pageSize: 20, hasNextPage: false, error: message };
  }
}

export async function getServiceById(id: string): Promise<ServiceResponse> {
  try {
    const { data, error } = await supabase
      .from("service_listings")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return { data: null, error: error.message };
    return { data: mapRow(data as Record<string, unknown>), error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load service";
    return { data: null, error: message };
  }
}

export async function createService(
  providerId: string,
  payload: Omit<ServiceListing, "id" | "providerId" | "rating" | "reviewCount" | "completedJobs" | "createdAt" | "updatedAt">
): Promise<ServiceActionResponse> {
  try {
    const { data, error } = await supabase
      .from("service_listings")
      .insert({
        provider_id: providerId,
        title: payload.title,
        description: payload.description,
        category: payload.category,
        subcategory: payload.subcategory,
        price_from_xaf: payload.priceFromXAF,
        price_to_xaf: payload.priceToXAF,
        is_price_negotiable: payload.isPriceNegotiable,
        images: payload.images,
        city: payload.location.city,
        region: payload.location.region,
        country: payload.location.country ?? "",
        is_online_service: payload.isOnlineService,
        delivery_days: payload.deliveryDays,
        payment_methods: payload.paymentMethods,
        status: payload.status ?? "active",
        tags: payload.tags ?? [],
        rating: 0,
        review_count: 0,
        completed_jobs: 0,
      })
      .select("id")
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, id: (data as { id: string }).id, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create service";
    return { success: false, error: message };
  }
}

export async function updateService(
  id: string,
  providerId: string,
  updates: Partial<ServiceListing>
): Promise<ServiceActionResponse> {
  try {
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.priceFromXAF !== undefined) payload.price_from_xaf = updates.priceFromXAF;
    if (updates.status !== undefined) payload.status = updates.status;

    const { error } = await supabase
      .from("service_listings")
      .update(payload)
      .eq("id", id)
      .eq("provider_id", providerId);

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update service";
    return { success: false, error: message };
  }
}

export async function deleteService(
  id: string,
  providerId: string
): Promise<ServiceActionResponse> {
  try {
    const { error } = await supabase
      .from("service_listings")
      .delete()
      .eq("id", id)
      .eq("provider_id", providerId);

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete service";
    return { success: false, error: message };
  }
}

export async function getMyServices(
  providerId: string
): Promise<PaginatedItemsResponse<ServiceListing>> {
  try {
    const { data, count, error } = await supabase
      .from("service_listings")
      .select("*", { count: "exact" })
      .eq("provider_id", providerId)
      .order("created_at", { ascending: false });

    if (error) {
      return { data: [], total: 0, page: 1, pageSize: 100, hasNextPage: false, error: error.message };
    }

    const items = (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
    return { data: items, total: count ?? 0, page: 1, pageSize: 100, hasNextPage: false, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load services";
    return { data: [], total: 0, page: 1, pageSize: 100, hasNextPage: false, error: message };
  }
}

