/**
 * src/services/cart.service.ts
 * Bambeh Marketplace â€” Cart Service
 * Â© 2026 Bambeh Marketplace. All rights reserved.
 */

import { supabase } from "@/lib/supabase";

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export interface CartItem {
  id: string;
  userId: string;
  listingId: string;
  listingType: "marketplace" | "service" | "rental" | "vehicle" | "job";
  title: string;
  imageUrl?: string;
  priceXAF: number;
  quantity: number;
  sellerId: string;
  sellerName?: string;
  addedAt: string;
  metadata?: Record<string, unknown>;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalXAF: number;
}

export interface CartResponse {
  data: CartItem[] | null;
  error: string | null;
}

export interface CartActionResponse {
  success: boolean;
  error: string | null;
}

// â”€â”€â”€ Get User Cart â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function getCart(userId: string): Promise<CartResponse> {
  try {
    const { data, error } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", userId)
      .order("added_at", { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    const items: CartItem[] = (data ?? []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      listingId: row.listing_id,
      listingType: row.listing_type,
      title: row.title,
      imageUrl: row.image_url,
      priceXAF: row.price_xaf,
      quantity: row.quantity ?? 1,
      sellerId: row.seller_id,
      sellerName: row.seller_name,
      addedAt: row.added_at,
      metadata: row.metadata,
    }));

    return { data: items, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load cart";
    return { data: null, error: message };
  }
}

// â”€â”€â”€ Add to Cart â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function addToCart(
  userId: string,
  item: Omit<CartItem, "id" | "userId" | "addedAt">
): Promise<CartActionResponse> {
  try {
    // Check if item already exists
    const { data: existing } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("user_id", userId)
      .eq("listing_id", item.listingId)
      .maybeSingle();

    if (existing) {
      // Update quantity
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: (existing.quantity ?? 1) + 1 })
        .eq("id", existing.id);

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, error: null };
    }

    // Insert new item
    const { error } = await supabase.from("cart_items").insert({
      user_id: userId,
      listing_id: item.listingId,
      listing_type: item.listingType,
      title: item.title,
      image_url: item.imageUrl,
      price_xaf: item.priceXAF,
      quantity: item.quantity ?? 1,
      seller_id: item.sellerId,
      seller_name: item.sellerName,
      metadata: item.metadata ?? {},
      added_at: new Date().toISOString(),
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to add to cart";
    return { success: false, error: message };
  }
}

// â”€â”€â”€ Remove from Cart â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function removeFromCart(
  userId: string,
  cartItemId: string
): Promise<CartActionResponse> {
  try {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", cartItemId)
      .eq("user_id", userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to remove item";
    return { success: false, error: message };
  }
}

// â”€â”€â”€ Update Quantity â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function updateCartQuantity(
  userId: string,
  cartItemId: string,
  quantity: number
): Promise<CartActionResponse> {
  try {
    if (quantity <= 0) {
      return removeFromCart(userId, cartItemId);
    }

    const { error } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", cartItemId)
      .eq("user_id", userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update quantity";
    return { success: false, error: message };
  }
}

// â”€â”€â”€ Clear Cart â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function clearCart(userId: string): Promise<CartActionResponse> {
  try {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to clear cart";
    return { success: false, error: message };
  }
}

// â”€â”€â”€ Get Cart Summary â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function computeCartSummary(items: CartItem[]): Cart {
  const totalXAF = items.reduce(
    (sum, item) => sum + item.priceXAF * item.quantity,
    0
  );
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return { items, totalItems, totalXAF };
}

// â”€â”€â”€ Cart Count (lightweight) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function getCartCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from("cart_items")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}
