import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Tx {
  id: string;
  amount: number;
  description: string;
  date: string;
}

const CoinsHistory: React.FC = () => {
  const [txs, setTxs] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setTxs([
        {
          id: "1",
          amount: 50,
          description: "First purchase bonus",
          date: "2026-02-28",
        },
        {
          id: "2",
          amount: -30,
          description: "Boost listing",
          date: "2026-02-27",
        }, ]);
      setLoading(false);
    }, 600);
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/coins" className="text-teal-600 text-sm hover:underline">
          Back to Wallet
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Transaction History</h1>
      </div>
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 bg-gray-100 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {txs.map((tx) => (
            <div
              key={tx.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  {tx.description}
                </p>
                <p className="text-xs text-gray-400">{tx.date}</p>
              </div>
              <p
                className={
                  tx.amount > 0
                    ? "text-sm font-bold text-green-600"
                    : "text-sm font-bold text-red-600"
                }
              >
                {tx.amount > 0 ? "+" : ""}
                {tx.amount} ZC
              </p>
            </div>
          ))}
        </div>
      )}
      <div className="mt-6 text-center">
        <Link
          to="/coins/transfer"
      className="text-sm text-teal-600 font-medium hover:underline"
        >
          Transfer Zerm Coins
        </Link>
      </div>
    </div>
  );

}
export default CoinsHistory;
