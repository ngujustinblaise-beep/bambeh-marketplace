/**
 * src/hooks/useFeaturedAds.ts — Bambeh Marketplace
 * FILE LOCATION: src/hooks/useFeaturedAds.ts
 *
 * Confirmed featured_ads columns (from information_schema query):
 * id, listing_id, title(TEXT), price(NUMERIC), category(TEXT),
 * location(TEXT), image_url(TEXT), seller_id(UUID), tier(TEXT),
 * is_active(BOOLEAN), starts_at, ends_at, created_at
 * + added: vendor_name(TEXT), description(TEXT), is_promoted(BOOLEAN)
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";

// ─── Types ───────────────────────────────────────────────────────────────────

export type AdCategory =
  | "marketplace" | "jobs"          | "services"      | "rentals"
  | "vehicles"    | "exchange"      | "farm-fresh"    | "general"
  | "flash-deals" | "group-buying";

export interface FeaturedAd {
  id:            string;
  listing_id:    string | null;
  title:         string | Record<string, string>;
  description:   string | Record<string, string> | null;
  price:         number | null;
  category:      string;
  listing_path:  string;
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
  timeAgoLabel: (isoDate: string) => string;   // ← FUNCTION, not string
  refetch:      () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function resolveLocalizedText(
  value: string | Record<string, string> | null | undefined,
  lang = "en",
): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[lang] ?? value["en"] ?? value["fr"] ?? Object.values(value)[0] ?? "";
}

const CATEGORY_PATHS: Record<string, string> = {
  marketplace:   "/marketplace",
  jobs:          "/jobs",
  services:      "/services",
  rentals:       "/rentals",
  vehicles:      "/vehicles",
  exchange:      "/exchange",
  "farm-fresh":  "/farm-fresh",
  "flash-deals": "/flash-deals",
  "group-buying":"/group-buying",
  general:       "/marketplace",
};

function buildListingPath(category: string, listingId: string | null): string {
  const base = CATEGORY_PATHS[category] ?? "/marketplace";
  return listingId ? `${base}/${listingId}` : base;
}

// Standalone function — returned as a reference so the strip can call it per-ad
function timeAgoLabel(iso: string): string {
  if (!iso) return "";
  const diff  = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  if (mins  <  1) return "just now";
  if (mins  < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs   < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days  <  7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks <  5) return `${weeks}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
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
          "id, listing_id, title, description, price, category, location, image_url, vendor_name, seller_id, tier, is_active, is_promoted, created_at"
        )
        .eq("is_active", true)
        .order("is_promoted", { ascending: false })
        .order("created_at",  { ascending: false })
        .limit(100);

      if (category) {
        query = query.eq("category", category);
      }

      const { data, error: dbErr } = await query;

      if (dbErr) {
        setError("Couldn't load ads.");
        setAllAds([]);
        return;
      }

      const mapped: FeaturedAd[] = (data ?? []).map((row: any) => ({
        id:            row.id,
        listing_id:    row.listing_id  ?? null,
        title:         row.title       ?? "",
        description:   row.description ?? null,
        price:         row.price       ?? null,
        category:      row.category    || "general",
        listing_path:  buildListingPath(row.category, row.listing_id),
        thumbnail_url: row.image_url   ?? null,
        image_url:     row.image_url   ?? null,
        is_promoted:   row.is_promoted ?? (row.tier === "platinum" || row.tier === "premium"),
        vendor_name:   row.vendor_name ?? null,
        created_at:    row.created_at,
        tier:          row.tier        || "basic",
        location:      row.location    ?? null,
      }));

      setAllAds(mapped);
      setCurrentPage(0);
    } catch {
      setError("Couldn't load ads.");
      setAllAds([]);
    } finally {
      setIsLoading(false);
    }
  }, [category]);

  useEffect(() => {
    void fetchAds();
  }, [fetchAds]);

  // Re-filter on searchQuery change without re-fetching
  const filteredAds = searchQuery.trim()
    ? allAds.filter((ad) => {
        const titleStr = resolveLocalizedText(ad.title).toLowerCase();
        const descStr  = resolveLocalizedText(ad.description).toLowerCase();
        const q        = searchQuery.toLowerCase();
        return titleStr.includes(q) || descStr.includes(q) || ad.category.includes(q);
      })
    : allAds;

  // Auto-rotation
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (rotationMs > 0 && filteredAds.length > pageSize) {
      timerRef.current = setInterval(() => {
        setCurrentPage((p) => {
          const total = Math.ceil(filteredAds.length / pageSize);
          return (p + 1) % total;
        });
      }, rotationMs);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [filteredAds.length, pageSize, rotationMs]);

  const totalPages = Math.max(1, Math.ceil(filteredAds.length / pageSize));
  const safePage   = Math.min(currentPage, totalPages - 1);
  const start      = safePage * pageSize;
  const ads        = filteredAds.slice(start, start + pageSize);

  return {
    ads,
    allAds: filteredAds,
    isLoading,
    error,
    currentPage: safePage,
    totalPages,
    nextPage:     () => setCurrentPage((p) => Math.min(p + 1, totalPages - 1)),
    prevPage:     () => setCurrentPage((p) => Math.max(p - 1, 0)),
    goToPage:     (n) => setCurrentPage(Math.max(0, Math.min(n, totalPages - 1))),
    timeAgoLabel,   // function reference — strip calls timeAgoLabel(ad.created_at)
    refetch:      fetchAds,
  };
}
