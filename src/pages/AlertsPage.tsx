// @ts-nocheck
import React, { useState } from "react";
import { useLang, t } from "@/hooks/useAppLang";

interface Alert { id: string; title: string; message: string; priority: "low" | "medium" | "high"; read: boolean; }

const ALERTS: Alert[] = [
  { id: "1", title: "Price Drop!", message: "iPhone 14 dropped to 350,000 XAF", priority: "high",   read: false },
  { id: "2", title: "New Listing", message: "Toyota Corolla listed near you",    priority: "medium", read: false },
  { id: "3", title: "New Message", message: "Seller replied to your inquiry",    priority: "low",    read: true  },
];

const COLORS: Record<"low"|"medium"|"high", string> = {
  high:   "bg-red-50 border-red-200",
  medium: "bg-yellow-50 border-yellow-200",
  low:    "bg-blue-50 border-blue-200",
};

const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>(ALERTS);
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-6">Alerts</h1>
        {alerts.length === 0 ? (
          <p className="text-gray-400 text-center py-12">No alerts.</p>
        ) : (
          <div className="space-y-3">
            {alerts.map(a => (
              <div key={a.id} className={"p-4 rounded-xl border " + COLORS[a.priority] + (a.read ? " opacity-60" : "")}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-sm">{a.title}</p>
                    <p className="text-xs mt-0.5 text-gray-600">{a.message}</p>
                  </div>
                  <button onClick={() => setAlerts(p => p.filter(x => x.id !== a.id))} className="text-gray-400 ml-3 text-lg">×</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default AlertsPage;
