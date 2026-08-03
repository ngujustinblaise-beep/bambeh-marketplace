// BAMBEH_DEPLOY_TOKEN__VEHICLERENTALS_FIX168_CLEAN
/**
 * src/pages/VehicleRentals.tsx ? Bambeh Marketplace
 * Full vehicle listings page with multilingual support, Supabase realtime,
 * rich filters, and zero-error UX.
 * ? 2026 BAMBEH SARL. All rights reserved.
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, MapPin, Gauge, Fuel, Plus, Car,
  Loader2, RefreshCw, Eye, AlertCircle, Clock,
  ChevronRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { LocationFilter, LocationFilters, EMPTY_LOCATION } from "@/components/filters/LocationFilter";
import { DemoBadge } from "@/components/listings/DemoBadge";
import { useLang } from "@/hooks/useAppLang";
import { FeaturedAdsStrip } from "@/components/ads/FeaturedAdsStrip";

import LocationLock from "@/components/security/LocationLock";
// -------------------------------------------------------------
// i18n dictionary
// -------------------------------------------------------------
const I18N: Record<string, Record<string, string>> = {
  en: {
    title: "Cars & Vehicles",
    subtitle: "Buy and sell vehicles across Cameroon",
    searchPlaceholder: "Search by make, model, or title?",
    allCities: "All Cities",
    refresh: "Refresh",
    sell: "Sell",
    vehiclesFound: "vehicle found",
    vehiclesFoundPlural: "vehicles found",
    loading: "Loading vehicles?",
    noVehicles: "No vehicles found",
    noVehiclesHint: "Try clearing your filters or be the first to list!",
    listYourVehicle: "List Your Vehicle",
    sample: "Sample ? not a real listing",
    expiringLabel: "Expiring soon",
    errorBanner: "Could not load listings. Showing demo data.",
    allTypes: "All",
    views: "view",
    viewsPlural: "views",
    backToTop: "Back to top",
  },
  fr: {
    title: "Voitures & V?hicules",
    subtitle: "Achetez et vendez des v?hicules au Cameroun",
    searchPlaceholder: "Rechercher par marque, mod?le ou titre?",
    allCities: "Toutes les villes",
    refresh: "Actualiser",
    sell: "Vendre",
    vehiclesFound: "v?hicule trouv?",
    vehiclesFoundPlural: "v?hicules trouv?s",
    loading: "Chargement des v?hicules?",
    noVehicles: "Aucun v?hicule trouv?",
    noVehiclesHint: "Essayez de supprimer vos filtres ou soyez le premier ? lister!",
    listYourVehicle: "Listez votre v?hicule",
    sample: "Exemple ? pas une vraie annonce",
    expiringLabel: "Expire bient?t",
    errorBanner: "Impossible de charger les annonces. Donn?es de d?monstration affich?es.",
    allTypes: "Tous",
    views: "vue",
    viewsPlural: "vues",
    backToTop: "Retour en haut",
  },
  ha: {
    title: "Motoci & Ababen Hawa",
    subtitle: "Saya da sayar da ababen hawa a Kamaru",
    searchPlaceholder: "Nemo ta marka, model ko take?",
    allCities: "Dukkan Biranen",
    refresh: "Sabunta",
    sell: "Sayar",
    vehiclesFound: "abin hawa an samu",
    vehiclesFoundPlural: "ababen hawa an samu",
    loading: "Ana loda ababen hawa?",
    noVehicles: "Ba a sami ababen hawa ba",
    noVehiclesHint: "Gwada share tace ko kasance na farko don lissafi!",
    listYourVehicle: "Lissafa Abin Hawanku",
    sample: "Samfuri ? ba lissafi na gaske ba",
    expiringLabel: "Kusa ya kare",
    errorBanner: "Ba a iya loda lissafin. Ana nuna bayanin demo.",
    allTypes: "Duka",
    views: "kallo",
    viewsPlural: "kallaye",
    backToTop: "Koma sama",
  },
  ar: {
    title: "???????? ?????????",
    subtitle: "??? ????? ???????? ?? ?????????",
    searchPlaceholder: "???? ???????? ?? ?????? ?? ????????",
    allCities: "???? ?????",
    refresh: "?????",
    sell: "???",
    vehiclesFound: "????? ????",
    vehiclesFoundPlural: "?????? ????",
    loading: "???? ????? ?????????",
    noVehicles: "?? ???? ??????",
    noVehiclesHint: "???? ??? ??????? ?? ?? ??? ?? ???? ???????!",
    listYourVehicle: "??? ??????",
    sample: "????? ? ??? ??????? ???????",
    expiringLabel: "????? ??????",
    errorBanner: "????? ????? ?????????. ??? ??? ???????? ?????????.",
    allTypes: "????",
    views: "??????",
    viewsPlural: "???????",
    backToTop: "?????? ??????",
  },
  pcm: {
    title: "Cars & Motor",
    subtitle: "Buy and sell motor for all Cameroon",
    searchPlaceholder: "Search by make, model or name?",
    allCities: "All Towns",
    refresh: "Refresh",
    sell: "Sell",
    vehiclesFound: "motor find",
    vehiclesFoundPlural: "motors find",
    loading: "Motor dey load?",
    noVehicles: "No motor find",
    noVehiclesHint: "Try remove filter or be first person post!",
    listYourVehicle: "Post Your Motor",
    sample: "Sample ? no be real post",
    expiringLabel: "Go expire soon",
    errorBanner: "We no fit load posts. We dey show demo data.",
    allTypes: "All",
    views: "view",
    viewsPlural: "views",
    backToTop: "Go top",
  },
  ff: {
    title: "Jawdi & Laa?al",
    subtitle: "Soodde e yillitde laa?al e Kameruun",
    searchPlaceholder: "Yiyto e innde, model walla tiitoonde?",
    allCities: "Telli Wuro",
    refresh: "Haa?tu",
    sell: "Yillitu",
    vehiclesFound: "laa?al he?aa",
    vehiclesFoundPlural: "laa?e he?aa",
    loading: "Laa?e njilloyinee?",
    noVehicles: "Laa?e he?aaki",
    noVehiclesHint: "Wi? siftooje maa ar tawa fowo!",
    listYourVehicle: "Haa?tu Laa?al Maa",
    sample: "Misaali ? wo??aaki ja?tere goonga",
    expiringLabel: "Timmata jooni",
    errorBanner: "Ja?tere nde nahataa. Yeeso misaali hannde.",
    allTypes: "Fof",
    views: "yiyaade",
    viewsPlural: "yiyaa?e",
    backToTop: "Haa?tu dow",
  },
};

// -------------------------------------------------------------
// Category labels (multilingual)
// -------------------------------------------------------------
const CATEGORY_LABELS: Record<string, Record<string, string>> = {
  en: { All:"All", Sedan:"Sedan", SUV:"SUV", Pickup:"Pickup", Motorcycle:"Motorcycle", Van:"Van", Minibus:"Minibus", Truck:"Truck" },
  fr: { All:"Tous", Sedan:"Berline", SUV:"SUV", Pickup:"Pick-up", Motorcycle:"Moto", Van:"Fourgon", Minibus:"Minibus", Truck:"Camion" },
  ha: { All:"Duka", Sedan:"Sedan", SUV:"SUV", Pickup:"Pickup", Motorcycle:"Babur", Van:"Van", Minibus:"Minibus", Truck:"Lori" },
  ar: { All:"????", Sedan:"?????", SUV:"????? ??? ?????", Pickup:"??? ??", Motorcycle:"????? ?????", Van:"???", Minibus:"????? ?????", Truck:"?????" },
  pcm: { All:"All", Sedan:"Sedan", SUV:"SUV", Pickup:"Pickup", Motorcycle:"Motor", Van:"Van", Minibus:"Minibus", Truck:"Truck" },
  ff: { All:"Fof", Sedan:"Sedan", SUV:"SUV", Pickup:"Pickup", Motorcycle:"Motor", Van:"Van", Minibus:"Minibus", Truck:"Lorri" },
};

const VEHICLE_TYPES = ["All", "Sedan", "SUV", "Pickup", "Motorcycle", "Van", "Minibus", "Truck"];
const CITIES        = ["All", "Yaound?", "Douala", "Bamenda", "Bafoussam", "Garoua", "Maroua"];

// -------------------------------------------------------------
// Types
// -------------------------------------------------------------
interface Vehicle {
  id:          string;
  title:       string;
  price:       number;
  location:    string;
  category:    string;
  images:      string[];
  created_at:  string;
  expires_at?: string;
  extra:       Record<string, any>;
  isDemo?:     boolean;
  view_count?: number;
}

// FIX168: the fake demo vehicles array was removed - real listings only.

function expiringWithin(expiresAt?: string, days = 3): boolean {
  if (!expiresAt) return false;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return diff > 0 && diff <= days * 86_400_000;
}

// -------------------------------------------------------------
// Component
// -------------------------------------------------------------
export default function VehicleRentals() {
  const navigate = useNavigate();
  const lang = (useLang() || "en") as string;
  const tr = (key: string) => (I18N[lang] || I18N.en)[key] || (I18N.en)[key] || key;
  const catLabel = (cat: string) => (CATEGORY_LABELS[lang] || CATEGORY_LABELS.en)[cat] || cat;
  const isRtl = lang === "ar";

  const [vehicles,        setVehicles]        = useState<Vehicle[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState<string | null>(null);
  const [search,          setSearch]          = useState("");
  const [typeFilter,      setTypeFilter]      = useState("All");
  const [cityFilter,      setCityFilter]      = useState("All");
  const [locationFilters, setLocationFilters] = useState<LocationFilters>(EMPTY_LOCATION);

  const fetchVehicles = useCallback(async () => {
    setError(null);
    try {
      const { data, error: sbErr } = await supabase
        .from("listings")
        .select("id,title,price,location,category,images,created_at,expires_at,extra,view_count")
        .eq("type", "vehicle")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(40);

      if (sbErr) throw sbErr;
      setVehicles(
        data && data.length > 0
          ? data.map((d: any) => ({ ...d, isDemo: false, extra: d.extra || {}, images: d.images || [] }))
          : [] // FIX168: no demo fallback
      );
    } catch (err: any) {
      console.error("[VehicleRentals] fetch error:", err);
      setError(tr("errorBanner"));
      setVehicles([]); // FIX168
    } finally {
      setLoading(false);
    }
  }, [lang]); // re-run on lang change to refresh error string

  useEffect(() => {
    fetchVehicles();
    const ch = supabase
      .channel("vr_realtime_feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "listings" }, fetchVehicles)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [fetchVehicles]);

  // -- Filtered list ------------------------------------------
  const filtered = [...vehicles]
    .filter((v) => {
      if (search) {
        const q = search.toLowerCase();
        if (!(
          v.title.toLowerCase().includes(q) ||
          (v.extra?.make  || "").toLowerCase().includes(q) ||
          (v.extra?.model || "").toLowerCase().includes(q) ||
          v.location.toLowerCase().includes(q)
        )) return false;
      }
      if (typeFilter !== "All") {
        if (v.category !== typeFilter && (v.extra?.vehicle_type || "") !== typeFilter) return false;
      }
      if (cityFilter !== "All") {
        if (!v.location.toLowerCase().includes(cityFilter.toLowerCase())) return false;
      }
      const loc = [v.location, v.extra?.region||"", v.extra?.city||"", v.extra?.quarter||"", v.extra?.landmark||""].join(" ").toLowerCase();
      if (locationFilters.region   && !loc.includes(locationFilters.region.toLowerCase()))   return false;
      if (locationFilters.city     && !loc.includes(locationFilters.city.toLowerCase()))     return false;
      if (locationFilters.quarter  && !loc.includes(locationFilters.quarter.toLowerCase()))  return false;
      if (locationFilters.landmark && !loc.includes(locationFilters.landmark.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (a.isDemo !== b.isDemo) return a.isDemo ? 1 : -1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  // -- Render -------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 pb-28" dir={isRtl ? "rtl" : "ltr"}>

      {/* -- Hero -- */}
      <div className="bg-gradient-to-r from-green-700 to-green-800 text-white pt-10 pb-14 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-1 flex items-center gap-2">
            <Car className="w-8 h-8 flex-shrink-0" />
            {tr("title")}
          </h1>
          <p className="text-green-100 mb-5 text-sm">{tr("subtitle")}</p>

          <div className={`relative`}>
            <Search className={`absolute ${isRtl ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tr("searchPlaceholder")}
              className={`w-full ${isRtl ? "pr-12 pl-4" : "pl-12 pr-4"} py-3 rounded-xl text-gray-900 outline-none focus:ring-2 focus:ring-white/40 text-sm`}
            />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-4">

        {/* -- Filters card -- */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {VEHICLE_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition
                  ${typeFilter === type
                    ? "bg-green-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {catLabel(type)}
              </button>
            ))}
          </div>

          <div className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="flex-1 border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500 bg-white"
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>{c === "All" ? tr("allCities") : c}</option>
              ))}
            </select>

            <button
              onClick={fetchVehicles}
              disabled={loading}
              className="p-2 text-gray-500 hover:text-green-600 rounded-xl hover:bg-gray-100 disabled:opacity-40"
              aria-label={tr("refresh")}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={() => navigate("/vehicles/sell")}
              className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold
                         flex items-center gap-1 hover:bg-green-700 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              {tr("sell")}
            </button>
          </div>
        </div>

        {/* -- Error banner -- */}
        {error && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-3 mb-4 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* -- Location filter -- */}
        <LocationFilter onFilterChange={setLocationFilters} />

        {/* -- Featured strip -- */}
        <FeaturedAdsStrip category="vehicles" showHeader={false} maxVisible={20} />

        {/* -- Count -- */}
        <div className="mb-3 text-sm text-gray-400">
          {filtered.length} {filtered.length === 1 ? tr("vehiclesFound") : tr("vehiclesFoundPlural")}
        </div>

        {/* -- Loading -- */}
        {loading && (
          <div className="flex flex-col items-center py-16 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            <p className="text-sm text-gray-400">{tr("loading")}</p>
          </div>
        )}

        {/* -- Empty -- */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16">
            <Car className="w-14 h-14 text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-700 mb-1">{tr("noVehicles")}</p>
            <p className="text-sm text-gray-400 mb-4">{tr("noVehiclesHint")}</p>
            <button
              onClick={() => navigate("/vehicles/sell")}
              className="bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 active:scale-95 transition-all"
            >
              {tr("listYourVehicle")}
            </button>
          </div>
        )}

        {/* -- Cards -- */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-4">
            {filtered.map((v) => (
              <div
                key={v.id}
                onClick={() => !v.isDemo && navigate(`/vehicles/${v.id}`)}
                className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all
                  ${!v.isDemo ? "cursor-pointer hover:shadow-md active:scale-[0.99]" : "opacity-90"}`}
              >
                {/* Image */}
                <div className="h-44 bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center overflow-hidden relative">
                  {v.images?.[0] ? (
                    <img
                      src={v.images[0]}
                      alt={v.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : (
                    <span className="text-5xl">??</span>
                  )}
                  {v.isDemo && <DemoBadge />}
                  {expiringWithin(v.expires_at, 3) && (
                    <div className="absolute bottom-2 left-2 bg-red-500/90 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {tr("expiringLabel")}
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="p-4">
                  <div className={`flex items-start justify-between gap-2 mb-1 ${isRtl ? "flex-row-reverse" : ""}`}>
                    <h3 className="font-bold text-gray-900 text-sm flex-1 leading-snug">{v.title}</h3>
                    {v.category && (
                      <span className="flex-shrink-0 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
                        {catLabel(v.category)}
                      </span>
                    )}
                  </div>

                  <p className="text-xl font-bold text-green-700 mb-2">
                    {v.price.toLocaleString()} XAF
                  </p>

                  <div className={`flex items-center gap-4 text-xs text-gray-500 flex-wrap ${isRtl ? "flex-row-reverse" : ""}`}>
                    <LocationLock location={v.location} compact />
                    {v.extra?.mileage     && <span className="flex items-center gap-1"><Gauge className="w-3 h-3"/>{v.extra.mileage}</span>}
                    {v.extra?.fuel        && <span className="flex items-center gap-1"><Fuel className="w-3 h-3"/>{v.extra.fuel}</span>}
                    {v.extra?.transmission && <span className="capitalize">{v.extra.transmission}</span>}
                    {v.extra?.year        && <span>{v.extra.year}</span>}
                  </div>

                  {v.isDemo ? (
                    <p className="text-xs text-yellow-600 mt-2 italic">{tr("sample")}</p>
                  ) : (
                    <div className={`flex items-center gap-1 text-xs text-gray-400 mt-1 ${isRtl ? "flex-row-reverse" : ""}`}>
                      <Eye className="w-3 h-3" />
                      {(v.view_count ?? 0)} {(v.view_count ?? 0) === 1 ? tr("views") : tr("viewsPlural")}
                    </div>
                  )}

                  {/* Tap hint for non-demo */}
                  {!v.isDemo && (
                    <div className={`flex items-center justify-end mt-2 text-green-600 ${isRtl ? "flex-row-reverse justify-start" : ""}`}>
                      <ChevronRight className="w-4 h-4" />
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





// BAMBEH_END_TOKEN__VEHICLERENTALS_FIX168__COMPLETE
