import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface Tx {
  id: string;
  amount: number;
  description: string;
  created_at: string;
  type: 'credit' | 'debit';
}

const CoinsHistory: React.FC = () => {
  const [txs, setTxs] = useState<Tx[]>([]);
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
    <div className="max-w-2xl mx-auto py-6 px-4">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/coins" className="text-teal-600 text-sm hover:underline">
          ← Back to Wallet
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Transaction History</h1>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : txs.length === 0 ? (
        <p className="text-center text-gray-400 py-10 text-sm">No transactions yet</p>
      ) : (
        <div className="space-y-3">
          {txs.map(tx => {
            const isCredit = tx.type === 'credit';
            return (
              <div key={tx.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{tx.description}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </p>
                </div>
                <p className={`text-sm font-bold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
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