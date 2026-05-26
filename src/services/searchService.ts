/**
 * src/services/searchService.ts
 * Bambeh Marketplace — Universal Search Service
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────
export type SearchCategory =
  | "all"
  | "marketplace"
  | "jobs"
  | "services"
  | "rentals"
  | "vehicles"
  | "exchange"
  | "vendors";

export interface SearchResult {
  id: string;
  type: Exclude<SearchCategory, "all">;
  title: string;
  description?: string;
  imageUrl?: string;
  priceXAF?: number;
  location?: string;
  createdAt: string;
  relevanceScore?: number;
}

export interface SearchFilters {
  query: string;
  category?: SearchCategory;
  city?: string;
  region?: string;
  minPriceXAF?: number;
  maxPriceXAF?: number;
  sortBy?: "relevance" | "newest" | "price_asc" | "price_desc";
  page?: number;
  pageSize?: number;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
  category: SearchCategory;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  error: string | null;
}

export interface SearchSuggestion {
  text: string;
  category: SearchCategory;
  count: number;
}

// ─── Full-Text Search ─────────────────────────────────────────────────────────
export async function search(filters: SearchFilters): Promise<SearchResponse> {
  const {
    query,
    category = "all",
    city,
    minPriceXAF,
    maxPriceXAF,
    sortBy = "relevance",
    page = 1,
    pageSize = 20,
  } = filters;

  const from = (page - 1) * pageSize;
  const results: SearchResult[] = [];
  let total = 0;

  try {
    if (!query || query.trim().length < 2) {
      return {
        results: [],
        total: 0,
        query,
        category,
        page,
        pageSize,
        hasNextPage: false,
        error: "Query too short",
      };
    }

    const searchTerm = query.trim();

    // ── Marketplace ──────────────────────────────────────────────────────────
    if (category === "all" || category === "marketplace") {
      let q = supabase
        .from("marketplace_items")
        .select("id, title, description, images, price_xaf, city, created_at", { count: "exact" })
        .eq("status", "active")
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);

      if (city) q = q.ilike("city", `%${city}%`);
      if (minPriceXAF !== undefined) q = q.gte("price_xaf", minPriceXAF);
      if (maxPriceXAF !== undefined) q = q.lte("price_xaf", maxPriceXAF);

      const { data, count } = await q
        .order("created_at", { ascending: false })
        .range(from, from + pageSize - 1);

      total += count ?? 0;

      if (data) {
        for (const row of data) {
          const images = Array.isArray(row.images) ? row.images : [];
          results.push({
            id: row.id as string,
            type: "marketplace",
            title: row.title as string,
            description: row.description as string,
            imageUrl: images[0]?.url as string | undefined,
            priceXAF: row.price_xaf as number,
            location: row.city as string,
            createdAt: row.created_at as string,
          });
        }
      }
    }

    // ── Jobs ─────────────────────────────────────────────────────────────────
    if (category === "all" || category === "jobs") {
      let q = supabase
        .from("job_listings")
        .select("id, title, description, city, salary_min_xaf, created_at", { count: "exact" })
        .eq("status", "active")
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);

      if (city) q = q.ilike("city", `%${city}%`);

      const { data, count } = await q
        .order("created_at", { ascending: false })
        .range(from, from + pageSize - 1);

      total += count ?? 0;

      if (data) {
        for (const row of data) {
          results.push({
            id: row.id as string,
            type: "jobs",
            title: row.title as string,
            description: row.description as string,
            priceXAF: row.salary_min_xaf as number | undefined,
            location: row.city as string,
            createdAt: row.created_at as string,
          });
        }
      }
    }

    // ── Services ─────────────────────────────────────────────────────────────
    if (category === "all" || category === "services") {
      let q = supabase
        .from("service_listings")
        .select("id, title, description, images, price_from_xaf, city, created_at", { count: "exact" })
        .eq("status", "active")
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);

      if (city) q = q.ilike("city", `%${city}%`);

      const { data, count } = await q
        .order("created_at", { ascending: false })
        .range(from, from + pageSize - 1);

      total += count ?? 0;

      if (data) {
        for (const row of data) {
          const images = Array.isArray(row.images) ? row.images : [];
          results.push({
            id: row.id as string,
            type: "services",
            title: row.title as string,
            description: row.description as string,
            imageUrl: images[0]?.url as string | undefined,
            priceXAF: row.price_from_xaf as number,
            location: row.city as string,
            createdAt: row.created_at as string,
          });
        }
      }
    }

    // ── Vendors ───────────────────────────────────────────────────────────────
    if (category === "all" || category === "vendors") {
      const { data, count } = await supabase
        .from("vendor_profiles")
        .select("id, store_name, store_description, logo_url, city, created_at", { count: "exact" })
        .or(`store_name.ilike.%${searchTerm}%,store_description.ilike.%${searchTerm}%`)
        .range(from, from + pageSize - 1);

      total += count ?? 0;

      if (data) {
        for (const row of data) {
          results.push({
            id: row.id as string,
            type: "vendors",
            title: row.store_name as string,
            description: row.store_description as string,
            imageUrl: row.logo_url as string | undefined,
            location: row.city as string,
            createdAt: row.created_at as string,
          });
        }
      }
    }

    // Sort combined results
    if (sortBy === "price_asc") {
      results.sort((a, b) => (a.priceXAF ?? 0) - (b.priceXAF ?? 0));
    } else if (sortBy === "price_desc") {
      results.sort((a, b) => (b.priceXAF ?? 0) - (a.priceXAF ?? 0));
    } else {
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return {
      results,
      total,
      query,
      category,
      page,
      pageSize,
      hasNextPage: from + pageSize < total,
      error: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Search failed";
    return {
      results: [],
      total: 0,
      query,
      category,
      page,
      pageSize,
      hasNextPage: false,
      error: message,
    };
  }
}

// ─── Search Suggestions (autocomplete) ───────────────────────────────────────
export async function getSearchSuggestions(
  query: string
): Promise<SearchSuggestion[]> {
  if (!query || query.length < 2) return [];

  try {
    const suggestions: SearchSuggestion[] = [];

    const { data } = await supabase
      .from("marketplace_items")
      .select("title")
      .ilike("title", `${query}%`)
      .eq("status", "active")
      .limit(5);

    if (data) {
      for (const row of data) {
        suggestions.push({
          text: row.title as string,
          category: "marketplace",
          count: 1,
        });
      }
    }

    return suggestions.slice(0, 8);
  } catch {
    return [];
  }
}

// ─── Save Search ──────────────────────────────────────────────────────────────
export async function saveSearch(
  userId: string,
  query: string,
  category: SearchCategory,
  filters?: Partial<SearchFilters>
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase.from("saved_searches").upsert({
      user_id: userId,
      query,
      category,
      filters: filters ?? {},
      updated_at: new Date().toISOString(),
    });

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save search";
    return { success: false, error: message };
  }
}

// ─── Get Saved Searches ───────────────────────────────────────────────────────
export async function getSavedSearches(
  userId: string
): Promise<{ data: Array<{ id: string; query: string; category: SearchCategory; createdAt: string }>; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("saved_searches")
      .select("id, query, category, created_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(20);

    if (error) return { data: [], error: error.message };

    return {
      data: (data ?? []).map((row) => ({
        id: row.id,
        query: row.query,
        category: row.category,
        createdAt: row.created_at,
      })),
      error: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load saved searches";
    return { data: [], error: message };
  }
}

// ─── Record Search Analytics ──────────────────────────────────────────────────
export async function recordSearchAnalytics(
  query: string,
  category: SearchCategory,
  resultCount: number
): Promise<void> {
  try {
    await supabase.from("search_analytics").insert({
      query: query.toLowerCase().trim(),
      category,
      result_count: resultCount,
      searched_at: new Date().toISOString(),
    });
  } catch {
    // Non-critical
  }
}
