/**
 * src/contexts/CartContext.tsx
 * Bambeh Marketplace â€” Cart Context (totalItems, totalPrice, addToCart, CartItem fixes)
 * Â© 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";

// â”€â”€â”€ CartItem â€” full interface matching all consumer files â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export interface CartItem {
  id: string;
  // aliases used by CartDrawer / CheckoutModal
  itemId: string;
  itemTitle: string;
  itemImage?: string;
  // standard fields
  title: string;
  priceXAF: number;
  quantity: number;
  sellerId: string;
  sellerName: string;
  imageUrl?: string;
  currency: string;
  listingId?: string;
  listingType?: string;
}

// â”€â”€â”€ FavoriteItem â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export interface FavoriteItem {
  id: string;
  type: string;
  title: string;
  price?: number;
  currency?: string;
  image?: string;
  location?: string;
  addedAt: string;
}

// â”€â”€â”€ CartContextType â€” complete interface expected by consumers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export interface CartContextType {
  items: CartItem[];
  cartItems: CartItem[];      // alias used by some files

  // totals (the missing props that caused ~10 errors)
  totalItems: number;
  totalPrice: number;
  cartCount: number;

  // actions
  addToCart: (item: Omit<CartItem, "id" | "itemId" | "itemTitle" | "currency"> & {
    id?: string;
    title: string;
    priceXAF: number;
    imageUrl?: string;
    image?: string;
  }) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;

  // favorites
  favorites: FavoriteItem[];
  isFavorite: (id: string) => boolean;
  addFavorite: (item: Omit<FavoriteItem, "addedAt">) => void;
  removeFavorite: (id: string) => void;
  toggleFavorite: (item: Omit<FavoriteItem, "addedAt">) => void;
}

// â”€â”€â”€ Context â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const CartContext = createContext<CartContextType | null>(null);

// â”€â”€â”€ Provider â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  const totalItems = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const totalPrice = useMemo(() => items.reduce((sum, i) => sum + i.priceXAF * i.quantity, 0), [items]);

  const addToCart = useCallback((
    raw: Omit<CartItem, "id" | "itemId" | "itemTitle" | "currency"> & {
      id?: string;
      title: string;
      priceXAF: number;
      imageUrl?: string;
      image?: string;
    }
  ) => {
    setItems((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.listingId === raw.listingId || i.itemId === (raw.id ?? "")
      );
      const newId = raw.id ?? `cart-${Date.now()}`;
      if (existingIdx >= 0) {
        return prev.map((item, idx) =>
          idx === existingIdx
            ? { ...item, quantity: item.quantity + (raw.quantity ?? 1) }
            : item
        );
      }
      const cartItem: CartItem = {
        id: newId,
        itemId: newId,
        itemTitle: raw.title,
        itemImage: raw.imageUrl ?? raw.image,
        title: raw.title,
        priceXAF: raw.priceXAF,
        quantity: raw.quantity ?? 1,
        sellerId: raw.sellerId,
        sellerName: raw.sellerName,
        imageUrl: raw.imageUrl ?? raw.image,
        currency: "XAF",
        listingId: raw.listingId,
        listingType: raw.listingType,
      };
      return [...prev, cartItem];
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId && i.itemId !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) { removeFromCart(itemId); return; }
    setItems((prev) =>
      prev.map((i) =>
        (i.id === itemId || i.itemId === itemId) ? { ...i, quantity } : i
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => setItems([]), []);

  const isFavorite = useCallback((id: string) =>
    favorites.some((f) => f.id === id), [favorites]);

  const addFavorite = useCallback((item: Omit<FavoriteItem, "addedAt">) => {
    setFavorites((prev) => {
      if (prev.some((f) => f.id === item.id)) return prev;
      return [...prev, { ...item, addedAt: new Date().toISOString() }];
    });
  }, []);

  const removeFavorite = useCallback((id: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const toggleFavorite = useCallback((item: Omit<FavoriteItem, "addedAt">) => {
    if (isFavorite(item.id)) { removeFavorite(item.id); }
    else { addFavorite(item); }
  }, [isFavorite, addFavorite, removeFavorite]);

  const value: CartContextType = {
    items,
    cartItems: items,
    totalItems,
    totalPrice,
    cartCount: totalItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    favorites,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// â”€â”€â”€ Hook â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

// â”€â”€â”€ Utility exports used by CheckoutModal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function createOrderFromCart(
  cartItems: CartItem[],
  userId: string,
  shippingInfo?: Record<string, unknown>
): Record<string, unknown> {
  return {
    id: `order-${Date.now()}`,
    userId,
    items: cartItems.map((item) => ({
      itemId: item.itemId,
      title: item.itemTitle,
      quantity: item.quantity,
      priceXAF: item.priceXAF,
      sellerId: item.sellerId,
    })),
    totalXAF: cartItems.reduce((sum, i) => sum + i.priceXAF * i.quantity, 0),
    status: "pending",
    shippingInfo,
    createdAt: new Date().toISOString(),
  };
}

export function createTransaction(
  orderId: string,
  amountXAF: number,
  paymentMethod: string
): Record<string, unknown> {
  return {
    id: `txn-${Date.now()}`,
    orderId,
    amountXAF,
    paymentMethod,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
}

export default CartContext;

const fee = subtotal * 0.01
const total = subtotal + fee



