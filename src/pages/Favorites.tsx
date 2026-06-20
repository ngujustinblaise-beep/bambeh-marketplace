/**
 * src/pages/Favorites.tsx - Bambeh Marketplace
 * Saved items from localStorage + Supabase user_favorites.
 * Fully translated live via the singular LanguageContext (no refresh needed).
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Trash2, ShoppingBag, Loader2, Briefcase, Wrench, Car, Leaf, Zap, Home } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/App";

interface FavItem {
  id: string;
  title: string;
  price?: string | number;
  image?: string;
  category: string;
  type: string;
  location?: string;
  savedAt: string;
}

const FAV_KEY = "bambeh_favorites";

const TYPE_ROUTES: Record<string, string> = {
  marketplace: "/marketplace/",
  job: "/jobs/",
  service: "/services/",
  rental: "/rentals/",
  vehicle: "/vehicles/",
  "farm-fresh": "/farm-fresh/",
  deal: "/deals/",
  "group-deal": "/group-buying/",
  exchange: "/exchange/",
};

// type -> translation key for the colored badge label
const TYPE_LABEL_KEYS: Record<string, string> = {
  marketplace: "fav.typeItem",
  job: "nav.jobs",
  service: "nav.services",
  rental: "nav.rentals",
  vehicle: "nav.vehicles",
  "farm-fresh": "fav.typeFarmFresh",
  deal: "fav.typeFlashDeal",
  "group-deal": "fav.typeGroupDeal",
  exchange: "nav.exchange",
};

const TYPE_COLORS: Record<string, string> = {
  marketplace: "bg-teal-100 text-teal-700",
  job: "bg-blue-100 text-blue-700",
  service: "bg-purple-100 text-purple-700",
  rental: "bg-orange-100 text-orange-700",
  vehicle: "bg-gray-100 text-gray-700",
  "farm-fresh": "bg-green-100 text-green-700",
  deal: "bg-red-100 text-red-700",
  "group-deal": "bg-indigo-100 text-indigo-700",
  exchange: "bg-yellow-100 text-yellow-700",
};

const TYPE_ICONS: Record<string, JSX.Element> = {
  marketplace: <ShoppingBag className="w-4 h-4" />,
  job: <Briefcase className="w-4 h-4" />,
  service: <Wrench className="w-4 h-4" />,
  rental: <Home className="w-4 h-4" />,
  vehicle: <Car className="w-4 h-4" />,
  "farm-fresh": <Leaf className="w-4 h-4" />,
  deal: <Zap className="w-4 h-4" />,
};

// filter tab key -> translation key
const TABS = [
  { key: "all", labelKey: "fav.tabAll" },
  { key: "marketplace", labelKey: "fav.tabItems" },
  { key: "job", labelKey: "nav.jobs" },
  { key: "service", labelKey: "nav.services" },
  { key: "farm-fresh", labelKey: "fav.tabFarm" },
  { key: "vehicle", labelKey: "nav.vehicles" },
  { key: "rental", labelKey: "nav.rentals" },
  { key: "deal", labelKey: "fav.tabDeals" },
];

function fmtPrice(p: string | number | undefined) {
  if (!p) return null;
  if (typeof p === "number") return `${p.toLocaleString("fr-CM")} XAF`;
  return String(p);
}

export default function Favorites() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRtl = language === "ar";
  const [favorites, setFavorites] = useState<FavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    let items: FavItem[] = [];
    try {
      const s = JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
      if (Array.isArray(s)) items = s;
    } catch {}
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      if (uid) {
        const { data, error } = await supabase
          .from("user_favorites")
          .select("*")
          .eq("user_id", uid)
          .order("saved_at", { ascending: false });
        if (!error && data && data.length > 0) {
          const dbItems: FavItem[] = data.map((d: any) => ({
            id: d.item_id,
            title: d.title,
            price: d.price,
            image: d.image_url,
            category: d.category || "Other",
            type: d.item_type || "marketplace",
            savedAt: d.saved_at,
          }));
          const dbIds = new Set(dbItems.map((i) => i.id));
          items = [...dbItems, ...items.filter((i) => !dbIds.has(i.id))];
          localStorage.setItem(FAV_KEY, JSON.stringify(items));
        }
      }
    } catch {}
    setFavorites(items);
    setLoading(false);
  }

  async function removeFavorite(fav: FavItem) {
    const updated = favorites.filter((f) => f.id !== fav.id);
    setFavorites(updated);
    localStorage.setItem(FAV_KEY, JSON.stringify(updated));
    if (userId) {
      await supabase.from("user_favorites").delete().eq("user_id", userId).eq("item_id", fav.id);
    }
  }

  function navigateToItem(fav: FavItem) {
    navigate((TYPE_ROUTES[fav.type] || "/marketplace/") + fav.id);
  }

  const typeLabel = (type: string) => {
    const k = TYPE_LABEL_KEYS[type];
    if (!k) return type;
    const v = t(k);
    return v && v !== k ? v : type;
  };

  const filtered = filter === "all" ? favorites : favorites.filter((f) => f.type === filter);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24" dir={isRtl ? "rtl" : "ltr"}>
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center gap-3 mb-3">
          <Heart className="w-6 h-6 text-red-500 fill-red-500" />
          <h1 className="text-xl font-bold text-gray-900">{t("fav.title")}</h1>
          <span className="ml-auto text-sm text-gray-500">{favorites.length} {t("fav.saved")}</span>
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => {
            const count = tab.key === "all" ? favorites.length : favorites.filter((f) => f.type === tab.key).length;
            if (tab.key !== "all" && count === 0) return null;
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filter === tab.key ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {t(tab.labelKey)} {count > 0 && <span className="ml-1 opacity-70">({count})</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4">
        {!userId && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 text-sm text-amber-700 flex items-center gap-2">
            <Heart className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>{t("fav.loginSync")}</span>
            <button onClick={() => navigate("/login")} className="ml-auto font-bold underline flex-shrink-0">
              {t("fav.login")}
            </button>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Heart className="w-16 h-16 text-gray-200 mb-4" />
            <h2 className="text-lg font-semibold text-gray-600 mb-2">
              {filter === "all" ? t("fav.noneYet") : t("fav.noneCategory").replace("{category}", typeLabel(filter))}
            </h2>
            <p className="text-gray-400 text-sm mb-6 max-w-xs">{t("fav.tapHeart")}</p>
            <button
              onClick={() => navigate(filter === "job" ? "/jobs" : filter === "service" ? "/services" : filter === "farm-fresh" ? "/farm-fresh" : "/marketplace")}
              className="bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold text-sm"
            >
              {t("fav.browse")} {filter === "all" ? t("nav.marketplace") : typeLabel(filter)}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((fav) => (
              <div
                key={fav.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]"
                onClick={() => navigateToItem(fav)}
              >
                <div className="w-[72px] h-[72px] rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {fav.image ? (
                    <img
                      src={fav.image}
                      alt={fav.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="text-gray-300">{TYPE_ICONS[fav.type] || <ShoppingBag className="w-6 h-6" />}</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 flex-1">{fav.title}</h3>
                    <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[fav.type] || "bg-gray-100 text-gray-600"}`}>
                      {typeLabel(fav.type)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-1">{fav.category}</p>
                  {fav.price && <p className="text-teal-600 font-bold text-sm">{fmtPrice(fav.price)}</p>}
                  {fav.location && <p className="text-xs text-gray-400 mt-0.5 truncate">{fav.location}</p>}
                  <p className="text-xs text-gray-300 mt-0.5">
                    {t("fav.savedOn")} {new Date(fav.savedAt).toLocaleDateString(isRtl ? "ar" : "en-GB", { day: "numeric", month: "short" })}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFavorite(fav);
                  }}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition flex-shrink-0"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


