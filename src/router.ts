/**
 * ---------------------------------------------------------------------------
 * BAMBEH ROUTER — Singleton Navigation Module
 * ---------------------------------------------------------------------------
 *
 * Why this file exists:
 * React Router's useNavigate() hook only works inside React components.
 * Services, utilities, and non-component code (e.g. ActionButtons dynamic
 * imports) need a way to navigate programmatically from anywhere.
 *
 * This module exposes a singleton `navigate` function that is wired up
 * once by NavigationBridge in App.tsx via setNavigator(), then importable
 * anywhere in the codebase.
 *
 * Wiring is handled in App.tsx — NavigationBridge calls both
 * NavigationService.register(nav) AND setNavigator(nav) on mount.
 *
 * Usage — inside a React component:
 *   import { useNavigate } from 'react-router-dom';   ? always prefer this
 *
 * Usage — outside a React component (services, utils, dynamic imports):
 *   import navigate from '@/router';
 *   navigate('/home');
 *
 *   or named:
 *   import { navigate, goToListing, goToChat } from '@/router';
 *
 * FILE: src/router.ts
 * © 2026 BAMBEH SARL
 * ---------------------------------------------------------------------------
 */

import type { NavigateFunction, NavigateOptions } from 'react-router-dom';

// -- Internal singleton reference -------------------------------------------
let _navigator: NavigateFunction | null = null;

/**
 * Called once by NavigationBridge (App.tsx) to wire the real React Router
 * navigate function into this singleton. Do not call this directly — it is
 * handled automatically by the bridge component.
 */
export function setNavigator(nav: NavigateFunction): void {
  _navigator = nav;
}

/**
 * Returns the current navigator if wired, or null if called before mount.
 */
export function getNavigator(): NavigateFunction | null {
  return _navigator;
}

/**
 * Programmatic navigation — safe to call from anywhere in the app.
 *
 * Falls back to window.location if the React Router navigator has not yet
 * been registered (e.g. very early boot), so navigation never silently fails.
 *
 * @param to      - Path string (e.g. '/listings/123') or delta number (-1 = back)
 * @param options - Optional NavigateOptions (replace, state, relative, etc.)
 */
export function navigate(
  to: string | number,
  options?: NavigateOptions
): void {
  if (_navigator) {
    if (typeof to === 'number') {
      _navigator(to);
    } else {
      _navigator(to, options);
    }
    return;
  }

  // Fallback: navigator not yet registered
  if (typeof to === 'string') {
    console.warn(
      '[Bambeh Router] navigate() called before setNavigator() was wired. ' +
      `Falling back to window.location for: ${to}`
    );
    if (options?.replace) {
      window.location.replace(to);
    } else {
      window.location.href = to;
    }
  } else {
    console.warn(
      '[Bambeh Router] navigate() called with a delta before setNavigator() ' +
      'was wired. Cannot navigate by delta without React Router. Ignoring.'
    );
  }
}

// -- Convenience helpers ----------------------------------------------------

/** Navigate to a route, replacing the current history entry. */
export function replace(to: string, options?: Omit<NavigateOptions, 'replace'>): void {
  navigate(to, { ...options, replace: true });
}

/** Go back one step in browser history. */
export function goBack(): void {
  navigate(-1);
}

/** Go forward one step in browser history. */
export function goForward(): void {
  navigate(1);
}

/** Navigate to a listing detail page. */
export function goToListing(listingId: string): void {
  navigate(`/marketplace/${listingId}`);
}

/** Navigate to a job detail page. */
export function goToJob(jobId: string): void {
  navigate(`/jobs/${jobId}`);
}

/** Navigate to a service detail page. */
export function goToService(serviceId: string): void {
  navigate(`/services/${serviceId}`);
}

/** Navigate to a user profile page. */
export function goToProfile(userId?: string): void {
  navigate(userId ? `/profile/${userId}` : '/profile');
}

/**
 * Navigate to the chat/messages page, optionally opening a specific room.
 * @param roomId - Optional chat room ID to open directly
 */
export function goToChat(roomId?: string): void {
  navigate(roomId ? `/chat?room=${roomId}` : '/chat');
}

/**
 * Navigate to the login page, preserving the current path as a redirect target.
 * @param redirectTo - Path to redirect to after successful login
 */
export function goToLogin(redirectTo?: string): void {
  const redirect = redirectTo ?? window.location.hash.slice(1) ?? '/';
  navigate(`/login?redirect=${encodeURIComponent(redirect)}`);
}

/** Navigate to the vendor dashboard. */
export function goToVendorDashboard(): void {
  navigate('/vendor/dashboard');
}

/** Navigate to the subscription plans page. */
export function goToSubscription(): void {
  navigate('/subscription');
}

// -- Default export ---------------------------------------------------------
// ActionButtons.tsx does:
//   const { default: navigate } = await import('@/router')
// The default export must therefore be the navigate function itself.
export default navigate;



export { router };

