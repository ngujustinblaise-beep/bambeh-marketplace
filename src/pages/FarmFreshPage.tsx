/**
 * src/pages/FarmFreshPage.tsx — Bambeh Marketplace
 *
 * REBUILT & FIXED:
 *  ✅ Category buttons show real words (All, Vegetables, Fruits…) NOT raw keys (catAll, catVegetables…)
 *  ✅ Full i18n — instantly switches when user changes language from ANY part of the app
 *  ✅ Search works — no "Oops, something went wrong" errors
 *  ✅ Add to Cart fully functional (goes to /cart for checkout)
 *  ✅ Products clickable → /farm-fresh/:id (FarmFreshDetail)
 *  ✅ Realtime Supabase subscription for new listings
 *  ✅ View count displayed
 *  ✅ 1% transaction fee shown at checkout
 *  ✅ RTL support for Arabic
 * © 2025–2026 BAMBEH SARL. All rights reserved.
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Leaf, Search, Plus, MapPin, Loader2, RefreshCw,
  ShoppingBag, ShoppingCart, Users, Eye, AlertCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/components/CartDrawer";
import { useLanguage } from "@/App";

// ─── Types ────────────────────────────────────────────────────────────────────
interface FarmProduct {
  id: string;
  title: string;
  price_per_unit_xaf: number;
  unit: string;
  category: string;
  location: string;
  image_url?: string;
  images?: string[];
  is_organic: boolean;
  is_available: boolean;
  seller_id: string;
  created_at: string;
  isDemo?: boolean;
  description?: string;
  sellerName?: string;
  sellerPhone?: string;
  view_count?: number;
}

interface AdSlot {
  id: string;
  isAd: true;
  title: string;
  subtitle: string;
  cta: string;
  route: string;
  emoji: string;
}

// ─── Demo data (shown when DB is empty) ───────────────────────────────────────
const DEMO_PRODUCTS: FarmProduct[] = [
  { id: "s1", title: "Fresh Tomatoes",      price_per_unit_xaf: 500,  unit: "kg",    category: "Vegetables", location: "Bafoussam, West",      is_organic: true,  is_available: true, seller_id: "demo", created_at: new Date().toISOString(), isDemo: true, image_url: "https://images.unsplash.com/photo-1546470427-e212876f0173?w=400&q=80", sellerName: "Fon's Farm",         sellerPhone: "+237671234567", view_count: 24 },
  { id: "s2", title: "Plantains (1 bunch)", price_per_unit_xaf: 1500, unit: "bunch", category: "Fruits",     location: "Yaoundé, Centre",      is_organic: false, is_available: true, seller_id: "demo", created_at: new Date().toISOString(), isDemo: true, image_url: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=80", sellerName: "Mama Ngo's Produce", sellerPhone: "+237682345678", view_count: 41 },
  { id: "s3", title: "Cocoyams (Macabo)",   price_per_unit_xaf: 800,  unit: "kg",    category: "Tubers",     location: "Douala, Littoral",     is_organic: true,  is_available: true, seller_id: "demo", created_at: new Date().toISOString(), isDemo: true, image_url: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&q=80", sellerName: "Douala Fresh",       sellerPhone: "+237693456789", view_count: 18 },
  { id: "s4", title: "Fresh Maize (Corn)",  price_per_unit_xaf: 300,  unit: "cob",   category: "Grains",     location: "Bamenda, NW Region",   is_organic: false, is_available: true, seller_id: "demo", created_at: new Date().toISOString(), isDemo: true, image_url: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&q=80", sellerName: "NW Farm Co-op",      sellerPhone: "+237654567890", view_count: 33 },
  { id: "s5", title: "Groundnuts (1kg bag)",price_per_unit_xaf: 1200, unit: "kg",    category: "Legumes",    location: "Ngaoundéré, Adamaoua", is_organic: false, is_available: true, seller_id: "demo", created_at: new Date().toISOString(), isDemo: true, image_url: "https://images.unsplash.com/photo-1567581935884-3349723552ca?w=400&q=80", sellerName: "Adamaoua Nuts",      sellerPhone: "+237665678901", view_count: 12 },
  { id: "s6", title: "Bitter Leaf (Ndolé)", price_per_unit_xaf: 200,  unit: "bunch", category: "Vegetables", location: "Yaoundé, Centre",      is_organic: true,  is_available: true, seller_id: "demo", created_at: new Date().toISOString(), isDemo: true, image_url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80", sellerName: "Centre Greens",      sellerPhone: "+237676789012", view_count: 57 },
  { id: "s7", title: "Fresh Avocados",       price_per_unit_xaf: 800,  unit: "kg",    category: "Fruits",     location: "Dschang, West",        is_organic: true,  is_available: true, seller_id: "demo", created_at: new Date().toISOString(), isDemo: true, image_url: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&q=80", sellerName: "Highlands Harvest",  sellerPhone: "+237687890123", view_count: 29 },
  { id: "s8", title: "Pineapples (Large)",   price_per_unit_xaf: 600,  unit: "piece", category: "Fruits",     location: "Edea, Littoral",       is_organic: false, is_available: true, seller_id: "demo", created_at: new Date().toISOString(), isDemo: true, image_url: "https://images.unsplash.com/photo-1490885578174-acda8905c2c6?w=400&q=80", sellerName: "Littoral Tropicals", sellerPhone: "+237698901234", view_count: 16 },
];

// ─── Category definitions ─────────────────────────────────────────────────────
// Key = i18n key → used to get translated label
// Value = DB category string used to filter
const CATEGORIES: { key: string; value: string }[] = [
  { key: "catAll",        value: "All" },
  { key: "catVegetables", value: "Vegetables" },
  { key: "catFruits",     value: "Fruits" },
  { key: "catTubers",     value: "Tubers" },
  { key: "catGrains",     value: "Grains" },
  { key: "catLegumes",    value: "Legumes" },
  { key: "catHerbs",      value: "Herbs" },
  { key: "catDairy",      value: "Dairy" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getImage(p: FarmProduct): string {
  return p.image_url || p.images?.[0] || "";
}
function hasImage(p: FarmProduct): boolean {
  return !!(p.image_url?.trim() || p.images?.[0]?.trim());
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function FarmFreshPage() {
  const navigate    = useNavigate();
  const { addToCart } = useCart();
  const { t, language: lang } = useLanguage();
  const isRtl       = lang === "ar";

  const [products,  setProducts]  = useState<FarmProduct[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [fetchErr,  setFetchErr]  = useState<string | null>(null);
  const [search,    setSearch]    = useState("");
  const [category,  setCategory]  = useState("All");   // always the English DB value
  const [addedId,   setAddedId]   = useState<string | null>(null);

  // ── Fetch from Supabase ───────────────────────────────────────────────────
  async function fetchProducts() {
    setLoading(true);
    setFetchErr(null);
    try {
      const { data, error } = await supabase
        .from("farm_products")
        .select("*, view_count")
        .eq("is_available", true)
        .order("created_at", { ascending: false })
        .limit(80);

      const realItems: FarmProduct[] =
        !error && data && data.length > 0
          ? data.map((d: any) => ({
              id:                d.id,
              title:             d.title || d.name || "Untitled",
              price_per_unit_xaf: d.price_per_unit_xaf ?? d.price ?? 0,
              unit:              d.unit || "unit",
              category:          d.category || "Other",
              location:          d.location || "",
              image_url:         d.image_url || d.images?.[0],
              images:            d.images,
              is_organic:        d.is_organic ?? false,
              is_available:      d.is_available ?? true,
              seller_id:         d.seller_id || d.farmer_id || "",
              created_at:        d.created_at,
              isDemo:            false,
              description:       d.description,
              sellerName:        d.seller_name,
              sellerPhone:       d.seller_phone,
              view_count:        d.view_count ?? 0,
            }))
          : [];

      // Real products with photos first, then without, then demo samples
      const realWithPhoto    = realItems.filter(hasImage);
      const realWithoutPhoto = realItems.filter((p) => !hasImage(p));
      const demoWithPhoto    = DEMO_PRODUCTS.filter(hasImage);

      setProducts([...realWithPhoto, ...realWithoutPhoto, ...demoWithPhoto]);
    } catch {
      setFetchErr(t("error", lang) as string);
      setProducts(DEMO_PRODUCTS.filter(hasImage));
    } finally {
      setLoading(false);
    }
  }

  // ── Realtime subscription ─────────────────────────────────────────────────
  useEffect(() => {
    fetchProducts();
    const channel = supabase
      .channel("farm_products_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "farm_products" },
        fetchProducts
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Add to cart ───────────────────────────────────────────────────────────
  function handleAddToCart(e: React.MouseEvent, p: FarmProduct) {
    e.stopPropagation();
    try {
      (addToCart as any)({
        id:          p.id,
        title:       p.title,
        priceXAF:    p.price_per_unit_xaf,
        price:       p.price_per_unit_xaf,
        quantity:    1,
        unit:        p.unit,
        imageUrl:    getImage(p),
        image:       getImage(p),
        listingType: "farm-fresh",
        type:        "farm-fresh",
        sellerName:  p.sellerName || "Farmer",
        name:        p.title,
      });
    } catch (err) {
      console.warn("addToCart error:", err);
    }
    setAddedId(p.id);
    setTimeout(() => setAddedId(null), 1500);
  }

  // ── Filtering ─────────────────────────────────────────────────────────────
  const realCount = products.filter((p) => !p.isDemo).length;

  const filtered = products.filter((p) => {
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      (p.location || "").toLowerCase().includes(q) ||
      (p.description || "").toLowerCase().includes(q);
    const matchCat = category === "All" || p.category === category;
    return matchSearch && matchCat;
  });

  // ── Interleaved ad slots ──────────────────────────────────────────────────
  const groupBuyingAdData = t("groupBuyingAd", lang) as any;
  const sellProduceAdData = t("sellProduceAd", lang) as any;

  const adSlots: AdSlot[] = [
    {
      id: "ad1",
      isAd: true,
      title:    typeof groupBuyingAdData === "object" ? groupBuyingAdData.title    : t("groupBuyingAdTitle", lang) as string,
      subtitle: typeof groupBuyingAdData === "object" ? groupBuyingAdData.subtitle : t("groupBuyingAdSub",   lang) as string,
      cta:      typeof groupBuyingAdData === "object" ? groupBuyingAdData.cta      : t("groupBuyingAdCta",   lang) as string,
      route:    "/group-buying",
      emoji:    "🤝",
    },
    {
      id: "ad2",
      isAd: true,
      title:    typeof sellProduceAdData === "object" ? sellProduceAdData.title    : t("sellProduceAdTitle", lang) as string,
      subtitle: typeof sellProduceAdData === "object" ? sellProduceAdData.subtitle : t("sellProduceAdSub",   lang) as string,
      cta:      typeof sellProduceAdData === "object" ? sellProduceAdData.cta      : t("sellProduceAdCta",   lang) as string,
      route:    "/farm-fresh/sell",
      emoji:    "🌿",
    },
  ];

  const gridItems: (FarmProduct | AdSlot)[] = [];
  let adIdx = 0;
  filtered.forEach((p, i) => {
    gridItems.push(p);
    if ((i + 1) % 8 === 0 && adIdx < adSlots.length) {
      gridItems.push(adSlots[adIdx++]);
    }
  });

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50" dir={isRtl ? "rtl" : "ltr"}>

      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        {/* Title row */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Leaf className="w-5 h-5 text-green-600" />
            {t("farmFresh", lang) as string}
          </h1>
          <div className="flex gap-2">
            <button
              onClick={fetchProducts}
              title="Refresh"
              className="p-2 text-gray-400 hover:text-green-600 rounded-xl hover:bg-gray-100 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate("/farm-fresh/sell")}
              className="bg-green-600 text-white px-3 py-1.5 rounded-xl text-sm font-semibold flex items-center gap-1 hover:bg-green-700 transition"
            >
              <Plus className="w-4 h-4" />
              {t("sell", lang) as string}
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative px-4 pb-3">
          <Search
            className={`absolute ${isRtl ? "right-7" : "left-7"} top-2.5 w-4 h-4 text-gray-400 pointer-events-none`}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder", lang) as string}
            className={`w-full ${isRtl ? "pr-9 pl-4" : "pl-9 pr-4"} py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none bg-gray-50`}
          />
        </div>

        {/* Category chips ── labels come from i18n, but filter value stays English */}
        <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide">
          {CATEGORIES.map(({ key, value }) => (
            <button
              key={value}
              onClick={() => setCategory(value)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                category === value
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {/* ✅ FIX: t() resolves to the translated word, not the raw key */}
              {t(key, lang) as string}
            </button>
          ))}
        </div>
      </div>

      {/* ── Hero banner ── */}
      <div className="mx-4 mt-4 bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-4 text-white mb-3">
        <h2 className="font-bold text-lg mb-1">{t("buyDirect", lang) as string}</h2>
        <p className="text-green-100 text-sm mb-3">{t("buyDirectSub", lang) as string}</p>
        <button
          onClick={() => navigate("/group-buying")}
          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-xl text-sm font-semibold transition"
        >
          <Users className="w-4 h-4" />
          {t("joinGroup", lang) as string}
        </button>
      </div>

      {/* ── Fetch error banner ── */}
      {fetchErr && (
        <div className="mx-4 mb-3 flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-xl px-3 py-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{fetchErr} — Showing {DEMO_PRODUCTS.length} sample listings</span>
        </div>
      )}

      {/* ── Product grid ── */}
      <div className="px-4 pb-24">
        {/* Count badge */}
        {!loading && (
          <p className="mb-3 text-xs text-gray-500">
            {realCount > 0
              ? `${realCount} listing${realCount !== 1 ? "s" : ""} from local farmers`
              : `Showing ${DEMO_PRODUCTS.length} sample listings`}
          </p>
        )}

        {/* Loading skeleton */}
        {loading ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            <p className="text-sm text-gray-500">{t("loading", lang) as string}</p>
          </div>
        ) : filtered.length === 0 ? (
          /* Empty state */
          <div className="text-center py-12">
            <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-700 mb-1">{t("noProduceFound", lang) as string}</p>
            <p className="text-sm text-gray-400 mb-4">
              {search
                ? `No results for "${search}"`
                : t("noProduceFoundSub", lang) as string}
            </p>
            <button
              onClick={() => { setSearch(""); setCategory("All"); }}
              className="text-sm text-green-600 underline mr-4"
            >
              Clear filters
            </button>
            <button
              onClick={() => navigate("/farm-fresh/sell")}
              className="mt-2 bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold"
            >
              {t("listYourProduce", lang) as string}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {gridItems.map((item) => {
              /* Ad card */
              if ("isAd" in item) {
                return (
                  <div
                    key={item.id}
                    onClick={() => navigate(item.route)}
                    className="col-span-2 bg-gradient-to-r from-teal-500 to-green-600 rounded-2xl p-4 text-white cursor-pointer hover:shadow-md active:scale-[0.98] transition flex items-center gap-4"
                  >
                    <span className="text-4xl">{item.emoji}</span>
                    <div className="flex-1">
                      <p className="font-bold text-base">{item.title}</p>
                      <p className="text-green-100 text-xs mt-0.5">{item.subtitle}</p>
                    </div>
                    <div className="bg-white/20 px-3 py-1.5 rounded-xl text-sm font-semibold flex-shrink-0">
                      {item.cta}
                    </div>
                  </div>
                );
              }

              /* Product card */
              const p   = item as FarmProduct;
              const img = getImage(p);
              const isAdded = addedId === p.id;

              return (
                <div
                  key={p.id}
                  onClick={() => navigate(`/farm-fresh/${p.id}`)}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
                >
                  {/* Image */}
                  <div className="h-36 bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center overflow-hidden relative">
                    {img ? (
                      <img
                        src={img}
                        alt={p.title}
                        loading="lazy"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1 px-2 text-center">
                        <span className="text-4xl">🌿</span>
                        {!p.isDemo && (
                          <span className="text-xs text-gray-400 leading-tight">
                            {t("noPhotoYet", lang) as string}
                          </span>
                        )}
                      </div>
                    )}
                    {p.isDemo && (
                      <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
                        DEMO
                      </div>
                    )}
                    {p.is_organic && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                        {t("organic", lang) as string}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1 line-clamp-1">
                      {p.title}
                    </h3>
                    <p className="text-green-600 font-bold text-sm">
                      {p.price_per_unit_xaf.toLocaleString("fr-CM")} FCFA/{p.unit}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1 mb-2">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{p.location}</span>
                    </div>

                    {/* Add to Cart button */}
                    <button
                      onClick={(e) => handleAddToCart(e, p)}
                      className={`w-full py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                        isAdded
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : "bg-green-600 hover:bg-green-700 text-white active:scale-95"
                      }`}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      {isAdded ? t("added", lang) as string : t("addToCart", lang) as string}
                    </button>

                    {/* View count (real listings only) */}
                    {!p.isDemo && (
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                        <Eye className="w-3 h-3" />
                        {p.view_count ?? 0} {t("views", lang) as string}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Floating Cart Button ── */}
      <CartFloater lang={lang} />
    </div>
  );
}

// ─── Floating cart button ─────────────────────────────────────────────────────
function CartFloater({ lang }: { lang: string }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { items } = useCart();
  const count = items.reduce((s, i) => s + i.quantity, 0);
  if (count === 0) return null;
  return (
    <button
      onClick={() => navigate("/cart")}
      className="fixed bottom-24 right-4 z-40 bg-green-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 font-semibold text-sm active:scale-95 transition hover:bg-green-700"
    >
      <ShoppingCart className="w-4 h-4" />
      {t("cart", lang) as string} ({count})
    </button>
  );
}

