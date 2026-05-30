/**
 * src/services/marketplace.service.ts — PaymentMethod[] cast fix applied
 * Only the mapRow function is changed — payment_methods cast to PaymentMethod[]
 */
import { supabase } from "@/lib/supabase";
import type {
  MarketplaceItem, CreateMarketplaceItemRequest,
  UpdateMarketplaceItemRequest, ItemFilters, PaginatedItemsResponse,
} from "@/types/src_types_items";

export interface MarketplaceItemResponse { data: MarketplaceItem | null; error: string | null; }
export interface MarketplaceActionResponse { success: boolean; id?: string; error: string | null; }

function mapRow(row: Record<string, unknown>): MarketplaceItem {
  const images = Array.isArray(row.images) ? row.images : [];
  return {
    id: row.id as string,
    sellerId: row.seller_id as string,
    title: row.title as string,
    description: row.description as string,
    category: row.category as MarketplaceItem["category"],
    subcategory: row.subcategory as string | undefined,
    priceXAF: row.price_xaf as number,
    isNegotiable: Boolean(row.is_negotiable),
    condition: row.condition as MarketplaceItem["condition"],
    images: images.map((img: Record<string, unknown>, idx: number) => ({
      id: (img.id as string) ?? `img-${idx}`,
      url: img.url as string,
      thumbnailUrl: img.thumbnail_url as string | undefined,
      order: (img.order as number) ?? idx,
      isMain: (img.is_main as boolean) ?? idx === 0,
    })),
    location: {
      city: row.city as string,
      region: row.region as string,
      country: (row.country as string) ?? "",
      latitude: row.latitude as number | undefined,
      longitude: row.longitude as number | undefined,
      address: row.address as string | undefined,
    },
    deliveryOption: row.delivery_option as MarketplaceItem["deliveryOption"],
    // ── FIX: cast string[] → PaymentMethod[] ────────────────────────────────
    paymentMethods: ((row.payment_methods as string[]) ?? []) as MarketplaceItem["paymentMethods"],
    status: row.status as MarketplaceItem["status"],
    viewCount: (row.view_count as number) ?? 0,
    favoriteCount: (row.favorite_count as number) ?? 0,
    tags: row.tags as string[] | undefined,
    isSponsored: Boolean(row.is_sponsored),
    isFeatured: Boolean(row.is_featured),
    expiresAt: row.expires_at as string | undefined,
    soldAt: row.sold_at as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function getMarketplaceItems(
  filters: Partial<ItemFilters> = {}
): Promise<PaginatedItemsResponse<MarketplaceItem>> {
  try {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    let query = supabase.from("marketplace_items").select("*", { count: "exact" }).eq("status", "active");
    if (filters.category) query = query.eq("category", filters.category);
    if (filters.subcategory) query = query.eq("subcategory", filters.subcategory);
    if (filters.searchQuery) query = query.ilike("title", `%${filters.searchQuery}%`);
    if (filters.minPriceXAF !== undefined) query = query.gte("price_xaf", filters.minPriceXAF);
    if (filters.maxPriceXAF !== undefined) query = query.lte("price_xaf", filters.maxPriceXAF);
    if (filters.condition) query = query.eq("condition", filters.condition);
    if (filters.location) query = query.ilike("city", `%${filters.location}%`);
    if (filters.isFeatured) query = query.eq("is_featured", true);
    switch (filters.sortBy) {
      case "price_asc": query = query.order("price_xaf", { ascending: true }); break;
      case "price_desc": query = query.order("price_xaf", { ascending: false }); break;
      case "popular": query = query.order("view_count", { ascending: false }); break;
      default: query = query.order("created_at", { ascending: false });
    }
    query = query.range(from, to);
    const { data, count, error } = await query;
    if (error) return { data: [], total: 0, page, pageSize, hasNextPage: false, error: error.message };
    const total = count ?? 0;
    const items = (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
    return { data: items, total, page, pageSize, hasNextPage: from + pageSize < total, error: null };
  } catch (err) {
    return { data: [], total: 0, page: 1, pageSize: 20, hasNextPage: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function getMarketplaceItemById(id: string): Promise<MarketplaceItemResponse> {
  try {
    const { data, error } = await supabase.from("marketplace_items").select("*").eq("id", id).single();
    if (error) return { data: null, error: error.message };
    return { data: mapRow(data as Record<string, unknown>), error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function createMarketplaceItem(
  sellerId: string, payload: CreateMarketplaceItemRequest
): Promise<MarketplaceActionResponse> {
  try {
    const images = payload.imageUrls.map((url, idx) => ({ id: `img-${Date.now()}-${idx}`, url, order: idx, is_main: idx === 0 }));
    const { data, error } = await supabase.from("marketplace_items").insert({
      seller_id: sellerId, title: payload.title, description: payload.description,
      category: payload.category, subcategory: payload.subcategory, price_xaf: payload.priceXAF,
      is_negotiable: payload.isNegotiable, condition: payload.condition, images,
      city: payload.location.city, region: payload.location.region,
      country: payload.location.country ?? "",
      latitude: payload.location.latitude, longitude: payload.location.longitude,
      address: payload.location.address, delivery_option: payload.deliveryOption,
      payment_methods: payload.paymentMethods, tags: payload.tags ?? [],
      status: "active", view_count: 0, favorite_count: 0, is_sponsored: false, is_featured: false,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }).select("id").single();
    if (error) return { success: false, error: error.message };
    return { success: true, id: (data as { id: string }).id, error: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function updateMarketplaceItem(
  sellerId: string, payload: UpdateMarketplaceItemRequest
): Promise<MarketplaceActionResponse> {
  try {
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (payload.title !== undefined) updates.title = payload.title;
    if (payload.description !== undefined) updates.description = payload.description;
    if (payload.priceXAF !== undefined) updates.price_xaf = payload.priceXAF;
    if (payload.isNegotiable !== undefined) updates.is_negotiable = payload.isNegotiable;
    if (payload.condition !== undefined) updates.condition = payload.condition;
    if (payload.status !== undefined) updates.status = payload.status;
    if (payload.tags !== undefined) updates.tags = payload.tags;
    const { error } = await supabase.from("marketplace_items").update(updates).eq("id", payload.id).eq("seller_id", sellerId);
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function deleteMarketplaceItem(id: string, sellerId: string): Promise<MarketplaceActionResponse> {
  try {
    const { error } = await supabase.from("marketplace_items").delete().eq("id", id).eq("seller_id", sellerId);
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function getMyListings(sellerId: string): Promise<PaginatedItemsResponse<MarketplaceItem>> {
  try {
    const { data, count, error } = await supabase.from("marketplace_items").select("*", { count: "exact" }).eq("seller_id", sellerId).order("created_at", { ascending: false });
    if (error) return { data: [], total: 0, page: 1, pageSize: 100, hasNextPage: false, error: error.message };
    const items = (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
    return { data: items, total: count ?? 0, page: 1, pageSize: 100, hasNextPage: false, error: null };
  } catch (err) {
    return { data: [], total: 0, page: 1, pageSize: 100, hasNextPage: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function incrementMarketplaceView(id: string): Promise<void> {
  try { await supabase.rpc("increment_view_count", { table_name: "marketplace_items", record_id: id }); } catch { /* non-critical */ }
}

export async function markItemAsSold(id: string, sellerId: string): Promise<MarketplaceActionResponse> {
  try {
    const { error } = await supabase.from("marketplace_items").update({ status: "sold", sold_at: new Date().toISOString() }).eq("id", id).eq("seller_id", sellerId);
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

