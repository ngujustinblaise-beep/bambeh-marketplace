import { Link } from "react-router-dom";
import { PlusCircle, Image, FileText, MapPin } from "lucide-react";
import { useLang } from '@/hooks/useAppLang';

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
    "subtitle": "CrÃ©ez des annonces qui se vendent",
    "s1Title": "Choisir une catÃ©gorie",
    "s1Desc": "SÃ©lectionnez la catÃ©gorie la plus appropriÃ©e pour votre article",
    "s2Title": "Ajouter des photos",
    "s2Desc": "TÃ©lÃ©chargez des photos nettes et bien Ã©clairÃ©es sous plusieurs angles",
    "proTipLabel": "Astuce :",
    "proTip": "Les annonces avec 5 photos ou plus obtiennent 3 fois plus de vues !",
    "s3Title": "RÃ©diger une description",
    "s3Desc": "Incluez les dÃ©tails clÃ©s comme l'Ã©tat, les spÃ©cifications et les caractÃ©ristiques",
    "s4Title": "DÃ©finir la localisation",
    "s4Desc": "Ajoutez votre localisation pour aider les acheteurs Ã  vous trouver",
    "earnTitle": "Gagnez des Zerm Coins",
    "earnDesc": "Recevez 2 Zerm Coins pour chaque annonce approuvÃ©e !",
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
    "title": "ÙƒÙŠÃ™ÂÙŠØ© Ù†Ø´Ø± Ø¥Ø¹Ù„Ø§Ù†",
    "subtitle": "Ø£Ù†Ø´Ø¦ Ø¥Ø¹Ù„Ø§Ù†Ø§Øª ØªØ¨ÙŠØ¹",
    "s1Title": "Ø§Ø®ØªØ± Ø§Ù„Ã™ÂØ¦Ø©",
    "s1Desc": "Ø§Ø®ØªØ± Ø§Ù„Ã™ÂØ¦Ø© Ø§Ù„Ø£Ù†Ø³Ø¨ Ù„Ø³Ù„Ø¹ØªÙƒ",
    "s2Title": "Ø£Ø¶Ã™Â Ø§Ù„ØµÙˆØ±",
    "s2Desc": "Ø§Ø±Ã™ÂØ¹ ØµÙˆØ±Ù‹Ø§ ÙˆØ§Ø¶Ø­Ø© ÙˆØ¬ÙŠØ¯Ø© Ø§Ù„Ø¥Ø¶Ø§Ø¡Ø© Ù…Ù† Ø¹Ø¯Ø© Ø²ÙˆØ§ÙŠØ§",
    "proTipLabel": "Ù†ØµÙŠØ­Ø©:",
    "proTip": "Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª Ø§Ù„ØªÙŠ ØªØ­ØªÙˆÙŠ Ø¹Ù„Ù‰ 5 ØµÙˆØ± Ø£Ùˆ Ø£ÙƒØ«Ø± ØªØ­ØµÙ„ Ø¹Ù„Ù‰ Ù…Ø´Ø§Ù‡Ø¯Ø§Øª Ø£ÙƒØ«Ø± Ø¨Ù€3 Ù…Ø±Ø§Øª!",
    "s3Title": "Ø§ÙƒØªØ¨ Ø§Ù„ÙˆØµÃ™Â",
    "s3Desc": "Ø£Ø¯Ø±Ø¬ Ø§Ù„ØªÃ™ÂØ§ØµÙŠÙ„ Ø§Ù„Ù…Ù‡Ù…Ø© Ù…Ø«Ù„ Ø§Ù„Ø­Ø§Ù„Ø© ÙˆØ§Ù„Ù…ÙˆØ§ØµÃ™ÂØ§Øª ÙˆØ§Ù„Ù…ÙŠØ²Ø§Øª",
    "s4Title": "Ø­Ø¯Ø¯ Ø§Ù„Ù…ÙˆÙ‚Ø¹",
    "s4Desc": "Ø£Ø¶Ã™Â Ù…ÙˆÙ‚Ø¹Ùƒ Ù„Ù…Ø³Ø§Ø¹Ø¯Ø© Ø§Ù„Ù…Ø´ØªØ±ÙŠÙ† Ø¹Ù„Ù‰ Ø§Ù„Ø¹Ø«ÙˆØ± Ø¹Ù„ÙŠÙƒ",
    "earnTitle": "Ø§ÙƒØ³Ø¨ Zerm Coins",
    "earnDesc": "Ø§Ø­ØµÙ„ Ø¹Ù„Ù‰ 2 Zerm Coins Ù„ÙƒÙ„ Ø¥Ø¹Ù„Ø§Ù† ØªØªÙ… Ø§Ù„Ù…ÙˆØ§Ã™ÂÙ‚Ø© Ø¹Ù„ÙŠÙ‡!",
    "back": "Ø§Ù„Ø¹ÙˆØ¯Ø© Ø¥Ù„Ù‰ Ù…Ø±ÙƒØ² Ø§Ù„Ù…Ø³Ø§Ø¹Ø¯Ø©"
  },
  "ff": {
    "title": "No neldirtee jeeyngal",
    "subtitle": "Sos jeeyle É—e coottata",
    "s1Title": "SuÉ“o dental",
    "s1Desc": "SuÉ“o dental ngal É“uri haantude kaake maa",
    "s2Title": "Æeydu natal",
    "s2Desc": "Loowu natalji laaÉ“uÉ—i, jalbuÉ—i, immorde e nokkuuje keewÉ—e",
    "proTipLabel": "Waaju:",
    "proTip": "Jeeyle jogiiÉ—e natalji 5 walla É“uri njogii yiyannde laaÉ“i 3!",
    "s3Title": "Winndu sifa",
    "s3Desc": "Naatnu kuyngal himmungal wano alhaali, sifaaji, e keÉ“e",
    "s4Title": "Teelgol nokkuure",
    "s4Desc": "Æeydu nokkuure maa ngam wallude soodooÉ“e yiytude ma",
    "earnTitle": "HeÉ“ Zerm Coins",
    "earnDesc": "HeÉ“ Zerm Coins 2 e kala jeeyngal jaÉ“aangal!",
    "back": "Rutto to galle ballal"
  }
};

export default function HowToPostAd() {
  const currentLang = useLang();
    const lang = T[currentLang] ? currentLang : "en";
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
            <h3 className="font-bold text-gray-900 mb-3">ðŸª™ {tr("earnTitle")}</h3>
            <p className="text-gray-700">{tr("earnDesc")}</p>
          </div>
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




