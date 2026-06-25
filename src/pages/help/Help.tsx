import { Link } from "react-router-dom";
import { Search, BookOpen, Video, MessageCircle, FileText, Shield, ShoppingBag } from "lucide-react";
import { useLanguage } from "@/App";

type Lang = "en" | "fr" | "pidgin" | "ar" | "ff";
const T: Record<Lang, Record<string,string>> = {
  en: { hub:"Help Center", find:"Find answers to your questions", searchPh:"Search help articles...",
    contact:"Contact Support", videos:"Video Tutorials", guides:"Browse Guides",
    gs:"Getting Started", bs:"Buying & Selling", ss:"Safety & Security",
    createAcc:"Creating an Account", profile:"Profile Setup", postAd:"How to Post an Ad", price:"Setting the Right Price", pay:"Payment Methods", scams:"Avoiding Scams", meet:"Meeting Safely", report:"Reporting Issues" },
  fr: { hub:"Centre d'aide", find:"Trouvez des r\u00E9ponses \u00E0 vos questions", searchPh:"Rechercher des articles d'aide...",
    contact:"Nous contacter", videos:"Tutoriels vid\u00E9o", guides:"Parcourir les guides",
    gs:"Pour commencer", bs:"Acheter et vendre", ss:"S\u00FBret\u00E9 et s\u00E9curit\u00E9",
    createAcc:"Cr\u00E9er un compte", profile:"Configuration du profil", postAd:"Comment publier une annonce", price:"Fixer le bon prix", pay:"Moyens de paiement", scams:"\u00C9viter les arnaques", meet:"Se rencontrer en s\u00E9curit\u00E9", report:"Signaler des probl\u00E8mes" },
  pidgin: { hub:"Help Center", find:"Find answer to your question dem", searchPh:"Search help article dem...",
    contact:"Call Us", videos:"Video Tutorials", guides:"Check Guides",
    gs:"How to Start", bs:"Buy & Sell", ss:"Safety & Security",
    createAcc:"How to Open Account", profile:"Profile Setup", postAd:"How to Post Ad", price:"Set di Right Price", pay:"Payment Method dem", scams:"How to Avoid Scam", meet:"Meet Safe", report:"Report Problem dem" },
  ar: { hub:"\u0645\u0631\u0643\u0632 \u0627\u0644\u0645\u0633\u0627\u0639\u062F\u0629", find:"\u0627\u0628\u062D\u062B \u0639\u0646 \u0625\u062C\u0627\u0628\u0627\u062A \u0644\u0623\u0633\u0626\u0644\u062A\u0643", searchPh:"\u0627\u0628\u062D\u062B \u0641\u064A \u0645\u0642\u0627\u0644\u0627\u062A \u0627\u0644\u0645\u0633\u0627\u0639\u062F\u0629...",
    contact:"\u0627\u062A\u0635\u0644 \u0628\u0646\u0627", videos:"\u0627\u0644\u062F\u0631\u0648\u0633 \u0627\u0644\u0645\u0635\u0648\u0631\u0629", guides:"\u062A\u0635\u0641\u0651\u062D \u0627\u0644\u0623\u062F\u0644\u0651\u0629",
    gs:"\u0627\u0644\u0628\u062F\u0621", bs:"\u0627\u0644\u0628\u064A\u0639 \u0648\u0627\u0644\u0634\u0631\u0627\u0621", ss:"\u0627\u0644\u0633\u0644\u0627\u0645\u0629 \u0648\u0627\u0644\u0623\u0645\u0627\u0646",
    createAcc:"\u0625\u0646\u0634\u0627\u0621 \u062D\u0633\u0627\u0628", profile:"\u0625\u0639\u062F\u0627\u062F \u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0634\u062E\u0635\u064A", postAd:"\u0643\u064A\u0641\u064A\u0629 \u0646\u0634\u0631 \u0625\u0639\u0644\u0627\u0646", price:"\u062A\u062D\u062F\u064A\u062F \u0627\u0644\u0633\u0639\u0631 \u0627\u0644\u0645\u0646\u0627\u0633\u0628", pay:"\u0637\u0631\u0642 \u0627\u0644\u062F\u0641\u0639", scams:"\u062A\u062C\u0646\u0651\u0628 \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0644", meet:"\u0627\u0644\u0644\u0642\u0627\u0621 \u0628\u0623\u0645\u0627\u0646", report:"\u0627\u0644\u0625\u0628\u0644\u0627\u063A \u0639\u0646 \u0627\u0644\u0645\u0634\u0643\u0644\u0627\u062A" },
  ff: { hub:"Galle ballal", find:"\u01B4eewndo jaabawuuji \u0257o nai\u0301i\u0301 maa", searchPh:"\u01B4eewndo binndi ballal...",
    contact:"Kontakta Amen", videos:"Jannde widewooji", guides:"\u01B4eew gardanleeji",
    gs:"Fu\u0257\u0257orde", bs:"Soodgol e yeeygol", ss:"Kisal e hisnde",
    createAcc:"Sosgol konte", profile:"Hesɗitingol profil", postAd:"No neldirtee jeeyngal", price:"Teelgol coggu mo\u01B4\u01B4u", pay:"Mbaydiiji yoɓgol", scams:"Wo\u0257\u0257itagol nguyka", meet:"Hawrugol e kisal", report:"\u01B4eewtagol caɗeele" },
};

export default function Help() {
  const { language } = useLanguage();
  const lang: Lang = (["en","fr","pidgin","ar","ff"].includes(language) ? language : "en") as Lang;
  const tr = (k:string) => T[lang][k] || T.en[k] || k;
  const isRtl = lang === "ar";
  const categories = [
    { titleKey:"gs", icon: BookOpen, color:"from-blue-500 to-blue-700", links:[
      { nameKey:"createAcc", path:"/help/creating-account" },
      { nameKey:"profile", path:"/help/profile-setup" } ] },
    { titleKey:"bs", icon: ShoppingBag, color:"from-green-500 to-green-700", links:[
      { nameKey:"postAd", path:"/help/how-to-post-ad" },
      { nameKey:"price", path:"/help/setting-right-price" },
      { nameKey:"pay", path:"/help/payment-methods" } ] },
    { titleKey:"ss", icon: Shield, color:"from-red-500 to-red-700", links:[
      { nameKey:"scams", path:"/help/avoiding-scams" },
      { nameKey:"meet", path:"/help/meeting-safely" },
      { nameKey:"report", path:"/help/reporting-issues" } ] },
  ];
  return (
    <div dir={isRtl ? "rtl":"ltr"} className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-gradient-to-r from-teal-600 to-teal-800 text-white rounded-2xl p-8 mb-8">
          <h1 className="text-5xl font-bold mb-4">{tr("hub")}</h1>
          <p className="text-xl text-teal-100 mb-6">{tr("find")}</p>
          <div className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder={tr("searchPh")} className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link to="/help/contact" className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 text-center group">
            <MessageCircle className="w-12 h-12 text-teal-600 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-2">{tr("contact")}</h3>
          </Link>
          <Link to="/help/video-tutorials" className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 text-center group">
            <Video className="w-12 h-12 text-teal-600 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-2">{tr("videos")}</h3>
          </Link>
          <Link to="/help/guides" className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 text-center group">
            <FileText className="w-12 h-12 text-teal-600 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-2">{tr("guides")}</h3>
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
                        <span className="ml-auto text-gray-400">{"\u2192"}</span>
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
