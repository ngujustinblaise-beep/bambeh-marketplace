/**
 * src/utils/analytics/AnalyticsManager.ts
 * Bambeh Marketplace � Analytics Manager + singleton
 * � 2026 Bambeh Marketplace. All rights reserved.
 */

import { logger } from "@/utils/logger";

export type AnalyticsEventName =
  | "page_view" | "item_view" | "item_click" | "search"
  | "add_to_cart" | "remove_from_cart" | "begin_checkout" | "purchase"
  | "sign_up" | "login" | "logout" | "vendor_register"
  | "listing_create" | "listing_update" | "listing_delete"
  | "message_send" | "offer_made" | "subscription_start"
  | "subscription_cancel" | "error" | "feature_use";

export interface AnalyticsEvent {
  name: AnalyticsEventName | string;
  properties?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
  timestamp?: string;
}

export interface AnalyticsProvider {
  name: string;
  isEnabled: boolean;
  track(event: AnalyticsEvent): void;
  identify(userId: string, traits?: Record<string, unknown>): void;
  page(path: string, properties?: Record<string, unknown>): void;
  reset(): void;
}

// --- Manager Class ------------------------------------------------------------
class AnalyticsManagerClass {
  private providers: AnalyticsProvider[] = [];
  private eventQueue: AnalyticsEvent[] = [];
  private initialized = false;
  private currentUserId: string | null = null;
  private sessionId: string = this.generateSessionId();

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  }

  initialize(enabledProviders: AnalyticsProvider[] = []): void {
    if (this.initialized) return;
    for (const provider of enabledProviders) {
      if (provider.isEnabled) {
        this.providers.push(provider);
        logger.log(`[Analytics] Provider registered: ${provider.name}`);
      }
    }
    for (const event of this.eventQueue) {
      this.dispatchToProviders(event);
    }
    this.eventQueue.length = 0;
    this.initialized = true;
    logger.log(`[Analytics] Manager initialized with ${this.providers.length} provider(s)`);
  }

  private dispatchToProviders(event: AnalyticsEvent): void {
    for (const provider of this.providers) {
      try {
        provider.track(event);
      } catch (err) {
        logger.warn(`[Analytics] Provider "${provider.name}" track failed:`, err);
      }
    }
  }

  track(name: AnalyticsEventName | string, properties: Record<string, unknown> = {}): void {
    const event: AnalyticsEvent = {
      name,
      properties: { ...properties, platform: "android", app_version: import.meta.env.VITE_APP_VERSION ?? "1.0.0" },
      userId: this.currentUserId ?? undefined,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
    };
    if (!this.initialized) { this.eventQueue.push(event); return; }
    this.dispatchToProviders(event);
  }

  trackPageView(path: string, properties: Record<string, unknown> = {}): void {
    for (const provider of this.providers) {
      try { provider.page(path, { ...properties, userId: this.currentUserId ?? undefined, sessionId: this.sessionId }); }
      catch (err) { logger.warn(`[Analytics] Provider "${provider.name}" page failed:`, err); }
    }
    this.track("page_view", { path, ...properties });
  }

  identify(userId: string, traits: Record<string, unknown> = {}): void {
    this.currentUserId = userId;
    for (const provider of this.providers) {
      try { provider.identify(userId, traits); }
      catch (err) { logger.warn(`[Analytics] Provider "${provider.name}" identify failed:`, err); }
    }
  }

  reset(): void {
    this.currentUserId = null;
    this.sessionId = this.generateSessionId();
    for (const provider of this.providers) {
      try { provider.reset(); }
      catch (err) { logger.warn(`[Analytics] Provider "${provider.name}" reset failed:`, err); }
    }
  }

  trackError(error: Error | unknown, context = "unknown"): void {
    const message = error instanceof Error ? error.message : String(error);
    this.track("error", { error_message: message, context });
  }

  trackFeatureUse(featureName: string, properties: Record<string, unknown> = {}): void {
    this.track("feature_use", { feature: featureName, ...properties });
  }

  getCurrentSessionId(): string { return this.sessionId; }
  getCurrentUserId(): string | null { return this.currentUserId; }
}

// --- Singleton instance expected by useAnalytics.ts --------------------------
export const analyticsManager = new AnalyticsManagerClass();

// --- Standalone function aliases (used by AnalyticsInit.ts) ------------------
export function initializeAnalyticsManager(providers: AnalyticsProvider[] = []): void {
  analyticsManager.initialize(providers);
}

export function track(name: AnalyticsEventName | string, properties: Record<string, unknown> = {}): void {
  analyticsManager.track(name, properties);
}

export function trackPageView(path: string, properties: Record<string, unknown> = {}): void {
  analyticsManager.trackPageView(path, properties);
}

export function identify(userId: string, traits: Record<string, unknown> = {}): void {
  analyticsManager.identify(userId, traits);
}

export function resetAnalytics(): void {
  analyticsManager.reset();
}

export function trackError(error: Error | unknown, context = "unknown"): void {
  analyticsManager.trackError(error, context);
}

export function trackFeatureUse(featureName: string, properties: Record<string, unknown> = {}): void {
  analyticsManager.trackFeatureUse(featureName, properties);
}

export function trackItemView(itemId: string, itemType: string, properties: Record<string, unknown> = {}): void {
  analyticsManager.track("item_view", { item_id: itemId, item_type: itemType, ...properties });
}

export function trackSearch(query: string, category: string, resultCount: number): void {
  analyticsManager.track("search", { query, category, result_count: resultCount });
}

export function trackPurchase(orderId: string, amountXAF: number, items: Array<{ id: string; title: string; priceXAF: number }>): void {
  analyticsManager.track("purchase", { order_id: orderId, amount_xaf: amountXAF, items, currency: "XAF" });
}

export function getCurrentSessionId(): string { return analyticsManager.getCurrentSessionId(); }
export function getCurrentUserId(): string | null { return analyticsManager.getCurrentUserId(); }

