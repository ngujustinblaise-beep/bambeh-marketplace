// BAMBEH_DEPLOY_TOKEN__ORDERTRACKING_FIX140_REAL_CLEAN
/**
 * OrderTracking.tsx â€” Bambeh Marketplace (FIX140)
 * FILE LOCATION: src/pages/OrderTracking.tsx  (REPLACES the fully-mock version)
 *
 * REAL data â€” the fabricated BMB-0000000X order, fake items, fake customer and
 * fake courier are all removed. Built on the confirmed `orders` schema
 * (fix140a recon): order_number, status, total_xaf, items jsonb,
 * delivery_address/city, payment_method, payment_reference/payment_ref,
 * paid_at, escrow_status, created_at, updated_at â€” plus order_items rows
 * when present.
 *
 *  â€¢ Loads the order by id for the signed-in user (RLS-safe).
 *  â€¢ Status timeline: pending â†’ confirmed â†’ processing â†’ shipped â†’
 *    out for delivery â†’ delivered; cancelled/failed shown honestly.
 *  â€¢ Items from order_items table, falling back to the items jsonb.
 *  â€¢ Copy order number, refresh, back button. 5 languages + RTL.
 *
 * Â© 2026 BAMBEH SARL. All rights reserved.
 */

import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Package, ArrowLeft, RefreshCw, CheckCircle, Clock, Truck, MapPin,
  AlertCircle, Copy, Check, CreditCard, ShieldCheck,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';
import EscrowActionPanel from '@/components/EscrowActionPanel';
import OrderInvoice from '@/components/OrderInvoice';

// -- i18n ----------------------------------------------------------------------
const strings = {
  en: {
    title: 'Order Tracking', refresh: 'Refresh', copied: 'Copied!',
    notFound: 'Order not found. It may belong to another account.',
    loadError: 'Could not load the order. Please try again.', retry: 'Retry',
    orderNum: 'Order', placed: 'Placed', updated: 'Updated',
    itemsTitle: 'Items', qty: 'Qty', total: 'Total',
    payTitle: 'Payment', method: 'Method', reference: 'Reference', paidAt: 'Paid',
    escrow: 'Escrow', deliveryTitle: 'Delivery', address: 'Address', city: 'City',
    timeline: 'Tracking history',
    st_pending: 'Order received', st_confirmed: 'Confirmed', st_processing: 'Processing',
    st_shipped: 'Shipped', st_out_for_delivery: 'Out for delivery', st_delivered: 'Delivered',
    st_cancelled: 'Cancelled', st_failed: 'Failed', notPaid: 'Not yet paid',
  },
  fr: {
    title: 'Suivi de commande', refresh: 'Actualiser', copied: 'Copi\u00e9 !',
    notFound: 'Commande introuvable. Elle appartient peut-\u00eatre \u00e0 un autre compte.',
    loadError: 'Impossible de charger la commande. Veuillez r\u00e9essayer.', retry: 'R\u00e9essayer',
    orderNum: 'Commande', placed: 'Pass\u00e9e le', updated: 'Mise \u00e0 jour',
    itemsTitle: 'Articles', qty: 'Qt\u00e9', total: 'Total',
    payTitle: 'Paiement', method: 'M\u00e9thode', reference: 'R\u00e9f\u00e9rence', paidAt: 'Pay\u00e9 le',
    escrow: 'S\u00e9questre', deliveryTitle: 'Livraison', address: 'Adresse', city: 'Ville',
    timeline: 'Historique de suivi',
    st_pending: 'Commande re\u00e7ue', st_confirmed: 'Confirm\u00e9e', st_processing: 'En pr\u00e9paration',
    st_shipped: 'Exp\u00e9di\u00e9e', st_out_for_delivery: 'En livraison', st_delivered: 'Livr\u00e9e',
    st_cancelled: 'Annul\u00e9e', st_failed: '\u00c9chou\u00e9e', notPaid: 'Pas encore pay\u00e9',
  },
  pidgin: {
    title: 'Order Tracking', refresh: 'Refresh', copied: 'E don copy!',
    notFound: 'Order no dey. E fit be for another account.',
    loadError: 'Order no gree load. Try again.', retry: 'Try again',
    orderNum: 'Order', placed: 'You order am', updated: 'Last update',
    itemsTitle: 'Things wey you buy', qty: 'How many', total: 'Total',
    payTitle: 'Payment', method: 'How you pay', reference: 'Reference', paidAt: 'You pay',
    escrow: 'Escrow', deliveryTitle: 'Delivery', address: 'Address', city: 'Town',
    timeline: 'Tracking history',
    st_pending: 'Order don enter', st_confirmed: 'E don confirm', st_processing: 'Dem dey prepare am',
    st_shipped: 'E don comot', st_out_for_delivery: 'E dey road come', st_delivered: 'E don reach',
    st_cancelled: 'E don cancel', st_failed: 'E fail', notPaid: 'You never pay',
  },
  ar: {
    title: '\u062a\u062a\u0628\u0639 \u0627\u0644\u0637\u0644\u0628', refresh: '\u062a\u062d\u062f\u064a\u062b', copied: '\u062a\u0645 \u0627\u0644\u0646\u0633\u062e!',
    notFound: '\u0627\u0644\u0637\u0644\u0628 \u063a\u064a\u0631 \u0645\u0648\u062c\u0648\u062f. \u0642\u062f \u064a\u0643\u0648\u0646 \u062a\u0627\u0628\u0639\u064b\u0627 \u0644\u062d\u0633\u0627\u0628 \u0622\u062e\u0631.',
    loadError: '\u062a\u0639\u0630\u0631 \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0637\u0644\u0628. \u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.', retry: '\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0629',
    orderNum: '\u0627\u0644\u0637\u0644\u0628', placed: '\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0637\u0644\u0628', updated: '\u0622\u062e\u0631 \u062a\u062d\u062f\u064a\u062b',
    itemsTitle: '\u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a', qty: '\u0627\u0644\u0643\u0645\u064a\u0629', total: '\u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a',
    payTitle: '\u0627\u0644\u062f\u0641\u0639', method: '\u0627\u0644\u0637\u0631\u064a\u0642\u0629', reference: '\u0627\u0644\u0645\u0631\u062c\u0639', paidAt: '\u062a\u0645 \u0627\u0644\u062f\u0641\u0639',
    escrow: '\u0627\u0644\u0636\u0645\u0627\u0646', deliveryTitle: '\u0627\u0644\u062a\u0648\u0635\u064a\u0644', address: '\u0627\u0644\u0639\u0646\u0648\u0627\u0646', city: '\u0627\u0644\u0645\u062f\u064a\u0646\u0629',
    timeline: '\u0633\u062c\u0644 \u0627\u0644\u062a\u062a\u0628\u0639',
    st_pending: '\u062a\u0645 \u0627\u0633\u062a\u0644\u0627\u0645 \u0627\u0644\u0637\u0644\u0628', st_confirmed: '\u0645\u0624\u0643\u062f', st_processing: '\u0642\u064a\u062f \u0627\u0644\u062a\u062c\u0647\u064a\u0632',
    st_shipped: '\u062a\u0645 \u0627\u0644\u0634\u062d\u0646', st_out_for_delivery: '\u0642\u064a\u062f \u0627\u0644\u062a\u0648\u0635\u064a\u0644', st_delivered: '\u062a\u0645 \u0627\u0644\u062a\u0633\u0644\u064a\u0645',
    st_cancelled: '\u0645\u0644\u063a\u064a', st_failed: '\u0641\u0634\u0644', notPaid: '\u0644\u0645 \u064a\u064f\u062f\u0641\u0639 \u0628\u0639\u062f',
  },
  ff: {
    title: '\u0189aggol Yamiroore', refresh: 'Refresh', copied: 'Naatii!',
    notFound: 'Yamiroore alaa. Waawi wonde e konte wo\u0257nde.',
    loadError: 'Yamiroore loowaaki. Tii\u0257no eto kadi.', retry: 'Eto kadi',
    orderNum: 'Yamiroore', placed: '\u00d1alnde', updated: 'Sakkitii',
    itemsTitle: 'Ku\u0257e', qty: 'No foti', total: 'Fof',
    payTitle: 'Yo\u0253gol', method: 'No yo\u0253iri', reference: 'Reference', paidAt: 'Yo\u0253aa',
    escrow: 'Escrow', deliveryTitle: 'Naworgol', address: 'Adres', city: 'Saare',
    timeline: 'Laamu \u0257aggol',
    st_pending: 'Yamiroore he\u0253aama', st_confirmed: 'Tee\u014btinaama', st_processing: '\u0257on hebloo',
    st_shipped: 'Neldaama', st_out_for_delivery: '\u0257on ara', st_delivered: 'Yottiima',
    st_cancelled: 'Haaytaama', st_failed: 'Hawrii', notPaid: 'Yo\u0253aaka tawo',
  },
} as const;

type LangStrings = (typeof strings)['en'];

function useStrings(): { s: LangStrings; isRtl: boolean } {
  const raw = useLang() as string;
  const key = raw === 'fulfulde' ? 'ff' : raw;
  const s = ((strings as Record<string, LangStrings>)[key] ?? strings.en);
  return { s, isRtl: key === 'ar' };
}

const STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'] as const;

interface OrderItem { title: string; quantity: number; price_xaf: number; image_url?: string | null; }

interface OrderRow {
  id: string;
  order_number: string | null;
  status: string | null;
  total_xaf: number | null;
  items: unknown;
  delivery_address: string | null;
  delivery_city: string | null;
  payment_method: string | null;
  payment_reference: string | null;
  payment_ref: string | null;
  escrow_status: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string | null;
}

export default function OrderTracking() {
  const navigate = useNavigate();
  const params = useParams<{ orderId?: string; id?: string }>();
  const [searchParams] = useSearchParams();
  const orderId = params.orderId || params.id || searchParams.get('orderId') || '';
  const { s, isRtl } = useStrings();

  const [order, setOrder] = useState<OrderRow | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    if (!orderId) { setError(s.notFound); setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate('/login'); return; }

      const { data, error: dbErr } = await supabase
        .from('orders')
        .select('id, order_number, status, total_xaf, items, delivery_address, delivery_city, payment_method, payment_reference, payment_ref, escrow_status, paid_at, created_at, updated_at')
        .eq('id', orderId)
        .maybeSingle();

      if (dbErr) { setError(s.loadError); return; }
      if (!data) { setError(s.notFound); return; }
      setOrder(data as OrderRow);

      // Items: order_items table first, items jsonb as fallback
      let list: OrderItem[] = [];
      const { data: rows } = await supabase
        .from('order_items')
        .select('title, quantity, price_xaf, image_url')
        .eq('order_id', orderId);
      if (rows && rows.length > 0) {
        list = rows.map(r => ({
          title: r.title || 'â€”',
          quantity: r.quantity || 1,
          price_xaf: r.price_xaf || 0,
          image_url: r.image_url,
        }));
      } else if (Array.isArray((data as OrderRow).items)) {
        list = ((data as OrderRow).items as Record<string, unknown>[]).map(it => ({
          title: String(it.title ?? it.name ?? 'â€”'),
          quantity: Number(it.quantity ?? 1),
          price_xaf: Number(it.price_xaf ?? it.price ?? 0),
          image_url: (it.image_url as string) ?? null,
        }));
      }
      setItems(list);
    } catch {
      setError(s.loadError);
    } finally {
      setLoading(false);
    }
  }, [orderId, navigate, s.loadError, s.notFound]);

  useEffect(() => { void load(); }, [load]);

  const status = (order?.status || 'pending').toLowerCase();
  const isTerminalBad = status === 'cancelled' || status === 'failed';
  const currentIdx = STEPS.indexOf(status as (typeof STEPS)[number]);

  const stepLabel = (k: string): string =>
    (s as Record<string, string>)[`st_${k}`] ?? k.replace(/_/g, ' ');

  const orderNumber = order?.order_number || (order ? `BH-${order.id.slice(0, 8).toUpperCase()}` : '');
  const reference = order?.payment_reference || order?.payment_ref || null;

  function copyNumber() {
    if (!orderNumber) return;
    navigator.clipboard.writeText(orderNumber)
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); })
      .catch(() => {});
  }

  const fmtXAF = (n: number) => `${(n || 0).toLocaleString()} XAF`;
  const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleString() : 'â€”');

  return (
    <div className="min-h-screen bg-gray-50 pb-24" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-2 sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="p-2 rounded-xl hover:bg-gray-100 active:scale-95 transition-transform"
        >
          <ArrowLeft className={`w-5 h-5 text-gray-600 ${isRtl ? 'rotate-180' : ''}`} />
        </button>
        <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Package className="w-5 h-5 text-teal-600" /> {s.title}
        </h1>
        <button
          onClick={() => void load()}
          aria-label={s.refresh}
          className={`p-2 rounded-xl hover:bg-gray-100 ${isRtl ? 'mr-auto' : 'ml-auto'}`}
        >
          <RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {loading && (
          <div className="py-16 text-center">
            <RefreshCw className="w-7 h-7 text-teal-500 animate-spin mx-auto mb-2" />
          </div>
        )}

        {!loading && error && (
          <div className="bg-white rounded-2xl p-6 text-center border border-red-100">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">{error}</p>
            <button
              onClick={() => void load()}
              className="mt-3 px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-semibold active:scale-95 transition-transform"
            >
              {s.retry}
            </button>
          </div>
        )}

        {!loading && !error && order && (
          <>
            {/* Status card */}
            <div className={`rounded-2xl border-2 p-4 ${
              status === 'delivered' ? 'bg-green-50 border-green-300'
                : isTerminalBad ? 'bg-red-50 border-red-300'
                : 'bg-teal-50 border-teal-300'
            }`}>
              <div className="flex items-center gap-3">
                {status === 'delivered'
                  ? <CheckCircle className="w-9 h-9 text-green-600 flex-shrink-0" />
                  : isTerminalBad
                    ? <AlertCircle className="w-9 h-9 text-red-500 flex-shrink-0" />
                    : (status === 'shipped' || status === 'out_for_delivery')
                      ? <Truck className="w-9 h-9 text-teal-600 flex-shrink-0" />
                      : <Clock className="w-9 h-9 text-teal-600 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900">{stepLabel(status)}</p>
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <span>{s.orderNum} {orderNumber}</span>
                    <button onClick={copyNumber} aria-label="Copy" className="p-1 rounded hover:bg-white/60">
                      {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {s.placed}: {fmtDate(order.created_at)} Â· {s.updated}: {fmtDate(order.updated_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline (hidden for cancelled/failed) */}
            {!isTerminalBad && (
              <div className="bg-white border border-gray-200 rounded-2xl p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-4">{s.timeline}</h3>
                <div>
                  {STEPS.map((step, idx) => {
                    const done = currentIdx > idx || status === 'delivered';
                    const active = currentIdx === idx && status !== 'delivered';
                    return (
                      <div key={step} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                            done ? 'bg-teal-600'
                              : active ? 'bg-teal-100 border-2 border-teal-600'
                              : 'bg-gray-100 border-2 border-gray-200'
                          }`}>
                            {done && <Check className="w-3 h-3 text-white" />}
                            {active && <div className="w-2 h-2 bg-teal-600 rounded-full" />}
                          </div>
                          {idx < STEPS.length - 1 && (
                            <div className={`w-0.5 h-8 ${done ? 'bg-teal-600' : 'bg-gray-200'}`} />
                          )}
                        </div>
                        <div className="pb-4 flex-1 min-w-0">
                          <p className={`text-sm font-medium ${
                            active ? 'text-teal-700' : done ? 'text-gray-800' : 'text-gray-400'
                          }`}>
                            {stepLabel(step)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Items */}
            {items.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-3">{s.itemsTitle}</h3>
                <div className="space-y-3">
                  {items.map((it, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                        {it.image_url
                          ? <img src={it.image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                          : <Package className="w-5 h-5 text-gray-300" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{it.title}</p>
                        <p className="text-xs text-gray-400">{s.qty}: {it.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-800 flex-shrink-0">{fmtXAF(it.price_xaf * it.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between border-t border-gray-100 mt-3 pt-3">
                  <span className="text-sm font-bold text-gray-900">{s.total}</span>
                  <span className="text-sm font-bold text-teal-700">{fmtXAF(order.total_xaf || 0)}</span>
                </div>
              </div>
            )}

            {/* Payment */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-2 text-sm">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-1">
                <CreditCard className="w-4 h-4 text-teal-600" /> {s.payTitle}
              </h3>
              <div className="flex justify-between"><span className="text-gray-500">{s.total}</span><span className="font-bold text-teal-700">{fmtXAF(order.total_xaf || 0)}</span></div>
              {order.payment_method && (
                <div className="flex justify-between"><span className="text-gray-500">{s.method}</span><span className="font-medium">{order.payment_method}</span></div>
              )}
              {reference && (
                <div className="flex justify-between"><span className="text-gray-500">{s.reference}</span><span className="font-mono text-xs">{reference}</span></div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">{s.paidAt}</span>
                <span className={order.paid_at ? 'text-green-600 font-medium' : 'text-yellow-600'}>
                  {order.paid_at ? fmtDate(order.paid_at) : s.notPaid}
                </span>
              </div>
              {order.escrow_status && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> {s.escrow}</span>
                  <span className="font-medium capitalize">{order.escrow_status.replace(/_/g, ' ')}</span>
                </div>
              )}
            </div>

            {/* FIX206 escrow actions + FIX208 invoice */}
            <EscrowActionPanel orderId={order.id} onChanged={() => void load()} />
            <OrderInvoice orderId={order.id} />

            {/* Delivery */}
            {(order.delivery_address || order.delivery_city) && (
              <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-2 text-sm">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-teal-600" /> {s.deliveryTitle}
                </h3>
                {order.delivery_address && (
                  <div className="flex justify-between gap-3"><span className="text-gray-500 flex-shrink-0">{s.address}</span><span className="font-medium text-right">{order.delivery_address}</span></div>
                )}
                {order.delivery_city && (
                  <div className="flex justify-between"><span className="text-gray-500">{s.city}</span><span className="font-medium">{order.delivery_city}</span></div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__ORDERTRACKING_FIX140__COMPLETE
