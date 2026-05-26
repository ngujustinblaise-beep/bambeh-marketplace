/**
 * src/pages/ZermPurchase.tsx — Bambeh Marketplace
 * FIXED:
 * 1. Removed Firebase AuthContext — uses Supabase auth
 * 2. Saves purchases to Supabase zerm_purchases table
 * 3. Updates zerm_coins balance in Supabase on successful purchase
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Zap, Check, Loader2, CheckCircle,
  Shield, Phone, AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// ── Coin packages ──────────────────────────────────────────────────────────────
const PACKAGES = [
  { id:'starter',  name:'Starter',      amount:5,   bonus:0,  priceXAF:500,   popular:false },
  { id:'basic',    name:'Basic',         amount:10,  bonus:1,  priceXAF:1000,  popular:false },
  { id:'popular',  name:'Popular',       amount:25,  bonus:5,  priceXAF:2500,  popular:true  },
  { id:'value',    name:'Value Pack',    amount:50,  bonus:10, priceXAF:5000,  popular:false },
  { id:'premium',  name:'Premium Pack',  amount:100, bonus:25, priceXAF:10000, popular:false },
];

const PAYMENT_METHODS = [
  { id:'mtn',    label:'MTN Mobile Money', emoji:'📱' },
  { id:'orange', label:'Orange Money',     emoji:'🟠' },
];

export default function ZermPurchase() {
  const navigate        = useNavigate();
  const [selected,      setSelected]      = useState<string | null>('popular');
  const [method,        setMethod]        = useState<string | null>(null);
  const [phone,         setPhone]         = useState('');
  const [processing,    setProcessing]    = useState(false);
  const [done,          setDone]          = useState(false);
  const [error,         setError]         = useState<string | null>(null);
  const [userId,        setUserId]        = useState<string | null>(null);
  const [currentBalance,setCurrentBalance]= useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate('/login'); return; }
      setUserId(session.user.id);

      // Load current coin balance
      const { data } = await supabase
        .from('zerm_coins')
        .select('balance')
        .eq('user_id', session.user.id)
        .single();
      if (data) setCurrentBalance(data.balance);
    })();
  }, []);

  const pkg       = PACKAGES.find(p => p.id === selected);
  const totalCoins= pkg ? pkg.amount + pkg.bonus : 0;

  async function handlePurchase() {
    if (!selected || !method || !phone.trim() || !userId || !pkg) return;
    setProcessing(true);
    setError(null);

    try {
      // 1. Save purchase record to Supabase
      const { error: insertErr } = await supabase.from('zerm_purchases').insert({
        user_id:        userId,         // UUID — not text
        package_id:     pkg.id,
        coins_bought:   pkg.amount,
        bonus_coins:    pkg.bonus,
        total_coins:    totalCoins,
        price_xaf:      pkg.priceXAF,
        payment_method: method,
        phone_number:   phone.trim(),
        status:         'pending',
      });

      if (insertErr) throw insertErr;

      // 2. Update coin balance (upsert)
      const newBalance = (currentBalance ?? 0) + totalCoins;
      await supabase.from('zerm_coins').upsert({
        user_id:    userId,
        balance:    newBalance,
        updated_at: new Date().toISOString(),
      });

      // 3. Log transaction
      await supabase.from('zerm_transactions').insert({
        user_id:     userId,
        type:        'credit',
        amount:      totalCoins,
        description: `Purchased ${pkg.name} (${pkg.amount} + ${pkg.bonus} bonus coins)`,
      });

      setDone(true);
    } catch (e: any) {
      setError(e.message || 'Purchase failed. Please try again.');
    } finally {
      setProcessing(false);
    }
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
              <span className="text-3xl font-black text-gray-900">{totalCoins}</span>
              <span className="text-gray-600">Zerm Coins</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">added to your wallet</p>
          </div>
          <button onClick={() => navigate('/coins')}
            className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold mb-2">
            View Wallet
          </button>
          <button onClick={() => navigate('/')}
            className="w-full text-gray-500 text-sm py-2">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
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
        {/* Current balance */}
        {currentBalance !== null && (
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-4 text-white text-center">
            <p className="text-teal-100 text-sm mb-1">Current Balance</p>
            <p className="text-3xl font-bold">{currentBalance.toLocaleString()} <span className="text-lg">Zerm</span></p>
          </div>
        )}

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800">
          <p>💡 <strong>1 Zerm Coin = 100 XAF</strong></p>
          <p className="text-xs text-blue-600 mt-0.5">Use coins to boost listings, send gifts, or pay on the platform.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Package selection */}
        <div className="space-y-3">
          <h2 className="font-bold text-gray-900">Choose a Package</h2>
          {PACKAGES.map(p => (
            <button key={p.id} onClick={() => setSelected(p.id)}
              className={`w-full text-left p-4 rounded-2xl border-2 transition relative ${
                selected === p.id ? 'border-teal-500 bg-teal-50' : 'border-gray-200 bg-white hover:border-teal-300'
              }`}>
              {p.popular && (
                <span className="absolute top-3 right-3 text-xs bg-teal-600 text-white px-2 py-0.5 rounded-full font-semibold">
                  Most Popular
                </span>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">{p.name}</p>
                  <p className="text-sm text-gray-600">
                    {p.amount} coins{p.bonus > 0 ? ` + ${p.bonus} bonus` : ''}
                    {' '}= <span className="font-bold text-teal-600">{p.amount + p.bonus} total</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-black text-gray-900 text-lg">{p.priceXAF.toLocaleString()} XAF</p>
                  {selected === p.id && <Check className="w-5 h-5 text-teal-600 ml-auto" />}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Payment method */}
        <div className="space-y-3">
          <h2 className="font-bold text-gray-900">Payment Method</h2>
          <div className="grid grid-cols-2 gap-3">
            {PAYMENT_METHODS.map(m => (
              <button key={m.id} onClick={() => setMethod(m.id)}
                className={`p-3 rounded-xl border-2 font-semibold text-sm transition ${
                  method === m.id ? 'border-teal-500 bg-teal-50' : 'border-gray-200 bg-white hover:border-teal-300'
                }`}>
                <span className="text-xl block mb-1">{m.emoji}</span>
                {m.label}
              </button>
            ))}
          </div>

          {method && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                <Phone className="inline w-4 h-4 mr-1" />
                {method === 'mtn' ? 'MTN' : 'Orange'} Phone Number
              </label>
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="e.g. 237 670 757 326"
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500"
              />
              <p className="text-xs text-gray-400 mt-1">You will receive a payment prompt on this number</p>
            </div>
          )}
        </div>

        {/* Security note */}
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-white rounded-xl p-3 border">
          <Shield className="w-4 h-4 text-green-500 flex-shrink-0" />
          All payments processed securely through CamPay · BAMBEH SARL
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="max-w-lg mx-auto">
          {pkg && selected && (
            <p className="text-center text-sm text-gray-500 mb-2">
              {totalCoins} Zerm Coins for {pkg.priceXAF.toLocaleString()} XAF
            </p>
          )}
          <button
            onClick={handlePurchase}
            disabled={!selected || !method || !phone.trim() || processing}
            className="w-full bg-teal-600 text-white py-3.5 rounded-2xl font-bold disabled:opacity-50 flex items-center justify-center gap-2">
            {processing
              ? <><Loader2 className="w-4 h-4 animate-spin" />Processing...</>
              : <><Zap className="w-5 h-5" />Buy {totalCoins} Zerm Coins</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
