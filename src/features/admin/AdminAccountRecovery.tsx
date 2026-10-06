// BAMBEH_DEPLOY_TOKEN__ADMIN_ACCOUNT_RECOVERY_FIX655_CLEAN
/**
 * FIX612 - Command Center tool: account recovery.
 * FIX655 - the WhatsApp message names how they sign in - their phone number OR
 *          their email - and an account with no WhatsApp number gets "Copy the
 *          message" to send another way.
 * FIX650 - ONE way back in: the TEMPORARY PASSWORD. "Send a reset code" and the
 *          password-request queue are gone. Staff verify the owner, create a
 *          temporary password, send it to the number on the account; the owner
 *          signs in with it and must choose their own new password at once, and
 *          every other device is signed out. Logged with the staff member's name.
 * FIX642 - the staff activity feed names refund decisions too (who, when, for whom).
 * FIX628 - "Password requests waiting": owners who forgot their password ask from
 *          the sign-in screen; staff approve the exact request whose 4-digit number
 *          the owner reads to them, and the owner then chooses a new password on
 *          that phone - no old password. Every decision names the staff member,
 *          visible to every moderator, admin and the super admin.
 * FIX624 - "Send a reset code" replaces the temporary password: the owner never needs
 *          the old password. Staff verify, the code goes to the owner's WhatsApp, the
 *          owner types it under Forgot password -> Bambeh code and chooses a new password.
 * Route: /#/admin/account-recovery   (staff only; English, like the rest of the Command Center)
 *
 * Find any account by phone, name or email, then:
 *  - switch it back on (clears paused, frozen, banned)       - admins and the super admin
 *  - make the owner choose a new password at next sign-in     - moderators and up
 *  - create a temporary password for someone locked out       - moderators and up
 *    (shown ONCE, never stored; they are signed out everywhere)
 *
 * The database (FIX610: bambeh_admin_accounts_find, bambeh_admin_account_recover)
 * enforces every rule: nobody acts on themselves or on an equal or higher rank,
 * and only admins reactivate. This page only offers what the server will allow.
 * The message staff send by WhatsApp goes out in the user's language when known.
 */
import React, { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, CheckCircle, Loader2, Lock, Power, RefreshCw, Search, Shield, Users } from "lucide-react";

type Account = {
  id: string;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  lang?: string | null;
  admin_role?: string | null;
  staff_rank?: number;
  is_active?: boolean;
  account_frozen?: boolean;
  account_status?: string | null;
  must_change_password?: boolean;
  banned?: boolean;
  last_sign_in_at?: string | null;
  created_at?: string | null;
  auth_exists?: boolean;
  is_you?: boolean;
  can_manage?: boolean;
  security_answers?: number;
  last_recovery_check?: { at?: string; matched?: number; answered?: number; passed?: boolean } | null;
  passed_check_at?: string | null;
  reset_code_expires_at?: string | null;
};
type FindResult = {
  ok?: boolean;
  reason?: string;
  actor_rank?: number;
  rows?: Account[];
  recent?: { at?: string; action?: string; actor?: string; target?: string; note?: string | null }[];
};
type RecoverResult = {
  ok?: boolean;
  reason?: string;
  full_name?: string | null;
  login_hint?: string | null;
  lang?: string | null;
  cleared?: string[];
  must_change_password?: boolean;
  temp_password?: string | null;
  signed_out?: boolean;
};

const WA_TEXT: Record<string, string> = {
  en: "Bambeh: your temporary password is {pw}. Open Bambeh and sign in with {id} and this temporary password. The app will then ask you to choose your own new password. Bambeh staff will never ask for your password.",
  fr: "Bambeh : votre mot de passe temporaire est {pw}. Ouvrez Bambeh et connectez-vous avec {id} et ce mot de passe temporaire. L'application vous demandera ensuite de choisir votre propre nouveau mot de passe. L'\u00e9quipe Bambeh ne vous demandera jamais votre mot de passe.",
  pidgin: "Bambeh: your temporary password na {pw}. Open Bambeh and sign in with {id} and this temporary password. The app go ask you make you choose your own new password. Bambeh staff no go ever ask you for your password.",
  ar: "\u0628\u0627\u0645\u0628\u064a\u0647: \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u0645\u0624\u0642\u062a\u0629 \u0627\u0644\u062e\u0627\u0635\u0629 \u0628\u0643 \u0647\u064a {pw}. \u0627\u0641\u062a\u062d \u0628\u0627\u0645\u0628\u064a\u0647 \u0648\u0633\u062c\u0651\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0628\u0627\u0633\u062a\u062e\u062f\u0627\u0645 {id} \u0648\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u0645\u0624\u0642\u062a\u0629 \u0647\u0630\u0647. \u0633\u064a\u0637\u0644\u0628 \u0645\u0646\u0643 \u0627\u0644\u062a\u0637\u0628\u064a\u0642 \u0628\u0639\u062f \u0630\u0644\u0643 \u0627\u062e\u062a\u064a\u0627\u0631 \u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u062c\u062f\u064a\u062f\u0629 \u062e\u0627\u0635\u0629 \u0628\u0643. \u0644\u0646 \u064a\u0637\u0644\u0628 \u0645\u0646\u0643 \u0641\u0631\u064a\u0642 \u0628\u0627\u0645\u0628\u064a\u0647 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0623\u0628\u062f\u064b\u0627.",
  ff: "Bambeh: finnde maa sahaa ko {pw}. Uddit Bambeh, naatir e {id} e ndee finnde sahaa. Caggal \u0257uum App oo \u01b4amete su\u0253aade finnde maa keso. Gollo\u0253e Bambeh \u01b4amataa ma finnde maa abada.",
};

const REASONS: Record<string, string> = {
  not_signed_in: "Please sign in first.",
  not_staff: "Access denied \u2014 This area is for Bambeh staff only.",
  no_target: "Pick an account first.",
  self: "You cannot use this on your own account. Use the normal change-password screen.",
  admin_only_reactivate: "Only an admin or the super admin can switch an account back on.",
  nothing_to_do: "Tick at least one action.",
  no_such_user: "That account does not exist.",
  account_deleted: "This account was deleted. There is nothing to reactivate.",
  rank: "This person has the same staff rank as you or higher. Only a higher rank can change their account.",
  verification_required: "Say how you confirmed it is really them before you hand over a password or switch the account back on.",
  no_recent_check: "They have not passed the security questions in the last 24 hours. Choose the way you really confirmed it is them.",
};

const METHODS: Array<{ key: string; label: string }> = [
  { key: "security_questions", label: "They passed the security questions (last 24 hours)" },
  { key: "called_registered_number", label: "I called them on their registered number and they answered" },
  { key: "id_card_seen", label: "I saw their ID card and the name matches the account" },
  { key: "in_person", label: "I met them in person" },
];

const ACTION_LABELS: Record<string, string> = {
  account_reactivated: "reactivated the account of",
  password_change_required: "asked for a new password from",
  temp_password_issued: "issued a temporary password to",
  password_changed_after_reset: "changed their own password:",
  reset_code_issued: "sent a reset code to",
  reset_code_redeemed: "set a new password with a reset code:",
  reset_request_approved: "approved a password request for",
  reset_request_refused: "refused a password request for",
  reset_request_completed: "chose a new password through an approved request:",
  refund_sent: "sent a refund (item price) to",          // FIX642 - money decisions, by name
  refund_failed: "tried to refund, transfer failed, for",
  claim_rejected: "closed a refund claim (seller paid) for",
  password_reset: "reset the password of",
  account_activated: "activated",
  account_deactivated: "deactivated",
};

const RANK_LABEL = ["", "Moderator", "Admin", "Super admin"];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function rpcRetry<T>(fn: string, args: Record<string, unknown>): Promise<{ data: T | null; error: string | null; missing: boolean }> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const { data, error } = await supabase.rpc(fn, args);
      if (!error) return { data: data as T, error: null, missing: false };
      const code = String((error as { code?: string }).code || "");
      const msg = String(error.message || "");
      if (code === "PGRST202" || /could not find the function/i.test(msg)) {
        return { data: null, error: msg, missing: true };
      }
      if (attempt === 0 && /fetch|network|timeout/i.test(msg)) {
        await sleep(900);
        continue;
      }
      return { data: null, error: msg, missing: false };
    } catch (e) {
      if (attempt === 0) {
        await sleep(900);
        continue;
      }
      return { data: null, error: String((e as { message?: string })?.message || e), missing: false };
    }
  }
  return { data: null, error: "Could not reach Bambeh.", missing: false };
}

function fmtWhen(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  if (!s) return "never";
  const d = new Date(s);
  if (isNaN(d.getTime())) return "never";
  return d.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

/** International digits for WhatsApp: 6xxxxxxxx -> 2376xxxxxxxx. */
function waDigits(raw: unknown): string {
  const d = String(raw || "").replace(/[^0-9]/g, "");
  if (d.length === 9 && d.charAt(0) === "6") return "237" + d;
  if (d.length >= 11) return d;
  return "";
}

function prettyPhone(raw: unknown): string {
  const d = String(raw || "").replace(/[^0-9]/g, "");
  if (d.length === 12 && d.indexOf("237") === 0) {
    return "+237 " + d.slice(3, 6) + " " + d.slice(6, 9) + " " + d.slice(9);
  }
  return d ? "+" + d : "";
}

function realEmail(e: unknown): string {
  const s = String(e || "");
  return /@phone\.bambeh\.com$/i.test(s) ? "" : s;
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the old way - some Android WebViews refuse the clipboard API */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

const page: React.CSSProperties = { maxWidth: 900, margin: "0 auto", padding: "16px 14px 60px", color: "#0f172a" };
const card: React.CSSProperties = { background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 14 };
const input: React.CSSProperties = {
  border: "1.5px solid #cbd5e1",
  borderRadius: 10,
  padding: "10px 11px",
  fontSize: 15,
  background: "#ffffff",
  color: "#0f172a",
};
const btn = (kind: "primary" | "danger" | "plain", enabled: boolean): React.CSSProperties => ({
  border: kind === "plain" ? "1.5px solid #cbd5e1" : "none",
  background: !enabled ? "#cbd5e1" : kind === "primary" ? "#0f766e" : kind === "danger" ? "#b91c1c" : "#ffffff",
  color: kind === "plain" ? "#0f172a" : "#ffffff",
  borderRadius: 10,
  padding: "10px 14px",
  fontSize: 14,
  fontWeight: 700,
  cursor: enabled ? "pointer" : "not-allowed",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
});
const pill = (color: string): React.CSSProperties => ({
  fontSize: 12,
  fontWeight: 700,
  color,
  border: "1px solid " + color,
  borderRadius: 999,
  padding: "2px 8px",
  whiteSpace: "nowrap",
});

class Boundary extends React.Component<{ children: React.ReactNode }, { err: string | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { err: null };
  }
  static getDerivedStateFromError(e: unknown): { err: string } {
    return { err: String((e as { message?: string })?.message || e) };
  }
  componentDidCatch(e: unknown): void {
    console.error("[FIX612] Account recovery crashed:", e);
  }
  render(): React.ReactNode {
    if (this.state.err) {
      return (
        <div style={page}>
          <div style={{ ...card, borderColor: "#fecaca", background: "#fef2f2" }}>
            <b>This page hit an error and stopped.</b>
            <div style={{ fontSize: 13, marginTop: 6 }}>{this.state.err}</div>
            <button type="button" style={{ ...btn("plain", true), marginTop: 10 }} onClick={() => window.location.reload()}>
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function StatusPills({ a }: { a: Account }) {
  const out: React.ReactNode[] = [];
  if (a.is_you) out.push(<span key="you" style={pill("#0f766e")}>You</span>);
  if (Number(a.staff_rank || 0) > 0) out.push(<span key="rk" style={pill("#1d4ed8")}>{RANK_LABEL[Number(a.staff_rank)]}</span>);
  if (a.is_active === false) out.push(<span key="pa" style={pill("#b91c1c")}>Paused</span>);
  if (a.account_frozen) out.push(<span key="fr" style={pill("#b91c1c")}>Frozen</span>);
  if (a.banned) out.push(<span key="bn" style={pill("#b91c1c")}>Banned</span>);
  const st = String(a.account_status || "").toLowerCase();
  if (st && st !== "active") out.push(<span key="st" style={pill("#b45309")}>Status: {st}</span>);
  if (a.must_change_password) out.push(<span key="mc" style={pill("#b45309")}>Must change password</span>);
  if (a.reset_code_expires_at) out.push(<span key="rc" style={pill("#1d4ed8")}>Reset code waiting until {fmtWhen(a.reset_code_expires_at)}</span>);
  if (!a.auth_exists) out.push(<span key="dl" style={pill("#64748b")}>Deleted</span>);
  if (out.length === 0) out.push(<span key="ok" style={pill("#15803d")}>Active</span>);
  const sq = Number(a.security_answers || 0);
  out.push(
    <span key="sq" style={pill(sq >= 3 ? "#15803d" : "#64748b")}>
      {sq >= 3 ? "Security questions set" : "No security questions"}
    </span>,
  );
  return <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{out}</div>;
}

function ActionPanel({ a, rank, onDone }: { a: Account; rank: number; onDone: () => void }) {
  const needsReactivation = a.is_active === false || !!a.account_frozen || !!a.banned ||
    (!!a.account_status && String(a.account_status).toLowerCase() !== "active");
  const [reactivate, setReactivate] = useState(rank >= 2 && needsReactivation);
  const [temp, setTemp] = useState(true);
  const [requireChange, setRequireChange] = useState(false);
  const [signOutAll, setSignOutAll] = useState(false);
  const [note, setNote] = useState("");
  const [method, setMethod] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<RecoverResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false); // FIX655
  const passedRecently = !!a.passed_check_at && Date.now() - new Date(String(a.passed_check_at)).getTime() < 24 * 60 * 60 * 1000;

  if (!a.can_manage) {
    return (
      <div style={{ marginTop: 10, fontSize: 14, color: "#475569" }}>
        {a.is_you ? REASONS.self : !a.auth_exists ? REASONS.account_deleted : REASONS.rank}
      </div>
    );
  }

  const anything = reactivate || temp || requireChange || signOutAll;
  const needsMethod = reactivate || temp;
  const ready = anything && (!needsMethod || method !== "");

  async function apply(): Promise<void> {
    setBusy(true);
    setErr(null);
    const res = await rpcRetry<RecoverResult>("bambeh_admin_account_recover", {
      p_target: a.id,
      p_reactivate: reactivate,
      p_require_password_change: requireChange && !temp,
      p_issue_temp_password: temp,
      p_sign_out_everywhere: signOutAll || temp,
      p_note: note.trim() || null,
      p_verified_by: needsMethod ? method : null,
    });
    setBusy(false);
    setConfirming(false);
    if (res.error || !res.data) {
      setErr("Not done: " + (res.error || "no answer from Bambeh") + ".");
      return;
    }
    if (res.data.ok === false) {
      setErr(REASONS[res.data.reason || ""] || "Refused: " + String(res.data.reason));
      return;
    }
    setResult(res.data);
  }

  if (result) {
    const pw = String(result.temp_password || "");
    const lang = String(result.lang || "");
    // FIX655 - how they sign in: their phone number, or their email for an email account
    const hint = String(result.login_hint || a.phone || a.email || "");
    const idText = hint.indexOf("@") > 0 ? hint : prettyPhone(hint) || hint;
    const textFor = (l: string) => (WA_TEXT[l] || "").split("{pw}").join(pw).split("{id}").join(idText);
    const waMessage = lang && WA_TEXT[lang] ? textFor(lang) : textFor("en") + "\n\n" + textFor("fr");
    const wa = waDigits(result.login_hint || a.phone);
    const cleared = result.cleared || [];
    return (
      <div style={{ marginTop: 12, ...card, background: "#f0fdf4", borderColor: "#bbf7d0" }} data-fix="FIX650">
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, color: "#14532d" }}>
          <CheckCircle size={18} /> Done for {result.full_name || "this account"}
        </div>
        <ul style={{ margin: "8px 0 0", paddingInlineStart: 18, fontSize: 14, color: "#14532d" }}>
          {reactivate ? <li>{cleared.length ? "Switched back on (cleared: " + cleared.join(", ") + ")." : "The account was already on."}</li> : null}
          {pw ? <li>Temporary password created. They must choose their own new password as soon as they sign in.</li> : null}
          {!pw && result.must_change_password ? <li>They must choose a new password after their next sign-in.</li> : null}
          {result.signed_out ? <li>Signed out on every device.</li> : null}
        </ul>
        {pw ? (
          <div style={{ marginTop: 12, ...card, borderColor: "#fde68a", background: "#fffbeb" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#92400e" }}>
              TEMPORARY PASSWORD - shown once, stored nowhere. Send it only to the number registered on this account.
            </div>
            <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", fontSize: 32, letterSpacing: 4, fontWeight: 800, margin: "10px 0", userSelect: "all" }}>
              {pw}
            </div>
            <div style={{ fontSize: 13, color: "#475569", marginBottom: 10 }}>
              They sign in with <b>{idText}</b> and this temporary password (or use
              Forgot password, then the Temporary password tab), then choose their own new password. If someone else asks you to send
              it to a different number, refuse unless you have seen the owner's ID card in person.
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" style={btn("plain", true)} onClick={async () => { setCopied(await copyText(pw)); }}>
                <Lock size={16} /> {copied ? "Copied" : "Copy"}
              </button>
              {wa ? (
                <a href={"https://wa.me/" + wa + "?text=" + encodeURIComponent(waMessage)} target="_blank" rel="noopener noreferrer"
                  style={{ ...btn("primary", true), textDecoration: "none" }}>
                  Send on WhatsApp to {prettyPhone(wa)}
                </a>
              ) : (
                <button type="button" style={btn("primary", true)} onClick={async () => { setCopiedMsg(await copyText(waMessage)); }}>
                  {copiedMsg ? "Message copied" : "Copy the message - no WhatsApp number on this account"}
                </button>
              )}
            </div>
          </div>
        ) : null}
        <button type="button" style={{ ...btn("plain", true), marginTop: 12 }} onClick={() => { setResult(null); onDone(); }}>
          {pw ? "I have sent it - hide it" : "Close"}
        </button>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10, fontSize: 14 }}>
      <label style={{ display: "flex", gap: 8, alignItems: "flex-start", opacity: rank >= 2 ? 1 : 0.55 }}>
        <input type="checkbox" disabled={rank < 2} checked={reactivate} onChange={(e) => setReactivate(e.target.checked)} />
        <span>
          <b>Switch the account back on</b> - clears paused, frozen and banned.
          {rank < 2 ? " (Admins and the super admin only.)" : ""}
        </span>
      </label>
      <label style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <input type="checkbox" checked={temp} onChange={(e) => setTemp(e.target.checked)} />
        <span>
          <b>Create a temporary password - they cannot sign in.</b> Send it only to the number registered on the account. They sign
          in with it and the app makes them choose their own new password at once. Every other device is signed out.
        </span>
      </label>
      <label style={{ display: "flex", gap: 8, alignItems: "flex-start", opacity: temp ? 0.55 : 1 }}>
        <input type="checkbox" disabled={temp} checked={requireChange && !temp} onChange={(e) => setRequireChange(e.target.checked)} />
        <span>
          <b>Ask for a new password after their next sign-in</b> - they still sign in with their CURRENT password first. Use this
          when they remember it but someone else may know it.{temp ? " (Not needed: a temporary password already makes them choose one.)" : ""}
        </span>
      </label>
      <label style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <input type="checkbox" checked={signOutAll || temp} disabled={temp} onChange={(e) => setSignOutAll(e.target.checked)} />
        <span>
          <b>Sign them out on every device now</b> - use this if someone else may be in the account.
        </span>
      </label>
      {needsMethod ? (
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <b>How did you confirm it is really them? (required)</b>
          <select style={input} value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="">Choose one...</option>
            {METHODS.map((m) => (
              <option key={m.key} value={m.key} disabled={m.key === "security_questions" && !passedRecently}>
                {m.label}
                {m.key === "security_questions" && !passedRecently ? " - no passed check yet" : ""}
              </option>
            ))}
          </select>
          <span style={{ fontSize: 12, color: "#64748b" }}>
            The security questions are the first check: a passed check shows on the account above. A temporary password is a key
            to the account - only for the owner, only to the number on the account.
          </span>
        </label>
      ) : null}
      <input
        style={input}
        maxLength={300}
        placeholder="Why? For the audit log, e.g. 'passed security questions, wrote from 670..., forgot password'"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      {err ? <div style={{ color: "#991b1b", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "8px 10px" }}>{err}</div> : null}
      {confirming ? (
        <div style={{ ...card, background: "#fffbeb", borderColor: "#fde68a" }}>
          <div style={{ marginBottom: 8 }}>
            Apply to <b>{a.full_name || prettyPhone(a.phone) || a.email || a.id}</b>? This is logged with your name.
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" style={btn("primary", !busy)} disabled={busy} onClick={() => void apply()}>
              {busy ? <Loader2 size={16} style={{ animation: "fix612spin 1s linear infinite" }} /> : <Power size={16} />} Yes, apply
            </button>
            <button type="button" style={btn("plain", !busy)} disabled={busy} onClick={() => setConfirming(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button type="button" style={btn("primary", ready)} disabled={!ready} onClick={() => setConfirming(true)}>
          <Power size={16} /> Apply
        </button>
      )}
    </div>
  );
}

function Inner({ embedded }: { embedded: boolean }) {
  const [query, setQuery] = useState("");
  const [onlyFlagged, setOnlyFlagged] = useState(true);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [denied, setDenied] = useState<string | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [rows, setRows] = useState<Account[]>([]);
  const [recent, setRecent] = useState<NonNullable<FindResult["recent"]>>([]);
  const [rank, setRank] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);

  const find = useCallback(async (q: string, flagged: boolean) => {
    setLoading(true);
    setLoadErr(null);
    const res = await rpcRetry<FindResult>("bambeh_admin_accounts_find", {
      p_query: q.trim() || null,
      p_only_flagged: flagged,
      p_limit: 60,
    });
    if (res.missing) setMissing(true);
    else if (res.error || !res.data) setLoadErr(res.error || "No answer from Bambeh.");
    else if (res.data.ok === false) setDenied(res.data.reason || "not_staff");
    else {
      setDenied(null);
      setRank(Number(res.data.actor_rank || 0));
      setRows(res.data.rows || []);
      setRecent(res.data.recent || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void find("", true);
  }, [find]);

  if (missing) {
    return (
      <div style={page}>
        <div style={{ ...card, background: "#fffbeb", borderColor: "#fde68a" }}>
          <b>The database half is not installed yet.</b>
          <div style={{ marginTop: 6, fontSize: 14 }}>
            Run <code>FIX610-admin-reactivation.sql</code> in Supabase, SQL Editor, then reload this page.
          </div>
        </div>
      </div>
    );
  }

  if (denied) {
    return (
      <div style={page}>
        <div style={{ ...card, textAlign: "center", padding: 28 }}>
          <Shield size={40} />
          <h2 style={{ margin: "10px 0 6px" }}>{denied === "not_signed_in" ? "Sign in first" : "Access denied"}</h2>
          <p style={{ margin: 0, color: "#475569" }}>{REASONS[denied] || REASONS.not_staff}</p>
        </div>
      </div>
    );
  }

  return (
    <div data-fix="FIX650" translate="no" className="notranslate" style={embedded ? { ...page, padding: "4px 0 24px" } : page}>
      <style>{"@keyframes fix612spin{to{transform:rotate(360deg)}}"}</style>
      <div style={{ display: embedded ? "none" : "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <a href="#/admin/center" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#0f766e", fontWeight: 600, textDecoration: "none" }}>
          <ArrowLeft size={18} /> Command Center
        </a>
        <a href="#/admin/reactivate-listings" style={{ color: "#0f766e", fontWeight: 600, textDecoration: "none" }}>
          Reactivate adverts
        </a>
      </div>

      <h1 style={{ fontSize: 24, margin: "14px 0 4px", display: "flex", alignItems: "center", gap: 8 }}>
        <Users size={22} /> Account recovery
      </h1>
      <p style={{ margin: "0 0 14px", color: "#475569", fontSize: 14, lineHeight: 1.5 }}>
        Switch an account back on, or give a verified owner a temporary password: they sign in with it and must choose their own
        new password at once. You are signed in as <b>{RANK_LABEL[rank] || "staff"}</b>. Everything here is written to the audit
        log with your name.
      </p>

      <form
        style={{ ...card, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}
        onSubmit={(e) => {
          e.preventDefault();
          setOpenId(null);
          void find(query, onlyFlagged && !query.trim());
        }}
      >
        <input
          style={{ ...input, flex: "1 1 240px" }}
          placeholder="Phone number, name or email"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" style={btn("primary", !loading)} disabled={loading}>
          <Search size={16} /> Search
        </button>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14 }}>
          <input
            type="checkbox"
            checked={onlyFlagged}
            onChange={(e) => {
              setOnlyFlagged(e.target.checked);
              setOpenId(null);
              void find(query, e.target.checked && !query.trim());
            }}
          />
          Only accounts needing attention
        </label>
        <button type="button" style={btn("plain", !loading)} disabled={loading} onClick={() => void find(query, onlyFlagged && !query.trim())}>
          <RefreshCw size={16} /> Refresh
        </button>
      </form>

      <div style={{ margin: "14px 0 8px", fontWeight: 700 }}>
        {loading ? "Searching..." : rows.length + " account(s)"}
      </div>

      {loading ? (
        <div style={{ ...card, textAlign: "center", padding: 28 }}>
          <Loader2 size={26} style={{ animation: "fix612spin 1s linear infinite" }} />
        </div>
      ) : loadErr ? (
        <div style={{ ...card, background: "#fef2f2", borderColor: "#fecaca" }}>
          Could not search: {loadErr}
        </div>
      ) : rows.length === 0 ? (
        <div style={{ ...card, color: "#475569" }}>
          {onlyFlagged && !query.trim()
            ? "No paused, frozen, banned or locked accounts right now. Search by phone, name or email to find anyone else."
            : "Nobody matches that search."}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rows.map((a) => {
            const open = openId === a.id;
            const mail = realEmail(a.email);
            return (
              <div key={a.id} style={{ ...card, borderColor: open ? "#0f766e" : "#e2e8f0" }}>
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : a.id)}
                  style={{
                    all: "unset",
                    cursor: "pointer",
                    display: "flex",
                    width: "100%",
                    justifyContent: "space-between",
                    gap: 10,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700 }}>{a.full_name || "(no name)"}</div>
                    <div style={{ fontSize: 13, color: "#475569" }}>
                      {prettyPhone(a.phone) || "no phone"}
                      {mail ? " \u00b7 " + mail : ""}
                      {" \u00b7 last sign-in " + fmtWhen(a.last_sign_in_at)}
                    </div>
                    {a.last_recovery_check ? (
                      <div style={{ fontSize: 12, color: a.passed_check_at ? "#15803d" : "#b45309" }}>
                        {a.passed_check_at
                          ? "Passed the security questions " + fmtWhen(a.passed_check_at)
                          : "Last security check failed (" + Number(a.last_recovery_check.matched || 0) + " right) " + fmtWhen(a.last_recovery_check.at)}
                      </div>
                    ) : null}
                  </div>
                  <StatusPills a={a} />
                </button>
                {open ? <ActionPanel a={a} rank={rank} onDone={() => void find(query, onlyFlagged && !query.trim())} /> : null}
              </div>
            );
          })}
        </div>
      )}

      <h2 style={{ fontSize: 17, margin: "22px 0 8px" }}>Recent staff actions</h2>
      {recent.length === 0 ? (
        <div style={{ ...card, color: "#475569", fontSize: 14 }}>Nothing yet.</div>
      ) : (
        <div style={{ ...card, fontSize: 13, display: "flex", flexDirection: "column", gap: 6 }}>
          {recent.map((x, i) => (
            <div key={i}>
              <span style={{ color: "#64748b" }}>{fmtWhen(x.at)}</span> {" \u2014 "}
              <b>{x.actor}</b> {ACTION_LABELS[String(x.action)] || String(x.action)} <b>{x.target}</b>
              {x.note ? <span style={{ color: "#64748b" }}>{" (" + x.note + ")"}</span> : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminAccountRecovery({ embedded = false }: { embedded?: boolean }) {
  return (
    <Boundary>
      <Inner embedded={embedded} />
    </Boundary>
  );
}

export { AdminAccountRecovery };
// BAMBEH_END_TOKEN__ADMIN_ACCOUNT_RECOVERY__COMPLETE
