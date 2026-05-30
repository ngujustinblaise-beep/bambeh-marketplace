/**
 * ═══════════════════════════════════════════════════════════════════════════
 * REFERRAL SECTION COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Complete referral management for vendors:
 * ✅ Unique referral code display
 * ✅ Share functionality (copy, WhatsApp, social)
 * ✅ Referral progress tracking (2 referrals = 10 ZC)
 * ✅ Referral history
 * ✅ Reward tracking
 *
 * FILE LOCATION: src/components/vendor/ReferralSection.tsx
 *
 * © 2025 Bambeh. All rights reserved.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from "react";
import {
  Users,
  Copy,
  Check,
  Share2,
  MessageCircle,
  Send,
  Gift,
  ChevronRight,
  Star,
  UserPlus,
  Clock,
  CheckCircle,
  Award,
  Coins,
  Target,
  TrendingUp,
  ExternalLink
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface Referral {
  referrerId?: string;
  id: string;
  referralCode: string;
  referredVendorId?: string;
  referredVendorName?: string;
  status: "pending" | "registered" | "qualified" | "rewarded";
  registeredAt?: string;
  qualifiedAt?: string;
  rewardedAt?: string;
  createdAt: string;
}

interface ReferralProgress {
  current: number;
  required: number;
  reward: number;
  qualifiedReferrals: string[];
}

interface ReferralSectionProps {
  vendorId: string;
  vendorName?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════

export default function ReferralSection({
  vendorId,
  vendorName = "Vendor",
}: ReferralSectionProps) {
  const [referralCode, setReferralCode] = useState<string>("");
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [progress, setProgress] = useState<ReferralProgress>({
    current: 0,
    required: 2,
    reward: 10,
    qualifiedReferrals: [],
  });
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [totalEarned, setTotalEarned] = useState(0);

  // Generate referral link
  const referralLink = `https://bambeh.com/vendor/register?ref=${referralCode}`;

  // Load referral data
  useEffect(() => {
    loadReferralData();

    const handleUpdate = () => loadReferralData();
    window.addEventListener("referralsUpdated", handleUpdate);

    return () => window.removeEventListener("referralsUpdated", handleUpdate);
  }, [vendorId]);

  const loadReferralData = () => {
    try {
      // Get or generate referral code
      let code = localStorage.getItem(`Bambeh_referral_code_${vendorId}`);
      if (!code) {
        code = `BAMBEH-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        localStorage.setItem(`Bambeh_referral_code_${vendorId}`, code);
      }
      setReferralCode(code);

      // Load referrals
      const storedReferrals = localStorage.getItem("Bambeh_vendor_referrals");
      const allReferrals: Referral[] = storedReferrals
        ? JSON.parse(storedReferrals)
        : [];
      const vendorReferrals = allReferrals.filter(
        (r) => r.referrerId === vendorId,
      );
      setReferrals(vendorReferrals);

      // Load progress
      const storedProgress = localStorage.getItem(
        `Bambeh_referral_progress_${vendorId}`,
      );
      if (storedProgress) {
        setProgress(JSON.parse(storedProgress));
      } else {
        const qualified = vendorReferrals.filter(
          (r) => r.status === "qualified" || r.status === "rewarded",
        );
        setProgress({ current: qualified.length % 2,
          required: 2,
          reward: 10,
          qualifiedReferrals: qualified.map((r) => r.id),
        });
      }

      // Calculate total earned from referrals
      const rewardedBatches = Math.floor(
        vendorReferrals.filter((r) => r.status === "rewarded").length / 2,
      );
      setTotalEarned(rewardedBatches * 10);
    } catch (error) {
      console.error("Error loading referral data:", error);
    }
  };

  const copyToClipboard = async (text: string, type: "code" | "link") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "code") {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      } else {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const shareViaWhatsApp = () => {
    const message = encodeURIComponent(
      `🎉 Join me on Bambeh Marketplace!\n\n` +
        `I'm earning money selling on 's best marketplace. Use my referral code to get started:\n\n` +
        `📱 Code: ${referralCode}\n` +
        `🔗 Link: ${referralLink}\n\n` +
        `Start selling today! 🚀`,
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
    setShowShareOptions(false);
  };

  const shareViaTelegram = () => {
    const message = encodeURIComponent(
      `Join me on Bambeh Marketplace! Use my code ${referralCode} to register: ${referralLink}`,
    );
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${message}`,
      "_blank",
    );
    setShowShareOptions(false);
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(
      "Join Bambeh Marketplace with my referral!",
    );
    const body = encodeURIComponent(
      `Hi!\n\n` +
        `I'm using Bambeh Marketplace to sell products and services in , and I think you'd love it too!\n\n` +
        `Use my referral code to sign up as a vendor:\n` +
        `Code: ${referralCode}\n` +
        `Link: ${referralLink}\n\n` +
        `See you on Bambeh! 🎉`,
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setShowShareOptions(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
            Pending
          </span>
        );
      case "registered":
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
            Registered
          </span>
        );
      case "qualified":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
            Qualified
          </span>
        );
      case "rewarded":
        return (
          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
            Rewarded
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", { day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8" />
            <div>
              <h2 className="text-xl font-bold">Referral Program</h2>
              <p className="text-white/80 text-sm">
                Earn 10 ZC for every 2 referrals
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/80 text-sm">Total Earned</p>
            <p className="text-2xl font-bold">{totalEarned} ZC</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress to next reward</span>
            <span className="font-bold">{progress.current}/2 referrals</span>
          </div>
          <div className="h-4 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{ width: `${(progress.current / progress.required) * 100}%`,
              }}
            />
          </div>
          <p className="text-sm text-white/80 mt-2">
            {progress.required - progress.current} more referral
            {progress.required - progress.current !== 1 ? "s" : ""} to earn{" "}
            {progress.reward} Zerm Coins!
          </p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Referral Code Section */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
          <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            Your Referral Code
          </h3>

          <div className="flex flex-col md:flex-row gap-4">
            {/* Code Display */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Referral Code
              </label>
              <div className="flex gap-2">
                <div className="flex-1 bg-white rounded-lg px-4 py-3 border-2 border-purple-300 font-mono text-xl font-bold text-purple-700 text-center">
                  {referralCode}
                </div>
                <button
                  onClick={() => copyToClipboard(referralCode, "code")}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                    copiedCode
                      ? "bg-green-500 text-white"
                      : "bg-purple-500 text-white hover:bg-purple-600"
                  }`}
                >
                  {copiedCode ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Link Display */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Referral Link
              </label>
              <div className="flex gap-2">
                <div className="flex-1 bg-white rounded-lg px-4 py-3 border border-gray-300 text-sm text-gray-600 truncate">
                  {referralLink}
                </div>
                <button
                  onClick={() => copyToClipboard(referralLink, "link")}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                    copiedLink
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {copiedLink ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={shareViaWhatsApp}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp
            </button>
            <button
              onClick={shareViaTelegram}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Send className="w-5 h-5" />
              Telegram
            </button>
            <button
              onClick={shareViaEmail}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
              Email
            </button>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gray-600" />
            How Referrals Work
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <Share2 className="w-6 h-6 text-purple-600" />
              </div>
              <p className="font-semibold text-gray-900">1. Share</p>
              <p className="text-sm text-gray-600">
                Share your referral code with other vendors
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <UserPlus className="w-6 h-6 text-blue-600" />
              </div>
              <p className="font-semibold text-gray-900">2. They Register</p>
              <p className="text-sm text-gray-600">
                They sign up using your code
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <p className="font-semibold text-gray-900">3. They Qualify</p>
              <p className="text-sm text-gray-600">
                Complete their vendor registration
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-3">
                <Coins className="w-6 h-6 text-yellow-600" />
              </div>
              <p className="font-semibold text-gray-900">4. Earn 10 ZC</p>
              <p className="text-sm text-gray-600">
                Every 2 qualified referrals = 10 Zerm Coins
              </p>
            </div>
          </div>
        </div>

        {/* Referral Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
            <p className="text-sm text-purple-700">Total Referrals</p>
            <p className="text-2xl font-bold text-purple-900">
              {referrals.length}
            </p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <p className="text-sm text-blue-700">Registered</p>
            <p className="text-2xl font-bold text-blue-900">
              {referrals.filter((r) => r.status !== "pending").length}
            </p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <p className="text-sm text-green-700">Qualified</p>
            <p className="text-2xl font-bold text-green-900">
              {
                referrals.filter(
                  (r) => r.status === "qualified" || r.status === "rewarded",
                ).length
              }
            </p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
            <p className="text-sm text-yellow-700">Zerm Earned</p>
            <p className="text-2xl font-bold text-yellow-900">
              {totalEarned} ZC
            </p>
          </div>
        </div>

        {/* Referral History */}
        <div>
          <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600" />
            Referral History
          </h3>

          {referrals.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No referrals yet</p>
              <p className="text-sm text-gray-400">
                Share your code to start earning!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <UserPlus className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {referral.referredVendorName || "Pending Registration"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Code used: {referral.referralCode}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(referral.status)}
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(referral.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tips for More Referrals */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
          <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            Tips for More Referrals
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <Star className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
              Share your code on social media with your business success story
            </li>
            <li className="flex items-start gap-2">
              <Star className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
              Tell friends and family who want to start selling online
            </li>
            <li className="flex items-start gap-2">
              <Star className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
              Include your referral link in your WhatsApp status
            </li>
            <li className="flex items-start gap-2">
              <Star className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
              Network with other business owners in your community
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
