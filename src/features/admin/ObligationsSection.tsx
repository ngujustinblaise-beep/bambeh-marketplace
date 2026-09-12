// BAMBEH_DEPLOY_TOKEN__OBLIGATIONSSECTION_FIX550_CLEAN
/**
 * src/features/admin/ObligationsSection.tsx - Bambeh Admin Command Center
 *
 * FIX550 - BAMBEH PENDING PAYMENTS. What the company owes, and when.
 *
 * Sits on the functions FIX548 installed and FIX549 split by role:
 *   admin_obligations_list()        read, salary rows hidden below admin
 *   bambeh_obligations_summary()    the counts and the monthly figure
 *   admin_obligation_save()         add or edit        - admins only
 *   admin_obligation_mark_paid()    settle and roll forward - admins only
 *   admin_obligation_delete()       remove             - admins only
 *   admin_obligation_history()      what was paid      - admins only
 *   bambeh_obligation_categories()  the 13 suggestions
 *
 * WHAT A MODERATOR SEES
 *   The bills, and which are overdue, so they can chase an admin. No salary
 *   row, no payroll figure, and no edit controls at all. The database
 *   enforces that; this page simply does not draw buttons it knows will be
 *   refused, because a button that always errors is worse than no button.
 *
 * THE MONTHLY NUMBER
 *   Weekly, quarterly and annual items are all normalised to a monthly
 *   figure by the database, so one number answers "what does Bambeh cost to
 *   run". A moderator's copy of that number excludes pay and says so - the
 *   card is labelled, rather than quietly showing a smaller total that looks
 *   like the whole picture.
 *
 * MARKING PAID IS NOT A TOGGLE
 *   It writes a history row and rolls the due date forward by the item's own
 *   cadence. There is no undo, so it asks first and names the amount.
 *
 * LANGUAGE: English only, by decision. Staff chrome, never seen by a user.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Loader2, AlertCircle, RefreshCw, Plus, Pencil, Trash2, Check,
  CalendarClock, ShieldAlert, History, X, Wallet,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { logAction, type AdminRole, type Capabilities } from './lib';

interface Row {
  id: string; category: string; name: string; payee: string | null;
  amount: number; currency: string; cadence: string;
  next_due: string | null; warn_days: number; notes: string | null;
  is_active: boolean; days_until: number | null; state: string;
  last_paid_at: string | null;
}
interface Cat { key: string; label: string }
interface Summary {
  overdue: number; due_today: number; due_soon: number;
  active_items: number; monthly_xaf: number; non_xaf_items: number;
  includes_pay?: boolean; sees_salaries?: boolean;
}
interface Hist {
  id: string; name: string; category: string; amount: number;
  currency: string; paid_for: string | null; paid_at: string; note: string | null;
}

const CADENCES = ['weekly', 'monthly', 'quarterly', 'annual', 'one_off'];

const BLANK = {
  id: null as string | null, category: 'infrastructure', name: '', payee: '',
  amount: '', currency: 'XAF', cadence: 'monthly', next_due: '',
  warn_days: '7', notes: '', is_active: true,
};

const STATE_STYLE: Record<string, string> = {
  overdue:   'border-red-300 bg-red-50',
  due_today: 'border-orange-300 bg-orange-50',
  due_soon:  'border-amber-300 bg-amber-50',
  ok:        'border-gray-200 bg-white',
  no_date:   'border-gray-200 bg-gray-50',
  inactive:  'border-gray-200 bg-gray-100 opacity-60',
};

const STATE_WORD: Record<string, string> = {
  overdue: 'OVERDUE', due_today: 'DUE TODAY', due_soon: 'due soon',
  ok: '', no_date: 'no date set', inactive: 'inactive',
};

interface Props {
  userId: string; role: AdminRole; cap: Capabilities; flash: (m: string) => void;
}

export default function ObligationsSection({ userId, role, flash }: Props) {
  // FIX549 lets moderators READ. Only admins may change anything, so the
  // edit controls are drawn for admins only - the database would refuse a
  // moderator anyway, and a button that always errors is worse than none.
  const mayEdit = role === 'super_admin' || role === 'admin';

  const [rows, setRows]       = useState<Row[]>([]);
  const [cats, setCats]       = useState<Cat[]>([]);
  const [sum, setSum]         = useState<Summary | null>(null);
  const [hist, setHist]       = useState<Hist[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy]       = useState<string | null>(null);
  const [error, setError]     = useState<string | null>(null);
  const [form, setForm]       = useState<typeof BLANK | null>(null);
  const [confirmPay, setPay]  = useState<Row | null>(null);
  const [confirmDel, setDel]  = useState<Row | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [l, s, c] = await Promise.all([
        supabase.rpc('admin_obligations_list'),
        supabase.rpc('bambeh_obligations_summary'),
        supabase.rpc('bambeh_obligation_categories'),
      ]);
      if (l.error) throw l.error;
      if (s.error) throw s.error;
      setRows((l.data || []) as Row[]);
      setSum(s.data as Summary);
      if (!c.error) setCats((c.data || []) as Cat[]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not read the obligations ledger.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const save = async () => {
    if (!form) return;
    if (!form.name.trim()) { setError('Every item needs a name.'); return; }
    setBusy('save');
    setError(null);
    try {
      const { error: e } = await supabase.rpc('admin_obligation_save', {
        p_id:        form.id,
        p_category:  form.category,
        p_name:      form.name.trim(),
        p_payee:     form.payee.trim() || null,
        p_amount:    Number(form.amount || 0),
        p_currency:  form.currency.trim() || 'XAF',
        p_cadence:   form.cadence,
        p_next_due:  form.next_due || null,
        p_warn_days: Number(form.warn_days || 7),
        p_notes:     form.notes.trim() || null,
        p_is_active: form.is_active,
      });
      if (e) throw e;
      await logAction(userId, role, form.id ? 'obligation_edit' : 'obligation_add', null, form.name.trim());
      flash(form.id ? 'Saved.' : 'Added to the ledger.');
      setForm(null);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not save.');
    } finally { setBusy(null); }
  };

  const markPaid = async (r: Row) => {
    setBusy(r.id);
    setError(null);
    try {
      const { data, error: e } = await supabase.rpc('admin_obligation_mark_paid', {
        p_id: r.id, p_amount: null, p_note: null,
      });
      if (e) throw e;
      const d = data as { next_due?: string | null; closed?: boolean };
      await logAction(userId, role, 'obligation_mark_paid', null, r.name);
      flash(d?.closed
        ? r.name + ' settled and closed.'
        : r.name + ' paid. Next due ' + (d?.next_due || 'unknown') + '.');
      setPay(null);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not mark it paid.');
    } finally { setBusy(null); }
  };

  const remove = async (r: Row) => {
    setBusy(r.id);
    setError(null);
    try {
      const { error: e } = await supabase.rpc('admin_obligation_delete', { p_id: r.id });
      if (e) throw e;
      await logAction(userId, role, 'obligation_delete', null, r.name);
      flash(r.name + ' removed. Its payment history is kept.');
      setDel(null);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not remove it.');
    } finally { setBusy(null); }
  };

  const showHistory = async () => {
    setBusy('hist');
    try {
      const { data, error: e } = await supabase.rpc('admin_obligation_history', { p_limit: 100 });
      if (e) throw e;
      setHist((data || []) as Hist[]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not read the history.');
    } finally { setBusy(null); }
  };

  const catLabel = useMemo(() => {
    const m: Record<string, string> = {};
    for (const c of cats) m[c.key] = c.label;
    return m;
  }, [cats]);

  const money = (n: number, cur: string) =>
    Math.round(n).toLocaleString() + ' ' + (cur || 'XAF');

  const seesPay = sum?.includes_pay ?? sum?.sees_salaries ?? mayEdit;

  /* ---------------------------------------------------------------- */

  if (loading) {
    return (
      <div className="py-16 text-center">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-teal-600" />
        <p className="mt-3 text-sm text-gray-500">Reading the ledger...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ------------------------------------------------ header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Bambeh pending payments</h2>
          <p className="mt-1 text-sm text-gray-600">
            Everything Bambeh has to pay to stay alive. An unpaid hosting bill takes the app offline.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={() => void load()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          {mayEdit && (
            <button type="button" onClick={() => { setError(null); setForm({ ...BLANK }); }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 text-sm font-bold text-white hover:bg-teal-700">
              <Plus className="h-4 w-4" /> Add
            </button>
          )}
        </div>
      </div>

      {!mayEdit && (
        <div className="flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            You can see what is due and remind an admin. Salaries and editing are admin-only.
          </span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ------------------------------------------------ the four numbers */}
      {sum && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className={'rounded-xl border p-3 ' + (sum.overdue > 0 ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white')}>
            <p className="text-2xl font-black text-gray-900">{sum.overdue}</p>
            <p className="text-xs text-gray-600">Overdue</p>
          </div>
          <div className={'rounded-xl border p-3 ' + (sum.due_today > 0 ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-white')}>
            <p className="text-2xl font-black text-gray-900">{sum.due_today}</p>
            <p className="text-xs text-gray-600">Due today</p>
          </div>
          <div className={'rounded-xl border p-3 ' + (sum.due_soon > 0 ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-white')}>
            <p className="text-2xl font-black text-gray-900">{sum.due_soon}</p>
            <p className="text-xs text-gray-600">Due soon</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-3">
            <p className="text-lg font-black text-gray-900">
              {Math.round(sum.monthly_xaf).toLocaleString()}
            </p>
            {/* say what the number leaves out rather than imply a full picture */}
            <p className="text-xs text-gray-600">
              XAF / month{seesPay ? '' : ' (pay not included)'}
            </p>
            {sum.non_xaf_items > 0 && (
              <p className="mt-0.5 text-[11px] text-gray-500">
                + {sum.non_xaf_items} item{sum.non_xaf_items === 1 ? '' : 's'} in another currency
              </p>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------ add / edit */}
      {form && mayEdit && (
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4">
          <div className="flex items-center justify-between">
            <p className="font-bold text-gray-900">{form.id ? 'Edit item' : 'New item'}</p>
            <button type="button" onClick={() => setForm(null)} className="text-gray-500 hover:text-gray-700">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold text-gray-600">Name</span>
              <input value={form.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, name: e.target.value })}
                placeholder="Netlify, ENEO light, Awah - Saturdays"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-gray-600">Category</span>
              <select value={form.category}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({ ...form, category: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                {cats.map((c: Cat) => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-gray-600">Amount</span>
              <input value={form.amount} inputMode="decimal"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, amount: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-gray-600">Currency</span>
              <input value={form.currency}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, currency: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-gray-600">How often</span>
              <select value={form.cadence}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({ ...form, cadence: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                {CADENCES.map((c) => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-gray-600">Next due</span>
              <input type="date" value={form.next_due}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, next_due: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-gray-600">Paid to</span>
              <input value={form.payee}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, payee: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-gray-600">Warn me this many days early</span>
              <input value={form.warn_days} inputMode="numeric"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, warn_days: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-semibold text-gray-600">Notes</span>
              <input value={form.notes}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, notes: e.target.value })}
                placeholder="account number, who to call, how it is paid"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </label>
            <label className="flex items-center gap-2 sm:col-span-2">
              <input type="checkbox" checked={form.is_active}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, is_active: e.target.checked })} />
              <span className="text-sm text-gray-700">Still active</span>
            </label>
          </div>
          <button type="button" disabled={busy === 'save'} onClick={() => void save()}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-sm font-bold text-white hover:bg-teal-700 disabled:bg-gray-300">
            {busy === 'save' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Save
          </button>
        </div>
      )}

      {/* ------------------------------------------------ the ledger */}
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
          <Wallet className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-2 font-semibold text-gray-700">Nothing in the ledger yet</p>
          <p className="mt-1 text-sm text-gray-500">
            {mayEdit
              ? 'Add Netlify, Supabase, Claude, light, internet, rent, salaries - whatever Bambeh pays.'
              : 'An admin has not added anything yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((r: Row) => (
            <div key={r.id}
              className={'rounded-xl border p-3 ' + (STATE_STYLE[r.state] || STATE_STYLE.ok)}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900">
                    {r.name}
                    {STATE_WORD[r.state] && (
                      <span className={'ml-2 text-xs font-bold ' +
                        (r.state === 'overdue' ? 'text-red-700'
                          : r.state === 'due_today' ? 'text-orange-700'
                          : r.state === 'due_soon' ? 'text-amber-700' : 'text-gray-500')}>
                        {STATE_WORD[r.state]}
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-600">
                    {catLabel[r.category] || r.category}
                    {' \u00b7 '}{money(r.amount, r.currency)}
                    {' \u00b7 '}{r.cadence.replace('_', ' ')}
                    {r.payee ? ' \u00b7 ' + r.payee : ''}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                    <CalendarClock className="h-3 w-3" />
                    {r.next_due
                      ? r.next_due + (r.days_until === null ? ''
                          : r.days_until < 0 ? ' (' + Math.abs(r.days_until) + ' days late)'
                          : r.days_until === 0 ? ' (today)'
                          : ' (in ' + r.days_until + ' days)')
                      : 'no date set'}
                  </p>
                  {r.notes && <p className="mt-1 text-xs text-gray-500">{r.notes}</p>}
                </div>

                {mayEdit && (
                  <div className="flex shrink-0 gap-1">
                    <button type="button" disabled={busy === r.id} onClick={() => setPay(r)}
                      title="Mark paid"
                      className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:bg-gray-300">
                      {busy === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Paid'}
                    </button>
                    <button type="button" title="Edit"
                      onClick={() => { setError(null); setForm({
                        id: r.id, category: r.category, name: r.name, payee: r.payee || '',
                        amount: String(r.amount), currency: r.currency, cadence: r.cadence,
                        next_due: r.next_due || '', warn_days: String(r.warn_days),
                        notes: r.notes || '', is_active: r.is_active,
                      }); }}
                      className="rounded-lg border border-gray-300 p-1.5 text-gray-600 hover:bg-white">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" title="Remove" onClick={() => setDel(r)}
                      className="rounded-lg border border-gray-300 p-1.5 text-red-600 hover:bg-white">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* marking paid has no undo - name the amount before doing it */}
              {confirmPay?.id === r.id && (
                <div className="mt-2 rounded-lg border border-emerald-300 bg-emerald-50 p-2.5">
                  <p className="text-sm text-emerald-900">
                    Record {money(r.amount, r.currency)} paid for {r.name}?
                    {r.cadence === 'one_off'
                      ? ' This closes it.'
                      : ' The due date moves forward one ' + r.cadence.replace('ly', '') + '.'}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button type="button" disabled={busy === r.id} onClick={() => void markPaid(r)}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:bg-gray-300">
                      Yes, record it
                    </button>
                    <button type="button" onClick={() => setPay(null)}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {confirmDel?.id === r.id && (
                <div className="mt-2 rounded-lg border border-red-300 bg-red-50 p-2.5">
                  <p className="text-sm text-red-900">
                    Remove {r.name} from the ledger? Its payment history is kept.
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button type="button" disabled={busy === r.id} onClick={() => void remove(r)}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 disabled:bg-gray-300">
                      Remove
                    </button>
                    <button type="button" onClick={() => setDel(null)}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ------------------------------------------------ history, admins only */}
      {mayEdit && (
        <div>
          {hist === null ? (
            <button type="button" disabled={busy === 'hist'} onClick={() => void showHistory()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              {busy === 'hist' ? <Loader2 className="h-4 w-4 animate-spin" /> : <History className="h-4 w-4" />}
              What has been paid
            </button>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="font-bold text-gray-900">Payment history</p>
                <button type="button" onClick={() => setHist(null)} className="text-gray-500 hover:text-gray-700">
                  <X className="h-4 w-4" />
                </button>
              </div>
              {hist.length === 0 ? (
                <p className="mt-2 text-sm text-gray-500">Nothing recorded yet.</p>
              ) : (
                <div className="mt-2 divide-y divide-gray-100">
                  {hist.map((h: Hist) => (
                    <div key={h.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                      <span className="truncate text-gray-800">{h.name}</span>
                      <span className="shrink-0 text-gray-500">
                        {money(h.amount, h.currency)}
                        {' \u00b7 '}{new Date(h.paid_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
// BAMBEH_END_TOKEN__OBLIGATIONSSECTION_FIX550__COMPLETE
