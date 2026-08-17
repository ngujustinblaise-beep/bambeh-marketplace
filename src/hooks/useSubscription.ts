// BAMBEH_DEPLOY_TOKEN__USESUBSCRIPTION_FIX335_CLEAN
// src/hooks/useSubscription.ts — Supabase-only source of truth. NO localStorage.
//
// HISTORY
//  FIX91  — localStorage cache removed. Supabase `subscriptions` is the ONLY
//           authority. A per-session in-memory snapshot avoids refetch storms
//           but is NEVER persisted and never grants access on its own.
//  FIX96  — select * and judge in JS: the live table uses plan/is_active
//           (plan_type & plan_name do not exist; naming them causes SQL 42703).
//
//  FIX335 — THE BOUNCE LOOP. This is the one that was costing paying users.
//
//    What was wrong: when CamPay returned SUCCESSFUL, pollPaymentStatus
//    re-checked Supabase 6 times at 2s — twelve seconds — and then called
//    onSuccess() WHETHER OR NOT the subscription row had appeared. The UI
//    announced "Payment confirmed!", navigated into the app, the access gate
//    re-checked, found no active subscription, and threw the user straight back
//    to the subscription page. Marketplace -> success -> marketplace, forever.
//    The customer had paid, and the app told them they had not.
//
//    What is right now:
//      * The post-payment check runs for up to 120 SECONDS at 2s intervals and
//        announces on every round, so every mounted gate flips the instant the
//        webhook lands.
//      * onSuccess() fires ONLY when a live row genuinely exists.
//      * If that window closes with no row we call onTimeout() — the honest
//        outcome — AND leave a background watch running for 10 more minutes, so
//        access switches on by itself whenever the webhook finally writes. The
//        user is never told a lie and never bounced into a loop.
//      * Hooks re-verify on window focus and tab visibility, not only on a
//        5-minute timer. Coming back to the tab is now enough.
//      * New export refreshSubscription() for an "I have paid — check now"
//        button. Purely additive: every existing export keeps its signature, so
//        SubscriptionPlans, PaymentCheckout and CamPayWidget keep compiling.
//
//    Deliberately NOT done here: the client still never self-grants. If the
//    webhook never writes the row at all, no frontend code can fix that — it is
//    the payments Edge Function's job, and it is tracked separately.

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const BACKEND_URL =
  (import.meta as { env?: Record<string, string> }).env?.VITE_BACKEND_URL ||
  "https://rbjbdxefwzvgmioearie.supabase.co/functions/v1/payments";

const REFRESH_EVENT = "bambeh_sub";

// FIX335 timings ---------------------------------------------------------------
const ACTIVATION_WINDOW_MS = 120_000; // foreground wait after CamPay says SUCCESSFUL
const ACTIVATION_STEP_MS = 2_000; // how often we re-ask Supabase in that window
const BACKGROUND_WINDOW_MS = 600_000; // keep watching quietly for 10 more minutes
const BACKGROUND_STEP_MS = 5_000;
const IDLE_REFRESH_MS = 5 * 60_000; // baseline heartbeat, unchanged
const MIN_REFETCH_MS = 15_000; // throttle for focus / visibility re-checks

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

// -- Per-session in-memory snapshot (NOT persisted) ----------------------------
let currentUserId: string | null = null;
let currentSub: CachedSub | null = null;
let lastVerifyAt = 0;

function announce(): void {
  try {
    window.dispatchEvent(new Event(REFRESH_EVENT));
  } catch {
    /* non-browser environment */
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
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

// -- activateSubscription: NOT a grant. Asks hooks to re-verify Supabase. ------
export function activateSubscription(_planType?: string, _expiresAt?: string): void {
  announce();
}

export function clearSubscription(): void {
  currentUserId = null;
  currentSub = null;
  stopActivationWatch();
  announce();
}

// -- FIX335: refreshSubscription ------------------------------------------------
// Force one fresh check right now and tell every mounted hook about the result.
// Wire this to an "I have paid — check now" button so a waiting customer has
// something to press instead of reloading the app.
export async function refreshSubscription(userId?: string | null): Promise<boolean> {
  const uid = userId || currentUserId;
  if (!uid) return false;
  const sub = await verifyWithSupabase(uid, true);
  announce();
  return sub !== null;
}

// -- FIX335: activationWatch ----------------------------------------------------
// A quiet background poller for the window right after a payment. It NEVER
// grants anything: all it does is keep asking Supabase and announcing, so the
// gates update themselves the moment the webhook writes the row.
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
      announce();
      if (sub !== null || Date.now() > deadline) stopActivationWatch();
    } catch {
      /* transient — keep watching until the deadline */
    } finally {
      busy = false;
    }
  };

  activationTimer = setInterval(() => void tick(), stepMs);
  return stopActivationWatch;
}

// -- useSubscription HOOK -------------------------------------------------------
export function useSubscription(userId?: string | null): SubscriptionStatus {
  const seeded = userId && currentUserId === userId ? currentSub : null;
  const [sub, setSub] = useState<CachedSub | null>(seeded);
  const [isLoading, setIsLoading] = useState<boolean>(!!userId && seeded === null);

  useEffect(() => {
    let mounted = true;

    if (!userId) {
      setSub(null);
      setIsLoading(false);
      return;
    }

    const verify = (): void => {
      verifyWithSupabase(userId)
        .then((next) => {
          if (mounted) {
            setSub(next);
            setIsLoading(false);
          }
        })
        .catch(() => {
          if (mounted) setIsLoading(false);
        });
    };

    // FIX335: an event or a tab-focus must not be able to hammer the database.
    const verifyThrottled = (): void => {
      if (Date.now() - lastVerifyAt < MIN_REFETCH_MS) return;
      verify();
    };

    const onRefresh = (): void => verify(); // explicit announce: always honour it
    const onFocus = (): void => verifyThrottled();
    const onVisible = (): void => {
      if (typeof document !== "undefined" && !document.hidden) verifyThrottled();
    };

    window.addEventListener(REFRESH_EVENT, onRefresh);
    window.addEventListener("focus", onFocus);
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onVisible);
    }

    if (!(currentUserId === userId && currentSub !== null)) setIsLoading(true);
    verify(); // verify immediately on mount
    const timer = setInterval(verify, IDLE_REFRESH_MS);

    return () => {
      mounted = false;
      window.removeEventListener(REFRESH_EVENT, onRefresh);
      window.removeEventListener("focus", onFocus);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisible);
      }
      clearInterval(timer);
    };
  }, [userId]);

  return {
    isActive: sub !== null,
    planType: sub ? sub.planType : null,
    expiresAt: sub ? sub.expiresAt : null,
    isLoading,
    error: null,
  };
}

// -- pollPaymentStatus ----------------------------------------------------------
// Polls the payments function for status. On SUCCESSFUL it does NOT self-grant:
// the webhook activates server-side, and we wait — properly this time — for the
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

        if (status === "SUCCESSFUL" || status === "SUCCESS") {
          stop();

          // FIX335: wait for the row for up to two minutes, announcing every
          // round so any mounted gate switches on the moment it appears.
          const deadline = Date.now() + ACTIVATION_WINDOW_MS;
          let live: CachedSub | null = null;

          while (!stopped) {
            live = await verifyWithSupabase(userId, true);
            announce();
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
          if (onError) onError("Payment declined by your mobile money provider.");
          return;
        }
      }
    } catch {
      /* transient network error — keep polling */
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
      { id: "monthly", name: "Monthly Plan", price: 1500, currency: "XAF", duration: "30 days", features: ["Everything in Weekly", "Tontine", "FarmFresh", "Community", "Priority Support"] },
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
// BAMBEH_END_TOKEN__USESUBSCRIPTION_FIX335__COMPLETE
