/**
 * src/pages/ExchangeOfferPage.tsx — Bambeh Marketplace
 *
 * ✅ Full i18n: en, fr, ha, ar, pcm, ff
 * ✅ Blocks owner from making offer on own item
 * ✅ Blocks duplicate offers (unique constraint + pre-check)
 * ✅ Auth gate → /login redirect
 * ✅ Success state with deep-link back to item
 * ✅ Character counter + minimum length enforced
 * ✅ Estimated value field (FCFA)
 * ✅ Safe area bottom padding (Android)
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Send, Info, Loader2, CheckCircle, AlertCircle,
  ArrowLeftRight, Package,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';

// ─── i18n ──────────────────────────────────────────────────────────────────────
const STRINGS = {
  en: {
    pageTitle:  'Make an Exchange Offer',
    for:        'For:',
    cantSend:   'Can\'t send offer',
    goBack:     'Go Back',
    offerSent:  'Offer Sent! 🎉',
    ownerReview:'The item owner will review your offer and get back to you via chat.',
    browseMore: 'Browse More Items',
    backToItem: 'Back to Item',
    back:       'Back',
    whatOffering:'What are you offering? *',
    offerPlaceholder:'e.g. Samsung Galaxy S21',
    descLabel:  'Description *',
    minChars:   (n: number) => `min ${n} characters`,
    descPlaceholder:'Describe your item — condition, age, features, any defects…',
    chars:      (n: number) => `${n} chars`,
    need:       (n: number) => ` — need ${n} more`,
    condition:  'Condition *',
    estValue:   'Est. Value (FCFA)',
    estPlaceholder:'e.g. 75000',
    howItWorks: 'How Exchange Offers Work',
    step1:      'Submit your offer with item details',
    step2:      'The item owner reviews and accepts or declines',
    step3:      'If accepted, finalise the swap via chat',
    step4:      'Meet in a safe, public place to exchange items',
    cancel:     'Cancel',
    sendOffer:  'Send Offer',
    sending:    'Sending…',
    errOffering:'Please enter what you are offering.',
    errDesc:    'Please describe your item.',
    errDescMin: 'Description must be at least 20 characters.',
    errItem:    'Invalid exchange item.',
    errDuplicate:'You already made an offer on this item.',
    errGeneric: 'Failed to send offer. Please try again.',
  },
  fr: {
    pageTitle:  'Faire une offre d\'échange',
    for:        'Pour :',
    cantSend:   'Impossible d\'envoyer l\'offre',
    goBack:     'Retour',
    offerSent:  'Offre envoyée ! 🎉',
    ownerReview:'Le propriétaire examinera votre offre et vous contactera via le chat.',
    browseMore: 'Voir plus d\'articles',
    backToItem: 'Retour à l\'article',
    back:       'Retour',
    whatOffering:'Qu\'offrez-vous ? *',
    offerPlaceholder:'ex. Samsung Galaxy S21',
    descLabel:  'Description *',
    minChars:   (n: number) => `min ${n} caractères`,
    descPlaceholder:'Décrivez votre article — état, âge, fonctionnalités, défauts…',
    chars:      (n: number) => `${n} car.`,
    need:       (n: number) => ` — encore ${n}`,
    condition:  'État *',
    estValue:   'Valeur est. (FCFA)',
    estPlaceholder:'ex. 75000',
    howItWorks: 'Comment fonctionnent les offres',
    step1:      'Soumettez votre offre avec les détails de l\'article',
    step2:      'Le propriétaire accepte ou refuse',
    step3:      'Si acceptée, finalisez l\'échange via le chat',
    step4:      'Rencontrez-vous dans un lieu public pour l\'échange',
    cancel:     'Annuler',
    sendOffer:  'Envoyer l\'offre',
    sending:    'Envoi…',
    errOffering:'Veuillez indiquer ce que vous proposez.',
    errDesc:    'Veuillez décrire votre article.',
    errDescMin: 'La description doit comporter au moins 20 caractères.',
    errItem:    'Article invalide.',
    errDuplicate:'Vous avez déjà fait une offre sur cet article.',
    errGeneric: 'Échec de l\'envoi. Réessayez.',
  },
  ha: {
    pageTitle:  'Yi Tayin Musanya',
    for:        'Don:',
    cantSend:   'Ba za a iya aika tayin ba',
    goBack:     'Koma Baya',
    offerSent:  'An Aika Tayin! 🎉',
    ownerReview:'Mai abu zai duba tayin ku kuma zai tuntuɓe ku ta hanyar tattaunawa.',
    browseMore: 'Nemo Ƙarin Abubuwa',
    backToItem: 'Koma Wurin Abu',
    back:       'Baya',
    whatOffering:'Me kuke bayarwa? *',
    offerPlaceholder:'misali: Samsung Galaxy S21',
    descLabel:  'Bayani *',
    minChars:   (n: number) => `mafi ƙaranci ${n} haruffa`,
    descPlaceholder:'Bayyana abin ku — yanayi, shekaru, fasali, lahani…',
    chars:      (n: number) => `${n} harf`,
    need:       (n: number) => ` — ana buƙatar ${n} ƙari`,
    condition:  'Yanayi *',
    estValue:   'Ƙimar da ake ɗauka (FCFA)',
    estPlaceholder:'misali: 75000',
    howItWorks: 'Yadda Tayin Musanya ke Aiki',
    step1:      'Aika tayin ku tare da bayanan abu',
    step2:      'Mai abu yana bincike ya yarda ko ya ƙi',
    step3:      'Idan an yarda, kammala ta hanyar tattaunawa',
    step4:      'Ku sadu a wurin jama\'a don musanya',
    cancel:     'Soke',
    sendOffer:  'Aika Tayin',
    sending:    'Ana aika…',
    errOffering:'Shigar da abin da kuke bayarwa.',
    errDesc:    'Bayyana abin ku.',
    errDescMin: 'Bayani dole ya kasance akalla haruffa 20.',
    errItem:    'Abu mara inganci.',
    errDuplicate:'Kun riga kun yi tayin a wannan abu.',
    errGeneric: 'Aika ya kasa. Sake gwadawa.',
  },
  ar: {
    pageTitle:  'تقديم عرض تبادل',
    for:        'بخصوص:',
    cantSend:   'لا يمكن إرسال العرض',
    goBack:     'العودة',
    offerSent:  'تم إرسال العرض! 🎉',
    ownerReview:'سيراجع صاحب العنصر عرضك وسيرد عليك عبر المحادثة.',
    browseMore: 'تصÙح المزيد من العناصر',
    backToItem: 'العودة إلى العنصر',
    back:       'رجوع',
    whatOffering:'ماذا تعرض؟ *',
    offerPlaceholder:'مثال: سامسونج غالاكسي S21',
    descLabel:  'الوصÙ *',
    minChars:   (n: number) => `${n} حرÙ على الأقل`,
    descPlaceholder:'صÙ عنصرك — الحالة، العمر، المميزات، العيوب…',
    chars:      (n: number) => `${n} حرÙ`,
    need:       (n: number) => ` — يحتاج ${n} أكثر`,
    condition:  'الحالة *',
    estValue:   'القيمة التقديرية (Ùرنك)',
    estPlaceholder:'مثال: 75000',
    howItWorks: 'كيÙ تعمل عروض التبادل',
    step1:      'قدّم عرضك مع تÙاصيل العنصر',
    step2:      'يراجع صاحب العنصر العرض ويقبله أو يرÙضه',
    step3:      'عند القبول، أتمّ الصÙقة عبر المحادثة',
    step4:      'التقÙ Ùي مكان عام لتبادل العناصر',
    cancel:     'إلغاء',
    sendOffer:  'إرسال العرض',
    sending:    'جارÙ الإرسال…',
    errOffering:'يرجى إدخال ما تعرضه.',
    errDesc:    'يرجى وصÙ عنصرك.',
    errDescMin: 'يجب أن يحتوي الوصÙ على 20 حرÙًا على الأقل.',
    errItem:    'عنصر تبادل غير صالح.',
    errDuplicate:'لقد قدّمت عرضًا بالÙعل على هذا العنصر.',
    errGeneric: 'Ùشل الإرسال. حاول مجددًا.',
  },
  pcm: {
    pageTitle:  'Make Exchange Offer',
    for:        'For:',
    cantSend:   'Offer no fit go',
    goBack:     'Go Back',
    offerSent:  'Offer Don Go! 🎉',
    ownerReview:'Di owner go check your offer and reply you for chat.',
    browseMore: 'See More Items',
    backToItem: 'Back To Item',
    back:       'Back',
    whatOffering:'Wetin you wan offer? *',
    offerPlaceholder:'e.g. Samsung Galaxy S21',
    descLabel:  'Description *',
    minChars:   (n: number) => `at least ${n} characters`,
    descPlaceholder:'Describe am — how e dey, how old, features, wahala…',
    chars:      (n: number) => `${n} chars`,
    need:       (n: number) => ` — need ${n} more`,
    condition:  'Condition *',
    estValue:   'How much e worth (FCFA)',
    estPlaceholder:'e.g. 75000',
    howItWorks: 'How Exchange Offer Work',
    step1:      'Send your offer with details',
    step2:      'Owner go check — accept or reject',
    step3:      'If e accept, sort am out for chat',
    step4:      'Meet for public place to swap',
    cancel:     'Cancel',
    sendOffer:  'Send Offer',
    sending:    'E dey send…',
    errOffering:'Put wetin you wan offer.',
    errDesc:    'Describe your item.',
    errDescMin: 'Description must be at least 20 characters.',
    errItem:    'Item no valid.',
    errDuplicate:'You don already offer on this item.',
    errGeneric: 'Send fail. Try again.',
  },
  ff: {
    pageTitle:  'Hollit Jaɓde Fewtere',
    for:        'E:',
    cantSend:   'Jaɓde neldaaka',
    goBack:     'Ɓeto Baawo',
    offerSent:  'Jaɓde Neldaama! 🎉',
    ownerReview:'Jom coftal ngol ɓetotoo jaɓde maa e jokkondirde.',
    browseMore: 'Yiy Coftal Ɓuri',
    backToItem: 'Ɓeto Coftal',
    back:       'Baawo',
    whatOffering:'Ko njollata? *',
    offerPlaceholder:'mis: Samsung Galaxy S21',
    descLabel:  'Haalannde *',
    minChars:   (n: number) => `timmugol ${n} batu`,
    descPlaceholder:'Haalan coftal — ngol, ɗoon, maa, baaɗe…',
    chars:      (n: number) => `${n} batu`,
    need:       (n: number) => ` — ${n} ɓuri`,
    condition:  'Ngol *',
    estValue:   'Njaru (FCFA)',
    estPlaceholder:'mis: 75000',
    howItWorks: 'Ko Jaɓde Fewtere',
    step1:      'Neld jaɓde e haalannde coftal',
    step2:      'Jom ɓeto — jaɓde walla waɗtude',
    step3:      'So jaɓii, timminto e jokkondirde',
    step4:      'Njarna e nokku ɓurngo wuurde',
    cancel:     'Haɗ',
    sendOffer:  'Neld Jaɓde',
    sending:    'E neldinde…',
    errOffering:'Haala ko njollata.',
    errDesc:    'Haalan coftal maa.',
    errDescMin: 'Haalannde ko batu 20 timmugol.',
    errItem:    'Coftal hiɓaani.',
    errDuplicate:'Hollinaama jaɓde e coftal ngol.',
    errGeneric: 'Neldugol hiɓi. Heɓto katin.',
  },
} as const;

type Lang = keyof typeof STRINGS;

const CONDITIONS = [
  { value: 'new',       label: 'New'       },
  { value: 'like-new',  label: 'Like New'  },
  { value: 'used',      label: 'Used'      },
  { value: 'for-parts', label: 'For Parts' },
];

const MIN_DESC = 20;

export default function ExchangeOfferPage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const lang     = (useLang() as Lang) || 'en';
  const s        = STRINGS[lang] ?? STRINGS.en;
  const isRtl    = lang === 'ar';

  const [itemTitle,   setItemTitle]   = useState('');
  const [offerTitle,  setOfferTitle]  = useState('');
  const [description, setDescription] = useState('');
  const [condition,   setCondition]   = useState('used');
  const [estValue,    setEstValue]    = useState('');
  const [submitting,  setSubmitting]  = useState(false);
  const [done,        setDone]        = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [blocked,     setBlocked]     = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate('/login'); return; }

      const { data, error: err } = await supabase
        .from('exchange_items')
        .select('title, user_id')
        .eq('id', id)
        .single();

      if (err || !data) { setBlocked('This item no longer exists.'); return; }
      if (data.user_id === session.user.id) {
        setBlocked('You cannot make an offer on your own listing.');
        return;
      }
      setItemTitle(data.title as string);

      const { data: existing } = await supabase
        .from('exchange_offers')
        .select('id')
        .eq('exchange_item_id', id)
        .eq('offerer_id', session.user.id)
        .maybeSingle();

      if (existing) setBlocked(s.errDuplicate);
    })();
  }, [id, navigate, s.errDuplicate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!offerTitle.trim())           { setError(s.errOffering); return; }
    if (!description.trim())          { setError(s.errDesc);     return; }
    if (description.trim().length < MIN_DESC) { setError(s.errDescMin); return; }
    if (!id)                          { setError(s.errItem);     return; }

    setSubmitting(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate('/login'); return; }

      const { error: err } = await supabase
        .from('exchange_offers')
        .insert({
          exchange_item_id:  id,
          offerer_id:        session.user.id,
          offer_title:       offerTitle.trim(),
          offer_description: description.trim(),
          offer_condition:   condition,
          estimated_value:   estValue ? Number(estValue) : null,
          status:            'pending',
        });

      if (err) {
        if (err.code === '23505') setError(s.errDuplicate);
        else throw err;
        return;
      }
      setDone(true);
    } catch (e: any) {
      setError(e.message || s.errGeneric);
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Blocked ────────────────────────────────────────────────────────────────
  if (blocked) return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 p-6 ${isRtl ? 'rtl' : 'ltr'}`}>
      <div className="bg-white rounded-2xl shadow p-8 text-center max-w-sm w-full">
        <AlertCircle className="w-14 h-14 text-amber-400 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-gray-900 mb-2">{s.cantSend}</h2>
        <p className="text-gray-500 text-sm mb-6">{blocked}</p>
        <button onClick={() => navigate(-1)}
          className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors">
          {s.goBack}
        </button>
      </div>
    </div>
  );

  // ─── Success ────────────────────────────────────────────────────────────────
  if (done) return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 p-6 ${isRtl ? 'rtl' : 'ltr'}`}>
      <div className="bg-white rounded-2xl shadow p-8 text-center max-w-sm w-full">
        <CheckCircle className="w-14 h-14 text-teal-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">{s.offerSent}</h2>
        <p className="text-gray-500 text-sm mb-6">{s.ownerReview}</p>
        <div className="space-y-2">
          <button onClick={() => navigate('/exchange')}
            className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors">
            {s.browseMore}
          </button>
          <button onClick={() => navigate(`/exchange/${id}`)}
            className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
            {s.backToItem}
          </button>
        </div>
      </div>
    </div>
  );

  // ─── Form ───────────────────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen bg-gray-50 ${isRtl ? 'rtl' : 'ltr'}`}
      style={{ paddingBottom: 'max(80px, env(safe-area-inset-bottom))' }}>

      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-4 py-5">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/80 hover:text-white mb-3 text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> {s.back}
        </button>
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="w-5 h-5" />
          <h1 className="text-xl font-bold">{s.pageTitle}</h1>
        </div>
        {itemTitle && (
          <p className="text-teal-100 text-sm mt-0.5 truncate flex items-center gap-1">
            <Package className="w-3.5 h-3.5 flex-shrink-0" />
            {s.for} <span className="font-medium ml-1">{itemTitle}</span>
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
            <span className="flex-shrink-0">⚠ï¸</span>
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          {/* What you're offering */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{s.whatOffering}</label>
            <input
              value={offerTitle}
              onChange={e => setOfferTitle(e.target.value)}
              placeholder={s.offerPlaceholder}
              maxLength={120}
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {s.descLabel}{' '}
              <span className="text-gray-400 font-normal">({s.minChars(MIN_DESC)})</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={s.descPlaceholder}
              rows={5}
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 resize-none transition"
            />
            <p className="text-xs text-gray-400 mt-1">
              {s.chars(description.length)}
              {description.length < MIN_DESC && (
                <span className="text-red-400">{s.need(MIN_DESC - description.length)}</span>
              )}
              {description.length >= MIN_DESC && (
                <span className="text-teal-500 ml-1">✓</span>
              )}
            </p>
          </div>

          {/* Condition + value */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{s.condition}</label>
              <select
                value={condition}
                onChange={e => setCondition(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 bg-white transition"
              >
                {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{s.estValue}</label>
              <input
                type="number"
                value={estValue}
                onChange={e => setEstValue(e.target.value)}
                placeholder={s.estPlaceholder}
                min="0"
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 transition"
              />
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900 text-sm mb-2">{s.howItWorks}</p>
              <ol className="list-decimal list-inside space-y-1 text-xs text-blue-800">
                <li>{s.step1}</li>
                <li>{s.step2}</li>
                <li>{s.step3}</li>
                <li>{s.step4}</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(-1)}
            className="flex-1 border-2 border-gray-300 rounded-xl py-3 font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
            {s.cancel}
          </button>
          <button
            type="submit"
            disabled={submitting || description.length < MIN_DESC}
            className="flex-1 bg-teal-600 text-white rounded-xl py-3 font-semibold
              disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2
              hover:bg-teal-700 transition-colors shadow-sm"
          >
            {submitting
              ? <><Loader2 className="w-4 h-4 animate-spin" />{s.sending}</>
              : <><Send className="w-4 h-4" />{s.sendOffer}</>
            }
          </button>
        </div>
      </form>
    </div>
  );
}



