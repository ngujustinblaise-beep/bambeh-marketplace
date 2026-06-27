/**
 * PrivacySettingsModal.tsx — Bambeh Marketplace
 * FILE LOCATION: src/components/profile/PrivacySettingsModal.tsx
 *
 * Full multi-lingual layout direction compliance (LTR / RTL mirror)
 * configured across English, French, Pidgin English, Arabic, and Fulfulde.
 *
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import { useState, useEffect } from 'react';
import { X, Shield, Eye, Save, AlertTriangle, Trash2 } from 'lucide-react';
import { useLanguage } from '@/App';

interface PrivacySettingsModalProps { onClose: () => void; }
type Lang = "en" | "fr" | "pidgin" | "ar" | "ff";

const S: Record<Lang, {
  title: string;
  subtitle: string;
  saveSuccessAlert: string;
  saveErrorAlert: string;
  deleteConfirmPrompt: string;
  deleteScheduledAlert: string;
  dangerZone: string;
  dangerFooter: string;
  deleteBtnText: string;
  cancel: string;
  saving: string;
  saveBtn: string;
  modalTitle: string;
  modalDesc: string;
  options: Record<string, string>;
  sections: {
    visibility: string;
    activity: string;
    search: string;
    messages: string;
    data: string;
  };
  items: Record<string, { label: string; desc: string }>;
}> = {
  en: {
    title: "Privacy Settings",
    subtitle: "Control who sees your information",
    saveSuccessAlert: "✅ Privacy settings saved successfully!",
    saveErrorAlert: "❌ Failed to save settings. Please try again.",
    deleteConfirmPrompt: "⚠️ WARNING: This will permanently delete your account and all data. This action cannot be undone. Are you absolutely sure?",
    deleteScheduledAlert: "Your account has been scheduled for deletion. You will be logged out.",
    dangerZone: "Danger Zone",
    dangerFooter: "This action is permanent and cannot be undone. All your data will be deleted.",
    deleteBtnText: "Delete My Account",
    cancel: "Cancel",
    saving: "Saving...",
    saveBtn: "Save Settings",
    modalTitle: "Delete Account?",
    modalDesc: "This will permanently delete your account, all your listings, messages, and data. This action cannot be undone.",
    options: {
      everyone: "Everyone", contacts: "Contacts Only", nobody: "Nobody",
      public: "Public", friends: "Friends Only", private: "Private",
      exact: "Exact Location", approximate: "Approximate (City)", hidden: "Hidden"
    },
    sections: { visibility: "Profile Visibility", activity: "Activity & Content", search: "Search & Discovery", messages: "Messages & Communication", data: "Data & Analytics" },
    items: {
      profileVisibility: { label: "Profile Visibility", desc: "Who can see your profile page on the platform" },
      showEmail: { label: "Email Address", desc: "Who can see your verified email address" },
      showPhone: { label: "Phone Number", desc: "Who can see your contact number for transactions" },
      showLocation: { label: "Location", desc: "Specify the granularity of your location visible to users" },
      showOnlineStatus: { label: "Show Online Status", desc: "Let others see when you're active" },
      showListings: { label: "Listings", desc: "Who can see your posted items" },
      showPurchaseHistory: { label: "Purchase History", desc: "Who can see what you've bought" },
      showReviews: { label: "Reviews", desc: "Who can see reviews you've written" },
      showFavorites: { label: "Favourites", desc: "Who can see your saved items" },
      allowSearchEngineIndexing: { label: "Search Engine Indexing", desc: "Allow search engines to index your profile" },
      showInSuggestions: { label: "Profile Suggestions", desc: "Show your profile in user suggestions" },
      allowContactSync: { label: "Contact Sync", desc: "Allow Bambeh to sync with your contacts" },
      whoCanMessage: { label: "Who Can Message You", desc: "Control who can send you messages" },
      readReceipts: { label: "Read Receipts", desc: "Let others know when you've read their messages" },
      typingIndicators: { label: "Typing Indicators", desc: "Show when you're typing a message" },
      personalizedAds: { label: "Personalised Ads", desc: "See ads tailored to your interests" },
      dataAnalytics: { label: "Analytics", desc: "Help improve Bambeh with usage analytics" },
      thirdPartySharing: { label: "Third-Party Data Sharing", desc: "Share data with partner services" }
    }
  },
  fr: {
    title: "Paramètres de confidentialité",
    subtitle: "Contrôlez qui voit vos informations",
    saveSuccessAlert: "✅ Paramètres de confidentialité enregistrés !",
    saveErrorAlert: "❌ Échec de l'enregistrement des paramètres. Veuillez réessayer.",
    deleteConfirmPrompt: "⚠️ ATTENTION : Cela supprimera définitivement votre compte et toutes vos données. Cette action est irréversible. Êtes-vous absolument sûr ?",
    deleteScheduledAlert: "Votre compte a été programmé pour la suppression. Vous allez être déconnecté.",
    dangerZone: "Zone de danger",
    dangerFooter: "Cette action est définitive et irréversible. Toutes vos données seront supprimées.",
    deleteBtnText: "Supprimer mon compte",
    cancel: "Annuler",
    saving: "Sauvegarde...",
    saveBtn: "Enregistrer les paramètres",
    modalTitle: "Supprimer le compte ?",
    modalDesc: "Cela supprimera définitivement votre compte, toutes vos annonces, messages et données. Cette action est irréversible.",
    options: {
      everyone: "Tout le monde", contacts: "Contacts uniquement", nobody: "Personne",
      public: "Public", friends: "Amis uniquement", private: "Privé",
      exact: "Emplacement exact", approximate: "Approximatif (Ville)", hidden: "Masqué"
    },
    sections: { visibility: "Visibilité du profil", activity: "Activité & Contenu", search: "Recherche & Découverte", messages: "Messages & Communication", data: "Données & Analytiques" },
    items: {
      profileVisibility: { label: "Visibilité du profil", desc: "Qui peut voir votre profil sur la plateforme" },
      showEmail: { label: "Adresse e-mail", desc: "Qui peut voir votre adresse e-mail vérifiée" },
      showPhone: { label: "Numéro de téléphone", desc: "Qui peut voir votre numéro pour les transactions" },
      showLocation: { label: "Localisation", desc: "Spécifiez la précision de votre position visible" },
      showOnlineStatus: { label: "Afficher le statut en ligne", desc: "Permettre aux autres de voir quand vous êtes actif" },
      showListings: { label: "Annonces", desc: "Qui peut voir vos articles publiés" },
      showPurchaseHistory: { label: "Historique d'achat", desc: "Qui peut voir ce que vous avez acheté" },
      showReviews: { label: "Avis", desc: "Qui peut voir les avis que vous avez écrits" },
      showFavorites: { label: "Favoris", desc: "Qui peut voir vos articles sauvegardés" },
      allowSearchEngineIndexing: { label: "Indexation des moteurs de recherche", desc: "Autoriser les moteurs de recherche à indexer votre profil" },
      showInSuggestions: { label: "Suggestions de profil", desc: "Afficher votre profil dans les suggestions d'utilisateurs" },
      allowContactSync: { label: "Synchronisation des contacts", desc: "Autoriser Bambeh à synchroniser vos contacts" },
      whoCanMessage: { label: "Qui peut vous envoyer des messages", desc: "Contrôlez qui peut vous envoyer des messages" },
      readReceipts: { label: "Confirmations de lecture", desc: "Laisser les autres savoir quand vous avez lu leurs messages" },
      typingIndicators: { label: "Indicateurs de saisie", desc: "Afficher lorsque vous écrivez un message" },
      personalizedAds: { label: "Publicités personnalisées", desc: "Voir des publicités adaptées à vos intérêts" },
      dataAnalytics: { label: "Analytiques", desc: "Aider à améliorer Bambeh avec des statistiques d'utilisation" },
      thirdPartySharing: { label: "Partage avec des tiers", desc: "Partager les données avec des services partenaires" }
    }
  },
  pidgin: {
    title: "Privacy Settings",
    subtitle: "Choose people wey you want make dem look your details",
    saveSuccessAlert: "✅ Privacy levels don save clear fine!",
    saveErrorAlert: "❌ Wahala dey, settings no save. Try again.",
    deleteConfirmPrompt: "⚠️ WARNING: This level go delete your account and profile parameters completely. Reverse gear no dey. You dey inside?",
    deleteScheduledAlert: "We don lock your account for deletion. We dey comot you now.",
    dangerZone: "Danger Zone",
    dangerFooter: "This selection get teeth, e go wipe your listings and transaction records finish.",
    deleteBtnText: "Delete My Account Completely",
    cancel: "Cancel",
    saving: "E dey lock am...",
    saveBtn: "Save Settings",
    modalTitle: "Kpai Account?",
    modalDesc: "This thing go scrub your trace, your chats, and uploads from Bambeh street clean off.",
    options: {
      everyone: "Every Person", contacts: "My Contacts Only", nobody: "No Person",
      public: "Public street", friends: "Friends Only", private: "Private Lock",
      exact: "Correct Location", approximate: "Approximate (City)", hidden: "Hide Am"
    },
    sections: { visibility: "Profile Visibility", activity: "Market Activity & History", search: "Search & Street Discovery", messages: "Chating & Contact lines", data: "Data processing & Analytics" },
    items: {
      profileVisibility: { label: "Profile Viewers", desc: "People wey fit open your trader page look your level" },
      showEmail: { label: "Email Box line", desc: "People wey fit look your verified email address" },
      showPhone: { label: "Phone Number line", desc: "Who fit see your contact line for mobile money deal" },
      showLocation: { label: "Your Area Location", desc: "Choose how you want make your town look on top post" },
      showOnlineStatus: { label: "Show Green Light status", desc: "Make buyers see when you dey online live" },
      showListings: { label: "Market Postings", desc: "People wey fit look items wey you display for sale" },
      showPurchaseHistory: { label: "Things Wey You Buy", desc: "Who fit check market items wey you don spend money buy" },
      showReviews: { label: "Stars & Comments written", desc: "Who fit track ratings wey you drop for other traders" },
      showFavorites: { label: "Saved Market Items", desc: "Who fit see items wey you put for your secret heart list" },
      allowSearchEngineIndexing: { label: "Google Indexing visibility", desc: "Allow make Google find your profile for internet" },
      showInSuggestions: { label: "People suggestions panel", desc: "Put your profile for buyer dashboard make dem follow you" },
      allowContactSync: { label: "Phonebook Contacts Sync", desc: "Allow Bambeh read your phonebook match your friends" },
      whoCanMessage: { label: "People Wey Fit Chat You", desc: "Control who get power to drop text line inside your box" },
      readReceipts: { label: "Read Blue Ticks alerts", desc: "Make people know when you don read their chat text" },
      typingIndicators: { label: "Typing... indicator dots", desc: "Show other person say you dey type message reply" },
      personalizedAds: { label: "Custom tailored promos", desc: "See clean market deals wey match things you dey like" },
      dataAnalytics: { label: "App performance analysis", desc: "Help look performance data make Bambeh app run fine" },
      thirdPartySharing: { label: "Partner service connections", desc: "Share layout details with side partner providers" }
    }
  },
  ar: {
    title: "إعدادات الخصوصية",
    subtitle: "التحكم في من يمكنه رؤية معلوماتك الشخصية",
    saveSuccessAlert: "✅ تم حفظ إعدادات الخصوصية بنجاح!",
    saveErrorAlert: "❌ فشل حفظ الإعدادات. يرجى المحاولة مرة أخرى.",
    deleteConfirmPrompt: "⚠️ تحذير: هذا الإجراء سيحذف حسابك وجميع بياناتك نهائياً ولا يمكن التراجع عنه. هل أنت متأكد تماماً؟",
    deleteScheduledAlert: "تم جدولة حسابك للحذف الإجباري. سيتم تسجيل خروجك الآن.",
    dangerZone: "منطقة الخطر",
    dangerFooter: "هذا الإجراء نهائي ولا يمكن التراجع عنه. سيتم مسح كافة البيانات الخاصة بك تماماً.",
    deleteBtnText: "حذف حسابي نهائياً",
    cancel: "إلغاء",
    saving: "جاري الحفظ...",
    saveBtn: "حفظ الإعدادات",
    modalTitle: "حذف الحساب؟",
    modalDesc: "سيؤدي هذا إلى حذف حسابك وإعلاناتك ورسائلك وبياناتك بشكل دائم. لا يمكن التراجع عن هذا الإجراء.",
    options: {
      everyone: "الجميع", contacts: "جهات الاتصال فقط", nobody: "لا أحد",
      public: "عام", friends: "الأصدقاء فقط", private: "خاص",
      exact: "الموقع الدقيق", approximate: "تقريبي (المدينة)", hidden: "مخفي"
    },
    sections: { visibility: "رؤية الملف الشخصي", activity: "النشاط والمحتوى", search: "البحث والاكتشاف", messages: "الرسائل والتواصل", data: "البيانات والتحليلات" },
    items: {
      profileVisibility: { label: "رؤية الملف الشخصي", desc: "من يمكنه رؤية صفحة ملفك الشخصي على المنصة" },
      showEmail: { label: "عنوان البريد الإلكتروني", desc: "من يمكنه رؤية بريدك الإلكتروني المؤكد" },
      showPhone: { label: "رقم الهاتف", desc: "من يمكنه رؤية رقم هاتفك لإتمام المعاملات" },
      showLocation: { label: "الموقع الجغرافي", desc: "تحديد مدى دقة موقعك الجغرافي الظاهر للمستخدمين" },
      showOnlineStatus: { label: "إظهار حالة الاتصال", desc: "السماح للآخرين بمعرفة ما إذا كنت نشطاً الآن" },
      showListings: { label: "الإعلانات والمعروضات", desc: "من يمكنه رؤية السلع التي قمت بنشرها للبيع" },
      showPurchaseHistory: { label: "سجل المشتريات", desc: "من يمكنه رؤية السلع التي قمت بشرائها" },
      showReviews: { label: "المراجعات والتقييمات", desc: "من يمكنه رؤية التقييمات التي كتبتها للآخرين" },
      showFavorites: { label: "المفضلة", desc: "من يمكنه رؤية السلع التي قمت بحفظها" },
      allowSearchEngineIndexing: { label: "الأرشفة في محركات البحث", desc: "السماح لمحركات البحث مثل جوجل بأرشفة ملفك الشخصي" },
      showInSuggestions: { label: "اقتراحات الملف الشخصي", desc: "إظهار حسابك ضمن اقتراحات المستخدمين الآخرين" },
      allowContactSync: { label: "مزامنة جهات الاتصال", desc: "السماح لتطبيق بامبه بمزامنة أرقام جهات الاتصال الخاصة بك" },
      whoCanMessage: { label: "من يمكنه مراسلتك", desc: "التحكم في الأشخاص المسموح لهم ببدء دردشة معك" },
      readReceipts: { label: "مؤشرات قراءة الرسائل", desc: "السماح للآخرين بمعرفة ما إذا كنت قد قرأت رسائلهم" },
      typingIndicators: { label: "مؤشر جاري الكتابة", desc: "إظهار نقط الكتابة عند قيامك بصياغة رد" },
      personalizedAds: { label: "الإعلانات المخصصة", desc: "عرض إعلانات ترويجية تتوافق مع اهتماماتك الشخصية" },
      dataAnalytics: { label: "تحليلات الاستخدام", desc: "مساعدتنا في تحسين تطبيق بامبه عبر إرسال تحليلات استخدام مجهولة" },
      thirdPartySharing: { label: "مشاركة البيانات مع أطراف ثالثة", desc: "مشاركة بعض البيانات مع الخدمات الشريكة المعتمدة" }
    }
  },
  ff: {
    title: "Sirlu & Kisal",
    subtitle: "Suftu andu yimɓe ɓe njiɗ-ɗaa njiya kabaaru maa",
    saveSuccessAlert: "✅ Suftango sirlu resama ko woodi joni!",
    saveErrorAlert: "❌ Ruskama resgo suftango. Tiiɗno eto kadi.",
    deleteConfirmPrompt: "⚠️ ILA: Gollal ngal mumnay andital maa bee data fof sam. Walaa huftinki kadi. A ɗon mari tabat?",
    deleteScheduledAlert: "Andital maa limtaama ngam mumnugol. A wurtinte joni joni.",
    dangerZone: "Lirde Ilarteeri",
    dangerFooter: "Gollal ngal ɗon meema andital maa sam. Data maa fof ɗon lanna.",
    deleteBtnText: "Mumnu Andital am sam",
    cancel: "Fasikna",
    saving: "Ɗon resata...",
    saveBtn: "Resu Waylagol",
    modalTitle: "Mumnu Andital?",
    modalDesc: "Ɗum mumnay andital maa, kuuje njaaraaɗe, nelde winndannde bee kabaaru maa fof. Walaa huftinki.",
    options: {
      everyone: "Yimɓe Fof", contacts: "Contacts am tan", nobody: "Walaa Neɗɗo",
      public: "Haa Jama'are", friends: "Giɗon tan", private: "Sirlu gundo",
      exact: "Innde Nokku Poci", approximate: "Wuro tan", hidden: "Suuɗama"
    },
    sections: { visibility: "Hollugol Andital", activity: "Kuuje & Gollal", search: "Yiytugo & Ɗon", messages: "Nelde & Winndannde", data: "Metrics & Data" },
    items: {
      profileVisibility: { label: "Hollugol Andital", desc: "Yimɓe ɓe mbaaway yiygo andital maa nder gollirde nden" },
      showEmail: { label: "Innde Email maa", desc: "Yimɓe ɓe mbaaway yiygo email address maa tabitinaaɗo" },
      showPhone: { label: "Line Phone Number", desc: "Yimɓe ɓe mbaaway yiygo line phone maa ngam gollal sodgo" },
      showLocation: { label: "Nokku Jottarki maa", desc: "Hollu no njiɗ-ɗaa nokku jottarki maa andiree nder kuuje" },
      showOnlineStatus: { label: "Hollu to a ɗon active", desc: "Accu yimɓe andita andital maa to a ɗon nder app" },
      showListings: { label: "Kuuje njaaraaɗe", desc: "Yimɓe ɓe mbaaway yiygo kuuje sodaaɗe njaaraaɗe maa" },
      showPurchaseHistory: { label: "Andital kuuje coodaaɗe", desc: "Yimɓe ɓe mbaaway yiygo ko cood-ɗaa fof" },
      showReviews: { label: "Stars bee anditande", desc: "Yimɓe ɓe mbaaway yiygo anditande ko mbinnd-ɗaa" },
      showFavorites: { label: "Kuuje Resaaɗe Yiɗaaɗe", desc: "Yimɓe ɓe mbaaway yiygo kuuje njiɗ-ɗaa coodgo yeeso" },
      allowSearchEngineIndexing: { label: "Indexation Google/Search", desc: "Accu engine search andita andital maa haa internet" },
      showInSuggestions: { label: "Profile Suggestions", desc: "Hollu profile maa nder suggestions yimɓe keese" },
      allowContactSync: { label: "Muzamna Contacts", desc: "Accu Bambeh read andita phonebook contacts maa" },
      whoCanMessage: { label: "Yimɓe ɓe mbaaway nelgo maa", desc: "Suftu yimɓe ɓe mbaaway fuɗɗugo chatting bee maa" },
      readReceipts: { label: "Confirmations Nelde", desc: "Accu yimɓe andita andital maa to a jangi nelde maɓɓe" },
      typingIndicators: { label: "Hollu to a ɗon winnda", desc: "Hollu dots to a ɗon winnda jaabi winndannde" },
      personalizedAds: { label: "Yeeyugo Custom", desc: "Yiy kuuje yeeyugo pottuɗe e ko njiɗ-ɗaa anditugo" },
      dataAnalytics: { label: "Analytics Data", desc: "Wallu hesɗitinki Bambeh bee andital metrics usage" },
      thirdPartySharing: { label: "Muzamna Data bee Ɓee", desc: "Accu gollal data gundo bee gollirɗe banndiraawo" }
    }
  }
};

export default function PrivacySettingsModal({ onClose }: PrivacySettingsModalProps) {
  const { language } = useLanguage();
  
  const lang: Lang = (language in S ? language : "en") as Lang;
  const s = S[lang];
  const isRtl = lang === "ar";

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
  const [isSaving, setIsSaving] = useState(false);
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
      alert(s.saveSuccessAlert);
      onClose();
    } catch (error) {
      console.error('Error saving settings:', error);
      alert(s.saveErrorAlert);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm(s.deleteConfirmPrompt)) {
      localStorage.clear();
      alert(s.deleteScheduledAlert);
      window.location.href = '/';
    }
  };

  const visibilityOptions = [
    { value: 'everyone', label: s.options.everyone },
    { value: 'contacts', label: s.options.contacts },
    { value: 'nobody',   label: s.options.nobody },
  ];

  const PrivacySelect = ({
    itemKey, options,
  }: {
    itemKey: string;
    options: { value: string; label: string }[];
  }) => {
    const itemStrings = s.items[itemKey] || { label: itemKey, desc: "" };
    const value = (settings as any)[itemKey];

    return (
      <div className="py-3 border-b border-gray-100 last:border-0">
        <div className="flex items-start justify-between gap-4">
          <div className={`flex-1 ${isRtl ? 'text-right' : 'text-left'}`}>
            <p className="font-semibold text-gray-900 text-sm">{itemStrings.label}</p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{itemStrings.desc}</p>
          </div>
          <select 
            value={value} 
            onChange={(e) => handleSelectChange(itemKey, e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:outline-none"
          >
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
      </div>
    );
  };

  const PrivacyToggle = ({
    itemKey,
  }: {
    itemKey: string;
  }) => {
    const itemStrings = s.items[itemKey] || { label: itemKey, desc: "" };
    const checked = (settings as any)[itemKey] ?? false;

    return (
      <div className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0">
        <div className={`flex-1 ${isRtl ? 'pl-4 pr-0' : 'pr-4 pl-0'}`}>
          <p className="font-semibold text-gray-900 text-sm">{itemStrings.label}</p>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{itemStrings.desc}</p>
        </div>
        <button type="button" onClick={() => handleToggle(itemKey)}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-teal-600' : 'bg-gray-200'}`}>
          <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? (isRtl ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'}`} />
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div dir={isRtl ? "rtl" : "ltr"} className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 text-start overflow-hidden flex flex-col">
        
        {/* Header section layout */}
        <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg"><Shield className="w-6 h-6" /></div>
              <div>
                <h2 className="text-xl font-bold">{s.title}</h2>
                <p className="text-teal-100 text-xs mt-0.5">{s.subtitle}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors focus:outline-none"><X className="w-6 h-6" /></button>
          </div>
        </div>

        {/* Outer body contextual container */}
        <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
          
          {/* Section: Visibility */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2 border-b border-gray-100 pb-2">
              <Eye className="w-4 h-4 text-teal-600" />{s.sections.visibility}
            </h3>
            <div className="bg-gray-50 rounded-xl px-4 py-1">
              <PrivacySelect itemKey="profileVisibility" options={[{ value: 'public', label: s.options.public }, { value: 'friends', label: s.options.friends }, { value: 'private', label: s.options.private }]} />
              <PrivacySelect itemKey="showEmail" options={visibilityOptions} />
              <PrivacySelect itemKey="showPhone" options={visibilityOptions} />
              <PrivacySelect itemKey="showLocation" options={[{ value: 'everyone', label: s.options.exact }, { value: 'approximate', label: s.options.approximate }, { value: 'nobody', label: s.options.hidden }]} />
              <PrivacyToggle itemKey="showOnlineStatus" />
            </div>
          </div>

          {/* Section: Activity */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">{s.sections.activity}</h3>
            <div className="bg-gray-50 rounded-xl px-4 py-1">
              <PrivacySelect itemKey="showListings" options={visibilityOptions} />
              <PrivacySelect itemKey="showPurchaseHistory" options={visibilityOptions} />
              <PrivacySelect itemKey="showReviews" options={visibilityOptions} />
              <PrivacySelect itemKey="showFavorites" options={visibilityOptions} />
            </div>
          </div>

          {/* Section: Search Engine parameters */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">{s.sections.search}</h3>
            <div className="bg-gray-50 rounded-xl px-4 py-1">
              <PrivacyToggle itemKey="allowSearchEngineIndexing" />
              <PrivacyToggle itemKey="showInSuggestions" />
              <PrivacyToggle itemKey="allowContactSync" />
            </div>
          </div>

          {/* Section: Messaging parameters */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">{s.sections.messages}</h3>
            <div className="bg-gray-50 rounded-xl px-4 py-1">
              <PrivacySelect itemKey="whoCanMessage" options={visibilityOptions} />
              <PrivacyToggle itemKey="readReceipts" />
              <PrivacyToggle itemKey="typingIndicators" />
            </div>
          </div>

          {/* Section: Custom analytics tracking */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">{s.sections.data}</h3>
            <div className="bg-gray-50 rounded-xl px-4 py-1">
              <PrivacyToggle itemKey="personalizedAds" />
              <PrivacyToggle itemKey="dataAnalytics" />
              <PrivacyToggle itemKey="thirdPartySharing" />
            </div>
          </div>

          {/* Danger zone panel configuration */}
          <div className="border-t border-red-100 pt-5">
            <h3 className="text-sm font-bold text-red-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />{s.dangerZone}
            </h3>
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 space-y-3">
              <button type="button" onClick={() => setShowDeleteConfirm(true)}
                className="w-full px-4 py-3 bg-white border border-red-200 text-red-600 rounded-xl hover:bg-red-100/50 font-bold text-xs transition-colors flex items-center justify-center gap-2 focus:outline-none">
                <Trash2 className="w-4 h-4" />{s.deleteBtnText}
              </button>
              <p className="text-[11px] text-red-700 text-center font-medium leading-relaxed">{s.dangerFooter}</p>
            </div>
          </div>
        </div>

        {/* Footer cancellation and save block */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex-shrink-0">
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors focus:outline-none">
              {s.cancel}
            </button>
            <button type="button" onClick={handleSave} disabled={isSaving}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg font-bold text-sm hover:from-teal-700 hover:to-teal-700 transition-all disabled:opacity-40 flex items-center justify-center gap-2 focus:outline-none">
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{s.saving}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{s.saveBtn}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Delete account overlay confirmation layer */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
          <div dir={isRtl ? "rtl" : "ltr"} className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-start">
            <div className="text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{s.modalTitle}</h3>
              <p className="text-xs text-gray-500 mb-6 leading-relaxed font-medium">{s.modalDesc}</p>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-xs hover:bg-gray-200 transition-colors focus:outline-none">
                  {s.cancel}
                </button>
                <button type="button" onClick={handleDeleteAccount} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-bold text-xs hover:bg-red-700 transition-colors focus:outline-none">
                  {s.deleteBtnText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}