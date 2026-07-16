// BAMBEH_DEPLOY_TOKEN__USESUBSCRIPTION_FIX96_CLEAN
// src/hooks/useSubscription.ts — Supabase-only source of truth. NO localStorage.
//
// FIX91 (Big's request: no local-storage prototypes):
//  - Removed the localStorage cache entirely. Supabase `subscriptions` is the
//    ONLY source of truth. A tiny per-session, in-memory snapshot avoids
//    refetch storms but is NEVER persisted and never grants access on its own.
//  - Railway removed: payment calls default to the live Supabase payments
//    function (override with VITE_BACKEND_URL if ever needed).
//  - Real `isLoading` now. Export surface otherwise unchanged so all consumers
//    keep compiling (getActiveSubscription / activateSubscription /
//    clearSubscription / useSubscription / pollPaymentStatus / fetchPlans /
//    initiateSubscription).

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const BACKEND_URL =
  (import.meta as { env?: Record<string, string> }).env?.VITE_BACKEND_URL ||
  "https://rbjbdxefwzvgmioearie.supabase.co/functions/v1/payments";

const REFRESH_EVENT = "bambeh_sub";

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

function announce(): void {
  try {
    window.dispatchEvent(new Event(REFRESH_EVENT));
  } catch {
    /* non-browser environment */
  }
}

// -- Server verification: the ONLY authority -----------------------------------
async function verifyWithSupabase(userId: string): Promise<CachedSub | null> {
  // FIX96: select * and judge in JS — the live table uses plan/is_active
  // (plan_type & plan_name do not exist; naming them causes SQL 42703).
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("expires_at", { ascending: false })
    .limit(3);

  if (error) {
    return currentUserId === userId ? currentSub : null;
  }

  const nowMs = Date.now();
  const row = (data || []).find((r: Record<string, unknown>) => {
    const alive = r.is_active === true || String(r.status || "").toLowerCase() === "active";
    return alive && r.expires_at && new Date(String(r.expires_at)).getTime() > nowMs;
  }) as Record<string, unknown> | undefined;

  const sub = row
    ? { planType: String(row.plan ?? row.plan_type ?? row.plan_name ?? "active"), expiresAt: String(row.expires_at) }
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
  announce();
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

    const verify = () => {
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

    const onRefresh = () => verify();
    window.addEventListener(REFRESH_EVENT, onRefresh);

    if (!(currentUserId === userId && currentSub !== null)) setIsLoading(true);
    verify(); // verify immediately on mount
    const timer = setInterval(verify, 5 * 60_000);

    return () => {
      mounted = false;
      window.removeEventListener(REFRESH_EVENT, onRefresh);
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
// the webhook activates server-side; we re-verify Supabase until the row shows.
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
// BAMBEH_END_TOKEN__USESUBSCRIPTION_FIX96__COMPLETE
