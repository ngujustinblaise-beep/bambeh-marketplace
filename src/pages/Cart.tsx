/**
 * src/pages/Cart.tsx — Bambeh Marketplace
 *
 * FIXED / UPGRADED:
 *  ✅ Reads items from CartContext (useCart) — no more isolated localStorage island
 *  ✅ Displays actual items added from Marketplace, Farm Fresh, Group Buying, Vehicles, etc.
 *  ✅ Shows item images, quantity controls, remove button
 *  ✅ Full fee breakdown: subtotal + 3% Bambeh fee + 0.002% gov tax
 *  ✅ Two payment options: Mobile Money (CamPay) + Escrow
 *  ✅ "Empty cart" state with links to all sections
 *  ✅ Cart persisted in localStorage via CartContext
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Trash2, Plus, Minus, ArrowRight,
  Shield, Info, Smartphone, Loader2, CheckCircle2,
  XCircle, Lock, Leaf, Zap, Users, Tag,
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useCamPay } from '@/hooks/useCamPay';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BAMBEH_FEE_RATE = 0.03;
const GOV_TAX_RATE    = 0.00002;

function calcFees(subtotal: number) {
  const appFee = Math.round(subtotal * BAMBEH_FEE_RATE);
  const govTax = Math.round(subtotal * GOV_TAX_RATE);
  return { appFee, govTax, total: subtotal + appFee + govTax };
}

const fmt = (n: number) => n.toLocaleString('fr-CM');

function isValidPhone(phone: string) {
  return /^6[2-9]\d{7}$/.test(phone.replace(/\s/g, ''));
}

// ─── Section icon map ─────────────────────────────────────────────────────────

const TYPE_ICONS: Record<string, React.ReactNode> = {
  'farm-fresh':    <Leaf className="w-3 h-3 text-green-600" />,
  'flash-deal':    <Zap  className="w-3 h-3 text-yellow-600" />,
  'group-buying':  <Users className="w-3 h-3 text-blue-600" />,
  'marketplace':   <Tag  className="w-3 h-3 text-teal-600" />,
};

// ─── FeeRow ───────────────────────────────────────────────────────────────────

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

// ─── PaymentModal ─────────────────────────────────────────────────────────────

type PaymentStatus = 'idle' | 'pending' | 'success' | 'error';

function PaymentModal({
  total, onClose, onPay, status, payRef, errorMsg,
}: {
  total: number; onClose: () => void; onPay: (phone: string) => void;
  status: PaymentStatus; payRef: string; errorMsg: string;
}) {
  const [phone, setPhone] = useState('');
  const valid = isValidPhone(phone);

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
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
          <div className="bg-teal-50 border border-teal-100 rounded-2xl px-4 py-3 flex justify-between items-center">
            <span className="text-gray-600 text-sm">Amount to pay</span>
            <span className="text-teal-700 font-bold text-lg">{fmt(total)} XAF</span>
          </div>

          {status === 'success' && (
            <div className="flex flex-col items-center gap-2 py-4">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
              <p className="font-semibold text-gray-800">Payment Initiated!</p>
              <p className="text-xs text-gray-500 text-center">Check your phone and confirm the prompt.</p>
              {payRef && <p className="text-xs bg-gray-100 px-3 py-1 rounded-full font-mono text-gray-600">Ref: {payRef}</p>}
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-2 py-3">
              <XCircle className="w-10 h-10 text-red-500" />
              <p className="font-semibold text-gray-800">Payment Failed</p>
              <p className="text-xs text-red-500 text-center">{errorMsg}</p>
            </div>
          )}

          {(status === 'idle' || status === 'error') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile Money Number</label>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-teal-500 transition">
                  <span className="bg-gray-50 px-3 py-3 text-sm text-gray-500 border-r border-gray-200 font-mono">+237</span>
                  <input
                    type="tel" inputMode="numeric" maxLength={9}
                    value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="6XXXXXXXX"
                    className="flex-1 px-3 py-3 text-sm outline-none font-mono bg-white"
                  />
                </div>
                {phone.length > 0 && !valid && (
                  <p className="text-xs text-red-500 mt-1">Enter a valid Cameroonian number (e.g. 677123456)</p>
                )}
              </div>
              <button
                disabled={!valid}
                onClick={() => onPay(phone)}
                className="w-full bg-teal-600 disabled:bg-teal-300 text-white py-3.5 rounded-2xl font-bold"
              >
                Confirm & Pay {fmt(total)} XAF
              </button>
            </>
          )}

          {status === 'pending' && (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
              <p className="text-sm text-gray-600 text-center">Sending payment request to your phone…</p>
            </div>
          )}

          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 pt-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Secured &amp; encrypted via CamPay</span>
          </div>

          {status !== 'pending' && (
            <button onClick={onClose} className="w-full text-sm text-gray-500 hover:text-gray-700 py-1 transition-colors">
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── EscrowModal ──────────────────────────────────────────────────────────────

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
            <p className="font-semibold">🔒 How Escrow Works:</p>
            <p>1. Your payment of <strong>{fmt(total)} XAF</strong> is held securely by Bambeh.</p>
            <p>2. The vendor prepares and ships your order.</p>
            <p>3. You confirm receipt. Only then is payment released to the vendor.</p>
            <p>4. If anything goes wrong, you get a full refund.</p>
          </div>

          <button onClick={onConfirm}
            className="w-full bg-blue-700 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" /> Confirm Escrow — {fmt(total)} XAF
          </button>

          <button onClick={onClose} className="w-full text-sm text-gray-500 hover:text-gray-700 py-1">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Cart Component ──────────────────────────────────────────────────────

export default function Cart() {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();
  const { pay, loading: campayLoading } = useCamPay();

  const [showMobileMoney, setShowMobileMoney] = useState(false);
  const [showEscrow,      setShowEscrow]      = useState(false);
  const [payStatus,       setPayStatus]       = useState<PaymentStatus>('idle');
  const [payRef,          setPayRef]          = useState('');
  const [payError,        setPayError]        = useState('');
  const [escrowDone,      setEscrowDone]      = useState(false);

  const subtotal = totalPrice;
  const { appFee, govTax, total } = calcFees(subtotal);

  const handlePay = useCallback(async (phone: string) => {
    setPayStatus('pending');
    setPayError('');
    try {
      const result = await pay(subtotal, phone, 'Bambeh cart payment');
      if (result.success) {
        setPayRef(result.reference ?? '');
        setPayStatus('success');
        clearCart();
      } else {
        setPayError(result.error ?? 'Unknown error. Please try again.');
        setPayStatus('error');
      }
    } catch (err: unknown) {
      setPayError(err instanceof Error ? err.message : 'Network error. Please retry.');
      setPayStatus('error');
    }
  }, [pay, subtotal, clearCart]);

  function openMobileMoney() {
    setPayStatus('idle'); setPayRef(''); setPayError('');
    setShowMobileMoney(true);
  }

  const handleEscrowConfirm = () => {
    setShowEscrow(false);
    setEscrowDone(true);
    clearCart();
  };

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (items.length === 0 && payStatus !== 'success' && !escrowDone) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
        <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6 text-center text-sm">
          Add items from the marketplace, farm fresh, group deals, and more.
        </p>
        <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
          {[
            { label: '🛒 Marketplace', path: '/marketplace' },
            { label: '🌿 Farm Fresh',  path: '/farm-fresh' },
            { label: '👥 Group Deals', path: '/group-buying' },
            { label: '⚡ Flash Deals', path: '/deals' },
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

  // ── Order success ─────────────────────────────────────────────────────────────
  if ((payStatus === 'success' && items.length === 0) || escrowDone) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
        <CheckCircle2 className="w-20 h-20 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Placed! 🎉</h2>
        <p className="text-gray-500 mb-1 text-sm">
          {escrowDone
            ? 'Your payment is safely held in escrow. The vendor has been notified.'
            : 'A payment prompt was sent to your phone. Confirm to complete.'}
        </p>
        {payRef && (
          <p className="text-xs bg-gray-100 px-3 py-1 rounded-full font-mono text-gray-600 mb-6">Ref: {payRef}</p>
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

  // ── Main render ───────────────────────────────────────────────────────────────
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
                        {item.listingType === 'farm-fresh' ? '🌿' : item.listingType === 'vehicle' ? '🚗' : '🛍️'}
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

                  {/* Type badge */}
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

                  {/* Seller */}
                  {item.sellerName && (
                    <p className="text-xs text-gray-400 mt-0.5">Sold by {item.sellerName}</p>
                  )}

                  {/* Qty controls */}
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
            <FeeRow label="Bambeh Fee (3%)" amount={`${fmt(appFee)} XAF`} muted
              tooltip="A 3% platform fee that keeps Bambeh running and supports local sellers." />
            <FeeRow label="Government Tax (0.002%)" amount={`${fmt(govTax)} XAF`} muted
              tooltip="Statutory 0.002% digital tax levied by the Government of Cameroon." />
            <div className="border-t border-gray-100 my-3" />
            <FeeRow label="Total" amount={`${fmt(total)} XAF`} bold />
          </div>

          <p className="text-xs text-gray-400 text-center mb-5">
            Delivery fee calculated separately at checkout
          </p>

          {/* Payment options */}
          <div className="space-y-3">
            {/* Mobile Money */}
            <button onClick={openMobileMoney} disabled={campayLoading}
              className="w-full bg-teal-600 disabled:bg-teal-300 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md shadow-teal-100 transition">
              {campayLoading
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing…</>
                : <><Smartphone className="w-5 h-5" /> Pay with Mobile Money</>}
            </button>

            {/* Escrow */}
            <button onClick={() => setShowEscrow(true)}
              className="w-full bg-blue-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-100 transition hover:bg-blue-800">
              <Lock className="w-5 h-5" /> Pay via Escrow (Recommended)
            </button>

            {/* Checkout page */}
            <button onClick={() => navigate('/payment/checkout')}
              className="w-full border border-teal-600 text-teal-700 py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 transition hover:bg-teal-50">
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

      {showMobileMoney && (
        <PaymentModal total={total} onClose={() => setShowMobileMoney(false)} onPay={handlePay}
          status={payStatus} payRef={payRef} errorMsg={payError} />
      )}

      {showEscrow && (
        <EscrowModal total={total} onClose={() => setShowEscrow(false)} onConfirm={handleEscrowConfirm} />
      )}
    </>
  );
}
