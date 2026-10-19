// BAMBEH_DEPLOY_TOKEN__CHATWIDGET_FIX840_CLEAN
// FILE LOCATION: src/components/chat/MovableChatWidget.tsx
//
// FIX840 (was FIX285) - THE FLOATING HELP BUTTON, WITHOUT A PHONE NUMBER.
//
// FIX285 made this a door to the real chat, plus a "WhatsApp support" line with Bambeh's phone number. The rule is:
// contact stays in Bambeh - so that line is now "Chat with Bambeh" (FIX837, /help/chat): a person at Bambeh answers
// in the app, for everyone signed in, no subscription needed.
//   Chat with Bambeh -> /help/chat     My messages -> /chat (buyers and sellers)     Help centre -> /help
// Also: dragging the button no longer opens it, it can no longer be left off the screen, and it stays put when the
// panel opens.
// Five languages, right-to-left for Arabic.

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { HelpCircle, LifeBuoy, MessageCircle, Send, X } from "lucide-react";
import { useLang } from "@/hooks/useAppLang";

const T: Record<string, Record<string, string>> = {
  title:   { en: "Need a hand?", fr: "Besoin d\u2019aide ?", pidgin: "You need help?", ar: "\u062a\u062d\u062a\u0627\u062c \u0645\u0633\u0627\u0639\u062f\u0629\u061f", ff: "A haaji ballal?" },
  bambeh:  { en: "Chat with Bambeh", fr: "Discuter avec Bambeh", pidgin: "Chat with Bambeh", ar: "\u062a\u062d\u062f\u0651\u062b \u0645\u0639 Bambeh", ff: "Yeewtu e Bambeh" },
  bambehSub: { en: "A person at Bambeh answers, in the app", fr: "Une personne de Bambeh r\u00e9pond, dans l\u2019application", pidgin: "Real person for Bambeh go answer, for inside the app", ar: "\u064a\u0631\u062f \u0639\u0644\u064a\u0643 \u0634\u062e\u0635 \u0645\u0646 Bambeh \u062f\u0627\u062e\u0644 \u0627\u0644\u062a\u0637\u0628\u064a\u0642", ff: "Ne\u0257\u0257o Bambeh jaabay, e nder jaa\u0253nirgal ngal" },
  msgs:    { en: "My messages", fr: "Mes messages", pidgin: "My messages", ar: "\u0631\u0633\u0627\u0626\u0644\u064a", ff: "\u0181ataake am" },
  msgsSub: { en: "Talk to buyers and sellers", fr: "Parler aux acheteurs et vendeurs", pidgin: "Talk to buyer and seller dem", ar: "\u062a\u062d\u062f\u0651\u062b \u0645\u0639 \u0627\u0644\u0645\u0634\u062a\u0631\u064a\u0646 \u0648\u0627\u0644\u0628\u0627\u0626\u0639\u064a\u0646", ff: "Haalda e soodu\u0253e e jeeyoo\u0253e" },
  help:    { en: "Help centre", fr: "Centre d\u2019aide", pidgin: "Help centre", ar: "\u0645\u0631\u0643\u0632 \u0627\u0644\u0645\u0633\u0627\u0639\u062f\u0629", ff: "Nokku ballal" },
  helpSub: { en: "Guides and common questions", fr: "Guides et questions fr\u00e9quentes", pidgin: "Guide and question wey plenty people dey ask", ar: "\u0623\u062f\u0644\u0629 \u0648\u0623\u0633\u0626\u0644\u0629 \u0634\u0627\u0626\u0639\u0629", ff: "Peeje e naamnde keew\u0257e" },
  close:   { en: "Close", fr: "Fermer", pidgin: "Close", ar: "\u0625\u063a\u0644\u0627\u0642", ff: "Uddu" },
};

const SIZE = 56;      // the round button
const MARGIN = 8;     // never closer than this to an edge

/** Keeps the button on the screen: x/y are offsets from its home (bottom-right corner). */
function clamp(p: { x: number; y: number }): { x: number; y: number } {
  try {
    const w = window.innerWidth || 360;
    const h = window.innerHeight || 640;
    // home: right 16 px, bottom 24 px
    const minX = -(w - SIZE - 16 - MARGIN);
    const maxX = 16 - MARGIN;
    const minY = -(h - SIZE - 24 - MARGIN);
    const maxY = 24 - MARGIN;
    const x = Number.isFinite(p.x) ? Math.min(maxX, Math.max(minX, p.x)) : 0;
    const y = Number.isFinite(p.y) ? Math.min(maxY, Math.max(minY, p.y)) : 0;
    return { x, y };
  } catch {
    return { x: 0, y: 0 };
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function MovableChatWidget(_props: { defaultPosition?: string } = {}) {
  const navigate = useNavigate();
  const raw = useLang() as string;
  const lang = raw === "fulfulde" ? "ff" : raw;
  const t = (k: string) => (T[k] && (T[k][lang] || T[k].en)) || "";
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const moved = useRef(false);
  const start = useRef({ x: 0, y: 0, px: 0, py: 0 });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("Bambeh_chat_pos");
      if (saved) setPos(clamp(JSON.parse(saved)));
    } catch { /* ignore */ }
    const onResize = () => setPos((p) => clamp(p));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const onDown = (x: number, y: number) => {
    dragging.current = true;
    moved.current = false;
    start.current = { x: x - pos.x, y: y - pos.y, px: x, py: y };
  };
  const onMove = useCallback((x: number, y: number) => {
    if (!dragging.current) return;
    if (Math.abs(x - start.current.px) + Math.abs(y - start.current.py) > 6) moved.current = true;
    if (moved.current) setPos(clamp({ x: x - start.current.x, y: y - start.current.y }));
  }, []);
  const onUp = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    if (!moved.current) return;
    setPos((p) => {
      try { localStorage.setItem("Bambeh_chat_pos", JSON.stringify(p)); } catch { /* ignore */ }
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

  const go = (path: string) => { setOpen(false); navigate(path); };

  const Row = ({ icon, title, sub, onClick, id }: { icon: ReactNode; title: string; sub: string; onClick: () => void; id: string }) => (
    <button type="button" onClick={onClick} data-widget-row={id}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-start transition-colors hover:bg-gray-50">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-gray-900">{title}</span>
        <span className="block text-xs text-gray-500">{sub}</span>
      </span>
    </button>
  );

  return (
    <div style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }} className="fixed bottom-6 right-4 z-[60] select-none" data-fix="FIX840">
      {open && (
        <div className="mb-3 w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
             dir={lang === "ar" ? "rtl" : "ltr"} data-widget-panel="1">
          <div className="flex items-center justify-between bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-3">
            <p className="text-sm font-bold text-white">{t("title")}</p>
            <button onClick={() => setOpen(false)} aria-label={t("close")} className="rounded-full p-1 text-white/80 hover:bg-white/15 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-2">
            <Row id="bambeh" icon={<LifeBuoy className="h-5 w-5" />} title={t("bambeh")} sub={t("bambehSub")} onClick={() => go("/help/chat")} />
            <Row id="messages" icon={<Send className="h-5 w-5" />} title={t("msgs")} sub={t("msgsSub")} onClick={() => go("/chat")} />
            <Row id="help" icon={<HelpCircle className="h-5 w-5" />} title={t("help")} sub={t("helpSub")} onClick={() => go("/help")} />
          </div>
        </div>
      )}

      {/* the button stays where it was when the panel opens (it used to jump to the panel's left edge) */}
      <div className="flex justify-end">
      <button
        onMouseDown={(e) => onDown(e.clientX, e.clientY)}
        onTouchStart={(e) => { const p = e.touches[0]; if (p) onDown(p.clientX, p.clientY); }}
        onClick={() => { if (moved.current) { moved.current = false; return; } setOpen((v) => !v); }}
        aria-label={t("title")}
        data-widget-button="1"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-emerald-600 text-white shadow-xl transition-transform active:scale-95"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__CHATWIDGET_FIX840__COMPLETE
