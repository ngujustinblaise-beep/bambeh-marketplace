import React, { useState } from "react";
import { Link } from "react-router-dom";

type Tab = "general" | "notifications" | "privacy" | "security";

const UserSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("general");

  const tabs: { id: Tab; label: string }[] = [
    { id: "general", label: "General" },
    { id: "notifications", label: "Notifications" },
    { id: "privacy", label: "Privacy" },
    { id: "security", label: "Security" },
  ];

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={
              "flex-1 py-2 rounded-lg text-xs font-medium transition-colors " +
              (activeTab === tab.id
                ? "bg-white text-teal-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700")
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "general" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">
              Language and Region
            </h3>
            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none">
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="ar">العربية</option>
              <option value="ha">Hausa</option>
            </select>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-3">Account</h3>
            <Link
              to="/profile"
      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
            >
              <span className="text-sm text-gray-700">Edit Profile</span>
              <span className="text-gray-400">›</span>
            </Link>
            <Link
              to="/subscription"
      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
            >
              <span className="text-sm text-gray-700">Subscription Plans</span>
              <span className="text-gray-400">›</span>
            </Link>
          </div>
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h3 className="font-semibold text-gray-800 mb-2">
            Notification Preferences
          </h3>
          {[
            "Order Updates",
            "New Messages",
            "Promotions",
            "Price Alerts",
            "System Alerts",
          ].map((label) => (
            <label
              key={label}
              className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 cursor-pointer"
            >
              <span className="text-sm text-gray-700">{label}</span>
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 accent-teal-600"
              />
            </label>
          ))}
        </div>
      )}

      {activeTab === "privacy" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Privacy Controls</h3>
          {[
            "Show my profile to other users",
            "Allow others to see my listings",
            "Show my online status",
          ].map((label) => (
            <label
              key={label}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 accent-teal-600"
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
          <div className="mt-4 space-y-2">
            <Link
              to="/privacy-policy"
      className="block text-sm text-teal-600 hover:underline py-1"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms-of-service"
      className="block text-sm text-teal-600 hover:underline py-1"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      )}

      {activeTab === "security" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Security</h3>
            <Link
              to="/forgot-password"
      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
            >
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Change Password
                </p>
                <p className="text-xs text-gray-400">
                  Update your account password
                </p>
              </div>
              <span className="text-gray-400">›</span>
            </Link>
          </div>
          <div className="bg-red-50 rounded-xl border border-red-100 p-6">
            <h3 className="font-semibold text-red-700 mb-2">Danger Zone</h3>
            <p className="text-xs text-red-500 mb-4">
              These actions cannot be undone.
            </p>
            <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors">
              Deactivate Account
            </button>
          </div>
        </div>
      )}
    </div>
  );

}
export default UserSettings;
