// BAMBEH_DEPLOY_TOKEN__USECAMPAY_FIX98_CLEAN
/**
 * src/hooks/useCamPay.ts - Bambeh Marketplace
 * FILE LOCATION: src/hooks/useCamPay.ts
 *
 * ORDER-FIRST UPGRADE:
 *  - initPayment(...) is UNCHANGED - every existing caller keeps working.
 *  - NEW initCartPayment(...) sends the cart to POST /api/payments/cart with
 *    the buyer's Supabase access token. The SERVER verifies prices, reserves
 *    stock, creates the order as 'pending', and initiates CamPay. The
 *    signature-verified webhook flips it to 'paid' and opens escrow.
 *  - Both share the same status/polling machinery, so the payment modal UX
 *    is identical.
 */

import { useState, useRef, useCallback } from 'react';

// FIX98: payments are served by the Supabase 'payments' Edge Function now
// (Railway is dead). VITE_BACKEND_URL can still override for testing.
const BACKEND =
  (import.meta as { env?: Record<string, string> }).env?.VITE_BACKEND_URL ??
  'https://rbjbdxefwzvgmioearie.supabase.co/functions/v1/payments';

export type PaymentStatus = 'idle' | 'submitting' | 'waiting' | 'success' | 'failed' | 'timeout';

interface UseCamPayOptions {
  onSuccess?: (reference: string, data: unknown) => void | Promise<void>;
  onFailure?: (message: string) => void;
}

interface InitPaymentParams {
  amount: number;
  phone: string;
  description: string;
  externalRef?: string;
  metadata?: Record<string, unknown>;
}

export interface CartCheckoutItem {
  listingId?: string | null;
  listingType?: string | null;
  sellerId?: string | null;
  title: string;
  priceXAF: number;
  quantity: number;
}

interface InitCartPaymentParams {
  items: CartCheckoutItem[];
  phone: string;
  description: string;
  /** Supabase session access token - checkout requires a signed-in buyer. */
  accessToken: string;
}

const MTN_PREFIXES = [
  '650','651','652','653','654',
  '670','671','672','673','674','675','676','677','678','679',
  '680','681','682','683','684','685','686','687','688','689',
];

const ORANGE_PREFIXES = [
  '655','656','657','658','659',
  '690','691','692','693','694','695','696','697','698','699',
];

export type Operator = 'mtn' | 'orange' | null;

export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('237') && digits.length === 12) return digits.slice(3);
  if (digits.startsWith('0') && digits.length === 10) return digits.slice(1);
  return digits;
}

export function detectOperator(phone9: string): Operator {
  const prefix = phone9.slice(0, 3);
  if (MTN_PREFIXES.includes(prefix)) return 'mtn';
  if (ORANGE_PREFIXES.includes(prefix)) return 'orange';
  return null;
}

export function validateCamPhone(rawPhone: string): string | null {
  const phone9 = normalizePhone(rawPhone);
  if (phone9.length !== 9) return 'Enter your 9-digit MTN or Orange number (e.g. 670757326).';
  const op = detectOperator(phone9);
  if (!op) {
    return `"${phone9}" is not a recognized MTN or Orange number.`;
  }
  return null;
}

export function useCamPay({ onSuccess, onFailure }: UseCamPayOptions = {}) {
  const [status,    setStatus]    = useState<PaymentStatus>('idle');
  const [errorMsg,  setErrorMsg]  = useState<string>('');
  const [reference, setReference] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(0);

  const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancelledRef = useRef(false);
  const attemptRef   = useRef(0);

  const clearTimers = () => {
    if (timerRef.current)  clearInterval(timerRef.current);
    if (pollRef.current)   clearInterval(pollRef.current);
  };

  const reset = useCallback(() => {
    cancelledRef.current = true;
    clearTimers();
    setStatus('idle');
    setErrorMsg('');
    setReference('');
    setCountdown(0);
    attemptRef.current++;
    cancelledRef.current = false;
  }, []);

  // -- Shared machinery ----------------------------------------------------------

  /** Sends the initiation request; returns the CamPay reference or throws. */
  const requestReference = async (
    url: string,
    body: Record<string, unknown>,
    accessToken?: string,
  ): Promise<string> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

    const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });

    if (!res.ok) {
      const resBody = await res.json().catch(() => ({}));
      throw new Error(resBody?.error ?? `Server error ${res.status}`);
    }

    const data = await res.json();
    const ref = data?.data?.reference ?? data?.reference;
    if (!ref) throw new Error('No payment reference returned by server.');
    return ref;
  };

  /** Countdown + status polling until SUCCESSFUL / FAILED / timeout. */
  const startPolling = (ref: string, currentAttempt: number) => {
    setReference(ref);
    setStatus('waiting');

    const MAX_SECONDS = 300;
    setCountdown(MAX_SECONDS);

    timerRef.current = setInterval(() => {
      if (currentAttempt !== attemptRef.current) return;
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);

    let attempts = 0;
    const MAX_ATTEMPTS = Math.floor(MAX_SECONDS / 8);

    pollRef.current = setInterval(async () => {
      if (currentAttempt !== attemptRef.current) { clearTimers(); return; }
      if (cancelledRef.current) { clearTimers(); return; }
      attempts++;

      try {
        const res = await fetch(`${BACKEND}/api/payments/status/${ref}`);
        if (!res.ok) return;

        const body = await res.json();
        const campayStatus = (body?.data?.status ?? body?.status ?? '').toUpperCase();

        if (currentAttempt !== attemptRef.current) { clearTimers(); return; }

        if (campayStatus === 'SUCCESSFUL') {
          clearTimers();
          if (cancelledRef.current) return;
          setStatus('success');
          await onSuccess?.(ref, body?.data ?? body);
          return;
        }

        if (campayStatus === 'FAILED') {
          clearTimers();
          if (cancelledRef.current) return;
          const msg = body?.data?.message ?? 'Payment was declined. Please check your balance and try again.';
          setStatus('failed');
          setErrorMsg(msg);
          onFailure?.(msg);
          return;
        }

        if (attempts >= MAX_ATTEMPTS) {
          clearTimers();
          if (cancelledRef.current) return;
          setStatus('timeout');
          const msg = 'Payment timed out. If you approved the USSD prompt, wait 5 minutes and check your wallet.';
          setErrorMsg(msg);
          onFailure?.(msg);
        }
      } catch {
        // Network error during poll
      }
    }, 8000);
  };

  const beginAttempt = (): number => {
    attemptRef.current++;
    const currentAttempt = attemptRef.current;
    setStatus('submitting');
    setErrorMsg('');
    cancelledRef.current = false;
    return currentAttempt;
  };

  const failWith = (msg: string) => {
    setStatus('failed');
    setErrorMsg(msg);
    onFailure?.(msg);
  };

  // -- Public: open-ended collect (UNCHANGED behavior) ----------------------------
  const initPayment = useCallback(async (params: InitPaymentParams) => {
    const { amount, phone, description, externalRef, metadata } = params;

    const phone9      = normalizePhone(phone);
    const phoneForApi = `237${phone9}`;

    const currentAttempt = beginAttempt();

    let ref: string;
    try {
      ref = await requestReference(`${BACKEND}/api/payments/collect`, {
        amount,
        phone:       phoneForApi,
        description,
        externalRef: externalRef ?? `BAMBEH_${Date.now()}_${Math.random().toString(36).substring(2,10)}`,
        metadata,
      });
    } catch (err: unknown) {
      failWith(err instanceof Error ? err.message : 'Failed to reach payment server.');
      return;
    }

    if (currentAttempt !== attemptRef.current) return;
    startPolling(ref, currentAttempt);
  }, [onSuccess, onFailure]);

  // -- Public: ORDER-FIRST cart checkout -------------------------------------------
  // The server verifies prices, reserves stock, creates the pending order,
  // and initiates CamPay. The client never sends an amount.
  const initCartPayment = useCallback(async (params: InitCartPaymentParams) => {
    const { items, phone, description, accessToken } = params;

    const phone9      = normalizePhone(phone);
    const phoneForApi = `237${phone9}`;

    const currentAttempt = beginAttempt();

    let ref: string;
    try {
      ref = await requestReference(
        `${BACKEND}/api/payments/cart`,
        { phone: phoneForApi, items, summary: description },
        accessToken,
      );
    } catch (err: unknown) {
      failWith(err instanceof Error ? err.message : 'Failed to reach payment server.');
      return;
    }

    if (currentAttempt !== attemptRef.current) return;
    startPolling(ref, currentAttempt);
  }, [onSuccess, onFailure]);

  return { status, errorMsg, reference, countdown, initPayment, initCartPayment, reset };
}

// BAMBEH_END_TOKEN__USECAMPAY__COMPLETE
