/**
 * BAMBÉ MARKETPLACE - VENDOR SERVICE
 * Complete backend integration for vendor operations
 * Version: 1.0.0
 */

import axios, { AxiosInstance } from "axios";
import {
  VendorProfile,
  Product,
  VendorOrder,
  VendorStats,
  VendorReview,
  VendorAnalytics,
  VendorNotification,
  PayoutRequest,
  VendorPromotion,
  StockAlert,
  CustomerInsight
} from "../types/vendor.types";
import ENV_CONFIG from "../../config/env.config";

class VendorService {
  private apiAxios: AxiosInstance;

  constructor() {
    this.apiAxios = axios.create({
      baseURL: ENV_CONFIG.API.BASE_URL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add auth interceptor
    this.apiAxios.interceptors.request.use((config) => {
      const token = localStorage.getItem("vendor_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  /**
   * ========================================
   * VENDOR PROFILE OPERATIONS
   * ========================================
   */

  /**
   * Get vendor profile
   */
  async getProfile(vendorId: string): Promise<VendorProfile | null> {
    try {
      const response = await this.apiAxios.get(`/vendors/${vendorId}/profile`);
      return response.data;
    } catch (error) {
      console.error("Error fetching vendor profile:", error);
      return null;
    }
  }

  /**
   * Update vendor profile
   */
  async updateProfile(
    vendorId: string,
    updates: Partial<VendorProfile>,
  ): Promise<boolean> {
    try {
      await this.apiAxios.put(`/vendors/${vendorId}/profile`, updates);
      return true;
    } catch (error) {
      console.error("Error updating vendor profile:", error);
      return false;
    }
  }

  /**
   * Upload vendor logo
   */
  async uploadLogo(vendorId: string, file: File): Promise<string | null> {
    try {
      const formData = new FormData();
      formData.append("logo", file);

      const response = await this.apiAxios.post(
        `/vendors/${vendorId}/upload-logo`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return response.data.url;
    } catch (error) {
      console.error("Error uploading logo:", error);
      return null;
    }
  }

  /**
   * Upload cover image
   */
  async uploadCoverImage(vendorId: string, file: File): Promise<string | null> {
    try {
      const formData = new FormData();
      formData.append("cover", file);

      const response = await this.apiAxios.post(
        `/vendors/${vendorId}/upload-cover`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return response.data.url;
    } catch (error) {
      console.error("Error uploading cover image:", error);
      return null;
    }
  }

  /**
   * ========================================
   * PRODUCT MANAGEMENT
   * ========================================
   */

  /**
   * Get all products
   */
  async getProducts(
    vendorId: string,
    filters?: {
      category?: string;
      status?: "active" | "inactive";
      search?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<{ products: Product[]; total: number; pages: number }> {
    try {
      const response = await this.apiAxios.get(
        `/vendors/${vendorId}/products`,
        {
          params: filters,
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching products:", error);
      return { products: [], total: 0, pages: 0 }; }
  }

  /**
   * Get product by ID
   */
  async getProduct(productId: string): Promise<Product | null> {
    try {
      const response = await this.apiAxios.get(`/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching product:", error);
      return null;
    }
  }

  /**
   * Create product
   */
  async createProduct(
    vendorId: string,
    product: Partial<Product>,
  ): Promise<Product | null> {
    try {
      const response = await this.apiAxios.post(
        `/vendors/${vendorId}/products`,
        product,
      );
      return response.data;
    } catch (error) {
      console.error("Error creating product:", error);
      return null;
    }
  }

  /**
   * Update product
   */
  async updateProduct(
    productId: string,
    updates: Partial<Product>,
  ): Promise<boolean> {
    try {
      await this.apiAxios.put(`/products/${productId}`, updates);
      return true;
    } catch (error) {
      console.error("Error updating product:", error);
      return false;
    }
  }

  /**
   * Delete product
   */
  async deleteProduct(productId: string): Promise<boolean> {
    try {
      await this.apiAxios.delete(`/products/${productId}`);
      return true;
    } catch (error) {
      console.error("Error deleting product:", error);
      return false;
    }
  }

  /**
   * Upload product images
   */
  async uploadProductImages(
    productId: string,
    files: File[],
  ): Promise<string[]> {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("images", file);
      });

      const response = await this.apiAxios.post(
        `/products/${productId}/upload-images`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return response.data.urls;
    } catch (error) {
      console.error("Error uploading product images:", error);
      return [];
    }
  }

  /**
   * Update product stock
   */
  async updateStock(productId: string, quantity: number): Promise<boolean> {
    try {
      await this.apiAxios.put(`/products/${productId}/stock`, { quantity });
      return true;
    } catch (error) {
      console.error("Error updating stock:", error);
      return false;
    }
  }

  /**
   * Bulk update products
   */
  async bulkUpdateProducts(
    productIds: string[],
    updates: Partial<Product>,
  ): Promise<{ success: number; failed: number }> {
    try {
      const response = await this.apiAxios.post("/products/bulk-update", {
        productIds,
        updates
      });
      return response.data;
    } catch (error) {
      console.error("Error bulk updating products:", error);
      return { success: 0, failed: productIds.length  }; }
  }

  /**
   * ========================================
   * ORDER MANAGEMENT
   * ========================================
   */

  /**
   * Get vendor orders
   */
  async getOrders(
    vendorId: string,
    filters?: {
      status?: string;
      startDate?: string;
      endDate?: string;
      search?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<{ orders: VendorOrder[]; total: number; pages: number }> {
    try {
      const response = await this.apiAxios.get(`/vendors/${vendorId}/orders`, {
        params: filters,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching orders:", error);
      return { orders: [], total: 0, pages: 0 }; }
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId: string): Promise<VendorOrder | null> {
    try {
      const response = await this.apiAxios.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching order:", error);
      return null;
    }
  }

  /**
   * Accept order
   */
  async acceptOrder(
    orderId: string,
    preparationTime: number,
  ): Promise<boolean> {
    try {
      await this.apiAxios.post(`/orders/${orderId}/accept`, {
        estimatedPreparationTime: preparationTime,
      });
      return true;
    } catch (error) {
      console.error("Error accepting order:", error);
      return false;
    }
  }

  /**
   * Reject order
   */
  async rejectOrder(orderId: string, reason: string): Promise<boolean> {
    try {
      await this.apiAxios.post(`/orders/${orderId}/reject`, { reason });
      return true;
    } catch (error) {
      console.error("Error rejecting order:", error);
      return false;
    }
  }

  /**
   * Mark order as ready
   */
  async markOrderReady(orderId: string): Promise<boolean> {
    try {
      await this.apiAxios.post(`/orders/${orderId}/ready`);
      return true;
    } catch (error) {
      console.error("Error marking order as ready:", error);
      return false;
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, status: string): Promise<boolean> {
    try {
      await this.apiAxios.put(`/orders/${orderId}/status`, { status });
      return true;
    } catch (error) {
      console.error("Error updating order status:", error);
      return false;
    }
  }

  /**
   * ========================================
   * STATISTICS & ANALYTICS
   * ========================================
   */

  /**
   * Get vendor statistics
   */
  async getStats(vendorId: string): Promise<VendorStats | null> {
    try {
      const response = await this.apiAxios.get(`/vendors/${vendorId}/stats`);
      return response.data;
    } catch (error) {
      console.error("Error fetching stats:", error);
      return null;
    }
  }

  /**
   * Get analytics data
   */
  async getAnalytics(
    vendorId: string,
    period: "day" | "week" | "month" | "year",
    startDate?: string,
    endDate?: string,
  ): Promise<VendorAnalytics[]> {
    try {
      const response = await this.apiAxios.get(
        `/vendors/${vendorId}/analytics`,
        {
          params: { period, startDate, endDate },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching analytics:", error);
      return [];
    }
  }

  /**
   * Get top products
   */
  async getTopProducts(
    vendorId: string,
    limit: number = 10,
  ): Promise<Product[]> {
    try {
      const response = await this.apiAxios.get(
        `/vendors/${vendorId}/top-products`,
        {
          params: { limit },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching top products:", error);
      return [];
    }
  }

  /**
   * ========================================
   * REVIEWS & RATINGS
   * ========================================
   */

  /**
   * Get vendor reviews
   */
  async getReviews(
    vendorId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ reviews: VendorReview[]; total: number; pages: number }> {
    try {
      const response = await this.apiAxios.get(`/vendors/${vendorId}/reviews`, {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return { reviews: [], total: 0, pages: 0 }; }
  }

  /**
   * Respond to review
   */
  async respondToReview(reviewId: string, message: string): Promise<boolean> {
    try {
      await this.apiAxios.post(`/reviews/${reviewId}/respond`, { message });
      return true;
    } catch (error) {
      console.error("Error responding to review:", error);
      return false;
    }
  }

  /**
   * ========================================
   * NOTIFICATIONS
   * ========================================
   */

  /**
   * Get vendor notifications
   */
  async getNotifications(
    vendorId: string,
    limit: number = 50,
  ): Promise<VendorNotification[]> {
    try {
      const response = await this.apiAxios.get(
        `/vendors/${vendorId}/notifications`,
        {
          params: { limit },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationRead(notificationId: string): Promise<boolean> {
    try {
      await this.apiAxios.put(`/notifications/${notificationId}/read`);
      return true;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }
  }

  /**
   * ========================================
   * PAYOUTS
   * ========================================
   */

  /**
   * Get payout history
   */
  async getPayouts(vendorId: string): Promise<PayoutRequest[]> {
    try {
      const response = await this.apiAxios.get(`/vendors/${vendorId}/payouts`);
      return response.data;
    } catch (error) {
      console.error("Error fetching payouts:", error);
      return [];
    }
  }

  /**
   * Request payout
   */
  async requestPayout(vendorId: string, amount: number): Promise<boolean> {
    try {
      await this.apiAxios.post(`/vendors/${vendorId}/payout-request`, {
        amount
      });
      return true;
    } catch (error) {
      console.error("Error requesting payout:", error);
      return false;
    }
  }

  /**
   * ========================================
   * PROMOTIONS
   * ========================================
   */

  /**
   * Get promotions
   */
  async getPromotions(vendorId: string): Promise<VendorPromotion[]> {
    try {
      const response = await this.apiAxios.get(
        `/vendors/${vendorId}/promotions`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching promotions:", error);
      return [];
    }
  }

  /**
   * Create promotion
   */
  async createPromotion(
    vendorId: string,
    promotion: Partial<VendorPromotion>,
  ): Promise<VendorPromotion | null> {
    try {
      const response = await this.apiAxios.post(
        `/vendors/${vendorId}/promotions`,
        promotion,
      );
      return response.data;
    } catch (error) {
      console.error("Error creating promotion:", error);
      return null;
    }
  }

  /**
   * Update promotion
   */
  async updatePromotion(
    promotionId: string,
    updates: Partial<VendorPromotion>,
  ): Promise<boolean> {
    try {
      await this.apiAxios.put(`/promotions/${promotionId}`, updates);
      return true;
    } catch (error) {
      console.error("Error updating promotion:", error);
      return false;
    }
  }

  /**
   * Delete promotion
   */
  async deletePromotion(promotionId: string): Promise<boolean> {
    try {
      await this.apiAxios.delete(`/promotions/${promotionId}`);
      return true;
    } catch (error) {
      console.error("Error deleting promotion:", error);
      return false;
    }
  }

  /**
   * ========================================
   * STOCK ALERTS
   * ========================================
   */

  /**
   * Get stock alerts
   */
  async getStockAlerts(vendorId: string): Promise<StockAlert[]> {
    try {
      const response = await this.apiAxios.get(
        `/vendors/${vendorId}/stock-alerts`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching stock alerts:", error);
      return [];
    }
  }

  /**
   * ========================================
   * CUSTOMER INSIGHTS
   * ========================================
   */

  /**
   * Get customer insights
   */
  async getCustomerInsights(vendorId: string): Promise<CustomerInsight[]> {
    try {
      const response = await this.apiAxios.get(
        `/vendors/${vendorId}/customer-insights`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching customer insights:", error);
      return [];
    }
  }

  /**
   * ========================================
   * REPORTS
   * ========================================
   */

  /**
   * Generate sales report
   */
  async generateSalesReport(
    vendorId: string,
    startDate: string,
    endDate: string,
    format: "pdf" | "csv" = "pdf",
  ): Promise<string> {
    try {
      const response = await this.apiAxios.post(
        `/vendors/${vendorId}/reports/sales`,
        { startDate, endDate, format },
        { responseType: "blob" },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `sales_report_${Date.now()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      return "Report generated successfully";
    } catch (error) {
      console.error("Error generating sales report:", error);
      throw error;
    }
  }

  /**
   * Export products to CSV
   */
  async exportProducts(vendorId: string): Promise<string> {
    try {
      const response = await this.apiAxios.get(
        `/vendors/${vendorId}/products/export`,
        {
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `products_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      return "Products exported successfully";
    } catch (error) {
      console.error("Error exporting products:", error);
      throw error;
    }
  }
}

export default new VendorService();

