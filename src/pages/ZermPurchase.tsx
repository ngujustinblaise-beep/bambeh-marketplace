/**
 * ZermPurchase.tsx  —  Bambeh Marketplace
 * FILE LOCATION: src/pages/ZermPurchase.tsx
 *
 * FIXED (this version):
 *  ✅ NOW actually calls CamPay via Supabase Edge Function
 *  ✅ Zerm coins only credited AFTER CamPay confirms SUCCESSFUL payment
 *  ✅ Uses unified CamPayWidget — no duplicate payment logic
 *  ✅ Records purchase in zerm_purchases + updates zerm_coins balance
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Check, CheckCircle, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import CamPayWidget from '@/components/payment/CamPayWidget';
import { useLang, t } from "@/hooks/useAppLang";

// ── Coin packages ─────────────────────────────────────────────────────────────
const PACKAGES = [
  { id: 'starter',  name: 'Starter',      amount: 5,   bonus: 0,  priceXAF: 500,   popular: false },
  { id: 'basic',    name: 'Basic',         amount: 10,  bonus: 1,  priceXAF: 1000,  popular: false },
  { id: 'popular',  name: 'Popular',       amount: 25,  bonus: 5,  priceXAF: 2500,  popular: true  },
  { id: 'value',    name: 'Value Pack',    amount: 50,  bonus: 10, priceXAF: 5000,  popular: false },
  { id: 'premium',  name: 'Premium Pack',  amount: 100, bonus: 25, priceXAF: 10000, popular: false },
];

export default function ZermPurchase() {
  const lang = useLang();
  const isRtl = lang === "ar";
  const navigate = useNavigate();
  const [selected,        setSelected]       = useState<string>('popular');
  const [userId,          setUserId]         = useState<string | null>(null);
  const [currentBalance,  setCurrentBalance] = useState<number | null>(null);
  const [done,            setDone]           = useState(false);
  const [coinsAdded,      setCoinsAdded]     = useState(0);

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
        .single();
      if (data) setCurrentBalance(data.balance);
    })();
  }, []);

  // ── Called by CamPayWidget after CamPay confirms SUCCESSFUL ─────────────
  async function handlePaymentSuccess(reference: string) {
    if (!userId || !pkg) return;

    const total = pkg.amount + pkg.bonus;

    // 1. Record purchase
    await supabase.from('zerm_purchases').insert({
      user_id:        userId,
      package_id:     pkg.id,
      coins_bought:   pkg.amount,
      bonus_coins:    pkg.bonus,
      total_coins:    total,
      price_xaf:      pkg.priceXAF,
      reference,
      status:         'completed',
    });

    // 2. Update balance
    const newBalance = (currentBalance ?? 0) + total;
    await supabase.from('zerm_coins').upsert({
      user_id:    userId,
      balance:    newBalance,
      updated_at: new Date().toISOString(),
    });

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
  }

  // ── Success screen ─────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-green-50 p-6">
        <div className="bg-white rounded-2xl shadow p-8 text-center max-w-sm w-full">
          <CheckCircle className="w-14 h-14 text-teal-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Purchase Successful! ⚡</h2>
          <div className="bg-yellow-50 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-center gap-2">
              <Zap className="w-6 h-6 text-yellow-600" />
              <span className="text-3xl font-black text-gray-900">{coinsAdded}</span>
              <span className="text-gray-600">Zerm Coins</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">added to your wallet</p>
          </div>
          <button
            onClick={() => navigate('/coins')}
            className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold mb-2"
          >
            View Wallet
          </button>
          <button onClick={() => navigate('/')} className="w-full text-gray-500 text-sm py-2">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-gray-900 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" /> Buy Zerm Coins
        </h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-5">
        {/* Balance */}
        {currentBalance !== null && (
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-4 text-white text-center">
            <p className="text-teal-100 text-sm mb-1">Current Balance</p>
            <p className="text-3xl font-bold">{currentBalance.toLocaleString()} <span className="text-lg">Zerm</span></p>
          </div>
        )}

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800">
          <p>💡 <strong>1 Zerm Coin = 100 XAF</strong></p>
          <p className="text-xs text-blue-600 mt-0.5">
            Use coins to boost listings, send gifts, or pay on the platform.
          </p>
        </div>

        {/* Package selection */}
        <div className="space-y-3">
          <h2 className="font-bold text-gray-900">Choose a Package</h2>
          {PACKAGES.map(p => (
            <button
              key={p.id}
              onClick={() => setSelected(p.id)}
              className={`w-full text-left p-4 rounded-2xl border-2 transition relative ${
                selected === p.id
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-gray-200 bg-white hover:border-teal-300'
              }`}
            >
              {p.popular && (
                <span className="absolute top-3 right-3 text-xs bg-teal-600 text-white px-2 py-0.5 rounded-full font-semibold">
                  Most Popular
                </span>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">{p.name}</p>
                  <p className="text-sm text-gray-600">
                    {p.amount} coins{p.bonus > 0 ? ` + ${p.bonus} bonus` : ''} ={' '}
                    <span className="font-bold text-teal-600">{p.amount + p.bonus} total</span>
                  </p>
                </div>
                <div className="text-right flex items-center gap-2">
                  <p className="font-black text-gray-900 text-lg">{p.priceXAF.toLocaleString()} XAF</p>
                  {selected === p.id && <Check className="w-5 h-5 text-teal-600" />}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Payment */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <h2 className="font-bold text-gray-900 mb-4">Pay with Mobile Money</h2>
          <CamPayWidget
            amount={pkg.priceXAF}
            description={`Bambeh Zerm Coins — ${pkg.name} (${totalCoins} coins)`}
            externalRef={`zerm_${pkg.id}_${userId}_${Date.now()}`}
            metadata={{ user_id: userId, package_id: pkg.id, total_coins: totalCoins }}
            onSuccess={handlePaymentSuccess}
            buttonLabel={`Buy ${totalCoins} Zerm Coins — ${pkg.priceXAF.toLocaleString()} XAF`}
          />
        </div>
      </div>
    </div>
  );
}
