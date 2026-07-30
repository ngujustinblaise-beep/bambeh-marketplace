import React, { createContext, useContext, useState, useEffect } from "react";

// ============================================
// SUBSCRIPTION INTERFACES
// ============================================

export interface SubscriptionStatus {
  tier: string;
  isActive: boolean;
}

export interface SubscriptionContextType {
  subscription: SubscriptionStatus;
  subscriptionTier: string;
  isSubscribed: boolean;
  currentSubscription: SubscriptionStatus;
  subscribe: (tier: string) => Promise<void>;
  hasAccess?: (feature: string) => boolean;
}

// ============================================
// CONTEXT CREATION
// ============================================

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined,
);

// ============================================
// PROVIDER COMPONENT
// ============================================

export function SubscriptionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    tier: "free",
    isActive: false,
  });

  const subscribe = async (tier: string) => {
    setSubscription({
      tier,
      isActive: false,
    });
    localStorage.setItem(
      "bambeh_subscription",
      JSON.stringify({ tier, isActive: false }),
    );
  };

  useEffect(() => {
    const saved = null /* FIX231: a subscription is never restored from localStorage - anyone can write that key from the console */;
    if (saved) {
      try {
        setSubscription(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse subscription", e);
      }
    }
  }, []);

  const value: SubscriptionContextType = {
    subscription,
    subscriptionTier: subscription.tier,
    isSubscribed: subscription.isActive,
    currentSubscription: subscription,
    subscribe,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within SubscriptionProvider");
  }
  return context;
}





