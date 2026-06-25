// @ts-nocheck
import React from "react";
import { useLang, t } from "@/hooks/useAppLang";

const VendorProfile: React.FC = () => {
  const vendor = { id: "v1", name: "My Business", businessName: "My Store", email: "vendor@example.com", phone: "+237 600 000 000", status: "approved" };
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center text-2xl">??</div>
          <div>
            <h1 className="text-xl font-bold">{vendor.name}</h1>
            <p className="text-sm text-gray-500">{vendor.businessName}</p>
          </div>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Email</span><span className="font-medium">{vendor.email}</span></div>
          <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Phone</span><span className="font-medium">{vendor.phone}</span></div>
          <div className="flex justify-between py-2"><span className="text-gray-500">Status</span><span className="font-medium text-green-600 capitalize">{vendor.status}</span></div>
        </div>
      </div>
    </div>
  );
};
export default VendorProfile;





