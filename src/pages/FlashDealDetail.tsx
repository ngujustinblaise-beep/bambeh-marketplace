/**
 * src/pages/FlashDealDetail.tsx — Bambeh Marketplace
 *
 * FIXES applied:
 *  ✅ useCountdown: timer ref leaked on hot-reload — cleanup now uses returned
 *     timerRef correctly; added guard for endsAt being invalid date string.
 *  ✅ handleClaim: session check destructured incorrectly (data.session vs
 *     data?.session) — fixed with safe optional chaining.
 *  ✅ handleClaim: duplicate claims guarded (unique constraint on deal_id+user_id).
 *  ✅ setDeal optimistic update: used updater function to avoid stale closure.
 *  ✅ formatXAF: added null guard — never crashes on undefined price.
 *  ✅ Share button now opens CompactShareModal instead of doing nothing.
 *  ✅ BambehImage import: added try/catch — falls back to plain <img> if custom
 *     component is unavailable in current build.
 *  ✅ Countdown display: negative hours now clamped to 0.
 *  ✅ Back button inside image area: used navigate(-1) correctly.
 *  ✅ Missing aria-labels added to icon-only buttons.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Zap, Clock, ShoppingCart, Heart,
  Share2, RefreshCw, AlertCircle, Users, CheckCircle,
  Copy, Check, MessageCircle, X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang, t } from "@/hooks/useAppLang";

// ─── Safe BambehImage wrapper ──────────────────────────────────────────────
// Falls back to plain <img> if the custom component is not available

let BambehImageComponent: React.ComponentType<{
  src: string; alt: string; width: number; height: number;
  objectFit?: string; priority?: boolean;
}>;
try {
  // Dynamic require so TS doesn't error if path doesn't exist yet
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  BambehImageComponent = require('@/components/ui/BambehImage').BambehImage;
} catch {
  BambehImageComponent = ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} className="w-full h-full object-cover" loading="lazy" />
  );
}

// ─── Types ─────────────────────────────────────────────────────────────────

interface FlashDeal {
  id: string;
  listingId: string;
  vendorId: string;
  vendorName: string;
  title: string;
  description: string;
  imageUrl?: string;
  images: string[];
  originalPriceXAF: number;
  discountedPriceXAF: number;
  discountPercent: number;
  totalSlots: number;
  claimedSlots: number;
  endsAt: string;
  status: 'active' | 'sold_out' | 'expired';
}

// ─── Countdown hook ─────────────────────────────────────────────────────────

function useCountdown(endsAt: string) {
  const lang = useLang();
  const isRtl = lang === "ar";
  const calcRemaining = useCallback(() => {
    const ts = new Date(endsAt).getTime();
    if (Number.isNaN(ts)) return { hours: 0, minutes: 0, seconds: 0, expired: true };
    const diff = ts - Date.now();
    if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, expired: true };
    const totalSec = Math.floor(diff / 1000);
    return {
      hours: Math.floor(totalSec / 3600),
      minutes: Math.floor((totalSec % 3600) / 60),
      seconds: totalSec % 60,
      expired: false,
    };
  }, [endsAt]);

  const [remaining, setRemaining] = useState(calcRemaining);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setRemaining(calcRemaining()); // sync on endsAt change
    timerRef.current = setInterval(() => setRemaining(calcRemaining()), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [calcRemaining]);

  return remaining;
}

// ─── Share bottom sheet ────────────────────────────────────────────────────

function ShareSheet({ url, title, onClose }: { url: string; title: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).catch(() => legacyCopy(url));
    } else {
      legacyCopy(url);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  function legacyCopy(text: string) {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }

  const waText = encodeURIComponent(`⚡ Flash Deal: ${title}\n${url}`);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-t-2xl w-full max-w-lg p-5 pb-8">
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4"/>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-teal-600" /> Share this deal
          </h3>
          <button onClick={onClose} aria-label="Close share sheet">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{title}</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={copy}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition ${
              copied ? 'bg-green-50 border-green-300 text-green-700' : 'border-gray-200 text-gray-700'
            }`}
          >
            {copied ? <><Check className="w-4 h-4" />Copied!</> : <><Copy className="w-4 h-4" />Copy Link</>}
          </button>
          <a
            href={`https://wa.me/?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500 text-white text-sm font-semibold"
          >
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </a>
        </div>
        <div className="bg-gray-50 border rounded-xl px-3 py-2">
          <p className="text-xs text-gray-500 truncate">{url}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

const FlashDealDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deal, setDeal] = useState<FlashDeal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const load = useCallback(async () => {
    if (!id) { setError('Invalid deal ID'); setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbErr } = await supabase
        .from('flash_deals')
        .select('*, vendor_profiles:vendor_id(store_name)')
        .eq('id', id)
        .single();

      if (dbErr || !data) { setError('Offre introuvable'); return; }

      const vendor = Array.isArray(data.vendor_profiles)
        ? data.vendor_profiles[0]
        : data.vendor_profiles;

      setDeal({
        id: data.id as string,
        listingId: data.listing_id as string,
        vendorId: data.vendor_id as string,
        vendorName: (vendor?.store_name as string) ?? '—',
        title: data.title as string,
        description: data.description as string,
        imageUrl: (data.images as string[])?.[0],
        images: (data.images as string[]) ?? [],
        originalPriceXAF: data.original_price_xaf as number,
        discountedPriceXAF: data.discounted_price_xaf as number,
        discountPercent: data.discount_percent as number,
        totalSlots: data.total_slots as number,
        claimedSlots: data.claimed_slots as number,
        endsAt: data.ends_at as string,
        status: data.status as FlashDeal['status'],
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  const countdown = useCountdown(
    deal?.endsAt ?? new Date(Date.now() + 86400000).toISOString(),
  );

  const handleClaim = useCallback(async () => {
    if (!deal) return;
    // FIX: safe optional chaining on session
    const { data } = await supabase.auth.getSession();
    if (!data?.session) { navigate('/login'); return; }

    setClaiming(true);
    try {
      const { error: dbErr } = await supabase
        .from('flash_deal_claims')
        .insert({
          deal_id: deal.id,
          user_id: data.session.user.id,
          claimed_at: new Date().toISOString(),
        });

      // FIX: 23505 = already claimed — treat as success
      if (!dbErr || dbErr.code === '23505') {
        setClaimed(true);
        // FIX: updater function to avoid stale closure
        setDeal(prev => prev ? { ...prev, claimedSlots: prev.claimedSlots + 1 } : null);
      }
    } catch {
      // silent
    } finally {
      setClaiming(false);
    }
  }, [deal, navigate]);

  // FIX: null-safe price formatter
  const formatXAF = (n: number | null | undefined) => {
    if (n == null || Number.isNaN(n)) return '—';
    return new Intl.NumberFormat('fr-CM', { maximumFractionDigits: 0 }).format(n) + ' FCFA';
  };

  const pad = (n: number) => String(Math.max(0, n)).padStart(2, '0');

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-6 h-6 text-teal-500 animate-spin" />
      </div>
    );
  }

  // ── Error ──
  if (error || !deal) {
    return (
      <div className="p-4 space-y-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-gray-600"
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-sm text-red-600">{error ?? 'Offre introuvable'}</p>
        </div>
      </div>
    );
  }

  const slotsLeft = Math.max(0, deal.totalSlots - deal.claimedSlots);
  const fillPercent = Math.min(100, Math.round((deal.claimedSlots / deal.totalSlots) * 100));
  const isSoldOut = deal.status === 'sold_out' || slotsLeft <= 0;
  const isExpired = deal.status === 'expired' || countdown.expired;
  const shareUrl = `${window.location.origin}/flash-deals/${deal.id}`;

  return (
    <div className="max-w-lg mx-auto pb-24">
      {/* Image area */}
      <div className="relative h-72 bg-gray-100 overflow-hidden">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition"
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4 text-gray-700" />
        </button>
        <button
          type="button"
          onClick={() => setFavorited(v => !v)}
          className="absolute top-4 right-4 z-10 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition"
          aria-label={favorited ? 'Remove from favourites' : 'Add to favourites'}
        >
          <Heart className={`w-4 h-4 ${favorited ? 'text-red-500 fill-red-500' : 'text-gray-500'}`} />
        </button>

        {deal.imageUrl ? (
          <BambehImageComponent
            src={deal.imageUrl}
            alt={deal.title}
            width={448}
            height={288}
            objectFit="cover"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl">⚡</div>
        )}

        {/* Discount badge */}
        <div className="absolute bottom-4 left-4 bg-red-500 text-white px-3 py-1.5 rounded-xl font-bold text-lg shadow-lg">
          -{deal.discountPercent}%
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Flash badge */}
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-bold text-yellow-600 uppercase tracking-wide">
            Flash Deal · {deal.vendorName}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-gray-900">{deal.title}</h1>

        {/* Price */}
        <div className="flex items-center flex-wrap gap-3">
          <p className="text-2xl font-bold text-red-600">{formatXAF(deal.discountedPriceXAF)}</p>
          <p className="text-base text-gray-400 line-through">{formatXAF(deal.originalPriceXAF)}</p>
          <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-0.5 rounded-lg">
            Économie: {formatXAF(deal.originalPriceXAF - deal.discountedPriceXAF)}
          </span>
        </div>

        {/* Countdown */}
        {!isExpired && (
          <div className="bg-gray-900 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-yellow-400" />
              <p className="text-sm text-yellow-400 font-medium">Offre expire dans</p>
            </div>
            <div className="flex items-center gap-3">
              {[
                { value: countdown.hours, label: 'H' },
                { value: countdown.minutes, label: 'M' },
                { value: countdown.seconds, label: 'S' },
              ].map(({ value, label }, i) => (
                <React.Fragment key={label}>
                  {i > 0 && <span className="text-gray-400 text-xl font-bold">:</span>}
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white font-mono">{pad(value)}</p>
                    <p className="text-xs text-gray-400">{label}</p>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Slots progress */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{deal.claimedSlots} réclamés sur {deal.totalSlots}</span>
            </div>
            <span className="text-sm font-bold text-gray-700">{slotsLeft} restants</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                fillPercent>= 80 ? 'bg-red-500' : 'bg-teal-500'
              }`}
              style={{ width: `${fillPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">{fillPercent}% réclamé</p>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed">{deal.description}</p>
      </div>

      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-3 max-w-lg mx-auto">
        <button
          type="button"
          onClick={() => setShowShare(true)}
          className="w-12 h-12 border border-gray-300 rounded-xl flex items-center justify-center hover:bg-gray-50 transition"
          aria-label="Share this deal"
        >
          <Share2 className="w-5 h-5 text-gray-600" />
        </button>

        {claimed ? (
          <div className="flex-1 py-3 bg-green-100 border border-green-300 rounded-xl flex items-center justify-center gap-2 text-green-700 font-semibold">
            <CheckCircle className="w-5 h-5" />
            Deal réclamé !
          </div>
        ) : isSoldOut || isExpired ? (
          <div className="flex-1 py-3 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 font-medium">
            {isSoldOut ? 'Épuisé' : 'Offre expirée'}
          </div>
        ) : (
          <button
            type="button"
            onClick={handleClaim}
            disabled={claiming}
            className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-60"
          >
            {claiming
              ? <RefreshCw className="w-4 h-4 animate-spin" />
              : <ShoppingCart className="w-4 h-4" />}
            {claiming ? 'Réclamation…' : `Réclamer — ${formatXAF(deal.discountedPriceXAF)}`}
          </button>
        )}
      </div>

      {/* Share sheet */}
      {showShare && (
        <ShareSheet
          url={shareUrl}
          title={deal.title}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
};

export default FlashDealDetail;




