import { Link } from "react-router-dom";
import { User } from "lucide-react";
import { useLang } from "@/hooks/useAppLang";

type Lang = "en" | "fr" | "pidgin" | "ar" | "ff";

const S: Record<Lang, {
  title: string; subtitle: string; complete: string;
  photoTitle: string; photoDesc: string;
  bioTitle: string; bioDesc: string;
  verifyTitle: string; verifyDesc: string;
  back: string;
}> = {
  en: {
    title: "Profile Setup",
    subtitle: "Make a great first impression",
    complete: "Complete Your Profile",
    photoTitle: "📸 Add a Profile Photo",
    photoDesc: "Profiles with photos get 5x more views!",
    bioTitle: "✍️ Write Your Bio",
    bioDesc: "Tell people about yourself",
    verifyTitle: "✅ Get Verified",
    verifyDesc: "Verify your phone number for trust",
    back: "← Back to Help Center",
  },
  fr: {
    title: "Configuration du profil",
    subtitle: "Faites une excellente première impression",
    complete: "Complétez votre profil",
    photoTitle: "📸 Ajoutez une photo de profil",
    photoDesc: "Les profils avec photo sont vus 5 fois plus !",
    bioTitle: "✍️ Rédigez votre bio",
    bioDesc: "Parlez de vous aux autres",
    verifyTitle: "✅ Faites-vous vérifier",
    verifyDesc: "Vérifiez votre numéro de téléphone pour gagner en confiance",
    back: "← Retour au centre d'aide",
  },
  pidgin: {
    title: "Profile Setup",
    subtitle: "Make your first impression strong",
    complete: "Complete Your Profile",
    photoTitle: "📸 Add Profile Photo",
    photoDesc: "Profile wey get photo dey get 5x more views!",
    bioTitle: "✍️ Write Your Bio",
    bioDesc: "Tell people about yourself",
    verifyTitle: "✅ Get Verified",
    verifyDesc: "Verify your phone number for trust",
    back: "← Go back to Help Center",
  },
  ar: {
    title: "إعداد الملف الشخصي",
    subtitle: "اترك انطباعًا أوّليًا رائعًا",
    complete: "أكمل ملفك الشخصي",
    photoTitle: "📸 أضف صورة للملف الشخصي",
    photoDesc: "الملفات التي تحتوي على صور تحصل على مشاهدات أكثر بخمس مرات!",
    bioTitle: "✍️ اكتب نبذتك",
    bioDesc: "عرّف الناس بنفسك",
    verifyTitle: "✅ وثّق حسابك",
    verifyDesc: "وثّق رقم هاتفك لكسب الثقة",
    back: "← العودة إلى مركز المساعدة",
  },
  ff: {
    title: "Hesɗitingol profil",
    subtitle: "Waɗ jaɓɓorgal moƴƴal",
    complete: "Timmin profil maa",
    photoTitle: "📸 Ɓeydu natal profil",
    photoDesc: "Profilji mariiɗi natal ina keɓa yiyannde laɓɓe 5!",
    bioTitle: "✍️ Winndu faltaade maa",
    bioDesc: "Haalan yimɓe hoore maa",
    verifyTitle: "✅ Heɓ goongɗingol",
    verifyDesc: "Goongɗin limndo telefoŋ maa ngam hoolaare",
    back: "← Rutto to Galle Ballal",
  },
};

export default function ProfileSetup() {
  const lang = useLang();
  const l: Lang = (lang in S ? lang : "en") as Lang;
  const s = S[l];
  const isRtl = l === "ar";
  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3">
            <User className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold">{s.title}</h1>
              <p className="text-purple-100">{s.subtitle}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {s.complete}
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 border-l-4 border-purple-600">
                <h3 className="font-bold text-gray-900 mb-2">
                  {s.photoTitle}
                </h3>
                <p className="text-gray-700">
                  {s.photoDesc}
                </p>
              </div>
              <div className="p-4 bg-purple-50 border-l-4 border-purple-600">
                <h3 className="font-bold text-gray-900 mb-2">
                  {s.bioTitle}
                </h3>
                <p className="text-gray-700">{s.bioDesc}</p>
              </div>
              <div className="p-4 bg-purple-50 border-l-4 border-purple-600">
                <h3 className="font-bold text-gray-900 mb-2">
                  {s.verifyTitle}
                </h3>
                <p className="text-gray-700">
                  {s.verifyDesc}
                </p>
              </div>
            </div>
          </section>
        </div>
        <div className="mt-8 text-center">
          <Link
            to="/help"
            className="text-teal-600 hover:text-teal-700 font-semibold"
          >
            {s.back}
          </Link>
        </div>
      </div>
    </div>
  );
}

