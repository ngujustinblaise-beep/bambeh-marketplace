// BAMBEH_DEPLOY_TOKEN__ADMINSHOPS_FIX899_CLEAN
// FILE LOCATION: src/features/admin/AdminShops.tsx (Command Center > Shops)
//
// FIX899 - every seller's shop link (Package 10). "Verified on Bambeh" is given by an admin or the super admin only,
// after a real check - identity seen, phone confirmed, place seen, business papers seen - and the check is kept with
// who and when; nobody verifies their own shop. Removing it needs a reason. Moderators, admins and the super admin can
// hide a shop page (never the adverts), with a reason the seller is told. Database: FIX892.
// (c) 2026 BAMBEH SARL. All rights reserved.

import { useCallback, useEffect, useState } from 'react';
import { ExternalLink, Loader2, RefreshCw, Search, ShieldCheck, Store } from 'lucide-react';
import { adminHide, adminShops, adminVerify, shopShort } from '@/features/shop/shopApi';
import type { AdminShopRow } from '@/features/shop/shopApi';

type View = 'all' | 'verified' | 'unverified' | 'hidden';
const VIEWS: Array<{ key: View; label: string }> = [
  { key: 'all', label: 'All' }, { key: 'verified', label: 'Verified' }, { key: 'unverified', label: 'Not verified' }, { key: 'hidden', label: 'Hidden' },
];
const CHECKS: Array<{ key: string; label: string }> = [
  { key: 'identity', label: 'Identity seen (ID card, in person or on a call)' },
  { key: 'phone', label: 'Phone confirmed (we called the number on the account)' },
  { key: 'place', label: 'Place seen (shop, stall or farm)' },
  { key: 'papers', label: 'Business papers seen (RCCM, taxpayer card)' },
];
const CHECK_SHORT: Record<string, string> = { identity: 'identity', phone: 'phone', place: 'place', papers: 'business papers' };
const REASON: Record<string, string> = {
  admins_only: 'Only an admin or the super admin can do this.',
  staff_only: 'Only Bambeh staff can do this.',
  own_shop: 'Nobody verifies their own shop: another admin must do it.',
  need_check: 'Tick at least one thing you checked.',
  need_note: 'Write the reason (the seller is told).',
  not_found: 'This shop is gone. Refresh the list.',
  network: 'That did not work. Check the connection and try again.',
};
const WHAT: Record<string, string> = {
  created: 'Shop made', link_changed: 'Link changed', renamed: 'Renamed', verified: 'Verified', unverified: 'Verified removed',
  hidden: 'Page hidden', shown: 'Page shown again',
};

function when(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

type Acting = { user: string; what: 'verify' | 'unverify' | 'hide' } | null;

export default function AdminShops({ embedded = false }: { embedded?: boolean }) {
  const [view, setView] = useState<View>('all');
  const [typed, setTyped] = useState('');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<AdminShopRow[]>([]);
  const [counts, setCounts] = useState({ all: 0, verified: 0, unverified: 0, hidden: 0 });
  const [canVerify, setCanVerify] = useState(false);
  const [canHide, setCanHide] = useState(false);
  const [acting, setActing] = useState<Acting>(null);
  const [checks, setChecks] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [working, setWorking] = useState(false);
  const [rowMsg, setRowMsg] = useState<{ user: string; ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const r = await adminShops(q, view);
    setLoading(false);
    if (!r.ok) { setError(REASON[r.reason] || REASON.network); setRows([]); return; }
    setRows(r.rows);
    setCounts(r.counts);
    setCanVerify(r.canVerify);
    setCanHide(r.canHide);
  }, [q, view]);

  useEffect(() => { void load(); }, [load]);

  const start = (user: string, what: 'verify' | 'unverify' | 'hide') => {
    setActing({ user, what });
    setChecks([]);
    setNote('');
    setRowMsg(null);
  };

  const confirm = async () => {
    if (!acting) return;
    setWorking(true);
    const r = acting.what === 'hide' ? await adminHide(acting.user, true, note)
      : await adminVerify(acting.user, acting.what === 'verify', checks, note);
    setWorking(false);
    if (!r.ok) { setRowMsg({ user: acting.user, ok: false, text: REASON[r.reason || 'network'] || REASON.network }); return; }
    const done = acting.what === 'verify' ? 'Verified on Bambeh. The seller is told in the app.'
      : acting.what === 'unverify' ? 'Verified removed. The seller is told why.' : 'Shop page hidden. The seller is told why.';
    setRowMsg({ user: acting.user, ok: true, text: done });
    setActing(null);
    void load();
  };

  const show = async (user: string) => {
    setWorking(true);
    const r = await adminHide(user, false, '');
    setWorking(false);
    setRowMsg({ user, ok: r.ok, text: r.ok ? 'Shop page shown again. The seller is told.' : REASON[r.reason || 'network'] || REASON.network });
    if (r.ok) void load();
  };

  return (
    <div className={embedded ? '' : 'mx-auto max-w-3xl p-4'} data-fix="FIX899">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900"><Store className="h-5 w-5 text-teal-700" /> Shops</h2>
          <p className="mt-1 text-sm text-gray-600">
            Every seller's shop link (bambeh.com/name). Only admins and the super admin give Verified on Bambeh, after a real check;
            moderators can hide a shop page. The seller is told each time, in their language.
          </p>
        </div>
        <button type="button" onClick={() => { void load(); }} className="flex shrink-0 items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-sm" data-refresh="1">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {VIEWS.map((v) => (
          <button key={v.key} type="button" onClick={() => setView(v.key)} data-tab={v.key}
                  className={'rounded-full border px-3 py-1 text-sm ' + (view === v.key ? 'border-teal-700 bg-teal-50 font-bold text-teal-800' : 'border-gray-200 text-gray-700')}>
            {v.label} ({counts[v.key]})
          </button>
        ))}
      </div>
      <form className="mb-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); setQ(typed); }}>
        <input value={typed} onChange={(e) => setTyped(e.target.value.slice(0, 60))} placeholder="Shop name, link or owner" data-search="1"
               className="min-w-0 flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm" />
        <button type="submit" className="flex items-center gap-1 rounded-xl bg-gray-900 px-3 py-2 text-sm font-bold text-white" data-search-go="1">
          <Search className="h-4 w-4" /> Search
        </button>
      </form>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-teal-700" /></div>
      ) : error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" data-error="1">{error}</p>
      ) : rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500" data-none="1">No shop here yet.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((s) => (
            <li key={s.user_id} className="rounded-2xl border border-gray-100 bg-white p-4" data-row={s.user_id}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-gray-900">{s.name}</p>
                  <button type="button" onClick={() => window.open('/#/s/' + encodeURIComponent(s.slug), '_blank', 'noopener')}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-teal-700" data-open={s.slug}>
                    {shopShort(s.slug)} <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                  <p className="text-xs text-gray-500">
                    Owner: {s.owner}{s.mine ? ' (you)' : ''} - made {when(s.created_at)}{s.town ? ' - ' + s.town : ''}
                    {s.aliases.length ? ' - old links: ' + s.aliases.join(', ') : ''}
                  </p>
                  <p className="text-xs text-gray-500">Items for sale: {s.items_total} - visits this week: {s.visits_7d}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {s.verified ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-teal-700 px-2.5 py-0.5 text-xs font-bold text-white" data-badge="verified">
                      <ShieldCheck className="h-3.5 w-3.5" /> Verified
                    </span>
                  ) : null}
                  {s.hidden ? <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900" data-badge="hidden">Page hidden</span> : null}
                  {s.account_off ? <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-800" data-badge="account">Account paused</span> : null}
                </div>
              </div>

              {s.verified ? (
                <p className="mt-2 text-xs text-gray-600">
                  Checked: {s.checks.map((c) => CHECK_SHORT[c] || c).join(', ')} - by {s.verified_by_name || '-'}, {when(s.verified_at)}
                  {s.verify_note ? ' - "' + s.verify_note + '"' : ''}
                </p>
              ) : null}
              {s.hidden && s.hidden_note ? <p className="mt-1 text-xs text-amber-900">Hidden because: {s.hidden_note}</p> : null}

              <div className="mt-3 flex flex-wrap gap-2">
                {canVerify && !s.mine && !s.verified ? (
                  <button type="button" onClick={() => start(s.user_id, 'verify')} data-verify={s.user_id}
                          className="rounded-xl bg-teal-700 px-3 py-1.5 text-sm font-bold text-white">Verify</button>
                ) : null}
                {canVerify && !s.mine && s.verified ? (
                  <button type="button" onClick={() => start(s.user_id, 'unverify')} data-unverify={s.user_id}
                          className="rounded-xl border border-gray-300 px-3 py-1.5 text-sm font-bold text-gray-800">Remove Verified</button>
                ) : null}
                {canHide && !s.hidden ? (
                  <button type="button" onClick={() => start(s.user_id, 'hide')} data-hide={s.user_id}
                          className="rounded-xl border border-gray-300 px-3 py-1.5 text-sm text-gray-800">Hide shop page</button>
                ) : null}
                {canHide && s.hidden ? (
                  <button type="button" onClick={() => { void show(s.user_id); }} disabled={working} data-show={s.user_id}
                          className="rounded-xl border border-gray-300 px-3 py-1.5 text-sm text-gray-800">Show shop page</button>
                ) : null}
                {canVerify && s.mine ? <span className="text-xs text-gray-500">Your own shop: another admin verifies it.</span> : null}
              </div>

              {acting && acting.user === s.user_id ? (
                <div className="mt-3 rounded-xl border-2 border-gray-800 p-3" data-acting={acting.what}>
                  {acting.what === 'verify' ? (
                    <>
                      <p className="text-sm font-bold">What did you check yourself?</p>
                      <div className="mt-2 space-y-1.5">
                        {CHECKS.map((c) => (
                          <label key={c.key} className="flex items-start gap-2 text-sm">
                            <input type="checkbox" checked={checks.indexOf(c.key) >= 0} data-check={c.key}
                                   onChange={(e) => setChecks((xs) => (e.target.checked ? xs.concat(c.key) : xs.filter((x) => x !== c.key)))} />
                            {c.label}
                          </label>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm font-bold">{acting.what === 'unverify' ? 'Why is Verified removed?' : 'Why is the shop page hidden?'} The seller is told.</p>
                  )}
                  <input value={note} onChange={(e) => setNote(e.target.value.slice(0, 300))} data-note="1"
                         placeholder={acting.what === 'verify' ? 'Note for the history (optional)' : 'Reason (needed)'}
                         className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm" />
                  <div className="mt-2 flex gap-2">
                    <button type="button" onClick={() => { void confirm(); }} disabled={working} data-confirm="1"
                            className="flex items-center gap-1 rounded-xl bg-gray-900 px-4 py-2 text-sm font-bold text-white disabled:bg-gray-300">
                      {working ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      {acting.what === 'verify' ? 'Verify this shop' : acting.what === 'unverify' ? 'Remove Verified' : 'Hide the page'}
                    </button>
                    <button type="button" onClick={() => setActing(null)} className="rounded-xl border border-gray-200 px-3 py-2 text-sm" data-cancel="1">Cancel</button>
                  </div>
                </div>
              ) : null}
              {rowMsg && rowMsg.user === s.user_id ? (
                <p className={'mt-2 text-sm ' + (rowMsg.ok ? 'text-green-800' : 'text-red-700')} data-row-msg={rowMsg.ok ? 'ok' : 'err'}>{rowMsg.text}</p>
              ) : null}

              {s.log.length ? (
                <details className="mt-3" data-history="1">
                  <summary className="cursor-pointer text-xs font-semibold text-gray-600">History</summary>
                  <ul className="mt-1 space-y-0.5">
                    {s.log.map((g, i) => (
                      <li key={i} className="text-xs text-gray-600">
                        <b>{WHAT[g.what] || g.what}</b>{g.detail ? ' - ' + g.detail : ''} - {g.by || 'the seller'}, {when(g.at)}
                      </li>
                    ))}
                  </ul>
                </details>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
// BAMBEH_END_TOKEN__ADMINSHOPS_FIX899__COMPLETE
