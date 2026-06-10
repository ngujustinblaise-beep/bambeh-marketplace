/**
 * src/pages/CoinsPage.tsx — Bambeh Marketplace
 *
 * FIX: When a user buys coins via a payment flow, the `zerm_coins` row
 *      may not yet exist if this is their first purchase and the server-side
 *      handler hasn't run yet. Previously the page showed 0 / blank balance
 *      even after a successful purchase.
 *
 * CHANGES:
 *  - After fetching balance, if no row exists we upsert a 0-balance row so
 *    the page never shows stale "null" state.
 *  - Added a manual "Refresh" button so users can pull their updated balance
 *    after completing a purchase without reloading the whole app.
 *  - Added a banner that appears when the URL has ?purchased=1 (set by the
 *    payment success callback) to tell the user their coins are on the way.
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Zap, ArrowUpRight, ArrowDownLeft, Plus, History, RefreshCw, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  created_at: string;
}

export default function CoinsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const justPurchased = searchParams.get('purchased') === '1';

  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tab, setTab] = useState<'all' | 'credit' | 'debit'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate('/login'); return; }
      const userId = session.user.id;

      // Fetch balance — if no row exists yet, upsert a zero row so the
      // user always sees their wallet (balance will update when payment
      // webhook fires or on next manual refresh).
      const { data: coinData } = await supabase
        .from('zerm_coins')
        .select('balance')
        .eq('user_id', userId)
        .maybeSingle();   // maybeSingle() returns null instead of error when no row

      if (coinData) {
        setBalance(coinData.balance ?? 0);
      } else {
        // Row doesn't exist yet — create it so future upserts work
        const { data: newRow } = await supabase
          .from('zerm_coins')
          .upsert({ user_id: userId, balance: 0 }, { onConflict: 'user_id' })
          .select('balance')
          .single();
        setBalance(newRow?.balance ?? 0);
      }

      // Fetch transaction history
      const { data: txData } = await supabase
        .from('zerm_transactions')
        .select('id, type, amount, description, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(30);
      setTransactions(txData ?? []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filtered = transactions.filter(tx => tab === 'all' || tx.type === tab);
  const earned = transactions.filter(tx => tx.type === 'credit').reduce((s, tx) => s + tx.amount, 0);
  const spent  = transactions.filter(tx => tx.type === 'debit').reduce((s, tx) => s + tx.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* Purchase success banner */}
      {justPurchased && (
        <div className="bg-green-50 border-b border-green-200 px-4 py-3 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-800">Purchase received!</p>
            <p className="text-xs text-green-600">Your coins may take a moment to appear. Tap Refresh if needed.</p>
          </div>
          <button
            onClick={() => void loadData(true)}
            disabled={refreshing}
            className="text-xs font-bold text-green-700 underline"
          >
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-700 px-4 pt-8 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-white font-bold text-xl flex items-center gap-2">
            <Zap className="w-6 h-6" /> Zerm Coins
          </h1>
          <button
            onClick={() => void loadData(true)}
            disabled={refreshing}
            className="text-white/80 hover:text-white p-2 rounded-xl transition-colors"
            aria-label="Refresh balance"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="text-center">
          <p className="text-teal-100 text-sm mb-1">Your Balance</p>
          <div className="text-white text-5xl font-bold mb-1">
            {loading ? '…' : (balance ?? 0).toLocaleString()}
          </div>
          <p className="text-teal-100 text-sm">Zerm Coins</p>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 -mt-10 mb-4">
        <div className="bg-white rounded-2xl shadow-sm border p-4 grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{(balance ?? 0).toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-0.5">Available</p>
          </div>
          <div className="text-center border-x">
            <p className="text-2xl font-bold text-green-600">{earned.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-0.5">Earned</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-500">{spent.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-0.5">Spent</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 mb-4 grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/coins/purchase')}
          className="bg-teal-600 text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Buy Coins
        </button>
        <button
          onClick={() => navigate('/coins/transfer')}
          className="border border-teal-600 text-teal-600 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
        >
          <ArrowUpRight className="w-4 h-4" /> Transfer
        </button>
      </div>

      {/* Tip */}
      <div className="px-4 mb-4">
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-start gap-3">
          <Zap className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-teal-800">Earn more Zerm Coins</p>
            <p className="text-xs text-teal-600 mt-0.5">
              Refer friends, complete your profile, and stay active to earn bonus coins.
            </p>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <History className="w-4 h-4" /> Transaction History
          </h2>
        </div>
        <div className="flex gap-2 mb-3">
          {(['all', 'credit', 'debit'] as const).map(tabKey => (
            <button
              key={tabKey}
              onClick={() => setTab(tabKey)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                tab === tabKey ? 'bg-teal-600 text-white' : 'bg-white border text-gray-600'
              }`}
            >
              {tabKey === 'all' ? 'All' : tabKey === 'credit' ? 'Earned' : 'Spent'}
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
          <div className="text-center py-10 text-gray-400 text-sm">No transactions yet</div>
        ) : (
          <div className="space-y-2">
            {filtered.map(tx => (
              <div key={tx.id} className="bg-white rounded-xl p-4 shadow-sm border flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  tx.type === 'credit' ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  {tx.type === 'credit'
                    ? <ArrowDownLeft className="w-5 h-5 text-green-600" />
                    : <ArrowUpRight className="w-5 h-5 text-red-500" />
                  }
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{tx.description}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </p>
                </div>
                <p className={`font-bold text-sm ${
                  tx.type === 'credit' ? 'text-green-600' : 'text-red-500'
                }`}>
                  {tx.type === 'credit' ? '+' : '-'}{tx.amount}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
