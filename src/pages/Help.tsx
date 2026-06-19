import { Link } from "react-router-dom";
import { Search, BookOpen, Video, MessageCircle, FileText, Shield, ShoppingBag } from "lucide-react";
import { useLanguage } from "@/App";

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
    "findAnswers": "Trouvez des rÃ©ponses Ã  vos questions",
    "searchPlaceholder": "Rechercher des articles d'aide...",
    "contactSupport": "Contacter le support",
    "videoTutorials": "Tutoriels vidÃ©o",
    "browseGuides": "Parcourir les guides",
    "catGettingStarted": "Pour commencer",
    "catBuyingSelling": "Acheter et vendre",
    "catSafetySecurity": "SÃ»retÃ© et sÃ©curitÃ©",
    "linkCreatingAccount": "CrÃ©er un compte",
    "linkProfileSetup": "Configuration du profil",
    "linkHowToPost": "Comment publier une annonce",
    "linkSettingPrice": "Fixer le bon prix",
    "linkPaymentMethods": "Moyens de paiement",
    "linkAvoidingScams": "Ã‰viter les arnaques",
    "linkMeetingSafely": "Se rencontrer en sÃ©curitÃ©",
    "linkReportingIssues": "Signaler des problÃ¨mes"
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
    "helpCenter": "Ù…Ø±ÙƒØ² Ø§Ù„Ù…Ø³Ø§Ø¹Ø¯Ø©",
    "findAnswers": "Ø§Ø¹Ø«Ø± Ø¹Ù„Ù‰ Ø¥Ø¬Ø§Ø¨Ø§Øª Ù„Ø£Ø³Ø¦Ù„ØªÙƒ",
    "searchPlaceholder": "Ø§Ø¨Ø­Ø« ÙÙŠ Ù…Ù‚Ø§Ù„Ø§Øª Ø§Ù„Ù…Ø³Ø§Ø¹Ø¯Ø©...",
    "contactSupport": "ØªÙˆØ§ØµÙ„ Ù…Ø¹ Ø§Ù„Ø¯Ø¹Ù…",
    "videoTutorials": "Ø¯Ø±ÙˆØ³ ÙÙŠØ¯ÙŠÙˆ",
    "browseGuides": "ØªØµÙÙ‘Ø­ Ø§Ù„Ø£Ø¯Ù„Ø©",
    "catGettingStarted": "Ø§Ù„Ø¨Ø¯Ø¡",
    "catBuyingSelling": "Ø§Ù„Ø¨ÙŠØ¹ ÙˆØ§Ù„Ø´Ø±Ø§Ø¡",
    "catSafetySecurity": "Ø§Ù„Ø³Ù„Ø§Ù…Ø© ÙˆØ§Ù„Ø£Ù…Ø§Ù†",
    "linkCreatingAccount": "Ø¥Ù†Ø´Ø§Ø¡ Ø­Ø³Ø§Ø¨",
    "linkProfileSetup": "Ø¥Ø¹Ø¯Ø§Ø¯ Ø§Ù„Ù…Ù„Ù Ø§Ù„Ø´Ø®ØµÙŠ",
    "linkHowToPost": "ÙƒÙŠÙÙŠØ© Ù†Ø´Ø± Ø¥Ø¹Ù„Ø§Ù†",
    "linkSettingPrice": "ØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ø³Ø¹Ø± Ø§Ù„Ù…Ù†Ø§Ø³Ø¨",
    "linkPaymentMethods": "Ø·Ø±Ù‚ Ø§Ù„Ø¯ÙØ¹",
    "linkAvoidingScams": "ØªØ¬Ù†Ù‘Ø¨ Ø§Ù„Ø§Ø­ØªÙŠØ§Ù„",
    "linkMeetingSafely": "Ø§Ù„Ù„Ù‚Ø§Ø¡ Ø¨Ø£Ù…Ø§Ù†",
    "linkReportingIssues": "Ø§Ù„Ø¥Ø¨Ù„Ø§Øº Ø¹Ù† Ø§Ù„Ù…Ø´ÙƒÙ„Ø§Øª"
  },
  "ff": {
    "helpCenter": "Galle ballal",
    "findAnswers": "Yiytu jaabaaji naamne maa",
    "searchPlaceholder": "Yiylo binndi ballal...",
    "contactSupport": "HeÉ“ ballal",
    "videoTutorials": "Jannde wideyo",
    "browseGuides": "Æ³eew peeje",
    "catGettingStarted": "FuÉ—É—orde",
    "catBuyingSelling": "Soodgol e yeeygol",
    "catSafetySecurity": "Kisal e hisnde",
    "linkCreatingAccount": "Sosgol konte",
    "linkProfileSetup": "Hebbingol humpito",
    "linkHowToPost": "No neldirtee jeeyngal",
    "linkSettingPrice": "Teelgol coggu moÆ´Æ´u",
    "linkPaymentMethods": "Mbaydiiji yoÉ“gol",
    "linkAvoidingScams": "WoÉ—É—itagol nguyka",
    "linkMeetingSafely": "Hawrugol e kisal",
    "linkReportingIssues": "Æ³eewtagol caÉ—eele"
  }
};

export default function Help() {
  const { language } = useLanguage();
  const lang = T[language] ? language : "en";
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
                        <span className="ml-auto text-gray-400">â†’</span>
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
