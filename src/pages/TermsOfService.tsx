/**
 * TermsOfService.tsx — Bambeh Marketplace
 * ---------------------------------------------------------------------------
 * Play Store / App Store compliant — June 2026
 * Governed by: Cameroon Law No. 2024/017 of 23 December 2024 on Personal
 * Data Protection, OHADA Uniform Acts, and general principles of Cameroonian law.
 * ---------------------------------------------------------------------------
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useLang } from "@/hooks/useAppLang";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Section {
  id: string;
  title: string;
  body: React.ReactNode;
}

const COMPANY = {
  legalName: "BAMBEH SARL",
  registreDeCommerce: "CM -NSI-02-2026-B13-00179",
  niu: "M022618405804C",
  duns: "850379853",
  emails: ["support@bambeh.com", "bambetheapp@gmail.com"],
};

const CONTACT_EMAILS = COMPANY.emails;

// ─── Content ─────────────────────────────────────────────────────────────────
const SECTIONS: Section[] = [
  {
    id: "1",
    title: "1. Acceptance of Terms",
    body: (
      <>
        <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 mb-4">
          <h3 className="font-semibold text-teal-900 mb-2">Business Identity</h3>
          <p><strong>Legal business name:</strong> {COMPANY.legalName}</p>
          <p><strong>Registre de commerce:</strong> {COMPANY.registreDeCommerce}</p>
          <p><strong>NIU:</strong> {COMPANY.niu}</p>
          <p><strong>D-U-N-S No:</strong> {COMPANY.duns}</p>
        </div>

        <p>
          By accessing or using the Bambeh Marketplace platform — including our
          website at <strong>bambeh.com</strong>, any mobile application, or any
          related services (collectively, the "Platform") — you agree to be legally
          bound by these Terms of Service ("Terms") and all applicable laws of the
          Republic of Cameroon. If you do not agree to these Terms, you must
          immediately stop using the Platform.
        </p>
        <p className="mt-3">
          These Terms constitute a legally binding agreement between you and
          <strong> {COMPANY.legalName}</strong> ("Bambeh", "we", "us", or "our"),
          the operator of the Bambeh Marketplace, headquartered in Yaoundé,
          Republic of Cameroon.
        </p>
        <p className="mt-3">
          By creating an account, you confirm that you are at least{" "}
          <strong>18 years of age</strong> or the legal age of majority in your
          jurisdiction, and that you have the legal capacity to enter into a
          binding contract. Persons under 18 may not register or use the Platform.
        </p>
      </>
    ),
  },
  {
    id: "2",
    title: "2. Account Registration and Security",
    body: (
      <>
        <p>
          To access most features of the Platform, you must create an account by
          providing accurate, current, and complete information including your
          name, valid phone number, and email address. You agree to:
        </p>
        <ul className="list-disc pl-6 mt-2 space-y-1 text-sm text-gray-600">
          <li>Keep your password and account credentials strictly confidential.</li>
          <li>
            Notify us immediately at{" "}
            <a href="mailto:support@bambeh.com" className="text-teal-600 hover:underline">
              support@bambeh.com
            </a>{" "}
            if you suspect any unauthorized access to your account.
          </li>
          <li>Accept full responsibility for all activities that occur under your account.</li>
          <li>Not share your account with any other person.</li>
          <li>Not create more than one personal account. Duplicate accounts may be permanently removed.</li>
        </ul>
        <p className="mt-3">
          Bambeh reserves the right to suspend or permanently terminate any account
          that violates these Terms, without prior notice, at our sole discretion.
        </p>
        <p className="mt-3 font-medium text-gray-800">Account Deletion</p>
        <p className="mt-1">
          You may delete your account at any time from the <strong>Settings → Account</strong>
          section of the Platform. Upon deletion, your personal profile and listings
          will be removed from public view within <strong>30 days</strong>. Certain
          data may be retained for fraud prevention and legal compliance as required
          by Cameroon law and OHADA regulations.
        </p>
      </>
    ),
  },
  {
    id: "3",
    title: "3. Marketplace Listings and Transactions",
    body: (
      <>
        <p>
          Bambeh is a platform that connects buyers and sellers in Cameroon and
          the Central/West African region. We are <strong>not a party</strong> to
          any transaction between users. All transactions are conducted directly
          between buyers and sellers.
        </p>
        <ul className="list-disc pl-6 mt-3 space-y-1 text-sm text-gray-600">
          <li>All listings must accurately describe the item, service, property, or job opportunity, and must comply with all applicable Cameroonian laws.</li>
          <li>Prices must be stated in <strong>CFA Francs (FCFA)</strong>. Any currency other than FCFA must be clearly disclosed.</li>
          <li>A <strong>1% transaction fee</strong> applies to all completed sales processed through Bambeh's payment system.</li>
          <li>Payments processed via <strong>CamPay / NotchPay / Mobile Money</strong> (MTN MoMo, Orange Money) are subject to those providers' own terms.</li>
          <li>Bambeh's escrow feature holds funds securely until both parties confirm the transaction is complete.</li>
          <li>Bambeh does not guarantee the quality, safety, legality, or truth of any listing, or the ability of sellers to sell, or buyers to pay.</li>
        </ul>
        <p className="mt-3 font-medium text-gray-800">Seller Responsibilities</p>
        <p className="mt-1">
          You are solely responsible for all listings you post. You must have the
          legal right to sell or rent any item or property you list. Misrepresenting
          items is grounds for immediate account termination and may result in
          legal action under Cameroonian commercial law.
        </p>
      </>
    ),
  },
  {
    id: "4",
    title: "4. Prohibited Content and Conduct",
    body: (
      <>
        <p>
          You may not use the Platform to post, sell, offer, or promote any of the
          following, which are strictly prohibited under Cameroonian law and our
          platform policies:
        </p>
        <ul className="list-disc pl-6 mt-2 space-y-1 text-sm text-gray-600">
          <li>Firearms, ammunition, explosives, or any weapons</li>
          <li>Illegal drugs, controlled substances, or drug paraphernalia</li>
          <li>Counterfeit, pirated, or stolen goods</li>
          <li>Human trafficking, forced labor, or any exploitation of persons</li>
          <li>Child sexual abuse material (CSAM) — violations will be reported immediately to law enforcement</li>
          <li>Pornographic or sexually explicit content</li>
          <li>Hate speech targeting individuals based on ethnicity, religion, gender, disability, or sexual orientation</li>
          <li>Items prohibited under the laws of the Republic of Cameroon or applicable international law</li>
          <li>Spam, pyramid schemes, misleading advertisements, or fraudulent offers</li>
          <li>Unauthorized collection of other users' personal data</li>
        </ul>
        <p className="mt-3">
          Violations result in <strong>immediate, permanent account termination</strong>
          and may be reported to the appropriate Cameroonian authorities.
        </p>
      </>
    ),
  },
  {
    id: "5",
    title: "5. Zerm Coins (Platform Currency)",
    body: (
      <>
        <p>
          Bambeh operates a virtual rewards currency called <strong>Zerm Coins</strong>.
          You acknowledge and agree that:
        </p>
        <ul className="list-disc pl-6 mt-2 space-y-1 text-sm text-gray-600">
          <li>Zerm Coins have <strong>no monetary value</strong> outside the Platform and cannot be exchanged, sold, or transferred for real money or goods outside of Bambeh.</li>
          <li>Zerm Coins are non-transferable to other users (except via the Coins Transfer feature within the Platform).</li>
          <li>Bambeh reserves the right to modify Zerm Coin policies, values, or expiry rules with <strong>30 days' written notice</strong> via in-app notification or email.</li>
          <li>Unused Zerm Coins are forfeited upon account deletion.</li>
          <li>Zerm Coins are granted as platform rewards and are not a financial instrument, investment, or cryptocurrency.</li>
        </ul>
      </>
    ),
  },
  {
    id: "6",
    title: "6. Subscriptions and Payments",
    body: (
      <>
        <p>
          Bambeh offers optional subscription plans that unlock premium features.
          By subscribing, you agree to:
        </p>
        <ul className="list-disc pl-6 mt-2 space-y-1 text-sm text-gray-600">
          <li>Pay all fees associated with your chosen subscription plan in FCFA via supported payment methods.</li>
          <li>Subscriptions renew automatically unless cancelled at least <strong>24 hours before</strong> the renewal date from your account settings.</li>
          <li>Payments are processed externally via approved mobile money payment providers.</li>
          <li>Refunds are handled on a case-by-case basis. Contact <a href="mailto:support@bambeh.com" className="text-teal-600 hover:underline">support@bambeh.com</a> within 7 days of a disputed charge.</li>
        </ul>
      </>
    ),
  },
  {
    id: "7",
    title: "7. Artificial Intelligence (AI) Features",
    body: (
      <>
        <p>
          Bambeh's platform includes AI-powered features including the <strong>Bambeh AI Chatbot</strong>,
          smart recommendations, and search assistance.
        </p>
        <ul className="list-disc pl-6 mt-2 space-y-1 text-sm text-gray-600">
          <li>AI responses are generated automatically and may not always be accurate. Do not rely solely on AI advice for financial, legal, or medical decisions.</li>
          <li>By using AI features, you consent to your queries being processed by our AI service providers in accordance with our <Link to="/privacy-policy" className="text-teal-600 hover:underline">Privacy Policy</Link>.</li>
          <li>Bambeh discloses when you are interacting with an AI system, as required under applicable transparency regulations.</li>
        </ul>
      </>
    ),
  },
  {
    id: "8",
    title: "8. Data Protection and Privacy",
    body: (
      <>
        <p>
          The collection and processing of your personal data is governed by Cameroon's
          <strong> Law No. 2024/017 of 23 December 2024 on Personal Data Protection</strong>.
          You have the right to:
        </p>
        <ul className="list-disc pl-6 mt-2 space-y-1 text-sm text-gray-600">
          <li>Access the personal data we hold about you</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your data ("right to be forgotten")</li>
          <li>Object to certain processing of your data</li>
          <li>Port your data in a structured, machine-readable format</li>
        </ul>
        <p className="mt-3">
          To exercise any of these rights, contact us at{" "}
          <a href="mailto:support@bambeh.com" className="text-teal-600 hover:underline">
            support@bambeh.com
          </a>
          . Full details are in our{" "}
          <Link to="/privacy-policy" className="text-teal-600 hover:underline">Privacy Policy</Link>.
        </p>
      </>
    ),
  },
  {
    id: "9",
    title: "9. Intellectual Property",
    body: (
      <>
        <p>
          All content, trademarks, logos, trade names, technology, source code,
          designs, and platform features are owned by or licensed to{" "}
          <strong>{COMPANY.legalName}</strong> and are protected under Cameroonian
          intellectual property law and applicable international conventions.
        </p>
        <p className="mt-3">
          You may not copy, reproduce, distribute, modify, reverse-engineer,
          publicly display, or create derivative works from any part of the Platform
          without our prior written permission.
        </p>
        <p className="mt-3">
          By posting content on Bambeh (listings, images, descriptions), you grant
          Bambeh a non-exclusive, royalty-free, worldwide license to display,
          distribute, and promote that content within the Platform for the purpose
          of operating the marketplace.
        </p>
      </>
    ),
  },
  {
    id: "10",
    title: "10. Limitation of Liability",
    body: (
      <>
        <p>To the maximum extent permitted by applicable Cameroonian law:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1 text-sm text-gray-600">
          <li>Bambeh is not liable for indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform, including lost profits or data.</li>
          <li>Bambeh's total liability to you for any claim arising from these Terms shall not exceed the amount you paid to Bambeh in the 3 months preceding the claim.</li>
          <li>Bambeh does not verify the identity of every user and is not responsible for any fraudulent activity by third parties. Always exercise caution in person-to-person transactions.</li>
        </ul>
      </>
    ),
  },
  {
    id: "11",
    title: "11. Dispute Resolution",
    body: (
      <>
        <p>Any dispute, controversy, or claim arising out of or relating to these Terms or the Platform shall be resolved as follows:</p>
        <ol className="list-decimal pl-6 mt-2 space-y-1 text-sm text-gray-600">
          <li><strong>Informal resolution:</strong> First, contact us at <a href="mailto:support@bambeh.com" className="text-teal-600 hover:underline">support@bambeh.com</a> and we will attempt to resolve the matter within 14 business days.</li>
          <li><strong>Arbitration:</strong> If unresolved, disputes shall be submitted to binding arbitration in <strong>Yaoundé, Cameroon</strong>, under the applicable OHADA Uniform Acts on Arbitration.</li>
          <li><strong>Governing law:</strong> These Terms are governed exclusively by the laws of the <strong>Republic of Cameroon</strong>.</li>
        </ol>
      </>
    ),
  },
  {
    id: "12",
    title: "12. Changes to These Terms",
    body: (
      <>
        <p>Bambeh may modify these Terms at any time. When we make material changes, we will notify you via:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1 text-sm text-gray-600">
          <li>An in-app notification</li>
          <li>Email to your registered address</li>
          <li>A prominent notice on the Platform</li>
        </ul>
        <p className="mt-3">
          Continued use of the Platform after changes become effective constitutes
          your acceptance of the updated Terms. If you disagree with any changes,
          you must stop using the Platform and may delete your account.
        </p>
      </>
    ),
  },
  {
    id: "13",
    title: "13. Contact Us",
    body: (
      <>
        <p>For questions, complaints, or legal notices regarding these Terms:</p>
        <div className="mt-3 space-y-1 text-sm text-gray-700">
          <p><strong>Bambeh Marketplace</strong> — operated by {COMPANY.legalName}</p>
          <p>Yaoundé, Republic of Cameroon</p>
          <p>Email: <a href="mailto:support@bambeh.com" className="text-teal-600 hover:underline">support@bambeh.com</a></p>
          <p>Secondary email: <a href="mailto:bambetheapp@gmail.com" className="text-teal-600 hover:underline">bambetheapp@gmail.com</a></p>
          <p>Website: bambeh.com</p>
        </div>
      </>
    ),
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
const TermsOfService: React.FC = () => {
  const [openSection, setOpenSection] = useState<string | null>("1");
  useLang();

  const toggle = (id: string) => setOpenSection((prev) => (prev === id ? null : id));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-teal-600 to-teal-800 text-white py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
          <p className="text-teal-100 text-sm">Last updated: June 2026 · Effective immediately</p>
          <p className="mt-4 text-sm text-teal-100 leading-relaxed max-w-2xl">
            Please read these Terms carefully before using Bambeh. They are a legal agreement between you and {COMPANY.legalName}, operator of the Bambeh Marketplace.
          </p>
        </div>
      </div>

      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex gap-4 overflow-x-auto text-xs text-teal-700 font-medium">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setOpenSection(s.id);
                document.getElementById(`section-${s.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="whitespace-nowrap hover:text-teal-900 transition-colors"
            >
              {s.id}. {s.title.replace(/^\d+\.\s*/, "")}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-3">
        {SECTIONS.map((section) => {
          const isOpen = openSection === section.id;
          return (
            <div id={`section-${section.id}`} key={section.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => toggle(section.id)}
                className="w-full flex justify-between items-center px-5 py-4 text-left group focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-inset"
                aria-expanded={isOpen}
              >
                <span className="text-sm font-semibold text-gray-900 group-hover:text-teal-700 transition-colors">
                  {section.title}
                </span>
                <svg className={`w-5 h-5 text-teal-500 transition-transform duration-200 flex-shrink-0 ml-4 ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-50">
                  <div className="pt-4">{section.body}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-12">
        <div className="bg-teal-50 rounded-xl p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border border-teal-100">
          <div>
            <p className="text-sm font-semibold text-teal-800">Also review our Privacy Policy</p>
            <p className="text-xs text-teal-600 mt-0.5">Learn how we collect, use, and protect your personal data.</p>
          </div>
          <Link to="/privacy-policy" className="flex-shrink-0 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
            Privacy Policy →
          </Link>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          © {new Date().getFullYear()} {COMPANY.legalName} — Bambeh Marketplace. All rights reserved.
          <br />
          Governed by the laws of the Republic of Cameroon.
        </p>
      </div>
    </div>
  );
};

export default TermsOfService;
