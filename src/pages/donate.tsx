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

import { useMemo, useState } from 'react';
import {
  Heart,
  CreditCard,
  Smartphone,
  Bitcoin,
  Check,
  TrendingUp,
  Users,
  Zap,
  Shield,
  Award,
  Sparkles,
  Target,
  Crown,
  Star,
  Calendar,
  Download,
  Share2
} from 'lucide-react';

const MIN_DONATION = 500;
const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000];

const DONATION_TIERS = [
  {
    name: {
      en: 'Supporter',
      fr: 'Soutien',
      ar: 'داعِم',
      ff: 'Jaɓɓorgo',
      pidgin: 'Supporter',
    },
    icon: '💚',
    min: 500,
    max: 4999,
    color: 'from-green-400 to-emerald-600',
    perks: {
      en: ['Bronze badge', 'Thank you email', 'Recognition on website'],
      fr: ['Badge bronze', 'Courriel de remerciement', 'Reconnaissance sur le site'],
      ar: ['شارة برونزية', 'رسالة شكر بالبريد الإلكتروني', 'ذكر على الموقع'],
      ff: ['Badge bronze', 'Ɗum alluwal e mail', 'Yiytinde e lowre nde web'],
      pidgin: ['Bronze badge', 'Thank you email', 'Recognition for website'],
    }
  },
  {
    name: {
      en: 'Champion',
      fr: 'Champion',
      ar: 'بطل',
      ff: 'Champion',
      pidgin: 'Champion',
    },
    icon: '⭐',
    min: 5000,
    max: 14999,
    color: 'from-blue-400 to-indigo-600',
    perks: {
      en: ['Silver badge', 'Quarterly newsletter', 'Special mention', 'Early feature access'],
      fr: ['Badge argent', 'Bulletin trimestriel', 'Mention spéciale', 'Accès anticipé aux fonctionnalités'],
      ar: ['شارة فضية', 'نشرة ربع سنوية', 'ذكر خاص', 'وصول مبكر إلى الميزات'],
      ff: ['Badge silber', 'Njuɓɓoore e wuro 3 moonde', 'Hollugo moƴƴo', 'Naatugol fuɗɗoore to feereji kesɗi'],
      pidgin: ['Silver badge', 'Quarterly newsletter', 'Special mention', 'Early access to features'],
    }
  },
  {
    name: {
      en: 'Hero',
      fr: 'Héros',
      ar: 'بطل',
      ff: 'Hero',
      pidgin: 'Hero',
    },
    icon: '🏆',
    min: 15000,
    max: 49999,
    color: 'from-purple-400 to-pink-600',
    perks: {
      en: ['Gold badge', 'Monthly updates', 'VIP support', 'Name in credits', 'Beta features'],
      fr: ['Badge or', 'Mises à jour mensuelles', 'Assistance VIP', 'Nom dans les crédits', 'Fonctionnalités bêta'],
      ar: ['شارة ذهبية', 'تحديثات شهرية', 'دعم VIP', 'الاسم في قائمة الشكر', 'ميزات تجريبية'],
      ff: ['Badge gold', 'Habaruji lewru nde', 'Ballal VIP', 'Innde maa e credits', 'Feereji beta'],
      pidgin: ['Gold badge', 'Monthly updates', 'VIP support', 'Name for credits', 'Beta features'],
    }
  },
  {
    name: {
      en: 'Legend',
      fr: 'Légende',
      ar: 'أسطورة',
      ff: 'Legend',
      pidgin: 'Legend',
    },
    icon: '👑',
    min: 50000,
    max: 999999,
    color: 'from-yellow-400 to-orange-600',
    perks: {
      en: ['Diamond badge', 'Direct access to team', 'Feature voting rights', 'Annual recognition', 'Lifetime VIP'],
      fr: ['Badge diamant', 'Accès direct à l’équipe', 'Droit de vote sur les fonctionnalités', 'Reconnaissance annuelle', 'VIP à vie'],
      ar: ['شارة ألماسية', 'وصول مباشر إلى الفريق', 'حقوق التصويت على الميزات', 'تكريم سنوي', 'VIP مدى الحياة'],
      ff: ['Badge diamond', 'Naatugol fiirewto to team', 'Droit e votel feereji', 'Yiytinde asamaani', 'VIP haa ɓuri e ndiyan'],
      pidgin: ['Diamond badge', 'Direct access to the team', 'Voting rights for features', 'Yearly recognition', 'Lifetime VIP'],
    }
  },
];

type PayMethod = 'mtn' | 'orange' | 'card';

export default function DonatePremium() {
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

  const selectedAmount = Number(amount || customAmount || 0);
  const isValidAmount = selectedAmount >= MIN_DONATION;
  const phoneValue = phone.trim();
  const isPhoneValid = phoneValue.length >= 8;

  const lang = 'en';

  const selectedTier = useMemo(
    () => DONATION_TIERS.find(tier => selectedAmount >= tier.min && selectedAmount <= tier.max),
    [selectedAmount]
  );

  const impactStats = {
    goal: 5000000,
    raised: 3247000,
    donors: 1247,
    avgDonation: 2600
  };

  const progressPercent = (impactStats.raised / impactStats.goal) * 100;

  const recentDonors = [
    { name: 'John D.', amount: 25000, time: '5 min ago', badge: '🏆' },
    { name: 'Anonymous', amount: 10000, time: '12 min ago', badge: '⭐' },
    { name: 'Mary K.', amount: 50000, time: '1 hour ago', badge: '👑' },
  ];

  const normalizePhone = (value: string) => {
    const v = value.replace(/\s+/g, '');
    if (v.startsWith('6') && v.length === 9) return `+237${v}`;
    return v;
  };

  const handleAmountSelect = (value: number) => {
    setAmount(String(value));
    setCustomAmount('');
  };

  const canPay = isValidAmount && isPhoneValid && (isAnonymous || name.trim()) && email.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidAmount) {
      alert('Minimum donation is 500 XAF');
      return;
    }

    if (!isPhoneValid) {
      alert('Please enter a valid mobile number');
      return;
    }

    setIsProcessing(true);

    try {
      const payload = {
        amount: selectedAmount,
        currency: 'XAF',
        phone: normalizePhone(phoneValue),
        paymentMethod,
        donationType,
        donorName: isAnonymous ? 'Anonymous' : name.trim(),
        email: email.trim(),
        source: 'donation-page'
      };

      const res = await fetch('https://bambeh-payment-server.onrender.com/api/donations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Payment request failed');
      }

      const data = await res.json();

      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      setShowThankYou(true);
    } catch (error) {
      console.error('Donation error:', error);
      alert('Unable to start payment.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (showThankYou) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center p-4">
        <div className="text-center text-white max-w-2xl">
          <div className="mb-8 animate-bounce">
            <div className="w-32 h-32 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-16 h-16 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4">
            {lang === 'fr' ? 'Merci ! 🎉' : lang === 'ar' ? 'شكرًا لك! 🎉' : lang === 'ff' ? 'A jaaraama! 🎉' : lang === 'pidgin' ? 'Thank You! 🎉' : 'Thank You! 🎉'}
          </h1>
          <p className="text-2xl text-purple-100 mb-8">
            {lang === 'fr'
              ? `Votre généreux don de ${selectedAmount.toLocaleString()} XAF compte énormément pour nous !`
              : lang === 'ar'
              ? `تبرعك السخي بقيمة ${selectedAmount.toLocaleString()} XAF يعني لنا الكثير!`
              : lang === 'ff'
              ? `Donation maa ndee ${selectedAmount.toLocaleString()} XAF ko ɗum ɓuri heɓde fii men!`
              : lang === 'pidgin'
              ? `Your kind donation of ${selectedAmount.toLocaleString()} XAF really mean a lot to us!`
              : `Your generous donation of ${selectedAmount.toLocaleString()} XAF means the world to us!`}
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
            <p className="text-lg mb-2">
              {lang === 'fr' ? 'Vous avez débloqué :' : lang === 'ar' ? 'لقد فتحت:' : lang === 'ff' ? 'A udditii:' : lang === 'pidgin' ? "You've unlocked:" : "You've unlocked:"}
            </p>
            <div className="flex items-center justify-center gap-3 text-3xl">
              {selectedTier?.icon} <span className="font-bold">{selectedTier?.name?.[lang as keyof typeof selectedTier.name] ?? selectedTier?.name?.en} Badge!</span>
            </div>
          </div>
          <p className="text-purple-200">
            {lang === 'fr' ? `Reçu envoyé à ${email}` : lang === 'ar' ? `تم إرسال الإيصال إلى ${email}` : lang === 'ff' ? `Reewitaande nelowii to ${email}` : lang === 'pidgin' ? `Receipt don go to ${email}` : `Receipt sent to ${email}`}
          </p>
          <div className="mt-8">
            <div className="animate-pulse text-6xl">💚🇨🇲</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl p-8 md:p-12 mb-8 text-white">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mb-32" />

          <div className="relative z-10 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <Heart className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {lang === 'fr' ? 'Soutenez Bambeh' : lang === 'ar' ? 'ادعم Bambeh' : lang === 'ff' ? 'Wallu Bambeh' : lang === 'pidgin' ? 'Support Bambeh' : 'Support Bambeh'}
            </h1>
            <p className="text-xl md:text-2xl text-purple-100 mb-8 max-w-3xl mx-auto">
              {lang === 'fr'
                ? 'Aidez-nous à garder Bambeh gratuit et accessible pour tous les utilisateurs dans le monde'
                : lang === 'ar'
                ? 'ساعدنا في إبقاء Bambeh مجانيًا ومتاحًا لجميع المستخدمين حول العالم'
                : lang === 'ff'
                ? 'Walla min ngam Bambeh nyiɓɓe e heɓɓude e kala huutoroowo e duniyaru'
                : lang === 'pidgin'
                ? 'Help us keep Bambeh free and accessible for all users worldwide'
                : 'Help us keep Bambeh free and accessible for all users worldwide'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm">{lang === 'fr' ? 'Total collecté' : lang === 'ar' ? 'إجمالي المبلغ' : lang === 'ff' ? 'Hokkiinde fof' : lang === 'pidgin' ? 'Total Raised' : 'Total Raised'}</span>
                </div>
                <p className="text-3xl font-bold">{(impactStats.raised / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-purple-200">XAF</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="w-5 h-5" />
                  <span className="text-sm">{lang === 'fr' ? 'Donateurs' : lang === 'ar' ? 'المتبرعون' : lang === 'ff' ? 'Hokkitooɓe' : lang === 'pidgin' ? 'Donors' : 'Donors'}</span>
                </div>
                <p className="text-3xl font-bold">{impactStats.donors.toLocaleString()}</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Target className="w-5 h-5" />
                  <span className="text-sm">{lang === 'fr' ? 'Progression de l’objectif' : lang === 'ar' ? 'تقدم الهدف' : lang === 'ff' ? 'Naatugol ɗo goal' : lang === 'pidgin' ? 'Goal Progress' : 'Goal Progress'}</span>
                </div>
                <p className="text-3xl font-bold">{progressPercent.toFixed(0)}%</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8">
              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  {lang === 'fr' ? 'Fréquence du don' : lang === 'ar' ? 'تكرار التبرع' : lang === 'ff' ? 'Laawol donation' : lang === 'pidgin' ? 'Donation Frequency' : 'Donation Frequency'}
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button type="button" onClick={() => setDonationType('once')} className={`px-6 py-4 rounded-2xl font-bold transition-all ${donationType === 'once' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    <Zap className="w-5 h-5 inline mr-2" />
                    {lang === 'fr' ? 'Ponctuel' : lang === 'ar' ? 'مرة واحدة' : lang === 'ff' ? 'Ngangaw' : lang === 'pidgin' ? 'One-Time' : 'One-Time'}
                  </button>
                  <button type="button" onClick={() => setDonationType('monthly')} className={`px-6 py-4 rounded-2xl font-bold transition-all ${donationType === 'monthly' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    <TrendingUp className="w-5 h-5 inline mr-2" />
                    {lang === 'fr' ? 'Mensuel' : lang === 'ar' ? 'شهري' : lang === 'ff' ? 'Lewru nde' : lang === 'pidgin' ? 'Monthly' : 'Monthly'}
                  </button>
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  {lang === 'fr' ? 'Choisissez le montant (XAF)' : lang === 'ar' ? 'اختر المبلغ (XAF)' : lang === 'ff' ? 'Suɓo monto (XAF)' : lang === 'pidgin' ? 'Select Amount (XAF)' : 'Select Amount (XAF)'}
                </label>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-4">
                  {QUICK_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleAmountSelect(amt)}
                      className={`px-4 py-4 rounded-2xl font-bold transition-all ${amount === String(amt) ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg scale-105' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'}`}
                    >
                      {amt.toLocaleString()}
                    </button>
                  ))}
                </div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {lang === 'fr' ? 'Ou saisissez un montant personnalisé' : lang === 'ar' ? 'أو أدخل مبلغًا مخصصًا' : lang === 'ff' ? 'Walla naatnu monto keso' : lang === 'pidgin' ? 'Or Enter Custom Amount' : 'Or Enter Custom Amount'}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">XAF</span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setAmount('');
                    }}
                    placeholder={lang === 'fr' ? 'Entrez le montant...' : lang === 'ar' ? 'أدخل المبلغ...' : lang === 'ff' ? 'Naatnu monto...' : lang === 'pidgin' ? 'Enter amount...' : 'Enter amount...'}
                    className="w-full pl-16 pr-4 py-4 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 font-semibold text-lg"
                    min={MIN_DONATION}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {lang === 'fr' ? 'Minimum : 500 XAF' : lang === 'ar' ? 'الحد الأدنى: 500 XAF' : lang === 'ff' ? 'Ɗiɗo gooto: 500 XAF' : lang === 'pidgin' ? 'Minimum: 500 XAF' : 'Minimum: 500 XAF'}
                </p>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  {lang === 'fr' ? 'Moyen de paiement' : lang === 'ar' ? 'طريقة الدفع' : lang === 'ff' ? 'Feere njaaɓtude' : lang === 'pidgin' ? 'Payment Method' : 'Payment Method'}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button type="button" onClick={() => setPaymentMethod('mtn')} className={`p-4 rounded-2xl font-bold transition-all ${paymentMethod === 'mtn' ? 'bg-yellow-500 text-black ring-4 ring-yellow-300 scale-105' : 'bg-gray-100 text-gray-700 hover:bg-yellow-50'}`}>
                    <Smartphone className="w-6 h-6 mx-auto mb-2" /> MTN MoMo
                  </button>
                  <button type="button" onClick={() => setPaymentMethod('orange')} className={`p-4 rounded-2xl font-bold transition-all ${paymentMethod === 'orange' ? 'bg-orange-500 text-white ring-4 ring-orange-300 scale-105' : 'bg-gray-100 text-gray-700 hover:bg-orange-50'}`}>
                    <Smartphone className="w-6 h-6 mx-auto mb-2" /> Orange Money
                  </button>
                  <button type="button" onClick={() => setPaymentMethod('card')} className={`p-4 rounded-2xl font-bold transition-all ${paymentMethod === 'card' ? 'bg-blue-600 text-white ring-4 ring-blue-300 scale-105' : 'bg-gray-100 text-gray-700 hover:bg-blue-50'}`}>
                    <CreditCard className="w-6 h-6 mx-auto mb-2" /> Card
                  </button>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <input type="checkbox" id="anonymous" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500" />
                  <label htmlFor="anonymous" className="text-sm font-medium text-gray-700">
                    {lang === 'fr' ? 'Faire un don anonymement' : lang === 'ar' ? 'تبرع بشكل مجهول' : lang === 'ff' ? 'Hokka e hesere' : lang === 'pidgin' ? 'Donate anonymously' : 'Donate anonymously'}
                  </label>
                </div>

                {!isAnonymous && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      {lang === 'fr' ? 'Votre nom *' : lang === 'ar' ? 'اسمك *' : lang === 'ff' ? 'Innde maa *' : lang === 'pidgin' ? 'Your Name *' : 'Your Name *'}
                    </label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={lang === 'fr' ? 'Nom complet...' : lang === 'ar' ? 'الاسم الكامل...' : lang === 'ff' ? 'Innde peeje...' : lang === 'pidgin' ? 'Full name...' : 'Full name...'} className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500" required />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {lang === 'fr' ? 'Adresse e-mail *' : lang === 'ar' ? 'البريد الإلكتروني *' : lang === 'ff' ? 'E-mail *' : lang === 'pidgin' ? 'Email Address *' : 'Email Address *'}
                  </label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500" required />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {lang === 'fr' ? 'Numéro Mobile Money / Carte *' : lang === 'ar' ? 'رقم الهاتف / البطاقة *' : lang === 'ff' ? 'Numéro telefon / kartel *' : lang === 'pidgin' ? 'Mobile Money / Card Number *' : 'Mobile Money / Card Number *'}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={lang === 'fr' ? '+237 6XXXXXXXX ou numéro international' : lang === 'ar' ? '+237 6XXXXXXXX أو رقم دولي' : lang === 'ff' ? '+237 6XXXXXXXX walla numéro international' : lang === 'pidgin' ? '+237 6XXXXXXXX or international number' : '+237 6XXXXXXXX or international number'}
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
                {isProcessing
                  ? (lang === 'fr' ? 'Envoi de la demande de paiement...' : lang === 'ar' ? 'جارٍ إرسال طلب الدفع...' : lang === 'ff' ? 'Nana yaltude njaaɓtude...' : lang === 'pidgin' ? 'Sending payment prompt...' : 'Sending payment prompt...')
                  : (lang === 'fr'
                    ? `Payer ${selectedAmount ? selectedAmount.toLocaleString() : ''} XAF`
                    : lang === 'ar'
                    ? `ادفع ${selectedAmount ? selectedAmount.toLocaleString() : ''} XAF`
                    : lang === 'ff'
                    ? `Njaaɓtu ${selectedAmount ? selectedAmount.toLocaleString() : ''} XAF`
                    : lang === 'pidgin'
                    ? `Pay ${selectedAmount ? selectedAmount.toLocaleString() : ''} XAF`
                    : `Pay ${selectedAmount ? selectedAmount.toLocaleString() : ''} XAF`)}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h3 className="font-bold text-gray-900 text-xl mb-4">
                {lang === 'fr' ? 'Pourquoi faire un don ?' : lang === 'ar' ? 'لماذا تتبرع؟' : lang === 'ff' ? 'Ko honɗun hokkata?' : lang === 'pidgin' ? 'Why Donate?' : 'Why Donate?'}
              </h3>
              <div className="space-y-3">
                {[
                  { icon: '🚀', text: { en: 'Keep Bambeh free for all users', fr: 'Garder Bambeh gratuit pour tous les utilisateurs', ar: 'إبقاء Bambeh مجانيًا لجميع المستخدمين', ff: 'Ɗuum Bambeh ngol ɓeññude e kala huutoroowo', pidgin: 'Keep Bambeh free for all users' } },
                  { icon: '⚡', text: { en: 'Maintain platform operations', fr: 'Maintenir le fonctionnement de la plateforme', ar: 'الحفاظ على تشغيل المنصة', ff: 'Hasda golle platform', pidgin: 'Maintain platform operations' } },
                  { icon: '💪', text: { en: 'Support local entrepreneurs', fr: 'Soutenir les entrepreneurs locaux', ar: 'دعم رواد الأعمال المحليين', ff: 'Wallu ɓeynguɓe ladde', pidgin: 'Support local entrepreneurs' } },
                  { icon: '🎨', text: { en: 'Fund new features', fr: 'Financer les nouvelles fonctionnalités', ar: 'تمويل الميزات الجديدة', ff: 'Hokku feereji kesɗi', pidgin: 'Fund new features' } },
                  { icon: '🛡️', text: { en: 'Improve security & safety', fr: 'Améliorer la sécurité et la sûreté', ar: 'تحسين الأمان والسلامة', ff: 'Ɓeydu kaɓɓorɗe e kisal', pidgin: 'Improve security & safety' } },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <p className="text-gray-700">{item.text[lang as keyof typeof item.text] ?? item.text.en}</p>
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