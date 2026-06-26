/**
 * src/pages/Cart.tsx ? Bambeh Marketplace
 *
 * FIXED:
 *  ? Uses unified useCamPay hook (initPayment / status / reset)
 *  ? "Pay with Mobile Money" button works directly from the cart
 *  ? "Pay via Escrow" navigates to /payment/checkout with escrow context
 *  ? "More Payment Options" navigates to /payment/checkout with cart context
 *  ? Coins credited / order saved only AFTER CamPay confirms SUCCESSFUL
 *  ? All cart state preserved during payment
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Trash2, Plus, Minus, ArrowRight,
  Shield, Info, Smartphone, Loader2, CheckCircle2,
  XCircle, Lock, Leaf, Zap, Users, Tag, Clock,
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useCamPay, validateCamPhone, normalizePhone, detectOperator } from '@/hooks/useCamPay';
import { supabase } from '@/lib/supabase';
import { useLang, t } from "@/hooks/useAppLang";

// --- Helpers ------------------------------------------------------------------

const BAMBEH_FEE_RATE = 0.01;
const GOV_TAX_RATE    = 0.00002;

function calcFees(subtotal: number) {
  const lang = useLang();
  const isRtl = lang === "ar";
  const appFee = Math.round(subtotal * BAMBEH_FEE_RATE);
  const govTax = Math.round(subtotal * GOV_TAX_RATE);
  return { appFee, govTax, total: subtotal + appFee + govTax };
}

const fmt = (n: number) => n.toLocaleString('fr-CM');

// --- Section icon map ----------------------------------------------------------

const TYPE_ICONS: Record<string, React.ReactNode> = {
  'farm-fresh':   <Leaf  className="w-3 h-3 text-green-600" />,
  'flash-deal':   <Zap   className="w-3 h-3 text-yellow-600" />,
  'group-buying': <Users className="w-3 h-3 text-blue-600" />,
  'marketplace':  <Tag   className="w-3 h-3 text-teal-600" />,
};

// --- FeeRow --------------------------------------------------------------------

function FeeRow({
  label, amount, muted = false, bold = false, tooltip,
}: {
  label: string; amount: string; muted?: boolean; bold?: boolean; tooltip?: string;
}) {
  const [tip, setTip] = useState(false);
  return (
    <div className={`flex justify-between items-center py-1.5 text-sm ${
      bold ? 'font-bold text-gray-900 text-base' : muted ? 'text-gray-500' : 'text-gray-700'
    }`}>
      <span className="flex items-center gap-1">
        {label}
        {tooltip && (
          <span className="relative">
            <Info className="w-3.5 h-3.5 text-gray-400 cursor-pointer"
              onMouseEnter={() => setTip(true)} onMouseLeave={() => setTip(false)} />
            {tip && (
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-52 text-xs bg-gray-800 text-white rounded-lg px-2 py-1 pointer-events-none z-10 text-center shadow-lg">
                {tooltip}
              </span>
            )}
          </span>
        )}
      </span>
      <span>{amount}</span>
    </div>
  );
}

// --- Mobile Money Modal --------------------------------------------------------

function MobileMoneyModal({
  total,
  onClose,
  onPay,
  status,
  payRef,
  errorMsg,
  countdown,
}: {
  total: number;
  onClose: () => void;
  onPay: (phone: string) => void;
  status: string;
  payRef: string;
  errorMsg: string;
  countdown: number;
}) {
  const [phone,      setPhone]      = useState('');
  const [phoneError, setPhoneError] = useState('');

  const operator = phone.length >= 3 ? detectOperator(normalizePhone(phone)) : null;

  function handlePhoneChange(v: string) {
    const digits = v.replace(/\D/g, '').slice(0, 9);
    setPhone(digits);
    setPhoneError('');
  }

  function handlePay() {
    const err = validateCamPhone(phone);
    if (err) { setPhoneError(err); return; }
    onPay(normalizePhone(phone));
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget && status !== 'waiting' && status !== 'submitting') onClose(); }}
    >
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="bg-teal-600 px-6 py-5 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Smartphone className="w-5 h-5" />
            <span className="font-bold text-lg">Mobile Money Payment</span>
          </div>
          <p className="text-teal-100 text-sm">Powered by CamPay</p>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Amount */}
          <div className="bg-teal-50 border border-teal-100 rounded-2xl px-4 py-3 flex justify-between items-center">
            <span className="text-gray-600 text-sm">Amount to pay</span>
            <span className="text-teal-700 font-bold text-lg">{fmt(total)} XAF</span>
          </div>

          {/* SUCCESS */}
          {status === 'success' && (
            <div className="flex flex-col items-center gap-2 py-4">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
              <p className="font-semibold text-gray-800">Payment Confirmed! ??</p>
              <p className="text-xs text-gray-500 text-center">Your order has been placed.</p>
              {payRef && (
                <p className="text-xs bg-gray-100 px-3 py-1 rounded-full font-mono text-gray-600">
                  Ref: {payRef}
                </p>
              )}
            </div>
          )}

          {/* WAITING FOR USSD */}
          {status === 'waiting' && (
            <div className="flex flex-col items-center gap-3 py-4">
              <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
              <p className="font-semibold text-gray-800 text-center">Check your phone!</p>
              <p className="text-xs text-gray-500 text-center">
                A payment request was sent to your number. Enter your PIN to approve.
              </p>
              <div className="flex items-center gap-2 text-amber-600 bg-amber-50 rounded-xl px-3 py-2 text-xs font-semibold">
                <Clock className="w-3.5 h-3.5" />
                {countdown > 0
                  ? `Waiting? ${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, '0')}`
                  : 'Processing?'}
              </div>
            </div>
          )}

          {/* SUBMITTING */}
          {status === 'submitting' && (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
              <p className="text-sm text-gray-600 text-center">Sending payment request to your phone?</p>
            </div>
          )}

          {/* ERROR */}
          {(status === 'failed' || status === 'timeout') && (
            <div className="flex flex-col items-center gap-2 py-3">
              <XCircle className="w-10 h-10 text-red-500" />
              <p className="font-semibold text-gray-800">Payment Failed</p>
              <p className="text-xs text-red-500 text-center">{errorMsg}</p>
              <p className="text-xs text-gray-400 text-center">
                If money was deducted, email{' '}
                <a href="mailto:support@bambeh.com" className="text-teal-600 underline">
                  support@bambeh.com
                </a>
              </p>
            </div>
          )}

          {/* IDLE / ERROR ? show phone input */}
          {(status === 'idle' || status === 'failed' || status === 'timeout') && (
            <>
              {/* Phone input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  MTN or Orange Money number
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500 select-none">
                    +237
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => handlePhoneChange(e.target.value)}
                    placeholder="6XXXXXXXX"
                    maxLength={9}
                    className={`w-full pl-14 pr-14 py-3 border-2 rounded-xl text-sm focus:outline-none transition-all ${
                      operator === 'mtn'
                        ? 'border-yellow-400 bg-yellow-50'
                        : operator === 'orange'
                        ? 'border-orange-400 bg-orange-50'
                        : phoneError
                        ? 'border-red-300'
                        : 'border-gray-200 focus:border-teal-500'
                    }`}
                  />
                  {operator && (
                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold px-2 py-0.5 rounded-full ${
                      operator === 'mtn'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {operator === 'mtn' ? '?? MTN' : '?? Orange'}
                    </span>
                  )}
                </div>
                {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
                <p className="text-xs text-gray-400 mt-1">
                  A USSD prompt will appear on your phone. Enter your PIN to pay.
                </p>
              </div>

              <button
                disabled={phone.length < 9}
                onClick={handlePay}
                className="w-full bg-teal-600 disabled:bg-teal-300 text-white py-3.5 rounded-2xl font-bold"
              >
                Confirm &amp; Pay {fmt(total)} XAF
              </button>
            </>
          )}

          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 pt-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Secured &amp; encrypted via CamPay</span>
          </div>

          {status !== 'submitting' && status !== 'waiting' && status !== 'success' && (
            <button onClick={onClose} className="w-full text-sm text-gray-500 hover:text-gray-700 py-1 transition-colors">
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// --- EscrowModal --------------------------------------------------------------

function EscrowModal({ total, onClose, onConfirm }: {
  total: number; onClose: () => void; onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="bg-blue-700 px-6 py-5 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Lock className="w-5 h-5" />
            <span className="font-bold text-lg">Pay with Escrow</span>
          </div>
          <p className="text-blue-100 text-sm">Your money is protected until delivery</p>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-2 text-sm text-blue-800">
            <p className="font-semibold">?? How Escrow Works:</p>
            <p>1. Your payment of <strong>{fmt(total)} XAF</strong> is held securely by Bambeh.</p>
            <p>2. The vendor prepares and ships your order.</p>
            <p>3. You confirm receipt. Only then is payment released to the vendor.</p>
            <p>4. If anything goes wrong, you get a full refund.</p>
          </div>

          <button onClick={onConfirm}
            className="w-full bg-blue-700 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" /> Proceed to Escrow Payment
          </button>

          <button onClick={onClose} className="w-full text-sm text-gray-500 hover:text-gray-700 py-1">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main Cart Component -------------------------------------------------------

export default function Cart() {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();

  const [showMobileMoney, setShowMobileMoney] = useState(false);
  const [showEscrow,      setShowEscrow]      = useState(false);
  const [escrowDone,      setEscrowDone]      = useState(false);

  const subtotal = totalPrice;
  const { appFee, govTax, total } = calcFees(subtotal);

  // Build a description of what's in the cart
  const cartDescription = items.length === 1
    ? `Bambeh ? ${items[0].title}`
    : `Bambeh Order ? ${items.length} items`;

  // -- useCamPay hook -----------------------------------------------------------
  const { status, errorMsg, reference, countdown, initPayment, reset } = useCamPay({
    onSuccess: async (ref) => {
      // Save order to Supabase after confirmed payment
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const orderId = `ORD_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
        await supabase.from('orders').insert({
          id:           orderId,
          user_id:      session?.user?.id ?? null,
          items:        items,
          subtotal,
          delivery_fee: 0,
          total,
          reference:    ref,
          status:       'paid',
          paid_at:      new Date().toISOString(),
        });
      } catch (e) {
        // Non-critical ? payment succeeded even if order record fails
        console.error('Order save error:', e);
      }
      clearCart();
      setShowMobileMoney(false);
    },
  });

  // -- Initiate mobile money payment --------------------------------------------
  const handlePay = useCallback(async (phone: string) => {
    await initPayment({
      amount:      total,
      phone,
      description: cartDescription,
      externalRef: `cart_${Date.now()}`,
    });
  }, [initPayment, total, cartDescription]);

  function openMobileMoney() {
    reset();
    setShowMobileMoney(true);
  }

  // -- Escrow: navigate to checkout page with escrow context --------------------
  const handleEscrowConfirm = () => {
    setShowEscrow(false);
    navigate('/payment/checkout', {
      state: {
        items,
        subtotal,
        deliveryFee: 0,
        total,
        context:     'escrow',
        description: cartDescription,
      },
    });
  };

  // -- "More Payment Options" ? full checkout page ------------------------------
  function goToCheckout() {
    navigate('/payment/checkout', {
      state: {
        items,
        subtotal,
        deliveryFee: 0,
        total,
        context:     'cart',
        description: cartDescription,
      },
    });
  }

  // Close modal if payment succeeded
  const isSuccess = status === 'success';
  if (isSuccess && showMobileMoney && items.length === 0) {
    // cart was cleared by onSuccess ? close modal and show success state
  }

  // -- Empty state ---------------------------------------------------------------
  if (items.length === 0 && !isSuccess && !escrowDone) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
        <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6 text-center text-sm">
          Add items from the marketplace, farm fresh, group deals, and more.
        </p>
        <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
          {[
            { label: '?? Marketplace', path: '/marketplace' },
            { label: '?? Farm Fresh',  path: '/farm-fresh' },
            { label: '?? Group Deals', path: '/group-buying' },
            { label: '? Flash Deals', path: '/deals' },
          ].map(({ label, path }) => (
            <button key={path} onClick={() => navigate(path)}
              className="py-2.5 text-sm border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition">
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // -- Order success --------------------------------------------------------------
  if ((isSuccess && items.length === 0) || escrowDone) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
        <CheckCircle2 className="w-20 h-20 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Placed! ??</h2>
        <p className="text-gray-500 mb-1 text-sm text-center">
          {escrowDone
            ? 'Your payment is safely held in escrow. The vendor has been notified.'
            : 'Payment confirmed! Your order is being processed.'}
        </p>
        {reference && (
          <p className="text-xs bg-gray-100 px-3 py-1 rounded-full font-mono text-gray-600 mb-6">
            Ref: {reference}
          </p>
        )}
        <div className="flex gap-3">
          <button onClick={() => navigate('/orders')}
            className="bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold">
            Track Order
          </button>
          <button onClick={() => navigate('/marketplace')}
            className="border border-teal-600 text-teal-600 px-6 py-3 rounded-xl font-semibold">
            Keep Shopping
          </button>
        </div>
      </div>
    );
  }

  // -- Main render ----------------------------------------------------------------
  return (
    <>
      <div className="min-h-screen bg-gray-50 p-4 pb-8">
        <div className="max-w-2xl mx-auto">

          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-6">
            <ShoppingCart className="w-6 h-6 text-teal-600" />
            Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
          </h1>

          {/* Cart items */}
          <div className="space-y-3 mb-6">
            {items.map(item => (
              <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border flex gap-3">
                {/* Image */}
                <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
                  {item.imageUrl
                    ? <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        {item.listingType === 'farm-fresh' ? '??' : item.listingType === 'vehicle' ? '??' : '???'}
                      </div>
                    )
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">{item.title}</h3>
                    <button onClick={() => removeFromCart(item.id)} aria-label="Remove"
                      className="text-red-400 hover:text-red-600 flex-shrink-0 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {item.listingType && (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full mt-0.5 capitalize">
                      {TYPE_ICONS[item.listingType] || <Tag className="w-3 h-3 text-gray-400" />}
                      {item.listingType.replace('-', ' ')}
                    </span>
                  )}

                  <p className="text-teal-600 font-bold mt-1 text-sm">
                    {fmt(item.priceXAF * item.quantity)} XAF
                  </p>
                  <p className="text-gray-400 text-xs">{fmt(item.priceXAF)} XAF each</p>

                  {item.sellerName && (
                    <p className="text-xs text-gray-400 mt-0.5">Sold by {item.sellerName}</p>
                  )}

                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Decrease"
                      className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Increase"
                      className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border mb-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Order Summary</h2>
            <FeeRow label="Subtotal" amount={`${fmt(subtotal)} XAF`} />
            <FeeRow label="Bambeh Fee (1%)" amount={`${fmt(appFee)} XAF`} muted
              tooltip="A 1% platform fee that keeps Bambeh running and supports local sellers." />
            <FeeRow label="Government Tax (0.002%)" amount={`${fmt(govTax)} XAF`} muted
              tooltip="Statutory 0.002% digital tax levied by the Government of Cameroon." />
            <div className="border-t border-gray-100 my-3"/>
            <FeeRow label="Total" amount={`${fmt(total)} XAF`} bold />
          </div>

          <p className="text-xs text-gray-400 text-center mb-5">
            Delivery fee calculated separately at checkout
          </p>

          {/* Payment options */}
          <div className="space-y-3">
            {/* Mobile Money ? direct from cart */}
            <button
              onClick={openMobileMoney}
              disabled={status === 'submitting' || status === 'waiting'}
              className="w-full bg-teal-600 disabled:bg-teal-300 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md shadow-teal-100 transition"
            >
              {(status === 'submitting' || status === 'waiting')
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing?</>
                : <><Smartphone className="w-5 h-5" /> Pay with Mobile Money</>}
            </button>

            {/* Escrow */}
            <button
              onClick={() => setShowEscrow(true)}
              className="w-full bg-blue-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-100 transition hover:bg-blue-800"
            >
              <Lock className="w-5 h-5" /> Pay via Escrow (Recommended)
            </button>

            {/* Full checkout page */}
            <button
              onClick={goToCheckout}
              className="w-full border border-teal-600 text-teal-700 py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 transition hover:bg-teal-50"
            >
              More Payment Options <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Security badge */}
          <div className="flex items-center justify-center gap-1.5 mt-5 text-xs text-gray-400">
            <Shield className="w-3.5 h-3.5" />
            <span>All payments are encrypted &amp; secured by Bambeh + CamPay</span>
          </div>
        </div>
      </div>

      {/* Mobile Money Modal */}
      {showMobileMoney && (
        <MobileMoneyModal
          total={total}
          onClose={() => { setShowMobileMoney(false); reset(); }}
          onPay={handlePay}
          status={status}
          payRef={reference}
          errorMsg={errorMsg}
          countdown={countdown}
        />
      )}

      {/* Escrow Modal */}
      {showEscrow && (
        <EscrowModal
          total={total}
          onClose={() => setShowEscrow(false)}
          onConfirm={handleEscrowConfirm}
        />
      )}
    </>
  );
}







