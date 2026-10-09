// BAMBEH_DEPLOY_TOKEN__ADMIN_SECTION_GATES_FIX681_CLEAN
/**
 * AdminSectionGates.tsx - FIX681 (replaces FIX675) - Command Center > Members-only sections
 *
 * One switch per module: does opening it need a subscription, or is it free?
 *   Adverts       - marketplace, Farm Fresh, gas & food, rentals, car rental, services,
 *                   exchange, jobs (the lists are always free to browse)
 *   Chat          - one choice for buyers and sellers: sellers free, everyone members
 *                   only, buyers free, or free for everyone
 *   Featured apps - Bambeh AI, bulk buying, flash deals, community, compare, quiz,
 *                   Zerm coins, corporate stores
 *   Free public services - pharmacies, hospitals, fuel at night, water & lights, safety
 * Admins and the super admin change them; moderators can see them. Every change is
 * recorded with the staff member's name and the time (FIX671, FIX677).
 *
 * The top line says whether the main Subscription wall is on: while it is set to free
 * (the sponsor banner shows), none of these switches applies to anyone.
 * English, like the rest of the Command Center.
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useCallback, useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { Loader2, Lock, MessageSquare, RefreshCw, Unlock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { resetSectionGates } from "@/hooks/useSectionGates";
import { usePaywall } from "@/hooks/usePaywall";

type Row = { section: string; members_only: boolean; updated_at: string | null; updated_by_name: string | null };
type ListResult = { ok: boolean; reason?: string; rank?: number; can_change?: boolean; rows?: Row[] };
type Info = { label: string; covers: string; recommended: boolean; why: string };

const MEMBER_FEATURE = "Listed in the subscription plans as a member feature.";

const INFO: Record<string, Info> = {
  marketplace: { label: "Marketplace item details", covers: "The item page: photos, description, Buy Now and Add to cart.", recommended: false,
    why: "Every sale pays Bambeh 1% through Secured Pay. A wall here blocks the purchase itself." },
  farm_fresh: { label: "Farm Fresh details", covers: "Produce pages, bought with Secured Pay.", recommended: false,
    why: "Same as the marketplace: the sale is where Bambeh earns." },
  food_gas: { label: "Gas & food details", covers: "Gas sellers, restaurants, grills and roasted fish (section coming).", recommended: true,
    why: "People pay for convenience: finding gas or a meal nearby, fast. The businesses still pay to be featured." },
  rentals: { label: "Rental details", covers: "House and room pages.", recommended: true,
    why: "The house-agent replacement - the strongest reason to subscribe." },
  vehicles: { label: "Car rental details", covers: "Vehicles to rent.", recommended: true,
    why: "Contact is the value; there is no in-app purchase to earn from." },
  services: { label: "Service details", covers: "Plumbers, electricians, tutors and every other service.", recommended: true,
    why: "Contact is the value; there is no in-app purchase to earn from." },
  exchange: { label: "Exchange details and offers", covers: "Swap pages and making an offer.", recommended: true,
    why: "Contact is the value; no money passes through Bambeh." },
  jobs: { label: "Job details", covers: "Job pages and applying.", recommended: false,
    why: "Job seekers have the least money, and jobs bring people to Bambeh. Employers can pay to feature a job later." },
  ai: { label: "Bambeh AI", covers: "The AI assistant.", recommended: true, why: MEMBER_FEATURE },
  group_buying: { label: "Bulk buying", covers: "Opening a group deal and joining it (the list stays free to browse).", recommended: true, why: MEMBER_FEATURE },
  flash_deals: { label: "Flash deals", covers: "The flash deals page.", recommended: true, why: MEMBER_FEATURE },
  community: { label: "Community", covers: "Community posts and discussions.", recommended: true, why: MEMBER_FEATURE },
  compare: { label: "Compare items", covers: "The side-by-side comparison tool.", recommended: true,
    why: "A convenience tool - the kind of thing people subscribe for." },
  quiz: { label: "Quiz", covers: "The Bambeh quiz.", recommended: true, why: "Built as a subscribers-only feature." },
  coins: { label: "Zerm coins", covers: "People's reward points page.", recommended: false,
    why: "They are people's own reward points - hiding them feels like taking them away." },
  corporate: { label: "Corporate stores", covers: "Company storefronts and their products.", recommended: false,
    why: "Sales earn the 1%, like the marketplace." },
  free_services: { label: "Free public services", covers: "Pharmacies on call, hospitals on duty, fuel at night, water & lights, safety alerts.", recommended: false,
    why: "Someone looking for medicine at 2 a.m. must never meet a payment. These pages also bring people to Bambeh every day." },
};

const GROUPS: Array<{ title: string; note: string; keys: string[] }> = [
  { title: "Adverts", note: "The lists are always free to browse. These decide whether opening an advert needs a subscription.",
    keys: ["marketplace", "farm_fresh", "food_gas", "rentals", "vehicles", "services", "exchange", "jobs"] },
  { title: "Featured apps", note: "The whole tool - or, for bulk buying, opening one group deal.",
    keys: ["ai", "group_buying", "flash_deals", "community", "compare", "quiz", "coins", "corporate"] },
  { title: "Free public services", note: "One switch for all five pages.", keys: ["free_services"] },
];

type ChatChoice = { key: string; label: string; buyers: boolean; sellers: boolean; note: string; recommended?: boolean };
const CHAT_CHOICES: ChatChoice[] = [
  { key: "sellers-free", label: "Sellers free, buyers subscribe", buyers: true, sellers: false, recommended: true,
    note: "Anyone with a live advert can open chat and answer. A paying member never writes to a seller who cannot reply." },
  { key: "all-members", label: "Members only for everyone", buyers: true, sellers: true,
    note: "Sellers must subscribe too before they can read or answer a message." },
  { key: "buyers-free", label: "Buyers free, sellers subscribe", buyers: false, sellers: true,
    note: "Buyers write for free; sellers pay to answer." },
  { key: "all-free", label: "Free for everyone", buyers: false, sellers: false,
    note: "Chat is open to everyone signed in." },
];

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

function ask(message: string): boolean {
  return typeof window === "undefined" ? true : window.confirm(message + "\n\nPeople see the change the next time they open Bambeh. Your name is recorded.");
}

export default function AdminSectionGates({ embedded = false }: { embedded?: boolean }) {
  const [data, setData] = useState<ListResult | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const wall = usePaywall();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: d, error } = await supabase.rpc("bambeh_admin_section_gates");
      if (error) {
        const m = String(error.message || "");
        setErr(/bambeh_admin_section_gates|does not exist|schema cache|not find/i.test(m)
          ? "The switches are not installed yet: run FIX671 and FIX677 in Supabase (SQL Editor)."
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

  const refused = (reason: string | undefined, message: string | undefined): string =>
    reason === "admins_only" ? "Only admins and the super admin can change these switches."
      : reason === "unknown_section" ? "This switch is not installed yet: run FIX677 in Supabase (SQL Editor)."
      : "Not changed: " + String(message || reason || "no answer from Bambeh") + ".";

  const flip = async (row: Row) => {
    const name = INFO[row.section] ? INFO[row.section].label : row.section;
    const next = !row.members_only;
    if (!ask(next ? "Make \"" + name + "\" members only?" : "Make \"" + name + "\" free for everyone?")) return;
    setBusy(row.section);
    try {
      const { data: d, error } = await supabase.rpc("bambeh_admin_set_section_gate", { p_section: row.section, p_members_only: next });
      const r = (d || {}) as { ok?: boolean; reason?: string };
      if (error || !r.ok) {
        setErr(refused(r.reason, error?.message));
      } else {
        resetSectionGates();
        await load();
      }
    } finally {
      setBusy(null);
    }
  };

  const setChat = async (choice: ChatChoice) => {
    if (!ask("Chat: \"" + choice.label + "\"?")) return;
    setBusy("chat");
    try {
      const { data: d, error } = await supabase.rpc("bambeh_admin_set_chat_gates", {
        p_buyers_members_only: choice.buyers, p_sellers_members_only: choice.sellers,
      });
      const r = (d || {}) as { ok?: boolean; reason?: string };
      if (error) {
        setErr(/bambeh_admin_set_chat_gates|does not exist|schema cache|not find/i.test(String(error.message || ""))
          ? "The chat choice is not installed yet: run FIX677 in Supabase (SQL Editor)."
          : refused(undefined, error.message));
      } else if (!r.ok) {
        setErr(refused(r.reason, undefined));
      } else {
        resetSectionGates();
        await load();
      }
    } finally {
      setBusy(null);
    }
  };

  const rows = data?.rows || [];
  const byKey: Record<string, Row> = {};
  for (const r of rows) byKey[r.section] = r;
  const canChange = data?.can_change === true;
  const missing = data ? Object.keys(INFO).concat(["chat", "chat_sellers"]).filter((k) => !byKey[k]) : [];
  const chatRow = byKey.chat;
  const sellersRow = byKey.chat_sellers;
  const chatNow = chatRow && sellersRow
    ? CHAT_CHOICES.find((c) => c.buyers === chatRow.members_only && c.sellers === sellersRow.members_only) || null
    : null;
  const chatChanged = [chatRow, sellersRow].filter((r): r is Row => !!r && !!r.updated_by_name)
    .sort((a, b) => String(b.updated_at || "").localeCompare(String(a.updated_at || "")))[0];

  const wallLine = !wall.ready ? null
    : wall.free && wall.reason === "global"
      ? { tone: "amber", text: "The Subscription wall is set to FREE for everyone right now, so none of these switches applies yet. They take effect the moment you switch the wall on (Command Center > Subscription wall)." }
      : wall.free && wall.reason === "region"
        ? { tone: "amber", text: "The Subscription wall is set to free in your region" + (wall.region ? " (" + wall.region + ")" : "") + ", so these switches do not apply there yet." }
        : !wall.free && wall.reason !== "error"
          ? { tone: "green", text: "The Subscription wall is ON: these switches are live for everyone who is not a member." }
          : null;

  const renderRow = (key: string) => {
    const row = byKey[key];
    if (!row) return null;
    const info = INFO[key] || { label: key, covers: "", recommended: row.members_only, why: "" };
    const matches = info.recommended === row.members_only;
    return (
      <div key={key} style={{ ...card, display: "flex", flexDirection: "column", gap: 8 }} data-section={key}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <b style={{ fontSize: 16 }}>{info.label}</b>
          <span style={pill(row.members_only)}>
            {row.members_only ? <Lock size={12} /> : <Unlock size={12} />} {row.members_only ? "Members only" : "Free"}
          </span>
          <span style={{ flex: 1 }} />
          {canChange ? (
            <button type="button" style={btn(busy === null)} disabled={busy !== null} onClick={() => void flip(row)}>
              {busy === key ? "Saving..." : row.members_only ? "Make free" : "Make members only"}
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
  };

  return (
    <div style={{ padding: embedded ? 0 : 16, display: "flex", flexDirection: "column", gap: 14 }} data-fix="FIX681">
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <Lock size={22} color="#0d9488" />
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Members-only sections</h2>
        <span style={{ flex: 1 }} />
        <button type="button" onClick={() => void load()} disabled={loading} style={{ ...btn(!loading), display: "inline-flex", alignItems: "center", gap: 6 }}>
          {loading ? <Loader2 size={16} /> : <RefreshCw size={16} />} Refresh
        </button>
      </div>

      {wallLine ? (
        <div data-wall={wallLine.tone} style={{ ...card, fontSize: 14, lineHeight: 1.6,
          background: wallLine.tone === "green" ? "#f0fdf4" : "#fffbeb", borderColor: wallLine.tone === "green" ? "#bbf7d0" : "#fde68a",
          color: wallLine.tone === "green" ? "#166534" : "#92400e" }}>
          {wallLine.text}
        </div>
      ) : null}

      <div style={{ ...card, background: "#f0fdfa", borderColor: "#99f6e4", fontSize: 14, lineHeight: 1.6, color: "#134e4a" }}>
        Each switch decides whether a part of Bambeh needs a subscription. Members and staff always get in.
        People see a change the next time they open Bambeh - on the website and in the Android app alike.
      </div>

      {err ? <div style={{ ...card, borderColor: "#fecaca", background: "#fef2f2", color: "#991b1b" }}>{err}</div> : null}
      {missing.length > 0 ? (
        <div style={{ ...card, borderColor: "#fde68a", background: "#fffbeb", color: "#92400e", fontSize: 14 }}>
          {missing.length} {missing.length === 1 ? "switch is" : "switches are"} not installed yet: run FIX677 in Supabase (SQL Editor), then press Refresh.
        </div>
      ) : null}
      {data && !canChange ? (
        <div style={{ ...card, fontSize: 14, color: "#475569" }}>Only admins and the super admin can change these switches.</div>
      ) : null}

      {data ? (
        <>
          <h3 style={{ margin: "6px 0 0", fontSize: 17, fontWeight: 800 }}>{GROUPS[0].title}</h3>
          <div style={{ fontSize: 13, color: "#475569" }}>{GROUPS[0].note}</div>
          {GROUPS[0].keys.map(renderRow)}

          <h3 style={{ margin: "6px 0 0", fontSize: 17, fontWeight: 800 }}>Chat and messages</h3>
          <div style={{ ...card, display: "flex", flexDirection: "column", gap: 10 }} data-section="chat">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <MessageSquare size={18} color="#0d9488" />
              <b style={{ fontSize: 16 }}>Who can chat without a subscription?</b>
            </div>
            <div style={{ fontSize: 13, color: "#475569" }}>
              Sellers = anyone with a live advert, Farm Fresh produce or exchange item. Buyers = everyone else.
            </div>
            {CHAT_CHOICES.map((c) => {
              const on = !!chatNow && chatNow.key === c.key;
              return (
                <div key={c.key} data-choice={c.key} style={{ border: on ? "2px solid #0d9488" : "1px solid #e2e8f0", borderRadius: 12, padding: 12,
                  background: on ? "#f0fdfa" : "#fff", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontWeight: 700 }}>
                      {c.label}{c.recommended ? " (recommended)" : ""}{on ? " - current" : ""}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{c.note}</div>
                  </div>
                  {canChange && !on ? (
                    <button type="button" style={btn(busy === null)} disabled={busy !== null} onClick={() => void setChat(c)}>
                      {busy === "chat" ? "Saving..." : "Choose"}
                    </button>
                  ) : null}
                </div>
              );
            })}
            {chatChanged ? (
              <div style={{ fontSize: 12, color: "#64748b" }}>Last changed by {chatChanged.updated_by_name}, {when(chatChanged.updated_at)}</div>
            ) : null}
          </div>

          {GROUPS.slice(1).map((g) => (
            <div key={g.title} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <h3 style={{ margin: "6px 0 0", fontSize: 17, fontWeight: 800 }}>{g.title}</h3>
              <div style={{ fontSize: 13, color: "#475569" }}>{g.note}</div>
              {g.keys.map(renderRow)}
            </div>
          ))}
        </>
      ) : null}

      {!data && !err ? (
        <div style={{ ...card, display: "flex", alignItems: "center", gap: 8, color: "#475569" }}>
          <Loader2 size={18} /> Loading the switches...
        </div>
      ) : null}
    </div>
  );
}
// BAMBEH_END_TOKEN__ADMIN_SECTION_GATES_FIX681__COMPLETE
