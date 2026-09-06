// BAMBEH_DEPLOY_TOKEN__PHARMACIESSECTION_FIX497_CLEAN
/**
 * src/features/admin/PharmaciesSection.tsx — Bambeh Admin Command Center
 *
 * FIX482 — ENTER THE ROTA WITHOUT WRITING SQL.
 * ────────────────────────────────────────────
 * FIX479 built the tables, FIX480 the public page. This is where you and your
 * moderators actually put the pharmacies in and say who is on call.
 *
 * COVERAGE IS THE HEADLINE, NOT THE PHARMACY COUNT
 *   The number that matters is not "how many pharmacies do we know in Bamenda".
 *   It is "how long until Bamenda has nobody on call". A town whose rota runs
 *   out tomorrow is a town where somebody will open this app at 2am and be told
 *   we do not know. So every town shows its coverage, and any town uncovered
 *   or running out inside 24 hours is flagged in red at the top — before a user
 *   finds out for you.
 *
 * QUICK BUTTONS, BECAUSE ROTAS ARE WEEKLY
 *   Tonight · 24 hours · This week. Typing two timestamps by hand for every
 *   pharmacy, every week, is how a rota stops being maintained by February.
 *
 * LANGUAGE: English only, by decision. Staff chrome, never seen by a user.
 *
 * FIX497 - THE BANNER WAS NEVER ABOUT THE NETWORK.
 *   The red "Could not load pharmacies" showed on EVERY load, success or not.
 *   The reason was mundane and my earlier network diagnosis was wrong: these
 *   fetchers return { rows, failed }, and this file was reading `list.ok` and
 *   `list.error`, which are both undefined. `undefined ? a : b` always takes
 *   the error branch, so the panel printed its fallback sentence forever while
 *   the rows loaded perfectly underneath. `vite build` does not typecheck, so
 *   nothing ever flagged it. Now it reads `failed`, the real flag.
 *
 * FIX497 - REGION, because the column is NOT NULL.
 *   Without a region in the payload the insert is rejected outright, so
 *   "Add pharmacy" could not work at all. Region is now a required selector,
 *   filled from cm_regions and falling back to the ten if that lookup fails.
 *
 * FIX497 - PUBLISH / UNPUBLISH.
 *   Every public read requires is_verified = true. Staff can now see that
 *   state on each row and switch it, instead of a pharmacy being added and
 *   silently never appearing to anyone.
 *
 * FIX496 — A FAILED REFRESH IS NOT A FAILED LOAD.
 *   The panel was showing a red "Could not load pharmacies" banner with the
 *   pharmacies listed underneath it. Both cannot be true, and the confusing
 *   one is the banner: on this connection a request can fail while the list we
 *   already hold is perfectly good. So there are now two different states.
 *     RED   — we have nothing to show. Something is genuinely wrong.
 *     AMBER — the refresh did not complete; this is the last list we loaded.
 *   And a failed load that comes back empty no longer wipes a good list off
 *   the screen. Same principle as the badge counts: never let a network dip
 *   render as "there is nothing here".
 *
 * © 2026 BAMBEH SARL. All rights reserved.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  Loader2, Plus, X, Search, AlertCircle, RefreshCw, Cross, Clock,
  Trash2, Pencil, CheckCircle2, CalendarClock,
} from 'lucide-react';
import {
  fetchPharmacies, createPharmacy, updatePharmacy,
  fetchOnCallWindows, addOnCallWindow, deleteOnCallWindow,
  fetchRotaStatus, windowIsLive,
  fetchRegions, setPharmacyVerified, CM_REGIONS_FALLBACK,   // FIX497
  type Pharmacy, type PharmacyDraft, type OnCallWindow, type RotaStatusRow,
  type AdminRole, type Capabilities,
} from './lib';

const EMPTY: PharmacyDraft = {
  name: '', town: '', region: '', quarter: null, address: null,
  phone: null, whatsapp: null, notes: null, is_active: true,
};

const toLocal = (iso: string) => {
  const d = new Date(iso); const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};
const fromLocal = (v: string) => (v ? new Date(v).toISOString() : '');
const pretty = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

/** How long until this town has nobody on call. */
function coverage(r: RotaStatusRow): { label: string; tone: 'ok' | 'warn' | 'bad' } {
  if (!r.covered_until) return { label: 'no rota entered', tone: 'bad' };
  const hrs = (new Date(r.covered_until).getTime() - Date.now()) / 3600000;
  if (hrs <= 0) return { label: 'rota has run out', tone: 'bad' };
  if (hrs < 24) return { label: `only ${Math.max(1, Math.round(hrs))}h of cover left`, tone: 'warn' };
  return { label: `covered for ${Math.round(hrs / 24)} more days`, tone: 'ok' };
}

export default function PharmaciesSection({
  userId, role, cap, flash,
}: { userId: string; role: AdminRole; cap: Capabilities; flash: (m: string) => void }) {

  const [rows, setRows] = useState<Pharmacy[]>([]);
  const [status, setStatus] = useState<RotaStatusRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [staleNote, setStaleNote] = useState<string | null>(null);   // FIX496
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  const [draft, setDraft] = useState<PharmacyDraft | null>(null);
  const [editing, setEditing] = useState<Pharmacy | null>(null);
  const [saving, setSaving] = useState(false);

  const [rota, setRota] = useState<Pharmacy | null>(null);
  const [regions, setRegions] = useState<string[]>(CM_REGIONS_FALLBACK);   // FIX497
  const [publishing, setPublishing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [list, stat] = await Promise.all([fetchPharmacies(q), fetchRotaStatus()]);

    // FIX496 — a failed load must never render as "no pharmacies", and must
    // never wipe a list we already have. Only overwrite on success, or when
    // the failure actually carried rows back.
    const ok = !list.failed;              // FIX497 - the real flag
    const haveRows = list.rows.length > 0;
    if (ok || haveRows) setRows(list.rows);
    if (stat.rows.length > 0 || ok) setStatus(stat.rows);

    if (ok) {
      setLoadError(null); setStaleNote(null);
    } else if (haveRows) {
      // We can still show something useful. Say so quietly, do not alarm.
      setLoadError(null);
      setStaleNote('The last refresh did not complete.');
    } else {
      setLoadError('The list could not be read just now.');
      setStaleNote(null);
    }
    setLoading(false);
  }, [q]);

  useEffect(() => { load(); }, [load]);

  // FIX497 - region list once, on mount. Falls back to the ten on failure.
  useEffect(() => { (async () => { setRegions(await fetchRegions()); })(); }, []);

  const save = async () => {
    if (!draft) return;
    if (!draft.name.trim() || !draft.town.trim()) { flash('Name and town are required.'); return; }
    // FIX497 - region is NOT NULL on the table; without it the insert is refused.
    if (!draft.region.trim()) { flash('Pick a region - the database requires one.'); return; }
    setSaving(true);
    try {
      const clean: PharmacyDraft = {
        ...draft,
        name: draft.name.trim(),
        town: draft.town.trim(),
        region: draft.region.trim(),
        quarter: draft.quarter?.trim() || null,
        address: draft.address?.trim() || null,
        phone: draft.phone?.trim() || null,
        whatsapp: draft.whatsapp?.trim() || null,
        notes: draft.notes?.trim() || null,
      };
      if (editing) { await updatePharmacy(userId, role, editing.id, clean); flash('Pharmacy updated.'); }
      else { await createPharmacy(userId, role, clean); flash('Pharmacy added.'); }
      setDraft(null); setEditing(null);
      await load();
    } catch (e) {
      flash(e instanceof Error ? e.message : 'Could not save.');
    } finally { setSaving(false); }
  };

  const set = <K extends keyof PharmacyDraft>(k: K, v: PharmacyDraft[K]) =>
    setDraft((d) => (d ? { ...d, [k]: v } : d));

  // FIX497 - show it to the public, or take it back off.
  const togglePublished = async (p: Pharmacy) => {
    setPublishing(p.id);
    try {
      await setPharmacyVerified(userId, role, p.id, !p.is_verified);
      flash(p.is_verified ? 'Hidden from the public page.' : 'Published - users can see it now.');
      await load();
    } catch (e) {
      flash(e instanceof Error ? e.message : 'Could not change that.');
    } finally { setPublishing(null); }
  };

  const uncovered = status.filter((s) => coverage(s).tone !== 'ok');

  return (
    <>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Cross className="w-5 h-5 text-emerald-600" /> Pharmacies on call
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Free for everyone, no sign-in needed. A stale rota is worse than none.
          </p>
        </div>
        <button onClick={() => { setEditing(null); setDraft({ ...EMPTY }); }}
          className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-3 py-2 rounded-xl flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add pharmacy
        </button>
      </div>

      {/* Coverage first. This is the number that matters. */}
      {status.length > 0 ? (
        <section className="mb-4">
          {uncovered.length > 0 ? (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p className="text-xs text-red-800">
                <span className="font-bold">
                  {uncovered.length} town{uncovered.length === 1 ? '' : 's'} need attention.
                </span>{' '}
                Someone opening Bambeh there tonight will be told we do not know.
              </p>
            </div>
          ) : null}
          <div className="space-y-1.5">
            {status.map((s) => {
              const c = coverage(s);
              const skin = c.tone === 'ok' ? 'text-emerald-700 bg-emerald-50'
                : c.tone === 'warn' ? 'text-amber-800 bg-amber-50' : 'text-red-700 bg-red-50';
              return (
                <div key={s.town} className="bg-white rounded-xl border border-gray-100 px-3 py-2 flex items-center gap-3">
                  <p className="flex-1 text-sm font-semibold text-gray-900">{s.town}</p>
                  <span className="text-[11px] text-gray-400">{s.pharmacies} listed</span>
                  <span className="text-[11px] text-gray-400">{s.on_call_now} on call</span>
                  <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${skin}`}>{c.label}</span>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      <div className="flex gap-2 mb-3">
        <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3">
          <Search className="w-4 h-4 text-gray-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, town or quarter…" className="flex-1 py-2.5 text-sm outline-none" />
        </div>
      </div>

      {staleNote ? (
        <div className="flex items-start gap-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Showing the last list we loaded</p>
            <p className="text-xs mt-0.5">{staleNote} Anything added in the last minute may be missing.</p>
          </div>
          <button onClick={load} className="shrink-0 text-xs font-bold text-amber-800 hover:underline flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
      ) : null}

      {loadError ? (
        <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3 mb-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Could not load pharmacies</p>
            <p className="text-xs mt-0.5">{loadError}</p>
          </div>
          <button onClick={load} className="shrink-0 text-xs font-bold text-red-700 hover:underline flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-10 text-emerald-600"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : (
        <div className="space-y-2">
          {rows.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {p.name}
                  {!p.is_active ? (
                    <span className="ml-2 text-[10px] bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">HIDDEN</span>
                  ) : null}
                  {p.owner_id ? (
                    <span className="ml-2 text-[10px] bg-teal-50 text-teal-700 rounded-full px-2 py-0.5">CLAIMED</span>
                  ) : null}
                  {p.is_verified === false ? (
                    <span className="ml-2 text-[10px] bg-amber-100 text-amber-800 rounded-full px-2 py-0.5">NOT PUBLISHED</span>
                  ) : null}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {[p.quarter, p.town, p.region].filter(Boolean).join(' · ')}
                  {p.phone ? ` · ${p.phone}` : ' · no number'}
                </p>
              </div>
              <button onClick={() => togglePublished(p)} disabled={publishing === p.id}
                title={p.is_verified ? 'Hide from the public page' : 'Publish to the public page'}
                className={`shrink-0 p-1.5 rounded-lg disabled:opacity-40 ${
                  p.is_verified ? 'text-emerald-600 hover:bg-emerald-50' : 'text-amber-600 hover:bg-amber-50'
                }`}>
                {publishing === p.id ? <Loader2 className="w-4 h-4 animate-spin" />
                  : p.is_verified ? <CheckCircle2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
              </button>
              <button onClick={() => setRota(p)} title="On-call windows"
                className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-2 rounded-xl">
                <CalendarClock className="w-4 h-4" /> Rota
              </button>
              <button onClick={() => { setEditing(p); setDraft({
                name: p.name, town: p.town, region: p.region ?? '', quarter: p.quarter, address: p.address,
                phone: p.phone, whatsapp: p.whatsapp, notes: p.notes, is_active: p.is_active,
              }); }} title="Edit" className="shrink-0 p-1.5 rounded-lg text-gray-500 hover:bg-gray-100">
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          ))}
          {rows.length === 0 && !loadError ? (
            <div className="text-center py-10">
              <Cross className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No pharmacies yet.</p>
              <p className="text-xs text-gray-400 mt-1">Add one, then set when it is on call.</p>
            </div>
          ) : null}
        </div>
      )}

      {draft ? (
        <Sheet title={editing ? 'Edit pharmacy' : 'Add pharmacy'} onClose={() => !saving && setDraft(null)}>
          <Field label="Name" required>
            <input value={draft.name} onChange={(e) => set('name', e.target.value)}
              placeholder="Pharmacie du Centre" className={INPUT} />
          </Field>
          <Field label="Region" required hint="Required by the database. Yaoundé is Centre, Douala is Littoral.">
            <select value={draft.region} onChange={(e) => set('region', e.target.value)} className={INPUT}>
              <option value="">Choose a region…</option>
              {regions.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Town" required>
              <input value={draft.town} onChange={(e) => set('town', e.target.value)}
                placeholder="Yaoundé" className={INPUT} />
            </Field>
            <Field label="Quarter">
              <input value={draft.quarter ?? ''} onChange={(e) => set('quarter', e.target.value)}
                placeholder="Bastos" className={INPUT} />
            </Field>
          </div>
          <Field label="Address">
            <input value={draft.address ?? ''} onChange={(e) => set('address', e.target.value)}
              placeholder="Avenue Kennedy" className={INPUT} />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Phone" hint="Shown as a Call button">
              <input value={draft.phone ?? ''} onChange={(e) => set('phone', e.target.value)}
                placeholder="+237…" className={INPUT} dir="ltr" />
            </Field>
            <Field label="WhatsApp">
              <input value={draft.whatsapp ?? ''} onChange={(e) => set('whatsapp', e.target.value)}
                placeholder="+237…" className={INPUT} dir="ltr" />
            </Field>
          </div>
          <Field label="Note for users" hint="e.g. entrance on the side street">
            <textarea rows={2} value={draft.notes ?? ''} onChange={(e) => set('notes', e.target.value)}
              className={`${INPUT} resize-none`} />
          </Field>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={draft.is_active}
              onChange={(e) => set('is_active', e.target.checked)} className="w-4 h-4 accent-emerald-600" />
            Show to users
          </label>
          <button onClick={save} disabled={saving}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-2.5 rounded-xl disabled:opacity-60 flex items-center justify-center gap-2">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : editing ? 'Save changes' : 'Add pharmacy'}
          </button>
        </Sheet>
      ) : null}

      {rota ? (
        <RotaSheet pharmacy={rota} userId={userId} role={role} flash={flash}
          onClose={() => { setRota(null); load(); }} />
      ) : null}
    </>
  );
}

/* ── on-call windows for one pharmacy ─────────────────────────────────── */
function RotaSheet({ pharmacy, userId, role, flash, onClose }: {
  pharmacy: Pharmacy; userId: string; role: AdminRole;
  flash: (m: string) => void; onClose: () => void;
}) {
  const [wins, setWins] = useState<OnCallWindow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [note, setNote] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetchOnCallWindows(pharmacy.id);
    setWins(res.rows);
    setErr(res.failed ? 'Could not load the rota.' : null);   // FIX497
    setLoading(false);
  }, [pharmacy.id]);

  useEffect(() => { load(); }, [load]);

  /* Rotas are weekly. Typing two timestamps by hand for every pharmacy every
     week is how a rota stops being maintained by February. */
  const quick = (kind: 'tonight' | 'day' | 'week') => {
    const s = new Date();
    const e = new Date();
    if (kind === 'tonight') { s.setHours(18, 0, 0, 0); e.setDate(e.getDate() + 1); e.setHours(8, 0, 0, 0); }
    else if (kind === 'day') { e.setDate(e.getDate() + 1); }
    else { e.setDate(e.getDate() + 7); }
    setFrom(toLocal(s.toISOString()));
    setTo(toLocal(e.toISOString()));
    if (kind === 'tonight' && !note) setNote('night');
  };

  const add = async () => {
    if (!from || !to) { flash('Choose a start and an end.'); return; }
    setBusy(true);
    try {
      await addOnCallWindow(userId, role, pharmacy.id, fromLocal(from), fromLocal(to), note);
      flash('On-call window added.');
      setFrom(''); setTo(''); setNote('');
      await load();
    } catch (e) { flash(e instanceof Error ? e.message : 'Could not add that window.'); }
    finally { setBusy(false); }
  };

  const remove = async (w: OnCallWindow) => {
    if (!window.confirm('Remove this on-call window?')) return;
    try {
      await deleteOnCallWindow(userId, role, w.id, pharmacy.id);
      flash('Window removed.');
      await load();
    } catch (e) { flash(e instanceof Error ? e.message : 'Could not remove it.'); }
  };

  return (
    <Sheet title={pharmacy.name} onClose={onClose}>
      <p className="text-xs text-gray-500 -mt-1">{[pharmacy.quarter, pharmacy.town].filter(Boolean).join(' · ')}</p>

      <div className="rounded-xl border border-gray-100 p-3 space-y-2">
        <p className="text-xs font-bold text-gray-700">Add an on-call window</p>
        <div className="flex gap-2">
          {(['tonight', 'day', 'week'] as const).map((k) => (
            <button key={k} onClick={() => quick(k)}
              className="flex-1 text-xs font-semibold border border-gray-200 rounded-xl py-2 hover:border-emerald-400 hover:bg-emerald-50">
              {k === 'tonight' ? 'Tonight' : k === 'day' ? '24 hours' : 'This week'}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field label="From"><input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} className={INPUT} /></Field>
          <Field label="Until"><input type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} className={INPUT} /></Field>
        </div>
        <Field label="Note" hint="night · weekend · public holiday">
          <input value={note} onChange={(e) => setNote(e.target.value)} className={INPUT} />
        </Field>
        <button onClick={add} disabled={busy}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-2.5 rounded-xl disabled:opacity-60 flex items-center justify-center gap-2">
          {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding…</> : 'Add window'}
        </button>
      </div>

      {err ? (
        <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
          <AlertCircle className="w-4 h-4 shrink-0" /><p className="flex-1">{err}</p>
          <button onClick={load} className="font-bold underline">Retry</button>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-6 text-emerald-600"><Loader2 className="w-5 h-5 animate-spin" /></div>
      ) : wins.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-4">
          Not on call at any time. Users will not see this pharmacy.
        </p>
      ) : (
        <div className="space-y-1.5">
          {wins.map((w) => {
            const live = windowIsLive(w);
            return (
              <div key={w.id} className="flex items-center gap-2 border border-gray-100 rounded-xl px-3 py-2">
                {live ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      : <Clock className="w-4 h-4 text-gray-300 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className={`text-xs ${live ? 'font-bold text-emerald-700' : 'text-gray-600'}`}>
                    {pretty(w.starts_at)} → {pretty(w.ends_at)}
                  </p>
                  {w.note ? <p className="text-[11px] text-gray-400">{w.note}</p> : null}
                </div>
                <button onClick={() => remove(w)} className="shrink-0 p-1.5 rounded-lg text-red-600 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </Sheet>
  );
}

/* ── shared bits ───────────────────────────────────────────────────────── */
const INPUT = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-400';

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" onClick={onClose}>
      <div className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
          <p className="flex-1 font-bold text-gray-900 truncate">{title}</p>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100" aria-label="Close">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-4 space-y-3">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-600 mb-1 block">
        {label}{required ? <span className="text-red-500"> *</span> : null}
      </label>
      {children}
      {hint ? <p className="text-[11px] text-gray-400 mt-1">{hint}</p> : null}
    </div>
  );
}
// BAMBEH_END_TOKEN__PHARMACIESSECTION_FIX497__COMPLETE
