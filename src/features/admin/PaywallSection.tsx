// BAMBEH_DEPLOY_TOKEN__PAYWALLSECTION_FIX536_CLEAN
/**
 * src/features/admin/PaywallSection.tsx - Bambeh Admin Command Center
 *
 * FIX536 - THE SWITCH. Subscription wall on or off, globally or per region.
 *
 * A NOTE ON WHO CAN SEE THIS, BECAUSE THE CODEBASE AND THE DECISION DISAGREED
 *   Big said admins AND super admins may flip the paywall, never moderators.
 *   The obvious capability to gate on was cap.manageSubscriptions - but in
 *   lib.ts that flag is granted to super_admin ONLY. Using it would have
 *   locked out every admin from a control he explicitly gave them.
 *   So the gate here is the role itself, which matches is_bambeh_admin() in
 *   FIX535 exactly. The database is the real gate; this only decides what to
 *   draw.
 *
 * WHY THE GLOBAL SWITCH ASKS TWICE
 *   One click here makes Bambeh free for every user in fourteen countries.
 *   That is a revenue decision, not a toggle, and it should feel like one.
 *   Regions flip on a single click - the blast radius is one region.
 *
 * THE MESSAGE IS EDITABLE HERE
 *   Five languages, stored in the database by FIX535. Changing the sponsor
 *   wording is a save, not a release. English and French are shown because
 *   those are the two staff read; the other three are stored and served
 *   untouched.
 *
 * IT SHOWS THE TRUTH, NOT THE INTENTION
 *   After every flip it re-reads bambeh_paywall_state() for all ten regions
 *   and draws what the DATABASE says. If a write silently failed you see it
 *   here, not in a support message three weeks later.
 *
 * LANGUAGE: English only, by decision. Staff chrome, never seen by a user.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  Loader2, AlertCircle, RefreshCw, Lock, Unlock, Globe, MapPin,
  Save, ShieldAlert, Check,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { logAction, type AdminRole, type Capabilities } from './lib';

interface RegionRow { region_key: string; label: string; free: boolean }

interface Props {
  userId: string;
  role: AdminRole;
  cap: Capabilities;
  flash: (m: string) => void;
}

const LANGS: Array<{ code: string; label: string }> = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'French' },
  { code: 'pcm', label: 'Pidgin' },
  { code: 'ar', label: 'Arabic' },
  { code: 'ff', label: 'Fulfulde' },
];

export default function PaywallSection({ userId, role, flash }: Props) {
  const mayFlip = role === 'super_admin' || role === 'admin';

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [globalOff, setGlobalOff] = useState(false);
  const [regions, setRegions] = useState<RegionRow[]>([]);
  const [message, setMessage] = useState<Record<string, string>>({});
  const [confirmGlobal, setConfirmGlobal] = useState(false);
  const [msgDirty, setMsgDirty] = useState(false);

  /** Read the DATABASE, never trust local state. */
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [{ data: known, error: kErr }, { data: gState, error: gErr }] = await Promise.all([
        supabase.rpc('bambeh_known_regions'),
        supabase.rpc('bambeh_paywall_state', { p_region: null }),
      ]);
      if (kErr) throw kErr;
      if (gErr) throw gErr;

      const isGlobal = Boolean(gState?.free) && gState?.reason === 'global';
      setGlobalOff(isGlobal);
      setMessage((gState?.message as Record<string, string>) || {});
      setMsgDirty(false);

      const list = (known || []) as Array<{ region_key: string; label: string }>;
      // ask the database region by region - the switch is per region, so the
      // display has to be too
      const rows = await Promise.all(list.map(async (r) => {
        const { data } = await supabase.rpc('bambeh_paywall_state', { p_region: r.region_key });
        return { region_key: r.region_key, label: r.label, free: Boolean(data?.free) };
      }));
      setRegions(rows);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not read the paywall state.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const flipGlobal = async (next: boolean) => {
    setBusy('global');
    setError(null);
    try {
      const { error: e } = await supabase.rpc('admin_set_paywall', { p_global_off: next });
      if (e) throw e;
      await logAction(userId, role, next ? 'paywall_global_off' : 'paywall_global_on', null, null);
      flash(next ? 'Bambeh is now FREE everywhere.' : 'Subscriptions are back ON everywhere.');
      setConfirmGlobal(false);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'The switch did not move.');
    } finally {
      setBusy(null);
    }
  };

  const flipRegion = async (key: string, label: string, next: boolean) => {
    setBusy(key);
    setError(null);
    try {
      const { error: e } = await supabase.rpc('admin_set_paywall', {
        p_region: key, p_region_off: next,
      });
      if (e) throw e;
      await logAction(userId, role, next ? 'paywall_region_off' : 'paywall_region_on', null, key);
      flash(next ? label + ' is now FREE.' : label + ' is back on subscriptions.');
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'The switch did not move.');
    } finally {
      setBusy(null);
    }
  };

  const saveMessage = async () => {
    setBusy('message');
    setError(null);
    try {
      const { error: e } = await supabase.rpc('admin_set_paywall', { p_message: message });
      if (e) throw e;
      await logAction(userId, role, 'paywall_message_edit', null, null);
      flash('Sponsor message saved.');
      setMsgDirty(false);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'The message did not save.');
    } finally {
      setBusy(null);
    }
  };

  /* ---------------------------------------------------------------- */

  if (!mayFlip) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 flex items-start gap-2">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
        <span>Only an admin or super admin may change the paywall.</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-16 text-center">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-teal-600" />
        <p className="mt-3 text-sm text-gray-500">Reading the paywall state...</p>
      </div>
    );
  }

  const freeCount = regions.filter((r: RegionRow) => r.free).length;

  return (
    <div className="space-y-6">
      {/* ---------------------------------------------------- header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Subscription wall</h2>
          <p className="mt-1 text-sm text-gray-600">
            {globalOff
              ? 'Bambeh is FREE for everyone, everywhere.'
              : freeCount > 0
                ? freeCount + ' region' + (freeCount === 1 ? '' : 's') + ' free. Everywhere else pays.'
                : 'Subscriptions are ON everywhere.'}
          </p>
        </div>
        <button type="button" onClick={() => void load()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ---------------------------------------------------- global */}
      <div className={'rounded-xl border p-4 ' + (globalOff ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 bg-white')}>
        <div className="flex items-start gap-3">
          <Globe className={'mt-0.5 h-5 w-5 shrink-0 ' + (globalOff ? 'text-emerald-600' : 'text-gray-400')} />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900">Everywhere</p>
            <p className="mt-0.5 text-sm text-gray-600">
              {globalOff
                ? 'Every user in every country is using Bambeh free right now.'
                : 'One click makes Bambeh free for every user in every country.'}
            </p>

            {!globalOff && confirmGlobal && (
              <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3">
                <p className="text-sm font-medium text-amber-900">
                  This removes the wall for everyone, in all fourteen countries. Sure?
                </p>
                <div className="mt-2 flex gap-2">
                  <button type="button" disabled={busy === 'global'} onClick={() => void flipGlobal(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:bg-gray-300">
                    {busy === 'global' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlock className="h-4 w-4" />}
                    Yes, make Bambeh free
                  </button>
                  <button type="button" onClick={() => setConfirmGlobal(false)}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {!globalOff && !confirmGlobal && (
              <button type="button" onClick={() => setConfirmGlobal(true)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-700">
                <Unlock className="h-4 w-4" /> Make Bambeh free everywhere
              </button>
            )}

            {globalOff && (
              <button type="button" disabled={busy === 'global'} onClick={() => void flipGlobal(false)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-sm font-bold text-white hover:bg-black disabled:bg-gray-300">
                {busy === 'global' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                Turn subscriptions back on
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- regions */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">One region at a time</h3>
        {globalOff && (
          <p className="mt-1 text-sm text-amber-700">
            The global switch is on, so everywhere is free regardless of these.
          </p>
        )}
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {regions.map((r: RegionRow) => (
            <div key={r.region_key}
              className={'flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 ' +
                (r.free ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 bg-white')}>
              <div className="flex min-w-0 items-center gap-2">
                <MapPin className={'h-4 w-4 shrink-0 ' + (r.free ? 'text-emerald-600' : 'text-gray-400')} />
                <span className="truncate text-sm font-medium text-gray-900">{r.label}</span>
                {r.free && <Check className="h-4 w-4 shrink-0 text-emerald-600" />}
              </div>
              <button type="button" disabled={busy === r.region_key}
                onClick={() => void flipRegion(r.region_key, r.label, !r.free)}
                className={'shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold disabled:bg-gray-300 ' +
                  (r.free ? 'bg-gray-900 text-white hover:bg-black' : 'bg-emerald-600 text-white hover:bg-emerald-700')}>
                {busy === r.region_key
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : r.free ? 'Charge again' : 'Make free'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ---------------------------------------------------- message */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">
          What users are told
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          Shown wherever the wall used to be. Framed as a sponsor opening the app, not a discount.
        </p>
        <div className="mt-3 space-y-3">
          {LANGS.map((l) => (
            <label key={l.code} className="block">
              <span className="text-xs font-semibold text-gray-500">{l.label}</span>
              <textarea
                dir={l.code === 'ar' ? 'rtl' : 'ltr'}
                rows={2}
                value={message[l.code] || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  setMessage((p: Record<string, string>) => ({ ...p, [l.code]: e.target.value }));
                  setMsgDirty(true);
                }}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-teal-500"
              />
            </label>
          ))}
        </div>
        <button type="button" disabled={!msgDirty || busy === 'message'} onClick={() => void saveMessage()}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-sm font-bold text-white hover:bg-teal-700 disabled:bg-gray-300">
          {busy === 'message' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save message
        </button>
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__PAYWALLSECTION_FIX536__COMPLETE
