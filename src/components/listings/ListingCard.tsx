import React from 'react';
import { DemoBadge } from './DemoBadge';

export interface Listing {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  isDemo: boolean;
  createdAt: string; // ISO date string
}

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <div className="rounded-xl overflow-hidden shadow-md bg-white border border-gray-100 hover:shadow-lg transition-shadow">
      {/* Image container — must be `relative` so the badge positions correctly */}
      <div className="relative w-full h-48">
        <img
          src={listing.imageUrl}
          alt={listing.title}
          className={`w-full h-full object-cover ${listing.isDemo ? 'opacity-80' : ''}`}
        />
        {listing.isDemo && <DemoBadge />}
      </div>

      <div className="p-3">
        <h3 className="text-sm font-semibold text-gray-800 truncate">{listing.title}</h3>
        <p className="text-sm text-green-700 font-bold mt-1">
          {listing.price.toLocaleString()} FCFA
        </p>
        {listing.isDemo && (
          <p className="text-xs text-yellow-700 mt-1 italic">
            Sample listing — not for sale
          </p>
        )}
      </div>
    </div>
  );
}
