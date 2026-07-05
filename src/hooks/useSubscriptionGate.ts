/**
 * src/hooks/useSubscriptionGate.ts - Bambeh Marketplace (server-truth rebuild)
 *
 * SECURITY MODEL (script 25):
 *  - Login state comes from AuthContext (real Supabase session), NOT from
 *    forgeable localStorage user blobs.
 *  - Subscription state comes from the rebuilt useSubscription hook, which is
 *    verified against the Supabase `subscriptions` table.
 *  - Return surface is IDENTICAL to the old hook so no consumer breaks.
 */

import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";

// -- Special features requiring subscription (unchanged) ------------------------
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

// -- Hook ------------------------------------------------------------------------
export function useSubscriptionGate() {
  const navigate = useNavigate();
  const auth = useAuth() as { user?: { id?: string } | null };
  const user = auth && auth.user ? auth.user : null;
  const userId = user && user.id ? user.id : null;

  const { isActive, planType } = useSubscription(userId);

  const [gateOpen, setGateOpen] = useState(false);
  const [gateMessage, setGateMessage] = useState<string>("");

  const isLoggedIn = !!userId;
  const isSubscribed = isActive;
  const plan = planType;

  const showGate = useCallback((message?: string) => {
    setGateMessage(message || "");
    setGateOpen(true);
  }, []);

  const closeGate = useCallback(() => setGateOpen(false), []);

  const requireLogin = useCallback(
    (redirectTo?: string): boolean => {
      if (!isLoggedIn) {
        try {
          if (redirectTo) localStorage.setItem("Bambeh_redirect_after_login", redirectTo);
        } catch {
          /* storage unavailable */
        }
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
    requireSubscription,
  };
}
