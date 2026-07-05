/**
 * src/hooks/useSubscription.ts - Bambeh Marketplace (server-truth rebuild)
 *
 * SECURITY MODEL (script 24):
 *  - Supabase `subscriptions` table is the ONLY source of truth.
 *  - Activation happens ONLY on the backend (CamPay webhook -> service role).
 *  - localStorage holds a CACHE of the last verified server answer, nothing
 *    more. Editing it cannot grant real access: it is re-verified against
 *    Supabase on mount, on every refresh event, and every 5 minutes - and
 *    RLS makes the table itself unwritable from the client.
 *  - The export surface is IDENTICAL to the old hook so no consumer breaks.
 */

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const BACKEND_URL =
  (import.meta as { env?: Record<string, string> }).env?.VITE_BACKEND_URL ||
  "https://bambeh-backend-production-6bca.up.railway.app";

const CACHE_KEY = "Bambeh_sub_v4_cache";
const REFRESH_EVENT = "bambeh_sub";

// -- Types (unchanged surface) -------------------------------------------------
export interface SubscriptionStatus {
  isActive: boolean;
  planType: string | null;
  expiresAt: string | null;
  isLoading: false; // kept false for compatibility: cache renders instantly
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

// -- Cache helpers (hint only - server remains the authority) -------------------
function readCache(): CachedSub | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as CachedSub;
    if (!s || !s.expiresAt) return null;
    if (Date.now() >= new Date(s.expiresAt).getTime()) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

function writeCache(sub: CachedSub | null): void {
  try {
    if (sub) localStorage.setItem(CACHE_KEY, JSON.stringify(sub));
    else localStorage.removeItem(CACHE_KEY);
  } catch {
    /* storage unavailable - cache is optional */
  }
}

function announce(): void {
  try {
    window.dispatchEvent(new Event(REFRESH_EVENT));
  } catch {
    /* non-browser environment */
  }
}

// -- Server verification: the ONLY writer of the cache --------------------------
async function verifyWithSupabase(userId: string): Promise<CachedSub | null> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("plan_type,status,expires_at")
    .eq("user_id", userId)
    .eq("status", "active")
    .gt("expires_at", new Date().toISOString())
    .order("expires_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    // Offline or transient failure: keep the previous cache (low-bandwidth
    // tolerance for Cameroon networks) rather than kicking the user out.
    return readCache();
  }
  const sub =
    data && data.plan_type && data.expires_at
      ? { planType: String(data.plan_type), expiresAt: String(data.expires_at) }
      : null;
  writeCache(sub);
  return sub;
}

// -- getActiveSubscription (sync snapshot of last verified answer) --------------
export function getActiveSubscription(): SubscriptionStatus {
  const sub = readCache();
  return {
    isActive: sub !== null,
    planType: sub ? sub.planType : null,
    expiresAt: sub ? sub.expiresAt : null,
    isLoading: false,
    error: null,
  };
}

// -- activateSubscription: NO LONGER A GRANT ------------------------------------
// The old version wrote an entitlement into localStorage - forgeable by anyone.
// Activation is now exclusively server-side (webhook). This function only asks
// every mounted hook to re-verify against Supabase. Signature kept so existing
// callers compile; parameters are intentionally ignored.
export function activateSubscription(_planType?: string, _expiresAt?: string): void {
  announce();
}

export function clearSubscription(): void {
  writeCache(null);
  announce();
}

// -- useSubscription HOOK --------------------------------------------------------
export function useSubscription(userId?: string | null): SubscriptionStatus {
  const [sub, setSub] = useState<CachedSub | null>(() => readCache());

  useEffect(() => {
    let mounted = true;

    const apply = (next: CachedSub | null) => {
      if (mounted) setSub(next);
    };

    const verify = () => {
      if (!userId) {
        writeCache(null);
        apply(null);
        return;
      }
      verifyWithSupabase(userId).then(apply).catch(() => apply(readCache()));
    };

    const onRefresh = () => verify();
    const onStorage = () => apply(readCache());

    window.addEventListener(REFRESH_EVENT, onRefresh);
    window.addEventListener("storage", onStorage);

    verify(); // verify immediately on mount
    const timer = setInterval(verify, 5 * 60_000);

    return () => {
      mounted = false;
      window.removeEventListener(REFRESH_EVENT, onRefresh);
      window.removeEventListener("storage", onStorage);
      clearInterval(timer);
    };
  }, [userId]);

  return {
    isActive: sub !== null,
    planType: sub ? sub.planType : null,
    expiresAt: sub ? sub.expiresAt : null,
    isLoading: false,
    error: null,
  };
}

// -- pollPaymentStatus ------------------------------------------------------------
// Polls the BACKEND for payment status. On SUCCESSFUL it does NOT self-activate:
// the webhook activates server-side; we re-verify Supabase until the row appears.
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
          // Ask Supabase for the webhook-written row (bounded retries).
          for (let i = 0; i < 6; i++) {
            const sub = await verifyWithSupabase(userId);
            if (sub) break;
            await new Promise((res) => setTimeout(res, 2000));
          }
          announce();
          onSuccess();
          return;
        }
        if (status === "FAILED" || status === "CANCELLED") {
          stop();
          if (onError) onError("Payment declined by your mobile money provider.");
          return;
        }
      }
    } catch {
      /* transient network error - keep polling */
    }
    if (tries >= 45) {
      stop();
      onTimeout();
    }
  }, 4000);

  return stop;
}

// -- fetchPlans ---------------------------------------------------------------------
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

// -- initiateSubscription --------------------------------------------------------------
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
