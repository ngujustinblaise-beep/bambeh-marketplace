// BAMBEH_DEPLOY_TOKEN__COINSTRANSFER_FIX850_CLEAN
/**
 * CoinsTransfer.tsx - Bambeh Marketplace
 * FILE LOCATION: src/routes/groups/payments/CoinsTransfer.tsx  (routed at /coins/transfer)
 *
 * FIX850 (replaces FIX110) - SENDING ZERM COINS ONLY WHEN AN ADMIN HAS SWITCHED IT ON.
 *   The FIX110 page moved coins to anybody by e-mail and, when its database function was missing, wrote BOTH
 *   wallets from the phone. Now:
 *   - sending switched OFF (the default, Command Center > Zerm coins): the explanation page (FIX848);
 *   - sending switched ON: who (username, e-mail, or the number the account was opened with) -> Check (the
 *     member's name comes back) -> Send. bambeh_zerm_send() (FIX845) takes the sender from the session - never
 *     from the phone - and keeps the minimum per send and the maximum per day the admins set.
 * Five languages (FIX846), right-to-left for Arabic.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Loader2, Send, AlertTriangle, Zap } from 'lucide-react';
import { useLang } from '@/hooks/useAppLang';
import ZermEarnOnly from '@/features/coins/ZermEarnOnly';
import { ZERM_STR, zermLang, zermFill, fmtCoins, coinsLabel } from '@/features/coins/zermText';
import type { ZermKey } from '@/features/coins/zermText';
import { findMember, myBalance, sendCoins, useZermState } from '@/features/coins/zermApi';
import type { ZermFail } from '@/features/coins/zermApi';

export default function CoinsTransfer() {
  const navigate = useNavigate();
  const lang = zermLang(useLang());
  const t = ZERM_STR[lang];
  const rtl = lang === 'ar';
  const { state, loading, refresh } = useZermState();

  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [name, setName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState<{ name: string; amount: number; balance: number } | null>(null);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => { void myBalance().then(setBalance); }, []);

  const failText = (r: ZermFail) => {
    const k = ('r_' + r.reason) as ZermKey;
    return zermFill(t[k] || t.r_network, {
      min: fmtCoins(r.min ?? state.send_min), left: fmtCoins(r.left ?? 0), balance: fmtCoins(r.balance ?? balance ?? 0),
    });
  };

  const amt = Number(String(amount).replace(',', '.'));
  const amountOk = Number.isFinite(amt) && amt > 0;

  const check = async () => {
    setErr(''); setName(null);
    if (!to.trim()) return;
    setBusy(true);
    const r = await findMember(to.trim());
    setBusy(false);
    if (!r.ok) { setErr(failText(r)); return; }
    setName(r.name);
  };

  const send = async () => {
    setErr('');
    setBusy(true);
    const r = await sendCoins(to.trim(), amt, note.trim());
    setBusy(false);
    if (!r.ok) { setErr(failText(r)); setName(null); return; }
    setDone({ name: r.name, amount: Number(r.amount), balance: Number(r.balance) });
    setBalance(Number(r.balance));
    void refresh();
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-2 text-sm text-gray-500" dir={rtl ? 'rtl' : 'ltr'}>
        <Loader2 className="h-5 w-5 animate-spin text-teal-600" /> {t.loading}
      </div>
    );
  }
  if (!state.sending) return <ZermEarnOnly mode="send" />;

  return (
    <div className="min-h-screen bg-gray-50 pb-24" dir={rtl ? 'rtl' : 'ltr'} data-fix="FIX850">
      <div className="bg-gradient-to-br from-teal-600 to-teal-700 px-4 pb-8 pt-6 text-white">
        <button onClick={() => navigate('/coins')} className="mb-4 flex items-center gap-1 text-sm text-white/85 hover:text-white">
          <ArrowLeft className={`h-4 w-4 ${rtl ? 'rotate-180' : ''}`} /> {t.back}
        </button>
        <h1 className="flex items-center gap-2 text-xl font-bold"><Send className="h-6 w-6 text-yellow-300" /> {t.sendHead}</h1>
        <p className="mt-2 text-sm text-teal-50">{t.sendLead}</p>
        <p className="mt-2 flex items-center gap-1 text-sm font-semibold"><Zap className="h-4 w-4 text-yellow-300" /> {zermFill(t.yourCoins, { balance: fmtCoins(balance ?? 0) })}</p>
      </div>

      <div className="mx-auto -mt-4 max-w-lg space-y-4 px-4">
        {done ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center" data-sent="1">
            <CheckCircle2 className="mx-auto mb-2 h-10 w-10 text-emerald-600" />
            <p className="font-semibold text-emerald-900">
              {zermFill(t.sent, { coins: coinsLabel(t, done.amount), name: done.name, balance: fmtCoins(done.balance) })}
            </p>
            <button type="button" onClick={() => navigate('/coins')} className="mt-4 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white">{t.wallet}</button>
          </div>
        ) : (
          <div className="space-y-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <label className="block text-xs font-semibold text-gray-700">{t.toLabel}
              <input value={to} onChange={(e) => { setTo(e.target.value); setName(null); }} placeholder={t.toPh} data-to="1"
                     className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none" />
            </label>
            <label className="block text-xs font-semibold text-gray-700">{t.amountLabel}
              <input value={amount} onChange={(e) => { setAmount(e.target.value.replace(/[^0-9.,]/g, '')); setName(null); }} inputMode="decimal" data-amount="1"
                     className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none" dir="ltr" />
            </label>
            <label className="block text-xs font-semibold text-gray-700">{t.noteLabel}
              <input value={note} onChange={(e) => setNote(e.target.value.slice(0, 120))} data-note="1"
                     className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none" />
            </label>
            <p className="text-[11px] text-gray-500">
              {zermFill(t.limits, { min: fmtCoins(state.send_min), max: fmtCoins(state.send_daily_max), today: fmtCoins(state.sent_today) })}
            </p>

            {err && (
              <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900" data-error="1">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {err}
              </div>
            )}

            {name ? (
              <div className="rounded-xl bg-teal-50 p-3" data-confirm="1">
                <p className="text-sm font-semibold text-teal-900">{zermFill(t.confirmTo, { coins: coinsLabel(t, amt), name })}</p>
                <div className="mt-3 flex gap-2">
                  <button type="button" disabled={busy || !amountOk} onClick={() => void send()} data-send="1"
                          className="flex items-center gap-1 rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white disabled:bg-teal-300">
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} {t.sendBtn}
                  </button>
                  <button type="button" onClick={() => setName(null)} className="rounded-xl bg-white px-3 py-2 text-sm text-gray-600 ring-1 ring-gray-200">{t.cancel}</button>
                </div>
              </div>
            ) : (
              <button type="button" disabled={busy || !to.trim() || !amountOk} onClick={() => void check()} data-check="1"
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 py-3 text-sm font-bold text-white disabled:bg-teal-300">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} {t.check}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__COINSTRANSFER_FIX850__COMPLETE
