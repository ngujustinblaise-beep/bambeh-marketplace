/**
 * src/types/src_types_items.ts
 * Bambeh Marketplace — Marketplace Item & Listing Types
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

// --- Listing Status ----------------------------------------------------------
export type ListingStatus =
  | "active"
  | "sold"
  | "reserved"
  | "expired"
  | "draft"
  | "pending_review"
  | "rejected";

// --- Listing Category --------------------------------------------------------
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

// --- Item Condition ----------------------------------------------------------
export type ItemCondition = "new" | "like_new" | "good" | "fair" | "poor";

// --- Delivery Option ---------------------------------------------------------
export type DeliveryOption = "pickup" | "delivery" | "both";

// --- Payment Method ----------------------------------------------------------
export type PaymentMethod =
  | "mtn_momo"
  | "orange_money"
  | "cash"
  | "bank_transfer"
  | "notchpay"
  | "escrow";

// --- Location ----------------------------------------------------------------
export interface ItemLocation {
  city: string;
  region: string;
  country: string;
  latitude?: number;
  longitude?: number;
  address?: string;
}

// --- Item Image --------------------------------------------------------------
export interface ItemImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  order: number;
  isMain: boolean;
}

// --- Seller Info (embedded) --------------------------------------------------
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

// --- Marketplace Item --------------------------------------------------------
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

// --- Job Listing -------------------------------------------------------------
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
  applyMethod?: "whatsapp" | "call" | "email" | "in_app";
  applyContact?: string;
  companyLogoUrl?: string;
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

// --- Service Listing ---------------------------------------------------------
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

// --- Exchange Item ------------------------------------------------------------
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

// --- Create/Update Requests --------------------------------------------------
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

// --- Paginated Response ------------------------------------------------------
export interface PaginatedItemsResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  error: string | null;
}

// --- Filter Options ----------------------------------------------------------
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

