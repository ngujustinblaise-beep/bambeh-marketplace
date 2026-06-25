/**
 * TYPE DEFINITIONS FOR Bambeh MARKETPLACE
 * 
 * Complete type system for:
 * - Items (Jobs, Marketplace, Services, Rentals)
 * - Reviews & Ratings
 * - Advertisements
 * - Chat & Messaging
 * - Locations
 * - Cart & Transactions
 * - Users & Subscriptions
 */

// ==================== LOCATION TYPES ====================

export interface LocationDetails {
  region: string;
  division: string;
  subdivision: string;
  village: string;
  neighborhood?: string;
}

export interface LocationFilter extends Partial<LocationDetails> {
  searchQuery?: string;
}

// ==================== USER & SUBSCRIPTION TYPES ====================

export interface User {
  id: string;
  email: string;
  name: string;
  subscriptionTier?: SubscriptionTier;
}

export type SubscriptionTier = 'free' | 'basic' | 'premium';

export interface SubscriptionDetails {
  tier: SubscriptionTier;
  expiresAt?: Date;
  isActive: boolean;
}

// ==================== ITEM TYPES ====================

export type ItemType = 'job' | 'marketplace' | 'service' | 'rental';
export type ItemStatus = 'active' | 'sold' | 'rented' | 'closed' | 'pending';

export interface BaseItem {
  id: string;
  type: ItemType;
  title: string;
  description: string;
  keywords: string[];
  location: LocationDetails;
  userId: string; // Owner/Creator
  userName: string;
  userPhone?: string; // Only visible to subscribers
  images: string[];
  createdAt: Date;
  updatedAt: Date;
  status: ItemStatus;
  views: number;
  averageRating: number;
  reviewCount: number;
  isPromoted: boolean; // Featured/Advertised
}

// JOB ITEM
export interface JobItem extends BaseItem {
  type: 'job';
  category: JobCategory;
  company: string;
  salary?: {
    min: number;
    max: number;
    currency: 'XAF' | 'USD' | 'EUR';
    period: 'hourly' | 'daily' | 'monthly' | 'yearly';
  };
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship' | 'volunteer';
  requirements: string[];
  benefits?: string[];
  applicationDeadline?: Date;
  contactEmail?: string; // Subscribers only
}

export type JobCategory = 
  | 'technology'
  | 'healthcare'
  | 'education'
  | 'construction'
  | 'sales'
  | 'hospitality'
  | 'agriculture'
  | 'finance'
  | 'government'
  | 'other';

// MARKETPLACE ITEM
export interface MarketplaceItem extends BaseItem {
  type: 'marketplace';
  category: MarketplaceCategory;
  price: number;
  currency: 'XAF' | 'Zerm';
  condition: 'new' | 'used' | 'refurbished';
  color?: string;
  texture?: string;
  material?: string;
  size?: string;
  brand?: string;
  quantity: number;
  inStock: boolean;
  features?: string[];
}

export type MarketplaceCategory =
  | 'electronics'
  | 'clothing'
  | 'furniture'
  | 'vehicles'
  | 'food'
  | 'books'
  | 'toys'
  | 'sports'
  | 'tools'
  | 'jewelry'
  | 'other';

// SERVICE ITEM
export interface ServiceItem extends BaseItem {
  type: 'service';
  category: ServiceCategory;
  pricing: { amount: number; currency: string; unit: string };
  availability: {
    days: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[];
    hours: string; // e.g., "9:00 AM - 5:00 PM"
  };
  serviceArea: string[]; // Regions/areas covered
  certifications?: string[];
  experience?: string; // Years of experience
}

export type ServiceCategory =
  | 'cleaning'
  | 'plumbing'
  | 'electrical'
  | 'carpentry'
  | 'teaching'
  | 'catering'
  | 'security'
  | 'transportation'
  | 'photography'
  | 'consulting'
  | 'other';

// RENTAL ITEM
export interface RentalItem extends BaseItem {
  type: 'rental';
  category: RentalCategory;
  rentalPrice: { amount: number; period: string };
  propertyType?: 'apartment' | 'house' | 'studio' | 'room' | 'land' | 'commercial';
  bedrooms?: number;
  bathrooms?: number;
  squareMeters?: number;
  furnished: boolean;
  amenities?: string[];
  availableFrom?: Date;
  leaseTerm?: string; // e.g., "6 months minimum"
}

export type RentalCategory =
  | 'residential'
  | 'commercial'
  | 'land'
  | 'vehicle'
  | 'equipment'
  | 'other';

// Union type for all items
export type AnyItem = JobItem | MarketplaceItem | ServiceItem | RentalItem;

// ==================== REVIEW & RATING TYPES ====================

export interface Review {
  id: string;
  itemId: string;
  itemType: ItemType;
  userId: string;
  userName: string;
  userImage?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  images?: string[]; // Optional review images
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RatingStatistics {
  average: number;
  total: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

// ==================== ADVERTISEMENT TYPES ====================

export type AdDuration = 'day' | 'week' | 'month';

export interface Advertisement {
  id: string;
  itemId: string;
  duration: AdDuration;
  startDate: Date;
  endDate: Date;
  paid: boolean;
}

export interface AdPricing {
  duration: AdDuration;
  subscriberPrice: number;
  nonSubscriberPrice: number;
}

export const AD_PRICING: AdPricing[] = [
  { duration: 'day', subscriberPrice: 2, nonSubscriberPrice: 10 },
  { duration: 'week', subscriberPrice: 5, nonSubscriberPrice: 30 },
  { duration: 'month', subscriberPrice: 15, nonSubscriberPrice: 50 },
];

// ==================== CHAT & MESSAGING TYPES ====================

export interface Chat {
  id: string;
  participants: string[]; // User IDs
  participantDetails: {
    id: string;
    name: string;
    image?: string;
    isOnline: boolean;
  }[];
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: { [userId: string]: number };
  createdAt: Date;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
  read: boolean;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  type: 'image' | 'document' | 'voice';
  url: string;
  name: string;
  size: number;
}

// ==================== CART & CHECKOUT TYPES ====================

export interface CartItem {
  id: string;
  item: MarketplaceItem;
  quantity: number;
  addedAt: Date;
}

export interface Cart {
  items: CartItem[];
  total: number;
  updatedAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number; // in Zerm Coins
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
  deliveryAddress?: LocationDetails;
  contactPhone: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== TRANSACTION TYPES ====================

export type TransactionType = 
  | 'purchase'
  | 'advertisement'
  | 'subscription'
  | 'coin_purchase'
  | 'refund';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number; // in Zerm Coins (negative for spending, positive for earning)
  description: string;
  relatedId?: string; // Order ID, Ad ID, etc.
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  timestamp: Date;
}

export interface ZermCoinPurchase {
  id: string;
  userId: string;
  amount: number;
  pricePaid: number;
  currency: string;
  createdAt: Date;
}

// ==================== FILTER & SEARCH TYPES ====================

export interface ItemFilters {
  type?: ItemType;
  category?: string;
  location?: Partial<LocationDetails>;
  priceRange?: {
    min: number;
    max: number;
  };
  keywords?: string[];
  color?: string;
  texture?: string;
  condition?: 'new' | 'used' | 'refurbished';
  rating?: number; // Minimum rating
  sortBy?: 'newest' | 'oldest' | 'price-low' | 'price-high' | 'rating' | 'popular';
}

export interface SearchResult<T = AnyItem> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ==================== NOTIFICATION TYPES ====================

export type NotificationType =
  | 'new_message'
  | 'new_review'
  | 'item_sold'
  | 'ad_expiring'
  | 'subscription_expiring'
  | 'order_update';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
}

// ==================== VOICE COMMAND TYPES ====================

export type VoiceCommand =
  | 'search'
  | 'navigate'
  | 'filter'
  | 'call'
  | 'help';

export interface VoiceCommandResult {
  command: VoiceCommand;
  parameters: { [key: string]: any };
  confidence: number;
}

// ==================== FORM INPUT TYPES ====================

export interface AddItemFormData {
  type: ItemType;
  title: string;
  description: string;
  keywords: string[];
  category: string;
  location: LocationDetails;
  images: File[];
  
  // Job-specific
  company?: string;
  salary?: {
    min: number;
    max: number;
  };
  employmentType?: string;
  
  // Marketplace-specific
  price?: number;
  condition?: 'new' | 'used' | 'refurbished';
  color?: string;
  texture?: string;
  quantity?: number;
  
  // Service-specific
  pricing?: {
    amount: number;
    unit: string;
  };
  availability?: {
    days: string[];
    hours: string;
  };
  
  // Rental-specific
  rentalPrice?: {
    amount: number;
    period: string;
  };
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  furnished?: boolean;
}

// ==================== API RESPONSE TYPES ====================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ==================== UTILITY TYPES ====================

export type WithId<T> = T & { id: string };
export type WithTimestamps<T> = T & { createdAt: Date; updatedAt: Date };
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

// Type guard functions
export const isJobItem = (item: AnyItem): item is JobItem => item.type === 'job';
export const isMarketplaceItem = (item: AnyItem): item is MarketplaceItem => item.type === 'marketplace';
export const isServiceItem = (item: AnyItem): item is ServiceItem => item.type === 'service';
export const isRentalItem = (item: AnyItem): item is RentalItem => item.type === 'rental';



