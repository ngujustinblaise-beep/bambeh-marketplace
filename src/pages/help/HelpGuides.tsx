import { Link } from "react-router-dom";
import { BookOpen, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type Lang = "en" | "fr" | "pidgin" | "ar" | "ff";
const T: Record<Lang, Record<string,string>> = {
  en: { title:"Help Guides", subtitle:"Step-by-step guides to get the most out of Bambeh",
    g1t:"Getting Started", g1d:"Create your account and set up your profile in minutes.",
    g2t:"Posting Your First Ad", g2d:"Learn how to create a listing that sells fast.",
    g3t:"Buying Safely", g3d:"Tips to buy with confidence and avoid scams.",
    g4t:"Selling Like a Pro", g4d:"Price right, photograph well, and close more deals.",
    g5t:"Using Zerm Coins", g5d:"Pay, boost listings, and transfer coins to friends.",
    g6t:"Staying Safe", g6d:"Meet safely and protect your personal information.",
    read:"Read guide", back:"Back to Help Center" },
  fr: { title:"Guides d'aide", subtitle:"Des guides pas \u00E0 pas pour tirer le meilleur de Bambeh",
    g1t:"Pour commencer", g1d:"Cr\u00E9ez votre compte et configurez votre profil en quelques minutes.",
    g2t:"Publier votre premi\u00E8re annonce", g2d:"Apprenez \u00E0 cr\u00E9er une annonce qui se vend vite.",
    g3t:"Acheter en s\u00E9curit\u00E9", g3d:"Conseils pour acheter en confiance et \u00E9viter les arnaques.",
    g4t:"Vendre comme un pro", g4d:"Fixez le bon prix, photographiez bien et concluez plus de ventes.",
    g5t:"Utiliser les Zerm Coins", g5d:"Payez, boostez vos annonces et transf\u00E9rez des coins.",
    g6t:"Rester en s\u00E9curit\u00E9", g6d:"Rencontrez-vous en s\u00E9curit\u00E9 et prot\u00E9gez vos informations.",
    read:"Lire le guide", back:"Retour au centre d'aide" },
  pidgin: { title:"Help Guides", subtitle:"Step-by-step guide dem to use Bambeh well",
    g1t:"How to Start", g1d:"Open your account and set your profile for small time.",
    g2t:"Post Your First Ad", g2d:"Learn how to create listing wey go sell fast.",
    g3t:"Buy Safe", g3d:"Tips to buy with mind rest and avoid scam.",
    g4t:"Sell Like Pro", g4d:"Price am well, snap good photo, and close plenty deal.",
    g5t:"Use Zerm Coins", g5d:"Pay, boost listing, and send coin give friend.",
    g6t:"Stay Safe", g6d:"Meet safe and protect your personal info.",
    read:"Read guide", back:"Go back to Help Center" },
  ar: { title:"\u0623\u062F\u0644\u0651\u0629 \u0627\u0644\u0645\u0633\u0627\u0639\u062F\u0629", subtitle:"\u0623\u062F\u0644\u0651\u0629 \u062E\u0637\u0648\u0629 \u0628\u062E\u0637\u0648\u0629 \u0644\u0644\u0627\u0633\u062A\u0641\u0627\u062F\u0629 \u0627\u0644\u0642\u0635\u0648\u0649 \u0645\u0646 Bambeh",
    g1t:"\u0627\u0644\u0628\u062F\u0621", g1d:"\u0623\u0646\u0634\u0626 \u062D\u0633\u0627\u0628\u0643 \u0648\u0627\u0636\u0628\u0637 \u0645\u0644\u0641\u0643 \u0641\u064A \u062F\u0642\u0627\u0626\u0642.",
    g2t:"\u0646\u0634\u0631 \u0623\u0648\u0644 \u0625\u0639\u0644\u0627\u0646", g2d:"\u062A\u0639\u0644\u0651\u0645 \u0643\u064A\u0641 \u062A\u0646\u0634\u0626 \u0625\u0639\u0644\u0627\u0646\u064B\u0627 \u064A\u0628\u064A\u0639 \u0628\u0633\u0631\u0639\u0629.",
    g3t:"\u0627\u0644\u0634\u0631\u0627\u0621 \u0628\u0623\u0645\u0627\u0646", g3d:"\u0646\u0635\u0627\u0626\u062D \u0644\u0644\u0634\u0631\u0627\u0621 \u0628\u062B\u0642\u0629 \u0648\u062A\u062C\u0646\u0651\u0628 \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0644.",
    g4t:"\u0627\u0644\u0628\u064A\u0639 \u0628\u0627\u062D\u062A\u0631\u0627\u0641", g4d:"\u062D\u062F\u0651\u062F \u0627\u0644\u0633\u0639\u0631 \u0627\u0644\u0635\u062D\u064A\u062D\u060C \u0635\u0648\u0651\u0631 \u062C\u064A\u062F\u064B\u0627\u060C \u0648\u0623\u062A\u0645\u0650\u0645 \u0635\u0641\u0642\u0627\u062A \u0623\u0643\u062B\u0631.",
    g5t:"\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0639\u0645\u0644\u0627\u062A Zerm", g5d:"\u0627\u062F\u0641\u0639\u060C \u0639\u0632\u0651\u0632 \u0625\u0639\u0644\u0627\u0646\u0627\u062A\u0643\u060C \u0648\u062D\u0648\u0651\u0644 \u0627\u0644\u0639\u0645\u0644\u0627\u062A \u0644\u0644\u0623\u0635\u062F\u0642\u0627\u0621.",
    g6t:"\u0627\u0644\u0628\u0642\u0627\u0621 \u0622\u0645\u0646\u064B\u0627", g6d:"\u0627\u0644\u062A\u0642\u0650 \u0628\u0623\u0645\u0627\u0646 \u0648\u0627\u062D\u0645\u0650 \u0645\u0639\u0644\u0648\u0645\u0627\u062A\u0643 \u0627\u0644\u0634\u062E\u0635\u064A\u0629.",
    read:"\u0627\u0642\u0631\u0623 \u0627\u0644\u062F\u0644\u064A\u0644", back:"\u0627\u0644\u0639\u0648\u062F\u0629 \u0625\u0644\u0649 \u0645\u0631\u0643\u0632 \u0627\u0644\u0645\u0633\u0627\u0639\u062F\u0629" },
  ff: { title:"Gardanleeji ballal", subtitle:"Gardanleeji ce\u00F1u-ce\u00F1u ngam huutoraade Bambeh no woory",
    g1t:"Fu\u0257\u0257orde", g1d:"Sos konte maa tawaa teelaa profil maa nder hojomaaji se\u0257a.",
    g2t:"Neldugol jeeyngal maa adan", g2d:"Janngu no neldirtaa jeeyngal ngal yeeyata law.",
    g3t:"Soodgol e kisal", g3d:"Waajuuji ngam soodde e hoolaare e wo\u0257\u0257itaade nguyka.",
    g4t:"Yeeygol no annduɓe", g4d:"Teel coggu mo\u01B4\u01B4u, na\u0257u natal mo\u01B4\u01B4o, timmin njulaaku buy.",
    g5t:"Huutoraade Zerm Coins", g5d:"Yo\u0253u, \u0253eydu jeeyngeeji, neldu koppe to gi\u01B4i\u0253e.",
    g6t:"Heddaade e kisal", g6d:"Hawru e kisal tawaa a reena kabaruuji maa keeri\u0257i.",
    read:"Janngu gardanle", back:"Rutto to galle ballal" },
};

export default function HelpGuides() {
  const { language } = useLanguage();
  const lang: Lang = (["en","fr","pidgin","ar","ff"].includes(language) ? language : "en") as Lang;
  const tr = (k:string) => T[lang][k] || T.en[k] || k;
  const isRtl = lang === "ar";
  const guides = [
    { t:"g1t", d:"g1d", path:"/help/getting-started",   color:"from-blue-500 to-blue-700" },
    { t:"g2t", d:"g2d", path:"/help/how-to-post-ad",     color:"from-green-500 to-green-700" },
    { t:"g3t", d:"g3d", path:"/help/buying-selling",     color:"from-teal-500 to-teal-700" },
    { t:"g4t", d:"g4d", path:"/help/setting-right-price",color:"from-amber-500 to-amber-700" },
    { t:"g5t", d:"g5d", path:"/help/understanding-zerm-coins", color:"from-yellow-500 to-amber-600" },
    { t:"g6t", d:"g6d", path:"/help/meeting-safely",     color:"from-red-500 to-red-700" },
  ];
  return (
    <div dir={isRtl ? "rtl":"ltr"} className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="bg-gradient-to-r from-teal-600 to-teal-800 text-white rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3">
            <BookOpen className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold">{tr("title")}</h1>
              <p className="text-teal-100">{tr("subtitle")}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guides.map(g => (
            <Link key={g.path} to={g.path} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden group">
              <div className={`bg-gradient-to-r ${g.color} h-2`} />
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{tr(g.t)}</h3>
                <p className="text-gray-600 mb-4">{tr(g.d)}</p>
                <span className="inline-flex items-center gap-1 text-teal-600 font-semibold group-hover:gap-2 transition-all">
                  {tr("read")}<ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link to="/help" className="text-teal-600 hover:text-teal-700 font-semibold">{"\u2190 "}{tr("back")}</Link>
        </div>
      </div>
    </div>
  );
}

