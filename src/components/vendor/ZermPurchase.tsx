// @ts-nocheck
import React, { useState } from "react";
import { ZERM_COIN_PACKAGES, getTotalZermCoins } from "@/utils/tierBridge";
import type { ZermCoinPackage } from "@/utils/tierBridge";

interface ZermPurchaseProps {
  onPurchase?: (pkg: ZermCoinPackage) => void;
  onClose?: () => void;
}

const ZermPurchase: React.FC<ZermPurchaseProps> = ({ onPurchase, onClose }) => {
  const [selected, setSelected] = useState<string | null>(null);

  const handleBuy = () => {
    const pkg = ZERM_COIN_PACKAGES.find(p => p.id === selected);
    if (pkg) onPurchase?.(pkg);
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Buy ZermCoins</h2>
      <div className="space-y-3 mb-6">
        {ZERM_COIN_PACKAGES.map(pkg => (
          <div key={pkg.id}
            onClick={() => setSelected(pkg.id)}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all
              ${selected === pkg.id
                ? "border-teal-500 bg-teal-50"
                : "border-gray-200 hover:border-teal-300"}`}>
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{pkg.name}</span>
                  {pkg.popular && (
                    <span className="bg-teal-500 text-white text-xs px-2 py-0.5 rounded-full">
                      Popular
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-0.5">
                  {getTotalZermCoins(pkg).toLocaleString()} ZermCoins
                  {pkg.bonus > 0 && (
                    <span className="text-teal-600 font-medium"> (+{pkg.bonus} bonus)</span>
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-teal-600">{pkg.priceXAF.toLocaleString()} XAF</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <button onClick={handleBuy} disabled={!selected}
          className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-50
            text-white font-semibold py-3 rounded-xl">
          Buy Now
        </button>
        {onClose && (
          <button onClick={onClose}
            className="px-4 py-3 border border-gray-300 rounded-xl text-gray-600">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default ZermPurchase;
