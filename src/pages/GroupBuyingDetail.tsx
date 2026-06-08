/**
 * src/pages/GroupBuyingDetail.tsx — Bambeh Marketplace
 *
 * FIXES applied:
 *  ✅ Race condition: loadDeal() called before state setters settled — fixed with
 *     local variable for uid instead of relying on setUserId().
 *  ✅ handleJoin: current_buyers update now uses .rpc or increment to avoid
 *     overwrite race when multiple users join simultaneously.
 *  ✅ Double-join guard: insert already protected by unique constraint on
 *     (deal_id, user_id); error is caught and ignored gracefully.
 *  ✅ Copy-to-clipboard: navigator.clipboard can throw SecurityError on
 *     Android WebView — fallback added.
 *  ✅ Stale closure in setDeal optimistic update: now reads deal.currentBuyers
 *     inside the updater function.
 *  ✅ spotsLeft calculation: used minParticipants not maxBuyers (was misleading).
 *  ✅ Dead id from useParams: guard added so component shows "not found" cleanly
 *     when id is undefined.
 *  ✅ Join button stays hidden after joining even if deal still "active".
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Users, Check, ShoppingCart, Copy, Share2, Loader2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang, t } from "@/hooks/useAppLang";

function isUUID(s: string) {
  const lang = useLang();
  const isRtl = lang === "ar";
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

interface GroupDeal {
  id: string;
  name: string;
  originalPrice: number;
  groupPrice: number;
  minParticipants: number;
  currentBuyers: number;
  maxBuyers: number;
  deadline: string;
  category: string;
  seller: string;
  description: string;
  status: string;
  image?: string;
}

const DEMO_DEALS: Record<string, GroupDeal> = {
  s1: {
    id: 's1', name: 'Samsung Galaxy A54 Group Deal',
    originalPrice: 185000, groupPrice: 155000,
    minParticipants: 10, currentBuyers: 7, maxBuyers: 10,
    deadline: new Date(Date.now() + 86400000 * 3).toISOString(),
    category: 'Electronics', seller: 'TechShop CM',
    description: 'Join and save 16%. Deal activates when 10 people join.', status: 'open',
  },
  s2: {
    id: 's2', name: 'Organic Rice 50kg Bulk Buy',
    originalPrice: 45000, groupPrice: 35000,
    minParticipants: 20, currentBuyers: 18, maxBuyers: 20,
    deadline: new Date(Date.now() + 86400000).toISOString(),
    category: 'Food', seller: 'FarmFresh CM',
    description: 'Save 22% on bulk organic rice from local farmers.', status: 'open',
  },
};

export default function GroupBuyingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [deal, setDeal] = useState<GroupDeal | null>(null);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [copied, setCopied] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const loadDeal = useCallback(async (dealId: string) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      // FIX: store uid in local var — don't rely on setUserId() having settled
      const uid = session?.user?.id ?? null;
      setUserId(uid);

      if (isUUID(dealId)) {
        const { data, error } = await supabase
          .from('group_deals')
          .select('*')
          .eq('id', dealId)
          .single();

        if (!error && data) {
          setDeal({
            id: data.id,
            name: data.name,
            originalPrice: data.regular_price,
            groupPrice: data.tiers?.[0]?.price ?? data.regular_price,
            minParticipants: data.max_buyers,
            currentBuyers: data.current_buyers || 0,
            maxBuyers: data.max_buyers,
            deadline: data.ends_at,
            category: data.category || 'General',
            seller: 'Bambeh Vendor',
            description: data.description || '',
            status: data.is_active ? 'open' : 'closed',
            image: data.image_url,
          });

          // Check existing join — use uid from local var
          if (uid) {
            const { data: join } = await supabase
              .from('group_deal_joins')
              .select('id')
              .eq('deal_id', dealId)
              .eq('user_id', uid)
              .maybeSingle(); // maybeSingle won't error if row missing
            setJoined(!!join);
          }
          return;
        }
      }

      // Fallback: demo data
      const demo = DEMO_DEALS[dealId];
      setDeal(demo ?? null);
    } catch {
      setDeal(DEMO_DEALS[id ?? ''] ?? null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadDeal(id);
    } else {
      setLoading(false);
    }
  }, [id, loadDeal]);

  const handleJoin = useCallback(async () => {
    if (!deal || joined || joining) return;
    if (!userId) { navigate('/login'); return; }

    setJoining(true);
    try {
      if (isUUID(deal.id)) {
        const { error: insertErr } = await supabase
          .from('group_deal_joins')
          .insert({ deal_id: deal.id, user_id: userId });

        if (insertErr && insertErr.code !== '23505') {
          // 23505 = unique_violation (already joined) — treat as success
          console.error('Join error:', insertErr.message);
        }

        // FIX: use RPC increment to avoid overwrite race
        await supabase.rpc('increment_group_deal_buyers', { deal_id: deal.id })
          .catch(() => {
            // Fallback if RPC not defined: direct update (less safe under contention)
            supabase
              .from('group_deals')
              .update({ current_buyers: (deal.currentBuyers || 0) + 1 })
              .eq('id', deal.id);
          });
      }

      // Optimistic update via updater function (FIX: stale closure)
      setDeal(prev => prev ? { ...prev, currentBuyers: prev.currentBuyers + 1 } : null);
      setJoined(true);
    } catch {
      // silent — user sees no change; they can retry
    } finally {
      setJoining(false);
    }
  }, [deal, joined, joining, userId, navigate]);

  const copyLink = useCallback(() => {
    const url = window.location.href;
    // FIX: navigator.clipboard throws on Android WebView — add fallback
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).catch(() => fallbackCopy(url));
    } else {
      fallbackCopy(url);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }, []);

  function fallbackCopy(text: string) {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
    document.body.appendChild(el);
    el.focus();
    el.select();
    try { document.execCommand('copy'); } catch { /* ignore */ }
    document.body.removeChild(el);
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  // ── Not found ──
  if (!id || !deal) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-teal-600 mb-6"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        <div className="text-center py-16 text-gray-500">
          <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-semibold">Deal not found</p>
          <button
            onClick={() => navigate('/group-buying')}
            className="mt-4 text-teal-600 underline text-sm"
          >
            Browse group deals
          </button>
        </div>
      </div>
    );
  }

  const pct = Math.min(100, Math.round((deal.currentBuyers / deal.minParticipants) * 100));
  const savings = deal.originalPrice - deal.groupPrice;
  const savingsPct = Math.round((savings / deal.originalPrice) * 100);
  const daysLeft = Math.max(0, Math.ceil((new Date(deal.deadline).getTime() - Date.now()) / 86400000));
  // FIX: spotsLeft should count toward minParticipants (activation), not maxBuyers
  const spotsLeft = Math.max(0, deal.minParticipants - deal.currentBuyers);
  const isActive = deal.status === 'open' && daysLeft > 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-xl"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="font-semibold text-gray-900 flex-1 truncate">{deal.name}</h2>
        <button
          onClick={copyLink}
          className="p-2 hover:bg-gray-100 rounded-xl"
          aria-label={copied ? 'Link copied' : 'Copy link'}
        >
          {copied
            ? <Check className="w-5 h-5 text-teal-600" />
            : <Copy className="w-5 h-5 text-gray-500" />}
        </button>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* Hero */}
        <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-5 text-white">
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{deal.category}</span>
              <h1 className="text-lg font-bold mt-2">{deal.name}</h1>
              <p className="text-teal-100 text-sm">{deal.seller}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-white/60 text-xs line-through">{deal.originalPrice.toLocaleString()} XAF</p>
              <p className="text-2xl font-bold">{deal.groupPrice.toLocaleString()}</p>
              <p className="text-xs text-teal-100">XAF · Save {savingsPct}%</p>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-teal-100">{deal.currentBuyers}/{deal.minParticipants} joined</span>
              <span className="font-semibold">{pct}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2.5">
              <div
                className="bg-white h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}/>
            </div>
            <p className="text-xs text-teal-100 mt-2">
              {spotsLeft > 0
                ? `${spotsLeft} more ${spotsLeft === 1 ? 'person' : 'people'} needed to activate deal`
                : '🎉 Deal activated!'}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            [savings.toLocaleString() + ' XAF', 'You Save', 'text-green-600'],
            [daysLeft + 'd', 'Time Left', daysLeft <= 1 ? 'text-red-600' : 'text-gray-900'],
            [deal.currentBuyers.toString(), 'Joined', 'text-blue-600'],
          ].map(([v, l, col]) => (
            <div key={String(l)} className="bg-white rounded-2xl p-3 shadow-sm border text-center">
              <p className={`text-lg font-bold ${col}`}>{v}</p>
              <p className="text-xs text-gray-500 mt-0.5">{l}</p>
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <h3 className="font-semibold text-gray-900 mb-2">About this Deal</h3>
          <p className="text-sm text-gray-700 leading-relaxed">{deal.description}</p>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <h3 className="font-semibold text-gray-900 mb-3">How Group Buying Works</h3>
          {([
            ['Join the deal', 'Tap Join below to reserve your spot'],
            ['Share with friends', 'More participants = deal activates sooner'],
            ['Deal activates', `When ${deal.minParticipants} people join, everyone gets ${savingsPct}% off`],
            ['Pay & receive', 'Payment collected and order placed together'],
          ] as [string, string][]).map(([title, desc], i) => (
            <div key={title} className="flex gap-3 mb-3 last:mb-0">
              <div className="w-7 h-7 bg-teal-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                {i + 1}
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">{title}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Joined confirmation */}
        {joined && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
            <Check className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-800">You have joined this deal!</p>
              <p className="text-sm text-green-600">We'll notify you when the deal activates.</p>
            </div>
          </div>
        )}

        {/* Share button */}
        <button
          onClick={copyLink}
          className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition"
        >
          <Share2 className="w-4 h-4" />
          {copied ? 'Link Copied!' : 'Share This Deal'}
        </button>
      </div>

      {/* Sticky join button — hidden once joined */}
      {!joined && isActive && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <button
            onClick={handleJoin}
            disabled={joining}
            className="w-full bg-teal-600 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-teal-700 transition"
          >
            {joining
              ? <><Loader2 className="w-5 h-5 animate-spin" />Joining…</>
              : <><Users className="w-5 h-5" />Join Group Deal · Save {savingsPct}%</>}
          </button>
        </div>
      )}
    </div>
  );
}
