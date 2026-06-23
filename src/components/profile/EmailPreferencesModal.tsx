/**
 * EMAIL PREFERENCES MODAL - Notification Management
 * FILE LOCATION: src/components/profile/EmailPreferencesModal.tsx
 */

import { useState, useEffect } from 'react';
import { X, Mail, Bell, Save, Info } from 'lucide-react';

interface EmailPreferencesModalProps { onClose: () => void; }

export default function EmailPreferencesModal({ onClose }: EmailPreferencesModalProps) {
  const [preferences, setPreferences] = useState({
    marketingEmails: true, weeklyDeals: true, newFeatures: true, specialOffers: true,
    orderConfirmations: true, paymentReceipts: true, deliveryUpdates: true,
    accountChanges: true, securityAlerts: true, newMessages: true, offerReceived: true,
    itemSold: true, itemExpiring: true, priceDrops: true, followersUpdates: false,
    reviewRequests: true, communityNews: false, digestFrequency: 'daily',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('Bambeh_email_preferences');
    if (saved) {
      try { setPreferences(JSON.parse(saved)); } catch {}
    }
  }, []);

  const handleToggle = (key: string) => {
    setPreferences(prev => ({ ...prev, [key]: !(prev as any)[key] }));
  };

  const handleFrequencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPreferences(prev => ({ ...prev, digestFrequency: e.target.value }));
  };

  const handleUnsubscribeAll = () => {
    if (window.confirm('Are you sure you want to unsubscribe from all emails? You will still receive critical account and security notifications.')) {
      setPreferences(prev => ({
        ...prev, marketingEmails: false, weeklyDeals: false, newFeatures: false,
        specialOffers: false, followersUpdates: false, communityNews: false,
        priceDrops: false, reviewRequests: false, itemExpiring: false,
      }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('Bambeh_email_preferences', JSON.stringify(preferences));
      alert('âœ… Email preferences saved successfully!');
      onClose();
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('âŒ Failed to save preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const PreferenceToggle = ({
    label,
    description,
    checked,
    onChange,
    required = false,
  }: {
    label: string;
    description: string;
    checked: boolean;
    onChange: () => void;
    required?: boolean;
  }) => (
    <div className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex-1 pr-4">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-gray-900">{label}</p>
          {required && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Required</span>}
        </div>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
      <button type="button" onClick={onChange} disabled={required}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${checked ? 'bg-teal-600' : 'bg-gray-200'} ${required ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8">
        <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg"><Mail className="w-6 h-6" /></div>
              <div><h2 className="text-2xl font-bold">Email Preferences</h2><p className="text-teal-100 text-sm">Manage what emails you receive</p></div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors"><X className="w-6 h-6" /></button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800">Your preferences are saved immediately. Changes may take up to 24 hours to take effect. Critical security emails cannot be disabled.</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Bell className="w-5 h-5 text-teal-600" />Marketing & Promotions</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <PreferenceToggle label="Marketing Emails" description="Receive promotional emails about Bambeh services and features" checked={preferences.marketingEmails} onChange={() => handleToggle('marketingEmails')} />
              <PreferenceToggle label="Weekly Deals" description="Get notified about special deals and discounts every week" checked={preferences.weeklyDeals} onChange={() => handleToggle('weeklyDeals')} />
              <PreferenceToggle label="New Features" description="Be the first to know about new Bambeh features and updates" checked={preferences.newFeatures} onChange={() => handleToggle('newFeatures')} />
              <PreferenceToggle label="Special Offers" description="Exclusive offers and promotions tailored for you" checked={preferences.specialOffers} onChange={() => handleToggle('specialOffers')} />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Transaction & Account</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <PreferenceToggle label="Order Confirmations" description="Confirmation emails when you place an order" checked={preferences.orderConfirmations} onChange={() => handleToggle('orderConfirmations')} required />
              <PreferenceToggle label="Payment Receipts" description="Receipts for all your transactions and payments" checked={preferences.paymentReceipts} onChange={() => handleToggle('paymentReceipts')} required />
              <PreferenceToggle label="Delivery Updates" description="Track your orders with delivery status updates" checked={preferences.deliveryUpdates} onChange={() => handleToggle('deliveryUpdates')} />
              <PreferenceToggle label="Account Changes" description="Notifications about profile and account updates" checked={preferences.accountChanges} onChange={() => handleToggle('accountChanges')} required />
              <PreferenceToggle label="Security Alerts" description="Important security notifications for your account" checked={preferences.securityAlerts} onChange={() => handleToggle('securityAlerts')} required />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Activity & Engagement</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <PreferenceToggle label="New Messages" description="Get notified when you receive a new message" checked={preferences.newMessages} onChange={() => handleToggle('newMessages')} />
              <PreferenceToggle label="Offer Received" description="Alerts when someone makes an offer on your item" checked={preferences.offerReceived} onChange={() => handleToggle('offerReceived')} />
              <PreferenceToggle label="Item Sold" description="Confirmation when your item is sold" checked={preferences.itemSold} onChange={() => handleToggle('itemSold')} />
              <PreferenceToggle label="Item Expiring" description="Reminder when your listings are about to expire" checked={preferences.itemExpiring} onChange={() => handleToggle('itemExpiring')} />
              <PreferenceToggle label="Price Drops" description="Notify me when saved items drop in price" checked={preferences.priceDrops} onChange={() => handleToggle('priceDrops')} />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Social & Community</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <PreferenceToggle label="Followers Updates" description="Notifications about new followers and profile views" checked={preferences.followersUpdates} onChange={() => handleToggle('followersUpdates')} />
              <PreferenceToggle label="Review Requests" description="Reminders to leave reviews for completed transactions" checked={preferences.reviewRequests} onChange={() => handleToggle('reviewRequests')} />
              <PreferenceToggle label="Community News" description="Updates about the Bambeh community and events" checked={preferences.communityNews} onChange={() => handleToggle('communityNews')} />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Email Frequency</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">How often would you like to receive email digests?</label>
              <select value={preferences.digestFrequency} onChange={handleFrequencyChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                <option value="instant">Instant (as they happen)</option>
                <option value="daily">Daily Digest</option>
                <option value="weekly">Weekly Digest</option>
                <option value="monthly">Monthly Digest</option>
              </select>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <button type="button" onClick={handleUnsubscribeAll} className="text-sm text-red-600 hover:text-red-700 font-semibold underline">
              Unsubscribe from all marketing emails
            </button>
            <p className="text-xs text-gray-600 mt-2">You will still receive important account and transaction emails</p>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-200">
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors">Cancel</button>
            <button type="button" onClick={handleSave} disabled={isSaving}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-lg hover:from-teal-700 hover:to-blue-700 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {isSaving ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>) : (<><Save className="w-5 h-5" />Save Preferences</>)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}




