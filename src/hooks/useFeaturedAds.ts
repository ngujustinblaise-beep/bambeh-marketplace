/**
 * useFeaturedAds.ts — Bambeh Marketplace
 * FILE LOCATION: src/hooks/useFeaturedAds.ts
 *
 * RESPONSIBILITIES:
 *  - Fetches up to 500 active featured ads from Supabase, newest first
 *  - Filters by `category` if supplied (for page-specific use)
 *  - Rotates the DISPLAYED slice in sets of 20 every `rotationMs` milliseconds
 *  - Subscribes to Supabase Realtime so new ads appear without page refresh
 *  - Exposes `timeAgoLabel(createdAt)` for multilingual relative timestamps
 *
 * USAGE:
 *  // In MainLayout — show all categories:
 *  const { ads, isLoading, currentPage, totalPages, nextPage, prevPage } =
 *    useFeaturedAds({ pageSize: 20 });
 *
 *  // On /jobs page — filter to jobs only:
 *  const { ads } = useFeaturedAds({ category: 'jobs', pageSize: 20 });
 *
 * © 2026 BAMBEH SARL. All rights reserved.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AdCategory =
  | "marketplace"
  | "jobs"
  | "services"
  | "rentals"
  | "vehicles"
  | "exchange"
  | "farm-fresh"
  | "flash-deals"
  | "group-buying"
  | "general";

export interface FeaturedAd {
  id: string;
  vendor_id: string;
  vendor_name: string;
  category: AdCategory;
  /** JSONB: { en: "...", fr: "...", ha: "...", ar: "...", pcm: "...", ful: "..." } */
  title: Record<string, string>;
  description: Record<string, string>;
  price?: number | null;
  currency: string;
  image_url?: string | null;
  thumbnail_url?: string | null;
  listing_id?: string | null;
  listing_path?: string | null;
  is_active: boolean;
  is_promoted: boolean;
  created_at: string;
  updated_at: string;
  expires_at?: string | null;
}

export interface UseFeaturedAdsOptions {
  /** Filter by a specific category (leave undefined for all categories) */
  category?: AdCategory;
  /** Number of ads to show per page/rotation (default: 20) */
  pageSize?: number;
  /** How often to auto-rotate to next set, in ms (default: 30 000 = 30 sec) */
  rotationMs?: number;
  /** Search query string — filters by title/description across all languages */
  searchQuery?: string;
}

export interface UseFeaturedAdsReturn {
  /** The currently visible slice of ads (length ≤ pageSize) */
  ads: FeaturedAd[];
  /** All matching ads (up to 500) */
  allAds: FeaturedAd[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (n: number) => void;
  /** Localised time-ago label using the active LanguageContext language */
  timeAgoLabel: (iso: string) => string;
  refetch: () => void;
}

// ─── Language helpers ─────────────────────────────────────────────────────────

/**
 * Map Bambeh language codes → the keys used in the JSONB columns.
 * The Bambeh LanguageContext uses codes like "en", "fr", "ha", "ar", "pcm", "ful".
 */
function resolveLocalizedText(
  jsonb: Record<string, string> | string | null | undefined,
  langCode: string,
): string {
  if (!jsonb) return "";
  if (typeof jsonb === "string") return jsonb;
  return (
    jsonb[langCode] ||
    jsonb["en"] ||
    Object.values(jsonb).find(Boolean) ||
    ""
  );
}

// ─── Time-ago labels (multilingual) ──────────────────────────────────────────

const TIME_AGO_LABELS: Record<
  string,
  {
    justNow: string;
    minutes: (n: number) => string;
    hours: (n: number) => string;
    days: (n: number) => string;
    weeks: (n: number) => string;
    months: (n: number) => string;
    years: (n: number) => string;
  }
> = {
  en: {
    justNow:  "Just now",
    minutes:  (n) => `${n} min ago`,
    hours:    (n) => `${n}h ago`,
    days:     (n) => `${n}d ago`,
    weeks:    (n) => `${n}w ago`,
    months:   (n) => `${n} month${n > 1 ? "s" : ""} ago`,
    years:    (n) => `${n} year${n > 1 ? "s" : ""} ago`,
  },
  fr: {
    justNow:  "À l'instant",
    minutes:  (n) => `il y a ${n} min`,
    hours:    (n) => `il y a ${n}h`,
    days:     (n) => `il y a ${n}j`,
    weeks:    (n) => `il y a ${n} sem.`,
    months:   (n) => `il y a ${n} mois`,
    years:    (n) => `il y a ${n} an${n > 1 ? "s" : ""}`,
  },
  ha: {
    justNow:  "Yanzu yanzu",
    minutes:  (n) => `mintuna ${n} da suka wuce`,
    hours:    (n) => `awa ${n} da suka wuce`,
    days:     (n) => `kwana ${n} da suka wuce`,
    weeks:    (n) => `mako${n > 1 ? "ni" : ""} ${n} da suka wuce`,
    months:   (n) => `wata ${n} da suka wuce`,
    years:    (n) => `shekara ${n} da suka wuce`,
  },
  ar: {
    justNow:  "الآن",
    minutes:  (n) => `منذ ${n} دقيقة`,
    hours:    (n) => `منذ ${n} ساعة`,
    days:     (n) => `منذ ${n} يوم`,
    weeks:    (n) => `منذ ${n} أسبوع`,
    months:   (n) => `منذ ${n} شهر`,
    years:    (n) => `منذ ${n} سنة`,
  },
  pcm: {
    justNow:  "Just now",
    minutes:  (n) => `${n} min wey pass`,
    hours:    (n) => `${n}hr wey pass`,
    days:     (n) => `${n} day wey pass`,
    weeks:    (n) => `${n} week wey pass`,
    months:   (n) => `${n} month wey pass`,
    years:    (n) => `${n} year wey pass`,
  },
  ful: {
    justNow:  "Hannde",
    minutes:  (n) => `${n} miniti pawti`,
    hours:    (n) => `${n} waktu pawti`,
    days:     (n) => `${n} ñalawma pawti`,
    weeks:    (n) => `${n} yontere pawti`,
    months:   (n) => `${n} lewru pawti`,
    years:    (n) => `${n} hitaande pawti`,
  },
};

function buildTimeAgo(iso: string, lang: string): string {
  const labels = TIME_AGO_LABELS[lang] ?? TIME_AGO_LABELS["en"];
  const diff   = Date.now() - new Date(iso).getTime();
  const sec    = Math.floor(diff / 1000);
  const min    = Math.floor(sec  / 60);
  const hrs    = Math.floor(min  / 60);
  const days   = Math.floor(hrs  / 24);
  const weeks  = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years  = Math.floor(days / 365);

  if (sec  < 60)  return labels.justNow;
  if (min  < 60)  return labels.minutes(min);
  if (hrs  < 24)  return labels.hours(hrs);
  if (days < 7)   return labels.days(days);
  if (weeks < 5)  return labels.weeks(weeks);
  if (months < 12) return labels.months(months);
  return labels.years(years);
}

// ─── Search helper ────────────────────────────────────────────────────────────

function adMatchesSearch(ad: FeaturedAd, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase().trim();

  // Search across ALL language values in title + description + vendor_name + category
  const titleValues = Object.values(ad.title || {}).join(" ").toLowerCase();
  const descValues  = Object.values(ad.description || {}).join(" ").toLowerCase();
  const extra       = `${ad.vendor_name} ${ad.category}`.toLowerCase();

  return (
    titleValues.includes(q) ||
    descValues.includes(q)  ||
    extra.includes(q)
  );
}

// ─── The Hook ─────────────────────────────────────────────────────────────────

export function useFeaturedAds(options: UseFeaturedAdsOptions = {}): UseFeaturedAdsReturn {
  const {
    category,
    pageSize    = 20,
    rotationMs  = 30_000,
    searchQuery = "",
  } = options;

  // Pull the active language from Bambeh's LanguageContext
  // `language` is expected to be a string like "en", "fr", "ha", etc.
  const { language } = useLanguage() as { language: string; t: (k: string) => string };

  const [allAds,    setAllAds]    = useState<FeaturedAd[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [page,      setPage]      = useState(0);   // 0-indexed

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchAds = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("featured_ads")
        .select("*")
        .eq("is_active", true)
        .or("expires_at.is.null,expires_at.gt." + new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(500);

      if (category) {
        query = query.eq("category", category);
      }

      const { data, error: sbError } = await query;
      if (sbError) throw sbError;
      setAllAds((data as FeaturedAd[]) ?? []);
      setPage(0);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load ads";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [category]);

  useEffect(() => { fetchAds(); }, [fetchAds]);

  // ── Realtime subscription ────────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel("featured_ads_realtime")
      .on(
        "postgres_changes",
        {
          event:  "*",
          schema: "public",
          table:  "featured_ads",
          ...(category ? { filter: `category=eq.${category}` } : {}),
        },
        () => { fetchAds(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [category, fetchAds]);

  // ── Filter by search ─────────────────────────────────────────────────────
  const filteredAds = searchQuery.trim()
    ? allAds.filter((ad) => adMatchesSearch(ad, searchQuery))
    : allAds;

  const totalPages = Math.max(1, Math.ceil(filteredAds.length / pageSize));

  // ── Auto-rotation ────────────────────────────────────────────────────────
  // Only auto-rotate when there are more ads than one page.
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (filteredAds.length > pageSize) {
      timerRef.current = setInterval(() => {
        setPage((p) => (p + 1) % totalPages);
      }, rotationMs);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [filteredAds.length, pageSize, totalPages, rotationMs]);

  // ── Reset page when search changes ───────────────────────────────────────
  useEffect(() => { setPage(0); }, [searchQuery, category]);

  // ── Current slice ────────────────────────────────────────────────────────
  const start = page * pageSize;
  const ads   = filteredAds.slice(start, start + pageSize);

  // ── Navigation ───────────────────────────────────────────────────────────
  const nextPage = () => setPage((p) => (p + 1) % totalPages);
  const prevPage = () => setPage((p) => (p - 1 + totalPages) % totalPages);
  const goToPage = (n: number) => setPage(Math.max(0, Math.min(n, totalPages - 1)));

  // ── Time-ago label builder (uses active language) ─────────────────────────
  const timeAgoLabel = useCallback(
    (iso: string) => buildTimeAgo(iso, language ?? "en"),
    [language]
  );

  return {
    ads,
    allAds: filteredAds,
    isLoading,
    error,
    currentPage: page,
    totalPages,
    nextPage,
    prevPage,
    goToPage,
    timeAgoLabel,
    refetch: fetchAds,
  };
}

// ─── Utility re-exported so pages can localise ad text ───────────────────────
export { resolveLocalizedText };
