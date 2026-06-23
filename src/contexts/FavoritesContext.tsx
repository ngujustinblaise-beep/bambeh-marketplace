/**
 * FAVORITES CONTEXT
 * Manages user's favorite items (jobs, products, services, rentals)
 */

import React, { 
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from "react";

// Favorite Item Type
export interface FavoriteItem {
  id: string;
  type: "job" | "product" | "service" | "rental";
  title: string;
  imageUrl?: string;
  price?: number;
  location?: string;
  addedAt: Date;
}

// Context Type
interface FavoritesContextType {
  favorites: FavoriteItem[];
  favoritesCount: number;
  isFavorite: (id: string) => boolean;
  addFavorite: (item: Omit<FavoriteItem, "addedAt">) => void;
  removeFavorite: (id: string) => void;
  toggleFavorite: (item: Omit<FavoriteItem, "addedAt">) => void;
  clearFavorites: () => void;
  getFavoritesByType: (type: FavoriteItem["type"]) => FavoriteItem[];
}

// Create Context
const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined,
);

// Local Storage Key
const FAVORITES_STORAGE_KEY = "bambe_favorites";

// Provider Component
export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const favoritesWithDates = parsed.map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt),
        }));
        setFavorites(favoritesWithDates);
      }
    } catch (error) {
      console.error("Error loading favorites from localStorage:", error);
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error("Error saving favorites to localStorage:", error);
    }
  }, [favorites]);

  // Get favorites count
  const favoritesCount = favorites.length;

  // Check if an item is in favorites
  const isFavorite = useCallback(
    (id: string) => {
      return favorites.some((item) => item.id === id);
    },
    [favorites],
  );

  // Add item to favorites
  const addFavorite = useCallback((item: Omit<FavoriteItem, "addedAt">) => {
    setFavorites((prev) => {
      // Check if already exists
      if (prev.some((fav) => fav.id === item.id)) {
        return prev;
      }
      // Add new favorite
      return [...prev, { ...item, addedAt: new Date() }];
    });
  }, []);

  // Remove item from favorites
  const removeFavorite = useCallback((id: string) => {
    setFavorites((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Toggle favorite (add if not present, remove if present)
  const toggleFavorite = useCallback((item: Omit<FavoriteItem, "addedAt">) => {
    setFavorites((prev) => {
      const exists = prev.some((fav) => fav.id === item.id);
      if (exists) {
        // Remove
        return prev.filter((fav) => fav.id !== item.id);
      } else {
        return [...prev, { ...item, addedAt: new Date() }];
      }
    });
  }, []);

  // Clear all favorites
  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  // Get favorites by type
  const getFavoritesByType = useCallback(
    (type: FavoriteItem["type"]) => {
      return favorites.filter((item) => item.type === type);
    },
    [favorites],
  );

  const value: FavoritesContextType = {
    favorites,
    favoritesCount,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    clearFavorites,
    getFavoritesByType
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

// Custom Hook
export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}

export default FavoritesContext;






