// @ts-nocheck
import React, { useState } from "react";
import type { CartItem } from "@/types/cart";
import { PAYMENT_METHODS } from "@/types/subscription";
import type { PaymentMethod } from "@/types/subscription";

interface CheckoutModalProps {
  items: CartItem[];
  onClose: () => void;
  onSuccess?: (method: PaymentMethod, ref: string) => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ items, onClose, onSuccess }) => {
  const [method,  setMethod]  = useState<PaymentMethod>(PAYMENT_METHODS.MTN_MOMO);
  const [loading, setLoading] = useState(false);

  const total = items.reduce((s, i) => s + (i.priceXAF ?? 0) * (i.quantity ?? 1), 0);

  const handlePay = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    const ref = "TXN_" + Date.now();
    onSuccess?.(method, ref);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Checkout</h2>
          <button onClick={onClose} className="text-2xl text-gray-400">×</button>
        </div>

        <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
          {items.map((item: CartItem, i) => (
            <div key={item.id ?? i} className="flex justify-between text-sm">
              <span className="truncate flex-1 text-gray-700">{item.itemTitle}</span>
              <span className="font-medium ml-2">{(item.priceXAF ?? 0).toLocaleString()} XAF</span>
            </div>
          ))}
        </div>

        <div className="flex justify-between font-bold text-lg mb-6 pt-2 border-t">
          <span>Total</span>
          <span className="text-teal-600">{total.toLocaleString()} XAF</span>
        </div>

        <div className="space-y-2 mb-6">
          {[
            { id: PAYMENT_METHODS.MTN_MOMO,     label: "MTN MoMo",     icon: "??" },
            { id: PAYMENT_METHODS.ORANGE_MONEY,  label: "Orange Money", icon: "??" },
            { id: PAYMENT_METHODS.CARD,          label: "Card",         icon: "??" },
          ].map(m => (
            <label key={m.id} className={"flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer " + (method === m.id ? "border-teal-500 bg-teal-50" : "border-gray-200")}>
              <input type="radio" name="method" value={m.id}
                checked={method === m.id}
                onChange={() => setMethod(m.id as PaymentMethod)}
                className="accent-teal-600" />
              <span>{m.icon}</span>
              <span className="text-sm font-medium">{m.label}</span>
            </label>
          ))}
        </div>

        <button onClick={handlePay} disabled={loading || items.length === 0}
          className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl">
          {loading ? "Processing..." : "Pay Now"}
        </button>
      </div>
    </div>
  );
};

export default CheckoutModal;




