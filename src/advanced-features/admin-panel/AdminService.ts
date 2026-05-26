// @ts-nocheck
/**
 * BAMBÉ MARKETPLACE - ADMIN SERVICE
 * Complete backend integration for admin operations
 * Order, User, Dispute, and Analytics Management
 * Version: 1.0.0
 */

import axios, { AxiosInstance } from 'axios';
import {
  Order,
  OrderStatus,
  User,
  Dispute,
  AdminDashboardStats,
  AnalyticsData,
} from '../types';
import ENV_CONFIG from '../config/env.config';

class AdminService {
  private apiAxios: AxiosInstance;

  constructor() {
    this.apiAxios = axios.create({
      baseURL: ENV_CONFIG.API.BASE_URL,
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
    });

    this.apiAxios.interceptors.request.use((config) => {
      const token = localStorage.getItem('admin_token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }

  // ── DASHBOARD STATISTICS ─────────────────────────────────────────────────

  async getDashboardStats(): Promise<AdminDashboardStats> {
    try {
      const response = await this.apiAxios.get('/admin/stats/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalOrders: 0, totalRevenue: 0, totalUsers: 0, activeDrivers: 0,
        pendingDisputes: 0, todayOrders: 0, todayRevenue: 0,
        orderGrowth: 0, revenueGrowth: 0,
      };
    }
  }

  async getAnalytics(
    period: 'day' | 'week' | 'month' | 'year',
    startDate?: string,
    endDate?: string,
  ): Promise<AnalyticsData[]> {
    try {
      const params: any = { period };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const response = await this.apiAxios.get('/admin/analytics', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return [];
    }
  }

  // ── ORDER MANAGEMENT ─────────────────────────────────────────────────────

  async getOrders(filters?: {
    status?: OrderStatus;
    startDate?: string;
    endDate?: string;
    searchTerm?: string;
    page?: number;
    limit?: number;
  }): Promise<{ orders: Order[]; total: number; pages: number }> {
    try {
      const response = await this.apiAxios.get('/admin/orders', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      return { orders: [], total: 0, pages: 0 };
    }
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const response = await this.apiAxios.get(`/admin/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  }

  async updateOrderStatus(orderId: string, status: OrderStatus, notes?: string): Promise<boolean> {
    try {
      await this.apiAxios.put(`/admin/orders/${orderId}/status`, { status, notes });
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  }

  async assignDriver(orderId: string, driverId: string): Promise<boolean> {
    try {
      await this.apiAxios.put(`/admin/orders/${orderId}/assign-driver`, { driverId });
      return true;
    } catch (error) {
      console.error('Error assigning driver:', error);
      return false;
    }
  }

  async cancelOrder(orderId: string, reason: string): Promise<boolean> {
    try {
      await this.apiAxios.post(`/admin/orders/${orderId}/cancel`, { reason });
      return true;
    } catch (error) {
      console.error('Error canceling order:', error);
      return false;
    }
  }

  async bulkUpdateOrders(
    orderIds: string[],
    action: 'confirm' | 'cancel' | 'assign',
    data?: any,
  ): Promise<{ success: number; failed: number }> {
    try {
      const response = await this.apiAxios.post('/admin/orders/bulk-update', { orderIds, action, data });
      return response.data;
    } catch (error) {
      console.error('Error bulk updating orders:', error);
      return { success: 0, failed: orderIds.length };
    }
  }

  async exportOrders(filters?: any): Promise<string> {
    try {
      const response = await this.apiAxios.get('/admin/orders/export', {
        params: filters,
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `orders_${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      return 'Orders exported successfully';
    } catch (error) {
      console.error('Error exporting orders:', error);
      throw error;
    }
  }

  // ── DISPUTE MANAGEMENT ───────────────────────────────────────────────────

  async getDisputes(filters?: {
    status?: 'open' | 'investigating' | 'resolved' | 'closed';
    priority?: 'low' | 'medium' | 'high';
    page?: number;
    limit?: number;
  }): Promise<{ disputes: Dispute[]; total: number; pages: number }> {
    try {
      const response = await this.apiAxios.get('/admin/disputes', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching disputes:', error);
      return { disputes: [], total: 0, pages: 0 };
    }
  }

  async getDisputeById(disputeId: string): Promise<Dispute | null> {
    try {
      const response = await this.apiAxios.get(`/admin/disputes/${disputeId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dispute:', error);
      return null;
    }
  }

  async updateDisputeStatus(
    disputeId: string,
    status: 'open' | 'investigating' | 'resolved' | 'closed',
    resolution?: string,
    refundAmount?: number,
  ): Promise<boolean> {
    try {
      await this.apiAxios.put(`/admin/disputes/${disputeId}/status`, {
        status,
        resolution,
        refundAmount,
      });
      return true;
    } catch (error) {
      console.error('Error updating dispute status:', error);
      return false;
    }
  }

  async assignDispute(disputeId: string, adminId: string): Promise<boolean> {
    try {
      await this.apiAxios.put(`/admin/disputes/${disputeId}/assign`, { adminId });
      return true;
    } catch (error) {
      console.error('Error assigning dispute:', error);
      return false;
    }
  }

  async addDisputeComment(disputeId: string, comment: string, isInternal: boolean = false): Promise<boolean> {
    try {
      await this.apiAxios.post(`/admin/disputes/${disputeId}/comments`, { comment, isInternal });
      return true;
    } catch (error) {
      console.error('Error adding dispute comment:', error);
      return false;
    }
  }

  // ── USER MANAGEMENT ──────────────────────────────────────────────────────

  async getUsers(filters?: {
    role?: 'customer' | 'driver' | 'vendor' | 'admin';
    status?: 'active' | 'suspended' | 'banned';
    searchTerm?: string;
    page?: number;
    limit?: number;
  }): Promise<{ users: User[]; total: number; pages: number }> {
    try {
      const response = await this.apiAxios.get('/admin/users', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      return { users: [], total: 0, pages: 0 };
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const response = await this.apiAxios.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  async updateUserStatus(userId: string, status: 'active' | 'suspended' | 'banned', reason?: string): Promise<boolean> {
    try {
      await this.apiAxios.put(`/admin/users/${userId}/status`, { status, reason });
      return true;
    } catch (error) {
      console.error('Error updating user status:', error);
      return false;
    }
  }

  async updateUserRole(userId: string, role: 'customer' | 'driver' | 'vendor' | 'admin'): Promise<boolean> {
    try {
      await this.apiAxios.put(`/admin/users/${userId}/role`, { role });
      return true;
    } catch (error) {
      console.error('Error updating user role:', error);
      return false;
    }
  }

  async adjustZermBalance(userId: string, amount: number, reason: string): Promise<boolean> {
    try {
      await this.apiAxios.post(`/admin/users/${userId}/adjust-balance`, { amount, reason });
      return true;
    } catch (error) {
      console.error('Error adjusting Zerm balance:', error);
      return false;
    }
  }

  async getUserActivityLog(userId: string, limit: number = 50): Promise<any[]> {
    try {
      const response = await this.apiAxios.get(`/admin/users/${userId}/activity-log`, { params: { limit } });
      return response.data;
    } catch (error) {
      console.error('Error fetching user activity log:', error);
      return [];
    }
  }

  // ── REPORTS & ANALYTICS ──────────────────────────────────────────────────

  async generateSalesReport(startDate: string, endDate: string, format: 'pdf' | 'csv' = 'pdf'): Promise<string> {
    try {
      const response = await this.apiAxios.post(
        '/admin/reports/sales',
        { startDate, endDate, format },
        { responseType: 'blob' },
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales_report_${new Date().getTime()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      return 'Report generated successfully';
    } catch (error) {
      console.error('Error generating sales report:', error);
      throw error;
    }
  }

  async getRevenueAnalytics(period: string): Promise<any> {
    try {
      const response = await this.apiAxios.get('/admin/analytics/revenue', { params: { period } });
      return response.data;
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
      return null;
    }
  }

  async getTopProducts(limit: number = 10): Promise<any[]> {
    try {
      const response = await this.apiAxios.get('/admin/analytics/top-products', { params: { limit } });
      return response.data;
    } catch (error) {
      console.error('Error fetching top products:', error);
      return [];
    }
  }

  async getTopCustomers(limit: number = 10): Promise<any[]> {
    try {
      const response = await this.apiAxios.get('/admin/analytics/top-customers', { params: { limit } });
      return response.data;
    } catch (error) {
      console.error('Error fetching top customers:', error);
      return [];
    }
  }

  // ── NOTIFICATIONS & BROADCASTS ───────────────────────────────────────────

  async sendBroadcast(title: string, message: string, targetAudience: 'all' | 'customers' | 'drivers' | 'vendors', channels: string[]): Promise<boolean> {
    try {
      await this.apiAxios.post('/admin/broadcast', { title, message, targetAudience, channels });
      return true;
    } catch (error) {
      console.error('Error sending broadcast:', error);
      return false;
    }
  }

  // ── SYSTEM SETTINGS ──────────────────────────────────────────────────────

  async getSystemSettings(): Promise<any> {
    try {
      const response = await this.apiAxios.get('/admin/settings');
      return response.data;
    } catch (error) {
      console.error('Error fetching system settings:', error);
      return {};
    }
  }

  async updateSystemSettings(settings: any): Promise<boolean> {
    try {
      await this.apiAxios.put('/admin/settings', settings);
      return true;
    } catch (error) {
      console.error('Error updating system settings:', error);
      return false;
    }
  }

  // ── UTILITY ──────────────────────────────────────────────────────────────

  async globalSearch(query: string): Promise<any> {
    try {
      const response = await this.apiAxios.get('/admin/search', { params: { q: query } });
      return response.data;
    } catch (error) {
      console.error('Error performing global search:', error);
      return { orders: [], users: [], products: [] };
    }
  }

  async getAvailableDrivers(): Promise<User[]> {
    try {
      const response = await this.apiAxios.get('/admin/drivers/available');
      return response.data;
    } catch (error) {
      console.error('Error fetching available drivers:', error);
      return [];
    }
  }

  async getSystemHealth(): Promise<any> {
    try {
      const response = await this.apiAxios.get('/admin/system/health');
      return response.data;
    } catch (error) {
      console.error('Error fetching system health:', error);
      return { status: 'unknown' };
    }
  }
}

export default new AdminService();
