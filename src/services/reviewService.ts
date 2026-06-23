/**
 * reviewService.ts — Bambeh Marketplace
 * FILE LOCATION: src/services/reviewService.ts
 */

import { supabase } from "@/lib/supabase";

export type ReviewSortBy = "recent" | "helpful" | "highest" | "lowest";

export interface ReviewData {
  userName: string;
  userAvatar?: string | null;
  rating: number;
  title?: string;
  comment: string;
  images?: File[];
  verified?: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  orderId: string;
  userName: string;
  userAvatar: string | null;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  verified: boolean;
  helpful: number;
  likedBy: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewSummary {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: { 5: number; 4: number; 3: number; 2: number; 1: number };
}

class ReviewService {
  async addReview(
    productId: string,
    userId: string,
    orderId: string,
    reviewData: ReviewData,
  ): Promise<{ data: Review | null; error: string | null }> {
    try {
      const imageUrls: string[] = [];
      if (reviewData.images && reviewData.images.length > 0) {
        for (let i = 0; i < reviewData.images.length; i++) {
          const file = reviewData.images[i];
          const path = `reviews/${productId}/${userId}_${Date.now()}_${i}.jpg`;
          const { error: uploadErr } = await supabase.storage
            .from("product-images")
            .upload(path, file, { upsert: true });
          if (!uploadErr) {
            const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
            if (urlData.publicUrl) imageUrls.push(urlData.publicUrl);
          }
        }
      }

      const { data, error } = await supabase
        .from("reviews")
        .insert({
          product_id: productId,
          reviewer_id: userId,
          order_id: orderId,
          rating: reviewData.rating,
          comment: reviewData.comment,
        })
        .select("*, reviewer:users(id, full_name, avatar_url)")
        .single();

      if (error) return { data: null, error: error.message };

      return { data: this.mapToReview(data, reviewData, imageUrls), error: null };
    } catch (e) {
      return { data: null, error: String(e) };
    }
  }

  async getProductReviews(
    productId: string,
    limitCount: number = 10,
    sortBy: ReviewSortBy = "recent",
  ): Promise<Review[]> {
    try {
      const orderMap: Record<ReviewSortBy, { column: string; ascending: boolean }> = {
        recent: { column: "created_at", ascending: false },
        helpful: { column: "created_at", ascending: false },
        highest: { column: "rating", ascending: false },
        lowest: { column: "rating", ascending: true },
      };

      const order = orderMap[sortBy] ?? orderMap.recent;

      const { data } = await supabase
        .from("reviews")
        .select("*, reviewer:users(id, full_name, avatar_url)")
        .eq("product_id", productId)
        .order(order.column, { ascending: order.ascending })
        .limit(limitCount);

      return (data ?? []).map((r) => this.mapToReview(r));
    } catch {
      return [];
    }
  }

  async getReviewSummary(productId: string): Promise<ReviewSummary> {
    const empty: ReviewSummary = {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };

    try {
      const { data } = await supabase
        .from("reviews")
        .select("rating")
        .eq("product_id", productId);

      if (!data || data.length === 0) return empty;

      const totalReviews = data.length;
      const totalRating = data.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = Math.round((totalRating / totalReviews) * 10) / 10;

      const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as ReviewSummary["ratingDistribution"];
      data.forEach((r) => {
        const star = r.rating as 1 | 2 | 3 | 4 | 5;
        if (star >= 1 && star <= 5) dist[star]++;
      });

      return { totalReviews, averageRating, ratingDistribution: dist };
    } catch (e) {
      return empty;
    }
  }

  async deleteReview(reviewId: string): Promise<{ error: string | null }> {
    const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
    return { error: error?.message ?? null };
  }

  async hasReviewed(userId: string, orderId: string): Promise<boolean> {
    const { data } = await supabase
      .from("reviews")
      .select("id")
      .eq("reviewer_id", userId)
      .eq("order_id", orderId)
      .single();
    return !!data;
  }

  private mapToReview(
    row: Record<string, unknown>,
    extra?: ReviewData,
    imageUrls?: string[],
  ): Review {
    const reviewer = row.reviewer as Record<string, unknown> | null;
    return {
      id: String(row.id ?? ""),
      productId: String(row.product_id ?? ""),
      userId: String(row.reviewer_id ?? ""),
      orderId: String(row.order_id ?? ""),
      userName: extra?.userName ?? String(reviewer?.full_name ?? "User"),
      userAvatar: (extra?.userAvatar ?? String(reviewer?.avatar_url ?? "")) || null,
      rating: Number(row.rating ?? 0),
      title: extra?.title ?? "",
      comment: String(row.comment ?? ""),
      images: imageUrls ?? [],
      verified: extra?.verified ?? false,
      helpful: 0,
      likedBy: [],
      createdAt: row.created_at ? new Date(String(row.created_at)) : new Date(),
      updatedAt: row.created_at ? new Date(String(row.created_at)) : new Date(),
    };
  }
}

export default new ReviewService();

