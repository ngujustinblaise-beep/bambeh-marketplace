/**
 * src/pages/SearchResults.tsx — Bambeh Marketplace
 * © 2026 Bambeh Marketplace. All rights reserved.
 *
 * FIXES APPLIED:
 * — sortBy stale closure: runSearch now receives sort as a direct argument
 * — "across ." text bug: now shows the selected scope label dynamically
 * — Price sort NaN: strips non-numeric chars before parseFloat
 * — "Clear all filters" now also resets URL params via setSearchParams({})
 * — Location filter now applies to farm_products too
 *
 * NEW:
 * — Scope selector: Cameroon 🇨🇲 | Central Africa 🌍 | West Africa 🌍
 *   Shown in the filters panel and reflected in the empty-state text and result count line
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Search, SlidersHorizontal, MapPin, Briefcase,
  Home, Package, Car, X, Loader2, Wrench, ShoppingBag,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { SearchScope } from '@/services/searchService';
import { SCOPE_CONFIG } from '@/services/searchService';
import { useLang, t } from "@/hooks/useAppLang";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Result {
  id:         string;
  type:       'marketplace' | 'job' | 'service' | 'rental' | 'vehicle' | 'farm' | 'exchange';
  title:      string;
  subtitle?:  string;
  price?:     string;
  location?:  string;
  country?:   string;
  condition?: string;
  category?:  string;
  image?:     string;
  postedAt:   string;
}

// ── Category config ────────────────────────────────────────────────────────────
const CATEGORIES = [
  { value: 'all',         label: 'All',       icon: <Search      className="w-4 h-4" /> },
  { value: 'marketplace', label: 'Items',      icon: <ShoppingBag className="w-4 h-4" /> },
  { value: 'job',         label: 'Jobs',       icon: <Briefcase   className="w-4 h-4" /> },
  { value: 'service',     label: 'Services',   icon: <Wrench      className="w-4 h-4" /> },
  { value: 'rental',      label: 'Rentals',    icon: <Home        className="w-4 h-4" /> },
  { value: 'vehicle',     label: 'Vehicles',   icon: <Car         className="w-4 h-4" /> },
  { value: 'exchange',    label: 'Exchange',   icon: <Package     className="w-4 h-4" /> },
];

const TYPE_ICONS: Record<string, React.ReactNode> = {
  marketplace: <ShoppingBag className="w-4 h-4 text-teal-600" />,
  job:         <Briefcase   className="w-4 h-4 text-blue-600" />,
  service:     <Wrench      className="w-4 h-4 text-purple-600" />,
  rental:      <Home        className="w-4 h-4 text||ange-600" />,
  vehicle:     <Car         className="w-4 h-4 text-red-600" />,
  farm:        <Package     className="w-4 h-4 text-green-600" />,
  exchange:    <Package     className="w-4 h-4 text-yellow-600" />,
};

const TYPE_ROUTES: Record<string, string> = {
  marketplace: '/marketplace/',
  job:         '/jobs/',
  service:     '/services/',
  rental:      '/rentals/',
  vehicle:     '/vehicles/',
  farm:        '/farm-fresh/order/',
  exchange:    '/exchange/',
};

// ── Scope selector config ─────────────────────────────────────────────────────
const SCOPES: { value: SearchScope; label: string; emoji: string; sublabel: string }[] = [
  { value: 'cameroon',      label: 'Cameroon',       emoji: '🇨🇲', sublabel: 'All 10 regions' },
  { value: 'central_africa', label: 'Central Africa', emoji: '🌍', sublabel: 'CEMAC + DRC' },
  { value: 'west_africa',   label: 'West Africa',    emoji: '🌍', sublabel: 'ECOWAS + CMR' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(iso: string): string {
  const lang = useLang();
  const isRtl = lang === "ar";
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1)  return 'Just now';
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function parsePrice(priceStr: string | undefined): number {
  if (!priceStr) return 0;
  return parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function SearchResults() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [query,       setQuery]       = useState(searchParams.get('q')        || '');
  const [category,    setCategory]    = useState(searchParams.get('category') || 'all');
  const [location,    setLocation]    = useState(searchParams.get('location') || '');
  const [sortBy,      setSortBy]      = useState(searchParams.get('sort')     || 'newest');
  const [scope,       setScope]       = useState<SearchScope>((searchParams.get('scope') as SearchScope) || 'cameroon');
  const [results,     setResults]     = useState<Result[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [showFilters, setShowFilters] = useState(searchParams.get('filters') === 'open');
  const [searched,    setSearched]    = useState(false);

  // Re-run search whenever URL params change
  useEffect(() => {
    const q    = searchParams.get('q')        || '';
    const cat  = searchParams.get('category') || 'all';
    const loc  = searchParams.get('location') || '';
    const sort = searchParams.get('sort')     || 'newest';
    const sc   = (searchParams.get('scope') as SearchScope) || 'cameroon';

    setQuery(q);
    setCategory(cat);
    setLocation(loc);
    setSortBy(sort);
    setScope(sc);

    if (q || cat !== 'all' || loc) {
      // FIX: pass all filter values as arguments so the closure is never stale
      runSearch(q, cat, loc, sort, sc);
    }
  }, [searchParams]);

  // ── Supabase search ──────────────────────────────────────────────────────────
  // FIX: sort and scope are now arguments, not closed-over state — no stale value bug
  async function runSearch(q: string, cat: string, loc: string, sort: string, sc: SearchScope) {
    setLoading(true);
    setSearched(true);

    try {
      const allResults: Result[] = [];

      // ── listings table (marketplace, job, service, rental, vehicle, exchange) ─
      const typesToSearch = cat === 'all'
        ? ['marketplace', 'job', 'service', 'rental', 'vehicle', 'exchange']
        : [cat].filter(t => t !== 'farm'); // farm is a separate table

      for (const type of typesToSearch) {
        let dbQuery = supabase
          .from('farm-images')
          .select('id, type, title, description, price, category, condition, location, country, images, created_at, extra')
          .eq('status', 'active')
          .eq('type', type)
          .order('created_at', { ascending: false })
          .limit(20);

        if (q.trim())   dbQuery = dbQuery.or(`title.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%`);
        if (loc.trim()) dbQuery = dbQuery.ilike('location', `%${loc}%`);

        // Scope filter — if the listings table has a country column
        if (sc !== 'cameroon') {
          const countries = SCOPE_CONFIG[sc].countries;
          dbQuery = (dbQuery as any).in('country', countries);
        }

        const { data, error } = await dbQuery;
        if (error) console.warn(`[SearchResults] listings/${type}:`, error.message);

        if (data) {
          allResults.push(...data.map(d => ({
            id:        d.id,
            type:      d.type as Result['type'],
            title:     d.title,
            subtitle:  d.extra?.company || d.category || '',
            price:     d.price ? `${Number(d.price).toLocaleString()} XAF` : undefined,
            location:  d.location || '',
            country:   d.country  || '',
            condition: d.condition || undefined,
            category:  d.category  || '',
            image:     d.images?.[0] || undefined,
            postedAt:  d.created_at,
          })));
        }
      }

      // ── farm_products table ───────────────────────────────────────────────────
      if (cat === 'all' || cat === 'farm') {
        let farmQuery = supabase
          .from('farm_products')
          .select('id, name, price, unit, location, category, image_url, created_at')
          .eq('is_available', true)
          .limit(10);

        if (q.trim())   farmQuery = farmQuery.ilike('name', `%${q}%`);
        if (loc.trim()) farmQuery = farmQuery.ilike('location', `%${loc}%`);

        const { data: farmData, error: farmError } = await farmQuery;
        if (farmError) console.warn('[SearchResults] farm_products:', farmError.message);

        if (farmData) {
          allResults.push(...farmData.map(d => ({
            id:       d.id,
            type:     'farm' as Result['type'],
            title:    d.name,
            price:    `${Number(d.price).toLocaleString()} XAF/${d.unit}`,
            location: d.location || '',
            category: d.category || 'Farm',
            image:    d.image_url || undefined,
            postedAt: d.created_at,
          })));
        }
      }

      // ── Sort ─────────────────────────────────────────────────────────────────
      // FIX: use `sort` argument, not stale `sortBy` state
      // FIX: strip non-numeric chars before parseFloat (was always NaN for "650,000 XAF")
      let sorted = [...allResults];
      if (sort === 'price_low')  sorted.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
      if (sort === 'price_high') sorted.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
      // 'newest' is already DB||dered

      if (sorted.length === 0) sorted = getSampleResults(q, cat, sc);
      setResults(sorted);
    } catch (err) {
      console.error('[SearchResults] unexpected error:', err);
      setResults(getSampleResults(q, cat, sc));
    } finally {
      setLoading(false);
    }
  }

  // ── Sample / fallback data ────────────────────────────────────────────────────
  function getSampleResults(q: string, cat: string, sc: SearchScope): Result[] {
    // Fallback samples: Cameroon-only by default; add regional samples for broader scopes
    const cameroon: Result[] = [
      { id:'s1', type:'marketplace', title:'iPhone 14 Pro Max 256GB',     subtitle:'Electronics', price:'650,000 XAF',    location:'Bastos, Yaoundé',   country:'Cameroon', condition:'Like New', postedAt: new Date().toISOString() },
      { id:'s2', type:'marketplace', title:'Samsung Galaxy S23 Ultra',    subtitle:'Electronics', price:'580,000 XAF',    location:'Akwa, Douala',       country:'Cameroon', condition:'New',      postedAt: new Date().toISOString() },
      { id:'s3', type:'job',         title:'Senior Software Developer',   subtitle:'TechCorp CM', price:'500,000 XAF',    location:'Yaoundé',            country:'Cameroon', postedAt: new Date().toISOString() },
      { id:'s4', type:'job',         title:'Marketing Manager',           subtitle:'Orange CM',   price:'400,000 XAF',    location:'Douala',             country:'Cameroon', postedAt: new Date().toISOString() },
      { id:'s5', type:'service',     title:'Professional House Cleaning', subtitle:'Cleaning',    price:'15,000 XAF',     location:'Yaoundé',            country:'Cameroon', postedAt: new Date().toISOString() },
      { id:'s6', type:'rental',      title:'2-Bedroom Apartment Bastos',  subtitle:'Apartment',   price:'120,000 XAF/mo', location:'Bastos, Yaoundé',    country:'Cameroon', postedAt: new Date().toISOString() },
      { id:'s7', type:'vehicle',     title:'Toyota Corolla 2019',         subtitle:'Sedan',       price:'8,500,000 XAF',  location:'Douala',             country:'Cameroon', postedAt: new Date().toISOString() },
      { id:'s8', type:'farm',        title:'Fresh Tomatoes',              subtitle:'Vegetables',  price:'500 XAF/kg',     location:'Bafoussam',          country:'Cameroon', postedAt: new Date().toISOString() },
      { id:'s9', type:'exchange',    title:'Laptop for Smartphone Trade', subtitle:'Electronics', price:'0 XAF',          location:'Yaoundé',            country:'Cameroon', postedAt: new Date().toISOString() },
    ];

    const regional: Result[] = sc === 'central_africa' ? [
      { id:'r1', type:'job',         title:'Pétrole Ingénieur Senior',    subtitle:'Total Gabon',  price:'2,500,000 XAF', location:'Libreville', country:'Gabon',  postedAt: new Date().toISOString() },
      { id:'r2', type:'marketplace', title:'Générateur 5KVA Diesel',      subtitle:'Machines',     price:'850,000 XAF',   location:'Brazzaville', country:'Congo', postedAt: new Date().toISOString() },
      { id:'r3', type:'service',     title:'Traduction FR/EN Certifiée',  subtitle:'Services',     price:'25,000 XAF',    location:'Bangui',     country:'Central African Republic', postedAt: new Date().toISOString() },
    ] : sc === 'west_africa' ? [
      { id:'w1', type:'job',         title:'Software Engineer (Remote)',   subtitle:'Flutterwave',  price:'3,000,000 XAF', location:'Lagos',      country:'Nigeria', postedAt: new Date().toISOString() },
      { id:'w2', type:'marketplace', title:'Kente Cloth Premium',         subtitle:'Textiles',     price:'45,000 XAF',    location:'Accra',      country:'Ghana',   postedAt: new Date().toISOString() },
      { id:'w3', type:'service',     title:'Digital Marketing Agency',    subtitle:'Marketing',    price:'150,000 XAF',   location:'Dakar',      country:'Senegal', postedAt: new Date().toISOString() },
    ] : [];

    const all = sc === 'cameroon' ? cameroon : [...cameroon, ...regional];

    return all.filter(s =>
      (cat === 'all' || s.type === cat) &&
      (!q || s.title.toLowerCase().includes(q.toLowerCase()))
    );
  }

  // ── URL sync on search ────────────────────────────────────────────────────────
  function handleSearch() {
if (query.toLowerCase().includes('car')) {
  navigate('/vehicles')
  return
}
if (query.toLowerCase().includes('house')) {
  navigate('/rentals')
  return
}
if (query.toLowerCase().includes('job') || query.toLowerCase().includes('work')) {
  navigate('/jobs')
  return
}
    const params: Record<string, string> = {};
    if (query)             params.q        = query;
    if (category !== 'all') params.category = category;
    if (location)          params.location  = location;
    if (sortBy !== 'newest') params.sort    = sortBy;
    if (scope !== 'cameroon') params.scope  = scope;
    setSearchParams(params);
  }

  function handleClear() {
    setQuery('');
    setCategory('all');
    setLocation('');
    setSortBy('newest');
    setScope('cameroon');
    // FIX: also reset URL so the useEffect doesn't re-run with old params
    setSearchParams({});
  }

  function navigateToResult(r: Result) {
    navigate((TYPE_ROUTES[r.type] || '/marketplace/') + r.id);
  }

  const currentScopeConfig = SCOPE_CONFIG[scope];

  return (
    <div className="min-h-screen bg-gray-50 pb-10">

      {/* ── Sticky header ──────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 space-y-3">

        {/* Row 1: back + search input + filter toggle */}
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl flex-shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder={`Search in ${currentScopeConfig.label}...`}
                className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500"
              />
              {query && (
                <button onClick={() => setQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button onClick={handleSearch}
              className="bg-teal-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap">
              Search
            </button>
          </div>
          <button onClick={() => setShowFilters(f => !f)}
            className={`p-2 rounded-xl border transition ${showFilters ? 'bg-teal-50 border-teal-300 text-teal-600' : 'hover:bg-gray-100'}`}>
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Row 2: Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map(c => (
            <button key={c.value} onClick={() => setCategory(c.value)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition ${
                category === c.value ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {c.icon} {c.label}
            </button>
          ))}
        </div>

        {/* Row 3: Scope selector — always visible so user always knows the search area */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <span className="flex-shrink-0 text-xs font-semibold text-gray-400 self-center pr-1">Search in:</span>
          {SCOPES.map(s => (
            <button key={s.value} onClick={() => setScope(s.value)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition border ${
                scope === s.value
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}>
              <span>{s.emoji}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Row 4: Filters panel (collapsible) */}
        {showFilters && (
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-gray-100">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">City / Area</label>
              <input value={location} onChange={e => setLocation(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="e.g. Douala, Lagos"
                className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Sort by</label>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                <option value="newest">Newest first</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ── Results area ───────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        {loading ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            <p className="text-sm text-gray-500">
              Searching across {currentScopeConfig.label}...
            </p>
          </div>

        ) : !searched ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">{currentScopeConfig.emoji}</div>
            <p className="font-semibold text-gray-700 mb-1">Search Bambeh Marketplace</p>
            {/* FIX: was "across ." — now shows dynamic scope label */}
            <p className="text-sm text-gray-400 mb-6">
              Find jobs, items, services, rentals, and vehicles across {currentScopeConfig.label}.
            </p>
            {/* Scope quick-select on empty state too */}
            <div className="flex justify-center gap-2 flex-wrap">
              {SCOPES.map(s => (
                <button key={s.value} onClick={() => setScope(s.value)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition ${
                    scope === s.value
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}>
                  <span>{s.emoji}</span>
                  <div className="text-left">
                    <div>{s.label}</div>
                    <div className={`text-xs ${scope === s.value ? 'text-teal-100' : 'text-gray-400'}`}>
                      {s.sublabel}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

        ) : results.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-14 h-14 text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-700 mb-1">No results found</p>
            <p className="text-sm text-gray-400 mb-4">
              Try different keywords, remove filters, or expand your search area.
            </p>
            {/* Expand scope suggestion */}
            {scope === 'cameroon' && (
              <div className="flex justify-center gap-2 mb-4">
                <button onClick={() => { setScope('central_africa'); handleSearch(); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-teal-50 text-gray-700 hover:text-teal-700 rounded-full text-xs transition">
                  🌍 Try Central Africa
                </button>
                <button onClick={() => { setScope('west_africa'); handleSearch(); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-teal-50 text-gray-700 hover:text-teal-700 rounded-full text-xs transition">
                  🌍 Try West Africa
                </button>
              </div>
            )}
            <button onClick={handleClear} className="text-teal-600 text-sm underline">
              Clear all filters
            </button>
          </div>

        ) : (
          <>
            <p className="text-xs text-gray-400 mb-3 flex items-center gap-1.5">
              <span>{currentScopeConfig.emoji}</span>
              <span>
                {results.length} result{results.length !== 1 ? 's' : ''}
                {query ? ` for "${query}"` : ''}
                {' '}in {currentScopeConfig.label}
              </span>
            </p>
            <div className="space-y-3">
              {results.map(r => (
                <div key={r.id}
                  onClick={() => navigateToResult(r)}
                  className="bg-white rounded-2xl p-4 shadow-sm border flex gap-3 cursor-pointer hover:shadow-md transition-shadow">

                  {/* Image or emoji fallback */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                    {r.image
                      ? <img src={r.image} alt={r.title} className="w-full h-full object-cover" />
                      : <div className="text-2xl">
                          {r.type === 'marketplace' ? '🛍️'
                            : r.type === 'job'      ? '💼'
                            : r.type === 'service'  ? '🔧'
                            : r.type === 'rental'   ? '🏠'
                            : r.type === 'vehicle'  ? '🚗'
                            : r.type === 'exchange' ? '🔄'
                            : '🌿'}
                        </div>
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                      <h3 className="font-bold text-gray-900 text-sm leading-tight">{r.title}</h3>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {TYPE_ICONS[r.type]}
                      </div>
                    </div>
                    {r.subtitle && <p className="text-xs text-teal-600 font-semibold mb-0.5">{r.subtitle}</p>}
                    {r.price    && <p className="text-sm font-bold text-teal-700">{r.price}</p>}
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1 flex-wrap">
                      {r.location && (
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-3 h-3" />{r.location}
                          {/* Show country badge for non-Cameroon scope results */}
                          {r.country && r.country !== 'Cameroon' && r.country !== 'Cameroun' && (
                            <span className="ml-1 bg-blue-50 text-blue-600 px-1 py-0.5 rounded text-[10px]">
                              {r.country}
                            </span>
                          )}
                        </span>
                      )}
                      {r.condition && (
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded-full">{r.condition}</span>
                      )}
                      <span>{timeAgo(r.postedAt)}</span>
                    </div>
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




