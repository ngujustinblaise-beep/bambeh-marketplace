/**
 * PaymentCheckout.tsx — Bambeh Marketplace
 *
 * FIX189 — THE ORDER-NOT-FOUND FIX
 * ---------------------------------
 * This page used to invent an order id (`ORD_<timestamp>_<random>`) that was
 * never written to the database, then send it to the payment server as
 * metadata.order_id. The server looked the order up to read its true amount,
 * found nothing, and returned 404 "Order not found." — surfacing in the app
 * as "Payment failed. failed to fetch." NO payment could ever succeed.
 *
 * The rule is simple: only send order_id when the order REALLY exists in the
 * database. This page now:
 *   • passes order_id ONLY when it was handed a real one (state.orderId)
 *   • otherwise sends no order_id, so the server charges the amount directly
 *   • writes the order row only AFTER payment is confirmed, using the DB's
 *     own generated uuid instead of a fabricated string id
 *   • records escrow against the real order id, so /escrow can find it
 *
 * Note on ids: the old code set `id: orderId` on insert with a value like
 * "ORD_1753...", but orders.id is a uuid column — that insert would have been
 * rejected even if payment had worked.

 * FILE LOCATION: src/pages/payment/PaymentCheckout.tsx
 *
 * Universal checkout page ? handles:
 *  ? Cart purchases (items from the marketplace)
 *  ? Service bookings
 *  ? Escrow initiation
 *
 * State is passed via React Router location.state:
 *  {
 *    items: CartItem[],
 *    subtotal: number,
 *    deliveryFee: number,
 *    total: number,
 *    deliveryAddress: string,
 *    orderId: string,   (optional ? generated here if not provided)
 *    context: 'cart' | 'service' | 'escrow'
 *  }
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import CamPayWidget from '@/components/payment/CamPayWidget';
import { supabase } from '@/lib/supabase';
import { useLang, t } from "@/hooks/useAppLang";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CheckoutState {
  items?: CartItem[];
  subtotal?: number;
  deliveryFee?: number;
  total: number;
  deliveryAddress?: string;
  orderId?: string;
  context?: 'cart' | 'service' | 'escrow';
  description?: string;  // for single-item or service payments
}

export default function PaymentCheckout() {
  const lang = useLang();
  const isRtl = lang === "ar";
  const navigate  = useNavigate();
  const location  = useLocation();
  const state     = (location.state as CheckoutState) ?? null;

  // FIX189 — realOrderId is only ever set when a row genuinely exists in
  // the orders table. displayRef is cosmetic (shown to the user) and is NEVER
  // sent to the payment server as an order id.
  const [realOrderId, setRealOrderId] = useState<string | null>(state?.orderId ?? null);
  const [displayRef,  setDisplayRef]  = useState('');
  const [userId,   setUserId]   = useState<string | null>(null);
  const [success,  setSuccess]  = useState(false);
  const [orderRef, setOrderRef] = useState('');
  // FIX189 — surfaced when money was taken but the row could not be written.
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    // FIX189 — a human-readable reference for the UI only. This is NOT an
    // order id and is never used to look up an order on the server.
    setDisplayRef(state?.orderId ?? `REF_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`);

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUserId(session.user.id);
    });
  }, []);

  // Fallback if no state passed (e.g. direct URL navigation)
  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl shadow p-8 text-center max-w-sm">
          <div className="text-5xl mb-4">??</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No items to pay for</h2>
          <p className="text-gray-500 mb-4">Please add items to your cart first.</p>
          <button
            onClick={() => navigate('/marketplace')}
            className="bg-teal-600 text-white px-5 py-2.5 rounded-xl font-semibold"
          >
            Browse Marketplace
          </button>
        </div>
      </div>
    );
  }

  const items       = state.items ?? [];
  const total       = state.total;
  const deliveryFee = state.deliveryFee ?? 0;
  const subtotal    = state.subtotal ?? total;
  const context     = state.context ?? 'cart';
  const description = state.description
    ?? (items.length > 0
      ? `Bambeh Order ${displayRef} — ${items.length} item(s)`
      : `Bambeh Payment ${displayRef}`);

  // -- Called after CamPay confirms SUCCESSFUL -----------------------------
  async function handlePaymentSuccess(reference: string) {
    setOrderRef(reference);

    // FIX189 — write the order AFTER payment is confirmed and let Postgres
    // generate the uuid. The old code forced id: 'ORD_...' into a uuid column.
    let orderIdForEscrow = realOrderId;

    if (!orderIdForEscrow && userId) {
      const { data: created, error: orderErr } = await supabase
        .from('orders')
        .insert({
          buyer_id:         userId,
          user_id:          userId,
          status:           'paid',
          total_xaf:        total,
          items:            items,
          delivery_address: state.deliveryAddress ?? null,
          payment_method:   'campay',
          payment_reference: reference,
          paid_at:          new Date().toISOString(),
        })
        .select('id')
        .single();

      if (orderErr) {
        // The money IS taken at this point — never silently swallow this.
        setSaveError(
          'Your payment went through (reference ' + reference + ') but we could ' +
          'not save the order. Please contact support@bambeh.com with this ' +
          'reference and we will complete it for you.'
        );
      } else {
        orderIdForEscrow = created?.id ?? null;
        setRealOrderId(orderIdForEscrow);
      }
    }

    // Escrow: record against the REAL order id so /escrow/:orderId resolves.
    if (context === 'escrow' && orderIdForEscrow && userId) {
      const { error: escErr } = await supabase.from('escrow_transactions').insert({
        order_id:   orderIdForEscrow,
        buyer_id:   userId,
        amount:     total,
        currency:   'XAF',
        status:     'payment_confirmed',
        payment_ref: reference,
        campay_reference: reference,
        payment_confirmed_at: new Date().toISOString(),
      });
      if (escErr) {
        setSaveError(
          'Payment confirmed (reference ' + reference + ') but escrow could not ' +
          'be opened. Contact support@bambeh.com with this reference.'
        );
      }
    }

    setSuccess(true);
  }

  // -- Success screen ---------------------------------------------------------
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50 p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-sm w-full">
          <div className="text-6xl mb-4">??</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
          <p className="text-gray-600 mb-1">Order: <span className="font-mono text-sm">{realOrderId ? realOrderId.slice(0, 8) : displayRef}</span></p>
          <p className="text-gray-400 text-xs mb-6">Reference: {orderRef}</p>
          {saveError && (
            <p className="mb-4 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-left text-xs text-amber-900">
              {saveError}
            </p>
          )}
          <p className="text-sm text-gray-600 mb-6">
            {context === 'escrow'
              ? 'Funds are secured. The seller will now prepare your item.'
              : 'Your order has been placed and will be delivered soon!'}
          </p>
          <button
            onClick={() => navigate(context === 'escrow' && realOrderId ? `/escrow/${realOrderId}` : '/marketplace')}
            className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold"
          >
            {context === 'escrow' ? 'Track Escrow' : 'Continue Shopping'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 py-6 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow p-5 mb-5">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-teal-600 font-medium mb-3 text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-500 text-sm">Complete your purchase securely</p>
        </div>

        <div className="grid md:grid-cols-5 gap-5">
          {/* Order summary */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow p-5 sticky top-5">
              <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>

              {items.length > 0 && (
                <div className="space-y-3 mb-5 max-h-64 overflow-y-auto">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-3 pb-3 border-b border-gray-100">
                      <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={e => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        <p className="text-sm font-semibold text-teal-600">
                          {(item.price * item.quantity).toLocaleString()} XAF
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{subtotal.toLocaleString()} XAF</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span>{deliveryFee.toLocaleString()} XAF</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-teal-600">{total.toLocaleString()} XAF</span>
                </div>
              </div>

              {state.deliveryAddress && (
                <div className="mt-4 bg-teal-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-gray-700 mb-1">?? Delivery to:</p>
                  <p className="text-xs text-gray-600">{state.deliveryAddress}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-2xl shadow p-5">
              <h2 className="font-bold text-gray-900 mb-5">Payment Method</h2>
              <CamPayWidget
                amount={total}
                description={description}
                externalRef={displayRef}
                /* FIX189 — order_id is sent ONLY when a real order row exists.
                   Sending a fabricated id made the server return 404 "Order
                   not found." for every single payment. */
                metadata={{
                  user_id: userId,
                  ...(realOrderId ? { order_id: realOrderId } : {}),
                  context,
                }}
                onSuccess={handlePaymentSuccess}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}





