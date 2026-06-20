// @ts-nocheck
import React, { useState } from "react";
import { useLang, t } from "@/hooks/useAppLang";

const PERIODS = ["7d", "30d", "90d"] as const;
type Period = typeof PERIODS[number];

const VendorAnalytics: React.FC = () => {
  const [period, setPeriod] = useState<Period>("30d");
  const metrics = [
    { label: "Views",       value: 0, icon: "👁", color: "text-blue-600"   },
    { label: "Clicks",      value: 0, icon: "🖱", color: "text-purple-600" },
    { label: "Sales",       value: 0, icon: "💰", color: "text-green-600"  },
    { label: "Revenue XAF", value: 0, icon: "📈", color: "text-teal-600"   },
  ];
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Analytics</h1>
        <div className="flex gap-2 mb-6">
          {PERIODS.map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={"px-4 py-2 rounded-full text-sm font-medium transition-colors " + (period === p ? "bg-teal-600 text-white" : "bg-white text-gray-600 border")}>
              Last {p}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {metrics.map(m => (
            <div key={m.label} className="bg-white rounded-xl p-5 shadow-sm">
              <div className="text-2xl mb-2">{m.icon}</div>
              <p className={"text-2xl font-bold " + m.color}>{m.value.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">{m.label}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm text-center text-gray-400">
          <p className="text-4xl mb-2">📊</p>
          <p className="text-sm">Charts appear once you have sales data.</p>
        </div>
      </div>
    </div>
  );
};
export default VendorAnalytics;


