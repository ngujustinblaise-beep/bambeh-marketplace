// BAMBEH_DEPLOY_TOKEN__VOICECONTROL_FIX285_CLEAN
// FILE LOCATION: src/components/voice/MovableVoiceControl.tsx
//
// FIX285 - REAL VOICE SEARCH.
//
// WHAT THIS REPLACES: the old file never touched the microphone. It ran
// three nested setTimeouts, printed a hardcoded "Go to marketplace", and
// navigated there no matter what the user said.
//
// WHAT THIS DOES: uses the Web Speech API, which is built into Chrome and
// the Android WebView. No server, no API key, no cost per use. The words
// go straight into smartSearch, so "cheap fridge in Bonaberi under 50000"
// becomes a real filtered search.
//
// HONEST BEHAVIOUR: if the browser cannot do speech recognition, the button
// does not appear at all. A button that cannot work is worse than no button.
//
// Still draggable, still remembers where you put it.

import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, X, Loader2 } from "lucide-react";

/* ---------------- language ---------------- */

function bambehLang(): string {
  try {
    const r = String(localStorage.getItem("Bambeh_language") || "").toLowerCase();
    if (r.startsWith("fr")) return "fr";
    if (r.startsWith("ar")) return "ar";
    if (r.startsWith("pcm") || r.startsWith("pid")) return "pcm";
    if (r.startsWith("ff") || r.startsWith("ful")) return "ff";
  } catch { /* storage blocked */ }
  return "en";
}

/** What we ask the recogniser to listen for. Pidgin and Fulfulde have no
 *  engine, so they listen in English, which is close enough to be useful. */
function speechLocale(): string {
  switch (bambehLang()) {
    case "fr": return "fr-FR";
    case "ar": return "ar-001";
    default:   return "en-GB";
  }
}

const T: Record<string, Record<string, string>> = {
  tap:      { en: "Tap and speak", fr: "Touchez et parlez", pcm: "Press and talk", ar: "\u0627\u0636\u063A\u0637 \u0648\u062A\u0643\u0644\u0645", ff: "\u00d1i\u0253\u0253u haalaa" },
  listening:{ en: "Listening\u2026", fr: "\u00C9coute\u2026", pcm: "I dey hear you\u2026", ar: "\u064A\u0633\u062A\u0645\u0639\u2026", ff: "Ina hee\u0257a\u2026" },
  say:      { en: "Try: fridge in Douala under 50000", fr: "Essayez : frigo \u00E0 Douala moins de 50000", pcm: "Try: fridge for Douala wey no pass 50000", ar: "\u062C\u0631\u0651\u0628: \u062B\u0644\u0627\u062C\u0629 \u0641\u064A \u062F\u0648\u0627\u0644\u0627", ff: "Enndu: frigo e Douala" },
  noSound:  { en: "I did not hear anything. Try again.", fr: "Je n\u2019ai rien entendu. R\u00E9essayez.", pcm: "I no hear anything. Try again.", ar: "\u0644\u0645 \u0623\u0633\u0645\u0639 \u0634\u064A\u0626\u0627\u064B. \u062D\u0627\u0648\u0644 \u0645\u062C\u062F\u062F\u0627\u064B.", ff: "Mi nanaani hay huunde. Ndarto." },
  denied:   { en: "Microphone permission is off. Turn it on in your browser settings.", fr: "Le micro est bloqu\u00E9. Activez-le dans les param\u00E8tres du navigateur.", pcm: "Microphone dey block. Open am for your browser settings.", ar: "\u0627\u0644\u0645\u064A\u0643\u0631\u0648\u0641\u0648\u0646 \u0645\u063A\u0644\u0642. \u0641\u0639\u0651\u0644\u0647 \u0645\u0646 \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0645\u062A\u0635\u0641\u062D.", ff: "Mikoro ina uddaa. Uddit \u0257um e paramet naworde." },
};
const t = (k: string) => (T[k] && (T[k][bambehLang()] || T[k].en)) || "";

/* ---------------- the component ---------------- */

export default function MovableVoiceControl() {
  const navigate = useNavigate();

  const [supported, setSupported] = useState(false);
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState("");
  const [message, setMessage] = useState("");

  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const recognition = useRef<any>(null);

  /* is speech recognition actually available here? */
  useEffect(() => {
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    setSupported(Boolean(SR));

    try {
      const saved = localStorage.getItem("Bambeh_voice_pos");
      if (saved) setPos(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  /* ---- dragging ---- */
  const onDown = (clientX: number, clientY: number) => {
    dragging.current = true;
    start.current = { x: clientX - pos.x, y: clientY - pos.y };
  };
  const onMove = useCallback((clientX: number, clientY: number) => {
    if (!dragging.current) return;
    setPos({ x: clientX - start.current.x, y: clientY - start.current.y });
  }, []);
  const onUp = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    setPos((p) => {
      try { localStorage.setItem("Bambeh_voice_pos", JSON.stringify(p)); } catch { /* ignore */ }
      return p;
    });
  }, []);

  useEffect(() => {
    const mm = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    const tm = (e: TouchEvent) => { const p = e.touches[0]; if (p) onMove(p.clientX, p.clientY); };
    window.addEventListener("mousemove", mm);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", tm, { passive: true });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", mm);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", tm);
      window.removeEventListener("touchend", onUp);
    };
  }, [onMove, onUp]);

  /* ---- the actual listening ---- */
  const stop = () => {
    try { recognition.current?.stop(); } catch { /* ignore */ }
    setListening(false);
  };

  const runSearch = (words: string) => {
    const q = words.trim();
    if (!q) { setMessage(t("noSound")); return; }
    // smartSearch parses this on the results page, so the spoken sentence
    // arrives exactly as the person said it.
    navigate("/search?q=" + encodeURIComponent(q));
    setOpen(false);
    setHeard("");
  };

  const listen = () => {
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;

    setMessage("");
    setHeard("");

    const r = new SR();
    recognition.current = r;
    r.lang = speechLocale();
    r.interimResults = true;
    r.continuous = false;
    r.maxAlternatives = 1;

    r.onstart = () => setListening(true);

    r.onresult = (event: any) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) text += event.results[i][0].transcript;
      setHeard(text);
      if (event.results[event.results.length - 1].isFinal) {
        setListening(false);
        runSearch(text);
      }
    };

    r.onerror = (event: any) => {
      setListening(false);
      if (event.error === "not-allowed" || event.error === "service-not-allowed") setMessage(t("denied"));
      else if (event.error === "no-speech") setMessage(t("noSound"));
      else setMessage(t("noSound"));
    };

    r.onend = () => setListening(false);

    try { r.start(); } catch { setListening(false); }
  };

  // a browser that cannot listen gets no button at all
  if (!supported) return null;

  return (
    <div
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
      className="fixed bottom-24 right-4 z-[60] select-none"
    >
      {open && (
        <div className="mb-3 w-64 rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl">
          <div className="mb-2 flex items-start justify-between gap-2">
            <p className="text-sm font-bold text-gray-900">
              {listening ? t("listening") : t("tap")}
            </p>
            <button onClick={() => { stop(); setOpen(false); }} aria-label="Close"
              className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
              <X className="h-4 w-4" />
            </button>
          </div>

          {heard ? (
            <p className="rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-900">{heard}</p>
          ) : (
            <p className="text-xs text-gray-500">{t("say")}</p>
          )}

          {message && <p className="mt-2 text-xs font-medium text-red-600">{message}</p>}

          <button
            onClick={listening ? stop : listen}
            className={
              "mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors " +
              (listening ? "bg-red-500 hover:bg-red-600" : "bg-teal-600 hover:bg-teal-700")
            }
          >
            {listening ? <><Loader2 className="h-4 w-4 animate-spin" /> {t("listening")}</>
                       : <><Mic className="h-4 w-4" /> {t("tap")}</>}
          </button>
        </div>
      )}

      <button
        onMouseDown={(e) => onDown(e.clientX, e.clientY)}
        onTouchStart={(e) => { const p = e.touches[0]; if (p) onDown(p.clientX, p.clientY); }}
        onClick={() => { if (!dragging.current) setOpen((v) => !v); }}
        aria-label={t("tap")}
        className={
          "flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl transition-transform active:scale-95 " +
          (listening ? "bg-red-500 animate-pulse" : "bg-gradient-to-br from-teal-600 to-emerald-600")
        }
      >
        {listening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
      </button>
    </div>
  );
}
// BAMBEH_END_TOKEN__VOICECONTROL_FIX285__COMPLETE
