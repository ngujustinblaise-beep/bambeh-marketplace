// @ts-nocheck
import { useCallback } from "react";

export const useAnalytics = () => {
  const trackEvent = useCallback((name: string, props?: Record<string, unknown>): void => {
    if (import.meta.env.DEV) console.debug("[Analytics]", name, props);
  }, []);

  const trackPageView    = useCallback((page: string): void       => trackEvent("page_view",  { page }), [trackEvent]);
  const trackNavigation  = useCallback((from: string, to: string): void => trackEvent("navigation", { from, to }), [trackEvent]);
  const trackPurchase    = useCallback((data: Record<string, unknown>): void => trackEvent("purchase", data), [trackEvent]);
  const addBreadcrumb    = useCallback((crumb: string): void      => { if (import.meta.env.DEV) console.debug("[BC]", crumb); }, []);
  const identifyUser     = useCallback((userId: string, traits?: Record<string, unknown>): void => trackEvent("identify", { userId, ...traits }), [trackEvent]);
  const trackError       = useCallback((error: Error, ctx?: Record<string, unknown>): void => console.error("[Analytics] Error:", error, ctx), []);
  const captureError     = trackError;
  const setUserProperties = useCallback((props: Record<string, unknown>): void => trackEvent("user_properties", props), [trackEvent]);

  // Stubbed sub-trackers — components may destructure these
  const ga       = { trackEvent };
  const mixpanel = { trackEvent };
  const sentry   = { captureException: trackError };

  return {
    trackEvent, trackPageView, trackNavigation, trackPurchase,
    addBreadcrumb, identifyUser, trackError, captureError,
    setUserProperties, ga, mixpanel, sentry,
  };
};
