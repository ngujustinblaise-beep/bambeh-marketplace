// BAMBEH_DEPLOY_TOKEN__BIOMETRICSETUP_FIX125_CLEAN
/**
 * BiometricSetup.tsx — Bambeh (FIX125, REAL enrollment)
 * FILE LOCATION: src/pages/auth/BiometricSetup.tsx
 *
 * Replaces the stub that only set a localStorage flag. Now it performs a REAL
 * WebAuthn platform passkey enrollment via services/biometric. The device
 * prompts for fingerprint/face; on success the credential is saved so the
 * user can later log in with biometrics. If the device can't do it, the page
 * says so honestly and lets the user skip.
 *
 * © 2026 BAMBEH SARL. All rights reserved.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fingerprint, ShieldCheck, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import AuthShell from '@/components/auth/AuthShell';
import { useLanguage } from '@/context/LanguageContext';
import { isBiometricAvailable, enrollBiometric } from '@/services/biometric';

type LangCode = 'en' | 'fr' | 'pcm' | 'ar' | 'ful' | 'ha';

const STRINGS: Record<LangCode, {
  title: string; subtitle: string; enable: string; skip: string; note: string;
  enabling: string; success: string; unavailable: string; cancelled: string; failed: string;
}> = {
  en: { title: 'Enable biometrics', subtitle: 'Use fingerprint or face unlock for quicker sign in.',
    enable: 'Enable biometrics', skip: 'Skip for now', note: 'You can change this later in settings.',
    enabling: 'Setting up…', success: 'Biometric enabled! You can now log in with it.',
    unavailable: 'This device does not support biometric unlock. You can still use your password.',
    cancelled: 'Setup was cancelled.', failed: 'Could not enable biometrics. Please try again.' },
  fr: { title: 'Activer la biométrie', subtitle: 'Utilisez l’empreinte ou le visage pour aller plus vite.',
    enable: 'Activer la biométrie', skip: 'Passer pour le moment', note: 'Vous pourrez modifier ce choix plus tard.',
    enabling: 'Configuration…', success: 'Biométrie activée ! Vous pouvez l’utiliser pour vous connecter.',
    unavailable: 'Cet appareil ne prend pas en charge la biométrie. Vous pouvez utiliser le mot de passe.',
    cancelled: 'Configuration annulée.', failed: 'Impossible d’activer la biométrie. Réessayez.' },
  pcm: { title: 'Enable biometrics', subtitle: 'Use fingerprint or face unlock for quicker sign in.',
    enable: 'Enable biometrics', skip: 'Skip for now', note: 'You fit change am later for settings.',
    enabling: 'E dey set…', success: 'Biometric don enable! You fit login with am now.',
    unavailable: 'This device no support biometric. You fit still use password.',
    cancelled: 'You cancel the setup.', failed: 'E no fit enable. Try again.' },
  ar: { title: 'تفعيل البصمة', subtitle: 'استخدم البصمة أو الوجه لتسجيل أسرع.',
    enable: 'تفعيل البصمة', skip: 'تخطي الآن', note: 'يمكنك تغيير هذا لاحقًا من الإعدادات.',
    enabling: 'جارٍ الإعداد…', success: 'تم تفعيل البصمة! يمكنك تسجيل الدخول بها الآن.',
    unavailable: 'هذا الجهاز لا يدعم البصمة. يمكنك استخدام كلمة المرور.',
    cancelled: 'تم إلغاء الإعداد.', failed: 'تعذر التفعيل. حاول مرة أخرى.' },
  ful: { title: 'Huutu biometrics', subtitle: 'Huuto fingerprint walla face unlock.',
    enable: 'Huutu biometrics', skip: 'Yii goɗɗum', note: 'A waawi waylude ɗum kadi e settings.',
    enabling: 'Eɓɓugol…', success: 'Biometric huutaama! A waawi naatirde ɗum jooni.',
    unavailable: 'Kaɓirgel ngel jaɓataa biometric. A waawi huutorde password.',
    cancelled: 'Eɓɓugol haɗaama.', failed: 'Huutgol tinaaki. Taƴ kadi.' },
  ha: { title: 'Kunna biometrics', subtitle: 'Yi amfani da yatsa ko fuska don saurin shiga.',
    enable: 'Kunna biometrics', skip: 'Tsallake yanzu', note: 'Za ka iya canza wannan daga baya a settings.',
    enabling: 'Ana saitawa…', success: 'An kunna biometric! Yanzu za ka iya shiga da shi.',
    unavailable: 'Wannan na’urar ba ta goyon bayan biometric. Za ka iya amfani da kalmar sirri.',
    cancelled: 'An soke saitin.', failed: 'An kasa kunnawa. Sake gwadawa.' },
};

export default function BiometricSetup() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const lang = ((language as LangCode) in STRINGS ? (language as LangCode) : 'en') as LangCode;
  const t = STRINGS[lang];
  const isRtl = lang === 'ar';

  const [available, setAvailable] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => { (async () => setAvailable(await isBiometricAvailable()))(); }, []);

  const enable = async () => {
    setBusy(true); setError('');
    const res = await enrollBiometric();
    setBusy(false);
    if (res.ok) {
      setDone(true);
      setTimeout(() => navigate('/', { replace: true }), 1400);
      return;
    }
    const map: Record<string, string> = {
      unavailable: t.unavailable, cancelled: t.cancelled, failed: t.failed, not_logged_in: t.failed,
    };
    setError(map[res.error ?? 'failed'] ?? t.failed);
  };

  return (
    <AuthShell title={t.title} subtitle={t.subtitle} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="space-y-4">
        <p className="text-sm leading-6 text-gray-600">{t.note}</p>

        {done ? (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4" /> {t.success}
          </div>
        ) : null}

        {error ? (
          <div className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" /> <span>{error}</span>
          </div>
        ) : null}

        {available === false ? (
          <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" /> <span>{t.unavailable}</span>
          </div>
        ) : (
          <button
            type="button"
            disabled={busy || done}
            onClick={enable}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 py-3.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Fingerprint className="h-4 w-4" />}
            {busy ? t.enabling : t.enable}
          </button>
        )}

        <button
          type="button"
          onClick={() => navigate('/', { replace: true })}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-100"
        >
          <ShieldCheck className="h-4 w-4" />
          {t.skip}
        </button>
      </div>
    </AuthShell>
  );
}
// BAMBEH_END_TOKEN__BIOMETRICSETUP__COMPLETE
