// BAMBEH_DEPLOY_TOKEN__WOMENS_HEALTH_MANAGE_FIX711_CLEAN
/**
 * src/features/womenshealth/WomensHealthManage.tsx - FIX711
 *   routes (signed in - AuthGate in App.tsx):
 *     /womens-health/mine             my places and screening days, where each one stands
 *     /womens-health/new-place        add a maternity, health centre, clinic, midwife, listening centre
 *     /womens-health/edit-place/:id   correct it (the person who added it, or an admin)
 *     /womens-health/new-day          announce a free screening day (?place=<id> links it to a place)
 *     /womens-health/edit-day/:id     correct it
 *
 * Anyone signed in can add a place they know - a facility's own staff, a Bambeh field agent, a
 * user. NOTHING shows until Bambeh staff have checked it and called its number (FIX705). The
 * official phone number goes in its own box; every other box refuses phone numbers and chat
 * links (contact stays inside Bambeh). A changed number is hidden again until staff call it.
 * The person who added something can take it down and put it back; a staff hide stays.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CalendarDays, CheckCircle, ChevronLeft, Eye, EyeOff, Loader2, Pencil, Plus } from 'lucide-react';
import {
  TOWNS, WH_ADDED_AS, WH_KINDS, WH_REGIONS, WH_SERVICES, WH_TOPICS, dayRange, doualaNow, hasPhoneNumber, isWhRegion, kindLabel,
  phoneDigits, regionLabel, serviceLabel, topicLabel, useWhText, whReason, wt,
} from './whText';
import type { WhAddedAs, WhKind, WhKey, WhLang, WhRegion, WhService, WhT, WhTopic } from './whText';
import { getDay, getPlace, myItems, saveDay, savePlace, setVisible } from './whApi';
import type { WhDay, WhPlace, WhStatus } from './whApi';

type Mode = 'mine' | 'new-place' | 'edit-place' | 'new-day' | 'edit-day';

function modeOf(path: string): Mode {
  if (path.indexOf('/womens-health/new-place') === 0) return 'new-place';
  if (path.indexOf('/womens-health/edit-place/') === 0) return 'edit-place';
  if (path.indexOf('/womens-health/new-day') === 0) return 'new-day';
  if (path.indexOf('/womens-health/edit-day/') === 0) return 'edit-day';
  return 'mine';
}

const inputCls = 'mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900';
const labelCls = 'block text-sm font-bold text-gray-800';

function Field({ label, help, children }: { label: string; help?: string; children: ReactNode }) {
  return (
    <label className={labelCls}>
      {label}
      {children}
      {help && <span className="mt-1 block text-xs font-normal text-gray-500">{help}</span>}
    </label>
  );
}

function statusChip(t: WhT, status: WhStatus | undefined, needsReview: boolean | undefined) {
  const s = status || 'pending';
  const cls = s === 'live' ? (needsReview ? 'bg-amber-100 text-amber-900' : 'bg-green-100 text-green-800')
    : s === 'pending' ? 'bg-amber-100 text-amber-900' : 'bg-gray-200 text-gray-700';
  const key: WhKey = s === 'live' ? (needsReview ? 'sh_review' : 'sh_live') : s === 'pending' ? 'sh_pending' : s === 'rejected' ? 'sh_rejected' : 'sh_hidden';
  return <span className={'rounded-full px-2 py-0.5 text-[11px] font-extrabold ' + cls} data-chip={s}>{t(key)}</span>;
}

// ------------------------------------------------------------------ my places and days
function Mine({ lang, t }: { lang: WhLang; t: WhT }) {
  const navigate = useNavigate();
  const location = useLocation();
  const saved = new URLSearchParams(location.search).get('saved');
  const [places, setPlaces] = useState<WhPlace[]>([]);
  const [days, setDays] = useState<WhDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    const r = await myItems();
    if (r.ok) { setPlaces(r.places); setDays(r.days); setError(null); } else setError(whReason(lang, r.reason));
    setLoading(false);
  };
  useEffect(() => { void load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const flip = async (kind: 'place' | 'day', id: string, visible: boolean) => {
    if (!visible && !window.confirm(t('confirmTakeDown'))) return;
    setBusy(id);
    const r = await setVisible(kind, id, visible);
    setBusy(null);
    if (!r.ok) { setError(whReason(lang, r.reason)); return; }
    await load();
  };

  const savedText = saved === 'new' ? t('savedNew') : saved === 'review' ? t('savedReview') : saved === 'edit' ? t('savedEdit') : null;

  const actions = (kind: 'place' | 'day', x: WhPlace | WhDay, ended: boolean) => (
    <div className="flex flex-wrap gap-2 pt-1">
      {x.status === 'live' && !ended && (
        <button type="button" onClick={() => navigate('/womens-health/' + kind + '/' + x.id)} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-bold text-gray-700">
          <Eye className="h-3.5 w-3.5" />{t('view')}
        </button>
      )}
      {!ended && x.hidden_by !== 'staff' && (
        <button type="button" onClick={() => navigate('/womens-health/edit-' + kind + '/' + x.id)} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-bold text-gray-700">
          <Pencil className="h-3.5 w-3.5" />{t('edit')}
        </button>
      )}
      {(x.status === 'live' || x.status === 'pending') && !ended && (
        <button type="button" disabled={busy === x.id} onClick={() => void flip(kind, x.id, false)} data-take-down={x.id}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-bold text-gray-700 disabled:opacity-50">
          <EyeOff className="h-3.5 w-3.5" />{t('takeDown')}
        </button>
      )}
      {x.status === 'hidden' && x.hidden_by === 'owner' && !ended && (
        <button type="button" disabled={busy === x.id} onClick={() => void flip(kind, x.id, true)} data-put-back={x.id}
                className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1.5 text-xs font-bold text-white disabled:opacity-50">
          <Eye className="h-3.5 w-3.5" />{t('putBack')}
        </button>
      )}
    </div>
  );

  const note = (x: WhPlace | WhDay) => {
    if (x.status === 'rejected') return t('st_rejected', { r: x.review_note || '-' });
    if (x.status === 'hidden' && x.hidden_by === 'staff') return t('st_hidden_staff', { r: x.review_note || '-' });
    if (x.status === 'live' && x.phone_saved && !x.phone) return t('st_phone');
    return null;
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold text-gray-900">{t('mineTitle')}</h1>
      {savedText && <p className="flex items-start gap-2 rounded-2xl bg-green-50 p-3 text-sm font-semibold text-green-800" data-saved={saved}><CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />{savedText}</p>}
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => navigate('/womens-health/new-place')} className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-rose-600 px-3 py-3 text-sm font-extrabold text-white">
          <Plus className="h-4 w-4" />{t('addPlace')}
        </button>
        <button type="button" onClick={() => navigate('/womens-health/new-day')} className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-rose-200 bg-white px-3 py-3 text-sm font-extrabold text-rose-700">
          <CalendarDays className="h-4 w-4" />{t('addDay')}
        </button>
      </div>
      {error && <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {loading ? (
        <div className="flex justify-center py-10 text-gray-400"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : (
        <>
          <section className="space-y-2">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-gray-500">{t('minePlaces')}</h2>
            {places.length === 0 && <p className="text-sm text-gray-500">{t('mineNone')}</p>}
            {places.map((p) => (
              <article key={p.id} data-mine-place={p.id} className="space-y-1 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-extrabold text-gray-900">{p.name}</span>{statusChip(t, p.status, p.needs_review)}
                </div>
                <p className="text-xs text-gray-500">{kindLabel(lang, p.kind)} {'\u00b7'} {p.town} {'\u00b7'} {regionLabel(lang, p.region)}
                  {p.reports ? ' \u00b7 ' + t('reportsN', { n: p.reports }) : ''}</p>
                {note(p) && <p className="text-xs font-semibold text-amber-800">{note(p)}</p>}
                {actions('place', p, false)}
              </article>
            ))}
          </section>
          <section className="space-y-2">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-gray-500">{t('mineDays')}</h2>
            {days.length === 0 && <p className="text-sm text-gray-500">{t('mineNone')}</p>}
            {days.map((d) => (
              <article key={d.id} data-mine-day={d.id} className="space-y-1 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-extrabold text-gray-900">{d.title}</span>
                  {d.ended ? <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[11px] font-extrabold text-gray-700">{t('endedTag')}</span> : statusChip(t, d.status, d.needs_review)}
                </div>
                <p className="text-xs text-gray-500">{dayRange(lang, d.starts_on, d.ends_on)} {'\u00b7'} {d.town}
                  {typeof d.reminders === 'number' ? ' \u00b7 ' + t('remindersN', { n: d.reminders }) : ''}</p>
                {!d.ended && note(d) && <p className="text-xs font-semibold text-amber-800">{note(d)}</p>}
                {actions('day', d, !!d.ended)}
              </article>
            ))}
          </section>
        </>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ a place
interface PlaceForm {
  name: string; kind: WhKind | ''; services: WhService[]; region: WhRegion | ''; town: string; area: string; landmark: string;
  phone: string; open_24h: boolean; open_days: number[]; opens_at: string; closes_at: string; accepts_csu: boolean;
  women_doctors: boolean; price_note: string; description: string; added_as: WhAddedAs;
}

const EMPTY_PLACE: PlaceForm = {
  name: '', kind: '', services: [], region: '', town: '', area: '', landmark: '', phone: '', open_24h: false,
  open_days: [1, 2, 3, 4, 5, 6], opens_at: '', closes_at: '', accepts_csu: false, women_doctors: false, price_note: '',
  description: '', added_as: 'user',
};

/** The first problem, as the database would name it - so the person sees it before sending. */
function checkPlace(f: PlaceForm): string | null {
  const name = f.name.trim().replace(/\s+/g, ' ');
  if (name.length < 2 || name.length > 100) return 'bad_name';
  if (!f.kind) return 'bad_kind';
  if (f.services.length === 0) return 'bad_services';
  if (!f.region) return 'bad_region';
  const town = f.town.trim();
  if (town.length < 2 || town.length > 60) return 'bad_town';
  if (f.area.trim().length > 60 || f.landmark.trim().length > 160) return 'bad_landmark';
  if (phoneDigits(f.phone) === '!') return 'bad_phone';
  if (!f.open_24h) {
    if (f.open_days.length === 0) return 'bad_open_days';
    if (!!f.opens_at !== !!f.closes_at || (f.opens_at && f.opens_at === f.closes_at)) return 'bad_hours';
  }
  if (f.price_note.trim().length > 160) return 'bad_price_note';
  if (f.description.trim().length > 600) return 'bad_description';
  if (hasPhoneNumber([name, town, f.area, f.landmark, f.price_note, f.description].join(' | '))) return 'phone_in_text';
  return null;
}

function PlaceEditor({ id, lang, t }: { id: string | null; lang: WhLang; t: WhT }) {
  const navigate = useNavigate();
  const [f, setF] = useState<PlaceForm>(EMPTY_PLACE);
  const [loading, setLoading] = useState(!!id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let live = true;
    void getPlace(id).then((r) => {
      if (!live) return;
      if (!r.ok) { setBlocked(whReason(lang, r.reason)); setLoading(false); return; }
      if (!r.me.can_edit) { setBlocked(whReason(lang, 'not_allowed')); setLoading(false); return; }
      const p = r.place;
      setF({
        name: p.name, kind: p.kind, services: p.services.slice(), region: p.region, town: p.town, area: p.area, landmark: p.landmark,
        phone: p.phone_saved || '', open_24h: p.open_24h, open_days: (p.open_days || []).slice(), opens_at: p.opens_at || '',
        closes_at: p.closes_at || '', accepts_csu: p.accepts_csu, women_doctors: p.women_doctors, price_note: p.price_note,
        description: p.description, added_as: p.added_as || 'user',
      });
      setLoading(false);
    });
    return () => { live = false; };
  }, [id, lang]);

  const set = <K extends keyof PlaceForm>(k: K, v: PlaceForm[K]) => setF((old) => ({ ...old, [k]: v }));
  const toggleService = (s: WhService) => set('services', f.services.indexOf(s) >= 0 ? f.services.filter((x) => x !== s) : f.services.concat([s]));
  const toggleDay = (d: number) => set('open_days', f.open_days.indexOf(d) >= 0 ? f.open_days.filter((x) => x !== d) : f.open_days.concat([d]).sort());

  const submit = async () => {
    const bad = checkPlace(f);
    if (bad) { setError(whReason(lang, bad)); return; }
    setBusy(true); setError(null);
    const r = await savePlace(id, {
      name: f.name.trim(), kind: f.kind as WhKind, services: f.services, region: f.region as WhRegion, town: f.town.trim(),
      area: f.area.trim(), landmark: f.landmark.trim(), phone: f.phone.trim(), open_24h: f.open_24h, open_days: f.open_days,
      opens_at: f.open_24h ? '' : f.opens_at, closes_at: f.open_24h ? '' : f.closes_at, accepts_csu: f.accepts_csu,
      women_doctors: f.women_doctors, price_note: f.price_note.trim(), description: f.description.trim(), added_as: f.added_as,
    });
    setBusy(false);
    if (!r.ok) { setError(whReason(lang, r.reason)); return; }
    navigate('/womens-health/mine?saved=' + (!id ? 'new' : r.needs_review ? 'review' : 'edit'));
  };

  if (loading) return <div className="flex justify-center py-12 text-gray-400"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (blocked) return <p className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-800" data-blocked="1">{blocked}</p>;

  return (
    <form className="space-y-4" noValidate onSubmit={(e) => { e.preventDefault(); void submit(); }} data-form="place">
      <h1 className="text-2xl font-extrabold text-gray-900">{id ? t('editPlace') : t('newPlace')}</h1>
      {!id && <p className="rounded-2xl bg-rose-50 p-3 text-xs text-rose-900">{t('formIntro')}</p>}
      <Field label={t('fName')}>
        <input value={f.name} onChange={(e) => set('name', e.target.value)} maxLength={100} placeholder={t('fNamePh')} className={inputCls} data-f="name" />
      </Field>
      <Field label={t('fKind')}>
        <select value={f.kind} onChange={(e) => set('kind', e.target.value as WhKind)} className={inputCls} data-f="kind">
          <option value="">{t('fChoose')}</option>
          {WH_KINDS.map((k) => <option key={k} value={k}>{kindLabel(lang, k)}</option>)}
        </select>
      </Field>
      <fieldset className="space-y-2">
        <legend className={labelCls}>{t('fServices')}</legend>
        <p className="text-xs text-gray-500">{t('fServicesHelp')}</p>
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {WH_SERVICES.map((s) => (
            <label key={s} className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-3 py-2 text-sm text-gray-800">
              <input type="checkbox" checked={f.services.indexOf(s) >= 0} onChange={() => toggleService(s)} data-svc={s} />
              {serviceLabel(lang, s)}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t('fRegion')}>
          <select value={f.region} onChange={(e) => set('region', isWhRegion(e.target.value) ? e.target.value : '')} className={inputCls} data-f="region">
            <option value="">{t('fChoose')}</option>
            {WH_REGIONS.map((r) => <option key={r} value={r}>{regionLabel(lang, r)}</option>)}
          </select>
        </Field>
        <Field label={t('fTown')}>
          <input value={f.town} onChange={(e) => set('town', e.target.value)} maxLength={60} placeholder={t('fTownPh')} list="wh-place-towns" className={inputCls} data-f="town" />
          <datalist id="wh-place-towns">{(f.region ? TOWNS[f.region] : []).map((x) => <option key={x} value={x} />)}</datalist>
        </Field>
      </div>
      <Field label={t('fArea')}>
        <input value={f.area} onChange={(e) => set('area', e.target.value)} maxLength={60} className={inputCls} data-f="area" />
      </Field>
      <Field label={t('fLandmark')}>
        <input value={f.landmark} onChange={(e) => set('landmark', e.target.value)} maxLength={160} placeholder={t('fLandmarkPh')} className={inputCls} data-f="landmark" />
      </Field>
      <Field label={t('fPhone')} help={t('fPhoneHelp')}>
        <input value={f.phone} onChange={(e) => set('phone', e.target.value)} maxLength={20} inputMode="tel" className={inputCls} data-f="phone" />
      </Field>
      <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
        <input type="checkbox" checked={f.open_24h} onChange={(e) => set('open_24h', e.target.checked)} data-f="open_24h" />{t('f24hForm')}
      </label>
      {!f.open_24h && (
        <div className="space-y-3 rounded-2xl border border-gray-100 bg-white p-3">
          <p className={labelCls}>{t('fDays')}</p>
          <div className="flex flex-wrap gap-1.5">
            {[1, 2, 3, 4, 5, 6, 0].map((d) => (
              <button key={d} type="button" onClick={() => toggleDay(d)} aria-pressed={f.open_days.indexOf(d) >= 0} data-day-toggle={d}
                      className={'rounded-full px-3 py-1.5 text-xs font-bold ' + (f.open_days.indexOf(d) >= 0 ? 'bg-gray-900 text-white' : 'border border-gray-200 text-gray-700')}>
                {wt(lang, ('d' + d) as WhKey)}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('fOpens')}><input type="time" value={f.opens_at} onChange={(e) => set('opens_at', e.target.value)} className={inputCls} data-f="opens_at" /></Field>
            <Field label={t('fCloses')}><input type="time" value={f.closes_at} onChange={(e) => set('closes_at', e.target.value)} className={inputCls} data-f="closes_at" /></Field>
          </div>
        </div>
      )}
      <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
        <input type="checkbox" checked={f.accepts_csu} onChange={(e) => set('accepts_csu', e.target.checked)} data-f="accepts_csu" />{t('fCsu')}
      </label>
      <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
        <input type="checkbox" checked={f.women_doctors} onChange={(e) => set('women_doctors', e.target.checked)} data-f="women_doctors" />{t('fWomen')}
      </label>
      <Field label={t('fPrice')} help={t('noNumbersInText')}>
        <input value={f.price_note} onChange={(e) => set('price_note', e.target.value)} maxLength={160} placeholder={t('fPricePh')} className={inputCls} data-f="price_note" />
      </Field>
      <Field label={t('fDesc')}>
        <textarea value={f.description} onChange={(e) => set('description', e.target.value)} maxLength={600} rows={3} className={inputCls} data-f="description" />
      </Field>
      <fieldset className="space-y-1.5">
        <legend className={labelCls}>{t('fAs')}</legend>
        {WH_ADDED_AS.map((a) => (
          <label key={a} className="flex items-center gap-2 text-sm text-gray-800">
            <input type="radio" name="wh-added-as" checked={f.added_as === a} onChange={() => set('added_as', a)} data-as={a} />
            {t(('as_' + a) as WhKey)}
          </label>
        ))}
      </fieldset>
      {error && <p className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-800" data-error="1">{error}</p>}
      <button type="submit" onClick={(e) => { e.preventDefault(); void submit(); }} disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-base font-extrabold text-white shadow disabled:opacity-60">
        {busy && <Loader2 className="h-5 w-5 animate-spin" />}{busy ? t('saving') : id ? t('saveEdit') : t('saveNew')}
      </button>
    </form>
  );
}

// ------------------------------------------------------------------ a screening day
interface DayForm {
  title: string; topics: WhTopic[]; organiser: string; region: WhRegion | ''; town: string; venue: string; landmark: string;
  starts_on: string; ends_on: string; opens_at: string; closes_at: string; free_what: string; paid_after: string; phone: string;
  place_id: string | null; place_name: string | null;
}

const EMPTY_DAY: DayForm = {
  title: '', topics: [], organiser: '', region: '', town: '', venue: '', landmark: '', starts_on: '', ends_on: '', opens_at: '',
  closes_at: '', free_what: '', paid_after: '', phone: '', place_id: null, place_name: null,
};

function addDays(ymd: string, n: number): string {
  const d = new Date(ymd + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function checkDay(f: DayForm, today: string): string | null {
  const title = f.title.trim().replace(/\s+/g, ' ');
  if (title.length < 2 || title.length > 100) return 'bad_title';
  if (f.topics.length === 0) return 'bad_topics';
  if (f.organiser.trim().length > 100) return 'bad_organiser';
  if (!f.region) return 'bad_region';
  const town = f.town.trim();
  if (town.length < 2 || town.length > 60) return 'bad_town';
  const venue = f.venue.trim();
  if (venue.length < 2 || venue.length > 120) return 'bad_venue';
  if (f.landmark.trim().length > 160) return 'bad_landmark';
  const start = f.starts_on;
  const end = f.ends_on || f.starts_on;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) return 'bad_dates';
  if (end < start || end < today || start > addDays(today, 180) || end > addDays(start, 62)) return 'bad_dates';
  if (!!f.opens_at !== !!f.closes_at || (f.opens_at && f.opens_at >= f.closes_at)) return 'bad_hours';
  if (f.free_what.trim().length > 200 || f.paid_after.trim().length > 200) return 'too_long';
  if (phoneDigits(f.phone) === '!') return 'bad_phone';
  if (hasPhoneNumber([title, f.organiser, town, venue, f.landmark, f.free_what, f.paid_after].join(' | '))) return 'phone_in_text';
  return null;
}

function DayEditor({ id, placeParam, lang, t }: { id: string | null; placeParam: string | null; lang: WhLang; t: WhT }) {
  const navigate = useNavigate();
  const [f, setF] = useState<DayForm>(EMPTY_DAY);
  const [loading, setLoading] = useState(!!id || !!placeParam);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<string | null>(null);
  const today = doualaNow().ymd;

  useEffect(() => {
    let live = true;
    if (id) {
      void getDay(id).then((r) => {
        if (!live) return;
        if (!r.ok) { setBlocked(whReason(lang, r.reason)); setLoading(false); return; }
        if (!r.me.can_edit) { setBlocked(whReason(lang, 'not_allowed')); setLoading(false); return; }
        const d = r.day;
        setF({
          title: d.title, topics: d.topics.slice(), organiser: d.organiser, region: d.region, town: d.town, venue: d.venue, landmark: d.landmark,
          starts_on: d.starts_on, ends_on: d.ends_on === d.starts_on ? '' : d.ends_on, opens_at: d.opens_at || '', closes_at: d.closes_at || '',
          free_what: d.free_what, paid_after: d.paid_after, phone: d.phone_saved || '', place_id: d.place_id, place_name: d.place_name,
        });
        setLoading(false);
      });
    } else if (placeParam) {
      void getPlace(placeParam).then((r) => {
        if (!live) return;
        if (r.ok && r.place.status === 'live') {
          const p = r.place;
          setF((old) => ({ ...old, place_id: p.id, place_name: p.name, region: p.region, town: p.town, venue: p.name, landmark: p.landmark }));
        }
        setLoading(false);
      });
    }
    return () => { live = false; };
  }, [id, placeParam, lang]);

  const set = <K extends keyof DayForm>(k: K, v: DayForm[K]) => setF((old) => ({ ...old, [k]: v }));
  const toggleTopic = (x: WhTopic) => set('topics', f.topics.indexOf(x) >= 0 ? f.topics.filter((y) => y !== x) : f.topics.concat([x]));

  const submit = async () => {
    const bad = checkDay(f, today);
    if (bad) { setError(whReason(lang, bad)); return; }
    setBusy(true); setError(null);
    const r = await saveDay(id, {
      title: f.title.trim(), topics: f.topics, organiser: f.organiser.trim(), region: f.region as WhRegion, town: f.town.trim(),
      venue: f.venue.trim(), landmark: f.landmark.trim(), starts_on: f.starts_on, ends_on: f.ends_on || f.starts_on, opens_at: f.opens_at,
      closes_at: f.closes_at, free_what: f.free_what.trim(), paid_after: f.paid_after.trim(), phone: f.phone.trim(), place_id: f.place_id,
    });
    setBusy(false);
    if (!r.ok) { setError(whReason(lang, r.reason)); return; }
    navigate('/womens-health/mine?saved=' + (!id ? 'new' : r.needs_review ? 'review' : 'edit'));
  };

  if (loading) return <div className="flex justify-center py-12 text-gray-400"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (blocked) return <p className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-800" data-blocked="1">{blocked}</p>;

  return (
    <form className="space-y-4" noValidate onSubmit={(e) => { e.preventDefault(); void submit(); }} data-form="day">
      <h1 className="text-2xl font-extrabold text-gray-900">{id ? t('editDay') : t('newDay')}</h1>
      {f.place_name && <p className="rounded-2xl bg-rose-50 p-3 text-sm font-bold text-rose-900" data-at-place={f.place_id || ''}>{t('fAtPlace', { p: f.place_name })}</p>}
      <Field label={t('fTitle')}>
        <input value={f.title} onChange={(e) => set('title', e.target.value)} maxLength={100} placeholder={t('fTitlePh')} className={inputCls} data-f="title" />
      </Field>
      <fieldset className="space-y-2">
        <legend className={labelCls}>{t('fTopics')}</legend>
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {WH_TOPICS.map((x) => (
            <label key={x} className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-3 py-2 text-sm text-gray-800">
              <input type="checkbox" checked={f.topics.indexOf(x) >= 0} onChange={() => toggleTopic(x)} data-topic-box={x} />
              {topicLabel(lang, x)}
            </label>
          ))}
        </div>
      </fieldset>
      <Field label={t('fOrganiser')}>
        <input value={f.organiser} onChange={(e) => set('organiser', e.target.value)} maxLength={100} placeholder={t('fOrganiserPh')} className={inputCls} data-f="organiser" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t('fRegion')}>
          <select value={f.region} onChange={(e) => set('region', isWhRegion(e.target.value) ? e.target.value : '')} className={inputCls} data-f="region">
            <option value="">{t('fChoose')}</option>
            {WH_REGIONS.map((r) => <option key={r} value={r}>{regionLabel(lang, r)}</option>)}
          </select>
        </Field>
        <Field label={t('fTown')}>
          <input value={f.town} onChange={(e) => set('town', e.target.value)} maxLength={60} placeholder={t('fTownPh')} list="wh-day-towns" className={inputCls} data-f="town" />
          <datalist id="wh-day-towns">{(f.region ? TOWNS[f.region] : []).map((x) => <option key={x} value={x} />)}</datalist>
        </Field>
      </div>
      <Field label={t('fVenue')}>
        <input value={f.venue} onChange={(e) => set('venue', e.target.value)} maxLength={120} placeholder={t('fVenuePh')} className={inputCls} data-f="venue" />
      </Field>
      <Field label={t('fLandmark')}>
        <input value={f.landmark} onChange={(e) => set('landmark', e.target.value)} maxLength={160} placeholder={t('fLandmarkPh')} className={inputCls} data-f="landmark" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t('fStart')}><input type="date" value={f.starts_on} min={id ? undefined : today} onChange={(e) => set('starts_on', e.target.value)} className={inputCls} data-f="starts_on" /></Field>
        <Field label={t('fEnd')}><input type="date" value={f.ends_on} min={f.starts_on || today} onChange={(e) => set('ends_on', e.target.value)} className={inputCls} data-f="ends_on" /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t('fOpens')}><input type="time" value={f.opens_at} onChange={(e) => set('opens_at', e.target.value)} className={inputCls} data-f="opens_at" /></Field>
        <Field label={t('fCloses')}><input type="time" value={f.closes_at} onChange={(e) => set('closes_at', e.target.value)} className={inputCls} data-f="closes_at" /></Field>
      </div>
      <Field label={t('fFree')} help={t('noNumbersInText')}>
        <input value={f.free_what} onChange={(e) => set('free_what', e.target.value)} maxLength={200} placeholder={t('fFreePh')} className={inputCls} data-f="free_what" />
      </Field>
      <Field label={t('fPaid')}>
        <input value={f.paid_after} onChange={(e) => set('paid_after', e.target.value)} maxLength={200} placeholder={t('fPaidPh')} className={inputCls} data-f="paid_after" />
      </Field>
      <Field label={t('fDayPhone')} help={t('fPhoneHelp')}>
        <input value={f.phone} onChange={(e) => set('phone', e.target.value)} maxLength={20} inputMode="tel" className={inputCls} data-f="phone" />
      </Field>
      {error && <p className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-800" data-error="1">{error}</p>}
      <button type="submit" onClick={(e) => { e.preventDefault(); void submit(); }} disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-base font-extrabold text-white shadow disabled:opacity-60">
        {busy && <Loader2 className="h-5 w-5 animate-spin" />}{busy ? t('saving') : id ? t('saveEdit') : t('saveNew')}
      </button>
    </form>
  );
}

export default function WomensHealthManage() {
  const { lang, dir, t } = useWhText();
  const location = useLocation();
  const navigate = useNavigate();
  const { id = '' } = useParams();
  const mode = modeOf(location.pathname);
  const placeParam = new URLSearchParams(location.search).get('place');
  return (
    <div dir={dir} data-fix="FIX711" className="mx-auto max-w-2xl space-y-4 px-4 py-4">
      <button type="button" onClick={() => navigate(mode === 'mine' ? '/womens-health' : '/womens-health/mine')}
              className="inline-flex items-center gap-1 rounded-xl px-2 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100">
        <ChevronLeft className="h-4 w-4 rtl:rotate-180" />{mode === 'mine' ? t('title') : t('mine')}
      </button>
      {mode === 'mine' && <Mine lang={lang} t={t} />}
      {mode === 'new-place' && <PlaceEditor key="new-place" id={null} lang={lang} t={t} />}
      {mode === 'edit-place' && <PlaceEditor key={'edit-' + id} id={id} lang={lang} t={t} />}
      {mode === 'new-day' && <DayEditor key={'new-day-' + (placeParam || '')} id={null} placeParam={placeParam} lang={lang} t={t} />}
      {mode === 'edit-day' && <DayEditor key={'edit-day-' + id} id={id} placeParam={null} lang={lang} t={t} />}
    </div>
  );
}
// BAMBEH_END_TOKEN__WOMENS_HEALTH_MANAGE_FIX711__COMPLETE
