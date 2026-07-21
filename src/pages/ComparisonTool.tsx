// BAMBEH_DEPLOY_TOKEN__COMPARISONTOOL_FIX163_CLEAN
/**
 * src/pages/ComparisonTool.tsx ? Bambeh Marketplace
 *
 * FIXES applied:
 *  ? Real internet search via Anthropic API (web_search tool) ? shows live prices & specs
 *  ? localStorage read uses try/catch; malformed JSON never crashes the page
 *  ? "Add Product" picker now has a "Search Online" mode that queries real market data
 *  ? Score bars normalised correctly (sellerRating is /5, others are /100)
 *  ? bestPrice / bestRating / bestValue return null when < 2 products (was already ok, kept)
 *  ? Table header width fixed ? no longer overflows on 3-product view
 *  ? Source attribution shown for AI-fetched data (verifiable link)
 *  ? Loading skeleton while AI search is running
 *  ? Error boundary around AI call ? fallback to manual entry on failure
 *  ? "Clear all" button added
 *  ? Accessible: buttons have aria-labels, table has proper scope attributes
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, X, Check, Star, TrendingUp, ShoppingCart,
  Search, Loader2, Globe, AlertCircle, RefreshCw,
} from 'lucide-react';
import { useLang, t } from "@/hooks/useAppLang";
import { supabase } from "@/lib/supabase"; // FIX163

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  rating: number;
  reviews: number;
  seller: string;
  location: string;
  specs: Record<string, string>;
  pros: string[];
  cons: string[];
  valueScore: number;
  qualityScore: number;
  sellerRating: number;
  source?: string;
  sourceLabel?: string;
  fetchedAt?: number;
}

const COPY = {
  en: {
    compareProducts: 'Compare Products',
    clearAll: 'Clear all',
    addProduct: 'Add Product',
    addAtLeastTwo: 'Add at least 2 products to compare',
    addProducts: 'Add Products',
    searchOnline: 'Search Online (Live Prices)',
    searchOnlineBtn: 'Search Online for Live Prices',
    searchOnlinePlaceholder: 'e.g. Samsung Galaxy A54 price Cameroon',
    searchProductOnline: 'Search product online',
    search: 'Search',
    closeOnlineSearch: 'Close online search',
    closePicker: 'Close picker',
    loadingLivePrices: 'Searching the web for live prices...',
    couldNotReachServer: 'Could not reach the server. Check your internet connection.',
    noResultsFoundDifferent: 'No results found. Try a different search term.',
    noResultsFound: 'No results found',
    sources: 'Sources:',
    addAProductToCompare: 'Add a product to compare',
    searchFromBambeh: 'Search from Bambeh listings...',
    noLocalProductsFound: 'No local products found',
    scoreComparison: 'Score Comparison',
    specifications: 'Specifications',
    spec: 'Spec',
    bestPrice: 'Best Price',
    topRated: 'Top Rated',
    bestValue: 'Best Value',
    onlinePricesNotice:
      'Online prices are fetched live and may differ from final vendor pricing. Always verify before purchasing.',
    removeProduct: (name: string) => `Remove ${name}`,
    goBack: 'Go back',
    searchLocalProducts: 'Search local products',
    clearAllProducts: 'Clear all products',
  },
  fr: {
    compareProducts: 'Comparer les produits',
    clearAll: 'Tout effacer',
    addProduct: 'Ajouter un produit',
    addAtLeastTwo: 'Ajoutez au moins 2 produits pour comparer',
    addProducts: 'Ajouter des produits',
    searchOnline: 'Recherche en ligne (prix en direct)',
    searchOnlineBtn: 'Rechercher les prix en direct en ligne',
    searchOnlinePlaceholder: 'ex. prix Samsung Galaxy A54 Cameroun',
    searchProductOnline: 'Rechercher un produit en ligne',
    search: 'Rechercher',
    closeOnlineSearch: 'Fermer la recherche en ligne',
    closePicker: 'Fermer le sélecteur',
    loadingLivePrices: 'Recherche des prix en direct sur le web...',
    couldNotReachServer: "Impossible d'atteindre le serveur. Vérifiez votre connexion Internet.",
    noResultsFoundDifferent: 'Aucun résultat trouvé. Essayez un autre terme de recherche.',
    noResultsFound: 'Aucun résultat trouvé',
    sources: 'Sources :',
    addAProductToCompare: 'Ajouter un produit à comparer',
    searchFromBambeh: 'Rechercher dans les annonces Bambeh...',
    noLocalProductsFound: 'Aucun produit local trouvé',
    scoreComparison: 'Comparaison des scores',
    specifications: 'Caractéristiques',
    spec: 'Caract.',
    bestPrice: 'Meilleur prix',
    topRated: 'Mieux noté',
    bestValue: 'Meilleur rapport qualité-prix',
    onlinePricesNotice:
      'Les prix en ligne sont récupérés en direct et peuvent différer du tarif final du vendeur. Vérifiez toujours avant d’acheter.',
    removeProduct: (name: string) => `Supprimer ${name}`,
    goBack: 'Retour',
    searchLocalProducts: 'Rechercher des produits locaux',
    clearAllProducts: 'Effacer tous les produits',
  },
  ar: {
    compareProducts: 'مقارنة المنتجات',
    clearAll: 'مسح الكل',
    addProduct: 'إضافة منتج',
    addAtLeastTwo: 'أضف منتجين على الأقل للمقارنة',
    addProducts: 'إضافة منتجات',
    searchOnline: 'بحث عبر الإنترنت (أسعار مباشرة)',
    searchOnlineBtn: 'البحث عن الأسعار المباشرة عبر الإنترنت',
    searchOnlinePlaceholder: 'مثال: سعر Samsung Galaxy A54 في الكاميرون',
    searchProductOnline: 'ابحث عن المنتج عبر الإنترنت',
    search: 'بحث',
    closeOnlineSearch: 'إغلاق البحث عبر الإنترنت',
    closePicker: 'إغلاق النافذة',
    loadingLivePrices: 'جارٍ البحث في الويب عن الأسعار المباشرة...',
    couldNotReachServer: 'تعذر الوصول إلى الخادم. تحقق من اتصالك بالإنترنت.',
    noResultsFoundDifferent: 'لم يتم العثور على نتائج. جرّب عبارة بحث مختلفة.',
    noResultsFound: 'لم يتم العثور على نتائج',
    sources: 'المصادر:',
    addAProductToCompare: 'أضف منتجًا للمقارنة',
    searchFromBambeh: 'ابحث ضمن إعلانات Bambeh...',
    noLocalProductsFound: 'لم يتم العثور على منتجات محلية',
    scoreComparison: 'مقارنة التقييمات',
    specifications: 'المواصفات',
    spec: 'المواصفة',
    bestPrice: 'أفضل سعر',
    topRated: 'الأعلى تقييمًا',
    bestValue: 'أفضل قيمة',
    onlinePricesNotice:
      'يتم جلب الأسعار عبر الإنترنت مباشرة وقد تختلف عن السعر النهائي لدى البائع. تحقق دائمًا قبل الشراء.',
    removeProduct: (name: string) => `إزالة ${name}`,
    goBack: 'رجوع',
    searchLocalProducts: 'البحث عن منتجات محلية',
    clearAllProducts: 'مسح جميع المنتجات',
  },
  pidgin: {
    compareProducts: 'Compare products',
    clearAll: 'Clear all',
    addProduct: 'Add product',
    addAtLeastTwo: 'Add at least 2 products make we compare',
    addProducts: 'Add products',
    searchOnline: 'Search Online (Live Prices)',
    searchOnlineBtn: 'Search online for live prices',
    searchOnlinePlaceholder: 'e.g. Samsung Galaxy A54 price Cameroon',
    searchProductOnline: 'Search product online',
    search: 'Search',
    closeOnlineSearch: 'Close online search',
    closePicker: 'Close picker',
    loadingLivePrices: 'Dey search the web for live prices...',
    couldNotReachServer: 'We no fit reach the server. Check your internet connection.',
    noResultsFoundDifferent: 'No result. Try another search word.',
    noResultsFound: 'No results found',
    sources: 'Sources:',
    addAProductToCompare: 'Add product to compare',
    searchFromBambeh: 'Search from Bambeh listings...',
    noLocalProductsFound: 'No local products found',
    scoreComparison: 'Score comparison',
    specifications: 'Specifications',
    spec: 'Spec',
    bestPrice: 'Best price',
    topRated: 'Top rated',
    bestValue: 'Best value',
    onlinePricesNotice:
      'Online prices dey come live and fit no match final seller price. Always verify before you buy.',
    removeProduct: (name: string) => `Remove ${name}`,
    goBack: 'Go back',
    searchLocalProducts: 'Search local products',
    clearAllProducts: 'Clear all products',
  },
  ful: {
    compareProducts: 'Nana heɓugol ceŋol',
    clearAll: 'Momtu fuu',
    addProduct: 'Añdu hoto',
    addAtLeastTwo: 'Añdu ko 2 hoto e ɓuri ngam ceŋol',
    addProducts: 'Añdu hotoɓe',
    searchOnline: 'Yiylo e internet (priis ɗi haani)',
    searchOnlineBtn: 'Yiylo priis ɗi haani e internet',
    searchOnlinePlaceholder: 'misal: priis Samsung Galaxy A54 Cameroon',
    searchProductOnline: 'Yiylo hoto e internet',
    search: 'Yiylo',
    closeOnlineSearch: 'Suumde yiylugo internet',
    closePicker: 'Suumde cuɓoraaɗe',
    loadingLivePrices: 'Dey yiylugo internet ngam priis ɗi haani...',
    couldNotReachServer: 'Mi waawi alaa naatde to sarver. Ƴeewto internet maa.',
    noResultsFoundDifferent: 'Alaa natnude. Ƴeewto aadi goɗɗo.',
    noResultsFound: 'Alaa natnude',
    sources: 'Moolere:',
    addAProductToCompare: 'Añdu hoto ngam ceŋol',
    searchFromBambeh: 'Yiylo e listi Bambeh...',
    noLocalProductsFound: 'Alaa hoto lokal',
    scoreComparison: 'Ceŋol noddowka',
    specifications: 'Nanaaji',
    spec: 'Nanaa',
    bestPrice: 'Priis ɓuri',
    topRated: 'Nodditaaɗo ɓuri',
    bestValue: 'Kadi ɗum ɓuri',
    onlinePricesNotice:
      'Priis ɗi internet ɗe ummii jooni e ɗum wanaa ko kadi seller waɗi. Ƴeewto wonde ɗi laaɓi ɓuri ɗum feere.',
    removeProduct: (name: string) => `Momtu ${name}`,
    goBack: 'Rutto',
    searchLocalProducts: 'Yiylo hoto lokal',
    clearAllProducts: 'Momtu hotoɓe fuu',
  },
};

// FIX163: SAMPLE demo products (Samsung/Tecno with fabricated ratings) REMOVED.
// Real Bambeh products now load from the live `listings` table below.

// FIX97: AI calls now go to the Supabase 'ai' Edge Function (Railway is dead)
const BACKEND_URL =
  (import.meta as { env?: Record<string, string> }).env?.VITE_AI_BACKEND_URL ||
  'https://rbjbdxefwzvgmioearie.supabase.co/functions/v1/ai';

async function searchProductOnline(query: string): Promise<{
  products: Product[];
  sources: { label: string; url: string }[];
  error?: string;
}> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/ai/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) throw new Error(`Backend ${res.status}`);
    const data = await res.json();

    if (Array.isArray(data.products) && data.products.length > 0) {
      return { products: data.products, sources: data.sources || [] };
    }
    throw new Error('No products returned');
  } catch (err) {
    return { products: [], sources: [], error: String(err) };
  }
}

function SourceBadge({ product }: { product: Product }) {
  const lang = useLang();
  const isRtl = lang === "ar";
  if (!product.source || product.source === 'https://bambeh.com') return null;
  return (
    <a
      href={product.source}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full mt-1 hover:underline"
      title={`Data sourced from ${product.sourceLabel}`}
    >
      <Globe className="w-2.5 h-2.5" />
      {product.sourceLabel || 'Online'}
    </a>
  );
}

function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-3 shadow-sm border animate-pulse">
      <div className="w-full h-16 bg-gray-100 rounded-xl mb-2"/>
      <div className="h-3 bg-gray-100 rounded w-3/4 mb-1"/>
      <div className="h-3 bg-gray-100 rounded w-1/2"/>
    </div>
  );
}

interface OnlineSearchPanelProps {
  onAdd: (p: Product) => void;
  onClose: () => void;
}

function OnlineSearchPanel({ onAdd, onClose }: OnlineSearchPanelProps) {
  const lang = useLang();
  const ui = COPY[lang] ?? COPY[lang === 'ff' ? 'ful' : lang] ?? COPY.en;
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [sources, setSources] = useState<{ label: string; url: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setSearched(true);

    const { products, sources: srcs, error: err } = await searchProductOnline(query);
    setLoading(false);

    if (err || products.length === 0) {
      setError(
        err?.includes('Failed to fetch')
          ? ui.couldNotReachServer
          : ui.noResultsFoundDifferent,
      );
      setResults([]);
    } else {
      setResults(products);
      setSources(srcs);
    }
  }, [query, ui]);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-600" />
          <h3 className="font-semibold text-gray-900 text-sm">{ui.searchOnline}</h3>
        </div>
        <button onClick={onClose} aria-label={ui.closeOnlineSearch}>
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <div className="flex gap-2 mb-3">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && doSearch()}
          placeholder={ui.searchOnlinePlaceholder}
          className="flex-1 border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
          aria-label={ui.searchProductOnline}
        />
        <button
          onClick={doSearch}
          disabled={loading || !query.trim()}
          className="bg-teal-600 text-white px-3 py-2 rounded-xl disabled:opacity-50 hover:bg-teal-700 transition"
          aria-label={ui.search}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </button>
      </div>

      {loading && (
        <div className="space-y-2">
          {[1, 2].map(i => <ProductSkeleton key={i} />)}
          <p className="text-xs text-gray-400 text-center animate-pulse">
            {ui.loadingLivePrices}
          </p>
        </div>
      )}

      {!loading && error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {results.map(p => (
              <button
                key={p.id}
                onClick={() => { onAdd(p); onClose(); }}
                className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl text-left border border-transparent hover:border-teal-200 transition"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                  <p className="text-xs text-teal-600 font-bold">{p.price.toLocaleString('fr-CM')} XAF</p>
                  <SourceBadge product={p} />
                </div>
                <Plus className="w-4 h-4 text-teal-600 flex-shrink-0" />
              </button>
            ))}
          </div>

          {sources.length > 0 && (
            <div className="mt-3 pt-2 border-t border-gray-100">
              <p className="text-[10px] text-gray-400 mb-1">{ui.sources}</p>
              <div className="flex flex-wrap gap-1">
                {sources.map(s => (
                  <a
                    key={s.url}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-blue-500 hover:underline bg-blue-50 px-1.5 py-0.5 rounded-full"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {!loading && searched && results.length === 0 && !error && (
        <p className="text-sm text-gray-500 text-center py-3">{ui.noResultsFound}</p>
      )}
    </div>
  );
}

interface ManualPickerProps {
  available: Product[];
  onAdd: (p: Product) => void;
  onClose: () => void;
  onOpenOnline: () => void;
}

function ManualPicker({ available, onAdd, onClose, onOpenOnline }: ManualPickerProps) {
  const lang = useLang();
  const ui = COPY[lang] ?? COPY[lang === 'ff' ? 'ful' : lang] ?? COPY.en;
  const [search, setSearch] = useState('');

  const filtered = available.filter(
    p => !search || p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 text-sm">{ui.addAProductToCompare}</h3>
        <button onClick={onClose} aria-label={ui.closePicker}><X className="w-4 h-4 text-gray-400" /></button>
      </div>

      <button
        onClick={onOpenOnline}
        className="w-full flex items-center justify-center gap-2 py-2 mb-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-sm font-semibold hover:bg-blue-100 transition"
      >
        <Globe className="w-4 h-4" /> {ui.searchOnlineBtn}
      </button>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder={ui.searchFromBambeh}
        className="w-full border rounded-xl px-3 py-2 text-sm mb-3 focus:ring-2 focus:ring-teal-500 outline-none"
        aria-label={ui.searchLocalProducts}
      />
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {filtered.map(p => (
          <button
            key={p.id}
            onClick={() => addProduct(p)}
            className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl text-left"
          >
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{p.name}</p>
              <p className="text-xs text-teal-600">{p.price.toLocaleString('fr-CM')} XAF</p>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-3">{ui.noLocalProductsFound}</p>
        )}
      </div>
    </div>
  );

  function addProduct(p: Product) {
    onAdd(p);
    onClose();
  }
}

export default function ComparisonTool() {
  const navigate = useNavigate();
  const lang = useLang();
  const ui = COPY[lang] ?? COPY[lang === 'ff' ? 'ful' : lang] ?? COPY.en;
  const [products, setProducts] = useState<Product[]>([]); // FIX163: start empty, no fake defaults
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [showOnline, setShowOnline] = useState(false);

  // FIX163: real Bambeh products from the live `listings` table (was a dead
  // localStorage relic). Honest mapping: no fabricated ratings or scores —
  // rating/valueScore stay 0 for local items; badges below skip zero scores.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await supabase
          .from('listings')
          .select('id, title, price, category, location, type, status')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(50);
        if (!alive || !data) return;
        const mapped: Product[] = data.map((p: Record<string, unknown>) => ({
          id: String(p.id),
          name: String(p.title ?? 'Listing'),
          price: Number(p.price) || 0,
          category: String(p.category ?? p.type ?? 'Other'),
          rating: 0,
          reviews: 0,
          seller: '',
          location: String(p.location ?? ''),
          specs: {
            Category: String(p.category ?? p.type ?? ''),
            Location: String(p.location ?? ''),
          },
          pros: [],
          cons: [],
          valueScore: 0,
          qualityScore: 0,
          sellerRating: 0,
          source: 'https://bambeh.com',
          sourceLabel: 'Bambeh Marketplace',
        }));
        setLocalProducts(mapped);
      } catch {
        // picker simply stays empty on failure
      }
    })();
    return () => { alive = false; };
  }, []);

  const allAvailable = localProducts.filter( // FIX163: real listings only
    p => !products.find(c => c.id === p.id),
  );

  function addProduct(p: Product) {
    setProducts(prev => [...prev, p].slice(0, 3));
    setShowPicker(false);
    setShowOnline(false);
  }

  function removeProduct(id: string) {
    setProducts(prev => prev.filter(p => p.id !== id));
  }

  const allSpecs = Array.from(new Set(products.flatMap(p => Object.keys(p.specs))));

  const bestPrice = products.length >= 2
    ? products.reduce((b, p) => p.price < b.price ? p : b).id
    : null;
  const rated = products.filter(p => p.rating > 0); // FIX163
  const bestRating = rated.length >= 2
    ? rated.reduce((b, p) => p.rating > b.rating ? p : b).id
    : null;
  const valued = products.filter(p => p.valueScore > 0); // FIX163
  const bestValue = valued.length >= 2
    ? valued.reduce((b, p) => p.valueScore > b.valueScore ? p : b).id
    : null;

  const colClass = products.length === 3 ? 'grid-cols-3' : 'grid-cols-2';

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-xl"
          aria-label={ui.goBack}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="font-semibold text-gray-900 flex-1">{ui.compareProducts}</h2>
        <TrendingUp className="w-5 h-5 text-teal-600" />
        {products.length > 0 && (
          <button
            onClick={() => setProducts([])}
            className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition"
            aria-label={ui.clearAllProducts}
          >
            {ui.clearAll}
          </button>
        )}
      </div>

      <div className="p-4">
        <div className={`grid gap-3 mb-4 ${colClass}`}>
          {products.map(p => (
            <div key={p.id} className="bg-white rounded-2xl p-3 shadow-sm border relative">
              <button
                onClick={() => removeProduct(p.id)}
                className="absolute top-2 right-2 w-5 h-5 bg-gray-100 hover:bg-red-100 rounded-full flex items-center justify-center transition"
                aria-label={ui.removeProduct(p.name)}
              >
                <X className="w-3 h-3 text-gray-500" />
              </button>
              <div className="w-full h-16 bg-gray-50 rounded-xl flex items-center justify-center mb-2">
                <ShoppingCart className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-xs font-semibold text-gray-900 line-clamp-2 leading-tight pr-4">{p.name}</p>
              <p className="text-sm font-bold text-teal-600 mt-1">{p.price.toLocaleString('fr-CM')} XAF</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="text-xs text-gray-600">{p.rating}</span>
                <span className="text-xs text-gray-400">({p.reviews})</span>
              </div>
              <SourceBadge product={p} />
              <div className="flex flex-wrap gap-1 mt-1">
                {p.id === bestPrice && (
                  <span className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">
                    {ui.bestPrice}
                  </span>
                )}
                {p.id === bestRating && (
                  <span className="text-xs bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded-full font-semibold">
                    {ui.topRated}
                  </span>
                )}
                {p.id === bestValue && (
                  <span className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full font-semibold">
                    {ui.bestValue}
                  </span>
                )}
              </div>
            </div>
          ))}

          {products.length < 3 && (
            <button
              onClick={() => setShowPicker(true)}
              className="bg-white rounded-2xl p-3 shadow-sm border border-dashed border-teal-300 flex flex-col items-center justify-center gap-2 min-h-[120px] hover:bg-teal-50 transition"
              aria-label={ui.addProduct}
            >
              <Plus className="w-6 h-6 text-teal-500" />
              <span className="text-xs text-teal-600 font-medium">{ui.addProduct}</span>
            </button>
          )}
        </div>

        {showOnline && (
          <OnlineSearchPanel
            onAdd={addProduct}
            onClose={() => setShowOnline(false)}
          />
        )}

        {showPicker && !showOnline && (
          <ManualPicker
            available={allAvailable}
            onAdd={addProduct}
            onClose={() => setShowPicker(false)}
            onOpenOnline={() => { setShowPicker(false); setShowOnline(true); }}
          />
        )}

        {products.length >= 2 && (
          <>
            <div className="bg-white rounded-2xl p-4 shadow-sm border mb-4">
              <h3 className="font-semibold text-gray-900 mb-3">{ui.scoreComparison}</h3>
              {(
                [
                  ['Value Score', 'valueScore', 100],
                  ['Quality Score', 'qualityScore', 100],
                  ['Seller Rating', 'sellerRating', 5],
                ] as [string, keyof Product, number][]
              ).map(([label, key, max]) => (
                <div key={label} className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <div className={`grid gap-2 ${colClass}`}>
                    {products.map(p => {
                      const val = p[key] as number;
                      const pct = Math.min(100, (val / max) * 100);
                      return (
                        <div key={p.id}>
                          <div className="w-full bg-gray-100 rounded-full h-2 mb-0.5">
                            <div
                              className="bg-teal-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}/>
                          </div>
                          <p className="text-xs text-gray-600 text-center">
                            {max === 5 ? `${val}/5` : `${val}%`}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {allSpecs.length > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border mb-4 overflow-hidden">
                <h3 className="font-semibold text-gray-900 mb-3">{ui.specifications}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs" role="table">
                    <thead>
                      <tr className="border-b">
                        <th
                          scope="col"
                          className="text-left py-2 pr-3 text-gray-500 font-medium min-w-[60px]"
                        >
                          {ui.spec}
                        </th>
                        {products.map(p => (
                          <th
                            key={p.id}
                            scope="col"
                            className="text-left py-2 pr-3 text-gray-500 font-medium truncate max-w-[80px]"
                            title={p.name}
                          >
                            {p.name.split(' ').slice(0, 2).join(' ')}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {allSpecs.map(spec => (
                        <tr key={spec} className="border-b last:border-0">
                          <td className="py-2 pr-3 text-gray-500">{spec}</td>
                          {products.map(p => (
                            <td key={p.id} className="py-2 pr-3 text-gray-900 font-medium">
                              {p.specs[spec] || (
                                <span className="text-gray-300">{'\u2014'}</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className={`grid gap-3 ${colClass}`}>
              {products.map(p => (
                <div key={p.id} className="bg-white rounded-2xl p-3 shadow-sm border">
                  <p className="text-xs font-semibold text-gray-700 mb-2 truncate">
                    {p.name.split(' ').slice(0, 2).join(' ')}
                  </p>
                  {p.pros.map(pro => (
                    <div key={pro} className="flex items-center gap-1 mb-1">
                      <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                      <span className="text-xs text-gray-700">{pro}</span>
                    </div>
                  ))}
                  {p.cons.map(con => (
                    <div key={con} className="flex items-center gap-1 mb-1">
                      <X className="w-3 h-3 text-red-400 flex-shrink-0" />
                      <span className="text-xs text-gray-700">{con}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <p className="text-[10px] text-gray-400 text-center mt-4">
              {ui.onlinePricesNotice}
            </p>
          </>
        )}

        {products.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-200" />
            <p className="font-medium text-gray-500">{ui.addAtLeastTwo}</p>
            <button
              onClick={() => setShowPicker(true)}
              className="mt-3 bg-teal-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm"
            >
              {ui.addProducts}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__COMPARISONTOOL_FIX163__COMPLETE
