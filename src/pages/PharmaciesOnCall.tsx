// BAMBEH_DEPLOY_TOKEN__PHARMACIESONCALL_FIX491_CLEAN
/**
 * src/pages/PharmaciesOnCall.tsx — Bambeh Marketplace
 *
 * FIX480 — WHICH PHARMACY IS OPEN TONIGHT.
 * ────────────────────────────────────────
 * Somebody's child has a fever at two in the morning. They open Bambeh, pick
 * their town, and get a name, a quarter and a number they can ring.
 *
 * THREE DECISIONS THAT MATTER MORE THAN THE LAYOUT
 *
 * 1. NO LOGIN. This page is deliberately outside AuthGate. A person looking
 *    for medicine at 2am must never meet a sign-in wall. The database
 *    functions are granted to `anon` for exactly this reason.
 *
 * 2. AN EMPTY LIST IS NEVER SHOWN AS AN ANSWER. "Nothing found" is ambiguous:
 *    does it mean no pharmacy is open, or that nobody has entered the rota for
 *    Bamenda yet? Those are completely different things to tell a frightened
 *    person. `pharmacy_rota_status` tells us which it is, and the page says so
 *    in words. A confident wrong answer is the one failure this feature cannot
 *    afford.
 *
 * 3. IT SAYS HOW OLD THE INFORMATION IS. Every result carries when the rota
 *    was last updated and how long it runs. Rotas change; a user who can see
 *    the date can judge for themselves whether to ring first.
 *
 * The phone number is a `tel:` link and WhatsApp opens directly, because on a
 * phone at 2am nobody wants to copy digits by hand.
 *
 * © 2026 BAMBEH SARL. All rights reserved.
 */

import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Phone, MessageCircle, MapPin, Clock, Loader2,
  AlertCircle, RefreshCw, Cross, Info,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';

interface OnCall {
  id: string; name: string; town: string; quarter: string | null;
  address: string | null; phone: string | null; whatsapp: string | null;
  notes: string | null; starts_at: string; ends_at: string; note: string | null;
}
interface RotaStatus {
  town: string; pharmacies: number; on_call_now: number;
  covered_until: string | null; last_updated: string | null;
}
interface TownRow { town: string; pharmacies: number }

const STR: Record<string, Record<string, string>> = {
  en: {
    listMine: 'Are you a pharmacy or a hospital? List yours',
    title: 'Pharmacies on call', back: 'Back',
    sub: 'Find a pharmacy open tonight near you. Free, always.',
    pickTown: 'Choose your town', loading: 'Loading…',
    openNow: 'Open now', nOpen: 'open now',
    call: 'Call', whatsapp: 'WhatsApp',
    until: 'On call until', updated: 'Rota updated',
    noRotaTitle: 'We do not have the rota for this town yet',
    noRotaBody: 'Bambeh has not received the on-call list for here. We are working on it. Please ring a pharmacy you know, or ask at the nearest hospital.',
    noneOpenTitle: 'No pharmacy is listed as on call right now',
    noneOpenBody: 'The rota we have does not cover this moment. Times change — please ring before travelling.',
    noTownsTitle: 'No towns added yet',
    noTownsBody: 'The pharmacy list is being built. Check again soon.',
    failedTitle: 'Could not load the list',
    failedBody: 'Check your connection and try again.',
    retry: 'Try again',
    warn: 'Rotas change. Please ring the pharmacy before you travel.',
  },
  fr: {
    listMine: 'Vous êtes une pharmacie ou un hôpital ? Inscrivez-vous',
    title: 'Pharmacies de garde', back: 'Retour',
    sub: 'Trouvez une pharmacie ouverte cette nuit près de vous. Gratuit, toujours.',
    pickTown: 'Choisissez votre ville', loading: 'Chargement…',
    openNow: 'Ouverte maintenant', nOpen: 'ouverte(s) maintenant',
    call: 'Appeler', whatsapp: 'WhatsApp',
    until: 'De garde jusqu’à', updated: 'Liste mise à jour',
    noRotaTitle: 'Nous n’avons pas encore la liste de garde pour cette ville',
    noRotaBody: 'Bambeh n’a pas encore reçu la liste des pharmacies de garde ici. Nous y travaillons. Appelez une pharmacie que vous connaissez, ou demandez à l’hôpital le plus proche.',
    noneOpenTitle: 'Aucune pharmacie n’est de garde en ce moment',
    noneOpenBody: 'La liste dont nous disposons ne couvre pas cet instant. Les horaires changent — appelez avant de vous déplacer.',
    noTownsTitle: 'Aucune ville pour le moment',
    noTownsBody: 'La liste des pharmacies est en cours de constitution. Revenez bientôt.',
    failedTitle: 'Impossible de charger la liste',
    failedBody: 'Vérifiez votre connexion et réessayez.',
    retry: 'Réessayer',
    warn: 'Les gardes changent. Appelez la pharmacie avant de vous déplacer.',
  },
  pidgin: {
    listMine: 'You be pharmacy or hospital? Put yours here',
    title: 'Pharmacy wey dey on call', back: 'Go back',
    sub: 'Find pharmacy wey open dis night near you. E free, always.',
    pickTown: 'Choose your town', loading: 'E dey load…',
    openNow: 'Open now', nOpen: 'open now',
    call: 'Call', whatsapp: 'WhatsApp',
    until: 'Dey on call reach', updated: 'Dem update di list',
    noRotaTitle: 'We never get di on-call list for dis town',
    noRotaBody: 'Bambeh never receive di list for here. We dey work for am. Abeg call pharmacy wey you know, or ask for di hospital wey near you.',
    noneOpenTitle: 'No pharmacy dey on call for dis moment',
    noneOpenBody: 'Di list wey we get no cover dis time. Time dey change — abeg call before you commot.',
    noTownsTitle: 'No town dey yet',
    noTownsBody: 'We dey build di pharmacy list. Come check small time.',
    failedTitle: 'We no fit load di list',
    failedBody: 'Check your network make you try again.',
    retry: 'Try again',
    warn: 'On-call dey change. Abeg call di pharmacy before you commot.',
  },
  ar: {
    listMine: 'هل أنت صيدلية أو مستشفى؟ أضف منشأتك',
    title: 'صيدليات المناوبة', back: 'رجوع',
    sub: 'اعثر على صيدلية مفتوحة الليلة بالقرب منك. مجاناً، دائماً.',
    pickTown: 'اختر مدينتك', loading: 'جارٍ التحميل…',
    openNow: 'مفتوحة الآن', nOpen: 'مفتوحة الآن',
    call: 'اتصال', whatsapp: 'واتساب',
    until: 'مناوبة حتى', updated: 'حُدّثت القائمة',
    noRotaTitle: 'ليس لدينا قائمة المناوبة لهذه المدينة بعد',
    noRotaBody: 'لم يستلم بامبيه قائمة صيدليات المناوبة هنا بعد. نحن نعمل على ذلك. اتصل بصيدلية تعرفها أو اسأل في أقرب مستشفى.',
    noneOpenTitle: 'لا توجد صيدلية مناوبة في هذه اللحظة',
    noneOpenBody: 'القائمة المتوفرة لدينا لا تغطي هذا الوقت. المواعيد تتغير — اتصل قبل أن تذهب.',
    noTownsTitle: 'لا توجد مدن بعد',
    noTownsBody: 'قائمة الصيدليات قيد الإعداد. عد قريباً.',
    failedTitle: 'تعذّر تحميل القائمة',
    failedBody: 'تحقق من اتصالك وحاول مرة أخرى.',
    retry: 'حاول مرة أخرى',
    warn: 'المناوبات تتغير. اتصل بالصيدلية قبل أن تذهب.',
  },
  ff: {
    listMine: 'Aɗa woni farmasi walla opitaal? Winndu maaɗa',
    title: 'Farmasiiji e ndeenka', back: 'Rutto',
    sub: 'Yiytu farmasi udditiindi jemma hannde takko maa. Ko meere, sahaa kala.',
    pickTown: 'Suɓo saare maa', loading: 'Ina loowa…',
    openNow: 'Uddittii jooni', nOpen: 'udditii jooni',
    call: 'Noddu', whatsapp: 'WhatsApp',
    until: 'E ndeenka haa', updated: 'Doggol ngol hesɗitinaama',
    noRotaTitle: 'En keɓaani tawo doggol ndeenka nden saare',
    noRotaBody: 'Bambeh keɓaani tawo doggol farmasiiji ndeenka ɗoo. Eɗen golla e mum. Tiiɗno noddu farmasi ndu anndu-ɗaa, walla lanɗo e opitaal ɓadiiɗo.',
    noneOpenTitle: 'Alaa farmasi e ndeenka e ndee saanga',
    noneOpenBody: 'Doggol ngol min njogii yaltaani ndee saanga. Waqtuuji ina mbaylo — tiiɗno noddu ado a yahde.',
    noTownsTitle: 'Alaa saare tawo',
    noTownsBody: 'Doggol farmasiiji ngol ina mahee. Rutto ɗoo law.',
    failedTitle: 'Doggol ngol loowaaki',
    failedBody: 'Ƴeewto ceŋgal maa ndaarndo-ɗaa kadi.',
    retry: 'Ndaarndo kadi',
    warn: 'Ndeenka ina waylo. Tiiɗno noddu farmasi nden ado a yahde.',
  },
};
const tr = (l: string, k: string) => (STR[l] && STR[l][k]) || STR.en[k] || k;

const TOWN_KEY = 'bambeh:pharmacy:town';

function fmt(iso: string | null, lang: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString(
      lang === 'fr' ? 'fr-CM' : lang === 'ar' ? 'ar' : 'en-GB',
      { weekday: 'short', hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' },
    );
  } catch { return new Date(iso).toLocaleString(); }
}

export default function PharmaciesOnCall() {
  const navigate = useNavigate();
  const raw: unknown = useLang();
  const lang = typeof raw === 'string' ? raw : 'en';
  const isRtl = lang === 'ar';
  const t = (k: string) => tr(lang, k);

  const [towns, setTowns] = useState<TownRow[]>([]);
  const [town, setTown] = useState<string>(() => {
    try { return window.localStorage.getItem(TOWN_KEY) ?? ''; } catch { return ''; }
  });
  const [rows, setRows] = useState<OnCall[]>([]);
  const [status, setStatus] = useState<RotaStatus | null>(null);
  const [loading, setLoading] = useState(true);
  // A failure must never be rendered as "no pharmacy is open".
  const [failed, setFailed] = useState(false);

  const loadTowns = useCallback(async () => {
    const { data, error } = await supabase.rpc('pharmacy_towns');
    if (error) { setFailed(true); return; }
    setTowns((data ?? []) as TownRow[]);
  }, []);

  const load = useCallback(async (chosen: string) => {
    setLoading(true);
    setFailed(false);
    try {
      const [list, stat] = await Promise.all([
        supabase.rpc('pharmacies_on_call', { p_town: chosen || null }),
        supabase.rpc('pharmacy_rota_status', { p_town: chosen || null }),
      ]);
      if (list.error || stat.error) throw list.error || stat.error;
      setRows((list.data ?? []) as OnCall[]);
      const s = (stat.data ?? []) as RotaStatus[];
      setStatus(s.length ? s[0] : null);
    } catch {
      setFailed(true);
      setRows([]);
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTowns(); }, [loadTowns]);
  useEffect(() => { load(town); }, [town, load]);

  const chooseTown = (v: string) => {
    setTown(v);
    try { v ? window.localStorage.setItem(TOWN_KEY, v) : window.localStorage.removeItem(TOWN_KEY); }
    catch { /* storage blocked - the choice just will not be remembered */ }
  };

  /* Which of the three "nothing to show" situations are we in? They are not
     the same and must not look the same. */
  const emptyKind: 'towns' | 'rota' | 'none' | null =
    rows.length > 0 ? null
      : towns.length === 0 ? 'towns'
        : (!status || status.covered_until === null) ? 'rota'
          : 'none';

  return (
    <div className="min-h-screen bg-gray-50 pb-10" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ms-2 rounded-xl hover:bg-gray-100"
          aria-label={t('back')}>
          <ArrowLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
        </button>
        <h1 className="font-bold text-gray-900 flex items-center gap-2">
          <Cross className="w-5 h-5 text-emerald-600" /> {t('title')}
        </h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        <p className="text-sm text-gray-600">{t('sub')}</p>

        <div>
          <label htmlFor="town" className="block text-xs font-semibold text-gray-600 mb-1">
            {t('pickTown')}
          </label>
          <select id="town" value={town} onChange={(e) => chooseTown(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-400">
            <option value="">—</option>
            {towns.map((x) => (
              <option key={x.town} value={x.town}>{x.town}</option>
            ))}
          </select>
        </div>

        {status && status.on_call_now > 0 ? (
          <p className="text-xs text-emerald-700 font-semibold">
            {status.on_call_now} {t('nOpen')}
          </p>
        ) : null}

        {loading ? (
          <div className="flex justify-center py-10 text-emerald-600">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : failed ? (
          <Notice tone="red" icon={<AlertCircle className="w-5 h-5" />}
            title={t('failedTitle')} body={t('failedBody')}
            action={{ label: t('retry'), onClick: () => load(town), icon: <RefreshCw className="w-3.5 h-3.5" /> }} />
        ) : emptyKind === 'towns' ? (
          <Notice tone="gray" icon={<Info className="w-5 h-5" />}
            title={t('noTownsTitle')} body={t('noTownsBody')} />
        ) : emptyKind === 'rota' ? (
          /* THE IMPORTANT ONE. We do not know, and we say we do not know. */
          <Notice tone="amber" icon={<Info className="w-5 h-5" />}
            title={t('noRotaTitle')} body={t('noRotaBody')} />
        ) : emptyKind === 'none' ? (
          <Notice tone="amber" icon={<Clock className="w-5 h-5" />}
            title={t('noneOpenTitle')} body={t('noneOpenBody')} />
        ) : (
          <>
            <div className="space-y-3">
              {rows.map((p) => (
                <div key={`${p.id}-${p.starts_at}`}
                  className="bg-white rounded-2xl border border-emerald-100 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900">{p.name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">
                          {[p.quarter, p.address, p.town].filter(Boolean).join(' · ')}
                        </span>
                      </p>
                    </div>
                    <span className="shrink-0 text-[10px] font-bold bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5">
                      {t('openNow')}
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-500 mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {t('until')} {fmt(p.ends_at, lang)}
                    {p.note ? ` · ${p.note}` : ''}
                  </p>
                  {p.notes ? <p className="text-xs text-gray-600 mt-1">{p.notes}</p> : null}

                  {(p.phone || p.whatsapp) ? (
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {p.phone ? (
                        <a href={`tel:${p.phone.replace(/\s/g, '')}`}
                          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-2.5 rounded-xl">
                          <Phone className="w-4 h-4" /> {t('call')}
                        </a>
                      ) : null}
                      {p.whatsapp ? (
                        <a href={`https://wa.me/${p.whatsapp.replace(/\D/g, '')}`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 border border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-sm font-bold py-2.5 rounded-xl">
                          <MessageCircle className="w-4 h-4" /> {t('whatsapp')}
                        </a>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            {/* Never let anyone set out on our word alone. */}
            <p className="text-[11px] text-gray-500 text-center pt-1">{t('warn')}</p>
            {status?.last_updated ? (
              <p className="text-[11px] text-gray-400 text-center">
                {t('updated')}: {fmt(status.last_updated, lang)}
              </p>
            ) : null}
          </>
        )}

        <div className="pt-1">
          <Link to="/list-my-service"
            className="block text-center text-xs font-semibold text-emerald-700 border border-emerald-200 rounded-xl py-2.5 hover:bg-emerald-50">
            {t('listMine')}
          </Link>
        </div>
      </div>
    </div>
  );
}

function Notice({ tone, icon, title, body, action }: {
  tone: 'red' | 'amber' | 'gray';
  icon: React.ReactNode; title: string; body: string;
  action?: { label: string; onClick: () => void; icon: React.ReactNode };
}) {
  const skin = tone === 'red'
    ? 'bg-red-50 border-red-200 text-red-800'
    : tone === 'amber'
      ? 'bg-amber-50 border-amber-200 text-amber-900'
      : 'bg-gray-50 border-gray-200 text-gray-700';
  return (
    <div className={`rounded-2xl border p-4 ${skin}`}>
      <div className="flex items-start gap-3">
        <span className="shrink-0 mt-0.5">{icon}</span>
        <div className="flex-1">
          <p className="font-bold text-sm">{title}</p>
          <p className="text-xs mt-1 leading-relaxed">{body}</p>
          {action ? (
            <button onClick={action.onClick}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold underline">
              {action.icon} {action.label}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__PHARMACIESONCALL_FIX491__COMPLETE
