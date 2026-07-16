/**
 * useCamPay.ts — Payment Hook for Frontend
 * Bambeh SARL · https://bambeh.com
 *
 * Hardened features:
 *  - Request timeout (30 s) + AbortController cleanup on unmount
 *  - Automatic retry with exponential back-off (handles Render cold-starts)
 *  - Strict HTTP error handling (4xx / 5xx surfaces server message)
 *  - Client-generated reference for both pay() and donate()
 *  - Async status polling for CamPay confirmation (mobile money is async)
 *  - Typed error codes for UI-level branching
 */

import { useState, useRef, useCallback, useEffect } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────

const PAYMENT_SERVER = 'https://bambeh-payment-server.onrender.com';

/** Render free tier can cold-start; retry up to 3 times with back-off. */
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 1_500; // 1.5 s, doubles each attempt

/** Abort a single fetch after this many ms (covers slow Render wake-ups). */
const REQUEST_TIMEOUT_MS = 30_000;

/** Poll for payment confirmation every N ms, up to POLL_MAX_ATTEMPTS times. */
const POLL_INTERVAL_MS = 4_000;
const POLL_MAX_ATTEMPTS = 15; // 60 s total window

// ─── Types ────────────────────────────────────────────────────────────────────

export type PaymentStatus =
  | 'idle'
  | 'initiating'
  | 'pending'       // initiation succeeded; waiting for mobile-money confirmation
  | 'confirmed'     // CamPay confirmed the transaction
  | 'failed'
  | 'timeout';      // polling window exhausted without confirmation

export type PaymentErrorCode =
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR'
  | 'VALIDATION_ERROR'
  | 'TIMEOUT'
  | 'UNKNOWN';

export interface PaymentBreakdown {
  subtotal: number;
  appFee: number;
  govTax: number;
  total: number;
}

export interface PaymentResult {
  success: boolean;
  reference?: string;
  status?: PaymentStatus;
  error?: string;
  errorCode?: PaymentErrorCode;
  breakdown?: PaymentBreakdown;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateRef(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `BEH-${ts}-${rand}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch with a per-request AbortController timeout.
 * Passes an external signal too (for component-unmount cleanup).
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  externalSignal?: AbortSignal,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  // Propagate external abort (e.g. component unmounted)
  externalSignal?.addEventListener('abort', () => controller.abort());

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * POST with retry + exponential back-off.
 * Retries on network errors and 5xx responses (not 4xx — those are client errors).
 */
async function postWithRetry(
  url: string,
  body: Record<string, unknown>,
  externalSignal?: AbortSignal,
): Promise<unknown> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    if (externalSignal?.aborted) throw new DOMException('Aborted', 'AbortError');

    try {
      const res = await fetchWithTimeout(
        url,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        },
        externalSignal,
      );

      // 4xx → client error, no retry
      if (res.status >= 400 && res.status < 500) {
        const payload = await res.json().catch(() => ({}));
        const message = (payload as any)?.error ?? `HTTP ${res.status}`;
        const code: PaymentErrorCode =
          res.status === 422 || res.status === 400 ? 'VALIDATION_ERROR' : 'SERVER_ERROR';
        const err = Object.assign(new Error(message), { code });
        throw err;
      }

      // 5xx → server error, retry
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error((payload as any)?.error ?? `HTTP ${res.status}`);
      }

      return await res.json();
    } catch (err: any) {
      if (err.name === 'AbortError') throw err;           // never retry aborts
      if (err.code === 'VALIDATION_ERROR') throw err;    // never retry 4xx
      lastError = err;

      if (attempt < MAX_RETRIES - 1) {
        const delay = RETRY_BASE_DELAY_MS * 2 ** attempt;
        await sleep(delay);
      }
    }
  }

  throw lastError ?? new Error('Request failed after retries');
}

/**
 * Poll the server for CamPay confirmation of a given reference.
 * Resolves once confirmed, or rejects after the polling window.
 */
async function pollForConfirmation(
  reference: string,
  onStatusChange: (s: PaymentStatus) => void,
  externalSignal?: AbortSignal,
): Promise<PaymentResult> {
  for (let i = 0; i < POLL_MAX_ATTEMPTS; i++) {
    if (externalSignal?.aborted) {
      return { success: false, error: 'Cancelled', errorCode: 'UNKNOWN' };
    }

    await sleep(POLL_INTERVAL_MS);

    try {
      const res = await fetchWithTimeout(
        `${PAYMENT_SERVER}/api/payments/status/${encodeURIComponent(reference)}`,
        { method: 'GET' },
        externalSignal,
      );

      if (!res.ok) continue; // transient server error; keep polling

      const data = (await res.json()) as any;

      if (data?.status === 'SUCCESSFUL' || data?.confirmed === true) {
        onStatusChange('confirmed');
        return { success: true, reference, status: 'confirmed', breakdown: data.breakdown };
      }

      if (data?.status === 'FAILED') {
        onStatusChange('failed');
        return {
          success: false,
          reference,
          status: 'failed',
          error: data.error ?? 'Payment was declined',
          errorCode: 'SERVER_ERROR',
        };
      }

      // Still pending — keep polling
      onStatusChange('pending');
    } catch {
      // Network hiccup during poll — keep going
    }
  }

  onStatusChange('timeout');
  return {
    success: false,
    reference,
    status: 'timeout',
    error: 'Payment confirmation timed out. Check your Mobile Money for the deduction.',
    errorCode: 'TIMEOUT',
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCamPay() {
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<PaymentErrorCode | null>(null);

  // AbortController persists across renders; aborted on unmount
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      // Cancel any in-flight request when the component using this hook unmounts
      abortRef.current?.abort();
    };
  }, []);

  function getSignal(): AbortSignal {
    abortRef.current?.abort(); // cancel any prior request
    const controller = new AbortController();
    abortRef.current = controller;
    return controller.signal;
  }

  function handleError(err: any): PaymentResult {
    const message: string = err?.message ?? 'An unexpected error occurred';
    const code: PaymentErrorCode =
      err?.code in ['VALIDATION_ERROR', 'SERVER_ERROR', 'TIMEOUT']
        ? err.code
        : err?.name === 'AbortError'
        ? 'UNKNOWN'
        : 'NETWORK_ERROR';

    setError(message);
    setErrorCode(code);
    setStatus('failed');
    return { success: false, error: message, errorCode: code, status: 'failed' };
  }

  /** Initiate a product/service payment. Returns after CamPay confirmation (or timeout). */
  const pay = useCallback(
    async (amount: number, phone: string, description: string): Promise<PaymentResult> => {
      setStatus('initiating');
      setError(null);
      setErrorCode(null);

      const signal = getSignal();
      const reference = generateRef();

      try {
        const data = (await postWithRetry(
          `${PAYMENT_SERVER}/api/payments/pay`,
          { amount, phone, description, ref: reference },
          signal,
        )) as any;

        if (!data?.success) {
          return handleError(new Error(data?.error ?? 'Initiation failed'));
        }

        // Initiation OK — now wait for mobile-money confirmation
        setStatus('pending');
        return await pollForConfirmation(
          data.reference ?? reference,
          setStatus,
          signal,
        );
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          setStatus('idle');
          return { success: false, error: 'Cancelled', errorCode: 'UNKNOWN' };
        }
        return handleError(err);
      }
    },
    [],
  );

  /** Initiate a donation. Returns after CamPay confirmation (or timeout). */
  const donate = useCallback(
    async (amount: number, phone: string): Promise<PaymentResult> => {
      setStatus('initiating');
      setError(null);
      setErrorCode(null);

      const signal = getSignal();
      const reference = generateRef();

      try {
        const data = (await postWithRetry(
          `${PAYMENT_SERVER}/api/payments/donate`,
          { amount, phone, ref: reference },
          signal,
        )) as any;

        if (!data?.success) {
          return handleError(new Error(data?.error ?? 'Donation initiation failed'));
        }

        setStatus('pending');
        return await pollForConfirmation(
          data.reference ?? reference,
          setStatus,
          signal,
        );
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          setStatus('idle');
          return { success: false, error: 'Cancelled', errorCode: 'UNKNOWN' };
        }
        return handleError(err);
      }
    },
    [],
  );

  /** Cancel any in-flight payment request. */
  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setStatus('idle');
    setError(null);
    setErrorCode(null);
  }, []);

  return {
    pay,
    donate,
    cancel,
    status,
    error,
    errorCode,
    /** Convenience booleans for UI binding */
    loading: status === 'initiating' || status === 'pending',
    isConfirmed: status === 'confirmed',
    isFailed: status === 'failed' || status === 'timeout',
  };
}
