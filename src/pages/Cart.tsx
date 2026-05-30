import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Shield,
  Info,
  Smartphone,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { BambehImage } from '@/components/ui/BambehImage';
import { useCamPay } from '@/hooks/useCamPay';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  sellerId?: string;
}

type PaymentStatus = 'idle' | 'pending' | 'success' | 'error';

// ─── Fee constants ─────────────────────────────────────────────────────────────

const BAMBEH_FEE_RATE = 0.03;       // 3 %
const GOV_TAX_RATE    = 0.00002;    // 0.002 %

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcFees(subtotal: number) {
  const appFee = Math.round(subtotal * BAMBEH_FEE_RATE);
  const govTax = Math.round(subtotal * GOV_TAX_RATE);
  const total   = subtotal + appFee + govTax;
  return { appFee, govTax, total };
}

function fmt(n: number) { return n.toLocaleString('fr-CM'); }

// ─── Phone validation (basic Cameroonian format) ───────────────────────────────

function isValidCMPhone(phone: string) {
  return /^6[2-9]\d{7}$/.test(phone.replace(/\s/g, ''));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FeeRow({
  label,
  amount,
  muted = false,
  bold  = false,
  tooltip,
}: {
  label: string;
  amount: string;
  muted?: boolean;
  bold?: boolean;
  tooltip?: string;
}) {
  const [tip, setTip] = useState(false);
  return (
    <div
      className={`flex justify-between items-center py-1.5 text-sm ${
        bold ? 'font-bold text-gray-900 text-base' : muted ? 'text-gray-500' : 'text-gray-700'
      }`}
    >
      <span className="flex items-center gap-1">
        {label}
        {tooltip && (
          <span className="relative">
            <Info
              className="w-3.5 h-3.5 text-gray-400 cursor-pointer"
              onMouseEnter={() => setTip(true)}
              onMouseLeave={() => setTip(false)}
            />
            {tip && (
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-48 text-xs bg-gray-800 text-white rounded-lg px-2 py-1 pointer-events-none z-10 text-center shadow-lg">
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

// ─── Payment modal ─────────────────────────────────────────────────────────────

function PaymentModal({
  total,
  onClose,
  onPay,
  status,
  payRef,
  errorMsg,
}: {
  total: number;
  onClose: () => void;
  onPay: (phone: string) => void;
  status: PaymentStatus;
  payRef: string;
  errorMsg: string;
}) {
  const [phone, setPhone] = useState('');
  const valid = isValidCMPhone(phone);

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-teal-600 px-6 py-5 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Smartphone className="w-5 h-5" />
            <span className="font-bold text-lg">Mobile Money Payment</span>
          </div>
          <p className="text-teal-100 text-sm">Powered by CamPay</p>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Amount summary */}
          <div className="bg-teal-50 border border-teal-100 rounded-2xl px-4 py-3 flex justify-between items-center">
            <span className="text-gray-600 text-sm">Amount to pay</span>
            <span className="text-teal-700 font-bold text-lg">{fmt(total)} XAF</span>
          </div>

          {/* States */}
          {status === 'success' && (
            <div className="flex flex-col items-center gap-2 py-4">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
              <p className="font-semibold text-gray-800">Payment Initiated!</p>
              <p className="text-xs text-gray-500 text-center">
                Check your phone and confirm the prompt.
              </p>
              {payRef && (
                <p className="text-xs bg-gray-100 px-3 py-1 rounded-full font-mono text-gray-600">
                  Ref: {payRef}
                </p>
              )}
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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Mobile Money Number
                </label>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-teal-500 transition">
                  <span className="bg-gray-50 px-3 py-3 text-sm text-gray-500 border-r border-gray-200 font-mono">
                    +237
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={9}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="6XXXXXXXX"
                    className="flex-1 px-3 py-3 text-sm outline-none font-mono bg-white"
                  />
                </div>
                {phone.length > 0 && !valid && (
                  <p className="text-xs text-red-500 mt-1">
                    Enter a valid Cameroonian number (e.g. 677123456)
                  </p>
                )}
              </div>

              <button
                disabled={!valid}
                onClick={() => onPay(phone)}
                className="w-full bg-teal-600 disabled:bg-teal-300 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors"
              >
                Confirm & Pay {fmt(total)} XAF
              </button>
            </>
          )}

          {status === 'pending' && (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
              <p className="text-sm text-gray-600 text-center">
                Sending payment request to your phone…
              </p>
            </div>
          )}

          {/* Trust badge */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 pt-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Secured & encrypted via CamPay</span>
          </div>

          {status !== 'pending' && (
            <button
              onClick={onClose}
              className="w-full text-sm text-gray-500 hover:text-gray-700 py-1 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Cart component ───────────────────────────────────────────────────────

export default function Cart() {
  const navigate = useNavigate();
  const { pay, loading: campayLoading } = useCamPay();

  const [items,         setItems]        = useState<CartItem[]>([]);
  const [showModal,     setShowModal]    = useState(false);
  const [payStatus,     setPayStatus]    = useState<PaymentStatus>('idle');
  const [payRef,        setPayRef]       = useState('');
  const [payError,      setPayError]     = useState('');

  // ── Load cart from localStorage ──────────────────────────────────────────────
  useEffect(() => {
    try {
      const stored = localStorage.getItem('bambeh_cart');
      if (stored) setItems(JSON.parse(stored));
    } catch {}
  }, []);

  // ── Persist helpers ───────────────────────────────────────────────────────────
  const save = useCallback((updated: CartItem[]) => {
    setItems(updated);
    try { localStorage.setItem('bambeh_cart', JSON.stringify(updated)); } catch {}
  }, []);

  function remove(id: string) { save(items.filter(i => i.id !== id)); }

  function adjustQty(id: string, delta: number) {
    save(items.map(i =>
      i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i
    ));
  }

  // ── Fee calculations ──────────────────────────────────────────────────────────
  const subtotal        = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const { appFee, govTax, total } = calcFees(subtotal);

  // ── Payment handler ───────────────────────────────────────────────────────────
  async function handlePay(phone: string) {
    setPayStatus('pending');
    setPayError('');
    try {
      const result = await pay(subtotal, phone, 'Bambeh cart payment');
      if (result.success) {
        setPayRef(result.reference ?? '');
        setPayStatus('success');
        // Clear cart after successful payment initiation
        save([]);
      } else {
        setPayError(result.error ?? 'Unknown error. Please try again.');
        setPayStatus('error');
      }
    } catch (err: unknown) {
      setPayError(err instanceof Error ? err.message : 'Network error. Please retry.');
      setPayStatus('error');
    }
  }

  function openModal() {
    setPayStatus('idle');
    setPayRef('');
    setPayError('');
    setShowModal(true);
  }

  function closeModal() {
    if (payStatus === 'pending') return; // don't close mid-flight
    setShowModal(false);
  }

  // ── Empty state ───────────────────────────────────────────────────────────────
  if (items.length === 0 && payStatus !== 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
        <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Cart is empty</h2>
        <p className="text-gray-500 mb-6">Add items from the marketplace</p>
        <button
          onClick={() => navigate('/marketplace')}
          className="bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold"
        >
          Browse Marketplace
        </button>
      </div>
    );
  }

  // ── Paid success state ────────────────────────────────────────────────────────
  if (payStatus === 'success' && items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
        <CheckCircle2 className="w-20 h-20 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Placed!</h2>
        <p className="text-gray-500 mb-1 text-sm">A payment prompt was sent to your phone.</p>
        {payRef && (
          <p className="text-xs bg-gray-100 px-3 py-1 rounded-full font-mono text-gray-600 mb-6">
            Ref: {payRef}
          </p>
        )}
        <button
          onClick={() => navigate('/marketplace')}
          className="bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────────
  return (
    <>
      <div className="min-h-screen bg-gray-50 p-4 pb-8">
        <div className="max-w-2xl mx-auto">

          {/* Page title */}
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-6">
            <ShoppingCart className="w-6 h-6 text-teal-600" />
            Cart ({items.length})
          </h1>

          {/* Cart items */}
          <div className="space-y-3 mb-6">
            {items.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 shadow-sm border flex gap-3"
              >
                {item.image
                  ? <BambehImage src={item.image} alt={item.title} width={64} height={64} imgClassName="rounded-xl" />
                  : <div className="w-16 h-16 bg-gray-100 rounded-xl flex-shrink-0" />
                }
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">{item.title}</h3>
                  <p className="text-teal-600 font-bold mt-1 text-sm">
                    {fmt(item.price * item.quantity)} XAF
                  </p>
                  <p className="text-gray-400 text-xs">{fmt(item.price)} XAF each</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => adjustQty(item.id, -1)}
                      aria-label="Decrease quantity"
                      className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => adjustQty(item.id, 1)}
                      aria-label="Increase quantity"
                      className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => remove(item.id)}
                  aria-label="Remove item"
                  className="text-red-400 hover:text-red-600 flex-shrink-0 self-start mt-1 transition"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          {/* Fee breakdown */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border mb-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
              Order Summary
            </h2>

            <FeeRow label="Subtotal" amount={`${fmt(subtotal)} XAF`} />

            <FeeRow
              label="Bambeh Fee (3%)"
              amount={`${fmt(appFee)} XAF`}
              muted
              tooltip="A 3% platform fee that keeps Bambeh running and supports local sellers."
            />

            <FeeRow
              label="Government Tax (0.002%)"
              amount={`${fmt(govTax)} XAF`}
              muted
              tooltip="Statutory 0.002% digital tax levied by the Government of Cameroon."
            />

            <div className="border-t border-gray-100 my-3" />

            <FeeRow
              label="Total"
              amount={`${fmt(total)} XAF`}
              bold
            />
          </div>

          {/* Delivery note */}
          <p className="text-xs text-gray-400 text-center mb-4">
            Delivery fee calculated separately at checkout
          </p>

          {/* CTA buttons */}
          <button
            onClick={openModal}
            disabled={campayLoading}
            className="w-full bg-teal-600 disabled:bg-teal-300 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md shadow-teal-100 transition mb-3"
          >
            {campayLoading
              ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing…</>
              : <><Smartphone className="w-5 h-5" /> Pay with Mobile Money</>
            }
          </button>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full border border-teal-600 text-teal-700 py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 transition hover:bg-teal-50"
          >
            More options <ArrowRight className="w-4 h-4" />
          </button>

          {/* Security badge */}
          <div className="flex items-center justify-center gap-1.5 mt-5 text-xs text-gray-400">
            <Shield className="w-3.5 h-3.5" />
            <span>Payments are encrypted &amp; secured by CamPay</span>
          </div>
        </div>
      </div>

      {/* Payment modal */}
      {showModal && (
        <PaymentModal
          total={total}
          onClose={closeModal}
          onPay={handlePay}
          status={payStatus}
          payRef={payRef}
          errorMsg={payError}
        />
      )}
    </>
  );
}
