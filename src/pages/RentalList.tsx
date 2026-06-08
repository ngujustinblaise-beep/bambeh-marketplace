// @ts-nocheck
/**
 * src/components/listings/RentalList.tsx — Bambeh Marketplace
 *
 * FIXES IN THIS VERSION:
 *  ✅ FIX 1 — CRITICAL: Broken JSX structure fixed (loading block was never closed,
 *             trapping the main return statement inside it — caused the "Oops" crash)
 *  ✅ FIX 2 — Reads from Supabase instead of localStorage (cross-device visibility)
 *  ✅ FIX 3 — Real-time subscription so new listings appear without refresh
 *  ✅ FIX 4 — Storage event listener now properly cleaned up (no memory leak)
 *  ✅ FIX 5 — Navigate to /rentals/:id for details (correct route)
 *  ✅ FIX 6 — pb-28 so bottom nav never covers cards
 *  ✅ FIX 7 — Error state with user-friendly banner
 *
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Bed, Bath, Square, Star, RefreshCw, Loader2, AlertCircle, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang, t } from "@/hooks/useAppLang";

interface Rental {
  id: string;
  title: string;
  price: number;
  rentType?: string;
  type?: string;
  bedrooms?: number | string;
  bathrooms?: number | string;
  area?: number;
  location?: string;
  quartier?: string;
  city?: string;
  region?: string;
  images?: string[];
  featured?: boolean;
  rating?: number;
  isFurnished?: boolean;
  createdAt?: string;
}

const RentalList = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [rentals,  setRentals]  = useState<Rental[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  // ✅ FIX 2: fetch from Supabase so all users see the same data
  const loadRentals = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const { data, error: sbError } = await supabase
        .from('rentals')
        .select('id, title, price, type, bedrooms, bathrooms, area, location, quartier, region, images, is_furnished, created_at')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(60);

      if (sbError) throw sbError;

      setRentals(
        (data || []).map((d) => ({
          id:          d.id,
          title:       d.title        || 'Untitled',
          price:       d.price        ?? 0,
          type:        d.type         || 'Apartment',
          bedrooms:    d.bedrooms,
          bathrooms:   d.bathrooms,
          area:        d.area,
          location:    d.location     || '',
          quartier:    d.quartier     || '',
          region:      d.region       || '',
          images:      d.images       || [],
          isFurnished: d.is_furnished ?? false,
          createdAt:   d.created_at,
        }))
      );
    } catch (err: any) {
      console.error('[RentalList] fetch error:', err);
      setError('Could not load listings. Please refresh.');
      setRentals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ FIX 3 + FIX 4: realtime subscription with proper cleanup
  useEffect(() => {
    loadRentals();

    const channel = supabase
      .channel('rental_list_feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rentals' }, loadRentals)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadRentals]);

  // ✅ FIX 1 CRITICAL: loading block is now properly closed before the main return
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 pb-28">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm animate-pulse">
              <div className="h-48 bg-gray-200 rounded-xl mb-4"/>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"/>
              <div className="h-4 bg-gray-100 rounded w-1/2"/>
            </div>
          ))}
        </div>
      </div>
    );
  } // ← ✅ FIX 1: this brace was missing — closing the if(loading) block properly

  return (
    <div className="container mx-auto px-4 py-8 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('rentalListings', 'Rental Listings')}
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={loadRentals}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-500
                       p-2 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="Refresh"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button
            onClick={() => navigate('/rentals/list')}
            className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl
                       text-sm font-semibold hover:bg-orange-600 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" /> List Property
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200
                        text-amber-700 rounded-xl px-4 py-3 mb-6 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rentals.map((rental) => (
          <Card
            key={rental.id}
            onClick={() => navigate(`/rentals/${rental.id}`)}
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]
                       overflow-hidden"
          >
            {/* Image */}
            <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-orange-100 to-amber-100">
              {rental.images?.[0] ? (
                <img
                  src={rental.images[0]}
                  alt={rental.title}
                  className="h-full w-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-4xl">🏠</div>
              )}
              {rental.featured && (
                <div className="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1
                                rounded-full text-xs font-semibold">
                  Featured
                </div>
              )}
              {rental.isFurnished && (
                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px]
                                px-2 py-0.5 rounded-full">
                  Furnished
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className="text-lg font-semibold mb-1 line-clamp-1 text-gray-900">
                {rental.title}
              </h3>

              {rental.type && (
                <span className="inline-block text-xs bg-orange-50 text-orange-700 px-2 py-0.5
                                 rounded-full mb-2">
                  {rental.type}
                </span>
              )}

              <div className="flex items-center text-gray-500 mb-2">
                <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0 text-orange-400" />
                <span className="text-sm line-clamp-1">
                  {[rental.quartier, rental.location, rental.city, rental.region]
                    .filter(Boolean)
                    .join(', ') || 'Location not specified'}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-3 text-sm text-gray-500">
                {rental.bedrooms && (
                  <div className="flex items-center gap-1">
                    <Bed className="h-3.5 w-3.5" />
                    <span>{rental.bedrooms}</span>
                  </div>
                )}
                {rental.bathrooms && (
                  <div className="flex items-center gap-1">
                    <Bath className="h-3.5 w-3.5" />
                    <span>{rental.bathrooms}</span>
                  </div>
                )}
                {rental.area && (
                  <div className="flex items-center gap-1">
                    <Square className="h-3.5 w-3.5" />
                    <span>{rental.area} m²</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-bold text-orange-600">
                    {rental.price.toLocaleString()} XAF
                  </p>
                  <p className="text-xs text-gray-400">
                    /{rental.rentType === 'monthly' ? 'month'
                       : rental.rentType === 'yearly' ? 'year'
                       : 'month'}
                  </p>
                </div>
                {rental.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold text-gray-700">{rental.rating}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {rentals.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🏠</div>
          <p className="text-gray-600 text-lg font-medium mb-2">
            {t('noRentalsFound', 'No rental listings found yet')}
          </p>
          <p className="text-gray-400 text-sm mb-6">Be the first to list a property!</p>
          <Button
            onClick={() => navigate('/rentals/list')}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            List a Property
          </Button>
        </div>
      )}
    </div>
  );
};

export default RentalList;
