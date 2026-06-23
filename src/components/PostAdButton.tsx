// @ts-nocheck
import React from "react";

interface PostAdButtonProps {
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

const SIZES    = { sm: "px-3 py-1 text-sm", md: "px-4 py-2", lg: "px-6 py-3 text-lg" };
const VARIANTS = {
  primary:   "bg-teal-600 text-white hover:bg-teal-700",
  secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
  ghost:     "border border-teal-600 text-teal-600 hover:bg-teal-50",
};

const PostAdButton: React.FC<PostAdButtonProps> = ({
  className = "",
  variant   = "primary",
  size      = "md",
  onClick,
}) => (
  <button
    onClick={onClick}
    className={`rounded-full font-semibold transition-colors ${SIZES[size]} ${VARIANTS[variant]} ${className}`}
  >
    + Post Ad
  </button>
);

export default PostAdButton;






