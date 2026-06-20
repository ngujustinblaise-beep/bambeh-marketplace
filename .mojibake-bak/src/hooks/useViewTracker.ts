/**
 * src/hooks/useViewTracker.ts â€” Bambeh Marketplace
 *
 * Call this hook inside ANY detail page to increment the view_count
 * for that listing in Supabase. It runs once when the page loads.
 *
 * FILE LOCATION: C:\Dev\bambe-android\src\hooks\useViewTracker.ts
 * (Create this file â€” or replace the one you made earlier with this version,
 *  which supports all your different listing tables)
 *
 * USAGE EXAMPLES (what you'll add to each detail page):
 *   useViewTracker(id, 'listings');         â† Marketplace, Job, Service, Vehicle, Rental
 *   useViewTracker(id, 'farm_products');    â† FarmFresh
 *   useViewTracker(id as string, 'exchange_items'); â† Exchange
 */

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Map of table â†’ the SQL function that increments it
const RPC_MAP: Record<string, string> = {
  listings:       'increment_listing_view',
  farm_products:  'increment_farm_view',
  exchange_items: 'increment_exchange_view',
  // If you add more tables later, add them here
};

// Map of the parameter name each RPC function expects
const PARAM_MAP: Record<string, string> = {
  listings:       'listing_id',
  farm_products:  'product_id',
  exchange_items: 'item_id',
};

export function useViewTracker(
  id: string | undefined,
  table: 'listings' | 'farm_products' | 'exchange_items' = 'listings'
) {
  useEffect(() => {
    // Don't run if no id or if it's a demo item (demo ids start with 's')
    if (!id || id.startsWith('s')) return;

    const rpcName  = RPC_MAP[table];
    const paramKey = PARAM_MAP[table];
    if (!rpcName || !paramKey) return;

    // Fire and forget â€” doesn't block page load, doesn't show errors to user
    supabase.rpc(rpcName, { [paramKey]: id }).then(({ error }) => {
      if (error) {
        // Only log in dev, never show to user
        console.debug('[useViewTracker] rpc error:', error.message);
      }
    });
  }, [id, table]); // runs once per id+table combination
}
