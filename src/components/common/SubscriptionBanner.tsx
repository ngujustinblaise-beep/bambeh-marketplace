// @ts-nocheck
import React from "react";
import { useNavigate } from "react-router-dom";
import type { AuthUser } from "@/types/auth";
import { useLanguage } from "@/context/LanguageContext";

interface SubscriptionBannerProps {
  user: AuthUser | null;
  onDismiss?: () => void;
}

const SubscriptionBanner: React.FC<SubscriptionBannerProps> = ({ user, onDismiss }) => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const tier = user?.tier ?? "free";
  if (tier !== "free") return null;

  return (
    <div dir={language === "ar" ? "rtl" : "ltr"} className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-lg">â­</span>
        <p className="text-sm font-medium">
          {t("subBanner.text")}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/subscription-plans")}
          className="bg-white text-teal-700 text-xs font-bold px-3 py-1 rounded-full hover:bg-teal-50"
        >
          {t("subBanner.upgrade")}
        </button>
        {onDismiss && (
          <button onClick={onDismiss} className="text-teal-200 hover:text-white text-xl">Ã—</button>
        )}
      </div>
    </div>
  );
};

export default SubscriptionBanner;
