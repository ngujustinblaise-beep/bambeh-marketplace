/**
 * src/components/DonateButton.tsx
 * Bambeh Marketplace ? Donate / Support Button
 * ? 2026 Bambeh Marketplace. All rights reserved.
 *
 * Export:
 *   DonateButton ? a floating or inline button that navigates to /donate
 *
 * Usage:
 *   import { DonateButton } from "@/components/DonateButton";
 *   <DonateButton />
 */
import React from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";

interface DonateButtonProps {
  className?: string;
  label?:     string;
  variant?:   "floating" | "inline";
}

export function DonateButton({
  className = "",
  label     = "Support Bambeh",
  variant   = "inline",
}: DonateButtonProps) {
  const navigate = useNavigate();

  if (variant === "floating") {
    return (
      <button
        type="button"
        onClick={() => navigate("/donate")}
        aria-label="Donate to support Bambeh"
        className={`fixed bottom-24 right-4 z-30 flex items-center gap-2
                    bg-gradient-to-r from-purple-600 to-pink-600 text-white
                    px-4 py-2.5 rounded-full shadow-lg font-semibold text-sm
                    hover:opacity-90 active:scale-95 transition-all ${className}`}
      >
        <Heart className="w-4 h-4 fill-white" />
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => navigate("/donate")}
      aria-label="Donate to support Bambeh"
      className={`flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600
                  text-white px-4 py-2 rounded-xl font-semibold text-sm
                  hover:opacity-90 active:scale-95 transition-all ${className}`}
    >
      <Heart className="w-4 h-4 fill-white" />
      {label}
    </button>
  );
}

export default DonateButton;






