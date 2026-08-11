import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle, Loader2, Star } from "lucide-react";
import { useLang } from "@/hooks/useAppLang";
import { supabase } from "@/lib/supabase";

/**
 * src/pages/SellerRatingPage.tsx - Bambeh Marketplace
 *
 * FIX321 - this page was written entirely in English and carried three
 * characters destroyed by an encoding-unaware edit ("Thank You! ?" and a
 * swallowed dash in the review placeholder). It now speaks all five app
 * languages and the damaged characters are restored.
 *
 * The review itself still goes through the submit_review RPC, untouched.
 */

const COPY: Record<string, Record<string, string>> = {
  en: {
    title: "Rate Seller",
    question: "How would you rate your experience with this seller?",
    s1: "Poor", s2: "Fair", s3: "Good", s4: "Very Good", s5: "Excellent",
    reviewLabel: "Write a review (optional)",
    reviewPlaceholder: "Tell others about your experience \u2014 was the item as described? Was the seller responsive? Would you buy from them again?",
    chars: "characters",
    submit: "Submit review",
    submitting: "Submitting...",
    star: "star", stars: "stars",
    pickStars: "Please choose a star rating first.",
    mustSignIn: "Please sign in to rate this seller.",
    notFound: "We could not find that seller.",
    failed: "Your rating did not go through. Please try again.",
    thanks: "Thank you!",
    thanksBody: "Your review helps other buyers decide who to trust.",
    goBack: "Go back",
  },
  fr: {
    title: "Noter le vendeur",
    question: "Comment \u00e9valuez-vous votre exp\u00e9rience avec ce vendeur\u00a0?",
    s1: "Mauvais", s2: "Passable", s3: "Bien", s4: "Tr\u00e8s bien", s5: "Excellent",
    reviewLabel: "\u00c9crire un avis (facultatif)",
    reviewPlaceholder: "Racontez votre exp\u00e9rience \u2014 l'article correspondait-il \u00e0 la description\u00a0? Le vendeur r\u00e9pondait-il vite\u00a0? Ach\u00e8teriez-vous \u00e0 nouveau chez lui\u00a0?",
    chars: "caract\u00e8res",
    submit: "Envoyer l'avis",
    submitting: "Envoi...",
    star: "\u00e9toile", stars: "\u00e9toiles",
    pickStars: "Veuillez d'abord choisir une note.",
    mustSignIn: "Connectez-vous pour noter ce vendeur.",
    notFound: "Vendeur introuvable.",
    failed: "Votre note n'est pas pass\u00e9e. R\u00e9essayez.",
    thanks: "Merci\u00a0!",
    thanksBody: "Votre avis aide les autres acheteurs \u00e0 savoir \u00e0 qui faire confiance.",
    goBack: "Retour",
  },
  pidgin: {
    title: "Rate the Seller",
    question: "How the buying with this seller take be?",
    s1: "E no good", s2: "E fair", s3: "E good", s4: "E good well well", s5: "Perfect",
    reviewLabel: "Write small talk about am (if you want)",
    reviewPlaceholder: "Tell other people how e take be \u2014 the thing be like wetin dem talk? The seller answer sharp sharp? You go buy from am again?",
    chars: "letters",
    submit: "Send my talk",
    submitting: "Dey send...",
    star: "star", stars: "stars",
    pickStars: "Abeg pick star first.",
    mustSignIn: "Abeg login before you fit rate this seller.",
    notFound: "We no see that seller.",
    failed: "Your rating no enter. Abeg try again.",
    thanks: "Thank you!",
    thanksBody: "Wetin you talk go help other buyers know who dem fit trust.",
    goBack: "Go back",
  },
  ar: {
    title: "\u062a\u0642\u064a\u064a\u0645 \u0627\u0644\u0628\u0627\u0626\u0639",
    question: "\u0643\u064a\u0641 \u062a\u0642\u064a\u0651\u0645 \u062a\u062c\u0631\u0628\u062a\u0643 \u0645\u0639 \u0647\u0630\u0627 \u0627\u0644\u0628\u0627\u0626\u0639\u061f",
    s1: "\u0636\u0639\u064a\u0641", s2: "\u0645\u0642\u0628\u0648\u0644", s3: "\u062c\u064a\u062f", s4: "\u062c\u064a\u062f \u062c\u062f\u0627\u064b", s5: "\u0645\u0645\u062a\u0627\u0632",
    reviewLabel: "\u0627\u0643\u062a\u0628 \u0645\u0631\u0627\u062c\u0639\u0629 (\u0627\u062e\u062a\u064a\u0627\u0631\u064a)",
    reviewPlaceholder: "\u0627\u062d\u0643\u064a \u0644\u0644\u0622\u062e\u0631\u064a\u0646 \u0639\u0646 \u062a\u062c\u0631\u0628\u062a\u0643 \u2014 \u0647\u0644 \u0643\u0627\u0646 \u0627\u0644\u0645\u0646\u062a\u062c \u0643\u0645\u0627 \u0648\u064f\u0635\u0641\u061f \u0647\u0644 \u0643\u0627\u0646 \u0627\u0644\u0628\u0627\u0626\u0639 \u0633\u0631\u064a\u0639 \u0627\u0644\u0631\u062f\u061f \u0647\u0644 \u0633\u062a\u0634\u062a\u0631\u064a \u0645\u0646\u0647 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649\u061f",
    chars: "\u062d\u0631\u0641",
    submit: "\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0629",
    submitting: "\u062c\u0627\u0631\u064d \u0627\u0644\u0625\u0631\u0633\u0627\u0644...",
    star: "\u0646\u062c\u0645\u0629", stars: "\u0646\u062c\u0648\u0645",
    pickStars: "\u0627\u062e\u062a\u0631 \u0639\u062f\u062f \u0627\u0644\u0646\u062c\u0648\u0645 \u0623\u0648\u0644\u0627\u064b.",
    mustSignIn: "\u0633\u062c\u0651\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0644\u062a\u0642\u064a\u064a\u0645 \u0647\u0630\u0627 \u0627\u0644\u0628\u0627\u0626\u0639.",
    notFound: "\u0644\u0645 \u0646\u0639\u062b\u0631 \u0639\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u0628\u0627\u0626\u0639.",
    failed: "\u0644\u0645 \u064a\u062a\u0645 \u0625\u0631\u0633\u0627\u0644 \u062a\u0642\u064a\u064a\u0645\u0643. \u062d\u0627\u0648\u0644 \u0645\u062c\u062f\u062f\u0627\u064b.",
    thanks: "\u0634\u0643\u0631\u0627\u064b \u0644\u0643!",
    thanksBody: "\u0645\u0631\u0627\u062c\u0639\u062a\u0643 \u062a\u0633\u0627\u0639\u062f \u0627\u0644\u0645\u0634\u062a\u0631\u064a\u0646 \u0627\u0644\u0622\u062e\u0631\u064a\u0646 \u0639\u0644\u0649 \u0645\u0639\u0631\u0641\u0629 \u0645\u0646 \u064a\u062b\u0642\u0648\u0646 \u0628\u0647.",
    goBack: "\u0631\u062c\u0648\u0639",
  },
  ff: {
    title: "Hokku njeeygu njeeyoowo",
    question: "No coodgu maa e oo njeeyoowo wa\u0257i?",
    s1: "Booni", s2: "See\u0257a", s3: "Mo\u0263\u0263i", s4: "Mo\u0263\u0263i no feewi", s5: "Burtu\u0257o",
    reviewLabel: "Winndu haala maa (si a yi\u0257ii)",
    reviewPlaceholder: "Haalan wo\u0253\u0253e no coodgu maa wa\u0257i \u2014 huunde nden no wa\u0257i hono no haalaa? Njeeyoowo on jaabinii law? A soodat kadi to makko?",
    chars: "alkule",
    submit: "Neldu haala am",
    submitting: "Ena neldee...",
    star: "hoodere", stars: "koode",
    pickStars: "Su\u0253o koode ko adii.",
    mustSignIn: "Naatu tafngal ngam hokkude njeeygu.",
    notFound: "Min tawaani oo njeeyoowo.",
    failed: "Njeeygu maa naatii. Artu jeer.",
    thanks: "A jaaraama!",
    thanksBody: "Haala maa ena walla soodoo\u0253e wo\u0253\u0253e anndude mo mbi\u0257ata hoolaade.",
    goBack: "Rutto",
  },
};

export default function SellerRatingPage() {
  const lang  = useLang();
  const isRtl = lang === "ar";
  const c     = COPY[lang as string] ?? COPY.en;

  const { sellerId } = useParams<{ sellerId: string }>();
  const navigate     = useNavigate();

  const [rating,    setRating]    = useState(0);
  const [hover,     setHover]     = useState(0);
  const [comment,   setComment]   = useState("");
  const [submitting,setSubmitting]= useState(false);
  const [done,      setDone]      = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const LABELS = ["", c.s1, c.s2, c.s3, c.s4, c.s5];

  async function handleSubmit() {
    if (rating === 0) { setError(c.pickStars); return; }
    setSubmitting(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user?.id) { throw new Error(c.mustSignIn); }
      if (!sellerId) { throw new Error(c.notFound); }
      const { error: rpcErr } = await supabase.rpc("submit_review", {
        p_seller:  sellerId,
        p_rating:  rating,
        p_comment: comment.trim(),
      });
      if (rpcErr) { throw new Error(rpcErr.message); }

      setDone(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : c.failed);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <div className="bg-white rounded-2xl p-8 text-center shadow max-w-sm w-full">
          <CheckCircle className="w-14 h-14 text-teal-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">{c.thanks} {"\u{1F64F}"}</h2>
          <p className="text-gray-500 text-sm mb-6">{c.thanksBody}</p>
          <button onClick={() => navigate(-1)}
            className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold">
            {c.goBack}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft className={`w-5 h-5 ${isRtl ? "rotate-180" : ""}`} />
        </button>
        <h1 className="font-bold text-gray-900">{c.title}</h1>
      </div>

      <div className="max-w-lg mx-auto p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
        )}

        <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
          <p className="text-gray-600 mb-6 text-sm">{c.question}</p>

          <div className="flex justify-center gap-3 mb-4">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                aria-label={`${n} ${n > 1 ? c.stars : c.star}`}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(n)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  className={`w-10 h-10 transition-colors ${
                    n <= (hover || rating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>

          {(hover || rating) > 0 && (
            <p className="text-teal-600 font-semibold text-sm mb-2">
              {LABELS[hover || rating]}
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {c.reviewLabel}
          </label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={4}
            maxLength={500}
            placeholder={c.reviewPlaceholder}
            className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">{comment.length}/500 {c.chars}</p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting || rating === 0}
          className="w-full bg-teal-600 text-white py-4 rounded-2xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting
            ? <><Loader2 className="w-4 h-4 animate-spin" />{c.submitting}</>
            : <>{c.submit}{rating > 0 ? ` (${rating} ${rating > 1 ? c.stars : c.star})` : ""}</>
          }
        </button>
      </div>
    </div>
  );
}
