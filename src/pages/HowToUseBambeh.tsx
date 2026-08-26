// BAMBEH_DEPLOY_TOKEN__HOWTOUSE_FIX392_CLEAN
/**
 * src/pages/HowToUseBambeh.tsx - FIX392
 *
 * "How to use Bambeh" - four short steps, in all five languages.
 *
 * WHAT IT COVERS (Big's list, exactly):
 *   1. How to create an account
 *   2. How to recover an account
 *   3. How to sell an item
 *   4. The five-picture maximum
 *
 * The logo sits at the top and goes home when tapped. If the logo file is not
 * in place the page draws a proper teal mark instead - it NEVER shows a broken
 * image icon.
 *
 * LANGUAGE: read from localStorage "Bambeh_language" and kept live through the
 * "bambeh:langchange" event, the same pattern SecurityRecovery and
 * LocationLock use. It deliberately does NOT import useLanguage from App.tsx,
 * because App.tsx imports this page - that would be a circular import.
 *
 * translate="no" + class notranslate on the root: Google Translate rewrites
 * text nodes React owns and crashes the app on the next re-render. That cost
 * us a whole evening on the recovery page. Every new page carries this guard.
 *
 * Written in pure ASCII escapes so no encoding can ever break the French,
 * Arabic or Fulfulde again.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserPlus, KeyRound, Tag, Camera, ArrowLeft } from "lucide-react";

type LangCode = "en" | "fr" | "pidgin" | "ar" | "ff";

const LANG_KEY = "Bambeh_language";

function resolveCode(raw: string | null): LangCode {
  if (raw === "pcm" || raw === "pidgin_english") return "pidgin";
  if (raw === "ful" || raw === "fulfulde") return "ff";
  if (raw === "en" || raw === "fr" || raw === "pidgin" || raw === "ar" || raw === "ff") {
    return raw;
  }
  return "en";
}

interface Step {
  title: string;
  body: string;
}

interface Copy {
  title: string;
  subtitle: string;
  steps: [Step, Step, Step, Step];
  hiccup: string;
  more: string;
  back: string;
}

const T: Record<LangCode, Copy> = {
  en: {
    title: "How to use Bambeh",
    subtitle: "Everything you need, in four short steps.",
    steps: [
      {
        title: "Create your account",
        body:
          "Tap Create account. Enter your phone number or your email, and choose a password of at least 8 characters. You are signed in straight away - there is nothing to confirm and nothing to wait for.",
      },
      {
        title: "If you forget your password",
        body:
          "Tap Forgot password on the sign-in screen. We send an 8-digit code to your email. Type that code, choose a new password, and you are back in. Use the newest email only - asking for a new code stops the old one working.",
      },
      {
        title: "Sell an item",
        body:
          "Tap Sell an Item. Give it a clear title, an honest price in FCFA, and the town you are in. Say plainly what condition it is in. Then post it. Posting on Bambeh is always free.",
      },
      {
        title: "Pictures: five maximum",
        body:
          "You can add up to 5 pictures to any post. Make the first one your best - that is the one buyers see in the list. Good daylight and a plain background sell an item faster than anything else you can do.",
      },
    ],
    hiccup: "Sometimes Bambeh says Failed to fetch. Do not panic - nothing is broken and nothing is lost. That is just the network catching its breath. Press the button again. It almost always works the second time, and if not, the third. Bambeh is stubborn, and so should you be.",
    more: "Need more help? Open the menu and tap Help.",
    back: "Back to Bambeh",
  },
  fr: {
    title: "Comment utiliser Bambeh",
    subtitle: "Tout ce qu'il vous faut, en quatre \u00E9tapes.",
    steps: [
      {
        title: "Cr\u00E9ez votre compte",
        body:
          "Appuyez sur Cr\u00E9er un compte. Entrez votre num\u00E9ro de t\u00E9l\u00E9phone ou votre e-mail, et choisissez un mot de passe d'au moins 8 caract\u00E8res. Vous \u00EAtes connect\u00E9 imm\u00E9diatement - rien \u00E0 confirmer, rien \u00E0 attendre.",
      },
      {
        title: "Si vous oubliez votre mot de passe",
        body:
          "Appuyez sur Mot de passe oubli\u00E9 sur l'\u00E9cran de connexion. Nous envoyons un code \u00E0 8 chiffres \u00E0 votre e-mail. Saisissez ce code, choisissez un nouveau mot de passe, et vous \u00EAtes de retour. Utilisez uniquement l'e-mail le plus r\u00E9cent - demander un nouveau code annule l'ancien.",
      },
      {
        title: "Vendre un article",
        body:
          "Appuyez sur Vendre un article. Donnez un titre clair, un prix honn\u00EAte en FCFA, et la ville o\u00F9 vous \u00EAtes. Dites franchement dans quel \u00E9tat il est. Puis publiez. Publier sur Bambeh est toujours gratuit.",
      },
      {
        title: "Photos : cinq au maximum",
        body:
          "Vous pouvez ajouter jusqu'\u00E0 5 photos par annonce. Mettez la meilleure en premier - c'est celle que les acheteurs voient dans la liste. Une bonne lumi\u00E8re du jour et un fond simple font vendre plus vite que tout le reste.",
      },
    ],
    hiccup: "Parfois Bambeh affiche Failed to fetch. Pas de panique - rien n\u0027est cass\u00E9 et rien n\u0027est perdu. C\u0027est juste le r\u00E9seau qui reprend son souffle. Appuyez encore. \u00C7a marche presque toujours la deuxi\u00E8me fois, sinon la troisi\u00E8me. Bambeh est t\u00EAtu, soyez-le aussi.",
    more: "Besoin d'aide ? Ouvrez le menu et appuyez sur Aide.",
    back: "Retour \u00E0 Bambeh",
  },
  pidgin: {
    title: "How for use Bambeh",
    subtitle: "Everything wey you need, for four small step.",
    steps: [
      {
        title: "Open your account",
        body:
          "Press Create account. Put your phone number or your email, then choose password wey get at least 8 letters. You don enter one time - nothing for confirm, nothing for wait.",
      },
      {
        title: "If you forget your password",
        body:
          "Press Forgot password for the sign-in screen. We go send 8-digit code go your email. Type the code, choose new password, and you don enter back. Use only the latest email - if you ask for new code, the old one no go work again.",
      },
      {
        title: "Sell your thing",
        body:
          "Press Sell an Item. Give am correct title, honest price for FCFA, and the town wey you dey. Talk true about the condition. Then post am. To post for Bambeh na free always.",
      },
      {
        title: "Picture: five na the max",
        body:
          "You fit put up to 5 picture for any post. Make the first one na your best - na am buyers dey see for the list. Good daylight and clean background dey sell thing pass any other trick.",
      },
    ],
    hiccup: "Sometime Bambeh go tell you Failed to fetch. No fear - nothing don spoil, nothing don loss. Na just network dey take small rest. Press the button again. E dey work the second time, and if e no work, the third one go do am. Bambeh no dey give up, make you too no give up.",
    more: "You need more help? Open the menu, press Help.",
    back: "Go back to Bambeh",
  },
  ar: {
    title: "\u0643\u064A\u0641\u064A\u0629 \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0628\u0627\u0645\u0628\u064A\u0647",
    subtitle: "\u0643\u0644 \u0645\u0627 \u062A\u062D\u062A\u0627\u062C\u0647\u060C \u0641\u064A \u0623\u0631\u0628\u0639 \u062E\u0637\u0648\u0627\u062A \u0642\u0635\u064A\u0631\u0629.",
    steps: [
      {
        title: "\u0623\u0646\u0634\u0626 \u062D\u0633\u0627\u0628\u0643",
        body:
          "\u0627\u0636\u063A\u0637 \u0639\u0644\u0649 \u0625\u0646\u0634\u0627\u0621 \u062D\u0633\u0627\u0628. \u0623\u062F\u062E\u0644 \u0631\u0642\u0645 \u0647\u0627\u062A\u0641\u0643 \u0623\u0648 \u0628\u0631\u064A\u062F\u0643 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u060C \u0648\u0627\u062E\u062A\u0631 \u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u0645\u0646 8 \u0623\u062D\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644. \u0633\u064A\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u062F\u062E\u0648\u0644\u0643 \u0641\u0648\u0631\u0627\u064B - \u0644\u0627 \u0634\u064A\u0621 \u062A\u0624\u0643\u062F\u0647 \u0648\u0644\u0627 \u0634\u064A\u0621 \u062A\u0646\u062A\u0638\u0631\u0647.",
      },
      {
        title: "\u0625\u0630\u0627 \u0646\u0633\u064A\u062A \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631",
        body:
          "\u0627\u0636\u063A\u0637 \u0639\u0644\u0649 \u0646\u0633\u064A\u062A \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0641\u064A \u0634\u0627\u0634\u0629 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644. \u0646\u0631\u0633\u0644 \u0631\u0645\u0632\u0627\u064B \u0645\u0646 8 \u0623\u0631\u0642\u0627\u0645 \u0625\u0644\u0649 \u0628\u0631\u064A\u062F\u0643. \u0623\u062F\u062E\u0644 \u0627\u0644\u0631\u0645\u0632\u060C \u0627\u062E\u062A\u0631 \u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u062C\u062F\u064A\u062F\u0629\u060C \u0648\u0633\u062A\u0639\u0648\u062F. \u0627\u0633\u062A\u062E\u062F\u0645 \u0623\u062D\u062F\u062B \u0631\u0633\u0627\u0644\u0629 \u0641\u0642\u0637 - \u0637\u0644\u0628 \u0631\u0645\u0632 \u062C\u062F\u064A\u062F \u064A\u0648\u0642\u0641 \u0627\u0644\u0642\u062F\u064A\u0645.",
      },
      {
        title: "\u0628\u064A\u0639 \u0645\u0646\u062A\u062C",
        body:
          "\u0627\u0636\u063A\u0637 \u0639\u0644\u0649 \u0628\u064A\u0639 \u0645\u0646\u062A\u062C. \u0627\u0643\u062A\u0628 \u0639\u0646\u0648\u0627\u0646\u0627\u064B \u0648\u0627\u0636\u062D\u0627\u064B\u060C \u0648\u0633\u0639\u0631\u0627\u064B \u0635\u0627\u062F\u0642\u0627\u064B \u0628\u0627\u0644\u0641\u0631\u0646\u0643\u060C \u0648\u0627\u0644\u0645\u062F\u064A\u0646\u0629 \u0627\u0644\u062A\u064A \u062A\u0642\u064A\u0645 \u0641\u064A\u0647\u0627. \u0627\u0630\u0643\u0631 \u062D\u0627\u0644\u0629 \u0627\u0644\u0645\u0646\u062A\u062C \u0628\u0635\u0631\u0627\u062D\u0629. \u062B\u0645 \u0627\u0646\u0634\u0631. \u0627\u0644\u0646\u0634\u0631 \u0639\u0644\u0649 \u0628\u0627\u0645\u0628\u064A\u0647 \u0645\u062C\u0627\u0646\u064A \u062F\u0627\u0626\u0645\u0627\u064B.",
      },
      {
        title: "\u0627\u0644\u0635\u0648\u0631: \u062E\u0645\u0633 \u0643\u062D\u062F \u0623\u0642\u0635\u0649",
        body:
          "\u064A\u0645\u0643\u0646\u0643 \u0625\u0636\u0627\u0641\u0629 \u062D\u062A\u0649 5 \u0635\u0648\u0631 \u0644\u0643\u0644 \u0625\u0639\u0644\u0627\u0646. \u0627\u062C\u0639\u0644 \u0627\u0644\u0623\u0648\u0644\u0649 \u0647\u064A \u0627\u0644\u0623\u0641\u0636\u0644 - \u0641\u0647\u064A \u0627\u0644\u062A\u064A \u064A\u0631\u0627\u0647\u0627 \u0627\u0644\u0645\u0634\u062A\u0631\u0648\u0646 \u0641\u064A \u0627\u0644\u0642\u0627\u0626\u0645\u0629. \u0627\u0644\u0625\u0636\u0627\u0621\u0629 \u0627\u0644\u062C\u064A\u062F\u0629 \u0648\u0627\u0644\u062E\u0644\u0641\u064A\u0629 \u0627\u0644\u0628\u0633\u064A\u0637\u0629 \u062A\u0628\u064A\u0639 \u0623\u0633\u0631\u0639 \u0645\u0646 \u0623\u064A \u0634\u064A\u0621 \u0622\u062E\u0631.",
      },
    ],
    hiccup: "\u0634\u0628\u0643\u062A\u0646\u0627 \u062A\u062A\u0639\u062B\u0631 \u0623\u062D\u064A\u0627\u0646\u0627\u064B. \u0625\u0630\u0627 \u0631\u0623\u064A\u062A 'Failed to fetch' - \u062D\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062E\u0631\u0649. \u0644\u064A\u0633\u062A \u063A\u0644\u0637\u062A\u0643\u060C \u0648\u0644\u0645 \u064A\u0636\u0639 \u0623\u062D\u062F.",
    more: "\u062A\u062D\u062A\u0627\u062C \u0645\u0633\u0627\u0639\u062F\u0629\u061F \u0627\u0641\u062A\u062D \u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0648\u0627\u0636\u063A\u0637 \u0639\u0644\u0649 \u0645\u0633\u0627\u0639\u062F\u0629.",
    back: "\u0627\u0644\u0639\u0648\u062F\u0629 \u0625\u0644\u0649 \u0628\u0627\u0645\u0628\u064A\u0647",
  },
  ff: {
    title: "No huutoraade Bambeh",
    subtitle: "Ko fof ko a soklata, e daawe nay ra\u0253\u0253i\u0257\u0257e.",
    steps: [
      {
        title: "Sos konte maa",
        body:
          "\u00D1o\u0192\u0192u Sos konte. Naatnu limngal noddirgal maa walla iimeel maa, labo finnde nde alaa e sara 8 alkule. A naatii jooni - alaa ko tee\u014Btinta, alaa ko sabbotoo\u0257aa.",
      },
      {
        title: "So a yejjitii finnde maa",
        body:
          "\u00D1o\u0192\u0192u Mi yejjitii finnde e yaynirde naatirde. Min neldu maa kodo limce 8 e iimeel maa. Winndu kodo ngo, labo finnde hesere, ndeen a naatii. Huutoro tan iimeel bur\u0257o hesde - so a \u0257a\u0253\u0253ii kodo hesa, kodo hindii\u0257o o waawaa golloraade.",
      },
      {
        title: "Yeeyu huunde",
        body:
          "\u00D1o\u0192\u0192u Yeeyu huunde. Winndu tiitoonde laa\u0253nde, coggu goongaajo e FCFA, e saare nde ngon\u0257aa. Haalu goonga fii ngonka mum. Ndeen naatnu. Naatnude e Bambeh ko meere sahaa fof.",
      },
      {
        title: "Nate: joyi tan",
        body:
          "A waawi \u0253eydude haa nate 5 e kala jeeyngal. Wa\u0257u \u0253urnde mo\u0192\u0192ude arande - ko ndeen soodoo\u0253e njiyata e doggol. Annoora \u0272alorma mo\u0192\u0192o e \u0253aawo laa\u0253\u0257o ina yeeya law \u0253ural kala.",
      },
    ],
    hiccup: "Sahaa feere Bambeh ina wi\u0027a Failed to fetch. Hulaa - alaa ko bonii, alaa ko majji. Ko rijaal tan hi\u0253\u0253ii seeda. \u00D1o\u0192\u0192u kadi. Ina golloo laawol \u0257i\u0257a\u0253ol, so wonaa \u0257uum, laawol tataabol. Bambeh accataa, ma a accataa kadi.",
    more: "A soklii ballal? Uddit doggol, \u00F1o\u0192\u0192u Ballal.",
    back: "Rutto to Bambeh",
  },
};

const ICONS = [UserPlus, KeyRound, Tag, Camera];

const CARD_TINTS = [
  { ring: "border-teal-200", chip: "bg-teal-100 text-teal-700" },
  { ring: "border-amber-200", chip: "bg-amber-100 text-amber-700" },
  { ring: "border-sky-200", chip: "bg-sky-100 text-sky-700" },
  { ring: "border-emerald-200", chip: "bg-emerald-100 text-emerald-700" },
];

/**
 * The logo. Tapping it goes home.
 * If /bambeh-logo.png is not present the page draws a teal mark instead, so a
 * missing file can never leave a broken image on a page users are reading
 * because they are already confused.
 */
function LogoMark() {
  const [failed, setFailed] = useState(false);

  return (
    <Link to="/" aria-label="Bambeh home" className="inline-block">
      {failed ? (
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-teal-400 shadow-md">
          <span className="text-2xl font-extrabold tracking-tight text-gray-700">
            Bambeh
          </span>
        </div>
      ) : (
        <img
          src="/bambeh-logo.png"
          alt="Bambeh"
          width={96}
          height={96}
          className="mx-auto h-24 w-24 rounded-full object-cover shadow-md transition-transform hover:scale-105"
          onError={() => setFailed(true)}
        />
      )}
    </Link>
  );
}

export default function HowToUseBambeh() {
  const [lang, setLang] = useState<LangCode>(() => {
    try {
      return resolveCode(localStorage.getItem(LANG_KEY));
    } catch {
      return "en";
    }
  });

  // Stay in step with the language switcher, in this tab and in others.
  useEffect(() => {
    const onCustom = (e: Event): void => {
      const detail = (e as CustomEvent).detail;
      if (typeof detail === "string") setLang(resolveCode(detail));
    };
    const onStorage = (e: StorageEvent): void => {
      if (e.key === LANG_KEY) setLang(resolveCode(e.newValue));
    };
    window.addEventListener("bambeh:langchange", onCustom);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("bambeh:langchange", onCustom);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const t = T[lang];
  const rtl = lang === "ar";

  return (
    <div
      translate="no"
      className="notranslate min-h-screen bg-gradient-to-b from-teal-50 via-white to-white px-4 py-8"
      dir={rtl ? "rtl" : "ltr"}
    >
      <div className="mx-auto w-full max-w-2xl">
        {/* Logo - tap to go home */}
        <div className="mb-6 text-center">
          <LogoMark />
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            {t.title}
          </h1>
          <p className="mt-2 text-base text-gray-600">{t.subtitle}</p>
        </div>

        {/* The four steps */}
        <ol className="space-y-4">
          {t.steps.map((step, i) => {
            const Icon = ICONS[i];
            const tint = CARD_TINTS[i];
            return (
              <li
                key={i}
                className={
                  "rounded-2xl border bg-white p-5 shadow-sm " + tint.ring
                }
              >
                <div className="flex items-start gap-4">
                  <div
                    className={
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-full " +
                      tint.chip
                    }
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-bold text-gray-400">
                        {i + 1}
                      </span>
                      <h2 className="text-lg font-bold text-gray-900">
                        {step.title}
                      </h2>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-gray-700">
                      {step.body}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        {/* FIX399 - the network hiccup note. A scary English error on a slow
            line is worse than the slow line: people think they broke it, or
            that Bambeh is broken, and they leave. */}
        <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl leading-none" aria-hidden="true">{"\u{1F4F6}"}</span>
            <p className="text-sm leading-relaxed text-amber-900">{t.hiccup}</p>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">{t.more}</p>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700"
          >
            <ArrowLeft className={"h-4 w-4 " + (rtl ? "rotate-180" : "")} />
            {t.back}
          </Link>
        </div>

        <p className="mt-8 text-center text-xs text-gray-400">
          {"BAMBEH SARL, Yaound\u00E9, Cameroon"}
        </p>
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__HOWTOUSE_FIX392__COMPLETE
