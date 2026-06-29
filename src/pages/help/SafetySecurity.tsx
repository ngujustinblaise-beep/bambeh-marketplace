import { Link } from "react-router-dom";
import { Shield, AlertTriangle, Users, Flag } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const T: Record<string, Record<string, string>> = {
  "en": {
    "title": "Safety & Security",
    "subtitle": "Your safety is our priority",
    "scamsTitle": "Avoiding Scams",
    "scamsDesc": "Learn to identify and avoid fraudulent listings",
    "meetTitle": "Meeting Safely",
    "meetDesc": "Best practices for in-person transactions",
    "reportTitle": "Reporting Issues",
    "reportDesc": "Report suspicious activity or content",
    "emergency": "Emergency",
    "emergencyMsg": "If you feel threatened or unsafe, contact local authorities immediately.",
    "back": "Back to Help Center"
  },
  "fr": {
    "title": "Sûreté et sécurité",
    "subtitle": "Votre sécurité est notre priorité",
    "scamsTitle": "Éviter les arnaques",
    "scamsDesc": "Apprenez à repérer et éviter les annonces frauduleuses",
    "meetTitle": "Se rencontrer en sécurité",
    "meetDesc": "Bonnes pratiques pour les transactions en personne",
    "reportTitle": "Signaler des problèmes",
    "reportDesc": "Signalez toute activité ou contenu suspect",
    "emergency": "Urgence",
    "emergencyMsg": "Si vous vous sentez menacé ou en danger, contactez immédiatement les autorités locales.",
    "back": "Retour au centre d'aide"
  },
  "pidgin": {
    "title": "Safety & Security",
    "subtitle": "Your safety na we main concern",
    "scamsTitle": "How to Avoid Scam",
    "scamsDesc": "Learn how to know and avoid fake listing dem",
    "meetTitle": "Meet Safe",
    "meetDesc": "Best way to do face-to-face deal",
    "reportTitle": "Report Problem dem",
    "reportDesc": "Report any suspicious thing or content",
    "emergency": "Emergency",
    "emergencyMsg": "If you feel say danger dey or you no safe, call di local authority dem sharp sharp.",
    "back": "Go back to Help Center"
  },
  "ar": {
    "title": "السلامة والأمان",
    "subtitle": "سلامتك هي أولويتنا",
    "scamsTitle": "تجنّب الاحتيال",
    "scamsDesc": "تعلّم كيÙ تتعرّÙ على الإعلانات الاحتيالية وتتجنّبها",
    "meetTitle": "اللقاء بأمان",
    "meetDesc": "أÙضل الممارسات للمعاملات الشخصية",
    "reportTitle": "الإبلاغ عن المشكلات",
    "reportDesc": "أبلغ عن أي نشاط أو محتوى مشبوه",
    "emergency": "طوارئ",
    "emergencyMsg": "إذا شعرت بالتهديد أو بعدم الأمان، Ùاتصل بالسلطات المحلية Ùورًا.",
    "back": "العودة إلى مركز المساعدة"
  },
  "ff": {
    "title": "Kisal e hisnde",
    "subtitle": "Kisal maa ko ko ɓuri himmude e amen",
    "scamsTitle": "Woɗɗitagol nguyka",
    "scamsDesc": "Janngu no anndirta e woɗɗitortoo jeeyle nguyka",
    "meetTitle": "Hawrugol e kisal",
    "meetDesc": "Mbaydiiji moƴƴi ngam njulaaku ɗo yeeso e yeeso",
    "reportTitle": "Ƴeewtagol caɗeele",
    "reportDesc": "Ƴeewto golle walla huunde sikkitiniinde",
    "emergency": "Heñoraare",
    "emergencyMsg": "So aɗa hulɓinaa walla a wonaa e kisal, heɓ laamɓe nokkuure maa law.",
    "back": "Rutto to galle ballal"
  }
};

export default function SafetySecurity() {
  const { language } = useLanguage();
  const lang = T[language] ? language : "en";
  const tr = (k: string) => (T[lang] && T[lang][k]) || T.en[k] || k;
  const isRtl = lang === "ar";
  const cards = [
    { titleKey: "scamsTitle", descKey: "scamsDesc", path: "/help/avoiding-scams", icon: AlertTriangle, box: "bg-red-100", fg: "text-red-600" },
    { titleKey: "meetTitle", descKey: "meetDesc", path: "/help/meeting-safely", icon: Users, box: "bg-blue-100", fg: "text-blue-600" },
    { titleKey: "reportTitle", descKey: "reportDesc", path: "/help/reporting-issues", icon: Flag, box: "bg-purple-100", fg: "text-purple-600" },
  ];
  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3">
            <Shield className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold">{tr("title")}</h1>
              <p className="text-red-100">{tr("subtitle")}</p>
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

        <div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-3">🚨 {tr("emergency")}</h3>
          <p className="text-gray-700">{tr("emergencyMsg")}</p>
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




