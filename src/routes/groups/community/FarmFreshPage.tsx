// BAMBEH_DEPLOY_TOKEN__FARMFRESHPAGE_FIX405_CLEAN
/**
 * src/routes/groups/community/FarmFreshPage.tsx - Bambeh Marketplace
 *
 * FIX405: this page called t("buyDirect"), t("joinGroup"), t("noProduceFound")
 * and 22 other keys against the SHARED LANG_STRINGS table. Any key missing
 * from fr/pidgin/ar/ff silently fell back to English, which is why Big saw
 * "Buy Direct", "Join Group" and "0 listings from local farmers" in every
 * language. Three strings were not even going through t(): the listing
 * counter, "No results for ..." and "Clear filters" were plain English in
 * the JSX.
 *
 * The cure is a LOCAL five-language table. This page no longer depends on
 * any shared dictionary, so a missing key elsewhere can never make it fall
 * back to English again.
 *  - all 5 languages: en / fr / pidgin / ar / ff
 *  - category chips translate; the FILTER VALUE stays the English DB string
 *  - RTL for Arabic, translate="no" against Chrome auto-translate
 *  - pure \u escapes, so no encoding step can break the accents
 *
 * Data layer UNCHANGED from FIX105: real farm_products rows only, photos
 * first, realtime INSERT subscription, add-to-cart, view counts.
 * (c) 2025-2026 BAMBEH SARL. All rights reserved.
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Leaf, Search, Plus, MapPin, Loader2, RefreshCw,
  ShoppingBag, ShoppingCart, Users, Eye, AlertCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/components/CartDrawer";
import { useLanguage } from '@/App';

// --- Types --------------------------------------------------------------------
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

// FIX105: demo/sample products removed - Farm Fresh shows real listings only.

const T = {
  en: {
    farmFresh: "Farm Fresh",
    sell: "Sell",
    refresh: "Refresh",
    searchPlaceholder: "Search produce, farmer or town...",
    catAll: "All",
    catVegetables: "Vegetables",
    catFruits: "Fruits",
    catTubers: "Tubers",
    catGrains: "Grains",
    catLegumes: "Legumes",
    catHerbs: "Herbs",
    catDairy: "Dairy",
    buyDirect: "Buy straight from the farmer",
    buyDirectSub: "No middleman. Fresher food, fairer prices, for both of you.",
    joinGroup: "Join a group order",
    listingOne: "listing from local farmers",
    listingMany: "listings from local farmers",
    loading: "Loading produce...",
    noProduceFound: "Nothing here yet",
    noProduceFoundSub: "No farmer has listed produce in this category yet. Be the first.",
    noResultsFor: "No results for",
    clearFilters: "Clear filters",
    listYourProduce: "List your produce",
    noPhotoYet: "No photo yet",
    organic: "Organic",
    addToCart: "Add to cart",
    added: "Added",
    views: "views",
    cart: "Cart",
    error: "Could not load produce. Check your connection and try again.",
    gbTitle: "Buy together, pay less",
    gbSub: "Team up with other buyers to unlock a lower price",
    gbCta: "See group deals",
    spTitle: "Are you a farmer?",
    spSub: "List what you harvest and sell it straight to buyers",
    spCta: "Start selling",
  },
  fr: {
    farmFresh: "Produits de la ferme",
    sell: "Vendre",
    refresh: "Actualiser",
    searchPlaceholder: "Rechercher un produit, un agriculteur ou une ville...",
    catAll: "Tout",
    catVegetables: "L\u00e9gumes",
    catFruits: "Fruits",
    catTubers: "Tubercules",
    catGrains: "C\u00e9r\u00e9ales",
    catLegumes: "L\u00e9gumineuses",
    catHerbs: "Herbes",
    catDairy: "Produits laitiers",
    buyDirect: "Achetez directement \u00e0 l'agriculteur",
    buyDirectSub: "Sans interm\u00e9diaire. Des produits plus frais et un prix plus juste, pour vous deux.",
    joinGroup: "Rejoindre un achat group\u00e9",
    listingOne: "annonce d'agriculteurs locaux",
    listingMany: "annonces d'agriculteurs locaux",
    loading: "Chargement des produits...",
    noProduceFound: "Rien ici pour le moment",
    noProduceFoundSub: "Aucun agriculteur n'a encore publi\u00e9 dans cette cat\u00e9gorie. Soyez le premier.",
    noResultsFor: "Aucun r\u00e9sultat pour",
    clearFilters: "Effacer les filtres",
    listYourProduce: "Publier vos produits",
    noPhotoYet: "Pas encore de photo",
    organic: "Bio",
    addToCart: "Ajouter au panier",
    added: "Ajout\u00e9",
    views: "vues",
    cart: "Panier",
    error: "Impossible de charger les produits. V\u00e9rifiez votre connexion et r\u00e9essayez.",
    gbTitle: "Achetez ensemble, payez moins",
    gbSub: "Regroupez-vous avec d'autres acheteurs pour un meilleur prix",
    gbCta: "Voir les offres group\u00e9es",
    spTitle: "Vous \u00eates agriculteur ?",
    spSub: "Publiez votre r\u00e9colte et vendez directement aux acheteurs",
    spCta: "Commencer \u00e0 vendre",
  },
  pidgin: {
    farmFresh: "Farm Fresh",
    sell: "Sell",
    refresh: "Refresh am",
    searchPlaceholder: "Find food, farmer or town...",
    catAll: "All",
    catVegetables: "Vegetable",
    catFruits: "Fruit",
    catTubers: "Tuber",
    catGrains: "Grain",
    catLegumes: "Beans",
    catHerbs: "Herb",
    catDairy: "Milk thing",
    buyDirect: "Buy straight from the farmer",
    buyDirectSub: "No middleman. Food dey fresh, price dey correct for both of una.",
    joinGroup: "Join group order",
    listingOne: "thing weh local farmer put",
    listingMany: "things weh local farmers put",
    loading: "Food dey load...",
    noProduceFound: "Nothing dey here yet",
    noProduceFoundSub: "No farmer never put anything for this category. Make you be the first.",
    noResultsFor: "Nothing match",
    clearFilters: "Clear the filter",
    listYourProduce: "Put your own produce",
    noPhotoYet: "Photo never dey",
    organic: "Organic",
    addToCart: "Put for cart",
    added: "E don enter",
    views: "people see am",
    cart: "Cart",
    error: "We no fit load the food. Check your network then try again.",
    gbTitle: "Buy together, pay small",
    gbSub: "Join other buyers make price come down",
    gbCta: "See group deals",
    spTitle: "You be farmer?",
    spSub: "Put wetin you harvest, sell am straight to buyers",
    spCta: "Start to sell",
  },
  ar: {
    farmFresh: "\u0645\u0646\u062a\u062c\u0627\u062a \u0627\u0644\u0645\u0632\u0631\u0639\u0629",
    sell: "\u0628\u064a\u0639",
    refresh: "\u062a\u062d\u062f\u064a\u062b",
    searchPlaceholder: "\u0627\u0628\u062d\u062b \u0639\u0646 \u0645\u0646\u062a\u062c \u0623\u0648 \u0645\u0632\u0627\u0631\u0639 \u0623\u0648 \u0645\u062f\u064a\u0646\u0629...",
    catAll: "\u0627\u0644\u0643\u0644",
    catVegetables: "\u062e\u0636\u0631\u0648\u0627\u062a",
    catFruits: "\u0641\u0648\u0627\u0643\u0647",
    catTubers: "\u062f\u0631\u0646\u0627\u062a",
    catGrains: "\u062d\u0628\u0648\u0628",
    catLegumes: "\u0628\u0642\u0648\u0644\u064a\u0627\u062a",
    catHerbs: "\u0623\u0639\u0634\u0627\u0628",
    catDairy: "\u0623\u0644\u0628\u0627\u0646",
    buyDirect: "\u0627\u0634\u062a\u0631 \u0645\u0628\u0627\u0634\u0631\u0629 \u0645\u0646 \u0627\u0644\u0645\u0632\u0627\u0631\u0639",
    buyDirectSub: "\u0628\u0644\u0627 \u0648\u0633\u064a\u0637. \u0637\u0639\u0627\u0645 \u0623\u0637\u0632\u062c \u0648\u0633\u0639\u0631 \u0623\u0639\u062f\u0644 \u0644\u0643\u0644\u064a\u0643\u0645\u0627.",
    joinGroup: "\u0627\u0646\u0636\u0645 \u0625\u0644\u0649 \u0637\u0644\u0628 \u062c\u0645\u0627\u0639\u064a",
    listingOne: "\u0625\u0639\u0644\u0627\u0646 \u0645\u0646 \u0645\u0632\u0627\u0631\u0639\u064a\u0646 \u0645\u062d\u0644\u064a\u064a\u0646",
    listingMany: "\u0625\u0639\u0644\u0627\u0646\u0627\u062a \u0645\u0646 \u0645\u0632\u0627\u0631\u0639\u064a\u0646 \u0645\u062d\u0644\u064a\u064a\u0646",
    loading: "\u062c\u0627\u0631\u064a \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a...",
    noProduceFound: "\u0644\u0627 \u064a\u0648\u062c\u062f \u0634\u064a\u0621 \u0647\u0646\u0627 \u0628\u0639\u062f",
    noProduceFoundSub: "\u0644\u0645 \u064a\u0646\u0634\u0631 \u0623\u064a \u0645\u0632\u0627\u0631\u0639 \u0641\u064a \u0647\u0630\u0647 \u0627\u0644\u0641\u0626\u0629 \u0628\u0639\u062f. \u0643\u0646 \u0627\u0644\u0623\u0648\u0644.",
    noResultsFor: "\u0644\u0627 \u0646\u062a\u0627\u0626\u062c \u0644\u0640",
    clearFilters: "\u0645\u0633\u062d \u0639\u0648\u0627\u0645\u0644 \u0627\u0644\u062a\u0635\u0641\u064a\u0629",
    listYourProduce: "\u0627\u0646\u0634\u0631 \u0645\u0646\u062a\u062c\u0627\u062a\u0643",
    noPhotoYet: "\u0644\u0627 \u062a\u0648\u062c\u062f \u0635\u0648\u0631\u0629 \u0628\u0639\u062f",
    organic: "\u0639\u0636\u0648\u064a",
    addToCart: "\u0623\u0636\u0641 \u0625\u0644\u0649 \u0627\u0644\u0633\u0644\u0629",
    added: "\u062a\u0645\u062a \u0627\u0644\u0625\u0636\u0627\u0641\u0629",
    views: "\u0645\u0634\u0627\u0647\u062f\u0629",
    cart: "\u0627\u0644\u0633\u0644\u0629",
    error: "\u062a\u0639\u0630\u0631 \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a. \u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u062a\u0635\u0627\u0644\u0643 \u0648\u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.",
    gbTitle: "\u0627\u0634\u062a\u0631\u0648\u0627 \u0645\u0639\u0627 \u0648\u0627\u062f\u0641\u0639\u0648\u0627 \u0623\u0642\u0644",
    gbSub: "\u0627\u0646\u0636\u0645 \u0625\u0644\u0649 \u0645\u0634\u062a\u0631\u064a\u0646 \u0622\u062e\u0631\u064a\u0646 \u0644\u0644\u062d\u0635\u0648\u0644 \u0639\u0644\u0649 \u0633\u0639\u0631 \u0623\u0642\u0644",
    gbCta: "\u0634\u0627\u0647\u062f \u0627\u0644\u0639\u0631\u0648\u0636 \u0627\u0644\u062c\u0645\u0627\u0639\u064a\u0629",
    spTitle: "\u0647\u0644 \u0623\u0646\u062a \u0645\u0632\u0627\u0631\u0639\u061f",
    spSub: "\u0627\u0646\u0634\u0631 \u0645\u062d\u0635\u0648\u0644\u0643 \u0648\u0628\u0639\u0647 \u0645\u0628\u0627\u0634\u0631\u0629 \u0644\u0644\u0645\u0634\u062a\u0631\u064a\u0646",
    spCta: "\u0627\u0628\u062f\u0623 \u0627\u0644\u0628\u064a\u0639",
  },
  ff: {
    farmFresh: "Ndema Kesa",
    sell: "Yeeyu",
    refresh: "Hes\u0257itin",
    searchPlaceholder: "Yiylo ge\u0257al, demoowo walla wuro...",
    catAll: "Fof",
    catVegetables: "Ledde \u00f1aametee",
    catFruits: "\u0181i\u0253\u0253e le\u0257\u0257e",
    catTubers: "\u018aakkeeje",
    catGrains: "Gawri",
    catLegumes: "\u00d1ebbe",
    catHerbs: "Hu\u0257o",
    catDairy: "Kosam",
    buyDirect: "Soodu e juu\u0257e demoowo",
    buyDirectSub: "Hakkunde alaa. \u00d1aametee kesum e coggu feewngu, e mon \u0257i\u0257o fof.",
    joinGroup: "Naatu e coodgol dental",
    listingOne: "bayyinaango demoo\u0253e wuro",
    listingMany: "bayyinaali demoo\u0253e wuro",
    loading: "Ge\u0257e ina loowee...",
    noProduceFound: "Huunde alaa \u0257oo tawo",
    noProduceFoundSub: "Demoowo alaa bayyinnoo\u0257o e ndee leggal tawo. Wonu gadano.",
    noResultsFor: "Alaa ko nanndi e",
    clearFilters: "Momtu ceerndugol",
    listYourProduce: "Bayyin ko ndem-\u0257aa",
    noPhotoYet: "Nate alaa tawo",
    organic: "Ndema laa\u0253ndam",
    addToCart: "Naatnu e panyee",
    added: "Naatii",
    views: "ndaaroo\u0253e",
    cart: "Panyee",
    error: "Min mbaawaa loowde ge\u0257e. \u01b3eewto seede maa ndeen eto kadi.",
    gbTitle: "Soodee dental, njo\u0253on see\u0257a",
    gbSub: "Naatu e coodoo\u0253e go\u0257\u0253e ngam ustude coggu",
    gbCta: "Ndaar coggu dental",
    spTitle: "Ada wona demoowo?",
    spSub: "Bayyin ko so\u00f1-\u0257aa, njeeyaa e juu\u0257e coodoo\u0253e",
    spCta: "Fu\u0257\u0257o yeeyde",
  },
};

type TL = typeof T.en;

function pickLang(raw?: string): string {
  if (raw === 'fulfulde' || raw === 'ful') return 'ff';
  if (raw === 'pcm' || raw === 'pidgin_english') return 'pidgin';
  return raw ?? 'en';
}

// --- Category definitions -----------------------------------------------------
// Key = i18n key -> used to get translated label
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

// --- Helpers ------------------------------------------------------------------
function getImage(p: FarmProduct): string {
  return p.image_url || p.images?.[0] || "";
}
function hasImage(p: FarmProduct): boolean {
  return !!(p.image_url?.trim() || p.images?.[0]?.trim());
}

// --- Main Component ------------------------------------------------------------
export default function FarmFreshPage() {
  const navigate    = useNavigate();
  const { addToCart } = useCart();
  const { language: lang } = useLanguage();
  const langKey = pickLang(lang as string);
  const tt: TL  = (T as Record<string, TL>)[langKey] ?? T.en;
  const isRtl   = langKey === "ar";

  const [products,  setProducts]  = useState<FarmProduct[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [fetchErr,  setFetchErr]  = useState<string | null>(null);
  const [search,    setSearch]    = useState("");
  const [category,  setCategory]  = useState("All");   // always the English DB value
  const [addedId,   setAddedId]   = useState<string | null>(null);

  // -- Fetch from Supabase ---------------------------------------------------
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

      // FIX105: real products only - photos first, then without photos
      const realWithPhoto    = realItems.filter(hasImage);
      const realWithoutPhoto = realItems.filter((p) => !hasImage(p));

      setProducts([...realWithPhoto, ...realWithoutPhoto]);
    } catch {
      setFetchErr(tt.error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  // -- Realtime subscription -------------------------------------------------
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

  // -- Add to cart -----------------------------------------------------------
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

  // -- Filtering -------------------------------------------------------------
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

  // -- Interleaved ad slots --------------------------------------------------
  const adSlots: AdSlot[] = [
    { id: "ad1", isAd: true, title: tt.gbTitle, subtitle: tt.gbSub, cta: tt.gbCta,
      route: "/group-buying", emoji: "\u{1F91D}" },
    { id: "ad2", isAd: true, title: tt.spTitle, subtitle: tt.spSub, cta: tt.spCta,
      route: "/farm-fresh/sell", emoji: "\u{1F33F}" },
  ];

  const gridItems: (FarmProduct | AdSlot)[] = [];
  let adIdx = 0;
  filtered.forEach((p, i) => {
    gridItems.push(p);
    if ((i + 1) % 8 === 0 && adIdx < adSlots.length) {
      gridItems.push(adSlots[adIdx++]);
    }
  });

  // -- Render ----------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 notranslate" translate="no" dir={isRtl ? "rtl" : "ltr"}>

      {/* -- Sticky header -- */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        {/* Title row */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Leaf className="w-5 h-5 text-green-600" />
            {tt.farmFresh}
          </h1>
          <div className="flex gap-2">
            <button
              onClick={fetchProducts}
              title={tt.refresh}
              className="p-2 text-gray-400 hover:text-green-600 rounded-xl hover:bg-gray-100 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate("/farm-fresh/sell")}
              className="bg-green-600 text-white px-3 py-1.5 rounded-xl text-sm font-semibold flex items-center gap-1 hover:bg-green-700 transition"
            >
              <Plus className="w-4 h-4" />
              {tt.sell}
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
            placeholder={tt.searchPlaceholder}
            className={`w-full ${isRtl ? "pr-9 pl-4" : "pl-9 pr-4"} py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none bg-gray-50`}
          />
        </div>

        {/* Category chips -- labels come from i18n, but filter value stays English */}
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
              {/*  FIX: t() resolves to the translated word, not the raw key */}
              {(tt as Record<string, string>)[key] ?? key}
            </button>
          ))}
        </div>
      </div>

      {/* -- Hero banner -- */}
      <div className="mx-4 mt-4 bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-4 text-white mb-3">
        <h2 className="font-bold text-lg mb-1">{tt.buyDirect}</h2>
        <p className="text-green-100 text-sm mb-3">{tt.buyDirectSub}</p>
        <button
          onClick={() => navigate("/group-buying")}
          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-xl text-sm font-semibold transition"
        >
          <Users className="w-4 h-4" />
          {tt.joinGroup}
        </button>
      </div>

      {/* -- Fetch error banner -- */}
      {fetchErr && (
        <div className="mx-4 mb-3 flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-xl px-3 py-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{fetchErr}</span>
        </div>
      )}

      {/* -- Product grid -- */}
      <div className="px-4 pb-24">
        {/* Count badge */}
        {!loading && (
          <p className="mb-3 text-xs text-gray-500">
            {realCount} {realCount === 1 ? tt.listingOne : tt.listingMany}
          </p>
        )}

        {/* Loading skeleton */}
        {loading ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            <p className="text-sm text-gray-500">{tt.loading}</p>
          </div>
        ) : filtered.length === 0 ? (
          /* Empty state */
          <div className="text-center py-12">
            <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-700 mb-1">{tt.noProduceFound}</p>
            <p className="text-sm text-gray-400 mb-4">
              {search
                ? `${tt.noResultsFor} "${search}"`
                : tt.noProduceFoundSub}
            </p>
            <button
              onClick={() => { setSearch(""); setCategory("All"); }}
              className="text-sm text-green-600 underline mr-4"
            >
              {tt.clearFilters}
            </button>
            <button
              onClick={() => navigate("/farm-fresh/sell")}
              className="mt-2 bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold"
            >
              {tt.listYourProduce}
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
                        <span className="text-4xl">{"\u{1F33F}"}</span>
                        {!p.isDemo && (
                          <span className="text-xs text-gray-400 leading-tight">
                            {tt.noPhotoYet}
                          </span>
                        )}
                      </div>
                    )}
                    {p.is_organic && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                        {tt.organic}
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
                      {isAdded ? tt.added : tt.addToCart}
                    </button>

                    {/* View count (real listings only) */}
                    {!p.isDemo && (
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                        <Eye className="w-3 h-3" />
                        {p.view_count ?? 0} {tt.views}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* -- Floating Cart Button -- */}
      <CartFloater lang={langKey} />
    </div>
  );
}

// --- Floating cart button -----------------------------------------------------
function CartFloater({ lang }: { lang: string }) {
  const tt: TL = (T as Record<string, TL>)[pickLang(lang)] ?? T.en;
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
      {tt.cart} ({count})
    </button>
  );
}









// BAMBEH_END_TOKEN__FARMFRESHPAGE_FIX405__COMPLETE
