/**
 * src/utils/AnalyticsInit.ts
 * Bambeh Marketplace — Analytics Bootstrap
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import { logger } from "@/utils/logger";
import { initializeAnalyticsManager } from "@/utils/analytics/AnalyticsManager";
import { createMixpanelProvider } from "@/utils/analytics/MixpanelManager";

let analyticsInitialized = false;

// ─── Initialize All Analytics ─────────────────────────────────────────────────
export async function initializeAnalytics(): Promise<void> {
  if (analyticsInitialized) return;

  try {
    const providers = [];

    // Mixpanel — only in production or when token is configured
    const mixpanelToken = import.meta.env.VITE_MIXPANEL_TOKEN;
    if (mixpanelToken) {
      try {
        const mixpanel = createMixpanelProvider({ token: mixpanelToken });
        providers.push(mixpanel);
      } catch (err) {
        logger.warn("[Analytics] Failed to create Mixpanel provider:", err);
      }
    }

    initializeAnalyticsManager(providers);

    analyticsInitialized = true;
    logger.log("[Analytics] Initialized successfully");
  } catch (err) {
    logger.warn("[Analytics] Initialization error:", err);
    // Non-fatal — app continues without analytics
  }
}

// ─── Check if Initialized ────────────────────────────────────────────────────
export function isAnalyticsReady(): boolean {
  return analyticsInitialized;
}

// ─── Reset (for testing) ──────────────────────────────────────────────────────
export function resetAnalyticsInit(): void {
  analyticsInitialized = false;
}

