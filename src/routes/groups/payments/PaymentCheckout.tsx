// BAMBEH_DEPLOY_TOKEN__PAYMENTCHECKOUT_FIX189_START
/**
 * PaymentCheckout.tsx — Bambeh Marketplace
 * FILE LOCATION: src/routes/groups/payments/PaymentCheckout.tsx   <-- THE WIRED ONE
 *
 * FIX189 — THE "ORDER NOT FOUND" FIX
 * ==================================
 * WHY NO PAYMENT HAS EVER SUCCEEDED IN THIS APP:
 *
 * This page invented an order id on mount:
 *     const id = state?.orderId ?? `ORD_${Date.now()}_...`;
 * then sent it to the payment server as metadata.order_id. The server's
 * handleCollect() treats a supplied order_id as the source of truth for the
 * amount:
 *     if (orderId) { const lookup = await resolveOrderAmount(orderId);
 *                    if (!lookup.ok) return fail(lookup.error, 404); }
 * The order was never written to the database, so the lookup found nothing and
 * returned 404 "Order not found." — which surfaced in the app as
 * "Payment failed. failed to fetch." Every payment. Every time.
 *
 * A second hidden bug would have broken it even after that: the old code
 * inserted `id: orderId` (a string like "ORD_1753...") into orders.id, which is
 * a uuid column. Postgres rejects that outright.
 *
 * WHAT THIS FILE NOW DOES
 * -----------------------
 *  1. order_id is sent to the server ONLY when a real order row exists. With no
 *     order_id the server charges the amount directly and succeeds.
 *  2. The order row is written AFTER payment is confirmed, letting Postgres
 *     generate the uuid instead of forcing a fabricated string.
 *  3. Escrow is recorded against the REAL order id, so /escrow can find it.
 *  4. If money is taken but a row fails to save, the user is shown the payment
 *     reference and told to contact support. Money never vanishes silently.
 *  5. All mojibake removed — the old file had "?" where em-dashes and icons
 *     belonged, in the header, the empty state and the delivery block.
 *  6. Fully translated across all five in-app languages, with RTL for Arabic.
 *
 * State is passed via React Router location.state:
 *   { items, subtotal, deliveryFee, total, deliveryAddress,
 *     orderId?  (ONLY pass this if the order genuinely exists in the DB),
 *     context: 'cart' | 'service' | 'escrow', description? }
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MapPin, ShoppingCart, CheckCircle2, AlertTriangle } from 'lucide-react';
import CamPayWidget from '@/components/payment/CamPayWidget';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';

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
  description?: string;
}

/* ---- Translations (all five in-app languages) --------------------------- */
type LangKey = 'en' | 'fr' | 'pidgin' | 'ar' | 'ff';

const COPY: Record<LangKey, Record<string, string>> = {
  en: {
    back: 'Back', checkout: 'Checkout', secure: 'Complete your purchase securely',
    summary: 'Order Summary', subtotal: 'Subtotal', delivery: 'Delivery', total: 'Total',
    deliverTo: 'Deliver to', qty: 'Qty', method: 'Payment Method',
    nothingTitle: 'Nothing to pay for', nothingBody: 'Add items to your cart first.',
    browse: 'Browse Marketplace', confirmed: 'Payment Confirmed',
    order: 'Order', reference: 'Reference',
    escrowMsg: 'Your money is held safely. The seller will now prepare your item.',
    cartMsg: 'Your order has been placed.',
    trackEscrow: 'Track Escrow', keepShopping: 'Continue Shopping',
  },
  fr: {
    back: 'Retour', checkout: 'Paiement', secure: 'Finalisez votre achat en toute securite',
    summary: 'Recapitulatif', subtotal: 'Sous-total', delivery: 'Livraison', total: 'Total',
    deliverTo: 'Livrer a', qty: 'Qte', method: 'Moyen de paiement',
    nothingTitle: 'Rien a payer', nothingBody: "Ajoutez d'abord des articles au panier.",
    browse: 'Parcourir la marketplace', confirmed: 'Paiement confirme',
    order: 'Commande', reference: 'Reference',
    escrowMsg: 'Votre argent est conserve en securite. Le vendeur va preparer votre article.',
    cartMsg: 'Votre commande a ete enregistree.',
    trackEscrow: 'Suivre escrow', keepShopping: 'Continuer les achats',
  },
  pidgin: {
    back: 'Go back', checkout: 'Checkout', secure: 'Finish your buy safe safe',
    summary: 'Wetin you dey buy', subtotal: 'Subtotal', delivery: 'Delivery', total: 'Total',
    deliverTo: 'Carry am go', qty: 'How many', method: 'How you wan pay',
    nothingTitle: 'Nothing dey for pay', nothingBody: 'Put something inside your cart first.',
    browse: 'Go check marketplace', confirmed: 'Payment don enter',
    order: 'Order', reference: 'Reference',
    escrowMsg: 'Your money dey safe. Seller go prepare your thing now.',
    cartMsg: 'Your order don enter.',
    trackEscrow: 'Follow the escrow', keepShopping: 'Continue to buy',
  },
  ar: {
    back: 'رجوع', checkout: 'الدفع', secure: 'أكمل عملية الشراء بأمان',
    summary: 'ملخص الطلب', subtotal: 'المجموع الفرعي', delivery: 'التوصيل', total: 'الإجمالي',
    deliverTo: 'التوصيل إلى', qty: 'الكمية', method: 'طريقة الدفع',
    nothingTitle: 'لا يوجد ما يُدفع', nothingBody: 'أضف عناصر إلى سلتك أولاً.',
    browse: 'تصفح السوق', confirmed: 'تم تأكيد الدفع',
    order: 'الطلب', reference: 'المرجع',
    escrowMsg: 'أموالك محفوظة بأمان. سيقوم البائع بتحضير المنتج الآن.',
    cartMsg: 'تم تسجيل طلبك.',
    trackEscrow: 'تتبع الضمان', keepShopping: 'مواصلة الشراء',
  },
  ff: {
    back: 'Rutto', checkout: 'Yoɓgol', secure: 'Timmin coodgol maa e hoolaare',
    summary: 'Doɓɓitol ordoru', subtotal: 'Hakkunde', delivery: 'Neldugol', total: 'Fof',
    deliverTo: 'Neldu to', qty: 'Keewal', method: 'No yoɓirtaa',
    nothingTitle: 'Alaa ko yoɓetee', nothingBody: 'Naatnu kuutorɗe e panyeeru maa tawo.',
    browse: 'Yiy luumo', confirmed: 'Yoɓgol kaɓɓitaama',
    order: 'Ordoru', reference: 'Tonngoode',
    escrowMsg: 'Kaalis maa ina reenaa e jam. Jeeyoowo ina hebilanoo kuutorɗam maa.',
    cartMsg: 'Ordoru maa naatii.',
    trackEscrow: 'Ɗowto escrow', keepShopping: 'Jokku coodgol',
  },
};

function resolveLang(raw: unknown): LangKey {
  const v = String(raw ?? 'en').toLowerCase();
  if (v === 'pcm' || v === 'pidgin') return 'pidgin';
  if (v === 'fr' || v === 'fra') return 'fr';
  if (v === 'ar' || v === 'ara') return 'ar';
  if (v === 'ff' || v === 'ful' || v === 'fuv') return 'ff';
  return 'en';
}

const money = (n: number) =>
  new Intl.NumberFormat('fr-CM', { maximumFractionDigits: 0 }).format(Number(n) || 0);

/* ======================================================================== */

export default function PaymentCheckout() {
  const lang  = resolveLang(useLang());
  const c     = COPY[lang];
  const isRtl = lang === 'ar';

  const navigate = useNavigate();
  const location = useLocation();
  const state    = (location.state as CheckoutState) ?? null;

  // FIX189 — realOrderId is set ONLY when a row genuinely exists in `orders`.
  // displayRef is cosmetic and is NEVER sent to the server as an order id.
  const [realOrderId, setRealOrderId] = useState<string | null>(state?.orderId ?? null);
  const [displayRef,  setDisplayRef]  = useState('');
  const [userId,      setUserId]      = useState<string | null>(null);
  const [success,     setSuccess]     = useState(false);
  const [orderRef,    setOrderRef]    = useState('');
  const [saveError,   setSaveError]   = useState<string | null>(null);

  useEffect(() => {
    setDisplayRef(
      state?.orderId ??
      `REF_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`
    );
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUserId(session.user.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- No state (direct URL navigation) --------------------------------- */
  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="bg-white rounded-2xl shadow p-8 text-center max-w-sm">
          <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">{c.nothingTitle}</h2>
          <p className="text-gray-500 mb-4">{c.nothingBody}</p>
          <button
            onClick={() => navigate('/marketplace')}
            className="bg-teal-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-teal-700"
          >
            {c.browse}
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
      ? `Bambeh Order ${displayRef} - ${items.length} item(s)`
      : `Bambeh Payment ${displayRef}`);

  /* ---- Called after CamPay confirms SUCCESSFUL -------------------------- */
  async function handlePaymentSuccess(reference: string) {
    setOrderRef(reference);
    setSaveError(null);

    let orderIdForEscrow = realOrderId;

    // FIX189 — write the order AFTER confirmation; Postgres generates the uuid.
    if (!orderIdForEscrow && userId) {
      const { data: created, error: orderErr } = await supabase
        .from('orders')
        .insert({
          buyer_id:          userId,
          user_id:           userId,
          status:            'paid',
          total_xaf:         total,
          items:             items,
          delivery_address:  state.deliveryAddress ?? null,
          payment_method:    'campay',
          payment_reference: reference,
          paid_at:           new Date().toISOString(),
        })
        .select('id')
        .single();

      if (orderErr) {
        // The money IS taken by now. Never swallow this.
        setSaveError(
          `Your payment succeeded (reference ${reference}) but we could not save the order. ` +
          `Please email support@bambeh.com with this reference and we will complete it for you.`
        );
      } else {
        orderIdForEscrow = created?.id ?? null;
        setRealOrderId(orderIdForEscrow);
      }
    }

    // Escrow: record against the REAL order id so /escrow/:orderId resolves.
    if (context === 'escrow' && orderIdForEscrow && userId) {
      const { error: escErr } = await supabase.from('escrow_transactions').insert({
        order_id:             orderIdForEscrow,
        buyer_id:             userId,
        amount:               total,
        currency:             'XAF',
        status:               'payment_confirmed',
        campay_reference:     reference,
        payment_confirmed_at: new Date().toISOString(),
      });
      if (escErr) {
        setSaveError(
          `Payment confirmed (reference ${reference}) but escrow could not be opened. ` +
          `Please email support@bambeh.com with this reference.`
        );
      }
    }

    setSuccess(true);
  }

  /* ---- Success screen --------------------------------------------------- */
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50 p-6" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-sm w-full">
          <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{c.confirmed}</h2>
          <p className="text-gray-600 mb-1">
            {c.order}:{' '}
            <span className="font-mono text-sm">
              {realOrderId ? realOrderId.slice(0, 8) : displayRef}
            </span>
          </p>
          <p className="text-gray-400 text-xs mb-4">{c.reference}: {orderRef}</p>

          {saveError && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-start text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{saveError}</span>
            </div>
          )}

          <p className="text-sm text-gray-600 mb-6">
            {context === 'escrow' ? c.escrowMsg : c.cartMsg}
          </p>
          <button
            onClick={() =>
              navigate(context === 'escrow' && realOrderId ? `/escrow/${realOrderId}` : '/marketplace')
            }
            className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700"
          >
            {context === 'escrow' ? c.trackEscrow : c.keepShopping}
          </button>
        </div>
      </div>
    );
  }

  /* ---- Checkout -------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 py-6 px-4" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl mx-auto">

        <div className="bg-white rounded-2xl shadow p-5 mb-5">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-teal-600 font-medium mb-3 text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> {c.back}
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{c.checkout}</h1>
          <p className="text-gray-500 text-sm">{c.secure}</p>
        </div>

        <div className="grid md:grid-cols-5 gap-5">
          {/* Order summary */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow p-5 sticky top-5">
              <h2 className="font-bold text-gray-900 mb-4">{c.summary}</h2>

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
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">{c.qty}: {item.quantity}</p>
                        <p className="text-sm font-semibold text-teal-600">
                          {money(item.price * item.quantity)} XAF
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>{c.subtotal}</span><span>{money(subtotal)} XAF</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>{c.delivery}</span><span>{money(deliveryFee)} XAF</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-bold text-base">
                  <span>{c.total}</span>
                  <span className="text-teal-600">{money(total)} XAF</span>
                </div>
              </div>

              {state.deliveryAddress && (
                <div className="mt-4 bg-teal-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {c.deliverTo}
                  </p>
                  <p className="text-xs text-gray-600">{state.deliveryAddress}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-2xl shadow p-5">
              <h2 className="font-bold text-gray-900 mb-5">{c.method}</h2>
              <CamPayWidget
                amount={total}
                description={description}
                externalRef={displayRef}
                /* FIX189 — order_id is sent ONLY when a real order row exists.
                   Sending a fabricated id is what made the server answer
                   404 "Order not found." for every single payment. */
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
// BAMBEH_DEPLOY_TOKEN__PAYMENTCHECKOUT_FIX189_END
