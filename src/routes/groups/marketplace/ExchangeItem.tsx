/**
 * src/pages/ExchangeItem.tsx — Bambeh Marketplace
 *
 * ✅ Full i18n: en, fr, ha, ar, pcm, ff
 * ✅ Image carousel with dot indicators
 * ✅ Live offer count via realtime
 * ✅ increment_exchange_view RPC
 * ✅ Owner: Edit / Delete / Renew
 * ✅ Non-owner: Chat / Make Offer
 * ✅ Share via Web Share API + clipboard fallback
 * ✅ Safe-area bottom padding
 * ✅ Expiry countdown banner (≤ 3 days)
 * ✅ Estimated value + cash supplement info
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Eye, MessageCircle,
  RefreshCw, AlertCircle, Heart, Share2, Package,
  ChevronLeft, ChevronRight, Clock, Flame, ArrowLeftRight,
  CheckCircle, Pencil, Trash2, RotateCcw,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';
import { renewExchangeListing } from '@/services/exchange-expiry-reminder';

// ─── i18n ──────────────────────────────────────────────────────────────────────
const STRINGS = {
  en: {
    backToExchange: 'Back to Exchange',
    itemUnavailable: 'Item unavailable',
    noLongerExists: 'This item no longer exists.',
    browseListing: 'Browse Exchange Listings',
    exchange: 'Exchange',
    views: 'views',
    offer: (n: number) => `${n} offer${n !== 1 ? 's' : ''}`,
    noPhotos: 'No photos',
    estimatedValue: 'Estimated value:',
    cashTopUp: 'Cash top-up accepted up to',
    lookingToSwap: 'Looking to swap for',
    description: 'Description',
    listed: 'Listed',
    yourListing: 'Your listing',
    safetyTip: 'Safety tip:',
    safetyBody: 'Always meet in a public place like a market or shopping centre. Never transfer money before seeing the item. Bambeh is not responsible for exchange transactions.',
    share: 'Share',
    copied: 'Link copied!',
    chat: 'Chat',
    makeOffer: 'Make Offer',
    editListing: 'Edit',
    deleteListing: 'Delete',
    renewListing: 'Renew',
    deleteConfirm: 'Delete this listing? This cannot be undone.',
    deleteFailed: 'Failed to delete. Please try again.',
    renewSuccess: 'Listing renewed for 30 more days!',
    renewFailed: 'Failed to renew. Please try again.',
    expiresIn: (d: number) => d === 0 ? 'Expires in less than 24 hours' : `${d} day${d !== 1 ? 's' : ''} remaining`,
    expiringSoon: 'Listing expiring soon —',
    openToOffers: 'Open to offers',
  },
  fr: {
    backToExchange: 'Retour aux échanges',
    itemUnavailable: 'Article non disponible',
    noLongerExists: 'Cet article n\'existe plus.',
    browseListing: 'Parcourir les annonces',
    exchange: 'Échange',
    views: 'vues',
    offer: (n: number) => `${n} offre${n !== 1 ? 's' : ''}`,
    noPhotos: 'Pas de photos',
    estimatedValue: 'Valeur estimée :',
    cashTopUp: 'Complément en espèces accepté jusqu\'à',
    lookingToSwap: 'Cherche à échanger contre',
    description: 'Description',
    listed: 'Publié le',
    yourListing: 'Votre annonce',
    safetyTip: 'Conseil sécurité :',
    safetyBody: 'Rencontrez-vous toujours dans un lieu public. Ne transférez jamais d\'argent avant d\'avoir vu l\'objet. Bambeh n\'est pas responsable des transactions d\'échange.',
    share: 'Partager',
    copied: 'Lien copié !',
    chat: 'Chat',
    makeOffer: 'Faire une offre',
    editListing: 'Modifier',
    deleteListing: 'Supprimer',
    renewListing: 'Renouveler',
    deleteConfirm: 'Supprimer cette annonce ? Cette action est irréversible.',
    deleteFailed: 'Échec de la suppression. Réessayez.',
    renewSuccess: 'Annonce renouvelée pour 30 jours de plus !',
    renewFailed: 'Échec du renouvellement. Réessayez.',
    expiresIn: (d: number) => d === 0 ? 'Expire dans moins de 24 heures' : `${d} jour${d !== 1 ? 's' : ''} restant${d !== 1 ? 's' : ''}`,
    expiringSoon: 'Annonce expire bientôt —',
    openToOffers: 'Ouvert aux offres',
  },
  ha: {
    backToExchange: 'Komawa Musanya',
    itemUnavailable: 'Abu ba ya nan',
    noLongerExists: 'Wannan abin ba ya nan.',
    browseListing: 'Duba Jerin Musanya',
    exchange: 'Musanya',
    views: 'kallo',
    offer: (n: number) => `tayin ${n}`,
    noPhotos: 'Babu hotuna',
    estimatedValue: 'Ƙimar da ake ɗauka:',
    cashTopUp: 'An yarda da ƙarin kuɗi har',
    lookingToSwap: 'Ina neman musanya da',
    description: 'Bayani',
    listed: 'An buga',
    yourListing: 'Jerin ka',
    safetyTip: 'Shawara ta aminci:',
    safetyBody: 'Koyaushe ku sadu a wurin jama\'a. Kada ka canja kuɗi kafin ganin abu. Bambeh ba ya da alhakin ma\'amaloli musanya.',
    share: 'Raba',
    copied: 'An kwafi hanyar!',
    chat: 'Tattauna',
    makeOffer: 'Yi Tayin',
    editListing: 'Gyara',
    deleteListing: 'Goge',
    renewListing: 'Sabunta',
    deleteConfirm: 'Share wannan jerin? Ba za a iya dawo da shi ba.',
    deleteFailed: 'Share ya kasa. Sake gwadawa.',
    renewSuccess: 'An sabunta jerin don ƙarin kwanaki 30!',
    renewFailed: 'Sabuntawa ya kasa. Sake gwadawa.',
    expiresIn: (d: number) => d === 0 ? 'Ya ƙare a cikin ƙasa da 24h' : `${d} kwanaki suka rage`,
    expiringSoon: 'Jerin yana ƙarewa —',
    openToOffers: 'Buɗe ga tayin',
  },
  ar: {
    backToExchange: 'العودة إلى التبادل',
    itemUnavailable: 'العنصر غير متاح',
    noLongerExists: 'هذا العنصر لم يعد موجودًا.',
    browseListing: 'تصÙح قوائم التبادل',
    exchange: 'تبادل',
    views: 'مشاهدة',
    offer: (n: number) => `${n} عرض`,
    noPhotos: 'لا توجد صور',
    estimatedValue: 'القيمة التقديرية:',
    cashTopUp: 'يÙقبل مكمل نقدي حتى',
    lookingToSwap: 'يبحث للمبادلة بـ',
    description: 'الوصÙ',
    listed: 'نÙشر Ùي',
    yourListing: 'إعلانك',
    safetyTip: 'نصيحة الأمان:',
    safetyBody: 'التقÙ دائمًا Ùي مكان عام. لا تحوّل الأموال قبل رؤية العنصر. Bambeh غير مسؤول عن معاملات التبادل.',
    share: 'مشاركة',
    copied: 'تم نسخ الرابط!',
    chat: 'محادثة',
    makeOffer: 'قدّم عرضًا',
    editListing: 'تعديل',
    deleteListing: 'حذÙ',
    renewListing: 'تجديد',
    deleteConfirm: 'حذÙ هذا الإعلان؟ لا يمكن التراجع عنه.',
    deleteFailed: 'Ùشل الحذÙ. حاول مجددًا.',
    renewSuccess: 'تم تجديد الإعلان لـ 30 يومًا إضاÙية!',
    renewFailed: 'Ùشل التجديد. حاول مجددًا.',
    expiresIn: (d: number) => d === 0 ? 'تنتهي Ùي أقل من 24 ساعة' : `${d} يوم متبقي`,
    expiringSoon: 'الإعلان ينتهي قريبًا —',
    openToOffers: 'مÙتوح للعروض',
  },
  pcm: {
    backToExchange: 'Go Back Exchange',
    itemUnavailable: 'Item no dey',
    noLongerExists: 'This item don disappear.',
    browseListing: 'See Exchange Listings',
    exchange: 'Exchange',
    views: 'views',
    offer: (n: number) => `${n} offer${n !== 1 ? 's' : ''}`,
    noPhotos: 'No photo',
    estimatedValue: 'How much e worth:',
    cashTopUp: 'Cash add-on dey accepted up to',
    lookingToSwap: 'E dey find to swap for',
    description: 'Description',
    listed: 'Posted',
    yourListing: 'Your listing',
    safetyTip: 'Safety tip:',
    safetyBody: 'Always meet for public place. No send money before you see the item. Bambeh no responsible for exchange wahala.',
    share: 'Share',
    copied: 'Link don copy!',
    chat: 'Chat',
    makeOffer: 'Make Offer',
    editListing: 'Edit',
    deleteListing: 'Delete',
    renewListing: 'Renew',
    deleteConfirm: 'Delete this listing? You no fit undo am.',
    deleteFailed: 'Delete fail. Try again.',
    renewSuccess: 'Listing don renew for 30 more days!',
    renewFailed: 'Renew fail. Try again.',
    expiresIn: (d: number) => d === 0 ? 'E go expire in less than 24h' : `${d} day${d !== 1 ? 's' : ''} remain`,
    expiringSoon: 'Listing go expire soon —',
    openToOffers: 'Open to offers',
  },
  ff: {
    backToExchange: 'Ɓeto Fewtere',
    itemUnavailable: 'Coftal alaa',
    noLongerExists: 'Coftal ngol yahii.',
    browseListing: 'Yiy Coftali Fewtere',
    exchange: 'Fewtere',
    views: 'yiyaama',
    offer: (n: number) => `jaɓde ${n}`,
    noPhotos: 'Alaa natal',
    estimatedValue: 'Njaru keɓnaaɗo:',
    cashTopUp: 'Kaalis njuɓɓudi heɓtaa haa',
    lookingToSwap: 'Ɓeytata fewteraade e',
    description: 'Haalannde',
    listed: 'Hollinaama',
    yourListing: 'Coftaldi maa',
    safetyTip: 'Taƴre cellal:',
    safetyBody: 'Njaarno toon e nokku ɓurngo wuurde. Mos kaalis yeeso yiyugo coftal. Bambeh alaa jaɓgol fewtere.',
    share: 'Weccit',
    copied: 'Lowe yawritaa!',
    chat: 'Haaldude',
    makeOffer: 'Jaɓdo',
    editListing: 'Waylito',
    deleteListing: 'Momtu',
    renewListing: 'Hesɗito',
    deleteConfirm: 'Momtu coftaldi? Waawaa artirde.',
    deleteFailed: 'Momtugol hiɓi. Heɓto katin.',
    renewSuccess: 'Coftaldi hesɗitinaama ñalawma 30!',
    renewFailed: 'Hesɗitugol hiɓi. Heɓto katin.',
    expiresIn: (d: number) => d === 0 ? 'Timmii hannde' : `${d} ñalawma teddii`,
    expiringSoon: 'Coftaldi ngo timmotoo —',
    openToOffers: 'Udditii jaɓde',
  },
} as const;

type Lang = keyof typeof STRINGS;

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
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

const ExchangeItem: React.FC = () => {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const lang     = (useLang() as Lang) || 'en';
  const s        = STRINGS[lang] ?? STRINGS.en;
  const isRtl    = lang === 'ar';

  const [item,       setItem]       = useState<ExchangeItemData | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [favorited,  setFavorited]  = useState(false);
  const [imgIdx,     setImgIdx]     = useState(0);
  const [currentUid, setCurrentUid] = useState<string | null>(null);
  const [shared,     setShared]     = useState(false);
  const [renewing,   setRenewing]   = useState(false);
  const [renewMsg,   setRenewMsg]   = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

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
      const { data, error: dbErr } = await supabase
        .from('exchange_items')
        .select('*')
        .eq('id', id)
        .single();

      if (dbErr || !data) { setError(s.noLongerExists); return; }

      // Owner profile fetched SEPARATELY. Embedding profiles:user_id needs a FK
      // relationship that may not exist; PostgREST turns that into an error that
      // was wrongly showing "item no longer exists". This is best-effort now:
      // the item always displays even if the profile lookup fails.
      let profile: any = null;
      try {
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user_id)
          .maybeSingle();
        profile = prof;
      } catch { /* non-fatal */ }
      setItem({
        id:                  data.id as string,
        userId:              data.user_id as string,
        ownerName:           profile?.display_name ?? profile?.full_name ?? profile?.username ?? 'Bambeh User',
        ownerAvatar:         profile?.avatar_url ?? profile?.avatar ?? undefined,
        title:               data.title as string,
        description:         (data.description as string) ?? '',
        category:            data.category as string,
        condition:           data.condition as string,
        images:              (data.images as string[]) ?? [],
        location:            (data.location as string) ?? '—',
        wantedItems:         (data.wanted_items as string) ?? s.openToOffers,
        estimatedValueXAF:   data.estimated_value_xaf as number | undefined,
        allowCashSupplement: Boolean(data.allow_cash_supplement),
        maxCashSupplementXAF: data.max_cash_supplement_xaf as number | undefined,
        viewCount:           (data.view_count as number) ?? 0,
        offerCount:          (data.offer_count as number) ?? 0,
        status:              data.status as string,
        createdAt:           data.created_at as string,
        expiresAt:           data.expires_at as string | undefined,
      });
      await supabase.rpc('increment_exchange_view', { item_id: id });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load item.');
    } finally {
      setLoading(false);
    }
  }, [id, s]);

  useEffect(() => {
    void load();
    if (id) {
      channelRef.current = supabase
        .channel(`exchange_offers_${id}`)
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'exchange_offers', filter: `exchange_item_id=eq.${id}` },
          () => setItem(prev => prev ? { ...prev, offerCount: prev.offerCount + 1 } : prev)
        )
        .subscribe();
    }
    return () => {
      if (channelRef.current) { supabase.removeChannel(channelRef.current); channelRef.current = null; }
    };
  }, [load, id]);

  const formatXAF = (n: number) =>
    new Intl.NumberFormat('fr-CM', { maximumFractionDigits: 0 }).format(n) + ' FCFA';

  async function handleShare() {
    if (!item) return;
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: item.title, text: `Check out "${item.title}" on Bambeh — ${url}`, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 2500);
      }
    } catch { /* user cancelled */ }
  }

  async function handleDelete() {
    if (!item || !window.confirm(s.deleteConfirm)) return;
    const { error: err } = await supabase
      .from('exchange_items')
      .update({ status: 'deleted' })
      .eq('id', item.id)
      .eq('user_id', currentUid!);
    if (err) { alert(s.deleteFailed); return; }
    navigate('/exchange');
  }

  async function handleRenew() {
    if (!item) return;
    setRenewing(true);
    setRenewMsg(null);
    const { error: err } = await renewExchangeListing(item.id);
    setRenewing(false);
    if (err) {
      setRenewMsg(s.renewFailed);
    } else {
      setRenewMsg(s.renewSuccess);
      void load();
    }
    setTimeout(() => setRenewMsg(null), 3000);
  }

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <RefreshCw className="w-6 h-6 text-teal-500 animate-spin" />
    </div>
  );

  // ─── Error ──────────────────────────────────────────────────────────────────
  if (error || !item) return (
    <div className={`p-4 space-y-3 max-w-lg mx-auto pt-8 ${isRtl ? 'rtl' : 'ltr'}`}>
      <button type="button" onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" /> {s.backToExchange}
      </button>
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
        <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-red-700 mb-0.5">{s.itemUnavailable}</p>
          <p className="text-sm text-red-600">{error ?? s.noLongerExists}</p>
        </div>
      </div>
      <button onClick={() => navigate('/exchange')}
        className="w-full py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors">
        {s.browseListing}
      </button>
    </div>
  );

  const isOwner      = currentUid === item.userId;
  const conditionCls = CONDITION_COLORS[item.condition] ?? 'bg-gray-100 text-gray-700';
  const expiresDays  = item.expiresAt ? daysUntil(item.expiresAt) : null;
  const expiringSoon = expiresDays !== null && expiresDays <= 3 && expiresDays >= 0;

  return (
    <div className={`max-w-lg mx-auto pb-32 ${isRtl ? 'rtl' : 'ltr'}`}>

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
          <Heart className={`w-4 h-4 transition-colors ${favorited ? 'text-red-500 fill-red-500' : 'text-gray-500'}`} />
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
                  onClick={e => { e.stopPropagation(); setImgIdx(i => (i - 1 + item.images.length) % item.images.length); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-black/40
                    rounded-full flex items-center justify-center hover:bg-black/60 transition-colors">
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>
                <button type="button"
                  onClick={e => { e.stopPropagation(); setImgIdx(i => (i + 1) % item.images.length); }}
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
                <div className="absolute bottom-3 right-4 z-10 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                  {imgIdx + 1}/{item.images.length}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
            <Package className="w-16 h-16" />
            <p className="text-sm text-gray-400">{s.noPhotos}</p>
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* ─── Renew feedback ─── */}
        {renewMsg && (
          <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${renewMsg === s.renewSuccess ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
            {renewMsg === s.renewSuccess ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            {renewMsg}
          </div>
        )}

        {/* ─── Expiry banner ─── */}
        {expiringSoon && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-700">
              <span className="font-semibold">{s.expiringSoon}</span>{' '}
              {s.expiresIn(expiresDays!)}
            </p>
            {isOwner && (
              <button
                onClick={handleRenew}
                disabled={renewing}
                className="ml-auto text-xs font-semibold text-amber-700 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-lg hover:bg-amber-200 transition-colors disabled:opacity-50"
              >
                {renewing ? '…' : s.renewListing}
              </button>
            )}
          </div>
        )}

        {/* ─── Title & meta ─── */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ArrowLeftRight className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-bold text-teal-600 uppercase tracking-wide">{s.exchange}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${conditionCls}`}>{item.condition}</span>
            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full ml-auto">{item.category}</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 leading-tight">{item.title}</h1>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400 flex-wrap">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.location}</span>
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{item.viewCount} {s.views}</span>
            {item.offerCount > 0 && (
              <span className="flex items-center gap-1 text-teal-600 font-semibold">
                <Flame className="w-3 h-3" />{s.offer(item.offerCount)}
              </span>
            )}
            <span className="ml-auto">{new Date(item.createdAt).toLocaleDateString('fr-CM')}</span>
          </div>
        </div>

        {/* ─── Estimated value ─── */}
        {item.estimatedValueXAF ? (
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-3">
            <p className="text-sm text-teal-700">
              {s.estimatedValue} <span className="font-bold">{formatXAF(item.estimatedValueXAF)}</span>
            </p>
            {item.allowCashSupplement && item.maxCashSupplementXAF && (
              <p className="text-xs text-teal-600 mt-0.5">
                {s.cashTopUp} {formatXAF(item.maxCashSupplementXAF)}
              </p>
            )}
          </div>
        ) : null}

        {/* ─── Wanted ─── */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <ArrowLeftRight className="w-4 h-4 text-orange-500" />
            <h3 className="text-sm font-bold text-orange-800">{s.lookingToSwap}</h3>
          </div>
          <p className="text-sm text-orange-700 leading-relaxed">{item.wantedItems}</p>
        </div>

        {/* ─── Description ─── */}
        {item.description && (
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-1.5">{s.description}</h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{item.description}</p>
          </div>
        )}

        {/* ─── Owner card ─── */}
        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-teal-100 overflow-hidden flex items-center justify-center flex-shrink-0">
            {item.ownerAvatar ? (
              <img src={item.ownerAvatar} alt={item.ownerName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-teal-600 font-bold text-sm">{item.ownerName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{item.ownerName}</p>
            <p className="text-xs text-gray-400">
              {s.listed} {new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          {isOwner && (
            <span className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded-full font-medium">{s.yourListing}</span>
          )}
        </div>

        {/* ─── Safety tip ─── */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
          <p className="text-xs text-blue-700 leading-relaxed">
            <span className="font-semibold">{s.safetyTip}</span> {s.safetyBody}
          </p>
        </div>
      </div>

      {/* ─── Fixed bottom action bar ─── */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-2 z-50"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
      >
        {/* Share button */}
        <button type="button" onClick={handleShare}
          className={`w-11 h-11 border rounded-xl flex items-center justify-center
            hover:bg-gray-50 transition-colors flex-shrink-0 ${shared ? 'border-teal-400 bg-teal-50' : 'border-gray-300'}`}
          title={shared ? s.copied : s.share}>
          {shared ? <CheckCircle className="w-5 h-5 text-teal-600" /> : <Share2 className="w-5 h-5 text-gray-600" />}
        </button>

        {isOwner ? (
          <>
            {expiringSoon && (
              <button type="button" onClick={handleRenew} disabled={renewing}
                className="flex-1 py-3 border border-amber-300 text-amber-700 rounded-xl font-semibold
                  flex items-center justify-center gap-2 hover:bg-amber-50 transition-colors disabled:opacity-50">
                <RotateCcw className="w-4 h-4" />{s.renewListing}
              </button>
            )}
            <button type="button" onClick={() => navigate(`/exchange/edit/${item.id}`)}
              className="flex-1 py-3 border border-teal-300 text-teal-700 rounded-xl font-semibold
                flex items-center justify-center gap-2 hover:bg-teal-50 transition-colors">
              <Pencil className="w-4 h-4" />{s.editListing}
            </button>
            <button type="button" onClick={handleDelete}
              className="flex-1 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl font-semibold
                flex items-center justify-center gap-2 hover:bg-red-100 transition-colors">
              <Trash2 className="w-4 h-4" />{s.deleteListing}
            </button>
          </>
        ) : (
          <>
            <button type="button"
              onClick={() => navigate(`/chat?userId=${item.userId}&listingId=${item.id}&type=exchange`)}
              className="flex-1 py-3 border border-teal-300 text-teal-700 rounded-xl font-semibold
                flex items-center justify-center gap-2 hover:bg-teal-50 transition-colors">
              <MessageCircle className="w-4 h-4" />{s.chat}
            </button>
            <button type="button"
              onClick={() => navigate(`/exchange/offer/${item.id}`)}
              className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold
                flex items-center justify-center gap-2 transition-colors shadow-sm">
              <ArrowLeftRight className="w-4 h-4" />{s.makeOffer}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ExchangeItem;



