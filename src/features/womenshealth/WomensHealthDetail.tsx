// BAMBEH_DEPLOY_TOKEN__WOMENS_HEALTH_DETAIL_FIX721_CLEAN
/**
 * src/features/womenshealth/WomensHealthDetail.tsx - FIX721 (replaces FIX709, which was never deployed)
 *   routes: /womens-health/place/:id   one maternity, health centre, clinic or listening centre
 *           /womens-health/day/:id     one free screening day ("remind me" links land here)
 *
 * FIX721 (Big, 11 Oct 2026 evening): a free service that needs a Bambeh account.
 *   - No account: the free account card (create one / sign in) with the emergency numbers - the
 *     database refuses a place or a day to a signed-out phone too (FIX715).
 *   - No connection: the place or day as it was last opened on this phone, with the date it was
 *     saved (public information only), so the number and the directions still help without data.
 *   - QUICK EXIT at the bottom left (whUi, FIX719).
 * Kept from FIX709:
 *   - Tap to call: only the facility's official number, and only once Bambeh staff have called it.
 *     A changed number disappears until it is checked again.
 *   - "Report a problem": the number does not work, it is closed, wrong information - Bambeh staff
 *     see it at once in the Command Center. One open report per person.
 *   - Screening day: "Remind me the day before", and a clear line once it has ended.
 *   - The person who added it, and staff, also see where it stands: waiting for the check, not
 *     approved (with the reason), taken down, a change being checked, a new number being checked.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, Bell, BellOff, CalendarDays, ChevronLeft, ChevronRight, Clock, Flag, Loader2, MapPin, Pencil, Phone, Plus, ShieldCheck } from 'lucide-react';
import { FreeAccountCard, FreeAccountChecking, useFreeAccount } from '@/components/security/FreeServiceGate';
import {
  WH_REPORT_REASONS, dayRange, dayWhen, daysText, doualaNow, fmtLongDay, fmtPhone, fmtSavedAt, kindLabel, opensLaterToday, placeOpenState,
  regionLabel, reportLabel, serviceLabel, telHref, topicLabel, useWhText, whReason,
} from './whText';
import type { WhLang, WhReportReason, WhT } from './whText';
import { getDay, getPlace, remind, report } from './whApi';
import type { WhDay, WhMe, WhPlace } from './whApi';
import { OfflineNote, QuickExit, loadItem, saveItem } from './whUi';

/** What a page read from the phone may do: read only - no edit, no report, no reminder. */
const OFFLINE_ME: WhMe = { signed_in: true, is_mine: false, is_staff: false, can_edit: false, can_report: false };

/** Where it stands - only the person who added it and staff get these fields. */
function StatusNote({ item, t }: { item: WhPlace | WhDay; t: WhT }) {
  const notes: string[] = [];
  if (item.status === 'pending') notes.push(t('st_pending'));
  else if (item.status === 'rejected') notes.push(t('st_rejected', { r: item.review_note || '-' }));
  else if (item.status === 'hidden') notes.push(item.hidden_by === 'staff' ? t('st_hidden_staff', { r: item.review_note || '-' }) : t('st_hidden_owner'));
  if (item.status === 'live' && item.needs_review) notes.push(t('st_review'));
  if (item.phone_saved && !item.phone && item.status === 'live') notes.push(t('st_phone'));
  if (notes.length === 0) return null;
  return (
    <div className="space-y-1 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900" data-status={item.status}>
      {notes.map((n) => <p key={n}>{n}</p>)}
    </div>
  );
}

function ReportBox({ kind, id, me, t, lang, onSignIn }: {
  kind: 'place' | 'day'; id: string; me: WhMe; t: WhT; lang: WhLang; onSignIn: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<WhReportReason | ''>('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  if (me.is_mine) return null;
  if (!me.signed_in) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-3 text-sm text-gray-600">
        <span>{t('reportSignIn')}</span>
        <button type="button" onClick={onSignIn} className="rounded-xl bg-gray-900 px-3 py-1.5 text-xs font-bold text-white">{t('signIn')}</button>
      </div>
    );
  }
  if (!me.can_report) return null;
  if (msg) return <p className="rounded-2xl bg-green-50 p-3 text-sm font-semibold text-green-800" data-report-done="1">{msg}</p>;
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-600 hover:text-red-700">
        <Flag className="h-4 w-4" />{t('report')}
      </button>
    );
  }
  const send = async () => {
    if (!reason) return;
    setBusy(true);
    const r = await report(kind, id, reason, note);
    setBusy(false);
    if (r.ok) setMsg(r.already ? t('reportAlready') : t('reportOk'));
    else setMsg(whReason(lang, r.reason));
  };
  return (
    <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4" data-report-form="1">
      <p className="font-bold text-gray-900">{t('reportQ')}</p>
      <div className="space-y-2">
        {WH_REPORT_REASONS.map((r) => (
          <label key={r} className="flex items-center gap-2 text-sm text-gray-800">
            <input type="radio" name={'wh-report-' + id} value={r} checked={reason === r} onChange={() => setReason(r)} />
            {reportLabel(lang, r)}
          </label>
        ))}
      </div>
      <textarea value={note} onChange={(e) => setNote(e.target.value.slice(0, 300))} placeholder={t('reportPh')} rows={2}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" />
      <div className="flex gap-2">
        <button type="button" onClick={() => void send()} disabled={!reason || busy}
                className="inline-flex items-center gap-1 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}{t('sendReport')}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-xl px-4 py-2 text-sm font-bold text-gray-600">{t('cancel')}</button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-1.5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <h2 className="text-xs font-extrabold uppercase tracking-wide text-gray-500">{title}</h2>
      {children}
    </section>
  );
}

function CallButton({ phone, t }: { phone: string; t: WhT }) {
  return (
    <div className="space-y-1">
      <a href={telHref(phone)} data-call={phone}
         className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-base font-extrabold text-white shadow hover:bg-rose-700">
        <Phone className="h-5 w-5" />{t('call')} {fmtPhone(phone)}
      </a>
      <p className="flex items-center justify-center gap-1 text-[11px] font-semibold text-gray-500"><ShieldCheck className="h-3.5 w-3.5" />{t('phoneChecked')}</p>
    </div>
  );
}

function PlaceView({ p, me, lang, t, offline }: { p: WhPlace; me: WhMe; lang: WhLang; t: WhT; offline: boolean }) {
  const navigate = useNavigate();
  const st = placeOpenState(p);
  const later = st === 'closed' ? opensLaterToday(p) : null;
  const today = doualaNow().ymd;
  return (
    <div className="space-y-3" data-place-view={p.id}>
      <StatusNote item={p} t={t} />
      <header className="space-y-1">
        <h1 className="text-2xl font-extrabold leading-tight text-gray-900">{p.name}</h1>
        <p className="text-sm text-gray-600">{kindLabel(lang, p.kind)} {'\u00b7'} {p.town}{p.area ? ', ' + p.area : ''} {'\u00b7'} {regionLabel(lang, p.region)}</p>
        <div className="flex flex-wrap gap-2 pt-1">
          {p.accepts_csu && <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-800"><ShieldCheck className="h-3.5 w-3.5" />{t('csuBadge')}</span>}
          {p.women_doctors && <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-800">{t('womenBadge')}</span>}
        </div>
      </header>

      {p.phone ? <CallButton phone={p.phone} t={t} /> : p.phone_checking ? <p className="rounded-2xl bg-gray-50 p-3 text-center text-sm font-semibold text-gray-600">{t('phoneChecking')}</p> : null}

      <Section title={t('svcTitle')}>
        <div className="flex flex-wrap gap-1.5">
          {p.services.map((s) => <span key={s} className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-800">{serviceLabel(lang, s)}</span>)}
        </div>
      </Section>

      <Section title={t('hoursTitle')}>
        {p.open_24h ? (
          <p className="inline-flex items-center gap-1.5 text-sm font-bold text-green-700"><Clock className="h-4 w-4" />{t('open24')}</p>
        ) : p.opens_at && p.closes_at ? (
          <>
            <p className="text-sm text-gray-800">{daysText(lang, p.open_days)} {'\u00b7'} {p.opens_at} - {p.closes_at}</p>
            <p className={'text-xs font-bold ' + (st === 'open' ? 'text-green-700' : 'text-gray-500')}>
              {st === 'open' ? t('openNow') : later ? t('opensAt', { t: later }) : t('closedNow')}
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-800">{daysText(lang, p.open_days)}</p>
        )}
      </Section>

      {p.landmark && (
        <Section title={t('whereTitle')}>
          <p className="flex items-start gap-1.5 text-sm text-gray-800"><MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />{p.landmark}</p>
        </Section>
      )}
      {p.price_note && <Section title={t('pricesTitle')}><p className="text-sm text-gray-800">{p.price_note}</p></Section>}
      {p.description && <Section title={t('aboutTitle')}><p className="whitespace-pre-line text-sm text-gray-800">{p.description}</p></Section>}

      {(p.days || []).length > 0 && (
        <Section title={t('daysHere')}>
          <ul className="divide-y divide-gray-100">
            {(p.days || []).map((d) => {
              const w = dayWhen(d.starts_on, d.ends_on, today);
              return (
                <li key={d.id}>
                  <button type="button" onClick={() => navigate('/womens-health/day/' + d.id)} className="flex w-full items-center gap-2 py-2 text-start" data-day-link={d.id}>
                    <CalendarDays className="h-4 w-4 flex-shrink-0 text-rose-600" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-gray-900">{d.title}</span>
                      <span className="block text-xs text-gray-500">
                        {w === 'today' ? t('today') + ' \u00b7 ' : w === 'tomorrow' ? t('tomorrow') + ' \u00b7 ' : w === 'on' ? t('onNow') + ' \u00b7 ' : ''}
                        {dayRange(lang, d.starts_on, d.ends_on)}
                      </span>
                    </span>
                    <ChevronRight className="h-4 w-4 text-gray-400 rtl:rotate-180" />
                  </button>
                </li>
              );
            })}
          </ul>
        </Section>
      )}

      <div className="flex flex-wrap gap-2">
        {me.can_edit && (
          <button type="button" onClick={() => navigate('/womens-health/edit-place/' + p.id)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-800">
            <Pencil className="h-4 w-4" />{t('edit')}
          </button>
        )}
        {me.signed_in && !offline && p.status === 'live' && (
          <button type="button" onClick={() => navigate('/womens-health/new-day?place=' + p.id)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm font-bold text-rose-700">
            <Plus className="h-4 w-4" />{t('announceHere')}
          </button>
        )}
      </div>
      {!offline && <ReportBox kind="place" id={p.id} me={me} t={t} lang={lang} onSignIn={() => navigate('/login')} />}
    </div>
  );
}

function DayView({ d, me, lang, t, offline, onReminded }: { d: WhDay; me: WhMe; lang: WhLang; t: WhT; offline: boolean; onReminded: (on: boolean) => void }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const w = dayWhen(d.starts_on, d.ends_on);
  const ended = d.ended === true || w === 'ended';
  const toggle = async () => {
    if (!me.signed_in) { navigate('/login'); return; }
    setBusy(true);
    const r = await remind(d.id, !me.reminded);
    setBusy(false);
    if (r.ok) { onReminded(r.reminded); setMsg(r.reminded ? t('remindOk') : t('remindOffOk')); }
    else setMsg(r.reason === 'not_signed_in' ? t('remindSignIn') : whReason(lang, r.reason));
  };
  return (
    <div className="space-y-3" data-day-view={d.id}>
      <StatusNote item={d} t={t} />
      {ended && <p className="rounded-2xl bg-gray-100 p-3 text-sm font-bold text-gray-700" data-ended="1">{t('ended')}</p>}
      <header className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          {!ended && w === 'today' && <span className="rounded-full bg-rose-600 px-2 py-0.5 text-xs font-extrabold text-white">{t('today')}</span>}
          {!ended && w === 'tomorrow' && <span className="rounded-full bg-amber-400 px-2 py-0.5 text-xs font-extrabold text-amber-950">{t('tomorrow')}</span>}
          {!ended && w === 'on' && <span className="rounded-full bg-green-600 px-2 py-0.5 text-xs font-extrabold text-white">{t('onNow')}</span>}
        </div>
        <h1 className="text-2xl font-extrabold leading-tight text-gray-900">{d.title}</h1>
        <p className="inline-flex flex-wrap items-center gap-1 text-sm font-bold text-gray-800">
          <CalendarDays className="h-4 w-4 text-rose-600" />
          {d.starts_on === d.ends_on ? fmtLongDay(d.starts_on, lang) : dayRange(lang, d.starts_on, d.ends_on)}
          {d.opens_at && d.closes_at ? ' \u00b7 ' + d.opens_at + ' - ' + d.closes_at : ''}
        </p>
        {d.organiser && <p className="text-sm text-gray-600">{t('byOrg', { o: d.organiser })}</p>}
      </header>

      {!ended && !offline && (
        <div className="space-y-1">
          <button type="button" onClick={() => void toggle()} disabled={busy} aria-pressed={!!me.reminded} data-remind="1"
                  className={'flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-base font-extrabold shadow transition disabled:opacity-60 ' +
                    (me.reminded ? 'bg-green-100 text-green-800' : 'bg-rose-600 text-white hover:bg-rose-700')}>
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : me.reminded ? <BellOff className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
            {me.reminded ? t('reminded') : me.signed_in ? t('remind') : t('remindSignIn')}
          </button>
          <p className="text-center text-[11px] font-semibold text-gray-500">{msg || t('remindHelp')}</p>
        </div>
      )}

      <Section title={t('whereTitle')}>
        <p className="flex items-start gap-1.5 text-sm font-bold text-gray-900"><MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />{d.venue}, {d.town} {'\u00b7'} {regionLabel(lang, d.region)}</p>
        {d.landmark && <p className="text-sm text-gray-700">{d.landmark}</p>}
        {d.place_id && d.place_name && (
          <button type="button" onClick={() => navigate('/womens-health/place/' + d.place_id)} className="inline-flex items-center gap-1 text-sm font-bold text-rose-700 hover:underline" data-place-link={d.place_id}>
            {t('atPlace', { p: d.place_name })}<ChevronRight className="h-4 w-4 rtl:rotate-180" />
          </button>
        )}
      </Section>

      <Section title={t('fTopics')}>
        <div className="flex flex-wrap gap-1.5">
          {d.topics.map((x) => <span key={x} className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-800">{topicLabel(lang, x)}</span>)}
        </div>
        {d.free_what && <p className="pt-1 text-sm font-semibold text-green-800">{t('freeWhat', { x: d.free_what })}</p>}
        {d.paid_after && <p className="text-sm text-gray-700">{t('paidAfter', { x: d.paid_after })}</p>}
      </Section>

      {d.phone ? <CallButton phone={d.phone} t={t} /> : null}

      <div className="flex flex-wrap gap-2">
        {me.can_edit && !ended && (
          <button type="button" onClick={() => navigate('/womens-health/edit-day/' + d.id)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-800">
            <Pencil className="h-4 w-4" />{t('edit')}
          </button>
        )}
      </div>
      {!ended && !offline && <ReportBox kind="day" id={d.id} me={me} t={t} lang={lang} onSignIn={() => navigate('/login')} />}
    </div>
  );
}

export default function WomensHealthDetail() {
  const { lang, dir, t } = useWhText();
  const { id = '' } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const account = useFreeAccount();
  const isDay = location.pathname.indexOf('/womens-health/day/') === 0;
  const [place, setPlace] = useState<WhPlace | null>(null);
  const [day, setDay] = useState<WhDay | null>(null);
  const [me, setMe] = useState<WhMe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [needAccount, setNeedAccount] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null); setNeedAccount(false); setSavedAt(null);
    const kind: 'place' | 'day' = isDay ? 'day' : 'place';
    const r = isDay ? await getDay(id) : await getPlace(id);
    if (r.ok) {
      if ('day' in r) { setDay(r.day); saveItem('day', r.day); } else { setPlace(r.place); saveItem('place', r.place); }
      setMe(r.me);
    } else if (r.reason === 'not_signed_in') {
      setNeedAccount(true);
    } else if (r.reason === 'network') {
      const saved = loadItem<WhPlace | WhDay>(kind, id);
      if (saved) {
        if (isDay) setDay(saved.v as WhDay); else setPlace(saved.v as WhPlace);
        setMe(OFFLINE_ME);
        setSavedAt(saved.at);
      } else {
        setError(t('offlineNone'));
      }
    } else if (r.reason === 'not_found') {
      setError(isDay ? t('notFoundDay') : t('notFoundPlace'));
    } else {
      setError(whReason(lang, r.reason));
    }
    setLoading(false);
  }, [id, isDay, lang]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (account === 'in') void load();
  }, [load, account]);

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate(isDay ? '/womens-health/screening' : '/womens-health');
  };

  return (
    <div dir={dir} data-fix="FIX721" data-account-state={account} className="mx-auto max-w-2xl space-y-3 px-4 py-4 pb-28">
      <button type="button" onClick={goBack} className="inline-flex items-center gap-1 rounded-xl px-2 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100">
        <ChevronLeft className="h-4 w-4 rtl:rotate-180" />{t('back')}
      </button>
      {account === 'checking' ? (
        <FreeAccountChecking />
      ) : account === 'out' || needAccount ? (
        <FreeAccountCard body={t('acctBody')} note={t('acctOpen')} />
      ) : loading ? (
        <div className="flex justify-center py-12 text-gray-400"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : error ? (
        <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-6 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-amber-500" />
          <p className="font-bold text-gray-800">{error}</p>
          <button type="button" onClick={() => navigate(isDay ? '/womens-health/screening' : '/womens-health')}
                  className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white">{t('title')}</button>
        </div>
      ) : (
        <>
          {savedAt && <OfflineNote text={t('offlinePlace', { date: fmtSavedAt(savedAt, lang) })} />}
          {isDay && day && me ? (
            <DayView d={day} me={me} lang={lang} t={t} offline={!!savedAt} onReminded={(on) => setMe({ ...me, reminded: on })} />
          ) : place && me ? (
            <PlaceView p={place} me={me} lang={lang} t={t} offline={!!savedAt} />
          ) : null}
        </>
      )}
      <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold text-red-800">{t('emergency')}</p>
      <QuickExit t={t} />
    </div>
  );
}
// BAMBEH_END_TOKEN__WOMENS_HEALTH_DETAIL_FIX721__COMPLETE
