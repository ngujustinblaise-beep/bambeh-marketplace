/**
 * ---------------------------------------------------------------------------
 * ADMIN PORTAL TYPE DEFINITIONS
 * ---------------------------------------------------------------------------
 *
 * Complete type system for the Admin Portal.
 *
 * Admin Roles:
 * - MASTER_ADMIN: Full access to everything (only one exists)
 * - ADMIN: Regular admin with limited access (no financial data)
 * - MODERATOR: Basic moderation capabilities
 *
 * FILE LOCATION: src/types/admin.ts
 *
 * © 2025 Bambé. All rights reserved.
 * ---------------------------------------------------------------------------
 */

// ---------------------------------------------------------------------------
// ADMIN ROLES & PERMISSIONS
// ---------------------------------------------------------------------------

export type AdminRole = "master_admin" | "admin" | "moderator";

export interface AdminPermissions {
  // User Management
  canViewUsers: boolean;
  canBlockUsers: boolean;
  canSuspendUsers: boolean;
  canDeleteUsers: boolean;
  canUpgradeUsers: boolean;
  canViewUserPasswords: boolean;
  canResetUserPasswords: boolean;

  // Financial
  canViewTransactions: boolean;
  canViewDailyRevenue: boolean;
  canViewDetailedFinancials: boolean;
  canTogglePayments: boolean;
  canAttachDiscounts: boolean;
  canRefundTransactions: boolean;

  // Admin Management
  canCreateAdmins: boolean;
  canDeleteAdmins: boolean;
  canModifyAdminPermissions: boolean;
  canViewAdminActivity: boolean;

  // Content & Disputes
  canViewListings: boolean;
  canRemoveListings: boolean;
  canResolveDisputes: boolean;
  canTrackOrders: boolean;

  // Analytics
  canViewAnalytics: boolean;
  canViewAppTrends: boolean;
  canViewCompetitorAnalysis: boolean;
  canExportData: boolean;

  // System
  canAccessSystemSettings: boolean;
  canViewLogs: boolean;
  canManageNotifications: boolean;
}

// Default permissions by role
export const DEFAULT_PERMISSIONS: Record<AdminRole, AdminPermissions> = {
  master_admin: {
    canViewUsers: true,
    canBlockUsers: true,
    canSuspendUsers: true,
    canDeleteUsers: true,
    canUpgradeUsers: true,
    canViewUserPasswords: true,
    canResetUserPasswords: true,
    canViewTransactions: true,
    canViewDailyRevenue: true,
    canViewDetailedFinancials: true,
    canTogglePayments: true,
    canAttachDiscounts: true,
    canRefundTransactions: true,
    canCreateAdmins: true,
    canDeleteAdmins: true,
    canModifyAdminPermissions: true,
    canViewAdminActivity: true,
    canViewListings: true,
    canRemoveListings: true,
    canResolveDisputes: true,
    canTrackOrders: true,
    canViewAnalytics: true,
    canViewAppTrends: true,
    canViewCompetitorAnalysis: true,
    canExportData: true,
    canAccessSystemSettings: true,
    canViewLogs: true,
    canManageNotifications: true,
  },
  admin: {
    canViewUsers: true,
    canBlockUsers: true,
    canSuspendUsers: true,
    canDeleteUsers: false,
    canUpgradeUsers: true,
    canViewUserPasswords: false,
    canResetUserPasswords: true,
    canViewTransactions: true,
    canViewDailyRevenue: false, // Cannot see money!,
    canViewDetailedFinancials: false, // Cannot see money!,
    canTogglePayments: false,
    canAttachDiscounts: false,
    canRefundTransactions: false,
    canCreateAdmins: false,
    canDeleteAdmins: false,
    canModifyAdminPermissions: false,
    canViewAdminActivity: false,
    canViewListings: true,
    canRemoveListings: true,
    canResolveDisputes: true,
    canTrackOrders: true,
    canViewAnalytics: true,
    canViewAppTrends: true,
    canViewCompetitorAnalysis: true,
    canExportData: false,
    canAccessSystemSettings: false,
    canViewLogs: false,
    canManageNotifications: true,
  },
  moderator: {
    canViewUsers: true,
    canBlockUsers: false,
    canSuspendUsers: true,
    canDeleteUsers: false,
    canUpgradeUsers: false,
    canViewUserPasswords: false,
    canResetUserPasswords: false,
    canViewTransactions: false,
    canViewDailyRevenue: false,
    canViewDetailedFinancials: false,
    canTogglePayments: false,
    canAttachDiscounts: false,
    canRefundTransactions: false,
    canCreateAdmins: false,
    canDeleteAdmins: false,
    canModifyAdminPermissions: false,
    canViewAdminActivity: false,
    canViewListings: true,
    canRemoveListings: true,
    canResolveDisputes: true,
    canTrackOrders: true,
    canViewAnalytics: false,
    canViewAppTrends: false,
    canViewCompetitorAnalysis: false,
    canExportData: false,
    canAccessSystemSettings: false,
    canViewLogs: false,
    canManageNotifications: false,
  },
};

// ---------------------------------------------------------------------------
// ADMIN USER
// ---------------------------------------------------------------------------

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: AdminRole;
  permissions: AdminPermissions;
  avatar?: string;
  phone?: string;

  // Security
  passwordHash?: string;
  securityQuestion?: string;
  securityAnswer?: string;
  twoFactorEnabled: boolean;

  // Status
  isActive: boolean;
  lastLogin?: string;
  lastActivity?: string;
  loginAttempts: number;
  lockedUntil?: string;

  // Metadata
  createdAt: string;
  createdBy: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// APP STATISTICS
// ---------------------------------------------------------------------------

export interface AppStatistics {
  // Downloads
  totalDownloads: number;
  downloadsToday: number;
  downloadsThisWeek: number;
  downloadsThisMonth: number;

  // Users
  totalRegisteredUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;

  // Active Users
  totalActiveUsers: number;
  activeUsersToday: number;
  activeUsersThisWeek: number;

  // Paying Users (Subscriptions)
  totalPayingUsers: number;
  basicSubscribers: number;
  premiumSubscribers: number;
  goldSubscribers: number;

  // Vendors
  totalVendors: number;
  activeVendors: number;
  pendingVendors: number;

  // Listings
  totalListings: number;
  activeListings: number;
  pendingListings: number;

  // Financial (Master Admin Only)
  dailyRevenue?: number;
  weeklyRevenue?: number;
  monthlyRevenue?: number;
  totalRevenue?: number;

  // Transactions
  totalTransactions: number;
  pendingTransactions: number;
  completedTransactions: number;
  disputedTransactions: number;
}

// ---------------------------------------------------------------------------
// USER MANAGEMENT
// ---------------------------------------------------------------------------

export type UserStatus = "active" | "suspended" | "blocked" | "pending";

export interface ManagedUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;

  // Account
  tier: "Free" | "Basic" | "Premium" | "Gold" | null;
  status: UserStatus;
  isVendor: boolean;
  vendorStatus?: "none" | "pending" | "approved" | "rejected" | "suspended";

  // Security (Master Admin Only)
  passwordHash?: string;
  securityQuestion?: string;
  securityAnswer?: string;

  // Activity
  registeredAt: string;
  lastLogin?: string;
  lastActivity?: string;
  totalLogins: number;

  // Financial
  totalSpent: number;
  currentBalance: number;
  subscriptionExpiry?: string;

  // Actions History
  suspensionHistory: {
    date: string;
    reason: string;
    adminId: string;
    duration?: string;
  }[];
}

// ---------------------------------------------------------------------------
// TRANSACTIONS
// ---------------------------------------------------------------------------

export type TransactionType =
  | "subscription"
  | "zerm_purchase"
  | "vendor_fee"
  | "product_purchase"
  | "service_payment"
  | "refund"
  | "commission";

export type TransactionStatus =
  | "pending"
  | "completed"
  | "failed"
  | "refunded"
  | "disputed";

export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;

  // Parties
  userId: string;
  userName: string;
  vendorId?: string;
  vendorName?: string;

  // Amount
  amount: number;
  currency: "XAF" | "Zerm";
  commission?: number;
  netAmount?: number;

  // Payment
  paymentMethod: "mtn" | "orange" | "zerm" | "bank";
  paymentReference?: string;

  // Details
  description: string;
  itemId?: string;
  itemTitle?: string;

  // Metadata
  createdAt: string;
  completedAt?: string;
  refundedAt?: string;
}

// ---------------------------------------------------------------------------
// DISPUTES
// ---------------------------------------------------------------------------

export type DisputeStatus =
  | "open"
  | "in_review"
  | "resolved"
  | "closed"
  | "escalated";
export type DisputeType = "refund" | "delivery" | "quality" | "scam" | "other";

export interface Dispute {
  id: string;
  type: DisputeType;
  status: DisputeStatus;
  priority: "low" | "medium" | "high" | "urgent";

  // Parties
  reporterId: string;
  reporterName: string;
  reporterType: "buyer" | "vendor";
  accusedId: string;
  accusedName: string;

  // Transaction
  transactionId?: string;
  orderId?: string;
  amount?: number;

  // Details
  title: string;
  description: string;
  evidence: string[];

  // Resolution
  assignedTo?: string;
  resolution?: string;
  refundAmount?: number;

  // Timeline
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;

  // Messages
  messages: {
    id: string;
    senderId: string;
    senderName: string;
    senderRole: "user" | "vendor" | "admin";
    message: string;
    timestamp: string;
  }[];
}

// ---------------------------------------------------------------------------
// APP TRENDS & ANALYTICS
// ---------------------------------------------------------------------------

export interface AppTrend {
  date: string;
  downloads: number;
  registrations: number;
  activeUsers: number;
  transactions: number;
  revenue: number;
}

export interface CompetitorAnalysis {
  name: string;
  description: string;

  // SWOT
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];

  // Comparison
  marketShare?: number;
  estimatedUsers?: number;
  commissionRate?: string;
  features: string[];
}

// ---------------------------------------------------------------------------
// ADMIN ACTIVITY LOG
// ---------------------------------------------------------------------------

export type AdminAction =
  | "login"
  | "logout"
  | "view_user"
  | "block_user"
  | "suspend_user"
  | "unblock_user"
  | "upgrade_user"
  | "view_transaction"
  | "refund_transaction"
  | "resolve_dispute"
  | "create_admin"
  | "delete_admin"
  | "view_financials"
  | "export_data"
  | "change_settings";

export interface AdminActivityLog {
  id: string;
  adminId: string;
  adminName: string;
  adminRole: AdminRole;
  action: AdminAction;
  details: string;
  targetId?: string;
  targetType?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// ADMIN CONTEXT STATE
// ---------------------------------------------------------------------------

export interface AdminContextState {
  // Auth
  currentAdmin: AdminUser | null;
  isAuthenticated: boolean;
  isMasterAdmin: boolean;

  // Data
  statistics: AppStatistics | null;
  users: ManagedUser[];
  transactions: Transaction[];
  disputes: Dispute[];
  admins: AdminUser[];
  activityLogs: AdminActivityLog[];
  trends: AppTrend[];
  competitors: CompetitorAnalysis[];

  // Loading
  isLoading: boolean;

  // Error
  error: string | null;
}

export interface AdminContextActions {
  // Auth
  adminLogin: (
    email: string,
    password: string,
    securityAnswer?: string,
  ) => Promise<boolean>;
  adminLogout: () => void;

  // User Management
  blockUser: (userId: string, reason: string) => Promise<boolean>;
  suspendUser: (
    userId: string,
    reason: string,
    duration: string,
  ) => Promise<boolean>;
  unblockUser: (userId: string) => Promise<boolean>;
  upgradeUser: (userId: string, tier: string) => Promise<boolean>;
  attachDiscount: (
    userId: string,
    discount: number,
    expiry: string,
  ) => Promise<boolean>;

  // Financial (Master Admin Only)
  togglePayment: (userId: string, enabled: boolean) => Promise<boolean>;
  refundTransaction: (
    transactionId: string,
    amount: number,
    reason: string,
  ) => Promise<boolean>;

  // Disputes
  resolveDispute: (
    disputeId: string,
    resolution: string,
    refundAmount?: number,
  ) => Promise<boolean>;

  // Admin Management (Master Admin Only)
  createAdmin: (
    email: string,
    password: string,
    role: AdminRole,
    fullName: string,
  ) => Promise<boolean>;
  deleteAdmin: (adminId: string) => Promise<boolean>;

  // Data
  refreshStatistics: () => Promise<void>;
  fetchUsers: (filters?: any) => Promise<void>;
  fetchTransactions: (filters?: any) => Promise<void>;
  fetchDisputes: (filters?: any) => Promise<void>;
  fetchActivityLogs: (filters?: any) => Promise<void>;
  exportData: (type: string, format: "csv" | "xlsx" | "pdf") => Promise<void>;
}

export type AdminContextType = AdminContextState & AdminContextActions;
