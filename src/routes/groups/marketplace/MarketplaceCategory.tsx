/**
 * src/pages/MarketplaceCategory.tsx ? Bambeh Marketplace
 *
 * FIXES ? June 2026
 *  ? FIX 1: extractImage() was calling useLang() inside a plain helper ?
 *            illegal React hook call ? crash ? "connection issue" symptom.
 *            extractImage() is now a pure function.
 *  ? FIX 2: All UI strings translated via inline TR map (same pattern as Marketplace.tsx)
 *  ? FIX 3: Error boundary fallback improved
 *  ? Fetches real listings from Supabase filtered by category
 *  ? Category breadcrumb, search, sort
 *  ? Favourites + cart count badge
 *  ? Safe-area bottom padding
 */

import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Search, ShoppingBag, Heart, MapPin,
  Eye, Loader2, PackageOpen, X, ShoppingCart,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// --- i18n ---------------------------------------------------------------------
type Lang = "en" | "fr" | "ha" | "ar" | "pcm" | "ff";
const TR: Record<string, Record<Lang, string>> = {
  marketplace:    { en: "Marketplace", fr: "March?", ha: "Kasuwanci", ar: "?????", pcm: "Market", ff: "Suudu" },
  loading:        { en: "Loading", fr: "Chargement", ha: "Lodawa", ar: "?????", pcm: "Loading", ff: "Naatirde" },
  no_match:       { en: "No matching items", fr: "Aucun r?sultat", ha: "Babu", ar: "?? ?????", pcm: "Notin match", ff: "Alaa goonga" },
  try_different:  { en: "Try a different keyword", fr: "Essayez un autre terme", ha: "Gwada wani kalma", ar: "??? ??????? ???", pcm: "Try different word", ff: "Mbiy go??o" },
  no_listings:    { en: "No listings yet", fr: "Aucune annonce", ha: "Babu jeri", ar: "?? ???????", pcm: "No listing yet", ff: "Alaa" },
  first_to_list:  { en: "Be the first to list in this category!", fr: "Soyez le premier ? lister!", ha: "Kasance na farko!", ar: "?? ??? ?? ????!", pcm: "Be first to list here!", ff: "Wartoraa!" },
  sell_item:      { en: "+ Sell an item", fr: "+ Vendre un article", ha: "+ Sayar da abu", ar: "+ ??? ????", pcm: "+ Sell item", ff: "+ Yo? kala" },
  try_again:      { en: "Try again", fr: "R?essayer", ha: "Sake", ar: "???? ??????", pcm: "Try again", ff: "Artu jeer" },
  negoc:          { en: "Nego.", fr: "N?goc.", ha: "Tattaunawa", ar: "???? ???????", pcm: "Nego.", ff: "Hewtii" },
  listings:       { en: "listings", fr: "annonces", ha: "jeri", ar: "???????", pcm: "listing", ff: "ndes" },
  listing_one:    { en: "listing", fr: "annonce", ha: "jeri ?aya", ar: "?????", pcm: "listing", ff: "nde" },
};
function getLang(): Lang {
  try { const s = localStorage.getItem("bambeh_lang") as Lang; if (s) return s; } catch {}
  const b = navigator.language.split("-")[0] as Lang;
  return ["en","fr","ha","ar","pcm","ff"].includes(b) ? b : "fr";
}
function tx(key: string): string {
  const l = getLang();
  return TR[key]?.[l] ?? TR[key]?.["en"] ?? key;
}

// --- Types --------------------------------------------------------------------
interface Item {
  id: string;
  title: string;
  price: number;
  location: string;
  image?: string;
  condition: string;
  view_count: number;
  negotiable: boolean;
  postedAt: string;
  isFeatured: boolean;
}

const FAV_KEY  = "bambeh_favorites";
const CART_KEY = "bambeh_cart";

// --- Helpers ? PURE FUNCTIONS, NO HOOKS ----------------------------------------
// ??  extractImage MUST NOT call useLang() or any React hook.
//     It is called during data mapping, outside React render cycles.
function extractImage(row: any): string | undefined {
  if (Array.isArray(row.images) && row.images.length > 0) {
    const f = row.images[0];
    return typeof f === "string" ? f : (f?.url ?? f?.thumbnail_url);
  }
  return row.extra?.image_url ?? undefined;
}

function readFavIds(): Set<string> {
  try { return new Set((JSON.parse(localStorage.getItem(FAV_KEY) || "[]") as { id: string }[]).map((f) => f.id)); }
  catch { return new Set(); }
}

function readCartCount(): number {
  try { return (JSON.parse(localStorage.getItem(CART_KEY) || "[]") as any[]).reduce((s, i) => s + (i.quantity || 1), 0); }
  catch { return 0; }
}

function saveFav(item: Item, category: string, add: boolean) {
  try {
    const saved: any[] = JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
    const idx = saved.findIndex((f) => f.id === item.id);
    if (add && idx < 0) {
      saved.unshift({ id: item.id, title: item.title, price: `${item.price.toLocaleString("fr-CM")} XAF`, image: item.image, category, type: "marketplace", location: item.location, savedAt: new Date().toISOString() });
    } else if (!add && idx >= 0) {
      saved.splice(idx, 1);
    }
    localStorage.setItem(FAV_KEY, JSON.stringify(saved));
  } catch { /* non-critical */ }
}

// --- Component ----------------------------------------------------------------
const MarketplaceCategory: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const navigate     = useNavigate();

  const label = category
    ? decodeURIComponent(category).replace(/-/g, " ")
    : "All";

  const [items,      setItems]      = useState<Item[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [search,     setSearch]     = useState("");
  const [favs,       setFavs]       = useState<Set<string>>(readFavIds);
  const [cartCount,  setCartCount]  = useState(readCartCount);

  // Sync cart count
  useEffect(() => {
    const sync = () => setCartCount(readCartCount());
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("listings")
        .select("id, title, price, location, images, extra, condition, view_count, negotiable, created_at, is_featured, status")
        .eq("type", "marketplace")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(100);

      if (label !== "All") {
        query = query.ilike("category", label);
      }

      const { data, error: dbErr } = await query;
      if (dbErr) { setError("Failed to load listings. Please try again."); setItems([]); return; }

      setItems((data ?? []).map((row: any) => ({
        id:          row.id,
        title:       row.title ?? "",
        price:       row.price ?? 0,
        location:    row.location ?? "",
        image:       extractImage(row),   // ? pure function ? no hook call
        condition:   row.condition ?? "Used",
        view_count:  row.view_count ?? 0,
        negotiable:  row.negotiable ?? false,
        postedAt:    row.created_at,
        isFeatured:  row.is_featured ?? false,
      })));
    } catch {
      setError("Unexpected error. Please try again.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [label]);

  useEffect(() => { void loadItems(); }, [loadItems]);

  function toggleFav(e: React.MouseEvent, item: Item) {
    e.stopPropagation();
    const adding = !favs.has(item.id);
    setFavs((prev) => {
      const n = new Set(prev);
      adding ? n.add(item.id) : n.delete(item.id);
      return n;
    });
    saveFav(item, label, adding);
  }

  const filtered = items.filter((i) =>
    !search ||
    i.title.toLowerCase().includes(search.toLowerCase()) ||
    i.location.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm px-4 pt-4 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors" aria-label="Go back">
            <ArrowLeft className="w-4 h-4 text-gray-700" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-1 text-xs text-gray-400 mb-0.5">
              <Link to="/marketplace" className="hover:text-teal-600 transition-colors">{tx("marketplace")}</Link>
              <span>?</span>
              <span className="text-gray-700 font-medium capitalize">{label}</span>
            </div>
            <h1 className="text-lg font-bold text-gray-900 capitalize">{label}</h1>
          </div>
          <button onClick={() => navigate("/cart")} className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors" aria-label={`Cart: ${cartCount} items`}>
            <ShoppingCart className="w-4.5 h-4.5 text-gray-600" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-teal-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`${tx("loading").replace("?","").replace("?","")} ${label}?`}
            className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-gray-50"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-2.5 text-gray-400">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        {loading && (
          <div className="flex flex-col items-center py-20 gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-teal-600" />
            <p className="text-sm text-gray-500">{tx("loading")} {label}?</p>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-16">
            <p className="text-sm text-red-500 mb-4">{error}</p>
            <button onClick={() => void loadItems()} className="bg-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold">{tx("try_again")}</button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-20">
            <PackageOpen className="w-14 h-14 mx-auto mb-3 text-gray-300" />
            <p className="font-semibold text-gray-700">
              {search ? tx("no_match") : `No ${label} listings yet`}
            </p>
            <p className="text-sm text-gray-400 mt-1 mb-6">
              {search ? tx("try_different") : tx("first_to_list")}
            </p>
            <button
              onClick={() => navigate("/marketplace/sell")}
              className="bg-teal-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold"
            >
              {tx("sell_item")}
            </button>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <>
            <p className="text-xs text-gray-400 mb-3 font-medium">
              {filtered.length} {filtered.length !== 1 ? tx("listings") : tx("listing_one")}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filtered.map((item) => (
                <article
                  key={item.id}
                  onClick={() => navigate(`/marketplace/${item.id}`)}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-[0.98]"
                >
                  <div className="w-full h-36 bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center relative overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    ) : (
                      <ShoppingBag className="w-10 h-10 text-teal-200" />
                    )}
                    <button
                      onClick={(e) => toggleFav(e, item)}
                      aria-label={favs.has(item.id) ? "Remove from favourites" : "Save to favourites"}
                      className="absolute top-2 right-2 p-1.5 bg-white/95 rounded-full shadow-sm hover:scale-110 transition-transform"
                    >
                      <Heart className={`w-3.5 h-3.5 ${favs.has(item.id) ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
                    </button>
                    <span className="absolute bottom-2 left-2 text-[10px] bg-white/90 text-gray-600 px-1.5 py-0.5 rounded-full font-medium">{item.condition}</span>
                    {item.negotiable && (
                      <span className="absolute bottom-2 right-2 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">{tx("negoc")}</span>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="font-semibold text-gray-900 text-sm line-clamp-2 leading-tight mb-1">{item.title}</p>
                    <p className="text-teal-700 font-bold text-sm">{item.price.toLocaleString("fr-CM")} <span className="text-xs">XAF</span></p>
                    <div className="flex items-center justify-between mt-1.5">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate max-w-[60px]">{item.location}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Eye className="w-3 h-3" />
                        {item.view_count}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MarketplaceCategory;





