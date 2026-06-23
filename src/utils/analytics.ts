// File: src/utils/analytics.ts

export interface UserMetrics {
  // Engagement
  dailyActiveUsers: number;
  monthlyActiveUsers: number;
  sessionDuration: number;
  sessionsPerUser: number;

  // Conversion
  listingViews: number;
  contactButtonClicks: number;
  purchaseConversions: number;

  // Revenue
  subscriptionRevenue: number;
  transactionRevenue: number;
  averageOrderValue: number;

  // Growth
  newUserSignups: number;
  userRetentionRate: number;
  churnRate: number;
}

// FIX: missing comma between label? and value? parameters
// FIX: missing closing brace for function body
export function trackEvent(
  category: string,
  action: string,
  label?: string,
  value?: number
): void {
  console.log({ category, action, label, value });
}

