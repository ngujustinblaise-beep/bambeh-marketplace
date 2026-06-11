/**
 * src/pages/CoinsHistory.tsx — Bambeh Marketplace
 *
 * FIXED (this version):
 *  ✅ Full i18n — EN, FR, Pidgin, Arabic, Fulfulde
 *  ✅ RTL support for Arabic
 *  ✅ Shows all 50 most recent transactions with signed amounts
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';

const strings = {
  en: {
    back:    '← Back to Wallet',
    title:   'Transaction History',
    noTx:    'No transactions yet',
  },
  fr: {
    back:    '← Retour au portefeuille',
    title:   'Historique des transactions',
    noTx:    'Aucune transaction pour le moment',
  },
  pidgin: {
    back:    '← Back to Wallet',
    title:   'Your Transactions',
    noTx:    'No transaction yet',
  },
  ar: {
    back:    'العودة للمحفظة →',
    title:   'سجل المعاملات',
    noTx:    'لا توجد معاملات بعد',
  },
  fulfulde: {
    back:    '← Rutto Jaaborgal',
    title:   'Laamu Liɓɓitol',
    noTx:    'Alaa liɓɓitol fewndo jooni',
  },
} as const;

type Lang = keyof typeof strings;

interface Tx {
  id: string;
  amount: number;
  description: string;
  created_at: string;
  type: 'credit' | 'debit';
}

const CoinsHistory: React.FC = () => {
  const langRaw = useLang() as string;
  const lang: Lang = (langRaw in strings ? langRaw : 'en') as Lang;
  const s       = strings[lang];
  const isRtl   = lang === 'ar';

  const [txs,     setTxs]     = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data } = await supabase
        .from('zerm_transactions')
        .select('id, amount, description, created_at, type')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      setTxs(data ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-6 px-4" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/coins" className="text-teal-600 text-sm hover:underline">
          {s.back}
        </Link>
        <h1 className="text-xl font-bold text-gray-900">{s.title}</h1>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : txs.length === 0 ? (
        <p className="text-center text-gray-400 py-10 text-sm">{s.noTx}</p>
      ) : (
        <div className="space-y-3">
          {txs.map(tx => {
            const isCredit = tx.type === 'credit';
            return (
              <div
                key={tx.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3"
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isCredit ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  {isCredit
                    ? <ArrowDownLeft className="w-4 h-4 text-green-600" />
                    : <ArrowUpRight  className="w-4 h-4 text-red-500"   />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{tx.description}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </p>
                </div>
                <p className={`text-sm font-bold flex-shrink-0 ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                  {isCredit ? '+' : '-'}{Math.abs(tx.amount)} ZC
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CoinsHistory;
