// BAMBEH_DEPLOY_TOKEN__ADMIN_REFUNDS_FIX636_CLEAN
/**
 * src/features/admin/AdminRefunds.tsx - Bambeh Marketplace
 *
 * FIX636 - Command Center: REFUND CLAIMS. The money-back guarantee, operated.
 *
 * A buyer who reports a problem before confirming receipt opens a CLAIM
 * (FIX634). Nothing moves until an admin or the super admin decides here:
 *   - "Refund the buyer"  -> payments/refund-escrow as staff: the ITEM PRICE goes
 *     back to the number that paid. Commission and charges are not refunded.
 *   - "Close the claim, pay the seller" -> payments/release-escrow as staff.
 * Moderators see every claim but cannot move money. The payments function
 * checks the rank again on the server; these buttons are not the lock.
 * Every decision is written to the staff audit log with the staff member's name.
 *
 * Reads bambeh_admin_refund_claims() (FIX635). Staff-facing: English only.
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import React, { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Claim = {
  order_id: string;
  status: string;
  amount_xaf: number | null;
  reason: string | null;
  failure_reason: string | null;
  claimed_at: string | null;
  order_number: string | null;
  order_status: string | null;
  escrow_status: string | null;
  total_xaf: number | null;
  item_price_xaf: number | null;
  paid_at: string | null;
  items: unknown;
  buyer_name: string | null;
  seller_name: string | null;
  payer_phone: string | null;
  seller_paid: boolean | null;
};
type Decided = {
  order_id: string;
  status: string;
  amount_xaf: number | null;
  order_number: string | null;
  buyer_name: string | null;
  decided_at: string | null;
  decided_by_name: string | null;
  decision_note: string | null;
  campay_reference: string | null;
};
type ClaimList = { ok?: boolean; reason?: string; rank?: number; can_decide?: boolean; open?: Claim[]; decided?: Decided[] };
type PayResult = { ok: boolean; message: string; status: string };

const PROJECT_FALLBACK = "https://rbjbdxefwzvgmioearie.supabase.co";
const REVIEW_HOURS = 72;

function paymentsUrl(): string {
  const raw = String(import.meta.env.VITE_SUPABASE_URL || "").trim().replace(/\/+$/, "");
  const base = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(raw) ? raw : PROJECT_FALLBACK;
  return base + "/functions/v1/payments";
}

/** Calls the payments function as the signed-in staff member. Never throws. */
async function callPayments(route: "refund-escrow" | "release-escrow", body: Record<string, unknown>): Promise<PayResult> {
  try {
    const { data: sess } = await supabase.auth.getSession();
    const token = sess?.session?.access_token;
    if (!token) return { ok: false, message: "Your session expired. Sign in again.", status: "" };
    const res = await fetch(paymentsUrl() + "/" + route, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
        apikey: String(import.meta.env.VITE_SUPABASE_ANON_KEY || ""),
      },
      body: JSON.stringify(body),
    });
    const raw = await res.text();
    let j: { success?: boolean; error?: string; data?: { message?: string; refundStatus?: string; payoutStatus?: string } } = {};
    try { j = raw ? JSON.parse(raw) : {}; } catch { /* not JSON */ }
    if (!res.ok || j.success === false) {
      return { ok: false, message: j.error || raw.slice(0, 200) || "HTTP " + res.status, status: "" };
    }
    const st = String(j.data?.refundStatus || j.data?.payoutStatus || "");
    const moved = route === "release-escrow" || st === "sent";
    return { ok: moved, message: j.data?.message || "Done.", status: st };
  } catch (e) {
    return { ok: false, message: "Could not reach Bambeh: " + (e instanceof Error ? e.message : String(e)), status: "" };
  }
}

const card: React.CSSProperties = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 14 };
const input: React.CSSProperties = { width: "100%", boxSizing: "border-box", border: "1px solid #cbd5e1", borderRadius: 10, padding: "9px 11px", fontSize: 14 };
const errBox: React.CSSProperties = { color: "#991b1b", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "8px 10px", fontSize: 14 };
const pill = (c: string): React.CSSProperties => ({ display: "inline-block", fontSize: 12, fontWeight: 700, color: c, border: "1px solid " + c, borderRadius: 999, padding: "2px 8px" });
const btn = (kind: "primary" | "danger" | "plain", on: boolean): React.CSSProperties => ({
  display: "inline-flex", alignItems: "center", gap: 6, border: kind === "plain" ? "1px solid #cbd5e1" : "none", borderRadius: 10,
  padding: "9px 13px", fontSize: 14, fontWeight: 700, cursor: on ? "pointer" : "not-allowed", opacity: on ? 1 : 0.5,
  background: kind === "primary" ? "#0f766e" : kind === "danger" ? "#b91c1c" : "#fff", color: kind === "plain" ? "#0f172a" : "#fff",
});

function xaf(n: number | null | undefined): string {
  const v = Math.round(Number(n || 0));
  return v.toLocaleString("en-US") + " XAF";
}
function when(v: string | null | undefined): string {
  const d = new Date(String(v || ""));
  return isNaN(d.getTime()) ? "-" : d.toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}
function firstTitle(items: unknown): string {
  if (Array.isArray(items) && items.length) {
    const it = items[0] as Record<string, unknown>;
    const t = it?.title ?? it?.name ?? it?.listingTitle;
    if (typeof t === "string" && t.trim()) return t.trim() + (items.length > 1 ? " +" + (items.length - 1) + " more" : "");
  }
  return "(item)";
}

function ClaimCard({ c, canDecide, onDone }: { c: Claim; canDecide: boolean; onDone: (msg: string, good: boolean) => void }) {
  const [note, setNote] = useState("");
  const [confirming, setConfirming] = useState<"" | "refund" | "release">("");
  const [busy, setBusy] = useState(false);
  const refund = Math.round(Number(c.amount_xaf || c.item_price_xaf || 0));
  const claimed = c.claimed_at ? new Date(c.claimed_at) : null;
  const due = claimed ? new Date(claimed.getTime() + REVIEW_HOURS * 3600 * 1000) : null;
  const overdue = !!due && due.getTime() < Date.now() && c.status === "requested";
  const label = c.order_number || c.order_id.slice(0, 8);

  async function go(kind: "refund" | "release") {
    setBusy(true);
    const r = await callPayments(kind === "refund" ? "refund-escrow" : "release-escrow", { orderId: c.order_id, note: note.trim() || undefined });
    setBusy(false);
    setConfirming("");
    onDone((kind === "refund" ? "Refund, order " : "Claim closed, order ") + label + ": " + r.message, r.ok);
  }

  return (
    <div style={{ ...card, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15 }}>{firstTitle(c.items)}</div>
          <div style={{ fontSize: 13, color: "#475569" }}>Order {label} - paid {when(c.paid_at)}</div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "flex-start" }}>
          {c.status === "requested" ? <span style={pill("#b45309")}>Claim waiting</span> : null}
          {c.status === "failed" ? <span style={pill("#b91c1c")}>Refund failed</span> : null}
          {c.status === "no_phone" ? <span style={pill("#b91c1c")}>No number to refund to</span> : null}
          {c.status === "pending" ? <span style={pill("#1d4ed8")}>Being sent</span> : null}
          {overdue ? <span style={pill("#b91c1c")}>Past the 72-hour promise</span> : null}
        </div>
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.6 }}>
        <div><b>Buyer:</b> {c.buyer_name || "(no name)"} - paid from {c.payer_phone || "unknown number"}</div>
        <div><b>Seller:</b> {c.seller_name || "(no name)"}</div>
        <div>
          <b>Refund if approved:</b> {xaf(refund)} (item price). The buyer paid {xaf(c.total_xaf)}; commission and charges are not refunded.
        </div>
        <div><b>Claim opened:</b> {when(c.claimed_at)}{due && c.status === "requested" ? " - decide by " + when(due.toISOString()) : ""}</div>
        {c.reason ? <div style={{ marginTop: 4, padding: "8px 10px", background: "#f8fafc", borderRadius: 10 }}>"{c.reason}"</div> : null}
        {c.failure_reason ? <div style={{ color: "#991b1b" }}>Last attempt: {c.failure_reason}</div> : null}
        {c.status === "no_phone" ? <div style={{ color: "#475569" }}>Ask the buyer for their mobile money number; it must be on their profile before you try again.</div> : null}
      </div>
      {c.seller_paid ? (
        <div style={errBox}>The seller was already paid for this order, so it cannot be refunded from here.</div>
      ) : c.status === "pending" ? (
        <div style={{ fontSize: 13, color: "#475569" }}>The transfer is being sent. Refresh in a minute.</div>
      ) : !canDecide ? (
        <div style={{ fontSize: 13, color: "#475569" }}>Only admins and the super admin can send refunds or close claims.</div>
      ) : (
        <>
          <input style={input} maxLength={300} value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="Note for the audit log, e.g. 'buyer sent photos, seller did not answer'" />
          {confirming ? (
            <div style={{ ...card, background: "#fffbeb", borderColor: "#fde68a" }}>
              <div style={{ marginBottom: 8, fontSize: 14 }}>
                {confirming === "refund"
                  ? "Send " + xaf(refund) + " back to " + (c.payer_phone || "the number that paid") + " now? This cannot be undone. Logged with your name."
                  : "Close this claim and pay the seller now? The buyer gets nothing back. Logged with your name."}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button type="button" style={btn(confirming === "refund" ? "primary" : "danger", !busy)} disabled={busy}
                  onClick={() => void go(confirming === "refund" ? "refund" : "release")}>
                  {busy ? <Loader2 size={16} style={{ animation: "fix636spin 1s linear infinite" }} /> : null} Yes, do it
                </button>
                <button type="button" style={btn("plain", !busy)} disabled={busy} onClick={() => setConfirming("")}>Cancel</button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" style={btn("primary", true)} onClick={() => setConfirming("refund")}>
                <CheckCircle size={16} /> {c.status === "requested" ? "Refund the buyer " + xaf(refund) : "Try the refund again"}
              </button>
              {c.status === "requested" ? (
                <button type="button" style={btn("danger", true)} onClick={() => setConfirming("release")}>
                  Close the claim, pay the seller
                </button>
              ) : null}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function AdminRefunds({ embedded = false }: { embedded?: boolean }) {
  const [list, setList] = useState<ClaimList | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [flash, setFlash] = useState<{ text: string; good: boolean } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("bambeh_admin_refund_claims", { p_limit: 60 });
      if (error) {
        setErr(/bambeh_admin_refund_claims|does not exist|schema cache/i.test(error.message || "")
          ? "Refund claims are not switched on yet: run FIX635 in Supabase, SQL Editor."
          : error.message || "Could not load the claims.");
      } else {
        const d = (data || {}) as ClaimList;
        if (d.ok === false) setErr(d.reason === "not_staff" ? "This is for Bambeh staff only." : String(d.reason));
        else { setErr(null); setList(d); }
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => { if (document.visibilityState === "visible") void load(); }, 30000);
    return () => window.clearInterval(id);
  }, [load]);

  const open = list?.open || [];
  const decided = list?.decided || [];
  const canDecide = list?.can_decide === true;

  return (
    <div style={{ padding: embedded ? 0 : 16, display: "flex", flexDirection: "column", gap: 12, fontFamily: "inherit" }} data-fix="FIX636">
      <style>{"@keyframes fix636spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}"}</style>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <h2 style={{ fontSize: 18, margin: 0 }}>Refund claims</h2>
        {open.length ? <span style={pill("#b91c1c")}>{open.length}</span> : null}
        <button type="button" style={{ ...btn("plain", !loading), marginInlineStart: "auto" }} disabled={loading} onClick={() => void load()}>
          {loading ? <Loader2 size={14} style={{ animation: "fix636spin 1s linear infinite" }} /> : <RefreshCw size={14} />} Refresh
        </button>
      </div>
      <p style={{ margin: 0, color: "#475569", fontSize: 13, lineHeight: 1.5 }}>
        Buyers who report a problem before confirming receipt appear here. The guarantee: a reply within 72 hours, and if the item
        never arrived or is clearly wrong, fake or broken, the item price goes back to the number that paid. Commission and charges are
        not refunded. While a claim is open the seller is not paid.
      </p>
      {flash ? (
        <div style={{ ...card, background: flash.good ? "#f0fdf4" : "#fef2f2", borderColor: flash.good ? "#bbf7d0" : "#fecaca", fontSize: 14, display: "flex", gap: 8 }}>
          {flash.good ? <CheckCircle size={18} color="#15803d" /> : <AlertTriangle size={18} color="#b91c1c" />} {flash.text}
        </div>
      ) : null}
      {err ? <div style={errBox}>{err}</div> : null}
      {!err && !loading && open.length === 0 ? <div style={{ ...card, color: "#475569", fontSize: 14 }}>No claims waiting.</div> : null}
      {open.map((c) => (
        <ClaimCard key={c.order_id} c={c} canDecide={canDecide} onDone={(text, good) => { setFlash({ text, good }); void load(); }} />
      ))}
      {decided.length ? (
        <div style={{ ...card, fontSize: 13, display: "flex", flexDirection: "column", gap: 6 }}>
          <b style={{ fontSize: 14 }}>Decided in the last 14 days</b>
          {decided.map((d) => (
            <div key={d.order_id + d.status}>
              <span style={{ color: "#64748b" }}>{when(d.decided_at)}</span>{" \u2014 "}
              order {d.order_number || d.order_id.slice(0, 8)} ({d.buyer_name || "buyer"}):{" "}
              {d.status === "sent" ? "refunded " + xaf(d.amount_xaf) : "claim closed, seller paid"} by <b>{d.decided_by_name || "staff"}</b>
              {d.campay_reference ? <span style={{ color: "#64748b" }}>{" \u2014 CamPay " + d.campay_reference}</span> : null}
              {d.decision_note ? <span style={{ color: "#64748b" }}>{" \u2014 " + d.decision_note}</span> : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
// BAMBEH_END_TOKEN__ADMIN_REFUNDS_FIX636__COMPLETE
