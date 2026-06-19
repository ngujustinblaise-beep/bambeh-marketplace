/**
 * REFERRAL BUTTON COMPONENT
 * FILE LOCATION: src/components/common/ReferralButton.tsx
 */

import { useState } from 'react';
import { Share2, Copy, Check, Gift, Users } from 'lucide-react';

export default function ReferralButton() {
  const [copied, setCopied]         = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const referralCode    = 'BAMBE-' + Math.random().toString(36).substring(7).toUpperCase();
  const referralLink    = `https://bambeh.cm/register?ref=${referralCode}`;
  const referralMessage = `ðŸŽ‰ Join me on Bambeh - Online Marketplace!\n\nðŸ’š Only 1% Transaction Fee - Lowest in !\nðŸ›ï¸ Buy, Sell, Trade, Find Jobs & More\nðŸŽ Use my referral code: ${referralCode}\n\nðŸ“± Sign up here: ${referralLink}\n\nWe both get 1 Zerm Coin when you register! ðŸª™`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const copyMessage = () => {
    navigator.clipboard.writeText(referralMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const shareToWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(referralMessage)}`, '_blank');
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`, '_blank');
  };

  const shareToTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Join me on Bambeh! ${referralLink}`)}`, '_blank');
  };

  return (
    <>
      <button onClick={() => setShowDetails(!showDetails)}
        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg p-4 shadow-lg hover:shadow-xl transition-all w-full">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
            <Gift className="w-6 h-6" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-lg">Refer & Earn</p>
            <p className="text-sm opacity-90">Get 1 Zerm Coin per friend!</p>
          </div>
          <Share2 className="w-5 h-5" />
        </div>
      </button>

      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowDetails(false)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <span className="text-2xl">Ã—</span>
            </button>

            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Refer Friends</h2>
              <p className="text-gray-600">Share Bambeh and both get rewarded!</p>
            </div>

            {/* Rewards */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-6 border border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2"><span className="text-2xl">ðŸª™</span><span className="font-bold text-purple-900">You Get</span></div>
                <span className="text-2xl font-bold text-purple-600">1 Zerm Coin</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><span className="text-2xl">ðŸŽ</span><span className="font-bold text-pink-900">Friend Gets</span></div>
                <span className="text-2xl font-bold text-pink-600">1 Zerm Coin</span>
              </div>
            </div>

            {/* Referral Code */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Your Referral Code</label>
              <div className="flex gap-2">
                <input type="text" value={referralCode} readOnly
                  className="flex-1 px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-center font-mono font-bold text-lg text-purple-600" />
                <button onClick={() => { navigator.clipboard.writeText(referralCode); setCopied(true); setTimeout(() => setCopied(false), 3000); }}
                  className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Referral Link */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Your Referral Link</label>
              <div className="flex gap-2">
                <input type="text" value={referralLink} readOnly className="flex-1 px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-sm" />
                <button onClick={copyLink} className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              {copied && <p className="text-sm text-green-600 mt-2 flex items-center gap-1"><Check className="w-4 h-4" />Copied! Paste it anywhere to share</p>}
            </div>

            {/* Share Buttons */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Quick Share</label>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={shareToWhatsApp} className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors">
                  <span className="text-xl">ðŸ’¬</span><span className="font-semibold">WhatsApp</span>
                </button>
                <button onClick={shareToFacebook} className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors">
                  <span className="text-xl">ðŸ“˜</span><span className="font-semibold">Facebook</span>
                </button>
                <button onClick={shareToTwitter} className="p-3 bg-black hover:bg-gray-900 text-white rounded-lg flex items-center justify-center gap-2 transition-colors">
                  <span className="text-xl">ðŸ¦</span><span className="font-semibold">Twitter</span>
                </button>
                <button onClick={copyMessage} className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors">
                  <Copy className="w-5 h-5" /><span className="font-semibold">Copy Text</span>
                </button>
              </div>
            </div>

            {/* Message Preview */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Message Preview</label>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <pre className="text-xs whitespace-pre-wrap text-gray-700 font-sans">{referralMessage}</pre>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
                <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">0</p>
                <p className="text-xs text-blue-700">Friends Referred</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
                <span className="text-3xl">ðŸª™</span>
                <p className="text-2xl font-bold text-green-600">0</p>
                <p className="text-xs text-green-700">Zerm Coins Earned</p>
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-3">How It Works:</h3>
              <ol className="space-y-2 text-sm text-gray-700">
                <li className="flex gap-2"><span className="font-bold text-purple-600">1.</span><span>Share your referral code or link with friends</span></li>
                <li className="flex gap-2"><span className="font-bold text-purple-600">2.</span><span>They sign up using your code</span></li>
                <li className="flex gap-2"><span className="font-bold text-purple-600">3.</span><span>Both of you receive 1 Zerm Coin instantly!</span></li>
                <li className="flex gap-2"><span className="font-bold text-purple-600">4.</span><span>Use Zerm Coins for premium features & discounts</span></li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

