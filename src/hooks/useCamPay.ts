// BAMBEH_DEPLOY_TOKEN__USECAMPAY_FIX352_CLEAN
/**
 * useCamPay.ts — Bambeh Marketplace
 * FILE LOCATION: src/hooks/useCamPay.ts
 *
 * FIX201 — THE ORDER-FIRST PIPELINE, CONNECTED END TO END.
 *
 * ── BUG THIS FIXES (confirmed from the Network tab, 2026-07-27) ────────────
 * Every payment was being sent to the DEAD Railway backend:
 *   OPTIONS https://bambeh-backend-production-6bca.up.railway.app/api/payments/collect
 *   → 404, server: railway-hikari, x-railway-fallback: true
 * VITE_BACKEND_URL is still set to that host in the deployed environment, and
 * `??` only falls back when a value is undefined — so the Supabase default
 * never applied. A 404 fallback page has no CORS headers, which the browser
 * reports as "NetworkError when attempting to fetch resource".
 *
 * WHAT CHANGED
 *  1. VITE_BACKEND_URL is now VALIDATED. Only a supabase.co/functions/v1 URL
 *     is honoured; anything else (Railway, localhost, empty) is ignored and we
 *     use the real payments function. A stale env var can never again
 *     silently redirect money traffic.
 *  2. Legacy '/api/payments/...' path prefix dropped — we call /collect,
 *     /cart and /status/:ref directly.
 *  3. initCartPayment now returns the SERVER-CREATED orderId / orderGroupId
 *     and passes them to onSuccess, so the client never has to write the
 *     order itself.
 *  4. escrow is an explicit flag. Omit it and the server holds the money
 *     (safe default); pass escrow:false to pay the seller on confirmation.
 */

import { useState, useRef, useCallback } from 'react';
import { useLang } from '@/hooks/useAppLang';                    // FIX352
import { campayFailureMessage } from '@/lib/campayReasons';      // FIX352

/* ── Endpoint resolution — deliberately defensive ────────────────────────── */

const SUPABASE_PAYMENTS =
  'https://rbjbdxefwzvgmioearie.supabase.co/functions/v1/payments';

function resolveBackend(): string {
  const raw = (import.meta as { env?: Record<string, string> }).env?.VITE_BACKEND_URL;
  if (raw && /supabase\.co\/functions\/v1\//i.test(raw)) {
    return raw.replace(/\/+$/, '');
  }
  if (raw) {
    // Loud, once, so a bad override is never invisible again.
    console.warn(
      `[useCamPay] Ignoring VITE_BACKEND_URL="${raw}" — it is not a Supabase ` +
      `Edge Function URL. Using ${SUPABASE_PAYMENTS} instead.`,
    );
  }
  return SUPABASE_PAYMENTS;
}

const BACKEND = resolveBackend();

/* ── Types ───────────────────────────────────────────────────────────────── */

export type PaymentStatus = 'idle' | 'submitting' | 'waiting' | 'success' | 'failed' | 'timeout';

export interface PaymentSuccessInfo {
  reference: string;
  orderId?: string | null;
  orderGroupId?: string | null;
  raw?: unknown;
}

interface UseCamPayOptions {
  onSuccess?: (reference: string, info: PaymentSuccessInfo) => void | Promise<void>;
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
  /** Supabase session access token — checkout requires a signed-in buyer. */
  accessToken: string;
  /** true (default) = hold in escrow. false = pay the seller on confirmation. */
  escrow?: boolean;
}

/* ── Operator detection (unchanged) ──────────────────────────────────────── */

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
  if (!detectOperator(phone9)) return `"${phone9}" is not a recognized MTN or Orange number.`;
  return null;
}

/* ── Hook ────────────────────────────────────────────────────────────────── */

export function useCamPay({ onSuccess, onFailure }: UseCamPayOptions = {}) {
  // FIX352 - the buyer's own language, so a failure is readable to them.
  const lang = String(useLang() || 'en');

  const [status,    setStatus]    = useState<PaymentStatus>('idle');
  // FIX352 - the raw CamPay reason, kept so a screen can log or branch on it.
  const [failureReason, setFailureReason] = useState<string>('');
  const [errorMsg,  setErrorMsg]  = useState<string>('');
  const [reference, setReference] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(0);
  const [orderId,   setOrderId]   = useState<string | null>(null);
  const [orderGroupId, setOrderGroupId] = useState<string | null>(null);

  const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancelledRef = useRef(false);
  const attemptRef   = useRef(0);
  const orderRef     = useRef<{ orderId: string | null; orderGroupId: string | null }>({
    orderId: null, orderGroupId: null,
  });

  const clearTimers = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (pollRef.current)  clearInterval(pollRef.current);
  };

  const reset = useCallback(() => {
    cancelledRef.current = true;
    clearTimers();
    setStatus('idle');
    setErrorMsg('');
    setFailureReason('');   // FIX352
    setReference('');
    setCountdown(0);
    setOrderId(null);
    setOrderGroupId(null);
    orderRef.current = { orderId: null, orderGroupId: null };
    attemptRef.current++;
    cancelledRef.current = false;
  }, []);

  /* ── Initiation ────────────────────────────────────────────────────────── */

  /**
   * Sends the initiation request. Returns the CamPay reference plus anything
   * the server created (order ids) or throws with a readable message.
   */
  const requestInit = async (
    url: string,
    body: Record<string, unknown>,
    accessToken?: string,
  ): Promise<{ reference: string; orderId: string | null; orderGroupId: string | null }> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

    let res: Response;
    try {
      res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
    } catch {
      // Network-level failure: wrong host, offline, blocked preflight.
      throw new Error(
        `Could not reach the payment server at ${new URL(url).host}. ` +
        `Check your connection and try again.`,
      );
    }

    const payload = await res.json().catch(() => ({} as Record<string, unknown>));

    if (!res.ok) {
      const msg = (payload as { error?: string })?.error ?? `Server error ${res.status}`;
      throw new Error(msg);
    }

    const data = (payload as { data?: Record<string, unknown> })?.data ?? payload;
    const ref = (data as { reference?: string })?.reference;
    if (!ref) throw new Error('No payment reference returned by server.');

    return {
      reference: ref,
      orderId: ((data as { orderId?: string })?.orderId) ?? null,
      orderGroupId: ((data as { orderGroupId?: string })?.orderGroupId) ?? null,
    };
  };

  /* ── Polling ───────────────────────────────────────────────────────────── */

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
        const res = await fetch(`${BACKEND}/status/${ref}`);
        if (!res.ok) return;

        const body = await res.json();
        const campayStatus = String(
          (body?.data?.status ?? body?.status ?? ''),
        ).toUpperCase();

        if (currentAttempt !== attemptRef.current) { clearTimers(); return; }

        if (campayStatus === 'SUCCESSFUL') {
          clearTimers();
          if (cancelledRef.current) return;
          setStatus('success');
          await onSuccess?.(ref, {
            reference: ref,
            orderId: orderRef.current.orderId,
            orderGroupId: orderRef.current.orderGroupId,
            raw: body?.data ?? body,
          });
          return;
        }

        if (campayStatus === 'FAILED') {
          clearTimers();
          if (cancelledRef.current) return;
          // FIX352 - CamPay always sends a reason. Big's own export shows
          // 'Wrong PIN' and 'LOW_BALANCE_OR_PAYEE_LIMIT_REACHED_OR_NOT_ALLOWED'
          // - both fixable by the buyer in seconds IF we tell them. We used to
          // throw that away and print one English sentence about the balance,
          // which is wrong advice when the real problem was a mistyped PIN.
          const rawReason = String(
            body?.data?.reason ?? body?.reason ??
            body?.data?.message ?? body?.message ?? '',
          );
          const msg = campayFailureMessage(rawReason, lang);
          setStatus('failed');
          setFailureReason(rawReason);
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
        // Transient network error during poll — keep polling.
      }
    }, 8000);
  };

  const beginAttempt = (): number => {
    attemptRef.current++;
    setStatus('submitting');
    setErrorMsg('');
    cancelledRef.current = false;
    orderRef.current = { orderId: null, orderGroupId: null };
    setOrderId(null);
    setOrderGroupId(null);
    return attemptRef.current;
  };

  const failWith = (msg: string) => {
    setStatus('failed');
    setErrorMsg(msg);
    onFailure?.(msg);
  };

  /* ── Public: open-ended collect (subscriptions, coins, donations) ──────── */
  const initPayment = useCallback(async (params: InitPaymentParams) => {
    const { amount, phone, description, externalRef, metadata } = params;
    const phoneForApi = `237${normalizePhone(phone)}`;
    const currentAttempt = beginAttempt();

    let init: { reference: string; orderId: string | null; orderGroupId: string | null };
    try {
      init = await requestInit(`${BACKEND}/collect`, {
        amount,
        phone: phoneForApi,
        description,
        externalRef: externalRef ?? `BAMBEH_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
        metadata,
      });
    } catch (err: unknown) {
      failWith(err instanceof Error ? err.message : 'Failed to reach payment server.');
      return;
    }

    if (currentAttempt !== attemptRef.current) return;
    startPolling(init.reference, currentAttempt);
  }, [onSuccess, onFailure]);

  /* ── Public: ORDER-FIRST cart checkout ────────────────────────────────────
   * The server verifies prices, reserves stock, creates ONE ORDER PER SELLER
   * with seller_id set, and initiates CamPay. The client never sends an
   * amount. The signature-verified webhook flips the orders to paid and
   * (when escrow is false) disburses each seller's share.
   */
  const initCartPayment = useCallback(async (params: InitCartPaymentParams) => {
    const { items, phone, description, accessToken, escrow } = params;

    if (!accessToken) {
      failWith('Please sign in again before paying — your session has expired.');
      return;
    }
    if (!items || items.length === 0) {
      failWith('Your cart is empty.');
      return;
    }

    const phoneForApi = `237${normalizePhone(phone)}`;
    const currentAttempt = beginAttempt();

    const body: Record<string, unknown> = {
      phone: phoneForApi,
      items,
      summary: description,
    };
    // Only send the flag when explicitly set, so the server default (hold) stands.
    if (escrow === false) body.escrow = false;

    let init: { reference: string; orderId: string | null; orderGroupId: string | null };
    try {
      init = await requestInit(`${BACKEND}/cart`, body, accessToken);
    } catch (err: unknown) {
      failWith(err instanceof Error ? err.message : 'Failed to reach payment server.');
      return;
    }

    if (currentAttempt !== attemptRef.current) return;

    orderRef.current = { orderId: init.orderId, orderGroupId: init.orderGroupId };
    setOrderId(init.orderId);
    setOrderGroupId(init.orderGroupId);

    startPolling(init.reference, currentAttempt);
  }, [onSuccess, onFailure]);

  return {
    status, errorMsg, reference, countdown,
    failureReason,   // FIX352 - raw CamPay reason, for logging or branching
    orderId, orderGroupId,
    initPayment, initCartPayment, reset,
    backendUrl: BACKEND,
  };
}

// BAMBEH_END_TOKEN__USECAMPAY_FIX352__COMPLETE
