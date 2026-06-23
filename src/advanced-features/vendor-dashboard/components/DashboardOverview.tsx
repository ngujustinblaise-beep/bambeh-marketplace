// @ts-nocheck
import React from "react";

interface DashboardOverviewProps {
  vendorId: string;
  vendorName?: string;
}

interface StatCard { label: string; value: string | number; icon: string; color: string; }

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ vendorId, vendorName }) => {
  const stats: StatCard[] = [
    { label: "Total Sales",    value: 0,     icon: "💰", color: "text-green-600" },
    { label: "Active Listings",value: 0,     icon: "📦", color: "text-blue-600"  },
    { label: "Pending Orders", value: 0,     icon: "⏳", color: "text-yellow-600"},
    { label: "Rating",         value: "—",   icon: "⭐", color: "text-teal-600"  },
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-1">Dashboard</h2>
      {vendorName && (
        <p className="text-sm text-gray-500 mb-4">Welcome back, {vendorName}</p>
      )}
      <div className="grid grid-cols-2 gap-3">
        {stats.map(s => (
          <div key={s.label}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-2xl mb-1">{s.icon}</div>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-3 text-right">Vendor ID: {vendorId}</p>
    </div>
  );
};

export default DashboardOverview;


