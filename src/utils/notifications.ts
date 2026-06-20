/**
 * src/utils/notifications.ts
 * Bambeh Marketplace - lightweight, self-contained notification utility.
 *
 * Drop-in functional replacement for the previous stub. No providers, no deps:
 * notify() renders an animated toast into <body> and (optionally) fires a
 * native browser/OS notification. The original `notify(message)` call shape
 * still works, so existing callers keep functioning.
 */

export type NotifyType = "success" | "error" | "info" | "warning";

export interface NotifyOptions {
  type?: NotifyType;
  duration?: number; // ms before auto-dismiss (default 3500)
  title?: string;
  desktop?: boolean; // also raise a browser Notification if the user permits
}

const ACCENT: Record<NotifyType, string> = {
  success: "#16a34a",
  error: "#dc2626",
  info: "#0d9488",
  warning: "#d97706",
};

const CONTAINER_ID = "bambeh-toast-container";

function getContainer(): HTMLElement {
  let el = document.getElementById(CONTAINER_ID);
  if (!el) {
    el = document.createElement("div");
    el.id = CONTAINER_ID;
    el.style.cssText =
      "position:fixed;top:16px;right:16px;z-index:99999;display:flex;" +
      "flex-direction:column;gap:8px;max-width:360px;pointer-events:none;";
    document.body.appendChild(el);
  }
  return el;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string)
  );
}

/** Show an in-app toast. Returns a function that dismisses it early. */
export function notify(message: string, options: NotifyOptions = {}): () => void {
  const { type = "info", duration = 3500, title, desktop = false } = options;

  // SSR / non-browser safety
  if (typeof document === "undefined" || typeof window === "undefined") {
    // eslint-disable-next-line no-console
    console.log(`[notify:${type}]`, title ? `${title} - ${message}` : message);
    return () => {};
  }

  const container = getContainer();
  const toast = document.createElement("div");
  toast.setAttribute("role", type === "error" ? "alert" : "status");
  toast.style.cssText =
    `pointer-events:auto;cursor:pointer;background:#111827;color:#fff;` +
    `border-left:4px solid ${ACCENT[type]};padding:12px 14px;border-radius:10px;` +
    "box-shadow:0 6px 24px rgba(0,0,0,.18);font:14px/1.4 system-ui,Segoe UI,sans-serif;" +
    "opacity:0;transform:translateX(24px);transition:opacity .25s ease,transform .25s ease;";
  toast.innerHTML =
    (title ? `<div style="font-weight:700;margin-bottom:2px">${escapeHtml(title)}</div>` : "") +
    `<div>${escapeHtml(message)}</div>`;

  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateX(0)";
  });

  let timer = 0;
  const dismiss = () => {
    if (timer) window.clearTimeout(timer);
    toast.style.opacity = "0";
    toast.style.transform = "translateX(24px)";
    window.setTimeout(() => toast.remove(), 260);
  };
  toast.addEventListener("click", dismiss);
  timer = window.setTimeout(dismiss, Math.max(1200, duration));

  if (desktop && "Notification" in window) {
    try {
      if (Notification.permission === "granted") {
        new Notification(title || "Bambeh", { body: message });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((p) => {
          if (p === "granted") new Notification(title || "Bambeh", { body: message });
        });
      }
    } catch {
      /* Notification API unavailable - in-app toast already shown */
    }
  }

  return dismiss;
}

export const notifySuccess = (m: string, o: Omit<NotifyOptions, "type"> = {}) =>
  notify(m, { ...o, type: "success" });
export const notifyError = (m: string, o: Omit<NotifyOptions, "type"> = {}) =>
  notify(m, { ...o, type: "error" });
export const notifyInfo = (m: string, o: Omit<NotifyOptions, "type"> = {}) =>
  notify(m, { ...o, type: "info" });
export const notifyWarning = (m: string, o: Omit<NotifyOptions, "type"> = {}) =>
  notify(m, { ...o, type: "warning" });

export default notify;
