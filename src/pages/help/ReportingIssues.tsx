import { Link } from "react-router-dom";
import { Flag, AlertCircle, Mail, CheckCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const SUPPORT_EMAIL = "support@bambeh.com";

type Lang = "en" | "fr" | "pidgin" | "ar" | "ff";
const T: Record<Lang, Record<string,string>> = {
  en: { title:"Reporting Issues", subtitle:"Help us keep Bambeh safe",
    whatTitle:"What You Can Report",
    i1:"Suspicious or fraudulent listings", i2:"Inappropriate content", i3:"Harassment or abusive behavior", i4:"Fake or scam accounts", i5:"Items that violate our policies", i6:"Counterfeit goods",
    howTitle:"How to Report", s1:"Find the Report button on any listing or profile", s2:"Select the reason for your report", s3:"Provide additional details if needed", s4:"Submit your report to our team",
    afterTitle:"What Happens Next", afterBody:"Our team reviews every report within 24-48 hours. We take appropriate action which may include removing content, warning users, or suspending accounts.",
    urgentTitle:"Urgent Issues", urgentBody:"For urgent safety concerns, contact our support team directly:", emailBtn:"Email Support", back:"Back to Help Center" },
  fr: { title:"Signaler des probl\u00E8mes", subtitle:"Aidez-nous \u00E0 garder Bambeh s\u00FBr",
    whatTitle:"Ce que vous pouvez signaler",
    i1:"Annonces suspectes ou frauduleuses", i2:"Contenu inappropri\u00E9", i3:"Harc\u00E8lement ou comportement abusif", i4:"Comptes faux ou frauduleux", i5:"Articles qui violent nos r\u00E8gles", i6:"Produits contrefaits",
    howTitle:"Comment signaler", s1:"Trouvez le bouton Signaler sur une annonce ou un profil", s2:"S\u00E9lectionnez la raison de votre signalement", s3:"Fournissez des d\u00E9tails suppl\u00E9mentaires si n\u00E9cessaire", s4:"Envoyez votre signalement \u00E0 notre \u00E9quipe",
    afterTitle:"Ce qui se passe ensuite", afterBody:"Notre \u00E9quipe examine chaque signalement sous 24 \u00E0 48 heures. Nous prenons les mesures appropri\u00E9es : retrait de contenu, avertissement ou suspension de comptes.",
    urgentTitle:"Probl\u00E8mes urgents", urgentBody:"Pour les probl\u00E8mes de s\u00E9curit\u00E9 urgents, contactez directement notre \u00E9quipe :", emailBtn:"Contacter par e-mail", back:"Retour au centre d'aide" },
  pidgin: { title:"Report Problem dem", subtitle:"Help us keep Bambeh safe",
    whatTitle:"Wetin You Fit Report",
    i1:"Listing wey suspicious or na fraud", i2:"Content wey no correct", i3:"Harassment or bad behavior", i4:"Fake or scam account", i5:"Things wey break our rules", i6:"Fake goods",
    howTitle:"How to Report", s1:"Find di Report button for any listing or profile", s2:"Choose di reason for your report", s3:"Add more details if e necessary", s4:"Send your report give our team",
    afterTitle:"Wetin Go Happen Next", afterBody:"Our team dey check every report within 24-48 hours. We go take action wey fit be say we remove content, warn user, or block account.",
    urgentTitle:"Urgent Problem dem", urgentBody:"For urgent safety wahala, contact our support team direct:", emailBtn:"Email Support", back:"Go back to Help Center" },
  ar: { title:"\u0627\u0644\u0625\u0628\u0644\u0627\u063A \u0639\u0646 \u0627\u0644\u0645\u0634\u0643\u0644\u0627\u062A", subtitle:"\u0633\u0627\u0639\u062F\u0646\u0627 \u0641\u064A \u0627\u0644\u062D\u0641\u0627\u0638 \u0639\u0644\u0649 \u0623\u0645\u0627\u0646 Bambeh",
    whatTitle:"\u0645\u0627 \u064A\u0645\u0643\u0646\u0643 \u0627\u0644\u0625\u0628\u0644\u0627\u063A \u0639\u0646\u0647",
    i1:"\u0625\u0639\u0644\u0627\u0646\u0627\u062A \u0645\u0634\u0628\u0648\u0647\u0629 \u0623\u0648 \u0627\u062D\u062A\u064A\u0627\u0644\u064A\u0629", i2:"\u0645\u062D\u062A\u0648\u0649 \u063A\u064A\u0631 \u0644\u0627\u0626\u0642", i3:"\u062A\u062D\u0631\u0651\u0634 \u0623\u0648 \u0633\u0644\u0648\u0643 \u0645\u0633\u064A\u0621", i4:"\u062D\u0633\u0627\u0628\u0627\u062A \u0645\u0632\u064A\u0641\u0629 \u0623\u0648 \u0627\u062D\u062A\u064A\u0627\u0644\u064A\u0629", i5:"\u0633\u0644\u0639 \u062A\u0646\u062A\u0647\u0643 \u0633\u064A\u0627\u0633\u0627\u062A\u0646\u0627", i6:"\u0628\u0636\u0627\u0626\u0639 \u0645\u0642\u0644\u0651\u062F\u0629",
    howTitle:"\u0643\u064A\u0641\u064A\u0629 \u0627\u0644\u0625\u0628\u0644\u0627\u063A", s1:"\u0627\u0628\u062D\u062B \u0639\u0646 \u0632\u0631 \u0627\u0644\u0625\u0628\u0644\u0627\u063A \u0641\u064A \u0623\u064A \u0625\u0639\u0644\u0627\u0646 \u0623\u0648 \u0645\u0644\u0641 \u0634\u062E\u0635\u064A", s2:"\u0627\u062E\u062A\u0631 \u0633\u0628\u0628 \u0627\u0644\u0625\u0628\u0644\u0627\u063A", s3:"\u0642\u062F\u0651\u0645 \u062A\u0641\u0627\u0635\u064A\u0644 \u0625\u0636\u0627\u0641\u064A\u0629 \u0625\u0646 \u0644\u0632\u0645", s4:"\u0623\u0631\u0633\u0644 \u0628\u0644\u0627\u063A\u0643 \u0625\u0644\u0649 \u0641\u0631\u064A\u0642\u0646\u0627",
    afterTitle:"\u0645\u0627\u0630\u0627 \u064A\u062D\u062F\u062B \u0628\u0639\u062F \u0630\u0644\u0643", afterBody:"\u064A\u0631\u0627\u062C\u0639 \u0641\u0631\u064A\u0642\u0646\u0627 \u0643\u0644 \u0628\u0644\u0627\u063A \u062E\u0644\u0627\u0644 24-48 \u0633\u0627\u0639\u0629. \u0646\u062A\u062E\u0630 \u0627\u0644\u0625\u062C\u0631\u0627\u0621 \u0627\u0644\u0645\u0646\u0627\u0633\u0628 \u0648\u0642\u062F \u064A\u0634\u0645\u0644 \u0625\u0632\u0627\u0644\u0629 \u0627\u0644\u0645\u062D\u062A\u0648\u0649 \u0623\u0648 \u062A\u062D\u0630\u064A\u0631 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646 \u0623\u0648 \u062A\u0639\u0644\u064A\u0642 \u0627\u0644\u062D\u0633\u0627\u0628\u0627\u062A.",
    urgentTitle:"\u0645\u0633\u0627\u0626\u0644 \u0639\u0627\u062C\u0644\u0629", urgentBody:"\u0644\u0644\u0645\u062E\u0627\u0648\u0641 \u0627\u0644\u0623\u0645\u0646\u064A\u0629 \u0627\u0644\u0639\u0627\u062C\u0644\u0629\u060C \u062A\u0648\u0627\u0635\u0644 \u0645\u0639 \u0641\u0631\u064A\u0642 \u0627\u0644\u062F\u0639\u0645 \u0645\u0628\u0627\u0634\u0631\u0629:", emailBtn:"\u0631\u0627\u0633\u0644 \u0627\u0644\u062F\u0639\u0645", back:"\u0627\u0644\u0639\u0648\u062F\u0629 \u0625\u0644\u0649 \u0645\u0631\u0643\u0632 \u0627\u0644\u0645\u0633\u0627\u0639\u062F\u0629" },
  ff: { title:"\u01B4eewtagol ca\u0257eele", subtitle:"Wallu min reena Bambeh hisii",
    whatTitle:"Ko mbaa\u0257aa \u01B4eewtaade",
    i1:"Jeeyngal sikkiti\u0301\u0301i\u0301 walla nguyka", i2:"Ko\u0257ol mo na\u0257aa", i3:"Tooñ ange walla golle bonɗe", i4:"Konteeji penaale walla nguyka", i5:"Kaake luttu\u0257e laabi amen", i6:"Marsandiisaaji penaale",
    howTitle:"No \u01B4eewtortoo", s1:"\u01B4eew bot\u00F5 \u01B4eewtaade e jeeyngal walla profil kala", s2:"Su\u0253o sabaabu \u01B4eewtaare maa", s3:"\u0181eydu kabaruuji so ina hatojinaa", s4:"Neldu \u01B4eewtaare maa to goomu amen",
    afterTitle:"Ko ari\u0301i\u0301 caggal", afterBody:"Goomu amen ina \u01B4eewa \u01B4eewtaare kala nder waktuuji 24-48. Min ngolla golle hawru\u0257e e\u0257e mbaawi wonde ittugol ko\u0257ol, rentingol huutoro\u0257e, walla daa\u0257gol konteeji.",
    urgentTitle:"Ca\u0257eele he\u00F1ere", urgentBody:"Ngam ca\u0257eele kisal he\u00F1ere, hewtu goomu ballal amen e \u0253anndu:", emailBtn:"Neldu iimeel ballal", back:"Rutto to galle ballal" },
};

export default function ReportingIssues() {
  const { language } = useLanguage();
  const lang: Lang = (["en","fr","pidgin","ar","ff"].includes(language) ? language : "en") as Lang;
  const tr = (k:string) => T[lang][k] || T.en[k] || k;
  const isRtl = lang === "ar";
  const items = ["i1","i2","i3","i4","i5","i6"];
  const steps = ["s1","s2","s3","s4"];
  return (
    <div dir={isRtl ? "rtl":"ltr"} className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3">
            <Flag className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold">{tr("title")}</h1>
              <p className="text-orange-100">{tr("subtitle")}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-orange-600" />{tr("whatTitle")}
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-700">
              {items.map(i => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">{"\u2022"}</span><span>{tr(i)}</span>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{tr("howTitle")}</h2>
            <div className="space-y-4">
              {steps.map((s,idx) => (
                <div key={s} className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">{idx+1}</div>
                  <p className="text-gray-700 pt-1">{tr(s)}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />{tr("afterTitle")}
            </h3>
            <p className="text-gray-700">{tr("afterBody")}</p>
          </section>
          <section className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-3">{"\uD83D\uDEA8 "}{tr("urgentTitle")}</h3>
            <p className="text-gray-700 mb-4">{tr("urgentBody")}</p>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold">
              <Mail className="w-5 h-5" />{tr("emailBtn")}
            </a>
          </section>
        </div>
        <div className="mt-8 text-center">
          <Link to="/help" className="text-teal-600 hover:text-teal-700 font-semibold">{"\u2190 "}{tr("back")}</Link>
        </div>
      </div>
    </div>
  );
}

