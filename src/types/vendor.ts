export type VendorStatus =
  | "pending" | "approved" | "rejected" | "suspended" | "none";

export type VendorVerificationLevel = "unverified" | "basic" | "verified" | "premium";

export type VendorBusinessType =
  | "sole_proprietor" | "partnership" | "llc" | "corporation"
  | "cooperative" | "other"
  | "products" | "services" | "jobs" | "rentals" | "vehicles" | "all";

export interface VendorProfile {
  id: string;
  userId: string;
  businessName: string;
  logoUrl?: string;
  description?: string;
  status: VendorStatus;
  verificationLevel?: VendorVerificationLevel;
  category?: string;
  rating?: number;
  createdAt?: string;
}

export interface VendorData {
  id: string;
  name: string;
  businessName?: string;
  email?: string;
  phone?: string;
  status?: VendorStatus;
}

export interface VendorRegistrationFormData {
  businessName: string;
  businessType: VendorBusinessType;
  businessDescription?: string;
  businessCategory?: string;
  businessPhone?: string;
  businessEmail?: string;
  businessWhatsApp?: string;
  businessWebsite?: string;
  businessAddress?: string;
  description?: string;
  category?: string;
  phone?: string;
  email?: string;
  address?: string;
  logoUrl?: string;
  region?: string;
  city?: string;
  division?: string;
  agreeToTerms?: boolean;
  agreeToVendorPolicy?: boolean;
}

export interface VendorContextValue {
  vendorProfile: VendorProfile | null;
  isVendor: boolean;
  isLoading: boolean;
  error: string | null;
  registerAsVendor: (data: Partial<VendorProfile>) => Promise<void>;
  isRegistering: boolean;
  dashboardStats?: Record<string, number>;
  listings?: unknown[];
  orders?: unknown[];
  pendingOrdersCount?: number;
  refreshDashboard?: () => void;
  analyticsData?: unknown;
  fetchAnalytics?: () => void;
}

