// BAMBEH_DEPLOY_TOKEN__VEHICLEDETAILS_FIX83_CLEAN
// FIX83: Per-item chat (listingId passed to /chat) + real "Request Test Ride"
//        now opens BookTestDriveModal (date/time/phone/note → booking-card
//        message in chat). "Message Seller" stays chat.
// FIX65: Rebuilt from the dead Firebase page (getVehicleById → "not found")
//        to read the real Supabase `listings` row (type='vehicle', specs in
//        `extra`). Contact is CHAT-ONLY (no phone/email).
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Share2, AlertCircle, Check, MessageCircle,
  Fuel, Gauge, Calendar, Cog, Car, Loader2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/hooks/useAppLang';
import BookTestDriveModal from '@/components/booking/BookTestDriveModal';

const STR: Record<string, Record<string, string>> = {
  en: { back: 'Back', notFound: 'Vehicle not found.', backToList: 'Back to Vehicles', verified: 'Verified',
        negotiable: 'Negotiable', mileage: 'Mileage', year: 'Year', fuel: 'Fuel', transmission: 'Transmission',
        details: 'Vehicle Details', color: 'Color', engine: 'Engine', views: 'Views', posted: 'Posted',
        description: 'Description', features: 'Features', seller: 'Seller', message: 'Message Seller',
        testRide: 'Request Test Ride', share: 'Share', linkCopied: 'Link copied' },
  fr: { back: 'Retour', notFound: 'Véhicule introuvable.', backToList: 'Retour aux véhicules', verified: 'Vérifié',
        negotiable: 'Négociable', mileage: 'Kilométrage', year: 'Année', fuel: 'Carburant', transmission: 'Boîte',
        details: 'Détails du véhicule', color: 'Couleur', engine: 'Moteur', views: 'Vues', posted: 'Publié',
        description: 'Description', features: 'Équipements', seller: 'Vendeur', message: 'Contacter le vendeur',
        testRide: 'Demander un essai', share: 'Partager', linkCopied: 'Lien copié' },
  pidgin: { back: 'Go back', notFound: 'We no fit find dis vehicle.', backToList: 'Back to Vehicles', verified: 'Verified',
        negotiable: 'Negotiable', mileage: 'Mileage', year: 'Year', fuel: 'Fuel', transmission: 'Gear',
        details: 'Vehicle Details', color: 'Color', engine: 'Engine', views: 'Views', posted: 'Posted',
        description: 'Description', features: 'Features', seller: 'Seller', message: 'Message di Seller',
        testRide: 'Ask for Test Ride', share: 'Share', linkCopied: 'Link copied' },
  ar: { back: 'رجوع', notFound: 'المركبة غير موجودة.', backToList: 'العودة إلى المركبات', verified: 'موثّق',
        negotiable: 'قابل للتفاوض', mileage: 'المسافة', year: 'السنة', fuel: 'الوقود', transmission: 'ناقل الحركة',
        details: 'تفاصيل المركبة', color: 'اللون', engine: 'المحرك', views: 'المشاهدات', posted: 'نُشر',
        description: 'الوصف', features: 'المزايا', seller: 'البائع', message: 'مراسلة البائع',
        testRide: 'طلب تجربة قيادة', share: 'مشاركة', linkCopied: 'تم نسخ الرابط' },
  ff: { back: 'Rutto', notFound: 'Otomobil o heɓaaka.', backToList: 'Rutto e otooji', verified: 'Goongɗinaaɗo',
        negotiable: 'Ina waawi yeeyeede', mileage: 'Njaajeendi', year: 'Hitaande', fuel: 'Karmedian', transmission: 'Waylo',
        details: 'Fannuuji otomobil', color: 'Noorder', engine: 'Motoor', views: 'Njiyaali', posted: 'Winndaama',
        description: 'Sifa', features: 'Keɓe', seller: 'Njeeygotooɗo', message: 'Neldu njeeygotooɗo',
        testRide: 'Ɗaɓɓu ndaarndagol', share: 'Lolluɗe', linkCopied: 'Ceŋngal loowaama' },
};
function tr(lang: string, k: string) { return (STR[lang] && STR[lang][k]) || STR.en[k] || k; }

interface Row { [key: string]: any; }

export default function VehicleDetails() {
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
        <button onClick={() => navigate('/vehicles')} className="mt-2 flex items-center gap-2 text-teal-600">
          <ArrowLeft className="h-4 w-4" /> {tr(lang, 'backToList')}
        </button>
      </div>
    );
  }

  const extra: Row = row.extra || {};
  const images: string[] = Array.isArray(row.images) ? row.images : [];
  const make = extra.make || '';
  const model = extra.model || '';
  const year = extra.year || '';
  const heading = (make || model)
    ? `${year ? year + ' ' : ''}${make} ${model}`.trim()
    : (row.title || 'Vehicle');
  const currency = row.currency || 'XAF';
  const sellerId = row.user_id || row.seller_id;
  const isOwn = me && sellerId && String(me.id) === String(sellerId);

  const specs = [
    extra.mileage && { icon: Gauge, label: tr(lang, 'mileage'), value: String(extra.mileage) },
    year && { icon: Calendar, label: tr(lang, 'year'), value: String(year) },
    extra.fuel && { icon: Fuel, label: tr(lang, 'fuel'), value: String(extra.fuel) },
    extra.transmission && { icon: Cog, label: tr(lang, 'transmission'), value: String(extra.transmission) },
  ].filter(Boolean) as { icon: any; label: string; value: string }[];

  const shareLink = async () => {
    try {
      if (navigator.share) await navigator.share({ title: heading, url: window.location.href });
      else await navigator.clipboard.writeText(window.location.href);
    } catch { /* user cancelled */ }
  };

  const openChat = (prefix?: string) => {
    if (!sellerId) return;
    const title = prefix ? `${prefix}: ${heading}` : heading;
    navigate(`/chat?userId=${sellerId}&listingId=${row.id}&listingTitle=${encodeURIComponent(title)}&listingImage=${encodeURIComponent(images[0] ?? '')}`);
  };

  const features: string[] = Array.isArray(extra.features) ? extra.features : [];

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
          <img src={images[imgIndex]} alt={heading} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Car className="h-12 w-12 text-gray-300" />
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
            <h1 className="text-2xl font-bold text-gray-900">{heading}</h1>
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
            {extra.negotiable && (
              <span className="ml-2 align-middle text-xs font-medium text-gray-500 border border-gray-200 rounded-full px-2 py-0.5">
                {tr(lang, 'negotiable')}
              </span>
            )}
          </div>
        </div>

        {/* Specs */}
        {specs.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {specs.map((s, i) => (
              <div key={i} className="text-center">
                <s.icon className="h-5 w-5 mx-auto mb-1 text-gray-400" />
                <div className="font-semibold text-sm text-gray-900 capitalize">{s.value}</div>
                <div className="text-xs text-gray-400">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Extra details */}
        {(extra.color || extra.engine || extra.engine_size || row.view_count != null || row.created_at) && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h2 className="font-semibold text-gray-900 mb-3">{tr(lang, 'details')}</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {extra.color && <div><span className="text-gray-400">{tr(lang, 'color')}:</span> <span className="font-medium">{extra.color}</span></div>}
              {(extra.engine || extra.engine_size) && <div><span className="text-gray-400">{tr(lang, 'engine')}:</span> <span className="font-medium">{extra.engine || extra.engine_size}</span></div>}
              {row.view_count != null && <div><span className="text-gray-400">{tr(lang, 'views')}:</span> <span className="font-medium">{row.view_count}</span></div>}
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

        {/* Features */}
        {features.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h2 className="font-semibold text-gray-900 mb-2">{tr(lang, 'features')}</h2>
            <div className="grid grid-cols-2 gap-2">
              {features.map((f, i) => (
                <div key={i} className="flex items-center text-sm">
                  <Check className="h-4 w-4 mr-2 text-emerald-500" /> {f}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fixed actions */}
      {!isOwn && sellerId && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <div className="max-w-3xl mx-auto grid grid-cols-2 gap-3">
            <button onClick={() => setShowBook(true)}
              className="w-full flex items-center justify-center gap-2 border border-teal-200 text-teal-700 hover:bg-teal-50 font-semibold py-3 rounded-xl transition-colors">
              <Car className="h-4 w-4" /> {tr(lang, 'testRide')}
            </button>
            <button onClick={() => openChat()}
              className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition-colors">
              <MessageCircle className="h-4 w-4" /> {tr(lang, 'message')}
            </button>
          </div>
        </div>
      )}

      {/* Request Test Ride modal */}
      <BookTestDriveModal isOpen={showBook} onClose={() => setShowBook(false)} listing={row} />
    </div>
  );
}
// BAMBEH_END_TOKEN__VEHICLEDETAILS_FIX83__COMPLETE
