import React from "react";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationCard from "@/components/notifications/NotificationCard";
import { useLang } from "@/hooks/useAppLang";

type SupportedLang = "en" | "fr" | "ar" | "ff" | "pcm";

const copyMap: Record<SupportedLang, {
  title: string;
  markAllRead: string;
  loading: string;
  emptyTitle: string;
  emptyBody: string;
}> = {
  en: {
    title: "Notifications",
    markAllRead: "Mark all read",
    loading: "Loading notifications...",
    emptyTitle: "All caught up!",
    emptyBody: "Your notifications will appear here.",
  },
  fr: {
    title: "Notifications",
    markAllRead: "Tout marquer comme lu",
    loading: "Chargement des notifications...",
    emptyTitle: "Tout est à jour !",
    emptyBody: "Vos notifications apparaîtront ici.",
  },
  ar: {
    title: "الإشعارات",
    markAllRead: "وضع الكل كمقروء",
    loading: "جارٍ تحميل الإشعارات...",
    emptyTitle: "كل شيء محدث!",
    emptyBody: "ستظهر إشعاراتك هنا.",
  },
  ff: {
    title: "Tintinnɗe",
    markAllRead: "Waɗo fow jaŋde",
    loading: "Your notifications are loading...",
    emptyTitle: "Kuuɓe fow ooñii!",
    emptyBody: "Tintinnɗe maa ɓe waɗo e ndee.",
  },
  pcm: {
    title: "Notifications",
    markAllRead: "Mark all as read",
    loading: "Notifications dey load...",
    emptyTitle: "Everything don set!",
    emptyBody: "You notifications go show here.",
  },
};

export default function Notifications() {
  const lang = (useLang() || "en") as SupportedLang;
  const copy = copyMap[lang] ?? copyMap.en;
  const isRTL = lang === "ar";
  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications();

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", paddingBottom: 80, direction: isRTL ? "rtl" : "ltr" }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "var(--color-background-primary, #fff)",
          borderBottom: "0.5px solid rgba(0,0,0,0.08)",
          padding: "16px 16px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexDirection: isRTL ? "row-reverse" : "row",
        }}
      >
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, textAlign: isRTL ? "right" : "left" }}>
            {copy.title}
          </h1>
          {unreadCount > 0 && (
            <span style={{ fontSize: 12, color: "#1D9E75", fontWeight: 500 }}>
              {unreadCount} unread
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            style={{
              fontSize: 13,
              color: "#1D9E75",
              background: "rgba(29,158,117,0.08)",
              border: "none",
              borderRadius: 20,
              padding: "6px 14px",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            {copy.markAllRead}
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "rgba(128,128,128,0.7)" }}>{copy.loading}</div>
        </div>
      ) : notifications.length === 0 ? (
        <div style={{ padding: 80, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{copy.emptyTitle}</div>
          <div style={{ fontSize: 13, color: "rgba(128,128,128,0.8)" }}>{copy.emptyBody}</div>
        </div>
      ) : (
        <div>
          {notifications.map((n) => (
            <NotificationCard key={n.id} notif={n} onRead={markRead} />
          ))}
        </div>
      )}
    </div>
  );
}
