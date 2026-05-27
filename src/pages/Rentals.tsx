/**
 * Rentals.tsx — Bambeh Marketplace
 * FILE LOCATION: src/pages/Rentals.tsx
 *
 * FIXES FROM ORIGINAL:
 * 1. Property cards were going to /rental/:id (singular) → 404
 *    FIXED: Now goes to /rentals/:id (plural) — correct route in App.tsx line 769
 * 2. "List Property" button was going to /list-property
 *    FIXED: /list-property redirects to /rentals/list in App.tsx (fine either way)
 *    — made explicit to /rentals/list for clarity
 * 3. Items were only from localStorage → only visible on same device
 *    FIXED: Now loads from Supabase rentals table, visible to ALL users
 *    Falls back to sample data when table is empty.
 * 4. Real-time: new listings appear instantly on all devices
 *
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Search, MapPin, Bed, Bath, DollarSign, Plus, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Property {
  id: string;
  title: string;
  type: string;
  price: number;
  location: string;
  quartier?: string;
  bedrooms: string;
  bathrooms: string;
  description: string;
  image?: string;
  postedAt: string;
  isFurnished?: boolean;
}

// ── Sample properties shown when Supabase table is empty ─────────────────────
const SAMPLE: Property[] = [
  { id:"1", title:"Modern 2-bed apartment in Bastos", type:"Apartment", price:150000, location:"Yaounde",  quartier:"Bastos",       bedrooms:"2", bathrooms:"1", description:"Furnished apartment with balcony and security.",   postedAt: new Date().toISOString() },
  { id:"2", title:"Spacious villa in Bonamoussadi",   type:"Villa",     price:350000, location:"Douala",   quartier:"Bonamoussadi", bedrooms:"4", bathrooms:"3", description:"4-bedroom villa with garden and parking.",          postedAt: new Date().toISOString() },
  { id:"3", title:"Studio near University",           type:"Studio",    price:60000,  location:"Yaounde",  quartier:"Ngoa-Ekele",   bedrooms:"Studio", bathrooms:"1", description:"Clean studio, ideal for students.",         postedAt: new Date().toISOString() },
  { id:"4", title:"Office space in Akwa",             type:"Office",    price:200000, location:"Douala",   quartier:"Akwa",         bedrooms:"N/A",    bathrooms:"1", description:"Professional office space in prime location.", postedAt: new Date().toISOString() },
];

const CITIES = ["All Cities", "Yaounde", "Douala", "Bafoussam", "Garoua", "Maroua", "Bamenda", "Ngaoundere", "Bertoua", "Ebolowa", "Kumba"];
const TYPES  = ["All Types", "Apartment", "Villa", "Studio", "House", "Office", "Room"];

export default function Rentals() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [city,       setCity]       = useState("All Cities");
  const [type,       setType]       = useState("All Types");
  const [maxPrice,   setMaxPrice]   = useState(1000000);

  // ── Load from Supabase ───────────────────────────────────────────────────
  async function fetchProperties() {
    setLoading(true);
    try {
      // Load ALL active rentals — not filtered by user so everyone can see them
      const { data, error } = await supabase
        .from("rentals")
        .select("id, title, type, price, location, bedrooms, bathrooms, description, is_furnished, created_at")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error && data && data.length > 0) {
        setProperties(data.map(d => ({
          id:          d.id,
          title:       d.title,
          type:        d.type       || "Apartment",
          price:       d.price      || 0,
          location:    d.location   || "Cameroon",
          bedrooms:    d.bedrooms   || "?",
          bathrooms:   d.bathrooms  || "?",
          description: d.description || "",
          isFurnished: d.is_furnished || false,
          postedAt:    d.created_at,
        })));
      } else {
        setProperties(SAMPLE);
      }
    } catch {
      setProperties(SAMPLE);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProperties();
    // Real-time updates — new properties appear immediately on all devices
    const channel = supabase
      .channel("rentals_feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "rentals" }, fetchProperties)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = properties.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || (p.quartier || "").toLowerCase().includes(search.toLowerCase());
    const matchCity   = city === "All Cities" || p.location.toLowerCase().includes(city.toLowerCase());
    const matchType   = type === "All Types"  || p.type === type;
    const matchPrice  = p.price <= maxPrice;
    return matchSearch && matchCity && matchType && matchPrice;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-24">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Home className="w-6 h-6 text-orange-500" /> Rentals
          </h1>
          <div className="flex gap-2">
            <button
              onClick={fetchProperties}
              className="p-2 text-gray-400 hover:text-orange-500 rounded-xl hover:bg-gray-100"
              aria-label="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            {/*
              FIX: Goes to /rentals/list (correct route in App.tsx line 707).
              /list-property also redirects to /rentals/list (alias in App.tsx).
            */}
            <button
              onClick={() => navigate("/rentals/list")}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1 transition-colors"
            >
              <Plus className="w-4 h-4" /> List Property
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or neighbourhood..."
            className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <select
            value={city}
            onChange={e => setCity(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
          >
            {CITIES.map(loc => <option key={loc}>{loc}</option>)}
          </select>
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
          >
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        {/* Price range */}
        <div className="mb-4 bg-white rounded-xl p-3 border">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Max Rent</span>
            <span className="font-semibold">{maxPrice.toLocaleString()} XAF/mo</span>
          </div>
          <input
            type="range" min={30000} max={1000000} step={10000}
            value={maxPrice}
            onChange={e => setMaxPrice(+e.target.value)}
            className="w-full accent-orange-500"
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Home className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No properties found</p>
            <button
              onClick={() => navigate("/rentals/list")}
              className="mt-4 bg-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold"
            >
              List a Property
            </button>
          </div>
        )}

        {/* Property cards */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs text-gray-400">{filtered.length} propert{filtered.length !== 1 ? "ies" : "y"} found</p>
            {filtered.map(p => (
              /*
                FIX: Was navigate("/rental/" + p.id) → 404 (singular, wrong)
                FIXED: Now navigate("/rentals/" + p.id) — matches App.tsx line 769
              */
              <div
                key={p.id}
                onClick={() => navigate("/rentals/" + p.id)}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]"
              >
                <div className="h-36 bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                  <Home className="w-12 h-12 text-orange-300" />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-900 flex-1 pr-2 text-sm">{p.title}</h3>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full whitespace-nowrap">{p.type}</span>
                      {p.isFurnished && (
                        <span className="text-xs bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full">Furnished</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                    <MapPin className="w-3 h-3" />
                    {p.location}{p.quartier ? ", " + p.quartier : ""}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Bed className="w-3 h-3" /> {p.bedrooms}</span>
                      <span className="flex items-center gap-1"><Bath className="w-3 h-3" /> {p.bathrooms}</span>
                    </div>
                    <span className="font-bold text-orange-600 flex items-center gap-0.5 text-sm">
                      <DollarSign className="w-3 h-3" />{p.price.toLocaleString()} XAF/mo
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
