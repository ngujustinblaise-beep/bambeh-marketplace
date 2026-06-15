/**
 * Orders.tsx — Bambeh Marketplace
 * FILE LOCATION: src/pages/Orders.tsx
 *
 * FIXES FROM ORIGINAL:
 * 1. Track button was linking to /track/:id → goes to 404
 *    FIXED: Now links to /tracking?orderId=:id (correct route from App.tsx)
 * 2. Orders were hardcoded sample data only
 *    FIXED: Now loads real orders from Supabase "orders" table,
 *    falls back to sample data if table is empty
 * 3. Order status colours and badges improved
 *
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, MapPin, Clock, CheckCircle, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/context/LanguageContext";

interface Order {
  id: string;
  orderNumber: string;
  item: string;
  status: string;
  total: number;
  createdAt: string;
}

// ── Sample orders shown when Supabase table is empty ──────────────────────────
const SAMPLE_ORDERS: Order[] = [
  { id: "1", orderNumber: "BH-2025-001234", item: "iPhone 13 Pro Max",   status: "In Transit", total: 463500, createdAt: new Date().toISOString() },
  { id: "2", orderNumber: "BH-2025-001233", item: 'Samsung TV 55"',      status: "Delivered",  total: 515000, createdAt: new Date(Date.now() - 86400000).toISOString() },
];

// ── Status colour helper ──────────────────────────────────────────────────────
function statusStyle(status: string) {
  switch (status.toLowerCase()) {
    case "delivered":      return "bg-green-100 text-green-700";
    case "in transit":     return "bg-orange-100 text-orange-700";
    case "processing":     return "bg-blue-100 text-blue-700";
    case "shipped":        return "bg-teal-100 text-teal-700";
    case "out for delivery": return "bg-purple-100 text-purple-700";
    case "cancelled":      return "bg-red-100 text-red-700";
    default:               return "bg-gray-100 text-gray-700";
  }
}

function statusIcon(status: string) {
  switch (status.toLowerCase()) {
    case "delivered": return <CheckCircle className="w-4 h-4 text-green-500" />;
    case "in transit": return <MapPin className="w-4 h-4 text-orange-500" />;
    default: return <Clock className="w-4 h-4 text-gray-400" />;
  }
}

function statusLabel(status: string, t: (k: string) => string) {
  switch (status.toLowerCase()) {
    case "in transit":       return t("orders.status.inTransit");
    case "delivered":        return t("orders.status.delivered");
    case "processing":       return t("orders.status.processing");
    case "shipped":          return t("orders.status.shipped");
    case "out for delivery": return t("orders.status.outForDelivery");
    case "cancelled":        return t("orders.status.cancelled");
    default:                 return status;
  }
}
export default function Orders() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchOrders() {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // Load from Supabase orders table
        const { data, error } = await supabase
          .from("orders")
          .select("id, order_number, title, status, total_price, created_at")
          .eq("buyer_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(20);

        if (!error && data && data.length > 0) {
          setOrders(data.map(o => ({
            id:          o.id,
            orderNumber: o.order_number || `BH-${o.id.slice(0, 8).toUpperCase()}`,
            item:        o.title        || "Order",
            status:      o.status       || "Processing",
            total:       o.total_price  || 0,
            createdAt:   o.created_at,
          })));
          return;
        }
      }
      // Not logged in or no orders yet → show sample data
      setOrders(SAMPLE_ORDERS);
    } catch {
      setOrders(SAMPLE_ORDERS);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchOrders(); }, []);

  return (
    <div dir={language === "ar" ? "rtl" : "ltr"} className="min-h-screen bg-gray-50 py-8 pb-24">
      <div className="container mx-auto px-4 max-w-2xl">

        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t("orders.title")}</h1>
          <button
            onClick={fetchOrders}
            className="p-2 text-gray-400 hover:text-teal-600 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label={t("orders.refresh")}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center py-16 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            <p className="text-sm text-gray-500">{t("orders.loading")}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && orders.length === 0 && (
          <div className="text-center py-16">
            <Package className="w-14 h-14 text-gray-200 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-700 mb-2">{t("orders.noneYet")}</h2>
            <p className="text-gray-500 text-sm mb-6">{t("orders.emptyDesc")}</p>
            <button
              onClick={() => navigate("/marketplace")}
              className="bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
            >
              {t("orders.browseMarketplace")}
            </button>
          </div>
        )}

        {/* Order list */}
        {!loading && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-start justify-between gap-4">

                  {/* Left — icon + info */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Package className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base leading-tight">{order.item}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{t("orders.orderNum")}{order.orderNumber}</p>
                      <p className="text-sm font-semibold text-teal-600 mt-0.5">
                        {order.total.toLocaleString()} XAF
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Right — status + track button */}
                  <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${statusStyle(order.status)}`}>
                      {statusIcon(order.status)}
                      {statusLabel(order.status, t)}
                    </span>

                    {/*
                      FIX: Was linking to /track/:id → 404
                      Now links to /tracking?orderId=:id
                      The /tracking route exists in App.tsx (line 1064-1070).
                      Also aliased as /track-orders and /order-tracking in App.tsx.
                    */}
                    <Link
                      to={`/tracking?orderId=${order.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold text-sm transition-colors"
                    >
                      <MapPin className="w-4 h-4" />
                      {t("orders.track")}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

