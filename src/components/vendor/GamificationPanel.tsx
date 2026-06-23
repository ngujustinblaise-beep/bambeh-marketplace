/**
 * GAMIFICATION PANEL - VENDOR REWARDS & PROGRESS
 * FILE LOCATION: src/components/vendor/GamificationPanel.tsx
 */

import { useState, useEffect } from 'react';
import {
  Coins, Users, Star, RefreshCw, Gift, ChevronRight, Copy, Check,
  TrendingUp, Trophy, Share2, Clock, Sparkles, Target
} from 'lucide-react';

interface GamificationStats {
  zermBalance: number;
  totalEarned: number;
  earnedThisMonth: number;
  referralProgress: { current: number; required: number; reward: number; };
  reviewProgress:   { current: number; required: number; reward: number; periodEnds: string; };
  subscriptionTier: string;
  renewalBonus:     number;
  referralCode:     string;
}

interface RewardHistoryItem {
  id: string; type: 'renewal' | 'referral' | 'review';
  amount: number; description: string; date: string;
}

interface GamificationPanelProps { vendorId: string; compact?: boolean; }

export default function GamificationPanel({ vendorId, compact = false }: GamificationPanelProps) {
  const [stats, setStats]               = useState<GamificationStats | null>(null);
  const [recentRewards, setRecentRewards] = useState<RewardHistoryItem[]>([]);
  const [copiedCode, setCopiedCode]     = useState(false);
  const [showAllRewards, setShowAllRewards] = useState(false);

  useEffect(() => {
    loadGamificationData();
    const handleUpdate = () => loadGamificationData();
    window.addEventListener('zermBalanceUpdated', handleUpdate);
    window.addEventListener('rewardEarned', handleUpdate);
    return () => {
      window.removeEventListener('zermBalanceUpdated', handleUpdate);
      window.removeEventListener('rewardEarned', handleUpdate);
    };
  }, [vendorId]);

  const loadGamificationData = () => {
    try {
      const balance = parseInt(localStorage.getItem(`Bambeh_zerm_balance_${vendorId}`) || '0', 10);
      const refProgress = JSON.parse(localStorage.getItem(`Bambeh_referral_progress_${vendorId}`) || '{}');
      const revProgress = JSON.parse(localStorage.getItem(`Bambeh_review_progress_${vendorId}`) || '{}');
      const subscription = JSON.parse(localStorage.getItem('Bambeh_vendor_subscription') || '{}');
      const existingCode = localStorage.getItem(`Bambeh_referral_code_${vendorId}`);
      const referralCode = existingCode || `BAMBEH-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      if (!existingCode) { localStorage.setItem(`Bambeh_referral_code_${vendorId}`, referralCode); }
      const tierBonuses: Record<string, number> = { starter: 5, professional: 10, business: 15, enterprise: 20 };
      const tier = subscription.tier || 'starter';
      setStats({
        zermBalance: balance,
        totalEarned: balance + 50,
        earnedThisMonth: Math.floor(balance * 0.3),
        referralProgress: { current: refProgress.currentBatchCount || 0, required: 2, reward: 10 },
        reviewProgress: {
          current: revProgress.currentPeriodCount || 0, required: 5, reward: 20,
          periodEnds: revProgress.periodEndDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        subscriptionTier: tier,
        renewalBonus: tierBonuses[tier] || 5,
        referralCode,
      });
      const history = JSON.parse(localStorage.getItem('Bambeh_gamification_rewards') || '[]');
      const vendorRewards = history.filter((r: any) => r.vendorId === vendorId).slice(0, 10);
      setRecentRewards(vendorRewards);
    } catch (error) {
      console.error('Error loading gamification data:', error);
    }
  };

  const copyReferralCode = () => {
    if (stats?.referralCode) {
      navigator.clipboard.writeText(stats.referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const shareReferralLink = () => {
    const link = `https://bambeh.com/vendor/register?ref=${stats?.referralCode}`;
    if (navigator.share) {
      navigator.share({ title: 'Join Bambeh as a Vendor!', text: `Use my referral code ${stats?.referralCode}`, url: link });
    } else {
      navigator.clipboard.writeText(link);
      alert('Referral link copied to clipboard!');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'renewal':  return <RefreshCw className="w-4 h-4" />;
      case 'referral': return <Users className="w-4 h-4" />;
      case 'review':   return <Star className="w-4 h-4" />;
      default:         return <Gift className="w-4 h-4" />;
    }
  };

  const getRewardColor = (type: string) => {
    switch (type) {
      case 'renewal':  return 'text-teal-600 bg-teal-100';
      case 'referral': return 'text-purple-600 bg-purple-100';
      case 'review':   return 'text-yellow-600 bg-yellow-100';
      default:         return 'text-gray-600 bg-gray-100';
    }
  };

  if (!stats) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="h-20 bg-gray-200 rounded mb-4" />
        <div className="h-16 bg-gray-200 rounded" />
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
              <Coins className="w-5 h-5 text-yellow-900" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Zerm Balance</p>
              <p className="text-xl font-bold text-yellow-700">{stats.zermBalance} ZC</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center px-3 border-l border-yellow-300">
              <Users className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-semibold">{stats.referralProgress.current}/2</span>
            </div>
            <div className="flex flex-col items-center px-3 border-l border-yellow-300">
              <Star className="w-4 h-4 text-yellow-600" />
              <span className="text-xs font-semibold">{stats.reviewProgress.current}/5</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8" />
            <h2 className="text-xl font-bold">Rewards & Achievements</h2>
          </div>
          <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold capitalize">{stats.subscriptionTier}</span>
          </div>
        </div>
        <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Your Zerm Balance</p>
              <p className="text-4xl font-bold">{stats.zermBalance} ZC</p>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm">This Month</p>
              <p className="text-xl font-semibold">+{stats.earnedThisMonth.toLocaleString()} ZC</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-teal-50 rounded-xl p-4 border border-teal-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center"><RefreshCw className="w-4 h-4 text-white" /></div>
              <h3 className="font-semibold text-teal-800">Renewal Bonus</h3>
            </div>
            <p className="text-2xl font-bold text-teal-600 mb-1">+{stats.renewalBonus} ZC</p>
            <p className="text-sm text-teal-700">Earned on each subscription renewal</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center"><Users className="w-4 h-4 text-white" /></div>
              <h3 className="font-semibold text-purple-800">Referral Progress</h3>
            </div>
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-purple-700">{stats.referralProgress.current} / {stats.referralProgress.required}</span>
                <span className="font-semibold text-purple-600">+{stats.referralProgress.reward} ZC</span>
              </div>
              <div className="h-3 bg-purple-200 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${(stats.referralProgress.current / stats.referralProgress.required) * 100}%` }} />
              </div>
            </div>
            <p className="text-xs text-purple-600">{stats.referralProgress.required - stats.referralProgress.current} more referral(s) to earn reward</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center"><Star className="w-4 h-4 text-white" /></div>
              <h3 className="font-semibold text-yellow-800">Review Progress</h3>
            </div>
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-yellow-700">{stats.reviewProgress.current} / {stats.reviewProgress.required}</span>
                <span className="font-semibold text-yellow-600">+{stats.reviewProgress.reward} ZC</span>
              </div>
              <div className="h-3 bg-yellow-200 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500 rounded-full transition-all" style={{ width: `${(stats.reviewProgress.current / stats.reviewProgress.required) * 100}%` }} />
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-yellow-600"><Clock className="w-3 h-3" /><span>Period ends {formatDate(stats.reviewProgress.periodEnds)}</span></div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg text-purple-900">Your Referral Code</h3>
              <p className="text-sm text-purple-700">Share with other vendors to earn 10 ZC per 2 referrals</p>
            </div>
            <Target className="w-10 h-10 text-purple-400" />
          </div>
          <div className="flex gap-3">
            <div className="flex-1 bg-white rounded-lg px-4 py-3 border-2 border-purple-300 font-mono text-lg font-bold text-purple-700 text-center">{stats.referralCode}</div>
            <button onClick={copyReferralCode} className={`px-4 py-3 rounded-lg font-semibold transition-all ${copiedCode ? 'bg-green-500 text-white' : 'bg-purple-500 text-white hover:bg-purple-600'}`}>
              {copiedCode ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
            <button onClick={shareReferralLink} className="px-4 py-3 bg-purple-100 text-purple-700 rounded-lg font-semibold hover:bg-purple-200 transition-all"><Share2 className="w-5 h-5" /></button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-gray-900">Recent Rewards</h3>
            {recentRewards.length > 3 && (
              <button onClick={() => setShowAllRewards(!showAllRewards)} className="text-teal-600 text-sm font-semibold flex items-center gap-1 hover:underline">
                {showAllRewards ? 'Show Less' : 'View All'}<ChevronRight className={`w-4 h-4 transition-transform ${showAllRewards ? 'rotate-90' : ''}`} />
              </button>
            )}
          </div>
          {recentRewards.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl">
              <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No rewards earned yet</p>
              <p className="text-sm text-gray-400">Start referring vendors and getting reviews!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {(showAllRewards ? recentRewards : recentRewards.slice(0, 3)).map(reward => (
                <div key={reward.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getRewardColor(reward.type)}`}>{getRewardIcon(reward.type)}</div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{reward.description}</p>
                      <p className="text-xs text-gray-500">{formatDate(reward.date)}</p>
                    </div>
                  </div>
                  <span className="font-bold text-green-600">+{reward.amount} ZC</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-6 border border-teal-200">
          <h3 className="font-bold text-lg text-teal-900 mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5" />How to Earn More Zerm Coins</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0"><RefreshCw className="w-4 h-4 text-white" /></div>
              <div><p className="font-semibold text-teal-800">Renew On Time</p><p className="text-teal-700">Earn {stats.renewalBonus} ZC every subscription renewal</p></div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0"><Users className="w-4 h-4 text-white" /></div>
              <div><p className="font-semibold text-purple-800">Refer Vendors</p><p className="text-purple-700">Earn 10 ZC for every 2 vendors you refer</p></div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0"><Star className="w-4 h-4 text-white" /></div>
              <div><p className="font-semibold text-yellow-800">Get Great Reviews</p><p className="text-yellow-700">Earn 20 ZC for every 5 positive reviews</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}






