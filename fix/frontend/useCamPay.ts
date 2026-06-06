/**
 * useCamPay.ts  —  Bambeh Marketplace
 * FILE LOCATION: src/hooks/useCamPay.ts
 *
 * ════════════════════════════════════════════════════════════════
 *  UNIFIED CAMPAY PAYMENT HOOK
 *  Single source of truth for ALL payments on Bambeh:
 *    • Subscriptions     → /subscription-plans
 *    • Zerm Coin purchase → /coins/purchase
 *    • Cart checkout      → /cart → /payment/checkout
 *    • Donations          → /donate
 *    • Escrow / Services  → /escrow
 * ════════════════════════════════════════════════════════════════
 *
 * HOW IT WORKS
 * ─────────────
 *  1. Frontend calls initPayment() with amount + phone + description
 *  2. Hook calls the Supabase Edge Function  `campay-collect`
 *     (the Edge Function holds CAMPAY_USERNAME / CAMPAY_PASSWORD — 
 *      they never leave the server)
 *  3. CamPay sends a USSD push to the user's phone
 *  4. Hook polls Edge Function `campay-status` every 3 s
 *  5. Returns status: 'idle' | 'submitting' | 'waiting' | 'success' | 'failed' | 'timeout'
 *
 * USAGE EXAMPLE
 * ─────────────
 *  const { status, errorMsg, reference, initPayment, reset } = useCamPay({
 *    onSuccess: (ref) => { / activate subscription, etc. / },
 *    onFailure: (msg) => { / show error / },
 *  });
 *
 *  <button onClick={() => initPayment({ amount: 500, phone: '237670000000', description: 'Daily plan' })}>
 *    Pay
 *  </button>
 */

import { useRef, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// ── Types ────────────────────────────────────────────────────────────────────
export type PaymentStatus = 'idle' | 'submitting' | 'waiting' | 'success' | 'failed' | 'timeout';

export interface InitPaymentArgs {
  amount: number;           // XAF, integer, min 100
  phone: string;            // full number with country code, e.g. "237670757326"
  description: string;      // shown to user on USSD prompt
  externalRef?: string;     // optional: your own order ID / reference
  metadata?: Record<string, unknown>; // optional: stored in Supabase alongside the transaction
}

export interface UseCamPayOptions {
  onSuccess?: (reference: string, data: Record<string, unknown>) => void | Promise<void>;
  onFailure?: (message: string) => void;
  pollIntervalMs?: number;  // default 3000
  maxPollAttempts?: number; // default 40 (= 2 minutes at 3 s intervals)
}

export interface UseCamPayResult {
  status: PaymentStatus;
  errorMsg: string;
  reference: string;
  countdown: number;        // seconds remaining in the waiting phase
  initPayment: (args: InitPaymentArgs) => Promise<void>;
  reset: () => void;
}

// ── Helper: detect operator from phone number ────────────────────────────────
const MTN_PREFIXES    = ['650','651','652','653','654','680','681','682','683','684','677','676','671','672','673','674','675'];
const ORANGE_PREFIXES = ['655','656','657','658','659','699','698','697','690','691','692','693','694','695','696'];

export function detectOperator(phone: string): 'mtn' | 'orange' | null {
  const digits = phone.replace(/\D/g, '');
  const local   = digits.startsWith('237') ? digits.slice(3) : digits;
  const prefix  = local.slice(0, 3);
  if (MTN_PREFIXES.includes(prefix))    return 'mtn';
  if (ORANGE_PREFIXES.includes(prefix)) return 'orange';
  return null;
}

/** Normalize phone: strips non-digits, adds 237 prefix if missing */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  return digits.startsWith('237') ? digits : `237${digits}`;
}

/** Validate a Cameroonian phone number */
export function validateCamPhone(raw: string): string | null {
  const normalized = normalizePhone(raw);
  if (normalized.length !== 12) return 'Please enter a valid 9-digit Cameroonian number';
  if (!detectOperator(normalized)) return 'Please enter a valid MTN or Orange number';
  return null;
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useCamPay({
  onSuccess,
  onFailure,
  pollIntervalMs  = 3000,
  maxPollAttempts = 40,   // 40 × 3 s = 2 minutes
}: UseCamPayOptions = {}): UseCamPayResult {

  const [status,    setStatus]    = useState<PaymentStatus>('idle');
  const [errorMsg,  setErrorMsg]  = useState('');
  const [reference, setReference] = useState('');
  const [countdown, setCountdown] = useState(0);

  const pollTimer     = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownTimer= useRef<ReturnType<typeof setInterval> | null>(null);
  const attempts      = useRef(0);

  // ── Cleanup timers ────────────────────────────────────────────────────────
  const clearTimers = useCallback(() => {
    if (pollTimer.current)      { clearInterval(pollTimer.current);      pollTimer.current = null; }
    if (countdownTimer.current) { clearInterval(countdownTimer.current); countdownTimer.current = null; }
  }, []);

  // ── Reset to idle ─────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    clearTimers();
    setStatus('idle');
    setErrorMsg('');
    setReference('');
    setCountdown(0);
    attempts.current = 0;
  }, [clearTimers]);

  // ── Poll transaction status ───────────────────────────────────────────────
  const startPolling = useCallback((ref: string) => {
    attempts.current = 0;

    pollTimer.current = setInterval(async () => {
      attempts.current += 1;

      if (attempts.current > maxPollAttempts) {
        clearTimers();
        setStatus('timeout');
        const msg = 'Payment timed out. If you approved the request, it will be confirmed shortly — check your email/SMS for confirmation.';
        setErrorMsg(msg);
        onFailure?.(msg);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('campay-status', {
          body: { reference: ref },
        });

        if (error) return; // network hiccup — keep polling

        const txStatus = (data?.status ?? '').toUpperCase();

        if (txStatus === 'SUCCESSFUL') {
          clearTimers();
          setStatus('success');
          await onSuccess?.(ref, data as Record<string, unknown>);
        } else if (txStatus === 'FAILED') {
          clearTimers();
          setStatus('failed');
          const msg = data?.message || 'Payment was declined. Please check your balance and try again.';
          setErrorMsg(msg);
          onFailure?.(msg);
        }
        // PENDING → keep polling
      } catch {
        // transient error — keep polling
      }
    }, pollIntervalMs);
  }, [maxPollAttempts, pollIntervalMs, onSuccess, onFailure, clearTimers]);

  // ── Initiate payment ──────────────────────────────────────────────────────
  const initPayment = useCallback(async ({
    amount,
    phone,
    description,
    externalRef,
    metadata,
  }: InitPaymentArgs) => {
    clearTimers();
    setErrorMsg('');
    setStatus('submitting');

    const fullPhone = normalizePhone(phone);

    try {
      const { data, error } = await supabase.functions.invoke('campay-collect', {
        body: {
          amount:             String(amount),
          currency:           'XAF',
          from:               fullPhone,
          description,
          external_reference: externalRef ?? `bambeh_${Date.now()}`,
          metadata,
        },
      });

      if (error) throw new Error(error.message || 'Payment initiation failed');
      if (data?.error) throw new Error(data.error);

      if (!data?.reference) {
        throw new Error(data?.message || 'No payment reference returned. Please try again.');
      }

      setReference(data.reference);
      setStatus('waiting');

      // Countdown display: 2 minutes
      const totalSeconds = maxPollAttempts * (pollIntervalMs / 1000);
      setCountdown(totalSeconds);
      countdownTimer.current = setInterval(() => {
        setCountdown(c => {
          if (c <= 1) { clearInterval(countdownTimer.current!); return 0; }
          return c - 1;
        });
      }, 1000);

      startPolling(data.reference);

    } catch (err: unknown) {
      clearTimers();
      setStatus('failed');
      const msg = err instanceof Error
        ? friendlyError(err.message)
        : 'Payment failed. Please try again.';
      setErrorMsg(msg);
      onFailure?.(msg);
    }
  }, [clearTimers, maxPollAttempts, pollIntervalMs, onFailure, startPolling]);

  return { status, errorMsg, reference, countdown, initPayment, reset };
}

// ── Friendly error messages ───────────────────────────────────────────────────
function friendlyError(raw: string): string {
  const msg = raw.toLowerCase();
  if (msg.includes('failed to fetch') || msg.includes('network') || msg.includes('fetch')) {
    return 'Connection error. Please check your internet and try again.';
  }
  if (msg.includes('insufficient')) return 'Insufficient funds. Please top up your Mobile Money account and try again.';
  if (msg.includes('timeout'))      return 'The request timed out. Check your connection and try again.';
  if (msg.includes('invalid'))      return 'Invalid phone number. Please enter a valid MTN or Orange number.';
  return raw || 'Payment could not be processed. Please try again.';
}
