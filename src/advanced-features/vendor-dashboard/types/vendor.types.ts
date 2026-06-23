/**
 * BAMBÉ MARKETPLACE - VENDOR TYPES
 * TypeScript interfaces for vendor dashboard
 * Version: 1.0.0
 */

export interface VendorProfile {
  id: string;
  userId: string;
  businessName: string;
  businessType: "individual" | "company";
  category: string[];
  description: string;
  logo?: string;
  coverImage?: string;
  phone: string;
  email: string;
  address: string;
  location: {
    latitude: number;
    longitude: number;
    city: string;
    region: string;
  };
  businessHours: BusinessHours[];
  rating: number;
  totalReviews: number;
  totalSales: number;
  joinedDate: string;
  verified: boolean;
  status: "active" | "suspended" | "pending";
  bankDetails?: BankDetails;
  taxId?: string;
}

export interface BusinessHours {
  day:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";
  open: string; // HH:mm format,
  close: string; // HH:mm format,
  isOpen: boolean;
}

export interface BankDetails {
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankCode?: string;
}

export interface Product {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  price: number;
  compareAtPrice?: number;
  cost?: number;
  sku?: string;
  barcode?: string;
  stockQuantity: number;
  lowStockThreshold: number;
  images: string[];
  variants?: ProductVariant[];
  specifications?: { [key: string]: string };
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: "cm" | "inch";
  };
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  views: number;
  sales: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  options: { [key: string]: string }; // e.g., { "Color": "Red", "Size": "L" },
  price: number;
  sku?: string;
  stockQuantity: number;
  image?: string;
}

export interface VendorOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: VendorOrderItem[];
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  tax: number;
  total: number;
  vendorEarnings: number;
  status: VendorOrderStatus;
  paymentStatus: "pending" | "paid" | "refunded";
  paymentMethod: string;
  deliveryAddress: string;
  deliveryLocation?: {
    latitude: number;
    longitude: number;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
  acceptedAt?: string;
  readyAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  estimatedPreparationTime?: number; // in minutes
}

export type VendorOrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready"
  | "picked_up"
  | "completed"
  | "cancelled"
  | "rejected";

export interface VendorOrderItem {
  id: string;
  productId: string;
  productName: string;
  variantName?: string;
  quantity: number;
  price: number;
  total: number;
  image?: string;
  notes?: string;
}

export interface VendorStats {
  today: {
    orders: number;
    revenue: number;
    views: number;
  };
  week: {
    orders: number;
    revenue: number;
    views: number;
  };
  month: {
    orders: number;
    revenue: number;
    views: number;
  };
  allTime: {
    orders: number;
    revenue: number;
    customers: number;
    products: number;
    reviews: number;
    averageRating: number;
  };
  pendingOrders: number;
  lowStockProducts: number;
  availableBalance: number;
  pendingBalance: number;
}

export interface VendorReview {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  rating: number;
  comment?: string;
  images?: string[];
  createdAt: string;
  vendorResponse?: {
    message: string;
    respondedAt: string;
  };
}

export interface VendorAnalytics {
  period: string;
  date: string;
  orders: number;
  revenue: number;
  views: number;
  customers: number;
  averageOrderValue: number;
  conversionRate: number;
}

export interface VendorNotification {
  id: string;
  type:
    | "new_order"
    | "order_cancelled"
    | "low_stock"
    | "new_review"
    | "payout"
    | "system";
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

export interface PayoutRequest {
  id: string;
  vendorId: string;
  amount: number;
  status: "pending" | "processing" | "completed" | "rejected";
  bankDetails: BankDetails;
  requestedAt: string;
  processedAt?: string;
  completedAt?: string;
  rejectionReason?: string;
  transactionId?: string;
}

export interface VendorPromotion {
  id: string;
  vendorId: string;
  name: string;
  type: "percentage" | "fixed_amount" | "buy_x_get_y" | "free_shipping";
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  applicableProducts?: string[]; // product IDs,
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface StockAlert {
  id: string;
  productId: string;
  productName: string;
  currentStock: number;
  threshold: number;
  status: "low" | "out";
  createdAt: string;
}

export interface CustomerInsight {
  customerId: string;
  customerName: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: string;
  favoriteProducts: string[];
}

