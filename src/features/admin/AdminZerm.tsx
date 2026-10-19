// BAMBEH_DEPLOY_TOKEN__ADMINZERM_FIX852_CLEAN
// FILE LOCATION: src/features/admin/AdminZerm.tsx   (Command Center > Zerm coins)
//
// FIX852 - ZERM COINS, CONTROLLED FROM THE COMMAND CENTER (server side: FIX845).
// Big, 19 Oct 2026: "add a section on the admin panel where we could switch on coins sales or buying as well as
// coins exchange. only the admin or super admin can do this."
//   - Earning: always on (rewards are fixed at 0.0025 each, by the reward rules).
//   - Buying coins: OFF until Bambeh holds its COBAC licence (or works through a licensed partner). Switching it ON
//     needs the word COBAC typed and keeps who and when. When on, members pay the package prices set here, and the
//     database credits the coins only after the mobile money payment is confirmed.
//   - Sending coins between members: same rule; the sender is always the signed-in member, with a minimum per send
//     and a maximum per member per day (set here).
//   - Cash-out (coins back into money) is not built: it is the heart of e-money and waits for the licence.
//   Moderators see everything, read-only; the database refuses their changes as well.
// Staff screen: English, by decision.
// (c) 2026 BAMBEH SARL. All rights reserved.

import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, History, Loader2, Lock, Plus, RefreshCw, Save, Send, ShoppingCart, Trash2, Zap } from 'lucide-react';
import { adminOverview, adminRules, adminSwitch } from '@/features/coins/zermApi';
import type { ZermOverview, ZermPackage } from '@/features/coins/zermApi';

const REASON: Record<string, string> = {
  not_allowed: 'Only admins and the super admin can change this.',
  confirm_needed: 'Type COBAC to confirm before switching this on.',
  bad_switch: 'Unknown switch.',
  bad_packages: 'Check the packages: 1 to 6 of them, coins from 0.01, prices whole XAF from 100 to 1,000,000, no two with the same coins.',
  bad_limits: 'Check the sending limits: the minimum from 0.0025, the daily maximum at least the minimum.',
  not_ready: 'FIX845 has not been run in Supabase yet.',
  network: 'Could not reach the database. Try again.',
};

const fmtXaf = (n: number) => (Number(n) || 0).toLocaleString('en-US');
const fmtCoins = (n: unknown) => (Number(n) || 0).toLocaleString('en-US', { maximumFractionDigits: 4 });
const when = (s: string | null) => {
  if (!s) return '';
  try { return new Date(s).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return s; }
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
  const [asking, setAsking] = useState<{ what: 'buying' | 'sending'; on: boolean } | null>(null);
  const [word, setWord] = useState('');
  const [note, setNote] = useState('');
  const [working, setWorking] = useState(false);
  const [msg, setMsg] = useState<{ text: string; tone: 'red' | 'green' } | null>(null);
  const [pk, setPk] = useState<Array<{ coins: string; price: string }>>([]);
  const [minS, setMinS] = useState('');
  const [maxS, setMaxS] = useState('');

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
  }, []);

  useEffect(() => { void load(); }, [load]);

  const flip = async () => {
    if (!asking) return;
    setWorking(true);
    const r = await adminSwitch(asking.what, asking.on, word, note);
    setWorking(false);
    if (!r.ok) { setMsg({ text: REASON[r.reason] || r.reason, tone: 'red' }); return; }
    setMsg({ text: (asking.what === 'buying' ? 'Buying coins' : 'Sending coins') + ' is now ' + (asking.on ? 'ON' : 'off') + '.', tone: 'green' });
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

  const can = !!ov?.can_change;

  const SwitchCard = ({ what, title, icon, body }: { what: 'buying' | 'sending'; title: string; icon: ReactNode; body: string }) => {
    const on = !!ov && (what === 'buying' ? ov.buying : ov.sending);
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

  return (
    <div className={'space-y-4 ' + (embedded ? '' : 'mx-auto max-w-4xl p-4')} data-fix="FIX852" data-admin-zerm="1">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900"><Zap className="h-5 w-5 text-amber-500" /> Zerm coins</h1>
          <p className="mt-1 text-sm text-gray-500">
            Coins are earned in Bambeh. Buying and sending stay OFF until Bambeh holds a COBAC licence (or works through a licensed
            partner): a coin that can be bought or passed on for value is e-money. Cash-out is not built.
          </p>
        </div>
        <button type="button" onClick={() => void load()} className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700">
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
          <div className="grid gap-3 md:grid-cols-3">
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
          </div>
          {ov.updated_by_name && <p className="text-xs text-gray-500">Last change: {ov.updated_by_name}, {when(ov.updated_at)}</p>}

          {asking && (
            <div className="rounded-2xl border-2 border-gray-800 bg-white p-4" data-asking={asking.what}>
              <p className="font-semibold text-gray-900">
                {asking.on ? 'Switch ON ' : 'Switch off '}{asking.what === 'buying' ? 'buying coins' : 'sending coins between members'}?
              </p>
              {asking.on ? (
                <>
                  <p className="mt-1 text-sm text-gray-600">
                    Only switch this on once Bambeh holds its COBAC licence (or works through a licensed partner). Type <b>COBAC</b> to confirm.
                  </p>
                  <input value={word} onChange={(e) => setWord(e.target.value)} placeholder="COBAC" data-word="1"
                         className="mt-2 w-40 rounded-xl border border-gray-300 px-3 py-2 text-sm uppercase" />
                </>
              ) : (
                <p className="mt-1 text-sm text-gray-600">Members can no longer start new {asking.what === 'buying' ? 'purchases' : 'sends'}. Coins already paid for are still credited.</p>
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

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <Stat label="Wallets" value={ov.wallets} />
            <Stat label="Coins in wallets" value={fmtCoins(ov.coins_total)} />
            <Stat label="Earned, 7 days" value={fmtCoins(ov.earned_7d)} hint="rewards only" />
            <Stat label="Used for premium, 7 days" value={fmtCoins(ov.used_7d)} />
            <Stat label="Coin orders paid" value={ov.orders_paid} hint={fmtXaf(ov.orders_paid_xaf) + ' XAF in all'} />
            <Stat label="Sent, 7 days" value={ov.sent_7d} hint={fmtCoins(ov.sent_7d_coins) + ' coins'} />
          </div>
          {(ov.orders_waiting > 0 || ov.orders_problem > 0) && (
            <p className="text-xs text-gray-600" data-orders-note="1">
              Coin orders waiting for payment (last 24 hours): {ov.orders_waiting}. Failed or paid less than the price: {ov.orders_problem}.
            </p>
          )}

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
// BAMBEH_END_TOKEN__ADMINZERM_FIX852__COMPLETE
