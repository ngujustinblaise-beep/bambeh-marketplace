/**
 * src/pages/TrackOrder.tsx
 * Bambeh Marketplace � Track a Specific Order
 * � 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Package, ArrowLeft, RefreshCw, CheckCircle, Clock, Truck, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLang, t } from "@/hooks/useAppLang";

interface OrderDetail {
  id: string;
  status: string;
  totalXAF: number;
  vendorName: string;
  itemCount: number;
  paymentStatus: string;
  paymentReference?: string;
  createdAt: string;
  updatedAt: string;
}

const TrackOrder: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbErr } = await supabase
        .from("vendor_orders")
        .select("id, status, total_xaf, payment_status, payment_reference, created_at, updated_at, vendor_profiles(store_name)")
        .eq("id", orderId)
        .single();

      if (dbErr || !data) {
        setError("Commande introuvable");
        return;
      }

      const vendor = Array.isArray(data.vendor_profiles) ? data.vendor_profiles[0] : data.vendor_profiles;

      setOrder({
        id: data.id as string,
        status: data.status as string,
        totalXAF: data.total_xaf as number,
        vendorName: (vendor?.store_name as string) ?? "�",
        itemCount: 1,
        paymentStatus: data.payment_status as string,
        paymentReference: data.payment_reference as string | undefined,
        createdAt: data.created_at as string,
        updatedAt: data.updated_at as string,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => { void load(); }, [load]);

  const formatXAF = (n: number) =>
    new Intl.NumberFormat("fr-CM", { style: "currency", currency: "XAF", maximumFractionDigits: 0 }).format(n);

  const statusIcon = order ? (
    order.status === "delivered" ? <CheckCircle className="w-8 h-8 text-green-500" /> :
    order.status === "shipped" ? <Truck className="w-8 h-8 text-teal-500" /> :
    <Clock className="w-8 h-8 text-yellow-500" />
  ) : null;

  return (
    <div className="max-w-lg mx-auto p-4 space-y-4">
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Suivi de commande</h1>
        <button type="button" onClick={load} className="ml-auto p-2 hover:bg-gray-100 rounded-xl">
          <RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading && (
        <div className="py-12 text-center">
          <RefreshCw className="w-6 h-6 text-teal-500 animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-400">Chargement...</p>
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {!loading && order && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              {statusIcon}
              <div>
                <p className="font-bold text-gray-900 capitalize">{order.status.replace(/_/g, " ")}</p>
                <p className="text-xs text-gray-400">
                  Mis � jour: {new Date(order.updatedAt).toLocaleString("fr-CM")}
                </p>
              </div>
            </div>
            <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
              <div className="flex justify-between"><span className="text-gray-500">Commande #</span><span className="font-mono text-xs">{order.id.slice(0, 12)}...</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Vendeur</span><span className="font-medium">{order.vendorName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Total</span><span className="font-bold text-teal-700">{formatXAF(order.totalXAF)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Paiement</span><span className={order.paymentStatus === "paid" ? "text-green-600 font-medium" : "text-yellow-600"}>{order.paymentStatus}</span></div>
              {order.paymentReference && (
                <div className="flex justify-between"><span className="text-gray-500">R�f�rence</span><span className="font-mono text-xs">{order.paymentReference}</span></div>
              )}
              <div className="flex justify-between"><span className="text-gray-500">Date</span><span>{new Date(order.createdAt).toLocaleDateString("fr-CM")}</span></div>
            </div>
          </div>

          <button type="button" onClick={() => navigate("/tracking")} className="w-full py-3 border border-teal-300 text-teal-700 rounded-xl text-sm font-medium hover:bg-teal-50 transition-colors flex items-center justify-center gap-2">
            <Package className="w-4 h-4" />
            Suivi d�taill�
          </button>
        </div>
      )}
    </div>
  );
};

export default TrackOrder;





