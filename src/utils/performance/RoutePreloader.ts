/**
 * src/utils/performance/RoutePreloader.ts
 * Bambeh Marketplace — Route Preloading for Low-Latency Navigation
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import { logger } from "@/utils/logger";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface RouteModule {
  path: string;
  loader: () => Promise<unknown>;
  priority: "high" | "medium" | "low";
}

export interface PreloadResult {
  path: string;
  success: boolean;
  durationMs: number;
  error?: string;
}

// ─── Internal State ───────────────────────────────────────────────────────────
const preloaded = new Set<string>();
const preloadQueue: RouteModule[] = [];
let isRunning = false;

// ─── Preload a Single Route ───────────────────────────────────────────────────
export async function preloadRoute(route: RouteModule): Promise<PreloadResult> {
  if (preloaded.has(route.path)) {
    return { path: route.path, success: true, durationMs: 0 };
  }

  const start = performance.now();

  try {
    await route.loader();
    preloaded.add(route.path);
    const durationMs = performance.now() - start;

    logger.log(`[RoutePreloader] Preloaded: ${route.path} (${durationMs.toFixed(0)}ms)`);

    return { path: route.path, success: true, durationMs };
  } catch (err) {
    const durationMs = performance.now() - start;
    const error = err instanceof Error ? err.message : String(err);

    logger.warn(`[RoutePreloader] Failed: ${route.path} — ${error}`);

    return { path: route.path, success: false, durationMs, error };
  }
}

// ─── Queue-Based Preloading ───────────────────────────────────────────────────
export function queueRoutePreload(route: RouteModule): void {
  if (preloaded.has(route.path)) return;

  const exists = preloadQueue.some((r) => r.path === route.path);
  if (!exists) {
    preloadQueue.push(route);
  }
}

// ─── Process Queue ────────────────────────────────────────────────────────────
async function processQueue(): Promise<void> {
  if (isRunning || preloadQueue.length === 0) return;
  isRunning = true;

  // Sort by priority
  preloadQueue.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });

  while (preloadQueue.length > 0) {
    const route = preloadQueue.shift();
    if (!route) continue;
    await preloadRoute(route);

    // Yield to main thread between preloads
    await new Promise<void>((resolve) => setTimeout(resolve, 50));
  }

  isRunning = false;
}

// ─── Start Idle Preloading ────────────────────────────────────────────────────
export function startIdlePreloading(routes: RouteModule[]): void {
  for (const route of routes) {
    queueRoutePreload(route);
  }

  const trigger = () => {
    if ("requestIdleCallback" in window) {
      (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => void })
        .requestIdleCallback(() => processQueue(), { timeout: 3000 });
    } else {
      setTimeout(() => processQueue(), 500);
    }
  };

  // Start after initial paint
  if (document.readyState === "complete") {
    trigger();
  } else {
    window.addEventListener("load", trigger, { once: true });
  }
}

// ─── Preload on Hover ─────────────────────────────────────────────────────────
export function preloadOnHover(
  element: HTMLElement,
  loader: () => Promise<unknown>,
  path: string
): () => void {
  const handler = () => {
    if (!preloaded.has(path)) {
      preloadRoute({ path, loader, priority: "high" });
    }
  };

  element.addEventListener("mouseenter", handler, { passive: true });
  element.addEventListener("touchstart", handler, { passive: true });

  return () => {
    element.removeEventListener("mouseenter", handler);
    element.removeEventListener("touchstart", handler);
  };
}

// ─── Check if Preloaded ───────────────────────────────────────────────────────
export function isRoutePreloaded(path: string): boolean {
  return preloaded.has(path);
}

// ─── Clear Preload Cache ──────────────────────────────────────────────────────
export function clearPreloadCache(): void {
  preloaded.clear();
  preloadQueue.length = 0;
}

// ─── Bambeh Core Routes ───────────────────────────────────────────────────────
export const BAMBEH_CORE_ROUTES: RouteModule[] = [
  {
    path: "/",
    loader: () => import("@/pages/Home"),
    priority: "high",
  },
  {
    path: "/marketplace",
    loader: () => import("@/pages/Marketplace"),
    priority: "high",
  },
  {
    path: "/jobs",
    loader: () => import("@/pages/Jobs"),
    priority: "high",
  },
  {
    path: "/services",
    loader: () => import("@/pages/Services"),
    priority: "medium",
  },
  {
    path: "/profile",
    loader: () => import("@/pages/Profile"),
    priority: "medium",
  },
  {
    path: "/cart",
    loader: () => import("@/pages/Cart"),
    priority: "low",
  },
];
