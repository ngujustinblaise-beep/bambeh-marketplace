import { Link } from "react-router-dom";
import { Search, BookOpen, Video, MessageCircle, FileText, Shield, ShoppingBag } from "lucide-react";
import { useLang } from '@/hooks/useAppLang';

const T: Record<string, Record<string, string>> = {
  "en": {
    "helpCenter": "Help Center",
    "findAnswers": "Find answers to your questions",
    "searchPlaceholder": "Search help articles...",
    "contactSupport": "Contact Support",
    "videoTutorials": "Video Tutorials",
    "browseGuides": "Browse Guides",
    "catGettingStarted": "Getting Started",
    "catBuyingSelling": "Buying & Selling",
    "catSafetySecurity": "Safety & Security",
    "linkCreatingAccount": "Creating an Account",
    "linkProfileSetup": "Profile Setup",
    "linkHowToPost": "How to Post an Ad",
    "linkSettingPrice": "Setting the Right Price",
    "linkPaymentMethods": "Payment Methods",
    "linkAvoidingScams": "Avoiding Scams",
    "linkMeetingSafely": "Meeting Safely",
    "linkReportingIssues": "Reporting Issues"
  },
  "fr": {
    "helpCenter": "Centre d'aide",
    "findAnswers": "Trouvez des réponses à vos questions",
    "searchPlaceholder": "Rechercher des articles d'aide...",
    "contactSupport": "Contacter le support",
    "videoTutorials": "Tutoriels vidéo",
    "browseGuides": "Parcourir les guides",
    "catGettingStarted": "Pour commencer",
    "catBuyingSelling": "Acheter et vendre",
    "catSafetySecurity": "Sûreté et sécurité",
    "linkCreatingAccount": "Créer un compte",
    "linkProfileSetup": "Configuration du profil",
    "linkHowToPost": "Comment publier une annonce",
    "linkSettingPrice": "Fixer le bon prix",
    "linkPaymentMethods": "Moyens de paiement",
    "linkAvoidingScams": "Éviter les arnaques",
    "linkMeetingSafely": "Se rencontrer en sécurité",
    "linkReportingIssues": "Signaler des problèmes"
  },
  "pidgin": {
    "helpCenter": "Help Center",
    "findAnswers": "Find answer for your question dem",
    "searchPlaceholder": "Search help article dem...",
    "contactSupport": "Contact Support",
    "videoTutorials": "Video Tutorial dem",
    "browseGuides": "Look Guide dem",
    "catGettingStarted": "How to Start",
    "catBuyingSelling": "Buy & Sell",
    "catSafetySecurity": "Safety & Security",
    "linkCreatingAccount": "How to Open Account",
    "linkProfileSetup": "Profile Setup",
    "linkHowToPost": "How to Post Ad",
    "linkSettingPrice": "Set di Right Price",
    "linkPaymentMethods": "Payment Method dem",
    "linkAvoidingScams": "How to Avoid Scam",
    "linkMeetingSafely": "Meet Safe",
    "linkReportingIssues": "Report Problem dem"
  },
  "ar": {
    "helpCenter": "مركز المساعدة",
    "findAnswers": "اعثر على إجابات لأسئلتك",
    "searchPlaceholder": "ابحث Ùي مقالات المساعدة...",
    "contactSupport": "تواصل مع الدعم",
    "videoTutorials": "دروس Ùيديو",
    "browseGuides": "تصÙّح الأدلة",
    "catGettingStarted": "البدء",
    "catBuyingSelling": "البيع والشراء",
    "catSafetySecurity": "السلامة والأمان",
    "linkCreatingAccount": "إنشاء حساب",
    "linkProfileSetup": "إعداد الملÙ الشخصي",
    "linkHowToPost": "كيÙية نشر إعلان",
    "linkSettingPrice": "تحديد السعر المناسب",
    "linkPaymentMethods": "طرق الدÙع",
    "linkAvoidingScams": "تجنّب الاحتيال",
    "linkMeetingSafely": "اللقاء بأمان",
    "linkReportingIssues": "الإبلاغ عن المشكلات"
  },
  "ff": {
    "helpCenter": "Galle ballal",
    "findAnswers": "Yiytu jaabaaji naamne maa",
    "searchPlaceholder": "Yiylo binndi ballal...",
    "contactSupport": "Heɓ ballal",
    "videoTutorials": "Jannde wideyo",
    "browseGuides": "Ƴeew peeje",
    "catGettingStarted": "Fuɗɗorde",
    "catBuyingSelling": "Soodgol e yeeygol",
    "catSafetySecurity": "Kisal e hisnde",
    "linkCreatingAccount": "Sosgol konte",
    "linkProfileSetup": "Hebbingol humpito",
    "linkHowToPost": "No neldirtee jeeyngal",
    "linkSettingPrice": "Teelgol coggu moƴƴu",
    "linkPaymentMethods": "Mbaydiiji yoɓgol",
    "linkAvoidingScams": "Woɗɗitagol nguyka",
    "linkMeetingSafely": "Hawrugol e kisal",
    "linkReportingIssues": "Ƴeewtagol caɗeele"
  }
};

export default function Help() {
  const currentLang = useLang();
    const lang = T[currentLang] ? currentLang : "en";
    const tr = (k: string) => (T[lang] && T[lang][k]) || T.en[k] || k;
    const isRtl = lang === "ar";
  const categories = [
    { titleKey: "catGettingStarted", icon: BookOpen, color: "from-blue-500 to-blue-700", links: [
      { nameKey: "linkCreatingAccount", path: "/help/creating-account" },
      { nameKey: "linkProfileSetup", path: "/help/profile-setup" },
    ] },
    { titleKey: "catBuyingSelling", icon: ShoppingBag, color: "from-green-500 to-green-700", links: [
      { nameKey: "linkHowToPost", path: "/help/how-to-post-ad" },
      { nameKey: "linkSettingPrice", path: "/help/setting-right-price" },
      { nameKey: "linkPaymentMethods", path: "/help/payment-methods" },
    ] },
    { titleKey: "catSafetySecurity", icon: Shield, color: "from-red-500 to-red-700", links: [
      { nameKey: "linkAvoidingScams", path: "/help/avoiding-scams" },
      { nameKey: "linkMeetingSafely", path: "/help/meeting-safely" },
      { nameKey: "linkReportingIssues", path: "/help/reporting-issues" },
    ] },
  ];
  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-gradient-to-r from-teal-600 to-teal-800 text-white rounded-2xl p-8 mb-8">
          <h1 className="text-5xl font-bold mb-4">{tr("helpCenter")}</h1>
          <p className="text-xl text-teal-100 mb-6">{tr("findAnswers")}</p>
          <div className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder={tr("searchPlaceholder")} className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link to="/help/contact" className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 text-center group">
            <MessageCircle className="w-12 h-12 text-teal-600 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-2">{tr("contactSupport")}</h3>
          </Link>
          <Link to="/help/video-tutorials" className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 text-center group">
            <Video className="w-12 h-12 text-teal-600 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-2">{tr("videoTutorials")}</h3>
          </Link>
          <Link to="/help/guides" className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 text-center group">
            <FileText className="w-12 h-12 text-teal-600 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-2">{tr("browseGuides")}</h3>
          </Link>
        </div>

        <div className="space-y-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.titleKey} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className={`bg-gradient-to-r ${category.color} text-white p-6`}>
                  <div className="flex items-center gap-3">
                    <Icon className="w-8 h-8" />
                    <h2 className="text-2xl font-bold">{tr(category.titleKey)}</h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {category.links.map((link) => (
                      <Link key={link.path} to={link.path} className="flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg">
                        <span className="text-gray-700">{tr(link.nameKey)}</span>
                        <span className="ml-auto text-gray-400">→</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}






