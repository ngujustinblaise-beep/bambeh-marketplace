import React from "react";
import { Link } from "react-router-dom";

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: "By accessing Bambeh Marketplace you agree to be bound by these Terms and all applicable laws of the Republic of .",
  }, ,
  {
    title: "4. Prohibited Content",
    body: "You may not post weapons, drugs, counterfeit goods, or items prohibited under ian law. Violations result in immediate account termination.",
  },
  {
    title: "5. Governing Law",
    body: "These Terms are governed by the laws of the Republic of , jurisdiction in Yaounde.",
  },
];

const TermsOfService: React.FC = () => (
  <div className="max-w-3xl mx-auto py-10 px-4">
    <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
    <p className="text-sm text-gray-400 mb-8">Last updated: January 2026</p>
    <div className="space-y-8">
      {sections.map((s) => (
        <div key={s.title}>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            {s.title}
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">{s.body}</p>
        </div>
      ))}
    </div>
    <div className="mt-10 pt-6 border-t border-gray-100">
      <Link
        to="/privacy-policy"
      className="text-sm text-teal-600 hover:underline"
      >
        Privacy Policy
      </Link>
    </div>
  </div>
);

export default TermsOfService;

