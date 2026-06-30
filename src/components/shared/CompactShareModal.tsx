/**
 * src/components/shared/CompactShareModal.tsx
 * Bambeh Marketplace ? Compact Share Bottom Sheet
 * ? 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { useEffect, useCallback } from "react";
import { Share2, Copy, MessageCircle, X, Check } from "lucide-react";

interface CompactShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
  description?: string;
}

const CompactShareModal: React.FC<CompactShareModalProps> = ({
  isOpen,
  onClose,
  url,
  title,
  description = "",
}) => {
  const [copied, setCopied] = React.useState(false);

  // Close on backdrop click or Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.createElement("textarea");
      el.value = url;
      el.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [url]);

  const shareWhatsApp = useCallback(() => {
    const text = encodeURIComponent(`${title}\n${description}\n${url}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  }, [title, description, url]);

  const handleNativeShare = useCallback(async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({ title, text: description, url });
    } catch {
      // Dismissed
    }
  }, [title, description, url]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Partager"
        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl p-5 animate-slide-up"
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-teal-600" />
            <h3 className="font-semibold text-gray-900">Partager</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100"
            aria-label="Fermer"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Title preview */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{title}</p>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <button
            type="button"
            onClick={shareWhatsApp}
            className="flex flex-col items-center gap-1.5 py-3 bg-green-50 hover:bg-green-100 rounded-xl transition-colors"
          >
            <MessageCircle className="w-6 h-6 text-green-600" />
            <span className="text-xs font-medium text-green-700">WhatsApp</span>
          </button>

          {"share" in navigator && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="flex flex-col items-center gap-1.5 py-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
            >
              <Share2 className="w-6 h-6 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">Partager</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className={`flex flex-col items-center gap-1.5 py-3 rounded-xl transition-colors ${
              copied
                ? "bg-green-50"
                : "bg-gray-50 hover:bg-gray-100"
            }`}
          >
            {copied ? (
              <Check className="w-6 h-6 text-green-600" />
            ) : (
              <Copy className="w-6 h-6 text-gray-600" />
            )}
            <span className={`text-xs font-medium ${copied ? "text-green-700" : "text-gray-700"}`}>
              {copied ? "Copi?!" : "Copier"}
            </span>
          </button>
        </div>

        {/* URL display */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
          <p className="text-xs text-gray-500 truncate">{url}</p>
        </div>
      </div>
    </>
  );
};

export default CompactShareModal;





