// src/services/favorites.service.ts
import axios from "axios";
import {
  API_CONFIG,
  getAuthHeaders,
  handleAuthError,
  formatErrorMessage
} from "./api.config";

// ============================================
// TYPES
// ============================================
export interface Favorite {
  id: string;
  userId: string;
  itemId: string;
  itemType: "job" | "marketplace" | "service" | "property" | "car_rental";
  itemData: {
    title: string;
    price?: number;
    currency?: string;
    image?: string;
    location?: string;
  };
  addedAt: Date;
}

export interface AddToFavoritesData {
  itemId: string;
  itemType: "job" | "marketplace" | "service" | "property" | "car_rental";
}

// ============================================
// SERVICE METHODS
// ============================================

/**
 * Get all user's favorites
 */
export const getFavorites = async (itemType?: string): Promise<Favorite[]> => {
  try {
    const headers = getAuthHeaders();
    const params = new URLSearchParams();

    if (itemType) params.append("type", itemType);

    const url = `${API_CONFIG.GET_MARKETPLACE_ITEMS}/favorites${params.toString() ? "?" + params.toString() : ""}`;

    const response = await axios.get(url, {
      headers,
      timeout: API_CONFIG.TIMEOUT.DEFAULT,
    });

    return response.data.data.favorites || [];
  } catch (error: any) {
    handleAuthError(error);
    throw new Error(formatErrorMessage(error, "Failed to fetch favorites"));
};

/**
 * Add item to favorites
 */
}
export const addToFavorites = async (
  itemData: AddToFavoritesData,
): Promise<Favorite> => {
  try {
    const headers = getAuthHeaders();

    const response = await axios.post(
      `${API_CONFIG.CREATE_MARKETPLACE_ITEM}/favorites/add`,
      itemData,
      { headers, timeout: API_CONFIG.TIMEOUT.DEFAULT },
    );

    return response.data.data.favorite;
  } catch (error: any) {
    handleAuthError(error);
    throw new Error(formatErrorMessage(error, "Failed to add to favorites"));
};

/**
 * Remove item from favorites
 */
}
export const removeFromFavorites = async (
  favoriteId: string,
): Promise<void> => {
  try {
    const headers = getAuthHeaders();

    await axios.delete(
      `${API_CONFIG.CREATE_MARKETPLACE_ITEM}/favorites/${favoriteId}`,
      { headers, timeout: API_CONFIG.TIMEOUT.DEFAULT },
    );
  } catch (error: any) {
    handleAuthError(error);
    throw new Error(
      formatErrorMessage(error, "Failed to remove from favorites"),
    );
};

/**
 * Check if item is in favorites
 */
}
export const isFavorite = async (
  itemId: string,
  itemType: string,
): Promise<boolean> => {
  try {
    const headers = getAuthHeaders();

    const response = await axios.get(
      `${API_CONFIG.GET_MARKETPLACE_ITEMS}/favorites/check/${itemId}?type=${itemType}`,
      { headers, timeout: API_CONFIG.TIMEOUT.DEFAULT },
    );

    return response.data.data.isFavorite || false;
  } catch (error: any) {
    handleAuthError(error);
    return false;
  }
};

/**
 * Get favorites count
 */
export const getFavoritesCount = async (): Promise<number> => {
  try {
    const headers = getAuthHeaders();

    const response = await axios.get(
      `${API_CONFIG.GET_MARKETPLACE_ITEMS}/favorites/count`,
      { headers, timeout: API_CONFIG.TIMEOUT.DEFAULT },
    );

    return response.data.data.count || 0;
  } catch (error: any) {
    handleAuthError(error);
    return 0;
  }
};

/**
 * Clear all favorites
 */
export const clearAllFavorites = async (): Promise<void> => {
  try {
    const headers = getAuthHeaders();

    await axios.delete(
      `${API_CONFIG.CREATE_MARKETPLACE_ITEM}/favorites/clear`,
      { headers, timeout: API_CONFIG.TIMEOUT.DEFAULT },
    );
  } catch (error: any) {
    handleAuthError(error);
    throw new Error(formatErrorMessage(error, "Failed to clear favorites"));
};

/**
 * Toggle favorite (add if not exists, remove if exists)
 */
}
export const toggleFavorite = async (
  itemData: AddToFavoritesData,
): Promise<boolean> => {
  try {
    const headers = getAuthHeaders();

    const response = await axios.post(
      `${API_CONFIG.CREATE_MARKETPLACE_ITEM}/favorites/toggle`,
      itemData,
      { headers, timeout: API_CONFIG.TIMEOUT.DEFAULT },
    );

    return response.data.data.isFavorite;
  } catch (error: any) {
    handleAuthError(error);
    throw new Error(formatErrorMessage(error, "Failed to toggle favorite"));
};
}