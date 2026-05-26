export interface FavoriteItem {
  id: string;
  itemId: string;
  itemTitle: string;
  itemType: string;
  imageUrl?: string;
  priceXAF?: number;
  currency?: string;
  addedAt: string;
}
