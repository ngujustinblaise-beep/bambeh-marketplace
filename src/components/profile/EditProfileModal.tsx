/**
 * EDIT PROFILE MODAL - Enhanced with scrollable content
 * FILE LOCATION: src/components/profile/EditProfileModal.tsx
 *
 * i18n: all visible strings come from the local S table below, keyed by the live
 * language (useLang from @/hooks/useAppLang), so the modal re-translates the
 * instant the language changes. All logic (load, validation, save, localStorage
 * keys, profileUpdated event) is unchanged.
 */

import { useState, useEffect, useRef } from 'react';
import { X, User, Mail, Phone, MapPin, Save, Camera, Globe, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/hooks/useAppLang';

type Lang = 'en' | 'fr' | 'pidgin' | 'ar' | 'ff';

interface EditProfileModalProps { onClose: () => void; }

const LANGUAGES = [
  { code: 'en',  name: 'English',        flag: '🇬🇧' },
  { code: 'fr',  name: 'Français',        flag: '🇫🇷' },
  { code: 'pcm', name: 'Pidgin English',  flag: '🇨🇲' },
  { code: 'ff',  name: 'Fulfulde',        flag: '🇳🇬' },
  { code: 'ar',  name: 'العربية',          flag: '🇸🇦' },
  { code: 'ha',  name: 'Hausa',           flag: '🇳🇬' },
];

const REGIONS = ['Adamawa','Centre','East','Far North','Littoral','North','Northwest','South','Southwest','West'];

const S: Record<Lang, {
  title: string; tapPhoto: string; imgTooLarge: string;
  fullName: string; fullNamePh: string; nameRequired: string;
  username: string; usernamePh: string;
  email: string; emailPh: string; emailInvalid: string;
  phone: string; phonePh: string; phoneInvalid: string;
  bio: string; bioPh: string;
  region: string; selectRegion: string;
  city: string; cityPh: string;
  address: string; addressPh: string;
  prefLang: string; prefLangHint: string;
  saveFailed: string; saveSuccess: string;
  cancel: string; saving: string; saveChanges: string;
}> = {
  en: {
    title: 'Edit Profile', tapPhoto: 'Tap to change photo', imgTooLarge: 'Image must be less than 5MB',
    fullName: 'Full Name *', fullNamePh: 'Enter your full name', nameRequired: 'Full name is required',
    username: 'Username', usernamePh: 'Choose a username',
    email: 'Email', emailPh: 'your.email@example.com', emailInvalid: 'Please enter a valid email',
    phone: 'Phone Number', phonePh: '+237 6XX XXX XXX', phoneInvalid: 'Please enter a valid phone number',
    bio: 'Bio', bioPh: 'Tell us about yourself...',
    region: 'Region', selectRegion: 'Select Region',
    city: 'City', cityPh: 'Enter your city',
    address: 'Address', addressPh: 'Enter your address',
    prefLang: 'Preferred Language', prefLangHint: 'Choose your preferred app language',
    saveFailed: 'Failed to save. Please try again.', saveSuccess: 'Profile saved successfully!',
    cancel: 'Cancel', saving: 'Saving...', saveChanges: 'Save Changes',
  },
  fr: {
    title: 'Modifier le profil', tapPhoto: 'Touchez pour changer la photo', imgTooLarge: "L'image doit faire moins de 5 Mo",
    fullName: 'Nom complet *', fullNamePh: 'Entrez votre nom complet', nameRequired: 'Le nom complet est requis',
    username: "Nom d'utilisateur", usernamePh: "Choisissez un nom d'utilisateur",
    email: 'E-mail', emailPh: 'votre.email@exemple.com', emailInvalid: 'Veuillez saisir un e-mail valide',
    phone: 'Numéro de téléphone', phonePh: '+237 6XX XXX XXX', phoneInvalid: 'Veuillez saisir un numéro valide',
    bio: 'Bio', bioPh: 'Parlez-nous de vous...',
    region: 'Région', selectRegion: 'Choisir une région',
    city: 'Ville', cityPh: 'Entrez votre ville',
    address: 'Adresse', addressPh: 'Entrez votre adresse',
    prefLang: 'Langue préférée', prefLangHint: "Choisissez la langue de l'application",
    saveFailed: "Échec de l'enregistrement. Veuillez réessayer.", saveSuccess: 'Profil enregistré avec succès !',
    cancel: 'Annuler', saving: 'Enregistrement...', saveChanges: 'Enregistrer',
  },
  pidgin: {
    title: 'Edit Profile', tapPhoto: 'Press to change photo', imgTooLarge: 'Image must be small pass 5MB',
    fullName: 'Full Name *', fullNamePh: 'Put your full name', nameRequired: 'You must put your full name',
    username: 'Username', usernamePh: 'Choose username',
    email: 'Email', emailPh: 'your.email@example.com', emailInvalid: 'Abeg put correct email',
    phone: 'Phone Number', phonePh: '+237 6XX XXX XXX', phoneInvalid: 'Abeg put correct phone number',
    bio: 'Bio', bioPh: 'Tell us small about yourself...',
    region: 'Region', selectRegion: 'Choose Region',
    city: 'City', cityPh: 'Put your city',
    address: 'Address', addressPh: 'Put your address',
    prefLang: 'Language Wey You Want', prefLangHint: 'Choose di app language wey you want',
    saveFailed: 'E no fit save. Try again.', saveSuccess: 'Profile don save!',
    cancel: 'Cancel', saving: 'E dey save...', saveChanges: 'Save Changes',
  },
  ar: {
    title: 'تعديل الملف الشخصي', tapPhoto: 'اضغط لتغيير الصورة', imgTooLarge: 'يجب أن تكون الصورة أقل من 5 ميغابايت',
    fullName: 'الاسم الكامل *', fullNamePh: 'أدخل اسمك الكامل', nameRequired: 'الاسم الكامل مطلوب',
    username: 'اسم المستخدم', usernamePh: 'اختر اسم مستخدم',
    email: 'البريد الإلكتروني', emailPh: 'your.email@example.com', emailInvalid: 'يرجى إدخال بريد إلكتروني صالح',
    phone: 'رقم الهاتف', phonePh: '+237 6XX XXX XXX', phoneInvalid: 'يرجى إدخال رقم هاتف صالح',
    bio: 'نبذة', bioPh: 'أخبرنا عن نفسك...',
    region: 'المنطقة', selectRegion: 'اختر المنطقة',
    city: 'المدينة', cityPh: 'أدخل مدينتك',
    address: 'العنوان', addressPh: 'أدخل عنوانك',
    prefLang: 'اللغة المفضلة', prefLangHint: 'اختر لغة التطبيق المفضلة لديك',
    saveFailed: 'فشل الحفظ. يرجى المحاولة مرة أخرى.', saveSuccess: 'تم حفظ الملف الشخصي بنجاح!',
    cancel: 'إلغاء', saving: 'جارٍ الحفظ...', saveChanges: 'حفظ التغييرات',
  },
  ff: {
    title: 'Taƴto profil', tapPhoto: 'Meem ngam waylude natal', imgTooLarge: 'Natal foti ɓurde famɗude 5MB',
    fullName: 'Innde timmunde *', fullNamePh: 'Naatnu innde maa timmunde', nameRequired: 'Innde timmunde ina waɗɗii',
    username: 'Innde huutoraande', usernamePh: 'Suɓo innde huutoraande',
    email: 'Iimeel', emailPh: 'your.email@example.com', emailInvalid: 'Tiiɗno naatnu iimeel feewɗo',
    phone: 'Limndo telefoŋ', phonePh: '+237 6XX XXX XXX', phoneInvalid: 'Tiiɗno naatnu limndo feewɗo',
    bio: 'Faltaade', bioPh: 'Haalan min hoore maa...',
    region: 'Diiwaan', selectRegion: 'Suɓo diiwaan',
    city: 'Wuro', cityPh: 'Naatnu wuro maa',
    address: 'Ñiiɓirde', addressPh: 'Naatnu ñiiɓirde maa',
    prefLang: 'Ɗemngal cuɓaaɗo', prefLangHint: 'Suɓo ɗemngal aplikeysiɔ̃ ngal njiɗ-ɗaa',
    saveFailed: 'Dannugol hawri. Tiiɗno eto kadi.', saveSuccess: 'Profil danaama no moƴƴi!',
    cancel: 'Haaytu', saving: 'Ɗon danee...', saveChanges: 'Dannu baylamuuji',
  },
};

export default function EditProfileModal({ onClose }: EditProfileModalProps) {
  const { currentUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const langCode = useLang();
  const l: Lang = (langCode in S ? langCode : 'en') as Lang;
  const s = S[l];
  const isRtl = l === 'ar';

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
        setErrors(prev => ({ ...prev, image: s.imgTooLarge }));
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
    if (!formData.fullName.trim()) { newErrors.name = s.nameRequired; }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { newErrors.email = s.emailInvalid; }
    if (formData.phoneNumber && !/^[0-9+\s-]{9,15}$/.test(formData.phoneNumber.replace(/\s/g, ''))) { newErrors.phoneNumber = s.phoneInvalid; }
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
      setErrors(prev => ({ ...prev, save: s.saveFailed }));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">

        {/* Fixed Header */}
        <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{s.title}</h2>
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
            <p className="text-sm text-gray-500 mt-2">{s.tapPhoto}</p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{s.fullName}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder={s.fullNamePh}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`} />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.name}</p>}
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{s.username}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder={s.usernamePh}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{s.email}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder={s.emailPh}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`} />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{s.phone}</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder={s.phonePh}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`} />
              </div>
              {errors.phoneNumber && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.phoneNumber}</p>}
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{s.bio}</label>
              <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder={s.bioPh} rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 resize-none" />
            </div>

            {/* Region */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{s.region}</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select name="region" value={formData.region} onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 appearance-none bg-white">
                  <option value="">{s.selectRegion}</option>
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{s.city}</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder={s.cityPh}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{s.address}</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder={s.addressPh}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" />
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{s.prefLang}</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select name="preferredLanguage" value={formData.preferredLanguage} onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 appearance-none bg-white">
                  {LANGUAGES.map(lang => <option key={lang.code} value={lang.code}>{lang.flag} {lang.name}</option>)}
                </select>
              </div>
              <p className="mt-1 text-xs text-gray-500">{s.prefLangHint}</p>
            </div>

            {errors.save && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" /><span className="text-sm text-red-800">{errors.save}</span>
              </div>
            )}
            {saveSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" /><span className="text-sm text-green-800 font-semibold">{s.saveSuccess}</span>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex-shrink-0">
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors">{s.cancel}</button>
            <button onClick={handleSave} disabled={isSaving}
              className="flex-1 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg font-bold hover:from-teal-700 hover:to-teal-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {isSaving ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />{s.saving}</>) : (<><Save className="w-5 h-5" />{s.saveChanges}</>)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

