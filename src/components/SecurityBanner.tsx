/**
 * src/components/SecurityBanner.tsx
 * Bambeh Marketplace â€” Security / Trust Banner
 * Â© 2026 Bambeh Marketplace. All rights reserved.
 */

import React from "react";
import { ShieldCheck, Lock, CheckCircle } from "lucide-react";

interface SecurityBannerProps {
  variant?: "full" | "compact" | "inline";
  className?: string;
}

const SecurityBanner: React.FC<SecurityBannerProps> = ({
  variant = "compact",
  className = "",
}) => {
  const features = [
    { icon: ShieldCheck, label: "Transactions sÃ©curisÃ©es" },
    { icon: Lock, label: "DonnÃ©es protÃ©gÃ©es" },
    { icon: CheckCircle, label: "Vendeurs vÃ©rifiÃ©s" },
  ];

  if (variant === "inline") {
    return (
      <div className={`flex items-center gap-1 text-xs text-green-700 ${className}`}>
        <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
        <span>Paiement sÃ©curisÃ©</span>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div
        className={`flex items-center justify-center gap-4 bg-green-50 border border-green-200 rounded-lg px-4 py-2 ${className}`}
      >
        {features.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-1.5 text-xs text-green-700">
            <Icon className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden sm:inline">{label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-xl p-4 ${className}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="w-5 h-5 text-green-600" />
        <h3 className="text-sm font-semibold text-green-800">Bambeh â€” Achetez en toute confiance</h3>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {features.map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-1 text-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Icon className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-xs text-green-700 font-medium">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SecurityBanner;
