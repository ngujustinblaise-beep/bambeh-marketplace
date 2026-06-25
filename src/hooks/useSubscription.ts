/**
 * src/hooks/useSubscription.ts  -  Bambeh Marketplace
 *
 * SPEED GUARANTEE:
 * - isLoading is ALWAYS false on first render
 * - isActive decision is made in microseconds from localStorage
 * - Backend check happens silently in background, never blocks UI
 * - Payment  - � -  activateSubscription()  - � -  instant access, zero wait
 */

import { useState, useEffect, useCallback } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://bambeh-backend-production-6bca.up.railway.app";



//  -  Plan durations  - 
const PLAN_MS: Record<string, number> = {
  daily:   24  * 3_600_000,   // 24 hours
  weekly:  168 * 3_600_000,   // 7 days
  monthly: 720 * 3_600_000,   // 30 days
};

const KEY = "Bambeh_sub_v3";

//  -  Types  - 
export interface SubscriptionStatus {
  isActive:  boolean;
  planType:  string | null;
  expiresAt: string | null;
  isLoading: false;           // ALWAYS false  -  no spinner ever
  error:     null;
}

export interface Plan {
  id: string; name: string; price: number;
  currency: string; duration: string; features: string[];
}

export interface PaymentResult {
  paymentUrl?: string;
  ussd_code?: string;
  reference: string;
}

interface Stored {
  planType:  string;
  expiresAt: string;
}

//  -  Synchronous localStorage read  - 
// This runs in microseconds  -  no network, no async, no waiting
function readSub(): Stored | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s: Stored = JSON.parse(raw);
    if (Date.now() >= new Date(s.expiresAt).getTime()) {
      localStorage.removeItem(KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

function writeSub(planType: string, expiresAt: string) {
  localStorage.setItem(KEY, JSON.stringify({ planType, expiresAt }));
}

//  -  getActiveSubscription (Vite Build Fix Export)  - 
export function getActiveSubscription(): SubscriptionStatus {
  const sub = readSub();
  return {
    isActive:  sub !== null,
    planType:  sub?.planType  ?? null,
    expiresAt: sub?.expiresAt ?? null,
    isLoading: false,
    error:     null,
  };
}

//  -  activateSubscription  - 
// Call this the moment CamPay confirms payment.
// Access unlocks on the NEXT render cycle  -  effectively instant.
export function activateSubscription(planType: string, expiresAt?: string) {
  const ms     = PLAN_MS[planType] ?? PLAN_MS.daily;
  const expiry = expiresAt || new Date(Date.now() + ms).toISOString();
  writeSub(planType, expiry);
  window.dispatchEvent(new Event("bambeh_sub"));
}

export function clearSubscription() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("bambeh_sub"));
}

//  -  useSubscription HOOK  - 
// isLoading is NEVER true. Decision is synchronous from localStorage.
export function useSubscription(_userId?: string | null): SubscriptionStatus {
  const [sub, setSub] = useState<Stored | null>(() => readSub());

  useEffect(() => {
    const refresh = () => setSub(readSub());
    window.addEventListener("bambeh_sub", refresh);
    window.addEventListener("storage",    refresh);
    return () => {
      window.removeEventListener("bambeh_sub", refresh);
      window.removeEventListener("storage",    refresh);
    };
  }, []);

  // Silent background sync with Railway  -  never blocks anything
  useEffect(() => {
    if (!_userId) return;
    const sync = async () => {
      try {
        const r = await fetch(`${BACKEND_URL}/api/subscription/${encodeURIComponent(_userId)}`);
        if (!r.ok) return;
        const d = await r.json();
        if (d.isActive && d.expiresAt) {
          writeSub(d.planType || "daily", d.expiresAt);
          setSub(readSub());
        }
      } catch { /* ignore  localStorage is source of truth */ }
    };
    sync();
    const t = setInterval(sync, 5 * 60_000);
    return () => clearInterval(t);
  }, [_userId]);

  return {
    isActive:  sub !== null,
    planType:  sub?.planType  ?? null,
    expiresAt: sub?.expiresAt ?? null,
    isLoading: false,   //  - � -  NEVER true
    error:     null,
  };
}

//  -  pollPaymentStatus  - 
export function pollPaymentStatus(
  reference: string,
  userId: string,
  planType: string,
  onSuccess: () => void,
  onTimeout: () => void,
  onError?: (m: string) => void
): () => void {
  let tries = 0, stopped = false;
  const t = setInterval(async () => {
    if (stopped) return;
    tries++;
    try {
      const r = await fetch(
        `${BACKEND_URL}/api/payment/status/${encodeURIComponent(reference)}?userId=${encodeURIComponent(userId)}`
      );
      if (r.ok) {
        const d = await r.json();
        if (d.status === "SUCCESSFUL") {
          stopped = true; clearInterval(t);
          activateSubscription(d.planType || planType, d.expiresAt);
          onSuccess(); return;
        }
        if (d.status === "FAILED") {
          stopped = true; clearInterval(t);
          onError?.("Payment declined by your mobile money provider."); return;
        }
      }
    } catch { /* keep trying */ }
    if (tries >= 45) { stopped = true; clearInterval(t); onTimeout(); }
  }, 4000);
  return () => { stopped = true; clearInterval(t); };
}

//  -  fetchPlans  - 
export async function fetchPlans(): Promise<Plan[]> {
  try {
    const r = await fetch(`${BACKEND_URL}/api/plans`);
    if (!r.ok) throw new Error();
    const d = await r.json();
    return Array.isArray(d) ? d : (d.plans ?? []);
  } catch {
    return [
      { id: "daily",   name: "Daily Pass",   price: 100,  currency: "XAF", duration: "24 hours",          features: ["Full marketplace access", "Browse all listings", "Contact sellers", "Chat"] },
      { id: "weekly",  name: "Weekly Plan",  price: 500,  currency: "XAF", duration: "7 days (168 hours)", features: ["Everything in Daily", "Flash Deals", "Group Buying", "AI Assistant"] },
      { id: "monthly", name: "Monthly Plan", price: 1500, currency: "XAF", duration: "30 days (720 hours)",features: ["Everything in Weekly", "Tontine", "FarmFresh", "Community", "Priority Support"] },
    ];
  }
}

//  -  initiateSubscription  - 
export async function initiateSubscription(
  userId: string, planType: string, phone: string,
  userEmail: string, userName: string
): Promise<PaymentResult> {
  const r = await fetch(`${BACKEND_URL}/api/payment/initiate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ planId: planType, phone: phone.trim(), userId, email: userEmail, name: userName }),
  });
  if (!r.ok) {
    const e = await r.json().catch(() => ({}));
    throw new Error((e as any).error || "Payment initiation failed");
  }
  return r.json();
}	

