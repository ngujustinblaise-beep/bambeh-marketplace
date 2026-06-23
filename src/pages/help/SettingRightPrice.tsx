/**
 * SETTING RIGHT PRICE PAGE
 */

import { Link } from "react-router-dom";
import { DollarSign, TrendingUp, Award } from "lucide-react";
import { useLang, t } from "@/hooks/useAppLang";

export default function SettingRightPrice() {
  const lang = useLang();
  const isRtl = lang === "ar";
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3">
            <DollarSign className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold">Setting the Right Price</h1>
              <p className="text-green-100">Price to sell fast</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Research the Market
            </h2>
            <p className="text-gray-600 mb-4">
              Search for similar items on Bambeh to see what others are charging
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Consider Condition
            </h2>
            <ul className="space-y-2 text-gray-600">
              <li>
                • <strong>New:</strong> Full retail price or slightly below
              </li>
              <li>
                • <strong>Like New:</strong> 70-90% of retail
              </li>
              <li>
                • <strong>Good:</strong> 50-70% of retail
              </li>
              <li>
                • <strong>Fair:</strong> 30-50% of retail
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Pricing Formula
            </h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-lg font-semibold text-gray-900 mb-2">
                Price = (Market Value × Condition %) - Urgency Discount
              </p>
              <p className="text-sm text-gray-600">
                Add 10-15% if item is rare or in high demand
              </p>
            </div>
          </section>

          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Pro Tip
            </h3>
            <p className="text-gray-700">
              Price slightly higher than your minimum to leave room for
              negotiation!
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/help"
      className="text-teal-600 hover:text-teal-700 font-semibold"
          >
            ← Back to Help Center
          </Link>
        </div>
      </div>
    </div>
  );
}






