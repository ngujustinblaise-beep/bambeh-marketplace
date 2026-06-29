// @ts-nocheck
import React from "react";

interface BadgeWithTooltipProps {
  label: string;
  tooltip: string;
  icon?: string;
  color?: string;
}

interface BadgeRequirementsProps {
  requirements: string[];
  title?: string;
}

const BadgeWithTooltip: React.FC<BadgeWithTooltipProps> = ({
  label, tooltip, icon = "✅", color = "teal",
}) => (
  <div className="relative group inline-flex items-center gap-1 cursor-default">
    <span className={`text-${color}-600 text-lg`}>{icon}</span>
    <span className={`text-xs font-semibold text-${color}-700`}>{label}</span>
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1
      hidden group-hover:block z-50 bg-gray-800 text-white text-xs
      rounded px-2 py-1 whitespace-nowrap shadow-lg">
      {tooltip}
    </div>
  </div>
);

const BadgeRequirements: React.FC<BadgeRequirementsProps> = ({
  requirements, title = "Requirements",
}) => (
  <div className="bg-gray-50 rounded-xl p-4">
    <p className="font-semibold text-sm mb-2">{title}</p>
    <ul className="space-y-1">
      {requirements.map((r, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
          <span className="text-teal-500 mt-0.5">•</span>{r}
        </li>
      ))}
    </ul>
  </div>
);

interface TrustedBadgeProps {
  level?: "basic" | "verified" | "premium";
  showRequirements?: boolean;
}

const TrustedBadge: React.FC<TrustedBadgeProps> = ({ level = "basic", showRequirements }) => {
  const config = {
    basic:    { label: "Trusted",  icon: "🛡ï¸",  tooltip: "This seller has a verified phone number.",    color: "gray"  },
    verified: { label: "Verified", icon: "✅",  tooltip: "Identity and business verified by Bambeh.",    color: "teal"  },
    premium:  { label: "Premium",  icon: "⭐",  tooltip: "Top-rated seller with premium subscription.", color: "yellow"},
  }[level];

  const requirements = [
    "Verified phone number",
    "At least 10 completed transactions",
    "Rating above 4.0",
    "Active subscription",
  ];

  return (
    <div className="inline-flex flex-col gap-2">
      <BadgeWithTooltip {...config} />
      {showRequirements && <BadgeRequirements requirements={requirements} />}
    </div>
  );
};

export default TrustedBadge;
export { BadgeWithTooltip, BadgeRequirements };
export type { BadgeWithTooltipProps, BadgeRequirementsProps };



