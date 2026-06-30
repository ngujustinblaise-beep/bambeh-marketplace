/**
 * src/pages/FlashDealDetail.tsx ? Bambeh Marketplace
 *
 * FIXES applied:
 *  ? useCountdown: timer ref leaked on hot-reload ? cleanup now uses returned
 *     timerRef correctly; added guard for endsAt being invalid date string.
 *  ? handleClaim: session check destructured incorrectly (data.session vs
 *     data?.session) ? fixed with safe optional chaining.
 *  ? handleClaim: duplicate claims guarded (unique constraint on deal_id+user_id).
 *  ? setDeal optimistic update: used updater function to avoid stale closure.
 *  ? formatXAF: added null guard ? never crashes on undefined price.
 *  ? Share button now opens CompactShareModal instead of doing nothing.
 *  ? BambehImage import: added try/catch ? falls back to plain <img> if custom
 *     component is unavailable in current build.
 *  ? Countdown display: negative hours now clamped to 0.
 *  ? Back button inside image area: used navigate(-1) correctly.
 *  ? Missing aria-labels added to icon-only buttons.
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

const COPY = {
  en: {
    shareDeal: 'Share this deal',
    closeShareSheet: 'Close share sheet',
    invalidDealId: 'Invalid deal ID',
    dealNotFound: 'Deal not found',
    loadingError: 'Loading error',
    return: 'Back',
    expired: 'Expired',
    claimed: 'Claimed',
    claim: 'Claim',
    remaining: 'remaining',
    claimedOf: 'claimed of',
    expiresIn: 'Offer expires in',
    savings: 'Savings:',
    shareThisDeal: 'Share this deal',
    removeFromFavourites: 'Remove from favourites',
    addToFavourites: 'Add to favourites',
    dealClaimed: 'Deal claimed!',
    claimInProgress: 'Claiming...',
    claimDeal: (price: string) => `Claim deal for ${price}`,
    clockLabels: ['H', 'M', 'S'],
    currencyMismatch: 'FCFA',
    invalidDeal: 'Invalid deal ID',
    notFound: 'Deal not found',
  },
  fr: {
    shareDeal: 'Partager cette offre',
    closeShareSheet: 'Fermer la feuille de partage',
    invalidDealId: "Identifiant de l'offre invalide",
    dealNotFound: 'Offre introuvable',
    loadingError: 'Erreur de chargement',
    return: 'Retour',
    expired: 'Expirée',
    claimed: 'Réclamée',
    claim: 'Réclamer',
    remaining: 'restants',
    claimedOf: 'réclamés sur',
    expiresIn: "L'offre expire dans",
    savings: 'Économie :',
    shareThisDeal: 'Partager cette offre',
    removeFromFavourites: 'Retirer des favoris',
    addToFavourites: 'Ajouter aux favoris',
    dealClaimed: 'Offre réclamée !',
    claimInProgress: 'Réclamation en cours...',
    claimDeal: (price: string) => `Réclamer l’offre à ${price}`,
    clockLabels: ['H', 'M', 'S'],
    currencyMismatch: 'FCFA',
    invalidDeal: "Identifiant de l'offre invalide",
    notFound: 'Offre introuvable',
  },
  ar: {
    shareDeal: 'مشاركة العرض',
    closeShareSheet: 'إغلاق نافذة المشاركة',
    invalidDealId: 'معرّف العرض غير صالح',
    dealNotFound: 'العرض غير موجود',
    loadingError: 'خطأ في التحميل',
    return: 'رجوع',
    expired: 'منتهية',
    claimed: 'تمت المطالبة بها',
    claim: 'المطالبة',
    remaining: 'متبقي',
    claimedOf: 'تمت المطالبة من أصل',
    expiresIn: 'ينتهي العرض خلال',
    savings: 'التوفير:',
    shareThisDeal: 'مشاركة هذا العرض',
    removeFromFavourites: 'إزالة من المفضلة',
    addToFavourites: 'إضافة إلى المفضلة',
    dealClaimed: 'تمت المطالبة بالعرض!',
    claimInProgress: 'جارٍ المطالبة...',
    claimDeal: (price: string) => `المطالبة بالعرض مقابل ${price}`,
    clockLabels: ['س', 'د', 'ث'],
    currencyMismatch: 'FCFA',
    invalidDeal: 'معرّف العرض غير صالح',
    notFound: 'العرض غير موجود',
  },
  pidgin: {
    shareDeal: 'Share this deal',
    closeShareSheet: 'Close share sheet',
    invalidDealId: 'Deal ID no correct',
    dealNotFound: 'Deal no dey',
    loadingError: 'Error while loading',
    return: 'Back',
    expired: 'Don expire',
    claimed: 'Don claim am',
    claim: 'Claim',
    remaining: 'left',
    claimedOf: 'claimed out of',
    expiresIn: 'Offer go expire for',
    savings: 'Money wey you save:',
    shareThisDeal: 'Share this deal',
    removeFromFavourites: 'Remove from favourites',
    addToFavourites: 'Add to favourites',
    dealClaimed: 'You don claim the deal!',
    claimInProgress: 'Dey claim...',
    claimDeal: (price: string) => `Claim deal for ${price}`,
    clockLabels: ['H', 'M', 'S'],
    currencyMismatch: 'FCFA',
    invalidDeal: 'Deal ID no correct',
    notFound: 'Deal no dey',
  },
  ful: {
    shareDeal: 'Faw ndee ofa',
    closeShareSheet: 'Suumde galle fawtugol',
    invalidDealId: 'Nanaa ndee ofa ko dowol',
    dealNotFound: 'Ofa woodaa',
    loadingError: 'Horoore e loowdi',
    return: 'Rutto',
    expired: 'Woɗii',
    claimed: 'Ɗaɓɓitiraa',
    claim: 'Ɗaɓɓito',
    remaining: 'heddii',
    claimedOf: 'ɗaɓɓitii e',
    expiresIn: 'Ofa oo woɗa e',
    savings: 'Jafinaande:',
    shareThisDeal: 'Faw ndee ofa',
    removeFromFavourites: 'Ittu e ɓe ndiyam',
    addToFavourites: 'Ɓeydu e ɓe ndiyam',
    dealClaimed: 'A ɗaɓɓitii ofa oo!',
    claimInProgress: 'Dey ɗaɓɓitugo...',
    claimDeal: (price: string) => `Ɗaɓɓito ofa ngam ${price}`,
    clockLabels: ['H', 'M', 'S'],
    currencyMismatch: 'FCFA',
    invalidDeal: 'Nanaa ndee ofa ko dowol',
    notFound: 'Ofa woodaa',
  },
};

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
    setRemaining(calcRemaining());
    timerRef.current = setInterval(() => setRemaining(calcRemaining()), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [calcRemaining]);

  return remaining;
}

function ShareSheet({ url, title, onClose }: { url: string; title: string; onClose: () => void }) {
  const lang = useLang();
  const ui = COPY[lang] ?? COPY[lang === 'ff' ? 'ful' : lang] ?? COPY.en;
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

  const waText = encodeURIComponent(`? ${ui.shareDeal}: ${title}\n${url}`);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-t-2xl w-full max-w-lg p-5 pb-8">
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4"/>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-teal-600" /> {ui.shareThisDeal}
          </h3>
          <button onClick={onClose} aria-label={ui.closeShareSheet}>
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
            {copied ? <><Check className="w-4 h-4" />{ui.copied ?? 'Copied!'}</> : <><Copy className="w-4 h-4" />{ui.copyLink ?? 'Copy Link'}</>}
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

const FlashDealDetail: React.FC = () => {
  const lang = useLang();
  const ui = COPY[lang] ?? COPY[lang === 'ff' ? 'ful' : lang] ?? COPY.en;
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
    if (!id) { setError(ui.invalidDealId); setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbErr } = await supabase
        .from('flash_deals')
        .select('*, vendor_profiles:vendor_id(store_name)')
        .eq('id', id)
        .single();

      if (dbErr || !data) { setError(ui.dealNotFound); return; }

      const vendor = Array.isArray(data.vendor_profiles)
        ? data.vendor_profiles[0]
        : data.vendor_profiles;

      setDeal({
        id: data.id as string,
        listingId: data.listing_id as string,
        vendorId: data.vendor_id as string,
        vendorName: (vendor?.store_name as string) ?? '?',
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
      setError(e instanceof Error ? e.message : ui.loadingError);
    } finally {
      setLoading(false);
    }
  }, [id, ui]);

  useEffect(() => { void load(); }, [load]);

  const countdown = useCountdown(
    deal?.endsAt ?? new Date(Date.now() + 86400000).toISOString(),
  );

  const handleClaim = useCallback(async () => {
    if (!deal) return;
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

      if (!dbErr || dbErr.code === '23505') {
        setClaimed(true);
        setDeal(prev => prev ? { ...prev, claimedSlots: prev.claimedSlots + 1 } : null);
      }
    } catch {
    } finally {
      setClaiming(false);
    }
  }, [deal, navigate]);

  const formatXAF = (n: number | null | undefined) => {
    if (n == null || Number.isNaN(n)) return '?';
    return new Intl.NumberFormat('fr-CM', { maximumFractionDigits: 0 }).format(n) + ' FCFA';
  };

  const pad = (n: number) => String(Math.max(0, n)).padStart(2, '0');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-6 h-6 text-teal-500 animate-spin" />
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="p-4 space-y-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-gray-600"
        >
          <ArrowLeft className="w-4 h-4" /> {ui.return}
        </button>
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-sm text-red-600">{error ?? ui.dealNotFound}</p>
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
      <div className="relative h-72 bg-gray-100 overflow-hidden">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition"
          aria-label={ui.return}
        >
          <ArrowLeft className="w-4 h-4 text-gray-700" />
        </button>
        <button
          type="button"
          onClick={() => setFavorited(v => !v)}
          className="absolute top-4 right-4 z-10 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition"
          aria-label={favorited ? ui.removeFromFavourites : ui.addToFavourites}
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
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl">?</div>
        )}

        <div className="absolute bottom-4 left-4 bg-red-500 text-white px-3 py-1.5 rounded-xl font-bold text-lg shadow-lg">
          -{deal.discountPercent}%
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-bold text-yellow-600 uppercase tracking-wide">
            Flash Deal ? {deal.vendorName}
          </span>
        </div>

        <h1 className="text-xl font-bold text-gray-900">{deal.title}</h1>

        <div className="flex items-center flex-wrap gap-3">
          <p className="text-2xl font-bold text-red-600">{formatXAF(deal.discountedPriceXAF)}</p>
          <p className="text-base text-gray-400 line-through">{formatXAF(deal.originalPriceXAF)}</p>
          <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-0.5 rounded-lg">
            {ui.savings} {formatXAF(deal.originalPriceXAF - deal.discountedPriceXAF)}
          </span>
        </div>

        {!isExpired && (
          <div className="bg-gray-900 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-yellow-400" />
              <p className="text-sm text-yellow-400 font-medium">{ui.expiresIn}</p>
            </div>
            <div className="flex items-center gap-3">
              {[
                { value: countdown.hours, label: ui.clockLabels[0] },
                { value: countdown.minutes, label: ui.clockLabels[1] },
                { value: countdown.seconds, label: ui.clockLabels[2] },
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

        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{deal.claimedSlots} {ui.claimedOf} {deal.totalSlots}</span>
            </div>
            <span className="text-sm font-bold text-gray-700">{slotsLeft} {ui.remaining}</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                fillPercent>= 80 ? 'bg-red-500' : 'bg-teal-500'
              }`}
              style={{ width: `${fillPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">{fillPercent}% {ui.claimed}</p>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed">{deal.description}</p>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-3 max-w-lg mx-auto">
        <button
          type="button"
          onClick={() => setShowShare(true)}
          className="w-12 h-12 border border-gray-300 rounded-xl flex items-center justify-center hover:bg-gray-50 transition"
          aria-label={ui.shareDeal}
        >
          <Share2 className="w-5 h-5 text-gray-600" />
        </button>

        {claimed ? (
          <div className="flex-1 py-3 bg-green-100 border border-green-300 rounded-xl flex items-center justify-center gap-2 text-green-700 font-semibold">
            <CheckCircle className="w-5 h-5" />
            {ui.dealClaimed}
          </div>
        ) : isSoldOut || isExpired ? (
          <div className="flex-1 py-3 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 font-medium">
            {isSoldOut ? ui.expired : ui.expired}
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
            {claiming ? ui.claimInProgress : ui.claimDeal(formatXAF(deal.discountedPriceXAF))}
          </button>
        )}
      </div>

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