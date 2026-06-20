/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * FAVORITES UTILITIES - WITH REAL-TIME EVENT SYNC
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 *
 * ✅ Saves to localStorage
 * ✅ Dispatches events for real-time updates
 * ✅ Used by all detail pages
 * ✅ Syncs with Favorites page instantly
 *
 * © 2025 Bambeh. All rights reserved.
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */

const FAVORITES_KEY = "Bambeh_favorites";

export interface FavoriteItem {
  id: string;
  type: string;
  title: string;
  location: string;
  price?: number | string;
  salary?: string;
  image?: string;
}

/**
 * Get all favorites from localStorage
 */
export const getFavorites = (): FavoriteItem[] => {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    }
    return [];
  } catch (error) {
    console.error("Error getting favorites:", error);
    return [];
  }
};

/**
 * Save a favorite item
 * Returns true if saved, false if already exists (and removes it)
 */
export const saveFavorite = (item: FavoriteItem): boolean => {
  try {
    const favorites = getFavorites();

    // Check if already exists
    const existingIndex = favorites.findIndex(
      (fav) => fav.id === item.id && fav.type === item.type,
    );

    if (existingIndex !== -1) {
      // Already exists, don't add again
      return false;
    }

    // Add new favorite
    favorites.push(item);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));

    // 🚀 Dispatch event for real-time sync with Favorites page!
    window.dispatchEvent(new Event("favoritesChanged"));

    return true;
  } catch (error) {
    console.error("Error saving favorite:", error);
    return false;
  }
};

/**
 * Remove a favorite item
 */
export const removeFavorite = (id: string, type: string): boolean => {
  try {
    const favorites = getFavorites();
    const filtered = favorites.filter(
      (fav) => !(fav.id === id && fav.type === type),
    );

    localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));

    // 🚀 Dispatch event for real-time sync!
    window.dispatchEvent(new Event("favoritesChanged"));

    return true;
  } catch (error) {
    console.error("Error removing favorite:", error);
    return false;
  }
};

/**
 * Check if an item is favorited
 */
export const isFavorite = (id: string, type: string): boolean => {
  try {
    const favorites = getFavorites();
    return favorites.some((fav) => fav.id === id && fav.type === type);
  } catch (error) {
    console.error("Error checking favorite:", error);
    return false;
  }
};

/**
 * Clear all favorites
 */
export const clearFavorites = (): boolean => {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([]));

    // 🚀 Dispatch event for real-time sync!
    window.dispatchEvent(new Event("favoritesChanged"));

    return true;
  } catch (error) {
    console.error("Error clearing favorites:", error);
    return false;
  }
};

/**
 * Get favorites count
 */
export const getFavoritesCount = (): number => {
  return getFavorites().length;
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// SOCIAL SHARING UTILITIES
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export const shareToWhatsApp = (title: string, url: string) => {
  const text = encodeURIComponent(`Check out: ${title}\n${url}`);
  window.open(`https://wa.me/?text=${text}`, "_blank");
};

export const shareToFacebook = (url: string) => {
  window.open(
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    "_blank",
  );
};

export const shareToTwitter = (title: string, url: string) => {
  const text = encodeURIComponent(title);
  window.open(
    `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`,
    "_blank",
  );
};

export const shareToGmail = (
  title: string,
  url: string,
  description: string,
) => {
  const subject = encodeURIComponent(title);
  const body = encodeURIComponent(`${description}\n\n${url}`);
  window.open(
    `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`,
    "_blank",
  );
};

export const copyLink = (url: string): boolean => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = url;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.select();
      const success = document.execCommand("copy");
      document.body.removeChild(textArea);
      return success;
    }
  } catch (error) {
    console.error("Error copying link:", error);
    return false;
  }
};
