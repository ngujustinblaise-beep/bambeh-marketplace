/**
 * src/components/vendor/VendorDashboard.tsx
 * Bambeh Marketplace — Vendor Dashboard Widget
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { useEffect, useState, useCallback } from "react";
import {
  ShoppingBag,
  DollarSign,
  Package,
  Star,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getVendorOrders, getVendorEarnings } from "@/services/vendor.service";
import type { VendorOrder } from "@/services/vendor.service";
import type { VendorEarnings } from "@/types/vendor.monetization.types";

// ─── Order Status Badge ───────────────────────────────────────────────────────
const ORDER_STATUS_CONFIG: Record<
  VendorOrder["status"],
  { label: string; color: string; icon: React.ElementType }
> = {
  pending: { label: "En attente", color: "text-yellow-600 bg-yellow-50", icon: Clock },
  confirmed: { label: "Confirmé", color: "text-blue-600 bg-blue-50", icon: CheckCircle },
  processing: { label: "En traitement", color: "text-purple-600 bg-purple-50", icon: Clock },
  shipped: { label: "Expédié", color: "text-teal-600 bg-teal-50", icon: Package },
  delivered: { label: "Livré", color: "text-green-600 bg-green-50", icon: CheckCircle },
  canceled: { label: "Annulé", color: "text-red-500 bg-red-50", icon: XCircle },
  refunded: { label: "Remboursé", color: "text-gray-500 bg-gray-100", icon: AlertCircle },
};

function OrderStatusBadge({ status }: { status: VendorOrder["status"] }) {
  const config = ORDER_STATUS_CONFIG[status] ?? ORDER_STATUS_CONFIG.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

// ─── VendorDashboard ─────────────────────────────────────────────────────────
interface VendorDashboardProps {
  vendorId: string;
  className?: string;
}

const VendorDashboard: React.FC<VendorDashboardProps> = ({ vendorId, className = "" }) => {
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [earnings, setEarnings] = useState<VendorEarnings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ordersRes, earningsRes] = await Promise.all([
        getVendorOrders(vendorId),
        getVendorEarnings(vendorId),
      ]);

      if (ordersRes.error) {
        setError(ordersRes.error);
      } else {
        setOrders(ordersRes.data.slice(0, 5));
      }

      if (!earningsRes.error && earningsRes.data) {
        setEarnings(earningsRes.data);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [vendorId]);

  useEffect(() => {
    void load();
  }, [load]);

  const formatXAF = (n: number) =>
    new Intl.NumberFormat("fr-CM", {
      style: "currency",
      currency: "XAF",
      maximumFractionDigits: 0,
    }).format(n);

  const pendingCount = orders.filter((o) => o.status === "pending").length;

  if (loading) {
    return (
      <div className={`space-y-4 animate-pulse ${className}`}>
        <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl" />
          ))}
        </div>
        <div className="h-40 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between ${className}`}>
        <p className="text-sm text-red-600">{error}</p>
        <button
          type="button"
          onClick={load}
          className="flex items-center gap-1 text-sm text-red-600"
        >
          <RefreshCw className="w-4 h-4" />
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-teal-50 border border-teal-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-teal-600" />
            <span className="text-xs text-teal-700 font-medium">Revenus nets</span>
          </div>
          <p className="text-lg font-bold text-teal-800">
            {earnings ? formatXAF(earnings.netEarningsXAF) : "—"}
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingBag className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-blue-700 font-medium">Commandes</span>
          </div>
          <p className="text-lg font-bold text-blue-800">{orders.length}</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-yellow-600" />
            <span className="text-xs text-yellow-700 font-medium">En attente</span>
          </div>
          <p className="text-lg font-bold text-yellow-800">{pendingCount}</p>
        </div>

        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-xs text-green-700 font-medium">Retrait dispo</span>
          </div>
          <p className="text-lg font-bold text-green-800">
            {earnings ? formatXAF(earnings.pendingWithdrawalXAF) : "—"}
          </p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Commandes récentes</h3>
          <button
            type="button"
            onClick={() => navigate("/vendor/orders")}
            className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-800"
          >
            Voir tout <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="py-8 text-center">
            <ShoppingBag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Aucune commande pour le moment</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {orders.map((order) => (
              <button
                key={order.id}
                type="button"
                onClick={() => navigate(`/vendor/orders/${order.id}`)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 text-left transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {order.customerName ?? "Client"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatXAF(order.totalXAF)} · {new Date(order.createdAt).toLocaleDateString("fr-CM")}
                  </p>
                </div>
                <OrderStatusBadge status={order.status} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => navigate("/vendor/products/new")}
          className="flex items-center justify-center gap-2 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Package className="w-4 h-4" />
          Nouveau produit
        </button>
        <button
          type="button"
          onClick={() => navigate("/vendor/analytics")}
          className="flex items-center justify-center gap-2 py-3 border border-teal-300 text-teal-700 hover:bg-teal-50 rounded-xl text-sm font-medium transition-colors"
        >
          <Star className="w-4 h-4" />
          Analytiques
        </button>
      </div>
    </div>
  );
};

export default VendorDashboard;
