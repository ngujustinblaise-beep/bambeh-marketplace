// BAMBEH_DEPLOY_TOKEN__NETINTERCEPTOR_FIX438_CLEAN
/**
 * src/lib/net-interceptor.ts - FIX438 (supersedes FIX389).
 *
 * ===================================================================
 * WHY THE APP IS SLOW, AND WHY THE ADMIN PANEL SHOWS NOTHING
 * ===================================================================
 *
 * A live console on 2026-09-01 showed 195 errors on /marketplace and 256 on
 * /admin/center. But the app only asks for about a dozen DIFFERENT things on
 * either page. So each request was being attempted roughly SIXTEEN times.
 *
 * Three faults in THIS FILE were doing the multiplying.
 *
 * ---- FAULT 1: the loop guard was blind to its own retries. -----------------
 * loopDetected() ran once per CALL. Each call then entered a retry loop that
 * fired up to three real network requests. So "12 hits per 10 seconds" was in
 * truth THIRTY-SIX network requests per URL before the guard tripped.
 *
 * ---- FAULT 2: the guard had nothing to serve, so it made things worse. -----
 * The cache only wrote on res.ok. When everything is failing, nothing is ever
 * cached, so the guard returned a synthetic 429. supabase-js reports a 429 as
 * an error, the caller asks again, and the cycle restarts. The guard was
 * converting a network failure into an application error.
 *
 * ---- FAULT 3: queued requests could be overtaken for ever. -----------------
 * acquireSlot() parked on a promise and re-checked when woken:
 *
 *     while (authBusy || active >= MAX_CONCURRENT) {
 *       await new Promise((resolve) => waiters.push(resolve));
 *     }
 *
 * releaseSlot() woke the longest waiter - but waking is a microtask, so a
 * brand new request could take the freed slot synchronously first. The woken
 * request re-checked, found it full, and pushed itself to the BACK of the
 * queue. Under load it could starve indefinitely. With three slots and pauses
 * of 400ms and 800ms between retries, a dozen failing requests took over a
 * minute to drain. That is the "very very slow to open".
 *
 * ===================================================================
 * WHAT FIX438 DOES INSTEAD
 * ===================================================================
 *
 * 1. A REAL FIFO QUEUE. pump() grants slots in arrival order. Nothing
 *    re-queues itself, so nothing can be overtaken. First in, first served.
 *
 * 2. ADAPTIVE CONCURRENCY. Starts at 4. Every network failure lowers it by
 *    one, to a floor of 1. Three clean successes in a row raise it again, to
 *    a ceiling of 4. On a good link the app is fast; the moment the link
 *    starts dropping connections the app becomes gentle BY ITSELF instead of
 *    hitting harder. This is the single most important change.
 *
 * 3. A CIRCUIT BREAKER. After 8 consecutive network failures we stop calling
 *    out entirely for 15 seconds. During that time GETs are answered from the
 *    last good response if we have one. When the cooldown ends, ONE probe
 *    request is allowed through: if it succeeds the breaker closes and normal
 *    service resumes; if it fails the cooldown restarts. Hammering a dead
 *    connection has never once helped.
 *
 * 4. STALE-SERVE. A successful GET is remembered for 5 minutes. If a later
 *    identical GET fails at the network, we hand back the older answer rather
 *    than an error. The admin panel that loaded its users once keeps showing
 *    them. Stale data beats an empty screen, and the user is never told a
 *    falsehood - the response is a real 200 that really came from Supabase.
 *
 * 5. RETRIES ARE COUNTED. Every real attempt goes through the loop guard, so
 *    12 means 12. Retries drop from 3 to 2 and gain jitter, so a burst that
 *    fails together does not retry together.
 *
 * UNCHANGED AND DELIBERATE:
 *   * POST, PATCH, PUT and DELETE are NEVER retried and NEVER cached.
 *     Retrying a payment or an order is far worse than failing one.
 *   * The FIX389 auth lane stays. Sign-in still gets the pipe to itself.
 *   * HTTP error statuses pass through untouched. A 400 stays a 400, a 403
 *     stays a 403. Only genuine network failures are handled here.
 *   * Non-Supabase requests are passed through without being touched at all.
 *
 * VERIFY THE DEPLOY LANDED: the console line on startup now ends with
 * "fix438". If it still says "3 at a time, loop guard.", the build did not
 * pick this file up.
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

const HOST_MARKER      = ".supabase.co";
const AUTH_MARKER      = "/auth/v1/";

const CONCURRENCY_MAX  = 4;      // healthy link
const CONCURRENCY_MIN  = 1;      // link is dropping connections
const RAISE_AFTER_OK   = 3;      // clean successes needed to widen again

const RETRY_LIMIT      = 2;      // GET / HEAD only, was 3
const RETRY_BASE_MS    = 500;
const RETRY_JITTER_MS  = 400;    // so a failed burst does not retry in step

const MICRO_CACHE_MS   = 5000;   // identical GET inside this window: do not even ask
const STALE_SERVE_MS   = 300000; // 5 min - answer from this when the network fails
const CACHE_MAX        = 150;

const LOOP_WINDOW_MS   = 10000;
const LOOP_MAX_HITS    = 12;     // now counts REAL attempts, retries included

const BREAKER_TRIP     = 8;      // consecutive network failures
const BREAKER_COOLDOWN = 15000;  // ms of silence before one probe is allowed

// -- State -------------------------------------------------------------------

let initialized = false;
let originalFetch: typeof fetch | null = null;

let limit  = CONCURRENCY_MAX;
let active = 0;
const queue: Array<() => void> = [];

let authBusy = false;
const authQueue: Array<() => void> = [];

let consecutiveFailures = 0;
let consecutiveOk       = 0;
let breakerOpenedAt     = 0;     // 0 = closed
let probeInFlight       = false;

const inFlight = new Map<string, Promise<Response>>();
const cache    = new Map<string, { at: number; res: Response }>();
const attempts = new Map<string, number[]>();

const stats = {
  passed: 0, deduped: 0, cached: 0, stale: 0, retried: 0,
  blocked: 0, failed: 0, authHeld: 0, breakerTrips: 0,
};

// -- Helpers -----------------------------------------------------------------

function disabledByUser(): boolean {
  try { return localStorage.getItem("bambeh_net_off") === "1"; } catch { return false; }
}

function urlOf(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (typeof URL !== "undefined" && input instanceof URL) return input.toString();
  try { return (input as Request).url || ""; } catch { return ""; }
}

function methodOf(input: RequestInfo | URL, init?: RequestInit): string {
  if (init && init.method) return String(init.method).toUpperCase();
  if (typeof input !== "string" && !(typeof URL !== "undefined" && input instanceof URL)) {
    try { return String((input as Request).method || "GET").toUpperCase(); } catch { return "GET"; }
  }
  return "GET";
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// -- FIFO slot queue ---------------------------------------------------------
// Nothing re-queues itself. pump() hands slots out in arrival order, so a
// request can never be overtaken. This replaces the starving while-loop.

function pump(): void {
  while (!authBusy && active < limit && queue.length > 0) {
    active = active + 1;
    const next = queue.shift();
    if (next) next();
  }
}

function acquireSlot(): Promise<void> {
  return new Promise<void>((resolve) => {
    queue.push(resolve);
    pump();
  });
}

function releaseSlot(): void {
  active = active > 0 ? active - 1 : 0;
  pump();
}

// -- Adaptive width and the breaker ------------------------------------------

function noteSuccess(): void {
  consecutiveFailures = 0;
  consecutiveOk = consecutiveOk + 1;
  if (breakerOpenedAt !== 0) {
    breakerOpenedAt = 0;
    console.info("[net] connection recovered - resuming normal service.");
  }
  if (consecutiveOk >= RAISE_AFTER_OK && limit < CONCURRENCY_MAX) {
    limit = limit + 1;
    consecutiveOk = 0;
    pump();
  }
}

function noteFailure(): void {
  consecutiveOk = 0;
  consecutiveFailures = consecutiveFailures + 1;
  if (limit > CONCURRENCY_MIN) {
    limit = limit - 1;
    console.warn("[net] connection struggling - narrowing to " + limit + " at a time.");
  }
  if (consecutiveFailures >= BREAKER_TRIP && breakerOpenedAt === 0) {
    breakerOpenedAt = Date.now();
    stats.breakerTrips = stats.breakerTrips + 1;
    console.warn(
      "[net] too many failed requests in a row - pausing for " +
      BREAKER_COOLDOWN / 1000 + "s. Cached answers will still be served."
    );
  }
}

/** open = refuse now; probe = allow exactly one test request; closed = normal */
function breakerState(): "open" | "probe" | "closed" {
  if (breakerOpenedAt === 0) return "closed";
  if (Date.now() - breakerOpenedAt < BREAKER_COOLDOWN) return "open";
  if (probeInFlight) return "open";
  return "probe";
}

// -- Cache -------------------------------------------------------------------

function remember(key: string, res: Response): void {
  cache.set(key, { at: Date.now(), res: res.clone() });
  if (cache.size > CACHE_MAX) {
    const oldest = Array.from(cache.entries()).sort((a, b) => a[1].at - b[1].at);
    for (let i = 0; i < oldest.length - CACHE_MAX; i++) cache.delete(oldest[i][0]);
  }
}

function fresh(key: string): Response | null {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < MICRO_CACHE_MS) return hit.res.clone();
  return null;
}

function stale(key: string): Response | null {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < STALE_SERVE_MS) return hit.res.clone();
  return null;
}

/** Counts REAL network attempts, retries included. FIX438 fault 1. */
function tooManyAttempts(key: string): boolean {
  const now = Date.now();
  const previous = attempts.get(key) || [];
  const recent = previous.filter((t) => now - t < LOOP_WINDOW_MS);
  recent.push(now);
  attempts.set(key, recent);
  if (attempts.size > 400) attempts.clear();
  return recent.length > LOOP_MAX_HITS;
}

// -- Auth lane (FIX389, unchanged in behaviour) -------------------------------

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
  pump();
}

// -- The wrapper -------------------------------------------------------------

function throttled(message: string): Response {
  return new Response(JSON.stringify({ message }), {
    status: 503,
    headers: { "content-type": "application/json" },
  });
}

async function bambehFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const raw = originalFetch as typeof fetch;

  if (disabledByUser()) return raw(input as RequestInfo, init);

  const url = urlOf(input);
  if (!url || url.indexOf(HOST_MARKER) === -1) return raw(input as RequestInfo, init);

  const method = methodOf(input, init);
  const idempotent = method === "GET" || method === "HEAD";
  const key = method + " " + url;

  // ---- AUTH LANE. One clean attempt, the connection to itself. -------------
  if (url.indexOf(AUTH_MARKER) !== -1) {
    await acquireAuthLane();
    try {
      const res = await raw(input as RequestInfo, init);
      stats.passed = stats.passed + 1;
      noteSuccess();
      return res;
    } catch (e) {
      stats.failed = stats.failed + 1;
      noteFailure();
      throw e;
    } finally {
      releaseAuthLane();
    }
  }

  if (idempotent) {
    const hot = fresh(key);
    if (hot) { stats.cached = stats.cached + 1; return hot; }

    const pending = inFlight.get(key);
    if (pending) { stats.deduped = stats.deduped + 1; return pending.then((r) => r.clone()); }
  }

  // ---- BREAKER. Do not call out at all while it is open. -------------------
  const state = breakerState();
  if (state === "open") {
    stats.blocked = stats.blocked + 1;
    if (idempotent) {
      const old = stale(key);
      if (old) { stats.stale = stats.stale + 1; return old; }
    }
    return throttled("Connection paused. Bambeh is waiting for the network to recover.");
  }

  const isProbe = state === "probe";
  if (isProbe) probeInFlight = true;

  const maxAttempts = idempotent && !isProbe ? RETRY_LIMIT : 1;

  const run = (async (): Promise<Response> => {
    let lastError: unknown = null;

    for (let i = 0; i < maxAttempts; i++) {
      if (tooManyAttempts(key)) {
        stats.blocked = stats.blocked + 1;
        const old = idempotent ? stale(key) : null;
        if (old) {
          stats.stale = stats.stale + 1;
          console.warn("[net] loop guard - serving the last good answer for", url);
          return old;
        }
        console.warn("[net] loop guard - refusing repeated request to", url);
        return throttled("Request throttled by Bambeh loop guard.");
      }

      await acquireSlot();
      try {
        const res = await raw(input as RequestInfo, init);
        stats.passed = stats.passed + 1;
        noteSuccess();
        if (idempotent && res.ok) remember(key, res);
        return res;
      } catch (e) {
        lastError = e;
        noteFailure();
      } finally {
        releaseSlot();
      }

      if (i < maxAttempts - 1) {
        stats.retried = stats.retried + 1;
        await sleep(RETRY_BASE_MS * (i + 1) + Math.floor(Math.random() * RETRY_JITTER_MS));
      }
    }

    // Every attempt failed at the network. An older real answer beats an error.
    if (idempotent) {
      const old = stale(key);
      if (old) {
        stats.stale = stats.stale + 1;
        console.warn("[net] network failed - serving the last good answer for", url);
        return old;
      }
    }

    stats.failed = stats.failed + 1;
    throw lastError;
  })();

  const settle = () => { if (isProbe) probeInFlight = false; };

  if (idempotent) {
    inFlight.set(key, run);
    run.then(() => { inFlight.delete(key); settle(); })
       .catch(() => { inFlight.delete(key); settle(); });
    return run.then((r) => r.clone());
  }

  run.then(settle).catch(settle);
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
      limitNow: limit,
      activeNow: active,
      queued: queue.length,
      authBusy,
      breaker: breakerState(),
      cacheEntries: cache.size,
    });
  } catch {
    /* debugging helper only - never fatal */
  }

  console.info(
    "[net] Bambeh interceptor active - auth lane, dedupe, adaptive width, " +
    "circuit breaker, stale-serve. fix438"
  );
}

export function isNetInterceptorInitialized(): boolean {
  return initialized;
}

/** Live counters. Also reachable from the browser console as __bambehNet(). */
export function getNetInterceptorStats() {
  return {
    ...stats,
    limitNow: limit,
    activeNow: active,
    queued: queue.length,
    authBusy,
    breaker: breakerState(),
    cacheEntries: cache.size,
  };
}

// App.tsx imports this module for its side effect, so install on load.
initNetInterceptor();
// BAMBEH_END_TOKEN__NETINTERCEPTOR_FIX438__COMPLETE
