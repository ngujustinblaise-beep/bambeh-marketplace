/**
 * src/services/profile.service.ts
 * Bambeh Marketplace — User Profile Service
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  phone?: string;
  bio?: string;
  city?: string;
  region?: string;
  country: string;
  isVerified: boolean;
  isVendor: boolean;
  subscriptionTier: string;
  zermCoins: number;
  rating: number;
  reviewCount: number;
  totalListings: number;
  totalSales: number;
  preferredLanguage: string;
  notificationsEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileResponse {
  data: UserProfile | null;
  error: string | null;
}

export interface ProfileUpdateResponse {
  success: boolean;
  error: string | null;
}

// ─── Map Row ──────────────────────────────────────────────────────────────────
function mapProfileRow(row: Record<string, unknown>): UserProfile {
  return {
    id: row.id as string,
    email: row.email as string,
    displayName: (row.display_name as string) ?? (row.full_name as string) ?? "User",
    avatarUrl: row.avatar_url as string | undefined,
    phone: row.phone as string | undefined,
    bio: row.bio as string | undefined,
    city: row.city as string | undefined,
    region: row.region as string | undefined,
    country: (row.country as string) ?? "",
    isVerified: Boolean(row.is_verified),
    isVendor: Boolean(row.is_vendor),
    subscriptionTier: (row.subscription_tier as string) ?? "free",
    zermCoins: (row.zerm_coins as number) ?? 0,
    rating: (row.rating as number) ?? 0,
    reviewCount: (row.review_count as number) ?? 0,
    totalListings: (row.total_listings as number) ?? 0,
    totalSales: (row.total_sales as number) ?? 0,
    preferredLanguage: (row.preferred_language as string) ?? "fr",
    notificationsEnabled: row.notifications_enabled !== false,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// ─── Get Profile ──────────────────────────────────────────────────────────────
export async function getProfile(userId: string): Promise<ProfileResponse> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: mapProfileRow(data as Record<string, unknown>), error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load profile";
    return { data: null, error: message };
  }
}

// ─── Update Profile ───────────────────────────────────────────────────────────
export async function updateProfile(
  userId: string,
  updates: Partial<Omit<UserProfile, "id" | "email" | "createdAt" | "updatedAt">>
): Promise<ProfileUpdateResponse> {
  try {
    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.displayName !== undefined) payload.display_name = updates.displayName;
    if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.bio !== undefined) payload.bio = updates.bio;
    if (updates.city !== undefined) payload.city = updates.city;
    if (updates.region !== undefined) payload.region = updates.region;
    if (updates.preferredLanguage !== undefined) payload.preferred_language = updates.preferredLanguage;
    if (updates.notificationsEnabled !== undefined) payload.notifications_enabled = updates.notificationsEnabled;

    const { error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update profile";
    return { success: false, error: message };
  }
}

// ─── Upload Avatar ────────────────────────────────────────────────────────────
export async function uploadAvatar(
  userId: string,
  file: File
): Promise<{ url: string | null; error: string | null }> {
  try {
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `avatars/${userId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("user-media")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      return { url: null, error: uploadError.message };
    }

    const { data } = supabase.storage.from("user-media").getPublicUrl(path);
    const url = data.publicUrl;

    await updateProfile(userId, { avatarUrl: url });

    return { url, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to upload avatar";
    return { url: null, error: message };
  }
}

// ─── Get Public Profile ───────────────────────────────────────────────────────
export async function getPublicProfile(userId: string): Promise<ProfileResponse> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url, city, region, country, is_verified, is_vendor, rating, review_count, total_listings, total_sales, created_at, updated_at")
      .eq("id", userId)
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: mapProfileRow(data as Record<string, unknown>), error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load profile";
    return { data: null, error: message };
  }
}

