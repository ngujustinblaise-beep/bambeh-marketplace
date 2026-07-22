// BAMBEH_DEPLOY_TOKEN__GROUPBUYINGDETAIL_FIX169_CLEAN
/**
 * src/pages/GroupBuyingDetail.tsx ? Bambeh Marketplace
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Check, ShoppingCart, Copy, Share2, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from "@/hooks/useAppLang";

function isUUID(s: string) {
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

const COPY = {
  en: {
    back: 'Back',
    dealNotFound: 'Deal not found',
    browseGroupDeals: 'Browse group deals',
    goBack: 'Go back',
    linkCopied: 'Link copied',
    copyLink: 'Copy link',
    categoryLabel: 'Category',
    save: 'Save',
    joined: 'joined',
    peopleNeeded: (n: number) => `${n} more ${n === 1 ? 'person' : 'people'} needed to activate deal`,
    dealActivated: 'Deal activated!',
    youSave: 'You save',
    timeLeft: 'Time Left',
    aboutThisDeal: 'About this Deal',
    howGroupBuyingWorks: 'How Group Buying Works',
    step1Title: 'Join the deal',
    step1Desc: 'Tap Join below to reserve your spot',
    step2Title: 'Share with friends',
    step2Desc: 'More participants = deal activates sooner',
    step3Title: 'Deal activates',
    step3Desc: (n: number, pct: number) => `When ${n} people join, everyone gets ${pct}% off`,
    step4Title: 'Pay & receive',
    step4Desc: 'Payment collected and order placed together',
    joinedDeal: 'You have joined this deal!',
    joinedDealSubtitle: "We'll notify you when the deal activates.",
    shareThisDeal: 'Share This Deal',
    joinGroupDeal: (pct: number) => `Join Group Deal ? Save ${pct}%`,
    joining: 'Joining?',
    loading: 'Loading',
  },
  fr: {
    back: 'Retour',
    dealNotFound: "Offre introuvable",
    browseGroupDeals: 'Parcourir les offres groupées',
    goBack: 'Retour',
    linkCopied: 'Lien copié',
    copyLink: 'Copier le lien',
    categoryLabel: 'Catégorie',
    save: 'Économie',
    joined: 'inscrits',
    peopleNeeded: (n: number) => `${n} ${n === 1 ? 'personne' : 'personnes'} de plus pour activer l’offre`,
    dealActivated: 'Offre activée !',
    youSave: 'Vous économisez',
    timeLeft: 'Temps restant',
    aboutThisDeal: 'À propos de cette offre',
    howGroupBuyingWorks: 'Comment fonctionne l’achat groupé',
    step1Title: 'Rejoignez l’offre',
    step1Desc: 'Appuyez sur Rejoindre ci-dessous pour réserver votre place',
    step2Title: 'Partagez avec vos amis',
    step2Desc: 'Plus il y a de participants, plus l’offre s’active vite',
    step3Title: 'L’offre s’active',
    step3Desc: (n: number, pct: number) => `Lorsque ${n} personnes rejoignent, tout le monde bénéficie de ${pct} % de réduction`,
    step4Title: 'Payer et recevoir',
    step4Desc: 'Le paiement est collecté et la commande est passée ensemble',
    joinedDeal: 'Vous avez rejoint cette offre !',
    joinedDealSubtitle: 'Nous vous informerons lorsque l’offre sera activée.',
    shareThisDeal: 'Partager cette offre',
    joinGroupDeal: (pct: number) => `Rejoindre l’offre groupée ? Économisez ${pct} %`,
    joining: 'En cours...',
    loading: 'Chargement',
  },
  ar: {
    back: 'رجوع',
    dealNotFound: 'العرض غير موجود',
    browseGroupDeals: 'تصفح العروض الجماعية',
    goBack: 'رجوع',
    linkCopied: 'تم نسخ الرابط',
    copyLink: 'نسخ الرابط',
    categoryLabel: 'الفئة',
    save: 'التوفير',
    joined: 'انضموا',
    peopleNeeded: (n: number) => `تحتاج ${n} ${n === 1 ? 'شخصًا' : 'أشخاص'} إضافيًا لتفعيل العرض`,
    dealActivated: 'تم تفعيل العرض!',
    youSave: 'توفّر',
    timeLeft: 'الوقت المتبقي',
    aboutThisDeal: 'حول هذا العرض',
    howGroupBuyingWorks: 'كيف يعمل الشراء الجماعي',
    step1Title: 'انضم إلى العرض',
    step1Desc: 'اضغط على انضم بالأسفل لحجز مكانك',
    step2Title: 'شاركه مع الأصدقاء',
    step2Desc: 'كلما زاد عدد المشاركين، تفعّل العرض أسرع',
    step3Title: 'تفعيل العرض',
    step3Desc: (n: number, pct: number) => `عندما ينضم ${n} أشخاص، يحصل الجميع على خصم ${pct}%`,
    step4Title: 'ادفع واستلم',
    step4Desc: 'يتم جمع الدفعة وطلب المنتج معًا',
    joinedDeal: 'لقد انضممت إلى هذا العرض!',
    joinedDealSubtitle: 'سنخطرك عندما يتم تفعيل العرض.',
    shareThisDeal: 'مشاركة هذا العرض',
    joinGroupDeal: (pct: number) => `انضم إلى العرض الجماعي ? وفّر ${pct}%`,
    joining: 'جارٍ الانضمام؟',
    loading: 'جارٍ التحميل',
  },
  pidgin: {
    back: 'Back',
    dealNotFound: 'Deal no dey',
    browseGroupDeals: 'Browse group deals',
    goBack: 'Go back',
    linkCopied: 'Link don copy',
    copyLink: 'Copy link',
    categoryLabel: 'Category',
    save: 'Money wey you save',
    joined: 'don join',
    peopleNeeded: (n: number) => `${n} more ${n === 1 ? 'person' : 'people'} still needed make deal start`,
    dealActivated: 'Deal don start!',
    youSave: 'You save',
    timeLeft: 'Time left',
    aboutThisDeal: 'About this deal',
    howGroupBuyingWorks: 'How group buying dey work',
    step1Title: 'Join the deal',
    step1Desc: 'Tap Join below make you reserve your spot',
    step2Title: 'Share with friends',
    step2Desc: 'More people join = deal go start faster',
    step3Title: 'Deal activates',
    step3Desc: (n: number, pct: number) => `When ${n} people join, everybody go get ${pct}% off`,
    step4Title: 'Pay & receive',
    step4Desc: 'Payment collect and order place together',
    joinedDeal: 'You don join this deal!',
    joinedDealSubtitle: 'We go tell you when the deal start.',
    shareThisDeal: 'Share this deal',
    joinGroupDeal: (pct: number) => `Join group deal ? save ${pct}%`,
    joining: 'Dey join?',
    loading: 'Dey load',
  },
  ful: {
    back: 'Rutto',
    dealNotFound: 'Ofa woodaa',
    browseGroupDeals: 'Yiylo bandiraaɗe ɓurɗe',
    goBack: 'Rutto',
    linkCopied: 'Link ɗoo copiyii',
    copyLink: 'Copiy link',
    categoryLabel: 'Kilaaɗe',
    save: 'Jafinaande',
    joined: 'naatnii',
    peopleNeeded: (n: number) => `${n} ${n === 1 ? 'ɓiɗɗo' : 'yimɓe'} ɓuri ngam bandiraaɗo oo haɓɓude`,
    dealActivated: 'Bandiraaɗo oo haɓɓii!',
    youSave: 'A jafini',
    timeLeft: 'Heddeerde waqti',
    aboutThisDeal: 'Hakkunde bandiraaɗo oo',
    howGroupBuyingWorks: 'No bandiraaɗo oo ɗoo wayi',
    step1Title: 'Naatnu e bandiraaɗo',
    step1Desc: 'Naatnu e Join wonde ndee ngam ndee fuɗɗo',
    step2Title: 'Faw e ɓe heddii',
    step2Desc: 'Ɓe ɓuri naatde = bandiraaɗo oo goɗɗo',
    step3Title: 'Bandiraaɗo oo haɓɓii',
    step3Desc: (n: number, pct: number) => `So ${n} yimɓe naatnii, kala wonde goɗɗum goɗɗum heɓa ${pct}%`,
    step4Title: 'Fey e heɓ',
    step4Desc: 'Feyde e ɗaɓɓitoore naatnataa e order ɗoo e mum',
    joinedDeal: 'A naatnii bandiraaɗo oo!',
    joinedDealSubtitle: 'Min ngoonde hollude ma so bandiraaɗo oo haɓɓii.',
    shareThisDeal: 'Faw bandiraaɗo oo',
    joinGroupDeal: (pct: number) => `Naatnu e bandiraaɗo bandiraaɗo ? jafina ${pct}%`,
    joining: 'Dey naatnde?',
    loading: 'Dey loowde',
  },
};

// FIX169: the fake demo deals map (TechShop CM etc.) was removed - real deals only.

export default function GroupBuyingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const lang = useLang();
  const ui = COPY[lang] ?? COPY[lang === 'ff' ? 'ful' : lang] ?? COPY.en;

  const [deal, setDeal] = useState<GroupDeal | null>(null);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [copied, setCopied] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const fallbackCopy = useCallback((text: string) => {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
    document.body.appendChild(el);
    el.focus();
    el.select();
    try { document.execCommand('copy'); } catch {}
    document.body.removeChild(el);
  }, []);

  const loadDeal = useCallback(async (dealId: string) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
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

          if (uid) {
            const { data: join } = await supabase
              .from('group_deal_joins')
              .select('id')
              .eq('deal_id', dealId)
              .eq('user_id', uid)
              .maybeSingle();
            setJoined(!!join);
          }
          return;
        }
      }

      setDeal(null); // FIX169: honest not-found
      
    } catch {
      setDeal(null); // FIX169
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) loadDeal(id);
    else setLoading(false);
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

        if (insertErr && insertErr.code !== '23505') throw insertErr;

        const rpcRes = await supabase.rpc('increment_group_deal_buyers', { deal_id: deal.id });
        if (rpcRes.error) {
          const { data: current } = await supabase
            .from('group_deals')
            .select('current_buyers')
            .eq('id', deal.id)
            .single();
          const next = (current?.current_buyers ?? deal.currentBuyers) + 1;
          await supabase.from('group_deals').update({ current_buyers: next }).eq('id', deal.id);
        }
      }

      setDeal(prev => prev ? { ...prev, currentBuyers: prev.currentBuyers + 1 } : null);
      setJoined(true);
    } catch {
    } finally {
      setJoining(false);
    }
  }, [deal, joined, joining, userId, navigate]);

  const copyLink = useCallback(() => {
    const url = window.location.href;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).catch(() => fallbackCopy(url));
    } else {
      fallbackCopy(url);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }, [fallbackCopy]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!id || !deal) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-teal-600 mb-6">
          <ArrowLeft className="w-5 h-5" /> {ui.back}
        </button>
        <div className="text-center py-16 text-gray-500">
          <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-semibold">{ui.dealNotFound}</p>
          <button onClick={() => navigate('/group-buying')} className="mt-4 text-teal-600 underline text-sm">
            {ui.browseGroupDeals}
          </button>
        </div>
      </div>
    );
  }

  const pct = Math.min(100, Math.round((deal.currentBuyers / deal.minParticipants) * 100));
  const savings = deal.originalPrice - deal.groupPrice;
  const savingsPct = Math.round((savings / deal.originalPrice) * 100);
  const daysLeft = Math.max(0, Math.ceil((new Date(deal.deadline).getTime() - Date.now()) / 86400000));
  const spotsLeft = Math.max(0, deal.minParticipants - deal.currentBuyers);
  const isActive = deal.status === 'open' && daysLeft > 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl" aria-label={ui.goBack}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="font-semibold text-gray-900 flex-1 truncate">{deal.name}</h2>
        <button onClick={copyLink} className="p-2 hover:bg-gray-100 rounded-xl" aria-label={copied ? ui.linkCopied : ui.copyLink}>
          {copied ? <Check className="w-5 h-5 text-teal-600" /> : <Copy className="w-5 h-5 text-gray-500" />}
        </button>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
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
              <p className="text-xs text-teal-100">XAF ? {ui.save} {savingsPct}%</p>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-teal-100">{deal.currentBuyers}/{deal.minParticipants} {ui.joined}</span>
              <span className="font-semibold">{pct}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2.5">
              <div className="bg-white h-2.5 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-xs text-teal-100 mt-2">
              {spotsLeft > 0 ? ui.peopleNeeded(spotsLeft) : ui.dealActivated}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            [savings.toLocaleString() + ' XAF', ui.youSave, 'text-green-600'],
            [daysLeft + 'd', ui.timeLeft, daysLeft <= 1 ? 'text-red-600' : 'text-gray-900'],
            [deal.currentBuyers.toString(), ui.joined, 'text-blue-600'],
          ].map(([v, l, col]) => (
            <div key={String(l)} className="bg-white rounded-2xl p-3 shadow-sm border text-center">
              <p className={`text-lg font-bold ${col}`}>{v}</p>
              <p className="text-xs text-gray-500 mt-0.5">{l}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <h3 className="font-semibold text-gray-900 mb-2">{ui.aboutThisDeal}</h3>
          <p className="text-sm text-gray-700 leading-relaxed">{deal.description}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <h3 className="font-semibold text-gray-900 mb-3">{ui.howGroupBuyingWorks}</h3>
          {([
            [ui.step1Title, ui.step1Desc],
            [ui.step2Title, ui.step2Desc],
            [ui.step3Title, ui.step3Desc(deal.minParticipants, savingsPct)],
            [ui.step4Title, ui.step4Desc],
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

        {joined && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
            <Check className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-800">{ui.joinedDeal}</p>
              <p className="text-sm text-green-600">{ui.joinedDealSubtitle}</p>
            </div>
          </div>
        )}

        <button
          onClick={copyLink}
          className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition"
        >
          <Share2 className="w-4 h-4" />
          {copied ? ui.linkCopied : ui.shareThisDeal}
        </button>
      </div>

      {!joined && isActive && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <button
            onClick={handleJoin}
            disabled={joining}
            className="w-full bg-teal-600 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-teal-700 transition"
          >
            {joining ? <><Loader2 className="w-5 h-5 animate-spin" />{ui.joining}</> : <><Users className="w-5 h-5" />{ui.joinGroupDeal(savingsPct)}</>}
          </button>
        </div>
      )}
    </div>
  );
}
// BAMBEH_END_TOKEN__GROUPBUYINGDETAIL_FIX169__COMPLETE
