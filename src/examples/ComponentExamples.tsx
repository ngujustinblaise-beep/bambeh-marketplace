// @ts-nocheck
import React, { Suspense } from "react";
import VerificationBadge from "../components/VerificationBadge";

const ChatWidget = React.lazy(() => import("../components/chat/MovableChatWidget"));

const ComponentExamples: React.FC = () => (
  <div className="p-6 max-w-2xl mx-auto space-y-8">
    <section>
      <h2 className="text-lg font-semibold mb-3">Verification Badge</h2>
      <VerificationBadge userId="example_user_id" showLabel />
    </section>

    <section>
      <h2 className="text-lg font-semibold mb-3">Chat Widget</h2>
      <Suspense fallback={<span className="text-sm text-gray-400">Loading…</span>}>
        <ChatWidget />
      </Suspense>
    </section>
  </div>
);

export default ComponentExamples;






