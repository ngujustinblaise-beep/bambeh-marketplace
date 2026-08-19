// BAMBEH_DEPLOY_TOKEN__DONATEPREMIUM_FIX349_CLEAN
// BAMBEH_DEPLOY_TOKEN__DONATEPREMIUM_FIX98_CLEAN
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DONATION PAGE - BAMBEH
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Supports:
 * - MTN / Orange Mobile Money via CamPay
 * - Card payments for foreign users when enabled on the payment server
 * - Minimum donation: 500 XAF
 * - Quick amounts + custom amount
 * - Cameroon phone default (+237)
 *
 * © 2025 Bambeh. Support Our Mission
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';   // FIX349
import {
  Heart,
  CreditCard,
  Smartphone,
  TrendingUp,
  Users,
  Zap,
  Shield,
  Award,
  Sparkles,
  Target,
  Calendar
} from 'lucide-react';

const MIN_DONATION = 500;
const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000];

const DONATION_TIERS = [
  {
    name: 'Supporter',
    icon: '💚',
    min: 500,
    max: 4999,
    color: 'from-green-400 to-emerald-600',
    perks: ['Bronze badge', 'Thank you email', 'Recognition on website']
  },
  {
    name: 'Champion',
    icon: '⭐',
    min: 5000,
    max: 14999,
    color: 'from-blue-400 to-indigo-600',
    perks: ['Silver badge', 'Quarterly newsletter', 'Special mention', 'Early feature access']
  },
  {
    name: 'Hero',
    icon: '🏆',
    min: 15000,
    max: 49999,
    color: 'from-purple-400 to-pink-600',
    perks: ['Gold badge', 'Monthly updates', 'VIP support', 'Name in credits', 'Beta features']
  },
  {
    name: 'Legend',
    icon: '👑',
    min: 50000,
    max: 999999,
    color: 'from-yellow-400 to-orange-600',
    perks: ['Diamond badge', 'Direct access to team', 'Feature voting rights', 'Annual recognition', 'Lifetime VIP']
  },
];

// ─── FIX349: this page had ZERO translation machinery ───────────────────────
// Every word was hardcoded English on a page asking Cameroonians for money.
// Keys are en/fr/pidgin/ar/ff - the five useLang() actually emits.
// MTN MoMo and Orange Money stay untranslated: they are brand names.
type DLang = 'en' | 'fr' | 'pidgin' | 'ar' | 'ff';

const DCOPY: Record<DLang, Record<string, string>> = {
  en: {
    minDon: 'The smallest donation is {n} XAF', needPhone: 'Please enter your phone number',
    promptFail: 'The payment prompt could not reach that phone',
    startedTitle: 'Payment started', checkPhone: 'Check your phone and approve the payment prompt.',
    donationLabel: 'Donation:', supportTitle: 'Support Bambeh',
    supportSub: 'Help us keep Bambeh free and open to everyone.',
    raised: 'Total raised', donors: 'Donors', goal: 'Goal progress',
    frequency: 'How often?', onceLbl: 'One time', monthlyLbl: 'Every month',
    selectAmt: 'Choose an amount (XAF)', customAmt: 'Or type your own amount', amtPh: 'Enter amount...',
    payMethod: 'Payment method', cardLbl: 'Card', anon: 'Give without showing my name',
    yourName: 'Your name *', namePh: 'Full name...', emailLbl: 'Email address *',
    phoneLbl: 'Phone number *', sending: 'Sending payment prompt...', payWord: 'Pay',
    whyTitle: 'Why give?',
    why1: 'Keep Bambeh free for everyone', why2: 'Keep the platform running',
    why3: 'Support local traders', why4: 'Build new features', why5: 'Make Bambeh safer',
  },
  fr: {
    minDon: 'Le don minimum est de {n} XAF', needPhone: 'Veuillez saisir votre numéro de téléphone',
    promptFail: "La demande de paiement n'a pas pu atteindre ce téléphone",
    startedTitle: 'Paiement lancé', checkPhone: 'Vérifiez votre téléphone et approuvez la demande de paiement.',
    donationLabel: 'Don :', supportTitle: 'Soutenez Bambeh',
    supportSub: 'Aidez-nous à garder Bambeh gratuit et ouvert à tous.',
    raised: 'Total collecté', donors: 'Donateurs', goal: 'Progression',
    frequency: 'À quelle fréquence ?', onceLbl: 'Une seule fois', monthlyLbl: 'Chaque mois',
    selectAmt: 'Choisissez un montant (XAF)', customAmt: 'Ou saisissez votre montant', amtPh: 'Saisir le montant...',
    payMethod: 'Moyen de paiement', cardLbl: 'Carte', anon: 'Donner sans afficher mon nom',
    yourName: 'Votre nom *', namePh: 'Nom complet...', emailLbl: 'Adresse e-mail *',
    phoneLbl: 'Numéro de téléphone *', sending: 'Envoi de la demande de paiement...', payWord: 'Payer',
    whyTitle: 'Pourquoi donner ?',
    why1: 'Garder Bambeh gratuit pour tous', why2: 'Faire tourner la plateforme',
    why3: 'Soutenir les commerçants locaux', why4: 'Créer de nouvelles fonctionnalités', why5: 'Rendre Bambeh plus sûr',
  },
  pidgin: {
    minDon: 'Di smallest donation na {n} XAF', needPhone: 'Abeg put your phone number',
    promptFail: 'Di payment prompt no fit reach dat phone',
    startedTitle: 'Payment don start', checkPhone: 'Check your phone and approve di payment prompt.',
    donationLabel: 'Donation:', supportTitle: 'Support Bambeh',
    supportSub: 'Help us make Bambeh stay free for everybody.',
    raised: 'All wey don enter', donors: 'People wey give', goal: 'How far we don go',
    frequency: 'How e go take dey?', onceLbl: 'Just one time', monthlyLbl: 'Every month',
    selectAmt: 'Choose how much (XAF)', customAmt: 'Or write your own amount', amtPh: 'Put amount...',
    payMethod: 'How you wan pay', cardLbl: 'Card', anon: 'Give but no show my name',
    yourName: 'Your name *', namePh: 'Full name...', emailLbl: 'Email address *',
    phoneLbl: 'Phone number *', sending: 'Dey send payment prompt...', payWord: 'Pay',
    whyTitle: 'Why you go give?',
    why1: 'Make Bambeh stay free for everybody', why2: 'Make di platform continue dey work',
    why3: 'Support local business people', why4: 'Build new things', why5: 'Make Bambeh safe pass',
  },
  ar: {
    minDon: 'أقل تبرع هو {n} فرنك', needPhone: 'يرجى إدخال رقم هاتفك',
    promptFail: 'تعذّر وصول طلب الدفع إلى هذا الهاتف',
    startedTitle: 'بدأ الدفع', checkPhone: 'تحقق من هاتفك ووافق على طلب الدفع.',
    donationLabel: 'التبرع:', supportTitle: 'ادعم بامبيه',
    supportSub: 'ساعدنا في إبقاء بامبيه مجانياً ومتاحاً للجميع.',
    raised: 'إجمالي ما تم جمعه', donors: 'المتبرعون', goal: 'نسبة الهدف',
    frequency: 'كم مرة؟', onceLbl: 'مرة واحدة', monthlyLbl: 'كل شهر',
    selectAmt: 'اختر المبلغ (فرنك)', customAmt: 'أو اكتب مبلغاً آخر', amtPh: 'أدخل المبلغ...',
    payMethod: 'طريقة الدفع', cardLbl: 'بطاقة', anon: 'التبرع دون إظهار اسمي',
    yourName: 'اسمك *', namePh: 'الاسم الكامل...', emailLbl: 'البريد الإلكتروني *',
    phoneLbl: 'رقم الهاتف *', sending: 'جارٍ إرسال طلب الدفع...', payWord: 'ادفع',
    whyTitle: 'لماذا تتبرع؟',
    why1: 'إبقاء بامبيه مجانياً للجميع', why2: 'الحفاظ على تشغيل المنصة',
    why3: 'دعم التجار المحليين', why4: 'بناء ميزات جديدة', why5: 'جعل بامبيه أكثر أماناً',
  },
  ff: {
    minDon: 'Sadaka famarde ko {n} XAF', needPhone: 'Naatnu limngal telefol maa',
    promptFail: 'Ɓayre yoɓgol ndee waawaa yottaade e telefol ngol',
    startedTitle: 'Yoɓgol fuɗɗiima', checkPhone: 'Ƴeewndo telefol maa njaɓaa ɓayre yoɓgol ndee.',
    donationLabel: 'Sadaka:', supportTitle: 'Wallu Bambeh',
    supportSub: 'Wallu min ngam Bambeh heddoo meere e udditiiɗo e fof.',
    raised: 'Ko mooɓaa fof', donors: 'Sadakiyankooɓe', goal: 'Ko yahi e faandaare',
    frequency: 'No foti laabi?', onceLbl: 'Laawol gootol', monthlyLbl: 'Kala lewru',
    selectAmt: 'Suɓo njaru (XAF)', customAmt: 'Walla winndu njaru maa', amtPh: 'Naatnu njaru...',
    payMethod: 'Mbaydi yoɓgol', cardLbl: 'Karta', anon: 'Yoɓ ko aldaa e hollirde innde am',
    yourName: 'Innde maa *', namePh: 'Innde timmunde...', emailLbl: 'Iimeel *',
    phoneLbl: 'Limngal telefol *', sending: 'Ena neldee ɓayre yoɓgol...', payWord: 'Yoɓ',
    whyTitle: 'Ko waɗi njoɓaa?',
    why1: 'Bambeh heddoo meere e fof', why2: 'Platform ndee heddoo e golle',
    why3: 'Wallu njulaaɓe leydi', why4: 'Mahde keɓe kesi', why5: 'Bambeh ɓeydoo hisde',
  },
};

const TIER_TR: Record<string, Record<DLang, string>> = {
  Supporter: { en: 'Supporter', fr: 'Soutien',   pidgin: 'Supporter', ar: 'داعم',   ff: 'Ballo' },
  Champion:  { en: 'Champion',  fr: 'Champion',  pidgin: 'Champion',  ar: 'بطل',    ff: 'Cewɗo' },
  Hero:      { en: 'Hero',      fr: 'Héros',     pidgin: 'Hero',      ar: 'بطل عظيم', ff: 'Baaba' },
  Legend:    { en: 'Legend',    fr: 'Légende',   pidgin: 'Legend',    ar: 'أسطورة', ff: 'Mawɗo' },
};

type PayMethod = 'mtn' | 'orange' | 'card';

export default function DonatePremium() {
  // FIX349 - useLang() never throws and always returns one of the five keys.
  const rawLang = String(useLang() || 'en');
  const lang: DLang = (DCOPY[rawLang as DLang] ? rawLang : 'en') as DLang;
  const t = (k: string) => DCOPY[lang][k] ?? DCOPY.en[k] ?? k;
  const isRtl = lang === 'ar';

  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PayMethod>('mtn');
  const [donationType, setDonationType] = useState<'once' | 'monthly'>('once');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+237');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [serverMessage, setServerMessage] = useState('');

  const selectedAmount = Number(amount || customAmount || 0);
  const isValidAmount = selectedAmount >= MIN_DONATION;
  const selectedTier = useMemo(
    () => DONATION_TIERS.find(tier => selectedAmount >= tier.min && selectedAmount <= tier.max),
    [selectedAmount]
  );

  /* FIX191 — REAL DONATION STATS.
     These three numbers were hardcoded: raised 3,247,000 XAF / 1,247 donors /
     65% of goal. They never moved, no matter how many people gave. Inventing
     social proof is the fastest way to lose a user's trust the moment they
     notice it, so they are now read from the `donations` table and rise with
     every real donation.

     Verified against the live schema:
       donations(id, reference, amount int, currency, phone, operator,
                 user_id, tx_data jsonb, donated_at timestamptz)

     The goal is a genuine campaign target, not a measurement — it stays a
     constant, and the bar is honest because `raised` is real. Until the first
     donation arrives the block simply hides itself rather than showing zeros
     or fabricated figures. */
  const DONATION_GOAL_XAF = 5_000_000;

  const [impactStats, setImpactStats] = useState({
    goal:        DONATION_GOAL_XAF,
    raised:      0,
    donors:      0,
    avgDonation: 0,
  });
  const [statsReady, setStatsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // amount is the only column we need; count comes from the row length.
      const { data, error } = await supabase
        .from('donations')
        .select('amount');

      if (cancelled) return;

      if (error || !data) {
        // No invented fallback. If we cannot read the real figures we show
        // nothing at all — never a made-up number.
        setStatsReady(false);
        return;
      }

      const raised = data.reduce(
        (sum, row) => sum + (Number((row as { amount?: number }).amount) || 0),
        0
      );
      const donors = data.length;

      setImpactStats({
        goal:        DONATION_GOAL_XAF,
        raised,
        donors,
        avgDonation: donors > 0 ? Math.round(raised / donors) : 0,
      });
      setStatsReady(donors > 0);
    })();

    return () => { cancelled = true; };
  }, []);

  const progressPercent = impactStats.goal > 0
    ? Math.min((impactStats.raised / impactStats.goal) * 100, 100)
    : 0;

  const normalizePhone = (value: string) => {
    const cleaned = value.replace(/\s+/g, '');
    if (cleaned.startsWith('6') && cleaned.length === 9) return `+237${cleaned}`;
    return cleaned;
  };

  const canPay = isValidAmount && phone.trim().length >= 8 && (isAnonymous || name.trim()) && (isAnonymous || email.trim());

  const handleAmountSelect = (value: number) => {
    setAmount(String(value));
    setCustomAmount('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidAmount) return alert(t('minDon').replace('{n}', String(MIN_DONATION)));
    if (!phone.trim()) return alert(t('needPhone'));

    setIsProcessing(true);
    setServerMessage('');

    try {
      const payload = {
        amount: selectedAmount,
        currency: 'XAF',
        paymentMethod,
        donationType,
        donorName: isAnonymous ? 'Anonymous' : name.trim(),
        email: isAnonymous ? '' : email.trim(),
        phone: normalizePhone(phone),
        anonymous: isAnonymous,
        source: 'donation-page'
      };

      // FIX98: donations go to the Supabase 'payments' Edge Function (Render/Railway dead)
      const res = await fetch('https://rbjbdxefwzvgmioearie.supabase.co/functions/v1/payments/api/payments/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || 'Payment initiation failed');
      }

      if (data?.message) setServerMessage(data.message);

      if (data?.checkoutUrl) {
        window.location.assign(data.checkoutUrl);
        return;
      }

      if (data?.reference || data?.transactionId) {
        setShowThankYou(true);
        return;
      }

      throw new Error('No payment reference returned by server');
    } catch (error: any) {
      console.error(error);
      alert(error?.message || t('promptFail'));
    } finally {
      setIsProcessing(false);
    }
  };

  if (showThankYou) {
    return (
      <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center p-4">
        <div className="text-center text-white max-w-2xl">
          <div className="mb-8 animate-bounce">
            <div className="w-32 h-32 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-16 h-16 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4">{t('startedTitle')} 🎉</h1>
          <p className="text-2xl text-purple-100 mb-8">
            {t('checkPhone')}
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
            <p className="text-lg mb-2">{t('donationLabel')}</p>
            <div className="flex items-center justify-center gap-3 text-3xl">
              {selectedTier?.icon} <span className="font-bold">{selectedTier ? (TIER_TR[selectedTier.name]?.[lang] ?? selectedTier.name) : ''}</span>
            </div>
          </div>
          <p className="text-purple-200">{serverMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl p-8 md:p-12 mb-8 text-white">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mb-32" />
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <Heart className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">{t('supportTitle')}</h1>
            <p className="text-xl md:text-2xl text-purple-100 mb-8 max-w-3xl mx-auto">
              {t('supportSub')}
            </p>
            {/* FIX191 — shown only when real donations exist. No zeros, no
                invented figures. */}
            {statsReady && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-center justify-center gap-2 mb-2"><TrendingUp className="w-5 h-5" /><span className="text-sm">{t('raised')}</span></div>
                <p className="text-3xl font-bold">
                  {impactStats.raised >= 1_000_000
                    ? `${(impactStats.raised / 1_000_000).toFixed(1)}M`
                    : impactStats.raised.toLocaleString()}
                </p>
                <p className="text-xs text-purple-200">XAF</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-center justify-center gap-2 mb-2"><Users className="w-5 h-5" /><span className="text-sm">{t('donors')}</span></div>
                <p className="text-3xl font-bold">{impactStats.donors.toLocaleString()}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-center justify-center gap-2 mb-2"><Target className="w-5 h-5" /><span className="text-sm">{t('goal')}</span></div>
                <p className="text-3xl font-bold">{progressPercent.toFixed(0)}%</p>
              </div>
            </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl p-6 md:p-8">
            <div className="mb-8">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                <Calendar className="w-4 h-4 inline mr-2" />
                {t('frequency')}
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button type="button" onClick={() => setDonationType('once')} className={`px-6 py-4 rounded-2xl font-bold transition-all ${donationType === 'once' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  <Zap className="w-5 h-5 inline mr-2" /> {t('onceLbl')}
                </button>
                <button type="button" onClick={() => setDonationType('monthly')} className={`px-6 py-4 rounded-2xl font-bold transition-all ${donationType === 'monthly' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  <TrendingUp className="w-5 h-5 inline mr-2" /> {t('monthlyLbl')}
                </button>
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-bold text-gray-700 mb-3">{t('selectAmt')}</label>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-4">
                {QUICK_AMOUNTS.map((amt) => (
                  <button key={amt} type="button" onClick={() => handleAmountSelect(amt)} className={`px-4 py-4 rounded-2xl font-bold transition-all ${amount === String(amt) ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg scale-105' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'}`}>
                    {amt.toLocaleString()}
                  </button>
                ))}
              </div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t('customAmt')}</label>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setAmount('');
                }}
                placeholder={t('amtPh')}
                min={MIN_DONATION}
                className="w-full px-4 py-4 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 font-semibold text-lg"
              />
            </div>

            <div className="mb-8">
              <label className="block text-sm font-bold text-gray-700 mb-3">{t('payMethod')}</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button type="button" onClick={() => setPaymentMethod('mtn')} className={`p-4 rounded-2xl font-bold transition-all ${paymentMethod === 'mtn' ? 'bg-yellow-500 text-black ring-4 ring-yellow-300 scale-105' : 'bg-gray-100 text-gray-700 hover:bg-yellow-50'}`}>
                  <Smartphone className="w-6 h-6 mx-auto mb-2" /> MTN MoMo
                </button>
                <button type="button" onClick={() => setPaymentMethod('orange')} className={`p-4 rounded-2xl font-bold transition-all ${paymentMethod === 'orange' ? 'bg-orange-500 text-white ring-4 ring-orange-300 scale-105' : 'bg-gray-100 text-gray-700 hover:bg-orange-50'}`}>
                  <Smartphone className="w-6 h-6 mx-auto mb-2" /> Orange Money
                </button>
                <button type="button" onClick={() => setPaymentMethod('card')} className={`p-4 rounded-2xl font-bold transition-all ${paymentMethod === 'card' ? 'bg-blue-600 text-white ring-4 ring-blue-300 scale-105' : 'bg-gray-100 text-gray-700 hover:bg-blue-50'}`}>
                  <CreditCard className="w-6 h-6 mx-auto mb-2" /> {t('cardLbl')}
                </button>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <input type="checkbox" id="anonymous" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500" />
                <label htmlFor="anonymous" className="text-sm font-medium text-gray-700">{t('anon')}</label>
              </div>

              {!isAnonymous && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">{t('yourName')}</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('namePh')} className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">{t('emailLbl')}</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500" required />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t('phoneLbl')}</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+237 6XXXXXXXX"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!canPay || isProcessing}
              className={`w-full px-8 py-5 rounded-2xl font-bold text-xl transition-all ${canPay && !isProcessing ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white shadow-2xl hover:scale-105' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            >
              <Heart className="w-6 h-6 inline mr-3" />
              {isProcessing ? t('sending') : `${t('payWord')} ${selectedAmount ? selectedAmount.toLocaleString() : ''} XAF`}
            </button>
            {serverMessage && <p className="mt-3 text-center text-sm text-gray-600">{serverMessage}</p>}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h3 className="font-bold text-gray-900 text-xl mb-4">{t('whyTitle')}</h3>
              <div className="space-y-3">
                {[
                  { icon: '🚀', text: t('why1') },
                  { icon: '⚡', text: t('why2') },
                  { icon: '💪', text: t('why3') },
                  { icon: '🎨', text: t('why4') },
                  { icon: '🛡️', text: t('why5') },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <p className="text-gray-700">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__DONATEPREMIUM__COMPLETE
// BAMBEH_END_TOKEN__DONATEPREMIUM_FIX349__COMPLETE
