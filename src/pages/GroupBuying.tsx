/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GroupBuying.tsx — BAMBEH MARKETPLACE
 * Group buying deals — more buyers = lower price for everyone!
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, UserPlus, Share2, Clock, Star, CheckCircle,
  ChevronRight, Zap, TrendingDown, Info, Copy, MessageCircle,
} from 'lucide-react';

interface GroupDeal {
  id: string;
  name: string;
  image: string;
  category: string;
  regularPrice: number;
  tiers: { buyers: number; price: number }[];
  currentBuyers: number;
  maxBuyers: number;
  endsAt: string;
  vendor: string;
  rating: number;
  reviews: number;
  description: string;
}

const formatXAF = (n: number) => `${n.toLocaleString('fr-CM')} XAF`;

const groupDeals: GroupDeal[] = [
  {
    id: 'grp-001',
    name: 'Premium Cocoa Powder 1kg ( Origin)',
    image: '☕',
    category: 'Food',
    regularPrice: 12000,
    tiers: [
      { buyers: 3, price: 9500 },
      { buyers: 5, price: 8000 },
      { buyers: 10, price: 6500 },
    ],
    currentBuyers: 7,
    maxBuyers: 10,
    endsAt: '2026-02-25',
    vendor: 'Cocoa Cameroun',
    rating: 4.9,
    reviews: 42,
    description: 'Premium single-origin ian cocoa powder, fair-trade certified. Perfect for baking, hot chocolate, and cooking.',
  },
  {
    id: 'grp-002',
    name: 'Samsung Galaxy Buds2 Pro',
    image: '🎧',
    category: 'Electronics',
    regularPrice: 85000,
    tiers: [
      { buyers: 2, price: 72000 },
      { buyers: 5, price: 65000 },
      { buyers: 8, price: 58000 },
    ],
    currentBuyers: 4,
    maxBuyers: 8,
    endsAt: '2026-02-23',
    vendor: 'TechShop Yaoundé',
    rating: 4.7,
    reviews: 18,
    description: 'Noise-cancelling wireless earbuds with 30hr battery life. Unlocked, works with all phones.',
  },
  {
    id: 'grp-003',
    name: 'Office Chair — Ergonomic Executive',
    image: '🪑',
    category: 'Furniture',
    regularPrice: 95000,
    tiers: [
      { buyers: 3, price: 78000 },
      { buyers: 6, price: 68000 },
    ],
    currentBuyers: 2,
    maxBuyers: 6,
    endsAt: '2026-02-28',
    vendor: 'Mobilier Pro',
    rating: 4.5,
    reviews: 9,
    description: 'High-back executive chair with lumbar support, adjustable armrests, and 5-year warranty.',
  },
  {
    id: 'grp-004',
    name: 'Organic Shea Butter 2kg Bulk Pack',
    image: '🧴',
    category: 'Beauty',
    regularPrice: 22000,
    tiers: [
      { buyers: 5, price: 16000 },
      { buyers: 10, price: 12000 },
      { buyers: 20, price: 9000 },
    ],
    currentBuyers: 13,
    maxBuyers: 20,
    endsAt: '2026-02-22',
    vendor: 'Natural ',
    rating: 5.0,
    reviews: 67,
    description: '100% pure unrefined shea butter from West  highlands. Cold-pressed, no additives.',
  },
];

// ── CountdownBadge ────────────────────────────────────────────────────────────
const CountdownBadge = ({ endsAt }: { endsAt: string }) => {
  const days = Math.max(0, Math.ceil((new Date(endsAt).getTime() - Date.now()) / 86400000));
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
      days <= 1 ? 'bg-red-100 text-red-700' : days <= 3 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
    }`}>
      <Clock className="w-3 h-3" />
      {days === 0 ? 'Ends today!' : `${days} day${days !== 1 ? 's' : ''} left`}
    </span>
  );
};

// ── GroupDealCard ─────────────────────────────────────────────────────────────
const GroupDealCard = ({ deal, onJoin }: { deal: GroupDeal; onJoin: (id: string) => void }) => {
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [joined, setJoined] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const currentTier = [...deal.tiers].reverse().find(t => deal.currentBuyers >= t.buyers) || deal.tiers[0];
  const nextTier = deal.tiers.find(t => t.buyers > deal.currentBuyers);
  const progressPct = Math.min(100, Math.round(deal.currentBuyers / deal.maxBuyers * 100));

  const handleJoin = () => {
    setJoined(true);
    onJoin(deal.id);
  };

  const shareUrl = `https://bambeh.cm/group-buying/${deal.id}`;
  const shareText = `🛒 Join our group buy on Bambeh! ${deal.name} — just ${formatXAF(currentTier.price)} each when we reach ${currentTier.buyers} buyers! We're at ${deal.currentBuyers}/${currentTier.buyers} now. Join here: ${shareUrl}`;

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
      {/* Header image area */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 h-40 flex items-center justify-center relative">
        <span className="text-6xl">{deal.image}</span>
        <div className="absolute top-3 left-3">
          <span className="bg-blue-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Users className="w-3 h-3" />
            Group Deal
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <CountdownBadge endsAt={deal.endsAt} />
        </div>
      </div>

      <div className="p-4">
        <div className="mb-1">
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{deal.category}</span>
        </div>
        <h3 className="font-bold text-gray-900 mb-1 leading-snug">{deal.name}</h3>
        <p className="text-xs text-gray-500 mb-3 leading-relaxed">{deal.description}</p>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-xs font-semibold text-gray-700">{deal.rating}</span>
          <span className="text-xs text-gray-400">({deal.reviews} reviews)</span>
          <span className="text-gray-200">·</span>
          <span className="text-xs text-gray-500">{deal.vendor}</span>
        </div>

        {/* Price Tiers */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 mb-3">
          <p className="text-xs font-semibold text-blue-800 mb-2 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" />
            Price drops as more people join:
          </p>
          <div className="space-y-1.5">
            {deal.tiers.map(tier => {
              const isReached = deal.currentBuyers >= tier.buyers;
              const isCurrent = tier === currentTier;
              return (
                <div
                  key={tier.buyers}
                  className={`flex items-center justify-between text-xs rounded-lg px-2.5 py-1.5 ${
                    isCurrent ? 'bg-blue-600 text-white' : isReached ? 'bg-green-100 text-green-700' : 'bg-white text-gray-600'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {isReached && <CheckCircle className="w-3 h-3" />}
                    <Users className="w-3 h-3 opacity-70" />
                    {tier.buyers}+ buyers
                  </span>
                  <span className="font-bold">{formatXAF(tier.price)}</span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Regular price: <span className="line-through">{formatXAF(deal.regularPrice)}</span>
          </p>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-xs font-medium mb-1.5">
            <span className="text-blue-700 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {deal.currentBuyers} joined
            </span>
            {nextTier && (
              <span className="text-amber-600">
                {nextTier.buyers - deal.currentBuyers} more for {formatXAF(nextTier.price)} each!
              </span>
            )}
            {!nextTier && (
              <span className="text-green-600 font-semibold">Best price reached! 🎉</span>
            )}
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-0.5">
            <span>0</span>
            <span>Max: {deal.maxBuyers}</span>
          </div>
        </div>

        {/* Current Price Highlight */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-blue-600 font-black text-2xl">{formatXAF(currentTier.price)}</span>
          <span className="text-xs text-gray-400 line-through">{formatXAF(deal.regularPrice)}</span>
          <span className="text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
            -{Math.round((1 - currentTier.price / deal.regularPrice) * 100)}%
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {joined ? (
            <div className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-100 text-green-700 rounded-xl font-semibold text-sm">
              <CheckCircle className="w-4 h-4" />
              You're in! Share to get a lower price
            </div>
          ) : (
            <button
              onClick={handleJoin}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 shadow-sm shadow-blue-200 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              Join Group ({formatXAF(currentTier.price)})
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setShowShareOptions(!showShareOptions)}
              className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white hover:bg-green-600 transition-all"
            >
              <Share2 className="w-4 h-4" />
            </button>
            {showShareOptions && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowShareOptions(false)} />
                <div className="absolute bottom-12 right-0 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20 w-48">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700"
                  >
                    <MessageCircle className="w-4 h-4 text-green-500" />
                    Share on WhatsApp
                  </a>
                  <button
                    onClick={copyLink}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Copy className="w-4 h-4 text-gray-400" />
                    {copiedLink ? 'Copied! ✓' : 'Copy link'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── GroupBuying (page) ────────────────────────────────────────────────────────
const GroupBuying: React.FC = () => {
  const navigate = useNavigate();
  const [deals, setDeals] = useState(groupDeals);

  const handleJoin = (id: string) => {
    setDeals(prev => prev.map(d =>
      d.id === id ? { ...d, currentBuyers: d.currentBuyers + 1 } : d
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/20">

      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-10 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black">Group Buying 👥</h1>
              <p className="text-blue-100 text-sm">Buy together, save together — the more the merrier!</p>
            </div>
          </div>

          <div className="bg-white/15 rounded-2xl p-4 mt-4">
            <h2 className="font-bold text-lg mb-2 flex items-center gap-2">
              <Info className="w-5 h-5" />
              How Group Buying Works
            </h2>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              {[
                { step: '1️⃣', text: 'Find a group deal and click Join. Your price locks in.' },
                { step: '2️⃣', text: 'Share the deal on WhatsApp. More buyers = lower price for everyone!' },
                { step: '3️⃣', text: 'Once minimum buyers reached, everyone gets the lower price automatically.' },
              ].map(s => (
                <div key={s.step} className="flex items-start gap-2 text-blue-100">
                  <span className="text-xl flex-shrink-0">{s.step}</span>
                  <span>{s.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Active Group Deals</h2>
          <span className="text-sm text-gray-500">{deals.length} deals available</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {deals.map(deal => (
            <GroupDealCard key={deal.id} deal={deal} onJoin={handleJoin} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 text-center bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Are you a vendor?</h3>
          <p className="text-gray-500 text-sm mb-4">
            Create group buying deals to move inventory fast and attract new customers!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/vendor/premium-tools"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
            >
              Start a Group Deal
              <ChevronRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => navigate('/group-buying/create')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
            >
              <Zap className="w-4 h-4" />
              Create Group Buy
            </button>
            <button
              onClick={() => navigate('/group-buying/invite')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              Invite Friends
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupBuying;

