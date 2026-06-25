import type { LocationDetails } from "./location";
export type { LocationDetails };

export type ItemCondition =
  | "brand-new" | "new" | "like-new" | "good"
  | "fair" | "poor" | "used" | "refurbished";

export type ItemType =
  | "marketplace" | "job" | "service" | "rental" | "vehicle" | "exchange";

export type JobCategory =
  | "technology" | "marketing" | "finance" | "education" | "health"
  | "construction" | "agriculture" | "transport" | "hospitality" | "other"
  | "healthcare" | "sales" | "government" | "engineering" | "legal"
  | "transportation" | "security" | "manufacturing";

export type EmploymentType =
  | "full-time" | "part-time" | "contract" | "internship" | "freelance"
  | "volunteer" | "temporary";

export type MarketplaceCategory =
  | "electronics" | "clothing" | "food" | "furniture" | "vehicles"
  | "books" | "sports" | "beauty" | "agriculture" | "other"
  | "toys" | "home-garden" | "tools" | "pets" | "art" | "jewelry";

export type ServiceCategory =
  | "cleaning" | "plumbing" | "electrical" | "tutoring" | "transport"
  | "photography" | "catering" | "IT" | "beauty" | "other"
  | "carpentry" | "painting" | "teaching" | "videography" | "web-development"
  | "graphic-design" | "accounting" | "legal" | "security" | "gardening"
  | "moving" | "pet-care" | "fitness" | "event-planning" | "translation" | "repair";

export type PricingUnit = "hour" | "day" | "week" | "month" | "fixed" | "per_item";

export type RentalCategory =
  | "apartment" | "house" | "room" | "office" | "shop" | "land" | "other"
  | "residential" | "commercial" | "vehicle" | "equipment" | "event-space" | "storage";

export type PropertyType =
  | "residential" | "commercial" | "land" | "mixed"
  | "apartment" | "house" | "studio" | "room" | "villa"
  | "office" | "shop" | "warehouse" | "parking"
  | "car" | "truck" | "equipment";

export type RentalPeriod = "daily" | "weekly" | "monthly" | "yearly";

export interface ContactInfo {
  phone?: string;
  whatsapp?: string;
  email?: string;
}

export interface SalaryRange {
  min: number;
  max: number;
  currency: string;
  period: string;
}

export interface MarketplaceItem {
  id: string;
  title: string;
  description?: string;
  priceXAF: number;
  price?: number;
  currency?: string;
  condition: ItemCondition;
  category?: MarketplaceCategory | string;
  subcategory?: string;
  images?: string[];
  location?: LocationDetails;
  sellerId?: string;
  createdAt?: string;
  quantity?: number;
  contact?: ContactInfo | string;
  acceptsZermCoins?: boolean;
  status?: "active" | "sold" | "draft";
  featured?: boolean;
  type?: ItemType;
}

export interface JobItem {
  id: string;
  title: string;
  description?: string;
  salary?: number | SalaryRange;
  location?: LocationDetails;
  category?: JobCategory | string;
  employmentType?: EmploymentType;
  status?: "active" | "closed" | "draft";
  createdAt?: string;
  featured?: boolean;
  type?: ItemType;
  images?: string[];
}

export type JobListing = JobItem;

export interface ServiceItem {
  id: string;
  title: string;
  description?: string;
  priceXAF?: number;
  pricingUnit?: PricingUnit;
  category?: ServiceCategory | string;
  location?: LocationDetails;
  providerId?: string;
  createdAt?: string;
  status?: "active" | "inactive" | "draft";
  featured?: boolean;
  type?: ItemType;
  images?: string[];
}

export interface RentalItem {
  id: string;
  title: string;
  description?: string;
  priceXAF?: number;
  rentalPeriod?: RentalPeriod;
  category?: RentalCategory | string;
  propertyType?: PropertyType;
  location?: LocationDetails;
  ownerId?: string;
  createdAt?: string;
  status?: "active" | "rented" | "draft";
  featured?: boolean;
  type?: ItemType;
  images?: string[];
}

export type AnyItem = MarketplaceItem | JobItem | ServiceItem | RentalItem;

export interface ItemFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: ItemCondition;
  location?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
}

export interface PaginatedItemsResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
