// BAMBEH_DEPLOY_TOKEN__ORDERINVOICE_FIX208_CLEAN
/**
 * OrderInvoice.tsx - Bambeh Marketplace (FIX208)
 * FILE LOCATION: src/components/OrderInvoice.tsx
 *
 * A real invoice / receipt for a single order. Renders a button; on tap it
 * loads the order, its line items and the two parties, then shows a proper
 * trust-document invoice with three exits:
 *
 *   Print     - opens a standalone print document and calls print()
 *   Download  - saves a self-contained .html file the buyer can keep or share
 *   Close
 *
 * NO NEW DEPENDENCIES. No jsPDF, no html2canvas, no npm install. The invoice
 * is built as a standalone HTML document string, so "print to PDF" in the
 * browser produces a clean PDF and the downloaded file opens anywhere offline.
 *
 * DATA - only columns confirmed present on public.orders, plus order_items with
 * the items jsonb as fallback (same pattern OrderTracking already proved).
 * The seller display name is attempted from profiles and silently skipped if
 * that read is not permitted, so the invoice can never fail to open.
 *
 * Money lines come straight from the database - total_xaf, platform_fee_xaf,
 * seller_payout_xaf - so the invoice always matches what the ledger says
 * rather than recomputing and disagreeing with it.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */

import { useCallback, useEffect, useState } from 'react';
import { FileText, Printer, Download, X, Loader2, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';

/* ------------------------------------------------------------------ i18n -- */

const strings = {
  en: {
    button: 'Invoice / Receipt', title: 'INVOICE', receipt: 'RECEIPT',
    invoiceNo: 'Invoice no', date: 'Date', billTo: 'Billed to', seller: 'Seller',
    item: 'Item', qty: 'Qty', amount: 'Amount', subtotal: 'Subtotal',
    fee: 'Bambeh fee and tax', total: 'Total', sellerGets: 'Seller receives',
    payment: 'Payment', method: 'Method', reference: 'Reference',
    escrow: 'Escrow', paid: 'PAID', unpaid: 'AWAITING CONFIRMATION',
    terms: 'Terms', termsBody: 'Funds placed in Bambeh escrow are released to the seller only when the buyer confirms delivery. If the item does not arrive, or is not as described, the buyer may request a refund to the number that paid. Questions: support@bambeh.com',
    print: 'Print', download: 'Download', close: 'Close',
    loadErr: 'Could not build the invoice.', retry: 'Retry',
    footer: 'BAMBEH SARL - Yaounde, Cameroon - support@bambeh.com - bambeh.com',
  },
  fr: {
    button: 'Facture / Re\u00e7u', title: 'FACTURE', receipt: 'RE\u00c7U',
    invoiceNo: 'Facture n\u00b0', date: 'Date', billTo: 'Factur\u00e9 \u00e0', seller: 'Vendeur',
    item: 'Article', qty: 'Qt\u00e9', amount: 'Montant', subtotal: 'Sous-total',
    fee: 'Frais Bambeh et taxe', total: 'Total', sellerGets: 'Le vendeur re\u00e7oit',
    payment: 'Paiement', method: 'M\u00e9thode', reference: 'R\u00e9f\u00e9rence',
    escrow: 'S\u00e9questre', paid: 'PAY\u00c9', unpaid: 'EN ATTENTE DE CONFIRMATION',
    terms: 'Conditions', termsBody: 'Les fonds plac\u00e9s sous s\u00e9questre Bambeh sont vers\u00e9s au vendeur uniquement lorsque l\u2019acheteur confirme la livraison. Si l\u2019article n\u2019arrive pas, ou ne correspond pas \u00e0 la description, l\u2019acheteur peut demander un remboursement vers le num\u00e9ro qui a pay\u00e9. Questions : support@bambeh.com',
    print: 'Imprimer', download: 'T\u00e9l\u00e9charger', close: 'Fermer',
    loadErr: 'Impossible de g\u00e9n\u00e9rer la facture.', retry: 'R\u00e9essayer',
    footer: 'BAMBEH SARL - Yaound\u00e9, Cameroun - support@bambeh.com - bambeh.com',
  },
  pidgin: {
    button: 'Invoice / Receipt', title: 'INVOICE', receipt: 'RECEIPT',
    invoiceNo: 'Invoice no', date: 'Date', billTo: 'Na who pay', seller: 'Seller',
    item: 'Thing', qty: 'How many', amount: 'Amount', subtotal: 'Subtotal',
    fee: 'Bambeh cut and tax', total: 'Total', sellerGets: 'Seller go collect',
    payment: 'Payment', method: 'How you pay', reference: 'Reference',
    escrow: 'Escrow', paid: 'DEM PAY', unpaid: 'WE DEY WAIT CONFIRMATION',
    terms: 'Terms', termsBody: 'Money wey dey Bambeh escrow only go reach seller when buyer confirm say the thing don land. If e no reach, or e no be wetin dem talk, buyer fit ask for him money back to the number wey pay. Question? support@bambeh.com',
    print: 'Print', download: 'Download', close: 'Close',
    loadErr: 'Invoice no gree build.', retry: 'Try again',
    footer: 'BAMBEH SARL - Yaounde, Cameroon - support@bambeh.com - bambeh.com',
  },
  ar: {
    button: '\u0641\u0627\u062a\u0648\u0631\u0629 / \u0625\u064a\u0635\u0627\u0644', title: '\u0641\u0627\u062a\u0648\u0631\u0629', receipt: '\u0625\u064a\u0635\u0627\u0644',
    invoiceNo: '\u0631\u0642\u0645 \u0627\u0644\u0641\u0627\u062a\u0648\u0631\u0629', date: '\u0627\u0644\u062a\u0627\u0631\u064a\u062e', billTo: '\u0641\u0627\u062a\u0648\u0631\u0629 \u0625\u0644\u0649', seller: '\u0627\u0644\u0628\u0627\u0626\u0639',
    item: '\u0627\u0644\u0645\u0646\u062a\u062c', qty: '\u0627\u0644\u0643\u0645\u064a\u0629', amount: '\u0627\u0644\u0645\u0628\u0644\u063a', subtotal: '\u0627\u0644\u0645\u062c\u0645\u0648\u0639 \u0627\u0644\u0641\u0631\u0639\u064a',
    fee: '\u0639\u0645\u0648\u0644\u0629 \u0628\u0627\u0645\u0628\u064a \u0648\u0627\u0644\u0631\u0633\u0648\u0645', total: '\u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a', sellerGets: '\u064a\u0633\u062a\u0644\u0645 \u0627\u0644\u0628\u0627\u0626\u0639',
    payment: '\u0627\u0644\u062f\u0641\u0639', method: '\u0627\u0644\u0637\u0631\u064a\u0642\u0629', reference: '\u0627\u0644\u0645\u0631\u062c\u0639',
    escrow: '\u0627\u0644\u0636\u0645\u0627\u0646', paid: '\u0645\u062f\u0641\u0648\u0639', unpaid: '\u0628\u0627\u0646\u062a\u0637\u0627\u0631 \u0627\u0644\u062a\u0623\u0643\u064a\u062f',
    terms: '\u0627\u0644\u0634\u0631\u0648\u0637', termsBody: '\u0627\u0644\u0623\u0645\u0648\u0627\u0644 \u0627\u0644\u0645\u0648\u062f\u0639\u0629 \u0641\u064a \u0636\u0645\u0627\u0646 \u0628\u0627\u0645\u0628\u064a \u062a\u064f\u062f\u0641\u0639 \u0644\u0644\u0628\u0627\u0626\u0639 \u0641\u0642\u0637 \u0639\u0646\u062f \u062a\u0623\u0643\u064a\u062f \u0627\u0644\u0645\u0634\u062a\u0631\u064a \u0644\u0644\u0627\u0633\u062a\u0644\u0627\u0645. \u0625\u0646 \u0644\u0645 \u064a\u0635\u0644 \u0627\u0644\u0645\u0646\u062a\u062c \u0623\u0648 \u0644\u0645 \u064a\u0637\u0627\u0628\u0642 \u0627\u0644\u0648\u0635\u0641\u060c \u064a\u0645\u0643\u0646 \u0644\u0644\u0645\u0634\u062a\u0631\u064a \u0637\u0644\u0628 \u0627\u0633\u062a\u0631\u062f\u0627\u062f \u0625\u0644\u0649 \u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0630\u064a \u062f\u0641\u0639. \u0644\u0644\u0627\u0633\u062a\u0641\u0633\u0627\u0631: support@bambeh.com',
    print: '\u0637\u0628\u0627\u0639\u0629', download: '\u062a\u0646\u0632\u064a\u0644', close: '\u0625\u063a\u0644\u0627\u0642',
    loadErr: '\u062a\u0639\u0630\u0631 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0641\u0627\u062a\u0648\u0631\u0629.', retry: '\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0629',
    footer: 'BAMBEH SARL - Yaounde, Cameroon - support@bambeh.com - bambeh.com',
  },
  ff: {
    button: 'Fakture / Reso', title: 'FAKTURE', receipt: 'RESO',
    invoiceNo: 'Limngal fakture', date: '\u00d1alnde', billTo: 'Fakture wonande', seller: 'Jeeyoowo',
    item: 'Ku\u0257e', qty: 'No foti', amount: 'Njeenu', subtotal: 'Fof gadano',
    fee: 'Jaw\u0257i Bambeh e lampo', total: 'Fof', sellerGets: 'Jeeyoowo he\u0253ata',
    payment: 'Yo\u0253gol', method: 'No yo\u0253iri', reference: 'Reference',
    escrow: 'Escrow', paid: 'YO\u0181AAMA', unpaid: 'INA HEBEE TEE\u014aTINGOL',
    terms: 'Sar\u0257iiji', termsBody: 'Kaalisi mo\u0253\u0253aa\u0257o e escrow Bambeh neldete jeeyoowo tan so so\u0257oowo tee\u014btinii jaggol. So ku\u0257e yottaaki, walla \u0257e nanndaani e sifaa, so\u0257oowo waawi \u0257a\u0253\u0253ude ruttingol to limngal yo\u0253unoo. Naamnal: support@bambeh.com',
    print: 'Winndito', download: 'Aawto', close: 'Uddu',
    loadErr: 'Fakture waawaa mahaade.', retry: 'Eto kadi',
    footer: 'BAMBEH SARL - Yaounde, Cameroon - support@bambeh.com - bambeh.com',
  },
} as const;

type S = (typeof strings)['en'];

function useS(): { s: S; isRtl: boolean } {
  const raw = useLang() as string;
  const key = raw === 'fulfulde' ? 'ff' : raw === 'pcm' ? 'pidgin' : raw;
  return { s: (strings as Record<string, S>)[key] ?? strings.en, isRtl: key === 'ar' };
}

/* ----------------------------------------------------------------- types -- */

interface Line { title: string; quantity: number; price_xaf: number; }

interface Inv {
  id: string;
  orderNumber: string;
  createdAt: string | null;
  paidAt: string | null;
  status: string;
  escrow: boolean;
  escrowStatus: string | null;
  total: number;
  fee: number;
  sellerPayout: number;
  method: string | null;
  reference: string | null;
  buyerName: string;
  sellerName: string;
  lines: Line[];
}

const PAID_STATUSES = ['paid', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'completed', 'released'];

const xaf = (n: number) => `${(n || 0).toLocaleString()} XAF`;
const dt = (d?: string | null) => (d ? new Date(d).toLocaleString() : '-');
const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* ------------------------------------------------------------- component -- */

export default function OrderInvoice({ orderId, className }: { orderId?: string | null; className?: string }) {
  const { s, isRtl } = useS();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [inv, setInv] = useState<Inv | null>(null);

  const build = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    setErr(null);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const user = sess?.session?.user;

      const { data: o, error } = await supabase
        .from('orders')
        .select('id, order_number, buyer_id, seller_id, status, escrow, escrow_status, total_xaf, platform_fee_xaf, seller_payout_xaf, payment_method, payment_reference, payment_ref, paid_at, items, created_at')
        .eq('id', orderId)
        .maybeSingle();

      if (error) throw new Error(error.message);
      if (!o) throw new Error(s.loadErr);

      const row = o as Record<string, unknown>;

      // line items: order_items first, items jsonb as fallback
      let lines: Line[] = [];
      const { data: oi } = await supabase
        .from('order_items')
        .select('title, quantity, price_xaf')
        .eq('order_id', orderId);

      if (oi && oi.length > 0) {
        lines = oi.map(r => ({
          title: String((r as Record<string, unknown>).title ?? '-'),
          quantity: Number((r as Record<string, unknown>).quantity ?? 1),
          price_xaf: Number((r as Record<string, unknown>).price_xaf ?? 0),
        }));
      } else if (Array.isArray(row.items)) {
        lines = (row.items as Record<string, unknown>[]).map(r => ({
          title: String(r?.title ?? r?.name ?? '-'),
          quantity: Number(r?.quantity ?? 1),
          price_xaf: Number(r?.price_xaf ?? r?.price ?? 0),
        }));
      }

      // seller display name - best effort, never fatal
      let sellerName = '';
      if (row.seller_id) {
        try {
          const { data: p } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', row.seller_id as string)
            .maybeSingle();
          const fn = (p as Record<string, unknown> | null)?.full_name;
          if (typeof fn === 'string' && fn.trim()) sellerName = fn.trim();
        } catch { /* profiles not readable - fall through */ }
      }
      if (!sellerName) sellerName = row.seller_id ? `ID ${String(row.seller_id).slice(0, 8)}` : '-';

      const total = Number(row.total_xaf ?? 0);
      const fee = Number(row.platform_fee_xaf ?? 0);

      setInv({
        id: String(row.id),
        orderNumber: String(row.order_number ?? String(row.id).slice(0, 8).toUpperCase()),
        createdAt: (row.created_at as string) ?? null,
        paidAt: (row.paid_at as string) ?? null,
        status: String(row.status ?? ''),
        escrow: row.escrow === true,
        escrowStatus: (row.escrow_status as string) ?? null,
        total,
        fee,
        sellerPayout: Number(row.seller_payout_xaf ?? Math.max(total - fee, 0)),
        method: (row.payment_method as string) ?? null,
        reference: (row.payment_reference as string) || (row.payment_ref as string) || null,
        buyerName:
          (user?.user_metadata?.full_name as string) ||
          user?.email ||
          (row.buyer_id ? `ID ${String(row.buyer_id).slice(0, 8)}` : '-'),
        sellerName,
        lines,
      });
    } catch (e) {
      setErr(e instanceof Error ? e.message : s.loadErr);
    } finally {
      setLoading(false);
    }
  }, [orderId, s.loadErr]);

  useEffect(() => {
    if (open && !inv && !loading && !err) void build();
  }, [open, inv, loading, err, build]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open]);

  const isPaid = !!inv && (!!inv.paidAt || PAID_STATUSES.includes(inv.status.toLowerCase()));
  const subtotal = inv ? Math.max(inv.total - inv.fee, 0) : 0;

  /* ---- standalone printable document ---- */
  const html = useCallback((): string => {
    if (!inv) return '';
    const rows = inv.lines.length
      ? inv.lines.map(l => `<tr><td>${esc(l.title)}</td><td class="c">${l.quantity}</td><td class="r">${xaf(l.price_xaf * l.quantity)}</td></tr>`).join('')
      : `<tr><td colspan="3" class="c muted">-</td></tr>`;

    return `<!DOCTYPE html><html dir="${isRtl ? 'rtl' : 'ltr'}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(s.title)} ${esc(inv.orderNumber)}</title><style>
*{box-sizing:border-box}body{font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;margin:0;padding:28px;color:#111;background:#fff;font-size:13px}
.wrap{max-width:720px;margin:0 auto}
.hd{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #0d9488;padding-bottom:14px;margin-bottom:20px}
.bn{font-size:22px;font-weight:800;color:#0d9488;letter-spacing:-.5px}.bs{font-size:11px;color:#666;margin-top:2px}
.tt{font-size:19px;font-weight:800;text-align:${isRtl ? 'left' : 'right'}}
.badge{display:inline-block;margin-top:6px;padding:3px 10px;border-radius:999px;font-size:10px;font-weight:800;letter-spacing:.5px}
.ok{background:#d1fae5;color:#065f46}.wait{background:#fef3c7;color:#92400e}
.grid{display:flex;gap:28px;flex-wrap:wrap;margin-bottom:20px}.grid>div{flex:1;min-width:190px}
.lbl{font-size:10px;text-transform:uppercase;letter-spacing:.6px;color:#888;font-weight:700;margin-bottom:3px}
.val{font-weight:600}.mono{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:11px;word-break:break-all}
table{width:100%;border-collapse:collapse;margin:8px 0 0}
th{text-align:${isRtl ? 'right' : 'left'};font-size:10px;text-transform:uppercase;letter-spacing:.6px;color:#888;border-bottom:2px solid #e5e7eb;padding:8px 6px}
td{padding:10px 6px;border-bottom:1px solid #f1f5f9}.c{text-align:center}.r{text-align:${isRtl ? 'left' : 'right'}}.muted{color:#9ca3af}
.tot{margin-top:14px;margin-${isRtl ? 'right' : 'left'}:auto;width:290px}
.tr{display:flex;justify-content:space-between;padding:6px 0}
.tr.g{border-top:2px solid #0d9488;margin-top:6px;padding-top:9px;font-size:16px;font-weight:800;color:#0d9488}
.terms{margin-top:26px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px}
.terms .lbl{margin-bottom:5px}.terms p{margin:0;font-size:11px;line-height:1.65;color:#475569}
.ft{margin-top:22px;text-align:center;font-size:10px;color:#94a3b8;border-top:1px solid #e5e7eb;padding-top:12px}
@media print{body{padding:0}@page{margin:14mm}}
</style></head><body><div class="wrap">
<div class="hd"><div><div class="bn">Bambeh</div><div class="bs">BAMBEH SARL &middot; Yaounde, Cameroon</div></div>
<div><div class="tt">${esc(isPaid ? s.receipt : s.title)}</div>
<span class="badge ${isPaid ? 'ok' : 'wait'}">${esc(isPaid ? s.paid : s.unpaid)}</span></div></div>
<div class="grid">
<div><div class="lbl">${esc(s.invoiceNo)}</div><div class="val mono">${esc(inv.orderNumber)}</div>
<div class="lbl" style="margin-top:12px">${esc(s.date)}</div><div class="val">${esc(dt(inv.createdAt))}</div></div>
<div><div class="lbl">${esc(s.billTo)}</div><div class="val">${esc(inv.buyerName)}</div>
<div class="lbl" style="margin-top:12px">${esc(s.seller)}</div><div class="val">${esc(inv.sellerName)}</div></div>
</div>
<table><thead><tr><th>${esc(s.item)}</th><th class="c">${esc(s.qty)}</th><th class="r">${esc(s.amount)}</th></tr></thead><tbody>${rows}</tbody></table>
<div class="tot">
<div class="tr"><span>${esc(s.subtotal)}</span><span>${xaf(subtotal)}</span></div>
<div class="tr"><span>${esc(s.fee)}</span><span>${xaf(inv.fee)}</span></div>
<div class="tr g"><span>${esc(s.total)}</span><span>${xaf(inv.total)}</span></div>
<div class="tr" style="color:#666"><span>${esc(s.sellerGets)}</span><span>${xaf(inv.sellerPayout)}</span></div>
</div>
<div class="grid" style="margin-top:26px">
<div><div class="lbl">${esc(s.method)}</div><div class="val">${esc(inv.method || '-')}</div></div>
<div><div class="lbl">${esc(s.reference)}</div><div class="val mono">${esc(inv.reference || '-')}</div></div>
<div><div class="lbl">${esc(s.escrow)}</div><div class="val">${esc((inv.escrowStatus || '-').replace(/_/g, ' '))}</div></div>
</div>
<div class="terms"><div class="lbl">${esc(s.terms)}</div><p>${esc(s.termsBody)}</p></div>
<div class="ft">${esc(s.footer)}</div>
</div></body></html>`;
  }, [inv, isPaid, isRtl, s, subtotal]);

  const doDownload = useCallback(() => {
    const doc = html();
    if (!doc) return;
    try {
      const blob = new Blob([doc], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Bambeh-${inv?.orderNumber ?? 'invoice'}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.setTimeout(() => URL.revokeObjectURL(url), 3000);
    } catch {
      const w = window.open('', '_blank');
      if (w) { w.document.open(); w.document.write(doc); w.document.close(); }
    }
  }, [html, inv]);

  const doPrint = useCallback(() => {
    const doc = html();
    if (!doc) return;
    const w = window.open('', '_blank');
    if (!w) { doDownload(); return; }
    w.document.open();
    w.document.write(doc);
    w.document.close();
    w.focus();
    window.setTimeout(() => { try { w.print(); } catch { /* user can print manually */ } }, 400);
  }, [html, doDownload]);

  if (!orderId) return null;

  return (
    <div className={className ?? ''}>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm border-2 border-teal-200 text-teal-700 hover:bg-teal-50 transition-colors"
      >
        <FileText className="w-4 h-4" /> {s.button}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            dir={isRtl ? 'rtl' : 'ltr'}
            role="dialog"
            aria-modal="true"
            className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[92vh] flex flex-col"
          >
            {/* modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600" /> {s.button}
              </h3>
              <button onClick={() => setOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100" aria-label={s.close}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* body */}
            <div className="overflow-y-auto px-5 py-4 flex-1">
              {loading && (
                <div className="flex items-center gap-3 text-gray-500 py-8 justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
                </div>
              )}

              {err && !loading && (
                <div className="py-6 text-center">
                  <p className="text-sm text-gray-700 break-words">{err}</p>
                  <button onClick={() => { setErr(null); void build(); }} className="mt-3 text-sm font-semibold text-teal-700">
                    {s.retry}
                  </button>
                </div>
              )}

              {inv && !loading && !err && (
                <div className="text-sm">
                  <div className="flex items-start justify-between border-b-2 border-teal-600 pb-3 mb-4">
                    <div>
                      <p className="text-lg font-extrabold text-teal-700 leading-none">Bambeh</p>
                      <p className="text-[11px] text-gray-500 mt-1">BAMBEH SARL</p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-gray-900">{isPaid ? s.receipt : s.title}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide ${isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {isPaid ? s.paid : s.unpaid}
                      </span>
                    </div>
                  </div>

                  <Field label={s.invoiceNo} value={inv.orderNumber} mono />
                  <Field label={s.date} value={dt(inv.createdAt)} />
                  <Field label={s.billTo} value={inv.buyerName} />
                  <Field label={s.seller} value={inv.sellerName} />

                  <div className="mt-4 border-t border-gray-100 pt-3">
                    {inv.lines.map((l, i) => (
                      <div key={i} className="flex justify-between gap-3 py-1.5">
                        <span className="text-gray-700 min-w-0 break-words">
                          {l.title} <span className="text-gray-400">x{l.quantity}</span>
                        </span>
                        <span className="font-medium flex-shrink-0">{xaf(l.price_xaf * l.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 border-t border-gray-100 pt-3 space-y-1.5">
                    <div className="flex justify-between"><span className="text-gray-500">{s.subtotal}</span><span>{xaf(subtotal)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">{s.fee}</span><span>{xaf(inv.fee)}</span></div>
                    <div className="flex justify-between border-t-2 border-teal-600 pt-2 mt-1">
                      <span className="font-extrabold text-gray-900">{s.total}</span>
                      <span className="font-extrabold text-teal-700 text-base">{xaf(inv.total)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{s.sellerGets}</span><span>{xaf(inv.sellerPayout)}</span>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-gray-100 pt-3 space-y-1.5">
                    <Field label={s.method} value={inv.method || '-'} />
                    <Field label={s.reference} value={inv.reference || '-'} mono />
                    <Field label={s.escrow} value={(inv.escrowStatus || '-').replace(/_/g, ' ')} />
                  </div>

                  <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-3">
                    <p className="text-[10px] uppercase tracking-wide font-bold text-gray-500 flex items-center gap-1.5">
                      <ShieldCheck className="w-3 h-3" /> {s.terms}
                    </p>
                    <p className="text-[11px] text-gray-600 leading-relaxed mt-1.5">{s.termsBody}</p>
                  </div>
                </div>
              )}
            </div>

            {/* actions */}
            {inv && !loading && !err && (
              <div className="flex gap-2 px-5 py-4 border-t border-gray-100 flex-shrink-0">
                <button onClick={doPrint} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold text-sm">
                  <Printer className="w-4 h-4" /> {s.print}
                </button>
                <button onClick={doDownload} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold text-sm">
                  <Download className="w-4 h-4" /> {s.download}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3 py-1">
      <span className="text-gray-500 text-xs flex-shrink-0">{label}</span>
      <span className={`${mono ? 'font-mono text-[11px]' : 'text-sm'} font-medium text-gray-800 text-right break-all`}>
        {value}
      </span>
    </div>
  );
}
// BAMBEH_END_TOKEN__ORDERINVOICE_FIX208__COMPLETE
