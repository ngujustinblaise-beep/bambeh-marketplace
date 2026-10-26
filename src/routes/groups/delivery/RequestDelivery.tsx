// BAMBEH_DEPLOY_TOKEN__REQUESTDELIVERY_FIX876_CLEAN
/**
 * src/routes/groups/delivery/RequestDelivery.tsx - Bambeh Marketplace (route /delivery/request)
 *
 * FIX876 (replaces FIX598) - ASK FOR A DELIVERY, WITHOUT PHONE NUMBERS (Big, 19 Oct 2026: "Request a delivery ... no
 * phone numbers").
 *   - The member never sees the rider's number and the rider never sees the member's: they talk in the Bambeh chat
 *     ("Message the rider", bambeh_delivery_chat_peer - FIX860). The database stops sending numbers too (FIX860).
 *   - The only number on this page is the member's own MTN or Orange Money number, asked for the payment and said to
 *     be for the payment only.
 *   - Paying goes through the payments server like every payment in Bambeh (/collect with the job's own reference,
 *     then the status is followed). The server charges the fee written on the job, never an amount from the phone
 *     (FIX862), and the job opens to riders only once the payment is confirmed.
 *   - A delivery still waiting for payment can be paid again or cancelled. A paid delivery is not cancelled from the
 *     phone: refunds are decided by Bambeh, so the member is pointed to Chat with Bambeh.
 *   - The statuses are words, not codes. The page now follows the app language (it was always English: FIX598 read
 *     the language the wrong way).
 * Kept from FIX598: towns come from the riders themselves (a job no rider can see is never created), the price is
 * shown before anything is asked, a job waits unseen until it is paid.
 * Five languages, right-to-left for Arabic. (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Bike, CheckCircle2, Clock, Loader2, MapPin, MessageCircle, ShieldCheck, XCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';
import { normalizePhone, detectOperator, useCamPay } from '@/hooks/useCamPay';

type TownRow = { region: string; town: string; riders_verified: number; riders_on_duty: number };
type MyRow = {
  id: string; status: string; created_at?: string | null; paid_at?: string | null;
  pickup_area?: string | null; dropoff_area?: string | null; fee_xaf?: number | null;
  payment_ref?: string | null; rider_name?: string | null;
};
type DLang = 'en' | 'fr' | 'pidgin' | 'ar' | 'ff';
type DKey =
  | 'title' | 'lead' | 'place' | 'pick' | 'riders' | 'noRiders' | 'pickup' | 'dropoff' | 'km' | 'notes' | 'noteP'
  | 'noteD' | 'getPrice' | 'youPay' | 'momo' | 'momoHint' | 'send' | 'needAll' | 'badPhone' | 'approve' | 'paidOk'
  | 'payFailed' | 'failed' | 'mine' | 'none' | 'st_AWAITING_PAYMENT' | 'st_OPEN' | 'st_ACCEPTED' | 'st_PICKED_UP'
  | 'st_IN_TRANSIT' | 'st_DELIVERED' | 'st_CANCELLED' | 'st_other' | 'rider' | 'message' | 'payNow' | 'cancel'
  | 'cancelHelp' | 'helpChat' | 'chatFail' | 'back';

const STR: Record<DLang, Record<DKey, string>> = {
  en: {
    title: 'Ask for a delivery', lead: 'Pick the town, where from and where to. You see the price before you pay.',
    place: 'Town', pick: 'Choose a town', riders: 'Riders on duty: {n}', noRiders: 'No rider has joined yet.',
    pickup: 'Where from', dropoff: 'Where to', km: 'Distance in km (optional)', notes: 'Notes for the rider (optional)',
    noteP: 'At pickup', noteD: 'At drop-off', getPrice: 'Show the price', youPay: 'You pay',
    momo: 'Your MTN or Orange Money number', momoHint: 'Only to pay. The rider never sees it: you talk in the Bambeh chat.',
    send: 'Request and pay {fee} F', needAll: 'Choose the town and fill in where from and where to.',
    badPhone: 'Enter your 9-digit MTN or Orange number (6XX XXX XXX).', approve: 'Approve the payment on your phone.',
    paidOk: 'Paid. Riders can see your delivery now.', payFailed: 'The payment did not go through: {why}',
    failed: 'That did not work. Try again.', mine: 'My deliveries', none: 'No delivery yet.',
    st_AWAITING_PAYMENT: 'Waiting for payment', st_OPEN: 'Paid - waiting for a rider', st_ACCEPTED: 'A rider is coming',
    st_PICKED_UP: 'On the way', st_IN_TRANSIT: 'On the way', st_DELIVERED: 'Delivered', st_CANCELLED: 'Cancelled',
    st_other: 'In progress', rider: 'Rider: {name}', message: 'Message the rider', payNow: 'Pay now', cancel: 'Cancel',
    cancelHelp: 'To cancel a paid delivery, write to Bambeh.', helpChat: 'Chat with Bambeh',
    chatFail: 'The chat could not open. Try again.', back: 'Back',
  },
  fr: {
    title: 'Demander une livraison', lead: 'Choisissez la ville, le d\u00e9part et l\u2019arriv\u00e9e. Le prix s\u2019affiche avant le paiement.',
    place: 'Ville', pick: 'Choisissez une ville', riders: 'Livreurs en service : {n}', noRiders: 'Aucun livreur inscrit pour le moment.',
    pickup: 'D\u00e9part', dropoff: 'Arriv\u00e9e', km: 'Distance en km (facultatif)', notes: 'Notes pour le livreur (facultatif)',
    noteP: 'Au d\u00e9part', noteD: '\u00c0 l\u2019arriv\u00e9e', getPrice: 'Afficher le prix', youPay: 'Vous payez',
    momo: 'Votre num\u00e9ro MTN ou Orange Money', momoHint: 'Seulement pour payer. Le livreur ne le voit jamais : vous \u00e9changez dans le chat Bambeh.',
    send: 'Demander et payer {fee} F', needAll: 'Choisissez la ville et indiquez le d\u00e9part et l\u2019arriv\u00e9e.',
    badPhone: 'Entrez votre num\u00e9ro MTN ou Orange \u00e0 9 chiffres (6XX XXX XXX).', approve: 'Validez le paiement sur votre t\u00e9l\u00e9phone.',
    paidOk: 'Pay\u00e9. Les livreurs voient maintenant votre livraison.', payFailed: 'Le paiement n\u2019est pas pass\u00e9 : {why}',
    failed: 'Cela n\u2019a pas march\u00e9. R\u00e9essayez.', mine: 'Mes livraisons', none: 'Aucune livraison pour le moment.',
    st_AWAITING_PAYMENT: 'En attente du paiement', st_OPEN: 'Pay\u00e9 - en attente d\u2019un livreur', st_ACCEPTED: 'Un livreur arrive',
    st_PICKED_UP: 'En route', st_IN_TRANSIT: 'En route', st_DELIVERED: 'Livr\u00e9', st_CANCELLED: 'Annul\u00e9',
    st_other: 'En cours', rider: 'Livreur : {name}', message: '\u00c9crire au livreur', payNow: 'Payer maintenant', cancel: 'Annuler',
    cancelHelp: 'Pour annuler une livraison pay\u00e9e, \u00e9crivez \u00e0 Bambeh.', helpChat: '\u00c9crire \u00e0 Bambeh',
    chatFail: 'Le chat n\u2019a pas pu s\u2019ouvrir. R\u00e9essayez.', back: 'Retour',
  },
  pidgin: {
    title: 'Ask for delivery', lead: 'Choose the town, from where and go where. You go see the price before you pay.',
    place: 'Town', pick: 'Choose one town', riders: 'Riders wey dey work: {n}', noRiders: 'No rider don join yet.',
    pickup: 'From where', dropoff: 'Go where', km: 'How far (km, if you sabi)', notes: 'Talk for the rider (if you want)',
    noteP: 'For pickup', noteD: 'For drop', getPrice: 'Show me the price', youPay: 'You go pay',
    momo: 'Your MTN or Orange Money number', momoHint: 'Na only for pay. Rider no go see am: una go talk for Bambeh chat.',
    send: 'Ask and pay {fee} F', needAll: 'Choose the town, put from where and go where.',
    badPhone: 'Put your 9-number MTN or Orange number (6XX XXX XXX).', approve: 'Approve the payment for your phone.',
    paidOk: 'You don pay. Riders fit see your delivery now.', payFailed: 'The payment no pass: {why}',
    failed: 'E no work. Try again.', mine: 'My delivery', none: 'No delivery yet.',
    st_AWAITING_PAYMENT: 'E dey wait payment', st_OPEN: 'You don pay - e dey wait rider', st_ACCEPTED: 'Rider dey come',
    st_PICKED_UP: 'E dey road', st_IN_TRANSIT: 'E dey road', st_DELIVERED: 'E don reach', st_CANCELLED: 'E don cancel',
    st_other: 'E dey go on', rider: 'Rider: {name}', message: 'Message the rider', payNow: 'Pay now', cancel: 'Cancel',
    cancelHelp: 'If you want cancel delivery wey you don pay, write Bambeh.', helpChat: 'Chat with Bambeh',
    chatFail: 'The chat no fit open. Try again.', back: 'Go back',
  },
  ar: {
    title: '\u0627\u0637\u0644\u0628 \u062a\u0648\u0635\u064a\u0644\u0629', lead: '\u0627\u062e\u062a\u0631 \u0627\u0644\u0628\u0644\u062f\u0629 \u0648\u0645\u0646 \u0623\u064a\u0646 \u0648\u0625\u0644\u0649 \u0623\u064a\u0646. \u064a\u0638\u0647\u0631 \u0627\u0644\u0633\u0639\u0631 \u0642\u0628\u0644 \u0627\u0644\u062f\u0641\u0639.',
    place: '\u0627\u0644\u0628\u0644\u062f\u0629', pick: '\u0627\u062e\u062a\u0631 \u0628\u0644\u062f\u0629', riders: '\u0627\u0644\u0631\u0627\u0643\u0628\u0648\u0646 \u0641\u064a \u0627\u0644\u062e\u062f\u0645\u0629: {n}', noRiders: '\u0644\u0645 \u064a\u0646\u0636\u0645 \u0623\u064a \u0631\u0627\u0643\u0628 \u0628\u0639\u062f.',
    pickup: '\u0645\u0646 \u0623\u064a\u0646', dropoff: '\u0625\u0644\u0649 \u0623\u064a\u0646', km: '\u0627\u0644\u0645\u0633\u0627\u0641\u0629 \u0628\u0627\u0644\u0643\u064a\u0644\u0648\u0645\u062a\u0631 (\u0627\u062e\u062a\u064a\u0627\u0631\u064a)', notes: '\u0645\u0644\u0627\u062d\u0638\u0627\u062a \u0644\u0644\u0631\u0627\u0643\u0628 (\u0627\u062e\u062a\u064a\u0627\u0631\u064a)',
    noteP: '\u0639\u0646\u062f \u0627\u0644\u0627\u0633\u062a\u0644\u0627\u0645', noteD: '\u0639\u0646\u062f \u0627\u0644\u062a\u0633\u0644\u064a\u0645', getPrice: '\u0627\u0639\u0631\u0636 \u0627\u0644\u0633\u0639\u0631', youPay: '\u062a\u062f\u0641\u0639',
    momo: '\u0631\u0642\u0645 MTN \u0623\u0648 Orange Money \u0627\u0644\u062e\u0627\u0635 \u0628\u0643', momoHint: '\u0644\u0644\u062f\u0641\u0639 \u0641\u0642\u0637. \u0644\u0627 \u064a\u0631\u0627\u0647 \u0627\u0644\u0631\u0627\u0643\u0628 \u0623\u0628\u062f\u064b\u0627: \u062a\u062a\u062d\u062f\u062b\u0627\u0646 \u0641\u064a \u062f\u0631\u062f\u0634\u0629 Bambeh.',
    send: '\u0627\u0637\u0644\u0628 \u0648\u0627\u062f\u0641\u0639 {fee} \u0641\u0631\u0646\u0643', needAll: '\u0627\u062e\u062a\u0631 \u0627\u0644\u0628\u0644\u062f\u0629 \u0648\u0627\u0643\u062a\u0628 \u0645\u0646 \u0623\u064a\u0646 \u0648\u0625\u0644\u0649 \u0623\u064a\u0646.',
    badPhone: '\u0623\u062f\u062e\u0644 \u0631\u0642\u0645 MTN \u0623\u0648 Orange \u0645\u0646 9 \u0623\u0631\u0642\u0627\u0645 (6XX XXX XXX).', approve: '\u0648\u0627\u0641\u0642 \u0639\u0644\u0649 \u0627\u0644\u062f\u0641\u0639 \u0639\u0644\u0649 \u0647\u0627\u062a\u0641\u0643.',
    paidOk: '\u062a\u0645 \u0627\u0644\u062f\u0641\u0639. \u064a\u0631\u0649 \u0627\u0644\u0631\u0627\u0643\u0628\u0648\u0646 \u0637\u0644\u0628\u0643 \u0627\u0644\u0622\u0646.', payFailed: '\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u062f\u0641\u0639: {why}',
    failed: '\u0644\u0645 \u062a\u0646\u062c\u062d \u0627\u0644\u0639\u0645\u0644\u064a\u0629. \u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.', mine: '\u0637\u0644\u0628\u0627\u062a\u064a', none: '\u0644\u0627 \u062a\u0648\u062c\u062f \u0637\u0644\u0628\u0627\u062a \u0628\u0639\u062f.',
    st_AWAITING_PAYMENT: '\u0628\u0627\u0646\u062a\u0638\u0627\u0631 \u0627\u0644\u062f\u0641\u0639', st_OPEN: '\u0645\u062f\u0641\u0648\u0639 - \u0628\u0627\u0646\u062a\u0638\u0627\u0631 \u0631\u0627\u0643\u0628', st_ACCEPTED: '\u0631\u0627\u0643\u0628 \u0641\u064a \u0627\u0644\u0637\u0631\u064a\u0642 \u0625\u0644\u064a\u0643',
    st_PICKED_UP: '\u0641\u064a \u0627\u0644\u0637\u0631\u064a\u0642', st_IN_TRANSIT: '\u0641\u064a \u0627\u0644\u0637\u0631\u064a\u0642', st_DELIVERED: '\u062a\u0645 \u0627\u0644\u062a\u0633\u0644\u064a\u0645', st_CANCELLED: '\u0623\u064f\u0644\u063a\u064a',
    st_other: '\u0642\u064a\u062f \u0627\u0644\u062a\u0646\u0641\u064a\u0630', rider: '\u0627\u0644\u0631\u0627\u0643\u0628: {name}', message: '\u0631\u0627\u0633\u0644 \u0627\u0644\u0631\u0627\u0643\u0628', payNow: '\u0627\u062f\u0641\u0639 \u0627\u0644\u0622\u0646', cancel: '\u0625\u0644\u063a\u0627\u0621',
    cancelHelp: '\u0644\u0625\u0644\u063a\u0627\u0621 \u062a\u0648\u0635\u064a\u0644\u0629 \u0645\u062f\u0641\u0648\u0639\u0629\u060c \u0631\u0627\u0633\u0644 Bambeh.', helpChat: '\u062a\u062d\u062f\u062b \u0645\u0639 Bambeh',
    chatFail: '\u062a\u0639\u0630\u0631 \u0641\u062a\u062d \u0627\u0644\u062f\u0631\u062f\u0634\u0629. \u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.', back: '\u0631\u062c\u0648\u0639',
  },
  ff: {
    title: 'Nodda roondoowo', lead: 'Su\u0253o saare, refti iwde e haa. Coggu ana hollire haa a yo\u0253\u0253a.',
    place: 'Saare', pick: 'Su\u0253o saare', riders: 'Roondoo\u0253e ina golla: {n}', noRiders: 'Alaa roondoowo e saare \u0257oo tawo',
    pickup: 'Iwde', dropoff: 'Haa', km: 'Njuu\u0257eendi km (so wo\u0257i)', notes: 'Ciimtol ngam roondoowo (so a yi\u0257ii)',
    noteP: 'Ciimtol jogogol', noteD: 'Ciimtol rokkugol', getPrice: 'Hollu coggu', youPay: 'A yo\u0253\u0253ata',
    momo: 'Limngal MTN walla Orange Money maa', momoHint: 'Ngam yo\u0253gol tan. Roondoowo yiyataa ngal.',
    send: 'Nodda e yo\u0253\u0253u {fee} F', needAll: 'Timmin fof',
    badPhone: 'Naatnu limngal MTN walla Orange maa limor\u0257e 9 (6XX XXX XXX).', approve: 'Jaawto yo\u0253gol e telefon maa.',
    paidOk: 'Yo\u0253aama. Roondoo\u0253e ina njiya nodde maa jooni.', payFailed: 'Yo\u0253gol waasii: {why}',
    failed: 'Waasii. Eto go\u0257\u0257o laawol.', mine: 'Nodde am', none: 'Alaa nodde tawo',
    st_AWAITING_PAYMENT: 'Ina habba yo\u0253gol', st_OPEN: 'Yo\u0253aama - ina habba roondoowo', st_ACCEPTED: 'Roondoowo ina ara',
    st_PICKED_UP: 'Ina e laawol', st_IN_TRANSIT: 'Ina e laawol', st_DELIVERED: 'Yottaama', st_CANCELLED: 'Haaytaama',
    st_other: 'Ina yaha', rider: 'Roondoowo: {name}', message: 'Winndan roondoowo', payNow: 'Yo\u0253 jooni', cancel: 'Haaytu',
    cancelHelp: 'Ngam haaytude nodde yo\u0253aande, winndan Bambeh.', helpChat: 'Winndan Bambeh',
    chatFail: 'Chat \u0257am udditaaki. Eto kadi.', back: 'Rutto',
  },
};

function dLang(raw: unknown): DLang {
  const v = String(raw ?? 'en').toLowerCase();
  if (v === 'fr' || v.indexOf('fr-') === 0) return 'fr';
  if (v === 'pidgin' || v === 'pcm' || v === 'pid') return 'pidgin';
  if (v === 'ar' || v.indexOf('ar-') === 0) return 'ar';
  if (v === 'ff' || v === 'ful' || v === 'fulfulde') return 'ff';
  return 'en';
}
function fill(s: string, vals: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (m, k) => (k in vals ? String(vals[k]) : m));
}
function money(n: unknown): string {
  return Math.round(Number(n) || 0).toLocaleString('fr-FR').replace(/\u202f|\u00a0/g, ' ');
}
/** 9 digits of an MTN or Orange number, or null. */
function momo9(raw: string): string | null {
  const d = normalizePhone(raw || '');
  return d.length === 9 && detectOperator(d) ? d : null;
}
const WITH_RIDER = ['ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'];

export default function RequestDelivery() {
  const lang = dLang(useLang());
  const t = STR[lang];
  const rtl = lang === 'ar';
  const navigate = useNavigate();

  const [towns, setTowns]   = useState<TownRow[]>([]);
  const [mine, setMine]     = useState<MyRow[]>([]);
  const [place, setPlace]   = useState('');      // "region|town"
  const [pickup, setPickup] = useState('');
  const [drop, setDrop]     = useState('');
  const [phone, setPhone]   = useState('');
  const [noteP, setNoteP]   = useState('');
  const [noteD, setNoteD]   = useState('');
  const [km, setKm]         = useState('');
  const [quote, setQuote]   = useState<number | null>(null);
  const [busy, setBusy]     = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [okMsg, setOkMsg]   = useState<string | null>(null);
  const [payFor, setPayFor] = useState<string | null>(null);   // a job waiting for payment, being paid again
  const [chatting, setChatting] = useState<string | null>(null);

  const [region, town] = place ? place.split('|') : ['', ''];

  const load = useCallback(async () => {
    try {
      const [a, b] = await Promise.all([
        supabase.rpc('bambeh_delivery_towns'),
        supabase.rpc('bambeh_delivery_my_requests'),
      ]);
      setTowns(Array.isArray(a.data) ? (a.data as TownRow[]) : []);
      setMine(Array.isArray(b.data) ? (b.data as MyRow[]) : []);
    } catch {
      setTowns([]);
      setMine([]);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const cam = useCamPay({
    onSuccess: async () => {
      setError(null);
      setOkMsg(t.paidOk);
      setPayFor(null);
      await load();
    },
    onFailure: (why: string) => {
      setOkMsg(null);
      setError(fill(t.payFailed, { why }));
      void load();
    },
  });
  const paying = cam.status === 'submitting' || cam.status === 'waiting';

  /* Any edit invalidates a price the person may be looking at. Showing a stale
     quote next to a changed address is how people end up feeling cheated. */
  const dirty = () => { setQuote(null); setOkMsg(null); };

  const askPrice = async () => {
    setError(null);
    if (!region || !town || !pickup.trim() || !drop.trim()) { setError(t.needAll); return; }
    setBusy(true);
    try {
      const { data, error: e } = await supabase.rpc('bambeh_delivery_quote', {
        p_region: region, p_from_area: pickup.trim(),
        p_to_area: drop.trim(), p_distance_km: km ? Number(km) : null,
      });
      if (e) throw e;
      const q = data as { ok?: boolean; fee_xaf?: number; reason?: string } | null;
      if (q && q.ok) setQuote(Number(q.fee_xaf ?? 0));
      else { setQuote(null); setError(t.failed); }
    } catch {
      setError(t.failed);
    } finally {
      setBusy(false);
    }
  };

  const payJob = (fee: number, ref: string, from: string, to: string) => {
    const p9 = momo9(phone);
    if (!p9) { setError(t.badPhone); return; }
    setError(null);
    setOkMsg(t.approve);
    void cam.initPayment({
      amount: fee, phone: p9, externalRef: ref,
      description: 'Bambeh delivery ' + from + ' to ' + to,
    });
  };

  const submit = async () => {
    setError(null);
    setOkMsg(null);
    if (!region || !town || !pickup.trim() || !drop.trim()) { setError(t.needAll); return; }
    const p9 = momo9(phone);
    if (!p9) { setError(t.badPhone); return; }

    setBusy(true);
    try {
      const { data, error: e } = await supabase.rpc('bambeh_delivery_request', {
        p_region: region, p_town: town,
        p_pickup_area: pickup.trim(), p_dropoff_area: drop.trim(),
        p_contact_phone: p9,
        p_pickup_note: noteP.trim() || null,
        p_dropoff_note: noteD.trim() || null,
        p_distance_km: km ? Number(km) : null,
      });
      if (e) throw e;
      const r = data as { ok?: boolean; reason?: string; fee_xaf?: number; payment_ref?: string } | null;
      if (!r || !r.ok || !r.payment_ref) { setError(t.failed); return; }

      /* The job exists but is AWAITING_PAYMENT and no rider can see it. Now pay, with the job's own reference, so
         the payments server charges the fee written on the job and the database opens it once paid. */
      const from = pickup.trim();
      const to = drop.trim();
      setQuote(null);
      setPickup(''); setDrop(''); setNoteP(''); setNoteD(''); setKm('');
      await load();
      payJob(Number(r.fee_xaf ?? 0), r.payment_ref, from, to);
    } catch {
      setError(t.failed);
    } finally {
      setBusy(false);
    }
  };

  const cancel = async (id: string) => {
    setBusy(true);
    setError(null);
    try {
      const { data, error: e } = await supabase.rpc('bambeh_delivery_cancel', { p_job_id: id });
      if (e) throw e;
      const r = data as { ok?: boolean; reason?: string } | null;
      if (r && r.ok === false) setError(t.failed);
      await load();
    } catch {
      setError(t.failed);
    } finally {
      setBusy(false);
    }
  };

  const messageRider = async (m: MyRow) => {
    setChatting(m.id);
    setError(null);
    try {
      const { data, error: e } = await supabase.rpc('bambeh_delivery_chat_peer', { p_job: m.id });
      const r = data as { ok?: boolean; user_id?: string } | null;
      if (e || !r || !r.ok || !r.user_id) { setError(t.chatFail); return; }
      navigate('/chat?userId=' + encodeURIComponent(r.user_id)
        + '&listingTitle=' + encodeURIComponent((m.pickup_area || '') + ' > ' + (m.dropoff_area || '')));
    } catch {
      setError(t.chatFail);
    } finally {
      setChatting(null);
    }
  };

  const statusWord = (s: string) => {
    const k = ('st_' + String(s || '').toUpperCase()) as DKey;
    return (t as Record<string, string>)[k] || t.st_other;
  };
  const chip = (s: string) => {
    if (s === 'AWAITING_PAYMENT') return 'bg-amber-50 text-amber-800';
    if (s === 'DELIVERED')        return 'bg-green-50 text-green-700';
    if (s === 'CANCELLED')        return 'bg-gray-100 text-gray-600';
    return 'bg-teal-50 text-teal-800';
  };

  const field = 'mt-1.5 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-[15px] outline-none focus:border-teal-800 focus:ring-2 focus:ring-teal-800/15';

  return (
    <div className="min-h-screen bg-gray-50 pb-24 text-gray-900" dir={rtl ? 'rtl' : 'ltr'} data-fix="FIX876">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500">
          <ArrowLeft className={'h-4 w-4 ' + (rtl ? 'rotate-180' : '')} aria-hidden="true" /> {t.back}
        </Link>

        <h1 className="text-2xl font-extrabold tracking-tight" data-title="1">{t.title}</h1>
        <p className="mt-1 text-sm text-gray-600">{t.lead}</p>

        {error ? (
          <div className="mt-4 flex items-start gap-2 rounded-2xl border border-red-200 bg-white p-3 text-sm text-red-700" role="alert" data-error="1">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> {error}
          </div>
        ) : null}
        {okMsg ? (
          <div className="mt-4 flex items-start gap-2 rounded-2xl bg-teal-50 p-3 text-sm text-teal-900" role="status" data-ok="1">
            {paying ? <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
              : <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />} {okMsg}
          </div>
        ) : null}

        <section className="mt-5 rounded-3xl border border-gray-100 bg-white p-5" data-form="1">
          <label className="block text-sm font-semibold">
            {t.place}
            <select value={place} onChange={(e) => { setPlace(e.target.value); dirty(); }} className={field} data-place="1">
              <option value="">{t.pick}</option>
              {towns.map((r) => (
                <option key={r.region + '|' + r.town} value={r.region + '|' + r.town}>
                  {r.town}, {r.region} - {fill(t.riders, { n: Number(r.riders_on_duty) || 0 })}
                </option>
              ))}
            </select>
          </label>
          {towns.length === 0 ? (
            <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-amber-800" data-no-riders="1">
              <Bike className="h-3.5 w-3.5" aria-hidden="true" /> {t.noRiders}
            </p>
          ) : null}

          <label className="mt-4 block text-sm font-semibold">
            {t.pickup}
            <input value={pickup} onChange={(e) => { setPickup(e.target.value.slice(0, 120)); dirty(); }} className={field} data-pickup="1" />
          </label>
          <label className="mt-3 block text-sm font-semibold">
            {t.dropoff}
            <input value={drop} onChange={(e) => { setDrop(e.target.value.slice(0, 120)); dirty(); }} className={field} data-dropoff="1" />
          </label>

          <details className="mt-3 rounded-2xl border border-gray-100 px-4 py-2" data-more="1">
            <summary className="cursor-pointer py-1 text-sm font-semibold text-gray-600">{t.notes}</summary>
            <label className="mt-2 block text-sm">
              {t.km}
              <input value={km} inputMode="decimal" dir="ltr"
                     onChange={(e) => { setKm(e.target.value.replace(/[^0-9.]/g, '').slice(0, 6)); dirty(); }} className={field} data-km="1" />
            </label>
            <label className="mt-3 block text-sm">
              {t.noteP}
              <input value={noteP} onChange={(e) => setNoteP(e.target.value.slice(0, 200))} className={field} data-note-p="1" />
            </label>
            <label className="mb-2 mt-3 block text-sm">
              {t.noteD}
              <input value={noteD} onChange={(e) => setNoteD(e.target.value.slice(0, 200))} className={field} data-note-d="1" />
            </label>
          </details>

          {quote === null ? (
            <button type="button" disabled={busy} onClick={() => void askPrice()} data-get-price="1"
                    className="mt-5 min-h-[48px] w-full rounded-full border border-teal-800 bg-white px-4 py-3 text-sm font-bold text-teal-800 disabled:opacity-40">
              {busy ? <Loader2 className="mx-auto h-5 w-5 animate-spin" aria-hidden="true" /> : t.getPrice}
            </button>
          ) : (
            <>
              <div className="mt-5 rounded-2xl bg-teal-50 p-4 text-center">
                <p className="text-xs font-bold uppercase tracking-wide text-teal-800">{t.youPay}</p>
                <p className="text-3xl font-extrabold text-teal-900" dir="ltr" data-quote={quote}>{money(quote)} F</p>
              </div>
              <label className="mt-4 block text-sm font-semibold">
                {t.momo}
                <input value={phone} inputMode="tel" placeholder="6XX XXX XXX" dir="ltr" autoComplete="tel"
                       onChange={(e) => setPhone(e.target.value.replace(/[^0-9 +]/g, '').slice(0, 16))} className={field} data-momo="1" />
              </label>
              <p className="mt-1.5 flex items-start gap-1.5 text-xs text-gray-500">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" /> {t.momoHint}
              </p>
              <button type="button" disabled={busy || paying} onClick={() => void submit()} data-send="1"
                      className="mt-4 min-h-[48px] w-full rounded-full bg-teal-800 px-4 py-3 text-sm font-extrabold text-white disabled:opacity-40">
                {busy || paying ? <Loader2 className="mx-auto h-5 w-5 animate-spin" aria-hidden="true" /> : fill(t.send, { fee: money(quote) })}
              </button>
            </>
          )}
        </section>

        <h2 className="mt-8 text-lg font-extrabold">{t.mine}</h2>
        {mine.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500" data-none="1">{t.none}</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {mine.map((m) => {
              const st = String(m.status || '').toUpperCase();
              return (
                <li key={m.id} className="rounded-2xl border border-gray-100 bg-white p-4" data-job={m.id} data-status={st}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="min-w-0 text-sm font-semibold">
                      <MapPin className="me-1 inline h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
                      {m.pickup_area}{rtl ? ' \u2190 ' : ' \u2192 '}{m.dropoff_area}
                    </p>
                    <span className={'shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ' + chip(st)}>{statusWord(st)}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500" dir="ltr">
                    {money(m.fee_xaf)} F{m.paid_at ? <> - <CheckCircle2 className="inline h-3 w-3 text-green-700" aria-hidden="true" /></> : null}
                  </p>
                  {m.rider_name && WITH_RIDER.indexOf(st) >= 0 ? (
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-gray-800">
                        {fill(t.rider, { name: m.rider_name })}
                      </p>
                      <button type="button" onClick={() => void messageRider(m)} disabled={chatting === m.id} data-chat-rider={m.id}
                              className="inline-flex items-center gap-1.5 rounded-full border border-teal-800 px-3 py-1.5 text-xs font-bold text-teal-800 disabled:opacity-50">
                        <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" /> {t.message}
                      </button>
                    </div>
                  ) : null}
                  {st === 'AWAITING_PAYMENT' && payFor === m.id ? (
                    <div className="mt-3 space-y-2" data-pay-panel={m.id}>
                      <label className="block text-xs font-semibold">
                        {t.momo}
                        <input value={phone} inputMode="tel" placeholder="6XX XXX XXX" dir="ltr" autoComplete="tel"
                               onChange={(e) => setPhone(e.target.value.replace(/[^0-9 +]/g, '').slice(0, 16))} className={field} data-momo-again={m.id} />
                      </label>
                      <p className="text-[11px] text-gray-500">{t.momoHint}</p>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" disabled={busy || paying} data-pay-go={m.id}
                                onClick={() => payJob(Number(m.fee_xaf), String(m.payment_ref), String(m.pickup_area || ''), String(m.dropoff_area || ''))}
                                className="rounded-full bg-teal-800 px-4 py-2 text-xs font-extrabold text-white disabled:opacity-40">
                          {fill(t.send, { fee: money(m.fee_xaf) })}
                        </button>
                        <button type="button" onClick={() => setPayFor(null)} className="rounded-full border border-gray-300 px-3.5 py-2 text-xs font-bold text-gray-700">
                          {t.cancel}
                        </button>
                      </div>
                    </div>
                  ) : st === 'AWAITING_PAYMENT' ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {m.payment_ref && Number(m.fee_xaf) > 0 ? (
                        <button type="button" disabled={busy || paying} data-pay-again={m.id}
                                onClick={() => { setPayFor(m.id); setError(null); }}
                                className="rounded-full border border-teal-800 px-3.5 py-1.5 text-xs font-bold text-teal-800 disabled:opacity-40">
                          {t.payNow}
                        </button>
                      ) : null}
                      <button type="button" disabled={busy || paying} onClick={() => void cancel(m.id)} data-cancel={m.id}
                              className="rounded-full border border-gray-300 px-3.5 py-1.5 text-xs font-bold text-gray-700 disabled:opacity-40">
                        {t.cancel}
                      </button>
                    </div>
                  ) : st === 'OPEN' || st === 'ACCEPTED' ? (
                    <p className="mt-3 text-xs text-gray-500" data-cancel-help={m.id}>
                      {t.cancelHelp}{' '}
                      <Link to="/help/chat" className="font-bold text-teal-800 underline">{t.helpChat}</Link>
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__REQUESTDELIVERY_FIX876__COMPLETE
