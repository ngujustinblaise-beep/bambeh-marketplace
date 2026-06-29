/**
 * src/pages/payment/PaymentSuccess.tsx
 * Shown after a successful payment verification.
 */

import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle2, Receipt, ShoppingBag, Home } from 'lucide-react';
import { formatXAF } from '@/services/payment/taxCalculator';
import { useLang, t } from "@/hooks/useAppLang";

const PaymentSuccess: React.FC = () => {
  const { state } = useLocation();
  const reference = (state as any)?.reference || '�';
  const amount    = (state as any)?.amount    || 0;
  const paidAt    = (state as any)?.paidAt    || new Date().toISOString();

  const formattedDate = new Date(paidAt).toLocaleString('fr-CM', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-md w-full text-center">

        {/* Success animation */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-14 h-14 text-green-500" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful! ??</h1>
        <p className="text-gray-500 mb-8">
          Your payment has been confirmed. The seller has been notified.
        </p>

        {/* Receipt */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 text-left space-y-3">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <Receipt className="w-4 h-4 text-teal-600" />
            Receipt
          </h2>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Reference</span>
            <span className="font-mono text-xs font-medium text-gray-800">{reference}</span>
          </div>
          {amount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Amount paid</span>
              <span className="font-bold text-teal-700">{formatXAF(amount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Date & Time</span>
            <span className="text-gray-700">{formattedDate}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Status</span>
            <span className="flex items-center gap-1 text-green-600 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Complete
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/orders"
      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            View My Orders
          </Link>
          <Link
            to="/"
      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          A confirmation has been sent to your email. Keep your reference number safe.
        </p>
      </div>
    </div>
  );

}
export default PaymentSuccess;





