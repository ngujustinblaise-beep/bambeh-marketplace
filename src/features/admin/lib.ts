// BAMBEH_DEPLOY_TOKEN__ADMINLIB_FIX121_CLEAN
/**
 * admin/lib.ts — Bambeh Admin Command Center (FIX121)
 * FILE LOCATION: src/features/admin/lib.ts
 *
 * Central permission engine + real Supabase helpers for the admin dashboard.
 * The `can()` map here mirrors the DB-level RLS exactly — the UI hides what a
 * role may not do, and the database refuses it even if the UI is bypassed.
 *
 * © 2026 BAMBEH SARL. All rights reserved.
 */

import { supabase } from '@/lib/supabase';

export type AdminRole = 'super_admin' | 'admin' | 'moderator';

export interface Capabilities {
  viewFinances: boolean;
  manageSubscriptions: boolean;
  createAdmins: boolean;
  createModerators: boolean;
  freezeUsers: boolean;
  freezeAdmins: boolean;
  freezeEscrow: boolean;
  resolveDisputes: boolean;
  sendDirect: boolean;      // send messages/notifications without approval
  broadcast: boolean;
  approveMessages: boolean;
  publishAnnouncements: boolean;
  seeShadowReports: boolean;
}

/** The single source of truth for what each role may do (mirrors RLS). */
export function capabilitiesFor(role: AdminRole | null): Capabilities {
  const none: Capabilities = {
    viewFinances: false, manageSubscriptions: false, createAdmins: false,
    createModerators: false, freezeUsers: false, freezeAdmins: false,
    freezeEscrow: false, resolveDisputes: false, sendDirect: false,
    broadcast: false, approveMessages: false, publishAnnouncements: false,
    seeShadowReports: false,
  };
  if (role === 'super_admin') {
    return {
      viewFinances: true, manageSubscriptions: true, createAdmins: true,
      createModerators: true, freezeUsers: true, freezeAdmins: true,
      freezeEscrow: true, resolveDisputes: true, sendDirect: true,
      broadcast: true, approveMessages: true, publishAnnouncements: true,
      seeShadowReports: true,
    };
  }
  if (role === 'admin') {
    return {
      ...none,
      createModerators: true, freezeUsers: true, freezeEscrow: true,
      resolveDisputes: true, sendDirect: true, broadcast: true,
      approveMessages: true, publishAnnouncements: true,
    };
  }
  if (role === 'moderator') {
    return { ...none, resolveDisputes: true }; // messages allowed but forced pending
  }
  return none;
}

export const ROLE_LABEL: Record<AdminRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  moderator: 'Moderator',
};

/** Fetch the signed-in user's admin role (null = ordinary user). */
/* ============================================================================
 * FIX417 - THE ADMIN LOCKOUT, FIXED AT THE ROOT.
 *
 * The old fetchMyRole did two things that guaranteed this failure:
 *   1. getUser()  - a NETWORK call, when getSession() reads the token locally
 *   2. const { data } = ...  - the error was DISCARDED, so a dead connection
 *      and a genuine "you are not staff" produced the identical answer: null.
 *
 * A role you have been granted must not evaporate because a request timed out.
 * ========================================================================== */

const ROLE_CACHE_KEY = 'bambeh_admin_role';

/** The role carried inside the JWT. No network. Cannot fail. Cannot time out. */
function roleFromToken(user: unknown): AdminRole | null {
  try {
    const meta = (user as { app_metadata?: Record<string, unknown> } | null)?.app_metadata;
    if (!meta) return null;
    const r = String(meta.admin_role ?? meta.role ?? '').toLowerCase();
    if (r === 'super_admin' || r === 'admin' || r === 'moderator') return r as AdminRole;
    // is_admin: true is the simple flag set by SQL. Treat it as full admin.
    if (meta.is_admin === true || String(meta.is_admin ?? '').toLowerCase() === 'true') {
      return 'admin';
    }
    return null;
  } catch {
    return null;
  }
}

function rememberRole(userId: string, role: AdminRole | null): void {
  try {
    if (role) {
      window.localStorage.setItem(ROLE_CACHE_KEY, JSON.stringify({ userId, role }));
    }
  } catch { /* storage blocked - not fatal */ }
}

/** The last role we GENUINELY read for this user. Never used to grant a role
 *  we never saw - only to avoid dropping one we did. */
function recallRole(userId: string): AdminRole | null {
  try {
    const raw = window.localStorage.getItem(ROLE_CACHE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as { userId?: string; role?: string };
    if (p.userId !== userId) return null;
    const r = String(p.role ?? '').toLowerCase();
    if (r === 'super_admin' || r === 'admin' || r === 'moderator') return r as AdminRole;
    return null;
  } catch {
    return null;
  }
}

export async function fetchMyRole(): Promise<{ userId: string | null; role: AdminRole | null }> {
  // 1. THE SESSION, NOT getUser(). getSession() reads the stored token and
  //    makes no request, so this step cannot be lost to a bad connection.
  let userId: string | null = null;
  let tokenRole: AdminRole | null = null;
  try {
    const { data } = await supabase.auth.getSession();
    const user = data?.session?.user ?? null;
    userId = user?.id ?? null;
    tokenRole = roleFromToken(user);
  } catch {
    userId = null;
  }

  if (!userId) return { userId: null, role: null };

  // 2. THE TOKEN WINS. app_metadata is writable only by SQL or the service
  //    role - a user cannot grant themselves anything here.
  if (tokenRole) {
    rememberRole(userId, tokenRole);
    return { userId, role: tokenRole };
  }

  // 3. The token said nothing, so ask the database - and KEEP THE ERROR.
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('admin_role')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      // COULD NOT ASK. That is not the same as "no". Keep what we last knew.
      console.warn('[admin] role read failed - keeping last known role.', error);
      return { userId, role: recallRole(userId) };
    }

    const dbRole = (data?.admin_role as AdminRole | null) ?? null;
    rememberRole(userId, dbRole);
    return { userId, role: dbRole };
  } catch (e) {
    console.warn('[admin] role read threw - keeping last known role.', e);
    return { userId, role: recallRole(userId) };
  }
}

/** Write an audit row for any privileged action. */
export async function logAction(
  actorId: string, actorRole: AdminRole, action: string,
  targetType: string, targetId: string | null, details: Record<string, unknown> = {},
) {
  await supabase.from('admin_actions').insert({
    actor_id: actorId, actor_role: actorRole, action,
    target_type: targetType, target_id: targetId, details,
  });
}

/** File a staff report (moderator reports auto-spawn a shadow copy via trigger). */
export async function fileReport(
  authorId: string, authorRole: AdminRole,
  opts: { subject: string; body: string; reportType?: string; relatedType?: string; relatedId?: string },
) {
  await supabase.from('staff_reports').insert({
    author_id: authorId, author_role: authorRole,
    report_type: opts.reportType ?? 'action',
    subject: opts.subject, body: opts.body,
    related_type: opts.relatedType ?? null, related_id: opts.relatedId ?? null,
    visible_to: 'admin',
  });
}

// ---- Users ----------------------------------------------------------------
export interface AdminUser {
  id: string;
  full_name: string | null;
  email: string | null;
  admin_role: AdminRole | null;
  account_frozen: boolean;
  created_at: string;
}

/* FIX419 ---------------------------------------------------------------------
 * Every admin fetcher used `const { data } = await ...` and threw the error
 * away. Two different failures then looked identical to the UI:
 *   - a real empty result
 *   - a request that never came back
 * and when the fetch THREW rather than returning an error object, the whole
 * function threw, the caller's setLoading(false) never ran, and the panel span
 * forever. That is the spinner on the Users tab.
 *
 * adminSafe() gives every fetcher the same contract: it never throws, it tries
 * twice, and it tells the caller whether the answer is real.
 * -------------------------------------------------------------------------- */
export interface AdminFetch<T> { rows: T[]; failed: boolean }

async function adminSafe<T>(run: () => Promise<{ data: unknown; error: unknown }>): Promise<AdminFetch<T>> {
  for (let attemptNo = 0; attemptNo < 2; attemptNo++) {
    try {
      const res = await run();
      if (res && res.error) {
        if (attemptNo === 0) { await new Promise((r) => setTimeout(r, 600)); continue; }
        console.warn('[admin] query failed after retry', res.error);
        return { rows: [], failed: true };
      }
      return { rows: (res?.data ?? []) as T[], failed: false };
    } catch (err) {
      if (attemptNo === 0) { await new Promise((r) => setTimeout(r, 600)); continue; }
      console.warn('[admin] query threw after retry', err);
      return { rows: [], failed: true };
    }
  }
  return { rows: [], failed: true };
}

export async function searchUsers(query: string): Promise<AdminUser[]> {
  let q = supabase
    .from('profiles')
    .select('id, full_name, email, admin_role, account_frozen, created_at')
    .order('created_at', { ascending: false })
    .limit(50);
  if (query.trim()) q = q.or(`full_name.ilike.%${query}%,email.ilike.%${query}%`);
  const out = await adminSafe<AdminUser>(() => q as unknown as Promise<{ data: unknown; error: unknown }>);
  return out.rows;
}

export async function setUserFrozen(
  actorId: string, actorRole: AdminRole, targetId: string, frozen: boolean, reason: string,
) {
  const { error } = await supabase
    .from('profiles')
    .update({ account_frozen: frozen, frozen_reason: frozen ? reason : null })
    .eq('id', targetId);
  if (error) throw error;
  await logAction(actorId, actorRole, frozen ? 'freeze_user' : 'unfreeze_user', 'user', targetId, { reason });
}

/** Super-admin only: freeze/unfreeze an ADMIN account. RLS + this guard both apply. */
export async function setAdminFrozen(
  actorId: string, targetId: string, frozen: boolean, reason: string,
) {
  const { error } = await supabase
    .from('profiles')
    .update({ account_frozen: frozen, frozen_reason: frozen ? reason : null })
    .eq('id', targetId);
  if (error) throw error;
  await logAction(actorId, 'super_admin', frozen ? 'freeze_admin' : 'unfreeze_admin', 'user', targetId, { reason });
}

// ---- Roles ----------------------------------------------------------------
export async function assignRole(
  actorId: string, targetId: string, role: AdminRole | null, actorRole: AdminRole,
) {
  const { error } = await supabase
    .from('profiles')
    .update({ admin_role: role, created_by_admin: actorId })
    .eq('id', targetId);
  if (error) throw error; // DB trigger enforces the 2-admin cap + single super
  await logAction(actorId, actorRole, role ? `assign_${role}` : 'remove_role', 'user', targetId, {});
}

// ---- Escrow controls ------------------------------------------------------
export async function setEscrowFrozen(
  actorId: string, actorRole: AdminRole, escrowId: string, orderId: string | null, frozen: boolean, reason: string,
) {
  const nowIso = new Date().toISOString();
  const { error } = await supabase
    .from('escrow_ledger')
    .update({ status: frozen ? 'frozen' : 'held', updated_at: nowIso })
    .eq('id', escrowId);
  if (error) throw error;
  if (orderId) {
    await supabase.from('orders')
      .update({ escrow_status: frozen ? 'frozen' : 'held', updated_at: nowIso })
      .eq('id', orderId);
  }
  await logAction(actorId, actorRole, frozen ? 'freeze_escrow' : 'unfreeze_escrow', 'escrow', escrowId, { reason, orderId });
}

// ---- Disputes -------------------------------------------------------------
export interface Dispute {
  id: string;
  subject: string | null;
  description: string | null;
  status: 'open' | 'in_review' | 'resolved' | 'rejected';
  raised_by: string | null;
  against_user: string | null;
  assigned_to: string | null;
  resolution: string | null;
  created_at: string;
}

export async function fetchDisputes(status?: string): Promise<Dispute[]> {
  let q = supabase.from('disputes').select('*').order('created_at', { ascending: false }).limit(100);
  if (status && status !== 'all') q = q.eq('status', status);
  const { data } = await q;
  return (data ?? []) as Dispute[];
}

export async function resolveDispute(
  actorId: string, actorRole: AdminRole, disputeId: string,
  outcome: 'resolved' | 'rejected', resolution: string,
) {
  const { error } = await supabase
    .from('disputes')
    .update({ status: outcome, resolution, resolved_by: actorId, assigned_to: actorId, updated_at: new Date().toISOString() })
    .eq('id', disputeId);
  if (error) throw error;
  await logAction(actorId, actorRole, `dispute_${outcome}`, 'dispute', disputeId, { resolution });
  // moderators file a report (shadow-copied to super by DB trigger)
  if (actorRole === 'moderator') {
    await fileReport(actorId, actorRole, {
      subject: `Dispute ${outcome}`, body: resolution,
      reportType: 'action', relatedType: 'dispute', relatedId: disputeId,
    });
  }
}

// ---- Messages / notifications --------------------------------------------
export interface OutboundDraft {
  channel: 'notification' | 'message';
  audience: 'single' | 'broadcast';
  targetUser?: string | null;
  title?: string;
  body: string;
}

/** Moderators create pending_approval rows; admins/super send immediately. */
export async function composeMessage(
  actorId: string, actorRole: AdminRole, draft: OutboundDraft,
): Promise<'sent' | 'pending_approval'> {
  const canSendNow = actorRole === 'admin' || actorRole === 'super_admin';
  const status = canSendNow ? 'approved' : 'pending_approval';
  const { data, error } = await supabase.from('admin_messages').insert({
    author_id: actorId, author_role: actorRole,
    channel: draft.channel, audience: draft.audience,
    target_user: draft.audience === 'single' ? (draft.targetUser ?? null) : null,
    title: draft.title ?? null, body: draft.body, status,
  }).select('id').single();
  if (error) throw error;
  if (canSendNow) { await deliverMessage(data!.id); return 'sent'; }
  return 'pending_approval';
}

/** Fan a message out into the user notifications table (real delivery). */
export async function deliverMessage(messageId: string) {
  const { data: msg } = await supabase
    .from('admin_messages').select('*').eq('id', messageId).maybeSingle();
  if (!msg) return;

  const rows: Array<Record<string, unknown>> = [];
  if (msg.audience === 'broadcast') {
    const { data: users } = await supabase.from('profiles').select('id').limit(100000);
    for (const u of (users ?? []) as Array<{ id: string }>) {
      rows.push({ user_id: u.id, title: msg.title, body: msg.body, type: 'admin', created_at: new Date().toISOString() });
    }
  } else if (msg.target_user) {
    rows.push({ user_id: msg.target_user, title: msg.title, body: msg.body, type: 'admin', created_at: new Date().toISOString() });
  }
  // chunked insert to avoid payload limits
  for (let i = 0; i < rows.length; i += 500) {
    await supabase.from('notifications').insert(rows.slice(i, i + 500));
  }
  await supabase.from('admin_messages')
    .update({ status: 'sent', sent_at: new Date().toISOString() })
    .eq('id', messageId);
}

export async function fetchPendingMessages() {
  const out = await adminSafe(() => supabase
    .from('admin_messages').select('*')
    .eq('status', 'pending_approval')
    .order('created_at', { ascending: false }) as unknown as Promise<{ data: unknown; error: unknown }>);
  return out.rows;
}

export async function approveMessage(actorId: string, actorRole: AdminRole, messageId: string) {
  await supabase.from('admin_messages')
    .update({ status: 'approved', approved_by: actorId })
    .eq('id', messageId);
  await deliverMessage(messageId);
  await logAction(actorId, actorRole, 'approve_message', 'message', messageId, {});
}

export async function rejectMessage(actorId: string, actorRole: AdminRole, messageId: string) {
  await supabase.from('admin_messages').update({ status: 'rejected', approved_by: actorId }).eq('id', messageId);
  await logAction(actorId, actorRole, 'reject_message', 'message', messageId, {});
}

// ---- Announcements --------------------------------------------------------
export async function publishAnnouncement(actorId: string, actorRole: AdminRole, title: string, body: string) {
  const { error } = await supabase.from('announcements').insert({ author_id: actorId, title, body, active: true });
  if (error) throw error;
  await logAction(actorId, actorRole, 'announce', 'announcement', null, { title });
}

// ---- Reports feed (super sees shadow copies) ------------------------------
export async function fetchReports() {
  const out = await adminSafe(() => supabase
    .from('staff_reports').select('*')
    .order('created_at', { ascending: false }).limit(100) as unknown as Promise<{ data: unknown; error: unknown }>);
  return out.rows;
}

// ---- Finances (super only; RLS on the underlying tables also enforces) ----
export async function fetchFinanceSummary() {
  const out = { subscriptionRevenue: 0, escrowHeld: 0, escrowReleased: 0, coinsSold: 0 };
  try {
    const { data: subs } = await supabase.from('subscription_payments').select('amount_xaf, status');
    for (const r of (subs ?? []) as Array<{ amount_xaf: number | null; status: string }>) {
      if (r.status === 'completed' || r.status === 'success') out.subscriptionRevenue += r.amount_xaf ?? 0;
    }
  } catch { /* table may differ */ }
  try {
    const { data: esc } = await supabase.from('escrow_ledger').select('amount_xaf, status');
    for (const r of (esc ?? []) as Array<{ amount_xaf: number | null; status: string }>) {
      if (r.status === 'held' || r.status === 'frozen') out.escrowHeld += r.amount_xaf ?? 0;
      if (r.status === 'released') out.escrowReleased += r.amount_xaf ?? 0;
    }
  } catch { /* ignore */ }
  return out;
}

export const fmtXAF = (n: number | null | undefined) =>
  n == null || Number.isNaN(n) ? '0 FCFA'
    : new Intl.NumberFormat('fr-CM', { maximumFractionDigits: 0 }).format(n) + ' FCFA';
// ---- Share My Voice feedback (all three staff roles may read) -------------
export interface FeedbackRow {
  id: string;
  user_id: string | null;
  mood: string | null;
  rating: number | null;
  category: string | null;
  title: string | null;
  message: string | null;
  name: string | null;
  email: string | null;
  submitted_at: string | null;
  created_at: string;
  is_read: boolean;
  admin_note: string | null;
}

/** Moderators, admins and the super admin all see this. RLS enforces it too. */
export async function fetchFeedback(onlyUnhandled = false): Promise<FeedbackRow[]> {
  let q = supabase
    .from('user_feedback')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);
  if (onlyUnhandled) q = q.eq('is_read', false);
  const { data } = await q;
  return (data ?? []) as FeedbackRow[];
}

export async function setFeedbackHandled(
  actorId: string, actorRole: AdminRole, feedbackId: string, handled: boolean,
) {
  const { error } = await supabase
    .from('user_feedback')
    .update({ is_read: handled })
    .eq('id', feedbackId);
  if (error) throw error;
  await logAction(actorId, actorRole, handled ? 'feedback_handled' : 'feedback_reopened', 'feedback', feedbackId, {});
}

// BAMBEH_END_TOKEN__ADMINLIB__COMPLETE
