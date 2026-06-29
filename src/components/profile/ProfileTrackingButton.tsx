/**
 * ProfileTrackingButton.tsx — Bambeh Marketplace
 * FILE LOCATION: src/components/profile/ProfileTrackingButton.tsx
 *
 * Fully localized order tracking sub-components matching the native 5-language setup:
 * English, French, Pidgin English, Arabic, and Fulfulde.
 * Supports absolute LTR / RTL text-alignment boundaries.
 *
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { useState } from "react";
import { Truck } from 'lucide-react';
import { useLanguage } from '@/App';

type Lang = "en" | "fr" | "pidgin" | "ar" | "ff";
type TrackStatus = "pending" | "picked_up" | "in_transit" | "delivered" | "failed";

interface TrackingCardProps {
  orderId: string;
  status: string;
  estimatedDelivery?: string;
}

interface DeliveryStatusProps {
  status: TrackStatus;
  updatedAt?: string;
}

const S: Record<Lang, {
  trackBtn: string;
  orderLabel: string;
  etaLabel: string;
  statuses: Record<TrackStatus, string>;
}> = {
  en: {
    trackBtn: "Track Order",
    orderLabel: "Order",
    etaLabel: "ETA:",
    statuses: { pending: "Pending Dropoff", picked_up: "Picked Up", in_transit: "In Transit", delivered: "Delivered", failed: "Delivery Failed" }
  },
  fr: {
    trackBtn: "Suivre la commande",
    orderLabel: "Commande",
    etaLabel: "Livraison prévue :",
    statuses: { pending: "En attente", picked_up: "Colis récupéré", in_transit: "En cours de route", delivered: "Livrée avec succès", failed: "Échec de la livraison" }
  },
  pidgin: {
    trackBtn: "Track Order",
    orderLabel: "Market Order",
    etaLabel: "Est. reach day:",
    statuses: { pending: "We de wait shopkeeper", picked_up: "Rider don pick am", in_transit: "Motor dey road", delivered: "E don reach hand", failed: "Wahala dey, motor fail" }
  },
  ar: {
    trackBtn: "تتبع الطلب",
    orderLabel: "طلب رقم",
    etaLabel: "الوقت المتوقع:",
    statuses: { pending: "قيد الانتظار", picked_up: "تم الاستلام من المتجر", in_transit: "جاري التوصيل", delivered: "تم التسليم", failed: "فشل التوصيل" }
  },
  ff: {
    trackBtn: "Laaru Nokku",
    orderLabel: "Coodaaɗe",
    etaLabel: "Saa'i jottarki:",
    statuses: { pending: "Ɗon jorta kanko", picked_up: "Rider ɓetti ɗum", in_transit: "Ɗon e laawol", delivered: "Heɓama joni", failed: "Fasiknaama sam" }
  }
};

const TrackingCard: React.FC<TrackingCardProps & { isRtl: boolean; etaText: string; orderText: string }> = ({ 
  orderId, status, estimatedDelivery, isRtl, etaText, orderText 
}) => (
  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-xs text-start">
    <p className="font-bold text-gray-900 text-xs">{orderText} #{orderId}</p>
    <p className="text-teal-600 text-xs font-semibold mt-1">{status}</p>
    {estimatedDelivery && (
      <p className="text-[11px] text-gray-400 font-medium mt-1">{etaText} {estimatedDelivery}</p>
    )}
  </div>
);

const DeliveryStatus: React.FC<DeliveryStatusProps & { isRtl: boolean; label: string }> = ({ status, updatedAt, isRtl, label }) => {
  const icons: Record<TrackStatus, string> = {
    pending:    "📦",
    picked_up:  "🚚",
    in_transit: "🛣️",
    delivered:  "✅",
    failed:     "❌",
  };
  
  return (
    <div className="flex items-center gap-3 text-start bg-gray-50 p-3 rounded-xl border border-gray-100">
      <span className="text-lg leading-none">{icons[status]}</span>
      <div>
        <p className="text-xs font-bold text-gray-800">{label}</p>
        {updatedAt && <p className="text-[11px] text-gray-400 font-medium mt-0.5">{updatedAt}</p>}
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
  const [open, setOpen] = useState(false);

  if (!orderId) return null;

  const lang: Lang = (language in S ? language : "en") as Lang;
  const s = S[lang];
  const isRtl = lang === "ar";

  const toggleTracking = () => {
    setOpen(!open);
    if (!open) {
      onTrack?.(orderId);
    }
  };

  const formatDate = () => {
    const localeMap: Record<Lang, string> = { en: 'en-US', fr: 'fr-CM', pidgin: 'en-US', ar: 'ar-CM', ff: 'fr-CM' };
    return new Date().toLocaleDateString(localeMap[lang], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="w-full">
      <button 
        onClick={toggleTracking}
        className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors font-bold text-xs focus:outline-none shadow-xs"
      >
        <Truck className="w-3.5 h-3.5" />
        <span>{s.trackBtn}</span>
      </button>
      
      {open && (
        <div className="mt-3 space-y-2.5 animate-fadeIn">
          <TrackingCard 
            orderId={orderId} 
            status={s.statuses.in_transit} 
            estimatedDelivery={formatDate()} 
            isRtl={isRtl}
            etaText={s.etaLabel}
            orderText={s.orderLabel}
          />
          <DeliveryStatus 
            status="in_transit" 
            updatedAt={formatDate()} 
            isRtl={isRtl}
            label={s.statuses.in_transit}
          />
        </div>
      )}
    </div>
  );
};

export default ProfileTrackingButton;
export { TrackingCard, DeliveryStatus };
export type { TrackingCardProps, DeliveryStatusProps };