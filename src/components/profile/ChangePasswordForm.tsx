/**
 * ChangePasswordForm.tsx — Bambeh Marketplace
 * FILE LOCATION: src/components/profile/ChangePasswordForm.tsx
 *
 * i18n: Dynamic multi-lingual security verification and workflow management.
 * Fully optimized across English, French, Pidgin, Arabic (RTL), and Fulfulde.
 *
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Phone, Shield, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/App';

type Lang = "en" | "fr" | "pidgin" | "ar" | "ff";

const S: Record<Lang, {
  pwdChanged: string;
  pwdUpdated: string;
  done: string;
  verifyIdentity: string;
  enterCode: string;
  codeLabel: string;
  expiresIn: string;
  back: string;
  verifying: string;
  verifyBtn: string;
  resendCode: string;
  changePwdTitle: string;
  changePwdSub: string;
  currentPwdLabel: string;
  newPwdLabel: string;
  confirmPwdLabel: string;
  verifyVia: string;
  email: string;
  phone: string;
  secNoteTitle: string;
  secNote1: string;
  secNote2: string;
  secNote3: string;
  continueBtn: string;
  errIncorrect: string;
  errMinLength: string;
  errNoMatch: string;
  errSame: string;
  errNoCode: string;
  errExpired: string;
  errInvalidCode: string;
  errFailed: string;
  alertSent: string;
}> = {
  en: {
    pwdChanged: "Password Changed!",
    pwdUpdated: "Your password has been successfully updated.",
    done: "Done",
    verifyIdentity: "Verify Your Identity",
    enterCode: "Enter the 6-digit code sent to your",
    codeLabel: "Verification Code",
    expiresIn: "Code expires in 10 minutes",
    back: "Back",
    verifying: "Verifying...",
    verifyBtn: "Verify",
    resendCode: "Resend Code",
    changePwdTitle: "Change Password",
    changePwdSub: "Update your account password",
    currentPwdLabel: "Current Password *",
    newPwdLabel: "New Password * (minimum 8 characters)",
    confirmPwdLabel: "Confirm New Password *",
    verifyVia: "Verify via:",
    email: "Email",
    phone: "Phone",
    secNoteTitle: "Security Note:",
    secNote1: "You'll receive a verification code",
    secNote2: "Code is valid for 10 minutes",
    secNote3: "Password must be at least 8 characters",
    continueBtn: "Continue",
    errIncorrect: "Current password is incorrect",
    errMinLength: "New password must be at least 8 characters",
    errNoMatch: "New passwords do not match",
    errSame: "New password must be different from current password",
    errNoCode: "Verification code not found. Please try again.",
    errExpired: "Verification code has expired. Please try again.",
    errInvalidCode: "Invalid verification code",
    errFailed: "Failed to change password. Please try again.",
    alertSent: "Verification code sent to"
  },
  fr: {
    pwdChanged: "Mot de passe modifié !",
    pwdUpdated: "Votre mot de passe a été mis à jour avec succès.",
    done: "Terminé",
    verifyIdentity: "Vérifiez votre identité",
    enterCode: "Entrez le code à 6 chiffres envoyé à votre",
    codeLabel: "Code de vérification",
    expiresIn: "Le code expire dans 10 minutes",
    back: "Retour",
    verifying: "Vérification...",
    verifyBtn: "Vérifier",
    resendCode: "Renvoyer le code",
    changePwdTitle: "Changer le mot de passe",
    changePwdSub: "Mettre à jour le mot de passe de votre compte",
    currentPwdLabel: "Mot de passe actuel *",
    newPwdLabel: "Nouveau mot de passe * (minimum 8 caractères)",
    confirmPwdLabel: "Confirmer le nouveau mot de passe *",
    verifyVia: "Vérifier par :",
    email: "E-mail",
    phone: "Téléphone",
    secNoteTitle: "Note de sécurité :",
    secNote1: "Vous recevrez un code de vérification",
    secNote2: "Le code est valide pendant 10 minutes",
    secNote3: "Le mot de passe doit contenir au moins 8 caractères",
    continueBtn: "Continuer",
    errIncorrect: "Le mot de passe actuel est incorrect",
    errMinLength: "Le nouveau mot de passe doit contenir au moins 8 caractères",
    errNoMatch: "Les nouveaux mots de passe ne correspondent pas",
    errSame: "Le nouveau mot de passe doit être différent du mot de passe actuel",
    errNoCode: "Code de vérification introuvable. Veuillez réessayer.",
    errExpired: "Le code de vérification a expiré. Veuillez réessayer.",
    errInvalidCode: "Code de vérification invalide",
    errFailed: "Échec de la modification du mot de passe. Veuillez réessayer.",
    alertSent: "Code de vérification envoyé à"
  },
  pidgin: {
    pwdChanged: "Password Don Change!",
    pwdUpdated: "Your new password don set fine fine.",
    done: "E don do",
    verifyIdentity: "Show say na you",
    enterCode: "Enter the 6-digit code wey we send for your",
    codeLabel: "Verification Code",
    expiresIn: "Code go die after 10 minutes",
    back: "Go Back",
    verifying: "Dey check am...",
    verifyBtn: "Verify",
    resendCode: "Send another code",
    changePwdTitle: "Change Password",
    changePwdSub: "Change your account password",
    currentPwdLabel: "Password wey you dey use now *",
    newPwdLabel: "New Password * (minimum 8 characters)",
    confirmPwdLabel: "Confirm New Password *",
    verifyVia: "Verify clear with:",
    email: "Email",
    phone: "Phone",
    secNoteTitle: "Security Note:",
    secNote1: "You go get code sharp sharp",
    secNote2: "Code dey work for only 10 minutes",
    secNote3: "Password must long reach 8 characters",
    continueBtn: "Continue",
    errIncorrect: "That your current password no correct",
    errMinLength: "New password must long reach 8 characters",
    errNoMatch: "The two new password no match",
    errSame: "New password must different from the old one",
    errNoCode: "We no find code. Try again.",
    errExpired: "Code don die. Try again.",
    errInvalidCode: "That code no correct",
    errFailed: "Password no fit change. Try again.",
    alertSent: "We don send code to"
  },
  ar: {
    pwdChanged: "تم تغيير كلمة المرور!",
    pwdUpdated: "تم تحديث كلمة المرور الخاصة بك بنجاح.",
    done: "تم",
    verifyIdentity: "تحقق من هويتك",
    enterCode: "أدخل الرمز المكون من 6 أرقام المرسل إلى",
    codeLabel: "رمز التحقق",
    expiresIn: "تنتهي صلاحية الرمز خلال 10 دقائق",
    back: "رجوع",
    verifying: "جاري التحقق...",
    verifyBtn: "تحقق",
    resendCode: "إعادة إرسال الرمز",
    changePwdTitle: "تغيير كلمة المرور",
    changePwdSub: "تحديث كلمة مرور حسابك",
    currentPwdLabel: "كلمة المرور الحالية *",
    newPwdLabel: "كلمة المرور الجديدة * (8 أحرف كحد أدنى)",
    confirmPwdLabel: "تأكيد كلمة المرور الجديدة *",
    verifyVia: "التحقق عبر:",
    email: "البريد الإلكتروني",
    phone: "الهاتف المحمول",
    secNoteTitle: "ملاحظة أمنية:",
    secNote1: "ستتلقى رمزًا للتحقق",
    secNote2: "الرمز صالح لمدة 10 دقائق فقط",
    secNote3: "يجب ألا تقل كلمة المرور عن 8 أحرف",
    continueBtn: "متابعة",
    errIncorrect: "كلمة المرور الحالية غير صحيحة",
    errMinLength: "يجب أن تتكون كلمة المرور الجديدة من 8 أحرف على الأقل",
    errNoMatch: "كلمتا المرور الجديدتان غير متطابقتين",
    errSame: "يجب أن تكون كلمة المرور الجديدة مختلفة عن الحالية",
    errNoCode: "لم يتم العثور على رمز التحقق. يرجى المحاولة مرة أخرى.",
    errExpired: "انتهت صلاحية الرمز. يرجى المحاولة مرة أخرى.",
    errInvalidCode: "رمز التحقق غير صالح",
    errFailed: "فشل تغيير كلمة المرور. يرجى المحاولة مرة أخرى.",
    alertSent: "تم إرسال رمز التحقق إلى"
  },
  ff: {
    pwdChanged: "Finnde Ndariama!",
    pwdUpdated: "Finnde maa hesɗitinaama ko woodi.",
    done: "Yotti",
    verifyIdentity: "Tabbitin naŋge maa",
    enterCode: "Waɗu limoore digiti 6 neldaande haa",
    codeLabel: "Limoore Tabbitinol",
    expiresIn: "Limoore don firti caggal minti 10",
    back: "Caggal",
    verifying: "Ɗon tabbitina...",
    verifyBtn: "Tabbitin",
    resendCode: "Neldu kadi",
    changePwdTitle: "Waylu Finnde",
    changePwdSub: "Hesɗitin finnde sirlu akaunt maa",
    currentPwdLabel: "Finnde jooni *",
    newPwdLabel: "Finnde heese * (hoolu binndi 8)",
    confirmPwdLabel: "Tiggu finnde heese *",
    verifyVia: "Tabbitin bee:",
    email: "Email",
    phone: "Telefoŋ",
    secNoteTitle: "Hoolaare sirlu:",
    secNote1: "A heɓan limoore tabbitinol jooni",
    secNote2: "Limoore ɗon gollata tan nder minti 10",
    secNote3: "Finnde maa yo ɓura binndi 8 fof",
    continueBtn: "Yeeso",
    errIncorrect: "Finnde jooni ndon foti jofaaki",
    errMinLength: "Finnde heese yo hewtu binndi 8 fof",
    errNoMatch: "Finndeeji heese ɗon pottataay",
    errSame: "Finnde heese yo potti e finnde ɓooymaare",
    errNoCode: "Walaa limoore tabbitinol ngandaande. Tiiɗno eto kadi.",
    errExpired: "Limoore tabbitinol firtama. Tiiɗno eto kadi.",
    errInvalidCode: "Limoore tabbitinol wonaa goonga",
    errFailed: "Ruskama waylungo finnde. Tiiɗno eto kadi.",
    alertSent: "Neldaama limoore tabbitinol haa"
  }
};

export default function ChangePasswordForm() {
  const { language } = useLanguage();
  const lang: Lang = (language in S ? language : "en") as Lang;
  const s = S[lang];
  const isRtl = lang === "ar";

  const [step, setStep]                              = useState<'password' | 'verification' | 'success'>('password');
  const [currentPassword, setCurrentPassword]         = useState('');
  const [newPassword, setNewPassword]                 = useState('');
  const [confirmPassword, setConfirmPassword]         = useState('');
  const [verificationCode, setVerificationCode]       = useState('');
  const [verificationMethod, setVerificationMethod]   = useState<'email' | 'phone'>('email');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword]         = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting]               = useState(false);

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
    const targetDestination = verificationMethod === 'email' ? userEmail : userPhone;
    console.log(`Verification code sent to ${targetDestination}: ${code}`);
    alert(`${s.alertSent} ${targetDestination}\n\nFor demo: ${code}`);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPassword !== currentUser.password) { alert(s.errIncorrect); return; }
    if (newPassword.length < 8) { alert(s.errMinLength); return; }
    if (newPassword !== confirmPassword) { alert(s.errNoMatch); return; }
    if (newPassword === currentPassword) { alert(s.errSame); return; }
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
        alert(s.errNoCode);
        setStep('password');
        return;
      }
      if (new Date().getTime() > parseInt(expiryTime)) {
        alert(s.errExpired);
        localStorage.removeItem('Bambeh_password_change_code');
        localStorage.removeItem('Bambeh_password_change_code_expiry');
        setStep('password');
        return;
      }
      if (verificationCode !== storedCode) { alert(s.errInvalidCode); return; }
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
      alert(s.errFailed);
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
      <div dir={isRtl ? "rtl" : "ltr"} className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{s.pwdChanged}</h2>
        <p className="text-gray-600 text-sm mb-6">{s.pwdUpdated}</p>
        <button onClick={resetForm} className="w-full sm:w-auto px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold text-sm transition-colors">
          {s.done}
        </button>
      </div>
    );
  }

  if (step === 'verification') {
    return (
      <div dir={isRtl ? "rtl" : "ltr"} className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto text-start">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{s.verifyIdentity}</h2>
          <p className="text-gray-600 text-sm">{s.enterCode} {verificationMethod === 'email' ? s.email : s.phone}</p>
          <p className="text-sm font-semibold text-gray-500 mt-1">{verificationMethod === 'email' ? userEmail : userPhone}</p>
        </div>
        <form onSubmit={handleVerificationSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{s.codeLabel}</label>
            <input type="text" value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000" maxLength={6}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-center text-2xl tracking-widest font-mono focus:outline-none"
              required />
            <p className="text-xs text-gray-400 mt-2 text-center">{s.expiresIn}</p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep('password')} className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm font-bold transition-colors">
              {s.back}
            </button>
            <button type="submit" disabled={isSubmitting || verificationCode.length !== 6}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-bold disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors">
              {isSubmitting ? s.verifying : s.verifyBtn}
            </button>
          </div>
          <button type="button"
            onClick={() => { const code = generateVerificationCode(); sendVerificationCode(code); }}
            className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-semibold focus:outline-none">
            {s.resendCode}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto text-start">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
          <Lock className="w-6 h-6 text-teal-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{s.changePwdTitle}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{s.changePwdSub}</p>
        </div>
      </div>

      <form onSubmit={handlePasswordSubmit} className="space-y-5">
        {/* Current Password */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">{s.currentPwdLabel}</label>
          <div className="relative">
            <input type={showCurrentPassword ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
              className={`w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-teal-100 focus:border-teal-500 ${isRtl ? 'pl-12 pr-4' : 'pr-12 pl-4'} text-sm focus:outline-none`} required />
            <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className={`absolute ${isRtl ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none`}>
              {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">{s.newPwdLabel}</label>
          <div className="relative">
            <input type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              className={`w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-teal-100 focus:border-teal-500 ${isRtl ? 'pl-12 pr-4' : 'pr-12 pl-4'} text-sm focus:outline-none`} minLength={8} required />
            <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className={`absolute ${isRtl ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none`}>
              {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">{s.confirmPwdLabel}</label>
          <div className="relative">
            <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-teal-100 focus:border-teal-500 ${isRtl ? 'pl-12 pr-4' : 'pr-12 pl-4'} text-sm focus:outline-none`} minLength={8} required />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className={`absolute ${isRtl ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none`}>
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
                className={`p-3.5 border-2 rounded-lg flex items-center justify-center gap-2 transition-all focus:outline-none ${verificationMethod === 'email' ? 'border-teal-600 bg-teal-50/50 text-teal-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                <Mail className="w-4 h-4 flex-shrink-0" /><span className="text-xs font-bold">{s.email}</span>
              </button>
            )}
            {userPhone && (
              <button type="button" onClick={() => setVerificationMethod('phone')}
                className={`p-3.5 border-2 rounded-lg flex items-center justify-center gap-2 transition-all focus:outline-none ${verificationMethod === 'phone' ? 'border-teal-600 bg-teal-50/50 text-teal-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                <Phone className="w-4 h-4 flex-shrink-0" /><span className="text-xs font-bold">{s.phone}</span>
              </button>
            )}
          </div>
        </div>

        {/* Security Summary Panel */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-900">
          <p className="font-bold flex items-center gap-1 text-blue-950 mb-1.5">
            <span>🛡️</span> {s.secNoteTitle}
          </p>
          <ul className={`list-disc ${isRtl ? 'pr-4 pl-0' : 'pl-4 pr-0'} space-y-1 text-blue-800`}>
            <li>{s.secNote1}</li>
            <li>{s.secNote2}</li>
            <li>{s.secNote3}</li>
          </ul>
        </div>

        <button type="submit" className="w-full px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-bold text-sm transition-colors shadow-sm focus:outline-none">
          {s.continueBtn}
        </button>
      </form>
    </div>
  );
}