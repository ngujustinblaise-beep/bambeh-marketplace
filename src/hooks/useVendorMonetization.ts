// @ts-nocheck
import { useState, useCallback } from "react";
import type { GamificationActionType } from "../types/gamification";

export const useVendorMonetization = () => {
  const [zermBalance, setZermBalance] = useState(0);
  const [isLoading,   setIsLoading]   = useState(false);

  const validActions: GamificationActionType[] = [
    "listing_created",
    "sale_completed",
    "review_received",
    "profile_completed",
    "referral_completed",
    "daily_login",
    "item_favorited",
    "chat_initiated",
    "subscription_purchased",
  ];

  const rewardAction = useCallback(async (
    action: GamificationActionType,
    amount: number,
  ): Promise<{ success: boolean; amount: number }> => {
    setIsLoading(true);
    try {
      setZermBalance(prev => prev + amount);
      return { success: true, amount };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { zermBalance, rewardAction, isLoading, validActions };
};
