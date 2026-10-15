// BAMBEH_DEPLOY_TOKEN__ADMIN_USAGE_FIX781_CLEAN
/**
 * AdminUsage.tsx - FIX781 (replaces FIX666) - Command Center > App usage
 *
 * Two tabs:
 *  VISITS (as FIX666): registered users, active users, who is live right now, and phones, signed-in users and app
 *    opens for today, the last 7 days, the last 30 days and this year, with a 30-day and a 12-month chart
 *    (bambeh_admin_usage, FIX664). The Android app is now counted as the Android app (FIX780).
 *  SIGN-UPS & SIGN-INS (new) - Big, 15 Oct 2026: "build a check system to track how many users sign in, how many
 *    users visit, and how we can improve and make users sign in" (bambeh_admin_growth, FIX773):
 *      - visitors and how many of them were signed in; new accounts; accounts that signed in; who came back
 *      - the sign-up page step by step (opened, Create pressed, created) and WHY people stopped
 *      - the sign-in page step by step and why sign-ins failed
 *      - where new accounts come from (contact a seller, post an advert, free services, the Sign up button)
 *      - their languages and countries, and tries from countries that are not open yet
 *      - "How to get more people signed in": what these numbers say to do next
 * Staff only. Refreshes every minute. English, like the rest of the Command Center.
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useCallback, useEffect, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { Activity, Loader2, RefreshCw, UserPlus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { countryName } from '@/lib/africa/countries';

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
type GDay = {
  day: string; visitors: number; new_visitors: number; users_active: number; new_accounts: number; join_open: number;
  join_created: number; signin_ok: number; signin_failed: number; sign_ins_log: number | null;
};
type Totals = {
  visitors: number; new_visitors: number; visitors_signed_in: number; users_active: number; opens: number; accounts_total: number;
  new_accounts: number; new_accounts_phone: number; users_signed_in: number; sign_ins_log: number | null; join_open: number;
  join_submit: number; join_created: number; join_failed: number; signin_open: number; signin_submit: number; signin_ok: number;
  signin_failed: number; new_accounts_old_enough: number; came_back: number;
};
type Growth = {
  ok: boolean; reason?: string; days?: number; since?: string; today?: string; visits_since?: string | null; steps_since?: string | null;
  audit_log?: boolean; totals?: Totals; daily?: GDay[]; join_reasons?: Record<string, number>; signin_reasons?: Record<string, number>;
  doors?: Record<string, { open: number; created: number }>; langs?: Record<string, number>; countries?: Record<string, number>;
  closed_countries?: Record<string, number>; modes?: Record<string, number>; platforms?: Record<string, number>;
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const num = (v: unknown): string => Number(v || 0).toLocaleString('en-US');
const fmtDay = (iso: string): string => {
  const p = String(iso || '').split('-');
  return p.length === 3 ? Number(p[2]) + ' ' + MONTHS[Number(p[1]) - 1] : String(iso);
};
const fmtMonth = (ym: string): string => {
  const p = String(ym || '').split('-');
  return p.length === 2 ? MONTHS[Number(p[1]) - 1] + ' ' + p[0].slice(2) : String(ym);
};
const pct = (a: number, b: number): number | null => (b > 0 ? Math.round((100 * a) / b) : null);
const pctText = (a: number, b: number): string => { const p = pct(a, b); return p === null ? '-' : p + '%'; };
const PLATFORM: Record<string, string> = { web: 'Website', installed: 'Installed on home screen', 'android-app': 'Android app', ios: 'iPhone' };
const JOIN_REASON: Record<string, string> = {
  name: 'No name written', phone: 'Phone number not valid', closed: 'Country not open yet', email: 'Email address not valid',
  password: 'Password under 8 characters', consent: 'The box was not ticked', exists: 'Number or email already has an account',
  weak: 'Password refused as too weak', rate: 'Too many tries', net: 'No network', db: 'Database error', other: 'Other',
};
const SIGNIN_REASON: Record<string, string> = {
  invalid: 'Not a phone number or email', password: 'Password missing or under 8 characters', wrong: 'Wrong number/email or password',
  paused: 'Account paused', net: 'No network', other: 'Other',
};
const DOOR: Record<string, string> = {
  contact: 'Contact a seller', post: 'Post an advert', free: 'Free services (pharmacies, women\'s health...)', direct: 'Sign up button or link',
};
const LANG: Record<string, string> = { en: 'English', fr: 'French', pidgin: 'Pidgin', ar: 'Arabic', ff: 'Fulfulde' };

const card: CSSProperties = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 16 };
const small: CSSProperties = { fontSize: 12, color: '#64748b', marginTop: 4, lineHeight: 1.4 };
const big: CSSProperties = { fontSize: 30, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 };
const th: CSSProperties = { textAlign: 'left', padding: '8px 10px', fontSize: 12, color: '#475569', borderBottom: '1px solid #e2e8f0' };
const td: CSSProperties = { padding: '8px 10px', fontSize: 14, borderBottom: '1px solid #f1f5f9' };
const tab = (on: boolean): CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer',
  border: '1px solid ' + (on ? '#0d9488' : '#cbd5e1'), background: on ? '#0d9488' : '#fff', color: on ? '#fff' : '#334155',
});

function Stat({ title, value, sub }: { title: string; value: ReactNode; sub: ReactNode }) {
  return (
    <div style={card}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{title}</div>
      <div style={{ ...big, marginTop: 6 }}>{value}</div>
      <div style={small}>{sub}</div>
    </div>
  );
}

function Bars({ rows, labelAt, color = '#0d9488' }: { rows: { key: string; value: number; tip: string }[]; labelAt: (i: number) => string; color?: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 120, minWidth: rows.length * 9 }}>
        {rows.map((r) => (
          <div key={r.key} title={r.tip}
            style={{ flex: 1, minWidth: 6, height: Math.max(2, Math.round((r.value / max) * 120)), background: r.value ? color : '#e2e8f0', borderRadius: '4px 4px 0 0' }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 3, marginTop: 4, minWidth: rows.length * 9 }}>
        {rows.map((r, i) => (
          <div key={r.key} style={{ flex: 1, minWidth: 6, fontSize: 10, color: '#64748b', textAlign: 'center', whiteSpace: 'nowrap' }}>{labelAt(i)}</div>
        ))}
      </div>
    </div>
  );
}

/** One step of a funnel: a bar as wide as its share of the first step. */
function Step({ label, n, of, first }: { label: string; n: number; of: number | null; first: number }) {
  const w = first > 0 ? Math.max(2, Math.round((100 * n) / first)) : 2;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
        <span>{label}</span>
        <span><b>{num(n)}</b>{of !== null ? <span style={{ color: '#64748b' }}> ({pctText(n, of)} of the step before)</span> : null}</span>
      </div>
      <div style={{ height: 10, background: '#f1f5f9', borderRadius: 999, marginTop: 4 }}>
        <div style={{ width: w + '%', height: 10, background: '#0d9488', borderRadius: 999 }} />
      </div>
    </div>
  );
}

function ReasonList({ map, labels, empty }: { map: Record<string, number> | undefined; labels: Record<string, string>; empty: string }) {
  const rows = Object.entries(map || {}).sort((a, b) => b[1] - a[1]);
  if (!rows.length) return <div style={{ fontSize: 13, color: '#64748b' }}>{empty}</div>;
  const total = rows.reduce((a, r) => a + r[1], 0);
  return (
    <div>
      {rows.map(([k, v]) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '4px 0', borderBottom: '1px solid #f8fafc' }}>
          <span>{labels[k] || k}</span>
          <span><b>{num(v)}</b> <span style={{ color: '#64748b' }}>({pctText(v, total)})</span></span>
        </div>
      ))}
    </div>
  );
}

function top(map: Record<string, number> | undefined): [string, number] | null {
  const rows = Object.entries(map || {}).sort((a, b) => b[1] - a[1]);
  return rows.length ? rows[0] : null;
}

/** What the numbers say to do next. Plain rules, each tied to a number on this screen. */
export function growthHints(g: Growth): string[] {
  const t = g.totals;
  if (!t) return [];
  const out: string[] = [];
  const signed = pct(t.visitors_signed_in, t.visitors);
  if (t.visitors >= 10 && signed !== null && signed < 40) {
    out.push('Only ' + signed + '% of the phones that opened Bambeh were signed in. Most people look around without an account. "Contact the seller", '
      + '"Post an advert" and the free services already ask for the 30-second account - field agents can also create it with people on the spot '
      + '(their agent code counts the sign-up for them).');
  }
  const pressed = pct(t.join_submit, t.join_open);
  if (t.join_open >= 5 && pressed !== null && pressed < 60) {
    out.push((100 - pressed) + '% of the phones that opened the sign-up page left without pressing "Create my free account". Ask a few people '
      + 'in person what stopped them; the page itself only asks for a name, a number and a password.');
  }
  const tj = top(g.join_reasons);
  if (tj && tj[1] >= 3) {
    const n = num(tj[1]);
    if (tj[0] === 'exists') out.push('The most common sign-up problem: the number already has an account (' + n + ' times). These people only need to sign in - '
      + 'the page offers "Sign in with this number" - and "Forgot password?" gets them a new password from staff.');
    else if (tj[0] === 'phone') out.push('The most common sign-up problem: numbers that are not valid (' + n + ' times). If they are numbers from outside '
      + 'Cameroon, open those countries in Command Center > Countries.');
    else if (tj[0] === 'closed') out.push('People from countries that are not open yet tried to sign up (' + n + ' times) - see "Tries from countries not open yet" below. '
      + 'Open a country in Command Center > Countries once someone can answer people there.');
    else if (tj[0] === 'password') out.push('The most common sign-up problem: passwords under 8 characters (' + n + ' times). Agents can tell people before they '
      + 'start: "choose 8 letters or numbers you will remember".');
    else if (tj[0] === 'consent') out.push('The most common sign-up problem: the box was not ticked (' + n + ' times). Agents can show people the box.');
    else if (tj[0] === 'net') out.push('The most common sign-up problem: no network (' + n + ' times). What she typed is kept on the phone, so she can press again '
      + 'when the network is back.');
  }
  const tries = t.signin_ok + t.signin_failed;
  const failed = pct(t.signin_failed, tries);
  if (tries >= 5 && failed !== null && failed >= 30) {
    const ts = top(g.signin_reasons);
    out.push(failed + '% of sign-in tries failed' + (ts ? ' (mostly: ' + (SIGNIN_REASON[ts[0]] || ts[0]).toLowerCase() + ')' : '') + '. Remind people that '
      + '"Forgot password?" works without the old password: staff give a temporary password (Command Center > Account recovery).');
  }
  const back = pct(t.came_back, t.new_accounts_old_enough);
  if (t.new_accounts_old_enough >= 5 && back !== null && back < 40) {
    out.push('Only ' + back + '% of the new accounts came back on another day. People need a reason to return in their first week - for example a '
      + 'chat message from Bambeh on day 2 with the pharmacy on duty or the gas price near them, or an agent visit.');
  }
  const doors = Object.entries(g.doors || {}).filter((d) => d[1].created > 0).sort((a, b) => b[1].created - a[1].created);
  if (doors.length && t.join_created >= 5) {
    out.push('Most new accounts come from "' + (DOOR[doors[0][0]] || doors[0][0]) + '" (' + num(doors[0][1].created) + ' of ' + num(t.join_created) + '). '
      + 'Put more effort where sign-ups already happen.');
  }
  if (!out.length) out.push('No warning sign in these numbers yet. The sign-up and sign-in steps are counted from ' + (g.steps_since ? fmtDay(g.steps_since) : 'today')
    + '; come back after a week of use for clearer advice.');
  return out.slice(0, 6);
}

function SignupsPanel() {
  const [days, setDays] = useState(30);
  const [g, setG] = useState<Growth | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const load = useCallback(async (d: number) => {
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc('bambeh_admin_growth', { p_days: d });
      if (error) {
        const m = String(error.message || '');
        setErr(/could not find the function|does not exist|schema cache/i.test(m)
          ? 'The sign-up checks are not installed yet: run FIX773 in Supabase (SQL Editor), then press Refresh.' : 'Could not load the numbers: ' + m);
      } else if (!data || (data as Growth).ok === false) {
        setErr((data as Growth | null)?.reason === 'staff_only' ? 'Only Bambeh staff can see these numbers.' : 'Could not load the numbers.');
      } else {
        setG(data as Growth);
        setErr(null);
      }
    } catch {
      setErr('Could not load the numbers - check the connection and press Refresh.');
    } finally {
      setBusy(false);
    }
  }, []);
  useEffect(() => {
    void load(days);
    const id = window.setInterval(() => void load(days), 60000);
    return () => window.clearInterval(id);
  }, [load, days]);

  const t = g?.totals;
  const daily = g?.daily || [];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} data-tab="signups">
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>Period:</span>
        {[7, 30, 90].map((d) => (
          <button key={d} type="button" onClick={() => setDays(d)} style={tab(days === d)} data-days={d}>Last {d} days</button>
        ))}
        <span style={{ flex: 1 }} />
        <button type="button" onClick={() => void load(days)} disabled={busy} style={tab(false)}>{busy ? <Loader2 size={16} /> : <RefreshCw size={16} />} Refresh</button>
      </div>
      {err ? <div style={{ ...card, borderColor: '#fecaca', background: '#fef2f2', color: '#991b1b' }}>{err}</div> : null}
      {g && t ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <Stat title="Visitors (phones and browsers)" value={num(t.visitors)}
                  sub={num(t.new_visitors) + ' new \u00b7 ' + num(t.visitors_signed_in) + ' used it signed in (' + pctText(t.visitors_signed_in, t.visitors) + ')'} />
            <Stat title="New accounts" value={num(t.new_accounts)}
                  sub={num(t.new_accounts_phone) + ' with a phone number \u00b7 ' + num(t.new_accounts - t.new_accounts_phone) + ' with an email \u00b7 ' + num(t.accounts_total) + ' in all'} />
            <Stat title="Accounts that signed in" value={num(t.users_signed_in)}
                  sub={'signed in at least once in the period' + (g.audit_log && t.sign_ins_log !== null ? ' \u00b7 ' + num(t.sign_ins_log) + ' sign-ins in Supabase\u2019s log' : '')} />
            <Stat title="New accounts that came back" value={pctText(t.came_back, t.new_accounts_old_enough)}
                  sub={num(t.came_back) + ' of ' + num(t.new_accounts_old_enough) + ' opened Bambeh again on a later day'} />
          </div>

          <div style={{ ...card, borderColor: '#99f6e4', background: '#f0fdfa' }} data-hints="1">
            <div style={{ fontWeight: 800, marginBottom: 8, color: '#134e4a' }}>How to get more people signed in</div>
            <ol style={{ margin: 0, paddingLeft: 22, lineHeight: 1.6, fontSize: 14, color: '#134e4a', listStyle: 'decimal' }}>
              {growthHints(g).map((h, i) => <li key={i} style={{ marginBottom: 6 }}>{h}</li>)}
            </ol>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
            <div style={card}>
              <div style={{ fontWeight: 700, marginBottom: 10 }}>The sign-up page, step by step</div>
              <Step label="Phones that opened it" n={t.join_open} of={null} first={t.join_open} />
              <Step label="Phones that pressed Create" n={t.join_submit} of={t.join_open} first={t.join_open} />
              <Step label="Accounts created" n={t.join_created} of={t.join_submit} first={t.join_open} />
              <div style={{ fontWeight: 700, margin: '12px 0 6px' }}>Why sign-ups stopped</div>
              <ReasonList map={g.join_reasons} labels={JOIN_REASON} empty="No problem noted in this period." />
            </div>
            <div style={card}>
              <div style={{ fontWeight: 700, marginBottom: 10 }}>The sign-in page, step by step</div>
              <Step label="Phones that opened it" n={t.signin_open} of={null} first={t.signin_open} />
              <Step label="Phones that pressed Sign in" n={t.signin_submit} of={t.signin_open} first={t.signin_open} />
              <Step label="Signed in" n={t.signin_ok} of={null} first={t.signin_open} />
              <div style={{ fontWeight: 700, margin: '12px 0 6px' }}>Why sign-ins failed ({num(t.signin_failed)})</div>
              <ReasonList map={g.signin_reasons} labels={SIGNIN_REASON} empty="No failed sign-in noted in this period." />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
            <div style={card}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Where new accounts come from</div>
              {Object.keys(g.doors || {}).length === 0 ? <div style={{ fontSize: 13, color: '#64748b' }}>Nothing noted yet.</div> : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr><th style={th}>Way in</th><th style={th}>Opened</th><th style={th}>Created</th></tr></thead>
                  <tbody>
                    {Object.entries(g.doors || {}).sort((a, b) => b[1].created - a[1].created || b[1].open - a[1].open).map(([k, v]) => (
                      <tr key={k}><td style={td}>{DOOR[k] || k}</td><td style={td}>{num(v.open)}</td><td style={td}><b>{num(v.created)}</b></td></tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div style={card}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>New accounts by language and country</div>
              <ReasonList map={g.langs} labels={LANG} empty="Nothing noted yet." />
              <div style={{ height: 8 }} />
              <ReasonList map={Object.fromEntries(Object.entries(g.countries || {}).map(([k, v]) => [countryName(k, 'en'), v]))} labels={{}} empty="" />
              {Object.keys(g.closed_countries || {}).length > 0 && (
                <>
                  <div style={{ fontWeight: 700, margin: '10px 0 6px' }}>Tries from countries not open yet</div>
                  <ReasonList map={Object.fromEntries(Object.entries(g.closed_countries || {}).map(([k, v]) => [countryName(k, 'en'), v]))} labels={{}} empty="" />
                </>
              )}
            </div>
          </div>

          <div style={card}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>Visitors per day</div>
            <Bars rows={daily.map((r) => ({ key: r.day, value: Number(r.visitors || 0),
              tip: fmtDay(r.day) + ': ' + num(r.visitors) + ' visitors (' + num(r.new_visitors) + ' new), ' + num(r.users_active) + ' signed in' }))}
              labelAt={(i) => (i === 0 || i === daily.length - 1 || i % 7 === 0 ? fmtDay(daily[i].day) : '')} />
          </div>
          <div style={card}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>New accounts per day</div>
            <Bars color="#7c3aed" rows={daily.map((r) => ({ key: r.day, value: Number(r.new_accounts || 0),
              tip: fmtDay(r.day) + ': ' + num(r.new_accounts) + ' new accounts, ' + num(r.join_open) + ' opened the sign-up page, ' + num(r.signin_ok) + ' sign-ins'
                + (r.sign_ins_log !== null ? ' (' + num(r.sign_ins_log) + ' in Supabase\u2019s log)' : '') }))}
              labelAt={(i) => (i === 0 || i === daily.length - 1 || i % 7 === 0 ? fmtDay(daily[i].day) : '')} />
          </div>
          <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>
            Visits are counted since {g.visits_since ? fmtDay(g.visits_since) : 'the first visit'}; the sign-up and sign-in steps since{' '}
            {g.steps_since ? fmtDay(g.steps_since) : 'the first step'} (FIX773). "Accounts that signed in" comes from Supabase (each account&apos;s last sign-in).
            {g.audit_log ? ' Sign-ins per day also come from Supabase\u2019s own log.' : ' This project does not keep Supabase\u2019s sign-in log, so sign-ins per day are counted by the app from now on.'}
            {' '}A visitor is a phone or browser; nothing personal is stored - a random id per phone, never a name or a number.
          </div>
        </>
      ) : !err ? (
        <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 8, color: '#475569' }}><Loader2 size={18} /> Loading the numbers...</div>
      ) : null}
    </div>
  );
}

function VisitsPanel() {
  const [data, setData] = useState<Usage | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [at, setAt] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const { data: d, error } = await supabase.rpc('bambeh_admin_usage');
      if (error) {
        const m = String(error.message || '');
        setErr(/could not find the function|does not exist|schema cache/i.test(m)
          ? 'The usage counter is not installed yet: run FIX664 in Supabase (SQL Editor).'
          : 'Could not load the numbers: ' + m);
      } else if (!d || (d as Usage).ok === false) {
        setErr((d as Usage | null)?.reason === 'staff_only' ? 'Only Bambeh staff can see these numbers.' : 'Could not load the numbers.');
      } else {
        setData(d as Usage);
        setErr(null);
        setAt(new Date());
      }
    } catch {
      setErr('Could not load the numbers - check the connection and press Refresh.');
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
  const month = periods.find((p) => p.key === 'month');
  const day = periods.find((p) => p.key === 'day');
  const daily = data?.daily || [];
  const monthly = data?.monthly || [];
  const platforms = Object.entries(data?.platforms_30d || {}).sort((a, b) => b[1] - a[1]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} data-tab="visits">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: '#64748b' }}>{at ? 'Updated ' + at.toLocaleTimeString() : ''}</span>
        <span style={{ flex: 1 }} />
        <button type="button" onClick={() => void load()} disabled={busy} style={tab(false)}>
          {busy ? <Loader2 size={16} /> : <RefreshCw size={16} />} Refresh
        </button>
      </div>

      {err ? <div style={{ ...card, borderColor: '#fecaca', background: '#fef2f2', color: '#991b1b' }}>{err}</div> : null}

      {data ? (
        <>
          <div style={{ fontSize: 13, color: '#475569' }}>
            {data.counting_since
              ? 'Counting since ' + fmtDay(String(data.counting_since)) + '. Visits before that day were never recorded.'
              : 'No visits counted yet - counting starts as soon as people open the updated app.'}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <Stat title="Registered users" value={num(data.total_users)}
              sub={'+' + num(data.new_users_today) + ' today \u00b7 +' + num(data.new_users_7d) + ' in 7 days \u00b7 +' + num(data.new_users_30d) + ' in 30 days'} />
            <Stat title="Active users" value={num(month?.users)} sub="signed in and used Bambeh in the last 30 days" />
            <Stat title="Live now" value={num(data.live_devices)}
              sub={'phones or browsers in the last 5 minutes \u00b7 ' + num(data.live_users) + ' signed in'} />
            <Stat title="Opens today" value={num(day?.opens)} sub={num(day?.visitors) + ' phones or browsers today'} />
          </div>

          <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
                tip: fmtDay(r.day) + ': ' + num(r.visitors) + ' phones, ' + num(r.users) + ' signed in, ' + num(r.opens) + ' opens' }))}
              labelAt={(i) => (i === 0 || i === daily.length - 1 || i % 7 === 0 ? fmtDay(daily[i].day) : '')} />
          </div>

          <div style={card}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>Last 12 months - phones and browsers per month</div>
            <Bars
              rows={monthly.map((r) => ({ key: r.month, value: Number(r.visitors || 0),
                tip: fmtMonth(r.month) + ': ' + num(r.visitors) + ' phones, ' + num(r.users) + ' signed in, ' + num(r.opens) + ' opens' }))}
              labelAt={(i) => fmtMonth(monthly[i].month)} />
          </div>

          {platforms.length ? (
            <div style={card}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>How people opened Bambeh (last 30 days)</div>
              {platforms.map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 14 }}>
                  <span>{PLATFORM[k] || k}</span>
                  <b>{num(v)}</b>
                </div>
              ))}
              <div style={small}>Until 15 October 2026 the Android app was counted as "Website" (fixed by FIX780).</div>
            </div>
          ) : null}

          <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>
            A phone or browser is counted once per period, signed in or not. Signed-in users are accounts. An open is a
            start of the app, or a return after 30 minutes away. Live means seen in the last 5 minutes. Nothing personal is
            stored: a random id kept on the phone, the account if signed in, and how the app was opened.
          </div>
        </>
      ) : !err ? (
        <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 8, color: '#475569' }}>
          <Loader2 size={18} /> Loading the numbers...
        </div>
      ) : null}
    </div>
  );
}

export default function AdminUsage({ embedded = false }: { embedded?: boolean }) {
  const [view, setView] = useState<'visits' | 'signups'>('visits');
  return (
    <div style={{ padding: embedded ? 0 : 16, display: 'flex', flexDirection: 'column', gap: 16 }} data-fix="FIX781">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <Activity size={22} color="#0d9488" />
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>App usage</h2>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }} role="tablist">
        <button type="button" role="tab" aria-selected={view === 'visits'} onClick={() => setView('visits')} style={tab(view === 'visits')} data-view="visits">
          <Activity size={16} /> Visits
        </button>
        <button type="button" role="tab" aria-selected={view === 'signups'} onClick={() => setView('signups')} style={tab(view === 'signups')} data-view="signups">
          <UserPlus size={16} /> Sign-ups &amp; sign-ins
        </button>
      </div>
      {view === 'visits' ? <VisitsPanel /> : <SignupsPanel />}
    </div>
  );
}
// BAMBEH_END_TOKEN__ADMIN_USAGE_FIX781__COMPLETE
