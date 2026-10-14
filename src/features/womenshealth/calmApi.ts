// BAMBEH_DEPLOY_TOKEN__CALM_API_FIX741_CLEAN
/**
 * src/features/womenshealth/calmApi.ts - FIX741 (new)
 *
 * CALM TOOLS - the only door between the Calm pages and the database (FIX737). Every call answers
 * { ok: true, ... } or { ok: false, reason } (whRpc, FIX717); nothing here throws.
 *
 *   everyone, no account: calmPage() - the tools in every language an admin PUBLISHED after the
 *     psychologist's check; calmState() - is the page open (for the card on Women's health).
 *     Nothing about the reader is kept.
 *   signed in: calmOpened() - adds one to today's count for that tool and language (never who).
 *   staff (Command Center > Women's health > Calm tools): the whole state; add a tool; save a
 *     draft (moderators and admins); publish or take off a language, how a tool works, show / hide,
 *     move, delete, bring back from the bin, and the page switch (admins and the super admin).
 *
 * SAVED ON THIS PHONE: the last published tools (public text only) are kept on the phone, so the
 * page still opens without data, with the date they were saved.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { whRpc } from './whApi';
import type { Res } from './whApi';
import { WH_LANGS } from './whText';
import type { WhLang } from './whText';
import { isCalmKind } from './calmText';
import type { CalmKind } from './calmText';

export interface CalmText {
  title: string;
  summary: string;
  steps: string[];
  note: string;
  reviewer_name?: string | null;
  reviewer_role?: string | null;
  reviewed_on?: string | null;
  /** staff preview only: this is the DRAFT; live = a checked version is published too */
  draft?: boolean;
  live?: boolean;
}

export interface CalmTool {
  slug: string;
  kind: CalmKind;
  breathe_in: number;
  breathe_out: number;
  /** staff preview only */
  hidden?: boolean;
  texts: Partial<Record<WhLang, CalmText>>;
}

export interface CalmPage {
  on: boolean;
  is_staff: boolean;
  signed_in: boolean;
  preview: boolean;
  tools: CalmTool[];
}

function str(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function cleanText(v: unknown): CalmText | null {
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  const steps = Array.isArray(o.steps) ? o.steps.filter((s): s is string => typeof s === 'string' && s.trim() !== '') : [];
  if (!str(o.title) || steps.length === 0) return null;
  return {
    title: str(o.title), summary: str(o.summary), steps, note: str(o.note),
    reviewer_name: typeof o.reviewer_name === 'string' ? o.reviewer_name : null,
    reviewer_role: typeof o.reviewer_role === 'string' ? o.reviewer_role : null,
    reviewed_on: typeof o.reviewed_on === 'string' ? o.reviewed_on : null,
    draft: o.draft === true ? true : undefined,
    live: o.draft === true ? o.live === true : undefined,
  };
}

/** Only well-formed tools, only the five languages, never a text without a title or steps. */
export function cleanTools(v: unknown): CalmTool[] {
  if (!Array.isArray(v)) return [];
  const out: CalmTool[] = [];
  for (const raw of v) {
    if (!raw || typeof raw !== 'object') continue;
    const o = raw as Record<string, unknown>;
    if (typeof o.slug !== 'string' || !/^[a-z][a-z0-9-]{1,39}$/.test(o.slug) || !isCalmKind(o.kind)) continue;
    const texts: Partial<Record<WhLang, CalmText>> = {};
    const src = o.texts && typeof o.texts === 'object' ? (o.texts as Record<string, unknown>) : {};
    for (const l of WH_LANGS) {
      const t = cleanText(src[l]);
      if (t) texts[l] = t;
    }
    if (Object.keys(texts).length === 0) continue;
    const bin = Number(o.breathe_in);
    const bout = Number(o.breathe_out);
    out.push({
      slug: o.slug, kind: o.kind,
      breathe_in: bin >= 2 && bin <= 8 ? Math.round(bin) : 4,
      breathe_out: bout >= 2 && bout <= 10 ? Math.round(bout) : 6,
      hidden: o.hidden === true ? true : undefined,
      texts,
    });
  }
  return out;
}

// ------------------------------------------------------------------ everyone, no account
/** The published tools (staff: also while switched off; with preview, the drafts). */
export async function calmPage(preview: boolean): Promise<Res<CalmPage>> {
  const r = await whRpc<CalmPage>('bambeh_calm_page', { p_preview: !!preview });
  if (!r.ok) return r;
  return { ok: true, on: r.on === true, is_staff: r.is_staff === true, signed_in: r.signed_in === true, preview: r.preview === true,
           tools: cleanTools(r.tools) };
}

/** Is the Calm tools page open to the public? (the card on the Women's health page) */
export async function calmState(): Promise<Res<{ on: boolean; is_staff: boolean }>> {
  const r = await whRpc<{ on: boolean; is_staff: boolean }>('bambeh_calm_state');
  if (!r.ok) return r;
  return { ok: true, on: r.on === true, is_staff: r.is_staff === true };
}

// ------------------------------------------------------------------ signed in
/** One tool was opened: today's count for this tool and language goes up by one. Never who. */
export function calmOpened(slug: string, lang: WhLang): Promise<Res<{ counted: boolean }>> {
  return whRpc('bambeh_calm_opened', { p_slug: slug, p_lang: lang });
}

// ------------------------------------------------------------------ saved on this phone
const SAVE_KEY = 'bambeh_calm_saved';

interface SavedCalm { at: string; tools: CalmTool[] }

/** Keep what the PUBLIC sees (an open page, not a staff preview) for days without data. */
export function saveCalm(p: CalmPage): void {
  if (!p.on || p.preview) return;
  const tools = p.tools.map((t) => ({ slug: t.slug, kind: t.kind, breathe_in: t.breathe_in, breathe_out: t.breathe_out, texts: t.texts }));
  const v: SavedCalm = { at: new Date().toISOString(), tools };
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(v));
  } catch {
    // the phone is full or storage is blocked: not kept - fine
  }
}

export function loadCalm(): { at: string; tools: CalmTool[] } | null {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as Record<string, unknown>;
    const tools = cleanTools(v && v.tools);
    if (typeof v.at !== 'string' || tools.length === 0) return null;
    return { at: v.at, tools };
  } catch {
    return null;
  }
}

/** The page was open the last time this phone had a connection (the card can show without data). */
export function hasSavedCalm(): boolean {
  return loadCalm() !== null;
}

// ------------------------------------------------------------------ staff (Command Center)
export interface CalmDraft { title: string; summary: string; steps: string[]; note: string; at: string; by_name: string | null }
export interface CalmLive {
  title: string; summary: string; steps: string[]; note: string;
  reviewer_name: string; reviewer_role: string; reviewed_on: string; at: string; by_name: string | null;
}
export interface CalmStaffText { lang: WhLang; draft: CalmDraft; live: CalmLive | null; changed: boolean }
export interface CalmStaffTool {
  id: string;
  slug: string;
  kind: CalmKind;
  sort_order: number;
  active: boolean;
  breathe_in: number;
  breathe_out: number;
  created_at: string;
  created_by_name: string | null;
  updated_at: string;
  updated_by_name: string | null;
  opened_30_days: number;
  texts: Partial<Record<WhLang, CalmStaffText>>;
}
export interface CalmBinItem { id: string; slug: string; kind: string; title: string; deleted_at: string; deleted_by_name: string | null }
export interface CalmHistory { at: string; by: string | null; action: string; note: string | null }
export interface CalmAdmin {
  rank: number;
  can_publish: boolean;
  on: boolean;
  ready: boolean;
  switched_at: string | null;
  switched_by_name: string | null;
  tools: CalmStaffTool[];
  bin: CalmBinItem[];
  history: CalmHistory[];
}

export async function adminCalmState(): Promise<Res<CalmAdmin>> {
  const r = await whRpc<CalmAdmin>('bambeh_admin_calm_state');
  if (!r.ok) return r;
  return {
    ...r,
    on: r.on === true,
    ready: r.ready === true,
    can_publish: r.can_publish === true,
    tools: Array.isArray(r.tools) ? r.tools.map((t) => ({ ...t, texts: t.texts && typeof t.texts === 'object' ? t.texts : {} })) : [],
    bin: Array.isArray(r.bin) ? r.bin : [],
    history: Array.isArray(r.history) ? r.history : [],
  };
}

/** A new tool: its kind, the language of the first draft, and its title. Not shown until published. */
export function adminCalmNew(kind: Exclude<CalmKind, 'help'>, lang: WhLang, title: string): Promise<Res<{ id: string; slug: string }>> {
  return whRpc('bambeh_admin_calm_new', { p_kind: kind, p_lang: lang, p_title: title });
}

/** Save the draft of one language. seenAt = the draft this person started from (null when the language had none). */
export function adminCalmDraft(id: string, lang: WhLang, d: { title: string; summary: string; steps: string[]; note: string },
                               seenAt: string | null): Promise<Res<{ text: CalmStaffText }>> {
  return whRpc('bambeh_admin_calm_draft', { p_id: id, p_lang: lang, p_title: d.title, p_summary: d.summary, p_steps: d.steps,
                                            p_note: d.note, p_seen_at: seenAt });
}

/** Publish one language (admins): the draft the admin read (seenAt), checked by this psychologist on this date. */
export function adminCalmPublish(id: string, lang: WhLang, reviewer: { name: string; role: string; date: string },
                                 seenAt: string): Promise<Res<{ text: CalmStaffText }>> {
  return whRpc('bambeh_admin_calm_publish', { p_id: id, p_lang: lang, p_reviewer_name: reviewer.name, p_reviewer_role: reviewer.role,
                                              p_reviewed_on: reviewer.date, p_seen_at: seenAt });
}

/** Take one language off the app (admins); forgetDraft also removes its draft. */
export function adminCalmUnpublish(id: string, lang: WhLang, forgetDraft: boolean): Promise<Res<Record<string, never>>> {
  return whRpc('bambeh_admin_calm_unpublish', { p_id: id, p_lang: lang, p_forget_draft: forgetDraft });
}

/** How a tool works on the phone (admins). */
export function adminCalmSettings(id: string, kind: CalmKind, breatheIn: number, breatheOut: number): Promise<Res<Record<string, never>>> {
  return whRpc('bambeh_admin_calm_settings', { p_id: id, p_kind: kind, p_breathe_in: breatheIn, p_breathe_out: breatheOut });
}

export function adminCalmShow(id: string, on: boolean): Promise<Res<{ active: boolean }>> {
  return whRpc('bambeh_admin_calm_show', { p_id: id, p_on: on });
}

export function adminCalmMove(id: string, dir: -1 | 1): Promise<Res<{ moved: boolean }>> {
  return whRpc('bambeh_admin_calm_move', { p_id: id, p_dir: dir });
}

/** Delete (admins): the tool waits 90 days in the bin. */
export function adminCalmDelete(id: string): Promise<Res<Record<string, never>>> {
  return whRpc('bambeh_admin_calm_delete', { p_id: id });
}

/** Bring a tool back from the bin (admins). It comes back hidden. */
export function adminCalmRestore(binId: string): Promise<Res<{ id: string; slug: string }>> {
  return whRpc('bambeh_admin_calm_restore', { p_bin_id: binId });
}

/** The switch for the whole page (admins). */
export function adminCalmSwitch(on: boolean): Promise<Res<{ on: boolean; switched_by_name: string }>> {
  return whRpc('bambeh_admin_calm_switch', { p_on: on });
}
// BAMBEH_END_TOKEN__CALM_API_FIX741__COMPLETE
