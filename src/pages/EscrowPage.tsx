/**
 * src/pages/EscrowPage.tsx
 * Bambeh Marketplace — Escrow Page
 *
 * Added:
 *  • Transaction process flow (5 steps visualised)
 *  • "I Received My Item" big green button → confirm + star rating
 *  • "I Have a Problem" big red button → report form with visible ticks
 *  • "How Bambeh Protects You" tab
 *  • "Meet in Person" safety guide
 *  • Large visible ✓ ticks on all radio options
 */

import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// ─── Transaction process steps ─────────────────────────────────────────────
const PROCESS_STEPS = [
  { icon: "🤝", title: "Agree on Terms",       desc: "Buyer and seller agree on item, price, and delivery. Both start an Escrow request on Bambeh." },
  { icon: "💳", title: "Buyer Pays Bambeh",    desc: "Buyer pays via MTN MoMo or Orange Money. Funds are held securely by Bambeh — the seller gets nothing yet." },
  { icon: "📦", title: "Seller Delivers",      desc: "Seller confirms payment is secured and delivers the item to the buyer." },
  { icon: "✅", title: "Buyer Confirms",       desc: "Buyer taps \"I Received My Item\" to confirm the goods arrived in good condition." },
  { icon: "💰", title: "Seller Gets Paid",     desc: "Bambeh releases the funds to the seller within 24 hours. Both parties can rate each other." },
];

// ─── Demo transaction ───────────────────────────────────────────────────────
const DEMO_TX = {
  ref:       "ESC-2026-00847",
  item:      "Samsung Galaxy S24 — 256GB",
  seller:    "Marie Tchamda",
  buyer:     "Paul Ngassa",
  amount:    280_000,
  fee:       8_400,
  total:     288_400,
  currency:  "XAF",
  payMethod: "MTN Mobile Money",
  status:    "payment_confirmed",
  createdAt: "2026-05-26",
};

type TabKey = "transaction" | "protect" | "meet";

// ─── Step indicator strip ───────────────────────────────────────────────────
function StepStrip({ currentIdx }: { currentIdx: number }) {
  const labels = ["Pending", "Paid", "In-Transit", "Delivered", "Complete"];
  return (
    <div className="flex items-center gap-1 py-2 overflow-x-auto scrollbar-hide">
      {labels.map((lbl, i) => (
        <React.Fragment key={lbl}>
          <div className="flex flex-col items-center flex-shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                             ${i <= currentIdx ? "bg-teal-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-400"}`}>
              {i <= currentIdx
                ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                : i + 1
              }
            </div>
            <span className={`text-[10px] mt-1 whitespace-nowrap font-medium
                              ${i <= currentIdx ? "text-teal-600 dark:text-teal-400" : "text-gray-400"}`}>
              {lbl}
            </span>
          </div>
          {i < labels.length - 1 && (
            <div className={`flex-1 h-0.5 min-w-[12px] ${i < currentIdx ? "bg-teal-500" : "bg-gray-200 dark:bg-gray-700"}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Big action button ──────────────────────────────────────────────────────
function BigBtn({ icon, label, desc, cls, onClick }: {
  icon: string; label: string; desc: string; cls: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-left
                  transition-all active:scale-[0.98] shadow-sm ${cls}`}>
      <span className="text-4xl flex-shrink-0">{icon}</span>
      <div>
        <p className="font-bold text-base">{label}</p>
        <p className="text-sm opacity-80 mt-0.5">{desc}</p>
      </div>
    </button>
  );
}

// ─── Check list item ────────────────────────────────────────────────────────
function Li({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
      <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center">
        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </span>
      {text}
    </li>
  );
}

// ─── Main ───────────────────────────────────────────────────────────────────
export default function EscrowPage() {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId?: string }>();

  const [tab, setTab]               = useState<TabKey>("transaction");
  const [showReceipt, setReceipt]   = useState(false);
  const [showProblem, setProblem]   = useState(false);
  const [confirmed, setConfirmed]   = useState(false);
  const [rating, setRating]         = useState(0);
  const [hoverStar, setHoverStar]   = useState(0);
  const [probType, setProbType]     = useState("");
  const [probText, setProbText]     = useState("");

  const TABS: { key: TabKey; label: string }[] = [
    { key: "transaction", label: "My Transaction" },
    { key: "protect",     label: "🛡 Protection" },
    { key: "meet",        label: "🤝 Meet Safely" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">

      {/* Header */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-800 px-4 pt-5 pb-7">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
            ←
          </button>
          <h1 className="text-white font-bold text-xl flex-1">Bambeh Escrow</h1>
          <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">🔒 Secure</span>
        </div>
        <p className="text-teal-100 text-sm">Your money is protected until you confirm receipt.</p>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap px-2
                        ${tab === t.key ? "border-teal-500 text-teal-600 dark:text-teal-400" :
                          "border-transparent text-gray-500 dark:text-gray-400"}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-4 py-5 space-y-5">

        {/* ══════ TRANSACTION TAB ══════ */}
        {tab === "transaction" && (
          <>
            {/* Active transaction card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-teal-50 dark:bg-teal-900/20 px-5 py-3 border-b border-teal-200
                              dark:border-teal-700 flex items-center justify-between">
                <span className="text-xs font-bold text-teal-700 dark:text-teal-300 uppercase tracking-wide">
                  Active Transaction
                </span>
                <span className="text-xs font-mono text-teal-600">{DEMO_TX.ref}</span>
              </div>
              <div className="p-5">
                {/* Status strip */}
                <StepStrip currentIdx={2} />

                {/* Details */}
                <div className="mt-4 space-y-2">
                  {[
                    ["Item", DEMO_TX.item],
                    ["Seller", DEMO_TX.seller],
                    ["Paid via", DEMO_TX.payMethod],
                  ].map(([l, v]) => (
                    <div key={l} className="flex justify-between text-sm">
                      <span className="text-gray-500">{l}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{v}</span>
                    </div>
                  ))}

                  <div className="border-t border-gray-100 dark:border-gray-700 pt-2 mt-2 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Item Amount</span>
                      <span className="text-gray-900 dark:text-white">{DEMO_TX.amount.toLocaleString()} {DEMO_TX.currency}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Escrow Fee (3%)</span>
                      <span className="text-gray-900 dark:text-white">{DEMO_TX.fee.toLocaleString()} {DEMO_TX.currency}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base">
                      <span className="text-gray-900 dark:text-white">Total Paid</span>
                      <span className="text-teal-600">{DEMO_TX.total.toLocaleString()} {DEMO_TX.currency}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 flex gap-2">
                  <span className="text-xl flex-shrink-0">📦</span>
                  <div>
                    <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">Awaiting delivery</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                      Your payment is safely held. Confirm once you receive the item.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── THE TWO KEY ACTION BUTTONS ── */}
            {!confirmed ? (
              <BigBtn icon="✅" label="I Received My Item"
                desc="Tap to confirm receipt and release payment to seller"
                cls="border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-800 dark:text-teal-200"
                onClick={() => setReceipt(true)} />
            ) : (
              <div className="bg-teal-100 dark:bg-teal-900/30 rounded-2xl p-5 text-center">
                <p className="text-4xl mb-2">🎉</p>
                <p className="font-bold text-teal-800 dark:text-teal-200">Receipt Confirmed!</p>
                <p className="text-sm text-teal-600 mt-1">Payment released to {DEMO_TX.seller}.</p>
              </div>
            )}

            <BigBtn icon="⚠️" label="I Have a Problem"
              desc="Item not received, damaged, or doesn't match? Report here"
              cls="border-red-400 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200"
              onClick={() => setProblem(true)} />

            {/* Process flow */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-base text-gray-900 dark:text-white mb-4">How Escrow Works</h2>
              <div className="space-y-4">
                {PROCESS_STEPS.map((s, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-900/20
                                      flex items-center justify-center text-xl flex-shrink-0">
                        {s.icon}
                      </div>
                      {i < PROCESS_STEPS.length - 1 && (
                        <div className="w-0.5 flex-1 bg-teal-100 dark:bg-teal-900 mt-1 min-h-[20px]" />
                      )}
                    </div>
                    <div className="pb-4 flex-1">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">{s.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* New escrow CTA */}
            <button
              onClick={() => alert("Start new escrow — connect this to your backend")}
              className="w-full py-4 bg-gradient-to-r from-teal-500 to-teal-700 text-white font-bold
                         text-base rounded-2xl shadow-lg shadow-teal-500/30 active:scale-[0.98]">
              🔒 Start New Escrow Transaction
            </button>
          </>
        )}

        {/* ══════ PROTECTION TAB ══════ */}
        {tab === "protect" && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl p-5 text-white">
              <p className="text-4xl mb-3">🛡️</p>
              <h2 className="font-bold text-xl mb-2">How Bambeh Protects You</h2>
              <p className="text-teal-100 text-sm leading-relaxed">
                Bambeh holds your payment safely until you confirm receipt. The seller only gets paid when you are satisfied.
              </p>
            </div>

            {[
              { icon: "💳", title: "Your Money is Safe", points: [
                "Payment held by Bambeh — not the seller",
                "Funds released ONLY after you confirm receipt",
                "Full refund if item is never delivered",
                "7-day window to raise a dispute after delivery",
              ]},
              { icon: "🔍", title: "Seller Verification", points: [
                "Sellers verified with valid National ID",
                "Phone number confirmed via SMS OTP",
                "All listings reviewed before publishing",
                "Verified sellers get a blue ✓ badge",
              ]},
              { icon: "⚡", title: "Fast Dispute Resolution", points: [
                "Disputes resolved within 48 hours",
                "Bambeh team reviews evidence from both sides",
                "Video/photo evidence can be submitted",
                "Fair mediation by our trained team",
              ]},
              { icon: "💰", title: "Transparent Fees", points: [
                "Only 3% fee on successful transactions",
                "No hidden charges or surprise costs",
                "Fee is charged to the buyer only",
                "Free if transaction is cancelled before delivery",
              ]},
            ].map((s) => (
              <div key={s.title} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{s.icon}</span>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white">{s.title}</h3>
                </div>
                <ul className="space-y-2">
                  {s.points.map((p) => <Li key={p} text={p} />)}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* ══════ MEET SAFELY TAB ══════ */}
        {tab === "meet" && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-5 text-white">
              <p className="text-4xl mb-3">🤝</p>
              <h2 className="font-bold text-xl mb-2">Meet in Person Safely</h2>
              <p className="text-blue-100 text-sm leading-relaxed">
                When meeting a buyer or seller face-to-face, follow these guidelines.
              </p>
            </div>

            {[
              { icon: "📍", color: "bg-green-50 dark:bg-green-900/20", tc: "text-green-700 dark:text-green-300",
                title: "Choose a Safe Location", tips: [
                  "Meet in a busy public place — market, bank lobby, or supermarket",
                  "Bank ATM lobbies are ideal: they have security cameras",
                  "Police station forecourts are the safest choice",
                  "Avoid private homes, quiet streets, or unfamiliar areas",
                ]},
              { icon: "👥", color: "bg-blue-50 dark:bg-blue-900/20", tc: "text-blue-700 dark:text-blue-300",
                title: "Bring Someone You Trust", tips: [
                  "Never go alone to high-value transactions",
                  "Tell a friend or family member where you are going",
                  "Share the meeting details before you leave home",
                  "Keep your phone charged and accessible at all times",
                ]},
              { icon: "⏰", color: "bg-amber-50 dark:bg-amber-900/20", tc: "text-amber-700 dark:text-amber-300",
                title: "Meet During Daylight Hours", tips: [
                  "Arrange meetings between 8am and 6pm",
                  "Avoid late evenings and night-time meetings",
                  "Communicate promptly if you are running late",
                  "Cancel and reschedule if something feels wrong",
                ]},
              { icon: "🔎", color: "bg-purple-50 dark:bg-purple-900/20", tc: "text-purple-700 dark:text-purple-300",
                title: "Inspect Before You Pay", tips: [
                  "Test electronics before handing over any money",
                  "Verify serial numbers match photos in the listing",
                  "Ask for original accessories, receipts, and box",
                  "Use Bambeh Escrow to protect every payment",
                ]},
              { icon: "🚫", color: "bg-red-50 dark:bg-red-900/20", tc: "text-red-700 dark:text-red-300",
                title: "Red Flags — Walk Away If…", tips: [
                  "Seller refuses to meet in a public place",
                  "Price is dramatically lower than market value",
                  "Pressure to pay before you have seen the item",
                  "Refuses to use Bambeh Escrow for protection",
                ]},
            ].map((s) => (
              <div key={s.title} className={`${s.color} rounded-2xl p-5`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{s.icon}</span>
                  <h3 className={`font-bold text-base ${s.tc}`}>{s.title}</h3>
                </div>
                <ul className="space-y-1.5">
                  {s.tips.map((t) => (
                    <li key={t} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="text-gray-400 mt-0.5">•</span>{t}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Emergency contacts */}
            <div className="bg-red-600 rounded-2xl p-5 text-white">
              <h3 className="font-bold text-base mb-3">🆘 Emergency Numbers</h3>
              <div className="space-y-2">
                {[
                  ["Police",         "117"],
                  ["Fire Brigade",   "118"],
                  ["National Police","+237 222 23 40 40"],
                  ["Bambeh Support", "+237 600 000 000"],
                ].map(([label, num]) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-red-100 text-sm">{label}</span>
                    <a href={`tel:${num}`} className="font-bold text-sm text-white">{num}</a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══════ CONFIRM RECEIPT MODAL ══════ */}
      {showReceipt && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-t-3xl p-6 pb-10 space-y-5">
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto" />
            <div className="text-center">
              <p className="text-5xl mb-3">✅</p>
              <h3 className="font-bold text-xl text-gray-900 dark:text-white">Confirm Receipt</h3>
              <p className="text-sm text-gray-500 mt-1">
                This releases payment to {DEMO_TX.seller}. <strong>Cannot be undone.</strong>
              </p>
            </div>

            {/* Star rating */}
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Rate {DEMO_TX.seller}
              </p>
              <div className="flex justify-center gap-2">
                {[1,2,3,4,5].map((s) => (
                  <button key={s}
                    onMouseEnter={() => setHoverStar(s)}
                    onMouseLeave={() => setHoverStar(0)}
                    onClick={() => setRating(s)}
                    className={`text-3xl transition-all ${s <= (hoverStar || rating) ? "text-amber-400 scale-110" : "text-gray-300"}`}>
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setReceipt(false)}
                className="flex-1 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl
                           font-semibold text-gray-600 dark:text-gray-400">
                Cancel
              </button>
              <button onClick={() => { setConfirmed(true); setReceipt(false); }}
                className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-teal-700 text-white
                           font-bold rounded-xl shadow-lg shadow-teal-500/30">
                ✅ Yes, I Received It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════ PROBLEM REPORT MODAL ══════ */}
      {showProblem && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-t-3xl p-6 pb-10 space-y-4
                          max-h-[90vh] overflow-y-auto">
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto" />
            <div className="text-center">
              <p className="text-5xl mb-3">⚠️</p>
              <h3 className="font-bold text-xl text-gray-900 dark:text-white">Report a Problem</h3>
              <p className="text-sm text-gray-500 mt-1">
                Our team will investigate and respond within 48 hours.
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">What is the problem?</p>
              <div className="space-y-2">
                {[
                  "Item was not delivered",
                  "Item is damaged or broken",
                  "Item does not match the description",
                  "Received a counterfeit or fake item",
                  "Seller is unresponsive",
                  "Other issue",
                ].map((p) => (
                  <button key={p} onClick={() => setProbType(p)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left text-sm
                                font-medium transition-all
                                ${probType === p
                                  ? "border-red-400 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                                  : "border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300"}`}>
                    {/* Big visible radio tick */}
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
                                     ${probType === p ? "border-red-500 bg-red-500" : "border-gray-300 dark:border-gray-500"}`}>
                      {probType === p && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor" strokeWidth={3.5}><polyline points="20 6 9 17 4 12"/></svg>
                      )}
                    </div>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Additional details
              </label>
              <textarea rows={3}
                className="w-full border-2 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3
                           text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           focus:border-red-400 outline-none resize-none"
                placeholder="Describe the problem in detail..."
                value={probText}
                onChange={(e) => setProbText(e.target.value)} />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setProblem(false)}
                className="flex-1 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl
                           font-semibold text-gray-600 dark:text-gray-400">
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!probType) return;
                  alert("Problem reported! Our team will contact you within 48 hours.");
                  setProblem(false);
                }}
                disabled={!probType}
                className={`flex-1 py-3 font-bold rounded-xl transition-all
                            ${probType
                              ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"}`}>
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
