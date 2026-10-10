// BAMBEH_DEPLOY_TOKEN__FOOD_GAS_MANAGE_FIX692_CLEAN
/**
 * src/features/foodgas/FoodGasManage.tsx - FIX692
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
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, CalendarCheck, Camera, Check, Eye, EyeOff, Loader2, MessageSquare, Pencil, Plus, Star, Store, Trash2, X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  AREAS, CITY_KEYS, FOOD_KINDS, KIND_ICON, cityLabel, dayShort, doualaNow, fmtDate, fmtWhen, fmtXaf, hasPhoneNumber,
  isCityKey, kindLabel, knownArea, momoNumber, reasonText, slugArea, useFoodText,
} from './foodGasText';
import type { CityKey, FoodKey, FoodKind, FoodLang } from './foodGasText';
import {
  answerBooking, cancelBooking, featureStart, featureStatus, getPlace, listBookings, myPlaces, payWithMomo, saveItems,
  savePlace, setGas, setVisible, uploadPhoto,
} from './foodGasApi';
import type { FeaturePlan, FoodBooking, FoodItem, MyPlace, PlaceInput } from './foodGasApi';

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
}

const EMPTY: FormState = {
  ownership: 'me', ownerId: '', agentId: '', name: '', kinds: [], description: '', city: '', areaPick: '', areaOther: '',
  landmark: '', photos: [], days: [0, 1, 2, 3, 4, 5, 6], opens: '', closes: '', keyPrice: '', keyLabel: '',
  bookings: true, delivers: false,
};

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
      });
      setItems(p.items || []);
      setLoading(false);
    })();
    return () => { gone = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

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
    if ([name, f.description, f.landmark, f.keyLabel, areaLabel].some((s) => hasPhoneNumber(s))) {
      setMsg({ kind: 'err', text: reasonText(lang, 'phone_in_text') });
      return;
    }
    if (!editId && f.ownership === 'other' && f.ownerId.trim().length < 5) { setMsg({ kind: 'err', text: reasonText(lang, 'owner_not_found') }); return; }
    const data: PlaceInput = {
      name, kinds: f.kinds, description: f.description.trim(), city: f.city, area, area_label: areaLabel,
      landmark: f.landmark.trim(), photos: f.photos, open_days: f.days, opens_at: f.opens, closes_at: f.closes,
      key_price_xaf: kp ? Number(kp) : null, key_price_label: f.keyLabel.trim(), takes_bookings: f.bookings, delivers: f.delivers,
    };
    if (!editId) {
      if (f.ownership === 'other') data.owner_identifier = f.ownerId.trim();
      else if (f.agentId.trim()) data.agent_identifier = f.agentId.trim();
    }
    setBusy(true);
    const r = await savePlace(editId, data);
    setBusy(false);
    if (!r.ok) { setMsg({ kind: 'err', text: reasonText(lang, r.reason) }); return; }
    if (!editId) { navigate('/food-gas/edit/' + r.id + '?created=1', { replace: true }); return; }
    setMsg({ kind: r.needs_review ? 'info' : 'ok', text: r.needs_review ? t('statusChanged') : t('saved') });
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>;
  if (loadErr) return <div className="p-6"><Banner kind="err" text={loadErr} /></div>;

  const toggleKind = (k: FoodKind) => setF((p) => ({ ...p, kinds: p.kinds.indexOf(k) >= 0 ? p.kinds.filter((x) => x !== k) : p.kinds.concat([k]) }));
  const toggleDay = (d: number) => setF((p) => ({ ...p, days: p.days.indexOf(d) >= 0 ? p.days.filter((x) => x !== d) : p.days.concat([d]) }));
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

      {editId && items !== null && <MenuEditor placeId={editId} initial={items} lang={lang} t={t} />}
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
  const kindKey: FoodKey = b.kind === 'table' ? 'bTable' : b.kind === 'gas' ? 'bGas' : 'bOrder';
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
      <p className="mt-1 text-sm text-gray-700">
        {b.kind === 'table' ? t('lPeople') + ': ' + (b.people ?? '-') : b.items}
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
    <div data-fix="FIX692" className="min-h-screen bg-gray-50 px-4 pb-24 pt-4">
      <div className="mx-auto max-w-2xl">
        {isNew ? <PlaceEditor key="new" editId={null} lang={lang} dir={dir} t={t} />
          : id ? <PlaceEditor key={id} editId={id} lang={lang} dir={dir} t={t} />
          : <MineView lang={lang} dir={dir} t={t} />}
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__FOOD_GAS_MANAGE_FIX692__COMPLETE
