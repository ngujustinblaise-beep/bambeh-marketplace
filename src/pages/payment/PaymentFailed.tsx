/**
 * src/pages/payment/PaymentFailed.tsx
 * Shown when payment fails or is canceled.
 */

import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { XCircle, RefreshCcw, Home, HelpCircle } from 'lucide-react';
import { useLang, t } from "@/hooks/useAppLang";

const REASON_MESSAGES: Record<string, string> = {
  failed:   'Your payment could not be processed. Please check your balance and try again.',
  canceled: 'Payment was canceled. No money has been deducted.',
  pending:  'Payment is still pending. Please wait a few minutes before retrying.',
  default:  'Something went wrong with your payment. No money has been deducted.',
};

const PaymentFailed: React.FC = () => {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const reference = (state as any)?.reference || '';
  const reason    = (state as any)?.reason    || 'default';
  const message   = REASON_MESSAGES[reason] || REASON_MESSAGES.default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 py-12 px-4">
      <div className="max-w-md w-full text-center">

        {/* Error icon */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle className="w-14 h-14 text-red-500" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h1>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">{message}</p>

        {reference && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 text-sm text-left">
            <span className="text-gray-500 text-xs">Reference: </span>
            <span className="font-mono text-xs font-medium text-gray-800">{reference}</span>
            <p className="text-xs text-gray-400 mt-1">
              Save this if you need to contact support.
            </p>
          </div>
        )},
        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate(-2)} // Go back to checkout,
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white font-bold hover:from-teal-500 hover:to-teal-600 transition-all shadow-lg shadow-teal-500/20"
          >
            <RefreshCcw className="w-4 h-4" />
            Try Again
          </button>

          <Link
            to="/help/contact"
      className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
          >
            <HelpCircle className="w-4 h-4" />
            Contact Support
          </Link>

          <Link
            to="/"
      className="flex items-center justify-center gap-2 py-3 rounded-xl text-gray-500 hover:text-gray-700 text-sm transition-all"
          >
            <Home className="w-4 h-4" />
            Back to Marketplace
          </Link>
        </div>
      </div>
    </div>
  );

}
export default PaymentFailed;




