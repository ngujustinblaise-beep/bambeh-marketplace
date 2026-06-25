/**
 * src/contexts/CartContext.tsx
 * Bambeh Marketplace — Cart Context
 * © 2026 Bambeh Marketplace. All rights reserved.
 *
 * FIXED (this version):
 *  ✅ Single source of truth: cart is now backed by localStorage["bambeh_cart"],
 *     the SAME key MarketplaceItemDetails / FlashDeals / detail pages write to.
 *  ✅ Hydrates from localStorage on mount, so items added on a product page
 *     immediately appear in the Cart page and the header badge.
 *  ✅ Listens for the "storage" event (which the detail pages already dispatch),
 *     so adding an item updates the cart in the same tab instantly + across tabs.
 *  ✅ Persists every change back to localStorage, writing BOTH field shapes
 *     (price/priceXAF, image/imageUrl) so older readers stay compatible.
 *  ✅ Same public API as before — every consumer keeps compiling unchanged.
 */

import React, {
  createContext, useContext, useState, useCallback, useMemo, useEffect,
} from "react";

// Shared storage key — MUST match the key product/detail pages use.
const CART_KEY = "bambeh_cart";

// ─── CartItem — full interface matching all consumer files ────────────────────
export interface CartItem {
  id: string;
  itemId: string;
  itemTitle: string;
  itemImage?: string;
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

// ─── FavoriteItem ─────────────────────────────────────────────────────────────
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

// ─── CartContextType — complete interface expected by consumers ───────────────
export interface CartContextType {
  items: CartItem[];
  cartItems: CartItem[];

  totalItems: number;
  totalPrice: number;
  cartCount: number;

  feeXAF: number;
  totalWithFeeXAF: number;

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

  favorites: FavoriteItem[];
  isFavorite: (id: string) => boolean;
  addFavorite: (item: Omit<FavoriteItem, "addedAt">) => void;
  removeFavorite: (id: string) => void;
  toggleFavorite: (item: Omit<FavoriteItem, "addedAt">) => void;
}

// ─── localStorage helpers (normalise the two field shapes) ────────────────────
function normalizeItem(raw: any): CartItem {
  const price = Number(raw?.priceXAF ?? raw?.price ?? 0) || 0;
  const img = raw?.imageUrl ?? raw?.image;
  const id = String(raw?.id ?? raw?.itemId ?? raw?.listingId ?? `cart-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);
  const title = raw?.title ?? raw?.itemTitle ?? "";
  return {
    id,
    itemId: String(raw?.itemId ?? id),
    itemTitle: raw?.itemTitle ?? title,
    itemImage: img,
    title,
    priceXAF: price,
    quantity: Math.max(1, Number(raw?.quantity ?? 1) || 1),
    sellerId: String(raw?.sellerId ?? ""),
    sellerName: raw?.sellerName ?? raw?.sellerId ?? "",
    imageUrl: img,
    currency: "XAF",
    listingId: raw?.listingId,
    listingType: raw?.listingType,
  };
}

function readStored(): CartItem[] {
  try {
    const arr = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    return Array.isArray(arr) ? arr.map(normalizeItem) : [];
  } catch {
    return [];
  }
}

function writeStored(items: CartItem[]): void {
  try {
    // Write BOTH shapes so any page reading price/image OR priceXAF/imageUrl works.
    const serial = items.map((i) => ({
      ...i,
      price: i.priceXAF,
      image: i.imageUrl,
    }));
    localStorage.setItem(CART_KEY, JSON.stringify(serial));
  } catch {
    /* ignore quota / SSR */
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
const CartContext = createContext<CartContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Hydrate from localStorage immediately so a reload (and product-page adds) persist.
  const [items, setItems] = useState<CartItem[]>(() => readStored());
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  // Persist any state change back to localStorage. We do NOT dispatch "storage"
  // here, so this never re-triggers our own listener (no loops).
  useEffect(() => {
    writeStored(items);
  }, [items]);

  // Pick up writes made directly to localStorage by product/detail pages
  // (they dispatch a "storage" event after writing) and cross-tab changes.
  useEffect(() => {
    const sync = () => setItems(readStored());
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const totalItems = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const totalPrice = useMemo(() => items.reduce((sum, i) => sum + i.priceXAF * i.quantity, 0), [items]);
  const feeXAF = useMemo(() => Math.round(totalPrice * 0.01), [totalPrice]);
  const totalWithFeeXAF = totalPrice + feeXAF;

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
      const matchId = raw.id ?? raw.listingId ?? "";
      const existingIdx = prev.findIndex(
        (i) => (raw.listingId && i.listingId === raw.listingId) ||
               (matchId && (i.id === matchId || i.itemId === matchId))
      );
      const newId = raw.id ?? `cart-${Date.now()}`;
      if (existingIdx >= 0) {
        return prev.map((item, idx) =>
          idx === existingIdx
            ? { ...item, quantity: item.quantity + (raw.quantity ?? 1) }
            : item
        );
      }
      const cartItem: CartItem = normalizeItem({
        ...raw,
        id: newId,
        imageUrl: raw.imageUrl ?? raw.image,
      });
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
    feeXAF,
    totalWithFeeXAF,
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

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

// ─── Utility exports used by CheckoutModal ────────────────────────────────────
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

