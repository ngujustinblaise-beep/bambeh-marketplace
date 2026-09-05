// BAMBEH_DEPLOY_TOKEN__FORGOTPASSWORD_FIX478B_CLEAN
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
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const digits = phone.replace(/\D/g, '');

  const whatsappUrl = (withNumber: string) =>
    `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(
      `${t('waMsg')} +${withNumber}`,
    )}`;

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

              <div className="rounded-2xl bg-amber-50 border border-amber-100 p-3 text-xs text-amber-900">
                {t('phoneNote')}
              </div>

              <button type="button" onClick={askOnWhatsApp}
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-3 font-semibold">
                {t('askBtn')}
              </button>
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

          <p className="mt-6 text-center text-sm text-gray-600">
            <Link to="/login" className="text-teal-700 font-semibold hover:underline">
              {t('back')}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
// BAMBEH_END_TOKEN__FORGOTPASSWORD_FIX478B__COMPLETE
