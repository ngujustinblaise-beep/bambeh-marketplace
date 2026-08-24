import { Link } from "react-router-dom";
import { PlusCircle, Image, FileText, MapPin } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const T: Record<string, Record<string, string>> = {
  "en": {
    "title": "How to Post an Ad",
    "subtitle": "Create listings that sell",
    "s1Title": "Choose Category",
    "s1Desc": "Select the most appropriate category for your item",
    "s2Title": "Add Photos",
    "s2Desc": "Upload clear, well-lit photos from multiple angles",
    "proTipLabel": "Pro Tip:",
    "proTip": "Listings with 5+ photos get 3x more views!",
    "s3Title": "Write Description",
    "s3Desc": "Include key details like condition, specifications, and features",
    "s4Title": "Set Location",
    "s4Desc": "Add your location to help buyers find you",
    "earnTitle": "Earn Zerm Coins",
    "earnDesc": "Get 2 Zerm Coins for each approved listing!",
    "back": "Back to Help Center"
  },
  "fr": {
    "title": "Comment publier une annonce",
    "subtitle": "Créez des annonces qui se vendent",
    "s1Title": "Choisir une catégorie",
    "s1Desc": "Sélectionnez la catégorie la plus appropriée pour votre article",
    "s2Title": "Ajouter des photos",
    "s2Desc": "Téléchargez des photos nettes et bien éclairées sous plusieurs angles",
    "proTipLabel": "Astuce :",
    "proTip": "Les annonces avec 5 photos ou plus obtiennent 3 fois plus de vues !",
    "s3Title": "Rédiger une description",
    "s3Desc": "Incluez les détails clés comme l'état, les spécifications et les caractéristiques",
    "s4Title": "Définir la localisation",
    "s4Desc": "Ajoutez votre localisation pour aider les acheteurs à vous trouver",
    "earnTitle": "Gagnez des Zerm Coins",
    "earnDesc": "Recevez 2 Zerm Coins pour chaque annonce approuvée !",
    "back": "Retour au centre d'aide"
  },
  "pidgin": {
    "title": "How to Post Ad",
    "subtitle": "Make listing wey go sell",
    "s1Title": "Choose Category",
    "s1Desc": "Pick di category wey fit your item pass",
    "s2Title": "Add Photo dem",
    "s2Desc": "Put clear photo dem wey get good light from plenty angle",
    "proTipLabel": "Pro Tip:",
    "proTip": "Listing wey get 5 photo or more dey get 3x more view!",
    "s3Title": "Write Description",
    "s3Desc": "Put di important details like condition, specification, and feature dem",
    "s4Title": "Set Location",
    "s4Desc": "Add your location so buyer dem fit find you",
    "earnTitle": "Earn Zerm Coins",
    "earnDesc": "Get 2 Zerm Coins for each listing wey dem approve!",
    "back": "Go back to Help Center"
  },
  "ar": {
    "title": "كيفية نشر إعلان",
    "subtitle": "أنشئ إعلانات تبيع",
    "s1Title": "اختر الفئة",
    "s1Desc": "اختر الفئة الأنسب لسلعتك",
    "s2Title": "أضف الصور",
    "s2Desc": "ارفع صورًا واضحة وجيدة الإضاءة من عدة زوايا",
    "proTipLabel": "نصيحة:",
    "proTip": "الإعلانات التي تحتوي على 5 صور أو أكثر تحصل على مشاهدات أكثر بـ3 مرات!",
    "s3Title": "اكتب الوصف",
    "s3Desc": "أدرج التفاصيل المهمة مثل الحالة والمواصفات والميزات",
    "s4Title": "حدد الموقع",
    "s4Desc": "أضف موقعك لمساعدة المشترين على العثور عليك",
    "earnTitle": "اكسب Zerm Coins",
    "earnDesc": "احصل على 2 Zerm Coins لكل إعلان تتم الموافقة عليه!",
    "back": "العودة إلى مركز المساعدة"
  },
  "ff": {
    "title": "No neldirtee jeeyngal",
    "subtitle": "Sos jeeyle ɗe coottata",
    "s1Title": "Suɓo dental",
    "s1Desc": "Suɓo dental ngal ɓuri haantude kaake maa",
    "s2Title": "Ɓeydu natal",
    "s2Desc": "Loowu natalji laaɓuɗi, jalbuɗi, immorde e nokkuuje keewɗe",
    "proTipLabel": "Waaju:",
    "proTip": "Jeeyle jogiiɗe natalji 5 walla ɓuri njogii yiyannde laaɓi 3!",
    "s3Title": "Winndu sifa",
    "s3Desc": "Naatnu kuyngal himmungal wano alhaali, sifaaji, e keɓe",
    "s4Title": "Teelgol nokkuure",
    "s4Desc": "Ɓeydu nokkuure maa ngam wallude soodooɓe yiytude ma",
    "earnTitle": "Heɓ Zerm Coins",
    "earnDesc": "Heɓ Zerm Coins 2 e kala jeeyngal jaɓaangal!",
    "back": "Rutto to galle ballal"
  }
};

export default function HowToPostAd() {
  const { language } = useLanguage();
  const lang = T[language] ? language : "en";
  const tr = (k: string) => (T[lang] && T[lang][k]) || T.en[k] || k;
  const isRtl = lang === "ar";
  const steps = [
    { n: 1, titleKey: "s1Title", descKey: "s1Desc" },
    { n: 2, titleKey: "s2Title", descKey: "s2Desc" },
    { n: 3, titleKey: "s3Title", descKey: "s3Desc" },
    { n: 4, titleKey: "s4Title", descKey: "s4Desc" },
  ];
  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-gradient-to-r from-teal-600 to-green-600 text-white rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3">
            <PlusCircle className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold">{tr("title")}</h1>
              <p className="text-teal-100">{tr("subtitle")}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          {steps.map((s) => (
            <div key={s.n}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm">{s.n}</span>
                {tr(s.titleKey)}
              </h2>
              <p className="text-gray-600 ml-10">{tr(s.descKey)}</p>
              {s.n === 2 && (
                <div className="ml-10 mt-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    <strong>{tr("proTipLabel")}</strong> {tr("proTip")}
                  </p>
                </div>
              )}
            </div>
          ))}

          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mt-8">
            <h3 className="font-bold text-gray-900 mb-3">🪙 {tr("earnTitle")}</h3>
            <p className="text-gray-700">{tr("earnDesc")}</p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link to="/help" className="text-teal-600 hover:text-teal-700 font-semibold">
            ← {tr("back")}
          </Link>
        </div>
      </div>
    </div>
  );
}




