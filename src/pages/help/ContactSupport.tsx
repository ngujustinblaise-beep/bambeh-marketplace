import { Link } from "react-router-dom";
import { MessageCircle, Mail, Phone, Clock } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const SUPPORT_EMAIL = "support@bambeh.com";
const SUPPORT_PHONE = "+237652953607";
const SUPPORT_PHONE_DISPLAY = "+237 652 953 607";

type Lang = "en" | "fr" | "pidgin" | "ar" | "ff";
const T: Record<Lang, Record<string,string>> = {
  en: { title:"Contact Support", subtitle:"We're here to help you!", getInTouch:"Get in Touch",
    emailUs:"Email Us", emailNote:"We typically respond within 24 hours",
    callUs:"Call Us", callNote:"Monday - Friday, 9am - 6pm WAT",
    chat:"Live Chat", chatDesc:"Chat with our support team", chatBtn:"Start Chat",
    hours:"Office Hours", hMonFri:"Monday - Friday: 9:00 AM - 6:00 PM", hSat:"Saturday: 10:00 AM - 4:00 PM", hSun:"Sunday: Closed",
    before:"Before You Contact Us", beforeBody:"Check our Help Center for quick answers to common questions!", browse:"Browse Help Articles", back:"Back to Help Center" },
  fr: { title:"Nous contacter", subtitle:"Nous sommes l\u00E0 pour vous aider !", getInTouch:"Entrer en contact",
    emailUs:"\u00C9crivez-nous", emailNote:"Nous r\u00E9pondons g\u00E9n\u00E9ralement sous 24 heures",
    callUs:"Appelez-nous", callNote:"Lundi - Vendredi, 9h - 18h WAT",
    chat:"Chat en direct", chatDesc:"Discutez avec notre \u00E9quipe d'assistance", chatBtn:"D\u00E9marrer le chat",
    hours:"Heures d'ouverture", hMonFri:"Lundi - Vendredi : 9h00 - 18h00", hSat:"Samedi : 10h00 - 16h00", hSun:"Dimanche : ferm\u00E9",
    before:"Avant de nous contacter", beforeBody:"Consultez notre centre d'aide pour des r\u00E9ponses rapides !", browse:"Parcourir les articles d'aide", back:"Retour au centre d'aide" },
  pidgin: { title:"Call Us", subtitle:"We dey here to help you!", getInTouch:"Reach Us",
    emailUs:"Email Us", emailNote:"We dey reply within 24 hours",
    callUs:"Call Us", callNote:"Monday - Friday, 9am - 6pm WAT",
    chat:"Live Chat", chatDesc:"Chat with our support team", chatBtn:"Start Chat",
    hours:"Office Hours", hMonFri:"Monday - Friday: 9:00 AM - 6:00 PM", hSat:"Saturday: 10:00 AM - 4:00 PM", hSun:"Sunday: E close",
    before:"Before You Contact Us", beforeBody:"Check our Help Center for quick answer to common question dem!", browse:"Check Help Article dem", back:"Go back to Help Center" },
  ar: { title:"\u0627\u062A\u0635\u0644 \u0628\u0646\u0627", subtitle:"\u0646\u062D\u0646 \u0647\u0646\u0627 \u0644\u0645\u0633\u0627\u0639\u062F\u062A\u0643!", getInTouch:"\u062A\u0648\u0627\u0635\u0644 \u0645\u0639\u0646\u0627",
    emailUs:"\u0631\u0627\u0633\u0644\u0646\u0627", emailNote:"\u0639\u0627\u062F\u0629\u064B \u0646\u0631\u062F \u062E\u0644\u0627\u0644 24 \u0633\u0627\u0639\u0629",
    callUs:"\u0627\u062A\u0635\u0644 \u0628\u0646\u0627", callNote:"\u0627\u0644\u0627\u062B\u0646\u064A\u0646 - \u0627\u0644\u062C\u0645\u0639\u0629\u060C 9\u0635 - 6\u0645 \u0628\u062A\u0648\u0642\u064A\u062A \u063A\u0631\u0628 \u0623\u0641\u0631\u064A\u0642\u064A\u0627",
    chat:"\u0627\u0644\u062F\u0631\u062F\u0634\u0629 \u0627\u0644\u0645\u0628\u0627\u0634\u0631\u0629", chatDesc:"\u062A\u062D\u062F\u0651\u062B \u0645\u0639 \u0641\u0631\u064A\u0642 \u0627\u0644\u062F\u0639\u0645", chatBtn:"\u0627\u0628\u062F\u0623 \u0627\u0644\u062F\u0631\u062F\u0634\u0629",
    hours:"\u0633\u0627\u0639\u0627\u062A \u0627\u0644\u0639\u0645\u0644", hMonFri:"\u0627\u0644\u0627\u062B\u0646\u064A\u0646 - \u0627\u0644\u062C\u0645\u0639\u0629: 9:00 \u0635 - 6:00 \u0645", hSat:"\u0627\u0644\u0633\u0628\u062A: 10:00 \u0635 - 4:00 \u0645", hSun:"\u0627\u0644\u0623\u062D\u062F: \u0645\u063A\u0644\u0642",
    before:"\u0642\u0628\u0644 \u0623\u0646 \u062A\u062A\u0648\u0627\u0635\u0644 \u0645\u0639\u0646\u0627", beforeBody:"\u062A\u0641\u0642\u0651\u062F \u0645\u0631\u0643\u0632 \u0627\u0644\u0645\u0633\u0627\u0639\u062F\u0629 \u0644\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0625\u062C\u0627\u0628\u0627\u062A \u0633\u0631\u064A\u0639\u0629!", browse:"\u062A\u0635\u0641\u0651\u062D \u0645\u0642\u0627\u0644\u0627\u062A \u0627\u0644\u0645\u0633\u0627\u0639\u062F\u0629", back:"\u0627\u0644\u0639\u0648\u062F\u0629 \u0625\u0644\u0649 \u0645\u0631\u0643\u0632 \u0627\u0644\u0645\u0633\u0627\u0639\u062F\u0629" },
  ff: { title:"Kontakta Amen", subtitle:"Min ngoodi \u0257oo ngam wallude ma!", getInTouch:"Hewtu min",
    emailUs:"Neldu iimeel", emailNote:"Min njaaboto no woory nder waktuuji 24",
    callUs:"Noddu min", callNote:"Altine - Mawnde, 9 subaka - 6 kikii\u0257e WAT",
    chat:"Yeewtere jaawnde", chatDesc:"Yeewtu e goomu ballal amen", chatBtn:"Fu\u0257\u0257u yeewtere",
    hours:"Waktuuji golle", hMonFri:"Altine - Mawnde: 9:00 - 18:00", hSat:"Aset: 10:00 - 16:00", hSun:"Alat: uddaa\u0257o",
    before:"Ado a hewtude min", beforeBody:"\u01B4eew galle ballal amen ngam jaabawuuji law!", browse:"\u01B4eew binndi ballal", back:"Rutto to galle ballal" },
};

export default function ContactSupport() {
  const { language } = useLanguage();
  const lang: Lang = (["en","fr","pidgin","ar","ff"].includes(language) ? language : "en") as Lang;
  const tr = (k:string) => T[lang][k] || T.en[k] || k;
  const isRtl = lang === "ar";
  return (
    <div dir={isRtl ? "rtl":"ltr"} className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold">{tr("title")}</h1>
              <p className="text-blue-100">{tr("subtitle")}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{tr("getInTouch")}</h2>
          <div className="space-y-6">
            <a href={`mailto:${SUPPORT_EMAIL}`} className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0"><Mail className="w-6 h-6 text-white" /></div>
              <div><h3 className="font-bold text-gray-900 mb-2">{tr("emailUs")}</h3><p className="text-gray-700 mb-2">{SUPPORT_EMAIL}</p><p className="text-sm text-gray-600">{tr("emailNote")}</p></div>
            </a>
            <a href={`tel:${SUPPORT_PHONE}`} className="flex items-start gap-4 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0"><Phone className="w-6 h-6 text-white" /></div>
              <div><h3 className="font-bold text-gray-900 mb-2">{tr("callUs")}</h3><p className="text-gray-700 mb-2" dir="ltr">{SUPPORT_PHONE_DISPLAY}</p><p className="text-sm text-gray-600">{tr("callNote")}</p></div>
            </a>
            <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0"><MessageCircle className="w-6 h-6 text-white" /></div>
              <div><h3 className="font-bold text-gray-900 mb-2">{tr("chat")}</h3><p className="text-gray-700 mb-2">{tr("chatDesc")}</p>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">{tr("chatBtn")}</button></div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0"><Clock className="w-6 h-6 text-white" /></div>
              <div><h3 className="font-bold text-gray-900 mb-2">{tr("hours")}</h3>
                <p className="text-gray-700">{tr("hMonFri")}</p><p className="text-gray-700">{tr("hSat")}</p><p className="text-gray-700">{tr("hSun")}</p></div>
            </div>
          </div>
        </div>
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-3">{"\uD83D\uDCA1 "}{tr("before")}</h3>
          <p className="text-gray-700 mb-4">{tr("beforeBody")}</p>
          <Link to="/help" className="inline-block px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold">{tr("browse")}</Link>
        </div>
        <div className="mt-8 text-center">
          <Link to="/help" className="text-teal-600 hover:text-teal-700 font-semibold">{"\u2190 "}{tr("back")}</Link>
        </div>
      </div>
    </div>
  );
}


