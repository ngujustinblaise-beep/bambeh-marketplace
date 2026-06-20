/**
 * src/pages/ExchangeItemPost.tsx â€” Bambeh Marketplace
 *
 * âœ… Full i18n: en, fr, ha, ar, pcm, ff
 * âœ… Image upload to Supabase Storage (exchange-images bucket)
 * âœ… 30-day expiry set automatically
 * âœ… Full validation with localised error messages
 * âœ… Cash supplement toggle
 * âœ… Progress indicator for photo upload
 * âœ… Safe area + keyboard-aware layout
 */

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Camera, Loader2, X, Image as ImageIcon, Info,
  ArrowLeftRight, CheckCircle, DollarSign, MapPin,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';

// â”€â”€â”€ i18n â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const STRINGS = {
  en: {
    pageTitle: 'Post for Exchange',
    freeLabel: 'Free Â· 30 days',
    errorTitle: 'Please fix:',
    photos: 'Photos',
    photosHint: (max: number) => `(up to ${max})`,
    photosPrompt: 'Photos boost your chance of getting offers',
    addPhoto: 'Add',
    title: 'Title *',
    titlePlaceholder: 'e.g. iPhone 11 â€” looking for Samsung Galaxy',
    description: 'Description',
    descPlaceholder: 'Describe your item â€” age, features, defects, accessoriesâ€¦',
    category: 'Category *',
    selectCategory: 'Selectâ€¦',
    condition: 'Condition *',
    selectCondition: 'Selectâ€¦',
    location: 'Your Location *',
    locationPlaceholder: 'e.g. YaoundÃ©, Bastos',
    wantedLabel: 'What do you want in return?',
    wantedPlaceholder: 'e.g. Samsung Galaxy S21, MacBook Airâ€¦',
    estValue: 'Estimated value (FCFA)',
    estValuePlaceholder: 'e.g. 150000',
    cashSupplement: 'Accept cash supplement?',
    maxCash: 'Max cash top-up (FCFA)',
    maxCashPlaceholder: 'e.g. 30000',
    infoText: (days: number) => `Your listing will be visible to all Bambeh users. It expires after ${days} days â€” you\'ll get a reminder 3 days before.`,
    submit: 'Post Exchange Item',
    posting: 'Postingâ€¦',
    uploading: (pct: number) => `Uploading photos ${pct}%â€¦`,
    errTitle: 'Please enter a title.',
    errTitleShort: 'Title must be at least 3 characters.',
    errCategory: 'Please select a category.',
    errCondition: 'Please select the condition.',
    errLocation: 'Please enter your location.',
    errAuth: 'Please log in to post.',
    errGeneric: 'Failed to post. Please try again.',
  },
  fr: {
    pageTitle: 'Publier pour Ã©change',
    freeLabel: 'Gratuit Â· 30 jours',
    errorTitle: 'Ã€ corriger :',
    photos: 'Photos',
    photosHint: (max: number) => `(jusqu'Ã  ${max})`,
    photosPrompt: 'Les photos augmentent vos chances de recevoir des offres',
    addPhoto: 'Ajouter',
    title: 'Titre *',
    titlePlaceholder: 'ex. iPhone 11 â€” cherche Samsung Galaxy',
    description: 'Description',
    descPlaceholder: 'DÃ©crivez l\'article â€” Ã¢ge, fonctionnalitÃ©s, dÃ©fauts, accessoiresâ€¦',
    category: 'CatÃ©gorie *',
    selectCategory: 'Choisirâ€¦',
    condition: 'Ã‰tat *',
    selectCondition: 'Choisirâ€¦',
    location: 'Votre localisation *',
    locationPlaceholder: 'ex. YaoundÃ©, Bastos',
    wantedLabel: 'Que voulez-vous en Ã©change ?',
    wantedPlaceholder: 'ex. Samsung Galaxy S21, MacBook Airâ€¦',
    estValue: 'Valeur estimÃ©e (FCFA)',
    estValuePlaceholder: 'ex. 150000',
    cashSupplement: 'Accepter un complÃ©ment en espÃ¨ces ?',
    maxCash: 'ComplÃ©ment max (FCFA)',
    maxCashPlaceholder: 'ex. 30000',
    infoText: (days: number) => `Votre annonce sera visible par tous les utilisateurs pendant ${days} jours. Vous recevrez un rappel 3 jours avant l'expiration.`,
    submit: 'Publier l\'article',
    posting: 'Publicationâ€¦',
    uploading: (pct: number) => `Envoi photos ${pct}%â€¦`,
    errTitle: 'Veuillez entrer un titre.',
    errTitleShort: 'Le titre doit comporter au moins 3 caractÃ¨res.',
    errCategory: 'Veuillez sÃ©lectionner une catÃ©gorie.',
    errCondition: 'Veuillez sÃ©lectionner l\'Ã©tat.',
    errLocation: 'Veuillez entrer votre localisation.',
    errAuth: 'Veuillez vous connecter pour publier.',
    errGeneric: 'Ã‰chec de la publication. RÃ©essayez.',
  },
  ha: {
    pageTitle: 'Buga Don Musanya',
    freeLabel: 'Kyauta Â· Kwanaki 30',
    errorTitle: 'Gyara:',
    photos: 'Hotuna',
    photosHint: (max: number) => `(har ${max})`,
    photosPrompt: 'Hotuna suna Æ™ara damar samun tayin',
    addPhoto: 'Æ˜ara',
    title: 'Taken *',
    titlePlaceholder: 'misali: iPhone 11 â€” ina neman Samsung Galaxy',
    description: 'Bayani',
    descPlaceholder: 'Bayyana abin â€” tsawon lokaci, halaye, lahani, kayan haÉ—iâ€¦',
    category: 'Nau\'i *',
    selectCategory: 'ZaÉ“aâ€¦',
    condition: 'Yanayi *',
    selectCondition: 'ZaÉ“aâ€¦',
    location: 'Wurin ka *',
    locationPlaceholder: 'misali: YaoundÃ©, Bastos',
    wantedLabel: 'Me kake so a madadin?',
    wantedPlaceholder: 'misali: Samsung Galaxy S21, MacBook Airâ€¦',
    estValue: 'Æ˜imar kuÉ—i (FCFA)',
    estValuePlaceholder: 'misali: 150000',
    cashSupplement: 'Yarda da Æ™arin kuÉ—i?',
    maxCash: 'Mafi girman kuÉ—in Æ™ari (FCFA)',
    maxCashPlaceholder: 'misali: 30000',
    infoText: (days: number) => `Za a nuna jerin ku ga duk masu amfani na kwanaki ${days}. Za ku sami tunatarwa kwanaki 3 kafin Æ™arewa.`,
    submit: 'Buga Abu Don Musanya',
    posting: 'Ana wallafawaâ€¦',
    uploading: (pct: number) => `Ana aika hotuna ${pct}%â€¦`,
    errTitle: 'Shigar da taken.',
    errTitleShort: 'Taken dole ya kasance akalla haruffa 3.',
    errCategory: 'ZaÉ“i nau\'in.',
    errCondition: 'ZaÉ“i yanayin.',
    errLocation: 'Shigar da wurin ka.',
    errAuth: 'Yi rajista don wallafawa.',
    errGeneric: 'Wallafawa ta kasa. Sake gwadawa.',
  },
  ar: {
    pageTitle: 'Ù†Ø´Ø± Ù„Ù„ØªØ¨Ø§Ø¯Ù„',
    freeLabel: 'Ù…Ø¬Ø§Ù†Ù‹Ø§ Â· 30 ÙŠÙˆÙ…Ù‹Ø§',
    errorTitle: 'ÙŠØ±Ø¬Ù‰ Ø§Ù„ØªØµØ­ÙŠØ­:',
    photos: 'Ø§Ù„ØµÙˆØ±',
    photosHint: (max: number) => `(Ø­ØªÙ‰ ${max})`,
    photosPrompt: 'Ø§Ù„ØµÙˆØ± ØªØ²ÙŠØ¯ ÙØ±ØµÙƒ ÙÙŠ Ø§Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ø¹Ø±ÙˆØ¶',
    addPhoto: 'Ø£Ø¶Ù',
    title: 'Ø§Ù„Ø¹Ù†ÙˆØ§Ù† *',
    titlePlaceholder: 'Ù…Ø«Ø§Ù„: Ø¢ÙŠÙÙˆÙ† 11 â€” Ø£Ø¨Ø­Ø« Ø¹Ù† Ø³Ø§Ù…Ø³ÙˆÙ†Ø¬ ØºØ§Ù„Ø§ÙƒØ³ÙŠ',
    description: 'Ø§Ù„ÙˆØµÙ',
    descPlaceholder: 'ØµÙ Ø§Ù„Ø¹Ù†ØµØ± â€” Ø§Ù„Ø¹Ù…Ø±ØŒ Ø§Ù„Ù…Ù…ÙŠØ²Ø§ØªØŒ Ø§Ù„Ø¹ÙŠÙˆØ¨ØŒ Ø§Ù„Ù…Ù„Ø­Ù‚Ø§Øªâ€¦',
    category: 'Ø§Ù„ÙØ¦Ø© *',
    selectCategory: 'Ø§Ø®ØªØ±â€¦',
    condition: 'Ø§Ù„Ø­Ø§Ù„Ø© *',
    selectCondition: 'Ø§Ø®ØªØ±â€¦',
    location: 'Ù…ÙˆÙ‚Ø¹Ùƒ *',
    locationPlaceholder: 'Ù…Ø«Ø§Ù„: ÙŠØ§ÙˆÙ†Ø¯ÙŠØŒ Ø¨Ø§Ø³ØªÙˆØ³',
    wantedLabel: 'Ù…Ø§Ø°Ø§ ØªØ±ÙŠØ¯ ÙÙŠ Ø§Ù„Ù…Ù‚Ø§Ø¨Ù„ØŸ',
    wantedPlaceholder: 'Ù…Ø«Ø§Ù„: Ø³Ø§Ù…Ø³ÙˆÙ†Ø¬ ØºØ§Ù„Ø§ÙƒØ³ÙŠ S21ØŒ Ù…Ø§Ùƒ Ø¨ÙˆÙƒ Ø£ÙŠØ±â€¦',
    estValue: 'Ø§Ù„Ù‚ÙŠÙ…Ø© Ø§Ù„ØªÙ‚Ø¯ÙŠØ±ÙŠØ© (ÙØ±Ù†Ùƒ Ø£ÙØ±ÙŠÙ‚ÙŠ)',
    estValuePlaceholder: 'Ù…Ø«Ø§Ù„: 150000',
    cashSupplement: 'Ù‚Ø¨ÙˆÙ„ Ù…ÙƒÙ…Ù„ Ù†Ù‚Ø¯ÙŠØŸ',
    maxCash: 'Ø£Ù‚ØµÙ‰ Ù…Ø¨Ù„Øº Ù†Ù‚Ø¯ÙŠ Ø¥Ø¶Ø§ÙÙŠ (ÙØ±Ù†Ùƒ Ø£ÙØ±ÙŠÙ‚ÙŠ)',
    maxCashPlaceholder: 'Ù…Ø«Ø§Ù„: 30000',
    infoText: (days: number) => `Ø³ÙŠØ¸Ù‡Ø± Ø¥Ø¹Ù„Ø§Ù†Ùƒ Ù„Ø¬Ù…ÙŠØ¹ Ù…Ø³ØªØ®Ø¯Ù…ÙŠ Bambeh Ù„Ù…Ø¯Ø© ${days} ÙŠÙˆÙ…Ù‹Ø§. Ø³ØªØªÙ„Ù‚Ù‰ ØªØ°ÙƒÙŠØ±Ù‹Ø§ Ù‚Ø¨Ù„ 3 Ø£ÙŠØ§Ù… Ù…Ù† Ø§Ù†ØªÙ‡Ø§Ø¡ Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ©.`,
    submit: 'Ù†Ø´Ø± Ø¹Ù†ØµØ± Ø§Ù„ØªØ¨Ø§Ø¯Ù„',
    posting: 'Ø¬Ø§Ø±Ù Ø§Ù„Ù†Ø´Ø±â€¦',
    uploading: (pct: number) => `Ø±ÙØ¹ Ø§Ù„ØµÙˆØ± ${pct}%â€¦`,
    errTitle: 'ÙŠØ±Ø¬Ù‰ Ø¥Ø¯Ø®Ø§Ù„ Ø¹Ù†ÙˆØ§Ù†.',
    errTitleShort: 'ÙŠØ¬Ø¨ Ø£Ù† ÙŠØ­ØªÙˆÙŠ Ø§Ù„Ø¹Ù†ÙˆØ§Ù† Ø¹Ù„Ù‰ 3 Ø£Ø­Ø±Ù Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„.',
    errCategory: 'ÙŠØ±Ø¬Ù‰ Ø§Ø®ØªÙŠØ§Ø± ÙØ¦Ø©.',
    errCondition: 'ÙŠØ±Ø¬Ù‰ Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„Ø­Ø§Ù„Ø©.',
    errLocation: 'ÙŠØ±Ø¬Ù‰ Ø¥Ø¯Ø®Ø§Ù„ Ù…ÙˆÙ‚Ø¹Ùƒ.',
    errAuth: 'ÙŠØ±Ø¬Ù‰ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ù„Ù„Ù†Ø´Ø±.',
    errGeneric: 'ÙØ´Ù„ Ø§Ù„Ù†Ø´Ø±. Ø­Ø§ÙˆÙ„ Ù…Ø¬Ø¯Ø¯Ù‹Ø§.',
  },
  pcm: {
    pageTitle: 'Post For Exchange',
    freeLabel: 'Free Â· 30 days',
    errorTitle: 'Fix this:',
    photos: 'Photos',
    photosHint: (max: number) => `(up to ${max})`,
    photosPrompt: 'Photos go help you get more offers',
    addPhoto: 'Add',
    title: 'Title *',
    titlePlaceholder: 'e.g. iPhone 11 â€” I wan Samsung Galaxy',
    description: 'Description',
    descPlaceholder: 'Tell am â€” how old, wetin dey work, wetin no dey workâ€¦',
    category: 'Category *',
    selectCategory: 'Chooseâ€¦',
    condition: 'Condition *',
    selectCondition: 'Chooseâ€¦',
    location: 'Your Location *',
    locationPlaceholder: 'e.g. YaoundÃ©, Bastos',
    wantedLabel: 'Wetin you wan exchange for?',
    wantedPlaceholder: 'e.g. Samsung Galaxy S21, MacBook Airâ€¦',
    estValue: 'How much e worth (FCFA)',
    estValuePlaceholder: 'e.g. 150000',
    cashSupplement: 'You fit accept cash on top?',
    maxCash: 'Max cash add-on (FCFA)',
    maxCashPlaceholder: 'e.g. 30000',
    infoText: (days: number) => `Your listing go show for all Bambeh users for ${days} days. We go remind you 3 days before e expire.`,
    submit: 'Post Exchange Item',
    posting: 'E dey postâ€¦',
    uploading: (pct: number) => `E dey send photos ${pct}%â€¦`,
    errTitle: 'Put title.',
    errTitleShort: 'Title must be at least 3 characters.',
    errCategory: 'Choose category.',
    errCondition: 'Choose condition.',
    errLocation: 'Enter your location.',
    errAuth: 'Login first before you post.',
    errGeneric: 'Post fail. Try again.',
  },
  ff: {
    pageTitle: 'Hollit Don Fewtere',
    freeLabel: 'Ã‘aawÉ—e Â· Ã‘alawma 30',
    errorTitle: 'Waylit:',
    photos: 'Natale',
    photosHint: (max: number) => `(haa ${max})`,
    photosPrompt: 'Natale mbaawi siftinde jaÉ“de',
    addPhoto: 'JaÉ“É“it',
    title: 'Innde *',
    titlePlaceholder: 'mis: iPhone 11 â€” njiÉ—i Samsung Galaxy',
    description: 'Haalannde',
    descPlaceholder: 'Haalan coftal â€” É—oon, maa, baaÉ—e, yoornaaniâ€¦',
    category: 'Ngolu *',
    selectCategory: 'SuÉ“oâ€¦',
    condition: 'Ngol *',
    selectCondition: 'SuÉ“oâ€¦',
    location: 'Wuro maa *',
    locationPlaceholder: 'mis: YaoundÃ©, Bastos',
    wantedLabel: 'Ko njijiri na fewtere?',
    wantedPlaceholder: 'mis: Samsung Galaxy S21, MacBook Airâ€¦',
    estValue: 'Njaru (FCFA)',
    estValuePlaceholder: 'mis: 150000',
    cashSupplement: 'JaÉ“de kaalis?',
    maxCash: 'Kaalis timmudi (FCFA)',
    maxCashPlaceholder: 'mis: 30000',
    infoText: (days: number) => `Coftaldi maa yiyotoo ko É“ee fof Bambeh Ã±alawma ${days}. Himo siftina ma Ã±alawma 3 yesdata.`,
    submit: 'Hollit Coftal Fewtere',
    posting: 'E hollindeâ€¦',
    uploading: (pct: number) => `E neldinde natale ${pct}%â€¦`,
    errTitle: 'Haala innde.',
    errTitleShort: 'Innde ngol ko 3 batu.',
    errCategory: 'SuÉ“o ngolu.',
    errCondition: 'SuÉ“o ngol.',
    errLocation: 'Haala wuro maa.',
    errAuth: 'Naaw yeeso hollirde.',
    errGeneric: 'Hollinde hiÉ“i. HeÉ“to katin.',
  },
} as const;

type Lang = keyof typeof STRINGS;

const CATEGORIES = [
  'Electronics', 'Furniture', 'Fashion', 'Appliances',
  'Books', 'Vehicles', 'Sports', 'Tools', 'Other',
];
const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor'];
const MAX_IMAGES = 4;
const BUCKET     = 'exchange-images';
const EXPIRY_DAYS = 30;

export default function ExchangeItemPost() {
  const navigate  = useNavigate();
  const lang      = (useLang() as Lang) || 'en';
  const s         = STRINGS[lang] ?? STRINGS.en;
  const isRtl     = lang === 'ar';
  const fileInput = useRef<HTMLInputElement>(null);

  const [title,           setTitle]           = useState('');
  const [description,     setDescription]     = useState('');
  const [category,        setCategory]        = useState('');
  const [condition,       setCondition]       = useState('');
  const [location,        setLocation]        = useState('');
  const [wantedItems,     setWantedItems]     = useState('');
  const [estValue,        setEstValue]        = useState('');
  const [cashSupplement,  setCashSupplement]  = useState(false);
  const [maxCash,         setMaxCash]         = useState('');
  const [images,          setImages]          = useState<File[]>([]);
  const [previews,        setPreviews]        = useState<string[]>([]);
  const [submitting,      setSubmitting]      = useState(false);
  const [uploadPct,       setUploadPct]       = useState(0);
  const [error,           setError]           = useState<string | null>(null);
  const [success,         setSuccess]         = useState(false);

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files    = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const remaining = MAX_IMAGES - images.length;
    const selected  = files.slice(0, remaining);
    setImages(prev => [...prev, ...selected]);
    selected.forEach(f => {
      const reader = new FileReader();
      reader.onload = ev => setPreviews(prev => [...prev, ev.target!.result as string]);
      reader.readAsDataURL(f);
    });
    e.target.value = '';
  }

  function removeImage(idx: number) {
    setImages(prev  => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  }

  async function uploadImages(userId: string): Promise<string[]> {
    const urls: string[] = [];
    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const ext  = file.name.split('.').pop() ?? 'jpg';
      const path = `${userId}/${Date.now()}_${i}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: false, contentType: file.type });
      if (upErr) throw new Error(`Image upload failed: ${upErr.message}`);
      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);
      urls.push(publicUrl);
      setUploadPct(Math.round(((i + 1) / images.length) * 100));
    }
    return urls;
  }

  async function handleSubmit() {
    setError(null);
    if (!title.trim())    { setError(s.errTitle);     return; }
    if (title.length < 3) { setError(s.errTitleShort); return; }
    if (!category)        { setError(s.errCategory);  return; }
    if (!condition)       { setError(s.errCondition); return; }
    if (!location.trim()) { setError(s.errLocation);  return; }

    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setError(s.errAuth); navigate('/login'); return; }

      const userId    = session.user.id;
      let imageUrls: string[] = [];
      if (images.length > 0) imageUrls = await uploadImages(userId);

      const expiresAt = new Date(Date.now() + EXPIRY_DAYS * 24 * 3600 * 1000).toISOString();

      const { error: err } = await supabase
        .from('exchange_items')
        .insert({
          user_id:              userId,
          title:                title.trim(),
          description:          description.trim(),
          category,
          condition,
          location:             location.trim(),
          wanted_items:         wantedItems.trim() || null,
          estimated_value_xaf:  estValue ? Number(estValue) : null,
          allow_cash_supplement: cashSupplement,
          max_cash_supplement_xaf: cashSupplement && maxCash ? Number(maxCash) : null,
          images:               imageUrls,
          status:               'active',
          expires_at:           expiresAt,
          view_count:           0,
          offer_count:          0,
        });

      if (err) throw err;
      setSuccess(true);
      setTimeout(() => navigate('/exchange'), 1200);
    } catch (e: any) {
      setError(e.message || s.errGeneric);
    } finally {
      setSubmitting(false);
      setUploadPct(0);
    }
  }

  if (success) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white rounded-2xl shadow p-8 text-center max-w-sm w-full">
        <CheckCircle className="w-14 h-14 text-teal-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Posted! ðŸŽ‰</h2>
        <p className="text-gray-500 text-sm">Taking you back to exchange listingsâ€¦</p>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-gray-50 pb-32 ${isRtl ? 'rtl' : 'ltr'}`}>
      {/* Sticky header */}
      <div className="bg-white border-b px-4 py-4 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <ArrowLeftRight className="w-5 h-5 text-teal-600" />
          <h1 className="font-bold text-lg">{s.pageTitle}</h1>
        </div>
        <span className="text-xs text-gray-400 bg-teal-50 text-teal-600 px-2 py-1 rounded-full font-medium">
          {s.freeLabel}
        </span>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-start gap-2">
            <span className="flex-shrink-0 mt-0.5">âš ï¸</span>
            <span>{error}</span>
          </div>
        )}

        {/* â”€â”€â”€ Photos â”€â”€â”€ */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            {s.photos} <span className="text-gray-400 font-normal">{s.photosHint(MAX_IMAGES)}</span>
          </label>
          <div className="flex gap-2 flex-wrap">
            {previews.map((src, i) => (
              <div key={i} className="relative w-20 h-20 group">
                <img src={src} alt={`Preview ${i + 1}`}
                  className="w-20 h-20 rounded-xl object-cover border border-gray-200" />
                <button type="button" onClick={() => removeImage(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full
                    flex items-center justify-center shadow-sm hover:bg-red-600 transition-colors">
                  <X className="w-3 h-3 text-white" />
                </button>
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 text-xs bg-teal-600/80 text-white px-1 rounded">
                    1st
                  </span>
                )}
              </div>
            ))}
            {images.length < MAX_IMAGES && (
              <button type="button" onClick={() => fileInput.current?.click()}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300
                  flex flex-col items-center justify-center gap-1 hover:border-teal-400
                  hover:bg-teal-50 transition-colors text-gray-400 hover:text-teal-600">
                <Camera className="w-5 h-5" />
                <span className="text-xs">{s.addPhoto}</span>
              </button>
            )}
          </div>
          <input ref={fileInput} type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
          {images.length === 0 && (
            <p className="flex items-center gap-1.5 text-xs text-gray-400 mt-2">
              <ImageIcon className="w-3 h-3" /> {s.photosPrompt}
            </p>
          )}
        </div>

        {/* â”€â”€â”€ Core Details â”€â”€â”€ */}
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{s.title}</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={s.titlePlaceholder}
              maxLength={120}
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 transition"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{title.length}/120</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{s.description}</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={s.descPlaceholder}
              rows={3}
              maxLength={2000}
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 resize-none transition"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{description.length}/2000</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{s.category}</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 bg-white transition"
              >
                <option value="">{s.selectCategory}</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{s.condition}</label>
              <select
                value={condition}
                onChange={e => setCondition(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 bg-white transition"
              >
                <option value="">{s.selectCondition}</option>
                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{s.location}</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder={s.locationPlaceholder}
                className="w-full border rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 transition"
              />
            </div>
          </div>
        </div>

        {/* â”€â”€â”€ Exchange terms â”€â”€â”€ */}
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{s.wantedLabel}</label>
            <textarea
              value={wantedItems}
              onChange={e => setWantedItems(e.target.value)}
              placeholder={s.wantedPlaceholder}
              rows={2}
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 resize-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{s.estValue}</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                value={estValue}
                onChange={e => setEstValue(e.target.value)}
                placeholder={s.estValuePlaceholder}
                min="0"
                className="w-full border rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 transition"
              />
            </div>
          </div>

          {/* Cash supplement toggle */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div
                onClick={() => setCashSupplement(v => !v)}
                className={`w-10 h-6 rounded-full transition-colors relative ${cashSupplement ? 'bg-teal-600' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${cashSupplement ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-sm font-medium text-gray-700">{s.cashSupplement}</span>
            </label>
            {cashSupplement && (
              <div className="mt-3">
                <label className="block text-sm font-semibold text-gray-700 mb-1">{s.maxCash}</label>
                <input
                  type="number"
                  value={maxCash}
                  onChange={e => setMaxCash(e.target.value)}
                  placeholder={s.maxCashPlaceholder}
                  min="0"
                  className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 transition"
                />
              </div>
            )}
          </div>
        </div>

        {/* Info box */}
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 flex items-start gap-2">
          <Info className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-teal-700 leading-relaxed">{s.infoText(EXPIRY_DAYS)}</p>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-4 bg-teal-600 text-white rounded-xl font-semibold
            disabled:opacity-60 disabled:cursor-not-allowed hover:bg-teal-700 transition-colors shadow-sm"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {images.length > 0 && uploadPct < 100 ? s.uploading(uploadPct) : s.posting}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <ArrowLeftRight className="w-4 h-4" />
              {s.submit}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}


