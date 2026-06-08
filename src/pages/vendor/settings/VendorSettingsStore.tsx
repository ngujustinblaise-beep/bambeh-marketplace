/**
 * VENDOR SETTINGS - STORE SETTINGS
 * Sub-page for managing store branding, categories, and SEO
 * FILE LOCATION: src/pages/vendor/settings/VendorSettingsStore.tsx
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Store, Image, Tag, FileText, Search, Save, Check,
  Camera, Palette, Layout, Settings, ChevronRight
} from 'lucide-react';
import BambehLogo from '@/assets/images/bambeh-logo.png';
import { useLang, t } from "@/hooks/useAppLang";

export default function VendorSettingsStore() {
  const lang = useLang();
  const isRtl = lang === "ar";
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('branding');

  const [storeSettings, setStoreSettings] = useState({
    storeName: '',
    storeSlogan: '',
    storeDescription: '',
    primaryColor: '#8B5CF6',
    secondaryColor: '#EC4899',
    categories: [] as string[],
    policies: {
      returnPolicy: '7 days return policy for unused items',
      shippingPolicy: 'Ships within 24-48 hours',
      privacyPolicy: ''
    },
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: ''
    },
    displaySettings: {
      showRatings: true,
      showSalesCount: true,
      showJoinDate: true,
      gridView: true
    }
  });

  const availableCategories = [
    'Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Beauty',
    'Automotive', 'Books', 'Toys', 'Food & Beverages', 'Services'
  ];

  // FIX 1: Added missing closing } for if (vendorData) block
  useEffect(() => {
    const vendorData = localStorage.getItem('Bambeh_vendor');
    if (vendorData) {
      const parsed = JSON.parse(vendorData);
      if (parsed.storeSettings) {
        setStoreSettings(prev => ({ ...prev, ...parsed.storeSettings }));
      }
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const existingData = JSON.parse(localStorage.getItem('Bambeh_vendor') || '{}');
    localStorage.setItem('Bambeh_vendor', JSON.stringify({ ...existingData, storeSettings }));
    
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // FIX 3: Added missing closing } for toggleCategory function
  const toggleCategory = (category: string) => {
    setStoreSettings(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const tabs = [
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'policies', label: 'Policies', icon: FileText },
    { id: 'display', label: 'Display', icon: Layout },
    { id: 'seo', label: 'SEO', icon: Search }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/vendor/settings')} className="p-2 hover:bg-white/10 rounded-lg text-white">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <Link to="/vendor/home" className="flex items-center gap-2">
                <img src={BambehLogo} alt="Bambeh" className="w-10 h-10 rounded-xl" />
                <div>
                  <span className="font-bold text-lg text-white">Store Settings</span>
                  <p className="text-xs text-white/60">Branding & SEO</p>
                </div>
              </Link>
            </div>
            {/* FIX 2: Repaired broken save button JSX */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium disabled:opacity-50"
            >
              {isSaving ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </header>

      {/* Success Toast */}
      {saveSuccess && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg shadow-lg">
          <Check className="w-5 h-5" />
          <span>Store settings saved!</span>
        </div>
      )}

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {/* FIX 4: Corrected );)} to ); })} to properly close arrow function */}
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/10">
          {/* Branding Tab */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white mb-4">Store Branding</h3>
              
              {/* Store Logo */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Store Logo</label>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-slate-700 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-600">
                    <Camera className="w-8 h-8 text-slate-500" />
                  </div>
                  <button className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700">
                    Upload Logo
                  </button>
                </div>
              </div>

              {/* Store Banner */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Store Banner</label>
                <div className="w-full h-32 bg-slate-700 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-600">
                  <div className="text-center">
                    <Image className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Recommended: 1200x300px</p>
                  </div>
                </div>
              </div>

              {/* Store Name & Slogan */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Store Name</label>
                  <input
                    type="text"
                    value={storeSettings.storeName}
                    onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-teal-500"
                    placeholder="Your Store Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Store Slogan</label>
                  <input
                    type="text"
                    value={storeSettings.storeSlogan}
                    onChange={(e) => setStoreSettings({ ...storeSettings, storeSlogan: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-teal-500"
                    placeholder="Your tagline here"
                  />
                </div>
              </div>

              {/* Store Description */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Store Description</label>
                <textarea
                  value={storeSettings.storeDescription}
                  onChange={(e) => setStoreSettings({ ...storeSettings, storeDescription: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-teal-500 resize-none"
                  placeholder="Tell customers about your store..."
                />
              </div>

              {/* Brand Colors */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Primary Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={storeSettings.primaryColor}
                      onChange={(e) => setStoreSettings({ ...storeSettings, primaryColor: e.target.value })}
                      className="w-12 h-12 rounded-lg cursor-pointer border border-slate-600"
                    />
                    <input
                      type="text"
                      value={storeSettings.primaryColor}
                      onChange={(e) => setStoreSettings({ ...storeSettings, primaryColor: e.target.value })}
                      className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Secondary Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={storeSettings.secondaryColor}
                      onChange={(e) => setStoreSettings({ ...storeSettings, secondaryColor: e.target.value })}
                      className="w-12 h-12 rounded-lg cursor-pointer border border-slate-600"
                    />
                    <input
                      type="text"
                      value={storeSettings.secondaryColor}
                      onChange={(e) => setStoreSettings({ ...storeSettings, secondaryColor: e.target.value })}
                      className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white mb-4">Store Categories</h3>
              <p className="text-slate-400 text-sm">Select the categories that best describe your store</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`px-4 py-3 rounded-xl border font-medium transition-colors ${
                      storeSettings.categories.includes(category)
                        ? 'bg-teal-600 border-teal-500 text-white'
                        : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:border-teal-500'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              
              <p className="text-sm text-slate-400">
                Selected: {storeSettings.categories.length} categories
              </p>
            </div>
          )}

          {/* Policies Tab */}
          {activeTab === 'policies' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white mb-4">Store Policies</h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Return Policy</label>
                <textarea
                  value={storeSettings.policies.returnPolicy}
                  onChange={(e) => setStoreSettings({
                    ...storeSettings,
                    policies: { ...storeSettings.policies, returnPolicy: e.target.value }
                  })}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-teal-500 resize-none"
                  placeholder="Your return policy..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Shipping Policy</label>
                <textarea
                  value={storeSettings.policies.shippingPolicy}
                  onChange={(e) => setStoreSettings({
                    ...storeSettings,
                    policies: { ...storeSettings.policies, shippingPolicy: e.target.value }
                  })}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-teal-500 resize-none"
                  placeholder="Your shipping policy..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Privacy Policy</label>
                <textarea
                  value={storeSettings.policies.privacyPolicy}
                  onChange={(e) => setStoreSettings({
                    ...storeSettings,
                    policies: { ...storeSettings.policies, privacyPolicy: e.target.value }
                  })}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-teal-500 resize-none"
                  placeholder="Your privacy policy..."
                />
              </div>
            </div>
          )}

          {/* Display Tab */}
          {activeTab === 'display' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white mb-4">Display Settings</h3>
              
              {[
                { key: 'showRatings', label: 'Show Ratings', desc: 'Display your store rating publicly' },
                { key: 'showSalesCount', label: 'Show Sales Count', desc: 'Display total number of sales' },
                { key: 'showJoinDate', label: 'Show Join Date', desc: 'Display when you joined Bambeh' },
                { key: 'gridView', label: 'Default Grid View', desc: 'Show products in grid layout by default' },
              ].map((setting) => (
                <div key={setting.key} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
                  <div>
                    <p className="font-medium text-white">{setting.label}</p>
                    <p className="text-sm text-slate-400">{setting.desc}</p>
                  </div>
                  <button
                    onClick={() => setStoreSettings({
                      ...storeSettings,
                      displaySettings: {
                        ...storeSettings.displaySettings,
                        [setting.key]: !storeSettings.displaySettings[setting.key as keyof typeof storeSettings.displaySettings]
                      }
                    })}
                    className={`w-12 h-7 rounded-full transition-colors ${
                      storeSettings.displaySettings[setting.key as keyof typeof storeSettings.displaySettings]
                        ? 'bg-teal-600'
                        : 'bg-slate-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      storeSettings.displaySettings[setting.key as keyof typeof storeSettings.displaySettings]
                        ? 'translate-x-6'
                        : 'translate-x-1'
                    }`}/>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* SEO Tab */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white mb-4">Search Engine Optimization</h3>
              <p className="text-slate-400 text-sm mb-4">Optimize how your store appears in search results</p>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Meta Title</label>
                <input
                  type="text"
                  value={storeSettings.seo.metaTitle}
                  onChange={(e) => setStoreSettings({
                    ...storeSettings,
                    seo: { ...storeSettings.seo, metaTitle: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-teal-500"
                  placeholder="Your Store - Best Products in "
                  maxLength={60}
                />
                <p className="text-xs text-slate-500 mt-1">{storeSettings.seo.metaTitle.length}/60 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Meta Description</label>
                <textarea
                  value={storeSettings.seo.metaDescription}
                  onChange={(e) => setStoreSettings({
                    ...storeSettings,
                    seo: { ...storeSettings.seo, metaDescription: e.target.value }
                  })}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-teal-500 resize-none"
                  placeholder="Describe your store for search engines..."
                  maxLength={160}
                />
                <p className="text-xs text-slate-500 mt-1">{storeSettings.seo.metaDescription.length}/160 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Keywords</label>
                <input
                  type="text"
                  value={storeSettings.seo.keywords}
                  onChange={(e) => setStoreSettings({
                    ...storeSettings,
                    seo: { ...storeSettings.seo, keywords: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-teal-500"
                  placeholder=", online shopping, electronics..."
                />
                <p className="text-xs text-slate-500 mt-1">Separate keywords with commas</p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Save Button */}
        <div className="mt-6">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold text-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Store Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

