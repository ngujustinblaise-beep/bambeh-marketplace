// BAMBEH_DEPLOY_TOKEN__COINSPAGE_FIX110_CLEAN
/**
 * CoinsPage.tsx — Bambeh Marketplace (FIX110, mojibake purge + full i18n)
 * FILE LOCATION: src/routes/groups/payments/CoinsPage.tsx  (the ROUTED copy)
 *
 * FIX110: every corrupted string ("Pi?ces", "Gagn?", "????") rewritten cleanly
 * in EN / FR / Pidgin / Arabic / Fulfulde. Logic unchanged from the working
 * version: zerm_coins maybeSingle + first-visit upsert, zerm_transactions
 * history, ?purchased=1 auto-refresh, RTL for Arabic.
 *
 * © 2026 BAMBEH SARL. All rights reserved.
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Zap, ArrowUpRight, ArrowDownLeft,
  Plus, History, RefreshCw, CheckCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';

// -- i18n ----------------------------------------------------------------------
const strings = {
  en: {
    title: 'Zerm Coins', balance: 'Your Balance', available: 'Available',
    earned: 'Earned', spent: 'Spent', buyCoins: 'Buy Coins', transfer: 'Transfer',
    tipTitle: 'Earn more Zerm Coins',
    tipBody: 'Refer friends, complete your profile, and stay active to earn bonus coins.',
    historyTitle: 'Transaction History', all: 'All', earnedTab: 'Earned', spentTab: 'Spent',
    noTx: 'No transactions yet', purchased: 'Purchase received!',
    purchasedSub: 'Your coins may take a moment to appear. Tap Refresh if needed.',
    refresh: 'Refresh', refreshing: 'Refreshing…',
  },
  fr: {
    title: 'Pièces Zerm', balance: 'Votre Solde', available: 'Disponible',
    earned: 'Gagné', spent: 'Dépensé', buyCoins: 'Acheter', transfer: 'Transférer',
    tipTitle: 'Gagnez plus de pièces Zerm',
    tipBody: 'Parrainez des amis, complétez votre profil et restez actif pour gagner des bonus.',
    historyTitle: 'Historique des transactions', all: 'Tout', earnedTab: 'Gagné', spentTab: 'Dépensé',
    noTx: 'Aucune transaction', purchased: 'Achat reçu !',
    purchasedSub: 'Vos pièces peuvent prendre un moment. Appuyez sur Actualiser si nécessaire.',
    refresh: 'Actualiser', refreshing: 'Actualisation…',
  },
  pidgin: {
    title: 'Zerm Coins', balance: 'Your Money', available: 'Wey Dey',
    earned: 'You Get', spent: 'You Spend', buyCoins: 'Buy Coins', transfer: 'Send',
    tipTitle: 'Get more Zerm Coins',
    tipBody: 'Bring your padis, complete your profile, stay active — na so bonus dey come.',
    historyTitle: 'Transaction History', all: 'All', earnedTab: 'You Get', spentTab: 'You Spend',
    noTx: 'No transaction yet', purchased: 'Purchase done!',
    purchasedSub: 'Your coins fit take small time appear. Press Refresh if e no show.',
    refresh: 'Refresh', refreshing: 'Refreshing…',
  },
  ar: {
    title: 'عملات زيرم', balance: 'رصيدك', available: 'متاح',
    earned: 'مكتسب', spent: 'منفق', buyCoins: 'شراء', transfer: 'تحويل',
    tipTitle: 'اكسب المزيد من عملات زيرم',
    tipBody: 'ادعُ أصدقاءك، أكمل ملفك الشخصي، وابقَ نشطًا لتكسب عملات إضافية.',
    historyTitle: 'سجل المعاملات', all: 'الكل', earnedTab: 'مكتسب', spentTab: 'منفق',
    noTx: 'لا توجد معاملات بعد', purchased: 'تم استلام الشراء!',
    purchasedSub: 'قد تستغرق عملاتك لحظات لتظهر. اضغط تحديث إذا لزم الأمر.',
    refresh: 'تحديث', refreshing: 'جارٍ التحديث…',
  },
  ff: {
    title: 'Zerm Coinɗe', balance: 'Soodaande maa', available: 'Woni',
    earned: 'Heɓiino', spent: 'Faalanaa', buyCoins: 'Sood', transfer: 'Neldu',
    tipTitle: 'Heɓ coinɗe Zerm keewɗe',
    tipBody: 'Naatnu yimɓe, timmin profil maa, wonu aktif — nii heɓataa bonus.',
    historyTitle: 'Laamu Liɓɓitol', all: 'Fof', earnedTab: 'Heɓiino', spentTab: 'Faalanaa',
    noTx: 'Alaa liɓɓitol', purchased: 'Soodaande heɓaama!',
    purchasedSub: 'Coinɗe maa mbaawa ɓooyde seeɗa. Taƴ Refresh so ɗe njiyaaki.',
    refresh: 'Refresh', refreshing: 'Dawnugol…',
  },
} as const;

type LangStrings = (typeof strings)['en'];

function useStrings(): { s: LangStrings; isRtl: boolean } {
  const raw = useLang() as string;
  const key = raw === 'fulfulde' ? 'ff' : raw;
  const s = ((strings as Record<string, LangStrings>)[key] ?? strings.en);
  return { s, isRtl: key === 'ar' };
}

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  created_at: string;
}

export default function CoinsPage() {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const justPurchased  = searchParams.get('purchased') === '1';
  const { s, isRtl }   = useStrings();

  const [balance,      setBalance]      = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tab,          setTab]          = useState<'all' | 'credit' | 'debit'>('all');
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate('/login'); return; }
      const userId = session.user.id;

      // Balance — maybeSingle() never throws on missing row
      const { data: coinData } = await supabase
        .from('zerm_coins')
        .select('balance')
        .eq('user_id', userId)
        .maybeSingle();

      if (coinData) {
        setBalance(coinData.balance ?? 0);
      } else {
        // First-time user — create wallet row
        const { data: newRow } = await supabase
          .from('zerm_coins')
          .upsert({ user_id: userId, balance: 0 }, { onConflict: 'user_id' })
          .select('balance')
          .single();
        setBalance(newRow?.balance ?? 0);
      }

      const { data: txData } = await supabase
        .from('zerm_transactions')
        .select('id, type, amount, description, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);
      setTransactions(txData ?? []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate]);

  useEffect(() => { void loadData(); }, [loadData]);

  // Auto-refresh once after purchase redirect
  useEffect(() => {
    if (justPurchased) {
      const timer = setTimeout(() => void loadData(true), 2500);
      return () => clearTimeout(timer);
    }
  }, [justPurchased, loadData]);

  const filtered = transactions.filter(tx => tab === 'all' || tx.type === tab);
  const earned   = transactions.filter(tx => tx.type === 'credit').reduce((sum, tx) => sum + tx.amount, 0);
  const spent    = transactions.filter(tx => tx.type === 'debit').reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-24" dir={isRtl ? 'rtl' : 'ltr'}>

      {justPurchased && (
        <div className="bg-green-50 border-b border-green-200 px-4 py-3 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-800">{s.purchased}</p>
            <p className="text-xs text-green-600">{s.purchasedSub}</p>
          </div>
          <button
            onClick={() => void loadData(true)}
            disabled={refreshing}
            className="text-xs font-bold text-green-700 underline"
          >
            {refreshing ? s.refreshing : s.refresh}
          </button>
        </div>
      )}

      {/* Header hero */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-700 px-4 pt-10 pb-24">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-white font-bold text-xl flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-300" /> {s.title}
          </h1>
          <button
            onClick={() => void loadData(true)}
            disabled={refreshing}
            className="text-white/80 hover:text-white p-2 rounded-xl transition-colors"
            aria-label={s.refresh}
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="text-center">
          <p className="text-teal-100 text-sm mb-1">{s.balance}</p>
          <div className="text-white text-6xl font-black mb-1">
            {loading ? '…' : (balance ?? 0).toLocaleString()}
          </div>
          <p className="text-teal-100 text-sm flex items-center justify-center gap-1">
            <Zap className="w-4 h-4 text-yellow-300" /> Zerm Coins
          </p>
        </div>
      </div>

      {/* Stats card */}
      <div className="px-4 -mt-14 mb-4 relative z-10">
        <div className="bg-white rounded-2xl shadow-md border p-4 grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{(balance ?? 0).toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.available}</p>
          </div>
          <div className="text-center border-x border-gray-100">
            <p className="text-2xl font-bold text-green-600">{earned.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.earned}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-500">{spent.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.spent}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 mb-4 grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/coins/buy')}
          className="bg-teal-600 text-white py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-sm"
        >
          <Plus className="w-4 h-4" /> {s.buyCoins}
        </button>
        <button
          onClick={() => navigate('/coins/transfer')}
          className="border-2 border-teal-600 text-teal-600 py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <ArrowUpRight className="w-4 h-4" /> {s.transfer}
        </button>
      </div>

      {/* Earn tip */}
      <div className="px-4 mb-4">
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-start gap-3">
          <Zap className="w-5 h-5 flex-shrink-0 mt-0.5 text-yellow-500" />
          <div>
            <p className="text-sm font-semibold text-teal-800">{s.tipTitle}</p>
            <p className="text-xs text-teal-600 mt-0.5">{s.tipBody}</p>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <History className="w-4 h-4" /> {s.historyTitle}
          </h2>
        </div>

        <div className="flex gap-2 mb-3">
          {(['all', 'credit', 'debit'] as const).map(tabKey => (
            <button
              key={tabKey}
              onClick={() => setTab(tabKey)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                tab === tabKey
                  ? 'bg-teal-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600'
              }`}
            >
              {tabKey === 'all' ? s.all : tabKey === 'credit' ? s.earnedTab : s.spentTab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">{s.noTx}</div>
        ) : (
          <div className="space-y-2">
            {filtered.map(tx => (
              <div
                key={tx.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  tx.type === 'credit' ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  {tx.type === 'credit'
                    ? <ArrowDownLeft className="w-5 h-5 text-green-600" />
                    : <ArrowUpRight  className="w-5 h-5 text-red-500"   />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{tx.description}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </p>
                </div>
                <p className={`font-bold text-sm flex-shrink-0 ${
                  tx.type === 'credit' ? 'text-green-600' : 'text-red-500'
                }`}>
                  {tx.type === 'credit' ? '+' : '-'}{Math.abs(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__COINSPAGE__COMPLETE
