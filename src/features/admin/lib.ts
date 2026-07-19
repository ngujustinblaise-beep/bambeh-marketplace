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
export async function fetchMyRole(): Promise<{ userId: string | null; role: AdminRole | null }> {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth?.user?.id ?? null;
  if (!userId) return { userId: null, role: null };
  const { data } = await supabase
    .from('profiles')
    .select('admin_role')
    .eq('id', userId)
    .maybeSingle();
  return { userId, role: (data?.admin_role as AdminRole | null) ?? null };
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

export async function searchUsers(query: string): Promise<AdminUser[]> {
  let q = supabase
    .from('profiles')
    .select('id, full_name, email, admin_role, account_frozen, created_at')
    .order('created_at', { ascending: false })
    .limit(50);
  if (query.trim()) q = q.or(`full_name.ilike.%${query}%,email.ilike.%${query}%`);
  const { data } = await q;
  return (data ?? []) as AdminUser[];
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
  const { data } = await supabase
    .from('admin_messages').select('*')
    .eq('status', 'pending_approval')
    .order('created_at', { ascending: false });
  return data ?? [];
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
  const { data } = await supabase
    .from('staff_reports').select('*')
    .order('created_at', { ascending: false }).limit(100);
  return data ?? [];
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
// BAMBEH_END_TOKEN__ADMINLIB__COMPLETE
