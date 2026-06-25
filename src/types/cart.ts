export interface CartItem {
  id?: string;
  itemId: string;
  itemTitle: string;
  currency?: string;
  priceXAF: number;
  /** price alias kept for legacy components */
  price?: number;
  quantity?: number;
  imageUrl?: string;
  image?: string;
  title?: string;
}

export interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  total: number;
}
