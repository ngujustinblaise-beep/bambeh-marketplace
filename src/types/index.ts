// Bambeh Marketplace - Shared Types v6 (Final)

export type UserRole         = 'buyer' | 'seller' | 'admin' | 'user' | 'vendor' | string;
export type OrderStatus      = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
export type ProductStatus    = 'active' | 'draft' | 'sold';
export type PaymentMethod    = 'mtn_momo' | 'orange_money' | 'card';
export type PaymentStatus    = 'pending' | 'success' | 'failed';
export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'enterprise' | 'Basic' | 'Premium' | 'Gold' | string;
export type Language         = 'en' | 'fr' | 'ar' | 'ha';
export type NotificationPriority = 'low' | 'normal' | 'medium' | 'high' | 'urgent';
export type ItemCondition    = 'brand-new' | 'new' | 'like-new' | 'good' | 'fair' | 'poor' | string;
export type NotificationType = 'order' | 'delivery' | 'system' | 'payment' | 'promotion' | 'info' | 'error' | 'success' | 'warning' | 'message' | 'promo';
export type SortOrder        = 'newest' | 'oldest' | 'date' | 'rating' | 'price_asc' | 'price_desc' | string;
export type AttachmentType   = 'image' | 'audio' | 'file' | 'document' | 'video';
export type AuthTier         = 'Basic' | 'Premium' | 'Gold' | string;

export interface User {
  avatarUrl?: string;
  id?: string;
  uid?: string;
  username?: string;
  email?: string;
  displayName?: string;
  name?: string;
  full_name?: string;
  phone?: string;
  phoneNumber?: string;
  avatar?: string | null;
  avatar_url?: string | null;
  photoURL?: string | null;
  profileImage?: string | null;
  bio?: string | null;
  address?: string | null;
  role?: UserRole;
  city?: string | null;
  fcm_token?: string | null;
  tier?: AuthTier;
  is_verified?: boolean;
  isVerified?: boolean;
  isSeller?: boolean;
  isVendor?: boolean;
  isAdmin?: boolean;
  isSubscribed?: boolean;
  subscriptionTier?: string;
  subscriptionExpiry?: string | Date;
  zermCoins?: number;
  rating?: number;
  reviewsCount?: number;
  totalSales?: number;
  canUpload?: boolean;
  canPostJobs?: boolean;
  canPostItems?: boolean;
  canPostServices?: boolean;
  canPostProperties?: boolean;
  canChangeTiers?: string[];
  created_at?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  lastLogin?: Date | string;
  preferences?: {
    language?: Language;
    currency?: 'XAF' | 'USD' | 'EUR';
    notifications?: boolean;
    darkMode?: boolean;
  };
}

export interface UserProfile extends User {
  uid?: string;
  zermCoins: number;
  subscriptionTier: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date;
  isVerified: boolean;
  isSeller: boolean;
  isServiceProvider?: boolean;
  rating: number;
  reviewsCount: number;
  totalSales: number;
}

export interface SignUpData {
  name?: string;
  full_name?: string;
  displayName?: string;
  username?: string;
  email?: string;
  password?: string;
  phone?: string;
  phoneNumber?: string;
  city?: string;
  role?: string;
}

export interface UserData extends User {}
export interface ManagedUser extends User {}
export interface AdminUser extends User { username?: string; }
export interface VendorData extends User {
  businessName?: string;
  businessType?: string;
  registrationNumber?: string;
  taxId?: string;
}

export interface LocationDetails {
  area?: string;
  region?: string;
  division?: string;
  subdivision?: string;
  village?: string;
  city?: string;
}

export interface Region { id?: string; name: string; code?: string; }
export interface Division { id?: string; name: string; regionId?: string; }
export interface Subdivision { id?: string; name: string; divisionId?: string; }

export interface Product {
  id: string;
  shop_id?: string;
  category_id?: string;
  name?: string;
  title?: string;
  description?: string | null;
  price_xaf?: number;
  price?: number;
  currency?: string;
  stock_qty?: number;
  images?: string[];
  image?: string | null;
  status?: ProductStatus;
  views_count?: number;
  created_at?: string;
  createdAt?: Date | string;
  sellerId?: string;
  sellerName?: string;
  location?: string;
  city?: string;
  rating?: number;
  reviewsCount?: number;
  category?: string;
  keywords?: string[];
  type?: string;
}

// FIX: was `extends Product  | string;` — restored opening brace
export interface MarketplaceItem extends Product {
  quantity?: number;
  condition?: ItemCondition;
  keywords?: string[];
}

export interface JobItem extends Product { keywords?: string[]; }
export interface ServiceItem extends Product { keywords?: string[]; }
export interface RentalItem extends Product { keywords?: string[]; }

export interface FavoriteItem {
  id: string;
  title?: string;
  price?: number;
  image?: string | null;
  currency?: string;
  type?: string;
  addedAt?: Date | string;
}

export interface Shop {
  id: string;
  owner_id?: string;
  name: string;
  description?: string | null;
  logo_url?: string | null;
  banner_url?: string | null;
  city?: string;
  rating?: number;
  is_active?: boolean;
  created_at?: string;
}

export interface Order {
  id: string;
  buyer_id?: string;
  shop_id?: string;
  userId?: string;
  orderId?: string;
  status?: OrderStatus;
  total_xaf?: number;
  total?: number;
  delivery_address?: Record<string, unknown>;
  notchpay_ref?: string | null;
  platform_fee_xaf?: number;
  paid_at?: string | null;
  created_at?: string;
  createdAt?: Date | string;
  items?: OrderItem[];
  courier?: { name: string; trackingNumber?: string; phone?: string; phoneNumber?: string };
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id?: string;
  quantity: number;
  unit_price_xaf?: number;
  subtotal_xaf?: number;
  snapshot?: Record<string, unknown>;
}

export interface CartItem {
  id?: string;
  itemId?: string;
  productId?: string;
  itemTitle?: string;
  itemImage?: string | null;
  title?: string;
  name?: string;
  image?: string | null;
  price?: number;
  price_xaf?: number;
  quantity?: number;
  sellerId?: string;
  sellerName?: string;
  currency?: string;
  shopId?: string;
  type?: string;
}

export interface Message {
  id?: string;
  order_id?: string;
  sender_id?: string;
  senderId?: string;
  senderName?: string;
  senderImage?: string | null;
  content?: string;
  text?: string;
  type?: string;
  status?: 'sent' | 'delivered' | 'read' | string;
  is_read?: boolean;
  isRead?: boolean;
  created_at?: string;
  createdAt?: Date | string;
  timestamp?: Date | string;
  actionUrl?: string;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id?: string;
  type: 'image' | 'audio' | 'file' | 'document' | 'video';
  url: string;
  name?: string;
  size?: number;
}

export interface Conversation {
  id: string;
  name?: string;
  participants?: string[];
  participantDetails?: ChatParticipant[];
  lastMessage?: string;
  lastMessageTime?: Date | string;
  unreadCount?: number;
  updatedAt?: Date | string;
}

export interface ChatParticipant {
  id: string;
  name?: string;
  avatar?: string | null;
  isOnline?: boolean;
}

export interface Review {
  id: string;
  reviewer_id?: string;
  product_id?: string;
  order_id?: string;
  rating: number;
  name?: string;
  userName?: string;
  userAvatar?: string | null;
  comment?: string | null;
  title?: string;
  images?: string[];
  verified?: boolean;
  helpful?: number;
  response?: {
    message: string;
    comment?: string;
    respondedAt: Date;
    createdAt?: Date | string;
    responderName: string;
  };
  created_at?: string;
  createdAt?: Date | string;
}

export interface Notification {
  id: string;
  user_id?: string;
  type?: NotificationType;
  title?: string;
  body?: string;
  message?: string;
  actionUrl?: string;
  timestamp?: Date | string;
  priority?: NotificationPriority;
  is_read?: boolean;
  isRead?: boolean;
  sent_at?: string;
}

export interface NotificationPayload {
  id?: string;
  title: string;
  body: string;
  priority?: NotificationPriority;
  data?: Record<string, string>;
  imageUrl?: string;
  actionUrl?: string;
  icon?: string;
}

export interface NotificationPreferences {
  orderUpdates?: boolean;
  promotions?: boolean;
  messages?: boolean;
  system?: boolean;
  inAppEnabled?: boolean;
  pushEnabled?: boolean;
  emailEnabled?: boolean;
}

export interface Advertisement {
  id: string;
  title?: string;
  item?: Product | null;
  impressions?: number;
  clicks?: number;
  views?: number;
  autoRenew?: boolean;
  endDate?: string | Date;
  startDate?: string | Date;
  status?: string;
  budget?: number;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency?: string;
  phone?: string;
  method?: PaymentMethod;
  status?: PaymentStatus;
  notchpay_ref?: string;
}

export interface SubscriptionStatus {
  active?: boolean;
  status?: 'active' | 'inactive' | 'expired';
  tier?: SubscriptionTier;
  subscription?: {
    active: boolean;
    tier: string;
    expiresAt?: string;
  };
  expiresAt?: string;
}

export interface Transaction {
  id: string;
  name?: string;
  amount: number;
  type?: string;
  status?: string;
  createdAt?: Date | string;
}

export interface CommissionRecord {
  id: string;
  vendorId?: string;
  amount: number;
  rate?: number;
  createdAt?: Date | string;
}

export interface Referral {
  id: string;
  referrerId?: string;
  referredId?: string;
  status?: string;
  createdAt?: Date | string;
}

export interface DisputeParty {
  id: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  phone?: string;
}

export interface SearchContextType {
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  performSearch?: (q: string) => void;
  recentSearches?: string[];
  searchHistory?: string[];
  addRecentSearch?: (q: string) => void;
  clearRecentSearches?: () => void;
  clearHistory?: () => void;
  isSearching?: boolean;
  results?: Product[];
}

export interface AuthContextType {
  user?: User | null;
  currentUser?: User | null;
  login?: (email: string, password: string) => Promise<unknown>;
  logout?: () => Promise<void>;
  register?: (data: SignUpData) => Promise<void>;
  signup?: (data: SignUpData) => Promise<void>;
  isLoading?: boolean;
  loading?: boolean;
  isAuthenticated?: boolean;
  error?: string | null;
  changeTier?: (tier: AuthTier) => Promise<unknown>;
  updateProfile?: (updates: Partial<User>) => Promise<void>;
}

export interface VendorContextType {
  vendor?: VendorData | null;
  vendorProfile?: VendorData | null;
  vendorStatus?: string | null;
  isVendor?: boolean;
  isLoading?: boolean;
  isRegistering?: boolean;
  error?: string | null;
  analyticsData?: Record<string, unknown> | null;
  fetchAnalytics?: () => Promise<void>;
  registerAsVendor?: (data: VendorData) => Promise<void>;
}

export interface SubscriptionContextType {
  status?: SubscriptionStatus | null;
  isSubscribed?: boolean;
  hasAccess?: (feature: string) => boolean;
  subscribe?: (tier: string, method?: string) => Promise<void>;
  isLoading?: boolean;
  subscription?: SubscriptionStatus | null;
}

export interface VerificationContextType {
  isVerified?: boolean;
  verificationRequests?: unknown[];
  userBadges?: string[];
  submitVerificationRequest?: (data: unknown) => Promise<void>;
  getVerificationBadgeLabel?: (badge: string) => string;
}

export interface PerformanceMonitor {
  start?: (label?: string) => void;
  stop?: (label?: string) => void;
  getMetrics?: () => Record<string, number>;
}

export interface BundleAnalyzer {
  analyzeBundle?: () => void;
}
