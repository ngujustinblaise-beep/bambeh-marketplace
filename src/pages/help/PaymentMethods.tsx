import { Link } from "react-router-dom";
import { CreditCard, Coins, Smartphone, DollarSign } from "lucide-react";
import { useLanguage } from "@/App";

const T: Record<string, Record<string, string>> = {
  "en": {
    "title": "Payment Methods",
    "subtitle": "Safe and convenient payment options",
    "coinsTitle": "Zerm Coins",
    "coinsDesc": "Use your earned Zerm Coins for premium features and boosts",
    "c1a": "Instant transactions",
    "c1b": "No fees",
    "c1c": "Secure within platform",
    "momoTitle": "Mobile Money",
    "momoDesc": "MTN Mobile Money and Orange Money",
    "m1": "Widely accepted",
    "m2": "Fast processing",
    "m3": "Convenient",
    "cashTitle": "Cash",
    "cashDesc": "Pay in person when you meet",
    "ca1": "No transaction fees",
    "ca2": "Instant payment",
    "ca3": "Simple and direct",
    "safetyTitle": "Safety Reminder",
    "safetyMsg": "Never share your payment details before meeting in person. Always verify items before paying.",
    "back": "Back to Help Center"
  },
  "fr": {
    "title": "Moyens de paiement",
    "subtitle": "Options de paiement sÃ»res et pratiques",
    "coinsTitle": "Zerm Coins",
    "coinsDesc": "Utilisez vos Zerm Coins gagnÃ©s pour des fonctionnalitÃ©s premium et des boosts",
    "c1a": "Transactions instantanÃ©es",
    "c1b": "Sans frais",
    "c1c": "SÃ©curisÃ© sur la plateforme",
    "momoTitle": "Mobile Money",
    "momoDesc": "MTN Mobile Money et Orange Money",
    "m1": "Largement acceptÃ©",
    "m2": "Traitement rapide",
    "m3": "Pratique",
    "cashTitle": "EspÃ¨ces",
    "cashDesc": "Payez en personne lors de la rencontre",
    "ca1": "Aucun frais de transaction",
    "ca2": "Paiement instantanÃ©",
    "ca3": "Simple et direct",
    "safetyTitle": "Rappel de sÃ©curitÃ©",
    "safetyMsg": "Ne partagez jamais vos informations de paiement avant de vous rencontrer en personne. VÃ©rifiez toujours les articles avant de payer.",
    "back": "Retour au centre d'aide"
  },
  "pidgin": {
    "title": "Payment Method dem",
    "subtitle": "Payment option dem wey safe and easy",
    "coinsTitle": "Zerm Coins",
    "coinsDesc": "Use di Zerm Coins wey you don earn for premium feature and boost dem",
    "c1a": "Transaction wey sharp",
    "c1b": "No fees",
    "c1c": "Secure for inside di platform",
    "momoTitle": "Mobile Money",
    "momoDesc": "MTN Mobile Money and Orange Money",
    "m1": "Plenty place dey accept am",
    "m2": "E dey process fast",
    "m3": "E easy",
    "cashTitle": "Cash",
    "cashDesc": "Pay face-to-face wen una meet",
    "ca1": "No transaction fee",
    "ca2": "Payment wey sharp",
    "ca3": "Simple and direct",
    "safetyTitle": "Safety Reminder",
    "safetyMsg": "No share your payment details before una meet face-to-face. Always check di item before you pay.",
    "back": "Go back to Help Center"
  },
  "ar": {
    "title": "Ø·Ø±Ù‚ Ø§Ù„Ø¯ÙØ¹",
    "subtitle": "Ø®ÙŠØ§Ø±Ø§Øª Ø¯ÙØ¹ Ø¢Ù…Ù†Ø© ÙˆÙ…Ø±ÙŠØ­Ø©",
    "coinsTitle": "Zerm Coins",
    "coinsDesc": "Ø§Ø³ØªØ®Ø¯Ù… Zerm Coins Ø§Ù„ØªÙŠ ÙƒØ³Ø¨ØªÙ‡Ø§ Ù„Ù„Ù…ÙŠØ²Ø§Øª Ø§Ù„Ù…Ù…ÙŠØ²Ø© ÙˆØ§Ù„ØªØ¹Ø²ÙŠØ²Ø§Øª",
    "c1a": "Ù…Ø¹Ø§Ù…Ù„Ø§Øª ÙÙˆØ±ÙŠØ©",
    "c1b": "Ø¨Ø¯ÙˆÙ† Ø±Ø³ÙˆÙ…",
    "c1c": "Ø¢Ù…Ù† Ø¯Ø§Ø®Ù„ Ø§Ù„Ù…Ù†ØµØ©",
    "momoTitle": "Mobile Money",
    "momoDesc": "MTN Mobile Money Ùˆ Orange Money",
    "m1": "Ù…Ù‚Ø¨ÙˆÙ„ Ø¹Ù„Ù‰ Ù†Ø·Ø§Ù‚ ÙˆØ§Ø³Ø¹",
    "m2": "Ù…Ø¹Ø§Ù„Ø¬Ø© Ø³Ø±ÙŠØ¹Ø©",
    "m3": "Ù…Ø±ÙŠØ­",
    "cashTitle": "Ù†Ù‚Ø¯Ù‹Ø§",
    "cashDesc": "Ø§Ø¯ÙØ¹ Ø´Ø®ØµÙŠÙ‹Ø§ Ø¹Ù†Ø¯ Ø§Ù„Ù„Ù‚Ø§Ø¡",
    "ca1": "Ø¨Ø¯ÙˆÙ† Ø±Ø³ÙˆÙ… Ù…Ø¹Ø§Ù…Ù„Ø§Øª",
    "ca2": "Ø¯ÙØ¹ ÙÙˆØ±ÙŠ",
    "ca3": "Ø¨Ø³ÙŠØ· ÙˆÙ…Ø¨Ø§Ø´Ø±",
    "safetyTitle": "ØªØ°ÙƒÙŠØ± Ø¨Ø§Ù„Ø£Ù…Ø§Ù†",
    "safetyMsg": "Ù„Ø§ ØªØ´Ø§Ø±Ùƒ ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ø¯ÙØ¹ Ø§Ù„Ø®Ø§ØµØ© Ø¨Ùƒ Ù‚Ø¨Ù„ Ø§Ù„Ù„Ù‚Ø§Ø¡ Ø´Ø®ØµÙŠÙ‹Ø§. ØªØ­Ù‚Ù‚ Ø¯Ø§Ø¦Ù…Ù‹Ø§ Ù…Ù† Ø§Ù„Ø³Ù„Ø¹ Ù‚Ø¨Ù„ Ø§Ù„Ø¯ÙØ¹.",
    "back": "Ø§Ù„Ø¹ÙˆØ¯Ø© Ø¥Ù„Ù‰ Ù…Ø±ÙƒØ² Ø§Ù„Ù…Ø³Ø§Ø¹Ø¯Ø©"
  },
  "ff": {
    "title": "Mbaydiiji yoÉ“gol",
    "subtitle": "Mbaydiiji yoÉ“gol hisÉ—i e newiiÉ—i",
    "coinsTitle": "Zerm Coins",
    "coinsDesc": "Huutoro Zerm Coins É—e keÉ“uÉ—aa ngam keÉ“e premium e É“amtinirÉ—e",
    "c1a": "Njulaaku jaawÉ—i",
    "c1b": "Alaa njoÉ“di",
    "c1c": "Hisii nder platform",
    "momoTitle": "Mobile Money",
    "momoDesc": "MTN Mobile Money e Orange Money",
    "m1": "JaÉ“aa no woory",
    "m2": "Golletee law",
    "m3": "NewiiÉ—o",
    "cashTitle": "Kaalis",
    "cashDesc": "YoÉ“ É—o yeeso so on hawri",
    "ca1": "Alaa njoÉ“di njulaaku",
    "ca2": "YoÉ“gol jaawngol",
    "ca3": "NewiiÉ—o e focciiÉ—o",
    "safetyTitle": "Siiftorgol kisal",
    "safetyMsg": "Wata a yeenu kabaruuji yoÉ“gol maa ado on hawrude É—o yeeso. Æ³eewndo kaake ado yoÉ“gol.",
    "back": "Rutto to galle ballal"
  }
};

export default function PaymentMethods() {
  const { language } = useLanguage();
  const lang = T[language] ? language : "en";
  const tr = (k: string) => (T[lang] && T[lang][k]) || T.en[k] || k;
  const isRtl = lang === "ar";
  const cards = [
    { titleKey: "coinsTitle", descKey: "coinsDesc", icon: Coins, box: "bg-yellow-100", fg: "text-yellow-600", bullets: ["c1a", "c1b", "c1c"] },
    { titleKey: "momoTitle", descKey: "momoDesc", icon: Smartphone, box: "bg-orange-100", fg: "text-orange-600", bullets: ["m1", "m2", "m3"] },
    { titleKey: "cashTitle", descKey: "cashDesc", icon: DollarSign, box: "bg-green-100", fg: "text-green-600", bullets: ["ca1", "ca2", "ca3"] },
  ];
  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3">
            <CreditCard className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold">{tr("title")}</h1>
              <p className="text-purple-100">{tr("subtitle")}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.titleKey} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 ${c.box} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${c.fg}`} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{tr(c.titleKey)}</h2>
                </div>
                <p className="text-gray-600 mb-3">{tr(c.descKey)}</p>
                <ul className="space-y-2 text-gray-600 text-sm">
                  {c.bullets.map((b) => (
                    <li key={b}>âœ“ {tr(b)}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-3">ðŸ›¡ï¸ {tr("safetyTitle")}</h3>
          <p className="text-gray-700">{tr("safetyMsg")}</p>
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


