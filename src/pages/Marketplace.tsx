/**
 * src/pages/Marketplace.tsx — Bambeh Marketplace
 *
 * FIXES APPLIED:
 *  ✅ Removed ALL hardcoded SAMPLE/DEMO items — real data only from Supabase
 *  ✅ When Supabase returns nothing, shows empty state (not fake items)
 *  ✅ Realtime channel subscription — new items appear instantly on all phones
 *  ✅ localStorage used ONLY for Favorites (heart button) — correct and intentional
 *  ✅ Reads from "listings" table with type="marketplace" — matches your DB
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, ShoppingBag, Heart, MapPin,
  Plus, Loader2, RefreshCw, PackageOpen,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

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
  sellerName?: string;
  sellerPhone?: string;
  negotiable?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  "All", "Electronics", "Fashion", "Appliances",
  "Books", "Furniture", "Vehicles", "Rentals", "Other",
];

const FAV_KEY = "bambeh_favorites";

// ─── Favorites helpers (localStorage — intentional, only for heart button) ────
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
    const saved: { id: string; title: string; price: string; image?: string; category: string; type: string; location: string; savedAt: string }[] =
      JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
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
  } catch {
    // non-critical
  }
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

  // ── Fetch real listings from Supabase ──────────────────────────────────────
  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from("listings")
        .select("id, title, price, category, location, description, extra, created_at, status")
        .eq("type", "marketplace")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(80);

      if (dbError) {
        setError("Could not load listings. Please check your connection.");
        setItems([]);
        return;
      }

      const mapped: Item[] = (data ?? []).map((d) => ({
        id:          d.id,
        title:       d.title,
        price:       d.price ?? 0,
        category:    d.category ?? "Other",
        location:    d.location ?? "",
        image:       (d.extra as { image_url?: string } | null)?.image_url,
        condition:   (d.extra as { condition?: string } | null)?.condition ?? "Used",
        description: d.description ?? "",
        postedAt:    d.created_at,
      }));

      setItems(mapped);
    } catch (err) {
      setError("Unexpected error. Please try again.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── On mount: fetch + subscribe to real-time inserts ──────────────────────
  useEffect(() => {
    void fetchItems();

    // Real-time: new item posted on ANY phone → appears here instantly
    const channel = supabase
      .channel("marketplace_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "listings" },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          // Only add marketplace items
          if (row.type !== "marketplace" || row.status !== "active") return;
          const newItem: Item = {
            id:          row.id as string,
            title:       row.title as string,
            price:       (row.price as number) ?? 0,
            category:    (row.category as string) ?? "Other",
            location:    (row.location as string) ?? "",
            image:       (row.extra as { image_url?: string } | null)?.image_url,
            condition:   (row.extra as { condition?: string } | null)?.condition ?? "Used",
            description: (row.description as string) ?? "",
            postedAt:    row.created_at as string,
          };
          setItems((prev) => [newItem, ...prev]);
        }
      )
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [fetchItems]);

  // ── Toggle favourite ───────────────────────────────────────────────────────
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

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = items.filter((i) => {
    const matchSearch =
      !search ||
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.location.toLowerCase().includes(search.toLowerCase());
    const matchCat = cat === "All" || i.category === cat;
    return matchSearch && matchCat;
  });

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-teal-600" />
            Marketplace
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
              <Plus className="w-4 h-4" />
              Sell
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-2">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items, location..."
            className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>

        {/* Category pills */}
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

      {/* ── Body ── */}
      <div className="p-4">

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            <p className="text-sm text-gray-500">Loading listings…</p>
          </div>
        )}

        {/* Error */}
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

        {/* Empty — no items at all */}
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

        {/* Empty — search/category returned nothing */}
        {!loading && !error && items.length > 0 && filtered.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No items match your search</p>
            <p className="text-sm mt-1">Try a different keyword or category</p>
            <button
              onClick={() => { setSearch(""); setCat("All"); }}
              className="mt-4 border border-teal-600 text-teal-600 px-5 py-2 rounded-xl text-sm font-semibold"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Grid of real listings */}
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

                    {/* Favourite button */}
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
                  </div>

                  {/* Info */}
                  <div className="p-2.5">
                    <p className="text-xs text-gray-400 mb-0.5">{item.category}</p>
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-tight mb-1">
                      {item.title}
                    </h3>
                    <p className="text-teal-600 font-bold text-sm">
                      {item.price.toLocaleString()} XAF
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                      <MapPin className="w-3 h-3" />
                      {item.location}
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
