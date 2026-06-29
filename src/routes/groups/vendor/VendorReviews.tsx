// @ts-nocheck
import React, { useState } from "react";
import { useLang, t } from "@/hooks/useAppLang";

type ReviewStatus = "all" | "replied" | "pending" | "flagged";
const TABS: ReviewStatus[] = ["all", "replied", "pending", "flagged"];
const LABELS: Record<ReviewStatus, string> = { all: "All", replied: "Replied", pending: "Pending", flagged: "Flagged" };

const VendorReviews: React.FC = () => {
  const [active, setActive] = useState<ReviewStatus>("all");
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Customer Reviews</h1>
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map(t => (
          <button key={t} onClick={() => setActive(t)}
            className={"px-4 py-2 rounded-full text-sm font-medium transition-colors " + (active === t ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
            {LABELS[t]}
          </button>
        ))}
      </div>
      <div className="text-gray-500 text-center py-12">No {LABELS[active].toLowerCase()} reviews yet.</div>
    </div>
  );
};
export default VendorReviews;





