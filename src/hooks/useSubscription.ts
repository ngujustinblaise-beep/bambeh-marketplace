/**
 * ═══════════════════════════════════════════════════════════════════════════
 * USE SUBSCRIPTION HOOK
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * ✅ Checks user subscription tier
 * ✅ Returns premium access status
 * ✅ Provides tier information
 * ✅ Permission checks
 * 
 * USAGE:
 * const { isPremium, canViewContactInfo } = useSubscription();
 * 
 * © 2025 Bambeh. All rights reserved.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useAuth } from '@/contexts/AuthContext';

export interface SubscriptionStatus {
  // Tier status
  isPremium: boolean;
  isGold: boolean;
  isBasic: boolean;
  isFree: boolean;
  tier: 'Basic' | 'Premium' | 'Gold';
  
  // Permissions
  canViewContactInfo: boolean;
  canViewLocation: boolean;
  canViewFullDetails: boolean;
  canMessage: boolean;
  canPostPremiumAds: boolean;
  canPostFeaturedAds: boolean;
  
  // User info
  currentUser: any;
}

export function useSubscription(): SubscriptionStatus {
  const { currentUser } = useAuth();

  // Determine tier
  const tier = currentUser?.tier || 'Basic';
  
  // Check tier status
  const isGold = tier === 'Gold';
  const isPremium = tier === 'Premium' || isGold;
  const isBasic = tier === 'Basic';
  const isFree = !currentUser || isBasic;

  // Define permissions based on tier
  const canViewContactInfo = isPremium || isGold;
  const canViewLocation = isPremium || isGold;
  const canViewFullDetails = isPremium || isGold;
  const canMessage = isPremium || isGold;
  const canPostPremiumAds = isPremium || isGold;
  const canPostFeaturedAds = isGold; // Only Gold can post featured ads

  return {
    // Tier status
    isPremium,
    isGold,
    isBasic,
    isFree,
    tier,
    
    // Permissions
    canViewContactInfo,
    canViewLocation,
    canViewFullDetails,
    canMessage,
    canPostPremiumAds,
    canPostFeaturedAds,
    
    // User info
    currentUser
  };
}
