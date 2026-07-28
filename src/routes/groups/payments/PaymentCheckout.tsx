// BAMBEH_DEPLOY_TOKEN__PAYMENTCHECKOUT_FIX216_START
/**
 * PaymentCheckout.tsx — Bambeh Marketplace
 * FILE LOCATION: src/routes/groups/payments/PaymentCheckout.tsx   <-- THE WIRED ONE
 *
 * FIX216 — THIS PAGE STOPS TAKING MONEY WITHOUT CREATING AN ORDER.
 * =================================================================
 * FIX189 wrote the order from the browser AFTER CamPay confirmed. That could
 * never work, for a reason that only became visible once the server was read:
 *
 *   orders.seller_id is NOT NULL, and this page has never known who the
 *   seller is. Its items are {id, name, price, quantity, image} — no seller
 *   anywhere. So the insert failed every time and the buyer got the yellow
 *   "payment succeeded but we could not save the order" banner while the
 *   money sat in the Bambeh CamPay balance with nothing pointing at it.
 *
 * A second bug compounded it: externalRef was generated ONCE on mount and
 * reused on every retry, so the second attempt always died on
 * payments_external_ref_unique.
 *
 * WHAT THIS FILE NOW DOES
 * -----------------------
 *  1. CART MODE. It hands cartItems + accessToken to CamPayWidget, which calls
 *     POST /cart. The SERVER verifies prices against the database, reserves
 *     stock, splits the basket into one order per seller with seller_id set,
 *     charges CamPay once and returns the real order id. The browser never
 *     writes an order row again — the client-side insert is DELETED.
 *  2. SELLER RESOLUTION BEFORE ANY MONEY MOVES. Each item id is looked up in
 *     marketplace_listings, then listings, to learn its listingType and owner.
 *     The server re-verifies both, so this is a hint, not a trust boundary.
 *  3. IF AN ITEM CANNOT BE RESOLVED, WE DO NOT CHARGE. A blocking notice is
 *     shown instead. Taking money we cannot attach to an order is the exact
 *     failure this fix exists to end.
 *  4. NO externalRef PROP. useCamPay mints a fresh reference per attempt, so
 *     the duplicate-key collision on retry is gone by deletion.
 *  5. FIX213 NAVIGATION. "Track Escrow" goes to /tracking?orderId=<id> — the
 *     page that carries the escrow panel — or /orders when there is no id.
 *     It never lands on /marketplace again.
 *
 * State is passed via React Router location.state:
 *   { items, subtotal, deliveryFee, total, deliveryAddress,
 *     cartItems?  (already-shaped CartCheckoutItem[]; used as-is if present),
 *     context: 'cart' | 'service' | 'escrow', description? }
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MapPin, ShoppingCart, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import CamPayWidget from '@/components/payment/CamPayWidget';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';
import type { CartCheckoutItem, PaymentSuccessInfo } from '@/hooks/useCamPay';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CheckoutState {
  items?: CartItem[];
  cartItems?: CartCheckoutItem[];
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
    preparing: 'Checking your items...',
    blockedTitle: 'We cannot complete this order yet',
    blockedBody: 'We could not identify the seller of one of these items, so we will not take your money. Please open the item again from the marketplace and add it to your cart from there.',
    signInTitle: 'Please sign in',
    signInBody: 'You need to be signed in so your order can be created and protected by escrow.',
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
    preparing: 'Verification de vos articles...',
    blockedTitle: 'Nous ne pouvons pas encore finaliser cette commande',
    blockedBody: "Nous n'avons pas pu identifier le vendeur d'un de ces articles, donc nous ne prenons pas votre argent. Ouvrez a nouveau l'article depuis la marketplace et ajoutez-le au panier de la.",
    signInTitle: 'Veuillez vous connecter',
    signInBody: 'Vous devez etre connecte pour que votre commande soit creee et protegee par escrow.',
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
    preparing: 'We dey check your things...',
    blockedTitle: 'We no fit finish this order yet',
    blockedBody: 'We no sabi who be the seller for one of these things, so we no go collect your money. Abeg open the thing again for marketplace and put am for cart from there.',
    signInTitle: 'Abeg log in',
    signInBody: 'You must log in so that we fit create your order and keep your money safe.',
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
    preparing: 'جارٍ التحقق من عناصرك...',
    blockedTitle: 'لا يمكننا إتمام هذا الطلب الآن',
    blockedBody: 'لم نتمكن من تحديد بائع أحد هذه العناصر، لذلك لن نأخذ أموالك. يرجى فتح العنصر مرة أخرى من السوق وإضافته إلى السلة من هناك.',
    signInTitle: 'يرجى تسجيل الدخول',
    signInBody: 'يجب تسجيل الدخول حتى يتم إنشاء طلبك وحمايته بالضمان.',
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
    preparing: 'Eɗen ƴeewa kuutorɗe maa...',
    blockedTitle: 'Min mbaawaa timminde ndee ordoru jooni',
    blockedBody: 'Min anndaani jeeyoowo gooto e ɗee kuutorɗe, ndeen min ƴettataa kaalis maa. Tiiɗno uddit kuutorgal ngal e luumo ndee ɓeydaa ngal e panyeeru to ɗoon.',
    signInTitle: 'Tiiɗno naatnu',
    signInBody: 'Ada foti naatde ngam ordoru maa waɗee kadi reenee e escrow.',
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

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * The server's LISTING_TABLES map, mirrored. These are the only listingType
 * values POST /cart understands:
 *   marketplace -> marketplace_listings
 *   listing     -> listings
 * Probe order matters only for speed; the server re-reads the row either way
 * and overrides both price and seller from the database.
 */
const PROBE_TABLES: { table: string; listingType: string }[] = [
  { table: 'marketplace_listings', listingType: 'marketplace' },
  { table: 'listings', listingType: 'listing' },
];

type Resolved = { items: CartCheckoutItem[]; unresolved: string[] };

async function resolveCartItems(items: CartItem[]): Promise<Resolved> {
  const out: CartCheckoutItem[] = [];
  const unresolved: string[] = [];

  for (const item of items) {
    const base: CartCheckoutItem = {
      listingId: UUID_RE.test(String(item.id)) ? String(item.id) : null,
      listingType: null,
      sellerId: null,
      title: String(item.name ?? 'Item').slice(0, 200),
      priceXAF: Math.round(Number(item.price) || 0),
      quantity: Math.max(1, Math.round(Number(item.quantity) || 1)),
    };

    if (!base.listingId) {
      unresolved.push(base.title);
      out.push(base);
      continue;
    }

    let found = false;
    for (const probe of PROBE_TABLES) {
      try {
        const { data, error } = await supabase
          .from(probe.table)
          .select('id, user_id')
          .eq('id', base.listingId)
          .maybeSingle();
        if (error || !data) continue;
        base.listingType = probe.listingType;
        const owner = (data as { user_id?: string | null })?.user_id ?? null;
        if (owner && UUID_RE.test(String(owner))) base.sellerId = String(owner);
        found = !!base.sellerId;
        break;
      } catch {
        // Try the next table.
      }
    }

    if (!found) unresolved.push(base.title);
    out.push(base);
  }

  return { items: out, unresolved };
}

/* ======================================================================== */

export default function PaymentCheckout() {
  const lang  = resolveLang(useLang());
  const c     = COPY[lang];
  const isRtl = lang === 'ar';

  const navigate = useNavigate();
  const location = useLocation();
  const state    = (location.state as CheckoutState) ?? null;

  const [realOrderId, setRealOrderId] = useState<string | null>(state?.orderId ?? null);
  const [displayRef,  setDisplayRef]  = useState('');
  const [userId,      setUserId]      = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [success,     setSuccess]     = useState(false);
  const [orderRef,    setOrderRef]    = useState('');
  const [saveError,   setSaveError]   = useState<string | null>(null);

  const [preparing,  setPreparing]  = useState(true);
  const [cartItems,  setCartItems]  = useState<CartCheckoutItem[]>([]);
  const [unresolved, setUnresolved] = useState<string[]>([]);

  const rawItems   = state?.items ?? [];
  const ctx        = state?.context ?? 'cart';
  const needsOrder = ctx === 'cart' || ctx === 'escrow';

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setDisplayRef(
        state?.orderId ??
        `REF_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`
      );

      const { data: { session } } = await supabase.auth.getSession();
      if (!cancelled) {
        setUserId(session?.user?.id ?? null);
        setAccessToken(session?.access_token ?? null);
      }

      // Already-shaped items win — the caller knows more than we can infer.
      if (state?.cartItems && state.cartItems.length > 0) {
        if (!cancelled) {
          setCartItems(state.cartItems);
          setUnresolved(state.cartItems.filter(i => !i.sellerId).map(i => i.title));
          setPreparing(false);
        }
        return;
      }

      if (rawItems.length === 0) {
        if (!cancelled) setPreparing(false);
        return;
      }

      const resolved = await resolveCartItems(rawItems);
      if (!cancelled) {
        setCartItems(resolved.items);
        setUnresolved(resolved.unresolved);
        setPreparing(false);
      }
    })();

    return () => { cancelled = true; };
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

  const items       = rawItems;
  const total       = state.total;
  const deliveryFee = state.deliveryFee ?? 0;
  const subtotal    = state.subtotal ?? total;
  const context     = ctx;
  const description = state.description
    ?? (items.length > 0
      ? `Bambeh Order ${displayRef} - ${items.length} item(s)`
      : `Bambeh Payment ${displayRef}`);

  /* ---- Called after CamPay confirms SUCCESSFUL --------------------------
   * The order already exists — the server created it before charging. All we
   * do here is remember which one it is. No inserts. */
  async function handlePaymentSuccess(reference: string, info?: PaymentSuccessInfo) {
    setOrderRef(reference);
    setSaveError(null);

    const serverOrderId = info?.orderId ?? null;
    if (serverOrderId) {
      setRealOrderId(serverOrderId);
    } else if (needsOrder) {
      setSaveError(
        `Your payment succeeded (reference ${reference}) but the order id did not come back. ` +
        `Open My Orders — it is usually there. If not, email support@bambeh.com with this reference.`
      );
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
              navigate(context === 'escrow'
                ? (realOrderId ? `/tracking?orderId=${realOrderId}` : '/orders')
                : '/marketplace')
            }
            className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700"
          >
            {context === 'escrow' ? c.trackEscrow : c.keepShopping}
          </button>
        </div>
      </div>
    );
  }

  /* ---- Gate: can this basket legally become an order? ------------------- */
  const cartReady   = cartItems.length > 0 && unresolved.length === 0 && !!accessToken;
  const blocked     = !preparing && needsOrder && !cartReady;
  const blockedByAuth = blocked && !accessToken;

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

              {preparing && (
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-6 text-sm text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                  {c.preparing}
                </div>
              )}

              {blocked && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-900 text-sm mb-1">
                        {blockedByAuth ? c.signInTitle : c.blockedTitle}
                      </p>
                      <p className="text-xs text-amber-900">
                        {blockedByAuth ? c.signInBody : c.blockedBody}
                      </p>
                      {!blockedByAuth && unresolved.length > 0 && (
                        <ul className="mt-2 list-disc ps-4 text-xs text-amber-800">
                          {unresolved.map((t, i) => <li key={i}>{t}</li>)}
                        </ul>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(blockedByAuth ? '/login' : '/marketplace')}
                    className="mt-3 w-full bg-amber-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-amber-700"
                  >
                    {blockedByAuth ? c.signInTitle : c.browse}
                  </button>
                </div>
              )}

              {!preparing && !blocked && (
                <CamPayWidget
                  amount={total}
                  description={description}
                  /* FIX216 — no externalRef prop on purpose. useCamPay mints a
                     fresh one per attempt, so a retry can never collide with
                     payments_external_ref_unique again. */
                  cartItems={cartReady ? cartItems : undefined}
                  accessToken={cartReady ? accessToken : undefined}
                  /* escrow omitted = the server holds the money. Safe default. */
                  metadata={{ user_id: userId, context }}
                  onSuccess={handlePaymentSuccess}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__PAYMENTCHECKOUT_FIX216__COMPLETE
