// BAMBEH_DEPLOY_TOKEN__WOMENS_HEALTH_API_FIX717_CLEAN
/**
 * src/features/womenshealth/whApi.ts - FIX717 (replaces FIX707, which was never deployed)
 *
 * WOMEN'S HEALTH - the only door between the pages and the database (FIX715).
 * Every call answers { ok: true, ... } or { ok: false, reason }, and the pages turn
 * the reason into a sentence in the user's language (whReason in whText).
 *
 * FIX717 (Big, 11 Oct 2026 evening - free services need a Bambeh account):
 *   - everyone, no account: the guide switch only (bambeh_wh_guide - the pregnancy guide and
 *     the emergency numbers stay readable without an account; nothing about the reader is kept)
 *   - signed in: places, one place, screening days, one day, add / correct a place or a day,
 *     take it down or put it back, "my places and days", "remind me", report a problem, and
 *     "a health quiz was finished" (quizDone - only the day, the topic and the language are
 *     counted, never the person or the answers)
 *   - staff (Command Center > Women's health): the queue, approve / reject / hide / checked,
 *     the pregnancy guide switch and the health quiz switch (admins only, with the name of the
 *     health worker who checked them and the languages), and 30 days of quiz counts
 *   - a signed-out phone that reaches a members-only call (an expired session) gets
 *     reason "not_signed_in", so the page can offer the account card instead of an error
 *
 * No medicine is sold and no health data about the woman is stored: the database keeps
 * places, screening days, who asked for a reminder, reports about wrong information and
 * the daily quiz counts.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { supabase } from '@/lib/supabase';
import type { QuizTopic, WhAddedAs, WhKind, WhLang, WhRegion, WhReportReason, WhService, WhTopic } from './whText';

export type WhStatus = 'pending' | 'live' | 'rejected' | 'hidden';

export interface WhPlace {
  id: string;
  name: string;
  kind: WhKind;
  services: WhService[];
  region: WhRegion;
  town: string;
  area: string;
  landmark: string;
  /** shown only once Bambeh staff have called it */
  phone: string | null;
  /** a number is saved but not checked yet */
  phone_checking: boolean;
  open_24h: boolean;
  open_days: number[];
  opens_at: string | null;
  closes_at: string | null;
  accepts_csu: boolean;
  women_doctors: boolean;
  price_note: string;
  description: string;
  updated_at: string;
  // the page of one place
  days?: WhDay[];
  status?: WhStatus;
  // only for the person who added it, and staff
  phone_saved?: string | null;
  hidden_by?: 'owner' | 'staff' | null;
  needs_review?: boolean;
  review_note?: string | null;
  reviewed_at?: string | null;
  reviewed_by_name?: string | null;
  added_as?: WhAddedAs;
  approved_at?: string | null;
  reports?: number;
  created_at?: string;
}

export interface WhDay {
  id: string;
  title: string;
  topics: WhTopic[];
  organiser: string;
  region: WhRegion;
  town: string;
  venue: string;
  landmark: string;
  starts_on: string;
  ends_on: string;
  opens_at: string | null;
  closes_at: string | null;
  free_what: string;
  paid_after: string;
  phone: string | null;
  phone_checking: boolean;
  place_id: string | null;
  place_name: string | null;
  reminded?: boolean;
  status?: WhStatus;
  ended?: boolean;
  phone_saved?: string | null;
  hidden_by?: 'owner' | 'staff' | null;
  needs_review?: boolean;
  review_note?: string | null;
  reviewed_at?: string | null;
  reviewed_by_name?: string | null;
  approved_at?: string | null;
  reminders?: number;
  created_at?: string;
}

export interface WhMe {
  signed_in: boolean;
  is_mine: boolean;
  is_staff: boolean;
  can_edit: boolean;
  can_report: boolean;
  reminded?: boolean;
}

export interface WhTownCount { town: string; region: WhRegion; n: number }

export interface WhGuide {
  on: boolean;
  langs: WhLang[];
  reviewer_name?: string;
  reviewer_role?: string;
  reviewed_on?: string | null;
  /** the health quizzes (FIX715): switched on, in which languages, and who checked them */
  quiz_on: boolean;
  quiz_langs: WhLang[];
  quiz_reviewer_name?: string;
  quiz_reviewer_role?: string;
  quiz_reviewed_on?: string | null;
  signed_in: boolean;
  is_staff: boolean;
}

export interface WhPlaceInput {
  name: string;
  kind: WhKind;
  services: WhService[];
  region: WhRegion;
  town: string;
  area: string;
  landmark: string;
  phone: string;
  open_24h: boolean;
  open_days: number[];
  opens_at: string;
  closes_at: string;
  accepts_csu: boolean;
  women_doctors: boolean;
  price_note: string;
  description: string;
  added_as: WhAddedAs;
}

export interface WhDayInput {
  title: string;
  topics: WhTopic[];
  organiser: string;
  region: WhRegion;
  town: string;
  venue: string;
  landmark: string;
  starts_on: string;
  ends_on: string;
  opens_at: string;
  closes_at: string;
  free_what: string;
  paid_after: string;
  phone: string;
  place_id: string | null;
}

export interface Fail { ok: false; reason: string; detail?: string }
export type Res<T> = ({ ok: true } & T) | Fail;

/** One database function; never throws. */
export async function whRpc<T>(fn: string, args?: Record<string, unknown>): Promise<Res<T>> {
  try {
    const { data, error } = await supabase.rpc(fn, args ?? {});
    if (error) {
      const msg = String(error.message || '');
      if (/failed to fetch|networkerror|network request failed|load failed/i.test(msg)) return { ok: false, reason: 'network', detail: msg };
      if (/permission denied|jwt expired|not authenticated/i.test(msg)) return { ok: false, reason: 'not_signed_in', detail: msg };
      if (/does not exist|could not find the function/i.test(msg)) return { ok: false, reason: 'not_installed', detail: msg };
      return { ok: false, reason: 'generic', detail: msg };
    }
    const d = data as ({ ok?: unknown; reason?: unknown; detail?: unknown } & Record<string, unknown>) | null;
    if (!d || typeof d !== 'object') return { ok: false, reason: 'generic' };
    if (d.ok !== true) {
      return { ok: false, reason: String(d.reason || 'generic'), detail: typeof d.detail === 'string' ? d.detail : undefined };
    }
    return d as unknown as Res<T>;
  } catch (e) {
    return { ok: false, reason: 'network', detail: e instanceof Error ? e.message : String(e) };
  }
}

// ------------------------------------------------------------------ signed in (FIX715: a Bambeh account is needed)
export interface PlacesResult { total: number; rows: WhPlace[]; towns: WhTownCount[]; services: Partial<Record<WhService, number>> }

export function listPlaces(p: {
  region?: string | null; town?: string | null; service?: string | null; csu?: boolean; open24?: boolean;
  womenDoctors?: boolean; query?: string | null; limit?: number; offset?: number;
}): Promise<Res<PlacesResult>> {
  return whRpc('bambeh_wh_places', {
    p_region: p.region || null,
    p_town: p.town && p.town.trim() ? p.town.trim().slice(0, 60) : null,
    p_service: p.service || null,
    p_csu: !!p.csu,
    p_open24: !!p.open24,
    p_women_doctors: !!p.womenDoctors,
    p_query: p.query && p.query.trim() ? p.query.trim().slice(0, 60) : null,
    p_limit: p.limit ?? 30,
    p_offset: p.offset ?? 0,
  });
}

export function getPlace(id: string): Promise<Res<{ place: WhPlace; me: WhMe }>> {
  return whRpc('bambeh_wh_place', { p_id: id });
}

export interface DaysResult { total: number; rows: WhDay[]; towns: WhTownCount[]; today: string }

export function listDays(p: { region?: string | null; town?: string | null; topic?: string | null; limit?: number; offset?: number }): Promise<Res<DaysResult>> {
  return whRpc('bambeh_wh_days', {
    p_region: p.region || null,
    p_town: p.town && p.town.trim() ? p.town.trim().slice(0, 60) : null,
    p_topic: p.topic || null,
    p_limit: p.limit ?? 30,
    p_offset: p.offset ?? 0,
  });
}

export function getDay(id: string): Promise<Res<{ day: WhDay; me: WhMe }>> {
  return whRpc('bambeh_wh_day', { p_id: id });
}

// ------------------------------------------------------------------ everyone, no account
/** The pregnancy guide and quiz switches. Open to everyone; nothing about the reader is kept. */
export async function getGuide(): Promise<Res<WhGuide>> {
  const r = await whRpc<WhGuide>('bambeh_wh_guide');
  if (!r.ok) return r;
  return {
    ...r,
    on: r.on === true,
    langs: Array.isArray(r.langs) ? r.langs : [],
    quiz_on: r.quiz_on === true,
    quiz_langs: Array.isArray(r.quiz_langs) ? r.quiz_langs : [],
    signed_in: r.signed_in === true,
    is_staff: r.is_staff === true,
  };
}

// ------------------------------------------------------------------ signed in
export function savePlace(id: string | null, data: WhPlaceInput): Promise<Res<{ id: string; status: WhStatus; needs_review: boolean; phone_checking?: boolean }>> {
  return whRpc('bambeh_wh_save_place', { p_id: id, p_data: data });
}

export function saveDay(id: string | null, data: WhDayInput): Promise<Res<{ id: string; status: WhStatus; needs_review: boolean; phone_checking?: boolean }>> {
  return whRpc('bambeh_wh_save_day', { p_id: id, p_data: data });
}

export function setVisible(kind: 'place' | 'day', id: string, visible: boolean): Promise<Res<{ status: WhStatus }>> {
  return whRpc('bambeh_wh_set_visible', { p_kind: kind, p_id: id, p_visible: visible });
}

export function myItems(): Promise<Res<{ places: WhPlace[]; days: WhDay[] }>> {
  return whRpc('bambeh_wh_mine');
}

export function remind(dayId: string, on: boolean): Promise<Res<{ reminded: boolean; starts_on?: string }>> {
  return whRpc('bambeh_wh_remind', { p_day: dayId, p_on: on });
}

export function report(kind: 'place' | 'day', id: string, reason: WhReportReason, note: string): Promise<Res<{ already?: boolean }>> {
  return whRpc('bambeh_wh_report', { p_kind: kind, p_id: id, p_reason: reason, p_note: note.trim().slice(0, 300) });
}

/** A health quiz was finished: the database adds one to today's count for this topic and language
 *  (and to "all right" when every answer was right). Nothing else leaves the phone. counted = false
 *  while the quiz is switched off for that language (a staff preview). */
export function quizDone(topic: QuizTopic, lang: WhLang, score: number, total: number): Promise<Res<{ counted: boolean }>> {
  return whRpc('bambeh_wh_quiz_done', { p_topic: topic, p_lang: lang, p_score: Math.max(0, Math.round(score)), p_total: Math.max(1, Math.round(total)) });
}

// ------------------------------------------------------------------ staff (Command Center)
export type WhQueueView = 'pending' | 'changed' | 'live' | 'closed';

export interface WhHistory { action: string; note: string | null; at: string; by: string }
export interface WhOpenReport { reason: WhReportReason; note: string; at: string; by: string }
export interface WhStaffExtra {
  status: WhStatus;
  hidden_by: 'owner' | 'staff' | null;
  needs_review: boolean;
  review_note: string | null;
  phone_saved: string | null;
  phone_checked_at: string | null;
  phone_checked_by_name?: string | null;
  reviewed_at: string | null;
  reviewed_by_name: string | null;
  approved_at: string | null;
  added_by_name: string;
  created_at: string;
  updated_at: string;
  open_reports: WhOpenReport[];
  history: WhHistory[];
}
export type WhStaffPlace = WhPlace & WhStaffExtra & { added_as: WhAddedAs };
export type WhStaffDay = WhDay & WhStaffExtra & { ended: boolean; reminders: number };

export interface WhCounts { pending: number; changed: number; live: number; closed: number }
export interface WhStaffGuide {
  on: boolean;
  langs: WhLang[];
  reviewer_name: string;
  reviewer_role: string;
  reviewed_on: string | null;
  switched_at: string | null;
  switched_by_name: string | null;
  quiz_on: boolean;
  quiz_langs: WhLang[];
  quiz_reviewer_name: string;
  quiz_reviewer_role: string;
  quiz_reviewed_on: string | null;
  quiz_switched_at: string | null;
  quiz_switched_by_name: string | null;
}

/** Health quizzes finished over the last 30 days, per topic (never per person). */
export interface WhQuizCount { topic: QuizTopic; done: number; perfect: number }

export interface WhQueue {
  rank: number;
  can_switch_guide: boolean;
  kind: 'place' | 'day';
  view: WhQueueView;
  counts: { place: WhCounts; day: WhCounts };
  rows: Array<WhStaffPlace | WhStaffDay>;
  guide: WhStaffGuide | null;
  quiz_30_days: WhQuizCount[];
}

export async function adminQueue(kind: 'place' | 'day', view: WhQueueView): Promise<Res<WhQueue>> {
  const r = await whRpc<WhQueue>('bambeh_admin_wh_queue', { p_kind: kind, p_view: view, p_limit: 150 });
  if (!r.ok) return r;
  const g = r.guide;
  return {
    ...r,
    rows: Array.isArray(r.rows) ? r.rows : [],
    quiz_30_days: Array.isArray(r.quiz_30_days) ? r.quiz_30_days : [],
    guide: g ? { ...g, langs: Array.isArray(g.langs) ? g.langs : [], quiz_on: g.quiz_on === true,
                 quiz_langs: Array.isArray(g.quiz_langs) ? g.quiz_langs : [] } : null,
  };
}

export function adminReview(kind: 'place' | 'day', id: string, action: 'approve' | 'reject' | 'hide' | 'checked', note: string | null):
    Promise<Res<{ action: string; status: WhStatus; reviewed_by_name: string; reviewed_at: string }>> {
  return whRpc('bambeh_admin_wh_review', { p_kind: kind, p_id: id, p_action: action, p_note: note });
}

export function adminGuide(on: boolean, reviewer?: { name: string; role: string; date: string; langs: WhLang[] }):
    Promise<Res<WhGuide & { switched_by_name: string }>> {
  return whRpc('bambeh_admin_wh_guide', on && reviewer
    ? { p_on: true, p_reviewer_name: reviewer.name, p_reviewer_role: reviewer.role, p_reviewed_on: reviewer.date, p_langs: reviewer.langs }
    : { p_on: false });
}

/** The health quiz switch (admins only): on with the health worker's name, role, the date of the check and
 *  the languages checked - or off for everyone. */
export function adminQuiz(on: boolean, reviewer?: { name: string; role: string; date: string; langs: WhLang[] }):
    Promise<Res<WhGuide & { switched_by_name: string }>> {
  return whRpc('bambeh_admin_wh_quiz', on && reviewer
    ? { p_on: true, p_reviewer_name: reviewer.name, p_reviewer_role: reviewer.role, p_reviewed_on: reviewer.date, p_langs: reviewer.langs }
    : { p_on: false });
}
// BAMBEH_END_TOKEN__WOMENS_HEALTH_API_FIX717__COMPLETE
