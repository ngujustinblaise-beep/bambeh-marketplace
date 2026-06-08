// @ts-nocheck
import React from "react";
import { useNavigate } from "react-router-dom";
import { useLang, t } from "@/hooks/useAppLang";

const VendorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const stats = [
    { label: "Total Sales",     value: "0 XAF", icon: "💰", color: "text-green-600"  },
    { label: "Active Listings", value: "0",     icon: "📦", color: "text-blue-600"   },
    { label: "Pending Orders",  value: "0",     icon: "⏳", color: "text-yellow-600" },
    { label: "Rating",          value: "—",     icon: "⭐", color: "text-teal-600"   },
  ];
  const links = [
    { label: "Add Listing",  path: "/marketplace/sell",        icon: "➕" },
    { label: "My Listings",  path: "/vendor/listings",         icon: "📋" },
    { label: "Orders",       path: "/vendor/orders",           icon: "📦" },
    { label: "Analytics",    path: "/vendor/analytics",        icon: "📊" },
    { label: "Reviews",      path: "/vendor/reviews",          icon: "⭐" },
    { label: "Settings",     path: "/vendor/settings/profile", icon: "⚙️" },
  ];
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-6 mb-6 text-white">
          <h1 className="text-2xl font-bold">Vendor Dashboard</h1>
          <p className="text-teal-100 text-sm mt-1">Manage your Bambeh store</p>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {stats.map(s => (
            <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-2xl mb-1">{s.icon}</div>
              <p className={"text-xl font-bold " + s.color}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {links.map(l => (
            <button key={l.path} onClick={() => navigate(l.path)}
              className="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center gap-2 hover:shadow-md transition-shadow">
              <span className="text-2xl">{l.icon}</span>
              <span className="text-xs font-medium text-gray-700 text-center">{l.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
export default VendorDashboard;
