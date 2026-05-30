/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PRIVACY POLICY — BAMBEH MARKETPLACE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * LEGAL COVERAGE:
 * ✅  Law No. 2024/017 of 23 December 2024 (Personal Data Protection)
 * ✅ OHADA Uniform Acts (electronic commerce provisions)
 * ✅ Google Play Developer Policy (data collection disclosure)
 * ✅ GDPR-aligned (extraterritorial users)
 * ✅ Account deletion policy (Play Store requirement since Dec 2023)
 * ✅ Third-party SDKs disclosed (Supabase, FCM, NotchPay)
 * ✅ Hosted at active URL: bambeh.cm/privacy-policy
 *
 * FILE: src/pages/PrivacyPolicy.tsx
 * © 2026 BAMBEH SARL — RC/YAO/2020/A/1026
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState } from "react";
import {
  Shield,
  Database,
  Share2,
  Lock,
  UserCheck,
  Trash2,
  Globe,
  Mail,
  ChevronDown,
  ChevronUp,
  Eye,
  Smartphone,
  CreditCard,
  MapPin,
  Bell,
  Camera,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface SectionProps {
  id: string;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

// ── Collapsible Section Component ─────────────────────────────────────────────
function PolicySection({ id, icon, title, children, defaultOpen = false }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div id={id} className="border border-gray-200 rounded-2xl overflow-hidden mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 bg-white hover:bg-teal-50 transition-colors text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center text-teal-700 flex-shrink-0">
            {icon}
          </div>
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
        </div>
        {open ? (
          <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
        )}
      </button>

      {open && (
        <div className="px-6 pb-6 pt-2 bg-white border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Data Table Component ───────────────────────────────────────────────────────
interface DataRow {
  category: string;
  examples: string;
  purpose: string;
  legal: string;
}

function DataTable({ rows }: { rows: DataRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 mt-3">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-teal-600 text-white">
            <th className="text-left px-4 py-3 font-semibold">Data Category</th>
            <th className="text-left px-4 py-3 font-semibold">Examples</th>
            <th className="text-left px-4 py-3 font-semibold">Purpose</th>
            <th className="text-left px-4 py-3 font-semibold">Legal Basis</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="px-4 py-3 font-medium text-gray-900">{row.category}</td>
              <td className="px-4 py-3 text-gray-600">{row.examples}</td>
              <td className="px-4 py-3 text-gray-600">{row.purpose}</td>
              <td className="px-4 py-3">
                <span className="inline-block bg-teal-100 text-teal-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {row.legal}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Main Privacy Policy Page ───────────────────────────────────────────────────
export default function PrivacyPolicy() {
  const EFFECTIVE_DATE = "1 January 2026";
  const LAST_UPDATED = "1 April 2026";
  const CONTACT_EMAIL = "support@bambeh.com";
  const COMPANY_NAME = "BAMBEH SARL";
  const COMPANY_REG = "CM-NSI-02-2026-B13-00179";
  const COMPANY_ADDRESS = "Yaoundé, Centre Region, Republic of Cameroon";

  const dataCollected: DataRow[] = [
    {
      category: "Identity",
      examples: "Full name, profile photo, date of birth",
      purpose: "Account creation and identity verification",
      legal: "Consent",
    },
    {
      category: "Contact",
      examples: "Email address, phone number",
      purpose: "Account login, OTP, notifications",
      legal: "Consent",
    },
    {
      category: "Device",
      examples: "Device model, OS version, device ID, IP address",
      purpose: "Security, fraud prevention, app functionality",
      legal: "Legitimate interest",
    },
    {
      category: "Location",
      examples: "Approximate city/region (coarse GPS)",
      purpose: "Nearby listings, Meet Safely, FarmFresh delivery zones",
      legal: "Consent (opt-in)",
    },
    {
      category: "Financial",
      examples: "MTN/Orange mobile money number (masked), NotchPay transaction IDs",
      purpose: "Processing subscription and marketplace payments",
      legal: "Contract",
    },
    {
      category: "Usage",
      examples: "Pages visited, listings viewed, search queries, session duration",
      purpose: "App improvement, personalisation, analytics",
      legal: "Consent",
    },
    {
      category: "Listings",
      examples: "Photos, descriptions, prices you post",
      purpose: "Display on marketplace to other users",
      legal: "Contract",
    },
    {
      category: "Communications",
      examples: "Chat messages between buyers and sellers",
      purpose: "Marketplace transaction facilitation",
      legal: "Contract",
    },
    {
      category: "Camera / Media",
      examples: "Photos captured via app for listing images",
      purpose: "Listing image upload only",
      legal: "Consent (on-demand)",
    },
  ];

  const thirdParties = [
    {
      name: "Supabase (PostgreSQL + Auth)",
      purpose: "Database, authentication, and secure data storage",
      location: "EU (Frankfurt)",
      policy: "https://supabase.com/privacy",
    },
    {
      name: "NotchPay",
      purpose: "Mobile money payment processing (MTN, Orange)",
      location: "Cameroon",
      policy: "https://notchpay.co/privacy",
    },
    {
      name: "Google Firebase Cloud Messaging (FCM)",
      purpose: "Push notifications",
      location: "USA (Google infrastructure)",
      policy: "https://firebase.google.com/support/privacy",
    },
    {
      name: "Google Play Store",
      purpose: "App distribution and crash reporting",
      location: "USA",
      policy: "https://policies.google.com/privacy",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      {/* ── Hero Header ──────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-600 text-white px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
              <p className="text-teal-200 text-sm mt-0.5">Bambeh Marketplace — {COMPANY_NAME}</p>
            </div>
          </div>
          <p className="text-teal-100 text-sm leading-relaxed max-w-2xl">
            We are committed to protecting your personal data. This policy explains exactly
            what data we collect, how we use it, who we share it with, and what rights you
            have — in full compliance with Cameroon's Law No. 2024/017.
          </p>
          <div className="flex flex-wrap gap-4 mt-6 text-sm">
            <span className="bg-white/20 rounded-lg px-3 py-1.5 font-medium">
              Effective: {EFFECTIVE_DATE}
            </span>
            <span className="bg-white/20 rounded-lg px-3 py-1.5 font-medium">
              Last Updated: {LAST_UPDATED}
            </span>
            <span className="bg-white/20 rounded-lg px-3 py-1.5 font-medium">
              {COMPANY_REG}
            </span>
          </div>
        </div>
      </div>

      {/* ── Quick Summary Cards ────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 -mt-6 mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: <Database className="w-5 h-5" />, label: "We collect", value: "9 data types" },
            { icon: <Share2 className="w-5 h-5" />, label: "We share with", value: "4 third parties" },
            { icon: <Lock className="w-5 h-5" />, label: "We never", value: "Sell your data" },
            { icon: <Trash2 className="w-5 h-5" />, label: "You can", value: "Delete anytime" },
          ].map((card, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-md p-4 text-center border border-gray-100">
              <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center text-teal-700 mx-auto mb-2">
                {card.icon}
              </div>
              <p className="text-xs text-gray-500">{card.label}</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">{card.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Policy Content ────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 pb-16 space-y-2">

        {/* ── 1. Who We Are ─────────────────────────────────────────────────── */}
        <PolicySection
          id="who-we-are"
          icon={<Globe className="w-5 h-5" />}
          title="1. Who We Are (Data Controller)"
          defaultOpen
        >
          <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
            <p>
              This Privacy Policy applies to the <strong>Bambeh Marketplace</strong> mobile
              application and website, operated by:
            </p>
            <div className="bg-teal-50 rounded-xl p-4 space-y-1">
              <p><strong>Company:</strong> BAMBEH SARL </p>
              <p><strong>Registration:</strong> CM-NSI-02-2026-B13-00179</p>
              <p><strong>Address:</strong> YAOUNDE CAMEROON</p>
              <p><strong>Privacy Contact:</strong>{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-teal-600 underline font-medium">
                  {CONTACT_EMAIL}
                </a>
              </p>
            </div>
            <p>
              BAMBEH SARL is the <strong>Data Controller</strong> as defined under
              Cameroon's Law No. 2024/017 of 23 December 2024 on Personal Data Protection.
              We determine the purposes and means of processing your personal data.
            </p>
            <p>
              This policy covers all users of Bambeh, including users located in or
              transiting through Cameroon, consistent with the extraterritorial scope of
              Law No. 2024/017 (Article 3).
            </p>
          </div>
        </PolicySection>

        {/* ── 2. Data We Collect ────────────────────────────────────────────── */}
        <PolicySection
          id="data-collected"
          icon={<Database className="w-5 h-5" />}
          title="2. Personal Data We Collect"
        >
          <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
            <p>
              We collect only the data that is necessary to operate Bambeh and
              provide you with a safe marketplace experience. The table below
              lists every category of data we collect, with its purpose and
              legal basis under  Law No. 2024/017.
            </p>
            <DataTable rows={dataCollected} />
            <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-4 mt-4">
              <p className="font-semibold text-amber-900 text-sm">We do NOT collect:</p>
              <ul className="mt-2 space-y-1 text-amber-800 text-xs">
                <li>✗ Sensitive data (religion, ethnicity, health, politics, biometrics)</li>
                <li>✗ Children's data (Bambeh is 18+ only)</li>
                <li>✗ Full card numbers (payments handled by NotchPay)</li>
                <li>✗ Contacts, SMS messages, or call logs</li>
                <li>✗ Microphone or audio recordings</li>
              </ul>
            </div>
          </div>
        </PolicySection>

        {/* ── 3. Permissions ────────────────────────────────────────────────── */}
        <PolicySection
          id="permissions"
          icon={<Smartphone className="w-5 h-5" />}
          title="3. Android Device Permissions"
        >
          <div className="space-y-3 text-sm text-gray-700">
            <p>The Bambeh app requests the following Android device permissions:</p>
            <div className="grid gap-3 mt-3">
              {[
                {
                  icon: <Globe className="w-4 h-4" />,
                  perm: "INTERNET & NETWORK STATE",
                  reason: "Required to connect to Supabase, NotchPay, and load listings.",
                  opt: false,
                },
                {
                  icon: <Camera className="w-4 h-4" />,
                  perm: "CAMERA",
                  reason: "Used only when you take a photo for a listing. Never accessed in the background.",
                  opt: true,
                },
                {
                  icon: <Eye className="w-4 h-4" />,
                  perm: "READ_MEDIA_IMAGES (Android 13+)",
                  reason: "Allows you to select photos from your gallery for listing images.",
                  opt: true,
                },
                {
                  icon: <Bell className="w-4 h-4" />,
                  perm: "POST_NOTIFICATIONS",
                  reason: "Sends you alerts for messages, orders, and deals (Android 13+).",
                  opt: true,
                },
                {
                  icon: <MapPin className="w-4 h-4" />,
                  perm: "ACCESS_COARSE_LOCATION",
                  reason: "Shows nearby listings (FarmFresh, Meet Safely zones). Never tracks you in the background.",
                  opt: true,
                },
                {
                  icon: <CreditCard className="w-4 h-4" />,
                  perm: "VIBRATE",
                  reason: "Haptic feedback when you receive a notification. No data collected.",
                  opt: false,
                },
              ].map((p, i) => (
                <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
                  <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center text-teal-700 flex-shrink-0 mt-0.5">
                    {p.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-gray-900">{p.perm}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.opt ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-600"}`}>
                        {p.opt ? "Opt-in" : "Required"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{p.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PolicySection>

        {/* ── 4. How We Use Your Data ───────────────────────────────────────── */}
        <PolicySection
          id="how-we-use"
          icon={<Eye className="w-5 h-5" />}
          title="4. How We Use Your Data"
        >
          <div className="space-y-2 text-sm text-gray-700">
            <p className="mb-3">We use your personal data <strong>only</strong> for the following purposes:</p>
            {[
              ["Account management", "Creating, securing, and maintaining your Bambeh account"],
              ["Marketplace operation", "Displaying your listings, facilitating buyer-seller contact, and processing orders"],
              ["Payments", "Processing subscription payments and marketplace transaction fees via NotchPay"],
              ["Push notifications", "Alerting you to messages, orders, deal alerts, and app updates"],
              ["Security & fraud prevention", "Detecting suspicious activity, protecting accounts, and enforcing our Terms"],
              ["Customer support", "Responding to your inquiries and resolving disputes"],
              ["Analytics", "Understanding how features are used so we can improve the app"],
              ["Legal compliance", "Meeting obligations under Cameroonian law, OHADA acts, and court orders"],
            ].map(([title, desc], i) => (
              <div key={i} className="flex gap-3 py-2 border-b border-gray-100 last:border-0">
                <div className="w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">{i + 1}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-900">{title}: </span>
                  <span className="text-gray-600">{desc}</span>
                </div>
              </div>
            ))}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
              <p className="font-bold text-red-900 text-sm">
                🚫 We NEVER use your data for:
              </p>
              <ul className="mt-2 space-y-1 text-red-800 text-xs">
                <li>✗ Selling to advertisers or data brokers</li>
                <li>✗ Profiling based on religion, ethnicity, or political opinion</li>
                <li>✗ Automated decisions with legal effect without human review</li>
                <li>✗ Any purpose not listed in this policy without your prior consent</li>
              </ul>
            </div>
          </div>
        </PolicySection>

        {/* ── 5. Third-Party Sharing ────────────────────────────────────────── */}
        <PolicySection
          id="third-parties"
          icon={<Share2 className="w-5 h-5" />}
          title="5. Third-Party Services & Data Sharing"
        >
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              We share your data <strong>only with the following service providers</strong>,
              and only to the extent necessary for app functionality. We do not sell your
              data to any third party.
            </p>
            <div className="space-y-3 mt-3">
              {thirdParties.map((tp, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <p className="font-bold text-gray-900 text-sm">{tp.name}</p>
                    <span className="text-xs bg-blue-100 text-blue-700 font-medium px-2 py-0.5 rounded-full">
                      {tp.location}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{tp.purpose}</p>
                  <a
                    href={tp.policy}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-teal-600 underline mt-1 inline-block"
                  >
                    View Privacy Policy →
                  </a>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              We may also disclose data to Cameroonian authorities when legally required
              under a valid court order or applicable law, after verifying the legal basis.
              We will notify you where permitted by law.
            </p>
          </div>
        </PolicySection>

        {/* ── 6. Data Retention ─────────────────────────────────────────────── */}
        <PolicySection
          id="retention"
          icon={<Lock className="w-5 h-5" />}
          title="6. Data Retention"
        >
          <div className="text-sm text-gray-700 space-y-3">
            <p>We retain your data only as long as necessary:</p>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-teal-600 text-white">
                    <th className="text-left px-4 py-3 font-semibold">Data Type</th>
                    <th className="text-left px-4 py-3 font-semibold">Retention Period</th>
                    <th className="text-left px-4 py-3 font-semibold">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Account data", "Until you delete your account", "Service operation"],
                    ["Transaction records", "7 years after transaction", "Cameroonian tax/accounting law"],
                    ["Chat messages", "90 days after conversation ends", "Dispute resolution"],
                    ["Usage analytics", "12 months (anonymised)", "App improvement"],
                    ["Security/fraud logs", "24 months", "Security investigation"],
                    ["Deleted account data", "30 days post-deletion, then purged", "Accidental deletion recovery"],
                  ].map(([type, period, reason], i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-3 font-medium text-gray-900">{type}</td>
                      <td className="px-4 py-3 text-gray-600">{period}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </PolicySection>

        {/* ── 7. Your Rights ───────────────────────────────────────────────── */}
        <PolicySection
          id="your-rights"
          icon={<UserCheck className="w-5 h-5" />}
          title="7. Your Rights Under Law No. 2024/017"
        >
          <div className="text-sm text-gray-700 space-y-3">
            <p>
              Under Cameroon's Personal Data Protection Act (Law No. 2024/017,
              enacted 23 December 2024), you have the following rights:
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              {[
                {
                  right: "Right to be Informed",
                  desc: "Know what data we collect and how we use it — this policy fulfils that obligation.",
                  icon: "📋",
                },
                {
                  right: "Right of Access",
                  desc: "Request a copy of all personal data we hold about you.",
                  icon: "👁️",
                },
                {
                  right: "Right to Rectification",
                  desc: "Correct inaccurate or incomplete data in your account settings.",
                  icon: "✏️",
                },
                {
                  right: "Right to Erasure",
                  desc: "Request deletion of your account and all associated data.",
                  icon: "🗑️",
                },
                {
                  right: "Right to Data Portability",
                  desc: "Receive your data in a structured, machine-readable format.",
                  icon: "📦",
                },
                {
                  right: "Right to Withdraw Consent",
                  desc: "Withdraw your data processing consent at any time without penalty.",
                  icon: "🚪",
                },
                {
                  right: "Right to Object",
                  desc: "Object to processing based on legitimate interest.",
                  icon: "✋",
                },
                {
                  right: "Right to Lodge a Complaint",
                  desc: "File a complaint with Cameroon's Personal Data Protection Authority once operational.",
                  icon: "⚖️",
                },
              ].map((r, i) => (
                <div key={i} className="bg-teal-50 rounded-xl p-4 border border-teal-100">
                  <p className="font-bold text-gray-900 text-sm">
                    {r.icon} {r.right}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{r.desc}</p>
                </div>
              ))}
            </div>
            <div className="bg-teal-600 text-white rounded-xl p-4 mt-4">
              <p className="font-bold text-sm">To exercise any of these rights:</p>
              <p className="text-teal-100 text-sm mt-1">
                Email us at{" "}
                <a href="mailto:support@bambeh.com" className="underline font-semibold">
                  support@bambeh.com
                </a>{" "}
                with your request. We will respond within <strong>30 days</strong>.
                We may need to verify your identity before processing the request.
              </p>
            </div>
          </div>
        </PolicySection>

        {/* ── 8. Account Deletion ───────────────────────────────────────────── */}
        <PolicySection
          id="account-deletion"
          icon={<Trash2 className="w-5 h-5" />}
          title="8. Account Deletion"
        >
          <div className="text-sm text-gray-700 space-y-3">
            <p>
              You have the right to delete your Bambeh account at any time.
              This meets Google Play's Account Deletion Policy (mandatory since December 2023).
            </p>
            <div className="bg-blue-50 rounded-xl p-4 space-y-3">
              <p className="font-semibold text-gray-900">How to delete your account:</p>
              <ol className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                  <span>Open Bambeh → go to <strong>Profile → Settings → Account</strong></span>
                </li>
                <li className="flex gap-2">
                  <span className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                  <span>Tap <strong>"Delete Account"</strong> and confirm with your password</span>
                </li>
                <li className="flex gap-2">
                  <span className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                  <span>Your account enters a <strong>30-day recovery window</strong>, after which all data is permanently purged</span>
                </li>
              </ol>
              <p className="text-xs text-gray-500">
                Alternatively, email{" "}
                <a href="mailto:support@bambeh.com" className="text-teal-600 underline font-medium">
                  support@bambeh.com
                </a>{" "}
                with subject "Account Deletion Request".
              </p>
            </div>
            <p className="text-xs text-gray-500">
              Note: Transaction records required by Cameroonian accounting law (7-year
              retention) and active dispute records may be retained even after account
              deletion. You will be informed of any such retention.
            </p>
          </div>
        </PolicySection>

        {/* ── 9. Data Security ─────────────────────────────────────────────── */}
        <PolicySection
          id="security"
          icon={<Lock className="w-5 h-5" />}
          title="9. Data Security"
        >
          <div className="text-sm text-gray-700 space-y-3">
            <p>We implement the following technical and organisational security measures:</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                ["TLS 1.3 encryption", "All data in transit is encrypted"],
                ["Row-Level Security (RLS)", "Supabase database — every table enforces RLS"],
                ["JWT authentication", "Short-lived tokens via Supabase Auth"],
                ["OTP verification", "Phone number verified via SMS on registration"],
                ["No plaintext passwords", "Passwords hashed with bcrypt by Supabase Auth"],
                ["Principle of least privilege", "Each API key has minimum required permissions"],
                ["Server-side auth gates", "All protected routes verified on Supabase, not localStorage"],
                ["FCM token rotation", "Push tokens refreshed on each app launch"],
              ].map(([title, desc], i) => (
                <div key={i} className="flex gap-2 bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <span className="text-teal-600 font-bold text-lg leading-none mt-0.5">✓</span>
                  <div>
                    <p className="font-semibold text-gray-900 text-xs">{title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Despite these measures, no internet transmission is 100% secure. In the event
              of a data breach affecting your rights, we will notify you and the relevant
              authorities as required by Law No. 2024/017.
            </p>
          </div>
        </PolicySection>

        {/* ── 10. Cross-Border Transfers ────────────────────────────────────── */}
        <PolicySection
          id="transfers"
          icon={<Globe className="w-5 h-5" />}
          title="10. International Data Transfers"
        >
          <div className="text-sm text-gray-700 space-y-3">
            <p>
              Some of your data is processed outside Cameroon (see Section 5 for
              third-party locations). Under Law No. 2024/017, cross-border transfers
              require appropriate safeguards.
            </p>
            <p>
              <strong>Supabase (EU/Frankfurt):</strong> Data is processed in the European
              Union, which maintains adequate data protection standards comparable to
              Law No. 2024/017 through GDPR.
            </p>
            <p>
              <strong>Google Firebase (USA):</strong> Google participates in international
              data transfer frameworks. See Google's privacy policy for details.
            </p>
            <p>
              We do not transfer your data to countries with inadequate data protection
              without first implementing appropriate contractual safeguards.
            </p>
          </div>
        </PolicySection>

        {/* ── 11. Children's Privacy ────────────────────────────────────────── */}
        <PolicySection
          id="children"
          icon={<Shield className="w-5 h-5" />}
          title="11. Children's Privacy"
        >
          <div className="text-sm text-gray-700 space-y-3">
            <p>
              Bambeh is intended for users aged <strong>18 and above</strong>. We do not
              knowingly collect personal data from anyone under 18 years of age.
            </p>
            <p>
              If you believe a child has created an account, please contact us immediately
              at <a href="mailto:support@bambeh.com" className="text-teal-600 underline">legal@bambeh.cm</a>.
              We will delete the account and all associated data promptly.
            </p>
            <p>
              Age is verified at registration through our Terms of Service acceptance process
              which includes a declaration of being 18 or older.
            </p>
          </div>
        </PolicySection>

        {/* ── 12. Cookies & Local Storage ──────────────────────────────────── */}
        <PolicySection
          id="cookies"
          icon={<Database className="w-5 h-5" />}
          title="12. Local Storage & App Data"
        >
          <div className="text-sm text-gray-700 space-y-3">
            <p>
              The Bambeh app does not use browser cookies. Instead, it uses
              device-local storage for the following purposes:
            </p>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="text-left px-3 py-2 font-semibold">Key</th>
                    <th className="text-left px-3 py-2 font-semibold">Stored Data</th>
                    <th className="text-left px-3 py-2 font-semibold">Purpose</th>
                    <th className="text-left px-3 py-2 font-semibold">Expires</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Bambeh_language", "Language preference (en/fr)", "Display language", "Until changed"],
                    ["Bambeh_terms_accepted", "Boolean + timestamp", "Onboarding flow", "Permanent (device)"],
                    ["Bambeh_ohada_consent_date", "ISO timestamp", "Legal consent audit trail", "Permanent (device)"],
                    ["supabase.auth.token", "Encrypted JWT session", "Stay logged in", "JWT expiry (~1 hour)"],
                  ].map(([key, data, purpose, exp], i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-3 py-2 font-mono text-teal-700">{key}</td>
                      <td className="px-3 py-2 text-gray-600">{data}</td>
                      <td className="px-3 py-2 text-gray-600">{purpose}</td>
                      <td className="px-3 py-2 text-gray-500">{exp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </PolicySection>

        {/* ── 13. Policy Updates ───────────────────────────────────────────── */}
        <PolicySection
          id="updates"
          icon={<Bell className="w-5 h-5" />}
          title="13. Updates to This Policy"
        >
          <div className="text-sm text-gray-700 space-y-3">
            <p>
              We may update this Privacy Policy to reflect changes in our practices,
              technology, or legal requirements. When we make material changes, we will:
            </p>
            <ul className="space-y-2">
              <li className="flex gap-2">
                <span className="text-teal-600 font-bold">→</span>
                <span>Display a prominent notice in the Bambeh app</span>
              </li>
              <li className="flex gap-2">
                <span className="text-teal-600 font-bold">→</span>
                <span>Send you a push notification (if notifications are enabled)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-teal-600 font-bold">→</span>
                <span>Update the "Last Updated" date at the top of this page</span>
              </li>
            </ul>
            <p>
              Continued use of Bambeh after a policy update constitutes acceptance of
              the revised terms. For material changes involving new data processing purposes,
              we will seek fresh consent as required by Law No. 2024/017.
            </p>
          </div>
        </PolicySection>

        {/* ── 14. Contact ──────────────────────────────────────────────────── */}
        <PolicySection
          id="contact"
          icon={<Mail className="w-5 h-5" />}
          title="14. Contact Us"
          defaultOpen
        >
          <div className="text-sm text-gray-700 space-y-3">
            <p>
              For any questions, concerns, or requests regarding this Privacy Policy
              or your personal data:
            </p>
            <div className="bg-teal-50 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-teal-600" />
                <div>
                  <p className="text-xs text-gray-500">Privacy & Legal</p>
                  <a href="mailto:support@bambeh.com" className="font-bold text-teal-700 text-sm underline">
                    support@bambeh.com
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-teal-600" />
                <div>
                  <p className="text-xs text-gray-500">Data Protection Officer</p>
                  <a href="mailto:support@bambeh.com" className="font-bold text-teal-700 text-sm underline">
                    support@bambeh.com
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-teal-600" />
                <div>
                  <p className="text-xs text-gray-500">Registered Address</p>
                  <p className="font-bold text-gray-900 text-sm">{COMPANY_NAME}</p>
                  <p className="text-xs text-gray-600">{COMPANY_ADDRESS}</p>
                  <p className="text-xs text-gray-500">Reg: {COMPANY_REG}</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              We aim to respond to all privacy requests within <strong>30 days</strong>.
              If you are not satisfied with our response, you have the right to lodge a
              complaint with Cameroon's Personal Data Protection Authority once it becomes
              operational (Law No. 2024/017, Article 12).
            </p>
          </div>
        </PolicySection>

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <div className="text-center pt-6 pb-2">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-teal-600 rounded-full mb-3">
            <span className="text-2xl font-extrabold text-white">B</span>
          </div>
          <p className="text-sm font-bold text-gray-900">Bambeh Marketplace</p>
          <p className="text-xs text-gray-500 mt-1">
            © 2026 {COMPANY_NAME} — {COMPANY_REG}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Compliant with Law No. 2024/017 · OHADA Uniform Acts · Google Play Policy
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Effective: {EFFECTIVE_DATE} · Last Updated: {LAST_UPDATED}
          </p>
        </div>
      </div>
    </div>
  );
}

