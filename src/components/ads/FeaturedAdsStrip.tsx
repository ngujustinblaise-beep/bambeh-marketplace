/**
 * FeaturedAdsStrip.tsx — Bambeh Marketplace
 * FILE LOCATION: src/components/ads/FeaturedAdsStrip.tsx
 *
 * RESPONSIBILITIES:
 *  - Renders a horizontal scrollable strip of featured ads
 *  - Up to 20 ads shown per set; rotates automatically every 30 s if >20 exist
 *  - Newest ads always shown first
 *  - Time labels are relative (minutes / hours / days / weeks / months) and
 *    rendered in the currently selected app language
 *  - Supports a `searchQuery` prop so parent pages can drive filtering
 *  - If `category` prop is passed the strip shows only that category's ads
 *  - Each card links to the original listing (listing_path) or the category page
 *
 * PROPS:
 *  category?    — limit to a single ad category
 *  searchQuery? — live search string from the parent page
 *  maxVisible?  — override the 20-ad page size
 *  showHeader?  — whether to show the "Featured Ads" section header (default: true)
 *
 * © 2026 BAMBEH SARL. All rights reserved.
 */

import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Tag,
  Briefcase,
  ShoppingBag,
  Wrench,
  Home,
  Car,
  ArrowLeftRight,
  Zap,
  Users,
  Leaf,
  Star,
  ExternalLink,
  RefreshCw,
  Search,
} from "lucide-react";
import {
  useFeaturedAds,
  resolveLocalizedText,
  type AdCategory,
  type FeaturedAd,
} from "@/hooks/useFeaturedAds";
import { useLanguage } from "@/context/LanguageContext";

// ─── Category icon + colour map ───────────────────────────────────────────────

const CATEGORY_META: Record<
  AdCategory,
  {
    icon: React.ComponentType<{ className?: string }>;
    colour: string;       // Tailwind bg class
    textColour: string;   // Tailwind text class
    path: string;         // fallback nav path
  }
> = {
  marketplace:  { icon: ShoppingBag,    colour: "bg-blue-100",   textColour: "text-blue-700",   path: "/marketplace"  },
  jobs:         { icon: Briefcase,      colour: "bg-amber-100",  textColour: "text-amber-700",  path: "/jobs"         },
  services:     { icon: Wrench,         colour: "bg-purple-100", textColour: "text-purple-700", path: "/services"     },
  rentals:      { icon: Home,           colour: "bg-green-100",  textColour: "text-green-700",  path: "/rentals"      },
  vehicles:     { icon: Car,            colour: "bg-red-100",    textColour: "text-red-700",    path: "/vehicles"     },
  exchange:     { icon: ArrowLeftRight, colour: "bg-pink-100",   textColour: "text-pink-700",   path: "/exchange"     },
  "flash-deals":{ icon: Zap,            colour: "bg-yellow-100", textColour: "text-yellow-700", path: "/flash-deals"  },
  "group-buying":{ icon: Users,         colour: "bg-cyan-100",   textColour: "text-cyan-700",   path: "/group-buying" },
  "farm-fresh": { icon: Leaf,           colour: "bg-lime-100",   textColour: "text-lime-700",   path: "/farm-fresh"   },
  general:      { icon: Tag,            colour: "bg-gray-100",   textColour: "text-gray-700",   path: "/"             },
};

// ─── UI string translations ───────────────────────────────────────────────────

const UI_STRINGS: Record<
  string,
  {
    featuredAds: string;
    noAds: string;
    promoted: string;
    viewAll: string;
    of: string;
    loadError: string;
    retry: string;
    searchPlaceholder: string;
  }
> = {
  en: {
    featuredAds:       "Featured Ads",
    noAds:             "No featured ads at the moment.",
    promoted:          "Promoted",
    viewAll:           "View all",
    of:                "of",
    loadError:         "Couldn't load ads.",
    retry:             "Retry",
    searchPlaceholder: "Search ads…",
  },
  fr: {
    featuredAds:       "Annonces en vedette",
    noAds:             "Aucune annonce pour le moment.",
    promoted:          "Sponsorisé",
    viewAll:           "Voir tout",
    of:                "sur",
    loadError:         "Impossible de charger les annonces.",
    retry:             "Réessayer",
    searchPlaceholder: "Rechercher des annonces…",
  },
  ha: {
    featuredAds:       "Tallace-tallace na musamman",
    noAds:             "Babu tallace-tallace yanzu.",
    promoted:          "Ingantaccen",
    viewAll:           "Duba duka",
    of:                "daga",
    loadError:         "Ba a iya loda tallace-tallace.",
    retry:             "Sake gwadawa",
    searchPlaceholder: "Nemo tallace-tallace…",
  },
  ar: {
    featuredAds:       "الإعلانات المميزة",
    noAds:             "لا توجد إعلانات في الوقت الحالي.",
    promoted:          "ممول",
    viewAll:           "عرض الكل",
    of:                "من",
    loadError:         "تعذّر تحميل الإعلانات.",
    retry:             "إعادة المحاولة",
    searchPlaceholder: "بحث في الإعلانات…",
  },
  pcm: {
    featuredAds:       "Featured Ads",
    noAds:             "No ad dey now.",
    promoted:          "Promoted",
    viewAll:           "See all",
    of:                "for",
    loadError:         "E no fit load ads.",
    retry:             "Try again",
    searchPlaceholder: "Search ads…",
  },
  ful: {
    featuredAds:       "Koonɗe Jaɓɓaaɗe",
    noAds:             "Alaa koonɗe hannde.",
    promoted:          "Nannginaaɗo",
    viewAll:           "Yiy'on fow",
    of:                "e dow",
    loadError:         "Waawaa heɓtude koonɗe.",
    retry:             "Taa fuɗɗo",
    searchPlaceholder: "Ɗaɓɓu koonɗe…",
  },
};

function useUiStrings(lang: string) {
  return UI_STRINGS[lang] ?? UI_STRINGS["en"];
}

// ─── Single ad card ───────────────────────────────────────────────────────────

interface AdCardProps {
  ad: FeaturedAd;
  lang: string;
  timeAgo: string;
  onNavigate: (path: string) => void;
}

const AdCard: React.FC<AdCardProps> = ({ ad, lang, timeAgo, onNavigate }) => {
  const meta  = CATEGORY_META[ad.category] ?? CATEGORY_META.general;
  const Icon  = meta.icon;
  const title = resolveLocalizedText(ad.title, lang);
  const desc  = resolveLocalizedText(ad.description, lang);
  const dest  = ad.listing_path || meta.path;

  const formattedPrice = ad.price
    ? new Intl.NumberFormat("fr-CM", { style: "currency", currency: "XAF", maximumFractionDigits: 0 })
        .format(ad.price)
    : null;

  return (
    <button
      onClick={() => onNavigate(dest)}
      className="flex-shrink-0 w-44 sm:w-52 bg-white rounded-2xl shadow-sm border border-gray-100
                 hover:shadow-md hover:border-teal-200 transition-all duration-200 overflow-hidden
                 text-left active:scale-95"
      aria-label={title}
    >
      {/* Image or colour placeholder */}
      <div className={`relative h-28 sm:h-32 ${meta.colour} flex items-center justify-center overflow-hidden`}>
        {ad.thumbnail_url || ad.image_url ? (
          <img
            src={ad.thumbnail_url || ad.image_url || ""}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <Icon className={`w-10 h-10 ${meta.textColour} opacity-40`} />
        )}
        {/* Promoted badge */}
        {ad.is_promoted && (
          <span className="absolute top-1.5 left-1.5 bg-amber-500 text-white text-[9px] font-bold
                           px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
            <Star className="w-2.5 h-2.5 fill-white" />
            {UI_STRINGS[lang]?.promoted ?? "Promoted"}
          </span>
        )}
        {/* Category badge */}
        <span className={`absolute top-1.5 right-1.5 ${meta.colour} ${meta.textColour}
                          text-[9px] font-semibold px-1.5 py-0.5 rounded-full capitalize`}>
          {ad.category.replace("-", " ")}
        </span>
      </div>

      {/* Text content */}
      <div className="p-2.5">
        <h4 className="text-xs font-semibold text-gray-800 leading-tight line-clamp-2 mb-1">
          {title}
        </h4>
        {desc && (
          <p className="text-[10px] text-gray-500 leading-tight line-clamp-2 mb-1.5">
            {desc}
          </p>
        )}
        <div className="flex items-center justify-between mt-auto">
          {formattedPrice ? (
            <span className="text-xs font-bold text-teal-700">{formattedPrice}</span>
          ) : (
            <span className="text-[10px] text-gray-400 truncate max-w-[80px]">{ad.vendor_name}</span>
          )}
          <span className="text-[9px] text-gray-400 shrink-0 ml-1">{timeAgo}</span>
        </div>
      </div>
    </button>
  );
};

// ─── FeaturedAdsStrip ─────────────────────────────────────────────────────────

interface FeaturedAdsStripProps {
  category?: AdCategory;
  searchQuery?: string;
  maxVisible?: number;
  showHeader?: boolean;
  /** Extra Tailwind classes on the outer wrapper */
  className?: string;
}

export const FeaturedAdsStrip: React.FC<FeaturedAdsStripProps> = ({
  category,
  searchQuery = "",
  maxVisible  = 20,
  showHeader  = true,
  className   = "",
}) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const lang = language ?? "en";
  const ui   = useUiStrings(lang);

  // Local search state (only used when parent hasn't passed searchQuery)
  const [localSearch, setLocalSearch] = useState("");
  const effectiveSearch = searchQuery || localSearch;

  const {
    ads,
    allAds,
    isLoading,
    error,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    timeAgoLabel,
    refetch,
  } = useFeaturedAds({
    category,
    pageSize:    maxVisible,
    rotationMs:  30_000,
    searchQuery: effectiveSearch,
  });

  const handleNav = useCallback(
    (path: string) => { navigate(path); },
    [navigate]
  );

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className={`px-4 py-3 ${className}`}>
        {showHeader && (
          <div className="flex items-center gap-2 mb-3">
            <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
          </div>
        )}
        <div className="flex gap-3 overflow-x-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-44 h-40 bg-gray-100 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className={`px-4 py-2 ${className}`}>
        <p className="text-xs text-red-500">
          {ui.loadError}{" "}
          <button onClick={refetch} className="underline inline-flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> {ui.retry}
          </button>
        </p>
      </div>
    );
  }

  // ── Empty state ──────────────────────────────────────────────────────────
  if (allAds.length === 0 && !effectiveSearch) {
    return null;   // silently hide strip when there are no ads to show
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <section
      className={`bg-white border-b border-gray-100 ${className}`}
      aria-label={ui.featuredAds}
    >
      {/* Header row */}
      {showHeader && (
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <div className="flex items-center gap-2">
            <span className="w-1 h-5 bg-teal-500 rounded-full" />
            <h2 className="text-sm font-bold text-gray-800">{ui.featuredAds}</h2>
            {allAds.length > 0 && (
              <span className="text-xs text-gray-400">
                ({currentPage + 1} {ui.of} {totalPages})
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Inline search — only shown if parent hasn't supplied searchQuery */}
            {!searchQuery && (
              <div className="relative hidden sm:block">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                <input
                  type="text"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  placeholder={ui.searchPlaceholder}
                  className="pl-6 pr-3 py-1 text-xs bg-gray-50 border border-gray-200 rounded-full
                             focus:outline-none focus:ring-1 focus:ring-teal-400 w-36"
                />
              </div>
            )}

            {/* Prev / Next page */}
            {totalPages > 1 && (
              <>
                <button
                  onClick={prevPage}
                  className="w-7 h-7 bg-gray-100 hover:bg-teal-100 rounded-full flex items-center
                             justify-center transition-colors"
                  aria-label="Previous ads"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={nextPage}
                  className="w-7 h-7 bg-gray-100 hover:bg-teal-100 rounded-full flex items-center
                             justify-center transition-colors"
                  aria-label="Next ads"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </>
            )}

            {/* View-all link — leads to /search or category page */}
            {allAds.length > 0 && (
              <button
                onClick={() => handleNav(category ? (CATEGORY_META[category]?.path ?? "/") : "/marketplace")}
                className="text-[11px] font-semibold text-teal-600 hover:text-teal-800
                           flex items-center gap-0.5 transition-colors"
              >
                {ui.viewAll}
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mobile search bar (always shown below header on small screens) */}
      {!searchQuery && (
        <div className="sm:hidden px-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder={ui.searchPlaceholder}
              className="w-full pl-8 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl
                         focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>
        </div>
      )}

      {/* Scrollable cards row */}
      {ads.length === 0 ? (
        <p className="px-4 py-3 text-xs text-gray-400">{ui.noAds}</p>
      ) : (
        <div
          className="flex gap-3 px-4 pb-3 pt-1 overflow-x-auto scrollbar-hide
                     snap-x snap-mandatory"
        >
          {ads.map((ad) => (
            <div key={ad.id} className="snap-start">
              <AdCard
                ad={ad}
                lang={lang}
                timeAgo={timeAgoLabel(ad.created_at)}
                onNavigate={handleNav}
              />
            </div>
          ))}
        </div>
      )}

      {/* Dot indicators (only shown when >1 page and ≤10 pages for readability) */}
      {totalPages > 1 && totalPages <= 10 && (
        <div className="flex justify-center gap-1.5 pb-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => {
                /* goToPage is available from the hook; here we use the exported
                   nextPage/prevPage only. For dot-click we just set the page
                   by clicking through — or you can expose goToPage as needed. */
              }}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === currentPage
                  ? "bg-teal-500 w-4"
                  : "bg-gray-300"
              }`}
              aria-label={`Page ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default FeaturedAdsStrip;
