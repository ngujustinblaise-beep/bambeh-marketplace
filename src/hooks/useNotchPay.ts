// @ts-nocheck
import { useState, useCallback } from "react";
import {
  initializePayment,
  generateReference,
  initiateWithdrawal,
} from "../services/payment/notchpayService";
import type {
  PaymentInitPayload,
  WithdrawalPayload,
  WithdrawalResult,
} from "../services/payment/notchpayService";

export const useNotchPay = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const initiate = useCallback(async (payload: PaymentInitPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const ref = payload.reference || generateReference();
      return await initializePayment({ ...payload, reference: ref });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Payment failed";
      setError(msg);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const withdraw = useCallback(async (payload: WithdrawalPayload): Promise<WithdrawalResult> => {
    setIsLoading(true);
    setError(null);
    try {
      return await initiateWithdrawal(payload);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Withdrawal failed";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { initiate, withdraw, isLoading, error, generateReference };
};
