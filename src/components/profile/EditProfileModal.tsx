/**
 * EditProfileModal.tsx — Bambeh Marketplace
 * FILE LOCATION: src/components/profile/EditProfileModal.tsx
 *
 * Fully localized with Right-to-Left (RTL) mirror support and 
 * clean integration for English, French, Pidgin, Arabic, and Fulfulde.
 *
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import { useState, useEffect, useRef } from 'react';
import { X, User, Mail, Phone, MapPin, Save, Camera, Globe, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/App';

interface EditProfileModalProps { onClose: () => void; }

type Lang = "en" | "fr" | "pidgin" | "ar" | "ff";

const LANGUAGES = [
  { code: 'en',     name: 'English',        flag: '🇬🇧' },
  { code: 'fr',     name: 'Français',       flag: '🇫🇷' },
  { code: 'pidgin', name: 'Pidgin English',  flag: '🇨🇲' },
  { code: 'ff',     name: 'Fulfulde',       flag: '🇨🇲' },
  { code: 'ar',     name: 'العربية',          flag: '🇸🇦' },
];

const REGIONS = ['Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 'North', 'Northwest', 'South', 'Southwest', 'West'];

const S: Record<Lang, {
  editProfile: string;
  changePhoto: string;
  fullName: string;
  fullNamePlaceholder: string;
  username: string;
  usernamePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  phone: string;
  phonePlaceholder: string;
  bio: string;
  bioPlaceholder: string;
  region: string;
  selectRegion: string;
  city: string;
  cityPlaceholder: string;
  address: string;
  addressPlaceholder: string;
  prefLang: string;
  prefLangSub: string;
  cancel: string;
  saving: string;
  saveChanges: string;
  successMsg: string;
  errNameReq: string;
  errEmailVal: string;
  errPhoneVal: string;
  errImageSize: string;
  errSaveFail: string;
}> = {
  en: {
    editProfile: "Edit Profile",
    changePhoto: "Tap to change photo",
    fullName: "Full Name *",
    fullNamePlaceholder: "Enter your full name",
    username: "Username",
    usernamePlaceholder: "Choose a username",
    email: "Email",
    emailPlaceholder: "your.email@example.com",
    phone: "Phone Number",
    phonePlaceholder: "+237 6XX XXX XXX",
    bio: "Bio",
    bioPlaceholder: "Tell us about yourself...",
    region: "Region",
    selectRegion: "Select Region",
    city: "City",
    cityPlaceholder: "Enter your city",
    address: "Address",
    addressPlaceholder: "Enter your address",
    prefLang: "Preferred Language",
    prefLangSub: "Choose your preferred app language",
    cancel: "Cancel",
    saving: "Saving...",
    saveChanges: "Save Changes",
    successMsg: "Profile saved successfully!",
    errNameReq: "Full name is required",
    errEmailVal: "Please enter a valid email",
    errPhoneVal: "Please enter a valid phone number",
    errImageSize: "Image must be less than 5MB",
    errSaveFail: "Failed to save. Please try again."
  },
  fr: {
    editProfile: "Modifier le profil",
    changePhoto: "Appuyer pour changer de photo",
    fullName: "Nom complet *",
    fullNamePlaceholder: "Entrez votre nom complet",
    username: "Nom d'utilisateur",
    usernamePlaceholder: "Choisissez un nom d'utilisateur",
    email: "E-mail",
    emailPlaceholder: "votre.email@example.com",
    phone: "Numéro de téléphone",
    phonePlaceholder: "+237 6XX XXX XXX",
    bio: "Biographie",
    bioPlaceholder: "Parlez-nous de vous...",
    region: "Région",
    selectRegion: "Sélectionnez la région",
    city: "Ville",
    cityPlaceholder: "Entrez votre ville",
    address: "Adresse",
    addressPlaceholder: "Entrez votre adresse",
    prefLang: "Langue préférée",
    prefLangSub: "Choisissez la langue de votre application",
    cancel: "Annuler",
    saving: "Enregistrement...",
    saveChanges: "Enregistrer les modifications",
    successMsg: "Profil enregistré avec succès !",
    errNameReq: "Le nom complet est obligatoire",
    errEmailVal: "Veuillez entrer une adresse e-mail valide",
    errPhoneVal: "Veuillez entrer un numéro de téléphone valide",
    errImageSize: "L'image doit être inférieure à 5 Mo",
    errSaveFail: "Échec de l'enregistrement. Veuillez réessayer."
  },
  pidgin: {
    editProfile: "Change Profile Info",
    changePhoto: "Touch here for change picture",
    fullName: "Your Main Name *",
    fullNamePlaceholder: "Write your full name",
    username: "Username / Moniker",
    usernamePlaceholder: "Choose user name wey you like",
    email: "Email Address",
    emailPlaceholder: "your.email@example.com",
    phone: "Phone Number",
    phonePlaceholder: "+237 6XX XXX XXX",
    bio: "Bio / Story",
    bioPlaceholder: "Tell us small story about you...",
    region: "Region",
    selectRegion: "Choose your Region",
    city: "Town / City",
    cityPlaceholder: "Enter your town",
    address: "Quarter / Address",
    addressPlaceholder: "Where your house dey?",
    prefLang: "Language Wey You Like",
    prefLangSub: "Choose the language wey app go use talk to you",
    cancel: "Cancel",
    saving: "E dey lock am...",
    saveChanges: "Save Profile",
    successMsg: "Profile don save fine fine!",
    errNameReq: "You must put your full name",
    errEmailVal: "This your email address no correct",
    errPhoneVal: "This your phone number no match clear",
    errImageSize: "Picture big pass 5MB, choose small one",
    errSaveFail: "Wahala dey, we no fit save am. Try again."
  },
  ar: {
    editProfile: "تعديل الملف الشخصي",
    changePhoto: "اضغط لتغيير الصورة",
    fullName: "الاسم الكامل *",
    fullNamePlaceholder: "أدخل اسمك الكامل",
    username: "اسم المستخدم",
    usernamePlaceholder: "اختر اسم المستخدم",
    email: "البريد الإلكتروني",
    emailPlaceholder: "your.email@example.com",
    phone: "رقم الهاتف",
    phonePlaceholder: "+237 6XX XXX XXX",
    bio: "النبذة الشخصية",
    bioPlaceholder: "اخبرنا عن نفسك...",
    region: "المنطقة",
    selectRegion: "اختر المنطقة",
    city: "المدينة",
    cityPlaceholder: "أدخل مدينتك",
    address: "العنوان",
    addressPlaceholder: "أدخل عنوانك الحالي",
    prefLang: "اللغة المفضلة",
    prefLangSub: "اختر لغتك المفضلة لتطبيقك",
    cancel: "إلغاء",
    saving: "جاري الحفظ...",
    saveChanges: "حفظ التغييرات",
    successMsg: "تم حفظ الملف الشخصي بنجاح!",
    errNameReq: "الاسم الكامل مطلوب",
    errEmailVal: "يرجى إدخال بريد إلكتروني صحيح",
    errPhoneVal: "يرجى إدخال رقم هاتف صحيح",
    errImageSize: "يجب أن يكون حجم الصورة أقل من 5 ميجابايت",
    errSaveFail: "فشل الحفظ. يرجى المحاولة مرة أخرى."
  },
  ff: {
    editProfile: "Waylu Andital",
    changePhoto: "Meemu ngam mempugo foto",
    fullName: "Innde timmunde *",
    fullNamePlaceholder: "Waɗu innde maa timmunde",
    username: "Innde gollirde",
    usernamePlaceholder: "Suftu innde gollirde maa",
    email: "Email Address",
    emailPlaceholder: "your.email@example.com",
    phone: "Limoore Telefoŋ",
    phonePlaceholder: "+237 6XX XXX XXX",
    bio: "Anditingol",
    bioPlaceholder: "Haalan min feere dow maa...",
    region: "Diiwal",
    selectRegion: "Suftu Diiwal",
    city: "Wuro",
    cityPlaceholder: "Waɗu wuro maa",
    address: "Lirde / Address",
    addressPlaceholder: "Waɗu address maa ɗo",
    prefLang: "Ɗemngal Ngallirgal",
    prefLangSub: "Suftu ɗemngal ngal njiɗ-ɗaa nder app",
    cancel: "Fasikna",
    saving: "Ɗon resata...",
    saveChanges: "Resu Waylagol",
    successMsg: "Andital resama ko woodi!",
    errNameReq: "Innde timmunde yo gandal kaandi",
    errEmailVal: "Tiiɗno waɗu email goongajum",
    errPhoneVal: "Tiiɗno waɗu limoore telefoŋ goongajum",
    errImageSize: "Foto yo lesta e 5MB fof",
    errSaveFail: "Ruskama resgo andital. Tiiɗno eto kadi."
  }
};

export default function EditProfileModal({ onClose }: EditProfileModalProps) {
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const lang: Lang = (language in S ? language : "en") as Lang;
  const s = S[lang];
  const isRtl = lang === "ar";

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
    const file = e.target.files?.;
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: s.errImageSize }));
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
    if (!formData.fullName.trim()) { newErrors.name = s.errNameReq; }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { newErrors.email = s.errEmailVal; }
    if (formData.phoneNumber && !/^[0-9+\s-]{9,15}$/.test(formData.phoneNumber.replace(/\s/g, ''))) { newErrors.phoneNumber = s.errPhoneVal; }
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
      setErrors(prev => ({ ...prev, save: s.errSaveFail }));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div dir={isRtl ? "rtl" : "ltr"} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">

        {/* Fixed Header */}
        <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{s.editProfile}</h2>
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
              <button onClick={() => fileInputRef.current?.click()} className={`absolute bottom-0 ${isRtl ? 'left-0' : 'right-0'} p-2 bg-teal-600 rounded-full text-white hover:bg-teal-700 transition-colors shadow-lg focus:outline-none`}>
                <Camera className="w-4 h-4" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </div>
            {errors.image && <p className="mt-2 text-sm text-red-600">{errors.image}</p>}
            <p className="text-sm text-gray-400 mt-2 font-medium">{s.changePhoto}</p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 text-start">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{s.fullName}</label>
              <div className="relative">
                <User className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder={s.fullNamePlaceholder}
                  className={`w-full ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 text-sm focus:outline-none ${errors.name ? 'border-red-500' : 'border-gray-300'}`} />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.name}</p>}
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{s.username}</label>
              <div className="relative">
                <span className={`absolute ${isRtl ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-gray-400 font-medium`}>@</span>
                <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder={s.usernamePlaceholder}
                  className={`w-full ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm focus:outline-none`} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{s.email}</label>
              <div className="relative">
                <Mail className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder={s.emailPlaceholder}
                  className={`w-full ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 text-sm focus:outline-none ${errors.email ? 'border-red-500' : 'border-gray-300'}`} />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{s.phone}</label>
              <div className="relative">
                <Phone className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
                <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder={s.phonePlaceholder}
                  className={`w-full ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 text-sm focus:outline-none ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`} />
              </div>
              {errors.phoneNumber && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.phoneNumber}</p>}
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{s.bio}</label>
              <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder={s.bioPlaceholder} rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 resize-none text-sm focus:outline-none" />
            </div>

            {/* Region */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{s.region}</label>
              <div className="relative">
                <MapPin className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
                <select name="region" value={formData.region} onChange={handleChange}
                  className={`w-full ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white text-sm focus:outline-none appearance-none`}>
                  <option value="">{s.selectRegion}</option>
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{s.city}</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder={s.cityPlaceholder}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm focus:outline-none" />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{s.address}</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder={s.addressPlaceholder}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm focus:outline-none" />
            </div>

            {/* Language Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{s.prefLang}</label>
              <div className="relative">
                <Globe className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
                <select name="preferredLanguage" value={formData.preferredLanguage} onChange={handleChange}
                  className={`w-full ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white text-sm focus:outline-none appearance-none`}>
                  {LANGUAGES.map(lang => <option key={lang.code} value={lang.code}>{lang.flag} {lang.name}</option>)}
                </select>
              </div>
              <p className="mt-1 text-xs text-gray-400">{s.prefLangSub}</p>
            </div>

            {errors.save && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" /><span className="text-sm text-red-800 font-medium">{errors.save}</span>
              </div>
            )}
            {saveSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" /><span className="text-sm text-green-800 font-bold">{s.successMsg}</span>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex-shrink-0">
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-300 transition-colors focus:outline-none">
              {s.cancel}
            </button>
            <button onClick={handleSave} disabled={isSaving}
              className="flex-1 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg font-bold text-sm hover:from-teal-700 hover:to-teal-800 transition-all disabled:opacity-40 flex items-center justify-center gap-2 focus:outline-none">
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{s.saving}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{s.saveChanges}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}