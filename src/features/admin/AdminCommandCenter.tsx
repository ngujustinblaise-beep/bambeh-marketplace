// BAMBEH_DEPLOY_TOKEN__ADMINCOMMANDCENTER_FIX482_CLEAN
/**
 * AdminCommandCenter.tsx — Bambeh Admin Command Center (FIX121)
 * FILE LOCATION: src/features/admin/AdminCommandCenter.tsx
 * ROUTE: <Route path="/admin/center" element={<AdminCommandCenter />} />
 *   (gate it: only admin_role holders get in; ordinary users are bounced.)
 *
 * The private control room. Sections appear based on the signed-in role —
 * and every action calls a helper in ./lib whose write is ALSO guarded by
 * database RLS, so hiding a tab is convenience, not the security boundary.
 *
 * Sections: Overview · Users · Disputes · Escrow · Communications ·
 *           Approvals · Announcements · Team & Roles · Finances · Reports
 *
 * © 2026 BAMBEH SARL. All rights reserved.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Users, Gavel, Lock, Megaphone, Send, CheckSquare, UserCog,
  Wallet, FileText, LayoutGrid, Loader2, Search, Snowflake, Flame,
  AlertCircle, X, ChevronRight, ShieldAlert, Radio, MessageSquare,
  Boxes,
  Star,
  Cross,
} from 'lucide-react';
import {
  fetchMyRole, capabilitiesFor, ROLE_LABEL, type AdminRole, type Capabilities,
  searchUsers, type AdminUser, setUserFrozen, setAdminFrozen, assignRole,
  fetchDisputes, type Dispute, resolveDispute, setEscrowFrozen,
  composeMessage, fetchPendingMessages, approveMessage, rejectMessage,
  publishAnnouncement, fetchReports, fetchFinanceSummary, fmtXAF,
  fetchFeedback, type FeedbackRow, setFeedbackHandled,
  countUsers,
  fetchAllListings, countListingsByType, type AdminListing,
} from './lib';
import UserActionPanel from './UserActionPanel';   // FIX475
import AdsSection from './AdsSection';             // FIX464
import PromotionsSection from './PromotionsSection'; // FIX469
import PharmaciesSection from './PharmaciesSection'; // FIX482

type Section =
  | 'overview' | 'users' | 'disputes' | 'escrow' | 'comms'
  | 'approvals' | 'announce' | 'team' | 'finances' | 'reports' | 'feedback'
  | 'listings' | 'ads' | 'promos' | 'pharmacies';

const NAV: Array<{ key: Section; label: string; icon: React.ComponentType<{ className?: string }>; needs?: keyof Capabilities }> = [
  { key: 'overview',  label: 'Overview',       icon: LayoutGrid },
  { key: 'users',     label: 'Users',          icon: Users },
  { key: 'listings',  label: 'Listings',       icon: Boxes },
  { key: 'ads',       label: 'Adverts',        icon: Megaphone },
  { key: 'promos',    label: 'Promotions',     icon: Star },
  { key: 'pharmacies', label: 'Pharmacies',    icon: Cross },
  { key: 'disputes',  label: 'Disputes',       icon: Gavel,    needs: 'resolveDisputes' },
  { key: 'escrow',    label: 'Escrow',         icon: Lock,     needs: 'freezeEscrow' },
  { key: 'comms',     label: 'Communications', icon: Send },
  { key: 'approvals', label: 'Approvals',      icon: CheckSquare, needs: 'approveMessages' },
  { key: 'announce',  label: 'Announcements',  icon: Megaphone, needs: 'publishAnnouncements' },
  { key: 'team',      label: 'Team & Roles',   icon: UserCog,  needs: 'createModerators' },
  { key: 'finances',  label: 'Finances',       icon: Wallet,   needs: 'viewFinances' },
  { key: 'reports',   label: 'Reports',        icon: FileText },
  { key: 'feedback',  label: 'Share My Voice', icon: MessageSquare },
];

export default function AdminCommandCenter() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<AdminRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<Section>('overview');
  const [toast, setToast] = useState('');

  const cap = useMemo(() => capabilitiesFor(role), [role]);
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    (async () => {
      const { userId, role } = await fetchMyRole();
      setUserId(userId); setRole(role); setLoading(false);
    })();
  }, []);

  const visibleNav = NAV.filter((n) => !n.needs || cap[n.needs]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-teal-600"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (!role) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <ShieldAlert className="w-12 h-12 text-red-500 mb-3" />
        <h1 className="text-lg font-bold text-gray-900">Access denied</h1>
        <p className="text-sm text-gray-500 mt-1 mb-4">This area is for Bambeh staff only.</p>
        <button onClick={() => navigate('/')} className="px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-semibold">Back to app</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="md:w-60 bg-gray-900 text-gray-300 md:min-h-screen">
        <div className="px-4 py-4 flex items-center gap-2 border-b border-gray-800">
          <Shield className="w-6 h-6 text-teal-400" />
          <div>
            <p className="text-white font-bold text-sm leading-tight">Command Center</p>
            <p className="text-[11px] text-teal-400">{ROLE_LABEL[role]}</p>
          </div>
        </div>
        <nav className="flex md:flex-col overflow-x-auto md:overflow-visible p-2 gap-1">
          {visibleNav.map((n) => {
            const Icon = n.icon;
            const active = section === n.key;
            return (
              <button key={n.key} onClick={() => setSection(n.key)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                  active ? 'bg-teal-600 text-white' : 'hover:bg-gray-800 text-gray-300'
                }`}>
                <Icon className="w-4 h-4" /> {n.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-4 md:p-6 max-w-5xl">
        {section === 'overview'  && <Overview role={role} cap={cap} />}
        {section === 'users'     && <UsersSection userId={userId!} role={role} cap={cap} flash={flash} />}
        {section === 'ads'       && <AdsSection userId={userId!} role={role} cap={cap} flash={flash} />}
        {section === 'promos'    && <PromotionsSection userId={userId!} role={role} cap={cap} flash={flash} />}
        {section === 'pharmacies' && <PharmaciesSection userId={userId!} role={role} cap={cap} flash={flash} />}
        {section === 'listings'  && <ListingsSection />}
        {section === 'disputes'  && cap.resolveDisputes && <DisputesSection userId={userId!} role={role} flash={flash} />}
        {section === 'escrow'    && cap.freezeEscrow && <EscrowSection userId={userId!} role={role} flash={flash} />}
        {section === 'comms'     && <CommsSection userId={userId!} role={role} flash={flash} />}
        {section === 'approvals' && cap.approveMessages && <ApprovalsSection userId={userId!} role={role} flash={flash} />}
        {section === 'announce'  && cap.publishAnnouncements && <AnnounceSection userId={userId!} role={role} flash={flash} />}
        {section === 'team'      && cap.createModerators && <TeamSection userId={userId!} role={role} cap={cap} flash={flash} />}
        {section === 'finances'  && cap.viewFinances && <FinancesSection />}
        {section === 'reports'   && <ReportsSection role={role} />}
        {section === 'feedback'  && <FeedbackSection userId={userId!} role={role} />}
      </main>

      {toast ? (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-xl shadow-lg z-50">{toast}</div>
      ) : null}
    </div>
  );
}

// ---------- Shared bits ----------
const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
    <h2 className="font-bold text-gray-900 mb-3">{title}</h2>
    {children}
  </div>
);

function ReasonModal({ title, onConfirm, onClose, busy }: { title: string; onConfirm: (r: string) => void; onClose: () => void; busy: boolean }) {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4" onClick={() => !busy && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-gray-900">{title}</h3>
          <button onClick={() => !busy && onClose()}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
          placeholder="Reason (recorded in the audit log)…"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-400 mb-3" />
        <button onClick={() => onConfirm(reason)} disabled={busy || !reason.trim()}
          className="w-full bg-teal-600 text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}
        </button>
      </div>
    </div>
  );
}

// ---------- Overview ----------
function Overview({ role, cap }: { role: AdminRole; cap: Capabilities }) {
  const [counts, setCounts] = useState({ openDisputes: 0, pending: 0, users: 0 });
  useEffect(() => {
    (async () => {
      const disputes = await fetchDisputes('open');
      const pend = cap.approveMessages ? await fetchPendingMessages() : [];
      // FIX435 - the total sign-up count, for every admin role.
      const totalUsers = await countUsers();
      setCounts({ openDisputes: disputes.length, pending: (pend as unknown[]).length, users: totalUsers });
    })();
  }, [cap.approveMessages]);
  return (
    <>
      <h1 className="text-xl font-bold text-gray-900 mb-1">Welcome, {ROLE_LABEL[role]}</h1>
      <p className="text-sm text-gray-500 mb-4">Here's the state of the platform right now.</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Stat label="Total users" value={counts.users} icon={Users} />
        <Stat label="Open disputes" value={counts.openDisputes} icon={Gavel} />
        {cap.approveMessages ? <Stat label="Pending approvals" value={counts.pending} icon={CheckSquare} /> : null}
        <Stat label="Your role" value={ROLE_LABEL[role]} icon={Shield} isText />
      </div>
      <div className="mt-4 bg-teal-50 border border-teal-200 rounded-2xl p-4 text-sm text-teal-800">
        {role === 'super_admin' && 'You have full control, including finances and team management. Every moderator report reaches you silently.'}
        {role === 'admin' && 'You can resolve disputes, freeze users and escrow, broadcast, and approve moderator messages. Finances are owner-only.'}
        {role === 'moderator' && 'You can resolve disputes and answer users. Messages you compose are sent for admin approval first.'}
      </div>
    </>
  );
}
function Stat({ label, value, icon: Icon, isText }: { label: string; value: number | string; icon: React.ComponentType<{ className?: string }>; isText?: boolean }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <Icon className="w-5 h-5 text-teal-600 mb-2" />
      <p className={`font-bold text-gray-900 ${isText ? 'text-base' : 'text-2xl'}`}>{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

// ---------- Listings (FIX437) ----------
function ListingsSection() {
  const [rows, setRows] = useState<AdminListing[]>([]);
  const [tally, setTally] = useState<Array<{ type: string; total: number }>>([]);
  const [kind, setKind] = useState('');
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(true);

  const load = useCallback(async () => {
    setBusy(true);
    const [list, counts] = await Promise.all([fetchAllListings(kind, query), countListingsByType()]);
    setRows(list);
    setTally(counts);
    setBusy(false);
  }, [kind, query]);

  useEffect(() => { void load(); }, [load]);

  const total = tally.reduce((sum, t) => sum + t.total, 0);

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-1">Listings</h1>
      <p className="text-sm text-gray-500 mb-4">
        Everything posted on Bambeh, newest first. Marketplace items, services and
        exchanges all live in one table and are told apart by their type.
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          type="button"
          onClick={() => setKind('')}
          className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${kind === '' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300'}`}
        >
          All {total}
        </button>
        {tally.map((t) => (
          <button
            key={t.type}
            type="button"
            onClick={() => setKind(t.type)}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${kind === t.type ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300'}`}
          >
            {t.type} {t.total}
          </button>
        ))}
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search title, category or town"
        className="w-full mb-4 px-3 py-2 border border-gray-300 rounded-lg text-sm"
      />

      {busy && <p className="text-sm text-gray-500">Loading...</p>}
      {!busy && rows.length === 0 && (
        <p className="text-sm text-gray-500">Nothing matches that.</p>
      )}

      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="border border-gray-200 rounded-xl p-3 bg-white">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate">{r.title || '(no title)'}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {r.type || 'untyped'}
                  {r.category ? ' - ' + r.category : ''}
                  {r.location ? ' - ' + r.location : ''}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-gray-900 text-sm">
                  {r.price === null ? '-' : Number(r.price).toLocaleString() + ' XAF'}
                </p>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${r.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  {r.status || 'no status'}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {new Date(r.created_at).toLocaleDateString()}
              {r.view_count !== null ? ' - ' + r.view_count + ' views' : ''}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Users ----------
function UsersSection({ userId, role, cap, flash }: { userId: string; role: AdminRole; cap: Capabilities; flash: (m: string) => void }) {
  const [q, setQ] = useState('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState<AdminUser | null>(null);
  const [busy, setBusy] = useState(false);
  // FIX475 - the user whose action panel is open
  const [panelUser, setPanelUser] = useState<AdminUser | null>(null);

  const load = useCallback(async () => { setLoading(true); setUsers(await searchUsers(q)); setLoading(false); }, [q]);
  useEffect(() => { load(); }, [load]);

  const doFreeze = (u: AdminUser, freeze: boolean) => async (reason: string) => {
    setBusy(true);
    try {
      if (u.admin_role) {
        if (!cap.freezeAdmins) { flash('Only the Super Admin can freeze an admin.'); setBusy(false); setTarget(null); return; }
        await setAdminFrozen(userId, u.id, freeze, reason);
      } else {
        await setUserFrozen(userId, role, u.id, freeze, reason);
      }
      flash(freeze ? 'Account frozen.' : 'Account unfrozen.');
      setTarget(null); await load();
    } catch { flash('Action failed.'); } finally { setBusy(false); }
  };
  const [pending, setPending] = useState<{ u: AdminUser; freeze: boolean } | null>(null);

  return (
    <>
      <h1 className="text-xl font-bold text-gray-900 mb-3">Users</h1>
      <div className="flex gap-2 mb-3">
        <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3">
          <Search className="w-4 h-4 text-gray-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email…"
            className="flex-1 py-2.5 text-sm outline-none" />
        </div>
      </div>
      {loading ? <div className="flex justify-center py-10 text-teal-600"><Loader2 className="w-6 h-6 animate-spin" /></div> : (
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.id}
              onClick={() => setPanelUser(u)}
              role="button" tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setPanelUser(u); }}
              className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3 cursor-pointer hover:border-teal-300 hover:shadow-sm transition-all">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{u.full_name || 'Unnamed'} {u.admin_role ? <span className="text-[10px] bg-teal-100 text-teal-700 rounded-full px-1.5 py-0.5 ml-1">{ROLE_LABEL[u.admin_role]}</span> : null}</p>
                <p className="text-xs text-gray-400 truncate">{u.email}</p>
              </div>
              {u.account_frozen ? <span className="text-[10px] font-bold text-red-600 bg-red-50 rounded-full px-2 py-0.5">Frozen</span> : null}
              {cap.freezeUsers ? (
                <button onClick={(e) => { e.stopPropagation(); setPending({ u, freeze: !u.account_frozen }); }}
                  className={`p-2 rounded-xl ${u.account_frozen ? 'text-emerald-600 hover:bg-emerald-50' : 'text-blue-600 hover:bg-blue-50'}`}
                  title={u.account_frozen ? 'Unfreeze' : 'Freeze'}>
                  {u.account_frozen ? <Flame className="w-4 h-4" /> : <Snowflake className="w-4 h-4" />}
                </button>
              ) : null}
            </div>
          ))}
          {users.length === 0 ? <p className="text-center text-sm text-gray-400 py-8">No users found.</p> : null}
        </div>
      )}
      {panelUser ? (
        <UserActionPanel
          user={panelUser}
          role={role}
          cap={cap}
          actorId={userId}
          onClose={() => setPanelUser(null)}
          onChanged={load}
          onFreezeRequest={(u, freeze) => setPending({ u, freeze })}
          flash={flash}
        />
      ) : null}
      {pending ? (
        <ReasonModal
          title={`${pending.freeze ? 'Freeze' : 'Unfreeze'} ${pending.u.full_name || 'account'}`}
          busy={busy}
          onClose={() => setPending(null)}
          onConfirm={(r) => doFreeze(pending.u, pending.freeze)(r)}
        />
      ) : null}
    </>
  );
}

// ---------- Disputes ----------
function DisputesSection({ userId, role, flash }: { userId: string; role: AdminRole; flash: (m: string) => void }) {
  const [status, setStatus] = useState('open');
  const [rows, setRows] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Dispute | null>(null);
  const [resolution, setResolution] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => { setLoading(true); setRows(await fetchDisputes(status)); setLoading(false); }, [status]);
  useEffect(() => { load(); }, [load]);

  const submit = async (outcome: 'resolved' | 'rejected') => {
    if (!active || !resolution.trim()) { flash('Add a resolution note.'); return; }
    setBusy(true);
    try { await resolveDispute(userId, role, active.id, outcome, resolution); flash(`Dispute ${outcome}.`); setActive(null); setResolution(''); await load(); }
    catch { flash('Action failed.'); } finally { setBusy(false); }
  };

  return (
    <>
      <h1 className="text-xl font-bold text-gray-900 mb-3">Disputes</h1>
      <div className="flex gap-2 mb-3">
        {['open', 'in_review', 'resolved', 'all'].map((s) => (
          <button key={s} onClick={() => setStatus(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${status === s ? 'bg-teal-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>
      {loading ? <div className="flex justify-center py-10 text-teal-600"><Loader2 className="w-6 h-6 animate-spin" /></div> : (
        <div className="space-y-2">
          {rows.map((d) => (
            <button key={d.id} onClick={() => setActive(d)} className="w-full text-left bg-white rounded-xl border border-gray-100 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">{d.subject || 'Dispute'}</p>
                <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${d.status === 'open' ? 'bg-amber-100 text-amber-700' : d.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>{d.status}</span>
              </div>
              <p className="text-xs text-gray-400 line-clamp-2 mt-0.5">{d.description}</p>
            </button>
          ))}
          {rows.length === 0 ? <p className="text-center text-sm text-gray-400 py-8">No disputes.</p> : null}
        </div>
      )}
      {active ? (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4" onClick={() => !busy && setActive(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900 mb-1">{active.subject || 'Dispute'}</h3>
            <p className="text-sm text-gray-500 mb-3">{active.description}</p>
            <textarea value={resolution} onChange={(e) => setResolution(e.target.value)} rows={3}
              placeholder="Resolution note…" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-400 mb-3" />
            <div className="flex gap-2">
              <button onClick={() => submit('resolved')} disabled={busy} className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl font-semibold text-sm disabled:opacity-60">Resolve</button>
              <button onClick={() => submit('rejected')} disabled={busy} className="flex-1 border-2 border-red-200 text-red-600 py-2.5 rounded-xl font-semibold text-sm disabled:opacity-60">Reject</button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

// ---------- Escrow ----------
function EscrowSection({ userId, role, flash }: { userId: string; role: AdminRole; flash: (m: string) => void }) {
  const [orderId, setOrderId] = useState('');
  const [escrowId, setEscrowId] = useState('');
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<null | boolean>(null);

  const act = (freeze: boolean) => async (reason: string) => {
    if (!escrowId.trim()) { flash('Enter the escrow id.'); return; }
    setBusy(true);
    try {
      await setEscrowFrozen(userId, role, escrowId.trim(), orderId.trim() || null, freeze, reason);
      flash(freeze ? 'Escrow frozen.' : 'Escrow released.'); setPending(null);
    } catch { flash('Action failed.'); } finally { setBusy(false); }
  };

  return (
    <>
      <h1 className="text-xl font-bold text-gray-900 mb-1">Escrow Controls</h1>
      <p className="text-sm text-gray-500 mb-4">Freeze escrow to stop funds during fraud or emergencies; release when a deal is verified legitimate. Every action is logged.</p>
      <Card title="Freeze or release an escrow">
        <label className="text-xs font-semibold text-gray-600">Escrow ledger ID</label>
        <input value={escrowId} onChange={(e) => setEscrowId(e.target.value)} placeholder="escrow_ledger.id"
          className="mt-1 mb-3 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none" />
        <label className="text-xs font-semibold text-gray-600">Order ID (optional)</label>
        <input value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="orders.id"
          className="mt-1 mb-3 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none" />
        <div className="flex gap-2">
          <button onClick={() => setPending(true)} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-1"><Snowflake className="w-4 h-4" /> Freeze</button>
          <button onClick={() => setPending(false)} className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-1"><Flame className="w-4 h-4" /> Release</button>
        </div>
      </Card>
      {pending !== null ? (
        <ReasonModal title={pending ? 'Freeze escrow' : 'Release escrow'} busy={busy} onClose={() => setPending(null)} onConfirm={act(pending)} />
      ) : null}
    </>
  );
}

// ---------- Communications ----------
function CommsSection({ userId, role, flash }: { userId: string; role: AdminRole; flash: (m: string) => void }) {
  const [channel, setChannel] = useState<'notification' | 'message'>('notification');
  const [audience, setAudience] = useState<'single' | 'broadcast'>('single');
  const [targetUser, setTargetUser] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const canBroadcast = role === 'admin' || role === 'super_admin';

  const send = async () => {
    if (!body.trim()) { flash('Write a message.'); return; }
    if (audience === 'single' && !targetUser.trim()) { flash('Enter a target user id.'); return; }
    setBusy(true);
    try {
      const result = await composeMessage(userId, role, {
        channel, audience, targetUser: targetUser.trim() || null, title: title.trim() || undefined, body: body.trim(),
      });
      flash(result === 'sent' ? 'Sent.' : 'Submitted for admin approval.');
      setBody(''); setTitle(''); setTargetUser('');
    } catch { flash('Failed to send.'); } finally { setBusy(false); }
  };

  return (
    <>
      <h1 className="text-xl font-bold text-gray-900 mb-1">Communications</h1>
      <p className="text-sm text-gray-500 mb-4">
        {canBroadcast ? 'Send a notification or message to one user or broadcast to everyone.' : 'Compose a message — it will be sent to an admin for approval before delivery.'}
      </p>
      <Card title="Compose">
        <div className="flex gap-2 mb-3">
          {(['notification', 'message'] as const).map((c) => (
            <button key={c} onClick={() => setChannel(c)} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${channel === c ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{c}</button>
          ))}
        </div>
        <div className="flex gap-2 mb-3">
          <button onClick={() => setAudience('single')} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${audience === 'single' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Single user</button>
          {canBroadcast ? (
            <button onClick={() => setAudience('broadcast')} className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 ${audience === 'broadcast' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600'}`}><Radio className="w-3 h-3" /> Everyone</button>
          ) : null}
        </div>
        {audience === 'single' ? (
          <input value={targetUser} onChange={(e) => setTargetUser(e.target.value)} placeholder="Target user id"
            className="mb-2 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none" />
        ) : (
          <p className="mb-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> This message goes to ALL users.</p>
        )}
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (optional)"
          className="mb-2 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none" />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} placeholder="Message…"
          className="mb-3 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none" />
        <button onClick={send} disabled={busy} className="w-full bg-teal-600 text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : (<><Send className="w-4 h-4" /> {canBroadcast ? 'Send' : 'Submit for approval'}</>)}
        </button>
      </Card>
    </>
  );
}

// ---------- Approvals ----------
function ApprovalsSection({ userId, role, flash }: { userId: string; role: AdminRole; flash: (m: string) => void }) {
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const load = useCallback(async () => { setLoading(true); setRows(await fetchPendingMessages() as Array<Record<string, unknown>>); setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);

  const decide = async (id: string, ok: boolean) => {
    setBusyId(id);
    try { if (ok) await approveMessage(userId, role, id); else await rejectMessage(userId, role, id); flash(ok ? 'Approved & sent.' : 'Rejected.'); await load(); }
    catch { flash('Action failed.'); } finally { setBusyId(null); }
  };

  return (
    <>
      <h1 className="text-xl font-bold text-gray-900 mb-3">Message Approvals</h1>
      {loading ? <div className="flex justify-center py-10 text-teal-600"><Loader2 className="w-6 h-6 animate-spin" /></div> : (
        <div className="space-y-2">
          {rows.map((m) => (
            <div key={m.id as string} className="bg-white rounded-xl border border-gray-100 p-3">
              <p className="text-xs text-gray-400 mb-0.5">{String(m.channel)} · {String(m.audience)}</p>
              {m.title ? <p className="text-sm font-semibold text-gray-900">{String(m.title)}</p> : null}
              <p className="text-sm text-gray-700">{String(m.body)}</p>
              <div className="flex gap-2 mt-2">
                <button onClick={() => decide(m.id as string, true)} disabled={busyId === m.id} className="flex-1 bg-emerald-600 text-white py-2 rounded-xl text-sm font-semibold disabled:opacity-60">Approve & send</button>
                <button onClick={() => decide(m.id as string, false)} disabled={busyId === m.id} className="flex-1 border-2 border-red-200 text-red-600 py-2 rounded-xl text-sm font-semibold disabled:opacity-60">Reject</button>
              </div>
            </div>
          ))}
          {rows.length === 0 ? <p className="text-center text-sm text-gray-400 py-8">Nothing awaiting approval.</p> : null}
        </div>
      )}
    </>
  );
}

// ---------- Announcements ----------
function AnnounceSection({ userId, role, flash }: { userId: string; role: AdminRole; flash: (m: string) => void }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const publish = async () => {
    if (!title.trim() || !body.trim()) { flash('Add a title and body.'); return; }
    setBusy(true);
    try { await publishAnnouncement(userId, role, title.trim(), body.trim()); flash('Announcement published.'); setTitle(''); setBody(''); }
    catch { flash('Failed.'); } finally { setBusy(false); }
  };
  return (
    <>
      <h1 className="text-xl font-bold text-gray-900 mb-1">Public Announcements</h1>
      <p className="text-sm text-gray-500 mb-4">Publish an official notice to the whole platform.</p>
      <Card title="New announcement">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="mb-2 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none" />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} placeholder="Announcement…" className="mb-3 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none" />
        <button onClick={publish} disabled={busy} className="w-full bg-teal-600 text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : (<><Megaphone className="w-4 h-4" /> Publish</>)}
        </button>
      </Card>
    </>
  );
}

// ---------- Team & Roles ----------
function TeamSection({ userId, role, cap, flash }: { userId: string; role: AdminRole; cap: Capabilities; flash: (m: string) => void }) {
  const [q, setQ] = useState('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const load = useCallback(async () => { setLoading(true); setUsers(await searchUsers(q)); setLoading(false); }, [q]);
  useEffect(() => { load(); }, [load]);

  const adminCount = users.filter((u) => u.admin_role === 'admin').length;

  const assign = async (u: AdminUser, newRole: AdminRole | null) => {
    setBusyId(u.id);
    try { await assignRole(userId, u.id, newRole, role); flash(newRole ? `Assigned ${ROLE_LABEL[newRole]}.` : 'Role removed.'); await load(); }
    catch (e) { flash((e as { message?: string })?.message || 'Action failed (cap reached?).'); } finally { setBusyId(null); }
  };

  return (
    <>
      <h1 className="text-xl font-bold text-gray-900 mb-1">Team & Roles</h1>
      <p className="text-sm text-gray-500 mb-3">
        {cap.createAdmins ? 'Create up to 2 secondary admins and any number of moderators.' : 'Create moderators to help with support and disputes.'}
      </p>
      <div className="flex items-center gap-2 mb-3 bg-white border border-gray-200 rounded-xl px-3">
        <Search className="w-4 h-4 text-gray-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a user to promote…" className="flex-1 py-2.5 text-sm outline-none" />
      </div>
      {loading ? <div className="flex justify-center py-10 text-teal-600"><Loader2 className="w-6 h-6 animate-spin" /></div> : (
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.id} className="bg-white rounded-xl border border-gray-100 p-3">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{u.full_name || 'Unnamed'}</p>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                </div>
                {u.admin_role ? <span className="text-[10px] font-bold bg-teal-100 text-teal-700 rounded-full px-2 py-0.5">{ROLE_LABEL[u.admin_role]}</span> : null}
              </div>
              {u.admin_role !== 'super_admin' ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {cap.createAdmins ? (
                    <button disabled={busyId === u.id || (u.admin_role !== 'admin' && adminCount >= 2)} onClick={() => assign(u, 'admin')}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 disabled:opacity-40">Make Admin{adminCount >= 2 && u.admin_role !== 'admin' ? ' (max 2)' : ''}</button>
                  ) : null}
                  <button disabled={busyId === u.id} onClick={() => assign(u, 'moderator')} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 disabled:opacity-40">Make Moderator</button>
                  {u.admin_role ? <button disabled={busyId === u.id} onClick={() => assign(u, null)} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 disabled:opacity-40">Remove role</button> : null}
                </div>
              ) : <p className="text-[11px] text-gray-400 mt-1">The Super Admin role cannot be changed here.</p>}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ---------- Finances ----------
function FinancesSection() {
  const [sum, setSum] = useState({ subscriptionRevenue: 0, escrowHeld: 0, escrowReleased: 0, coinsSold: 0 });
  const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => { setSum(await fetchFinanceSummary()); setLoading(false); })(); }, []);
  return (
    <>
      <h1 className="text-xl font-bold text-gray-900 mb-1">Finances</h1>
      <p className="text-sm text-gray-500 mb-4">Owner-only. This is the money flow across the whole platform.</p>
      {loading ? <div className="flex justify-center py-10 text-teal-600"><Loader2 className="w-6 h-6 animate-spin" /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FinCard label="Subscription revenue" value={fmtXAF(sum.subscriptionRevenue)} />
          <FinCard label="Escrow currently held" value={fmtXAF(sum.escrowHeld)} />
          <FinCard label="Escrow released (completed)" value={fmtXAF(sum.escrowReleased)} />
        </div>
      )}
    </>
  );
}
function FinCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <Wallet className="w-5 h-5 text-teal-600 mb-2" />
      <p className="text-2xl font-black text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

// ---------- Reports ----------
const MOOD_FACE: Record<string, string> = {
  love: '\u{1F60D}', good: '\u{1F642}', okay: '\u{1F610}', bad: '\u{1F615}',
};

function FeedbackSection({ userId, role }: { userId: string; role: AdminRole }) {
  const [rows, setRows] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [unhandledOnly, setUnhandledOnly] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setRows(await fetchFeedback(unhandledOnly));
      setLoading(false);
    })();
  }, [unhandledOnly]);

  const toggle = async (row: FeedbackRow) => {
    setBusy(row.id);
    try {
      await setFeedbackHandled(userId, role, row.id, !row.is_read);
      setRows((prev) => unhandledOnly
        ? prev.filter((r) => r.id !== row.id)
        : prev.map((r) => (r.id === row.id ? { ...r, is_read: !r.is_read } : r)));
    } catch { /* leave the row exactly as it was */ }
    setBusy(null);
  };

  return (
    <>
      <h1 className="text-xl font-bold text-gray-900 mb-1">Share My Voice</h1>
      <p className="text-sm text-gray-500 mb-4">
        What people are telling us. Everyone on the team reads this. Deal with what is yours,
        and mark it handled so nobody works the same message twice.
      </p>

      <div className="flex gap-2 mb-4">
        <button onClick={() => setUnhandledOnly(true)}
          className={`text-xs font-semibold rounded-full px-3 py-1.5 ${unhandledOnly ? 'bg-teal-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
          Waiting
        </button>
        <button onClick={() => setUnhandledOnly(false)}
          className={`text-xs font-semibold rounded-full px-3 py-1.5 ${!unhandledOnly ? 'bg-teal-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
          All
        </button>
      </div>

      {loading ? <div className="flex justify-center py-10 text-teal-600"><Loader2 className="w-6 h-6 animate-spin" /></div> : (
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.id} className={`bg-white rounded-xl border p-3 ${r.is_read ? 'border-gray-100 opacity-60' : 'border-teal-200'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 min-w-0">
                  <span className="text-lg leading-none mt-0.5">{MOOD_FACE[r.mood ?? ''] ?? ''}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{r.title || r.category || 'Feedback'}</p>
                    <p className="text-[11px] text-gray-400">
                      {'\u2605'.repeat(r.rating ?? 0)}
                      {r.category ? ` \u00b7 ${r.category}` : ''}
                      {r.name ? ` \u00b7 ${r.name}` : ''}
                      {` \u00b7 ${new Date(r.created_at).toLocaleDateString('fr-CM')}`}
                    </p>
                  </div>
                </div>
                <button onClick={() => toggle(r)} disabled={busy === r.id}
                  className="text-[10px] font-bold rounded-full px-2 py-1 border border-gray-200 text-gray-600 whitespace-nowrap shrink-0">
                  {busy === r.id ? '...' : r.is_read ? 'Reopen' : 'Mark handled'}
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-2 whitespace-pre-wrap">{r.message}</p>
              {r.email ? <p className="text-[11px] text-gray-400 mt-1">{r.email}</p> : null}
            </div>
          ))}
          {rows.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">
              {unhandledOnly ? 'Nothing waiting. Everything has been handled.' : 'No feedback yet.'}
            </p>
          ) : null}
        </div>
      )}
    </>
  );
}

function ReportsSection({ role }: { role: AdminRole }) {
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => { setRows(await fetchReports() as Array<Record<string, unknown>>); setLoading(false); })(); }, []);
  return (
    <>
      <h1 className="text-xl font-bold text-gray-900 mb-1">Reports</h1>
      <p className="text-sm text-gray-500 mb-4">
        {role === 'super_admin' ? 'The full reporting feed, including silent shadow copies of every moderator report.' : 'Reports from the team.'}
      </p>
      {loading ? <div className="flex justify-center py-10 text-teal-600"><Loader2 className="w-6 h-6 animate-spin" /></div> : (
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.id as string} className="bg-white rounded-xl border border-gray-100 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">{String(r.subject || 'Report')}</p>
                {r.is_shadow ? <span className="text-[10px] font-bold bg-purple-100 text-purple-700 rounded-full px-2 py-0.5 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> shadow</span> : <span className="text-[10px] text-gray-400">{String(r.author_role)}</span>}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{String(r.body)}</p>
            </div>
          ))}
          {rows.length === 0 ? <p className="text-center text-sm text-gray-400 py-8">No reports yet.</p> : null}
        </div>
      )}
    </>
  );
}
// BAMBEH_END_TOKEN__ADMINCOMMANDCENTER__COMPLETE
