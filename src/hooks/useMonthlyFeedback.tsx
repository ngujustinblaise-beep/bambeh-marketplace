/**
 * useMonthlyFeedback.tsx
 * Fires the monthly feedback notification once per calendar month.
 */

import { useEffect, useState, useCallback } from "react";
import React from "react";

const STORAGE_KEY = "Bambeh_last_feedback_month";
const FEEDBACK_URL = "/help/contact";

function currentMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function isFeedbackDue(): boolean {
  try {
    const last = localStorage.getItem(STORAGE_KEY);
    return last !== currentMonthKey();
  } catch {
    return false;
  }
}

function markFeedbackSent(): void {
  try {
    localStorage.setItem(STORAGE_KEY, currentMonthKey());
  } catch {
    // localStorage unavailable â€” fail silently
  }
}

async function scheduleNativeNotification(): Promise<void> {
  try {
    const { LocalNotifications } =
      await import("@capacitor/local-notifications");

    const permResult = await LocalNotifications.requestPermissions();
    if (permResult.display !== "granted") return;

    const fireAt = new Date(Date.now() + 5000);

    await LocalNotifications.schedule({
      notifications: [
        {
          id: 8801,
          title: "ðŸ‹ï¸ Bambeh wants to hear from you",
          body: "How can we carry your load better this month? Your voice shapes us.",
          schedule: { at: fireAt, allowWhileIdle: true },
          smallIcon: "ic_bambeh_notification",
          iconColor: "#B8960C",
          actionTypeId: "FEEDBACK",
          extra: { url: FEEDBACK_URL },
        },
      ],
    });

    await LocalNotifications.addListener(
      "localNotificationActionPerformed",
      (action) => {
        if (action.notification.id === 8801) {
          window.location.href = FEEDBACK_URL;
        }
      },
    );
  } catch (err) {
    console.log(
      "[useMonthlyFeedback] Native notification unavailable, using banner fallback.",
    );
  }
}

export function useMonthlyFeedback(): void {
  useEffect(() => {
    if (!isFeedbackDue()) return;

    const isNative = (() => {
      try {
        return (
          typeof window !== "undefined" &&
          (window as any)?.Capacitor?.isNativePlatform?.()
        );
      } catch {
        return false;
      }
    })();

    if (isNative) {
      scheduleNativeNotification().then(() => markFeedbackSent());
    } else {
      markFeedbackSent();
      const timer = setTimeout(() => {
        window.dispatchEvent(new CustomEvent("bambeh:monthly-feedback"));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);
}

export function MonthlyFeedbackBanner() {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => setVisible(false), 400);
  }, []);

  useEffect(() => {
    const handler = () => setVisible(true);
    window.addEventListener("bambeh:monthly-feedback", handler);
    return () => window.removeEventListener("bambeh:monthly-feedback", handler);
  }, []);

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes mfb-slide-in {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes mfb-slide-out {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(100%); opacity: 0; }
        }
        .mfb-wrap {
          animation: ${exiting ? "mfb-slide-out" : "mfb-slide-in"} 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
        }
      `}</style>

      <div
        onClick={dismiss}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          zIndex: 9990,
          backdropFilter: "blur(2px)",
        }}
      />

      <div
        className="mfb-wrap"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9991,
          background: "linear-gradient(160deg, #1a1200, #0f0a00)",
          borderTop: "1px solid rgba(184,150,12,0.4)",
          borderRadius: "20px 20px 0 0",
          padding: "24px 20px 32px",
          maxWidth: 480,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            width: 36,
            height: 4,
            borderRadius: 2,
            background: "rgba(255,255,255,0.15)",
            margin: "-12px auto 20px",
          }}
        />

        <div style={{ textAlign: "center", fontSize: 40, marginBottom: 12 }}>
          ðŸ‹ï¸
        </div>

        <div
          style={{
            fontFamily: "'Georgia', 'Times New Roman', serif",
            fontSize: 20,
            fontWeight: 700,
            color: "#FFF8E7",
            textAlign: "center",
            marginBottom: 8,
            lineHeight: 1.3,
          }}
        >
          How can we carry your load better?
        </div>

        <div
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: 14,
            color: "rgba(255,248,231,0.7)",
            textAlign: "center",
            lineHeight: 1.6,
            marginBottom: 24,
          }}
        >
          Your voice is our fuel. This month, tell us what the Bambeh can do
          better â€” your feedback shapes what we build next.
        </div>

        <a
          href={FEEDBACK_URL}
          onClick={dismiss}
          style={{
            display: "block",
            background: "linear-gradient(135deg, #D4A017, #B8960C)",
            color: "#0a0802",
            fontFamily: "'Georgia', serif",
            fontWeight: 700,
            fontSize: 16,
            padding: "14px",
            borderRadius: 40,
            textAlign: "center",
            textDecoration: "none",
            marginBottom: 12,
            transition: "transform 0.2s",
          }}
        >
          Share my voice â†’
        </a>

        <button
          onClick={dismiss}
          style={{
            display: "block",
            width: "100%",
            background: "transparent",
            border: "none",
            color: "rgba(255,255,255,0.35)",
            fontFamily: "Arial, sans-serif",
            fontSize: 13,
            padding: "8px",
            cursor: "pointer",
          }}
        >
          Maybe next time
        </button>
      </div>
    </>
  );
}

export function useFeedbackBanner() {
  const triggerFeedbackBanner = useCallback(() => {
    window.dispatchEvent(new CustomEvent("bambeh:monthly-feedback"));
  }, []);

  const resetFeedbackMonth = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* noop */
    }
  }, []);

  return { triggerFeedbackBanner, resetFeedbackMonth };
}




