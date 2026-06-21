/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FAVORITES SYSTEM - Utility Functions
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ✅ Add/remove favorites
 * ✅ Persist across sessions (localStorage)
 * ✅ Check if item is favorited
 * ✅ Get all favorites or by type
 *
 * FILE LOCATION: src/utils/favoritesSystem.ts
 *
 * © 2025 Bambeh. All rights reserved.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface FavoriteItem {
  id: string;
  title: string;
  type: "job" | "marketplace" | "service" | "rental" | "vehicle";
  price?: string;
  location?: string;
  image?: string;
  addedAt: string;
}

/**
 * Add an item to favorites
 * Returns true if added successfully, false if already in favorites
 */
export function addToFavorites(item: FavoriteItem): boolean {
  try {
    const favorites = getFavorites();

    // Check if already in favorites
    if (favorites.some((fav) => fav.id === item.id)) {
      return false; // Already favorited
    }

    favorites.push({
      ...item,
      addedAt: new Date().toISOString(),
    });

    localStorage.setItem("Bambeh_favorites", JSON.stringify(favorites));
    return true;
  } catch (error) {
    console.error("Error adding to favorites:", error);
    return false;
  }
}

/**
 * Remove an item from favorites
 * Returns true if removed successfully
 */
export function removeFromFavorites(itemId: string): boolean {
  try {
    const favorites = getFavorites();
    const filtered = favorites.filter((fav) => fav.id !== itemId);
    localStorage.setItem("Bambeh_favorites", JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error("Error removing from favorites:", error);
    return false;
  }
}

/**
 * Check if an item is in favorites
 */
export function isFavorite(itemId: string): boolean {
  const favorites = getFavorites();
  return favorites.some((fav) => fav.id === itemId);
}

/**
 * Get all favorites
 */
export function getFavorites(): FavoriteItem[] {
  try {
    const favoritesStr = localStorage.getItem("Bambeh_favorites");
    return favoritesStr ? JSON.parse(favoritesStr) : [];
  } catch (error) {
    console.error("Error getting favorites:", error);
    return [];
  }
}

/**
 * Get favorites by type
 */
export function getFavoritesByType(type: FavoriteItem["type"]): FavoriteItem[] {
  const favorites = getFavorites();
  return favorites.filter((fav) => fav.type === type);
}

/**
 * Get favorites count
 */
export function getFavoritesCount(): number {
  const favorites = getFavorites();
  return favorites.length;
}

/**
 * Clear all favorites
 */
export function clearAllFavorites(): boolean {
  try {
    localStorage.setItem("Bambeh_favorites", JSON.stringify([]));
    return true;
  } catch (error) {
    console.error("Error clearing favorites:", error);
    return false;
  }
}
