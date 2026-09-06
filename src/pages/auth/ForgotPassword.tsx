// BAMBEH_DEPLOY_TOKEN__FORGOTPASSWORD_FIX488_CLEAN
/**
 * src/pages/auth/ForgotPassword.tsx — Bambeh Marketplace
 *
 * FIX478 — THE PAGE THAT PRETENDED.
 * ─────────────────────────────────
 * The version this replaces imported nothing, called nothing, and did this:
 *
 *     await new Promise((r) => setTimeout(r, 900));
 *     setSent(true);            //  "a reset link has been sent."
 *
 * It waited nine hundred milliseconds and lied. No email was ever sent, no
 * link was ever made. This is the screen a locked-out user reaches, so of
 * every dishonest surface in the app this was the most expensive one.
 *
 * WHAT IT DOES NOW
 *
 * PHONE (the default, because most Bambeh accounts are phone accounts)
 *   Bambeh has no SMS credit, so a link cannot travel to a phone by itself.
 *   Rather than pretend, the page says so and opens WhatsApp to the Bambeh
 *   support number with the request already typed. Staff then generate the
 *   real recovery link in the Command Center (FIX474/FIX475) and send it
 *   back on the same WhatsApp thread. The user taps it and sets a new
 *   password. Free, and every step is true.
 *
 * EMAIL (for the minority who registered with a real address)
 *   Calls supabase.auth.resetPasswordForEmail for real, pointed at
 *   /#/security-recovery — the screen FIX378 already built. Because custom
 *   SMTP is not configured, delivery is not guaranteed, so the page SAYS that
 *   and keeps the WhatsApp route one tap away instead of leaving someone
 *   staring at an inbox.
 *
 * WHY IT NEVER SAYS WHETHER THE ACCOUNT EXISTS
 *   "No account with that number" would let anyone check which Cameroonian
 *   phone numbers are on Bambeh, one guess at a time. The wording is the same
 *   either way. That is deliberate, not vagueness.
 *
 * © 2026 BAMBEH SARL. All rights reserved.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';
import AfricanPhoneInput from '@/components/AfricanPhoneInput';

/** Bambeh support. Reset requests arrive here. */
const SUPPORT_WHATSAPP = '237652953607';
const RECOVERY_URL = 'https://app.bambeh.com/#/security-recovery';

const STR: Record<string, Record<string, string>> = {
  en: {
    title: 'Forgot your password?',
    sub: 'Use the phone number or email you signed up with.',
    tabPhone: 'Phone number', tabEmail: 'Email',
    phoneLabel: 'Your phone number', phonePh: '6 XX XX XX XX',
    emailLabel: 'Your email address', emailPh: 'you@example.com',
    phoneHelp: 'This is the number you used to create your Bambeh account.',
    askBtn: 'Request my reset link on WhatsApp',
    phoneNote:
      'Bambeh cannot send text messages yet. Tap the button and our team will send your reset link on WhatsApp, usually within a few minutes.',
    sendBtn: 'Send reset link to my email',
    sending: 'Sending…',
    emailSent:
      'If that address is registered, a reset link is on its way. It can take a few minutes, and it sometimes lands in spam.',
    emailFallback: 'Nothing arrived? Ask us on WhatsApp instead.',
    waFallbackBtn: 'Ask on WhatsApp',
    badPhone: 'Please enter your phone number.',
    badEmail: 'Please enter a valid email address.',
    failed: 'That did not work. Please use WhatsApp below.',
    haveCode: 'I already have a code',
    vTitle: 'Prove this is your account',
    vIntro: 'Answer any two correctly. We never tell anyone whether a number is registered.',
    qLast: 'When did you last sign in?',
    qMade: 'When did you create your account?',
    qPosted: 'Have you posted anything on Bambeh?',
    yes: 'Yes',
    no: 'No',
    qWhat: 'Name one thing you posted',
    qName: 'What name did you enter when you created the account?',
    checkBtn: 'Check my answers',
    checking: 'Checking…',
    gotN: 'matched so far',
    needTwo: 'You need two.',
    tooMany: 'Too many attempts. Please wait an hour and try again.',
    verifiedOk: 'Verified. You can send your request now.',
    triesLeft: 'tries left',
    lockedHint: 'Answer the questions above first.',
    back: 'Back to sign in',
    waMsg: 'Hello Bambeh. I forgot my password. My number is',
  },
  fr: {
    title: 'Mot de passe oublié ?',
    sub: 'Utilisez le numéro de téléphone ou l’e-mail de votre inscription.',
    tabPhone: 'Téléphone', tabEmail: 'E-mail',
    phoneLabel: 'Votre numéro de téléphone', phonePh: '6 XX XX XX XX',
    emailLabel: 'Votre adresse e-mail', emailPh: 'vous@exemple.com',
    phoneHelp: 'Le numéro utilisé pour créer votre compte Bambeh.',
    askBtn: 'Demander mon lien sur WhatsApp',
    phoneNote:
      'Bambeh ne peut pas encore envoyer de SMS. Appuyez sur le bouton et notre équipe vous enverra votre lien sur WhatsApp, généralement en quelques minutes.',
    sendBtn: 'Envoyer le lien à mon e-mail',
    sending: 'Envoi…',
    emailSent:
      'Si cette adresse est enregistrée, un lien est en route. Cela peut prendre quelques minutes, et il arrive parfois dans les spams.',
    emailFallback: 'Rien reçu ? Écrivez-nous plutôt sur WhatsApp.',
    waFallbackBtn: 'Écrire sur WhatsApp',
    badPhone: 'Veuillez saisir votre numéro de téléphone.',
    badEmail: 'Veuillez saisir une adresse e-mail valide.',
    failed: 'Cela n’a pas fonctionné. Utilisez WhatsApp ci-dessous.',
    haveCode: 'J’ai déjà un code',
    vTitle: 'Prouvez que ce compte est le vôtre',
    vIntro: 'Répondez correctement à deux questions. Nous ne disons jamais si un numéro est enregistré.',
    qLast: 'Quand vous êtes-vous connecté pour la dernière fois ?',
    qMade: 'Quand avez-vous créé votre compte ?',
    qPosted: 'Avez-vous publié quelque chose sur Bambeh ?',
    yes: 'Oui',
    no: 'Non',
    qWhat: 'Citez une chose que vous avez publiée',
    qName: 'Quel nom avez-vous saisi à la création du compte ?',
    checkBtn: 'Vérifier mes réponses',
    checking: 'Vérification…',
    gotN: 'bonnes réponses',
    needTwo: 'Il en faut deux.',
    tooMany: 'Trop de tentatives. Attendez une heure et réessayez.',
    verifiedOk: 'Vérifié. Vous pouvez envoyer votre demande.',
    triesLeft: 'essais restants',
    lockedHint: 'Répondez d’abord aux questions ci-dessus.',
    back: 'Retour à la connexion',
    waMsg: 'Bonjour Bambeh. J’ai oublié mon mot de passe. Mon numéro est',
  },
  pidgin: {
    title: 'You don forget your password?',
    sub: 'Use di phone number or email wey you take open di account.',
    tabPhone: 'Phone number', tabEmail: 'Email',
    phoneLabel: 'Your phone number', phonePh: '6 XX XX XX XX',
    emailLabel: 'Your email', emailPh: 'you@example.com',
    phoneHelp: 'Na di number wey you take open your Bambeh account.',
    askBtn: 'Ask for my reset link for WhatsApp',
    phoneNote:
      'Bambeh no fit send SMS yet. Press di button, our team go send your reset link for WhatsApp, e no go take long.',
    sendBtn: 'Send di reset link go my email',
    sending: 'E dey go…',
    emailSent:
      'If dat email dey registered, di link don comot. E fit take small time, and sometimes e dey enter spam.',
    emailFallback: 'Nothing enter? Ask us for WhatsApp.',
    waFallbackBtn: 'Ask for WhatsApp',
    badPhone: 'Abeg put your phone number.',
    badEmail: 'Abeg put correct email.',
    failed: 'E no work. Abeg use WhatsApp for down.',
    haveCode: 'I get code already',
    vTitle: 'Show say na your account',
    vIntro: 'Answer any two correct. We no dey tell anybody if number dey registered.',
    qLast: 'When last you enter di account?',
    qMade: 'When you open di account?',
    qPosted: 'You don post anything for Bambeh?',
    yes: 'Yes',
    no: 'No',
    qWhat: 'Talk one thing wey you post',
    qName: 'Which name you put when you open di account?',
    checkBtn: 'Check my answer',
    checking: 'E dey check…',
    gotN: 'correct so far',
    needTwo: 'You need two.',
    tooMany: 'You don try too much. Wait one hour.',
    verifiedOk: 'E correct. You fit send your request now.',
    triesLeft: 'try remain',
    lockedHint: 'Answer di question dem first.',
    back: 'Go back to sign in',
    waMsg: 'Hello Bambeh. I don forget my password. My number na',
  },
  ar: {
    title: 'هل نسيت كلمة المرور؟',
    sub: 'استخدم رقم الهاتف أو البريد الإلكتروني الذي سجّلت به.',
    tabPhone: 'رقم الهاتف', tabEmail: 'البريد الإلكتروني',
    phoneLabel: 'رقم هاتفك', phonePh: '6 XX XX XX XX',
    emailLabel: 'بريدك الإلكتروني', emailPh: 'you@example.com',
    phoneHelp: 'هذا هو الرقم الذي أنشأت به حسابك في بامبيه.',
    askBtn: 'اطلب رابط إعادة التعيين عبر واتساب',
    phoneNote:
      'لا يستطيع بامبيه إرسال رسائل نصية بعد. اضغط الزر وسيرسل فريقنا رابط إعادة التعيين عبر واتساب، عادةً خلال دقائق.',
    sendBtn: 'أرسل الرابط إلى بريدي',
    sending: 'جارٍ الإرسال…',
    emailSent:
      'إذا كان هذا العنوان مسجّلاً فالرابط في الطريق. قد يستغرق دقائق، وأحياناً يصل إلى البريد المزعج.',
    emailFallback: 'لم يصل شيء؟ راسلنا على واتساب.',
    waFallbackBtn: 'مراسلة واتساب',
    badPhone: 'من فضلك أدخل رقم هاتفك.',
    badEmail: 'من فضلك أدخل بريداً إلكترونياً صحيحاً.',
    failed: 'لم ينجح ذلك. استخدم واتساب بالأسفل.',
    haveCode: 'لديّ رمز بالفعل',
    vTitle: 'أثبت أن هذا حسابك',
    vIntro: 'أجب عن سؤالين بشكل صحيح. لا نخبر أحداً أبداً إن كان الرقم مسجّلاً.',
    qLast: 'متى سجّلت الدخول آخر مرة؟',
    qMade: 'متى أنشأت حسابك؟',
    qPosted: 'هل نشرت شيئاً على بامبيه؟',
    yes: 'نعم',
    no: 'لا',
    qWhat: 'اذكر شيئاً واحداً نشرته',
    qName: 'ما الاسم الذي أدخلته عند إنشاء الحساب؟',
    checkBtn: 'تحقّق من إجاباتي',
    checking: 'جارٍ التحقق…',
    gotN: 'إجابات صحيحة',
    needTwo: 'تحتاج إلى اثنتين.',
    tooMany: 'محاولات كثيرة. انتظر ساعة ثم حاول مجدداً.',
    verifiedOk: 'تم التحقق. يمكنك إرسال طلبك الآن.',
    triesLeft: 'محاولات متبقية',
    lockedHint: 'أجب عن الأسئلة أعلاه أولاً.',
    back: 'العودة إلى تسجيل الدخول',
    waMsg: 'مرحباً بامبيه. نسيت كلمة المرور. رقمي هو',
  },
  ff: {
    title: 'A yejjitii finnde maa?',
    sub: 'Huutoro limngal noddirgal walla iimeel ngal winndiɗaa.',
    tabPhone: 'Limngal noddirgal', tabEmail: 'Iimeel',
    phoneLabel: 'Limngal noddirgal maa', phonePh: '6 XX XX XX XX',
    emailLabel: 'Iimeel maa', emailPh: 'you@example.com',
    phoneHelp: 'Ko ngal limngal huutorɗaa udditde konte maa Bambeh.',
    askBtn: 'Ɗaɓɓu ceŋngal am e WhatsApp',
    phoneNote:
      'Bambeh waawaa neldude SMS tawo. Ñoƴƴu buton oo, hoore-golle amen neldat ma ceŋngal e WhatsApp, ko ɓuri heewde e nder hojomaaji seeɗa.',
    sendBtn: 'Neldu ceŋngal e iimeel am',
    sending: 'Ina nelda…',
    emailSent:
      'So tawii iimeel ngal ina winndaa, ceŋngal ngal ina ara. Ina waawi ƴettude hojomaaji seeɗa, kadi ina waawi naatde e spam.',
    emailFallback: 'Hay huunde araani? Ƴeewndo men e WhatsApp.',
    waFallbackBtn: 'Ƴeewndo e WhatsApp',
    badPhone: 'Tiiɗno naatnu limngal noddirgal maa.',
    badEmail: 'Tiiɗno naatnu iimeel goongɗinaango.',
    failed: 'Ɗum gollaaki. Tiiɗno huutoro WhatsApp les ɗoo.',
    haveCode: 'Mi jogii koodu',
    vTitle: 'Hollu ko konte maa',
    vIntro: 'Jaabo naamnde ɗiɗi e goonga. Min mbiyataa hay gooto so tawii limngal ina winndaa.',
    qLast: 'Hol ndeen naatuɗaa sakkitii?',
    qMade: 'Hol ndeen udditɗaa konte maa?',
    qPosted: 'Aɗa winndi huunde e Bambeh?',
    yes: 'Eey',
    no: 'Alaa',
    qWhat: 'Limtu huunde wootere nde winndu-ɗaa',
    qName: 'Hol innde naatnu-ɗaa nde udditaa konte?',
    checkBtn: 'Ƴeewto jaabawuuji am',
    checking: 'Ina ƴeewee…',
    gotN: 'goongɗi haa jooni',
    needTwo: 'Aɗa soklli ɗiɗi.',
    tooMany: 'Ndaarndo-ɗaa ko heewi. Fadu waktu gooto.',
    verifiedOk: 'Ƴeewtaama. Aɗa waawi neldude ɗaɓɓaandu maa jooni.',
    triesLeft: 'ndaarndogol heddii',
    lockedHint: 'Jaabo naamnde dow ɗoo tawo.',
    back: 'Rutto e naatgol',
    waMsg: 'Jam Bambeh. Mi yejjitii finnde am. Limngal am ko',
  },
};

function tr(lang: string, k: string): string {
  return (STR[lang] && STR[lang][k]) || STR.en[k] || k;
}

/* FIX478b — the hand-rolled phone normaliser that used to sit here is gone.
   AfricanPhoneInput already picks the country (Cameroon by default), strips
   every non-digit, caps the length per country and validates against that
   country's pattern. Writing a second, weaker version of that here is exactly
   how two rules end up disagreeing. It hands back the full international
   number and whether it is valid; this page just uses both. */

export default function ForgotPassword() {
  const langRaw: unknown = useLang();
  const lang: string = typeof langRaw === 'string' ? langRaw : 'en';
  const isRtl = lang === 'ar';
  const t = (k: string) => tr(lang, k);

  const [mode, setMode] = useState<'phone' | 'email'>('phone');
  const [phone, setPhone] = useState('');      // full international, from AfricanPhoneInput
  const [phoneOk, setPhoneOk] = useState(false);

  /* FIX488 - the four questions. Nothing here decides anything: the answers go
     to grade_reset_identity() and the DATABASE says pass or fail. If this
     comparison lived in the browser, anyone could open DevTools and flip the
     verdict. */
  const [qLast, setQLast] = useState('');
  const [qMade, setQMade] = useState('');
  const [qPosted, setQPosted] = useState<'' | 'yes' | 'no'>('');
  const [qWhat, setQWhat] = useState('');
  const [qName, setQName] = useState('');
  const [checking, setChecking] = useState(false);
  const [verified, setVerified] = useState(false);
  const [score, setScore] = useState<{ matched: number; left: number } | null>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const digits = phone.replace(/\D/g, '');

  const whatsappUrl = (withNumber: string) =>
    `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(
      `${t('waMsg')} +${withNumber}`,
    )}`;

  const checkAnswers = async () => {
    if (!phoneOk || digits.length < 8) { setError(t('badPhone')); return; }
    setChecking(true);
    setError(null);
    try {
      const { data, error: err } = await supabase.rpc('grade_reset_identity', {
        p_phone: digits,
        p_email: null,
        p_answers: {
          last_sign_in: qLast || null,
          created_at: qMade || null,
          posted: qPosted || null,
          posted_what: qWhat || null,
          full_name: qName || null,
        },
      });
      if (err) throw err;
      const r = Array.isArray(data) ? data[0] : data;
      setScore({ matched: Number(r?.matched ?? 0), left: Number(r?.attempts_left ?? 0) });
      // The server decides. The browser only renders what it was told.
      setVerified(Boolean(r?.passed));
    } catch {
      setError(t('failed'));
    } finally {
      setChecking(false);
    }
  };

  const askOnWhatsApp = () => {
    // AfricanPhoneInput has already validated against the chosen country's
    // pattern, so this trusts its verdict instead of re-guessing the length.
    if (!phoneOk || digits.length < 8) { setError(t('badPhone')); return; }
    setError(null);
    window.open(whatsappUrl(digits), '_blank', 'noopener,noreferrer');
  };

  const sendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const addr = email.trim();
    if (!addr || !addr.includes('@')) { setError(t('badEmail')); return; }
    setError(null);
    setLoading(true);
    try {
      // Real. Not a timer. Lands on the recovery screen FIX378 already built.
      const { error: err } = await supabase.auth.resetPasswordForEmail(addr, {
        redirectTo: RECOVERY_URL,
      });
      // Deliberately do NOT surface "user not found": that would let anyone
      // test which addresses are registered. Any real failure still shows.
      if (err && !/user not found/i.test(err.message)) throw err;
      setEmailSent(true);
    } catch {
      setError(t('failed'));
    } finally {
      setLoading(false);
    }
  };

  const TAB = 'flex-1 rounded-xl py-3 text-sm font-semibold border transition-colors';
  const INPUT =
    'mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-500';

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 flex items-center justify-center"
      dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Bambeh" className="mx-auto h-20 w-auto object-contain mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="mt-2 text-sm text-gray-600">{t('sub')}</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8">
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button type="button" onClick={() => { setMode('phone'); setError(null); }}
              className={`${TAB} ${mode === 'phone'
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white text-gray-700 border-gray-200'}`}>
              {t('tabPhone')}
            </button>
            <button type="button" onClick={() => { setMode('email'); setError(null); }}
              className={`${TAB} ${mode === 'email'
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white text-gray-700 border-gray-200'}`}>
              {t('tabEmail')}
            </button>
          </div>

          {/* ── PHONE ─────────────────────────────────────────────────── */}
          {mode === 'phone' ? (
            <div className="space-y-4">
              <div dir="ltr">
                {/* FIX478b — the app's own phone input: country picker defaulting
                    to Cameroon, per-country length caps and pattern validation.
                    dir is forced ltr because a phone number reads left-to-right
                    even on the Arabic layout. */}
                <AfricanPhoneInput
                  value={phone}
                  label={t('phoneLabel')}
                  required
                  onChange={(full, valid) => {
                    setPhone(full);
                    setPhoneOk(valid);
                    if (valid) setError(null);
                  }}
                />
                <p className="mt-1 text-xs text-gray-500">{t('phoneHelp')}</p>
              </div>

              {/* ── FIX488: prove it is your account ───────────────────── */}
              <div className="rounded-2xl border border-gray-200 p-3 space-y-3">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{t('vTitle')}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t('vIntro')}</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700">{t('qLast')}</label>
                  <input type="date" value={qLast} onChange={(e) => setQLast(e.target.value)}
                    className={INPUT} dir="ltr" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700">{t('qMade')}</label>
                  <input type="month" value={qMade} onChange={(e) => setQMade(e.target.value)}
                    className={INPUT} dir="ltr" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700">{t('qPosted')}</label>
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    {(['yes', 'no'] as const).map((v) => (
                      <button key={v} type="button" onClick={() => setQPosted(v)}
                        className={`rounded-xl border py-2 text-sm font-semibold ${
                          qPosted === v ? 'border-teal-500 bg-teal-50 text-teal-700'
                                        : 'border-gray-200 text-gray-600'}`}>
                        {t(v)}
                      </button>
                    ))}
                  </div>
                </div>

                {qPosted === 'yes' ? (
                  <div>
                    <label className="block text-xs font-medium text-gray-700">{t('qWhat')}</label>
                    <input value={qWhat} onChange={(e) => setQWhat(e.target.value)} className={INPUT} />
                  </div>
                ) : null}

                <div>
                  <label className="block text-xs font-medium text-gray-700">{t('qName')}</label>
                  <input value={qName} onChange={(e) => setQName(e.target.value)} className={INPUT} />
                </div>

                <button type="button" onClick={checkAnswers} disabled={checking || verified}
                  className="w-full rounded-xl bg-teal-600 hover:bg-teal-700 text-white py-2.5 text-sm font-semibold disabled:bg-gray-300">
                  {checking ? t('checking') : t('checkBtn')}
                </button>

                {/* The count only. NEVER which answers matched - that would let
                    somebody probe one field at a time and the attempt cap would
                    mean nothing. */}
                {score && !verified ? (
                  <p className="text-xs text-amber-800 text-center">
                    {score.left === 0
                      ? t('tooMany')
                      : `${score.matched} ${t('gotN')} — ${t('needTwo')} (${score.left} ${t('triesLeft')})`}
                  </p>
                ) : null}
                {verified ? (
                  <p className="text-xs text-emerald-700 font-semibold text-center">{t('verifiedOk')}</p>
                ) : null}
              </div>

              <div className="rounded-2xl bg-amber-50 border border-amber-100 p-3 text-xs text-amber-900">
                {t('phoneNote')}
              </div>

              <button type="button" onClick={askOnWhatsApp} disabled={!verified}
                title={!verified ? t('lockedHint') : undefined}
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-3 font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed">
                {t('askBtn')}
              </button>
              {!verified ? (
                <p className="text-[11px] text-gray-500 text-center -mt-2">{t('lockedHint')}</p>
              ) : null}
            </div>
          ) : (
            /* ── EMAIL ──────────────────────────────────────────────── */
            <div className="space-y-4">
              {!emailSent ? (
                <form className="space-y-4" onSubmit={sendEmail}>
                  <div>
                    <label htmlFor="fpEmail" className="block text-sm font-medium text-gray-700">
                      {t('emailLabel')}
                    </label>
                    <input id="fpEmail" type="email" autoComplete="email"
                      value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('emailPh')} className={INPUT} dir="ltr" />
                  </div>
                  <button type="submit" disabled={loading || !email.trim()}
                    className="w-full rounded-xl bg-teal-600 hover:bg-teal-700 text-white py-3 font-semibold disabled:bg-gray-300">
                    {loading ? t('sending') : t('sendBtn')}
                  </button>
                </form>
              ) : (
                <div className="rounded-2xl bg-teal-50 border border-teal-100 p-4 text-sm text-teal-800">
                  {t('emailSent')}
                </div>
              )}

              {/* Email delivery is not guaranteed while SMTP is unconfigured,
                  so the route that always works stays one tap away. */}
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2">{t('emailFallback')}</p>
                <a href={whatsappUrl(digits || '')} target="_blank" rel="noopener noreferrer"
                  className="block text-center w-full rounded-xl border border-emerald-200 text-emerald-700 py-2.5 text-sm font-semibold hover:bg-emerald-50">
                  {t('waFallbackBtn')}
                </a>
              </div>
            </div>
          )}

          {error ? (
            <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
          ) : null}

          {/* FIX485 - SecurityRecovery still ACCEPTS a code and sets the new
              password. It is no longer the front door, but it must stay one tap
              away or anyone already holding a code has nowhere to type it. */}
          <p className="mt-5 text-center">
            <Link to="/security-recovery" className="text-sm text-gray-500 hover:text-teal-700 underline">
              {t('haveCode')}
            </Link>
          </p>

          <p className="mt-4 text-center text-sm text-gray-600">
            <Link to="/login" className="text-teal-700 font-semibold hover:underline">
              {t('back')}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
// BAMBEH_END_TOKEN__FORGOTPASSWORD_FIX488__COMPLETE
