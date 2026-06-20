/**
 * EDIT PROFILE MODAL - Enhanced with scrollable content
 * FILE LOCATION: src/components/profile/EditProfileModal.tsx
 */

import { useState, useEffect, useRef } from 'react';
import { X, User, Mail, Phone, MapPin, Save, Camera, Globe, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface EditProfileModalProps { onClose: () => void; }

const LANGUAGES = [
  { code: 'en',  name: 'English',        flag: 'ðŸ‡¬ðŸ‡§' },
  { code: 'fr',  name: 'FranÃ§ais',        flag: 'ðŸ‡«ðŸ‡·' },
  { code: 'pcm', name: 'Pidgin English',  flag: 'ðŸ‡¨ðŸ‡²' },
  { code: 'ff',  name: 'Fulfulde',        flag: 'ðŸ‡³ðŸ‡¬' },
  { code: 'ar',  name: 'Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©',          flag: 'ðŸ‡¸ðŸ‡¦' },
  { code: 'ha',  name: 'Hausa',           flag: 'ðŸ‡³ðŸ‡¬' },
];

const REGIONS = ['Adamawa','Centre','East','Far North','Littoral','North','Northwest','South','Southwest','West'];

export default function EditProfileModal({ onClose }: EditProfileModalProps) {
  const { currentUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    fullName: '', username: '', email: '', phoneNumber: '',
    bio: '', region: '', city: '', address: '', preferredLanguage: 'en',
  });
  const [profileImage, setProfileImage] = useState('');
  const [isSaving, setIsSaving]         = useState(false);
  const [saveSuccess, setSaveSuccess]   = useState(false);
  const [errors, setErrors]             = useState<Record<string, string>>({});

  useEffect(() => {
    const savedProfile  = localStorage.getItem('Bambeh_user_profile');
    const savedImage    = localStorage.getItem('Bambeh_profile_image');
    const savedLanguage = localStorage.getItem('Bambeh_language');

    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        setFormData(prev => ({ ...prev, ...profile }));
      } catch (e) {
        console.error('Error loading profile:', e);
      }
    } else if (currentUser) {
      setFormData(prev => ({
        ...prev,
        fullName:    currentUser.name  || '',
        username:    currentUser.name  || '',
        email:       currentUser.email || '',
        phoneNumber: currentUser.phone || '',
      }));
    }

    if (savedImage)    { setProfileImage(savedImage); }
    if (savedLanguage) { setFormData(prev => ({ ...prev, preferredLanguage: savedLanguage })); }
  }, [currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image must be less than 5MB' }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setProfileImage(base64);
        localStorage.setItem('Bambeh_profile_image', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) { newErrors.name = 'Full name is required'; }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { newErrors.email = 'Please enter a valid email'; }
    if (formData.phoneNumber && !/^[0-9+\s-]{9,15}$/.test(formData.phoneNumber.replace(/\s/g, ''))) { newErrors.phoneNumber = 'Please enter a valid phone number'; }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      localStorage.setItem('Bambeh_user_profile', JSON.stringify(formData));
      localStorage.setItem('Bambeh_language', formData.preferredLanguage);
      const currentUserData = localStorage.getItem('Bambeh_user');
      if (currentUserData) {
        const userData    = JSON.parse(currentUserData);
        const updatedUser = { ...userData, fullName: formData.fullName, username: formData.fullName, email: formData.email, phoneNumber: formData.phoneNumber };
        localStorage.setItem('Bambeh_user', JSON.stringify(updatedUser));
        localStorage.setItem('Bambeh_current_user', JSON.stringify(updatedUser));
      }
      window.dispatchEvent(new CustomEvent('profileUpdated', { detail: formData }));
      setSaveSuccess(true);
      setTimeout(() => { onClose(); }, 1500);
    } catch (error) {
      setErrors(prev => ({ ...prev, save: 'Failed to save. Please try again.' }));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">

        {/* Fixed Header */}
        <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Edit Profile</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors"><X className="w-6 h-6" /></button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Profile Picture */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                {profileImage ? <img src={profileImage} alt="Profile" className="w-full h-full object-cover" /> : <User className="w-12 h-12 text-white" />}
              </div>
              <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 p-2 bg-teal-600 rounded-full text-white hover:bg-teal-700 transition-colors shadow-lg">
                <Camera className="w-4 h-4" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </div>
            {errors.image && <p className="mt-2 text-sm text-red-600">{errors.image}</p>}
            <p className="text-sm text-gray-500 mt-2">Tap to change photo</p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Enter your full name"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`} />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.name}</p>}
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Choose a username"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="your.email@example.com"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`} />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="+237 6XX XXX XXX"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`} />
              </div>
              {errors.phoneNumber && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.phoneNumber}</p>}
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Bio</label>
              <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Tell us about yourself..." rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 resize-none" />
            </div>

            {/* Region */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Region</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select name="region" value={formData.region} onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 appearance-none bg-white">
                  <option value="">Select Region</option>
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="Enter your city"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Enter your address"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" />
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Preferred Language</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select name="preferredLanguage" value={formData.preferredLanguage} onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 appearance-none bg-white">
                  {LANGUAGES.map(lang => <option key={lang.code} value={lang.code}>{lang.flag} {lang.name}</option>)}
                </select>
              </div>
              <p className="mt-1 text-xs text-gray-500">Choose your preferred app language</p>
            </div>

            {errors.save && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" /><span className="text-sm text-red-800">{errors.save}</span>
              </div>
            )}
            {saveSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" /><span className="text-sm text-green-800 font-semibold">Profile saved successfully!</span>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex-shrink-0">
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={isSaving}
              className="flex-1 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg font-bold hover:from-teal-700 hover:to-teal-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {isSaving ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>) : (<><Save className="w-5 h-5" />Save Changes</>)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


