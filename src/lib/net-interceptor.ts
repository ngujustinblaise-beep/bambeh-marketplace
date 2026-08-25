// BAMBEH_DEPLOY_TOKEN__NETINTERCEPTOR_FIX389_CLEAN
/**
 * src/lib/net-interceptor.ts - FIX389 (supersedes FIX386). The auth lane.
 *
 * ===================================================================
 * FIX389 - SIGN-IN GETS THE PIPE TO ITSELF.
 * ===================================================================
 *
 * A live console caught something that changes everything:
 *
 *     POST /auth/v1/token?grant_type=password  ERR_CONNECTION_RESET  200 (OK)
 *     POST /auth/v1/token?grant_type=password  ERR_CONNECTION_CLOSED 200 (OK)
 *
 * TWO HUNDRED OK, and then the connection died. Supabase authenticated the
 * user and issued the token. The headers arrived. The RESPONSE BODY was cut
 * off mid-transfer, so the browser never received the JWT and fetch() threw
 * "Failed to fetch". The user was signed in on the server and told they were
 * not.
 *
 * That is what a single HTTP/2 connection does when it is carrying too many
 * streams and one of them is killed. And the login page was firing
 * exchange_items, corporate_products, vendor_profiles, listings, notifications
 * and profiles AT THE SAME TIME as the sign-in.
 *
 * So FIX389 adds an AUTH LANE. Any request to /auth/v1/ - sign in, sign up,
 * token refresh, password reset - gets the connection to itself:
 *
 *   * every other Supabase request waits while an auth call is in flight
 *   * the auth call waits for the in-flight ones to drain first (capped at
 *     5 seconds so it can never hang)
 *   * normal concurrency drops from 4 to 3
 *
 * Signing in is the one request a user cannot work around. It gets priority.
 *
 * ===================================================================
 * WHAT WAS HERE BEFORE
 * ===================================================================
 * The entire file was:
 *
 *     export function initNetInterceptor(options = {}): void {
 *       if (initialized || options.enabled === false) return;
 *       initialized = true;
 *     }
 *
 * It set a flag and returned. App.tsx imports this module as though it
 * manages the network. It managed nothing. Every Supabase call in Bambeh went
 * out raw, unlimited, unretried and undeduplicated.
 *
 * ===================================================================
 * WHAT THAT COST
 * ===================================================================
 * A live console showed 3,295 errors on ONE page, and the failing request was
 * the same URL again and again:
 *
 *     GET /rest/v1/subscriptions?select=*&user_...   ERR_CONNECTION_CLOSED
 *     GET /rest/v1/subscriptions?select=*&user_...   ERR_CONNECTION_RESET
 *     ... thousands of times
 *
 * The cause is architectural: LocationLock renders INSIDE EVERY LISTING CARD,
 * and each one calls useSubscription() on its own. Fifty cards ask the
 * identical question fifty times. Re-renders and failures multiply it from
 * there. Ten sequential requests to this Supabase project succeed ten times
 * out of ten - it is only the volume that kills them.
 *
 * ===================================================================
 * WHAT THIS FILE NOW DOES
 * ===================================================================
 * It wraps window.fetch and, FOR SUPABASE REQUESTS ONLY:
 *
 *   1. DEDUPLICATES. Identical GETs already in flight share one request and
 *      one answer. Fifty cards asking the same question send ONE request.
 *
 *   2. MICRO-CACHES. An identical GET within 3 seconds is answered from the
 *      last response instead of going out again.
 *
 *   3. CAPS CONCURRENCY at 4. Everything else queues. This is the single
 *      biggest change: a queue of 4 completes; a burst of 40 collapses.
 *
 *   4. RETRIES, but only GET and HEAD. A dropped connection is retried up to
 *      three times with a growing pause.
 *      POST, PATCH, PUT and DELETE are NEVER retried - retrying a payment or
 *      an order would be far worse than failing it.
 *
 *   5. BREAKS RUNAWAY LOOPS. If one URL is asked more than 12 times in 10
 *      seconds, that is a bug, not traffic. We serve the last good answer if
 *      we have one, and refuse politely if we do not, instead of hammering
 *      Supabase until the connection dies.
 *
 * Requests to anywhere other than Supabase are passed through untouched.
 * HTTP error statuses are passed through unchanged - a 400 stays a 400, a 403
 * stays a 403. Only genuine network failures are retried.
 *
 * ===================================================================
 * HONEST LIMIT
 * ===================================================================
 * This is a shield, not a cure. It stops the bleeding for every request in
 * the app at once, including pages I have never seen. But the per-card
 * useSubscription() call is still wrong and should be lifted into one shared
 * provider. This buys the time to do that properly.
 *
 * Turn it off at any time:  localStorage.setItem('bambeh_net_off','1')
 * Watch it work:            __bambehNet()
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */

export type NetInterceptorOptions = {
  enabled?: boolean;
  onRequest?: (input: RequestInfo | URL, init?: RequestInit) => void;
  onResponse?: (response: Response) => void;
};

// -- Tuning ------------------------------------------------------------------

const HOST_MARKER     = ".supabase.co";
const MAX_CONCURRENT  = 3;      // FIX389 - simultaneous NON-AUTH Supabase requests
const AUTH_MARKER     = "/auth/v1/";
const RETRY_LIMIT     = 3;      // GET / HEAD only
const RETRY_BASE_MS   = 400;
const MICRO_CACHE_MS  = 3000;   // identical GET inside this window is reused
const CACHE_MAX       = 120;    // entries
const LOOP_WINDOW_MS  = 10000;
const LOOP_MAX_HITS   = 12;     // same URL more often than this = a bug

// -- State -------------------------------------------------------------------

let initialized = false;
let originalFetch: typeof fetch | null = null;

let active = 0;
const waiters: Array<() => void> = [];

// FIX389 - the auth lane. While an /auth/v1/ request is in flight, nothing
// else is allowed onto the connection.
let authBusy = false;
const authQueue: Array<() => void> = [];

const inFlight   = new Map<string, Promise<Response>>();
const microCache = new Map<string, { at: number; res: Response }>();
const recentHits = new Map<string, number[]>();

const stats = { passed: 0, deduped: 0, cached: 0, retried: 0, blocked: 0, failed: 0, authHeld: 0 };

// -- Helpers -----------------------------------------------------------------

function disabledByUser(): boolean {
  try {
    return localStorage.getItem("bambeh_net_off") === "1";
  } catch {
    return false;
  }
}

function urlOf(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (typeof URL !== "undefined" && input instanceof URL) return input.toString();
  try {
    return (input as Request).url || "";
  } catch {
    return "";
  }
}

function methodOf(input: RequestInfo | URL, init?: RequestInit): string {
  if (init && init.method) return String(init.method).toUpperCase();
  if (typeof input !== "string" && !(typeof URL !== "undefined" && input instanceof URL)) {
    try {
      return String((input as Request).method || "GET").toUpperCase();
    } catch {
      return "GET";
    }
  }
  return "GET";
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function acquireSlot(): Promise<void> {
  // FIX389 - also wait while the auth lane is held.
  while (authBusy || active >= MAX_CONCURRENT) {
    await new Promise<void>((resolve) => waiters.push(resolve));
  }
  active = active + 1;
}

function releaseSlot(): void {
  active = active > 0 ? active - 1 : 0;
  const next = waiters.shift();
  if (next) next();
}

/**
 * FIX389 - take the connection exclusively for an auth request.
 * Waits for any other auth call to finish, then lets the in-flight normal
 * requests drain. Capped at 5 seconds so a stuck request can never hang a
 * sign-in.
 */
async function acquireAuthLane(): Promise<void> {
  while (authBusy) {
    await new Promise<void>((resolve) => authQueue.push(resolve));
  }
  authBusy = true;
  stats.authHeld = stats.authHeld + 1;

  let spins = 0;
  while (active > 0 && spins < 100) {
    await sleep(50);
    spins = spins + 1;
  }
}

function releaseAuthLane(): void {
  authBusy = false;
  const nextAuth = authQueue.shift();
  if (nextAuth) nextAuth();
  // Wake everyone that parked while the lane was held; each re-checks and
  // re-parks if it still has to.
  const parked = waiters.splice(0, waiters.length);
  parked.forEach((resolve) => resolve());
}

function sweepCache(): void {
  const now = Date.now();
  microCache.forEach((entry, key) => {
    if (now - entry.at > MICRO_CACHE_MS * 4) microCache.delete(key);
  });
  if (microCache.size > CACHE_MAX) {
    const oldest = Array.from(microCache.entries()).sort((a, b) => a[1].at - b[1].at);
    for (let i = 0; i < oldest.length - CACHE_MAX; i++) microCache.delete(oldest[i][0]);
  }
}

/** True when this URL is being asked far more often than any real page needs. */
function loopDetected(key: string): boolean {
  const now = Date.now();
  const previous = recentHits.get(key) || [];
  const recent = previous.filter((t) => now - t < LOOP_WINDOW_MS);
  recent.push(now);
  recentHits.set(key, recent);
  if (recentHits.size > 400) recentHits.clear();
  return recent.length > LOOP_MAX_HITS;
}

// -- The wrapper -------------------------------------------------------------

async function bambehFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const raw = originalFetch as typeof fetch;

  if (disabledByUser()) return raw(input as RequestInfo, init);

  const url = urlOf(input);
  if (!url || url.indexOf(HOST_MARKER) === -1) return raw(input as RequestInfo, init);

  const method = methodOf(input, init);
  const idempotent = method === "GET" || method === "HEAD";
  const key = method + " " + url;

  // FIX389 - AUTH LANE. Never cached, never deduped, never retried here:
  // it simply gets the connection to itself and one clean attempt.
  if (url.indexOf(AUTH_MARKER) !== -1) {
    await acquireAuthLane();
    try {
      const res = await raw(input as RequestInfo, init);
      stats.passed = stats.passed + 1;
      return res;
    } catch (e) {
      stats.failed = stats.failed + 1;
      throw e;
    } finally {
      releaseAuthLane();
    }
  }

  if (idempotent) {
    const cached = microCache.get(key);

    if (cached && Date.now() - cached.at < MICRO_CACHE_MS) {
      stats.cached = stats.cached + 1;
      return cached.res.clone();
    }

    const pending = inFlight.get(key);
    if (pending) {
      stats.deduped = stats.deduped + 1;
      return pending.then((r) => r.clone());
    }

    if (loopDetected(key)) {
      stats.blocked = stats.blocked + 1;
      if (cached) {
        console.warn("[net] loop guard - serving last good answer for", url);
        return cached.res.clone();
      }
      console.warn("[net] loop guard - refusing repeated request to", url);
      return new Response(
        JSON.stringify({ message: "Request throttled by Bambeh loop guard" }),
        { status: 429, headers: { "content-type": "application/json" } }
      );
    }
  }

  const attempts = idempotent ? RETRY_LIMIT : 1;

  const run = (async (): Promise<Response> => {
    let lastError: unknown = null;

    for (let i = 0; i < attempts; i++) {
      await acquireSlot();
      try {
        const res = await raw(input as RequestInfo, init);
        stats.passed = stats.passed + 1;
        if (idempotent && res.ok) {
          microCache.set(key, { at: Date.now(), res: res.clone() });
          sweepCache();
        }
        return res;
      } catch (e) {
        lastError = e;
      } finally {
        releaseSlot();
      }

      if (i < attempts - 1) {
        stats.retried = stats.retried + 1;
        await sleep(RETRY_BASE_MS * (i + 1));
      }
    }

    stats.failed = stats.failed + 1;
    throw lastError;
  })();

  if (idempotent) {
    inFlight.set(key, run);
    run
      .then(() => { inFlight.delete(key); })
      .catch(() => { inFlight.delete(key); });
    return run.then((r) => r.clone());
  }

  return run;
}

// -- Install -----------------------------------------------------------------

export function initNetInterceptor(options: NetInterceptorOptions = {}): void {
  if (initialized || options.enabled === false) return;
  if (typeof window === "undefined" || typeof window.fetch !== "function") return;

  originalFetch = window.fetch.bind(window);
  window.fetch = bambehFetch as typeof fetch;
  initialized = true;

  try {
    (window as unknown as Record<string, unknown>).__bambehNet = () => ({
      ...stats,
      activeNow: active,
      queued: waiters.length,
      authBusy,
      cacheEntries: microCache.size,
    });
  } catch {
    /* debugging helper only - never fatal */
  }

  console.info("[net] Bambeh interceptor active - auth lane, dedupe, micro-cache, 3 at a time, loop guard.");
}

export function isNetInterceptorInitialized(): boolean {
  return initialized;
}

/** Live counters. Also reachable from the browser console as __bambehNet(). */
export function getNetInterceptorStats() {
  return { ...stats, activeNow: active, queued: waiters.length, authBusy, cacheEntries: microCache.size };
}

// App.tsx imports this module for its side effect, so install on load.
initNetInterceptor();
// BAMBEH_END_TOKEN__NETINTERCEPTOR_FIX389__COMPLETE
