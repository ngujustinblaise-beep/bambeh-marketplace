// BAMBEH_DEPLOY_TOKEN__HOSPITALSONDUTY_FIX484_CLEAN
/**
 * src/pages/HospitalsOnDuty.tsx — Bambeh Marketplace
 *
 * FIX484 — WHICH HOSPITAL, AND DOES IT HAVE OXYGEN.
 * ─────────────────────────────────────────────────
 * A person in trouble at 2am is not browsing. They need three facts fast:
 * who is open, do they have oxygen, and can they send an ambulance. So those
 * are filters at the top, not details buried in a card.
 *
 * THIS IS A DIRECTORY. IT IS NOT DISPATCH.
 *   Bambeh shows you a hospital and its number. The HOSPITAL decides and
 *   dispatches. The page says that in plain words in every language, because
 *   the difference matters: if an ambulance does not come, that is between the
 *   caller and the hospital, and Bambeh must never have implied otherwise.
 *
 * ONLY VERIFIED ENTRIES APPEAR.
 *   `hospitals_on_duty` filters on is_verified, and so does the RLS policy
 *   behind it. An unchecked submission cannot reach this page. For a hospital
 *   listing that is not a nicety — a wrong number at 2am is a real harm.
 *
 * NO LOGIN, like Pharmacies. Outside AuthGate on purpose.
 *
 * Every number is a tel: link. Nobody copies digits by hand in an emergency.
 *
 * © 2026 BAMBEH SARL. All rights reserved.
 */

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Phone, MessageCircle, MapPin, Loader2, AlertCircle,
  RefreshCw, Stethoscope, Wind, Ambulance, Info, ShieldCheck,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';

interface Hospital {
  id: string; name: string; town: string; quarter: string | null;
  address: string | null; contact_phone: string | null; whatsapp: string | null;
  has_oxygen: boolean; has_ambulance: boolean; has_emergency: boolean;
  kind: string | null; notes: string | null;
}
interface TownRow { town: string; hospitals: number; with_oxygen: number; with_ambulance: number }

const STR: Record<string, Record<string, string>> = {
  en: {
    title: 'Hospitals on duty', back: 'Back',
    sub: 'Find a hospital near you and call them directly. Free, always.',
    pickTown: 'Choose your town',
    fOxygen: 'Has oxygen', fAmbulance: 'Has ambulance',
    emergency: '24h emergency', oxygen: 'Oxygen', ambulance: 'Ambulance',
    call: 'Call hospital', whatsapp: 'WhatsApp',
    noneTitle: 'No hospital matches',
    noneBody: 'Try removing a filter, or choose another town.',
    noTownsTitle: 'No hospitals added yet',
    noTownsBody: 'The list is being built and checked. Please check again soon.',
    failedTitle: 'Could not load the list',
    failedBody: 'Check your connection and try again.',
    retry: 'Try again',
    disclaimer: 'Bambeh shows you the hospital and its number. The hospital decides and sends any ambulance — Bambeh does not dispatch one. Always call first.',
    verified: 'Checked by Bambeh',
  },
  fr: {
    title: 'Hôpitaux de garde', back: 'Retour',
    sub: 'Trouvez un hôpital près de vous et appelez-le directement. Gratuit, toujours.',
    pickTown: 'Choisissez votre ville',
    fOxygen: 'Avec oxygène', fAmbulance: 'Avec ambulance',
    emergency: 'Urgences 24h', oxygen: 'Oxygène', ambulance: 'Ambulance',
    call: 'Appeler l’hôpital', whatsapp: 'WhatsApp',
    noneTitle: 'Aucun hôpital ne correspond',
    noneBody: 'Retirez un filtre, ou choisissez une autre ville.',
    noTownsTitle: 'Aucun hôpital pour le moment',
    noTownsBody: 'La liste est en cours de constitution et de vérification. Revenez bientôt.',
    failedTitle: 'Impossible de charger la liste',
    failedBody: 'Vérifiez votre connexion et réessayez.',
    retry: 'Réessayer',
    disclaimer: 'Bambeh vous indique l’hôpital et son numéro. C’est l’hôpital qui décide et envoie l’ambulance — Bambeh n’en envoie pas. Appelez toujours d’abord.',
    verified: 'Vérifié par Bambeh',
  },
  pidgin: {
    title: 'Hospital wey dey on duty', back: 'Go back',
    sub: 'Find hospital near you, call dem direct. E free, always.',
    pickTown: 'Choose your town',
    fOxygen: 'Get oxygen', fAmbulance: 'Get ambulance',
    emergency: 'Emergency 24h', oxygen: 'Oxygen', ambulance: 'Ambulance',
    call: 'Call di hospital', whatsapp: 'WhatsApp',
    noneTitle: 'No hospital match',
    noneBody: 'Remove one filter, or choose another town.',
    noTownsTitle: 'No hospital dey yet',
    noTownsBody: 'We dey build and check di list. Come back small time.',
    failedTitle: 'We no fit load di list',
    failedBody: 'Check your network make you try again.',
    retry: 'Try again',
    disclaimer: 'Bambeh dey show you di hospital and dia number. Na di hospital go decide and send ambulance — Bambeh no dey send am. Always call first.',
    verified: 'Bambeh don check am',
  },
  ar: {
    title: 'المستشفيات المناوبة', back: 'رجوع',
    sub: 'اعثر على مستشفى قريب منك واتصل به مباشرة. مجاناً، دائماً.',
    pickTown: 'اختر مدينتك',
    fOxygen: 'يتوفر أكسجين', fAmbulance: 'تتوفر سيارة إسعاف',
    emergency: 'طوارئ 24 ساعة', oxygen: 'أكسجين', ambulance: 'إسعاف',
    call: 'اتصل بالمستشفى', whatsapp: 'واتساب',
    noneTitle: 'لا يوجد مستشفى مطابق',
    noneBody: 'أزل أحد المرشحات أو اختر مدينة أخرى.',
    noTownsTitle: 'لا توجد مستشفيات بعد',
    noTownsBody: 'القائمة قيد الإعداد والتحقق. عد قريباً.',
    failedTitle: 'تعذّر تحميل القائمة',
    failedBody: 'تحقق من اتصالك وحاول مرة أخرى.',
    retry: 'حاول مرة أخرى',
    disclaimer: 'يعرض بامبيه المستشفى ورقمه. المستشفى هو من يقرر ويرسل سيارة الإسعاف — بامبيه لا يرسلها. اتصل دائماً أولاً.',
    verified: 'تم التحقق من بامبيه',
  },
  ff: {
    title: 'Opitaaluuji e ndeenka', back: 'Rutto',
    sub: 'Yiytu opitaal takko maa noddaa ɓe e hoore maa. Ko meere, sahaa kala.',
    pickTown: 'Suɓo saare maa',
    fOxygen: 'Ina jogii oksijen', fAmbulance: 'Ina jogii ambilaas',
    emergency: 'Heñoraaɗe 24h', oxygen: 'Oksijen', ambulance: 'Ambilaas',
    call: 'Noddu opitaal', whatsapp: 'WhatsApp',
    noneTitle: 'Alaa opitaal foti',
    noneBody: 'Ittu goɗɗo e ɗeen tamnirɗe, walla suɓo saare goɗɗo.',
    noTownsTitle: 'Alaa opitaal tawo',
    noTownsBody: 'Doggol ngol ina mahee ina ƴeewee. Rutto ɗoo law.',
    failedTitle: 'Doggol ngol loowaaki',
    failedBody: 'Ƴeewto ceŋgal maa ndaarndo-ɗaa kadi.',
    retry: 'Ndaarndo kadi',
    disclaimer: 'Bambeh ina holla ma opitaal e limngal mum. Ko opitaal oo felliti neldude ambilaas — Bambeh neldataa. Noddu ko adii sahaa kala.',
    verified: 'Bambeh ƴeewii',
  },
};
const tr = (l: string, k: string) => (STR[l] && STR[l][k]) || STR.en[k] || k;

const TOWN_KEY = 'bambeh:hospital:town';

export default function HospitalsOnDuty() {
  const navigate = useNavigate();
  const raw: unknown = useLang();
  const lang = typeof raw === 'string' ? raw : 'en';
  const isRtl = lang === 'ar';
  const t = (k: string) => tr(lang, k);

  const [towns, setTowns] = useState<TownRow[]>([]);
  const [town, setTown] = useState<string>(() => {
    try { return window.localStorage.getItem(TOWN_KEY) ?? ''; } catch { return ''; }
  });
  const [needOxygen, setNeedOxygen] = useState(false);
  const [needAmbulance, setNeedAmbulance] = useState(false);
  const [rows, setRows] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  // A failure must never render as "no hospital is open".
  const [failed, setFailed] = useState(false);

  const loadTowns = useCallback(async () => {
    const { data, error } = await supabase.rpc('hospital_towns');
    if (error) { setFailed(true); return; }
    setTowns((data ?? []) as TownRow[]);
  }, []);

  const load = useCallback(async () => {
    setLoading(true); setFailed(false);
    try {
      const { data, error } = await supabase.rpc('hospitals_on_duty', {
        p_town: town || null,
        p_need_oxygen: needOxygen,
        p_need_ambulance: needAmbulance,
      });
      if (error) throw error;
      setRows((data ?? []) as Hospital[]);
    } catch {
      setFailed(true); setRows([]);
    } finally { setLoading(false); }
  }, [town, needOxygen, needAmbulance]);

  useEffect(() => { loadTowns(); }, [loadTowns]);
  useEffect(() => { load(); }, [load]);

  const chooseTown = (v: string) => {
    setTown(v);
    try { v ? window.localStorage.setItem(TOWN_KEY, v) : window.localStorage.removeItem(TOWN_KEY); }
    catch { /* storage blocked - the choice just will not be remembered */ }
  };

  const chip = (on: boolean) =>
    `flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors ${
      on ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-gray-200 bg-white text-gray-600'
    }`;

  return (
    <div className="min-h-screen bg-gray-50 pb-10" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ms-2 rounded-xl hover:bg-gray-100" aria-label={t('back')}>
          <ArrowLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
        </button>
        <h1 className="font-bold text-gray-900 flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-rose-600" /> {t('title')}
        </h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        <p className="text-sm text-gray-600">{t('sub')}</p>

        <div>
          <label htmlFor="htown" className="block text-xs font-semibold text-gray-600 mb-1">{t('pickTown')}</label>
          <select id="htown" value={town} onChange={(e) => chooseTown(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm bg-white outline-none focus:ring-2 focus:ring-rose-400">
            <option value="">—</option>
            {towns.map((x) => <option key={x.town} value={x.town}>{x.town}</option>)}
          </select>
        </div>

        {/* The two questions someone in trouble actually asks. */}
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setNeedOxygen((v) => !v)} className={chip(needOxygen)}>
            <Wind className="w-4 h-4" /> {t('fOxygen')}
          </button>
          <button onClick={() => setNeedAmbulance((v) => !v)} className={chip(needAmbulance)}>
            <Ambulance className="w-4 h-4" /> {t('fAmbulance')}
          </button>
        </div>

        {/* Said before the list, not after. Nobody should misread this page. */}
        <div className="rounded-2xl bg-amber-50 border border-amber-100 p-3 flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-900 leading-relaxed">{t('disclaimer')}</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-10 text-rose-600"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : failed ? (
          <Notice tone="red" icon={<AlertCircle className="w-5 h-5" />}
            title={t('failedTitle')} body={t('failedBody')}
            action={{ label: t('retry'), onClick: load }} />
        ) : towns.length === 0 ? (
          <Notice tone="gray" icon={<Info className="w-5 h-5" />}
            title={t('noTownsTitle')} body={t('noTownsBody')} />
        ) : rows.length === 0 ? (
          <Notice tone="amber" icon={<Info className="w-5 h-5" />}
            title={t('noneTitle')} body={t('noneBody')} />
        ) : (
          <div className="space-y-3">
            {rows.map((h) => (
              <div key={h.id} className="bg-white rounded-2xl border border-rose-100 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900">{h.name}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{[h.quarter, h.address, h.town].filter(Boolean).join(' · ')}</span>
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] font-bold bg-teal-50 text-teal-700 rounded-full px-2 py-0.5 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> {t('verified')}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {h.has_emergency ? <Tag tone="rose">{t('emergency')}</Tag> : null}
                  {h.has_oxygen ? <Tag tone="sky"><Wind className="w-3 h-3" /> {t('oxygen')}</Tag> : null}
                  {h.has_ambulance ? <Tag tone="emerald"><Ambulance className="w-3 h-3" /> {t('ambulance')}</Tag> : null}
                </div>

                {h.notes ? <p className="text-xs text-gray-600 mt-2">{h.notes}</p> : null}

                {(h.contact_phone || h.whatsapp) ? (
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {h.contact_phone ? (
                      <a href={`tel:${h.contact_phone.replace(/\s/g, '')}`}
                        className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold py-2.5 rounded-xl">
                        <Phone className="w-4 h-4" /> {t('call')}
                      </a>
                    ) : null}
                    {h.whatsapp ? (
                      <a href={`https://wa.me/${h.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 border border-rose-200 text-rose-700 hover:bg-rose-50 text-sm font-bold py-2.5 rounded-xl">
                        <MessageCircle className="w-4 h-4" /> {t('whatsapp')}
                      </a>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Tag({ tone, children }: { tone: 'rose' | 'sky' | 'emerald'; children: React.ReactNode }) {
  const skin = tone === 'rose' ? 'bg-rose-50 text-rose-700'
    : tone === 'sky' ? 'bg-sky-50 text-sky-700' : 'bg-emerald-50 text-emerald-700';
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold rounded-full px-2 py-0.5 ${skin}`}>
      {children}
    </span>
  );
}

function Notice({ tone, icon, title, body, action }: {
  tone: 'red' | 'amber' | 'gray'; icon: React.ReactNode;
  title: string; body: string; action?: { label: string; onClick: () => void };
}) {
  const skin = tone === 'red' ? 'bg-red-50 border-red-200 text-red-800'
    : tone === 'amber' ? 'bg-amber-50 border-amber-200 text-amber-900'
      : 'bg-gray-50 border-gray-200 text-gray-700';
  return (
    <div className={`rounded-2xl border p-4 ${skin}`}>
      <div className="flex items-start gap-3">
        <span className="shrink-0 mt-0.5">{icon}</span>
        <div className="flex-1">
          <p className="font-bold text-sm">{title}</p>
          <p className="text-xs mt-1 leading-relaxed">{body}</p>
          {action ? (
            <button onClick={action.onClick} className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold underline">
              <RefreshCw className="w-3.5 h-3.5" /> {action.label}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__HOSPITALSONDUTY_FIX484__COMPLETE
