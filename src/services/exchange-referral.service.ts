/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EXCHANGE & REFERRAL SERVICES - SMART FIREBASE INTEGRATION
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Currency/Item Exchange and Referral Program
 *
 * © 2025 Bambeh. All rights reserved.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import axios from "axios";
import { API_BASE_URL } from "@/utils/firebase/firebaseConfig";

// ═══════════════════════════════════════════════════════════════
// EXCHANGE SERVICE
// ═══════════════════════════════════════════════════════════════

export interface ExchangeRequest {
  id: string;
  type: "currency" | "item-swap";
  fromCurrency?: string;
  toCurrency?: string;
  amount?: number;
  itemOffered?: string;
  itemWanted?: string;
  description: string;
  userId: string;
  userName: string;
  status: "open" | "in-progress" | "completed" | "cancelled";
  createdAt: string;
}

class ExchangeService {
  async getAllExchangeRequests(filters?: {
    type?: string;
  }): Promise<ExchangeRequest[]> {
    try {
      const token = localStorage.getItem("authToken");
      const headers: any = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await axios.get(`${API_BASE_URL}/getExchangeRequests`, {
        headers,
        params: filters,
        timeout: 5000,
      });

      console.log("✅ Exchange requests loaded from Firebase");
      return response.data.data.requests;
    } catch (error: any) {
      console.log("📦 Using local exchange data");
      const stored = localStorage.getItem("bambeh_local_exchanges");
      const exchanges = stored ? JSON.parse(stored) : [];

      if (filters?.type) {
        return exchanges.filter(
          (e: ExchangeRequest) => e.type === filters.type,
        );
      }
      return exchanges;
    }
  }

  async createExchangeRequest(
    requestData: Omit<
      ExchangeRequest,
      "id" | "userId" | "userName" | "status" | "createdAt"
    >,
  ): Promise<ExchangeRequest> {
    try {
      const token = localStorage.getItem("authToken");
      const headers: any = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await axios.post(
        `${API_BASE_URL}/createExchangeRequest`,
        requestData,
        { headers, timeout: 5000 },
      );

      return response.data.data.request;
    } catch (error: any) {
      console.log("📝 Creating exchange request locally");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const newRequest: ExchangeRequest = {
        ...requestData,
        id: `exchange-${Date.now()}`,
        userId: user.id || "local-user",
        userName: user.name || "Local User",
        status: "open",
        createdAt: new Date().toISOString(),
      };

      const stored = localStorage.getItem("bambeh_local_exchanges");
      const exchanges = stored ? JSON.parse(stored) : [];
      exchanges.push(newRequest);
      localStorage.setItem("bambeh_local_exchanges", JSON.stringify(exchanges));

      return newRequest;
    }
  }

  async respondToExchange(exchangeId: string, message: string): Promise<void> {
    try {
      const token = localStorage.getItem("authToken");
      const headers: any = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      await axios.post(
        `${API_BASE_URL}/respondToExchange`,
        { exchangeId, message },
        { headers, timeout: 5000 },
      );
    } catch (error: any) {
      console.log("📝 Response saved locally");
      const responses = localStorage.getItem("bambeh_local_exchange_responses");
      const allResponses = responses ? JSON.parse(responses) : [];
      allResponses.push({
        exchangeId,
        message,
        respondedAt: new Date().toISOString(),
      });
      localStorage.setItem(
        "bambeh_local_exchange_responses",
        JSON.stringify(allResponses),
      );
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// REFERRAL SERVICE
// ═══════════════════════════════════════════════════════════════

export interface Referral {
  id: string;
  referrerId: string;
  referredUserId?: string;
  referredUserEmail: string;
  status: "pending" | "completed" | "expired";
  rewardAmount: number;
  rewardClaimed: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface ReferralStats {
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  totalRewardsEarned: number;
  totalRewardsClaimed: number;
}

class ReferralService {
  async getReferralCode(): Promise<string> {
    try {
      const token = localStorage.getItem("authToken");
      const headers: any = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await axios.get(`${API_BASE_URL}/getReferralCode`, {
        headers,
        timeout: 5000,
      });

      return response.data.data.referralCode;
    } catch (error: any) {
      console.log("📦 Using local referral code");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return `BAMBEH-${user.id || "USER"}`.toUpperCase();
    }
  }

  async getMyReferrals(): Promise<Referral[]> {
    try {
      const token = localStorage.getItem("authToken");
      const headers: any = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await axios.get(`${API_BASE_URL}/getMyReferrals`, {
        headers,
        timeout: 5000,
      });

      return response.data.data.referrals;
    } catch (error: any) {
      console.log("📦 Using local referrals data");
      const stored = localStorage.getItem("bambeh_local_referrals");
      return stored ? JSON.parse(stored) : [];
    }
  }

  async getReferralStats(): Promise<ReferralStats> {
    try {
      const token = localStorage.getItem("authToken");
      const headers: any = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await axios.get(`${API_BASE_URL}/getReferralStats`, {
        headers,
        timeout: 5000,
      });

      return response.data.data.stats;
    } catch (error: any) {
      console.log("📦 Using local referral stats");
      const referrals = await this.getMyReferrals();
      return { totalReferrals: referrals.length,
        completedReferrals: referrals.filter((r) => r.status === "completed")
          .length,
        pendingReferrals: referrals.filter((r) => r.status === "pending")
          .length,
        totalRewardsEarned: referrals.reduce(
          (sum, r) => sum + r.rewardAmount,
          0,
        ),
        totalRewardsClaimed: referrals
          .filter((r) => r.rewardClaimed)
          .reduce((sum, r) => sum + r.rewardAmount, 0),
      };
    }
  }

  async sendReferralInvite(email: string): Promise<void> {
    try {
      const token = localStorage.getItem("authToken");
      const headers: any = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      await axios.post(
        `${API_BASE_URL}/sendReferralInvite`,
        { email },
        { headers, timeout: 5000 },
      );
    } catch (error: any) {
      console.log("📝 Referral invite saved locally");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const stored = localStorage.getItem("bambeh_local_referrals");
      const referrals = stored ? JSON.parse(stored) : [];

      referrals.push({
        id: `ref-${Date.now()}`,
        referrerId: user.id,
        referredUserEmail: email,
        status: "pending",
        rewardAmount: 5000, // 5000 XAF default reward
        rewardClaimed: false,
        createdAt: new Date().toISOString(),
      });

      localStorage.setItem("bambeh_local_referrals", JSON.stringify(referrals));
    }
  }

  async claimReferralReward(referralId: string): Promise<void> {
    try {
      const token = localStorage.getItem("authToken");
      const headers: any = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      await axios.post(
        `${API_BASE_URL}/claimReferralReward`,
        { referralId },
        { headers, timeout: 5000 },
      );
    } catch (error: any) {
      console.log("📝 Claiming reward locally");
      const stored = localStorage.getItem("bambeh_local_referrals");
      if (stored) {
        const referrals = JSON.parse(stored);
        const referral = referrals.find((r: Referral) => r.id === referralId);
        if (referral) {
          referral.rewardClaimed = true;
          localStorage.setItem(
            "bambeh_local_referrals",
            JSON.stringify(referrals),
          );
        }
      }
    }
  }
}

export const exchangeService = new ExchangeService();
export const referralService = new ReferralService();
