/**
 * src/utils/analytics/MixpanelManager.ts
 * Bambeh Marketplace — Mixpanel Analytics + singleton
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import { logger } from "@/utils/logger";
import type { AnalyticsProvider, AnalyticsEvent } from "./AnalyticsManager";

declare global {
  interface Window {
    mixpanel?: {
      init(token: string, config?: Record<string, unknown>): void;
      track(event: string, properties?: Record<string, unknown>): void;
      identify(id: string): void;
      people: { set(properties: Record<string, unknown>): void };
      register(properties: Record<string, unknown>): void;
      reset(): void;
    };
  }
}

interface MixpanelConfig {
  token: string;
  debug?: boolean;
  trackPageViews?: boolean;
}

class MixpanelManagerClass implements AnalyticsProvider {
  public name = "Mixpanel";
  public isEnabled: boolean;
  private config: MixpanelConfig;
  private isInitialized = false;

  constructor(config: MixpanelConfig) {
    this.config = config;
    this.isEnabled = Boolean(config.token);
  }

  private ensureInitialized(): boolean {
    if (this.isInitialized) return true;
    if (!this.isEnabled || !window.mixpanel) return false;
    try {
      window.mixpanel.init(this.config.token, {
        debug: this.config.debug ?? import.meta.env.DEV,
        persistence: "localStorage",
        batch_requests: true,
      });
      window.mixpanel.register({
        platform: "android",
        app: "bambeh",
        app_version: import.meta.env.VITE_APP_VERSION ?? "1.0.0",
        country: "",
      });
      this.isInitialized = true;
      return true;
    } catch (err) {
      logger.warn("[Mixpanel] Initialization failed:", err);
      return false;
    }
  }

  track(event: AnalyticsEvent): void {
    if (!this.ensureInitialized()) return;
    try { window.mixpanel?.track(event.name, { ...event.properties, session_id: event.sessionId }); }
    catch (err) { logger.warn("[Mixpanel] track failed:", err); }
  }

  identify(userId: string, traits: Record<string, unknown> = {}): void {
    if (!this.ensureInitialized()) return;
    try {
      window.mixpanel?.identify(userId);
      if (Object.keys(traits).length > 0) {
        window.mixpanel?.people.set({ $user_id: userId, ...traits, last_seen: new Date().toISOString() });
      }
    } catch (err) { logger.warn("[Mixpanel] identify failed:", err); }
  }

  page(path: string, properties: Record<string, unknown> = {}): void {
    if (!this.config.trackPageViews || !this.ensureInitialized()) return;
    try { window.mixpanel?.track("page_view", { path, ...properties }); }
    catch (err) { logger.warn("[Mixpanel] page failed:", err); }
  }

  reset(): void {
    if (!this.isInitialized) return;
    try { window.mixpanel?.reset(); }
    catch (err) { logger.warn("[Mixpanel] reset failed:", err); }
  }
}

// ─── Singleton instance expected by useAnalytics.ts ──────────────────────────
export const mixpanelManager = new MixpanelManagerClass({
  token: import.meta.env.VITE_MIXPANEL_TOKEN ?? "",
  debug: import.meta.env.DEV,
  trackPageViews: true,
});

// ─── Factory for AnalyticsInit.ts ─────────────────────────────────────────────
export function createMixpanelProvider(config?: Partial<MixpanelConfig>): AnalyticsProvider {
  return new MixpanelManagerClass({
    token: import.meta.env.VITE_MIXPANEL_TOKEN ?? "",
    debug: import.meta.env.DEV,
    trackPageViews: true,
    ...config,
  });
}

export function isMixpanelAvailable(): boolean {
  return Boolean(window.mixpanel && typeof window.mixpanel.track === "function");
}

