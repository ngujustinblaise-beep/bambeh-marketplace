import { Link } from "react-router-dom";
import { ShoppingCart, PlusCircle, DollarSign, CreditCard } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const T: Record<string, Record<string, string>> = {
  "en": {
    "title": "Buying & Selling",
    "subtitle": "Master the marketplace",
    "postTitle": "How to Post an Ad",
    "postDesc": "Create listings that get results",
    "priceTitle": "Setting the Right Price",
    "priceDesc": "Price your items competitively",
    "payTitle": "Payment Methods",
    "payDesc": "Understand your payment options",
    "back": "Back to Help Center"
  },
  "fr": {
    "title": "Acheter et vendre",
    "subtitle": "Maîtrisez la place de marché",
    "postTitle": "Comment publier une annonce",
    "postDesc": "Créez des annonces qui donnent des résultats",
    "priceTitle": "Fixer le bon prix",
    "priceDesc": "Fixez des prix compétitifs",
    "payTitle": "Moyens de paiement",
    "payDesc": "Comprenez vos options de paiement",
    "back": "Retour au centre d'aide"
  },
  "pidgin": {
    "title": "Buy & Sell",
    "subtitle": "Sabi di market well well",
    "postTitle": "How to Post Ad",
    "postDesc": "Make listing wey dey bring result",
    "priceTitle": "Set di Right Price",
    "priceDesc": "Price your things so dem fit compete",
    "payTitle": "Payment Method dem",
    "payDesc": "Understand your payment option dem",
    "back": "Go back to Help Center"
  },
  "ar": {
    "title": "البيع والشراء",
    "subtitle": "أتقن السوق",
    "postTitle": "كيÙية نشر إعلان",
    "postDesc": "أنشئ إعلانات تحقق نتائج",
    "priceTitle": "تحديد السعر المناسب",
    "priceDesc": "سعّر سلعك بشكل تناÙسي",
    "payTitle": "طرق الدÙع",
    "payDesc": "اÙهم خيارات الدÙع المتاحة لك",
    "back": "العودة إلى مركز المساعدة"
  },
  "ff": {
    "title": "Soodgol e yeeygol",
    "subtitle": "Anndu luumo",
    "postTitle": "No neldirtee jeeyngal",
    "postDesc": "Sos jeeyle ɗe njogii njeeygu",
    "priceTitle": "Teelgol coggu moƴƴu",
    "priceDesc": "Teel coggu kaake maa no haaɗtirta",
    "payTitle": "Mbaydiiji yoɓgol",
    "payDesc": "Faamu mbaydiiji yoɓgol maa",
    "back": "Rutto to galle ballal"
  }
};

export default function BuyingSelling() {
  const { language } = useLanguage();
  const lang = T[language] ? language : "en";
  const tr = (k: string) => (T[lang] && T[lang][k]) || T.en[k] || k;
  const isRtl = lang === "ar";
  const cards = [
    { titleKey: "postTitle", descKey: "postDesc", path: "/help/how-to-post-ad", icon: PlusCircle, box: "bg-blue-100", fg: "text-blue-600" },
    { titleKey: "priceTitle", descKey: "priceDesc", path: "/help/setting-right-price", icon: DollarSign, box: "bg-green-100", fg: "text-green-600" },
    { titleKey: "payTitle", descKey: "payDesc", path: "/help/payment-methods", icon: CreditCard, box: "bg-purple-100", fg: "text-purple-600" },
  ];
  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold">{tr("title")}</h1>
              <p className="text-blue-100">{tr("subtitle")}</p>
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

        <div className="mt-8 text-center">
          <Link to="/help" className="text-teal-600 hover:text-teal-700 font-semibold">
            ← {tr("back")}
          </Link>
        </div>
      </div>
    </div>
  );
}




