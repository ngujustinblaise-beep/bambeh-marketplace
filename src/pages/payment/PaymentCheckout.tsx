// @ts-nocheck
import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  initializePayment,
  generateReference,
} from "../../services/payment/notchpayService";

const PaymentCheckout: React.FC = () => {
  const navigate = useNavigate();
  const [params]  = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const amount      = Number(params.get("amount") ?? 0);
  const description = params.get("description") ?? "Bambeh Payment";
  const email       = params.get("email") ?? "";

  const handlePay = async () => {
    setLoading(true);
    setError(null);
    try {
      const ref     = generateReference("BM");
      const { url } = await initializePayment({
        amount,
        currency:    "XAF",
        reference:   ref,
        description,
        customer:    { email },
        callbackUrl: `${window.location.origin}/#/payment/callback`,
        returnUrl:   `${window.location.origin}/#/payment/callback`,
      });
      window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment initiation failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full">
        <h1 className="text-xl font-bold mb-6">Complete Payment</h1>
        <div className="mb-6 space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Description</span>
            <span className="font-medium">{description}</span>
          </div>
          <div className="flex justify-between">
            <span>Amount</span>
            <span className="font-bold text-teal-600">
              {amount.toLocaleString()} XAF
            </span>
          </div>
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button onClick={handlePay} disabled={loading || !amount}
          className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50
            text-white font-semibold py-3 rounded-xl">
          {loading ? "Redirecting…" : "Pay with NotchPay"}
        </button>
        <button onClick={() => navigate(-1)}
          className="w-full mt-3 text-gray-500 hover:text-gray-700 text-sm">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PaymentCheckout;
