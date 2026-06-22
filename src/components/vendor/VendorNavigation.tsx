/**
 * ---------------------------------------------------------------------------
 * VENDOR NAVIGATION COMPONENT
 * ---------------------------------------------------------------------------
 *
 * Quick navigation for vendors to access dashboard features
 * Used in Profile page and other vendor-related areas
 *
 * © 2025 Bambeh. All rights reserved.
 * ---------------------------------------------------------------------------
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Store,
  Package,
  TrendingUp,
  Settings,
  Crown,
  Gift,
  DollarSign,
  Users,
  ChevronRight
} from "lucide-react";

interface VendorNavigationProps {
  vendorId?: string;
  compact?: boolean;
}

const VendorNavigation: React.FC<VendorNavigationProps> = ({
  vendorId,
  compact = false,
}) => {
  const navigate = useNavigate();

  const navItems = [
    {
      icon: Store,
      label: "Vendor Dashboard",
      description: "Manage your store",
      path: "/vendor/dashboard",
      color: "from-teal-500 to-blue-500",
    },
    {
      icon: Package,
      label: "My Products",
      description: "View & edit listings",
      path: "/vendor/dashboard",
      color: "from-blue-500 to-indigo-500",
    },
    {
      icon: TrendingUp,
      label: "Analytics",
      description: "Sales & performance",
      path: "/vendor/analytics",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Crown,
      label: "Subscription",
      description: "Upgrade your plan",
      path: "/vendor/subscription",
      color: "from-yellow-500 to-orange-500",
    }, {
      icon: Settings,
      label: "Settings",
      description: "Store settings",
      path: "/vendor/settings",
      color: "from-gray-500 to-gray-600",
    },
  ];

  if (compact) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Store className="w-5 h-5 text-teal-600" />
            Vendor Quick Access
          </h3>
          <button
            onClick={() => navigate("/vendor/dashboard")}
            className="text-sm text-teal-600 hover:text-teal-700 font-medium"
          >
            View All ?
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {navItems.slice(0, 3).map((item) => (
            <button
              key={item.path + item.label}
              onClick={() => navigate(item.path)}
              className={`p-3 rounded-lg bg-gradient-to-r ${item.color} text-white text-center hover:opacity-90 transition-opacity`}
            >
              <item.icon className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs font-medium">
                {item.label.split(" ")[0]}
              </span>
            </button>
          ))}
        </div>
      </div>
    );

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-blue-500 p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Vendor Center</h3>
            <p className="text-teal-100 text-sm">Manage your business</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="divide-y divide-gray-100">
        {navItems.map((item) => (
          <button
            key={item.path + item.label}
            onClick={() => navigate(item.path)}
            className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
          >
            <div
              className={`w-10 h-10 rounded-lg bg-gradient-to-r ${item.color} flex items-center justify-center`}
            >
              <item.icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-gray-900">{item.label}</p>
              <p className="text-sm text-gray-500">{item.description}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        ))}
      </div>

      {/* Become Vendor CTA (for non-vendors) */}
      {!vendorId && (
        <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-t border-yellow-200">
          <button
            onClick={() => navigate("/vendor/register")}
            className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-bold hover:from-yellow-600 hover:to-orange-600 transition-colors"
          >
            Become a Vendor Today! ??
          </button>
        </div>
      )}
    </div>
  );

}
}
export default VendorNavigation;




