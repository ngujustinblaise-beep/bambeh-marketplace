/**
 * useSubscriptionGate.ts
 * ────────────────────────────────────────────────────────────────────────────
 * Central hook that determines whether the current user can access
 * subscription-gated features.
 *
 * FILE LOCATION: src/hooks/useSubscriptionGate.ts
 *
 * Returns:
 *   isLoggedIn      — user has a valid session
 *   isSubscribed    — user has an active paid plan
 *   plan            — 'basic' | 'standard' | 'premium' | null
 *   showGate(msg?)  — call this to trigger the subscription modal
 *   GateModal       — render this anywhere; it self-manages visibility
 * ────────────────────────────────────────────────────────────────────────────
 */

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// ── Helpers ──────────────────────────────────────────────────────────────────

function getCurrentUser(): Record<string, unknown> | null {
  try {
    const keys = ["Bambeh_current_user", "Bambeh_user", "bambeh_user"];
    for (const k of keys) {
      const raw = localStorage.getItem(k);
      if (raw) return JSON.parse(raw);
    }
  } catch (e) {
    /* silent */
  }
  return null;
}

function getSubscription(): { plan: string; active: boolean } | null {
  try {
    const raw = localStorage.getItem("Bambeh_subscription");
    if (raw) {
      const sub = JSON.parse(raw);
      if (sub?.plan && sub?.active) return sub;
    }
    // Fallback: check user object directly
    const user = getCurrentUser();
    if (user?.subscriptionPlan && user?.isSubscribed) { return { plan: String(user.subscriptionPlan), active: true }; }
  } catch (e) {
    /* silent */
  }
  return null;
}

// ── Special features requiring subscription ───────────────────────────────────
export const GATED_FEATURES = [
  "/farm-fresh",
  "/community",
  "/group-buying",
  "/compare",
  "/ai-chat",
  "/deals",
  "/flash-deals",
  "/tontine",
  "/escrow",
] as const;

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useSubscriptionGate() {
  const navigate = useNavigate();
  const [gateOpen, setGateOpen] = useState(false);
  const [gateMessage, setGateMessage] = useState<string>("");

  const user = getCurrentUser();
  const sub = getSubscription();

  const isLoggedIn = !!user?.id;
  const isSubscribed = !!sub?.active;
  const plan = (sub?.plan as string) ?? null;

  const showGate = useCallback((message?: string) => {
    setGateMessage(message ?? "");
    setGateOpen(true);
  }, []);

  const closeGate = useCallback(() => setGateOpen(false), []);

  const requireLogin = useCallback(
    (redirectTo?: string) => {
      if (!isLoggedIn) {
        if (redirectTo)
          localStorage.setItem("Bambeh_redirect_after_login", redirectTo);
        navigate("/login");
        return false;
      }
      return true;
    },
    [isLoggedIn, navigate],
  );

  const requireSubscription = useCallback(
    (message?: string): boolean => {
      if (!isLoggedIn) {
        navigate("/login");
        return false;
      }
      if (!isSubscribed) {
        showGate(message);
        return false;
      }
      return true;
    },
    [isLoggedIn, isSubscribed, navigate, showGate],
  );

  return {
    isLoggedIn,
    isSubscribed,
    plan,
    showGate,
    closeGate,
    gateOpen,
    gateMessage,
    requireLogin,
    requireSubscription
  };
}

