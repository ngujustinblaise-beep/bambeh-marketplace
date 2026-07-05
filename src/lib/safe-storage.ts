/**
 * src/lib/safe-storage.ts  -  Bambeh SARL
 *
 * WHY THIS EXISTS
 * A single localStorage write that exceeds the browser quota was throwing
 * QuotaExceededError during app startup, which the error boundary caught and
 * turned into a full-page "Please refresh or contact support" crash. A storage
 * write failing must NEVER take down a marketplace.
 *
 * WHAT IT DOES
 * Patches localStorage.setItem (and sessionStorage.setItem) ONE time, at the
 * very top of the app, so that:
 *   1. A failed write NEVER throws - the app keeps running (fail open).
 *   2. On QuotaExceededError it self-heals: it evicts known non-critical,
 *      re-buildable keys (caches, chat widget state, analytics buffers) and
 *      retries the write once. Auth + language + onboarding keys are protected
 *      and never evicted.
 *   3. Every failure is logged to the console so the real culprit is visible
 *      in DevTools without crashing anything.
 *
 * This is imported on the FIRST line of App.tsx, before any other module runs.
 */

const PROTECTED_PREFIXES = [
  "bambeh-auth",        // supabase session (storageKey we set)
  "sb-",                // supabase default session keys
  "Bambeh_language",    // onboarding language
  "Bambeh_terms",       // onboarding terms
  "Bambeh_welcome",     // onboarding welcome
  "bambeh_cart",        // the user's cart
];

// Keys matching these are safe to drop when we need to reclaim space.
// They are caches or UI state the app can rebuild on its own.
const EVICTABLE_HINTS = [
  "cache",
  "analytics",
  "chat_position",
  "chat-position",
  "_buffer",
  "_log",
  "log_",
  "tmp",
  "temp",
  "recent",
  "history",
  "seen",
  "views",
];

function isProtected(key: string): boolean {
  return PROTECTED_PREFIXES.some((p) => key.startsWith(p));
}

function looksEvictable(key: string): boolean {
  const k = key.toLowerCase();
  return EVICTABLE_HINTS.some((h) => k.includes(h));
}

function reclaimSpace(store: Storage, bytesNeeded: number): void {
  // Pass 1: evict clearly non-critical, re-buildable keys.
  const candidates: string[] = [];
  for (let i = 0; i < store.length; i++) {
    const key = store.key(i);
    if (key && !isProtected(key) && looksEvictable(key)) candidates.push(key);
  }
  for (const key of candidates) {
    try { store.removeItem(key); } catch { /* ignore */ }
  }

  // Pass 2: if still tight, evict ANY non-protected key (largest first).
  let used = 0;
  const sizes: Array<{ key: string; size: number }> = [];
  for (let i = 0; i < store.length; i++) {
    const key = store.key(i);
    if (!key || isProtected(key)) continue;
    const size = (store.getItem(key) || "").length;
    used += size;
    sizes.push({ key, size });
  }
  sizes.sort((a, b) => b.size - a.size);
  for (const { key } of sizes) {
    if (bytesNeeded <= 0) break;
    try {
      const freed = (store.getItem(key) || "").length;
      store.removeItem(key);
      bytesNeeded -= freed;
    } catch { /* ignore */ }
  }
}

function harden(store: Storage, label: string): void {
  const original = store.setItem.bind(store);

  store.setItem = function safeSetItem(key: string, value: string): void {
    try {
      original(key, value);
    } catch (err) {
      const name = (err as { name?: string })?.name || "";
      const isQuota =
        name === "QuotaExceededError" ||
        name === "NS_ERROR_DOM_QUOTA_REACHED" ||
        /quota/i.test(String((err as Error)?.message));

      if (!isQuota) {
        // Non-quota failure (e.g. storage disabled): swallow, never crash.
        console.warn(`[safe-storage] ${label}.setItem failed for "${key}" (ignored):`, err);
        return;
      }

      console.warn(
        `[safe-storage] ${label} quota exceeded writing "${key}" ` +
        `(${(value?.length || 0)} bytes). Reclaiming space and retrying once.`
      );

      // Self-heal: reclaim space, then retry the write exactly once.
      try {
        reclaimSpace(store, value?.length || 0);
        original(key, value);
        console.info(`[safe-storage] retry succeeded for "${key}".`);
      } catch (err2) {
        // Give up on THIS write only. The app keeps running.
        console.warn(
          `[safe-storage] retry failed for "${key}"; dropping this write. App continues.`,
          err2
        );
      }
    }
  };
}

// Patch once, guarding against double-application (HMR / re-import).
declare global {
  interface Window { __bambehStorageHardened?: boolean }
}

if (typeof window !== "undefined" && !window.__bambehStorageHardened) {
  try { harden(window.localStorage, "localStorage"); } catch { /* ignore */ }
  try { harden(window.sessionStorage, "sessionStorage"); } catch { /* ignore */ }
  window.__bambehStorageHardened = true;
  console.info("[safe-storage] storage hardened - quota errors can no longer crash the app.");
}

export {};
