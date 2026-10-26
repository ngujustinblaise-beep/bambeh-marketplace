// BAMBEH_DEPLOY_TOKEN__SUPPORT_CHAT_FIX837_CLEAN
/**
 * src/features/support/SupportChat.tsx - FIX837 (new)
 * ROUTES: /help/chat (everyone; it asks to sign in) and, through CorporatePrioritySupport (FIX841), /corporate/support
 *
 * "CHAT WITH BAMBEH". The app still showed a phone number and a WhatsApp line (the floating help button, the footer,
 * Help > Contact) while the rule is: contact stays in Bambeh. This is the in-app way to reach a person at Bambeh:
 *   - every signed-in member, no subscription needed (Help pages are open to everyone);
 *   - a conversation per subject: what it is about, the message; Bambeh answers from Command Center > Support inbox
 *     (FIX838) and the member gets a notification that opens the conversation (/help/chat?t=<id>);
 *   - "This is solved"; writing again opens it again;
 *   - for a business (business mode, /corporate/support): its messages go to the top of Bambeh's list.
 * The database (FIX832) checks every message: only the member's own conversations, 10 new ones a day at most.
 * Signed out: how to sign in, how to reset a password (the forgot-password page keeps its WhatsApp help), or email.
 * Five languages, right-to-left for Arabic.
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle, ArrowLeft, Building2, CheckCircle2, ChevronRight, Loader2, LogIn, Mail, MessageCircle, Plus, RefreshCw,
  Send, ShieldCheck,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';
import { fetchMyStores, type CorporateStore } from '@/features/corporate/lib';

const SUPPORT_EMAIL = 'support@bambeh.com';
// FIX884 - weekly and monthly passes: messages to Bambeh are marked first in the Support inbox (FIX861)
const PRIORITY_NOTE: Record<string, string> = {
  en: "Priority support: your pass puts your messages first.",
  fr: "Assistance prioritaire : votre pass place vos messages en premier.",
  pidgin: "Priority support: your pass dey put your message first.",
  ar: "\u062f\u0639\u0645 \u0630\u0648 \u0623\u0648\u0644\u0648\u064a\u0629: \u0627\u0634\u062a\u0631\u0627\u0643\u0643 \u064a\u0636\u0639 \u0631\u0633\u0627\u0626\u0644\u0643 \u0623\u0648\u0644\u064b\u0627.",
  ff: "Ballal adii\u0257um: pass maa ina adiida mesaasji maa.",
};
type Cat = 'general' | 'billing' | 'technical' | 'verification' | 'payout';
const CATS: Cat[] = ['billing', 'technical', 'verification', 'payout', 'general'];

export interface Reply { id: string; staff: boolean; body: string; at: string }
export interface Ticket {
  id: string; subject: string; category: string; status: string; state: 'waiting' | 'answered' | 'solved'; priority: string;
  body: string; created_at: string; updated_at: string; store_id: string | null; business: string | null; replies: Reply[];
}

export const CHAT_STR = {
  en: {
    title: 'Chat with Bambeh', subtitle: 'Write to the Bambeh team. You are told in the app when we answer.',
    bizTitle: 'Priority support', bizSub: "Messages from your business go to the top of Bambeh's list.",
    newMsg: 'New message', myMsgs: 'My messages', none: 'No message yet. Write to us - a person at Bambeh answers.',
    topic: 'What is it about?', cat_general: 'Something else', cat_billing: 'A payment or a subscription',
    cat_technical: 'A problem with the app', cat_verification: 'Checking my account or my business', cat_payout: 'Money I should receive',
    placeholder: 'Write your message...',
    hint: 'Say what happened, where in the app, and when. For a payment, add the amount, the date and the transaction number.',
    send: 'Send', sending: 'Sending...', sent: 'Sent. Bambeh answers here - you get a notification.',
    replyPh: 'Write your answer...', solved: 'This is solved', solvedDone: 'Marked as solved. Thank you!',
    reopenNote: 'Solved. Write again if you still need help.',
    st_waiting: 'Waiting for Bambeh', st_answered: 'Bambeh answered', st_solved: 'Solved',
    you: 'You', bambeh: 'Bambeh', back: 'Back',
    signedOutTitle: 'Sign in to chat with Bambeh', signedOutText: 'Your messages and our answers stay in your account.',
    signIn: 'Sign in', forgot: "Can't sign in? Reset your password", emailUs: 'Or write to',
    notReady: 'Chat with Bambeh is being switched on. Meanwhile, write to', loadErr: 'Could not load. Check your connection.',
    retry: 'Try again', tooMany: "You have written a lot today. Please wait for Bambeh's answer.",
    badLength: 'Write at least 2 characters (2000 at most).', noBusiness: 'Register your business first.',
    register: 'Register your enterprise', newAnswer: 'New answer', refresh: 'Refresh', dashboard: 'My Corporate dashboard',
    other: 'Something went wrong. Try again.',
  },
  fr: {
    title: 'Discuter avec Bambeh', subtitle: '\u00c9crivez \u00e0 l\u2019\u00e9quipe Bambeh. Vous \u00eates pr\u00e9venu dans l\u2019application quand nous r\u00e9pondons.',
    bizTitle: 'Support prioritaire', bizSub: 'Les messages de votre entreprise passent en t\u00eate de la liste de Bambeh.',
    newMsg: 'Nouveau message', myMsgs: 'Mes messages', none: 'Aucun message pour l\u2019instant. \u00c9crivez-nous - une personne de Bambeh vous r\u00e9pond.',
    topic: 'C\u2019est \u00e0 quel sujet ?', cat_general: 'Autre chose', cat_billing: 'Un paiement ou un abonnement',
    cat_technical: 'Un probl\u00e8me avec l\u2019application', cat_verification: 'La v\u00e9rification de mon compte ou de mon entreprise',
    cat_payout: 'De l\u2019argent que je dois recevoir',
    placeholder: '\u00c9crivez votre message...',
    hint: 'Dites ce qui s\u2019est pass\u00e9, o\u00f9 dans l\u2019application, et quand. Pour un paiement, ajoutez le montant, la date et la r\u00e9f\u00e9rence de la transaction.',
    send: 'Envoyer', sending: 'Envoi...', sent: 'Envoy\u00e9. Bambeh r\u00e9pond ici - vous recevez une notification.',
    replyPh: '\u00c9crivez votre r\u00e9ponse...', solved: 'C\u2019est r\u00e9gl\u00e9', solvedDone: 'Marqu\u00e9 comme r\u00e9gl\u00e9. Merci !',
    reopenNote: 'R\u00e9gl\u00e9. \u00c9crivez encore si vous avez toujours besoin d\u2019aide.',
    st_waiting: 'En attente de Bambeh', st_answered: 'Bambeh a r\u00e9pondu', st_solved: 'R\u00e9gl\u00e9',
    you: 'Vous', bambeh: 'Bambeh', back: 'Retour',
    signedOutTitle: 'Connectez-vous pour discuter avec Bambeh', signedOutText: 'Vos messages et nos r\u00e9ponses restent dans votre compte.',
    signIn: 'Se connecter', forgot: 'Impossible de vous connecter ? R\u00e9initialisez votre mot de passe', emailUs: 'Ou \u00e9crivez \u00e0',
    notReady: 'La discussion avec Bambeh est en cours d\u2019activation. En attendant, \u00e9crivez \u00e0',
    loadErr: 'Chargement impossible. V\u00e9rifiez votre connexion.', retry: 'R\u00e9essayer',
    tooMany: 'Vous avez beaucoup \u00e9crit aujourd\u2019hui. Merci d\u2019attendre la r\u00e9ponse de Bambeh.',
    badLength: '\u00c9crivez au moins 2 caract\u00e8res (2000 au maximum).', noBusiness: 'Enregistrez d\u2019abord votre entreprise.',
    register: 'Enregistrer votre entreprise', newAnswer: 'Nouvelle r\u00e9ponse', refresh: 'Actualiser', dashboard: 'Mon tableau de bord Corporate',
    other: 'Un probl\u00e8me est survenu. R\u00e9essayez.',
  },
  pidgin: {
    title: 'Chat with Bambeh', subtitle: 'Write the Bambeh team. Dem go tell you for the app when we answer.',
    bizTitle: 'Priority support', bizSub: 'Messages from your company dey go top of Bambeh list.',
    newMsg: 'New message', myMsgs: 'My messages', none: 'No message yet. Write us - real person for Bambeh go answer.',
    topic: 'Na about wetin?', cat_general: 'Another thing', cat_billing: 'Payment or subscription',
    cat_technical: 'Problem with the app', cat_verification: 'Check for my account or my company', cat_payout: 'Money wey I suppose collect',
    placeholder: 'Write your message...',
    hint: 'Talk wetin happen, for which side for the app, and when. For payment, add the amount, the date and the transaction number.',
    send: 'Send', sending: 'E dey send...', sent: 'E don go. Bambeh go answer here - you go get notification.',
    replyPh: 'Write your answer...', solved: 'E don settle', solvedDone: 'We mark am settled. Thank you!',
    reopenNote: 'E don settle. Write again if you still need help.',
    st_waiting: 'Bambeh never answer', st_answered: 'Bambeh don answer', st_solved: 'E don settle',
    you: 'You', bambeh: 'Bambeh', back: 'Go back',
    signedOutTitle: 'Login to chat with Bambeh', signedOutText: 'Your messages and our answers go stay for your account.',
    signIn: 'Login', forgot: 'You no fit login? Change your password', emailUs: 'Or write',
    notReady: 'Dem dey open Chat with Bambeh now. For now, write', loadErr: 'E no load. Check your network.',
    retry: 'Try again', tooMany: 'You don write plenty today. Abeg wait for Bambeh answer.',
    badLength: 'Write at least 2 letters (2000 maximum).', noBusiness: 'Register your company first.',
    register: 'Register your company', newAnswer: 'New answer', refresh: 'Refresh', dashboard: 'My Corporate dashboard',
    other: 'Something no work. Try again.',
  },
  ar: {
    title: '\u062a\u062d\u062f\u0651\u062b \u0645\u0639 Bambeh', subtitle: '\u0627\u0643\u062a\u0628 \u0625\u0644\u0649 \u0641\u0631\u064a\u0642 Bambeh. \u0633\u062a\u064f\u0628\u0644\u0651\u063a \u062f\u0627\u062e\u0644 \u0627\u0644\u062a\u0637\u0628\u064a\u0642 \u0639\u0646\u062f\u0645\u0627 \u0646\u0631\u062f.',
    bizTitle: '\u062f\u0639\u0645 \u0630\u0648 \u0623\u0648\u0644\u0648\u064a\u0629', bizSub: '\u0631\u0633\u0627\u0626\u0644 \u0634\u0631\u0643\u062a\u0643 \u062a\u0623\u062a\u064a \u0641\u064a \u0623\u0639\u0644\u0649 \u0642\u0627\u0626\u0645\u0629 Bambeh.',
    newMsg: '\u0631\u0633\u0627\u0644\u0629 \u062c\u062f\u064a\u062f\u0629', myMsgs: '\u0631\u0633\u0627\u0626\u0644\u064a',
    none: '\u0644\u0627 \u0631\u0633\u0627\u0626\u0644 \u0628\u0639\u062f. \u0627\u0643\u062a\u0628 \u0625\u0644\u064a\u0646\u0627 - \u0633\u064a\u0631\u062f \u0639\u0644\u064a\u0643 \u0634\u062e\u0635 \u0645\u0646 Bambeh.',
    topic: '\u0628\u062e\u0635\u0648\u0635 \u0645\u0627\u0630\u0627\u061f', cat_general: '\u0623\u0645\u0631 \u0622\u062e\u0631', cat_billing: '\u062f\u0641\u0639\u0629 \u0623\u0648 \u0627\u0634\u062a\u0631\u0627\u0643',
    cat_technical: '\u0645\u0634\u0643\u0644\u0629 \u0641\u064a \u0627\u0644\u062a\u0637\u0628\u064a\u0642', cat_verification: '\u0627\u0644\u062a\u062d\u0642\u0642 \u0645\u0646 \u062d\u0633\u0627\u0628\u064a \u0623\u0648 \u0634\u0631\u0643\u062a\u064a',
    cat_payout: '\u0645\u0627\u0644 \u064a\u062c\u0628 \u0623\u0646 \u0623\u0633\u062a\u0644\u0645\u0647',
    placeholder: '\u0627\u0643\u062a\u0628 \u0631\u0633\u0627\u0644\u062a\u0643...',
    hint: '\u0627\u0630\u0643\u0631 \u0645\u0627 \u062d\u062f\u062b\u060c \u0648\u0623\u064a\u0646 \u0641\u064a \u0627\u0644\u062a\u0637\u0628\u064a\u0642\u060c \u0648\u0645\u062a\u0649. \u0644\u0644\u062f\u0641\u0639\u060c \u0623\u0636\u0641 \u0627\u0644\u0645\u0628\u0644\u063a \u0648\u0627\u0644\u062a\u0627\u0631\u064a\u062e \u0648\u0631\u0642\u0645 \u0627\u0644\u0639\u0645\u0644\u064a\u0629.',
    send: '\u0625\u0631\u0633\u0627\u0644', sending: '\u062c\u0627\u0631\u064d \u0627\u0644\u0625\u0631\u0633\u0627\u0644...',
    sent: '\u0623\u064f\u0631\u0633\u0644\u062a. \u062a\u0631\u062f Bambeh \u0647\u0646\u0627 - \u0648\u064a\u0635\u0644\u0643 \u0625\u0634\u0639\u0627\u0631.',
    replyPh: '\u0627\u0643\u062a\u0628 \u0631\u062f\u0643...', solved: '\u062a\u0645 \u0627\u0644\u062d\u0644', solvedDone: '\u0648\u064f\u0636\u0639\u062a \u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u062d\u0644. \u0634\u0643\u0631\u064b\u0627!',
    reopenNote: '\u062a\u0645 \u0627\u0644\u062d\u0644. \u0627\u0643\u062a\u0628 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649 \u0625\u0630\u0627 \u0643\u0646\u062a \u0644\u0627 \u062a\u0632\u0627\u0644 \u0628\u062d\u0627\u062c\u0629 \u0625\u0644\u0649 \u0645\u0633\u0627\u0639\u062f\u0629.',
    st_waiting: '\u0628\u0627\u0646\u062a\u0638\u0627\u0631 Bambeh', st_answered: '\u0631\u062f\u0651\u062a Bambeh', st_solved: '\u062a\u0645 \u0627\u0644\u062d\u0644',
    you: '\u0623\u0646\u062a', bambeh: 'Bambeh', back: '\u0631\u062c\u0648\u0639',
    signedOutTitle: '\u0633\u062c\u0651\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0644\u0644\u062a\u062d\u062f\u062b \u0645\u0639 Bambeh',
    signedOutText: '\u062a\u0628\u0642\u0649 \u0631\u0633\u0627\u0626\u0644\u0643 \u0648\u0631\u062f\u0648\u062f\u0646\u0627 \u0641\u064a \u062d\u0633\u0627\u0628\u0643.',
    signIn: '\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644', forgot: '\u0644\u0627 \u062a\u0633\u062a\u0637\u064a\u0639 \u0627\u0644\u062f\u062e\u0648\u0644\u061f \u0623\u0639\u062f \u062a\u0639\u064a\u064a\u0646 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631',
    emailUs: '\u0623\u0648 \u0627\u0643\u062a\u0628 \u0625\u0644\u0649',
    notReady: '\u064a\u062c\u0631\u064a \u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u0645\u062d\u0627\u062f\u062b\u0629 \u0645\u0639 Bambeh. \u0641\u064a \u0627\u0644\u0623\u062b\u0646\u0627\u0621\u060c \u0627\u0643\u062a\u0628 \u0625\u0644\u0649',
    loadErr: '\u062a\u0639\u0630\u0651\u0631 \u0627\u0644\u062a\u062d\u0645\u064a\u0644. \u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u062a\u0635\u0627\u0644\u0643.', retry: '\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0629',
    tooMany: '\u0643\u062a\u0628\u062a \u0643\u062b\u064a\u0631\u064b\u0627 \u0627\u0644\u064a\u0648\u0645. \u064a\u0631\u062c\u0649 \u0627\u0646\u062a\u0638\u0627\u0631 \u0631\u062f Bambeh.',
    badLength: '\u0627\u0643\u062a\u0628 \u062d\u0631\u0641\u064a\u0646 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644 (2000 \u0643\u062d\u062f \u0623\u0642\u0635\u0649).',
    noBusiness: '\u0633\u062c\u0651\u0644 \u0634\u0631\u0643\u062a\u0643 \u0623\u0648\u0644\u064b\u0627.', register: '\u0633\u062c\u0651\u0644 \u0634\u0631\u0643\u062a\u0643',
    newAnswer: '\u0631\u062f \u062c\u062f\u064a\u062f', refresh: '\u062a\u062d\u062f\u064a\u062b', dashboard: '\u0644\u0648\u062d\u0629 \u062a\u062d\u0643\u0645 \u0634\u0631\u0643\u062a\u064a',
    other: '\u062d\u062f\u062b \u062e\u0637\u0623. \u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.',
  },
  ff: {
    title: 'Yeewtu e Bambeh', subtitle: 'Winndan goomu Bambeh. Maa a anndine e nder jaa\u0253nirgal ngal so min njaabii.',
    bizTitle: 'Ballal adanngal', bizSub: 'Bataakeeji kawtal maa ina ndenee yeeso e dosol Bambeh.',
    newMsg: 'Batakuru kesu', myMsgs: 'Bataakeeji am', none: 'Alaa batakuru tawo. Winndan min - ne\u0257\u0257o Bambeh jaabay ma.',
    topic: 'Ko fii hol?', cat_general: 'Huunde goo', cat_billing: 'Njo\u0253di walla abonmaa',
    cat_technical: 'Ca\u0257eele e jaa\u0253nirgal ngal', cat_verification: 'Tabitingol konte am walla kawtal am', cat_payout: 'Kaalis mo mi foti he\u0253de',
    placeholder: 'Winndu batakuru maa...',
    hint: 'Wiy ko wa\u0257i, toon e nder jaa\u0253nirgal ngal, e wakkati. Ngam njo\u0253di, \u0253eydu kaalis, \u00f1alnde e limoore transaction.',
    send: 'Neldu', sending: 'Ina neldee...', sent: 'Neldaama. Bambeh jaabay \u0257oo - maa a he\u0253 anndinol.',
    replyPh: 'Winndu jaabawol maa...', solved: '\u0181e feewnii', solvedDone: 'Feewnii. A jaaraama!',
    reopenNote: 'Feewnii. Winndu kadi so a haaji ballal.',
    st_waiting: 'Ina habbii Bambeh', st_answered: 'Bambeh jaabii', st_solved: 'Feewnii',
    you: 'Aan', bambeh: 'Bambeh', back: 'Rutto',
    signedOutTitle: 'Naat ngam yeewtude e Bambeh', signedOutText: 'Bataakeeji maa e jaabawuuji amen ina ndena e konte maa.',
    signIn: 'Naat', forgot: 'A waawaa naatde? Waylu finnde maa', emailUs: 'Walla winndan',
    notReady: 'Yeewtere e Bambeh ina udditee. Haa \u0257on, winndan', loadErr: 'Loowaaki. \u01b3eew ce\u0257eele maa.',
    retry: 'Eto kadi', tooMany: 'A winndii no feewi hannde. Tii\u0257no habbo jaabawol Bambeh.',
    badLength: 'Winndu alkulal 2 (haa 2000).', noBusiness: 'Winndito kawtal maa adan.',
    register: 'Winndito Kawtal maa', newAnswer: 'Jaabawol kesol', refresh: 'Hes\u0257itin', dashboard: 'Dashboard Kawtal am',
    other: 'Huunde mo\u01b4\u01b4aani. Eto kadi.',
  },
};
export type ChatStrings = (typeof CHAT_STR)['en'];

export function chatStrings(rawLang: string): { t: ChatStrings; isRtl: boolean; lang: string } {
  const key = (rawLang === 'fulfulde' || rawLang === 'ful' ? 'ff' : rawLang === 'pcm' ? 'pidgin' : rawLang) as keyof typeof CHAT_STR;
  const t = CHAT_STR[key] || CHAT_STR.en;
  return { t, isRtl: key === 'ar', lang: CHAT_STR[key] ? key : 'en' };
}

function fmtWhen(iso: string | null | undefined, lang: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  try {
    return d.toLocaleString(lang === 'fr' ? 'fr-FR' : lang === 'ar' ? 'ar' : 'en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch {
    return d.toISOString().slice(0, 16).replace('T', ' ');
  }
}
function missingFn(error: unknown): boolean {
  const e = error as { code?: string; message?: string } | null;
  const m = String((e && e.message) || '');
  return !!e && (e.code === 'PGRST202' || e.code === '42883' || /could not find the function|does not exist|schema cache/i.test(m));
}

type View = { k: 'list' } | { k: 'new' } | { k: 'thread'; id: string };

export default function SupportChat({ business = false }: { business?: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  const lang = useLang() as string;
  const { t, isRtl, lang: chatLang } = chatStrings(lang);   // FIX884: chatLang

  const [uid, setUid] = useState<string | null | undefined>(undefined);   // undefined: still looking
  const [store, setStore] = useState<CorporateStore | null | undefined>(business ? undefined : null);
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [priority, setPriority] = useState(false);   // FIX884 - a weekly or monthly pass: answered first
  const [state, setState] = useState<'ok' | 'not_ready' | 'error'>('ok');
  const [view, setView] = useState<View>({ k: 'list' });
  const [cat, setCat] = useState<Cat>('billing');
  const [text, setText] = useState('');
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; tone: 'red' | 'green' } | null>(null);
  const bottom = useRef<HTMLDivElement | null>(null);

  const say = (m: string, tone: 'red' | 'green' = 'green') => {
    setMsg({ text: m, tone });
    if (tone === 'green') {
      try { window.setTimeout(() => setMsg((x) => (x && x.text === m ? null : x)), 6000); } catch { /* no timer */ }
    }
  };
  const failSay = (reason: string | undefined) => {
    say(reason === 'too_many' ? t.tooMany : reason === 'bad_length' ? t.badLength : t.other, 'red');
  };

  useEffect(() => {
    let alive = true;
    void (async () => {
      let id: string | null = null;
      try {
        const { data } = await supabase.auth.getSession();
        id = (data && data.session && data.session.user && data.session.user.id) || null;
      } catch { id = null; }
      if (!alive) return;
      setUid(id);
      if (id && business) {
        try {
          const mine = await fetchMyStores(id);
          if (alive) setStore(mine[0] || null);
        } catch { if (alive) setStore(null); }
      }
    })();
    return () => { alive = false; };
  }, [business]);

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setState('ok');
    try {
      const { data, error } = await supabase.rpc('bambeh_support_my');
      if (error) { setState(missingFn(error) ? 'not_ready' : 'error'); return; }
      const d = (data || {}) as { ok?: boolean; tickets?: Ticket[]; priority?: boolean };   // FIX884: priority
      if (!d.ok) { setState('error'); return; }
      setTickets(Array.isArray(d.tickets) ? d.tickets : []);
      setPriority(d.priority === true);
      setState('ok');
    } catch {
      if (!quiet) setState('error');
    }
  }, []);

  useEffect(() => { if (uid) void load(); }, [uid, load]);

  // a notification opens one conversation: /help/chat?t=<id>
  useEffect(() => {
    try {
      const id = new URLSearchParams(location.search || '').get('t');
      if (id && /^[0-9a-f-]{36}$/i.test(id)) setView({ k: 'thread', id });
    } catch { /* no params */ }
  }, [location.search]);

  // new answers appear by themselves while the page is open (every 20 s in a conversation, 60 s in the list)
  useEffect(() => {
    if (!uid || state !== 'ok') return undefined;
    const every = view.k === 'thread' ? 20000 : 60000;
    const id = window.setInterval(() => {
      try { if (document.visibilityState && document.visibilityState !== 'visible') return; } catch { /* old browser */ }
      void load(true);
    }, every);
    return () => window.clearInterval(id);
  }, [uid, state, view.k, load]);

  const mine = useMemo(() => {
    const all = tickets || [];
    return business && store ? all.filter((x) => x.store_id === store.id) : all;
  }, [tickets, business, store]);
  const current = view.k === 'thread' ? (tickets || []).find((x) => x.id === view.id) || null : null;

  useEffect(() => {
    if (current && bottom.current) { try { bottom.current.scrollIntoView({ block: 'end' }); } catch { /* old browser */ } }
  }, [current ? current.replies.length : 0, view.k]);   // eslint-disable-line react-hooks/exhaustive-deps

  const sendNew = async () => {
    const body = text.trim();
    if (body.length < 2 || body.length > 2000) { say(t.badLength, 'red'); return; }
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc('bambeh_support_new', {
        p_body: body, p_subject: null, p_category: cat, p_store: business && store ? store.id : null,
      });
      const d = (data || {}) as { ok?: boolean; reason?: string; id?: string };
      if (error || !d.ok || !d.id) { failSay(error ? undefined : d.reason); return; }
      setText('');
      say(t.sent);
      await load(true);
      setView({ k: 'thread', id: d.id });
    } catch { failSay(undefined); } finally { setBusy(false); }
  };

  const sendReply = async () => {
    if (!current) return;
    const body = reply.trim();
    if (!body) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc('bambeh_support_reply', { p_ticket: current.id, p_body: body });
      const d = (data || {}) as { ok?: boolean; reason?: string };
      if (error || !d.ok) { failSay(error ? undefined : d.reason); return; }
      setReply('');
      await load(true);
    } catch { failSay(undefined); } finally { setBusy(false); }
  };

  const markSolved = async () => {
    if (!current) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc('bambeh_support_close', { p_ticket: current.id });
      const d = (data || {}) as { ok?: boolean; reason?: string };
      if (error || !d.ok) { failSay(undefined); return; }
      say(t.solvedDone);
      await load(true);
    } catch { failSay(undefined); } finally { setBusy(false); }
  };

  const goBack = () => {
    if (view.k !== 'list') {
      if (location.search) navigate(location.pathname, { replace: true });
      setMsg(null);
      setView({ k: 'list' });
    } else if (business) {
      navigate('/corporate/dashboard');
    } else {
      navigate(-1);
    }
  };

  const header = (
    <div className="bg-gradient-to-br from-teal-600 to-emerald-700 px-4 pb-5 pt-5 text-white">
      <button onClick={goBack} className="mb-2 flex items-center gap-1 text-sm text-teal-50" data-back="1">
        <ArrowLeft className={'h-4 w-4 ' + (isRtl ? 'rotate-180' : '')} /> {view.k === 'list' && business ? t.dashboard : t.back}
      </button>
      <h1 className="flex items-center gap-2 text-xl font-bold">
        {business ? <Building2 className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />} {business ? t.bizTitle : t.title}
      </h1>
      <p className="mt-1 text-sm text-teal-50">{business ? (store ? (store.trading_name || store.registered_name) + ' - ' : '') + t.bizSub : t.subtitle}</p>
      {!business && priority ? (
        <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold" data-priority="1">
          <ShieldCheck className="h-3.5 w-3.5" /> {PRIORITY_NOTE[chatLang] || PRIORITY_NOTE.en}
        </p>
      ) : null}
    </div>
  );
  const wrap = (body: ReactNode) => (
    <div className="min-h-screen bg-gray-50 pb-24" dir={isRtl ? 'rtl' : 'ltr'} data-fix="FIX837" data-support-chat={business ? 'business' : 'member'}>
      {header}
      <div className="mx-auto max-w-2xl px-4 pt-4">
        {msg ? (
          <div className={'mb-3 flex items-start gap-2 rounded-xl border px-3 py-2 text-sm ' + (msg.tone === 'red' ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-800')} data-msg={msg.tone}>
            {msg.tone === 'red' ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
            <span>{msg.text}</span>
          </div>
        ) : null}
        {body}
      </div>
    </div>
  );

  if (uid === undefined || (business && uid && store === undefined)) {
    return wrap(<div className="flex justify-center py-16 text-teal-600"><Loader2 className="h-7 w-7 animate-spin" /></div>);
  }

  if (!uid) {
    return wrap(
      <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center" data-signed-out="1">
        <ShieldCheck className="mx-auto mb-3 h-10 w-10 text-teal-600" />
        <p className="font-bold text-gray-900">{t.signedOutTitle}</p>
        <p className="mb-5 mt-1 text-sm text-gray-500">{t.signedOutText}</p>
        <button onClick={() => navigate('/login', { state: { from: location.pathname } })} className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 font-semibold text-white" data-sign-in="1">
          <LogIn className="h-4 w-4" /> {t.signIn}
        </button>
        <button onClick={() => navigate('/forgot-password')} className="mb-4 w-full text-sm font-semibold text-teal-700 underline" data-forgot="1">{t.forgot}</button>
        <p className="text-xs text-gray-500">{t.emailUs} <a href={'mailto:' + SUPPORT_EMAIL} className="font-semibold text-teal-700" dir="ltr">{SUPPORT_EMAIL}</a></p>
      </div>,
    );
  }

  if (business && !store) {
    return wrap(
      <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center" data-no-business="1">
        <Building2 className="mx-auto mb-3 h-10 w-10 text-gray-300" />
        <p className="mb-4 text-sm text-gray-600">{t.noBusiness}</p>
        <button onClick={() => navigate('/corporate/register')} className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-slate-900">{t.register}</button>
      </div>,
    );
  }

  if (state === 'not_ready') {
    return wrap(
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900" data-not-ready="1">
        <Mail className="mb-2 h-6 w-6" />
        {t.notReady} <a href={'mailto:' + SUPPORT_EMAIL} className="font-semibold underline" dir="ltr">{SUPPORT_EMAIL}</a>
      </div>,
    );
  }

  if (state === 'error' && !tickets) {
    return wrap(
      <div className="rounded-2xl border border-red-100 bg-white p-6 text-center" data-load-error="1">
        <AlertCircle className="mx-auto mb-2 h-8 w-8 text-red-500" />
        <p className="text-sm text-gray-600">{t.loadErr}</p>
        <button onClick={() => { void load(); }} className="mt-3 rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white">{t.retry}</button>
      </div>,
    );
  }

  if (view.k === 'new') {
    return wrap(
      <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-4" data-new="1">
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-700">{t.topic}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {CATS.map((c) => (
              <button key={c} type="button" onClick={() => setCat(c)} data-cat={c}
                      className={'rounded-xl border px-3 py-2 text-start text-sm ' + (cat === c ? 'border-teal-600 bg-teal-50 font-semibold text-teal-800' : 'border-gray-200 text-gray-700')}>
                {(t as Record<string, string>)['cat_' + c]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <textarea value={text} onChange={(e) => setText(e.target.value.slice(0, 2000))} rows={6} placeholder={t.placeholder} data-text="1"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-200" />
          <p className="mt-1 text-xs text-gray-500">{t.hint}</p>
          <p className="mt-0.5 text-end text-[11px] text-gray-400">{text.length}/2000</p>
        </div>
        <button onClick={() => { void sendNew(); }} disabled={busy || text.trim().length < 2} data-send="1"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 text-sm font-bold text-white disabled:opacity-50">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className={'h-4 w-4 ' + (isRtl ? 'rotate-180' : '')} />} {busy ? t.sending : t.send}
        </button>
      </div>,
    );
  }

  if (view.k === 'thread') {
    if (!current) {
      return wrap(tickets ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center text-sm text-gray-500" data-thread-missing="1">
          {t.loadErr}
          <button onClick={() => setView({ k: 'list' })} className="mt-3 block w-full font-semibold text-teal-700">{t.myMsgs}</button>
        </div>
      ) : <div className="flex justify-center py-16 text-teal-600"><Loader2 className="h-7 w-7 animate-spin" /></div>);
    }
    const msgs: Array<{ key: string; staff: boolean; body: string; at: string }> = [
      { key: current.id, staff: false, body: current.body, at: current.created_at },
      ...current.replies.map((x) => ({ key: x.id, staff: x.staff, body: x.body, at: x.at })),
    ];
    return wrap(
      <div className="space-y-3" data-thread={current.id}>
        <div className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold text-gray-900">{current.subject}</p>
            <p className="text-xs text-gray-500">{(t as Record<string, string>)['cat_' + current.category] || current.category}{current.business ? ' - ' + current.business : ''}</p>
          </div>
          <StateChip t={t} state={current.state} />
        </div>
        <div className="space-y-2" data-messages="1">
          {msgs.map((m) => (
            <div key={m.key} className={'flex ' + (m.staff ? 'justify-start' : 'justify-end')} data-from={m.staff ? 'bambeh' : 'me'}>
              <div className={'max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm ' + (m.staff ? 'rounded-ss-sm border border-teal-100 bg-white text-gray-800' : 'rounded-se-sm bg-teal-600 text-white')}>
                <p className={'mb-0.5 text-[11px] font-bold ' + (m.staff ? 'text-teal-700' : 'text-teal-50')}>{m.staff ? t.bambeh : t.you}</p>
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <p className={'mt-1 text-[10px] ' + (m.staff ? 'text-gray-400' : 'text-teal-100')}>{fmtWhen(m.at, lang)}</p>
              </div>
            </div>
          ))}
          <div ref={bottom} />
        </div>
        {current.state === 'solved' ? <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800" data-solved-note="1">{t.reopenNote}</p> : null}
        <div className="rounded-2xl border border-gray-100 bg-white p-3">
          <textarea value={reply} onChange={(e) => setReply(e.target.value.slice(0, 2000))} rows={3} placeholder={t.replyPh} data-reply="1"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-200" />
          <div className="mt-2 flex flex-wrap gap-2">
            <button onClick={() => { void sendReply(); }} disabled={busy || !reply.trim()} data-send-reply="1"
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal-600 py-2.5 text-sm font-bold text-white disabled:opacity-50">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className={'h-4 w-4 ' + (isRtl ? 'rotate-180' : '')} />} {t.send}
            </button>
            {current.state !== 'solved' ? (
              <button onClick={() => { void markSolved(); }} disabled={busy} data-solved="1"
                      className="flex items-center gap-1 rounded-xl border border-emerald-300 px-3 py-2.5 text-sm font-semibold text-emerald-700 disabled:opacity-50">
                <CheckCircle2 className="h-4 w-4" /> {t.solved}
              </button>
            ) : null}
          </div>
        </div>
      </div>,
    );
  }

  return wrap(
    <div className="space-y-3" data-list="1">
      <div className="flex gap-2">
        <button onClick={() => { setMsg(null); setView({ k: 'new' }); }} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 text-sm font-bold text-white" data-new-btn="1">
          <Plus className="h-4 w-4" /> {t.newMsg}
        </button>
        <button onClick={() => { void load(); }} className="rounded-xl border border-gray-200 bg-white px-3 text-gray-600" aria-label={t.refresh} data-refresh="1">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
      <p className="pt-1 text-xs font-semibold uppercase tracking-wide text-gray-500">{t.myMsgs}</p>
      {!tickets ? (
        <div className="flex justify-center py-10 text-teal-600"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : mine.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center text-sm text-gray-500" data-none="1">
          <MessageCircle className="mx-auto mb-2 h-8 w-8 text-gray-300" />{t.none}
        </div>
      ) : (
        mine.map((x) => {
          const last = x.replies.length ? x.replies[x.replies.length - 1] : null;
          const fresh = x.state === 'answered' && !!last && last.staff;
          return (
            <button key={x.id} onClick={() => setView({ k: 'thread', id: x.id })} data-ticket={x.id}
                    className="flex w-full items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 text-start">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">{x.subject}</p>
                <p className="truncate text-xs text-gray-500">{(last ? (last.staff ? t.bambeh : t.you) + ': ' + last.body : x.body)}</p>
                <p className="mt-0.5 text-[11px] text-gray-400">{fmtWhen(x.updated_at, lang)}{x.business ? ' - ' + x.business : ''}</p>
              </div>
              {fresh ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800" data-new-answer="1">{t.newAnswer}</span> : <StateChip t={t} state={x.state} />}
              <ChevronRight className={'h-4 w-4 shrink-0 text-gray-300 ' + (isRtl ? 'rotate-180' : '')} />
            </button>
          );
        })
      )}
    </div>,
  );
}

function StateChip({ t, state }: { t: ChatStrings; state: string }) {
  const cls = state === 'solved' ? 'bg-emerald-50 text-emerald-700' : state === 'answered' ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-800';
  return <span className={'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ' + cls} data-state={state}>{(t as Record<string, string>)['st_' + state] || state}</span>;
}
// BAMBEH_END_TOKEN__SUPPORT_CHAT_FIX837__COMPLETE
