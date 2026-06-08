/**
 * PrivacyPolicy.tsx — Bambeh Marketplace
 * ---------------------------------------------------------------------------
 * Play Store / App Store compliant — June 2026
 * Governed by: Cameroon Law No. 2024/017 of 23 December 2024 on Personal
 * Data Protection, and applicable principles of international privacy law.
 *
 * Covers all Apple & Google requirements:
 *  - What data is collected and why
 *  - Third-party disclosures (AI services, payment providers)
 *  - User rights: access, correction, deletion, portability
 *  - Account deletion path
 *  - Children's privacy
 *  - Data retention
 *  - Contact for privacy requests
 * ---------------------------------------------------------------------------
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useLang, t } from "@/hooks/useAppLang";

interface Section {
  id: string;
  title: string;
  body: React.ReactNode;
}

const SECTIONS: Section[] = [
  {
    id: "1",
    title: "1. Who We Are",
    body: (
      <p>
        This Privacy Policy describes how <strong>BAMBEH SARL</strong>{" "}
        ("Bambeh", "we", "us", or "our"), operator of the Bambeh Marketplace
        (bambeh.com), collects, uses, stores, and protects your personal data
        when you use our platform. Our platform operates primarily in the
        Republic of Cameroon and serves users across the Central and West African
        region. Our registered address is in <strong>Yaoundé, Republic of
        Cameroon</strong>. For privacy inquiries, contact:{" "}
        <a href="mailto:support@bambeh.com" className="text-teal-600 hover:underline">
          support@bambeh.com
        </a>
        .
      </p>
    ),
  },
  {
    id: "2",
    title: "2. Information We Collect",
    body: (
      <>
        <p className="font-medium text-gray-800 mb-2">
          We collect the following categories of personal data:
        </p>

        <p className="font-medium text-gray-700 mt-3">A. Information you give us</p>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>Full name and display name</li>
          <li>Email address</li>
          <li>Phone number (used for account verification and Mobile Money payments)</li>
          <li>Profile photo (optional)</li>
          <li>Location (city/region, for local listings)</li>
          <li>Listing content: titles, descriptions, prices, photos you upload</li>
          <li>Messages sent via the in-app chat feature</li>
          <li>Payment information (processed by CamPay/NotchPay — we do <em>not</em> store full payment card details)</li>
        </ul>

        <p className="font-medium text-gray-700 mt-4">B. Information collected automatically</p>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>IP address and approximate geographic location</li>
          <li>Device type, operating system, browser version</li>
          <li>Pages viewed, links clicked, time spent on pages</li>
          <li>Search queries entered on the Platform</li>
          <li>App crash reports and performance data (via analytics tools)</li>
          <li>Language and region preferences</li>
        </ul>

        <p className="font-medium text-gray-700 mt-4">C. Information from third parties</p>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>
            <strong>Google / Social sign-in:</strong> If you register using a
            social login, we receive your name and email from that provider.
          </li>
          <li>
            <strong>Payment providers (CamPay, NotchPay):</strong> We receive
            transaction confirmation references but not your full payment details.
          </li>
          <li>
            <strong>Supabase (our database provider):</strong> All user data is
            stored securely on Supabase's servers.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "3",
    title: "3. How We Use Your Information",
    body: (
      <>
        <p>We use your personal data for the following purposes:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>To create and manage your account</li>
          <li>To display your listings to other users</li>
          <li>To process payments and issue transaction confirmations</li>
          <li>To send you notifications about your listings, messages, and orders</li>
          <li>To improve Platform features through usage analytics</li>
          <li>To detect and prevent fraud, abuse, and security threats</li>
          <li>To provide customer support</li>
          <li>To comply with legal obligations under Cameroonian law</li>
          <li>To power AI-assisted features (smart search, chatbot, recommendations)</li>
          <li>
            To send you optional marketing communications — you may opt out at
            any time in <strong>Settings → Notifications</strong>
          </li>
        </ul>
        <p className="mt-3">
          <strong>Legal basis for processing:</strong> We process your data
          based on (a) performance of our contract with you, (b) your consent
          where applicable, (c) our legitimate interests in operating a safe
          marketplace, and (d) compliance with applicable law.
        </p>
      </>
    ),
  },
  {
    id: "4",
    title: "4. Third-Party Services and Disclosures",
    body: (
      <>
        <p>
          We share your personal data with trusted third-party service providers
          only to the extent necessary to operate the Platform:
        </p>
        <div className="mt-3 space-y-3">
          {[
            {
              name: "Supabase",
              role: "Database and authentication",
              policy: "supabase.com/privacy",
            },
            {
              name: "CamPay / NotchPay",
              role: "Mobile money payment processing",
              policy: "campay.net/privacy",
            },
            {
              name: "Netlify",
              role: "Web hosting and CDN",
              policy: "netlify.com/privacy",
            },
            {
              name: "Render",
              role: "Payment server hosting",
              policy: "render.com/privacy",
            },
            {
              name: "AI service providers",
              role: "AI chatbot and smart recommendations (queries may be processed by AI APIs)",
              policy: "disclosed on request",
            },
            {
              name: "Analytics providers",
              role: "Usage analytics for platform improvement",
              policy: "disclosed on request",
            },
          ].map((p) => (
            <div
              key={p.name}
              className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-100"
            >
              <p className="font-medium text-sm text-gray-800">{p.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{p.role}</p>
              <p className="text-xs text-teal-600 mt-0.5">{p.policy}</p>
            </div>
          ))}
        </div>
        <p className="mt-4">
          We do <strong>not</strong> sell your personal data to advertisers or
          data brokers. We do not display third-party advertisements on the Platform.
        </p>
        <p className="mt-3">
          We may disclose your data to law enforcement authorities if required by
          a valid legal order under Cameroonian law.
        </p>
      </>
    ),
  },
  {
    id: "5",
    title: "5. Data Retention",
    body: (
      <>
        <p>We retain your personal data for the following periods:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>
            <strong>Active accounts:</strong> As long as your account remains
            active.
          </li>
          <li>
            <strong>Deleted accounts:</strong> Profile data is removed from
            public view within 30 days of account deletion. Anonymised transaction
            data may be retained for up to 5 years for legal and fraud-prevention
            purposes.
          </li>
          <li>
            <strong>Messages:</strong> Chat messages are retained for 12 months
            after the last message, then automatically deleted.
          </li>
          <li>
            <strong>Analytics data:</strong> Aggregated, anonymised analytics
            data may be retained indefinitely.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "6",
    title: "6. Your Rights",
    body: (
      <>
        <p>
          Under Cameroon's Law No. 2024/017 and applicable international privacy
          principles, you have the following rights:
        </p>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              right: "Right of Access",
              desc: "Request a copy of all personal data we hold about you.",
            },
            {
              right: "Right to Rectification",
              desc: "Request correction of inaccurate or incomplete data.",
            },
            {
              right: "Right to Erasure",
              desc: "Request deletion of your personal data ('right to be forgotten').",
            },
            {
              right: "Right to Portability",
              desc: "Receive your data in a structured, machine-readable format.",
            },
            {
              right: "Right to Object",
              desc: "Object to certain types of processing, including direct marketing.",
            },
            {
              right: "Account Deletion",
              desc: "Delete your account directly from Settings → Account at any time.",
            },
          ].map((r) => (
            <div
              key={r.right}
              className="bg-teal-50 rounded-lg px-4 py-3 border border-teal-100"
            >
              <p className="font-semibold text-xs text-teal-800">{r.right}</p>
              <p className="text-xs text-teal-700 mt-1">{r.desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm">
          To exercise any right, email{" "}
          <a href="mailto:support@bambeh.com" className="text-teal-600 hover:underline">
            support@bambeh.com
          </a>
          . We will respond within <strong>30 days</strong>.
        </p>
      </>
    ),
  },
  {
    id: "7",
    title: "7. Cookies and Tracking Technologies",
    body: (
      <>
        <p>
          Bambeh uses the following technologies to improve your experience and
          analyse Platform usage:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>
            <strong>Essential cookies:</strong> Required for authentication and
            security. Cannot be disabled.
          </li>
          <li>
            <strong>Analytics cookies:</strong> Help us understand how users
            navigate the Platform. May be disabled in browser settings.
          </li>
          <li>
            <strong>localStorage / sessionStorage:</strong> Used to store your
            language preference, onboarding state, and draft listings on your
            device.
          </li>
        </ul>
        <p className="mt-3">
          We do <strong>not</strong> use advertising cookies or share tracking
          data with ad networks.
        </p>
      </>
    ),
  },
  {
    id: "8",
    title: "8. Children's Privacy",
    body: (
      <p>
        The Bambeh Platform is intended for users who are{" "}
        <strong>18 years of age or older</strong>. We do not knowingly collect
        personal data from children under 18. If we become aware that a child
        under 18 has provided us with personal data, we will delete that data
        immediately. If you believe a child has registered on our Platform, please
        contact us at{" "}
        <a href="mailto:support@bambeh.com" className="text-teal-600 hover:underline">
          support@bambeh.com
        </a>
        .
      </p>
    ),
  },
  {
    id: "9",
    title: "9. Data Security",
    body: (
      <>
        <p>
          We take the security of your personal data seriously and implement
          industry-standard technical and organisational measures, including:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>HTTPS/TLS encryption for all data in transit</li>
          <li>Encrypted storage for sensitive fields (passwords hashed with bcrypt)</li>
          <li>Row-level security (RLS) policies on our Supabase database</li>
          <li>
            JWT authentication with secure token storage and automatic token
            rotation
          </li>
          <li>
            Regular security reviews and monitoring via our payment server health
            checks
          </li>
          <li>
            Access controls limiting employee access to personal data on a
            need-to-know basis
          </li>
        </ul>
        <p className="mt-3">
          Despite our best efforts, no data transmission over the internet is
          100% secure. In the event of a data breach that affects your rights,
          we will notify you within{" "}
          <strong>72 hours</strong> of becoming aware, as required by applicable
          law.
        </p>
      </>
    ),
  },
  {
    id: "10",
    title: "10. International Data Transfers",
    body: (
      <p>
        Your data may be stored and processed outside Cameroon — including in the
        United States (Supabase, Netlify) and other countries where our service
        providers operate. Where such transfers occur, we ensure appropriate
        safeguards are in place, including data processing agreements that require
        our providers to protect your data to at least the standard required by
        Cameroon's Law No. 2024/017.
      </p>
    ),
  },
  {
    id: "11",
    title: "11. Changes to This Policy",
    body: (
      <>
        <p>
          We may update this Privacy Policy periodically. When we make material
          changes, we will:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Update the "Last updated" date at the top of this page</li>
          <li>Send you a notification via the app or email</li>
        </ul>
        <p className="mt-3">
          Continued use of the Platform after the effective date of any update
          constitutes your acceptance of the revised Policy.
        </p>
      </>
    ),
  },
  {
    id: "12",
    title: "12. Contact and Complaints",
    body: (
      <>
        <p>
          For any questions, data requests, or complaints about this Privacy
          Policy or our data practices:
        </p>
        <div className="mt-3 bg-gray-50 rounded-lg p-4 border border-gray-100 space-y-1 text-sm">
          <p><strong>BAMBEH SARL — Bambeh Marketplace</strong></p>
          <p>Yaoundé, Republic of Cameroon</p>
          <p>
            Email:{" "}
            <a href="mailto:support@bambeh.com" className="text-teal-600 hover:underline">
              support@bambeh.com
            </a>
          </p>
          <p>
            WhatsApp / Support:{" "}
            <a href="mailto:bambetheapp@gmail.com" className="text-teal-600 hover:underline">
              bambetheapp@gmail.com
            </a>
          </p>
          <p>
            Phone:{" "}
            <a href="tel:+237652953607" className="text-teal-600 hover:underline">
              +237 652 953 607
            </a>
          </p>
        </div>
        <p className="mt-3 text-xs text-gray-500">
          If you are unsatisfied with our response, you may lodge a complaint
          with the Cameroonian data protection authority.
        </p>
      </>
    ),
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
const PrivacyPolicy: React.FC = () => {
  const [openSection, setOpenSection] = useState<string | null>("1");

  const toggle = (id: string) =>
    setOpenSection((prev) => (prev === id ? null : id));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-800 text-white py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-teal-100 text-sm">
            Last updated: June 2026 &nbsp;·&nbsp; Effective immediately
          </p>
          <p className="mt-4 text-sm text-teal-100 leading-relaxed max-w-2xl">
            Your privacy matters to us. This policy explains exactly what data
            we collect, why we collect it, who we share it with, and the rights
            you have over your data.
          </p>
        </div>
      </div>

      {/* Quick Nav */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex gap-4 overflow-x-auto text-xs text-teal-700 font-medium">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setOpenSection(s.id);
                document
                  .getElementById(`pp-section-${s.id}`)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="whitespace-nowrap hover:text-teal-900 transition-colors"
            >
              {s.id}. {SECTIONS.find(x => x.id === s.id)?.title.split(". ")[1] ?? ""}
            </button>
          ))}
        </div>
      </div>

      {/* Accordion Sections */}
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-3">
        {SECTIONS.map((section) => {
          const isOpen = openSection === section.id;
          return (
            <div
              id={`pp-section-${section.id}`}
              key={section.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <button
                onClick={() => toggle(section.id)}
                className="w-full flex justify-between items-center px-5 py-4 text-left group focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-inset"
                aria-expanded={isOpen}
              >
                <span className="text-sm font-semibold text-gray-900 group-hover:text-teal-700 transition-colors">
                  {section.title}
                </span>
                <svg
                  className={`w-5 h-5 text-teal-500 transition-transform duration-200 flex-shrink-0 ml-4 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
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

      {/* Footer Links */}
      <div className="max-w-3xl mx-auto px-4 pb-12">
        <div className="bg-teal-50 rounded-xl p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border border-teal-100">
          <div>
            <p className="text-sm font-semibold text-teal-800">
              Also review our Terms of Service
            </p>
            <p className="text-xs text-teal-600 mt-0.5">
              The rules governing your use of the Bambeh Marketplace.
            </p>
          </div>
          <Link
            to="/terms-of-service"
            className="flex-shrink-0 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            Terms of Service →
          </Link>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          © {new Date().getFullYear()} BAMBEH SARL — Bambeh Marketplace. All rights reserved.
          <br />
          Governed by Cameroon Law No. 2024/017 on Personal Data Protection.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
