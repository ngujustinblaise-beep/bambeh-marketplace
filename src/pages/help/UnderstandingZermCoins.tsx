import { Link } from "react-router-dom";
import { Coins, ArrowRightLeft, ShoppingBag, Gift } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type Lang = "en" | "fr" | "pidgin" | "ar" | "ff";
const T: Record<Lang, Record<string,string>> = {
  en: { title:"Understanding Zerm Coins", subtitle:"Your Bambeh digital wallet",
    whatTitle:"What Are Zerm Coins?", whatBody:"Zerm Coins are Bambeh's digital currency. Use them to pay for subscriptions, boost your listings, and access premium features.",
    rateTitle:"Exchange Rate", rate:"1 Zerm Coin = 100 XAF",
    useTitle:"What You Can Do", u1:"Pay for subscription plans", u2:"Boost and feature your listings", u3:"Send coins to other users", u4:"Unlock premium tools",
    getTitle:"How to Get Coins", g1:"Buy with Mobile Money (MTN / Orange)", g2:"Earn through referrals", g3:"Receive transfers from other users",
    tipTitle:"Good to Know", tipBody:"Zerm Coins never expire and can be transferred to friends and family on Bambeh anytime.", back:"Back to Help Center" },
  fr: { title:"Comprendre les Zerm Coins", subtitle:"Votre portefeuille num\u00E9rique Bambeh",
    whatTitle:"Que sont les Zerm Coins ?", whatBody:"Les Zerm Coins sont la monnaie num\u00E9rique de Bambeh. Utilisez-les pour payer des abonnements, mettre en avant vos annonces et acc\u00E9der aux fonctionnalit\u00E9s premium.",
    rateTitle:"Taux de change", rate:"1 Zerm Coin = 100 XAF",
    useTitle:"Ce que vous pouvez faire", u1:"Payer les forfaits d'abonnement", u2:"Booster et mettre en avant vos annonces", u3:"Envoyer des coins \u00E0 d'autres utilisateurs", u4:"D\u00E9bloquer des outils premium",
    getTitle:"Comment obtenir des coins", g1:"Acheter avec Mobile Money (MTN / Orange)", g2:"Gagner gr\u00E2ce aux parrainages", g3:"Recevoir des transferts d'autres utilisateurs",
    tipTitle:"Bon \u00E0 savoir", tipBody:"Les Zerm Coins n'expirent jamais et peuvent \u00EAtre transf\u00E9r\u00E9s \u00E0 vos proches sur Bambeh \u00E0 tout moment.", back:"Retour au centre d'aide" },
  pidgin: { title:"Understand Zerm Coins", subtitle:"Your Bambeh digital wallet",
    whatTitle:"Wetin Be Zerm Coins?", whatBody:"Zerm Coins na Bambeh digital money. Use am pay for subscription, boost your listing, and open premium features.",
    rateTitle:"Exchange Rate", rate:"1 Zerm Coin = 100 XAF",
    useTitle:"Wetin You Fit Do", u1:"Pay for subscription plan", u2:"Boost and feature your listing dem", u3:"Send coin give other people", u4:"Open premium tools",
    getTitle:"How to Get Coin", g1:"Buy with Mobile Money (MTN / Orange)", g2:"Earn through referral", g3:"Receive transfer from other people",
    tipTitle:"Good to Know", tipBody:"Zerm Coin no dey expire and you fit send am give your friend or family for Bambeh any time.", back:"Go back to Help Center" },
  ar: { title:"\u0641\u0647\u0645 \u0639\u0645\u0644\u0627\u062A Zerm", subtitle:"\u0645\u062D\u0641\u0638\u062A\u0643 \u0627\u0644\u0631\u0642\u0645\u064A\u0629 \u0641\u064A Bambeh",
    whatTitle:"\u0645\u0627 \u0647\u064A \u0639\u0645\u0644\u0627\u062A Zerm\u061F", whatBody:"\u0639\u0645\u0644\u0627\u062A Zerm \u0647\u064A \u0627\u0644\u0639\u0645\u0644\u0629 \u0627\u0644\u0631\u0642\u0645\u064A\u0629 \u0644\u0640 Bambeh. \u0627\u0633\u062A\u062E\u062F\u0645\u0647\u0627 \u0644\u062F\u0641\u0639 \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643\u0627\u062A \u0648\u062A\u0639\u0632\u064A\u0632 \u0625\u0639\u0644\u0627\u0646\u0627\u062A\u0643 \u0648\u0627\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0627\u0644\u0645\u064A\u0632\u0627\u062A \u0627\u0644\u0645\u0645\u064A\u0632\u0629.",
    rateTitle:"\u0633\u0639\u0631 \u0627\u0644\u0635\u0631\u0641", rate:"1 Zerm Coin = 100 XAF",
    useTitle:"\u0645\u0627 \u064A\u0645\u0643\u0646\u0643 \u0641\u0639\u0644\u0647", u1:"\u062F\u0641\u0639 \u062E\u0637\u0637 \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643", u2:"\u062A\u0639\u0632\u064A\u0632 \u0648\u0625\u0628\u0631\u0627\u0632 \u0625\u0639\u0644\u0627\u0646\u0627\u062A\u0643", u3:"\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0639\u0645\u0644\u0627\u062A \u0625\u0644\u0649 \u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646 \u0622\u062E\u0631\u064A\u0646", u4:"\u0641\u062A\u062D \u0627\u0644\u0623\u062F\u0648\u0627\u062A \u0627\u0644\u0645\u0645\u064A\u0632\u0629",
    getTitle:"\u0643\u064A\u0641\u064A\u0629 \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0627\u0644\u0639\u0645\u0644\u0627\u062A", g1:"\u0627\u0644\u0634\u0631\u0627\u0621 \u0639\u0628\u0631 \u0627\u0644\u0645\u062D\u0641\u0638\u0629 \u0627\u0644\u0645\u062D\u0645\u0648\u0644\u0629 (MTN / Orange)", g2:"\u0627\u0644\u0631\u0628\u062D \u0639\u0628\u0631 \u0627\u0644\u0625\u062D\u0627\u0644\u0627\u062A", g3:"\u062A\u0644\u0642\u0651\u064A \u062A\u062D\u0648\u064A\u0644\u0627\u062A \u0645\u0646 \u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646 \u0622\u062E\u0631\u064A\u0646",
    tipTitle:"\u0645\u0641\u064A\u062F \u0623\u0646 \u062A\u0639\u0631\u0641", tipBody:"\u0639\u0645\u0644\u0627\u062A Zerm \u0644\u0627 \u062A\u0646\u062A\u0647\u064A \u0635\u0644\u0627\u062D\u064A\u062A\u0647\u0627 \u0623\u0628\u062F\u064B\u0627 \u0648\u064A\u0645\u0643\u0646 \u062A\u062D\u0648\u064A\u0644\u0647\u0627 \u0625\u0644\u0649 \u0627\u0644\u0623\u0635\u062F\u0642\u0627\u0621 \u0648\u0627\u0644\u0639\u0627\u0626\u0644\u0629 \u0639\u0644\u0649 Bambeh \u0641\u064A \u0623\u064A \u0648\u0642\u062A.", back:"\u0627\u0644\u0639\u0648\u062F\u0629 \u0625\u0644\u0649 \u0645\u0631\u0643\u0632 \u0627\u0644\u0645\u0633\u0627\u0639\u062F\u0629" },
  ff: { title:"Faamde Zerm Coins", subtitle:"Portmonne maa digitaal Bambeh",
    whatTitle:"Ko honɗum woni Zerm Coins?", whatBody:"Zerm Coins ko kaalisi digitaal Bambeh. Huutoro \u0257i ngam yo\u0253ude abonemaaji, \u0253eydude jeeyngeeji maa, e hewtude golle premiyom.",
    rateTitle:"Coggu waylugol", rate:"1 Zerm Coin = 100 XAF",
    useTitle:"Ko mbaa\u0257aa wa\u0257ude", u1:"Yo\u0253ude peeje abonemaa", u2:"\u0181eydude e \u0253anginde jeeyngeeji maa", u3:"Neldude koppe to huutoro\u0257e go\u0257\u0257e", u4:"U\u0253\u0253itde kuutorɗe premiyom",
    getTitle:"No keɓirtaa koppe", g1:"Soodu e Mobile Money (MTN / Orange)", g2:"Hebu rewrude e neld'on", g3:"Hebu neldugol immorde e huutoro\u0257e go\u0257\u0257e",
    tipTitle:"Ko mo\u01B4\u01B4i anndude", tipBody:"Zerm Coins \u0257e ngalaa lajal e e\u0257e mbaawi neldude to giƴi\u0253e e \u0253esngu to Bambeh saa kala.", back:"Rutto to galle ballal" },
};

export default function UnderstandingZermCoins() {
  const { language } = useLanguage();
  const lang: Lang = (["en","fr","pidgin","ar","ff"].includes(language) ? language : "en") as Lang;
  const tr = (k:string) => T[lang][k] || T.en[k] || k;
  const isRtl = lang === "ar";
  const uses = ["u1","u2","u3","u4"];
  const gets = ["g1","g2","g3"];
  return (
    <div dir={isRtl ? "rtl":"ltr"} className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3">
            <Coins className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold">{tr("title")}</h1>
              <p className="text-yellow-100">{tr("subtitle")}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Coins className="w-6 h-6 text-amber-500" />{tr("whatTitle")}
            </h2>
            <p className="text-gray-700 mb-4">{tr("whatBody")}</p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
              <p className="text-lg font-bold text-amber-700">{tr("rate")}</p>
            </div>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-teal-600" />{tr("useTitle")}
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-700">
              {uses.map(u => (
                <li key={u} className="flex items-start gap-2">
                  <span className="text-teal-500 mt-1">{"\u2713"}</span><span>{tr(u)}</span>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ArrowRightLeft className="w-6 h-6 text-purple-600" />{tr("getTitle")}
            </h2>
            <ul className="space-y-3 text-gray-700">
              {gets.map(g => (
                <li key={g} className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">{"\u2022"}</span><span>{tr(g)}</span>
                </li>
              ))}
            </ul>
          </section>
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Gift className="w-5 h-5 text-teal-600" />{tr("tipTitle")}
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

