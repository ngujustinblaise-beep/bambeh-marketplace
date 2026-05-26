/**
 * BUYING & SELLING PAGE
 */

import { Link } from "react-router-dom";
import { ShoppingCart, PlusCircle, DollarSign, CreditCard } from "lucide-react";

export default function BuyingSelling() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold">Buying & Selling</h1>
              <p className="text-blue-100">Master the marketplace</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Link
            to="/help/how-to-post-ad"
      className="block bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <PlusCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  How to Post an Ad
                </h2>
                <p className="text-gray-600">
                  Create listings that get results
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/help/setting-right-price"
      className="block bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Setting the Right Price
                </h2>
                <p className="text-gray-600">Price your items competitively</p>
              </div>
            </div>
          </Link>

          <Link
            to="/help/payment-methods"
      className="block bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Payment Methods
                </h2>
                <p className="text-gray-600">Understand your payment options</p>
              </div>
            </div>
          </Link>
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
