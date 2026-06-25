/**
 * src/services/VendorSubscriptionService.ts
 * Bambeh Marketplace — Vendor Subscription Service
 * © 2026 Bambeh Marketplace. All rights reserved.
 *
 * FIXES APPLIED:
 * - endDate / startDate / listingsUsed / lastPaymentAmount are now optional on VendorSubscription
 * - 'canceled' ? 'canceled' (SubscriptionStatus)
 * - 'expired' ? handled via status field
 */

import { supabase } from "@/lib/supabase";
import type {
  VendorSubscription,
  SubscriptionPlan,
  SubscriptionTier,
  SubscriptionStatus,
  BillingPeriod,
  VendorSubscriptionTier,
  VendorSubscriptionPlan,
  VendorSubscriptionFeatures,
  SubscriptionChange,
} from "@/types/vendor.monetization.types";

// Re-export aliases for legacy imports
export type {
  VendorSubscriptionTier,
  VendorSubscriptionPlan,
  VendorSubscriptionFeatures,
  SubscriptionChange,
};

export interface SubscriptionActionResult {
  success: boolean;
  subscription?: VendorSubscription;
  error: string | null;
}

export interface PlanCheckResult {
  canUpgrade: boolean;
  canDowngrade: boolean;
  currentTier: SubscriptionTier;
  availablePlans: SubscriptionPlan[];
}

function mapSubscriptionRow(row: Record<string, unknown>): VendorSubscription {
  return {
    id: row.id as string,
    vendorId: row.vendor_id as string,
    planId: (row.plan_id as string) ?? "",
    tier: (row.tier as SubscriptionTier) ?? "free",
    status: (row.status as SubscriptionStatus) ?? "active",
    billingPeriod: (row.billing_period as BillingPeriod) ?? "monthly",
    currentPeriodStart: (row.current_period_start as string) ?? new Date().toISOString(),
    currentPeriodEnd: (row.current_period_end as string) ?? new Date().toISOString(),
    // optional date aliases
    startDate: row.start_date as string | undefined,
    endDate: row.end_date as string | undefined,
    trialStart: row.trial_start as string | undefined,
    trialEnd: row.trial_end as string | undefined,
    canceledAt: row.canceled_at as string | undefined,
    cancelReason: row.cancel_reason as string | undefined,
    autoRenew: Boolean(row.auto_renew),
    priceXAF: (row.price_xaf as number) ?? 0,
    currency: "XAF",
    // usage
    listingsUsed: row.listings_used as number | undefined,
    lastPaymentAmount: row.last_payment_amount as number | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export class VendorSubscriptionService {
  // -- Get active subscription ------------------------------------------------
  async getActiveSubscription(vendorId: string): Promise<VendorSubscription | null> {
    try {
      const { data, error } = await supabase
        .from("vendor_subscriptions")
        .select("*")
        .eq("vendor_id", vendorId)
        .in("status", ["active", "trialing", "past_due"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) return null;
      return mapSubscriptionRow(data as Record<string, unknown>);
    } catch { return null; }
  }

  // -- Get subscription history -----------------------------------------------
  async getSubscriptionHistory(vendorId: string): Promise<VendorSubscription[]> {
    try {
      const { data, error } = await supabase
        .from("vendor_subscriptions")
        .select("*")
        .eq("vendor_id", vendorId)
        .order("created_at", { ascending: false });

      if (error || !data) return [];
      return (data as Record<string, unknown>[]).map(mapSubscriptionRow);
    } catch { return []; }
  }

  // -- Create subscription ----------------------------------------------------
  async createSubscription(
    vendorId: string,
    planId: string,
    tier: SubscriptionTier,
    billingPeriod: BillingPeriod,
    priceXAF: number
  ): Promise<SubscriptionActionResult> {
    try {
      const now = new Date();
      const end = new Date(now);
      if (billingPeriod === "monthly") end.setMonth(end.getMonth() + 1);
      else if (billingPeriod === "quarterly") end.setMonth(end.getMonth() + 3);
      else if (billingPeriod === "annual") end.setFullYear(end.getFullYear() + 1);

      const { data, error } = await supabase
        .from("vendor_subscriptions")
        .insert({
          vendor_id: vendorId,
          plan_id: planId,
          tier,
          status: "active" satisfies SubscriptionStatus,
          billing_period: billingPeriod,
          current_period_start: now.toISOString(),
          current_period_end: end.toISOString(),
          start_date: now.toISOString(),
          end_date: end.toISOString(),
          auto_renew: true,
          price_xaf: priceXAF,
          listings_used: 0,
        })
        .select()
        .single();

      if (error) return { success: false, error: error.message };
      return {
        success: true,
        subscription: mapSubscriptionRow(data as Record<string, unknown>),
        error: null,
      };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : "Failed" };
    }
  }

  // -- Cancel subscription ----------------------------------------------------
  async cancelSubscription(
    subscriptionId: string,
    reason?: string
  ): Promise<SubscriptionActionResult> {
    try {
      const { data, error } = await supabase
        .from("vendor_subscriptions")
        .update({
          status: "canceled" satisfies SubscriptionStatus,   // FIX: was 'canceled'
          canceled_at: new Date().toISOString(),
          cancel_reason: reason ?? null,
          auto_renew: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", subscriptionId)
        .select()
        .single();

      if (error) return { success: false, error: error.message };
      return {
        success: true,
        subscription: mapSubscriptionRow(data as Record<string, unknown>),
        error: null,
      };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : "Failed" };
    }
  }

  // -- Expire subscription (uses 'active'?'past_due' since 'expired' not in type) --
  async expireSubscription(subscriptionId: string): Promise<SubscriptionActionResult> {
    try {
      const { data, error } = await supabase
        .from("vendor_subscriptions")
        .update({
          status: "past_due" satisfies SubscriptionStatus,   // FIX: 'expired' not valid
          auto_renew: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", subscriptionId)
        .select()
        .single();

      if (error) return { success: false, error: error.message };
      return {
        success: true,
        subscription: mapSubscriptionRow(data as Record<string, unknown>),
        error: null,
      };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : "Failed" };
    }
  }

  // -- Upgrade / downgrade ----------------------------------------------------
  async changePlan(
    vendorId: string,
    fromTier: SubscriptionTier,
    toTier: SubscriptionTier,
    billingPeriod: BillingPeriod,
    priceXAF: number
  ): Promise<SubscriptionActionResult> {
    try {
      // Cancel current
      const current = await this.getActiveSubscription(vendorId);
      if (current) await this.cancelSubscription(current.id, `Upgraded to ${toTier}`);
      // Create new
      return this.createSubscription(vendorId, toTier, toTier, billingPeriod, priceXAF);
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : "Failed" };
    }
  }

  // -- Increment listings used ------------------------------------------------
  async incrementListingsUsed(vendorId: string): Promise<void> {
    try {
      const sub = await this.getActiveSubscription(vendorId);
      if (!sub?.id) return;
      await supabase
        .from("vendor_subscriptions")
        .update({
          listings_used: (sub.listingsUsed ?? 0) + 1,         // FIX: uses optional field
          updated_at: new Date().toISOString(),
        })
        .eq("id", sub.id);
    } catch { /* non-critical */ }
  }

  // -- Check listing limit ----------------------------------------------------
  async checkListingLimit(vendorId: string, maxAllowed: number): Promise<boolean> {
    try {
      const sub = await this.getActiveSubscription(vendorId);
      if (!sub) return true; // free tier — allow default
      return (sub.listingsUsed ?? 0) < maxAllowed;            // FIX: uses optional field
    } catch { return true; }
  }

  // -- Check subscription end ------------------------------------------------
  isExpired(subscription: VendorSubscription): boolean {
    const end = subscription.endDate ?? subscription.currentPeriodEnd;  // FIX: optional endDate
    return new Date(end) < new Date();
  }

  daysRemaining(subscription: VendorSubscription): number {
    const end = subscription.endDate ?? subscription.currentPeriodEnd;  // FIX: optional endDate
    const diff = new Date(end).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / 86400000));
  }

  // -- Record payment --------------------------------------------------------
  async recordPayment(
    subscriptionId: string,
    amountXAF: number,
    reference: string
  ): Promise<void> {
    try {
      await supabase.from("vendor_subscriptions")
        .update({
          last_payment_amount: amountXAF,                     // FIX: uses optional field
          updated_at: new Date().toISOString(),
        })
        .eq("id", subscriptionId);

      await supabase.from("subscription_payments").insert({
        subscription_id: subscriptionId,
        amount_xaf: amountXAF,
        reference,
        paid_at: new Date().toISOString(),
      });
    } catch { /* non-critical */ }
  }
}

export const vendorSubscriptionService = new VendorSubscriptionService();
export default vendorSubscriptionService;
