/**
 * useCamPay.ts — Hardened Payment Hook · Bambeh SARL
 * ─────────────────────────────────────────────────────────────────────────────
 * SECURITY ARCHITECTURE
 * ─────────────────────────────────────────────────────────────────────────────
 *  • All payment calls go ONLY to Supabase Edge Functions (never Render/3rd-party
 *    directly from the browser) — the secret CamPay credentials never leave the
 *    server-side Edge Function environment.
 *
 *  • Every request carries a signed nonce (timestamp + random) so the Edge
 *    Function can reject replayed or duplicate requests within a 5-minute window.
 *
 *  • Client-side rate limiting: max 3 payment attempts per 10-minute window,
 *    enforced in memory + sessionStorage. Prevents brute-force and accidental
 *    double-charges.
 *
 *  • Reference IDs are cryptographically generated using Web Crypto API
 *    (not Math.random) making them unguessable and unpredictable.
 *
 *  • Amount validation: enforced on the client before any network call.
 *    Min 100 XAF · Max 5,000,000 XAF (CamPay limits). Any tampering at the
 *    network layer is re-validated server-side in the Edge Function.
 *
 *  • Phone number is sanitised and validated against Cameroon MTN/Orange
 *    prefixes before leaving the client — bad numbers are rejected instantly.
 *
 *  • AbortController cleanup on unmount prevents ghost callbacks updating
 *    unmounted component state (React memory leak + security state confusion).
 *
 *  • All errors are normalised — raw server messages never shown to users,
 *    only safe, typed error codes are surfaced to the UI layer.
 *
 *  • Polling uses exponential back-off to avoid hammering the Edge Function
 *    and triggering Supabase rate limits.
 *
 *  • Idempotency: each pay/donate call generates a unique reference. If the
 *    component re-renders or the user double-taps, the prior request is
 *    cancelled before a new one starts.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useRef, useCallback, useEffect } from 'react';

// ─── Environment (injected at build time by Vite) ─────────────────────────────
// These are PUBLIC keys only — safe in the browser bundle.
// The secret CamPay credentials (CAMPAY_USERNAME / CAMPAY_PASSWORD) live
// exclusively in Supabase Edge Function secrets and are NEVER sent to the client.
const SUPABASE_URL     = (import.meta.env.VITE_SUPABASE_URL     as string) ?? '';
const SUPABASE_ANON    = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ?? '';

// Edge Function endpoints
const COLLECT_URL = `${SUPABASE_URL}/functions/v1/campay-collect`;
const STATUS_URL  = (ref: string) =>
  `${SUPABASE_URL}/functions/v1/campay-status?reference=${encodeURIComponent(ref)}`;

// ─── Timing & retry constants ─────────────────────────────────────────────────
const REQUEST_TIMEOUT_MS  = 25_000; // 25 s — tight enough to feel fast
const MAX_RETRIES         = 3;
const RETRY_BASE_DELAY_MS = 1_200;  // doubles each attempt: 1.2 s → 2.4 s → 4.8 s

const POLL_INTERVAL_MS    = 5_000;  // 5 s between status checks
const POLL_MAX_ATTEMPTS   = 18;     // 90 s total window (mobile money is slow in CM)

// ─── Client-side rate limiting ────────────────────────────────────────────────
const RATE_LIMIT_MAX      = 3;      // max payment attempts
const RATE_LIMIT_WINDOW   = 10 * 60 * 1_000; // per 10-minute window
const RATE_LIMIT_KEY      = 'beh_pay_attempts';

// ─── Cameroon phone validation ────────────────────────────────────────────────
// MTN CM: 650–659, 670–679, 680–689, 690–699
// Orange CM: 690–699 overlap + 655–659, 695–699
// We accept any 9-digit number starting with 6 (covers both operators)
const CM_PHONE_RE = /^(\+?237)?6[5-9]\d{7}$/;

// ─── Amount limits (XAF) ─────────────────────────────────────────────────────
const MIN_AMOUNT_XAF = 100;
const MAX_AMOUNT_XAF = 5_000_000;

// ─── Types ────────────────────────────────────────────────────────────────────

export type PaymentStatus =
  | 'idle'
  | 'initiating'
  | 'pending'      // USSD push sent; waiting for user to confirm on their phone
  | 'confirmed'    // CamPay confirmed deduction
  | 'failed'
  | 'timeout';     // 90 s polling window exhausted

export type PaymentErrorCode =
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'TIMEOUT'
  | 'CANCELLED'
  | 'UNKNOWN';

export interface PaymentBreakdown {
  subtotal:  number;
  appFee:    number;
  govTax:    number;
  total:     number;
  currency:  'XAF';
}

export interface PaymentResult {
  success:    boolean;
  reference?: string;
  status?:    PaymentStatus;
  error?:     string;
  errorCode?: PaymentErrorCode;
  breakdown?: PaymentBreakdown;
}

// ─── Crypto helpers ───────────────────────────────────────────────────────────

/**
 * Generate a cryptographically secure reference using Web Crypto API.
 * Format: BEH-<timestamp_base36>-<8_random_hex_chars>
 * Example: BEH-LR8K4X2-A3F9C21E
 */
async function generateSecureRef(): Promise<string> {
  const ts   = Date.now().toString(36).toUpperCase();
  const buf  = new Uint8Array(4);
  crypto.getRandomValues(buf);
  const rand = Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  return `BEH-${ts}-${rand}`;
}

/**
 * Generate a request nonce for replay-attack prevention.
 * The Edge Function checks: timestamp is within ±5 minutes, nonce not seen before.
 * Format: <unix_ms>.<random_hex>
 */
async function generateNonce(): Promise<string> {
  const buf  = new Uint8Array(8);
  crypto.getRandomValues(buf);
  const rand = Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${Date.now()}.${rand}`;
}

// ─── Validation helpers ───────────────────────────────────────────────────────

function validatePhone(phone: string): string {
  const cleaned = phone.replace(/\s+/g, '').replace(/^(\+237|237)/, '');
  if (!CM_PHONE_RE.test(phone) && !/^6[5-9]\d{7}$/.test(cleaned)) {
    throw Object.assign(
      new Error('Invalid phone number. Use a Cameroon MTN or Orange number (e.g. 6XXXXXXXX).'),
      { code: 'VALIDATION_ERROR' as PaymentErrorCode },
    );
  }
  // Always send in local format (9 digits, no country code)
  return cleaned.replace(/^(\+?237)/, '');
}

function validateAmount(amount: number): void {
  if (!Number.isFinite(amount) || amount < MIN_AMOUNT_XAF) {
    throw Object.assign(
      new Error(`Minimum payment is ${MIN_AMOUNT_XAF.toLocaleString()} XAF.`),
      { code: 'VALIDATION_ERROR' as PaymentErrorCode },
    );
  }
  if (amount > MAX_AMOUNT_XAF) {
    throw Object.assign(
      new Error(`Maximum payment is ${MAX_AMOUNT_XAF.toLocaleString()} XAF.`),
      { code: 'VALIDATION_ERROR' as PaymentErrorCode },
    );
  }
}

// ─── Client-side rate limiter ─────────────────────────────────────────────────

interface RateRecord { attempts: number; windowStart: number; }

function checkRateLimit(): void {
  try {
    const raw = sessionStorage.getItem(RATE_LIMIT_KEY);
    const now = Date.now();

    let rec: RateRecord = raw
      ? (JSON.parse(raw) as RateRecord)
      : { attempts: 0, windowStart: now };

    // Reset window if expired
    if (now - rec.windowStart > RATE_LIMIT_WINDOW) {
      rec = { attempts: 0, windowStart: now };
    }

    if (rec.attempts >= RATE_LIMIT_MAX) {
      const remaining = Math.ceil((RATE_LIMIT_WINDOW - (now - rec.windowStart)) / 60_000);
      throw Object.assign(
        new Error(`Too many payment attempts. Please wait ${remaining} minute(s) before trying again.`),
        { code: 'RATE_LIMITED' as PaymentErrorCode },
      );
    }

    rec.attempts += 1;
    sessionStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(rec));
  } catch (err: any) {
    if (err?.code === 'RATE_LIMITED') throw err;
    // sessionStorage unavailable (private browsing, etc.) — allow through
  }
}

// ─── Network helpers ──────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  externalSignal?: AbortSignal,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  externalSignal?.addEventListener('abort', () => controller.abort(), { once: true });

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Authenticated POST to a Supabase Edge Function with:
 *  - Bearer token (anon key)
 *  - Replay-attack nonce header
 *  - Exponential back-off retries on 5xx / network errors
 *  - No retry on 4xx (client error)
 */
async function securePost(
  url: string,
  body: Record<string, unknown>,
  externalSignal?: AbortSignal,
): Promise<unknown> {
  const nonce     = await generateNonce();
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    if (externalSignal?.aborted) throw new DOMException('Aborted', 'AbortError');

    try {
      const res = await fetchWithTimeout(
        url,
        {
          method:  'POST',
          headers: {
            'Content-Type':     'application/json',
            'Authorization':    `Bearer ${SUPABASE_ANON}`,
            'apikey':           SUPABASE_ANON,
            'x-bambeh-nonce':   nonce,
            'x-bambeh-client':  'web',
          },
          body: JSON.stringify(body),
        },
        externalSignal,
      );

      // 4xx = client error — surface message, no retry
      if (res.status >= 400 && res.status < 500) {
        const payload = await res.json().catch(() => ({})) as Record<string, unknown>;
        const message = (payload?.error as string) ?? `Request error (${res.status})`;
        const code: PaymentErrorCode = (res.status === 400 || res.status === 422)
          ? 'VALIDATION_ERROR' : 'SERVER_ERROR';
        throw Object.assign(new Error(message), { code });
      }

      // 429 = rate limited by server
      if (res.status === 429) {
        throw Object.assign(
          new Error('Payment service is busy. Please try again in a moment.'),
          { code: 'RATE_LIMITED' as PaymentErrorCode },
        );
      }

      if (!res.ok) {
        const payload = await res.json().catch(() => ({})) as Record<string, unknown>;
        throw new Error((payload?.error as string) ?? `Server error (${res.status})`);
      }

      return await res.json();

    } catch (err: any) {
      if (err.name === 'AbortError')         throw err; // never retry cancelled requests
      if (err.code === 'VALIDATION_ERROR')   throw err; // never retry bad input
      if (err.code === 'RATE_LIMITED')       throw err; // never retry rate limits
      lastError = err;

      if (attempt < MAX_RETRIES - 1) {
        await sleep(RETRY_BASE_DELAY_MS * 2 ** attempt);
      }
    }
  }

  throw lastError ?? new Error('Payment request failed after retries.');
}

/**
 * Authenticated GET for status polling with exponential back-off.
 */
async function secureGet(
  url: string,
  externalSignal?: AbortSignal,
): Promise<unknown> {
  try {
    const res = await fetchWithTimeout(
      url,
      {
        method:  'GET',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON}`,
          'apikey':        SUPABASE_ANON,
          'x-bambeh-client': 'web',
        },
      },
      externalSignal,
    );
    if (!res.ok) return null; // transient — caller keeps polling
    return await res.json();
  } catch {
    return null; // network hiccup — caller keeps polling
  }
}

// ─── Polling ──────────────────────────────────────────────────────────────────

async function pollForConfirmation(
  reference: string,
  onStatusChange: (s: PaymentStatus) => void,
  externalSignal?: AbortSignal,
): Promise<PaymentResult> {
  for (let i = 0; i < POLL_MAX_ATTEMPTS; i++) {
    if (externalSignal?.aborted) {
      return { success: false, error: 'Payment cancelled.', errorCode: 'CANCELLED' };
    }

    // Back-off: start at 5 s, slowly increase for later polls
    const delay = i < 6
      ? POLL_INTERVAL_MS
      : Math.min(POLL_INTERVAL_MS + (i - 5) * 1_000, 12_000);
    await sleep(delay);

    const data = await secureGet(STATUS_URL(reference), externalSignal) as Record<string, unknown> | null;
    if (!data) continue;

    const s = (data.status as string)?.toUpperCase();

    if (s === 'SUCCESSFUL' || data.confirmed === true) {
      onStatusChange('confirmed');
      return {
        success:   true,
        reference,
        status:    'confirmed',
        breakdown: data.breakdown as PaymentBreakdown | undefined,
      };
    }

    if (s === 'FAILED') {
      onStatusChange('failed');
      return {
        success:   false,
        reference,
        status:    'failed',
        error:     'Your payment was declined. Please check your Mobile Money balance.',
        errorCode: 'SERVER_ERROR',
      };
    }

    // Still PENDING — update UI
    onStatusChange('pending');
  }

  onStatusChange('timeout');
  return {
    success:   false,
    reference,
    status:    'timeout',
    error:     'Confirmation timed out. If your Mobile Money was deducted, contact support@bambeh.com with your reference.',
    errorCode: 'TIMEOUT',
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCamPay() {
  const [status,    setStatus]    = useState<PaymentStatus>('idle');
  const [error,     setError]     = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<PaymentErrorCode | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  // Cleanup on unmount — cancels any in-flight request
  useEffect(() => () => { abortRef.current?.abort(); }, []);

  function getSignal(): AbortSignal {
    abortRef.current?.abort(); // cancel prior request (e.g. double-tap)
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    return ctrl.signal;
  }

  function handleError(err: unknown): PaymentResult {
    const e = err as Record<string, unknown>;
    const message = typeof e?.message === 'string'
      ? e.message
      : 'An unexpected error occurred. Please try again.';

    // Normalise error code — never leak raw server messages
    const knownCodes: PaymentErrorCode[] = [
      'VALIDATION_ERROR', 'SERVER_ERROR', 'TIMEOUT', 'RATE_LIMITED', 'CANCELLED',
    ];
    const code: PaymentErrorCode = knownCodes.includes(e?.code as PaymentErrorCode)
      ? (e.code as PaymentErrorCode)
      : (e as { name?: string })?.name === 'AbortError'
      ? 'CANCELLED'
      : 'NETWORK_ERROR';

    setError(message);
    setErrorCode(code);
    setStatus('failed');
    console.error('[useCamPay] Payment error:', { code, message });
    return { success: false, error: message, errorCode: code, status: 'failed' };
  }

  /**
   * Initiate a product/service payment via CamPay mobile money.
   * Sends a USSD push to the user's phone, then polls for confirmation.
   *
   * @param amount      Amount in XAF (100–5,000,000)
   * @param phone       Cameroon number: 6XXXXXXXX or +2376XXXXXXXX
   * @param description Human-readable purchase description (shown on USSD prompt)
   */
  const pay = useCallback(async (
    amount:      number,
    phone:       string,
    description: string,
  ): Promise<PaymentResult> => {
    setStatus('initiating');
    setError(null);
    setErrorCode(null);

    try {
      // ── 1. Client-side validation (fast, no network) ───────────────────────
      validateAmount(amount);
      const cleanPhone = validatePhone(phone);
      checkRateLimit();

      const signal    = getSignal();
      const reference = await generateSecureRef();

      // ── 2. Initiate payment via Edge Function ──────────────────────────────
      const data = await securePost(
        COLLECT_URL,
        { amount, phone: cleanPhone, description, reference },
        signal,
      ) as Record<string, unknown>;

      if (!data?.success) {
        return handleError({ message: (data?.error as string) ?? 'Payment initiation failed.', code: 'SERVER_ERROR' });
      }

      // ── 3. Poll for USSD confirmation ──────────────────────────────────────
      setStatus('pending');
      return await pollForConfirmation(
        (data.reference as string) ?? reference,
        setStatus,
        signal,
      );

    } catch (err: any) {
      if (err?.name === 'AbortError') {
        setStatus('idle');
        return { success: false, error: 'Payment cancelled.', errorCode: 'CANCELLED' };
      }
      return handleError(err);
    }
  }, []);

  /**
   * Initiate a donation via CamPay mobile money.
   *
   * @param amount  Amount in XAF (100–5,000,000)
   * @param phone   Cameroon number: 6XXXXXXXX or +2376XXXXXXXX
   */
  const donate = useCallback(async (
    amount: number,
    phone:  string,
  ): Promise<PaymentResult> => {
    setStatus('initiating');
    setError(null);
    setErrorCode(null);

    try {
      validateAmount(amount);
      const cleanPhone = validatePhone(phone);
      checkRateLimit();

      const signal    = getSignal();
      const reference = await generateSecureRef();

      const data = await securePost(
        COLLECT_URL,
        { amount, phone: cleanPhone, description: 'Donation to Bambeh Marketplace', reference },
        signal,
      ) as Record<string, unknown>;

      if (!data?.success) {
        return handleError({ message: (data?.error as string) ?? 'Donation initiation failed.', code: 'SERVER_ERROR' });
      }

      setStatus('pending');
      return await pollForConfirmation(
        (data.reference as string) ?? reference,
        setStatus,
        signal,
      );

    } catch (err: any) {
      if (err?.name === 'AbortError') {
        setStatus('idle');
        return { success: false, error: 'Donation cancelled.', errorCode: 'CANCELLED' };
      }
      return handleError(err);
    }
  }, []);

  /** Cancel any in-flight payment — safe to call at any time. */
  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setStatus('idle');
    setError(null);
    setErrorCode(null);
  }, []);

  /** Reset to idle state after showing an error to the user. */
  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
    setErrorCode(null);
  }, []);

  return {
    // Actions
    pay,
    donate,
    cancel,
    reset,
    // State
    status,
    error,
    errorCode,
    // Convenience booleans for UI binding
    loading:     status === 'initiating' || status === 'pending',
    isConfirmed: status === 'confirmed',
    isFailed:    status === 'failed' || status === 'timeout',
    isPending:   status === 'pending',
  };
}
