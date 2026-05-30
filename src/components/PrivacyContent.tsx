/**
 * PRIVACY POLICY CONTENT COMPONENT
 * Official Bambeh Privacy Policy
 * Used in: Privacy.tsx
 */

import React from "react";

export const PrivacyContent: React.FC = () => {
  return (
    <div className="space-y-6 text-sm text-gray-700">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">
          Bambeh Marketplace App: Global Privacy Policy
        </h1>
        <p className="text-sm text-gray-600">
          <strong>Effective Date:</strong> January 1, 2026
        </p>
      </div>

      {/* Introduction */}
      <section>
        <p className="mb-4">
          Bambeh Marketplace App (<strong>"Bambeh,"</strong>{" "}
          <strong>"we,"</strong> <strong>"us,"</strong> or{" "}
          <strong>"our"</strong>) operates a comprehensive multi-feature digital
          platform, including marketplace, listings, jobs, services, rentals,
          chat, cart, profiles, and virtual currency transactions (e.g., Zerm
          Coins). This Global Privacy Policy details our practices concerning
          the collection, use, sharing, and protection of your Personal Data.
        </p>
        <p>
          By accessing or using the Bambeh App, you acknowledge that you have
          read and understood this Policy and agree to our processing of your
          Personal Data as described herein.
        </p>
      </section>

      {/* 1. Information We Collect */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          1. Information We Collect and Legal Basis
        </h2>
        <p className="mb-4">
          We collect information necessary to provide, maintain, and improve our
          services. Our legal basis for processing your data is primarily{" "}
          <strong>Contractual Necessity</strong>,{" "}
          <strong>Legitimate Interests</strong> (security, operations, service
          improvement), or your <strong>Explicit Consent</strong>.
        </p>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Category of Data
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Specific Data Collected
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Purpose of Collection
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Legal Basis
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2">
                  <strong>Identity & Contact</strong>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  Name, email address, phone number, profile image.
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  Account creation, authentication, direct communication, user
                  verification.
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  Contractual Necessity
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">
                  <strong>Marketplace Content</strong>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  Listing details (images, descriptions, price), chat messages,
                  ratings/reviews.
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  Facilitating transactions, communication between users,
                  displaying content on the platform.
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  Contractual Necessity
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">
                  <strong>Financial & Transaction</strong>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  Payment method details (tokenized), cart history, purchase
                  records (for goods, services, Zerm Coins, subscriptions).
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  Processing payments, managing subscriptions, fraud prevention,
                  financial auditing.
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  Contractual Necessity & Legal Obligation
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">
                  <strong>Location & Usage</strong>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  IP address, device information (OS, unique identifiers), GPS
                  data (with consent), in-app activity, browsing patterns.
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  Service functionality (e.g., proximity listings), security,
                  debugging, service improvement, personalized recommendations.
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  Legitimate Interest & Consent
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">
                  <strong>Onboarding & Preferences</strong>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  Language selection, terms acceptance date, notification
                  settings.
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  Compliance tracking, user experience customization.
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  Legitimate Interest
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-sm italic">
          <strong>Note:</strong> We <strong>do not</strong> collect or process
          sensitive categories of data such as biometrics, health, or political
          opinions.
        </p>
      </section>

      {/* 2. How We Use Your Information */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          2. How We Use Your Information
        </h2>
        <p className="mb-2">
          Your data is used strictly for the purposes outlined below, securing
          the interests of Bambeh, its Founder, and its workers:
        </p>
        <ul className="space-y-2 list-disc list-inside ml-4">
          <li>
            <strong>Service Delivery & Contract Fulfillment:</strong> To manage
            your account, process transactions (including Zerm Coins), enable
            listings, facilitate secure chat, and provide customer support.
          </li>
          <li>
            <strong>Security & Fraud Prevention (Legitimate Interest):</strong>{" "}
            To detect, prevent, and respond to potential fraud, abuse, security
            risks, or technical issues that could harm Bambeh or our users. This
            protects our operational integrity and the team's security.
          </li>
          <li>
            <strong>
              Optimization & Personalization (Legitimate Interest):
            </strong>{" "}
            To analyze usage patterns, test new features, troubleshoot issues,
            and provide personalized content, recommendations, and localized
            services.
          </li>
          <li>
            <strong>Communication:</strong> To send essential service
            announcements, transaction updates, and, with your consent,
            promotional and marketing materials. You retain{" "}
            <strong>opt-out</strong>
            rights for non-essential communications.
          </li>
          <li>
            <strong>Legal & Compliance (Legal Obligation):</strong> To comply
            with applicable laws, legal, processes, governmental requests, and
            enforce our Terms of Service.
          </li>
        </ul>
      </section>

      {/* 3. Sharing and Disclosure */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          3. Sharing and Disclosure of Information
        </h2>
        <p className="mb-2">
          We <strong>do not sell</strong> your Personal Data. We share data only
          in the following limited, circumstances, under strict confidentiality
          agreements:
        </p>
        <ul className="space-y-2 list-disc list-inside ml-4">
          <li>
            <strong>With Other Users:</strong> Information necessary to complete
            a transaction or interaction (e.g., your public profile, listing
            details, and communications via our chat feature) is shared directly
            with other users on the platform.
          </li>
          <li>
            <strong>Third-Party Service Providers:</strong> We use trusted
            partners for essential business functions (e.g., cloud hosting,
            payment processing, data analytics). These providers are
            contractually bound to process data only on our behalf and maintain
            strict confidentiality and security.
          </li>
          <li>
            <strong>Legal and Regulatory Requirements:</strong> We may disclose
            data when legally required such as in response to a court order,
            subpoena, or to cooperate with law enforcement, regulatory,
            investigations, or government agencies, provided such requests are
            properly vetted.
          </li>
          <li>
            <strong>Business Transfers:</strong> In the event of a merger,
            acquisition, or asset sale, your data may be transferred, provided
            the acquiring party agrees to adhere to this Policy or a materially
            similar one, ensuring the continuity of protection for the founder's
            and workers' legal status and liability limitations.
          </li>
        </ul>
      </section>

      {/* 4. Data Security and Retention */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          4. Data Security and Retention
        </h2>

        <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">
          Security Measures
        </h3>
        <p className="mb-2">
          We employ robust technical and organizational measures, including
          encryption (TLS/SSL), access, controls, and regular security audits,
          to protect your Personal Data against unauthorized access, disclosure,
          alteration, or destruction.
        </p>

        <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">
          Data Retention
        </h3>
        <p className="mb-2">
          We retain your data only for as long as necessary to fulfill the
          purposes for which it was, collected, including satisfying any legal,
          accounting, or reporting requirements.
        </p>
        <ul className="space-y-2 list-disc list-inside ml-4">
          <li>
            <strong>Account Data:</strong> Retained while your account is active
            and for a limited period thereafter (e.g., 90 days) to allow for
            account recovery or for our legitimate interest in maintaining
            business records.
          </li>
          <li>
            <strong>Transaction Records:</strong> Retained for a minimum of{" "}
            <strong>seven (7) years</strong>
            to comply with tax and audit laws, protecting Bambeh's financial and
            legal standing.
          </li>
          <li>
            You may request account deletion, but we will retain data necessary
            for mandatory legal holds or to protect Bambeh's legal rights and
            operational security.
          </li>
        </ul>
      </section>

      {/* 5. International Data Transfers */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          5. International Data Transfers
        </h2>
        <p>
          Bambeh operates globally. Your Personal Data may be transferred to and
          processed in countries outside of your country of residence. We
          implement appropriate safeguards for international, transfers, such as
          Standard Contractual Clauses (SCCs), to ensure your data remains
          protected consistent with this Policy and applicable law.
        </p>
      </section>

      {/* 6. Your Rights */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          6. Your Rights and Contact Information
        </h2>
        <p className="mb-2">
          Depending on your jurisdiction (e.g., under GDPR, CCPA), you may have
          the right to:
        </p>
        <ul className="space-y-2 list-disc list-inside ml-4">
          <li>
            <strong>Access</strong> your Personal Data.
          </li>
          <li>
            <strong>Rectify</strong> inaccurate or incomplete data.
          </li>
          <li>
            <strong>Erase</strong> your data (The "Right to be Forgotten"),
            subject to legal limitations.
          </li>
          <li>
            <strong>Restrict</strong> or <strong>Object</strong> to processing.
          </li>
          <li>
            <strong>Data Portability</strong> (receiving your data in a
            structured, commonly used format).
          </li>
          <li>
            <strong>Withdraw Consent</strong> at any time where processing is
            based on consent.
          </li>
        </ul>
        <p className="mt-4">
          You may exercise these rights via your profile settings or by
          contacting our Privacy Officer:
        </p>
        <div className="bg-teal-50 p-4 rounded-lg mt-2">
          <p>
            <strong>Privacy Officer</strong>
          </p>
          <p>Bambeh Marketplace App</p>
          <p>
            <strong>Email:</strong> privacy@Bambeh.app
          </p>
        </div>
      </section>

      {/* 7. Governing Law */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          7. Governing Law and Jurisdiction
        </h2>
        <p>
          To ensure legal clarity and predictability in dispute resolution, this
          Privacy Policy and any disputes arising from it shall be governed by
          and construed in accordance with the laws of the{" "}
          <strong>Republic of </strong>. You agree to the exclusive
          jurisdiction of the courts of <strong></strong> for the
          resolution of any disputes.
        </p>
      </section>

      {/* 8. Policy Updates */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          8. Policy Updates
        </h2>
        <p>
          We reserve the right to modify this Policy periodically to reflect
          changes in our practices or legal obligations. We will notify you of
          any material changes via the App or email.{" "}
          <strong>
            Your continued use of the Bambeh App after the effective date of any
            modification constitutes your acceptance of the updated Policy.
          </strong>
        </p>
      </section>

      {/* Additional Section */}
      <section className="border-t-2 border-gray-300 pt-6 mt-6">
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          Additional Privacy Information
        </h2>

        <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">
          Detailed Data Collection
        </h3>
        <p className="mb-2">
          To operate a marketplace for goods, jobs, housing, and digital assets,
          we must collect specific data.
        </p>

        <h4 className="font-semibold text-gray-800 mt-3 mb-2">
          A. Information You Provide
        </h4>
        <ul className="space-y-2 list-disc list-inside ml-4">
          <li>
            <strong>Identity Data:</strong> Full name, date of birth (to verify
            18+ requirement), and government ID (where verification is required
            for Gold Tier or high-volume transactions).
          </li>
          <li>
            <strong>Contact Data:</strong> Email address, phone number (crucial
            for Mobile Money integration), and physical address (for
            housing/deliveries).
          </li>
          <li>
            <strong>Financial Data:</strong> Mobile Money numbers (MTN/Orange),
            bank account details for, withdrawals, and transaction history.{" "}
            <strong>Note:</strong> We do not store full credit card numbers;
            these are processed by PCI-DSS compliant third parties (e.g.,
            Stripe, PayPal).
          </li>
          <li>
            <strong>Profile Content:</strong> Usernames, profile photos, job
            resumes/CVs, and listing descriptions.
          </li>
        </ul>

        <h4 className="font-semibold text-gray-800 mt-3 mb-2">
          B. Information We Collect Automatically
        </h4>
        <ul className="space-y-2 list-disc list-inside ml-4">
          <li>
            <strong>Device & Technical Data:</strong> IP address, device type,
            operating system, unique device identifiers (IMEI/ADID), and crash
            data. This protects the App from bot attacks.
          </li>
          <li>
            <strong>Usage Data:</strong> Clickstreams, search history, and
            interactions with "Zerm Coins" to monitor for gaming abuse.
          </li>
          <li>
            <strong>Location Data:</strong> Approximate location (IP-based) for
            local marketplace listings. Precise GPS location is only collected
            with your explicit permission.
          </li>
        </ul>

        <h4 className="font-semibold text-gray-800 mt-3 mb-2">
          C. Information from Third Parties
        </h4>
        <ul className="space-y-2 list-disc list-inside ml-4">
          <li>
            <strong>Payment Partners:</strong> We receive transaction
            confirmation statuses (Success/Fail) from MTN, Orange, Flutterwave,
            etc.
          </li>
          <li>
            <strong>Social Logins:</strong> If you sign up via Google or
            Facebook, we collect your public profile data.
          </li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">
          Specific Use Cases
        </h3>
        <ul className="space-y-2 list-disc list-inside ml-4">
          <li>
            <strong>Service Delivery:</strong> To facilitate buying, selling,
            job matching, and housing rentals.
          </li>
          <li>
            <strong>Financial Integrity (Founder's Interest):</strong> To
            process wallet deposits/withdrawals, calculate the Service Fees
            automatically (as per the Terms of Use), and prevent revenue
            leakage.
          </li>
          <li>
            <strong>Safety & Security (Worker/User Interest):</strong> To verify
            identities, screen for sex offenders or criminals in housing/job
            sections, and detect fraud.
          </li>
          <li>
            <strong>Digital Asset Management:</strong> To track the issuance and
            redemption of "Zerm Coins" and ensure they are not used for money
            laundering.
          </li>
          <li>
            <strong>Business Intelligence:</strong> We use <em>anonymized</em>{" "}
            and <em>aggregated</em> data to analyze market trends. This
            aggregated data is the sole property of Bambeh and increases the
            valuation of the company.
          </li>
        </ul>
      </section>

      {/* Contact Information */}
      <section className="bg-teal-50 p-4 rounded-lg mt-6">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Contact Us</h2>
        <p>For privacy concerns, data deletion requests, or legal inquiries:</p>
        <div className="mt-2">
          <p>
            <strong>Data Protection Officer</strong>
          </p>
          <p>
            <strong>Bambeh Legal Team</strong>
          </p>
          <p>
            <strong>Location:</strong> Yaound?, Centre Region, 
          </p>
          <p>
            <strong>Phone:</strong> +237 670 757 326
          </p>
          <p>
            <strong>Email:</strong> Bambehtheapp@gmail.com
          </p>
        </div>
      </section>
    </div>
  );

}
export default PrivacyContent;

