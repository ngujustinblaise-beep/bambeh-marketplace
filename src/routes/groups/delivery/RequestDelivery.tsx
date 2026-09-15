// BAMBEH_DEPLOY_TOKEN__REQUESTDELIVERY_FIX598_CLEAN
/**
 * src/routes/groups/delivery/RequestDelivery.tsx - Bambeh Marketplace
 *
 * FIX598 - the missing half of dispatch. Everything downstream of this screen
 * was built and proved by the FIX596 self-test, and none of it could ever run
 * because nobody had a way to ask for a delivery.
 *
 * THE ORDER OF THINGS, and why it is this way:
 *   1. pick a town that HAS a verified rider. Towns come from the courier rows
 *      themselves, so the region/town strings match exactly. A typed "Yaounde"
 *      without the accent would create a job no rider can ever see, take the
 *      money, and fail silently. That is the bug this ordering removes.
 *   2. see the price BEFORE committing. bambeh_delivery_quote is read-only.
 *   3. create the job. It lands as AWAITING_PAYMENT, invisible to riders.
 *   4. pay. The CamPay prompt goes to the phone; the payments webhook flips the
 *      row to SUCCESSFUL and a database trigger opens the job to riders.
 *
 * So the rider only ever sees work that is already paid for, and the requester
 * never pays for a delivery nobody can take.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Bike, CheckCircle, Clock, Loader2, MapPin, Phone, ShieldCheck, XCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';

type TownRow = { region: string; town: string; riders_verified: number; riders_on_duty: number };
type MyRow = {
  id: string; status: string; created_at?: string | null; paid_at?: string | null;
  pickup_area?: string | null; dropoff_area?: string | null; fee_xaf?: number | null;
  payment_ref?: string | null; rider_name?: string | null; rider_phone?: string | null;
  rider_vehicle?: string | null;
};

type Dict = {
  title: string; lead: string; region: string; town: string; pickup: string; dropoff: string;
  phone: string; noteP: string; noteD: string; km: string; getPrice: string; price: string;
  youPay: string; send: string; paying: string; awaiting: string; paid: string; mine: string;
  none: string; cancel: string; rider: string; noRiders: string; needAll: string; failed: string;
};

const STR: Record<string, Dict> = {
  en: {
    title: 'Ask for a delivery', lead: 'Pick the town, then where from and where to. The price shows before you pay.',
    region: 'Region', town: 'Town', pickup: 'Where from', dropoff: 'Where to',
    phone: 'A number the rider can call', noteP: 'Note for pickup', noteD: 'Note for drop-off',
    km: 'Distance in km (optional)', getPrice: 'Show the price', price: 'Price',
    youPay: 'You pay', send: 'Request and pay', paying: 'Sending...',
    awaiting: 'Waiting for payment - approve the prompt on your phone',
    paid: 'Paid - a rider will pick it up', mine: 'My deliveries', none: 'No deliveries yet',
    cancel: 'Cancel', rider: 'Rider', noRiders: 'No rider in this town yet',
    needAll: 'Fill everything in', failed: 'That did not work. Try again.',
  },
  fr: {
    title: 'Demander une livraison', lead: 'Choisissez la ville, puis le depart et l\u2019arrivee. Le prix s\u2019affiche avant le paiement.',
    region: 'R\u00e9gion', town: 'Ville', pickup: 'D\u00e9part', dropoff: 'Arriv\u00e9e',
    phone: 'Un num\u00e9ro que le livreur peut appeler', noteP: 'Note pour le d\u00e9part', noteD: 'Note pour l\u2019arriv\u00e9e',
    km: 'Distance en km (optionnel)', getPrice: 'Afficher le prix', price: 'Prix',
    youPay: 'Vous payez', send: 'Demander et payer', paying: 'Envoi...',
    awaiting: 'En attente du paiement - validez sur votre t\u00e9l\u00e9phone',
    paid: 'Pay\u00e9 - un livreur va le prendre', mine: 'Mes livraisons', none: 'Aucune livraison',
    cancel: 'Annuler', rider: 'Livreur', noRiders: 'Aucun livreur dans cette ville',
    needAll: 'Remplissez tout', failed: 'Cela n\u2019a pas march\u00e9. R\u00e9essayez.',
  },
  pcm: {
    title: 'Ask for delivery', lead: 'Choose the town, then from where go where. You go see the price before you pay.',
    region: 'Region', town: 'Town', pickup: 'From where', dropoff: 'Go where',
    phone: 'Number wey the rider go call', noteP: 'Note for pickup', noteD: 'Note for drop',
    km: 'How far (km, if you sabi)', getPrice: 'Show me the price', price: 'Price',
    youPay: 'You pay', send: 'Ask and pay', paying: 'E dey go...',
    awaiting: 'Dem dey wait your payment - approve am on your phone',
    paid: 'You done pay - rider go come take am', mine: 'My delivery', none: 'No delivery yet',
    cancel: 'Cancel', rider: 'Rider', noRiders: 'No rider dey this town yet',
    needAll: 'Fill everything', failed: 'E no work. Try again.',
  },
  ar: {
    title: '\u0627\u0637\u0644\u0628 \u062A\u0648\u0635\u064A\u0644\u0629',
    lead: '\u0627\u062E\u062A\u0631 \u0627\u0644\u0628\u0644\u062F\u0629\u060C \u062B\u0645 \u0645\u0646 \u0623\u064A\u0646 \u0648\u0625\u0644\u0649 \u0623\u064A\u0646. \u0627\u0644\u0633\u0639\u0631 \u064A\u0638\u0647\u0631 \u0642\u0628\u0644 \u0627\u0644\u062F\u0641\u0639.',
    region: '\u0627\u0644\u0645\u0646\u0637\u0642\u0629',
    town: '\u0627\u0644\u0628\u0644\u062F\u0629',
    pickup: '\u0645\u0646 \u0623\u064A\u0646',
    dropoff: '\u0625\u0644\u0649 \u0623\u064A\u0646',
    phone: '\u0631\u0642\u0645 \u0644\u0644\u0627\u062A\u0635\u0627\u0644',
    noteP: '\u0645\u0644\u0627\u062D\u0638\u0629 \u0639\u0646\u062F \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645',
    noteD: '\u0645\u0644\u0627\u062D\u0638\u0629 \u0639\u0646\u062F \u0627\u0644\u062A\u0633\u0644\u064A\u0645',
    km: '\u0627\u0644\u0645\u0633\u0627\u0641\u0629 \u0628\u0627\u0644\u0643\u064A\u0644\u0648\u0645\u062A\u0631 (\u0627\u062E\u062A\u064A\u0627\u0631\u064A)',
    getPrice: '\u0627\u0639\u0631\u0636 \u0627\u0644\u0633\u0639\u0631',
    price: '\u0627\u0644\u0633\u0639\u0631',
    youPay: '\u0623\u0646\u062A \u062A\u062F\u0641\u0639',
    send: '\u0627\u0637\u0644\u0628 \u0648\u0627\u062F\u0641\u0639',
    paying: '\u062C\u0627\u0631\u064D \u0627\u0644\u0625\u0631\u0633\u0627\u0644...',
    awaiting: '\u0641\u064A \u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u062F\u0641\u0639 - \u0648\u0627\u0641\u0642 \u0639\u0644\u0649 \u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u0639\u0644\u0649 \u0647\u0627\u062A\u0641\u0643',
    paid: '\u062A\u0645 \u0627\u0644\u062F\u0641\u0639 - \u0631\u0627\u0643\u0628 \u0633\u064A\u0623\u062E\u0630\u0647\u0627',
    mine: '\u0637\u0644\u0628\u0627\u062A\u064A',
    none: '\u0644\u0627 \u062A\u0648\u062C\u062F \u0637\u0644\u0628\u0627\u062A \u0628\u0639\u062F',
    cancel: '\u0625\u0644\u063A\u0627\u0621',
    rider: '\u0627\u0644\u0631\u0627\u0643\u0628',
    noRiders: '\u0644\u0627 \u064A\u0648\u062C\u062F \u0631\u0627\u0643\u0628 \u0641\u064A \u0647\u0630\u0647 \u0627\u0644\u0628\u0644\u062F\u0629 \u0628\u0639\u062F',
    needAll: '\u0623\u0643\u0645\u0644 \u0643\u0644 \u0627\u0644\u062D\u0642\u0648\u0644',
    failed: '\u0644\u0645 \u062A\u0646\u062C\u062D. \u062D\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062E\u0631\u0649.',
  },
  ff: {
    title: 'Nodda roondoowo',
    lead: 'Su\u0253o saare, refti iwde e haa. Coggu ana hollire haa a yo\u0253\u0253a.',
    region: 'Diiwaan',
    town: 'Saare',
    pickup: 'Iwde',
    dropoff: 'Haa',
    phone: 'Limngal noddirgal',
    noteP: 'Ciimtol jogogol',
    noteD: 'Ciimtol rokkugol',
    km: 'Njuu\u0257eendi km (so wo\u0257i)',
    getPrice: 'Hollu coggu',
    price: 'Coggu',
    youPay: 'A yo\u0253\u0253ata',
    send: 'Nodda e yo\u0253\u0253u',
    paying: 'Ena neldee...',
    awaiting: 'Ena habbii yo\u0253\u0253ugol - jaawto e telefon maa',
    paid: 'Yo\u0253aama - roondoowo ana ara',
    mine: 'Nodde am',
    none: 'Alaa nodde tawo',
    cancel: 'Haaytu',
    rider: 'Roondoowo',
    noRiders: 'Alaa roondoowo e saare \u0257oo tawo',
    needAll: 'Timmin fof',
    failed: 'Waasii. Eto go\u0257\u0257o laawol.',
  },
};

export default function RequestDelivery() {
  const { lang } = useLang();
  const t = useMemo<Dict>(() => {
    const key = ({ pidgin: 'pcm', pid: 'pcm', ful: 'ff' } as Record<string, string>)[String(lang)]
      || String(lang);
    return STR[key] || STR.en;
  }, [lang]);

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
      else { setQuote(null); setError(q?.reason || t.failed); }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.failed);
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    setError(null);
    setOkMsg(null);
    const digits = phone.replace(/[^0-9]/g, '');
    if (!region || !town || !pickup.trim() || !drop.trim()) { setError(t.needAll); return; }
    if (digits.length !== 9 && digits.length !== 12) { setError(t.phone); return; }

    setBusy(true);
    try {
      const { data, error: e } = await supabase.rpc('bambeh_delivery_request', {
        p_region: region, p_town: town,
        p_pickup_area: pickup.trim(), p_dropoff_area: drop.trim(),
        p_contact_phone: digits,
        p_pickup_note: noteP.trim() || null,
        p_dropoff_note: noteD.trim() || null,
        p_distance_km: km ? Number(km) : null,
      });
      if (e) throw e;

      const r = data as {
        ok?: boolean; reason?: string; fee_xaf?: number; payment_ref?: string;
      } | null;
      if (!r || !r.ok) { setError(r?.reason || t.failed); return; }

      /* The job exists but is AWAITING_PAYMENT and no rider can see it. Now
         collect, using the job's own reference so the webhook and the database
         trigger can match the payment back to this exact job. */
      const { data: pay, error: pe } = await supabase.functions.invoke(
        'payments/api/payments/collect',
        {
          body: {
            phone: digits,
            amount: r.fee_xaf,
            description: 'Bambeh delivery ' + pickup.trim() + ' to ' + drop.trim(),
            externalRef: r.payment_ref,
          },
        },
      );
      if (pe) throw pe;

      setOkMsg(t.awaiting);
      setQuote(null);
      setPickup(''); setDrop(''); setNoteP(''); setNoteD(''); setKm('');
      void pay;
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.failed);
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
      if (r && r.ok === false) setError(r.reason || t.failed);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.failed);
    } finally {
      setBusy(false);
    }
  };

  const chip = (s: string) => {
    if (s === 'AWAITING_PAYMENT') return 'bg-amber-100 text-amber-800';
    if (s === 'OPEN')             return 'bg-blue-100 text-blue-800';
    if (s === 'DELIVERED')        return 'bg-emerald-100 text-emerald-800';
    if (s === 'CANCELLED')        return 'bg-gray-100 text-gray-600';
    return 'bg-teal-100 text-teal-800';
  };

  const field = 'mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500';

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <Link to="/" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-600">
        <ArrowLeft className="h-4 w-4" /> Bambeh
      </Link>

      <h1 className="text-2xl font-black text-gray-900">{t.title}</h1>
      <p className="mt-1 text-sm text-gray-600">{t.lead}</p>

      {error ? (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800">
          <XCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </div>
      ) : null}
      {okMsg ? (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
          <Clock className="mt-0.5 h-4 w-4 shrink-0" /> {okMsg}
        </div>
      ) : null}

      <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-4">
        <label className="block text-sm font-medium text-gray-700">
          {t.region} / {t.town}
        </label>
        <select value={place} onChange={(e) => { setPlace(e.target.value); dirty(); }} className={field}>
          <option value="">--</option>
          {towns.map((r) => (
            <option key={r.region + '|' + r.town} value={r.region + '|' + r.town}>
              {r.town}, {r.region} &middot; {r.riders_on_duty}/{r.riders_verified}
            </option>
          ))}
        </select>
        {towns.length === 0 ? (
          <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-amber-800">
            <Bike className="h-3.5 w-3.5" /> {t.noRiders}
          </p>
        ) : null}

        <div className="mt-4">
          <label htmlFor="pk" className="block text-sm font-medium text-gray-700">{t.pickup}</label>
          <input id="pk" value={pickup} onChange={(e) => { setPickup(e.target.value); dirty(); }} className={field} />
        </div>
        <div className="mt-3">
          <label htmlFor="dp" className="block text-sm font-medium text-gray-700">{t.dropoff}</label>
          <input id="dp" value={drop} onChange={(e) => { setDrop(e.target.value); dirty(); }} className={field} />
        </div>
        <div className="mt-3">
          <label htmlFor="km" className="block text-sm font-medium text-gray-700">{t.km}</label>
          <input id="km" value={km} inputMode="decimal"
            onChange={(e) => { setKm(e.target.value.replace(/[^0-9.]/g, '')); dirty(); }} className={field} />
        </div>
        <div className="mt-3">
          <label htmlFor="ph" className="block text-sm font-medium text-gray-700">{t.phone}</label>
          <input id="ph" value={phone} inputMode="tel" placeholder="6XXXXXXXX"
            onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))} className={field} />
        </div>
        <div className="mt-3">
          <label htmlFor="np" className="block text-sm font-medium text-gray-700">{t.noteP}</label>
          <input id="np" value={noteP} onChange={(e) => setNoteP(e.target.value)} className={field} />
        </div>
        <div className="mt-3">
          <label htmlFor="nd" className="block text-sm font-medium text-gray-700">{t.noteD}</label>
          <input id="nd" value={noteD} onChange={(e) => setNoteD(e.target.value)} className={field} />
        </div>

        {quote === null ? (
          <button type="button" disabled={busy} onClick={() => void askPrice()}
            className="mt-5 min-h-[48px] w-full rounded-xl bg-gray-900 px-4 py-3 font-bold text-white disabled:bg-gray-300">
            {busy ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : t.getPrice}
          </button>
        ) : (
          <>
            <div className="mt-5 rounded-xl bg-teal-50 p-4 text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-teal-800">{t.youPay}</p>
              <p className="text-3xl font-black text-teal-900">{quote.toLocaleString()} XAF</p>
            </div>
            <button type="button" disabled={busy} onClick={() => void submit()}
              className="mt-3 min-h-[48px] w-full rounded-xl bg-teal-600 px-4 py-3 font-bold text-white disabled:bg-gray-300">
              {busy ? t.paying : t.send}
            </button>
            <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-snug text-gray-600">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {t.awaiting}
            </p>
          </>
        )}
      </div>

      <h2 className="mt-8 text-lg font-bold text-gray-900">{t.mine}</h2>
      {mine.length === 0 ? (
        <p className="mt-2 text-sm text-gray-500">{t.none}</p>
      ) : (
        <div className="mt-2 space-y-2">
          {mine.map((m) => (
            <div key={m.id} className="rounded-xl border border-gray-200 bg-white p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="min-w-0 text-sm font-semibold text-gray-900">
                  <MapPin className="mr-1 inline h-3.5 w-3.5" />
                  {m.pickup_area} &rarr; {m.dropoff_area}
                </p>
                <span className={'shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold ' + chip(m.status)}>
                  {m.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-600">
                {Number(m.fee_xaf ?? 0).toLocaleString()} XAF
                {m.paid_at ? <> &middot; <CheckCircle className="inline h-3 w-3 text-emerald-600" /> {t.paid}</> : null}
              </p>
              {m.rider_name ? (
                <p className="mt-1 text-xs font-semibold text-gray-800">
                  {t.rider}: {m.rider_name}
                  {m.rider_phone ? (
                    <a href={'tel:' + m.rider_phone} className="ml-2 inline-flex items-center gap-1 text-teal-700">
                      <Phone className="h-3 w-3" /> {m.rider_phone}
                    </a>
                  ) : null}
                </p>
              ) : null}
              {['AWAITING_PAYMENT', 'OPEN', 'ACCEPTED'].includes(m.status) ? (
                <button type="button" disabled={busy} onClick={() => void cancel(m.id)}
                  className="mt-2 min-h-[40px] rounded-lg bg-white px-3 py-2 text-xs font-bold text-gray-700 ring-1 ring-gray-300 disabled:text-gray-300">
                  {t.cancel}
                </button>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
// BAMBEH_END_TOKEN__REQUESTDELIVERY_FIX598__COMPLETE
