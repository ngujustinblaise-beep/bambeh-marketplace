// BAMBEH_DEPLOY_TOKEN__UTILITIESSECTION_FIX501_CLEAN
/**
 * src/features/admin/UtilitiesSection.tsx - Bambeh Admin Command Center
 *
 * FIX501 - THE WATER / LIGHTS CONTROL POINT.
 * ------------------------------------------------------------------
 * Two tabs, because two different jobs sit behind this screen.
 *
 *   LIVE REPORTS are what users filed themselves. Staff do not approve these -
 *   they are already public, and gating them would defeat the whole point of a
 *   2am outage page. What staff CAN do is close one that is over, and see at a
 *   glance which quarter is dark right now. A report carrying twenty
 *   confirmations is also the signal to write a proper announcement.
 *
 *   ANNOUNCED CUTS are written here and nowhere else. They publish
 *   immediately, because the person writing it is the same person who would
 *   otherwise approve it - a second click by the same human proves nothing.
 *   Withdraw takes it straight back off the public page.
 *
 * WHY THE COUNT MATTERS MORE THAN THE TEXT
 *   A single report is one person\u2019s word. Fourteen reports in one quarter
 *   inside an hour is a fact. The list leads with the number for that reason.
 *
 * LANGUAGE: English only, by decision. Staff chrome, never seen by a user.
 * The PUBLIC page this feeds renders in all five.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  Loader2, AlertCircle, RefreshCw, Droplet, Zap, Plus, X, Check,
  Users, CalendarClock, MapPin, Clock, Pencil, EyeOff,
} from 'lucide-react';
import {
  fetchUtilityOutages, createScheduledCut, updateScheduledCut,
  setOutageVerified, closeOutage, CM_REGIONS_FALLBACK, fetchRegions,
  type UtilityOutage, type ScheduledDraft, type UtilityKind,
  type AdminRole, type Capabilities,
} from './lib';

type Tab = 'live' | 'scheduled';

const EMPTY: ScheduledDraft = {
  utility: 'electricity', region: '', town: '', quarter: null,
  starts_at: '', ends_at: null, note: null, source: null,
};

const when = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('en-GB',
    { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-';

const ago = (iso: string) => {
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 2) return 'just now';
  if (m < 60) return m + ' min ago';
  return Math.round(m / 60) + ' h ago';
};

/** datetime-local wants "YYYY-MM-DDTHH:mm" in LOCAL time, not an ISO string. */
const toLocalInput = (iso: string | null): string => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const fromLocalInput = (v: string): string | null => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

const INPUT = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500';
const TAB = 'flex-1 rounded-xl py-2.5 text-sm font-semibold border transition-colors flex items-center justify-center gap-2';

export default function UtilitiesSection({
  userId, role, flash,
}: { userId: string; role: AdminRole; cap: Capabilities; flash: (m: string) => void }) {

  const [tab, setTab] = useState<Tab>('live');
  const [rows, setRows] = useState<UtilityOutage[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [staleNote, setStaleNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [regions, setRegions] = useState<string[]>(CM_REGIONS_FALLBACK);
  const [draft, setDraft] = useState<ScheduledDraft | null>(null);
  const [editing, setEditing] = useState<UtilityOutage | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetchUtilityOutages(tab);
    const ok = !res.failed;
    const haveRows = res.rows.length > 0;
    if (ok || haveRows) setRows(res.rows);
    if (ok) { setLoadError(null); setStaleNote(null); }
    else if (haveRows) { setLoadError(null); setStaleNote('The last refresh did not complete.'); }
    else { setLoadError('The list could not be read just now.'); setStaleNote(null); }
    setLoading(false);
  }, [tab]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { (async () => { setRegions(await fetchRegions()); })(); }, []);

  const set = <K extends keyof ScheduledDraft>(k: K, v: ScheduledDraft[K]) =>
    setDraft((d) => (d ? { ...d, [k]: v } : d));

  const save = async () => {
    if (!draft) return;
    if (!draft.region.trim() || !draft.town.trim()) { flash('Region and town are required.'); return; }
    if (!draft.starts_at) { flash('A start time is required - an announcement with no time is a rumour.'); return; }
    if (draft.ends_at && new Date(draft.ends_at) <= new Date(draft.starts_at)) {
      flash('The end time must be after the start time.'); return;
    }
    setSaving(true);
    try {
      const clean: ScheduledDraft = {
        ...draft,
        region: draft.region.trim(),
        town: draft.town.trim(),
        quarter: draft.quarter?.trim() || null,
        note: draft.note?.trim() || null,
        source: draft.source?.trim() || null,
      };
      if (editing) {
        await updateScheduledCut(userId, role, editing.id, clean);
        flash('Announcement updated.');
      } else {
        await createScheduledCut(userId, role, clean);
        flash('Published. Users can see it now.');
      }
      setDraft(null); setEditing(null);
      await load();
    } catch (e) {
      flash(e instanceof Error ? e.message : 'Could not save that.');
    } finally { setSaving(false); }
  };

  const withdraw = async (o: UtilityOutage) => {
    setBusy(o.id);
    try {
      await setOutageVerified(userId, role, o.id, false);
      flash('Withdrawn - it is off the public page.');
      await load();
    } catch (e) { flash(e instanceof Error ? e.message : 'Could not withdraw that.'); }
    finally { setBusy(null); }
  };

  const close = async (o: UtilityOutage) => {
    setBusy(o.id);
    try {
      await closeOutage(userId, role, o.id);
      flash('Closed.');
      await load();
    } catch (e) { flash(e instanceof Error ? e.message : 'Could not close that.'); }
    finally { setBusy(null); }
  };

  /** A heavily-confirmed report is usually worth turning into a real
   *  announcement. Prefill it rather than making someone retype it. */
  const announceFrom = (o: UtilityOutage) => {
    setEditing(null);
    setDraft({
      utility: o.utility, region: o.region, town: o.town, quarter: o.quarter,
      starts_at: o.starts_at, ends_at: null,
      note: o.note, source: null,
    });
    setTab('scheduled');
  };

  const Icon = ({ u }: { u: UtilityKind }) => (
    <span className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${
      u === 'water' ? 'bg-sky-50' : 'bg-amber-50'}`}>
      {u === 'water' ? <Droplet className="w-4 h-4 text-sky-600" /> : <Zap className="w-4 h-4 text-amber-600" />}
    </span>
  );

  return (
    <>
      <div className="flex items-start justify-between gap-3 mb-1">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Droplet className="w-5 h-5 text-sky-600" /> Water &amp; Lights
          </h1>
          <p className="text-xs text-gray-500">
            Reports come from users and are already public. Announcements are written here.
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); setDraft({ ...EMPTY }); setTab('scheduled'); }}
          className="shrink-0 flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold px-3 py-2 rounded-xl">
          <Plus className="w-4 h-4" /> Announce a cut
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 my-4">
        <button onClick={() => setTab('live')}
          className={`${TAB} ${tab === 'live' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-700 border-gray-200'}`}>
          <Users className="w-4 h-4" /> Live reports
        </button>
        <button onClick={() => setTab('scheduled')}
          className={`${TAB} ${tab === 'scheduled' ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-gray-700 border-gray-200'}`}>
          <CalendarClock className="w-4 h-4" /> Announced cuts
        </button>
      </div>

      {staleNote ? (
        <div className="flex items-start gap-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Showing the last list we loaded</p>
            <p className="text-xs mt-0.5">{staleNote}</p>
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
            <p className="font-semibold">Could not load</p>
            <p className="text-xs mt-0.5">{loadError}</p>
          </div>
          <button onClick={load} className="shrink-0 text-xs font-bold text-red-700 hover:underline flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-10 text-sky-600"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : (
        <div className="space-y-2">
          {rows.map((o) => (
            <div key={o.id} className="bg-white rounded-xl border border-gray-100 p-3">
              <div className="flex items-start gap-3">
                <Icon u={o.utility} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                    {[o.quarter, o.town, o.region].filter(Boolean).join(' \u00b7 ')}
                  </p>
                  {o.kind === 'reported' ? (
                    <>
                      <p className="text-xs font-bold text-amber-800">
                        {o.confirm_count} {o.confirm_count === 1 ? 'person reported this' : 'people reported this'}
                      </p>
                      <p className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {ago(o.last_activity_at)}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-sky-800">
                        {when(o.starts_at)}{o.ends_at ? ` until ${when(o.ends_at)}` : ''}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {o.source ? `${o.source} \u00b7 ` : ''}
                        {o.is_verified
                          ? 'visible to users'
                          : 'WITHDRAWN - not visible'}
                      </p>
                    </>
                  )}
                  {o.note ? <p className="text-xs text-gray-600 mt-1">{o.note}</p> : null}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {o.kind === 'reported' ? (
                  <>
                    <button onClick={() => announceFrom(o)}
                      className="flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 px-2.5 py-2 rounded-xl">
                      <CalendarClock className="w-3.5 h-3.5" /> Announce this
                    </button>
                    <button onClick={() => close(o)} disabled={busy === o.id}
                      className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-2 rounded-xl disabled:opacity-50">
                      <Check className="w-3.5 h-3.5" /> It is back
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditing(o);
                        setDraft({
                          utility: o.utility, region: o.region, town: o.town, quarter: o.quarter,
                          starts_at: o.starts_at, ends_at: o.ends_at, note: o.note, source: o.source,
                        });
                      }}
                      className="flex items-center gap-1.5 text-xs font-bold text-gray-700 border border-gray-200 hover:bg-gray-50 px-2.5 py-2 rounded-xl">
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    {o.is_verified ? (
                      <button onClick={() => withdraw(o)} disabled={busy === o.id}
                        className="flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-2 rounded-xl disabled:opacity-50">
                        <EyeOff className="w-3.5 h-3.5" /> Withdraw
                      </button>
                    ) : null}
                    <button onClick={() => close(o)} disabled={busy === o.id}
                      className="flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-2 rounded-xl disabled:opacity-50">
                      <X className="w-3.5 h-3.5" /> Close
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}

          {rows.length === 0 && !loadError ? (
            <div className="text-center py-10">
              {tab === 'live'
                ? <Users className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                : <CalendarClock className="w-8 h-8 text-gray-200 mx-auto mb-2" />}
              <p className="text-sm text-gray-400">
                {tab === 'live' ? 'No cuts reported in the last 8 hours.' : 'No announced cuts.'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {tab === 'live'
                  ? 'Reports age out after 8 hours unless somebody confirms again.'
                  : 'Announce one when ENEO or Camwater tells you something real.'}
              </p>
            </div>
          ) : null}
        </div>
      )}

      {draft ? (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center"
          onClick={() => !saving && (setDraft(null), setEditing(null))}>
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-4 space-y-3 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">
                {editing ? 'Edit announcement' : 'Announce a cut'}
              </h3>
              <button onClick={() => !saving && (setDraft(null), setEditing(null))}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500">
              This publishes straight away. Only enter what a real source told you.
            </p>

            <div className="flex gap-2">
              <button onClick={() => set('utility', 'electricity')}
                className={`${TAB} ${draft.utility === 'electricity' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-600 border-gray-200'}`}>
                <Zap className="w-4 h-4" /> Lights
              </button>
              <button onClick={() => set('utility', 'water')}
                className={`${TAB} ${draft.utility === 'water' ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-gray-600 border-gray-200'}`}>
                <Droplet className="w-4 h-4" /> Water
              </button>
            </div>

            <Field label="Region" required>
              <select value={draft.region} onChange={(e) => set('region', e.target.value)} className={INPUT}>
                <option value="">Choose a region...</option>
                {regions.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Town" required>
                <input value={draft.town} onChange={(e) => set('town', e.target.value)}
                  placeholder="Yaounde" className={INPUT} />
              </Field>
              <Field label="Quarter" hint="Leave empty for the whole town">
                <input value={draft.quarter ?? ""} onChange={(e) => set('quarter', e.target.value)}
                  placeholder="Bastos" className={INPUT} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Starts" required>
                <input type="datetime-local" value={toLocalInput(draft.starts_at)}
                  onChange={(e) => set('starts_at', fromLocalInput(e.target.value) ?? '')} className={INPUT} />
              </Field>
              <Field label="Ends" hint="Optional, but say it if you know">
                <input type="datetime-local" value={toLocalInput(draft.ends_at)}
                  onChange={(e) => set('ends_at', fromLocalInput(e.target.value))} className={INPUT} />
              </Field>
            </div>
            <Field label="Who told you?" hint="ENEO, Camwater, the quarter chief. Shown to users.">
              <input value={draft.source ?? ""} onChange={(e) => set('source', e.target.value)}
                placeholder="ENEO" className={INPUT} />
            </Field>
            <Field label="Note" hint="One line. Shown exactly as typed.">
              <textarea value={draft.note ?? ""} onChange={(e) => set('note', e.target.value)}
                rows={2} placeholder="Maintenance on the Bastos line" className={INPUT} />
            </Field>

            <div className="flex gap-2 pt-1">
              <button onClick={() => { setDraft(null); setEditing(null); }} disabled={saving}
                className="flex-1 text-sm font-bold text-gray-600 border border-gray-200 py-2.5 rounded-xl disabled:opacity-50">
                Cancel
              </button>
              <button onClick={save} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 py-2.5 rounded-xl disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {editing ? 'Save' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">
        {label}{required ? <span className="text-red-500"> *</span> : null}
      </label>
      {children}
      {hint ? <p className="text-[11px] text-gray-400 mt-1">{hint}</p> : null}
    </div>
  );
}
// BAMBEH_END_TOKEN__UTILITIESSECTION_FIX501__COMPLETE
