// BAMBEH_DEPLOY_TOKEN__AGENT_REPORT_FIX934_CLEAN
/**
 * src/features/agents/AgentReport.tsx - FIX934 (new) - on the agent page (/agent), for active agents only
 *
 * THE AGENT'S DAILY REPORT. Big, 29 Oct 2026: "Build field agent marketing agent daily feedback form. Did you meet
 * target? What was the best part of the day? What was the main block of the day? When is it easiest to work? When
 * is it most difficult to work? What are your feed back. and they can reply directly from their platform to the
 * admin." Big's answer on the target (29 Oct): "Admins set a number".
 *
 *   - At the top: today's target (set by an admin in Command Center > Marketing agents) and today's REAL count of
 *     new members, from the database - the agent still answers yes / partly / no in their own words.
 *   - Six questions; the two "when" questions are four taps (morning, midday, afternoon, evening) with an optional
 *     word of why, so Bambeh can count them across all agents.
 *   - One report per day; it can be changed until midnight (Cameroon time).
 *   - Bambeh's answers appear under each report (signed "Bambeh") and in the bell; the agent can answer back.
 *
 * Renders nothing for anyone who is not an active agent, or before FIX931 runs.
 * Five languages; every non-ASCII character is a \u escape.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useCallback, useEffect, useState } from 'react';
import { ClipboardList, Loader2, MessageSquare, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';
import { normLang } from '@/pages/auth/QuickJoin';

type Lang = 'en' | 'fr' | 'pidgin' | 'ar' | 'ff';
type Met = 'yes' | 'partly' | 'no';
type Slot = 'morning' | 'midday' | 'afternoon' | 'evening';
const SLOTS: Slot[] = ['morning', 'midday', 'afternoon', 'evening'];

interface Words {
  title: string; lead: string; targetLine: string; noTarget: string;
  qMet: string; yes: string; partly: string; no: string;
  qBest: string; qBlock: string; qEasy: string; qHard: string;
  morning: string; midday: string; afternoon: string; evening: string; whyPh: string;
  qFeedback: string; send: string; update: string; sending: string; sent: string;
  history: string; none: string; members: string; ofTarget: string; bambeh: string; you: string;
  reply: string; replyPh: string; sendReply: string; newReplies: string;
  errMet: string; errEmpty: string; errNet: string; failed: string; more: string; less: string;
  best: string; block: string; easiest: string; hardest: string; feedback: string;
}

export const REPORT_WORDS: Record<Lang, Words> = {
  en: {
    title: "Today's report",
    lead: 'Two minutes at the end of your day. Bambeh reads every report and answers here.',
    targetLine: 'Your target today: {target} new members. So far: {n}.',
    noTarget: 'New members so far today: {n}. Bambeh has not set your target yet.',
    qMet: 'Did you meet your target today?', yes: 'Yes', partly: 'Partly', no: 'No',
    qBest: 'What was the best part of your day?',
    qBlock: 'What was the main block of your day?',
    qEasy: 'When is it easiest to work?',
    qHard: 'When is it most difficult to work?',
    morning: 'Morning', midday: 'Midday', afternoon: 'Afternoon', evening: 'Evening', whyPh: 'Why? (if you want)',
    qFeedback: 'Your feedback for Bambeh',
    send: 'Send to Bambeh', update: "Update today's report", sending: 'Sending...',
    sent: 'Sent at {t}. You can change it until midnight.',
    history: 'Your last reports', none: 'No report yet.', members: '{n} new members', ofTarget: '{n} of {target}',
    bambeh: 'Bambeh', you: 'You',
    reply: 'Answer Bambeh', replyPh: 'Write to Bambeh', sendReply: 'Send', newReplies: 'New answer from Bambeh: {n}',
    errMet: 'Answer the first question: yes, partly or no.', errEmpty: 'Write something first.',
    errNet: 'No connection. Check the network and try again.', failed: 'That did not go through. Try again.',
    more: 'Show', less: 'Hide',
    best: 'Best part', block: 'Main block', easiest: 'Easiest', hardest: 'Hardest', feedback: 'Feedback',
  },
  fr: {
    title: 'Rapport du jour',
    lead: 'Deux minutes en fin de journ\u00e9e. Bambeh lit chaque rapport et r\u00e9pond ici.',
    targetLine: 'Votre objectif du jour : {target} nouveaux membres. Pour l\u2019instant : {n}.',
    noTarget: 'Nouveaux membres aujourd\u2019hui : {n}. Bambeh n\u2019a pas encore fix\u00e9 votre objectif.',
    qMet: 'Avez-vous atteint votre objectif aujourd\u2019hui ?', yes: 'Oui', partly: 'En partie', no: 'Non',
    qBest: 'Quel a \u00e9t\u00e9 le meilleur moment de votre journ\u00e9e ?',
    qBlock: 'Quel a \u00e9t\u00e9 le principal obstacle de votre journ\u00e9e ?',
    qEasy: 'Quand est-il le plus facile de travailler ?',
    qHard: 'Quand est-il le plus difficile de travailler ?',
    morning: 'Matin', midday: 'Midi', afternoon: 'Apr\u00e8s-midi', evening: 'Soir', whyPh: 'Pourquoi ? (si vous voulez)',
    qFeedback: 'Vos remarques pour Bambeh',
    send: 'Envoyer \u00e0 Bambeh', update: 'Mettre \u00e0 jour le rapport du jour', sending: 'Envoi...',
    sent: 'Envoy\u00e9 \u00e0 {t}. Vous pouvez le modifier jusqu\u2019\u00e0 minuit.',
    history: 'Vos derniers rapports', none: 'Aucun rapport pour le moment.', members: '{n} nouveaux membres', ofTarget: '{n} sur {target}',
    bambeh: 'Bambeh', you: 'Vous',
    reply: 'R\u00e9pondre \u00e0 Bambeh', replyPh: '\u00c9crire \u00e0 Bambeh', sendReply: 'Envoyer', newReplies: 'Nouvelle r\u00e9ponse de Bambeh : {n}',
    errMet: 'R\u00e9pondez \u00e0 la premi\u00e8re question : oui, en partie ou non.', errEmpty: '\u00c9crivez d\u2019abord quelque chose.',
    errNet: 'Pas de connexion. V\u00e9rifiez le r\u00e9seau et r\u00e9essayez.', failed: 'Cela n\u2019a pas abouti. R\u00e9essayez.',
    more: 'Voir', less: 'Masquer',
    best: 'Meilleur moment', block: 'Obstacle principal', easiest: 'Plus facile', hardest: 'Plus difficile', feedback: 'Remarques',
  },
  pidgin: {
    title: 'Today report',
    lead: 'Two minutes when your day don finish. Bambeh dey read every report and answer you here.',
    targetLine: 'Your target today: {target} new members. Up to now: {n}.',
    noTarget: 'New members today up to now: {n}. Bambeh never set your target yet.',
    qMet: 'You reach your target today?', yes: 'Yes', partly: 'Small small', no: 'No',
    qBest: 'Which part of your day sweet pass?',
    qBlock: 'Wetin block you pass today?',
    qEasy: 'Which time e easy pass to work?',
    qHard: 'Which time e hard pass to work?',
    morning: 'Morning', midday: 'Midday', afternoon: 'Afternoon', evening: 'Evening', whyPh: 'Why? (if you want)',
    qFeedback: 'Wetin you want tell Bambeh',
    send: 'Send am to Bambeh', update: 'Change today report', sending: 'E dey send...',
    sent: 'You send am {t}. You fit change am until midnight.',
    history: 'Your last reports', none: 'No report yet.', members: '{n} new members', ofTarget: '{n} from {target}',
    bambeh: 'Bambeh', you: 'You',
    reply: 'Answer Bambeh', replyPh: 'Write to Bambeh', sendReply: 'Send', newReplies: 'New answer from Bambeh: {n}',
    errMet: 'Answer the first question: yes, small small or no.', errEmpty: 'Write something first.',
    errNet: 'No network. Check the network and try again.', failed: 'E no work. Try again.',
    more: 'Show', less: 'Hide',
    best: 'Best part', block: 'Wetin block', easiest: 'Easy time', hardest: 'Hard time', feedback: 'Feedback',
  },
  ar: {
    title: '\u062a\u0642\u0631\u064a\u0631 \u0627\u0644\u064a\u0648\u0645',
    lead: '\u062f\u0642\u064a\u0642\u062a\u0627\u0646 \u0641\u064a \u0646\u0647\u0627\u064a\u0629 \u064a\u0648\u0645\u0643. \u062a\u0642\u0631\u0623 \u0628\u0627\u0645\u0628\u064a\u0647 \u0643\u0644 \u062a\u0642\u0631\u064a\u0631 \u0648\u062a\u0631\u062f \u0647\u0646\u0627.',
    targetLine: '\u0647\u062f\u0641\u0643 \u0627\u0644\u064a\u0648\u0645: {target} \u0623\u0639\u0636\u0627\u0621 \u062c\u062f\u062f. \u062d\u062a\u0649 \u0627\u0644\u0622\u0646: {n}.',
    noTarget: '\u0627\u0644\u0623\u0639\u0636\u0627\u0621 \u0627\u0644\u062c\u062f\u062f \u0627\u0644\u064a\u0648\u0645 \u062d\u062a\u0649 \u0627\u0644\u0622\u0646: {n}. \u0644\u0645 \u062a\u062d\u062f\u062f \u0628\u0627\u0645\u0628\u064a\u0647 \u0647\u062f\u0641\u0643 \u0628\u0639\u062f.',
    qMet: '\u0647\u0644 \u062d\u0642\u0642\u062a \u0647\u062f\u0641\u0643 \u0627\u0644\u064a\u0648\u0645\u061f', yes: '\u0646\u0639\u0645', partly: '\u062c\u0632\u0626\u064a\u064b\u0627', no: '\u0644\u0627',
    qBest: '\u0645\u0627 \u0623\u0641\u0636\u0644 \u062c\u0632\u0621 \u0641\u064a \u064a\u0648\u0645\u0643\u061f',
    qBlock: '\u0645\u0627 \u0627\u0644\u0639\u0627\u0626\u0642 \u0627\u0644\u0631\u0626\u064a\u0633\u064a \u0641\u064a \u064a\u0648\u0645\u0643\u061f',
    qEasy: '\u0645\u062a\u0649 \u064a\u0643\u0648\u0646 \u0627\u0644\u0639\u0645\u0644 \u0623\u0633\u0647\u0644\u061f',
    qHard: '\u0645\u062a\u0649 \u064a\u0643\u0648\u0646 \u0627\u0644\u0639\u0645\u0644 \u0623\u0635\u0639\u0628\u061f',
    morning: '\u0627\u0644\u0635\u0628\u0627\u062d', midday: '\u0627\u0644\u0638\u0647\u0631', afternoon: '\u0628\u0639\u062f \u0627\u0644\u0638\u0647\u0631', evening: '\u0627\u0644\u0645\u0633\u0627\u0621', whyPh: '\u0644\u0645\u0627\u0630\u0627\u061f (\u0625\u0646 \u0623\u0631\u062f\u062a)',
    qFeedback: '\u0645\u0644\u0627\u062d\u0638\u0627\u062a\u0643 \u0644\u0628\u0627\u0645\u0628\u064a\u0647',
    send: '\u0623\u0631\u0633\u0644 \u0625\u0644\u0649 \u0628\u0627\u0645\u0628\u064a\u0647', update: '\u062d\u062f\u0651\u062b \u062a\u0642\u0631\u064a\u0631 \u0627\u0644\u064a\u0648\u0645', sending: '\u062c\u0627\u0631\u064d \u0627\u0644\u0625\u0631\u0633\u0627\u0644...',
    sent: '\u0623\u064f\u0631\u0633\u0644 \u0627\u0644\u0633\u0627\u0639\u0629 {t}. \u064a\u0645\u0643\u0646\u0643 \u062a\u0639\u062f\u064a\u0644\u0647 \u062d\u062a\u0649 \u0645\u0646\u062a\u0635\u0641 \u0627\u0644\u0644\u064a\u0644.',
    history: '\u062a\u0642\u0627\u0631\u064a\u0631\u0643 \u0627\u0644\u0623\u062e\u064a\u0631\u0629', none: '\u0644\u0627 \u064a\u0648\u062c\u062f \u062a\u0642\u0631\u064a\u0631 \u0628\u0639\u062f.', members: '{n} \u0623\u0639\u0636\u0627\u0621 \u062c\u062f\u062f', ofTarget: '{n} \u0645\u0646 {target}',
    bambeh: '\u0628\u0627\u0645\u0628\u064a\u0647', you: '\u0623\u0646\u062a',
    reply: '\u0631\u064f\u062f\u0651 \u0639\u0644\u0649 \u0628\u0627\u0645\u0628\u064a\u0647', replyPh: '\u0627\u0643\u062a\u0628 \u0625\u0644\u0649 \u0628\u0627\u0645\u0628\u064a\u0647', sendReply: '\u0623\u0631\u0633\u0644', newReplies: '\u0631\u062f \u062c\u062f\u064a\u062f \u0645\u0646 \u0628\u0627\u0645\u0628\u064a\u0647: {n}',
    errMet: '\u0623\u062c\u0628 \u0639\u0646 \u0627\u0644\u0633\u0624\u0627\u0644 \u0627\u0644\u0623\u0648\u0644: \u0646\u0639\u0645 \u0623\u0648 \u062c\u0632\u0626\u064a\u064b\u0627 \u0623\u0648 \u0644\u0627.', errEmpty: '\u0627\u0643\u062a\u0628 \u0634\u064a\u0626\u064b\u0627 \u0623\u0648\u0644\u064b\u0627.',
    errNet: '\u0644\u0627 \u064a\u0648\u062c\u062f \u0627\u062a\u0635\u0627\u0644. \u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u0644\u0634\u0628\u0643\u0629 \u0648\u062d\u0627\u0648\u0644 \u0645\u062c\u062f\u062f\u064b\u0627.', failed: '\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0623\u0645\u0631. \u062d\u0627\u0648\u0644 \u0645\u062c\u062f\u062f\u064b\u0627.',
    more: '\u0639\u0631\u0636', less: '\u0625\u062e\u0641\u0627\u0621',
    best: '\u0623\u0641\u0636\u0644 \u062c\u0632\u0621', block: '\u0627\u0644\u0639\u0627\u0626\u0642 \u0627\u0644\u0631\u0626\u064a\u0633\u064a', easiest: '\u0627\u0644\u0623\u0633\u0647\u0644', hardest: '\u0627\u0644\u0623\u0635\u0639\u0628', feedback: '\u0645\u0644\u0627\u062d\u0638\u0627\u062a',
  },
  ff: {
    title: 'Kabaaru hannde',
    lead: 'Hojomaaji \u0257i\u0257i e gasgol \u00f1alnde maa. Bambeh ina janga kala kabaaru, ina jaaboo \u0257oo.',
    targetLine: 'Faandaare maa hannde: ter\u0257e kese {target}. Haa jooni: {n}.',
    noTarget: 'Ter\u0257e kese hannde haa jooni: {n}. Bambeh wa\u0257aani faandaare maa tawo.',
    qMet: 'A he\u0253ii faandaare maa hannde?', yes: 'Eey', partly: 'See\u0257a', no: 'Alaa',
    qBest: 'Hol ko \u0253uri welde e \u00f1alnde maa?',
    qBlock: 'Hol ko \u0253uri ha\u0257de ma hannde?',
    qEasy: 'Hol waqtu \u0257o golle \u0253uri newnude?',
    qHard: 'Hol waqtu \u0257o golle \u0253uri sa\u0257tude?',
    morning: 'Subaka', midday: 'Beeti', afternoon: 'Kikii\u0257e', evening: 'Hiirnde', whyPh: 'Ko wa\u0257i? (so a yi\u0257ii)',
    qFeedback: 'Miijo maa ngam Bambeh',
    send: 'Neldu Bambeh', update: 'Waylu kabaaru hannde', sending: 'Ko neldo...',
    sent: 'Neldaama {t}. A waawii waylude \u0257um haa jemma hakkundeere.',
    history: 'Kabaruuji maa sakkitii\u0257i', none: 'Alaa kabaaru tawo.', members: 'Ter\u0257e kese {n}', ofTarget: '{n} e {target}',
    bambeh: 'Bambeh', you: 'Aan',
    reply: 'Jaabo Bambeh', replyPh: 'Winndan Bambeh', sendReply: 'Neldu', newReplies: 'Jaabawol kesol Bambeh: {n}',
    errMet: 'Jaabo naamnal arandeewal: eey, see\u0257a walla alaa.', errEmpty: 'Winndu huunde tawo.',
    errNet: 'Alaa ce\u014bgol. \u01b3eewndo reseau, e\u0257\u0257itto.', failed: '\u0181um waawaa. E\u0257\u0257itto.',
    more: 'Hollu', less: 'Suu\u0257u',
    best: 'Ko \u0253uri welde', block: 'Ko ha\u0257i', easiest: '\u0181uri newnude', hardest: '\u0181uri sa\u0257tude', feedback: 'Miijo',
  },
};

interface Note { id: number; from_staff: boolean; body: string; created_at: string; author: string | null }
export interface Report {
  id: string; day: string; target: number | null; signups: number; target_met: Met;
  best_part: string; main_block: string; easiest_time: Slot | null; easiest_note: string;
  hardest_time: Slot | null; hardest_note: string; feedback: string;
  created_at: string; updated_at: string; last_agent_at: string; last_staff_at: string | null;
  waiting: boolean; unseen: boolean; notes: Note[];
}
interface Got {
  ok: boolean; reason?: string; today?: string; target?: number | null; signups_today?: number;
  report_today?: Report | null; reports?: Report[]; unseen?: number;
}
interface Form { met: Met | ''; best: string; block: string; easy: Slot | ''; easyNote: string; hard: Slot | ''; hardNote: string; feedback: string }
const EMPTY: Form = { met: '', best: '', block: '', easy: '', easyNote: '', hard: '', hardNote: '', feedback: '' };

function fill(s: string, v: Record<string, string | number | null | undefined>): string {
  return s.replace(/\{(\w+)\}/g, (m, k: string) => (v[k] !== undefined && v[k] !== null ? String(v[k]) : m));
}
const isNet = (e: unknown): boolean => /fetch|network|timeout|load failed|offline/i.test(String((e as { message?: unknown })?.message || e || ''));

const LOCALE: Record<Lang, string> = { en: 'en-GB', fr: 'fr-FR', pidgin: 'en-GB', ar: 'ar-u-nu-latn', ff: 'fr-FR' };
function timeOf(iso: string | null | undefined, lang: Lang): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleTimeString(LOCALE[lang], { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Douala' });
  } catch {
    return String(iso).slice(11, 16);
  }
}
function dayOf(day: string, lang: Lang): string {
  try {
    return new Date(day + 'T12:00:00Z').toLocaleDateString(LOCALE[lang], { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Africa/Douala' });
  } catch {
    return day;
  }
}
function formOf(r: Report | null | undefined): Form {
  if (!r) return EMPTY;
  return {
    met: r.target_met, best: r.best_part || '', block: r.main_block || '', easy: r.easiest_time || '', easyNote: r.easiest_note || '',
    hard: r.hardest_time || '', hardNote: r.hardest_note || '', feedback: r.feedback || '',
  };
}

const MET_TONE: Record<Met, string> = {
  yes: 'bg-emerald-600 text-white',
  partly: 'bg-amber-500 text-amber-950',
  no: 'bg-gray-700 text-white',
};

export default function AgentReport() {
  const lang = normLang(useLang()) as Lang;
  const t = REPORT_WORDS[lang];
  const rtl = lang === 'ar';

  const [got, setGot] = useState<Got | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [replyBusy, setReplyBusy] = useState(false);
  const [replyErr, setReplyErr] = useState<string | null>(null);

  const load = useCallback(async (markSeen: boolean, fillForm: boolean) => {
    try {
      const r = await supabase.rpc('bambeh_agent_report_get', { p_days: 14, p_mark_seen: markSeen });
      const d = r && !r.error && r.data && typeof r.data === 'object' ? (r.data as Got) : null;
      if (!d || !d.ok) { setGot((prev) => (prev && prev.ok ? prev : { ok: false })); return; }
      setGot(d);
      if (fillForm) {
        setForm(formOf(d.report_today));
        setSavedAt(d.report_today ? d.report_today.updated_at : null);
      }
    } catch {
      setGot((prev) => (prev && prev.ok ? prev : { ok: false }));
    }
  }, []);
  useEffect(() => { void load(false, true); }, [load]);

  if (!got || !got.ok) return null;

  const set = (patch: Partial<Form>) => { setForm((f) => ({ ...f, ...patch })); setErr(null); };

  const save = async () => {
    if (busy) return;
    if (!form.met) { setErr(t.errMet); return; }
    setBusy(true);
    setErr(null);
    try {
      const r = await supabase.rpc('bambeh_agent_report_save', {
        p_target_met: form.met, p_best_part: form.best, p_main_block: form.block,
        p_easiest: form.easy, p_easiest_note: form.easyNote, p_hardest: form.hard, p_hardest_note: form.hardNote,
        p_feedback: form.feedback,
      });
      const d = r && !r.error ? (r.data as { ok?: boolean; reason?: string; report?: Report } | null) : null;
      if (!d || !d.ok) {
        setErr(r && r.error && isNet(r.error) ? t.errNet : d && d.reason === 'target_met' ? t.errMet : t.failed);
        return;
      }
      setSavedAt(d.report ? d.report.updated_at : new Date().toISOString());
      await load(false, false);
    } catch (e) {
      setErr(isNet(e) ? t.errNet : t.failed);
    } finally {
      setBusy(false);
    }
  };

  const toggle = (r: Report) => {
    setReply('');
    setReplyErr(null);
    if (openId === r.id) { setOpenId(null); return; }
    setOpenId(r.id);
    if (r.unseen) void load(true, false);   // Bambeh's answer is read now
  };

  const sendReply = async (r: Report) => {
    const body = reply.trim();
    if (!body) { setReplyErr(t.errEmpty); return; }
    if (replyBusy) return;
    setReplyBusy(true);
    setReplyErr(null);
    try {
      const x = await supabase.rpc('bambeh_agent_report_reply', { p_report: r.id, p_body: body });
      const d = x && !x.error ? (x.data as { ok?: boolean; reason?: string } | null) : null;
      if (!d || !d.ok) { setReplyErr(x && x.error && isNet(x.error) ? t.errNet : d && d.reason === 'empty' ? t.errEmpty : t.failed); return; }
      setReply('');
      await load(false, false);
    } catch (e) {
      setReplyErr(isNet(e) ? t.errNet : t.failed);
    } finally {
      setReplyBusy(false);
    }
  };

  const today = got.report_today || null;
  const reports = got.reports || [];
  const n = got.signups_today || 0;
  const slotLabel = (s: Slot | null | '') => (s ? t[s] : '');
  const metLabel = (m: Met) => (m === 'yes' ? t.yes : m === 'partly' ? t.partly : t.no);

  const slotRow = (value: Slot | '', onPick: (s: Slot | '') => void, name: string) => (
    <div className="mt-1 flex flex-wrap gap-1.5" role="group" data-slots={name}>
      {SLOTS.map((s) => (
        <button key={s} type="button" aria-pressed={value === s} data-slot={s} onClick={() => onPick(value === s ? '' : s)}
          className={'rounded-full px-3 py-1.5 text-xs font-bold ' + (value === s ? 'bg-teal-600 text-white' : 'bg-white text-gray-700 ring-1 ring-gray-200')}>
          {t[s]}
        </button>
      ))}
    </div>
  );

  return (
    <section dir={rtl ? 'rtl' : 'ltr'} data-fix="FIX934" className="mt-4 rounded-2xl border border-indigo-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-2">
        <ClipboardList className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />
        <div className="min-w-0">
          <h2 className="font-bold text-gray-900">{t.title}</h2>
          <p className="mt-0.5 text-xs text-gray-600">{t.lead}</p>
        </div>
      </div>
      <p className="mt-2 rounded-xl bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-900" data-report-target="1">
        {got.target ? fill(t.targetLine, { target: got.target, n }) : fill(t.noTarget, { n })}
      </p>

      <div className="mt-3 space-y-3" data-report-form="1">
        <div>
          <p className="text-sm font-bold text-gray-900">{t.qMet}</p>
          <div className="mt-1 grid grid-cols-3 gap-2" role="group">
            {(['yes', 'partly', 'no'] as Met[]).map((m) => (
              <button key={m} type="button" aria-pressed={form.met === m} data-met={m} onClick={() => set({ met: m })}
                className={'min-h-[44px] rounded-xl text-sm font-bold ' + (form.met === m ? MET_TONE[m] : 'bg-white text-gray-700 ring-1 ring-gray-200')}>
                {metLabel(m)}
              </button>
            ))}
          </div>
        </div>
        <label className="block">
          <span className="text-sm font-bold text-gray-900">{t.qBest}</span>
          <textarea value={form.best} maxLength={600} rows={2} data-f="best" onChange={(e) => set({ best: e.target.value })}
            className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
        </label>
        <label className="block">
          <span className="text-sm font-bold text-gray-900">{t.qBlock}</span>
          <textarea value={form.block} maxLength={600} rows={2} data-f="block" onChange={(e) => set({ block: e.target.value })}
            className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
        </label>
        <div>
          <p className="text-sm font-bold text-gray-900">{t.qEasy}</p>
          {slotRow(form.easy, (s) => set({ easy: s }), 'easy')}
          <input value={form.easyNote} maxLength={300} placeholder={t.whyPh} data-f="easyNote" onChange={(e) => set({ easyNote: e.target.value })}
            className="mt-1.5 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">{t.qHard}</p>
          {slotRow(form.hard, (s) => set({ hard: s }), 'hard')}
          <input value={form.hardNote} maxLength={300} placeholder={t.whyPh} data-f="hardNote" onChange={(e) => set({ hardNote: e.target.value })}
            className="mt-1.5 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
        </div>
        <label className="block">
          <span className="text-sm font-bold text-gray-900">{t.qFeedback}</span>
          <textarea value={form.feedback} maxLength={1000} rows={3} data-f="feedback" onChange={(e) => set({ feedback: e.target.value })}
            className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
        </label>
        {err && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" data-report-error="1">{err}</p>}
        <button type="button" disabled={busy} onClick={() => void save()} data-report-send="1"
          className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:bg-gray-300">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {busy ? t.sending : today ? t.update : t.send}
        </button>
        {savedAt && today && <p className="text-xs font-semibold text-emerald-700" data-report-saved="1">{fill(t.sent, { t: timeOf(savedAt, lang) })}</p>}
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">{t.history}</h3>
          {(got.unseen || 0) > 0 && (
            <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[11px] font-bold text-white" data-report-unseen="1">
              {fill(t.newReplies, { n: got.unseen || 0 })}
            </span>
          )}
        </div>
        {reports.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">{t.none}</p>
        ) : (
          <ul className="mt-2 divide-y divide-gray-100 rounded-xl border border-gray-200" data-report-history="1">
            {reports.map((r) => {
              const isOpen = openId === r.id;
              return (
                <li key={r.id} data-report={r.day}>
                  <button type="button" onClick={() => toggle(r)} aria-expanded={isOpen}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-start">
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-gray-900">{dayOf(r.day, lang)}</span>
                      <span className="block text-xs text-gray-600">
                        {r.target ? fill(t.ofTarget, { n: r.signups, target: r.target }) : fill(t.members, { n: r.signups })}
                      </span>
                    </span>
                    {r.unseen && <MessageSquare className="h-4 w-4 shrink-0 text-indigo-600" aria-label={t.newReplies} />}
                    <span className={'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ' + MET_TONE[r.target_met]}>{metLabel(r.target_met)}</span>
                    <span className="shrink-0 text-xs font-semibold text-indigo-700">{isOpen ? t.less : t.more}</span>
                  </button>
                  {isOpen && (
                    <div className="space-y-2 px-3 pb-3 text-sm" data-report-open={r.day}>
                      {r.best_part && <p><span className="font-semibold text-gray-600">{t.best}: </span>{r.best_part}</p>}
                      {r.main_block && <p><span className="font-semibold text-gray-600">{t.block}: </span>{r.main_block}</p>}
                      {(r.easiest_time || r.easiest_note) && (
                        <p><span className="font-semibold text-gray-600">{t.easiest}: </span>{[slotLabel(r.easiest_time), r.easiest_note].filter(Boolean).join(' - ')}</p>
                      )}
                      {(r.hardest_time || r.hardest_note) && (
                        <p><span className="font-semibold text-gray-600">{t.hardest}: </span>{[slotLabel(r.hardest_time), r.hardest_note].filter(Boolean).join(' - ')}</p>
                      )}
                      {r.feedback && <p><span className="font-semibold text-gray-600">{t.feedback}: </span>{r.feedback}</p>}
                      {r.notes.length > 0 && (
                        <ul className="space-y-1.5" data-report-notes="1">
                          {r.notes.map((x) => (
                            <li key={x.id} className={'rounded-xl px-3 py-2 ' + (x.from_staff ? 'bg-indigo-50 text-indigo-950' : 'bg-gray-50 text-gray-800')}>
                              <span className="block text-[11px] font-bold">{x.from_staff ? t.bambeh : t.you} {'\u00b7'} {timeOf(x.created_at, lang)}</span>
                              <span className="whitespace-pre-wrap">{x.body}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="flex gap-2">
                        <input value={reply} maxLength={1000} placeholder={t.replyPh} data-f="reply" aria-label={t.reply}
                          onChange={(e) => { setReply(e.target.value); setReplyErr(null); }}
                          className="min-w-0 flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
                        <button type="button" disabled={replyBusy} onClick={() => void sendReply(r)} data-report-reply="1"
                          className="shrink-0 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white disabled:bg-gray-300">{t.sendReply}</button>
                      </div>
                      {replyErr && <p role="alert" className="text-xs text-red-700">{replyErr}</p>}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
// BAMBEH_END_TOKEN__AGENT_REPORT_FIX934__COMPLETE
