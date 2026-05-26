/**
 * MARKETPLACE SERVICE - Mock Data with LocalStorage
 */

export interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  images: string[];
  seller: { id: string; name: string; avatar?: string; rating?: number };
  location: string;
  condition: "new" | "used" | "refurbished";
  createdAt: string;
  expiresAt: string;
  status: "active" | "sold" | "expired";
  views: number;
  favorites: number;
}

const MOCK_MARKETPLACE_ITEMS: MarketplaceItem[] = [
  {
    id: "1", title: "iPhone 15 Pro Max - 256GB",
    description: "Brand new iPhone 15 Pro Max in Titanium Blue. Never used, still in original packaging.",
    price: 850000, currency: "XAF", category: "Electronics",
    images: ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500"],
    seller: { id: "seller1", name: "Tech Store Yaoundé", rating: 4.8 },
    location: "Yaoundé, Centre", condition: "new",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active", views: 245, favorites: 18,
  },
  {
    id: "2", title: "Samsung Galaxy S24 Ultra",
    description: "Latest Samsung flagship with S-Pen. 512GB storage, excellent condition.",
    price: 720000, currency: "XAF", category: "Electronics",
    images: ["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500"],
    seller: { id: "seller2", name: "Mobile Hub", rating: 4.6 },
    location: "Douala, Littoral", condition: "used",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active", views: 189, favorites: 12,
  },
  {
    id: "3", title: 'MacBook Pro 16" M3 Max',
    description: "Professional laptop for developers and creators. 64GB RAM, 2TB SSD.",
    price: 2500000, currency: "XAF", category: "Electronics",
    images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500"],
    seller: { id: "seller3", name: "Apple Premium Store", rating: 4.9 },
    location: "Yaoundé, Centre", condition: "new",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active", views: 456, favorites: 34,
  },
  {
    id: "4", title: "Toyota Corolla 2023",
    description: "Well maintained, low mileage. Full service history.",
    price: 15000000, currency: "XAF", category: "Vehicles",
    images: ["https://images.unsplash.com/photo-1623869675781-80aa31baa6e8?w=500"],
    seller: { id: "seller4", name: "Auto Deals CM", rating: 4.7 },
    location: "Douala, Littoral", condition: "used",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active", views: 678, favorites: 45,
  },
  {
    id: "5", title: "Modern 3-Bedroom Apartment",
    description: "Spacious apartment in Bastos with modern amenities.",
    price: 350000, currency: "XAF", category: "Real Estate",
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500"],
    seller: { id: "seller5", name: "Bastos Properties", rating: 4.5 },
    location: "Yaoundé, Centre", condition: "new",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active", views: 234, favorites: 19,
  },
];

class MarketplaceService {
  private storageKey = "bambeh_marketplace_items";

  private initializeData() {
    const existingData = localStorage.getItem(this.storageKey);
    if (!existingData) {
      localStorage.setItem(this.storageKey, JSON.stringify(MOCK_MARKETPLACE_ITEMS));
    }
  }

  getAllItems(): Promise<MarketplaceItem[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.initializeData();
        const data = localStorage.getItem(this.storageKey);
        const items = data ? JSON.parse(data) : MOCK_MARKETPLACE_ITEMS;
        const activeItems = items.filter((item: MarketplaceItem) => {
          const now = new Date();
          const expiresAt = new Date(item.expiresAt);
          return expiresAt > now && item.status === "active";
        });
        resolve(activeItems);
      }, 500);
    });
  }

  getItemById(id: string): Promise<MarketplaceItem | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.initializeData();
        const data = localStorage.getItem(this.storageKey);
        const items = data ? JSON.parse(data) : MOCK_MARKETPLACE_ITEMS;
        const item = items.find((i: MarketplaceItem) => i.id === id);
        resolve(item || null);
      }, 300);
    });
  }

  addItem(
    item: Omit<MarketplaceItem, "id" | "createdAt" | "expiresAt" | "views" | "favorites">,
  ): Promise<MarketplaceItem> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.initializeData();
        const data = localStorage.getItem(this.storageKey);
        const items = data ? JSON.parse(data) : [];
        const newItem: MarketplaceItem = {
          ...item,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          views: 0,
          favorites: 0,
        };
        items.push(newItem);
        localStorage.setItem(this.storageKey, JSON.stringify(items));
        resolve(newItem);
      }, 500);
    });
  }

  searchItems(query: string): Promise<MarketplaceItem[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.getAllItems().then((items) => {
          const filtered = items.filter(
            (item) =>
              item.title.toLowerCase().includes(query.toLowerCase()) ||
              item.description.toLowerCase().includes(query.toLowerCase()) ||
              item.category.toLowerCase().includes(query.toLowerCase()),
          );
          resolve(filtered);
        });
      }, 300);
    });
  }
}

export const marketplaceService = new MarketplaceService();
