/**
 * src/pages/vendor/VendorPremiumTools.tsx
 * Bambeh Marketplace ? Vendor Premium Tools Dashboard
 * ? 2026 Bambeh Marketplace. All rights reserved.
 */

import React from "react";
import { ArrowLeft, Zap, BarChart2, Upload, Star, Headphones, ShieldCheck, MessageCircle, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLang, t } from "@/hooks/useAppLang";

interface PremiumTool {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  route: string;
  badge?: string;
}

const TOOLS: PremiumTool[] = [
  { id: "analytics", title: "Analytics Pro", description: "Vues, conversions, revenus en temps r?el", icon: BarChart2, color: "bg-blue-50 text-blue-600", route: "/vendor/analytics-pro" },
  { id: "featured", title: "Annonces en Vedette", description: "5? plus de vues sur vos meilleures annonces", icon: Star, color: "bg-yellow-50 text-yellow-600", route: "/vendor/featured", badge: "HOT" },
  { id: "bulk", title: "Import en Masse", description: "Publiez jusqu'? 500 annonces via CSV", icon: Upload, color: "bg-teal-50 text-teal-600", route: "/vendor/bulk-upload" },
  { id: "auto-msg", title: "Messages Automatiques", description: "R?pondez 24/7 sans lever le doigt", icon: MessageCircle, color: "bg-purple-50 text-purple-600", route: "/vendor/auto-messaging" },
  { id: "verified", title: "Vendeur V?rifi?", description: "Badge de confiance pour plus de ventes", icon: ShieldCheck, color: "bg-green-50 text-green-600", route: "/vendor/verified-seller" },
  { id: "support", title: "Support Prioritaire", description: "Agent d?di?, r?ponse sous 2h", icon: Headphones, color: "bg-red-50 text-red-600", route: "/vendor/priority-support" },
];

const VendorPremiumTools: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-5">
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" />
        <h1 className="text-lg font-bold text-gray-900">Outils Premium</h1>
      </div>

      <div className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-5 h-5 fill-white" />
          <span className="font-bold">Pack Premium Bambeh</span>
        </div>
        <p className="text-sm text-teal-100 mb-3">D?bloquez tous les outils pour dominer le march? camerounais.</p>
        <button type="button" onClick={() => navigate("/vendor/subscription")}
          className="px-4 py-2 bg-white text-teal-700 rounded-xl text-sm font-bold hover:bg-teal-50 transition-colors">
          Voir les offres ?
        </button>
      </div>

      <div className="space-y-3">
        {TOOLS.map((tool) => (
          <button key={tool.id} type="button" onClick={() => navigate(tool.route)}
            className="w-full flex items-center gap-4 bg-white border border-gray-200 rounded-2xl p-4 hover:border-teal-300 hover:shadow-sm transition-all text-left">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${tool.color.split(" ")[0]}`}>
              <tool.icon className={`w-6 h-6 ${tool.color.split(" ")[1]}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-gray-900">{tool.title}</p>
                {tool.badge && (
                  <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded font-bold">{tool.badge}</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{tool.description}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default VendorPremiumTools;





