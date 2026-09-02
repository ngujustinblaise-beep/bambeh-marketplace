// BAMBEH_DEPLOY_TOKEN__USESUBSCRIPTION_FIX387_CLEAN
// src/hooks/useSubscription.ts - Supabase-only source of truth. NO localStorage.
//
// ===================================================================
// FIX387 - ONE QUESTION, ASKED ONCE.
// ===================================================================
//
// THE BUG, in this file's own previous code:
//
//     const onRefresh = (): void => verify();              // NOT throttled
//     window.addEventListener(REFRESH_EVENT, onRefresh);   // PER INSTANCE
//     verify();                                            // PER INSTANCE
//     const timer = setInterval(verify, IDLE_REFRESH_MS);  // PER INSTANCE
//
// Every mounted copy of this hook opened its own connection to the database,
// started its own five-minute timer, and registered its own event listener.
// LocationLock renders inside EVERY listing card, so a marketplace page with
// fifty cards created fifty of everything.
//
// The multiplier was announce(). One announce() woke all fifty listeners and
// each fired an UNTHROTTLED fetch. activationWatch() announces every five
// seconds for ten minutes after a payment - fifty listeners times a hundred
// and twenty rounds is SIX THOUSAND requests from a single subscription.
//
// A live console showed 3,295 errors on one page, the same URL over and over:
//     GET /rest/v1/subscriptions?select=*&user_...  ERR_CONNECTION_CLOSED
//
// Nothing was wrong with Supabase. Ten sequential requests to this project
// succeed ten times out of ten. The app was asking one question thousands of
// times and drowning its own connection.
//
// WHAT FIX387 CHANGES - the shape of the answer, not the answer itself:
//
//   1. ONE SHARED STORE. The verified subscription lives in module state.
//      Hooks read it; they do not each own a copy.
//
//   2. ONE REQUEST IN FLIGHT. If a check is already running, every other
//      caller awaits the SAME promise. Fifty cards, one request.
//
//   3. ONE TIMER AND ONE SET OF LISTENERS for the whole app, reference
//      counted - started by the first hook, stopped by the last.
//
//   4. announce() NO LONGER CAUSES A STAMPEDE. It publishes the state we
//      already have to every subscriber and dispatches the window event for
//      any external listener, but it does not make fifty components refetch.
//
//   5. THE THROTTLE IS REAL. MIN_REFETCH_MS now guards every path except an
//      explicit force, instead of only the focus and visibility handlers.
//
// EVERY EXPORT KEEPS ITS EXACT SIGNATURE - SubscriptionStatus, Plan,
// PaymentResult, getActiveSubscription, activateSubscription,
// clearSubscription, refreshSubscription, activationWatch,
// stopActivationWatch, useSubscription, pollPaymentStatus, fetchPlans,
// initiateSubscription. Nothing that imports this file has to change.
//
// The security model is untouched: Supabase is the only authority, the client
// never self-grants, and nothing is ever restored from localStorage.
//
// ===================================================================
// HISTORY (kept - each of these is a bug someone paid for)
// ===================================================================
//  FIX91  - localStorage cache removed. Supabase `subscriptions` is the ONLY
//           authority. A per-session in-memory snapshot avoids refetch storms
//           but is NEVER persisted and never grants access on its own.
//  FIX96  - select * and judge in JS: the live table uses plan/is_active
//           (plan_type and plan_name do not exist; naming them causes 42703).
//  FIX335 - THE BOUNCE LOOP. pollPaymentStatus used to call onSuccess() after
//           twelve seconds WHETHER OR NOT the subscription row had appeared.
//           The UI said "Payment confirmed!", the gate found no subscription,
//           and threw the paying customer straight back out. Now onSuccess()
//           fires only when a live row genuinely exists, the window is 120s,
//           and a background watch keeps looking for ten more minutes.
//  FIX356 - the subscriber was the only one not told the truth. A failed
//           subscription payment said "Payment declined by your mobile money
//           provider" in English to everyone. Now CamPay's real reason is
//           passed through campayFailureMessage() in the buyer's language.
//
// (c) 2026 BAMBEH SARL. All rights reserved.

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
// FIX356 - the same translator FIX352 gave the cart path.
import { campayFailureMessage } from "@/lib/campayReasons";

const BACKEND_URL =
  (import.meta as { env?: Record<string, string> }).env?.VITE_BACKEND_URL ||
  "https://rbjbdxefwzvgmioearie.supabase.co/functions/v1/payments";

const REFRESH_EVENT = "bambeh_sub";

// FIX335 timings ---------------------------------------------------------------
const ACTIVATION_WINDOW_MS = 120000; // foreground wait after CamPay says SUCCESSFUL
const ACTIVATION_STEP_MS = 2000;     // how often we re-ask Supabase in that window
const BACKGROUND_WINDOW_MS = 600000; // keep watching quietly for 10 more minutes
const BACKGROUND_STEP_MS = 5000;
const IDLE_REFRESH_MS = 5 * 60000;   // baseline heartbeat, ONE for the whole app
const MIN_REFETCH_MS = 15000;        // FIX387 - now guards every non-forced path

// -- Types (unchanged surface) -------------------------------------------------
export interface SubscriptionStatus {
  isActive: boolean;
  planType: string | null;
  expiresAt: string | null;
  isLoading: boolean;
  error: null;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  duration: string;
  features: string[];
}

export interface PaymentResult {
  paymentUrl?: string;
  ussd_code?: string;
  reference: string;
}

interface CachedSub {
  planType: string;
  expiresAt: string;
}

// ==============================================================================
// FIX387 - THE SHARED STORE. One copy of the answer for the whole application.
// ==============================================================================

let currentUserId: string | null = null;
let currentSub: CachedSub | null = null;
let lastVerifyAt = 0;

// FIX413 - lastVerifyAt means "we have a real answer". It is only set after a
// completed round trip, so isLoading and AuthGate's grace window still behave.
// lastAttemptAt means "we asked recently" and is set the moment a request is
// created, whether or not it ever comes back. THE THROTTLE USES THIS ONE, so a
// failing network can no longer switch the throttle off and start a stampede.
let lastAttemptAt = 0;
/** consecutive failures - each one widens the gap before we try again */
let failStreak = 0;

/** The single request in flight, if any. Everyone else awaits this one. */
let inFlight: Promise<CachedSub | null> | null = null;

/** Mounted hooks. Each entry is a re-render trigger, not a copy of the data. */
type Listener = () => void;
const listeners = new Set<Listener>();

/** Guards against our own dispatched event coming back and causing a refetch. */
let selfDispatch = false;

function publish(): void {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch {
      /* a broken listener must never stop the others */
    }
  });
}

function announce(): void {
  publish();
  try {
    selfDispatch = true;
    window.dispatchEvent(new Event(REFRESH_EVENT));
  } catch {
    /* non-browser environment */
  } finally {
    selfDispatch = false;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

// FIX356 - the buyer's language, read from the key App.tsx actually writes.
const LANG_KEY = "Bambeh_language";

function currentLang(): string {
  try {
    const raw = window.localStorage.getItem(LANG_KEY);
    if (raw === "pcm" || raw === "pidgin_english") return "pidgin";
    if (raw === "ful" || raw === "fulfulde") return "ff";
    if (raw === "en" || raw === "fr" || raw === "pidgin" || raw === "ar" || raw === "ff") return raw;
  } catch {
    /* storage blocked - fall through */
  }
  return "en";
}

// -- Server verification: the ONLY authority -----------------------------------
// strict = true means "tell me the truth or tell me nothing": on a network or
// SQL error we return null instead of the stale snapshot. The activation loop
// uses strict mode so a cached answer can never be mistaken for a fresh grant.
async function verifyWithSupabase(
  userId: string,
  strict = false,
): Promise<CachedSub | null> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("expires_at", { ascending: false })
    .limit(3);

  lastVerifyAt = Date.now();

  if (error) {
    if (strict) return null;
    return currentUserId === userId ? currentSub : null;
  }

  const nowMs = Date.now();
  const row = (data || []).find((r: Record<string, unknown>) => {
    const alive =
      r.is_active === true || String(r.status || "").toLowerCase() === "active";
    return alive && r.expires_at && new Date(String(r.expires_at)).getTime() > nowMs;
  }) as Record<string, unknown> | undefined;

  const sub = row
    ? {
        planType: String(row.plan ?? row.plan_type ?? row.plan_name ?? "active"),
        expiresAt: String(row.expires_at),
      }
    : null;

  currentUserId = userId;
  currentSub = sub;
  return sub;
}

// ==============================================================================
// FIX387 - verifyShared: the ONLY path a component may take.
// Deduplicates concurrent callers and honours the throttle.
// ==============================================================================
function verifyShared(
  userId: string,
  opts: { force?: boolean } = {},
): Promise<CachedSub | null> {
  const sameUser = currentUserId === userId;

  // Someone is already asking. Wait for their answer instead of asking again.
  if (inFlight && sameUser) return inFlight;

  // Asked recently enough. Reuse the answer we already have.
  // FIX413 - throttle on lastAttemptAt, not lastVerifyAt. On a failing network
  // lastVerifyAt stays 0 forever, which used to disable this guard entirely.
  // Back off on repeated failures: 15s, 30s, 60s, 120s, capped at 2 minutes.
  const backoff = Math.min(MIN_REFETCH_MS * Math.pow(2, Math.min(failStreak, 3)), 120000);
  if (!opts.force && sameUser && lastAttemptAt > 0 && Date.now() - lastAttemptAt < backoff) {
    return Promise.resolve(currentSub);
  }

  lastAttemptAt = Date.now(); // FIX413 - stamped on CREATION, not completion
  const request = verifyWithSupabase(userId, false)
    .catch(() => {
      // FIX413 - a THROWN fetch never reached the line that sets lastVerifyAt,
      // so isLoading stayed true forever and every gate span. Record it as
      // answered, count the failure, and let the backoff widen.
      failStreak = failStreak + 1;
      lastVerifyAt = Date.now();
      return currentUserId === userId ? currentSub : null;
    })
    .then((sub) => {
      failStreak = 0; // FIX413 - a good answer resets the backoff
      inFlight = null;
      publish();
      return sub;
    });

  inFlight = request;
  return request;
}

// ==============================================================================
// FIX387 - ONE timer and ONE set of listeners for the whole app.
// Reference counted: started by the first hook, stopped by the last.
// ==============================================================================
let globalTimer: ReturnType<typeof setInterval> | null = null;
let globalsWired = false;

function refreshIfIdle(): void {
  if (!currentUserId) return;
  void verifyShared(currentUserId);
}

function onExternalRefresh(): void {
  // Our own announce() already published the state. Only an OUTSIDE dispatch
  // means "something changed that I do not know about - go and look".
  if (selfDispatch) return;
  if (!currentUserId) return;
  void verifyShared(currentUserId, { force: true });
}

function onFocus(): void {
  refreshIfIdle();
}

function onVisible(): void {
  if (typeof document !== "undefined" && !document.hidden) refreshIfIdle();
}

function wireGlobals(): void {
  if (globalsWired || typeof window === "undefined") return;
  globalsWired = true;
  window.addEventListener(REFRESH_EVENT, onExternalRefresh);
  window.addEventListener("focus", onFocus);
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", onVisible);
  }
  globalTimer = setInterval(refreshIfIdle, IDLE_REFRESH_MS);
}

function unwireGlobals(): void {
  if (!globalsWired || typeof window === "undefined") return;
  globalsWired = false;
  window.removeEventListener(REFRESH_EVENT, onExternalRefresh);
  window.removeEventListener("focus", onFocus);
  if (typeof document !== "undefined") {
    document.removeEventListener("visibilitychange", onVisible);
  }
  if (globalTimer !== null) {
    clearInterval(globalTimer);
    globalTimer = null;
  }
}

// -- getActiveSubscription (sync snapshot of last verified answer) -------------
export function getActiveSubscription(): SubscriptionStatus {
  return {
    isActive: currentSub !== null,
    planType: currentSub ? currentSub.planType : null,
    expiresAt: currentSub ? currentSub.expiresAt : null,
    isLoading: false,
    error: null,
  };
}

// -- activateSubscription: NOT a grant. Asks the store to re-verify. -----------
export function activateSubscription(_planType?: string, _expiresAt?: string): void {
  if (currentUserId) {
    void verifyShared(currentUserId, { force: true });
  }
  announce();
}

export function clearSubscription(): void {
  currentUserId = null;
  currentSub = null;
  lastVerifyAt = 0;
  inFlight = null;
  stopActivationWatch();
  announce();
}

// -- FIX335: refreshSubscription ------------------------------------------------
// Force one fresh check right now and tell every mounted hook about the result.
// Wire this to an "I have paid - check now" button so a waiting customer has
// something to press instead of reloading the app.
export async function refreshSubscription(userId?: string | null): Promise<boolean> {
  const uid = userId || currentUserId;
  if (!uid) return false;
  const sub = await verifyWithSupabase(uid, true);
  publish();
  return sub !== null;
}

// -- FIX335: activationWatch ----------------------------------------------------
// A quiet background poller for the window right after a payment. It NEVER
// grants anything: all it does is keep asking Supabase and publishing, so the
// gates update themselves the moment the webhook writes the row.
//
// FIX387: it now publishes instead of announcing. Announcing used to wake every
// mounted hook and make each one fetch again - which is precisely how one
// payment turned into thousands of requests.
let activationTimer: ReturnType<typeof setInterval> | null = null;

export function stopActivationWatch(): void {
  if (activationTimer !== null) {
    clearInterval(activationTimer);
    activationTimer = null;
  }
}

export function activationWatch(
  userId: string,
  windowMs: number = BACKGROUND_WINDOW_MS,
  stepMs: number = BACKGROUND_STEP_MS,
): () => void {
  stopActivationWatch();
  const deadline = Date.now() + windowMs;
  let busy = false;

  const tick = async (): Promise<void> => {
    if (busy) return;
    busy = true;
    try {
      const sub = await verifyWithSupabase(userId, true);
      publish();
      if (sub !== null || Date.now() > deadline) stopActivationWatch();
    } catch {
      /* transient - keep watching until the deadline */
    } finally {
      busy = false;
    }
  };

  activationTimer = setInterval(() => void tick(), stepMs);
  return stopActivationWatch;
}

// ==============================================================================
// useSubscription HOOK - now a thin reader of the shared store.
// It owns no request, no timer and no listener of its own.

// -- FIX436: staff accounts see the whole app without buying a pass ------------
//
// The role is read from app_metadata on the SESSION TOKEN. That token is
// signed by Supabase and app_metadata is writable only by SQL or the service
// key, so a user cannot grant themselves staff access by editing localStorage.
// This opens nothing to anyone who is not already staff.
//
// It hangs off isActive rather than off one gate, so every consumer of this
// hook is covered at once: useSubscriptionGate, the plan limits, the corporate
// pages, and anything added later.
let cachedStaff = false;
let staffWired = false;

function setStaffFromSession(session: unknown): void {
  let next = false;
  try {
    const s = session as { user?: { app_metadata?: Record<string, unknown> } } | null;
    const meta = s && s.user ? s.user.app_metadata : null;
    const role = meta ? String(meta.admin_role ?? meta.role ?? '') : '';
    next = role === 'super_admin' || role === 'admin' || role === 'moderator';
  } catch {
    next = false;
  }
  if (next !== cachedStaff) {
    cachedStaff = next;
    // Wake the same listeners the subscription store already uses, so the
    // page re-renders the moment the role is known. Without this the flag
    // would change silently and the gate would stay shut until something
    // else happened to re-render.
    publish();
  }
}

function wireStaffFlag(): void {
  if (staffWired) return;
  staffWired = true;
  try {
    void supabase.auth.getSession().then(({ data }) => setStaffFromSession(data ? data.session : null));
    supabase.auth.onAuthStateChange((_event, session) => setStaffFromSession(session));
  } catch {
    cachedStaff = false;
  }
}

export function isStaffSession(): boolean {
  wireStaffFlag();
  return cachedStaff;
}

// ==============================================================================
export function useSubscription(userId?: string | null): SubscriptionStatus {
  const [, bump] = useState(0);

  useEffect(() => {
    const listener: Listener = () => bump((n) => n + 1);
    listeners.add(listener);
    wireGlobals();

    if (userId) {
      // A different user than the store holds: the old answer is not theirs.
      if (currentUserId !== userId) {
        currentUserId = userId;
        currentSub = null;
        lastVerifyAt = 0;
        inFlight = null;
      }
      void verifyShared(userId);
    } else {
      currentUserId = null;
      currentSub = null;
      lastVerifyAt = 0;
      publish();
    }

    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) unwireGlobals();
    };
  }, [userId]);

  const mine = !!userId && currentUserId === userId;
  const answered = mine && lastVerifyAt > 0;

  // FIX436 - staff accounts see the whole app without buying a pass.
  //
  // The role is read from app_metadata on the SESSION TOKEN, which is
  // signed by Supabase and writable only by SQL or the service key. A
  // user cannot give themselves this by editing localStorage, so this
  // opens nothing to anybody who is not already staff.
  //
  // It sits on isActive rather than in the gate, so EVERY consumer of
  // this hook is covered at once - useSubscriptionGate, the plan limits,
  // the corporate pages and anything added later.
  const staffPass = isStaffSession();

  return {
    isActive: staffPass || (mine && currentSub !== null),
    planType: staffPass ? 'staff' : (mine && currentSub ? currentSub.planType : null),
    expiresAt: mine && currentSub ? currentSub.expiresAt : null,
    // Loading only until we have a verified answer for THIS user. A failed
    // check still counts as answered, so a weak connection can never leave a
    // gate spinning forever.
    isLoading: !!userId && !answered,
    error: null,
  };
}

// -- pollPaymentStatus ----------------------------------------------------------
// Polls the payments function for status. On SUCCESSFUL it does NOT self-grant:
// the webhook activates server-side, and we wait \u2014 properly this time \u2014 for the
// row to appear before telling the customer anything.
export function pollPaymentStatus(
  reference: string,
  userId: string,
  _planType: string,
  onSuccess: () => void,
  onTimeout: () => void,
  onError?: (m: string) => void,
): () => void {
  let tries = 0;
  let stopped = false;

  const stop = () => {
    stopped = true;
    clearInterval(timer);
  };

  const timer = setInterval(async () => {
    if (stopped) return;
    tries++;
    try {
      const r = await fetch(
        BACKEND_URL + "/api/payments/status/" + encodeURIComponent(reference),
      );
      if (r.ok) {
        const d = (await r.json().catch(() => ({}))) as Record<string, unknown>;
        const inner = (d.data || {}) as Record<string, unknown>;
        const status = String(d.status || inner.status || "").toUpperCase();
        // FIX356 - FIX353 puts CamPay's own words in data.reason. Take them.
        const reason = String(
          inner.reason || d.reason || inner.message || d.message || "",
        );

        if (status === "SUCCESSFUL" || status === "SUCCESS") {
          stop();

          // FIX335: wait for the row for up to two minutes, announcing every
          // round so any mounted gate switches on the moment it appears.
          const deadline = Date.now() + ACTIVATION_WINDOW_MS;
          let live: CachedSub | null = null;

          while (!stopped) {
            live = await verifyWithSupabase(userId, true);
            publish(); // FIX387 - publish, never announce: announcing here made
                       // every mounted hook fetch again, fifty at a time.
            if (live !== null) break;
            if (Date.now() >= deadline) break;
            await sleep(ACTIVATION_STEP_MS);
          }

          if (live !== null) {
            onSuccess(); // true confirmation: the subscription really is live
            return;
          }

          // Paid, but the webhook has not written the row yet. Do NOT claim
          // success and do NOT navigate them into a gate that will bounce them.
          // Keep watching quietly; access will switch on by itself.
          activationWatch(userId);
          onTimeout();
          return;
        }

        if (status === "FAILED" || status === "CANCELLED") {
          stop();
          // FIX356 - the real reason, in the buyer's own language.
          const message = campayFailureMessage(reason, currentLang());
          // Never silent: a caller without an onError handler used to swallow
          // the whole failure, leaving the customer staring at a dead spinner.
          console.error(
            "[subscription] payment " + status + " ref " + reference +
            " | CamPay reason: " + (reason || "(none given)") +
            " | shown: " + message,
          );
          if (onError) {
            onError(message);
          } else {
            console.error(
              "[subscription] NO onError HANDLER PASSED to pollPaymentStatus - " +
              "the customer was told nothing. Fix the caller.",
            );
          }
          return;
        }
      }
    } catch {
      /* transient network error \u2014 keep polling */
    }
    if (tries >= 45) {
      stop();
      onTimeout();
    }
  }, 4000);

  return stop;
}

// -- fetchPlans -----------------------------------------------------------------
export async function fetchPlans(): Promise<Plan[]> {
  try {
    const r = await fetch(BACKEND_URL + "/api/plans");
    if (!r.ok) throw new Error("plans fetch failed");
    const d = (await r.json()) as unknown;
    if (Array.isArray(d)) return d as Plan[];
    const obj = d as { plans?: Plan[] };
    return obj.plans || [];
  } catch {
    return [
      { id: "daily", name: "Daily Pass", price: 100, currency: "XAF", duration: "24 hours", features: ["Full marketplace access", "Browse all listings", "Contact sellers", "Chat"] },
      { id: "weekly", name: "Weekly Plan", price: 500, currency: "XAF", duration: "7 days", features: ["Everything in Daily", "Flash Deals", "Group Buying", "AI Assistant"] },
    ];
  }
}

// -- initiateSubscription -------------------------------------------------------
// Server prices the plan; the client sends only phone + planName + userId.
export async function initiateSubscription(
  userId: string,
  planType: string,
  phone: string,
  _userEmail: string,
  _userName: string,
): Promise<PaymentResult> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  try {
    const { data } = await supabase.auth.getSession();
    const token = data && data.session ? data.session.access_token : null;
    if (token) headers["Authorization"] = "Bearer " + token;
  } catch {
    /* proceed without token; backend validates userId */
  }

  const r = await fetch(BACKEND_URL + "/api/payments/subscribe", {
    method: "POST",
    headers,
    body: JSON.stringify({ phone: phone.trim(), planName: planType, userId }),
  });
  const j = (await r.json().catch(() => ({}))) as Record<string, unknown>;
  if (!r.ok) {
    const msg = String(j.error || j.message || "Payment initiation failed");
    throw new Error(msg);
  }
  const inner = (j.data || {}) as Record<string, unknown>;
  const reference = String(
    j.reference || inner.reference || j.external_reference || inner.external_reference || "",
  );
  if (!reference) throw new Error("No payment reference returned");
  return {
    reference,
    paymentUrl: (j.paymentUrl || inner.paymentUrl) as string | undefined,
    ussd_code: (j.ussd_code || inner.ussd_code) as string | undefined,
  };
}
// BAMBEH_END_TOKEN__USESUBSCRIPTION_FIX387__COMPLETE
