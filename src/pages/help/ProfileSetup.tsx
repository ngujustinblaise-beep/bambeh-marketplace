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
    "subtitle": "Faites une excellente premiÃ¨re impression",
    "complete": "ComplÃ©tez votre profil",
    "addPhoto": "Ajoutez une photo de profil",
    "photoViews": "Les profils avec photo sont vus 5 fois plus !",
    "writeBio": "RÃ©digez votre bio",
    "tellAbout": "Parlez de vous aux autres",
    "getVerified": "Faites-vous vÃ©rifier",
    "verifyPhone": "VÃ©rifiez votre numÃ©ro de tÃ©lÃ©phone pour inspirer confiance",
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
    "title": "Ø¥Ø¹Ø¯Ø§Ø¯ Ø§Ù„Ù…Ù„Ù Ø§Ù„Ø´Ø®ØµÙŠ",
    "subtitle": "Ø§ØªØ±Ùƒ Ø§Ù†Ø·Ø¨Ø§Ø¹Ù‹Ø§ Ø£ÙˆÙ„Ù‹Ø§ Ø±Ø§Ø¦Ø¹Ù‹Ø§",
    "complete": "Ø£ÙƒÙ…Ù„ Ù…Ù„ÙÙƒ Ø§Ù„Ø´Ø®ØµÙŠ",
    "addPhoto": "Ø£Ø¶Ù ØµÙˆØ±Ø© Ù„Ù„Ù…Ù„Ù Ø§Ù„Ø´Ø®ØµÙŠ",
    "photoViews": "Ø§Ù„Ù…Ù„ÙØ§Øª Ø§Ù„ØªÙŠ ØªØ­ØªÙˆÙŠ Ø¹Ù„Ù‰ ØµÙˆØ±Ø© ØªØ­ØµÙ„ Ø¹Ù„Ù‰ Ù…Ø´Ø§Ù‡Ø¯Ø§Øª Ø£ÙƒØ«Ø± Ø¨Ù€5 Ù…Ø±Ø§Øª!",
    "writeBio": "Ø§ÙƒØªØ¨ Ù†Ø¨Ø°ØªÙƒ",
    "tellAbout": "Ø¹Ø±Ù‘Ù Ø§Ù„Ù†Ø§Ø³ Ø¨Ù†ÙØ³Ùƒ",
    "getVerified": "ÙˆØ«Ù‘Ù‚ Ø­Ø³Ø§Ø¨Ùƒ",
    "verifyPhone": "ÙˆØ«Ù‘Ù‚ Ø±Ù‚Ù… Ù‡Ø§ØªÙÙƒ Ù„ÙƒØ³Ø¨ Ø§Ù„Ø«Ù‚Ø©",
    "back": "Ø§Ù„Ø¹ÙˆØ¯Ø© Ø¥Ù„Ù‰ Ù…Ø±ÙƒØ² Ø§Ù„Ù…Ø³Ø§Ø¹Ø¯Ø©"
  },
  "ff": {
    "title": "Hebbingol humpito",
    "subtitle": "WaÉ—u jaÉ“É“orgal moÆ´Æ´al",
    "complete": "Timmin humpito maa",
    "addPhoto": "Æeydu natal humpito",
    "photoViews": "Humpitooji jogiiÉ—i natal njogii yiyannde laabi 5 É“uri!",
    "writeBio": "Winndu bio maa",
    "tellAbout": "Haalan yimÉ“e fii maa",
    "getVerified": "HeÉ“ teeÅ‹tingol",
    "verifyPhone": "TeeÅ‹tin limoore cinndel maa ngam hoolaare",
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
                <h3 className="font-bold text-gray-900 mb-2">ðŸ“¸ {tr("addPhoto")}</h3>
                <p className="text-gray-700">{tr("photoViews")}</p>
              </div>
              <div className="p-4 bg-purple-50 border-l-4 border-purple-600">
                <h3 className="font-bold text-gray-900 mb-2">âœï¸ {tr("writeBio")}</h3>
                <p className="text-gray-700">{tr("tellAbout")}</p>
              </div>
              <div className="p-4 bg-purple-50 border-l-4 border-purple-600">
                <h3 className="font-bold text-gray-900 mb-2">âœ… {tr("getVerified")}</h3>
                <p className="text-gray-700">{tr("verifyPhone")}</p>
              </div>
            </div>
          </section>
        </div>
        <div className="mt-8 text-center">
          <Link to="/help" className="text-teal-600 hover:text-teal-700 font-semibold">
            â† {tr("back")}
          </Link>
        </div>
      </div>
    </div>
  );
}


