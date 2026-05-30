/**
 * PAYMENT METHODS PAGE
 */

import { Link } from "react-router-dom";
import { CreditCard, Coins, Smartphone, DollarSign } from "lucide-react";

export default function PaymentMethods() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3">
            <CreditCard className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold">Payment Methods</h1>
              <p className="text-purple-100">
                Safe and convenient payment options
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Coins className="w-6 h-6 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Zerm Coins</h2>
            </div>
            <p className="text-gray-600 mb-3">
              Use your earned Zerm Coins for premium features and boosts
            </p>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>? Instant transactions</li>
              <li>? No fees</li>
              <li>? Secure within platform</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Mobile Money</h2>
            </div>
            <p className="text-gray-600 mb-3">
              MTN Mobile Money and Orange Money
            </p>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>? Widely accepted</li>
              <li>? Fast processing</li>
              <li>? Convenient</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Cash</h2>
            </div>
            <p className="text-gray-600 mb-3">Pay in person when you meet</p>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>? No transaction fees</li>
              <li>? Instant payment</li>
              <li>? Simple and direct</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-3">??? Safety Reminder</h3>
          <p className="text-gray-700">
            Never share your payment details before meeting in person. Always
            verify items before paying.
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/help"
      className="text-teal-600 hover:text-teal-700 font-semibold"
          >
            ? Back to Help Center
          </Link>
        </div>
      </div>
    </div>
  );
}
