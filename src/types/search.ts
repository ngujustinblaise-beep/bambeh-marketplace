export interface SearchResult {
  id: string;
  type: "marketplace" | "job" | "service" | "rental" | "vehicle";
  title: string;
  description?: string;
  priceXAF?: number;
  price?: number;
  primaryPhoto?: string;
  imageUrl?: string;
  location?: string;
  category?: string;
}
