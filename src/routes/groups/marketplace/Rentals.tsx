import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Search, MapPin, Bed, Bath, DollarSign, Plus, Loader2, RefreshCw, Eye, AlertCircle, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { LocationFilter, LocationFilters, EMPTY_LOCATION } from "@/components/filters/LocationFilter";
import { DemoBadge } from "@/components/listings/DemoBadge";
import { FeaturedAdsStrip } from "@/components/ads/FeaturedAdsStrip";
import { useLanguage } from "@/context/LanguageContext";

const RENT_T: Record<string, Record<string, string>> = {
  en: {
    "rentals.title": "Rentals",
    "rentals.listProperty": "List Property",
    "rentals.refresh": "Refresh",
    "rentals.search": "Search by name or neighbourhood�",
    "rentals.maxRent": "Max Rent",
    "rentals.allCities": "All Cities",
    "rentals.allTypes": "All Types",
    "rentals.perMonth": "XAF/mo",
    "rentals.furnished": "Furnished",
    "rentals.views": "views",
    "rentals.view": "view",
    "rentals.sampleListing": "Sample � not a real listing",
    "rentals.expiringSoon": "Expiring soon",
    "rentals.propertiesFound": "{{count}} propert{{suffix}} found",
    "rentals.loading": "Loading properties�",
    "rentals.error": "Could not load listings. Showing demo data.",
    "rentals.noPropertiesTitle": "No properties found",
    "rentals.noPropertiesHint": "Try widening your filters or list your own property."
  },
  fr: {
    "rentals.title": "Locations",
    "rentals.listProperty": "Publier une location",
    "rentals.refresh": "Actualiser",
    "rentals.search": "Rechercher par nom ou quartier�",
    "rentals.maxRent": "Loyer max",
    "rentals.allCities": "Toutes les villes",
    "rentals.allTypes": "Tous les types",
    "rentals.perMonth": "XAF/mois",
    "rentals.furnished": "Meubl�",
    "rentals.views": "vues",
    "rentals.view": "vue",
    "rentals.sampleListing": "Exemple � annonce fictive",
    "rentals.expiringSoon": "Bient�t expir�",
    "rentals.propertiesFound": "{{count}} propri�t�{{suffix}} trouv�e{{suffix}}",
    "rentals.loading": "Chargement des propri�t�s�",
    "rentals.error": "Impossible de charger les annonces. Affichage des donn�es de d�monstration.",
    "rentals.noPropertiesTitle": "Aucune propri�t� trouv�e",
    "rentals.noPropertiesHint": "�largissez vos filtres ou publiez votre propri�t�."
  },
  ar: {
    "rentals.title": "?????????",
    "rentals.listProperty": "??? ??????",
    "rentals.refresh": "?????",
    "rentals.search": "???? ?????? ?? ????�",
    "rentals.maxRent": "???? ?????",
    "rentals.allCities": "?? ?????",
    "rentals.allTypes": "?? ???????",
    "rentals.perMonth": "XAF/???",
    "rentals.furnished": "?????",
    "rentals.views": "???????",
    "rentals.view": "??????",
    "rentals.sampleListing": "???? � ??? ??????? ???????",
    "rentals.expiringSoon": "????? ??????",
    "rentals.propertiesFound": "?? ?????? ??? {{count}} ????",
    "rentals.loading": "???? ????? ????????�",
    "rentals.error": "???? ????? ?????????. ??? ??? ?????? ???????.",
    "rentals.noPropertiesTitle": "?? ???? ??????",
    "rentals.noPropertiesHint": "???? ???? ????? ??????? ?? ???? ?????."
  },
  ff: {
    "rentals.title": "Luwaaji",
    "rentals.listProperty": "Windude suudu",
    "rentals.refresh": "Hes?itin",
    "rentals.search": "Yiilo innde wala wuro�",
    "rentals.maxRent": "Coggu ?urtu?o",
    "rentals.allCities": "Gure fof",
    "rentals.allTypes": "Sifaaji fof",
    "rentals.perMonth": "XAF/lewru",
    "rentals.furnished": "Hee?aa?o",
    "rentals.views": "njiyaali",
    "rentals.view": "njiyaa",
    "rentals.sampleListing": "Misal � wonaa bayyinaango goonga",
    "rentals.expiringSoon": "Aray timmude",
    "rentals.propertiesFound": "{{count}} cuu?i ke?aama",
    "rentals.loading": "Loowugol cuu?i�",
    "rentals.error": "Ro?ki loowude bayyinaali. Hollirde ke?e ndaar?e.",
    "rentals.noPropertiesTitle": "Cuu?i alaa",
    "rentals.noPropertiesHint": "Yaaju filtaaji maa, walla windu suudu maa."
  },
  pidgin: {
    "rentals.title": "Rentals",
    "rentals.listProperty": "Post House",
    "rentals.refresh": "Refresh",
    "rentals.search": "Find by name or quarter�",
    "rentals.maxRent": "Max Rent",
    "rentals.allCities": "All Towns",
    "rentals.allTypes": "All Types",
    "rentals.perMonth": "XAF/month",
    "rentals.furnished": "Get furniture",
    "rentals.views": "views",
    "rentals.view": "view",
    "rentals.sampleListing": "Sample � no be real listing",
    "rentals.expiringSoon": "E go soon finish",
    "rentals.propertiesFound": "{{count}} house dem dey",
    "rentals.loading": "E dey load houses�",
    "rentals.error": "E no fit load listings. We dey show demo.",
    "rentals.noPropertiesTitle": "No house dey",
    "rentals.noPropertiesHint": "Open your filter small, or post your own house."
  },
};

const normLang = (l: string): string => {
  const v = String(l || "en").toLowerCase();
  if (v.startsWith("fr")) return "fr";
  if (v.startsWith("ar")) return "ar";
  if (v === "ff" || v.startsWith("ful")) return "ff";
  if (v === "pcm" || v === "pidgin") return "pidgin";
  return "en";
};

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
  images?: string[];
  postedAt: string;
  expiresAt?: string;
  isFurnished?: boolean;
  isDemo?: boolean;
  view_count?: number;
}

const SAMPLE: Property[] = [
  { id: "demo-1", title: "Modern 2-bed apartment in Bastos", type: "Apartment", price: 150000, location: "Yaound�", quartier: "Bastos", bedrooms: "2", bathrooms: "1", description: "Furnished apartment with balcony and security.", postedAt: new Date().toISOString(), isDemo: true },
  { id: "demo-2", title: "Spacious villa in Bonamoussadi", type: "Villa", price: 350000, location: "Douala", quartier: "Bonamoussadi", bedrooms: "4", bathrooms: "3", description: "4-bedroom villa with garden and parking.", postedAt: new Date().toISOString(), isDemo: true },
  { id: "demo-3", title: "Studio near University of Yaound�", type: "Studio", price: 60000, location: "Yaound�", quartier: "Ngoa-Ek�l�", bedrooms: "Studio", bathrooms: "1", description: "Clean studio, ideal for students.", postedAt: new Date().toISOString(), isDemo: true },
  { id: "demo-4", title: "Professional office space in Akwa", type: "Office", price: 200000, location: "Douala", quartier: "Akwa", bedrooms: "N/A", bathrooms: "1", description: "Professional office space in prime location.", postedAt: new Date().toISOString(), isDemo: true },
];

const CITIES = ["allCities", "Yaound�", "Douala", "Bafoussam", "Garoua", "Maroua", "Bamenda", "Ngaound�r�", "Bertoua", "Ebolowa", "Kumba"];
const TYPES = ["allTypes", "Apartment", "Villa", "Studio", "House", "Office", "Room", "Shop"];

function expiringWithin(expiresAt: string | undefined, days: number): boolean {
  if (!expiresAt) return false;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return diff > 0 && diff <= days * 86400000;
}

export default function Rentals() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const lang = normLang(language);

  const t = useCallback((k: string, o?: Record<string, any>) => {
    let v = ((RENT_T[lang] || RENT_T.en)[k]) ?? RENT_T.en[k] ?? k;
    if (o) for (const p in o) v = v.split(`{{${p}}}`).join(String(o[p]));
    return v;
  }, [lang]);

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("allCities");
  const [type, setType] = useState("allTypes");
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [locationFilters, setLocationFilters] = useState<LocationFilters>(EMPTY_LOCATION);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: sbError } = await supabase
        .from("rentals")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(40);

      if (sbError) throw sbError;

      const rows = (data ?? []) as any[];
      if (rows.length > 0) {
        setProperties(rows.map((d) => ({
          id: String(d.id),
          title: d.title || "Untitled Property",
          type: d.type || "Apartment",
          price: Number(d.price ?? 0),
          location: d.location || "",
          quartier: d.quartier || "",
          bedrooms: String(d.bedrooms ?? "?"),
          bathrooms: String(d.bathrooms ?? "?"),
          description: d.description || "",
          images: Array.isArray(d.images) ? d.images : [],
          isFurnished: !!d.is_furnished,
          postedAt: d.created_at || new Date().toISOString(),
          expiresAt: d.expires_at || undefined,
          view_count: Number(d.view_count ?? 0),
          isDemo: false,
        })));
      } else {
        setProperties(SAMPLE);
      }
    } catch {
      setError(t("rentals.error"));
      setProperties(SAMPLE);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  useEffect(() => {
    const channel = supabase
      .channel("rentals_realtime_feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "rentals" }, fetchProperties)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchProperties]);

  const filtered = [...properties]
    .filter((p) => {
      if (search) {
        const q = search.toLowerCase();
        if (!p.title.toLowerCase().includes(q) && !(p.quartier || "").toLowerCase().includes(q) && !p.location.toLowerCase().includes(q)) return false;
      }
      if (city !== "allCities" && !p.location.toLowerCase().includes(city.toLowerCase())) return false;
      if (type !== "allTypes" && p.type !== type) return false;
      if (p.price > maxPrice) return false;
      const loc = `${p.location} ${p.quartier || ""}`.toLowerCase();
      if (locationFilters.region && !loc.includes(locationFilters.region.toLowerCase())) return false;
      if (locationFilters.city && !loc.includes(locationFilters.city.toLowerCase())) return false;
      if (locationFilters.quarter && !loc.includes(locationFilters.quarter.toLowerCase())) return false;
      if (locationFilters.landmark && !loc.includes(locationFilters.landmark.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (a.isDemo !== b.isDemo) return a.isDemo ? 1 : -1;
      return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
    });

  const count = filtered.length;
  const suffix = count === 1 ? "" : "s";

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-28">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Home className="w-6 h-6 text-orange-500" />
            {t("rentals.title")}
          </h1>
          <div className="flex gap-2">
            <button onClick={fetchProperties} disabled={loading} className="p-2 text-gray-400 hover:text-orange-500 rounded-xl hover:bg-gray-100 disabled:opacity-40" aria-label={t("rentals.refresh")}>
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button onClick={() => navigate("/rentals/list")} className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1 transition-all">
              <Plus className="w-4 h-4" />
              {t("rentals.listProperty")}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-3 mb-4 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("rentals.search")} className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm bg-white" />
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 text-sm bg-white">
            {CITIES.map((c) => <option key={c} value={c}>{c === "allCities" ? t("rentals.allCities") : c}</option>)}
          </select>
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 text-sm bg-white">
            {TYPES.map((tp) => <option key={tp} value={tp}>{tp === "allTypes" ? t("rentals.allTypes") : tp}</option>)}
          </select>
        </div>

        <div className="mb-4 bg-white rounded-xl p-3 border">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>{t("rentals.maxRent")}</span>
            <span className="font-semibold text-orange-600">{maxPrice.toLocaleString()} {t("rentals.perMonth")}</span>
          </div>
          <input type="range" min={30000} max={1000000} step={10000} value={maxPrice} onChange={(e) => setMaxPrice(+e.target.value)} className="w-full accent-orange-500" />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>30,000</span><span>1,000,000</span>
          </div>
        </div>

        <LocationFilter onFilterChange={setLocationFilters} />
        <FeaturedAdsStrip category="rentals" showHeader={false} maxVisible={20} />

        {loading && (
          <div className="flex flex-col items-center py-16 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            <p className="text-sm text-gray-400">{t("rentals.loading")}</p>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Home className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-semibold text-gray-700">{t("rentals.noPropertiesTitle")}</p>
            <p className="text-sm text-gray-400 mt-1 mb-4">{t("rentals.noPropertiesHint")}</p>
            <button onClick={() => navigate("/rentals/list")} className="bg-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-600 active:scale-95 transition-all">
              {t("rentals.listProperty")}
            </button>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs text-gray-400">{t("rentals.propertiesFound", { count, suffix })}</p>
            {filtered.map((p) => (
              <div
                key={p.id}
                onClick={() => !p.isDemo && navigate(`/rentals/${p.id}`)}
                className={`bg-white rounded-2xl overflow-hidden shadow-sm border transition-all ${!p.isDemo ? "cursor-pointer hover:shadow-md active:scale-[0.99]" : "opacity-90"}`}
              >
                <div className="h-40 bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center relative overflow-hidden">
                  {p.images && p.images[0] ? (
                    <img
                      src={p.images[0]}
                      alt={p.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : (
                    <Home className="w-12 h-12 text-orange-300" />
                  )}
                  {p.isDemo && <DemoBadge />}
                  {expiringWithin(p.expiresAt, 3) && (
                    <div className="absolute bottom-2 left-2 bg-red-500/90 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
                      <Clock className="w-3 h-3" />
                      {t("rentals.expiringSoon")}
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-900 flex-1 pr-2 text-sm leading-snug">{p.title}</h3>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full whitespace-nowrap">{p.type}</span>
                      {p.isFurnished && <span className="text-xs bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full">{t("rentals.furnished")}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{p.location}{p.quartier ? `, ${p.quartier}` : ""}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Bed className="w-3 h-3" /> {p.bedrooms}</span>
                      <span className="flex items-center gap-1"><Bath className="w-3 h-3" /> {p.bathrooms}</span>
                    </div>
                    <span className="font-bold text-orange-600 flex items-center gap-0.5 text-sm">
                      <DollarSign className="w-3 h-3" />
                      {p.price.toLocaleString()} {t("rentals.perMonth")}
                    </span>
                  </div>

                  {p.isDemo ? (
                    <p className="text-xs text-yellow-600 mt-2 italic">{t("rentals.sampleListing")}</p>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                      <Eye className="w-3 h-3" />
                      {p.view_count ?? 0}&nbsp;{p.view_count === 1 ? t("rentals.view") : t("rentals.views")}
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


