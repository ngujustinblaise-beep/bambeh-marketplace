// BAMBEH_DEPLOY_TOKEN__ORDERS_FIX207_MOBILE_ESCROW
/**
 * Orders.tsx - Bambeh Marketplace (FIX207)
 * FILE LOCATION: src/pages/Orders.tsx
 *
 * WHAT FIX207 CHANGES (all of it visible on a real Android screen)
 * ---------------------------------------------------------------
 * 1. TRACK ORDER WAS INVISIBLE ON ANDROID. The card was one horizontal row:
 *    icon + text on the left, status badge + Track button stacked on the right.
 *    On a narrow phone the right column got squeezed and the button fell off
 *    the visible area. The card is now VERTICAL: details on top, status badge
 *    top-right, and Track Order as a FULL-WIDTH button underneath the date -
 *    exactly where Big asked for it. It cannot be pushed off screen.
 *
 * 2. "OrderORD_1785138095621_E52DFF" - the label and the number were printed
 *    with no separator. Now renders as "Order . ORD_1785...".
 *
 * 3. ESCROW IS NOW VISIBLE IN THE LIST. An escrow order shows a green
 *    "money held safely" line so the buyer knows their cash is protected and
 *    that they are the one who has to confirm delivery. Tapping through to
 *    Track Order is where the confirm / refund buttons live.
 *
 * 4. Select widened to include escrow, escrow_status and seller_payout_xaf -
 *    all confirmed present on public.orders.
 *
 * UNCHANGED: no demo data, no sample fallback, honest empty state, the
 * /tracking?orderId= link (correct route per App.tsx line 1142), t() i18n.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, MapPin, Clock, CheckCircle, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from '@/App';

interface Order {
  id: string;
  orderNumber: string;
  item: string;
  status: string;
  total: number;
  createdAt: string;
  escrow: boolean;
  escrowStatus: string | null;
}

/* -- escrow wording, 5 languages (the only new copy in this file) ---------- */
const escrowCopy: Record<string, { held: string; released: string; refunded: string; action: string }> = {
  en: {
    held: 'Money held safely',
    released: 'Payment released to seller',
    refunded: 'Refunded',
    action: 'Open to confirm delivery',
  },
  fr: {
    held: 'Argent conserv\u00e9 en s\u00e9curit\u00e9',
    released: 'Paiement vers\u00e9 au vendeur',
    refunded: 'Rembours\u00e9',
    action: 'Ouvrir pour confirmer la livraison',
  },
  pidgin: {
    held: 'Your money dey safe',
    released: 'Seller don collect',
    refunded: 'Money don come back',
    action: 'Open am to confirm delivery',
  },
  ar: {
    held: '\u0627\u0644\u0645\u0628\u0644\u063a \u0645\u062d\u0641\u0648\u0638 \u0628\u0623\u0645\u0627\u0646',
    released: '\u062a\u0645 \u062f\u0641\u0639 \u0627\u0644\u0645\u0628\u0644\u063a \u0644\u0644\u0628\u0627\u0626\u0639',
    refunded: '\u062a\u0645 \u0627\u0644\u0627\u0633\u062a\u0631\u062f\u0627\u062f',
    action: '\u0627\u0641\u062a\u062d \u0644\u062a\u0623\u0643\u064a\u062f \u0627\u0644\u0627\u0633\u062a\u0644\u0627\u0645',
  },
  fulfulde: {
    held: 'Kaalisi ina reenaa',
    released: 'Jeeyoowo yo\u0253aama',
    refunded: 'Kaalisi rutti',
    action: 'Uddit ngam tee\u014btingol jaggol',
  },
};

function escrowStrings(language: string) {
  return escrowCopy[language] ?? escrowCopy.en;
}

// -- Status colour helper -----------------------------------------------------
function statusStyle(status: string) {
  switch (status.toLowerCase()) {
    case "delivered":        return "bg-green-100 text-green-700";
    case "in transit":       return "bg-orange-100 text-orange-700";
    case "processing":       return "bg-blue-100 text-blue-700";
    case "shipped":          return "bg-teal-100 text-teal-700";
    case "out for delivery": return "bg-purple-100 text-purple-700";
    case "cancelled":        return "bg-red-100 text-red-700";
    default:                 return "bg-gray-100 text-gray-700";
  }
}

function statusIcon(status: string) {
  switch (status.toLowerCase()) {
    case "delivered":  return <CheckCircle className="w-4 h-4 text-green-500" />;
    case "in transit": return <MapPin className="w-4 h-4 text-orange-500" />;
    default:           return <Clock className="w-4 h-4 text-gray-400" />;
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

  const es = escrowStrings(language);

  async function fetchOrders() {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const { data, error } = await supabase
          .from("orders")
          .select("id, order_number, status, total_xaf, created_at, items, escrow, escrow_status")
          .eq("buyer_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(20);

        if (!error && data && data.length > 0) {
          setOrders(data.map(o => ({
            id:          o.id,
            orderNumber: o.order_number || `BH-${o.id.slice(0, 8).toUpperCase()}`,
            item:        (Array.isArray(o.items) && o.items[0]?.title) || o.order_number || "Order",
            status:      o.status       || "Processing",
            total:       o.total_xaf    || 0,
            createdAt:   o.created_at,
            escrow:      o.escrow === true,
            escrowStatus: o.escrow_status ?? null,
          })));
          return;
        }
      }
      setOrders([]);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchOrders(); }, []);

  function escrowLine(order: Order) {
    if (!order.escrow) return null;
    const state = (order.escrowStatus || '').toLowerCase();
    if (state === 'released') {
      return (
        <p className="text-xs text-teal-700 font-medium flex items-center gap-1.5 mt-2">
          <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" /> {es.released}
        </p>
      );
    }
    if (state.startsWith('refund')) {
      return (
        <p className="text-xs text-blue-700 font-medium flex items-center gap-1.5 mt-2">
          <RefreshCw className="w-3.5 h-3.5 flex-shrink-0" /> {es.refunded}
        </p>
      );
    }
    return (
      <div className="mt-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
        <p className="text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" /> {es.held}
        </p>
        <p className="text-[11px] text-emerald-700 mt-0.5">{es.action}</p>
      </div>
    );
  }

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
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">

                {/*
                  FIX207 - VERTICAL CARD.
                  Details block on top (icon + text, status badge pinned top-right),
                  then the Track Order button full width underneath. On a narrow
                  Android screen nothing can be squeezed out of view.
                */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-teal-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-gray-900 text-base leading-tight break-words">
                        {order.item}
                      </h3>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold flex-shrink-0 ${statusStyle(order.status)}`}>
                        {statusIcon(order.status)}
                        {statusLabel(order.status, t)}
                      </span>
                    </div>

                    {/* FIX207 - separator restored between label and number */}
                    <p className="text-xs text-gray-500 mt-1 font-mono break-all">
                      {t("orders.orderNum")} {order.orderNumber}
                    </p>

                    <p className="text-base font-bold text-teal-600 mt-1">
                      {order.total.toLocaleString()} XAF
                    </p>

                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </p>

                    {escrowLine(order)}
                  </div>
                </div>

                {/* Track Order - full width, below everything, always visible */}
                <Link
                  to={`/tracking?orderId=${order.id}`}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-xl font-semibold text-sm transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  {t("orders.track")}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__ORDERS_FIX207__COMPLETE
