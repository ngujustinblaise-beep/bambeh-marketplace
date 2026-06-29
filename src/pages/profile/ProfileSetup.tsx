/**
 * ProfileSetup.tsx — Bambeh Marketplace
 * FILE LOCATION: src/pages/profile/ProfileSetup.tsx
 *
 * i18n: Bound directly to the single active language provider from "@/App".
 * Supports EN, FR, Pidgin, AR, and FF with automated RTL document direction.
 *
 * © 2026 Bambeh Marketplace. All rights reserved.
 */
import React from "react";
import { Link } from "react-router-dom";
import { User } from "lucide-react";
import { useLanguage } from "@/App";

type Lang = "en" | "fr" | "pidgin" | "ar" | "ff";

const S: Record<Lang, {
  title: string;
  subtitle: string;
  heading: string;
  photoTitle: string;
  photoDesc: string;
  bioTitle: string;
  bioDesc: string;
  verifyTitle: string;
  verifyDesc: string;
  backToHelp: string;
}> = {
  en: {
    title: "Profile Setup",
    subtitle: "Make a great first impression",
    heading: "Complete Your Profile",
    photoTitle: "📸 Add a Profile Photo",
    photoDesc: "Profiles with photos get 5x more views!",
    bioTitle: "✍️ Write Your Bio",
    bioDesc: "Tell people about yourself",
    verifyTitle: "✅ Get Verified",
    verifyDesc: "Verify your phone number for trust",
    backToHelp: "← Back to Help Center"
  },
  fr: {
    title: "Configuration du profil",
    subtitle: "Faites une excellente première impression",
    heading: "Complétez votre profil",
    photoTitle: "📸 Ajoutez une photo de profil",
    photoDesc: "Les profils avec photos obtiennent 5 fois plus de vues !",
    bioTitle: "✍️ Rédigez votre biographie",
    bioDesc: "Parlez de vous aux autres",
    verifyTitle: "✅ Obtenez la vérification",
    verifyDesc: "Vérifiez votre numéro de téléphone pour plus de confiance",
    backToHelp: "← Retour au centre d'aide"
  },
  pidgin: {
    title: "Profile Setup",
    subtitle: "Make people like your profile sharp sharp",
    heading: "Complete Your Profile",
    photoTitle: "📸 Add Profile Photo",
    photoDesc: "Profiles wey get picture dey get 5x more views!",
    bioTitle: "✍️ Write Your Bio",
    bioDesc: "Tell people small mata about yourself",
    verifyTitle: "✅ Get Verified",
    verifyDesc: "Verify your phone number make trust dey",
    backToHelp: "← Go back to Help Center"
  },
  ar: {
    title: "إعداد الملف الشخصي",
    subtitle: "اترك انطباعًا أول رائعًا",
    heading: "أكمل ملفك الشخصي",
    photoTitle: "📸 أضف صورة الملف الشخصي",
    photoDesc: "الملفات الشخصية التي تحتوي على صور تحصل على مشاهدات أكثر بـ 5 مرات!",
    bioTitle: "✍️ اكتب نبذة عنك",
    bioDesc: "أخبر الناس عن نفسك",
    verifyTitle: "✅ توثيق الحساب",
    verifyDesc: "تحقق من رقم هاتفك لبناء الثقة",
    backToHelp: "← العودة إلى مركز المساعدة"
  },
  ff: {
    title: "Teelte Profil",
    subtitle: "Waɗu maana ko woodi gila gite naddi",
    heading: "Timmin profil maa",
    photoTitle: "📸 Waɗu natal profil",
    photoDesc: "Profileji jofi natal ɗon heɓa yiygo laabi jowi (5x) haa ɓura!",
    bioTitle: "✍️ Windu habaru maa",
    bioDesc: "Wolwan yimɓe habaru maa seɗɗa",
    verifyTitle: "✅ Heɓu goongɗinki",
    verifyDesc: "Tabbitin limore telefoŋ maa ngam hoolaare",
    backToHelp: "← Artu haa Nokku Ballal"
  }
};

export default function ProfileSetup() {
  const { language } = useLanguage();
  const lang: Lang = (language in S ? language : "en") as Lang;
  const s = S[lang];
  const isRtl = lang === "ar";

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Banner Section */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3">
            <User className="w-12 h-12 flex-shrink-0" />
            <div>
              <h1 className="text-4xl font-bold">{s.title}</h1>
              <p className="text-purple-100 mt-1">{s.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Requirements List */}
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {s.heading}
            </h2>
            <div className="space-y-4">
              {/* Photo Box */}
              <div className={`p-4 bg-purple-50 ${isRtl ? 'border-r-4' : 'border-l-4'} border-purple-600`}>
                <h3 className="font-bold text-gray-900 mb-2">
                  {s.photoTitle}
                </h3>
                <p className="text-gray-700 text-sm">
                  {s.photoDesc}
                </p>
              </div>

              {/* Bio Box */}
              <div className={`p-4 bg-purple-50 ${isRtl ? 'border-r-4' : 'border-l-4'} border-purple-600`}>
                <h3 className="font-bold text-gray-900 mb-2">
                  {s.bioTitle}
                </h3>
                <p className="text-gray-700 text-sm">
                  {s.bioDesc}
                </p>
              </div>

              {/* Verification Box */}
              <div className={`p-4 bg-purple-50 ${isRtl ? 'border-r-4' : 'border-l-4'} border-purple-600`}>
                <h3 className="font-bold text-gray-900 mb-2">
                  {s.verifyTitle}
                </h3>
                <p className="text-gray-700 text-sm">
                  {s.verifyDesc}
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Back Navigation Link */}
        <div className="mt-8 text-center">
          <Link
            to="/help"
            className="text-teal-600 hover:text-teal-700 font-semibold text-sm transition-colors"
          >
            {s.backToHelp}
          </Link>
        </div>
      </div>
    </div>
  );
}