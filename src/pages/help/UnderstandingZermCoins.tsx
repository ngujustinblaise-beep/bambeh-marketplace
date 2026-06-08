/**
 * UNDERSTANDING ZERM COINS - HELP PAGE
 */

import { Link } from 'react-router-dom';
import { Coins, Gift, Star, Award } from 'lucide-react';
import { useLang, t } from "@/hooks/useAppLang";

export default function UnderstandingZermCoins() {
  const lang = useLang();
  const isRtl = lang === "ar";
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3">
            <Coins className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold">Understanding Zerm Coins</h1>
              <p className="text-yellow-100">Your digital currency on Bambeh</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What are Zerm Coins?</h2>
            <p className="text-gray-700 mb-4">
              Zerm Coins are Bambeh's digital currency that you can earn and use for premium features,
              boosting listings, and special services on the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Gift className="w-6 h-6 text-yellow-500" />
              How to Earn Zerm Coins
            </h2>
            <div className="space-y-4">
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                <h3 className="font-bold text-gray-900 mb-2">?? Sign Up Bonus</h3>
                <p className="text-gray-700 mb-1">Earn <span className="font-bold text-yellow-600">0.0000001 Zerm Coin</span> just for creating your account!</p>
                <p className="text-xs text-gray-500">Every bit counts as you build your balance</p>
              </div>
              
              <div className="bg-green-50 border-l-4 border-green-500 p-4">
                <h3 className="font-bold text-gray-900 mb-2">?? Daily Login</h3>
                <p className="text-gray-700 mb-1">Earn <span className="font-bold text-green-600">0.0000001 Zerm Coin</span> every day you log in</p>
                <p className="text-xs text-gray-500">Consistency pays off! Log in daily to accumulate rewards</p>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <h3 className="font-bold text-gray-900 mb-2">?? Refer Friends - BIGGEST REWARD! ??</h3>
                <p className="text-gray-700 mb-1">Get <span className="font-bold text-blue-600 text-lg">1 FULL Zerm Coin</span> for each friend who joins using your referral link!</p>
                <p className="text-xs text-gray-500">This is our most valuable reward! Share Bambeh with friends and family</p>
              </div>

              <div className="bg-purple-50 border-l-4 border-purple-500 p-4">
                <h3 className="font-bold text-gray-900 mb-2">? Complete Your Profile</h3>
                <p className="text-gray-700 mb-1">Earn <span className="font-bold text-purple-600">0.0000001 Zerm Coin</span> by adding a profile photo and bio</p>
                <p className="text-xs text-gray-500">Help others trust you with a complete profile</p>
              </div>

              <div className="bg-pink-50 border-l-4 border-pink-500 p-4">
                <h3 className="font-bold text-gray-900 mb-2">?? Post Listings</h3>
                <p className="text-gray-700 mb-1">Get <span className="font-bold text-pink-600">0.0000001 Zerm Coin</span> for each approved listing</p>
                <p className="text-xs text-gray-500">Keep posting quality listings to earn more</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500" />
              How to Use Zerm Coins
            </h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-yellow-500">�</span>
                <span>Boost your listings to appear at the top (5 coins per boost)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500">�</span>
                <span>Get featured on the homepage (10 coins)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500">�</span>
                <span>Unlock premium filters (3 coins per month)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500">�</span>
                <span>Send highlighted messages (1 coin per message)</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Coin Balance</h2>
            <p className="text-gray-700 mb-4">
              You can always check your Zerm Coin balance in your profile. Your coins never expire!
            </p>
            <Link
              to="/profile"
      className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-semibold"
            >
              <Coins className="w-5 h-5" />
              View My Balance
            </Link>
          </section>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              Pro Tip - Maximize Your Earnings! ??
            </h3>
            <p className="text-gray-700 mb-3">
              <strong className="text-blue-600">Referrals are your BEST opportunity!</strong> While daily activities earn micro-rewards (0.0000001 coins), 
              referring just ONE friend gives you <strong className="text-lg">1 FULL Zerm Coin</strong> - that's <strong>10,000,000x more valuable!</strong>
            </p>
            <p className="text-gray-700">
              ?? <strong>Strategy:</strong> Share your referral link with 10 friends = 10 Zerm Coins = Enough to boost multiple listings 
              or get featured on the homepage many times!
            </p>
          </div>
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
