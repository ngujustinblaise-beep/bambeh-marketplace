// src/services/api.config.ts

/**
 * ============================================
 * BAMBÉ MARKETPLACE - API CONFIGURATION
 * ============================================
 * Central configuration for all Firebase Cloud Functions
 * Deployed on: January 29, 2026
 * Project: bambe-marketplace
 */

export const API_CONFIG = {
  // Base URLs for each Firebase Cloud Function
  HEALTH: "https://health-whs33gfs2q-uc.a.run.app",
  CREATE_USER: "https://createuser-whs33gfs2q-uc.a.run.app",
  GET_JOBS: "https://getjobs-whs33gfs2q-uc.a.run.app",
  CREATE_JOB: "https://createjob-whs33gfs2q-uc.a.run.app",
  GET_MARKETPLACE_ITEMS: "https://getmarketplaceitems-whs33gfs2q-uc.a.run.app",
  CREATE_MARKETPLACE_ITEM: "https://createmarketplaceitem-whs33gfs2q-uc.a.run.app",
  GET_USER_PROFILE: "https://getuserprofile-whs33gfs2q-uc.a.run.app",
  GET_AUDIT_LOGS: "https://getauditlogs-whs33gfs2q-uc.a.run.app",

  // Timeout configurations
  TIMEOUT: {
    DEFAULT: 10000, // 10 seconds
    UPLOAD: 30000,  // 30 seconds for file uploads
    LONG: 60000,    // 60 seconds for complex operations
  },

  // Request retry configuration
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000, // 1 second
  },
};

/**
 * Get authorization headers with JWT token
 */
export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("authToken");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Handle authentication errors globally
 */
export const handleAuthError = (error: any): void => {
  if (error.response?.status === 401) {
    // Clear auth data
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");

    // Redirect to login
    window.location.href = "/login";
  }
};

/**
 * Format API error messages
 */
export const formatErrorMessage = (
  error: any,
  defaultMessage: string,
): string => {
  return error.response?.data?.message || defaultMessage;
};

/**
 * Check API health
 */
export const checkAPIHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(API_CONFIG.HEALTH);
    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error("API Health Check Failed:", error);
    return false;
  }
};
