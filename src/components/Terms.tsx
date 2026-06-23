/**
 * TERMS OF SERVICE PAGE
 * Complete legal terms for Bambeh Marketplace
 */

import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function Terms() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Terms of Service
          </h1>
          <p className="text-gray-600 mb-8">Last Updated: December 5, 2024</p>

          <div className="prose prose-teal max-w-none">
            {/* Introduction */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. Introduction
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Welcome to Bambeh Marketplace ("Bambeh," "we," "us," or "our").
                These Terms of Service ("Terms") govern your access to and use
                of the Bambeh platform, including our website, mobile
                application, and related services (collectively, the
                "Platform").
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                By accessing or using our Platform, you agree to be bound by
                these Terms. If you do not agree to these Terms, please do not
                use our Platform.
              </p>
            </section>

            {/* Account Registration */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. Account Registration
              </h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                2.1 Eligibility
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                To use Bambeh, you must:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>
                  Be at least 18 years of age or have parental/guardian consent
                </li>
                <li>Be legally capable of entering into binding contracts</li>
                <li>
                  Not be prohibited from using the Platform under ian
                  law
                </li>
                <li>Provide accurate and complete registration information</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                2.2 Account Security
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You are responsible for:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>
                  Maintaining the confidentiality of your account credentials
                </li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
                <li>Logging out after each session</li>
              </ul>
            </section>

            {/* Listings and Content */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. Listings and Content
              </h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                3.1 Posting Listings
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                When posting a listing on Bambeh, you agree to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Provide accurate, complete, and up-to-date information</li>
                <li>
                  Only post items, services, jobs, or properties you have the
                  right to offer
                </li>
                <li>
                  Comply with all applicable local, regional, and national laws
                </li>
                <li>Use appropriate categories and keywords</li>
                <li>Upload only authentic, non-misleading images</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                3.2 Prohibited Content
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You may NOT post listings that:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Involve illegal products, services, or activities</li>
                <li>
                  Contain fraudulent, deceptive, or misleading information
                </li>
                <li>Infringe on intellectual property rights</li>
                <li>Include weapons, drugs, or controlled substances</li>
                <li>
                  Contain adult content, hate speech, or discriminatory language
                </li>
                <li>Promote pyramid schemes or multi-level marketing</li>
                <li>Involve stolen goods or counterfeit items</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                3.3 Content Ownership
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You retain ownership of your content. By posting on Bambeh, you
                grant us a non-exclusive, worldwide, royalty-free license to
                use, display, and distribute your content for the purpose of
                operating and promoting the Platform.
              </p>
            </section>

            {/* Subscription Tiers */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. Subscription Tiers
              </h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                4.1 Tier Levels
              </h3>
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-6 mb-4">
                <p className="font-semibold text-gray-800 mb-3">
                  Available Subscription Tiers:
                </p>
                <ul className="space-y-3 text-gray-700">
                  <li>
                    <strong>Free Tier:</strong> Basic listing capabilities with
                    limited visibility
                  </li>
                  <li>
                    <strong>Bronze Tier:</strong> 500 XAF/day - Enhanced
                    visibility and faster publication
                  </li>
                  <li>
                    <strong>Silver Tier:</strong> 2,000 XAF/week - Priority
                    placement and featured listings
                  </li>
                  <li>
                    <strong>Gold Tier:</strong> 5,000 XAF/month - Maximum
                    visibility, instant publication, and premium features
                  </li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                4.2 Payment and Renewal
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Subscriptions are billed according to your selected tier and
                automatically renew unless canceled. You may cancel anytime
                through your account settings. No refunds are provided for
                partial subscription periods.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                4.3 Instant Publication
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Bronze, Silver, and Gold subscribers benefit from instant or
                priority publication of their listings, subject to compliance
                with our content policies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Zerm Coins
              </h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                5.1 Digital Currency
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Zerm Coins are Bambeh's digital currency, pegged at 1 Zerm = 100
                XAF. You can:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>
                  Purchase Zerm Coins to use for transactions on the Platform
                </li>
                <li>Earn Zerm Coins through promotional activities</li>
                <li>
                  Convert Zerm Coins back to XAF (subject to fees and
                  availability)
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                5.2 Usage and Restrictions
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Zerm Coins are non-transferable between users and cannot be used
                outside the Bambeh Platform. We reserve the right to modify the
                Zerm Coin system with advance notice.
              </p>
            </section>

            {/* Payments and Transactions */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. Payments and Transactions
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                All transactions between buyers and sellers are conducted
                directly between the parties. Bambeh facilitates the connection
                but is not responsible for:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>
                  Quality, safety, or legality of items, services, or properties
                </li>
                <li>Accuracy of listings or user representations</li>
                <li>Completion of transactions</li>
                <li>Disputes between buyers and sellers</li>
                <li>Payment processing (handled by third-party providers)</li>
              </ul>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-4">
                <p className="font-semibold text-gray-800 mb-2">
                  ?? Important: Payment Safety
                </p>
                <p className="text-gray-700 leading-relaxed">
                  We recommend using our in-platform messaging and secure
                  payment methods. Never share sensitive financial information
                  directly with other users. Be cautious of requests for upfront
                  payments or wire transfers.
                </p>
              </div>
            </section>

            {/* User Conduct */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. User Conduct
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You agree NOT to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Use the Platform for any illegal purpose</li>
                <li>Harass, threaten, or harm other users</li>
                <li>Post spam, duplicate listings, or misleading content</li>
                <li>Attempt to manipulate search results or ratings</li>
                <li>Create fake accounts or impersonate others</li>
                <li>Interfere with the Platform's operation or security</li>
                <li>Scrape, copy, or download content without permission</li>
                <li>Use automated systems (bots) without authorization</li>
              </ul>
            </section>

            {/* Intellectual Property */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. Intellectual Property
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                The Bambeh Platform, including its design, logo, text, graphics,
                and software, is owned by BAMBEH SARL and protected by
                copyright, trademark, and other intellectual property laws. You
                may not copy, modify, or distribute our content without written
                permission.
              </p>
            </section>

            {/* Privacy */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                9. Privacy
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Your privacy is important to us. Please review our{" "}
                <Link
                  to="/privacy"
      className="text-teal-600 hover:text-teal-700 underline"
                >
                  Privacy Policy
                </Link>{" "}
                to understand how we collect, use, and protect your information.
              </p>
            </section>

            {/* Disclaimers and Limitations */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                10. Disclaimers and Limitations of Liability
              </h2>
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
                <p className="font-semibold text-gray-800 mb-3">
                  IMPORTANT LEGAL NOTICE:
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT
                  WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT
                  WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, SECURE, OR
                  ERROR-FREE.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE
                  FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
                  PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE PLATFORM.
                </p>
              </div>
            </section>

            {/* Termination */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                11. Termination
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may suspend or terminate your account at our discretion if
                you violate these Terms or engage in conduct that we deem
                harmful to the Platform or other users. You may delete your
                account at any time through your account settings.
              </p>
            </section>

            {/* Dispute Resolution */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                12. Dispute Resolution
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Any disputes arising from these Terms shall be resolved through:
              </p>
              <ol className="list-decimal pl-6 mb-4 text-gray-700 space-y-2">
                <li>Good faith negotiation between the parties</li>
                <li>Mediation, if negotiation fails</li>
                <li>Arbitration or legal proceedings in Yaound?, </li>
              </ol>
            </section>

            {/* Governing Law */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                13. Governing Law
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                These Terms are governed by the laws of the Republic of
                . Any legal action related to these Terms must be
                brought in the courts of Yaound?, Centre Region.
              </p>
            </section>

            {/* Changes to Terms */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                14. Changes to Terms
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may update these Terms from time to time. We will notify you
                of significant changes by posting a notice on the Platform or
                sending you an email. Your continued use of the Platform after
                changes take effect constitutes acceptance of the new Terms.
              </p>
            </section>

            {/* Contact */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                15. Contact Information
              </h2>
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you have questions about these Terms, please contact us:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li>
                    <strong>Email:</strong> legal@Bambeh.cm
                  </li>
                  <li>
                    <strong>Phone:</strong> +237 6XX XXX XXX
                  </li>
                  <li>
                    <strong>Address:</strong> BAMBEH SARL, Yaound?, 
                  </li>
                  <li>
                    <strong>Website:</strong> www.Bambeh.cm
                  </li>
                </ul>
              </div>
            </section>

            {/* Acknowledgment */}
            <div className="mt-12 pt-8 border-t border-gray-300">
              <p className="text-gray-700 leading-relaxed">
                By using Bambeh Marketplace, you acknowledge that you have read,
                understood, and agree to be bound by these Terms of Service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}







