// BAMBEH_DEPLOY_TOKEN__FOOD_GAS_MANAGE_FIX702_CLEAN
/**
 * src/features/foodgas/FoodGasManage.tsx - FIX702 (replaces FIX692)
 *   routes: /food-gas/mine  /food-gas/new  /food-gas/edit/:id   (signed-in people)
 *
 * GAS & FOOD - for the people who run the businesses:
 *   - ADD A BUSINESS: the owner adds their own, or a field agent adds it for the
 *     owner by typing the owner's Bambeh phone number or email (chats and bookings
 *     go to the owner; the agent is credited). Bambeh staff approve it first.
 *   - EDIT: name, what it sells, photos (up to 6), neighbourhood, landmark, days and
 *     hours, main price, bookings and delivery. No phone numbers: the database refuses
 *     them, and the form says so before sending.
 *   - MENU AND PRICES: up to 40 lines.
 *   - GAS AVAILABLE TODAY: one tap a day.
 *   - BOOKINGS: confirm or decline in one tap - the answer goes into the buyer's
 *     chat in the owner's language. Buyers see and cancel their own bookings here.
 *   - FEATURED AT THE TOP: 50 XAF a day (2 to 5 days), 300 XAF a week, 1,000 XAF a
 *     month, paid by mobile money; the payment switches it on and it ends by itself.
 * FIX702 (Big, 10 Oct 2026):
 *   - THE GAS YOU HAVE: one line per brand and bottle size (SCTM, CAMGAS, GLOCAL, TOTAL,
 *     TRADEX or a brand typed by name), refill price, new-bottle price, in stock.
 *     Buyers order on these lines. "My businesses" switches each line in / out of
 *     stock in one tap - that is also the day's "gas available" answer.
 *   - Restaurants and grills tick the meats they cook (beef, goat, pork, chicken,
 *     fish) and add their dishes by local name: one tap for achu, eru, ndole, okok...
 *     or typed the way they write them (24 at most).
 *   - Gas orders show in the bookings as "2 x TRADEX 12.5 kg - refill - 13,000 XAF".
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, CalendarCheck, Camera, Check, Eye, EyeOff, Flame, Loader2, MessageSquare, Pencil, Plus, Star, Store, Trash2, X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  AREAS, CITY_KEYS, DISH_PICKS, FOOD_KINDS, GAS_BRANDS, KIND_ICON, MEATS, SIZE_PICKS, brandLabel, cityLabel, dayShort,
  doualaNow, fmtDate, fmtSize, fmtWhen, fmtXaf, foldDish, hasPhoneNumber, isCityKey, isFoodKind, isGasBrand, kindLabel,
  knownArea, meatLabel, momoNumber, reasonText, sizeText, slugArea, useFoodText,
} from './foodGasText';
import type { CityKey, FoodKey, FoodKind, FoodLang, GasBrand, Meat } from './foodGasText';
import {
  answerBooking, cancelBooking, featureStart, featureStatus, getPlace, listBookings, myPlaces, payWithMomo, saveGas, saveItems,
  savePlace, setGas, setOfferStock, setVisible, uploadPhoto,
} from './foodGasApi';
import type { FeaturePlan, FoodBooking, FoodItem, GasOffer, GasOfferInput, MyPlace, PlaceInput } from './foodGasApi';

type T = (key: FoodKey, vars?: Record<string, string | number>) => string;
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
const OTHER = '__other__';

function Banner({ kind, text }: { kind: 'ok' | 'err' | 'info'; text: string }) {
  const cls = kind === 'ok' ? 'bg-green-50 text-green-800 border-green-200'
    : kind === 'err' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-orange-50 text-orange-900 border-orange-200';
  return <p role="status" className={'rounded-xl border px-3 py-2 text-sm font-semibold ' + cls}>{text}</p>;
}

function StatusBadge({ p, t }: { p: { status: string; needs_review: boolean }; t: T }) {
  const map: Record<string, [FoodKey, string]> = {
    pending: ['stPending', 'bg-amber-100 text-amber-900'],
    live: ['stLive', 'bg-green-100 text-green-800'],
    rejected: ['stRejected', 'bg-red-100 text-red-700'],
    hidden: ['stHidden', 'bg-gray-200 text-gray-700'],
  };
  const m = map[p.status] || map.pending;
  return (
    <span className="inline-flex flex-wrap gap-1">
      <span className={'rounded-full px-2 py-0.5 text-[11px] font-bold ' + m[1]}>{t(m[0])}</span>
      {p.status === 'live' && p.needs_review && <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-bold text-orange-800">{t('stChanged')}</span>}
    </span>
  );
}

// ------------------------------------------------------------------ the editor (new and edit)
interface FormState {
  ownership: 'me' | 'other';
  ownerId: string;
  agentId: string;
  name: string;
  kinds: FoodKind[];
  description: string;
  city: CityKey | '';
  areaPick: string;
  areaOther: string;
  landmark: string;
  photos: string[];
  days: number[];
  opens: string;
  closes: string;
  keyPrice: string;
  keyLabel: string;
  bookings: boolean;
  delivers: boolean;
  meats: Meat[];
  dishes: string[];
  dishInput: string;
}

const EMPTY: FormState = {
  ownership: 'me', ownerId: '', agentId: '', name: '', kinds: [], description: '', city: '', areaPick: '', areaOther: '',
  landmark: '', photos: [], days: [0, 1, 2, 3, 4, 5, 6], opens: '', closes: '', keyPrice: '', keyLabel: '',
  bookings: true, delivers: false, meats: [], dishes: [], dishInput: '',
};

/** "6 500", "6.500" or "6,500" -> 6500; '' -> null; anything else -> NaN. */
function priceOf(raw: string): number | null {
  const v = raw.trim().replace(/[\s.,]/g, '');
  if (!v) return null;
  return /^[0-9]{1,7}$/.test(v) ? Number(v) : NaN;
}

// ------------------------------------------------------------------ the gas a seller has (FIX702)
interface GasRow { id?: string; brand: GasBrand; other: string; sizePick: string; sizeOther: string; refill: string; full: string; inStock: boolean }
const SIZE_OTHER = 'other';

function rowOf(o: GasOffer): GasRow {
  const known = SIZE_PICKS.indexOf(Number(o.size_kg)) >= 0;
  return {
    id: o.id, brand: isGasBrand(o.brand) ? o.brand : 'OTHER', other: o.brand_other || '',
    sizePick: known ? String(Number(o.size_kg)) : SIZE_OTHER, sizeOther: known ? '' : String(Number(o.size_kg)),
    refill: o.refill_xaf !== null ? String(o.refill_xaf) : '', full: o.full_xaf !== null ? String(o.full_xaf) : '', inStock: o.in_stock,
  };
}

function GasEditor({ placeId, initial, lang, t }: { placeId: string; initial: GasOffer[]; lang: FoodLang; t: T }) {
  const [rows, setRows] = useState<GasRow[]>(initial.map(rowOf));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const set = (i: number, patch: Partial<GasRow>) => setRows((prev) => prev.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const add = () => setRows((prev) => prev.concat([{ brand: 'TRADEX', other: '', sizePick: '12.5', sizeOther: '', refill: '', full: '', inStock: true }]));

  const save = async () => {
    setMsg(null);
    const out: GasOfferInput[] = [];
    const seen: string[] = [];
    for (const r of rows) {
      const other = r.other.trim().replace(/\s+/g, ' ');
      if (r.brand === 'OTHER' && (other.length < 2 || other.length > 30 || foldDish(other).length < 2)) { setMsg({ kind: 'err', text: reasonText(lang, 'bad_brand') }); return; }
      if (hasPhoneNumber(other)) { setMsg({ kind: 'err', text: reasonText(lang, 'phone_in_text') }); return; }
      const size = r.sizePick === SIZE_OTHER ? Number(r.sizeOther.trim().replace(',', '.')) : Number(r.sizePick);
      if (!isFinite(size) || size < 1 || size > 100) { setMsg({ kind: 'err', text: reasonText(lang, 'bad_size') }); return; }
      const refill = priceOf(r.refill);
      const full = priceOf(r.full);
      if ((refill !== null && (isNaN(refill) || refill < 100 || refill > 1000000)) || (full !== null && (isNaN(full) || full < 100 || full > 1000000))) {
        setMsg({ kind: 'err', text: reasonText(lang, 'bad_price') });
        return;
      }
      const key = r.brand + '|' + foldDish(r.brand === 'OTHER' ? other : '') + '|' + Math.round(size * 100);
      if (seen.indexOf(key) >= 0) { setMsg({ kind: 'err', text: reasonText(lang, 'bad_offers') }); return; }
      seen.push(key);
      out.push({ id: r.id, brand: r.brand, brand_other: r.brand === 'OTHER' ? other : '', size_kg: Math.round(size * 100) / 100, refill_xaf: refill, full_xaf: full, in_stock: r.inStock });
    }
    if (out.length > 30) { setMsg({ kind: 'err', text: reasonText(lang, 'bad_offers') }); return; }
    setBusy(true);
    const r = await saveGas(placeId, out);
    setBusy(false);
    if (r.ok) { setRows(r.offers.map(rowOf)); setMsg({ kind: 'ok', text: t('gasSaved') }); } else setMsg({ kind: 'err', text: reasonText(lang, r.reason) });
  };

  const input = 'rounded-lg border border-gray-200 px-2.5 py-2 text-sm';
  return (
    <section id="gas-list" className="rounded-2xl bg-white p-4 shadow-sm" data-section="gas-list">
      <h2 className="mb-1 inline-flex items-center gap-1.5 text-lg font-extrabold text-gray-900"><Flame className="h-5 w-5 text-red-600" />{t('gasEditTitle')}</h2>
      <p className="mb-3 text-xs text-gray-600">{t('gasEditHint')}</p>
      <div className="space-y-3">
        {rows.map((r, i) => (
          <div key={(r.id || 'new') + i} className="rounded-xl border border-gray-100 p-3" data-gas-row={i}>
            <div className="grid grid-cols-2 gap-2">
              <select value={r.brand} aria-label={t('colBrand')} onChange={(e) => set(i, { brand: isGasBrand(e.target.value) ? e.target.value : 'OTHER' })} className={input}>
                {GAS_BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
                <option value="OTHER">{t('brandOther')}</option>
              </select>
              <select value={r.sizePick} aria-label={t('colSize')} onChange={(e) => set(i, { sizePick: e.target.value })} className={input}>
                {SIZE_PICKS.map((s) => <option key={s} value={String(s)}>{sizeText(lang, s)}</option>)}
                <option value={SIZE_OTHER}>{t('sizeOther')}</option>
              </select>
            </div>
            {(r.brand === 'OTHER' || r.sizePick === SIZE_OTHER) && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {r.brand === 'OTHER' ? (
                  <input value={r.other} maxLength={30} placeholder={t('brandOtherPh')} aria-label={t('brandOtherPh')}
                    onChange={(e) => set(i, { other: e.target.value })} className={input} />
                ) : <span />}
                {r.sizePick === SIZE_OTHER ? (
                  <input value={r.sizeOther} inputMode="decimal" maxLength={6} placeholder={t('sizeOtherPh')} aria-label={t('sizeOther')}
                    onChange={(e) => set(i, { sizeOther: e.target.value })} className={input} />
                ) : <span />}
              </div>
            )}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input value={r.refill} inputMode="numeric" maxLength={9} placeholder={t('priceRefillPh')} aria-label={t('priceRefillPh')}
                onChange={(e) => set(i, { refill: e.target.value })} className={input} />
              <input value={r.full} inputMode="numeric" maxLength={9} placeholder={t('priceNewPh')} aria-label={t('priceNewPh')}
                onChange={(e) => set(i, { full: e.target.value })} className={input} />
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <button type="button" aria-pressed={r.inStock} onClick={() => set(i, { inStock: !r.inStock })}
                className={'inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold ' + (r.inStock ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700')}>
                {r.inStock ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}{r.inStock ? t('inStock') : t('outStock')}
              </button>
              <button type="button" aria-label={t('removeItem')} onClick={() => setRows((prev) => prev.filter((_, j) => j !== i))}
                className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {rows.length < 30 && (
          <button type="button" onClick={add} className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-gray-700">
            <Plus className="h-4 w-4" />{t('addGasLine')}
          </button>
        )}
        <button type="button" disabled={busy} onClick={() => void save()}
          className="inline-flex items-center gap-1 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}{busy ? t('saving') : t('saveGas')}
        </button>
      </div>
      {msg && <div className="mt-3"><Banner kind={msg.kind} text={msg.text} /></div>}
    </section>
  );
}

function MenuEditor({ placeId, initial, lang, t }: { placeId: string; initial: FoodItem[]; lang: FoodLang; t: T }) {
  const [rows, setRows] = useState<Array<{ name: string; price: string; note: string; available: boolean }>>(
    initial.map((i) => ({ name: i.name, price: i.price_xaf !== null ? String(i.price_xaf) : '', note: i.note || '', available: i.available !== false })),
  );
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const set = (i: number, patch: Partial<{ name: string; price: string; note: string; available: boolean }>) =>
    setRows((prev) => prev.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  const save = async () => {
    setMsg(null);
    const clean = rows.filter((r) => r.name.trim() || r.price.trim() || r.note.trim());
    for (const r of clean) {
      if (r.name.trim().length < 2) { setMsg({ kind: 'err', text: reasonText(lang, 'bad_items') }); return; }
      if (hasPhoneNumber(r.name) || hasPhoneNumber(r.note)) { setMsg({ kind: 'err', text: reasonText(lang, 'phone_in_text') }); return; }
      if (r.price.trim() && !/^[0-9]{2,7}$/.test(r.price.trim().replace(/[\s.,]/g, ''))) { setMsg({ kind: 'err', text: reasonText(lang, 'bad_price') }); return; }
    }
    setBusy(true);
    const r = await saveItems(placeId, clean.map((x) => ({
      name: x.name.trim(), note: x.note.trim(), available: x.available,
      price_xaf: x.price.trim() ? Number(x.price.trim().replace(/[\s.,]/g, '')) : null,
    })));
    setBusy(false);
    if (r.ok) { setRows(clean); setMsg({ kind: 'ok', text: t('menuSaved') }); } else setMsg({ kind: 'err', text: reasonText(lang, r.reason) });
  };

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm" data-section="menu">
      <h2 className="mb-3 text-lg font-extrabold text-gray-900">{t('menuTitle')}</h2>
      <div className="space-y-3">
        {rows.map((r, i) => (
          <div key={i} className="rounded-xl border border-gray-100 p-3">
            <div className="grid grid-cols-3 gap-2">
              <input value={r.name} maxLength={60} placeholder={t('itemName')} aria-label={t('itemName')}
                onChange={(e) => set(i, { name: e.target.value })} className="col-span-2 rounded-lg border border-gray-200 px-2.5 py-2 text-sm" />
              <input value={r.price} inputMode="numeric" maxLength={9} placeholder={t('itemPrice')} aria-label={t('itemPrice')}
                onChange={(e) => set(i, { price: e.target.value })} className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm" />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <input value={r.note} maxLength={120} placeholder={t('itemNote')} aria-label={t('itemNote')}
                onChange={(e) => set(i, { note: e.target.value })} className="min-w-0 flex-1 rounded-lg border border-gray-200 px-2.5 py-2 text-sm" />
              <label className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700">
                <input type="checkbox" checked={r.available} onChange={(e) => set(i, { available: e.target.checked })} />{t('itemAvail')}
              </label>
              <button type="button" aria-label={t('removeItem')} onClick={() => setRows((prev) => prev.filter((_, j) => j !== i))}
                className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {rows.length < 40 && (
          <button type="button" onClick={() => setRows((prev) => prev.concat([{ name: '', price: '', note: '', available: true }]))}
            className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-gray-700">
            <Plus className="h-4 w-4" />{t('addItem')}
          </button>
        )}
        <button type="button" disabled={busy} onClick={() => void save()}
          className="inline-flex items-center gap-1 rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}{busy ? t('saving') : t('saveMenu')}
        </button>
      </div>
      {msg && <div className="mt-3"><Banner kind={msg.kind} text={msg.text} /></div>}
    </section>
  );
}

function PlaceEditor({ editId, lang, dir, t }: { editId: string | null; lang: FoodLang; dir: 'rtl' | 'ltr'; t: T }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [f, setF] = useState<FormState>(EMPTY);
  const [items, setItems] = useState<FoodItem[] | null>(editId ? null : []);
  const [offers, setOffers] = useState<GasOffer[]>([]);
  const [savedKinds, setSavedKinds] = useState<FoodKind[]>([]);
  const [loading, setLoading] = useState(!!editId);
  const [loadErr, setLoadErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err' | 'info'; text: string } | null>(
    new URLSearchParams(location.search).get('created') === '1' ? { kind: 'info', text: t('sentForApproval') } : null,
  );
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editId) return;
    let gone = false;
    void (async () => {
      const r = await getPlace(editId);
      if (gone) return;
      if (!r.ok || !r.me.can_edit) { setLoadErr(r.ok ? reasonText(lang, 'not_allowed') : reasonText(lang, r.reason)); setLoading(false); return; }
      const p = r.place;
      const known = knownArea(p.city, p.area);
      setF({
        ...EMPTY,
        name: p.name, kinds: p.kinds, description: p.description || '', city: isCityKey(p.city) ? p.city : '',
        areaPick: known ? known.key : OTHER, areaOther: known ? '' : p.area_label, landmark: p.landmark || '',
        photos: p.photos || [], days: p.open_days && p.open_days.length ? p.open_days : [0, 1, 2, 3, 4, 5, 6],
        opens: p.opens_at || '', closes: p.closes_at || '', keyPrice: p.key_price_xaf !== null ? String(p.key_price_xaf) : '',
        keyLabel: p.key_price_label || '', bookings: p.takes_bookings, delivers: p.delivers,
        meats: p.meats_saved || p.meats || [], dishes: p.dishes_saved || p.dishes || [],
      });
      setItems(p.items || []);
      setOffers(p.offers || []);
      setSavedKinds(p.kinds);
      setLoading(false);
    })();
    return () => { gone = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  // "/food-gas/edit/<id>#gas" (from "List my gas"): go straight to the gas list once it is on the page
  useEffect(() => {
    if (loading || location.hash !== '#gas') return undefined;
    const h = window.setTimeout(() => {
      const el = typeof document !== 'undefined' ? document.getElementById('gas-list') : null;
      if (el && typeof el.scrollIntoView === 'function') el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
    return () => window.clearTimeout(h);
  }, [loading, location.hash]);

  const pickPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (fileRef.current) fileRef.current.value = '';
    if (!file || !user) return;
    if (f.photos.length >= 6) return;
    setUploading(true);
    setMsg(null);
    const r = await uploadPhoto(user.id, file);
    setUploading(false);
    if (r.ok) setF((prev) => ({ ...prev, photos: prev.photos.concat([r.url]).slice(0, 6) }));
    else setMsg({ kind: 'err', text: reasonText(lang, r.reason) });
  };

  const save = async () => {
    setMsg(null);
    const name = f.name.trim().replace(/\s+/g, ' ');
    if (name.length < 2) { setMsg({ kind: 'err', text: reasonText(lang, 'bad_name') }); return; }
    if (f.kinds.length === 0) { setMsg({ kind: 'err', text: reasonText(lang, 'bad_kinds') }); return; }
    if (!f.city) { setMsg({ kind: 'err', text: reasonText(lang, 'bad_city') }); return; }
    let area = '';
    let areaLabel = '';
    if (f.areaPick && f.areaPick !== OTHER) {
      const k = knownArea(f.city, f.areaPick);
      if (k) { area = k.key; areaLabel = k.label; }
    } else {
      areaLabel = f.areaOther.trim().replace(/\s+/g, ' ');
      area = slugArea(areaLabel);
    }
    if (!area || areaLabel.length < 2) { setMsg({ kind: 'err', text: reasonText(lang, 'bad_area') }); return; }
    if ((f.opens && !f.closes) || (!f.opens && f.closes) || (f.opens && f.opens === f.closes)) { setMsg({ kind: 'err', text: reasonText(lang, 'bad_hours') }); return; }
    const kp = f.keyPrice.trim().replace(/[\s.,]/g, '');
    if (kp && !/^[0-9]{2,7}$/.test(kp)) { setMsg({ kind: 'err', text: reasonText(lang, 'bad_price') }); return; }
    if ([name, f.description, f.landmark, f.keyLabel, areaLabel].concat(f.dishes).some((s) => hasPhoneNumber(s))) {
      setMsg({ kind: 'err', text: reasonText(lang, 'phone_in_text') });
      return;
    }
    if (!editId && f.ownership === 'other' && f.ownerId.trim().length < 5) { setMsg({ kind: 'err', text: reasonText(lang, 'owner_not_found') }); return; }
    const data: PlaceInput = {
      name, kinds: f.kinds, description: f.description.trim(), city: f.city, area, area_label: areaLabel,
      landmark: f.landmark.trim(), photos: f.photos, open_days: f.days, opens_at: f.opens, closes_at: f.closes,
      key_price_xaf: kp ? Number(kp) : null, key_price_label: f.keyLabel.trim(), takes_bookings: f.bookings, delivers: f.delivers,
    };
    // meats and dishes go with a restaurant, grill or roasted-fish business (kept as they are otherwise)
    if (f.kinds.some((k) => isFoodKind(k))) {
      data.meats = f.meats;
      data.dishes = f.dishes;
    }
    if (!editId) {
      if (f.ownership === 'other') data.owner_identifier = f.ownerId.trim();
      else if (f.agentId.trim()) data.agent_identifier = f.agentId.trim();
    }
    setBusy(true);
    const r = await savePlace(editId, data);
    setBusy(false);
    if (!r.ok) { setMsg({ kind: 'err', text: reasonText(lang, r.reason) }); return; }
    if (!editId) { navigate('/food-gas/edit/' + r.id + '?created=1', { replace: true }); return; }
    setSavedKinds(f.kinds);
    setMsg({ kind: r.needs_review ? 'info' : 'ok', text: r.needs_review ? t('statusChanged') : t('saved') });
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>;
  if (loadErr) return <div className="p-6"><Banner kind="err" text={loadErr} /></div>;

  const toggleKind = (k: FoodKind) => setF((p) => ({ ...p, kinds: p.kinds.indexOf(k) >= 0 ? p.kinds.filter((x) => x !== k) : p.kinds.concat([k]) }));
  const toggleDay = (d: number) => setF((p) => ({ ...p, days: p.days.indexOf(d) >= 0 ? p.days.filter((x) => x !== d) : p.days.concat([d]) }));
  const toggleMeat = (m: Meat) => setF((p) => ({ ...p, meats: p.meats.indexOf(m) >= 0 ? p.meats.filter((x) => x !== m) : p.meats.concat([m]) }));
  const addDish = (raw: string) => {
    const d = raw.trim().replace(/\s+/g, ' ');
    if (!d) return;
    if (d.length < 2 || d.length > 30 || foldDish(d).length < 2) { setMsg({ kind: 'err', text: reasonText(lang, 'bad_dishes') }); return; }
    if (hasPhoneNumber(d)) { setMsg({ kind: 'err', text: reasonText(lang, 'phone_in_text') }); return; }
    setF((p) => {
      if (p.dishes.some((x) => foldDish(x) === foldDish(d))) return { ...p, dishInput: '' };
      if (p.dishes.length >= 24) return p;
      return { ...p, dishes: p.dishes.concat([d]), dishInput: '' };
    });
    setMsg(null);
  };
  const removeDish = (d: string) => setF((p) => ({ ...p, dishes: p.dishes.filter((x) => x !== d) }));
  const foodOn = f.kinds.some((k) => isFoodKind(k));
  const input = 'mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm';

  return (
    <div dir={dir} className="space-y-4">
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => navigate('/food-gas/mine')} aria-label={t('back')} className="rounded-xl p-2 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
        </button>
        <h1 className="text-xl font-extrabold text-gray-900">{editId ? t('formEdit') : t('formNew')}</h1>
      </div>
      {msg && <Banner kind={msg.kind} text={msg.text} />}

      <section className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
        {!editId && (
          <fieldset>
            <legend className="text-sm font-bold text-gray-800">{t('whoOwns')}</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {(['me', 'other'] as const).map((o) => (
                <button key={o} type="button" aria-pressed={f.ownership === o} onClick={() => setF({ ...f, ownership: o })}
                  className={'rounded-xl px-3 py-2.5 text-start text-sm font-bold ' + (f.ownership === o ? 'bg-orange-600 text-white' : 'border border-gray-200 text-gray-700')}>
                  {o === 'me' ? t('ownMe') : t('ownOther')}
                </button>
              ))}
            </div>
            {f.ownership === 'other' ? (
              <label className="mt-3 block text-sm font-semibold text-gray-700">
                {t('ownerId')}
                <input value={f.ownerId} maxLength={120} onChange={(e) => setF({ ...f, ownerId: e.target.value })} className={input} />
                <span className="mt-1 block text-xs font-normal text-gray-500">{t('ownerHint')}</span>
              </label>
            ) : (
              <label className="mt-3 block text-sm font-semibold text-gray-700">
                {t('agentId')}
                <input value={f.agentId} maxLength={120} onChange={(e) => setF({ ...f, agentId: e.target.value })} className={input} />
              </label>
            )}
          </fieldset>
        )}

        <label className="block text-sm font-semibold text-gray-700">
          {t('fName')}
          <input value={f.name} maxLength={80} onChange={(e) => setF({ ...f, name: e.target.value })} className={input} />
        </label>

        <fieldset>
          <legend className="text-sm font-semibold text-gray-700">{t('fKinds')}</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {FOOD_KINDS.map((k) => {
              const KI = KIND_ICON[k];
              const on = f.kinds.indexOf(k) >= 0;
              return (
                <button key={k} type="button" aria-pressed={on} onClick={() => toggleKind(k)}
                  className={'inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold ' + (on ? 'bg-orange-600 text-white' : 'border border-gray-200 text-gray-700')}>
                  <KI className="h-4 w-4" />{kindLabel(lang, k)}
                </button>
              );
            })}
          </div>
        </fieldset>

        {foodOn && (
          <div className="space-y-3 rounded-xl bg-amber-50/60 p-3" data-section="meats-dishes">
            <fieldset>
              <legend className="text-sm font-semibold text-gray-700">{t('fMeats')}</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {MEATS.map((m) => {
                  const on = f.meats.indexOf(m) >= 0;
                  return (
                    <button key={m} type="button" aria-pressed={on} data-meat={m} onClick={() => toggleMeat(m)}
                      className={'rounded-full px-3 py-1.5 text-sm font-bold ' + (on ? 'bg-amber-500 text-amber-950 shadow' : 'border border-gray-200 bg-white text-gray-700')}>
                      {on ? '\u2713 ' : ''}{meatLabel(lang, m)}
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <div>
              <p className="text-sm font-semibold text-gray-700">{t('fDishes')} <span className="text-xs font-normal text-gray-500">({f.dishes.length}/24)</span></p>
              <p className="text-xs text-gray-500">{t('fDishesHint')}</p>
              {f.dishes.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5" data-dishes-chosen="1">
                  {f.dishes.map((d) => (
                    <span key={d} className="inline-flex items-center gap-1 rounded-full bg-orange-600 px-2.5 py-1 text-xs font-bold text-white">
                      {d}
                      <button type="button" aria-label={t('removeItem') + ' ' + d} onClick={() => removeDish(d)} className="rounded-full p-0.5 hover:bg-white/20"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-2 flex flex-wrap gap-1.5" data-dishes-picks="1">
                {DISH_PICKS.filter((d) => !f.dishes.some((x) => foldDish(x) === foldDish(d))).map((d) => (
                  <button key={d} type="button" disabled={f.dishes.length >= 24} onClick={() => addDish(d)}
                    className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-white px-2.5 py-1 text-xs font-bold text-orange-800 disabled:opacity-40">
                    <Plus className="h-3 w-3" />{d}
                  </button>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <input value={f.dishInput} maxLength={30} placeholder={t('dishPh')} aria-label={t('dishPh')}
                  onChange={(e) => setF({ ...f, dishInput: e.target.value })}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addDish(f.dishInput); } }}
                  className="min-w-0 flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm" />
                <button type="button" disabled={f.dishes.length >= 24} onClick={() => addDish(f.dishInput)}
                  className="rounded-xl bg-orange-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-40">{t('addDish')}</button>
              </div>
            </div>
          </div>
        )}

        <label className="block text-sm font-semibold text-gray-700">
          {t('fDesc')}
          <textarea value={f.description} maxLength={800} rows={4} onChange={(e) => setF({ ...f, description: e.target.value })} className={input} />
          <span className="mt-0.5 block text-end text-[11px] font-normal text-gray-400">{f.description.length}/800</span>
        </label>
        <p className="rounded-xl bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-900">{t('noPhone')}</p>
      </section>

      <section className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-gray-700">
            {t('fCity')}
            <select value={f.city} onChange={(e) => setF({ ...f, city: isCityKey(e.target.value) ? e.target.value : '', areaPick: '', areaOther: '' })} className={input}>
              <option value="">-</option>
              {CITY_KEYS.map((c) => <option key={c} value={c}>{cityLabel(c, lang)}</option>)}
            </select>
          </label>
          <label className="block text-sm font-semibold text-gray-700">
            {t('fArea')}
            <select value={f.areaPick} disabled={!f.city} onChange={(e) => setF({ ...f, areaPick: e.target.value })} className={input}>
              <option value="">-</option>
              {f.city ? AREAS[f.city].map((a) => <option key={a.key} value={a.key}>{a.label}</option>) : null}
              <option value={OTHER}>{t('otherArea')}</option>
            </select>
          </label>
        </div>
        {f.areaPick === OTHER && (
          <label className="block text-sm font-semibold text-gray-700">
            {t('fAreaOther')}
            <input value={f.areaOther} maxLength={60} onChange={(e) => setF({ ...f, areaOther: e.target.value })} className={input} />
          </label>
        )}
        <label className="block text-sm font-semibold text-gray-700">
          {t('fLandmark')}
          <input value={f.landmark} maxLength={160} placeholder={t('fLandmarkPh')} onChange={(e) => setF({ ...f, landmark: e.target.value })} className={input} />
        </label>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold text-gray-700">{t('fPhotos')}</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {f.photos.map((u, i) => (
            <div key={u} className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
              <img src={u} alt={String(i + 1)} className="h-full w-full object-cover" />
              <button type="button" aria-label={t('removePhoto')} onClick={() => setF({ ...f, photos: f.photos.filter((x) => x !== u) })}
                className="absolute end-1 top-1 rounded-full bg-black/60 p-1 text-white"><X className="h-4 w-4" /></button>
            </div>
          ))}
          {f.photos.length < 6 && (
            <button type="button" disabled={uploading} onClick={() => fileRef.current?.click()}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-300 text-xs font-bold text-gray-600 disabled:opacity-60">
              {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Camera className="h-6 w-6" />}
              {uploading ? t('uploading') : t('addPhoto')}
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => void pickPhoto(e)} />
      </section>

      <section className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold text-gray-700">{t('fDays')}</p>
        <div className="flex flex-wrap gap-1.5">
          {WEEK_ORDER.map((d) => (
            <button key={d} type="button" aria-pressed={f.days.indexOf(d) >= 0} onClick={() => toggleDay(d)}
              className={'min-w-[3rem] rounded-lg px-2 py-2 text-xs font-bold ' + (f.days.indexOf(d) >= 0 ? 'bg-teal-600 text-white' : 'border border-gray-200 text-gray-600')}>
              {dayShort(lang, d)}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-semibold text-gray-700">
            {t('fOpens')}
            <input type="time" value={f.opens} onChange={(e) => setF({ ...f, opens: e.target.value })} className={input} />
          </label>
          <label className="block text-sm font-semibold text-gray-700">
            {t('fCloses')}
            <input type="time" value={f.closes} onChange={(e) => setF({ ...f, closes: e.target.value })} className={input} />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-semibold text-gray-700">
            {t('fKeyPrice')}
            <input value={f.keyPrice} inputMode="numeric" maxLength={9} onChange={(e) => setF({ ...f, keyPrice: e.target.value })} className={input} />
          </label>
          <label className="block text-sm font-semibold text-gray-700">
            {t('fKeyLabel')}
            <input value={f.keyLabel} maxLength={60} placeholder={t('fKeyLabelPh')} onChange={(e) => setF({ ...f, keyLabel: e.target.value })} className={input} />
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          <input type="checkbox" checked={f.bookings} onChange={(e) => setF({ ...f, bookings: e.target.checked })} />{t('fBookings')}
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          <input type="checkbox" checked={f.delivers} onChange={(e) => setF({ ...f, delivers: e.target.checked })} />{t('fDelivers')}
        </label>
      </section>

      <button type="button" disabled={busy || uploading} onClick={() => void save()}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 py-3.5 text-base font-extrabold text-white shadow disabled:opacity-60">
        {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}{busy ? t('saving') : t('save')}
      </button>

      {editId && savedKinds.indexOf('gas') >= 0 && <GasEditor placeId={editId} initial={offers} lang={lang} t={t} />}
      {editId && f.kinds.indexOf('gas') >= 0 && savedKinds.indexOf('gas') < 0 && <Banner kind="info" text={t('gasSaveFirst')} />}
      {editId && items !== null && (foodOn || items.length > 0) && <MenuEditor placeId={editId} initial={items} lang={lang} t={t} />}
    </div>
  );
}

// ------------------------------------------------------------------ featured sheet
function FeatureSheet({ place, lang, dir, t, onClose, onDone }: {
  place: MyPlace; lang: FoodLang; dir: 'rtl' | 'ltr'; t: T; onClose: () => void; onDone: () => void;
}) {
  const [plan, setPlan] = useState<FeaturePlan>('week');
  const [days, setDays] = useState(2);
  const [phone, setPhone] = useState('');
  const [phase, setPhase] = useState<'choose' | 'waiting' | 'paid' | 'failed' | 'underpaid' | 'timeout'>('choose');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [until, setUntil] = useState<string | null>(null);
  const timer = useRef<number | null>(null);
  const price = plan === 'day' ? 50 * days : plan === 'week' ? 300 : 1000;

  useEffect(() => () => { if (timer.current !== null) window.clearTimeout(timer.current); }, []);

  const watch = (orderId: string, started: number) => {
    timer.current = window.setTimeout(async () => {
      const r = await featureStatus(orderId);
      if (r.ok && (r.status === 'paid' || r.status === 'granted')) { setUntil(r.featured_until || r.ends_at); setPhase('paid'); onDone(); return; }
      if (r.ok && (r.status === 'failed' || r.status === 'expired')) { setPhase('failed'); return; }
      if (r.ok && r.status === 'underpaid') { setPhase('underpaid'); return; }
      if (Date.now() - started > 3 * 60 * 1000) { setPhase('timeout'); return; }
      watch(orderId, started);
    }, 4000);
  };

  const pay = async () => {
    setErr('');
    const nine = momoNumber(phone);
    if (!nine) { setErr(t('ftPhoneErr')); return; }
    setBusy(true);
    const o = await featureStart(place.id, plan, plan === 'day' ? days : undefined);
    if (!o.ok) { setBusy(false); setErr(reasonText(lang, o.reason)); return; }
    const p = await payWithMomo(o, nine);
    setBusy(false);
    if (!p.ok) { setErr(t('ftPayErr', { e: p.error === 'not_signed_in' ? reasonText(lang, 'not_signed_in') : p.error })); return; }
    setPhase('waiting');
    watch(o.order_id, Date.now());
  };

  const opt = (v: FeaturePlan, title: FoodKey, sub: FoodKey) => (
    <button type="button" aria-pressed={plan === v} onClick={() => setPlan(v)}
      className={'rounded-xl p-3 text-start ' + (plan === v ? 'bg-amber-400 text-amber-950 shadow' : 'border border-gray-200 text-gray-800')}>
      <span className="block text-sm font-extrabold">{t(title)}</span>
      <span className="block text-xs font-semibold">{t(sub)}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" role="dialog" aria-modal="true">
      <div dir={dir} className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 className="text-lg font-extrabold text-gray-900">{t('ftTitle', { area: place.area_label })}</h2>
          <button type="button" onClick={onClose} aria-label={t('close')} className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100"><X className="h-5 w-5" /></button>
        </div>
        <p className="text-sm text-gray-700">{t('ftBody', { area: place.area_label })}</p>

        {phase === 'choose' && (
          <>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {opt('day', 'ftDay', 'ftDayPrice')}
              {opt('week', 'ftWeek', 'ftWeekPrice')}
              {opt('month', 'ftMonth', 'ftMonthPrice')}
            </div>
            {plan === 'day' && (
              <div className="mt-3 flex items-center gap-3">
                <button type="button" aria-label="-" onClick={() => setDays(Math.max(2, days - 1))} className="h-10 w-10 rounded-xl border border-gray-200 text-lg font-bold">-</button>
                <span className="text-lg font-extrabold">{days}</span>
                <button type="button" aria-label="+" onClick={() => setDays(Math.min(5, days + 1))} className="h-10 w-10 rounded-xl border border-gray-200 text-lg font-bold">+</button>
                <span className="text-xs text-gray-500">{t('ftMin')}</span>
              </div>
            )}
            <label className="mt-4 block text-sm font-semibold text-gray-700">
              {t('ftPhone')}
              <input value={phone} inputMode="tel" maxLength={16} onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
            </label>
            {err && <div className="mt-3"><Banner kind="err" text={err} /></div>}
            <button type="button" disabled={busy} onClick={() => void pay()}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-base font-extrabold text-amber-950 disabled:opacity-60">
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Star className="h-5 w-5" />}{t('ftPay', { n: fmtXaf(price, lang) })}
            </button>
          </>
        )}
        {phase === 'waiting' && (
          <div className="mt-4 flex items-start gap-3 rounded-xl bg-amber-50 p-3">
            <Loader2 className="mt-0.5 h-5 w-5 flex-shrink-0 animate-spin text-amber-700" />
            <p className="text-sm font-semibold text-amber-900">{t('ftWaiting')}</p>
          </div>
        )}
        {phase === 'paid' && <div className="mt-4"><Banner kind="ok" text={t('ftPaid', { d: fmtDate(until, lang) })} /></div>}
        {phase === 'failed' && <div className="mt-4"><Banner kind="err" text={t('ftFailed')} /></div>}
        {phase === 'underpaid' && <div className="mt-4"><Banner kind="err" text={t('ftUnderpaid')} /></div>}
        {phase === 'timeout' && <div className="mt-4"><Banner kind="info" text={t('ftTimeout')} /></div>}
        {phase !== 'choose' && phase !== 'waiting' && (
          <button type="button" onClick={onClose} className="mt-4 w-full rounded-xl border border-gray-200 py-3 text-sm font-bold text-gray-700">{t('close')}</button>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ bookings
function BookingRow({ b, role, lang, t, onChanged }: { b: FoodBooking; role: 'owner' | 'buyer'; lang: FoodLang; t: T; onChanged: () => void }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const when = fmtWhen(b.want_at, lang);
  const statusCls = b.status === 'confirmed' ? 'bg-green-100 text-green-800' : b.status === 'sent' ? 'bg-amber-100 text-amber-900'
    : 'bg-gray-200 text-gray-700';
  const act = async (what: 'confirm' | 'decline' | 'cancel') => {
    setBusy(true);
    setErr('');
    const r = what === 'cancel'
      ? await cancelBooking(b.id, t('ansCancel', { when }))
      : await answerBooking(b.id, what === 'confirm', t(what === 'confirm' ? 'ansConfirm' : 'ansDecline', { when }));
    setBusy(false);
    if (r.ok) onChanged(); else setErr(reasonText(lang, r.reason));
  };
  const kindKey: FoodKey = b.kind === 'table' ? 'bTable' : b.kind === 'gas' ? (b.details ? 'bGasOrder' : 'bGas') : 'bOrder';
  const d = b.details || null;
  const gasLine = d
    ? d.quantity + ' x ' + d.label + ' ' + sizeText(lang, d.size_kg) + ' \u00b7 ' + t(d.mode === 'full' ? 'colNew' : 'colRefill') + ' \u00b7 '
      + (d.total_xaf !== null ? fmtXaf(d.total_xaf, lang) + ' XAF' : t('askPrice'))
    : '';
  return (
    <li className="rounded-xl border border-gray-100 p-3" data-booking={b.id}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-extrabold text-gray-900">{b.place_name}</p>
          <p className="text-xs font-semibold text-orange-700">{t(kindKey)} {'\u00b7'} {when}</p>
          {role === 'owner' && b.buyer_name && <p className="text-xs text-gray-600">{t('bkFrom', { name: b.buyer_name })}</p>}
        </div>
        <span className={'rounded-full px-2 py-0.5 text-[11px] font-bold ' + statusCls}>{t(('bs_' + b.status) as FoodKey)}</span>
      </div>
      <p className="mt-1 text-sm text-gray-700" data-booking-line={b.id}>
        {b.kind === 'table' ? t('lPeople') + ': ' + (b.people ?? '-') : gasLine || b.items}
        {b.kind !== 'table' ? ' \u00b7 ' + (b.delivery ? t('deliverMe') : t('pickUp')) : ''}
      </p>
      {b.note && <p className="text-xs text-gray-500">{t('lNote')}: {b.note}</p>}
      {err && <p className="mt-1 text-xs font-semibold text-red-600">{err}</p>}
      <div className="mt-2 flex flex-wrap gap-2">
        {role === 'owner' && b.status === 'sent' && (
          <>
            <button type="button" disabled={busy} onClick={() => void act('confirm')} className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60">{t('bkConfirm')}</button>
            <button type="button" disabled={busy} onClick={() => void act('decline')} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-700 disabled:opacity-60">{t('bkDecline')}</button>
          </>
        )}
        {role === 'buyer' && (b.status === 'sent' || b.status === 'confirmed') && (
          <button type="button" disabled={busy} onClick={() => void act('cancel')} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-700 disabled:opacity-60">{t('bkCancel')}</button>
        )}
        {b.conversation_id && (
          <button type="button" onClick={() => navigate('/chat?chat=' + encodeURIComponent(b.conversation_id || ''))}
            className="inline-flex items-center gap-1 rounded-lg border border-teal-200 px-3 py-1.5 text-xs font-bold text-teal-700">
            <MessageSquare className="h-3.5 w-3.5" />{t('bkOpenChat')}
          </button>
        )}
      </div>
    </li>
  );
}

function BookingsPanel({ lang, t, hasPlaces }: { lang: FoodLang; t: T; hasPlaces: boolean }) {
  const [role, setRole] = useState<'owner' | 'buyer'>(hasPlaces ? 'owner' : 'buyer');
  const [rows, setRows] = useState<FoodBooking[] | null>(null);
  const [err, setErr] = useState('');
  const load = useCallback(async () => {
    setRows(null);
    setErr('');
    const r = await listBookings(role);
    if (r.ok) setRows(r.rows); else { setRows([]); setErr(reasonText(lang, r.reason)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { setRole(hasPlaces ? 'owner' : 'buyer'); }, [hasPlaces]);
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm" data-section="bookings">
      <div className="mb-3 flex flex-wrap gap-2">
        {(['owner', 'buyer'] as const).map((r) => (
          <button key={r} type="button" aria-pressed={role === r} onClick={() => setRole(r)}
            className={'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold ' + (role === r ? 'bg-gray-900 text-white' : 'border border-gray-200 text-gray-700')}>
            <CalendarCheck className="h-4 w-4" />{r === 'owner' ? t('bkTitleOwner') : t('bkTitleMine')}
          </button>
        ))}
      </div>
      {err && <Banner kind="err" text={err} />}
      {rows === null ? (
        <div className="flex justify-center py-6"><Loader2 className="h-6 w-6 animate-spin text-orange-500" /></div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-gray-500">{t('bkNone')}</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((b) => <BookingRow key={b.id} b={b} role={role} lang={lang} t={t} onChanged={() => void load()} />)}
        </ul>
      )}
    </section>
  );
}

// ------------------------------------------------------------------ my businesses
function MineView({ lang, dir, t }: { lang: FoodLang; dir: 'rtl' | 'ltr'; t: T }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [rows, setRows] = useState<MyPlace[] | null>(null);
  const [err, setErr] = useState('');
  const [busyId, setBusyId] = useState('');
  const [feature, setFeature] = useState<MyPlace | null>(null);
  const wantFeature = new URLSearchParams(location.search).get('feature');

  const load = useCallback(async () => {
    const r = await myPlaces();
    if (r.ok) { setRows(r.rows); setErr(''); } else { setRows([]); setErr(reasonText(lang, r.reason)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (!wantFeature || !rows) return;
    const hit = rows.filter((p) => p.id === wantFeature && p.status === 'live');
    if (hit.length) setFeature(hit[0]);
  }, [wantFeature, rows]);

  const stock = async (p: MyPlace, o: GasOffer) => {
    setBusyId(o.id);
    const r = await setOfferStock(o.id, !o.in_stock);
    setBusyId('');
    if (!r.ok) { setErr(reasonText(lang, r.reason)); return; }
    setRows((prev) => (prev || []).map((x) => (x.id === p.id ? {
      ...x, gas_available: r.gas_available, gas_today: r.gas_available, gas_checked_at: r.gas_checked_at,
      gas_offers: (x.gas_offers || []).map((y) => (y.id === o.id ? { ...y, in_stock: r.in_stock } : y)),
    } : x)));
  };
  const gas = async (p: MyPlace, v: boolean) => {
    setBusyId(p.id);
    const r = await setGas(p.id, v);
    setBusyId('');
    if (r.ok) setRows((prev) => (prev || []).map((x) => (x.id === p.id ? { ...x, gas_available: r.gas_available, gas_today: r.gas_available, gas_checked_at: r.gas_checked_at } : x)));
    else setErr(reasonText(lang, r.reason));
  };
  const visible = async (p: MyPlace, v: boolean) => {
    setBusyId(p.id);
    const r = await setVisible(p.id, v);
    setBusyId('');
    if (r.ok) void load(); else setErr(reasonText(lang, r.reason));
  };

  return (
    <div dir={dir} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => navigate('/food-gas')} aria-label={t('back')} className="rounded-xl p-2 hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
          </button>
          <h1 className="text-xl font-extrabold text-gray-900">{t('mineTitle')}</h1>
        </div>
        <button type="button" onClick={() => navigate('/food-gas/new')}
          className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-3 py-2 text-sm font-bold text-white">
          <Plus className="h-4 w-4" />{t('addBusiness')}
        </button>
      </div>
      {err && <Banner kind="err" text={err} />}
      {rows === null ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-orange-200 bg-white p-8 text-center">
          <Store className="mx-auto h-10 w-10 text-orange-300" />
          <p className="mt-2 font-semibold text-gray-700">{t('mineEmpty')}</p>
          <button type="button" onClick={() => navigate('/food-gas/new')} className="mt-4 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-bold text-white">{t('addFirst')}</button>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((p) => {
            const KI = KIND_ICON[p.kinds[0] || 'restaurant'];
            const isGas = p.kinds.indexOf('gas') >= 0;
            const answeredToday = !!p.gas_checked_at && doualaNow(new Date(p.gas_checked_at)).ymd === doualaNow().ymd;
            const featuredOn = !!p.featured_until && new Date(p.featured_until).getTime() > Date.now();
            return (
              <li key={p.id} data-mine={p.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                <div className="flex gap-3 p-3">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-orange-50">
                    {p.photo ? <img src={p.photo} alt={p.name} className="h-full w-full object-cover" />
                      : <div className="flex h-full items-center justify-center text-orange-300"><KI className="h-8 w-8" /></div>}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="font-extrabold text-gray-900">{p.name}</p>
                    <StatusBadge p={p} t={t} />
                    <p className="text-xs text-gray-600">{p.area_label}, {cityLabel(p.city, lang)}</p>
                    {p.my_role === 'agent' && p.owner_name && <p className="text-xs text-gray-500">{t('asAgent', { name: p.owner_name })}</p>}
                    {(p.status === 'rejected' || (p.status === 'hidden' && p.hidden_by === 'staff')) && p.review_note && (
                      <p className="text-xs font-semibold text-red-700">{p.status === 'rejected' ? t('statusRejected', { r: p.review_note }) : t('statusHiddenStaff', { r: p.review_note })}</p>
                    )}
                    {featuredOn && <p className="text-xs font-bold text-amber-700">{t('featuredUntil', { d: fmtDate(p.featured_until, lang) })}</p>}
                    {p.open_bookings > 0 && <p className="text-xs font-bold text-orange-700">{t('openBookings', { n: p.open_bookings })}</p>}
                  </div>
                </div>
                {isGas && (p.gas_offers || []).length > 0 && (
                  <div className="px-3 pb-2" data-stock-row={p.id}>
                    <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-gray-500">{t('stockToday')}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(p.gas_offers || []).map((o) => (
                        <button key={o.id} type="button" disabled={busyId === o.id} aria-pressed={o.in_stock} data-stock={o.id} onClick={() => void stock(p, o)}
                          className={'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold disabled:opacity-60 ' +
                            (o.in_stock ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600 line-through')}>
                          {o.in_stock ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          {brandLabel(o.brand, o.brand_other)} {fmtSize(o.size_kg, lang)} kg
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {isGas && (p.gas_offers || []).length === 0 && (
                  <div className="flex flex-wrap items-center justify-between gap-2 px-3 pb-2">
                    <p className="text-xs text-gray-600">{t('noGasLines')}</p>
                    <button type="button" onClick={() => navigate('/food-gas/edit/' + p.id + '#gas')}
                      className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-bold text-white">
                      <Flame className="h-3.5 w-3.5" />{t('listGas')}
                    </button>
                  </div>
                )}
                {isGas && (
                  <div className="grid grid-cols-2 gap-2 px-3 pb-2">
                    <button type="button" disabled={busyId === p.id} onClick={() => void gas(p, true)}
                      className={'rounded-xl py-2 text-xs font-bold ' + (p.gas_today ? 'bg-green-600 text-white' : 'border border-green-300 text-green-800')}>{t('gasSwitchYes')}</button>
                    <button type="button" disabled={busyId === p.id} onClick={() => void gas(p, false)}
                      className={'rounded-xl py-2 text-xs font-bold ' + (answeredToday && !p.gas_today ? 'bg-red-600 text-white' : 'border border-red-200 text-red-700')}>{t('gasSwitchNo')}</button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 border-t border-gray-100 px-3 py-2">
                  {p.status === 'live' && (
                    <button type="button" onClick={() => navigate('/food-gas/place/' + p.id)} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100">
                      <Eye className="h-3.5 w-3.5" />{t('view')}
                    </button>
                  )}
                  <button type="button" onClick={() => navigate('/food-gas/edit/' + p.id)} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100">
                    <Pencil className="h-3.5 w-3.5" />{t('edit')}
                  </button>
                  {(p.status === 'live' || p.status === 'pending') && (
                    <button type="button" disabled={busyId === p.id} onClick={() => void visible(p, false)} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100">
                      <EyeOff className="h-3.5 w-3.5" />{t('hide')}
                    </button>
                  )}
                  {p.status === 'hidden' && p.hidden_by === 'owner' && (
                    <button type="button" disabled={busyId === p.id} onClick={() => void visible(p, true)} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-teal-700 hover:bg-teal-50">
                      <Eye className="h-3.5 w-3.5" />{t('show')}
                    </button>
                  )}
                  {p.status === 'live' && (
                    <button type="button" onClick={() => setFeature(p)} className="inline-flex items-center gap-1 rounded-lg bg-amber-100 px-2.5 py-1.5 text-xs font-bold text-amber-900">
                      <Star className="h-3.5 w-3.5" />{t('feature')}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <BookingsPanel lang={lang} t={t} hasPlaces={!!rows && rows.length > 0} />

      {feature && <FeatureSheet place={feature} lang={lang} dir={dir} t={t} onClose={() => setFeature(null)} onDone={() => void load()} />}
    </div>
  );
}

export default function FoodGasManage() {
  const { lang, dir, t } = useFoodText();
  const { id } = useParams();
  const location = useLocation();
  const isNew = /\/food-gas\/new\/?$/.test(location.pathname);
  return (
    <div data-fix="FIX702" className="min-h-screen bg-gray-50 px-4 pb-24 pt-4">
      <div className="mx-auto max-w-2xl">
        {isNew ? <PlaceEditor key="new" editId={null} lang={lang} dir={dir} t={t} />
          : id ? <PlaceEditor key={id} editId={id} lang={lang} dir={dir} t={t} />
          : <MineView lang={lang} dir={dir} t={t} />}
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__FOOD_GAS_MANAGE_FIX702__COMPLETE
