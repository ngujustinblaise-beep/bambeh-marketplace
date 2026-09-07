// BAMBEH_DEPLOY_TOKEN__FUELSECTION_FIX504_CLEAN
/**
 * src/features/admin/FuelSection.tsx - Bambeh Admin Command Center
 *
 * FIX504 - FUEL AT NIGHT.
 * ------------------------------------------------------------------
 * A filling station is TWO facts, and only one of them is stable.
 *
 *   IS IT OPEN? That is a rota - opening hours a station keeps for months.
 *   Staff enter it here, and the public page works it out from the clock.
 *
 *   DOES IT HAVE FUEL? That changes hourly and no directory can hold it.
 *   Users report it themselves and the reports die after six hours, because
 *   a six-hour-old "yes they have petrol" is how you send somebody across
 *   Yaounde at 1am for nothing.
 *
 * WHY THE HOURS ARE A TIME, NOT A SENTENCE
 *   "Open late" means nothing at 2am. A real opens_at/closes_at lets the page
 *   answer the only question that matters - open RIGHT NOW - instead of making
 *   a tired person read and guess. Stations that never close get the 24h flag
 *   and skip the times entirely.
 *
 * MIDNIGHT IS HANDLED IN SQL, NOT HERE
 *   A window of 18:00 to 06:00 crosses midnight, so "between" is wrong for
 *   half of every night. fuel_open_now() has the case for it.
 *
 * NOTHING REACHES USERS UNVERIFIED. Same rule as pharmacies and hospitals:
 * anyone may submit, the row lands unverified, and a person here publishes it.
 *
 * LANGUAGE: English only, by decision. Staff chrome, never seen by a user.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  Loader2, AlertCircle, RefreshCw, Fuel, Plus, X, Check, Pencil,
  MapPin, Clock, EyeOff, Droplet, Flame,
} from 'lucide-react';
import {
  fetchFuelStations, createFuelStation, updateFuelStation, setFuelVerified,
  CM_REGIONS_FALLBACK, fetchRegions, fetchQuarters,
  type FuelStation, type FuelDraft,
  type AdminRole, type Capabilities,
} from './lib';

const EMPTY: FuelDraft = {
  name: '', brand: null, region: '', town: '', quarter: null, address: null,
  phone: null, is_24h: false, opens_at: '18:00', closes_at: '06:00',
  has_petrol: true, has_diesel: true, has_gas: false, notes: null, is_active: true,
};

const INPUT = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500';
const TAB = 'flex-1 rounded-xl py-2.5 text-sm font-semibold border transition-colors flex items-center justify-center gap-2';

/** "18:00:00" from Postgres, "18:00" from the input. Both must render. */
const hhmm = (t: string | null) => (t ? t.slice(0, 5) : '');

export default function FuelSection({
  userId, role, flash,
}: { userId: string; role: AdminRole; cap: Capabilities; flash: (m: string) => void }) {

  const [rows, setRows] = useState<FuelStation[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [staleNote, setStaleNote] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [regions, setRegions] = useState<string[]>(CM_REGIONS_FALLBACK);
  const [quarters, setQuarters] = useState<string[]>([]);
  const [draft, setDraft] = useState<FuelDraft | null>(null);
  const [editing, setEditing] = useState<FuelStation | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetchFuelStations(q);
    const ok = !res.failed;
    const haveRows = res.rows.length > 0;
    if (ok || haveRows) setRows(res.rows);
    if (ok) { setLoadError(null); setStaleNote(null); }
    else if (haveRows) { setLoadError(null); setStaleNote('The last refresh did not complete.'); }
    else { setLoadError('The list could not be read just now.'); setStaleNote(null); }
    setLoading(false);
  }, [q]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { (async () => { setRegions(await fetchRegions()); })(); }, []);

  const draftTown = draft?.town ?? '';
  useEffect(() => {
    let alive = true;
    (async () => { const qs = await fetchQuarters(draftTown); if (alive) setQuarters(qs); })();
    return () => { alive = false; };
  }, [draftTown]);

  const set = <K extends keyof FuelDraft>(k: K, v: FuelDraft[K]) =>
    setDraft((d) => (d ? { ...d, [k]: v } : d));

  const save = async () => {
    if (!draft) return;
    if (!draft.name.trim()) { flash('A name is required.'); return; }
    if (!draft.region.trim() || !draft.town.trim()) { flash('Region and town are required.'); return; }
    if (!draft.is_24h && (!draft.opens_at || !draft.closes_at)) {
      flash('Give the opening and closing time, or tick 24 hours.'); return;
    }
    if (!draft.has_petrol && !draft.has_diesel && !draft.has_gas) {
      flash('Tick at least one thing they sell.'); return;
    }
    setSaving(true);
    try {
      const clean: FuelDraft = {
        ...draft,
        name: draft.name.trim(),
        brand: draft.brand?.trim() || null,
        region: draft.region.trim(),
        town: draft.town.trim(),
        quarter: draft.quarter?.trim() || null,
        address: draft.address?.trim() || null,
        phone: draft.phone?.trim() || null,
        notes: draft.notes?.trim() || null,
        opens_at: draft.is_24h ? null : draft.opens_at,
        closes_at: draft.is_24h ? null : draft.closes_at,
      };
      if (editing) {
        await updateFuelStation(userId, role, editing.id, clean);
        flash('Station updated.');
      } else {
        await createFuelStation(userId, role, clean);
        flash('Added. Publish it when you are sure.');
      }
      setDraft(null); setEditing(null);
      await load();
    } catch (e) {
      flash(e instanceof Error ? e.message : 'Could not save that.');
    } finally { setSaving(false); }
  };

  const togglePublished = async (s: FuelStation) => {
    setBusy(s.id);
    try {
      await setFuelVerified(userId, role, s.id, !s.is_verified);
      flash(s.is_verified ? 'Hidden from the public page.' : 'Published - users can see it now.');
      await load();
    } catch (e) { flash(e instanceof Error ? e.message : 'Could not change that.'); }
    finally { setBusy(null); }
  };

  const sells = (s: FuelStation) =>
    [s.has_petrol ? 'petrol' : null, s.has_diesel ? 'diesel' : null, s.has_gas ? 'gas' : null]
      .filter(Boolean).join(', ');

  return (
    <>
      <div className="flex items-start justify-between gap-3 mb-1">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Fuel className="w-5 h-5 text-amber-600" /> Fuel at night
          </h1>
          <p className="text-xs text-gray-500">
            Opening hours are entered here. Whether they actually have fuel is reported by users.
          </p>
        </div>
        <button onClick={() => { setEditing(null); setDraft({ ...EMPTY }); }}
          className="shrink-0 flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold px-3 py-2 rounded-xl">
          <Plus className="w-4 h-4" /> Add station
        </button>
      </div>

      <input value={q} onChange={(e) => setQ(e.target.value)}
        placeholder="Search name, brand, town or quarter..." className={`${INPUT} my-4`} />

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
            <p className="font-semibold">Could not load stations</p>
            <p className="text-xs mt-0.5">{loadError}</p>
          </div>
          <button onClick={load} className="shrink-0 text-xs font-bold text-red-700 hover:underline flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-10 text-amber-600"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : (
        <div className="space-y-2">
          {rows.map((s) => (
            <div key={s.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3">
              <span className="shrink-0 w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                <Fuel className="w-4 h-4 text-amber-600" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {s.name}
                  {s.brand ? <span className="text-gray-400 font-normal"> \u00b7 {s.brand}</span> : null}
                  {!s.is_active ? (
                    <span className="ml-2 text-[10px] bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">HIDDEN</span>
                  ) : null}
                  {s.is_verified === false ? (
                    <span className="ml-2 text-[10px] bg-amber-100 text-amber-800 rounded-full px-2 py-0.5">NOT PUBLISHED</span>
                  ) : null}
                </p>
                <p className="text-xs text-gray-400 truncate flex items-center gap-1">
                  <MapPin className="w-3 h-3 shrink-0" />
                  {[s.quarter, s.town, s.region].filter(Boolean).join(' \u00b7 ')}
                </p>
                <p className="text-[11px] text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 shrink-0" />
                  {s.is_24h ? 'Open 24 hours' : `${hhmm(s.opens_at)} - ${hhmm(s.closes_at)}`}
                  {sells(s) ? ` \u00b7 ${sells(s)}` : ''}
                </p>
              </div>
              <button onClick={() => togglePublished(s)} disabled={busy === s.id}
                title={s.is_verified ? 'Hide from the public page' : 'Publish to the public page'}
                className={`shrink-0 p-1.5 rounded-lg disabled:opacity-40 ${
                  s.is_verified ? 'text-emerald-600 hover:bg-emerald-50' : 'text-amber-600 hover:bg-amber-50'}`}>
                {busy === s.id ? <Loader2 className="w-4 h-4 animate-spin" />
                  : s.is_verified ? <Check className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  setEditing(s);
                  setDraft({
                    name: s.name, brand: s.brand, region: s.region ?? '', town: s.town,
                    quarter: s.quarter, address: s.address, phone: s.phone,
                    is_24h: s.is_24h, opens_at: hhmm(s.opens_at) || '18:00',
                    closes_at: hhmm(s.closes_at) || '06:00',
                    has_petrol: s.has_petrol, has_diesel: s.has_diesel, has_gas: s.has_gas,
                    notes: s.notes, is_active: s.is_active,
                  });
                }}
                title="Edit" className="shrink-0 p-1.5 rounded-lg text-gray-500 hover:bg-gray-100">
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          ))}

          {rows.length === 0 && !loadError ? (
            <div className="text-center py-10">
              <Fuel className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No stations yet.</p>
              <p className="text-xs text-gray-400 mt-1">
                Add the ones you know open late. One real station beats ten guesses.
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
                {editing ? 'Edit station' : 'Add station'}
              </h3>
              <button onClick={() => !saving && (setDraft(null), setEditing(null))}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <Field label="Name" required>
              <input value={draft.name} onChange={(e) => set('name', e.target.value)}
                placeholder="Station Melen" className={INPUT} />
            </Field>
            <Field label="Brand" hint="Total, Tradex, Neptune, Bocom, Green Oil...">
              <input value={draft.brand ?? ""} onChange={(e) => set('brand', e.target.value)}
                placeholder="Total" className={INPUT} />
            </Field>
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
              <Field label="Quarter or village" hint="Pick or type">
                <input value={draft.quarter ?? ""} onChange={(e) => set('quarter', e.target.value)}
                  list="bambeh-fuel-quarters" placeholder="Melen" className={INPUT} />
                <datalist id="bambeh-fuel-quarters">
                  {quarters.map((x) => <option key={x} value={x} />)}
                </datalist>
              </Field>
            </div>
            <Field label="Address">
              <input value={draft.address ?? ""} onChange={(e) => set('address', e.target.value)}
                placeholder="Carrefour Melen, on the left" className={INPUT} />
            </Field>
            <Field label="Phone" hint="The station's own number. Never a person's private line.">
              <input value={draft.phone ?? ""} onChange={(e) => set('phone', e.target.value)}
                placeholder="+237..." className={INPUT} dir="ltr" />
            </Field>

            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <input type="checkbox" checked={draft.is_24h}
                onChange={(e) => set('is_24h', e.target.checked)} className="w-4 h-4" />
              Open 24 hours
            </label>

            {!draft.is_24h ? (
              <div className="grid grid-cols-2 gap-2">
                <Field label="Opens" required>
                  <input type="time" value={draft.opens_at ?? ""}
                    onChange={(e) => set('opens_at', e.target.value)} className={INPUT} />
                </Field>
                <Field label="Closes" required hint="Crossing midnight is fine">
                  <input type="time" value={draft.closes_at ?? ""}
                    onChange={(e) => set('closes_at', e.target.value)} className={INPUT} />
                </Field>
              </div>
            ) : null}

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">They sell</label>
              <div className="flex gap-2">
                <button onClick={() => set('has_petrol', !draft.has_petrol)}
                  className={`${TAB} ${draft.has_petrol ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-600 border-gray-200'}`}>
                  <Fuel className="w-4 h-4" /> Petrol
                </button>
                <button onClick={() => set('has_diesel', !draft.has_diesel)}
                  className={`${TAB} ${draft.has_diesel ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200'}`}>
                  <Droplet className="w-4 h-4" /> Diesel
                </button>
                <button onClick={() => set('has_gas', !draft.has_gas)}
                  className={`${TAB} ${draft.has_gas ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-gray-600 border-gray-200'}`}>
                  <Flame className="w-4 h-4" /> Gas
                </button>
              </div>
            </div>

            <Field label="Note" hint="One line. Shown exactly as typed.">
              <textarea value={draft.notes ?? ""} onChange={(e) => set('notes', e.target.value)}
                rows={2} placeholder="Cash only after 10pm" className={INPUT} />
            </Field>

            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <input type="checkbox" checked={draft.is_active}
                onChange={(e) => set('is_active', e.target.checked)} className="w-4 h-4" />
              Listed
            </label>

            <div className="flex gap-2 pt-1">
              <button onClick={() => { setDraft(null); setEditing(null); }} disabled={saving}
                className="flex-1 text-sm font-bold text-gray-600 border border-gray-200 py-2.5 rounded-xl disabled:opacity-50">
                Cancel
              </button>
              <button onClick={save} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 py-2.5 rounded-xl disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save
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
// BAMBEH_END_TOKEN__FUELSECTION_FIX504__COMPLETE
