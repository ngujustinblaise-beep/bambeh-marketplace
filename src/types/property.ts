export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: {
    city: string;
    area: string;
    address: string;
    region?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  type: "apartment" | "house" | "land" | "commercial" | "office";
  category: "rent" | "sale";
  bedrooms?: number;
  bathrooms?: number;
  area: number; // in square meters,
  amenities: string[];
  images: string[];
  featured: boolean;
  verified: boolean;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  ownerAvatar?: string;
  createdAt: Date;
  updatedAt: Date;
  views: number;
  favorites: number;
  status: "available" | "rented" | "sold" | "pending";
  keywords: string[];
}

export interface PropertyFilter {
  type?: Property["type"][];
  category?: Property["category"];
  priceMin?: number;
  priceMax?: number;
  bedrooms?: number;
  bathrooms?: number;
  areaMin?: number;
  areaMax?: number;
  location?: string;
  amenities?: string[];
  verified?: boolean;
  featured?: boolean;
}

export interface PropertySearchParams extends PropertyFilter {
  query?: string;
  sortBy?: "price-asc" | "price-desc" | "date-desc" | "date-asc" | "popular";
  page?: number;
  limit?: number;
}

// Sample property for reference (commented to avoid syntax errors)
/*
const sampleProperty: Property = {
  id: '1',
  title: 'Modern Apartment in Bastos',
  description: 'Beautiful 3-bedroom apartment with modern amenities',
  price: 250000,
  location: {
    city: 'Yaoundé',
    area: 'Bastos',
    address: '123 Bastos Street'
  },
  type: 'apartment',
  category: 'rent',
  bedrooms: 3,
  bathrooms: 2,
  area: 120,
  amenities: ['WiFi', 'Parking', 'Security'],
  images: [],
  featured: true,
  verified: true,
  ownerId: '1',
  ownerName: 'John Doe',
  ownerPhone: '+237671234567',
  createdAt: new Date(),
  updatedAt: new Date(),
  views: 0,
  favorites: 0,
  status: 'available',
  keywords: ['apartment', 'bastos', 'modern', 'yaoundé']
};
*/

