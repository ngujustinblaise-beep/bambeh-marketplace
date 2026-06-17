import { Link } from "react-router-dom";
import { User } from "lucide-react";
import { useLanguage } from "@/App";

const T: Record<string, Record<string, string>> = {
  "en": {
    "title": "Profile Setup",
    "subtitle": "Make a great first impression",
    "complete": "Complete Your Profile",
    "addPhoto": "Add a Profile Photo",
    "photoViews": "Profiles with photos get 5x more views!",
    "writeBio": "Write Your Bio",
    "tellAbout": "Tell people about yourself",
    "getVerified": "Get Verified",
    "verifyPhone": "Verify your phone number for trust",
    "back": "Back to Help Center"
  },
  "fr": {
    "title": "Configuration du profil",
    "subtitle": "Faites une excellente première impression",
    "complete": "Complétez votre profil",
    "addPhoto": "Ajoutez une photo de profil",
    "photoViews": "Les profils avec photo sont vus 5 fois plus !",
    "writeBio": "Rédigez votre bio",
    "tellAbout": "Parlez de vous aux autres",
    "getVerified": "Faites-vous vérifier",
    "verifyPhone": "Vérifiez votre numéro de téléphone pour inspirer confiance",
    "back": "Retour au centre d'aide"
  },
  "pidgin": {
    "title": "Profile Setup",
    "subtitle": "Make your first impression strong",
    "complete": "Complete Your Profile",
    "addPhoto": "Add Profile Photo",
    "photoViews": "Profile wey get photo dey get 5x more views!",
    "writeBio": "Write Your Bio",
    "tellAbout": "Tell people about yourself",
    "getVerified": "Get Verified",
    "verifyPhone": "Verify your phone number so people fit trust you",
    "back": "Go back to Help Center"
  },
  "ar": {
    "title": "إعداد الملف الشخصي",
    "subtitle": "اترك انطباعًا أولًا رائعًا",
    "complete": "أكمل ملفك الشخصي",
    "addPhoto": "أضف صورة للملف الشخصي",
    "photoViews": "الملفات التي تحتوي على صورة تحصل على مشاهدات أكثر بـ5 مرات!",
    "writeBio": "اكتب نبذتك",
    "tellAbout": "عرّف الناس بنفسك",
    "getVerified": "وثّق حسابك",
    "verifyPhone": "وثّق رقم هاتفك لكسب الثقة",
    "back": "العودة إلى مركز المساعدة"
  },
  "ff": {
    "title": "Hebbingol humpito",
    "subtitle": "Waɗu jaɓɓorgal moƴƴal",
    "complete": "Timmin humpito maa",
    "addPhoto": "Ɓeydu natal humpito",
    "photoViews": "Humpitooji jogiiɗi natal njogii yiyannde laabi 5 ɓuri!",
    "writeBio": "Winndu bio maa",
    "tellAbout": "Haalan yimɓe fii maa",
    "getVerified": "Heɓ teeŋtingol",
    "verifyPhone": "Teeŋtin limoore cinndel maa ngam hoolaare",
    "back": "Rutto to galle ballal"
  }
};

export default function ProfileSetup() {
  const { language } = useLanguage();
  const lang = T[language] ? language : "en";
  const tr = (k: string) => (T[lang] && T[lang][k]) || T.en[k] || k;
  const isRtl = lang === "ar";
  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3">
            <User className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold">{tr("title")}</h1>
              <p className="text-purple-100">{tr("subtitle")}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{tr("complete")}</h2>
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 border-l-4 border-purple-600">
                <h3 className="font-bold text-gray-900 mb-2">📸 {tr("addPhoto")}</h3>
                <p className="text-gray-700">{tr("photoViews")}</p>
              </div>
              <div className="p-4 bg-purple-50 border-l-4 border-purple-600">
                <h3 className="font-bold text-gray-900 mb-2">✍️ {tr("writeBio")}</h3>
                <p className="text-gray-700">{tr("tellAbout")}</p>
              </div>
              <div className="p-4 bg-purple-50 border-l-4 border-purple-600">
                <h3 className="font-bold text-gray-900 mb-2">✅ {tr("getVerified")}</h3>
                <p className="text-gray-700">{tr("verifyPhone")}</p>
              </div>
            </div>
          </section>
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
