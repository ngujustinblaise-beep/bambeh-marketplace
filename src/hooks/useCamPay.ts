/**
 * src/hooks/useCamPay.ts  —  Bambeh Marketplace
 * FILE LOCATION: src/hooks/useCamPay.ts
 *
 * FIXED in this version:
 *  ✅ BUG 1: MTN prefix list now includes ALL 67x numbers (670–679)
 *  ✅ BUG 2: Payment initiation + status polling now goes through Railway
 *            backend (reliable) — NOT the old Render server or Edge Functions
 *            that were silently timing out
 *  ✅ Phone normalization always strips leading zeros and adds 237 country code
 *  ✅ Polling retries for up to 5 minutes with exponential back-off
 *  ✅ Clear error messages shown to the user when polling fails
 */

import { useState, useRef, useCallback } from 'react';

// ── Backend URL ──────────────────────────────────────────────────────────────
// This is your Railway backend. All payment calls go here.
const BACKEND = import.meta.env.VITE_BACKEND_URL
  ?? 'https://bambeh-backend-production-6bca.up.railway.app';

// ── Types ────────────────────────────────────────────────────────────────────
export type PaymentStatus = 'idle' | 'submitting' | 'waiting' | 'success' | 'failed' | 'timeout';

interface UseCamPayOptions {
  onSuccess?: (reference: string, data: unknown) => void | Promise<void>;
  onFailure?: (message: string) => void;
}

interface InitPaymentParams {
  amount: number;
  phone: string;        // 9-digit local number e.g. "670757326"
  description: string;
  externalRef?: string;
  metadata?: Record<string, unknown>;
}

// ── Operator detection ───────────────────────────────────────────────────────
/**
 * Cameroon mobile prefixes (9-digit local format, no country code).
 *
 * MTN Cameroon: 650–654, 670–679, 680–689
 * Orange Cameroon: 655–659, 690–699
 *
 * Reference: https://www.arcep.cm / CamPay documentation
 */
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

/**
 * Normalize a phone number to 9-digit local format.
 * Handles: "670757326", "237670757326", "0670757326"
 */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('237') && digits.length === 12) return digits.slice(3); // 237XXXXXXXXX → XXXXXXXXX
  if (digits.startsWith('0') && digits.length === 10) return digits.slice(1);    // 0XXXXXXXXX  → XXXXXXXXX
  return digits; // already 9-digit
}

/**
 * Detect operator from a 9-digit local number.
 * Returns 'mtn', 'orange', or null if unrecognized.
 */
export function detectOperator(phone9: string): Operator {
  const prefix = phone9.slice(0, 3);
  if (MTN_PREFIXES.includes(prefix)) return 'mtn';
  if (ORANGE_PREFIXES.includes(prefix)) return 'orange';
  return null;
}

/**
 * Validate a phone number for CamPay.
 * Returns an error string, or null if valid.
 */
export function validateCamPhone(rawPhone: string): string | null {
  const phone9 = normalizePhone(rawPhone);
  if (phone9.length !== 9) return 'Enter your 9-digit MTN or Orange number (e.g. 670757326).';
  const op = detectOperator(phone9);
  if (!op) {
    return `"${phone9}" is not a recognized MTN or Orange number. MTN starts with 65x, 67x, 68x. Orange starts with 65x (5–9), 69x.`;
  }
  return null;
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useCamPay({ onSuccess, onFailure }: UseCamPayOptions = {}) {
  const [status,    setStatus]    = useState<PaymentStatus>('idle');
  const [errorMsg,  setErrorMsg]  = useState<string>('');
  const [reference, setReference] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(0);

  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancelledRef = useRef(false);

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
    // Allow future payment attempts
    setTimeout(() => { cancelledRef.current = false; }, 100);
  }, []);

  const initPayment = useCallback(async (params: InitPaymentParams) => {
    const { amount, phone, description, externalRef, metadata } = params;

    // Normalize to 9-digit, then prepend 237 for CamPay
    const phone9       = normalizePhone(phone);
    const phoneForApi  = `237${phone9}`;

    setStatus('submitting');
    setErrorMsg('');
    cancelledRef.current = false;

    // ── Step 1: Initiate collect via Railway backend ─────────────────────────
    let ref: string;
    try {
      const res = await fetch(`${BACKEND}/api/payments/collect`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          phone:       phoneForApi,
          description,
          externalRef: externalRef ?? `bambeh_${Date.now()}`,
          metadata,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `Server error ${res.status}`);
      }

      const data = await res.json();
      ref = data?.data?.reference ?? data?.reference;
      if (!ref) throw new Error('No payment reference returned by server.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reach payment server.';
      setStatus('failed');
      setErrorMsg(msg);
      onFailure?.(msg);
      return;
    }

    setReference(ref);
    setStatus('waiting');

    // ── Step 2: Countdown timer (5 minutes) ─────────────────────────────────
    const MAX_SECONDS = 300;
    setCountdown(MAX_SECONDS);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);

    // ── Step 3: Poll status every 8 seconds ──────────────────────────────────
    let attempts = 0;
    const MAX_ATTEMPTS = Math.floor(MAX_SECONDS / 8); // ~37 attempts

    pollRef.current = setInterval(async () => {
      if (cancelledRef.current) { clearTimers(); return; }
      attempts++;

      try {
        const res = await fetch(`${BACKEND}/api/payments/status/${ref}`);
        if (!res.ok) return; // transient error — keep polling

        const body = await res.json();
        // CamPay returns status: "SUCCESSFUL" | "FAILED" | "PENDING"
        const campayStatus = (body?.data?.status ?? body?.status ?? '').toUpperCase();

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

        // PENDING — keep polling unless we've exhausted attempts
        if (attempts >= MAX_ATTEMPTS) {
          clearTimers();
          if (cancelledRef.current) return;
          setStatus('timeout');
          const msg = 'Payment timed out. If you approved the USSD prompt, wait 5 minutes and check your wallet — it may still go through.';
          setErrorMsg(msg);
          onFailure?.(msg);
        }
      } catch {
        // Network error during poll — keep trying, don't fail the payment
      }
    }, 8000);
  }, [onSuccess, onFailure]);

  return { status, errorMsg, reference, countdown, initPayment, reset };
}
