/**
 * src/hooks/useFeaturedAds.ts — Bambeh Marketplace
 * FILE LOCATION: src/hooks/useFeaturedAds.ts
 *
 * Custom hook that queries featured_ads table and returns
 * paginated, rotatable ads for FeaturedAdsStrip component.
 *
 * Schema matches confirmed featured_ads columns:
 * id, listing_id, title(TEXT), price(NUMERIC), category(TEXT),
 * location(TEXT), image_url(TEXT), seller_id(UUID), tier(TEXT),
 * is_active(BOOLEAN), starts_at, ends_at, created_at
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";

// ─── Types ───────────────────────────────────────────────────────────────────

export type AdCategory =
  | "marketplace" | "jobs" | "services" | "rentals"
  | "vehicles" | "exchange" | "farm-fresh" | "general";

export interface FeaturedAd {
  id:            string;
  listing_id:    string | null;
  title:         string;           // plain TEXT from our schema
  description:   string | null;
  price:         number | null;
  category:      string;
  listing_path:  string;           // derived from category
  thumbnail_url: string | null;
  image_url:     string | null;
  is_promoted:   boolean;
  vendor_name:   string | null;
  created_at:    string;
  tier:          string;
  location:      string | null;
}

interface UseFeaturedAdsOptions {
  category?:    AdCategory;
  pageSize?:    number;
  rotationMs?:  number;
  searchQuery?: string;
}

interface UseFeaturedAdsResult {
  ads:          FeaturedAd[];
  allAds:       FeaturedAd[];
  isLoading:    boolean;
  error:        string | null;
  currentPage:  number;
  totalPages:   number;
  nextPage:     () => void;
  prevPage:     () => void;
  goToPage:     (n: number) => void;
  timeAgoLabel: string;
  refetch:      () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * resolveLocalizedText — FeaturedAdsStrip calls this on title/description.
 * Our title is plain TEXT (not JSONB), so just return it directly.
 * Falls back gracefully if someone passes a JSON object.
 */
export function resolveLocalizedText(
  value: string | Record<string, string> | null | undefined,
  lang = "en",
): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  // Handle JSONB-style object {en: "...", fr: "..."}
  return value[lang] ?? value["en"] ?? value["fr"] ?? Object.values(value)[0] ?? "";
}

/** Category → route path mapping */
const CATEGORY_PATHS: Record<string, string> = {
  marketplace:  "/marketplace",
  jobs:         "/jobs",
  services:     "/services",
  rentals:      "/rentals",
  vehicles:     "/vehicles",
  exchange:     "/exchange",
  "farm-fresh": "/farm-fresh",
  general:      "/marketplace",
};

function listingPath(category: string, listingId: string | null): string {
  const base = CATEGORY_PATHS[category] ?? "/marketplace";
  return listingId ? `${base}/${listingId}` : base;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  if (mins < 60)   return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)    return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useFeaturedAds({
  category,
  pageSize    = 20,
  rotationMs  = 30_000,
  searchQuery = "",
}: UseFeaturedAdsOptions = {}): UseFeaturedAdsResult {
  const [allAds,      setAllAds]      = useState<FeaturedAd[]>([]);
  const [isLoading,   setIsLoading]   = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAds = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("featured_ads")
        .select(
          "id, listing_id, title, price, category, location, image_url, seller_id, tier, is_active, created_at"
        )
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(100);

      if (category) {
        query = query.eq("category", category);
      }

      const { data, error: dbErr } = await query;

      if (dbErr) {
        // Don't crash — just show empty
        setError("Couldn't load ads.");
        setAllAds([]);
        return;
      }

      const mapped: FeaturedAd[] = (data ?? []).map((row: any) => ({
        id:            row.id,
        listing_id:    row.listing_id ?? null,
        title:         row.title || "",
        description:   null,
        price:         row.price ?? null,
        category:      row.category || "general",
        listing_path:  listingPath(row.category, row.listing_id),
        thumbnail_url: row.image_url ?? null,
        image_url:     row.image_url ?? null,
        is_promoted:   row.tier === "platinum" || row.tier === "premium",
        vendor_name:   null,
        created_at:    row.created_at,
        tier:          row.tier || "basic",
        location:      row.location ?? null,
      }));

      // Filter by search query
      const filtered = searchQuery
        ? mapped.filter(ad =>
            ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (ad.category?.toLowerCase().includes(searchQuery.toLowerCase()))
          )
        : mapped;

      setAllAds(filtered);
      setCurrentPage(0);
    } catch {
      setError("Couldn't load ads.");
      setAllAds([]);
    } finally {
      setIsLoading(false);
    }
  }, [category, searchQuery]);

  // Initial fetch
  useEffect(() => {
    void fetchAds();
  }, [fetchAds]);

  // Auto-rotation
  useEffect(() => {
    if (rotationMs > 0 && allAds.length > pageSize) {
      timerRef.current = setInterval(() => {
        setCurrentPage(p => {
          const total = Math.ceil(allAds.length / pageSize);
          return (p + 1) % total;
        });
      }, rotationMs);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [allAds.length, pageSize, rotationMs]);

  const totalPages  = Math.max(1, Math.ceil(allAds.length / pageSize));
  const start       = currentPage * pageSize;
  const ads         = allAds.slice(start, start + pageSize);
  const timeAgoLabel = allAds[0]?.created_at ? timeAgo(allAds[0].created_at) : "";

  return {
    ads,
    allAds,
    isLoading,
    error,
    currentPage,
    totalPages,
    nextPage:     () => setCurrentPage(p => Math.min(p + 1, totalPages - 1)),
    prevPage:     () => setCurrentPage(p => Math.max(p - 1, 0)),
    goToPage:     (n) => setCurrentPage(Math.max(0, Math.min(n, totalPages - 1))),
    timeAgoLabel,
    refetch:      fetchAds,
  };
}
