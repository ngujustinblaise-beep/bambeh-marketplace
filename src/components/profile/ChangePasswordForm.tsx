/**
 * CHANGE PASSWORD FORM - With Email/Phone Verification
 * FILE LOCATION: src/components/profile/ChangePasswordForm.tsx
 *
 * i18n: all visible strings come from the local S table below, keyed by the live
 * language (useLang from @/hooks/useAppLang), so the form re-translates the
 * instant the language changes. All logic (validation, verification code flow,
 * localStorage keys, alerts) is unchanged.
 */

import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Phone, Shield, CheckCircle } from 'lucide-react';
import { useLang } from '@/hooks/useAppLang';

type Lang = 'en' | 'fr' | 'pidgin' | 'ar' | 'ff';

const S: Record<Lang, {
  errCurrentWrong: string; errMin8: string; errNoMatch: string; errSameAsOld: string;
  codeSentEmail: (e: string, c: string) => string; codeSentPhone: (p: string, c: string) => string;
  codeNotFound: string; codeExpired: string; codeInvalid: string; changeFailed: string;
  successTitle: string; successDesc: string; done: string;
  verifyTitle: string; verifyDescPrefix: string; methodEmail: string; methodPhone: string;
  codeLabel: string; codeExpiresIn: string; back: string; verifying: string; verify: string; resend: string;
  title: string; subtitle: string;
  currentLabel: string; newLabel: string; confirmLabel: string;
  verifyVia: string; emailBtn: string; phoneBtn: string;
  secNote: string; sec1: string; sec2: string; sec3: string; continueBtn: string;
}> = {
  en: {
    errCurrentWrong: 'Current password is incorrect', errMin8: 'New password must be at least 8 characters',
    errNoMatch: 'New passwords do not match', errSameAsOld: 'New password must be different from current password',
    codeSentEmail: (e, c) => `Verification code sent to ${e}\n\nFor demo: ${c}`,
    codeSentPhone: (p, c) => `Verification code sent to ${p}\n\nFor demo: ${c}`,
    codeNotFound: 'Verification code not found. Please try again.', codeExpired: 'Verification code has expired. Please try again.',
    codeInvalid: 'Invalid verification code', changeFailed: 'Failed to change password. Please try again.',
    successTitle: 'Password Changed!', successDesc: 'Your password has been successfully updated.', done: 'Done',
    verifyTitle: 'Verify Your Identity', verifyDescPrefix: 'Enter the 6-digit code sent to your', methodEmail: 'email', methodPhone: 'phone',
    codeLabel: 'Verification Code', codeExpiresIn: 'Code expires in 10 minutes', back: 'Back', verifying: 'Verifying...', verify: 'Verify', resend: 'Resend Code',
    title: 'Change Password', subtitle: 'Update your account password',
    currentLabel: 'Current Password *', newLabel: 'New Password * (minimum 8 characters)', confirmLabel: 'Confirm New Password *',
    verifyVia: 'Verify via:', emailBtn: 'Email', phoneBtn: 'Phone',
    secNote: 'Security Note:', sec1: "You'll receive a verification code", sec2: 'Code is valid for 10 minutes', sec3: 'Password must be at least 8 characters', continueBtn: 'Continue',
  },
  fr: {
    errCurrentWrong: 'Le mot de passe actuel est incorrect', errMin8: 'Le nouveau mot de passe doit comporter au moins 8 caractères',
    errNoMatch: 'Les nouveaux mots de passe ne correspondent pas', errSameAsOld: "Le nouveau mot de passe doit être différent de l'ancien",
    codeSentEmail: (e, c) => `Code de vérification envoyé à ${e}\n\nDémo : ${c}`,
    codeSentPhone: (p, c) => `Code de vérification envoyé au ${p}\n\nDémo : ${c}`,
    codeNotFound: 'Code de vérification introuvable. Veuillez réessayer.', codeExpired: 'Le code de vérification a expiré. Veuillez réessayer.',
    codeInvalid: 'Code de vérification invalide', changeFailed: 'Échec du changement de mot de passe. Veuillez réessayer.',
    successTitle: 'Mot de passe changé !', successDesc: 'Votre mot de passe a été mis à jour avec succès.', done: 'Terminé',
    verifyTitle: 'Vérifiez votre identité', verifyDescPrefix: 'Saisissez le code à 6 chiffres envoyé à votre', methodEmail: 'e-mail', methodPhone: 'téléphone',
    codeLabel: 'Code de vérification', codeExpiresIn: 'Le code expire dans 10 minutes', back: 'Retour', verifying: 'Vérification...', verify: 'Vérifier', resend: 'Renvoyer le code',
    title: 'Changer le mot de passe', subtitle: 'Mettre à jour le mot de passe du compte',
    currentLabel: 'Mot de passe actuel *', newLabel: 'Nouveau mot de passe * (minimum 8 caractères)', confirmLabel: 'Confirmer le nouveau mot de passe *',
    verifyVia: 'Vérifier via :', emailBtn: 'E-mail', phoneBtn: 'Téléphone',
    secNote: 'Note de sécurité :', sec1: 'Vous recevrez un code de vérification', sec2: 'Le code est valable 10 minutes', sec3: 'Le mot de passe doit comporter au moins 8 caractères', continueBtn: 'Continuer',
  },
  pidgin: {
    errCurrentWrong: 'Your current password no correct', errMin8: 'New password must be 8 characters or more',
    errNoMatch: 'Di new passwords no match', errSameAsOld: 'New password must different from di old one',
    codeSentEmail: (e, c) => `We don send verification code to ${e}\n\nFor demo: ${c}`,
    codeSentPhone: (p, c) => `We don send verification code to ${p}\n\nFor demo: ${c}`,
    codeNotFound: 'We no see di verification code. Try again.', codeExpired: 'Di verification code don expire. Try again.',
    codeInvalid: 'Di verification code no correct', changeFailed: 'E no fit change password. Try again.',
    successTitle: 'Password Don Change!', successDesc: 'Your password don update well well.', done: 'Done',
    verifyTitle: 'Confirm Say Na You', verifyDescPrefix: 'Put di 6-digit code wey we send to your', methodEmail: 'email', methodPhone: 'phone',
    codeLabel: 'Verification Code', codeExpiresIn: 'Code go expire for 10 minutes', back: 'Back', verifying: 'E dey verify...', verify: 'Verify', resend: 'Send Code Again',
    title: 'Change Password', subtitle: 'Change your account password',
    currentLabel: 'Current Password *', newLabel: 'New Password * (8 characters minimum)', confirmLabel: 'Confirm New Password *',
    verifyVia: 'Verify with:', emailBtn: 'Email', phoneBtn: 'Phone',
    secNote: 'Security Note:', sec1: 'You go receive verification code', sec2: 'Code dey valid for 10 minutes', sec3: 'Password must be 8 characters or more', continueBtn: 'Continue',
  },
  ar: {
    errCurrentWrong: 'كلمة المرور الحالية غير صحيحة', errMin8: 'يجب أن تتكون كلمة المرور الجديدة من 8 أحرف على الأقل',
    errNoMatch: 'كلمتا المرور الجديدتان غير متطابقتين', errSameAsOld: 'يجب أن تختلف كلمة المرور الجديدة عن الحالية',
    codeSentEmail: (e, c) => `تم إرسال رمز التحقق إلى ${e}\n\nللتجربة: ${c}`,
    codeSentPhone: (p, c) => `تم إرسال رمز التحقق إلى ${p}\n\nللتجربة: ${c}`,
    codeNotFound: 'لم يتم العثور على رمز التحقق. يرجى المحاولة مرة أخرى.', codeExpired: 'انتهت صلاحية رمز التحقق. يرجى المحاولة مرة أخرى.',
    codeInvalid: 'رمز التحقق غير صالح', changeFailed: 'فشل تغيير كلمة المرور. يرجى المحاولة مرة أخرى.',
    successTitle: 'تم تغيير كلمة المرور!', successDesc: 'تم تحديث كلمة المرور بنجاح.', done: 'تم',
    verifyTitle: 'تحقق من هويتك', verifyDescPrefix: 'أدخل الرمز المكون من 6 أرقام المُرسَل إلى', methodEmail: 'بريدك الإلكتروني', methodPhone: 'هاتفك',
    codeLabel: 'رمز التحقق', codeExpiresIn: 'ينتهي الرمز خلال 10 دقائق', back: 'رجوع', verifying: 'جارٍ التحقق...', verify: 'تحقق', resend: 'إعادة إرسال الرمز',
    title: 'تغيير كلمة المرور', subtitle: 'تحديث كلمة مرور حسابك',
    currentLabel: 'كلمة المرور الحالية *', newLabel: 'كلمة المرور الجديدة * (8 أحرف على الأقل)', confirmLabel: 'تأكيد كلمة المرور الجديدة *',
    verifyVia: 'التحقق عبر:', emailBtn: 'البريد الإلكتروني', phoneBtn: 'الهاتف',
    secNote: 'ملاحظة أمنية:', sec1: 'ستتلقى رمز تحقق', sec2: 'الرمز صالح لمدة 10 دقائق', sec3: 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل', continueBtn: 'متابعة',
  },
  ff: {
    errCurrentWrong: 'Finnde jontannde ndee feewaani', errMin8: 'Finnde hesere foti laataade alkulal 8 famɗi fof',
    errNoMatch: 'Ɗe finndeeji hesi ɗiɗi ndaawondiraani', errSameAsOld: 'Finnde hesere foti seedaade e jontannde ndee',
    codeSentEmail: (e, c) => `Kod goongɗingol nuliraama to ${e}\n\nNgam ndaarɗe: ${c}`,
    codeSentPhone: (p, c) => `Kod goongɗingol nuliraama to ${p}\n\nNgam ndaarɗe: ${c}`,
    codeNotFound: 'Kod goongɗingol heɓaaka. Tiiɗno eto kadi.', codeExpired: 'Kod goongɗingol timmii. Tiiɗno eto kadi.',
    codeInvalid: 'Kod goongɗingol moƴƴaani', changeFailed: 'Waylugol finnde hawri. Tiiɗno eto kadi.',
    successTitle: 'Finnde waylaama!', successDesc: 'Finnde maa hesɗitinaama no moƴƴi.', done: 'Gasii',
    verifyTitle: 'Goongɗin pellital maa', verifyDescPrefix: 'Naatnu kod alkule 6 nuliraaɗo to', methodEmail: 'iimeel maa', methodPhone: 'telefoŋ maa',
    codeLabel: 'Kod goongɗingol', codeExpiresIn: 'Kod on timmat e nder hojomaaji 10', back: 'Rutto', verifying: 'Ɗon goongɗinee...', verify: 'Goongɗin', resend: 'Nul kod kadi',
    title: 'Waylu finnde', subtitle: 'Hesɗitin finnde konto maa',
    currentLabel: 'Finnde jontannde *', newLabel: 'Finnde hesere * (alkulal 8 famɗi fof)', confirmLabel: 'Teeŋtin finnde hesere *',
    verifyVia: 'Goongɗin e:', emailBtn: 'Iimeel', phoneBtn: 'Telefoŋ',
    secNote: 'Tinndinol kisal:', sec1: 'A heɓat kod goongɗingol', sec2: 'Kod on ina moƴƴi e nder hojomaaji 10', sec3: 'Finnde foti laataade alkulal 8 famɗi fof', continueBtn: 'Jokku',
  },
};

export default function ChangePasswordForm() {
  const langCode = useLang();
  const l: Lang = (langCode in S ? langCode : 'en') as Lang;
  const s = S[l];
  const isRtl = l === 'ar';

  const [step, setStep]                           = useState<'password' | 'verification' | 'success'>('password');
  const [currentPassword, setCurrentPassword]     = useState('');
  const [newPassword, setNewPassword]             = useState('');
  const [confirmPassword, setConfirmPassword]     = useState('');
  const [verificationCode, setVerificationCode]   = useState('');
  const [verificationMethod, setVerificationMethod] = useState<'email' | 'phone'>('email');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword]         = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting]           = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('Bambeh_current_user') || '{}');
  const userEmail   = currentUser.email || '';
  const userPhone   = currentUser.phone || '';

  const generateVerificationCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const sendVerificationCode = (code: string) => {
    const expiryTime = new Date().getTime() + 10 * 60 * 1000;
    localStorage.setItem('Bambeh_password_change_code', code);
    localStorage.setItem('Bambeh_password_change_code_expiry', expiryTime.toString());
    if (verificationMethod === 'email') {
      console.log(`Verification code sent to ${userEmail}: ${code}`);
      alert(s.codeSentEmail(userEmail, code));
    } else {
      console.log(`Verification code sent to ${userPhone}: ${code}`);
      alert(s.codeSentPhone(userPhone, code));
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPassword !== currentUser.password) { alert(s.errCurrentWrong); return; }
    if (newPassword.length < 8) { alert(s.errMin8); return; }
    if (newPassword !== confirmPassword) { alert(s.errNoMatch); return; }
    if (newPassword === currentPassword) { alert(s.errSameAsOld); return; }
    const code = generateVerificationCode();
    sendVerificationCode(code);
    setStep('verification');
  };

  const handleVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const storedCode = localStorage.getItem('Bambeh_password_change_code');
      const expiryTime = localStorage.getItem('Bambeh_password_change_code_expiry');
      if (!storedCode || !expiryTime) {
        alert(s.codeNotFound);
        setStep('password');
        return;
      }
      if (new Date().getTime() > parseInt(expiryTime)) {
        alert(s.codeExpired);
        localStorage.removeItem('Bambeh_password_change_code');
        localStorage.removeItem('Bambeh_password_change_code_expiry');
        setStep('password');
        return;
      }
      if (verificationCode !== storedCode) { alert(s.codeInvalid); return; }
      currentUser.password = newPassword;
      localStorage.setItem('Bambeh_current_user', JSON.stringify(currentUser));
      const users = JSON.parse(localStorage.getItem('Bambeh_users') || '[]');
      const userIndex = users.findIndex((u: any) => u.id === currentUser.id);
      if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        localStorage.setItem('Bambeh_users', JSON.stringify(users));
      }
      localStorage.removeItem('Bambeh_password_change_code');
      localStorage.removeItem('Bambeh_password_change_code_expiry');
      setStep('success');
    } catch (error) {
      console.error('Error changing password:', error);
      alert(s.changeFailed);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep('password');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setVerificationCode('');
  };

  if (step === 'success') {
    return (
      <div dir={isRtl ? 'rtl' : 'ltr'} className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{s.successTitle}</h2>
          <p className="text-gray-600 mb-6">{s.successDesc}</p>
          <button onClick={resetForm} className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold">{s.done}</button>
        </div>
      </div>
    );
  }

  if (step === 'verification') {
    return (
      <div dir={isRtl ? 'rtl' : 'ltr'} className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{s.verifyTitle}</h2>
          <p className="text-gray-600">{s.verifyDescPrefix} {verificationMethod === 'email' ? s.methodEmail : s.methodPhone}</p>
          <p className="text-sm text-gray-500 mt-1">{verificationMethod === 'email' ? userEmail : userPhone}</p>
        </div>
        <form onSubmit={handleVerificationSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{s.codeLabel}</label>
            <input type="text" value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000" maxLength={6}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-center text-2xl tracking-widest font-mono"
              required />
            <p className="text-xs text-gray-500 mt-2 text-center">{s.codeExpiresIn}</p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep('password')} className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold">{s.back}</button>
            <button type="submit" disabled={isSubmitting || verificationCode.length !== 6}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed">
              {isSubmitting ? s.verifying : s.verify}
            </button>
          </div>
          <button type="button"
            onClick={() => { const code = generateVerificationCode(); sendVerificationCode(code); }}
            className="w-full text-sm text-blue-600 hover:text-blue-700 font-semibold">
            {s.resend}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center"><Lock className="w-6 h-6 text-teal-600" /></div>
        <div><h2 className="text-2xl font-bold text-gray-900">{s.title}</h2><p className="text-sm text-gray-600">{s.subtitle}</p></div>
      </div>

      <form onSubmit={handlePasswordSubmit} className="space-y-6">
        {/* Current Password */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">{s.currentLabel}</label>
          <div className="relative">
            <input type={showCurrentPassword ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-teal-200 focus:border-teal-500 pr-12" required />
            <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
              {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">{s.newLabel}</label>
          <div className="relative">
            <input type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-teal-200 focus:border-teal-500 pr-12" minLength={8} required />
            <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
              {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">{s.confirmLabel}</label>
          <div className="relative">
            <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-teal-200 focus:border-teal-500 pr-12" minLength={8} required />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Verification Method */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">{s.verifyVia}</label>
          <div className="grid grid-cols-2 gap-3">
            {userEmail && (
              <button type="button" onClick={() => setVerificationMethod('email')}
                className={`p-4 border-2 rounded-lg flex items-center gap-3 ${verificationMethod === 'email' ? 'border-teal-500 bg-teal-50' : 'border-gray-300 hover:border-gray-400'}`}>
                <Mail className="w-5 h-5" /><span className="text-sm font-semibold">{s.emailBtn}</span>
              </button>
            )}
            {userPhone && (
              <button type="button" onClick={() => setVerificationMethod('phone')}
                className={`p-4 border-2 rounded-lg flex items-center gap-3 ${verificationMethod === 'phone' ? 'border-teal-500 bg-teal-50' : 'border-gray-300 hover:border-gray-400'}`}>
                <Phone className="w-5 h-5" /><span className="text-sm font-semibold">{s.phoneBtn}</span>
              </button>
            )}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
          <p className="font-semibold mb-1">{s.secNote}</p>
          <ul className="list-disc list-inside space-y-1 text-blue-800">
            <li>{s.sec1}</li>
            <li>{s.sec2}</li>
            <li>{s.sec3}</li>
          </ul>
        </div>

        <button type="submit" className="w-full px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold transition-colors">{s.continueBtn}</button>
      </form>
    </div>
  );
}
