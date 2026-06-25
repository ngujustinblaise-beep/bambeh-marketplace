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
import { FileText, CheckCircle2 } from "lucide-react";
import { useLang, t } from "@/hooks/useAppLang";

interface TermsAndConditionsProps { onAccepted: () => void; }

const TermsAndConditions = ({ onAccepted }: TermsAndConditionsProps) => {
  const [hasReadTerms, setHasReadTerms]         = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [agreedToTerms, setAgreedToTerms]       = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const bottom  = Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) < 50;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl shadow-2xl">
        <CardHeader className="text-center space-y-2 bg-indigo-50 border-b">
          <div className="flex justify-center mb-2">
            <div className="bg-indigo-600 p-3 rounded-full"><FileText className="h-8 w-8 text-white" /></div>
          </div>
          <CardTitle className="text-2xl font-bold text-indigo-900">Bambeh Terms of Use: User Agreement</CardTitle>
          <p className="text-sm text-gray-600">Effective Date: November 21, 2025</p>
          <p className="text-sm font-semibold text-indigo-700">Please read carefully and scroll to the bottom to continue</p>
        </CardHeader>

        <CardContent className="p-0">
          <ScrollArea className="h-[60vh] px-6 py-4" onScrollCapture={handleScroll} ref={scrollRef}>
            <div className="prose prose-sm max-w-none space-y-4">
              <p className="text-base leading-relaxed">
                Welcome to the Bambeh mobile application ("App") and Services. Bambeh connects users for buying, selling, job and housing searches in a dynamic marketplace and community. By accessing or using the App, you agree to these Terms, a <strong>binding legal agreement.</strong>
              </p>

              <div className="border-t pt-4 mt-6">
                <h2 className="text-xl font-bold text-indigo-900 mb-3">I. Agreement and Your Role</h2>
                <h3 className="text-lg font-semibold text-indigo-800 mb-2">A. Acceptance and Governing Law</h3>
                <p>These Terms shall be <strong>solely and exclusively</strong> governed by the laws of the <strong>Republic of </strong>, including the <strong>mandatory</strong> provisions of the <strong>OHADA Uniform Acts</strong> and <strong>Law No. 2010/012</strong> (Cybersecurity).</p>
                <p>Bambeh reserves the <strong>absolute and unfettered</strong> right to modify these Terms at any time, with modifications becoming <strong>immediately effective</strong> upon posting. <strong>The User waives any right to personal notice</strong> of such changes, and continued use constitutes <strong>irrevocable acceptance</strong> of the revised Terms.</p>
                <h3 className="text-lg font-semibold text-indigo-800 mb-2 mt-4">B. Eligibility and Account Security</h3>
                <p>You must be <strong>18 or older</strong> to use the Services.</p>
                <p>You bear <strong>sole and absolute responsibility</strong> for maintaining the security of your account credentials. You are <strong>strictly liable</strong> for all activities, claims, losses, or damages arising under your account, <strong>whether authorized or unauthorized.</strong></p>
              </div>

              <div className="border-t pt-4 mt-6">
                <h2 className="text-xl font-bold text-indigo-900 mb-3">II. Pricing and Payment Provisions</h2>
                <h3 className="text-lg font-semibold text-indigo-800 mb-2">A. Subscription Tiers</h3>
                <div className="bg-indigo-50 p-4 rounded-lg my-3">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b-2 border-indigo-200"><th className="text-left py-2 px-2">Tier</th><th className="text-left py-2 px-2">Price (XAF)</th><th className="text-left py-2 px-2">Billing Cycle</th></tr></thead>
                    <tbody>
                      <tr className="border-b border-indigo-100"><td className="py-2 px-2"><strong>Basic (Bronze)</strong></td><td className="py-2 px-2">100 XAF</td><td className="py-2 px-2">Daily</td></tr>
                      <tr className="border-b border-indigo-100"><td className="py-2 px-2"><strong>Premium (Silver)</strong></td><td className="py-2 px-2">500 XAF</td><td className="py-2 px-2">Weekly</td></tr>
                      <tr><td className="py-2 px-2"><strong>Gold</strong></td><td className="py-2 px-2">1,500 XAF</td><td className="py-2 px-2">Monthly</td></tr>
                    </tbody>
                  </table>
                </div>
                <h3 className="text-lg font-semibold text-indigo-800 mb-2 mt-4">B. Payment Processing and Wallet Services</h3>
                <p>Payments processed via MTN Mobile Money, Orange Money, or other authorized gateways are <strong>final and non-refundable</strong>, except where expressly permitted by applicable mandatory law or Bambeh's sole discretion.</p>
                <p>The App includes a <strong>digital wallet ("Wallet")</strong> for holding in-app funds, represented by <strong>Zerm Coins (1 Zerm = 100 XAF)</strong>. Wallet balances are <strong>not redeemable for fiat currency</strong> and are <strong>only usable within the Bambeh platform.</strong></p>
                <h3 className="text-lg font-semibold text-indigo-800 mb-2 mt-4">C. Refund Policy</h3>
                <p>Subscriptions and Wallet credits are <strong>non-refundable</strong>, with extremely limited exceptions at Bambeh's sole discretion. Refund requests must be submitted within <strong>7 calendar days</strong> via Bambehtheapp@gmail.com.</p>
              </div>

              <div className="border-t pt-4 mt-6">
                <h2 className="text-xl font-bold text-indigo-900 mb-3">III. User Responsibilities</h2>
                <p>Use the App only lawfully and consistent with its intended marketplace functions. Prohibited actions include fraud, financial crime, money laundering, cybercrime, data scraping, impersonation, and harassment.</p>
                <p>By uploading any content, you grant Bambeh a <strong>perpetual, irrevocable, worldwide, royalty-free</strong> license to use, reproduce, modify, publish, and distribute that content <strong>in connection with the Services.</strong></p>
              </div>

              <div className="border-t pt-4 mt-6">
                <h2 className="text-xl font-bold text-indigo-900 mb-3">IV. Intellectual Property</h2>
                <p>Bambeh IP is protected by  law, OAPI Bangui Agreement, and international treaties. Unauthorized use, copying, or reverse engineering is <strong>strictly prohibited.</strong></p>
              </div>

              <div className="border-t pt-4 mt-6">
                <h2 className="text-xl font-bold text-indigo-900 mb-3">V. Protection of User Data and Security</h2>
                <p>Bambeh processes Personal Data in compliance with <strong>Law No. 2024/017</strong> and retains the right to cooperate with ian law enforcement, which may include the <strong>disclosure of User data without prior notice.</strong></p>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 my-3">
                  <strong>?? IMPORTANT SECURITY DISCLAIMER:</strong> Despite reasonable security measures, Bambeh <strong>does not warrant absolute security.</strong> Bambeh shall <strong>have no liability whatsoever</strong> for any damages arising from unauthorized access, malware, data theft, hacking, or cyberattacks.
                </div>
              </div>

              <div className="border-t pt-4 mt-6">
                <h2 className="text-xl font-bold text-indigo-900 mb-3">VI. Disclaimers and Liability Limitations</h2>
                <p>The Services are provided on an <strong>"AS IS" and "AS AVAILABLE" basis, without any warranties of any kind.</strong></p>
                <div className="bg-red-50 border-l-4 border-red-400 p-3 my-3">
                  <strong>?? INDEMNIFICATION CLAUSE:</strong> You agree to <strong>defend, indemnify, and hold harmless Bambeh</strong> from any and all claims, liabilities, costs, and expenses arising out of your use of the Services or violation of these Terms.
                </div>
              </div>

              <div className="border-t pt-4 mt-6">
                <h2 className="text-xl font-bold text-indigo-900 mb-3">VII. Termination and Dispute Resolution</h2>
                <p>Bambeh may suspend or terminate accounts for breaches <strong>immediately and without refund.</strong></p>
                <p>Disputes are governed by ian law and resolved in <strong>Yaoundé courts</strong>.</p>
              </div>

              <div className="border-t pt-4 mt-6">
                <h2 className="text-xl font-bold text-indigo-900 mb-3">Copyright and Contact</h2>
                <p>Bambeh's code, design, and content are protected by ian and international copyright laws.</p>
                <p className="font-semibold"><strong>Contact:</strong> Yaoundé,  | +237 670757326 | Bambehtheapp@gmail.com</p>
              </div>

              <div className="border-t-2 pt-6 mt-6 bg-indigo-50 p-6 rounded-lg">
                <h2 className="text-xl font-bold text-indigo-900 mb-3 text-center">?? End of Terms and Conditions</h2>
                <p className="text-center text-gray-700">You have reached the end of the document. Please indicate your acceptance below.</p>
              </div>
            </div>
          </ScrollArea>

          <div className="border-t bg-gray-50 p-6 space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox id="terms" checked={agreedToTerms} onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)} disabled={!hasReadTerms} className="mt-1" />
              <Label htmlFor="terms" className={`text-sm leading-relaxed ${!hasReadTerms ? 'text-gray-400' : 'text-gray-900 cursor-pointer'}`}>
                <strong>I have read, understood, and agree to these Terms,</strong> including the automatic fee deductions, the rules governing in-app digital assets, and that Bambeh is not responsible for any loss or liability arising from hacking or unauthorized access incidents, even if caused by negligence.
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

            <Button onClick={handleAccept} disabled={!agreedToTerms || !hasReadTerms}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white py-6 text-lg font-semibold" size="lg">
              {agreedToTerms && hasReadTerms ? 'Accept and Continue' : 'Read and Accept Terms to Continue'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TermsAndConditions;





