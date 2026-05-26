import { useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';

export default function ReferralButton() {
  const [copied, setCopied] = useState(false);
  const referralCode = 'BAMB-' + Math.random().toString(36).substring(7).toUpperCase();
  const referralLink = `https://bambeh.cm/register?ref=${referralCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-4 shadow-lg">
      <div className="flex items-center gap-2 mb-2">
        <Share2 className="w-5 h-5" />
        <span className="font-semibold">Refer & Earn</span>
      </div>
      <p className="text-sm mb-3 opacity-90">
        Share Bambeh with friends and both get 10 Zerm Coins!
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={referralLink}
          readOnly
          className="flex-1 px-3 py-2 bg-white bg-opacity-20 rounded text-sm"
        />
        <button
          onClick={copyLink}
          className="px-4 py-2 bg-white text-purple-600 rounded font-medium hover:bg-opacity-90 transition-all"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 inline" /> Copied
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 inline" /> Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
}
}
