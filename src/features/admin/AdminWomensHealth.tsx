// BAMBEH_DEPLOY_TOKEN__ADMIN_WOMENS_HEALTH_FIX724_CLEAN
/**
 * AdminWomensHealth.tsx - FIX724 (replaces FIX712, which was never deployed) - Command Center > Women's health
 *
 * Every place (maternity, health centre, clinic, midwife, listening centre) and every free
 * screening day is checked by Bambeh staff before women can see it (FIX715):
 *   Waiting  - new ones. CALL THE NUMBER first, then Approve (the number shows at once), or
 *              Reject with a reason.
 *   Changed  - live ones the person changed, a new number nobody called yet, or a report from
 *              a woman ("the number does not work", "closed", "wrong information"). Call, then
 *              "Checked - looks right", or Hide with a reason.
 *   Live     - Hide with a reason (closed for good, a complaint).
 *   Closed   - not approved, hidden, or ended screening days. Approve puts it back - except
 *              what the person who added it took down herself.
 * Moderators, admins and the super admin approve; every decision keeps the staff member's
 * name and the time, and the person who added it gets a notification.
 *
 * TWO SWITCHES, both OFF until a health worker has checked the text (the review document
 * FIX726 holds the guide AND the quizzes, with a signature line for each):
 *   - the PREGNANCY GUIDE (a midwife or doctor),
 *   - the HEALTH QUIZZES - contraception, preventing infections, consent (FIX724, new).
 * Only an admin or the super admin switches them on, with the reviewer's name, role, the date of
 * the check and the languages that were checked - a language nobody checked is never shown to
 * women. The quiz panel also shows how many quizzes were finished in the last 30 days, per topic
 * (the database never knows who). English, like the rest of the Command Center.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useCallback, useEffect, useState } from 'react';
import { Baby, Check, EyeOff, GraduationCap, Loader2, Phone, RefreshCw, ShieldCheck, X } from 'lucide-react';
import { adminGuide, adminQueue, adminQuiz, adminReview } from '@/features/womenshealth/whApi';
import type { WhQueue, WhQueueView, WhStaffDay, WhStaffPlace } from '@/features/womenshealth/whApi';
import {
  LANG_NAMES, QUIZ_TOPICS, WH_LANGS, dayRange, daysText, doualaNow, fmtPhone, kindLabel, regionLabel, reportLabel, serviceLabel, telHref,
  topicLabel, wt,
} from '@/features/womenshealth/whText';
import type { QuizTopic, WhKey, WhLang } from '@/features/womenshealth/whText';

type Kind = 'place' | 'day';

const VIEWS: Array<{ key: WhQueueView; label: string }> = [
  { key: 'pending', label: 'Waiting' },
  { key: 'changed', label: 'Changed / reported' },
  { key: 'live', label: 'Live' },
  { key: 'closed', label: 'Closed' },
];

const REASONS: Record<string, string> = {
  not_staff: 'Staff only.',
  admins_only: 'Only an admin or the super admin can switch the guide or the quizzes.',
  reason_required: 'Write a reason (3 letters or more) - the person who added it will read it.',
  too_long: 'The reason is too long (300 letters at most).',
  owner_hidden: 'The person who added it took it down. Only they can put it back.',
  not_found: 'Not found - it may have been deleted.',
  reviewer_required: 'Write the reviewer\'s full name (3-80 letters) and role (3-120 letters).',
  bad_date: 'The date of the check must be today or earlier.',
  langs_required: 'Tick the languages the reviewer actually checked.',
  phone_in_text: 'No phone numbers in the reviewer\'s name or role.',
  network: 'No connection. Try again.',
  not_installed: 'The FIX715 SQL has not been run in Supabase yet.',
  not_signed_in: 'Your session has ended - sign in again.',
};

function reasonOf(r: string): string {
  return REASONS[r] || 'Something went wrong (' + r + ').';
}

function when(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return new Date(d.getTime() + 3600 * 1000).toISOString().slice(0, 16).replace('T', ' ');
}

const EN: WhLang = 'en';

function Phone2Call({ row }: { row: WhStaffPlace | WhStaffDay }) {
  if (!row.phone_saved) return <p className="text-xs text-gray-500">No number given.</p>;
  const checked = !!row.phone_checked_at;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <a href={telHref(row.phone_saved)} className="inline-flex items-center gap-1 rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs font-bold text-white" data-staff-call={row.phone_saved}>
        <Phone className="h-3.5 w-3.5" />Call {fmtPhone(row.phone_saved)}
      </a>
      {checked
        ? <span className="text-xs font-semibold text-green-700">Checked {when(row.phone_checked_at)}{row.phone_checked_by_name ? ' by ' + row.phone_checked_by_name : ''}</span>
        : <span className="text-xs font-bold text-amber-700">Not checked yet - hidden from women</span>}
    </div>
  );
}

function Row({ kind, row, view, busy, onAct }: {
  kind: Kind; row: WhStaffPlace | WhStaffDay; view: WhQueueView; busy: boolean;
  onAct: (action: 'approve' | 'reject' | 'hide' | 'checked') => void;
}) {
  const isPlace = kind === 'place';
  const p = row as WhStaffPlace;
  const d = row as WhStaffDay;
  const ownerHidden = row.status === 'hidden' && row.hidden_by === 'owner';
  return (
    <article className="space-y-2 rounded-xl border border-gray-200 bg-white p-4" data-admin-row={row.id}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-bold text-gray-900">{isPlace ? p.name : d.title}</h3>
          <p className="text-xs text-gray-500">
            {isPlace ? kindLabel(EN, p.kind) + ' \u00b7 ' : dayRange(EN, d.starts_on, d.ends_on) + (d.opens_at ? ' ' + d.opens_at + '-' + d.closes_at : '') + ' \u00b7 '}
            {isPlace ? '' : d.venue + ', '}{row.town}{isPlace && p.area ? ', ' + p.area : ''} {'\u00b7'} {regionLabel(EN, row.region)}
          </p>
        </div>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-700">
          {row.status}{row.needs_review ? ' \u00b7 needs a look' : ''}{!isPlace && d.ended ? ' \u00b7 ended' : ''}
        </span>
      </div>
      <div className="flex flex-wrap gap-1">
        {isPlace
          ? p.services.map((s) => <span key={s} className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-800">{serviceLabel(EN, s)}</span>)
          : d.topics.map((x) => <span key={x} className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-800">{topicLabel(EN, x)}</span>)}
      </div>
      {isPlace ? (
        <div className="space-y-0.5 text-xs text-gray-700">
          <p>{p.open_24h ? 'Open 24 hours' : daysText(EN, p.open_days) + (p.opens_at ? ' \u00b7 ' + p.opens_at + '-' + p.closes_at : ' \u00b7 no hours given')}
            {p.accepts_csu ? ' \u00b7 takes the cheque sante' : ''}{p.women_doctors ? ' \u00b7 women doctors' : ''}</p>
          {p.landmark && <p>Landmark: {p.landmark}</p>}
          {p.price_note && <p>Prices: {p.price_note}</p>}
          {p.description && <p className="whitespace-pre-line">About: {p.description}</p>}
        </div>
      ) : (
        <div className="space-y-0.5 text-xs text-gray-700">
          {d.organiser && <p>Organiser: {d.organiser}</p>}
          {d.place_name && <p>At the listed place: {d.place_name}</p>}
          {d.landmark && <p>Landmark: {d.landmark}</p>}
          {d.free_what && <p>Free: {d.free_what}</p>}
          {d.paid_after && <p>Paid after: {d.paid_after}</p>}
          <p>{d.reminders} reminder(s) asked</p>
        </div>
      )}
      <Phone2Call row={row} />
      <p className="text-[11px] text-gray-500">
        Added by {row.added_by_name}{isPlace ? ' (' + (p.added_as === 'facility' ? 'works there' : p.added_as === 'agent' ? 'field agent' : 'user') + ')' : ''} {'\u00b7'} {when(row.created_at)}
        {row.reviewed_by_name ? ' \u00b7 last decision: ' + row.reviewed_by_name + ' ' + when(row.reviewed_at) : ''}
      </p>
      {row.review_note && <p className="text-xs text-gray-600">Note: {row.review_note}</p>}
      {row.open_reports.length > 0 && (
        <div className="space-y-1 rounded-lg bg-red-50 p-2 text-xs text-red-900" data-reports={row.open_reports.length}>
          <p className="font-bold">{row.open_reports.length} open report(s)</p>
          {row.open_reports.map((r, i) => <p key={i}>{reportLabel(EN, r.reason)}{r.note ? ': "' + r.note + '"' : ''} - {r.by}, {when(r.at)}</p>)}
        </div>
      )}
      {row.history.length > 0 && (
        <details className="text-[11px] text-gray-500">
          <summary className="cursor-pointer font-semibold">History</summary>
          {row.history.map((h, i) => <p key={i}>{when(h.at)} {h.by}: {h.action}{h.note ? ' - ' + h.note : ''}</p>)}
        </details>
      )}
      <div className="flex flex-wrap gap-2 pt-1">
        {(view === 'pending' || (view === 'closed' && !ownerHidden && !(kind === 'day' && d.ended))) && (
          <button type="button" disabled={busy} onClick={() => onAct('approve')} className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50">
            <Check className="h-3.5 w-3.5" />Approve
          </button>
        )}
        {view === 'changed' && (
          <button type="button" disabled={busy} onClick={() => onAct('checked')} className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50">
            <ShieldCheck className="h-3.5 w-3.5" />Checked - looks right
          </button>
        )}
        {view === 'pending' && (
          <button type="button" disabled={busy} onClick={() => onAct('reject')} className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50">
            <X className="h-3.5 w-3.5" />Reject
          </button>
        )}
        {(view === 'changed' || view === 'live') && (
          <button type="button" disabled={busy} onClick={() => onAct('hide')} className="inline-flex items-center gap-1 rounded-lg border border-red-300 px-3 py-1.5 text-xs font-bold text-red-700 disabled:opacity-50">
            <EyeOff className="h-3.5 w-3.5" />Hide
          </button>
        )}
        {view === 'closed' && ownerHidden && <span className="text-xs text-gray-500">Taken down by the person who added it.</span>}
        {busy && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
      </div>
    </article>
  );
}

function GuidePanel({ q, onDone }: { q: WhQueue; onDone: () => void }) {
  const g = q.guide;
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [date, setDate] = useState(doualaNow().ymd);
  const [langs, setLangs] = useState<WhLang[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const on = !!g && g.on;

  const switchOn = async () => {
    if (langs.length === 0) { setMsg(reasonOf('langs_required')); return; }
    if (!window.confirm('Switch the pregnancy guide ON in ' + langs.map((l) => LANG_NAMES[l]).join(', ') + '?\n\n' +
        'Women will see it at once, with "Checked by ' + name.trim() + ' (' + role.trim() + ')". Do this only after this person ' +
        'has read and approved the text in these languages (the FIX726 review document). Your name and the time are recorded.')) return;
    setBusy(true); setMsg(null);
    const r = await adminGuide(true, { name: name.trim(), role: role.trim(), date, langs });
    setBusy(false);
    if (!r.ok) { setMsg(reasonOf(r.reason)); return; }
    onDone();
  };
  const switchOff = async () => {
    if (!window.confirm('Switch the pregnancy guide OFF for everyone? Your name and the time are recorded.')) return;
    setBusy(true); setMsg(null);
    const r = await adminGuide(false);
    setBusy(false);
    if (!r.ok) { setMsg(reasonOf(r.reason)); return; }
    onDone();
  };

  return (
    <section className="space-y-3 rounded-xl border border-rose-200 bg-rose-50 p-4" data-guide-panel={on ? 'on' : 'off'}>
      <div className="flex items-center gap-2">
        <Baby className="h-5 w-5 text-rose-700" />
        <h2 className="font-bold text-gray-900">Pregnancy guide: {on ? 'ON' : 'OFF'}</h2>
      </div>
      {on && g ? (
        <p className="text-sm text-gray-800">
          Shown in {g.langs.map((l) => LANG_NAMES[l]).join(', ')}. Checked by {g.reviewer_name} ({g.reviewer_role}) on {g.reviewed_on}.
          Switched on by {g.switched_by_name || '?'} {when(g.switched_at)}.
        </p>
      ) : (
        <p className="text-sm text-gray-800">
          Women cannot see the guide. It opens only after a midwife or doctor has checked the text (send them the FIX726 review document),
          and only in the languages they checked.{g && g.switched_at ? ' Last switched off by ' + (g.switched_by_name || '?') + ' ' + when(g.switched_at) + '.' : ''}
        </p>
      )}
      {!q.can_switch_guide ? (
        <p className="text-xs font-semibold text-gray-600">Only an admin or the super admin can switch the guide.</p>
      ) : on ? (
        <button type="button" disabled={busy} onClick={() => void switchOff()} className="rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-bold text-red-700 disabled:opacity-50">
          Switch the guide off
        </button>
      ) : (
        <div className="space-y-2">
          <div className="grid gap-2 sm:grid-cols-3">
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="Reviewer's full name" className="rounded-lg border border-gray-200 px-3 py-2 text-sm" data-g="name" />
            <input value={role} onChange={(e) => setRole(e.target.value)} maxLength={120} placeholder="Role and workplace (e.g. Midwife, Bamenda Regional Hospital)" className="rounded-lg border border-gray-200 px-3 py-2 text-sm" data-g="role" />
            <input type="date" value={date} max={doualaNow().ymd} onChange={(e) => setDate(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm" data-g="date" />
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-gray-800">
            <span className="font-semibold">Languages checked:</span>
            {WH_LANGS.map((l) => (
              <label key={l} className="inline-flex items-center gap-1">
                <input type="checkbox" checked={langs.indexOf(l) >= 0} data-g-lang={l}
                       onChange={() => setLangs(langs.indexOf(l) >= 0 ? langs.filter((x) => x !== l) : langs.concat([l]))} />
                {LANG_NAMES[l]}
              </label>
            ))}
          </div>
          <button type="button" disabled={busy} onClick={() => void switchOn()} className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-50">
            Switch the guide on
          </button>
        </div>
      )}
      {msg && <p className="text-sm font-semibold text-red-700" data-guide-msg="1">{msg}</p>}
    </section>
  );
}

function QuizPanel({ q, onDone }: { q: WhQueue; onDone: () => void }) {
  const g = q.guide;
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [date, setDate] = useState(doualaNow().ymd);
  const [langs, setLangs] = useState<WhLang[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const on = !!g && g.quiz_on;
  const counts: Record<QuizTopic, { done: number; perfect: number }> = {
    contraception: { done: 0, perfect: 0 }, sti: { done: 0, perfect: 0 }, consent: { done: 0, perfect: 0 },
  };
  for (const c of q.quiz_30_days) if (counts[c.topic]) counts[c.topic] = { done: c.done, perfect: c.perfect };
  const total = QUIZ_TOPICS.reduce((n, tp) => n + counts[tp].done, 0);

  const switchOn = async () => {
    if (langs.length === 0) { setMsg(reasonOf('langs_required')); return; }
    if (!window.confirm('Switch the health quizzes ON in ' + langs.map((l) => LANG_NAMES[l]).join(', ') + '?\n\n' +
        'Women will see them at once, with "Checked by ' + name.trim() + ' (' + role.trim() + ')". Do this only after this health worker ' +
        'has read and approved every question and answer in these languages (the FIX726 review document). Your name and the time are recorded.')) return;
    setBusy(true); setMsg(null);
    const r = await adminQuiz(true, { name: name.trim(), role: role.trim(), date, langs });
    setBusy(false);
    if (!r.ok) { setMsg(reasonOf(r.reason)); return; }
    onDone();
  };
  const switchOff = async () => {
    if (!window.confirm('Switch the health quizzes OFF for everyone? Your name and the time are recorded.')) return;
    setBusy(true); setMsg(null);
    const r = await adminQuiz(false);
    setBusy(false);
    if (!r.ok) { setMsg(reasonOf(r.reason)); return; }
    onDone();
  };

  return (
    <section className="space-y-3 rounded-xl border border-purple-200 bg-purple-50 p-4" data-quiz-panel={on ? 'on' : 'off'}>
      <div className="flex items-center gap-2">
        <GraduationCap className="h-5 w-5 text-purple-700" />
        <h2 className="font-bold text-gray-900">Health quizzes: {on ? 'ON' : 'OFF'}</h2>
      </div>
      {on && g ? (
        <p className="text-sm text-gray-800">
          Shown in {g.quiz_langs.map((l) => LANG_NAMES[l]).join(', ')}. Checked by {g.quiz_reviewer_name} ({g.quiz_reviewer_role}) on {g.quiz_reviewed_on}.
          Switched on by {g.quiz_switched_by_name || '?'} {when(g.quiz_switched_at)}.
        </p>
      ) : (
        <p className="text-sm text-gray-800">
          Women cannot play the quizzes (contraception, preventing infections, consent). They open only after a health worker - a midwife,
          a doctor or a family planning nurse - has checked every question and answer (the FIX726 review document), and only in the
          languages they checked.{g && g.quiz_switched_at ? ' Last switched off by ' + (g.quiz_switched_by_name || '?') + ' ' + when(g.quiz_switched_at) + '.' : ''}
        </p>
      )}
      <div className="grid gap-2 sm:grid-cols-3" data-quiz-counts={total}>
        {QUIZ_TOPICS.map((tp) => (
          <div key={tp} className="rounded-lg bg-white px-3 py-2 text-sm" data-quiz-count={tp}>
            <p className="font-semibold text-gray-900">{wt('en', ('qz_' + tp) as WhKey)}</p>
            <p className="text-xs text-gray-600">{counts[tp].done} finished in 30 days, {counts[tp].perfect} with every answer right</p>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-gray-500">Counted per day, topic and language only - Bambeh never knows who played or what they answered.</p>
      {!q.can_switch_guide ? (
        <p className="text-xs font-semibold text-gray-600">Only an admin or the super admin can switch the quizzes.</p>
      ) : on ? (
        <button type="button" disabled={busy} onClick={() => void switchOff()} className="rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-bold text-red-700 disabled:opacity-50">
          Switch the quizzes off
        </button>
      ) : (
        <div className="space-y-2">
          <div className="grid gap-2 sm:grid-cols-3">
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="Health worker's full name" className="rounded-lg border border-gray-200 px-3 py-2 text-sm" data-qz="name" />
            <input value={role} onChange={(e) => setRole(e.target.value)} maxLength={120} placeholder="Role and workplace (e.g. Family planning nurse, Buea Regional Hospital)" className="rounded-lg border border-gray-200 px-3 py-2 text-sm" data-qz="role" />
            <input type="date" value={date} max={doualaNow().ymd} onChange={(e) => setDate(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm" data-qz="date" />
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-gray-800">
            <span className="font-semibold">Languages checked:</span>
            {WH_LANGS.map((l) => (
              <label key={l} className="inline-flex items-center gap-1">
                <input type="checkbox" checked={langs.indexOf(l) >= 0} data-qz-lang={l}
                       onChange={() => setLangs(langs.indexOf(l) >= 0 ? langs.filter((x) => x !== l) : langs.concat([l]))} />
                {LANG_NAMES[l]}
              </label>
            ))}
          </div>
          <button type="button" disabled={busy} onClick={() => void switchOn()} className="rounded-lg bg-purple-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-50">
            Switch the quizzes on
          </button>
        </div>
      )}
      {msg && <p className="text-sm font-semibold text-red-700" data-quiz-msg="1">{msg}</p>}
    </section>
  );
}

export default function AdminWomensHealth({ embedded = false }: { embedded?: boolean }) {
  const [kind, setKind] = useState<Kind>('place');
  const [view, setView] = useState<WhQueueView>('pending');
  const [q, setQ] = useState<WhQueue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await adminQueue(kind, view);
    if (r.ok) { setQ(r); setError(null); } else setError(reasonOf(r.reason));
    setLoading(false);
  }, [kind, view]);

  useEffect(() => { void load(); }, [load]);

  const act = async (row: WhStaffPlace | WhStaffDay, action: 'approve' | 'reject' | 'hide' | 'checked') => {
    const label = kind === 'place' ? (row as WhStaffPlace).name : (row as WhStaffDay).title;
    let reason: string | null = null;
    if (action === 'reject' || action === 'hide') {
      reason = window.prompt((action === 'reject' ? 'Why is "' + label + '" not approved?' : 'Why hide "' + label + '"?') +
        '\nThe person who added it reads this.');
      if (reason === null) return;
    } else {
      const phone = row.phone_saved && !(action === 'checked' && row.phone_checked_at) ? row.phone_saved : null;
      const ask = action === 'approve'
        ? 'Approve "' + label + '"? Women see it at once' + (phone ? ', with the number ' + fmtPhone(phone) + '.\n\nDid you CALL ' + fmtPhone(phone) +
          ' and confirm the place exists and offers these services?' : '.') + '\nYour name and the time are recorded.'
        : 'Mark "' + label + '" as checked?' + (phone ? '\n\nDid you CALL ' + fmtPhone(phone) + '? The number shows to women at once.' : '') +
          (row.open_reports.length ? '\nThe ' + row.open_reports.length + ' open report(s) will be marked handled.' : '') + '\nYour name and the time are recorded.';
      if (!window.confirm(ask)) return;
    }
    setBusy(row.id); setNote(null);
    const r = await adminReview(kind, row.id, action, reason);
    setBusy(null);
    if (!r.ok) { setNote(reasonOf(r.reason)); return; }
    setNote('"' + label + '": ' + action + ' by ' + r.reviewed_by_name + ' at ' + when(r.reviewed_at) + '.');
    await load();
  };

  const counts = q ? q.counts[kind] : null;
  return (
    <div data-fix="FIX724" className={embedded ? 'space-y-4' : 'mx-auto max-w-5xl space-y-4 p-4'}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold text-gray-900">Women&apos;s health</h1>
        <button type="button" onClick={() => void load()} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-700">
          <RefreshCw className="h-4 w-4" />Refresh
        </button>
      </div>
      {q && <GuidePanel q={q} onDone={() => void load()} />}
      {q && <QuizPanel q={q} onDone={() => void load()} />}
      <div className="flex flex-wrap gap-2">
        {(['place', 'day'] as Kind[]).map((k) => (
          <button key={k} type="button" onClick={() => setKind(k)} aria-pressed={kind === k}
                  className={'rounded-lg px-3 py-1.5 text-sm font-bold ' + (kind === k ? 'bg-gray-900 text-white' : 'border border-gray-200 text-gray-700')}>
            {k === 'place' ? 'Places' : 'Screening days'}
            {q ? ' (' + (q.counts[k].pending + q.counts[k].changed) + ' to check)' : ''}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {VIEWS.map((v) => (
          <button key={v.key} type="button" onClick={() => setView(v.key)} aria-pressed={view === v.key} data-view={v.key}
                  className={'rounded-full px-3 py-1 text-xs font-bold ' + (view === v.key ? 'bg-rose-600 text-white' : 'border border-gray-200 text-gray-700')}>
            {v.label}{counts ? ' ' + counts[v.key] : ''}
          </button>
        ))}
      </div>
      {note && <p className="rounded-lg bg-gray-900 px-3 py-2 text-sm text-white" data-note="1">{note}</p>}
      {loading ? (
        <div className="flex justify-center py-8 text-gray-400"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : error ? (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>
      ) : q && q.rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">Nothing here.</p>
      ) : q ? (
        <div className="space-y-3">
          {q.rows.map((row) => <Row key={row.id} kind={kind} row={row} view={view} busy={busy === row.id} onAct={(a) => void act(row, a)} />)}
        </div>
      ) : null}
    </div>
  );
}
// BAMBEH_END_TOKEN__ADMIN_WOMENS_HEALTH_FIX724__COMPLETE
