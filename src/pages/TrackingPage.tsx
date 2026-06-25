/**
 * src/pages/TrackingPage.tsx
 * Bambeh Marketplace — Order Tracking Page
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { useState, useEffect, useCallback } from "react";
import { Package, MapPin, CheckCircle, Clock, Truck, RefreshCw, Search, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLang, t } from "@/hooks/useAppLang";

type TrackingStatus = "pending" | "confirmed" | "processing" | "shipped" | "out_for_delivery" | "delivered" | "failed";

interface TrackingStep {
  status: TrackingStatus;
  label: string;
  description: string;
  timestamp?: string;
  done: boolean;
  active: boolean;
}

interface TrackingInfo {
  orderId: string;
  trackingNumber: string;
  status: TrackingStatus;
  estimatedDelivery?: string;
  carrierName?: string;
  steps: TrackingStep[];
  currentLocation?: string;
}

const STATUS_STEPS: { status: TrackingStatus; label: string }[] = [
  { status: "pending",           label: "Commande reçue" },
  { status: "confirmed",         label: "Confirmée" },
  { status: "processing",        label: "En préparation" },
  { status: "shipped",           label: "Expédiée" },
  { status: "out_for_delivery",  label: "En livraison" },
  { status: "delivered",         label: "Livrée" },
];

const TrackingPage: React.FC = () => {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [tracking, setTracking] = useState<TrackingInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (number: string) => {
    const trimmed = number.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setTracking(null);
    try {
      const { data, error: dbErr } = await supabase
        .from("vendor_orders")
        .select("id, status, payment_reference, created_at, updated_at")
        .or(`id.eq.${trimmed},payment_reference.eq.${trimmed}`)
        .single();

      if (dbErr || !data) {
        setError("Numéro de suivi introuvable. Vérifiez le numéro et réessayez.");
        return;
      }

      const orderStatus = data.status as TrackingStatus;
      const statusOrder = STATUS_STEPS.map((s) => s.status);
      const currentIdx = statusOrder.indexOf(orderStatus);

      const steps: TrackingStep[] = STATUS_STEPS.map((step, idx) => ({
        status: step.status,
        label: step.label,
        description: `Étape ${idx + 1}`,
        done: idx < currentIdx,
        active: idx === currentIdx,
        timestamp: idx <= currentIdx ? data.updated_at as string : undefined,
      }));

      setTracking({
        orderId: data.id as string,
        trackingNumber: (data.payment_reference as string) ?? (data.id as string),
        status: orderStatus,
        steps,
        estimatedDelivery: undefined,
        carrierName: "Livraison Bambeh",
        currentLocation: "Cameroun",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de recherche");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") void search(trackingNumber);
  };

  return (
    <div className="max-w-lg mx-auto p-4 space-y-6">
      <div className="flex items-center gap-2">
        <Package className="w-6 h-6 text-teal-600" />
        <h1 className="text-xl font-bold text-gray-900">Suivi de Commande</h1>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 bg-white border border-gray-300 rounded-xl px-4 py-3 focus-within:border-teal-500">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Numéro de commande ou référence..."
            className="flex-1 outline-none text-sm"
          />
        </div>
        <button
          type="button"
          onClick={() => void search(trackingNumber)}
          disabled={loading || !trackingNumber.trim()}
          className="px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60 flex items-center gap-1"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Suivre"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Tracking result */}
      {tracking && (
        <div className="space-y-4">
          {/* Status card */}
          <div className={`p-4 rounded-2xl border-2 ${
            tracking.status === "delivered"
              ? "bg-green-50 border-green-300"
              : tracking.status === "failed"
              ? "bg-red-50 border-red-300"
              : "bg-teal-50 border-teal-300"
          }`}>
            <div className="flex items-center gap-3">
              {tracking.status === "delivered" ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : tracking.status === "shipped" || tracking.status === "out_for_delivery" ? (
                <Truck className="w-8 h-8 text-teal-600" />
              ) : (
                <Clock className="w-8 h-8 text-teal-600" />
              )}
              <div>
                <p className="font-bold text-gray-900">
                  {tracking.status === "delivered" ? "Commande livrée ?" :
                   tracking.status === "out_for_delivery" ? "En cours de livraison..." :
                   tracking.status === "shipped" ? "Colis expédié" :
                   tracking.status === "processing" ? "En préparation" :
                   tracking.status === "confirmed" ? "Commande confirmée" :
                   "Commande reçue"}
                </p>
                <p className="text-sm text-gray-500">N° {tracking.trackingNumber}</p>
                {tracking.estimatedDelivery && (
                  <p className="text-sm text-teal-700 font-medium mt-0.5">
                    Livraison estimée: {new Date(tracking.estimatedDelivery).toLocaleDateString("fr-CM")}
                  </p>
                )}
              </div>
            </div>
            {tracking.currentLocation && (
              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-teal-200">
                <MapPin className="w-4 h-4 text-teal-600" />
                <span className="text-sm text-teal-700">{tracking.currentLocation}</span>
              </div>
            )}
          </div>

          {/* Steps timeline */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Historique de suivi</h3>
            <div className="space-y-0">
              {tracking.steps.map((step, idx) => (
                <div key={step.status} className="flex gap-3">
                  {/* Dot + line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      step.done ? "bg-teal-600" :
                      step.active ? "bg-teal-100 border-2 border-teal-600" :
                      "bg-gray-100 border-2 border-gray-200"
                    }`}>
                      {step.done && <CheckCircle className="w-3 h-3 text-white fill-white" />}
                      {step.active && <div className="w-2 h-2 bg-teal-600 rounded-full"/>}
                    </div>
                    {idx < tracking.steps.length - 1 && (
                      <div className={`w-0.5 h-8 ${step.done ? "bg-teal-600" : "bg-gray-200"}`}/>
                    )}
                  </div>
                  {/* Info */}
                  <div className="pb-4 flex-1 min-w-0">
                    <p className={`text-sm font-medium ${step.active ? "text-teal-700" : step.done ? "text-gray-800" : "text-gray-400"}`}>
                      {step.label}
                    </p>
                    {step.timestamp && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(step.timestamp).toLocaleString("fr-CM")}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackingPage;




