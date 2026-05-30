/**
 * src/pages/Marketplace.tsx — Bambeh Marketplace
 *
 * CHANGES IN THIS VERSION:
 * ✅ LocationFilter integrated — filters by region, city, quarter, landmark
 * ✅ locationFilters state added and wired into filtered array
 * ✅ All existing logic (Supabase, favourites, real-time, samples) untouched
 * ✅ DEMO BADGE: isDemo added to Item interface and all SAMPLES entries
 * ✅ SORTING: real user listings always appear above demo listings
 */

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, ShoppingBag, Heart, MapPin, Plus, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { LocationFilter, LocationFilters, EMPTY_LOCATION } from "@/components/filters/LocationFilter";
import { DemoBadge } from "@/components/listings/DemoBadge";

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
  isDemo?: boolean; // ← NEW: marks sample/demo items
}

const SAMPLES: Item[] = [
  { id:"1", title:"iPhone 13 Pro Max 256GB",    price:450000, category:"Electronics", location:"Yaounde",    condition:"Good",     description:"Excellent condition, with charger and box.",        postedAt: new Date().toISOString(), isDemo: true },
  { id:"2", title:'Samsung 55" Smart TV',       price:280000, category:"Electronics", location:"Douala",     condition:"Like New", description:"Used only 3 months, perfect working order.",        postedAt: new Date().toISOString(), isDemo: true },
  { id:"3", title:"Traditional African Fabric", price:25000,  category:"Fashion",     location:"Yaounde",    condition:"New",      description:"Authentic Cameroonian fabric, various patterns.",   postedAt: new Date().toISOString(), isDemo: true },
  { id:"4", title:"Honda Generator 2.5KVA",     price:180000, category:"Electronics", location:"Bafoussam",  condition:"Good",     description:"Reliable generator, serviced regularly.",           postedAt: new Date().toISOString(), isDemo: true },
  { id:"5", title:"Fridge Samsung 300L",        price:220000, category:"Appliances",  location:"Douala",     condition:"Good",     description:"3-door fridge in excellent condition.",             postedAt: new Date().toISOString(), isDemo: true },
  { id:"6", title:"School Textbooks Set",       price:15000,  category:"Books",       location:"Yaounde",    condition:"Fair",     description:"Complete set for Form 5 sciences.",                 postedAt: new Date().toISOString(), isDemo: true },
];

const CATEGORIES = ["All", "Electronics", "Fashion", "Appliances", "Books", "Furniture", "Vehicles", "Other"];

export default function Marketplace() {
  const navigate = useNavigate();
  const [items,   setItems]   = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [cat,     setCat]     = useState("All");
  const [favs,    setFavs]    = useState<Set<string>>(new Set());
  const [userId,  setUserId]  = useState<string | null>(null);

  // ── Location filter state ──────────────────────────────────────────
  const [locationFilters, setLocationFilters] = useState<LocationFilters>(EMPTY_LOCATION);

  async function fetchItems() {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id ?? null;
      setUserId(uid);

      const { data, error } = await supabase
        .from("listings")
        .select("id, title, price, category, location, description, extra, created_at, status")
        .eq("type", "marketplace")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(60);

      if (!error && data && data.length > 0) {
        // Real data from Supabase — isDemo is false
        setItems(data.map(d => ({
          id:          d.id,
          title:       d.title,
          price:       d.price       || 0,
          category:    d.category    || "Other",
          location:    d.location    || "",
          image:       d.extra?.image_url,
          condition:   d.extra?.condition || "Used",
          description: d.description || "",
          postedAt:    d.created_at,
          isDemo:      false, // ← real listings are NOT demo
        })));
      } else {
        setItems(SAMPLES); // fallback to demo samples
      }

      if (uid) {
        const { data: favData } = await supabase
          .from("favorites").select("listing_id").eq("user_id", uid);
        if (favData) setFavs(new Set(favData.map(f => f.listing_id)));
      }
    } catch {
      setItems(SAMPLES);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchItems();
    const channel = supabase
      .channel("marketplace_feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "listings" }, fetchItems)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function toggleFav(e: React.MouseEvent, itemId: string) {
    e.stopPropagation();
    if (!userId) { navigate("/login"); return; }
    const isFaved = favs.has(itemId);
    setFavs(prev => {
      const next = new Set(prev);
      if (isFaved) next.delete(itemId); else next.add(itemId);
      return next;
    });
    if (isFaved) {
      await supabase.from("favorites").delete().eq("user_id", userId).eq("listing_id", itemId);
    } else {
      await supabase.from("favorites").upsert({ user_id: userId, listing_id: itemId, saved_at: new Date().toISOString() });
    }
  }

  // ── Filter — includes location filter ────────────────────────────────────
  const baseFiltered = items.filter(i => {
    const matchSearch = !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.location.toLowerCase().includes(search.toLowerCase());
    const matchCat    = cat === "All" || i.category === cat;

    const loc = i.location.toLowerCase();
    if (locationFilters.region   && !loc.includes(locationFilters.region.toLowerCase()))   return false;
    if (locationFilters.city     && !loc.includes(locationFilters.city.toLowerCase()))     return false;
    if (locationFilters.quarter  && !loc.includes(locationFilters.quarter.toLowerCase()))  return false;
    if (locationFilters.landmark && !loc.includes(locationFilters.landmark.toLowerCase())) return false;

    return matchSearch && matchCat;
  });

  // ── SORTING: real listings first, demo listings last ─────────────────────
  const filtered = [...baseFiltered].sort((a, b) => {
    if (a.isDemo !== b.isDemo) return a.isDemo ? 1 : -1;
    return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-teal-600" /> Marketplace
          </h1>
          <div className="flex gap-2">
            <button onClick={fetchItems}
              className="p-2 text-gray-400 hover:text-teal-600 rounded-xl hover:bg-gray-100"
              aria-label="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={() => navigate("/marketplace/sell")}
              className="bg-teal-600 text-white px-3 py-1.5 rounded-xl text-sm font-semibold
                         flex items-center gap-1 hover:bg-teal-700 transition-colors">
              <Plus className="w-4 h-4" /> Sell
            </button>
          </div>
        </div>

        <div className="relative mb-2">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search items, location..."
            className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors
                ${cat === c ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">

        {/* ── LOCATION FILTER ───────────────────────────────────────────── */}
        <LocationFilter onFilterChange={setLocationFilters} />

        {loading ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            <p className="text-sm text-gray-500">Loading items...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No items found</p>
            <p className="text-sm mt-1">Try a different search or location</p>
            <button onClick={() => navigate("/marketplace/sell")}
              className="mt-4 bg-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
              Be the first to sell!
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-3">{filtered.length} item{filtered.length !== 1 ? "s" : ""}</p>
            <div className="grid grid-cols-2 gap-3">
              {filtered.map(item => (
                <div key={item.id}
                  onClick={() => navigate("/marketplace/" + item.id)}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border cursor-pointer
                             hover:shadow-md transition-shadow active:scale-[0.99]">
                  {/* Image container — `relative` so DemoBadge positions correctly */}
                  <div className="h-32 bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center relative">
                    {item.image
                      ? <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      : <ShoppingBag className="w-10 h-10 text-teal-200" />
                    }
                    {/* ── DEMO BADGE ── */}
                    {item.isDemo && <DemoBadge />}
                    <button onClick={e => toggleFav(e, item.id)}
                      className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm hover:scale-110 transition-transform"
                      aria-label={favs.has(item.id) ? "Remove from favourites" : "Add to favourites"}>
                      <Heart className={`w-3.5 h-3.5 ${favs.has(item.id) ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
                    </button>
                    <span className="absolute bottom-2 left-2 text-xs bg-white/90 text-gray-700 px-1.5 py-0.5 rounded-full">
                      {item.condition}
                    </span>
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs text-gray-400 mb-0.5">{item.category}</p>
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-tight mb-1">{item.title}</h3>
                    <p className="text-teal-600 font-bold text-sm">{item.price.toLocaleString()} XAF</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                      <MapPin className="w-3 h-3" />{item.location}
                    </div>
                    {item.isDemo && (
                      <p className="text-xs text-yellow-600 mt-1 italic">Sample — not for sale</p>
                    )}
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
