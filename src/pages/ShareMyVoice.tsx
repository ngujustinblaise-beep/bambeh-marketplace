/**
 * src/pages/ShareMyVoice.tsx ? Bambeh Marketplace
 *
 * NEW PAGE: User experience feedback form.
 * Accessible from the "Share My Voice" menu item.
 * Saves to Supabase user_feedback table + localStorage fallback.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Send, CheckCircle, MessageSquare, Smile, Frown, Meh } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLang, t } from "@/hooks/useAppLang";

type Mood = "love" | "good" | "okay" | "bad" | null;
type Category = "general" | "buying" | "selling" | "payment" | "support" | "bug";

const COPY = {
  en: {
    sendFailed: "Could not send. Please check your connection and try again — your message is still here.",
    title: "Share My Voice",
    subtitle: "Tell us about your experience",
    yourVoiceMatters: "Your Voice Matters",
    intro:
      "Help us build the best marketplace in Cameroon. Share what you love, what can be improved, or any bugs you encounter. Every word counts!",
    howDoYouFeel: "How do you feel about Bambeh? *",
    rateExperience: "Rate your overall experience *",
    whatIsThisAbout: "What is this about?",
    summary: "Summary",
    optional: "(optional)",
    yourExperience: "Your Experience *",
    experiencePlaceholder:
      "Tell us what happened, what you liked, what could be better, or describe a bug you found...",
    contact: "Contact",
    contactNote: "(optional — for follow-up only)",
    yourName: "Your name",
    sendFeedback: "Send Feedback",
    sending: "Sending...",
    thankYou: "Thank You! 🎉",
    received:
      "Your feedback has been received. We read every single message and use it to make Bambeh better for everyone in Cameroon.",
    team: "💚 The Bambeh Team 🇨🇲",
    goBack: "Go Back",
    veryPoor: "Very Poor",
    poor: "Poor",
    fair: "Fair",
    good: "Good",
    excellent: "Excellent!",
    selectMoodNotice:
      "Please select a mood, give a star rating, and write at least 10 characters.",
    everyWordCounts: "Every word counts!",
    moodLove: "Love it!",
    moodGood: "Good",
    moodOkay: "Okay",
    moodBad: "Needs work",
    generalExperience: "General Experience",
    buyingOnBambeh: "Buying on Bambeh",
    sellingOnBambeh: "Selling on Bambeh",
    paymentsSubscriptions: "Payments & Subscriptions",
    customerSupport: "Customer Support",
    bugIssue: "Bug / Technical Issue",
    followUp: "We only use this to follow up on your feedback. We never share it.",
    weReadEveryMessage: "We read every single message.",
  },
  fr: {
    sendFailed: "Envoi impossible. Vérifiez votre connexion et réessayez — votre message est toujours là.",
    title: 'Donner mon avis',
    subtitle: 'Racontez-nous votre expérience',
    yourVoiceMatters: 'Votre avis compte',
    intro:
      'Aidez-nous à construire la meilleure marketplace au Cameroun. Dites-nous ce que vous aimez, ce qui peut être amélioré ou les bugs que vous rencontrez. Chaque mot compte !',
    howDoYouFeel: 'Que pensez-vous de Bambeh ? *',
    rateExperience: 'Évaluez votre expérience globale *',
    whatIsThisAbout: 'De quoi s’agit-il ?',
    summary: 'Résumé',
    optional: '(facultatif)',
    yourExperience: 'Votre expérience *',
    experiencePlaceholder:
      'Racontez ce qui s’est passé, ce que vous avez apprécié, ce qui pourrait être amélioré, ou décrivez un bug rencontré...',
    contact: 'Coordonnées',
    contactNote: '(facultatif — uniquement pour un suivi)',
    yourName: 'Votre nom',
    sendFeedback: 'Envoyer',
    sending: 'Envoi en cours...',
    thankYou: 'Merci ! 🎉',
    received:
      'Votre retour a bien été reçu. Nous lisons chaque message et nous l’utilisons pour améliorer Bambeh pour tout le monde au Cameroun.',
    team: '💚 L’équipe Bambeh 🇨🇲',
    goBack: 'Retour',
    veryPoor: 'Très mauvais',
    poor: 'Mauvais',
    fair: 'Correct',
    good: 'Bien',
    excellent: 'Excellent !',
    selectMoodNotice:
      'Veuillez choisir une humeur, attribuer une note et écrire au moins 10 caractères.',
    everyWordCounts: 'Chaque mot compte !',
    moodLove: 'J’adore !',
    moodGood: 'Bien',
    moodOkay: 'Ça va',
    moodBad: 'À améliorer',
    generalExperience: 'Expérience générale',
    buyingOnBambeh: 'Achat sur Bambeh',
    sellingOnBambeh: 'Vente sur Bambeh',
    paymentsSubscriptions: 'Paiements et abonnements',
    customerSupport: 'Service client',
    bugIssue: 'Bug / problème technique',
    followUp: 'Nous utilisons ces informations uniquement pour vous recontacter. Elles ne sont jamais partagées.',
    weReadEveryMessage: 'Nous lisons chaque message.',
  },
  ar: {
    sendFailed: "تعذّر الإرسال. تحقق من اتصالك وحاول مرة أخرى — رسالتك ما زالت موجودة.",
    title: 'شارك صوتك',
    subtitle: 'أخبرنا عن تجربتك',
    yourVoiceMatters: 'صوتك مهم',
    intro:
      'ساعدنا في بناء أفضل منصة للبيع والشراء في الكاميرون. شاركنا ما تحبه، وما يمكن تحسينه، أو أي خلل تصادفه. كل كلمة تهم!',
    howDoYouFeel: 'كيف تشعر تجاه Bambeh؟ *',
    rateExperience: 'قيّم تجربتك بشكل عام *',
    whatIsThisAbout: 'ما موضوع هذا؟',
    summary: 'ملخص',
    optional: '(اختياري)',
    yourExperience: 'تجربتك *',
    experiencePlaceholder:
      'أخبرنا بما حدث، وما أعجبك، وما يمكن أن يكون أفضل، أو صف أي خلل وجدته...',
    contact: 'وسيلة التواصل',
    contactNote: '(اختياري — للمتابعة فقط)',
    yourName: 'اسمك',
    sendFeedback: 'إرسال الملاحظات',
    sending: 'جارٍ الإرسال...',
    thankYou: 'شكرًا لك! 🎉',
    received:
      'لقد وصلتنا ملاحظاتك. نحن نقرأ كل رسالة ونستخدمها لجعل Bambeh أفضل للجميع في الكاميرون.',
    team: '💚 فريق Bambeh 🇨🇲',
    goBack: 'رجوع',
    veryPoor: 'ضعيف جدًا',
    poor: 'ضعيف',
    fair: 'مقبول',
    good: 'جيد',
    excellent: 'ممتاز!',
    selectMoodNotice:
      'يرجى اختيار شعورك، وإعطاء تقييم بالنجوم، وكتابة 10 أحرف على الأقل.',
    everyWordCounts: 'كل كلمة مهمة!',
    moodLove: 'أحبه!',
    moodGood: 'جيد',
    moodOkay: 'لا بأس',
    moodBad: 'يحتاج إلى تحسين',
    generalExperience: 'تجربة عامة',
    buyingOnBambeh: 'الشراء على Bambeh',
    sellingOnBambeh: 'البيع على Bambeh',
    paymentsSubscriptions: 'المدفوعات والاشتراكات',
    customerSupport: 'دعم العملاء',
    bugIssue: 'خلل / مشكلة تقنية',
    followUp: 'نستخدم هذه المعلومات فقط للمتابعة معك، ولا نشاركها أبدًا.',
    weReadEveryMessage: 'نقرأ كل رسالة.',
  },
  pidgin: {
    sendFailed: "E no send. Check your network and try again — your message still dey here.",
    title: 'Share My Voice',
    subtitle: 'Tell us how your experience be',
    yourVoiceMatters: 'Your voice dey matter',
    intro:
      'Help us build the best marketplace for Cameroon. Tell us wetin you like, wetin fit improve, or any bug wey you see. Every word dey count!',
    howDoYouFeel: 'How you feel about Bambeh? *',
    rateExperience: 'Rate your overall experience *',
    whatIsThisAbout: 'This one na about wetin?',
    summary: 'Summary',
    optional: '(optional)',
    yourExperience: 'Your experience *',
    experiencePlaceholder:
      'Tell us wetin happen, wetin you like, wetin fit beta, or describe any bug wey you find...',
    contact: 'Contact',
    contactNote: '(optional — for follow-up only)',
    yourName: 'Your name',
    sendFeedback: 'Send feedback',
    sending: 'Dey send...',
    thankYou: 'Thank you! 🎉',
    received:
      'We don receive your feedback. We dey read every message and use am make Bambeh better for everybody for Cameroon.',
    team: '💚 The Bambeh Team 🇨🇲',
    goBack: 'Go back',
    veryPoor: 'Very poor',
    poor: 'Poor',
    fair: 'Fair',
    good: 'Good',
    excellent: 'Excellent!',
    selectMoodNotice:
      'Please choose mood, give star rating, and write at least 10 characters.',
    everyWordCounts: 'Every word dey count!',
    moodLove: 'Love am!',
    moodGood: 'Good',
    moodOkay: 'Okay',
    moodBad: 'Need work',
    generalExperience: 'General experience',
    buyingOnBambeh: 'Buying for Bambeh',
    sellingOnBambeh: 'Selling for Bambeh',
    paymentsSubscriptions: 'Payments and subscriptions',
    customerSupport: 'Customer support',
    bugIssue: 'Bug / technical issue',
    followUp: 'We dey use this only to follow up with you. We no dey share am.',
    weReadEveryMessage: 'We dey read every single message.',
  },
  ful: {
    sendFailed: "Neldugol waawaa. ƴeewto jokkondiral maa, etto goɗɗum — Ɓataake maa ina heen tan.",
    title: 'Hollu Ko Aɗa Sema',
    subtitle: 'Yamno min hakkunde dow ko a heɓi',
    yourVoiceMatters: 'Ko a holli ɗoo no feewi',
    intro:
      'Hokku min laawol ngam wonde marketplace ɓuri no ɗow ka Cameroon. Hollu ko a yiɗi, ko waawi ɓeydugol, walla bugaji nde a heɓi. Kala ɗum no ɗow!',
    howDoYouFeel: 'Ndeen a wiiri e Bambeh no feewi? *',
    rateExperience: 'Hokku nottooje kala e maa *',
    whatIsThisAbout: 'Ndeen ɗoo no hakkunde hono?',
    summary: 'Cappanɗe',
    optional: '(yeesowol)',
    yourExperience: 'Ko a heɓi *',
    experiencePlaceholder:
      'Yamno min ko waɗi, ko a yiɗi, ko waawi ɓeydugol, walla bug ɗoo a heɓi...',
    contact: 'Hollitaango',
    contactNote: '(yeesowol — ngam ɗoo e fuɗɗo)',
    yourName: 'Innde maa',
    sendFeedback: 'Neldu jangu',
    sending: 'Dey neldu...',
    thankYou: 'A jaaraama! 🎉',
    received:
      'Min heɓii jangu maa. Minndaa e njaŋtude kala haala, min huutora ɗum ngam Bambeh ɓeyduɗe ngam yimɓe Cameroon kala.',
    team: '💚 Ekip Bambeh 🇨🇲',
    goBack: 'Rutto',
    veryPoor: 'Mo wonii no feewi kala',
    poor: 'Mo ɗow',
    fair: 'Ndi ɗow',
    good: 'Mo ɓuri',
    excellent: 'Mo ɗow faa fuu!',
    selectMoodNotice:
      'Suɓo haalorde maa, hokku nottooje e hoto 10 keɓe min.',
    everyWordCounts: 'Kala ɗum no feewi!',
    moodLove: 'Mi yiɗi ɗum!',
    moodGood: 'Mo ɓuri',
    moodOkay: 'Ndi ɗow',
    moodBad: 'Eeyyduɗe',
    generalExperience: 'Haalorde kala',
    buyingOnBambeh: 'Laawol gollal e Bambeh',
    sellingOnBambeh: 'Laawol sellal e Bambeh',
    paymentsSubscriptions: 'Feyde e abbonam',
    customerSupport: 'Wallafude ɓe yittii',
    bugIssue: 'Bug / heɓugol tekniki',
    followUp: 'Min huutora ɗoo tan ngam hollude ma. Min numma ɗum.',
    weReadEveryMessage: 'Min njaŋtata kala haala.',
  },
};

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "general", label: "General Experience" },
  { value: "buying", label: "Buying on Bambeh" },
  { value: "selling", label: "Selling on Bambeh" },
  { value: "payment", label: "Payments & Subscriptions" },
  { value: "support", label: "Customer Support" },
  { value: "bug", label: "Bug / Technical Issue" },
];

const MOOD_CONFIG = [
  { value: "love" as Mood, emoji: "😍", label: "Love it!", color: "bg-green-100 border-green-400 text-green-700" },
  { value: "good" as Mood, emoji: "🙂", label: "Good", color: "bg-teal-100 border-teal-400 text-teal-700" },
  { value: "okay" as Mood, emoji: "😐", label: "Okay", color: "bg-amber-100 border-amber-400 text-amber-700" },
  { value: "bad" as Mood, emoji: "😕", label: "Needs work", color: "bg-red-100 border-red-400 text-red-700" },
];

export default function ShareMyVoice() {
  const lang = useLang();
  const ui = COPY[lang] ?? COPY[lang === 'ff' ? 'ful' : lang] ?? COPY.en;
  const navigate = useNavigate();
  const [mood, setMood] = useState<Mood>(null);
  const [rating, setRating] = useState(0);
  const [hoverStar, setHoverStar] = useState(0);
  const [category, setCategory] = useState<Category>("general");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = mood !== null && rating > 0 && message.trim().length >= 10;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    const feedback = {
      mood,
      rating,
      category,
      title: title.trim() || undefined,
      message: message.trim(),
      name: name.trim() || undefined,
      email: email.trim() || undefined,
      submitted_at: new Date().toISOString(),
      page_url: window.location.href,
    };

    try {
      const stored = JSON.parse(localStorage.getItem("bambeh_feedback") || "[]");
      stored.unshift(feedback);
      localStorage.setItem("bambeh_feedback", JSON.stringify(stored));
    } catch {}

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { error: dbErr } = await supabase.from("user_feedback").insert({
        user_id: session?.user?.id ?? null,
        mood,
        rating,
        category,
        title: feedback.title,
        message: feedback.message,
        name: feedback.name,
        email: feedback.email,
        submitted_at: feedback.submitted_at,
      });
      if (dbErr) throw dbErr;
    } catch (err) {
      console.error("[ShareMyVoice] could not save feedback:", err);
      setError(ui.sendFailed);
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setDone(true);
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-14 h-14 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{ui.thankYou}</h2>
        <p className="text-gray-500 mb-2 max-w-xs">
          {ui.received}
        </p>
        <p className="text-sm text-teal-600 font-semibold mb-8">{ui.team}</p>
        <button
          onClick={() => navigate(-1)}
          className="bg-teal-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-teal-700 transition"
        >
          {ui.goBack}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl transition">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div>
          <h1 className="font-bold text-gray-900 text-lg leading-tight">{ui.title}</h1>
          <p className="text-xs text-gray-500">{ui.subtitle}</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-5">
        <div className="bg-gradient-to-r from-teal-600 to-blue-700 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-7 h-7 text-white" />
            <h2 className="font-bold text-lg">{ui.yourVoiceMatters}</h2>
          </div>
          <p className="text-teal-100 text-sm leading-relaxed">{ui.intro}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="font-semibold text-gray-800 mb-3 text-sm">{ui.howDoYouFeel}</p>
            <div className="grid grid-cols-4 gap-2">
              {MOOD_CONFIG.map(m => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMood(m.value)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all ${
                    mood === m.value ? m.color + " scale-105 shadow-sm" : "border-gray-200 hover:border-gray-300 bg-gray-50"
                  }`}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-xs font-semibold leading-tight text-center">
                    {m.value === "love" ? ui.moodLove
                      : m.value === "good" ? ui.moodGood
                      : m.value === "okay" ? ui.moodOkay
                      : ui.moodBad}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="font-semibold text-gray-800 mb-3 text-sm">{ui.rateExperience}</p>
            <div className="flex items-center gap-2 justify-center">
              {[1,2,3,4,5].map(star => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverStar(star)}
                  onMouseLeave={() => setHoverStar(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110 active:scale-95"
                >
                  <Star className={`w-9 h-9 ${(hoverStar || rating) >= star ? "text-amber-400 fill-amber-400" : "text-gray-300"} transition-colors`} />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-sm text-amber-600 font-semibold mt-2">
                {["", ui.veryPoor, ui.poor, ui.fair, ui.good, ui.excellent][rating]}
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="font-semibold text-gray-800 mb-3 text-sm">{ui.whatIsThisAbout}</p>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategory(c.value)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-left ${
                    category === c.value
                      ? "bg-teal-500 text-white border-teal-500"
                      : "border-gray-200 text-gray-600 hover:border-teal-300 bg-gray-50"
                  }`}
                >
                  {(({
                    general: ui.generalExperience,
                    buying: ui.buyingOnBambeh,
                    selling: ui.sellingOnBambeh,
                    payment: ui.paymentsSubscriptions,
                    support: ui.customerSupport,
                    bug: ui.bugIssue,
                  } as Record<Category, string>)[c.value])}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <label className="block font-semibold text-gray-800 mb-2 text-sm">
              {ui.summary} <span className="text-gray-400 font-normal">{ui.optional}</span>
            </label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Payment was very smooth"
              maxLength={80}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <label className="block font-semibold text-gray-800 mb-2 text-sm">
              {ui.yourExperience}
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder={ui.experiencePlaceholder}
              rows={5}
              minLength={10}
              maxLength={1000}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 resize-none leading-relaxed"
            />
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
            <p className="font-semibold text-gray-800 text-sm">
              {ui.contact} <span className="text-gray-400 font-normal">{ui.contactNote}</span>
            </p>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={ui.yourName}
              maxLength={60}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500"
            />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500"
            />
            <p className="text-xs text-gray-400">{ui.followUp}</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="w-full bg-gradient-to-r from-teal-600 to-teal-700 disabled:from-gray-300 disabled:to-gray-300 disabled:text-gray-500 text-white py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-md shadow-teal-200 transition-all"
          >
            {submitting ? (
              <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/> {ui.sending}</>
            ) : (
              <><Send className="w-5 h-5" /> {ui.sendFeedback}</>
            )}
          </button>

          {!canSubmit && (
            <p className="text-xs text-center text-gray-400">
              {ui.selectMoodNotice}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}