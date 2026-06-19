// src/services/auth.service.ts
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
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    subscriptionTier: string;
  };
}

export interface ForgotPasswordData { email: string; }

export interface ResetPasswordData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// ============================================
// SERVICE METHODS
// ============================================

/**
 * Login user with email and password
 */
export const login = async (
  credentials: LoginCredentials,
): Promise<AuthResponse> => {
  try {
    const response = await axios.post(
      `${API_CONFIG.CREATE_USER}/login`,
      credentials,
      { timeout: API_CONFIG.TIMEOUT.DEFAULT },
    );

    const { token, user } = response.data.data;

    // Store auth data
    localStorage.setItem("authToken", token);
    localStorage.setItem("user", JSON.stringify(user));

    return response.data.data;
  } catch (error: any) {
    throw new Error(formatErrorMessage(error, "Login failed"));
  }
};

/**
 * Register new user
 */
export const register = async (
  userData: RegisterData,
): Promise<AuthResponse> => {
  try {
    const response = await axios.post(API_CONFIG.CREATE_USER, userData, {
      timeout: API_CONFIG.TIMEOUT.DEFAULT,
    });

    const { token, user } = response.data.data;

    // Store auth data
    localStorage.setItem("authToken", token);
    localStorage.setItem("user", JSON.stringify(user));

    return response.data.data;
  } catch (error: any) {
    throw new Error(formatErrorMessage(error, "Registration failed"));
  }
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  try {
    // Clear local storage
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");

    // Redirect to login
    window.location.href = "/login";
  } catch (error: any) {
    throw new Error("Logout failed");
  }
};

/**
 * Request password reset
 */
export const forgotPassword = async (
  data: ForgotPasswordData,
): Promise<void> => {
  try {
    await axios.post(`${API_CONFIG.CREATE_USER}/forgot-password`, data, {
      timeout: API_CONFIG.TIMEOUT.DEFAULT,
    });
  } catch (error: any) {
    throw new Error(formatErrorMessage(error, "Failed to send reset email"));
  }
};

/**
 * Reset password with token
 */
export const resetPassword = async (data: ResetPasswordData): Promise<void> => {
  try {
    await axios.post(`${API_CONFIG.CREATE_USER}/reset-password`, data, {
      timeout: API_CONFIG.TIMEOUT.DEFAULT,
    });
  } catch (error: any) {
    throw new Error(formatErrorMessage(error, "Failed to reset password"));
  }
};

/**
 * Verify email with token
 */
export const verifyEmail = async (token: string): Promise<void> => {
  try {
    await axios.post(
      `${API_CONFIG.CREATE_USER}/verify-email`,
      { token },
      { timeout: API_CONFIG.TIMEOUT.DEFAULT },
    );
  } catch (error: any) {
    throw new Error(formatErrorMessage(error, "Email verification failed"));
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("authToken");
  return token !== null;
};

/**
 * Get current user from local storage
 */
export const getCurrentUser = (): any | null => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch (error) {
    return null;
  }
};

/**
 * Refresh auth token
 */
export const refreshToken = async (): Promise<string> => {
  try {
    const headers = getAuthHeaders();

    const response = await axios.post(
      `${API_CONFIG.CREATE_USER}/refresh-token`,
      {},
      { headers, timeout: API_CONFIG.TIMEOUT.DEFAULT },
    );

    const { token } = response.data.data;
    localStorage.setItem("authToken", token);

    return token;
  } catch (error: any) {
    handleAuthError(error);
    throw new Error(formatErrorMessage(error, "Failed to refresh token"));
  }
};
