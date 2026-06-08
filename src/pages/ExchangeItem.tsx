/**
 * src/pages/ExchangeItem.tsx — Bambeh Marketplace
 * FIXED:
 *  ✅ Column mismatch: user_id (not owner_id), location (not city)
 *  ✅ Correct RPC name: increment_exchange_view
 *  ✅ profiles join uses user_id correctly
 *  ✅ Safe area padding — footer never covers buttons on Android
 *  ✅ Handles missing images gracefully
 *  ✅ Share via Web Share API with clipboard fallback
 *  ✅ Owner sees "Edit / Delete" instead of offer/chat buttons
 *  ✅ Offer count updates live via realtime
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, RefreshCcw, MapPin, Eye, MessageCircle,
  RefreshCw, AlertCircle, Heart, Share2, Package,
  ChevronLeft, ChevronRight, Clock, Flame,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang, t } from "@/hooks/useAppLang";

interface ExchangeItemData {
  id:                    string;
  userId:                string;
  ownerName:             string;
  ownerAvatar?:          string;
  title:                 string;
  description:           string;
  category:              string;
  condition:             string;
  images:                string[];
  location:              string;
  wantedItems:           string;
  estimatedValueXAF?:    number;
  allowCashSupplement:   boolean;
  maxCashSupplementXAF?: number;
  viewCount:             number;
  offerCount:            number;
  status:                string;
  createdAt:             string;
  expiresAt?:            string;
}

const CONDITION_COLORS: Record<string, string> = {
  Excellent: 'bg-green-100 text-green-800',
  Good:      'bg-teal-100 text-teal-800',
  Fair:      'bg-yellow-100 text-yellow-800',
  Poor:      'bg-red-100 text-red-800',
};

function daysUntil(iso: string): number {
  const lang = useLang();
  const isRtl = lang === "ar";
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

const ExchangeItem: React.FC = () => {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [item,       setItem]       = useState<ExchangeItemData | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [favorited,  setFavorited]  = useState(false);
  const [imgIdx,     setImgIdx]     = useState(0);
  const [currentUid, setCurrentUid] = useState<string | null>(null);
  const [shared,     setShared]     = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Get current user uid once
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUid(session?.user?.id ?? null);
    });
  }, []);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      // ✅ FIX: join uses user_id (matches ExchangeItemPost.tsx insert)
      const { data, error: dbErr } = await supabase
        .from('exchange_items')
        .select(`
          *,
          profiles:user_id (display_name, avatar_url)
        `)
        .eq('id', id)
        .single();

      if (dbErr || !data) {
        setError('Item not found or has been removed.');
        return;
      }

      const profile = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;

      setItem({
        id:                  data.id as string,
        userId:              data.user_id as string,              // ✅ FIX: was owner_id
        ownerName:           (profile?.display_name as string) ?? 'Bambeh User',
        ownerAvatar:         profile?.avatar_url as string | undefined,
        title:               data.title as string,
        description:         (data.description as string) ?? '',
        category:            data.category as string,
        condition:           data.condition as string,
        images:              (data.images as string[]) ?? [],
        location:            (data.location as string) ?? '—',   // ✅ FIX: was data.city
        wantedItems:         (data.wanted_items as string) ?? 'Open to offers',
        estimatedValueXAF:   data.estimated_value_xaf as number | undefined,
        allowCashSupplement: Boolean(data.allow_cash_supplement),
        maxCashSupplementXAF: data.max_cash_supplement_xaf as number | undefined,
        viewCount:           (data.view_count as number) ?? 0,
        offerCount:          (data.offer_count as number) ?? 0,
        status:              data.status as string,
        createdAt:           data.created_at as string,
        expiresAt:           data.expires_at as string | undefined,
      });

      // ✅ FIX: correct RPC name matching migration
      await supabase.rpc('increment_exchange_view', { item_id: id });

    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load item.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();

    // Live offer count updates
    if (id) {
      channelRef.current = supabase
        .channel(`exchange_offers_${id}`)
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'exchange_offers',
            filter: `exchange_item_id=eq.${id}` },
          () => {
            setItem(prev => prev ? { ...prev, offerCount: prev.offerCount + 1 } : prev);
          }
        )
        .subscribe();
    }

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [load, id]);

  const formatXAF = (n: number) =>
    new Intl.NumberFormat('fr-CM', { maximumFractionDigits: 0 }).format(n) + ' FCFA';

  async function handleShare() {
    if (!item) return;
    const url  = window.location.href;
    const text = `Check out "${item.title}" on Bambeh Marketplace — ${url}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: item.title, text, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch {
      // user cancelled share — ignore
    }
  }

  async function handleDelete() {
    if (!item || !window.confirm('Delete this listing? This cannot be undone.')) return;
    const { error: err } = await supabase
      .from('exchange_items')
      .update({ status: 'deleted' })
      .eq('id', item.id)
      .eq('user_id', currentUid!);
    if (err) { alert('Failed to delete. Please try again.'); return; }
    navigate('/exchange');
  }

  // ─── Loading ────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <RefreshCw className="w-6 h-6 text-teal-500 animate-spin" />
    </div>
  );

  // ─── Error ──────────────────────────────────────────────────────
  if (error || !item) return (
    <div className="p-4 space-y-3 max-w-lg mx-auto pt-8">
      <button type="button" onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" /> Back to Exchange
      </button>
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
        <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-red-700 mb-0.5">Item unavailable</p>
          <p className="text-sm text-red-600">{error ?? 'This item no longer exists.'}</p>
        </div>
      </div>
      <button
        onClick={() => navigate('/exchange')}
        className="w-full py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors"
      >
        Browse Exchange Listings
      </button>
    </div>
  );

  const isOwner      = currentUid === item.userId;
  const conditionCls = CONDITION_COLORS[item.condition] ?? 'bg-gray-100 text-gray-700';
  const expiresDays  = item.expiresAt ? daysUntil(item.expiresAt) : null;
  const expiringSoon = expiresDays !== null && expiresDays <= 3 && expiresDays >= 0;

  return (
    /* ✅ pb-32 ensures content never hidden behind fixed footer */
    <div className="max-w-lg mx-auto pb-32">

      {/* ─── Image Carousel ─── */}
      <div className="relative h-72 bg-gray-100 overflow-hidden">
        <button type="button" onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full
            flex items-center justify-center shadow-md hover:bg-white transition-colors">
          <ArrowLeft className="w-4 h-4 text-gray-700" />
        </button>

        <button type="button" onClick={() => setFavorited(v => !v)}
          className="absolute top-4 right-4 z-10 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full
            flex items-center justify-center shadow-md hover:bg-white transition-colors">
          <Heart className={`w-4 h-4 ${favorited ? 'text-red-500 fill-red-500' : 'text-gray-500'}`} />
        </button>

        {item.images.length > 0 ? (
          <>
            <img
              src={item.images[imgIdx]}
              alt={`${item.title} — image ${imgIdx + 1}`}
              className="w-full h-full object-cover"
            />
            {item.images.length > 1 && (
              <>
                <button type="button"
                  onClick={() => setImgIdx(i => (i - 1 + item.images.length) % item.images.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-black/40
                    rounded-full flex items-center justify-center hover:bg-black/60 transition-colors">
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>
                <button type="button"
                  onClick={() => setImgIdx(i => (i + 1) % item.images.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-black/40
                    rounded-full flex items-center justify-center hover:bg-black/60 transition-colors">
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
                  {item.images.map((_, i) => (
                    <button key={i} type="button" onClick={() => setImgIdx(i)}
                      className={`w-2 h-2 rounded-full transition-all ${i === imgIdx ? 'bg-white scale-125' : 'bg-white/50'}`} />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
            <Package className="w-16 h-16" />
            <p className="text-sm text-gray-400">No photos</p>
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* ─── Expiry Banner ─── */}
        {expiringSoon && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-700">
              <span className="font-semibold">Listing expiring soon</span> —{' '}
              {expiresDays === 0 ? 'less than 24 hours left' : `${expiresDays} day${expiresDays !== 1 ? 's' : ''} remaining`}
            </p>
          </div>
        )}

        {/* ─── Title & Meta ─── */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <RefreshCcw className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-bold text-teal-600 uppercase tracking-wide">Exchange</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${conditionCls}`}>
              {item.condition}
            </span>
            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full ml-auto">
              {item.category}
            </span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 leading-tight">{item.title}</h1>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400 flex-wrap">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.location}</span>
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{item.viewCount} views</span>
            {item.offerCount > 0 && (
              <span className="flex items-center gap-1 text-teal-600 font-semibold">
                <Flame className="w-3 h-3" />{item.offerCount} offer{item.offerCount !== 1 ? 's' : ''}
              </span>
            )}
            <span className="ml-auto">{new Date(item.createdAt).toLocaleDateString('fr-CM')}</span>
          </div>
        </div>

        {/* ─── Estimated Value ─── */}
        {item.estimatedValueXAF ? (
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-3">
            <p className="text-sm text-teal-700">
              Estimated value: <span className="font-bold">{formatXAF(item.estimatedValueXAF)}</span>
            </p>
            {item.allowCashSupplement && item.maxCashSupplementXAF && (
              <p className="text-xs text-teal-600 mt-0.5">
                Cash top-up accepted up to {formatXAF(item.maxCashSupplementXAF)}
              </p>
            )}
          </div>
        ) : null}

        {/* ─── Wanted ─── */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <RefreshCcw className="w-4 h-4 text-orange-500" />
            <h3 className="text-sm font-bold text-orange-800">Looking to swap for</h3>
          </div>
          <p className="text-sm text-orange-700 leading-relaxed">{item.wantedItems}</p>
        </div>

        {/* ─── Description ─── */}
        {item.description && (
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-1.5">Description</h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{item.description}</p>
          </div>
        )}

        {/* ─── Owner Card ─── */}
        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-teal-100 overflow-hidden flex items-center justify-center flex-shrink-0">
            {item.ownerAvatar ? (
              <img src={item.ownerAvatar} alt={item.ownerName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-teal-600 font-bold text-sm">
                {item.ownerName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{item.ownerName}</p>
            <p className="text-xs text-gray-400">
              Listed {new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          {isOwner && (
            <span className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded-full font-medium">
              Your listing
            </span>
          )}
        </div>

        {/* ─── Safety Tip ─── */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
          <p className="text-xs text-blue-700 leading-relaxed">
            <span className="font-semibold">Safety tip:</span> Always meet in a public place like a market or
            shopping centre. Never transfer money before seeing the item. Bambeh is not responsible for
            exchange transactions.
          </p>
        </div>
      </div>

      {/* ─── Fixed Bottom Actions ─── */}
      {/* ✅ safe-area-inset-bottom handles Android & iOS notch */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3
        flex gap-2 z-50" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>

        {/* Share */}
        <button type="button" onClick={handleShare}
          className="w-11 h-11 border border-gray-300 rounded-xl flex items-center justify-center
            hover:bg-gray-50 transition-colors flex-shrink-0">
          <Share2 className={`w-5 h-5 ${shared ? 'text-teal-600' : 'text-gray-600'}`} />
        </button>

        {isOwner ? (
          /* Owner actions */
          <>
            <button type="button"
              onClick={() => navigate(`/exchange/edit/${item.id}`)}
              className="flex-1 py-3 border border-teal-300 text-teal-700 rounded-xl font-semibold
                flex items-center justify-center gap-2 hover:bg-teal-50 transition-colors">
              Edit Listing
            </button>
            <button type="button" onClick={handleDelete}
              className="flex-1 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl font-semibold
                flex items-center justify-center gap-2 hover:bg-red-100 transition-colors">
              Delete
            </button>
          </>
        ) : (
          /* Non-owner actions */
          <>
            <button type="button"
              onClick={() => navigate(`/chat?userId=${item.userId}&listingId=${item.id}&type=exchange`)}
              className="flex-1 py-3 border border-teal-300 text-teal-700 rounded-xl font-semibold
                flex items-center justify-center gap-2 hover:bg-teal-50 transition-colors">
              <MessageCircle className="w-4 h-4" />
              Chat
            </button>
            <button type="button"
              onClick={() => navigate(`/exchange/offer/${item.id}`)}
              className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold
                flex items-center justify-center gap-2 transition-colors">
              <RefreshCcw className="w-4 h-4" />
              Make Offer
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ExchangeItem;
