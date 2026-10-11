// BAMBEH_DEPLOY_TOKEN__FOOD_GAS_DETAIL_FIX701_CLEAN
/**
 * src/features/foodgas/FoodGasDetail.tsx - FIX701 (replaces FIX691)   (route: /food-gas/place/:id)
 *
 * GAS & FOOD - one business: photos, how to find it, opening hours, and the two ways to
 * reach it - both inside Bambeh (no phone number is ever shown):
 *   - Chat: opens (or reopens) the Bambeh chat thread with the business.
 *   - Book / Order: a table, an order ahead, or GAS ORDERED ON THE SELLER'S OWN LINES.
 *     The request lands in that chat as a booking card; the business confirms there
 *     or in one tap from "My businesses".
 * FIX701 (Big, 10 Oct 2026):
 *   - "The gas they have": every line the seller listed - brand (SCTM, CAMGAS, GLOCAL,
 *     TOTAL, TRADEX or another), bottle size, refill price, new-bottle price, in stock.
 *     "Order" on a line: how many bottles, refill or new bottle, the day and time,
 *     pick-up or delivery. The price is worked out by the database from the seller's
 *     line; it is paid to the seller - Bambeh takes nothing on gas.
 *   - Restaurants and grills: the meats they cook and their dishes by local name; a
 *     dish can be added to an order ahead with one tap.
 *   - The seller (or their agent) switches each line in / out of stock here in one tap.
 * Wrapped in App.tsx by <SectionGate section="food_gas">: members only while the
 * Command Center says so (Big: "PUT FOOD AND GAS DETAILED PAGES BEHIND SUBSCRIPTION").
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, CalendarCheck, Check, Clock, Flame, Loader2, MapPin, MessageSquare, Minus, Navigation, Plus, Share2, ShieldCheck,
  Star, Store, Truck, X,
} from 'lucide-react';
import { publicShareUrl } from '@/config/storeMode';
import {
  KIND_ICON, brandLabel, cityLabel, daysText, doualaNow, fmtDate, fmtSince, fmtXaf, hasPhoneNumber, isFoodKind, kindLabel,
  meatLabel, openState, opensLaterToday, reasonText, sizeText, useFoodText,
} from './foodGasText';
import type { FoodKey, FoodLang } from './foodGasText';
import { book, getPlace, openChat, setGas, setOfferStock } from './foodGasApi';
import type { BookingKind, FoodMe, FoodPlace, GasMode, GasOffer } from './foodGasApi';

type T = (key: FoodKey, vars?: Record<string, string | number>) => string;

function localeOf(lang: FoodLang): string {
  return lang === 'fr' || lang === 'ff' ? 'fr-FR' : lang === 'ar' ? 'ar-u-nu-latn' : 'en-GB';
}

/** "Sat 12 Oct" for a Cameroon date written YYYY-MM-DD. */
function dayWords(ymd: string, lang: FoodLang): string {
  const d = new Date(ymd + 'T12:00:00+01:00');
  if (isNaN(d.getTime())) return ymd;
  try {
    return d.toLocaleDateString(localeOf(lang), { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Africa/Douala' });
  } catch {
    return ymd;
  }
}

/** The kinds of booking this business takes. */
function bookingKinds(p: FoodPlace): BookingKind[] {
  const out: BookingKind[] = [];
  if (p.kinds.indexOf('restaurant') >= 0) out.push('table');
  if (p.kinds.some((k) => isFoodKind(k))) out.push('order');
  if (p.kinds.indexOf('gas') >= 0) out.push('gas');
  return out;
}

function addDays(ymd: string, n: number): string {
  return new Date(new Date(ymd + 'T12:00:00Z').getTime() + n * 86400000).toISOString().slice(0, 10);
}

function nextHalfHour(): { ymd: string; hhmm: string } {
  const now = doualaNow();
  let m = Math.ceil((now.minutes + 30) / 30) * 30;
  let ymd = now.ymd;
  if (m >= 24 * 60) {
    m -= 24 * 60;
    ymd = addDays(now.ymd, 1);
  }
  const hh = String(Math.floor(m / 60)).padStart(2, '0');
  const mm = String(m % 60).padStart(2, '0');
  return { ymd, hhmm: hh + ':' + mm };
}

/** The seller said "no gas today" (an answer given today). */
function noGasToday(p: FoodPlace): boolean {
  return p.kinds.indexOf('gas') >= 0 && !p.gas_today && !!p.gas_checked_at && doualaNow(new Date(p.gas_checked_at)).ymd === doualaNow().ymd;
}

function BookingSheet({ p, lang, dir, t, startKind, startOffer, onClose, onBooked }: {
  p: FoodPlace; lang: FoodLang; dir: 'rtl' | 'ltr'; t: T; startKind: BookingKind | null; startOffer: string | null;
  onClose: () => void; onBooked: (conv: string, gas: boolean) => void;
}) {
  const kinds = useMemo(() => bookingKinds(p), [p]);
  const lines = useMemo(() => (p.offers || []).filter((o) => o.in_stock), [p]);
  const start = useMemo(() => nextHalfHour(), []);
  const offToday = noGasToday(p);
  const [kind, setKind] = useState<BookingKind>(startKind && kinds.indexOf(startKind) >= 0 ? startKind : kinds[0] || 'order');
  const [ymd, setYmd] = useState(startKind === 'gas' && offToday ? addDays(doualaNow().ymd, 1) : start.ymd);
  const [hhmm, setHhmm] = useState(startKind === 'gas' && offToday ? '09:00' : start.hhmm);
  const [people, setPeople] = useState('2');
  const [items, setItems] = useState('');
  const [delivery, setDelivery] = useState(false);
  const [note, setNote] = useState('');
  const [offerId, setOfferId] = useState<string>(startOffer && lines.some((o) => o.id === startOffer) ? startOffer : lines.length ? lines[0].id : '');
  const [qty, setQty] = useState(1);
  const [mode, setMode] = useState<GasMode>('refill');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const gasLines = kind === 'gas' && lines.length > 0;
  const offer: GasOffer | null = gasLines ? lines.filter((o) => o.id === offerId)[0] || lines[0] : null;
  const useMode: GasMode = offer && offer.full_xaf === null ? 'refill' : mode;
  const unit = offer ? (useMode === 'refill' ? offer.refill_xaf : offer.full_xaf) : null;
  const total = unit !== null ? unit * qty : null;
  const dishes = p.dishes || [];
  const kindWord = (k: BookingKind): string => t(k === 'table' ? 'bTable' : k === 'gas' ? (lines.length ? 'orderGas' : 'bGas') : 'bOrder');

  const addDish = (d: string) => {
    setItems((prev) => {
      const base = prev.trim().replace(/[,\s]+$/, '');
      return (base ? base + ', ' + d : d).slice(0, 300);
    });
  };

  const send = async () => {
    setErr('');
    if (gasLines && offToday && ymd === doualaNow().ymd) { setErr(t('gasNoToday')); return; }
    const when = new Date(ymd + 'T' + hhmm + ':00+01:00');
    if (isNaN(when.getTime()) || when.getTime() < Date.now() - 10 * 60 * 1000) { setErr(t('errTime')); return; }
    const n = parseInt(people, 10);
    if (kind === 'table' && !(n >= 1 && n <= 50)) { setErr(t('errPeople')); return; }
    if (kind !== 'table' && !gasLines && items.trim().length < 2) { setErr(t('errWhat')); return; }
    if (hasPhoneNumber(items) || hasPhoneNumber(note)) { setErr(reasonText(lang, 'phone_in_text')); return; }
    const out: string[] = [];
    if (gasLines && offer) {
      out.push(t('msgGasOrder', { name: p.name }));
      out.push(t('lBottle') + ': ' + brandLabel(offer.brand, offer.brand_other) + ' ' + sizeText(lang, offer.size_kg));
      out.push(t('lQty') + ': ' + qty);
      out.push(useMode === 'refill' ? t('colRefill') : t('colNew'));
      out.push(t('lPrice') + ': ' + (unit !== null && total !== null
        ? t('unitLine', { q: qty, n: fmtXaf(unit, lang) }) + ' = ' + fmtXaf(total, lang) + ' XAF - ' + t('lPayAtCounter')
        : t('askPrice')));
    } else {
      out.push(t(kind === 'table' ? 'msgTable' : kind === 'gas' ? 'msgGas' : 'msgOrder', { name: p.name }));
    }
    out.push(t('lDay') + ': ' + dayWords(ymd, lang));
    out.push(t('lTime') + ': ' + hhmm);
    if (kind === 'table') out.push(t('lPeople') + ': ' + n);
    if (kind !== 'table') {
      if (!gasLines) out.push(t(kind === 'gas' ? 'lGas' : 'lOrder') + ': ' + items.trim().replace(/\s*\n+\s*/g, ', '));
      out.push(delivery && p.delivers ? t('deliverMe') : t('pickUp'));
    }
    if (note.trim()) out.push(t('lNote') + ': ' + note.trim().replace(/\s*\n+\s*/g, ' '));
    setBusy(true);
    const r = await book({
      placeId: p.id, kind, wantAt: when.toISOString(), people: kind === 'table' ? n : null,
      items: kind === 'table' || gasLines ? '' : items.trim(), delivery: kind !== 'table' && delivery && p.delivers,
      note: note.trim(), message: out.join('\n').slice(0, 900),
      gas: gasLines && offer ? { offerId: offer.id, quantity: qty, mode: useMode } : null,
    });
    setBusy(false);
    if (!r.ok) { setErr(reasonText(lang, r.reason)); return; }
    onBooked(r.conversation_id, kind === 'gas');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" role="dialog" aria-modal="true">
      <div dir={dir} className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="text-lg font-extrabold text-gray-900">{t(gasLines ? 'orderGasTitle' : 'bookTitle', { name: p.name })}</h2>
          <button type="button" onClick={onClose} aria-label={t('close')} className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100"><X className="h-5 w-5" /></button>
        </div>

        {kinds.length > 1 && (
          <div className="mb-4 grid gap-2" style={{ gridTemplateColumns: 'repeat(' + kinds.length + ', minmax(0, 1fr))' }}>
            {kinds.map((k) => (
              <button key={k} type="button" onClick={() => setKind(k)} aria-pressed={kind === k}
                className={'rounded-xl px-2 py-2.5 text-sm font-bold ' + (kind === k ? 'bg-orange-600 text-white' : 'border border-gray-200 bg-white text-gray-700')}>
                {kindWord(k)}
              </button>
            ))}
          </div>
        )}
        {kinds.length === 1 && !gasLines && <p className="mb-3 text-sm font-bold text-orange-700">{kindWord(kind)}</p>}

        {gasLines && offer && (
          <div className="mb-3 space-y-3" data-gas-order="1">
            <fieldset>
              <legend className="text-sm font-semibold text-gray-700">{t('whichGas')}</legend>
              <div className="mt-1 grid gap-2">
                {lines.map((o) => {
                  const on = o.id === offer.id;
                  return (
                    <button key={o.id} type="button" aria-pressed={on} data-offer={o.id} onClick={() => setOfferId(o.id)}
                      className={'flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-start text-sm ' +
                        (on ? 'bg-red-600 text-white shadow' : 'border border-gray-200 bg-white text-gray-800')}>
                      <span className="font-extrabold">{brandLabel(o.brand, o.brand_other)} <span className="font-semibold">{sizeText(lang, o.size_kg)}</span></span>
                      <span className="font-bold">{o.refill_xaf !== null ? fmtXaf(o.refill_xaf, lang) + ' XAF' : t('askPrice')}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <div className="grid gap-2">
              <button type="button" aria-pressed={useMode === 'refill'} onClick={() => setMode('refill')}
                className={'rounded-xl px-3 py-2.5 text-start text-sm font-bold ' + (useMode === 'refill' ? 'bg-teal-600 text-white' : 'border border-gray-200 text-gray-700')}>
                {t('modeRefill', { b: brandLabel(offer.brand, offer.brand_other) })}
              </button>
              {offer.full_xaf !== null && (
                <button type="button" aria-pressed={useMode === 'full'} onClick={() => setMode('full')}
                  className={'rounded-xl px-3 py-2.5 text-start text-sm font-bold ' + (useMode === 'full' ? 'bg-teal-600 text-white' : 'border border-gray-200 text-gray-700')}>
                  {t('modeFull')} {'\u00b7'} {fmtXaf(offer.full_xaf, lang)} XAF
                </button>
              )}
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-gray-700">{t('qty')}</span>
              <div className="flex items-center gap-2">
                <button type="button" aria-label="-" disabled={qty <= 1} onClick={() => setQty(Math.max(1, qty - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 disabled:opacity-40"><Minus className="h-4 w-4" /></button>
                <span className="w-8 text-center text-lg font-extrabold" data-qty="1">{qty}</span>
                <button type="button" aria-label="+" disabled={qty >= 20} onClick={() => setQty(Math.min(20, qty + 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 disabled:opacity-40"><Plus className="h-4 w-4" /></button>
              </div>
            </div>
            <p className="rounded-xl bg-teal-50 px-3 py-2 text-sm font-extrabold text-teal-900" data-total="1">
              {unit !== null && total !== null ? t('unitLine', { q: qty, n: fmtXaf(unit, lang) }) + ' = ' + t('totalLine', { n: fmtXaf(total, lang) }) : t('askPrice')}
            </p>
            {offToday && <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">{t('gasNoToday')}</p>}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-semibold text-gray-700">
            {t('day')}
            <input type="date" value={ymd} min={doualaNow().ymd} onChange={(e) => setYmd(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
          </label>
          <label className="block text-sm font-semibold text-gray-700">
            {t('time')}
            <input type="time" value={hhmm} step={900} onChange={(e) => setHhmm(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
          </label>
        </div>

        {kind === 'table' ? (
          <label className="mt-3 block text-sm font-semibold text-gray-700">
            {t('people')}
            <input type="number" inputMode="numeric" min={1} max={50} value={people} onChange={(e) => setPeople(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
          </label>
        ) : (
          <>
            {!gasLines && (
              <label className="mt-3 block text-sm font-semibold text-gray-700">
                {t(kind === 'gas' ? 'whatGas' : 'whatOrder')}
                <textarea value={items} maxLength={300} rows={2} onChange={(e) => setItems(e.target.value)}
                  placeholder={t(kind === 'gas' ? 'whatGasPh' : 'whatOrderPh')}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
              </label>
            )}
            {kind === 'order' && dishes.length > 0 && (
              <div className="mt-2" data-dish-picks="1">
                <p className="text-xs font-semibold text-gray-500">{t('tapDish')}</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {dishes.map((d) => (
                    <button key={d} type="button" onClick={() => addDish(d)}
                      className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-900">
                      <Plus className="h-3 w-3" />{d}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {p.delivers ? (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button type="button" aria-pressed={!delivery} onClick={() => setDelivery(false)}
                  className={'rounded-xl px-2 py-2.5 text-sm font-bold ' + (!delivery ? 'bg-teal-600 text-white' : 'border border-gray-200 text-gray-700')}>
                  {t('pickUp')}
                </button>
                <button type="button" aria-pressed={delivery} onClick={() => setDelivery(true)}
                  className={'rounded-xl px-2 py-2.5 text-sm font-bold ' + (delivery ? 'bg-teal-600 text-white' : 'border border-gray-200 text-gray-700')}>
                  {t('deliverMe')}
                </button>
              </div>
            ) : (
              <p className="mt-2 text-xs font-semibold text-gray-500">{t('pickupOnly')}</p>
            )}
          </>
        )}

        <label className="mt-3 block text-sm font-semibold text-gray-700">
          {t('note')}
          <textarea value={note} maxLength={300} rows={2} onChange={(e) => setNote(e.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
        </label>

        {err && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{err}</p>}

        <div className="mt-5 flex gap-2">
          <button type="button" onClick={onClose} disabled={busy}
            className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-bold text-gray-700">{t('cancel')}</button>
          <button type="button" onClick={() => void send()} disabled={busy}
            className="flex-[2] inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 py-3 text-sm font-extrabold text-white disabled:opacity-60">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : gasLines ? <Flame className="h-4 w-4" /> : <CalendarCheck className="h-4 w-4" />}
            {busy ? t('sending') : gasLines ? t('sendOrder') : t('send')}
          </button>
        </div>
        {kind === 'gas' && <p className="mt-3 text-center text-[11px] font-semibold text-teal-800">{t('gasPayNote')}</p>}
        <p className="mt-2 text-center text-[11px] text-gray-500">{t('safety')}</p>
      </div>
    </div>
  );
}

/** "The gas they have": every line, with Order (buyers) or the in / out of stock switch (the seller). */
function GasTable({ p, me, lang, t, onOrder, onStock, stockBusy }: {
  p: FoodPlace; me: FoodMe; lang: FoodLang; t: T; onOrder: (offerId: string) => void;
  onStock: (o: GasOffer) => void; stockBusy: string;
}) {
  const offers = p.offers || [];
  const manager = me.is_owner || me.is_agent || me.can_edit;
  if (offers.length === 0) {
    return <p className="text-sm text-gray-600">{t('gasNoneListed')}</p>;
  }
  return (
    <ul className="divide-y divide-gray-100" data-gas-table="1">
      {offers.map((o) => (
        <li key={o.id} data-offer-row={o.id} className={'flex flex-wrap items-center justify-between gap-2 py-2.5 ' + (o.in_stock ? '' : 'opacity-60')}>
          <div className="min-w-0">
            <p className="font-extrabold text-gray-900">{brandLabel(o.brand, o.brand_other)} <span className="font-semibold text-gray-600">{sizeText(lang, o.size_kg)}</span></p>
            <p className="text-xs text-gray-600">
              {t('colRefill')}: <b className="text-teal-700">{o.refill_xaf !== null ? fmtXaf(o.refill_xaf, lang) + ' XAF' : t('askPrice')}</b>
              {' \u00b7 '}{t('colNew')}: <b className="text-teal-700">{o.full_xaf !== null ? fmtXaf(o.full_xaf, lang) + ' XAF' : t('noNewBottles')}</b>
            </p>
          </div>
          {manager ? (
            <button type="button" disabled={stockBusy === o.id} onClick={() => onStock(o)} aria-pressed={o.in_stock} data-stock={o.id}
              className={'inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold disabled:opacity-60 ' +
                (o.in_stock ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700')}>
              {o.in_stock ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}{o.in_stock ? t('inStock') : t('outStock')}
            </button>
          ) : o.in_stock ? (
            me.can_book ? (
              <button type="button" onClick={() => onOrder(o.id)} data-order={o.id}
                className="inline-flex items-center gap-1 rounded-xl bg-red-600 px-3 py-2 text-sm font-extrabold text-white">
                <Flame className="h-4 w-4" />{t('orderBtn')}
              </button>
            ) : (
              <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-800">{t('inStock')}</span>
            )
          ) : (
            <span className="rounded-full bg-gray-200 px-2.5 py-1 text-xs font-bold text-gray-700">{t('outStock')}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function FoodGasDetail() {
  const { id = '' } = useParams();
  const { lang, dir, t } = useFoodText();
  const navigate = useNavigate();
  const [place, setPlace] = useState<FoodPlace | null>(null);
  const [me, setMe] = useState<FoodMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [photo, setPhoto] = useState(0);
  const [toast, setToast] = useState('');
  const [chatBusy, setChatBusy] = useState(false);
  const [sheet, setSheet] = useState<{ kind: BookingKind | null; offer: string | null } | null>(null);
  const [gasBusy, setGasBusy] = useState(false);
  const [stockBusy, setStockBusy] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setErr('');
    const r = await getPlace(id);
    if (r.ok) { setPlace(r.place); setMe(r.me); } else { setPlace(null); setErr(r.reason === 'network' ? t('loadError') : reasonText(lang, r.reason)); }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (!toast) return undefined;
    const h = window.setTimeout(() => setToast(''), 4500);
    return () => window.clearTimeout(h);
  }, [toast]);

  const goChat = async () => {
    if (!place) return;
    setChatBusy(true);
    const r = await openChat(place.id);
    setChatBusy(false);
    if (r.ok) navigate('/chat?chat=' + encodeURIComponent(r.conversation_id));
    else setToast(reasonText(lang, r.reason));
  };

  const share = async () => {
    const url = publicShareUrl();
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        await navigator.share({ title: place ? place.name : 'Bambeh', url });
        return;
      }
    } catch (e) {
      if ((e as { name?: string })?.name === 'AbortError') return;
    }
    try { await navigator.clipboard.writeText(url); setToast(t('shared')); } catch { setToast(url); }
  };

  const switchGas = async (v: boolean) => {
    if (!place) return;
    setGasBusy(true);
    const r = await setGas(place.id, v);
    setGasBusy(false);
    if (r.ok) setPlace({ ...place, gas_available: r.gas_available, gas_today: r.gas_available, gas_checked_at: r.gas_checked_at });
    else setToast(reasonText(lang, r.reason));
  };

  const switchStock = async (o: GasOffer) => {
    if (!place) return;
    setStockBusy(o.id);
    const r = await setOfferStock(o.id, !o.in_stock);
    setStockBusy('');
    if (!r.ok) { setToast(reasonText(lang, r.reason)); return; }
    setPlace({
      ...place,
      offers: (place.offers || []).map((x) => (x.id === o.id ? { ...x, in_stock: r.in_stock } : x)),
      gas_available: r.gas_available, gas_today: r.gas_available, gas_checked_at: r.gas_checked_at,
    });
  };

  if (loading) {
    return <div dir={dir} className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>;
  }
  if (!place || !me) {
    return (
      <div dir={dir} className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <Store className="h-12 w-12 text-gray-300" />
        <p className="mt-3 font-semibold text-gray-700">{err || t('notFound')}</p>
        <button type="button" onClick={() => navigate('/food-gas')} className="mt-4 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-bold text-white">{t('back')}</button>
      </div>
    );
  }

  const photos = place.photos.length ? place.photos : [];
  const st = openState(place.open_days, place.opens_at, place.closes_at);
  const later = st === 'closed' ? opensLaterToday(place.open_days, place.opens_at) : null;
  const MainIcon = KIND_ICON[place.kinds[0] || 'restaurant'];
  const answeredToday = !!place.gas_checked_at && doualaNow(new Date(place.gas_checked_at)).ymd === doualaNow().ymd;
  const isGas = place.kinds.indexOf('gas') >= 0;
  const isFood = place.kinds.some((k) => isFoodKind(k));
  const gasOnly = isGas && !isFood;
  const manager = me.is_owner || me.is_agent || me.can_edit;
  const featuredOn = !!place.featured_until && new Date(place.featured_until).getTime() > Date.now();
  const meats = place.meats || [];
  const dishes = place.dishes || [];

  return (
    <div dir={dir} data-fix="FIX701" className="min-h-screen bg-gray-50 pb-40">
      <div className="sticky top-0 z-30 flex items-center justify-between bg-white/95 px-3 py-2 shadow-sm backdrop-blur">
        <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-1 rounded-xl px-2 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 rtl:rotate-180" />{t('back')}
        </button>
        <button type="button" onClick={() => void share()} className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100">
          <Share2 className="h-4 w-4" />{t('share')}
        </button>
      </div>

      <div className="mx-auto max-w-3xl">
        <div className="relative h-60 w-full bg-gradient-to-br from-orange-100 to-amber-50 sm:h-80">
          {photos.length ? (
            <img src={photos[Math.min(photo, photos.length - 1)]} alt={place.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-orange-300"><MainIcon className="h-20 w-20" /></div>
          )}
          {place.featured && (
            <span className="absolute start-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-xs font-extrabold text-amber-950 shadow">
              <Star className="h-3.5 w-3.5 fill-amber-950" />{t('featured')}
            </span>
          )}
          {photos.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {photos.map((_, i) => (
                <button key={i} type="button" aria-label={String(i + 1)} onClick={() => setPhoto(i)}
                  className={'h-2.5 w-2.5 rounded-full ' + (i === photo ? 'bg-white' : 'bg-white/50')} />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4 px-4 pt-4">
          <div>
            <h1 className="text-2xl font-extrabold leading-tight text-gray-900">{place.name}</h1>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {place.kinds.map((k) => {
                const KI = KIND_ICON[k];
                return (
                  <span key={k} className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-800">
                    <KI className="h-3.5 w-3.5" />{kindLabel(lang, k)}
                  </span>
                );
              })}
              <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-800">
                <Truck className="h-3.5 w-3.5" />{place.delivers ? t('delivers') : t('pickupOnly')}
              </span>
            </div>
          </div>

          {manager && (
            <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
              <p className="text-sm font-extrabold text-orange-900">{t('yourBusiness')}</p>
              {place.status === 'pending' && <p className="mt-1 text-sm text-orange-900">{t('statusPending')}</p>}
              {place.status === 'rejected' && <p className="mt-1 text-sm text-red-700">{t('statusRejected', { r: place.review_note || '-' })}</p>}
              {place.status === 'hidden' && (
                <p className="mt-1 text-sm text-gray-700">
                  {place.hidden_by === 'staff' ? t('statusHiddenStaff', { r: place.review_note || '-' }) : t('statusHiddenOwner')}
                </p>
              )}
              {place.status === 'live' && place.needs_review && <p className="mt-1 text-sm text-orange-900">{t('statusChanged')}</p>}
              {featuredOn && <p className="mt-1 text-sm font-semibold text-amber-800">{t('featuredUntil', { d: fmtDate(place.featured_until, lang) })}</p>}
              {isGas && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button type="button" disabled={gasBusy} onClick={() => void switchGas(true)}
                    className={'rounded-xl py-2.5 text-sm font-bold ' + (place.gas_today ? 'bg-green-600 text-white' : 'border border-green-300 bg-white text-green-800')}>
                    {t('gasSwitchYes')}
                  </button>
                  <button type="button" disabled={gasBusy} onClick={() => void switchGas(false)}
                    className={'rounded-xl py-2.5 text-sm font-bold ' + (answeredToday && !place.gas_today ? 'bg-red-600 text-white' : 'border border-red-200 bg-white text-red-700')}>
                    {t('gasSwitchNo')}
                  </button>
                </div>
              )}
              {isGas && place.gas_checked_at && <p className="mt-1 text-xs text-gray-600">{t('gasUpdated', { t: fmtSince(place.gas_checked_at, lang) })}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                {me.can_edit && (
                  <button type="button" onClick={() => navigate('/food-gas/edit/' + place.id)}
                    className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-bold text-white">{t('manage')}</button>
                )}
                {place.status === 'live' && (me.is_owner || me.is_agent) && (
                  <button type="button" onClick={() => navigate('/food-gas/mine?feature=' + place.id)}
                    className="inline-flex items-center gap-1 rounded-xl border border-amber-300 bg-white px-4 py-2 text-sm font-bold text-amber-800">
                    <Star className="h-4 w-4" />{t('featureIt')}
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2 rounded-2xl bg-white p-4 shadow-sm">
            <p className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-900">
              <MapPin className="h-4 w-4 text-orange-600" />{place.area_label}, {cityLabel(place.city, lang)}
            </p>
            {place.landmark && (
              <p className="flex items-start gap-1.5 text-sm text-gray-700">
                <Navigation className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                <span><span className="font-semibold">{t('howToFind')}:</span> {place.landmark}</span>
              </p>
            )}
            <p className="flex items-start gap-1.5 text-sm text-gray-700">
              <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
              <span>
                {place.opens_at && place.closes_at ? (
                  <>
                    <span className={st === 'open' ? 'font-bold text-green-700' : 'font-bold text-gray-500'}>
                      {st === 'open' ? t('openNow') : later ? t('opensAt', { t: later }) : t('closedNow')}
                    </span>
                    {' \u00b7 '}{daysText(lang, place.open_days)} {place.opens_at}{'\u2013'}{place.closes_at}
                  </>
                ) : t('hoursUnknown')}
              </span>
            </p>
            {place.key_price_xaf !== null && (
              <p className="text-base font-extrabold text-teal-700">
                {t('fromPrice', { n: fmtXaf(place.key_price_xaf, lang) })}
                {place.key_price_label ? <span className="text-sm font-semibold text-gray-500"> {'\u00b7'} {place.key_price_label}</span> : null}
              </p>
            )}
          </div>

          {isGas && (
            <div className="rounded-2xl bg-white p-4 shadow-sm" data-section="gas">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h2 className="inline-flex items-center gap-1.5 text-sm font-extrabold uppercase tracking-wide text-gray-500">
                  <Flame className="h-4 w-4 text-red-600" />{t('gasHave')}
                </h2>
                <span className={'rounded-full px-2.5 py-1 text-xs font-bold ' + (place.gas_today ? 'bg-green-100 text-green-800' : answeredToday ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600')}>
                  {place.gas_today ? t('gasYes') : answeredToday ? t('gasNo') : t('gasUnknown')}
                </span>
              </div>
              <GasTable p={place} me={me} lang={lang} t={t} stockBusy={stockBusy}
                onOrder={(offerId) => setSheet({ kind: 'gas', offer: offerId })} onStock={(o) => void switchStock(o)} />
              {!manager && <p className="mt-2 text-xs font-semibold text-teal-800">{t('gasPayNote')}</p>}
              {manager && me.can_edit && (
                <button type="button" onClick={() => navigate('/food-gas/edit/' + place.id + '#gas')}
                  className="mt-2 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-700">{t('gasEditTitle')}</button>
              )}
            </div>
          )}

          {isFood && (meats.length > 0 || dishes.length > 0) && (
            <div className="space-y-3 rounded-2xl bg-white p-4 shadow-sm" data-section="food">
              {meats.length > 0 && (
                <div>
                  <h2 className="mb-1.5 text-sm font-extrabold uppercase tracking-wide text-gray-500">{t('meatsTitle')}</h2>
                  <div className="flex flex-wrap gap-1.5">
                    {meats.map((m) => <span key={m} className="rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-900">{meatLabel(lang, m)}</span>)}
                  </div>
                </div>
              )}
              {dishes.length > 0 && (
                <div>
                  <h2 className="mb-1.5 text-sm font-extrabold uppercase tracking-wide text-gray-500">{t('dishesTitle')}</h2>
                  <div className="flex flex-wrap gap-1.5">
                    {dishes.map((d) => <span key={d} className="rounded-full bg-orange-50 px-3 py-1 text-sm font-bold text-orange-900">{d}</span>)}
                  </div>
                </div>
              )}
            </div>
          )}

          {place.description && (
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <h2 className="mb-1 text-sm font-extrabold uppercase tracking-wide text-gray-500">{t('about')}</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-gray-800">{place.description}</p>
            </div>
          )}

          {(isFood || place.items.length > 0) && (
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <h2 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-gray-500">{t('menu')}</h2>
              {place.items.length === 0 ? (
                <p className="text-sm text-gray-500">{t('noMenu')}</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {place.items.map((it, i) => (
                    <li key={(it.id || '') + i} className={'flex items-start justify-between gap-3 py-2.5 ' + (it.available ? '' : 'opacity-50')}>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900">{it.name}</p>
                        {it.note && <p className="text-xs text-gray-500">{it.note}</p>}
                        {!it.available && <p className="text-xs font-semibold text-red-600">{t('unavailable')}</p>}
                      </div>
                      {it.price_xaf !== null && <p className="flex-shrink-0 font-extrabold text-teal-700">{fmtXaf(it.price_xaf, lang)} XAF</p>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <p className="flex items-start gap-2 rounded-2xl bg-teal-50 p-3 text-xs text-teal-900">
            <ShieldCheck className="h-4 w-4 flex-shrink-0" />{t('safety')}
          </p>
        </div>
      </div>

      {(me.can_chat || me.can_book) && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-3xl gap-2">
            {me.can_chat && (
              <button type="button" onClick={() => void goChat()} disabled={chatBusy}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-teal-600 py-3 text-sm font-extrabold text-teal-700 disabled:opacity-60">
                {chatBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
                {chatBusy ? t('chatOpening') : t('chat')}
              </button>
            )}
            {me.can_book && (
              <button type="button" onClick={() => setSheet({ kind: gasOnly ? 'gas' : null, offer: null })}
                className={'flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-extrabold text-white ' + (gasOnly ? 'bg-red-600' : 'bg-orange-600')}>
                {gasOnly ? <Flame className="h-4 w-4" /> : <CalendarCheck className="h-4 w-4" />}
                {gasOnly && (place.offers || []).some((o) => o.in_stock) ? t('orderGas') : t('book')}
              </button>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-50 w-[90%] max-w-sm -translate-x-1/2 rounded-xl bg-gray-900 px-4 py-3 text-center text-sm text-white shadow-lg" role="status">
          {toast}
        </div>
      )}

      {sheet && (
        <BookingSheet
          p={place} lang={lang} dir={dir} t={t} startKind={sheet.kind} startOffer={sheet.offer}
          onClose={() => setSheet(null)}
          onBooked={(conv, gas) => { setSheet(null); setToast(t(gas ? 'orderedOk' : 'bookedOk')); navigate('/chat?chat=' + encodeURIComponent(conv)); }}
        />
      )}
    </div>
  );
}
// BAMBEH_END_TOKEN__FOOD_GAS_DETAIL_FIX701__COMPLETE
