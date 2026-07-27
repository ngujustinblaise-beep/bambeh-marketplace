/**
 * CamPayWidget.tsx — Bambeh Marketplace
 * FILE LOCATION: src/components/payment/CamPayWidget.tsx
 *
 * BAMBEH_DEPLOY_TOKEN__CAMPAYWIDGET_FIX201_START
 *
 * FIX201 — CART MODE. initCartPayment is no longer dead code.
 *
 * Before: this widget only ever called initPayment() → /collect, a bare
 * CamPay charge with NO order, NO seller_id and NO payout. Money was taken
 * and nothing else happened.
 *
 * Now: pass `cartItems` + `accessToken` and it calls initCartPayment() →
 * /cart, the order-first pipeline. The server verifies prices, reserves
 * stock, creates one order per seller with seller_id set, charges CamPay
 * once, and the webhook settles + disburses.
 *
 * TWO MODES
 *   Simple  (subscriptions, coins, donations) — unchanged, pass `amount`.
 *   Cart    (marketplace, escrow)             — pass cartItems + accessToken.
 *                                               `amount` is display-only.
 *
 * onSuccess now receives the SERVER-CREATED order id, so the page must not
 * insert an order itself.
 */

import { useState } from 'react';
import {
  Phone, Loader2, CheckCircle, AlertCircle,
  Clock, Shield, RefreshCw, ShoppingCart,
} from 'lucide-react';
import {
  useCamPay, validateCamPhone, normalizePhone, detectOperator,
  type CartCheckoutItem, type PaymentSuccessInfo,
} from '@/hooks/useCamPay';

interface CamPayWidgetProps {
  /** XAF. In cart mode this is DISPLAY ONLY — the server prices the cart. */
  amount: number;
  description: string;
  externalRef?: string;
  metadata?: Record<string, unknown>;

  /** CART MODE: supply both to use the order-first pipeline. */
  cartItems?: CartCheckoutItem[];
  accessToken?: string | null;
  /** true/omitted = hold in escrow. false = pay the seller on confirmation. */
  escrow?: boolean;

  onSuccess?: (reference: string, info?: PaymentSuccessInfo) => void | Promise<void>;
  onFailure?: (message: string) => void;
  successNode?: React.ReactNode;
  showBadge?: boolean;
  buttonLabel?: string;
  buttonClass?: string;
}

export default function CamPayWidget({
  amount,
  description,
  externalRef,
  metadata,
  cartItems,
  accessToken,
  escrow,
  onSuccess,
  onFailure,
  successNode,
  showBadge = true,
  buttonLabel,
  buttonClass = 'bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800',
}: CamPayWidgetProps) {
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const {
    status, errorMsg, reference, countdown,
    initPayment, initCartPayment, reset,
  } = useCamPay({
    onSuccess: async (ref, info) => { await onSuccess?.(ref, info); },
    onFailure,
  });

  /* Cart mode is active only when we have BOTH items and a session token. */
  const isCartMode = Array.isArray(cartItems) && cartItems.length > 0 && !!accessToken;

  const operator     = phone.length >= 3 ? detectOperator(normalizePhone(phone)) : null;
  const isSubmitting = status === 'submitting';
  const isWaiting    = status === 'waiting';
  const isSuccess    = status === 'success';
  const isFailed     = status === 'failed' || status === 'timeout';

  function handlePhoneChange(v: string) {
    setPhone(v.replace(/\D/g, '').slice(0, 9));
    setPhoneError(null);
  }

  async function handlePay() {
    const err = validateCamPhone(phone);
    if (err) { setPhoneError(err); return; }

    if (isCartMode) {
      await initCartPayment({
        items: cartItems!,
        phone,
        description,
        accessToken: accessToken!,
        ...(escrow === false ? { escrow: false } : {}),
      });
      return;
    }

    // A cart was passed but the session is missing — never silently fall back
    // to the amount-based collect, which would skip the order entirely.
    if (Array.isArray(cartItems) && cartItems.length > 0 && !accessToken) {
      setPhoneError('Your session expired. Please sign in again to complete checkout.');
      return;
    }

    await initPayment({ amount, phone, description, externalRef, metadata });
  }

  /* ── SUCCESS ───────────────────────────────────────────────────────────── */
  if (isSuccess) {
    if (successNode) return <>{successNode}</>;
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
          <CheckCircle className="h-9 w-9 text-green-500" />
        </div>
        <h3 className="mb-1 text-lg font-bold text-gray-900">Payment Successful!</h3>
        <p className="mb-2 text-sm text-gray-500">
          Reference: <span className="font-mono text-xs">{reference}</span>
        </p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    );
  }

  /* ── WAITING FOR USSD ──────────────────────────────────────────────────── */
  if (isWaiting) {
    return (
      <div className="flex flex-col items-center px-4 py-8 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
          <Loader2 className="h-9 w-9 animate-spin text-amber-500" />
        </div>
        <h3 className="mb-2 text-lg font-bold text-gray-900">
          {operator === 'mtn' ? '📱 Check your MTN phone' : '📱 Check your Orange phone'}
        </h3>
        <p className="mb-4 max-w-xs text-sm text-gray-600">
          A payment request of <strong>{amount.toLocaleString()} XAF</strong> has been sent to{' '}
          <strong>+237 {phone}</strong>. Approve it with your PIN.
        </p>

        <div className="mb-4 w-full max-w-xs space-y-1.5 rounded-2xl bg-gray-50 p-4 text-left">
          <p className="text-xs font-semibold text-gray-700">
            {operator === 'mtn' ? 'MTN MoMo steps:' : 'Orange Money steps:'}
          </p>
          <p className="text-xs text-gray-500">1. A USSD prompt appears on your screen</p>
          <p className="text-xs text-gray-500">2. Enter your {operator === 'mtn' ? 'MoMo' : 'Orange Money'} PIN</p>
          <p className="text-xs text-gray-500">3. You'll get an SMS confirmation</p>
          <p className="text-xs text-gray-500">4. This page updates automatically ✓</p>
        </div>

        <div className="mb-5 flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-600">
          <Clock className="h-4 w-4 flex-shrink-0" />
          {countdown > 0
            ? `Waiting… ${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, '0')} remaining`
            : 'Processing…'}
        </div>

        <button onClick={reset} className="text-sm text-gray-500 underline hover:text-gray-700">
          Cancel &amp; try again
        </button>
      </div>
    );
  }

  /* ── IDLE / FAILED ─────────────────────────────────────────────────────── */
  return (
    <div className="space-y-4">
      {isFailed && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
          <div className="flex-1">
            <p className="mb-0.5 text-sm font-semibold text-red-700">
              {status === 'timeout' ? 'Payment timed out' : 'Payment failed'}
            </p>
            <p className="text-xs text-red-600">{errorMsg}</p>
            <button onClick={reset} className="mt-2 flex items-center gap-1 text-xs font-bold text-red-700 underline">
              <RefreshCw className="h-3 w-3" /> Try again
            </button>
            <p className="mt-2 text-xs text-gray-400">
              If money was deducted and access wasn't granted, email{' '}
              <a href="mailto:support@bambeh.com" className="text-teal-600 underline">
                support@bambeh.com
              </a>{' '}
              with your phone number and we'll fix it within 1 hour.
            </p>
          </div>
        </div>
      )}

      {isCartMode && (
        <div className="flex items-center gap-2 rounded-xl bg-teal-50 px-3 py-2 text-xs text-teal-800">
          <ShoppingCart className="h-3.5 w-3.5 flex-shrink-0" />
          <span>
            {cartItems!.length} item{cartItems!.length === 1 ? '' : 's'} · prices confirmed on our
            server before you are charged
          </span>
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-gray-700">
          <Phone className="mr-1 -mt-0.5 inline h-4 w-4" />
          MTN or Orange Money number
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 select-none text-sm font-semibold text-gray-500">
            +237
          </span>
          <input
            type="tel"
            value={phone}
            onChange={e => handlePhoneChange(e.target.value)}
            placeholder="6XXXXXXXX"
            maxLength={9}
            disabled={isSubmitting}
            className={`w-full rounded-xl border-2 py-3 pl-14 pr-14 text-sm transition-all focus:outline-none disabled:bg-gray-50 ${
              operator === 'mtn'
                ? 'border-yellow-400 bg-yellow-50 focus:border-yellow-500'
                : operator === 'orange'
                ? 'border-orange-400 bg-orange-50 focus:border-orange-500'
                : phoneError
                ? 'border-red-300 focus:border-red-400'
                : 'border-gray-200 focus:border-teal-500'
            }`}
          />
          {operator && (
            <span className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-2 py-0.5 text-xs font-bold ${
              operator === 'mtn' ? 'bg-yellow-100 text-yellow-800' : 'bg-orange-100 text-orange-800'
            }`}>
              {operator === 'mtn' ? '📶 MTN' : '🟠 Orange'}
            </span>
          )}
        </div>
        {phoneError && <p className="mt-1 text-xs text-red-500">{phoneError}</p>}
        <p className="mt-1 text-xs text-gray-400">
          A payment prompt will be sent to this number. Approve it on your phone.
        </p>
      </div>

      <button
        onClick={handlePay}
        disabled={isSubmitting || phone.length < 9}
        className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-50 ${buttonClass}`}
      >
        {isSubmitting ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Sending request…</>
        ) : (
          buttonLabel ?? `Pay ${amount.toLocaleString()} XAF`
        )}
      </button>

      {showBadge && (
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
          <Shield className="h-3.5 w-3.5" />
          Secured by CamPay · BAMBEH SARL · support@bambeh.com
        </div>
      )}
    </div>
  );
}
// BAMBEH_END_TOKEN__CAMPAYWIDGET_FIX201__COMPLETE
