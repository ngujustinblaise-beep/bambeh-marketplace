/**
 * src/pages/vendor/hooks/useVendor.ts
 * Bambeh Marketplace — Vendor Data Hook
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import { useState, useEffect, useCallback } from "react";
import {
  getVendorByUserId,
  getVendorOrders,
  getVendorEarnings,
  type VendorProfile,
  type VendorOrder,
} from "@/services/vendor.service";
import type { VendorEarnings } from "@/types/vendor.monetization.types";

export interface UseVendorState {
  vendor: VendorProfile | null;
  orders: VendorOrder[];
  earnings: VendorEarnings | null;
  loading: boolean;
  error: string | null;
  isVendor: boolean;
}

export interface UseVendorActions {
  reload: () => Promise<void>;
  reloadOrders: () => Promise<void>;
}

export function useVendor(userId: string): UseVendorState & UseVendorActions {
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [earnings, setEarnings] = useState<VendorEarnings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVendor = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: vendorError } = await getVendorByUserId(userId);

      if (vendorError) {
        if (vendorError.includes("No rows found") || vendorError.includes("PGRST116")) {
          setVendor(null);
          setLoading(false);
          return;
        }
        setError(vendorError);
        setLoading(false);
        return;
      }

      setVendor(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load vendor");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const loadOrders = useCallback(async () => {
    if (!vendor?.id) return;

    try {
      const { data, error: ordersError } = await getVendorOrders(vendor.id);
      if (!ordersError) {
        setOrders(data);
      }
    } catch {
      // Non-fatal
    }
  }, [vendor?.id]);

  const loadEarnings = useCallback(async () => {
    if (!vendor?.id) return;

    try {
      const { data } = await getVendorEarnings(vendor.id);
      if (data) setEarnings(data);
    } catch {
      // Non-fatal
    }
  }, [vendor?.id]);

  const reload = useCallback(async () => {
    await loadVendor();
  }, [loadVendor]);

  const reloadOrders = useCallback(async () => {
    await loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    void loadVendor();
  }, [loadVendor]);

  useEffect(() => {
    if (vendor?.id) {
      void loadOrders();
      void loadEarnings();
    }
  }, [vendor?.id, loadOrders, loadEarnings]);

  return {
    vendor,
    orders,
    earnings,
    loading,
    error,
    isVendor: Boolean(vendor),
    reload,
    reloadOrders,
  };
}

export default useVendor;
