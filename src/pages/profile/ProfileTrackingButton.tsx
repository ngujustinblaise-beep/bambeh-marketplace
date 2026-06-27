/**
 * ProfileTrackingButton.tsx — Bambeh Marketplace
 * FILE LOCATION: src/pages/profile/ProfileTrackingButton.tsx
 *
 * i18n: Fully integrated with context provider for localization.
 * Handles micro-strings, hardcoded fallback labels, and automatic RTL rendering.
 *
 * © 2026 Bambeh Marketplace. All rights reserved.
 */
import React, { useState } from "react";
import { useLanguage } from "@/App";

type Lang = "en" | "fr" | "pidgin" | "ar" | "ff";

const S: Record<Lang, {
  orderLabel: string;
  etaLabel: string;
  trackButton: string;
  tomorrow: string;
  statusMap: Record<"pending" | "picked_up" | "in_transit" | "delivered" | "failed", string>;
}> = {
  en: {
    orderLabel: "Order",
    etaLabel: "ETA",
    trackButton: "Track Order",
    tomorrow: "Tomorrow",
    statusMap: { pending: "Pending", picked_up: "Picked Up", in_transit: "In Transit", delivered: "Delivered", failed: "Failed" }
  },
  fr: {
    orderLabel: "Commande",
    etaLabel: "HDA",
    trackButton: "Suivre la commande",
    tomorrow: "Demain",
    statusMap: { pending: "En attente", picked_up: "Ramassé", in_transit: "En cours de route", delivered: "Livré", failed: "Échoué" }
  },
  pidgin: {
    orderLabel: "Order",
    etaLabel: "Time",
    trackButton: "Track Order",
    tomorrow: "Tomorrow",
    statusMap: { pending: "Dey wait", picked_up: "They don carry am", in_transit: "Dey road", delivered: "E don reach", failed: "Wahala dey" }
  },
  ar: {
    orderLabel: "الطلب",
    etaLabel: "الوقت المقدر",
    trackButton: "تتبع الطلب",
    tomorrow: "غداً",
    statusMap: { pending: "قيد الانتظار", picked_up: "تم الاستلام", in_transit: "في الطريق", delivered: "تم التوصيل", failed: "فشل التوصيل" }
  },
  ff: {
    orderLabel: "Umroore",
    etaLabel: "Waktu",
    trackButton: "Rewinda umroore",
    tomorrow: "Jaŋngo",
    statusMap: { pending: "Ɗon reena", picked_up: "Ɓamaama", in_transit: "Ɗon e laawol", delivered: "Yotti", failed: "Ruskii" }
  }
};

interface TrackingCardProps {
  orderId: string;
  status: string;
  estimatedDelivery?: string;
}

interface DeliveryStatusProps {
  status: "pending" | "picked_up" | "in_transit" | "delivered" | "failed";
  updatedAt?: string;
}

const TrackingCard: React.FC<TrackingCardProps> = ({ orderId, status, estimatedDelivery }) => {
  const { language } = useLanguage();
  const lang: Lang = (language in S ? language : "en") as Lang;
  const s = S[lang];

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <p className="font-semibold text-sm">{s.orderLabel} #{orderId}</p>
      <p className="text-teal-600 text-sm font-medium mt-1">{status}</p>
      {estimatedDelivery && (
        <p className="text-xs text-gray-400 mt-1">{s.etaLabel}: {estimatedDelivery}</p>
      )}
    </div>
  );
};

const DeliveryStatus: React.FC<DeliveryStatusProps> = ({ status, updatedAt }) => {
  const { language } = useLanguage();
  const lang: Lang = (language in S ? language : "en") as Lang;
  const s = S[lang];

  const icons: Record<DeliveryStatusProps["status"], string> = {
    pending:    "📦",
    picked_up:  "🚚",
    in_transit: "🛣️",
    delivered:  "✅",
    failed:     "❌",
  };

  return (
    <div className="flex items-center gap-3 p-1">
      <span className="text-xl flex-shrink-0">{icons[status]}</span>
      <div>
        <p className="text-sm font-medium text-gray-800">{s.statusMap[status]}</p>
        {updatedAt && <p className="text-xs text-gray-400 mt-0.5">{updatedAt}</p>}
      </div>
    </div>
  );
};

interface ProfileTrackingButtonProps {
  orderId?: string;
  onTrack?: (orderId: string) => void;
}

const ProfileTrackingButton: React.FC<ProfileTrackingButtonProps> = ({ orderId, onTrack }) => {
  const { language } = useLanguage();
  const lang: Lang = (language in S ? language : "en") as Lang;
  const s = S[lang];
  const isRtl = lang === "ar";

  const [open, setOpen] = useState(false);

  if (!orderId) return null;

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="w-full text-start">
      <button 
        onClick={() => { setOpen(!open); onTrack?.(orderId); }}
        className="flex items-center gap-2 text-teal-600 hover:text-teal-700 text-sm font-semibold transition-colors focus:outline-none"
      >
        <span>🚚</span> {s.trackButton}
      </button>
      
      {open && (
        <div className="mt-3 space-y-3 max-w-sm">
          <TrackingCard 
            orderId={orderId} 
            status={s.statusMap["in_transit"]} 
            estimatedDelivery={s.tomorrow} 
          />
          <DeliveryStatus 
            status="in_transit" 
            updatedAt={new Date().toLocaleDateString(lang === "ar" ? "ar-CM" : "en-CM")} 
          />
        </div>
      )}
    </div>
  );
};

export default ProfileTrackingButton;
export { TrackingCard, DeliveryStatus };
export type { TrackingCardProps, DeliveryStatusProps };