import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useLang, t } from "@/hooks/useAppLang";

const PaymentPending: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [seconds, setSeconds] = useState(0);
  const reference = searchParams.get("reference") ?? "N/A";

  useEffect(() => {
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const dots = ".".repeat((seconds % 3) + 1);
  const elapsed =
    Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2, "0");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50 px-4 py-12">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
        <div className="text-6xl mb-6 animate-pulse">⏳</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Pending{dots}
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Your payment via MTN Mobile Money / Orange Money is being processed.
          <strong> Do not close this page.</strong>
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-left">
          <p className="text-xs text-yellow-700 font-semibold mb-1">
            Reference
          </p>
          <p className="text-sm font-mono text-yellow-900">{reference}</p>
        </div>
        <p className="text-xs text-gray-400 mb-4">Elapsed: {elapsed}</p>
        <div className="space-y-2 text-xs text-gray-400">
          <p>Check your phone for a pending USSD or push notification</p>
          <p>If nothing happens in 10 minutes, the payment will be cancelled</p>
        </div>
      </div>
    </div>
  );

}
export default PaymentPending;


