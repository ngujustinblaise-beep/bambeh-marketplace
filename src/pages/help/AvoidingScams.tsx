import { Link } from "react-router-dom";
import { AlertTriangle, XCircle, CheckCircle } from "lucide-react";
import { useLanguage } from "@/App";

type Lang = "en" | "fr" | "pidgin" | "ar" | "ff";
const T: Record<Lang, Record<string,string>> = {
  en: { title:"Avoiding Scams", subtitle:"Stay safe from fraud",
    redTitle:"Red Flags to Watch For",
    r1b:"Too good to be true prices", r1:"Items significantly below market value",
    r2b:"Pressure to act quickly", r2:'"Buy now or it is gone!"',
    r3b:"Payment before viewing", r3:"Never pay before seeing the item",
    r4b:"Wire transfer requests", r4:"These are hard to reverse",
    r5b:"Vague descriptions", r5:"Lack of specific details or photos",
    safeTitle:"Safe Practices", s1:"Meet in public places during daylight hours", s2:"Verify items before paying", s3:"Use secure payment methods", s4:"Trust your instincts",
    suspectTitle:"If You Suspect a Scam", suspectBody:"Report it immediately using our reporting system.", reportLink:"Learn how to report", back:"Back to Help Center" },
  fr: { title:"\u00C9viter les arnaques", subtitle:"Prot\u00E9gez-vous de la fraude",
    redTitle:"Signaux d'alerte \u00E0 surveiller",
    r1b:"Des prix trop beaux pour \u00EAtre vrais", r1:"Articles bien en dessous de la valeur du march\u00E9",
    r2b:"Pression pour agir vite", r2:'\u00AB Achetez maintenant ou c\u2019est perdu ! \u00BB',
    r3b:"Paiement avant inspection", r3:"Ne payez jamais avant d\u2019avoir vu l\u2019article",
    r4b:"Demandes de virement", r4:"Ils sont difficiles \u00E0 annuler",
    r5b:"Descriptions vagues", r5:"Manque de d\u00E9tails ou de photos pr\u00E9cises",
    safeTitle:"Bonnes pratiques", s1:"Rencontrez-vous dans des lieux publics en journ\u00E9e", s2:"V\u00E9rifiez les articles avant de payer", s3:"Utilisez des moyens de paiement s\u00FBrs", s4:"Faites confiance \u00E0 votre instinct",
    suspectTitle:"Si vous soup\u00E7onnez une arnaque", suspectBody:"Signalez-la imm\u00E9diatement via notre syst\u00E8me de signalement.", reportLink:"Apprenez \u00E0 signaler", back:"Retour au centre d'aide" },
  pidgin: { title:"How to Avoid Scam", subtitle:"Stay safe from fraud",
    redTitle:"Red Flag dem to Watch",
    r1b:"Price wey too sweet to be true", r1:"Things wey cheap pass market value well well",
    r2b:"Pressure to do am quick", r2:'"Buy now or e go finish!"',
    r3b:"Payment before you see am", r3:"Never pay before you see di item",
    r4b:"Wire transfer request", r4:"Dem hard to reverse",
    r5b:"Description wey no clear", r5:"No get specific detail or photo",
    safeTitle:"Safe Practice dem", s1:"Meet for public place for daytime", s2:"Check item before you pay", s3:"Use secure payment method", s4:"Trust your mind",
    suspectTitle:"If You Suspect Scam", suspectBody:"Report am sharp sharp with our reporting system.", reportLink:"Learn how to report", back:"Go back to Help Center" },
  ar: { title:"\u062A\u062C\u0646\u0651\u0628 \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0644", subtitle:"\u0627\u0628\u0642 \u0628\u0639\u064A\u062F\u064B\u0627 \u0639\u0646 \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0644",
    redTitle:"\u0639\u0644\u0627\u0645\u0627\u062A \u062A\u062D\u0630\u064A\u0631 \u064A\u062C\u0628 \u0627\u0644\u0627\u0646\u062A\u0628\u0627\u0647 \u0644\u0647\u0627",
    r1b:"\u0623\u0633\u0639\u0627\u0631 \u0623\u0641\u0636\u0644 \u0645\u0646 \u0623\u0646 \u062A\u0643\u0648\u0646 \u062D\u0642\u064A\u0642\u064A\u0629", r1:"\u0633\u0644\u0639 \u0623\u0642\u0644 \u0628\u0643\u062B\u064A\u0631 \u0645\u0646 \u0642\u064A\u0645\u0629 \u0627\u0644\u0633\u0648\u0642",
    r2b:"\u0627\u0644\u0636\u063A\u0637 \u0644\u0644\u062A\u0635\u0631\u0651\u0641 \u0628\u0633\u0631\u0639\u0629", r2:'"\u0627\u0634\u062A\u0631 \u0627\u0644\u0622\u0646 \u0648\u0625\u0644\u0627 \u0636\u0627\u0639\u062A!"',
    r3b:"\u0627\u0644\u062F\u0641\u0639 \u0642\u0628\u0644 \u0627\u0644\u0645\u0639\u0627\u064A\u0646\u0629", r3:"\u0644\u0627 \u062A\u062F\u0641\u0639 \u0623\u0628\u062F\u064B\u0627 \u0642\u0628\u0644 \u0631\u0624\u064A\u0629 \u0627\u0644\u0633\u0644\u0639\u0629",
    r4b:"\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062A\u062D\u0648\u064A\u0644 \u0627\u0644\u0628\u0646\u0643\u064A", r4:"\u064A\u0635\u0639\u0628 \u0627\u0633\u062A\u0631\u062F\u0627\u062F\u0647\u0627",
    r5b:"\u0623\u0648\u0635\u0627\u0641 \u063A\u0627\u0645\u0636\u0629", r5:"\u0646\u0642\u0635 \u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644 \u0623\u0648 \u0627\u0644\u0635\u0648\u0631 \u0627\u0644\u062F\u0642\u064A\u0642\u0629",
    safeTitle:"\u0645\u0645\u0627\u0631\u0633\u0627\u062A \u0622\u0645\u0646\u0629", s1:"\u0627\u0644\u062A\u0642\u0650 \u0641\u064A \u0623\u0645\u0627\u0643\u0646 \u0639\u0627\u0645\u0629 \u0646\u0647\u0627\u0631\u064B\u0627", s2:"\u062A\u062D\u0642\u0651\u0642 \u0645\u0646 \u0627\u0644\u0633\u0644\u0639 \u0642\u0628\u0644 \u0627\u0644\u062F\u0641\u0639", s3:"\u0627\u0633\u062A\u062E\u062F\u0645 \u0648\u0633\u0627\u0626\u0644 \u062F\u0641\u0639 \u0622\u0645\u0646\u0629", s4:"\u062B\u0642 \u0628\u062D\u062F\u0633\u0643",
    suspectTitle:"\u0625\u0630\u0627 \u0627\u0634\u062A\u0628\u0647\u062A \u0628\u0639\u0645\u0644\u064A\u0629 \u0627\u062D\u062A\u064A\u0627\u0644", suspectBody:"\u0623\u0628\u0644\u063A \u0639\u0646\u0647\u0627 \u0641\u0648\u0631\u064B\u0627 \u0639\u0628\u0631 \u0646\u0638\u0627\u0645 \u0627\u0644\u0625\u0628\u0644\u0627\u063A.", reportLink:"\u062A\u0639\u0644\u0651\u0645 \u0643\u064A\u0641 \u062A\u0628\u0644\u0651\u063A", back:"\u0627\u0644\u0639\u0648\u062F\u0629 \u0625\u0644\u0649 \u0645\u0631\u0643\u0632 \u0627\u0644\u0645\u0633\u0627\u0639\u062F\u0629" },
  ff: { title:"Wo\u0257\u0257itagol nguyka", subtitle:"Ñii\u0253u e kisal e janfa",
    redTitle:"Maandeeji ngam reentaade",
    r1b:"Coggi mo\u01B4\u01B4i no \u0253uri sago", r1:"Kaake \u0257e les njeenaari luumo no woory",
    r2b:"\u0181ittagol ngam gollaade law", r2:'"Soodu jooni walla a hattii!"',
    r3b:"Yo\u0253gol ado yi\u0301ude", r3:"Wata a yo\u0253u haa a yi\u0301i kaake \u0257e",
    r4b:"\u01B4amgol neldugol kaalis", r4:"Ina sa\u0257a ruttude \u0257i",
    r5b:"Sifaaji \u0253ula\u0257i", r5:"Ronkere kuyngal himmungal walla natalji",
    safeTitle:"Golle hi\u0253\u0257e", s1:"Hawru e nokkuuje jaltu\u0257e \u00F1alooma", s2:"\u01B4eewndo kaake ado yo\u0253gol", s3:"Huutoro mbaydiiji yo\u0253gol hi\u0253\u0257i", s4:"Hoolo miijo maa",
    suspectTitle:"So a sikkitii janfa", suspectBody:"\u01B4eewto law rewrude e nehgol \u01B4eewtaade amen.", reportLink:"Janngu no \u01B4eewtortoo", back:"Rutto to galle ballal" },
};

export default function AvoidingScams() {
  const { language } = useLanguage();
  const lang: Lang = (["en","fr","pidgin","ar","ff"].includes(language) ? language : "en") as Lang;
  const tr = (k:string) => T[lang][k] || T.en[k] || k;
  const isRtl = lang === "ar";
  const reds = [["r1b","r1"],["r2b","r2"],["r3b","r3"],["r4b","r4"],["r5b","r5"]];
  const safes = ["s1","s2","s3","s4"];
  return (
    <div dir={isRtl ? "rtl":"ltr"} className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold">{tr("title")}</h1>
              <p className="text-red-100">{tr("subtitle")}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <XCircle className="w-6 h-6 text-red-600" />{tr("redTitle")}
            </h2>
            <ul className="space-y-3 text-gray-700">
              {reds.map(([b,d]) => (
                <li key={b} className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">{"\u2022"}</span>
                  <span><strong>{tr(b)}</strong> - {tr(d)}</span>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />{tr("safeTitle")}
            </h2>
            <ul className="space-y-3 text-gray-700">
              {safes.map(s => (
                <li key={s} className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">{"\u2713"}</span>
                  <span>{tr(s)}</span>
                </li>
              ))}
            </ul>
          </section>
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-3">{"\uD83D\uDEA8 "}{tr("suspectTitle")}</h3>
            <p className="text-gray-700 mb-3">{tr("suspectBody")}</p>
            <Link to="/help/reporting-issues" className="text-red-600 hover:text-red-700 font-semibold">{tr("reportLink")}{" \u2192"}</Link>
          </div>
        </div>
        <div className="mt-8 text-center">
          <Link to="/help" className="text-teal-600 hover:text-teal-700 font-semibold">{"\u2190 "}{tr("back")}</Link>
        </div>
      </div>
    </div>
  );
}
