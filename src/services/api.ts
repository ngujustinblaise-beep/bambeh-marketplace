/**
 * BAMBEH MARKETPLACE - WORLD-CLASS API SERVICE
 * Centralized API client with interceptors, error handling, offline support
 * Built to standards of: Jumia, Amazon, OLX, eBay
 * @author Big Blaise - ETS BUSHENERGY
 * @version 1.0.0
 */

import axios, {
  AxiosInstance,
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse
} from "axios";
import { auth } from "@/utils/firebase/firebaseConfig";

// ============================================
// CONFIGURATION
// ============================================
const API_BASE_URL = (import.meta as any).env?.DEV
  ? "http://localhost:5001/bambeh-app/us-central1" // Development
  : "https://us-central1-bambeh-app.cloudfunctions.net"; // Production

const API_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// ============================================
// TYPES & INTERFACES
// ============================================
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  timestamp: number;
}

export interface ApiError {
  message: string;
  code: string;
  status?: number;
  details?: any;
}

interface RequestQueueItem {
  config: AxiosRequestConfig;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}

// ============================================
// AXIOS INSTANCE CONFIGURATION
// ============================================
class ApiService {
  private axiosInstance: AxiosInstance;
  private requestQueue: RequestQueueItem[] = [];
  private isOnline: boolean = true;
  private retryCount: Map<string, number> = new Map();

  constructor() {
    // Initialize Axios instance
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    // Setup interceptors
    this.setupRequestInterceptor();
    this.setupResponseInterceptor();

    // Monitor network status
    this.setupNetworkMonitoring();
  }

  // ============================================
  // REQUEST INTERCEPTOR
  // ============================================
  private setupRequestInterceptor(): void {
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        try {
          // Add authentication token
          const user = auth.currentUser;
          if (user) {
            const token = await user.getIdToken();
            config.headers.Authorization = `Bearer ${token}`;
          }

          // Add request ID for tracking
          config.headers["X-Request-ID"] = this.generateRequestId();

          // Add timestamp
          config.headers["X-Request-Time"] = new Date().toISOString();

          // Add device info
          config.headers["X-Device-Platform"] = "android";
          config.headers["X-App-Version"] = "1.0.0";

          console.log(
            `📤 API Request: ${config.method?.toUpperCase()} ${config.url}`,
          );

          return config;
        } catch (error) {
          console.error("❌ Request interceptor error:", error);
          return Promise.reject(error);
        }
      },
      (error) => {
        console.error("❌ Request configuration error:", error);
        return Promise.reject(error);
      },
    );
  }

  // ============================================
  // RESPONSE INTERCEPTOR
  // ============================================
  private setupResponseInterceptor(): void {
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(
          `✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`,
        );

        // Cache successful responses
        this.cacheResponse(response);

        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        // Handle network errors
        if (!error.response) {
          return this.handleNetworkError(error, originalRequest);
        }

        // Handle authentication errors
        if (error.response.status === 401) {
          return this.handleAuthError(error, originalRequest);
        }

        // Handle rate limiting
        if (error.response.status === 429) {
          return this.handleRateLimitError(error, originalRequest);
        }

        // Handle server errors with retry
        if (error.response.status >= 500 && this.shouldRetry(originalRequest)) {
          return this.retryRequest(originalRequest);
        }

        console.error(
          `❌ API Error: ${error.response.status} - ${error.message}`,
        );
        return Promise.reject(this.normalizeError(error));
      },
    );
  }

  // ============================================
  // NETWORK MONITORING
  // ============================================
  private setupNetworkMonitoring(): void {
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => {
        const wasOffline = !this.isOnline;
        this.isOnline = true;
        if (wasOffline) {
          console.log("🌐 Network restored - Processing queued requests");
          this.processRequestQueue();
        }
      });

      window.addEventListener("offline", () => {
        this.isOnline = false;
        console.log("📴 Network offline - Requests will be queued");
      });

      // Set initial online state
      this.isOnline = navigator.onLine;
    }
  }

  // ============================================
  // ERROR HANDLERS
  // ============================================
  private async handleNetworkError(
    error: AxiosError,
    config: AxiosRequestConfig,
  ): Promise<any> {
    if (!this.isOnline) {
      return new Promise((resolve, reject) => {
        this.requestQueue.push({ config, resolve, reject });
        console.log(`📥 Request queued: ${config.url}`);
      });
    }

    // Try to get cached response
    const cachedResponse = await this.getCachedResponse(config);
    if (cachedResponse) {
      console.log(`💾 Serving cached response: ${config.url}`);
      return cachedResponse;
    }

    return Promise.reject(this.normalizeError(error));
  }

  private async handleAuthError(
    error: AxiosError,
    config: AxiosRequestConfig & { _retry?: boolean },
  ): Promise<any> {
    if (config._retry) {
      // Already retried, logout user
      await auth.signOut();
      return Promise.reject(this.normalizeError(error));
    }

    config._retry = true;

    try {
      // Refresh token
      const user = auth.currentUser;
      if (user) {
        await user.getIdToken(true);
        return this.axiosInstance.request(config);
      }
    } catch (refreshError) {
      await auth.signOut();
      return Promise.reject(this.normalizeError(error));
    }
  }

  private async handleRateLimitError(
    error: AxiosError,
    config: AxiosRequestConfig,
  ): Promise<any> {
    const retryAfter = error.response?.headers["retry-after"];
    const delay = retryAfter ? parseInt(retryAfter) * 1000 : 5000;

    console.log(`⏳ Rate limited - Retrying after ${delay}ms`);
    await this.delay(delay);

    return this.axiosInstance.request(config);
  }

  // ============================================
  // RETRY LOGIC
  // ============================================
  private shouldRetry(config: AxiosRequestConfig): boolean {
    const requestId = this.getRequestId(config);
    const currentRetries = this.retryCount.get(requestId) || 0;
    return currentRetries < MAX_RETRIES;
  }

  private async retryRequest(config: AxiosRequestConfig): Promise<any> {
    const requestId = this.getRequestId(config);
    const currentRetries = this.retryCount.get(requestId) || 0;

    this.retryCount.set(requestId, currentRetries + 1);

    await this.delay(RETRY_DELAY * (currentRetries + 1));

    console.log(
      `🔄 Retrying request (${currentRetries + 1}/${MAX_RETRIES}): ${config.url}`,
    );

    return this.axiosInstance.request(config);
  }

  // ============================================
  // QUEUE MANAGEMENT
  // ============================================
  private async processRequestQueue(): Promise<void> {
    if (this.requestQueue.length === 0) return;

    console.log(`🔄 Processing ${this.requestQueue.length} queued requests`);

    const queue = [...this.requestQueue];
    this.requestQueue = [];

    for (const item of queue) {
      try {
        const response = await this.axiosInstance.request(item.config);
        item.resolve(response);
      } catch (error) {
        item.reject(error);
      }
    }
  }

  // ============================================
  // CACHING
  // ============================================
  private async cacheResponse(response: AxiosResponse): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(response.config);
      const cacheData = {
        data: response.data,
        timestamp: Date.now(),
        headers: response.headers,
      };

      if (typeof window !== "undefined") {
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      }
    } catch (error) {
      console.warn("Cache write failed:", error);
    }
  }

  private async getCachedResponse(config: AxiosRequestConfig): Promise<any> {
    try {
      const cacheKey = this.getCacheKey(config);
      const cached =
        typeof window !== "undefined" ? localStorage.getItem(cacheKey) : null;

      if (cached) {
        const cacheData = JSON.parse(cached);
        const age = Date.now() - cacheData.timestamp;

        // Cache valid for 5 minutes
        if (age < 300000) {
          return { data: cacheData.data };
        }
      }
    } catch (error) {
      console.warn("Cache read failed:", error);
    }

    return null;
  }

  // ============================================
  // HTTP METHODS
  // ============================================
  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.get<T>(url, config);
      return this.formatResponse(response);
    } catch (error) {
      throw this.normalizeError(error as AxiosError);
    }
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.post<T>(url, data, config);
      return this.formatResponse(response);
    } catch (error) {
      throw this.normalizeError(error as AxiosError);
    }
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.put<T>(url, data, config);
      return this.formatResponse(response);
    } catch (error) {
      throw this.normalizeError(error as AxiosError);
    }
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.patch<T>(url, data, config);
      return this.formatResponse(response);
    } catch (error) {
      throw this.normalizeError(error as AxiosError);
    }
  }

  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.delete<T>(url, config);
      return this.formatResponse(response);
    } catch (error) {
      throw this.normalizeError(error as AxiosError);
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================
  private formatResponse<T>(response: AxiosResponse<T>): ApiResponse<T> {
    return {
      success: true,
      data: response.data,
      message: "Success",
      timestamp: Date.now(),
    };
  }

  private normalizeError(error: AxiosError): ApiError {
    if (!error.response) {
      return {
        message: "Network error - Please check your connection",
        code: "NETWORK_ERROR",
      };
    }

    const status = error.response.status;
    const data: any = error.response.data;

    return {
      message: data?.message || error.message || "An error occurred",
      code: data?.code || `HTTP_${status}`,
      status,
      details: data?.details,
    };
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getRequestId(config: AxiosRequestConfig): string {
    return `${config.method}_${config.url}`;
  }

  private getCacheKey(config: AxiosRequestConfig): string {
    return `cache_${config.method}_${config.url}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ============================================
  // PUBLIC UTILITIES
  // ============================================
  clearCache(): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
    return Promise.resolve();
  }

  isNetworkAvailable(): boolean {
    return this.isOnline;
  }

  getQueueSize(): number {
    return this.requestQueue.length;
  }
}

// ============================================
// EXPORT SINGLETON INSTANCE
// ============================================
export const apiService = new ApiService();
export default apiService;
