// BAMBEH_DEPLOY_TOKEN__ADMIN_SECTION_GATES_FIX675_CLEAN
/**
 * AdminSectionGates.tsx - FIX675 - Command Center > Members-only sections
 *
 * One switch per section: is the detail page (or chat) for members only, or free?
 * Admins and the super admin change them; moderators can see them. Every change is
 * recorded with the staff member's name and the time (FIX671).
 *
 * The rules apply while the main paywall switch is ON. While it is set to free - the
 * sponsor banner shows - everything is open to everyone signed in. People see a change
 * the next time they open Bambeh. English, like the rest of the Command Center.
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useCallback, useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { Loader2, Lock, RefreshCw, Unlock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { resetSectionGates } from "@/hooks/useSectionGates";

type Row = { section: string; members_only: boolean; updated_at: string | null; updated_by_name: string | null };
type ListResult = { ok: boolean; reason?: string; rank?: number; can_change?: boolean; rows?: Row[] };

const INFO: Record<string, { label: string; covers: string; recommended: boolean; why: string }> = {
  marketplace: { label: "Marketplace item details", covers: "The item page: photos, description, Buy Now and Add to cart.", recommended: false,
    why: "Every sale pays Bambeh through Secured Pay. A wall here blocks the purchase itself." },
  farm_fresh: { label: "Farm Fresh item details", covers: "Produce pages, bought with Secured Pay.", recommended: false,
    why: "Same as the marketplace: the sale is where Bambeh earns." },
  food_gas: { label: "Gas & food details", covers: "Gas sellers, restaurants, grills and roasted fish (section coming).", recommended: false,
    why: "The businesses pay to be featured. Customers finding them is what they pay for." },
  rentals: { label: "Rental details", covers: "House and room pages, and chatting with the landlord.", recommended: true,
    why: "The house-agent replacement - the strongest reason to subscribe." },
  vehicles: { label: "Vehicle details", covers: "Vehicles to rent and to buy.", recommended: true,
    why: "Contact is the value; there is no in-app purchase to earn from." },
  services: { label: "Service details", covers: "Plumbers, electricians, tutors and every other service.", recommended: true,
    why: "Contact is the value; there is no in-app purchase to earn from." },
  exchange: { label: "Exchange details and offers", covers: "Swap pages and making an offer.", recommended: true,
    why: "Contact is the value; no money passes through Bambeh." },
  jobs: { label: "Job details", covers: "Job pages and applying.", recommended: false,
    why: "Job seekers have the least money, and jobs bring people to Bambeh. Employers can pay to feature a job later." },
  chat: { label: "Starting a chat", covers: "Opening the chat page and messaging an advertiser.", recommended: true,
    why: "Chat is the subscription's main promise." },
  chat_sellers: { label: "Sellers answering their messages", covers: "Free = anyone with an active advert can open chat and reply without subscribing.", recommended: false,
    why: "A paying member must never write to a seller who cannot answer." },
};

const card: CSSProperties = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 16 };
const pill = (on: boolean): CSSProperties => ({
  display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 999, padding: "4px 10px", fontSize: 12, fontWeight: 700,
  background: on ? "#fef3c7" : "#dcfce7", color: on ? "#92400e" : "#166534",
});
const btn = (enabled: boolean): CSSProperties => ({
  padding: "8px 12px", borderRadius: 10, border: "1px solid #cbd5e1", background: "#fff", fontWeight: 600,
  cursor: enabled ? "pointer" : "default", opacity: enabled ? 1 : 0.55,
});

function when(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : d.toLocaleString();
}

export default function AdminSectionGates({ embedded = false }: { embedded?: boolean }) {
  const [data, setData] = useState<ListResult | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: d, error } = await supabase.rpc("bambeh_admin_section_gates");
      if (error) {
        const m = String(error.message || "");
        setErr(/bambeh_admin_section_gates|does not exist|schema cache|not find/i.test(m)
          ? "The switches are not installed yet: run FIX671 in Supabase (SQL Editor)."
          : "Could not load the switches: " + m);
      } else if (!d || (d as ListResult).ok === false) {
        setErr("Only Bambeh staff can see these switches.");
      } else {
        setData(d as ListResult);
        setErr(null);
      }
    } catch {
      setErr("Could not load the switches - check the connection and press Refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const flip = async (row: Row) => {
    const info = INFO[row.section];
    const next = !row.members_only;
    const name = info ? info.label : row.section;
    const ok = typeof window === "undefined" ? true
      : window.confirm((next ? "Make \"" + name + "\" members only?" : "Make \"" + name + "\" free for everyone signed in?") +
          "\n\nPeople see the change the next time they open Bambeh. Your name is recorded.");
    if (!ok) return;
    setBusy(row.section);
    try {
      const { data: d, error } = await supabase.rpc("bambeh_admin_set_section_gate", { p_section: row.section, p_members_only: next });
      const r = (d || {}) as { ok?: boolean; reason?: string };
      if (error || !r.ok) {
        setErr(r.reason === "admins_only" ? "Only admins and the super admin can change these switches."
          : "Not changed: " + String(error?.message || r.reason || "no answer from Bambeh") + ".");
      } else {
        resetSectionGates();
        await load();
      }
    } finally {
      setBusy(null);
    }
  };

  const rows = data?.rows || [];
  const canChange = data?.can_change === true;

  return (
    <div style={{ padding: embedded ? 0 : 16, display: "flex", flexDirection: "column", gap: 14 }} data-fix="FIX675">
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <Lock size={22} color="#0d9488" />
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Members-only sections</h2>
        <span style={{ flex: 1 }} />
        <button type="button" onClick={() => void load()} disabled={loading} style={{ ...btn(!loading), display: "inline-flex", alignItems: "center", gap: 6 }}>
          {loading ? <Loader2 size={16} /> : <RefreshCw size={16} />} Refresh
        </button>
      </div>

      <div style={{ ...card, background: "#f0fdfa", borderColor: "#99f6e4", fontSize: 14, lineHeight: 1.6, color: "#134e4a" }}>
        Browsing the lists is always free. These switches decide which detail pages - and chat - need a subscription.
        They apply while the main paywall switch is <b>on</b>. While it is set to free (the sponsor banner shows),
        everything is open to everyone signed in. People see a change the next time they open Bambeh.
      </div>

      {err ? <div style={{ ...card, borderColor: "#fecaca", background: "#fef2f2", color: "#991b1b" }}>{err}</div> : null}
      {data && !canChange ? (
        <div style={{ ...card, fontSize: 14, color: "#475569" }}>Only admins and the super admin can change these switches.</div>
      ) : null}

      {rows.map((row) => {
        const info = INFO[row.section] || { label: row.section, covers: "", recommended: row.members_only, why: "" };
        const matches = info.recommended === row.members_only;
        return (
          <div key={row.section} style={{ ...card, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <b style={{ fontSize: 16 }}>{info.label}</b>
              <span style={pill(row.members_only)}>
                {row.members_only ? <Lock size={12} /> : <Unlock size={12} />} {row.members_only ? "Members only" : "Free"}
              </span>
              <span style={{ flex: 1 }} />
              {canChange ? (
                <button type="button" style={btn(busy === null)} disabled={busy !== null} onClick={() => void flip(row)}>
                  {busy === row.section ? "Saving..." : row.members_only ? "Make free" : "Make members only"}
                </button>
              ) : null}
            </div>
            <div style={{ fontSize: 13, color: "#475569" }}>{info.covers}</div>
            <div style={{ fontSize: 12, color: matches ? "#64748b" : "#b45309" }}>
              Recommended: {info.recommended ? "members only" : "free"} - {info.why}
              {matches ? "" : " (currently different from the recommendation)"}
            </div>
            {row.updated_by_name ? (
              <div style={{ fontSize: 12, color: "#64748b" }}>Last changed by {row.updated_by_name}, {when(row.updated_at)}</div>
            ) : null}
          </div>
        );
      })}

      {!data && !err ? (
        <div style={{ ...card, display: "flex", alignItems: "center", gap: 8, color: "#475569" }}>
          <Loader2 size={18} /> Loading the switches...
        </div>
      ) : null}
    </div>
  );
}
// BAMBEH_END_TOKEN__ADMIN_SECTION_GATES_FIX675__COMPLETE
