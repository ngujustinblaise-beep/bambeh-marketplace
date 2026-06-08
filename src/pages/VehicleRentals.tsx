/**
 * src/pages/VehicleRentals.tsx — Bambeh Marketplace
 *
 * FIXES IN THIS VERSION:
 *  ✅ FIX 1 — useCallback on fetchVehicles (stable ref, no stale closure)
 *  ✅ FIX 2 — Location filter checks v.location AND v.extra.* fields
 *  ✅ FIX 3 — SAMPLE ids start with 'demo-v' — consistent with VehicleDetails routing
 *  ✅ FIX 4 — Real-time channel uses stable fetchVehicles ref
 *  ✅ FIX 5 — Title "Cars & Vehicles" (not "Vehicle Rentals")
 *  ✅ FIX 6 — Sell button correctly routes to /vehicles/sell
 *  ✅ FIX 7 — pb-28 so bottom nav never covers cards or buttons
 *  ✅ FIX 8 — Error state with user-friendly banner (no crash)
 *  ✅ FIX 9 — Demo listings not navigable (no broken detail page)
 *  ✅ FIX 10 — Expiry badge shown on listings expiring within 3 days
 *
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, MapPin, Gauge, Fuel, Plus, Car,
  Loader2, RefreshCw, Eye, AlertCircle, Clock,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { LocationFilter, LocationFilters, EMPTY_LOCATION } from "@/components/filters/LocationFilter";
import { DemoBadge } from "@/components/listings/DemoBadge";
import { FeaturedAdsStrip } from "@/components/ads/FeaturedAdsStrip";
import { useLang, t } from "@/hooks/useAppLang";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Vehicle {
  id:         string;
  title:      string;
  price:      number;
  location:   string;
  category:   string;
  images:     string[];
  created_at: string;
  expires_at?: string;
  extra:      Record<string, any>;
  isDemo?:    boolean;
  view_count?: number;
}

// ─── Demo data ────────────────────────────────────────────────────────────────
// ✅ FIX 3: ids start with 'demo-v' so VehicleDetails can detect them
const SAMPLE_VEHICLES: Vehicle[] = [
  {
    id: "demo-v1",
    title: "Toyota Camry 2020",
    price: 8_500_000,
    location: "Yaoundé",
    category: "Sedan",
    images: [],
    created_at: new Date().toISOString(),
    extra: { fuel: "Petrol", transmission: "Automatic", mileage: "45,000 km", year: 2020 },
    isDemo: true,
  },
  {
    id: "demo-v2",
    title: "Honda Activa Motorcycle",
    price: 850_000,
    location: "Douala",
    category: "Motorcycle",
    images: [],
    created_at: new Date().toISOString(),
    extra: { fuel: "Petrol", transmission: "Manual", mileage: "12,000 km", year: 2021 },
    isDemo: true,
  },
  {
    id: "demo-v3",
    title: "Toyota Land Cruiser V8 2019",
    price: 35_000_000,
    location: "Yaoundé",
    category: "SUV",
    images: [],
    created_at: new Date().toISOString(),
    extra: { fuel: "Diesel", transmission: "Automatic", mileage: "78,000 km", year: 2019 },
    isDemo: true,
  },
  {
    id: "demo-v4",
    title: "Nissan Pickup 4x4",
    price: 12_000_000,
    location: "Bamenda",
    category: "Pickup",
    images: [],
    created_at: new Date().toISOString(),
    extra: { fuel: "Diesel", transmission: "Manual", mileage: "95,000 km", year: 2018 },
    isDemo: true,
  },
];

const VEHICLE_TYPES = ["All", "Sedan", "SUV", "Pickup", "Motorcycle", "Van", "Minibus", "Truck"];
const CITIES        = ["All", "Yaoundé", "Douala", "Bamenda", "Bafoussam", "Garoua", "Maroua"];

function expiringWithin(expiresAt: string | undefined, days: number): boolean {
  const lang = useLang();
  const isRtl = lang === "ar";
  if (!expiresAt) return false;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return diff > 0 && diff <= days * 86_400_000;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function VehicleRentals() {
  const navigate = useNavigate();

  const [vehicles,        setVehicles]        = useState<Vehicle[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState<string | null>(null);
  const [search,          setSearch]          = useState("");
  const [typeFilter,      setTypeFilter]      = useState("All");
  const [cityFilter,      setCityFilter]      = useState("All");
  const [locationFilters, setLocationFilters] = useState<LocationFilters>(EMPTY_LOCATION);

  // ✅ FIX 1: stable ref — avoids stale closure in realtime handler
  const fetchVehicles = useCallback(async () => {
    setError(null);
    try {
      const { data, error: sbError } = await supabase
        .from("listings")
        .select("id, title, price, location, category, images, created_at, expires_at, extra, view_count")
        .eq("type", "vehicle")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(40);

      if (sbError) throw sbError;

      setVehicles(
        data && data.length > 0
          ? data.map((d: any) => ({ ...d, isDemo: false }))
          : SAMPLE_VEHICLES
      );
    } catch (err: any) {
      console.error("[VehicleRentals] fetch error:", err);
      setError("Could not load listings. Showing demo data.");
      setVehicles(SAMPLE_VEHICLES);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ FIX 4: fetchVehicles in dep array
  useEffect(() => {
    fetchVehicles();

    const channel = supabase
      .channel("vehicles_realtime_feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "listings" },
        fetchVehicles
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchVehicles]);

  // ─── Filtering ─────────────────────────────────────────────────────────────
  const baseFiltered = vehicles.filter((v) => {
    if (search) {
      const q = search.toLowerCase();
      const hit =
        v.title.toLowerCase().includes(q) ||
        (v.extra?.make  || "").toLowerCase().includes(q) ||
        (v.extra?.model || "").toLowerCase().includes(q) ||
        v.location.toLowerCase().includes(q);
      if (!hit) return false;
    }

    if (typeFilter !== "All") {
      const matchCat  = v.category === typeFilter;
      const matchType = (v.extra?.vehicle_type || "") === typeFilter;
      if (!matchCat && !matchType) return false;
    }

    if (cityFilter !== "All") {
      if (!v.location.toLowerCase().includes(cityFilter.toLowerCase())) return false;
    }

    // ✅ FIX 2: check location AND all extra.* location fields
    const locationStr = [
      v.location,
      v.extra?.region   || "",
      v.extra?.city     || "",
      v.extra?.quarter  || "",
      v.extra?.landmark || "",
    ].join(" ").toLowerCase();

    if (locationFilters.region   && !locationStr.includes(locationFilters.region.toLowerCase()))   return false;
    if (locationFilters.city     && !locationStr.includes(locationFilters.city.toLowerCase()))     return false;
    if (locationFilters.quarter  && !locationStr.includes(locationFilters.quarter.toLowerCase()))  return false;
    if (locationFilters.landmark && !locationStr.includes(locationFilters.landmark.toLowerCase())) return false;

    return true;
  });

  // Real listings first, then demo; newest first within each group
  const filtered = [...baseFiltered].sort((a, b) => {
    if (a.isDemo !== b.isDemo) return a.isDemo ? 1 : -1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pb-28">

      {/* Hero banner */}
      <div className="bg-gradient-to-r from-green-700 to-green-800 text-white pt-10 pb-14 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-1 flex items-center gap-2">
            <Car className="w-8 h-8" /> Cars &amp; Vehicles
          </h1>
          <p className="text-green-100 mb-5 text-sm">
            Buy and sell vehicles across Cameroon
          </p>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by make, model, or title…"
              className="w-full pl-12 pr-4 py-3 rounded-xl text-gray-900 outline-none
                         focus:ring-2 focus:ring-white/40 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-4">

        {/* Filters card */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 space-y-3">
          {/* Type chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {VEHICLE_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition
                  ${typeFilter === t
                    ? "bg-green-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* City + actions */}
          <div className="flex items-center gap-2">
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="flex-1 border rounded-xl px-3 py-2 text-sm outline-none
                         focus:ring-2 focus:ring-green-500 bg-white"
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>{c === "All" ? "All Cities" : c}</option>
              ))}
            </select>

            <button
              onClick={fetchVehicles}
              disabled={loading}
              className="p-2 text-gray-500 hover:text-green-600 rounded-xl hover:bg-gray-100
                         disabled:opacity-40"
              aria-label="Refresh listings"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>

            {/* ✅ FIX 6: confirmed correct route — SellVehicle.tsx saves to Supabase */}
            <button
              onClick={() => navigate("/vehicles/sell")}
              className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold
                         flex items-center gap-1 hover:bg-green-700 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" /> Sell
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200
                          text-amber-700 rounded-xl px-4 py-3 mb-4 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Location filter */}
        <LocationFilter onFilterChange={setLocationFilters} />

        {/* Featured ads */}
        <FeaturedAdsStrip category="vehicles" showHeader={false} maxVisible={20} />

        <div className="mb-3 text-sm text-gray-400">
          {filtered.length} vehicle{filtered.length !== 1 ? "s" : ""} found
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center py-16 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            <p className="text-sm text-gray-400">Loading vehicles…</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16">
            <Car className="w-14 h-14 text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-700 mb-1">No vehicles found</p>
            <p className="text-sm text-gray-400 mb-4">Try clearing your filters or be the first to list!</p>
            <button
              onClick={() => navigate("/vehicles/sell")}
              className="bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold
                         hover:bg-green-700 active:scale-95 transition-all"
            >
              List Your Vehicle
            </button>
          </div>
        )}

        {/* Vehicle cards */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-4">
            {filtered.map((v) => (
              <div
                key={v.id}
                onClick={() => !v.isDemo && navigate(`/vehicles/${v.id}`)}
                className={`bg-white rounded-2xl shadow-sm border overflow-hidden
                  ${!v.isDemo ? "cursor-pointer hover:shadow-md active:scale-[0.99]" : "opacity-90"}
                  transition-all`}
              >
                {/* Image */}
                <div className="h-44 bg-gradient-to-br from-green-50 to-emerald-50
                                flex items-center justify-center overflow-hidden relative">
                  {v.images?.[0] ? (
                    <img
                      src={v.images[0]}
                      alt={v.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : (
                    <span className="text-5xl">🚗</span>
                  )}
                  {v.isDemo && <DemoBadge />}

                  {/* ✅ FIX 10: expiry badge */}
                  {expiringWithin(v.expires_at, 3) && (
                    <div className="absolute bottom-2 left-2 bg-red-500/90 text-white text-xs
                                    px-2 py-1 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Expiring soon
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 text-sm flex-1 leading-snug">
                      {v.title}
                    </h3>
                    {v.category && (
                      <span className="flex-shrink-0 text-xs bg-green-50 text-green-700
                                       px-2 py-0.5 rounded-full font-medium">
                        {v.category}
                      </span>
                    )}
                  </div>

                  <p className="text-xl font-bold text-green-700 mb-2">
                    {v.price.toLocaleString()} XAF
                  </p>

                  <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />{v.location}
                    </span>
                    {v.extra?.mileage && (
                      <span className="flex items-center gap-1">
                        <Gauge className="w-3 h-3" />{v.extra.mileage}
                      </span>
                    )}
                    {v.extra?.fuel && (
                      <span className="flex items-center gap-1">
                        <Fuel className="w-3 h-3" />{v.extra.fuel}
                      </span>
                    )}
                    {v.extra?.transmission && (
                      <span className="capitalize">{v.extra.transmission}</span>
                    )}
                    {v.extra?.year && (
                      <span>{v.extra.year}</span>
                    )}
                  </div>

                  {v.isDemo ? (
                    <p className="text-xs text-yellow-600 mt-2 italic">Sample — not a real listing</p>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                      <Eye className="w-3 h-3" />
                      {v.view_count ?? 0} view{v.view_count !== 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
