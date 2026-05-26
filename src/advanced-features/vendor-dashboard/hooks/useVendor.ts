/**
 * BAMBÉ MARKETPLACE - VENDOR CUSTOM HOOKS
 * Version: 1.0.0
 */

import { useState, useEffect, useCallback } from "react";
import VendorService from "../services/VendorService";
import {
  VendorProfile, Product, VendorOrder, VendorStats, VendorReview,
  VendorAnalytics, VendorNotification,
} from "../types/vendor.types";

export const useVendorProfile = (vendorId: string) => {
  const [profile, setProfile]   = useState<VendorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true); setError(null);
      const data = await VendorService.getProfile(vendorId);
      setProfile(data);
    } catch (err) {
      setError("Failed to load profile");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [vendorId]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const updateProfile = async (updates: Partial<VendorProfile>) => {
    try {
      const success = await VendorService.updateProfile(vendorId, updates);
      if (success) { await loadProfile(); return true; }
      return false;
    } catch (err) { console.error("Error updating profile:", err); return false; }
  };

  const uploadLogo = async (file: File) => {
    try {
      const url = await VendorService.uploadLogo(vendorId, file);
      if (url) { await loadProfile(); return url; }
      return null;
    } catch (err) { console.error("Error uploading logo:", err); return null; }
  };

  return { profile, isLoading, error, updateProfile, uploadLogo, refreshProfile: loadProfile };
};

export const useVendorProducts = (vendorId: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal]       = useState(0);
  const [pages, setPages]       = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters]   = useState<any>({});

  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await VendorService.getProducts(vendorId, filters);
      setProducts(data.products); setTotal(data.total); setPages(data.pages);
    } catch (err) { console.error("Error loading products:", err); }
    finally { setIsLoading(false); }
  }, [vendorId, filters]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const createProduct = async (product: Partial<Product>) => {
    try {
      const newProduct = await VendorService.createProduct(vendorId, product);
      if (newProduct) { await loadProducts(); return newProduct; }
      return null;
    } catch (err) { console.error("Error creating product:", err); return null; }
  };

  const updateProduct = async (productId: string, updates: Partial<Product>) => {
    try {
      const success = await VendorService.updateProduct(productId, updates);
      if (success) await loadProducts();
      return success;
    } catch (err) { console.error("Error updating product:", err); return false; }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const success = await VendorService.deleteProduct(productId);
      if (success) await loadProducts();
      return success;
    } catch (err) { console.error("Error deleting product:", err); return false; }
  };

  const updateStock = async (productId: string, quantity: number) => {
    try {
      const success = await VendorService.updateStock(productId, quantity);
      if (success) await loadProducts();
      return success;
    } catch (err) { console.error("Error updating stock:", err); return false; }
  };

  return { products, total, pages, isLoading, filters, setFilters, createProduct, updateProduct, deleteProduct, updateStock, refreshProducts: loadProducts };
};

export const useVendorOrders = (vendorId: string) => {
  const [orders, setOrders]     = useState<VendorOrder[]>([]);
  const [total, setTotal]       = useState(0);
  const [pages, setPages]       = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters]   = useState<any>({});

  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await VendorService.getOrders(vendorId, filters);
      setOrders(data.orders); setTotal(data.total); setPages(data.pages);
    } catch (err) { console.error("Error loading orders:", err); }
    finally { setIsLoading(false); }
  }, [vendorId, filters]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const acceptOrder = async (orderId: string, preparationTime: number) => {
    try {
      const success = await VendorService.acceptOrder(orderId, preparationTime);
      if (success) await loadOrders();
      return success;
    } catch (err) { console.error("Error accepting order:", err); return false; }
  };

  const rejectOrder = async (orderId: string, reason: string) => {
    try {
      const success = await VendorService.rejectOrder(orderId, reason);
      if (success) await loadOrders();
      return success;
    } catch (err) { console.error("Error rejecting order:", err); return false; }
  };

  const markOrderReady = async (orderId: string) => {
    try {
      const success = await VendorService.markOrderReady(orderId);
      if (success) await loadOrders();
      return success;
    } catch (err) { console.error("Error marking order as ready:", err); return false; }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const success = await VendorService.updateOrderStatus(orderId, status);
      if (success) await loadOrders();
      return success;
    } catch (err) { console.error("Error updating order status:", err); return false; }
  };

  return { orders, total, pages, isLoading, filters, setFilters, acceptOrder, rejectOrder, markOrderReady, updateOrderStatus, refreshOrders: loadOrders };
};

export const useVendorStats = (vendorId: string) => {
  const [stats, setStats]       = useState<VendorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await VendorService.getStats(vendorId);
      setStats(data);
    } catch (err) { console.error("Error loading stats:", err); }
    finally { setIsLoading(false); }
  }, [vendorId]);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, [loadStats]);

  return { stats, isLoading, refreshStats: loadStats };
};

export const useVendorAnalytics = (vendorId: string, period: "day" | "week" | "month" | "year") => {
  const [analytics, setAnalytics] = useState<VendorAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await VendorService.getAnalytics(vendorId, period);
      setAnalytics(data);
    } catch (err) { console.error("Error loading analytics:", err); }
    finally { setIsLoading(false); }
  }, [vendorId, period]);

  useEffect(() => { loadAnalytics(); }, [loadAnalytics]);

  return { analytics, isLoading, refreshAnalytics: loadAnalytics };
};

export const useVendorReviews = (vendorId: string) => {
  const [reviews, setReviews]   = useState<VendorReview[]>([]);
  const [total, setTotal]       = useState(0);
  const [pages, setPages]       = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const loadReviews = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await VendorService.getReviews(vendorId, currentPage);
      setReviews(data.reviews); setTotal(data.total); setPages(data.pages);
    } catch (err) { console.error("Error loading reviews:", err); }
    finally { setIsLoading(false); }
  }, [vendorId, currentPage]);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  const respondToReview = async (reviewId: string, message: string) => {
    try {
      const success = await VendorService.respondToReview(reviewId, message);
      if (success) await loadReviews();
      return success;
    } catch (err) { console.error("Error responding to review:", err); return false; }
  };

  return { reviews, total, pages, currentPage, isLoading, setCurrentPage, respondToReview, refreshReviews: loadReviews };
};

export const useVendorNotifications = (vendorId: string) => {
  const [notifications, setNotifications] = useState<VendorNotification[]>([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [isLoading, setIsLoading]         = useState(true);

  const loadNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await VendorService.getNotifications(vendorId);
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    } catch (err) { console.error("Error loading notifications:", err); }
    finally { setIsLoading(false); }
  }, [vendorId]);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  const markAsRead = async (notificationId: string) => {
    try {
      const success = await VendorService.markNotificationRead(notificationId);
      if (success) await loadNotifications();
      return success;
    } catch (err) { console.error("Error marking notification as read:", err); return false; }
  };

  return { notifications, unreadCount, isLoading, markAsRead, refreshNotifications: loadNotifications };
};
