/**
 * src/utils/BambehStore.ts
 * Bambeh Marketplace â€” Global Zustand Store + Missing Exports
 * Â© 2026 Bambeh Marketplace. All rights reserved.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export interface CartItemSummary {
  id: string;
  listingId: string;
  title: string;
  priceXAF: number;
  quantity: number;
  imageUrl?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  type: "order" | "message" | "promo" | "system";
  createdAt: string;
}

export type AppTheme = "light" | "dark" | "system";

// â”€â”€â”€ UnifiedListing â€” used by useAllListings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export interface UnifiedListing {
  id: string;
  type: "marketplace" | "job" | "service" | "rental" | "vehicle" | "exchange";
  title: string;
  description?: string;
  priceXAF?: number;
  imageUrl?: string;
  location?: string;
  sellerId?: string;
  sellerName?: string;
  createdAt: string;
  status: string;
}

// â”€â”€â”€ SearchResult â€” used by GlobalSearchBar / useAllListings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export interface SearchResult {
  id: string;
  type: string;
  title: string;
  description?: string;
  imageUrl?: string;
  priceXAF?: number;
  location?: string;
  createdAt: string;
  relevanceScore?: number;
}

// â”€â”€â”€ Store State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export interface BambehStoreState {
  userId: string | null;
  isVendor: boolean;
  isAdmin: boolean;
  subscriptionTier: string;
  cartItems: CartItemSummary[];
  cartCount: number;
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  theme: AppTheme;
  isOnline: boolean;
  isAppReady: boolean;
  language: string;
  favoriteIds: string[];
  recentSearches: string[];
  allListings: UnifiedListing[];
  lastListingsLoad: number | null;
}

export interface BambehStoreActions {
  setUserId: (userId: string | null) => void;
  setIsVendor: (isVendor: boolean) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  setSubscriptionTier: (tier: string) => void;
  setCartItems: (items: CartItemSummary[]) => void;
  addCartItem: (item: CartItemSummary) => void;
  removeCartItem: (id: string) => void;
  clearCart: () => void;
  setNotifications: (notifications: NotificationItem[]) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (notification: NotificationItem) => void;
  setTheme: (theme: AppTheme) => void;
  setIsOnline: (isOnline: boolean) => void;
  setIsAppReady: (isReady: boolean) => void;
  setLanguage: (language: string) => void;
  toggleFavorite: (listingId: string) => void;
  isFavorite: (listingId: string) => boolean;
  setFavoriteIds: (ids: string[]) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  setAllListings: (listings: UnifiedListing[]) => void;
  reset: () => void;
}

type BambehStore = BambehStoreState & BambehStoreActions;

const initialState: BambehStoreState = {
  userId: null,
  isVendor: false,
  isAdmin: false,
  subscriptionTier: "free",
  cartItems: [],
  cartCount: 0,
  notifications: [],
  unreadNotificationCount: 0,
  theme: "system",
  isOnline: true,
  isAppReady: false,
  language: "fr",
  favoriteIds: [],
  recentSearches: [],
  allListings: [],
  lastListingsLoad: null,
};

// â”€â”€â”€ Store â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const useBambehStore = create<BambehStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUserId: (userId) => set({ userId }),
      setIsVendor: (isVendor) => set({ isVendor }),
      setIsAdmin: (isAdmin) => set({ isAdmin }),
      setSubscriptionTier: (subscriptionTier) => set({ subscriptionTier }),

      setCartItems: (items) =>
        set({
          cartItems: items,
          cartCount: items.reduce((sum, item) => sum + item.quantity, 0),
        }),

      addCartItem: (item) => {
        const items = get().cartItems;
        const existingIdx = items.findIndex((i) => i.listingId === item.listingId);
        if (existingIdx >= 0) {
          const updated = items.map((i, idx) =>
            idx === existingIdx ? { ...i, quantity: i.quantity + 1 } : i
          );
          set({ cartItems: updated, cartCount: updated.reduce((s, i) => s + i.quantity, 0) });
        } else {
          const updated = [...items, item];
          set({ cartItems: updated, cartCount: updated.reduce((s, i) => s + i.quantity, 0) });
        }
      },

      removeCartItem: (id) => {
        const updated = get().cartItems.filter((i) => i.id !== id);
        set({ cartItems: updated, cartCount: updated.reduce((s, i) => s + i.quantity, 0) });
      },

      clearCart: () => set({ cartItems: [], cartCount: 0 }),

      setNotifications: (notifications) =>
        set({ notifications, unreadNotificationCount: notifications.filter((n) => !n.isRead).length }),

      addNotification: (notification) => {
        const updated = [notification, ...get().notifications].slice(0, 50);
        set({ notifications: updated, unreadNotificationCount: updated.filter((n) => !n.isRead).length });
      },

      markNotificationRead: (id) => {
        const updated = get().notifications.map((n) => n.id === id ? { ...n, isRead: true } : n);
        set({ notifications: updated, unreadNotificationCount: updated.filter((n) => !n.isRead).length });
      },

      markAllNotificationsRead: () => {
        const updated = get().notifications.map((n) => ({ ...n, isRead: true }));
        set({ notifications: updated, unreadNotificationCount: 0 });
      },

      setTheme: (theme) => set({ theme }),
      setIsOnline: (isOnline) => set({ isOnline }),
      setIsAppReady: (isAppReady) => set({ isAppReady }),
      setLanguage: (language) => set({ language }),

      toggleFavorite: (listingId) => {
        const ids = get().favoriteIds;
        set({ favoriteIds: ids.includes(listingId) ? ids.filter((id) => id !== listingId) : [...ids, listingId] });
      },

      isFavorite: (listingId) => get().favoriteIds.includes(listingId),
      setFavoriteIds: (favoriteIds) => set({ favoriteIds }),

      addRecentSearch: (query) => {
        const trimmed = query.trim();
        if (!trimmed) return;
        const existing = get().recentSearches.filter((s) => s !== trimmed);
        set({ recentSearches: [trimmed, ...existing].slice(0, 10) });
      },

      clearRecentSearches: () => set({ recentSearches: [] }),
      setAllListings: (allListings) => set({ allListings, lastListingsLoad: Date.now() }),

      reset: () =>
        set({ ...initialState, theme: get().theme, language: get().language, isOnline: get().isOnline }),
    }),
    {
      name: "bambeh-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        favoriteIds: state.favoriteIds,
        recentSearches: state.recentSearches,
      }),
    }
  )
);

// â”€â”€â”€ Selector Hooks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const useCartCount = () => useBambehStore((s) => s.cartCount);
export const useUnreadCount = () => useBambehStore((s) => s.unreadNotificationCount);
export const useIsOnline = () => useBambehStore((s) => s.isOnline);
export const useTheme = () => useBambehStore((s) => s.theme);
export const useLanguage = () => useBambehStore((s) => s.language);
export const useIsVendor = () => useBambehStore((s) => s.isVendor);
export const useIsAdmin = () => useBambehStore((s) => s.isAdmin);

// â”€â”€â”€ Standalone utility functions expected by consumer files â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/** Load all listings into store â€” used by useAllListings.ts */
export async function loadAllListings(): Promise<UnifiedListing[]> {
  try {
    const { supabase } = await import("@/lib/supabase");
    const { data } = await supabase
      .from("marketplace_items")
      .select("id, title, description, price_xaf, city, seller_id, created_at, status")
      .eq("status", "active")
      .limit(200);

    const listings: UnifiedListing[] = (data ?? []).map((row) => ({
      id: row.id as string,
      type: "marketplace" as const,
      title: row.title as string,
      description: row.description as string | undefined,
      priceXAF: row.price_xaf as number | undefined,
      location: row.city as string | undefined,
      sellerId: row.seller_id as string | undefined,
      createdAt: row.created_at as string,
      status: row.status as string,
    }));

    useBambehStore.getState().setAllListings(listings);
    return listings;
  } catch {
    return [];
  }
}

/** Search listings â€” used by useAllListings.ts */
export function searchListings(query: string, listings?: UnifiedListing[]): SearchResult[] {
  const source = listings ?? useBambehStore.getState().allListings;
  if (!query.trim()) return source.map((l) => ({ ...l, relevanceScore: 1 }));
  const q = query.toLowerCase();
  return source
    .filter((l) =>
      l.title.toLowerCase().includes(q) ||
      (l.description ?? "").toLowerCase().includes(q)
    )
    .map((l) => ({ ...l, relevanceScore: l.title.toLowerCase().startsWith(q) ? 2 : 1 }))
    .sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0));
}

/** Record ad view â€” used by GlobalSearchBar */
export async function recordAdView(adId: string, userId?: string): Promise<void> {
  try {
    const { supabase } = await import("@/lib/supabase");
    await supabase.from("ad_views").insert({
      ad_id: adId,
      user_id: userId ?? null,
      viewed_at: new Date().toISOString(),
    });
  } catch {
    // Non-critical
  }
}

/** Check if current user is subscribed â€” used by SubscriptionGate */
export function isCurrentUserSubscribed(): boolean {
  const tier = useBambehStore.getState().subscriptionTier;
  return tier !== "free" && tier !== "";
}
