/**
 * src/pages/FarmFreshPage.tsx — Bambeh Marketplace
 *
 * CHANGES IN THIS VERSION:
 * ✅ LocationFilter integrated — filters by region, city, quarter, landmark
 * ✅ locationFilters state added and wired into filtered array
 * ✅ All existing Supabase / real-time / sample / search / category logic preserved
 * ✅ DEMO BADGE: isDemo added to FarmProduct interface and all SAMPLE_PRODUCTS entries
 * ✅ SORTING: real user listings always appear above demo listings
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Search, Plus, MapPin, Loader2, RefreshCw, ShoppingBag } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { LocationFilter, LocationFilters, EMPTY_LOCATION } from '@/components/filters/LocationFilter';
import { DemoBadge } from '@/components/listings/DemoBadge';

const supabase = createClient(
  (import.meta as any).env?.VITE_SUPABASE_URL || '',
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || ''
);

interface FarmProduct {
  id:           string;
  name:         string;
  price:        number;
  unit:         string;
  category:     string;
  location:     string;
  image_url?:   string;
  is_organic:   boolean;
  is_available: boolean;
  farmer_id:    string;
  created_at:   string;
  isDemo?:      boolean; // ← NEW: marks sample/demo items
}

const SAMPLE_PRODUCTS: FarmProduct[] = [
  { id:'s1', name:'Fresh Tomatoes',      price:500,  unit:'kg',    category:'Vegetables', location:'Bafoussam',  is_organic:true,  is_available:true, farmer_id:'demo', created_at: new Date().toISOString(), isDemo: true },
  { id:'s2', name:'Plantains (1 bunch)', price:1500, unit:'bunch', category:'Fruits',     location:'Yaoundé',   is_organic:false, is_available:true, farmer_id:'demo', created_at: new Date().toISOString(), isDemo: true },
  { id:'s3', name:'Cocoyams',            price:800,  unit:'kg',    category:'Tubers',     location:'Douala',    is_organic:true,  is_available:true, farmer_id:'demo', created_at: new Date().toISOString(), isDemo: true },
  { id:'s4', name:'Fresh Corn',          price:300,  unit:'cob',   category:'Grains',     location:'Bamenda',   is_organic:false, is_available:true, farmer_id:'demo', created_at: new Date().toISOString(), isDemo: true },
  { id:'s5', name:'Groundnuts (1kg)',    price:1200, unit:'kg',    category:'Legumes',    location:'Ngaoundéré',is_organic:false, is_available:true, farmer_id:'demo', created_at: new Date().toISOString(), isDemo: true },
  { id:'s6', name:'Bitter Leaf',         price:200,  unit:'bunch', category:'Vegetables', location:'Yaoundé',   is_organic:true,  is_available:true, farmer_id:'demo', created_at: new Date().toISOString(), isDemo: true },
];

const CATEGORIES = ['All', 'Vegetables', 'Fruits', 'Tubers', 'Grains', 'Legumes', 'Herbs', 'Dairy'];

export default function FarmFreshPage() {
  const navigate = useNavigate();
  const [products,  setProducts]  = useState<FarmProduct[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [category,  setCategory]  = useState('All');

  // ── Location filter state ──────────────────────────────────────────
  const [locationFilters, setLocationFilters] = useState<LocationFilters>(EMPTY_LOCATION);

  async function fetchProducts() {
    try {
      const { data, error } = await supabase
        .from('farm_products')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false })
        .limit(40);

      if (error) throw error;
      // Real data from Supabase — mark isDemo false
      setProducts(
        data && data.length > 0
          ? data.map((d: any) => ({ ...d, isDemo: false }))
          : SAMPLE_PRODUCTS
      );
    } catch {
      setProducts(SAMPLE_PRODUCTS);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
    const channel = supabase
      .channel('farm_products_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'farm_products' }, fetchProducts)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // ── Filter — includes location filter ────────────────────────────────────
  const baseFiltered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase());
    const matchCat    = category === 'All' || p.category === category;

    const loc = p.location.toLowerCase();
    if (locationFilters.region   && !loc.includes(locationFilters.region.toLowerCase()))   return false;
    if (locationFilters.city     && !loc.includes(locationFilters.city.toLowerCase()))     return false;
    if (locationFilters.quarter  && !loc.includes(locationFilters.quarter.toLowerCase()))  return false;
    if (locationFilters.landmark && !loc.includes(locationFilters.landmark.toLowerCase())) return false;

    return matchSearch && matchCat;
  });

  // ── SORTING: real listings first, demo listings last ─────────────────────
  const filtered = [...baseFiltered].sort((a, b) => {
    if (a.isDemo !== b.isDemo) return a.isDemo ? 1 : -1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Leaf className="w-5 h-5 text-green-600" /> Farm Fresh
          </h1>
          <div className="flex gap-2">
            <button onClick={fetchProducts} className="p-2 text-gray-500 hover:text-green-600 rounded-xl hover:bg-gray-100">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={() => navigate('/farm-fresh/sell')}
              className="bg-green-600 text-white px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-1">
              <Plus className="w-4 h-4" /> Sell Produce
            </button>
          </div>
        </div>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search produce, location..."
            className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500" />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition
                ${category === c ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Banner */}
      <div className="mx-4 mt-4 bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-4 text-white mb-4">
        <h2 className="font-bold text-lg mb-1">🌿 Buy Direct from Farmers</h2>
        <p className="text-green-100 text-sm">Fresh produce, fair prices. Support local agriculture in Cameroon.</p>
      </div>

      <div className="px-4 pb-8">

        {/* ── LOCATION FILTER ───────────────────────────────────────────── */}
        <LocationFilter onFilterChange={setLocationFilters} />

        {loading ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            <p className="text-sm text-gray-500">Loading fresh produce...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-700 mb-1">No produce found</p>
            <p className="text-sm text-gray-400">
              {products.length > 0 ? 'Try adjusting your location filter.' : 'Be the first to list produce!'}
            </p>
            <button onClick={() => navigate('/farm-fresh/sell')}
              className="mt-4 bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
              List Your Produce
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(product => (
              <div key={product.id}
                onClick={() => navigate('/farm-fresh/order/' + product.id)}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border cursor-pointer hover:shadow-md transition-shadow">
                {/* Image container — `relative` so DemoBadge positions correctly */}
                <div className="h-32 bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center overflow-hidden relative">
                  {product.image_url
                    ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    : <span className="text-4xl">🌿</span>
                  }
                  {/* ── DEMO BADGE ── */}
                  {product.isDemo && <DemoBadge />}
                </div>
                <div className="p-3">
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight">{product.name}</h3>
                    {product.is_organic && (
                      <span className="flex-shrink-0 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Bio</span>
                    )}
                  </div>
                  <p className="text-green-600 font-bold text-sm">
                    {product.price.toLocaleString()} XAF/{product.unit}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                    <MapPin className="w-3 h-3" />{product.location}
                  </div>
                  {product.isDemo && (
                    <p className="text-xs text-yellow-600 mt-1 italic">Sample — not for sale</p>
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
