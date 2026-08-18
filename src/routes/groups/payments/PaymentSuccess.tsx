// BAMBEH_DEPLOY_TOKEN__PAYMENTSUCCESS_FIX338_CLEAN
/**
 * src/routes/groups/payments/PaymentSuccess.tsx - Bambeh Marketplace
 * Shown after a successful payment verification.
 *
 * FIX338 - three things were wrong with this page:
 *
 *   1. It had NO translation system at all. Every word was hardcoded English,
 *      on the one screen a customer sees straight after parting with money.
 *      It now speaks all five app languages, keyed the way useLang() actually
 *      emits them (en | fr | pidgin | ar | ff) - NOT pcm/ful, which nothing
 *      emits and which is what left half this app silently English before.
 *
 *   2. The heading carried a destroyed emoji rendered as "??".
 *
 *   3. It told every buyer "A confirmation has been sent to your email."
 *      That was never true - nothing in the payment flow sends a receipt
 *      email - so the page was lying to paying customers and training them to
 *      wait for mail that would never arrive. The claim is GONE. It now says
 *      the one thing that is true and useful: keep your reference number.
 *      If a real receipt email is ever built, put the line back then.
 */

import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle2, Receipt, ShoppingBag, Home } from 'lucide-react';
import { formatXAF } from '@/services/payment/taxCalculator';
import { useLang } from '@/hooks/useAppLang';

type Lang = 'en' | 'fr' | 'pidgin' | 'ar' | 'ff';

const COPY: Record<Lang, Record<string, string>> = {
  en: {
    title: 'Payment Successful!',
    subtitle: 'Your payment has been confirmed. The seller has been notified.',
    receipt: 'Receipt',
    reference: 'Reference',
    amount: 'Amount paid',
    datetime: 'Date & Time',
    status: 'Status',
    complete: 'Complete',
    orders: 'View My Orders',
    home: 'Go Home',
    keepRef: 'Save your reference number. You will need it if you ever contact support about this payment.',
  },
  fr: {
    title: 'Paiement réussi !',
    subtitle: 'Votre paiement a été confirmé. Le vendeur a été prévenu.',
    receipt: 'Reçu',
    reference: 'Référence',
    amount: 'Montant payé',
    datetime: 'Date et heure',
    status: 'Statut',
    complete: 'Terminé',
    orders: 'Voir mes commandes',
    home: 'Accueil',
    keepRef: 'Conservez votre numéro de référence. Vous en aurez besoin si vous contactez le support au sujet de ce paiement.',
  },
  pidgin: {
    title: 'Payment Don Enter!',
    subtitle: 'Your payment don confirm. We don tell di seller.',
    receipt: 'Receipt',
    reference: 'Reference',
    amount: 'Money wey you pay',
    datetime: 'Date & Time',
    status: 'Status',
    complete: 'E don complete',
    orders: 'See My Orders',
    home: 'Go Home',
    keepRef: 'Keep dis reference number well. If you need talk to support about dis payment, na am you go give dem.',
  },
  ar: {
    title: 'تم الدفع بنجاح!',
    subtitle: 'تم تأكيد دفعتك. وقد تم إخطار البائع.',
    receipt: 'الإيصال',
    reference: 'المرجع',
    amount: 'المبلغ المدفوع',
    datetime: 'التاريخ والوقت',
    status: 'الحالة',
    complete: 'مكتمل',
    orders: 'عرض طلباتي',
    home: 'الصفحة الرئيسية',
    keepRef: 'احتفظ برقم المرجع. ستحتاجه إذا تواصلت مع الدعم بشأن هذه الدفعة.',
  },
  ff: {
    title: 'Yoɓgol timmii!',
    subtitle: 'Yoɓgol maa tabitinaama. Njeeyoowo on humpitaama.',
    receipt: 'Rasiide',
    reference: 'Tonngoode',
    amount: 'Njoɓdi yoɓaandi',
    datetime: 'Ñalnde e waktu',
    status: 'Ngonka',
    complete: 'Timmii',
    orders: 'Yiy kommaadeeji am',
    home: 'Rutto galle',
    keepRef: 'Reen tonngoode maa. A sokla nde so a yiylii ballal fii oo yoɓgol.',
  },
};

// Date locale per app language. Arabic is forced to Latin digits so a XAF
// reference and a date never end up in two different numbering systems.
const DATE_LOCALE: Record<Lang, string> = {
  en: 'en-GB',
  fr: 'fr-CM',
  pidgin: 'en-GB',
  ar: 'ar-MA-u-nu-latn',
  ff: 'fr-CM',
};

const PaymentSuccess: React.FC = () => {
  const { state } = useLocation();
  const raw  = String(useLang() || 'en');
  const lang = (COPY[raw as Lang] ? raw : 'en') as Lang;
  const c     = COPY[lang];
  const isRtl = lang === 'ar';

  const reference = (state as any)?.reference || '-';
  const amount    = (state as any)?.amount    || 0;
  const paidAt    = (state as any)?.paidAt    || new Date().toISOString();

  let formattedDate: string;
  try {
    formattedDate = new Date(paidAt).toLocaleString(DATE_LOCALE[lang], {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    formattedDate = new Date(paidAt).toLocaleString('en-GB');
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-md w-full text-center">

        {/* Success animation */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-14 h-14 text-green-500" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">{c.title} {'\u{1F389}'}</h1>
        <p className="text-gray-500 mb-8">{c.subtitle}</p>

        {/* Receipt */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 text-left space-y-3">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <Receipt className="w-4 h-4 text-teal-600" />
            {c.receipt}
          </h2>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{c.reference}</span>
            <span className="font-mono text-xs font-medium text-gray-800" dir="ltr">{reference}</span>
          </div>
          {amount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{c.amount}</span>
              <span className="font-bold text-teal-700" dir="ltr">{formatXAF(amount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{c.datetime}</span>
            <span className="text-gray-700">{formattedDate}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{c.status}</span>
            <span className="flex items-center gap-1 text-green-600 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> {c.complete}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/orders"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            {c.orders}
          </Link>
          <Link
            to="/"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
          >
            <Home className="w-4 h-4" />
            {c.home}
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-6">{c.keepRef}</p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
// BAMBEH_END_TOKEN__PAYMENTSUCCESS_FIX338__COMPLETE
