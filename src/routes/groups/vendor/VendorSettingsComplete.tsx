/**
 * ---------------------------------------------------------------------------
 * VENDOR SETTINGS COMPLETE - ENTERPRISE-GRADE SETTINGS PAGE
 * FILE LOCATION: src/pages/vendor/VendorSettingsComplete.tsx
 * � 2025 Bambeh. All rights reserved.
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Settings, User, Bell, Shield, CreditCard, Globe, Store,
  Eye, EyeOff, Save, Lock, Mail, Phone, Camera, Check, ChevronRight,
  Moon, Sun, Smartphone, LogOut, Trash2, AlertTriangle, Download, Upload,
  Clock, MapPin, Building, FileText, Key, Fingerprint, Palette, HelpCircle,
  ChevronDown, BadgeCheck, Database, Share2, Truck, Receipt, Webhook,
  Crown, Coins, Package, BarChart3, Zap, X, Edit2, Plus, Languages,
  CreditCard as CardIcon, Banknote, Wallet, RefreshCw, Copy, ExternalLink
} from 'lucide-react';

import BambehLogo from '@/assets/images/bambeh-logo.png';
import { useLang, t } from "@/hooks/useAppLang";

interface VendorData {
  id: string;
  username: string;
  email: string;
  phone: string;
  businessName: string;
  tier: 'starter' | 'professional' | 'enterprise';
  verificationStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  zermCoins?: number;
}

interface SettingsSection {
  id: string;
  label: string;
  description: string;
  icon: any;
  color: string;
  bgGradient: string;
}

const settingsSections: SettingsSection[] = [
  { id: 'account', label: 'Account', description: 'Profile & Business info', icon: User, color: 'text-blue-500', bgGradient: 'from-blue-500 to-blue-600' },
  { id: 'store', label: 'Store', description: 'Branding & appearance', icon: Store, color: 'text-purple-500', bgGradient: 'from-purple-500 to-purple-600' },
  { id: 'notifications', label: 'Notifications', description: 'Email, push, SMS', icon: Bell, color: 'text-yellow-500', bgGradient: 'from-yellow-500 to-orange-500' },
  { id: 'payment', label: 'Payment', description: 'Mobile money & payouts', icon: CreditCard, color: 'text-green-500', bgGradient: 'from-green-500 to-emerald-500' },
  { id: 'security', label: 'Security', description: 'Password & 2FA', icon: Shield, color: 'text-red-500', bgGradient: 'from-red-500 to-rose-500' },
  { id: 'shipping', label: 'Shipping', description: 'Delivery options', icon: Truck, color: 'text-cyan-500', bgGradient: 'from-cyan-500 to-teal-500' },
  { id: 'business', label: 'Business Hours', description: 'Operating schedule', icon: Clock, color: 'text-orange-500', bgGradient: 'from-orange-500 to-amber-500' },
  { id: 'language', label: 'Language', description: 'Locale & region', icon: Globe, color: 'text-indigo-500', bgGradient: 'from-indigo-500 to-violet-500' },
  { id: 'integrations', label: 'Integrations', description: 'API & webhooks', icon: Webhook, color: 'text-pink-500', bgGradient: 'from-pink-500 to-rose-500' },
  { id: 'data', label: 'Data & Backup', description: 'Export & import', icon: Database, color: 'text-slate-500', bgGradient: 'from-slate-500 to-slate-600' },
];

const businessDays = [
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' },
  { id: 'sunday', label: 'Sunday' },
];

export default function VendorSettingsComplete() {
  const lang = useLang();
  const isRtl = lang === "ar";
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [activeSection, setActiveSection] = useState('account');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const [accountSettings, setAccountSettings] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    businessName: '', businessDescription: '', businessAddress: '',
    businessCategory: 'general', website: '',
    socialFacebook: '', socialInstagram: '', socialTwitter: ''
  });

  const [storeSettings, setStoreSettings] = useState({
    storeName: '', storeSlogan: '', storeLogo: '', storeBanner: '',
    primaryColor: '#14b8a6', accentColor: '#10b981',
    showReviews: true, showSoldCount: true, showRating: true, enableChat: true
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true, pushNotifications: true, smsNotifications: false,
    orderUpdates: true, newMessages: true, newReviews: true,
    marketingEmails: false, weeklyReport: true, priceAlerts: false,
    stockAlerts: true, soundEnabled: true
  });

  const [paymentSettings, setPaymentSettings] = useState({
    mtnMomoNumber: '', orangeMoneyNumber: '',
    bankName: '', bankAccountNumber: '', bankAccountName: '',
    autoWithdraw: false, minimumWithdraw: 5000,
    paymentNotifications: true, defaultPaymentMethod: 'mtn'
  });

  const [securitySettings, setSecuritySettings] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
    twoFactorEnabled: false, twoFactorMethod: 'sms',
    loginAlerts: true, sessionTimeout: 30,
    trustedDevices: true, biometricLogin: false
  });

  const [shippingSettings, setShippingSettings] = useState({
    enableShipping: true, freeShippingThreshold: 50000,
    localDeliveryEnabled: true, localDeliveryFee: 1000, localDeliveryRadius: 10,
    nationalShippingEnabled: true, nationalShippingFee: 2500,
    internationalEnabled: false, processingTime: '1-2', shippingPolicy: ''
  });

  const [businessHours, setBusinessHours] = useState<Record<string, { enabled: boolean; open: string; close: string }>>({
    monday: { enabled: true, open: '08:00', close: '18:00' },
    tuesday: { enabled: true, open: '08:00', close: '18:00' },
    wednesday: { enabled: true, open: '08:00', close: '18:00' },
    thursday: { enabled: true, open: '08:00', close: '18:00' },
    friday: { enabled: true, open: '08:00', close: '18:00' },
    saturday: { enabled: true, open: '09:00', close: '14:00' },
    sunday: { enabled: false, open: '10:00', close: '14:00' },
  });

  const [languageSettings, setLanguageSettings] = useState({
    language: 'en', currency: 'XAF', timezone: 'Africa/Douala',
    dateFormat: 'DD/MM/YYYY', numberFormat: '1,234.56', darkMode: false
  });

  const [integrationSettings, setIntegrationSettings] = useState({
    apiKey: 'bm_live_xxxxxxxxxxxxxxxxxxxx',
    webhookUrl: '', enableWebhooks: false, syncInventory: false
  });

  useEffect(() => {
    const vendorData = localStorage.getItem('Bambeh_vendor');
    const userData = localStorage.getItem('Bambeh_user');

    if (vendorData) {
      const parsed = JSON.parse(vendorData);
      setVendor(parsed);
      setAccountSettings(prev => ({
        ...prev,
        email: parsed.email || '',
        phone: parsed.phone || '',
        businessName: parsed.businessName || '',
        firstName: parsed.firstName || parsed.username || '',
        lastName: parsed.lastName || ''
      }));
    } else if (userData) {
      const user = JSON.parse(userData);
      if (user.isVendor) {
        setVendor({
          id: user.id,
          username: user.name,
          businessName: user.name,
          email: user.email || '',
          phone: user.phone || '',
          tier: user.vendorTier || 'starter',
          zermCoins: user.zermCoins || 0
        });
      } else {
        navigate('/vendor/portal');
      }
    } else {
      navigate('/vendor/portal');
    }
  }, [navigate]);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const updatedVendor = {
      ...vendor,
      ...accountSettings,
      storeSettings,
      notificationSettings,
      paymentSettings,
      shippingSettings,
      businessHours,
      languageSettings,
      integrationSettings
    };
    localStorage.setItem('Bambeh_vendor', JSON.stringify(updatedVendor));
    localStorage.setItem('Bambeh_vendor_settings', JSON.stringify({
      accountSettings, storeSettings, notificationSettings, paymentSettings,
      securitySettings, shippingSettings, businessHours, languageSettings, integrationSettings
    }));

    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('Bambeh_vendor');
    localStorage.removeItem('Bambeh_vendor_token');
    localStorage.removeItem('Bambeh_user');
    navigate('/vendor/portal', { replace: true });
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText === 'DELETE') {
      localStorage.removeItem('Bambeh_vendor');
      localStorage.removeItem('Bambeh_vendor_token');
      localStorage.removeItem('Bambeh_vendor_settings');
      navigate('/vendor/portal', { replace: true });
    }
  };

  const generateApiKey = () => {
    const newKey = 'bm_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setIntegrationSettings({ ...integrationSettings, apiKey: newKey });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-teal-500 mx-auto mb-4"/>
          <p className="text-white/70">Loading settings...</p>
        </div>
      </div>
    );
  }

  // --- Section Renderers ----------------------------------------------------

  const renderAccountSettings = () => (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">First Name</label>
          <input type="text" value={accountSettings.firstName}
            onChange={(e) => setAccountSettings({ ...accountSettings, firstName: e.target.value })}
            placeholder="John"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">Last Name</label>
          <input type="text" value={accountSettings.lastName}
            onChange={(e) => setAccountSettings({ ...accountSettings, lastName: e.target.value })}
            placeholder="Doe"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-white/80 mb-2">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input type="email" value={accountSettings.email}
            onChange={(e) => setAccountSettings({ ...accountSettings, email: e.target.value })}
            placeholder="john@example.com"
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-white/80 mb-2">Phone Number</label>
        <div className="relative">
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input type="tel" value={accountSettings.phone}
            onChange={(e) => setAccountSettings({ ...accountSettings, phone: e.target.value })}
            placeholder="+237 6XX XXX XXX"
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500" />
        </div>
      </div>
      <div className="border-t border-white/10 pt-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Building className="w-5 h-5 text-teal-400" /> Business Information
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Business Name</label>
            <input type="text" value={accountSettings.businessName}
              onChange={(e) => setAccountSettings({ ...accountSettings, businessName: e.target.value })}
              placeholder="My Awesome Store"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Business Category</label>
            <select value={accountSettings.businessCategory}
              onChange={(e) => setAccountSettings({ ...accountSettings, businessCategory: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500">
              <option value="general" className="bg-slate-800">General Merchandise</option>
              <option value="electronics" className="bg-slate-800">Electronics</option>
              <option value="fashion" className="bg-slate-800">Fashion & Apparel</option>
              <option value="food" className="bg-slate-800">Food & Beverages</option>
              <option value="services" className="bg-slate-800">Services</option>
              <option value="real_estate" className="bg-slate-800">Real Estate</option>
              <option value="automotive" className="bg-slate-800">Automotive</option>
              <option value="health" className="bg-slate-800">Health & Beauty</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Business Description</label>
            <textarea value={accountSettings.businessDescription}
              onChange={(e) => setAccountSettings({ ...accountSettings, businessDescription: e.target.value })}
              rows={3} placeholder="Tell customers about your business..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Business Address</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-3 w-5 h-5 text-white/40" />
              <textarea value={accountSettings.businessAddress}
                onChange={(e) => setAccountSettings({ ...accountSettings, businessAddress: e.target.value })}
                rows={2} placeholder="Enter your business address"
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 resize-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStoreSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-white/80 mb-2">Store Name</label>
        <input type="text" value={storeSettings.storeName}
          onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
          placeholder="My Store"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-white/80 mb-2">Store Slogan</label>
        <input type="text" value={storeSettings.storeSlogan}
          onChange={(e) => setStoreSettings({ ...storeSettings, storeSlogan: e.target.value })}
          placeholder="Quality products, best prices"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500" />
      </div>
      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">Primary Color</label>
          <div className="flex gap-3">
            <input type="color" value={storeSettings.primaryColor}
              onChange={(e) => setStoreSettings({ ...storeSettings, primaryColor: e.target.value })}
              className="w-14 h-14 rounded-xl cursor-pointer bg-transparent" />
            <input type="text" value={storeSettings.primaryColor}
              onChange={(e) => setStoreSettings({ ...storeSettings, primaryColor: e.target.value })}
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/50" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">Accent Color</label>
          <div className="flex gap-3">
            <input type="color" value={storeSettings.accentColor}
              onChange={(e) => setStoreSettings({ ...storeSettings, accentColor: e.target.value })}
              className="w-14 h-14 rounded-xl cursor-pointer bg-transparent" />
            <input type="text" value={storeSettings.accentColor}
              onChange={(e) => setStoreSettings({ ...storeSettings, accentColor: e.target.value })}
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/50" />
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 pt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Display Options</h3>
        <div className="space-y-4">
          {[
            { key: 'showReviews', label: 'Show customer reviews', description: 'Display reviews on your product pages' },
            { key: 'showSoldCount', label: 'Show sold count', description: 'Display number of items sold' },
            { key: 'showRating', label: 'Show store rating', description: 'Display your overall store rating' },
            { key: 'enableChat', label: 'Enable live chat', description: 'Allow customers to chat with you' },
          ].map((option) => (
            <div key={option.key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div>
                <p className="text-white font-medium">{option.label}</p>
                <p className="text-sm text-white/60">{option.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox"
                  checked={storeSettings[option.key as keyof typeof storeSettings] as boolean}
                  onChange={(e) => setStoreSettings({ ...storeSettings, [option.key]: e.target.checked })}
                  className="sr-only peer" />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"/>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { key: 'emailNotifications', label: 'Email', icon: Mail, color: 'text-blue-400' },
          { key: 'pushNotifications', label: 'Push', icon: Bell, color: 'text-yellow-400' },
          { key: 'smsNotifications', label: 'SMS', icon: Smartphone, color: 'text-green-400' },
        ].map((channel) => (
          <div key={channel.key}
            onClick={() => setNotificationSettings({ ...notificationSettings, [channel.key]: !notificationSettings[channel.key as keyof typeof notificationSettings] })}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              notificationSettings[channel.key as keyof typeof notificationSettings]
                ? 'border-teal-500 bg-teal-500/10' : 'border-white/10 bg-white/5'
            }`}>
            <channel.icon className={`w-6 h-6 ${channel.color} mb-2`} />
            <p className="text-white font-medium">{channel.label}</p>
            <p className="text-sm text-white/60">
              {notificationSettings[channel.key as keyof typeof notificationSettings] ? 'Enabled' : 'Disabled'}
            </p>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 pt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Notification Types</h3>
        <div className="space-y-3">
          {[
            { key: 'orderUpdates', label: 'Order updates', description: 'New orders, shipping, delivery' },
            { key: 'newMessages', label: 'New messages', description: 'Customer inquiries and chat' },
            { key: 'newReviews', label: 'New reviews', description: 'When customers leave reviews' },
            { key: 'stockAlerts', label: 'Stock alerts', description: 'Low inventory warnings' },
            { key: 'weeklyReport', label: 'Weekly report', description: 'Performance summary' },
            { key: 'marketingEmails', label: 'Marketing emails', description: 'Tips and promotions from Bambeh' },
          ].map((option) => (
            <div key={option.key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div>
                <p className="text-white font-medium">{option.label}</p>
                <p className="text-sm text-white/60">{option.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox"
                  checked={notificationSettings[option.key as keyof typeof notificationSettings] as boolean}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, [option.key]: e.target.checked })}
                  className="sr-only peer" />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"/>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-yellow-400" /> Mobile Money
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">MTN</span>
              </div>
              <div>
                <p className="text-white font-medium">MTN Mobile Money</p>
                <p className="text-sm text-white/60">Receive payments via MTN MoMo</p>
              </div>
            </div>
            <input type="tel" value={paymentSettings.mtnMomoNumber}
              onChange={(e) => setPaymentSettings({ ...paymentSettings, mtnMomoNumber: e.target.value })}
              placeholder="6XX XXX XXX"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-500/50" />
          </div>
          <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xs">Orange</span>
              </div>
              <div>
                <p className="text-white font-medium">Orange Money</p>
                <p className="text-sm text-white/60">Receive payments via Orange Money</p>
              </div>
            </div>
            <input type="tel" value={paymentSettings.orangeMoneyNumber}
              onChange={(e) => setPaymentSettings({ ...paymentSettings, orangeMoneyNumber: e.target.value })}
              placeholder="6XX XXX XXX"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 pt-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Banknote className="w-5 h-5 text-green-400" /> Bank Account (Optional)
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Bank Name</label>
            <input type="text" value={paymentSettings.bankName}
              onChange={(e) => setPaymentSettings({ ...paymentSettings, bankName: e.target.value })}
              placeholder="e.g., UBA, Ecobank, BICEC"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500/50" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Account Number</label>
              <input type="text" value={paymentSettings.bankAccountNumber}
                onChange={(e) => setPaymentSettings({ ...paymentSettings, bankAccountNumber: e.target.value })}
                placeholder="XXXX XXXX XXXX"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Account Name</label>
              <input type="text" value={paymentSettings.bankAccountName}
                onChange={(e) => setPaymentSettings({ ...paymentSettings, bankAccountName: e.target.value })}
                placeholder="Account holder name"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500/50" />
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 pt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Payout Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div>
              <p className="text-white font-medium">Auto-withdraw</p>
              <p className="text-sm text-white/60">Automatically withdraw earnings weekly</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={paymentSettings.autoWithdraw}
                onChange={(e) => setPaymentSettings({ ...paymentSettings, autoWithdraw: e.target.checked })}
                className="sr-only peer" />
              <div className="w-11 h-6 bg-white/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"/>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Minimum Withdrawal (XAF)</label>
            <input type="number" value={paymentSettings.minimumWithdraw}
              onChange={(e) => setPaymentSettings({ ...paymentSettings, minimumWithdraw: parseInt(e.target.value) })}
              min="1000" step="1000"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-red-400" /> Change Password
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Current Password</label>
            <input type="password" value={securitySettings.currentPassword}
              onChange={(e) => setSecuritySettings({ ...securitySettings, currentPassword: e.target.value })}
              placeholder="��������"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500/50" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">New Password</label>
              <input type="password" value={securitySettings.newPassword}
                onChange={(e) => setSecuritySettings({ ...securitySettings, newPassword: e.target.value })}
                placeholder="��������"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Confirm Password</label>
              <input type="password" value={securitySettings.confirmPassword}
                onChange={(e) => setSecuritySettings({ ...securitySettings, confirmPassword: e.target.value })}
                placeholder="��������"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500/50" />
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 pt-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-400" /> Two-Factor Authentication
        </h3>
        <div className="p-4 bg-white/5 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white font-medium">Enable 2FA</p>
              <p className="text-sm text-white/60">Add extra security to your account</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={securitySettings.twoFactorEnabled}
                onChange={(e) => setSecuritySettings({ ...securitySettings, twoFactorEnabled: e.target.checked })}
                className="sr-only peer" />
              <div className="w-11 h-6 bg-white/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"/>
            </label>
          </div>
          {securitySettings.twoFactorEnabled && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <label className="block text-sm font-medium text-white/80 mb-2">Verification Method</label>
              <div className="flex gap-3">
                {['sms', 'email', 'app'].map((method) => (
                  <button key={method}
                    onClick={() => setSecuritySettings({ ...securitySettings, twoFactorMethod: method })}
                    className={`px-4 py-2 rounded-lg capitalize transition-all ${
                      securitySettings.twoFactorMethod === method
                        ? 'bg-teal-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}>
                    {method}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="border-t border-white/10 pt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Security Options</h3>
        <div className="space-y-3">
          {[
            { key: 'loginAlerts', label: 'Login alerts', description: 'Get notified of new login attempts' },
            { key: 'trustedDevices', label: 'Remember trusted devices', description: 'Skip verification on known devices' },
            { key: 'biometricLogin', label: 'Biometric login', description: 'Use fingerprint or face recognition' },
          ].map((option) => (
            <div key={option.key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div>
                <p className="text-white font-medium">{option.label}</p>
                <p className="text-sm text-white/60">{option.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox"
                  checked={securitySettings[option.key as keyof typeof securitySettings] as boolean}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, [option.key]: e.target.checked })}
                  className="sr-only peer" />
                <div className="w-11 h-6 bg-white/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"/>
              </label>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-red-500/30 pt-6">
        <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" /> Danger Zone
        </h3>
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-white font-medium mb-2">Delete Account</p>
          <p className="text-sm text-white/60 mb-4">
            Permanently delete your vendor account and all associated data. This action cannot be undone.
          </p>
          <button onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2">
            <Trash2 className="w-4 h-4" /> Delete Account
          </button>
        </div>
      </div>
    </div>
  );

  const renderShippingSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
        <div>
          <p className="text-white font-medium">Enable Shipping</p>
          <p className="text-sm text-white/60">Offer shipping to customers</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" checked={shippingSettings.enableShipping}
            onChange={(e) => setShippingSettings({ ...shippingSettings, enableShipping: e.target.checked })}
            className="sr-only peer" />
          <div className="w-11 h-6 bg-white/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"/>
        </label>
      </div>
      {shippingSettings.enableShipping && (
        <>
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Local Delivery</p>
                  <p className="text-sm text-white/60">Deliver within your city</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={shippingSettings.localDeliveryEnabled}
                  onChange={(e) => setShippingSettings({ ...shippingSettings, localDeliveryEnabled: e.target.checked })}
                  className="sr-only peer" />
                <div className="w-11 h-6 bg-white/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"/>
              </label>
            </div>
            {shippingSettings.localDeliveryEnabled && (
              <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div>
                  <label className="block text-sm text-white/70 mb-2">Delivery Fee (XAF)</label>
                  <input type="number" value={shippingSettings.localDeliveryFee}
                    onChange={(e) => setShippingSettings({ ...shippingSettings, localDeliveryFee: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50" />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-2">Delivery Radius (km)</label>
                  <input type="number" value={shippingSettings.localDeliveryRadius}
                    onChange={(e) => setShippingSettings({ ...shippingSettings, localDeliveryRadius: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50" />
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Free Shipping Threshold (XAF)</label>
            <p className="text-sm text-white/60 mb-2">Orders above this amount get free shipping. Set to 0 to disable.</p>
            <input type="number" value={shippingSettings.freeShippingThreshold}
              onChange={(e) => setShippingSettings({ ...shippingSettings, freeShippingThreshold: parseInt(e.target.value) })}
              placeholder="50000"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Processing Time</label>
            <select value={shippingSettings.processingTime}
              onChange={(e) => setShippingSettings({ ...shippingSettings, processingTime: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50">
              <option value="same-day" className="bg-slate-800">Same day</option>
              <option value="1-2" className="bg-slate-800">1-2 business days</option>
              <option value="3-5" className="bg-slate-800">3-5 business days</option>
              <option value="1-week" className="bg-slate-800">1 week</option>
            </select>
          </div>
        </>
      )}
    </div>
  );

  const renderBusinessHours = () => (
    <div className="space-y-4">
      <p className="text-white/60 text-sm">Set your operating hours. Customers will see when you're available.</p>
      {businessDays.map((day) => (
        <div key={day.id} className="p-4 bg-white/5 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox"
                  checked={businessHours[day.id].enabled}
                  onChange={(e) => setBusinessHours({
                    ...businessHours,
                    [day.id]: { ...businessHours[day.id], enabled: e.target.checked }
                  })}
                  className="sr-only peer" />
                <div className="w-11 h-6 bg-white/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"/>
              </label>
              <span className={`font-medium ${businessHours[day.id].enabled ? 'text-white' : 'text-white/50'}`}>
                {day.label}
              </span>
            </div>
            {businessHours[day.id].enabled && (
              <div className="flex items-center gap-2">
                <input type="time" value={businessHours[day.id].open}
                  onChange={(e) => setBusinessHours({ ...businessHours, [day.id]: { ...businessHours[day.id], open: e.target.value } })}
                  className="px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50" />
                <span className="text-white/50">to</span>
                <input type="time" value={businessHours[day.id].close}
                  onChange={(e) => setBusinessHours({ ...businessHours, [day.id]: { ...businessHours[day.id], close: e.target.value } })}
                  className="px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50" />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderLanguageSettings = () => (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-6">
        {[
          { label: 'Language', key: 'language', options: [['en','English'],['fr','Fran�ais'],['ar','???????'],['ha','Hausa']] },
          { label: 'Currency', key: 'currency', options: [['XAF','XAF (CFA Franc)'],['USD','USD (US Dollar)'],['EUR','EUR (Euro)'],['NGN','NGN (Naira)']] },
          { label: 'Timezone', key: 'timezone', options: [['Africa/Douala','Africa/Douala (GMT+1)'],['Africa/Lagos','Africa/Lagos (GMT+1)'],['Europe/Paris','Europe/Paris'],['UTC','UTC']] },
          { label: 'Date Format', key: 'dateFormat', options: [['DD/MM/YYYY','DD/MM/YYYY'],['MM/DD/YYYY','MM/DD/YYYY'],['YYYY-MM-DD','YYYY-MM-DD']] },
        ].map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-white/80 mb-2">{field.label}</label>
            <select value={languageSettings[field.key as keyof typeof languageSettings] as string}
              onChange={(e) => setLanguageSettings({ ...languageSettings, [field.key]: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50">
              {field.options.map(([val, label]) => (
                <option key={val} value={val} className="bg-slate-800">{label}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 pt-6">
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center">
              {languageSettings.darkMode ? <Moon className="w-6 h-6 text-yellow-400" /> : <Sun className="w-6 h-6 text-yellow-500" />}
            </div>
            <div>
              <p className="text-white font-medium">Dark Mode</p>
              <p className="text-sm text-white/60">Switch between light and dark themes</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={languageSettings.darkMode}
              onChange={(e) => setLanguageSettings({ ...languageSettings, darkMode: e.target.checked })}
              className="sr-only peer" />
            <div className="w-11 h-6 bg-white/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-600"/>
          </label>
        </div>
      </div>
    </div>
  );

  const renderIntegrationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-yellow-400" /> API Key
        </h3>
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
          <p className="text-sm text-white/60 mb-3">Use this key to integrate with external services.</p>
          <div className="flex gap-2">
            <input type="text" value={integrationSettings.apiKey} readOnly
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm focus:outline-none" />
            <button onClick={() => copyToClipboard(integrationSettings.apiKey)}
              className="px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors">
              <Copy className="w-5 h-5" />
            </button>
            <button onClick={generateApiKey}
              className="px-4 py-3 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors flex items-center gap-2">
              <RefreshCw className="w-5 h-5" /> Regenerate
            </button>
          </div>
          <p className="text-xs text-red-400 mt-2">?? Regenerating will invalidate your current key.</p>
        </div>
      </div>
      <div className="border-t border-white/10 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Webhook className="w-5 h-5 text-pink-400" /> Webhooks
          </h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={integrationSettings.enableWebhooks}
              onChange={(e) => setIntegrationSettings({ ...integrationSettings, enableWebhooks: e.target.checked })}
              className="sr-only peer" />
            <div className="w-11 h-6 bg-white/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"/>
          </label>
        </div>
        {integrationSettings.enableWebhooks && (
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Webhook URL</label>
            <input type="url" value={integrationSettings.webhookUrl}
              onChange={(e) => setIntegrationSettings({ ...integrationSettings, webhookUrl: e.target.value })}
              placeholder="https://your-server.com/webhook"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500/50" />
          </div>
        )}
      </div>
    </div>
  );

  const renderDataSettings = () => (
    <div className="space-y-6">
      <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center">
            <Download className="w-7 h-7 text-blue-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Export All Data</h3>
            <p className="text-sm text-white/60">Download all your vendor data as a ZIP file</p>
          </div>
        </div>
        <button className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
          <Download className="w-5 h-5" /> Export Data
        </button>
      </div>
      <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center">
            <Upload className="w-7 h-7 text-white/60" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Import Settings</h3>
            <p className="text-sm text-white/60">Restore settings from a backup file</p>
          </div>
        </div>
        <button className="w-full py-3 border border-white/20 text-white rounded-xl font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
          <Upload className="w-5 h-5" /> Import Backup
        </button>
      </div>
      <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-xl">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center">
            <Share2 className="w-7 h-7 text-green-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Share Profile</h3>
            <p className="text-sm text-white/60">Generate a shareable link to your store</p>
          </div>
        </div>
        <button className="w-full py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
          <Share2 className="w-5 h-5" /> Generate Link
        </button>
      </div>
    </div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'account': return renderAccountSettings();
      case 'store': return renderStoreSettings();
      case 'notifications': return renderNotificationSettings();
      case 'payment': return renderPaymentSettings();
      case 'security': return renderSecuritySettings();
      case 'shipping': return renderShippingSettings();
      case 'business': return renderBusinessHours();
      case 'language': return renderLanguageSettings();
      case 'integrations': return renderIntegrationSettings();
      case 'data': return renderDataSettings();
      default: return renderAccountSettings();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/vendor/home')}
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <Link to="/vendor/home" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                <img src={BambehLogo} alt="Bambeh"
                  className="w-10 h-10 rounded-xl object-cover shadow-md"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40x40/14b8a6/ffffff?text=B'; }} />
                <div>
                  <h1 className="font-bold text-lg text-white">Settings</h1>
                  <p className="text-xs text-white/60">Vendor Portal</p>
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/vendor/subscription"
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all">
                <Crown className="w-4 h-4" /> <span>Upgrade</span>
              </Link>
              <Link to="/help" className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                <HelpCircle className="w-5 h-5 text-white" />
              </Link>
              <button onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {saveSuccess && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg shadow-lg">
          <Check className="w-5 h-5" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-white">Delete Account</h3>
                <p className="text-sm text-white/60">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-white/80 mb-4">Type <span className="font-mono text-red-400">DELETE</span> to confirm:</p>
            <input type="text" value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white mb-4 focus:outline-none focus:ring-2 focus:ring-red-500/50" />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}
                className="flex-1 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors">
                Cancel
              </button>
              <button onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE'}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium disabled:opacity-50 hover:bg-red-600 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-80 flex-shrink-0">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden lg:sticky lg:top-24">
              {settingsSections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button key={section.id} onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-4 text-left transition-all border-l-4 ${
                      isActive ? 'bg-white/10 border-teal-500' : 'border-transparent hover:bg-white/5'
                    }`}>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${section.bgGradient} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`font-medium block ${isActive ? 'text-teal-400' : 'text-white'}`}>{section.label}</span>
                      <span className="text-xs text-white/50 truncate block">{section.description}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-white/30'}`} />
                  </button>
                );
              })}
            </div>
          </aside>

          <main className="flex-1">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {settingsSections.find(s => s.id === activeSection)?.label}
                  </h2>
                  <p className="text-white/50 text-sm">
                    {settingsSections.find(s => s.id === activeSection)?.description}
                  </p>
                </div>
              </div>

              {renderSectionContent()}

              <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
                <button onClick={handleSave} disabled={isSaving}
                  className="px-8 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-teal-500/25 disabled:opacity-50 flex items-center gap-2 transition-all">
                  {isSaving ? (
                    <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Saving...</>
                  ) : (
                    <><Save className="w-5 h-5" />Save Changes</>
                  )}
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}





