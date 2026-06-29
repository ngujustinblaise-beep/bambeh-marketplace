import { Link } from "react-router-dom";
import { CreditCard, Coins, Smartphone, DollarSign } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

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
    "subtitle": "Options de paiement sûres et pratiques",
    "coinsTitle": "Zerm Coins",
    "coinsDesc": "Utilisez vos Zerm Coins gagnés pour des fonctionnalités premium et des boosts",
    "c1a": "Transactions instantanées",
    "c1b": "Sans frais",
    "c1c": "Sécurisé sur la plateforme",
    "momoTitle": "Mobile Money",
    "momoDesc": "MTN Mobile Money et Orange Money",
    "m1": "Largement accepté",
    "m2": "Traitement rapide",
    "m3": "Pratique",
    "cashTitle": "Espèces",
    "cashDesc": "Payez en personne lors de la rencontre",
    "ca1": "Aucun frais de transaction",
    "ca2": "Paiement instantané",
    "ca3": "Simple et direct",
    "safetyTitle": "Rappel de sécurité",
    "safetyMsg": "Ne partagez jamais vos informations de paiement avant de vous rencontrer en personne. Vérifiez toujours les articles avant de payer.",
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
    "title": "طرق الدÙع",
    "subtitle": "خيارات دÙع آمنة ومريحة",
    "coinsTitle": "Zerm Coins",
    "coinsDesc": "استخدم Zerm Coins التي كسبتها للميزات المميزة والتعزيزات",
    "c1a": "معاملات Ùورية",
    "c1b": "بدون رسوم",
    "c1c": "آمن داخل المنصة",
    "momoTitle": "Mobile Money",
    "momoDesc": "MTN Mobile Money و Orange Money",
    "m1": "مقبول على نطاق واسع",
    "m2": "معالجة سريعة",
    "m3": "مريح",
    "cashTitle": "نقدًا",
    "cashDesc": "ادÙع شخصيًا عند اللقاء",
    "ca1": "بدون رسوم معاملات",
    "ca2": "دÙع Ùوري",
    "ca3": "بسيط ومباشر",
    "safetyTitle": "تذكير بالأمان",
    "safetyMsg": "لا تشارك تÙاصيل الدÙع الخاصة بك قبل اللقاء شخصيًا. تحقق دائمًا من السلع قبل الدÙع.",
    "back": "العودة إلى مركز المساعدة"
  },
  "ff": {
    "title": "Mbaydiiji yoɓgol",
    "subtitle": "Mbaydiiji yoɓgol hisɗi e newiiɗi",
    "coinsTitle": "Zerm Coins",
    "coinsDesc": "Huutoro Zerm Coins ɗe keɓuɗaa ngam keɓe premium e ɓamtinirɗe",
    "c1a": "Njulaaku jaawɗi",
    "c1b": "Alaa njoɓdi",
    "c1c": "Hisii nder platform",
    "momoTitle": "Mobile Money",
    "momoDesc": "MTN Mobile Money e Orange Money",
    "m1": "Jaɓaa no woory",
    "m2": "Golletee law",
    "m3": "Newiiɗo",
    "cashTitle": "Kaalis",
    "cashDesc": "Yoɓ ɗo yeeso so on hawri",
    "ca1": "Alaa njoɓdi njulaaku",
    "ca2": "Yoɓgol jaawngol",
    "ca3": "Newiiɗo e focciiɗo",
    "safetyTitle": "Siiftorgol kisal",
    "safetyMsg": "Wata a yeenu kabaruuji yoɓgol maa ado on hawrude ɗo yeeso. Ƴeewndo kaake ado yoɓgol.",
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
                    <li key={b}>✓ {tr(b)}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-3">🛡ï¸ {tr("safetyTitle")}</h3>
          <p className="text-gray-700">{tr("safetyMsg")}</p>
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




