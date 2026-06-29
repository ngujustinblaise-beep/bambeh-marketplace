/**
 * SUBSCRIPTION WALL - UPGRADE PROMPT
 * Shows when free users try to access premium content.
 * (c) 2025 Bambeh. All rights reserved.
 */

import { Link } from "react-router-dom";
import { Lock, Zap, Shield, Crown } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type Lang = "en" | "fr" | "pidgin" | "ar" | "ff";
type ActionKey = "location" | "contact" | "apply" | "buy" | "details" | "post";

const T: Record<Lang, Record<string,string>> = {
  en: {
    location_t:"Location Hidden", location_d:"Unlock exact location details with any subscription plan!",
    contact_t:"Contact Locked", contact_d:"Subscribe to contact sellers and start conversations!",
    apply_t:"Application Locked", apply_d:"Get a subscription to apply for jobs and connect with employers!",
    buy_t:"Purchase Locked", buy_d:"Unlock purchasing power with a subscription plan!",
    details_t:"Full Details Locked", details_d:"Subscribe to see complete information and all details!",
    post_t:"Posting Locked", post_d:"Get a subscription to post your own ads and reach buyers!",
    unlock:"Unlock Premium Features:",
    f1:"View exact locations of all listings", f2:"Contact sellers directly", f3:"Apply for jobs instantly",
    f4:"Buy items and complete purchases", f5:"Post unlimited ads", f6:"Access full details and descriptions",
    upgrade:"Upgrade", viewPlans:"View Subscription Plans", from:"Plans start from as low as 500 XAF per day",
  },
  fr: {
    location_t:"Localisation masqu\u00E9e", location_d:"D\u00E9bloquez les d\u00E9tails exacts de localisation avec un abonnement !",
    contact_t:"Contact verrouill\u00E9", contact_d:"Abonnez-vous pour contacter les vendeurs et discuter !",
    apply_t:"Candidature verrouill\u00E9e", apply_d:"Prenez un abonnement pour postuler et contacter les employeurs !",
    buy_t:"Achat verrouill\u00E9", buy_d:"D\u00E9bloquez le pouvoir d'achat avec un abonnement !",
    details_t:"D\u00E9tails complets verrouill\u00E9s", details_d:"Abonnez-vous pour voir toutes les informations !",
    post_t:"Publication verrouill\u00E9e", post_d:"Prenez un abonnement pour publier vos annonces et toucher les acheteurs !",
    unlock:"D\u00E9bloquez les fonctionnalit\u00E9s premium :",
    f1:"Voir les localisations exactes de toutes les annonces", f2:"Contacter les vendeurs directement", f3:"Postuler instantan\u00E9ment",
    f4:"Acheter et finaliser les achats", f5:"Publier des annonces illimit\u00E9es", f6:"Acc\u00E9der \u00E0 tous les d\u00E9tails et descriptions",
    upgrade:"Mettre \u00E0 niveau", viewPlans:"Voir les forfaits", from:"Forfaits \u00E0 partir de 500 XAF par jour",
  },
  pidgin: {
    location_t:"Location Hide", location_d:"Open di exact location with any subscription plan!",
    contact_t:"Contact Lock", contact_d:"Subscribe to contact seller dem and start talk!",
    apply_t:"Application Lock", apply_d:"Get subscription to apply for work and reach employer dem!",
    buy_t:"Buy Lock", buy_d:"Open buying power with subscription plan!",
    details_t:"Full Details Lock", details_d:"Subscribe to see all di information and details!",
    post_t:"Posting Lock", post_d:"Get subscription to post your own ad and reach buyer dem!",
    unlock:"Open Premium Features:",
    f1:"See exact location of all listing dem", f2:"Contact seller dem direct", f3:"Apply for work sharp sharp",
    f4:"Buy things and complete purchase", f5:"Post ad dem without limit", f6:"Open full details and description",
    upgrade:"Upgrade", viewPlans:"See Subscription Plans", from:"Plan dem dey start from 500 XAF per day",
  },
  ar: {
    location_t:"\u0627\u0644\u0645\u0648\u0642\u0639 \u0645\u062E\u0641\u064A", location_d:"\u0627\u0641\u062A\u062D \u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u062F\u0642\u064A\u0642 \u0645\u0639 \u0623\u064A \u062E\u0637\u0629 \u0627\u0634\u062A\u0631\u0627\u0643!",
    contact_t:"\u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0645\u0642\u0641\u0644", contact_d:"\u0627\u0634\u062A\u0631\u0643 \u0644\u0644\u062A\u0648\u0627\u0635\u0644 \u0645\u0639 \u0627\u0644\u0628\u0627\u0626\u0639\u064A\u0646!",
    apply_t:"\u0627\u0644\u062A\u0642\u062F\u064A\u0645 \u0645\u0642\u0641\u0644", apply_d:"\u0627\u062D\u0635\u0644 \u0639\u0644\u0649 \u0627\u0634\u062A\u0631\u0627\u0643 \u0644\u0644\u062A\u0642\u062F\u0645 \u0644\u0644\u0648\u0638\u0627\u0626\u0641!",
    buy_t:"\u0627\u0644\u0634\u0631\u0627\u0621 \u0645\u0642\u0641\u0644", buy_d:"\u0627\u0641\u062A\u062D \u0642\u062F\u0631\u0629 \u0627\u0644\u0634\u0631\u0627\u0621 \u0645\u0639 \u062E\u0637\u0629 \u0627\u0634\u062A\u0631\u0627\u0643!",
    details_t:"\u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0643\u0627\u0645\u0644\u0629 \u0645\u0642\u0641\u0644\u0629", details_d:"\u0627\u0634\u062A\u0631\u0643 \u0644\u0631\u0624\u064A\u0629 \u062C\u0645\u064A\u0639 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A!",
    post_t:"\u0627\u0644\u0646\u0634\u0631 \u0645\u0642\u0641\u0644", post_d:"\u0627\u062D\u0635\u0644 \u0639\u0644\u0649 \u0627\u0634\u062A\u0631\u0627\u0643 \u0644\u0646\u0634\u0631 \u0625\u0639\u0644\u0627\u0646\u0627\u062A\u0643!",
    unlock:"\u0627\u0641\u062A\u062D \u0627\u0644\u0645\u064A\u0632\u0627\u062A \u0627\u0644\u0645\u0645\u064A\u0632\u0629:",
    f1:"\u0639\u0631\u0636 \u0627\u0644\u0645\u0648\u0627\u0642\u0639 \u0627\u0644\u062F\u0642\u064A\u0642\u0629 \u0644\u062C\u0645\u064A\u0639 \u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062A", f2:"\u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0645\u0639 \u0627\u0644\u0628\u0627\u0626\u0639\u064A\u0646 \u0645\u0628\u0627\u0634\u0631\u0629", f3:"\u0627\u0644\u062A\u0642\u062F\u0645 \u0644\u0644\u0648\u0638\u0627\u0626\u0641 \u0641\u0648\u0631\u064B\u0627",
    f4:"\u0634\u0631\u0627\u0621 \u0627\u0644\u0633\u0644\u0639 \u0648\u0625\u062A\u0645\u0627\u0645 \u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A", f5:"\u0646\u0634\u0631 \u0625\u0639\u0644\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0645\u062D\u062F\u0648\u062F\u0629", f6:"\u0627\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0643\u0644 \u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644",
    upgrade:"\u062A\u0631\u0642\u064A\u0629", viewPlans:"\u0639\u0631\u0636 \u062E\u0637\u0637 \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643", from:"\u062A\u0628\u062F\u0623 \u0627\u0644\u062E\u0637\u0637 \u0645\u0646 500 \u0641\u0631\u0646\u0643 \u064A\u0648\u0645\u064A\u064B\u0627",
  },
  ff: {
    location_t:"Nokku suu\u0257ii", location_d:"U\u0253\u0253it nokku laa\u0253\u0257o e abonemaa kala!",
    contact_t:"Jokkondiral uddii", contact_d:"Abonno ngam jokkondirde e yeeyoo\u0253e!",
    apply_t:"Naamnal uddii", apply_d:"He\u0253 abonemaa ngam naamnaade golle e jokkondirde e gollinoo\u0253e!",
    buy_t:"Soodgol uddii", buy_d:"U\u0253\u0253it baaw\u0257e soodgol e abonemaa!",
    details_t:"Kabaruuji timmu\u0257i uddii", details_d:"Abonno ngam yiide kabaruuji fof!",
    post_t:"Neldugol uddii", post_d:"He\u0253 abonemaa ngam neldude jeeyngeeji maa e hewtude sooduu\u0253e!",
    unlock:"U\u0253\u0253it golle premiyom:",
    f1:"Yiide nokkuuji laa\u0253\u0257i jeeyngeeji fof", f2:"Jokkondirde e yeeyoo\u0253e \u0253anndu", f3:"Naamnaade golle law",
    f4:"Soodde kaake e timminde njulaaku", f5:"Neldude jeeyngeeji \u0257e ngalaa keerol", f6:"Hewtude kabaruuji timmu\u0257i fof",
    upgrade:"\u0181eydu", viewPlans:"Yiide peeje abonemaa", from:"Peeje ina pu\u0257\u0257oo gila 500 XAF e \u00F1alawma",
  },
};

interface SubscriptionWallProps {
  action: ActionKey;
  message?: string;
  compact?: boolean;
}

export default function SubscriptionWall({ action, message, compact = false }: SubscriptionWallProps) {
  const { language } = useLanguage();
  const lang: Lang = (["en","fr","pidgin","ar","ff"].includes(language) ? language : "en") as Lang;
  const tr = (k:string) => T[lang][k] || T.en[k] || k;
  const isRtl = lang === "ar";

  const iconFor: Record<ActionKey, JSX.Element> = {
    location: <Lock className="w-12 h-12 text-purple-500" />,
    contact:  <Shield className="w-12 h-12 text-purple-500" />,
    apply:    <Zap className="w-12 h-12 text-purple-500" />,
    buy:      <Crown className="w-12 h-12 text-purple-500" />,
    details:  <Lock className="w-12 h-12 text-purple-500" />,
    post:     <Zap className="w-12 h-12 text-purple-500" />,
  };

  const title = tr(`${action}_t`);
  const description = message || tr(`${action}_d`);
  const features = ["f1","f2","f3","f4","f5","f6"];

  if (compact) {
    return (
      <div dir={isRtl ? "rtl":"ltr"} className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Lock className="w-5 h-5 text-purple-600" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-purple-900">{title}</p>
            <p className="text-xs text-purple-700">{description}</p>
          </div>
          <Link to="/subscription" className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 text-sm font-bold transition-all whitespace-nowrap">
            {tr("upgrade")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div dir={isRtl ? "rtl":"ltr"} className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 border-2 border-purple-200 rounded-2xl p-8 text-center">
      <div className="flex justify-center mb-4">{iconFor[action]}</div>
      <h3 className="text-2xl font-bold text-purple-900 mb-2">{title}</h3>
      <p className="text-purple-700 mb-6 max-w-md mx-auto">{description}</p>
      <div className="bg-white rounded-xl p-6 mb-6 max-w-md mx-auto">
        <h4 className="font-bold text-gray-900 mb-3">{tr("unlock")}</h4>
        <ul className="text-left text-sm text-gray-700 space-y-2">
          {features.map(f => (
            <li key={f} className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">{"\u2713"}</span>
              <span>{tr(f)}</span>
            </li>
          ))}
        </ul>
      </div>
      <Link to="/subscription" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 font-bold text-lg shadow-lg transition-all">
        <Crown className="w-5 h-5" />
        {tr("viewPlans")}
      </Link>
      <p className="text-xs text-gray-500 mt-4">{tr("from")}</p>
    </div>
  );
}


