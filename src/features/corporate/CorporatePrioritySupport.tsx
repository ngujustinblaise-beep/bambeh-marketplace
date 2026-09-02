// BAMBEH_DEPLOY_TOKEN__CORPORATEPRIORITYSUPPORT_FIX154_CLEAN
/**
 * CorporatePrioritySupport.tsx — Bambeh Corporate (FIX154)
 * FILE LOCATION: src/features/corporate/CorporatePrioritySupport.tsx
 * ROUTE: /corporate/support
 * REQUIRES: fix150_support_tickets.sql (support_tickets + support_ticket_replies)
 *
 * REAL priority-support desk for a corporate owner. NO French-only stub.
 * 5 languages + RTL. Every write is a real insert; RLS limits each user to
 * their own tickets.
 *
 *  • New ticket: subject, category, priority, message → insert support_tickets.
 *  • Ticket list: the user's own tickets, newest first, status chips.
 *  • Ticket thread: original message + replies; add a reply (insert reply).
 *  • Empty-safe, error-safe, back-to-top.
 *
 * © 2026 BAMBEH SARL. All rights reserved.
 */

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Loader2, Plus, LifeBuoy, Send, AlertCircle, Check, X, MessageSquare,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';
import { fetchMyStores } from './lib';
import CorporateLogo from './CorporateLogo';
import BackToTop from '@/components/ui/BackToTop';

const L = {
  en: {
    title: 'Priority Support', back: 'Back', newTicket: 'New ticket',
    subject: 'Subject', category: 'Category', priority: 'Priority', message: 'Message',
    cGeneral: 'General', cBilling: 'Billing', cTechnical: 'Technical', cVerification: 'Verification', cPayout: 'Payout',
    pNormal: 'Normal', pHigh: 'High', pUrgent: 'Urgent',
    submit: 'Submit ticket', submitting: 'Submitting…', created: 'Ticket created',
    open: 'Open', inProgress: 'In progress', resolved: 'Resolved', closed: 'Closed',
    myTickets: 'My tickets', none: 'No tickets yet. Open one and our team will help.',
    reply: 'Reply', replyPh: 'Type your reply…', send: 'Send', sending: 'Sending…',
    needFields: 'Please add a subject and a message.', loadErr: 'Could not load. Try again.',
    retry: 'Retry', you: 'You', staff: 'Support', noReplies: 'No replies yet.',
  },
  fr: {
    title: 'Support prioritaire', back: 'Retour', newTicket: 'Nouveau ticket',
    subject: 'Sujet', category: 'Catégorie', priority: 'Priorité', message: 'Message',
    cGeneral: 'Général', cBilling: 'Facturation', cTechnical: 'Technique', cVerification: 'Vérification', cPayout: 'Versement',
    pNormal: 'Normale', pHigh: 'Haute', pUrgent: 'Urgente',
    submit: 'Envoyer', submitting: 'Envoi…', created: 'Ticket créé',
    open: 'Ouvert', inProgress: 'En cours', resolved: 'Résolu', closed: 'Fermé',
    myTickets: 'Mes tickets', none: 'Aucun ticket. Ouvrez-en un et notre équipe vous aidera.',
    reply: 'Répondre', replyPh: 'Votre réponse…', send: 'Envoyer', sending: 'Envoi…',
    needFields: 'Ajoutez un sujet et un message.', loadErr: 'Échec du chargement. Réessayez.',
    retry: 'Réessayer', you: 'Vous', staff: 'Support', noReplies: 'Pas encore de réponse.',
  },
  pidgin: {
    title: 'Priority Support', back: 'Back', newTicket: 'New ticket',
    subject: 'Subject', category: 'Category', priority: 'Priority', message: 'Message',
    cGeneral: 'General', cBilling: 'Billing', cTechnical: 'Technical', cVerification: 'Verification', cPayout: 'Payout',
    pNormal: 'Normal', pHigh: 'High', pUrgent: 'Urgent',
    submit: 'Send ticket', submitting: 'E dey send…', created: 'Ticket don open',
    open: 'Open', inProgress: 'Dem dey work', resolved: 'Don solve', closed: 'Don close',
    myTickets: 'My tickets', none: 'No ticket yet. Open one, our team go help you.',
    reply: 'Reply', replyPh: 'Type your reply…', send: 'Send', sending: 'E dey send…',
    needFields: 'Abeg add subject and message.', loadErr: 'E no gree load. Try again.',
    retry: 'Try again', you: 'You', staff: 'Support', noReplies: 'No reply yet.',
  },
  ar: {
    title: 'الدعم ذو الأولوية', back: 'رجوع', newTicket: 'تذكرة جديدة',
    subject: 'الموضوع', category: 'الفئة', priority: 'الأولوية', message: 'الرسالة',
    cGeneral: 'عام', cBilling: 'الفوترة', cTechnical: 'تقني', cVerification: 'التحقق', cPayout: 'الدفع',
    pNormal: 'عادية', pHigh: 'عالية', pUrgent: 'عاجلة',
    submit: 'إرسال', submitting: 'جارٍ الإرسال…', created: 'تم إنشاء التذكرة',
    open: 'مفتوحة', inProgress: 'قيد المعالجة', resolved: 'محلولة', closed: 'مغلقة',
    myTickets: 'تذاكري', none: 'لا توجد تذاكر بعد. افتح واحدة وسيساعدك فريقنا.',
    reply: 'رد', replyPh: 'اكتب ردك…', send: 'إرسال', sending: 'جارٍ الإرسال…',
    needFields: 'أضف موضوعًا ورسالة.', loadErr: 'تعذر التحميل. حاول مجددًا.',
    retry: 'إعادة', you: 'أنت', staff: 'الدعم', noReplies: 'لا ردود بعد.',
  },
  ff: {
    title: 'Ballal Jicci', back: 'Rutto', newTicket: 'Tiket hesere',
    subject: 'Tiitoonde', category: 'Catégorie', priority: 'Jicci', message: 'Nulal',
    cGeneral: 'Huunde fof', cBilling: 'Yoɓɓaari', cTechnical: 'Teknik', cVerification: 'Teeŋtingol', cPayout: 'Yoɓgol',
    pNormal: 'Deƴƴere', pHigh: 'Toownde', pUrgent: 'Heñoraande',
    submit: 'Neldu tiket', submitting: 'Ina neldee…', created: 'Tiket sosaama',
    open: 'Uddita', inProgress: 'Ina golloo', resolved: 'Saɓɓii', closed: 'Uddaama',
    myTickets: 'Tiketaaji am', none: 'Alaa tiket tawo. Uddit gootel, hoore-golle amen ballo ma.',
    reply: 'Jaabo', replyPh: 'Winndu jaabtawol maa…', send: 'Neldu', sending: 'Ina neldee…',
    needFields: 'Ɓeydu tiitoonde e nulal.', loadErr: 'Loowaaki. Eto kadi.',
    retry: 'Eto kadi', you: 'Aan', staff: 'Ballal', noReplies: 'Alaa jaabtawol tawo.',
  },
} as const;
type LS = (typeof L)['en'];
function useL(): { l: LS; isRtl: boolean } {
  const raw = useLang() as string;
  const key = raw === 'fulfulde' ? 'ff' : raw;
  return { l: (L as Record<string, LS>)[key] ?? L.en, isRtl: key === 'ar' };
}

interface Ticket {
  id: string; subject: string; category: string; priority: string; status: string;
  body: string; created_at: string; store_id: string | null;
}
interface Reply { id: string; is_staff: boolean; body: string; created_at: string; }

const statusColor: Record<string, string> = {
  open: 'bg-teal-50 text-teal-700', in_progress: 'bg-amber-50 text-amber-700',
  resolved: 'bg-green-50 text-green-700', closed: 'bg-gray-100 text-gray-500',
};

export default function CorporatePrioritySupport() {
  const navigate = useNavigate();
  const { l, isRtl } = useL();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);

  const [showNew, setShowNew] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('general');
  const [priority, setPriority] = useState('normal');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [openTicket, setOpenTicket] = useState<Ticket | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyBody, setReplyBody] = useState('');
  const [sending, setSending] = useState(false);
  const [threadLoading, setThreadLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { data: auth } = await supabase.auth.getSession();
      const uid = auth?.session?.user?.id;
      if (!uid) { navigate('/login'); return; }
      const mine = await fetchMyStores(uid);
      setStoreId(mine && mine[0] ? mine[0].id : null);
      const { data, error: dbErr } = await supabase
        .from('support_tickets')
        .select('id, subject, category, priority, status, body, created_at, store_id')
        .eq('user_id', uid)
        .order('created_at', { ascending: false });
      if (dbErr) throw new Error(dbErr.message);
      setTickets((data ?? []) as Ticket[]);
    } catch {
      setError(l.loadErr);
    } finally {
      setLoading(false);
    }
  }, [navigate, l.loadErr]);

  useEffect(() => { void load(); }, [load]);

  async function createTicket() {
    if (!subject.trim() || !body.trim()) { setError(l.needFields); return; }
    setSubmitting(true); setError(null);
    try {
      const { data: auth } = await supabase.auth.getSession();
      const uid = auth?.session?.user?.id;
      if (!uid) { navigate('/login'); return; }
      const { data, error: dbErr } = await supabase
        .from('support_tickets')
        .insert({
          user_id: uid, store_id: storeId,
          subject: subject.trim(), category, priority, body: body.trim(), status: 'open',
        })
        .select('id, subject, category, priority, status, body, created_at, store_id')
        .single();
      if (dbErr) throw new Error(dbErr.message);
      setTickets((t) => [data as Ticket, ...t]);
      setShowNew(false); setSubject(''); setBody(''); setCategory('general'); setPriority('normal');
    } catch {
      setError(l.loadErr);
    } finally {
      setSubmitting(false);
    }
  }

  const openThread = useCallback(async (t: Ticket) => {
    setOpenTicket(t); setReplies([]); setThreadLoading(true);
    try {
      const { data } = await supabase
        .from('support_ticket_replies')
        .select('id, is_staff, body, created_at')
        .eq('ticket_id', t.id)
        .order('created_at', { ascending: true });
      setReplies((data ?? []) as Reply[]);
    } finally {
      setThreadLoading(false);
    }
  }, []);

  async function sendReply() {
    if (!openTicket || !replyBody.trim()) return;
    setSending(true);
    try {
      const { data: auth } = await supabase.auth.getSession();
      const uid = auth?.session?.user?.id;
      if (!uid) return;
      const { data, error: dbErr } = await supabase
        .from('support_ticket_replies')
        .insert({ ticket_id: openTicket.id, user_id: uid, is_staff: false, body: replyBody.trim() })
        .select('id, is_staff, body, created_at')
        .single();
      if (dbErr) throw new Error(dbErr.message);
      setReplies((r) => [...r, data as Reply]);
      setReplyBody('');
    } catch {
      /* keep text so user can retry */
    } finally {
      setSending(false);
    }
  }

  const statusLabel = (s: string) =>
    s === 'in_progress' ? l.inProgress : s === 'resolved' ? l.resolved : s === 'closed' ? l.closed : l.open;

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-slate-600"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  // ---- ticket thread view ----
  if (openTicket) {
    return (
      <div className="min-h-screen bg-gray-50 pb-28" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white px-4 pt-5 pb-6">
          <div className="mb-3"><CorporateLogo /></div>
          <button onClick={() => setOpenTicket(null)} className="flex items-center gap-1 text-slate-300 text-sm mb-2">
            <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} /> {l.back}
          </button>
          <h1 className="text-lg font-bold truncate">{openTicket.subject}</h1>
          <span className={`inline-block mt-1 text-[11px] px-2 py-0.5 rounded-full ${statusColor[openTicket.status] ?? statusColor.open}`}>{statusLabel(openTicket.status)}</span>
        </div>

        <div className="max-w-lg mx-auto px-4 -mt-3 space-y-3">
          <div className="bg-white rounded-2xl shadow-sm border p-4">
            <p className="text-xs font-semibold text-gray-400 mb-1">{l.you}</p>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{openTicket.body}</p>
            <p className="text-[11px] text-gray-400 mt-2">{new Date(openTicket.created_at).toLocaleString()}</p>
          </div>

          {threadLoading ? (
            <div className="text-center py-4"><Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" /></div>
          ) : replies.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-2">{l.noReplies}</p>
          ) : replies.map((r) => (
            <div key={r.id} className={`rounded-2xl shadow-sm border p-4 ${r.is_staff ? 'bg-teal-50 border-teal-100' : 'bg-white'}`}>
              <p className="text-xs font-semibold text-gray-400 mb-1">{r.is_staff ? l.staff : l.you}</p>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{r.body}</p>
              <p className="text-[11px] text-gray-400 mt-2">{new Date(r.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>

        <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 p-3" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="max-w-lg mx-auto flex items-end gap-2">
            <textarea rows={1} value={replyBody} onChange={(e) => setReplyBody(e.target.value)} placeholder={l.replyPh}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-300 resize-none" />
            <button onClick={() => void sendReply()} disabled={sending || !replyBody.trim()}
              className="bg-teal-600 text-white p-3 rounded-xl active:scale-95 transition-transform disabled:opacity-50">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- list + new ticket view ----
  return (
    <div className="min-h-screen bg-gray-50 pb-24" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white px-4 pt-5 pb-6">
        <div className="mb-3"><CorporateLogo /></div>
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-slate-300 text-sm mb-2">
          <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} /> {l.back}
        </button>
        <h1 className="text-xl font-bold flex items-center gap-2"><LifeBuoy className="w-5 h-5 text-amber-300" /> {l.title}</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-3 space-y-4">
        <button onClick={() => { setShowNew(true); setError(null); }}
          className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform">
          <Plus className="w-4 h-4" /> {l.newTicket}
        </button>

        {error && !showNew && <p className="text-sm text-red-500 font-medium flex items-center gap-1.5"><AlertCircle className="w-4 h-4" /> {error}
          <button onClick={() => void load()} className="underline ml-1">{l.retry}</button></p>}

        <h3 className="text-sm font-bold text-gray-500 px-1">{l.myTickets}</h3>
        {tickets.length === 0 ? (
          <div className="bg-white rounded-2xl border p-6 text-center text-gray-400 text-sm">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-200" /> {l.none}
          </div>
        ) : (
          <div className="space-y-2">
            {tickets.map((t) => (
              <button key={t.id} onClick={() => void openThread(t)}
                className="w-full text-left bg-white rounded-2xl shadow-sm border p-4 active:scale-[0.99] transition-transform">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-gray-900 text-sm truncate">{t.subject}</p>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap ${statusColor[t.status] ?? statusColor.open}`}>{statusLabel(t.status)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{t.body}</p>
                <p className="text-[11px] text-gray-400 mt-1">{new Date(t.created_at).toLocaleDateString()}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* New ticket sheet */}
      {showNew && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => !submitting && setShowNew(false)}>
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-4 max-h-[90vh] overflow-y-auto" dir={isRtl ? 'rtl' : 'ltr'} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900">{l.newTicket}</h3>
              <button onClick={() => !submitting && setShowNew(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="block text-xs font-semibold text-gray-500 mb-1">{l.subject}</label>
                <input className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-300" value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-semibold text-gray-500 mb-1">{l.category}</label>
                  <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="general">{l.cGeneral}</option><option value="billing">{l.cBilling}</option>
                    <option value="technical">{l.cTechnical}</option><option value="verification">{l.cVerification}</option>
                    <option value="payout">{l.cPayout}</option>
                  </select></div>
                <div><label className="block text-xs font-semibold text-gray-500 mb-1">{l.priority}</label>
                  <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none" value={priority} onChange={(e) => setPriority(e.target.value)}>
                    <option value="normal">{l.pNormal}</option><option value="high">{l.pHigh}</option><option value="urgent">{l.pUrgent}</option>
                  </select></div>
              </div>
              <div><label className="block text-xs font-semibold text-gray-500 mb-1">{l.message}</label>
                <textarea rows={5} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-300" value={body} onChange={(e) => setBody(e.target.value)} /></div>
              {error && <p className="text-sm text-red-500 font-medium flex items-center gap-1.5"><AlertCircle className="w-4 h-4" /> {error}</p>}
              <button onClick={() => void createTicket()} disabled={submitting}
                className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50">
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> {l.submitting}</> : <><Check className="w-4 h-4" /> {l.submit}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <BackToTop rtl={isRtl} />
    </div>
  );
}
// BAMBEH_END_TOKEN__CORPORATEPRIORITYSUPPORT_FIX154__COMPLETE
