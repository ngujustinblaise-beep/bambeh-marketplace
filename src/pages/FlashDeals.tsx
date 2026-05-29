/**
 * src/pages/FlashDeals.tsx
 * Bambeh Marketplace — Flash Deals page
 *
 * Features:
 * • Notify Me banner at top
 * • Deal cards with countdown timer, Add to Cart, WhatsApp Chat
 * • CamPay Mobile Money payment modal
 * • Become a Vendor CTA at bottom
 */

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

// ─── Types ─────────────────────────────────────────────────────────────────
interface Deal {
  id: string;
  title: string;
  description: string;
  image: string;
  originalPrice: number;
  dealPrice: number;
  currency: string;
  vendor: string;
  vendorPhone: string;
  stockTotal: number;
  stockLeft: number;
  endsAt: Date;
  category: string;
}

// ─── Demo deals ────────────────────────────────────────────────────────────
const DEMO_DEALS: Deal[] = [
  {
    id: "1",
    title: "iPhone 15 Pro — Open Box 128GB",
    description: "Barely used, Space Grey. Original accessories included. Battery 98%. No scratches.",
    image: "📱",
    originalPrice: 750000,
    dealPrice: 480000,
    currency: "XAF",
    vendor: "TechZone Cameroon",
    vendorPhone: "+237670000001",
    stockTotal: 3,
    stockLeft: 2,
    endsAt: new Date(Date.now() + 12 * 3600 * 1000),
    category: "Electronics",
  },
  {
    id: "2",
    title: "Samsung 65\" 4K Smart TV",
    description: "Brand new sealed box. 2-year Cameroon warranty. HDMI x3, WiFi, Bluetooth.",
    image: "📺",
    originalPrice: 450000,
    dealPrice: 280000,
    currency: "XAF",
    vendor: "ElectroCam Douala",
    vendorPhone: "+237680000002",
    stockTotal: 5,
    stockLeft: 4,
    endsAt: new Date(Date.now() + 24 * 3600 * 1000),
    category: "Electronics",
  },
  {
    id: "3",
    title: "Nike Air Max 270 — Size 42",
    description: "100% original imported from France. Comes with box and receipt.",
    image: "👟",
    originalPrice: 95000,
    dealPrice: 55000,
    currency: "XAF",
    vendor: "SneakerHub CM",
    vendorPhone: "+237690000003",
    stockTotal: 8,
    stockLeft: 3,
    endsAt: new Date(Date.now() + 6 * 3600 * 1000),
    category: "Fashion",
  },
  {
    id: "4",
    title: "HP Laptop 15\" — i5 12th Gen",
    description: "New, 16GB RAM, 512GB SSD, Windows 11 Pro. Full warranty from HP Cameroon.",
    image: "💻",
    originalPrice: 380000,
    dealPrice: 250000,
    currency: "XAF",
    vendor: "ComputerWorld Douala",
    vendorPhone: "+237670000004",
    stockTotal: 4,
    stockLeft: 2,
    endsAt: new Date(Date.now() + 48 * 3600 * 1000),
    category: "Electronics",
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────
function fmtXAF(n: number) {
  return n.toLocaleString("fr-CM") + " XAF";
}

function discount(orig: number, deal: number) {
  return Math.round((1 - deal / orig) * 100);
}

function useCountdown(target: Date) {
  const [remaining, setRemaining] = useState(Math.max(0, target.getTime() - Date.now()));
  useEffect(() => {
    const timer = setInterval(() => setRemaining(Math.max(0, target.getTime() - Date.now())), 1000);
    return () => clearInterval(timer);
  }, [target]);
  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const s = Math.floor((remaining % 60000) / 1000);
  return { h, m, s, expired: remaining === 0 };
}

// ─── Countdown display ──────────────────────────────────────────────────────
function Countdown({ endsAt }: { endsAt: Date }) {
  const { h, m, s, expired } = useCountdown(endsAt);
  if (expired) return <span className="text-red-500 font-bold text-xs">Expired</span>;
  return (
    <div className="flex items-center gap-1">
      {[
        { v: h, l: "h" }, { v: m, l: "m" }, { v: s, l: "s" },
      ].map(({ v, l }) => (
        <div key={l} className="flex items-center gap-0.5">
          <span className="bg-gray-900 text-white text-xs font-bold px-1.5 py-0.5 rounded-md min-w-[24px] text-center">
            {String(v).padStart(2, "0")}
          </span>
          <span className="text-gray-400 text-[10px]">{l}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Payment Modal ──────────────────────────────────────────────────────────
function PaymentModal({ deal, onClose }: { deal: Deal; onClose: () => void }) {
  const [phone, setPhone] = useState("");
  const [method, setMethod] = useState<"mtn" | "orange">("mtn");
  const [step, setStep] = useState<"form" | "processing" | "done">("form");
  const [error, setError] = useState("");

  async function pay() {
    if (!phone.trim() || phone.replace(/\D/g, "").length < 9) {
      setError("Enter a valid Cameroon phone number"); return;
    }
    setError(""); setStep("processing");
    // Simulate payment — replace with real CamPay call
    await new Promise(r => setTimeout(r, 2000));
    setStep("done");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="font-bold text-base text-gray-900 dark:text-white">Pay with Mobile Money</h2>
            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[220px]">{deal.title}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500">✕</button>
        </div>

        <div className="p-5">
          {step === "form" && (
            <>
              {/* Amount */}
              <div className="bg-teal-50 dark:bg-teal-900/20 rounded-2xl p-4 mb-4 text-center">
                <p className="text-xs text-teal-600 mb-1">You pay</p>
                <p className="text-2xl font-bold text-teal-700 dark:text-teal-300">{fmtXAF(deal.dealPrice)}</p>
                <p className="text-xs text-gray-400 line-through mt-0.5">{fmtXAF(deal.originalPrice)}</p>
              </div>

              {/* Payment method */}
              <div className="flex gap-3 mb-4">
                {([["mtn", "MTN MoMo 🟡"], ["orange", "Orange Money 🟠"]] as const).map(([k, label]) => (
                  <button key={k} onClick={() => setMethod(k)}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all
                                ${method === k ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700" :
                                  "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400"}`}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Phone */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  {method === "mtn" ? "MTN" : "Orange"} Number
                </label>
                <div className="flex">
                  <span className="border-2 border-r-0 border-gray-200 dark:border-gray-600 rounded-l-xl px-3 py-3 text-sm bg-gray-50 dark:bg-gray-700 text-gray-600">🇨🇲 +237</span>
                  <input type="tel"
                    className={`flex-1 border-2 rounded-r-xl px-4 py-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none
                                ${error ? "border-red-400" : "border-gray-200 dark:border-gray-600 focus:border-teal-500"}`}
                    placeholder="6XX XXX XXX"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))} />
                </div>
                {error && <p className="text-xs text-red-500 mt-1">⚠ {error}</p>}
              </div>

              <button onClick={pay}
                className="w-full py-4 bg-gradient-to-r from-teal-500 to-teal-700 text-white font-bold rounded-2xl shadow-lg shadow-teal-500/30 text-base">
                💳 Pay {fmtXAF(deal.dealPrice)}
              </button>
            </>
          )}

          {step === "processing" && (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="font-semibold text-gray-900 dark:text-white">Processing payment...</p>
              <p className="text-sm text-gray-500 mt-1">Check your phone for the payment prompt</p>
            </div>
          )}

          {step === "done" && (
            <div className="text-center py-6">
              <p className="text-6xl mb-3">🎉</p>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Payment Successful!</h3>
              <p className="text-sm text-gray-500 mb-1">You bought: <strong>{deal.title}</strong></p>
              <p className="text-sm text-gray-500 mb-6">The vendor will contact you shortly.</p>
              <button onClick={onClose}
                className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold">
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Deal Card ──────────────────────────────────────────────────────────────
function DealCard({ deal }: { deal: Deal }) {
  const [notified, setNotified] = useState(false);
  const [inCart, setInCart] = useState(false);
  const [showPay, setShowPay] = useState(false);
  const pct = discount(deal.originalPrice, deal.dealPrice);
  const urgency = deal.stockLeft <= 2;

  function whatsapp() {
    const msg = encodeURIComponent(
      `Hi! I saw your flash deal on Bambeh: "${deal.title}" for ${fmtXAF(deal.dealPrice)}. Is it still available?`
    );
    window.open(`https://wa.me/${deal.vendorPhone.replace(/\D/g, "")}?text=${msg}`, "_blank");
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Image / emoji area */}
        <div className="relative bg-gradient-to-br from-teal-50 to-gray-50 dark:from-gray-700 dark:to-gray-800 h-36 flex items-center justify-center">
          <span className="text-7xl">{deal.image}</span>
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            -{pct}%
          </div>
          {urgency && (
            <div className="absolute top-3 right-3 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
              🔥 {deal.stockLeft} left
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-snug mb-1">{deal.title}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3 line-clamp-2">{deal.description}</p>

          {/* Price row */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg font-bold text-teal-600 dark:text-teal-400">{fmtXAF(deal.dealPrice)}</span>
            <span className="text-xs text-gray-400 line-through">{fmtXAF(deal.originalPrice)}</span>
          </div>

          {/* Countdown */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] text-gray-400 mb-1">Ends in:</p>
              <Countdown endsAt={deal.endsAt} />
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400">Stock</p>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-20 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full transition-all"
                       style={{ width: `${(deal.stockLeft / deal.stockTotal) * 100}%` }} />
                </div>
                <span className="text-[10px] text-gray-500">{deal.stockLeft}/{deal.stockTotal}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mb-2">
            <button onClick={() => setShowPay(true)}
              className="flex-1 py-2.5 bg-gradient-to-r from-teal-500 to-teal-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-teal-500/20 active:scale-[0.98]">
              🛒 Buy Now
            </button>
            <button onClick={whatsapp}
              className="flex-1 py-2.5 bg-green-600 text-white text-xs font-bold rounded-xl active:scale-[0.98]">
              💬 WhatsApp
            </button>
          </div>

          <button
            onClick={() => setInCart(v => !v)}
            className={`w-full py-2 rounded-xl text-xs font-semibold border-2 transition-all active:scale-[0.98]
                        ${inCart ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300" :
                          "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400"}`}>
            {inCart ? "✓ Added to Cart" : "＋ Add to Cart"}
          </button>

          <p className="text-[10px] text-gray-400 text-center mt-2">by {deal.vendor}</p>
        </div>
      </div>

      {showPay && <PaymentModal deal={deal} onClose={() => setShowPay(false)} />}
    </>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function FlashDeals() {
  const navigate = useNavigate();
  const [notifyAll, setNotifyAll] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(DEMO_DEALS.map(d => d.category)))];
  const filtered = activeCategory === "All" ? DEMO_DEALS : DEMO_DEALS.filter(d => d.category === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">

      {/* Hero */}
      <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 px-4 pt-5 pb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-white font-bold text-2xl">⚡ Flash Deals</h1>
            <p className="text-orange-100 text-sm mt-0.5">Limited time · Limited stock</p>
          </div>
          <Link to="/cart"
            className="bg-white/20 text-white text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1">
            🛒 Cart
          </Link>
        </div>

        {/* Notify Me Banner */}
        <div className={`mt-4 rounded-2xl p-4 flex items-center justify-between transition-all
                         ${notifyAll ? "bg-white/20" : "bg-white/10 border border-white/30"}`}>
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">🔔 Notify me of new deals</p>
            <p className="text-orange-100 text-xs mt-0.5">Be the first to know when new flash deals drop</p>
          </div>
          <button
            onClick={() => setNotifyAll(v => !v)}
            className={`ml-3 flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95
                        ${notifyAll ? "bg-white text-orange-600" : "bg-orange-600 text-white border border-white/50"}`}>
            {notifyAll ? "✓ On" : "Notify Me"}
          </button>
        </div>
      </div>

      {/* Category filter */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2.5">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map(c => (
            <button key={c} onClick={() => setActiveCategory(c)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all
                          ${activeCategory === c ? "bg-orange-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex gap-4 px-4 py-3 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
        <span>⚡ <strong className="text-gray-900 dark:text-white">{filtered.length}</strong> active deals</span>
        <span>🔥 Up to <strong className="text-red-500">36% off</strong> today</span>
      </div>

      {/* Deal cards */}
      <div className="px-4 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map(deal => <DealCard key={deal.id} deal={deal} />)}
      </div>

      {/* Become a Vendor CTA */}
      <div className="mx-4 mb-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-5 text-white">
        <p className="text-2xl mb-2">🏪</p>
        <h2 className="font-bold text-lg mb-1">Become a Flash Deal Vendor</h2>
        <p className="text-gray-300 text-sm leading-relaxed mb-4">
          Reach thousands of buyers instantly. List your products as flash deals and boost sales today.
        </p>
        <div className="space-y-2 mb-4">
          {["Free to list for verified vendors", "Reach 10,000+ active buyers", "Payments via MTN & Orange Money", "24-hour deal support"].map(b => (
            <div key={b} className="flex items-center gap-2 text-sm">
              <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              {b}
            </div>
          ))}
        </div>
        <button
          onClick={() => navigate("/vendor/register")}
          className="w-full py-3 bg-teal-600 text-white font-bold rounded-xl active:scale-[0.98] transition-transform">
          Register as a Vendor →
        </button>
      </div>
    </div>
  );
}
