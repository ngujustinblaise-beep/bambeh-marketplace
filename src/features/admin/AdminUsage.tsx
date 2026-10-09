// BAMBEH_DEPLOY_TOKEN__ADMIN_USAGE_FIX666_CLEAN
/**
 * AdminUsage.tsx - FIX666 - Command Center > App usage
 * How many people use Bambeh: registered users, active users, who is live right
 * now, and phones, signed-in users and app opens for today, the last 7 days, the
 * last 30 days and this year - with a 30-day and a 12-month chart. Numbers come
 * from bambeh_admin_usage (FIX664), fed by the app's quiet signal (FIX665).
 * Staff only. Refreshes every minute. English, like the rest of the Command Center.
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useCallback, useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Activity, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Period = { key: string; label: string; since: string; visitors: number; users: number; opens: number };
type DayRow = { day: string; visitors: number; users: number; opens: number };
type MonthRow = { month: string; visitors: number; users: number; opens: number };
type Usage = {
  ok: boolean;
  reason?: string;
  today?: string;
  counting_since?: string | null;
  total_users?: number;
  new_users_today?: number;
  new_users_7d?: number;
  new_users_30d?: number;
  live_devices?: number;
  live_users?: number;
  periods?: Period[];
  daily?: DayRow[];
  monthly?: MonthRow[];
  platforms_30d?: Record<string, number>;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const num = (v: unknown): string => Number(v || 0).toLocaleString("en-US");
const fmtDay = (iso: string): string => {
  const p = String(iso || "").split("-");
  return p.length === 3 ? Number(p[2]) + " " + MONTHS[Number(p[1]) - 1] : String(iso);
};
const fmtMonth = (ym: string): string => {
  const p = String(ym || "").split("-");
  return p.length === 2 ? MONTHS[Number(p[1]) - 1] + " " + p[0].slice(2) : String(ym);
};
const PLATFORM: Record<string, string> = { web: "Website", installed: "Installed on home screen", "android-app": "Android app", ios: "iPhone" };

const card: CSSProperties = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 16 };
const small: CSSProperties = { fontSize: 12, color: "#64748b", marginTop: 4, lineHeight: 1.4 };
const big: CSSProperties = { fontSize: 30, fontWeight: 800, color: "#0f172a", lineHeight: 1.1 };
const th: CSSProperties = { textAlign: "left", padding: "8px 10px", fontSize: 12, color: "#475569", borderBottom: "1px solid #e2e8f0" };
const td: CSSProperties = { padding: "8px 10px", fontSize: 14, borderBottom: "1px solid #f1f5f9" };

function Stat({ title, value, sub }: { title: string; value: ReactNode; sub: ReactNode }) {
  return (
    <div style={card}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>{title}</div>
      <div style={{ ...big, marginTop: 6 }}>{value}</div>
      <div style={small}>{sub}</div>
    </div>
  );
}

function Bars({ rows, labelAt }: { rows: { key: string; value: number; tip: string }[]; labelAt: (i: number) => string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 120, minWidth: rows.length * 9 }}>
        {rows.map((r) => (
          <div key={r.key} title={r.tip}
            style={{ flex: 1, minWidth: 6, height: Math.max(2, Math.round((r.value / max) * 120)),
              background: r.value ? "#0d9488" : "#e2e8f0", borderRadius: "4px 4px 0 0" }} />
        ))}
      </div>
      <div style={{ display: "flex", gap: 3, marginTop: 4, minWidth: rows.length * 9 }}>
        {rows.map((r, i) => (
          <div key={r.key} style={{ flex: 1, minWidth: 6, fontSize: 10, color: "#64748b", textAlign: "center", whiteSpace: "nowrap" }}>
            {labelAt(i)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminUsage({ embedded = false }: { embedded?: boolean }) {
  const [data, setData] = useState<Usage | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [at, setAt] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const { data: d, error } = await supabase.rpc("bambeh_admin_usage");
      if (error) {
        const m = String(error.message || "");
        setErr(/bambeh_admin_usage|does not exist|schema cache|not find/i.test(m)
          ? "The usage counter is not installed yet: run FIX664 in Supabase (SQL Editor)."
          : "Could not load the numbers: " + m);
      } else if (!d || (d as Usage).ok === false) {
        setErr((d as Usage | null)?.reason === "staff_only" ? "Only Bambeh staff can see these numbers." : "Could not load the numbers.");
      } else {
        setData(d as Usage);
        setErr(null);
        setAt(new Date());
      }
    } catch {
      setErr("Could not load the numbers - check the connection and press Refresh.");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const t = window.setInterval(() => void load(), 60000);
    return () => window.clearInterval(t);
  }, [load]);

  const periods = data?.periods || [];
  const month = periods.find((p) => p.key === "month");
  const day = periods.find((p) => p.key === "day");
  const daily = data?.daily || [];
  const monthly = data?.monthly || [];
  const platforms = Object.entries(data?.platforms_30d || {}).sort((a, b) => b[1] - a[1]);

  return (
    <div style={{ padding: embedded ? 0 : 16, display: "flex", flexDirection: "column", gap: 16 }} data-fix="FIX666">
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <Activity size={22} color="#0d9488" />
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>App usage</h2>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: "#64748b" }}>{at ? "Updated " + at.toLocaleTimeString() : ""}</span>
        <button type="button" onClick={() => void load()} disabled={busy}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 10,
            border: "1px solid #cbd5e1", background: "#fff", cursor: busy ? "default" : "pointer", fontWeight: 600 }}>
          {busy ? <Loader2 size={16} /> : <RefreshCw size={16} />} Refresh
        </button>
      </div>

      {err ? (
        <div style={{ ...card, borderColor: "#fecaca", background: "#fef2f2", color: "#991b1b" }}>{err}</div>
      ) : null}

      {data ? (
        <>
          <div style={{ fontSize: 13, color: "#475569" }}>
            {data.counting_since
              ? "Counting since " + fmtDay(String(data.counting_since)) + ". Visits before that day were never recorded."
              : "No visits counted yet - counting starts as soon as people open the updated app."}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            <Stat title="Registered users" value={num(data.total_users)}
              sub={"+" + num(data.new_users_today) + " today \u00b7 +" + num(data.new_users_7d) + " in 7 days \u00b7 +" + num(data.new_users_30d) + " in 30 days"} />
            <Stat title="Active users" value={num(month?.users)} sub="signed in and used Bambeh in the last 30 days" />
            <Stat title="Live now" value={num(data.live_devices)}
              sub={"phones or browsers in the last 5 minutes \u00b7 " + num(data.live_users) + " signed in"} />
            <Stat title="Opens today" value={num(day?.opens)} sub={num(day?.visitors) + " phones or browsers today"} />
          </div>

          <div style={{ ...card, padding: 0, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>Period</th>
                  <th style={th}>Phones and browsers</th>
                  <th style={th}>Signed-in users</th>
                  <th style={th}>App opens</th>
                </tr>
              </thead>
              <tbody>
                {periods.map((p) => (
                  <tr key={p.key}>
                    <td style={{ ...td, fontWeight: 600 }}>{p.label}</td>
                    <td style={td}>{num(p.visitors)}</td>
                    <td style={td}>{num(p.users)}</td>
                    <td style={td}>{num(p.opens)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={card}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>Last 30 days - phones and browsers per day</div>
            <Bars
              rows={daily.map((r) => ({ key: r.day, value: Number(r.visitors || 0),
                tip: fmtDay(r.day) + ": " + num(r.visitors) + " phones, " + num(r.users) + " signed in, " + num(r.opens) + " opens" }))}
              labelAt={(i) => (i === 0 || i === daily.length - 1 || i % 7 === 0 ? fmtDay(daily[i].day) : "")} />
          </div>

          <div style={card}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>Last 12 months - phones and browsers per month</div>
            <Bars
              rows={monthly.map((r) => ({ key: r.month, value: Number(r.visitors || 0),
                tip: fmtMonth(r.month) + ": " + num(r.visitors) + " phones, " + num(r.users) + " signed in, " + num(r.opens) + " opens" }))}
              labelAt={(i) => fmtMonth(monthly[i].month)} />
          </div>

          {platforms.length ? (
            <div style={card}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>How people opened Bambeh (last 30 days)</div>
              {platforms.map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 14 }}>
                  <span>{PLATFORM[k] || k}</span>
                  <b>{num(v)}</b>
                </div>
              ))}
            </div>
          ) : null}

          <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>
            A phone or browser is counted once per period, signed in or not. Signed-in users are accounts. An open is a
            start of the app, or a return after 30 minutes away. Live means seen in the last 5 minutes. Nothing personal is
            stored: a random id kept on the phone, the account if signed in, and how the app was opened.
          </div>
        </>
      ) : !err ? (
        <div style={{ ...card, display: "flex", alignItems: "center", gap: 8, color: "#475569" }}>
          <Loader2 size={18} /> Loading the numbers...
        </div>
      ) : null}
    </div>
  );
}
// BAMBEH_END_TOKEN__ADMIN_USAGE_FIX666__COMPLETE
