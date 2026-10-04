// BAMBEH_DEPLOY_TOKEN__ADMIN_LISTINGS_REACTIVATE_FIX611_CLEAN
/**
 * FIX611 - Command Center tool: reactivate adverts.
 * Route: /#/admin/reactivate-listings   (staff only; English, like the rest of the Command Center)
 *
 * Shows every DORMANT advert - expired, or switched off - and brings back one,
 * several, or all of them for a chosen number of days. Drafts and adverts the
 * seller marked SOLD are never offered. Trash is admin-only.
 *
 * Every decision is made by the database (FIX610: bambeh_admin_listings_dormant,
 * bambeh_admin_listings_reactivate). This page cannot grant itself anything: a
 * moderator who edits it in devtools still gets "admin_only_all" from the server.
 * Each seller gets ONE notification per action, in their language when known,
 * telling them to remove anything already sold.
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, CheckSquare, Loader2, Power, RefreshCw, Search, Shield } from "lucide-react";

type Row = Record<string, unknown>;
type DormantResult = {
  ok?: boolean;
  reason?: string;
  actor_rank?: number;
  include_trashed?: boolean;
  total?: number;
  rows?: Row[];
  by_type?: Record<string, number>;
};
type ReactivateResult = {
  ok?: boolean;
  reason?: string;
  reactivated?: number;
  skipped?: Record<string, number>;
  live_until?: string;
  days?: number;
  sellers_notified?: number;
  notify_error?: string | null;
  audit?: string;
};
type Banner = { kind: "ok" | "err"; text: string } | null;

const PAGE = 200;

const REASONS: Record<string, string> = {
  not_signed_in: "Please sign in first.",
  not_staff: "Access denied \u2014 This area is for Bambeh staff only.",
  admin_only_all: "Only an admin or the super admin can reactivate every advert at once.",
  admin_only_trash: "Only an admin or the super admin can restore adverts from the trash.",
  nothing_selected: "Tick at least one advert first.",
  too_many: "Too many at once. Tick 2,000 or fewer, or use \u201cReactivate all\u201d.",
  listings_shape_unknown: "The adverts table has no status or expiry column, so there is nothing to switch back on.",
};

const SKIP_LABELS: Record<string, string> = {
  sold: "marked sold by the seller",
  draft: "unfinished draft",
  in_trash: "in the trash",
  not_found: "no longer exists",
};

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

function str(v: unknown): string {
  return v === null || v === undefined ? "" : String(v);
}

function fmtDate(v: unknown): string {
  const s = str(v);
  if (!s) return "";
  const d = new Date(s);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function firstImage(v: unknown): string {
  if (Array.isArray(v)) {
    for (const x of v) {
      const s = str(x);
      if (/^https?:\/\//i.test(s)) return s;
    }
  }
  const s = str(v);
  return /^https?:\/\//i.test(s) ? s : "";
}

function titleOf(r: Row): string {
  return str(r.title_text) || str(r.title) || str(r.name) || "(no title)";
}

function priceOf(r: Row): string {
  const p = r.price;
  const n = typeof p === "number" ? p : Number(str(p));
  if (!str(p) || !isFinite(n)) return "";
  return n.toLocaleString("en-GB") + " XAF";
}

function stateOf(r: Row): { label: string; color: string } {
  if (r.in_trash === true) return { label: "In trash", color: "#7c3aed" };
  if (r.is_expired === true) return { label: "Expired " + fmtDate(r.expires_at), color: "#b45309" };
  const s = str(r.status).toLowerCase();
  return { label: s ? s.charAt(0).toUpperCase() + s.slice(1) : "Off", color: "#b91c1c" };
}

const page: React.CSSProperties = { maxWidth: 980, margin: "0 auto", padding: "16px 14px 120px", color: "#0f172a" };
const card: React.CSSProperties = { background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 14 };
const chip = (on: boolean): React.CSSProperties => ({
  border: on ? "1.5px solid #0f766e" : "1.5px solid #cbd5e1",
  background: on ? "#ccfbf1" : "#ffffff",
  color: "#0f172a",
  borderRadius: 999,
  padding: "6px 12px",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
});
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
const input: React.CSSProperties = {
  border: "1.5px solid #cbd5e1",
  borderRadius: 10,
  padding: "9px 10px",
  fontSize: 14,
  background: "#ffffff",
  color: "#0f172a",
};

class Boundary extends React.Component<{ children: React.ReactNode }, { err: string | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { err: null };
  }
  static getDerivedStateFromError(e: unknown): { err: string } {
    return { err: String((e as { message?: string })?.message || e) };
  }
  componentDidCatch(e: unknown): void {
    console.error("[FIX611] Reactivate adverts crashed:", e);
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

function Inner({ embedded }: { embedded: boolean }) {
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [denied, setDenied] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [byType, setByType] = useState<Record<string, number>>({});
  const [rank, setRank] = useState(0);

  const [typeFilter, setTypeFilter] = useState("");
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [includeTrash, setIncludeTrash] = useState(false);

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [days, setDays] = useState(30);
  const [notify, setNotify] = useState(true);
  const [note, setNote] = useState("");

  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState<Banner>(null);
  const [confirmAll, setConfirmAll] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const load = useCallback(
    async (more: boolean) => {
      if (more) setLoadingMore(true);
      else setLoading(true);
      setLoadErr(null);
      const res = await rpcRetry<DormantResult>("bambeh_admin_listings_dormant", {
        p_type: typeFilter || null,
        p_search: search || null,
        p_include_trashed: includeTrash,
        p_limit: PAGE,
        p_offset: more ? rows.length : 0,
      });
      if (res.missing) {
        setMissing(true);
      } else if (res.error || !res.data) {
        setLoadErr(res.error || "No answer from Bambeh.");
      } else if (res.data.ok === false) {
        setDenied(res.data.reason || "not_staff");
      } else {
        const d = res.data;
        setDenied(null);
        setRank(Number(d.actor_rank || 0));
        setTotal(Number(d.total || 0));
        setByType(d.by_type || {});
        setRows((prev) => (more ? prev.concat(d.rows || []) : d.rows || []));
        if (!more) setSelected({});
      }
      setLoading(false);
      setLoadingMore(false);
    },
    [typeFilter, search, includeTrash, rows.length],
  );

  useEffect(() => {
    void load(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, search, includeTrash]);

  const selectedIds = useMemo(() => Object.keys(selected).filter((k) => selected[k]), [selected]);
  const allTypesCount = useMemo(() => Object.values(byType).reduce((a, b) => a + Number(b || 0), 0), [byType]);
  const isAdmin = rank >= 2;

  function toggle(id: string): void {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function selectAllShown(): void {
    const next: Record<string, boolean> = {};
    for (const r of rows) next[str(r.id)] = true;
    setSelected(next);
  }

  function describe(res: ReactivateResult): string {
    const n = Number(res.reactivated || 0);
    const parts: string[] = [];
    parts.push(
      n === 0
        ? "Nothing was switched back on."
        : n + (n === 1 ? " advert is" : " adverts are") + " back online until " + fmtDate(res.live_until) + ".",
    );
    const sk = res.skipped || {};
    const skipBits = Object.keys(sk)
      .filter((k) => Number(sk[k]) > 0)
      .map((k) => sk[k] + " " + (SKIP_LABELS[k] || k));
    if (skipBits.length) parts.push("Left alone: " + skipBits.join(", ") + ".");
    if (notify && n > 0) {
      parts.push(
        res.notify_error
          ? "Sellers were NOT told (" + res.notify_error + ")."
          : Number(res.sellers_notified || 0) + " seller(s) told.",
      );
    }
    if (res.audit && res.audit !== "ok") parts.push("Audit log problem: " + res.audit);
    return parts.join(" ");
  }

  async function run(all: boolean): Promise<void> {
    if (busy) return;
    if (!all && selectedIds.length === 0) {
      setBanner({ kind: "err", text: REASONS.nothing_selected });
      return;
    }
    setBusy(true);
    setBanner(null);
    const res = await rpcRetry<ReactivateResult>("bambeh_admin_listings_reactivate", {
      p_ids: all ? null : selectedIds,
      p_all: all,
      p_type: all ? typeFilter || null : null,
      p_days: days,
      p_include_trashed: includeTrash,
      p_notify: notify,
      p_note: note.trim() || null,
    });
    setBusy(false);
    setConfirmAll(false);
    setConfirmText("");
    if (res.missing) {
      setMissing(true);
      return;
    }
    if (res.error || !res.data) {
      setBanner({ kind: "err", text: "Not done: " + (res.error || "no answer from Bambeh") + ". Nothing was changed if this persists - try again." });
      return;
    }
    if (res.data.ok === false) {
      setBanner({ kind: "err", text: REASONS[res.data.reason || ""] || "Refused: " + str(res.data.reason) });
      return;
    }
    setBanner({ kind: "ok", text: describe(res.data) });
    setNote("");
    await load(false);
  }

  const spinStyle = <style>{"@keyframes fix611spin{to{transform:rotate(360deg)}}"}</style>;
  const spinner = (size: number) => (
    <Loader2 size={size} style={{ animation: "fix611spin 1s linear infinite" }} />
  );

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

  const typeKeys = Object.keys(byType).sort();

  return (
    <div data-fix="FIX611" translate="no" className="notranslate" style={embedded ? { ...page, padding: "4px 0 24px" } : page}>
      {spinStyle}
      <div style={{ display: embedded ? "none" : "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <a href="#/admin/center" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#0f766e", fontWeight: 600, textDecoration: "none" }}>
          <ArrowLeft size={18} /> Command Center
        </a>
        <a href="#/admin/account-recovery" style={{ color: "#0f766e", fontWeight: 600, textDecoration: "none" }}>
          Account recovery
        </a>
      </div>

      <h1 style={{ fontSize: 24, margin: "14px 0 4px" }}>Reactivate adverts</h1>
      <p style={{ margin: "0 0 14px", color: "#475569", fontSize: 14, lineHeight: 1.5 }}>
        Dormant adverts are ones that expired or were switched off. Bring back one, several, or all of them. Drafts and
        adverts the seller marked sold are never shown here. Each seller gets one message telling them their advert is
        live again and to remove anything already sold.
      </p>

      <div style={{ ...card, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button type="button" style={chip(typeFilter === "")} onClick={() => setTypeFilter("")}>
            All ({allTypesCount})
          </button>
          {typeKeys.map((k) => (
            <button key={k} type="button" style={chip(typeFilter === k)} onClick={() => setTypeFilter(k)}>
              {k} ({byType[k]})
            </button>
          ))}
        </div>

        <form
          style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(searchDraft.trim());
          }}
        >
          <input
            style={{ ...input, flex: "1 1 220px" }}
            placeholder="Search by advert title"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
          />
          <button type="submit" style={btn("plain", true)}>
            <Search size={16} /> Search
          </button>
          <button type="button" style={btn("plain", !loading)} disabled={loading} onClick={() => void load(false)}>
            <RefreshCw size={16} /> Refresh
          </button>
          {isAdmin ? (
            <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14 }}>
              <input type="checkbox" checked={includeTrash} onChange={(e) => setIncludeTrash(e.target.checked)} />
              Include adverts in the trash
            </label>
          ) : null}
        </form>

        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", fontSize: 14 }}>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            Keep online for
            <select style={input} value={days} onChange={(e) => setDays(Number(e.target.value))}>
              {[7, 14, 30, 60, 90].map((d) => (
                <option key={d} value={d}>
                  {d} days
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
            Tell the sellers
          </label>
          <input
            style={{ ...input, flex: "1 1 220px" }}
            maxLength={300}
            placeholder="Note for the audit log (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </div>

      {banner ? (
        <div
          role="status"
          style={{
            ...card,
            marginTop: 12,
            background: banner.kind === "ok" ? "#f0fdf4" : "#fef2f2",
            borderColor: banner.kind === "ok" ? "#bbf7d0" : "#fecaca",
            color: banner.kind === "ok" ? "#14532d" : "#991b1b",
            fontSize: 14,
          }}
        >
          {banner.text}
        </div>
      ) : null}

      {confirmAll ? (
        <div style={{ ...card, marginTop: 12, borderColor: "#fecaca", background: "#fff7f7" }}>
          <b>
            Put back online EVERY dormant advert{typeFilter ? " of type \u201c" + typeFilter + "\u201d" : ""}
            {includeTrash ? ", including the trash" : ""}: {total} advert(s), for {days} days.
          </b>
          <div style={{ fontSize: 14, marginTop: 6, color: "#475569" }}>
            {notify ? "Every seller concerned gets one message." : "Sellers will NOT be told."} Some of these may already be
            sold - that is why the message asks sellers to remove them. Type ALL to confirm.
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            <input style={input} value={confirmText} placeholder="ALL" onChange={(e) => setConfirmText(e.target.value)} />
            <button
              type="button"
              style={btn("danger", confirmText.trim() === "ALL" && !busy)}
              disabled={confirmText.trim() !== "ALL" || busy}
              onClick={() => void run(true)}
            >
              {busy ? spinner(16) : <Power size={16} />} Reactivate all {total}
            </button>
            <button type="button" style={btn("plain", true)} onClick={() => setConfirmAll(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "16px 0 8px", flexWrap: "wrap", gap: 8 }}>
        <b>
          {loading ? "Loading..." : total + " dormant advert(s)" + (search ? " matching \u201c" + search + "\u201d" : "")}
        </b>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" style={btn("plain", rows.length > 0)} disabled={rows.length === 0} onClick={selectAllShown}>
            <CheckSquare size={16} /> Select all shown
          </button>
          <button type="button" style={btn("plain", selectedIds.length > 0)} disabled={selectedIds.length === 0} onClick={() => setSelected({})}>
            Clear
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ ...card, textAlign: "center", padding: 30 }}>{spinner(26)}</div>
      ) : loadErr ? (
        <div style={{ ...card, background: "#fef2f2", borderColor: "#fecaca" }}>
          Could not load the adverts: {loadErr}
          <div>
            <button type="button" style={{ ...btn("plain", true), marginTop: 10 }} onClick={() => void load(false)}>
              <RefreshCw size={16} /> Try again
            </button>
          </div>
        </div>
      ) : rows.length === 0 ? (
        <div style={{ ...card, textAlign: "center", color: "#475569" }}>No dormant adverts. Everything that can be online is online.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rows.map((r) => {
            const id = str(r.id);
            const st = stateOf(r);
            const img = firstImage(r.images);
            const on = !!selected[id];
            return (
              <label
                key={id}
                style={{
                  ...card,
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  cursor: "pointer",
                  borderColor: on ? "#0f766e" : "#e2e8f0",
                  background: on ? "#f0fdfa" : "#ffffff",
                }}
              >
                <input type="checkbox" checked={on} onChange={() => toggle(id)} style={{ width: 20, height: 20 }} />
                {img ? (
                  <img src={img} alt="" style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 56, height: 56, borderRadius: 8, background: "#f1f5f9", flexShrink: 0 }} />
                )}
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{titleOf(r)}</div>
                  <div style={{ fontSize: 13, color: "#475569", marginTop: 2 }}>
                    {str(r.type) || "advert"}
                    {priceOf(r) ? " \u00b7 " + priceOf(r) : ""}
                    {" \u00b7 "}
                    {str(r.owner_name) || "unknown seller"}
                    {fmtDate(r.created_at) ? " \u00b7 posted " + fmtDate(r.created_at) : ""}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: st.color,
                    border: "1px solid " + st.color,
                    borderRadius: 999,
                    padding: "3px 8px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {st.label}
                </span>
              </label>
            );
          })}
          {rows.length < total ? (
            <button type="button" style={{ ...btn("plain", !loadingMore), alignSelf: "center" }} disabled={loadingMore} onClick={() => void load(true)}>
              {loadingMore ? spinner(16) : null} Load more ({total - rows.length} left)
            </button>
          ) : null}
        </div>
      )}

      <div
        style={{
          position: embedded ? "sticky" : "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          marginTop: embedded ? 16 : 0,
          borderRadius: embedded ? 12 : 0,
          background: "#ffffff",
          borderTop: "1px solid #e2e8f0",
          padding: "10px 14px",
          display: "flex",
          justifyContent: "center",
          gap: 10,
          flexWrap: "wrap",
          zIndex: 40,
        }}
      >
        <button
          type="button"
          style={btn("primary", selectedIds.length > 0 && !busy)}
          disabled={selectedIds.length === 0 || busy}
          onClick={() => void run(false)}
        >
          {busy ? spinner(16) : <Power size={16} />} Reactivate selected ({selectedIds.length})
        </button>
        {isAdmin ? (
          <button
            type="button"
            style={btn("danger", total > 0 && !busy)}
            disabled={total === 0 || busy}
            onClick={() => {
              setConfirmAll(true);
              setConfirmText("");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            Reactivate ALL {total}
            {typeFilter ? " " + typeFilter : ""}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default function AdminListingsReactivate({ embedded = false }: { embedded?: boolean }) {
  return (
    <Boundary>
      <Inner embedded={embedded} />
    </Boundary>
  );
}

export { AdminListingsReactivate };
// BAMBEH_END_TOKEN__ADMIN_LISTINGS_REACTIVATE__COMPLETE
