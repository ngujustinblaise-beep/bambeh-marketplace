// BAMBEH_DEPLOY_TOKEN__LISTMYSERVICE_FIX490_CLEAN
/**
 * src/pages/ListMyService.tsx — Bambeh Marketplace
 *
 * FIX490 — WHERE A BUSINESS ENTERS ITS OWN DETAILS.
 * ─────────────────────────────────────────────────
 * Big asked for this: the free-service directories cannot depend on him typing
 * every entry. A pharmacy or hospital fills this in themselves.
 *
 * NOTHING SUBMITTED HERE IS VISIBLE TO ANYONE.
 *   The insert policy from FIX483 forces is_verified = false, so nobody can
 *   self-approve, and every read function filters on is_verified = true. The
 *   entry sits in the Command Center queue until a human checks it. For a
 *   hospital that is not bureaucracy — a wrong number at 2am is real harm.
 *
 *   The page SAYS this, plainly, before the form and again after sending. A
 *   business that thinks it is already listed and is not would be worse served
 *   than one that was told to wait.
 *
 * SIGN-IN IS REQUIRED HERE, UNLIKE THE DIRECTORIES THEMSELVES.
 *   Reading them must never need an account — someone looking for medicine at
 *   2am comes first. But submitting does, because `submitted_by` has to point
 *   at a real person we can go back to.
 *
 * © 2026 BAMBEH SARL. All rights reserved.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Cross, Stethoscope, Loader2, CheckCircle2, AlertCircle,
  ShieldCheck, Wind, Ambulance,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';

type Kind = 'pharmacy' | 'hospital';

const STR: Record<string, Record<string, string>> = {
  en: {
    title: 'List your service', back: 'Back',
    intro: 'Add your pharmacy or hospital so people can find you. It is free.',
    notice: 'Bambeh checks every entry before it appears. Nothing you send here is visible to users until our team has verified it.',
    pharmacy: 'Pharmacy', hospital: 'Hospital',
    name: 'Name', town: 'Town', quarter: 'Quarter', address: 'Address',
    phone: 'Phone number', whatsapp: 'WhatsApp number',
    contactNote: 'Use the number of the business, not a personal one.',
    oxygen: 'We have oxygen', ambulance: 'We have an ambulance', emergency: 'We open 24 hours',
    notes: 'Anything else people should know',
    send: 'Send for checking', sending: 'Sending…',
    okTitle: 'Sent for checking',
    okBody: 'Thank you. Our team will check the details and your listing will appear once it is verified. We may contact you on the number you gave.',
    another: 'Send another',
    needName: 'Please give the name and the town.',
    needAuth: 'Please sign in first, so we can contact you about this listing.',
    failed: 'Could not send that. Please try again.',
  },
  fr: {
    title: 'Inscrire votre service', back: 'Retour',
    intro: 'Ajoutez votre pharmacie ou votre hôpital pour qu’on vous trouve. C’est gratuit.',
    notice: 'Bambeh vérifie chaque inscription avant sa publication. Rien de ce que vous envoyez ici n’est visible tant que notre équipe ne l’a pas vérifié.',
    pharmacy: 'Pharmacie', hospital: 'Hôpital',
    name: 'Nom', town: 'Ville', quarter: 'Quartier', address: 'Adresse',
    phone: 'Numéro de téléphone', whatsapp: 'Numéro WhatsApp',
    contactNote: 'Utilisez le numéro de l’établissement, pas un numéro personnel.',
    oxygen: 'Nous avons de l’oxygène', ambulance: 'Nous avons une ambulance', emergency: 'Ouvert 24h/24',
    notes: 'Autre chose à savoir',
    send: 'Envoyer pour vérification', sending: 'Envoi…',
    okTitle: 'Envoyé pour vérification',
    okBody: 'Merci. Notre équipe vérifiera les informations et votre fiche apparaîtra une fois validée. Nous pourrons vous appeler au numéro indiqué.',
    another: 'Envoyer une autre',
    needName: 'Veuillez indiquer le nom et la ville.',
    needAuth: 'Connectez-vous d’abord, afin que nous puissions vous contacter.',
    failed: 'Envoi impossible. Veuillez réessayer.',
  },
  pidgin: {
    title: 'Put your service for Bambeh', back: 'Go back',
    intro: 'Add your pharmacy or hospital make people fit find you. E free.',
    notice: 'Bambeh dey check every entry before e show. Wetin you send here no dey visible until our team don check am.',
    pharmacy: 'Pharmacy', hospital: 'Hospital',
    name: 'Name', town: 'Town', quarter: 'Quarter', address: 'Address',
    phone: 'Phone number', whatsapp: 'WhatsApp number',
    contactNote: 'Use di number of di business, no be personal one.',
    oxygen: 'We get oxygen', ambulance: 'We get ambulance', emergency: 'We dey open 24 hours',
    notes: 'Anything else wey people suppose know',
    send: 'Send make dem check', sending: 'E dey go…',
    okTitle: 'We don receive am',
    okBody: 'Thank you. Our team go check di details and your listing go show once dem verify am. We fit call di number wey you give.',
    another: 'Send another one',
    needName: 'Abeg put di name and di town.',
    needAuth: 'Abeg sign in first, make we fit reach you.',
    failed: 'E no send. Abeg try again.',
  },
  ar: {
    title: 'أضف خدمتك', back: 'رجوع',
    intro: 'أضف صيدليتك أو مستشفاك ليجدك الناس. مجاناً.',
    notice: 'يتحقق بامبيه من كل إدخال قبل ظهوره. لا شيء ترسله هنا يظهر للمستخدمين حتى يتحقق فريقنا منه.',
    pharmacy: 'صيدلية', hospital: 'مستشفى',
    name: 'الاسم', town: 'المدينة', quarter: 'الحي', address: 'العنوان',
    phone: 'رقم الهاتف', whatsapp: 'رقم واتساب',
    contactNote: 'استخدم رقم المنشأة، وليس رقماً شخصياً.',
    oxygen: 'لدينا أكسجين', ambulance: 'لدينا سيارة إسعاف', emergency: 'نفتح 24 ساعة',
    notes: 'أي شيء آخر ينبغي أن يعرفه الناس',
    send: 'إرسال للتحقق', sending: 'جارٍ الإرسال…',
    okTitle: 'أُرسل للتحقق',
    okBody: 'شكراً لك. سيتحقق فريقنا من البيانات وستظهر بطاقتك بعد التحقق. قد نتصل بك على الرقم الذي أدخلته.',
    another: 'إرسال آخر',
    needName: 'من فضلك أدخل الاسم والمدينة.',
    needAuth: 'من فضلك سجّل الدخول أولاً حتى نتمكن من التواصل معك.',
    failed: 'تعذّر الإرسال. حاول مرة أخرى.',
  },
  ff: {
    title: 'Winndu golle maa', back: 'Rutto',
    intro: 'Ɓeydu farmasi maa walla opitaal maa ngam yimɓe ina njiyta ma. Ko meere.',
    notice: 'Bambeh ina ƴeewa kala winndannde ado nde feeñde. Ko neldu-ɗaa ɗoo feeñataa haa hoore-golle amen ƴeewii ɗum.',
    pharmacy: 'Farmasi', hospital: 'Opitaal',
    name: 'Innde', town: 'Saare', quarter: 'Leydi', address: 'Ñiiɓirde',
    phone: 'Limngal noddirgal', whatsapp: 'Limngal WhatsApp',
    contactNote: 'Huutoro limngal golle ɗe, wanaa limngal maa keeriingal.',
    oxygen: 'Eɗen njogii oksijen', ambulance: 'Eɗen njogii ambilaas', emergency: 'Eɗen udditi waktuuji 24',
    notes: 'Ko heddii ko yimɓe poti anndude',
    send: 'Neldu ngam ƴeewde', sending: 'Ina nelda…',
    okTitle: 'Neldaama ngam ƴeewde',
    okBody: 'A jaaraama. Hoore-golle amen ƴeewat kabaruuji ɗi, winndannde maa feeñat caggal ƴeewndo. Eɗen mbaawi noddude ma e limngal ngal njokku-ɗaa.',
    another: 'Neldu goɗɗo',
    needName: 'Tiiɗno joƴƴin innde e saare.',
    needAuth: 'Tiiɗno naat tawo, ngam min mbaawa heɓde ma.',
    failed: 'Neldaaki. Tiiɗno ndaarndo kadi.',
  },
};
const tr = (l: string, k: string) => (STR[l] && STR[l][k]) || STR.en[k] || k;

const INPUT =
  'mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-300';

export default function ListMyService() {
  const navigate = useNavigate();
  const raw: unknown = useLang();
  const lang = typeof raw === 'string' ? raw : 'en';
  const isRtl = lang === 'ar';
  const t = (k: string) => tr(lang, k);

  const [kind, setKind] = useState<Kind>('pharmacy');
  const [name, setName] = useState('');
  const [town, setTown] = useState('');
  const [quarter, setQuarter] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [notes, setNotes] = useState('');
  const [oxygen, setOxygen] = useState(false);
  const [ambulance, setAmbulance] = useState(false);
  const [emergency, setEmergency] = useState(true);

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName(''); setTown(''); setQuarter(''); setAddress('');
    setPhone(''); setWhatsapp(''); setNotes('');
    setOxygen(false); setAmbulance(false); setEmergency(true);
    setSent(false); setError(null);
  };

  const submit = async () => {
    if (!name.trim() || !town.trim()) { setError(t('needName')); return; }
    setError(null);
    setSending(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id;
      // submitted_by must point at a real person we can go back to, and the
      // RLS policy requires it to equal auth.uid().
      if (!uid) { setError(t('needAuth')); return; }

      const common = {
        name: name.trim(),
        town: town.trim(),
        quarter: quarter.trim() || null,
        address: address.trim() || null,
        whatsapp: whatsapp.trim() || null,
        notes: notes.trim() || null,
        is_verified: false,        // the policy enforces this too
        submitted_by: uid,
      };

      const { error: err } = kind === 'pharmacy'
        ? await supabase.from('pharmacies').insert({ ...common, phone: phone.trim() || null })
        : await supabase.from('hospitals').insert({
            ...common,
            contact_phone: phone.trim() || null,
            has_oxygen: oxygen,
            has_ambulance: ambulance,
            has_emergency: emergency,
          });
      if (err) throw err;
      setSent(true);
    } catch {
      setError(t('failed'));
    } finally {
      setSending(false);
    }
  };

  const pill = (on: boolean) =>
    `flex-1 rounded-xl border py-3 text-sm font-semibold flex items-center justify-center gap-2 ${
      on ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 bg-white text-gray-600'
    }`;

  return (
    <div className="min-h-screen bg-gray-50 pb-10" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ms-2 rounded-xl hover:bg-gray-100" aria-label={t('back')}>
          <ArrowLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
        </button>
        <h1 className="font-bold text-gray-900">{t('title')}</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        {sent ? (
          <div className="bg-white rounded-2xl border border-emerald-100 p-5 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
            <p className="font-bold text-gray-900">{t('okTitle')}</p>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">{t('okBody')}</p>
            <button onClick={reset}
              className="mt-4 w-full rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              {t('another')}
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600">{t('intro')}</p>

            <div className="rounded-2xl bg-teal-50 border border-teal-100 p-3 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
              <p className="text-[11px] text-teal-900 leading-relaxed">{t('notice')}</p>
            </div>

            <div className="flex gap-2">
              <button type="button" onClick={() => setKind('pharmacy')} className={pill(kind === 'pharmacy')}>
                <Cross className="w-4 h-4" /> {t('pharmacy')}
              </button>
              <button type="button" onClick={() => setKind('hospital')} className={pill(kind === 'hospital')}>
                <Stethoscope className="w-4 h-4" /> {t('hospital')}
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
              <label className="block">
                <span className="text-xs font-semibold text-gray-700">{t('name')} *</span>
                <input value={name} onChange={(e) => setName(e.target.value)} className={INPUT} />
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="text-xs font-semibold text-gray-700">{t('town')} *</span>
                  <input value={town} onChange={(e) => setTown(e.target.value)} className={INPUT} />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-gray-700">{t('quarter')}</span>
                  <input value={quarter} onChange={(e) => setQuarter(e.target.value)} className={INPUT} />
                </label>
              </div>

              <label className="block">
                <span className="text-xs font-semibold text-gray-700">{t('address')}</span>
                <input value={address} onChange={(e) => setAddress(e.target.value)} className={INPUT} />
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="text-xs font-semibold text-gray-700">{t('phone')}</span>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} className={INPUT} dir="ltr" />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-gray-700">{t('whatsapp')}</span>
                  <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className={INPUT} dir="ltr" />
                </label>
              </div>
              <p className="text-[11px] text-gray-500 -mt-1">{t('contactNote')}</p>

              {kind === 'hospital' ? (
                <div className="space-y-2 pt-1 border-t border-gray-100">
                  {([
                    ['emergency', emergency, setEmergency, null],
                    ['oxygen', oxygen, setOxygen, <Wind key="w" className="w-4 h-4 text-sky-600" />],
                    ['ambulance', ambulance, setAmbulance, <Ambulance key="a" className="w-4 h-4 text-emerald-600" />],
                  ] as const).map(([key, val, setter, icon]) => (
                    <label key={key} className="flex items-center gap-2 text-sm text-gray-700">
                      <input type="checkbox" checked={val as boolean}
                        onChange={(e) => (setter as (v: boolean) => void)(e.target.checked)}
                        className="w-4 h-4 accent-teal-600" />
                      {icon}
                      {t(key as string)}
                    </label>
                  ))}
                </div>
              ) : null}

              <label className="block">
                <span className="text-xs font-semibold text-gray-700">{t('notes')}</span>
                <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}
                  className={`${INPUT} resize-none`} />
              </label>
            </div>

            {error ? (
              <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-xs">{error}</p>
              </div>
            ) : null}

            <button onClick={submit} disabled={sending}
              className="w-full rounded-xl bg-teal-600 hover:bg-teal-700 text-white py-3 font-semibold disabled:bg-gray-300 flex items-center justify-center gap-2">
              {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> {t('sending')}</> : t('send')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__LISTMYSERVICE_FIX490__COMPLETE
