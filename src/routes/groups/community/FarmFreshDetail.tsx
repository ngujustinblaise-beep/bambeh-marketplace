// BAMBEH_DEPLOY_TOKEN__FARMFRESHDETAIL_FIX867_CLEAN
/**
 * src/routes/groups/community/FarmFreshDetail.tsx - Bambeh Marketplace (route /farm-fresh/:id)
 *
 * FIX867 (replaces FIX695) - ONE FARM FRESH PRODUCT, AND BUYING IT SAFELY.
 *   - The photos first (swipe through them), the price tag, organic / delivery, where it is, when it was harvested,
 *     how much is left.
 *   - The farmer, at the moment a buyer decides to trust them: the "verified farmer" mark, the stars buyers gave
 *     (or "No ratings yet"), "Rate this farmer" (the app's rating page), the User Protection line, and "Message the
 *     farmer" (Bambeh chat only - no phone number, ever). The reviews themselves follow lower down.
 *   - BUY NOW goes to the Bambeh Secured Pay checkout (the same page as every Buy Now) with the product, its type and
 *     the farmer, so the payments server reads the real price from the database (FIX862) and holds the units.
 *     The old "Order Now" page wrote an unprotected order straight from the phone; it now opens this page (FIX868).
 *     Buy now is the one filled button on this screen; Add to cart is outlined.
 *   - "How Bambeh protects you" (three steps, in the words of the Terms) is folded away: one tap opens it.
 *   - The view is counted by the database (bambeh_farm_viewed, FIX861) - the old page tried to write the product.
 *   - A farmer looking at their own produce sees it as buyers do, without the buy buttons.
 *   - Colours are the app's theme classes, so the coming Bambeh palette reaches this page with one theme change.
 * Five languages (FIX863), right-to-left for Arabic. (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, BadgeCheck, CalendarDays, Check, ChevronDown, Copy, Leaf, MapPin, MessageCircle, Minus, Package, Plus,
  Share2, ShieldCheck, ShoppingBasket, Sprout, Star, Truck, X,
} from 'lucide-react';
import SellerReviews from '@/components/reviews/SellerReviews';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/hooks/useAppLang';
import { publicShareUrl } from '@/config/storeMode';
import { FARM_STR, categoryLabel, farmFill, farmLang, fcfa, unitLabel } from '@/features/farm/farmText';
import type { FarmKey, FarmLang } from '@/features/farm/farmText';
import { cartLine, farmViewed, fetchFarmProduct, fetchFarmerRating } from '@/features/farm/farmApi';
import type { FarmCard } from '@/features/farm/farmApi';
import { FarmPhoto, NoPhoto, PriceTag, Stars } from '@/features/farm/farmUi';

function fmtDate(iso: string | null, lang: FarmLang): string {
  if (!iso) return '';
  try {
    const loc = lang === 'fr' ? 'fr-FR' : lang === 'ar' ? 'ar' : 'en-GB';
    return new Date(iso).toLocaleDateString(loc, { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso.slice(0, 10);
  }
}

function MiniCard({ p, lang, onOpen }: { p: FarmCard; lang: FarmLang; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen} className="w-36 shrink-0 text-start" data-mini={p.id}>
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
        <FarmPhoto src={p.image} alt={p.title} category={p.category} lang={lang} />
        <span className="absolute bottom-1.5 start-1.5"><PriceTag price={p.price} unit={p.unit} lang={lang} /></span>
      </div>
      <p className="mt-2 line-clamp-1 text-sm font-semibold">{p.title}</p>
      {p.location ? <p className="line-clamp-1 text-xs text-gray-500">{p.location}</p> : null}
    </button>
  );
}

function Fact({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-center gap-2 text-sm text-gray-700">
      <span className="shrink-0 text-gray-400">{icon}</span><span>{children}</span>
    </li>
  );
}

export default function FarmFreshDetail() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const lang = farmLang(useLang());
  const t = FARM_STR[lang];
  const w = (k: FarmKey) => t[k];
  const rtl = lang === 'ar';
  const { addToCart, items: cartItems } = useCart();
  const auth = useAuth() as { user?: { id?: string } | null };
  const me = auth && auth.user && auth.user.id ? auth.user.id : null;

  const [state, setState] = useState<'loading' | 'ok' | 'not_found' | 'network'>('loading');
  const [p, setP] = useState<FarmCard | null>(null);
  const [more, setMore] = useState<FarmCard[]>([]);
  const [same, setSame] = useState<FarmCard[]>([]);
  const [rating, setRating] = useState<{ avg: number; count: number } | null>(null);
  const [qty, setQty] = useState(1);
  const [photo, setPhoto] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const gallery = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let alive = true;
    setState('loading');
    setQty(1);
    setPhoto(0);
    (async () => {
      const r = await fetchFarmProduct(id);
      if (!alive) return;
      if (!r.ok) { setState(r.reason); return; }
      setP(r.product);
      setMore(r.more);
      setSame(r.sameFarmer);
      setState('ok');
      if (!me || r.product.seller_id !== me) void farmViewed(r.product.id);
    })();
    return () => { alive = false; };
  }, [id, me]);

  const sellerId = p ? p.seller_id : null;
  useEffect(() => {
    let alive = true;
    setRating(null);
    if (!sellerId) return () => { alive = false; };
    void fetchFarmerRating(sellerId).then((r) => { if (alive) setRating(r); });
    return () => { alive = false; };
  }, [sellerId]);

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50" aria-busy="true" data-fix="FIX867" data-loading="1">
        <div className="aspect-[4/3] w-full animate-pulse bg-gray-200" />
        <div className="space-y-3 px-4 pt-6">
          <div className="h-7 w-2/3 animate-pulse rounded bg-gray-200" />
          <div className="h-6 w-1/3 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  if (state !== 'ok' || !p) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 text-gray-900" dir={rtl ? 'rtl' : 'ltr'}
           data-fix="FIX867" data-not-found="1">
        <div className="max-w-sm text-center">
          <Sprout className="mx-auto h-14 w-14 text-teal-800" aria-hidden="true" />
          <h1 className="mt-4 text-xl font-extrabold">{state === 'network' ? w('loadErr') : w('notFound')}</h1>
          {state !== 'network' ? <p className="mt-1 text-sm text-gray-500">{w('notFoundBody')}</p> : null}
          <Link to="/farm-fresh" className="mt-6 inline-block rounded-full bg-teal-800 px-5 py-2.5 text-sm font-bold text-white">
            {w('seeAll')}
          </Link>
        </div>
      </div>
    );
  }

  const mine = !!me && p.seller_id === me;
  const maxQty = p.stock !== null ? Math.max(0, Math.floor(p.stock)) : 99;
  const price = p.price || 0;
  const unit = unitLabel(p.unit, lang);
  const inCart = (cartItems || []).some((i: { id?: string; listingId?: string }) => i.id === p.id || i.listingId === p.id);
  const pics = p.images.length ? p.images : [];
  const shareUrl = publicShareUrl();
  const shareText = farmFill(w('shareText'), { title: p.title, price: fcfa(price), unit }) + ' ' + shareUrl;

  const openChat = () => {
    if (!p.seller_id) return;
    navigate('/chat?userId=' + encodeURIComponent(p.seller_id) + '&listingTitle=' + encodeURIComponent(p.title)
      + (p.image ? '&listingImage=' + encodeURIComponent(p.image) : ''));
  };

  const addCart = () => {
    addToCart(cartLine(p, qty));
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 2200);
  };

  const buyNow = () => {
    const line = cartLine(p, qty);
    navigate('/payment/checkout', {
      state: {
        items: [line], cartItems: undefined, subtotal: price * line.quantity, deliveryFee: 0, total: price * line.quantity,
        context: 'cart', description: 'Bambeh Farm Fresh - ' + p.title,
      },
    });
  };

  const share = async () => {
    const nav = navigator as Navigator & { share?: (d: { title: string; text: string; url: string }) => Promise<void> };
    if (typeof nav.share === 'function') {
      try { await nav.share({ title: p.title, text: shareText, url: shareUrl }); return; } catch { /* closed - show the sheet */ }
    }
    setShareOpen(true);
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(shareUrl); setCopied(true); window.setTimeout(() => setCopied(false), 2000); } catch { /* no clipboard */ }
  };

  const onScroll = () => {
    const el = gallery.current;
    if (!el || !el.clientWidth) return;
    setPhoto(Math.round(Math.abs(el.scrollLeft) / el.clientWidth));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-44 text-gray-900" dir={rtl ? 'rtl' : 'ltr'} data-fix="FIX867" data-product={p.id} translate="no">
      {/* the photos */}
      <div className="relative bg-gray-100">
        {pics.length ? (
          <div ref={gallery} onScroll={onScroll} className="scrollbar-hide flex aspect-[4/3] w-full snap-x snap-mandatory overflow-x-auto"
               data-gallery={pics.length}>
            {pics.map((src, i) => (
              <div key={src + i} className="h-full w-full shrink-0 snap-center">
                <FarmPhoto src={src} alt={farmFill(w('photo'), { n: i + 1, total: pics.length }) + ' - ' + p.title}
                           category={p.category} lang={lang} eager={i === 0} />
              </div>
            ))}
          </div>
        ) : (
          <div className="aspect-[4/3] w-full"><NoPhoto category={p.category} lang={lang} /></div>
        )}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
          <button type="button" onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/farm-fresh'))}
                  aria-label={w('back')} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-gray-900 shadow">
            <ArrowLeft className={'h-5 w-5 ' + (rtl ? 'rotate-180' : '')} />
          </button>
          <button type="button" onClick={() => { void share(); }} aria-label={w('share')} data-share="1"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-gray-900 shadow">
            <Share2 className="h-5 w-5" />
          </button>
        </div>
        {pics.length > 1 ? (
          <div className="absolute inset-x-0 bottom-7 flex justify-center gap-1.5" aria-hidden="true">
            {pics.map((_, i) => (
              <span key={i} className={'h-1.5 rounded-full transition-all ' + (i === photo ? 'w-[18px] bg-white' : 'w-1.5 bg-white/60')} />
            ))}
          </div>
        ) : null}
        {p.sold_out ? (
          <span className="absolute bottom-7 end-3 rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-800" data-sold-out="1">
            {w('soldOut')}
          </span>
        ) : null}
      </div>

      <div className="relative -mt-4 rounded-t-[28px] bg-gray-50 px-4 pt-6">
        <h1 className="text-[26px] font-extrabold leading-tight" data-title="1">{p.title}</h1>
        <div className="mt-3"><PriceTag price={p.price} unit={p.unit} lang={lang} big /></div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
          {p.is_organic ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-teal-800">
              <Leaf className="h-3.5 w-3.5" aria-hidden="true" /> {w('organic')}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-gray-700" data-delivery={p.delivery ? 'yes' : 'no'}>
            <Truck className="h-3.5 w-3.5" aria-hidden="true" /> {p.delivery ? w('deliveryYes') : w('deliveryNo')}
          </span>
          <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-1 text-gray-600">{categoryLabel(p.category, lang)}</span>
        </div>

        <ul className="mt-5 space-y-2.5">
          {p.location ? <Fact icon={<MapPin className="h-4 w-4" />}>{p.location}</Fact> : null}
          {p.harvest_date ? <Fact icon={<CalendarDays className="h-4 w-4" />}>{farmFill(w('harvested'), { date: fmtDate(p.harvest_date, lang) })}</Fact> : null}
          {p.stock !== null && !p.sold_out ? <Fact icon={<Package className="h-4 w-4" />}>{farmFill(w('left'), { n: p.stock, unit })}</Fact> : null}
        </ul>

        {/* the farmer - trust at the moment a buyer reaches out */}
        <section className="mt-7 rounded-3xl border border-gray-100 bg-white p-4" data-farmer="1">
          <p className="text-xs font-semibold text-gray-500">{w('farmer')}</p>
          <div className="mt-2 flex items-center gap-3">
            {p.farmer_photo ? (
              <img src={p.farmer_photo} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
            ) : (
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-800 text-lg font-extrabold text-white">
                {(p.farmer_name || 'F').slice(0, 1).toUpperCase()}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 font-bold">
                <span className="truncate">{p.farmer_name || w('farmer')}</span>
                {p.farmer_verified ? <BadgeCheck className="h-4 w-4 shrink-0 text-teal-800" aria-label={w('verified')} /> : null}
              </p>
              {p.farmer_verified ? <p className="text-xs font-semibold text-teal-800">{w('verified')}</p> : null}
              {p.farmer_place ? <p className="truncate text-xs text-gray-500">{p.farmer_place}</p> : null}
              <div className="mt-1" data-rating={rating ? rating.count : 'none'}>
                {rating && rating.count > 0 ? <Stars avg={rating.avg} count={rating.count} />
                  : rating ? <span className="text-[11px] text-gray-500">{w('noRatings')}</span> : null}
              </div>
            </div>
          </div>
          {!mine && p.seller_id ? (
            <>
              <p className="mt-4 flex items-start gap-2 rounded-2xl bg-teal-50 px-3 py-2.5 text-xs leading-snug text-teal-900" data-trust="1">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> <span>{w('trustLine')}</span>
              </p>
              <button type="button" onClick={openChat} data-chat="1"
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-teal-800 py-2.5 text-sm font-bold text-teal-800">
                <MessageCircle className="h-4 w-4" aria-hidden="true" /> {w('message')}
              </button>
              <button type="button" onClick={() => navigate('/seller/' + p.seller_id + '/rating')} data-rate="1"
                      className="mt-2 flex w-full items-center justify-center gap-1.5 py-1.5 text-xs font-bold text-teal-800">
                <Star className="h-3.5 w-3.5" aria-hidden="true" /> {w('rateFarmer')}
              </button>
            </>
          ) : null}
        </section>

        {p.description ? (
          <section className="mt-7">
            <h2 className="text-base font-extrabold">{w('about')}</h2>
            <p className="mt-1.5 whitespace-pre-line text-[15px] leading-relaxed text-gray-700">{p.description}</p>
          </section>
        ) : null}

        <details className="group mt-7 rounded-3xl border border-gray-100 bg-white px-4 py-3" data-protect="1">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 py-1 text-sm font-bold text-teal-900">
            <span className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-teal-800" aria-hidden="true" /> {w('protectTitle')}</span>
            <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <ol className="mt-3 space-y-3 pb-1">
            {(['protect1', 'protect2', 'protect3'] as FarmKey[]).map((k, i) => (
              <li key={k} className="flex gap-3 text-sm leading-snug text-gray-700">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-extrabold text-teal-800">{i + 1}</span>
                <span className="pt-0.5">{w(k)}</span>
              </li>
            ))}
          </ol>
        </details>

        {p.seller_id ? <div className="mt-7"><SellerReviews sellerId={p.seller_id} /></div> : null}

        {same.length ? (
          <section className="mt-8">
            <h2 className="text-base font-extrabold">{farmFill(w('moreFarmer'), { farmer: p.farmer_name || w('farmer') })}</h2>
            <div className="scrollbar-hide -mx-4 mt-3 flex gap-4 overflow-x-auto px-4 pb-1">
              {same.map((x) => <MiniCard key={x.id} p={x} lang={lang} onOpen={() => navigate('/farm-fresh/' + x.id)} />)}
            </div>
          </section>
        ) : null}
        {more.length ? (
          <section className="mt-8">
            <h2 className="text-base font-extrabold">{w('similar')}</h2>
            <div className="scrollbar-hide -mx-4 mt-3 flex gap-4 overflow-x-auto px-4 pb-1">
              {more.map((x) => <MiniCard key={x.id} p={x} lang={lang} onOpen={() => navigate('/farm-fresh/' + x.id)} />)}
            </div>
          </section>
        ) : null}
      </div>

      {/* buy - the one filled button of this screen */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-100 bg-white px-4 pb-4 pt-3" data-buybar="1">
        <div className="mx-auto max-w-2xl">
          {mine ? (
            <p className="py-2 text-center text-sm font-semibold text-teal-800" data-mine="1">{w('yours')}</p>
          ) : p.sold_out || maxQty < 1 ? (
            <button type="button" disabled className="w-full rounded-full bg-gray-100 py-3 text-sm font-bold text-gray-500">
              {w('soldOut')}
            </button>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1 rounded-full bg-gray-100 p-1" role="group" aria-label={w('qty')}>
                  <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label={w('less')}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-900 disabled:opacity-40" data-less="1">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-[2.5rem] text-center text-sm font-extrabold tabular-nums" data-qty={qty}>{qty}</span>
                  <button type="button" onClick={() => setQty((q) => Math.min(maxQty, q + 1))} disabled={qty >= maxQty} aria-label={w('more')}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-900 disabled:opacity-40" data-more="1">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-end" dir="ltr">
                  <p className="text-lg font-extrabold tabular-nums" data-total={price * qty}>{fcfa(price * qty)}</p>
                  <p className="text-[11px] text-gray-500">{farmFill(w('total'), { n: qty, unit })}</p>
                </div>
              </div>
              <p className="mt-1 text-[11px] leading-snug text-gray-500">{w('feesNote')}</p>
              <div className="mt-2.5 flex gap-2">
                <button type="button" onClick={addCart} data-add-cart="1"
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-teal-800 bg-white py-3 text-sm font-bold text-teal-800">
                  {justAdded ? <><Check className="h-4 w-4" aria-hidden="true" /> {w('inCart')}</> : <><ShoppingBasket className="h-4 w-4" aria-hidden="true" /> {w('addCart')}</>}
                </button>
                <button type="button" onClick={buyNow} data-buy-now="1"
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-teal-800 py-3 text-sm font-extrabold text-white">
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" /> {w('buyNow')}
                </button>
              </div>
              {inCart && !justAdded ? (
                <button type="button" onClick={() => navigate('/cart')} className="mt-2 w-full text-center text-xs font-bold text-teal-800 underline" data-view-cart="1">
                  {w('viewCart')}
                </button>
              ) : null}
            </>
          )}
        </div>
      </div>

      {shareOpen ? (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 px-4 pb-6" onClick={() => setShareOpen(false)} data-share-sheet="1">
          <div className="w-full max-w-md rounded-3xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <p className="text-base font-extrabold">{w('share')}</p>
              <button type="button" onClick={() => setShareOpen(false)} aria-label={w('close')} className="rounded-full p-1.5 text-gray-400"><X className="h-5 w-5" /></button>
            </div>
            <a href={'https://wa.me/?text=' + encodeURIComponent(shareText)} target="_blank" rel="noopener noreferrer"
               className="mt-4 flex items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-bold text-teal-800">
              <MessageCircle className="h-5 w-5" aria-hidden="true" /> {w('shareWhatsApp')}
            </a>
            <button type="button" onClick={() => { void copy(); }}
                    className="mt-2 flex w-full items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-800">
              {copied ? <Check className="h-5 w-5 text-teal-800" /> : <Copy className="h-5 w-5 text-gray-400" />} {copied ? w('copied') : w('copyLink')}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
// BAMBEH_END_TOKEN__FARMFRESHDETAIL_FIX867__COMPLETE
