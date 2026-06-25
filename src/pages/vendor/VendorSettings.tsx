/**
 * ---------------------------------------------------------------------------
 * VENDOR SETTINGS PAGE - COMPREHENSIVE VENDOR SETTINGS
 * FILE LOCATION: src/pages/vendor/VendorSettings.tsx
 * © 2025 Bambeh. All rights reserved.
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Store, ArrowLeft, Settings, User, Bell, Shield, CreditCard, Globe,
  Eye, EyeOff, Save, Lock, Mail, Phone, Camera, Check, ChevronRight,
  Moon, Sun, Volume2, VolumeX, Smartphone, LogOut, Trash2, AlertTriangle
} from 'lucide-react';
import { useLang, t } from "@/hooks/useAppLang";

interface VendorData {
  id: string;
  username: string;
  email: string;
  phone: string;
  businessName: string;
  tier: 'basic' | 'premium' | 'gold';
}

interface SettingsSection {
  id: string;
  label: string;
  icon: any;
  color: string;
}

const settingsSections: SettingsSection[] = [
  { id: 'account', label: 'Account', icon: User, color: 'bg-blue-500' },
  { id: 'notifications', label: 'Notifications', icon: Bell, color: 'bg-yellow-500' },
  { id: 'privacy', label: 'Privacy', icon: Eye, color: 'bg-purple-500' },
  { id: 'payment', label: 'Payment', icon: CreditCard, color: 'bg-green-500' },
  { id: 'security', label: 'Security', icon: Shield, color: 'bg-red-500' },
  { id: 'language', label: 'Language & Region', icon: Globe, color: 'bg-cyan-500' },
];

export default function VendorSettings() {
  const lang = useLang();
  const isRtl = lang === "ar";
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [activeSection, setActiveSection] = useState('account');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [accountSettings, setAccountSettings] = useState({
    email: '', phone: '', businessName: '', businessDescription: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true, pushNotifications: true, smsNotifications: false,
    orderUpdates: true, newMessages: true, marketingEmails: false, soundEnabled: true
  });

  const [privacySettings, setPrivacySettings] = useState({
    showOnlineStatus: true, showLastSeen: true, showBusinessAddress: true,
    allowReviews: true, showPhoneNumber: false
  });

  const [paymentSettings, setPaymentSettings] = useState({
    mtnMomoNumber: '', orangeMoneyNumber: '', autoWithdraw: false, minimumWithdraw: 5000
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false, loginAlerts: true, sessionTimeout: 30
  });

  const [languageSettings, setLanguageSettings] = useState({
    language: 'en', currency: 'XAF', timezone: 'Africa/Douala', darkMode: false
  });

  useEffect(() => {
    const vendorData = localStorage.getItem('Bambeh_vendor');
    if (vendorData) {
      const parsed = JSON.parse(vendorData);
      setVendor(parsed);
      setAccountSettings({
        email: parsed.email || '',
        phone: parsed.phone || '',
        businessName: parsed.businessName || '',
        businessDescription: parsed.businessDescription || ''
      });
      if (parsed.paymentSettings) {
        setPaymentSettings(parsed.paymentSettings);
      }
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const updatedVendor = {
      ...vendor,
      ...accountSettings,
      notificationSettings,
      privacySettings,
      paymentSettings,
      securitySettings,
      languageSettings
    };
    localStorage.setItem('Bambeh_vendor', JSON.stringify(updatedVendor));

    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const renderAccountSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Business Name</label>
        <input type="text" value={accountSettings.businessName}
          onChange={(e) => setAccountSettings({ ...accountSettings, businessName: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="email" value={accountSettings.email}
            onChange={(e) => setAccountSettings({ ...accountSettings, email: e.target.value })}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="tel" value={accountSettings.phone}
            onChange={(e) => setAccountSettings({ ...accountSettings, phone: e.target.value })}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Business Description</label>
        <textarea value={accountSettings.businessDescription}
          onChange={(e) => setAccountSettings({ ...accountSettings, businessDescription: e.target.value })}
          rows={4}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
          placeholder="Describe your business..." />
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-4">
      {[
        { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email', icon: Mail },
        { key: 'pushNotifications', label: 'Push Notifications', desc: 'Get instant app notifications', icon: Smartphone },
        { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Receive SMS for important updates', icon: Phone },
        { key: 'orderUpdates', label: 'Order Updates', desc: 'Notifications about orders', icon: Bell },
        { key: 'newMessages', label: 'New Messages', desc: 'Alerts for new customer messages', icon: Bell },
        { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Promotional content and tips', icon: Mail },
        { key: 'soundEnabled', label: 'Notification Sound', desc: 'Play sound for notifications', icon: Volume2 },
      ].map(({ key, label, desc, icon: Icon }) => (
        <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-gray-600" />
            <div>
              <p className="font-medium text-gray-900">{label}</p>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          </div>
          <button
            onClick={() => setNotificationSettings({ ...notificationSettings, [key]: !notificationSettings[key as keyof typeof notificationSettings] })}
            className={`w-12 h-7 rounded-full transition-colors ${notificationSettings[key as keyof typeof notificationSettings] ? 'bg-purple-600' : 'bg-gray-300'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${notificationSettings[key as keyof typeof notificationSettings] ? 'translate-x-6' : 'translate-x-1'}`}/>
          </button>
        </div>
      ))}
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-4">
      {[
        { key: 'showOnlineStatus', label: 'Show Online Status', desc: "Let others see when you're online" },
        { key: 'showLastSeen', label: 'Show Last Seen', desc: 'Display your last active time' },
        { key: 'showBusinessAddress', label: 'Show Business Address', desc: 'Display your business location' },
        { key: 'allowReviews', label: 'Allow Reviews', desc: 'Customers can leave reviews' },
        { key: 'showPhoneNumber', label: 'Show Phone Number', desc: 'Display phone in public profile' },
      ].map(({ key, label, desc }) => (
        <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div>
            <p className="font-medium text-gray-900">{label}</p>
            <p className="text-sm text-gray-500">{desc}</p>
          </div>
          <button
            onClick={() => setPrivacySettings({ ...privacySettings, [key]: !privacySettings[key as keyof typeof privacySettings] })}
            className={`w-12 h-7 rounded-full transition-colors ${privacySettings[key as keyof typeof privacySettings] ? 'bg-purple-600' : 'bg-gray-300'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${privacySettings[key as keyof typeof privacySettings] ? 'translate-x-6' : 'translate-x-1'}`}/>
          </button>
        </div>
      ))}
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
        <h4 className="font-semibold text-yellow-800 mb-2">?? MTN Mobile Money</h4>
        <input type="tel" value={paymentSettings.mtnMomoNumber}
          onChange={(e) => setPaymentSettings({ ...paymentSettings, mtnMomoNumber: e.target.value })}
          placeholder="+237 6XX XXX XXX"
          className="w-full px-4 py-3 border border-yellow-300 rounded-xl bg-white" />
      </div>
      <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
        <h4 className="font-semibold text-orange-800 mb-2">?? Orange Money</h4>
        <input type="tel" value={paymentSettings.orangeMoneyNumber}
          onChange={(e) => setPaymentSettings({ ...paymentSettings, orangeMoneyNumber: e.target.value })}
          placeholder="+237 6XX XXX XXX"
          className="w-full px-4 py-3 border border-orange-300 rounded-xl bg-white" />
      </div>
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div>
          <p className="font-medium text-gray-900">Auto Withdraw</p>
          <p className="text-sm text-gray-500">Automatically withdraw when balance reaches minimum</p>
        </div>
        <button
          onClick={() => setPaymentSettings({ ...paymentSettings, autoWithdraw: !paymentSettings.autoWithdraw })}
          className={`w-12 h-7 rounded-full transition-colors ${paymentSettings.autoWithdraw ? 'bg-green-600' : 'bg-gray-300'}`}
        >
          <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${paymentSettings.autoWithdraw ? 'translate-x-6' : 'translate-x-1'}`}/>
        </button>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Minimum Withdraw Amount (XAF)</label>
        <input type="number" value={paymentSettings.minimumWithdraw}
          onChange={(e) => setPaymentSettings({ ...paymentSettings, minimumWithdraw: parseInt(e.target.value) })}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl" />
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <Link to="/vendor/change-password" className="block p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-gray-600" />
            <div>
              <p className="font-medium text-gray-900">Change Password</p>
              <p className="text-sm text-gray-500">Update your account password</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </Link>
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-gray-600" />
          <div>
            <p className="font-medium text-gray-900">Two-Factor Authentication</p>
            <p className="text-sm text-gray-500">Add extra security to your account</p>
          </div>
        </div>
        <button
          onClick={() => setSecuritySettings({ ...securitySettings, twoFactorEnabled: !securitySettings.twoFactorEnabled })}
          className={`w-12 h-7 rounded-full transition-colors ${securitySettings.twoFactorEnabled ? 'bg-green-600' : 'bg-gray-300'}`}
        >
          <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${securitySettings.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'}`}/>
        </button>
      </div>
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div>
          <p className="font-medium text-gray-900">Login Alerts</p>
          <p className="text-sm text-gray-500">Get notified of new logins</p>
        </div>
        <button
          onClick={() => setSecuritySettings({ ...securitySettings, loginAlerts: !securitySettings.loginAlerts })}
          className={`w-12 h-7 rounded-full transition-colors ${securitySettings.loginAlerts ? 'bg-green-600' : 'bg-gray-300'}`}
        >
          <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${securitySettings.loginAlerts ? 'translate-x-6' : 'translate-x-1'}`}/>
        </button>
      </div>
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
        <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" /> Danger Zone
        </h4>
        <button className="w-full py-2 text-red-600 hover:text-red-700 font-medium flex items-center justify-center gap-2">
          <Trash2 className="w-4 h-4" /> Delete Account
        </button>
      </div>
    </div>
  );

  const renderLanguageSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Language</label>
        <select value={languageSettings.language}
          onChange={(e) => setLanguageSettings({ ...languageSettings, language: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl">
          <option value="en">English</option>
          <option value="fr">Français</option>
          <option value="ar">???????</option>
          <option value="ha">Hausa</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Currency</label>
        <select value={languageSettings.currency}
          onChange={(e) => setLanguageSettings({ ...languageSettings, currency: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl">
          <option value="XAF">XAF (CFA Franc)</option>
        </select>
      </div>
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-3">
          {languageSettings.darkMode ? <Moon className="w-5 h-5 text-gray-600" /> : <Sun className="w-5 h-5 text-gray-600" />}
          <div>
            <p className="font-medium text-gray-900">Dark Mode</p>
            <p className="text-sm text-gray-500">Switch to dark theme</p>
          </div>
        </div>
        <button
          onClick={() => setLanguageSettings({ ...languageSettings, darkMode: !languageSettings.darkMode })}
          className={`w-12 h-7 rounded-full transition-colors ${languageSettings.darkMode ? 'bg-purple-600' : 'bg-gray-300'}`}
        >
          <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${languageSettings.darkMode ? 'translate-x-6' : 'translate-x-1'}`}/>
        </button>
      </div>
    </div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'account': return renderAccountSettings();
      case 'notifications': return renderNotificationSettings();
      case 'privacy': return renderPrivacySettings();
      case 'payment': return renderPaymentSettings();
      case 'security': return renderSecuritySettings();
      case 'language': return renderLanguageSettings();
      default: return renderAccountSettings();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-purple-700 via-pink-600 to-orange-500 text-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/20 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 select-none pointer-events-none">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Store className="w-5 h-5" />
                </div>
                <span className="font-bold">Settings</span>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isSaving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </header>

      {saveSuccess && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg shadow-lg">
          <Check className="w-5 h-5" />
          <span>Settings saved!</span>
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden lg:sticky lg:top-24">
              {settingsSections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${isActive ? 'bg-purple-50 border-l-4 border-purple-600' : 'hover:bg-gray-50'}`}
                  >
                    <div className={`w-8 h-8 ${section.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className={`font-medium ${isActive ? 'text-purple-600' : 'text-gray-700'}`}>
                      {section.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          <main className="flex-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {settingsSections.find(s => s.id === activeSection)?.label}
              </h2>
              {renderSectionContent()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}




