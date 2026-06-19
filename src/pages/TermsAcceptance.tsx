/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * TERMS ACCEPTANCE â€” BAMBEH MARKETPLACE
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 *
 * LEGAL COMPLIANCE:
 * âœ… OHADA e-consent checkbox â€” ian data protection law
 *    (Law No. 2024/017 of 23 December 2024, Sections 13-16)
 * âœ… Standard Terms & Conditions acceptance checkbox
 * âœ… Scroll-to-bottom enforcement before acceptance is enabled
 * âœ… Explicit opt-in (not pre-checked) â€” required by Law 2024/017
 * âœ… Timestamps stored on acceptance
 * âœ… Returning users correctly bypass re-acceptance
 *
 * FILE: src/pages/TermsAcceptance.tsx
 * Â© 2026 BAMBEH SARL â€” RC/YAO/2020/A/1026
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  AlertTriangle,
  FileText,
  ArrowRight,
  ScrollText,
  Check,
  Shield,
} from "lucide-react";

export default function TermsAcceptance() {
  const navigate = useNavigate();
  const [hasRead, setHasRead] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false);

  // â”€â”€ OHADA / Law No. 2024/017 consent â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // ian personal data protection law (enacted 23 December 2024)
  // requires explicit, informed, opt-in consent BEFORE any data is collected.
  // This checkbox is separate from the Terms checkbox â€” it specifically covers
  // personal data processing. It must NOT be pre-checked (Law 2024/017 Â§13â€“16).
  const [ohadaConsented, setOhadaConsented] = useState(false);

  useEffect(() => {
    const termsAccepted = localStorage.getItem("Bambeh_terms_accepted");
    if (termsAccepted === "true") {
      setIsReturningUser(true);
      setHasRead(true);
      setHasScrolledToBottom(true);
      setIsAccepted(true);
      setOhadaConsented(true); // returning users already gave consent
    }
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const reachedBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 50;
    if (reachedBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
      setHasRead(true);
    }
  };

  const handleAccept = () => {
    if (!hasRead) {
      alert("Please read the entire Terms and Conditions before accepting.");
      return;
    }
    if (!isAccepted) {
      alert("Please check the acceptance box to continue.");
      return;
    }
    if (!ohadaConsented) {
      alert(
        "Please confirm your consent to data processing under ian law (Law No. 2024/017) to continue."
      );
      return;
    }

    localStorage.setItem("Bambeh_terms_accepted", "true");
    localStorage.setItem("Bambeh_terms_accepted_date", new Date().toISOString());
    // Store OHADA consent timestamp separately for audit purposes
    localStorage.setItem("Bambeh_ohada_consent_date", new Date().toISOString());

    navigate("/language", { replace: true });
  };

  const handleDecline = () => {
    if (
      confirm(
        "You must accept the Terms and Conditions to use Bambeh. Are you sure you want to decline?"
      )
    ) {
      localStorage.clear();
      alert("You have declined the Terms and Conditions. The app will now close.");
      window.close();
    }
  };

  const canAccept = hasRead && isAccepted && ohadaConsented;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto py-8">

        {/* â”€â”€ Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-600 to-teal-700 rounded-full mb-4 shadow-xl">
            <span className="text-4xl font-bold text-white">B</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to <span className="text-teal-600">Bambeh</span>
          </h1>
          <p className="text-lg text-gray-600 mb-1">Online Marketplace</p>
          <div className="flex items-center justify-center gap-2 text-teal-600">
            <FileText className="w-5 h-5" />
            <p className="text-sm font-medium">
              Please read and accept our Terms and Conditions
            </p>
          </div>
        </div>

        {/* â”€â”€ Terms Container â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* Scroll indicator banners */}
          {!hasScrolledToBottom && (
            <div className="bg-amber-50 border-b border-amber-200 px-6 py-3">
              <div className="flex items-center gap-2 text-amber-800">
                <ScrollText className="w-5 h-5" />
                <p className="text-sm font-medium">
                  Please scroll down and read the entire document
                </p>
              </div>
            </div>
          )}
          {hasScrolledToBottom && (
            <div className="bg-green-50 border-b border-green-200 px-6 py-3">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <p className="text-sm font-medium">
                  âœ… Thank you for reading! You may now accept the terms below.
                </p>
              </div>
            </div>
          )}

          {/* â”€â”€ Scrollable Terms Content â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div
            onScroll={handleScroll}
            className="h-96 overflow-y-auto px-8 py-6 prose prose-sm max-w-none"
            style={{ scrollBehavior: "smooth" }}
          >
            <div className="text-gray-700">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-teal-700">
                  BAMBEH TERMS AND CONDITIONS
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Effective Date: January 1, 2026
                </p>
              </div>

              <p className="mb-4 font-semibold">
                Welcome to Bambeh ("the App"), a marketplace platform operated
                by BAMBEH SARL (RC/YAO/2020/A/1026), connecting buyers and
                sellers digitally across  and beyond.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mt-6">
                1. DEFINITIONS AND INTERPRETATION
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>"BAMBEH SARL"</strong> refers to the legal entity operating Bambeh, registered in YaoundÃ©,  (RC/YAO/2020/A/1026).</li>
                <li><strong>"User"</strong> means any individual who creates an account and uses the App for buying, selling, or browsing.</li>
                <li><strong>"Vendor"</strong> means a User who offers goods or services for sale on the platform.</li>
                <li><strong>"Zerm Coins"</strong> are a proprietary in-app virtual currency with no real-world cash value outside the platform.</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mt-6">
                2. ACCOUNT REGISTRATION
              </h3>
              <h4 className="text-lg font-semibold text-gray-800 mt-4">2.1 Eligibility</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>You must be at least 18 years old to use Bambeh.</li>
                <li>By registering, you affirm that all information provided is accurate and complete.</li>
              </ul>
              <h4 className="text-lg font-semibold text-gray-800 mt-4">2.2 Account Security</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>You are responsible for maintaining the confidentiality of your credentials.</li>
                <li>Notify us immediately of any unauthorized access at security@bambeh.cm.</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mt-6">
                3. MARKETPLACE RULES
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>All listings must be accurate and lawful under ian law.</li>
                <li>No counterfeit, stolen, or prohibited items are permitted.</li>
                <li>Bambeh reserves the right to remove listings at its discretion.</li>
                <li>A 1% transaction fee applies to all completed sales â€” the lowest in .</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mt-6">4. ZERM COINS</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Zerm Coins have no monetary value outside the platform.</li>
                <li>They cannot be exchanged for cash.</li>
                <li>BAMBEH SARL reserves the right to modify Zerm Coin policies with 30 days' notice.</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mt-6">5. DATA PROTECTION</h3>
              <p>
                The collection and processing of your personal data is governed by
                's Law No. 2024/017 of 23 December 2024 on Personal Data Protection.
                You have the right to access, rectify, and request deletion of your data at
                any time by contacting legal@bambeh.cm. Full details are in our{" "}
                <strong>Privacy Policy</strong> available at bambeh.cm/privacy-policy.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mt-6">
                6. LIMITATION OF LIABILITY
              </h3>
              <p>
                Bambeh is not liable for any indirect, incidental, or consequential
                damages arising from your use of the platform.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mt-6">
                7. DISPUTE RESOLUTION
              </h3>
              <p>
                All disputes shall be resolved through binding arbitration in
                YaoundÃ©, , under the laws of the Republic of  and
                applicable OHADA Uniform Acts.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mt-6">
                8. INTELLECTUAL PROPERTY
              </h3>
              <p>
                All content, trademarks, and technology are owned by BAMBEH SARL.
                You may not copy, modify, or distribute any part without written permission.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mt-6">9. MODIFICATIONS</h3>
              <p>
                Bambeh may modify these Terms at any time. Continued use constitutes
                acceptance. Material changes will be notified via in-app notice.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mt-6">10. GOVERNING LAW</h3>
              <p>
                These Terms are governed by the laws of the Republic of ,
                including applicable OHADA Uniform Acts.
              </p>

              <div className="bg-teal-50 border-l-4 border-teal-600 p-6 mt-8">
                <h3 className="font-bold text-teal-900 mb-2">âœ… ACKNOWLEDGMENT</h3>
                <p className="text-sm">
                  By checking the boxes below and clicking "Accept and Continue," you acknowledge:
                </p>
                <ul className="list-disc pl-6 mt-2 text-sm space-y-1">
                  <li>You have read and understood these Terms and Conditions</li>
                  <li>You agree to be bound by all provisions herein</li>
                  <li>You are at least 18 years of age</li>
                  <li>You have the legal capacity to enter into this agreement</li>
                  <li>You consent to data processing as described under Law No. 2024/017</li>
                </ul>
              </div>

              <p className="text-center text-sm text-gray-600 mt-8 pb-8">
                <strong>Last Updated:</strong> January 1, 2026
                <br />
                <strong>Contact:</strong> legal@bambeh.cm
                <br />Â© 2026 BAMBEH SARL â€” RC/YAO/2020/A/1026
              </p>
            </div>
          </div>

          {/* â”€â”€ Acceptance Section â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className="border-t-4 border-teal-500 bg-gradient-to-b from-gray-50 to-gray-100 px-8 py-8">

            {/* Warning if not scrolled */}
            {!hasRead && (
              <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-300 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-900">
                      Please read the entire document
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      Scroll down to the bottom to enable the acceptance checkboxes
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* â”€â”€ Checkbox 1: General Terms â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <div
              onClick={() => hasRead && setIsAccepted(!isAccepted)}
              className={`
                cursor-pointer rounded-2xl border-4 p-6 mb-4 transition-all duration-300 transform
                ${!hasRead ? "opacity-50 cursor-not-allowed bg-gray-100 border-gray-300" : ""}
                ${hasRead && !isAccepted ? "bg-white border-gray-300 hover:border-teal-400 hover:shadow-lg hover:scale-[1.01]" : ""}
                ${isAccepted ? "bg-teal-50 border-teal-500 shadow-xl scale-[1.01]" : ""}
              `}
            >
              <div className="flex items-start gap-5">
                <div
                  className={`
                    flex-shrink-0 w-14 h-14 rounded-xl border-4 flex items-center justify-center transition-all duration-300
                    ${!hasRead ? "border-gray-300 bg-gray-200" : ""}
                    ${hasRead && !isAccepted ? "border-gray-400 bg-white hover:border-teal-500" : ""}
                    ${isAccepted ? "border-teal-600 bg-teal-600" : ""}
                  `}
                  style={{ minWidth: "56px", minHeight: "56px" }}
                >
                  {isAccepted ? (
                    <Check className="w-10 h-10 text-white" strokeWidth={4} />
                  ) : (
                    <div className="w-8 h-8 border-2 border-dashed border-gray-400 rounded-lg" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-base font-semibold ${hasRead ? "text-gray-900" : "text-gray-500"}`}>
                    I have read, understood, and agree to be bound by the Bambeh
                    Terms and Conditions.
                  </p>
                  <p className={`text-sm mt-2 ${hasRead ? "text-gray-600" : "text-gray-400"}`}>
                    I acknowledge that I am at least 18 years of age and have
                    the legal capacity to enter into this agreement.
                  </p>
                  {isAccepted && (
                    <div className="mt-3 flex items-center gap-2 text-teal-600 font-bold">
                      <CheckCircle className="w-5 h-5" />
                      <span>Terms Accepted âœ“</span>
                    </div>
                  )}
                  {hasRead && !isAccepted && (
                    <div className="mt-3 flex items-center gap-2 text-gray-500 text-sm">
                      <span className="animate-bounce">ðŸ‘†</span>
                      <span>Click here to accept Terms and Conditions</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* â”€â”€ Checkbox 2: OHADA / Law No. 2024/017 Data Consent â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
                MANDATORY under 's Personal Data Protection Act
                (Law No. 2024/017, 23 December 2024, Sections 13-16).
                â€” Must be explicit and opt-in (never pre-checked)
                â€” Must clearly state what data is processed and why
                â€” Must state the user's right to withdraw consent
                â€” Stored with its own timestamp for legal audit trail
            â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            {hasRead && (
              <label
                className={`flex items-start gap-4 cursor-pointer rounded-2xl border-4 p-5 mb-6 transition-all duration-300
                  ${ohadaConsented
                    ? "bg-blue-50 border-blue-500 shadow-md"
                    : "bg-white border-gray-300 hover:border-blue-400 hover:shadow-md"
                  }`}
              >
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-lg border-4 flex items-center justify-center transition-all duration-300 mt-0.5
                    ${ohadaConsented
                      ? "border-blue-600 bg-blue-600"
                      : "border-gray-400 bg-white hover:border-blue-500"
                    }`}
                  style={{ minWidth: "48px", minHeight: "48px" }}
                >
                  <input
                    type="checkbox"
                    checked={ohadaConsented}
                    onChange={(e) => setOhadaConsented(e.target.checked)}
                    className="sr-only"
                    aria-label="OHADA data protection consent â€” Law No. 2024/017"
                  />
                  {ohadaConsented ? (
                    <Check className="w-7 h-7 text-white" strokeWidth={4} />
                  ) : (
                    <div className="w-6 h-6 border-2 border-dashed border-gray-400 rounded" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <p className="text-sm font-bold text-gray-900">
                      Data Protection Consent â€” Law No. 2024/017 ()
                    </p>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    I consent to BAMBEH SARL collecting and processing my personal
                    data (name, email, phone number, location, device identifiers) solely
                    to operate my Bambeh account, process transactions, and improve the
                    platform â€” in accordance with{" "}
                    <strong>'s Law No. 2024/017 of 23 December 2024</strong>{" "}
                    on Personal Data Protection and applicable OHADA Uniform Acts.
                  </p>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                    Your data is never sold to third parties. You may withdraw this
                    consent and request deletion of your data at any time by emailing{" "}
                    <strong>legal@bambeh.cm</strong>. See our full{" "}
                    <strong>Privacy Policy</strong> at bambeh.cm/privacy-policy.
                  </p>
                  {ohadaConsented && (
                    <div className="mt-3 flex items-center gap-2 text-blue-600 font-semibold text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>Data processing consent confirmed âœ“</span>
                    </div>
                  )}
                  {!ohadaConsented && (
                    <div className="mt-2 flex items-center gap-2 text-gray-500 text-xs">
                      <span className="animate-bounce">ðŸ‘†</span>
                      <span>Required â€” click to give data processing consent</span>
                    </div>
                  )}
                </div>
              </label>
            )}

            {/* â”€â”€ Progress indicator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            {hasRead && (
              <div className="flex items-center gap-3 mb-6 px-2">
                <div className={`flex items-center gap-1.5 text-xs font-medium ${hasRead ? "text-teal-600" : "text-gray-400"}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs ${hasRead ? "bg-teal-500" : "bg-gray-300"}`}>1</div>
                  Read
                </div>
                <div className="flex-1 h-0.5 bg-gray-200 rounded">
                  <div className={`h-full rounded transition-all duration-500 bg-teal-500 ${isAccepted ? "w-full" : "w-0"}`} />
                </div>
                <div className={`flex items-center gap-1.5 text-xs font-medium ${isAccepted ? "text-teal-600" : "text-gray-400"}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs ${isAccepted ? "bg-teal-500" : "bg-gray-300"}`}>2</div>
                  Terms
                </div>
                <div className="flex-1 h-0.5 bg-gray-200 rounded">
                  <div className={`h-full rounded transition-all duration-500 bg-blue-500 ${ohadaConsented ? "w-full" : "w-0"}`} />
                </div>
                <div className={`flex items-center gap-1.5 text-xs font-medium ${ohadaConsented ? "text-blue-600" : "text-gray-400"}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs ${ohadaConsented ? "bg-blue-500" : "bg-gray-300"}`}>3</div>
                  Data
                </div>
              </div>
            )}

            {/* â”€â”€ Action Buttons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <div className="flex gap-4">
              <button
                onClick={handleDecline}
                className="flex-1 px-6 py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
              >
                {isReturningUser ? "Close" : "Decline"}
              </button>
              <button
                onClick={handleAccept}
                disabled={!canAccept}
                className={`flex-1 px-6 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                  canAccept
                    ? "bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-xl hover:shadow-2xl hover:scale-105"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <span>{isReturningUser ? "Close" : "Accept and Continue"}</span>
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>

            {/* Compliance note */}
            <p className="text-center text-xs text-gray-400 mt-4">
              Compliant with  Law No. 2024/017 Â· OHADA Uniform Acts Â·
              Google Play Developer Policy
            </p>
          </div>
        </div>

        {/* â”€â”€ Footer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            ðŸŽ‰{" "}
            <span className="font-bold text-green-600">Only 1% Transaction Fee</span>{" "}
            â€” Lowest in ! ðŸ’š
          </p>
          <p className="text-xs text-gray-500 mt-2">Next: Choose Your Language</p>
        </div>
      </div>
    </div>
  );
}

