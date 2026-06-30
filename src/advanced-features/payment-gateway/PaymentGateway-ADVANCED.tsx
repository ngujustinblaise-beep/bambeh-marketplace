// @ts-nocheck
import React, { useState } from "react";
import { PaymentService } from "./PaymentService";
import type { PaymentIntent, PaymentResult } from "./PaymentService";

const service = new PaymentService();

interface PaymentGatewayProps {
  amount: number;
  currency?: string;
  userId: string;
  description?: string;
  onSuccess?: (result: PaymentResult) => void;
  onFailure?: (error: string) => void;
}

const PaymentGateway: React.FC<PaymentGatewayProps> = ({
  amount, currency = "XAF", userId, description, onSuccess, onFailure,
}) => {
  const [loading,  setLoading]  = useState(false);
  const [receipt,  setReceipt]  = useState<Record<string, unknown> | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePay = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const intent: PaymentIntent = {
        id:          `pi_${Date.now()}`,
        amount,
        currency,
        provider:    "notchpay",
        userId,
        reference:   `BM_${Date.now()}`,
        description,
      };
      const result = await service.initiate(intent);
      if (result.success) {
        const r = service.generateReceipt(result);
        setReceipt(r);
        onSuccess?.(result);
      } else {
        setErrorMsg(result.error ?? "Payment failed");
        onFailure?.(result.error ?? "Payment failed");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unexpected error";
      setErrorMsg(msg);
      onFailure?.(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-sm mx-auto bg-white rounded-2xl shadow">
      <h2 className="text-xl font-bold mb-4">Payment Gateway</h2>
      <div className="mb-4 text-2xl font-bold text-teal-600">
        {amount.toLocaleString()} {currency}
      </div>
      {description && <p className="text-sm text-gray-600 mb-4">{description}</p>}
      {errorMsg && <p className="text-red-500 text-sm mb-3">{errorMsg}</p>}
      {receipt ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm">
          <p className="font-semibold text-green-700">? Payment Successful</p>
          <p className="text-gray-600 mt-1">Receipt: {String(receipt.receiptNumber)}</p>
        </div>
      ) : (
        <button onClick={handlePay} disabled={loading}
          className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50
            text-white font-semibold py-3 rounded-xl transition-colors">
          {loading ? "Processing?" : "Pay Now"}
        </button>
      )}
    </div>
  );
};

export default PaymentGateway;





