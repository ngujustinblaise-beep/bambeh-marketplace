/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ANALYTICS TYPES
 * ═══════════════════════════════════════════════════════════════════════════
 * © 2025 Bambé. All rights reserved.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Analytics event types
 */
export type AnalyticsEventType =
  | "page_view"
  | "button_click"
  | "form_submit"
  | "item_view"
  | "item_purchase"
  | "search"
  | "share"
  | "error";

/**
 * Analytics event
 */
export interface AnalyticsEvent {
  type: AnalyticsEventType;
  name: string;
  properties?: Record<string, any>;
  timestamp: Date | string;
  userId?: string;
  sessionId?: string;
}

/**
 * User analytics profile
 */
export interface UserAnalytics {
  userId: string;
  pageViews: number;
  sessionCount: number;
  lastActive: Date | string;
  deviceType?: string;
  location?: string;
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  pageLoadTime: number;
  apiResponseTime: number;
  renderTime: number;
  timestamp: Date | string;
}

