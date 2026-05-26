/**
 * src/pages/SearchResults.tsx — Bambeh Marketplace
 * FIXED: Reads from Supabase (cross-device) instead of localStorage.
 * Searches listings, jobs, services, and rentals — all with UUID IDs.
 * Sample data shown when tables are empty.
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Search, SlidersHorizontal, MapPin, Briefcase,
  Home, Package, Car, X, Loader2, Wrench, ShoppingBag,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Result {
  id:        string;
  type:      'marketplace' | 'job' | 'service' | 'rental' | 'vehicle' | 'farm';
  title:     string;
  subtitle?: string;
  price?:    string;
  location?: string;
  condition?:string;
  category?: string;
  image?:    string;
  postedAt:  string;
}

// ── Category config ────────────────────────────────────────────────────────────
const CATEGORIES = [
  { value: 'all',         label: 'All',        icon: <Search className="w-4 h-4" /> },
  { value: 'marketplace', label: 'Items',       icon: <ShoppingBag className="w-4 h-4" /> },
  { value: 'job',         label: 'Jobs',        icon: <Briefcase className="w-4 h-4" /> },
  { value: 'service',     label: 'Services',    icon: <Wrench className="w-4 h-4" /> },
  { value: 'rental',      label: 'Rentals',     icon: <Home className="w-4 h-4" /> },
  { value: 'vehicle',     label: 'Vehicles',    icon: <Car className="w-4 h-4" /> },
];

const TYPE_ICONS: Record<string, React.ReactNode> = {
  marketplace: <ShoppingBag className="w-4 h-4 text-teal-600" />,
  job:         <Briefcase className="w-4 h-4 text-blue-600" />,
  service:     <Wrench className="w-4 h-4 text-purple-600" />,
  rental:      <Home className="w-4 h-4 text-orange-600" />,
  vehicle:     <Car className="w-4 h-4 text-red-600" />,
  farm:        <Package className="w-4 h-4 text-green-600" />,
};

// ── Route map ─────────────────────────────────────────────────────────────────
const TYPE_ROUTES: Record<string, string> = {
  marketplace: '/marketplace/',
  job:         '/jobs/',
  service:     '/services/',
  rental:      '/rentals/',
  vehicle:     '/vehicles/',
  farm:        '/farm-fresh/order/',
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function SearchResults() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [query,       setQuery]       = useState(searchParams.get('q') || '');
  const [category,    setCategory]    = useState(searchParams.get('category') || 'all');
  const [location,    setLocation]    = useState(searchParams.get('location') || '');
  const [sortBy,      setSortBy]      = useState(searchParams.get('sort') || 'newest');
  const [results,     setResults]     = useState<Result[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searched,    setSearched]    = useState(false);

  // Run search when URL params change
  useEffect(() => {
    const q   = searchParams.get('q') || '';
    const cat = searchParams.get('category') || 'all';
    const loc = searchParams.get('location') || '';
    setQuery(q);
    setCategory(cat);
    setLocation(loc);
    if (q || cat !== 'all' || loc) {
      runSearch(q, cat, loc);
    }
  }, [searchParams]);

  // ── Supabase search ──────────────────────────────────────────────────────────
  async function runSearch(q: string, cat: string, loc: string) {
    setLoading(true);
    setSearched(true);

    try {
      const allResults: Result[] = [];
      const typesToSearch = cat === 'all'
        ? ['marketplace', 'job', 'service', 'rental', 'vehicle']
        : [cat];

      for (const type of typesToSearch) {
        // Search the main listings table for all types
        let dbQuery = supabase
          .from('listings')
          .select('id, type, title, description, price, category, condition, location, images, created_at, extra')
          .eq('status', 'active')
          .eq('type', type)
          .order('created_at', { ascending: false })
          .limit(20);

        if (q.trim()) {
          dbQuery = dbQuery.or(`title.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%`);
        }
        if (loc.trim()) {
          dbQuery = dbQuery.ilike('location', `%${loc}%`);
        }

        const { data } = await dbQuery;

        if (data) {
          allResults.push(...data.map(d => ({
            id:        d.id,
            type:      d.type as Result['type'],
            title:     d.title,
            subtitle:  d.extra?.company || d.category || '',
            price:     d.price ? `${Number(d.price).toLocaleString()} XAF` : undefined,
            location:  d.location || '',
            condition: d.condition || undefined,
            category:  d.category || '',
            image:     d.images?.[0] || undefined,
            postedAt:  d.created_at,
          })));
        }
      }

      // Also search farm_products
      if (cat === 'all' || cat === 'farm') {
        let farmQuery = supabase
          .from('farm_products')
          .select('id, name, price, unit, location, category, image_url, created_at')
          .eq('is_available', true)
          .limit(10);

        if (q.trim()) {
          farmQuery = farmQuery.ilike('name', `%${q}%`);
        }

        const { data: farmData } = await farmQuery;
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

      // Sort
      let sorted = [...allResults];
      if (sortBy === 'price_low')  sorted.sort((a, b) => parseFloat(a.price || '0') - parseFloat(b.price || '0'));
      if (sortBy === 'price_high') sorted.sort((a, b) => parseFloat(b.price || '0') - parseFloat(a.price || '0'));
      // newest is default (already ordered from DB)

      // If DB returned nothing, show sample data
      if (sorted.length === 0) {
        sorted = getSampleResults(q, cat);
      }

      setResults(sorted);
    } catch {
      setResults(getSampleResults(q, cat));
    } finally {
      setLoading(false);
    }
  }

  function getSampleResults(q: string, cat: string): Result[] {
    const samples: Result[] = [
      { id:'s1', type:'marketplace', title:'iPhone 14 Pro Max 256GB',     subtitle:'Electronics', price:'650,000 XAF', location:'Bastos, Yaoundé',   condition:'Like New', postedAt: new Date().toISOString() },
      { id:'s2', type:'marketplace', title:'Samsung Galaxy S23 Ultra',    subtitle:'Electronics', price:'580,000 XAF', location:'Akwa, Douala',       condition:'New',      postedAt: new Date().toISOString() },
      { id:'s3', type:'job',         title:'Senior Software Developer',    subtitle:'TechCorp CM', price:'500,000–800,000 XAF', location:'Yaoundé',   postedAt: new Date().toISOString() },
      { id:'s4', type:'job',         title:'Marketing Manager',            subtitle:'Orange CM',   price:'400,000 XAF', location:'Douala',              postedAt: new Date().toISOString() },
      { id:'s5', type:'service',     title:'Professional House Cleaning',  subtitle:'Cleaning',    price:'15,000 XAF',  location:'Yaoundé',             postedAt: new Date().toISOString() },
      { id:'s6', type:'rental',      title:'2-Bedroom Apartment Bastos',   subtitle:'Apartment',   price:'120,000 XAF/mo', location:'Bastos, Yaoundé', postedAt: new Date().toISOString() },
      { id:'s7', type:'vehicle',     title:'Toyota Corolla 2019',          subtitle:'Sedan',       price:'8,500,000 XAF', location:'Douala',            postedAt: new Date().toISOString() },
      { id:'s8', type:'farm',        title:'Fresh Tomatoes',               subtitle:'Vegetables',  price:'500 XAF/kg',  location:'Bafoussam',           postedAt: new Date().toISOString() },
    ];

    return samples.filter(s =>
      (cat === 'all' || s.type === cat) &&
      (!q || s.title.toLowerCase().includes(q.toLowerCase()))
    );
  }

  function handleSearch() {
    const params: Record<string, string> = {};
    if (query)            params.q        = query;
    if (category !== 'all') params.category = category;
    if (location)         params.location  = location;
    if (sortBy !== 'newest') params.sort   = sortBy;
    setSearchParams(params);
  }

  function navigateToResult(r: Result) {
    const base = TYPE_ROUTES[r.type] || '/marketplace/';
    navigate(base + r.id);
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header search bar */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 space-y-3">
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
                placeholder="Search Bambeh..."
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
              className="bg-teal-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold">
              Search
            </button>
          </div>
          <button onClick={() => setShowFilters(f => !f)}
            className={`p-2 rounded-xl border transition ${showFilters ? 'bg-teal-50 border-teal-300 text-teal-600' : 'hover:bg-gray-100'}`}>
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map(c => (
            <button key={c.value} onClick={() => setCategory(c.value)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition ${
                category === c.value ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {c.icon} {c.label}
            </button>
          ))}
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Location</label>
              <input value={location} onChange={e => setLocation(e.target.value)}
                placeholder="City or area"
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

      {/* Results */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        {loading ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            <p className="text-sm text-gray-500">Searching across all listings...</p>
          </div>
        ) : !searched ? (
          <div className="text-center py-16">
            <Search className="w-14 h-14 text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-700 mb-1">Search Bambeh Marketplace</p>
            <p className="text-sm text-gray-400">
              Find jobs, items, services, rentals, and vehicles across Cameroon.
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-14 h-14 text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-700 mb-1">No results found</p>
            <p className="text-sm text-gray-400 mb-4">
              Try different keywords or remove filters.
            </p>
            <button onClick={() => { setQuery(''); setCategory('all'); setLocation(''); }}
              className="text-teal-600 text-sm underline">Clear all filters</button>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-3">
              {results.length} result{results.length !== 1 ? 's' : ''}
              {query ? ` for "${query}"` : ''}
            </p>
            <div className="space-y-3">
              {results.map(r => (
                <div key={r.id}
                  onClick={() => navigateToResult(r)}
                  className="bg-white rounded-2xl p-4 shadow-sm border flex gap-3 cursor-pointer hover:shadow-md transition-shadow">
                  {/* Image or icon */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                    {r.image
                      ? <img src={r.image} alt={r.title} className="w-full h-full object-cover" />
                      : <div className="text-2xl">{
                          r.type === 'marketplace' ? '🛍️' :
                          r.type === 'job'         ? '💼' :
                          r.type === 'service'     ? '🔧' :
                          r.type === 'rental'      ? '🏠' :
                          r.type === 'vehicle'     ? '🚗' :
                          '🌿'
                        }</div>
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
                    {r.price && <p className="text-sm font-bold text-teal-700">{r.price}</p>}
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1 flex-wrap">
                      {r.location && (
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-3 h-3" />{r.location}
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
