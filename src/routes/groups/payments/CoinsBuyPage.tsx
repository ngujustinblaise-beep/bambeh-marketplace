// BAMBEH_DEPLOY_TOKEN__COINSBUYPAGE_FIX110_CLEAN
/**
 * CoinsBuyPage.tsx — Bambeh Marketplace (FIX110, full i18n)
 * FILE LOCATION: src/routes/groups/payments/CoinsBuyPage.tsx  (the ROUTED copy)
 *
 * FIX110: page was English-only (global t() keys). Now it carries its own
 * EN / FR / Pidgin / Arabic / Fulfulde strings + RTL, like its Coins siblings.
 * Purchase logic UNCHANGED: CamPayWidget → zerm_purchases + zerm_coins upsert
 * + zerm_transactions credit → /coins?purchased=1.
 *
 * © 2026 BAMBEH SARL. All rights reserved.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import CamPayWidget from '@/components/payment/CamPayWidget';
import { calculateWithFee } from '@/utils/paymentFee';
import { useLang } from '@/hooks/useAppLang';

const PACKAGES = [
  { id: 'basic', coins: 10,  price: 1000 },
  { id: 'plus',  coins: 25,  price: 2500 },
  { id: 'pro',   coins: 50,  price: 5000 },
  { id: 'elite', coins: 100, price: 10000 },
];

// -- i18n ----------------------------------------------------------------------
const strings = {
  en: {
    title: 'Buy Zerm Coins', subtotal: 'Subtotal', fee: 'Bambeh Fee (1%)',
    total: 'Total', payNow: 'Pay Now', paymentSuccess: 'Payment Successful!',
    added: (n: number) => `${n} Zerm Coins added to your wallet`,
    viewWallet: 'View Wallet',
  },
  fr: {
    title: 'Acheter des Pièces Zerm', subtotal: 'Sous-total', fee: 'Frais Bambeh (1%)',
    total: 'Total', payNow: 'Payer', paymentSuccess: 'Paiement réussi !',
    added: (n: number) => `${n} pièces Zerm ajoutées à votre portefeuille`,
    viewWallet: 'Voir le portefeuille',
  },
  pidgin: {
    title: 'Buy Zerm Coins', subtotal: 'Subtotal', fee: 'Bambeh Fee (1%)',
    total: 'Total', payNow: 'Pay Now', paymentSuccess: 'Payment don pass!',
    added: (n: number) => `${n} Zerm Coins don enter your wallet`,
    viewWallet: 'Check Wallet',
  },
  ar: {
    title: 'شراء عملات زيرم', subtotal: 'المجموع الفرعي', fee: 'رسوم Bambeh ‏(1%)',
    total: 'الإجمالي', payNow: 'ادفع الآن', paymentSuccess: 'تم الدفع بنجاح!',
    added: (n: number) => `تمت إضافة ${n} عملة زيرم إلى محفظتك`,
    viewWallet: 'عرض المحفظة',
  },
  ff: {
    title: 'Sood Zerm Coinɗe', subtotal: 'Keɓal', fee: 'Njoɓdi Bambeh (1%)',
    total: 'Fof', payNow: 'Yoɓ Jooni', paymentSuccess: 'Njoɓdi timmii!',
    added: (n: number) => `${n} Zerm Coinɗe naati e jaaborgal maa`,
    viewWallet: 'Yiy Jaaborgal',
  },
} as const;

type LangStrings = (typeof strings)['en'];

function useStrings(): { s: LangStrings; isRtl: boolean } {
  const raw = useLang() as string;
  const key = raw === 'fulfulde' ? 'ff' : raw;
  const s = ((strings as Record<string, LangStrings>)[key] ?? strings.en);
  return { s, isRtl: key === 'ar' };
}

export default function CoinsBuyPage() {
  const navigate = useNavigate();
  const { s, isRtl } = useStrings();

  const [selected, setSelected] = useState(PACKAGES[1]);
  const [userId, setUserId] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [done, setDone] = useState(false);

  const pricing = calculateWithFee(selected.price);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/login');
        return;
      }
      setUserId(session.user.id);

      const { data } = await supabase
        .from('zerm_coins')
        .select('balance')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (data) setBalance(data.balance ?? 0);
    })();
  }, [navigate]);

  async function handleSuccess(reference: string) {
    if (!userId) return;

    try {
      const newBalance = balance + selected.coins;

      // 1. record purchase
      await supabase.from('zerm_purchases').insert({
        user_id: userId,
        package_id: selected.id,
        coins_bought: selected.coins,
        price_xaf: selected.price,
        fee_xaf: pricing.fee,
        total_paid_xaf: pricing.total,
        reference,
        status: 'completed',
      });

      // 2. update wallet
      await supabase.from('zerm_coins').upsert(
        {
          user_id: userId,
          balance: newBalance,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

      // 3. log transaction
      await supabase.from('zerm_transactions').insert({
        user_id: userId,
        type: 'credit',
        amount: selected.coins,
        description: `Purchased ${selected.coins} Zerm Coins`,
        reference,
      });

      setDone(true);
    } catch (err) {
      console.error(err);
      setDone(true); // fail safe
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50 p-6" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="bg-white rounded-2xl shadow p-8 text-center max-w-sm w-full">
          <CheckCircle className="w-14 h-14 text-green-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold">{s.paymentSuccess}</h2>
          <p className="text-sm text-gray-500 mt-2">
            {s.added(selected.coins)}
          </p>
          <button
            onClick={() => navigate('/coins?purchased=1')}
            className="mt-6 w-full bg-green-600 text-white py-3 rounded-xl font-semibold"
          >
            {s.viewWallet}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4" dir={isRtl ? 'rtl' : 'ltr'}>

      <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5 text-yellow-500" />
        {s.title}
      </h1>

      <div className="space-y-3 mb-6">
        {PACKAGES.map(p => (
          <button
            key={p.id}
            onClick={() => setSelected(p)}
            className={`w-full p-4 rounded-xl border-2 text-left ${
              selected.id === p.id
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <p className="font-bold">{p.coins} Zerm</p>
            <p className="text-sm text-gray-500">
              {p.price.toLocaleString()} XAF
            </p>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm mb-4 text-sm space-y-2">
        <div className="flex justify-between">
          <span>{s.subtotal}</span>
          <span>{pricing.subtotal.toLocaleString()} XAF</span>
        </div>
        <div className="flex justify-between text-green-600">
          <span>{s.fee}</span>
          <span>{pricing.fee.toLocaleString()} XAF</span>
        </div>
        <div className="flex justify-between font-bold border-t pt-2">
          <span>{s.total}</span>
          <span>{pricing.total.toLocaleString()} XAF</span>
        </div>
      </div>

      {userId && (
        <CamPayWidget
          amount={pricing.total}
          description={`Zerm Coins - ${selected.coins}`}
          externalRef={`coins_${userId}_${Date.now()}`}
          metadata={{ user_id: userId }}
          onSuccess={handleSuccess}
          buttonLabel={s.payNow}
        />
      )}
    </div>
  );
}
// BAMBEH_END_TOKEN__COINSBUYPAGE__COMPLETE
