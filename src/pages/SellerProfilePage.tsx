// BAMBEH_DEPLOY_TOKEN__SellerProfilePage_FIX68_CLEAN
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star,
  MessageCircle,
  MapPin,
  Package,
  Loader2,
  ArrowLeft,
  ShieldCheck,
  Clock,
} from 'lucide-react';

/* ============================================================
   ⚠️  VERIFY THESE 3 IMPORT PATHS AGAINST YOUR REPO BEFORE BUILD
   Run the recon command I gave you, then fix any line below that
   does not match. Everything else in this file is path-safe.
   ============================================================ */
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useLang';
import { useAuth } from '@/contexts/AuthContext';
/* ============================================================ */

// ---- Inline i18n (per-component dict, EN fallback) ----------
const STR: Record<string, Record<string, string>> = {
  en: {
    back: 'Back',
    seller: 'Seller',
    notFound: 'Seller not found.',
    verified: 'Verified',
    member: 'Member',
    anon: 'Bambeh User',
    reviewsTitle: 'Reviews & Ratings',
    noReviews: 'No reviews yet.',
    listingsTitle: 'Listings',
    noListings: 'No active listings.',
    message: 'Message Seller',
    ratingWord: 'rating',
    ratingsWord: 'ratings',
    itemsWord: 'items',
    seller_reply: 'Seller replied',
    lastSeen: 'Last seen',
  },
  fr: {
    back: 'Retour',
    seller: 'Vendeur',
    notFound: 'Vendeur introuvable.',
    verified: 'Vérifié',
    member: 'Membre',
    anon: 'Utilisateur Bambeh',
    reviewsTitle: 'Avis et notes',
    noReviews: 'Aucun avis pour le moment.',
    listingsTitle: 'Annonces',
    noListings: 'Aucune annonce active.',
    message: 'Contacter le vendeur',
    ratingWord: 'note',
    ratingsWord: 'notes',
    itemsWord: 'articles',
    seller_reply: 'Le vendeur a répondu',
    lastSeen: 'Vu pour la dernière fois',
  },
  pidgin: {
    back: 'Go back',
    seller: 'Seller',
    notFound: 'We no fit find dis seller.',
    verified: 'Verified',
    member: 'Member',
    anon: 'Bambeh User',
    reviewsTitle: 'Review dem & Rating',
    noReviews: 'No review dey yet.',
    listingsTitle: 'Wetin dem dey sell',
    noListings: 'No active listing dey.',
    message: 'Message di Seller',
    ratingWord: 'rating',
    ratingsWord: 'ratings',
    itemsWord: 'items',
    seller_reply: 'Seller don reply',
    lastSeen: 'Last time we see am',
  },
  ar: {
    back: 'رجوع',
    seller: 'البائع',
    notFound: 'لم يتم العثور على البائع.',
    verified: 'موثّق',
    member: 'عضو',
    anon: 'مستخدم Bambeh',
    reviewsTitle: 'التقييمات والمراجعات',
    noReviews: 'لا توجد مراجعات بعد.',
    listingsTitle: 'الإعلانات',
    noListings: 'لا توجد إعلانات نشطة.',
    message: 'مراسلة البائع',
    ratingWord: 'تقييم',
    ratingsWord: 'تقييمات',
    itemsWord: 'عناصر',
    seller_reply: 'رد البائع',
    lastSeen: 'آخر ظهور',
  },
  ff: {
    back: 'Rutto',
    seller: 'Njeeygotooɗo',
    notFound: 'Njeeygotooɗo o heɓaaka.',
    verified: 'Goongɗinaaɗo',
    member: 'Terɗe',
    anon: 'Kuɓtodinoowo Bambeh',
    reviewsTitle: 'Miijooji & Njeñtudi',
    noReviews: 'Miijo alaa tawo.',
    listingsTitle: 'Njeeygu',
    noListings: 'Njeeygu ngaadu alaa.',
    message: 'Neldu njeeygotooɗo',
    ratingWord: 'njeñtudi',
    ratingsWord: 'njeñtudi',
    itemsWord: 'kuutee',
    seller_reply: 'Njeeygotooɗo jaabii',
    lastSeen: 'Sakkitii yiyeede',
  },
};

function tr(lang: string, key: string): string {
  return (STR[lang] && STR[lang][key]) || STR.en[key] || key;
}

// ---- Types --------------------------------------------------
interface ListingRow {
  id: string;
  title?: string;
  name?: string;
  price?: number;
  currency?: string;
  type?: string;
  images?: string[];
  location?: string;
  created_at?: string;
}
interface ReviewRow {
  id: string;
  reviewer_id?: string;
  rating?: number;
  comment?: string;
  response?: string;
  created_at?: string;
}
interface ProfileRow {
  id: string;
  full_name?: string;
  display_name?: string;
  username?: string;
  avatar_url?: string;
  location?: string;
  is_verified?: boolean;
  last_seen?: string;
  created_at?: string;
}

// ---- Small presentational helpers ---------------------------
function StarRow({ value, size = 16 }: { value: number; size?: number }) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= Math.floor(rounded);
        const half = !filled && i - 0.5 === rounded;
        return (
          <Star
            key={i}
            size={size}
            className={filled || half ? 'text-amber-400' : 'text-gray-300'}
            fill={filled ? 'currentColor' : half ? 'url(#half)' : 'none'}
          />
        );
      })}
    </span>
  );
}

export default function SellerProfilePage() {
  const params = useParams();
  const sellerId =
    (params.id as string) ||
    (params.sellerId as string) ||
    (params.userId as string) ||
    '';
  const navigate = useNavigate();

  // defensive: useLang may return a string or an object
  const langRaw: any = useLang();
  const lang: string =
    typeof langRaw === 'string' ? langRaw : langRaw?.lang || 'en';

  const auth: any = useAuth();
  const me = auth?.currentUser || auth?.user || null;

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [reviewerMap, setReviewerMap] = useState<Record<string, ProfileRow>>({});

  useEffect(() => {
    if (sellerId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellerId]);

  async function load() {
    setLoading(true);
    try {
      // 1) seller profile
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sellerId)
        .maybeSingle();
      setProfile((prof as ProfileRow) || null);

      // 2) their live listings (single listings table) + exchange_items
      const { data: lst } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', sellerId)
        .order('created_at', { ascending: false });

      let exchange: ListingRow[] = [];
      const { data: exch } = await supabase
        .from('exchange_items')
        .select('*')
        .eq('user_id', sellerId)
        .order('created_at', { ascending: false });
      exchange = (exch || []).map((e: any) => ({ ...e, type: 'exchange' }));

      setListings([...((lst as ListingRow[]) || []), ...exchange]);

      // 3) seller reviews
      const { data: rev } = await supabase
        .from('reviews')
        .select('*')
        .eq('target_id', sellerId)
        .eq('target_type', 'seller')
        .order('created_at', { ascending: false });
      const reviewRows = (rev as ReviewRow[]) || [];
      setReviews(reviewRows);

      // 4) reviewer profiles (separate fetch — proven-safe pattern, no embed)
      const ids = Array.from(
        new Set(reviewRows.map((r) => r.reviewer_id).filter(Boolean))
      ) as string[];
      if (ids.length) {
        const { data: rp } = await supabase
          .from('profiles')
          .select('*')
          .in('id', ids);
        const map: Record<string, ProfileRow> = {};
        (rp || []).forEach((p: any) => {
          map[p.id] = p;
        });
        setReviewerMap(map);
      }
    } catch (err) {
      // network / transient — leave empty states rather than crash
      // eslint-disable-next-line no-console
      console.error('SellerProfile load error', err);
    } finally {
      setLoading(false);
    }
  }

  // ---- derived rating stats ----
  const count = reviews.length;
  const avg = count
    ? reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / count
    : 0;
  const dist = [5, 4, 3, 2, 1].map(
    (star) =>
      reviews.filter((r) => Math.round(Number(r.rating) || 0) === star).length
  );

  const nameOf = (p: ProfileRow | null | undefined) =>
    p?.display_name || p?.full_name || p?.username || tr(lang, 'anon');

  const isOwn = !!me && String(me.id) === String(sellerId);

  function messageSeller() {
    navigate(
      `/chat?userId=${sellerId}&listingTitle=${encodeURIComponent(
        nameOf(profile)
      )}`
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <Package className="w-12 h-12 text-gray-300 mb-3" />
        <p className="text-gray-600">{tr(lang, 'notFound')}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm"
        >
          {tr(lang, 'back')}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* hidden gradient def for half-stars */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="half">
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>

      {/* header bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100"
            aria-label={tr(lang, 'back')}
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="font-semibold text-gray-900">{tr(lang, 'seller')}</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4">
        {/* profile card */}
        <div className="bg-white rounded-2xl shadow-sm mt-4 p-5">
          <div className="flex items-start gap-4">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={nameOf(profile)}
                className="w-20 h-20 rounded-full object-cover border border-gray-100"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-2xl font-bold text-emerald-700">
                {nameOf(profile).charAt(0).toUpperCase()}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-gray-900 truncate">
                  {nameOf(profile)}
                </h2>
                {profile.is_verified && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3" />
                    {tr(lang, 'verified')}
                  </span>
                )}
              </div>

              {count > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  <StarRow value={avg} size={16} />
                  <span className="text-sm font-semibold text-gray-900">
                    {avg.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({count}{' '}
                    {count === 1
                      ? tr(lang, 'ratingWord')
                      : tr(lang, 'ratingsWord')}
                    )
                  </span>
                </div>
              )}

              {profile.location && (
                <p className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {profile.location}
                </p>
              )}
              {profile.last_seen && (
                <p className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                  <Clock className="w-3 h-3" />
                  {tr(lang, 'lastSeen')}:{' '}
                  {new Date(profile.last_seen).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {!isOwn && (
            <button
              onClick={messageSeller}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              {tr(lang, 'message')}
            </button>
          )}
        </div>

        {/* rating distribution */}
        {count > 0 && (
          <div className="bg-white rounded-2xl shadow-sm mt-4 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">
              {tr(lang, 'reviewsTitle')}
            </h3>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {avg.toFixed(1)}
                </div>
                <StarRow value={avg} size={14} />
                <div className="text-xs text-gray-500 mt-1">
                  {count}{' '}
                  {count === 1
                    ? tr(lang, 'ratingWord')
                    : tr(lang, 'ratingsWord')}
                </div>
              </div>
              <div className="flex-1 space-y-1">
                {[5, 4, 3, 2, 1].map((star, idx) => {
                  const n = dist[idx];
                  const pct = count ? (n / count) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-3">{star}</span>
                      <Star className="w-3 h-3 text-amber-400" fill="currentColor" />
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-6 text-right">
                        {n}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* review list */}
        <div className="bg-white rounded-2xl shadow-sm mt-4 p-5">
          <h3 className="font-semibold text-gray-900 mb-3">
            {tr(lang, 'reviewsTitle')}
          </h3>
          {reviews.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">
              {tr(lang, 'noReviews')}
            </p>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => {
                const rp = r.reviewer_id ? reviewerMap[r.reviewer_id] : null;
                return (
                  <div
                    key={r.id}
                    className="border-b border-gray-50 last:border-0 pb-4 last:pb-0"
                  >
                    <div className="flex items-center gap-2">
                      {rp?.avatar_url ? (
                        <img
                          src={rp.avatar_url}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-500">
                          {nameOf(rp).charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {nameOf(rp)}
                        </p>
                        <StarRow value={Number(r.rating) || 0} size={12} />
                      </div>
                      {r.created_at && (
                        <span className="text-xs text-gray-400">
                          {new Date(r.created_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {r.comment && (
                      <p className="text-sm text-gray-700 mt-2 whitespace-pre-line">
                        {r.comment}
                      </p>
                    )}
                    {r.response && (
                      <div className="mt-2 ml-4 pl-3 border-l-2 border-emerald-200 bg-emerald-50/40 rounded-r-lg py-2 pr-2">
                        <p className="text-xs font-medium text-emerald-700">
                          {tr(lang, 'seller_reply')}
                        </p>
                        <p className="text-sm text-gray-700 whitespace-pre-line">
                          {r.response}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* seller listings */}
        <div className="bg-white rounded-2xl shadow-sm mt-4 p-5">
          <h3 className="font-semibold text-gray-900 mb-3">
            {tr(lang, 'listingsTitle')}{' '}
            <span className="text-sm font-normal text-gray-400">
              ({listings.length} {tr(lang, 'itemsWord')})
            </span>
          </h3>
          {listings.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">
              {tr(lang, 'noListings')}
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {listings.map((l) => {
                const img =
                  Array.isArray(l.images) && l.images.length ? l.images[0] : '';
                return (
                  <div
                    key={`${l.type}-${l.id}`}
                    className="rounded-xl border border-gray-100 overflow-hidden bg-white"
                  >
                    <div className="aspect-square bg-gray-100">
                      {img ? (
                        <img
                          src={img}
                          alt={l.title || l.name || ''}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {l.title || l.name || '-'}
                      </p>
                      {typeof l.price === 'number' && l.price > 0 && (
                        <p className="text-xs text-emerald-600 font-semibold mt-0.5">
                          {l.price.toLocaleString()} {l.currency || 'FCFA'}
                        </p>
                      )}
                      {l.type && (
                        <span className="inline-block mt-1 text-[10px] uppercase tracking-wide text-gray-400">
                          {l.type}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__SellerProfilePage__COMPLETE
