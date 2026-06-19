/**
 * src/services/searchService.ts
 * Bambeh Marketplace â€” Universal Search Service
 * Â© 2026 Bambeh Marketplace. All rights reserved.
 *
 * IMPORTANT â€” YOUR SUPABASE SCHEMA:
 * All listing types (marketplace, job, service, rental, vehicle, exchange)
 * live in ONE table: "listings" with a "type" column.
 * There is NO separate marketplace_items, job_listings, or service_listings table.
 * vendor_profiles is a separate table and IS queried separately.
 * This file queries ONLY tables that actually exist.
 */

import { supabase } from "@/lib/supabase";

// â”€â”€â”€ Geographic Scope â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type SearchScope = "cameroon" | "central_africa" | "west_africa";

export const SCOPE_CONFIG: Record<
  SearchScope,
  { label: string; labelFr: string; countries: string[]; emoji: string }
> = {
  cameroon: {
    label:   "Cameroon",
    labelFr: "Cameroun",
    emoji:   "ðŸ‡¨ðŸ‡²",
    countries: ["Cameroon", "Cameroun"],
  },
  central_africa: {
    label:   "Central Africa",
    labelFr: "Afrique Centrale",
    emoji:   "ðŸŒ",
    countries: [
      "Cameroon", "Cameroun", "Gabon",
      "Congo", "Republic of Congo", "Congo-Brazzaville",
      "DR Congo", "DRC", "Congo-Kinshasa",
      "Central African Republic", "CAR",
      "Chad", "Tchad",
      "Equatorial Guinea", "GuinÃ©e Ã‰quatoriale",
      "SÃ£o TomÃ© and PrÃ­ncipe",
    ],
  },
  west_africa: {
    label:   "West Africa",
    labelFr: "Afrique de l'Ouest",
    emoji:   "ðŸŒ",
    countries: [
      "Nigeria", "Ghana", "Senegal", "SÃ©nÃ©gal",
      "CÃ´te d'Ivoire", "Ivory Coast", "Cameroon", "Cameroun",
      "Mali", "Burkina Faso", "Niger", "Guinea", "GuinÃ©e",
      "Benin", "BÃ©nin", "Togo", "Sierra Leone", "Liberia",
      "Mauritania", "Mauritanie", "Gambia", "Guinea-Bissau",
      "Cape Verde", "Cabo Verde",
    ],
  },
};

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type SearchCategory =
  | "all"
  | "marketplace"
  | "job"
  | "service"
  | "rental"
  | "vehicle"
  | "exchange"
  | "vendors";

export interface SearchResult {
  id:              string;
  type:            Exclude<SearchCategory, "all">;
  title:           string;
  description?:    string;
  imageUrl?:       string;
  priceXAF?:       number;
  location?:       string;
  country?:        string;
  createdAt:       string;
  relevanceScore?: number;
}

export interface SearchFilters {
  query:        string;
  category?:    SearchCategory;
  scope?:       SearchScope;
  city?:        string;
  region?:      string;
  country?:     string;
  minPriceXAF?: number;
  maxPriceXAF?: number;
  sortBy?:      "relevance" | "newest" | "price_asc" | "price_desc";
  page?:        number;
  pageSize?:    number;
}

export interface SearchResponse {
  results:     SearchResult[];
  total:       number;
  query:       string;
  category:    SearchCategory;
  scope:       SearchScope;
  page:        number;
  pageSize:    number;
  hasNextPage: boolean;
  error:       string | null;
}

export interface SearchSuggestion {
  text:     string;
  category: SearchCategory;
  count:    number;
}

// â”€â”€â”€ Full-Text Search â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// ALL types go through the single "listings" table using the "type" column.

export async function search(filters: SearchFilters): Promise<SearchResponse> {
  const {
    query,
    category = "all",
    scope    = "cameroon",
    city,
    minPriceXAF,
    maxPriceXAF,
    sortBy   = "newest",
    page     = 1,
    pageSize = 20,
  } = filters;

  const from    = (page - 1) * pageSize;
  const results: SearchResult[] = [];
  let   total   = 0;

  try {
    if (!query || query.trim().length < 2) {
      return { results: [], total: 0, query, category, scope, page, pageSize, hasNextPage: false, error: "Query too short" };
    }

    const term = query.trim();

    // â”€â”€ All listing types from the single "listings" table â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Map category names to the "type" values stored in your listings table
    const TYPE_MAP: Record<string, string> = {
      marketplace: "marketplace",
      job:         "job",
      service:     "service",
      rental:      "rental",
      vehicle:     "vehicle",
      exchange:    "exchange",
    };

    const typesToSearch = category === "all" || category === "vendors"
      ? Object.values(TYPE_MAP)
      : TYPE_MAP[category] ? [TYPE_MAP[category]] : [];

    if (typesToSearch.length > 0) {
      let q = supabase
        .from("listings")
        .select(
          "id, type, title, description, price, category, condition, location, country, images, created_at, extra",
          { count: "exact" }
        )
        .eq("status", "active")
        .in("type", typesToSearch)
        .or(`title.ilike.%${term}%,description.ilike.%${term}%,category.ilike.%${term}%`)
        .order("created_at", { ascending: false })
        .range(from, from + pageSize - 1);

      if (city)                       q = q.ilike("location", `%${city}%`);
      if (minPriceXAF !== undefined)  q = q.gte("price", minPriceXAF);
      if (maxPriceXAF !== undefined)  q = q.lte("price", maxPriceXAF);
      if (scope !== "cameroon")       q = (q as any).in("country", SCOPE_CONFIG[scope].countries);

      const { data, count, error } = await q;
      if (error) console.warn("[searchService] listings query:", error.message);

      total += count ?? 0;
      if (data) {
        for (const row of data) {
          results.push({
            id:          row.id,
            type:        row.type as SearchResult["type"],
            title:       row.title,
            description: row.description,
            imageUrl:    Array.isArray(row.images) ? row.images[0] : undefined,
            priceXAF:    row.price ? Number(row.price) : undefined,
            location:    row.location || row.extra?.city || "",
            country:     row.country || "Cameroon",
            createdAt:   row.created_at,
          });
        }
      }
    }

    // â”€â”€ Vendors â€” separate table â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (category === "all" || category === "vendors") {
      let q = supabase
        .from("vendor_profiles")
        .select("id, store_name, store_description, logo_url, city, country, created_at", { count: "exact" })
        .or(`store_name.ilike.%${term}%,store_description.ilike.%${term}%`);

      if (scope !== "cameroon") q = (q as any).in("country", SCOPE_CONFIG[scope].countries);

      const { data, count, error } = await q.range(from, from + pageSize - 1);
      if (error) console.warn("[searchService] vendor_profiles query:", error.message);

      total += count ?? 0;
      if (data) {
        for (const row of data) {
          results.push({
            id:          row.id,
            type:        "vendors",
            title:       row.store_name,
            description: row.store_description,
            imageUrl:    row.logo_url,
            location:    row.city,
            country:     row.country || "Cameroon",
            createdAt:   row.created_at,
          });
        }
      }
    }

    // â”€â”€ Sort â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (sortBy === "price_asc") {
      results.sort((a, b) => (a.priceXAF ?? 0) - (b.priceXAF ?? 0));
    } else if (sortBy === "price_desc") {
      results.sort((a, b) => (b.priceXAF ?? 0) - (a.priceXAF ?? 0));
    } else {
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return { results, total, query, category, scope, page, pageSize, hasNextPage: from + pageSize < total, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Search failed";
    return { results: [], total: 0, query, category, scope, page, pageSize, hasNextPage: false, error: message };
  }
}

// â”€â”€â”€ Search Suggestions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Uses the single "listings" table â€” no more references to non-existent tables.

export async function getSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
  if (!query || query.length < 2) return [];

  try {
    const { data, error } = await supabase
      .from("listings")
      .select("title, type")
      .ilike("title", `${query}%`)
      .eq("status", "active")
      .limit(8);

    if (error) return [];

    const seen = new Set<string>();
    return (data ?? [])
      .filter(row => {
        const key = row.title.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map(row => ({
        text:     row.title,
        category: row.type as SearchCategory,
        count:    1,
      }));
  } catch {
    return [];
  }
}

// â”€â”€â”€ Save Search â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function saveSearch(
  userId: string,
  query: string,
  category: SearchCategory,
  filters?: Partial<SearchFilters>
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase.from("saved_searches").upsert({
      user_id:    userId,
      query,
      category,
      filters:    filters ?? {},
      updated_at: new Date().toISOString(),
    });
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to save search" };
  }
}

// â”€â”€â”€ Get Saved Searches â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function getSavedSearches(userId: string): Promise<{
  data: Array<{ id: string; query: string; category: SearchCategory; createdAt: string }>;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from("saved_searches")
      .select("id, query, category, created_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(20);

    if (error) return { data: [], error: error.message };
    return {
      data: (data ?? []).map(row => ({
        id: row.id, query: row.query, category: row.category, createdAt: row.created_at,
      })),
      error: null,
    };
  } catch (err) {
    return { data: [], error: err instanceof Error ? err.message : "Failed to load saved searches" };
  }
}

// â”€â”€â”€ Record Search Analytics â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function recordSearchAnalytics(
  query: string,
  category: SearchCategory,
  resultCount: number,
  scope: SearchScope = "cameroon"
): Promise<void> {
  try {
    await supabase.from("search_analytics").insert({
      query:        query.toLowerCase().trim(),
      category,
      scope,
      result_count: resultCount,
      searched_at:  new Date().toISOString(),
    });
  } catch {
    // Non-critical
  }
}
