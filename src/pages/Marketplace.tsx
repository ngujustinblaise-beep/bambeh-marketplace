/**
 * src/pages/Marketplace.tsx — Bambeh Marketplace
 *
 * FIXES (June 2026):
 *  ✅ Queries `listings` table using `seller_id` (not user_id)
 *  ✅ No demo / mock data — all listings come from Supabase
 *  ✅ Real-time INSERT subscription keeps list fresh
 *  ✅ view_count displayed on each card
 *  ✅ Images read from `images` JSONB array OR `extra.image_url` fallback
 *  ✅ Favourites persisted to localStorage
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, ShoppingBag, Heart, MapPin,
  Plus, Loader2, RefreshCw, PackageOpen, Eye,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { FeaturedAdsStrip } from "@/components/ads/FeaturedAdsStrip"; // ✅ FEATURED ADS

// ─── Types ────────────────────────────────────────────────────────────────────
interface Item {
  id: string;
  title: string;
  price: number;
  category: string;
  location: string;
  image?: string;
  condition: string;
  description: string;
  postedAt: string;
  view_count: number;
  negotiable: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  "All", "Electronics", "Fashion", "Appliances",
  "Books", "Furniture", "Vehicles", "Rentals", "Other",
];

const FAV_KEY = "bambeh_favorites";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function readFavIds(): Set<string> {
  try {
    return new Set(
      (JSON.parse(localStorage.getItem(FAV_KEY) || "[]") as { id: string }[])
        .map((f) => f.id)
    );
  } catch {
    return new Set();
  }
}

function saveFav(item: Item, add: boolean) {
  try {
    const saved: any[] = JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
    const idx = saved.findIndex((f) => f.id === item.id);
    if (add && idx < 0) {
      saved.unshift({
        id: item.id,
        title: item.title,
        price: `${item.price.toLocaleString("fr-CM")} XAF`,
        image: item.image,
        category: item.category,
        type: "marketplace",
        location: item.location,
        savedAt: new Date().toISOString(),
      });
    } else if (!add && idx >= 0) {
      saved.splice(idx, 1);
    }
    localStorage.setItem(FAV_KEY, JSON.stringify(saved));
  } catch { /* non-critical */ }
}

/** Pull the first image URL out of the images JSONB array or extra.image_url */
function extractImage(row: any): string | undefined {
  // images is a JSONB array of { url, ... } objects
  if (Array.isArray(row.images) && row.images.length > 0) {
    const first = row.images[0];
    return typeof first === "string" ? first : first?.url ?? first?.thumbnail_url;
  }
  // fallback: legacy extra.image_url
  return row.extra?.image_url ?? undefined;
}

function mapRow(row: any): Item {
  return {
    id:          row.id,
    title:       row.title ?? "",
    price:       row.price ?? 0,
    category:    row.category ?? "Other",
    location:    row.location ?? "",
    image:       extractImage(row),
    condition:   row.condition ?? row.extra?.condition ?? "Used",
    description: row.description ?? "",
    postedAt:    row.created_at,
    view_count:  row.view_count ?? 0,
    negotiable:  row.negotiable ?? false,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Marketplace() {
  const navigate = useNavigate();
  const [items,   setItems]   = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [search,  setSearch]  = useState("");
  const [cat,     setCat]     = useState("All");
  const [favs,    setFavs]    = useState<Set<string>>(readFavIds);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from("listings")
        .select(`
          id, title, price, category, location,
          description, images, extra, condition,
          created_at, status, view_count, negotiable
        `)
        .eq("type", "marketplace")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(100);

      if (dbError) {
        setError("Could not load listings. Please check your connection.");
        setItems([]);
        return;
      }

      setItems((data ?? []).map(mapRow));
    } catch {
      setError("Unexpected error. Please try again.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + realtime subscription
  useEffect(() => {
    void fetchItems();

    const channel = supabase
      .channel("marketplace_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "listings" },
        (payload) => {
          const row = payload.new as any;
          if (row.type !== "marketplace" || row.status !== "active") return;
          setItems((prev) => [mapRow(row), ...prev]);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "listings" },
        (payload) => {
          const row = payload.new as any;
          if (row.type !== "marketplace") return;
          if (row.status !== "active") {
            // remove from list if deactivated/sold
            setItems((prev) => prev.filter((i) => i.id !== row.id));
          } else {
            setItems((prev) =>
              prev.map((i) => (i.id === row.id ? mapRow(row) : i))
            );
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "listings" },
        (payload) => {
          setItems((prev) => prev.filter((i) => i.id !== (payload.old as any).id));
        }
      )
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [fetchItems]);

  function toggleFav(e: React.MouseEvent, item: Item) {
    e.stopPropagation();
    const adding = !favs.has(item.id);
    setFavs((prev) => {
      const next = new Set(prev);
      adding ? next.add(item.id) : next.delete(item.id);
      return next;
    });
    saveFav(item, adding);
  }

  const filtered = items.filter((i) => {
    const matchSearch =
      !search ||
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.location.toLowerCase().includes(search.toLowerCase());
    const matchCat = cat === "All" || i.category === cat;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-teal-600" /> Marketplace
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => void fetchItems()}
              className="p-2 text-gray-400 hover:text-teal-600 rounded-xl hover:bg-gray-100"
              aria-label="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate("/marketplace/sell")}
              className="bg-teal-600 text-white px-3 py-1.5 rounded-xl text-sm font-semibold flex items-center gap-1 hover:bg-teal-700 transition"
            >
              <Plus className="w-4 h-4" /> Sell
            </button>
          </div>
        </div>

        <div className="relative mb-2">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items, location..."
            className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                cat === c
                  ? "bg-teal-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* ✅ FEATURED ADS STRIP — marketplace category only */}
      <FeaturedAdsStrip category="marketplace" showHeader={false} maxVisible={20} />

      {/* ── Content ── */}
      <div className="p-4">
        {loading && (
          <div className="flex flex-col items-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            <p className="text-sm text-gray-500">Loading listings…</p>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-16 text-red-500">
            <p className="font-medium">{error}</p>
            <button
              onClick={() => void fetchItems()}
              className="mt-4 bg-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <PackageOpen className="w-14 h-14 mx-auto mb-3 text-gray-300" />
            <p className="font-semibold text-gray-700">No listings yet</p>
            <p className="text-sm mt-1">Be the first to post something for sale!</p>
            <button
              onClick={() => navigate("/marketplace/sell")}
              className="mt-5 bg-teal-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold"
            >
              Post your first item
            </button>
          </div>
        )}

        {!loading && !error && items.length > 0 && filtered.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No items match your search</p>
            <button
              onClick={() => { setSearch(""); setCat("All"); }}
              className="mt-4 border border-teal-600 text-teal-600 px-5 py-2 rounded-xl text-sm font-semibold"
            >
              Clear filters
            </button>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <>
            <p className="text-xs text-gray-400 mb-3">
              {filtered.length} listing{filtered.length !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate("/marketplace/" + item.id)}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]"
                >
                  {/* Image */}
                  <div className="h-36 bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center relative overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <ShoppingBag className="w-10 h-10 text-teal-200" />
                    )}
                    <button
                      onClick={(e) => toggleFav(e, item)}
                      className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm hover:scale-110 transition-transform"
                      aria-label="Save to favourites"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          favs.has(item.id)
                            ? "fill-red-500 text-red-500"
                            : "text-gray-400"
                        }`}
                      />
                    </button>
                    <span className="absolute bottom-2 left-2 text-xs bg-white/90 text-gray-700 px-1.5 py-0.5 rounded-full">
                      {item.condition}
                    </span>
                    {item.negotiable && (
                      <span className="absolute bottom-2 right-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                        Négoc.
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-2.5">
                    <p className="text-xs text-gray-400 mb-0.5">{item.category}</p>
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-tight mb-1">
                      {item.title}
                    </h3>
                    <p className="text-teal-600 font-bold text-sm">
                      {item.price.toLocaleString("fr-CM")} XAF
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                      <MapPin className="w-3 h-3" />
                      {item.location}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                      <Eye className="w-3 h-3" />
                      {item.view_count} views
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
