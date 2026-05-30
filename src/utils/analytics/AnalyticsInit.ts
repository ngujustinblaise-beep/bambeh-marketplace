import { supabase } from "@/lib/supabase";

export interface AnalyticsConfig {
  enabled: boolean;
  trackPageViews: boolean;
  trackUserEvents: boolean;
  trackErrors: boolean;
  debugMode: boolean;
}

const defaultConfig: AnalyticsConfig = {
  enabled: true,
  trackPageViews: true,
  trackUserEvents: true,
  trackErrors: true,
  debugMode: import.meta.env.DEV,
};

let analyticsConfig: AnalyticsConfig = { ...defaultConfig };
let isInitialized = false;

function debugLog(message: string, data?: unknown): void {
  if (analyticsConfig.debugMode) {
    console.log(`[Analytics] ${message}`, data ?? '');
  }
}

function setupPageViewTracking(): void {
  const originalPushState = history.pushState.bind(history);
  history.pushState = function (...args) {
    originalPushState(...args);
    trackPageView(window.location.pathname);
  };
  window.addEventListener('popstate', () => {
    trackPageView(window.location.pathname);
  });
  trackPageView(window.location.pathname);
}

function setupErrorTracking(): void {
  window.addEventListener('error', event => {
    trackError({
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });
  window.addEventListener('unhandledrejection', event => {
    trackError({ message: String(event.reason), type: 'unhandledrejection' });
  });
}

// --- Core init function -------------------------------------------------------

export async function initAnalytics(config?: Partial<AnalyticsConfig>): Promise<void> {
  if (isInitialized) return;
  try {
    if (config) {
      analyticsConfig = { ...defaultConfig, ...config };
    }
    if (!analyticsConfig.enabled) {
      debugLog('Analytics disabled — skipping init');
      return;
    }
    debugLog('Initializing analytics...');
    if (analyticsConfig.trackPageViews) setupPageViewTracking();
    if (analyticsConfig.trackErrors) setupErrorTracking();
    isInitialized = true;
    debugLog('Analytics initialized ?');
  } catch (error) {
    console.error('? Analytics initialization error:', error);
  }
}

// --- Alias — App.tsx imports { initializeAnalytics } -------------------------
export const initializeAnalytics = initAnalytics;

// --- Tracking helpers ---------------------------------------------------------

export async function trackPageView(path: string): Promise<void> {
  if (!analyticsConfig.enabled || !analyticsConfig.trackPageViews) return;
  try {
    debugLog('Page view:', path);
    const { data: { session } } = await supabase.auth.getSession();
    await supabase.from('analytics_events').insert({
      event_type: 'page_view',
      event_data: { path },
      user_id: session?.user?.id ?? null,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    debugLog('Page view tracking failed:', e);
  }
}

export async function trackEvent(
  eventName: string,
  eventData?: Record<string, unknown>
): Promise<void> {
  if (!analyticsConfig.enabled || !analyticsConfig.trackUserEvents) return;
  try {
    debugLog(`Event: ${eventName}`, eventData);
    const { data: { session } } = await supabase.auth.getSession();
    await supabase.from('analytics_events').insert({
      event_type: eventName,
      event_data: eventData ?? {},
      user_id: session?.user?.id ?? null,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    debugLog('Event tracking failed:', e);
  }
}

export async function trackError(errorData: Record<string, unknown>): Promise<void> {
  if (!analyticsConfig.enabled || !analyticsConfig.trackErrors) return;
  try {
    debugLog('Error tracked:', errorData);
    const { data: { session } } = await supabase.auth.getSession();
    await supabase.from('analytics_events').insert({
      event_type: 'error',
      event_data: errorData,
      user_id: session?.user?.id ?? null,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    debugLog('Error tracking failed:', e);
  }
}

export async function trackVendorEvent(
  vendorId: string,
  eventName: string,
  eventData?: Record<string, unknown>
): Promise<void> {
  if (!analyticsConfig.enabled) return;
  try {
    await supabase.from('analytics_events').insert({
      event_type: `vendor_${eventName}`,
      event_data: { vendor_id: vendorId, ...(eventData ?? {}) },
      user_id: vendorId,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    debugLog('Vendor event tracking failed:', e);
  }
}

export function getAnalyticsConfig(): AnalyticsConfig {
  return { ...analyticsConfig };
}

export function isAnalyticsReady(): boolean {
  return isInitialized;
}

// --- Default export -----------------------------------------------------------
const analyticsModule = {
  initAnalytics,
  initializeAnalytics,
  trackPageView,
  trackEvent,
  trackError,
  trackVendorEvent,
  getAnalyticsConfig,
  isAnalyticsReady,
};

export default analyticsModule;
