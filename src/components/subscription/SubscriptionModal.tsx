// @ts-nocheck
import React, { useState } from "react";
import { SUBSCRIPTION_PLANS, getSubscriptionPlan } from "../../config/subscription";
import type { SubscriptionTier } from "../../types/subscription";
import { PAYMENT_METHODS } from "../../types/subscription";
import type { PaymentMethod } from "../../types/subscription";

interface SubscriptionModalProps {
  currentTier?: SubscriptionTier;
  onClose?: () => void;
  onSubscribe?: (tier: SubscriptionTier, method: PaymentMethod) => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  currentTier = "free", onClose, onSubscribe,
}) => {
  const [selected, setSelected] = useState<SubscriptionTier>("basic");
  const [method,   setMethod]   = useState<PaymentMethod>(PAYMENT_METHODS.MTN_MOMO);
  const [loading,  setLoading]  = useState(false);

  const plan = getSubscriptionPlan(selected);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      onSubscribe?.(selected, method);
      onClose?.();
    } finally {
      setLoading(false);
    }
  };

  const validTiers: SubscriptionTier[] = ["basic", "premium", "enterprise"];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Choose a Plan</h2>
          {onClose && (
            <button onClick={onClose} className="text-gray-400 text-2xl">�</button>
          )}
        </div>

        <div className="space-y-3 mb-6">
          {SUBSCRIPTION_PLANS.filter(p => validTiers.includes(p.tier)).map(p => (
            <div key={p.tier}
              onClick={() => setSelected(p.tier)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all
                ${selected === p.tier ? "border-teal-500 bg-teal-50" : "border-gray-200"}`}>
              <div className="flex justify-between">
                <span className="font-semibold">{p.name}</span>
                <span className="font-bold text-teal-600">{p.priceXAF.toLocaleString()} XAF/mo</span>
              </div>
              <ul className="mt-2 space-y-1">
                {p.features.map((f, i) => (
                  <li key={i} className="text-xs text-gray-600 flex gap-1">
                    <span className="text-teal-500">?</span>{f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">Payment Method</p>
          {[
            { id: PAYMENT_METHODS.MTN_MOMO,     label: "MTN MoMo" },
            { id: PAYMENT_METHODS.ORANGE_MONEY,  label: "Orange Money" },
          ].map(m => (
            <label key={m.id} className="flex items-center gap-2 mb-2 cursor-pointer">
              <input type="radio" name="subMethod" value={m.id}
                checked={method === m.id}
                onChange={() => setMethod(m.id as PaymentMethod)}
                className="accent-teal-600" />
              <span className="text-sm">{m.label}</span>
            </label>
          ))}
        </div>

        <button onClick={handleSubscribe} disabled={loading}
          className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50
            text-white font-semibold py-3 rounded-xl">
          {loading ? "Processing�" : `Subscribe � ${plan?.priceXAF.toLocaleString() ?? "�"} XAF/mo`}
        </button>
      </div>
    </div>
  );
};

export default SubscriptionModal;





