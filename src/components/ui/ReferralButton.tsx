/**
 * src/components/ui/ReferralButton.tsx
 * Bambeh Marketplace — Referral Share Button
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { useState, useCallback } from "react";
import { Gift, Copy, Check, Share2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ReferralButtonProps {
  userId: string;
  variant?: "full" | "compact" | "icon";
  className?: string;
}

const ReferralButton: React.FC<ReferralButtonProps> = ({
  userId,
  variant = "full",
  className = "",
}) => {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);

  const getReferralCode = useCallback(async (): Promise<string> => {
    if (referralCode) return referralCode;

    setLoading(true);
    try {
      const { data } = await supabase
        .from("profiles")
        .select("referral_code")
        .eq("id", userId)
        .single();

      const code = (data?.referral_code as string) ?? userId.slice(0, 8).toUpperCase();
      setReferralCode(code);
      return code;
    } catch {
      return userId.slice(0, 8).toUpperCase();
    } finally {
      setLoading(false);
    }
  }, [userId, referralCode]);

  const handleShare = useCallback(async () => {
    const code = await getReferralCode();
    const referralUrl = `${window.location.origin}/#/register?ref=${code}`;
    const shareText = `🛍️ Rejoignez Bambeh Marketplace avec mon code de parrainage et obtenez des avantages exclusifs!\n\nCode: ${code}\nLien: ${referralUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Rejoignez Bambeh Marketplace",
          text: shareText,
          url: referralUrl,
        });
        return;
      } catch {
        // Fall through to copy
      }
    }

    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Ignore
    }
  }, [getReferralCode]);

  const handleCopy = useCallback(async () => {
    const code = await getReferralCode();
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Ignore
    }
  }, [getReferralCode]);

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleShare}
        disabled={loading}
        className={`p-2 rounded-full bg-teal-100 hover:bg-teal-200 transition-colors ${className}`}
        aria-label="Partager mon lien de parrainage"
      >
        <Gift className="w-5 h-5 text-teal-600" />
      </button>
    );
  }

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={handleShare}
        disabled={loading}
        className={`flex items-center gap-2 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors ${className}`}
      >
        <Gift className="w-4 h-4" />
        <span>Parrainer</span>
      </button>
    );
  }

  return (
    <div
      className={`bg-gradient-to-br from-teal-50 to-green-50 border border-teal-200 rounded-2xl p-4 space-y-3 ${className}`}
    >
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 bg-teal-600 rounded-full flex items-center justify-center">
          <Gift className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900">Programme de Parrainage</h3>
          <p className="text-xs text-gray-500">Gagnez des Zerm Coins</p>
        </div>
      </div>

      {referralCode && (
        <div className="flex items-center justify-between bg-white border border-teal-200 rounded-xl px-3 py-2">
          <span className="text-sm font-mono font-bold text-teal-700 tracking-wider">
            {referralCode}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:bg-teal-50 transition-colors"
            aria-label="Copier le code"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4 text-gray-500" />
            )}
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleShare}
          disabled={loading}
          className="flex items-center justify-center gap-1.5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
        >
          <Share2 className="w-4 h-4" />
          Partager
        </button>

        <button
          type="button"
          onClick={handleCopy}
          disabled={loading}
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-colors border ${
            copied
              ? "bg-green-50 border-green-300 text-green-700"
              : "bg-white border-teal-300 text-teal-700 hover:bg-teal-50"
          }`}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copié!" : "Copier le lien"}
        </button>
      </div>
    </div>
  );
};

export default ReferralButton;



