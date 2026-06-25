/**
 * queryClient.ts — Bambeh Marketplace
 * © 2026 Bambeh Marketplace. All rights reserved.
 *
 * TanStack Query (React Query v5) global client configuration.
 *
 * Configured for:
 * - Aggressive caching suitable for  3G networks
 * - Background refetch-on-focus for stale data
 * - Automatic retry with exponential backoff
 * - Smart stale times per query type (set via meta.staleTime)
 *
 * Usage in AppProviders.tsx:
 *   import { QueryClientProvider } from '@tanstack/react-query';
 *   import { queryClient } from '@/lib/queryClient';
 *
 *   <QueryClientProvider client={queryClient}>
 *     {children}
 *   </QueryClientProvider>
 *
 * Usage in page components:
 *   const { data: listings } = useQuery({
 *     queryKey: ['listings', category],
 *     queryFn: () => fetchListings(category),
 *   });
 */

import { QueryClient } from "@tanstack/react-query";

// --- QUERY CLIENT -------------------------------------------------------------

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // -- Cache & Stale Times ------------------------------------------------
      // staleTime: how long data is considered fresh (no background refetch)
      // gcTime: how long unused data stays in memory cache
      //
      // These defaults are tuned for  3G:
      // - 5min stale time prevents constant re-fetching on every tab switch
      // - 10min cache keeps listings available offline briefly
      staleTime: 5 * 60 * 1000,   // 5 minutes — critical for  3G
      gcTime: 10 * 60_000,        // 10 minutes

      // -- Refetch Policy ----------------------------------------------------
      // Prevent refetch on app resume — staleTime handles freshness instead
      refetchOnWindowFocus: false,
      // DO refetch when internet returns after an offline period
      refetchOnReconnect: true,
      // Don't refetch on mount if data is still fresh
      refetchOnMount: true,

      // -- Retry Policy ------------------------------------------------------
      // Retry up to 2 times with exponential backoff — handles 3G packet loss
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30_000),

      // -- Network Mode -----------------------------------------------------
      // 'offlineFirst': serve cache when offline, attempt network when online
      networkMode: "offlineFirst",
    },
    mutations: {
      // Retry once — handles transient 3G drops without risking duplicate writes
      retry: 1,
      networkMode: "offlineFirst",
    },
  },
});

// --- QUERY KEY FACTORIES ------------------------------------------------------
// Centralised query key definitions prevent key collisions and make
// cache invalidation surgical and predictable.

export const queryKeys = {
  // Listings
  listings: {
    all: ["listings"] as const,
    list: (category?: string, search?: string) =>
      ["listings", "list", { category, search }] as const,
    detail: (id: string) => ["listings", "detail", id] as const,
    byVendor: (vendorId: string) => ["listings", "vendor", vendorId] as const,
  },

  // Jobs
  jobs: {
    all: ["jobs"] as const,
    list: (category?: string) => ["jobs", "list", category] as const,
    detail: (id: string) => ["jobs", "detail", id] as const,
  },

  // User / Profile
  profile: {
    current: ["profile", "current"] as const,
    byId: (id: string) => ["profile", id] as const,
  },

  // Vendor
  vendor: {
    dashboard: (vendorId: string) => ["vendor", "dashboard", vendorId] as const,
    analytics: (vendorId: string) => ["vendor", "analytics", vendorId] as const,
    orders: (vendorId: string) => ["vendor", "orders", vendorId] as const,
  },

  // Notifications
  notifications: {
    all: ["notifications"] as const,
    unread: ["notifications", "unread"] as const,
  },

  // Offers
  offers: {
    forListing: (listingId: string) => ["offers", "listing", listingId] as const,
    byUser: (userId: string) => ["offers", "user", userId] as const,
  },

  // Tontine
  tontine: {
    all: ["tontine"] as const,
    detail: (id: string) => ["tontine", id] as const,
  },

  // Search
  search: {
    results: (query: string, filters?: object) =>
      ["search", query, filters] as const,
    saved: (userId: string) => ["search", "saved", userId] as const,
  },

  // Flash deals
  deals: {
    active: ["deals", "active"] as const,
  },

  // Coins / Zerm
  coins: {
    balance: (userId: string) => ["coins", "balance", userId] as const,
    history: (userId: string) => ["coins", "history", userId] as const,
  },
} as const;

// --- INVALIDATION HELPERS -----------------------------------------------------

/**
 * Call after posting a new listing — refreshes all listing lists
 */
export const invalidateListings = () =>
  queryClient.invalidateQueries({ queryKey: queryKeys.listings.all });

/**
 * Call after accepting/declining an offer — refreshes offer state
 */
export const invalidateOffers = (listingId: string) =>
  queryClient.invalidateQueries({ queryKey: queryKeys.offers.forListing(listingId) });

/**
 * Call after subscription purchase — refreshes profile + subscription status
 */
export const invalidateProfile = () =>
  queryClient.invalidateQueries({ queryKey: queryKeys.profile.current });

/**
 * Call after vendor action — refreshes dashboard and analytics
 */
export const invalidateVendorDashboard = (vendorId: string) =>
  queryClient.invalidateQueries({ queryKey: queryKeys.vendor.dashboard(vendorId) });

export default queryClient;

