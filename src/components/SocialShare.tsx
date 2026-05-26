/**
 * src/components/social/SocialShare.tsx
 * Bambeh Marketplace — Social Share Panel
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { useState, useCallback } from "react";
import {
  Share2,
  Copy,
  MessageCircle,
  Facebook,
  Twitter,
  Check,
  X,
} from "lucide-react";

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  imageUrl?: string;
  onClose?: () => void;
  className?: string;
}

interface ShareOption {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  action: (url: string, title: string) => void;
}

const SocialShare: React.FC<SocialShareProps> = ({
  url,
  title,
  description = "",
  onClose,
  className = "",
}) => {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDesc = encodeURIComponent(description);

  const shareOptions: ShareOption[] = [
    {
      id: "whatsapp",
      label: "WhatsApp",
      icon: MessageCircle,
      color: "bg-green-500 hover:bg-green-600",
      action: (u, t) =>
        window.open(
          `https://wa.me/?text=${encodeURIComponent(`${t} ${u}`)}`,
          "_blank",
          "noopener,noreferrer"
        ),
    },
    {
      id: "facebook",
      label: "Facebook",
      icon: Facebook,
      color: "bg-blue-600 hover:bg-blue-700",
      action: (u) =>
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}`,
          "_blank",
          "noopener,noreferrer"
        ),
    },
    {
      id: "twitter",
      label: "Twitter / X",
      icon: Twitter,
      color: "bg-sky-500 hover:bg-sky-600",
      action: (u, t) =>
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(t)}&url=${encodeURIComponent(u)}`,
          "_blank",
          "noopener,noreferrer"
        ),
    },
  ];

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [url]);

  const handleNativeShare = useCallback(async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({ title, text: description, url });
    } catch {
      // User dismissed — ignore
    }
  }, [title, description, url]);

  return (
    <div className={`bg-white rounded-2xl p-5 shadow-xl ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Share2 className="w-5 h-5 text-teal-600" />
          <h3 className="text-base font-semibold text-gray-900">Partager</h3>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* Share options */}
      <div className="flex justify-around gap-3 mb-4">
        {shareOptions.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => opt.action(url, title)}
            className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl text-white transition-colors ${opt.color}`}
          >
            <opt.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{opt.label}</span>
          </button>
        ))}

        {typeof navigator !== "undefined" && "share" in navigator && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl text-white bg-purple-500 hover:bg-purple-600 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-xs font-medium">Autres</span>
          </button>
        )}
      </div>

      {/* Copy link */}
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-2">
        <span className="flex-1 text-xs text-gray-500 truncate">{url}</span>
        <button
          type="button"
          onClick={handleCopy}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            copied
              ? "bg-green-100 text-green-700"
              : "bg-teal-600 text-white hover:bg-teal-700"
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Copié
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copier
            </>
          )}
        </button>
      </div>

      {/* Suppress unused vars warnings */}
      <span className="hidden">{encodedUrl}{encodedTitle}{encodedDesc}</span>
    </div>
  );
};

export default SocialShare;
