/**
 * VENDOR PREMIUM TOOLS - REBUILT Feb 17, 2026
 * Clean rebuild. No broken imports. All tiers supported.
 * VendorLayout provides the header - this page is content only.
 * 
 * FILE: src/pages/vendor/VendorPremiumToolsEnhanced.tsx
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Crown, Zap, BarChart3, Star, Upload, Headphones, BadgeCheck,
  MessageSquare, ChevronRight, Lock, Sparkles, TrendingUp,
  Check, Search, Package, Eye
} from 'lucide-react';

/* ── Tier configuration (supports ALL possible tier values) ── */
const TIERS: Record<string, { name: string; level: number; color: string; bg: string }> = {
  starter:      { name: 'Starter',      level: 1, color: 'text-gray-400',   bg: 'bg-gray-500/20' },
  basic:        { name: 'Basic',        level: 1, color: 'text-gray-400',   bg: 'bg-gray-500/20' },
  professional: { name: 'Professional', level: 2, color: 'text-blue-400',   bg: 'bg-blue-500/20' },
  premium:      { name: 'Premium',      level: 2, color: 'text-blue-400',   bg: 'bg-blue-500/20' },
  gold:         { name: 'Gold',         level: 3, color: 'text-yellow-400',  bg: 'bg-yellow-500/20' },
  enterprise:   { name: 'Enterprise',   level: 3, color: 'text-purple-400',  bg: 'bg-purple-500/20' },
  master:       { name: 'Master',       level: 3, color: 'text-purple-400',  bg: 'bg-purple-500/20' },
};

const DEFAULT_TIER = TIERS.starter;

function getTier(key: string | undefined): { name: string; level: number; color: string; bg: string } {
  if (!key) return DEFAULT_TIER;
  return TIERS[key.toLowerCase()] || DEFAULT_TIER;
}

function getTierLevel(key: string | undefined): number {
  return getTier(key).level;
}

/* ── Premium tools definitions ── */
const premiumTools = [
  {
    id: 'analytics-pro', name: 'Analytics Pro',
    description: 'Advanced insights & performance metrics',
    longDescription: 'Get deep insights into your sales, customer behavior, and product performance with real-time analytics.',
    icon: BarChart3, color: 'text-blue-500', gradient: 'from-blue-500 to-cyan-500',
    route: '/vendor/premium/analytics-pro', requiredTier: 'professional',
    features: ['Real-time dashboard', 'Revenue tracking', 'Customer insights', 'Export reports'],
    stats: { label: 'Views', value: '+45%' }
  },
  {
    id: 'featured-listings', name: 'Featured Listings',
    description: 'Boost visibility & get more sales',
    longDescription: 'Make your products stand out with featured placement at the top of search results.',
    icon: Star, color: 'text-yellow-500', gradient: 'from-yellow-500 to-orange-500',
    route: '/vendor/premium/featured-listings', requiredTier: 'professional',
    features: ['Top placement', '5x more views', 'Featured badge', 'Priority in search'],
    stats: { label: 'Sales', value: '+120%' }
  },
  {
    id: 'bulk-upload', name: 'Bulk Upload',
    description: 'Upload hundreds of products at once',
    longDescription: 'Save hours by uploading multiple products simultaneously using CSV or Excel files.',
    icon: Upload, color: 'text-green-500', gradient: 'from-green-500 to-emerald-500',
    route: '/vendor/premium/bulk-upload', requiredTier: 'professional',
    features: ['CSV/Excel upload', 'Image batch upload', 'Auto-categorization', 'Validation'],
    stats: { label: 'Time saved', value: '10+ hrs' }
  },
  {
    id: 'priority-support', name: 'Priority Support',
    description: '24/7 dedicated support team',
    longDescription: 'Get instant help from our dedicated support team with priority queue access.',
    icon: Headphones, color: 'text-purple-500', gradient: 'from-purple-500 to-pink-500',
    route: '/vendor/premium/priority-support', requiredTier: 'enterprise',
    features: ['24/7 availability', 'Dedicated agent', 'Video calls', 'Priority queue'],
    stats: { label: 'Response', value: '<1 hr' }
  },
  {
    id: 'verified-seller', name: 'Verified Seller',
    description: 'Build trust with verification badges',
    longDescription: 'Get verified to earn customer trust and increase conversion rates.',
    icon: BadgeCheck, color: 'text-teal-500', gradient: 'from-teal-500 to-cyan-500',
    route: '/vendor/premium/verified-seller', requiredTier: 'professional',
    features: ['Trust badge', 'ID verification', 'Business verification', 'Social proof'],
    stats: { label: 'Trust', value: '+60%' }
  },
  {
    id: 'auto-messaging', name: 'Auto Messaging',
    description: 'Automated customer communication',
    longDescription: 'Automate responses to common questions and keep customers engaged 24/7.',
    icon: MessageSquare, color: 'text-indigo-500', gradient: 'from-indigo-500 to-purple-500',
    route: '/vendor/premium/auto-messaging', requiredTier: 'enterprise',
    features: ['Auto-replies', 'Welcome messages', 'Order updates', 'Follow-up reminders'],
    stats: { label: 'Responses', value: '99%' }
  }
];

/* ── Component ── */
export default function VendorPremiumToolsEnhanced() {
  const navigate = useNavigate();
  const [vendorTier, setVendorTier] = useState('starter');
  const [isMaster, setIsMaster] = useState(false);
  const [ready, setReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('Bambeh_vendor') || localStorage.getItem('Bambeh_user');
      if (raw) {
        const v = JSON.parse(raw);
        const tier = v.vendorTier || v.tier || v.privilege || 'starter';
        setVendorTier(tier);
        setIsMaster(v.isMaster === true || v.privilege === 'master');
      }
    } catch (e) {
      console.error('PremiumTools: load error', e);
    }
    setReady(true);
  }, []);

  const canAccess = (requiredTier: string): boolean => {
    if (isMaster) return true;
    return getTierLevel(vendorTier) >= getTierLevel(requiredTier);
  };

  const handleToolClick = (tool: typeof premiumTools[0]) => {
    if (canAccess(tool.requiredTier)) {
      navigate(tool.route);
    } else {
      navigate('/vendor/subscription', { state: { requiredTier: tool.requiredTier, toolName: tool.name } });
    }
  };

  const filtered = premiumTools.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!ready) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-teal-500"></div>
      </div>
    );
  }

  const currentTier = getTier(vendorTier);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Hero Banner */}
      <div className="mb-8 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 rounded-2xl p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-yellow-400" />
              Premium Tools
            </h1>
            <p className="text-white/60">Unlock powerful features to grow your business faster</p>
          </div>

          {/* Current tier badge */}
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${currentTier.bg}`}>
            <Crown className={`w-6 h-6 ${currentTier.color}`} />
            <div>
              <p className="text-xs text-white/60">Current Plan</p>
              <p className={`font-bold ${currentTier.color}`}>{currentTier.name}</p>
            </div>
            {currentTier.level < 3 && (
              <Link to="/vendor/subscription" className="ml-4 px-3 py-1 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20 transition-colors">
                Upgrade
              </Link>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools..."
      className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
          />
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((tool) => {
          const Icon = tool.icon;
          const hasAccess = canAccess(tool.requiredTier);
          const reqTier = getTier(tool.requiredTier);

          return (
            <div key={tool.id} className={`bg-white rounded-2xl border-2 overflow-hidden transition-all hover:shadow-lg ${hasAccess ? 'border-gray-100 hover:border-teal-200' : 'border-gray-100 opacity-85'}`}>
              <div className={`h-1.5 bg-gradient-to-r ${tool.gradient}`} />
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  {!hasAccess && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                      <Lock className="w-3 h-3" />{reqTier.name}
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{tool.name}</h3>
                <p className="text-gray-500 text-sm mb-4">{tool.longDescription}</p>
                <div className="space-y-2 mb-6">
                  {tool.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className={`w-4 h-4 ${hasAccess ? 'text-teal-500' : 'text-gray-300'}`} />
                      <span className={`text-sm ${hasAccess ? 'text-gray-700' : 'text-gray-400'}`}>{feature}</span>
                    </div>
                  ))}
                </div>
                {tool.stats && hasAccess && (
                  <div className="flex items-center gap-2 mb-6 px-3 py-2 bg-green-50 rounded-lg w-fit">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-green-700 text-sm font-medium">{tool.stats.label}: {tool.stats.value}</span>
                  </div>
                )}
                <button onClick={() => handleToolClick(tool)} className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${hasAccess ? `bg-gradient-to-r ${tool.gradient} text-white hover:shadow-lg hover:opacity-90` : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                  {hasAccess ? (<><Zap className="w-5 h-5" />Use Tool</>) : (<><Lock className="w-5 h-5" />Upgrade to Unlock</>)}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
          }
              )}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-gray-700 text-xl font-medium mb-2">No tools found</h3>
          <p className="text-gray-500">Try a different search term</p>
        </div>
      )}

      {currentTier.level < 3 && (
        <div className="mt-12 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-8 text-center">
          <Crown className="w-16 h-16 text-purple-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unlock All Premium Tools</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">Upgrade your plan to access all premium features and grow your business faster.</p>
          <Link to="/vendor/subscription" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all">
            <Crown className="w-5 h-5" />View Plans<ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      )}

      <div className="mt-12 grid sm:grid-cols-3 gap-4">
        <Link to="/vendor/dashboard" className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
          <Package className="w-6 h-6 text-teal-500" /><div><p className="text-gray-900 font-medium">Dashboard</p><p className="text-gray-400 text-sm">Back to vendor home</p></div><ChevronRight className="w-5 h-5 text-gray-300 ml-auto" />
        </Link>
        <Link to="/vendor/listings" className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
          <Eye className="w-6 h-6 text-blue-500" /><div><p className="text-gray-900 font-medium">My Listings</p><p className="text-gray-400 text-sm">Manage products</p></div><ChevronRight className="w-5 h-5 text-gray-300 ml-auto" />
        </Link>
        <Link to="/vendor/analytics" className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
          <BarChart3 className="w-6 h-6 text-purple-500" /><div><p className="text-gray-900 font-medium">Analytics</p><p className="text-gray-400 text-sm">View performance</p></div><ChevronRight className="w-5 h-5 text-gray-300 ml-auto" />
        </Link>
      </div>
    </div>
  );
}
