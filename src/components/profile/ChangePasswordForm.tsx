/**
 * CHANGE PASSWORD FORM - With Email/Phone Verification
 * FILE LOCATION: src/components/profile/ChangePasswordForm.tsx
 */

import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Phone, Shield, CheckCircle } from 'lucide-react';

export default function ChangePasswordForm() {
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
      alert(`Verification code sent to ${userEmail}\n\nFor demo: ${code}`);
    } else {
      console.log(`Verification code sent to ${userPhone}: ${code}`);
      alert(`Verification code sent to ${userPhone}\n\nFor demo: ${code}`);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPassword !== currentUser.password) { alert('Current password is incorrect'); return; }
    if (newPassword.length < 8) { alert('New password must be at least 8 characters'); return; }
    if (newPassword !== confirmPassword) { alert('New passwords do not match'); return; }
    if (newPassword === currentPassword) { alert('New password must be different from current password'); return; }
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
        alert('Verification code not found. Please try again.');
        setStep('password');
        return;
      }
      if (new Date().getTime() > parseInt(expiryTime)) {
        alert('Verification code has expired. Please try again.');
        localStorage.removeItem('Bambeh_password_change_code');
        localStorage.removeItem('Bambeh_password_change_code_expiry');
        setStep('password');
        return;
      }
      if (verificationCode !== storedCode) { alert('Invalid verification code'); return; }
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
      alert('Failed to change password. Please try again.');
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
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Changed!</h2>
          <p className="text-gray-600 mb-6">Your password has been successfully updated.</p>
          <button onClick={resetForm} className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold">Done</button>
        </div>
      </div>
    );
  }

  if (step === 'verification') {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Identity</h2>
          <p className="text-gray-600">Enter the 6-digit code sent to your {verificationMethod}</p>
          <p className="text-sm text-gray-500 mt-1">{verificationMethod === 'email' ? userEmail : userPhone}</p>
        </div>
        <form onSubmit={handleVerificationSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Verification Code</label>
            <input type="text" value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000" maxLength={6}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-center text-2xl tracking-widest font-mono"
              required />
            <p className="text-xs text-gray-500 mt-2 text-center">Code expires in 10 minutes</p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep('password')} className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold">Back</button>
            <button type="submit" disabled={isSubmitting || verificationCode.length !== 6}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed">
              {isSubmitting ? 'Verifying...' : 'Verify'}
            </button>
          </div>
          <button type="button"
            onClick={() => { const code = generateVerificationCode(); sendVerificationCode(code); }}
            className="w-full text-sm text-blue-600 hover:text-blue-700 font-semibold">
            Resend Code
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center"><Lock className="w-6 h-6 text-teal-600" /></div>
        <div><h2 className="text-2xl font-bold text-gray-900">Change Password</h2><p className="text-sm text-gray-600">Update your account password</p></div>
      </div>

      <form onSubmit={handlePasswordSubmit} className="space-y-6">
        {/* Current Password */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password *</label>
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
          <label className="block text-sm font-semibold text-gray-700 mb-2">New Password * (minimum 8 characters)</label>
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
          <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password *</label>
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
          <label className="block text-sm font-semibold text-gray-700 mb-2">Verify via:</label>
          <div className="grid grid-cols-2 gap-3">
            {userEmail && (
              <button type="button" onClick={() => setVerificationMethod('email')}
                className={`p-4 border-2 rounded-lg flex items-center gap-3 ${verificationMethod === 'email' ? 'border-teal-500 bg-teal-50' : 'border-gray-300 hover:border-gray-400'}`}>
                <Mail className="w-5 h-5" /><span className="text-sm font-semibold">Email</span>
              </button>
            )}
            {userPhone && (
              <button type="button" onClick={() => setVerificationMethod('phone')}
                className={`p-4 border-2 rounded-lg flex items-center gap-3 ${verificationMethod === 'phone' ? 'border-teal-500 bg-teal-50' : 'border-gray-300 hover:border-gray-400'}`}>
                <Phone className="w-5 h-5" /><span className="text-sm font-semibold">Phone</span>
              </button>
            )}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
          <p className="font-semibold mb-1">Security Note:</p>
          <ul className="list-disc list-inside space-y-1 text-blue-800">
            <li>You'll receive a verification code</li>
            <li>Code is valid for 10 minutes</li>
            <li>Password must be at least 8 characters</li>
          </ul>
        </div>

        <button type="submit" className="w-full px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold transition-colors">Continue</button>
      </form>
    </div>
  );
}




