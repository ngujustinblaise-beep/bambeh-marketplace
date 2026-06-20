/**
 * src/contexts/VendorContext.tsx
 * Bambeh Marketplace â€” Vendor Context (duplicate vendorStatus fixed)
 * Â© 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthContext";

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export type VendorStatus =
  | "none" | "pending" | "active" | "suspended" | "rejected";

export interface VendorProfile {
  id: string;
  userId: string;
  storeName: string;
  storeDescription?: string;
  storeLogoUrl?: string;
  storeBannerUrl?: string;
  category?: string;
  city?: string;
  region?: string;
  country: string;
  phone?: string;
  whatsapp?: string;
  isVerified: boolean;
  subscriptionTier: string;
  totalListings: number;
  totalSales: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface VendorContextValue {
  vendorProfile: VendorProfile | null;
  vendorStatus: VendorStatus;       // single declaration â€” fixes TS2300 / TS2687
  isVendor: boolean;
  isLoadingVendor: boolean;
  vendorError: string | null;
  refreshVendorProfile: () => Promise<void>;
  becomeVendor: (data: Partial<VendorProfile>) => Promise<{ success: boolean; error: string | null }>;
  updateVendorProfile: (data: Partial<VendorProfile>) => Promise<{ success: boolean; error: string | null }>;
}

// â”€â”€â”€ Context â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const VendorContext = createContext<VendorContextValue | null>(null);

// â”€â”€â”€ Provider â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const VendorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);
  const [vendorStatus, setVendorStatus] = useState<VendorStatus>("none");
  const [isLoadingVendor, setIsLoadingVendor] = useState(false);
  const [vendorError, setVendorError] = useState<string | null>(null);

  const refreshVendorProfile = useCallback(async () => {
    if (!user?.id) {
      setVendorProfile(null);
      setVendorStatus("none");
      return;
    }
    setIsLoadingVendor(true);
    setVendorError(null);
    try {
      const { data, error } = await supabase
        .from("vendor_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) { setVendorError(error.message); return; }
      if (!data) { setVendorStatus("none"); setVendorProfile(null); return; }

      const row = data as Record<string, unknown>;
      setVendorProfile({
        id: row.id as string,
        userId: row.user_id as string,
        storeName: row.store_name as string,
        storeDescription: row.store_description as string | undefined,
        storeLogoUrl: row.store_logo_url as string | undefined,
        storeBannerUrl: row.store_banner_url as string | undefined,
        category: row.category as string | undefined,
        city: row.city as string | undefined,
        region: row.region as string | undefined,
        country: (row.country as string) ?? "",
        phone: row.phone as string | undefined,
        whatsapp: row.whatsapp as string | undefined,
        isVerified: Boolean(row.is_verified),
        subscriptionTier: (row.subscription_tier as string) ?? "free",
        totalListings: (row.total_listings as number) ?? 0,
        totalSales: (row.total_sales as number) ?? 0,
        rating: (row.rating as number) ?? 0,
        reviewCount: (row.review_count as number) ?? 0,
        createdAt: row.created_at as string,
        updatedAt: row.updated_at as string,
      });
      setVendorStatus((row.status as VendorStatus) ?? "active");
    } catch (e) {
      setVendorError(e instanceof Error ? e.message : "Failed to load vendor profile");
    } finally {
      setIsLoadingVendor(false);
    }
  }, [user?.id]);

  useEffect(() => { void refreshVendorProfile(); }, [refreshVendorProfile]);

  const becomeVendor = useCallback(async (
    data: Partial<VendorProfile>
  ): Promise<{ success: boolean; error: string | null }> => {
    if (!user?.id) return { success: false, error: "Not authenticated" };
    try {
      const { error } = await supabase.from("vendor_profiles").insert({
        user_id: user.id,
        store_name: data.storeName ?? "",
        store_description: data.storeDescription,
        category: data.category,
        city: data.city,
        region: data.region,
        country: data.country ?? "",
        phone: data.phone,
        whatsapp: data.whatsapp,
        status: "pending",
        is_verified: false,
        subscription_tier: "free",
        total_listings: 0,
        total_sales: 0,
        rating: 0,
        review_count: 0,
      });
      if (error) return { success: false, error: error.message };
      await refreshVendorProfile();
      return { success: true, error: null };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : "Failed" };
    }
  }, [user?.id, refreshVendorProfile]);

  const updateVendorProfile = useCallback(async (
    data: Partial<VendorProfile>
  ): Promise<{ success: boolean; error: string | null }> => {
    if (!vendorProfile?.id) return { success: false, error: "No vendor profile" };
    try {
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (data.storeName !== undefined) updates.store_name = data.storeName;
      if (data.storeDescription !== undefined) updates.store_description = data.storeDescription;
      if (data.storeLogoUrl !== undefined) updates.store_logo_url = data.storeLogoUrl;
      if (data.storeBannerUrl !== undefined) updates.store_banner_url = data.storeBannerUrl;
      if (data.category !== undefined) updates.category = data.category;
      if (data.city !== undefined) updates.city = data.city;
      if (data.region !== undefined) updates.region = data.region;
      if (data.phone !== undefined) updates.phone = data.phone;
      if (data.whatsapp !== undefined) updates.whatsapp = data.whatsapp;
      const { error } = await supabase.from("vendor_profiles").update(updates).eq("id", vendorProfile.id);
      if (error) return { success: false, error: error.message };
      await refreshVendorProfile();
      return { success: true, error: null };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : "Failed" };
    }
  }, [vendorProfile?.id, refreshVendorProfile]);

  const value: VendorContextValue = {
    vendorProfile,
    vendorStatus,
    isVendor: vendorStatus === "active",
    isLoadingVendor,
    vendorError,
    refreshVendorProfile,
    becomeVendor,
    updateVendorProfile,
  };

  return <VendorContext.Provider value={value}>{children}</VendorContext.Provider>;
};

// â”€â”€â”€ Hook â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function useVendor(): VendorContextValue {
  const ctx = useContext(VendorContext);
  if (!ctx) throw new Error("useVendor must be used inside <VendorProvider>");
  return ctx;
}

export default VendorContext;



