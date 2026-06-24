import { Link } from "react-router-dom";
import { Video } from "lucide-react";
import { useLanguage } from "@/App";

type Lang = "en" | "fr" | "pidgin" | "ar" | "ff";
const T: Record<Lang, Record<string,string>> = {
  en:     { title:"Video Tutorials", subtitle:"Watch and learn", started:"Getting Started", mins:"5 minutes", soon:"More tutorials coming soon", back:"Back to Help Center" },
  fr:     { title:"Tutoriels vid\u00E9o", subtitle:"Regardez et apprenez", started:"Pour commencer", mins:"5 minutes", soon:"D'autres tutoriels arrivent bient\u00F4t", back:"Retour au centre d'aide" },
  pidgin: { title:"Video Tutorials", subtitle:"Watch and learn", started:"How to Start", mins:"5 minutes", soon:"More tutorial dem dey come", back:"Go back to Help Center" },
  ar:     { title:"\u0627\u0644\u062F\u0631\u0648\u0633 \u0627\u0644\u0645\u0635\u0648\u0631\u0629", subtitle:"\u0634\u0627\u0647\u062F \u0648\u062A\u0639\u0644\u0651\u0645", started:"\u0627\u0644\u0628\u062F\u0621", mins:"5 \u062F\u0642\u0627\u0626\u0642", soon:"\u0627\u0644\u0645\u0632\u064A\u062F \u0645\u0646 \u0627\u0644\u062F\u0631\u0648\u0633 \u0642\u0631\u064A\u0628\u064B\u0627", back:"\u0627\u0644\u0639\u0648\u062F\u0629 \u0625\u0644\u0649 \u0645\u0631\u0643\u0632 \u0627\u0644\u0645\u0633\u0627\u0639\u062F\u0629" },
  ff:     { title:"Jannde widewooji", subtitle:"\u01B4eew tawaa janngaa", started:"Fu\u0257\u0257orde", mins:"hojomaaji 5", soon:"Jannde go\u0257\u0257e ina ngara", back:"Rutto to galle ballal" },
};

export default function VideoTutorials() {
  const { language } = useLanguage();
  const lang: Lang = (["en","fr","pidgin","ar","ff"].includes(language) ? language : "en") as Lang;
  const tr = (k:string) => T[lang][k] || T.en[k] || k;
  const isRtl = lang === "ar";
  return (
    <div dir={isRtl ? "rtl":"ltr"} className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3">
            <Video className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold">{tr("title")}</h1>
              <p className="text-purple-100">{tr("subtitle")}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="bg-gray-200 h-48 rounded-lg mb-4 flex items-center justify-center">
              <Video className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">{tr("started")}</h3>
            <p className="text-sm text-gray-600">{tr("mins")}</p>
          </div>
        </div>
        <div className="mt-8 text-center">
          <Link to="/help" className="text-teal-600 hover:text-teal-700 font-semibold">{"\u2190 "}{tr("back")}</Link>
        </div>
      </div>
    </div>
  );
}