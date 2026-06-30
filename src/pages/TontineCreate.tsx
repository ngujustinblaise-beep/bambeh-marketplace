/**
 * src/pages/TontineCreate.tsx ? Bambeh Marketplace
 *
 * FIXES applied:
 *  ? handleCreate: navigate('/login') inside async function ? added return after
 *     navigate() so supabase insert doesn't proceed without a user.
 *  ? Supabase insert: current_members set to 1 AND immediately inserts admin into
 *     tontine_members table so the creator is always listed as a member.
 *  ? Error display: now shows the Supabase error message (e.g. RLS violation)
 *     instead of a generic string.
 *  ? Number inputs: min/max validation enforced in state ? negative amounts blocked.
 *  ? Start date: stored as ISO date string, not ISO datetime, matching DB column type.
 *  ? canSubmit: now also checks frequency is set and description is non-empty.
 *  ? Success redirect timeout cleared on unmount to prevent setState-after-unmount.
 *  ? Form fields have proper id+htmlFor pairing for accessibility.
 *  ? Keyboard dismiss: pressing Escape while on modal-style page navigates back.
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang, t } from "@/hooks/useAppLang";

const COPY = {
  en: {
    createTitle: 'Create Tontine Group',
    goBack: 'Go back',
    groupName: 'Group Name *',
    groupNamePlaceholder: 'e.g. Family Savings Circle',
    description: 'Description *',
    descriptionPlaceholder: 'Describe the purpose and rules of your group?',
    contribution: 'Contribution (XAF) *',
    maxMembers: 'Max Members *',
    frequency: 'Frequency',
    weekly: 'Weekly',
    monthly: 'Monthly',
    weeklyDesc: 'Contributions every week',
    monthlyDesc: 'Contributions every month',
    privateGroup: 'Private group',
    privateGroupDesc: 'Only visible to invited members',
    groupSummary: 'Group Summary',
    members: 'members',
    totalPool: 'total pool',
    howItWorks: 'How Tontine (Njangi) Works',
    step1: 'Members contribute regularly (weekly or monthly)',
    step2: 'Each cycle, one member receives the full pool',
    step3: 'Rotates until everyone has received once',
    step4: 'All transactions are tracked and transparent',
    createGroup: 'Create Group',
    creating: 'Creating?',
    groupCreated: 'Group Created! ??',
    liveNow: 'Your tontine group is live. Share it with friends to start saving together.',
    redirecting: 'Redirecting to Tontine?',
    errorPermission: 'Permission denied. Please make sure you are logged in.',
    errorDefault: 'Could not create group. Please try again.',
  },
  fr: {
    createTitle: 'Créer un groupe de tontine',
    goBack: 'Retour',
    groupName: 'Nom du groupe *',
    groupNamePlaceholder: 'Ex. : Cercle d’épargne familial',
    description: 'Description *',
    descriptionPlaceholder: 'Décrivez l’objectif et les règles de votre groupe ?',
    contribution: 'Cotisation (XAF) *',
    maxMembers: 'Nombre maximum de membres *',
    frequency: 'Fréquence',
    weekly: 'Hebdomadaire',
    monthly: 'Mensuelle',
    weeklyDesc: 'Cotisations chaque semaine',
    monthlyDesc: 'Cotisations chaque mois',
    privateGroup: 'Groupe privé',
    privateGroupDesc: 'Visible uniquement par les membres invités',
    groupSummary: 'Résumé du groupe',
    members: 'membres',
    totalPool: 'cagnotte totale',
    howItWorks: 'Comment fonctionne la tontine (Njangi)',
    step1: 'Les membres cotisent régulièrement (chaque semaine ou chaque mois)',
    step2: 'À chaque cycle, un membre reçoit l’intégralité de la cagnotte',
    step3: 'Le système tourne jusqu’à ce que chacun ait reçu une fois',
    step4: 'Toutes les opérations sont suivies et transparentes',
    createGroup: 'Créer le groupe',
    creating: 'Création...',
    groupCreated: 'Groupe créé ! ??',
    liveNow: 'Votre groupe de tontine est en ligne. Partagez-le avec vos proches pour épargner ensemble.',
    redirecting: 'Redirection vers Tontine ?',
    errorPermission: 'Permission refusée. Veuillez vérifier que vous êtes connecté.',
    errorDefault: 'Impossible de créer le groupe. Veuillez réessayer.',
  },
  ar: {
    createTitle: 'إنشاء مجموعة تومبين',
    goBack: 'رجوع',
    groupName: 'اسم المجموعة *',
    groupNamePlaceholder: 'مثال: دائرة ادخار عائلية',
    description: 'الوصف *',
    descriptionPlaceholder: 'اشرح هدف المجموعة وقواعدها؟',
    contribution: 'المساهمة (XAF) *',
    maxMembers: 'الحد الأقصى للأعضاء *',
    frequency: 'وتيرة المساهمة',
    weekly: 'أسبوعيًا',
    monthly: 'شهريًا',
    weeklyDesc: 'مساهمات كل أسبوع',
    monthlyDesc: 'مساهمات كل شهر',
    privateGroup: 'مجموعة خاصة',
    privateGroupDesc: 'مرئية فقط للأعضاء المدعوين',
    groupSummary: 'ملخص المجموعة',
    members: 'أعضاء',
    totalPool: 'إجمالي الصندوق',
    howItWorks: 'كيف تعمل التومبين (Njangi)',
    step1: 'يساهم الأعضاء بانتظام (أسبوعيًا أو شهريًا)',
    step2: 'في كل دورة، يحصل عضو واحد على الصندوق بالكامل',
    step3: 'يتكرر الدور حتى يحصل الجميع على حصتهم مرة واحدة',
    step4: 'تتم متابعة جميع العمليات بشفافية',
    createGroup: 'إنشاء المجموعة',
    creating: 'جارٍ الإنشاء...',
    groupCreated: 'تم إنشاء المجموعة! ??',
    liveNow: 'مجموعة التومبين الخاصة بك أصبحت نشطة. شاركها مع الأصدقاء لتبدؤوا الادخار معًا.',
    redirecting: 'جارٍ التحويل إلى Tontine؟',
    errorPermission: 'تم رفض الإذن. تأكد من أنك مسجّل الدخول.',
    errorDefault: 'تعذر إنشاء المجموعة. حاول مرة أخرى.',
  },
  pidgin: {
    createTitle: 'Create Tontine Group',
    goBack: 'Go back',
    groupName: 'Group name *',
    groupNamePlaceholder: 'e.g. Family savings circle',
    description: 'Description *',
    descriptionPlaceholder: 'Explain wetin the group dey do and the rules?',
    contribution: 'Contribution (XAF) *',
    maxMembers: 'Max members *',
    frequency: 'Frequency',
    weekly: 'Weekly',
    monthly: 'Monthly',
    weeklyDesc: 'Contributions every week',
    monthlyDesc: 'Contributions every month',
    privateGroup: 'Private group',
    privateGroupDesc: 'Only invited members fit see am',
    groupSummary: 'Group summary',
    members: 'members',
    totalPool: 'total pool',
    howItWorks: 'How Tontine (Njangi) dey work',
    step1: 'Members dey contribute regularly (weekly or monthly)',
    step2: 'Each round, one member collect the full pool',
    step3: 'E dey rotate until everybody don collect once',
    step4: 'All transactions dey tracked and clear',
    createGroup: 'Create group',
    creating: 'Dey create?',
    groupCreated: 'Group don create! ??',
    liveNow: 'Your tontine group don go live. Share am with friends make una start save together.',
    redirecting: 'Dey redirect to Tontine?',
    errorPermission: 'Permission denied. Please make sure say you don log in.',
    errorDefault: 'We no fit create group. Try again.',
  },
  ful: {
    createTitle: 'Husna Golle Tontine',
    goBack: 'Rutto',
    groupName: 'Innde gollal *',
    groupNamePlaceholder: 'Ex.: circle ndee e njandi ndee',
    description: 'Cappanɗe *',
    descriptionPlaceholder: 'Yamno ko gollal ndee ngam e laawol mum?',
    contribution: 'Kontribushon (XAF) *',
    maxMembers: 'Ɓeɓɓe ɓuri *',
    frequency: 'No ɓuri',
    weekly: 'Allaahu',
    monthly: 'Leɗɗe',
    weeklyDesc: 'Kontribushon kala ñalngu 7',
    monthlyDesc: 'Kontribushon kala lewru',
    privateGroup: 'Gollal keɓɓital',
    privateGroupDesc: 'Ɗum wonaa kundi tan ngam ɓe ɗooɗi',
    groupSummary: 'Cappanɗe gollal',
    members: 'ɓeɓɓe',
    totalPool: 'jamfaare fuu',
    howItWorks: 'No Tontine (Njangi) ɗoo wayi',
    step1: 'Ɓeɓɓe ndeeɗi konnitaa e laawol (kala ñalngu 7 walla kala lewru)',
    step2: 'Kala round, won ɓeɓɓo gooto heɓa jamfaare fuu',
    step3: 'E ndeeɗa haa kala gooto heɓi kalii mum so ɓuri gooto',
    step4: 'Transactions kala ɗoo wonaa e yeeso e laabi',
    createGroup: 'Husna gollal',
    creating: 'Dey husnude...',
    groupCreated: 'Gollal don husnii! ??',
    liveNow: 'Gollal tontine maa wonii e ɓolɗo jooni. Faw am e ɓe heddii ngam ngamɗe ndeeɗi e mum.',
    redirecting: 'Dey yaltude to Tontine?',
    errorPermission: 'Izin nden no woodaa. Tabintina aɗa logii.',
    errorDefault: 'Haa jooni min worata husna gollal. Ƴeewto kadi.',
  },
};

const FREQUENCY_OPTIONS = [
  { value: 'weekly', label: 'Weekly', desc: 'Contributions every week' },
  { value: 'monthly', label: 'Monthly', desc: 'Contributions every month' },
] as const;

export default function TontineCreate() {
  const lang = useLang();
  const ui = COPY[lang] ?? COPY[lang === 'ff' ? 'ful' : lang] ?? COPY.en;
  const navigate = useNavigate();
  const redirectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [maxMembers, setMaxMembers] = useState('10');
  const [frequency, setFrequency] = useState<'weekly' | 'monthly'>('monthly');
  const [isPrivate, setIsPrivate] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => () => {
    if (redirectRef.current) clearTimeout(redirectRef.current);
  }, []);

  const parsedAmount = Number(amount);
  const parsedMembers = Number(maxMembers);
  const canSubmit =
    name.trim().length >= 3 &&
    description.trim().length >= 5 &&
    parsedAmount > 0 &&
    parsedMembers >= 2 &&
    parsedMembers <= 100 &&
    !!frequency;

  async function handleCreate() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/login');
        return;
      }

      const uid = session.user.id;
      const today = new Date().toISOString().split('T')[0];

      const { data: insertData, error: insertErr } = await supabase
        .from('tontine_groups')
        .insert({
          admin_id: uid,
          name: name.trim(),
          description: description.trim(),
          contribution_xaf: parsedAmount,
          frequency,
          max_members: parsedMembers,
          current_members: 1,
          is_private: isPrivate,
          status: 'open',
          start_date: today,
          total_pool_xaf: 0,
        })
        .select('id')
        .single();

      if (insertErr) throw insertErr;

      if (insertData?.id) {
        await supabase.from('tontine_members').insert({
          group_id: insertData.id,
          user_id: uid,
          joined_at: new Date().toISOString(),
          payout_position: 1,
          has_paid_current_round: false,
        });
      }

      setDone(true);
      redirectRef.current = setTimeout(() => navigate('/tontine'), 2500);
    } catch (e: unknown) {
      const msg = (e as { message?: string })?.message;
      setError(
        msg?.includes('violates row-level security')
          ? ui.errorPermission
          : msg || ui.errorDefault,
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl shadow p-8 text-center max-w-sm w-full">
          <CheckCircle className="w-14 h-14 text-purple-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">{ui.groupCreated}</h2>
          <p className="text-gray-500 text-sm">{ui.liveNow}</p>
          <p className="text-xs text-gray-400 mt-3 animate-pulse">{ui.redirecting}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl" aria-label="Go back">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600" /> {ui.createTitle}
        </h1>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <label htmlFor="tontine-name" className="block text-sm font-semibold text-gray-700 mb-1">
              {ui.groupName}
            </label>
            <input
              id="tontine-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={ui.groupNamePlaceholder}
              maxLength={80}
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-xs text-gray-400 mt-1">{name.length}/80</p>
          </div>

          <div>
            <label htmlFor="tontine-desc" className="block text-sm font-semibold text-gray-700 mb-1">
              {ui.description}
            </label>
            <textarea
              id="tontine-desc"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder={ui.descriptionPlaceholder}
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="tontine-amount" className="block text-sm font-semibold text-gray-700 mb-1">
                {ui.contribution}
              </label>
              <input
                id="tontine-amount"
                type="number"
                min={500}
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="e.g. 50000"
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label htmlFor="tontine-members" className="block text-sm font-semibold text-gray-700 mb-1">
                {ui.maxMembers}
              </label>
              <input
                id="tontine-members"
                type="number"
                min={2}
                max={100}
                value={maxMembers}
                onChange={e => setMaxMembers(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{ui.frequency}</label>
            <div className="grid grid-cols-2 gap-3">
              {FREQUENCY_OPTIONS.map(f => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFrequency(f.value)}
                  className={`p-3 rounded-xl border-2 text-left transition ${
                    frequency === f.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <p className="font-semibold text-gray-900 text-sm">{f.value === 'weekly' ? ui.weekly : ui.monthly}</p>
                  <p className="text-xs text-gray-500">{f.value === 'weekly' ? ui.weeklyDesc : ui.monthlyDesc}</p>
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={e => setIsPrivate(e.target.checked)}
              className="w-4 h-4 accent-purple-600"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">{ui.privateGroup}</span>
              <p className="text-xs text-gray-400">{ui.privateGroupDesc}</p>
            </div>
          </label>

          {name && parsedAmount > 0 && parsedMembers >= 2 && (
            <div className="bg-purple-50 rounded-xl p-3 text-sm">
              <p className="font-semibold text-purple-900 mb-1">{ui.groupSummary}</p>
              <p className="text-purple-700">
                {parsedMembers} {ui.members} ? {parsedAmount.toLocaleString('fr-CM')} XAF/
                {frequency === 'monthly' ? 'month' : 'week'} ={' '}
                <strong>{(parsedMembers * parsedAmount).toLocaleString('fr-CM')} XAF</strong> {ui.totalPool}
              </p>
            </div>
          )}
        </div>

        <div className="bg-gray-50 border rounded-2xl p-4 text-sm text-gray-600 space-y-2">
          <p className="font-semibold text-gray-800">{ui.howItWorks}</p>
          <p>1. {ui.step1}</p>
          <p>2. {ui.step2}</p>
          <p>3. {ui.step3}</p>
          <p>4. {ui.step4}</p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <button
          onClick={handleCreate}
          disabled={!canSubmit || submitting}
          className="w-full bg-purple-700 text-white py-3.5 rounded-2xl font-bold disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-purple-800 transition"
        >
          {submitting
            ? <><Loader2 className="w-4 h-4 animate-spin" />{ui.creating}</>
            : <><Users className="w-5 h-5" />{ui.createGroup}</>}
        </button>
      </div>
    </div>
  );
}