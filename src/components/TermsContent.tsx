/**
 * TERMS CONTENT COMPONENT
 * Official Bambeh Terms and Conditions
 * Used in: TermsAcceptance.tsx and Terms.tsx
 */

import React from "react";

export const TermsContent: React.FC = () => {
  return (
    <div className="space-y-6 text-sm text-gray-700">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">
          Bambeh TERMS AND CONDITIONS OF USE
        </h1>
        <p className="text-sm text-gray-600">
          <strong>Effective Date:</strong> November 21, 2025 |{" "}
          <strong>Version:</strong> 1.0
        </p>
      </div>

      {/* Preamble */}
      <section className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
        <h2 className="text-lg font-bold text-gray-900 mb-2">
          PREAMBLE: THE BINDING CONTRACT
        </h2>
        <p className="mb-2">
          By creating an account, accessing, downloading, or using the Bambeh
          mobile application ("App"), you ("The User") enter into a legally
          binding contract with Bambeh ("The Company," "We," "Us," or "Our").
        </p>
        <p className="font-bold text-red-600">
          IF YOU DO NOT AGREE TO THESE TERMS, YOU MUST IMMEDIATELY DELETE THE
          APP AND CEASE ALL USE.
        </p>
        <p className="mt-2">
          These Terms affect your legal rights, including your right to file a
          lawsuit in court. Please read them carefully.
        </p>
      </section>

      {/* 1. Definitions */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          1. DEFINITIONS AND INTERPRETATION
        </h2>
        <ul className="space-y-2 list-disc list-inside">
          <li>
            <strong>"The Founder"</strong> refers to the creator and ultimate
            beneficial owner of Bambeh, who retains exclusive veto power over
            specific platform mechanics as detailed herein.
          </li>
          <li>
            <strong>"Wallet"</strong> refers to the in-app digital ledger
            showing user funds. It is not a bank account.
          </li>
          <li>
            <strong>"Zerm Coins"</strong> refers to the internal gamified points
            system, which holds no sovereign monetary value.
          </li>
          <li>
            <strong>"Services"</strong> refers to the marketplace, job posting,
            housing listings, and financial facilitation provided by the App.
          </li>
        </ul>
      </section>

      {/* 2. Referral Policy */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          2. THE RESTRICTIVE REFERRAL & REMUNERATION POLICY
        </h2>

        <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">
          2.1 The "First Two" Rule
        </h3>
        <p className="mb-2">
          Bambeh rewards User growth strictly under the following limitation:
        </p>
        <ul className="space-y-2 list-disc list-inside ml-4">
          <li>
            <strong>Referral Bonus:</strong> A financial bonus for inviting new
            users is payable
            <strong>
              {" "}
              ONLY for the first two (2) successful referrals
            </strong>{" "}
            made by a User.
          </li>
          <li>
            <strong>Cessation of Obligation:</strong> Upon the completion of the
            second referral, Bambeh's contractual obligation to pay any referral
            commission ceases immediately and permanently.
          </li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">
          2.2 Ex Gratia Discretion (The Founder's Right)
        </h3>
        <p className="mb-2">
          Any remuneration, gift, bonus, or payment made to a User for referrals
          beyond the first two is classified as <em>Ex Gratia</em> (a voluntary
          gift) and is <strong>not a contractual right</strong>.
        </p>
        <ul className="space-y-2 list-disc list-inside ml-4">
          <li>
            <strong>Exclusive Discretion:</strong> The Founder of Bambeh
            reserves the exclusive, non-negotiable right to grant, withhold,
            cancel, or modify any additional rewards.
          </li>
          <li>
            <strong>No Claim:</strong> Users explicitly waive the right to
            claim, sue for, or demand payment for any referrals beyond the
            initial two.
          </li>
        </ul>
      </section>

      {/* 3. Financial Transactions */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          3. FINANCIAL TRANSACTIONS, FEES, AND WALLETS
        </h2>

        <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">
          3.1 The In-App Wallet
        </h3>
        <ul className="space-y-2 list-disc list-inside ml-4">
          <li>
            <strong>Custody:</strong> Funds displayed in your Bambeh Wallet are
            held in pooled accounts. You acknowledge that Bambeh is not a bank
            and your Wallet does not accrue interest.
          </li>
          <li>
            <strong>Deposits:</strong> Adding funds is free. You warrant that
            the source of funds is legal and not derived from criminal activity
            (AML/KYC Compliance).
          </li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">
          3.2 Withdrawal Fees and Automatic Deductions
        </h3>
        <p className="mb-2">
          You agree that Bambeh has the irrevocable right to deduct service fees
          automatically at the point of withdrawal or transfer.
        </p>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="font-semibold mb-2">Fee Structure:</p>
          <ul className="space-y-1 ml-4">
            <li>
              ? Transactions = $9.00 USD: <strong>0.009%</strong>
            </li>
            <li>
              ? Transactions &gt; $9.00 up to $87.00 USD: <strong>0.01%</strong>
            </li>
            <li>
              ? Transactions &gt; $87.00 up to $870.00 USD:{" "}
              <strong>0.05%</strong>
            </li>
            <li>
              ? Transactions &gt; $870.00 up to $3,479.00 USD:{" "}
              <strong>0.09%</strong>
            </li>
            <li>
              ? Transactions &gt; $3,479.00 USD: <strong>0.10%</strong>
            </li>
          </ul>
        </div>

        <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">
          3.3 Zerm Coins (The "No Value" Clause)
        </h3>
        <ul className="space-y-2 list-disc list-inside ml-4">
          <li>
            <strong>Nature:</strong> Zerm Coins are purely for entertainment.
            They constitute a limited, revocable license to use a feature of the
            App.
          </li>
          <li>
            <strong>Prohibition:</strong> Users are strictly prohibited from
            selling Zerm Coins for cash outside the App. Bambeh assumes no
            liability for losses incurred in such black-market transactions.
          </li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">
          3.4 Subscription Non-Refundability
        </h3>
        <ul className="space-y-2 list-disc list-inside ml-4">
          <li>
            <strong>Recurring Billing:</strong> Subscriptions (Bronze, Silver,
            Gold) renew automatically.
          </li>
          <li>
            <strong>No Refunds:</strong> Payments for subscriptions are
            non-refundable, even if the account is suspended or terminated for a
            violation of these Terms.
          </li>
        </ul>
      </section>

      {/* 4. User Conduct */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          4. USER CONDUCT, PROHIBITED ACTS, AND CONSEQUENCES
        </h2>

        <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">
          4.1 Strict Liability
        </h3>
        <p className="mb-2">
          You are strictly liable for all activity occurring under your account.
        </p>

        <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">
          4.2 Prohibited Acts
        </h3>
        <p className="mb-2">You agree NOT to:</p>
        <ol className="space-y-2 list-decimal list-inside ml-4">
          <li>
            <strong>Circumvent Fees:</strong> Attempting to take transactions
            "off-platform" to avoid Bambeh fees.
          </li>
          <li>
            <strong>Scraping:</strong> Using bots to harvest user data.
          </li>
          <li>
            <strong>Harassment:</strong> Abusing other users or Bambeh support
            staff.
          </li>
          <li>
            <strong>Money Laundering:</strong> Using the wallet to layer or
            integrate illicit funds.
          </li>
        </ol>

        <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">
          4.3 Consequences (The "Kill Switch")
        </h3>
        <p className="mb-2">
          Bambeh reserves the right to take the following actions{" "}
          <strong>without prior notice</strong>
          and <strong>without liability</strong>:
        </p>
        <ul className="space-y-2 list-disc list-inside ml-4">
          <li>
            <strong>Freeze Funds:</strong> Temporarily or permanently hold
            wallet balances pending investigation.
          </li>
          <li>
            <strong>Immediate Termination:</strong> Delete the User account.
          </li>
          <li>
            <strong>Forfeiture:</strong> Confiscate Zerm Coins and pending
            Referral Bonuses if fraud is suspected.
          </li>
          <li>
            <strong>Legal Action:</strong> Report the User to the Agence
            Nationale des Technologies de l'Information et de la Communication
            (ANTIC) in  or relevant international Interpol divisions.
          </li>
        </ul>
      </section>

      {/* 5. Marketplace Disclaimers */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          5. MARKETPLACE AND GIG DISCLAIMERS
        </h2>

        <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">
          5.1 Status as Intermediary
        </h3>
        <p className="mb-2">
          Bambeh is a venue. We are not a party to any contract between Buyers
          and Sellers, or Landlords and Tenants.
        </p>
        <ul className="space-y-2 list-disc list-inside ml-4">
          <li>
            <strong>No Endorsement:</strong> We do not vet the quality of goods,
            the safety of housing, or the veracity of job postings.
          </li>
          <li>
            <strong>Release:</strong> You release Bambeh from any claims,
            demands, or damages arising out of disputes with other Users.
          </li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">
          5.2 Employment Status
        </h3>
        <p>
          Users posting or accepting jobs via Bambeh are independent
          contractors. Nothing in this Agreement creates an employment,
          partnership, or agency relationship between the User and Bambeh.
        </p>
      </section>

      {/* 6. Data Collection */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          6. DATA COLLECTION AND USE RIGHTS
        </h2>
        <p className="mb-2">
          By using the App, you grant Bambeh the right to collect and process:
        </p>
        <ul className="space-y-2 list-disc list-inside ml-4">
          <li>
            <strong>Biometric/ID Data:</strong> For verification purposes.
          </li>
          <li>
            <strong>Device Data:</strong> To prevent fraud and ban specific
            devices.
          </li>
          <li>
            <strong>Chat Logs:</strong> We reserve the right to monitor in-app
            messages to prevent fraud and harassment.
          </li>
          <li>
            <strong>Transaction Metadata:</strong> To improve our algorithms and
            for commercial analysis (Data Aggregation).
          </li>
        </ul>
      </section>

      {/* 7. Intellectual Property */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          7. INTELLECTUAL PROPERTY (IP)
        </h2>
        <ul className="space-y-2 list-disc list-inside ml-4">
          <li>
            <strong>Our IP:</strong> All code, design, logos, and algorithms
            belong to Bambeh. You may not copy, reverse engineer, or modify
            them.
          </li>
          <li>
            <strong>Your IP:</strong> You retain ownership of content you post
            (e.g., photos of goods), but you grant Bambeh a{" "}
            <strong>
              perpetual, worldwide, royalty-free, irrevocable license
            </strong>
            to use, display, and modify that content for marketing and
            operational purposes.
          </li>
        </ul>
      </section>

      {/* 8. Limitation of Liability */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          8. LIMITATION OF LIABILITY AND INDEMNIFICATION (THE SHIELD)
        </h2>

        <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">
          8.1 "As Is" and "As Available"
        </h3>
        <p className="mb-2">
          The App is provided without warranties of any kind. We do not
          guarantee that the App will be, safe, secure, or error-free.
        </p>

        <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">
          8.2 Limitation of Liability
        </h3>
        <p className="mb-2 font-bold">
          TO THE FULLEST EXTENT PERMITTED BY LAW (INCLUDING OHADA UNIFORM ACTS):
        </p>
        <p className="mb-2">
          In no event shall Bambeh, the Founder, its affiliates, or employees be
          liable for:
        </p>
        <ol className="space-y-2 list-decimal list-inside ml-4">
          <li>Indirect, incidental, punitive, or consequential damages.</li>
          <li>Loss of profits, data, or business opportunities.</li>
          <li>
            Failures of third-party payment systems (MTN, Orange, Stripe,
            Banks).
          </li>
          <li>
            <strong>Hacking or Cyber-theft:</strong> We are not liable for funds
            lost due to your device being compromised.
          </li>
        </ol>
        <p className="mt-2">
          <strong>Cap on Liability:</strong> In any event, our total liability
          to you for all claims shall not exceed the amount you have paid to
          Bambeh in the last three (3) months or 10,000 XAF (whichever is
          lower).
        </p>

        <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">
          8.3 Indemnification
        </h3>
        <p className="mb-2">
          You agree to indemnify, defend, and hold harmless Bambeh and the
          Founder from any claims, legal fees, or damages arising from:
        </p>
        <ol className="space-y-2 list-decimal list-inside ml-4">
          <li>Your breach of these Terms.</li>
          <li>Your violation of any law or the rights of a third party.</li>
          <li>Any content you post on the App.</li>
        </ol>
      </section>

      {/* 9. Modifications */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          9. FUTURE MODIFICATIONS AND TERMINATION
        </h2>
        <ul className="space-y-2 list-disc list-inside ml-4">
          <li>
            <strong>Right to Change:</strong> Bambeh may modify these Terms at
            any time. We may add fees, change the "Referral" structure, or
            remove features. Your continued use constitutes acceptance.
          </li>
          <li>
            <strong>Right to Terminate:</strong> We may terminate this Agreement
            at any time, for any reason. Upon termination, your right to use the
            App ceases immediately.
          </li>
        </ul>
      </section>

      {/* 10. Governing Law */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          10. GOVERNING LAW AND DISPUTE RESOLUTION
        </h2>
        <ul className="space-y-2 list-disc list-inside ml-4">
          <li>
            <strong>Jurisdiction:</strong> These Terms are governed by the laws
            of the
            <strong> Republic of </strong>.
          </li>
          <li>
            <strong>Arbitration:</strong> Any dispute shall be settled by
            binding arbitration in Yaound?, , in accordance with the
            OHADA Uniform Act on Arbitration.
          </li>
          <li>
            <strong>Class Action Waiver:</strong> You agree to resolve disputes
            only on an individual basis and strictly waive any right to
            participate in a class action lawsuit against Bambeh.
          </li>
        </ul>
      </section>

      {/* Contact Information */}
      <section className="bg-teal-50 p-4 rounded-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          Contact Information
        </h2>
        <p>
          <strong>Legal Department:</strong> Bambehtheapp@gmail.com
        </p>
        <p>
          <strong>Address:</strong> Yaound?, 
        </p>
      </section>

      {/* Final Acknowledgment */}
      <section className="bg-red-50 border-l-4 border-red-500 p-4">
        <p className="font-bold text-center">
          BY CLICKING "I ACCEPT," YOU ACKNOWLEDGE THAT YOU HAVE READ THIS
          AGREEMENT, UNDERSTAND IT, AND AGREE TO BE BOUND BY ITS TERMS AND
          CONDITIONS.
        </p>
      </section>
    </div>
  );

}
export default TermsContent;





