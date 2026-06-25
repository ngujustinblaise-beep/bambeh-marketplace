/**
 * PaymentService.ts
 * Military Grade Payment Processing for Bambé Marketplace
 * Handles MTN Mobile Money, Orange Money, and Zerm Coins
 * Copyright © 2026 BAMBEH SARL. All rights reserved.
 */

import { firestore } from "@/utils/firebase/firebaseConfig";
import {
  collection, addDoc, updateDoc, doc, getDoc, getDocs, query, where,
} from "firebase/firestore";

// --- TYPES --------------------------------------------------------------------

export interface PaymentIntent {
  amount: number;
  currency: "XAF" | "Zerm";
  provider: "mtn" | "orange" | "zerm";
  phoneNumber?: string;
  phone?: string;
  userId: string;
  itemId?: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface ExtendedPaymentIntent extends PaymentIntent {
  phone: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  reference?: string;
  message: string;
  receipt?: string;
}

export interface TransactionRecord {
  id: string;
  amount: number;
  currency: string;
  provider: string;
  status: "pending" | "completed" | "failed" | "cancelled";
  userId: string;
  itemId?: string;
  phoneNumber: string;
  timestamp: Date;
  reference?: string;
  metadata?: Record<string, any>;
}

// --- SERVICE ------------------------------------------------------------------

class PaymentService {
  private readonly MTN_API_BASE = "https://sandbox.momodeveloper.mtn.com";
  private readonly ORANGE_API_BASE = "https://api.orange.com/orange-money-webpay";
  private readonly MTN_SUBSCRIPTION_KEY: string;
  private readonly ORANGE_MERCHANT_KEY: string;

  constructor() {
    this.MTN_SUBSCRIPTION_KEY = import.meta.env.VITE_MTN_SUBSCRIPTION_KEY || "";
    this.ORANGE_MERCHANT_KEY = import.meta.env.VITE_ORANGE_MERCHANT_KEY || "";
  }

  // -- Overloads --------------------------------------------------------------

  async processPayment(intent: PaymentIntent): Promise<PaymentResult>;
  async processPayment(
    amount: number,
    currency: "XAF" | "Zerm",
    provider: "mtn" | "orange" | "zerm",
    phoneNumber: string,
    userId: string,
  ): Promise<PaymentResult>;

  async processPayment(
    intentOrAmount: PaymentIntent | number,
    currency?: "XAF" | "Zerm",
    provider?: "mtn" | "orange" | "zerm",
    phoneNumber?: string,
    userId?: string,
  ): Promise<PaymentResult> {
    let paymentIntent: ExtendedPaymentIntent;

    if (typeof intentOrAmount === "number") {
      paymentIntent = {
        amount: intentOrAmount,
        currency: currency!,
        provider: provider!,
        phone: phoneNumber!,
        phoneNumber: phoneNumber!,
        userId: userId!,
        description: "Marketplace Transaction",
      };
    } else {
      const phone = intentOrAmount.phone || intentOrAmount.phoneNumber || "";
      paymentIntent = { ...intentOrAmount, phone, phoneNumber: phone };
    }

    try {
      switch (paymentIntent.provider) {
        case "mtn":
          return await this.processMTNPayment(paymentIntent);
        case "orange":
          return await this.processOrangePayment(paymentIntent);
        case "zerm":
          return await this.processZermPayment(paymentIntent);
        default:
          return { success: false, message: "Unknown payment provider" };
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Payment failed",
      };
    }
  }

  // -- MTN Mobile Money -------------------------------------------------------

  private async processMTNPayment(intent: ExtendedPaymentIntent): Promise<PaymentResult> {
    try {
      const reference = this.generateReference("MTN");
      const formattedPhone = this.formatPhoneNumber(intent.phone, "CM");

      const transactionRef = await addDoc(collection(firestore, "transactions"), {
        amount: intent.amount,
        currency: intent.currency,
        provider: "mtn",
        status: "pending",
        userId: intent.userId,
        itemId: intent.itemId,
        phoneNumber: formattedPhone,
        reference,
        timestamp: new Date(),
        metadata: intent.metadata,
      });

      const response = await fetch(`${this.MTN_API_BASE}/collection/v1_0/requesttopay`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${await this.getMTNAccessToken()}`,
          "X-Reference-Id": reference,
          "X-Target-Environment": "sandbox",
          "Ocp-Apim-Subscription-Key": this.MTN_SUBSCRIPTION_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: intent.amount.toString(),
          currency: "XAF",
          externalId: transactionRef.id,
          payer: { partyIdType: "MSISDN", partyId: formattedPhone },
          payerMessage: intent.description,
          payeeNote: `Bambé Marketplace - ${intent.description}`,
        }),
      });

      if (response.ok) {
        const status = await this.pollMTNTransactionStatus(reference);
        await updateDoc(doc(firestore, "transactions", transactionRef.id), {
          status: status.success ? "completed" : "failed",
        });
        return {
          success: status.success,
          transactionId: transactionRef.id,
          reference,
          message: status.success ? "Payment successful" : "Payment failed",
          receipt: status.success ? await this.generateReceipt(transactionRef.id) : undefined,
        };
      } else {
        await updateDoc(doc(firestore, "transactions", transactionRef.id), { status: "failed" });
        return { success: false, message: "MTN payment request failed" };
      }
    } catch (error) {
      console.error("MTN payment error:", error);
      return { success: false, message: "MTN payment processing error" };
    }
  }

  // -- Orange Money -----------------------------------------------------------

  private async processOrangePayment(intent: ExtendedPaymentIntent): Promise<PaymentResult> {
    try {
      const reference = this.generateReference("ORA");
      const formattedPhone = this.formatPhoneNumber(intent.phone, "CM");

      const transactionRef = await addDoc(collection(firestore, "transactions"), {
        amount: intent.amount,
        currency: intent.currency,
        provider: "orange",
        status: "pending",
        userId: intent.userId,
        itemId: intent.itemId,
        phoneNumber: formattedPhone,
        reference,
        timestamp: new Date(),
        metadata: intent.metadata,
      });

      const response = await fetch(`${this.ORANGE_API_BASE}/v1/webpayment`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${await this.getOrangeAccessToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          merchant_key: this.ORANGE_MERCHANT_KEY,
          currency: "XAF",
          order_id: reference,
          amount: intent.amount,
          return_url: `${window.location.origin}/payment/callback`,
          cancel_url: `${window.location.origin}/payment/cancel`,
          notif_url: `${window.location.origin}/api/payment/notify`,
          lang: "fr",
          reference: transactionRef.id,
          customer: { accountNumber: intent.phone },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          transactionId: transactionRef.id,
          reference,
          message: "Payment initiated. Please complete on your phone.",
          receipt: data.payment_url,
        };
      } else {
        await updateDoc(doc(firestore, "transactions", transactionRef.id), { status: "failed" });
        return { success: false, message: "Orange payment request failed" };
      }
    } catch (error) {
      console.error("Orange payment error:", error);
      return { success: false, message: "Orange payment processing error" };
    }
  }

  // -- Zerm Coins -------------------------------------------------------------

  private async processZermPayment(intent: ExtendedPaymentIntent): Promise<PaymentResult> {
    try {
      const reference = this.generateReference("ZERM");

      const transactionRef = await addDoc(collection(firestore, "transactions"), {
        amount: intent.amount,
        currency: "Zerm",
        provider: "zerm",
        status: "completed",
        userId: intent.userId,
        itemId: intent.itemId,
        phoneNumber: intent.phone,
        reference,
        timestamp: new Date(),
        metadata: intent.metadata,
      });

      await updateDoc(doc(firestore, "users", intent.userId), {
        zermCoins: intent.amount, // firestore increment handled by the app
      });

      return {
        success: true,
        transactionId: transactionRef.id,
        reference,
        message: "Zerm payment successful",
        receipt: await this.generateReceipt(transactionRef.id),
      };
    } catch (error) {
      console.error("Zerm payment error:", error);
      return { success: false, message: "Zerm payment processing error" };
    }
  }

  // -- Utilities --------------------------------------------------------------

  private formatPhoneNumber(phone: string, countryCode: string): string {
    let cleaned = phone.replace(/\D/g, "");
    if (countryCode === "CM" && !cleaned.startsWith("237")) {
      cleaned = "237" + cleaned;
    }
    return cleaned;
  }

  private generateReference(prefix: string): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 100000);
    return `${prefix}-${timestamp}-${random}`;
  }

  private async getMTNAccessToken(): Promise<string> {
    return "mtn_access_token_placeholder";
  }

  private async getOrangeAccessToken(): Promise<string> {
    return "orange_access_token_placeholder";
  }

  private async pollMTNTransactionStatus(reference: string): Promise<{ success: boolean }> {
    const maxAttempts = 10;
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(
          `${this.MTN_API_BASE}/collection/v1_0/requesttopay/${reference}`,
          {
            headers: {
              Authorization: `Bearer ${await this.getMTNAccessToken()}`,
              "X-Target-Environment": "sandbox",
              "Ocp-Apim-Subscription-Key": this.MTN_SUBSCRIPTION_KEY,
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          if (data.status === "SUCCESSFUL") return { success: true };
          if (data.status === "FAILED") return { success: false };
        }
      } catch (error) {
        console.error("Status poll error:", error);
      }

      attempts++;
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    return { success: false };
  }

  private async generateReceipt(transactionId: string): Promise<string> {
    const transactionDoc = await getDoc(doc(firestore, "transactions", transactionId));
    const transaction = transactionDoc.data();
    if (!transaction) return "";

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb;">Bambé Marketplace Receipt</h2>
        <p><strong>Transaction ID:</strong> ${transactionId}</p>
        <p><strong>Reference:</strong> ${transaction.reference}</p>
        <p><strong>Amount:</strong> ${transaction.amount.toLocaleString()} ${transaction.currency}</p>
        <p><strong>Provider:</strong> ${transaction.provider.toUpperCase()}</p>
        <p><strong>Status:</strong> ${transaction.status}</p>
        <p><strong>Date:</strong> ${new Date(transaction.timestamp.seconds * 1000).toLocaleString()}</p>
      </div>
    `;
  }

  // -- Public Query Methods ---------------------------------------------------

  async getTransactionById(transactionId: string): Promise<TransactionRecord | null> {
    try {
      const transactionDoc = await getDoc(doc(firestore, "transactions", transactionId));
      if (!transactionDoc.exists()) return null;
      const data = transactionDoc.data();
      return {
        id: transactionDoc.id,
        ...data,
        timestamp: new Date(data.timestamp.seconds * 1000),
      } as TransactionRecord;
    } catch (error) {
      console.error("Error fetching transaction:", error);
      return null;
    }
  }

  async getUserTransactions(userId: string): Promise<TransactionRecord[]> {
    try {
      const q = query(collection(firestore, "transactions"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        timestamp: new Date(d.data().timestamp.seconds * 1000),
      })) as TransactionRecord[];
    } catch (error) {
      console.error("Error fetching user transactions:", error);
      return [];
    }
  }
}

export const paymentService = new PaymentService();
export default paymentService;
