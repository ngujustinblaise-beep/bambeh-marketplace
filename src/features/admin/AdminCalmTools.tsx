// BAMBEH_DEPLOY_TOKEN__ADMIN_CALM_TOOLS_FIX743_CLEAN
/**
 * AdminCalmTools.tsx - FIX743 (new) - Command Center > Women's health > Calm tools
 *
 * Big, 14 Oct 2026: "how to add or edit or delete the calm tools from the admin center". The Calm
 * tools page (/calm, FIX742) shows only what staff publish here; the database is FIX737.
 *
 *   ADD a tool - choose how it works (breathing circle, step by step, list of tips), the language of
 *     the first draft and a title. It is not shown to anyone until an admin publishes it.
 *   EDIT - language by language (English, French, Pidgin, Arabic, Fulfulde): title, the line on its
 *     card, the steps (one per line) and a closing note. "Save draft" keeps it for staff only.
 *     Moderators and admins write drafts.
 *   PUBLISH (admins and the super admin) - only a SAVED draft, only after the psychologist read that
 *     exact text in that language: their full name, role and workplace, and the date of the check.
 *     The public sees "Checked by ..." under the tool. Changing a published text changes the draft
 *     only: the public keeps the checked version until the new one is published.
 *   TAKE A LANGUAGE OFF, HIDE / SHOW, MOVE UP / DOWN, HOW IT WORKS (breathing timing), DELETE (to the
 *     bin for 90 days), BRING BACK from the bin - admins and the super admin.
 *   THE SWITCH for the whole page (admins): it opens only when "When to get help" and one other tool
 *     are published. "When to get help" can be edited and published, never hidden, moved or deleted.
 *   Every action keeps the staff member's name and the time (History).
 *
 * The same checks as the database: no phone number (the emergency codes 117, 113, 119, 118, 1511 and
 * 116 are fine), no WhatsApp or web link, no e-mail address. English, like the rest of the Command Center.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowDown, ArrowUp, Eye, EyeOff, History, Leaf, Loader2, Pencil, Plus, Power, RefreshCw, Save, Send, Trash2, Undo2, X,
} from 'lucide-react';
import {
  adminCalmDelete, adminCalmDraft, adminCalmMove, adminCalmNew, adminCalmPublish, adminCalmRestore, adminCalmSettings, adminCalmShow,
  adminCalmState, adminCalmSwitch, adminCalmUnpublish,
} from '@/features/womenshealth/calmApi';
import type { CalmAdmin, CalmStaffText, CalmStaffTool } from '@/features/womenshealth/calmApi';
import { calmContactProblem } from '@/features/womenshealth/calmText';
import type { CalmKind } from '@/features/womenshealth/calmText';
import { LANG_NAMES, WH_LANGS, doualaNow } from '@/features/womenshealth/whText';
import type { WhLang } from '@/features/womenshealth/whText';

const REASONS: Record<string, string> = {
  not_staff: 'Staff only.',
  admins_only: 'Only an admin or the super admin can do this.',
  not_found: 'Not found - someone may have changed or deleted it. Press Refresh.',
  bad_kind: 'Choose how the tool works: breathing circle, step by step, or list of tips.',
  bad_lang: 'Choose a language.',
  bad_title: 'The title must be 3 to 60 letters.',
  bad_summary: 'The line on the card is 160 letters at most.',
  bad_steps: 'Write 1 to 12 steps, one per line, each 2 to 400 letters.',
  bad_note: 'The closing note is 600 letters at most.',
  phone_in_text: 'No phone numbers (the emergency codes 117, 113, 119, 118, 1511 and 116 are fine) and no WhatsApp or Telegram links.',
  link_in_text: 'No web links and no e-mail addresses - contact stays inside Bambeh.',
  draft_changed: 'Someone saved this language since you opened it. Copy your text somewhere, press Refresh, and look again.',
  no_draft: 'There is no draft in this language yet.',
  reviewer_required: 'Write the psychologist\'s full name (3-80 letters) and their role and workplace (3-120 letters).',
  bad_date: 'The date of the check must be today or earlier, within the last year.',
  help_fixed: '"When to get help" is always shown and always first: it cannot be hidden, moved, deleted or changed into another kind.',
  help_last: 'This is the last published language of "When to get help". Switch Calm tools off first.',
  help_not_live: 'Publish "When to get help" in at least one language first.',
  nothing_live: 'Publish at least one other tool (and leave it shown) first.',
  bad_timing: 'Breathe in: 2 to 8 seconds. Breathe out: 2 to 10 seconds.',
  too_many: 'There are already 30 tools. Delete one first.',
  network: 'No connection. Try again.',
  not_installed: 'The FIX737 SQL has not been run in Supabase yet.',
  not_signed_in: 'Your session has ended - sign in again.',
};

function reasonOf(r: string): string {
  return REASONS[r] || 'Something went wrong (' + r + ').';
}

/** Cameroon time, "2026-10-14 09:30". */
function when(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return new Date(d.getTime() + 3600 * 1000).toISOString().slice(0, 16).replace('T', ' ');
}

const KIND_LABEL: Record<CalmKind, string> = {
  help: 'When to get help (fixed)',
  breathe: 'Breathing circle',
  steps: 'Step by step',
  list: 'List of tips',
};

const ACTIONS: Record<string, string> = {
  calm_new: 'added a tool', calm_draft: 'saved a draft', calm_publish: 'published', calm_unpublish: 'took a language off the app',
  calm_forget: 'deleted a language draft', calm_settings: 'changed how a tool works', calm_show: 'showed', calm_hide: 'hid',
  calm_move: 'moved', calm_delete: 'deleted', calm_restore: 'brought back from the bin', calm_on: 'switched Calm tools ON',
  calm_off: 'switched Calm tools OFF',
};

/** The name staff know a tool by: its English draft title, else the first language that has one. */
export function toolName(t: CalmStaffTool): string {
  const en = t.texts.en;
  if (en && en.draft.title) return en.draft.title;
  for (const l of WH_LANGS) {
    const x = t.texts[l];
    if (x && x.draft.title) return x.draft.title;
  }
  return t.slug;
}

type LangState = 'live' | 'changed' | 'draft' | 'none';
export function langState(x: CalmStaffText | undefined): LangState {
  if (!x) return 'none';
  if (x.live) return x.changed ? 'changed' : 'live';
  return 'draft';
}

const STATE_CHIP: Record<LangState, string> = {
  live: 'bg-green-100 text-green-800',
  changed: 'bg-amber-100 text-amber-900',
  draft: 'bg-gray-200 text-gray-700',
  none: 'bg-white text-gray-400 ring-1 ring-gray-200',
};
const STATE_WORD: Record<LangState, string> = { live: 'live', changed: 'live, new draft waiting', draft: 'draft only', none: 'nothing yet' };

const SHORT: Record<WhLang, string> = { en: 'EN', fr: 'FR', pidgin: 'PI', ar: 'AR', ff: 'FF' };

function LangChips({ tool }: { tool: CalmStaffTool }) {
  return (
    <div className="flex flex-wrap gap-1">
      {WH_LANGS.map((l) => {
        const st = langState(tool.texts[l]);
        return (
          <span key={l} title={LANG_NAMES[l] + ': ' + STATE_WORD[st]} data-lang-state={l + ':' + st}
                className={'rounded-full px-2 py-0.5 text-[11px] font-bold ' + STATE_CHIP[st]}>
            {SHORT[l]} {st === 'live' ? 'live' : st === 'changed' ? 'live*' : st === 'draft' ? 'draft' : '-'}
          </span>
        );
      })}
    </div>
  );
}

export interface Reviewer { name: string; role: string; date: string }

interface Act {
  busy: boolean;
  run: (label: string, fn: () => Promise<{ ok: boolean; reason?: string }>, done?: string) => Promise<boolean>;
}

/** One language of one tool: the draft form, and (admins) publish / take off / delete the draft. */
function LangEditor({ tool, lang, canPublish, reviewer, setReviewer, act }: {
  tool: CalmStaffTool; lang: WhLang; canPublish: boolean; reviewer: Reviewer; setReviewer: (r: Reviewer) => void; act: Act;
}) {
  const navigate = useNavigate();
  const x = tool.texts[lang];
  const d = x ? x.draft : null;
  const [title, setTitle] = useState(d ? d.title : '');
  const [summary, setSummary] = useState(d ? d.summary : '');
  const [steps, setSteps] = useState(d ? d.steps.join('\n') : '');
  const [note, setNote] = useState(d ? d.note : '');
  const [readIt, setReadIt] = useState(false);
  const rtl = lang === 'ar';
  const lines = steps.split('\n').map((s) => s.replace(/\s+/g, ' ').trim()).filter((s) => s !== '');
  const dirty = !d || title !== d.title || summary !== d.summary || note !== d.note || lines.join('\n') !== d.steps.join('\n');
  const problem = calmContactProblem(title) || calmContactProblem(summary) || calmContactProblem(note) ||
    lines.map((s) => calmContactProblem(s)).find((p) => !!p) || null;
  const live = x ? x.live : null;
  const name = LANG_NAMES[lang];

  const save = () => act.run('save ' + lang, () => adminCalmDraft(tool.id, lang, { title, summary, steps: lines, note }, d ? d.at : null),
                             name + ' draft saved. Only staff can see it.');
  const publish = async () => {
    if (!d) return;
    if (!readIt) { window.alert('Tick the box: the psychologist read this exact text in ' + name + '.'); return; }
    if (!window.confirm('Publish "' + d.title + '" in ' + name + '?\n\nPeople will see it at once, with "Checked by ' + reviewer.name.trim() + ' (' +
        reviewer.role.trim() + ')". Do this only if this person read this exact text. Your name and the time are recorded.')) return;
    const okd = await act.run('publish ' + lang, () => adminCalmPublish(tool.id, lang, { name: reviewer.name.trim(), role: reviewer.role.trim(), date: reviewer.date }, d.at),
                              '"' + d.title + '" is published in ' + name + '.');
    if (okd) setReadIt(false);
  };
  const takeOff = () => {
    if (!window.confirm('Take ' + name + ' off the app for "' + toolName(tool) + '"? The draft stays. Your name and the time are recorded.')) return;
    void act.run('off ' + lang, () => adminCalmUnpublish(tool.id, lang, false), name + ' is off the app. The draft is kept.');
  };
  const forget = () => {
    if (!window.confirm('Delete the ' + name + ' text of "' + toolName(tool) + '" completely (draft' + (live ? ' and published text' : '') +
        ')? This cannot be undone.')) return;
    void act.run('forget ' + lang, () => adminCalmUnpublish(tool.id, lang, true), 'The ' + name + ' text is deleted.');
  };

  const field = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm';
  return (
    <div className="space-y-3" data-lang-editor={lang}>
      <div className="rounded-lg bg-white px-3 py-2 text-xs text-gray-700" data-live-line={live ? (x && x.changed ? 'changed' : 'live') : 'none'}>
        {live ? (
          <p>
            <span className="font-bold text-green-700">Live in {name}</span> since {when(live.at)}: checked by {live.reviewer_name} ({live.reviewer_role}) on {live.reviewed_on},
            published by {live.by_name || '?'}.{x && x.changed ? <span className="font-bold text-amber-800"> The draft below is different from what people see.</span> : null}
          </p>
        ) : (
          <p><span className="font-bold text-gray-800">Not published in {name}.</span> People never see a draft.</p>
        )}
        {d && <p className="text-gray-500">Draft saved {when(d.at)}{d.by_name ? ' by ' + d.by_name : ' (starting text from Bambeh)'}.</p>}
      </div>
      <label className="block text-xs font-bold text-gray-700">
        Title (3-60 letters)
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={60} dir={rtl ? 'rtl' : 'ltr'} className={field + ' mt-1'} data-f="title" />
      </label>
      <label className="block text-xs font-bold text-gray-700">
        Line on the card (optional, 160 letters at most)
        <input value={summary} onChange={(e) => setSummary(e.target.value)} maxLength={160} dir={rtl ? 'rtl' : 'ltr'} className={field + ' mt-1'} data-f="summary" />
      </label>
      <label className="block text-xs font-bold text-gray-700">
        {tool.kind === 'list' || tool.kind === 'help' ? 'Points - one per line' : tool.kind === 'breathe' ? 'Instructions under the circle - one per line' : 'Steps - one per line'} (1-12 lines)
        <textarea value={steps} onChange={(e) => setSteps(e.target.value)} rows={8} dir={rtl ? 'rtl' : 'ltr'} className={field + ' mt-1'} data-f="steps" />
      </label>
      <p className="text-[11px] text-gray-500">{lines.length} line(s). Each new line becomes a separate step on the phone.</p>
      <label className="block text-xs font-bold text-gray-700">
        Closing note (optional, 600 letters at most)
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={600} dir={rtl ? 'rtl' : 'ltr'} className={field + ' mt-1'} data-f="note" />
      </label>
      {problem && <p className="text-sm font-semibold text-red-700" data-problem={problem}>{reasonOf(problem)}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" disabled={act.busy || !dirty || !!problem} onClick={() => void save()} data-save-draft={lang}
                className="inline-flex items-center gap-1 rounded-lg bg-gray-900 px-3 py-2 text-sm font-bold text-white disabled:opacity-40">
          <Save className="h-4 w-4" />Save draft
        </button>
        {!dirty && d && <span className="text-xs text-gray-500">Saved - nothing changed.</span>}
        <button type="button" onClick={() => navigate('/calm?tool=' + encodeURIComponent(tool.slug) + '&preview=1')}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700">
          <Eye className="h-4 w-4" />See the draft on the phone page
        </button>
      </div>

      {canPublish && d && (
        <div className="space-y-2 rounded-xl border border-teal-200 bg-white p-3" data-publish-box={lang}>
          <p className="text-sm font-bold text-gray-900">Publish {name}</p>
          {dirty ? (
            <p className="text-xs font-semibold text-amber-800">Save the draft first - only a saved draft can be published.</p>
          ) : (
            <>
              <p className="text-xs text-gray-600">Only after the psychologist read this exact text in {name}. Their name shows under the tool.</p>
              {live && x && !x.changed && (
                <p className="text-xs font-semibold text-gray-500" data-same-as-live="1">This draft is already what people see. Publish it again only to record a new check.</p>
              )}
              <div className="grid gap-2 sm:grid-cols-3">
                <input value={reviewer.name} onChange={(e) => setReviewer({ ...reviewer, name: e.target.value })} maxLength={80}
                       placeholder="Psychologist's full name" className={field} data-r="name" />
                <input value={reviewer.role} onChange={(e) => setReviewer({ ...reviewer, role: e.target.value })} maxLength={120}
                       placeholder="Role and workplace (e.g. Clinical psychologist, Jamot Hospital)" className={field} data-r="role" />
                <input type="date" value={reviewer.date} max={doualaNow().ymd} onChange={(e) => setReviewer({ ...reviewer, date: e.target.value })}
                       className={field} data-r="date" />
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-gray-800">
                <input type="checkbox" checked={readIt} onChange={(e) => setReadIt(e.target.checked)} data-r="read" />
                This person read this exact {name} text and agreed with it.
              </label>
              <div>
                <button type="button" disabled={act.busy} onClick={() => void publish()} data-publish={lang}
                        className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-40">
                  <Send className="h-4 w-4" />Publish {name}
                </button>
              </div>
            </>
          )}
        </div>
      )}
      {canPublish && (live || d) && (
        <div className="flex flex-wrap gap-2">
          {live && (
            <button type="button" disabled={act.busy} onClick={takeOff} data-take-off={lang}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-bold text-red-700 disabled:opacity-40">
              <EyeOff className="h-3.5 w-3.5" />Take {name} off the app
            </button>
          )}
          {d && tool.kind !== 'help' && (
            <button type="button" disabled={act.busy} onClick={forget} data-forget={lang}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 disabled:opacity-40">
              <Trash2 className="h-3.5 w-3.5" />Delete the {name} text
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/** One tool open for editing: how it works (admins), and its five languages. */
function ToolEditor({ tool, canPublish, reviewer, setReviewer, act, onClose }: {
  tool: CalmStaffTool; canPublish: boolean; reviewer: Reviewer; setReviewer: (r: Reviewer) => void; act: Act; onClose: () => void;
}) {
  const first = WH_LANGS.find((l) => !!tool.texts[l]) || 'en';
  const [lang, setLang] = useState<WhLang>(first);
  const [kind, setKind] = useState<CalmKind>(tool.kind);
  const [bin, setBin] = useState(tool.breathe_in);
  const [bout, setBout] = useState(tool.breathe_out);
  const help = tool.kind === 'help';
  const settingsDirty = kind !== tool.kind || bin !== tool.breathe_in || bout !== tool.breathe_out;
  const x = tool.texts[lang];

  return (
    <section className="space-y-3 rounded-xl border-2 border-teal-400 bg-teal-50 p-4" data-editor={tool.slug}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{toolName(tool)}</h3>
          <p className="text-xs text-gray-600">{KIND_LABEL[tool.kind]} {'\u00b7'} {tool.active ? 'shown' : 'HIDDEN'} {'\u00b7'} code: {tool.slug}</p>
        </div>
        <button type="button" onClick={onClose} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-bold text-gray-700" data-close="1">
          <X className="h-4 w-4" />Close
        </button>
      </div>

      {canPublish && !help && (
        <div className="flex flex-wrap items-end gap-2 rounded-xl bg-white p-3" data-settings="1">
          <label className="text-xs font-bold text-gray-700">
            How it works
            <select value={kind} onChange={(e) => setKind(e.target.value as CalmKind)} className="mt-1 block rounded-lg border border-gray-200 px-2 py-2 text-sm" data-s="kind">
              <option value="breathe">{KIND_LABEL.breathe}</option>
              <option value="steps">{KIND_LABEL.steps}</option>
              <option value="list">{KIND_LABEL.list}</option>
            </select>
          </label>
          {kind === 'breathe' && (
            <>
              <label className="text-xs font-bold text-gray-700">
                Breathe in (seconds)
                <input type="number" min={2} max={8} value={bin} onChange={(e) => setBin(Number(e.target.value))} className="mt-1 block w-24 rounded-lg border border-gray-200 px-2 py-2 text-sm" data-s="in" />
              </label>
              <label className="text-xs font-bold text-gray-700">
                Breathe out (seconds)
                <input type="number" min={2} max={10} value={bout} onChange={(e) => setBout(Number(e.target.value))} className="mt-1 block w-24 rounded-lg border border-gray-200 px-2 py-2 text-sm" data-s="out" />
              </label>
            </>
          )}
          <button type="button" disabled={act.busy || !settingsDirty}
                  onClick={() => void act.run('settings', () => adminCalmSettings(tool.id, kind, bin, bout), 'How "' + toolName(tool) + '" works is saved - people see it at once.')}
                  className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-bold text-white disabled:opacity-40" data-save-settings="1">
            Save how it works
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-1" role="tablist" aria-label="Language">
        {WH_LANGS.map((l) => {
          const st = langState(tool.texts[l]);
          return (
            <button key={l} type="button" role="tab" aria-selected={lang === l} onClick={() => setLang(l)} data-tab={l}
                    className={'rounded-lg px-3 py-1.5 text-sm font-bold ' + (lang === l ? 'bg-gray-900 text-white' : 'border border-gray-200 bg-white text-gray-700')}>
              {LANG_NAMES[l]} <span className="text-[10px] font-semibold opacity-80">({STATE_WORD[st]})</span>
            </button>
          );
        })}
      </div>
      <LangEditor key={tool.id + ':' + lang + ':' + (x ? x.draft.at : 'none')} tool={tool} lang={lang} canPublish={canPublish}
                  reviewer={reviewer} setReviewer={setReviewer} act={act} />
    </section>
  );
}

function AddTool({ act, onCreated }: { act: Act; onCreated: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<Exclude<CalmKind, 'help'>>('steps');
  const [lang, setLang] = useState<WhLang>('en');
  const [title, setTitle] = useState('');
  const problem = calmContactProblem(title);
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} data-add-tool="1"
              className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-3 py-2 text-sm font-bold text-white">
        <Plus className="h-4 w-4" />Add a tool
      </button>
    );
  }
  const create = async () => {
    const made = { id: '' };
    const okd = await act.run('new', async () => {
      const r = await adminCalmNew(kind, lang, title.trim());
      if (r.ok) made.id = r.id;
      return r;
    }, '"' + title.trim() + '" is added as a draft. Nobody sees it until an admin publishes it.');
    if (okd && made.id) { setOpen(false); setTitle(''); onCreated(made.id); }
  };
  return (
    <div className="space-y-2 rounded-xl border border-teal-200 bg-white p-3" data-add-form="1">
      <p className="text-sm font-bold text-gray-900">Add a tool</p>
      <div className="grid gap-2 sm:grid-cols-3">
        <select value={kind} onChange={(e) => setKind(e.target.value as Exclude<CalmKind, 'help'>)} className="rounded-lg border border-gray-200 px-2 py-2 text-sm" data-n="kind">
          <option value="steps">{KIND_LABEL.steps}</option>
          <option value="breathe">{KIND_LABEL.breathe}</option>
          <option value="list">{KIND_LABEL.list}</option>
        </select>
        <select value={lang} onChange={(e) => setLang(e.target.value as WhLang)} className="rounded-lg border border-gray-200 px-2 py-2 text-sm" data-n="lang">
          {WH_LANGS.map((l) => <option key={l} value={l}>{'First draft in ' + LANG_NAMES[l]}</option>)}
        </select>
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={60} placeholder="Title (3-60 letters)" dir={lang === 'ar' ? 'rtl' : 'ltr'}
               className="rounded-lg border border-gray-200 px-3 py-2 text-sm" data-n="title" />
      </div>
      {problem && <p className="text-sm font-semibold text-red-700">{reasonOf(problem)}</p>}
      <div className="flex gap-2">
        <button type="button" disabled={act.busy || title.trim().length < 3 || !!problem} onClick={() => void create()} data-create="1"
                className="rounded-lg bg-teal-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-40">
          Create the draft
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700">Cancel</button>
      </div>
    </div>
  );
}

export default function AdminCalmTools() {
  const navigate = useNavigate();
  const [s, setS] = useState<CalmAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<{ text: string; bad: boolean } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [reviewer, setReviewer] = useState<Reviewer>({ name: '', role: '', date: doualaNow().ymd });

  const load = useCallback(async () => {
    setLoading(true);
    const r = await adminCalmState();
    if (r.ok) { setS(r); setError(null); } else setError(reasonOf(r.reason));
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const act: Act = {
    busy: busy !== null,
    run: async (label, fn, done) => {
      setBusy(label); setNote(null);
      let r: { ok: boolean; reason?: string };
      try { r = await fn(); } catch { r = { ok: false, reason: 'network' }; }
      setBusy(null);
      if (!r.ok) { setNote({ text: reasonOf(r.reason || 'generic'), bad: true }); return false; }
      if (done) setNote({ text: done, bad: false });
      await load();
      return true;
    },
  };

  const canPublish = !!s && s.can_publish;
  const tools = s ? s.tools : [];
  const editTool = editing ? tools.find((t) => t.id === editing) || null : null;
  const others = tools.filter((t) => t.kind !== 'help');
  const liveCount = tools.filter((t) => t.active && WH_LANGS.some((l) => !!(t.texts[l] && t.texts[l]?.live))).length;
  const helpLive = tools.some((t) => t.kind === 'help' && WH_LANGS.some((l) => !!(t.texts[l] && t.texts[l]?.live)));
  const publicOn = !!s && s.on && s.ready;

  const switchOn = () => {
    if (!window.confirm('Open the Calm tools page to everyone now? People see every published text at once. Your name and the time are recorded.')) return;
    void act.run('switch', () => adminCalmSwitch(true), 'Calm tools are ON for everyone.');
  };
  const switchOff = () => {
    if (!window.confirm('Close the Calm tools page for everyone? Nothing is deleted. Your name and the time are recorded.')) return;
    void act.run('switch', () => adminCalmSwitch(false), 'Calm tools are OFF for everyone.');
  };
  const hide = (t: CalmStaffTool, on: boolean) => {
    if (!on && !window.confirm('Hide "' + toolName(t) + '"? People stop seeing it at once; every text is kept. Your name and the time are recorded.')) return;
    void act.run('show ' + t.id, () => adminCalmShow(t.id, on), '"' + toolName(t) + '" is ' + (on ? 'shown again.' : 'hidden.'));
  };
  const del = (t: CalmStaffTool) => {
    if (!window.confirm('DELETE "' + toolName(t) + '" with all its languages?\n\nIt waits 90 days in the bin below, where an admin can bring it back. ' +
        'Your name and the time are recorded.')) return;
    if (editing === t.id) setEditing(null);
    void act.run('delete ' + t.id, () => adminCalmDelete(t.id), '"' + toolName(t) + '" is deleted (in the bin for 90 days).');
  };

  return (
    <section data-fix="FIX743" data-calm-panel={publicOn ? 'on' : 'off'} className="space-y-3 rounded-xl border border-teal-200 bg-teal-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-teal-700" />
          <h2 className="font-bold text-gray-900">Calm tools: {publicOn ? 'ON' : 'OFF'}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => navigate('/calm?preview=1')} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700">
            <Eye className="h-4 w-4" />See the page
          </button>
          <button type="button" onClick={() => void load()} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700" data-refresh="1">
            <RefreshCw className="h-4 w-4" />Refresh
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-800">
        Short self-help exercises and "When to get help", for everyone. Bambeh does not treat: every text points to a health worker.
        People see a text only after an admin PUBLISHES it with the name of the psychologist who checked that exact text, language by language.
        Moderators can write drafts; admins and the super admin publish, hide, move and delete.
      </p>
      {s && (
        <div className="rounded-lg bg-white px-3 py-2 text-sm text-gray-800" data-calm-status="1">
          {publicOn ? (
            <p><span className="font-bold text-green-700">Open to everyone</span> - {liveCount} tool(s) with a published language. Switched on by {s.switched_by_name || '?'} {when(s.switched_at)}.</p>
          ) : s.on ? (
            <p className="font-semibold text-amber-800">Switched on, but people see nothing: "When to get help" and at least one shown tool must be published.</p>
          ) : (
            <p>
              <span className="font-bold text-gray-900">Closed to the public.</span>{' '}
              {helpLive ? '' : 'To open it: publish "When to get help". '}
              {liveCount - (helpLive ? 1 : 0) > 0 ? '' : 'Publish at least one other tool. '}
              {s.switched_at ? 'Last switched off by ' + (s.switched_by_name || '?') + ' ' + when(s.switched_at) + '.' : ''}
            </p>
          )}
        </div>
      )}
      {s && canPublish && (
        publicOn || s.on ? (
          <button type="button" disabled={act.busy} onClick={switchOff} data-switch="off"
                  className="inline-flex items-center gap-1 rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-bold text-red-700 disabled:opacity-40">
            <Power className="h-4 w-4" />Switch Calm tools off
          </button>
        ) : (
          <button type="button" disabled={act.busy || !s.ready} onClick={switchOn} data-switch="on"
                  className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-40">
            <Power className="h-4 w-4" />Switch Calm tools on
          </button>
        )
      )}
      {s && !canPublish && <p className="text-xs font-semibold text-gray-600">You can write drafts. Only an admin or the super admin publishes, hides, moves, deletes or switches Calm tools.</p>}

      {note && <p className={'rounded-lg px-3 py-2 text-sm ' + (note.bad ? 'bg-red-100 font-semibold text-red-800' : 'bg-gray-900 text-white')} data-calm-note={note.bad ? 'bad' : 'good'}>{note.text}</p>}
      {busy && <p className="flex items-center gap-2 text-xs text-gray-500"><Loader2 className="h-4 w-4 animate-spin" />Saving...</p>}

      {loading && !s ? (
        <div className="flex justify-center py-6 text-gray-400"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : error && !s ? (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800" data-calm-error="1">{error}</p>
      ) : editTool ? (
        <ToolEditor key={editTool.id} tool={editTool} canPublish={canPublish} reviewer={reviewer} setReviewer={setReviewer} act={act} onClose={() => setEditing(null)} />
      ) : (
        <div className="space-y-2">
          {tools.map((t) => {
            const help = t.kind === 'help';
            const pos = others.indexOf(t);
            return (
              <article key={t.id} className={'space-y-2 rounded-xl border bg-white p-3 ' + (t.active ? 'border-gray-200' : 'border-dashed border-gray-300 opacity-80')} data-calm-tool={t.slug}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900">{help ? '' : (pos + 1) + '. '}{toolName(t)}</h3>
                    <p className="text-xs text-gray-500">
                      {KIND_LABEL[t.kind]}{t.kind === 'breathe' ? ' (' + t.breathe_in + ' s in, ' + t.breathe_out + ' s out)' : ''}
                      {t.active ? '' : ' \u00b7 HIDDEN'} {'\u00b7'} opened {t.opened_30_days} time(s) in 30 days
                    </p>
                  </div>
                  <LangChips tool={t} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => setEditing(t.id)} data-edit={t.slug}
                          className="inline-flex items-center gap-1 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-bold text-white">
                    <Pencil className="h-3.5 w-3.5" />Edit
                  </button>
                  {canPublish && !help && (
                    <>
                      <button type="button" disabled={act.busy || pos === 0} onClick={() => void act.run('move', () => adminCalmMove(t.id, -1))} aria-label="Move up" data-up={t.slug}
                              className="rounded-lg border border-gray-200 px-2 py-1.5 text-gray-700 disabled:opacity-30"><ArrowUp className="h-3.5 w-3.5" /></button>
                      <button type="button" disabled={act.busy || pos === others.length - 1} onClick={() => void act.run('move', () => adminCalmMove(t.id, 1))} aria-label="Move down" data-down={t.slug}
                              className="rounded-lg border border-gray-200 px-2 py-1.5 text-gray-700 disabled:opacity-30"><ArrowDown className="h-3.5 w-3.5" /></button>
                      <button type="button" disabled={act.busy} onClick={() => hide(t, !t.active)} data-hide={t.slug}
                              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-700 disabled:opacity-40">
                        {t.active ? <><EyeOff className="h-3.5 w-3.5" />Hide</> : <><Eye className="h-3.5 w-3.5" />Show</>}
                      </button>
                      <button type="button" disabled={act.busy} onClick={() => del(t)} data-delete={t.slug}
                              className="inline-flex items-center gap-1 rounded-lg border border-red-300 px-3 py-1.5 text-xs font-bold text-red-700 disabled:opacity-40">
                        <Trash2 className="h-3.5 w-3.5" />Delete
                      </button>
                    </>
                  )}
                  {help && <span className="self-center text-[11px] text-gray-500">Always first; cannot be hidden or deleted.</span>}
                </div>
              </article>
            );
          })}
          <AddTool act={act} onCreated={(id) => setEditing(id)} />
        </div>
      )}

      {s && s.bin.length > 0 && !editTool && (
        <div className="space-y-1 rounded-xl border border-gray-200 bg-white p-3" data-calm-bin={s.bin.length}>
          <p className="text-sm font-bold text-gray-900">Deleted - kept 90 days</p>
          {s.bin.map((b) => (
            <div key={b.id} className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-700">
              <span>{b.title} ({b.slug}) - deleted by {b.deleted_by_name || '?'} {when(b.deleted_at)}</span>
              {canPublish && (
                <button type="button" disabled={act.busy} data-restore={b.slug}
                        onClick={() => void act.run('restore', () => adminCalmRestore(b.id), '"' + b.title + '" is back, HIDDEN. Check it, then press Show.')}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2 py-1 font-bold text-gray-800 disabled:opacity-40">
                  <Undo2 className="h-3.5 w-3.5" />Bring back
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {s && s.history.length > 0 && (
        <details className="text-xs text-gray-600" data-calm-history={s.history.length}>
          <summary className="inline-flex cursor-pointer items-center gap-1 font-semibold"><History className="h-3.5 w-3.5" />History (last {s.history.length})</summary>
          <div className="mt-1 space-y-0.5">
            {s.history.map((h, i) => <p key={i}>{when(h.at)} {h.by || '?'}: {ACTIONS[h.action] || h.action}{h.note ? ' - ' + h.note : ''}</p>)}
          </div>
        </details>
      )}
    </section>
  );
}
// BAMBEH_END_TOKEN__ADMIN_CALM_TOOLS_FIX743__COMPLETE
