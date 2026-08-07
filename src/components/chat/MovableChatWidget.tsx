// BAMBEH_DEPLOY_TOKEN__CHATWIDGET_FIX285_CLEAN
// FILE LOCATION: src/components/chat/MovableChatWidget.tsx
//
// FIX285 - A REAL DOOR, NOT A FAKE ROOM.
//
// WHAT THIS REPLACES: the old widget held a conversation in local state and
// carried the comment "TODO: wire to your real chat service". Messages
// vanished on refresh. Meanwhile the app already HAS working messaging -
// conversations and messages tables, a real /chat page, and a real admin
// inbox behind it.
//
// So this stops pretending to be a chat and becomes what it should always
// have been: a button that opens the real one, plus a WhatsApp line for
// people who are not signed in or want a human.
//
// Nothing here is simulated. Every button goes somewhere real.

import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, X, Send, LifeBuoy, HelpCircle } from "lucide-react";

/* EDIT ME if the support number ever changes */
const SUPPORT_PHONE = "237652953607";

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

const T: Record<string, Record<string, string>> = {
  title:   { en: "Need a hand?", fr: "Besoin d\u2019aide ?", pcm: "You need help?", ar: "\u062A\u062D\u062A\u0627\u062C \u0645\u0633\u0627\u0639\u062F\u0629\u061F", ff: "A haaji ballal?" },
  msgs:    { en: "My messages", fr: "Mes messages", pcm: "My messages", ar: "\u0631\u0633\u0627\u0626\u0644\u064A", ff: "\u0181ataake am" },
  msgsSub: { en: "Talk to buyers and sellers", fr: "Parler aux acheteurs et vendeurs", pcm: "Talk to buyer and seller dem", ar: "\u062A\u062D\u062F\u0651\u062B \u0645\u0639 \u0627\u0644\u0645\u0634\u062A\u0631\u064A\u0646 \u0648\u0627\u0644\u0628\u0627\u0626\u0639\u064A\u0646", ff: "Haalda e sooduɓe e jeeyooɓe" },
  wa:      { en: "WhatsApp support", fr: "Assistance WhatsApp", pcm: "WhatsApp support", ar: "\u062F\u0639\u0645 \u0648\u0627\u062A\u0633\u0627\u0628", ff: "Ballal WhatsApp" },
  waSub:   { en: "A real person, +237 652 953 607", fr: "Une vraie personne, +237 652 953 607", pcm: "Real person, +237 652 953 607", ar: "\u0634\u062E\u0635 \u062D\u0642\u064A\u0642\u064A\u060C +237 652 953 607", ff: "Neɗɗo goonga, +237 652 953 607" },
  help:    { en: "Help centre", fr: "Centre d\u2019aide", pcm: "Help centre", ar: "\u0645\u0631\u0643\u0632 \u0627\u0644\u0645\u0633\u0627\u0639\u062F\u0629", ff: "Nokku ballal" },
  helpSub: { en: "Guides and common questions", fr: "Guides et questions fr\u00E9quentes", pcm: "Guide and question wey plenty people dey ask", ar: "\u0623\u062F\u0644\u0629 \u0648\u0623\u0633\u0626\u0644\u0629 \u0634\u0627\u0626\u0639\u0629", ff: "Peeje e naamnde keewɗe" },
};
const t = (k: string) => (T[k] && (T[k][bambehLang()] || T[k].en)) || "";

export default function MovableChatWidget() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const start = useRef({ x: 0, y: 0 });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("Bambeh_chat_pos");
      if (saved) setPos(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  const onDown = (x: number, y: number) => {
    dragging.current = true;
    start.current = { x: x - pos.x, y: y - pos.y };
  };
  const onMove = useCallback((x: number, y: number) => {
    if (!dragging.current) return;
    setPos({ x: x - start.current.x, y: y - start.current.y });
  }, []);
  const onUp = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
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

  const Row = ({
    icon, title, sub, onClick, href,
  }: { icon: React.ReactNode; title: string; sub: string; onClick?: () => void; href?: string }) => {
    const inner = (
      <>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
          {icon}
        </span>
        <span className="min-w-0 flex-1 text-left">
          <span className="block text-sm font-semibold text-gray-900">{title}</span>
          <span className="block text-xs text-gray-500">{sub}</span>
        </span>
      </>
    );
    const cls = "flex w-full items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-gray-50";
    return href
      ? <a href={href} target="_blank" rel="noopener noreferrer" className={cls} onClick={() => setOpen(false)}>{inner}</a>
      : <button type="button" onClick={onClick} className={cls}>{inner}</button>;
  };

  return (
    <div
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
      className="fixed bottom-6 right-4 z-[60] select-none"
    >
      {open && (
        <div className="mb-3 w-72 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-3">
            <p className="text-sm font-bold text-white">{t("title")}</p>
            <button onClick={() => setOpen(false)} aria-label="Close"
              className="rounded-full p-1 text-white/80 hover:bg-white/15 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-2">
            <Row icon={<Send className="h-5 w-5" />}      title={t("msgs")} sub={t("msgsSub")} onClick={() => go("/chat")} />
            <Row icon={<LifeBuoy className="h-5 w-5" />}  title={t("wa")}   sub={t("waSub")}
                 href={"https://wa.me/" + SUPPORT_PHONE} />
            <Row icon={<HelpCircle className="h-5 w-5" />} title={t("help")} sub={t("helpSub")} onClick={() => go("/help")} />
          </div>
        </div>
      )}

      <button
        onMouseDown={(e) => onDown(e.clientX, e.clientY)}
        onTouchStart={(e) => { const p = e.touches[0]; if (p) onDown(p.clientX, p.clientY); }}
        onClick={() => { if (!dragging.current) setOpen((v) => !v); }}
        aria-label={t("title")}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-emerald-600 text-white shadow-xl transition-transform active:scale-95"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
// BAMBEH_END_TOKEN__CHATWIDGET_FIX285__COMPLETE
