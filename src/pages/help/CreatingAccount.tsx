import { Link } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { useLang } from '@/hooks/useAppLang';

const T: Record<string, Record<string, string>> = {
  "en": {
    "title": "Creating an Account",
    "subtitle": "Join Bambeh today!",
    "how": "How to Sign Up",
    "s1": "Click \"Sign Up\" in the header",
    "s2": "Enter your email and create a password",
    "s3": "Verify your email address",
    "s4": "Complete your profile",
    "s5": "Start browsing and posting!",
    "cta": "Create Account Now",
    "back": "Back to Help Center"
  },
  "fr": {
    "title": "CrÃ©er un compte",
    "subtitle": "Rejoignez Bambeh dÃ¨s aujourd'hui !",
    "how": "Comment s'inscrire",
    "s1": "Cliquez sur Â« S'inscrire Â» dans l'en-tÃªte",
    "s2": "Saisissez votre e-mail et crÃ©ez un mot de passe",
    "s3": "VÃ©rifiez votre adresse e-mail",
    "s4": "ComplÃ©tez votre profil",
    "s5": "Commencez Ã  explorer et Ã  publier !",
    "cta": "CrÃ©er un compte maintenant",
    "back": "Retour au centre d'aide"
  },
  "pidgin": {
    "title": "How to Open Account",
    "subtitle": "Join Bambeh today!",
    "how": "How to Sign Up",
    "s1": "Press \"Sign Up\" for di top",
    "s2": "Put your email and create password",
    "s3": "Verify your email",
    "s4": "Complete your profile",
    "s5": "Start to dey browse and post!",
    "cta": "Open Account Now",
    "back": "Go back to Help Center"
  },
  "ar": {
    "title": "Ø¥Ù†Ø´Ø§Ø¡ Ø­Ø³Ø§Ø¨",
    "subtitle": "Ø§Ù†Ø¶Ù… Ø¥Ù„Ù‰ Bambeh Ø§Ù„ÙŠÙˆÙ…!",
    "how": "ÙƒÙŠÃ™ÂÙŠØ© Ø§Ù„ØªØ³Ø¬ÙŠÙ„",
    "s1": "Ø§Ø¶ØºØ· Ø¹Ù„Ù‰ Â«Ø§Ù„ØªØ³Ø¬ÙŠÙ„Â» Ã™ÂÙŠ Ø§Ù„Ø£Ø¹Ù„Ù‰",
    "s2": "Ø£Ø¯Ø®Ù„ Ø¨Ø±ÙŠØ¯Ùƒ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ ÙˆØ£Ù†Ø´Ø¦ ÙƒÙ„Ù…Ø© Ù…Ø±ÙˆØ±",
    "s3": "ÙˆØ«Ù‘Ù‚ Ø¹Ù†ÙˆØ§Ù† Ø¨Ø±ÙŠØ¯Ùƒ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ",
    "s4": "Ø£ÙƒÙ…Ù„ Ù…Ù„Ã™ÂÙƒ Ø§Ù„Ø´Ø®ØµÙŠ",
    "s5": "Ø§Ø¨Ø¯Ø£ Ø§Ù„ØªØµÃ™ÂØ­ ÙˆØ§Ù„Ù†Ø´Ø±!",
    "cta": "Ø£Ù†Ø´Ø¦ Ø­Ø³Ø§Ø¨Ù‹Ø§ Ø§Ù„Ø¢Ù†",
    "back": "Ø§Ù„Ø¹ÙˆØ¯Ø© Ø¥Ù„Ù‰ Ù…Ø±ÙƒØ² Ø§Ù„Ù…Ø³Ø§Ø¹Ø¯Ø©"
  },
  "ff": {
    "title": "Sosgol konte",
    "subtitle": "Naatu e Bambeh hannde!",
    "how": "No winnditortoo",
    "s1": "Ã‘iÉ“ \"Winndito\" ka dow",
    "s2": "Naatnu iimeel maa sosaa finnde",
    "s3": "TeeÅ‹tin iimeel maa",
    "s4": "Timmin humpito maa",
    "s5": "FuÉ—É—o Æ´eewde e neldude!",
    "cta": "Sosu konte jooni",
    "back": "Rutto to galle ballal"
  }
};

export default function CreatingAccount() {
  const currentLang = useLang();
    const lang = T[currentLang] ? currentLang : "en";
    const tr = (k: string) => (T[lang] && T[lang][k]) || T.en[k] || k;
    const isRtl = lang === "ar";
  const steps = ["s1", "s2", "s3", "s4", "s5"];
  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-gradient-to-r from-green-600 to-green-800 text-white rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3">
            <UserPlus className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold">{tr("title")}</h1>
              <p className="text-green-100">{tr("subtitle")}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{tr("how")}</h2>
            <ol className="space-y-3 text-gray-700">
              {steps.map((s, i) => (
                <li key={s} className="flex gap-3">
                  <span className="font-bold text-green-600">{i + 1}.</span>
                  <span>{tr(s)}</span>
                </li>
              ))}
            </ol>
          </section>
          <Link to="/register" className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">
            {tr("cta")}
          </Link>
        </div>
        <div className="mt-8 text-center">
          <Link to="/help" className="text-teal-600 hover:text-teal-700 font-semibold">
            â† {tr("back")}
          </Link>
        </div>
      </div>
    </div>
  );
}






