/**
 * src/pages/ExchangeOfferPage.tsx â€” Bambeh Marketplace
 *
 * âœ… Full i18n: en, fr, ha, ar, pcm, ff
 * âœ… Blocks owner from making offer on own item
 * âœ… Blocks duplicate offers (unique constraint + pre-check)
 * âœ… Auth gate â†’ /login redirect
 * âœ… Success state with deep-link back to item
 * âœ… Character counter + minimum length enforced
 * âœ… Estimated value field (FCFA)
 * âœ… Safe area bottom padding (Android)
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Send, Info, Loader2, CheckCircle, AlertCircle,
  ArrowLeftRight, Package,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';

// â”€â”€â”€ i18n â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const STRINGS = {
  en: {
    pageTitle:  'Make an Exchange Offer',
    for:        'For:',
    cantSend:   'Can\'t send offer',
    goBack:     'Go Back',
    offerSent:  'Offer Sent! ðŸŽ‰',
    ownerReview:'The item owner will review your offer and get back to you via chat.',
    browseMore: 'Browse More Items',
    backToItem: 'Back to Item',
    back:       'Back',
    whatOffering:'What are you offering? *',
    offerPlaceholder:'e.g. Samsung Galaxy S21',
    descLabel:  'Description *',
    minChars:   (n: number) => `min ${n} characters`,
    descPlaceholder:'Describe your item â€” condition, age, features, any defectsâ€¦',
    chars:      (n: number) => `${n} chars`,
    need:       (n: number) => ` â€” need ${n} more`,
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
    sending:    'Sendingâ€¦',
    errOffering:'Please enter what you are offering.',
    errDesc:    'Please describe your item.',
    errDescMin: 'Description must be at least 20 characters.',
    errItem:    'Invalid exchange item.',
    errDuplicate:'You already made an offer on this item.',
    errGeneric: 'Failed to send offer. Please try again.',
  },
  fr: {
    pageTitle:  'Faire une offre d\'Ã©change',
    for:        'Pour :',
    cantSend:   'Impossible d\'envoyer l\'offre',
    goBack:     'Retour',
    offerSent:  'Offre envoyÃ©e ! ðŸŽ‰',
    ownerReview:'Le propriÃ©taire examinera votre offre et vous contactera via le chat.',
    browseMore: 'Voir plus d\'articles',
    backToItem: 'Retour Ã  l\'article',
    back:       'Retour',
    whatOffering:'Qu\'offrez-vous ? *',
    offerPlaceholder:'ex. Samsung Galaxy S21',
    descLabel:  'Description *',
    minChars:   (n: number) => `min ${n} caractÃ¨res`,
    descPlaceholder:'DÃ©crivez votre article â€” Ã©tat, Ã¢ge, fonctionnalitÃ©s, dÃ©fautsâ€¦',
    chars:      (n: number) => `${n} car.`,
    need:       (n: number) => ` â€” encore ${n}`,
    condition:  'Ã‰tat *',
    estValue:   'Valeur est. (FCFA)',
    estPlaceholder:'ex. 75000',
    howItWorks: 'Comment fonctionnent les offres',
    step1:      'Soumettez votre offre avec les dÃ©tails de l\'article',
    step2:      'Le propriÃ©taire accepte ou refuse',
    step3:      'Si acceptÃ©e, finalisez l\'Ã©change via le chat',
    step4:      'Rencontrez-vous dans un lieu public pour l\'Ã©change',
    cancel:     'Annuler',
    sendOffer:  'Envoyer l\'offre',
    sending:    'Envoiâ€¦',
    errOffering:'Veuillez indiquer ce que vous proposez.',
    errDesc:    'Veuillez dÃ©crire votre article.',
    errDescMin: 'La description doit comporter au moins 20 caractÃ¨res.',
    errItem:    'Article invalide.',
    errDuplicate:'Vous avez dÃ©jÃ  fait une offre sur cet article.',
    errGeneric: 'Ã‰chec de l\'envoi. RÃ©essayez.',
  },
  ha: {
    pageTitle:  'Yi Tayin Musanya',
    for:        'Don:',
    cantSend:   'Ba za a iya aika tayin ba',
    goBack:     'Koma Baya',
    offerSent:  'An Aika Tayin! ðŸŽ‰',
    ownerReview:'Mai abu zai duba tayin ku kuma zai tuntuÉ“e ku ta hanyar tattaunawa.',
    browseMore: 'Nemo Æ˜arin Abubuwa',
    backToItem: 'Koma Wurin Abu',
    back:       'Baya',
    whatOffering:'Me kuke bayarwa? *',
    offerPlaceholder:'misali: Samsung Galaxy S21',
    descLabel:  'Bayani *',
    minChars:   (n: number) => `mafi Æ™aranci ${n} haruffa`,
    descPlaceholder:'Bayyana abin ku â€” yanayi, shekaru, fasali, lahaniâ€¦',
    chars:      (n: number) => `${n} harf`,
    need:       (n: number) => ` â€” ana buÆ™atar ${n} Æ™ari`,
    condition:  'Yanayi *',
    estValue:   'Æ˜imar da ake É—auka (FCFA)',
    estPlaceholder:'misali: 75000',
    howItWorks: 'Yadda Tayin Musanya ke Aiki',
    step1:      'Aika tayin ku tare da bayanan abu',
    step2:      'Mai abu yana bincike ya yarda ko ya Æ™i',
    step3:      'Idan an yarda, kammala ta hanyar tattaunawa',
    step4:      'Ku sadu a wurin jama\'a don musanya',
    cancel:     'Soke',
    sendOffer:  'Aika Tayin',
    sending:    'Ana aikaâ€¦',
    errOffering:'Shigar da abin da kuke bayarwa.',
    errDesc:    'Bayyana abin ku.',
    errDescMin: 'Bayani dole ya kasance akalla haruffa 20.',
    errItem:    'Abu mara inganci.',
    errDuplicate:'Kun riga kun yi tayin a wannan abu.',
    errGeneric: 'Aika ya kasa. Sake gwadawa.',
  },
  ar: {
    pageTitle:  'ØªÙ‚Ø¯ÙŠÙ… Ø¹Ø±Ø¶ ØªØ¨Ø§Ø¯Ù„',
    for:        'Ø¨Ø®ØµÙˆØµ:',
    cantSend:   'Ù„Ø§ ÙŠÙ…ÙƒÙ† Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø¹Ø±Ø¶',
    goBack:     'Ø§Ù„Ø¹ÙˆØ¯Ø©',
    offerSent:  'ØªÙ… Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø¹Ø±Ø¶! ðŸŽ‰',
    ownerReview:'Ø³ÙŠØ±Ø§Ø¬Ø¹ ØµØ§Ø­Ø¨ Ø§Ù„Ø¹Ù†ØµØ± Ø¹Ø±Ø¶Ùƒ ÙˆØ³ÙŠØ±Ø¯ Ø¹Ù„ÙŠÙƒ Ø¹Ø¨Ø± Ø§Ù„Ù…Ø­Ø§Ø¯Ø«Ø©.',
    browseMore: 'ØªØµÃ™ÂØ­ Ø§Ù„Ù…Ø²ÙŠØ¯ Ù…Ù† Ø§Ù„Ø¹Ù†Ø§ØµØ±',
    backToItem: 'Ø§Ù„Ø¹ÙˆØ¯Ø© Ø¥Ù„Ù‰ Ø§Ù„Ø¹Ù†ØµØ±',
    back:       'Ø±Ø¬ÙˆØ¹',
    whatOffering:'Ù…Ø§Ø°Ø§ ØªØ¹Ø±Ø¶ØŸ *',
    offerPlaceholder:'Ù…Ø«Ø§Ù„: Ø³Ø§Ù…Ø³ÙˆÙ†Ø¬ ØºØ§Ù„Ø§ÙƒØ³ÙŠ S21',
    descLabel:  'Ø§Ù„ÙˆØµÃ™Â *',
    minChars:   (n: number) => `${n} Ø­Ø±Ã™Â Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„`,
    descPlaceholder:'ØµÃ™Â Ø¹Ù†ØµØ±Ùƒ â€” Ø§Ù„Ø­Ø§Ù„Ø©ØŒ Ø§Ù„Ø¹Ù…Ø±ØŒ Ø§Ù„Ù…Ù…ÙŠØ²Ø§ØªØŒ Ø§Ù„Ø¹ÙŠÙˆØ¨â€¦',
    chars:      (n: number) => `${n} Ø­Ø±Ã™Â`,
    need:       (n: number) => ` â€” ÙŠØ­ØªØ§Ø¬ ${n} Ø£ÙƒØ«Ø±`,
    condition:  'Ø§Ù„Ø­Ø§Ù„Ø© *',
    estValue:   'Ø§Ù„Ù‚ÙŠÙ…Ø© Ø§Ù„ØªÙ‚Ø¯ÙŠØ±ÙŠØ© (Ã™ÂØ±Ù†Ùƒ)',
    estPlaceholder:'Ù…Ø«Ø§Ù„: 75000',
    howItWorks: 'ÙƒÙŠÃ™Â ØªØ¹Ù…Ù„ Ø¹Ø±ÙˆØ¶ Ø§Ù„ØªØ¨Ø§Ø¯Ù„',
    step1:      'Ù‚Ø¯Ù‘Ù… Ø¹Ø±Ø¶Ùƒ Ù…Ø¹ ØªÃ™ÂØ§ØµÙŠÙ„ Ø§Ù„Ø¹Ù†ØµØ±',
    step2:      'ÙŠØ±Ø§Ø¬Ø¹ ØµØ§Ø­Ø¨ Ø§Ù„Ø¹Ù†ØµØ± Ø§Ù„Ø¹Ø±Ø¶ ÙˆÙŠÙ‚Ø¨Ù„Ù‡ Ø£Ùˆ ÙŠØ±Ã™ÂØ¶Ù‡',
    step3:      'Ø¹Ù†Ø¯ Ø§Ù„Ù‚Ø¨ÙˆÙ„ØŒ Ø£ØªÙ…Ù‘ Ø§Ù„ØµÃ™ÂÙ‚Ø© Ø¹Ø¨Ø± Ø§Ù„Ù…Ø­Ø§Ø¯Ø«Ø©',
    step4:      'Ø§Ù„ØªÙ‚Ã™Â Ã™ÂÙŠ Ù…ÙƒØ§Ù† Ø¹Ø§Ù… Ù„ØªØ¨Ø§Ø¯Ù„ Ø§Ù„Ø¹Ù†Ø§ØµØ±',
    cancel:     'Ø¥Ù„ØºØ§Ø¡',
    sendOffer:  'Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø¹Ø±Ø¶',
    sending:    'Ø¬Ø§Ø±Ã™Â Ø§Ù„Ø¥Ø±Ø³Ø§Ù„â€¦',
    errOffering:'ÙŠØ±Ø¬Ù‰ Ø¥Ø¯Ø®Ø§Ù„ Ù…Ø§ ØªØ¹Ø±Ø¶Ù‡.',
    errDesc:    'ÙŠØ±Ø¬Ù‰ ÙˆØµÃ™Â Ø¹Ù†ØµØ±Ùƒ.',
    errDescMin: 'ÙŠØ¬Ø¨ Ø£Ù† ÙŠØ­ØªÙˆÙŠ Ø§Ù„ÙˆØµÃ™Â Ø¹Ù„Ù‰ 20 Ø­Ø±Ã™ÂÙ‹Ø§ Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„.',
    errItem:    'Ø¹Ù†ØµØ± ØªØ¨Ø§Ø¯Ù„ ØºÙŠØ± ØµØ§Ù„Ø­.',
    errDuplicate:'Ù„Ù‚Ø¯ Ù‚Ø¯Ù‘Ù…Øª Ø¹Ø±Ø¶Ù‹Ø§ Ø¨Ø§Ù„Ã™ÂØ¹Ù„ Ø¹Ù„Ù‰ Ù‡Ø°Ø§ Ø§Ù„Ø¹Ù†ØµØ±.',
    errGeneric: 'Ã™ÂØ´Ù„ Ø§Ù„Ø¥Ø±Ø³Ø§Ù„. Ø­Ø§ÙˆÙ„ Ù…Ø¬Ø¯Ø¯Ù‹Ø§.',
  },
  pcm: {
    pageTitle:  'Make Exchange Offer',
    for:        'For:',
    cantSend:   'Offer no fit go',
    goBack:     'Go Back',
    offerSent:  'Offer Don Go! ðŸŽ‰',
    ownerReview:'Di owner go check your offer and reply you for chat.',
    browseMore: 'See More Items',
    backToItem: 'Back To Item',
    back:       'Back',
    whatOffering:'Wetin you wan offer? *',
    offerPlaceholder:'e.g. Samsung Galaxy S21',
    descLabel:  'Description *',
    minChars:   (n: number) => `at least ${n} characters`,
    descPlaceholder:'Describe am â€” how e dey, how old, features, wahalaâ€¦',
    chars:      (n: number) => `${n} chars`,
    need:       (n: number) => ` â€” need ${n} more`,
    condition:  'Condition *',
    estValue:   'How much e worth (FCFA)',
    estPlaceholder:'e.g. 75000',
    howItWorks: 'How Exchange Offer Work',
    step1:      'Send your offer with details',
    step2:      'Owner go check â€” accept or reject',
    step3:      'If e accept, sort am out for chat',
    step4:      'Meet for public place to swap',
    cancel:     'Cancel',
    sendOffer:  'Send Offer',
    sending:    'E dey sendâ€¦',
    errOffering:'Put wetin you wan offer.',
    errDesc:    'Describe your item.',
    errDescMin: 'Description must be at least 20 characters.',
    errItem:    'Item no valid.',
    errDuplicate:'You don already offer on this item.',
    errGeneric: 'Send fail. Try again.',
  },
  ff: {
    pageTitle:  'Hollit JaÉ“de Fewtere',
    for:        'E:',
    cantSend:   'JaÉ“de neldaaka',
    goBack:     'Æeto Baawo',
    offerSent:  'JaÉ“de Neldaama! ðŸŽ‰',
    ownerReview:'Jom coftal ngol É“etotoo jaÉ“de maa e jokkondirde.',
    browseMore: 'Yiy Coftal Æuri',
    backToItem: 'Æeto Coftal',
    back:       'Baawo',
    whatOffering:'Ko njollata? *',
    offerPlaceholder:'mis: Samsung Galaxy S21',
    descLabel:  'Haalannde *',
    minChars:   (n: number) => `timmugol ${n} batu`,
    descPlaceholder:'Haalan coftal â€” ngol, É—oon, maa, baaÉ—eâ€¦',
    chars:      (n: number) => `${n} batu`,
    need:       (n: number) => ` â€” ${n} É“uri`,
    condition:  'Ngol *',
    estValue:   'Njaru (FCFA)',
    estPlaceholder:'mis: 75000',
    howItWorks: 'Ko JaÉ“de Fewtere',
    step1:      'Neld jaÉ“de e haalannde coftal',
    step2:      'Jom É“eto â€” jaÉ“de walla waÉ—tude',
    step3:      'So jaÉ“ii, timminto e jokkondirde',
    step4:      'Njarna e nokku É“urngo wuurde',
    cancel:     'HaÉ—',
    sendOffer:  'Neld JaÉ“de',
    sending:    'E neldindeâ€¦',
    errOffering:'Haala ko njollata.',
    errDesc:    'Haalan coftal maa.',
    errDescMin: 'Haalannde ko batu 20 timmugol.',
    errItem:    'Coftal hiÉ“aani.',
    errDuplicate:'Hollinaama jaÉ“de e coftal ngol.',
    errGeneric: 'Neldugol hiÉ“i. HeÉ“to katin.',
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

  // â”€â”€â”€ Blocked â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€â”€ Success â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€â”€ Form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
            <span className="flex-shrink-0">âš Ã¯Â¸Â</span>
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
                <span className="text-teal-500 ml-1">âœ“</span>
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




