// BAMBEH_DEPLOY_TOKEN__ADMINZERM_FIX874_CLEAN
// FILE LOCATION: src/features/admin/AdminZerm.tsx   (Command Center > Zerm coins)
//
// FIX874 (replaces FIX852) - ZERM COINS, CONTROLLED FROM THE COMMAND CENTER (server side: FIX845 and FIX859).
// Big, 19 Oct 2026: "add a section on the admin panel where we could switch on coins sales or buying as well as
// coins exchange. only the admin or super admin can do this." and "lets build it but let the coins to money be an
// option in the admin and super admin section for decision".
//   - Earning: always on (rewards are fixed at 0.0025 each, by the reward rules).
//   - Buying coins / Sending coins between members: OFF until Bambeh holds its COBAC licence (or works through a
//     licensed partner). Switching ON needs the word COBAC typed and keeps who and when.
//   - Coins to money (FIX859): OFF by default, same COBAC rule. When ON, members ask to turn coins into money at the
//     rate set here (their coins are set aside at once). Every request waits for an admin or the super admin:
//       PAY  -> the payments server sends the money with CamPay (POST /zerm-cashout, FIX862) and marks it paid; if
//               CamPay refuses, the request is "not paid" and the coins go back to the member;
//       REFUSE -> with a reason the member reads; the coins go back.
//     Nobody decides their own request. A request stuck at "being sent" for 15 minutes or more is settled by hand,
//     after checking CamPay, with a note. Who decided and when is shown on every request. The member is notified.
//   Moderators see everything, read-only; the database refuses their changes as well.
// Staff screen: English, by decision.
// (c) 2026 BAMBEH SARL. All rights reserved.

import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  AlertTriangle, Banknote, CheckCircle2, History, Loader2, Lock, Plus, RefreshCw, Save, Send, ShoppingCart, Trash2, Zap,
} from 'lucide-react';
import {
  adminCashoutPay, adminCashoutRefuse, adminCashoutRules, adminCashoutSettle, adminCashouts, adminOverview, adminRules, adminSwitch,
} from '@/features/coins/zermApi';
import type { CashoutRow, CashoutStatus, CashoutView, ZermOverview, ZermPackage } from '@/features/coins/zermApi';

type SwitchWhat = 'buying' | 'sending' | 'cashout';

const REASON: Record<string, string> = {
  not_allowed: 'Only admins and the super admin can change this.',
  confirm_needed: 'Type COBAC to confirm before switching this on.',
  bad_switch: 'Unknown switch.',
  bad_packages: 'Check the packages: 1 to 6 of them, coins from 0.01, prices whole XAF from 100 to 1,000,000, no two with the same coins.',
  bad_limits: 'Check the sending limits: the minimum from 0.0025, the daily maximum at least the minimum.',
  bad_rate: 'The rate is a whole number of XAF for one coin, from 1 to 100,000.',
  min_below_100: 'The smallest request must bring at least 100 XAF: raise the minimum or the rate (mobile money sends nothing under 100 XAF).',
  need_note: 'Write the reason first - the member reads it.',
  own_request: 'Nobody decides their own request. Another admin will.',
  not_waiting: 'This request is not waiting any more - someone may have handled it. Refresh.',
  not_paying: 'This request is not being sent any more. Refresh.',
  too_soon: 'Wait 15 minutes after "Pay" before settling it by hand: CamPay may still be sending.',
  not_found: 'Request not found. Refresh.',
  not_ready: 'FIX845 / FIX859 has not been run in Supabase yet.',
  network: 'Could not reach the database. Try again.',
};
const CASH_LIMITS = 'Check the limits: the minimum from 0.0025 coins, the daily maximum at least the minimum (up to 10,000 coins).';

const VIEWS: Array<{ key: CashoutView; label: string }> = [
  { key: 'waiting', label: 'Waiting' }, { key: 'paying', label: 'Being sent' }, { key: 'paid', label: 'Paid' },
  { key: 'failed', label: 'Not paid' }, { key: 'refused', label: 'Refused' }, { key: 'cancelled', label: 'Cancelled' }, { key: 'all', label: 'All' },
];
const STATUS_LABEL: Record<CashoutStatus, string> = {
  waiting: 'Waiting', paying: 'Being sent', paid: 'Paid', failed: 'Not paid - coins back', refused: 'Refused - coins back', cancelled: 'Cancelled by the member',
};
const STATUS_TONE: Record<CashoutStatus, string> = {
  waiting: 'bg-amber-100 text-amber-900', paying: 'bg-amber-100 text-amber-900', paid: 'bg-emerald-100 text-emerald-800',
  failed: 'bg-gray-200 text-gray-700', refused: 'bg-gray-200 text-gray-700', cancelled: 'bg-gray-100 text-gray-600',
};

const fmtXaf = (n: number) => (Number(n) || 0).toLocaleString('en-US');
const coinsWord = (n: number) => (Number(n) === 1 ? ' coin' : ' coins');
const fmtCoins = (n: unknown) => (Number(n) || 0).toLocaleString('en-US', { maximumFractionDigits: 4 });
const when = (s: string | null) => {
  if (!s) return '';
  try { return new Date(s).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return s; }
};
const minutesSince = (s: string | null) => {
  const d = new Date(String(s || ''));
  return isNaN(d.getTime()) ? 0 : (Date.now() - d.getTime()) / 60000;
};

function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3">
      <p className="text-[11px] uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-0.5 text-lg font-bold text-gray-900">{value}</p>
      {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

export default function AdminZerm({ embedded = false }: { embedded?: boolean }) {
  const [ov, setOv] = useState<ZermOverview | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [asking, setAsking] = useState<{ what: SwitchWhat; on: boolean } | null>(null);
  const [word, setWord] = useState('');
  const [note, setNote] = useState('');
  const [working, setWorking] = useState(false);
  const [msg, setMsg] = useState<{ text: string; tone: 'red' | 'green' } | null>(null);
  const [pk, setPk] = useState<Array<{ coins: string; price: string }>>([]);
  const [minS, setMinS] = useState('');
  const [maxS, setMaxS] = useState('');
  // coins to money
  const [rateC, setRateC] = useState('');
  const [minC, setMinC] = useState('');
  const [maxC, setMaxC] = useState('');
  const [view, setView] = useState<CashoutView>('waiting');
  const [rows, setRows] = useState<CashoutRow[]>([]);
  const [counts, setCounts] = useState<Partial<Record<CashoutStatus, number>>>({});
  const [canDecide, setCanDecide] = useState(false);
  const [listErr, setListErr] = useState<string | null>(null);
  const [act, setAct] = useState<{ id: string; kind: 'pay' | 'refuse' | 'arrived' | 'lost' } | null>(null);
  const [actNote, setActNote] = useState('');
  const [rowMsg, setRowMsg] = useState<{ id: string; text: string; tone: 'red' | 'green' } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await adminOverview();
    setLoading(false);
    if (!r.ok) { setErr(REASON[r.reason] || r.reason); setOv(null); return; }
    setErr(null);
    setOv(r);
    setPk((r.packages || []).map((p: ZermPackage) => ({ coins: String(p.coins), price: String(p.price) })));
    setMinS(String(r.send_min));
    setMaxS(String(r.send_daily_max));
    setRateC(String(r.cashout_rate ?? 250));
    setMinC(String(r.cashout_min ?? 1));
    setMaxC(String(r.cashout_day_max ?? 4));
  }, []);

  const loadList = useCallback(async (v: CashoutView) => {
    const r = await adminCashouts(v);
    if (!r.ok) { setListErr(REASON[r.reason] || r.reason); setRows([]); return; }
    setListErr(null);
    setRows(Array.isArray(r.rows) ? r.rows : []);
    setCounts(r.counts || {});
    setCanDecide(r.can_decide === true);
  }, []);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { void loadList(view); }, [loadList, view]);

  const refreshAll = () => { void load(); void loadList(view); };

  const flip = async () => {
    if (!asking) return;
    setWorking(true);
    const r = await adminSwitch(asking.what, asking.on, word, note);
    setWorking(false);
    if (!r.ok) { setMsg({ text: REASON[r.reason] || r.reason, tone: 'red' }); return; }
    const name = asking.what === 'buying' ? 'Buying coins' : asking.what === 'sending' ? 'Sending coins' : 'Coins to money';
    setMsg({ text: name + ' is now ' + (asking.on ? 'ON' : 'off') + '.', tone: 'green' });
    setAsking(null); setWord(''); setNote('');
    void load();
  };

  const saveRules = async () => {
    const packages = pk.map((p) => ({ coins: Number(p.coins.replace(',', '.')), price: Number(p.price) }));
    setWorking(true);
    const r = await adminRules(packages, Number(minS.replace(',', '.')), Number(maxS.replace(',', '.')));
    setWorking(false);
    if (!r.ok) { setMsg({ text: REASON[r.reason] || r.reason, tone: 'red' }); return; }
    setMsg({ text: 'Prices and limits saved.', tone: 'green' });
    void load();
  };

  const saveCashRules = async () => {
    setWorking(true);
    const r = await adminCashoutRules(Number(rateC), Number(minC.replace(',', '.')), Number(maxC.replace(',', '.')));
    setWorking(false);
    if (!r.ok) { setMsg({ text: r.reason === 'bad_limits' ? CASH_LIMITS : REASON[r.reason] || r.reason, tone: 'red' }); return; }
    setMsg({ text: 'Coins to money: rate and limits saved.', tone: 'green' });
    void load();
  };

  const decide = async (row: CashoutRow) => {
    if (!act || act.id !== row.id) return;
    setWorking(true);
    setRowMsg(null);
    if (act.kind === 'pay') {
      const r = await adminCashoutPay(row.id);
      setWorking(false);
      setRowMsg({ id: row.id, text: r.message, tone: r.ok ? 'green' : 'red' });
    } else {
      const r = act.kind === 'refuse' ? await adminCashoutRefuse(row.id, actNote) : await adminCashoutSettle(row.id, act.kind === 'arrived', actNote);
      setWorking(false);
      if (!r.ok) { setRowMsg({ id: row.id, text: REASON[r.reason] || r.reason, tone: 'red' }); return; }
      setRowMsg({ id: row.id, text: act.kind === 'refuse' ? 'Refused. The coins went back to the member, who is told why.'
        : act.kind === 'arrived' ? 'Marked paid. The member is told.' : 'Marked not paid. The coins went back to the member.', tone: 'green' });
    }
    setAct(null); setActNote('');
    void load(); void loadList(view);
  };

  const can = !!ov?.can_change;

  const SwitchCard = ({ what, title, icon, body }: { what: SwitchWhat; title: string; icon: ReactNode; body: string }) => {
    const on = !!ov && (what === 'buying' ? ov.buying : what === 'sending' ? ov.sending : ov.cashout);
    return (
      <div className={'rounded-2xl border p-4 ' + (on ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-white')} data-switch={what} data-on={on ? '1' : '0'}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className={'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ' + (on ? 'bg-amber-200 text-amber-900' : 'bg-gray-100 text-gray-600')}>{icon}</span>
            <div>
              <p className="font-semibold text-gray-900">{title}</p>
              <p className="mt-0.5 text-xs text-gray-600">{body}</p>
            </div>
          </div>
          <span className={'shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ' + (on ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-700')}>{on ? 'ON' : 'OFF'}</span>
        </div>
        <div className="mt-3">
          {can ? (
            <button type="button" onClick={() => { setAsking({ what, on: !on }); setWord(''); setNote(''); setMsg(null); }} data-flip={what}
                    className={'rounded-xl px-3 py-2 text-xs font-bold ' + (on ? 'bg-gray-800 text-white' : 'bg-teal-600 text-white')}>
              {on ? 'Switch off' : 'Switch on'}
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-gray-500"><Lock className="h-3.5 w-3.5" /> Switch on / off (admins)</span>
          )}
        </div>
      </div>
    );
  };

  const askingName = (w: SwitchWhat) => (w === 'buying' ? 'buying coins' : w === 'sending' ? 'sending coins between members' : 'coins to money');

  return (
    <div className={'space-y-4 ' + (embedded ? '' : 'mx-auto max-w-4xl p-4')} data-fix="FIX874" data-admin-zerm="1">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900"><Zap className="h-5 w-5 text-amber-500" /> Zerm coins</h1>
          <p className="mt-1 text-sm text-gray-500">
            Coins are earned in Bambeh. Buying, sending and coins to money stay OFF until Bambeh holds a COBAC licence (or works through a
            licensed partner): a coin that can be bought, passed on or turned into money is e-money. Only admins and the super admin decide.
          </p>
        </div>
        <button type="button" onClick={refreshAll} className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700">
          <RefreshCw className={'h-3.5 w-3.5 ' + (loading ? 'animate-spin' : '')} /> Refresh
        </button>
      </div>

      {err && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900" data-error="1">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {err}
        </div>
      )}
      {msg && (
        <div className={'rounded-xl border p-3 text-sm ' + (msg.tone === 'green' ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-red-200 bg-red-50 text-red-800')} data-msg={msg.tone}>
          {msg.text}
        </div>
      )}

      {loading && !ov && (
        <div className="flex items-center gap-2 py-10 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>
      )}

      {ov && (
        <>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4" data-switch="earning">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-200 text-emerald-900"><CheckCircle2 className="h-5 w-5" /></span>
                  <div>
                    <p className="font-semibold text-gray-900">Earning coins</p>
                    <p className="mt-0.5 text-xs text-gray-600">Daily check-in, adverts, invited friends: 0.0025 each, by the reward rules. One whole coin = a week of premium.</p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white">ON</span>
              </div>
            </div>
            <SwitchCard what="buying" title="Buying coins" icon={<ShoppingCart className="h-5 w-5" />}
                        body="Members buy the packages below with MTN or Orange Money. Coins are credited by the database after the payment is confirmed." />
            <SwitchCard what="sending" title="Sending coins between members" icon={<Send className="h-5 w-5" />}
                        body="A member sends coins to another member, within the limits below. Coins cannot be taken back." />
            <SwitchCard what="cashout" title="Coins to money" icon={<Banknote className="h-5 w-5" />}
                        body="Members ask to turn coins into money at the rate below. An admin checks and pays each request (MTN / Orange through CamPay) or refuses it with a reason - the coins go back." />
          </div>
          {ov.updated_by_name && <p className="text-xs text-gray-500">Last change: {ov.updated_by_name}, {when(ov.updated_at)}</p>}

          {asking && (
            <div className="rounded-2xl border-2 border-gray-800 bg-white p-4" data-asking={asking.what}>
              <p className="font-semibold text-gray-900">{asking.on ? 'Switch ON ' : 'Switch off '}{askingName(asking.what)}?</p>
              {asking.on ? (
                <>
                  <p className="mt-1 text-sm text-gray-600">
                    Only switch this on once Bambeh holds its COBAC licence (or works through a licensed partner). Type <b>COBAC</b> to confirm.
                  </p>
                  <input value={word} onChange={(e) => setWord(e.target.value)} placeholder="COBAC" data-word="1"
                         className="mt-2 w-40 rounded-xl border border-gray-300 px-3 py-2 text-sm uppercase" />
                </>
              ) : (
                <p className="mt-1 text-sm text-gray-600">
                  {asking.what === 'cashout'
                    ? 'Members can no longer ask. Requests already made stay in the list below: pay or refuse them.'
                    : 'Members can no longer start new ' + (asking.what === 'buying' ? 'purchases' : 'sends') + '. Coins already paid for are still credited.'}
                </p>
              )}
              <input value={note} onChange={(e) => setNote(e.target.value.slice(0, 300))} placeholder="Note for the history (optional)" data-note="1"
                     className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm" />
              <div className="mt-3 flex gap-2">
                <button type="button" disabled={working || (asking.on && word.trim().toUpperCase() !== 'COBAC')} onClick={() => void flip()} data-confirm="1"
                        className="flex items-center gap-1 rounded-xl bg-gray-900 px-4 py-2 text-sm font-bold text-white disabled:bg-gray-300">
                  {working && <Loader2 className="h-4 w-4 animate-spin" />} {asking.on ? 'Switch on' : 'Switch off'}
                </button>
                <button type="button" onClick={() => setAsking(null)} className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700">Cancel</button>
              </div>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <Stat label="Wallets" value={ov.wallets} />
            <Stat label="Coins in wallets" value={fmtCoins(ov.coins_total)} />
            <Stat label="Earned, 7 days" value={fmtCoins(ov.earned_7d)} hint="rewards only" />
            <Stat label="Used for premium, 7 days" value={fmtCoins(ov.used_7d)} />
            <Stat label="Coin orders paid" value={ov.orders_paid} hint={fmtXaf(ov.orders_paid_xaf) + ' XAF in all'} />
            <Stat label="Sent, 7 days" value={ov.sent_7d} hint={fmtCoins(ov.sent_7d_coins) + coinsWord(ov.sent_7d_coins)} />
            <Stat label="Coins to money waiting" value={Number(ov.cashout_waiting) || 0} hint={(Number(ov.cashout_paying) || 0) + ' being sent'} />
            <Stat label="Coins to money paid, 7 days" value={Number(ov.cashout_paid_7d) || 0}
                  hint={fmtXaf(ov.cashout_paid_7d_xaf) + ' XAF sent (' + fmtXaf(ov.cashout_paid_xaf) + ' in all)'} />
          </div>
          {(ov.orders_waiting > 0 || ov.orders_problem > 0) && (
            <p className="text-xs text-gray-600" data-orders-note="1">
              Coin orders waiting for payment (last 24 hours): {ov.orders_waiting}. Failed or paid less than the price: {ov.orders_problem}.
            </p>
          )}

          {/* ------------------------------------------------------------ coins to money: the requests */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4" data-cashouts="1">
            <p className="flex items-center gap-2 font-semibold text-gray-900"><Banknote className="h-4 w-4 text-teal-700" /> Coins to money - requests</p>
            <p className="mt-0.5 text-xs text-gray-500">
              The member's coins are set aside when they ask. Pay sends the money with CamPay (Bambeh pays CamPay's 1% so the member gets the full
              amount); refuse gives the coins back with your reason. {canDecide ? '' : 'Moderators see the list; admins decide.'}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {VIEWS.map((v) => {
                const n = v.key === 'all' ? null : counts[v.key as CashoutStatus];
                return (
                  <button key={v.key} type="button" onClick={() => { setView(v.key); setAct(null); setRowMsg(null); }} data-view={v.key}
                          className={'rounded-full border px-3 py-1 text-xs font-semibold ' + (view === v.key ? 'border-teal-700 bg-teal-50 text-teal-900' : 'border-gray-200 text-gray-600')}>
                    {v.label}{n ? ' (' + n + ')' : ''}
                  </button>
                );
              })}
            </div>
            {listErr && <p className="mt-3 text-sm text-red-700" data-list-error="1">{listErr}</p>}
            {!listErr && rows.length === 0 && <p className="mt-3 text-sm text-gray-500" data-none="1">No request here.</p>}
            <ul className="mt-3 space-y-3">
              {rows.map((c) => {
                const stuck = c.status === 'paying' && minutesSince(c.paying_since) >= 15;
                const open = act && act.id === c.id ? act : null;
                return (
                  <li key={c.id} className="rounded-xl border border-gray-100 p-3" data-cashout={c.id} data-status={c.status}>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900">{c.member}{c.mine ? ' (you)' : ''}</p>
                        <p className="text-sm text-gray-700">
                          {fmtCoins(c.coins)}{coinsWord(c.coins)} x {fmtXaf(c.rate)} = <b>{fmtXaf(c.amount_xaf)} XAF</b> to {c.phone || '-'}
                          <span className="text-xs text-gray-500"> (CamPay sends {fmtXaf(c.gross_xaf)})</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          Asked {when(c.created_at)}. Wallet now: {c.balance === null ? '-' : fmtCoins(c.balance)} coins. Earned in 30 days: {fmtCoins(c.earned_30d)}.
                          {' '}Paid before: {c.paid_before}.
                        </p>
                      </div>
                      <span className={'shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ' + STATUS_TONE[c.status]}>{STATUS_LABEL[c.status]}</span>
                    </div>
                    {(c.decided_by_name || c.paid_at || c.note || c.failure) && (
                      <p className="mt-2 text-xs text-gray-600" data-decided="1">
                        {c.decided_by_name ? 'Decided by ' + c.decided_by_name + ', ' + when(c.decided_at) + '. ' : ''}
                        {c.paid_at ? 'Paid ' + when(c.paid_at) + '. ' : ''}
                        {c.campay_ref ? 'CamPay ' + c.campay_ref + '. ' : ''}
                        {c.note ? 'Note: ' + c.note + ' ' : ''}
                        {c.failure ? 'Why not paid: ' + c.failure : ''}
                      </p>
                    )}
                    {c.status === 'paying' && !stuck && (
                      <p className="mt-2 text-xs text-amber-800">Being sent since {when(c.paying_since)}. If it is still here after 15 minutes, check CamPay and settle it by hand.</p>
                    )}

                    {canDecide && c.mine && (c.status === 'waiting' || stuck) && (
                      <p className="mt-2 text-xs text-gray-500">Your own request: another admin decides.</p>
                    )}
                    {canDecide && !c.mine && c.status === 'waiting' && !open && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button type="button" onClick={() => { setAct({ id: c.id, kind: 'pay' }); setActNote(''); setRowMsg(null); }} data-pay={c.id}
                                className="rounded-xl bg-teal-700 px-3 py-2 text-xs font-bold text-white">Pay {fmtXaf(c.amount_xaf)} XAF</button>
                        <button type="button" onClick={() => { setAct({ id: c.id, kind: 'refuse' }); setActNote(''); setRowMsg(null); }} data-refuse={c.id}
                                className="rounded-xl border border-gray-300 px-3 py-2 text-xs font-bold text-gray-800">Refuse</button>
                      </div>
                    )}
                    {canDecide && !c.mine && stuck && !open && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button type="button" onClick={() => { setAct({ id: c.id, kind: 'arrived' }); setActNote(''); setRowMsg(null); }} data-arrived={c.id}
                                className="rounded-xl border border-emerald-600 px-3 py-2 text-xs font-bold text-emerald-800">The money arrived</button>
                        <button type="button" onClick={() => { setAct({ id: c.id, kind: 'lost' }); setActNote(''); setRowMsg(null); }} data-lost={c.id}
                                className="rounded-xl border border-gray-300 px-3 py-2 text-xs font-bold text-gray-800">It did not arrive</button>
                      </div>
                    )}

                    {open && (
                      <div className="mt-3 rounded-xl border-2 border-gray-800 p-3" data-deciding={open.kind}>
                        {open.kind === 'pay' ? (
                          <p className="text-sm text-gray-800">
                            Send <b>{fmtXaf(c.amount_xaf)} XAF</b> to {c.member} ({c.phone || '-'}) now? CamPay sends {fmtXaf(c.gross_xaf)} XAF; this cannot be undone.
                          </p>
                        ) : (
                          <>
                            <p className="text-sm text-gray-800">
                              {open.kind === 'refuse' ? 'Why is this request refused? The member reads it; the coins go back.'
                                : open.kind === 'arrived' ? 'You checked CamPay and the money arrived. Write what you checked (for example the CamPay reference).'
                                : 'You checked CamPay and the money did not arrive. Write what you checked. The coins go back to the member.'}
                            </p>
                            <textarea value={actNote} onChange={(e) => setActNote(e.target.value.slice(0, 300))} rows={2} data-act-note="1"
                                      className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm" />
                          </>
                        )}
                        <div className="mt-2 flex gap-2">
                          <button type="button" disabled={working || (open.kind !== 'pay' && !actNote.trim())} onClick={() => void decide(c)} data-act-go="1"
                                  className="flex items-center gap-1 rounded-xl bg-gray-900 px-3 py-2 text-xs font-bold text-white disabled:bg-gray-300">
                            {working && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            {open.kind === 'pay' ? 'Yes, pay now' : open.kind === 'refuse' ? 'Refuse and give the coins back'
                              : open.kind === 'arrived' ? 'Mark paid' : 'Mark not paid'}
                          </button>
                          <button type="button" onClick={() => setAct(null)} className="rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-700">Cancel</button>
                        </div>
                      </div>
                    )}
                    {rowMsg && rowMsg.id === c.id && (
                      <p className={'mt-2 text-xs ' + (rowMsg.tone === 'green' ? 'text-emerald-800' : 'text-red-700')} data-row-msg={rowMsg.tone}>{rowMsg.text}</p>
                    )}
                  </li>
                );
              })}
            </ul>
            {rowMsg && !rows.some((r) => r.id === rowMsg.id) && (
              <p className={'mt-2 text-sm ' + (rowMsg.tone === 'green' ? 'text-emerald-800' : 'text-red-700')} data-row-msg={rowMsg.tone}>{rowMsg.text}</p>
            )}
          </div>

          {/* ------------------------------------------------------------ coins to money: rate and limits */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4" data-cash-rules="1">
            <p className="font-semibold text-gray-900">Coins to money: rate and limits</p>
            <p className="mt-0.5 text-xs text-gray-500">
              What one coin brings, the smallest request and the most coins a member can turn into money in a day. Mobile money sends nothing
              under 100 XAF, so the smallest request must bring at least that.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-700">
              <span>1 coin =</span>
              <input value={rateC} disabled={!can} onChange={(e) => setRateC(e.target.value.replace(/\D/g, ''))} aria-label="cashout rate"
                     className="w-24 rounded-xl border border-gray-300 px-3 py-2 text-sm" />
              <span>XAF. From</span>
              <input value={minC} disabled={!can} onChange={(e) => setMinC(e.target.value)} aria-label="cashout minimum"
                     className="w-20 rounded-xl border border-gray-300 px-3 py-2 text-sm" />
              <span>coins a request, up to</span>
              <input value={maxC} disabled={!can} onChange={(e) => setMaxC(e.target.value)} aria-label="cashout daily maximum"
                     className="w-20 rounded-xl border border-gray-300 px-3 py-2 text-sm" />
              <span>coins a day per member.</span>
            </div>
            {can ? (
              <button type="button" disabled={working} onClick={() => void saveCashRules()} data-save-cash-rules="1"
                      className="mt-3 flex items-center gap-1 rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white disabled:bg-teal-300">
                <Save className="h-4 w-4" /> Save rate and limits
              </button>
            ) : (
              <p className="mt-3 inline-flex items-center gap-1 text-xs text-gray-500"><Lock className="h-3.5 w-3.5" /> Rate and limits (admins)</p>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4" data-rules="1">
            <p className="font-semibold text-gray-900">Prices and limits</p>
            <p className="mt-0.5 text-xs text-gray-500">
              Used only while buying / sending is ON. One whole coin = a week of premium, and the weekly plan costs 500 XAF: a coin priced
              under 500 XAF undercuts the subscription. Mobile money takes nothing under 100 XAF.
            </p>
            <div className="mt-3 space-y-2">
              {pk.map((p, i) => (
                <div key={i} className="flex flex-wrap items-center gap-2" data-pk-row={i}>
                  <input value={p.coins} disabled={!can} onChange={(e) => setPk(pk.map((x, j) => (j === i ? { ...x, coins: e.target.value } : x)))}
                         className="w-24 rounded-xl border border-gray-300 px-3 py-2 text-sm" aria-label="coins" />
                  <span className="text-sm text-gray-600">coins for</span>
                  <input value={p.price} disabled={!can} onChange={(e) => setPk(pk.map((x, j) => (j === i ? { ...x, price: e.target.value.replace(/\D/g, '') } : x)))}
                         className="w-32 rounded-xl border border-gray-300 px-3 py-2 text-sm" aria-label="price" />
                  <span className="text-sm text-gray-600">XAF</span>
                  {can && pk.length > 1 && (
                    <button type="button" onClick={() => setPk(pk.filter((_, j) => j !== i))} aria-label="Remove" className="rounded-lg p-1.5 text-red-500 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              {can && pk.length < 6 && (
                <button type="button" onClick={() => setPk([...pk, { coins: '', price: '' }])} className="flex items-center gap-1 text-xs font-semibold text-teal-700">
                  <Plus className="h-3.5 w-3.5" /> Add a package
                </button>
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-700">
              <span>Send at least</span>
              <input value={minS} disabled={!can} onChange={(e) => setMinS(e.target.value)} className="w-24 rounded-xl border border-gray-300 px-3 py-2 text-sm" aria-label="send minimum" />
              <span>coins, at most</span>
              <input value={maxS} disabled={!can} onChange={(e) => setMaxS(e.target.value)} className="w-24 rounded-xl border border-gray-300 px-3 py-2 text-sm" aria-label="send daily maximum" />
              <span>a day per member.</span>
            </div>
            {can ? (
              <button type="button" disabled={working} onClick={() => void saveRules()} data-save-rules="1"
                      className="mt-3 flex items-center gap-1 rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white disabled:bg-teal-300">
                <Save className="h-4 w-4" /> Save prices and limits
              </button>
            ) : (
              <p className="mt-3 inline-flex items-center gap-1 text-xs text-gray-500"><Lock className="h-3.5 w-3.5" /> Prices and limits (admins)</p>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4" data-history="1">
            <p className="flex items-center gap-2 font-semibold text-gray-900"><History className="h-4 w-4" /> History</p>
            {ov.log.length === 0 ? (
              <p className="mt-2 text-sm text-gray-500">No change yet.</p>
            ) : (
              <ul className="mt-2 divide-y divide-gray-100">
                {ov.log.map((l, i) => (
                  <li key={i} className="py-2 text-sm">
                    <span className="font-semibold text-gray-900">{l.what}</span>
                    <span className="text-gray-500"> - {l.by || 'staff'}, {when(l.at)}</span>
                    {l.detail && <p className="text-xs text-gray-500 break-all">{l.detail}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
// BAMBEH_END_TOKEN__ADMINZERM_FIX874__COMPLETE
