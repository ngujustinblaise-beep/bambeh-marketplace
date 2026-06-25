/**
 * TERMS AND CONDITIONS
 * FILE LOCATION: src/pages/TermsAndConditions.tsx
 */

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, CheckCircle2, Building2, Mail, BadgeInfo } from "lucide-react";
import { useLang } from "@/hooks/useAppLang";

interface TermsAndConditionsProps { onAccepted: () => void; }

const COMPANY = {
  legalName: "BAMBEH SARL",
  registreDeCommerce: "CM -NSI-02-2026-B13-00179",
  niu: "M022618405804C",
  duns: "850379853",
  emails: ["support@bambeh.com", "bambetheapp@gmail.com"],
};

const TermsAndConditions = ({ onAccepted }: TermsAndConditionsProps) => {
  const lang = useLang();
  const isRtl = lang === "ar";
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const bottom = Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) < 50;
    if (bottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
      setHasReadTerms(true);
    }
  };

  const handleAccept = () => {
    if (agreedToTerms && hasReadTerms) {
      localStorage.setItem('Bambeh_terms_accepted', 'true');
      localStorage.setItem('Bambeh_terms_accepted_date', new Date().toISOString());
      onAccepted();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center p-4" dir={isRtl ? "rtl" : "ltr"}>
      <Card className="w-full max-w-4xl shadow-2xl">
        <CardHeader className="text-center space-y-2 bg-indigo-50 border-b">
          <div className="flex justify-center mb-2">
            <div className="bg-indigo-600 p-3 rounded-full">
              <FileText className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-indigo-900">Bambeh Terms of Use: User Agreement</CardTitle>
          <p className="text-sm text-gray-600">Effective Date: November 21, 2025</p>
          <p className="text-sm font-semibold text-indigo-700">Please read carefully and scroll to the bottom to continue</p>
        </CardHeader>

        <CardContent className="p-0">
          <ScrollArea className="h-[60vh] px-6 py-4" onScrollCapture={handleScroll} ref={scrollRef}>
            <div className="prose prose-sm max-w-none space-y-4">
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3 text-indigo-900 font-semibold">
                  <Building2 className="h-4 w-4" />
                  <span>Business Identity</span>
                </div>
                <p className="text-sm leading-relaxed"><strong>Legal business name:</strong> {COMPANY.legalName}</p>
                <p className="text-sm leading-relaxed"><strong>Registre de commerce:</strong> {COMPANY.registreDeCommerce}</p>
                <p className="text-sm leading-relaxed"><strong>NIU:</strong> {COMPANY.niu}</p>
                <p className="text-sm leading-relaxed"><strong>D-U-N-S No:</strong> {COMPANY.duns}</p>
              </div>

              <p className="text-base leading-relaxed">
                Welcome to the Bambeh mobile application ("App") and Services. Bambeh connects users for buying, selling, job and housing searches in a dynamic marketplace and community. By accessing or using the App, you agree to these Terms, a <strong>binding legal agreement.</strong>
              </p>

              <div className="border-t pt-4 mt-6">
                <h2 className="text-xl font-bold text-indigo-900 mb-3">I. Agreement and Your Role</h2>
                <h3 className="text-lg font-semibold text-indigo-800 mb-2">A. Acceptance and Governing Law</h3>
                <p>These Terms shall be governed by the laws applicable to the Republic of Cameroon, including the mandatory provisions of OHADA Uniform Acts and Law No. 2010/012 (Cybersecurity), where applicable.</p>
                <p>Bambeh reserves the right to modify these Terms at any time, with modifications becoming effective upon posting. Continued use constitutes acceptance of the revised Terms.</p>
                <h3 className="text-lg font-semibold text-indigo-800 mb-2 mt-4">B. Eligibility and Account Security</h3>
                <p>You must be 18 or older to use the Services.</p>
                <p>You are responsible for maintaining the security of your account credentials and for all activity under your account.</p>
              </div>

              <div className="border-t pt-4 mt-6">
                <h2 className="text-xl font-bold text-indigo-900 mb-3">II. Pricing and Payment Provisions</h2>
                <h3 className="text-lg font-semibold text-indigo-800 mb-2">A. Subscription Tiers</h3>
                <div className="bg-indigo-50 p-4 rounded-lg my-3">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-indigo-200">
                        <th className="text-left py-2 px-2">Tier</th>
                        <th className="text-left py-2 px-2">Price (XAF)</th>
                        <th className="text-left py-2 px-2">Billing Cycle</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-indigo-100">
                        <td className="py-2 px-2"><strong>Basic (Bronze)</strong></td>
                        <td className="py-2 px-2">100 XAF</td>
                        <td className="py-2 px-2">Daily</td>
                      </tr>
                      <tr className="border-b border-indigo-100">
                        <td className="py-2 px-2"><strong>Premium (Silver)</strong></td>
                        <td className="py-2 px-2">500 XAF</td>
                        <td className="py-2 px-2">Weekly</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2"><strong>Gold</strong></td>
                        <td className="py-2 px-2">1,500 XAF</td>
                        <td className="py-2 px-2">Monthly</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <h3 className="text-lg font-semibold text-indigo-800 mb-2 mt-4">B. Payment Processing and Wallet Services</h3>
                <p>Payments processed via MTN Mobile Money, Orange Money, or other authorized gateways are subject to the payment provider’s processing rules and applicable law.</p>
                <p>The App includes a digital wallet ("Wallet") for holding in-app funds, represented by Zerm Coins (1 Zerm = 100 XAF). Wallet balances are only usable within the Bambeh platform unless otherwise stated.</p>
                <h3 className="text-lg font-semibold text-indigo-800 mb-2 mt-4">C. Refund Policy</h3>
                <p>Refund requests must be submitted within 7 calendar days via the approved support emails listed in this document.</p>
              </div>

              <div className="border-t pt-4 mt-6">
                <h2 className="text-xl font-bold text-indigo-900 mb-3">III. User Responsibilities</h2>
                <p>Use the App only lawfully and consistent with its intended marketplace functions. Prohibited actions include fraud, financial crime, money laundering, cybercrime, data scraping, impersonation, and harassment.</p>
                <p>By uploading any content, you grant Bambeh a license to use that content in connection with the Services, subject to applicable law.</p>
              </div>

              <div className="border-t pt-4 mt-6">
                <h2 className="text-xl font-bold text-indigo-900 mb-3">IV. Intellectual Property</h2>
                <p>Bambeh IP is protected by law, the OAPI Bangui Agreement, and international copyright principles. Unauthorized use, copying, or reverse engineering is prohibited.</p>
              </div>

              <div className="border-t pt-4 mt-6">
                <h2 className="text-xl font-bold text-indigo-900 mb-3">V. Protection of User Data and Security</h2>
                <p>Bambeh processes personal data in compliance with applicable law and may cooperate with lawful requests from authorities where required.</p>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 my-3">
                  <strong>Security Notice:</strong> Bambeh uses reasonable security measures, but no online service can guarantee absolute security.
                </div>
              </div>

              <div className="border-t pt-4 mt-6">
                <h2 className="text-xl font-bold text-indigo-900 mb-3">VI. Disclaimers and Liability Limitations</h2>
                <p>The Services are provided on an "AS IS" and "AS AVAILABLE" basis, without warranties to the extent permitted by law.</p>
              </div>

              <div className="border-t pt-4 mt-6">
                <h2 className="text-xl font-bold text-indigo-900 mb-3">VII. Termination and Dispute Resolution</h2>
                <p>Bambeh may suspend or terminate accounts for material breaches.</p>
                <p>Disputes are governed by applicable Cameroonian law and resolved in the competent courts of Yaoundé, where permitted.</p>
              </div>

              <div className="border-t pt-4 mt-6">
                <h2 className="text-xl font-bold text-indigo-900 mb-3">Contact and Support</h2>
                <p><strong>Approved emails:</strong></p>
                <p>{COMPANY.emails[0]}</p>
                <p>{COMPANY.emails[1]}</p>
              </div>

              <div className="border-t-2 pt-6 mt-6 bg-indigo-50 p-6 rounded-lg">
                <h2 className="text-xl font-bold text-indigo-900 mb-3 text-center">📋 End of Terms and Conditions</h2>
                <p className="text-center text-gray-700">You have reached the end of the document. Please indicate your acceptance below.</p>
              </div>
            </div>
          </ScrollArea>

          <div className="border-t bg-gray-50 p-6 space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                disabled={!hasReadTerms}
                className="mt-1"
              />
              <Label htmlFor="terms" className={`text-sm leading-relaxed ${!hasReadTerms ? 'text-gray-400' : 'text-gray-900 cursor-pointer'}`}>
                I have read, understood, and agree to these Terms.
              </Label>
            </div>

            {!hasReadTerms && (
              <div className="flex items-center space-x-2 text-amber-700 bg-amber-50 p-3 rounded-lg">
                <FileText className="h-5 w-5" />
                <p className="text-sm">Please scroll to the bottom to enable acceptance</p>
              </div>
            )}
            {hasReadTerms && !agreedToTerms && (
              <div className="flex items-center space-x-2 text-indigo-700 bg-indigo-50 p-3 rounded-lg">
                <CheckCircle2 className="h-5 w-5" />
                <p className="text-sm">Please check the box above to accept the terms</p>
              </div>
            )}

            <Button
              onClick={handleAccept}
              disabled={!agreedToTerms || !hasReadTerms}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white py-6 text-lg font-semibold"
              size="lg"
              type="button"
            >
              {agreedToTerms && hasReadTerms ? 'Accept and Continue' : 'Read and Accept Terms to Continue'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TermsAndConditions;

