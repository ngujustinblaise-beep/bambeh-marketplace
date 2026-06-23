/**
 * src/hooks/useCamPay.ts — Bambeh Marketplace
 * FILE LOCATION: src/hooks/useCamPay.ts
 */

import { useState, useRef, useCallback } from 'react';

const BACKEND = import.meta.env.VITE_BACKEND_URL
  ?? 'https://bambeh-backend-production-6bca.up.railway.app';

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

  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancelledRef = useRef(false);
  const attemptRef = useRef(0);

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

  const initPayment = useCallback(async (params: InitPaymentParams) => {
    const { amount, phone, description, externalRef, metadata } = params;

    const phone9       = normalizePhone(phone);
    const phoneForApi  = `237${phone9}`;

    attemptRef.current++;
    const currentAttempt = attemptRef.current;
    setStatus('submitting');
    setErrorMsg('');
    cancelledRef.current = false;

    let ref: string;
    try {
      const res = await fetch(`${BACKEND}/api/payments/collect`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          phone:       phoneForApi,
          description,
          externalRef: externalRef ?? `BAMBEH_${Date.now()}_${Math.random().toString(36).substring(2,10)}`,
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

    if (currentAttempt !== attemptRef.current) return;

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
  }, [onSuccess, onFailure]);

  return { status, errorMsg, reference, countdown, initPayment, reset };
}

