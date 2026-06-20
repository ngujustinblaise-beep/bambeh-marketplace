/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * src/services/analyticsService.ts
 * Analytics Service — Bambeh Marketplace
 *
 * FIX: analytics_events table missing → caused 404 POST errors on
 * EVERY page load, flooding the console and adding network overhead.
 *
 * Solution:
 *   1. Run the SQL migration (see supabase/migrations/) to create the table.
 *   2. This service verifies the table exists on first call.
 *   3. If the table is absent, analytics silently degrades — zero errors.
 *   4. Once the table exists, full tracking resumes automatically.
 *
 * © 2026 BAMBEH SARL / Bambeh. All rights reserved.
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */

import { supabase } from '@/lib/supabase';

// ── Configuration ─────────────────────────────────────────────────────────────

interface AnalyticsConfig {
  enabled:          boolean;
  trackPageViews:   boolean;
  trackUserEvents:  boolean;
  trackErrors:      boolean;
  debugMode:        boolean;
  /** Minimum ms between identical events (debounce duplicate page views) */
  debounceMs:       number;
}

const defaultConfig: AnalyticsConfig = {
  enabled:         true,
  trackPageViews:  true,
  trackUserEvents: true,
  trackErrors:     true,
  debugMode:       import.meta.env.DEV,
  debounceMs:      500,
};

// ── Internal state ────────────────────────────────────────────────────────────

let analyticsConfig         = { ...defaultConfig };
let isInitialized           = false;
let tableVerified: boolean | null = null; // null = not checked, true/false = result
let lastEventTime           = 0;
let lastPath                = '';

// ── Table existence check ─────────────────────────────────────────────────────

/**
 * Verify the analytics_events table exists before attempting inserts.
 * Result is cached so we only check once per session.
 */
async function checkTableExists(): Promise<boolean> {
  if (tableVerified !== null) return tableVerified;

  try {
    // Use a limit-0 select — minimal overhead, fails gracefully if table absent
    const { error } = await supabase
      .from('analytics_events')
      .select('id', { count: 'exact', head: true })
      .limit(0);

    if (error) {
      // Table does not exist or RLS blocks access — disable gracefully
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.warn(
          '[Analytics] Table "analytics_events" not found.\n' +
          'Run: supabase/migrations/20260324_analytics_events.sql\n' +
          'Tracking disabled until table is created.'
        );
      } else {
        console.warn('[Analytics] Table check error:', error.message);
      }
      tableVerified = false;
      return false;
    }

    tableVerified = true;
    debugLog('Table analytics_events verified ✅');
    return true;
  } catch (err) {
    tableVerified = false;
    console.warn('[Analytics] Table check exception:', err);
    return false;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function debugLog(message: string, data?: unknown): void {
  if (analyticsConfig.debugMode) {
    console.log(`[Analytics] ${message}`, data ?? '');
  }
}

async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
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
  // Track initial page
  trackPageView(window.location.pathname);
}

function setupErrorTracking(): void {
  window.addEventListener('error', event => {
    trackError({
      message:  event.message,
      filename: event.filename,
      lineno:   event.lineno,
      colno:    event.colno,
    });
  });
  window.addEventListener('unhandledrejection', event => {
    trackError({ message: String(event.reason), type: 'unhandledrejection' });
  });
}

// ── Public API ────────────────────────────────────────────────────────────────

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

    // Check table before setting up listeners (avoids silent 404s)
    await checkTableExists();

    if (analyticsConfig.trackPageViews) setupPageViewTracking();
    if (analyticsConfig.trackErrors)    setupErrorTracking();

    isInitialized = true;
    debugLog('Analytics initialized ✅');
  } catch (error) {
    console.error('[Analytics] Initialization error:', error);
    // Never throw — analytics must never break the app
  }
}

// Alias for backwards-compat — App.tsx imports { initializeAnalytics }
export const initializeAnalytics = initAnalytics;

export async function trackPageView(path: string): Promise<void> {
  if (!analyticsConfig.enabled || !analyticsConfig.trackPageViews) return;

  // Debounce — skip if same path within debounceMs
  const now = Date.now();
  if (path === lastPath && now - lastEventTime < analyticsConfig.debounceMs) return;
  lastPath      = path;
  lastEventTime = now;

  // Silently skip if table not ready
  if (!(await checkTableExists())) return;

  try {
    debugLog('Page view:', path);
    const userId = await getCurrentUserId();
    await supabase.from('analytics_events').insert({
      event_type: 'page_view',
      event_data: { path },
      user_id:    userId,
      timestamp:  new Date().toISOString(),
    });
  } catch (err) {
    debugLog('trackPageView failed (non-fatal):', err);
  }
}

export async function trackEvent(
  eventName: string,
  eventData?: Record<string, unknown>
): Promise<void> {
  if (!analyticsConfig.enabled || !analyticsConfig.trackUserEvents) return;
  if (!(await checkTableExists())) return;

  try {
    debugLog(`Event: ${eventName}`, eventData);
    const userId = await getCurrentUserId();
    await supabase.from('analytics_events').insert({
      event_type: eventName,
      event_data: eventData ?? {},
      user_id:    userId,
      timestamp:  new Date().toISOString(),
    });
  } catch (err) {
    debugLog('trackEvent failed (non-fatal):', err);
  }
}

export async function trackError(errorData: Record<string, unknown>): Promise<void> {
  if (!analyticsConfig.enabled || !analyticsConfig.trackErrors) return;
  if (!(await checkTableExists())) return;

  try {
    debugLog('Error tracked:', errorData);
    const userId = await getCurrentUserId();
    await supabase.from('analytics_events').insert({
      event_type: 'error',
      event_data: errorData,
      user_id:    userId,
      timestamp:  new Date().toISOString(),
    });
  } catch (err) {
    debugLog('trackError failed (non-fatal):', err);
  }
}

export async function trackVendorAction(
  action: string,
  vendorId: string,
  data?: Record<string, unknown>
): Promise<void> {
  return trackEvent('vendor_action', { action, vendorId, ...data });
}

export async function trackPurchase(
  orderId:  string,
  amount:   number,
  currency: string = 'XAF'
): Promise<void> {
  return trackEvent('purchase', { orderId, amount, currency });
}

/**
 * Force re-check of table existence.
 * Call this after running the SQL migration while the app is open.
 */
export function resetTableCache(): void {
  tableVerified = null;
  isInitialized = false;
}
