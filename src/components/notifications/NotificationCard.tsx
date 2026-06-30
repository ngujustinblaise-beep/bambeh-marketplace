import React from "react";
import { useNavigate } from "react-router-dom";
import type { BambehNotification } from "@/hooks/useNotifications";
import { useLang } from "@/hooks/useAppLang";

type SupportedLang = "en" | "fr" | "ar" | "ff" | "pcm";

const translations: Record<SupportedLang, {
  title: string;
  emptyTitle: string;
  emptyBody: string;
  footerTagline: string;
  footerSupport: string;
}> = {
  en: {
    title: "Notifications",
    emptyTitle: "All caught up!",
    emptyBody: "Your notifications will appear here.",
    footerTagline: "Smarter marketplace, safer deals",
    footerSupport: "Support: support@bambeh.com",
  },
  fr: {
    title: "Notifications",
    emptyTitle: "Tout est à jour !",
    emptyBody: "Vos notifications apparaîtront ici.",
    footerTagline: "Marketplace plus intelligente, transactions plus sûres",
    footerSupport: "Assistance : support@bambeh.com",
  },
  ar: {
    title: "الإشعارات",
    emptyTitle: "كل شيء محدث!",
    emptyBody: "ستظهر إشعاراتك هنا.",
    footerTagline: "سوق أذكى، معاملات أكثر أمانًا",
    footerSupport: "الدعم: support@bambeh.com",
  },
  ff: {
    title: "Tintinnɗe",
    emptyTitle: "Kuuɓe fow ooñii!",
    emptyBody: "Tintinnɗe maa ɓe waɗo e ndee.",
    footerTagline: "Marche plus smart, feebarere ɗee heɓi",
    footerSupport: "Ballal: support@bambeh.com",
  },
  pcm: {
    title: "Notifications",
    emptyTitle: "Everything don set!",
    emptyBody: "You notifications go show here.",
    footerTagline: "Smarter market, safer deal",
    footerSupport: "Support: support@bambeh.com",
  },
};

const typeIcon: Record<string, string> = {
  welcome: "👋",
  subscription: "⭐",
  new_order: "🛒",
  new_message: "💬",
  order: "🛒",
  chat: "💬",
  promo: "🔔",
  system: "⚙️",
  review: "⭐",
  payment: "💳",
};

const typeBg: Record<string, string> = {
  welcome: "rgba(29,158,117,0.12)",
  subscription: "rgba(239,159,39,0.12)",
  new_order: "rgba(55,138,221,0.12)",
  new_message: "rgba(212,83,126,0.12)",
  order: "rgba(55,138,221,0.12)",
  chat: "rgba(212,83,126,0.12)",
  promo: "rgba(147,51,234,0.12)",
  system: "rgba(107,114,128,0.12)",
  review: "rgba(239,159,39,0.12)",
  payment: "rgba(16,185,129,0.12)",
};

export default function NotificationCard({
  notif,
  onRead,
  compact = false,
}: {
  notif: BambehNotification;
  onRead?: (id: string) => void;
  compact?: boolean;
}) {
  const navigate = useNavigate();
  const lang = (useLang() || "en") as SupportedLang;
  const copy = translations[lang] ?? translations.en;
  const isRTL = lang === "ar";

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return lang === "ar" ? "الآن" : lang === "fr" ? "À l’instant" : "Haa ɗoo";
    if (m < 60) return lang === "ar" ? `${m} د` : `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return lang === "ar" ? `${h} س` : `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 7) return lang === "ar" ? `${d} ي` : `${d}d ago`;
    return new Date(dateStr).toLocaleDateString(lang === "ar" ? "ar" : lang === "fr" ? "fr" : "en");
  }

  const icon = typeIcon[notif.type] ?? "🔔";
  const bg = typeBg[notif.type] ?? "rgba(29,158,117,0.12)";
  const isUnread = !notif.is_read;

  const handleClick = () => {
    onRead?.(notif.id);
    if (notif.link) navigate(notif.link);
  };

  return (
    <div
      onClick={handleClick}
      dir={isRTL ? "rtl" : "ltr"}
      style={{
        display: "flex",
        flexDirection: isRTL ? "row-reverse" : "row",
        gap: 14,
        padding: compact ? "12px 14px" : "16px",
        borderBottom: "0.5px solid rgba(0,0,0,0.06)",
        background: isUnread ? "rgba(29,158,117,0.04)" : "transparent",
        cursor: notif.link || isUnread ? "pointer" : "default",
        transition: "background 0.2s",
        textAlign: isRTL ? "right" : "left",
      }}
    >
      <div
        style={{
          width: compact ? 40 : 44,
          height: compact ? 40 : 44,
          borderRadius: "50%",
          background: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: compact ? 18 : 20,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            flexDirection: isRTL ? "row-reverse" : "row",
            justifyContent: "space-between",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <span
            style={{
              fontSize: compact ? 13 : 14,
              fontWeight: isUnread ? 700 : 500,
              lineHeight: 1.3,
              color: "inherit",
              textAlign: isRTL ? "right" : "left",
            }}
          >
            {notif.title}
          </span>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              flexShrink: 0,
              flexDirection: isRTL ? "row-reverse" : "row",
            }}
          >
            <span style={{ fontSize: 11, color: "rgba(128,128,128,0.75)", whiteSpace: "nowrap" }}>
              {timeAgo(notif.created_at)}
            </span>
            {isUnread && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#1D9E75" }} />}
          </div>
        </div>

        <p
          style={{
            fontSize: compact ? 12 : 13,
            color: "rgba(100,100,100,0.9)",
            margin: 0,
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            textAlign: isRTL ? "right" : "left",
          }}
        >
          {notif.body}
        </p>

        {!compact && (
          <div
            style={{
              marginTop: 10,
              fontSize: 11,
              color: "rgba(100,100,100,0.7)",
              textAlign: isRTL ? "right" : "left",
            }}
          >
            {copy.footerTagline} • {copy.footerSupport}
          </div>
        )}
      </div>
    </div>
  );
}
