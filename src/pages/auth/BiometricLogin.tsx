// BAMBEH_DEPLOY_TOKEN__BIOMETRICLOGIN_FIX125_CLEAN
/**
 * BiometricLogin.tsx — Bambeh (FIX125, REAL biometric)
 * FILE LOCATION: src/pages/auth/BiometricLogin.tsx (per App.tsx eager import)
 *
 * Replaces the stub that only did navigate("/"). Now it runs a REAL WebAuthn
 * platform-authenticator check via services/biometric, and only proceeds when
 * the device fingerprint/face verifies AND a Supabase session is present.
 * If biometrics are unavailable or not enrolled, it steers to password.
 *
 * © 2026 BAMBEH SARL. All rights reserved.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fingerprint, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import AuthShell from '@/components/auth/AuthShell';
import { useLanguage } from '@/context/LanguageContext';
import {
  isBiometricAvailable, hasLocalBiometric, localUserHint, authenticateBiometric,
} from '@/services/biometric';

type LangCode = 'en' | 'fr' | 'pcm' | 'ar' | 'ful' | 'ha';

const STRINGS: Record<LangCode, {
  title: string; subtitle: string; biometric: string; fallback: string;
  verifying: string; unavailable: string; notEnrolled: string; cancelled: string;
  sessionExpired: string; failed: string;
}> = {
  en: { title: 'Biometric login', subtitle: 'Use your fingerprint or face to continue.',
    biometric: 'Continue with biometrics', fallback: 'Use password instead',
    verifying: 'Verifying…', unavailable: 'Biometrics are not available on this device.',
    notEnrolled: 'No biometric is set up yet. Log in with your password, then enable it.',
    cancelled: 'Biometric check was cancelled.', sessionExpired: 'Please sign in once with your password.',
    failed: 'Could not verify. Please use your password.' },
  fr: { title: 'Connexion biométrique', subtitle: 'Utilisez votre empreinte ou votre visage.',
    biometric: 'Continuer avec la biométrie', fallback: 'Utiliser le mot de passe',
    verifying: 'Vérification…', unavailable: 'La biométrie n’est pas disponible sur cet appareil.',
    notEnrolled: 'Aucune biométrie configurée. Connectez-vous avec le mot de passe, puis activez-la.',
    cancelled: 'Vérification annulée.', sessionExpired: 'Connectez-vous une fois avec votre mot de passe.',
    failed: 'Échec de la vérification. Utilisez votre mot de passe.' },
  pcm: { title: 'Biometric login', subtitle: 'Use your fingerprint or face to continue.',
    biometric: 'Continue with biometrics', fallback: 'Use password instead',
    verifying: 'E dey check…', unavailable: 'Biometrics no dey work for this device.',
    notEnrolled: 'You never set biometric. Login with password first, then enable am.',
    cancelled: 'You cancel the biometric check.', sessionExpired: 'Login one time with your password abeg.',
    failed: 'E no fit verify. Use your password.' },
  ar: { title: 'تسجيل بالبصمة', subtitle: 'استخدم البصمة أو الوجه للمتابعة.',
    biometric: 'المتابعة بالبصمة', fallback: 'استخدام كلمة المرور',
    verifying: 'جارٍ التحقق…', unavailable: 'البصمة غير متوفرة على هذا الجهاز.',
    notEnrolled: 'لم يتم إعداد البصمة بعد. سجّل الدخول بكلمة المرور ثم فعّلها.',
    cancelled: 'تم إلغاء التحقق.', sessionExpired: 'سجّل الدخول مرة بكلمة المرور.',
    failed: 'تعذر التحقق. استخدم كلمة المرور.' },
  ful: { title: 'Seŋo e biometrics', subtitle: 'Huuto fingerprint walla face.',
    biometric: 'Jokkondir e biometrics', fallback: 'Huuto password',
    verifying: 'Ƴeewndagol…', unavailable: 'Biometrics ngalaa e kaɓirgel ngel.',
    notEnrolled: 'A waɗaani biometric tawo. Naat e password, refti huutu ɗum.',
    cancelled: 'Ƴeewndagol haɗaama.', sessionExpired: 'Naat laawol gootol e password maa.',
    failed: 'Ƴeewndagol tinaaki. Huuto password.' },
  ha: { title: 'Shiga da biometrics', subtitle: 'Yi amfani da yatsa ko fuska.',
    biometric: 'Ci gaba da biometrics', fallback: 'Yi amfani da kalmar sirri',
    verifying: 'Ana tabbatarwa…', unavailable: 'Biometrics baya nan a wannan na’urar.',
    notEnrolled: 'Ba a saita biometric ba tukuna. Shiga da kalmar sirri, sannan ka kunna.',
    cancelled: 'An soke tabbatarwa.', sessionExpired: 'Ka shiga sau ɗaya da kalmar sirri.',
    failed: 'An kasa tabbatarwa. Yi amfani da kalmar sirri.' },
};

export default function BiometricLogin() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const lang = ((language as LangCode) in STRINGS ? (language as LangCode) : 'en') as LangCode;
  const t = STRINGS[lang];
  const isRtl = lang === 'ar';

  const [available, setAvailable] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const hint = localUserHint();

  useEffect(() => {
    (async () => {
      const ok = await isBiometricAvailable();
      setAvailable(ok && hasLocalBiometric());
    })();
  }, []);

  const run = async () => {
    setBusy(true); setError('');
    const res = await authenticateBiometric();
    setBusy(false);
    if (res.ok) { navigate('/', { replace: true }); return; }
    const map: Record<string, string> = {
      unavailable: t.unavailable, not_enrolled: t.notEnrolled, cancelled: t.cancelled,
      session_expired: t.sessionExpired, failed: t.failed,
    };
    setError(map[res.error ?? 'failed'] ?? t.failed);
    if (res.error === 'session_expired' || res.error === 'not_enrolled') {
      setTimeout(() => navigate('/login', { replace: true }), 1800);
    }
  };

  return (
    <AuthShell title={t.title} subtitle={t.subtitle} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="space-y-3">
        {hint ? <p className="text-center text-xs text-gray-400">{hint}</p> : null}

        {error ? (
          <div className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" /> <span>{error}</span>
          </div>
        ) : null}

        <button
          type="button"
          disabled={busy || available === false}
          onClick={run}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 py-3.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Fingerprint className="h-4 w-4" />}
          {busy ? t.verifying : t.biometric}
        </button>

        {available === false ? (
          <p className="text-center text-xs text-gray-400">{t.unavailable}</p>
        ) : null}

        <button
          type="button"
          onClick={() => navigate('/login', { replace: true })}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-100"
        >
          {t.fallback}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </AuthShell>
  );
}
// BAMBEH_END_TOKEN__BIOMETRICLOGIN__COMPLETE
