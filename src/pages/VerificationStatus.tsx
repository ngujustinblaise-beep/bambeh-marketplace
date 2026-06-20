// @ts-nocheck
import React from "react";
import { useLang, t } from "@/hooks/useAppLang";

const VerificationStatus: React.FC = () => (
  <div className="min-h-screen bg-gray-50 p-6">
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Verification Status</h1>
      <div className="bg-white rounded-xl p-6 shadow-sm text-center text-gray-400">
        <p className="text-4xl mb-2">🔍</p>
        <p className="text-sm">No verification requests submitted yet.</p>
      </div>
    </div>
  </div>
);
export default VerificationStatus;


