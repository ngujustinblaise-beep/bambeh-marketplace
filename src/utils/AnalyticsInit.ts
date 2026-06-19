/**
 * src/utils/AnalyticsInit.ts
 * Bambeh Marketplace â€” Analytics Bootstrap
 * Â© 2026 Bambeh Marketplace. All rights reserved.
 */

import { logger } from "@/utils/logger";
import { initializeAnalyticsManager } from "@/utils/analytics/AnalyticsManager";
import { createMixpanelProvider } from "@/utils/analytics/MixpanelManager";

let analyticsInitialized = false;

// â”€â”€â”€ Initialize All Analytics â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function initializeAnalytics(): Promise<void> {
  if (analyticsInitialized) return;

  try {
    const providers = [];

    // Mixpanel â€” only in production or when token is configured
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
    // Non-fatal â€” app continues without analytics
  }
}

// â”€â”€â”€ Check if Initialized â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function isAnalyticsReady(): boolean {
  return analyticsInitialized;
}

// â”€â”€â”€ Reset (for testing) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function resetAnalyticsInit(): void {
  analyticsInitialized = false;
}
