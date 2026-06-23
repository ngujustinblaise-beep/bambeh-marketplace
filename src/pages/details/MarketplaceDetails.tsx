/**
 * Bambeh Marketplace — Détails de l'article
 * © 2026 Bambeh Marketplace. All rights reserved.
 */
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLang, t } from "@/hooks/useAppLang";

const MarketplaceDetails: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <button onClick={()=>navigate("/marketplace")} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          Retour
        </button>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-5xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Détails de l'article</h1>
          <p className="text-gray-500 mb-6">Informations complètes sur cet article.</p>
          <button onClick={()=>navigate("/")} className="px-6 py-2.5 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors">
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceDetails;






