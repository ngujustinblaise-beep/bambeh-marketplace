// src/services/notchpayService.ts
// Notchpay payment integration — MTN MoMo & Orange Money
// Docs: https://developer.notchpay.co

import { supabase } from "@/lib/supabase";

const NOTCHPAY_PUBLIC_KEY = import.meta.env.VITE_NOTCHPAY_PUBLIC_KEY;
const API_BASE = "https://api.notchpay.co";
const SANDBOX_BASE = "https://sandbox.notchpay.co";
const BASE_URL = import.meta.env.VITE_NOTCHPAY_MODE === "sandbox" ? SANDBOX_BASE : API_BASE;

export type PaymentMethod = "mtn_momo" | "orange_money" | "card";

export interface PaymentRequest {
  amount: number;
  currency?: string;
  email: string;
  phone: string;
  method: PaymentMethod;
  description: string;
  orderId?: string;
  userId: string;
  reference?: string;
}

export interface PaymentResponse {
  success: boolean;
  reference?: string;
  transaction?: any;
  authUrl?: string;
  ussdCode?: string;
  error?: string;
}

class NotchpayService {
  private headers() {
    return {
      "Content-Type": "application/json",
      Authorization: NOTCHPAY_PUBLIC_KEY,
    };
  }

  async initiatePayment(req: PaymentRequest): Promise<PaymentResponse> {
    try {
      const reference =
        req.reference ||
        `BAMBEH-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      const payload: any = {
        amount: req.amount,
        currency: req.currency || "XAF",
        email: req.email,
        phone: this.formatPhone(req.phone),
        reference,
        description: req.description,
        callback: `${window.location.origin}/payment/callback`,
        return_url: `${window.location.origin}/payment/success?ref=${reference}`,
      };

      if (req.method === "mtn_momo") {
        payload.channel = "cm.mtn";
      } else if (req.method === "orange_money") {
        payload.channel = "cm.orange";
      }

      const response = await fetch(`${BASE_URL}/payments/initialize`, {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || data.code !== 201) {
        return { success: false, error: data.message || "Payment initiation failed" };
      }

      await supabase.from("payments").insert({
        payer_id: req.userId,
        order_id: req.orderId || null,
        amount_xaf: req.amount,
        currency: "XAF",
        method: req.method,
        status: "pending",
        notchpay_reference: reference,
        phone: req.phone,
        metadata: { description: req.description },
      });

      return {
        success: true,
        reference,
        authUrl: data.transaction?.authorization_url,
        transaction: data.transaction,
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  async verifyPayment(reference: string): Promise<{ success: boolean; status: string; error?: string }> {
    try {
      const response = await fetch(`${BASE_URL}/payments/${reference}`, {
        headers: this.headers(),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, status: "failed", error: data.message };
      }

      const status = data.transaction?.status;

      await supabase
        .from("payments")
        .update({
          status: status === "complete" ? "completed" : status,
          notchpay_trxref: data.transaction?.trxref,
          updated_at: new Date().toISOString(),
        })
        .eq("notchpay_reference", reference);

      if (status === "complete") {
        const { data: payment } = await supabase
          .from("payments")
          .select("order_id")
          .eq("notchpay_reference", reference)
          .single();

        if (payment?.order_id) {
          await supabase
            .from("orders")
            .update({ status: "confirmed", payment_reference: reference })
            .eq("id", payment.order_id);
        }
      }

      return { success: true, status };
    } catch (err: any) {
      return { success: false, status: "error", error: err.message };
    }
  }

  async payWithMTN(req: PaymentRequest): Promise<PaymentResponse> {
    return this.initiatePayment({ ...req, method: "mtn_momo" });
  }

  async payWithOrange(req: PaymentRequest): Promise<PaymentResponse> {
    return this.initiatePayment({ ...req, method: "orange_money" });
  }

  async paySubscription(
    userId: string,
    email: string,
    phone: string,
    plan: "basic" | "premium" | "gold",
    method: PaymentMethod,
  ): Promise<PaymentResponse> {
    const prices = { basic: 0, premium: 2500, gold: 7500 };
    const amount = prices[plan];

    const result = await this.initiatePayment({
      amount,
      email,
      phone,
      method,
      description: `Bambeh ${plan.charAt(0).toUpperCase() + plan.slice(1)} subscription`,
      userId,
    });

    if (result.success && result.reference) {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      await supabase.from("subscriptions").insert({
        user_id: userId,
        plan,
        status: "active",
        price_xaf: amount,
        payment_reference: result.reference,
        expires_at: expiresAt.toISOString(),
      });

      await supabase
        .from("profiles")
        .update({
          tier: plan,
          subscription_status: "active",
          subscription_expires_at: expiresAt.toISOString(),
        })
        .eq("id", userId);
    }

    return result;
  }

  private formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("237")) return `+${cleaned}`;
    if (cleaned.startsWith("6") && cleaned.length === 9) return `+237${cleaned}`;
    return `+237${cleaned}`;
  }

  async getPaymentHistory(userId: string) {
    const { data, error } = await supabase
      .from("payments")
      .select("*, orders(order_number, status, total_xaf)")
      .eq("payer_id", userId)
      .order("created_at", { ascending: false });

    return { data: data || [], error };
  }
}

export const notchpayService = new NotchpayService();
export default notchpayService;
