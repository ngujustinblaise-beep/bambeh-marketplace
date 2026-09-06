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
    .limit(500);   // FIX437 - was 50. You have 75 users; 50 hid a quarter of them.
  if (query.trim()) q = q.or(`full_name.ilike.%${query}%,email.ilike.%${query}%`);
  const out = await adminSafe<AdminUser>(() => q as unknown as Promise<{ data: unknown; error: unknown }>);
  return out.rows;
}

/**
 * FIX435 - how many people have actually signed up.
 * head:true sends no rows back, only the number, so this stays cheap even
 * when the table is large. searchUsers above caps at 50 for the list; this
 * is the real total and is what the Overview shows.
 */
export async function countUsers(): Promise<number> {
  const { count, error } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true });
  if (error) return 0;
  return count ?? 0;
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

/* ==========================================================================
   FIX437 - every listing on Bambeh, for staff eyes.

   IMPORTANT, and it is why this reads only ONE table:
   `listings` is where everything actually lives. Marketplace items,
   services, exchanges and rentals are all rows in here separated by the
   `type` column. The tables named services, rentals, vehicles and
   marketplace_items are dead twins from the Firebase migration and hold
   zero rows - reading them would show an empty page forever.
   ========================================================================== */

export type AdminListing = {
  id: string;
  title: string | null;
  type: string | null;
  status: string | null;
  price: number | null;
  category: string | null;
  location: string | null;
  user_id: string | null;
  view_count: number | null;
  created_at: string;
};

/** Everything, newest first. kind '' means all types. */
export async function fetchAllListings(kind: string, query: string): Promise<AdminListing[]> {
  let q = supabase
    .from('listings')
    .select('id, title, type, status, price, category, location, user_id, view_count, created_at')
    .order('created_at', { ascending: false })
    .limit(500);

  if (kind.trim()) q = q.eq('type', kind.trim());
  if (query.trim()) q = q.or(`title.ilike.%${query}%,category.ilike.%${query}%,location.ilike.%${query}%`);

  const out = await adminSafe<AdminListing>(() => q as unknown as Promise<{ data: unknown; error: unknown }>);
  return out.rows;
}

/** How many listings exist, by type. Cheap: counts only, no rows returned. */
export async function countListingsByType(): Promise<Array<{ type: string; total: number }>> {
  const { data, error } = await supabase
    .from('listings')
    .select('type')
    .limit(2000);
  if (error || !data) return [];
  const tally: Record<string, number> = {};
  for (const row of data as Array<{ type: string | null }>) {
    const key = row.type || 'untyped';
    tally[key] = (tally[key] || 0) + 1;
  }
  return Object.keys(tally).map((t) => ({ type: t, total: tally[t] })).sort((a, b) => b.total - a.total);
}

/* ------------------------------------------------------------------ *
 * FIX460a - STATUS-AWARE READS.
 *
 * The originals above return [] or 0 on failure, which the UI then shows
 * as fact. These return the failure flag adminSafe already computed, so
 * the Command Center can say "could not reach the database" instead of
 * inventing a zero. Old functions are left untouched for other callers.
 * ------------------------------------------------------------------ */

/** How many people have signed up. null means THE QUESTION COULD NOT BE ASKED. */
export async function countUsersOrNull(): Promise<number | null> {
  try {
    const { count, error } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });
    if (error) {
      console.warn('[admin] user count failed - not reporting a number.', error);
      return null;
    }
    return count ?? 0;
  } catch (err) {
    console.warn('[admin] user count threw - not reporting a number.', err);
    return null;
  }
}

/** searchUsers, but it keeps the failed flag instead of discarding it. */
export async function searchUsersWithStatus(query: string): Promise<AdminFetch<AdminUser>> {
  let q = supabase
    .from('profiles')
    .select('id, full_name, email, admin_role, account_frozen, created_at')
    .order('created_at', { ascending: false })
    .limit(500);
  if (query.trim()) q = q.or(`full_name.ilike.%${query}%,email.ilike.%${query}%`);
  return adminSafe<AdminUser>(() => q as unknown as Promise<{ data: unknown; error: unknown }>);
}

/** fetchAllListings, but it keeps the failed flag instead of discarding it. */
export async function fetchAllListingsWithStatus(
  kind: string, query: string,
): Promise<AdminFetch<AdminListing>> {
  let q = supabase
    .from('listings')
    .select('id, title, type, status, price, category, location, user_id, view_count, created_at')
    .order('created_at', { ascending: false })
    .limit(500);
  if (kind.trim()) q = q.eq('type', kind.trim());
  if (query.trim()) {
    q = q.or(`title.ilike.%${query}%,category.ilike.%${query}%,location.ilike.%${query}%`);
  }
  return adminSafe<AdminListing>(() => q as unknown as Promise<{ data: unknown; error: unknown }>);
}

/** The per-type tally, with an honest failure flag. */
export async function countListingsByTypeWithStatus(): Promise<{
  rows: Array<{ type: string; total: number }>; failed: boolean;
}> {
  try {
    const { data, error } = await supabase.from('listings').select('type').limit(2000);
    if (error || !data) {
      console.warn('[admin] listing tally failed - not reporting a total.', error);
      return { rows: [], failed: true };
    }
    const tally: Record<string, number> = {};
    for (const row of data as Array<{ type: string | null }>) {
      const key = row.type || 'untyped';
      tally[key] = (tally[key] || 0) + 1;
    }
    const rows = Object.keys(tally)
      .map((t) => ({ type: t, total: tally[t] }))
      .sort((a, b) => b.total - a.total);
    return { rows, failed: false };
  } catch (err) {
    console.warn('[admin] listing tally threw - not reporting a total.', err);
    return { rows: [], failed: true };
  }
}

// BAMBEH_END_TOKEN__ADMINLIB__COMPLETE


// ═══════════════════════════════════════════════════════════════════════════
// FIX475 — USER ACTION PANEL helpers
// Added by the User Action Panel. Everything here goes through a server-side
// function that gates itself, so the UI can never grant more than the database
// allows even if someone edits the JavaScript in their browser.
// ═══════════════════════════════════════════════════════════════════════════

export type GrantPlan = 'daily' | 'weekly' | 'monthly';

export interface GrantResult {
  granted: number;
  extended: number;
  skipped: number;
  plan_used: string;
  days_used: number;
}

/**
 * Give premium access to one user, a chosen list, or everyone.
 *
 * The rules live in admin_grant_subscription (FIX467b), not here: it writes
 * `status` and `is_active` together so no reader can disagree with another,
 * stamps every gift with price_xaf = 0 and an ADMIN_GRANT payment reference so
 * a free month never lands in your revenue, and EXTENDS an existing
 * subscription rather than stacking a second row.
 *
 * Expiry is not optional. useSubscription only counts a row whose expires_at is
 * still in the future, so a grant ends by itself.
 */
export async function adminGrantSubscription(
  scope: 'user' | 'list' | 'all',
  userIds: string[] | null,
  plan: GrantPlan,
): Promise<GrantResult> {
  const { data, error } = await supabase.rpc('admin_grant_subscription', {
    p_scope: scope,
    p_user_ids: scope === 'all' ? null : userIds,
    p_plan: plan,
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return (row ?? { granted: 0, extended: 0, skipped: 0, plan_used: plan, days_used: 0 }) as GrantResult;
}

export interface ResetLink {
  link: string;
  email: string;
  full_name: string | null;
  /** digits only, ready for a wa.me URL. null when no number is on file. */
  phone: string | null;
  /** true = an @phone.bambeh.com address, so email delivery cannot work */
  email_is_synthetic: boolean;
  note: string;
}

/**
 * Mint a password recovery link WITHOUT sending it anywhere.
 *
 * Calls the admin-reset-link Edge Function, which holds the service-role key
 * server-side and re-checks the caller's staff role against the database
 * before it will mint anything. Staff then deliver the link themselves.
 */
export async function adminGenerateResetLink(targetUserId: string): Promise<ResetLink> {
  const { data, error } = await supabase.functions.invoke('admin-reset-link', {
    body: { user_id: targetUserId },
  });
  if (error) {
    // functions.invoke hides the server's message inside the response body.
    // Digging it out is the difference between "Edge Function returned a
    // non-2xx status code" and "Only the Super Admin can reset a staff account".
    let detail = error.message || 'Could not generate a link';
    try {
      const ctx = (error as unknown as { context?: Response }).context;
      if (ctx && typeof ctx.json === 'function') {
        const body = await ctx.json();
        if (body?.error) detail = body.error;
      }
    } catch { /* keep the generic message */ }
    throw new Error(detail);
  }
  if (!data?.link) throw new Error('The server returned no link.');
  return data as ResetLink;
}

/** Builds a WhatsApp deep link with the message already typed. */
export function whatsappResetUrl(phoneDigits: string, name: string | null, link: string): string {
  const who = name ? `${name}, ` : '';
  const msg =
    `${who}here is your Bambeh password reset link. ` +
    `Open it on your phone and choose a new password. It works once.\n\n${link}`;
  return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(msg)}`;
}


// ═══════════════════════════════════════════════════════════════════════════
// FIX464 — ADS SECTION helpers
//
// These read and write `corporate_ads`, the table AdInterstitial already
// displays from. It carries starts_at / ends_at for scheduling and
// click_count / view_count so you can hand an advertiser a real number.
//
// This REPLACES PostFeaturedAdForm, which wrote to `featured_ads` — a table
// nothing in the app has ever read. Anyone who used that form saw a green tick
// and their advert went nowhere.
// ═══════════════════════════════════════════════════════════════════════════

export interface CorporateAd {
  id: string;
  title: string;
  description: string | null;
  title_fr: string | null;
  description_fr: string | null;
  image_url: string | null;
  link_url: string | null;
  company_name: string | null;
  tier: string | null;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  click_count: number | null;
  view_count: number | null;
  created_at: string;
}

const AD_COLUMNS =
  'id, title, description, title_fr, description_fr, image_url, link_url, ' +
  'company_name, tier, is_active, starts_at, ends_at, click_count, view_count, created_at';

/** Every advert, newest first. Reports failure instead of returning []. */
export async function fetchAds(): Promise<AdminFetch<CorporateAd>> {
  const q = supabase
    .from('corporate_ads')
    .select(AD_COLUMNS)
    .order('created_at', { ascending: false })
    .limit(200);
  return adminSafe<CorporateAd>(() => q as unknown as Promise<{ data: unknown; error: unknown }>);
}

export type AdDraft = Omit<CorporateAd, 'id' | 'click_count' | 'view_count' | 'created_at'>;

export async function createAd(
  actorId: string, actorRole: AdminRole, draft: AdDraft,
): Promise<string> {
  const { data, error } = await supabase
    .from('corporate_ads')
    .insert(draft)
    .select('id')
    .single();
  if (error) throw error;
  await logAction(actorId, actorRole, 'create_ad', 'ad', data.id, { title: draft.title });
  return data.id as string;
}

export async function updateAd(
  actorId: string, actorRole: AdminRole, id: string, patch: Partial<AdDraft>,
): Promise<void> {
  const { error } = await supabase.from('corporate_ads').update(patch).eq('id', id);
  if (error) throw error;
  await logAction(actorId, actorRole, 'update_ad', 'ad', id, patch as Record<string, unknown>);
}

export async function setAdActive(
  actorId: string, actorRole: AdminRole, id: string, active: boolean,
): Promise<void> {
  const { error } = await supabase.from('corporate_ads').update({ is_active: active }).eq('id', id);
  if (error) throw error;
  await logAction(actorId, actorRole, active ? 'activate_ad' : 'deactivate_ad', 'ad', id, {});
}

export async function deleteAd(
  actorId: string, actorRole: AdminRole, id: string,
): Promise<void> {
  const { error } = await supabase.from('corporate_ads').delete().eq('id', id);
  if (error) throw error;
  await logAction(actorId, actorRole, 'delete_ad', 'ad', id, {});
}

/**
 * Is this advert actually running right now?
 * AdInterstitial applies exactly these three rules, so the badge in the admin
 * list and what a user sees can never disagree.
 */
export function adIsLive(ad: CorporateAd, now = Date.now()): boolean {
  if (!ad.is_active) return false;
  if (!ad.image_url) return false;                       // no image, never shown
  if (ad.starts_at && new Date(ad.starts_at).getTime() > now) return false;
  if (ad.ends_at && new Date(ad.ends_at).getTime() < now) return false;
  return true;
}


// ═══════════════════════════════════════════════════════════════════════════
// FIX469 — PROMOTIONS helpers
//
// Featuring is sold in tiers: 100 XAF = 24 hours, 500 = a week, 1500 = a month.
// None of those rules live here. They live in admin_promote_listing (FIX476),
// which also enforces the one-featured-listing-per-user cap by standing down
// the owner's other live features. That way the cap holds no matter which
// screen or script does the promoting.
// ═══════════════════════════════════════════════════════════════════════════

export type PromotePlan = 'daily' | 'weekly' | 'monthly';

/** A listing with its featuring state attached. */
export type FeaturedListing = AdminListing & {
  is_featured: boolean | null;
  featured_until: string | null;
};

const FEATURED_COLUMNS =
  'id, title, type, status, price, category, location, user_id, view_count, created_at, ' +
  'is_featured, featured_until';

/** Everything currently flagged featured, soonest to expire first. */
export async function fetchFeaturedListings(): Promise<AdminFetch<FeaturedListing>> {
  const q = supabase
    .from('listings')
    .select(FEATURED_COLUMNS)
    .eq('is_featured', true)
    .order('featured_until', { ascending: true, nullsFirst: false })
    .limit(200);
  return adminSafe<FeaturedListing>(() => q as unknown as Promise<{ data: unknown; error: unknown }>);
}

/** Search anything promotable. Featured state comes back with it. */
export async function searchPromotableListings(query: string): Promise<AdminFetch<FeaturedListing>> {
  let q = supabase
    .from('listings')
    .select(FEATURED_COLUMNS)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(60);
  if (query.trim()) {
    q = q.or(`title.ilike.%${query}%,category.ilike.%${query}%,location.ilike.%${query}%`);
  }
  return adminSafe<FeaturedListing>(() => q as unknown as Promise<{ data: unknown; error: unknown }>);
}

export interface PromoteResult {
  listing_id: string;
  featured_until: string;
  plan_used: string;
  /** other live features by the same owner that were stood down for the cap */
  stood_down: number;
}

export async function promoteListing(
  actorId: string, actorRole: AdminRole, listingId: string, plan: PromotePlan,
): Promise<PromoteResult> {
  const { data, error } = await supabase.rpc('admin_promote_listing', {
    p_listing_id: listingId,
    p_plan: plan,
  });
  if (error) throw error;
  const row = (Array.isArray(data) ? data[0] : data) as PromoteResult;
  await logAction(actorId, actorRole, 'promote_listing', 'listing', listingId, {
    plan, featured_until: row?.featured_until, stood_down: row?.stood_down,
  });
  return row;
}

export async function unpromoteListing(
  actorId: string, actorRole: AdminRole, listingId: string,
): Promise<void> {
  const { error } = await supabase.rpc('admin_unpromote_listing', { p_listing_id: listingId });
  if (error) throw error;
  await logAction(actorId, actorRole, 'unpromote_listing', 'listing', listingId, {});
}

/** Clears anything whose date has already passed. Returns how many. */
export async function expireFeaturedListings(): Promise<number> {
  const { data, error } = await supabase.rpc('expire_featured_listings');
  if (error) throw error;
  return Number(data ?? 0);
}

/** True only while the feature is actually running — the same test the strip
 *  applies, so this screen can never disagree with what a user sees. */
export function featureIsLive(l: FeaturedListing, now = Date.now()): boolean {
  if (!l.is_featured) return false;
  if (l.featured_until && new Date(l.featured_until).getTime() <= now) return false;
  return true;
}

// ── platform switches ──────────────────────────────────────────────────────

export interface PlatformSetting {
  key: string;
  value: unknown;
  description: string | null;
}

export async function fetchPlatformSettings(): Promise<AdminFetch<PlatformSetting>> {
  const q = supabase.from('platform_settings').select('key, value, description').order('key');
  return adminSafe<PlatformSetting>(() => q as unknown as Promise<{ data: unknown; error: unknown }>);
}

export async function setPlatformSetting(
  actorId: string, actorRole: AdminRole, key: string, value: unknown,
): Promise<void> {
  const { error } = await supabase
    .from('platform_settings')
    .update({ value, updated_at: new Date().toISOString(), updated_by: actorId })
    .eq('key', key);
  if (error) throw error;
  await logAction(actorId, actorRole, 'platform_setting', 'setting', key, { value });
}

/** platform_settings.value is jsonb, so a boolean arrives as true or "true". */
export function settingIsOn(s: PlatformSetting | undefined): boolean {
  if (!s) return false;
  return s.value === true || s.value === 'true';
}


// ═══════════════════════════════════════════════════════════════════════════
// FIX482 — PHARMACY ROTA helpers
//
// The public page (FIX480) reads through SECURITY DEFINER functions granted to
// anon, because a person looking for medicine at 2am must not meet a login.
// These write, so they go through the tables directly and lean on the RLS
// policy from FIX479: staff, or the pharmacy that owns the row.
// ═══════════════════════════════════════════════════════════════════════════

export interface Pharmacy {
  id: string;
  name: string;
  town: string;
  quarter: string | null;
  address: string | null;
  phone: string | null;
  whatsapp: string | null;
  notes: string | null;
  is_active: boolean;
  owner_id: string | null;
  created_at: string;
}

export interface OnCallWindow {
  id: string;
  pharmacy_id: string;
  starts_at: string;
  ends_at: string;
  note: string | null;
  created_at: string;
}

export type PharmacyDraft = Omit<Pharmacy, 'id' | 'owner_id' | 'created_at'>;

const PHARM_COLUMNS =
  'id, name, town, quarter, address, phone, whatsapp, notes, is_active, owner_id, created_at';

export async function fetchPharmacies(query = ''): Promise<AdminFetch<Pharmacy>> {
  let q = supabase.from('pharmacies').select(PHARM_COLUMNS).order('town').order('name').limit(300);
  if (query.trim()) {
    q = q.or(`name.ilike.%${query}%,town.ilike.%${query}%,quarter.ilike.%${query}%`);
  }
  return adminSafe<Pharmacy>(() => q as unknown as Promise<{ data: unknown; error: unknown }>);
}

export async function createPharmacy(
  actorId: string, actorRole: AdminRole, draft: PharmacyDraft,
): Promise<string> {
  const { data, error } = await supabase
    .from('pharmacies')
    .insert({ ...draft, created_by: actorId })
    .select('id')
    .single();
  if (error) throw error;
  await logAction(actorId, actorRole, 'create_pharmacy', 'pharmacy', data.id, { name: draft.name, town: draft.town });
  return data.id as string;
}

export async function updatePharmacy(
  actorId: string, actorRole: AdminRole, id: string, patch: Partial<PharmacyDraft>,
): Promise<void> {
  const { error } = await supabase
    .from('pharmacies')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
  await logAction(actorId, actorRole, 'update_pharmacy', 'pharmacy', id, patch as Record<string, unknown>);
}

/** Every window for one pharmacy, newest first. */
export async function fetchOnCallWindows(pharmacyId: string): Promise<AdminFetch<OnCallWindow>> {
  const q = supabase
    .from('pharmacy_on_call')
    .select('id, pharmacy_id, starts_at, ends_at, note, created_at')
    .eq('pharmacy_id', pharmacyId)
    .order('starts_at', { ascending: false })
    .limit(50);
  return adminSafe<OnCallWindow>(() => q as unknown as Promise<{ data: unknown; error: unknown }>);
}

export async function addOnCallWindow(
  actorId: string, actorRole: AdminRole,
  pharmacyId: string, startsAt: string, endsAt: string, note: string | null,
): Promise<void> {
  // The database also enforces ends_at > starts_at, but catching it here gives
  // the person a sentence instead of a constraint name.
  if (new Date(endsAt) <= new Date(startsAt)) {
    throw new Error('The end time must be after the start time.');
  }
  const { error } = await supabase.from('pharmacy_on_call').insert({
    pharmacy_id: pharmacyId, starts_at: startsAt, ends_at: endsAt,
    note: note?.trim() || null, created_by: actorId,
  });
  if (error) throw error;
  await logAction(actorId, actorRole, 'add_on_call', 'pharmacy', pharmacyId, { startsAt, endsAt, note });
}

export async function deleteOnCallWindow(
  actorId: string, actorRole: AdminRole, windowId: string, pharmacyId: string,
): Promise<void> {
  const { error } = await supabase.from('pharmacy_on_call').delete().eq('id', windowId);
  if (error) throw error;
  await logAction(actorId, actorRole, 'remove_on_call', 'pharmacy', pharmacyId, { windowId });
}

export interface RotaStatusRow {
  town: string; pharmacies: number; on_call_now: number;
  covered_until: string | null; last_updated: string | null;
}

/** Per town: how many pharmacies, how many on call now, how far the rota runs.
 *  This is what tells you a town has gone uncovered before a user finds out. */
export async function fetchRotaStatus(): Promise<AdminFetch<RotaStatusRow>> {
  const q = supabase.rpc('pharmacy_rota_status', { p_town: null });
  return adminSafe<RotaStatusRow>(() => q as unknown as Promise<{ data: unknown; error: unknown }>);
}

/** True while the window covers this exact moment. */
export function windowIsLive(w: OnCallWindow, now = Date.now()): boolean {
  return new Date(w.starts_at).getTime() <= now && new Date(w.ends_at).getTime() > now;
}
