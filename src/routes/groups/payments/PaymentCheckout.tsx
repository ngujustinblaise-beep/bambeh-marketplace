// BAMBEH_DEPLOY_TOKEN__PAYMENTCHECKOUT_FIX685_CLEAN
/**
 * PaymentCheckout.tsx - Bambeh Marketplace
 * FILE LOCATION: src/routes/groups/payments/PaymentCheckout.tsx   <-- THE WIRED ONE (Buy Now)
 *
 * FIX685 - BUY NOW SHOWS THE SAME BREAKDOWN AS THE CART, AND THE TRUE TOTAL.
 * =========================================================================
 * Big, 8 Oct 2026: "Both buy now and add to cart should have the 1% and the service
 * fees ... buy now should have the same showing the user the total and how it is
 * broken down." Until now this page showed the item price as the total (2,000) while
 * the server charged the real price (2,135) - the buyer saw one number on the screen
 * and another on the mobile money prompt.
 *   - The order summary now reads: item price, Bambeh commission (1%), service and
 *     payment charge, total - priced exactly as the payments server prices it (the
 *     August model, per seller, the 4 XAF tax once), so the total on the screen is
 *     the total on the phone.
 *   - "THANK YOU FOR USING BAMBEH SECURED PAY" (FIX684) closes the summary: since
 *     FIX663 every purchase is held until the buyer confirms receipt.
 *   - Items from the cart ("Pay via Escrow", "More Payment Options") arrive with the
 *     cart's field names (title, priceXAF, imageUrl, sellerId). They used to show as
 *     "Item - 0 XAF" here; both shapes are read now, and cart items with a seller are
 *     sent on exactly as the cart's own Pay button sends them.
 *   - Words: "Bambeh Secured Pay" instead of "escrow"; French accents restored.
 *
 * FIX216 (kept): this page never writes an order. CamPayWidget calls POST /cart; the
 * SERVER verifies prices against the database, reserves stock, splits the basket into
 * one order per seller, charges CamPay once and returns the real order id. If an item's
 * seller cannot be identified, nothing is charged. useCamPay mints a fresh reference per
 * attempt, so a retry never collides with payments_external_ref_unique.
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
import SecuredPayNote from '@/components/payment/SecuredPayNote';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';
import type { CartCheckoutItem, PaymentSuccessInfo } from '@/hooks/useCamPay';

/** One line of the basket, whichever page sent it. */
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  listingId: string | null;
  listingType: string | null;
  sellerId: string | null;
}

interface CheckoutState {
  items?: unknown[];
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
    itemPrice: 'Item price', items: 'Items', commission: 'Bambeh commission (1%)', serviceCharge: 'Service and payment charge',
    deliverTo: 'Deliver to', qty: 'Qty', method: 'Payment Method',
    nothingTitle: 'Nothing to pay for', nothingBody: 'Add items to your cart first.',
    browse: 'Browse Marketplace', confirmed: 'Payment Confirmed',
    order: 'Order', reference: 'Reference',
    escrowMsg: 'Your money is held safely by Bambeh Secured Pay. The seller will now prepare your item.',
    cartMsg: 'Your order has been placed.',
    trackOrder: 'Track your order', keepShopping: 'Continue Shopping',
    preparing: 'Checking your items...',
    blockedTitle: 'We cannot complete this order yet',
    blockedBody: 'We could not identify the seller of one of these items, so we will not take your money. Please open the item again from the marketplace and add it to your cart from there.',
    signInTitle: 'Please sign in',
    signInBody: 'You need to be signed in so your order can be created and protected by Bambeh Secured Pay.',
    noOrderId: 'Your payment went through (reference {ref}) but the order number did not come back. Open My Orders - it is usually there. If not, email support@bambeh.com with this reference.',
  },
  fr: {
    back: 'Retour', checkout: 'Paiement', secure: 'Finalisez votre achat en toute s\u00e9curit\u00e9',
    summary: 'R\u00e9capitulatif', subtotal: 'Sous-total', delivery: 'Livraison', total: 'Total',
    itemPrice: "Prix de l'article", items: 'Articles', commission: 'Commission Bambeh (1 %)', serviceCharge: 'Frais de service et de paiement',
    deliverTo: 'Livrer \u00e0', qty: 'Qt\u00e9', method: 'Moyen de paiement',
    nothingTitle: 'Rien \u00e0 payer', nothingBody: "Ajoutez d'abord des articles au panier.",
    browse: 'Parcourir la marketplace', confirmed: 'Paiement confirm\u00e9',
    order: 'Commande', reference: 'R\u00e9f\u00e9rence',
    escrowMsg: 'Votre argent est conserv\u00e9 en s\u00e9curit\u00e9 par Bambeh Secured Pay. Le vendeur va maintenant pr\u00e9parer votre article.',
    cartMsg: 'Votre commande a \u00e9t\u00e9 enregistr\u00e9e.',
    trackOrder: 'Suivre ma commande', keepShopping: 'Continuer mes achats',
    preparing: 'V\u00e9rification de vos articles...',
    blockedTitle: 'Nous ne pouvons pas encore finaliser cette commande',
    blockedBody: "Nous n'avons pas pu identifier le vendeur d'un de ces articles, donc nous ne prenons pas votre argent. Ouvrez \u00e0 nouveau l'article depuis la marketplace et ajoutez-le au panier depuis sa page.",
    signInTitle: 'Veuillez vous connecter',
    signInBody: 'Vous devez \u00eatre connect\u00e9 pour que votre commande soit cr\u00e9\u00e9e et prot\u00e9g\u00e9e par Bambeh Secured Pay.',
    noOrderId: "Votre paiement est pass\u00e9 (r\u00e9f\u00e9rence {ref}) mais le num\u00e9ro de commande n'est pas revenu. Ouvrez Mes commandes : il y est g\u00e9n\u00e9ralement. Sinon, \u00e9crivez \u00e0 support@bambeh.com avec cette r\u00e9f\u00e9rence.",
  },
  pidgin: {
    back: 'Go back', checkout: 'Checkout', secure: 'Finish your buy safe safe',
    summary: 'Wetin you dey buy', subtotal: 'Subtotal', delivery: 'Delivery', total: 'Total',
    itemPrice: 'Price for the thing', items: 'Things', commission: 'Bambeh commission (1%)', serviceCharge: 'Service and payment charge',
    deliverTo: 'Carry am go', qty: 'How many', method: 'How you wan pay',
    nothingTitle: 'Nothing dey for pay', nothingBody: 'Put something inside your cart first.',
    browse: 'Go check marketplace', confirmed: 'Payment don enter',
    order: 'Order', reference: 'Reference',
    escrowMsg: 'Your money dey safe with Bambeh Secured Pay. Seller go prepare your thing now.',
    cartMsg: 'Your order don enter.',
    trackOrder: 'Follow your order', keepShopping: 'Continue to buy',
    preparing: 'We dey check your things...',
    blockedTitle: 'We no fit finish this order yet',
    blockedBody: 'We no sabi who be the seller for one of these things, so we no go collect your money. Abeg open the thing again for marketplace and put am for cart from there.',
    signInTitle: 'Abeg log in',
    signInBody: 'You must log in so that we fit create your order and Bambeh Secured Pay go protect am.',
    noOrderId: 'Your payment don pass (reference {ref}) but the order number no come back. Open My Orders - e dey usually there. If e no dey, email support@bambeh.com with this reference.',
  },
  ar: {
    back: '\u0631\u062c\u0648\u0639', checkout: '\u0627\u0644\u062f\u0641\u0639', secure: '\u0623\u0643\u0645\u0644 \u0639\u0645\u0644\u064a\u0629 \u0627\u0644\u0634\u0631\u0627\u0621 \u0628\u0623\u0645\u0627\u0646',
    summary: '\u0645\u0644\u062e\u0635 \u0627\u0644\u0637\u0644\u0628', subtotal: '\u0627\u0644\u0645\u062c\u0645\u0648\u0639 \u0627\u0644\u0641\u0631\u0639\u064a', delivery: '\u0627\u0644\u062a\u0648\u0635\u064a\u0644', total: '\u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a',
    itemPrice: '\u0633\u0639\u0631 \u0627\u0644\u0645\u0646\u062a\u062c', items: '\u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a', commission: '\u0639\u0645\u0648\u0644\u0629 \u0628\u0627\u0645\u0628\u064a\u0647 (1%)', serviceCharge: '\u0631\u0633\u0648\u0645 \u0627\u0644\u062e\u062f\u0645\u0629 \u0648\u0627\u0644\u062f\u0641\u0639',
    deliverTo: '\u0627\u0644\u062a\u0648\u0635\u064a\u0644 \u0625\u0644\u0649', qty: '\u0627\u0644\u0643\u0645\u064a\u0629', method: '\u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u062f\u0641\u0639',
    nothingTitle: '\u0644\u0627 \u064a\u0648\u062c\u062f \u0645\u0627 \u064a\u064f\u062f\u0641\u0639', nothingBody: '\u0623\u0636\u0641 \u0639\u0646\u0627\u0635\u0631 \u0625\u0644\u0649 \u0633\u0644\u062a\u0643 \u0623\u0648\u0644\u0627\u064b.',
    browse: '\u062a\u0635\u0641\u062d \u0627\u0644\u0633\u0648\u0642', confirmed: '\u062a\u0645 \u062a\u0623\u0643\u064a\u062f \u0627\u0644\u062f\u0641\u0639',
    order: '\u0627\u0644\u0637\u0644\u0628', reference: '\u0627\u0644\u0645\u0631\u062c\u0639',
    escrowMsg: '\u0623\u0645\u0648\u0627\u0644\u0643 \u0645\u062d\u0641\u0648\u0638\u0629 \u0628\u0623\u0645\u0627\u0646 \u0644\u062f\u0649 \u0627\u0644\u062f\u0641\u0639 \u0627\u0644\u0622\u0645\u0646 \u0645\u0646 \u0628\u0627\u0645\u0628\u064a\u0647 (Bambeh Secured Pay). \u0633\u064a\u0642\u0648\u0645 \u0627\u0644\u0628\u0627\u0626\u0639 \u0627\u0644\u0622\u0646 \u0628\u062a\u062d\u0636\u064a\u0631 \u0627\u0644\u0645\u0646\u062a\u062c.',
    cartMsg: '\u062a\u0645 \u062a\u0633\u062c\u064a\u0644 \u0637\u0644\u0628\u0643.',
    trackOrder: '\u062a\u062a\u0628\u0639 \u0637\u0644\u0628\u0643', keepShopping: '\u0645\u0648\u0627\u0635\u0644\u0629 \u0627\u0644\u0634\u0631\u0627\u0621',
    preparing: '\u062c\u0627\u0631\u064d \u0627\u0644\u062a\u062d\u0642\u0642 \u0645\u0646 \u0639\u0646\u0627\u0635\u0631\u0643...',
    blockedTitle: '\u0644\u0627 \u064a\u0645\u0643\u0646\u0646\u0627 \u0625\u062a\u0645\u0627\u0645 \u0647\u0630\u0627 \u0627\u0644\u0637\u0644\u0628 \u0627\u0644\u0622\u0646',
    blockedBody: '\u0644\u0645 \u0646\u062a\u0645\u0643\u0646 \u0645\u0646 \u062a\u062d\u062f\u064a\u062f \u0628\u0627\u0626\u0639 \u0623\u062d\u062f \u0647\u0630\u0647 \u0627\u0644\u0639\u0646\u0627\u0635\u0631\u060c \u0644\u0630\u0644\u0643 \u0644\u0646 \u0646\u0623\u062e\u0630 \u0623\u0645\u0648\u0627\u0644\u0643. \u064a\u0631\u062c\u0649 \u0641\u062a\u062d \u0627\u0644\u0639\u0646\u0635\u0631 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649 \u0645\u0646 \u0627\u0644\u0633\u0648\u0642 \u0648\u0625\u0636\u0627\u0641\u062a\u0647 \u0625\u0644\u0649 \u0627\u0644\u0633\u0644\u0629 \u0645\u0646 \u0647\u0646\u0627\u0643.',
    signInTitle: '\u064a\u0631\u062c\u0649 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644',
    signInBody: '\u064a\u062c\u0628 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u062d\u062a\u0649 \u064a\u062a\u0645 \u0625\u0646\u0634\u0627\u0621 \u0637\u0644\u0628\u0643 \u0648\u062d\u0645\u0627\u064a\u062a\u0647 \u0628\u0627\u0644\u062f\u0641\u0639 \u0627\u0644\u0622\u0645\u0646 \u0645\u0646 \u0628\u0627\u0645\u0628\u064a\u0647.',
    noOrderId: '\u062a\u0645\u062a \u0639\u0645\u0644\u064a\u0629 \u0627\u0644\u062f\u0641\u0639 (\u0627\u0644\u0645\u0631\u062c\u0639 {ref}) \u0644\u0643\u0646 \u0631\u0642\u0645 \u0627\u0644\u0637\u0644\u0628 \u0644\u0645 \u064a\u0635\u0644. \u0627\u0641\u062a\u062d \u0637\u0644\u0628\u0627\u062a\u064a\u060c \u0641\u0647\u0648 \u0645\u0648\u062c\u0648\u062f \u0647\u0646\u0627\u0643 \u0639\u0627\u062f\u0629\u064b. \u0648\u0625\u0646 \u0644\u0645 \u064a\u0643\u0646\u060c \u0631\u0627\u0633\u0644 support@bambeh.com \u0645\u0639 \u0647\u0630\u0627 \u0627\u0644\u0645\u0631\u062c\u0639.',
  },
  ff: {
    back: 'Rutto', checkout: 'Yo\u0253gol', secure: 'Timmin coodgol maa e hoolaare',
    summary: 'Do\u0253\u0253itol ordoru', subtotal: 'Hakkunde', delivery: 'Neldugol', total: 'Fof',
    itemPrice: 'Coggu kuutorgal', items: 'Kuutor\u0257e', commission: 'Komisiyo\u014b Bambeh (1%)', serviceCharge: 'Njo\u0253di carwol e yo\u0253gol',
    deliverTo: 'Neldu to', qty: 'Keewal', method: 'No yo\u0253irtaa',
    nothingTitle: 'Alaa ko yo\u0253etee', nothingBody: 'Naatnu kuutor\u0257e e panyeeru maa tawo.',
    browse: 'Yiy luumo', confirmed: 'Yo\u0253gol ka\u0253\u0253itaama',
    order: 'Ordoru', reference: 'Tonngoode',
    escrowMsg: 'Kaalis maa ina reenaa e jam e Bambeh Secured Pay. Jeeyoowo ina hebilanoo kuutor\u0257am maa jooni.',
    cartMsg: 'Ordoru maa naatii.',
    trackOrder: '\u018aowto ordoru maa', keepShopping: 'Jokku coodgol',
    preparing: 'E\u0257en \u01b4eewa kuutor\u0257e maa...',
    blockedTitle: 'Min mbaawaa timminde ndee ordoru jooni',
    blockedBody: 'Min anndaani jeeyoowo gooto e \u0257ee kuutor\u0257e, ndeen min \u01b4ettataa kaalis maa. Tii\u0257no uddit kuutorgal ngal e luumo ndee \u0253eydaa ngal e panyeeru to \u0257oon.',
    signInTitle: 'Tii\u0257no naatnu',
    signInBody: 'Ada foti naatde ngam ordoru maa wa\u0257ee kadi reenee e Bambeh Secured Pay.',
    noOrderId: 'Yo\u0253gol maa yahii (tonngoode {ref}) kono limoore ordoru ndee artaani. Uddit ordoruuji maa - ina woodi \u0257oon ko heewi. So alaa, winndu support@bambeh.com e ndee tonngoode.',
  },
};

function resolveLang(raw: unknown): LangKey {
  const v = String(raw ?? 'en').toLowerCase();
  if (v === 'pcm' || v === 'pidgin') return 'pidgin';
  if (v === 'fr' || v === 'fra' || v.indexOf('fr-') === 0) return 'fr';
  if (v === 'ar' || v === 'ara' || v.indexOf('ar-') === 0) return 'ar';
  if (v === 'ff' || v === 'ful' || v === 'fuv' || v === 'fulfulde') return 'ff';
  return 'en';
}

const money = (n: number) =>
  new Intl.NumberFormat('fr-CM', { maximumFractionDigits: 0 }).format(Number(n) || 0);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/* ---- Pricing: the SAME numbers as the payments server (FIX662/FIX663) ------
 * IF THE EDGE FUNCTION EVER CHANGES, CHANGE THIS BLOCK IN THE SAME BREATH
 * (and Cart.tsx's calcFees). Integer arithmetic; VAT in ten-thousandths. */
const COMMISSION_BP = 100;   // 1%
const VAT_BP = 1925;         // 19.25%, on the commission only
const GOV_TAX_FLAT = 4;      // XAF, once per payment
const PAYOUT_FEE_BP = 100;   // payout grossed up 1%
const PROCESSING_BP = 400;   // the whole charge divided by 0.96

function priceOrder(subtotal: number, withGovTax: boolean): { commission: number; total: number } {
  if (!(subtotal > 0)) return { commission: 0, total: 0 };
  const commission = Math.round((subtotal * COMMISSION_BP) / 10000);
  const payout = Math.ceil((subtotal * 10000) / (10000 - PAYOUT_FEE_BP));
  const gov = withGovTax ? GOV_TAX_FLAT : 0;
  const numerator = (payout + commission + gov) * 10000 + commission * VAT_BP;
  return { commission, total: Math.ceil(numerator / (10000 - PROCESSING_BP)) };
}

/** What the buyer pays: one order per seller, in basket order, the 4 XAF on the first. */
function priceBasket(lines: { sellerId: string | null; priceXAF: number; quantity: number }[]) {
  const groups: { key: string; subtotal: number }[] = [];
  for (const l of lines) {
    const key = l.sellerId || '?';
    let g = groups.find((x) => x.key === key);
    if (!g) { g = { key, subtotal: 0 }; groups.push(g); }
    g.subtotal += Math.max(0, Math.round(l.priceXAF)) * Math.max(1, Math.round(l.quantity));
  }
  let subtotal = 0; let commission = 0; let total = 0;
  groups.forEach((g, idx) => {
    const o = priceOrder(g.subtotal, idx === 0);
    subtotal += g.subtotal; commission += o.commission; total += o.total;
  });
  return { subtotal, commission, serviceCharge: total - subtotal - commission, total };
}

/** Buy Now sends {id, name, price, image}; the cart sends {title, priceXAF, imageUrl, sellerId, listingId}. */
function normalizeItems(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((r, i) => {
    const o = (r && typeof r === 'object' ? r : {}) as Record<string, unknown>;
    const id = String(o.id ?? o.listingId ?? 'item-' + i);
    const listing = typeof o.listingId === 'string' && UUID_RE.test(o.listingId) ? o.listingId : (UUID_RE.test(id) ? id : null);
    return {
      id,
      name: String(o.name ?? o.title ?? 'Item').slice(0, 200),
      price: Math.round(Number(o.price ?? o.priceXAF) || 0),
      quantity: Math.max(1, Math.round(Number(o.quantity) || 1)),
      image: typeof o.image === 'string' ? o.image : typeof o.imageUrl === 'string' ? o.imageUrl : undefined,
      listingId: listing,
      listingType: typeof o.listingType === 'string' && o.listingType ? o.listingType : null,
      sellerId: typeof o.sellerId === 'string' && UUID_RE.test(o.sellerId) ? o.sellerId : null,
    };
  });
}

/**
 * The server's LISTING_TABLES map, mirrored. These are the only listingType
 * values POST /cart understands when we have to look an item up ourselves:
 *   marketplace -> marketplace_listings
 *   listing     -> listings
 * The server re-reads the row either way and overrides both price and seller.
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
      listingId: item.listingId,
      listingType: item.listingType,
      sellerId: item.sellerId,
      title: item.name,
      priceXAF: item.price,
      quantity: item.quantity,
    };

    // A cart line that already names its listing, type and seller goes on exactly as
    // the cart's own Pay button sends it. The server checks all three.
    if (base.listingId && base.listingType && base.sellerId) {
      out.push(base);
      continue;
    }

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

  const rawItems   = normalizeItems(state?.items);
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

      // Already-shaped items win - the caller knows more than we can infer.
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
  const deliveryFee = state.deliveryFee ?? 0;
  const context     = ctx;

  // FIX685 - what the buyer really pays. For a purchase the server prices the basket
  // itself and ignores any amount sent from a screen, so this page prices it the same
  // way: from the checked cart lines once they are ready, from the items before that.
  const priced = priceBasket(cartItems.length > 0
    ? cartItems.map((i) => ({ sellerId: i.sellerId, priceXAF: Number(i.priceXAF) || 0, quantity: Number(i.quantity) || 1 }))
    : items.map((i) => ({ sellerId: i.sellerId, priceXAF: i.price, quantity: i.quantity })));
  const total       = needsOrder ? priced.total : state.total;
  const subtotal    = needsOrder ? priced.subtotal : (state.subtotal ?? state.total);
  const description = state.description
    ?? (items.length > 0
      ? `Bambeh Order ${displayRef} - ${items.length} item(s)`
      : `Bambeh Payment ${displayRef}`);

  /* ---- Called after CamPay confirms SUCCESSFUL --------------------------
   * The order already exists - the server created it before charging. All we
   * do here is remember which one it is. No inserts. */
  async function handlePaymentSuccess(reference: string, info?: PaymentSuccessInfo) {
    setOrderRef(reference);
    setSaveError(null);

    const serverOrderId = info?.orderId ?? null;
    if (serverOrderId) {
      setRealOrderId(serverOrderId);
    } else if (needsOrder) {
      setSaveError(c.noOrderId.replace('{ref}', reference));
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
            {needsOrder ? c.escrowMsg : c.cartMsg}
          </p>
          <button
            onClick={() =>
              navigate(needsOrder
                ? (realOrderId ? `/tracking?orderId=${realOrderId}` : '/orders')
                : '/marketplace')
            }
            className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700"
          >
            {needsOrder ? c.trackOrder : c.keepShopping}
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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 py-6 px-4" dir={isRtl ? 'rtl' : 'ltr'} data-fix="FIX685">
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

              {needsOrder ? (
                <div className="space-y-2 text-sm" data-breakdown="FIX685">
                  <div className="flex justify-between text-gray-700">
                    <span>{items.length > 1 ? c.items : c.itemPrice}</span><span>{money(subtotal)} XAF</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>{c.commission}</span><span>{money(priced.commission)} XAF</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>{c.serviceCharge}</span><span>{money(priced.serviceCharge)} XAF</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-base">
                    <span>{c.total}</span>
                    <span className="text-teal-600">{money(total)} XAF</span>
                  </div>
                  <SecuredPayNote />
                </div>
              ) : (
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
              )}

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
                  /* FIX216 - no externalRef prop on purpose. useCamPay mints a
                     fresh one per attempt, so a retry can never collide with
                     payments_external_ref_unique again. */
                  cartItems={cartReady ? cartItems : undefined}
                  accessToken={cartReady ? accessToken : undefined}
                  /* escrow omitted = the server holds the money (FIX663: always). */
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
// BAMBEH_END_TOKEN__PAYMENTCHECKOUT_FIX685__COMPLETE
