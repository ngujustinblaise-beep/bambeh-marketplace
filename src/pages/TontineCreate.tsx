// BAMBEH_DEPLOY_TOKEN__TONTINECREATE_FIX162_CLEAN
/**
 * TontineCreate.tsx \u2014 Bambeh Marketplace (FIX162)
 * DEPLOY TO BOTH: src/routes/groups/community/TontineCreate.tsx (ROUTED /tontine/create)
 *            AND: src/pages/TontineCreate.tsx (mirror copy if present)
 *
 * FIX162:
 *  \u2022 Mojibaked characters ("??", "?" ellipses/bullets) repaired with real glyphs.
 *  \u2022 Full 5-language dictionary (EN/FR/Pidgin/AR-RTL/FF) \u2014 page was English-only.
 *  \u2022 ALL create logic kept exactly: login guard with return, insert with
 *    current_members=1 + admin auto-added to tontine_members, RLS-aware error,
 *    date-only start_date, validation, redirect timer cleanup.
 * \u00a9 2026 BAMBEH SARL. All rights reserved.
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, CheckCircle, Loader2, AlertCircle, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';

type Lang = 'en' | 'fr' | 'pidgin' | 'ar' | 'ff';

const T: Record<Lang, {
  pageTitle: string; nameLabel: string; namePh: string;
  descLabel: string; descPh: string;
  amountLabel: string; amountPh: string; membersLabel: string;
  freqLabel: string; weekly: string; weeklyDesc: string; monthly: string; monthlyDesc: string;
  privateTitle: string; privateDesc: string;
  summaryTitle: string; month: string; week: string; totalPool: string;
  howTitle: string; how1: string; how2: string; how3: string; how4: string;
  createBtn: string; creating: string;
  doneTitle: string; doneBody: string; redirecting: string;
  permDenied: string; genericErr: string; goBack: string;
}> = {
  en: {
    pageTitle: 'Create Tontine Group',
    nameLabel: 'Group Name *', namePh: 'e.g. Family Savings Circle',
    descLabel: 'Description *', descPh: 'Describe the purpose and rules of your group\u2026',
    amountLabel: 'Contribution (XAF) *', amountPh: 'e.g. 50000', membersLabel: 'Max Members *',
    freqLabel: 'Frequency', weekly: 'Weekly', weeklyDesc: 'Contributions every week',
    monthly: 'Monthly', monthlyDesc: 'Contributions every month',
    privateTitle: 'Private group', privateDesc: 'Only visible to invited members',
    summaryTitle: 'Group Summary', month: 'month', week: 'week', totalPool: 'total pool',
    howTitle: 'How Tontine (Njangi) Works',
    how1: '1. Members contribute regularly (weekly or monthly)',
    how2: '2. Each cycle, one member receives the full pool',
    how3: '3. Rotates until everyone has received once',
    how4: '4. All transactions are tracked and transparent',
    createBtn: 'Create Group', creating: 'Creating\u2026',
    doneTitle: 'Group Created!', doneBody: 'Your tontine group is live. Share it with friends to start saving together.',
    redirecting: 'Redirecting to Tontine\u2026',
    permDenied: 'Permission denied. Please make sure you are logged in.',
    genericErr: 'Could not create group. Please try again.', goBack: 'Go back',
  },
  fr: {
    pageTitle: 'Cr\u00e9er un groupe Tontine',
    nameLabel: 'Nom du groupe *', namePh: 'ex. Cercle d\u2019\u00e9pargne familial',
    descLabel: 'Description *', descPh: 'D\u00e9crivez le but et les r\u00e8gles de votre groupe\u2026',
    amountLabel: 'Cotisation (XAF) *', amountPh: 'ex. 50000', membersLabel: 'Membres max *',
    freqLabel: 'Fr\u00e9quence', weekly: 'Hebdomadaire', weeklyDesc: 'Cotisations chaque semaine',
    monthly: 'Mensuelle', monthlyDesc: 'Cotisations chaque mois',
    privateTitle: 'Groupe priv\u00e9', privateDesc: 'Visible uniquement par les membres invit\u00e9s',
    summaryTitle: 'R\u00e9sum\u00e9 du groupe', month: 'mois', week: 'semaine', totalPool: 'cagnotte totale',
    howTitle: 'Comment fonctionne la tontine (Njangi)',
    how1: '1. Les membres cotisent r\u00e9guli\u00e8rement (chaque semaine ou mois)',
    how2: '2. \u00c0 chaque cycle, un membre re\u00e7oit toute la cagnotte',
    how3: '3. Rotation jusqu\u2019\u00e0 ce que chacun ait re\u00e7u une fois',
    how4: '4. Toutes les transactions sont suivies et transparentes',
    createBtn: 'Cr\u00e9er le groupe', creating: 'Cr\u00e9ation\u2026',
    doneTitle: 'Groupe cr\u00e9\u00e9 !', doneBody: 'Votre groupe tontine est en ligne. Partagez-le avec vos amis pour \u00e9pargner ensemble.',
    redirecting: 'Redirection vers Tontine\u2026',
    permDenied: 'Permission refus\u00e9e. V\u00e9rifiez que vous \u00eates connect\u00e9.',
    genericErr: 'Impossible de cr\u00e9er le groupe. R\u00e9essayez.', goBack: 'Retour',
  },
  pidgin: {
    pageTitle: 'Create Tontine Group',
    nameLabel: 'Group Name *', namePh: 'e.g. Family Savings Circle',
    descLabel: 'Description *', descPh: 'Talk wetin the group dey for and the rules\u2026',
    amountLabel: 'Contribution (XAF) *', amountPh: 'e.g. 50000', membersLabel: 'Max Members *',
    freqLabel: 'Frequency', weekly: 'Weekly', weeklyDesc: 'Contribution every week',
    monthly: 'Monthly', monthlyDesc: 'Contribution every month',
    privateTitle: 'Private group', privateDesc: 'Na only people wey you invite go see am',
    summaryTitle: 'Group Summary', month: 'month', week: 'week', totalPool: 'total pool',
    howTitle: 'How Tontine (Njangi) dey work',
    how1: '1. Members dey contribute steady (weekly or monthly)',
    how2: '2. Every cycle, one member collect the full pool',
    how3: '3. E dey rotate till everybody don collect one time',
    how4: '4. All transaction dem dey tracked, everything open',
    createBtn: 'Create Group', creating: 'We dey create am\u2026',
    doneTitle: 'Group don create!', doneBody: 'Your tontine group don live. Share am with your padi dem make una start to save together.',
    redirecting: 'We dey carry you go Tontine\u2026',
    permDenied: 'Permission denied. Make sure say you don login.',
    genericErr: 'Group no gree create. Try again.', goBack: 'Go back',
  },
  ar: {
    pageTitle: '\u0625\u0646\u0634\u0627\u0621 \u0645\u062c\u0645\u0648\u0639\u0629 \u062a\u0648\u0646\u062a\u064a\u0646',
    nameLabel: '\u0627\u0633\u0645 \u0627\u0644\u0645\u062c\u0645\u0648\u0639\u0629 *', namePh: '\u0645\u062b\u0627\u0644: \u062f\u0627\u0626\u0631\u0629 \u0627\u062f\u062e\u0627\u0631 \u0627\u0644\u0639\u0627\u0626\u0644\u0629',
    descLabel: '\u0627\u0644\u0648\u0635\u0641 *', descPh: '\u0635\u0641 \u0647\u062f\u0641 \u0627\u0644\u0645\u062c\u0645\u0648\u0639\u0629 \u0648\u0642\u0648\u0627\u0639\u062f\u0647\u0627\u2026',
    amountLabel: '\u0627\u0644\u0645\u0633\u0627\u0647\u0645\u0629 (XAF) *', amountPh: '\u0645\u062b\u0627\u0644: 50000', membersLabel: '\u0623\u0642\u0635\u0649 \u0639\u062f\u062f \u0623\u0639\u0636\u0627\u0621 *',
    freqLabel: '\u0627\u0644\u0648\u062a\u064a\u0631\u0629', weekly: '\u0623\u0633\u0628\u0648\u0639\u064a\u0629', weeklyDesc: '\u0645\u0633\u0627\u0647\u0645\u0627\u062a \u0643\u0644 \u0623\u0633\u0628\u0648\u0639',
    monthly: '\u0634\u0647\u0631\u064a\u0629', monthlyDesc: '\u0645\u0633\u0627\u0647\u0645\u0627\u062a \u0643\u0644 \u0634\u0647\u0631',
    privateTitle: '\u0645\u062c\u0645\u0648\u0639\u0629 \u062e\u0627\u0635\u0629', privateDesc: '\u0645\u0631\u0626\u064a\u0629 \u0641\u0642\u0637 \u0644\u0644\u0623\u0639\u0636\u0627\u0621 \u0627\u0644\u0645\u062f\u0639\u0648\u064a\u0646',
    summaryTitle: '\u0645\u0644\u062e\u0635 \u0627\u0644\u0645\u062c\u0645\u0648\u0639\u0629', month: '\u0634\u0647\u0631', week: '\u0623\u0633\u0628\u0648\u0639', totalPool: '\u0625\u062c\u0645\u0627\u0644\u064a \u0627\u0644\u0635\u0646\u062f\u0648\u0642',
    howTitle: '\u0643\u064a\u0641 \u062a\u0639\u0645\u0644 \u0627\u0644\u062a\u0648\u0646\u062a\u064a\u0646 (\u0646\u062c\u0627\u0646\u062c\u064a)',
    how1: '1. \u064a\u0633\u0627\u0647\u0645 \u0627\u0644\u0623\u0639\u0636\u0627\u0621 \u0628\u0627\u0646\u062a\u0638\u0627\u0645 (\u0623\u0633\u0628\u0648\u0639\u064a\u064b\u0627 \u0623\u0648 \u0634\u0647\u0631\u064a\u064b\u0627)',
    how2: '2. \u0641\u064a \u0643\u0644 \u062f\u0648\u0631\u0629\u060c \u064a\u062a\u0633\u0644\u0645 \u0639\u0636\u0648 \u0648\u0627\u062d\u062f \u0643\u0627\u0645\u0644 \u0627\u0644\u0635\u0646\u062f\u0648\u0642',
    how3: '3. \u062a\u0633\u062a\u0645\u0631 \u0627\u0644\u0645\u062f\u0627\u0648\u0631\u0629 \u062d\u062a\u0649 \u064a\u062a\u0633\u0644\u0645 \u0627\u0644\u062c\u0645\u064a\u0639 \u0645\u0631\u0629 \u0648\u0627\u062d\u062f\u0629',
    how4: '4. \u062c\u0645\u064a\u0639 \u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0627\u062a \u0645\u062a\u062a\u0628\u0639\u0629 \u0648\u0634\u0641\u0627\u0641\u0629',
    createBtn: '\u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0645\u062c\u0645\u0648\u0639\u0629', creating: '\u062c\u0627\u0631\u064d \u0627\u0644\u0625\u0646\u0634\u0627\u0621\u2026',
    doneTitle: '\u062a\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0645\u062c\u0645\u0648\u0639\u0629!', doneBody: '\u0645\u062c\u0645\u0648\u0639\u062a\u0643 \u0623\u0635\u0628\u062d\u062a \u062c\u0627\u0647\u0632\u0629. \u0634\u0627\u0631\u0643\u0647\u0627 \u0645\u0639 \u0623\u0635\u062f\u0642\u0627\u0626\u0643 \u0644\u062a\u0628\u062f\u0624\u0648\u0627 \u0627\u0644\u0627\u062f\u062e\u0627\u0631 \u0645\u0639\u064b\u0627.',
    redirecting: '\u062c\u0627\u0631\u064d \u0627\u0644\u062a\u062d\u0648\u064a\u0644 \u0625\u0644\u0649 \u0627\u0644\u062a\u0648\u0646\u062a\u064a\u0646\u2026',
    permDenied: '\u062a\u0645 \u0631\u0641\u0636 \u0627\u0644\u0625\u0630\u0646. \u062a\u0623\u0643\u062f \u0645\u0646 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644.',
    genericErr: '\u062a\u0639\u0630\u0631 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0645\u062c\u0645\u0648\u0639\u0629. \u062d\u0627\u0648\u0644 \u0645\u062c\u062f\u062f\u064b\u0627.', goBack: '\u0631\u062c\u0648\u0639',
  },
  ff: {
    pageTitle: 'Sosu Fedde Tontine',
    nameLabel: 'Innde fedde *', namePh: 'yeru: Fedde danndugol \u0253esngu',
    descLabel: 'Sifaa *', descPh: 'Sifo faandaare e laabi fedde maa\u2026',
    amountLabel: 'Tontagol (XAF) *', amountPh: 'yeru: 50000', membersLabel: 'Keerol yim\u0253e *',
    freqLabel: 'Laawol', weekly: 'Yontere kala', weeklyDesc: 'Tontagol yontere kala',
    monthly: 'Lewru kala', monthlyDesc: 'Tontagol lewru kala',
    privateTitle: 'Fedde suu\u0257iinde', privateDesc: 'Ko yim\u0253e noddaa\u0253e tan njiyata nde',
    summaryTitle: 'Tonngol fedde', month: 'lewru', week: 'yontere', totalPool: 'kaalis fof',
    howTitle: 'No Tontine (Njangi) gollortoo',
    how1: '1. Yim\u0253e ina tontoo laawol kala (yontere walla lewru)',
    how2: '2. Laawol kala, gooto he\u0253a kaalis oo fof',
    how3: '3. Ina yiiloo haa gooto kala he\u0253ii laawol gootol',
    how4: '4. Golle fof ina ndewindaa, ina laa\u0253i',
    createBtn: 'Sosu Fedde', creating: 'Sosgol\u2026',
    doneTitle: 'Fedde sosaama!', doneBody: 'Fedde tontine maa ina huu\u0253ni. Lollin nde e yi\u0257\u0253e maa ngam danndude e dental.',
    redirecting: 'Ruttagol to Tontine\u2026',
    permDenied: 'Jamirooje nda\u0257ii. \u01b3eewto so a naatii.',
    genericErr: 'Fedde sosaaki. E\u0257\u0257itto.', goBack: 'Rutto',
  },
};

export default function TontineCreate() {
  const langRaw = useLang() as unknown;
  const langKey = typeof langRaw === 'string' ? langRaw : (langRaw as { lang?: string })?.lang || 'en';
  const lang: Lang = (langKey in T ? langKey : 'en') as Lang;
  const s = T[lang];
  const isRtl = lang === 'ar';
  const navigate = useNavigate();
  const redirectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [name,        setName]        = useState('');
  const [description, setDescription] = useState('');
  const [amount,      setAmount]      = useState('');
  const [maxMembers,  setMaxMembers]  = useState('10');
  const [frequency,   setFrequency]   = useState<'weekly' | 'monthly'>('monthly');
  const [isPrivate,   setIsPrivate]   = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [done,       setDone]       = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  // Cleanup redirect timer on unmount
  useEffect(() => () => {
    if (redirectRef.current) clearTimeout(redirectRef.current);
  }, []);

  const FREQUENCY_OPTIONS = [
    { value: 'weekly'  as const, label: s.weekly,  desc: s.weeklyDesc },
    { value: 'monthly' as const, label: s.monthly, desc: s.monthlyDesc },
  ];

  const parsedAmount  = Number(amount);
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
        return; // explicit return so code below doesn't execute
      }

      const uid = session.user.id;
      const today = new Date().toISOString().split('T')[0];

      const { data: insertData, error: insertErr } = await supabase
        .from('tontine_groups')
        .insert({
          admin_id:         uid,
          name:             name.trim(),
          description:      description.trim(),
          contribution_xaf: parsedAmount,
          frequency,
          max_members:      parsedMembers,
          current_members:  1,          // admin counts as first member
          is_private:       isPrivate,
          status:           'open',
          start_date:       today,
          total_pool_xaf:   0,
        })
        .select('id')
        .single();

      if (insertErr) throw insertErr;

      // also add admin to tontine_members table immediately
      if (insertData?.id) {
        await supabase.from('tontine_members').insert({
          group_id:               insertData.id,
          user_id:                uid,
          joined_at:              new Date().toISOString(),
          payout_position:        1,
          has_paid_current_round: false,
        });
      }

      setDone(true);
      redirectRef.current = setTimeout(() => navigate('/tontine'), 2500);
    } catch (e: unknown) {
      const msg = (e as { message?: string })?.message;
      setError(
        msg?.includes('violates row-level security') ? s.permDenied : msg || s.genericErr,
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl shadow p-8 text-center max-w-sm w-full">
          <CheckCircle className="w-14 h-14 text-purple-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">{s.doneTitle + ' \uD83C\uDF89'}</h2>
          <p className="text-gray-500 text-sm">{s.doneBody}</p>
          <p className="text-xs text-gray-400 mt-3 animate-pulse">{s.redirecting}</p>
        </div>
      </div>
    );
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-xl"
          aria-label={s.goBack}
        >
          <ArrowLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
        </button>
        <h1 className="font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600" /> {s.pageTitle}
        </h1>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">

          {/* Group Name */}
          <div>
            <label htmlFor="tontine-name" className="block text-sm font-semibold text-gray-700 mb-1">
              {s.nameLabel}
            </label>
            <input
              id="tontine-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={s.namePh}
              maxLength={80}
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-xs text-gray-400 mt-1">{name.length}/80</p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="tontine-desc" className="block text-sm font-semibold text-gray-700 mb-1">
              {s.descLabel}
            </label>
            <textarea
              id="tontine-desc"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder={s.descPh}
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          {/* Amount + Members */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="tontine-amount" className="block text-sm font-semibold text-gray-700 mb-1">
                {s.amountLabel}
              </label>
              <input
                id="tontine-amount"
                type="number"
                min={500}
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder={s.amountPh}
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label htmlFor="tontine-members" className="block text-sm font-semibold text-gray-700 mb-1">
                {s.membersLabel}
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

          {/* Frequency */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{s.freqLabel}</label>
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
                  <p className="font-semibold text-gray-900 text-sm">{f.label}</p>
                  <p className="text-xs text-gray-500">{f.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Private toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={e => setIsPrivate(e.target.checked)}
              className="w-4 h-4 accent-purple-600"
            />
            <div>
              <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-gray-500" /> {s.privateTitle}
              </span>
              <p className="text-xs text-gray-400">{s.privateDesc}</p>
            </div>
          </label>

          {/* Summary preview */}
          {name && parsedAmount > 0 && parsedMembers >= 2 && (
            <div className="bg-purple-50 rounded-xl p-3 text-sm">
              <p className="font-semibold text-purple-900 mb-1">{s.summaryTitle}</p>
              <p className="text-purple-700">
                {parsedMembers} {'\u00d7'} {parsedAmount.toLocaleString('fr-CM')} XAF/
                {frequency === 'monthly' ? s.month : s.week} ={' '}
                <strong>{(parsedMembers * parsedAmount).toLocaleString('fr-CM')} XAF</strong> {s.totalPool}
              </p>
            </div>
          )}
        </div>

        {/* How it works */}
        <div className="bg-gray-50 border rounded-2xl p-4 text-sm text-gray-600 space-y-2">
          <p className="font-semibold text-gray-800">{s.howTitle}</p>
          <p>{s.how1}</p>
          <p>{s.how2}</p>
          <p>{s.how3}</p>
          <p>{s.how4}</p>
        </div>
      </div>

      {/* Submit button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <button
          onClick={handleCreate}
          disabled={!canSubmit || submitting}
          className="w-full bg-purple-700 text-white py-3.5 rounded-2xl font-bold disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-purple-800 transition"
        >
          {submitting
            ? <><Loader2 className="w-4 h-4 animate-spin" />{s.creating}</>
            : <><Users className="w-5 h-5" />{s.createBtn}</>}
        </button>
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__TONTINECREATE_FIX162__COMPLETE
