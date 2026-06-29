import { Link } from "react-router-dom";
import { DollarSign, TrendingUp } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type Lang = "en" | "fr" | "pidgin" | "ar" | "ff";
const T: Record<Lang, Record<string,string>> = {
  en: { title:"Setting the Right Price", subtitle:"Price to sell fast",
    h1:"Research the Market", p1:"Search for similar items on Bambeh to see what others are charging.",
    h2:"Consider Condition", new:"New: Full retail price or slightly below", like:"Like New: 70-90% of retail", good:"Good: 50-70% of retail", fair:"Fair: 30-50% of retail",
    h3:"Pricing Formula", formula:"Price = (Market Value x Condition %) - Urgency Discount", formulaNote:"Add 10-15% if the item is rare or in high demand.",
    tip:"Pro Tip", tipBody:"Price slightly higher than your minimum to leave room for negotiation!", back:"Back to Help Center" },
  fr: { title:"Fixer le bon prix", subtitle:"Un prix pour vendre vite",
    h1:"\u00C9tudiez le march\u00E9", p1:"Cherchez des articles similaires sur Bambeh pour voir les prix pratiqu\u00E9s.",
    h2:"Tenez compte de l'\u00E9tat", new:"Neuf : prix de d\u00E9tail complet ou l\u00E9g\u00E8rement en dessous", like:"Comme neuf : 70-90% du prix de d\u00E9tail", good:"Bon : 50-70% du prix de d\u00E9tail", fair:"Correct : 30-50% du prix de d\u00E9tail",
    h3:"Formule de prix", formula:"Prix = (Valeur de march\u00E9 x % d'\u00E9tat) - Remise d'urgence", formulaNote:"Ajoutez 10-15% si l'article est rare ou tr\u00E8s demand\u00E9.",
    tip:"Astuce", tipBody:"Fixez un prix l\u00E9g\u00E8rement sup\u00E9rieur \u00E0 votre minimum pour garder une marge de n\u00E9gociation !", back:"Retour au centre d'aide" },
  pidgin: { title:"Set di Right Price", subtitle:"Price wey go sell fast",
    h1:"Check di Market", p1:"Search similar things for Bambeh make you see wetin others dey charge.",
    h2:"Consider di Condition", new:"New: Full price or small below", like:"Like New: 70-90% of di price", good:"Good: 50-70% of di price", fair:"Fair: 30-50% of di price",
    h3:"Price Formula", formula:"Price = (Market Value x Condition %) - Urgency Discount", formulaNote:"Add 10-15% if di thing rare or plenty people want am.",
    tip:"Pro Tip", tipBody:"Put price small higher pass your minimum so space go dey for bargain!", back:"Go back to Help Center" },
  ar: { title:"\u062A\u062D\u062F\u064A\u062F \u0627\u0644\u0633\u0639\u0631 \u0627\u0644\u0645\u0646\u0627\u0633\u0628", subtitle:"\u0633\u0639\u0631 \u064A\u0628\u064A\u0639 \u0628\u0633\u0631\u0639\u0629",
    h1:"\u0627\u062F\u0631\u0633 \u0627\u0644\u0633\u0648\u0642", p1:"\u0627\u0628\u062D\u062B \u0639\u0646 \u0633\u0644\u0639 \u0645\u0645\u0627\u062B\u0644\u0629 \u0639\u0644\u0649 Bambeh \u0644\u0645\u0639\u0631\u0641\u0629 \u0623\u0633\u0639\u0627\u0631 \u0627\u0644\u0622\u062E\u0631\u064A\u0646.",
    h2:"\u0631\u0627\u0639\u0650 \u0627\u0644\u062D\u0627\u0644\u0629", new:"\u062C\u062F\u064A\u062F: \u0633\u0639\u0631 \u0627\u0644\u062A\u062C\u0632\u0626\u0629 \u0627\u0644\u0643\u0627\u0645\u0644 \u0623\u0648 \u0623\u0642\u0644 \u0642\u0644\u064A\u0644\u0627\u064B", like:"\u0634\u0628\u0647 \u062C\u062F\u064A\u062F: 70-90% \u0645\u0646 \u0633\u0639\u0631 \u0627\u0644\u062A\u062C\u0632\u0626\u0629", good:"\u062C\u064A\u062F: 50-70% \u0645\u0646 \u0627\u0644\u0633\u0639\u0631", fair:"\u0645\u0642\u0628\u0648\u0644: 30-50% \u0645\u0646 \u0627\u0644\u0633\u0639\u0631",
    h3:"\u0645\u0639\u0627\u062F\u0644\u0629 \u0627\u0644\u0633\u0639\u0631", formula:"\u0627\u0644\u0633\u0639\u0631 = (\u0642\u064A\u0645\u0629 \u0627\u0644\u0633\u0648\u0642 x \u0646\u0633\u0628\u0629 \u0627\u0644\u062D\u0627\u0644\u0629) - \u062E\u0635\u0645 \u0627\u0644\u0627\u0633\u062A\u0639\u062C\u0627\u0644", formulaNote:"\u0623\u0636\u0641 10-15% \u0625\u0630\u0627 \u0643\u0627\u0646\u062A \u0627\u0644\u0633\u0644\u0639\u0629 \u0646\u0627\u062F\u0631\u0629 \u0623\u0648 \u0639\u0644\u064A\u0647\u0627 \u0637\u0644\u0628 \u0643\u0628\u064A\u0631.",
    tip:"\u0646\u0635\u064A\u062D\u0629", tipBody:"\u062D\u062F\u0651\u062F \u0633\u0639\u0631\u064B\u0627 \u0623\u0639\u0644\u0649 \u0642\u0644\u064A\u0644\u0627\u064B \u0645\u0646 \u062D\u062F\u0651\u0643 \u0627\u0644\u0623\u062F\u0646\u0649 \u0644\u062A\u062A\u0631\u0643 \u0645\u062C\u0627\u0644\u0627\u064B \u0644\u0644\u062A\u0641\u0627\u0648\u0636!", back:"\u0627\u0644\u0639\u0648\u062F\u0629 \u0625\u0644\u0649 \u0645\u0631\u0643\u0632 \u0627\u0644\u0645\u0633\u0627\u0639\u062F\u0629" },
  ff: { title:"Teelgol coggu mo\u01B4\u01B4u", subtitle:"Coggu ngu coottata law",
    h1:"\u01B4eewndo luumo", p1:"\u01B4eewndo kaake nanndu\u0257e e Bambeh ngam yi\u0301ide ko wo\u0257\u0253e coggi.",
    h2:"Miijo alhaali", new:"Hesere: coggu timmungu walla les se\u0257a", like:"Wa no hesere: 70-90% coggu", good:"Mo\u01B4\u01B4o: 50-70% coggu", fair:"Hakkundeejo: 30-50% coggu",
    h3:"Hiisa coggu", formula:"Coggu = (Njeenaari luumo x % alhaali) - Ustaare he\u00F1oraare", formulaNote:"\u0181eydu 10-15% so kaake \u0257e njogii teskaare mawnde.",
    tip:"Waaju", tipBody:"Teel coggu se\u0257a \u0253uri \u0257o famarum maa ngam \u0253e\u0257a nokku jeeyngu!", back:"Rutto to galle ballal" },
};

export default function SettingRightPrice() {
  const { language } = useLanguage();
  const lang: Lang = (["en","fr","pidgin","ar","ff"].includes(language) ? language : "en") as Lang;
  const tr = (k:string) => T[lang][k] || T.en[k] || k;
  const isRtl = lang === "ar";
  return (
    <div dir={isRtl ? "rtl":"ltr"} className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3">
            <DollarSign className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold">{tr("title")}</h1>
              <p className="text-green-100">{tr("subtitle")}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{tr("h1")}</h2>
            <p className="text-gray-600 mb-4">{tr("p1")}</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{tr("h2")}</h2>
            <ul className="space-y-2 text-gray-600">
              <li>{"\u2022 "}{tr("new")}</li>
              <li>{"\u2022 "}{tr("like")}</li>
              <li>{"\u2022 "}{tr("good")}</li>
              <li>{"\u2022 "}{tr("fair")}</li>
            </ul>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{tr("h3")}</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-lg font-semibold text-gray-900 mb-2">{tr("formula")}</p>
              <p className="text-sm text-gray-600">{tr("formulaNote")}</p>
            </div>
          </section>
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />{tr("tip")}
            </h3>
            <p className="text-gray-700">{tr("tipBody")}</p>
          </div>
        </div>
        <div className="mt-8 text-center">
          <Link to="/help" className="text-teal-600 hover:text-teal-700 font-semibold">{"\u2190 "}{tr("back")}</Link>
        </div>
      </div>
    </div>
  );
}


