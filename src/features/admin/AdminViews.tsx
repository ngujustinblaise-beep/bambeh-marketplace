// BAMBEH_DEPLOY_TOKEN__ADMIN_VIEWS_FIX808_CLEAN
/**
 * AdminViews.tsx - FIX808 (new) - Command Center > Views & visits
 *
 * Big, 18 Oct 2026: "is it possible that when items are viewed, it shows on the detailed page as well as the admin
 * page that someone has viewed. we can trace how many views and see how many people visited a particular item. we
 * can get details on which item was viewed most, which category in special feature, in free feature and in the
 * other sections, which one is viewed or reached the most and how many times it is opened".
 *
 * For today, 7 days, 30 days or 12 months (bambeh_admin_views, FIX806):
 *  - page opens, people (phones), item views and the people who looked at items
 *  - MAIN SECTIONS, SPECIAL FEATURES and FREE HELP, each ranked: the most opened first, with how many times and by
 *    how many people - the same pages Home shows, in the same words
 *  - item pages per section, and the MOST VIEWED ITEMS: title, section, views, people, all-time views, last viewed,
 *    and a link to open the item
 *  - the other pages people open, and the opens per day
 * Counted by ActivityPing (FIX807) on every page the app opens. Nobody's name is kept: a phone is a fingerprint, an
 * item view counts once per person per hour, the owner's own looks never count, staff screens are not counted.
 * Staff only. English, like the rest of the Command Center.
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useCallback, useEffect, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export type PathRow = { path: string; opens: number; people: number; last: string | null };
export type ItemRow = {
  tbl: string; id: string; path: string | null; views: number; people: number; last: string | null; title: string; total: number | null;
};
type DayRow = { day: string; opens: number; people: number };
type Report = {
  ok: boolean; reason?: string; days?: number; since?: string; today?: string; counting_since?: string | null;
  totals?: { opens: number; people: number; item_views: number; item_people: number };
  paths?: PathRow[]; daily?: DayRow[]; items?: ItemRow[];
};

/** The pages Home offers, grouped as Home groups them (FIX802 / FIX803), in the words Home uses. */
export const GROUPS: ReadonlyArray<{ key: string; title: string; note: string; pages: ReadonlyArray<readonly [string, string]> }> = [
  {
    key: 'main', title: 'Main sections', note: 'Marketplace, Cooking gas and Rentals are on show on Home; the other five open with "More categories".',
    pages: [['/marketplace', 'Marketplace'], ['/food-gas/gas', 'Cooking gas'], ['/rentals', 'Rentals'], ['/jobs', 'Jobs'],
      ['/services', 'Services'], ['/vehicles', 'Vehicles'], ['/exchange', 'Exchange'], ['/food-gas/food', 'Food']],
  },
  {
    key: 'features', title: 'Special features', note: 'The first four are on show on Home; the rest open with "See all".',
    pages: [['/farm-fresh', 'Farm Fresh'], ['/compare', 'Compare Items'], ['/group-buying', 'Group Buying'], ['/escrow', 'Buyer Protection'],
      ['/coins', 'Zerm Coins'], ['/community', 'Community'], ['/ai-chat', 'Bambeh AI'], ['/deals', 'Flash Deals'], ['/meet-safely', 'Meet Safely']],
  },
  {
    key: 'free', title: 'Free help', note: 'The first four are on show on Home, with the Safety button and Taxi check bars; the rest open with "See all".',
    pages: [['/pharmacies', 'Pharmacies on call'], ['/womens-health', "Women's health"], ['/fuel', 'Fuel at night'], ['/hospitals', 'Hospitals on duty'],
      ['/water-lights', 'Water / Lights'], ['/safety', 'Safety alerts'], ['/safety-button', 'Safety button'], ['/taxi-check', 'Taxi check']],
  },
];

/** Item pages: one row per section, whatever item was opened. */
export const ITEM_PAGES: Readonly<Record<string, string>> = {
  '/marketplace/:id': 'Marketplace adverts', '/services/:id': 'Services', '/rentals/:id': 'Rentals', '/vehicles/:id': 'Vehicles',
  '/jobs/:id': 'Jobs', '/exchange/:id': 'Exchange', '/farm-fresh/:id': 'Farm Fresh products', '/community/:id': 'Community groups',
  '/group-buying/:id': 'Group buying deals', '/food-gas/place/:id': 'Gas & food businesses', '/womens-health/place/:id': "Women's health places",
  '/womens-health/day/:id': 'Screening days',
};

const PERIODS: ReadonlyArray<{ days: number; label: string }> = [
  { days: 1, label: 'Today' }, { days: 7, label: '7 days' }, { days: 30, label: '30 days' }, { days: 365, label: '12 months' },
];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const num = (v: unknown): string => Number(v || 0).toLocaleString('en-US');
export const fmtDay = (iso: string | null | undefined): string => {
  const p = String(iso || '').slice(0, 10).split('-');
  return p.length === 3 && MONTHS[Number(p[1]) - 1] ? Number(p[2]) + ' ' + MONTHS[Number(p[1]) - 1] + ' ' + p[0] : String(iso || '');
};
/** The first day the period really covers: nothing was counted before counting started. */
export function periodFrom(r: { since?: string; counting_since?: string | null }): string {
  const since = String(r.since || '');
  const start = String(r.counting_since || '');
  return start && since && start > since ? start : since;
}
export function ago(iso: string | null | undefined, now: number = Date.now()): string {
  const t = Date.parse(String(iso || ''));
  if (isNaN(t)) return '-';
  const m = Math.max(0, Math.round((now - t) / 60000));
  if (m < 1) return 'just now';
  if (m < 60) return m + ' min ago';
  const h = Math.round(m / 60);
  if (h < 24) return h + ' h ago';
  const d = Math.round(h / 24);
  return d <= 30 ? d + ' days ago' : fmtDay(String(iso));
}

/** A group's pages ranked: the most opened first; pages nobody opened yet keep Home's order at the end. */
export function rankGroup(paths: ReadonlyArray<PathRow>, pages: ReadonlyArray<readonly [string, string]>) {
  const byPath: Record<string, PathRow> = {};
  for (const p of paths) byPath[p.path] = p;
  return pages
    .map(([path, label], i) => ({ path, label, i, opens: Number(byPath[path]?.opens || 0), people: Number(byPath[path]?.people || 0), last: byPath[path]?.last || null }))
    .sort((a, b) => b.opens - a.opens || b.people - a.people || a.i - b.i);
}

/** The link to an item: its page with the id in place of ":id". */
export function itemLink(it: ItemRow): string | null {
  return it.path && it.path.indexOf(':id') >= 0 && it.id ? it.path.replace(':id', it.id) : null;
}

const card: CSSProperties = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 16 };
const small: CSSProperties = { fontSize: 12, color: '#64748b', marginTop: 4, lineHeight: 1.4 };
const big: CSSProperties = { fontSize: 30, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 };
const th: CSSProperties = { textAlign: 'left', padding: '8px 10px', fontSize: 12, color: '#475569', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' };
const td: CSSProperties = { padding: '8px 10px', fontSize: 14, borderBottom: '1px solid #f1f5f9', verticalAlign: 'top' };
const tab = (on: boolean): CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 13px', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer',
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

function Ranked({ rows }: { rows: ReturnType<typeof rankGroup> }) {
  const max = Math.max(1, ...rows.map((r) => r.opens));
  return (
    <div>
      {rows.map((r, n) => (
        <div key={r.path} data-rank-row={r.path} style={{ padding: '7px 0', borderBottom: '1px solid #f8fafc', opacity: r.opens ? 1 : 0.55 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, fontSize: 14 }}>
            <span style={{ width: 22, color: '#94a3b8', fontWeight: 700 }}>{n + 1}</span>
            <span style={{ flex: 1, minWidth: 0, fontWeight: 600, color: '#0f172a' }}>
              {r.label}
              {n === 0 && r.opens > 0 ? (
                <span data-top="1" style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, color: '#0f766e', background: '#ccfbf1', borderRadius: 999, padding: '2px 8px', whiteSpace: 'nowrap', display: 'inline-block' }}>
                  most opened
                </span>
              ) : null}
            </span>
            <span style={{ whiteSpace: 'nowrap' }}>
              {r.opens ? <><b>{num(r.opens)}</b> <span style={{ color: '#64748b' }}>{r.opens === 1 ? 'open' : 'opens'} - {num(r.people)} {r.people === 1 ? 'person' : 'people'}</span></>
                : <span style={{ color: '#94a3b8' }}>not opened yet</span>}
            </span>
          </div>
          <div style={{ height: 8, background: '#f1f5f9', borderRadius: 999, marginTop: 5, marginLeft: 30 }}>
            <div style={{ width: (r.opens ? Math.max(2, Math.round((100 * r.opens) / max)) : 0) + '%', height: 8, background: n === 0 ? '#0d9488' : '#5eead4', borderRadius: 999 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminViews({ embedded = false }: { embedded?: boolean }) {
  const [days, setDays] = useState(30);
  const [rep, setRep] = useState<Report | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const load = useCallback(async (d: number) => {
    setBusy(true);
    setErr('');
    try {
      const { data, error } = await supabase.rpc('bambeh_admin_views', { p_days: d });
      if (error) {
        const m = String((error as { message?: string }).message || error);
        setErr(/bambeh_admin_views|could not find|does not exist|PGRST202/i.test(m) ? 'missing' : m);
        setRep(null);
      } else {
        setRep((data || null) as Report | null);
      }
    } catch (e) {
      setErr(String((e as Error)?.message || e));
      setRep(null);
    }
    setBusy(false);
  }, []);

  useEffect(() => { void load(days); }, [days, load]);

  const paths = rep?.paths || [];
  const grouped: Record<string, boolean> = {};
  for (const g of GROUPS) for (const [p] of g.pages) grouped[p] = true;
  const itemPages = paths.filter((p) => ITEM_PAGES[p.path]);
  const others = paths.filter((p) => !grouped[p.path] && !ITEM_PAGES[p.path]).slice(0, 15);
  const items = rep?.items || [];
  const t = rep?.totals;
  const daily = rep?.daily || [];
  const maxDay = Math.max(1, ...daily.map((d) => d.opens));

  return (
    <div data-fix="FIX808" style={{ display: 'grid', gap: 16, gridTemplateColumns: 'minmax(0, 1fr)', ...(embedded ? {} : { maxWidth: 1100, margin: '0 auto', padding: 16 }) }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            <Eye style={{ width: 22, height: 22 }} /> Views &amp; visits
          </h2>
          <div style={small}>Which pages and items people open, how many times, and by how many people.</div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {PERIODS.map((p) => (
            <button key={p.days} type="button" data-period={p.days} style={tab(days === p.days)} onClick={() => setDays(p.days)}>{p.label}</button>
          ))}
          <button type="button" data-refresh="1" style={tab(false)} onClick={() => void load(days)} disabled={busy} aria-label="Refresh">
            {busy ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> : <RefreshCw style={{ width: 16, height: 16 }} />}
          </button>
        </div>
      </div>

      {err === 'missing' ? (
        <div data-msg="missing" style={{ ...card, background: '#fffbeb', borderColor: '#fcd34d', color: '#92400e', fontSize: 14 }}>
          The counter is not in the database yet: run FIX806-views-and-visits.sql in the Supabase SQL Editor, then press refresh.
        </div>
      ) : err ? (
        <div data-msg="error" style={{ ...card, background: '#fef2f2', borderColor: '#fecaca', color: '#991b1b', fontSize: 14 }}>Could not load: {err}</div>
      ) : rep && !rep.ok ? (
        <div data-msg="staff" style={{ ...card, fontSize: 14 }}>Only Bambeh staff can see this.</div>
      ) : !rep ? (
        <div style={{ ...card, fontSize: 14, color: '#64748b' }}>Loading...</div>
      ) : (
        <>
          <div data-counting="1" style={{ fontSize: 13, color: '#475569' }}>
            {rep.counting_since
              ? <>Counting since <b>{fmtDay(rep.counting_since)}</b>. {days === 1 || periodFrom(rep) === rep.today ? 'Today' : 'From ' + fmtDay(periodFrom(rep)) + ' to ' + fmtDay(rep.today)}.</>
              : <>Nothing counted yet: counting starts as people open pages in the new app (FIX807).</>}
          </div>

          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))' }}>
            <Stat title="Page opens" value={<span data-total="opens">{num(t?.opens)}</span>} sub="every page opened, each time" />
            <Stat title="People" value={<span data-total="people">{num(t?.people)}</span>} sub="different phones that opened Bambeh" />
            <Stat title="Item views" value={<span data-total="item_views">{num(t?.item_views)}</span>} sub="adverts, jobs, rentals, products... once per person per hour" />
            <Stat title="People who looked at items" value={<span data-total="item_people">{num(t?.item_people)}</span>} sub="owners looking at their own items are not counted" />
          </div>

          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))' }}>
            {GROUPS.map((g) => (
              <div key={g.key} data-group={g.key} style={card}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{g.title}</div>
                <div style={{ ...small, marginBottom: 8 }}>{g.note}</div>
                <Ranked rows={rankGroup(paths, g.pages)} />
              </div>
            ))}
          </div>

          <div data-items="1" style={card}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Most viewed items</div>
            <div style={{ ...small, marginBottom: 8 }}>
              Views in this period (once per person per hour), the people behind them, and all the views the item has had.
            </div>
            {items.length ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={th}>#</th><th style={th}>Item</th><th style={th}>Section</th><th style={th}>Views</th>
                      <th style={th}>People</th><th style={th}>All-time views</th><th style={th}>Last viewed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, n) => {
                      const href = itemLink(it);
                      return (
                        <tr key={it.tbl + it.id} data-item={it.id}>
                          <td style={td}>{n + 1}</td>
                          <td style={{ ...td, fontWeight: 600 }}>
                            {href ? <Link to={href} style={{ color: '#0f766e' }}>{it.title}</Link> : it.title}
                          </td>
                          <td style={td}>{(it.path && ITEM_PAGES[it.path]) || it.tbl}</td>
                          <td style={td}><b>{num(it.views)}</b></td>
                          <td style={td}>{num(it.people)}</td>
                          <td style={td}>{it.total === null || it.total === undefined ? '-' : num(it.total)}</td>
                          <td style={{ ...td, whiteSpace: 'nowrap', color: '#475569' }}>{ago(it.last)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : <div style={{ fontSize: 13, color: '#64748b' }}>No item was opened in this period yet.</div>}
          </div>

          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))' }}>
            <div data-item-pages="1" style={card}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Item pages opened, by section</div>
              <div style={{ ...small, marginBottom: 8 }}>Every time somebody opened an advert, a job, a rental, a product...</div>
              {itemPages.length ? itemPages.map((p) => (
                <div key={p.path} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '5px 0', borderBottom: '1px solid #f8fafc' }}>
                  <span>{ITEM_PAGES[p.path]}</span>
                  <span><b>{num(p.opens)}</b> <span style={{ color: '#64748b' }}>- {num(p.people)} {p.people === 1 ? 'person' : 'people'}</span></span>
                </div>
              )) : <div style={{ fontSize: 13, color: '#64748b' }}>None yet.</div>}
            </div>
            <div data-others="1" style={card}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Other pages</div>
              <div style={{ ...small, marginBottom: 8 }}>Home, sign-in, profile, chat... the 15 most opened.</div>
              {others.length ? others.map((p) => (
                <div key={p.path} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 14, padding: '5px 0', borderBottom: '1px solid #f8fafc' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 13, wordBreak: 'break-all' }}>{p.path === '/' ? '/ (Home)' : p.path}</span>
                  <span style={{ whiteSpace: 'nowrap' }}><b>{num(p.opens)}</b> <span style={{ color: '#64748b' }}>- {num(p.people)}</span></span>
                </div>
              )) : <div style={{ fontSize: 13, color: '#64748b' }}>None yet.</div>}
            </div>
          </div>

          {daily.length > 1 ? (
            <div data-daily="1" style={card}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>Page opens per day</div>
              <div style={{ overflowX: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 110, minWidth: daily.length * 9 }}>
                  {daily.map((d) => (
                    <div key={d.day} title={fmtDay(d.day) + ': ' + num(d.opens) + ' opens, ' + num(d.people) + ' people'}
                      style={{ flex: 1, minWidth: 6, height: Math.max(2, Math.round((d.opens / maxDay) * 110)), background: '#0d9488', borderRadius: '4px 4px 0 0' }} />
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
            How it is counted: a page open counts every time it is opened. People are different phones; a phone is kept only as a
            fingerprint, never with a name. An item view counts once per person per hour, and owners looking at their own items never
            count. Staff screens are not counted. Counts older than 400 days are removed.
          </div>
        </>
      )}
    </div>
  );
}
// BAMBEH_END_TOKEN__ADMIN_VIEWS_FIX808__COMPLETE
