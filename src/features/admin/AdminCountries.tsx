// BAMBEH_DEPLOY_TOKEN__ADMIN_COUNTRIES_FIX817_CLEAN
/**
 * AdminCountries.tsx - FIX817 (replaces FIX779) - Command Center > Countries
 *
 * FIX817, Big 18 Oct 2026: "can we make people in the rest of the world create accounts with their phone number".
 *  - A FIFTH GROUP, "Rest of the world" (176 countries and territories, world.ts FIX811): Open all / Close all for
 *    phone sign-up, or one country at a time. Phone sign-up only - places (regions, towns) stay African, and the
 *    database refuses places for them (FIX818).
 *  - "Rest of the world" in the filter row; the search box finds a country anywhere (name or +code).
 *
 * Big: "add a toggle in the admin section to include all ecowas, cemac and africa or we can select a particular
 * country at a time to include".
 *  - Two switches per country (database FIX772):
 *      Phone sign-up - people with a phone number of that country can create an account (and the database refuses
 *                      phone sign-ups from countries that are off, even from outside the app)
 *      Places        - the country is offered by the location filters and when posting
 *  - One button per group: CEMAC (6), ECOWAS (12), the Sahel states (3), all of Africa (54); or one country at a time.
 *  - Cameroon is always on. Admins and the super admin switch; moderators can look. Every change is listed with
 *    who made it and when. Payments stay Cameroon-only whatever is switched on here.
 * English, like the rest of the Command Center.
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { Globe, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AFRICA, BLOCS, HOME, blocMembers, blocName, countryName, flagOf, isWorld, phoneCountries } from '@/lib/africa/countries';
import type { Bloc } from '@/lib/africa/countries';
import '@/lib/africa/world'; // FIX817 - the rest of the world (FIX811)
import { forgetOpenCountries } from '@/lib/africa/useOpenCountries';

type Row = { code: string; blocs: string[]; signup_on: boolean; places_on: boolean; accounts: number; changed_at: string | null };
type Change = { at: string; by: string; what: 'signup' | 'places' | 'both'; on: boolean; codes: string[] };
type Data = { ok: boolean; reason?: string; can_change?: boolean; rows?: Row[]; email_accounts?: number; changes?: Change[] };
type Which = 'signup' | 'places' | 'both';
type Filter = 'all' | 'CEMAC' | 'ECOWAS' | 'AES' | 'REST' | 'WORLD' | 'OPEN';

const REASONS: Record<string, string> = {
  staff_only: 'Only Bambeh staff can see this screen.',
  admins_only: 'Only admins and the super admin can switch countries. Moderators can look.',
  home_always_on: 'Cameroon is always on - it cannot be switched off.',
  unknown_country: 'One of those countries is not in the list.',
  no_country: 'No country was chosen.',
  bad_switch: 'Unknown switch.',
  bad_value: 'Unknown value.',
  not_installed: 'The country switches are not installed yet: run FIX772 in Supabase (SQL Editor), then press Refresh.',
  places_africa_only: 'Places are for African countries only (the location lists know their regions and towns). The rest of the world is for phone sign-up.',
  world_not_installed: 'The rest of the world is not in the database yet: run FIX818 in Supabase (SQL Editor), then press Refresh.',
};
const WHAT: Record<Which, string> = { signup: 'Phone sign-up', places: 'Places', both: 'Phone sign-up and places' };
const BLOC_SHORT: Record<string, string> = { CEMAC: 'CEMAC', ECOWAS: 'ECOWAS', AES: 'Sahel states', WORLD: 'Rest of the world' };

const card: CSSProperties = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 16 };
const th: CSSProperties = { textAlign: 'left', padding: '8px 10px', fontSize: 12, color: '#475569', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' };
const td: CSSProperties = { padding: '7px 10px', fontSize: 14, borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle' };
const btn = (on: boolean, tone = '#0d9488'): CSSProperties => ({
  padding: '7px 12px', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer',
  border: '1px solid ' + (on ? tone : '#cbd5e1'), background: on ? tone : '#fff', color: on ? '#fff' : '#334155',
});

function when(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return String(iso);
  }
}

function Toggle({ on, locked, disabled, onClick, label }: { on: boolean; locked: boolean; disabled: boolean; onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled || locked} aria-pressed={on} aria-label={label} data-toggle={on ? 'on' : 'off'}
            title={locked ? 'Cameroon is always on' : label}
            style={{ minWidth: 64, padding: '5px 10px', borderRadius: 999, fontSize: 12, fontWeight: 800, border: '1px solid ' + (on ? '#0d9488' : '#cbd5e1'),
              background: on ? '#ccfbf1' : '#f8fafc', color: on ? '#0f766e' : '#64748b', cursor: disabled || locked ? 'default' : 'pointer',
              opacity: disabled && !locked ? 0.6 : 1 }}>
      {on ? (locked ? 'ON (always)' : 'ON') : 'OFF'}
    </button>
  );
}

export default function AdminCountries({ embedded = false }: { embedded?: boolean }) {
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [which, setWhich] = useState<Which>('both');
  const [filter, setFilter] = useState<Filter>('all');
  const [q, setQ] = useState('');

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const { data: d, error } = await supabase.rpc('bambeh_admin_countries');
      if (error) {
        const m = String(error.message || '');
        setErr(/could not find the function|does not exist|schema cache/i.test(m) ? REASONS.not_installed : 'Could not load the countries: ' + m);
      } else if (!d || (d as Data).ok === false) {
        setErr(REASONS[String((d as Data | null)?.reason || '')] || 'Could not load the countries.');
      } else {
        setData(d as Data);
        setErr(null);
      }
    } catch {
      setErr('Could not load the countries - check the connection and press Refresh.');
    } finally {
      setBusy(false);
    }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const rows = data?.rows || [];
  const byCode = useMemo(() => {
    const m: Record<string, Row> = {};
    for (const r of rows) m[r.code] = r;
    return m;
  }, [rows]);
  const can = !!data?.can_change;

  const change = async (codes: string[], what: Which, on: boolean, ask: string | null) => {
    if (!can || busy) return;
    if (ask && typeof window.confirm === 'function' && !window.confirm(ask)) return;
    setBusy(true);
    setNote(null);
    try {
      const { data: d, error } = await supabase.rpc('bambeh_admin_countries_set', { p_codes: codes, p_what: what, p_on: on });
      const r = (d || {}) as { ok?: boolean; reason?: string; changed?: number };
      if (error) setNote('Not changed: ' + String(error.message || ''));
      else if (r.ok !== true) setNote(REASONS[String(r.reason || '')] || 'Not changed.');
      else setNote(r.changed ? r.changed + (r.changed === 1 ? ' country' : ' countries') + ' changed (' + WHAT[what].toLowerCase() + ' ' + (on ? 'on' : 'off') + ').'
        : 'Nothing to change - they were already ' + (on ? 'on' : 'off') + '.');
      forgetOpenCountries();
    } catch {
      setNote('Not changed - check the connection.');
    } finally {
      setBusy(false);
      void load();
    }
  };

  const isOn = (r: Row | undefined, w: Which): boolean => !!r && (w === 'signup' ? r.signup_on : w === 'places' ? r.places_on : r.signup_on && r.places_on);
  // FIX817 - Africa by default; the rest of the world with its own filter; a search looks everywhere
  const want = q.trim().toLowerCase();
  const base = want || filter === 'WORLD' || filter === 'OPEN' ? phoneCountries() : AFRICA;
  const list = base.filter((c) => {
    const r = byCode[c.code];
    if (!want) {
      if (filter === 'WORLD' && !isWorld(c.code)) return false;
      if (filter === 'OPEN' && !(r && (r.signup_on || r.places_on))) return false;
      if (filter === 'REST' && c.blocs.length > 0) return false;
      if ((filter === 'CEMAC' || filter === 'ECOWAS' || filter === 'AES') && c.blocs.indexOf(filter) < 0) return false;
      return true;
    }
    return c.en.toLowerCase().indexOf(want) >= 0 || c.fr.toLowerCase().indexOf(want) >= 0 || c.code.toLowerCase() === want || ('+' + c.dial).indexOf(want) >= 0;
  });
  const worldMissing = rows.length > 0 && !rows.some((r) => isWorld(r.code));
  const openSignup = rows.filter((r) => r.signup_on).length;
  const openPlaces = rows.filter((r) => r.places_on).length;

  const chip = (k: Filter, label: string): ReactNode => (
    <button key={k} type="button" onClick={() => setFilter(k)} style={btn(filter === k, '#334155')}>{label}</button>
  );

  return (
    <div style={{ padding: embedded ? 0 : 16, display: 'flex', flexDirection: 'column', gap: 16 }} data-fix="FIX779">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <Globe size={22} color="#0d9488" />
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Countries</h2>
        <span style={{ flex: 1 }} />
        <button type="button" onClick={() => void load()} disabled={busy}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 10, border: '1px solid #cbd5e1', background: '#fff', fontWeight: 600 }}>
          {busy ? <Loader2 size={16} /> : <RefreshCw size={16} />} Refresh
        </button>
      </div>

      <div style={{ ...card, background: '#f0fdfa', borderColor: '#99f6e4', fontSize: 14, lineHeight: 1.6, color: '#134e4a' }}>
        <b>Phone sign-up</b>: people with a phone number of that country can create a Bambeh account (Cameroon numbers always can;
        email sign-up is open to everyone). <b>Places</b>: the country appears in the location filters and when posting.
        Opening a country does <b>not</b> open payments - mobile money stays Cameroon-only - and prices stay in FCFA.
        Before opening a country, make sure someone can answer people there and that its data-protection rules are respected.
        <b> Rest of the world</b>: phone sign-up only (places stay African). Opening Europe or the United Kingdom means their
        data-protection laws (GDPR) apply to those members - check with the lawyer first.
      </div>

      {err ? <div style={{ ...card, borderColor: '#fecaca', background: '#fef2f2', color: '#991b1b' }}>{err}</div> : null}
      {!err && worldMissing ? <div style={{ ...card, borderColor: '#fde68a', background: '#fffbeb', color: '#92400e' }} data-world-missing="1">{REASONS.world_not_installed}</div> : null}
      {note ? <div style={{ ...card, borderColor: '#fde68a', background: '#fffbeb', color: '#92400e' }} role="status">{note}</div> : null}

      {data ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>The buttons below switch:</span>
            {(['both', 'signup', 'places'] as Which[]).map((w) => (
              <button key={w} type="button" onClick={() => setWhich(w)} style={btn(which === w)} data-which={w}>{WHAT[w]}</button>
            ))}
            <span style={{ fontSize: 12, color: '#64748b' }}>
              Open now: {openSignup} for phone sign-up, {openPlaces} for places. {data.can_change ? '' : 'You can look; only admins can switch.'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 12 }}>
            {BLOCS.map((b: Bloc) => {
              const members = blocMembers(b);
              // FIX817 - the rest of the world: phone sign-up only, whatever the switch above says
              const w: Which = b === 'WORLD' ? 'signup' : which;
              const on = members.filter((k) => isOn(byCode[k], w)).length;
              return (
                <div key={b} style={card} data-bloc={b}>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{blocName(b, 'en')}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{on} of {members.length} on ({WHAT[w].toLowerCase()}){b === 'WORLD' ? ' - places stay African' : ''}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button type="button" disabled={!can || busy || !members.length} style={btn(false)} data-bloc-on={b}
                            onClick={() => void change(members, w, true, 'Switch ON ' + WHAT[w].toLowerCase() + ' for ' + blocName(b, 'en') + '?')}>Open all</button>
                    <button type="button" disabled={!can || busy || !members.length} style={btn(false, '#b91c1c')} data-bloc-off={b}
                            onClick={() => void change(members, w, false, 'Switch OFF ' + WHAT[w].toLowerCase() + ' for ' + blocName(b, 'en') + '? Cameroon stays on.')}>Close all</button>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {chip('all', 'All 54')}{chip('CEMAC', 'CEMAC')}{chip('ECOWAS', 'ECOWAS')}{chip('AES', 'Sahel states')}{chip('REST', 'Rest of Africa')}
            {chip('WORLD', 'Rest of the world (' + blocMembers('WORLD').length + ')')}{chip('OPEN', 'Open only')}
            <input value={q} onChange={(e) => setQ(e.target.value.slice(0, 40))} placeholder="Search any country or +code" aria-label="Search a country"
                   style={{ flex: '1 1 180px', padding: '8px 12px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14 }} />
          </div>

          <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={th}>Country</th>
                  <th style={th}>Dial</th>
                  <th style={th}>Group</th>
                  <th style={th}>Phone accounts</th>
                  <th style={th}>Phone sign-up</th>
                  <th style={th}>Places</th>
                </tr>
              </thead>
              <tbody>
                {list.map((c) => {
                  const r = byCode[c.code];
                  const locked = c.code === HOME;
                  return (
                    <tr key={c.code} data-row={c.code}>
                      <td style={{ ...td, fontWeight: 600 }}><span aria-hidden="true">{flagOf(c.code)}</span> {countryName(c.code, 'en')}</td>
                      <td style={{ ...td, fontFamily: 'monospace' }}>+{c.dial}</td>
                      <td style={td}>{c.blocs.map((b) => BLOC_SHORT[b] || b).join(', ') || '-'}</td>
                      <td style={td}>{r ? r.accounts : 0}</td>
                      <td style={td}>
                        <Toggle on={!!r && r.signup_on} locked={locked} disabled={!can || busy} label={'Phone sign-up ' + c.en}
                                onClick={() => void change([c.code], 'signup', !(r && r.signup_on), null)} />
                      </td>
                      <td style={td}>
                        {isWorld(c.code) ? (
                          <span style={{ fontSize: 12, color: '#94a3b8' }} data-no-places={c.code}>Africa only</span>
                        ) : (
                          <Toggle on={!!r && r.places_on} locked={locked} disabled={!can || busy} label={'Places ' + c.en}
                                  onClick={() => void change([c.code], 'places', !(r && r.places_on), null)} />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ fontSize: 12, color: '#64748b' }}>
            Phone accounts: accounts made with a phone number of that country. Accounts made with an email: {data.email_accounts ?? 0}.
          </div>

          <div style={card}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Changes (newest first)</div>
            {(data.changes || []).length === 0 ? (
              <div style={{ fontSize: 14, color: '#64748b' }}>No change yet - only Cameroon is open.</div>
            ) : (
              (data.changes || []).map((x, i) => (
                <div key={i} style={{ fontSize: 13, padding: '5px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <b>{when(x.at)}</b> - {x.by}: {WHAT[x.what] || x.what} <b>{x.on ? 'ON' : 'OFF'}</b> for {x.codes.map((k) => countryName(k, 'en')).join(', ')}
                </div>
              ))
            )}
          </div>
        </>
      ) : !err ? (
        <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 8, color: '#475569' }}><Loader2 size={18} /> Loading the countries...</div>
      ) : null}
    </div>
  );
}
// BAMBEH_END_TOKEN__ADMIN_COUNTRIES_FIX817__COMPLETE
