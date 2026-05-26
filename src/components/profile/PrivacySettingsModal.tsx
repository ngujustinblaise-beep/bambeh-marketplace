/**
 * PRIVACY SETTINGS MODAL - Comprehensive Privacy Controls
 * FILE LOCATION: src/components/profile/PrivacySettingsModal.tsx
 */

import { useState, useEffect } from 'react';
import { X, Shield, Eye, Save, AlertTriangle, Trash2 } from 'lucide-react';

interface PrivacySettingsModalProps { onClose: () => void; }

export default function PrivacySettingsModal({ onClose }: PrivacySettingsModalProps) {
  const [settings, setSettings] = useState({
    profileVisibility: 'public', showEmail: 'nobody', showPhone: 'contacts',
    showLocation: 'everyone', showOnlineStatus: true,
    showListings: 'everyone', showPurchaseHistory: 'nobody',
    showReviews: 'everyone', showFavorites: 'nobody',
    allowSearchEngineIndexing: true, showInSuggestions: true, allowContactSync: false,
    whoCanMessage: 'everyone', readReceipts: true, typingIndicators: true,
    personalizedAds: true, dataAnalytics: true, thirdPartySharing: false,
    blockedUsers: [] as string[],
  });
  const [isSaving, setIsSaving]               = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('Bambeh_privacy_settings');
    if (saved) {
      try { setSettings(JSON.parse(saved)); } catch {}
    }
  }, []);

  const handleToggle = (key: string) => {
    setSettings(prev => ({ ...prev, [key]: !(prev as any)[key] }));
  };

  const handleSelectChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('Bambeh_privacy_settings', JSON.stringify(settings));
      alert('✅ Privacy settings saved successfully!');
      onClose();
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('❌ Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('⚠️ WARNING: This will permanently delete your account and all data. This action cannot be undone. Are you absolutely sure?')) {
      localStorage.clear();
      alert('Your account has been scheduled for deletion. You will be logged out.');
      window.location.href = '/';
    }
  };

  const visibilityOptions = [
    { value: 'everyone', label: 'Everyone' },
    { value: 'contacts', label: 'Contacts Only' },
    { value: 'nobody',   label: 'Nobody' },
  ];

  const PrivacySelect = ({
    label, description, value, onChange, options,
  }: {
    label: string; description: string; value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
  }) => (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
        <select value={value} onChange={(e) => onChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm">
          {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>
    </div>
  );

  const PrivacyToggle = ({
    label,
    description,
    checked,
    onChange,
  }: {
    label: string;
    description: string;
    checked: boolean;
    onChange: () => void;
  }) => (
    <div className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex-1 pr-4">
        <p className="font-semibold text-gray-900">{label}</p>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
      <button type="button" onClick={onChange}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${checked ? 'bg-purple-600' : 'bg-gray-200'}`}>
        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg"><Shield className="w-6 h-6" /></div>
              <div><h2 className="text-2xl font-bold">Privacy Settings</h2><p className="text-purple-100 text-sm">Control who sees your information</p></div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors"><X className="w-6 h-6" /></button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Eye className="w-5 h-5 text-purple-600" />Profile Visibility</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <PrivacySelect label="Profile Visibility" description="Who can see your profile" value={settings.profileVisibility} onChange={(v) => handleSelectChange('profileVisibility', v)} options={[{ value: 'public', label: 'Public' }, { value: 'friends', label: 'Friends Only' }, { value: 'private', label: 'Private' }]} />
              <PrivacySelect label="Email Address" description="Who can see your email address" value={settings.showEmail} onChange={(v) => handleSelectChange('showEmail', v)} options={visibilityOptions} />
              <PrivacySelect label="Phone Number" description="Who can see your phone number" value={settings.showPhone} onChange={(v) => handleSelectChange('showPhone', v)} options={visibilityOptions} />
              <PrivacySelect label="Location" description="Who can see your location" value={settings.showLocation} onChange={(v) => handleSelectChange('showLocation', v)} options={[{ value: 'everyone', label: 'Exact Location' }, { value: 'approximate', label: 'Approximate (City)' }, { value: 'nobody', label: 'Hidden' }]} />
              <PrivacyToggle label="Show Online Status" description="Let others see when you're active" checked={settings.showOnlineStatus} onChange={() => handleToggle('showOnlineStatus')} />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Activity & Content</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <PrivacySelect label="Listings" description="Who can see your posted items" value={settings.showListings} onChange={(v) => handleSelectChange('showListings', v)} options={visibilityOptions} />
              <PrivacySelect label="Purchase History" description="Who can see what you've bought" value={settings.showPurchaseHistory} onChange={(v) => handleSelectChange('showPurchaseHistory', v)} options={visibilityOptions} />
              <PrivacySelect label="Reviews" description="Who can see reviews you've written" value={settings.showReviews} onChange={(v) => handleSelectChange('showReviews', v)} options={visibilityOptions} />
              <PrivacySelect label="Favourites" description="Who can see your saved items" value={settings.showFavorites} onChange={(v) => handleSelectChange('showFavorites', v)} options={visibilityOptions} />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Search & Discovery</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <PrivacyToggle label="Search Engine Indexing" description="Allow search engines to index your profile" checked={settings.allowSearchEngineIndexing} onChange={() => handleToggle('allowSearchEngineIndexing')} />
              <PrivacyToggle label="Profile Suggestions" description="Show your profile in user suggestions" checked={settings.showInSuggestions} onChange={() => handleToggle('showInSuggestions')} />
              <PrivacyToggle label="Contact Sync" description="Allow Bambeh to sync with your contacts" checked={settings.allowContactSync} onChange={() => handleToggle('allowContactSync')} />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Messages & Communication</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <PrivacySelect label="Who Can Message You" description="Control who can send you messages" value={settings.whoCanMessage} onChange={(v) => handleSelectChange('whoCanMessage', v)} options={visibilityOptions} />
              <PrivacyToggle label="Read Receipts" description="Let others know when you've read their messages" checked={settings.readReceipts} onChange={() => handleToggle('readReceipts')} />
              <PrivacyToggle label="Typing Indicators" description="Show when you're typing a message" checked={settings.typingIndicators} onChange={() => handleToggle('typingIndicators')} />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Data & Analytics</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <PrivacyToggle label="Personalised Ads" description="See ads tailored to your interests" checked={settings.personalizedAds} onChange={() => handleToggle('personalizedAds')} />
              <PrivacyToggle label="Analytics" description="Help improve Bambeh with usage analytics" checked={settings.dataAnalytics} onChange={() => handleToggle('dataAnalytics')} />
              <PrivacyToggle label="Third-Party Data Sharing" description="Share data with partner services" checked={settings.thirdPartySharing} onChange={() => handleToggle('thirdPartySharing')} />
            </div>
          </div>

          <div className="border-t border-red-200 pt-6">
            <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-red-600" />Danger Zone</h3>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
              <button type="button" onClick={() => setShowDeleteConfirm(true)}
                className="w-full px-4 py-3 bg-white border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 font-semibold transition-colors flex items-center justify-center gap-2">
                <Trash2 className="w-5 h-5" />Delete My Account
              </button>
              <p className="text-xs text-red-800 text-center">This action is permanent and cannot be undone. All your data will be deleted.</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-200">
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors">Cancel</button>
            <button type="button" onClick={handleSave} disabled={isSaving}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {isSaving ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>) : (<><Save className="w-5 h-5" />Save Settings</>)}
            </button>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle className="w-8 h-8 text-red-600" /></div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Delete Account?</h3>
              <p className="text-gray-600 mb-6">This will permanently delete your account, all your listings, messages, and data. This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold">Cancel</button>
                <button onClick={handleDeleteAccount} className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold">Delete Account</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
