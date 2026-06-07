/**
 * src/pages/Exchange.tsx — Bambeh Marketplace
 * ✅ ADDED: view_count shown on each listing card
 * ✅ All original logic preserved exactly
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftRight, Plus, Package, Loader2, RefreshCw, Eye } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { LocationFilter, LocationFilters, EMPTY_LOCATION } from '@/components/filters/LocationFilter';
import { FeaturedAdsStrip } from '@/components/ads/FeaturedAdsStrip'; // ✅ FEATURED ADS

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
const supabase    = createClient(supabaseUrl, supabaseKey);

interface ExchangeItem {
  id:          string;
  title:       string;
  category:    string;
  condition:   string;
  location:    string;
  description: string;
  created_at:  string;
  expires_at?: string;
  user_id:     string;
  view_count?: number; // ✅ NEW
}

export default function Exchange() {
  const navigate = useNavigate();
  const [items,   setItems]   = useState<ExchangeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [locationFilters, setLocationFilters] = useState<LocationFilters>(EMPTY_LOCATION);

  async function fetchItems() {
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('exchange_items')
        .select('*, view_count') // ✅ includes view_count
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(50);
      if (err) throw err;
      setItems(data || []);
    } catch (e: any) {
      setError('Could not load listings. Check your connection.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchItems();
    const channel = supabase
      .channel('exchange_items_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'exchange_items' }, () => { fetchItems(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = items.filter(item => {
    const loc = item.location.toLowerCase();
    if (locationFilters.region   && !loc.includes(locationFilters.region.toLowerCase()))   return false;
    if (locationFilters.city     && !loc.includes(locationFilters.city.toLowerCase()))     return false;
    if (locationFilters.quarter  && !loc.includes(locationFilters.quarter.toLowerCase()))  return false;
    if (locationFilters.landmark && !loc.includes(locationFilters.landmark.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ArrowLeftRight className="w-6 h-6 text-teal-600" /> Exchange
          </h1>
          <div className="flex gap-2">
            <button onClick={fetchItems} className="p-2 text-gray-500 hover:text-teal-600 rounded-xl hover:bg-gray-100" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={() => navigate('/exchange/post')} className="bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1">
              <Plus className="w-4 h-4" /> Post Item
            </button>
          </div>
        </div>

        <LocationFilter onFilterChange={setLocationFilters} />

        {/* ✅ FEATURED ADS STRIP — exchange category only */}
        <div className="mt-2 mb-1">
          <FeaturedAdsStrip category="exchange" showHeader={false} maxVisible={20} />
        </div>

        {loading && (
          <div className="flex flex-col items-center py-16 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            <p className="text-sm text-gray-500">Loading exchange listings...</p>
          </div>
        )}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-center">
            <p className="text-red-600 text-sm mb-2">{error}</p>
            <button onClick={fetchItems} className="text-teal-600 text-sm underline">Try again</button>
          </div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium mb-1">No exchange listings found</p>
            <p className="text-sm text-gray-400 mb-4">{items.length > 0 ? 'Try adjusting your location filter.' : 'Be the first to post an item for exchange!'}</p>
            <button onClick={() => navigate('/exchange/post')} className="bg-teal-600 text-white px-6 py-2 rounded-xl text-sm font-semibold">Post Your First Item</button>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs text-gray-400 mb-1">{filtered.length} item{filtered.length !== 1 ? 's' : ''} found</p>
            {filtered.map(item => (
              <div key={item.id} onClick={() => navigate('/exchange/' + item.id)}
                className="bg-white rounded-2xl p-4 shadow-sm border cursor-pointer hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 flex-1 pr-2">{item.title}</h3>
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full whitespace-nowrap">{item.category}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>📍 {item.location}</span>
                  <span className={`px-2 py-0.5 rounded-full ${item.condition === 'Good' || item.condition === 'Excellent' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                    {item.condition}
                  </span>
                  <span className="ml-auto">{new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                </div>
                {/* ✅ NEW: View count */}
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                  <Eye className="w-3 h-3" />{item.view_count ?? 0} views
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
