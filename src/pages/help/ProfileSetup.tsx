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
    photoTitle: "ðŸ“¸ Add a Profile Photo",
    photoDesc: "Profiles with photos get 5x more views!",
    bioTitle: "âœï¸ Write Your Bio",
    bioDesc: "Tell people about yourself",
    verifyTitle: "âœ… Get Verified",
    verifyDesc: "Verify your phone number for trust",
    back: "â† Back to Help Center",
  },
  fr: {
    title: "Configuration du profil",
    subtitle: "Faites une excellente premiÃ¨re impression",
    complete: "ComplÃ©tez votre profil",
    photoTitle: "ðŸ“¸ Ajoutez une photo de profil",
    photoDesc: "Les profils avec photo sont vus 5 fois plus !",
    bioTitle: "âœï¸ RÃ©digez votre bio",
    bioDesc: "Parlez de vous aux autres",
    verifyTitle: "âœ… Faites-vous vÃ©rifier",
    verifyDesc: "VÃ©rifiez votre numÃ©ro de tÃ©lÃ©phone pour gagner en confiance",
    back: "â† Retour au centre d'aide",
  },
  pidgin: {
    title: "Profile Setup",
    subtitle: "Make your first impression strong",
    complete: "Complete Your Profile",
    photoTitle: "ðŸ“¸ Add Profile Photo",
    photoDesc: "Profile wey get photo dey get 5x more views!",
    bioTitle: "âœï¸ Write Your Bio",
    bioDesc: "Tell people about yourself",
    verifyTitle: "âœ… Get Verified",
    verifyDesc: "Verify your phone number for trust",
    back: "â† Go back to Help Center",
  },
  ar: {
    title: "Ø¥Ø¹Ø¯Ø§Ø¯ Ø§Ù„Ù…Ù„Ù Ø§Ù„Ø´Ø®ØµÙŠ",
    subtitle: "Ø§ØªØ±Ùƒ Ø§Ù†Ø·Ø¨Ø§Ø¹Ù‹Ø§ Ø£ÙˆÙ‘Ù„ÙŠÙ‹Ø§ Ø±Ø§Ø¦Ø¹Ù‹Ø§",
    complete: "Ø£ÙƒÙ…Ù„ Ù…Ù„ÙÙƒ Ø§Ù„Ø´Ø®ØµÙŠ",
    photoTitle: "ðŸ“¸ Ø£Ø¶Ù ØµÙˆØ±Ø© Ù„Ù„Ù…Ù„Ù Ø§Ù„Ø´Ø®ØµÙŠ",
    photoDesc: "Ø§Ù„Ù…Ù„ÙØ§Øª Ø§Ù„ØªÙŠ ØªØ­ØªÙˆÙŠ Ø¹Ù„Ù‰ ØµÙˆØ± ØªØ­ØµÙ„ Ø¹Ù„Ù‰ Ù…Ø´Ø§Ù‡Ø¯Ø§Øª Ø£ÙƒØ«Ø± Ø¨Ø®Ù…Ø³ Ù…Ø±Ø§Øª!",
    bioTitle: "âœï¸ Ø§ÙƒØªØ¨ Ù†Ø¨Ø°ØªÙƒ",
    bioDesc: "Ø¹Ø±Ù‘Ù Ø§Ù„Ù†Ø§Ø³ Ø¨Ù†ÙØ³Ùƒ",
    verifyTitle: "âœ… ÙˆØ«Ù‘Ù‚ Ø­Ø³Ø§Ø¨Ùƒ",
    verifyDesc: "ÙˆØ«Ù‘Ù‚ Ø±Ù‚Ù… Ù‡Ø§ØªÙÙƒ Ù„ÙƒØ³Ø¨ Ø§Ù„Ø«Ù‚Ø©",
    back: "â† Ø§Ù„Ø¹ÙˆØ¯Ø© Ø¥Ù„Ù‰ Ù…Ø±ÙƒØ² Ø§Ù„Ù…Ø³Ø§Ø¹Ø¯Ø©",
  },
  ff: {
    title: "HesÉ—itingol profil",
    subtitle: "WaÉ— jaÉ“É“orgal moÆ´Æ´al",
    complete: "Timmin profil maa",
    photoTitle: "ðŸ“¸ Æeydu natal profil",
    photoDesc: "Profilji mariiÉ—i natal ina keÉ“a yiyannde laÉ“É“e 5!",
    bioTitle: "âœï¸ Winndu faltaade maa",
    bioDesc: "Haalan yimÉ“e hoore maa",
    verifyTitle: "âœ… HeÉ“ goongÉ—ingol",
    verifyDesc: "GoongÉ—in limndo telefoÅ‹ maa ngam hoolaare",
    back: "â† Rutto to Galle Ballal",
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


