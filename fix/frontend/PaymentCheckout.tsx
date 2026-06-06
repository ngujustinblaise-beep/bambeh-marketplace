/**
 * PaymentCheckout.tsx  —  Bambeh Marketplace
 * FILE LOCATION: src/pages/payment/PaymentCheckout.tsx
 *
 * Universal checkout page — handles:
 *  • Cart purchases (items from the marketplace)
 *  • Service bookings
 *  • Escrow initiation
 *
 * State is passed via React Router location.state:
 *  {
 *    items: CartItem[],
 *    subtotal: number,
 *    deliveryFee: number,
 *    total: number,
 *    deliveryAddress: string,
 *    orderId: string,   (optional — generated here if not provided)
 *    context: 'cart' | 'service' | 'escrow'
 *  }
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import CamPayWidget from '@/components/payment/CamPayWidget';
import { supabase } from '@/lib/supabase';

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
  const navigate  = useNavigate();
  const location  = useLocation();
  const state     = (location.state as CheckoutState) ?? null;

  const [orderId,  setOrderId]  = useState('');
  const [userId,   setUserId]   = useState<string | null>(null);
  const [success,  setSuccess]  = useState(false);
  const [orderRef, setOrderRef] = useState('');

  useEffect(() => {
    // Generate order ID if not provided
    const id = state?.orderId ?? `ORD_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    setOrderId(id);

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUserId(session.user.id);
    });
  }, []);

  // Fallback if no state passed (e.g. direct URL navigation)
  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl shadow p-8 text-center max-w-sm">
          <div className="text-5xl mb-4">🛒</div>
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
      ? `Bambeh Order #${orderId} — ${items.length} item(s)`
      : `Bambeh Payment #${orderId}`);

  // ── Called after CamPay confirms SUCCESSFUL ─────────────────────────────
  async function handlePaymentSuccess(reference: string) {
    setOrderRef(reference);

    if (context === 'cart') {
      // Save order to Supabase
      await supabase.from('orders').insert({
        id:               orderId,
        user_id:          userId,
        items:            items,
        subtotal,
        delivery_fee:     deliveryFee,
        total,
        delivery_address: state.deliveryAddress,
        reference,
        status:           'paid',
        paid_at:          new Date().toISOString(),
      });
    } else if (context === 'escrow') {
      await supabase.from('escrow_transactions').insert({
        order_id:   orderId,
        buyer_id:   userId,
        amount:     total,
        reference,
        status:     'payment_confirmed',
        paid_at:    new Date().toISOString(),
      });
    }

    setSuccess(true);
  }

  // ── Success screen ─────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50 p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-sm w-full">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
          <p className="text-gray-600 mb-1">Order ID: <span className="font-mono text-sm">{orderId}</span></p>
          <p className="text-gray-400 text-xs mb-6">Reference: {orderRef}</p>
          <p className="text-sm text-gray-600 mb-6">
            {context === 'escrow'
              ? 'Funds are secured. The seller will now prepare your item.'
              : 'Your order has been placed and will be delivered soon!'}
          </p>
          <button
            onClick={() => navigate(context === 'escrow' ? `/escrow/${orderId}` : '/marketplace')}
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
                  <p className="text-xs font-semibold text-gray-700 mb-1">📍 Delivery to:</p>
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
                externalRef={orderId}
                metadata={{
                  user_id: userId,
                  order_id: orderId,
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
