/**
 * CamPayWidget.tsx  â€”  Bambeh Marketplace
 * FILE LOCATION: src/components/payment/CamPayWidget.tsx
 *
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 *  REUSABLE CAMPAY PAYMENT UI COMPONENT
 *  Drop this into any page that needs to collect mobile money.
 *  It handles:
 *    â€¢ Phone number input + operator auto-detection
 *    â€¢ Initiating payment via useCamPay hook
 *    â€¢ Waiting / countdown screen
 *    â€¢ Success / failure screens
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 *
 * USAGE:
 *  <CamPayWidget
 *    amount={500}
 *    description="Daily Plan â€” Bambeh Subscription"
 *    onSuccess={(ref) => activatePlan(ref)}
 *  />
 */

import { useState } from 'react';
import {
  Phone, Loader2, CheckCircle, AlertCircle,
  Clock, Shield, RefreshCw
} from 'lucide-react';
import { useCamPay, validateCamPhone, normalizePhone, detectOperator } from '@/hooks/useCamPay';

// â”€â”€ Props â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface CamPayWidgetProps {
  amount: number;                   // XAF amount to collect
  description: string;              // shown on USSD prompt and in receipts
  externalRef?: string;             // your order/subscription ID
  metadata?: Record<string, unknown>;
  onSuccess?: (reference: string) => void | Promise<void>;
  onFailure?: (message: string) => void;
  /** Override the success screen â€” show your own UI after payment */
  successNode?: React.ReactNode;
  /** Show "Secured by CamPay" badge at the bottom? Default true */
  showBadge?: boolean;
  /** Button label override. Default "Pay {amount} XAF" */
  buttonLabel?: string;
  /** Tailwind class for the pay button. Default: teal gradient */
  buttonClass?: string;
}

// â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function CamPayWidget({
  amount,
  description,
  externalRef,
  metadata,
  onSuccess,
  onFailure,
  successNode,
  showBadge = true,
  buttonLabel,
  buttonClass = 'bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800',
}: CamPayWidgetProps) {
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const { status, errorMsg, reference, countdown, initPayment, reset } = useCamPay({
    onSuccess: async (ref, _data) => { await onSuccess?.(ref); },
    onFailure: onFailure,
  });

  const operator    = phone.length >= 3 ? detectOperator(normalizePhone(phone)) : null;
  const isSubmitting = status === 'submitting';
  const isWaiting    = status === 'waiting';
  const isSuccess    = status === 'success';
  const isFailed     = status === 'failed' || status === 'timeout';

  function handlePhoneChange(v: string) {
    // Accept digits only, max 9
    const digits = v.replace(/\D/g, '').slice(0, 9);
    setPhone(digits);
    setPhoneError(null);
  }

  async function handlePay() {
    const err = validateCamPhone(phone);
    if (err) { setPhoneError(err); return; }

    await initPayment({
      amount,
      phone,
      description,
      externalRef,
      metadata,
    });
  }

  // â”€â”€ SUCCESS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (isSuccess) {
    if (successNode) return <>{successNode}</>;
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-9 h-9 text-green-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Payment Successful!</h3>
        <p className="text-sm text-gray-500 mb-2">Reference: <span className="font-mono text-xs">{reference}</span></p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    );
  }

  // â”€â”€ WAITING FOR USSD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (isWaiting) {
    return (
      <div className="flex flex-col items-center py-8 text-center px-4">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4">
          <Loader2 className="w-9 h-9 text-amber-500 animate-spin" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          {operator === 'mtn' ? 'ðŸ“± Check your MTN phone' : 'ðŸ“± Check your Orange phone'}
        </h3>
        <p className="text-sm text-gray-600 mb-4 max-w-xs">
          A payment request of <strong>{amount.toLocaleString()} XAF</strong> has been sent to <strong>+237 {phone}</strong>. Approve it with your PIN.
        </p>

        {/* Steps */}
        <div className="bg-gray-50 rounded-2xl p-4 text-left w-full max-w-xs mb-4 space-y-1.5">
          <p className="text-xs font-semibold text-gray-700">
            {operator === 'mtn' ? 'MTN MoMo steps:' : 'Orange Money steps:'}
          </p>
          <p className="text-xs text-gray-500">1. A USSD prompt appears on your screen</p>
          <p className="text-xs text-gray-500">2. Enter your {operator === 'mtn' ? 'MoMo' : 'Orange Money'} PIN</p>
          <p className="text-xs text-gray-500">3. You'll get an SMS confirmation</p>
          <p className="text-xs text-gray-500">4. This page updates automatically âœ“</p>
        </div>

        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 rounded-xl px-4 py-2.5 mb-5 text-sm font-semibold">
          <Clock className="w-4 h-4 flex-shrink-0" />
          {countdown > 0
            ? `Waitingâ€¦ ${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, '0')} remaining`
            : 'Processingâ€¦'}
        </div>

        <button
          onClick={reset}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Cancel &amp; try again
        </button>
      </div>
    );
  }

  // â”€â”€ IDLE / FAILED â€” MAIN FORM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div className="space-y-4">
      {/* Error banner */}
      {isFailed && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-700 mb-0.5">
              {status === 'timeout' ? 'Payment timed out' : 'Payment failed'}
            </p>
            <p className="text-xs text-red-600">{errorMsg}</p>
            <button
              onClick={reset}
              className="mt-2 flex items-center gap-1 text-xs text-red-700 font-bold underline"
            >
              <RefreshCw className="w-3 h-3" /> Try again
            </button>
            <p className="text-xs text-gray-400 mt-2">
              If money was deducted and access wasn't granted, email{' '}
              <a href="mailto:support@bambeh.com" className="text-teal-600 underline">
                support@bambeh.com
              </a>{' '}
              with your phone number and we'll fix it within 1 hour.
            </p>
          </div>
        </div>
      )}

      {/* Phone input */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          <Phone className="inline w-4 h-4 mr-1 -mt-0.5" />
          MTN or Orange Money number
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500 select-none">
            +237
          </span>
          <input
            type="tel"
            value={phone}
            onChange={e => handlePhoneChange(e.target.value)}
            placeholder="6XXXXXXXX"
            maxLength={9}
            disabled={isSubmitting}
            className={`w-full pl-14 pr-14 py-3 border-2 rounded-xl text-sm focus:outline-none transition-all disabled:bg-gray-50 ${
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
            <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold px-2 py-0.5 rounded-full ${
              operator === 'mtn'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-orange-100 text-orange-800'
            }`}>
              {operator === 'mtn' ? 'ðŸ“¶ MTN' : 'ðŸŸ  Orange'}
            </span>
          )}
        </div>
        {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
        <p className="text-xs text-gray-400 mt-1">
          A payment prompt will be sent to this number. Approve it on your phone.
        </p>
      </div>

      {/* Pay button */}
      <button
        onClick={handlePay}
        disabled={isSubmitting || phone.length < 9}
        className={`w-full text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${buttonClass}`}
      >
        {isSubmitting ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Sending requestâ€¦</>
        ) : (
          buttonLabel ?? `Pay ${amount.toLocaleString()} XAF`
        )}
      </button>

      {/* Security badge */}
      {showBadge && (
        <div className="flex items-center justify-center gap-2 text-gray-400 text-xs">
          <Shield className="w-3.5 h-3.5" />
          Secured by CamPay Â· BAMBEH SARL Â· support@bambeh.com
        </div>
      )}
    </div>
  );
}




