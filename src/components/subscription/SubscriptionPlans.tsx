// @ts-nocheck
import React from "react";
import { SUBSCRIPTION_PLANS } from "../../config/subscriptionPlans";
import { PAYMENT_METHODS } from "../../types/subscription";
import type { SubscriptionTier, PaymentMethod } from "../../types/subscription";

interface SubscriptionPlansProps {
  currentTier?: SubscriptionTier;
  onSelect?: (tier: SubscriptionTier, method: PaymentMethod) => void;
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ currentTier = "free", onSelect }) => (
  <div className="max-w-2xl mx-auto p-4">
    <h2 className="text-2xl font-bold text-center mb-6">Choose Your Plan</h2>
    <div className="grid gap-4 sm:grid-cols-2">
      {SUBSCRIPTION_PLANS.map(plan => (
        <div key={plan.tier}
          className={`bg-white rounded-2xl p-5 shadow-sm border-2 transition-all
            ${currentTier === plan.tier ? "border-teal-500" : "border-gray-100"}`}>
          <h3 className="text-lg font-bold">{plan.name}</h3>
          <p className="text-2xl font-bold text-teal-600 my-2">
            {plan.priceXAF === 0 ? "Free" : `${plan.priceXAF.toLocaleString()} XAF/mo`}
          </p>
          <ul className="space-y-1 mb-4">
            {plan.features.map((f, i) => (
              <li key={i} className="text-sm text-gray-600 flex gap-1">
                <span className="text-teal-500">âœ“</span>{f}
              </li>
            ))}
          </ul>
          {plan.tier !== "free" && plan.tier !== currentTier && (
            <div className="space-y-2">
              {([PAYMENT_METHODS.MTN_MOMO, PAYMENT_METHODS.ORANGE_MONEY, PAYMENT_METHODS.CARD] as PaymentMethod[]).map(method => (
                <button key={method}
                  onClick={() => onSelect?.(plan.tier, method)}
                  className="w-full border border-teal-600 text-teal-600 hover:bg-teal-50
                    text-sm font-medium py-2 rounded-xl transition-colors">
                  Pay with {method.replace("_", " ")}
                </button>
              ))}
            </div>
          )}
          {currentTier === plan.tier && (
            <div className="text-center text-teal-600 font-medium text-sm py-2">
              âœ… Current Plan
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

export default SubscriptionPlans;
