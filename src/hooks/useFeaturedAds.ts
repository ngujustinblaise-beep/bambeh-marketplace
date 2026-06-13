/**
 * src/hooks/useFeaturedAds.ts — Bambeh Marketplace
 * © 2026 BAMBEH SARL. All rights reserved.
 *
 * Provides featured ads data to FeaturedAdsStrip with:
 *  ✅ Correct realtime: .on() BEFORE .subscribe() — no "after subscribe()" crash
 *  ✅ Unique channel name per mount — no channel collision across page re-renders
 *  ✅ Full cleanup on unmount
 *  ✅ Pagination + auto-rotation every rotationMs
 *  ✅ Search filtering
 *  ✅ resolveLocalizedText for multilingual ad titles/descriptions
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────
export type AdCategory =
  | "marketplace" | "jobs" | "services" | "rentals" | "vehicles"
  | "exchange" | "flash-deals" | "group-buying" | "farm-fresh" | "general";

/** A localized string can be either a plain string or a lang→text map */
type LocalizedString = string | Record<string, string>;

export interface FeaturedAd {
  id:             string;
  title:          LocalizedString;
  description?:   LocalizedString;
  thumbnail_url?: string;
  image_url?:     string;
  category:       AdCategory;
  price?:         number;
  listing_path?:  string;
  vendor_name?:   string;
  is_promoted?:   boolean;
  created_at:     string;
}

interface UseFeaturedAdsOptions {
  category?:    AdCategory;
  pageSize?:    number;
  rotationMs?:  number;
  searchQuery?: string;
}

interface UseFeaturedAdsReturn {
  ads:           FeaturedAd[];   // current page slice
  allAds:        FeaturedAd[];   // full filtered list
  isLoading:     boolean;
  error:         string | null;
  currentPage:   number;
  totalPages:    number;
  nextPage:      () => void;
  prevPage:      () => void;
  timeAgoLabel:  (dateStr: string) => string;
  refetch:       () => void;
}

// ─── resolveLocalizedText ─────────────────────────────────────────────────────
/**
 * If the value is a plain string, return it.
 * If it's a lang-map (e.g. { en: "Job", fr: "Emploi" }), return the right one.
 */
export function resolveLocalizedText(
  value: LocalizedString | undefined,
  lang: string
): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[lang] ?? value["en"] ?? Object.values(value)[0] ?? "";
}

// ─── Row → FeaturedAd mapper ──────────────────────────────────────────────────
function mapRow(row: Record<string, any>): FeaturedAd {
  const extra = (row.extra ?? {}) as Record<string, any>;

  // Resolve category — map from listings.type if needed
  let cat: AdCategory = "general";
  const rawCat = (row.category ?? row.type ?? "general") as string;
  const catMap: Record<string, AdCategory> = {
    job: "jobs", jobs: "jobs",
    marketplace: "marketplace", service: "services", services: "services",
    rental: "rentals", rentals: "rentals",
    vehicle: "vehicles", vehicles: "vehicles",
    exchange: "exchange",
    "flash-deals": "flash-deals", flash_deals: "flash-deals",
    "group-buying": "group-buying", group_buying: "group-buying",
    "farm-fresh": "farm-fresh", farm_fresh: "farm-fresh", farm_produce: "farm-fresh",
  };
  cat = catMap[rawCat.toLowerCase()] ?? "general";

  // Build listing path for navigation
  let listing_path = extra.listing_path ?? undefined;
  if (!listing_path) {
    if (cat === "jobs")       listing_path = `/jobs/${row.id}`;
    else if (cat === "farm-fresh") listing_path = `/farm-fresh/${row.id}`;
    else                      listing_path = `/item/${row.id}`;
  }

  return {
    id:            row.id ?? "",
    title:         row.title ?? extra.title ?? "",
    description:   row.description ?? extra.description ?? undefined,
    thumbnail_url: extra.thumbnail_url ?? extra.logo_url ?? undefined,
    image_url:     extra.image_url ??
                   (Array.isArray(row.images) ? row.images[0] : undefined) ??
                   undefined,
    category:      cat,
    price:         row.price ? Number(row.price) : undefined,
    listing_path,
    vendor_name:   extra.vendor_name ?? extra.company ?? row.seller_name ?? undefined,
    is_promoted:   Boolean(extra.is_promoted ?? row.is_promoted),
    created_at:    row.created_at ?? new Date().toISOString(),
  };
}

// ─── timeAgoLabel ─────────────────────────────────────────────────────────────
function makeTimeAgoLabel(lang: string) {
  return function timeAgoLabel(dateStr: string): string {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60_000); // minutes
    if (diff < 1)  return lang === "fr" ? "À l'instant" : lang === "ar" ? "الآن" : "Just now";
    if (diff < 60) return lang === "fr" ? `Il y a ${diff}min` : lang === "ar" ? `منذ ${diff} دقيقة` : `${diff}m ago`;
    const h = Math.floor(diff / 60);
    if (h < 24)    return lang === "fr" ? `Il y a ${h}h` : lang === "ar" ? `منذ ${h} ساعة` : `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 7)     return lang === "fr" ? `Il y a ${d}j` : lang === "ar" ? `منذ ${d} أيام` : `${d}d ago`;
    const w = Math.floor(d / 7);
    if (w < 5)     return lang === "fr" ? `Il y a ${w}sem` : lang === "ar" ? `منذ ${w} أسابيع` : `${w}w ago`;
    const m = Math.floor(d / 30);
    return lang === "fr" ? `Il y a ${m} mois` : lang === "ar" ? `منذ ${m} أشهر` : `${m}mo ago`;
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useFeaturedAds({
  category,
  pageSize   = 20,
  rotationMs = 30_000,
  searchQuery = "",
}: UseFeaturedAdsOptions = {}): UseFeaturedAdsReturn {

  const [allAds,    setAllAds]    = useState<FeaturedAd[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [page,      setPage]      = useState(0);

  const mountedRef  = useRef(true);
  const channelRef  = useRef<ReturnType<typeof supabase.channel> | null>(null);
  // Detect language for timeAgo labels
  const lang = localStorage.getItem("Bambeh_language") ?? "en";

  const fetchAds = useCallback(async () => {
    try {
      if (mountedRef.current) { setIsLoading(true); setError(null); }

      let query = supabase
        .from("listings")
        .select("*")
        .eq("is_featured", true)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(200); // fetch up to 200 so pagination works client-side

      if (category && category !== "general") {
        // Map AdCategory back to DB values
        const dbTypeMap: Record<AdCategory, string | null> = {
          jobs:          "job",
          marketplace:   "marketplace",
          services:      "service",
          rentals:       "rental",
          vehicles:      "vehicle",
          exchange:      "exchange",
          "flash-deals": "flash_deal",
          "group-buying":"group_buy",
          "farm-fresh":  "farm_produce",
          general:       null,
        };
        const dbType = dbTypeMap[category];
        if (dbType) query = query.eq("type", dbType);
      }

      const { data, error: dbErr } = await query;
      if (dbErr) throw new Error(dbErr.message);

      if (mountedRef.current) {
        const mapped = (data ?? []).map((r) => mapRow(r as Record<string, any>));
        setAllAds(mapped);
        setPage(0); // reset to first page on fresh fetch
      }
    } catch (e) {
      if (mountedRef.current) {
        setError(e instanceof Error ? e.message : "Failed to load ads");
      }
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, [category]);

  // ── Initial fetch + realtime ───────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    void fetchAds();

    // Unique channel name per mount — prevents "after subscribe()" crash
    const channelName = `featured_ads_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const ch = supabase.channel(channelName);

    // ✅ .on() BEFORE .subscribe() — this is the rule Supabase enforces
    ch.on(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      "postgres_changes" as any,
      { event: "*", schema: "public", table: "listings", filter: "is_featured=eq.true" },
      () => {
        if (mountedRef.current) void fetchAds();
      }
    );

    ch.subscribe((status) => {
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        console.warn("[useFeaturedAds] Realtime:", status, "— will retry on next fetch");
      }
    });

    channelRef.current = ch;

    return () => {
      mountedRef.current = false;
      if (channelRef.current) {
        void supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [fetchAds]);

  // ── Auto-rotation ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (rotationMs <= 0) return;
    const timer = setInterval(() => {
      if (!mountedRef.current) return;
      setPage((p) => {
        const filtered = applySearch(allAds, searchQuery);
        const total = Math.max(1, Math.ceil(filtered.length / pageSize));
        return (p + 1) % total;
      });
    }, rotationMs);
    return () => clearInterval(timer);
  }, [rotationMs, allAds, pageSize, searchQuery]);

  // ── Derived state ─────────────────────────────────────────────────────────
  function applySearch(ads: FeaturedAd[], q: string): FeaturedAd[] {
    if (!q.trim()) return ads;
    const lower = q.toLowerCase();
    return ads.filter((ad) => {
      const title = resolveLocalizedText(ad.title, lang).toLowerCase();
      const desc  = resolveLocalizedText(ad.description, lang).toLowerCase();
      return title.includes(lower) || desc.includes(lower) || (ad.vendor_name ?? "").toLowerCase().includes(lower);
    });
  }

  const filteredAds = applySearch(allAds, searchQuery);
  const totalPages  = Math.max(1, Math.ceil(filteredAds.length / pageSize));
  const safePage    = Math.min(page, totalPages - 1);
  const ads         = filteredAds.slice(safePage * pageSize, (safePage + 1) * pageSize);

  return {
    ads,
    allAds: filteredAds,
    isLoading,
    error,
    currentPage:  safePage,
    totalPages,
    nextPage:     () => setPage((p) => (p + 1) % totalPages),
    prevPage:     () => setPage((p) => (p - 1 + totalPages) % totalPages),
    timeAgoLabel: makeTimeAgoLabel(lang),
    refetch:      () => void fetchAds(),
  };
}
