// BAMBEH_DEPLOY_TOKEN__USERACTIONPANEL_FIX475_CLEAN
/**
 * src/features/admin/UserActionPanel.tsx — Bambeh Admin Command Center
 *
 * FIX475 — CLICK A USER, DO SOMETHING ABOUT IT.
 * ─────────────────────────────────────────────
 * Until now the Users list could search and freeze, and nothing else. Granting
 * a subscription meant running SQL by hand, and there was no way at all to help
 * a user who had forgotten their password.
 *
 * WHAT IT DOES
 *   · Grant premium — daily, weekly or monthly, expiring on its own
 *   · Mint a password reset link, with Copy and WhatsApp
 *   · Freeze or unfreeze the account
 *
 * WHY THE RESET LINK IS NOT "SENT"
 *   Most Bambeh accounts are phone registrations carrying a synthetic address
 *   like 237656323629@phone.bambeh.com. That mailbox does not exist, so email
 *   cannot reach them. And a link cannot reach a phone without SMS, which is
 *   not funded yet.
 *
 *   So the panel does not pretend. It mints the link and hands it to you.
 *   WhatsApp is the primary button because it is the one channel that actually
 *   works today and costs nothing. Email is enabled only when the address is
 *   real. SMS is present but disabled and says why, so the day it is funded it
 *   becomes one change rather than a new feature — and until then nobody is
 *   misled into thinking a message went out.
 *
 * WHY FREEZING REUSES setUserFrozen
 *   `profiles.account_frozen` is the mechanism that is already live and already
 *   logged. `account_status` exists in the table but nothing in the app reads
 *   it. Writing both would give Bambeh two blocking systems that disagree —
 *   the exact failure that has cost this project weeks elsewhere.
 *
 * LANGUAGE
 *   English only, by decision: this is staff chrome, never seen by a user.
 *   Everything a USER sees stays in all five languages.
 *
 * © 2026 BAMBEH SARL. All rights reserved.
 */

import React, { useState } from 'react';
import {
  X, Loader2, Crown, KeyRound, Copy, Check, MessageCircle,
  Mail, Smartphone, Snowflake, Flame, AlertCircle, ExternalLink,
} from 'lucide-react';
import {
  adminGrantSubscription, adminGenerateResetLink, whatsappResetUrl,
  ROLE_LABEL, type AdminUser, type AdminRole, type Capabilities,
  type GrantPlan, type ResetLink,
} from './lib';

const PLANS: Array<{ id: GrantPlan; label: string; note: string }> = [
  { id: 'daily',   label: 'Daily',   note: '1 day' },
  { id: 'weekly',  label: 'Weekly',  note: '7 days' },
  { id: 'monthly', label: 'Monthly', note: '30 days' },
];

interface Props {
  user: AdminUser;
  role: AdminRole;
  cap: Capabilities;
  /** the signed-in admin, for the audit trail on freeze */
  actorId: string;
  onClose: () => void;
  /** called after anything that changes the row, so the list can reload */
  onChanged: () => void;
  /** freeze/unfreeze is handled by the parent, which already owns that logic */
  onFreezeRequest: (u: AdminUser, freeze: boolean) => void;
  flash: (m: string) => void;
}

export default function UserActionPanel({
  user, role, cap, actorId, onClose, onChanged, onFreezeRequest, flash,
}: Props) {
  const [plan, setPlan] = useState<GrantPlan>('monthly');
  const [granting, setGranting] = useState(false);

  const [minting, setMinting] = useState(false);
  const [reset, setReset] = useState<ResetLink | null>(null);
  const [resetErr, setResetErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const isStaff = Boolean(user.admin_role);
  const canResetThisUser = !isStaff || role === 'super_admin';

  // ---- grant a subscription -------------------------------------------------
  const grant = async () => {
    setGranting(true);
    try {
      const r = await adminGrantSubscription('user', [user.id], plan);
      if (r.granted > 0) flash(`Premium granted — ${r.days_used} day(s).`);
      else if (r.extended > 0) flash(`Existing subscription extended by ${r.days_used} day(s).`);
      else flash('Nothing changed — the account could not be found.');
      onChanged();
    } catch (e) {
      // Say what actually went wrong. "Action failed" is how a real problem
      // hides for a month.
      flash(e instanceof Error ? e.message : 'Could not grant the subscription.');
    } finally {
      setGranting(false);
    }
  };

  // ---- mint a reset link ----------------------------------------------------
  const mint = async () => {
    setMinting(true);
    setResetErr(null);
    setCopied(false);
    try {
      setReset(await adminGenerateResetLink(user.id));
    } catch (e) {
      setResetErr(e instanceof Error ? e.message : 'Could not generate a link.');
      setReset(null);
    } finally {
      setMinting(false);
    }
  };

  const copyLink = async () => {
    if (!reset) return;
    try {
      await navigator.clipboard.writeText(reset.link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      flash('Could not copy — select the link and copy it by hand.');
    }
  };

  const openWhatsApp = () => {
    if (!reset?.phone) return;
    window.open(
      whatsappResetUrl(reset.phone, reset.full_name, reset.link),
      '_blank',
      'noopener,noreferrer',
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
      onClick={onClose}>
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 truncate">
              {user.full_name || 'Unnamed'}
              {isStaff ? (
                <span className="text-[10px] bg-teal-100 text-teal-700 rounded-full px-1.5 py-0.5 ml-2 align-middle">
                  {ROLE_LABEL[user.admin_role as AdminRole]}
                </span>
              ) : null}
            </p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100" aria-label="Close">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-5">

          {/* ── SUBSCRIPTION ────────────────────────────────────────────── */}
          {cap.manageSubscriptions ? (
            <section>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-amber-500" /> Grant premium
              </h3>
              <div className="flex gap-2 mb-2">
                {PLANS.map((p) => (
                  <button key={p.id} onClick={() => setPlan(p.id)}
                    className={`flex-1 rounded-xl border px-2 py-2 text-center transition-colors ${
                      plan === p.id
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-gray-200 text-gray-600 hover:border-teal-300'
                    }`}>
                    <span className="block text-sm font-semibold">{p.label}</span>
                    <span className="block text-[11px] text-gray-400">{p.note}</span>
                  </button>
                ))}
              </div>
              <button onClick={grant} disabled={granting}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold py-2.5 rounded-xl
                           disabled:opacity-60 flex items-center justify-center gap-2">
                {granting ? <><Loader2 className="w-4 h-4 animate-spin" /> Granting…</> : 'Grant premium'}
              </button>
              <p className="text-[11px] text-gray-400 mt-1.5">
                Free of charge and marked as a gift, so it never appears in revenue.
                If they already have time left, this adds to it. It expires on its own.
              </p>
            </section>
          ) : null}

          {/* ── PASSWORD RESET ──────────────────────────────────────────── */}
          <section>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-2">
              <KeyRound className="w-4 h-4 text-blue-500" /> Password reset
            </h3>

            {!canResetThisUser ? (
              <p className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-xl p-3">
                Only the Super Admin can reset a staff account.
              </p>
            ) : !reset ? (
              <>
                <button onClick={mint} disabled={minting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2.5 rounded-xl
                             disabled:opacity-60 flex items-center justify-center gap-2">
                  {minting ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : 'Generate reset link'}
                </button>
                <p className="text-[11px] text-gray-400 mt-1.5">
                  Nothing is sent. You get the link and pass it to the user yourself.
                </p>
                {resetErr ? (
                  <div className="mt-2 flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{resetErr}</span>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="space-y-2">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-2.5">
                  <p className="text-[11px] text-gray-500 mb-1">{reset.note}</p>
                  <p className="text-[11px] text-gray-700 break-all font-mono leading-snug">{reset.link}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button onClick={copyLink}
                    className="flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50
                               text-gray-700 text-sm font-semibold py-2.5 rounded-xl">
                    {copied ? <><Check className="w-4 h-4 text-emerald-600" /> Copied</> : <><Copy className="w-4 h-4" /> Copy</>}
                  </button>

                  <button onClick={openWhatsApp} disabled={!reset.phone}
                    title={reset.phone ? 'Open WhatsApp with the message ready' : 'No phone number on this account'}
                    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700
                               disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold
                               py-2.5 rounded-xl">
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </button>
                </div>

                {/* The two channels that cannot work yet. Present, disabled,
                    and honest about the reason. */}
                <div className="grid grid-cols-2 gap-2">
                  <button disabled
                    title={reset.email_is_synthetic
                      ? 'This account has no real email address'
                      : 'Email sending is not wired up yet'}
                    className="flex items-center justify-center gap-2 border border-gray-200 bg-gray-50
                               text-gray-400 text-xs font-semibold py-2 rounded-xl cursor-not-allowed">
                    <Mail className="w-3.5 h-3.5" />
                    {reset.email_is_synthetic ? 'No real email' : 'Email'}
                  </button>
                  <button disabled title="SMS credit required"
                    className="flex items-center justify-center gap-2 border border-gray-200 bg-gray-50
                               text-gray-400 text-xs font-semibold py-2 rounded-xl cursor-not-allowed">
                    <Smartphone className="w-3.5 h-3.5" /> SMS credit required
                  </button>
                </div>

                <a href={reset.link} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 hover:text-teal-600 pt-1">
                  <ExternalLink className="w-3 h-3" /> Open it yourself to check it works
                </a>
              </div>
            )}
          </section>

          {/* ── ACCOUNT ─────────────────────────────────────────────────── */}
          {cap.freezeUsers ? (
            <section>
              <h3 className="text-sm font-bold text-gray-900 mb-2">Account</h3>
              <button
                onClick={() => { onFreezeRequest(user, !user.account_frozen); onClose(); }}
                className={`w-full text-sm font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 ${
                  user.account_frozen
                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}>
                {user.account_frozen
                  ? <><Flame className="w-4 h-4" /> Unfreeze this account</>
                  : <><Snowflake className="w-4 h-4" /> Freeze this account</>}
              </button>
              <p className="text-[11px] text-gray-400 mt-1.5">
                A frozen account cannot sign in. You will be asked for a reason, and it is recorded.
              </p>
            </section>
          ) : null}

          <p className="text-[10px] text-gray-300 text-center pt-1">
            Acting as {ROLE_LABEL[role]} · every action here is logged
          </p>
        </div>
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__USERACTIONPANEL_FIX475__COMPLETE
