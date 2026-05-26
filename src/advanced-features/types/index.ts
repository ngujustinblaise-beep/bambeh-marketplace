export type { PaymentIntent, PaymentResult, PaymentProvider } from "../payment-gateway/PaymentService";

export interface Order {
  id: string;
  userId: string;
  vendorId?: string;
  items: unknown[];
  totalXAF: number;
  status: OrderStatus;
  createdAt: string;
}

export type OrderStatus =
  | "pending" | "confirmed" | "processing" | "shipped"
  | "delivered" | "cancelled" | "refunded";

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  createdAt?: string;
  isBlocked?: boolean;
}

export interface Dispute {
  id: string;
  orderId: string;
  userId: string;
  reason: string;
  status: "open" | "investigating" | "resolved" | "closed";
  createdAt: string;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  openDisputes: number;
  activeVendors: number;
  // extra fields used by AdminPanel-ADVANCED and AdminService
  orderGrowth?: number;
  revenueGrowth?: number;
  pendingDisputes?: number;
  activeDrivers?: number;
  newUsersToday?: number;
  ordersToday?: number;
  revenueToday?: number;
}

export interface AnalyticsData {
  period: string;
  views: number;
  clicks: number;
  sales: number;
  revenue: number;
}

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
  altitude?: number;
}

export interface DriverLocation extends Location {
  driverId: string;
  driverName?: string;
  vehicleType?: string;
  isActive?: boolean;
  heading?: number;
  speed?: number;
}

export interface RouteInfo {
  distance: number;
  duration: number;
  polyline?: string;
}

export interface TrackingSession {
  id: string;
  sessionId?: string;
  orderId: string;
  driverId: string;
  status: "active" | "completed" | "cancelled";
  startedAt: string;
  locations: Location[];
}
