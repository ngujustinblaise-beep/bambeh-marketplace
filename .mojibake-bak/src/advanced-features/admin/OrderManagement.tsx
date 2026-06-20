/**
 * src/advanced-features/admin/OrderManagement.tsx
 * Bambeh Marketplace â€” Admin Order Management
 * Â© 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  ShoppingBag, Search, Filter, Eye, CheckCircle,
  XCircle, Clock, RefreshCw, ChevronDown, Truck,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type OrderStatus =
  | "pending" | "confirmed" | "processing"
  | "shipped" | "delivered" | "canceled" | "refunded";

interface AdminOrder {
  id: string;
  vendorId: string;
  vendorName: string;
  customerId: string;
  customerName: string;
  totalXAF: number;
  commissionXAF: number;
  status: OrderStatus;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

// â”€â”€â”€ Status Config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending:    { label: "En attente",     color: "text-yellow-600 bg-yellow-50 border-yellow-200", icon: Clock },
  confirmed:  { label: "ConfirmÃ©",       color: "text-blue-600 bg-blue-50 border-blue-200",       icon: CheckCircle },
  processing: { label: "En traitement",  color: "text-purple-600 bg-purple-50 border-purple-200", icon: RefreshCw },
  shipped:    { label: "ExpÃ©diÃ©",        color: "text-teal-600 bg-teal-50 border-teal-200",       icon: Truck },
  delivered:  { label: "LivrÃ©",          color: "text-green-600 bg-green-50 border-green-200",    icon: CheckCircle },
  canceled:   { label: "AnnulÃ©",         color: "text-red-500 bg-red-50 border-red-200",          icon: XCircle },
  refunded:   { label: "RemboursÃ©",      color: "text-gray-500 bg-gray-100 border-gray-200",      icon: RefreshCw },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const AdminOrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("vendor_orders")
        .select(`
          id, vendor_id, customer_id, total_xaf, commission_xaf,
          status, payment_status, created_at, updated_at,
          vendor_profiles(store_name),
          profiles(display_name)
        `)
        .order("created_at", { ascending: false })
        .limit(100);

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error: dbErr } = await query;
      if (dbErr) {
        setError(dbErr.message);
        return;
      }

      const mapped: AdminOrder[] = (data ?? []).map((row) => {
        const vendor = Array.isArray(row.vendor_profiles)
          ? row.vendor_profiles[0]
          : row.vendor_profiles;
        const customer = Array.isArray(row.profiles)
          ? row.profiles[0]
          : row.profiles;
        return {
          id: row.id as string,
          vendorId: row.vendor_id as string,
          vendorName: (vendor?.store_name as string) ?? "â€”",
          customerId: row.customer_id as string,
          customerName: (customer?.display_name as string) ?? "â€”",
          totalXAF: row.total_xaf as number,
          commissionXAF: row.commission_xaf as number,
          status: row.status as OrderStatus,
          paymentStatus: row.payment_status as AdminOrder["paymentStatus"],
          itemCount: 1,
          createdAt: row.created_at as string,
          updatedAt: row.updated_at as string,
        };
      });

      setOrders(mapped);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { void loadOrders(); }, [loadOrders]);

  const updateOrderStatus = useCallback(async (orderId: string, newStatus: OrderStatus) => {
    setUpdating(orderId);
    try {
      const { error: dbErr } = await supabase
        .from("vendor_orders")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", orderId);

      if (!dbErr) {
        setOrders((prev) =>
          prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o)
        );
        if (selectedOrder?.id === orderId) {
          setSelectedOrder((prev) => prev ? { ...prev, status: newStatus } : null);
        }
      }
    } catch {
      // silent
    } finally {
      setUpdating(null);
    }
  }, [selectedOrder]);

  const formatXAF = (n: number) =>
    new Intl.NumberFormat("fr-CM", { style: "currency", currency: "XAF", maximumFractionDigits: 0 }).format(n);

  const filtered = orders.filter((o) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      o.vendorName.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q)
    );
  });

  const totalCommission = filtered.reduce((sum, o) => sum + o.commissionXAF, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-teal-600" />
          <h2 className="text-lg font-bold text-gray-900">Gestion des Commandes</h2>
          <span className="text-sm text-gray-500">({filtered.length})</span>
        </div>
        <button
          type="button"
          onClick={loadOrders}
          disabled={loading}
          className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </button>
      </div>

      {/* Commission summary */}
      <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 flex items-center justify-between">
        <span className="text-sm text-teal-700 font-medium">Commission Bambeh (rÃ©sultats filtrÃ©s)</span>
        <span className="text-lg font-bold text-teal-800">{formatXAF(totalCommission)}</span>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-48 bg-white border border-gray-300 rounded-xl px-3 py-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par ID, vendeur, client..."
            className="flex-1 text-sm outline-none bg-transparent"
          />
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-xl px-3 py-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "all")}
            className="text-sm outline-none bg-transparent pr-4"
          >
            <option value="all">Tous les statuts</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-12 text-center">
            <RefreshCw className="w-6 h-6 text-gray-300 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-400">Chargement des commandes...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <ShoppingBag className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Aucune commande trouvÃ©e</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">ID</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Vendeur</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Client</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Total</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Commission</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Statut</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {order.id.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{order.vendorName}</td>
                    <td className="px-4 py-3 text-gray-600">{order.customerName}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {formatXAF(order.totalXAF)}
                    </td>
                    <td className="px-4 py-3 text-right text-teal-700 font-medium">
                      {formatXAF(order.commissionXAF)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(order.createdAt).toLocaleDateString("fr-CM")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 rounded-lg hover:bg-teal-50 text-teal-600 transition-colors"
                          aria-label="Voir dÃ©tails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {order.status === "pending" && (
                          <button
                            type="button"
                            onClick={() => updateOrderStatus(order.id, "confirmed")}
                            disabled={updating === order.id}
                            className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
                            aria-label="Confirmer"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {(order.status === "pending" || order.status === "confirmed") && (
                          <button
                            type="button"
                            onClick={() => updateOrderStatus(order.id, "canceled")}
                            disabled={updating === order.id}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                            aria-label="Annuler"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelectedOrder(null)} />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 p-5 max-w-md mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">DÃ©tail commande</h3>
              <button type="button" onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">âœ•</button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">ID</span><span className="font-mono text-xs">{selectedOrder.id}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Vendeur</span><span className="font-medium">{selectedOrder.vendorName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Client</span><span>{selectedOrder.customerName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Total</span><span className="font-bold">{formatXAF(selectedOrder.totalXAF)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Commission</span><span className="text-teal-700 font-bold">{formatXAF(selectedOrder.commissionXAF)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Paiement</span><span className={selectedOrder.paymentStatus === "paid" ? "text-green-600 font-medium" : "text-yellow-600"}>{selectedOrder.paymentStatus}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-500">Statut</span><StatusBadge status={selectedOrder.status} /></div>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-2">Changer le statut :</p>
              <div className="flex flex-wrap gap-2">
                {(["confirmed", "shipped", "delivered", "canceled"] as OrderStatus[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => updateOrderStatus(selectedOrder.id, s)}
                    disabled={selectedOrder.status === s || updating === selectedOrder.id}
                    className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                  >
                    {STATUS_CONFIG[s].label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminOrderManagement;


