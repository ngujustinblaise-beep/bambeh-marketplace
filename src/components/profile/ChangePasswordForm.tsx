/**
 * CHANGE PASSWORD FORM - With Email/Phone Verification
 * FILE LOCATION: src/components/profile/ChangePasswordForm.tsx
 */
import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Phone, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { useLang } from '@/hooks/useAppLang';

type Lang = 'en' | 'fr' | 'pidgin' | 'ar' | 'ff';

const S: Record<Lang, any> = {
  en: {
    title: 'Change Password',
    subtitle: 'Update your account password',
    currentLabel: 'Current Password *',
    newLabel: 'New Password * (minimum 8 characters)',
    confirmLabel: 'Confirm New Password *',
    errCurrentWrong: 'Current password is incorrect',
    errMin8: 'New password must be at least 8 characters',
    errNoMatch: 'New passwords do not match',
    errSameAsOld: 'New password must be different from current password',
    verifyTitle: 'Verify Your Identity',
    verifyDescPrefix: 'Enter the 6-digit code sent to your ',
    codeLabel: 'Verification Code',
    continueBtn: 'Continue',
    verifyBtn: 'Verify Code',
    successTitle: 'Password Changed!',
    successDesc: 'Your password has been successfully updated.',
    done: 'Done',
    back: 'Back',
    verifyVia: 'Verify via:',
    emailBtn: 'Email',
    phoneBtn: 'Phone'
  },
  fr: {
    title: 'Changer le mot de passe',
    subtitle: 'Mettre à jour le mot de passe de votre compte',
    currentLabel: 'Mot de passe actuel *',
    newLabel: 'Nouveau mot de passe * (minimum 8 caractères)',
    confirmLabel: 'Confirmer le nouveau mot de passe *',
    errCurrentWrong: 'Le mot de passe actuel est incorrect',
    errMin8: 'Le nouveau mot de passe doit comporter au moins 8 caractères',
    errNoMatch: 'Les nouveaux mots de passe ne correspondent pas',
    errSameAsOld: 'Le nouveau mot de passe doit être différent du mot de passe actuel',
    verifyTitle: 'Vérifier votre identité',
    verifyDescPrefix: 'Entrez le code à 6 chiffres envoyé à votre ',
    codeLabel: 'Code de vérification',
    continueBtn: 'Continuer',
    verifyBtn: 'Vérifier le code',
    successTitle: 'Mot de passe changé !',
    successDesc: 'Votre mot de passe a été mis à jour avec succès.',
    done: 'Terminé',
    back: 'Retour',
    verifyVia: 'Vérifier via :',
    emailBtn: 'E-mail',
    phoneBtn: 'Téléphone'
  },
  pidgin: {
    title: 'Change Password',
    subtitle: 'Update your password data',
    currentLabel: 'Current Password *',
    newLabel: 'New Password * (make e pass 8 characters)',
    confirmLabel: 'Confirm New Password *',
    errCurrentWrong: 'Old password no correct',
    errMin8: 'E must long reach 8 characters',
    errNoMatch: 'The two password no dey match',
    errSameAsOld: 'Put new password inside, no be old one',
    verifyTitle: 'Check say na You',
    verifyDescPrefix: 'Enter the 6-digit code wey we send for your ',
    codeLabel: 'Verification Code',
    continueBtn: 'Go ahead',
    verifyBtn: 'Check Code',
    successTitle: 'Password don change!',
    successDesc: 'Your password don update fine fine.',
    done: 'Done',
    back: 'Back',
    verifyVia: 'Verify via:',
    emailBtn: 'Email',
    phoneBtn: 'Phone'
  },
  ar: {
    title: 'تغيير كلمة المرور',
    subtitle: 'تحديث كلمة مرور حسابك',
    currentLabel: 'كلمة المرور الحالية *',
    newLabel: 'كلمة المرور الجديدة * (8 رموز على الأقل)',
    confirmLabel: 'تأكيد كلمة المرور الجديدة *',
    errCurrentWrong: 'كلمة المرور الحالية غير صحيحة',
    errMin8: 'يجب أن تتكون من 8 رموز على الأقل',
    errNoMatch: 'كلمات المرور غير متطابقة',
    errSameAsOld: 'يجب أن تختلف عن كلمة المرور الحالية',
    verifyTitle: 'التحقق من الهوية',
    verifyDescPrefix: 'أدخل رمز التحقق المكون من 6 أرقام المرسل إلى ',
    codeLabel: 'رمز التحقق',
    continueBtn: 'متابعة',
    verifyBtn: 'تحقق من الرمز',
    successTitle: 'تم تغيير كلمة المرور!',
    successDesc: 'تم تحديث كلمة المرور الخاصة بك بنجاح.',
    done: 'تم',
    back: 'رجوع',
    verifyVia: 'التحقق عبر:',
    emailBtn: 'البريد الإلكتروني',
    phoneBtn: 'الهاتف'
  },
  ff: {
    title: 'Waylu udditirgal',
    subtitle: 'Hesɗitinu udditirgal ngal suudu ma',
    currentLabel: 'Udditirgal jooni ngal *',
    newLabel: 'Udditirgal kesal ngal * (haa hebba 8 harfeere)',
    confirmLabel: 'Tabbitinu udditirgal kesal ngal *',
    errCurrentWrong: 'Udditirgal jooni ngal woodani',
    errMin8: 'Haa hebba 8 harfeere woodi',
    errNoMatch: 'Udditirgal ngal nanondiray',
    errSameAsOld: 'Hana laata udditirgal ngal jooni ngal',
    verifyTitle: 'Hoolna hoore ma',
    verifyDescPrefix: 'Naatnu lambi 6 limngal ngal neldaa haa ',
    codeLabel: 'Lambi hoolnugo',
    continueBtn: 'Yeeso',
    verifyBtn: 'Hoolnu lambi',
    successTitle: 'Udditirgal waylake!',
    successDesc: 'Udditirgal kesal ngal hootama no feewi.',
    done: 'Gasi',
    back: 'Caggal',
    verifyVia: 'Hoolnu bee:',
    emailBtn: 'Iimeel',
    phoneBtn: 'Teelefon'
  }
};

export default function ChangePasswordForm({ onClose }: { onClose?: () => void }) {
  const langCode = useLang();
  const l: Lang = (langCode in S ? langCode : 'en') as Lang;
  const s = S[l];
  const isRtl = l === 'ar';

  const [step, setStep] = useState(1); 
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [code, setCode] = useState('');
  
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  const handleContinue = () => {
    if (!oldPwd || !newPwd || !confirmPwd) {
      setError('Please fill all fields');
      return;
    }
    if (newPwd.length < 8) {
      setError(s.errMin8);
      return;
    }
    if (newPwd !== confirmPwd) {
      setError(s.errNoMatch);
      return;
    }
    if (oldPwd === newPwd) {
      setError(s.errSameAsOld);
      return;
    }
    setError('');
    setStep(2);
  };

  const handleVerify = () => {
    if (code.length !== 6) {
      setError('Invalid verification code');
      return;
    }
    setError('');
    setStep(3);
  };

  if (step === 3) {
    return (
      <div dir={isRtl ? 'rtl' : 'ltr'} className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-md text-center">
        <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{s.successTitle}</h2>
        <p className="text-gray-600 mb-6">{s.successDesc}</p>
        <button onClick={onClose} className="w-full py-3 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 transition-colors">
          {s.done}
        </button>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div dir={isRtl ? 'rtl' : 'ltr'} className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-1">{s.verifyTitle}</h2>
        <p className="text-gray-500 text-sm mb-6">{s.verifyDescPrefix}{method === 'email' ? s.emailBtn : s.phoneBtn}.</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">{s.codeLabel}</label>
          <input 
            type="text" 
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
            className="w-full tracking-widest text-center text-xl font-bold py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex gap-3">
          <button onClick={() => setStep(1)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200">
            {s.back}
          </button>
          <button onClick={handleVerify} className="flex-1 py-3 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700">
            {s.verifyBtn}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-1">{s.title}</h2>
      <p className="text-gray-500 mb-6">{s.subtitle}</p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">{s.verifyVia}</label>
          <div className="flex gap-4 mb-4">
            <button type="button" onClick={() => setMethod('email')} className={`flex-1 py-2 px-4 rounded-lg border flex items-center justify-center gap-2 font-medium ${method === 'email' ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-600'}`}>
              <Mail className="w-4 h-4" /> {s.emailBtn}
            </button>
            <button type="button" onClick={() => setMethod('phone')} className={`flex-1 py-2 px-4 rounded-lg border flex items-center justify-center gap-2 font-medium ${method === 'phone' ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-600'}`}>
              <Phone className="w-4 h-4" /> {s.phoneBtn}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{s.currentLabel}</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type={showOld ? 'text' : 'password'} 
              value={oldPwd} 
              onChange={e => setOldPwd(e.target.value)} 
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" 
            />
            <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2">
              {showOld ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{s.newLabel}</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type={showNew ? 'text' : 'password'} 
              value={newPwd} 
              onChange={e => setNewPwd(e.target.value)} 
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" 
            />
            <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2">
              {showNew ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{s.confirmLabel}</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type={showConfirm ? 'text' : 'password'} 
              value={confirmPwd} 
              onChange={e => setConfirmPwd(e.target.value)} 
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" 
            />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2">
              {showConfirm ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
            </button>
          </div>
        </div>

        <button onClick={handleContinue} className="w-full mt-2 py-3 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 transition-all">
          {s.continueBtn}
        </button>
      </div>
    </div>
  );
}