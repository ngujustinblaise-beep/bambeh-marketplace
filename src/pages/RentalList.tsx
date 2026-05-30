// @ts-nocheck
/**
 * RENTAL LIST PAGE — BAMBEH MARKETPLACE
 * Reads listings from localStorage key: Bambeh_rental_listings
 * (Written by the new ListProperty.tsx)
 *
 * FILE LOCATION: src/components/listings/RentalList.tsx
 * © 2026 Bambeh. All rights reserved.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { MapPin, Bed, Bath, Square, Star, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { setMainOrigin } from '@/utils/navigationOrigin';

interface Rental {
  id: string;
  title: string;
  price: number;
  rentType?: string;
  propertyType?: string;
  bedrooms?: number | string;
  bathrooms?: number | string;
  area?: number;
  location?: string;
  quarter?: string;
  city?: string;
  region?: string;
  images?: string[];
  featured?: boolean;
  rating?: number;
  furnished?: string;
  amenities?: string[];
  createdAt?: string;
}

const RentalList = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRentals = () => {
    setLoading(true);
    try {
      const stored = JSON.parse(localStorage.getItem('Bambeh_rental_listings') || '[]');
      setRentals(stored);
    } catch (err) {
      console.error('Failed to load rentals:', err);
      setRentals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRentals();
    const handler = () => loadRentals();
    window.addEventListener('bambeh_listings_updated', handler);
    window.addEventListener('storage', (e) => {
      if (e.key === 'Bambeh_rental_listings') loadRentals();
    });
    return () => window.removeEventListener('bambeh_listings_updated', handler);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm animate-pulse">
              <div className="h-48 bg-gray-200 rounded-xl mb-4" />
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{t('rentalListings', 'Rental Listings')}</h1>
        <button onClick={loadRentals} className="flex items-center gap-2 text-sm text-gray-600 hover:text-teal-600">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rentals.map((rental) => (
          <Card
            key={rental.id}
            onClick={() => navigate(`/rentals/${rental.id}`)}
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
          >
            <div className="relative h-48 w-full overflow-hidden rounded-t-lg bg-gray-100">
              <img
                src={rental.images?.[0] || '/placeholder-property.jpg'}
                alt={rental.title}
                className="h-full w-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-property.jpg'; }}
              />
              {rental.featured && (
                <div className="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Featured
                </div>
              )}
              {rental.furnished && (
                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full">
                  {rental.furnished}
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2 line-clamp-1">{rental.title}</h3>

              <div className="flex items-center text-gray-600 mb-2">
                <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                <span className="text-sm line-clamp-1">
                  {rental.location || [rental.quarter, rental.city, rental.region].filter(Boolean).join(', ')}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-3 text-sm text-gray-700">
                {rental.bedrooms && (
                  <div className="flex items-center gap-1">
                    <Bed className="h-4 w-4" />
                    <span>{rental.bedrooms}</span>
                  </div>
                )}
                {rental.bathrooms && (
                  <div className="flex items-center gap-1">
                    <Bath className="h-4 w-4" />
                    <span>{rental.bathrooms}</span>
                  </div>
                )}
                {rental.area && (
                  <div className="flex items-center gap-1">
                    <Square className="h-4 w-4" />
                    <span>{rental.area}m²</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-primary">{rental.price.toLocaleString()} FCFA</p>
                  <p className="text-sm text-gray-500">/{rental.rentType === 'monthly' ? 'month' : rental.rentType === 'yearly' ? 'year' : 'day'}</p>
                </div>
                {rental.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold">{rental.rating}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {rentals.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🏠</div>
          <p className="text-gray-500 text-lg mb-4">{t('noRentalsFound', 'No rental listings found yet')}</p>
          <p className="text-gray-400 mb-6">Be the first to list a property!</p>
          <Button onClick={() => { setMainOrigin(); navigate('/list-property'); }}>List a Property</Button>
        </div>
      )}
    </div>
  );

}
}
export default RentalList;
