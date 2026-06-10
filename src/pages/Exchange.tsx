/**
 * src/pages/Exchange.tsx — Bambeh Marketplace
 * FIXED:
 *  ✅ Uses shared @/lib/supabase (no inline createClient)
 *  ✅ Realtime subscription properly cleaned up
 *  ✅ Expiry badge shown when listing expires within 3 days
 *  ✅ Auth guard on Post Item button
 *  ✅ Offer count displayed
 *  ✅ Safe area insets for Android bottom nav
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftRight, Plus, Package, Loader2,
  RefreshCw, Eye, Clock, Flame,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LocationFilter, LocationFilters, EMPTY_LOCATION } from '@/components/filters/LocationFilter';
import { useLang, t } from "@/hooks/useAppLang";
import { FeaturedAdsStrip } from "@/components/ads/FeaturedAdsStrip";

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
  const [items,            setItems]            = useState<ExchangeItem[]>([]);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState<string | null>(null);
  const [locationFilters,  setLocationFilters]  = useState<LocationFilters>(EMPTY_LOCATION);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  async function fetchItems() {
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('exchange_items')
        .select('id, title, category, condition, location, description, created_at, expires_at, user_id, view_count, offer_count, images')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(50);
      if (err) throw err;
      setItems((data ?? []) as ExchangeItem[]);
    } catch (e: any) {
      setError('Could not load listings. Check your connection.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchItems();

    channelRef.current = supabase
      .channel('exchange_items_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'exchange_items' },
        () => { fetchItems(); }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handlePostClick() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate('/login'); return; }
    navigate('/exchange/post');
  }

  const filtered = items.filter(item => {
    const loc = item.location.toLowerCase();
    if (locationFilters.region   && !loc.includes(locationFilters.region.toLowerCase()))   return false;
    if (locationFilters.city     && !loc.includes(locationFilters.city.toLowerCase()))     return false;
    if (locationFilters.quarter  && !loc.includes(locationFilters.quarter.toLowerCase()))  return false;
    if (locationFilters.landmark && !loc.includes(locationFilters.landmark.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ArrowLeftRight className="w-6 h-6 text-teal-600" /> Exchange
          </h1>
          <div className="flex gap-2">
            <button
              onClick={fetchItems}
              className="p-2 text-gray-500 hover:text-teal-600 rounded-xl hover:bg-gray-100"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handlePostClick}
              className="bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1 hover:bg-teal-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> Post Item
            </button>
          </div>
        </div>

        {/* Location Filter */}
        <LocationFilter onFilterChange={setLocationFilters} />

        {/* Featured Ads */}
        <div className="mt-2 mb-1">
          <FeaturedAdsStrip category="exchange" showHeader={false} maxVisible={20} />
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center py-16 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            <p className="text-sm text-gray-500">Loading exchange listings...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-center">
            <p className="text-red-600 text-sm mb-2">{error}</p>
            <button onClick={fetchItems} className="text-teal-600 text-sm underline">Try again</button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium mb-1">No exchange listings found</p>
            <p className="text-sm text-gray-400 mb-4">
              {items.length > 0
                ? 'Try adjusting your location filter.'
                : 'Be the first to post an item for exchange!'}
            </p>
            <button
              onClick={handlePostClick}
              className="bg-teal-600 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors"
            >
              Post Your First Item
            </button>
          </div>
        )}

        {/* Listings */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs text-gray-400 mb-1">
              {filtered.length} item{filtered.length !== 1 ? 's' : ''} found
            </p>
            {filtered.map(item => {
              const thumb = item.images?.[0];
              const expiresDays = item.expires_at ? daysUntil(item.expires_at) : null;
              const expiringSoon = expiresDays !== null && expiresDays <= 3 && expiresDays >= 0;

              return (
                <div
                  key={item.id}
                  onClick={() => navigate('/exchange/' + item.id)}
                  className="bg-white rounded-2xl shadow-sm border cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
                >
                  {/* Expiry warning banner */}
                  {expiringSoon && (
                    <div className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-50 border-b border-amber-200">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span className="text-xs text-amber-700 font-medium">
                        Expires in {expiresDays === 0 ? 'less than 24h' : `${expiresDays} day${expiresDays !== 1 ? 's' : ''}`}
                      </span>
                    </div>
                  )}

                  <div className="flex gap-3 p-4">
                    {/* Thumbnail */}
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={item.title}
                        className="w-20 h-20 rounded-xl object-cover flex-shrink-0 bg-gray-100"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Package className="w-8 h-8 text-gray-300" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold text-gray-900 truncate pr-2">{item.title}</h3>
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                          {item.category}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>

                      <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                        <span>📍 {item.location}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full ${
                            item.condition === 'Good' || item.condition === 'Excellent'
                              ? 'bg-green-50 text-green-700'
                              : 'bg-yellow-50 text-yellow-700'
                          }`}
                        >
                          {item.condition}
                        </span>
                        <span className="ml-auto">
                          {new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-1.5">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />{item.view_count ?? 0}
                        </span>
                        {(item.offer_count ?? 0) > 0 && (
                          <span className="flex items-center gap-1 text-teal-600 font-medium">
                            <Flame className="w-3 h-3" />{item.offer_count} offer{item.offer_count !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
