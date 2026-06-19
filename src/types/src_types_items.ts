/**
 * src/types/src_types_items.ts
 * Bambeh Marketplace â€” Marketplace Item & Listing Types
 * Â© 2026 Bambeh Marketplace. All rights reserved.
 */

// â”€â”€â”€ Listing Status â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export type ListingStatus =
  | "active"
  | "sold"
  | "reserved"
  | "expired"
  | "draft"
  | "pending_review"
  | "rejected";

// â”€â”€â”€ Listing Category â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export type ListingCategory =
  | "electronics"
  | "fashion"
  | "vehicles"
  | "properties"
  | "jobs"
  | "services"
  | "food"
  | "agriculture"
  | "furniture"
  | "sports"
  | "books"
  | "babies"
  | "health"
  | "beauty"
  | "other";

// â”€â”€â”€ Item Condition â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export type ItemCondition = "new" | "like_new" | "good" | "fair" | "poor";

// â”€â”€â”€ Delivery Option â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export type DeliveryOption = "pickup" | "delivery" | "both";

// â”€â”€â”€ Payment Method â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export type PaymentMethod =
  | "mtn_momo"
  | "orange_money"
  | "cash"
  | "bank_transfer"
  | "notchpay"
  | "escrow";

// â”€â”€â”€ Location â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export interface ItemLocation {
  city: string;
  region: string;
  country: string;
  latitude?: number;
  longitude?: number;
  address?: string;
}

// â”€â”€â”€ Item Image â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export interface ItemImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  order: number;
  isMain: boolean;
}

// â”€â”€â”€ Seller Info (embedded) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export interface SellerInfo {
  id: string;
  displayName: string;
  avatarUrl?: string;
  isVerified: boolean;
  isVendor: boolean;
  rating: number;
  reviewCount: number;
  joinedAt: string;
  location?: string;
}

// â”€â”€â”€ Marketplace Item â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export interface MarketplaceItem {
  id: string;
  sellerId: string;
  seller?: SellerInfo;
  title: string;
  description: string;
  category: ListingCategory;
  subcategory?: string;
  priceXAF: number;
  isNegotiable: boolean;
  condition: ItemCondition;
  images: ItemImage[];
  location: ItemLocation;
  deliveryOption: DeliveryOption;
  paymentMethods: PaymentMethod[];
  status: ListingStatus;
  viewCount: number;
  favoriteCount: number;
  tags?: string[];
  isSponsored: boolean;
  isFeatured: boolean;
  expiresAt?: string;
  soldAt?: string;
  createdAt: string;
  updatedAt: string;
}

// â”€â”€â”€ Job Listing â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export type JobType =
  | "full_time"
  | "part_time"
  | "contract"
  | "internship"
  | "freelance";

export type ExperienceLevel =
  | "entry"
  | "mid"
  | "senior"
  | "executive"
  | "no_experience";

export interface JobListing {
  id: string;
  employerId: string;
  employer?: SellerInfo;
  title: string;
  company?: string;
  description: string;
  requirements?: string;
  benefits?: string;
  category: string;
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  salaryMinXAF?: number;
  salaryMaxXAF?: number;
  isSalaryNegotiable: boolean;
  location: ItemLocation;
  isRemote: boolean;
  applicationDeadline?: string;
  status: ListingStatus;
  viewCount: number;
  applicationCount: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// â”€â”€â”€ Service Listing â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export interface ServiceListing {
  id: string;
  providerId: string;
  provider?: SellerInfo;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  priceFromXAF: number;
  priceToXAF?: number;
  isPriceNegotiable: boolean;
  images: ItemImage[];
  location: ItemLocation;
  isOnlineService: boolean;
  deliveryDays?: number;
  paymentMethods: PaymentMethod[];
  status: ListingStatus;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// â”€â”€â”€ Exchange Item â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export interface ExchangeItem {
  id: string;
  ownerId: string;
  owner?: SellerInfo;
  title: string;
  description: string;
  category: ListingCategory;
  condition: ItemCondition;
  images: ItemImage[];
  location: ItemLocation;
  wantedItems: string;       // what owner wants in exchange
  estimatedValueXAF?: number;
  allowCashSupplement: boolean;
  maxCashSupplementXAF?: number;
  status: ListingStatus;
  viewCount: number;
  offerCount: number;
  createdAt: string;
  updatedAt: string;
}

// â”€â”€â”€ Create/Update Requests â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export interface CreateMarketplaceItemRequest {
  title: string;
  description: string;
  category: ListingCategory;
  subcategory?: string;
  priceXAF: number;
  isNegotiable: boolean;
  condition: ItemCondition;
  imageUrls: string[];
  location: ItemLocation;
  deliveryOption: DeliveryOption;
  paymentMethods: PaymentMethod[];
  tags?: string[];
}

export interface UpdateMarketplaceItemRequest extends Partial<CreateMarketplaceItemRequest> {
  id: string;
  status?: ListingStatus;
}

// â”€â”€â”€ Paginated Response â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export interface PaginatedItemsResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  error: string | null;
}

// â”€â”€â”€ Filter Options â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export interface ItemFilters {
  category?: ListingCategory;
  subcategory?: string;
  minPriceXAF?: number;
  maxPriceXAF?: number;
  condition?: ItemCondition;
  location?: string;
  deliveryOption?: DeliveryOption;
  isNegotiable?: boolean;
  isFeatured?: boolean;
  sortBy?: "price_asc" | "price_desc" | "newest" | "popular";
  searchQuery?: string;
  page?: number;
  pageSize?: number;
}
