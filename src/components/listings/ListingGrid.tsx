import React from 'react';
import { ListingCard, Listing } from './ListingCard';

interface ListingGridProps {
  listings: Listing[];
}

/**
 * Renders all listings with real user listings sorted ABOVE demo listings.
 * Within each group, newest items appear first (by createdAt).
 */
export function ListingGrid({ listings }: ListingGridProps) {
  const sorted = [...listings].sort((a, b) => {
    // Real listings first
    if (a.isDemo !== b.isDemo) return a.isDemo ? 1 : -1;
    // Within same group, newest first
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const realCount = sorted.filter((l) => !l.isDemo).length;
  const demoCount = sorted.length - realCount;

  return (
    <div>
      {realCount > 0 && (
        <p className="text-xs text-gray-400 mb-3 px-1">
          {realCount} listing{realCount !== 1 ? 's' : ''} available
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {sorted.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>

      {demoCount > 0 && (
        <p className="text-xs text-yellow-600 mt-4 px-1 text-center">
          ⭐ {demoCount} sample listing{demoCount !== 1 ? 's' : ''} shown for demonstration only
        </p>
      )}
    </div>
  );
}





