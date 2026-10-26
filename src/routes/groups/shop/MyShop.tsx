// BAMBEH_DEPLOY_TOKEN__MYSHOP_FIX898_CLEAN
// FILE LOCATION: src/routes/groups/shop/MyShop.tsx
//
// FIX898 - "My shop link" (/my-shop, Package 10): the seller takes one link for everything they sell,
// bambeh.com/<name>, and shares it - the link itself (copy, WhatsApp, Facebook) and the card (FIX896): shop name,
// Verified on Bambeh when Bambeh checked them, stars, items, town, QR code, the sign-off. The name can change any time,
// the link once every 30 days (old links keep opening the shop). No phone number, email or website in the name:
// buyers reach the seller in the Bambeh chat. Visits this week are shown, so the seller sees the link working.
// (c) 2026 BAMBEH SARL. All rights reserved.

import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Copy, Download, Link2, Loader2, MessageCircle, Share2, ShieldCheck, Users } from 'lucide-react';
import { useLang } from '@/hooks/useAppLang';
import { IS_NATIVE_APP } from '@/config/storeMode';
import { SHOP_STR, reasonKey, shopDate, shopFill, shopLang } from '@/features/shop/shopText';
import type { ShopKey } from '@/features/shop/shopText';
import { checkSlug, fetchMine, fetchShop, saveShop, shopShort, shopUrl, typedSlug } from '@/features/shop/shopApi';
import type { MyShop as MyShopRow } from '@/features/shop/shopApi';
import { cardBlob, drawShopCard } from '@/features/shop/shopCard';

type SlugCheck = { state: 'idle' | 'checking' | 'free' | 'bad'; reason?: string };

export default function MyShop() {
  const navigate = useNavigate();
  const lang = shopLang(useLang());
  const w = (k: ShopKey) => SHOP_STR[lang][k];
  const rtl = lang === 'ar';

  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [shop, setShop] = useState<MyShopRow | null>(null);
  const [itemsTotal, setItemsTotal] = useState(0);
  const [rating, setRating] = useState<{ avg: number; count: number }>({ avg: 0, count: 0 });
  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');
  const [town, setTown] = useState('');
  const [check, setCheck] = useState<SlugCheck>({ state: 'idle' });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [card, setCard] = useState<string | null>(null);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const timer = useRef<number | null>(null);
  const asked = useRef(0);

  const reasonText = useCallback((reason: string, after?: string) => {
    const k = reasonKey(reason);
    return k === 'r_too_soon' ? shopFill(w('r_too_soon'), { date: shopDate(after, lang, true) }) : w(k);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    const r = await fetchMine();
    setLoading(false);
    if (!r.ok) { setFailed(true); return; }
    setShop(r.shop);
    setItemsTotal(r.itemsTotal);
    if (r.shop) {
      setSlug(r.shop.slug);
      setName(r.shop.name);
      setTown(r.shop.town || '');
      const p = await fetchShop(r.shop.slug);
      if (p.state === 'found') { setRating(p.shop.rating); setItemsTotal(p.total); }
    } else if (r.suggestion) {
      setSlug(r.suggestion.slug);
      setName(r.suggestion.name);
      setTown(r.suggestion.town || '');
      if (r.suggestion.slug) setCheck({ state: 'free' }); // the database only suggests a link nobody has
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  // the link name is checked while it is typed (a moment after the last key)
  const onSlug = (raw: string) => {
    const v = typedSlug(raw);
    setSlug(v);
    setMsg(null);
    if (timer.current) window.clearTimeout(timer.current);
    if (shop && v === shop.slug) { setCheck({ state: 'idle' }); return; }
    if (!v) { setCheck({ state: 'idle' }); return; }
    setCheck({ state: 'checking' });
    const mine = ++asked.current;
    timer.current = window.setTimeout(() => {
      void checkSlug(v).then((r) => {
        if (mine !== asked.current) return;
        setCheck(r.ok && r.free ? { state: 'free' } : { state: 'bad', reason: r.reason || 'failed' });
      });
    }, 400);
  };

  const save = async () => {
    setBusy(true);
    setMsg(null);
    const r = await saveShop(slug, name, town);
    setBusy(false);
    if (!r.ok) { setMsg({ ok: false, text: reasonText(r.reason, r.after) }); return; }
    setShop(r.shop);
    setSlug(r.shop.slug);
    setName(r.shop.name);
    setTown(r.shop.town || '');
    setCheck({ state: 'idle' });
    setMsg({ ok: true, text: w('saved') });
  };

  // the card, drawn again when what is on it changes
  useEffect(() => {
    if (!shop || !canvas.current) { setCard(null); return; }
    try {
      drawShopCard(canvas.current, {
        name: shop.name, slug: shop.slug, verified: shop.verified, rating, items: itemsTotal, town: shop.town, lang,
      });
      setCard(canvas.current.toDataURL('image/png'));
    } catch {
      setCard(null);
    }
  }, [shop, rating, itemsTotal, lang]);

  const url = shop ? shopUrl(shop.slug) : '';
  const text = shop ? shopFill(w('shareText'), { shop: shop.name, url }) : '';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setMsg({ ok: true, text: url }); // the link shown to copy by hand
    }
  };

  const shareCard = async () => {
    if (!canvas.current || !shop) return;
    const blob = await cardBlob(canvas.current);
    if (!blob) return;
    const file = new File([blob], 'bambeh-' + shop.slug + '.png', { type: 'image/png' });
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
    try {
      if (nav.share && nav.canShare && nav.canShare({ files: [file] })) {
        await nav.share({ files: [file], text, title: shop.name });
        return;
      }
    } catch {
      return; // the person closed the share sheet
    }
    saveCard(blob);
  };

  const saveCard = (blob?: Blob | null) => {
    const go = (b: Blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(b);
      a.download = 'bambeh-' + (shop ? shop.slug : 'shop') + '.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      setMsg({ ok: true, text: w('cardSaved') });
    };
    if (blob) { go(blob); return; }
    if (canvas.current) void cardBlob(canvas.current).then((b) => { if (b) go(b); });
  };

  const field = 'w-full rounded-2xl border border-[#E6DCCB] bg-[#FFFCF7] px-4 py-3 text-base outline-none focus:border-[#0C5D57] focus:ring-2 focus:ring-[#0C5D57]/15';
  const outlined = 'inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#0C5D57] px-4 py-2.5 text-sm font-bold text-[#0C5D57] disabled:opacity-40';

  const form = (first: boolean) => {
    const locked = !first && !!shop && !!shop.next_link_change;
    return (
      <div className="space-y-4" data-form={first ? 'create' : 'change'}>
        <label className="block">
          <span className="text-sm font-bold">{w('linkLabel')}</span>
          <div className={'mt-1.5 flex items-center overflow-hidden rounded-2xl border border-[#E6DCCB] bg-[#FFFCF7] ' + (locked ? 'opacity-60' : '')} dir="ltr">
            <span className="shrink-0 ps-4 text-base text-[#4D5A56]">bambeh.com/</span>
            <input value={slug} onChange={(e) => onSlug(e.target.value)} disabled={locked} data-slug="1" autoCapitalize="none" autoCorrect="off"
                   spellCheck={false} inputMode="url" className="min-w-0 flex-1 bg-transparent py-3 pe-4 text-base font-bold outline-none" />
          </div>
          {locked ? (
            <span className="mt-1.5 block text-xs text-[#4D5A56]" data-next-change="1">
              {shopFill(w('nextChange'), { date: shopDate(shop ? shop.next_link_change : null, lang, true) })}
            </span>
          ) : check.state === 'checking' ? (
            <span className="mt-1.5 block text-xs text-[#4D5A56]" data-check="checking">{w('checking')}</span>
          ) : check.state === 'free' ? (
            <span className="mt-1.5 flex items-center gap-1 text-xs font-bold text-[#15803D]" data-check="free">
              <Check className="h-3.5 w-3.5" aria-hidden="true" /> {w('free')}
            </span>
          ) : check.state === 'bad' ? (
            <span className="mt-1.5 block text-xs text-red-700" data-check="bad" data-reason={check.reason}>{reasonText(check.reason || 'failed')}</span>
          ) : null}
        </label>
        <label className="block">
          <span className="text-sm font-bold">{w('nameLabel')}</span>
          <input value={name} onChange={(e) => { setName(e.target.value.slice(0, 40)); setMsg(null); }} data-name="1" className={'mt-1.5 ' + field} />
        </label>
        <label className="block">
          <span className="text-sm font-bold">{w('townLabel')}</span>
          <input value={town} onChange={(e) => { setTown(e.target.value.slice(0, 40)); setMsg(null); }} data-town="1" className={'mt-1.5 ' + field} />
        </label>
        <button type="button" onClick={() => { void save(); }} disabled={busy || !slug || name.trim().length < 2 || check.state === 'bad' || check.state === 'checking'}
                data-save={first ? 'create' : 'change'}
                className={first ? 'flex w-full items-center justify-center gap-2 rounded-full bg-[#0C5D57] py-3.5 text-sm font-bold text-white disabled:opacity-40' : outlined + ' w-full'}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          {busy ? w('saving') : first ? w('create') : w('save')}
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F6EFE4] pb-24 text-[#10231F]" dir={rtl ? 'rtl' : 'ltr'} data-fix="FIX898" translate="no">
      <div className="mx-auto max-w-xl px-5 pt-5">
        <button type="button" onClick={() => navigate(-1)} className="mb-3 inline-flex items-center gap-1.5 text-sm text-[#4D5A56]" data-back="1">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" /> {w('back')}
        </button>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Link2 className="h-6 w-6 text-[#0C5D57]" aria-hidden="true" /> {w('title')}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[#4D5A56]">{w('lead')}</p>

        {loading ? (
          <div className="flex justify-center py-16" data-loading="1"><Loader2 className="h-7 w-7 animate-spin text-[#0C5D57]" aria-hidden="true" /></div>
        ) : failed ? (
          <div className="mt-8 rounded-2xl bg-[#FFFCF7] p-5 text-center" data-load-error="1">
            <p className="text-sm">{w('r_failed')}</p>
            <button type="button" onClick={() => { void load(); }} className={'mt-3 ' + outlined}>{SHOP_STR[lang].retry}</button>
          </div>
        ) : !shop ? (
          <section className="mt-6 rounded-3xl border border-[#E6DCCB] bg-[#FFFCF7] p-5">{form(true)}</section>
        ) : (
          <>
            <section className="mt-6 space-y-4 rounded-3xl border border-[#E6DCCB] bg-[#FFFCF7] p-5" data-link={shop.slug}>
              <p className="break-all text-xl font-bold text-[#0C5D57]" dir="ltr" data-short="1">{shopShort(shop.slug)}</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => { void copy(); }} className={outlined} data-copy="1">
                  {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />} {copied ? w('copied') : w('copy')}
                </button>
                <a href={'https://wa.me/?text=' + encodeURIComponent(text)} target="_blank" rel="noopener noreferrer" className={outlined} data-wa="1">
                  <MessageCircle className="h-4 w-4" aria-hidden="true" /> {w('shareWhatsApp')}
                </a>
                <a href={'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url)} target="_blank" rel="noopener noreferrer" className={outlined} data-fb="1">
                  <Users className="h-4 w-4" aria-hidden="true" /> {w('shareFacebook')}
                </a>
              </div>
              <button type="button" onClick={() => navigate('/s/' + shop.slug)} className="text-sm font-bold text-[#0C5D57]" data-open-shop="1">{w('open')}</button>
              <div className="flex flex-wrap gap-x-5 gap-y-1 border-t border-[#E6DCCB] pt-3 text-sm text-[#4D5A56]">
                <span data-visits={shop.visits_7d}>{shopFill(w('visits'), { n: shop.visits_7d })}</span>
                <span data-items={itemsTotal}>{shopFill(w('forSale'), { n: itemsTotal })}</span>
              </div>
              {shop.aliases.length ? (
                <p className="text-xs text-[#4D5A56]" data-aliases={shop.aliases.length}>
                  {shopFill(w('oldLinks'), { links: shop.aliases.map(shopShort).join(', ') })}
                </p>
              ) : null}
            </section>

            {shop.hidden ? (
              <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900" data-hidden="1">
                {shopFill(w('hiddenNote'), { note: shop.hidden_note || '' })}
              </p>
            ) : null}

            <section className="mt-4 rounded-3xl border border-[#E6DCCB] bg-[#FFFCF7] p-5" data-verified={shop.verified ? '1' : '0'}>
              {shop.verified ? (
                <>
                  <p className="flex items-center gap-2 font-bold text-[#0C5D57]"><ShieldCheck className="h-5 w-5" aria-hidden="true" /> {w('verifiedYes')}</p>
                  <p className="mt-1 text-sm text-[#4D5A56]">
                    {shopFill(w('verifiedYesBody'), { checks: shop.checks.map((c) => w(('c_' + c) as ShopKey) || c).join(rtl ? '\u060C ' : ', ') })}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-bold">{w('verifiedNo')}</p>
                  <p className="mt-1 text-sm leading-relaxed text-[#4D5A56]">{w('verifiedNoBody')}</p>
                  <button type="button" onClick={() => navigate('/help/chat')} className={'mt-3 ' + outlined} data-ask-verify="1">{w('askVerify')}</button>
                </>
              )}
            </section>

            <section className="mt-4 rounded-3xl border border-[#E6DCCB] bg-[#FFFCF7] p-5" data-card-box="1">
              <h2 className="font-bold">{w('cardTitle')}</h2>
              <p className="mt-1 text-sm leading-relaxed text-[#4D5A56]">{w('cardLead')}</p>
              {card ? (
                <img src={card} alt={shop.name} className="mx-auto mt-4 w-full max-w-xs rounded-2xl border border-[#E6DCCB]" data-card="1" />
              ) : (
                <p className="mt-4 text-sm text-[#4D5A56]">{w('makingCard')}</p>
              )}
              {IS_NATIVE_APP ? (
                <p className="mt-4 text-sm text-[#4D5A56]" data-card-app-note="1">{w('cardAppNote')}</p>
              ) : (
                <div className="mt-4 flex flex-col gap-2">
                  <button type="button" onClick={() => { void shareCard(); }} disabled={!card} data-share-card="1"
                          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0C5D57] py-3.5 text-sm font-bold text-white disabled:opacity-40">
                    <Share2 className="h-4 w-4" aria-hidden="true" /> {w('shareCard')}
                  </button>
                  <button type="button" onClick={() => saveCard()} disabled={!card} className={outlined + ' w-full'} data-save-card="1">
                    <Download className="h-4 w-4" aria-hidden="true" /> {w('saveCard')}
                  </button>
                </div>
              )}
            </section>

            {itemsTotal === 0 ? (
              <div className="mt-4 rounded-3xl border border-[#E6DCCB] bg-[#FFFCF7] p-5" data-no-items="1">
                <p className="text-sm">{w('noItems')}</p>
                <button type="button" onClick={() => navigate('/marketplace/sell')} className={'mt-3 ' + outlined}>{w('postAd')}</button>
              </div>
            ) : null}

            <details className="mt-4 rounded-3xl border border-[#E6DCCB] bg-[#FFFCF7] p-5" data-change="1">
              <summary className="cursor-pointer font-bold">{w('changeLink')}</summary>
              <div className="mt-4">{form(false)}</div>
            </details>
          </>
        )}

        {msg ? (
          <p className={'mt-4 rounded-2xl px-4 py-3 text-sm ' + (msg.ok ? 'bg-[#DCFCE7] text-[#14532D]' : 'border border-red-200 bg-white text-red-700')}
             role={msg.ok ? 'status' : 'alert'} data-msg={msg.ok ? 'ok' : 'err'}>{msg.text}</p>
        ) : null}
      </div>
      <canvas ref={canvas} className="hidden" aria-hidden="true" />
    </div>
  );
}
// BAMBEH_END_TOKEN__MYSHOP_FIX898__COMPLETE
