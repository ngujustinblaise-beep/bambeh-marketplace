/**
 * ---------------------------------------------------------------------------
 * VENDOR SETTINGS ENHANCED - COMPREHENSIVE SETTINGS PAGE
 * FILE LOCATION: src/pages/vendor/VendorSettingsEnhanced.tsx
 * ? 2025 Bambeh. All rights reserved.
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Settings, ArrowLeft, User, Lock, Bell, CreditCard, Shield, Globe,
  Store, Camera, Save, Eye, EyeOff, Check, X, ChevronRight, Mail,
  Phone, MapPin, Building, FileText, AlertTriangle, Clock, LogOut,
  Smartphone, Key, History, Languages, DollarSign, Palette, Volume2,
  Moon, Sun, Trash2, Download, Upload, HelpCircle, ExternalLink
} from 'lucide-react';

import BambehLogo from '@/assets/images/bambeh-logo.png';
import { useLang, t } from "@/hooks/useAppLang";

interface VendorData {
  id: string;
  username: string;
  businessName: string;
  email: string;
  phone: string;
  tier: 'basic' | 'premium' | 'gold';
  verificationStatus?: string;
}

interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
}

const settingsSections: SettingsSection[] = [
  { id: 'account', title: 'Account Settings', description: 'Manage your profile and login credentials', icon: User, color: 'text-blue-600 bg-blue-100' },
  { id: 'store', title: 'Store Settings', description: 'Customize your store appearance and info', icon: Store, color: 'text-purple-600 bg-purple-100' },
  { id: 'notifications', title: 'Notifications', description: 'Control how you receive updates', icon: Bell, color: 'text-orange-600 bg-orange-100' },
  { id: 'payment', title: 'Payment Settings', description: 'Manage payment methods and payouts', icon: CreditCard, color: 'text-green-600 bg-green-100' },
  { id: 'security', title: 'Security', description: 'Protect your account with 2FA and more', icon: Shield, color: 'text-red-600 bg-red-100' },
  { id: 'language', title: 'Language & Region', description: 'Set your preferred language and timezone', icon: Globe, color: 'text-teal-600 bg-teal-100' },
];

export default function VendorSettingsEnhanced() {
  const lang = useLang();
  const isRtl = lang === "ar";
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [activeSection, setActiveSection] = useState('account');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [formData, setFormData] = useState({
    username: '', email: '', phone: '',
    currentPassword: '', newPassword: '', confirmPassword: '',
    businessName: '', businessDescription: '', businessAddress: '',
    businessCategory: 'general',
    emailNotifications: true, pushNotifications: true, smsNotifications: false,
    orderAlerts: true, messageAlerts: true, promotionAlerts: false, reviewAlerts: true,
    paymentMethod: 'mobile_money', mobileMoneyNumber: '',
    bankName: '', bankAccountNumber: '',
    twoFactorEnabled: false, loginAlerts: true,
    language: 'en', timezone: 'Africa/Douala', currency: 'XAF', darkMode: false,
  });

  useEffect(() => {
    const vendorData = localStorage.getItem('Bambeh_vendor');
    const userData = localStorage.getItem('Bambeh_user');

    if (vendorData) {
      const parsed = JSON.parse(vendorData);
      setVendor(parsed);
      setFormData(prev => ({
        ...prev,
        username: parsed.username || '',
        email: parsed.email || '',
        phone: parsed.phone || '',
        businessName: parsed.businessName || '',
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
          tier: user.vendorTier || 'basic',
        });
        setFormData(prev => ({
          ...prev,
          username: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          businessName: user.name || '',
        }));
      } else {
        navigate('/vendor/portal');
      }
    } else {
      navigate('/vendor/portal');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('Bambeh_vendor');
    localStorage.removeItem('Bambeh_vendor_token');
    localStorage.removeItem('Bambeh_user');
    navigate('/vendor/portal', { replace: true });
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (vendor) {
      const updatedVendor = {
        ...vendor,
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        businessName: formData.businessName,
      };
      localStorage.setItem('Bambeh_vendor', JSON.stringify(updatedVendor));
      setVendor(updatedVendor);
    }

    setSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto mb-4"/>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'account':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900">Account Information</h3>

            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {formData.username.charAt(0).toUpperCase()}
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-purple-700">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div>
                <p className="font-medium text-gray-900">{formData.username}</p>
                <p className="text-sm text-gray-500">Vendor ID: {vendor.id}</p>
              </div>
            </div>

            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input type="text" value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input type="email" value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="tel" value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+237 6XX XXX XXX"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
            </div>

            <div className="pt-6 border-t">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Change Password</h4>
              <div className="grid gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-9 text-gray-500">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input type="password" value={formData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input type="password" value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                </div>
              </div>
            </div>
          </div>
        );

      case 'store':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900">Store Information</h3>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-3xl font-bold">
                {formData.businessName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-900">Store Logo</p>
                <p className="text-sm text-gray-500 mb-2">Upload a logo for your store (PNG, JPG up to 5MB)</p>
                <button className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 flex items-center gap-2">
                  <Upload className="w-4 h-4" /> Upload Logo
                </button>
              </div>
            </div>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                <input type="text" value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Description</label>
                <textarea value={formData.businessDescription}
                  onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Describe your business..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Address</label>
                <input type="text" value={formData.businessAddress}
                  onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                  placeholder="Enter your business address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Category</label>
                <select value={formData.businessCategory}
                  onChange={(e) => handleInputChange('businessCategory', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                  <option value="general">General</option>
                  <option value="electronics">Electronics</option>
                  <option value="fashion">Fashion & Apparel</option>
                  <option value="food">Food & Beverages</option>
                  <option value="services">Services</option>
                  <option value="vehicles">Vehicles</option>
                  <option value="real_estate">Real Estate</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900">Notification Preferences</h3>
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-700">Notification Channels</h4>
              {[
                { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email', icon: Mail },
                { key: 'pushNotifications', label: 'Push Notifications', desc: 'Receive notifications on your device', icon: Smartphone },
                { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Receive notifications via SMS', icon: Phone },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox"
                      checked={formData[item.key as keyof typeof formData] as boolean}
                      onChange={(e) => handleInputChange(item.key, e.target.checked)}
                      className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"/>
                  </label>
                </div>
              ))}
            </div>
            <div className="space-y-4 pt-4 border-t">
              <h4 className="text-md font-semibold text-gray-700">Alert Types</h4>
              {[
                { key: 'orderAlerts', label: 'Order Alerts', desc: 'New orders, cancellations, returns' },
                { key: 'messageAlerts', label: 'Message Alerts', desc: 'New messages from customers' },
                { key: 'reviewAlerts', label: 'Review Alerts', desc: 'New reviews and ratings' },
                { key: 'promotionAlerts', label: 'Promotion Alerts', desc: 'Marketing tips and promotions' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{item.label}</p>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox"
                      checked={formData[item.key as keyof typeof formData] as boolean}
                      onChange={(e) => handleInputChange(item.key, e.target.checked)}
                      className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"/>
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900">Payment Settings</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Preferred Payout Method</label>
              <div className="grid gap-3">
                {[
                  { value: 'mobile_money', label: 'Mobile Money', desc: 'MTN MoMo, Orange Money', icon: Smartphone },
                  { value: 'bank_transfer', label: 'Bank Transfer', desc: 'Direct bank deposit', icon: Building },
                ].map((option) => (
                  <label key={option.value}
                    className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.paymentMethod === option.value ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="paymentMethod" value={option.value}
                      checked={formData.paymentMethod === option.value}
                      onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                      className="sr-only" />
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${formData.paymentMethod === option.value ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                      <option.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{option.label}</p>
                      <p className="text-sm text-gray-500">{option.desc}</p>
                    </div>
                    {formData.paymentMethod === option.value && <Check className="w-6 h-6 text-purple-500" />}
                  </label>
                ))}
              </div>
            </div>
            {formData.paymentMethod === 'mobile_money' && (
              <div className="p-4 bg-yellow-50 rounded-xl">
                <h4 className="font-medium text-gray-900 mb-3">Mobile Money Details</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Money Number</label>
                  <input type="tel" value={formData.mobileMoneyNumber}
                    onChange={(e) => handleInputChange('mobileMoneyNumber', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="+237 6XX XXX XXX" />
                </div>
              </div>
            )}
            {formData.paymentMethod === 'bank_transfer' && (
              <div className="p-4 bg-blue-50 rounded-xl space-y-4">
                <h4 className="font-medium text-gray-900">Bank Account Details</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                  <input type="text" value={formData.bankName}
                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                  <input type="text" value={formData.bankAccountNumber}
                    onChange={(e) => handleInputChange('bankAccountNumber', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                </div>
              </div>
            )}
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900">Security Settings</h3>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Key className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={formData.twoFactorEnabled}
                    onChange={(e) => handleInputChange('twoFactorEnabled', e.target.checked)}
                    className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"/>
                </label>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Login Alerts</p>
                    <p className="text-sm text-gray-500">Get notified of new login attempts</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={formData.loginAlerts}
                    onChange={(e) => handleInputChange('loginAlerts', e.target.checked)}
                    className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"/>
                </label>
              </div>
            </div>
            <div className="pt-4 border-t">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <History className="w-5 h-5" /> Recent Login Activity
              </h4>
              <div className="space-y-3">
                {[
                  { device: 'Chrome on Windows', location: 'Yaound?, CM', time: 'Now (Current session)', current: true },
                  { device: 'Mobile App on Android', location: 'Douala, CM', time: '2 hours ago', current: false },
                  { device: 'Safari on iPhone', location: 'Bamenda, CM', time: 'Yesterday', current: false },
                ].map((session, index) => (
                  <div key={index} className={`p-3 rounded-lg ${session.current ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 flex items-center gap-2">
                          {session.device}
                          {session.current && <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">Current</span>}
                        </p>
                        <p className="text-sm text-gray-500">{session.location} ? {session.time}</p>
                      </div>
                      {!session.current && (
                        <button className="text-red-500 text-sm hover:text-red-700">End session</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t border-red-200">
              <h4 className="font-medium text-red-600 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Danger Zone
              </h4>
              <div className="space-y-3">
                <button className="w-full p-3 border border-red-200 rounded-lg text-red-600 hover:bg-red-50 flex items-center justify-between">
                  <span className="flex items-center gap-2"><Download className="w-5 h-5" />Download My Data</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button className="w-full p-3 border border-red-300 rounded-lg text-red-600 hover:bg-red-50 flex items-center justify-between">
                  <span className="flex items-center gap-2"><Trash2 className="w-5 h-5" />Delete Account</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        );

      case 'language':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900">Language & Regional Settings</h3>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                <select value={formData.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                  <option value="en">English</option>
                  <option value="fr">Fran?ais</option>
                  <option value="ar">???????</option>
                  <option value="ha">Hausa</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                <select value={formData.timezone}
                  onChange={(e) => handleInputChange('timezone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                  <option value="Africa/Douala">Africa/Douala (GMT+1)</option>
                  <option value="Africa/Lagos">Africa/Lagos (GMT+1)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                  <option value="XAF">XAF (CFA Franc)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                </select>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                    {formData.darkMode ? <Moon className="w-6 h-6 text-yellow-400" /> : <Sun className="w-6 h-6 text-yellow-500" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Dark Mode</p>
                    <p className="text-sm text-gray-500">Switch between light and dark themes</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={formData.darkMode}
                    onChange={(e) => handleInputChange('darkMode', e.target.checked)}
                    className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-800"/>
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-purple-700 via-pink-600 to-orange-500 text-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <img src={BambehLogo} alt="Bambeh"
                  className="w-10 h-10 rounded-xl object-cover shadow-md"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                <div>
                  <h1 className="font-bold text-lg">Settings</h1>
                  <p className="text-xs text-white/70">Vendor Portal</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/help" className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <HelpCircle className="w-5 h-5" />
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-4 sticky top-24">
              <h2 className="font-bold text-gray-900 mb-4 px-2">Settings</h2>
              <nav className="space-y-1">
                {settingsSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${
                        activeSection === section.id ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        activeSection === section.id ? 'bg-purple-500 text-white' : section.color
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{section.title}</p>
                        <p className="text-xs text-gray-500 truncate">{section.description}</p>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              {renderSectionContent()}
              <div className="mt-8 pt-6 border-t flex items-center justify-between">
                <div>
                  {saveSuccess && (
                    <div className="flex items-center gap-2 text-green-600">
                      <Check className="w-5 h-5" />
                      <span>Settings saved successfully!</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 flex items-center gap-2 shadow-lg"
                >
                  {saving ? (
                    <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"/>Saving...</>
                  ) : (
                    <><Save className="w-5 h-5" />Save Changes</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}





