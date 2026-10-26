// BAMBEH_DEPLOY_TOKEN__SHOPPAGE_FIX897_CLEAN
// FILE LOCATION: src/routes/groups/shop/ShopPage.tsx
//
// FIX897 - a seller's shop page: bambeh.com/<name> opens app.bambeh.com/#/s/<name> (Package 10, Big 26 Oct 2026:
// "their buyers land on their items on the app. when they click to see more, they are prompted to create their
// accounts"). Anyone can open it without an account: the shop's name, Verified on Bambeh only when Bambeh checked the
// seller, the stars buyers gave, the town and the first 6 things for sale - photo, price, town. "See all" or tapping
// an item asks a visitor to make the free account and brings them back. Members see everything and open the item.
// Never a phone number: people talk in the Bambeh chat and pay with User Protection.
// Bambeh's calm colours (deep teal, warm sand, ink, marigold for the stars) and one job: find something to buy.
// (c) 2026 BAMBEH SARL. All rights reserved.

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Loader2, MapPin, RefreshCw, Share2, ShieldCheck, ShoppingBag, Star, X } from 'lucide-react';
import { useLang } from '@/hooks/useAppLang';
import { SHOP_STR, shopDate, shopFill, shopLang } from '@/features/shop/shopText';
import type { ShopKey } from '@/features/shop/shopText';
import { fetchShop, itemPath } from '@/features/shop/shopApi';
import type { ShopItem, ShopPublic } from '@/features/shop/shopApi';
import { fcfa, unitLabel } from '@/features/farm/farmText';

const SAND = 'bg-[#F6EFE4]';
const INK = 'text-[#10231F]';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const two = (parts[0] || '').slice(0, 1) + (parts.length > 1 ? parts[parts.length - 1].slice(0, 1) : '');
  return two.toUpperCase() || 'B';
}

export default function ShopPage() {
  const { slug: raw = '' } = useParams();
  const slug = raw.toLowerCase();
  const navigate = useNavigate();
  const lang = shopLang(useLang());
  const w = (k: ShopKey) => SHOP_STR[lang][k];
  const rtl = lang === 'ar';
  const [res, setRes] = useState<ShopPublic | null>(null);
  const [joinNext, setJoinNext] = useState<string | null>(null);
  const asked = useRef(0);

  const load = useCallback(async () => {
    const mine = ++asked.current;
    setRes(null);
    const r = await fetchShop(slug);
    if (mine !== asked.current) return;
    setRes(r);
    // an old link or capitals: show the shop's own link in the address bar (no reload, no second visit counted)
    if (r.state === 'found' && r.shop.slug && r.shop.slug !== raw) {
      try { window.history.replaceState(window.history.state, '', '#/s/' + r.shop.slug); } catch { /* not important */ }
    }
  }, [slug, raw]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (res && res.state === 'found') {
      const before = document.title;
      document.title = res.shop.name + ' - Bambeh';
      return () => { document.title = before; };
    }
    return undefined;
  }, [res]);

  const shell = (body: ReactNode) => (
    <div className={'min-h-screen ' + SAND + ' ' + INK} dir={rtl ? 'rtl' : 'ltr'} data-fix="FIX897" translate="no">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 pt-5">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-[#0C5D57]" data-home="1">
          <ShoppingBag className="h-6 w-6" aria-hidden="true" />
          Bambeh
        </Link>
        {res && res.state === 'found' && !res.signedIn ? (
          <button type="button" onClick={() => setJoinNext('/s/' + res.shop.slug)} data-join-free="1"
                  className="rounded-full border-2 border-[#0C5D57] px-4 py-1.5 text-sm font-bold text-[#0C5D57]">
            {w('joinFree')}
          </button>
        ) : null}
      </header>
      {body}
    </div>
  );

  if (!res) {
    return shell(
      <div className="flex flex-col items-center gap-3 px-5 py-24 text-[#4D5A56]" aria-busy="true" data-loading="1">
        <Loader2 className="h-7 w-7 animate-spin text-[#0C5D57]" aria-hidden="true" />
        <p className="text-sm">{w('loading')}</p>
      </div>,
    );
  }

  if (res.state === 'error') {
    return shell(
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-20 text-center" data-load-error="1">
        <p className="text-base">{w('loadErr')}</p>
        <button type="button" onClick={() => { void load(); }} data-retry="1"
                className="flex items-center gap-2 rounded-full border-2 border-[#0C5D57] px-5 py-2.5 text-sm font-bold text-[#0C5D57]">
          <RefreshCw className="h-4 w-4" aria-hidden="true" /> {w('retry')}
        </button>
      </div>,
    );
  }

  if (res.state === 'missing' || res.state === 'hidden' || res.state === 'business') {
    const title = res.state === 'missing' ? w('notFoundTitle') : res.state === 'hidden' ? w('hiddenTitle')
      : shopFill(w('businessTitle'), { name: res.name });
    const body = res.state === 'missing' ? w('notFoundBody') : res.state === 'hidden' ? w('hiddenBody') : '';
    return shell(
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-20 text-center" data-state={res.state}>
        <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#E3EEEC]">
          <ShoppingBag className="h-8 w-8 text-[#0C5D57]" aria-hidden="true" />
        </span>
        <h1 className="text-xl font-bold">{title}</h1>
        {body ? <p className="text-sm text-[#4D5A56]">{body}</p> : null}
        {res.state === 'business' ? (
          <button type="button" onClick={() => navigate('/corporate/store/' + encodeURIComponent(res.slug))} data-open-business="1"
                  className="rounded-full bg-[#0C5D57] px-6 py-3 text-sm font-bold text-white">{w('businessBtn')}</button>
        ) : (
          <button type="button" onClick={() => navigate('/')} data-go-home="1"
                  className="rounded-full bg-[#0C5D57] px-6 py-3 text-sm font-bold text-white">{w('goHome')}</button>
        )}
      </div>,
    );
  }

  const { shop, items, total, signedIn, mine } = res;
  const more = Math.max(0, total - items.length);
  const since = shopDate(shop.since, lang);
  const open = (it: ShopItem) => {
    const to = itemPath(it);
    if (!signedIn) setJoinNext(to);
    else navigate(to);
  };

  return shell(
    <main className="mx-auto max-w-3xl px-5 pb-16">
      <section className="flex flex-col gap-4 pt-7" data-shop={shop.slug}>
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#E3EEEC] text-xl font-bold text-[#0C5D57]" aria-hidden="true">
            {initials(shop.name)}
          </span>
          <div className="min-w-0">
            <h1 className="break-words text-2xl font-bold leading-tight" data-name="1">{shop.name}</h1>
            {shop.verified ? (
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#0C5D57] px-3 py-1 text-xs font-bold text-white" data-verified="1">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" /> {w('verified')}
              </span>
            ) : (
              <span className="mt-2 inline-flex items-center rounded-full border border-[#0C5D57] px-3 py-1 text-xs font-bold text-[#0C5D57]" data-verified="0">
                {w('onBambeh')}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          {shop.rating.count > 0 ? (
            <span className="inline-flex items-center gap-1.5" data-rating={shop.rating.avg} data-ratings={shop.rating.count}>
              <Star className="h-4 w-4 fill-[#F2A93B] text-[#F2A93B]" aria-hidden="true" />
              <b>{shop.rating.avg.toFixed(1)}</b> <span className="text-[#4D5A56]">{'(' + shop.rating.count + ')'}</span>
            </span>
          ) : (
            <span className="text-[#4D5A56]" data-rating="0">{w('noRatings')}</span>
          )}
          <span data-total={total}>{shopFill(w('forSale'), { n: total })}</span>
        </div>
        {shop.town || since ? (
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#4D5A56]">
            {shop.town ? (
              <span className="inline-flex items-center gap-1.5" data-town="1">
                <MapPin className="h-4 w-4" aria-hidden="true" /> {shop.town}
              </span>
            ) : null}
            {since ? <span data-since="1">{shopFill(w('since'), { date: since })}</span> : null}
          </p>
        ) : null}

        {mine ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E6DCCB] bg-[#FFFCF7] p-4" data-mine="1">
            <p className="text-sm">{w('yourShop')}</p>
            <button type="button" onClick={() => navigate('/my-shop')} data-share-mine="1"
                    className="inline-flex items-center gap-2 rounded-full border-2 border-[#0C5D57] px-4 py-2 text-sm font-bold text-[#0C5D57]">
              <Share2 className="h-4 w-4" aria-hidden="true" /> {w('shareMine')}
            </button>
          </div>
        ) : null}
        {shop.hidden_for_others ? (
          <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900" data-hidden-for-others="1">{w('hiddenForOthers')}</p>
        ) : null}

        <p className="flex items-start gap-2.5 rounded-2xl bg-[#FFFCF7] px-4 py-3 text-sm leading-relaxed text-[#4D5A56]" data-trust="1">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#0C5D57]" aria-hidden="true" />
          {w('trust')}
        </p>
      </section>

      {items.length === 0 ? (
        <p className="py-16 text-center text-sm text-[#4D5A56]" data-empty="1">{w('empty')}</p>
      ) : (
        <section className="mt-8 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3" data-grid="1">
          {items.map((it) => (
            <button key={it.kind + ':' + it.id} type="button" onClick={() => open(it)} data-item={it.id} data-kind={it.kind}
                    className="flex flex-col gap-2 text-start">
              <span className="relative block aspect-square w-full overflow-hidden rounded-2xl bg-[#E9E0D1]">
                {it.image ? (
                  <img src={it.image} alt={it.title} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full flex-col items-center justify-center gap-1 px-3 text-center text-[#0C5D57]" data-no-photo="1">
                    <ShoppingBag className="h-8 w-8" aria-hidden="true" />
                    <span className="text-[11px] font-bold uppercase tracking-wide">{w(('k_' + (it.kind === 'listing' ? it.type : it.kind)) as ShopKey) || w('k_marketplace')}</span>
                    <span className="line-clamp-2 text-xs text-[#10231F]">{it.title}</span>
                  </span>
                )}
                {it.sold_out ? (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/45">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#10231F]">{w('soldOut')}</span>
                  </span>
                ) : null}
              </span>
              {it.price !== null ? (
                <span className="text-base font-bold" dir="ltr" data-price={it.price}>
                  {fcfa(it.price)}{it.kind === 'farm' && it.unit ? <span className="text-xs font-normal text-[#4D5A56]"> / {unitLabel(it.unit, lang)}</span> : null}
                </span>
              ) : (
                <span className="line-clamp-1 text-sm font-bold">{it.title}</span>
              )}
              {it.location ? <span className="-mt-1 line-clamp-1 text-xs text-[#4D5A56]">{it.location}</span> : null}
            </button>
          ))}
        </section>
      )}

      {more > 0 && !signedIn ? (
        <div className="mt-8 flex justify-center">
          <button type="button" onClick={() => setJoinNext('/s/' + shop.slug)} data-see-all={total}
                  className="rounded-full border-2 border-[#0C5D57] px-6 py-3 text-sm font-bold text-[#0C5D57]">
            {shopFill(w('seeAll'), { n: total })}
          </button>
        </div>
      ) : null}

      <p className={'mt-14 text-center text-xs font-bold text-[#0C5D57] ' + (rtl ? '' : 'tracking-[0.25em]')} data-signoff="1">{w('signoff')}</p>

      {joinNext ? (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 px-4 pb-6 sm:items-center"
             onClick={() => setJoinNext(null)} data-join-sheet="1">
          <div role="dialog" aria-modal="true" aria-labelledby="join-title" onClick={(e) => e.stopPropagation()}
               className={'w-full max-w-sm rounded-3xl p-6 shadow-xl ' + SAND} dir={rtl ? 'rtl' : 'ltr'}>
            <div className="mb-3 flex items-start justify-between gap-3">
              <h2 id="join-title" className="text-lg font-bold leading-snug">{w('joinTitle')}</h2>
              <button type="button" onClick={() => setJoinNext(null)} aria-label={w('close')} className="rounded-full p-1 text-[#4D5A56]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm leading-relaxed text-[#4D5A56]">{shopFill(w('joinBody'), { shop: shop.name })}</p>
            <button type="button" onClick={() => navigate('/join?next=' + encodeURIComponent(joinNext))} data-join-go={joinNext}
                    className="mt-5 w-full rounded-full bg-[#0C5D57] py-3.5 text-sm font-bold text-white">{w('joinBtn')}</button>
            <button type="button" onClick={() => navigate('/login?next=' + encodeURIComponent(joinNext))} data-login-go={joinNext}
                    className="mt-3 w-full py-2 text-sm font-bold text-[#0C5D57]">{w('haveAccount')}</button>
          </div>
        </div>
      ) : null}
    </main>,
  );
}
// BAMBEH_END_TOKEN__SHOPPAGE_FIX897__COMPLETE
