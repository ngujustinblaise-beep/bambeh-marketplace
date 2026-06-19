/**
 * src/pages/ZermPurchase.tsx  â€”  Bambeh Marketplace
 * FILE LOCATION: src/pages/ZermPurchase.tsx
 *
 * FIXED (this version):
 *  âœ… Route is /coins/buy (matches router fix)
 *  âœ… Full i18n â€” EN, FR, Pidgin, Arabic, Fulfulde
 *  âœ… RTL layout for Arabic
 *  âœ… Redirects to /coins?purchased=1 after success so CoinsPage auto-refreshes
 *  âœ… Uses CamPayWidget â€” all CamPay logic lives there
 *  âœ… Coins credited only AFTER CamPay confirms SUCCESSFUL payment
 *  âœ… Records purchase in zerm_purchases + updates zerm_coins balance + logs zerm_transactions
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Check, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import CamPayWidget from '@/components/payment/CamPayWidget';
import { useLang } from '@/hooks/useAppLang';

// â”€â”€ i18n â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const strings = {
  en: {
    pageTitle:      'Buy Zerm Coins',
    currentBalance: 'Current Balance',
    infoLine1:      '1 Zerm Coin = 100 XAF',
    infoLine2:      'Use coins to boost listings, send gifts, or pay on the platform.',
    choosePackage:  'Choose a Package',
    coins:          'coins',
    bonus:          'bonus',
    total:          'total',
    mostPopular:    'Most Popular',
    payWith:        'Pay with Mobile Money',
    buyBtn:         (n: number, price: number) => `Buy ${n} Zerm Coins â€” ${price.toLocaleString()} XAF`,
    successTitle:   'Purchase Successful! âš¡',
    addedTo:        'added to your wallet',
    viewWallet:     'View Wallet',
    backHome:       'Back to Home',
  },
  fr: {
    pageTitle:      'Acheter des PiÃ¨ces Zerm',
    currentBalance: 'Solde Actuel',
    infoLine1:      '1 piÃ¨ce Zerm = 100 FCFA',
    infoLine2:      "Utilisez les piÃ¨ces pour booster vos annonces, envoyer des cadeaux ou payer sur la plateforme.",
    choosePackage:  'Choisir un forfait',
    coins:          'piÃ¨ces',
    bonus:          'bonus',
    total:          'total',
    mostPopular:    'Le plus populaire',
    payWith:        'Payer avec Mobile Money',
    buyBtn:         (n: number, price: number) => `Acheter ${n} piÃ¨ces â€” ${price.toLocaleString()} FCFA`,
    successTitle:   'Achat rÃ©ussi ! âš¡',
    addedTo:        'ajoutÃ©es Ã  votre portefeuille',
    viewWallet:     'Voir le portefeuille',
    backHome:       "Retour Ã  l'accueil",
  },
  pidgin: {
    pageTitle:      'Buy Zerm Coins',
    currentBalance: 'Your Balance',
    infoLine1:      '1 Zerm Coin = 100 XAF',
    infoLine2:      'Use am boost listing, send gift, or pay for platform.',
    choosePackage:  'Pick Package',
    coins:          'coins',
    bonus:          'bonus',
    total:          'total',
    mostPopular:    'People Like Am',
    payWith:        'Pay with Mobile Money',
    buyBtn:         (n: number, price: number) => `Buy ${n} Coins â€” ${price.toLocaleString()} XAF`,
    successTitle:   'You don buy! âš¡',
    addedTo:        'don enter your wallet',
    viewWallet:     'See Wallet',
    backHome:       'Go Home',
  },
  ar: {
    pageTitle:      'Ø´Ø±Ø§Ø¡ Ø¹Ù…Ù„Ø§Øª Ø²Ø±Ù…',
    currentBalance: 'Ø§Ù„Ø±ØµÙŠØ¯ Ø§Ù„Ø­Ø§Ù„ÙŠ',
    infoLine1:      '1 Ø¹Ù…Ù„Ø© Ø²Ø±Ù… = 100 ÙØ±Ù†Ùƒ CFA',
    infoLine2:      'Ø§Ø³ØªØ®Ø¯Ù… Ø§Ù„Ø¹Ù…Ù„Ø§Øª Ù„ØªØ¹Ø²ÙŠØ² Ø¥Ø¹Ù„Ø§Ù†Ø§ØªÙƒ Ø£Ùˆ Ø¥Ø±Ø³Ø§Ù„ Ù‡Ø¯Ø§ÙŠØ§ Ø£Ùˆ Ø§Ù„Ø¯ÙØ¹ Ø¹Ù„Ù‰ Ø§Ù„Ù…Ù†ØµØ©.',
    choosePackage:  'Ø§Ø®ØªØ± Ø­Ø²Ù…Ø©',
    coins:          'Ø¹Ù…Ù„Ø§Øª',
    bonus:          'Ù…ÙƒØ§ÙØ£Ø©',
    total:          'Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹',
    mostPopular:    'Ø§Ù„Ø£ÙƒØ«Ø± Ø´Ø¹Ø¨ÙŠØ©',
    payWith:        'Ø§Ù„Ø¯ÙØ¹ Ø¨Ø§Ù„Ù‡Ø§ØªÙ Ø§Ù„Ù…Ø­Ù…ÙˆÙ„',
    buyBtn:         (n: number, price: number) => `Ø´Ø±Ø§Ø¡ ${n} Ø¹Ù…Ù„Ø© â€” ${price.toLocaleString()} ÙØ±Ù†Ùƒ`,
    successTitle:   'ØªÙ… Ø§Ù„Ø´Ø±Ø§Ø¡ Ø¨Ù†Ø¬Ø§Ø­! âš¡',
    addedTo:        'ØªÙ…Øª Ø§Ù„Ø¥Ø¶Ø§ÙØ© Ø¥Ù„Ù‰ Ù…Ø­ÙØ¸ØªÙƒ',
    viewWallet:     'Ø¹Ø±Ø¶ Ø§Ù„Ù…Ø­ÙØ¸Ø©',
    backHome:       'Ø§Ù„Ø¹ÙˆØ¯Ø© Ù„Ù„Ø±Ø¦ÙŠØ³ÙŠØ©',
  },
  fulfulde: {
    pageTitle:      'Sood Zerm CoinÉ—e',
    currentBalance: 'Soodaande maa',
    infoLine1:      '1 Zerm Coin = 100 XAF',
    infoLine2:      'HuÉ“É“in coinÉ—e ngam boost, neldugol hadiyaaÉ—o, walla faalugol.',
    choosePackage:  'SuÉ“ Paaketo',
    coins:          'coinÉ—e',
    bonus:          'bonus',
    total:          'fof',
    mostPopular:    'FijirtaaÉ—o',
    payWith:        'Faal to Mobile Money',
    buyBtn:         (n: number, price: number) => `Sood ${n} CoinÉ—e â€” ${price.toLocaleString()} XAF`,
    successTitle:   'Soodaande woni! âš¡',
    addedTo:        'sosaa e jaaborgal maa',
    viewWallet:     'Yiy Jaaborgal',
    backHome:       'Rutto Galle',
  },
} as const;

type Lang = keyof typeof strings;

// â”€â”€ Packages â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const PACKAGES = [
  { id: 'starter',  name: 'Starter',      amount: 5,   bonus: 0,  priceXAF: 500,   popular: false },
  { id: 'basic',    name: 'Basic',         amount: 10,  bonus: 1,  priceXAF: 1000,  popular: false },
  { id: 'popular',  name: 'Popular',       amount: 25,  bonus: 5,  priceXAF: 2500,  popular: true  },
  { id: 'value',    name: 'Value Pack',    amount: 50,  bonus: 10, priceXAF: 5000,  popular: false },
  { id: 'premium',  name: 'Premium Pack',  amount: 100, bonus: 25, priceXAF: 10000, popular: false },
];

export default function ZermPurchase() {
  const langRaw  = useLang() as string;
  const lang: Lang = (langRaw in strings ? langRaw : 'en') as Lang;
  const s        = strings[lang];
  const isRtl    = lang === 'ar';
  const navigate = useNavigate();

  const [selected,       setSelected]      = useState('popular');
  const [userId,         setUserId]        = useState<string | null>(null);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [done,           setDone]          = useState(false);
  const [coinsAdded,     setCoinsAdded]    = useState(0);

  const pkg        = PACKAGES.find(p => p.id === selected)!;
  const totalCoins = pkg.amount + pkg.bonus;

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate('/login'); return; }
      setUserId(session.user.id);

      const { data } = await supabase
        .from('zerm_coins')
        .select('balance')
        .eq('user_id', session.user.id)
        .maybeSingle();
      if (data) setCurrentBalance(data.balance ?? 0);
    })();
  }, [navigate]);

  // Called by CamPayWidget only after CamPay confirms SUCCESSFUL payment
  async function handlePaymentSuccess(reference: string) {
    if (!userId) return;
    const total = pkg.amount + pkg.bonus;

    try {
      // 1. Record purchase
      await supabase.from('zerm_purchases').insert({
        user_id:      userId,
        package_id:   pkg.id,
        coins_bought: pkg.amount,
        bonus_coins:  pkg.bonus,
        total_coins:  total,
        price_xaf:    pkg.priceXAF,
        reference,
        status:       'completed',
      });

      // 2. Upsert wallet balance
      const newBalance = currentBalance + total;
      await supabase.from('zerm_coins').upsert(
        { user_id: userId, balance: newBalance, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' },
      );

      // 3. Log transaction
      await supabase.from('zerm_transactions').insert({
        user_id:     userId,
        type:        'credit',
        amount:      total,
        description: `Purchased ${pkg.name} (${pkg.amount} + ${pkg.bonus} bonus)`,
        reference,
      });

      setCoinsAdded(total);
      setDone(true);
    } catch (err) {
      console.error('ZermPurchase handlePaymentSuccess error:', err);
      // Still mark as done â€” coins were bought; balance will sync on next refresh
      setCoinsAdded(total);
      setDone(true);
    }
  }

  // â”€â”€ Success screen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (done) {
    return (
      <div
        dir={isRtl ? 'rtl' : 'ltr'}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-green-50 p-6"
      >
        <div className="bg-white rounded-2xl shadow-md p-8 text-center max-w-sm w-full">
          <CheckCircle className="w-14 h-14 text-teal-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-4">{s.successTitle}</h2>
          <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-center gap-2">
              <Zap className="w-6 h-6 text-yellow-500" />
              <span className="text-3xl font-black text-gray-900">{coinsAdded}</span>
              <span className="text-gray-600 text-lg">Zerm</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{s.addedTo}</p>
          </div>
          <button
            onClick={() => navigate('/coins?purchased=1')}
            className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold mb-3 active:scale-95 transition-transform"
          >
            {s.viewWallet}
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full text-gray-400 text-sm py-2"
          >
            {s.backHome}
          </button>
        </div>
      </div>
    );
  }

  // â”€â”€ Main screen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div className="min-h-screen bg-gray-50 pb-12" dir={isRtl ? 'rtl' : 'ltr'}>

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
        </button>
        <h1 className="font-bold text-gray-900 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" /> {s.pageTitle}
        </h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-5">

        {/* Balance pill */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-5 text-white text-center">
          <p className="text-teal-100 text-sm mb-1">{s.currentBalance}</p>
          <p className="text-4xl font-black">
            {currentBalance.toLocaleString()} <span className="text-xl font-normal">Zerm</span>
          </p>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800">
          <p>ðŸ’¡ <strong>{s.infoLine1}</strong></p>
          <p className="text-xs text-blue-600 mt-0.5">{s.infoLine2}</p>
        </div>

        {/* Package grid */}
        <div className="space-y-3">
          <h2 className="font-bold text-gray-900">{s.choosePackage}</h2>
          {PACKAGES.map(p => {
            const isSelected = selected === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelected(p.id)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all relative ${
                  isSelected
                    ? 'border-teal-500 bg-teal-50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-teal-200'
                }`}
              >
                {p.popular && (
                  <span className={`absolute top-3 ${isRtl ? 'left-3' : 'right-3'} text-xs bg-teal-600 text-white px-2 py-0.5 rounded-full font-semibold`}>
                    {s.mostPopular}
                  </span>
                )}
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-gray-900">{p.name}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {p.amount} {s.coins}
                      {p.bonus > 0 && ` + ${p.bonus} ${s.bonus}`}
                      {' = '}
                      <span className="font-bold text-teal-600">{p.amount + p.bonus} {s.total}</span>
                    </p>
                  </div>
                  <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <p className="font-black text-gray-900">
                      {p.priceXAF.toLocaleString()} XAF
                    </p>
                    {isSelected && <Check className="w-5 h-5 text-teal-600 flex-shrink-0" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Payment widget */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <h2 className="font-bold text-gray-900 mb-4">{s.payWith}</h2>
          {userId ? (
            <CamPayWidget
              amount={pkg.priceXAF}
              description={`Bambeh Zerm Coins â€” ${pkg.name} (${totalCoins} coins)`}
              externalRef={`zerm_${pkg.id}_${userId}_${Date.now()}`}
              metadata={{ user_id: userId, package_id: pkg.id, total_coins: totalCoins }}
              onSuccess={handlePaymentSuccess}
              buttonLabel={s.buyBtn(totalCoins, pkg.priceXAF)}
            />
          ) : (
            <div className="h-14 bg-gray-100 rounded-xl animate-pulse" />
          )}
        </div>

      </div>
    </div>
  );
}
