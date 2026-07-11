// BAMBEH_DEPLOY_TOKEN__RENTALDETAILS_FIX83_CLEAN
// FIX83: Per-item chat (listingId passed to /chat) + real "Book Site Visit"
//        now opens BookVisitModal (date/time/phone/note → booking-card message
//        in chat) instead of a plain chat prefix. "Message Owner" stays chat.
// FIX65: Rebuilt from the dead Firebase page (getRentalById → "Rental not
//        found" because Firebase has no data) to read the real Supabase
//        `listings` row (type='rental', details in `extra`). Contact is
//        CHAT-ONLY (no phone/email).
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Bed, Bath, Home, Share2, AlertCircle, Check,
  MessageCircle, CalendarCheck, Loader2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/hooks/useAppLang';
import BookVisitModal from '@/components/booking/BookVisitModal';

const STR: Record<string, Record<string, string>> = {
  en: { back: 'Back', notFound: 'Rental not found.', backToList: 'Back to Rentals', verified: 'Verified',
        bedrooms: 'Bedrooms', bathrooms: 'Bathrooms', area: 'Area', details: 'Property Details', type: 'Type',
        furnished: 'Furnished', deposit: 'Deposit', posted: 'Posted', yes: 'Yes', no: 'No',
        description: 'Description', amenities: 'Amenities', owner: 'Owner', message: 'Message Owner',
        book: 'Book Site Visit', share: 'Share', perMonth: 'month' },
  fr: { back: 'Retour', notFound: 'Logement introuvable.', backToList: 'Retour aux locations', verified: 'Vérifié',
        bedrooms: 'Chambres', bathrooms: 'Salles de bain', area: 'Surface', details: 'Détails du bien', type: 'Type',
        furnished: 'Meublé', deposit: 'Caution', posted: 'Publié', yes: 'Oui', no: 'Non',
        description: 'Description', amenities: 'Équipements', owner: 'Propriétaire', message: 'Contacter le propriétaire',
        book: 'Réserver une visite', share: 'Partager', perMonth: 'mois' },
  pidgin: { back: 'Go back', notFound: 'We no fit find dis house.', backToList: 'Back to Rentals', verified: 'Verified',
        bedrooms: 'Bedrooms', bathrooms: 'Bathrooms', area: 'Area', details: 'Property Details', type: 'Type',
        furnished: 'Furnished', deposit: 'Deposit', posted: 'Posted', yes: 'Yes', no: 'No',
        description: 'Description', amenities: 'Amenities', owner: 'Owner', message: 'Message di Owner',
        book: 'Book Site Visit', share: 'Share', perMonth: 'month' },
  ar: { back: 'رجوع', notFound: 'العقار غير موجود.', backToList: 'العودة إلى الإيجارات', verified: 'موثّق',
        bedrooms: 'غرف النوم', bathrooms: 'الحمامات', area: 'المساحة', details: 'تفاصيل العقار', type: 'النوع',
        furnished: 'مفروش', deposit: 'التأمين', posted: 'نُشر', yes: 'نعم', no: 'لا',
        description: 'الوصف', amenities: 'المرافق', owner: 'المالك', message: 'مراسلة المالك',
        book: 'حجز زيارة', share: 'مشاركة', perMonth: 'شهر' },
  ff: { back: 'Rutto', notFound: 'Galle o heɓaaka.', backToList: 'Rutto e luwaali', verified: 'Goongɗinaaɗo',
        bedrooms: 'Suudu ɗaanorɗe', bathrooms: 'Suudu lootorɗe', area: 'Njaajeendi', details: 'Fannuuji galle', type: 'Sifaa',
        furnished: ' Hodoraaɗo', deposit: 'Dammbugol', posted: 'Winndaama', yes: 'Eey', no: 'Alaa',
        description: 'Sifa', amenities: 'Keɓe', owner: 'Jom galle', message: 'Neldu jom galle',
        book: 'Waɗ yiilo', share: 'Lolluɗe', perMonth: 'lewru' },
};
function tr(lang: string, k: string) { return (STR[lang] && STR[lang][k]) || STR.en[k] || k; }

interface Row { [key: string]: any; }
const pick = (o: Row, ...keys: string[]) => { for (const k of keys) if (o[k] != null && o[k] !== '') return o[k]; return undefined; };

export default function RentalDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const langRaw: any = useLang();
  const lang: string = typeof langRaw === 'string' ? langRaw : langRaw?.lang || 'en';
  const auth: any = useAuth();
  const me = auth?.currentUser || auth?.user || null;

  const [row, setRow] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);
  const [showBook, setShowBook] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id) { setLoading(false); return; }
      setLoading(true);
      const { data } = await supabase.from('listings').select('*').eq('id', id).maybeSingle();
      if (!cancelled) { setRow(data || null); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!row) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <AlertCircle className="h-14 w-14 text-gray-300 mb-3" />
        <h2 className="text-xl font-bold mb-2">{tr(lang, 'notFound')}</h2>
        <button onClick={() => navigate('/rentals')} className="mt-2 flex items-center gap-2 text-teal-600">
          <ArrowLeft className="h-4 w-4" /> {tr(lang, 'backToList')}
        </button>
      </div>
    );
  }

  const extra: Row = row.extra || {};
  const images: string[] = Array.isArray(row.images) ? row.images : [];
  const currency = row.currency || 'XAF';
  const ownerId = row.user_id || row.owner_id;
  const isOwn = me && ownerId && String(me.id) === String(ownerId);

  const bedrooms = pick(extra, 'bedrooms', 'bedroom', 'beds');
  const bathrooms = pick(extra, 'bathrooms', 'bathroom', 'baths');
  const area = pick(extra, 'area', 'surface', 'size');
  const furnished = pick(extra, 'furnished');
  const deposit = pick(extra, 'deposit', 'caution');
  const propType = pick(extra, 'property_type', 'type', 'category') || row.category;
  const period = pick(extra, 'period', 'frequency') || 'month';
  const amenities: string[] = Array.isArray(extra.amenities) ? extra.amenities : [];
  const feats = [
    bedrooms != null && { icon: Bed, label: tr(lang, 'bedrooms'), value: String(bedrooms) },
    bathrooms != null && { icon: Bath, label: tr(lang, 'bathrooms'), value: String(bathrooms) },
    area != null && { icon: Home, label: tr(lang, 'area'), value: `${area} m2` },
  ].filter(Boolean) as { icon: any; label: string; value: string }[];

  const shareLink = async () => {
    try {
      if (navigator.share) await navigator.share({ title: row.title, url: window.location.href });
      else await navigator.clipboard.writeText(window.location.href);
    } catch { /* user cancelled */ }
  };

  const openChat = (prefix?: string) => {
    if (!ownerId) return;
    const title = prefix ? `${prefix}: ${row.title || 'Rental'}` : (row.title || 'Rental');
    navigate(`/chat?userId=${ownerId}&listingId=${row.id}&listingTitle=${encodeURIComponent(title)}&listingImage=${encodeURIComponent(images[0] ?? '')}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-gray-100" aria-label={tr(lang, 'back')}>
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button onClick={shareLink} className="p-2 rounded-xl hover:bg-gray-100" aria-label={tr(lang, 'share')}>
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Gallery */}
      <div className="relative bg-gray-100 aspect-video max-w-3xl mx-auto">
        {images.length ? (
          <img src={images[imgIndex]} alt={row.title || ''} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Home className="h-12 w-12 text-gray-300" />
          </div>
        )}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
            {images.map((_, i) => (
              <button key={i} onClick={() => setImgIndex(i)}
                className={`h-2 rounded-full transition-all ${i === imgIndex ? 'bg-white w-6' : 'bg-white/50 w-2'}`} />
            ))}
          </div>
        )}
      </div>

      <div className="max-w-3xl mx-auto px-4 py-5 space-y-4">
        {/* Title + price */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-2xl font-bold text-gray-900 flex-1">{row.title || 'Rental'}</h1>
            {row.verified && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                <Check className="h-3 w-3" /> {tr(lang, 'verified')}
              </span>
            )}
          </div>
          {row.location && (
            <p className="flex items-center gap-1 text-sm text-gray-500 mt-1">
              <MapPin className="h-4 w-4" /> {row.location}
            </p>
          )}
          <div className="text-3xl font-bold text-teal-600 mt-2">
            {Number(row.price || 0).toLocaleString()} {currency}
            <span className="text-base font-normal text-gray-400">/{tr(lang, 'perMonth')}</span>
          </div>
        </div>

        {/* Features */}
        {feats.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 grid grid-cols-3 gap-4">
            {feats.map((f, i) => (
              <div key={i} className="text-center">
                <f.icon className="h-5 w-5 mx-auto mb-1 text-gray-400" />
                <div className="font-semibold text-sm text-gray-900">{f.value}</div>
                <div className="text-xs text-gray-400">{f.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Property details */}
        {(propType || furnished != null || deposit != null || row.created_at) && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h2 className="font-semibold text-gray-900 mb-3">{tr(lang, 'details')}</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {propType && <div><span className="text-gray-400">{tr(lang, 'type')}:</span> <span className="font-medium capitalize">{propType}</span></div>}
              {furnished != null && <div><span className="text-gray-400">{tr(lang, 'furnished')}:</span> <span className="font-medium">{furnished ? tr(lang, 'yes') : tr(lang, 'no')}</span></div>}
              {deposit != null && <div><span className="text-gray-400">{tr(lang, 'deposit')}:</span> <span className="font-medium">{Number(deposit).toLocaleString()} {currency}</span></div>}
              {row.created_at && <div><span className="text-gray-400">{tr(lang, 'posted')}:</span> <span className="font-medium">{new Date(row.created_at).toLocaleDateString()}</span></div>}
            </div>
          </div>
        )}

        {/* Description */}
        {(extra.description || row.description) && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h2 className="font-semibold text-gray-900 mb-2">{tr(lang, 'description')}</h2>
            <p className="text-sm text-gray-600 whitespace-pre-line">{extra.description || row.description}</p>
          </div>
        )}

        {/* Amenities */}
        {amenities.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h2 className="font-semibold text-gray-900 mb-2">{tr(lang, 'amenities')}</h2>
            <div className="grid grid-cols-2 gap-2">
              {amenities.map((a, i) => (
                <div key={i} className="flex items-center text-sm">
                  <Check className="h-4 w-4 mr-2 text-emerald-500" /> {a}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fixed actions */}
      {!isOwn && ownerId && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <div className="max-w-3xl mx-auto grid grid-cols-2 gap-3">
            <button onClick={() => setShowBook(true)}
              className="w-full flex items-center justify-center gap-2 border border-teal-200 text-teal-700 hover:bg-teal-50 font-semibold py-3 rounded-xl transition-colors">
              <CalendarCheck className="h-4 w-4" /> {tr(lang, 'book')}
            </button>
            <button onClick={() => openChat()}
              className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition-colors">
              <MessageCircle className="h-4 w-4" /> {tr(lang, 'message')}
            </button>
          </div>
        </div>
      )}

      {/* Book Site Visit modal */}
      <BookVisitModal isOpen={showBook} onClose={() => setShowBook(false)} listing={row} />
    </div>
  );
}
// BAMBEH_END_TOKEN__RENTALDETAILS_FIX83__COMPLETE
