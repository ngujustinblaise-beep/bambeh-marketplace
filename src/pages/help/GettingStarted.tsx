import { Link } from "react-router-dom";
import { Rocket } from "lucide-react";
import { useLang } from '@/hooks/useAppLang';

const T: Record<string, Record<string, string>> = {
  "en": {
    "title": "Getting Started",
    "subtitle": "Welcome to Bambeh!",
    "welcome": "Welcome!",
    "intro": "Let's get you started on Bambeh in 3 easy steps.",
    "step1": "1. Create Your Account",
    "step2": "2. Set Up Your Profile",
    "step3": "3. Understand Zerm Coins"
  },
  "fr": {
    "title": "Pour commencer",
    "subtitle": "Bienvenue sur Bambeh !",
    "welcome": "Bienvenue !",
    "intro": "Commen?ons sur Bambeh en 3 ?tapes simples.",
    "step1": "1. Cr?ez votre compte",
    "step2": "2. Configurez votre profil",
    "step3": "3. Comprenez les Zerm Coins"
  },
  "pidgin": {
    "title": "How to Start",
    "subtitle": "Welcome to Bambeh!",
    "welcome": "Welcome!",
    "intro": "Make we start you for Bambeh with 3 easy step dem.",
    "step1": "1. Open Your Account",
    "step2": "2. Set Up Your Profile",
    "step3": "3. Understand Zerm Coins"
  },
  "ar": {
    "title": "?????",
    "subtitle": "?????? ?? ?? Bambeh!",
    "welcome": "??????!",
    "intro": "????? ??? ??? Bambeh ?? 3 ????? ????.",
    "step1": "1. ???? ?????",
    "step2": "2. ???? ???? ??????",
    "step3": "3. ???? Zerm Coins"
  },
  "ff": {
    "title": "Fu??orde",
    "subtitle": "Jam weli e Bambeh!",
    "welcome": "Jam weli!",
    "intro": "Ngaren fu??o?en Bambeh e pe??e 3 newii?e.",
    "step1": "1. Sosu konte maa",
    "step2": "2. Hebbin humpito maa",
    "step3": "3. Faamu Zerm Coins"
  }
};

export default function GettingStarted() {
  const currentLang = useLang();
    const lang = T[currentLang] ? currentLang : "en";
    const tr = (k: string) => (T[lang] && T[lang][k]) || T.en[k] || k;
    const isRtl = lang === "ar";
  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3">
            <Rocket className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold">{tr("title")}</h1>
              <p className="text-blue-100">{tr("subtitle")}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{tr("welcome")}</h2>
            <p className="text-gray-700">{tr("intro")}</p>
          </section>
          <div className="space-y-4">
            <Link to="/help/creating-account" className="block p-4 bg-blue-50 rounded-lg">
              <h3 className="font-bold text-gray-900">{tr("step1")}</h3>
            </Link>
            <Link to="/help/profile-setup" className="block p-4 bg-blue-50 rounded-lg">
              <h3 className="font-bold text-gray-900">{tr("step2")}</h3>
            </Link>
            <Link to="/help/understanding-zerm-coins" className="block p-4 bg-blue-50 rounded-lg">
              <h3 className="font-bold text-gray-900">{tr("step3")}</h3>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}





