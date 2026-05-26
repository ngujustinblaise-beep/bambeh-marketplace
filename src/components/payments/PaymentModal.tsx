// @ts-nocheck
import React, { useState } from "react";
import type { PaymentMethod } from "../../types/subscription";
import { PAYMENT_METHODS } from "../../types/subscription";

interface PaymentModalProps {
  amount: number;
  currency?: string;
  onClose?: () => void;
  onSuccess?: (method: PaymentMethod, reference: string) => void;
}

const METHODS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: PAYMENT_METHODS.MTN_MOMO,     label: "MTN MoMo",     icon: "🟡" },
  { id: PAYMENT_METHODS.ORANGE_MONEY, label: "Orange Money", icon: "🟠" },
  { id: PAYMENT_METHODS.ZERM_COINS,   label: "ZermCoins",    icon: "🪙" },
];

const PaymentModal: React.FC<PaymentModalProps> = ({
  amount, currency = "XAF", onClose, onSuccess,
}) => {
  const [method,  setMethod]  = useState<PaymentMethod>(PAYMENT_METHODS.MTN_MOMO);
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      const ref = `TXN_${Date.now()}`;
      await new Promise(r => setTimeout(r, 1000)); // simulate
      onSuccess?.(method, ref);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center
      justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Pay {amount.toLocaleString()} {currency}</h2>
          {onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
          )}
        </div>

        <div className="space-y-2 mb-6">
          {METHODS.map(m => (
            <label key={m.id}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer
                ${method === m.id ? "border-teal-500 bg-teal-50" : "border-gray-200"}`}>
              <input type="radio" name="payMethod" value={m.id}
                checked={method === m.id}
                onChange={() => setMethod(m.id)}
                className="accent-teal-600" />
              <span className="text-xl">{m.icon}</span>
              <span className="font-medium text-sm">{m.label}</span>
            </label>
          ))}
        </div>

        <button onClick={handlePay} disabled={loading}
          className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50
            text-white font-semibold py-3 rounded-xl">
          {loading ? "Processing…" : "Confirm Payment"}
        </button>
      </div>
    </div>
  );
};

export default PaymentModal;
