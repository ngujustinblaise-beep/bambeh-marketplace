// BAMBEH_DEPLOY_TOKEN__ADMIN_ACCOUNT_RECOVERY_FIX628_CLEAN
/**
 * FIX612 - Command Center tool: account recovery.
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
type CodeResult = {
  ok?: boolean;
  reason?: string;
  code?: string;
  expires_at?: string;
  full_name?: string | null;
  login_hint?: string | null;
  lang?: string | null;
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
  en: "Bambeh: your reset code is {code}. Open Bambeh, tap Sign in, then \"Forgot password?\", then the \"Bambeh code\" tab. Enter your phone number and this code, then choose your new password. The code works once and expires in 24 hours. Bambeh staff will never ask for your password.",
  fr: "Bambeh : votre code de r\u00e9initialisation est {code}. Ouvrez Bambeh, touchez Se connecter, puis \u00ab Mot de passe oubli\u00e9 ? \u00bb, puis l'onglet \u00ab Code Bambeh \u00bb. Saisissez votre num\u00e9ro et ce code, puis choisissez votre nouveau mot de passe. Le code ne sert qu'une fois et expire dans 24 heures. L'\u00e9quipe Bambeh ne vous demandera jamais votre mot de passe.",
  pidgin: "Bambeh: your reset code na {code}. Open Bambeh, press Sign in, then \"Forgot password?\", then the \"Bambeh code\" tab. Put your phone number and this code, then choose your new password. The code work only one time and e go expire after 24 hours. Bambeh staff no go ever ask you for your password.",
  ar: "\u0628\u0627\u0645\u0628\u064a\u0647: \u0631\u0645\u0632 \u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062a\u0639\u064a\u064a\u0646 \u0627\u0644\u062e\u0627\u0635 \u0628\u0643 \u0647\u0648 {code}. \u0627\u0641\u062a\u062d \u0628\u0627\u0645\u0628\u064a\u0647\u060c \u0648\u0627\u0636\u063a\u0637 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644\u060c \u062b\u0645 \u00ab\u0646\u0633\u064a\u062a \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631\u061f\u00bb\u060c \u062b\u0645 \u062a\u0628\u0648\u064a\u0628 \u00ab\u0631\u0645\u0632 \u0628\u0627\u0645\u0628\u064a\u0647\u00bb. \u0623\u062f\u062e\u0644 \u0631\u0642\u0645 \u0647\u0627\u062a\u0641\u0643 \u0648\u0647\u0630\u0627 \u0627\u0644\u0631\u0645\u0632\u060c \u062b\u0645 \u0627\u062e\u062a\u0631 \u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u062c\u062f\u064a\u062f\u0629. \u064a\u0639\u0645\u0644 \u0627\u0644\u0631\u0645\u0632 \u0645\u0631\u0629 \u0648\u0627\u062d\u062f\u0629 \u0648\u062a\u0646\u062a\u0647\u064a \u0635\u0644\u0627\u062d\u064a\u062a\u0647 \u0628\u0639\u062f 24 \u0633\u0627\u0639\u0629. \u0644\u0646 \u064a\u0637\u0644\u0628 \u0645\u0646\u0643 \u0641\u0631\u064a\u0642 \u0628\u0627\u0645\u0628\u064a\u0647 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0623\u0628\u062f\u064b\u0627.",
  ff: "Bambeh: kod kes\u0257itingol maa ko {code}. Uddit Bambeh, \u00f1o\u01b4\u01b4u Naatgol, caggal \"Finnde yejjitaa?\", caggal hello \"Kod Bambeh\". Naatnu limngal tilifon maa e kod oo, caggal \u0257uum su\u0253o finnde keso. Kod oo ina golla laawol gootol tan, ina timma caggal waktuuji 24. Gollo\u0253e Bambeh \u01b4amataa ma finnde maa abada.",
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
  const [requireChange, setRequireChange] = useState(false);
  const [sendCode, setSendCode] = useState(true);
  const [signOutAll, setSignOutAll] = useState(false);
  const [note, setNote] = useState("");
  const [method, setMethod] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<RecoverResult | null>(null);
  const [codeResult, setCodeResult] = useState<CodeResult | null>(null);
  const [copied, setCopied] = useState(false);
  const passedRecently = !!a.passed_check_at && Date.now() - new Date(String(a.passed_check_at)).getTime() < 24 * 60 * 60 * 1000;

  if (!a.can_manage) {
    return (
      <div style={{ marginTop: 10, fontSize: 14, color: "#475569" }}>
        {a.is_you ? REASONS.self : !a.auth_exists ? REASONS.account_deleted : REASONS.rank}
      </div>
    );
  }

  const anything = reactivate || requireChange || sendCode || signOutAll;
  const needsMethod = reactivate || sendCode;
  const ready = anything && (!needsMethod || method !== "");

  async function apply(): Promise<void> {
    setBusy(true);
    setErr(null);
    let rec: RecoverResult | null = null;
    if (reactivate || (requireChange && !sendCode) || signOutAll) {
      const res = await rpcRetry<RecoverResult>("bambeh_admin_account_recover", {
        p_target: a.id,
        p_reactivate: reactivate,
        p_require_password_change: requireChange && !sendCode,
        p_issue_temp_password: false,
        p_sign_out_everywhere: signOutAll,
        p_note: note.trim() || null,
        p_verified_by: reactivate ? method : null,
      });
      if (res.error || !res.data) {
        setBusy(false);
        setConfirming(false);
        setErr("Not done: " + (res.error || "no answer from Bambeh") + ".");
        return;
      }
      if (res.data.ok === false) {
        setBusy(false);
        setConfirming(false);
        setErr(REASONS[res.data.reason || ""] || "Refused: " + String(res.data.reason));
        return;
      }
      rec = res.data;
    }
    let cr: CodeResult | null = null;
    if (sendCode) {
      const res = await rpcRetry<CodeResult>("bambeh_admin_issue_reset_code", {
        p_target: a.id,
        p_verified_by: method,
        p_note: note.trim() || null,
      });
      const before = rec ? "The account changes were saved, but no reset code was made: " : "No reset code was made: ";
      if (res.error || !res.data) {
        setBusy(false);
        setConfirming(false);
        setErr(before + (res.error || "no answer from Bambeh") + ".");
        if (rec) setResult(rec);
        return;
      }
      if (res.data.ok === false) {
        setBusy(false);
        setConfirming(false);
        setErr(before + (REASONS[res.data.reason || ""] || String(res.data.reason)));
        if (rec) setResult(rec);
        return;
      }
      cr = res.data;
    }
    setBusy(false);
    setConfirming(false);
    setResult(rec || { ok: true, full_name: cr ? cr.full_name : null, login_hint: cr ? cr.login_hint : null, lang: cr ? cr.lang : null, cleared: [], must_change_password: false, signed_out: false });
    setCodeResult(cr);
  }

  if (result) {
    const code = codeResult && codeResult.code ? String(codeResult.code) : "";
    const shown = code.length === 8 ? code.slice(0, 4) + " " + code.slice(4) : code;
    const lang = String((codeResult && codeResult.lang) || result.lang || "");
    const textFor = (l: string) => (WA_TEXT[l] || "").split("{code}").join(shown);
    const waMessage = lang && WA_TEXT[lang] ? textFor(lang) : textFor("en") + "\n\n" + textFor("fr");
    const wa = waDigits((codeResult && codeResult.login_hint) || result.login_hint || a.phone);
    const cleared = result.cleared || [];
    return (
      <div style={{ marginTop: 12, ...card, background: "#f0fdf4", borderColor: "#bbf7d0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, color: "#14532d" }}>
          <CheckCircle size={18} /> Done for {result.full_name || "this account"}
        </div>
        <ul style={{ margin: "8px 0 0", paddingInlineStart: 18, fontSize: 14, color: "#14532d" }}>
          {reactivate ? <li>{cleared.length ? "Switched back on (cleared: " + cleared.join(", ") + ")." : "The account was already on."}</li> : null}
          {result.must_change_password ? <li>They must choose a new password after their next sign-in.</li> : null}
          {result.signed_out ? <li>Signed out on every device.</li> : null}
          {code ? <li>Reset code made. It works once, until {fmtWhen(codeResult && codeResult.expires_at)}.</li> : null}
        </ul>
        {code ? (
          <div style={{ marginTop: 12, ...card, borderColor: "#fde68a", background: "#fffbeb" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#92400e" }}>
              RESET CODE - shown once, stored nowhere. Send it to the owner yourself.
            </div>
            <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", fontSize: 34, letterSpacing: 6, fontWeight: 800, margin: "10px 0", userSelect: "all" }}>
              {shown}
            </div>
            <div style={{ fontSize: 13, color: "#475569", marginBottom: 10 }}>
              In the app they tap Sign in, then Forgot password, then the Bambeh code tab. They type {prettyPhone((codeResult && codeResult.login_hint) || a.phone) || "their phone number"}, this
              code and a new password of their own. They do NOT need the old password. Every other device is signed out.
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" style={btn("plain", true)} onClick={async () => { setCopied(await copyText(code)); }}>
                <Lock size={16} /> {copied ? "Copied" : "Copy code"}
              </button>
              {wa ? (
                <a href={"https://wa.me/" + wa + "?text=" + encodeURIComponent(waMessage)} target="_blank" rel="noopener noreferrer" style={{ ...btn("primary", true), textDecoration: "none" }}>
                  Send on WhatsApp
                </a>
              ) : null}
            </div>
          </div>
        ) : null}
        <button type="button" style={{ ...btn("plain", true), marginTop: 12 }} onClick={() => { setResult(null); setCodeResult(null); onDone(); }}>
          {code ? "I have sent it - hide it" : "Close"}
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
        <input type="checkbox" checked={sendCode} onChange={(e) => setSendCode(e.target.checked)} />
        <span>
          <b>Send a reset code - they forgot their password.</b> They will NOT need the old password: in the app they
          tap Forgot password, then the Bambeh code tab, type the code and choose a new password. Works once, expires in 24 hours.
        </span>
      </label>
      <label style={{ display: "flex", gap: 8, alignItems: "flex-start", opacity: sendCode ? 0.55 : 1 }}>
        <input type="checkbox" disabled={sendCode} checked={requireChange && !sendCode} onChange={(e) => setRequireChange(e.target.checked)} />
        <span>
          <b>Ask for a new password after their next sign-in</b> - they still sign in with their CURRENT password first.
          Use this when they remember it but someone else may know it.{sendCode ? " (Not needed: the reset code already makes them choose one.)" : ""}
        </span>
      </label>
      <label style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <input type="checkbox" checked={signOutAll} onChange={(e) => setSignOutAll(e.target.checked)} />
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
            Only the owner may ever know their password. A reset code is a key to the account: send it only to the
            number registered on the account, after you are sure it is them.
          </span>
        </label>
      ) : null}
      <input
        style={input}
        maxLength={300}
        placeholder="Why? For the audit log, e.g. 'owner called from their number, lost password'"
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


/* ============================ FIX628 - PASSWORD REQUESTS ============================ */
type HelpRequest = {
  id: string;
  request_no: string;
  created_at: string;
  expires_at: string;
  phone: string;
  user_id: string;
  full_name?: string | null;
  is_you?: boolean;
  can_manage?: boolean;
  paused?: boolean;
  security_answers?: number;
  passed_check_at?: string | null;
  open_requests?: number;
};
type HelpRecent = {
  id: string;
  request_no: string;
  status: string;
  created_at: string;
  decided_at?: string | null;
  completed_at?: string | null;
  approved_until?: string | null;
  method?: string | null;
  note?: string | null;
  phone: string;
  full_name?: string | null;
  decided_by_name?: string | null;
};
type HelpList = { ok?: boolean; reason?: string; rank?: number; pending?: HelpRequest[]; recent?: HelpRecent[] };
type DecideResult = { ok?: boolean; reason?: string; status?: string; approved_until?: string | null; request_no?: string; full_name?: string | null };

const REQ_REASONS: Record<string, string> = {
  not_pending: "Someone already decided this request. The list has been refreshed.",
  expired: "This request expired before anyone decided. Ask the owner to make a new one.",
  no_request: "That request no longer exists.",
  no_account: "That number has no Bambeh account.",
};
const METHOD_SHORT: Record<string, string> = {
  security_questions: "passed the security questions",
  called_registered_number: "called the registered number",
  id_card_seen: "saw the ID card",
  in_person: "met in person",
};
const errBox: React.CSSProperties = { color: "#991b1b", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "8px 10px", fontSize: 14 };

function minutesAgo(v: unknown): string {
  const d = new Date(String(v || ""));
  if (isNaN(d.getTime())) return "";
  const m = Math.max(0, Math.round((Date.now() - d.getTime()) / 60000));
  return m < 1 ? "just now" : m === 1 ? "1 minute ago" : m + " minutes ago";
}

function clock(v: unknown): string {
  const d = new Date(String(v || ""));
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function RequestCard({ r, onDone }: { r: HelpRequest; onDone: (msg: string) => void }) {
  const [method, setMethod] = useState("");
  const [note, setNote] = useState("");
  const [confirming, setConfirming] = useState<"" | "approve" | "refuse">("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const passed = !!r.passed_check_at;
  const who = r.full_name || prettyPhone(r.phone) || "this account";

  async function decide(approve: boolean): Promise<void> {
    setBusy(true);
    setErr(null);
    const res = await rpcRetry<DecideResult>("bambeh_admin_reset_request_decide", {
      p_request_id: r.id,
      p_approve: approve,
      p_verified_by: approve ? method : null,
      p_note: note.trim() || null,
    });
    setBusy(false);
    setConfirming("");
    if (res.error || !res.data) {
      setErr("Not done: " + (res.error || "no answer from Bambeh") + ".");
      return;
    }
    if (res.data.ok === false) {
      const why = String(res.data.reason || "");
      setErr(REQ_REASONS[why] || REASONS[why] || "Refused: " + why);
      if (why === "not_pending" || why === "expired") onDone("");
      return;
    }
    onDone(
      approve
        ? "Approved request #" + r.request_no + " for " + who + ". Their phone now asks them to choose a new password, until " +
            clock(res.data.approved_until) + ". The approval works only on the phone that asked."
        : "Refused request #" + r.request_no + " for " + who + ". Their screen now says the request was closed.",
    );
  }

  return (
    <div style={{ ...card, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Number on the owner's screen</div>
          <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", fontSize: 30, fontWeight: 800, letterSpacing: 4 }}>
            {r.request_no}
          </div>
        </div>
        <div style={{ textAlign: "end", fontSize: 13, color: "#334155" }}>
          <div><b>{r.full_name || "(no name on the account)"}</b></div>
          <div>{prettyPhone(r.phone)}</div>
          <div style={{ color: "#64748b" }}>asked {minutesAgo(r.created_at)}, open until {clock(r.expires_at)}</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {passed ? (
          <span style={pill("#15803d")}>Passed the security questions {minutesAgo(r.passed_check_at)}</span>
        ) : Number(r.security_answers || 0) >= 3 ? (
          <span style={pill("#64748b")}>No passed security check yet</span>
        ) : (
          <span style={pill("#b45309")}>Has not set security questions</span>
        )}
        {Number(r.open_requests || 0) > 1 ? (
          <span style={pill("#b91c1c")}>{r.open_requests} open requests for this account - approve only the number the owner reads to you</span>
        ) : null}
        {r.paused ? <span style={pill("#b91c1c")}>Account paused - switch it on in the account search below too</span> : null}
      </div>
      {!r.can_manage ? (
        <div style={{ fontSize: 13, color: "#475569" }}>{r.is_you ? REASONS.self : REASONS.rank}</div>
      ) : (
        <>
          <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.5 }}>
            First confirm it is the owner: call or message the number registered on the account, or see them or their ID card.
            Then ask them to read you the number on their screen. Approve only if they say <b>{r.request_no}</b>.
          </div>
          <select style={input} value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="">How did you confirm it is really them? (needed to approve)</option>
            {METHODS.map((m) => (
              <option key={m.key} value={m.key} disabled={m.key === "security_questions" && !passed}>
                {m.label}
                {m.key === "security_questions" && !passed ? " - no passed check yet" : ""}
              </option>
            ))}
          </select>
          <input
            style={input}
            maxLength={300}
            placeholder={"Note for the audit log, e.g. 'called their number, they read " + r.request_no + "'"}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          {err ? <div style={errBox}>{err}</div> : null}
          {confirming ? (
            <div style={{ ...card, background: "#fffbeb", borderColor: "#fde68a" }}>
              <div style={{ marginBottom: 8, fontSize: 14 }}>
                {confirming === "approve" ? (
                  <>
                    Approve request <b>#{r.request_no}</b> for <b>{who}</b>? They will choose a new password on their phone.
                    This is logged with your name and every staff member can see it.
                  </>
                ) : (
                  <>
                    Refuse request <b>#{r.request_no}</b>? Their screen will say the request was closed.
                  </>
                )}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button type="button" style={btn(confirming === "approve" ? "primary" : "danger", !busy)} disabled={busy}
                  onClick={() => void decide(confirming === "approve")}>
                  {busy ? <Loader2 size={16} style={{ animation: "fix612spin 1s linear infinite" }} /> : null} Yes
                </button>
                <button type="button" style={btn("plain", !busy)} disabled={busy} onClick={() => setConfirming("")}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" style={btn("primary", method !== "")} disabled={method === ""} onClick={() => setConfirming("approve")}>
                <CheckCircle size={16} /> Approve - let them choose a new password
              </button>
              <button type="button" style={btn("danger", true)} onClick={() => setConfirming("refuse")}>
                Refuse
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function RequestsPanel() {
  const [pending, setPending] = useState<HelpRequest[]>([]);
  const [decided, setDecided] = useState<HelpRecent[]>([]);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [flash, setFlash] = useState("");

  const load = useCallback(async () => {
    const res = await rpcRetry<HelpList>("bambeh_admin_reset_requests", { p_limit: 40 });
    if (res.missing) {
      setMissing(true);
    } else if (res.error || !res.data) {
      setErr(res.error || "No answer from Bambeh.");
    } else if (res.data.ok === false) {
      setErr(REASONS[String(res.data.reason || "")] || String(res.data.reason));
    } else {
      setErr(null);
      setPending(res.data.pending || []);
      setDecided(res.data.recent || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, 15000);
    return () => window.clearInterval(id);
  }, [load]);

  if (missing) {
    return (
      <div style={{ ...card, background: "#fffbeb", borderColor: "#fde68a", marginBottom: 14, fontSize: 14 }}>
        <b>Password requests are not switched on yet.</b> Run FIX626 in Supabase, SQL Editor.
      </div>
    );
  }

  return (
    <section style={{ marginBottom: 18 }} data-fix="FIX628">
      <h2 style={{ fontSize: 17, margin: "6px 0 8px", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <Lock size={18} /> Password requests waiting
        {pending.length ? <span style={pill("#b91c1c")}>{pending.length}</span> : null}
        <button type="button" onClick={() => { setLoading(true); void load(); }} disabled={loading}
          style={{ ...btn("plain", !loading), marginInlineStart: "auto", padding: "6px 10px" }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </h2>
      <p style={{ margin: "0 0 10px", color: "#475569", fontSize: 13, lineHeight: 1.5 }}>
        An owner who forgot their password types their number on the sign-in screen and asks Bambeh. Their request shows here
        with the 4-digit number on their phone. Approve only the number the owner reads to you: the approval then works on that
        phone alone, for 15 minutes, and they choose a new password without the old one. Your name goes on every decision.
      </p>
      {flash ? (
        <div style={{ ...card, background: "#f0fdf4", borderColor: "#bbf7d0", color: "#14532d", marginBottom: 8, fontSize: 14 }}>{flash}</div>
      ) : null}
      {err ? <div style={{ ...errBox, marginBottom: 8 }}>{err}</div> : null}
      {loading && pending.length === 0 ? (
        <div style={{ ...card, color: "#475569", fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <Loader2 size={16} style={{ animation: "fix612spin 1s linear infinite" }} /> Loading requests...
        </div>
      ) : pending.length === 0 ? (
        <div style={{ ...card, color: "#475569", fontSize: 14 }}>No requests waiting. This list refreshes by itself.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {pending.map((r) => (
            <RequestCard key={r.id} r={r} onDone={(msg) => { if (msg) setFlash(msg); void load(); }} />
          ))}
        </div>
      )}
      {decided.length ? (
        <div style={{ ...card, marginTop: 10, fontSize: 13, display: "flex", flexDirection: "column", gap: 6 }}>
          <b style={{ fontSize: 14 }}>Decided in the last 48 hours</b>
          {decided.map((x) => (
            <div key={x.id}>
              <span style={{ color: "#64748b" }}>{fmtWhen(x.decided_at || x.created_at)}</span>{" \u2014 "}
              #{x.request_no} <b>{x.full_name || prettyPhone(x.phone)}</b> ({prettyPhone(x.phone)}):{" "}
              {x.status === "refused" ? "refused" : "approved"} by <b>{x.decided_by_name || "staff"}</b>
              {x.method ? " (" + (METHOD_SHORT[String(x.method)] || String(x.method)) + ")" : ""}
              {x.status === "done" ? <span style={{ color: "#15803d" }}>{" \u2014 new password chosen at " + clock(x.completed_at)}</span> : null}
              {x.status === "approved" ? <span style={{ color: "#b45309" }}>{" \u2014 waiting for them to choose a password"}</span> : null}
              {x.note ? <span style={{ color: "#64748b" }}>{" \u2014 " + x.note}</span> : null}
            </div>
          ))}
        </div>
      ) : null}
    </section>
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
    <div data-fix="FIX628" translate="no" className="notranslate" style={embedded ? { ...page, padding: "4px 0 24px" } : page}>
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
        Approve password requests, switch an account back on, make its owner choose a new password, or send a reset code to an
        owner who is not at their phone. You are signed in as <b>{RANK_LABEL[rank] || "staff"}</b>. Everything here is written to
        the audit log with your name.
      </p>

      <RequestsPanel />

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
