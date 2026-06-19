import { Link } from "react-router-dom";
import { Shield, AlertTriangle, Users, Flag } from "lucide-react";
import { useLanguage } from "@/App";

const T: Record<string, Record<string, string>> = {
  "en": {
    "title": "Safety & Security",
    "subtitle": "Your safety is our priority",
    "scamsTitle": "Avoiding Scams",
    "scamsDesc": "Learn to identify and avoid fraudulent listings",
    "meetTitle": "Meeting Safely",
    "meetDesc": "Best practices for in-person transactions",
    "reportTitle": "Reporting Issues",
    "reportDesc": "Report suspicious activity or content",
    "emergency": "Emergency",
    "emergencyMsg": "If you feel threatened or unsafe, contact local authorities immediately.",
    "back": "Back to Help Center"
  },
  "fr": {
    "title": "SÃ»retÃ© et sÃ©curitÃ©",
    "subtitle": "Votre sÃ©curitÃ© est notre prioritÃ©",
    "scamsTitle": "Ã‰viter les arnaques",
    "scamsDesc": "Apprenez Ã  repÃ©rer et Ã©viter les annonces frauduleuses",
    "meetTitle": "Se rencontrer en sÃ©curitÃ©",
    "meetDesc": "Bonnes pratiques pour les transactions en personne",
    "reportTitle": "Signaler des problÃ¨mes",
    "reportDesc": "Signalez toute activitÃ© ou contenu suspect",
    "emergency": "Urgence",
    "emergencyMsg": "Si vous vous sentez menacÃ© ou en danger, contactez immÃ©diatement les autoritÃ©s locales.",
    "back": "Retour au centre d'aide"
  },
  "pidgin": {
    "title": "Safety & Security",
    "subtitle": "Your safety na we main concern",
    "scamsTitle": "How to Avoid Scam",
    "scamsDesc": "Learn how to know and avoid fake listing dem",
    "meetTitle": "Meet Safe",
    "meetDesc": "Best way to do face-to-face deal",
    "reportTitle": "Report Problem dem",
    "reportDesc": "Report any suspicious thing or content",
    "emergency": "Emergency",
    "emergencyMsg": "If you feel say danger dey or you no safe, call di local authority dem sharp sharp.",
    "back": "Go back to Help Center"
  },
  "ar": {
    "title": "Ø§Ù„Ø³Ù„Ø§Ù…Ø© ÙˆØ§Ù„Ø£Ù…Ø§Ù†",
    "subtitle": "Ø³Ù„Ø§Ù…ØªÙƒ Ù‡ÙŠ Ø£ÙˆÙ„ÙˆÙŠØªÙ†Ø§",
    "scamsTitle": "ØªØ¬Ù†Ù‘Ø¨ Ø§Ù„Ø§Ø­ØªÙŠØ§Ù„",
    "scamsDesc": "ØªØ¹Ù„Ù‘Ù… ÙƒÙŠÙ ØªØªØ¹Ø±Ù‘Ù Ø¹Ù„Ù‰ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª Ø§Ù„Ø§Ø­ØªÙŠØ§Ù„ÙŠØ© ÙˆØªØªØ¬Ù†Ù‘Ø¨Ù‡Ø§",
    "meetTitle": "Ø§Ù„Ù„Ù‚Ø§Ø¡ Ø¨Ø£Ù…Ø§Ù†",
    "meetDesc": "Ø£ÙØ¶Ù„ Ø§Ù„Ù…Ù…Ø§Ø±Ø³Ø§Øª Ù„Ù„Ù…Ø¹Ø§Ù…Ù„Ø§Øª Ø§Ù„Ø´Ø®ØµÙŠØ©",
    "reportTitle": "Ø§Ù„Ø¥Ø¨Ù„Ø§Øº Ø¹Ù† Ø§Ù„Ù…Ø´ÙƒÙ„Ø§Øª",
    "reportDesc": "Ø£Ø¨Ù„Øº Ø¹Ù† Ø£ÙŠ Ù†Ø´Ø§Ø· Ø£Ùˆ Ù…Ø­ØªÙˆÙ‰ Ù…Ø´Ø¨ÙˆÙ‡",
    "emergency": "Ø·ÙˆØ§Ø±Ø¦",
    "emergencyMsg": "Ø¥Ø°Ø§ Ø´Ø¹Ø±Øª Ø¨Ø§Ù„ØªÙ‡Ø¯ÙŠØ¯ Ø£Ùˆ Ø¨Ø¹Ø¯Ù… Ø§Ù„Ø£Ù…Ø§Ù†ØŒ ÙØ§ØªØµÙ„ Ø¨Ø§Ù„Ø³Ù„Ø·Ø§Øª Ø§Ù„Ù…Ø­Ù„ÙŠØ© ÙÙˆØ±Ù‹Ø§.",
    "back": "Ø§Ù„Ø¹ÙˆØ¯Ø© Ø¥Ù„Ù‰ Ù…Ø±ÙƒØ² Ø§Ù„Ù…Ø³Ø§Ø¹Ø¯Ø©"
  },
  "ff": {
    "title": "Kisal e hisnde",
    "subtitle": "Kisal maa ko ko É“uri himmude e amen",
    "scamsTitle": "WoÉ—É—itagol nguyka",
    "scamsDesc": "Janngu no anndirta e woÉ—É—itortoo jeeyle nguyka",
    "meetTitle": "Hawrugol e kisal",
    "meetDesc": "Mbaydiiji moÆ´Æ´i ngam njulaaku É—o yeeso e yeeso",
    "reportTitle": "Æ³eewtagol caÉ—eele",
    "reportDesc": "Æ³eewto golle walla huunde sikkitiniinde",
    "emergency": "HeÃ±oraare",
    "emergencyMsg": "So aÉ—a hulÉ“inaa walla a wonaa e kisal, heÉ“ laamÉ“e nokkuure maa law.",
    "back": "Rutto to galle ballal"
  }
};

export default function SafetySecurity() {
  const { language } = useLanguage();
  const lang = T[language] ? language : "en";
  const tr = (k: string) => (T[lang] && T[lang][k]) || T.en[k] || k;
  const isRtl = lang === "ar";
  const cards = [
    { titleKey: "scamsTitle", descKey: "scamsDesc", path: "/help/avoiding-scams", icon: AlertTriangle, box: "bg-red-100", fg: "text-red-600" },
    { titleKey: "meetTitle", descKey: "meetDesc", path: "/help/meeting-safely", icon: Users, box: "bg-blue-100", fg: "text-blue-600" },
    { titleKey: "reportTitle", descKey: "reportDesc", path: "/help/reporting-issues", icon: Flag, box: "bg-purple-100", fg: "text-purple-600" },
  ];
  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3">
            <Shield className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold">{tr("title")}</h1>
              <p className="text-red-100">{tr("subtitle")}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <Link key={c.path} to={c.path} className="block bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 group">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${c.box} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${c.fg}`} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{tr(c.titleKey)}</h2>
                    <p className="text-gray-600">{tr(c.descKey)}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-3">ðŸš¨ {tr("emergency")}</h3>
          <p className="text-gray-700">{tr("emergencyMsg")}</p>
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
