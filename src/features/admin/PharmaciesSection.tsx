// BAMBEH_DEPLOY_TOKEN__PHARMACIESSECTION_FIX482_CLEAN
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
  type Pharmacy, type PharmacyDraft, type OnCallWindow, type RotaStatusRow,
  type AdminRole, type Capabilities,
} from './lib';

const EMPTY: PharmacyDraft = {
  name: '', town: '', quarter: null, address: null,
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
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  const [draft, setDraft] = useState<PharmacyDraft | null>(null);
  const [editing, setEditing] = useState<Pharmacy | null>(null);
  const [saving, setSaving] = useState(false);

  const [rota, setRota] = useState<Pharmacy | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [list, stat] = await Promise.all([fetchPharmacies(q), fetchRotaStatus()]);
    setRows(list.rows);
    setStatus(stat.rows);
    // A failed load must never render as "no pharmacies".
    setLoadError(list.ok ? null : (list.error || 'Could not load pharmacies.'));
    setLoading(false);
  }, [q]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!draft) return;
    if (!draft.name.trim() || !draft.town.trim()) { flash('Name and town are required.'); return; }
    setSaving(true);
    try {
      const clean: PharmacyDraft = {
        ...draft,
        name: draft.name.trim(),
        town: draft.town.trim(),
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
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {[p.quarter, p.town].filter(Boolean).join(' · ')}
                  {p.phone ? ` · ${p.phone}` : ' · no number'}
                </p>
              </div>
              <button onClick={() => setRota(p)} title="On-call windows"
                className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-2 rounded-xl">
                <CalendarClock className="w-4 h-4" /> Rota
              </button>
              <button onClick={() => { setEditing(p); setDraft({
                name: p.name, town: p.town, quarter: p.quarter, address: p.address,
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
    setErr(res.ok ? null : (res.error || 'Could not load the rota.'));
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
// BAMBEH_END_TOKEN__PHARMACIESSECTION_FIX482__COMPLETE
