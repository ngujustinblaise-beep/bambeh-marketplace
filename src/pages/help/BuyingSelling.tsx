import { Link } from "react-router-dom";
import { ShoppingCart, PlusCircle, DollarSign, CreditCard } from "lucide-react";
import { useLanguage } from "@/App";

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
    "subtitle": "MaÃ®trisez la place de marchÃ©",
    "postTitle": "Comment publier une annonce",
    "postDesc": "CrÃ©ez des annonces qui donnent des rÃ©sultats",
    "priceTitle": "Fixer le bon prix",
    "priceDesc": "Fixez des prix compÃ©titifs",
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
    "title": "Ø§Ù„Ø¨ÙŠØ¹ ÙˆØ§Ù„Ø´Ø±Ø§Ø¡",
    "subtitle": "Ø£ØªÙ‚Ù† Ø§Ù„Ø³ÙˆÙ‚",
    "postTitle": "ÙƒÙŠÙÙŠØ© Ù†Ø´Ø± Ø¥Ø¹Ù„Ø§Ù†",
    "postDesc": "Ø£Ù†Ø´Ø¦ Ø¥Ø¹Ù„Ø§Ù†Ø§Øª ØªØ­Ù‚Ù‚ Ù†ØªØ§Ø¦Ø¬",
    "priceTitle": "ØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ø³Ø¹Ø± Ø§Ù„Ù…Ù†Ø§Ø³Ø¨",
    "priceDesc": "Ø³Ø¹Ù‘Ø± Ø³Ù„Ø¹Ùƒ Ø¨Ø´ÙƒÙ„ ØªÙ†Ø§ÙØ³ÙŠ",
    "payTitle": "Ø·Ø±Ù‚ Ø§Ù„Ø¯ÙØ¹",
    "payDesc": "Ø§ÙÙ‡Ù… Ø®ÙŠØ§Ø±Ø§Øª Ø§Ù„Ø¯ÙØ¹ Ø§Ù„Ù…ØªØ§Ø­Ø© Ù„Ùƒ",
    "back": "Ø§Ù„Ø¹ÙˆØ¯Ø© Ø¥Ù„Ù‰ Ù…Ø±ÙƒØ² Ø§Ù„Ù…Ø³Ø§Ø¹Ø¯Ø©"
  },
  "ff": {
    "title": "Soodgol e yeeygol",
    "subtitle": "Anndu luumo",
    "postTitle": "No neldirtee jeeyngal",
    "postDesc": "Sos jeeyle É—e njogii njeeygu",
    "priceTitle": "Teelgol coggu moÆ´Æ´u",
    "priceDesc": "Teel coggu kaake maa no haaÉ—tirta",
    "payTitle": "Mbaydiiji yoÉ“gol",
    "payDesc": "Faamu mbaydiiji yoÉ“gol maa",
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
            â† {tr("back")}
          </Link>
        </div>
      </div>
    </div>
  );
}
