/**
 * src/pages/Exchange.tsx — Bambeh Marketplace
 *
 * ✅ Full i18n: en, fr, ha, ar, pcm, ff
 * ✅ Realtime listings via Supabase postgres_changes
 * ✅ Location filter (region / city / quarter / landmark)
 * ✅ Expiry countdown badge (≤ 3 days)
 * ✅ Auth-guarded Post Item button
 * ✅ Offer + view count display
 * ✅ Safe-area Android/iOS padding
 * ✅ Pull-to-refresh aware refresh button
 * ✅ Featured ads strip
 * ✅ Empty / error / loading states
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftRight, Plus, Package, Loader2,
  RefreshCw, Eye, Clock, Flame, Search, SlidersHorizontal,
  TrendingUp, Star,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LocationFilter, LocationFilters, EMPTY_LOCATION } from '@/components/filters/LocationFilter';
import { useLang, t } from '@/hooks/useAppLang';
import { FeaturedAdsStrip } from '@/components/ads/FeaturedAdsStrip';

// ─── i18n strings ──────────────────────────────────────────────────────────────
const STRINGS = {
  en: {
    title: 'Exchange',
    postItem: 'Post Item',
    refresh: 'Refresh',
    loading: 'Loading exchange listings…',
    noListings: 'No exchange listings found',
    noListingsFilter: 'Try adjusting your location filter.',
    noListingsFirst: 'Be the first to post an item for exchange!',
    postFirst: 'Post Your First Item',
    found: (n: number) => `${n} item${n !== 1 ? 's' : ''} found`,
    tryAgain: 'Try again',
    loadErr: 'Could not load listings. Check your connection.',
    expiresIn: (d: number) => d === 0 ? 'Expires in less than 24h' : `Expires in ${d} day${d !== 1 ? 's' : ''}`,
    offer: (n: number) => `${n} offer${n !== 1 ? 's' : ''}`,
    search: 'Search items…',
    allCategories: 'All',
    sortNewest: 'Newest',
    sortOffers: 'Most Offers',
    sortViews: 'Most Viewed',
    freeLabel: 'Free · 30 days',
    open: 'Open to offers',
  },
  fr: {
    title: 'Échange',
    postItem: 'Publier',
    refresh: 'Actualiser',
    loading: 'Chargement des annonces…',
    noListings: 'Aucune annonce trouvée',
    noListingsFilter: 'Essayez de modifier votre filtre de localisation.',
    noListingsFirst: 'Soyez le premier à publier un article à échanger !',
    postFirst: 'Publier le premier article',
    found: (n: number) => `${n} article${n !== 1 ? 's' : ''} trouvé${n !== 1 ? 's' : ''}`,
    tryAgain: 'Réessayer',
    loadErr: 'Impossible de charger les annonces. Vérifiez votre connexion.',
    expiresIn: (d: number) => d === 0 ? 'Expire dans moins de 24h' : `Expire dans ${d} jour${d !== 1 ? 's' : ''}`,
    offer: (n: number) => `${n} offre${n !== 1 ? 's' : ''}`,
    search: 'Rechercher…',
    allCategories: 'Tout',
    sortNewest: 'Plus récent',
    sortOffers: 'Plus d\'offres',
    sortViews: 'Plus vu',
    freeLabel: 'Gratuit · 30 jours',
    open: 'Ouvert aux offres',
  },
  ha: {
    title: 'Musanya',
    postItem: 'Wallafa',
    refresh: 'Sabunta',
    loading: 'Ana loda jerin musanya…',
    noListings: 'Ba a sami jerin musanya ba',
    noListingsFilter: 'Gwada canza tacewar wuri.',
    noListingsFirst: 'Ka zama na farko da buga abu don musanya!',
    postFirst: 'Buga Farkon Abu',
    found: (n: number) => `An sami abubuwa ${n}`,
    tryAgain: 'Sake gwadawa',
    loadErr: 'Ba a iya loda jeri. Duba haɗin ku.',
    expiresIn: (d: number) => d === 0 ? 'Ya ƙare a cikin ƙasa da 24h' : `Ya ƙare a cikin kwanaki ${d}`,
    offer: (n: number) => `tayin ${n}`,
    search: 'Nemi abubuwa…',
    allCategories: 'Duka',
    sortNewest: 'Sababbi',
    sortOffers: 'Mafi yawan Tayin',
    sortViews: 'Mafi Kallo',
    freeLabel: 'Kyauta · Kwanaki 30',
    open: 'Buɗe ga tayin',
  },
  ar: {
    title: 'تبادل',
    postItem: 'نشر عنصر',
    refresh: 'تحديث',
    loading: 'جارÙ تحميل قوائم التبادل…',
    noListings: 'لم يتم العثور على قوائم',
    noListingsFilter: 'حاول تعديل مرشح الموقع.',
    noListingsFirst: 'كن أول من ينشر عنصرًا للتبادل!',
    postFirst: 'انشر أول عنصر',
    found: (n: number) => `تم العثور على ${n} عنصر`,
    tryAgain: 'حاول مجدداً',
    loadErr: 'تعذّر تحميل القوائم. تحقق من اتصالك.',
    expiresIn: (d: number) => d === 0 ? 'تنتهي Ùي أقل من 24 ساعة' : `تنتهي Ùي ${d} يوم`,
    offer: (n: number) => `${n} عرض`,
    search: 'البحث عن عناصر…',
    allCategories: 'الكل',
    sortNewest: 'الأحدث',
    sortOffers: 'الأكثر عروضاً',
    sortViews: 'الأكثر مشاهدة',
    freeLabel: 'مجانًا · 30 يومًا',
    open: 'مÙتوح للعروض',
  },
  pcm: {
    title: 'Exchange',
    postItem: 'Post Am',
    refresh: 'Refresh',
    loading: 'E dey load exchange listings…',
    noListings: 'No exchange listings',
    noListingsFilter: 'Try adjust your location filter.',
    noListingsFirst: 'Be first person wey go post item for exchange!',
    postFirst: 'Post Your First Item',
    found: (n: number) => `${n} item${n !== 1 ? 's' : ''} don show`,
    tryAgain: 'Try again',
    loadErr: 'E no fit load listings. Check your network.',
    expiresIn: (d: number) => d === 0 ? 'E go expire in less than 24h' : `E go expire in ${d} day${d !== 1 ? 's' : ''}`,
    offer: (n: number) => `${n} offer${n !== 1 ? 's' : ''}`,
    search: 'Search items…',
    allCategories: 'All',
    sortNewest: 'Latest',
    sortOffers: 'Most Offers',
    sortViews: 'Most Views',
    freeLabel: 'Free · 30 days',
    open: 'Open to offers',
  },
  ff: {
    title: 'Fewtere',
    postItem: 'Hollir',
    refresh: 'Hesɗit',
    loading: 'Ɓetete fewtere…',
    noListings: 'Alaa fewtere',
    noListingsFilter: 'Rewto suturo wuro maa.',
    noListingsFirst: 'Ngu njimi tafon ɓe njajaa!',
    postFirst: 'Hollu Adinii',
    found: (n: number) => `Ko ${n} coftal`,
    tryAgain: 'Heɓto katin',
    loadErr: 'Waawaa yaltude. Leɓto samorde.',
    expiresIn: (d: number) => d === 0 ? 'Timmii hannde' : `Timmii ${d} ñalawma`,
    offer: (n: number) => `${n} jaɓde`,
    search: 'Ɓeto coftal…',
    allCategories: 'Fof',
    sortNewest: 'Sainii',
    sortOffers: 'Heewi jaɓde',
    sortViews: 'Heewi yiyeede',
    freeLabel: 'Ñaawɗe · Ñalawma 30',
    open: 'Udditii jaɓde',
  },
} as const;

type Lang = keyof typeof STRINGS;

const CATEGORIES = [
  'Electronics', 'Furniture', 'Fashion', 'Appliances',
  'Books', 'Vehicles', 'Sports', 'Tools', 'Other',
];

type SortKey = 'newest' | 'offers' | 'views';

interface ExchangeItem {
  id:          string;
  title:       string;
  category:    string;
  condition:   string;
  location:    string;
  description: string;
  created_at:  string;
  expires_at?: string | null;
  user_id:     string;
  view_count:  number;
  offer_count: number;
  images:      string[];
}

function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

export default function Exchange() {
  const navigate = useNavigate();
  const lang = (useLang() as Lang) || 'en';
  const s = STRINGS[lang] ?? STRINGS.en;
  const isRtl = lang === 'ar';

  const [items,           setItems]           = useState<ExchangeItem[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState<string | null>(null);
  const [locationFilters, setLocationFilters] = useState<LocationFilters>(EMPTY_LOCATION);
  const [searchQuery,     setSearchQuery]     = useState('');
  const [category,        setCategory]        = useState('');
  const [sortKey,         setSortKey]         = useState<SortKey>('newest');
  const [showFilters,     setShowFilters]     = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  async function fetchItems() {
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('exchange_items')
        .select('id, title, category, condition, location, description, created_at, expires_at, user_id, view_count, offer_count, images')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(100);
      if (err) throw err;
      setItems((data ?? []) as ExchangeItem[]);
    } catch {
      setError(s.loadErr);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchItems();
    channelRef.current = supabase
      .channel('exchange_items_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'exchange_items' }, fetchItems)
      .subscribe();
    return () => {
      if (channelRef.current) { supabase.removeChannel(channelRef.current); channelRef.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handlePostClick() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate('/login'); return; }
    navigate('/exchange/post');
  }

  // ─── Client-side filtering + search + sort ────────────────────────────────
  let filtered = items.filter(item => {
    const loc = item.location.toLowerCase();
    if (locationFilters.region   && !loc.includes(locationFilters.region.toLowerCase()))   return false;
    if (locationFilters.city     && !loc.includes(locationFilters.city.toLowerCase()))     return false;
    if (locationFilters.quarter  && !loc.includes(locationFilters.quarter.toLowerCase()))  return false;
    if (locationFilters.landmark && !loc.includes(locationFilters.landmark.toLowerCase())) return false;
    return true;
  });

  if (category) {
    filtered = filtered.filter(i => i.category === category);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(i =>
      i.title.toLowerCase().includes(q) ||
      i.description.toLowerCase().includes(q) ||
      i.location.toLowerCase().includes(q)
    );
  }

  if (sortKey === 'offers') filtered = [...filtered].sort((a, b) => (b.offer_count ?? 0) - (a.offer_count ?? 0));
  else if (sortKey === 'views') filtered = [...filtered].sort((a, b) => (b.view_count ?? 0) - (a.view_count ?? 0));
  // 'newest' is already the default order from DB

  return (
    <div className={`min-h-screen bg-gray-50 p-4 pb-24 ${isRtl ? 'rtl' : 'ltr'}`}>
      <div className="max-w-2xl mx-auto">

        {/* ─── Header ─── */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ArrowLeftRight className="w-6 h-6 text-teal-600" />
            {s.title}
          </h1>
          <div className="flex gap-2">
            <button
              onClick={fetchItems}
              className="p-2 text-gray-500 hover:text-teal-600 rounded-xl hover:bg-gray-100 transition-colors"
              title={s.refresh}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handlePostClick}
              className="bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 hover:bg-teal-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              {s.postItem}
            </button>
          </div>
        </div>

        {/* ─── Search bar ─── */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={s.search}
            className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-teal-400 transition"
          />
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${showFilters ? 'bg-teal-100 text-teal-700' : 'text-gray-400 hover:text-teal-600'}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* ─── Category chips ─── */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-3 scrollbar-hide">
          <button
            onClick={() => setCategory('')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${category === '' ? 'bg-teal-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-teal-400'}`}
          >
            {s.allCategories}
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(c => c === cat ? '' : cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${category === cat ? 'bg-teal-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-teal-400'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ─── Sort + Location filter (collapsible) ─── */}
        {showFilters && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-3 shadow-sm space-y-3">
            {/* Sort */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Sort by</p>
              <div className="flex gap-2">
                {([['newest', s.sortNewest], ['offers', s.sortOffers], ['views', s.sortViews]] as [SortKey, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setSortKey(key)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${sortKey === key ? 'bg-teal-600 text-white' : 'border border-gray-200 text-gray-600 hover:border-teal-400'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {/* Location filter */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Location</p>
              <LocationFilter onFilterChange={setLocationFilters} />
            </div>
          </div>
        )}

        {/* ─── Featured ads ─── */}
        <div className="mt-1 mb-2">
          <FeaturedAdsStrip category="exchange" showHeader={false} maxVisible={20} />
        </div>

        {/* ─── Loading ─── */}
        {loading && (
          <div className="flex flex-col items-center py-16 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            <p className="text-sm text-gray-500">{s.loading}</p>
          </div>
        )}

        {/* ─── Error ─── */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-center">
            <p className="text-red-600 text-sm mb-2">{error}</p>
            <button onClick={fetchItems} className="text-teal-600 text-sm underline">{s.tryAgain}</button>
          </div>
        )}

        {/* ─── Empty ─── */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium mb-1">{s.noListings}</p>
            <p className="text-sm text-gray-400 mb-4">
              {items.length > 0 ? s.noListingsFilter : s.noListingsFirst}
            </p>
            <button
              onClick={handlePostClick}
              className="bg-teal-600 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors"
            >
              {s.postFirst}
            </button>
          </div>
        )}

        {/* ─── Listings ─── */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">{s.found(filtered.length)}</p>
              {sortKey !== 'newest' && (
                <div className="flex items-center gap-1 text-xs text-teal-600 font-medium">
                  {sortKey === 'offers' ? <Flame className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                  {sortKey === 'offers' ? s.sortOffers : s.sortViews}
                </div>
              )}
            </div>

            {filtered.map(item => {
              const thumb      = item.images?.[0];
              const days       = item.expires_at ? daysUntil(item.expires_at) : null;
              const expiring   = days !== null && days <= 3 && days >= 0;

              return (
                <article
                  key={item.id}
                  onClick={() => navigate('/exchange/' + item.id)}
                  className="bg-white rounded-2xl shadow-sm border cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden group"
                >
                  {/* Expiry warning */}
                  {expiring && (
                    <div className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-50 border-b border-amber-200">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span className="text-xs text-amber-700 font-medium">
                        {s.expiresIn(days!)}
                      </span>
                    </div>
                  )}

                  <div className="flex gap-3 p-4">
                    {/* Thumbnail */}
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={item.title}
                        className="w-20 h-20 rounded-xl object-cover flex-shrink-0 bg-gray-100 group-hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Package className="w-8 h-8 text-gray-300" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold text-gray-900 truncate pr-2 group-hover:text-teal-700 transition-colors">
                          {item.title}
                        </h3>
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                          {item.category}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>

                      <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                        <span className="flex items-center gap-0.5">📍 {item.location}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full font-medium ${
                            item.condition === 'Good' || item.condition === 'Excellent'
                              ? 'bg-green-50 text-green-700'
                              : item.condition === 'Fair'
                              ? 'bg-yellow-50 text-yellow-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {item.condition}
                        </span>
                        <span className="ml-auto text-gray-400">
                          {new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-1.5">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />{item.view_count ?? 0}
                        </span>
                        {(item.offer_count ?? 0) > 0 && (
                          <span className="flex items-center gap-1 text-teal-600 font-semibold">
                            <Flame className="w-3 h-3" />{s.offer(item.offer_count)}
                          </span>
                        )}
                        {(item.offer_count ?? 0) === 0 && (
                          <span className="flex items-center gap-1 text-gray-400">
                            <Star className="w-3 h-3" />{s.open}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}



