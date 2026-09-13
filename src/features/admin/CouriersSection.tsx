// BAMBEH_DEPLOY_TOKEN__COURIERSSECTION_FIX563_CLEAN
/**
 * src/features/admin/CouriersSection.tsx - Bambeh Admin Command Center
 *
 * FIX563 - DELIVERY AGENTS. Verify a rider, or take one off the road.
 *
 * Sits on the functions FIX556 installed:
 *   admin_courier_list(status)       read - staff, including moderators
 *   admin_courier_decide(...)        verify / reject / suspend - ADMINS ONLY
 *   bambeh_courier_counts()          the five numbers
 *   bambeh_vehicle_types()           the nine vehicle kinds
 *
 * THE TWO CHECKBOXES ARE THE WHOLE FEATURE
 *   A rider cannot reach VERIFIED unless BOTH the ID check and the vehicle
 *   check are ticked - the database refuses otherwise, and this page draws
 *   them as two deliberate boxes rather than burying them in a form. The
 *   badge a buyer sees means a human held the card and looked at the bike.
 *   Without that it is decoration, and a decorative trust badge is worse
 *   than none.
 *
 * NO ID NUMBER IS SHOWN, BECAUSE NONE IS STORED
 *   FIX556 deliberately has no id_card_number column. You see the card in
 *   person and tick a box; Bambeh never holds the number. So there is
 *   nothing to display here, and that is the point.
 *
 * WHAT A MODERATOR SEES
 *   The list and the counts, so they can chase verifications. No decide
 *   buttons - the database would refuse them, and a button that always
 *   errors is worse than no button.
 *
 * ICONS: only ones AdminCommandCenter already imports. Loader2, AlertCircle,
 * RefreshCw, Users, Shield, CheckSquare, Star, Search. Reaching for Bike or
 * Truck would have been a missing export and a blank screen - that is how
 * /coins went down two days ago.
 *
 * LANGUAGE: English only. Staff chrome, never seen by a user.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Loader2, AlertCircle, RefreshCw, Users, Shield, CheckSquare, Star, Search,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { logAction, type AdminRole, type Capabilities } from './lib';

interface Courier {
  id: string; user_id: string; full_name: string; phone: string;
  vehicle_type: string; plate_number: string | null;
  region: string; town: string; quarters: string | null;
  status: string; id_checked: boolean; vehicle_seen: boolean;
  admin_notes: string | null; verified_at: string | null;
  deliveries_done: number; rating: number | null;
  is_available: boolean; created_at: string;
}
interface Vehicle { key: string; label: string; capacity: string }
interface Counts {
  pending: number; verified: number; on_duty: number;
  rejected: number; suspended: number;
}

const STATUSES = ['PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED'];

const CARD_TONE: Record<string, string> = {
  PENDING:   'border-amber-300 bg-amber-50',
  VERIFIED:  'border-emerald-300 bg-emerald-50',
  REJECTED:  'border-gray-200 bg-gray-50',
  SUSPENDED: 'border-red-300 bg-red-50',
};

interface Props {
  userId: string; role: AdminRole; cap: Capabilities; flash: (m: string) => void;
}

export default function CouriersSection({ userId, role, flash }: Props) {
  const mayDecide = role === 'super_admin' || role === 'admin';

  const [rows, setRows]     = useState<Courier[]>([]);
  const [vTypes, setVTypes] = useState<Vehicle[]>([]);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [loading, setLoad]  = useState(true);
  const [busy, setBusy]     = useState<string | null>(null);
  const [error, setError]   = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('PENDING');
  const [search, setSearch] = useState('');

  // per-courier checkbox state, before a decision is committed
  const [checks, setChecks] = useState<Record<string, { id: boolean; veh: boolean; note: string }>>({});

  const load = useCallback(async (status: string) => {
    setLoad(true);
    setError(null);
    try {
      const [l, c, v] = await Promise.all([
        supabase.rpc('admin_courier_list', { p_status: status === 'ALL' ? null : status }),
        supabase.rpc('bambeh_courier_counts'),
        supabase.rpc('bambeh_vehicle_types'),
      ]);
      if (l.error) throw l.error;
      const list = (l.data || []) as Courier[];
      setRows(list);
      if (!c.error) setCounts(c.data as Counts);
      if (!v.error) setVTypes((v.data || []) as Vehicle[]);

      // seed the checkboxes from what the database already knows
      const seed: Record<string, { id: boolean; veh: boolean; note: string }> = {};
      for (const r of list) {
        seed[r.id] = { id: r.id_checked, veh: r.vehicle_seen, note: '' };
      }
      setChecks(seed);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not read the courier list.');
    } finally {
      setLoad(false);
    }
  }, []);

  useEffect(() => { void load(filter); }, [load, filter]);

  const decide = async (r: Courier, status: string) => {
    const c = checks[r.id] || { id: r.id_checked, veh: r.vehicle_seen, note: '' };
    setBusy(r.id);
    setError(null);
    try {
      const { data, error: e } = await supabase.rpc('admin_courier_decide', {
        p_id: r.id,
        p_status: status,
        p_id_checked: c.id,
        p_vehicle_seen: c.veh,
        p_notes: c.note.trim() || null,
      });
      if (e) throw e;

      const res = data as { ok?: boolean; reason?: string; message?: string };
      if (!res?.ok) {
        // the database refuses VERIFIED without both checks. Say so plainly.
        setError(res?.message || 'That decision was refused.');
        return;
      }
      await logAction(userId, role, 'courier_' + status.toLowerCase(), null, r.full_name);
      flash(r.full_name + ' is now ' + status + '.');
      await load(filter);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not save that decision.');
    } finally {
      setBusy(null);
    }
  };

  const vLabel = useMemo(() => {
    const m: Record<string, string> = {};
    for (const v of vTypes) m[v.key] = v.label;
    return m;
  }, [vTypes]);

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r: Courier) =>
      (r.full_name || '').toLowerCase().includes(q) ||
      (r.phone || '').includes(q) ||
      (r.town || '').toLowerCase().includes(q) ||
      (r.region || '').toLowerCase().includes(q));
  }, [rows, search]);

  /* ---------------------------------------------------------------- */

  if (loading) {
    return (
      <div className="py-16 text-center">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-teal-600" />
        <p className="mt-3 text-sm text-gray-500">Reading courier applications...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ------------------------------------------------ header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Delivery agents</h2>
          <p className="mt-1 text-sm text-gray-600">
            Riders, taxis and vans who carry Bambeh orders. A badge means somebody
            held the card and looked at the vehicle.
          </p>
        </div>
        <button type="button" onClick={() => void load(filter)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {!mayDecide && (
        <div className="flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          <Shield className="mt-0.5 h-4 w-4 shrink-0" />
          <span>You can see applications and chase an admin. Verifying is admin-only.</span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ------------------------------------------------ counts */}
      {counts && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className={'rounded-xl border p-3 ' + (counts.pending > 0 ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-white')}>
            <p className="text-2xl font-black text-gray-900">{counts.pending}</p>
            <p className="text-xs text-gray-600">Waiting on you</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-3">
            <p className="text-2xl font-black text-gray-900">{counts.verified}</p>
            <p className="text-xs text-gray-600">Verified</p>
          </div>
          <div className={'rounded-xl border p-3 ' + (counts.on_duty > 0 ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 bg-white')}>
            <p className="text-2xl font-black text-gray-900">{counts.on_duty}</p>
            <p className="text-xs text-gray-600">On duty now</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-3">
            <p className="text-2xl font-black text-gray-900">{counts.suspended}</p>
            <p className="text-xs text-gray-600">Suspended</p>
          </div>
        </div>
      )}

      {/* ------------------------------------------------ filter + search */}
      <div className="flex flex-wrap items-center gap-2">
        {(['PENDING', 'VERIFIED', 'SUSPENDED', 'REJECTED', 'ALL']).map((s: string) => (
          <button key={s} type="button" onClick={() => setFilter(s)}
            className={'rounded-lg px-3 py-1.5 text-xs font-bold ' +
              (filter === s ? 'bg-teal-600 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50')}>
            {s}
          </button>
        ))}
        <div className="relative ml-auto min-w-[180px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            placeholder="name, phone or town"
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-teal-500" />
        </div>
      </div>

      {/* ------------------------------------------------ the list */}
      {shown.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
          <Users className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-2 font-semibold text-gray-700">
            {filter === 'PENDING' ? 'No applications waiting' : 'Nothing here'}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Riders apply from inside the app. Nothing has arrived in this bucket yet.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {shown.map((r: Courier) => {
            const c = checks[r.id] || { id: r.id_checked, veh: r.vehicle_seen, note: '' };
            const canVerify = c.id && c.veh;
            return (
              <div key={r.id} className={'rounded-xl border p-3 ' + (CARD_TONE[r.status] || CARD_TONE.REJECTED)}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900">
                      {r.full_name}
                      <span className="ml-2 text-xs font-bold text-gray-500">{r.status}</span>
                      {r.status === 'VERIFIED' && r.is_available && (
                        <span className="ml-2 text-xs font-bold text-emerald-700">ON DUTY</span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-600">
                      {r.phone}
                      {' \u00b7 '}{vLabel[r.vehicle_type] || r.vehicle_type}
                      {r.plate_number ? ' \u00b7 ' + r.plate_number : ''}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-600">
                      {r.town}, {r.region}
                      {r.quarters ? ' \u00b7 ' + r.quarters : ''}
                    </p>
                    <p className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                      <span>{r.deliveries_done} deliveries</span>
                      {r.rating !== null && (
                        <span className="flex items-center gap-0.5">
                          <Star className="h-3 w-3" />{r.rating}
                        </span>
                      )}
                      <span>applied {String(r.created_at).slice(0, 10)}</span>
                    </p>
                    {r.admin_notes && (
                      <p className="mt-1 text-xs italic text-gray-500">{r.admin_notes}</p>
                    )}
                  </div>
                </div>

                {mayDecide && (
                  <div className="mt-3 rounded-lg border border-gray-200 bg-white p-3">
                    {/* Two boxes, not one form field. The database refuses
                        VERIFIED unless both are true, so make them a
                        deliberate act rather than something to skim past. */}
                    <label className="flex items-center gap-2 text-sm text-gray-800">
                      <input type="checkbox" checked={c.id}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setChecks({ ...checks, [r.id]: { ...c, id: e.target.checked } })} />
                      <span>I have seen the national ID card and the name matches this account</span>
                    </label>
                    <label className="mt-1.5 flex items-center gap-2 text-sm text-gray-800">
                      <input type="checkbox" checked={c.veh}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setChecks({ ...checks, [r.id]: { ...c, veh: e.target.checked } })} />
                      <span>I have seen the {vLabel[r.vehicle_type] || r.vehicle_type} in person</span>
                    </label>

                    <input value={c.note}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setChecks({ ...checks, [r.id]: { ...c, note: e.target.value } })}
                      placeholder="note - where you met, what you saw, why rejected"
                      className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />

                    <div className="mt-2 flex flex-wrap gap-2">
                      <button type="button" disabled={busy === r.id || !canVerify}
                        onClick={() => void decide(r, 'VERIFIED')}
                        title={canVerify ? 'Verify this courier' : 'Tick both checks first'}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:bg-gray-300">
                        {busy === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckSquare className="h-3.5 w-3.5" />}
                        Verify
                      </button>
                      <button type="button" disabled={busy === r.id}
                        onClick={() => void decide(r, 'SUSPENDED')}
                        className="rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:bg-gray-300">
                        Suspend
                      </button>
                      <button type="button" disabled={busy === r.id}
                        onClick={() => void decide(r, 'REJECTED')}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:text-gray-400">
                        Reject
                      </button>
                      {r.status !== 'PENDING' && (
                        <button type="button" disabled={busy === r.id}
                          onClick={() => void decide(r, 'PENDING')}
                          className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50">
                          Back to pending
                        </button>
                      )}
                    </div>

                    {!canVerify && (
                      <p className="mt-2 text-xs text-amber-700">
                        Both checks must be ticked before Verify will work. Bambeh never
                        stores the ID number - you look at the card, then tick the box.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
// BAMBEH_END_TOKEN__COURIERSSECTION_FIX563__COMPLETE
